// @vitest-environment node
//
// Kapı saf Node'dur ve DB'siz sınanır (fikstür kipi); DOM ortamı yalnız maliyettir.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-RLS-SARMA-1 kapısının KENDİ kapısı — `scripts/db/checks/rls-politika-sarma.mjs`.
 * Kayıt: REC-216.
 *
 * NİÇİN VAR: kapı canlı DB'ye bağlanır, yani CI dışında kimse onu rutin koşturmaz. Sınanmayan
 * kapı kanıt değil iddiadır. Bu dosya kapının KARAR MANTIĞINI şemaya hiç dokunmadan ölçer.
 *
 * ⛔KORUNAN ASIL ŞEY — ÖLÇÜT DÜZELTMESİ:
 * İlk ölçümümde ifadedeki `AS uid` GEÇİŞLERİNİ saymıştım. O sayı iç içelik DEĞİLDİR: bir
 * politikada iki AYRI doğru sarma varsa sayaç 2 gösterir, iç içelik yoktur. Ölçüldü —
 * `order_notes`, `order_attachments`, `venthub_returns` tam olarak böyle ve ÜÇÜ DE SAĞLIKLI.
 * Sayan ölçüt onlara kırmızı verirdi; kapı ilk gününde üç sahte bulguyla doğar, sonra
 * kapatılırdı. Aşağıdaki "SAĞLIKLI ÜÇLÜ" kolu tam olarak o gerilemeyi bekler: biri ölçütü
 * `sarma > 1`e geri çevirirse o kol kırmızı verir.
 */

const KOK = process.cwd()
const BETIK = path.join(KOK, 'scripts', 'db', 'checks', 'rls-politika-sarma.mjs')
const TABAN = path.join(KOK, 'scripts', 'db', 'checks', 'rls-politika-sarma-taban.json')

type Satir = {
  tablename: string
  policyname: string
  cmd: string
  roller: string
  sarma: number
  ic_ice: boolean
  ifade_bayti: number
}

type Cikti = { kod: number; stdout: string; stderr: string }

function kostur(args: string[], env: Record<string, string> = {}): Cikti {
  try {
    const stdout = execFileSync(process.execPath, [BETIK, ...args], {
      cwd: KOK,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
    })
    return { kod: 0, stdout, stderr: '' }
  } catch (e) {
    const h = e as { status?: number; stdout?: string; stderr?: string }
    return { kod: h.status ?? -1, stdout: String(h.stdout ?? ''), stderr: String(h.stderr ?? '') }
  }
}

function fikstur(satirlar: Satir[]): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-rls-sarma-'))
  const p = path.join(d, 'fx.json')
  fs.writeFileSync(p, JSON.stringify(satirlar), 'utf8')
  return p
}

/** Geçici taban dosyası: izlenen TABAN'a dokunmadan betiği başka tabanla sınamanın tek yolu. */
function geciciTaban(icerik: string): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-rls-taban-'))
  const p = path.join(d, 'taban.json')
  fs.writeFileSync(p, icerik, 'utf8')
  return p
}

/** Tabandaki 11 bilinen borcu fikstür satırına çevirir (gerçek ölçümün aynası). */
function tabandanSatirlar(): Satir[] {
  const t = JSON.parse(fs.readFileSync(TABAN, 'utf8')) as { girdiler: Record<string, number> }
  return Object.entries(t.girdiler).map(([k, sarma]) => {
    const i = k.indexOf('.')
    return {
      tablename: k.slice(0, i),
      policyname: k.slice(i + 1),
      cmd: 'SELECT',
      roller: '{public}',
      sarma,
      ic_ice: true,
      ifade_bayti: sarma * 25,
    }
  })
}

/** Sağlıklı komşular — evren gerçekçi olsun ve "20+ politika" sağlık kolu tetiklenmesin. */
function saglikliDolgu(adet: number): Satir[] {
  return Array.from({ length: adet }, (_, i) => ({
    tablename: `t${i}`,
    policyname: `p${i}`,
    cmd: 'SELECT',
    roller: '{authenticated}',
    sarma: 1,
    ic_ice: false,
    ifade_bayti: 80,
  }))
}

describe('INV-RLS-SARMA-1: RLS politikalarinda ic ice sarma', () => {
  it('betik ve taban dosyasi VAR (kapi KOR kosmasin)', () => {
    expect(fs.existsSync(BETIK), 'kapi betigi yok').toBe(true)
    expect(fs.existsSync(TABAN), 'taban dosyasi yok — bilinen borc kaydi kaybolmus').toBe(true)
    const t = JSON.parse(fs.readFileSync(TABAN, 'utf8')) as { girdiler: Record<string, number> }
    expect(Object.keys(t.girdiler).length, 'taban BOS — onarim indi mi? indiyse bu kol guncellenmeli').toBe(11)
  })

  /**
   * ⭐EN ÖNEMLİ KOL. Bu düşerse ölçüt "iç içelik"ten "sayma"ya kaymış demektir ve kapı
   * sağlıklı politikalara sahte kırmızı vermeye başlar.
   */
  it('SAGLIKLI UCLU: iki AYRI sarma tasiyan politika ihlal SAYILMAZ (olcut sayma DEGIL ic icelik)', () => {
    const satirlar: Satir[] = [
      { tablename: 'order_notes', policyname: 'order_notes_select_authenticated', cmd: 'SELECT', roller: '{authenticated}', sarma: 2, ic_ice: false, ifade_bayti: 320 },
      { tablename: 'order_attachments', policyname: 'order_attachments_select_authenticated', cmd: 'SELECT', roller: '{authenticated}', sarma: 2, ic_ice: false, ifade_bayti: 330 },
      { tablename: 'venthub_returns', policyname: 'returns_insert_policy', cmd: 'INSERT', roller: '{authenticated}', sarma: 2, ic_ice: false, ifade_bayti: 180 },
      // ⭐TABAN SATIRLARI DA FİKSTÜRDE OLMALI. İlk yazımda koymamıştım ve kol düştü —
      // ama sebebi ölçüt değil, EVRENİMDİ: taban satırının karşılığı fikstürde yoksa kapı
      // haklı olarak "bayat taban" deyip kırmızı verir. Yani kol, ölçmek istediği şeyi
      // değil başka bir şeyi ölçüyordu. (Bugün bu sınıfın üçüncü tekrarı.)
      ...tabandanSatirlar(),
      ...saglikliDolgu(20),
    ]
    // Taban SAĞLIKLI ÜÇLÜYÜ içermiyor; yine de kırmızı OLMAMALI — çünkü iç içelik yok.
    const r = kostur(['--fikstur', fikstur(satirlar)])
    expect(
      r.stdout + r.stderr,
      'iki AYRI sarma ihlal sayildi — olcut `sarma > 1`e kaymis olabilir (sahte kirmizi)',
    ).not.toContain('KIRMIZI')
    expect(r.kod, 'saglikli politikalar kapiyi kizartti').toBe(0)
  })

  it('BILINEN BORC tabanda: 11 politika kirmizi VERMEZ (master kilitlenmesin)', () => {
    const r = kostur(['--fikstur', fikstur([...tabandanSatirlar(), ...saglikliDolgu(12)])])
    expect(r.stdout, 'bilinen borc bildirilmedi — okuyan neyin susturuldugunu goremez').toContain('BILINEN BORC')
    expect(r.kod, 'tabandaki borc kapiyi kizartti — butun filo kilitlenirdi').toBe(0)
  })

  it('SABOTAJ: tabanda OLMAYAN yeni ic ice sarma KIRMIZI', () => {
    const satirlar = [
      ...tabandanSatirlar(),
      ...saglikliDolgu(12),
      { tablename: 'venthub_orders', policyname: 'orders_select_policy', cmd: 'SELECT', roller: '{authenticated}', sarma: 2, ic_ice: true, ifade_bayti: 200 },
    ]
    const r = kostur(['--fikstur', fikstur(satirlar)])
    expect(r.kod, 'YENI ic ice sarma kapidan GECTI — kapinin varlik sebebi olurdu').toBe(1)
    expect(r.stderr, 'ihlal eden politika adiyla yazilmadi').toContain('venthub_orders.orders_select_policy')
    expect(r.stderr).toContain('YENI politikada IC ICE sarma')
  })

  /**
   * ⛔TABAN SESSİZCE ÇÜRÜMEZ. Onarılmış bir politikanın taban satırı kalırsa, o politika
   * yeniden şişebilir ve taban onu örter — taban, kapının kendi fail-open kapısı olurdu.
   */
  it('ANTI-CURUME: gercekle eslesmeyen TABAN satiri KIRMIZI verir', () => {
    // Tabandaki 11'in yalnız biri hâlâ şişmiş; kalan 10 onarılmış gibi davranıyor.
    const r = kostur(['--fikstur', fikstur([tabandanSatirlar()[0], ...saglikliDolgu(22)])])
    expect(r.kod, 'bayat taban satiri kapidan GECTI — taban kapiyi korlestirirdi').toBe(1)
    expect(r.stderr).toContain('TABAN SATIRI artik gercekle eslesmiyor')
    expect(r.stderr, 'ne yapilacagi yazilmadi').toContain('taban satirini DUS')
  })

  it('ONARIM SONRASI: taban bosalir ve sisme kalmazsa YESIL', () => {
    // ⭐İZLENEN TABAN DOSYASINA YAZILMAZ (ALT-8): boş taban geçici kopyada kurulur ve betiğe
    // RLS_SARMA_TABAN ile gösterilir. Yarım kalan koşum izlenen dosyayı bozuk bırakamaz.
    const r = kostur(['--fikstur', fikstur(saglikliDolgu(25))], {
      RLS_SARMA_TABAN: geciciTaban(JSON.stringify({ girdiler: {} }, null, 2)),
    })
    expect(r.kod, 'onarim sonrasi kapi hala kirmizi — kapi ASLA yesile donemezdi').toBe(0)
    expect(r.stdout).toContain('YESIL')
  })

  describe('FAIL-CLOSED — "olcemedim" asla "temiz" degildir', () => {
    it('baglanti dizesi YOKSA cikis 2', () => {
      const r = kostur([], { SUPABASE_DB_URL: '', DATABASE_URL: '' })
      expect(r.kod, 'baglanti yokken kapi GECTI').toBe(2)
      expect(r.stderr).toContain('OLCULEMEDI')
    })

    it('EVREN SUPHELI DARSA cikis 2 (bos evrende kosan kapi olcum degildir)', () => {
      // Fikstür modunda sağlık kolu kapalı; burada gerçek yol ölçülüyor: 20'den az
      // politika dönmesi şema/izin değişimi demektir. Fikstür yolu bunu bilerek atlar,
      // o yüzden kolu betiğin kaynağından ölçüyoruz.
      const kaynak = fs.readFileSync(BETIK, 'utf8')
      expect(kaynak, 'evren saglik kolu kaldirilmis — kapi kor kosabilir').toMatch(/satirlar\.length < 20/)
      expect(kaynak).toContain('KOR kosmaktansa KIRMIZI doner')
    })

    it('TABAN bozuksa cikis 2 (ayristirilamayan taban sessizce BOS sayilmaz)', () => {
      const r = kostur(['--fikstur', fikstur(saglikliDolgu(25))], {
        RLS_SARMA_TABAN: geciciTaban('{ bozuk json'),
      })
      expect(r.kod, 'bozuk taban BOS taban gibi davrandi — sessizce fail-open').toBe(2)
      expect(r.stderr).toContain('OLCULEMEDI')
    })

    it('RLS_SARMA_TABAN gercek olcumde REDDEDILIR (taban kapinin fail-open kapisi olamaz)', () => {
      const r = kostur([], {
        RLS_SARMA_TABAN: geciciTaban(JSON.stringify({ girdiler: {} })),
        SUPABASE_DB_URL: 'postgres://x',
      })
      expect(r.kod, 'DB li olcumde taban degistirilebildi').toBe(2)
      expect(r.stderr).toContain('yalniz --fikstur ile gecerli')
    })

    it('RLS_SARMA_TABAN olmayan dosyayi gosterirse cikis 2 (sessizce bos taban sayilmaz)', () => {
      const r = kostur(['--fikstur', fikstur(saglikliDolgu(25))], {
        RLS_SARMA_TABAN: path.join(os.tmpdir(), 'inv-rls-taban-yok', 'yok.json'),
      })
      expect(r.kod).toBe(2)
      expect(r.stderr).toContain('gosterilen dosya yok')
    })
  })

  /**
   * ⛔İZLENEN TABAN DOSYASINA HİÇBİR KOL YAZMAZ (ALT-8, 2026-10-01; 09-27 olayı).
   * İki kol izlenen taban dosyasını yerinde bozup `finally`de geri yazıyordu; yarım kalan
   * koşum (süreç ölümü, iki işçinin yarışı) dosyayı `{ bozuk json` bırakıp kapıyı ve CI'ı
   * kırmızıya çevirdi, 4 gün ana ağaçta kirli kaldı. Bu kol testin KAYNAĞINI ölçer: biri
   * TABAN'a yazan eski kalıba dönerse kırmızı verir (sabotaj kanıtı PR açıklamasında).
   */
  it('TABAN DOSYASINA YAZILMAZ: bu testte TABAN hedefli yazma kalıbı yok', () => {
    const kaynak = fs.readFileSync(path.join(KOK, 'src', '__tests__', 'conformance', 'rls-politika-sarma.test.ts'), 'utf8')
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    expect(kod, 'test izlenen taban dosyasina YAZIYOR — yarim kalan kosum depoyu bozar').not.toMatch(
      /(writeFileSync|appendFileSync|copyFileSync|renameSync|rmSync|unlinkSync|truncateSync)\(\s*TABAN\b/,
    )
  })

  /**
   * ⛔KAPI ONARMAZ. Politikaları düzeltmek migration'dır ve kural 13 gereği Recep kapısıdır.
   * Bu kol düşerse kapı sessizce yazan bir şeye dönüşmüştür.
   */
  it('KAPI ONARMAZ: kaynakta ALTER/CREATE/DROP POLICY calistiran yer yok', () => {
    const kaynak = fs.readFileSync(BETIK, 'utf8')
    const kod = kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    expect(kod, 'kapi politika YAZIYOR — onarim migration ve Recep kapisi').not.toMatch(
      /(ALTER|CREATE|DROP)\s+POLICY/i,
    )
    expect(kod, 'kapi DDL calistiriyor').not.toMatch(/\b(insert into|update\s+\w+\s+set|delete from)\b/i)
  })

  it('CI KOLU BAGLI: db-advisor.yml kapiyi kosturuyor (dosya var ama tetigi yoksa OLU ARAC)', () => {
    const wf = fs.readFileSync(path.join(KOK, '.github', 'workflows', 'db-advisor.yml'), 'utf8')
    expect(wf, 'kapi CI\'da kosmuyor — yazilmis ama olu').toContain('rls-politika-sarma.mjs')
    expect(wf, 'kapi SUPABASE_DB_URL almiyor').toMatch(/INV-RLS-SARMA-1[\s\S]{0,400}SUPABASE_DB_URL/)
  })
})
