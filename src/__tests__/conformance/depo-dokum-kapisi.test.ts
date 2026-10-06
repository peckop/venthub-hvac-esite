import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import type { IzinKaydi } from './depo-dokum-kapisi.yardimci'
import { BEKLENEN_GENEL, BEKLENEN_HASSAS_TABLOLAR, BEKLENEN_KISISEL, BEKLENEN_KISISEL_EK, BOM, CI_YOLU, geciciDizin, geciciTemizle, git, GITIGNORE_YOLU, GIZLI_AD, GIZLI_ADRES, GIZLI_BIN, GIZLI_EPOSTA, GIZLI_FIYAT, GIZLI_SON4, kapi, kapiyiKos, KOK, kurallar, sahteDepo, TABAN_YOLU, temizOrtam } from './depo-dokum-kapisi.yardimci'

/**
 * INV-DEPO-DOKUM-1 · Veritabanı dökümü, kişisel veri, ödeme parçası ve fiyat/maliyet listesi HERKESE AÇIK
 * depoya girmesin (ALT-39).
 *
 * Cetvel: `docs/standards/depoya-giremeyecek-veri-standard.md`.
 * Kapı:   `scripts/security/depo-dokum-kapisi.cjs` (saf fonksiyonlar + CLI).
 *
 * TETİK: izlenen tüm json/jsonl/ndjson/csv/tsv/sql dosyaları ve izlenen yollar (ağaç kipi); itilecek nesneler
 *        (`--yeni-nesneler`, `--pre-push`; sonradan silinenler dahil); PR'da ara commit'ler. Kapı DEĞİŞİKLİĞİN
 *        KENDİSİYLE tetiklenir; cron ya da gözcü değildir.
 * YER:   PR + master push (`ci` işi, Install adımından ÖNCE: 'Döküm kapısı (depoya giremeyecek veri)') ve
 *        `.githooks/pre-push`. ⚠DÜRÜST SINIR: CI master'a BİRLEŞMEYİ durdurur; ağa çıkışı yalnız pre-push yakalar ve
 *        `--no-verify` ile atlanabilir. CI'da önceki adım kırmızıysa kapı koşmaz ("her koşuda" iddiası yoktur).
 * DOĞUŞ OLAYI: geçmişte depoya bir veri dökümü girmişti; depo sonradan herkese açık oldu ve hiçbir kapı görmedi
 *        (secret-scan.py yalnız anahtar imzası arar). 10-05'te dış denetim, 10-06'da ölçüm çıkardı.
 *
 * ── NE ÖLÇER ────────────────────────────────────────────────────────────────────────────────
 *  (i)   KURAL KOLLARI: her kural (R1 kişisel alan, R2 SQL veri ifadesi, R3 fiyat/maliyet dökümü, R4 yol, R5 ödeme
 *        parçası, R6 ikili veritabanı) için KIRMIZI ve TEMİZ kol; yalnız CREATE TABLE içeren migration GEÇER,
 *        INSERT'li kişisel alan KIRMIZIDIR. Uçtan uca kollar geçici dizinde kurulan SAHTE git deposunda koşar; kapı
 *        DEĞER BASMAZ (kolların hepsi sahte işaretçi değerlerin çıktıda GEÇMEDİĞİNİ ölçer).
 *  (ii)  GERÇEK AĞAÇ TARAMASI YEŞİL (ve boş evren değil).
 *  (iii) YENİ NESNELER: sonradan silinen dosya, PR ara commit'i, pre-push stdin'i, tavan aşımı (bulgu 1).
 *  (iv)  CI BAĞLAMA: adım var, Install'dan önce, `if:`/`continue-on-error`/`working-directory`/`shell`/`env` yok
 *        (bulgu 7, E). AYIRT EDİCİ: her yasak ayrı kolda kırmızı verir.
 *  (v)   `.gitignore` kalıpları, şema tabanı kapsamı (bulgu 2), İZİN LİSTESİ sınırı.
 *
 * ⚠Bu test hiçbir yerde gerçek değer taşımaz: tüm örnekler uydurma işaretçilerdir.
 */

afterAll(geciciTemizle)

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · kapının kendi sözleşmesi', () => {
  it('belirgin kişisel alanlar (tam küme) BEKLENEN listeyle aynı: ilk beşi sipariş kolonları (biri düşerse kırmızı)', () => {
    expect([...kapi.KISISEL_ALANLAR].slice(0, 5)).toEqual(BEKLENEN_KISISEL)
    expect([...kapi.KISISEL_ALANLAR]).toEqual([...BEKLENEN_KISISEL, ...BEKLENEN_KISISEL_EK])
  })

  it('genel kişisel alanlar, hassas tablolar ve eşikler BEKLENEN değerlerle aynı', () => {
    expect([...kapi.KISISEL_GENEL_ALANLAR]).toEqual(BEKLENEN_GENEL)
    expect([...kapi.HASSAS_TABLOLAR]).toEqual(BEKLENEN_HASSAS_TABLOLAR)
    expect(kapi.KISISEL_ESIK).toBe(3)
    expect(kapi.FIYAT_ESIGI).toBe(5)
  })

  it('kural kimlikleri R1..R6', () => {
    expect(Object.keys(kapi.KURALLAR)).toEqual(['R1', 'R2', 'R3', 'R4', 'R5', 'R6'])
  })

  it('taranan uzantılar: json/jsonl/ndjson/csv/tsv/sql', () => {
    expect([...kapi.VERI_UZANTILARI].sort()).toEqual(['csv', 'json', 'jsonl', 'ndjson', 'sql', 'tsv'])
  })

  it('R4 yol kalıpları BEKLENEN adlarla aynı (sıkıştırılmış/arşiv/ikili uzantılar dahil)', () => {
    expect(kapi.YOL_KURALLARI.map((r) => r.ad)).toEqual([
      'db-backup',
      'pg_dump',
      '.dump',
      '.sql.gz',
      '.sql.dump',
      '.gz',
      '.zip',
      '.tar',
      '.tgz',
      '.zst',
      '.xz',
      '.bz2',
      '.7z',
      '.rar',
      '.backup',
      '.pgdump',
      '.xlsx',
      '.xls',
      '.har',
      'toc.dat',
    ])
  })

  it('izin listesi yalnız R3, R5 ve R6 kurallarına açık (R1/R2/R4 ASLA)', () => {
    expect([...kapi.IZIN_KURALLARI]).toEqual(['R3', 'R5', 'R6'])
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · şema tabanı kapsamı (bulgu 2): sözlük tabanı OKUYARAK doğrulanır', () => {
  // Liste testte AÇIK; taban okunur. Kolon tabandan silinirse ya da sözlükten düşerse kırmızı.
  const KISISEL_KOLONLAR: Record<string, string[]> = {
    user_profiles: ['full_name', 'phone'],
    contact_messages: ['email', 'phone', 'ip_address'],
    suppliers: ['tax_no', 'contact_name', 'email', 'phone'],
    user_addresses: ['address_line', 'postal_code', 'full_name', 'phone', 'full_address', 'street_address'],
    user_invoice_profiles: ['tax_number', 'tax_office', 'first_name', 'last_name', 'address_line', 'postal_code'],
    venthub_orders: ['customer_name', 'customer_email', 'customer_phone', 'shipping_address', 'billing_address', 'invoice_info'],
  }
  /** Bilerek sözlük dışı (aşırı genel ad: yanlış alarm üretir); cetvel bölüm 8'de adıyla yazılı. */
  const BILEREK_DISARIDA: Record<string, string[]> = {
    contact_messages: ['name', 'company', 'city'],
    suppliers: ['name'],
    user_addresses: ['district', 'city'],
    user_invoice_profiles: ['company_name', 'district', 'city'],
  }

  function tabanKolonlari(): Map<string, Set<string>> {
    const satirlar = fs.readFileSync(TABAN_YOLU, 'utf8').split(/\r?\n/)
    const tablolar = new Map<string, Set<string>>()
    satirlar.forEach((s, i) => {
      const m = /^CREATE TABLE IF NOT EXISTS "public"\."([a-z_0-9]+)" \($/.exec(s)
      if (!m) return
      const kol = new Set<string>()
      for (let j = i + 1; j < satirlar.length && !/^\);/.test(satirlar[j]); j++) {
        const k = /^\s+"([a-z_0-9]+)"\s/.exec(satirlar[j])
        if (k) kol.add(k[1])
      }
      tablolar.set(m[1], kol)
    })
    return tablolar
  }

  const sozluk = (): Set<string> => new Set([...kapi.KISISEL_ALANLAR, ...kapi.KISISEL_GENEL_ALANLAR].map(kapi.norm))

  it('taban okundu ve hassas tabloların hepsi tabanda VAR (kanarya)', () => {
    const t = tabanKolonlari()
    expect(t.size).toBeGreaterThan(30)
    for (const tablo of kapi.HASSAS_TABLOLAR) expect(t.has(tablo), `${tablo} tabanda yok`).toBe(true)
  })

  it.each(Object.entries(KISISEL_KOLONLAR))('%s: listelenen kişisel kolonlar tabanda VAR ve sözlük hepsini KAPSIYOR', (tablo, kolonlar) => {
    const kol = tabanKolonlari().get(tablo)
    expect(kol, `${tablo} tabanda yok`).toBeDefined()
    const s = sozluk()
    for (const k of kolonlar) {
      expect(kol?.has(k), `${tablo}.${k} tabanda yok`).toBe(true)
      expect(s.has(kapi.norm(k)), `${tablo}.${k} sözlükte yok`).toBe(true)
    }
  })

  it('bilerek dışarıda bırakılan genel adlar da tabanda VAR ve sözlükte YOK (liste dürüst)', () => {
    const t = tabanKolonlari()
    const s = sozluk()
    for (const [tablo, kolonlar] of Object.entries(BILEREK_DISARIDA)) {
      for (const k of kolonlar) {
        expect(t.get(tablo)?.has(k), `${tablo}.${k} tabanda yok`).toBe(true)
        expect(s.has(kapi.norm(k)), `${tablo}.${k} artık sözlükte: listeden çıkar`).toBe(false)
      }
    }
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · R1 kişisel alan adı DOLU değerle (JSON/JSONL/CSV/TSV)', () => {
  it.each(BEKLENEN_KISISEL)('JSON: %s dolu → R1 KIRMIZI', (alan) => {
    const metin = JSON.stringify([{ id: 'x', [alan]: GIZLI_EPOSTA }])
    expect(kurallar('veri.json', metin)).toEqual(['R1'])
  })

  it.each(BEKLENEN_KISISEL_EK)('JSON: belirgin ek alan %s tek dolu satırda bile R1 KIRMIZI', (alan) => {
    expect(kurallar('veri.json', JSON.stringify({ [alan]: 'dolu-deger' }))).toEqual(['R1'])
  })

  it('JSON: iç içe nesne ve dizi içinde de yakalanır', () => {
    expect(kurallar('a.json', JSON.stringify({ veri: { siparisler: [{ musteri: { customer_phone: '+90 555 000 00 00' } }] } }))).toEqual(['R1'])
  })

  it('JSON: adres NESNESİ dolu yaprak taşıyorsa kırmızı', () => {
    const metin = JSON.stringify({ billing_address: { city: '', fullAddress: GIZLI_ADRES } })
    expect(kurallar('a.json', metin)).toEqual(['R1'])
  })

  it('JSON: camelCase ve büyük harf sürümü de aynı alandır', () => {
    expect(kurallar('a.json', JSON.stringify({ customerEmail: GIZLI_EPOSTA }))).toEqual(['R1'])
    expect(kurallar('a.json', JSON.stringify({ CUSTOMER_NAME: GIZLI_AD }))).toEqual(['R1'])
  })

  it.each([
    ['boş dize', { customer_email: '' }],
    ['yalnız boşluk', { customer_email: '   ' }],
    ['null', { customer_phone: null }],
    ['boş nesne', { billing_address: {} }],
    ['boş yapraklı nesne', { shipping_address: { city: '', district: '', fullAddress: '' } }],
    ['boş dizi', { customer_name: [] }],
  ])('JSON TEMİZ: %s', (_ad, nesne) => {
    expect(kurallar('a.json', JSON.stringify([nesne]))).toEqual([])
  })

  it('JSON TEMİZ: şemada yalnız ad geçmesi (alan adı başka anahtar altında değer değil)', () => {
    expect(kurallar('a.json', JSON.stringify({ aciklama: 'customer_email alanı', alanlar: ['customer_email'] }))).toEqual([])
  })

  it('JSONL: bir satırda dolu alan → R1', () => {
    const metin = [JSON.stringify({ id: 1 }), JSON.stringify({ id: 2, customer_email: GIZLI_EPOSTA })].join('\n')
    expect(kurallar('d.jsonl', metin)).toEqual(['R1'])
    expect(kurallar('d.ndjson', metin)).toEqual(['R1'])
  })

  it('JSONC (yorum + sondaki virgül) ayrıştırılır: dolu alan R1, boş alan temiz', () => {
    const jsonc = `// yorum satırı JSON'u bozar\n{ "customer_email": "${GIZLI_EPOSTA}", /* blok */ }`
    expect(kurallar('a.json', jsonc)).toEqual(['R1'])
    expect(kurallar('a.json', '// yorum\n{ "customer_email": "" }')).toEqual([])
    expect(kapi.dosyaDegerlendir('a.json', jsonc).olculemedi).toEqual([])
  })

  it('JSON dizgisinin İÇİNDEKİ // yorum sayılmaz (URL bozulmaz)', () => {
    const jsonc = '// not\n{ "adres": "https://ornek.test/x", "customer_email": "dolu@ornek.test", }'
    expect(kurallar('a.json', jsonc)).toEqual(['R1'])
  })

  it('JSONC: baştaki yorumda { ve [ geçse bile ayrıştırılır (yorum-duyarlı aşama, çöp-kırpma aşamasından ÖNCE denenir)', () => {
    // Çöp-kırpma aşaması ilk `{` ya da `[`'den başlar ve bu yorumun içindekini yakalar; yalnız yorum-duyarlı aşama doğru çözer.
    const jsonc = `// örnek { eski } [x]\n{ "customer_email": "${GIZLI_EPOSTA}", }`
    expect(kurallar('a.json', jsonc)).toEqual(['R1'])
    expect(kapi.dosyaDegerlendir('a.json', jsonc).olculemedi).toEqual([])
  })

  // ── genel alanlar: ≥3 dolu satır eşiği (bulgu 2) ──────────────────────────────────────────
  it.each(BEKLENEN_GENEL)('genel alan %s: 3 dolu nesnede R1 KIRMIZI, 2 dolu nesnede TEMİZ', (alan) => {
    const n = (k: number) => JSON.stringify(Array.from({ length: k }, (_, i) => ({ id: `u${i}`, [alan]: `deger${i}` })))
    expect(kurallar('kullanicilar.json', n(3))).toEqual(['R1'])
    expect(kurallar('kullanicilar.json', n(2))).toEqual([])
  })

  it('genel alan: yönetici dışa aktarım başlığı (id,email,full_name,role,created_at) 3 satırla R1', () => {
    const csv = `id,email,full_name,role,created_at\n1,a@ornek.test,Ad Bir,admin,2026-01-01\n2,b@ornek.test,Ad Iki,user,2026-01-02\n3,c@ornek.test,Ad Uc,user,2026-01-03\n`
    expect(kurallar('kullanicilar.csv', csv)).toEqual(['R1'])
    const iki = `id,email,full_name\n1,a@ornek.test,Ad Bir\n2,b@ornek.test,Ad Iki\n`
    expect(kurallar('kullanicilar.csv', iki)).toEqual([])
  })

  it('genel alan: i18n sözlüğü gibi tek etiketli JSON TEMİZ (yanlış alarm yok)', () => {
    expect(kurallar('tr.json', JSON.stringify({ email: 'E-posta', full_name: 'Ad Soyad', phone: 'Telefon' }))).toEqual([])
  })

  it('CSV: başlıkta kişisel alan + en az bir DOLU satır → R1', () => {
    expect(kurallar('d.csv', `id,customer_email\n1,${GIZLI_EPOSTA}\n`)).toEqual(['R1'])
  })

  it('CSV TEMİZ: başlık var ama sütun hep boş', () => {
    expect(kurallar('d.csv', 'id,customer_email\n1,\n2,   \n')).toEqual([])
  })

  it('CSV TEMİZ: yalnız başlık satırı', () => {
    expect(kurallar('d.csv', 'id,customer_email,customer_phone\n')).toEqual([])
  })

  it('CSV: noktalı virgül ayraç, tırnaklı başlık, BOM, CRLF', () => {
    const metin = `${BOM}"id";"Customer_Name"\r\n1;"${GIZLI_AD}"\r\n`
    expect(kurallar('d.csv', metin)).toEqual(['R1'])
  })

  it('TSV: sekme ayraçlı dolu satır → R1', () => {
    expect(kurallar('d.tsv', `id\tbilling_address\n1\t${GIZLI_ADRES}\n`)).toEqual(['R1'])
  })

  it('CSV: hücre içindeki ayraç, tırnak kaçışı ve satır sonu ayrıştırmayı bozmaz', () => {
    const satirlar = kapi.csvAyristir('a,b\n"x,1","y ""q"" \nz"\n', ',')
    expect(satirlar).toEqual([
      ['a', 'b'],
      ['x,1', 'y "q" \nz'],
    ])
  })

  it('uzantısı veri olmayan dosya (md, ts) içerik taramasına GİRMEZ', () => {
    expect(kurallar('notlar.md', `"customer_email": "${GIZLI_EPOSTA}"`)).toEqual([])
    expect(kurallar('x.ts', `const o = { "customer_email": "${GIZLI_EPOSTA}" }`)).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · ölçülemedi: başlıksız CSV/TSV, ayrıştırılamayan veri dosyası (bulgu 4b)', () => {
  const olc = (yol: string, metin: string): string[] => kapi.dosyaDegerlendir(yol, metin).olculemedi

  it.each([
    ['e-posta', `${GIZLI_EPOSTA},Ad,5\nb@ornek.test,Ad2,6\n`],
    ['UUID', `123e4567-e89b-42d3-a456-426614174000,Ad\n123e4567-e89b-42d3-a456-426614174001,Ad2\n`],
    ['saf sayı', `1234,Ad,Soyad\n1235,Ad2,Soyad2\n`],
    ['üç sayısal hücre', `10,20,30\n11,21,31\n`],
  ])('başlıksız CSV (ilk satır veri gibi: %s) → ölçülemedi', (_ad, csv) => {
    expect(olc('d.csv', csv).length).toBe(1)
    expect(olc('d.tsv', csv.replace(/,/g, '\t')).length).toBe(1)
  })

  it('başlıklı CSV ölçülür (ölçülemedi yok)', () => {
    expect(olc('d.csv', 'ad,soyad,yas\nA,B,5\n')).toEqual([])
  })

  it('ayrıştırılamayan JSON → ölçülemedi + HAM METİN taraması: her tırnak/büyük-küçük/ayraç biçimi', () => {
    const bozuk = `{ ${'"'}musteri${'"'}: ,,, "customerEmail": "${GIZLI_EPOSTA}"`
    const d = kapi.dosyaDegerlendir('a.json', bozuk)
    expect(d.olculemedi.length).toBe(1)
    expect(d.bulgular.map((b) => b.kural)).toEqual(['R1'])
    const tekTirnak = kapi.dosyaDegerlendir('a.json', `{ ,,, 'Customer-Email': '${GIZLI_EPOSTA}'`)
    expect(tekTirnak.bulgular.map((b) => b.kural)).toEqual(['R1'])
    const tirnaksiz = kapi.dosyaDegerlendir('a.json', `{ ,,, customer_phone: "0555"`)
    expect(tirnaksiz.bulgular.map((b) => b.kural)).toEqual(['R1'])
  })

  it('ayrıştırılamayan JSON: boş değer temiz ama YİNE ölçülemedi (sessiz geçmez)', () => {
    const d = kapi.dosyaDegerlendir('a.json', '{ ,,, "customer_email": ""')
    expect(d.bulgular).toEqual([])
    expect(d.olculemedi.length).toBe(1)
  })

  it('ayrıştırılamayan JSON: genel alan 3+ ham eşleşmede R1, 2 eşleşmede değil', () => {
    const ham = (k: number) => `{ ,,, ${Array.from({ length: k }, (_, i) => `"email": "x${i}@ornek.test"`).join(', ')}`
    expect(kapi.dosyaDegerlendir('a.json', ham(3)).bulgular.map((b) => b.kural)).toEqual(['R1'])
    expect(kapi.dosyaDegerlendir('a.json', ham(2)).bulgular).toEqual([])
  })

  it('ayrıştırılamayan JSON: R3 (≥5 kimlik + fiyat anahtarı) ham metinde yakalanır', () => {
    const ham = `{ ,,, ${Array.from({ length: 5 }, (_, i) => `"id": "p${i}", "unit_price": ${100 + i}`).join(', ')}`
    expect(kapi.dosyaDegerlendir('a.json', ham).bulgular.map((b) => b.kural)).toEqual(['R3'])
  })

  it('ayrıştırılamayan JSON: R5 (binNumber + lastFourDigits, sayaç değil) ham metinde yakalanır', () => {
    const ham = `{ ,,, "binNumber": "${GIZLI_BIN}", "lastFourDigits": "${GIZLI_SON4}"`
    expect(kapi.dosyaDegerlendir('a.json', ham).bulgular.map((b) => b.kural)).toEqual(['R5'])
  })

  it('çok satırlı (pretty) JSON dizisi ayrıştırılır; çok satırlı birleşik nesneler ayrıştırılamaz → ham tarama + ölçülemedi', () => {
    const birlesik = `{\n  "id": 1,\n  "customer_email": "${GIZLI_EPOSTA}"\n}\n{\n  "id": 2\n}\n`
    const d = kapi.dosyaDegerlendir('a.jsonl', birlesik)
    expect(d.olculemedi.length).toBe(1)
    expect(d.bulgular.map((b) => b.kural)).toEqual(['R1'])
  })

  it('jq akış biçimi ([[yol],değer] satırları) ayrıştırılır ve dolu kişisel alan R1', () => {
    const akis = [`[["musteri","customerEmail"],"${GIZLI_EPOSTA}"]`, '[["musteri","customerEmail"]]'].join('\n')
    expect(kurallar('akis.json', akis)).toEqual(['R1'])
  })

  it('JSONL: tek bozuk satır dosyayı ölçülemedi yapar (kalanı sessizce geçmez)', () => {
    const metin = [JSON.stringify({ id: 1 }), '{bozuk', JSON.stringify({ id: 3 })].join('\n')
    expect(kapi.dosyaDegerlendir('d.jsonl', metin).olculemedi.length).toBe(1)
  })

  it('SQL: kapanmayan dize ölçülemedi', () => {
    expect(olc('d.sql', "select 'kapanmayan;").length).toBe(1)
    expect(olc('d.sql', 'select 1;')).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · UTF-16 (bulgu 4d)', () => {
  const utf16le = (metin: string): Buffer => Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(metin, 'utf16le')])
  const utf16be = (metin: string): Buffer => {
    const g = Buffer.from(metin, 'utf16le')
    g.swap16()
    return Buffer.concat([Buffer.from([0xfe, 0xff]), g])
  }

  it('metneCevir: UTF-16LE, UTF-16BE ve UTF-8 BOM çözülür; düz UTF-8 aynen', () => {
    expect(kapi.metneCevir(utf16le('{"a": "çğş"}'))).toBe('{"a": "çğş"}')
    expect(kapi.metneCevir(utf16be('{"a": "çğş"}'))).toBe('{"a": "çğş"}')
    expect(kapi.metneCevir(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from('{"a":1}')]))).toBe('{"a":1}')
    expect(kapi.metneCevir(Buffer.from('düz'))).toBe('düz')
  })

  it('UTF-16LE JSON dosyasında dolu kişisel alan: CLI R1 KIRMIZI (PowerShell > çıktısı sessizce geçmez)', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/s.json': utf16le(JSON.stringify([{ customer_email: GIZLI_EPOSTA }])) })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/s.json')
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('UTF-16LE SQL dosyasında INSERT + kişisel alan: R2', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'seed/d.sql': utf16le(`INSERT INTO t (customer_name) VALUES ('${GIZLI_AD}');`) })
    expect(kapiyiKos(d).kod).toBe(1)
  })

  it('BOM\'suz UTF-16 (NUL baytlı) veri dosyası ölçülemedi: çıkış 2', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/s.json': Buffer.from(JSON.stringify([{ customer_email: GIZLI_EPOSTA }]), 'utf16le') })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('OLCULEMEDI')
    expect(r.cikti).toContain('veri/s.json')
  })

  it('UTF-16 gövde + tek baytlık CRLF çöpü: çözülür ve ayrıştırılır (ölçülemedi değil)', () => {
    const govde = utf16le('{"a": 1}')
    const cop = Buffer.concat([govde, Buffer.from([0x0d, 0x0a])])
    const metin = kapi.metneCevir(cop)
    expect(kapi.dosyaDegerlendir('a.json', metin).olculemedi).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · R2 SQL veri ifadesi (CREATE TABLE masum, INSERT/COPY kırmızı)', () => {
  it('TEMİZ: yalnız CREATE TABLE / ALTER / politika / indeks / yorum içeren migration', () => {
    const sql = [
      'create table public.siparisler (id uuid primary key, customer_email text, customer_phone text, billing_address jsonb);',
      'alter table public.siparisler add column customer_name text;',
      'create index siparis_eposta_idx on public.siparisler (customer_email);',
      'create policy "okuma" on public.siparisler for select using (customer_email = auth.email());',
      "comment on column public.siparisler.customer_name is 'musteri adi';",
      "-- insert into siparisler (customer_email) values ('yorum@ornek.test');",
      "/* insert into siparisler (customer_email) values ('blok@ornek.test'); */",
    ].join('\n')
    expect(kurallar('supabase/migrations/20260101000000_x.sql', sql)).toEqual([])
  })

  it('KIRMIZI: INSERT ... VALUES içinde kişisel alan', () => {
    const sql = `INSERT INTO public.siparisler (id, customer_email) VALUES (1, '${GIZLI_EPOSTA}');`
    expect(kurallar('d.sql', sql)).toEqual(['R2'])
  })

  it.each(BEKLENEN_KISISEL)('KIRMIZI: INSERT içinde %s', (alan) => {
    expect(kurallar('d.sql', `insert into t (${alan}) values ('x');`)).toEqual(['R2'])
  })

  it('KIRMIZI: COPY ... FROM stdin sütun listesinde kişisel alan', () => {
    const sql = `COPY public.siparisler (id, customer_name) FROM stdin;\n1\t${GIZLI_AD}\n\\.\n`
    expect(kurallar('d.sql', sql)).toEqual(['R2'])
  })

  it('COPY veri bloğu (kesme işaretli satır dahil) sonraki ifadeleri BOZMAZ: sonraki INSERT yine yakalanır', () => {
    const sql = [
      'COPY public.t (id, customer_name) FROM stdin;',
      "1\tO'Brien",
      '\\.',
      "INSERT INTO public.u (customer_phone) VALUES ('0555');",
    ].join('\n')
    const bulgular = kapi.dosyaTara('d.sql', sql)
    expect(bulgular.map((b) => b.kural)).toEqual(['R2', 'R2'])
  })

  it('TEMİZ: fonksiyon gövdesindeki ($$ ve $etiket$) INSERT veri DEĞİLDİR', () => {
    const sql = [
      'create function f(p_email text) returns void language plpgsql as $$',
      'begin insert into public.siparisler (customer_email) values (p_email); end $$;',
      'create function g() returns void language plpgsql as $govde$',
      "begin insert into public.siparisler (customer_name) values ('x'); end $govde$;",
    ].join('\n')
    expect(kurallar('supabase/migrations/20260101000001_fn.sql', sql)).toEqual([])
  })

  it('TEMİZ: INSERT ... SELECT (veri taşıma) VALUES taşımadığı için veri ifadesi değildir', () => {
    expect(kurallar('d.sql', 'insert into t (customer_email) select email from auth.users;')).toEqual([])
  })

  it("dize içindeki ';' ifadeyi BÖLMEZ: tek ifade, tek bulgu", () => {
    const sql = "INSERT INTO notlar (govde) VALUES ('a;b'); INSERT INTO s (customer_name) VALUES ('x');"
    expect(kapi.dosyaTara('d.sql', sql).filter((b) => b.kural === 'R2')).toHaveLength(1)
  })

  it('bulgu ayrıntısı İFADE TÜRÜ ve ALAN ADI taşır, değer taşımaz', () => {
    const [b] = kapi.dosyaTara('d.sql', `INSERT INTO t (customer_email) VALUES ('${GIZLI_EPOSTA}');`)
    expect(b.ayrinti).toContain('INSERT')
    expect(b.ayrinti).toContain('customer_email')
    expect(b.ayrinti).not.toContain('gizli.kisi')
  })

  // ── bulgu 4c: kolon listesiz INSERT / COPY → hassas tablo ──────────────────────────────────
  it.each(BEKLENEN_HASSAS_TABLOLAR)('KIRMIZI: kolon listesiz INSERT hassas tabloya (%s)', (tablo) => {
    expect(kurallar('d.sql', `INSERT INTO public.${tablo} VALUES (1, 'x', 'y');`)).toEqual(['R2'])
    expect(kurallar('d.sql', `INSERT INTO "${tablo}" VALUES (1);`)).toEqual(['R2'])
  })

  it('KIRMIZI: kolon listesiz COPY hassas tabloya', () => {
    expect(kurallar('d.sql', 'COPY public.user_profiles FROM stdin;\n1\tx\n\\.\n')).toEqual(['R2'])
  })

  it('TEMİZ: kolon listesiz INSERT hassas OLMAYAN tabloya (kategori tohumu gibi)', () => {
    expect(kurallar('d.sql', "INSERT INTO public.categories VALUES (1, 'x');")).toEqual([])
  })

  it('KIRMIZI: genel alan kolon listesinde ve ≥3 satır; 2 satırda TEMİZ', () => {
    const insert = (k: number) =>
      `INSERT INTO public.x (id, email) VALUES ${Array.from({ length: k }, (_, i) => `(${i}, 'a${i}@ornek.test')`).join(', ')};`
    expect(kurallar('d.sql', insert(3))).toEqual(['R2'])
    expect(kurallar('d.sql', insert(2))).toEqual([])
    const copy = (k: number) => `COPY public.x (id, email) FROM stdin;\n${Array.from({ length: k }, (_, i) => `${i}\ta${i}@ornek.test`).join('\n')}\n\\.\n`
    expect(kurallar('d.sql', copy(3))).toEqual(['R2'])
    expect(kurallar('d.sql', copy(2))).toEqual([])
  })

  it('SQL R3: INSERT/COPY kolon listesinde kimlik + maliyet ve ≥5 satır (pg_dump --data-only -t product_costs)', () => {
    const copy = (k: number, kol: string) =>
      `COPY public.product_costs (${kol}) FROM stdin;\n${Array.from({ length: k }, (_, i) => `p${i}\t${100 + i}`).join('\n')}\n\\.\n`
    expect(kurallar('d.sql', copy(5, 'product_id, cost_in_base'))).toEqual(['R3'])
    expect(kurallar('d.sql', copy(4, 'product_id, cost_in_base'))).toEqual([])
    expect(kurallar('d.sql', copy(5, 'product_id, notlar'))).toEqual([])
    const insert = `INSERT INTO public.fiyat (model_code, purchase_price_eur) VALUES ${Array.from({ length: 5 }, (_, i) => `('M${i}', ${10 + i})`).join(', ')};`
    expect(kurallar('d.sql', insert)).toEqual(['R3'])
  })

  it('SQL R5: kolon listesinde binNumber + lastFourDigits', () => {
    expect(kurallar('d.sql', "INSERT INTO t (id, binNumber, lastFourDigits) VALUES (1, '1', '2');")).toEqual(['R5'])
    expect(kurallar('d.sql', "INSERT INTO t (id, binNumber) VALUES (1, '1');")).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · R3 fiyat/maliyet dökümü (DB satırı imzası, eşik 5)', () => {
  const satirlar = (n: number, ek: Record<string, unknown> = {}) =>
    Array.from({ length: n }, (_, i) => ({ id: `p${i}`, sku: `S-${i}`, price: 1000 + i, ...ek }))

  it('5 nesne, her biri kimlik + pozitif fiyat → R3 KIRMIZI', () => {
    expect(kurallar('urunler.json', JSON.stringify(satirlar(5)))).toEqual(['R3'])
  })

  it('4 nesne → TEMİZ (eşik 5)', () => {
    expect(kurallar('urunler.json', JSON.stringify(satirlar(4)))).toEqual([])
  })

  it('sarmalayıcı anahtarın altındaki dizi de yakalanır (derinlik evasion değil)', () => {
    expect(kurallar('u.json', JSON.stringify({ meta: { x: 1 }, veri: { urunler: satirlar(6) } }))).toEqual(['R3'])
  })

  it('fiyat 0 ya da sayı değil ya da kimlik anahtarı yok → TEMİZ', () => {
    expect(kurallar('u.json', JSON.stringify(satirlar(8, { price: 0 })))).toEqual([])
    expect(kurallar('u.json', JSON.stringify(satirlar(8, { price: 'belirtilmedi' })))).toEqual([])
    expect(kurallar('u.json', JSON.stringify(Array.from({ length: 8 }, (_, i) => ({ ad: `a${i}`, price: 5 + i }))))).toEqual([])
  })

  it('sayısal DİZE fiyat (TR/EN biçimleri) sayılır', () => {
    expect(kurallar('u.json', JSON.stringify(satirlar(5, { price: '1.299,90' })))).toEqual(['R3'])
    expect(kurallar('u.json', JSON.stringify(satirlar(5, { price: '1,299.90' })))).toEqual(['R3'])
    expect(kapi.pozitifSayi('12,50')).toBe(true)
    expect(kapi.pozitifSayi('abc')).toBe(false)
    expect(kapi.pozitifSayi(-3)).toBe(false)
  })

  it.each(['price', 'purchase_price', 'unit_price', 'cost_in_base'])('maliyet/fiyat kolonu %s de imzadır', (kolon) => {
    const nesneler = Array.from({ length: 5 }, (_, i) => ({ product_id: `p${i}`, [kolon]: 10 + i }))
    expect(kurallar('u.json', JSON.stringify(nesneler))).toEqual(['R3'])
  })

  // ── bulgu 3: önek/sonek toleranslı eşleşme ───────────────────────────────────────────────
  it.each([
    'purchase_price_eur',
    'purchase_price_try',
    'alis_fiyati',
    'alış_fiyatı',
    'Alış Fiyatı (TL)',
    'maliyet',
    'maliyet_try',
    'cost_price',
    'last_purchase_cost',
    'net_price',
    'FİYAT',
  ])('fiyat kolonu varyantı %s (önek/sonek/para birimi eki) imzadır', (kolon) => {
    const nesneler = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}`, [kolon]: 10 + i }))
    expect(kurallar('u.json', JSON.stringify(nesneler))).toEqual(['R3'])
  })

  it.each(['model_code', 'avensair_kod', 'tedarikci_kod', 'product_sku'])('kimlik varyantı %s imzadır', (kimlik) => {
    const nesneler = Array.from({ length: 5 }, (_, i) => ({ [kimlik]: `K${i}`, price: 10 + i }))
    expect(kurallar('u.json', JSON.stringify(nesneler))).toEqual(['R3'])
  })

  it('katalog CSV başlığı (model_code;…;avensair_kod;…;purchase_price_eur) 5 dolu satırla R3', () => {
    const csv = `model_code;ad;avensair_kod;purchase_price_eur\n${Array.from({ length: 5 }, (_, i) => `M${i};Ad${i};A${i};${10 + i},50`).join('\n')}\n`
    expect(kurallar('katalog.csv', csv)).toEqual(['R3'])
    const dort = `model_code;ad;avensair_kod;purchase_price_eur\n${Array.from({ length: 4 }, (_, i) => `M${i};Ad${i};A${i};${10 + i},50`).join('\n')}\n`
    expect(kurallar('katalog.csv', dort)).toEqual([])
  })

  it('JSONL: 5 satır → R3', () => {
    const metin = satirlar(5)
      .map((o) => JSON.stringify(o))
      .join('\n')
    expect(kurallar('u.jsonl', metin)).toEqual(['R3'])
  })

  it('CSV: id|sku + price başlığı ve 5 dolu satır → R3; 4 satır → TEMİZ', () => {
    const csv = (n: number) => `id,sku,price\n${Array.from({ length: n }, (_, i) => `p${i},S-${i},${100 + i}`).join('\n')}\n`
    expect(kurallar('u.csv', csv(5))).toEqual(['R3'])
    expect(kurallar('u.csv', csv(4))).toEqual([])
  })

  it('CSV: noktalı virgül ayraç + TR sayı biçimi ("1.299,90") → R3', () => {
    const csv = `sku;price\n${Array.from({ length: 5 }, (_, i) => `S-${i};"1.2${i}9,90"`).join('\n')}\n`
    expect(kurallar('u.csv', csv)).toEqual(['R3'])
  })

  it('CSV TEMİZ: fiyat sütunu boş ya da başlıkta kimlik yok', () => {
    expect(kurallar('u.csv', `id,price\n${Array.from({ length: 6 }, (_, i) => `p${i},`).join('\n')}\n`)).toEqual([])
    expect(kurallar('u.csv', `ad,price\n${Array.from({ length: 6 }, (_, i) => `a${i},${i + 1}`).join('\n')}\n`)).toEqual([])
  })

  it('bulgu ayrıntısı SATIR SAYISI taşır, fiyat değeri taşımaz', () => {
    const [b] = kapi.dosyaTara('u.json', JSON.stringify(satirlar(7, { price: Number(GIZLI_FIYAT) })))
    expect(b.kural).toBe('R3')
    expect(b.ayrinti).toContain('7')
    expect(b.ayrinti).not.toContain(GIZLI_FIYAT)
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · R5 ödeme parçası: binNumber + lastFourDigits, sıfır sayacı DEĞİLSE (bulgu 2b)', () => {
  const yanit = (bin: string, son: string) => ({ paymentId: '1', binNumber: bin, lastFourDigits: son, price: 1 })

  it('gerçek görünümlü BIN + son dört → R5 KIRMIZI (JSON, iç içe, dizi)', () => {
    expect(kurallar('y.json', JSON.stringify(yanit(GIZLI_BIN, GIZLI_SON4)))).toEqual(['R5'])
    expect(kurallar('y.json', JSON.stringify({ ornekler: [{ payment_debug: yanit(GIZLI_BIN, GIZLI_SON4) }] }))).toEqual(['R5'])
  })

  it('sıfır sayacı (arındırılmış fikstür biçimi) → TEMİZ', () => {
    expect(kurallar('y.json', JSON.stringify(yanit('000000', '0000')))).toEqual([])
    expect(kurallar('y.json', JSON.stringify(yanit('000007', '0003')))).toEqual([])
  })

  it('yalnız biri sayaç: BIN gerçek ya da son dört gerçek → R5', () => {
    expect(kurallar('y.json', JSON.stringify(yanit(GIZLI_BIN, '0000')))).toEqual(['R5'])
    expect(kurallar('y.json', JSON.stringify(yanit('000000', GIZLI_SON4)))).toEqual(['R5'])
  })

  it('yalnız biri varsa (birlikte değil) TEMİZ; boş değerler TEMİZ', () => {
    expect(kurallar('y.json', JSON.stringify({ binNumber: GIZLI_BIN }))).toEqual([])
    expect(kurallar('y.json', JSON.stringify({ lastFourDigits: GIZLI_SON4 }))).toEqual([])
    expect(kurallar('y.json', JSON.stringify(yanit('', '')))).toEqual([])
  })

  it('CSV: başlıkta ikisi birlikte ve gerçek değerli satır → R5; sayaç satırları TEMİZ', () => {
    expect(kurallar('y.csv', `binNumber,lastFourDigits\n${GIZLI_BIN},${GIZLI_SON4}\n`)).toEqual(['R5'])
    expect(kurallar('y.csv', 'binNumber,lastFourDigits\n000000,0000\n000002,0002\n')).toEqual([])
  })

  it('camelCase/snake_case varyantları aynı alandır', () => {
    expect(kurallar('y.json', JSON.stringify({ bin_number: GIZLI_BIN, last_four_digits: GIZLI_SON4 }))).toEqual(['R5'])
  })

  it('bulgu ayrıntısı değer taşımaz', () => {
    const [b] = kapi.dosyaTara('y.json', JSON.stringify(yanit(GIZLI_BIN, GIZLI_SON4)))
    expect(b.ayrinti).not.toContain(GIZLI_BIN)
    expect(b.ayrinti).not.toContain(GIZLI_SON4)
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · R4 yol kuralı (bulgu 4a)', () => {
  it.each([
    ['docs/archive/db-backup-2026-01/products.json', 'db-backup'],
    ['yedekler/DB-Backup-2026/x.txt', 'db-backup'],
    ['scripts/pg_dump_all.sh', 'pg_dump'],
    ['yedek/sunucu.dump', '.dump'],
    ['yedek/sunucu.dump.gz', '.dump'],
    ['yedek/sunucu.sql.gz', '.sql.gz'],
    ['yedek/sunucu.sql.dump', '.sql.dump'],
    ['veri/siparisler.json.gz', '.gz'],
    ['veri/urunler.csv.gz', '.gz'],
    ['yedek/arsiv.zip', '.zip'],
    ['yedek/arsiv.tar', '.tar'],
    ['yedek/arsiv.tgz', '.tgz'],
    ['yedek/sunucu.sql.zst', '.zst'],
    ['yedek/sunucu.sql.xz', '.xz'],
    ['yedek/sunucu.sql.bz2', '.bz2'],
    ['yedek/arsiv.7z', '.7z'],
    ['yedek/arsiv.rar', '.rar'],
    ['yedek/sunucu.backup', '.backup'],
    ['yedek/sunucu.pgdump', '.pgdump'],
    ['yedek/dizin/toc.dat', 'toc.dat'],
    ['yedek/dizin/3012.dat.gz', '.gz'],
    ['toc.dat', 'toc.dat'],
    ['rapor/musteriler.xlsx', '.xlsx'],
    ['rapor/musteriler.xls', '.xls'],
    ['trafik/oturum.har', '.har'],
  ])('KIRMIZI: %s → %s', (yol, kalip) => {
    expect(kapi.yolIhlali(yol)).toContain(kalip)
  })

  it.each([
    'docs/standards/depoya-giremeyecek-veri-standard.md',
    'docs/notlar/dump-notlari.md',
    'src/components/Dumpster.tsx',
    'supabase/migrations/20260101000000_x.sql',
    'scripts/security/depo-dokum-kapisi.cjs',
    'public/data/yedek-plani.json',
    'docs/toc.dat.md',
    'src/atoc.dat',
    'src/zipper.ts',
  ])('TEMİZ: %s', (yol) => {
    expect(kapi.yolIhlali(yol)).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · R6 izlenen ikili veritabanı (bulgu 9)', () => {
  it.each(['veri/yerel.db', 'veri/yerel.sqlite', 'veri/yerel.sqlite3', 'kok.DB'])('uzantıdan: %s → R6', (yol) => {
    const s = kapi.tara({ dosyalar: [yol], oku: () => null, izin: [] })
    expect(s.ihlaller.map((k) => k.kural)).toEqual(['R6'])
  })

  it('SQLite imzalı uzantısız ve .bak/.bin dosyası → R6 (imza kancası); imzasızı değil', () => {
    const s = kapi.tara({ dosyalar: ['veri/dosya', 'veri/yedek.bak', 'veri/metin.bin', 'veri/x.png'], oku: () => null, izin: [], ikili: (y) => y !== 'veri/metin.bin' })
    expect(s.ihlaller.map((k) => k.dosya).sort()).toEqual(['veri/dosya', 'veri/yedek.bak'])
  })

  it('CLI: gerçek SQLite imzalı dosya (uzantı değiştirilmiş: .bak ve uzantısız) R6 KIRMIZI', { timeout: 60_000 }, () => {
    const imza = Buffer.concat([Buffer.from('SQLite format 3'), Buffer.from([0]), Buffer.alloc(100)])
    const d = sahteDepo({ 'veri/yedek.bak': imza, 'veri/dosya': imza, 'veri/duz.bak': Buffer.from('düz metin') })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/yedek.bak')
    expect(r.cikti).toContain('veri/dosya')
    expect(r.cikti).not.toContain('veri/duz.bak')
    expect(r.cikti).toContain('ikili-veritabani')
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · disk okuyucu hata yolları (ölçülemeyen dosya temiz sayılmaz)', () => {
  it('diskte olmayan dosya null döner (izlenen ama silinmiş dosya taranmaz, ihlal de üretmez)', () => {
    expect(kapi.diskOkuyucu(geciciDizin('depo-dokum-okuyucu-'))('yok.json')).toBeNull()
  })

  it('dizin (alt modül/gitlink gibi) null döner: düzenli dosya değilse okunmaz', () => {
    const d = geciciDizin('depo-dokum-okuyucu-')
    fs.mkdirSync(path.join(d, 'altdizin'))
    expect(kapi.diskOkuyucu(d)('altdizin')).toBeNull()
  })

  it('sınırı aşan dosya FIRLATIR (taranamadı ≠ temiz); sınır içindeyse okunur', () => {
    const d = geciciDizin('depo-dokum-okuyucu-')
    fs.writeFileSync(path.join(d, 'buyuk.json'), '{"a":"xxxxxxxxxxxxxxxxxxxx"}')
    expect(() => kapi.diskOkuyucu(d, 10)('buyuk.json')).toThrow(/çok büyük/)
    expect(kapi.diskOkuyucu(d, 1000)('buyuk.json')).toContain('xxxx')
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · .gitignore kalıpları (bulgu 8)', () => {
  const kalipLari = () =>
    fs
      .readFileSync(GITIGNORE_YOLU, 'utf8')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s !== '' && !s.startsWith('#'))

  it.each(['**/db-backup*', '**/[Dd][Bb]-[Bb]ackup*', '*.dump', '*.dump.*', '*.sql.gz', '*.backup', '*.pgdump'])('`%s` var', (kalip) => {
    expect(kalipLari()).toContain(kalip)
  })

  it('kalıplar gerçekten ignore ediyor (git check-ignore): farklı dizin, DB-Backup yazımı, sıkıştırılmış yedekler', () => {
    const d = geciciDizin('depo-dokum-ignore-')
    git(d, 'init', '-q')
    fs.copyFileSync(GITIGNORE_YOLU, path.join(d, '.gitignore'))
    for (const yol of ['yedek/db-backup-1/x.json', 'a/b/DB-Backup-2026/x.json', 'x/sunucu.dump', 'x/sunucu.dump.gz', 'x/s.sql.gz', 'x/s.backup', 'x/s.pgdump']) {
      const r = spawnSync('git', ['check-ignore', '-q', yol], { cwd: d, env: temizOrtam() })
      expect(r.status, `${yol} ignore edilmiyor`).toBe(0)
    }
    const temiz = spawnSync('git', ['check-ignore', '-q', 'docs/standards/depoya-giremeyecek-veri-standard.md'], { cwd: d, env: temizOrtam() })
    expect(temiz.status).toBe(1)
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
const ADIM_ADI = 'Döküm kapısı (depoya giremeyecek veri)'
const KOMUT = 'run: node scripts/security/depo-dokum-kapisi.cjs'

/** `ci` işinde adımın bağlantısını ölçer. Satır taraması (YAML bağımlılığı yok); yorumlar atılır. */
function ciBaglantisiniDenetle(ciMetni: string): string[] {
  const ihlaller: string[] = []
  const satirlar = ciMetni.split(/\r?\n/)
  const yorumsuz = (s: string[]): string[] => s.filter((x) => !/^\s*#/.test(x))
  const adimSatirlari = satirlar.map((s, i) => (/^ {6}- name:/.test(s) && s.includes(ADIM_ADI) ? i : -1)).filter((i) => i >= 0)
  if (adimSatirlari.length !== 1) {
    ihlaller.push(`'${ADIM_ADI}' adımı ${adimSatirlari.length} kez var (tam 1 olmalı)`)
    return ihlaller
  }
  const bas = adimSatirlari[0]
  const sonraki = satirlar.findIndex((s, i) => i > bas && /^ {6}- name:/.test(s))
  const bitis = sonraki < 0 ? satirlar.length : sonraki
  const blok = yorumsuz(satirlar.slice(bas, bitis))

  if (blok.some((s) => /^ {8}if:/.test(s))) ihlaller.push('adımda `if:` var: kapı atlanabilir')
  if (blok.some((s) => /^ {8}continue-on-error:/.test(s) && !/:\s*false\s*$/.test(s))) {
    ihlaller.push('adımda `continue-on-error` var: kırmızı sessizce yeşile çevrilebilir')
  }
  if (blok.some((s) => /^ {8}working-directory:/.test(s))) {
    ihlaller.push('adımda `working-directory:` var: `git ls-files` yalnız o dizini listeler, kapı kör kalır')
  }
  if (blok.some((s) => /^ {8}shell:/.test(s) && !/:\s*bash\s*$/.test(s))) ihlaller.push('adımda bash dışı `shell:` var: pipefail ve komut çözümü değişir')
  if (blok.some((s) => /^ {8}env:/.test(s))) ihlaller.push('adımda `env:` var: kapının ortamına/yoluna müdahale edilebilir')
  if (!blok.some((s) => s.trim() === KOMUT)) ihlaller.push(`adım \`${KOMUT.replace('run: ', '')}\` komutunu koşturmuyor`)

  // Başka hiçbir adım (yorum dışı) kapı betiğine dokunmaz: önceki adımda `sed -i` ile gevşetme senaryosu.
  const digerAtif = satirlar.filter((s, i) => (i < bas || i >= bitis) && !/^\s*#/.test(s) && s.includes('depo-dokum-kapisi'))
  if (digerAtif.length > 0) ihlaller.push('başka bir adım/satır kapı betiğine atıf yapıyor (değiştirme riski)')
  // Ortam değişkenleri (iş/iş akışı düzeyi): git'i başka depoya ya da node'u önyüklemeye yönlendirir.
  if (satirlar.some((s) => !/^\s*#/.test(s) && /^\s+(GIT_[A-Z_]+|NODE_OPTIONS):/.test(s))) {
    ihlaller.push('ci.yml `GIT_*` ya da `NODE_OPTIONS` ortam değişkeni tanımlıyor: kapı yönlendirilebilir')
  }

  const isBas = satirlar.findIndex((s) => /^ {2}ci:\s*$/.test(s))
  if (isBas < 0) {
    ihlaller.push('`ci` işi yok')
  } else {
    const digerIs = satirlar.findIndex((s, i) => i > isBas && /^ {2}[A-Za-z0-9_-]+:\s*$/.test(s))
    if (bas < isBas || (digerIs >= 0 && bas > digerIs)) ihlaller.push('adım `ci` işinin dışında')
    const stepsSatiri = satirlar.findIndex((s, i) => i > isBas && /^ {4}steps:/.test(s))
    const isBasligi = yorumsuz(satirlar.slice(isBas, stepsSatiri < 0 ? undefined : stepsSatiri))
    if (isBasligi.some((s) => /^ {4}if:/.test(s))) ihlaller.push('`ci` işinde iş düzeyi `if:` var: bütün adımlar atlanabilir')
    if (isBasligi.some((s) => /working-directory:/.test(s))) ihlaller.push('`ci` işi varsayılanında `working-directory:` var: kapının dizini kayar')
    if (isBasligi.some((s) => /^\s+shell:/.test(s) && !/:\s*bash\s*$/.test(s))) ihlaller.push('`ci` işi varsayılan kabuğu bash değil')
  }

  const kurulum = satirlar.findIndex((s) => /^ {6}- name: Install dependencies\s*$/.test(s))
  if (kurulum < 0) ihlaller.push("'Install dependencies' adımı bulunamadı (konum ölçülemedi)")
  else if (bas > kurulum) ihlaller.push("adım 'Install dependencies'ten SONRA: önceki adımlar kırmızıyken ve bağımlılıksız çalışabilecekken geç koşuyor")
  const testBas = satirlar.findIndex((s) => /^ {6}- name: Test\s*$/.test(s))
  if (testBas < 0) ihlaller.push("'Test' adımı bulunamadı (konum ölçülemedi)")
  else if (bas > testBas) ihlaller.push("adım 'Test'ten SONRA: testler kırmızıyken hiç koşmaz")
  return ihlaller
}

describe('INV-DEPO-DOKUM-1 · CI BAĞLAMA (adım var, erken, atlanmıyor, kırmızıyı yutmuyor, yönlendirilemiyor)', () => {
  const gercek = fs.readFileSync(CI_YOLU, 'utf8')
  const satirlari = () => gercek.split(/\r?\n/)
  const adimIndeksi = () => satirlari().findIndex((s) => /^ {6}- name:/.test(s) && s.includes(ADIM_ADI))
  const ihlalVar = (metin: string, parca: string) => expect(ciBaglantisiniDenetle(metin)).toEqual(expect.arrayContaining([expect.stringContaining(parca)]))

  it('GERÇEK ci.yml bağlantıyı doğru taşıyor', () => {
    expect(ciBaglantisiniDenetle(gercek)).toEqual([])
  })

  it('adım "Install dependencies" adımının hemen ÖNCESİNDE (bağımlılıksız, erken)', () => {
    const s = satirlari()
    const i = adimIndeksi()
    const sonraki = s.findIndex((x, k) => k > i && /^ {6}- name:/.test(x))
    expect(s[sonraki]).toContain('Install dependencies')
  })

  it('yorum "her koşuda" iddiasını DÜZELTİYOR: önceki adım kırmızıysa koşmaz', () => {
    const s = satirlari()
    const i = adimIndeksi()
    const yorum = s.slice(Math.max(0, i - 6), i).join('\n')
    expect(yorum).toMatch(/Her koşuda|her koşuda/)
    expect(yorum).toMatch(/DEĞİL/)
    expect(yorum).toMatch(/önceki bir adım[\s#]+kırmızıysa/)
    expect(yorum).toMatch(/pre-push/)
  })

  it('AYIRT EDİCİ: adım SİLİNİRSE kırmızı', () => {
    const s = satirlari()
    s[adimIndeksi()] = '      - name: Başka bir adım'
    expect(ciBaglantisiniDenetle(s.join('\n')).length).toBeGreaterThan(0)
  })

  it('AYIRT EDİCİ: `continue-on-error: true` EKLENİRSE kırmızı', () => {
    const s = satirlari()
    s.splice(adimIndeksi() + 1, 0, '        continue-on-error: true')
    ihlalVar(s.join('\n'), 'continue-on-error')
  })

  it('AYIRT EDİCİ: `if:` EKLENİRSE kırmızı (ağır adımlara konan atla koşulu bu adıma gelemez)', () => {
    const s = satirlari()
    s.splice(adimIndeksi() + 1, 0, "        if: steps.ayna.outputs.atla != 'true'")
    ihlalVar(s.join('\n'), '`if:`')
  })

  it('AYIRT EDİCİ: `working-directory:` EKLENİRSE kırmızı (git ls-files yalnız o dizini listeler)', () => {
    const s = satirlari()
    s.splice(adimIndeksi() + 1, 0, '        working-directory: docs')
    ihlalVar(s.join('\n'), 'working-directory')
  })

  it('AYIRT EDİCİ: bash dışı `shell:` EKLENİRSE kırmızı; `shell: bash` serbest', () => {
    const a = satirlari()
    a.splice(adimIndeksi() + 1, 0, '        shell: pwsh')
    ihlalVar(a.join('\n'), 'shell')
    const b = satirlari()
    b.splice(adimIndeksi() + 1, 0, '        shell: bash')
    expect(ciBaglantisiniDenetle(b.join('\n'))).toEqual([])
  })

  it('AYIRT EDİCİ: adıma `env:` EKLENİRSE kırmızı', () => {
    const s = satirlari()
    s.splice(adimIndeksi() + 1, 0, '        env:', '          X: y')
    ihlalVar(s.join('\n'), '`env:`')
  })

  it('AYIRT EDİCİ: komut DEĞİŞİRSE kırmızı', () => {
    const s = satirlari()
    const i = adimIndeksi()
    s[i + 1] = '        run: echo geçildi'
    expect(ciBaglantisiniDenetle(s.join('\n')).length).toBeGreaterThan(0)
  })

  it("AYIRT EDİCİ: adım 'Test'in ARDINA taşınırsa kırmızı", () => {
    const s = satirlari()
    const i = adimIndeksi()
    const sonraki = s.findIndex((x, k) => k > i && /^ {6}- name:/.test(x))
    const blok = s.splice(i, sonraki - i)
    const testSatiri = s.findIndex((x) => /^ {6}- name: Test\s*$/.test(x))
    const testSonrasi = s.findIndex((x, k) => k > testSatiri && /^ {6}- name:/.test(x))
    s.splice(testSonrasi, 0, ...blok)
    ihlalVar(s.join('\n'), "'Test'ten SONRA")
  })

  it("AYIRT EDİCİ: adım 'Install dependencies'in ARDINA taşınırsa kırmızı (bulgu E)", () => {
    const s = satirlari()
    const i = adimIndeksi()
    const sonraki = s.findIndex((x, k) => k > i && /^ {6}- name:/.test(x))
    const blok = s.splice(i, sonraki - i)
    const kurulum = s.findIndex((x) => /^ {6}- name: Install dependencies\s*$/.test(x))
    const kurulumSonrasi = s.findIndex((x, k) => k > kurulum && /^ {6}- name:/.test(x))
    s.splice(kurulumSonrasi, 0, ...blok)
    ihlalVar(s.join('\n'), "'Install dependencies'ten SONRA")
  })

  it('AYIRT EDİCİ: iş düzeyinde `if:` varsa kırmızı', () => {
    const s = satirlari()
    const isBas = s.findIndex((x) => /^ {2}ci:\s*$/.test(x))
    s.splice(isBas + 1, 0, "    if: github.event_name == 'pull_request'")
    ihlalVar(s.join('\n'), 'iş düzeyi')
  })

  it('AYIRT EDİCİ: iş varsayılanına `working-directory:` konursa kırmızı', () => {
    const s = satirlari()
    const i = s.findIndex((x) => /^ {8}shell: bash\s*$/.test(x))
    expect(i, 'defaults.run.shell satırı bulunamadı').toBeGreaterThan(0)
    s.splice(i + 1, 0, '        working-directory: docs')
    ihlalVar(s.join('\n'), 'working-directory')
  })

  it('AYIRT EDİCİ: başka bir adım kapı betiğine dokunursa kırmızı (önceki adımda betiği gevşetme)', () => {
    const s = satirlari()
    const kurulum = s.findIndex((x) => /^ {6}- name: Install dependencies\s*$/.test(x))
    s.splice(kurulum, 0, '      - name: Gevsetme', "        run: sed -i 's/R1/R0/' scripts/security/depo-dokum-kapisi.cjs", '')
    ihlalVar(s.join('\n'), 'kapı betiğine atıf')
  })

  it('AYIRT EDİCİ: ortam değişkeni GIT_DIR ya da NODE_OPTIONS tanımlanırsa kırmızı', () => {
    const s = satirlari()
    s.splice(adimIndeksi() - 1, 0, '        env:', '          GIT_DIR: /tmp/baska')
    ihlalVar(s.join('\n'), 'GIT_*')
  })

  it('adım İKİ kez varsa kırmızı (kopya, ölü kopya olabilir)', () => {
    const s = satirlari()
    const i = adimIndeksi()
    const sonraki = s.findIndex((x, k) => k > i && /^ {6}- name:/.test(x))
    s.splice(sonraki, 0, ...s.slice(i, sonraki))
    expect(ciBaglantisiniDenetle(s.join('\n')).length).toBeGreaterThan(0)
  })

  it('iş adı `ci` ve tek iş (branch protection adı değişmedi)', () => {
    const isler = satirlari().filter((s) => /^ {2}[A-Za-z0-9_-]+:\s*$/.test(s))
    expect(isler.map((s) => s.trim())).toContain('ci:')
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
const IZIN_TAVANI = 4 // R6 x3 (izlenen SQLite dosyaları) + R5 x1 (sandbox kart örneği). Artırmak bu satırı değiştirmek demektir.

/** Bir izin kaydının sözleşmeye uyup uymadığı: sorun listesi (boş = uyuyor). */
function izinKaydiSorunlari(e: IzinKaydi, izlenen: Set<string>): string[] {
  const s: string[] = []
  if (!['R3', 'R5', 'R6'].includes(e.kural)) s.push('yalnız R3, R5 ve R6 izin alabilir (R1/R2/R4 ASLA)')
  if (/[*?[\]\\]/.test(e.yol) || e.yol.startsWith('/') || e.yol.startsWith('./')) s.push('yol düz dosya yolu olmalı (glob/kök/göreli yok)')
  if (!e.neden || e.neden.trim().length < 20) s.push('neden eksik ya da çok kısa')
  if (e.kural === 'R3' && (!e.kanit || !/(sahte|örnek|ornek)/i.test(e.kanit))) s.push('R3 kanıtı "fiyat sahte/örnek" olduğunu göstermiyor')
  if (e.kural === 'R6' && (!e.kanit || !/içerik taraması/.test(e.kanit) || !/\d/.test(e.kanit) || !/ayrı kayıt: numara OPS/.test(e.kanit))) {
    s.push('R6 kanıtı içerik taraması sayılarını ve "ayrı kayıt: numara OPS\'tan" ifadesini taşımıyor')
  }
  if (e.kural === 'R5' && (!e.kanit || !/sandbox/i.test(e.kanit) || !/\d/.test(e.kanit) || !/ayrı kayıt: numara OPS/.test(e.kanit))) {
    s.push('R5 kanıtı sandbox test kartı biçimini (sayıyla) ve "ayrı kayıt: numara OPS\'tan" ifadesini taşımıyor')
  }
  if (!izlenen.has(e.yol)) s.push('yol izlenen ağaçta yok (yetim satır)')
  return s
}

describe('INV-DEPO-DOKUM-1 · İZİN LİSTESİ sınırlı (R3 / R5 / R6)', () => {
  const izlenen = (): Set<string> => {
    const r = spawnSync('git', ['ls-files', '-z'], { cwd: KOK, env: temizOrtam(), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    return new Set((r.stdout ?? '').split('\0').filter(Boolean))
  }

  it(`mevcut liste tavanı aşmıyor (${IZIN_TAVANI}) ve yolları TEKİL`, () => {
    expect(kapi.IZIN_LISTESI.length).toBeLessThanOrEqual(IZIN_TAVANI)
    expect(new Set(kapi.IZIN_LISTESI.map((e) => `${e.kural}:${e.yol}`)).size).toBe(kapi.IZIN_LISTESI.length)
  })

  it('izin listesi BEKLENEN kayıtlarla aynı (sessiz izin yok): hangi dosya, hangi kural', () => {
    expect(kapi.IZIN_LISTESI.map((e) => `${e.kural} ${e.yol}`).sort()).toEqual(
      ['R5 support/iyzico_support_payload.json', 'R6 memory.db', 'R6 registry/_legacy/registry.db', 'R6 registry/registry.db'].sort(),
    )
  })

  it('mevcut her kayıt sözleşmeye uyuyor ve GERÇEKTEN bir isabeti muaf tutuyor (yetim değil)', () => {
    const ag = izlenen()
    for (const e of kapi.IZIN_LISTESI) {
      expect(izinKaydiSorunlari(e, ag), e.yol).toEqual([])
      if (e.kural === 'R6') {
        expect(kapi.tara({ dosyalar: [e.yol], oku: () => null, izin: [] }).ihlaller.some((k) => k.kural === 'R6'), `${e.yol}: izin gereksiz`).toBe(true)
      } else {
        const icerik = fs.readFileSync(path.join(KOK, e.yol), 'utf8')
        expect(kapi.dosyaTara(e.yol, icerik).some((b) => b.kural === e.kural), `${e.yol}: izin gereksiz`).toBe(true)
      }
    }
  })

  it('sözleşme kontrolü KENDİSİ çalışıyor: kötü kayıtlar teker teker yakalanır', () => {
    const ag = new Set(['veri/urunler.json', 'veri/yerel.db', 'veri/kart.json'])
    const iyi: IzinKaydi = { yol: 'veri/urunler.json', kural: 'R3', neden: 'test fikstürü, 6 uydurma ürün satırı', kanit: 'fiyat sahte: tüm değerler 1000-1005 arası örnek' }
    expect(izinKaydiSorunlari(iyi, ag)).toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, kural: 'R1' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, kural: 'R2' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, kural: 'R4' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, yol: 'veri/*.json' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, neden: 'x' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, kanit: 'gerçek fiyat listesi' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, yol: 'baska/dosya.json' }, ag)).not.toEqual([])
    const ikili: IzinKaydi = { yol: 'veri/yerel.db', kural: 'R6', neden: 'yerel hafıza veritabanı, içerik boş', kanit: "içerik taraması: 2 tablo, desen 0; ayrı kayıt: numara OPS'tan" }
    expect(izinKaydiSorunlari(ikili, ag)).toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, kanit: 'içerik taraması yok sayı yok' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, kanit: 'tablo 2 sayı var' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, kanit: 'içerik taraması: 2 tablo' }, ag)).not.toEqual([])
    const kart: IzinKaydi = { yol: 'veri/kart.json', kural: 'R5', neden: 'destek yükü örneği, sandbox test kartı', kanit: "sandbox kart biçimi: 5/5 örnek; ayrı kayıt: numara OPS'tan" }
    expect(izinKaydiSorunlari(kart, ag)).toEqual([])
    expect(izinKaydiSorunlari({ ...kart, kanit: 'gerçek kart 5/5' }, ag)).not.toEqual([])
  })

  const fiyatDokumu = JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, price: 100 + i })))
  const izinli: IzinKaydi[] = [{ yol: 'veri/urunler.json', kural: 'R3', neden: 'test fikstürü, uydurma satırlar', kanit: 'fiyat sahte/örnek' }]

  it('mekanik: R3 izin kaydı o DOSYAYI muaf tutar, başka dosyayı tutmaz', () => {
    const oku = (): string => fiyatDokumu
    const a = kapi.tara({ dosyalar: ['veri/urunler.json'], oku, izin: izinli })
    expect(a.ihlaller).toEqual([])
    expect(a.izinliler).toHaveLength(1)
    const b = kapi.tara({ dosyalar: ['veri/baska.json'], oku, izin: izinli })
    expect(b.ihlaller).toHaveLength(1)
    expect(b.izinliler).toEqual([])
  })

  it('mekanik: R6 ve R5 izin kayıtları o DOSYAYI muaf tutar (kural eşleşmeli: R3 kaydı R6 isabetini tutmaz)', () => {
    const a = kapi.tara({ dosyalar: ['veri/yerel.db'], oku: () => null, izin: [{ yol: 'veri/yerel.db', kural: 'R6' }] })
    expect(a.ihlaller).toEqual([])
    expect(a.izinliler.map((k) => k.kural)).toEqual(['R6'])
    const b = kapi.tara({ dosyalar: ['veri/yerel.db'], oku: () => null, izin: [{ yol: 'veri/yerel.db', kural: 'R3' }] })
    expect(b.ihlaller.map((k) => k.kural)).toEqual(['R6'])
    const kart = JSON.stringify({ binNumber: GIZLI_BIN, lastFourDigits: GIZLI_SON4 })
    const c = kapi.tara({ dosyalar: ['veri/kart.json'], oku: () => kart, izin: [{ yol: 'veri/kart.json', kural: 'R5' }] })
    expect(c.ihlaller).toEqual([])
    expect(c.izinliler.map((k) => k.kural)).toEqual(['R5'])
  })

  it('mekanik: R1/R2/R4 İZİN ALMAZ (kayıt kural R1 yazsa da, yol izinli olsa da)', () => {
    const kisisel = JSON.stringify([{ customer_email: GIZLI_EPOSTA }])
    const r1 = kapi.tara({ dosyalar: ['veri/urunler.json'], oku: () => kisisel, izin: [{ yol: 'veri/urunler.json', kural: 'R1' }] })
    expect(r1.ihlaller.map((k) => k.kural)).toEqual(['R1'])
    const r2 = kapi.tara({ dosyalar: ['veri/urunler.json'], oku: () => kisisel, izin: izinli })
    expect(r2.ihlaller.map((k) => k.kural)).toEqual(['R1'])
    const sql = kapi.tara({ dosyalar: ['d.sql'], oku: () => "INSERT INTO t (customer_name) VALUES ('x');", izin: [{ yol: 'd.sql', kural: 'R2' }] })
    expect(sql.ihlaller.map((k) => k.kural)).toEqual(['R2'])
    const r4 = kapi.tara({ dosyalar: ['db-backup/urunler.json'], oku: () => '[]', izin: [{ yol: 'db-backup/urunler.json', kural: 'R3' }, { yol: 'db-backup/urunler.json', kural: 'R4' }] })
    expect(r4.ihlaller.map((k) => k.kural)).toEqual(['R4'])
  })

  it('mekanik: okunamayan (null) dosya sayılmaz ve ihlal üretmez; okuyucu FIRLATIRSA tara da fırlatır (fail-closed)', () => {
    expect(kapi.tara({ dosyalar: ['a.json'], oku: () => null }).taranan.veri).toBe(0)
    expect(() =>
      kapi.tara({
        dosyalar: ['a.json'],
        oku: () => {
          throw new Error('okunamadi')
        },
      }),
    ).toThrow('okunamadi')
  })
})
