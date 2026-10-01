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
}

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
  // tur sonu) ve tarihli DURUM satırı ortak bloğa girdi; ortak bloktan ~250 B kısaltıldıktan sonra SATIS 6168 → 6414 B
  // (eşik %97 = 6456, pay 42 B; sert sınır 6656'ya 242 B). Bundan sonra yeni ortak satır eklenemez: ya ayrıntı
  // kurallar dosyasına/cetvele taşınır ya da ortak bloktan eşit bayt çıkarılır (kanarya artık yalnız son uyarıdır).
  // SERT sınır (KART_BAYT_SINIRI 6656) gevşetilmedi.
  it('her kart bayt sınırının altında ve kural taşımayan çekirdek kalır (en büyük kart sınırın %97\'sinde)', () => {
    for (const [ad, metin] of Object.entries(uretilen)) {
      expect(Buffer.byteLength(metin, 'utf8'), `${ad}`).toBeLessThanOrEqual(uretici.KART_BAYT_SINIRI)
      expect(metin, `${ad} kartında kural özet satırı olmamalı (kurallar dosyasında)`).not.toMatch(/^- K\d+ [^;\n]+: /m)
    }
    const enBuyuk = Math.max(...Object.values(uretilen).map((m) => Buffer.byteLength(m, 'utf8')))
    expect(enBuyuk).toBeLessThanOrEqual(uretici.KART_BAYT_SINIRI * 0.97)
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
    const blok = (m: string) => m.slice(m.indexOf('## Yönetim (karar 201)'), m.indexOf('## Dosyalar')).trimEnd()
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
      expect(metin, ad).toContain('Yukarıdaki 1-5. kapılar Recep\'te kalır')
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
      expect(metin, ad).toContain('yalnız KENDİ Kanban kartlarını içerir')
      expect(metin, ad).toContain('çok elzemse tablo dışında tek cümle hatırlat')
      expect(metin, ad).toContain('tur sonunda "devam edeyim mi" sorma')
      expect(metin, ad).toMatch(/DURUM \(2026-10-01, OPS günceller\): şirket kurulmadı, gerçek satış yok/)
      expect(metin, ad).toContain('"ilk satıştan önce" etiketi')
    }
  })

  it('beş Recep kapısı her kartta bire bir aynı', () => {
    const blok = (m: string) => m.slice(m.indexOf('## Recep kapıları'), m.indexOf('## İletişim'))
    const ilki = blok(Object.values(uretilen)[0])
    expect(ilki.split('\n').filter((s) => /^[1-5]\. /.test(s))).toHaveLength(5)
    for (const [ad, metin] of Object.entries(uretilen)) expect(blok(metin), ad).toBe(ilki)
  })
})
