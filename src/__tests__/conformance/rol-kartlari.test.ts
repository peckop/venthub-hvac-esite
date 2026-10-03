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
  uretKurallar: () => Record<string, string>
  kuralDosyaAdi: (ad: string) => string
  kuralDosyaSorunlari: (k: Record<string, string>) => string[]
  sorunlar: (k: Record<string, string>) => string[]
  ROLLER: Record<string, unknown>
  ILETISIM: string
  ILETISIM_ISTISNA: Record<string, string>
  YONETIM: string
  YONETIM_ISTISNA: Record<string, string>
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
  GOREVLER: Record<string, RolGorevi>
  uretGorevler: () => Record<string, string>
  gorevDosyaAdi: (ad: string) => string
  gorevSorunlari: (
    veri: Record<string, RolGorevi>,
    roller: string[],
    varMi: (d: string) => boolean,
    oku: (d: string) => string,
    isAkislari?: string[],
  ) => string[]
  gorevEksikRoller: () => string[]
  isAkisiMetinleri: (kok: string) => string[]
  AMAC_SINIRI: number
}

type Gorev = {
  gorev: string
  komut?: string
  siklik: string
  tetik: string
  tetikAyrinti: string
  bagli: string
  baglayacak?: string
  cikti: string
  esik: string
  taslak?: boolean
}
type RolGorevi = { amac: string; gorevler: Gorev[] }

const KOK = spawnSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim()
const require = createRequire(import.meta.url)
const uretici = require(path.join(KOK, 'scripts', 'belge', 'rol-karti-uret.cjs')) as Uretici
const BEKLENEN_ROLLER = [
  'OPS', 'ARAC', 'ALTYAPI', 'HARITA', 'URUN', 'ADMIN', 'KATALOG', 'GEO-SEO', 'BLOG', 'MARKA',
  // REC-522: kartı olmayan altı departman (OPS kararı 2026-09-30).
  'MEVZUAT', 'SATIS', 'TASARIM', 'EDGE', 'I18N', 'YETENEK',
]

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

describe('INV-ROL-1 — 31 geliştirme kuralı rol kurallar dosyalarına dağıtıldı, hiçbiri düşmedi (REC-503, REC-521)', () => {
  const kaynak = uretici.kuralKaynagiOku(KOK)
  const kartlar = uretici.uret()
  // REC-521: kural özetleri kartta değil docs/roller/<ROL>-kurallar.md dosyalarında; kartta kısa ad listesi + atıf.
  const kuralDosyalari = uretici.uretKurallar()
  const kurallar = uretici.KURALLAR

  it('kaynakta 31 kural var, dağıtımda 31, kurallar dosyalarında 31 farklı kural numarası', () => {
    expect(kaynak).toHaveLength(31)
    expect(kaynak.map((k) => k.no)).toEqual(Array.from({ length: 31 }, (_, i) => i + 1))
    expect(kurallar).toHaveLength(31)
    const dosyalarda = new Set<number>()
    for (const metin of Object.values(kuralDosyalari)) for (const m of metin.matchAll(/^- K(\d+) /gm)) dosyalarda.add(Number(m[1]))
    expect(dosyalarda.size).toBe(31)
  })

  it('gerçek dağıtım temiz: başlıklar kaynakla birebir, roller bilinen roller, hiçbir kural düşmemiş', () => {
    expect(uretici.kuralSorunlari(kaynak, kuralDosyalari)).toEqual([])
    expect(uretici.kuralDosyaSorunlari(kuralDosyalari)).toEqual([])
  })

  it('her kuralın atandığı rolün kurallar dosyasında satırı ve kartında kısa adı var; atanmadığı yerde yok', () => {
    for (const ad of BEKLENEN_ROLLER) {
      const atanan = new Set(uretici.rolKurallari(ad).map((k) => k[0] as number))
      for (const [no] of kurallar) {
        const dosyada = new RegExp(`^- K${no} `, 'm').test(kuralDosyalari[ad])
        expect(dosyada, `${ad}-kurallar.md K${no}`).toBe(atanan.has(no))
        const kartta = new RegExp(`[-;] K${no} `).test(kartlar[ad].slice(kartlar[ad].indexOf('## Kurallar'), kartlar[ad].indexOf('## Durum')))
        expect(kartta, `${ad} kartı K${no} kısa adı`).toBe(atanan.has(no))
      }
    }
  })

  it('her kartta kurallar dosyasına atıf var ve atıf gerçek bir dosyayı gösterir', () => {
    for (const ad of BEKLENEN_ROLLER) {
      expect(kartlar[ad], ad).toContain(`docs/roller/${uretici.kuralDosyaAdi(ad)}`)
      expect(kuralDosyalari[ad], ad).toMatch(/^# KURALLAR: /)
    }
  })

  it('kural 1 (plan önce) bütün kartlarda ve dosyalarda; her kural en az bir rolde', () => {
    for (const ad of BEKLENEN_ROLLER) {
      expect(kuralDosyalari[ad], ad).toMatch(/^- K1 Plan önce:/m)
      expect(kartlar[ad], ad).toContain('K1 Plan önce')
    }
    for (const [no, , , , roller] of kurallar) expect(roller === 'HEPSI' || roller.length > 0, `K${no}`).toBe(true)
  })

  it('AYIRT EDİCİLİK: düşen kural, sapan başlık, bilinmeyen rol ve kartlardan silinen kural yakalanır', () => {
    const dusmus = kurallar.filter((k) => k[0] !== 20)
    expect(uretici.kuralSorunlari(kaynak, kuralDosyalari, dusmus).some((s) => s.includes('K20') && s.includes('düşmüş'))).toBe(true)

    const sapmis = kurallar.map((k) => (k[0] === 5 ? [k[0], 'Audit Izi', k[2], k[3], k[4]] : k))
    expect(uretici.kuralSorunlari(kaynak, kuralDosyalari, sapmis).some((s) => s.startsWith('K5: başlık'))).toBe(true)

    const yabanci = kurallar.map((k) => (k[0] === 6 ? [k[0], k[1], k[2], k[3], ['YOKROL']] : k))
    expect(uretici.kuralSorunlari(kaynak, kuralDosyalari, yabanci).some((s) => s.includes('bilinmeyen rol YOKROL'))).toBe(true)

    const eksikKaynak = kaynak.slice(0, 30)
    expect(uretici.kuralSorunlari(eksikKaynak, kuralDosyalari).some((s) => s.includes('kaynakta 30 kural'))).toBe(true)

    const dosyasiz = Object.fromEntries(Object.entries(kuralDosyalari).map(([a, m]) => [a, m.replace(/^- K19 .*$/gm, '')]))
    expect(uretici.kuralSorunlari(kaynak, dosyasiz).some((s) => s.includes('K19: hiçbir kartta yok'))).toBe(true)
  })

  it('AYIRT EDİCİLİK: kurallar dosyasında kural satırı silinirse ya da değişirse, kartta kısa ad listesi bozulursa yakalanır', () => {
    const silinmis = { ...kuralDosyalari, URUN: kuralDosyalari.URUN.replace(/^- K14 .*$/m, '') }
    expect(uretici.kuralDosyaSorunlari(silinmis).some((s) => s.startsWith('URUN: kural satırı eksik') && s.includes('K14'))).toBe(true)
    const degismis = { ...kuralDosyalari, ADMIN: kuralDosyalari.ADMIN.replaceAll('admin_audit_log', 'baska_tablo') }
    expect(uretici.kuralDosyaSorunlari(degismis).some((s) => s.startsWith('ADMIN: kural satırı') && s.includes('K5'))).toBe(true)
    const dosyaYok = { ...kuralDosyalari }
    delete dosyaYok.MARKA
    expect(uretici.kuralDosyaSorunlari(dosyaYok).some((s) => s.startsWith('MARKA: kurallar dosyası yok'))).toBe(true)
    const kartBozuk = { ...kartlar, URUN: kartlar.URUN.replace('K14 Suspense sınırı; ', '') }
    expect(uretici.sorunlar(kartBozuk).some((s) => s.startsWith('URUN: kural bölümü eksik'))).toBe(true)
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
  const kuralMetinleri = uretici.uretKurallar()

  it('beklenen 16 rolün hepsi var, fazlası yok', () => {
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

  it('docs/roller/<ROL>-kurallar.md üreticinin çıktısıyla bire bir aynı (REC-521)', () => {
    for (const [ad, metin] of Object.entries(uretici.uretKurallar())) {
      const yol = path.join(KOK, 'docs', 'roller', uretici.kuralDosyaAdi(ad))
      expect(fs.existsSync(yol), `${yol} yok — node scripts/belge/rol-karti-uret.cjs --yaz`).toBe(true)
      expect(fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n'), `${ad} kurallar dosyası üreticiden sapmış`).toBe(metin)
    }
  })

  it('docs/roller/ içinde üreticinin bilmediği kart ya da kurallar dosyası yok', () => {
    const disk = fs.readdirSync(path.join(KOK, 'docs', 'roller')).filter((f) => f.endsWith('.md'))
    const beklenen = [
      ...Object.keys(uretilen).map((ad) => uretici.dosyaAdi(ad)),
      ...Object.keys(uretilen).map((ad) => uretici.kuralDosyaAdi(ad)),
      ...Object.keys(uretici.uretGorevler()).map((ad) => uretici.gorevDosyaAdi(ad)),
      uretici.SAHIPLIK_BELGESI,
    ]
    expect(disk.sort()).toEqual(beklenen.sort())
  })

  // Gerekçe (OPS şartı, REC-503; kök çözüm REC-521): sınır 4096 → 6656 ve bir daha gevşetilmez. Kural özetleri
  // kurallar dosyalarına taşındı, en büyük kart ~4,9 KB. Karta yeni bölüm eklerken aşılırsa ayrıntı dosyaya taşınır.
  // Yumuşak kanarya: REC-521'de %80'di (en büyük kart 4,96 KB). REC-522'de altı yeni kart geldi; rol içeriği eski
  // kartlardan uzun (1,2-1,9 KB, eskiler 0,7-1,2 KB) ve doğrulanmış olgu taşıyor, en büyük kart 5,7 KB oldu → %90.
  // 2026-10-01 (HRT-5): yumuşak kanarya %90 → %92. Sebep (ölçüldü): karar 224 onay satırı ortak bloğa girdi;
  // en büyük kart (SATIS) 5834 → 6074 B (satır kapı eşlemesini de söylüyor). Ayrıntı fleet-mechanism §17 Kural 4'te.
  // 2026-10-01 (HRT-2, #1609): %92 → %94. Sebep (ölçüldü): Kanban geçişi ortak bloğa 94 B ekledi (SATIS 6074 → 6168 B,
  // eşik %92 = 6123); yeni eşik 6257 B (pay 89 B). SERT sınır (6656) aynı kaldı; yeni bölüm gerekirse ayrıntı dosyaya
  // taşınır, cümleler önce kısaltılır.
  // 2026-10-01 (HRT-6/HRT-9): %94 → %97. Sebep (ölçüldü): Recep tablo kuralı (yalnız kendi kartların, elzem hatırlatma,
  // tur sonu) ve tarihli DURUM satırı (zarar tanımı + kapılar değişmez) ortak bloğa girdi; SATIS 6168 → ~6,4 KB
  // (bağımsız okuyucu ölçümü: ortak bloktan ~66 B kısaltıldı, ~312 B eklendi; sonra ~40 B daha kısaltıldı: SATIS 6453 B).
  // Eşik %97 = 6456 B (pay 3 B); sert sınır 6656 (pay 203 B). Bundan sonra yeni ortak satır eklenemez: ya ayrıntı
  // kurallar dosyasına/cetvele taşınır ya da ortak bloktan eşit bayt çıkarılır (kanarya artık yalnız son uyarıdır).
  // 2026-10-01 (HRT-10): %97 → %99. Sebep (ölçüldü): Recep'in iki yeni kuralı (başka pencereden gelen turda cevap o pencereye;
  // bekleme ifadesi adsız) ortak bloğa girdi; ortak bloktan ~100 B kısaltılmasına rağmen net +126 B: SATIS 6453 → 6579 B (%98,8; bağımsız okuyucu bulguları sonrası "sırası belli işe geç" ve "Recep'e giden" geri geldi).
  // Eşik %99 = 6589 B (pay 10 B); sert sınır 6656 aynı. Kalıcı çözüm HRT-11: ortak blok ayrıntıları kurallar dosyasına taşınır.
  // 2026-10-01 (HRT-11): %99 → %94 (HRT-6/9 öncesi eşik geri geldi). Recep mesaj kurallarının ayrıntısı her rolün
  // `<ROL>-kurallar.md` dosyasına taşındı (RECEP_MESAJ_KURALLARI), kartta tek satırlık işaretçi kaldı: SATIS 6579 → 6171 B
  // (%92,7; eşik %94 = 6257 B, pay 86 B). Yeni Recep kuralı artık kurallar dosyasına eklenir, karta değil.
  // SERT sınır (KART_BAYT_SINIRI 6656) gevşetilmedi.
  it('her kart bayt sınırının altında ve kural taşımayan çekirdek kalır (en büyük kart sınırın %94\'ünde)', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(Buffer.byteLength(metin, 'utf8'), `${ad}`).toBeLessThanOrEqual(uretici.KART_BAYT_SINIRI)
      expect(metin, `${ad} kartında kural özet satırı olmamalı (kurallar dosyasında)`).not.toMatch(/^- K\d+ [^;\n]+: /m)
    }
    const enBuyuk = Math.max(...Object.values(uretilen).map((m) => Buffer.byteLength(m, 'utf8')))
    expect(enBuyuk).toBeLessThanOrEqual(uretici.KART_BAYT_SINIRI * 0.94)
  })

  it('Çalışma düzeni bloğu her kartta bire bir aynı ve pano kanıt kuralını taşır (ARAÇ ölçümü: 62 kartın 45\'inde kanıt yok)', () => {
    const blok = (m: string) => m.slice(m.indexOf('## Çalışma düzeni')).trimEnd()
    const ilki = blok(Object.values(uretilen)[0])
    expect(ilki).toContain('Pano kartı açılırken kanıt zorunlu')
    expect(ilki).toContain('`command`')
    expect(ilki).toContain('`file_matches`')
    for (const [ad, metin] of Object.entries(uretilen)) expect(blok(metin), ad).toBe(ilki)
  })

  it('İletişim bloğu: istisna yalnız OPS için, diğer kartlarda bire bir aynı', () => {
    expect(Object.keys(uretici.ILETISIM_ISTISNA)).toEqual(['OPS'])
    const blok = (m: string) => m.slice(m.indexOf('## İletişim'), m.indexOf('## Çalışma düzeni')).trimEnd()
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(blok(metin), ad).toBe(uretici.ILETISIM_ISTISNA[ad] ?? uretici.ILETISIM)
    }
    expect(blok(uretilen.OPS)).toContain('konsolide tabloyla ben veririm')
    expect(blok(uretilen.ARAC)).toContain('yalnız iş bitince')
  })

  it('Yönetim bloğu (karar 201, REC-518): istisna yalnız OPS için, diğer kartlarda bire bir aynı ve Görev\'in hemen altında', () => {
    expect(Object.keys(uretici.YONETIM_ISTISNA)).toEqual(['OPS'])
    // Verisi olan rolde (OPS-27) Yönetim bloğunu "## Amaç" izler; blok o başlıkta ya da yoksa "## Dosyalar"da biter.
    const son = (m: string) => (m.includes('## Amaç') ? m.indexOf('## Amaç') : m.indexOf('## Dosyalar'))
    const blok = (m: string) => m.slice(m.indexOf('## Yönetim (karar 201)'), son(m)).trimEnd()
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin.indexOf('## Görev'), ad).toBeLessThan(metin.indexOf('## Yönetim (karar 201)'))
      expect(blok(metin), ad).toBe(uretici.YONETIM_ISTISNA[ad] ?? uretici.YONETIM)
    }
    // Model içeriği: pencere müdür, çalışan türleri, bağımsız doğrulama, eşzamanlı sınır yok, cetvel atfı.
    expect(uretici.YONETIM).toContain('müdürüsün')
    for (const tur of ['araştırmacı', 'uygulayıcı', 'çürütücü', 'doğrulayıcı']) expect(uretici.YONETIM).toContain(tur)
    expect(uretici.YONETIM).toContain('Eşzamanlı çalışan sınırı yok')
    // OPS istisnası: şirket yönetimi + kendi işlerinde de müdür (OPS onayı 2026-09-30).
    expect(uretilen.OPS).toContain('Kendi işlerimde (ölçüm, denetim, kayıt temizliği) ben de müdürüm')
    expect(uretilen.OPS).not.toContain('Sen bu işin müdürüsün')
  })

  it('Yönetim bloğunun cetvel atfı gerçek: execution-method-standard.md "10. MÜDÜR MODELİ" bölümünü taşır', () => {
    const cetvel = fs.readFileSync(path.join(KOK, 'docs', 'standards', 'execution-method-standard.md'), 'utf8')
    expect(uretici.YONETIM).toContain('docs/standards/execution-method-standard.md')
    expect(cetvel).toContain('## 10. MÜDÜR MODELİ (§Müdür)')
    for (const alt of ['### 10.1 Roller', '### 10.2 Müdürün altı adımı', '### 10.3 Çalışan türleri', '### 10.4 Sınırlar']) expect(cetvel).toContain(alt)
  })

  it('AYIRT EDİCİLİK: Yönetim bloğu silinen ya da değişen kart, OPS\'a konan ortak blok yakalanır', () => {
    const silinmis = { ...uretilen, URUN: uretilen.URUN.replace(uretici.YONETIM, '') }
    expect(uretici.sorunlar(silinmis).some((s) => s.startsWith('URUN: ortak blok') || s.startsWith('URUN: başlık eksik'))).toBe(true)
    const degismis = { ...uretilen, ADMIN: uretilen.ADMIN.replace('Elle yalnız küçük tek dosya', 'Elle yapabilirsin') }
    expect(uretici.sorunlar(degismis).some((s) => s.startsWith('ADMIN: ortak blok'))).toBe(true)
    const opsOrtak = { ...uretilen, OPS: uretilen.OPS.replace(uretici.YONETIM_ISTISNA.OPS, uretici.YONETIM) }
    expect(uretici.sorunlar(opsOrtak).some((s) => s.startsWith('OPS: ortak blok'))).toBe(true)
  })

  it('OPS kartı karar kaynağı kuralını taşır (fleet §29: karara giden sayı betikten gelir, kaynak Kanban kartında)', () => {
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
      expect(metin, ad).toContain('durum mesajı TEK TABLO')
      expect(metin, ad).toContain('"Recep\'e mesaj kuralları"')
    }
    // Ayrıntı HRT-11'den beri kurallar dosyasındadır (kartın bayt payı için).
    for (const [ad, metin] of Object.entries(kuralMetinleri)) {
      expect(metin, ad).toContain('| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |')
      expect(metin, ad).toContain('2+ kalem madde işaretli liste olur')
      expect(metin, ad).toContain('cevabın sonuna 3 maddelik liste')
      expect(metin, ad).toContain('kopyalanabilir `/compact')
      expect(metin, ad).toContain('Kırmızı · Onayında · Sürüyor · Sırada · Başlamadı · Beklemede · Bitti')
      expect(metin, ad).toContain('"Onayında" yalnız Recep kararı bekleyen iştir')
      expect(metin, ad).toContain('Kaydı olmayan iş satıra yazılmaz, önce Kanban kartı açılır')
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

  it('karar 219: her kartta PR gövdesi `Kanban: <numara>` taşır, geçiş penceresinde Fixes de kabul, istisna yalnız Kayıtsız: <sebep>', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('PR gövdesi `Kanban: <numara>`')
      expect(metin, ad).toContain('`Fixes REC-nn` de kabul')
      expect(metin, ad).toContain('`Kayıtsız: <sebep>`')
    }
  })

  it('karar 219/220: hiçbir kart Linear\'ı iş kaydı olarak şart koşmaz; numara biçimi <KISA AD>-<sayı>', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('`<KISA AD>-<sayı>`')
      expect(metin, ad).not.toContain('Linear kaydı (REC-nn)')
      expect(metin, ad).not.toContain('iş durumu için Linear')
      // Okuyucu bulgusu (10-01): iki literal dizge yetmez; "Linear'da kayıt/bağlantı" biçimindeki her cümle yasak.
      // Meşru cümleler (Linear donuktur, Linear'a yeni iş kaydı açılmaz, MARKA Design istisnası) bu desene girmez.
      expect(metin, ad).not.toMatch(/Linear'?(da|a|ı|'dan|dan)?\s*(kayd|kayıt|bağlant)/i)
      expect(metin, ad).not.toContain('<DEPARTMAN>-')
    }
  })

  it('numara biçimi kolu ayırt edici: eski kalıplar bozuk kopyada yakalanır', () => {
    const bozukOrnekler = ["Her iş Linear'da kayıt açılır (REC-nn).", 'No: REC Linear bağlantısı', 'kart (`<DEPARTMAN>-<sayı>`)']
    const yakalar = (m: string) => /Linear'?(da|a|ı|'dan|dan)?\s*(kayd|kayıt|bağlant)/i.test(m) || m.includes('<DEPARTMAN>-')
    for (const o of bozukOrnekler) expect(yakalar(o), o).toBe(true)
    for (const ad of Object.keys(uretilen)) expect(yakalar(uretilen[ad]), ad).toBe(false)
  })

  it('karar 224: her kart canlı dışı onay yolunu (OPS) ve aktarım yetkisinin yalnız OPS\'ta olduğunu taşır; OPS kartı genel müdür', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('Kapılar 1-5 Recep\'te kalır')
      expect(metin, ad).toContain('onayı Recep yalnız OPS penceresinde verir')
      expect(metin, ad).toContain('aktarım yalnız OPS')
      expect(metin, ad).toContain('§17 Kural 4')
      expect(metin, ad).toContain('OPS uygular')
      expect(metin, ad).not.toContain('Recep teyidi bekliyor')
    }
    expect(uretilen.OPS).toContain('genel müdürü')
    expect(uretilen.URUN).not.toContain('genel müdürü')
  })

  it('HRT-6/HRT-9: her kart Recep tablosunu yalnız kendi Kanban kartlarıyla sınırlar, tur sonunu soru bırakmaz ve tarihli DURUM bağlamını taşır', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('yalnız KENDİ kartların')
      expect(metin, ad).toMatch(/DURUM \(2026-10-01, OPS günceller\): şirket kurulmadı, gerçek satış yok/)
      expect(metin, ad).toContain('"ilk satıştan önce" etiketi')
      expect(metin, ad).toContain('BUGÜN zarar sayılır')
      expect(metin, ad).toContain('sır/gizlilik sızıntısı, ödeme riski')
      expect(metin, ad).toContain('Recep\'e karar gitmez; kapılar değişmez')
      expect(metin, ad).toContain('(OPS hariç) yalnız KENDİ kartların')
    }
    for (const [ad, metin] of Object.entries(kuralMetinleri)) {
      expect(metin, ad).toContain('çok elzemse tablo dışında tek cümle hatırlat')
      expect(metin, ad).toContain('Tur sonunda "devam edeyim mi" sorma, sırası belli işe geç; tıkanırsan OPS\'a yaz')
    }
  })

  it('HRT-10/HRT-11: kartta başka pencereden gelen tur kuralı kısa durur; ayrıntı (bekleme ifadesi adsız, değişen yoksa tablo yok) her kurallar dosyasında', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(metin, ad).toContain('başka pencereden gelen turda cevap o pencereye SendMessage ile gider')
      expect(metin, ad).toContain('değişen yoksa tablo yok')
    }
    for (const [ad, metin] of Object.entries(kuralMetinleri)) {
      expect(metin, ad).toContain('(OPS hariç) Başka pencereden (OPS dahil) gelen mesajla açılan turda cevap o pencereye SendMessage ile gider')
      expect(metin, ad).toContain('(OPS hariç) Değişen yoksa tablo yok: Recep "devam et" dediğinde')
      expect(metin, ad).toContain("Recep'e görünen metin tek cümle, yalnız kendi kartın (değişen yoksa tablo yok)")
      expect(metin, ad).toContain('"başka bir departmanın işini bekliyor" yaz (adı/işi/sırası yok); Sorumlu = "ben" (OPS hariç)')
      expect(metin, ad).toContain("İşi kalmayan departman bunu Recep'e değil OPS'a yazar")
    }
  })

  it('HRT-14 (karar 241/243): kart planı kuralı her kurallar dosyasında (üretilen ve diskteki) bulunur, kartta değil', () => {
    const kural =
      "Plan karta yazılır (docs/standards/kart-plani-standard.md): konuyu bilmeyenin uygulayabileceği açıklıkta; işi planı yazan değil yeni açılan ekip üyesi yapar; müşteriye görünen, veritabanı ya da site yapısı planı Recep'e tek sayfa özetle OPS'tan gider; planın iskeletinin eksiksizliğini `node scripts/belge/kart-plan-kapisi.cjs --kart <NO>` ölçer."
    const linearKurali =
      "PR başlığında ve gövdesinde kapanmaması gereken Linear numarası (REC-nn) geçmez; yalnız `Kanban: <no>` satırı yazılır (Linear'a bağlı PR birleşince kayıt kendiliğinden Done olur, REC-508 böyle kapandı)."
    for (const [ad, metin] of Object.entries(kuralMetinleri)) {
      expect(metin, `${ad} (üretilen)`).toContain(kural)
      expect(metin, `${ad} (üretilen, Linear numarası kuralı)`).toContain(linearKurali)
      const disk = fs.readFileSync(path.join(KOK, 'docs', 'roller', uretici.kuralDosyaAdi(ad)), 'utf8').replace(/\r\n/g, '\n')
      expect(disk, `${ad}-kurallar.md (disk)`).toContain(kural)
      expect(disk, `${ad}-kurallar.md (disk, Linear numarası kuralı)`).toContain(linearKurali)
    }
    for (const [ad, metin] of Object.entries(uretilen)) expect(metin, `${ad} kartında olmamalı (bayt payı)`).not.toContain('kart-plani-standard.md')
  })

  it('HRT-21 (karar 251): çalışan açma kuralı her kurallar dosyasında (üretilen ve diskteki) bulunur, kartta değil', () => {
    const kural =
      'Salt-okuma çalışan (araştırmacı, çürütücü, doğrulayıcı) `Agent` aracıyla `name` VERİLMEDEN açılır: sonuç doğrudan açana döner ve yazma yasağı ancak böyle işler; yazan uygulayıcı ekip üyesi olarak `name` ile açılır (docs/standards/execution-method-standard.md §10.3).'
    for (const [ad, metin] of Object.entries(kuralMetinleri)) {
      expect(metin, `${ad} (üretilen)`).toContain(kural)
      const disk = fs.readFileSync(path.join(KOK, 'docs', 'roller', uretici.kuralDosyaAdi(ad)), 'utf8').replace(/\r\n/g, '\n')
      expect(disk, `${ad}-kurallar.md (disk)`).toContain(kural)
    }
    for (const [ad, metin] of Object.entries(uretilen)) expect(metin, `${ad} kartında olmamalı (bayt payı)`).not.toContain('Çalışan açma (karar 251)')
  })

  it('beş Recep kapısı her kartta bire bir aynı', () => {
    const blok = (m: string) => m.slice(m.indexOf('## Recep kapıları'), m.indexOf('## İletişim'))
    const ilki = blok(Object.values(uretilen)[0])
    expect(ilki.split('\n').filter((s) => /^[1-5]\. /.test(s))).toHaveLength(5)
    for (const [ad, metin] of Object.entries(uretilen)) expect(blok(metin), ad).toBe(ilki)
  })
})

describe('INV-ROL-1 — Amaç ve Düzenli görevler (OPS-27, HRT-24)', () => {
  const roller = Object.keys(uretici.ROLLER)
  const varMi = (d: string) => fs.existsSync(path.join(KOK, d))
  const oku = (d: string) => fs.readFileSync(path.join(KOK, d), 'utf8')
  const isAkislari = uretici.isAkisiMetinleri(KOK)
  const gercek = uretici.GOREVLER
  const kopya = (): Record<string, RolGorevi> => JSON.parse(JSON.stringify(gercek))

  it('gerçek veri temiz: şema geçerli, komut dosyaları var, "bağlı" kaydı depodaki gerçeğe uyuyor', () => {
    expect(uretici.gorevSorunlari(gercek, roller, varMi, oku, isAkislari)).toEqual([])
  })

  it('GEO-SEO ilk örnek: dört düzenli görev (canlı kapı, haftalık veri, aylık resmi belge, yayın öncesi liste)', () => {
    const g = gercek['GEO-SEO']
    expect(g.gorevler.map((x) => x.siklik).sort()).toEqual(['aylik', 'haftalik', 'her-dagitim', 'olay'])
    expect(g.amac.length).toBeLessThanOrEqual(uretici.AMAC_SINIRI)
    expect(g.gorevler.find((x) => x.siklik === 'her-dagitim')?.komut).toBe('scripts/seo/canli-kapi.mjs')
  })

  it('GEO-SEO kartı Amaç ve Düzenli görevler bölümünü Yönetim\'den sonra, Dosyalar\'dan önce taşır; Durum artık "Kapalı" demez', () => {
    const kart = uretici.uret()['GEO-SEO']
    const i = (b: string) => kart.indexOf(b)
    expect(i('## Yönetim (karar 201)')).toBeGreaterThan(-1)
    expect(i('## Amaç')).toBeGreaterThan(i('## Yönetim (karar 201)'))
    expect(i('## Düzenli görevler')).toBeGreaterThan(i('## Amaç'))
    expect(i('## Dosyalar')).toBeGreaterThan(i('## Düzenli görevler'))
    expect(kart).toContain('docs/roller/GEO-SEO-gorevler.md')
    expect(kart.slice(kart.indexOf('## Durum'), kart.indexOf('## Recep kapıları'))).not.toMatch(/Kapalı/)
  })

  it('verisi olmayan rolün kartında bölüm yok; eksik roller sayılır ve GEO-SEO onlar arasında değil', () => {
    const eksik = uretici.gorevEksikRoller()
    expect(eksik).not.toContain('GEO-SEO')
    expect(eksik.length).toBe(roller.length - Object.keys(gercek).length)
    for (const ad of eksik) {
      const kart = uretici.uret()[ad]
      expect(kart, `${ad} kartında veri yokken bölüm olmamalı`).not.toContain('## Düzenli görevler')
    }
  })

  it('docs/roller/<ROL>-gorevler.md üreticiyle bire bir aynı (elle düzenleme yok)', () => {
    for (const [ad, metin] of Object.entries(uretici.uretGorevler())) {
      const yol = path.join(KOK, 'docs', 'roller', uretici.gorevDosyaAdi(ad))
      expect(fs.existsSync(yol), `${yol} yok — node scripts/belge/rol-karti-uret.cjs --yaz`).toBe(true)
      expect(fs.readFileSync(yol, 'utf8').replace(/\r\n/g, '\n'), `${ad} görev dosyası üreticiden sapmış`).toBe(metin)
    }
  })

  // Kart bayt payı dar (SATIS sert sınırın %93'ünde, OPS 10-03): kart cetvele atıf yapmaz, yalnız görev dosyasının
  // yolunu verir; cetvele atıf görev dosyasında ve README haritasında durur.
  it('cetvel gerçek dosya, README haritasında satırı var, görev dosyası ona atıf yapar, kart görev dosyasını gösterir', () => {
    const cetvel = 'docs/standards/duzenli-gorevler-standard.md'
    expect(varMi(cetvel)).toBe(true)
    expect(oku('docs/README.md')).toContain('standards/duzenli-gorevler-standard.md')
    expect(uretici.uretGorevler()['GEO-SEO']).toContain(cetvel)
    expect(uretici.uret()['GEO-SEO']).toContain('docs/roller/GEO-SEO-gorevler.md')
  })

  it('AYIRT EDİCİLİK: kanıtsız "bağlı: evet" yakalanır (iş akışı var ama komutu çağırmıyor)', () => {
    const v = kopya()
    Object.assign(v['GEO-SEO'].gorevler[0], { bagli: 'evet', tetikAyrinti: '.github/workflows/e2e-smoke.yml' })
    expect(uretici.gorevSorunlari(v, roller, varMi, oku, isAkislari).join('\n')).toMatch(/bağlı: evet ama .*çağrılmıyor/)
    Object.assign(v['GEO-SEO'].gorevler[0], { tetikAyrinti: '.github/workflows/olmayan-dosya.yml' })
    expect(uretici.gorevSorunlari(v, roller, varMi, oku, isAkislari).join('\n')).toMatch(/tetik dosyası yok/)
  })

  it('AYIRT EDİCİLİK: iş akışı komutu çağırmaya başlayınca "bağlı: hayır" kaydı bayat sayılır', () => {
    const sahte = [`jobs:\n  canli:\n    steps:\n      - run: node scripts/seo/canli-kapi.mjs --taban https://venthub.com.tr`]
    expect(uretici.gorevSorunlari(gercek, roller, varMi, oku, sahte).join('\n')).toMatch(/bağlı: evet yazılmalı \(kayıt bayat\)/)
  })

  it('AYIRT EDİCİLİK: geçersiz alan, bilinmeyen rol, eksik kuracak rol, uzun amaç, taslak eşik, yok komut ve çift görev yakalanır', () => {
    const s = (f: (v: Record<string, RolGorevi>) => void) => {
      const v = kopya()
      f(v)
      return uretici.gorevSorunlari(v, roller, varMi, oku, isAkislari).join('\n')
    }
    expect(s((v) => (v['GEO-SEO'].gorevler[0].siklik = 'yarin'))).toMatch(/sıklık geçersiz/)
    expect(s((v) => (v['GEO-SEO'].gorevler[0].tetik = 'elle'))).toMatch(/tetik geçersiz/)
    expect(s((v) => (v['GEO-SEO'].gorevler[0].bagli = 'belki'))).toMatch(/bağlı alanı geçersiz/)
    expect(s((v) => (v.OLMAYANROL = v['GEO-SEO']))).toMatch(/OLMAYANROL: bilinmeyen rol/)
    expect(s((v) => delete v['GEO-SEO'].gorevler[0].baglayacak)).toMatch(/kuracak rol/)
    expect(s((v) => (v['GEO-SEO'].amac = 'a'.repeat(uretici.AMAC_SINIRI + 1)))).toMatch(/amaç .* aşıyor/)
    expect(s((v) => (v['GEO-SEO'].gorevler[1].esik = 'Eşik belli'))).toMatch(/TASLAK ile başlamalı/)
    expect(s((v) => (v['GEO-SEO'].gorevler[0].komut = 'scripts/seo/yok.mjs'))).toMatch(/komut dosyası yok/)
    expect(s((v) => (v['GEO-SEO'].gorevler[1].gorev = v['GEO-SEO'].gorevler[0].gorev))).toMatch(/aynı görev iki kez/)
    expect(s((v) => (v['GEO-SEO'].gorevler = []))).toMatch(/düzenli görev yok/)
    expect(s((v) => (v['GEO-SEO'].amac = ''))).toMatch(/amaç yok/)
    // OPS kararı 10-03: Amaç TEK cümle (kart bayt payı); ikinci cümle kapıda KIRMIZI
    expect(s((v) => (v['GEO-SEO'].amac = 'Birinci cümle. İkinci cümle.'))).toMatch(/amaç tek cümle olmalı/)
    expect(s((v) => (v['GEO-SEO'].amac = 'Tek cümle; noktalı virgülle uzar ve sonda nokta var.'))).not.toMatch(/amaç/)
  })

  it('AYIRT EDİCİLİK: kartlardan Amaç ya da Düzenli görevler bölümü silinirse kart denetimi yakalar', () => {
    const kartlar = uretici.uret()
    const bozuk = { ...kartlar, 'GEO-SEO': kartlar['GEO-SEO'].replace(/## Amaç\n[^\n]*\n\n/, '') }
    expect(uretici.sorunlar(bozuk).join('\n')).toMatch(/GEO-SEO: ## Amaç bölümü eksik/)
    const bozuk2 = { ...kartlar, 'GEO-SEO': kartlar['GEO-SEO'].replace(/## Düzenli görevler\n[^\n]*\n\n/, '') }
    expect(uretici.sorunlar(bozuk2).join('\n')).toMatch(/GEO-SEO: ## Düzenli görevler bölümü eksik/)
  })
})
