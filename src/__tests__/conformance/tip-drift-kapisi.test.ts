/**
 * INV-TIP-DRIFT-1'in DÜZENEĞİNİ korur (REC-121 — CI'ya bağlama adımı).
 *
 * NİÇİN VAR: kapı #1125 ile geldi ve **hiçbir iş onu çağırmıyordu**. Bu, kardeşi
 * INV-RLS-COVERAGE-1'in bire bir tekrarıydı — o kapı da #712 ile gelmiş, çağıran olmadığı
 * için yakaladığı kusur 2026-06-02'den 2026-08-20'ye kadar kimsenin görmediği bir boşluk
 * olarak yaşamıştı. **Elle koşulan kapı, koşulmadığı her gün YOKTUR.** Bu paket, bağın
 * kendisini korur: bağlamak bir commit, bağlı KALMAK bir koldur.
 *
 * Kapı canlı Supabase API'si ister; bu paket ağsız koşar. O yüzden burada ölçülen şey
 * kapının SONUCU değil, KOŞABİLİRLİĞİ ve DÜZENEĞİ.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim()
}
const KOK = repoKoku()
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8')

const BETIK = 'scripts/db/checks/tip-drift.mjs'
const WF = '.github/workflows/db-advisor.yml'

/**
 * Satır başı `#` yorumlarını atar — kardeş kilitte ödenmiş ders: bu workflow kararlarının
 * gerekçesini yorumda taşır ve o yorumlar aranan dizeleri kelimesi kelimesine içerir.
 * Yorumu saymak, gerçek adım silinse bile yeşil kalan bir kapı üretir.
 */
function yorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

describe('INV-TIP-DRIFT-1 · kapı CI’a BAĞLI ve doğru kimlikle koşuyor', () => {
  it('⭐CI GERÇEKTEN ÇAĞIRIYOR (yorumda değil, ADIMDA)', () => {
    const wf = yorumsuz(oku(WF))
    expect(
      wf,
      'db-advisor tip-drift betiğini çağırmıyor — kapı yine yalnız elle koşuluyor demektir',
    ).toContain('node scripts/db/checks/tip-drift.mjs')
    expect(wf, 'tip-drift işi yok').toMatch(/^ {2}tip-drift:/m)
    expect(wf, 'ön-yoklama işi yok').toMatch(/^ {2}tip-drift-precheck:/m)
  })

  it('⭐DOĞRU SIR: adım SUPABASE_ACCESS_TOKEN alır, SUPABASE_DB_URL ALMAZ', () => {
    /**
     * Bu kolun ölçtüğü şey bir KOPYALAMA HATASIdır. Kardeş kapılar hep aynı bloğu
     * (SUPABASE_DB_URL + PGSSLROOTCERT) taşıyor; bu iş o bloğu kopyalarsa kapı yanlış
     * kimlikle koşar ve `supabase gen types` oturum açamadığı için, DRIFT'le ilgisi
     * olmayan bir sebeple kırmızı döner — yani kapı, ölçtüğünü sandığı şeyi ölçmez.
     */
    const wf = yorumsuz(oku(WF))
    const isBlogu = wf.slice(wf.indexOf('  tip-drift:'))
    expect(isBlogu.length, 'tip-drift iş bloğu bulunamadı — ölçüm evreni boş').toBeGreaterThan(200)
    expect(isBlogu, 'adım SUPABASE_ACCESS_TOKEN almıyor').toContain('SUPABASE_ACCESS_TOKEN')
    expect(
      /SUPABASE_DB_URL/.test(isBlogu),
      'tip-drift işine SUPABASE_DB_URL kopyalanmış — bu betik DB’ye hiç bağlanmaz; ' +
        'alakasız bir sır, kapının koşabilirliğini alakasız bir koşula bağlar',
    ).toBe(false)
    expect(
      /PGSSLROOTCERT|pg@8/.test(isBlogu),
      'kök sertifika ya da pg sürücüsü kopyalanmış — bu kapı ikisini de kullanmaz; ' +
        'gereksiz kurulum, kapının kırmızısını kendi bağımlılığıyla kirletir',
    ).toBe(false)
  })

  it('ATLANMIŞ İŞ YEŞİL DEĞİLDİR: sır yoksa ön-yoklama bunu SÖYLER (sessiz atlama yok)', () => {
    const wf = yorumsuz(oku(WF))
    const on = wf.slice(wf.indexOf('  tip-drift-precheck:'), wf.indexOf('  tip-drift:'))
    expect(on, 'ön-yoklama bloğu bulunamadı').toContain('ready=false')
    expect(
      on,
      'sır yokken uyarı basılmıyor — fork PR’ında kapı sessizce atlanır ve yeşil sanılır',
    ).toMatch(/::warning[\s\S]{0,200}ATLANMIS IS YESIL DEGILDIR/)
  })

  it('⛔BETİK ÜRETİLMİŞ ARTEFAKTA YAZMAZ (AXIOM 3 — dosya URUN’un mülkü)', () => {
    const s = oku(BETIK)
    expect(
      /writeFileSync\(\s*TIP_DOSYASI|writeFileSync\(\s*VARSAYILAN_TIP_DOSYASI/.test(s),
      'betik tip dosyasına YAZIYOR — kapı ölçer, onarımı sahibi yapar',
    ).toBe(false)
    expect(s, 'onarım komutu çıktıda söylenmiyor; kırmızıyı gören ne yapacağını bilemez').toContain(
      'pnpm supabase:gen',
    )
  })

  /**
   * ⭐DAVRANIŞSAL VE AĞSIZ: `--tip-dosyasi` yol almadan verilirse betik daha ağa çıkmadan
   * çıkış 2 verir. Bu kol iki şeyi birden sabitler: (1) bayrak yaşıyor — CI kırmızısını
   * URUN’un artefaktına dokunmadan gösterebilmenin tek yolu odur, (2) "ölçemedim" ile
   * "temiz" ayrı çıkış kodlarıdır.
   */
  it('FAIL-CLOSED: --tip-dosyasi yolsuz verilirse ÇIKIŞ 2 (ölçemedim ≠ temiz)', () => {
    let kod = 0
    let cikti = ''
    try {
      cikti = execFileSync(process.execPath, [path.join(KOK, BETIK), '--tip-dosyasi'], {
        encoding: 'utf8',
        stdio: 'pipe',
      })
    } catch (e) {
      const err = e as { status?: number; stdout?: string; stderr?: string }
      kod = err.status ?? 1
      cikti = `${err.stdout ?? ''}${err.stderr ?? ''}`
    }
    expect(kod, 'yolsuz bayrak sessizce yutuldu — ölçemediğini geçmiş sayan kapı').toBe(2)
    expect(cikti).toMatch(/YOL YOK/)
  })

  it('ENVANTER SATIRI GÜNCEL: çağıran sütunu artık "CI’a bağlı DEĞİL" demiyor', () => {
    /**
     * Envanter, kapının kim tarafından çağrıldığını taşıyan tek yerdir; bağ kurulup satır
     * güncellenmezse envanter YANLIŞ bilgi yayar — ve yanlış envanter, envantersizlikten
     * kötüdür (okuyan ona güvenip ikinci kez bağlamaya kalkar ya da kapıyı yok sayar).
     */
    const dizin = path.join(KOK, 'docs', 'audits')
    const adlar = fs
      .readdirSync(dizin)
      .filter((a) => /^arac-envanteri-\d{4}-\d{2}-\d{2}\.md$/.test(a))
      .sort()
    expect(adlar.length, 'araç envanteri bulunamadı').toBeGreaterThan(0)
    const envanter = fs.readFileSync(path.join(dizin, adlar[adlar.length - 1]), 'utf8')
    const satir = envanter.split('\n').find((s) => s.includes('tip-drift.mjs')) ?? ''
    expect(satir, 'envanterde tip-drift satırı yok').toContain('tip-drift.mjs')
    expect(
      /CI'A BAGLI DEGIL|CI'a bağlı değil|ÇAĞIRAN YOK/i.test(satir),
      'envanter hâlâ "çağıran yok" diyor — bağ kuruldu ama kayıt bayat kaldı',
    ).toBe(false)
    expect(satir, 'envanter satırı çağıranı CI olarak yazmıyor').toMatch(/CI[^|]*db-advisor/)
  })
})
