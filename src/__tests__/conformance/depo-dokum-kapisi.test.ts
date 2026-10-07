import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import type { IzinKaydi } from './depo-dokum-kapisi.yardimci'
import { AUTH_TABLOLARI, BEKLENEN_GENEL, BEKLENEN_HASSAS_TABLOLAR, BEKLENEN_KISISEL, BEKLENEN_KISISEL_EK, BOM, CI_YOLU, commitle, geciciDizin, geciciTemizle, git, GITIGNORE_YOLU, GIZLI_AD, GIZLI_ADRES, GIZLI_BIN, GIZLI_EPOSTA, GIZLI_FIYAT, GIZLI_SON4, kapi, kapiyiKos, KOK, kurallar, sahteDepo, TABAN_YOLU, temizOrtam, yaz } from './depo-dokum-kapisi.yardimci'

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
      '.parquet', // ALT-39 2. tur (O1): R4 uzantı listesi genişledi (sıkılaştırma)
      '.ods',
      '.mdb',
      '.accdb',
      'toc.dat',
      'sqlite-wal/shm/journal', // ALT-39 3. tur (N6): SQLite yan dosyaları
    ])
  })

  // support/ ağaçtan silindi (ALT-39 son tur): R5'in (ödeme kartı parçası) TEK izinli örneği oydu. Kartın izin yolu artık YOK:
  // gerçek kart parçası da, "sandbox" diye anılan da kırmızıdır; arındırılmış fikstür sıfır sayacıyla (00000d / 000d) geçer.
  it('izin listesi yalnız R3 ve R6 kurallarına açık (R1/R2/R4/R5 ASLA)', () => {
    expect([...kapi.IZIN_KURALLARI]).toEqual(['R3', 'R6'])
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · şema tabanı kapsamı (bulgu 2): açık liste kolları (tabanı TARAYAN kollar aşağıdaki bölümde: O2)', () => {
  // Liste testte AÇIK; taban okunur. Kolon tabandan silinirse ya da sözlükten düşerse kırmızı.
  // ⚠Bu bölüm elle yazılmış listeyi doğrular; "sözlük tabandan türetildi" iddiasını YALNIZ sonraki bölüm (tarama) taşır.
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
    // auth şeması tabloları (users, identities) public şema tabanında YOK (3. tur, N3): adıyla ayrılır, hassas listede OLMALARI ayrıca sınanır
    for (const tablo of kapi.HASSAS_TABLOLAR.filter((x) => !AUTH_TABLOLARI.includes(x))) expect(t.has(tablo), `${tablo} tabanda yok`).toBe(true)
    for (const tablo of AUTH_TABLOLARI) expect(kapi.HASSAS_TABLOLAR, `${tablo}: auth tablosu hassas listede olmalı`).toContain(tablo)
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
describe('INV-DEPO-DOKUM-1 · şema tabanı TARAMASI (O2): kişisel kalıba uyan HER kolon ve HER tablo hesaba katılır', () => {
  /** Test sahipliğinde, kapıdan BAĞIMSIZ ve bilerek daha GENİŞ kalıp: kapı bunun bir kısmını kapsamak zorundadır, kalanı gerekçelendirilir. */
  const KISISEL_KALIP =
    /(e_?mail|eposta|phone|telefon|gsm|(^|_)ip($|_)|identity|kimlik|tckn|vergi|tax_(no|number|office)|address|adres|(first|last|full|contact|customer|applicant|recipient)_?name|ad_?soyad|soyad|musteri|postal_?code|invoice|billing|shipping)/i

  /** Kalıba uyup kapıca KAPSANMAYAN kolonlar: ADIYLA ve GEREKÇEYLE. Yeni bir kolon buraya düşerse kişi bilgisi mi diye bakılır. */
  const BILEREK_DISARIDA: Record<string, string> = {
    'venthub_orders.shipping_method': 'kargo yöntemi etiketi (standart/ekspres), kişi bilgisi değil',
    'venthub_orders.shipping_carrier': 'kargo firması adı (kurumsal), kişi bilgisi değil',
    'venthub_orders.shipping_tracking_number': 'takip numarası: tek başına kişiyi tanımlamaz; kimlik/ad/adres alanları ayrıca kapsanır',
    'venthub_orders.invoice_type': 'fatura türü etiketi (bireysel/kurumsal), kişi bilgisi değil',
    'order_invoices.invoice_no': 'fatura numarası: iş kaydı, kişi bilgisi içermez',
    'order_invoices.invoice_date': 'fatura tarihi: iş kaydı, kişi bilgisi değil',
    'order_invoices.invoice_type': 'fatura türü etiketi, kişi bilgisi değil',
    'user_addresses.address_type': 'adres türü etiketi (ev/iş), kişi bilgisi değil; adres alanlarının kendisi kapsanır',
    'user_addresses.is_default_shipping': 'mantıksal bayrak, kişi bilgisi değil',
    'user_addresses.is_default_billing': 'mantıksal bayrak, kişi bilgisi değil',
  }
  /** Kişisel kolonu olduğu hâlde hassas listede OLMAYAN tablolar: ADIYLA ve GEREKÇEYLE (bugün boş: hepsi hassas listede). */
  const HASSAS_DISI_TABLOLAR: Record<string, string> = {}
  /** Kişisel kolonu olmadığı hâlde hassas listede olan tablolar: maliyet. */
  const MALIYET_TABLOLARI = ['product_costs']

  function tabloKolonlari(): Map<string, string[]> {
    const satirlar = fs.readFileSync(TABAN_YOLU, 'utf8').split(/\r?\n/)
    const tablolar = new Map<string, string[]>()
    satirlar.forEach((s, i) => {
      const m = /^CREATE TABLE IF NOT EXISTS "public"\."([a-z_0-9]+)" \($/.exec(s)
      if (!m) return
      const kol: string[] = []
      for (let j = i + 1; j < satirlar.length && !/^\);/.test(satirlar[j]); j++) {
        const k = /^\s+"([a-z_0-9]+)"\s/.exec(satirlar[j])
        if (k) kol.push(k[1])
      }
      tablolar.set(m[1], kol)
    })
    return tablolar
  }
  const kisiselKolonlar = (): Array<{ tablo: string; kolon: string; kapsanir: boolean }> =>
    [...tabloKolonlari()].flatMap(([tablo, kolonlar]) =>
      kolonlar.filter((k) => KISISEL_KALIP.test(k)).map((kolon) => ({ tablo, kolon, kapsanir: kapi.kisiselAlanSinifi(kolon) !== null })),
    )

  it('KANARYA: taban okundu, kalıba uyan kolonlar var ve kapsanan/kapsanmayan ikisi de boş değil (boş tarama geçerli ölçüm değildir)', () => {
    expect(tabloKolonlari().size).toBeGreaterThan(30)
    const k = kisiselKolonlar()
    expect(k.length).toBeGreaterThan(30)
    expect(k.some((x) => x.kapsanir)).toBe(true)
    expect(k.some((x) => !x.kapsanir)).toBe(true)
  })

  it('adı kişisel kalıba uyan HER kolon ya kapıca KAPSANIR ya da adıyla ve gerekçeyle "bilerek dışarıda" listesindedir', () => {
    const sorunlu = kisiselKolonlar()
      .filter((x) => !x.kapsanir && !(`${x.tablo}.${x.kolon}` in BILEREK_DISARIDA))
      .map((x) => `${x.tablo}.${x.kolon}`)
    expect(sorunlu, 'kapsanmayan ve gerekçesiz kişisel kalıplı kolon: kök ekle ya da BILEREK_DISARIDA\'ya gerekçeyle yaz').toEqual([])
  })

  it('"bilerek dışarıda" listesi DÜRÜST: her kolon tabanda var, kalıba uyuyor, kapı kapsamıyor (kapsıyorsa listeden çıkar) ve gerekçesi dolu', () => {
    const tum = new Map(kisiselKolonlar().map((x) => [`${x.tablo}.${x.kolon}`, x]))
    for (const [ad, gerekce] of Object.entries(BILEREK_DISARIDA)) {
      const x = tum.get(ad)
      expect(x, `${ad}: tabanda yok ya da kalıba uymuyor (liste bayat)`).toBeDefined()
      expect(x?.kapsanir, `${ad}: artık kapıca kapsanıyor, listeden çıkar`).toBe(false)
      expect(gerekce.trim().length, `${ad}: gerekçe eksik`).toBeGreaterThanOrEqual(15)
    }
  })

  it('kişisel kolonlu HER tablo hassas listededir ya da adıyla ve gerekçeyle hassas-dışı listesindedir (hassas liste elle değil tarayarak doğrulanır)', () => {
    const kapsananTablolar = [...new Set(kisiselKolonlar().filter((x) => x.kapsanir).map((x) => x.tablo))]
    expect(kapsananTablolar.length).toBeGreaterThan(8)
    const eksik = kapsananTablolar.filter((t) => !kapi.HASSAS_TABLOLAR.includes(t) && !(t in HASSAS_DISI_TABLOLAR))
    expect(eksik, 'kişisel kolonlu ama hassas listede olmayan tablo').toEqual([])
    for (const [t, g] of Object.entries(HASSAS_DISI_TABLOLAR)) expect(g.trim().length, `${t}: gerekçe eksik`).toBeGreaterThanOrEqual(15)
  })

  it('hassas listedeki her tablo tabanda VAR ve ya kişisel kolon taşır ya da maliyet tablosudur (çöp giriş yok)', () => {
    const tablolar = tabloKolonlari()
    const kapsananTablolar = new Set(kisiselKolonlar().filter((x) => x.kapsanir).map((x) => x.tablo))
    for (const t of kapi.HASSAS_TABLOLAR.filter((x) => !AUTH_TABLOLARI.includes(x))) {
      expect(tablolar.has(t), `${t} tabanda yok`).toBe(true)
      expect(kapsananTablolar.has(t) || MALIYET_TABLOLARI.includes(t), `${t}: kişisel kolonu yok ve maliyet tablosu değil`).toBe(true)
    }
  })

  it('spec ile adlandırılan altı tablo hassas listede (data_subject_requests, order_email_events, quote_email_events, shipping_email_events, inventory_settings, venthub_quotes)', () => {
    for (const t of ['data_subject_requests', 'order_email_events', 'quote_email_events', 'shipping_email_events', 'inventory_settings', 'venthub_quotes']) {
      expect(kapi.HASSAS_TABLOLAR, t).toContain(t)
    }
  })

  // ── sınıflandırıcı: tolerans örnekleri (sonek/önek/Türkçe/parça) ─────────────────────────────────
  it.each([
    'applicant_email', 'alertEmail', 'email_to', 'ContactEmail', 'e_mail', 'recipient_email',
    'contact_phone', 'mobile_phone', 'telefon', 'telefon_no', 'cep_telefonu', 'Telefon Numarası',
    'accept_ip', 'clientIp', 'remote_ip', 'user-ip',
    'gsm', 'gsm_no', 'GSMNo',
    'Identity', 'identity_verified_at', // BİLİNÇLİ DEĞİŞİKLİK (3. tur, N3): `identity_number` artık BELİRGİN (aşağıdaki tablo): TCKN taşır
    'eposta', 'E-Posta', 'musteri_eposta',
    'ad_soyad', 'AdSoyad', 'Ad Soyad', 'soyad',
    'adres', 'teslimat_adresi', 'Adres Satırı',
    'vergi_no', 'VergiNo', 'vergi_dairesi',
    'musteri_adi', 'Müşteri Adı', 'musteri',
  ])('tolerans: %s GENEL kişisel alandır', (ad) => {
    expect(kapi.kisiselAlanSinifi(ad)).toBe('genel')
  })

  it.each(['tc_kimlik_no', 'TcKimlik', 'tcno', 'kimlik_no', 'TCKN', 'customer_email', 'billing_address', 'invoice_profile', 'identity_number', 'identityNumber', 'vkn', 'VKN', 'vkn_no'])(
    'tolerans: %s BELİRGİN kişisel alandır (≥1 dolu satır)',
    (ad) => {
      expect(kapi.kisiselAlanSinifi(ad)).toBe('belirgin')
    },
  )

  it.each([
    'ip', 'ip_rating', 'ip_class', 'ship', 'shipping_method', 'recip', 'zip', 'tip', 'scripts', 'description', 'tax_rate', 'vergi_orani',
    'is_taxable', 'price', 'product_name', 'category_id', 'name', 'city', 'company',
  ])('tolerans: %s kişisel DEĞİL (yanlış alarm yok; kısa ad yalnız tam parça olarak eşleşir)', (ad) => {
    expect(kapi.kisiselAlanSinifi(ad)).toBeNull()
  })

  // ── dört biçimde de tolerans çalışır: JSON, CSV, SQL, ham metin ─────────────────────────────────
  const uc = (alan: string, deger = 'dolu-deger') => JSON.stringify(Array.from({ length: 3 }, (_, i) => ({ id: `u${i}`, [alan]: `${deger}${i}` })))
  const iki = (alan: string) => JSON.stringify(Array.from({ length: 2 }, (_, i) => ({ id: `u${i}`, [alan]: `dolu${i}` })))

  it.each(['applicant_email', 'email_to', 'accept_ip', 'telefon', 'ad_soyad', 'vergi_no', 'musteri_adi'])(
    'JSON: tolerans adı %s 3 dolu satırda R1, 2 satırda TEMİZ',
    (alan) => {
      expect(kurallar('d.json', uc(alan))).toEqual(['R1'])
      expect(kurallar('d.json', iki(alan))).toEqual([])
    },
  )

  // ── 3. tur (N3): ödeme sağlayıcı alıcı bloğu (iyzico `buyer`), auth şeması, kısa/Türkçe adlar ───────────────────────────────
  // Bulgu: sözlük yalnız public şema kolon adlarına göre ayarlıydı; asıl sızıntı türü (ödeme yanıtı + alıcı bloğu) şemada olmayan adlarla
  // (identityNumber, surname, registrationAddress, gsmNumber, zipCode) geliyordu ve 1-2 kayıtlık dökümde hiç tanınmıyordu.
  it.each(['address', 'registrationAddress', 'home_address', 'surname', 'zipCode', 'zip_code', 'iban', 'IBAN', 'tel', 'tel_no', 'cep', 'cep_no', 'gsmNumber'])(
    'N3: %s GENEL kişisel alandır',
    (ad) => {
      expect(kapi.kisiselAlanSinifi(ad)).toBe('genel')
    },
  )

  it.each(['concept', 'telemetry', 'hotel', 'tribanner', 'zip', 'status'])(
    'N3: %s kişisel DEĞİL (kısa kökler yalnız TAM parça; `zip` tek başına yok)',
    (ad) => {
      expect(kapi.kisiselAlanSinifi(ad)).toBeNull()
    },
  )

  it.each(['address', 'registrationAddress', 'surname', 'zipCode', 'iban', 'tel', 'cep'])('N3 JSON: %s 3 dolu satırda R1, 2 satırda TEMİZ', (alan) => {
    expect(kurallar('d.json', uc(alan))).toEqual(['R1'])
    expect(kurallar('d.json', iki(alan))).toEqual([])
  })

  it('N3 JSON: iyzico `buyer` bloğu (TEK kayıt): identityNumber BELİRGİN → R1; kimlik numarası olmayan tek kayıtlık alıcı bloğu eşik altında TEMİZ', () => {
    const alici = { id: 'x', name: 'Ad', surname: 'Soyad', email: 'a@ornek.test', gsmNumber: '0500', registrationAddress: 'Adres 1', zipCode: '34000', ip: '10.0.0.1', city: 'X', country: 'Y' }
    expect(kurallar('odeme.json', JSON.stringify({ buyer: { ...alici, identityNumber: '11111111111' } }))).toEqual(['R1'])
    expect(kurallar('odeme.json', JSON.stringify({ buyer: alici }))).toEqual([]) // genel adlar eşiği (≥3 satır) altında: bilinen sınır, cetvel §8
    expect(JSON.stringify(kapi.dosyaTara('odeme.json', JSON.stringify({ buyer: { identityNumber: '11111111111' } })))).not.toContain('11111111111')
  })

  it('N3 SQL: auth şeması tabloları (users, identities) HASSAS; şema öneki fark etmez', () => {
    expect(kapi.HASSAS_TABLOLAR).toContain('users')
    expect(kapi.HASSAS_TABLOLAR).toContain('identities')
    expect(kurallar('d.sql', "INSERT INTO auth.users VALUES ('a');")).toEqual(['R2']) // kolonsuz yazım, hassas tablo
    expect(kurallar('d.sql', "INSERT INTO auth.users (id, email) VALUES ('1', 'a@ornek.test');")).toEqual(['R2']) // tek satır, genel alan, hassas tablo eşiği 1
    expect(kurallar('d.sql', "INSERT INTO auth.identities (id, provider) VALUES ('1', 'google');")).toEqual([]) // kişisel kolon yok: tablo adı tek başına yetmez
  })

  it('JSON: belirgin tolerans adı (tc_kimlik_no) TEK dolu satırda bile R1', () => {
    expect(kurallar('d.json', JSON.stringify({ tc_kimlik_no: 'dolu' }))).toEqual(['R1'])
  })

  it('JSON: aynı tolerans anahtarı 3 kez geçmeli; her biri bir kez geçen FARKLI anahtarlar toplanmaz (i18n sözlüğü yanlış alarm vermez)', () => {
    const sozluk = { email_label: 'E-posta', email_error: 'Geçersiz', phone_label: 'Telefon', telefon_hata: 'Hatalı', adres_baslik: 'Adres' }
    expect(kurallar('tr.json', JSON.stringify(sozluk))).toEqual([])
  })

  it('JSON: genel sınıfta URL/yol değeri kişisel DEĞİL (adres_tr, adres matrisi); gerçek adres metni R1; belirgin ad URL değerle de R1', () => {
    expect(kurallar('m.json', uc('adres', '/tr/urun/x-'))).toEqual([])
    expect(kurallar('m.json', uc('adres', 'https://ornek.test/x-'))).toEqual([])
    expect(kurallar('m.json', uc('adres', 'Ataturk Mah. 12 Sok. No:'))).toEqual(['R1'])
    expect(kurallar('m.json', JSON.stringify({ shipping_address: '/tr/x' }))).toEqual(['R1'])
  })

  it('JSON: ip_rating (ürün koruma sınıfı) 3 dolu satırda TEMİZ; accept_ip R1', () => {
    expect(kurallar('u.json', uc('ip_rating', 'IP6'))).toEqual([])
    expect(kurallar('u.json', uc('accept_ip', '1.2.3.'))).toEqual(['R1'])
  })

  it('CSV: tolerans başlığı (applicant_email, Telefon No) 3 dolu satırda R1; URL değerli adres sütunu TEMİZ', () => {
    const csv = (baslik: string, h: (i: number) => string) => `id,${baslik}\n${[0, 1, 2].map((i) => `${i},${h(i)}`).join('\n')}\n`
    expect(kurallar('d.csv', csv('applicant_email', (i) => `a${i}@ornek.test`))).toEqual(['R1'])
    expect(kurallar('d.csv', csv('Telefon No', (i) => `0555${i}`))).toEqual(['R1'])
    expect(kurallar('d.csv', csv('adres_tr', (i) => `/tr/urun/x${i}`))).toEqual([])
    expect(kurallar('d.csv', csv('tc_kimlik_no', () => 'dolu').split('\n').slice(0, 2).join('\n'))).toEqual(['R1'])
  })

  it('SQL: tolerans kolonu INSERT listesinde 3 satırda R2, 2 satırda TEMİZ (hassas olmayan tablo)', () => {
    const ekle = (k: number) => `INSERT INTO public.x (id, applicant_email) VALUES ${Array.from({ length: k }, (_, i) => `(${i}, 'a${i}@ornek.test')`).join(', ')};`
    expect(kurallar('d.sql', ekle(3))).toEqual(['R2'])
    expect(kurallar('d.sql', ekle(2))).toEqual([])
    expect(kurallar('d.sql', "INSERT INTO public.x (id, tc_kimlik_no) VALUES (1, 'x');")).toEqual(['R2'])
  })

  it('ham metin (ayrıştırılamayan JSON): tolerans adı 3 eşleşmede R1, 2 eşleşmede değil; "ip_rating" yanlış alarm vermez', () => {
    const ham = (alan: string, k: number) => `{ ,,, ${Array.from({ length: k }, (_, i) => `"${alan}": "x${i}"`).join(', ')}`
    const r = (alan: string, k: number) => kapi.dosyaDegerlendir('a.json', ham(alan, k)).bulgular.map((b) => b.kural)
    expect(r('applicant_email', 3)).toEqual(['R1'])
    expect(r('applicant_email', 2)).toEqual([])
    expect(r('accept_ip', 3)).toEqual(['R1'])
    expect(r('ip_rating', 3)).toEqual([])
    expect(r('tc_kimlik_no', 1)).toEqual(['R1'])
  })

  it('çıktıda DEĞER YOK: kimlik-benzeri olmayan (metin içeren) anahtar etiketi gizlenir, ham anahtar basılmaz', () => {
    const anahtar = 'ali.veli@ornek.test email'
    const nesneler = Array.from({ length: 3 }, (_, i) => ({ id: i, [anahtar]: `dolu${i}` }))
    const [b] = kapi.dosyaTara('d.json', JSON.stringify(nesneler))
    expect(b.kural).toBe('R1')
    expect(b.ayrinti).not.toContain('ali.veli')
    expect(b.ayrinti).not.toContain('@')
    expect(b.ayrinti).toContain('kişisel kalıba uyan anahtar')
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · R2 SQL satırları DOSYA genelinde TABLO başına (O3): --column-inserts, tek satırlık tohum, UPDATE', () => {
  const tek = (tablo: string, kolonlar: string, deger: string) => `INSERT INTO ${tablo} (${kolonlar}) VALUES ${deger};`
  const tekler = (n: number, tablo: string, kolonlar: string, h: (i: number) => string): string =>
    Array.from({ length: n }, (_, i) => tek(tablo, kolonlar, `(${h(i)})`)).join('\n')

  it('pg_dump --column-inserts: her satır AYRI INSERT (satır=1) — 3 INSERT genel alanda R2, 2 INSERT TEMİZ', () => {
    const e = (n: number) => tekler(n, 'public.bulten', 'id, email', (i) => `${i}, 'a${i}@ornek.test'`)
    expect(kurallar('dump.sql', e(3))).toEqual(['R2'])
    expect(kurallar('dump.sql', e(2))).toEqual([])
  })

  it('pg_dump --column-inserts: fiyat dökümü — 5 tek satırlık INSERT R3, 4 tanesi TEMİZ', () => {
    const e = (n: number) => tekler(n, 'public.fiyat', 'model_code, purchase_price_eur', (i) => `'M${i}', ${10 + i}`)
    expect(kurallar('dump.sql', e(5))).toEqual(['R3'])
    expect(kurallar('dump.sql', e(4))).toEqual([])
  })

  it('satırlar KARIŞIK biçimde de toplanır: 2 satırlık INSERT + 1 satırlık COPY aynı tablo/alan = 3', () => {
    const sql = ["INSERT INTO public.bulten (id, email) VALUES (1, 'a@ornek.test'), (2, 'b@ornek.test');", 'COPY public.bulten (id, email) FROM stdin;', '3\tc@ornek.test', '\\.'].join('\n')
    expect(kurallar('karisik.sql', sql)).toEqual(['R2'])
  })

  it('toplama TABLO başınadır: farklı tablolara dağılan 1+1+1 satır birleşmez (TEMİZ)', () => {
    const sql = [tek('public.a', 'id, email', "(1, 'a@ornek.test')"), tek('public.b', 'id, email', "(1, 'b@ornek.test')"), tek('public.c', 'id, email', "(1, 'c@ornek.test')")].join('\n')
    expect(kurallar('farkli.sql', sql)).toEqual([])
  })

  it('toplama ALAN başınadır: 1+1+1 satır ama her biri farklı genel alan (email / phone / full_name) birleşmez', () => {
    const sql = [tek('public.x', 'id, email', "(1, 'a')"), tek('public.x', 'id, phone', "(1, 'b')"), tek('public.x', 'id, full_name', "(1, 'c')")].join('\n')
    expect(kurallar('alanlar.sql', sql)).toEqual([])
  })

  it('toplama DOSYA başınadır: aynı SQL iki ayrı dosyada 2+2 satır iken birleşmez (TEMİZ)', () => {
    const e = (n: number) => tekler(n, 'public.bulten', 'id, email', (i) => `${i}, 'a${i}@ornek.test'`)
    expect(kurallar('bir.sql', e(2))).toEqual([])
    expect(kurallar('iki.sql', e(2))).toEqual([])
  })

  it.each(BEKLENEN_HASSAS_TABLOLAR.filter((t) => t !== 'product_costs'))('HASSAS tablo %s: kolon listeli TEK satırlık genel alan INSERT R2 (eşik 1)', (tablo) => {
    expect(kurallar('tohum.sql', tek(`public.${tablo}`, 'id, email', "(1, 'a@ornek.test')"))).toEqual(['R2'])
  })

  it('hassas OLMAYAN tabloda tek satırlık genel alan INSERT TEMİZ (eşik 3)', () => {
    expect(kurallar('tohum.sql', tek('public.bulten', 'id, email', "(1, 'a@ornek.test')"))).toEqual([])
  })

  it('hassas tabloda COPY tek satır da R2', () => {
    expect(kurallar('d.sql', 'COPY public.user_profiles (id, full_name) FROM stdin;\n1\tAd Soyad\n\\.\n')).toEqual(['R2'])
  })

  // ── UPDATE … SET <kişisel alan> = <dize> ────────────────────────────────────────────────────
  it.each([
    ["UPDATE public.venthub_orders SET customer_email = 'a@ornek.test' WHERE id = 1;", 'belirgin ad'],
    ["update venthub_orders set customer_name = 'Ad Soyad', status = 'x' where id = 2;", 'çoklu atama'],
    ["UPDATE ONLY public.user_profiles SET full_name = 'Ad' WHERE id = 3;", 'hassas tablo, genel alan, ONLY'],
    ['UPDATE public.suppliers SET (phone, email) = (\'0555\', \'a@ornek.test\') WHERE id = 4;', 'çok kolonlu atama'],
    ["UPDATE public.venthub_orders SET billing_address = $$Adres 1$$ WHERE id = 5;", 'dollar-quote değer'],
    ['UPDATE "public"."suppliers" SET "tax_no" = \'1234567890\' WHERE id = 6;', 'tırnaklı ad'],
  ])('UPDATE KIRMIZI (R2): %s [%s]', (sql) => {
    expect(kurallar('duzelt.sql', sql)).toEqual(['R2'])
  })

  it.each([
    ["UPDATE public.venthub_orders SET customer_email = lower(customer_email) WHERE id = 1;", 'fonksiyon: değer atamaz'],
    ["UPDATE public.venthub_orders SET customer_email = '' WHERE id = 1;", 'boş dize'],
    ["UPDATE public.venthub_orders SET customer_email = NULL WHERE customer_email = 'a@ornek.test';", 'NULL; kişisel değer yalnız WHERE\'de'],
    ["UPDATE public.venthub_orders SET status = 'x' WHERE customer_email = 'a@ornek.test';", 'kişisel alan yalnız koşulda'],
    ["UPDATE public.bulten SET email = 'a@ornek.test' WHERE id = 1;", 'hassas olmayan tablo, genel alan, tek ifade'],
    ["UPDATE public.products SET name = 'x' WHERE id = 1;", 'kişisel olmayan kolon'],
    // ALT-39 son tur (sabotaj O3-6 ile bulundu): SET listesi `from`/`where` sınırında biter. Sınır düşerse çok tablolu `FROM a, b` virgülü
    // listeyi böler ve WHERE içindeki `b.customer_email = '...'` bir ATAMA sanılırdı (yanlış alarm: meşru düzeltme migration'ı bloklanır).
    ["UPDATE public.venthub_orders SET status = 'x' FROM public.a, public.b WHERE b.customer_email = 'a@ornek.test';", 'çok tablolu FROM: kişisel alan yalnız koşulda'],
  ])('UPDATE TEMİZ: %s [%s]', (sql) => {
    expect(kurallar('duzelt.sql', sql)).toEqual([])
  })

  it('UPDATE: hassas olmayan tabloda genel alanı 3 ayrı UPDATE ile atamak R2 (ifadeler dosya genelinde toplanır)', () => {
    const e = (n: number) => Array.from({ length: n }, (_, i) => `UPDATE public.bulten SET email = 'a${i}@ornek.test' WHERE id = ${i};`).join('\n')
    expect(kurallar('d.sql', e(3))).toEqual(['R2'])
    expect(kurallar('d.sql', e(2))).toEqual([])
  })

  it('UPDATE bulgusu DEĞER taşımaz: yalnız ifade türü ve alan adı', () => {
    const [b] = kapi.dosyaTara('d.sql', `UPDATE public.venthub_orders SET customer_email = '${GIZLI_EPOSTA}' WHERE id = 1;`)
    expect(b.ayrinti).toContain('UPDATE')
    expect(b.ayrinti).toContain('customer_email')
    expect(b.ayrinti).not.toContain('gizli.kisi')
  })

  it('UPDATE içindeki dize `;` ya da `set` içerse de ayrıştırma bozulmaz', () => {
    expect(kurallar('d.sql', "UPDATE public.venthub_orders SET note = 'a;b set x = 1', customer_phone = '0555' WHERE id = 1;")).toEqual(['R2'])
    expect(kurallar('d.sql', "UPDATE public.venthub_orders SET note = 'customer_phone = 5555555' WHERE id = 1;")).toEqual([])
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · R2 N1 (3. tur): INSERT ... SELECT, WITH önekli INSERT/UPDATE, takma ad, VALUES alt sorgusu', () => {
  // Bulgu: R2 yalnız `INSERT INTO t (kolonlar) VALUES`, `UPDATE` ve `COPY` biçimlerini veri sayıyordu; aynı veriyi `SELECT 'x' WHERE NOT EXISTS`
  // (idempotent tohum), `WITH ...` öneki, `INSERT INTO t AS a` takma adı ya da `FROM (VALUES ...)` alt sorgusuyla yazan ifade kapıyı geçiyordu.
  it.each([
    ["INSERT INTO public.venthub_orders (id, customer_email) SELECT 'x', 'a@ornek.test' WHERE NOT EXISTS (SELECT 1 FROM public.venthub_orders WHERE id = 'x');", 'idempotent tohum: belirgin kolona literal'],
    ["INSERT INTO public.venthub_orders AS o (id, customer_name) VALUES ('1', 'Ad Soyad');", 'takma ad (AS o) + VALUES'],
    ["WITH yeni AS (SELECT 'x'::text AS id) INSERT INTO public.venthub_orders (id, customer_email) VALUES ('1', 'a@ornek.test');", 'WITH öneki + VALUES'],
    ["WITH d(e) AS (VALUES ('a@ornek.test')) INSERT INTO public.venthub_orders (customer_email) SELECT e FROM d;", 'veri CTE VALUES içinde, ana ifade yalnız SELECT e'],
    ["INSERT INTO public.user_profiles (id, email) SELECT gen_random_uuid(), 'a@ornek.test';", 'hassas tablo, genel alan, tek satır (eşik 1)'],
    ["INSERT INTO public.venthub_orders (customer_email) SELECT * FROM (VALUES ('a@ornek.test')) AS v(e);", 'FROM (VALUES ...) alt sorgusu'],
    ["WITH d AS (VALUES ('a@ornek.test')) UPDATE public.venthub_orders SET customer_email = d.column1 FROM d WHERE id = 1;", 'WITH + UPDATE, sağ taraf CTE sütunu'],
    ["UPDATE public.venthub_orders SET customer_email = v.e FROM (VALUES ('a@ornek.test')) v(e) WHERE id = 1;", 'UPDATE ... FROM (VALUES ...)'],
    ["INSERT INTO public.venthub_orders SELECT 'x', 'a@ornek.test';", 'kolon listesiz SELECT, hassas tablo'],
    ["insert into   public.venthub_orders   as o   (customer_phone)   select   '0500 000 00 00'  ;", 'küçük harf ve bol boşluk'],
  ])('KIRMIZI (R2): %s [%s]', (sql) => {
    expect(kurallar('tohum.sql', sql)).toEqual(['R2'])
  })

  it.each([
    ['INSERT INTO public.venthub_orders (customer_email) SELECT customer_email FROM public.eski_siparisler;', 'DB içi kopya: dize literal\'i yok'],
    // kolon listesiz DB içi kopya hassas tabloya yazar ama VERİ taşımaz (tablo yedekleme/taşıma migration'ı): "kolon listesiz hassas tablo" kuralı literal olmadan çalışmaz
    ['INSERT INTO public.venthub_orders SELECT * FROM public.eski_siparisler;', 'kolon listesiz DB içi kopya, hassas tablo: literal yok'],
    ["INSERT INTO public.user_profiles (id, email, role) SELECT auth.uid(), auth.jwt() ->> 'email', 'admin' WHERE NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE email = 'x@ornek.test');", 'e-posta kolonu JWT talebinden dolar; literal yalnız rol ve koşulda (gerçek betik biçimi)'],
    ["WITH x AS (SELECT * FROM public.venthub_orders WHERE customer_email = 'a@ornek.test') SELECT * FROM x;", 'salt SELECT (WITH)'],
    ["INSERT INTO public.products (id, name) SELECT id, name FROM public.old_products WHERE name = 'x';", 'kişisel olmayan tablo, koşulda literal'],
    ["UPDATE public.products SET name = 'x' FROM (VALUES ('y')) v WHERE true;", 'kişisel olmayan kolon, VALUES alt sorgusu'],
    ["INSERT INTO public.venthub_orders (customer_email) SELECT current_setting('app.admin_mail');", 'current_setting argümanı anahtar, veri değil'],
    ["INSERT INTO public.audit_log (id, kaynak) SELECT 'x', 'tohum' WHERE NOT EXISTS (SELECT 1 FROM public.venthub_orders WHERE customer_email = 'a@ornek.test');", 'belirgin ad yalnız NOT EXISTS koşulunda: ifade metninde geçer ama atanmaz'],
  ])('TEMİZ: %s [%s]', (sql) => {
    expect(kurallar('tohum.sql', sql)).toEqual([])
  })

  it('SELECT biçimi bulgusu DEĞER taşımaz', () => {
    const [b] = kapi.dosyaTara('tohum.sql', `INSERT INTO public.venthub_orders (customer_email) SELECT '${GIZLI_EPOSTA}';`)
    expect(b.kural).toBe('R2')
    expect(JSON.stringify(b)).not.toContain('gizli.kisi')
  })

  it('SELECT biçimi: hizalama kolon listesiyle yapılır (literal başka kolonda ise kişisel kolon temiz); hizalanamayınca korumacı', () => {
    // literal yalnız `role` konumunda: kişisel kolon (customer_email) değer almıyor
    expect(kurallar('d.sql', "INSERT INTO public.venthub_orders (customer_email, status) SELECT o.customer_email, 'x' FROM public.eski o;")).toEqual([])
    // sayı uyuşmuyor (`*`): hizalanamaz → TÜM kolonlar değer alır sayılır (korumacı)
    expect(kurallar('d.sql', "INSERT INTO public.venthub_orders (customer_email, status) SELECT *, 'x' FROM public.eski;")).toEqual(['R2'])
  })
})

// ═════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · D3: sınırsız düzenli ifade YOK — uzun girdi doğrusal zamanda biter', () => {
  /** Girdiyi AYRI süreçte, sert zaman aşımıyla çözer: kübik/karesel desen geri gelirse test KİLİTLENMEZ, kırmızı olur. */
  function zamanOlc(kod: string): { bitti: boolean; ms: number; cikti: string } {
    const bas = Date.now()
    const r = spawnSync(process.execPath, ['-e', kod], { env: temizOrtam(), encoding: 'utf8', timeout: 20_000, input: '' })
    return { bitti: r.status === 0 && !r.error, ms: Date.now() - bas, cikti: `${r.stdout ?? ''}${r.stderr ?? ''}` }
  }
  const kapiYolu = JSON.stringify(path.join(KOK, 'scripts/security/depo-dokum-kapisi.cjs'))

  it('200 000 harflik ayrıştırılamayan JSON: ham tarama (fiyat/kimlik desenleri) 2 sn içinde biter', { timeout: 40_000 }, () => {
    const o = zamanOlc(`const k=require(${kapiYolu});const t=Date.now();const d=k.dosyaDegerlendir('a.json','x{'+'a'.repeat(200000));if(!d.olculemedi.length)process.exit(3);console.log(Date.now()-t)`)
    expect(o.bitti, `zaman aşımı ya da hata: ${o.cikti}`).toBe(true)
    expect(Number(o.cikti.trim()), 'ham tarama 2 sn üstünde').toBeLessThan(2000)
  })

  it('200 000 karakterlik "price" tekrarı (alternasyon yakınlığı: kübik geri izleme girdisi) 2 sn içinde biter', { timeout: 40_000 }, () => {
    const o = zamanOlc(`const k=require(${kapiYolu});const t=Date.now();k.dosyaDegerlendir('a.json','x{'+'price'.repeat(40000));console.log(Date.now()-t)`)
    expect(o.bitti, `zaman aşımı ya da hata: ${o.cikti}`).toBe(true)
    expect(Number(o.cikti.trim())).toBeLessThan(2000)
  })

  it('200 000 harflik CSV BAŞLIK hücresi (e-posta deseni karesel girdisi) 2 sn içinde biter', { timeout: 40_000 }, () => {
    const o = zamanOlc(`const k=require(${kapiYolu});const t=Date.now();k.dosyaDegerlendir('a.csv','a'.repeat(200000)+'\\n1\\n');console.log(Date.now()-t)`)
    expect(o.bitti, `zaman aşımı ya da hata: ${o.cikti}`).toBe(true)
    expect(Number(o.cikti.trim())).toBeLessThan(2000)
  })

  it('200 000 harflik uzun hücre başlıkta VE gövdede: sonuç yine doğru (başlıksız CSV sayılmaz)', () => {
    const r = kapi.dosyaDegerlendir('a.csv', `${'a'.repeat(2000)},b\n1,2\n`)
    expect(r.olculemedi).toEqual([])
  })

  // ── 3. tur (N5): O2 ile gelen camelCase ayırma deseni ve eski SQL başlık desenleri KARESELDİ ────────────────────────────────────
  it('N5: 300 000 BÜYÜK HARFLİK anahtar adı 2 sn içinde sınıflanır (camelCase ayırma deseni karesel değil)', { timeout: 40_000 }, () => {
    const o = zamanOlc(`const k=require(${kapiYolu});const t=Date.now();k.kisiselAlanSinifi('A'.repeat(300000));console.log(Date.now()-t)`)
    expect(o.bitti, `zaman aşımı ya da hata: ${o.cikti}`).toBe(true)
    expect(Number(o.cikti.trim())).toBeLessThan(2000)
  })

  it('N5: 300 000 BÜYÜK HARFLİK JSON anahtarı olan dosya 2 sn içinde değerlendirilir', { timeout: 40_000 }, () => {
    const o = zamanOlc(`const k=require(${kapiYolu});const t=Date.now();k.dosyaDegerlendir('a.json',JSON.stringify([{['A'.repeat(300000)]:'x'}]));console.log(Date.now()-t)`)
    expect(o.bitti, `zaman aşımı ya da hata: ${o.cikti}`).toBe(true)
    expect(Number(o.cikti.trim())).toBeLessThan(2000)
  })

  it('N5: uzun anahtarın SONUNDAKİ parça hâlâ okunur (`..._ip` son parça kuralı): ilk 64 + son 64 karakter ayrılır', () => {
    expect(kapi.kisiselAlanSinifi(`${'a'.repeat(300)}_client_ip`)).toBe('genel')
    expect(kapi.kisiselAlanSinifi(`${'a'.repeat(300)}_ip_rating`)).toBeNull()
  })

  it('N5: 300 000 "(" içeren INSERT başlığı ve COPY başlığı 2 sn içinde ayrıştırılır (başlık desenleri sınırlı)', { timeout: 40_000 }, () => {
    const o = zamanOlc(
      `const k=require(${kapiYolu});const t=Date.now();k.dosyaDegerlendir('d.sql','INSERT INTO '+'('.repeat(300000)+' VALUES (1);');k.dosyaDegerlendir('e.sql','COPY '+'('.repeat(300000)+' FROM stdin;');console.log(Date.now()-t)`,
    )
    expect(o.bitti, `zaman aşımı ya da hata: ${o.cikti}`).toBe(true)
    expect(Number(o.cikti.trim())).toBeLessThan(2000)
  })

  it('N5: tablo adından sonra 300 000 boşluk olan INSERT başlığı 2 sn içinde ayrıştırılır (bitişik `\\s*` karesel değil) ve doğru çözülür', { timeout: 40_000 }, () => {
    const o = zamanOlc(
      `const k=require(${kapiYolu});const t=Date.now();const d=k.dosyaDegerlendir('d.sql','INSERT INTO public.venthub_orders'+' '.repeat(300000)+'(customer_email) VALUES (1);');console.log(Date.now()-t+' '+d.bulgular.map((b)=>b.kural).join(','))`,
    )
    expect(o.bitti, `zaman aşımı ya da hata: ${o.cikti}`).toBe(true)
    const [ms, kural] = o.cikti.trim().split(' ')
    expect(Number(ms)).toBeLessThan(2000)
    expect(kural).toBe('R2') // boşluk dizisi başlığı gizleyemez: belirgin kolon yine yakalanır
  })

  it('N5: çok literalli SELECT listesi (her biri JSON anahtarı) 2 sn içinde ölçülür (literal öncesi pencere sınırlı)', { timeout: 40_000 }, () => {
    const o = zamanOlc(
      `const k=require(${kapiYolu});const t=Date.now();k.dosyaDegerlendir('d.sql','INSERT INTO public.t (a) SELECT '+"j->>'k'||".repeat(100000)+"j;");console.log(Date.now()-t)`,
    )
    expect(o.bitti, `zaman aşımı ya da hata: ${o.cikti}`).toBe(true)
    expect(Number(o.cikti.trim())).toBeLessThan(2000)
  })

  it('e-posta deseni sınırlı ama gerçek adresi yakalıyor: başlıksız CSV hâlâ ölçülemedi', () => {
    expect(kapi.dosyaDegerlendir('d.csv', `${GIZLI_EPOSTA},Ad,5\nb@ornek.test,Ad2,6\n`).olculemedi.length).toBe(1)
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

  // ── 3. tur (N2): JSON başarıyla ayrıştırılınca yapının DIŞINDA kalan metin hiç taranmıyordu ────────────────────────────────────
  // Bulgu: yorumlara (`/* {...} */`, `//`) gömülmüş kayıtlar ya da `[]` öncesinde/sonrasında düz metin/CSV dökümü, dosya "çözüldü" diye kapıdan temiz çıkıyordu.
  it.each([
    ['blok yorumda belirgin alanlı kayıt', `[{ "id": 1 }]\n/* { "customer_email": "${GIZLI_EPOSTA}" } */`],
    ['satır yorumunda belirgin alanlı kayıt', `// { "customer_name": "${GIZLI_AD}" }\n[{ "id": 1 }]`],
    ['yorumda iç içe kayıt, `key=value` biçimi', `{ "id": 1 } /* customer_phone = "0500 000 00 00" */`],
  ])('N2 KIRMIZI (R1): %s', (_ad, metin) => {
    expect(kurallar('a.json', metin)).toEqual(['R1'])
    expect(JSON.stringify(kapi.dosyaDegerlendir('a.json', metin))).not.toContain('gizli.kisi')
  })

  it('N2: yorumdaki kişisel olmayan metin TEMİZ ve ölçülemedi değil (yanlış alarm yok)', () => {
    const metin = '// derleme notu: { sürüm, [x] }\n/* tasarım: customer_email alanı kaldırıldı */\n{ "id": 1 }'
    expect(kurallar('a.json', metin)).toEqual([])
    expect(kapi.dosyaDegerlendir('a.json', metin).olculemedi).toEqual([])
  })

  it('N2: `[]` sonrası düz metin/CSV dökümü ve baştaki düz metin → ölçülemedi (gizlenemez); küçük artık (`;`) ve UTF-16 CRLF çöpü TEMİZ', () => {
    const csv = '[]\ncustomer_email,customer_name\na@ornek.test,Ad Soyad\nb@ornek.test,Ad Iki\n'
    const r = kapi.dosyaDegerlendir('a.json', csv)
    expect(r.olculemedi.length).toBe(1)
    expect(r.olculemedi[0]).toMatch(/DIŞINDA/)
    expect(kapi.dosyaDegerlendir('a.json', 'kayıt listesi aşağıdadır, dikkat:\n[{ "id": 1 }]').olculemedi.length).toBe(1)
    expect(kapi.dosyaDegerlendir('a.json', '{ "a": 1 };').olculemedi).toEqual([])
    expect(kapi.dosyaDegerlendir('a.json', '{ "a": 1 }\n\n  ').olculemedi).toEqual([])
    // sayım BOŞLUK/NUL/BOM hariç karakterlere bakar: çöp yolundan (düz ayrıştırma başarısız) geçen ve çoğu boşluk olan artık yanlış alarm vermez
    expect(kapi.dosyaDegerlendir('a.json', `{ "a": 1 };${' '.repeat(60)}\n\n`).olculemedi).toEqual([])
    expect(kapi.dosyaDegerlendir('a.json', `{ "a": 1 };${' '.repeat(60)}\n\n${'x'.repeat(40)}`).olculemedi.length).toBe(1)
  })

  it('N2: baş/son çöpün içindeki kayıt ham taramaya girer (ölçülemedi yanında R1 de çıkar)', () => {
    const r = kapi.dosyaDegerlendir('a.json', `[{ "id": 1 }]\n"customer_email": "${GIZLI_EPOSTA}" bu da veri, ayrıca uzun bir metin ekliyoruz`)
    expect(r.bulgular.map((b) => b.kural)).toEqual(['R1'])
    expect(r.olculemedi.length).toBe(1)
  })

  // ── genel alanlar: ≥3 dolu satır eşiği (bulgu 2)──────────────────────────────────────────
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
    ['rapor/siparisler.parquet', '.parquet'],
    ['rapor/musteriler.ods', '.ods'],
    ['rapor/eski.mdb', '.mdb'],
    ['rapor/yeni.accdb', '.accdb'],
    // 3. tur (N6): cetvel `.dump*` diyordu, kod yalnız `.dump` ve tek uzantıyı yakalıyordu; tarih/yedek sonekli adlar kaçıyordu.
    ['yedek/sunucu.dump-20261007', '.dump'],
    ['yedek/sunucu.dump_eski', '.dump'],
    ['yedek/sunucu.dump.20261007', '.dump'],
    ['yedek/sunucu.dump.sql.gz', '.dump'],
    // 3. tur (N6): SQLite yan dosyaları (WAL/shm/journal): imza taşımaz, yazılmamış işlemleri tutar
    ['yedek/uygulama.db-wal', 'sqlite-wal/shm/journal'],
    ['yedek/uygulama.db-shm', 'sqlite-wal/shm/journal'],
    ['yedek/uygulama.db-journal', 'sqlite-wal/shm/journal'],
    ['yedek/uygulama.sqlite-wal', 'sqlite-wal/shm/journal'],
    ['yedek/uygulama.sqlite3-journal', 'sqlite-wal/shm/journal'],
    ['YEDEK/UYGULAMA.DB-WAL', 'sqlite-wal/shm/journal'],
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
    // N6: `.dump` yalnız AYRAÇLA devam eden sonekte kırmızıdır; sözcüğün parçası olan `dumpling` değil. `-wal` yalnız SQLite uzantısından sonra.
    'docs/yemek/dumpling.md',
    'docs/notlar/x.dumpster.txt',
    'src/lib/walker.ts',
    'docs/notlar/kayit-wal-notu.md',
    'docs/notlar/trade-journal', // uzantısız, `-journal` ile biten ama SQLite uzantısı olmayan ad
    'scripts/bin/gece-wal',
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

  it('SQLite imzalı dosya UZANTIDAN BAĞIMSIZ → R6 (imza kancası); imzasızı değil (ALT-39 2. tur, O1)', () => {
    // BİLİNÇLİ DEĞİŞİKLİK (O1): önceki sürümde imzaya yalnız 7 uzantıda bakılıyordu ve bu test `veri/x.png`'yi aday DIŞI sayıyordu.
    // Artık imza uzantıdan bağımsız okunur: imzalı `.png` de kırmızıdır; imzasız `.bin` yine temizdir.
    const imzali = new Set(['veri/dosya', 'veri/yedek.bak', 'veri/x.png', 'veri/app.db.20261006', 'veri/x.sqlite.orig', 'veri/veri.json'])
    const dosyalar = [...imzali, 'veri/metin.bin']
    const s = kapi.tara({ dosyalar, oku: () => null, izin: [], ikili: (y) => imzali.has(y) })
    expect(s.ihlaller.map((k) => k.dosya).sort()).toEqual([...imzali].sort())
    expect(s.ihlaller.every((k) => k.kural === 'R6')).toBe(true)
  })

  it('imza kancası her izlenen dosya için çağrılır (uzantı süzgeci yok), uzantısı zaten R6 olan dosya için çağrılmaz', () => {
    const sorulan: string[] = []
    kapi.tara({ dosyalar: ['a.png', 'b', 'c.json', 'd.db', 'e.md'], oku: () => null, izin: [], ikili: (y) => (sorulan.push(y), false) })
    expect(sorulan.sort()).toEqual(['a.png', 'b', 'c.json', 'e.md'])
  })

  it('CLI: uzantısı değiştirilmiş TARİH/YEDEK SONEKLİ SQLite dosyaları (app.db.20261006, x.sqlite.orig, data.json) R6 KIRMIZI; düz metin temiz', { timeout: 60_000 }, () => {
    const imza = Buffer.concat([Buffer.from('SQLite format 3'), Buffer.from([0]), Buffer.alloc(100)])
    const d = sahteDepo({ 'veri/app.db.20261006': imza, 'veri/x.sqlite.orig': imza, 'veri/data.png': imza, 'veri/duz.orig': Buffer.from('düz metin') })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    for (const y of ['veri/app.db.20261006', 'veri/x.sqlite.orig', 'veri/data.png']) expect(r.cikti).toContain(y)
    expect(r.cikti).not.toContain('veri/duz.orig')
  })

  it('sqliteImzasiMi: yok olan dosya, dizin ve kısa dosya false; imzalı dosya true', () => {
    const d = geciciDizin('depo-dokum-imza-')
    fs.mkdirSync(path.join(d, 'altdizin'))
    fs.writeFileSync(path.join(d, 'kisa'), 'SQLite')
    fs.writeFileSync(path.join(d, 'imzali'), Buffer.concat([Buffer.from('SQLite format 3'), Buffer.from([0])]))
    const imza = kapi.sqliteImzasiMi(d)
    expect(imza('yok')).toBe(false)
    expect(imza('altdizin')).toBe(false)
    expect(imza('kisa')).toBe(false)
    expect(imza('imzali')).toBe(true)
  })

  // 3. tur (N6): `pg_dump -Fc` (özel biçim) arşivinin sihirli sayısı. Uzantısı `.bin`/uzantısız olan dökümü SQLite imzası görmezdi.
  it('pg_dump özel biçim arşivi (PGDMP imzası) UZANTIDAN BAĞIMSIZ → R6; sqliteImzasiMi true; imza yalnız dosyanın BAŞINDA', () => {
    const d = geciciDizin('depo-dokum-pgdump-')
    fs.writeFileSync(path.join(d, 'sunucu.bin'), Buffer.concat([Buffer.from('PGDMP'), Buffer.from([1, 14, 0]), Buffer.alloc(40)]))
    fs.writeFileSync(path.join(d, 'ortada'), Buffer.concat([Buffer.from('xxxxxxxx'), Buffer.from('PGDMP'), Buffer.alloc(40)]))
    fs.writeFileSync(path.join(d, 'kucuk-harf'), Buffer.concat([Buffer.from('pgdmp'), Buffer.alloc(40)]))
    const imza = kapi.sqliteImzasiMi(d)
    expect(imza('sunucu.bin')).toBe(true)
    expect(imza('ortada')).toBe(false)
    expect(imza('kucuk-harf')).toBe(false)
    const s = kapi.tara({ dosyalar: ['sunucu.bin', 'ortada'], oku: () => null, izin: [], ikili: imza })
    expect(s.ihlaller.map((k) => `${k.kural} ${k.dosya}`)).toEqual(['R6 sunucu.bin'])
    expect(s.ihlaller[0].ayrinti).toMatch(/pg_dump arşiv imzası/)
  })

  it('CLI: pg_dump özel biçim arşivi (uzantısı .bin ve uzantısız) R6 KIRMIZI; düz metin temiz', { timeout: 60_000 }, () => {
    const pgdump = Buffer.concat([Buffer.from('PGDMP'), Buffer.from([1, 14, 0]), Buffer.alloc(120)])
    const d = sahteDepo({ 'veri/yedek.bin': pgdump, 'veri/dosya': pgdump, 'veri/duz.bin': Buffer.from('düz metin, dökümle ilgisi yok') })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/yedek.bin')
    expect(r.cikti).toContain('veri/dosya')
    expect(r.cikti).not.toContain('veri/duz.bin')
    expect(r.cikti).toContain('ikili-veritabani')
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

  it.each(['**/db-backup*', '**/[Dd][Bb]-[Bb]ackup*', '*.dump', '*.dump.*', '*.dump-*', '*.dump_*', '*.sql.gz', '*.backup', '*.pgdump', '*.db-wal', '*.db-shm', '*.db-journal', '*.sqlite-wal', '*.sqlite3-journal'])('`%s` var', (kalip) => {
    expect(kalipLari()).toContain(kalip)
  })

  it('kalıplar gerçekten ignore ediyor (git check-ignore): farklı dizin, DB-Backup yazımı, sıkıştırılmış yedekler', () => {
    const d = geciciDizin('depo-dokum-ignore-')
    git(d, 'init', '-q')
    fs.copyFileSync(GITIGNORE_YOLU, path.join(d, '.gitignore'))
    for (const yol of ['yedek/db-backup-1/x.json', 'a/b/DB-Backup-2026/x.json', 'x/sunucu.dump', 'x/sunucu.dump.gz', 'x/sunucu.dump-20261007', 'x/sunucu.dump_eski', 'x/s.sql.gz', 'x/s.backup', 'x/s.pgdump', 'x/uygulama.db-wal', 'x/uygulama.sqlite-journal']) {
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
  // ci.yml artık BİRDEN ÇOK iş taşıyor (master #1741: `test-shard` kendi Checkout/Install/Test adımlarıyla): konum aramaları YALNIZ `ci`
  // işinin satır aralığında yapılır; yoksa başka işin adımı bulunur ve "adım yok" kırmızısı sessizce yeşile döner (sabotajla/birleştirmeyle bulundu).
  const ciBas = satirlar.findIndex((s) => /^ {2}ci:\s*$/.test(s))
  const ciSonraki = ciBas < 0 ? -1 : satirlar.findIndex((s, i) => i > ciBas && /^ {2}[A-Za-z0-9_-]+:\s*$/.test(s))
  const ciSon = ciSonraki < 0 ? satirlar.length : ciSonraki
  const ciIcinde = (re: RegExp): number => (ciBas < 0 ? -1 : satirlar.findIndex((s, i) => i > ciBas && i < ciSon && re.test(s)))
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

  const kurulum = ciIcinde(/^ {6}- name: Install dependencies\s*$/)
  if (kurulum < 0) ihlaller.push("'Install dependencies' adımı bulunamadı (konum ölçülemedi)")
  else if (bas > kurulum) ihlaller.push("adım 'Install dependencies'ten SONRA: önceki adımlar kırmızıyken ve bağımlılıksız çalışabilecekken geç koşuyor")
  const testBas = ciIcinde(/^ {6}- name: Test\s*$/)
  if (testBas < 0) ihlaller.push("'Test' adımı bulunamadı (konum ölçülemedi)")
  else if (bas > testBas) ihlaller.push("adım 'Test'ten SONRA: testler kırmızıyken hiç koşmaz")

  // D4: ara commit taraması TAM GEÇMİŞ ister (sığ klonda `HEAD^1`/`HEAD^2` yok → sessizce atlanır). Bağımlılık: Checkout `with:` altında
  // `fetch-depth: 0`. ⚠Girdi kümesinin TAM sabitlemesi `ci-edited-ayna.test.ts`'tedir (CHECKOUT_GIRDILERI); burada tekrar EDİLMEZ, yalnız
  // bu kapının bağımlılığı doğrulanır (biri yanlışlıkla gevşetilirse iki test de kırmızı verir, ama bu test KENDİ nedenini söyler).
  const coBas = ciIcinde(/^ {6}- name: Checkout\s*$/)
  if (coBas < 0) ihlaller.push("'Checkout' adımı bulunamadı: `fetch-depth: 0` ölçülemedi")
  else {
    const coSon = satirlar.findIndex((s, i) => i > coBas && /^ {6}- name:/.test(s))
    const coBlok = yorumsuz(satirlar.slice(coBas, coSon < 0 ? undefined : coSon))
    const withIdx = coBlok.findIndex((s) => /^ {8}with:\s*$/.test(s))
    const girdiler = withIdx < 0 ? [] : coBlok.slice(withIdx + 1).filter((s) => /^ {10}\S/.test(s))
    if (!girdiler.some((s) => /^ {10}fetch-depth:\s*0\s*$/.test(s))) {
      ihlaller.push('Checkout `with:` altında `fetch-depth: 0` yok: ara commit taraması sığ klonda sessizce atlanır')
    }
  }
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

  // ── D4: ara commit taraması `fetch-depth: 0` ister (tam girdi sabitlemesi: ci-edited-ayna.test.ts) ──────────────────────────
  const checkoutIndeksi = () => satirlari().findIndex((s) => /^ {6}- name: Checkout\s*$/.test(s))

  it('Checkout `with:` altında `fetch-depth: 0` var; TAM girdi sabitlemesi ci-edited-ayna.test.ts\'te kalıyor (burada tekrarlanmaz, referans doğrulanır)', () => {
    expect(ciBaglantisiniDenetle(gercek).filter((x) => x.includes('fetch-depth'))).toEqual([])
    const ayna = fs.readFileSync(path.join(KOK, 'src/__tests__/conformance/ci-edited-ayna.test.ts'), 'utf8')
    expect(ayna, 'ci-edited-ayna.test.ts Checkout girdilerini sabitlemiyor: bu kapının bağımlılığı korumasız').toMatch(/'fetch-depth': '0'/)
  })

  it('AYIRT EDİCİ: Checkout `fetch-depth: 0` satırı SİLİNİRSE kırmızı (sığ klon: ara commit taraması sessizce atlanır)', () => {
    const s = satirlari()
    const i = s.findIndex((x, k) => k > checkoutIndeksi() && /^ {10}fetch-depth:\s*0\s*$/.test(x))
    expect(i).toBeGreaterThan(0)
    s.splice(i, 1)
    ihlalVar(s.join('\n'), 'fetch-depth')
  })

  it('AYIRT EDİCİ: Checkout `fetch-depth: 1` olursa kırmızı (sınır değeri: sığ klon)', () => {
    const s = satirlari()
    const i = s.findIndex((x, k) => k > checkoutIndeksi() && /^ {10}fetch-depth:\s*0\s*$/.test(x))
    s[i] = '          fetch-depth: 1'
    ihlalVar(s.join('\n'), 'fetch-depth')
  })

  it('AYIRT EDİCİ: Checkout adımı yoksa kırmızı (konum ölçülemedi: sessiz yeşil değil)', () => {
    const s = satirlari()
    s[checkoutIndeksi()] = '      - name: Başka'
    ihlalVar(s.join('\n'), 'Checkout')
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
// BİLİNÇLİ DEĞİŞİKLİK (ALT-39 son tur): 5 → 4. 2. turda O1 imza taraması beşinci kaydı getirmişti (`.cc/memory.db.pre_qwen.20260524_1830`,
// R6); `support/` ağaçtan SİLİNİNCE R5 kaydı (tek ödeme kartı örneği) kalktı ve kartın izin yolu da kapandı. Dört kayıt da R6'dır
// (izlenen SQLite dosyaları; salt okuma ölçümü kanıt metinlerinde). Artırmak bu satırı değiştirmek demektir.
const IZIN_TAVANI = 4 // R6 x4 (izlenen SQLite dosyaları); R5 (ödeme kartı parçası) için izin YOK
/** "Gerçek bir kayıt numarası YOK": numarayı OPS verir. Kanıt metinleri bu dürüst ifadeyi taşır (sahte numara değil). */
const OPS_IFADESI = /ayrı kayıt önerilecek \(numarayı OPS verir\)/

/** Bir izin kaydının sözleşmeye uyup uymadığı: sorun listesi (boş = uyuyor). */
function izinKaydiSorunlari(e: IzinKaydi, izlenen: Set<string>): string[] {
  const s: string[] = []
  if (!['R3', 'R6'].includes(e.kural)) s.push('yalnız R3 ve R6 izin alabilir (R1/R2/R4/R5 ASLA)')
  if (/[*?[\]\\]/.test(e.yol) || e.yol.startsWith('/') || e.yol.startsWith('./')) s.push('yol düz dosya yolu olmalı (glob/kök/göreli yok)')
  if (!e.blob || !/^[0-9a-f]{40}$/.test(e.blob)) s.push('blob (git hash-object, 40 onaltılık hane) eksik: izin içeriğe bağlı olmalı')
  if (!e.neden || e.neden.trim().length < 20) s.push('neden eksik ya da çok kısa')
  if (e.kural === 'R3' && (!e.kanit || !/(sahte|örnek|ornek)/i.test(e.kanit))) s.push('R3 kanıtı "fiyat sahte/örnek" olduğunu göstermiyor')
  if (e.kural === 'R6' && (!e.kanit || !/içerik taraması/.test(e.kanit) || !/\d/.test(e.kanit) || !OPS_IFADESI.test(e.kanit))) {
    s.push('R6 kanıtı içerik taraması sayılarını ve "ayrı kayıt önerilecek (numarayı OPS verir)" ifadesini taşımıyor')
  }
  if (e.kanit && /ayrı kayıt: numara OPS/.test(e.kanit)) s.push('kanıt gerçek olmayan bir "kayıt: numara" ifadesi taşıyor (dürüst ifade: "ayrı kayıt önerilecek (numarayı OPS verir)")')
  if (!izlenen.has(e.yol)) s.push('yol izlenen ağaçta yok (yetim satır)')
  return s
}

/** Dizindeki (index) blob: `git ls-files -s`. */
function indeksBlobu(yol: string): string | null {
  const r = spawnSync('git', ['ls-files', '-s', '--', yol], { cwd: KOK, env: temizOrtam(), encoding: 'utf8' })
  const m = /^\d+ ([0-9a-f]{40}) \d\t/.exec(r.stdout ?? '')
  return m ? m[1] : null
}

/** Mutlak değerli SQLite imza içeriği (sahte). */
const SQLITE_ICERIK = Buffer.concat([Buffer.from('SQLite format 3'), Buffer.from([0]), Buffer.alloc(100)])
/** Bir içeriğin `git hash-object` değeri (sahte deponun dışında, stdin'den). */
function blobHash(icerik: Buffer): string {
  const r = spawnSync('git', ['hash-object', '--stdin'], { env: temizOrtam(), input: icerik })
  return String(r.stdout).trim()
}

describe('INV-DEPO-DOKUM-1 · İZİN LİSTESİ sınırlı (R3 / R6; R5 kart parçası için izin YOK)', () => {
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
      [
        'R6 memory.db',
        'R6 registry/_legacy/registry.db',
        'R6 registry/registry.db',
        'R6 .cc/memory.db.pre_qwen.20260524_1830', // ALT-39 2. tur, O1: imza taramasının yeni isabeti (ölçüm kanıt metninde)
      ].sort(),
    )
  })

  it('mevcut her kayıt sözleşmeye uyuyor ve GERÇEKTEN bir isabeti muaf tutuyor (yetim değil)', () => {
    const ag = izlenen()
    for (const e of kapi.IZIN_LISTESI) {
      expect(izinKaydiSorunlari(e, ag), e.yol).toEqual([])
      if (e.kural === 'R6') {
        // `ikili`: SQLite imzası UZANTIDAN BAĞIMSIZ okunur (uzantısı .db olmayan kayıt da gerçekten isabet vermeli)
        expect(kapi.tara({ dosyalar: [e.yol], oku: () => null, izin: [], ikili: kapi.sqliteImzasiMi(KOK) }).ihlaller.some((k) => k.kural === 'R6'), `${e.yol}: izin gereksiz`).toBe(true)
      } else {
        const icerik = fs.readFileSync(path.join(KOK, e.yol), 'utf8')
        expect(kapi.dosyaTara(e.yol, icerik).some((b) => b.kural === e.kural), `${e.yol}: izin gereksiz`).toBe(true)
      }
    }
  })

  it('her kaydın BLOB\'u dizindeki (git ls-files -s) içerikle AYNI: bayat blob izni sessizce düşürür, burada adıyla kırmızı olur', () => {
    for (const e of kapi.IZIN_LISTESI) {
      expect(indeksBlobu(e.yol), `${e.yol}: dizinde yok`).not.toBeNull()
      expect(e.blob, `${e.yol}: blob dizindeki içerikle uyuşmuyor (dosya değişti: kanıtı yeniden ölç ve blob'u güncelle)`).toBe(indeksBlobu(e.yol))
    }
  })

  it('blob alanı BENZERSİZ biçimli (40 onaltılık hane) ve kayıtlar arasında yinelenmiyor', () => {
    const bloblar = kapi.IZIN_LISTESI.map((e) => e.blob ?? '')
    for (const b of bloblar) expect(b).toMatch(/^[0-9a-f]{40}$/)
    expect(new Set(bloblar).size).toBe(bloblar.length)
  })

  it('kanıt metinlerinde GERÇEK OLMAYAN "ayrı kayıt: numara OPS\'tan" ifadesi yok; dürüst ifade var', () => {
    for (const e of kapi.IZIN_LISTESI) {
      expect(e.kanit, e.yol).not.toMatch(/ayrı kayıt: numara OPS/)
      expect(e.kanit, e.yol).toMatch(OPS_IFADESI)
    }
  })

  it('sözleşme kontrolü blob eksikliğini ve eski "numara OPS" ifadesini YAKALAR', () => {
    const ag = new Set(['veri/yerel.db'])
    const ikili: IzinKaydi = { yol: 'veri/yerel.db', kural: 'R6', blob: 'a'.repeat(40), neden: 'yerel hafıza veritabanı, içerik boş', kanit: 'içerik taraması: 2 tablo, desen 0; ayrı kayıt önerilecek (numarayı OPS verir)' }
    expect(izinKaydiSorunlari(ikili, ag)).toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, blob: undefined }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, blob: 'xyz' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, blob: 'A'.repeat(40) }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, kanit: "içerik taraması: 2 tablo, desen 0; ayrı kayıt: numara OPS'tan" }, ag)).not.toEqual([])
  })

  it('sözleşme kontrolü KENDİSİ çalışıyor: kötü kayıtlar teker teker yakalanır', () => {
    const ag = new Set(['veri/urunler.json', 'veri/yerel.db', 'veri/kart.json'])
    const iyi: IzinKaydi = { yol: 'veri/urunler.json', kural: 'R3', blob: 'b'.repeat(40), neden: 'test fikstürü, 6 uydurma ürün satırı', kanit: 'fiyat sahte: tüm değerler 1000-1005 arası örnek' }
    expect(izinKaydiSorunlari(iyi, ag)).toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, kural: 'R1' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, kural: 'R2' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, kural: 'R4' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, yol: 'veri/*.json' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, neden: 'x' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, kanit: 'gerçek fiyat listesi' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...iyi, yol: 'baska/dosya.json' }, ag)).not.toEqual([])
    const ikili: IzinKaydi = { yol: 'veri/yerel.db', kural: 'R6', blob: 'c'.repeat(40), neden: 'yerel hafıza veritabanı, içerik boş', kanit: 'içerik taraması: 2 tablo, desen 0; ayrı kayıt önerilecek (numarayı OPS verir)' }
    expect(izinKaydiSorunlari(ikili, ag)).toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, kanit: 'içerik taraması yok sayı yok' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, kanit: 'tablo 2 sayı var' }, ag)).not.toEqual([])
    expect(izinKaydiSorunlari({ ...ikili, kanit: 'içerik taraması: 2 tablo' }, ag)).not.toEqual([])
    // R5 (ödeme kartı parçası) için izin yolu YOK (ALT-39 son tur): iyi görünen kayıt (blob, neden, "sandbox" kanıtı, yol hepsi sözleşmeye uygun)
    // yalnız kural R5 olduğu için reddedilir. Kural kümesi gevşerse (R5 geri gelirse) bu kol kırmızı olur.
    const kart: IzinKaydi = { yol: 'veri/kart.json', kural: 'R5', blob: 'd'.repeat(40), neden: 'destek yükü örneği, sandbox test kartı', kanit: 'sandbox kart biçimi: 5/5 örnek; ayrı kayıt önerilecek (numarayı OPS verir)' }
    expect(izinKaydiSorunlari(kart, ag)).toEqual(['yalnız R3 ve R6 izin alabilir (R1/R2/R4/R5 ASLA)'])
    expect(izinKaydiSorunlari({ ...iyi, kural: 'R5' }, ag)).not.toEqual([])
  })

  const fiyatDokumu = JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, price: 100 + i })))
  // O4: kayıt BLOB taşır; `tara` içeriğin blob'unu `blobOf` ile sorar. Sahte blob değerleri (gerçek hash değil): eşleşme yalnız eşitliğe bakar.
  const BLOB_A = 'a'.repeat(40)
  const BLOB_B = 'b'.repeat(40)
  const izinli: IzinKaydi[] = [{ yol: 'veri/urunler.json', kural: 'R3', blob: BLOB_A, neden: 'test fikstürü, uydurma satırlar', kanit: 'fiyat sahte/örnek' }]

  it('mekanik: R3 izin kaydı o DOSYAYI muaf tutar, başka dosyayı tutmaz', () => {
    const oku = (): string => fiyatDokumu
    const a = kapi.tara({ dosyalar: ['veri/urunler.json'], oku, izin: izinli, blobOf: () => BLOB_A })
    expect(a.ihlaller).toEqual([])
    expect(a.izinliler).toHaveLength(1)
    const b = kapi.tara({ dosyalar: ['veri/baska.json'], oku, izin: izinli, blobOf: () => BLOB_A })
    expect(b.ihlaller).toHaveLength(1)
    expect(b.izinliler).toEqual([])
  })

  it('mekanik: R6 izin kaydı o DOSYAYI muaf tutar (kural eşleşmeli: R3 kaydı R6 isabetini tutmaz)', () => {
    const a = kapi.tara({ dosyalar: ['veri/yerel.db'], oku: () => null, izin: [{ yol: 'veri/yerel.db', kural: 'R6', blob: BLOB_A }], blobOf: () => BLOB_A })
    expect(a.ihlaller).toEqual([])
    expect(a.izinliler.map((k) => k.kural)).toEqual(['R6'])
    const b = kapi.tara({ dosyalar: ['veri/yerel.db'], oku: () => null, izin: [{ yol: 'veri/yerel.db', kural: 'R3', blob: BLOB_A }], blobOf: () => BLOB_A })
    expect(b.ihlaller.map((k) => k.kural)).toEqual(['R6'])
  })

  // ALT-39 son tur: R5 (ödeme kartı parçası) İZİN ALMAZ. Tek izinli örnek (`support/`) ağaçtan silindi; kayıt yazılsa, yol ve blob
  // tam eşleşse de kapı kırmızı kalır. (Arındırılmış fikstür sıfır sayacı taşır ve R5'e hiç takılmaz: izne ihtiyacı yok.)
  it('mekanik: R5 (kart parçası) İZİN ALMAZ: kayıt R5 yazsa da, yol ve blob eşleşse de KIRMIZI; support/ benzeri dosya geri gelirse kapı yakalar', () => {
    const kart = JSON.stringify({ binNumber: GIZLI_BIN, lastFourDigits: GIZLI_SON4 })
    const c = kapi.tara({ dosyalar: ['veri/kart.json'], oku: () => kart, izin: [{ yol: 'veri/kart.json', kural: 'R5', blob: BLOB_A }], blobOf: () => BLOB_A })
    expect(c.izinliler).toEqual([])
    expect(c.ihlaller.map((k) => k.kural)).toEqual(['R5'])
    const destek = kapi.tara({ dosyalar: ['support/iyzico_support_payload.json'], oku: () => kart, izin: kapi.IZIN_LISTESI, blobOf: () => BLOB_A })
    expect(destek.ihlaller.map((k) => k.kural)).toEqual(['R5'])
    expect(destek.izinliler).toEqual([])
    expect(kapi.IZIN_LISTESI.filter((e) => e.kural === 'R5')).toEqual([])
  })

  it('mekanik: R1/R2/R4 İZİN ALMAZ (kayıt kural R1 yazsa da, yol ve blob izinli olsa da)', () => {
    const kisisel = JSON.stringify([{ customer_email: GIZLI_EPOSTA }])
    const r1 = kapi.tara({ dosyalar: ['veri/urunler.json'], oku: () => kisisel, izin: [{ yol: 'veri/urunler.json', kural: 'R1', blob: BLOB_A }], blobOf: () => BLOB_A })
    expect(r1.ihlaller.map((k) => k.kural)).toEqual(['R1'])
    const r2 = kapi.tara({ dosyalar: ['veri/urunler.json'], oku: () => kisisel, izin: izinli, blobOf: () => BLOB_A })
    expect(r2.ihlaller.map((k) => k.kural)).toEqual(['R1'])
    const sql = kapi.tara({ dosyalar: ['d.sql'], oku: () => "INSERT INTO t (customer_name) VALUES ('x');", izin: [{ yol: 'd.sql', kural: 'R2', blob: BLOB_A }], blobOf: () => BLOB_A })
    expect(sql.ihlaller.map((k) => k.kural)).toEqual(['R2'])
    const r4 = kapi.tara({
      dosyalar: ['db-backup/urunler.json'],
      oku: () => '[]',
      izin: [{ yol: 'db-backup/urunler.json', kural: 'R3', blob: BLOB_A }, { yol: 'db-backup/urunler.json', kural: 'R4', blob: BLOB_A }],
      blobOf: () => BLOB_A,
    })
    expect(r4.ihlaller.map((k) => k.kural)).toEqual(['R4'])
  })

  // ── O4: izin kaydı yol + kural + BLOB; blob uyuşmazsa izin DÜŞER ────────────────────────────────────────────
  it('O4: blob UYUŞMAZSA izin düşer (yol ve kural aynı olsa da) → KIRMIZI; uyuşursa muaf', () => {
    const oku = (): string => fiyatDokumu
    const uyusmayan = kapi.tara({ dosyalar: ['veri/urunler.json'], oku, izin: izinli, blobOf: () => BLOB_B })
    expect(uyusmayan.ihlaller.map((k) => k.kural)).toEqual(['R3'])
    expect(uyusmayan.izinliler).toEqual([])
    const r6 = kapi.tara({ dosyalar: ['veri/yerel.db'], oku: () => null, izin: [{ yol: 'veri/yerel.db', kural: 'R6', blob: BLOB_A }], blobOf: () => BLOB_B })
    expect(r6.ihlaller.map((k) => k.kural)).toEqual(['R6'])
  })

  it('O4: kayıtta blob YOKSA ya da biçimsizse izin hiçbir şeyi muaf tutmaz (fail-closed)', () => {
    const oku = (): string => fiyatDokumu
    for (const blob of [undefined, '', 'abc', 'A'.repeat(40), 'g'.repeat(40), `${BLOB_A}0`]) {
      const s = kapi.tara({ dosyalar: ['veri/urunler.json'], oku, izin: [{ yol: 'veri/urunler.json', kural: 'R3', blob }], blobOf: () => BLOB_A })
      expect(s.ihlaller.map((k) => k.kural), `blob=${String(blob)}`).toEqual(['R3'])
    }
    // ALT-39 son tur (sabotaj O4-4 ile bulundu): biçim denetimi EŞİTLİKTEN ayrı bir savunmadır. Yukarıdaki döngüde biçimsiz kayıt zaten
    // gerçek blob'a eşit olmadığı için denetim düşse de test yeşil kalıyordu; burada `blobOf` kaydın KENDİ biçimsiz değerini döndürür
    // (eşitlik sağlanır) ve izin yine VERİLMEZ.
    for (const blob of ['', 'abc', 'A'.repeat(40), 'g'.repeat(40), `${BLOB_A}0`]) {
      const s = kapi.tara({ dosyalar: ['veri/urunler.json'], oku, izin: [{ yol: 'veri/urunler.json', kural: 'R3', blob }], blobOf: () => blob })
      expect(s.ihlaller.map((k) => k.kural), `eşit ama biçimsiz blob=${blob}`).toEqual(['R3'])
      expect(s.izinliler, `eşit ama biçimsiz blob=${blob}`).toEqual([])
    }
  })

  it('O4: blobOf verilmezse ya da hesaplayamazsa (null) izin YOKTUR (fail-closed); yalnız yol+kurala bakan eski davranış kapalı', () => {
    const oku = (): string => fiyatDokumu
    expect(kapi.tara({ dosyalar: ['veri/urunler.json'], oku, izin: izinli }).ihlaller.map((k) => k.kural)).toEqual(['R3'])
    expect(kapi.tara({ dosyalar: ['veri/urunler.json'], oku, izin: izinli, blobOf: () => null }).ihlaller.map((k) => k.kural)).toEqual(['R3'])
  })

  it('O4: aynı yol ve kural için birden çok kayıt: HERHANGİ birinin blob\'u uyuşursa muaf (içerik sürümü değişimi iki kayıtla geçilir)', () => {
    const iki: IzinKaydi[] = [{ ...izinli[0], blob: BLOB_B }, { ...izinli[0], blob: BLOB_A }]
    const s = kapi.tara({ dosyalar: ['veri/urunler.json'], oku: () => fiyatDokumu, izin: iki, blobOf: () => BLOB_A })
    expect(s.ihlaller).toEqual([])
  })

  it('O4 uçtan uca (ağaç): GERÇEK git blob\'u eşleşirse muaf; dosya sonradan DEĞİŞİRSE izin düşer ve kapı çıkış 1 verir', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/yerel.db': SQLITE_ICERIK, 'README.md': '# x' })
    const izin = [{ yol: 'veri/yerel.db', kural: 'R6', blob: blobHash(SQLITE_ICERIK), neden: 'yerel hafıza veritabanı, içerik boş', kanit: 'içerik taraması: 0 tablo' }]
    const kos = () => {
      const cikti: string[] = []
      const kod = kapi.calistir(['--kok', d], { cwd: d, env: temizOrtam(), izin, yaz: (s) => cikti.push(s), hata: (s) => cikti.push(s) })
      return { kod, cikti: cikti.join('\n') }
    }
    const once = kos()
    expect(once.kod, once.cikti).toBe(0)
    expect(once.cikti).toContain('IZINLI R6')
    // dosya "gerçek veriyle güncellendi": imza aynı kalır (hâlâ SQLite) ama içerik, dolayısıyla blob değişir
    fs.writeFileSync(path.join(d, 'veri/yerel.db'), Buffer.concat([SQLITE_ICERIK, Buffer.from('baska-icerik')]))
    const sonra = kos()
    expect(sonra.kod, sonra.cikti).toBe(1)
    expect(sonra.cikti).toContain('IHLAL R6')
    expect(sonra.cikti).not.toContain('IZINLI R6')
  })

  it('O4 uçtan uca (itilen nesneler): blob uyuşan yol muaf; aynı yola SONRADAN itilen farklı içerik KIRMIZI', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-izin-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# x')
    const taban = commitle(d, 'taban')
    yaz(d, 'veri/yerel.db', SQLITE_ICERIK)
    const iyi = commitle(d, 'izinli icerik')
    yaz(d, 'veri/yerel.db', Buffer.concat([SQLITE_ICERIK, Buffer.from('gercek-veri-sonradan')]))
    const kotu = commitle(d, 'icerik degisti')
    const izin = [{ yol: 'veri/yerel.db', kural: 'R6', blob: blobHash(SQLITE_ICERIK), neden: 'yerel hafıza veritabanı, içerik boş', kanit: 'içerik taraması: 0 tablo' }]
    const a = kapi.yeniNesneleriTara({ kok: d, ucler: [iyi], haric: [taban], izin })
    expect(a.ihlaller).toEqual([])
    expect(a.izinliler.map((k) => k.kural)).toEqual(['R6'])
    const b = kapi.yeniNesneleriTara({ kok: d, ucler: [kotu], haric: [taban], izin })
    // ara commit (izinli blob) muaf, uçtaki yeni blob KIRMIZI
    expect(b.ihlaller.map((k) => k.kural)).toEqual(['R6'])
    expect(b.izinliler.map((k) => k.kural)).toEqual(['R6'])
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
