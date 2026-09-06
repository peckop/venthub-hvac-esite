
# Yasal set + föy gerçek veri — teslim notları

**Tur:** OPS emri `ops-emir-2026-09-06-2-belge.md` (153-12/13/14 hükümleri + yasal set)
**Teslim:** üç yasal belge · föy gerçek veriyle doldu · sku çıktı
**İmza:** — DESIGN-BELGE (Opus) 2026-09-06

---

## 1 · Föy: gerçek veri bağlandı (153-14)

`foy-veri-lineo-100-2026-09-06.json` föye taşındı, değerler değiştirilmedi. Birincil ürün **17160 Vortice Lineo 100 Quiet**; `urun` tweak'i 17143'e geçirir.

22 anahtarın **21'i çizilir**, `pq_curve` çizilmez (OPS: K20 ileride). Ölçüm:

| Ölçüm | 17160 |
|---|---|
| Çizilen alan | 21 |
| Grup dağılımı | performans 5 · elektriksel 8 · fiziksel 5 · diğer 3 |
| Sayfa | **1,46** |
| Taşan hücre | **0** (iki kipte de) |

Örnek satırlar: `Maksimum Debi (m³/h) · 260 m³/h` · `Ses Seviyesi · 26,1 dB(A)` · `Maksimum Statik Basınç · 147,1 Pa`.

**Etiketler i18n sözlüğünden**, uydurma değil: `src/i18n/dictionaries/tr.ts` → `pdp.specs.<anahtar>`. Çözüm zinciri `src/utils/specLabel.ts`'te yazılı (sözlük → `translateSpecKey` → `humanizeSpecKey`; ham anahtar yolu asla basılmaz). Önceki turda kullandığım anahtar listesi (`max_delivery_max_speed_m3h` gibi iki kademeli adlar) bu üründe **yok** — gerçek şema `max_delivery_m3h` kullanıyor; etiket, sıra ve grup tabloları yeniden yazıldı.

**Biçimleme `formatSpecValue` mantığıyla:** sayı → tr-TR ondalık + birim · boolean → Var/Yok · `phase: 1` → "Monofaze (1~)" · `motor_poles: 2` → "2 kutup" · metin (IP44, Class II, AC) aynen.

**`sku` çıktı (153-12).** Belge kimliği bloğu artık `model_code` + föy sürümü + veri kaynağı. Ölçüldü: belgede `VRT-` dizisi 0.

**Görsel yuvası boş** (OPS: dosyalar bana kapalı). Altyazı kaynağı söylüyor: "Görsel yuvası · product_images sort 0 · (3 görsel)".

**Uygulama alanları bölümü çizilmedi.** Bu iki üründe `description_i18n` tek cümlelik özet; onu kimlik şeridinde kullandım. Aynı cümleyi ikinci kez ayrı başlık altına yazmak K7'ye aykırı olurdu (dolu olmayan alanı doluymuş gibi göstermek). Ayrı bir "uygulama alanları" metni gelirse bölüm açılır.

**Düzeltilen iki kusur (ölçümle yakalandı):**
1. Aile adını JSON'dan alırken Türkçe karakterleri ASCII yazmışım (`Fanlari`); `text-transform:uppercase` bunu `FANLARİ` bastı. JSON'daki ad birebir geri kondu.
2. Grup başlıkları flex kabında daralıp iki satıra kırılıyor ve satırlar çakışıyordu (`Performans Ölçüleri`). `flex:none; line-height:1.25` ile düzeltildi.

## 2 · Yasal set — üç belge

Metin **hukuktan**, dizgi benden. Tek kelime yazmadım.

| Belge | Kaynak | Bölüm | Sayfa | Taşan |
|---|---|---|---|---|
| Mesafeli Satış Sözleşmesi v1 | `DistanceSalesAgreementContent.tsx` | 14 | **2,61** → 3 | 0 |
| Ön Bilgilendirme Formu v1 | `PreInformationContent.tsx` | 15 | **2,66** → 3 | 0 |
| Cayma ve İade Formu v1 | metin YOK (emir) | — | **1,16** → 2 | 0 |

Kapı ölçümü (dördü, föy dahil): **ham hex 0 · alfa 0 · Arial/Helvetica 0 · para birimi 0.** Türkçe literal kabukta 0 (dil yuvası turunda ölçüldü). Not: ilk ölçümümde `&#8220;` gibi HTML varlık kodları "ham hex" olarak yakalandı — o bir yanlış pozitifti, desen düzeltilip yeniden ölçüldü. Ölçülen ile çıkarsanan ayrı.

### Yer tutucu konvansiyonu koddan

`src/config/legal.ts` kuralı: doldurulmamış alan `[BUYUK_SNAKE]`, ve kodun kendi yorumu **"gerçekmiş gibi duran sahte değer KOYMA"** diyor (sebebi de yazılı: tüketici o e-postaya yazar, o telefonu arar). Belgede aynı konvansiyon, mono + `--surface-inset` zeminle görünür kılındı.

**Sözleşmede 16 tekil yer tutucu:** unvan · adres · telefon · e-posta · KEP · vergi dairesi · vergi no · MERSİS · ticaret sicil · oda · ETBİS · iade adresi · kargo firmaları · iade kargo masrafı · yetkili servis · site adresi.

**Dolu değerler koddan geldi** (placeholder yapılmadı): teslim `1-5 iş günü` · iade/fesih `14 gün` · fatura `7 gün` (VUK m.231/5 azamisi, kodda gerekçesi yazılı) · garanti `2 yıl` · kullanım ömrü `10 yıl` · kargo ücreti "Sipariş özetinde gösterilir" · yürürlük `2026-08-15`.

**`[SITE_ADRESI]` benim eklediğim yuva.** Kodda `legalConfig.websiteUrl`, `SITE_URL`'den türetiliyor; o dosyayı okumadım, bu yüzden `venthub.com.tr` yazmadım. Footer sözlüğünde `info@venthub.com.tr` geçiyor ama alan adını **ölçmedim** — çıkarsamayı değer yerine koymuyorum.

### Taslak bandı kod gerçeğidir

`legalConfig.legalReviewCompleted === false` — hukukçu teyidi alınmamış. Kod bu durumda sayfada taslak uyarı bandı gösteriyor (`legal.draftWarning` sözlükte var). Belge de gösterir; `taslakBandi` tweak'i teyit gelince kapatılır. **Amber kullanılmadı** (arayüz uyarı rengi, belgeye girmez): lacivert 1 px çerçeve + `--surface-inset`, "kapalı bekler" şeridiyle aynı dil.

### Cayma formu: alan yerleşimi, metin yok

Emir gereği yalnız alan listesi. Üstte "Metin hukuktan gelecek" bandı, açıklama bölümleri boş (K7). Bölümler: tüketici (ad · adres · telefon · e-posta · iade hesabı) → sipariş (no · sipariş tarihi · teslim tarihi) → kalem tablosu (kod · ürün · adet · sebep, `kalemSatiri` 3/5/8) → sebep kutucukları + serbest açıklama → tüketici beyanı ve satıcı kaydı.

Sebep kutucukları `status` enum'undan **türetilmedi** — o iş akışı durumu, iade sebebi değil. Kutucuklar cayma/ayıp ayrımını taşıyor; son hâli hukukçudan gelir.

### ⚠ Şema ölçümü — `venthub_returns` sanılandan dar

`supabase/migrations/202508271900_venthub_returns.sql` okundu. Tablonun **tamamı**: `id (uuid)` · `user_id` · `order_id` · `reason (text, NOT NULL)` · `description` · `status` · `created_at` · `updated_at`. Status CHECK: requested → approved / rejected → in_transit → received → refunded / cancelled.

Üç eksik çıktı:
1. **Kalem ve adet kolonu YOK.** `venthub_return_items` diye tablo yok; iade başvurusu **sipariş düzeyinde** tutuluyor. Emir "kalem · adet" alanlarını sayıyordu; formda kâğıt için var, ama sisteme girmiyor.
2. **İade tutarı kolonu YOK.** `refund_amount` diye alan yok — bunu daha önce kendi aynama yanlış yazmıştım (`refund_amount · requested_at · approved_at · processed_at`); dördü de yok, ölçümle düzeltildi.
3. **Başvuru numarası yok:** birincil anahtar uuid. K19'da iade öneki IA ama üretecek kolon henüz yok.

Üçü REC-153'e yazıldı (153-15/16/17).

## 3 · Dosyalar

`Mesafeli Satis Sozlesmesi v1.dc.html` — tweaks: alanAdlari · kapaliEtiket · taslakBandi
`On Bilgilendirme Formu v1.dc.html` — tweaks: alanAdlari · kapaliEtiket · taslakBandi
`Cayma ve Iade Formu v1.dc.html` — tweaks: alanAdlari · kapaliEtiket · kalemSatiri
`Urun Teknik Foyu.dc.html` — tweaks: **urun (17160/17143)** · alanAdlari · anlamSutunu

