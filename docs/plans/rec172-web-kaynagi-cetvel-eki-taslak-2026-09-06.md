# TASLAK — `catalog-ingestion-standard.md` için "Web Kaynağı" Eki (REC-172 Faz 2)

> **Durum: TASLAK.** Bu belge kesin hüküm değildir; Katalog şeridi inceleyecek, cetvele
> girecek biçimini KATALOG belirler. Buradaki her madde HAZIRLIK ajanının 2026-09-06
> ölçümlerine (Supabase + ingestor dizini) dayanır; varsayım değil.
>
> **Bağlam:** REC-172 Faz 2 — 8 ailede (118 ürün: nicotra-gebhardt-{adh,at,dd,rdh},
> danfoss-fc51, seat-serisi, storm-serisi, jet-serisi) teknik özellik boşluğu marka
> web sitesi / üretici PDF'inden **kanıtlı** doldurulacak. Bu ek, o kanıt zincirinin
> KURALLARINI yazar — tek bir değeri yazmaz.
>
> **KAYNAK/CETVEL bloğu:** yöneten mevcut cetvel `docs/standards/catalog-ingestion-standard.md`
> §6.3 (KAYNAK DİZİNİ, REC-163, 2026-09-06) + `docs/standards/product-schema-standard.md`
> §11.6-11.7 (birim/semantik sözleşmesi, T140-VH, 2026-08-21). Bu taslak §6.3'ün YANINA,
> "web kaynağı" alt maddesi olarak eklenmek üzere yazıldı; §6.3'ün PDF-dizin kuralını
> İPTAL ETMEZ, genişletir (web kaynağı da nihayetinde 01-input/'a inen bir dosyadır).

---

## 1. Hangi site türü KAYNAK sayılır

| Sınıf | Sayılır mı | Örnek | Gerekçe |
|---|---|---|---|
| **Üretici resmi sitesi** (ürün sayfası, kendi PDF'i) | ✅ Birincil kaynak | `nicotra-gebhardt.com`, `danfoss.com`, `seat-ventilation.com` | Değer üreticinin kendi beyanı |
| **Üretici resmi belge deposu** (assets.*, store.*) | ✅ Birincil kaynak | `assets.danfoss.com/documents/...`, `store.danfoss.com/.../p/<kod>` | Aynı hukuki/ticari kimlik, farklı alt alan adı |
| **Dağıtıcı/bayi sitesi PDF kopyası (ayna)** | ⚠️ İKİNCİL — yalnız birincil yoksa veya çapraz doğrulama için | `fantechtrade.com.au`, `baltspektr.lv`, `afi-systems.com`, `desteknoloji.com.tr` | Belge üreticinin kendi belgesinin KOPYASI; içindeki belge numarası/sürümü esas alınır, aynayı barındıran site değil |
| **Üçüncü taraf ürün föyü (üretici belgesi değil, bayinin kendi yazdığı)** | ⚠️ İKİNCİL — GÜÇLÜ değil, notla işaretlenir | `chemicalexhaustfans.com.au` JET-XX-Specifications.pdf | Format bayiye ait olabilir; sayı+birim yan yana varsa yine GÜÇLÜ sayılır ama kaynak satırında "üçüncü taraf" ibaresi ZORUNLU |
| **Giriş/üyelik gerektiren sayfa** | ❌ Atlanır | — | Erişim ölçülemez, tekrar üretilemez |
| **Marka KİMLİĞİ şüpheli sayfa** (ör. "Plastec" adının SEAT ile aynı üretici olup olmadığı doğrulanmamış) | ❌ Değer ÇEKİLMEZ, yalnız "marka uyuşmuyor" notu | `hvacdirect.com/.../Plastec-JET-Series-IOM.pdf` | Yanlış markaya değer yazmak, kaynaksız boşluktan daha tehlikeli (kanıtlıymış gibi görünür) |
| **Yalnız fiyat listesi (spec taşımıyor)** | ❌ Kaynak değil | mevcut AVenS fiyat listesi | Zaten `SADECE_FIYAT_LISTESI` sınıfı olarak ölçüldü (bkz. teknik-bosluk raporu) |

**Kural:** birincil kaynak varken ikincil kaynaktan değer çekilmez; ikincil kaynak yalnız
(a) birincil kaynakta o alan yoksa veya (b) birden fazla sürüm arasında çapraz kontrol
için kullanılır. Kullanıldığında kaynak satırında **hem ayna URL'si hem üreticinin
belge numarası/sürümü** birlikte yazılır (ikisi ayrı bilgi, biri diğerinin yerine geçmez).

## 2. Alıntı ZORUNLULUĞU (uydurma-sıfır kapısı)

Her yazılacak değer için **üç şey birlikte** bulunmalıdır — üçünden biri eksikse satır
STAGING CSV'ye YAZILMAZ:

1. **Yerel kaynak dosyası + sayfa numarası** (PDF ise) veya **HTML bölüm/etiket** (web sayfası ise) — `venthub/markalar/<marka>/<aile>/01-input/<dosya>` yoluna göre.
2. **Kaynak URL'si** (indirildiği adres, KAYNAKLAR.md'deki satırla aynı).
3. **Birebir alıntı** — kaynaktaki cümle veya tablo hücresi, değiştirilmeden.

Alıntısı olmayan değer **satır olmaz**. Bu, "güven zayıf ama satırı yine de yaz" seçeneğini
KAPATIR — zayıf güven satırı silmez, ama alıntısız satır hiç var olmaz.

## 3. Güven sınıfı — TEK ölçüt, tek anlam

> Cetvel notu (emirden): *"Güven bir ölçü değil, model kanısıdır — GÜÇLÜ/ZAYIF etiketi
> yalnız 'sayı+birim yan yana bulundu mu' ölçümünü anlatır, başka anlam yüklenmez."*

| Sınıf | Ölçüt | Örnek |
|---|---|---|
| **GÜÇLÜ** | Sayı ve birim kaynakta YAN YANA (aynı hücre/cümle) | "Ses seviyesi: 68 dB(A) @ 3m" |
| **ZAYIF** | Sayı ve birim AYRI AYRI bulunuyor (birim başlıkta, değer ayrı hücrede — çıkarım gerekiyor) | Tablo başlığı "dB(A)", hücre yalnız "68" |

Başka bir güven boyutu (kaynağın güvenilirliği, sitenin resmi olup olmaması) bu etikete
KARIŞTIRILMAZ — o zaten §1'deki kaynak sınıfıyla ayrı ayrı kayıtlıdır.

## 4. EN → TR alan/birim eşlemesi

Eşleme **yalnızca** `rec172-alan-sozlugu-2026-09-06.json` (bu görevin çıktısı,
`product-schema-standard.md` §11.6-11.7'den türetildi) üzerinden yapılır. Özet kurallar:

- Alan adı SI birim soneki taşıyorsa (`_w,_v,_a,_hz,_pa,_kg,_mm,_m3h,_ls`) değer o birimde
  ve **sayı** olarak yazılır; kaynakta kW/lb/inch varsa çevrilir, orijinal değer "not"a girer.
- `max_/min_/nominal_` ayrımı ZORUNLU — nominal çalışma noktasını `max_` alanına yazmak
  YASAK (semantik hata, cetvel §11.7).
- Ses ölçütü ADA girer: yeni yazımlarda `noise_lpa_3m_db`; ölçüt (LpA/LwA) ve mesafe
  belirsizse alan **legacy** `noise_level_db_a`'ya not düşülerek yazılır, karışık kullanılmaz.
- Gerilim tek alan tek bilgi taşır: çift gerilim (400/690) `voltage_v` + `voltage_alt_v` +
  `wiring` üçlüsüne bölünür; faz ayrı `phase` alanındadır.
- Cetvelde adı OLMAYAN bir büyüklük (ör. `impeller_type`, `duty_class`, `cos_phi`) bulunursa
  alan adı İCAT EDİLMEZ — "not" alanına serbest metin olarak yazılır ve rapor sonunda
  "yeni alan önerisi" listesine eklenir; Katalog karar verir.

## 5. Model kodu eşleme kuralı

- `products.sku` / `products.model_code` kaynaktaki üretici kodu ile **birebir** eşleşmelidir.
- Farklıysa (biçim farkı, ek haneler, farklı numaralandırma şeması) eşleme GEÇERLİ SAYILABİLİR
  ama gerekçesi satırın "not" alanına yazılır.
- **FC-51/FC-101/FC-102 dersi (ölçülmüş, bu görevin bağlamı):** benzer isimli ürün ailesi
  ≠ aynı seri. Danfoss'ta FC-51 (VLT Micro Drive), FC-101 (HVAC Basic) ve FC-102 (HVAC Drive,
  355-800 kW) tamamen farklı ürün hatlarıdır; sırf "Danfoss + frekans konvertörü" eşleşmesiyle
  değer taşınmaz. Aynı ders SEAT/JET/Plastec için de geçerli — isim benzerliği kimlik kanıtı
  DEĞİLDİR, kapaktan/gövdeden okunan üretici adı kanıttır.
- Ürün adında zaten motor kodu görünen aileler (ör. Nicotra DD: "735W 1F 6P 3V - 6N06HX")
  bu kod bir **ipucudur**, kanıt değildir — kaynak PDF'teki motor tablosuyla doğrulanmadan
  bu kodlardan alan türetilmez.

## 6. Staging CSV sütun şeması (öneri)

| Sütun | Açıklama | Zorunlu mu |
|---|---|---|
| `family_slug` | hedef aile (ör. `nicotra-gebhardt-adh`) | ✅ |
| `sku` | `products.sku`, DB'deki mevcut değerle birebir | ✅ |
| `model_code` | `products.model_code` | ✅ |
| `field_name` | kanonik alan adı (alan sözlüğünden) | ✅ |
| `value` | sayısal veya serbest metin değer, nokta ondalık | ✅ |
| `unit` | alan adının taahhüt ettiği birim (doğrulama amaçlı, ayrıca yazılır) | ✅ |
| `confidence` | `GUCLU` \| `ZAYIF` (bkz. §3) | ✅ |
| `source_local_path` | `venthub/markalar/<marka>/<aile>/01-input/<dosya>` | ✅ |
| `source_url` | orijinal indirme URL'si | ✅ |
| `source_page` | PDF sayfa no veya HTML bölüm/etiket | ✅ |
| `quote` | birebir alıntı (kaynaktan kopya-yapıştır) | ✅ |
| `source_type` | `uretici_resmi` \| `uretici_belge_deposu` \| `bayi_aynasi` \| `ucuncu_taraf_foy` | ✅ |
| `note` | birim çevrimi, model kodu eşleme gerekçesi, belirsizlik, yeni-alan önerisi vb. | serbest, boş olabilir |
| `notebooklm_source_id` | defterdeki kaynak başlığı (doğrulama ajanı için) | eklendiyse |

## 7. Canlıya yazım kapısı

- Bu görev (HAZIRLIK + çıkarım ajanları) **hiçbir şeyi canlı veritabanına yazmaz.**
  Supabase erişimi SALT SELECT'tir (execute_sql, okuma amaçlı).
- Staging CSV → canlıya geçiş **Katalog şeridinin** ve **Recep'in** onayından geçer;
  bu taslak o geçişin şeklini ÖNERİR, YETKİLENDİRMEZ:
  1. Katalog şeridi staging CSV'yi `catalog-ingestion-standard.md` §6 kapılarından
     (INV-CATALOG-1, INV-CATALOG-2, kaynak dizini determinizmi) geçirir.
  2. `ZAYIF` güvenli satırlar ayrı işaretlenir; Recep bunları gözden geçirmeden
     canlıya girmez (öneri — kesin karar Katalog+Recep'e ait).
  3. Kaynak dizinine (`kaynak-dizini/`) taşıma yalnız Katalog'un faz 4 işidir; bu görev
     oraya dokunmaz (çakışma sınırı, bu görevin emrinde açıkça yazılı).

## 8. Bu taslağın KAPATMADIĞI sorular (Katalog kararına bırakılır)

- `noise_lpa_3m_db` dışında farklı ölçüm mesafesi (ör. 1m) gerekiyorsa yeni alan adı mı
  açılır yoksa `note`'ta mı kalır — cetvel sahibi karar verir.
- Üçüncü taraf föyünden (`chemicalexhaustfans.com.au` gibi) gelen GÜÇLÜ-etiketli değerin
  üretici resmi kaynağıyla aynı ağırlıkta mı sayılacağı, yoksa ayrı bir "ikincil-güçlü"
  alt sınıfı mı açılacağı.
- ZAYIF güven satırlarının staging'de mi kalacağı yoksa hiç mi yazılmayacağı (bu taslak
  "yaz ama işaretle" öneriyor, cetvel farklı karar verebilir).

---

**Sahiplik:** Bu taslağı KATALOG şeridi inceler ve `catalog-ingestion-standard.md`'ye
işler (ya da reddeder/değiştirir). HAZIRLIK ajanı burada bir hüküm YAZMAMIŞTIR — yalnız
2026-09-06 ölçümlerinden (Supabase 118 ürün, ingestor dizini, product-schema-standard.md)
çıkan gözlemleri ve bir öneri taslağını kayıt altına almıştır.
