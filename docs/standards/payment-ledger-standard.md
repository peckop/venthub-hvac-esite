# Ödeme Defteri Cetveli (`payment_transactions`)

> **Durum:** v1.0 · 2026-08-23 · Şerit: PRICING-STOK
> **Niçin var:** T116'da ölçüldü ki `payment_transactions` şeması **var** ama hiçbir şey ona
> **yazmıyor**, ve defter sözlüğü **iadeyi temsil edemiyor** — oysa iade akışı canlı.
> Eksik olan kod değil, **defterin ne olduğunu söyleyen kural**. Bu dosya onu yazar.
> **Eksen kararı Recep'indir** (2026-08-23): defter **PSP olay ekseninde** tutulur.

## KAYNAK / CETVEL

| | |
|---|---|
| **Komşu cetveller** | `checkout-payment-standard.md` (ödeme **yüzeyi** — defteri kapsamıyor, ölçüldü: dosyada `payment_transactions` hiç geçmiyor) · `pricing-standard.md §4.1` (çoklu-para satış sözleşmesi) |
| **Ölçüm kaydı** | `docs/plans/t116-odeme-defteri-tasarim-2026-08-20.md` (#709, canlıda) |
| **Karar** | Recep, 2026-08-23 17:58 — OPS-AUDIT üzerinden iletildi. Dört kalem: eksen · para birimi şeması · silme davranışı · migration onayı |
| **Bu cetvelin kapsamadığı** | Ödeme **yüzeyi** (→ checkout-payment) · fiyat **hesabı** (→ pricing) · iade **iş akışı** (→ returns/refund cetveli) |

## 1. Defter nedir, ne değildir

**Defter, sağlayıcının (PSP) ne dediğinin değişmez kaydıdır.** Sipariş durumu bu kayıttan
**türetilir**; tersi değil.

| | Defter (`payment_transactions`) | Sipariş (`venthub_orders.payment_status`) |
|---|---|---|
| Ne tutar | **Olay** — PSP ne dedi, ne zaman dedi | **Özet** — paranın bugünkü durumu |
| Kaç satır | Ödeme başına **çok** satır | Sipariş başına **tek** alan |
| Değişir mi | **Hayır** — yeni olay eklenir | Evet — son olaydan türetilir |
| Otorite | **Evet**, para hareketi için | Hayır, türetilmiş görünüm |

Bu ayrım, `siparis-durumu ≠ odeme-durumu` ayrımının bir katman aşağısıdır: orada *sipariş
durumu ≠ ödeme durumu* vardı; burada **ödeme durumu ≠ ödeme OLAYI** ayrımı yapılır.

⚠ **"Başarı" bir yorumdur, "tahsil edildi" bir olgudur.** Mevcut sözlükteki `success` bu yüzden
terk edilir: İyzico akışında **otorizasyon** ve **tahsilat** ayrı adımlardır ve tek bir `success`
ikisini birbirine karıştırır — mutabakat o noktada imkânsızlaşır.

## 2. Defter sözlüğü (PSP olay ekseni) ve siparişe eşlemesi

| Defter olayı | Anlamı | Siparişe etkisi (`payment_status`) |
|---|---|---|
| `authorized` | Tutar bloke edildi, **tahsil edilmedi** | değişmez (`pending`) |
| `captured` | **Tahsil edildi** | → `paid` |
| `failed` | PSP reddetti | → `failed` |
| `voided` | Otorizasyon iptal, tahsilat **yok** | → `failed` |
| `refunded` | **Tam** iade | → `refunded` |
| `partial_refunded` | **Kısmi** iade | → `partial_refunded` |

**Eşleme tek yönlüdür:** defterden siparişe. Sipariş durumunu elle yazan hiçbir yol, defterde
karşılığı olan bir olay üretmeden `paid`/`refunded` yazamaz.

⚠ **Bu kural bugün SAĞLANMIYOR ve bunu ölçtüm.** Canlıda `trg_sync_payment_status_ins/upd`
tetikleyicisi var: `status = 'confirmed'` olduğunda ve `payment_status` boş/`pending` ise
`payment_status := 'paid'` yazıyor. Yani **ikinci bir otorite** var — sipariş yaşam döngüsü —
ve defterden haberi yok. Tetikleyici kötü niyetli değil: dolu bir değeri **asla ezmiyor**
(T114-VH'de kısmi iadeyi yutan kusur tam buydu). Ama "sevkiyat onaylandı" ile "para tahsil
edildi" **aynı şey değildir**; birinden ötekini türetmek, defterin varlık sebebini ortadan
kaldırır. Karar ve sırası §6'da (adım 3): yazıcı inince bu tetikleyicinin **kapsamı daraltılır**
ya da kaldırılır — ikisi de migration, ikisi de Recep kapısı. Bu satır olmadan cetvel,
sağlanmayan bir şeyi sağlanmış gibi okuturdu.

### 2.1 Terk edilen sözlük ve karşılığı

Canlı CHECK kısıtı bugün `pending · success · failed · cancelled` diyor. Karşılıkları:

| Eski | Yeni | Not |
|---|---|---|
| `pending` | *(satır yok)* | Bekleyen bir olay, **olay değildir**. Defter yalnız **olmuş** şeyi yazar; beklemek siparişin durumudur |
| `success` | `captured` | Otorizasyon/tahsilat ayrımı için |
| `failed` | `failed` | aynı |
| `cancelled` | `voided` | PSP terimiyle hizalanır |
| — | `refunded`, `partial_refunded` | **eksikti**: iade akışı canlıyken defter iadeyi temsil edemiyordu |

## 3. Değişmezler

1. **Append-only.** Defter satırı **güncellenmez**; yeni olay yeni satırdır. Satır güncelleniyorsa
   o defter değil, durum tablosudur.
2. **Monotonluk.** `CLAUDE.md §11` sipariş/iade durumlarının yalnız ileri gitmesini şart koşar.
   Defter zaten geri gitmez — **eklenir**. Türetilen `payment_status` monotonluğu bozacaksa
   olay yine yazılır, **türetme reddedilir ve alarm üretir** (sessiz düşmez).
3. **Para birimi taşınır, türetilmez.** `currency` her satırda **açıkça yazılır**;
   `DEFAULT 'TRY'` **kaldırılır**. Gerekçe: varsayılan bir değer, çağıranın para birimini
   yazmayı unutmasını **sessiz** hâle getirir ve çoklu-para satış sözleşmesini bozar
   (T094'te aynı kusur arayüz katmanında yaşandı).
4. **Silinmez.** `order_id` FK'si **`ON DELETE RESTRICT`**tir. Sipariş silinince para hareketi
   kaydı **yok olmaz** — defterin varlık sebebi tam olarak "kayıt kalsın"dır.
5. **Tekil olay.** Aynı PSP olayı iki kez işlenirse **iki satır olmaz**: `transaction_id` UNIQUE
   kısıtı korunur ve yazıcı `ON CONFLICT DO NOTHING` ile idempotenttir. Webhook'lar tekrar
   gönderir; defter bunu tolere etmek zorundadır.

## 4. Yazıcı kim

**Bugün hiç kimse** — ölçüldü (2026-08-23, canlı): `payment_transactions` **0 satır**,
`venthub_orders` 5 satır (hepsi `pending`), `order_refund_events` 0 satır. Kod tarafında
`payment_transactions` adı `supabase/functions/**` altında **hiç geçmiyor**.

> ⚠ **Ölçüm yöntemi adıyla:** bu sayılar ayrıcalıklı bağlantıdan alındı
> (`current_user=postgres`, `rolbypassrls=TRUE`). Yani "veri var mı" sorusunun cevabıdır;
> "bir kullanıcı bunu görebilir mi" sorusunun **değil**.

Cetvel, yazıcıyı **ada bağlar**: ödeme sonucunu PSP'den ilk öğrenen uç, defteri yazmakla
yükümlüdür (`iyzico-callback` ve iade tarafında `iyzico-refund`). "Sonra bir yerden yazarız"
kabul edilmez — defteri yazmayan bir ödeme yolu, parayı **kanıtsız** hareket ettiriyor demektir.

**Geriye dönük doldurma YOK.** Mevcut 5 siparişin PSP yanıtları elde değil (Edge logları 24
saatlik pencereyi aştı). Uydurma kayıt, defterin amacını baştan bozar.

## 5. Kapı — ve niçin bu PR'da değil

Bir cetvel, onu zorlayan bir test olmadan **yalnız metindir**. Bu cetvelin kapısı
`INV-LEDGER-1` olacaktır: **§2'deki sözlük ile canlı CHECK kısıtı birebir aynı olmalı.**

Bu kapı **bilerek bu PR'da değil**, migration PR'ındadır. Gerekçe ölçülmüştür: canlı kısıt
bugün hâlâ eski sözlüğü (`success`/`cancelled`) taşıyor. Kapıyı şimdi eklemek iki kötü
seçenekten birini üretirdi — ya **bilinçli kırmızı** (master'ı kırar), ya da kısıtı okumayan
**boş bir test** (yeşil ama hiçbir şey ölçmüyor). İkisi de kabul edilmez; kapı, zorladığı
gerçek aynı anda inmelidir.

## 6. Uygulama sırası (Recep kararı, OPS sıralaması)

> ⚠ **Bu bölüm 2026-08-23 akşamı ÖLÇÜMLE yeniden yazıldı.** İlk hâli "migration + yazıcı
> **aynı PR**'da insin" diyordu ve bu **yetmiyor** — gerekçesi hemen aşağıda. Cetvelin
> kendisiyle çelişmemesi için sıra iki adıma bölündü.

### 6.0 Neden aynı PR yetmiyor — ÖLÇÜLDÜ

`master`'a bir push, **iki ayrı iş akışını PARALEL** tetikler ve aralarında **sıra garantisi yoktur**:

| İş akışı | Neyi canlıya taşır | Tetikleyici |
|---|---|---|
| `supabase-migrate.yml` | DB şeması | `supabase/migrations/**.sql` yolu |
| `deploy-functions.yml` | Edge Function kodu | değişen fonksiyonlar |

Yani "aynı PR" yalnız **niyeti** birleştirir, **canlıya iniş ânını** birleştirmez. Arada bir
pencere vardır ve `venthub_orders.currency` için **iki yön de kırıyor**:

- **migration önce inerse** → eski fonksiyon `currency` göndermez → `NOT NULL` ihlali → sipariş oluşturma **500**.
- **fonksiyon önce inerse** → kolon henüz yoktur → PostgREST "column does not exist" → yine **500**.

Üçüncü ölçüm tuzağı kapatıyor: `iyzico-payment/index.ts`'te zaten bir şema-sapması yakalama kolu
**var** (satır ~502–520), ama regexi **yalnız** `shipping_method` ile eşleşiyor — `currency`
hatasında **devreye girmez**, sert 500 döner. Bu, kodun varlığına değil **regexin kapsamına**
bakılarak doğrulandı.

> **KURAL (bu cetvelin dışına da geçerlidir):** migration ile onu tüketen kod **aynı PR'da olsa
> bile**, şema değişikliği **yazıcıya geriye uyumlu** olmak zorundadır — *genişlet, sonra daralt*
> (expand-contract). "Aynı PR" bir dağıtım garantisi değildir.

### 6.1 Adımlar

1. **Bu cetvel** (docs, migration yok) — *inmiş durumda* (#795, merge `98bc08ba`).
2. **ADIM-1 — genişlet** (migration + yazıcı + kapı, tek PR, **merge = Recep**):
   - `venthub_orders.currency text NOT NULL **DEFAULT 'TRY'**` — varsayılan **bilerek** var:
     eski yazıcı da yeni yazıcı da çalışır, pencere kapanır.
   - `iyzico-payment` `orderData`'sı `currency`'yi **açıkça** gönderir.
   - Şema-sapması kolunun regexi `currency`'yi de kapsar (yalnız ADIM-1 penceresi için; ADIM-2'de kaldırılır).
   - **Sözlük CHECK genişletme** (§2) + **`CASCADE → RESTRICT`**. İkisi de burada, çünkü
     `payment_transactions` **0 satır** ve kod tabanında **hiç yazıcısı yok** (ölçüldü) —
     geriye uyumluluk sorunu üretmiyorlar.
   - **`INV-LEDGER-1` kapısı** burada iner: §5'in kuralı "kapı, zorladığı gerçek aynı anda
     inmelidir" der; sözlük kısıtı bu adımda indiği için kapısı da bu adımda olmalıdır.
     Kapı **statiktir**: §2 tablosu ile migration SQL'indeki CHECK listesi birebir eşitlenir
     (canlı DB'ye sormaz → CI'da deterministik).
3. **ADIM-2 — daralt** (ayrı PR, **merge = Recep**). Yalnızca ADIM-1'in **her iki tarafının da
   canlı olduğu ÖLÇÜLDÜKTEN** sonra:
   - `DEFAULT 'TRY'` düşürülür — `venthub_orders.currency`, `payment_transactions.currency`
     **ve** `venthub_order_items.display_currency` (sessiz varsayılan **üç** kolonda).
   - Şema-sapması kolunun `currency` dalı kaldırılır (geçici koltuk değneğiydi).
4. **Yazıcı**: `iyzico-callback` ve `iyzico-refund` defteri yazar; `payment_status` türetilir.
   **Aynı adımda** `trg_sync_payment_status_*` tetikleyicisinin kapsamı daraltılır ya da kaldırılır
   (§7 #8) — ikinci otorite ayakta kalırken defter otorite olamaz.

### 6.2 ADIM-2 ne zaman güvenli — KANIT TANIMI

"Bir süre geçti" kanıt değildir. ADIM-2 ancak şu **üçü birden** ölçüldüğünde açılır:

1. ADIM-1 merge commit'inde **`supabase-migrate.yml` ve `deploy-functions.yml` iş akışlarının
   İKİSİ de `success`** (biri `skipped` ise bu şart **sağlanmamıştır**).
2. **Canlı fonksiyon sürümü** ADIM-1'i içeriyor — prod'daki `iyzico-payment` sürüm numarası
   deploy sonrası **artmış** olmalı (repo ile prod sapma işi bunu zaten ölçüyor).
3. **Kolon canlıda var**: `venthub_orders.currency` DB'de sorgulanarak doğrulanır.

⚠ `venthub_order_items.display_currency` ve `payment_transactions.currency` bu üç şarta
**bağlı değildir** — orada varsayılanı düşürmek tek başına güvenlidir (ilkinde yazıcı zaten
`display_currency: 'TRY'` gönderiyor, satır 674; ikincisinde **yazıcı yok**). ADIM-2'de
birlikte inmelerinin tek sebebi, üç kolonun **aynı sınıf** olması ve tek yerde bitmesidir.

## 7. ÇELİŞEN-MEVCUT

| # | Çelişen şey | Nerede | Çözüm |
|---|---|---|---|
| 1 | `payment_transactions.status` CHECK'i `success`/`cancelled` diyor, §2 `captured`/`voided` diyor | Canlı kısıt | Migration (adım 2). O ana kadar **cetvel ile DB çelişir** ve bu bilerek yazılıdır |
| 2 | `currency DEFAULT 'TRY'` — **iki** kolonda | `payment_transactions.currency` (`text`), `venthub_order_items.display_currency` (`char(3)`) | Varsayılan kalkar. #709'da tek kolon sanılmıştı; ölçünce iki çıktı |
| 3 | `venthub_orders`'ta para birimi kolonu **YOK** | Canlı şema | Eklenir (adım 2). Bugün sipariş toplamının birimi **hiçbir yerde yazılı değil** — satır düzeyinde var, sipariş düzeyinde yok |
| 4 | `ON DELETE CASCADE` para hareketi kaydını siler | `payment_transactions_order_id_fkey` | `RESTRICT` |
| 5 | `updated_at` kolonu append-only ilkesine aykırı sinyal veriyor | Canlı şema | Kolon kalacaksa **gerekçesi yazılmalı**; defter satırı güncellenmez |
| 6 | `admin-iyzico-reconcile` mutabakatı **türetilmiş özete** karşı yapıyor | Edge fonksiyonu | Defter dolunca asıl kaynak defter olmalı |
| 7 | `checkout-payment-standard.md` ödeme cetveli sayılıyor ama defteri kapsamıyor | Komşu cetvel | Bu dosya o boşluğu doldurur; komşuya çapraz atıf eklenmeli |
| 8 | ⭐ **İkinci otorite:** `trg_sync_payment_status_ins/upd` tetikleyicisi `status='confirmed'` görünce `payment_status='paid'` yazıyor — defterden bağımsız | Canlı tetikleyici (ölçüldü) | §2'nin "tek yönlü eşleme" kuralı bugün sağlanmıyor. Yazıcı inince kapsam daraltılır ya da kaldırılır → **migration, Recep kapısı**. Dolu değeri ezmediği için (T114) bugün **veri kaybı üretmiyor**; ürettiği şey **kanıtsız `paid`** |

## 8. Ölçülen, karara bağlanmamış

- **`order_id` NULLABLE.** Ön-otorizasyon ya da sipariş oluşmadan başlayan bir akış varsa
  nullable doğrudur; yoksa yetim satır riskidir. Defter **0 satır** olduğu için davranışsal
  kanıt yok. Kararı, yazıcı inerken **ödeme akışının gerçek sırası ölçülerek** verilecek:
  sipariş mi önce oluşuyor, ödeme kaydı mı?
