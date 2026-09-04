/**
 * INV-ANON-YAZMA-1 düzeneği — nöbetçinin KOŞABİLİRLİĞİNİ korur (REC-138 yan bulgusu).
 *
 * Nöbetçinin kendisi DB'ye bağlanır ve bu konformans paketi DB'siz koşar; o yüzden
 * burada ölçülen şey nöbetçinin BULGUSU değil, DÜZENEĞİ: doğru işe bağlı mı, o iş
 * gerçekten kırmızı verebiliyor mu, fail-closed mı, ilan dosyası tutarlı mı.
 *
 * ⭐NİÇİN `advisor` İŞİNE KONMADI (ölçüldü 2026-09-04): `advisor` işi BİLEREK tavsiye
 * veriyor — `|| true` + `continue-on-error: true`. Nöbetçiyi oraya koymak "kapı var,
 * koşuyor, ama hiçbir şeyi durdurmuyor" sınıfı üretirdi; kapıyı ölçmeden yere koymanın
 * bedeli tam bu. Nöbetçi bu yüzden `rls-role-coverage` işinde: `set -Eeuo pipefail`,
 * fail-closed betikler, konusu da aynı (RLS kapsaması).
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

/** Satır başı `#` yorumlarını atar — gerekçe metni kodun yerine geçmesin. */
function yorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

/**
 * JS/TS yorumlarını satır bazlı atar.
 *
 * ⭐GEREKTİ ÇÜNKÜ KOL KENDİ YORUMUMU YAKALADI: nöbetçi betiğinin gerekçesinde
 * "db-advisor'ın `Skipping` deseni BİLEREK taklit edilmedi" yazıyor ve ham metin ölçümü
 * o dizeyi GERÇEK bir atlama yolu sandı. Gerekçe yazmak ile kod yazmak aynı evrende
 * ölçülmez — bugün bu sınıfın bedeli birkaç kez ödendi.
 */
function jsYorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*(\/\/|\/\*|\*)/.test(s))
    .join('\n')
}

/**
 * Bir workflow İŞ BLOĞUNU girintiye göre çıkarır.
 *
 * ⭐NİÇİN ELDE: depoda YAML ayrıştırıcı bağımlılığı YOK (ölçüldü: ne `yaml` ne
 * `js-yaml`). İlk hâlinde bloğu bir `split` regex'iyle ayırmaya çalıştım ve kol
 * "iş bulunamadı" diye düştü — regex, işi izleyen satırın boş olmasına bel bağlıyordu.
 * Girinti kuralı ise YAML'ın kendi sözleşmesi: iş adı iki boşlukla başlar, gövdesi
 * daha derin girintilidir. Ölçüm aracının kendisi de ölçülür.
 */
function isBlogu(ham: string, isAdi: string): string | null {
  const satirlar = ham.split('\n')
  const bas = satirlar.findIndex((s) => new RegExp(`^ {2}${isAdi}:\\s*$`).test(s))
  if (bas === -1) return null
  const govde: string[] = []
  for (let i = bas + 1; i < satirlar.length; i++) {
    const s = satirlar[i]
    if (s.trim() === '') {
      govde.push(s)
      continue
    }
    const girinti = s.length - s.trimStart().length
    if (girinti <= 2) break
    govde.push(s)
  }
  return govde.join('\n')
}

const WF = '.github/workflows/db-advisor.yml'
const BETIK = 'scripts/db/checks/anon-yazma-nobetcisi.mjs'
const SORGU = 'scripts/db/checks/anon-yazma-nobetcisi.sql'
const ILAN = 'docs/anon-yazma-politika-ilani.json'

interface Ilan {
  olcut: string
  sinir: string
  nicin_ilan_ve_mandal: string
  ilan_edilen_politikalar: {
    tablo: string
    politika: string
    cmd: string
    nicin_mesru: string
    dogrulandi: string
  }[]
}

describe('INV-ANON-YAZMA-1: nöbetçi GERÇEKTEN durdurabilen bir işte koşar', () => {
  it('nöbetçi rls-role-coverage işine bağlı, advisor işine DEĞİL', () => {
    const w = yorumsuz(oku(WF))
    expect(w.includes(BETIK), 'nöbetçi hiçbir adımda çağrılmıyor').toBe(true)

    const ham = oku(WF)
    const rlsBlok = isBlogu(ham, 'rls-role-coverage')
    const advisorBlok = isBlogu(ham, 'advisor')
    expect(rlsBlok, 'rls-role-coverage işi bulunamadı').toBeTruthy()
    expect((rlsBlok as string).includes(BETIK), 'nöbetçi rls-role-coverage işinde değil').toBe(true)
    expect(
      (advisorBlok ?? '').includes(BETIK),
      'nöbetçi advisor işine konmuş — o iş continue-on-error taşıyor, kırmızı vermez'
    ).toBe(false)
  })

  it('taşıyıcı iş DÜŞEBİLİR: continue-on-error YOK ve pipefail VAR', () => {
    const rlsBlok = yorumsuz(isBlogu(oku(WF), 'rls-role-coverage') as string)
    expect(
      /continue-on-error/.test(rlsBlok),
      'taşıyıcı işe continue-on-error girmiş — nöbetçi düşse bile kapı yeşil kalır'
    ).toBe(false)
    expect(/set -Eeuo pipefail/.test(rlsBlok), 'pipefail yok: betik düşse adım yeşil kalabilir').toBe(true)
  })

  it('FAIL-CLOSED: env yoksa nöbetçi çıkış kodu != 0 (DAVRANIŞ ölçümü)', () => {
    // ⭐Metin okumak "fail-closed yazılmış" der; yalnız koşum "çalışıyor" der.
    // Ölçüm BOŞ env ile yapılır ve DB'ye hiç bağlanılmaz.
    let kod = 0
    try {
      execFileSync(process.execPath, [path.join(KOK, BETIK)], {
        cwd: KOK,
        encoding: 'utf8',
        stdio: 'pipe',
        env: { ...process.env, SUPABASE_DB_URL: '' },
      })
    } catch (e) {
      kod = (e as { status?: number }).status ?? 1
    }
    expect(kod, 'SUPABASE_DB_URL boşken nöbetçi YEŞİL döndü — ölçmemek geçmek değildir').not.toBe(0)
  })

  it('nöbetçi db-advisor deseninin "Skipping" (fail-open) yolunu TAKLİT ETMEZ', () => {
    // ⭐jsYorumsuz: betiğin GEREKÇESİNDE "Skipping" dizesi geçiyor (o deseni niçin
    // taklit etmediğini anlatıyor) ve ham metin ölçümü onu gerçek bir atlama yolu sandı.
    const b = jsYorumsuz(oku(BETIK))
    expect(/Skipping/i.test(b), 'nöbetçi atlama yolu taşıyor — güvenlik kapısı sessizce atlanamaz').toBe(
      false
    )
    /**
     * ⭐İHLAL BLOĞUNA BAĞLI ÖLÇÜM — varlık ölçütü SABOTAJI GEÇİRDİ.
     *
     * İlk hâli `/process\.exit\(1\)/` idi. Betikte ÜÇ ayrı `exit(1)` var (env yok /
     * ihlal bulundu / betik çöktü); ihlal yolundakini sildiğimde kol YEŞİL kaldı çünkü
     * öteki ikisi "bir exit var" diyordu. Aynı sınıfı bugün ikinci kez ödedim
     * (INV-DUMAN-4'ün fail-closed ölçütü de böyleydi). Ölçüt artık BAĞLAMA bağlı:
     * ihlal dalının İÇİNDE çıkış olmalı.
     */
    /**
     * Ölçüt İHLAL BLOĞUNUN KENDİ METNİNE bağlı: `YAPILACAK:` yönlendirmesi yalnız o
     * dalda geçiyor, dolayısıyla ondan hemen sonra gelen çıkış o dalın çıkışıdır.
     * Geniş pencere (`ihlaller.length > 0` + 800 karakter) sabotajı GEÇİRMİŞTİ, çünkü
     * pencere komşu `catch` bloğundaki çıkışa uzanıyordu — ölçüt keskin görünüp yanlış
     * yeri görüyordu.
     */
    expect(
      /YAPILACAK:[\s\S]{0,300}process\.exit\(1\)/.test(b),
      'ihlal dalında exit 1 YOK — nöbetçi ihlali bulur ama koşum yeşil kalır'
    ).toBe(true)
  })
})

describe('INV-ANON-YAZMA-1: evren TÜRETİLİR, ilan GEREKÇELİ', () => {
  it('sorgu evreni SABİT TABLO LİSTESİ değil, GRANT\'ten türetir', () => {
    const s = oku(SORGU)
    expect(
      /role_table_grants/.test(s),
      'evren grant\'ten türetilmiyor — sabit tablo listesi bayatlar (aynı gün iki kez ödendi)'
    ).toBe(true)
    // Sabit vitrin listesi yazılmışsa yakala: bu sınıfın nüksü.
    expect(
      /in\s*\(\s*'products'/.test(s),
      'sorguya sabit tablo listesi girmiş — yeni vitrin tablosu kapsam dışı kalır'
    ).toBe(false)
  })

  it('sorgu SAYI değil DÖKÜM döndürür (agrega ters gideni gizler)', () => {
    const s = oku(SORGU)
    expect(/select\s+count\(\*\)\s*from/i.test(s), 'sorgu agrega sayı döndürüyor').toBe(false)
    expect(/policyname/.test(s) && /with_check/.test(s), 'döküm politika adını/koşulunu taşımıyor').toBe(
      true
    )
  })

  it('ilan dosyasındaki HER kalem gerekçeli ve ELLE DOĞRULANMIŞ', () => {
    const i = JSON.parse(oku(ILAN)) as Ilan
    expect(Array.isArray(i.ilan_edilen_politikalar)).toBe(true)
    for (const k of i.ilan_edilen_politikalar) {
      expect(k.nicin_mesru?.length ?? 0, `${k.tablo}.${k.politika} gerekçesiz ilan edilmiş`).toBeGreaterThan(
        40
      )
      expect(k.dogrulandi?.length ?? 0, `${k.tablo}.${k.politika} elle doğrulama kaydı yok`).toBeGreaterThan(
        10
      )
    }
    // Kapsam dışı bırakmak bedava değildir: sınır ve mandal gerekçesi YAZILI olmalı.
    expect(i.sinir?.length ?? 0, 'ilan dosyasında SINIR yazılı değil').toBeGreaterThan(80)
    expect(i.nicin_ilan_ve_mandal?.length ?? 0, 'ilan+mandal gerekçesi yazılı değil').toBeGreaterThan(80)
  })

  it('nöbetçi ilanı TÜKETİR ve iki yönlü çalışır (ölü kalem de bildirilir)', () => {
    // ⭐jsYorumsuz ZORUNLU: ilan dosyasının adı betiğin GEREKÇE bloğunda da geçiyor.
    // Ham metinle ölçtüğümde sabotaj (yolu olmayan bir dosyaya çevirmek) GEÇTİ — kol,
    // yorumdaki adı gerçek okuma sandı. Bugün bu sınıfın kaçıncı tekrarı olduğunu
    // sayıyorum diye yazıyorum: kapı yazarken yorum ile kod ayrı evrenlerdir.
    const b = jsYorumsuz(oku(BETIK))
    /**
     * ⭐ÖLÇÜT OKUMA EYLEMİNE BAĞLI, DOSYA ADININ GEÇMESİNE DEĞİL.
     *
     * `b.includes('anon-yazma-politika-ilani.json')` sabotajı GEÇİRDİ: ad, kullanıcıya
     * basılan "YAPILACAK" mesajının içinde de geçiyor ve o bir KOD satırı, yorum değil —
     * yani yorum temizliği bu kez yetmedi. Bir dosyanın adını mesajda yazmak, o dosyayı
     * OKUDUĞUNU kanıtlamaz. Ölçüt artık atama + gerçek okuma çağrısı.
     */
    expect(
      /ILAN_YOLU\s*=\s*path\.join\([^)]*anon-yazma-politika-ilani\.json'\)/.test(b),
      'ilan dosyasının yolu ILAN_YOLU olarak kurulmuyor'
    ).toBe(true)
    expect(
      /readFileSync\(ILAN_YOLU/.test(b),
      'nöbetçi ilan dosyasını GERÇEKTEN okumuyor (ad yalnız mesajda geçiyor olabilir)'
    ).toBe(true)
    expect(/olu|ölü/i.test(b), 'ilanda kalkmış kalem bildirilmiyor — ilan sessizce bayatlar').toBe(true)
  })
})
