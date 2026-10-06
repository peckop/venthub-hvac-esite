# Depoya Giremeyecek Veri — Cetvel v1.1

> **Kapsam:** herkese açık (PUBLIC) depoya veritabanı dökümü, müşteri/ödeme verisi, ödeme parçası ve fiyat-maliyet listesi girmez.
> **Zorlayan kapı:** `INV-DEPO-DOKUM-1` → `src/__tests__/conformance/depo-dokum-kapisi.test.ts` (hızlı birim kolları) ve
> `depo-dokum-kapisi-uctan-uca.test.ts` (sahte git deposu, CLI, kanca; yardımcılar `depo-dokum-kapisi.yardimci.ts`)
> (betik `scripts/security/depo-dokum-kapisi.cjs`; CI `ci` işinde 'Döküm kapısı (depoya giremeyecek veri)' adımı ve `.githooks/pre-push`)
> **Sahibi:** ALTYAPI · **Kayıt:** Kanban: ALT-39 · **İlk yazım:** 2026-10-06
> **Son doğrulama:** 2026-10-06.

## 1. Amaç

Depo 2026-08-15'ten beri PUBLIC (fork sayısı 0, ölçüldü). Geçmişi dahil her şey herkese açıktır; bir kez giren veri geri
alınamaz (CLAUDE.md "Notlar"). Bu cetvel **hangi verinin depoya girmediğini**, kapının **neye baktığını ve nerede koştuğunu**,
test için gerçek veri gerekince **ne yapılacağını** ve **geçmiş temizliğinin bu işin dışında** olduğunu söyler. Kardeş kurallar:
`pazar-olcum-standard.md` P6 (arama sorgusu, rakip, hacim verisi), `pricing-standard.md` K7 ("PUBLIC depoya gerçek oran ya da
tutar girmez"), `secret-exposure-audit-2026-08-15.md` (sır imzaları).

## 2. Doğuş olayı (ölçülmüş)

- Geçmişte depoya bir veri dökümü girmişti (2026 Ağustos başı); içinde müşteri alanları, ödeme parçaları ve fiyat-maliyet listesi
  vardı. Depo sonradan herkese açık oldu (2026-08-15).
- Aynı gün sır denetimi 18 **anahtar imzası** taradı; kişisel veriye ya da tablo imzasına bakan kapı yoktu (`secret-scan.py`'de
  kişisel veri deseni: 0, ölçüldü).
- **2026-10-05** dış denetim · **2026-10-06** ALTYAPI ölçümü (yalnız alan adı ve sayı yazıldı, değer yazılmadı) ve aynı gün
  güvenlik incelemesi: 9 bulgu; bu sürüm bulgu 1-4 ve 6-9'un kapanışıdır (5: fikstür/belge ayrı işte).
- **Kapı boşluğu:** hiçbir kapı kişisel veriye ya da tablo imzasına bakmıyordu; dökümü okuyan testler önce arındırılmış fikstüre bağlandı.

## 3. Kurallar (kapı DEĞERE değil ŞEKLE bakar)

| Kural | Tetik | Not |
|---|---|---|
| **R1** `kisisel-alan-dolu` | `.json/.jsonl/.ndjson/.csv/.tsv` dosyada kişisel alan adı **dolu** | İki katman: **belirgin** adlar (`customer_*`, `billing_address`, `shipping_address`, `invoice_info`, `tckn`, kart alanları) ≥1 dolu satır; **genel** adlar (`email`, `full_name`, `phone`, `address_line`, `tax_no`… şema tabanındaki kişisel kolonlar) **≥3** dolu satır (i18n/şema etiketleri yanlış alarm vermesin). Sözlük şema tabanından türetilir, testi tabanı OKUR |
| **R2** `sql-veri-ifadesi-kisisel-alan` | `.sql` veri ifadesi (`INSERT … VALUES`, `COPY … FROM stdin`) içinde kişisel alan; **kolon listesiz** INSERT/COPY'nin hassas tabloya yazması | `CREATE`, `ALTER`, politika, indeks, yorum ve `$$` gövdeleri **masumdur**. Hassas tablolar şema tabanından: kişisel kolon taşıyanlar + maliyet tablosu |
| **R3** `fiyat-dokumu` | JSON dizisi (her derinlik), JSONL, CSV ya da SQL kolon listesinde **≥5** satır: kimlik **ve** pozitif fiyat/maliyet | Eşleşme **önek/sonek toleranslı**: fiyat kökleri `price`, `cost`, `fiyat`, `maliyet`, `alış` (para birimi eki dahil: `purchase_price_eur`); kimlik `id`, `sku`, `slug`, `product_id`, `model_code`, `*_kod` |
| **R4** `dokum-yolu` | izlenen yolda `db-backup`, `pg_dump`, `.dump*`, `.sql.gz` ya da sıkıştırılmış/arşiv/ikili uzantı (`.gz .zip .tar .tgz .zst .xz .bz2 .7z .rar .backup .pgdump .xlsx .xls .har`), `toc.dat` | İçerikten bağımsız; boş dosya bile kırmızı |
| **R5** `odeme-parcasi` | `binNumber` **ve** `lastFourDigits` birlikte, değerler **sıfır sayacı** (`00000d` / `000d`) **değilse** | Gerçek ödeme yanıtı fikstür diye eklenirse yakalanır; arındırılmış fikstürün sıfır sayacı geçer |
| **R6** `ikili-veritabani` | izlenen `.db/.sqlite/.sqlite3` ya da SQLite imzalı dosya | İçine bakılamaz (secret-scan da göremez); izin listesi dosya bazlıdır |

- **Ölçülemedi (çıkış 2):** başlıksız CSV/TSV (ilk satır veri gibi: e-posta/UUID/saf sayı), ayrıştırılamayan veri dosyası, NUL baytlı
  veri dosyası, tavan aşımı. Ayrıştırılamayan JSON'da yine **ham metin taraması** koşar (her tırnak/büyük-küçük harf biçimiyle, jq akışı
  ve çok satırlı JSONL dahil); temiz çıksa bile dosya "ölçülemedi" kalır. JSONC (yorum, sondaki virgül), UTF-16 BOM'lu dosya ve
  başta/sonda çöpü olan JSON çözülüp ölçülür.
- **Çıkış kodu:** 0 temiz · 1 ihlal · **2 ölçülemedi** (git yok, depo değil, dosya okunamadı, boş evren, 64 MB üstü dosya, nesne tavanı).
  2 de KIRMIZIDIR: ölçemeyen kapı yeşil vermez; ama "ölçemedim" ile "ihlal" ayrı sonuçlardır.
- **Çıktı DEĞER BASMAZ:** yalnız dosya adı, kural adı, alan adı, sayı. Her kırmızı çıktı çözüm komutunu da basar.

## 4. İzin listesi (R3, R5, R6)

`IZIN_LISTESI` (betikte) **dosya bazlıdır** (glob yok) ve **yalnız R3, R5, R6** içindir; R1/R2/R4 **hiçbir koşulda** izin almaz: sahte
değerli bir müşteri alanı bile kırmızıdır, çünkü kapı değeri sahte mi gerçek mi ayırt edemez. Her satır `neden` ve `kanıt` taşır
(R3: "fiyat sahte/örnek"; R6: içerik taraması **sayıları** ve "ayrı kayıt: numara OPS'tan"; R5: sandbox kart biçimi, sayıyla). Tavan **4**
(artırmak testi değiştirmektir), yetim satır ve glob yasak, kural kümesi testle sabit. Bugünkü kayıtlar (hepsi gerekçeli):

- **R6 × 3:** `memory.db`, `registry/registry.db`, `registry/_legacy/registry.db` — salt okuma ölçümünde (2026-10-06) 0, 2 ve 3 tablo;
  e-posta/telefon/UUID/TCKN deseni **0**. İzlemeden çıkarma ayrı kayıttır (numarayı OPS verir).
- **R5 × 1:** `support/iyzico_support_payload.json` — iyzico destek talebi örnek yükü; 5/5 örnekte son dört hane `000d` (sandbox test kartı
  biçimi), metinde "sandbox" geçiyor. ⚠Yayımlanmış test kartı listesine karşı doğrulama ağ ister ve YAPILMADI; OPS teyidi bekler.
- R3: kayıt yok (gerçek ağaçta isabet çıkmadı).

## 5. Fikstür arındırma kuralı

Test, gerçek yanıtın yapısına ihtiyaç duyar, **değerine** değil (ders: "stub gerçeği taklit etmiyorsa test kördür").

1. Fikstür gerçek dökümden **doğrudan kopyalanmaz**; önce ARINDIRILIR. Müşteri adı, e-posta, telefon, adres alanları fikstüre HİÇ girmez.
2. Fikstür değerleri satır başına bağımsız sentetik üretilir; tek sabit çarpan/kaydırma YASAK (geri çıkarılabilir).
3. **İlişkiler korunur** (testin okuduğu şey budur): `basketId ≠ id`, `conversationId` 11/13, epoch bağı 13/13, `price = total_amount`,
   `paidPrice ≥ price`. Yalnız API sözlüğü sözcükleri (durum, aşama, para birimi, kart ağı/türü) olduğu gibi kalır; BIN ve son dört hane
   sıfır sayacıdır (R5 bunu ister).
4. **Makine doğrulaması şart:** üretici, özgün dökümdeki tüm dizeleri ve kimlikleri toplayıp fikstür metninde alt dize olarak arar;
   biri kalırsa **fırlatır**. Üretici tek kullanımlıktır ve depoya girmez (ham dökümün yolunu taşır).
5. Fikstür kendini ilan eder (`_aciklama`: ARINDIRILMIŞ, GERÇEK DEĞER YOK) ve kendi testi sızıntıyı yakalar (alan adı, `@`, `example.*`
   sunucuları, sıfır sayaçlı BIN/son dört). Yeri: `supabase/functions/_shared/__tests__/fixtures/odeme-eslesme-13-yanit.json`.

## 6. Geçmiş temizliği bu işin DIŞINDA

Ağaçtan silinen döküm **git geçmişinde durmaya devam eder**; bu cetvel ve kapı yalnız yenisinin girmesini engeller. Geçmişten silme
(geçmişi yeniden yazma, tüm şeritlerin dalları ve fork/klon etkisi) **ayrı iştir: ALT-41, 13 Ekim, Recep teyidiyle**. O güne kadar
dökümdeki değerlerin açıkta olduğu varsayılır; riskin büyüklüğünü ALT-41 değerlendirir, bu cetvel derecelendirmez. Burada
`filter-repo`, `rebase -i`, `reset --hard`, zorla push yoktur.

## 7. Kapı nerede koşar — DÜRÜST SINIR

**Master'a birleşmeyi CI durdurur; ağa çıkışı yalnız `pre-push` yakalar ve o atlanabilir (`git push --no-verify`).** İkisi aynı şeyi
söylemez: dal itildiği an commit herkese açık olabilir (dal silinse de `refs/pull/N/head` altında kalır); CI bunu geri alamaz.

| Yer | Ne tarar | Sonuç |
|---|---|---|
| `ci` işi (Install'dan **önce**, bağımlılıksız) | izlenen **ağaç**; GitHub `pull_request` + tam geçmiş varsa PR'ın **ara commit'leri** (`rev-list --objects HEAD --not HEAD^1`) | çıkış ≠ 0 → PR kırmızı. ⚠Önceki adım kırmızıysa bu adım koşmaz ("her koşuda" iddiası yoktur). Ara commit taraması `fetch-depth: 0` ister (ALT-38a ile gelir); sığ depoda yalnız ağaç taranır ve çıktı bunu söyler |
| `.githooks/pre-push` | itilecek **tüm nesneler**, sonradan silinenler dahil (`rev-list --objects <uç> --not --remotes`, `cat-file --batch`) | çıkış 1 → push **ENGELLENİR**; çıkış 2 (ölçülemedi) → yüksek sesli uyarı + **izin** (kesin kapı CI'dır) |

Tavanlar (nesne sayısı, okunacak bayt, 64 MB dosya) aşılırsa çıkış 2. Elle: `--yeni-nesneler <uç> [--haric <ref>]`, `--pre-push`, `--kok <dizin>`.
`INV-DEPO-DOKUM-1` kolları: kural kolları (KIRMIZI/TEMİZ, çıktıda değer yok), gerçek ağaç taraması ve boş evren kanaryası, **yeni nesneler**
(sonradan silinen dosya, PR ara commit'i, pre-push stdin'i, tavan), **pre-push kancası** (gerçek `sh` ile çıkış 0/1/2), şema tabanı kapsamı,
CI bağlama (adım var, Install'dan önce; `if:`, `continue-on-error`, `working-directory:`, bash dışı `shell:`, adım `env:`, başka adımın
kapı betiğine dokunması yasak), `.gitignore` kalıpları (`**/db-backup*`, `*.dump*`, `*.sql.gz`, `*.backup`, `*.pgdump`), izin listesi sınırı.
**CODEOWNERS** (kapı betiği, iş akışları ve conformance testleri için zorunlu sahip onayı) bu işte YOK: kapıyla testi birlikte gevşeten bir
PR'ı yalnız kod incelemesi yakalar; öneri OPS'a.

## 8. Bilinen sınırlar ve KAPSAM DIŞI (insan incelemesi)

Kapının **görmediği** biçimler (kasıtlı ya da maliyeti yüksek; yeşil çıktı bunların yokluğunu kanıtlamaz):

- Sütun/satır biçimli JSON (pandas `orient=split/values`), SKU anahtarlı fiyat haritası (`{"SKU":{"price":…}}`).
- Uzantı değiştirme (`.bak`, `.md`, `.yaml`, `.txt` içine yapıştırma), base64, dosyayı parçalara bölme.
- Değer deseni (e-posta/telefon/kart numarası) **aranmaz**; yalnız alan-adı imzası ve kart parçası çifti vardır.
- Şema tabanında olup sözlük dışı bırakılan **aşırı genel** adlar: `name`, `company`, `company_name`, `city`, `district`.
- `authCode`, `token`, `signature` **tek başına aranmaz** (tasarım belirteci vb. yanlış alarm; arındırılmış fikstür bunları sahte değerle taşır).
  Ödeme yanıtı dökümünü R5 (BIN + son dört) yakalar.
- Yeni bir kişisel kolon eklenince sözlük ve test listesi **birlikte** değişir; şema tabanı testi unutulanı kırmızıya çevirir.
