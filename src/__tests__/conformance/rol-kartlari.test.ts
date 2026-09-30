/**
 * INV-ROL-1 — departman rol kartları (REC-426, tek plan REC-433 Faz 3 girdisi).
 *
 * NİÇİN VAR: her departmanın görevi, dosyaları, yetkisi ve Recep kapıları dağınıktı; yeni açılan
 * pencere rolünü yeniden öğreniyordu. Kartlar `scripts/belge/rol-karti-uret.cjs` ile üretilir;
 * ortak bloklar (Recep kapıları, iletişim, çalışma düzeni) tek yerde sabittir.
 *
 * Bu paket iki şeyi ölçer:
 *   1. AYIRT EDİCİLİK — `sorunlar()` bilerek bozulmuş kartlarda (kapı satırı silinmiş, boyut aşılmış,
 *      başlık eksik) SORUN bulur; bulmazsa kapı kördür.
 *   2. MANDAL — diskteki docs/roller/*.md üreticinin çıktısıyla bire bir aynı, her kart sınırın altında,
 *      ortak bloklar bütün kartlarda bire bir aynı.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type Uretici = {
  uret: () => Record<string, string>
  sorunlar: (k: Record<string, string>) => string[]
  ROLLER: Record<string, unknown>
  ILETISIM: string
  ILETISIM_ISTISNA: Record<string, string>
  ozet: (ad: string) => string
  sahiplikOku: (kok: string) => Record<string, { sahip: string; dogrulanacak: boolean; dayanak: string }>
  sahiplikSorunlari: (h: Record<string, { sahip: string }>, varMi: (d: string) => boolean) => string[]
  sahiplikTablosu: (h: Record<string, { sahip: string; dogrulanacak: boolean; dayanak: string }>) => string
  SAHIPLIK_BELGESI: string
  OZET_SINIRI: number
  KART_BAYT_SINIRI: number
  dosyaAdi: (ad: string) => string
  kuralKaynagiOku: (kok: string) => { no: number; baslik: string }[]
  kuralSorunlari: (kaynak: { no: number; baslik: string }[], kartlar: Record<string, string>, kurallar?: unknown[]) => string[]
  rolKurallari: (ad: string) => unknown[][]
  KURALLAR: [number, string, string, string, string[] | 'HEPSI'][]
  skillAdlariOku: (kok: string) => string[]
  skillAtamasiOku: (kok: string) => SkillVeri
  skillSorunlari: (veri: SkillVeri, kartlar: Record<string, string>, proje: string[]) => string[]
  skillTablosu: (veri: SkillVeri) => string
  kartSkillAdaylari: (metin: string, proje: string[]) => string[]
  SKILL_BELGESI: string
}

type SkillVeri = {
  skiller: Record<string, { roller?: string[]; konu?: string | null; atanmadi?: string }>
  projeDisiAdlar: Record<string, string>
}

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const uretici = require(path.join(KOK, 'scripts', 'belge', 'rol-karti-uret.cjs')) as Uretici
const BEKLENEN_ROLLER = ['OPS', 'ARAC', 'ALTYAPI', 'HARITA', 'URUN', 'ADMIN', 'KATALOG', 'GEO-SEO', 'BLOG', 'MARKA']

describe('INV-ROL-1 — rol kartı üreticisi ayırt edici', () => {
  const temiz = uretici.uret()

  it('temiz kart kümesinde sorun yok', () => {
    expect(uretici.sorunlar(temiz)).toEqual([])
  })

  it('Recep kapısı satırı silinen kartı yakalar', () => {
    const bozuk = { ...temiz, OPS: temiz.OPS.replace('2. Sır, anahtar ya da parola yazmak.\n', '') }
    expect(uretici.sorunlar(bozuk).some((s) => s.startsWith('OPS: ortak blok'))).toBe(true)
  })

  it('bayt sınırını aşan kartı yakalar', () => {
    const bozuk = { ...temiz, URUN: temiz.URUN + 'x'.repeat(uretici.KART_BAYT_SINIRI) }
    expect(uretici.sorunlar(bozuk).some((s) => s.includes('bayt'))).toBe(true)
  })

  it('başlığı eksik kartı yakalar', () => {
    const bozuk = { ...temiz, ADMIN: temiz.ADMIN.replace('## Yetki', '## Baska') }
    expect(uretici.sorunlar(bozuk).some((s) => s.includes('başlık eksik'))).toBe(true)
  })
})

describe('INV-ROL-1 — 31 geliştirme kuralı rol kartlarına dağıtıldı, hiçbiri düşmedi (REC-503)', () => {
  const kaynak = uretici.kuralKaynagiOku(KOK)
  const kartlar = uretici.uret()
  const kurallar = uretici.KURALLAR

  it('kaynakta 31 kural var, dağıtımda 31, kartlarda 31 farklı kural numarası', () => {
    expect(kaynak).toHaveLength(31)
    expect(kaynak.map((k) => k.no)).toEqual(Array.from({ length: 31 }, (_, i) => i + 1))
    expect(kurallar).toHaveLength(31)
    const kartlarda = new Set<number>()
    for (const metin of Object.values(kartlar)) for (const m of metin.matchAll(/^- K(\d+) /gm)) kartlarda.add(Number(m[1]))
    expect(kartlarda.size).toBe(31)
  })

  it('gerçek dağıtım temiz: başlıklar kaynakla birebir, roller bilinen roller, hiçbir kural düşmemiş', () => {
    expect(uretici.kuralSorunlari(kaynak, kartlar)).toEqual([])
  })

  it('her kuralın atandığı kartta satırı var; atanmadığı kartta yok', () => {
    for (const ad of BEKLENEN_ROLLER) {
      const atanan = new Set(uretici.rolKurallari(ad).map((k) => k[0] as number))
      for (const [no] of kurallar) {
        const var_ = new RegExp(`^- K${no} `, 'm').test(kartlar[ad])
        expect(var_, `${ad} K${no}`).toBe(atanan.has(no))
      }
    }
  })

  it('kural 1 (plan önce) bütün on kartta; her kural en az bir rolde', () => {
    for (const ad of BEKLENEN_ROLLER) expect(kartlar[ad], ad).toMatch(/^- K1 Plan önce:/m)
    for (const [no, , , , roller] of kurallar) expect(roller === 'HEPSI' || roller.length > 0, `K${no}`).toBe(true)
  })

  it('AYIRT EDİCİLİK: düşen kural, sapan başlık, bilinmeyen rol ve kartlardan silinen kural yakalanır', () => {
    const dusmus = kurallar.filter((k) => k[0] !== 20)
    expect(uretici.kuralSorunlari(kaynak, kartlar, dusmus).some((s) => s.includes('K20') && s.includes('düşmüş'))).toBe(true)

    const sapmis = kurallar.map((k) => (k[0] === 5 ? [k[0], 'Audit Izi', k[2], k[3], k[4]] : k))
    expect(uretici.kuralSorunlari(kaynak, kartlar, sapmis).some((s) => s.startsWith('K5: başlık'))).toBe(true)

    const yabanci = kurallar.map((k) => (k[0] === 6 ? [k[0], k[1], k[2], k[3], ['YOKROL']] : k))
    expect(uretici.kuralSorunlari(kaynak, kartlar, yabanci).some((s) => s.includes('bilinmeyen rol YOKROL'))).toBe(true)

    const eksikKaynak = kaynak.slice(0, 30)
    expect(uretici.kuralSorunlari(eksikKaynak, kartlar).some((s) => s.includes('kaynakta 30 kural'))).toBe(true)

    const kartsiz = Object.fromEntries(Object.entries(kartlar).map(([a, m]) => [a, m.replace(/^- K19 .*$/gm, '')]))
    expect(uretici.kuralSorunlari(kaynak, kartsiz).some((s) => s.includes('K19: hiçbir kartta yok'))).toBe(true)
  })

  it('AYIRT EDİCİLİK: kartta kural satırı silinirse ya da değişirse sorunlar() yakalar', () => {
    const silinmis = { ...kartlar, URUN: kartlar.URUN.replace(/^- K14 .*$/m, '') }
    expect(uretici.sorunlar(silinmis).some((s) => s.startsWith('URUN: kural satırı eksik') && s.includes('K14'))).toBe(true)
    const degismis = { ...kartlar, ADMIN: kartlar.ADMIN.replaceAll('admin_audit_log', 'baska_tablo') }
    expect(uretici.sorunlar(degismis).some((s) => s.startsWith('ADMIN: kural satırı') && s.includes('K5'))).toBe(true)
  })
})

describe('INV-ROL-1 — skill–rol atama tablosu iskeleti (REC-509)', () => {
  const proje = uretici.skillAdlariOku(KOK)
  const veri = uretici.skillAtamasiOku(KOK)
  const kartlar = uretici.uret()
  const kopya = (): SkillVeri => JSON.parse(JSON.stringify(veri)) as SkillVeri

  it('projede skill var ve tablo anahtarları .claude/skills ile birebir aynı', () => {
    expect(proje.length).toBeGreaterThan(0)
    expect(Object.keys(veri.skiller).sort()).toEqual([...proje].sort())
  })

  it('gerçek tablo temiz: her skill bir rolde ya da "atanmadı: sebep"; kartlarla çift yönlü uyum', () => {
    expect(uretici.skillSorunlari(veri, kartlar, proje)).toEqual([])
  })

  it('YETENEK içeriği doldururken rol eklerse kart satırı da güncellenmek zorunda: kartta adı olmayan atama yakalanır', () => {
    const b = kopya()
    b.skiller['create-migration'] = { roller: ['ALTYAPI'], konu: null }
    expect(uretici.skillSorunlari(b, kartlar, proje).some((s) => s.startsWith('create-migration: ALTYAPI kartının Yetenek satırında adı yok'))).toBe(true)
  })

  it('AYIRT EDİCİLİK: kararsız yeni skill, silinmiş skill, sebepsiz atanmadı, bilinmeyen rol yakalanır', () => {
    expect(uretici.skillSorunlari(veri, kartlar, [...proje, 'yeni-skill']).some((s) => s.startsWith('skill tabloda yok: yeni-skill'))).toBe(true)
    expect(uretici.skillSorunlari(veri, kartlar, proje.filter((a) => a !== 'qa')).some((s) => s.startsWith('tabloda olup projede olmayan skill: qa'))).toBe(true)

    const sebepsiz = kopya()
    sebepsiz.skiller.fallow = { atanmadi: '  ' }
    expect(uretici.skillSorunlari(sebepsiz, kartlar, proje).some((s) => s.startsWith('fallow: ne rol ne'))).toBe(true)

    const yabanci = kopya()
    yabanci.skiller.fallow = { roller: ['YOKROL'], konu: null }
    expect(uretici.skillSorunlari(yabanci, kartlar, proje).some((s) => s.includes('bilinmeyen rol YOKROL'))).toBe(true)
  })

  it('AYIRT EDİCİLİK: kartta adı geçen skill tabloda o role atanmamışsa, beyansız araç adı ve ölü beyan yakalanır', () => {
    const atamasiz = kopya()
    atamasiz.skiller.codegraph = { atanmadi: 'test' }
    expect(uretici.skillSorunlari(atamasiz, kartlar, proje).some((s) => s.startsWith('ARAC kartında adı geçen skill tabloda o role atanmamış: codegraph'))).toBe(true)

    const beyansiz = kopya()
    delete beyansiz.projeDisiAdlar['ast-grep']
    expect(uretici.skillSorunlari(beyansiz, kartlar, proje).some((s) => s.includes('"ast-grep" ne projede skill ne de projeDisiAdlar'))).toBe(true)

    const olu = kopya()
    olu.projeDisiAdlar['hic-yok-arac'] = 'araç'
    expect(uretici.skillSorunlari(olu, kartlar, proje).some((s) => s.includes('ölü ad: hic-yok-arac'))).toBe(true)

    const cakisma = kopya()
    cakisma.projeDisiAdlar['plan-challenger'] = 'araç'
    expect(uretici.skillSorunlari(cakisma, kartlar, proje).some((s) => s.includes("projede skill olan ad: plan-challenger"))).toBe(true)
  })

  it('kart adayı çıkarımı: tireli ad ve proje skill\'i alınır, boşluklu ifade ve tireli olmayan yabancı kelime alınmaz', () => {
    const metin = '## Yetenek ve araç\nSupabase, Linear, vitest + axe, rendering-cache cetveli, ast-grep, plan-challenger.\n\n## Durum\nx'
    expect(uretici.kartSkillAdaylari(metin, ['supabase', 'plan-challenger'])).toEqual(['supabase', 'ast-grep', 'plan-challenger'])
  })

  it('docs/roller/skill-atamasi.md üreticiyle bire bir aynı ve sayıları doğru söyler', () => {
    const disk = fs.readFileSync(path.join(KOK, 'docs', 'roller', uretici.SKILL_BELGESI), 'utf8').replace(/\r\n/g, '\n')
    expect(disk).toBe(uretici.skillTablosu(veri))
    const atanan = Object.values(veri.skiller).filter((v) => v.roller?.length).length
    expect(disk).toContain(`Toplam ${proje.length} skill: ${atanan} atanmış, ${proje.length - atanan} atanmadı.`)
  })
})

describe('INV-ROL-1 — cetvel sahiplik haritası (REC-433 3.4-B)', () => {
  const harita = uretici.sahiplikOku(KOK)
  const varMi = (d: string) => fs.existsSync(path.join(KOK, d))

  it('gerçek harita temiz: her sahip bilinen rol, her dosya docs/standards altında ve var', () => {
    expect(uretici.sahiplikSorunlari(harita, varMi)).toEqual([])
    expect(Object.keys(harita).length).toBeGreaterThan(0)
  })

  it('AYIRT EDİCİLİK: bilinmeyen rol, dışarıdaki yol ve var olmayan dosya yakalanır', () => {
    const bozuk = {
      'docs/standards/x.md': { sahip: 'YOKROL' },
      'docs/baska/y.md': { sahip: 'OPS' },
      'docs/standards/olmayan-dosya.md': { sahip: 'OPS' },
    }
    const s = uretici.sahiplikSorunlari(bozuk, () => false)
    expect(s.some((x) => x.includes('bilinmeyen rol'))).toBe(true)
    expect(s.some((x) => x.includes('docs/standards dışında'))).toBe(true)
    expect(s.some((x) => x.includes('dosya yok'))).toBe(true)
  })

  it('docs/roller/cetvel-sahipligi.md üreticiyle bire bir aynı ve "doğrulanacak" işaretini taşır', () => {
    const disk = fs.readFileSync(path.join(KOK, 'docs', 'roller', uretici.SAHIPLIK_BELGESI), 'utf8').replace(/\r\n/g, '\n')
    expect(disk).toBe(uretici.sahiplikTablosu(harita))
    const dogrulanacak = Object.values(harita).filter((v) => v.dogrulanacak).length
    expect(dogrulanacak).toBeGreaterThan(0)
    expect((disk.match(/Sahip \(doğrulanacak\)/g) ?? []).length - 1).toBe(dogrulanacak) // 1 = üstbilgideki açıklama
  })

  it('düşük güvenli atama "teyitli" görünmez (OPS hükmü 2)', () => {
    const t = uretici.sahiplikTablosu({
      'docs/standards/a.md': { sahip: 'ADMIN', dogrulanacak: true, dayanak: 'd' },
      'docs/standards/b.md': { sahip: 'URUN', dogrulanacak: false, dayanak: 'd' },
    })
    expect(t).toMatch(/\| a\.md \| ADMIN \| Sahip \(doğrulanacak\) \|/)
    expect(t).toMatch(/\| b\.md \| URUN \| teyitli \|/)
  })
})

describe('INV-ROL-1 — --ozet (kanca için tek satır, fail-open)', () => {
  const betik = path.join(KOK, 'scripts', 'belge', 'rol-karti-uret.cjs')
  const calistir = (...a: string[]) => spawnSync('node', [betik, ...a], { encoding: 'utf8' })

  it('her rol için tek satır, sınırın altında, yeni satır yok', () => {
    for (const ad of BEKLENEN_ROLLER) {
      const r = calistir('--ozet', ad)
      expect(r.status, ad).toBe(0)
      expect(r.stdout.length, ad).toBeGreaterThan(0)
      expect(r.stdout.length, ad).toBeLessThanOrEqual(uretici.OZET_SINIRI)
      expect(r.stdout, ad).not.toMatch(/[\r\n]/)
    }
  })

  it('küçük harfli rol adını da tanır', () => {
    expect(calistir('--ozet', 'ops').stdout).toBe(calistir('--ozet', 'OPS').stdout)
  })

  it('bilinmeyen ya da eksik rolde boş çıktı ve çıkış 0 (kanca bozulmaz)', () => {
    for (const a of [['--ozet', 'YOKBOYLEROL'], ['--ozet']]) {
      const r = calistir(...a)
      expect(r.status).toBe(0)
      expect(r.stdout).toBe('')
    }
  })

  it('sınırı aşan görev "…" ile kırpılır (ayırt edicilik: uzun metin kırpılmazsa kapı kördür)', () => {
    const uzun = { gorev: 'a '.repeat(400) }
    const roller = uretici.ROLLER as Record<string, unknown>
    roller.ZZTEST = uzun
    try {
      const s = uretici.ozet('ZZTEST')
      expect(s.length).toBeLessThanOrEqual(uretici.OZET_SINIRI)
      expect(s.endsWith('…')).toBe(true)
    } finally {
      delete roller.ZZTEST
    }
  })
})

describe('INV-ROL-1 — gerçek depoda mandal', () => {
  const uretilen = uretici.uret()

  it('beklenen on rolün hepsi var, fazlası yok', () => {
    expect(Object.keys(uretilen).sort()).toEqual([...BEKLENEN_ROLLER].sort())
  })

  it('docs/roller/*.md üreticinin çıktısıyla bire bir aynı (elle düzenleme yok)', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      const yol = path.join(KOK, 'docs', 'roller', uretici.dosyaAdi(ad))
      expect(fs.existsSync(yol), `${yol} yok — node scripts/belge/rol-karti-uret.cjs --yaz`).toBe(true)
      // Windows'ta git satır sonunu CRLF'ye çevirebilir; içerik karşılaştırması satır sonundan bağımsız.
      expect(fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n'), `${ad} kartı üreticiden sapmış`).toBe(metin)
    }
  })

  it('docs/roller/ içinde üreticinin bilmediği kart yok', () => {
    const disk = fs.readdirSync(path.join(KOK, 'docs', 'roller')).filter((f) => f.endsWith('.md'))
    const beklenen = [...Object.keys(uretilen).map((ad) => uretici.dosyaAdi(ad)), uretici.SAHIPLIK_BELGESI, uretici.SKILL_BELGESI]
    expect(disk.sort()).toEqual(beklenen.sort())
  })

  // Gerekçe (OPS şartı, REC-503): sınır 4096 → 6656; en yüklü kart URUN 6151 bayt, pay %8. Aşılırsa kural
  // özetleri kısaltılır; sınır bir daha gevşetilmez.
  it('her kart bayt sınırının altında', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(Buffer.byteLength(metin, 'utf8'), `${ad}`).toBeLessThanOrEqual(uretici.KART_BAYT_SINIRI)
    }
  })

  it('Çalışma düzeni bloğu her kartta bire bir aynı ve pano kanıt kuralını taşır (ARAÇ ölçümü: 62 kartın 45\'inde kanıt yok)', () => {
    const blok = (m: string) => m.slice(m.indexOf('## Çalışma düzeni')).trimEnd()
    const ilki = blok(Object.values(uretilen)[0])
    expect(ilki).toContain('Pano kartı açılırken kanıt zorunlu')
    expect(ilki).toContain('`command`')
    expect(ilki).toContain('`file_matches`')
    for (const [ad, metin] of Object.entries(uretilen)) expect(blok(metin), ad).toBe(ilki)
  })

  it('İletişim bloğu: istisna yalnız OPS için, diğer dokuz kartta bire bir aynı', () => {
    expect(Object.keys(uretici.ILETISIM_ISTISNA)).toEqual(['OPS'])
    const blok = (m: string) => m.slice(m.indexOf('## İletişim'), m.indexOf('## Çalışma düzeni')).trimEnd()
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(blok(metin), ad).toBe(uretici.ILETISIM_ISTISNA[ad] ?? uretici.ILETISIM)
    }
    expect(blok(uretilen.OPS)).toContain('konsolide tabloyla ben veririm')
    expect(blok(uretilen.ARAC)).toContain('yalnız iş bitince')
  })

  it('OPS kartı karar kaynağı kuralını taşır (fleet §29: karara giden sayı betikten gelir, kaynak Linear kaydında)', () => {
    expect(uretilen.OPS).toContain('kaynağı (betik + çıktı + tarih)')
    expect(uretilen.OPS).toContain('karar tablosunda kaynak sütunu yoktur')
  })

  it('istisnayı bilmeyen bozuk kopya yakalanır: OPS kartına ortak metin konursa sorun', () => {
    const bozuk = { ...uretilen, OPS: uretilen.OPS.replace(uretici.ILETISIM_ISTISNA.OPS, uretici.ILETISIM) }
    expect(uretici.sorunlar(bozuk).some((s) => s.startsWith('OPS: ortak blok'))).toBe(true)
  })

  it('karar 181: arka ofis yasağı yalnız URUN/ADMIN/ALTYAPI/KATALOG kartında, olgun-kütüphane satırı her kartta', () => {
    const yasak = 'Genel arka ofis modülünü'
    for (const ad of ['URUN', 'ADMIN', 'ALTYAPI', 'KATALOG']) expect(uretilen[ad], ad).toContain(yasak)
    for (const ad of Object.keys(uretilen).filter((a) => !['URUN', 'ADMIN', 'ALTYAPI', 'KATALOG'].includes(a))) {
      expect(uretilen[ad], ad).not.toContain(yasak)
    }
    for (const [ad, metin] of Object.entries(uretilen)) expect(metin, ad).toContain('olgun kütüphane/sistem aranır (karar 181)')
  })

  it('Recep mesaj biçimi her kartta: tek tablo + madde işaretli liste + 3 maddelik compact notu + Onayında yalnız Recep kararı', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('TEK TABLO ile başlar')
      expect(metin, ad).toContain('madde işaretli liste olur')
      expect(metin, ad).toContain('compact hazırlık notu 3 maddelik listedir')
      expect(metin, ad).toContain('"Onayında" yalnız Recep kararı bekleyen iştir')
    }
  })

  it('her kartta açılış işi: durum dosyası + TAM oturum kimliği + dört alan', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('lane-day-<tarih>.md')
      expect(metin, ad).toContain('TAM oturum kimliği')
      expect(metin, ad).toContain('son girdi / açık kuyruk / verilen sözler / bekleyen kararlar')
    }
  })

  it('her kartta erişim sorusundan önce erişim envanteri okunur ve envanter dosyası gerçekten var', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('docs/olcum/erisim-envanteri.md')
      expect(metin, ad).toContain('"Kanıt" yolunu koş')
    }
    expect(fs.existsSync(path.join(KOK, 'docs/olcum/erisim-envanteri.md'))).toBe(true)
  })

  it('karar 187: her kartta PR = Fixes REC-nn (alt kayıt), istisna yalnız Kayıtsız: <sebep>', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('PR = `Fixes REC-nn`')
      expect(metin, ad).toContain('`Kayıtsız: <sebep>`')
    }
  })

  it('beş Recep kapısı her kartta bire bir aynı', () => {
    const blok = (m: string) => m.slice(m.indexOf('## Recep kapıları'), m.indexOf('## İletişim'))
    const ilki = blok(Object.values(uretilen)[0])
    expect(ilki.split('\n').filter((s) => /^[1-5]\. /.test(s))).toHaveLength(5)
    for (const [ad, metin] of Object.entries(uretilen)) expect(blok(metin), ad).toBe(ilki)
  })
})
