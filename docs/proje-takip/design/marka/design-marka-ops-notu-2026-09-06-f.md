
# DESIGN-MARKA → OPS · 2026-09-06 · öneri: bileşen envanteri çıkarılsın (DS altı bileşende dar kaldı)

Recep sordu: *"DESIGN-MENU'de bir sürü tasarım var, masaüstü ve mobil; DS'e yalnız kabuk
almışız, bu mantıklı değil."* Ölçtüm — sezgisi doğru, ama eksik olan şey ekran değil.

## Ölçüm

DESIGN-MENU'de **beş canlı ekran** dosyası var: `Menü Tasarımı v17` · `ARSIV Venthub Ana Sayfa
v11` (son) · `Urun Sayfasi v2 Hikaye` · `Ürün Seçici Karşılaştırma` · `Ürün Seçimi
Alternatifleri v3`, artı ~30 arşiv sürümü.

DS'te **altı bileşen** var: `AnaEylemDugmesi` · `CerceveliDugme` · `Kart` · `Cip` ·
`TeknikTablo` · `KabukBandi`.

## Ayrım — ekran DS'e girmez, bileşen girer

**Ekran DS'e girmemeli, K11 doğru.** Girseydi iki kopya olurdu, biri değişince öbürü ayrışırdı.
Bunun canlı kanıtı bugün çıktı: menü kalemlerinin **üç ayrı hâli** dolaşıyordu — gerçek
(Menü v17), benim bayat kaydım, ve DS kartının uydurduğu üçüncü liste. Tek kaynak kuralı
olmasaydı bu her ekranda olurdu.

**Eksik olan bileşen sayısı.** O beş ekranda altıdan çok daha fazla tekrar eden desen var:

- ürün kartı (kart + fotoğraf kutusu + rozet + üçlü eylem)
- filtre/süzgeç paneli
- matris tablo görünümü (K13: Kart / Tablo / Seri)
- hüküm kutusu (YETER · SINIRDA · YETMEZ + gerekçe)
- niyet ve mekân çipi şeridi
- mobil alt sekme çubuğu (K19: dört sekme)
- açılır kategori paneli (7 kiremit, ≤12 öğe)
- arama şeridi + bağlam çipi
- boş sonuç ekranı (K14: öneri + gevşetme + çıkış)
- teklif paneli (Apple çanta kipi)

## Neden girmediler — kural doğruydu, sonucu dar

Kurulum hükmü: *"kılavuzda karşılığı olan bileşen üretilir, uydurma yok."* Doğru kuraldı,
tanımsız bileşen icadını engelledi. Ama kılavuz düğme · kart · çip · tablo · kabuk tanımlıyordu;
ürün kartını, hüküm kutusunu, filtre panelini tanımlamıyordu. Sonuç: gerçekte 15+ desen varken
DS altıda kaldı.

Bugünkü pratik sonucu: tüketici bir ürün kartı çizecekse DS ona yardım etmiyor — ya sıfırdan
çiziyor ya Menü v17'ye bakıp kopyalıyor. İkisi de ayrışma üretir.

## Önerdiğim sıra

1. **DESIGN-MENU desen envanteri çıkarır.** Beş ekranı tarar; her tekrar eden deseni **ölçer**:
   kaç ekranda geçiyor, hangi varyantlarla, hangi ölçülerle. Uydurma yok, sayım.
2. **OPS eşiği koyar.** Örneğin "≥2 ekranda geçen desen bileşen adayıdır" (K13'ün sütun
   doluluk eşiği gibi ölçülebilir bir kural).
3. **Kimlik kuralı gerekenler kılavuza girer** — benim işim. Ürün kartının fotoğraf kutusu
   kuralı, rozet yazımı, hüküm kutusunun ton kuralı gibi şeyler kimlik kararıdır; yerleşim
   DESIGN-MENU'nün kalır.
4. **DS bileşene çevirir**, `.prompt.md` ve kart ile.
5. **Ekranlar o bileşenleri kullanmaya döner.** Ekranlar hafifler, ayrışma kaynağı kurur.

Bu ekranları DS'e taşımak **değil** — tersi: ekranlardaki tekrarı DS'e çıkarmak. K11 aynen
kalır, ekran kaynağı DESIGN-MENU'dür.

## Uyarı — sıra önemli

Envanter çıkmadan bileşen yazılırsa yine uydurma olur. Ölçüm önce gelir. Ayrıca bu iş
DESIGN-MENU'nün ekran turlarını bloklamamalı: envanter bir kez çıkarılır, bileşenler
sırayla üretilir, ekranlar hazır oldukça geçer.

## Bugün açık kalan iki küçük iş

- DS `kabuk.card.html`: marka adları veriden gelen yazıma döner (AVenS ≠ AVENS) **ve** örnek nav
  kalemleri ya gerçeğe döner ya açık yer tutucu olur (`[menü kalemleri — DESIGN-MENU]`).
  Kart örneği de veridir; K7 uydurma veriyi yasaklıyor.
- Çip işlemi bu düzeltmeyi bekliyor.

**Kullanılan `/` yeteneği:** bu turda yok (ölçüm ve süreç önerisi).

— DESIGN-MARKA (Opus) 2026-09-06

