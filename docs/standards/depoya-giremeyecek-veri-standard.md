# Depoya Giremeyecek Veri — Cetvel v1.3

> **Kapsam:** herkese açık (PUBLIC) depoya veritabanı dökümü, müşteri/ödeme verisi, ödeme parçası ve fiyat-maliyet listesi girmez.
> **Zorlayan kapı:** `INV-DEPO-DOKUM-1` → `src/__tests__/conformance/depo-dokum-kapisi.test.ts` (hızlı birim kolları) ve
> `depo-dokum-kapisi-uctan-uca.test.ts` (sahte git deposu, CLI, kanca; yardımcılar `depo-dokum-kapisi.yardimci.ts`)
> (betik `scripts/security/depo-dokum-kapisi.cjs`; CI `ci` işinde 'Döküm kapısı (depoya giremeyecek veri)' adımı ve `.githooks/pre-push`)
> **Sahibi:** ALTYAPI · **Kayıt:** Kanban: ALT-39 · **İlk yazım:** 2026-10-06
> **Son doğrulama:** 2026-10-07.

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
  güvenlik incelemesi: 9 bulgu (bulgu 5 — fikstür ve belge — aynı PR'da yeniden yazıldı: §5). Aynı gün **ikinci tur** bağımsız
  inceleme (bu sürüm v1.2): itme öncesi kanca ölçülemedi'de izin veriyordu (Y1), R6 imzası yalnız 7 uzantıda bakıyordu (O1),
  R1 sözlüğü tabanı değil elle yazılmış listeyi doğruluyordu (O2), SQL eşikleri ifade başınaydı (O3), izin kaydı içeriğe bağlı
  değildi (O4); ayrıca D2-D7 (yol toplama, kübik düzenli ifade, ara commit olayı, kanca dala bağlı, fikstür kimlikleri, belge hizası).
- **2026-10-07 son tur (bu sürüm v1.3):** kök dizindeki `support/` klasörü ağaçtan SİLİNDİ (içinde döküm dışı kullanılan bir şey yoktu: atıflar
  yalnız bu işin kendi kayıtlarıydı); R5'in tek izinli örneği oydu, **kartın izin yolu da kapatıldı** (§4). **3. tur** bağımsız güvenlik incelemesi
  2. turun 13 bulgusundan 11'ini kapalı, 1'ini kısmen kapalı buldu ve 7 yeni bulgu yazdı (N1-N7); N1, N2, N3, N5, N6 bu sürümde kapandı, N4 ve N7
  ayrı kayıtta (§8). Düzeltmeler **bozma (sabotaj) ölçümüyle** sınandı: her bozma AYRI plan olarak atılabilir kopyalarda koşuldu; ilk koşuda
  yeşil kalan her bozma bir test boşluğu ya da yanlış test eşleştirmesiydi ve test eklenerek kapatıldı, yeniden koşuda KIRMIZI verdi
  (sayılar PR gövdesinde: sayı her turda değiştiği için bu cetvel sayı taşımaz). Davranışı değiştirmeyen tek bozma (eşdeğer mutant) adıyla ayrıldı.
- **Kapı boşluğu:** hiçbir kapı kişisel veriye ya da tablo imzasına bakmıyordu; dökümü okuyan testler önce arındırılmış fikstüre bağlandı.

## 3. Kurallar (kapı DEĞERE değil ŞEKLE bakar)

| Kural | Tetik | Not |
|---|---|---|
| **R1** `kisisel-alan-dolu` | `.json/.jsonl/.ndjson/.csv/.tsv` dosyada kişisel alan adı **dolu** | İki katman: **belirgin** adlar (`customer_*`, `billing_address`, `shipping_address`, `invoice_info`, `tckn`, kart alanları; kimlik no biçimleri `tc_kimlik_no`, `tcno`) ≥1 dolu satır; **genel** adlar **≥3** dolu satır (i18n/şema etiketleri yanlış alarm vermesin; sayım ANAHTAR başınadır: her biri bir kez geçen anahtarlar toplanmaz). **Eşleşme toleranslıdır** (O2): tam sözlük adı (`email`, `full_name`, `phone`, `address_line`, `tax_no`…) YA DA ad bir **tolerans kökünü** içerir (`applicant_email`, `email_to`, `contact_phone`, `identity_verified_at`, `eposta`, `telefon`, `ad_soyad`, `adres`, `vergi_no`, `musteri_adi`…; aksan/büyük-küçük harf fark etmez) YA DA bileşik adın SON parçası `ip` (`accept_ip`) / herhangi bir parçası `gsm`. **İstisna (ölçülmüş yanlış alarm):** genel sınıfta değer `/` ya da `http(s)://` ile başlıyorsa kişisel sayılmaz (bu depoda `adres` çoğunlukla URL adresidir; `ip_rating` koruma sınıfıdır). Kök listesi **şema tabanını tarayan** testle sınanır: adı kişisel kalıba uyan her kolon ya kapsanır ya da adıyla gerekçeli "bilerek dışarıda" listesindedir; kişisel kolonlu her tablo hassas listededir ya da gerekçeli dışarıdadır. **Şema DIŞI adlar (3. tur, N3):** ödeme sağlayıcı / API yanıtı alıcı blokları şema kolonlarıyla aynı adı taşımaz; `identityNumber`/`vkn` **belirgin**, `surname`, `address`, `registrationAddress`, `zipCode`, `iban`, `tel`, `cep` **genel** sayılır (`address` kök DEĞİL tam ad: kök olsa `address_type` etiketi yanlış alarm verirdi; `zip` tek başına kişisel değildir). **JSON yapısı dışı metin (N2):** ayrıştırma başarılı olsa da yorumlar ve gövde öncesi/sonrası metin ham taramaya girer; **yorum olmayan** dış metin 16 karakteri aşarsa dosya "ölçülemedi" olur (CSV/düz döküm `[]` sonrasına gizlenemez) |
| **R2** `sql-veri-ifadesi-kisisel-alan` | `.sql` veri ifadesi (`INSERT … VALUES`, `COPY … FROM stdin`, `UPDATE … SET <kişisel alan> = <dize>`) içinde kişisel alan; **kolon listesiz** INSERT/COPY'nin hassas tabloya yazması | `CREATE`, `ALTER`, politika, indeks, yorum ve `$$` gövdeleri **masumdur**. **Satırlar DOSYA genelinde TABLO başına toplanır** (O3): `pg_dump --column-inserts` her satırı ayrı INSERT yazar; genel alan eşiği (≥3) ve R3 eşiği (≥5) toplam satıra bakar. **Hassas tabloda genel alan eşiği 1**: kolon listesiyle yazılan tek satırlık tohum bile kırmızıdır. `UPDATE` yalnız **değer atanan** kolonu sayar (`SET x = lower(x)` veri atamaz; boş dize atama değildir). Hassas tablolar şema tabanından, tarayarak: kişisel kolon taşıyanlar + maliyet tablosu + auth şeması (`users`, `identities`; public şema tabanında yoktur, adıyla ayrılır) (16 tablo, betikteki `HASSAS_TABLOLAR`). **Veri ifadesi biçimleri (3. tur, N1):** `INSERT … VALUES`, `INSERT INTO t AS a (…)`, `INSERT … SELECT` (SELECT listesinde dize literal'i varsa; DB içi kopya veri değildir), `WITH … INSERT/UPDATE` (CTE öneki atlanır), `FROM (VALUES …)` alt sorgusu, `COPY … FROM stdin`, `UPDATE … SET`. SELECT biçiminde kolon listesi SELECT öğeleriyle **hizalanır**: yalnız literal değer alan kolonlar veri alır (`auth.jwt() ->> 'email'` bir JSON anahtarıdır, literal değer değildir); `*` ya da sayı uyuşmazlığında tüm kolonlar (korumacı). Dollar-quote (`$$…$$`, `$etiket$…$etiket$`) de literaldir. Başlık desenleri sınırlı ve boşluk sadeleştirmelidir (uzun `(` ve boşluk dizisi doğrusal zamanda biter, N5) |
| **R3** `fiyat-dokumu` | JSON dizisi (her derinlik), JSONL, CSV ya da SQL kolon listesinde **≥5** satır: kimlik **ve** pozitif fiyat/maliyet | Eşleşme **önek/sonek toleranslı**: fiyat kökleri `price`, `cost`, `fiyat`, `maliyet`, `alış` (para birimi eki dahil: `purchase_price_eur`); kimlik `id`, `sku`, `slug`, `product_id`, `model_code`, `*_kod` |
| **R4** `dokum-yolu` | izlenen yolda `db-backup`, `pg_dump`, `.dump*`, `.sql.gz` ya da sıkıştırılmış/arşiv/ikili/tablo uzantısı (`.gz .zip .tar .tgz .zst .xz .bz2 .7z .rar .backup .pgdump .xlsx .xls .har .parquet .ods .mdb .accdb`), `toc.dat`. **`.dump*`** ayraçla (`.` `-` `_`) devam eden her sonektir (`x.dump-20261007`, `x.dump_eski`; `dumpling` değil). **SQLite yan dosyaları** `*.db-wal`, `*.db-shm`, `*.db-journal` (ve `sqlite`/`sqlite3`/`db3` karşılıkları): imza taşımaz ama yazılmamış işlemleri tutar (N6) | İçerikten bağımsız; boş dosya bile kırmızı |
| **R5** `odeme-parcasi` | `binNumber` **ve** `lastFourDigits` birlikte, değerler **sıfır sayacı** (`00000d` / `000d`) **değilse** | Gerçek ödeme yanıtı fikstür diye eklenirse yakalanır; arındırılmış fikstürün sıfır sayacı geçer. **İzin ALMAZ** (§4): "sandbox kartı" diye anılan örnek bile kırmızıdır |
| **R6** `ikili-veritabani` | izlenen `.db/.sqlite/.sqlite3` ya da SQLite imzalı dosya ya da **`pg_dump -Fc` (özel biçim) arşivi** (`PGDMP` imzası, N6); **imza UZANTIDAN BAĞIMSIZ** okunur (O1): ağaç kipinde her izlenen dosyanın ilk baytları, itilen nesne kipinde her aday blob'un başlığı (`app.db.20261006`, `x.sqlite.orig`, `yedek.bin`, uzantısız yedek) | İçine bakılamaz (secret-scan da göremez); izin listesi dosya + **blob** bazlıdır (§4) |

- **Ölçülemedi (çıkış 2):** başlıksız CSV/TSV (ilk satır veri gibi: e-posta/UUID/saf sayı), ayrıştırılamayan veri dosyası, NUL baytlı
  veri dosyası, JSON gövdesinin dışında 16 karakterden uzun yorum olmayan metin (N2), tavan aşımı. Ayrıştırılamayan JSON'da yine **ham metin taraması** koşar (her tırnak/büyük-küçük harf biçimiyle, jq akışı
  ve çok satırlı JSONL dahil); temiz çıksa bile dosya "ölçülemedi" kalır. JSONC (yorum, sondaki virgül), UTF-16 BOM'lu dosya ve
  başta/sonda çöpü olan JSON çözülüp ölçülür.
- **Çıkış kodu:** 0 temiz · 1 ihlal · **2 ölçülemedi** (git yok, depo değil, dosya okunamadı, boş evren, 64 MB üstü dosya, nesne
  ya da bayt tavanı). 2 de KIRMIZIDIR: ölçemeyen kapı yeşil vermez (CI'da da, itme öncesi kancada da); ama "ölçemedim" ile "ihlal"
  ayrı sonuçlardır. **Tavan aşımı taramayı iptal etmez** (Y1): sığan nesneler/blob'lar taranır (ihlal varsa çıkış 1), sığmayanlar
  "ölçülemedi" diye listelenir (çıkış 2): bayt tavanında blob'lar adıyla (ilk 20), nesne sayısı tavanında kalan nesneler sayıyla.
- **Çıktı DEĞER BASMAZ:** yalnız dosya adı, kural adı, alan adı, sayı. Her kırmızı çıktı çözüm komutunu da basar.

## 4. İzin listesi (R3, R6)

`IZIN_LISTESI` (betikte) **dosya bazlıdır** (glob yok) ve **yalnız R3 ve R6** içindir; R1/R2/R4/**R5** **hiçbir koşulda** izin almaz: sahte
değerli bir müşteri alanı bile kırmızıdır, çünkü kapı değeri sahte mi gerçek mi ayırt edemez; ödeme kartı parçası (R5) için de izin yolu
YOKTUR (son tur: tek izinli örnek `support/` silindi; "sandbox kartı" iddiası ağ ister ve kapı bunu doğrulayamaz; sıfır sayaçlı arındırılmış
fikstür zaten R5'e takılmaz). Her satır `blob`, `neden` ve `kanıt` taşır (R3: "fiyat sahte/örnek"; R6: içerik taraması **sayıları** ve
"ayrı kayıt önerilecek (numarayı OPS verir)"). **Eşleşme yol + kural + BLOB'tur** (O4): `blob` izin verilen içeriğin `git hash-object`
değeridir; dosya sonradan (gerçek veriyle) güncellenirse blob değişir, izin düşer, kapı kırmızı olur ve kanıt YENİDEN ölçülür.
(Önceki sürüm yalnız yol+kurala bakıyordu: içeriği sabit olmayan izin, kapının "anlamsal kaçışıydı".) Blob'u olmayan ya da uyuşmayan
kayıt hiçbir şeyi muaf tutmaz. Tavan **4** (artırmak testi değiştirmektir; 2. turda O1'in yeni isabeti 4'ü 5 yapmıştı, `support/` silinince
R5 kaydı kalktı ve tavan 4'e indi), yetim satır ve glob yasak, kural kümesi testle sabit.
Bugünkü kayıtlar (hepsi gerekçeli):

- **R6 × 4:** `memory.db`, `registry/registry.db`, `registry/_legacy/registry.db` — salt okuma ölçümünde (2026-10-06) 0, 2 ve 3 tablo;
  e-posta/telefon/UUID/TCKN deseni **0**. Dördüncüsü `.cc/memory.db.pre_qwen.20260524_1830` (O1 imza taramasının YENİ isabeti; uzantısı
  `.db` değil): 102400 bayt, 8 tablo (toplam 4 satır), serbest sayfa 0, e-posta/telefon/UUID/TCKN deseni **0** (hücre ve ham bayt
  taraması). Hepsinde izlemeden çıkarma ayrı kayıttır (numarayı OPS verir); desen sayısı sıfırdan büyük çıksaydı izin eklenmez, kapı
  kırmızı bırakılırdı.
- R3: kayıt yok (gerçek ağaçta isabet çıkmadı). R5: kayıt yok ve olamaz (yukarıda).

## 5. Fikstür arındırma kuralı

Test, gerçek yanıtın yapısına ihtiyaç duyar, **değerine** değil (ders: "stub gerçeği taklit etmiyorsa test kördür").
(Bu bölüm artık aynı PR'ın gerçeğidir: fikstür ve test bu işte yeniden yazıldı; önceki sürümdeki "fikstür/belge ayrı işte" notu kalktı.)

1. Fikstür gerçek dökümden **doğrudan kopyalanmaz**; önce ARINDIRILIR. Müşteri adı, e-posta, telefon, adres alanları fikstüre HİÇ girmez.
2. Fikstür değerleri satır başına bağımsız sentetik üretilir; tek sabit çarpan/kaydırma YASAK (geri çıkarılabilir).
3. **İlişkiler korunur** (testin okuduğu şey budur): `basketId ≠ id`, `conversationId` 11/13, epoch bağı 13/13, `price = total_amount`,
   `paidPrice ≥ price`. Yalnız API sözlüğü sözcükleri (durum, aşama, para birimi, kart ağı/türü) olduğu gibi kalır; BIN ve son dört hane
   sıfır sayacıdır (R5 bunu ister). **Ödeme ve işlem numaraları** (`paymentId`, `paymentTransactionId`) da açık sahte metindir
   (`SENTETIK-ODEME-NN`, `SENTETIK-ISLEM-NN-K`): gerçek iyzico numarası sekiz haneli saf sayıdır, bu biçim onunla karışamaz ve
   testin "opak alanlar" kolu kilitler (2. tur, D6).
4. **Makine doğrulaması şart:** üretici, özgün dökümdeki tüm dizeleri ve kimlikleri toplayıp fikstür metninde alt dize olarak arar;
   biri kalırsa **fırlatır**. Üretici tek kullanımlıktır ve depoya girmez (ham dökümün yolunu taşır).
5. Fikstür kendini ilan eder (`aciklama`: ARINDIRILMIŞ, GERÇEK DEĞER YOK; anahtar BİLEREK alt çizgisizdir: CI "Edge mangle-guard" `supabase/functions/**/*.ts` altında `{ _x:` ile başlayan nesne anahtarını bozulma sayar) ve kendi testi sızıntıyı yakalar (alan adı, `@`, `example.*`
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
| `ci` işi (Install'dan **önce**, bağımlılıksız) | izlenen **ağaç**; tam geçmiş varsa ve HEAD bir **birleşme commit'iyse** PR'ın **ara commit'leri** (`rev-list --objects HEAD --not HEAD^1`) — **olaydan bağımsız** (D4: `pull_request` da `workflow_dispatch` de; önceki sürüm yalnız `pull_request`te tarıyordu) | çıkış ≠ 0 → PR kırmızı. ⚠Önceki adım kırmızıysa bu adım koşmaz ("her koşuda" iddiası yoktur). Ara commit taraması `fetch-depth: 0` ister: Checkout girdilerinin TAM sabitlemesi `ci-edited-ayna.test.ts`'tedir (kapı testi yalnız bağımlılığı ve o testin varlığını doğrular, tekrar etmez). Atlanırsa çıktı **söyler** (`Not: ara commit taraması atlandı`) ve Actions'ta `pull_request`/`workflow_dispatch` olayında ek açıklama (`::warning`) basar |
| `.githooks/pre-push` | itilecek **tüm nesneler**, sonradan silinenler dahil (`rev-list --objects <uç> --not --remotes`; yollar commit başına `diff-tree -r` ile toplanır: aynı içerik her yoluyla ölçülür, D2; `cat-file --batch`) | çıkış 1 → push **ENGELLENİR**; çıkış 2 (ölçülemedi) → push **YİNE ENGELLENİR** (Y1; önceki sürüm uyarıp izin veriyordu: ağa çıkış geri alınamaz). Bilinçli geçiş: `VH_DOKUM_OLCULEMEDI_IZIN=1 git push` (uyarı yine basılır). `node` PATH'te yoksa sessiz geçmez: yüksek sesle uyarır ve geçirir |

Tavanlar (nesne sayısı, okunacak bayt, 64 MB dosya) aşılırsa sığanlar taranır, sığmayanlar "ölçülemedi" listelenir (çıkış 2; taramanın tamamı iptal edilmez). Elle: `--yeni-nesneler <uç> [--haric <ref>]`, `--pre-push`, `--kok <dizin>`.

**Geçiş sınırı (D5) — kanca DALA bağlıdır.** `scripts/setup-hooks.mjs` bir `core.hooksPath` değil, her worktree'nin KENDİ `.githooks/pre-push`
dosyasına bakan ince bir shim kurar (depo-geneli ayar, kancası olmayan dalları sessizce kapatıyordu; `.githooks/README.md`). Sonuç: bu iş
master'a girmeden ya da master'dan **rebase edilmeden** ALT-39 ÖNCESİ bir daldan (ya da o daldan açılmış bir worktree'den) itilen her
push'ta kapı **hiç koşmaz ve uyarı da çıkmaz** — shim dosyayı bulamayınca sessizce `exit 0` der. Önlem kod değil süreçtir: açık dallar
master'a rebase/merge edilir (kanca dosyası dalla birlikte gelir); bir push'un kapıdan geçtiği, çıktısındaki `Depo döküm kapısı (itilecek
nesneler)` özet satırından okunur — o satır yoksa kapı koşmamıştır.
`INV-DEPO-DOKUM-1` kolları: kural kolları (KIRMIZI/TEMİZ, çıktıda değer yok), gerçek ağaç taraması ve boş evren kanaryası, **yeni nesneler**
(sonradan silinen dosya, PR ara commit'i, pre-push stdin'i, tavan = kısmi tarama, aynı içeriğin iki yolu), **pre-push kancası** (gerçek `sh` ile
çıkış 0/1/2, çıkış 2'de ENGEL ve `VH_DOKUM_OLCULEMEDI_IZIN=1` kaçışı, `node` yok kolu), şema tabanını TARAYAN kapsam kolları, uzun girdide zaman sınırı (kübik/karesel desen),
CI bağlama (adım var, Install'dan önce; `if:`, `continue-on-error`, `working-directory:`, bash dışı `shell:`, adım `env:`, başka adımın
kapı betiğine dokunması yasak), `.gitignore` kalıpları (`**/db-backup*`, `*.dump*`, `*.sql.gz`, `*.backup`, `*.pgdump`), izin listesi sınırı.
**CODEOWNERS** (kapı betiği, iş akışları ve conformance testleri için zorunlu sahip onayı) bu işte YOK: kapıyla testi birlikte gevşeten bir
PR'ı yalnız kod incelemesi yakalar; öneri OPS'a.

## 8. Bilinen sınırlar ve KAPSAM DIŞI (insan incelemesi)

Kapının **görmediği** biçimler (kasıtlı ya da maliyeti yüksek; yeşil çıktı bunların yokluğunu kanıtlamaz):

- Sütun/satır biçimli JSON (pandas `orient=split/values`), SKU anahtarlı fiyat haritası (`{"SKU":{"price":…}}`).
- Uzantı değiştirme (`.bak`, `.md`, `.yaml`, `.txt` içine yapıştırma), base64, dosyayı parçalara bölme.
- Değer deseni (e-posta/telefon/kart numarası) **aranmaz**; yalnız alan-adı imzası ve kart parçası çifti vardır.
- Şema tabanında olup sözlük dışı bırakılan **aşırı genel** adlar: `name`, `company`, `company_name`, `city`, `district`; ayrıca kişisel
  olmayan kalıp eşleşmeleri (`address_type` etiketi vb.). Tam liste ve gerekçeler testtedir (`BILEREK_DISARIDA`): liste tabanı tarayarak üretilir.
- Genel sınıfta **URL/yol değeri** (`/…`, `http(s)://…`) kişisel sayılmaz (ölçülmüş yanlış alarm: `adres_tr`, `adres matrisi`); belirgin adlarda bu istisna YOK.
- `authCode`, `token`, `signature` **tek başına aranmaz** (tasarım belirteci vb. yanlış alarm; arındırılmış fikstür bunları sahte değerle taşır).
  Ödeme yanıtı dökümünü R5 (BIN + son dört) yakalar.
- Yeni bir kişisel kolon eklenince: adı tolerans köklerinden birini içeriyorsa kapı görür; içermiyorsa şema tabanını TARAYAN test (adı kişisel
  kalıba uyan kolon + kişisel kolonlu tablo) kırmızıya döner ve kök eklenir ya da kolon adıyla, gerekçeyle "bilerek dışarıda" listesine yazılır.
  (Eski sürümde bu cümle "test tabanı okuyarak doğruluyor" diyordu ama test elle yazılmış 6 tabloluk listeyi doğruluyordu: iddia artık gerçektir.)
- **3. tur güvenlik incelemesinin AYRI KAYITTA bırakılan bulguları** (numarayı OPS verir; bu işte YOK):
  **N4** CSV/TSV'de yalnız 1. satır başlık sayılır: 1. satırı rapor başlığı ya da Excel `sep=;` olan müşteri CSV'sinde gerçek başlık gövdeye düşer
  ve R1/R3/R5 kör kalır (öneri: ilk birkaç satırda kişisel başlık ara; 1. satırın hücre sayısı gövdeden farklıysa "ölçülemedi").
  **N7** itme kipi `--not --remotes` ile TÜM uzak izleme reflerini dışlar ve kanca hedef uzağı kapıya iletmez: döküm dalı önce ikinci bir
  (özel/yedek) uzağa itilmişse herkese açık uzağa itilirken nesneleri taranmaz (öneri: kancadan uzak adını geçir, `--not --remotes=<uzak>`).
- Ek bilinen sınırlar: **XML hiç taranmaz** (UBL-TR e-fatura: alıcı VKN/TCKN, ad, adres; e-fatura işinden önce eklenmeli); `INSERT … SELECT … UNION ALL`
  çok satırlı tohumda satır sayısı alt sınırdır (1: genel alan eşiği ≥3 satır sayılmaz, hassas tabloda eşik 1 olduğu için etkilenmez); `$$`/`DO`
  gövdeleri masum sayılır (uygulanmış migration'larda e-posta literal'i olabilir, kapı tasarım gereği görmez). Çözümlenmeyen SQL biçimleri
  (3. tur sonrası kendi taramamız): veri DEĞİŞTİREN CTE (`WITH ins AS (INSERT … RETURNING …) SELECT …`: ana ifade SELECT olduğu için CTE
  içindeki INSERT görülmez) ve parantezli SELECT (`INSERT INTO t (a) (SELECT 'x')`).
