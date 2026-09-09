# Kategori Adlandırma Cetveli — hangi alan NEREDE kazanır

> **SSOT.** Bir kategorinin adı dört ayrı yerde yazılabilir (`translation_key` → sözlük ·
> `menu_label` · `marketing_title` · `name`). Bu cetvel **hangisinin hangi yüzeyde
> kazandığını** sabitler. Çelişirse kod kazanır; burada niçin/nasıl duruyor.
>
> v1.0 · 2026-09-08 (REC-286 penceresi, OPS emri) · ölçüm tarihi 2026-09-08, canlı DB + kod.
> İlgili: `category-taxonomy-standard.md` §4 (adres/slug dili) · CLAUDE.md kural 7.

---

## 0. Bu cetvel niçin yazıldı

Recep bir kategori adına bakıp *"bizde şu şekilde olması gerekir ama başka görünüyor"* dedi.
Cevabı vermek için önce şunu bilmek gerekiyordu: **o ad hangi kolondan geliyor.** Cevap
belgelenmemişti; dört aday vardı ve hangisinin kazandığı yalnız koddan okunabiliyordu.
Ölçünce, sorunun sanıldığından büyük olduğu çıktı — aşağıdaki §3.

## 1. Ölçülmüş gerçek — ad, TEK zincirden geliyor

Müşteriye görünen her kategori adı `getCategoryDisplayName(category, t)` üzerinden çözülür
([categoryHelpers.ts](../../src/utils/categoryHelpers.ts)) ve zincir şudur:

| sıra | kaynak | koşul |
|---|---|---|
| 1 | **sözlük** — `common.categoryList.<translation_key \|\| slug>` | `t` verilmişse **ve** anahtar sözlükte varsa |
| 2 | `menu_label` | sözlük çözemezse |
| 3 | `name` | ikisi de yoksa |

**`t` opsiyoneldir ve bu bir tuzaktır:** `t` verilmeden çağrılırsa 1. adım hiç çalışmaz ve
İngilizce sayfada Türkçe ad basılır. Bu tuzak bir kez canlıda gerçekleşti (REC-103) ve
bugün `INV-KATEGORI-ADI-1` kapısının bir kolu tam olarak bunu ölçüyor.

### Yüzey haritası (ölçüldü, 2026-09-08)

| yüzey | ne basıyor | kaynak |
|---|---|---|
| mega menü, mobil menü, kategori kartları, orbital karusel | `vm.displayName` | `useCategoryViewModel` → `getCategoryDisplayName` |
| kategori sayfası `h1` ve `<title>`/`description` | `displayName` | `page.tsx` → `getCategoryDisplayName` |
| kırıntı menüsü (breadcrumb) | `displayName` | `breadcrumbUtils` |
| JSON-LD `name` | `displayName` | `page.tsx` |

**Tek zincir, tek kural.** Kopyalamak da ihlaldir: aynı zincir bir kez elle ikinci kez
yazılmıştı (`useCategoryViewModel`, REC-103) ve düzeltme yalnız bir kolda uygulanınca
diğeri sessizce eski davranışta kalmıştı.

## 2. Kural

1. **Kategori adı DAİMA `getCategoryDisplayName(category, t)`.** Ham `name`, ham `slug`,
   ham `menu_label` render **yasak** (CLAUDE.md kural 7).
2. **`t` her çağrıda verilir.** Sözlüksüz çağrı = İngilizce sayfada Türkçe ad.
3. **Zincir kopyalanmaz.** Yeni bir yüzey aynı sırayı elle yazacaksa, yazmaz — çözücüyü çağırır.
4. **Yeni kategorinin `translation_key`'i iki sözlüğe de eklenir** (TR ve EN), aksi hâlde
   kategori sessizce 2. adıma düşer ve İngilizce sayfada Türkçe görünür.

## 3. ⚠ÖLÇÜM: dört alanın İKİSİ fiilen ÖLÜ

Bu, cetvel yazarken çıkan ve rapor edilmesi gereken bulgudur. Sayılar canlı DB'den
(2026-09-08, `is_active = true`) ve koddan:

| alan | DB'de dolu | müşteriye görünüyor mu | ölçüm |
|---|---|---|---|
| `translation_key` | **23 / 23** | ✔ evet, daima kazanıyor | sözlükte 23/23 karşılığı var |
| `menu_label` | **20 / 23** | ✘ **hayır** | sözlük 23/23 çözdüğü için 2. adıma hiç düşülmüyor |
| `marketing_title` | **12 / 23** | ✘ **hayır** | aşağıya bak |
| `name` | 23 / 23 | ✘ hayır (son çare) | 1. adım daima çözüyor |

### `marketing_title` — yazılıyor, hiçbir yerde gösterilmiyor

- `getCategoryMarketingTitle()` tanımlı ve doğru yazılmış — **ürün kodunda çağıranı YOK** (0).
- `useCategoryViewModel` `marketingTitle` alanını üretiyor — **tüketen bileşen YOK**
  (üç geçiş de hook'un kendi içinde: tip tanımı, atama, dönüş).
- Yani **12 kategoriye yazılmış pazarlama başlığı hiçbir yüzeyde görünmüyor.**

Bu, "veri değişti, sayfa değişmedi" sınıfının ta kendisidir — CLAUDE.md kural 1'in doğuş
gerekçesi (1044 fiyat satırı prod'a yazıldı, vitrin değişmedi). Burada zarar daha küçük
ama şekil aynı: bir alanın var olması, gösterildiğini kanıtlamaz.

### `menu_label` — dolu ama okunmuyor

20 satırda değer var; sözlük 23/23 çözdüğü için 2. adıma hiç düşülmüyor. Bugün zararsız,
ama **sessiz bir yedek** olarak duruyor: sözlükten bir anahtar düşerse devreye girer ve
Türkçe basar. Yani bugün ölü, arıza günü konuşan bir alan.

## 4. KARAR VERİLDİ — `marketing_title` EMEKLİ (Recep, 2026-09-09)

İki yol sunulmuştu: **(a)** kategori `h1`'ine bağlamak, **(b)** emekli etmek.
**Seçilen: (b) — emekli.** Alan hiçbir yüzeye **bağlanmayacak.**

**Emekliliğin sınırı, adıyla:**

- **Kolon SİLİNMEZ.** `categories.marketing_title` DB'de kalır ve 12 satırdaki metin durur.
  Sebep: veri silmek geri dönüşsüzdür ve bu karar bir içerik kararıdır, bir temizlik değil;
  yarın "aslında kullanalım" denirse metin yerinde olmalı.
- **ÖLÜ ÇÖZÜCÜ KALDIRILIR.** `getCategoryMarketingTitle()` ve `useCategoryViewModel`'in
  `marketingTitle` alanı silinir — ikisinin de tüketicisi yoktu (ölçüldü: ürün kodunda 0 çağıran).
  Bir alanı "emekli" ilan edip çözücüsünü bırakmak, bir sonraki geliştiriciye "bu kullanılıyor
  olmalı" dedirtir.
- **SELECT listelerinden ÇIKARILMAZ.** Kolon hâlâ okunuyor ve tipte duruyor; çıkarmak
  `DbCategory` sözleşmesini bozardı ve emekliliğin gereği değil.
- **⭐KAPI: hiçbir RENDER yolu bu alanı okuyamaz.** `INV-KATEGORI-MARKETING-EMEKLI-1`
  (`kategori-adi-marketing-emekli.test.ts`) bunu çiviler. Emeklilik bir niyet değil, ölçülen
  bir hâl olmalı — aksi hâlde altı ay sonra biri `h1`'e bağlar ve karar sessizce çürür.

**Niçin bu karar doğru (ve niçin kayda geçiyor):** alan 12 kategoride doluydu, yani birileri
onu doldurmak için emek harcamıştı — ama hiçbir yüzeyde görünmüyordu. Bağlamak, bugün tek
zincirden gelen kategori adını **iki başlı** hâle getirirdi (menüde kısa ad, sayfada uzun
pazarlama başlığı) ve §2'nin kuralını zayıflatırdı. Emeklilik, ölü veriyi ölü ilan eder;
yarı bağlı bir alan ise iki yüzeyde iki farklı ad demekti.

## 5. Değiştirme kuralı

- Zincirin sırası değişecekse **önce `INV-KATEGORI-ADI-1` değişir** ve sabotajla doğrulanır
  (kuralı bozan kod kapıyı KIRMIZI yapmalı).
- Yeni bir ad alanı eklenecekse, **aynı commit'te bir tüketici yüzeye bağlanır.** Bağlanmayan
  alan eklenmez: `marketing_title` bu kuralın yokluğunda doğdu ve bugün 12 satır ölü veri.
- Sözlüğe yeni `translation_key` eklendiğinde `kategori-adi-tek-kaynak.test.ts` içindeki
  dondurulmuş liste de güncellenir (o kapının sınırı kendi dosyasında yazılı: liste DB'den
  okunmaz, ayrışmayı ölçmez).
