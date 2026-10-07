/**
 * DEPO DÖKÜM KAPISI — veritabanı dökümü, kişisel veri ve ödeme parçası HERKESE AÇIK depoya girmesin
 * (INV-DEPO-DOKUM-1, ALT-39). Cetvel: `docs/standards/depoya-giremeyecek-veri-standard.md`.
 *
 * NİÇİN VAR: geçmişte depoya bir veri dökümü girmişti ve depo sonradan herkese açık oldu. Hiçbir kapı
 * görmedi: `secret-scan.py` anahtar ve belirteç İMZALARINA bakar, kişisel veri ve tablo imzasına bakmaz.
 *
 * ⭐DÜRÜST SINIR (bulgu 1): bu kapı iki yerde koşar ve ikisi aynı şeyi söylemez.
 *   · CI: master'a BİRLEŞMEYİ durdurur. Veri, dal itildiği an zaten herkese açık olabilir.
 *   · `.githooks/pre-push`: AĞA ÇIKIŞI durdurur (itilecek TÜM nesneleri, sonradan silinenler dahil, tarar) —
 *     ama `git push --no-verify` ile atlanabilir. ⭐Kapı ölçemezse (çıkış 2) kanca push'u YİNE ENGELLER
 *     (ALT-39 2. tur, Y1: ölçemeyen kapı yeşil vermez; ağa çıkış geri alınamaz). Bilinçli geçiş:
 *     `VH_DOKUM_OLCULEMEDI_IZIN=1 git push`. ⚠Kanca dala bağlıdır: cetvel §7 "geçiş sınırı".
 *
 * TETİK: izlenen json/jsonl/ndjson/csv/tsv/sql dosyaları ve izlenen yollar (ağaç kipi); itilecek nesneler
 *        (`--yeni-nesneler`, `--pre-push`); GitHub Actions `pull_request` ve tam geçmiş varsa PR'ın ara
 *        commit'leri de (ara commit taraması `fetch-depth: 0` ister).
 * YER:   PR + master push (`ci` işi, Install adımından ÖNCE) ve `.githooks/pre-push`.
 *        ⚠CI'da önceki bir adım kırmızıysa bu adım koşmaz: "her koşuda" DEĞİL, "bağımlılıksız, erken" koşar.
 *
 * KURALLAR — her biri DEĞERE değil ŞEKLE bakar (değer taşıyan hiçbir şey basılmaz):
 *   R1  kişisel alan adı DOLU değerle (json/jsonl/ndjson/csv/tsv). Sözlük iki katmanlıdır: KISISEL_ALANLAR
 *       (belirgin adlar, ≥1 dolu satır) ve KISISEL_GENEL_ALANLAR (email, full_name, phone… ≥3 dolu satır;
 *       i18n/şema dosyalarında tek tük geçen etiketler yanlış alarm olmasın). ⭐EŞLEŞME TOLERANSLIDIR
 *       (2. tur, O2): ad bir kişisel KÖKÜ içeriyorsa (applicant_email, email_to, contact_phone, identity_*,
 *       eposta, telefon, adres, musteri…) ya da `ip`/`gsm` TAM PARÇAYSA (accept_ip) genel alandır; aksan ve
 *       büyük-küçük harf fark etmez. Kökleri şema tabanını TARAYAN test sınar: kişisel kalıba uyan her kolon
 *       ya kapsanır ya da adıyla gerekçeli "bilerek dışarıda" listesindedir.
 *   R2  .sql veri ifadesi (INSERT … VALUES / COPY … FROM stdin / UPDATE … SET <kişisel alan> = <dize>) içinde
 *       kişisel alan; kolon listesiz INSERT/COPY'nin hassas tabloya yazması. ⭐Genel alan ve R3 eşikleri
 *       İFADE başına DEĞİL, DOSYA genelinde TABLO başına sayılır (`pg_dump --column-inserts` her satırı ayrı
 *       INSERT yazar); hassas tabloda genel alan eşiği 1. CREATE/ALTER/politika/`$$` gövdeleri MASUMDUR.
 *   R3  fiyat/maliyet dökümü: ≥5 satırda kimlik + pozitif fiyat/maliyet (JSON, JSONL, CSV, SQL kolon listesi).
 *       Eşleşme önek/sonek toleranslıdır (purchase/cost/alış/maliyet, para birimi eki; model_code, *_kod).
 *   R4  yol kuralı: db-backup, pg_dump, .dump*, sıkıştırılmış/arşiv/ikili/tablo uzantıları (.parquet .ods .mdb
 *       .accdb dahil), toc.dat.
 *   R5  ödeme parçası: binNumber VE lastFourDigits birlikte ve değerler sıfır sayacı DEĞİL.
 *   R6  izlenen ikili veritabanı (.db/.sqlite/.sqlite3 ya da SQLite imzası): içine bakılamaz. ⭐İmza UZANTIDAN
 *       BAĞIMSIZ okunur (2. tur, O1): ağaç kipinde her izlenen dosyanın ilk baytları, itilen nesne kipinde her
 *       aday blob'un başlığı (`app.db.20261006`, `x.sqlite.orig` gibi yedek adları görünmez kalmasın).
 *   Ölçülemedi (çıkış 2): başlıksız CSV/TSV, ayrıştırılamayan veri dosyası, NUL baytlı veri dosyası.
 *   R3 ve R6 dosya bazlı İZİN LİSTESİ alır (gerekçe + kanıt); R1/R2/R4/R5 ASLA (R5: ödeme kartı parçası; tek izinli
 *   örnek `support/` ağaçtan silindi, kartın izin yolu da kapandı).
 *   ⭐İzin kaydı yol + kural + BLOB'a bağlıdır (2. tur, O4; `git hash-object`): dosya sonradan değişirse izin düşer
 *   ve kanıt yeniden ölçülür. Yalnız yol+kurala bakan izin, içeriği sabit olmadığı için "anlamsal kaçış" idi.
 *
 * KİPLER
 *   (varsayılan)                  izlenen AĞAÇ taraması (+ GitHub Actions PR ise ara commit'ler)
 *   --yeni-nesneler <uç> [--haric <ref>]  `git rev-list --objects <uç> --not --remotes` ya da `--not <ref>`;
 *                                 her blob İÇERİĞİYLE ve ONU TAŞIYAN HER YOLLA ölçülür (`git diff-tree -r`, D2)
 *   --pre-push                    git'in pre-push stdin'ini okur, itilecek uçları tarar
 *   --kok <dizin>                 depo kökü
 *
 * ÇIKIŞ KODU: 0 temiz · 1 ihlal · 2 ölçülemedi (git yok, depo değil, dosya okunamadı, tavan aşıldı,
 * başlıksız/ayrıştırılamayan veri dosyası, argüman bilinmiyor, boş evren). ⭐2 de KIRMIZIDIR: ölçemeyen
 * kapı yeşil vermez (kancada da: Y1). ⚠Ölçemedim ile ihlal AYRI sonuçlardır.
 * ⭐TAVAN AŞIMI (nesne sayısı, okunacak bayt) TÜM TARAMAYI İPTAL ETMEZ (Y1): sığan nesneler taranır (ihlal varsa
 * çıkış 1), sığmayanlar "ölçülemedi" diye ADIYLA listelenir (çıkış 2). Aksi hâlde saldırgan önüne çöp yığıp asıl
 * dökümü taranmayan nesneler arasına itebilirdi.
 *
 * ⛔DEĞER BASMAZ: çıktıda yalnız DOSYA ADI, KURAL ADI, ALAN ADI ve SAYI vardır.
 *
 * ⚠KAPSAM DIŞI (insan incelemesi): sütun/satır biçimli JSON, SKU anahtarlı fiyat haritası, uzantı
 * değiştirme (`.bak`, `.md`), base64, dosyayı parçalara bölme. Cetvel §8 bunları adıyla yazar.
 * ⚠Bu kapı GEÇMİŞİ temizlemez; geçmiş temizliği ayrı iştir (ALT-41).
 */
'use strict'

const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

// ── Ayarlar (testler bunları okur; sayılar bedava değişmesin diye adlı) ─────────────────────────

/** İçeriği taranan uzantılar. Yol kuralları (R4/R6) uzantıdan bağımsız, her izlenen yola uygulanır. */
const VERI_UZANTILARI = Object.freeze(['json', 'jsonl', 'ndjson', 'csv', 'tsv', 'sql'])

/** Bundan büyük veri dosyası TARANAMAZ → ölçülemedi (fail-closed). */
const BUYUK_DOSYA_SINIRI = 64 * 1024 * 1024

/**
 * JSON gövdesi ayrıştırıldıktan sonra yapının DIŞINDA kalan, yorum OLMAYAN metnin (boşluk/NUL/BOM hariç) en çok bu kadar karakteri
 * hoş görülür (UTF-16 gövde + CRLF çöpü, `;` gibi artıklar); fazlası "ölçülemedi" (3. tur, N2).
 */
const JSON_DISI_SINIR = 16

/** Yeni nesneler kipi tavanları: aşılırsa ölçülemedi (çıkış 2). */
const NESNE_TAVANI = 200000
const OKUMA_TAVANI = 512 * 1024 * 1024

/** R1 belirgin kişisel alanlar (≥1 dolu satır). İlk beşi sipariş tablosunun kolonlarıdır. */
const KISISEL_ALANLAR = Object.freeze([
  'customer_email',
  'customer_phone',
  'customer_name',
  'billing_address',
  'shipping_address',
  'invoice_info',
  'tckn',
  'card_number',
  'card_token',
  'card_user_key',
  'cvc',
  // 2. tur (O2, şema tabanı taraması): sipariş satırındaki fatura profili anlık görüntüsü (firma adı, vergi no, adres) — `invoice_info` ile aynı sınıf.
  'invoice_profile',
])

/** R1 genel kişisel alanlar (≥KISISEL_ESIK dolu satır): şema tabanındaki kişisel kolonlar, `name` hariç (aşırı genel). */
const KISISEL_GENEL_ALANLAR = Object.freeze([
  'email',
  'e_mail',
  'full_name',
  'phone',
  'phone_number',
  'first_name',
  'last_name',
  'contact_name',
  'contact_email',
  'contact_phone',
  'address_line',
  'full_address',
  'street_address',
  'postal_code',
  'tax_no',
  'tax_number',
  'tax_office',
  'ip_address',
  // 3. tur (N3): şema DIŞI API/döküm adları (iyzico `buyer.registrationAddress`, düz `address`); tam ad eşleşmesi.
  'address',
  'registration_address',
  'home_address',
  'work_address',
  'delivery_address',
])

/** Genel kişisel alanda en az bu kadar dolu satır varsa dökümdür. */
const KISISEL_ESIK = 3

/**
 * R1 tolerans KÖKLERİ (O2): normalleştirilmiş anahtar (aksan/büyük-küçük/ayraç atılmış) bunlardan birini İÇERİYORSA
 * GENEL kişisel alandır (≥KISISEL_ESIK dolu satır): `applicant_email`, `email_to`, `contact_phone`, `identity_verified_at`,
 * Türkçe `eposta`, `telefon`, `ad_soyad`, `adres`, `vergi_no`, `musteri_adi`. Kök kısaltılırsa kapsam daralır, uzatılırsa
 * yanlış alarm artar: değişikliği şema tabanını tarayan test (depo-dokum-kapisi.test.ts) sınar.
 */
const KISISEL_GENEL_KOKLER = Object.freeze([
  'email',
  'eposta',
  'phone',
  'telefon',
  'identity',
  'fullname',
  'firstname',
  'lastname',
  'contactname',
  'adsoyad',
  'soyad',
  'adres',
  'musteri',
  'postalcode',
  'postakodu',
  'taxno',
  'taxnumber',
  'taxoffice',
  'vergino',
  'vergidairesi',
  // 3. tur (N3): ödeme sağlayıcı / API yanıtlarındaki alıcı blokları (iyzico `buyer`: surname). `address` KÖK DEĞİL, TAM AD olarak
  // KISISEL_GENEL_ALANLAR'da: kök olsaydı `address_type` (etiket) gibi kişisel olmayan şema kolonları yanlış alarm verirdi.
  'surname',
  'zipcode', // `zipCode`, `zip_code`; tek başına `zip` KİŞİSEL DEĞİL (sıkıştırma bayrağı gibi kullanımlar: ölçülmüş yanlış alarm sınıfı)
])

/**
 * Kısa adlar başka sözcüklerin İÇİNDE geçer (`ship`, `recip`, `zip`): yalnız TAM PARÇA eşleşir.
 *   · KISISEL_GENEL_PARCALAR: parça herhangi bir yerde (`gsm`, `gsm_no`, `cep_gsm`).
 *   · KISISEL_GENEL_SON_PARCALAR: parça bileşik adın SON parçasıysa (`accept_ip`, `clientIp`, `remote_ip`: "…_ip"). Tek başına
 *     ya da başta (`ip`, `ip_rating`, `ip_class`) DEĞİL: bu depoda `ip_rating` ürünün koruma sınıfıdır (ölçüldü, yanlış alarm).
 */
const KISISEL_GENEL_PARCALAR = Object.freeze(['gsm', 'iban', 'tel', 'cep'])
const KISISEL_GENEL_SON_PARCALAR = Object.freeze(['ip'])

/** Belirgin (≥1 dolu satır) tolerans kökleri: kimlik numarası biçimleri (`tc_kimlik_no`, `tcno`, `kimlik_no`). */
const KISISEL_BELIRGIN_KOKLER = Object.freeze(['tckn', 'tckimlik', 'tcno', 'kimlikno', 'identitynumber', 'vkn'])

/**
 * R2: kolon listesiz INSERT/COPY bu tablolara yazıyorsa ihlal; kolon listeli yazımda da genel alan eşiği 1'dir
 * (şema tabanından: kişisel kolon taşıyan tablolar + maliyet). 2. tur (O2): taban TARANARAK genişletildi.
 */
const HASSAS_TABLOLAR = Object.freeze([
  'user_profiles',
  'contact_messages',
  'suppliers',
  'user_addresses',
  'user_invoice_profiles',
  'venthub_orders',
  'product_costs',
  'data_subject_requests',
  'order_email_events',
  'quote_email_events',
  'shipping_email_events',
  'inventory_settings',
  'venthub_quotes',
  'wizard_selections',
  // 3. tur (N3): auth şeması (`auth.users`, `auth.identities`: e-posta, telefon, sağlayıcı kimliği); tablo adı şema önekinden bağımsız eşleşir.
  'users',
  'identities',
])

/** R3 kimlik yarısı: tam ad kümesi + `*_kod` soneki. */
const KIMLIK_ANAHTARLARI = Object.freeze(['id', 'sku', 'slug', 'product_id', 'product_sku', 'model_code'])
const KIMLIK_SONEKLERI = Object.freeze(['kod'])

/** R3 fiyat yarısı: anahtar adı bu kökleri İÇERİYORSA (önek/sonek/para birimi eki tolere edilir). */
const FIYAT_KOKLERI = Object.freeze(['price', 'cost', 'fiyat', 'maliyet', 'alis'])

/** R3: bir dizide/dosyada/SQL ifadesinde en az bu kadar "kimlik + pozitif fiyat" satırı varsa döküm sayılır. */
const FIYAT_ESIGI = 5

/** R5: sıfır sayacı biçimi (arındırılmış fikstürün BIN ve son dört hanesi). Bunlar dışındaki değer gerçek sayılır. */
const BIN_SAYACI = /^0{5}\d$/
const SON_DORT_SAYACI = /^0{3}\d$/

/** Kural kimliği → ad (çıktıda ve testte aynı sözlük). */
const KURALLAR = Object.freeze({
  R1: 'kisisel-alan-dolu',
  R2: 'sql-veri-ifadesi-kisisel-alan',
  R3: 'fiyat-dokumu',
  R4: 'dokum-yolu',
  R5: 'odeme-parcasi',
  R6: 'ikili-veritabani',
})

/** R4 uzantı kalıpları (sıkıştırılmış, arşiv, ikili döküm, tablo). */
const R4_UZANTILARI = Object.freeze([
  'gz',
  'zip',
  'tar',
  'tgz',
  'zst',
  'xz',
  'bz2',
  '7z',
  'rar',
  'backup',
  'pgdump',
  'xlsx',
  'xls',
  'har',
  'parquet',
  'ods',
  'mdb',
  'accdb',
])

/** R4: yol kalıpları. Ad, çıktıda gösterilen kalıptır. */
const YOL_KURALLARI = Object.freeze([
  { ad: 'db-backup', eslesir: (k) => k.includes('db-backup') },
  { ad: 'pg_dump', eslesir: (k) => k.includes('pg_dump') },
  // `.dump` ardından ayraçla (`.` `-` `_`) gelen her sonek: `x.dump`, `x.dump.gz`, `x.dump-20261007`, `x.dump_eski`; `x.dumpling.md` DEĞİL (3. tur, N6).
  { ad: '.dump', eslesir: (k) => /\.dump(?:[._-][a-z0-9._-]*)?$/.test(k) },
  { ad: '.sql.gz', eslesir: (k) => k.endsWith('.sql.gz') },
  { ad: '.sql.dump', eslesir: (k) => k.endsWith('.sql.dump') },
  ...R4_UZANTILARI.map((u) => ({ ad: `.${u}`, eslesir: (k) => k.endsWith(`.${u}`) })),
  { ad: 'toc.dat', eslesir: (k) => k === 'toc.dat' || k.endsWith('/toc.dat') },
  // 3. tur (N6): SQLite yan dosyaları (WAL/shm/journal) SQLite imzası taşımaz ama yazılmamış işlemleri (kişisel veri dahil) tutar.
  { ad: 'sqlite-wal/shm/journal', eslesir: (k) => /\.(?:db|db3|sqlite|sqlite3)-(?:wal|shm|journal)$/.test(k) },
])

/**
 * R6: ikili veritabanı uzantıları ve SQLite imzası. ⭐İmzaya UZANTIDAN BAĞIMSIZ bakılır (2. tur, O1): önceki sürüm
 * yalnız 7 uzantıda bakıyordu; `app.db.20261006` (tarih sonekli) ve `x.sqlite.orig` (yedek sonekli) görünmüyordu.
 */
const R6_UZANTILARI = Object.freeze(['db', 'sqlite', 'sqlite3'])
const SQLITE_IMZASI = 'SQLite format 3'
/** 3. tur (N6): `pg_dump -Fc` (özel biçim) arşivinin ilk 5 baytı. Uzantısı ne olursa olsun (`yedek.bin`, uzantısız) R6. */
const PGDUMP_IMZASI = 'PGDMP'

/**
 * İzin listesi hangi kurallara açık: R1/R2/R4/R5 ASLA. R5 (ödeme kartı parçası) son tur (ALT-39) öncesinde yalnız kanıtlı bir
 * sandbox-kart örneği için açıktı; o dosya (`support/`) ağaçtan silindi ve izin yolu da kapatıldı: arındırılmış fikstür sıfır
 * sayacıyla (BIN 00000d, son dört 000d) R5'e zaten takılmaz, kart parçası taşıyan başka dosya kırmızı kalır.
 */
const IZIN_KURALLARI = Object.freeze(['R3', 'R6'])

/**
 * İZİN LİSTESİ — DOSYA BAZLI. Her satır: { yol, kural, blob, neden, kanit }.
 *   blob: izin verilen İÇERİĞİN `git hash-object` çıktısı (40 hane). ⭐Eşleşme yol + kural + BLOB (O4): dosya
 *         sonradan gerçek veriyle güncellenirse blob değişir, izin DÜŞER, kapı kırmızı olur ve kanıt yeniden ölçülür.
 *         Blob'u olmayan ya da uyuşmayan kayıt hiçbir şeyi muaf tutmaz (fail-closed).
 *   R3: `kanit` "fiyat sahte/örnek" olduğunu GÖSTERMELİ.
 *   R6: `kanit` ölçümün SAYILARINI taşımalı ve "ayrı kayıt önerilecek (numarayı OPS verir)" demeli
 *          (gerçek bir kayıt numarası YOKTUR; numarayı OPS verir).
 * Sınırını `depo-dokum-kapisi.test.ts` koyar: tavan, yetim satır yasağı, glob yasağı, kural kümesi, blob bağı.
 */
const IZIN_LISTESI = Object.freeze([
  {
    yol: 'memory.db',
    kural: 'R6',
    blob: '2e2372f9ff7023084588d5f97a2e933dd23eea7f',
    neden: 'Kök dizindeki boş yerel hafıza veritabanı izleniyor; içerik taraması boş çıktı. İzlemeden çıkarma ayrı iştir.',
    kanit:
      'içerik taraması (salt okuma, 2026-10-06): 4096 bayt, 0 tablo, e-posta/telefon/UUID/TCKN deseni 0; ayrı kayıt önerilecek (numarayı OPS verir)',
  },
  {
    yol: 'registry/registry.db',
    kural: 'R6',
    blob: 'e69f52d7f4c4212d19976fbc438fa3d23967d768',
    neden: 'Kayıt defteri (registry) SQLite dosyası izleniyor; içerik taraması kişisel veri bulmadı. İzlemeden çıkarma ayrı iştir.',
    kanit:
      'içerik taraması (salt okuma, 2026-10-06): 49152 bayt, 2 tablo (projects 11 satır, tasks 77 satır), e-posta/telefon/UUID/TCKN deseni 0; ayrı kayıt önerilecek (numarayı OPS verir)',
  },
  {
    yol: 'registry/_legacy/registry.db',
    kural: 'R6',
    blob: '5d9ae9dabb048664cee1a5405e386d21b3e53128',
    neden: 'Eski kayıt defteri SQLite dosyası izleniyor; içerik taraması kişisel veri bulmadı. İzlemeden çıkarma ayrı iştir.',
    kanit:
      'içerik taraması (salt okuma, 2026-10-06): 61440 bayt, 3 tablo (agent_memory 4, projects 8, tasks 77 satır), e-posta/telefon/UUID/TCKN deseni 0; ayrı kayıt önerilecek (numarayı OPS verir)',
  },
  {
    yol: '.cc/memory.db.pre_qwen.20260524_1830',
    kural: 'R6',
    blob: '61572e7b3caf04b2c46cb435885fb21cafc2e228',
    neden:
      'Eski (qwen öncesi, 2026-05-24) yerel hafıza veritabanı yedeği SQLite imzasıyla izleniyor (uzantısı .db değil: ALT-39 2. tur O1 imza taramasının yeni isabeti); içerik taraması kişisel veri bulmadı. İzlemeden çıkarma ayrı iştir.',
    kanit:
      'içerik taraması (salt okuma, 2026-10-06): 102400 bayt, 8 tablo (toplam 4 satır: _meta 3, memory_nodes 1; kalan 6 tablo boş), serbest sayfa 0, e-posta/telefon/UUID/TCKN deseni 0 (hem tablo hücreleri hem ham bayt taraması); ayrı kayıt önerilecek (numarayı OPS verir)',
  },
])

// ── Yardımcılar ──────────────────────────────────────────────────────────────────────────────────

const TR_HARF = { 'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i', 'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u' }

/** Anahtar/başlık karşılaştırması: Türkçe harf, büyük-küçük harf, `_`, `-` ve boşluk fark etmez (customerEmail = customer_email). */
const norm = (s) =>
  String(s)
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => TR_HARF[c])
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

const KISISEL_NORM = new Set(KISISEL_ALANLAR.map(norm))
const GENEL_NORM = new Set(KISISEL_GENEL_ALANLAR.map(norm))
const KIMLIK_NORM = new Set(KIMLIK_ANAHTARLARI.map(norm))
const HASSAS_TABLO_NORM = new Set(HASSAS_TABLOLAR.map(norm))

const kimlikAnahtariMi = (nk) => KIMLIK_NORM.has(nk) || KIMLIK_SONEKLERI.some((s) => nk.length > s.length && nk.endsWith(s))
const fiyatAnahtariMi = (nk) => FIYAT_KOKLERI.some((k) => nk.includes(k))

/** Anahtarı parçalara ayırır: `_` `-` boşluk ve camelCase sınırları (acceptIp → accept, ip; GSMNo → gsm, no). */
function anahtarParcalari(ad) {
  // 3. tur (N5): `([A-Z]+)([A-Z][a-z])` uzun BÜYÜK HARF dizisinde KARESEL geri izler (10^6 harflik anahtar CI'ı kilitlerdi). Kişisel bir
  // alan adı 128 karakteri aşmaz; uzun anahtarda ilk 64 ve son 64 karakter ayrılır (SON_PARCALAR kuralı sondaki parçaya bakar).
  const ham = String(ad)
  const kisa = ham.length > 128 ? `${ham.slice(0, 64)} ${ham.slice(-64)}` : ham
  return kisa
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9çÇğĞıİöÖşŞüÜ]+/)
    .filter(Boolean)
    .map(norm)
}

/** Parça kuralları (KISISEL_GENEL_PARCALAR herhangi bir yerde, KISISEL_GENEL_SON_PARCALAR bileşik adın sonunda). */
function kisiselParcaMi(parcalar) {
  if (parcalar.some((p) => KISISEL_GENEL_PARCALAR.includes(p))) return true
  return parcalar.length >= 2 && KISISEL_GENEL_SON_PARCALAR.includes(parcalar[parcalar.length - 1])
}

/**
 * URL/yol değeri (`/tr/urun/x`, `https://…`): bu depoda `adres` çoğunlukla URL ADRESİDİR (adres_tr, adres matrisi); kişisel adres
 * değil. Tolerans (genel sınıf) için böyle bir değer "dolu kişisel değer" sayılmaz. Belirgin adlarda uygulanmaz.
 */
const urlDegeriMi = (v) => typeof v === 'string' && /^\s*(?:\/|https?:\/\/)/i.test(v)

const sinifOnbellek = new Map()

/**
 * Bir alan adının kişisel sınıfı (O2, TOLERANSLI): 'belirgin' (≥1 dolu satır) · 'genel' (≥KISISEL_ESIK dolu satır) · null.
 * Sıra: tam sözlük adı → tolerans kökü (içerir) → tam parça (`ip`, `gsm`). Aksan/büyük-küçük/ayraç fark etmez.
 * JSON anahtarı, CSV başlığı, SQL kolonu ve ham metin anahtarı AYNI sınıflandırıcıdan geçer: kapsam tek yerde.
 */
function kisiselAlanSinifi(ad) {
  const anahtar = String(ad)
  const onceki = sinifOnbellek.get(anahtar)
  if (onceki !== undefined) return onceki
  const nk = norm(anahtar)
  let sinif = null
  if (KISISEL_NORM.has(nk) || KISISEL_BELIRGIN_KOKLER.some((k) => nk.includes(k))) sinif = 'belirgin'
  else if (
    GENEL_NORM.has(nk) ||
    KISISEL_GENEL_KOKLER.some((k) => nk.includes(k)) ||
    kisiselParcaMi(anahtarParcalari(anahtar))
  ) {
    sinif = 'genel'
  }
  if (anahtar.length <= 256) {
    if (sinifOnbellek.size >= 20000) sinifOnbellek.clear()
    sinifOnbellek.set(anahtar, sinif)
  }
  return sinif
}

/**
 * Çıktıya basılacak alan etiketi: yalnız kimlik-benzeri (harf/rakam/_/-, ≤40) anahtar olduğu gibi basılır. Tolerans
 * sayesinde artık ham anahtar rastgele metin olabilir (sözlük adı değil); değer basmama ilkesi için başka biçim basılmaz.
 */
const alanEtiketi = (ad) => (/^[A-Za-z0-9_-]{1,40}$/.test(String(ad).trim()) ? String(ad).trim() : '(kişisel kalıba uyan anahtar)')

// D3: sınırlı nicelikler. Önceki desen `[A-Za-z0-9._%+-]+@…` uzun harf dizisinde (200 000 harflik başlık hücresi) KARESELDİ.
// RFC 5321: yerel kısım ≤64, alan ≤255; üst alan adı ≤24 yeter (arama bölümsel, anchor yok).
const EPOSTA_DESENI = /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}/
const UUID_DESENI = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
const SAF_SAYI_DESENI = /^[+-]?\d+(?:[.,]\d+)?$/

/** Dosya uzantısı (küçük harf, noktasız); yoksa ''. */
function uzanti(yol) {
  const ad = yol.slice(yol.lastIndexOf('/') + 1)
  const i = ad.lastIndexOf('.')
  return i < 0 ? '' : ad.slice(i + 1).toLowerCase()
}

/** Boş olmayan değer mi? (boş dize, null, [], {}, yalnız boş yapraklar = boş) */
function doluMu(v) {
  if (v === null || v === undefined) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (typeof v === 'number') return Number.isFinite(v)
  if (Array.isArray(v)) return v.some(doluMu)
  if (typeof v === 'object') return Object.values(v).some(doluMu)
  return false // boolean bayrak kişisel veri değildir
}

/** "1.299,90" · "1,299.90" · "1299,90" · "1299.90" → sayı; sayı değilse NaN. */
function sayiyaCevir(s) {
  let t = String(s).trim().replace(/\s|₺|TL|TRY|\$|€|EUR|USD/gi, '')
  if (t === '') return NaN
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) t = t.replace(/,/g, '')
  else if (/^\d+,\d+$/.test(t)) t = t.replace(',', '.')
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN
}

/** Fiyat "dolu sayısal" mı: sonlu ve > 0 (0 fiyat bir fiyat bilgisi taşımaz). */
function pozitifSayi(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0
  if (typeof v === 'string') {
    const n = sayiyaCevir(v)
    return Number.isFinite(n) && n > 0
  }
  return false
}

/** Yol → R4 kalıp adları (boşsa temiz). */
function yolIhlali(yol) {
  const k = yol.toLowerCase()
  return YOL_KURALLARI.filter((r) => r.eslesir(k)).map((r) => r.ad)
}

/** Yol → R6 (ikili veritabanı uzantısı) mı? */
function ikiliUzantiMi(yol) {
  return R6_UZANTILARI.includes(uzanti(yol))
}

/** BOM'u (U+FEFF) atar. Kaynakta kaçış dizisi yazmamak için kod noktasıyla karşılaştırılır. */
function bomSil(metin) {
  return metin.length > 0 && metin.charCodeAt(0) === 0xfeff ? metin.slice(1) : metin
}

/**
 * Bayt dizisini metne çevirir: UTF-16 LE/BE BOM'u çözülür (PowerShell 5.1 `>` varsayılanı UTF-16LE'dir; çözülmezse
 * desenler NUL baytlarına takılır ve kapı sessizce "temiz" der), UTF-8 BOM'u atılır.
 */
function metneCevir(tampon) {
  if (tampon.length >= 2 && tampon[0] === 0xff && tampon[1] === 0xfe) return tampon.subarray(2).toString('utf16le')
  if (tampon.length >= 2 && tampon[0] === 0xfe && tampon[1] === 0xff) {
    const govde = Buffer.from(tampon.subarray(2, 2 + Math.floor((tampon.length - 2) / 2) * 2))
    govde.swap16()
    return govde.toString('utf16le')
  }
  return bomSil(tampon.toString('utf8'))
}

// ── JSON / JSONL ────────────────────────────────────────────────────────────────────────────────

function satirBelgeleri(metin) {
  const belgeler = []
  let basarisiz = 0
  for (const satir of metin.split(/\r?\n/)) {
    if (satir.trim() === '') continue
    try {
      belgeler.push(JSON.parse(satir))
    } catch {
      basarisiz++
    }
  }
  return { belgeler, basarisiz }
}

/**
 * JSONC'yi (// ve blok yorum, sondaki virgül) düz JSON'a çevirir; dize içeriğine dokunmaz.
 * `yorumlar` verilirse atılan her yorumun metni oraya eklenir (3. tur, N2: yorumdaki kayıtlar da ham metin taramasına girer).
 */
function jsonYorumTemizle(t, yorumlar) {
  let o = ''
  let i = 0
  const n = t.length
  while (i < n) {
    const c = t[i]
    const d = t[i + 1]
    if (c === '"') {
      let j = i + 1
      while (j < n) {
        if (t[j] === '\\') {
          j += 2
          continue
        }
        if (t[j] === '"') {
          j++
          break
        }
        j++
      }
      o += t.slice(i, j)
      i = j
      continue
    }
    if (c === '/' && d === '/') {
      const yorumBasi = i
      while (i < n && t[i] !== '\n') i++
      if (yorumlar) yorumlar.push(t.slice(yorumBasi, i))
      continue
    }
    if (c === '/' && d === '*') {
      const yorumBasi = i
      i += 2
      while (i < n && !(t[i] === '*' && t[i + 1] === '/')) i++
      i += 2
      if (yorumlar) yorumlar.push(t.slice(yorumBasi, Math.min(i, n)))
      continue
    }
    o += c
    i++
  }
  // sondaki virgüller (dizeler dışında)
  let s = ''
  i = 0
  const m = o.length
  while (i < m) {
    const c = o[i]
    if (c === '"') {
      let j = i + 1
      while (j < m) {
        if (o[j] === '\\') {
          j += 2
          continue
        }
        if (o[j] === '"') {
          j++
          break
        }
        j++
      }
      s += o.slice(i, j)
      i = j
      continue
    }
    if (c === ',') {
      let j = i + 1
      while (j < m && /\s/.test(o[j])) j++
      if (o[j] === '}' || o[j] === ']') {
        i++
        continue
      }
    }
    s += c
    i++
  }
  return s
}

/**
 * Metni JSON belgelerine çevirir. Sıra: düz JSON → JSONC (yorum, sondaki virgül) → satır satır NDJSON.
 * Hiçbiri olmazsa `ayristirilamadi: true`: çağıran HAM METİN taramasına düşer ve temiz çıksa bile
 * "ölçülemedi" (çıkış 2) üretir — ayrıştırılamayan dosya kapıdan "temiz" diye geçmez.
 */
function jsonBelgeleri(metin, uz) {
  const t = bomSil(metin)
  // 3. tur (N2): `atilan` = ayrıştırma BAŞARILI olsa da yapının DIŞINDA kalıp hiç taranmayan metin (yorumlar, baş/son çöp); çağıran ham
  // metin taramasına sokar. `disMetin` = bunun YORUM OLMAYAN kısmının boşluk/NUL/BOM dışı karakter sayısı (büyükse "ölçülemedi").
  if (uz === 'jsonl' || uz === 'ndjson') {
    const s = satirBelgeleri(t)
    return { belgeler: s.belgeler, satirlar: true, ayristirilamadi: s.basarisiz > 0, atilan: '', disMetin: 0 }
  }
  try {
    return { belgeler: [JSON.parse(t)], satirlar: false, ayristirilamadi: false, atilan: '', disMetin: 0 }
  } catch {
    // devam
  }
  const yorumlar = []
  try {
    return { belgeler: [JSON.parse(jsonYorumTemizle(t, yorumlar))], satirlar: false, ayristirilamadi: false, atilan: yorumlar.join('\n'), disMetin: 0 }
  } catch {
    // devam
  }
  const s = satirBelgeleri(t)
  if (s.belgeler.length > 0 && s.basarisiz === 0) return { belgeler: s.belgeler, satirlar: true, ayristirilamadi: false, atilan: '', disMetin: 0 }
  // Karışık kodlama / başta ya da sonda çöp (ör. UTF-16 gövde + tek baytlık CRLF): ilk `{`/`[` ile son `}`/`]` arası.
  const baslar = [t.indexOf('{'), t.indexOf('[')].filter((i) => i >= 0)
  const bas = baslar.length > 0 ? Math.min(...baslar) : -1
  const son = Math.max(t.lastIndexOf('}'), t.lastIndexOf(']'))
  if (bas >= 0 && son > bas) {
    const icYorumlar = []
    try {
      const belge = JSON.parse(jsonYorumTemizle(t.slice(bas, son + 1), icYorumlar))
      const dis = `${t.slice(0, bas)}\n${t.slice(son + 1)}`
      return {
        belgeler: [belge],
        satirlar: false,
        ayristirilamadi: false,
        atilan: [dis, ...icYorumlar].join('\n'),
        disMetin: dis.replace(/[\s\0]/g, '').split(String.fromCharCode(0xfeff)).join('').length,
      }
    } catch {
      // devam
    }
  }
  return { belgeler: [], satirlar: false, ayristirilamadi: true, atilan: '', disMetin: 0 }
}

/** Bir nesne "kimlik + pozitif fiyat/maliyet" taşıyan DB satırı imzası mı? */
function fiyatSatiriMi(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return false
  let kimlik = false
  let fiyat = false
  for (const [k, v] of Object.entries(o)) {
    const nk = norm(k)
    if (kimlikAnahtariMi(nk) && (typeof v === 'string' ? v.trim() !== '' : typeof v === 'number')) kimlik = true
    if (fiyatAnahtariMi(nk) && pozitifSayi(v)) fiyat = true
  }
  return kimlik && fiyat
}

/** Kart parçası çifti gerçek mi (sıfır sayacı değil mi)? İkisi de dolu olmalı. */
function kartParcasiGercekMi(bin, sonDort) {
  if (!doluMu(bin) || !doluMu(sonDort)) return false
  return !(BIN_SAYACI.test(String(bin)) && SON_DORT_SAYACI.test(String(sonDort)))
}

/**
 * JSON belgelerini gezer (yığınla, özyinelemesiz): belirgin kişisel alan adları, genel alanların dolu
 * nesne sayıları, kart parçası çifti (R5) ve en kalabalık "fiyat satırı" dizisinin eleman sayısı.
 */
function jsonGez(belgeler, satirDizisi) {
  const alanlar = new Set()
  const genel = new Map() // norm -> { ad, sayi }
  let r5 = false
  let enCok = satirDizisi ? belgeler.filter(fiyatSatiriMi).length : 0
  const kisiselSay = (k, v) => {
    const sinif = kisiselAlanSinifi(k)
    if (sinif === null || !doluMu(v)) return
    if (sinif === 'genel' && urlDegeriMi(v)) return
    if (sinif === 'belirgin') alanlar.add(alanEtiketi(k))
    else {
      const nk = norm(k)
      const g = genel.get(nk) || { ad: alanEtiketi(k), sayi: 0 }
      g.sayi++
      genel.set(nk, g)
    }
  }
  const yigin = [...belgeler]
  while (yigin.length > 0) {
    const d = yigin.pop()
    if (Array.isArray(d)) {
      const n = d.filter(fiyatSatiriMi).length
      if (n > enCok) enCok = n
      // jq --stream biçimi: [["yol","alan"], değer] — son yol öğesi alan adıdır
      if (d.length === 2 && Array.isArray(d[0]) && d[0].length > 0 && typeof d[0][d[0].length - 1] === 'string') {
        kisiselSay(d[0][d[0].length - 1], d[1])
      }
      for (const e of d) if (e && typeof e === 'object') yigin.push(e)
    } else if (d && typeof d === 'object') {
      let bin
      let sonDort
      for (const [k, v] of Object.entries(d)) {
        const nk = norm(k)
        kisiselSay(k, v)
        if (nk === 'binnumber') bin = v
        if (nk === 'lastfourdigits') sonDort = v
        if (v && typeof v === 'object') yigin.push(v)
      }
      if (kartParcasiGercekMi(bin, sonDort)) r5 = true
    }
  }
  const genelHit = [...genel.values()].filter((g) => g.sayi >= KISISEL_ESIK).map((g) => g.ad)
  return { alanlar: [...alanlar].sort(), genel: genelHit.sort(), r5, enCok }
}

/** Ham metinde alan adını her tırnak/büyük-küçük/ayraç biçimiyle arayan desen (alan adı → RegExp kaynağı). */
function alanDeseni(ad) {
  return ad
    .split('_')
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('[_\\-\\s]?')
}

/**
 * Ayrıştırılamayan JSON/JSONL için ham metin taraması: alan adı her tırnak (`"` `'` ya da yok), her
 * büyük-küçük harf ve ayraç biçimiyle, değer dolu görünüyorsa sayılır. jq akış biçimi (`["alan"],"değer"`) dahil.
 * Satır satır değil TÜM metin üzerinde çalışır: çok satırlı nesneler de yakalanır.
 */
function hamTara(metin) {
  const dolu = HAM_DOLU
  const say = (ad) => {
    const p = alanDeseni(ad)
    const duz = new RegExp(`["']?${p}["']?\\s*[:=]\\s*${dolu}`, 'gi')
    const akis = new RegExp(`["']${p}["']\\s*\\]\\s*,\\s*${dolu}`, 'gi')
    return (metin.match(duz) || []).length + (metin.match(akis) || []).length
  }
  const belirgin = new Set(KISISEL_ALANLAR.filter((a) => say(a) >= 1))
  const genelKume = new Set(KISISEL_GENEL_ALANLAR.filter((a) => say(a) >= KISISEL_ESIK))
  // Tolerans (O2): sözlükte olmayan ama kişisel kalıba uyan anahtarlar (applicant_email, accept_ip, telefon…).
  for (const g of hamAnahtarlar(metin).values()) {
    if (g.sinif === 'belirgin' && g.sayi >= 1) belirgin.add(g.ad)
    if (g.sinif === 'genel' && g.sayi >= KISISEL_ESIK) genelKume.add(g.ad)
  }
  const alanlar = [...belirgin].sort()
  const genel = [...genelKume].sort()
  const binler = [...metin.matchAll(new RegExp(`["']?${alanDeseni('bin_number')}["']?\\s*[:=]\\s*["']?(\\d{6})`, 'gi'))].map((m) => m[1])
  const sonDortVar = new RegExp(`["']?${alanDeseni('last_four_digits')}["']?\\s*[:=]`, 'i').test(metin)
  const r5 = sonDortVar && binler.some((b) => !BIN_SAYACI.test(b))
  // D3: anahtar çevresindeki `[A-Za-z_]*` SINIRSIZDI (alternasyonun iki yanında): uzun harf dizisinde kübik geri izleme, ham
  // taramayı (ayrıştırılamayan dosya = saldırganın seçtiği girdi) kilitlerdi. Sınır {0,40}: gerçek anahtar adları bundan kısadır.
  const fiyat = (
    metin.match(/["']?[A-Za-z_]{0,40}(?:price|cost|fiyat|maliyet|alis)[A-Za-z_]{0,40}["']?\s*[:=]\s*["']?[1-9]\d*(?:[.,]\d+)?/gi) || []
  ).length
  const kimlik = (metin.match(/["'](?:id|sku|slug|product_id|product_sku|model_code|[A-Za-z_]{0,40}kod)["']\s*[:=]/gi) || []).length
  return { alanlar, genel, r5, r3: fiyat >= FIYAT_ESIGI && kimlik >= FIYAT_ESIGI }
}

/** Ham metinde "dolu görünen değer" başlangıcı: dize, sayı, nesne ya da dizi açılışı. */
const HAM_DOLU = '(?:"[^"\\s][^"]*"|\'[^\'\\s][^\']*\'|-?\\d|\\{\\s*["\'\\w]|\\[\\s*["\'\\w{])'

/**
 * Tolerans taraması (O2): `anahtar<ayraç>dolu değer` çiftlerini bulur; anahtar ayraçtan GERİYE doğru en çok 48 karakter
 * okunur (sınırsız ileri desen yok: doğrusal). Tam sözlük adları `say` ile sayılır, burada atlanır (çift sayım olmasın).
 * @returns {Map<string, {ad: string, sinif: string, sayi: number}>}
 */
function hamAnahtarlar(metin) {
  const sonuc = new Map()
  const ayrac = /[:=]/g
  const dolu = new RegExp(`\\s*${HAM_DOLU}`, 'y')
  let m
  while ((m = ayrac.exec(metin)) !== null) {
    let j = m.index - 1
    while (j >= 0 && (metin[j] === ' ' || metin[j] === '\t')) j--
    if (j >= 0 && (metin[j] === '"' || metin[j] === "'")) j--
    const son = j
    let n = 0
    while (j >= 0 && n < 48 && /[A-Za-z0-9_ -]/.test(metin[j])) {
      j--
      n++
    }
    const ad = metin.slice(j + 1, son + 1).trim()
    if (ad === '') continue
    const nk = norm(ad)
    if (KISISEL_NORM.has(nk) || GENEL_NORM.has(nk)) continue
    const sinif = kisiselAlanSinifi(ad)
    if (sinif === null) continue
    dolu.lastIndex = m.index + 1
    if (!dolu.test(metin)) continue
    const g = sonuc.get(nk) || { ad: alanEtiketi(ad), sinif, sayi: 0 }
    g.sayi++
    sonuc.set(nk, g)
  }
  return sonuc
}

// ── CSV / TSV ───────────────────────────────────────────────────────────────────────────────────

/** İlk boş olmayan satır (ayraç tespiti için). */
function ilkSatir(metin) {
  for (const s of bomSil(metin).split(/\r?\n/)) if (s.trim() !== '') return s
  return ''
}

function ayracBul(uz, ilk) {
  if (uz === 'tsv') return '\t'
  const say = (c) => ilk.split(c).length - 1
  const adaylar = [
    [',', say(',')],
    [';', say(';')],
    ['\t', say('\t')],
  ].sort((a, b) => b[1] - a[1])
  return adaylar[0][1] > 0 ? adaylar[0][0] : ','
}

/** Asgari RFC 4180 ayrıştırıcı: tırnaklı hücre, `""` kaçışı, hücre içi satır sonu, CRLF/LF. */
function csvAyristir(metin, ayrac) {
  const t = bomSil(metin)
  const satirlar = []
  let satir = []
  let hucre = ''
  let tirnakta = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (tirnakta) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          hucre += '"'
          i++
        } else tirnakta = false
      } else hucre += c
      continue
    }
    if (c === '"' && hucre === '') {
      tirnakta = true
      continue
    }
    if (c === ayrac) {
      satir.push(hucre)
      hucre = ''
      continue
    }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++
      satir.push(hucre)
      hucre = ''
      if (!(satir.length === 1 && satir[0] === '')) satirlar.push(satir)
      satir = []
      continue
    }
    hucre += c
  }
  if (hucre !== '' || satir.length > 0) {
    satir.push(hucre)
    satirlar.push(satir)
  }
  return satirlar
}

/** İlk satır başlık gibi mi yoksa VERİ gibi mi (e-posta, UUID, saf sayı)? Veri gibiyse dosya başlıksızdır. */
function satirVeriGibiMi(hucreler) {
  return hucreler.some((h) => {
    const t = String(h).trim()
    return t !== '' && (EPOSTA_DESENI.test(t) || UUID_DESENI.test(t) || SAF_SAYI_DESENI.test(t))
  })
}

/** CSV'yi bir kez ayrıştırır: { baslik, govde, basliksiz }. */
function csvTablo(metin, uz) {
  const satirlar = csvAyristir(metin, ayracBul(uz, ilkSatir(metin)))
  if (satirlar.length === 0) return { baslik: [], govde: [], basliksiz: false }
  return { baslik: satirlar[0], govde: satirlar.slice(1), basliksiz: satirVeriGibiMi(satirlar[0]) }
}

function csvKisisel({ baslik, govde }) {
  const alanlar = new Set()
  const genel = new Set()
  baslik.forEach((b, i) => {
    const sinif = kisiselAlanSinifi(b)
    if (sinif === null) return
    const dolu = govde.filter((r) => {
      const hucre = (r[i] || '').trim()
      return hucre !== '' && !(sinif === 'genel' && urlDegeriMi(hucre))
    }).length
    if (sinif === 'belirgin' && dolu >= 1) alanlar.add(alanEtiketi(b))
    if (sinif === 'genel' && dolu >= KISISEL_ESIK) genel.add(alanEtiketi(b))
  })
  return { alanlar: [...alanlar].sort(), genel: [...genel].sort() }
}

function csvKartParcasi({ baslik, govde }) {
  const bin = baslik.findIndex((b) => norm(b) === 'binnumber')
  const son = baslik.findIndex((b) => norm(b) === 'lastfourdigits')
  if (bin < 0 || son < 0) return false
  return govde.some((r) => kartParcasiGercekMi(r[bin], r[son]))
}

function csvFiyatSatiri({ baslik, govde }) {
  const kimlik = []
  const fiyat = []
  baslik.forEach((b, i) => {
    const nb = norm(b)
    if (kimlikAnahtariMi(nb)) kimlik.push(i)
    if (fiyatAnahtariMi(nb)) fiyat.push(i)
  })
  if (kimlik.length === 0 || fiyat.length === 0) return 0
  let n = 0
  for (const r of govde) {
    if (kimlik.some((i) => (r[i] || '').trim() !== '') && fiyat.some((i) => pozitifSayi(r[i]))) n++
  }
  return n
}

// ── SQL ──────────────────────────────────────────────────────────────────────────────────────────

const COPY_STDIN = /^\s*copy\b[\s\S]*?\bfrom\s+stdin\b/i
// 3. tur (N5): başlık desenleri `baslikMetni()` çıktısında (dizeler `''`, her boşluk dizisi TEK boşluk) koşar ve niceliyicileri SINIRLIDIR.
// Eski desenler (`(\S+?)\s*(?:\(([^)]*)\))?\s*...`) uzun '(' ya da boşluk dizisinde KARESEL geri izliyordu (CI zaman aşımı, pre-push asılı).
// 3. tur (N1): `INSERT INTO t AS a (...)` takma adı ve `VALUES` dışında `SELECT`/`WITH` biçimi (üçüncü yakalama grubu) tanınır.
const COPY_BASLIK = /^ ?copy ([^ (]{1,200}) ?(?:\(([^)]{0,20000})\))? ?from stdin\b/i
const INSERT_INTO = /^\s*insert\s+into\b/i
const INSERT_BASLIK = /^ ?insert into ([^ (]{1,200})(?: as [^ (]{1,100})? ?(?:\(([^)]{0,20000})\))? ?(?:overriding \w+ value )?(values|select|with)\b/i
/**
 * Başlık ayrıştırması girdisi: dizeler `''`, boşluk dizileri TEK boşluk (doğrusal), SONRA ilk `BASLIK_SINIRI` karakter. Sıra önemlidir:
 * önce kesip sonra sadeleştirmek, tablo adı ile kolon listesi arasına çok sayıda boşluk koyarak başlığı kesilen kısma iterdi (kapı kör kalırdı).
 */
const BASLIK_SINIRI = 60000
const baslikMetni = (metin) => metin.replace(/'(?:[^']|'')*'/g, "''").replace(/\s+/g, ' ').slice(0, BASLIK_SINIRI)
const KISISEL_SQL = new RegExp(`\\b(${KISISEL_ALANLAR.join('|')})\\b`, 'gi')
/** Dollar-quote etiketi: ASCII harf/rakam/alt çizgi ve Latin-1 üstü harfler (\x80-\xff). */
const DOLAR_ETIKETI = /^\$([A-Za-z_\x80-\xff][A-Za-z0-9_\x80-\xff]*)?\$/

/**
 * SQL metnini üst düzey ifadelere böler. Yorumlar atılır; `$$ ... $$` (ve `$etiket$`) gövdeleri
 * BOŞALTILIR (fonksiyon gövdesindeki INSERT veri değildir); dize ve tırnaklı tanımlayıcı içeriği
 * korunur (içindeki `;` ifadeyi bölmez). `COPY ... FROM stdin;` sonrası veri bloğu `\.` satırına
 * kadar atlanır (veri satırındaki kesme işareti ayrıştırıcıyı bozmasın) ve satır sayısı tutulur.
 * `bozuk: true` → dize/yorum/dollar-quote kapanmadan metin bitti (ayrıştırma güvenilmez).
 * @returns {{ifadeler: Array<{metin: string, veriSatiri: number}>, bozuk: boolean}}
 */
function sqlBol(sql) {
  const ifadeler = []
  const n = sql.length
  let i = 0
  let cur = ''
  let bozuk = false
  while (i < n) {
    const c = sql[i]
    const d = sql[i + 1]
    if (c === '-' && d === '-') {
      const j = sql.indexOf('\n', i)
      i = j < 0 ? n : j
      continue
    }
    if (c === '/' && d === '*') {
      let derin = 1
      i += 2
      while (i < n && derin > 0) {
        if (sql[i] === '/' && sql[i + 1] === '*') {
          derin++
          i += 2
        } else if (sql[i] === '*' && sql[i + 1] === '/') {
          derin--
          i += 2
        } else i++
      }
      if (derin > 0) bozuk = true
      cur += ' '
      continue
    }
    if (c === "'") {
      const onceki = sql[i - 1]
      const kacisli = (onceki === 'E' || onceki === 'e') && !/[A-Za-z0-9_]/.test(sql[i - 2] || ' ')
      let s = "'"
      let j = i + 1
      let kapandi = false
      while (j < n) {
        const ch = sql[j]
        if (kacisli && ch === '\\') {
          s += ch + (sql[j + 1] || '')
          j += 2
          continue
        }
        if (ch === "'") {
          if (sql[j + 1] === "'") {
            s += "''"
            j += 2
            continue
          }
          s += "'"
          j++
          kapandi = true
          break
        }
        s += ch
        j++
      }
      if (!kapandi) bozuk = true
      cur += s
      i = j
      continue
    }
    if (c === '"') {
      let s = '"'
      let j = i + 1
      let kapandi = false
      while (j < n) {
        if (sql[j] === '"') {
          if (sql[j + 1] === '"') {
            s += '""'
            j += 2
            continue
          }
          s += '"'
          j++
          kapandi = true
          break
        }
        s += sql[j]
        j++
      }
      if (!kapandi) bozuk = true
      cur += s
      i = j
      continue
    }
    if (c === '$') {
      const m = DOLAR_ETIKETI.exec(sql.slice(i, i + 80))
      if (m) {
        const etiket = m[0]
        const son = sql.indexOf(etiket, i + etiket.length)
        if (son < 0) bozuk = true
        cur += `${etiket} ${etiket}`
        i = son < 0 ? n : son + etiket.length
        continue
      }
    }
    if (c === ';') {
      const ifade = cur
      cur = ''
      i++
      let veriSatiri = 0
      if (COPY_STDIN.test(ifade)) {
        const k = sql.indexOf('\n\\.', i)
        const veri = sql.slice(i, k < 0 ? n : k)
        veriSatiri = veri.split('\n').filter((l) => l.trim() !== '').length
        i = k < 0 ? n : k + 3
      }
      if (ifade.trim() !== '') ifadeler.push({ metin: ifade, veriSatiri })
      continue
    }
    cur += c
    i++
  }
  if (cur.trim() !== '') ifadeler.push({ metin: cur, veriSatiri: 0 })
  return { ifadeler, bozuk }
}

/** Geriye uyumlu: yalnız ifade metinleri. */
function sqlIfadeleri(sql) {
  return sqlBol(sql).ifadeler.map((x) => x.metin)
}

/** `VALUES` sonrası üst düzey değer demeti sayısı (dize içindeki parantezler sayılmaz). */
function demetSayisi(govde) {
  let n = 0
  let derin = 0
  for (let i = 0; i < govde.length; i++) {
    const c = govde[i]
    if (c === "'") {
      i++
      while (i < govde.length) {
        if (govde[i] === "'") {
          if (govde[i + 1] === "'") {
            i += 2
            continue
          }
          break
        }
        i++
      }
      continue
    }
    if (c === '(') {
      if (derin === 0) n++
      derin++
    } else if (c === ')') derin--
  }
  return n
}

const kolonAdlari = (liste) =>
  liste
    ? liste
        .split(',')
        .map((k) => k.trim().replace(/^"|"$/g, ''))
        .filter(Boolean)
    : null
const tabloAdi = (ham) => ham.replace(/"/g, '').split('.').pop()

/** Dize İÇERİKLERİNİ aynı uzunlukta `_` ile doldurur: konumlar korunur, yapı (parantez, virgül, anahtar sözcük) aranabilir. */
const dizeleriKapat = (metin) => metin.replace(/'(?:[^']|'')*'/g, (s) => `'${'_'.repeat(s.length - 2)}'`)

/**
 * `kapali` metinde (dizeler doldurulmuş) `bas`tan itibaren, parantez DIŞINDA ve dize/tırnaklı ad DIŞINDA ilk anahtar sözcüğün
 * konumu; yoksa -1. Anahtar sözcükler küçük harf verilir.
 */
function ustSeviyeAnahtar(kapali, bas, anahtarlar) {
  let derin = 0
  let dizede = false
  let tirnakta = false
  for (let i = bas; i < kapali.length; i++) {
    const c = kapali[i]
    if (dizede) {
      if (c === "'") dizede = false
      continue
    }
    if (tirnakta) {
      if (c === '"') tirnakta = false
      continue
    }
    if (c === "'") dizede = true
    else if (c === '"') tirnakta = true
    else if (c === '(') derin++
    else if (c === ')') derin--
    else if (derin === 0 && /[A-Za-z_]/.test(c) && !/[A-Za-z0-9_]/.test(kapali[i - 1] || ' ')) {
      let j = i
      while (j < kapali.length && /[A-Za-z0-9_]/.test(kapali[j])) j++
      if (anahtarlar.includes(kapali.slice(i, j).toLowerCase())) return i
      i = j - 1
    }
  }
  return -1
}

/** `[bas, son)` aralığını parantez DIŞINDAKİ virgüllerden böler: [[a, b], …] konum çiftleri. */
function ustSeviyeParcalar(kapali, bas, son) {
  const sonuc = []
  let derin = 0
  let bol = bas
  let dizede = false
  let tirnakta = false
  for (let i = bas; i < son; i++) {
    const c = kapali[i]
    if (dizede) {
      if (c === "'") dizede = false
      continue
    }
    if (tirnakta) {
      if (c === '"') tirnakta = false
      continue
    }
    if (c === "'") dizede = true
    else if (c === '"') tirnakta = true
    else if (c === '(') derin++
    else if (c === ')') derin--
    else if (c === ',' && derin === 0) {
      sonuc.push([bol, i])
      bol = i + 1
    }
  }
  sonuc.push([bol, son])
  return sonuc
}

/** Parçadaki ilk üst düzey atama `=` konumu (`<=`, `>=`, `!=`, `:=` değil); yoksa -1. */
function atamaKonumu(kapali, a, b) {
  let derin = 0
  for (let i = a; i < b; i++) {
    const c = kapali[i]
    if (c === '(') derin++
    else if (c === ')') derin--
    else if (c === '=' && derin === 0 && !/[<>!:=]/.test(kapali[i - 1] || ' ') && kapali[i + 1] !== '=') return i
  }
  return -1
}

/** UPDATE sağ tarafı VERİ literali mi: boş olmayan dize, dollar-quote ya da ≥5 haneli sayı (boş dize, NULL, fonksiyon, sütun DEĞİL). */
const veriLiteraliMi = (rhs) => /^[eEnNbBxX]?'(?:[^']|'')+'/.test(rhs) || /^\$[A-Za-z_]*\$/.test(rhs) || /^[+-]?\d{5,}(?!\d)/.test(rhs)

/**
 * `UPDATE [ONLY] <tablo> SET <kolon> = <dize>, …` ifadesi (O3): yalnız DEĞER atanan kolonlar `kolonlar` olur (`SET x = lower(x)`
 * ve WHERE koşulları veri DEĞİLDİR). Satır sayısı bilinemez: ifade başına 1 (alt sınır).
 * @returns {null | {tur: 'UPDATE', tablo: string, kolonlar: string[], satir: number}}
 */
function updateAyrinti(metin, cteDize = false) {
  const kapali = dizeleriKapat(metin)
  // 3. tur (N1): veri `SET` sağ tarafında değil, ifadenin başka yerindeki VALUES listesindeyse (`WITH d AS (VALUES ('x')) UPDATE ... FROM d`,
  // `UPDATE ... FROM (VALUES ('x')) v`) sağ taraf bir sütun/alt sorgu görünür; dize taşıyan VALUES varken atama hedefleri veri alır sayılır.
  const degerListesi = cteDize || (/\bvalues\b/i.test(kapali) && /'_+'/.test(kapali))
  const baslik = /^\s*update\s+(?:only\s+)?((?:"[^"]*"|[^\s(".]+)(?:\.(?:"[^"]*"|[^\s(".]+))*)/i.exec(kapali)
  if (!baslik) return null
  const setKonumu = ustSeviyeAnahtar(kapali, baslik[0].length, ['set'])
  if (setKonumu < 0) return null
  const bas = setKonumu + 3
  let son = ustSeviyeAnahtar(kapali, bas, ['from', 'where', 'returning'])
  if (son < 0) son = kapali.length
  const kolonlar = []
  for (const [a, b] of ustSeviyeParcalar(kapali, bas, son)) {
    const es = atamaKonumu(kapali, a, b)
    if (es < 0) continue
    if (!degerListesi && !veriLiteraliMi(metin.slice(es + 1, b).trim().replace(/^\(\s*/, ''))) continue
    for (const k of kapali.slice(a, es).replace(/[()]/g, ' ').split(',')) {
      const ad = k.trim().replace(/"/g, '').split('.').pop()
      if (ad) kolonlar.push(ad)
    }
  }
  return { tur: 'UPDATE', tablo: tabloAdi(baslik[1]), kolonlar, satir: 1 }
}

/**
 * `INSERT INTO t [AS a] [(kolonlar)] VALUES | SELECT | WITH ...` (O3 + 3. tur N1). `VALUES`: satır sayısı demet sayısıdır. `SELECT`/`WITH`:
 * satır sayısı bilinemez (alt sınır 1) ve YALNIZ SELECT listesinde (ya da dize taşıyan bir VALUES/CTE'den beslenen ifadede) boş olmayan DİZE
 * literal'i varsa veridir: `INSERT ... SELECT a FROM baska_tablo` veritabanı içi kopyadır, veri DEĞİLDİR (migration'larda yaygın).
 * @param {string} metin  `INSERT` ile başlayan ifade
 * @param {boolean} cteDize  başındaki `WITH ... ` CTE'sinde dize literal'i var mı
 */
function insertAyrinti(metin, cteDize) {
  const bas = baslikMetni(metin)
  const m = INSERT_BASLIK.exec(bas)
  const bicim = m ? m[3].toLowerCase() : /\bvalues\b/i.test(bas) ? 'values' : null
  if (bicim === null) return null
  const tablo = m ? tabloAdi(m[1]) : ''
  const kolonlar = m ? kolonAdlari(m[2]) : null
  if (bicim === 'values') {
    const idx = metin.search(/\bvalues\b/i)
    return { tur: 'INSERT', tablo, kolonlar, satir: idx < 0 ? 0 : demetSayisi(metin.slice(idx + 6)) }
  }
  const kapali = dizeleriKapat(metin)
  const sel = ustSeviyeAnahtar(kapali, 0, ['select'])
  const baslangic = sel + 6
  const bitis = sel < 0 ? -1 : ustSeviyeAnahtar(kapali, baslangic, ['from', 'where', 'on', 'returning'])
  const son = sel < 0 ? 0 : bitis < 0 ? kapali.length : bitis
  const liste = sel < 0 ? '' : kapali.slice(baslangic, son)
  // Veri CTE'den ya da `FROM (VALUES ...)` alt sorgusundan akıyorsa SELECT listesi sütun adlarından ibarettir: dize TÜM ifadede aranır.
  const dizeVar = cteDize || /'_+'/.test(kapali)
  const dizeAkisi = cteDize || bicim === 'with' || /\bvalues\b/i.test(kapali)
  if (!seciliVeriMi(liste) && !(dizeAkisi && dizeVar)) return null
  // Kolon listesi SELECT öğeleriyle HİZALANIR: yalnız DEĞER (literal) alan kolonlar veri alır (`auth.jwt() ->> 'email'` e-posta kolonuna
  // literal yazmaz). Hizalanamazsa (`*` bir sütunu birden çok kolona açar, sayı uyuşmuyor) ya da veri akışı varsa TÜM kolonlar (korumacı).
  let verili = kolonlar
  if (kolonlar && sel >= 0 && !dizeAkisi && !liste.includes('*')) {
    const parcalar = ustSeviyeParcalar(kapali, baslangic, son)
    if (parcalar.length === kolonlar.length) verili = kolonlar.filter((_, i) => seciliVeriMi(kapali.slice(parcalar[i][0], parcalar[i][1])))
  }
  return { tur: 'INSERT', tablo, kolonlar: verili, satir: 1, secim: true }
}

/**
 * SELECT öğesi/listesi (dizeleri `_` ile doldurulmuş metin) VERİ literal'i taşıyor mu: boş olmayan bir dize literal'i VAR ve o literal bir JSON
 * anahtarı (`->> 'email'`, `-> 'k'`, `#>> '{a}'`) ya da `current_setting('k')` argümanı DEĞİL.
 */
function seciliVeriMi(kapaliOge) {
  const re = /'_+'/g
  let m
  while ((m = re.exec(kapaliOge)) !== null) {
    // Yalnız literalin hemen öncesindeki KISA pencere bakılır (tüm öneki taramak çok literalli ifadede karesel olurdu).
    const onceki = kapaliOge.slice(Math.max(0, m.index - 40), m.index).trimEnd()
    if (/(?:->>|->|#>>|#>)$/.test(onceki) || /current_setting\($/i.test(onceki)) continue
    return true
  }
  return false
}

/**
 * Bir SQL ifadesinin VERİ ifadesi olup olmadığı ve ayrıntısı. Tanımlar (CREATE/ALTER/politika) ve dize literal'i taşımayan
 * `INSERT ... SELECT` (DB içi kopya) veri DEĞİLDİR. `WITH ... INSERT/UPDATE` CTE önekini atlar (3. tur, N1).
 * @returns {null | {tur: 'COPY'|'INSERT'|'UPDATE', tablo: string, kolonlar: string[]|null, satir: number}}
 */
function veriIfadesiAyrinti(ifade) {
  let metin = ifade.metin
  let cteDize = false
  if (/^\s*with\b/i.test(metin)) {
    const kapali = dizeleriKapat(metin)
    const k = ustSeviyeAnahtar(kapali, 0, ['insert', 'update'])
    if (k < 0) return null // salt SELECT/DELETE: veri yazmaz
    cteDize = /'_+'/.test(kapali)
    metin = metin.slice(k)
  }
  if (/^\s*update\b/i.test(metin)) return updateAyrinti(metin, cteDize)
  if (COPY_STDIN.test(metin)) {
    const m = COPY_BASLIK.exec(baslikMetni(metin))
    return { tur: 'COPY', tablo: m ? tabloAdi(m[1]) : '', kolonlar: m ? kolonAdlari(m[2]) : null, satir: ifade.veriSatiri }
  }
  if (INSERT_INTO.test(metin)) return insertAyrinti(metin, cteDize)
  return null
}

/** Geriye uyumlu: yalnız tür. */
function veriIfadesiTuru(ifade) {
  const a = veriIfadesiAyrinti({ metin: ifade, veriSatiri: 0 })
  return a ? a.tur : null
}

/**
 * SQL veri ifadelerinin bulguları: R2 (kişisel alan; kolon listesiz hassas tablo), R3 (kolon listesinde kimlik + fiyat, ≥eşik
 * satır), R5 (kart parçası çifti). Ayrıca `bozuk` bayrağı (ayrıştırma güvenilmez → ölçülemedi).
 */
function sqlDegerlendir(sql) {
  const { ifadeler, bozuk } = sqlBol(sql)
  const bulgular = []
  // O3: satırlar DOSYA genelinde TABLO başına toplanır. `pg_dump --column-inserts` her satırı AYRI INSERT yazar (satır=1);
  // ifade başına sayan eşik bunu hiç görmezdi. Tablo adı normalleştirilir (şema öneki ve tırnak atılmış).
  const tablolar = new Map() // norm(tablo) -> { ad, hassas, turler: Set, genel: Map(nk -> {ad, satir}), r3: number }
  const tabloKaydi = (ad) => {
    const nt = norm(ad)
    if (!tablolar.has(nt)) {
      const etiket = /^[A-Za-z0-9_$-]{1,63}$/.test(ad) ? ad : '(tablo adı çözülemedi)'
      tablolar.set(nt, { ad: etiket, hassas: HASSAS_TABLO_NORM.has(nt), turler: new Set(), genel: new Map(), r3: 0 })
    }
    return tablolar.get(nt)
  }
  for (const ifade of ifadeler) {
    const a = veriIfadesiAyrinti(ifade)
    if (!a) continue
    // UPDATE'te kişisel adın İFADE METNİNDE geçmesi yetmez (`SET customer_email = lower(customer_email)` veri atamaz): yalnız
    // değer atanan kolonlar sayılır. INSERT/COPY'de eski davranış korunur (alan adı ifade metninde geçiyorsa).
    // `INSERT ... SELECT` (a.secim) için de yalnız DEĞER alan kolonlar sayılır: WHERE/NOT EXISTS koşulundaki kişisel ad veri DEĞİLDİR (3. tur, N1).
    const alanlar = new Set(a.tur === 'UPDATE' || a.secim ? [] : (ifade.metin.match(KISISEL_SQL) || []).map((x) => x.toLowerCase()))
    const kol = a.kolonlar ? a.kolonlar.map(norm) : []
    const t = tabloKaydi(a.tablo)
    for (const k of a.kolonlar || []) {
      const sinif = kisiselAlanSinifi(k)
      if (sinif === 'belirgin') alanlar.add(alanEtiketi(k).toLowerCase())
      else if (sinif === 'genel') {
        const nk = norm(k)
        const g = t.genel.get(nk) || { ad: alanEtiketi(k), satir: 0 }
        g.satir += a.satir
        t.genel.set(nk, g)
        t.turler.add(a.tur)
      }
    }
    if (alanlar.size > 0) bulgular.push({ kural: 'R2', ayrinti: `${a.tur} ifadesi, alan: ${[...alanlar].sort().join(', ')}` })
    if (a.kolonlar === null && t.hassas) {
      bulgular.push({ kural: 'R2', ayrinti: `${a.tur} ifadesi kolon listesiz, hassas tablo: ${t.ad}` })
    }
    if (kol.some(kimlikAnahtariMi) && kol.some(fiyatAnahtariMi)) {
      t.r3 += a.satir
      t.turler.add(a.tur)
    }
    if (kol.includes('binnumber') && kol.includes('lastfourdigits')) {
      bulgular.push({ kural: 'R5', ayrinti: `${a.tur} ifadesi: binNumber + lastFourDigits kolonları` })
    }
  }
  for (const t of tablolar.values()) {
    // Hassas tabloda genel alan eşiği 1: o tabloya kolon listesiyle yazılan TEK satır bile kişisel veridir (tek satırlık tohum).
    const esik = t.hassas ? 1 : KISISEL_ESIK
    const vurgu = [...t.genel.values()].filter((g) => g.satir >= esik).map((g) => g.ad)
    const turler = [...t.turler].sort().join('/')
    if (vurgu.length > 0) {
      bulgular.push({ kural: 'R2', ayrinti: `${turler} ifadeleri, tablo ${t.ad}: genel alan (dosya genelinde ≥${esik} satır): ${vurgu.sort().join(', ')}` })
    }
    if (t.r3 >= FIYAT_ESIGI) {
      bulgular.push({ kural: 'R3', ayrinti: `${turler} ifadeleri, tablo ${t.ad}: ${t.r3} satır (kimlik + fiyat kolonu, dosya genelinde)` })
    }
  }
  return { bulgular, bozuk }
}

/** Geriye uyumlu: SQL veri ifadelerinde geçen kişisel alan adları ve ifade türleri. */
function sqlKisisel(sql) {
  return sqlDegerlendir(sql)
    .bulgular.filter((b) => b.kural === 'R2')
    .map((b) => {
      const [tur, alanlar] = b.ayrinti.split(' ifadesi')
      return { tur, alanlar: (alanlar || '').replace(/^,\s*alan:\s*/, '').split(', ') }
    })
}

// ── Tek dosya ve tüm ağaç ────────────────────────────────────────────────────────────────────────

/**
 * Bir veri dosyasının içeriğini kurallara göre değerlendirir. SAF: dosya sistemine dokunmaz.
 * @returns {{bulgular: Array<{kural:string, ayrinti:string}>, olculemedi: string[]}} — ayrıntıda DEĞER YOKTUR.
 */
function dosyaDegerlendir(yol, metin) {
  const uz = uzanti(yol)
  const bulgular = []
  const olculemedi = []
  const kisiselEkle = (alanlar, genel, ek = '') => {
    if (alanlar.length > 0) bulgular.push({ kural: 'R1', ayrinti: `alan: ${alanlar.join(', ')}${ek}` })
    if (genel.length > 0) bulgular.push({ kural: 'R1', ayrinti: `genel alan (≥${KISISEL_ESIK} dolu satır): ${genel.join(', ')}${ek}` })
  }
  if (uz === 'json' || uz === 'jsonl' || uz === 'ndjson') {
    const j = jsonBelgeleri(metin, uz)
    if (j.ayristirilamadi) {
      const h = hamTara(metin)
      kisiselEkle(h.alanlar, h.genel)
      if (h.r5) bulgular.push({ kural: 'R5', ayrinti: 'binNumber + lastFourDigits (ham metin taraması)' })
      if (h.r3) bulgular.push({ kural: 'R3', ayrinti: `≥${FIYAT_ESIGI} kimlik + fiyat/maliyet anahtarı (ham metin taraması)` })
      olculemedi.push('veri dosyası ayrıştırılamadı (JSON/JSONC/NDJSON değil); yalnız ham metin taraması yapıldı')
    } else {
      const { alanlar, genel, r5, enCok } = jsonGez(j.belgeler, j.satirlar)
      kisiselEkle(alanlar, genel)
      if (r5) bulgular.push({ kural: 'R5', ayrinti: 'binNumber + lastFourDigits (sıfır sayacı değil)' })
      if (enCok >= FIYAT_ESIGI) bulgular.push({ kural: 'R3', ayrinti: `${enCok} satır (kimlik + fiyat)` })
      // 3. tur (N2): ayrıştırma başarılı ama yapının DIŞINDA kalan metin (`/* {...kayıtlar...} */` yorumları, `[]` öncesi/sonrası düz metin)
      // önceden hiç taranmıyordu: ham metin taramasına girer; yorum OLMAYAN dış metin büyükse dosya "ölçülemedi" olur (CSV/düz döküm gizlenemez).
      if (j.atilan && j.atilan.trim() !== '') {
        const h = hamTara(j.atilan)
        const dis = ' (JSON yapısı dışındaki metin: yorum ya da baş/son çöp)'
        kisiselEkle(h.alanlar, h.genel, dis)
        if (h.r5) bulgular.push({ kural: 'R5', ayrinti: `binNumber + lastFourDigits (ham metin taraması${dis})` })
        if (h.r3) bulgular.push({ kural: 'R3', ayrinti: `≥${FIYAT_ESIGI} kimlik + fiyat/maliyet anahtarı (ham metin taraması${dis})` })
      }
      if (j.disMetin > JSON_DISI_SINIR) {
        olculemedi.push(`JSON yapısının DIŞINDA ${j.disMetin} karakterlik yorum olmayan metin var (başta/sonda düz metin ya da CSV olabilir); taranamadı`)
      }
    }
  } else if (uz === 'csv' || uz === 'tsv') {
    const tablo = csvTablo(metin, uz)
    if (tablo.basliksiz) {
      olculemedi.push('başlıksız CSV/TSV (ilk satır veri gibi: e-posta, UUID ya da saf sayı); başlık yoksa alan adı bilinemez')
    } else {
      const k = csvKisisel(tablo)
      kisiselEkle(k.alanlar, k.genel)
      if (csvKartParcasi(tablo)) bulgular.push({ kural: 'R5', ayrinti: 'binNumber + lastFourDigits (sıfır sayacı değil)' })
      const n = csvFiyatSatiri(tablo)
      if (n >= FIYAT_ESIGI) bulgular.push({ kural: 'R3', ayrinti: `${n} satır (kimlik + fiyat)` })
    }
  } else if (uz === 'sql') {
    const s = sqlDegerlendir(metin)
    bulgular.push(...s.bulgular)
    if (s.bozuk) olculemedi.push('SQL ayrıştırılamadı (kapanmayan dize, yorum ya da dollar-quote)')
  }
  return { bulgular, olculemedi }
}

/** Geriye uyumlu: yalnız bulgular. */
function dosyaTara(yol, metin) {
  return dosyaDegerlendir(yol, metin).bulgular
}

/**
 * İzin listesi bu dosya + kural + BLOB için geçerli mi? YALNIZ IZIN_KURALLARI (O4).
 * `blobOku`: içeriğin `git hash-object` değerini döner (yalnız yol+kural eşleşince çağrılır); bilinmiyorsa `null`.
 * Kayıtta `blob` yoksa ya da içerikle uyuşmuyorsa izin YOKTUR: içeriği sabit olmayan izin, dosya sonradan gerçek veriyle
 * güncellense de sürerdi ("anlamsal kaçış").
 */
function izinliMi(yol, kural, izin, blobOku) {
  if (!IZIN_KURALLARI.includes(kural)) return false
  const adaylar = izin.filter((e) => e.yol === yol && e.kural === kural && typeof e.blob === 'string' && /^[0-9a-f]{40}$/.test(e.blob))
  if (adaylar.length === 0) return false
  const blob = blobOku()
  return typeof blob === 'string' && adaylar.some((e) => e.blob === blob)
}

/**
 * Tüm ağacı tarar.
 * @param {{dosyalar:string[], oku:(yol:string)=>string|null, izin?:ReadonlyArray<{yol:string,kural:string,blob?:string}>, ikili?:(yol:string)=>boolean, blobOf?:(yol:string)=>string|null}} g
 *   `oku`: içerik döner; dosya diskte yoksa `null` (atlanır); okunamıyorsa FIRLATIR (çağıran 2 döner).
 *   `ikili`: yolu SQLite imzasına karşı denetler (UZANTIDAN BAĞIMSIZ: her dosya için çağrılır, uzantısı R6 olanlar hariç).
 *   `blobOf`: yolun içeriğinin `git hash-object` değeri; verilmezse izin kaydı hiçbir şeyi muaf tutmaz (fail-closed).
 */
function tara({ dosyalar, oku, izin = IZIN_LISTESI, ikili, blobOf }) {
  const ihlaller = []
  const izinliler = []
  const olculemedi = []
  let veriDosyasi = 0
  const kaydet = (kayit) =>
    (izinliMi(kayit.dosya, kayit.kural, izin, () => (blobOf ? blobOf(kayit.dosya) : null)) ? izinliler : ihlaller).push(kayit)
  for (const yol of dosyalar) {
    for (const ad of yolIhlali(yol)) ihlaller.push({ kural: 'R4', ad: KURALLAR.R4, dosya: yol, ayrinti: `kalıp: ${ad}` })
    const uz = uzanti(yol)
    if (ikiliUzantiMi(yol)) {
      kaydet({ kural: 'R6', ad: KURALLAR.R6, dosya: yol, ayrinti: `izlenen ikili veritabanı (.${uz})` })
    } else if (ikili && ikili(yol)) {
      kaydet({ kural: 'R6', ad: KURALLAR.R6, dosya: yol, ayrinti: 'izlenen ikili veritabanı (SQLite imzası ya da pg_dump arşiv imzası)' })
    }
    if (!VERI_UZANTILARI.includes(uz)) continue
    const metin = oku(yol)
    if (metin === null) continue
    veriDosyasi++
    if (metin.includes(String.fromCharCode(0))) {
      olculemedi.push({ dosya: yol, ayrinti: 'veri dosyasında NUL baytı (BOM\'suz UTF-16 ya da ikili içerik); okunamadı' })
      continue
    }
    const d = dosyaDegerlendir(yol, metin)
    for (const b of d.bulgular) kaydet({ kural: b.kural, ad: KURALLAR[b.kural], dosya: yol, ayrinti: b.ayrinti })
    for (const o of d.olculemedi) olculemedi.push({ dosya: yol, ayrinti: o })
  }
  return { ihlaller, izinliler, olculemedi, taranan: { dosya: dosyalar.length, veri: veriDosyasi } }
}

// ── Git ─────────────────────────────────────────────────────────────────────────────────────────

/** `git` ortamı: üst süreçten gelen GIT_* değişkenleri (kanca içinde GIT_DIR gibi) başka depoya sızmasın. */
function temizOrtam(env) {
  const o = {}
  for (const [k, v] of Object.entries(env)) if (!k.startsWith('GIT_')) o[k] = v
  return o
}

function git(kok, env, args, girdi) {
  return execFileSync('git', args, {
    cwd: kok,
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: temizOrtam(env),
    input: girdi,
  })
}

function gitDosyalari(kok, env) {
  return git(kok, env, ['ls-files', '-z']).toString('utf8').split('\0').filter(Boolean)
}

/** Diskten okur: yoksa null; sembolik bağ/dizin atlanır (null); `sinir` bayttan büyükse FIRLATIR. UTF-16 BOM çözülür. */
function diskOkuyucu(kok, sinir = BUYUK_DOSYA_SINIRI) {
  return (yol) => {
    const mutlak = path.join(kok, yol)
    let st
    try {
      st = fs.lstatSync(mutlak)
    } catch (e) {
      if (e && e.code === 'ENOENT') return null
      throw e
    }
    if (!st.isFile()) return null
    if (st.size > sinir) {
      throw new Error(`dosya çok büyük, taranamadı (${st.size} bayt > ${sinir}): ${yol}`)
    }
    return metneCevir(fs.readFileSync(mutlak))
  }
}

/** Başlığın (ilk baytların) SQLite imzası olup olmadığı. */
const sqliteBaslikMi = (tampon) => tampon.length >= SQLITE_IMZASI.length && tampon.toString('latin1', 0, SQLITE_IMZASI.length) === SQLITE_IMZASI
/** Başlığın `pg_dump -Fc` arşiv imzası olup olmadığı (N6). */
const pgDumpBaslikMi = (tampon) => tampon.length >= PGDUMP_IMZASI.length && tampon.toString('latin1', 0, PGDUMP_IMZASI.length) === PGDUMP_IMZASI
/** İkili veritabanı/döküm başlığı: SQLite ya da pg_dump özel biçim. R6 imza taraması (ağaç ve itilen nesne) bunu kullanır. */
const ikiliBaslikMi = (tampon) => sqliteBaslikMi(tampon) || pgDumpBaslikMi(tampon)

/**
 * Yolun ilk 16 baytı SQLite imzası mı? UZANTIDAN BAĞIMSIZ, her izlenen dosya için çağrılır (O1). Diskte olmayan ya da düzenli
 * dosya olmayan yol (alt modül, bağ) `false`; BAŞKA bir okuma hatası FIRLATIR (çağıran çıkış 2 döner): okunamayan dosya
 * "ikili değil" diye geçmez.
 */
function sqliteImzasiMi(kok) {
  return (yol) => {
    const mutlak = path.join(kok, yol)
    let st
    try {
      st = fs.lstatSync(mutlak)
    } catch (e) {
      if (e && e.code === 'ENOENT') return false
      throw e
    }
    if (!st.isFile() || st.size < SQLITE_IMZASI.length) return false
    const fd = fs.openSync(mutlak, 'r')
    try {
      const tampon = Buffer.alloc(16)
      const n = fs.readSync(fd, tampon, 0, 16, 0)
      return ikiliBaslikMi(tampon.subarray(0, n))
    } finally {
      fs.closeSync(fd)
    }
  }
}

/** Yolun içeriğinin `git hash-object` değeri (izin kaydının blob bağı). Hesaplanamazsa `null` → izin yok (fail-closed). */
function gitBlobu(kok, env) {
  return (yol) => {
    try {
      return git(kok, env, ['hash-object', '--', yol]).toString('utf8').trim()
    } catch {
      return null
    }
  }
}

// ── Yeni nesneler (itilecek / PR'a giren TÜM blob'lar) ──────────────────────────────────────────

/**
 * `git rev-list --objects <uç>... --not (--remotes | <haric>...)` ile erişilen TÜM blob'ları tarar:
 * sonradan silinmiş dosyalar dahil. Yol kuralları (R4/R6) her yola, içerik kuralları veri uzantılı blob'lara,
 * SQLite imzası (R6) UZANTIDAN BAĞIMSIZ her aday blob'un başlığına uygulanır.
 *
 * ⭐D2: `rev-list --objects` her blob'u TEK yolla basar (ilk gördüğü). Aynı içerik hem uzantısız hem veri uzantılı yolla
 * itilirse içerik taraması basılan yola bağlı olurdu. Yollar bu yüzden commit başına `git diff-tree -r` ile (yeni/değişen)
 * toplanır ve her blob TAŞIYAN HER YOLLA ölçülür.
 *
 * ⭐Y1: tavan (nesne sayısı, okunacak bayt) aşılırsa TÜM TARAMA İPTAL EDİLMEZ: sığanlar taranır, sığmayanlar "ölçülemedi"
 * diye listelenir (çıkış 2). Git hatası ya da okunamayan blob yine FIRLATIR (çağıran 2 döner).
 */
function yeniNesneleriTara({ kok, ucler, haric = [], env = process.env, izin = IZIN_LISTESI, nesneTavani = NESNE_TAVANI, okumaTavani = OKUMA_TAVANI }) {
  const args = ['rev-list', '--objects', ...ucler, '--not', ...(haric.length > 0 ? haric : ['--remotes'])]
  const tumSatirlar = git(kok, env, args).toString('utf8').split('\n').filter((s) => s.trim() !== '')
  const ihlaller = []
  const izinliler = []
  const olculemedi = []
  let satirlar = tumSatirlar
  if (tumSatirlar.length > nesneTavani) {
    satirlar = tumSatirlar.slice(0, nesneTavani)
    olculemedi.push({
      dosya: '(yeni nesneler)',
      ayrinti: `yeni nesne sayısı tavanı aştı (${tumSatirlar.length} > ${nesneTavani}): ilk ${nesneTavani} nesne tarandı, kalan ${tumSatirlar.length - nesneTavani} nesne TARANAMADI`,
    })
  }
  const yollar = new Map() // sha -> Set(yol)
  const tumSha = []
  for (const s of satirlar) {
    const i = s.indexOf(' ')
    const sha = i < 0 ? s : s.slice(0, i)
    tumSha.push(sha)
    if (i > 0) {
      if (!yollar.has(sha)) yollar.set(sha, new Set())
      yollar.get(sha).add(s.slice(i + 1))
    }
  }
  const bilgi = new Map() // sha -> {tur, boyut}
  if (tumSha.length > 0) {
    const cikti = git(kok, env, ['cat-file', '--batch-check'], `${tumSha.join('\n')}\n`).toString('utf8')
    for (const s of cikti.split('\n')) {
      const p = s.split(' ')
      if (p.length === 3) bilgi.set(p[0], { tur: p[1], boyut: Number(p[2]) })
    }
  }
  // D2: her yeni commit'in yeni/değişen yolları (birleşme commit'inde `-c`: yalnız çakışma çözümü). Yalnız YENİ blob'lar sayılır.
  const commitler = tumSha.filter((s) => bilgi.get(s)?.tur === 'commit')
  if (commitler.length > 0) {
    const parcalar = git(kok, env, ['diff-tree', '--stdin', '-r', '-c', '--root', '--no-commit-id', '--no-abbrev', '-z'], `${commitler.join('\n')}\n`)
      .toString('utf8')
      .split('\0')
    for (let i = 0; i < parcalar.length; i++) {
      const baslik = parcalar[i]
      if (!baslik.startsWith(':')) continue
      const ebeveyn = baslik.length - baslik.replace(/^:+/, '').length // başındaki `:` sayısı = ebeveyn sayısı (birleşmede ≥2)
      const alanlar = baslik.replace(/^:+/, '').split(' ')
      const hedefKip = alanlar[ebeveyn]
      const hedefSha = alanlar[2 * ebeveyn + 1]
      const yol = parcalar[i + 1]
      i++ // yol belirteci
      if (!yol || hedefKip === '160000' || !hedefSha || bilgi.get(hedefSha)?.tur !== 'blob') continue
      if (!yollar.has(hedefSha)) yollar.set(hedefSha, new Set())
      yollar.get(hedefSha).add(yol)
    }
  }
  const kaydet = (kayit, blob) => (izinliMi(kayit.dosya, kayit.kural, izin, () => blob) ? izinliler : ihlaller).push(kayit)
  const veriOgeleri = [] // içeriği kural taramasına girecek blob'lar (veri uzantılı yolu olanlar)
  const imzaOgeleri = [] // yalnız SQLite başlığına bakılacak aday blob'lar
  let blobSayisi = 0
  const goruldu = new Set()
  for (const [sha, kumeler] of yollar) {
    const b = bilgi.get(sha)
    if (!b || b.tur !== 'blob') continue
    blobSayisi++
    for (const yol of kumeler) {
      for (const ad of yolIhlali(yol)) {
        const anahtar = `R4\0${yol}\0${ad}`
        if (!goruldu.has(anahtar)) {
          goruldu.add(anahtar)
          ihlaller.push({ kural: 'R4', ad: KURALLAR.R4, dosya: yol, ayrinti: `kalıp: ${ad}` })
        }
      }
      if (ikiliUzantiMi(yol)) {
        const anahtar = `R6\0${yol}\0${sha}`
        if (!goruldu.has(anahtar)) {
          goruldu.add(anahtar)
          kaydet({ kural: 'R6', ad: KURALLAR.R6, dosya: yol, ayrinti: `izlenen ikili veritabanı (.${uzanti(yol)})` }, sha)
        }
      }
    }
    const yolListesi = [...kumeler]
    const veriYollari = yolListesi.filter((y) => VERI_UZANTILARI.includes(uzanti(y)))
    // Uzantısı zaten R6 olan yollar yukarıda kaydedildi; AYNI içeriği taşıyan BAŞKA yollar (a-yedek, veri.json) imzayla ayrıca ölçülür.
    const digerYollar = yolListesi.filter((y) => !ikiliUzantiMi(y))
    if (veriYollari.length > 0 && b.boyut > BUYUK_DOSYA_SINIRI) {
      olculemedi.push({ dosya: veriYollari[0], ayrinti: `veri blob'u çok büyük (${b.boyut} bayt); taranamadı` })
    } else if (veriYollari.length > 0) {
      veriOgeleri.push({ sha, yollar: yolListesi, veriYollari, digerYollar, boyut: b.boyut })
    } else if (digerYollar.length > 0 && b.boyut >= SQLITE_IMZASI.length) {
      imzaOgeleri.push({ sha, yollar: yolListesi, veriYollari: [], digerYollar, boyut: b.boyut })
    }
  }
  // Okuma bütçesi: önce veri blob'ları, sonra imza adayları; SIĞMAYAN "ölçülemedi" (Y1: sığanı tara, kalanı listele).
  const okunacak = []
  const atlanan = []
  let toplam = 0
  for (const o of [...veriOgeleri, ...imzaOgeleri]) {
    if (toplam + o.boyut > okumaTavani) atlanan.push(o)
    else {
      toplam += o.boyut
      okunacak.push(o)
    }
  }
  for (const o of atlanan.slice(0, 20)) {
    olculemedi.push({ dosya: o.yollar[0], ayrinti: `okuma tavanı aşıldı (${okumaTavani} bayt): bu blob (${o.boyut} bayt) TARANAMADI` })
  }
  if (atlanan.length > 20) {
    olculemedi.push({ dosya: '(yeni nesneler)', ayrinti: `okuma tavanı nedeniyle ${atlanan.length - 20} blob daha TARANAMADI (ilk 20 adıyla yukarıda)` })
  }
  let veriBlob = 0
  // 64 MB'lık gruplar halinde oku
  for (let bas = 0; bas < okunacak.length; ) {
    let grupBayt = 0
    const grup = []
    while (bas < okunacak.length && (grup.length === 0 || grupBayt + okunacak[bas].boyut <= 64 * 1024 * 1024)) {
      grup.push(okunacak[bas])
      grupBayt += okunacak[bas].boyut
      bas++
    }
    const cikti = git(kok, env, ['cat-file', '--batch'], `${grup.map((g) => g.sha).join('\n')}\n`)
    let konum = 0
    for (const g of grup) {
      const nl = cikti.indexOf(0x0a, konum)
      const baslik = cikti.toString('utf8', konum, nl).split(' ')
      const boyut = Number(baslik[2])
      if (baslik[1] !== 'blob' || !Number.isFinite(boyut)) throw new Error(`blob okunamadı: ${g.yollar[0]}`)
      const ham = cikti.subarray(nl + 1, nl + 1 + boyut)
      konum = nl + 1 + boyut + 1
      // O1: SQLite imzası UZANTIDAN BAĞIMSIZ (uzantısı zaten R6 olanlar yukarıda kaydedildi)
      if (ikiliBaslikMi(ham)) {
        for (const yol of g.digerYollar) kaydet({ kural: 'R6', ad: KURALLAR.R6, dosya: yol, ayrinti: 'itilen ikili veritabanı (SQLite imzası ya da pg_dump arşiv imzası)' }, g.sha)
      }
      if (g.veriYollari.length === 0) continue
      veriBlob++
      const icerik = metneCevir(ham)
      if (icerik.includes(String.fromCharCode(0))) {
        olculemedi.push({ dosya: g.veriYollari[0], ayrinti: "veri blob'unda NUL baytı (BOM'suz UTF-16 ya da ikili içerik); okunamadı" })
        continue
      }
      // Aynı içerik her VERİ UZANTISIYLA bir kez değerlendirilir, bulgu her yol için ayrı kaydedilir.
      const onbellek = new Map()
      for (const yol of g.veriYollari) {
        const uz = uzanti(yol)
        if (!onbellek.has(uz)) onbellek.set(uz, dosyaDegerlendir(yol, icerik))
        const d = onbellek.get(uz)
        for (const x of d.bulgular) kaydet({ kural: x.kural, ad: KURALLAR[x.kural], dosya: yol, ayrinti: x.ayrinti }, g.sha)
        for (const o of d.olculemedi) olculemedi.push({ dosya: yol, ayrinti: o })
      }
    }
  }
  return { ihlaller, izinliler, olculemedi, taranan: { dosya: tumSha.length, veri: veriBlob, blob: blobSayisi } }
}

// ── Komut satırı ────────────────────────────────────────────────────────────────────────────────

/** GitHub Actions ek açıklaması için özellik değeri kaçışı. */
const kacis = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A').replace(/:/g, '%3A').replace(/,/g, '%2C')

/** pre-push stdin'inden itilecek yerel uçlar (silme satırları `0000…` atlanır). */
function itilecekUclar(stdin) {
  const uclar = new Set()
  for (const satir of String(stdin || '').split(/\r?\n/)) {
    const p = satir.trim().split(/\s+/)
    if (p.length >= 2 && /^[0-9a-f]{40,64}$/.test(p[1]) && !/^0+$/.test(p[1])) uclar.add(p[1])
  }
  return [...uclar]
}

/**
 * CLI gövdesi. Süreci sonlandırmaz, çıkış kodunu döner (test edilebilir).
 * @param {string[]} argv @param {{cwd?:string, env?:object, yaz?:(s:string)=>void, hata?:(s:string)=>void, izin?:ReadonlyArray<object>, stdin?:string}} [ortam]
 */
function calistir(argv, ortam = {}) {
  const cwd = ortam.cwd || process.cwd()
  const env = ortam.env || process.env
  const yaz = ortam.yaz || ((s) => process.stdout.write(`${s}\n`))
  const hata = ortam.hata || ((s) => process.stderr.write(`${s}\n`))
  const izin = ortam.izin || IZIN_LISTESI
  let kok = cwd
  let yeniUc = null
  let haric = []
  let prePush = false
  const kullanim = '(kullanım: node scripts/security/depo-dokum-kapisi.cjs [--kok <dizin>] [--yeni-nesneler <uç> [--haric <ref>]] [--pre-push])'
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--kok') {
      if (!argv[i + 1]) {
        hata('Çalıştırma hatası: --kok bir dizin ister.')
        return 2
      }
      kok = path.resolve(cwd, argv[++i])
    } else if (argv[i] === '--yeni-nesneler') {
      if (!argv[i + 1]) {
        hata('Çalıştırma hatası: --yeni-nesneler bir uç (commit/ref) ister.')
        return 2
      }
      yeniUc = argv[++i]
    } else if (argv[i] === '--haric') {
      if (!argv[i + 1]) {
        hata('Çalıştırma hatası: --haric bir ref ister.')
        return 2
      }
      haric.push(argv[++i])
    } else if (argv[i] === '--pre-push') {
      prePush = true
    } else {
      hata(`Çalıştırma hatası: bilinmeyen argüman: ${argv[i]}  ${kullanim}`)
      return 2
    }
  }
  if (haric.length > 0 && !yeniUc) {
    hata('Çalıştırma hatası: --haric yalnız --yeni-nesneler ile kullanılır.')
    return 2
  }

  const sonuclar = []
  let etiket = 'ağaç'
  try {
    if (prePush) {
      etiket = 'itilecek nesneler'
      const stdin = ortam.stdin !== undefined ? ortam.stdin : fs.readFileSync(0, 'utf8')
      const uclar = itilecekUclar(stdin)
      if (uclar.length === 0) {
        yaz('Depo döküm kapısı (pre-push): itilecek yeni uç yok (silme ya da boş girdi); taranacak şey yok.')
        return 0
      }
      sonuclar.push(yeniNesneleriTara({ kok, ucler: uclar, env, izin }))
    } else if (yeniUc) {
      etiket = 'yeni nesneler'
      sonuclar.push(yeniNesneleriTara({ kok, ucler: [yeniUc], haric, env, izin }))
    } else {
      const dosyalar = gitDosyalari(kok, env)
      if (dosyalar.length === 0) {
        hata('Çalıştırma hatası: git ls-files hiç dosya döndürmedi (boş evren ölçüm değildir). Kapı YEŞİL VERMEZ.')
        return 2
      }
      sonuclar.push(tara({ dosyalar, oku: diskOkuyucu(kok), izin, ikili: sqliteImzasiMi(kok), blobOf: gitBlobu(kok, env) }))
      // Ara commit taraması (D4): OLAYDAN BAĞIMSIZ. HEAD bir birleşme commit'iyse (GitHub'ın `refs/pull/N/merge` biçimi: HEAD^1 =
      // taban, HEAD^2 = PR ucu) ve geçmiş tamsa, PR'ın ara commit'lerindeki (sonradan silinenler dahil) nesneler de taranır.
      // Önceki sürüm yalnız `pull_request` olayında tarıyordu: elle tetiklemede (workflow_dispatch) aynı birleşme commit'i sessizce atlanıyordu.
      const sig = git(kok, env, ['rev-parse', '--is-shallow-repository']).toString('utf8').trim()
      let ebeveyn2 = false
      try {
        git(kok, env, ['rev-parse', '--verify', '--quiet', 'HEAD^2'])
        ebeveyn2 = true
      } catch {
        ebeveyn2 = false
      }
      if (sig !== 'true' && ebeveyn2) {
        sonuclar.push(yeniNesneleriTara({ kok, ucler: ['HEAD'], haric: ['HEAD^1'], env, izin }))
        etiket = "ağaç + PR ara commit'leri"
      } else {
        const neden = sig === 'true' ? 'depo sığ (shallow)' : "HEAD birleşme commit'i değil"
        yaz(`Not: ara commit taraması atlandı (${neden}); \`fetch-depth: 0\` ve birleşme commit'i ister. Yalnız ağaç tarandı.`)
        // PR/elle tetiklemede bu bir yapılandırma kusurudur: Actions ekranında GÖRÜNÜR olsun (log'a gömülü kalmasın).
        if (env.GITHUB_ACTIONS === 'true' && ['pull_request', 'pull_request_target', 'workflow_dispatch'].includes(env.GITHUB_EVENT_NAME)) {
          yaz(`::warning title=Depo döküm kapısı::Ara commit taraması atlandı (${kacis(neden)}): PR'ın sonradan silinen dosyaları taranmadı.`)
        }
      }
    }
  } catch (e) {
    hata(`Çalıştırma hatası (ölçülemedi — bu ihlal DEĞİL, kapı yeşil de vermez): ${e && e.message ? e.message : e}`)
    return 2
  }

  const toplam = { ihlaller: [], izinliler: [], olculemedi: [], dosya: 0, veri: 0 }
  for (const s of sonuclar) {
    toplam.ihlaller.push(...s.ihlaller)
    toplam.izinliler.push(...s.izinliler)
    toplam.olculemedi.push(...s.olculemedi)
    toplam.dosya += s.taranan.dosya
    toplam.veri += s.taranan.veri
  }
  const actions = env.GITHUB_ACTIONS === 'true'
  for (const z of toplam.izinliler) yaz(`IZINLI ${z.kural} ${z.ad}  ${z.dosya}  [${z.ayrinti}]`)
  for (const v of toplam.ihlaller) {
    if (actions) yaz(`::error file=${kacis(v.dosya)},title=Depo döküm kapısı::${v.kural} ${v.ad} — ${kacis(v.ayrinti)}`)
    else yaz(`IHLAL ${v.kural} ${v.ad}  ${v.dosya}  [${v.ayrinti}]`)
  }
  for (const o of toplam.olculemedi) {
    if (actions) yaz(`::error file=${kacis(o.dosya)},title=Depo döküm kapısı::OLCULEMEDI — ${kacis(o.ayrinti)}`)
    else yaz(`OLCULEMEDI  ${o.dosya}  [${o.ayrinti}]`)
  }
  yaz(
    `Depo döküm kapısı (${etiket}): ${toplam.dosya} ${prePush || yeniUc ? 'nesne' : 'izlenen dosya'}, ${toplam.veri} veri dosyası tarandı; ` +
      `ihlal ${toplam.ihlaller.length}, izinli ${toplam.izinliler.length}, ölçülemedi ${toplam.olculemedi.length}.`,
  )
  if (toplam.ihlaller.length > 0) {
    yaz('')
    yaz('Bu dosyalar herkese açık depoya giremez (kişisel veri, ödeme parçası, fiyat/maliyet dökümü, ikili veritabanı). Ne yapılır:')
    yaz("  1) İzlemeyi bırak, yerel kopya kalsın:  git rm --cached -- '<dosya>'  ve  .gitignore'a kalıp ekle.")
    yaz('  2) Test verisi gerekiyorsa GERÇEK dökümün ARINDIRILMIŞ kopyasını kullan (her satır bağımsız sentetik değer, yapı aynı).')
    yaz('  3) Dosya GİT GEÇMİŞİNDE ya da itilecek commit\'lerde zaten varsa silmek ayrı iştir: ALT-41 (Recep teyidiyle). Burada geçmiş yeniden yazılmaz.')
    yaz('  Cetvel: docs/standards/depoya-giremeyecek-veri-standard.md')
    return 1
  }
  if (toplam.olculemedi.length > 0) {
    yaz('')
    yaz('Ölçülemeyen dosya var: bu İHLAL DEĞİL ama kapı yeşil de vermez (başlıksız/ayrıştırılamayan veri dosyası). Dosyayı gözle incele;')
    yaz('başlık ekle ya da dosyayı veri uzantısından çıkar. Cetvel: docs/standards/depoya-giremeyecek-veri-standard.md')
    return 2
  }
  return 0
}

module.exports = {
  VERI_UZANTILARI,
  BUYUK_DOSYA_SINIRI,
  NESNE_TAVANI,
  OKUMA_TAVANI,
  KISISEL_ALANLAR,
  KISISEL_GENEL_ALANLAR,
  KISISEL_GENEL_KOKLER,
  KISISEL_GENEL_PARCALAR,
  KISISEL_GENEL_SON_PARCALAR,
  KISISEL_BELIRGIN_KOKLER,
  KISISEL_ESIK,
  HASSAS_TABLOLAR,
  KIMLIK_ANAHTARLARI,
  FIYAT_KOKLERI,
  FIYAT_ESIGI,
  KURALLAR,
  YOL_KURALLARI,
  R6_UZANTILARI,
  IZIN_KURALLARI,
  IZIN_LISTESI,
  norm,
  kisiselAlanSinifi,
  yolIhlali,
  sayiyaCevir,
  pozitifSayi,
  doluMu,
  metneCevir,
  csvAyristir,
  sqlIfadeleri,
  sqlBol,
  veriIfadesiTuru,
  dosyaTara,
  dosyaDegerlendir,
  tara,
  yeniNesneleriTara,
  itilecekUclar,
  diskOkuyucu,
  sqliteImzasiMi,
  gitBlobu,
  calistir,
}

if (require.main === module) {
  process.exitCode = calistir(process.argv.slice(2))
}
