
# OPS EMRİ → DESIGN-MENU · 2026-09-05 · #4 · Recep v16/v10'u beğenmedi: "ana sayfa ile menü birbirini tutmuyor" — OPS ÖLÇTÜ, düzeltme turu

Recep şu an sohbette de düzelttiriyor; bu dosya ölçümü ve kalıcı kuralı taşır. Ölçüm iki dosyanın ham metninde (`Menü Tasarımı v16.dc.html`
162 KB · `Venthub Ana Sayfa v10.dc.html` 44 KB):

| Ölçüt | v16 | v10 | Hüküm |
|---|---|---|---|
| DS `KabukBandi` bileşeni çağrısı | **0** | **0** | **KÖK NEDEN.** İki dosya bandı kendi çiziyor; tek kaynak yok, o yüzden ayrışıyor. |
| Bant yatay oluğu `padding: 0 40px` | 5 | **0** | v10'da 40 px oluk YOK → header'lar farklı |
| Ham lacivert hex `#1a2b4a` | **14** | 1 | v16 tokena geçmemiş; sözleşme + DS token ister |
| `var(--…)` token kullanımı | 645 | 113 | v10 token disiplini iyi, v16 karışık |
| K19 İletişim yaprağı niyet satırları ("Teklif ve sipariş" · "Ürün seçimi ve teknik soru" · "Arıza ve garanti") | **0** | **0** | K19 madde 2 uygulanmamış; yaprak eski unvanlı satırlarla |
| "Destek" sözcüğü | 4 | 0 | K19: sekme ve yaprak adı **İletişim**; "Destek" kalkar (yalnız "Teknik destek iste" fiili kalır) |
| `opacity` / `clip-path` | 0 / 0 | 0 / 0 | K22 · K23 tamam |
| Kare sayısı | 9 | 1+2 | OPS 8 temsilî kare istemişti — Recep'e yetmedi, karar değişti (aşağıda) |

## Emir (tek tur, iki dosya birlikte)
1. **Bant tek kaynaktan:** header, footer ve utility şeridi iki dosyada da DS `KabukBandi` bileşeninden (bundle mount) gelir; elle çizilmiş
   bant kalmaz. Kanıt: iki dosyada `KabukBandi` çağrısı ≥ 1, elle `padding: 0 40px` bant kutusu 0.
2. **Ham hex 0:** v16'daki 14 `#1a2b4a` ve diğer ham renkler token'a (`hsl(var(--…))`) döner; sözleşme `contrast_strategy` gereği.
3. **K19 İletişim yaprağı** üç niyet satırıyla yeniden: "Teklif ve sipariş" (WhatsApp · Ara; alt yazı müşteri temsilcisi) · "Ürün seçimi ve
   teknik soru" (teknik destek formu / e-posta) · "Arıza ve garanti" (kapalı bekler, çizilir). "Destek" sözcüğü sekme/yaprak adı olarak 0.
4. **Ana sayfa v10 = menü v16 ile aynı kabuk:** header sağı (TR/EN çipi · İletişim simgesi · Teklif (n)) ve mobil alt çubuk (Ana sayfa ·
   Ürünler · Teklif · Hesap) iki dosyada birebir; ölçüm tablosunu notlara koy (aynı 6 değer iki dosyada).
5. **Kapsam değişti:** 8 temsilî kare yetmedi. Bu turda **v15'in 29 karesinin tamamı** v16'ya taşınır, aynı kabukla; 390 eşleri K19'un
   dokunduğu her karede (kabuk, ürünler örtüsü, PDP, teklif, hesap, iletişim). Recep tam seti görmek istiyor, temsilî örneği değil.
6. Recep'in sohbette verdiği düzeltmeleri **notlara madde madde yaz** (ne dedi · ne değişti); OPS sohbeti göremiyor, kayıt oradan çıkar.

Bitti: `Menü Tasarımı v17` (29 kare) + `Ana Sayfa v11` + `kabuk-v2-notlar.md` güncel (ölçüm tablosu iki dosya için yeniden) + proje yorumu.
Prototip hâlâ bu turda değil.

— OPS · 2026-09-05

