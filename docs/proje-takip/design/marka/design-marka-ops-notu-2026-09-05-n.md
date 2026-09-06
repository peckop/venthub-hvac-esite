
# DESIGN-MARKA → OPS · 2026-09-05 · DS'in üç düzeltmesi: onay + ölçümü genişlettim

DS'in K22 turunu okudum. **Üçü de doğru**, ikisi kök nedene inmiş. Ölçümü genişlettim ve bir
sınır değeri buldum; kural kaydıma girdi.

## 1 · Turkuaz etiket düzeltmesi — doğru, ama kural daha geniş

DS ölçtü: koyu bantta 11 px turkuaz etiket `#0088B0` / `#1A2B4A` = **3.46:1**, eşik 4.5.
Doğru. Ben üç koyu zeminde birden ölçtüm — kural DS'in söylediğinden geniş:

| Koyu zemin | Turkuaz #0088B0 | Muted #8FA2BD |
|---|---|---|
| `#1A2B4A` lacivert bant | **3.46:1** ✗ | 5.42:1 ✓ |
| `#0F1723` utility şeridi | **4.41:1** ✗ | 6.92:1 ✓ |
| `#24395C` arama alanı zemini | **2.84:1** ✗ | **4.45:1** ⚠ |

Yani turkuaz küçük metin **kullandığımız üç koyu zeminin hiçbirinde** geçmiyor, yalnız
lacivert bantta değil. Kural kaydıma bu üç ölçümle yazıldı.

### Bulduğum sınır — DS'in bilmediği

`#8FA2BD` / `#24395C` = **4.45:1**, eşiğin **hemen altında**. Arama alanı zemini bu renk
(kabuk ekranında `#24395c` kullanılıyor). O zeminde küçük etiket gerekirse muted ink de
yetmez — **beyaz (`--text-on-dark`)** olmalı.

Bugün kabuk ekranında `#24395C` üstünde küçük etiket yok (arama alanı yer tutucu metni
`--text-muted` ile açık kutu içinde), yani şu an bir ihlal yok. Ama kural yazılmazsa ilk
ekleyen düşecek. DS'e iletilmesini öneriyorum.

## 2 · Düğme nowrap — kök neden doğru yerde

`CerceveliDugme` tabanında `nowrap` ve `flex-shrink: 0` yoktu; arama alanına yer açılırken
düğmeler küçülüyordu. DS yamayı kabuk dosyalarına değil **bileşene** koydu ve simetri için
`AnaEylemDugmesi`'ne de ekledi. Doğru karar: aynı kusur bileşeni kullanan her düzende
tekrarlayacaktı.

`.prompt.md`'ye yazdığı kural da doğru: *"uzun etiket gerekiyorsa metin kısalır, düğme
daralmaz."* Bu K5'in düğme tarafındaki karşılığı — eylem düğmesi sayfanın işini bitiriyor,
etiketi kırpılmaz.

## 3 · Ölçülmeyen sınırı uydurmaması — doğru davranış

Header satırı ölçülen içerikle ~900 px altına sığmıyor; DS kırılma noktası, aramanın
gizlenmesi ya da satırın sarması için **değer uydurmadı**, bunu ekranın geçerlilik aralığı
olarak `ui_kits/kabuk/README.md`'ye yazdı.

Bu doğru: mobil kabuk (390 px) **DESIGN-MENU'nün** işi ve K19 ile zaten kararlaştırılmış
(alt çubuk dört sekme, İletişim header'da yaprak, TR/EN çipi her zaman). DS'in masaüstü
kabuk ekranına mobil davranış icat etmesi iki kaynak yaratırdı.

**Not:** DS kabuk ekranı 1440 için çizildi ve öyle etiketlendi. Aralığın altındaki davranış
gerekiyorsa o iş DESIGN-MENU'ye açılır, DS'e değil.

## Kendi dosyalarımı taradım — ihlal yok

Üç güncel dosyada (kılavuz · ikon provası · logo provası) koyu zemin bağlamında turkuaz küçük
etiket araması: tek eşleşme çıktı, o da bir `a:hover` bağlantı rengi — küçük etiket değil.
Koyu zeminde zaten `#8fa2bd` yazmışım. Kural bende uygulanıyordu, ölçümü ve tokeni yoktu;
ikisi de artık var.

## Sırada

- DS'e iletilecek: `#24395C` üstünde muted ink 4.45:1 sınır değeri — o zeminde beyaz kullanılır.
- Recep'te **Published**. K22 ve nowrap düzeltmeleri yayını beklemiyor.
- Açık: `templates/kabuk/` şablonu, DS sıra bekliyor.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm ve kural yazımı).

— DESIGN-MARKA (Opus) 2026-09-05

