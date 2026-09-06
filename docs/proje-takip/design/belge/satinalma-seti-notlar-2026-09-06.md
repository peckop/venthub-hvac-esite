
# Satınalma seti (EN) — teslim notları

**Tur:** OPS emri `ops-emir-2026-09-06-3-belge.md` (yasal set KABUL · 153-15/16/17 hükümleri · satınalma seti)
**Teslim:** dört İngilizce belge · üç hüküm uygulandı · föy `kolonlar` prop'una geçti
**İmza:** — DESIGN-BELGE (Opus) 2026-09-06

---

## 1 · Uygulanan hükümler

**`[SITE_ADRESI]` → `venthub.com.tr`.** Sözleşmede 3, ön bilgilendirmede 2 yuva vardı; beşi de değerle doldu. Kaynak yorumları da güncellendi ("okumadım, uydurmadım" notu yerine OPS ölçümü).

**153-15/16/17 → REC-159 işareti.** Cayma formunda kalem tablosu ve tutar alanı KALDI (kâğıt gerçeği, OPS hükmü); `alanAdlari` kipinde artık "şemada YOK → REC-159 (`venthub_return_items`)" ve "şemada YOK → REC-159 (`refund_amount` ile birlikte)" yazıyor. Başvuru no alanı `belge_no` yuvası olarak işaretlendi.

**K25 · turkuaz metin rengi değil.** `a:hover` dokuz belgede `--brand-cyan` idi — metin rengi olarak kullanılıyordu. Dokuzu da `--brand-cyan-ink`'e çevrildi. Belge gövdesinde turkuaz kullanımı zaten 0'dı (K22 turunda ölçülmüştü); bu yalnız bağlantı hover'ıydı ve kullanıcı bir bağlantı eklediğinde ortaya çıkacaktı.

**`TeknikTablo` artık `kolonlar` alıyor** (çip 2026-09-06). Föydeki ZWSP hilesi kaldırıldı; kolon genişlikleri belgeden veriliyor: normal kipte 215/120/1fr, `alanAdlari` kipinde 215/210/1fr. Ölçüldü: alan 112/215 px, değer 194/210 px, **taşan 0**, sayfa 1,46. Önceki turda değer kolonu sabit 150 px olduğu için uzun yuva adlarını alt çizgiden kırmak zorunda kalmıştım — o gereksinim ortadan kalktı.

## 2 · Satınalma seti — dört belge

Kabuk `dil="en"`, "kapalı bekler" etiketi YOK (satınalma bugün de var). Veri `20260816143015_purchasing_t062_core.sql`'den.

| Belge | Şema bağı | Sayfa | Taşan | Türkçe |
|---|---|---|---|---|
| Purchase Order v1 | `purchase_orders` · `purchase_order_items` · `suppliers` | **1,15** (5 kalem) · **2,43** (40 kalem) | 0 | 0 |
| Request for Quotation v1 | yalnız `suppliers` + `products` | **1,04** | 0 | 0 |
| Goods Receipt Note v1 | `goods_receipts` · `purchase_order_items` · `inventory_movements` | **0,96** | 0 | 0 |
| Supplier Non-Conformance Report v1 | `suppliers` · `purchase_orders` · `goods_receipts` | **1,06** | 0 · düzeltildi | 0 |

Mal kabul notu tek sayfaya sığıyor (0,96); RFQ ve NCR ikinci sayfaya birer parça taşıyor (1,04 · 1,06) — imza kutuları `break-inside:avoid` taşıdığı için bölünmüyorlar.

**NCR'de ölçümle bulunan taşma:** `[WAREHOUSE_STAFF]` yer tutucusu dört kolonlu meta ızgarasında 150/148 px taşıyordu. Yer tutucu `[RAISED_BY]` ile değiştirildi (alan adına da daha uygun: NCR'yi açan kişi). Yeniden ölçüldü: taşan 0.

**40 kalem PO stresi ölçüldü:** 3 297 px → **2,43 sayfa (3 basar)**, taşan hücre 0, en uzun ürün adı 55 karakter, toplam 754 998,40 EUR. Tablo başlığı `<thead>` olduğu için her sayfada tekrar eder.

### Para birimi TL varsayılmadı

`purchase_orders.currency` char(3) NOT NULL; `suppliers.currency` varsayılanı `TRY` ama şemanın kendi yorumu "PO kendi değerini taşır" diyor. Avrupalı tedarikçide örnek **EUR**, biçim en-GB (ondalık nokta, binlik virgül). `tax_rate` şemada var (default 0) ve yurt dışı alımda 0 çıkıyor — satır yine gösteriliyor çünkü kolon dolu ve toplam hesabı ona bağlı.

### Belgeye özgü kararlar

**PO:** durum satırı `purchase_orders.status`'tan; `partially_received`/`received`'in elle seçilemediğini ve miktarlardan türetildiğini metin söylüyor (şemanın kendi kuralı). Terms bloğunda Incoterms ve ödeme yer tutucu — ticari karar.

**Goods Receipt Note:** belgenin en büyük ikinci öğesi **tedarikçinin irsaliye numarası** (18 px mono). Gerekçe şemada: `UNIQUE (po_id, document_no)` idempotens kilidi o kolonda — aynı irsaliye iki kez işlenemez. Fiyat YOK (mal kabul ticari belge değil; maliyet `inventory_movements` kanıt satırında). "Open" kolonu türetilir (`qty_ordered − qty_received`); aşırı kabul DB CHECK + RPC kapısıyla imkânsız olduğu için negatif değer çizilmez. `kabul` tweak'i tam/kısmi kabul arasında geçiriyor ve PO durumunu da onunla değiştiriyor.

**Non-Conformance Report:** üstte "kayıt dışı" bandı var — şemada uygunsuzluk tablosu yok, en yakın alanlar `goods_receipts.note` ve `purchase_orders.close_note` ve ikisi de kalem/adet/bulgu tipi/tedarikçi cevabını taşımıyor. Aşırı kabul bu belgenin konusu değil (şema onu imkânsız kılıyor); konu kabul edilmiş malın uygunsuzluğu. Fiyat yok: kalite belgesi.

**RFQ:** fiyat, termin ve MOQ kolonları bilerek boş — onları tedarikçi doldurur, tablonun altında bunu söyleyen not var. Bu K7'ye aykırı değil: form alanı ile veri alanı ayrı şeyler.

## 3 · ⚠ Ölçülen şema eksikleri (REC-153'e yazıldı)

1. **PO numarası kolonu YOK.** `purchase_orders`'ın kimliği uuid; insan-okunur numara alanı yok. Belge numarasız olamaz → alan çizildi, `alanAdlari` kipinde "şemada YOK" işareti. K19 kalıbında satınalma öneki de tanımlı değil (VH · TK · PF · IA var, PO yok).
2. **RFQ kaydı YOK.** Tedarikçiden teklif isteme diye tablo yok; belge büyük ölçüde elle doldurulur, tek gerçek bağ `suppliers`.
3. **Uygunsuzluk kaydı YOK.** Yukarıda anlatıldı.
4. **Mal kabul belgesinin kendi numarası yok** — kimlik uuid; belge tedarikçinin irsaliye numarasını taşıyor (şemanın gerçeği bu, kusur değil ama kayda geçsin).

## 4 · Dosyalar

`Purchase Order v1.dc.html` — tweaks: alanAdlari · durum (draft/ordered/partially_received/received) · kalemSayisi (5/40)
`Request for Quotation v1.dc.html` — tweaks: alanAdlari
`Goods Receipt Note v1.dc.html` — tweaks: alanAdlari · kabul (tam/kısmi)
`Supplier Non-Conformance Report v1.dc.html` — tweaks: alanAdlari

