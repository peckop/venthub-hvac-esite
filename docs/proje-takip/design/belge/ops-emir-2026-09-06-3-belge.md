
# OPS EMRİ → DESIGN-BELGE · 2026-09-06 · #3 · Yasal set + föy gerçek veri KABUL · 153-15/16/17 hükümleri · sıradaki: SATINALMA SETİ (EN)

## Kabul
Föy 17160 gerçek veriyle (21 alan, 1,46 sayfa, taşan 0; `sku` 0; etiketler `pdp.specs.*` sözlüğünden — doğru zincir). Üç yasal belge (sözleşme 2,61 ·
ön bilgilendirme 2,66 · cayma 1,16; ham hex/alfa/Arial/para birimi 0). Yer tutucu konvansiyonu koddan (`[BUYUK_SNAKE]`), taslak bandı kod gerçeği
(`legalReviewCompleted=false`), amber yok — hepsi doğru. "Uygulama alanları" bölümünü çizmemen K7'ye uygun. Türkçe karakter ve flex kırılması
düzeltmeleri kabul.

## Hükümler
- **`[SITE_ADRESI]` → `venthub.com.tr`** (OPS ölçümü: kanonik alan adı, CLAUDE.md; www → apex 308; vercel.app müşteriye verilmez). Yuva kalkar, değer girer.
- **153-15/16/17 (venthub_returns dar: kalem/adet yok · tutar yok · başvuru no yok) → KOD İŞİ, Linear REC-159** (Teklif Akışı projesi, satış kipi
  öncesi, migration = Recep kapısı): `venthub_return_items` (kalem · adet · sebep) · `refund_amount` · `return_no` (IA-YYYYMMDD-NNNN, REC-156 sayacıyla).
  Belgede: kalem tablosu ve tutar KALIR (kâğıt gerçeği), `alanAdlari` kipinde "şemada YOK → REC-159" işareti; başvuru no alanı `belge_no` yuvası,
  aynı işaret. Cayma sebep kutucuklarının son hâli hukukçudan (K7), kayda geçti.
- Bekleyen tabloda 153-15/16/17 "kod işi REC-159" olarak KAPANIR; açık kalan yalnız 153-7 (Recep itirazı) · 153-9 (Recep provası).

## Sıradaki emir: SATINALMA SETİ — İngilizce (K10), belge sırasının 5. adımı
Kabuk `dil="en"`, A4, "kapalı bekler" YOK (satınalma bugün de var). Dört belge: **Request for Quotation (RFQ)** · **Purchase Order (PO)** · **Goods
Receipt Note** · **Supplier Non-Conformance Report**. Veri şemadan: `suppliers` · `purchase_orders` · `purchase_order_items` · `goods_receipts`
(migration `20260816143015`); alan adları `alanAdlari`'nda birebir, uydurma kolon yok; kolon yoksa satır çizilmez ve REC-153'e numaralı yazılır.
Para birimi: PO/RFQ tedarikçi para biriminde (EUR olası) — `currency` kolonu varsa oradan, yoksa yer tutucu `[CURRENCY]`, TL varsaymak yok.
Karşı taraf yabancı: künye İngilizce, VentHub kimliği aynı kabuk. Stres: 40 kalem PO. Kapı: kabukta Türkçe literal 0 · ham hex 0 · Arial 0.
Bitti: 4 dosya + `satinalma-seti-notlar-<tarih>.md` + `bekleyen-hukumler` güncel + proje yorumu (tam metin, v1.5).

— OPS · 2026-09-06

