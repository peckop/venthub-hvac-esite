
# Mobil kısayol ve İletişim yaprağı önerileri — DESIGN, 2026-09-04 (madde 68)

Çizilen: ekran 12'de İletişim yaprağı (tek kare, aşağıdaki 1 ve 3 uygulanmış hâliyle) + ekran 58 masaüstü paneli aynı kanal setine çekildi.
Ölçüt (OPS): her kısayol için "kim, hangi sayfada, ne için" yoksa konmaz. Aşağıda her madde o cümleyle başlar.

## 1. Sekme adı: "İletişim" — DESIGN görüşü OPS ile aynı, gerekçe farklı

Test: ziyaretçi bu kelimeyi ARAR mı, yoksa öğrenmesi mi gerekir?
- "İletişim" Türkçe B2B sitelerinde header'ın standart son öğesidir; ziyaretçi aramaz, bilir. Sektör örnekleri: Systemair TR, Aldağ, Üntes, Bahçıvan, Vents TR — hepsinde üst menüde "İletişim", hiçbirinde "Destek" ana sekme değil. "Destek" ya alt menüde ("Teknik Destek", "Servis") ya da satış sonrası bölümünde.
- "Destek" satın almış müşteriye hitap eder; teklif kipinde (K1) satın almış müşteri yok. Bugün sitedeki tek kullanıcı ya soruyor ya teklif istiyor — ikisi de "iletişim".
- Karşı görüş, dürüstçe: "İletişim" pasif bir kelimedir, sayfa adıdır; "Destek" bir vaattir. Ama vaadi yaprağın içindeki satırlar verir ("Teknik destek iste", "~10 dk"), sekme adının vermesi gerekmez.
**Öneri:** sekme "İletişim"; yaprak başlığı "İletişim"; içinde tek çerçeveli düğme "Teknik destek iste" (K5 dili korunur). Masaüstü header'daki "İletişim" bağlantısı aynı yaprağı açar — iki platformda tek kelime. v15'te böyle çizildi; karar Recep'in, geri almak tek kelime değişimi.
Ölçme: analitik açılınca sekme tıklama oranı; ama iki adı A/B'lemek 50.000 olay/ay'da anlamlı sonuç vermez — bu kararı kelimenin taşıdığı anlamla vermek daha sağlam.

## 2. Yaprak içeriği (kim: her ziyaretçi · hangi sayfa: hepsi · ne için: birine ulaşmak)

Sıra dokunma alışkanlığına göre, en çok kullanılanı ilk: **WhatsApp ile yaz · Ara · E-posta gönder · [çerçeveli] Teknik destek iste**. Dört satır; beşinci yok.
- **Yapay zekâ asistanı ("Sor")**: Faz 4'e kadar çizilmez (K1 "yakında" yasağı) — doğru. Geldiğinde yaprağa beşinci satır olarak değil, "Teknik destek iste" düğmesinin üstüne "Önce hızlı cevap deneyin" satırı olarak girmesini öneririm: asistan mühendisin yerini almaz, forma giden yolun önünde bir filtredir. Asistan cevap veremezse formu ürün ve soruyla dolu açar. Faz 4 kararı.
- **Kargo takibi**: teklif kipinde yok (K1). Satış kipi açılınca yaprağa girer.
- **Müşteri temsilcisi / teknik destek ayrımı** (Recep sorusu): yaprakta iki ayrı satır olmasın. Ziyaretçi hangi konunun "temsilci", hangisinin "teknik" olduğunu bilmez; öğrenmesi gerekir — ölçüte takılır. Ayrım kanalın arkasında yapılır: WhatsApp ve telefon temsilciye düşer, "Teknik destek iste" formu mühendise düşer. Yaprakta görünen ayrım kanal, görünmeyen ayrım kişi.

## 3. Beklenti satırı (kim: kanal seçen ziyaretçi · her sayfa · ne için: doğru kanalı seçmek)

Her kanalın altında tek satır: "Hafta içi 09–18 · ~10 dk" / "Mesai dışı: sabah döneriz" / "Aynı iş günü". Mesai dışında satır kendiliğinden değişir (saat sunucudan). ETKİ: gece yazan ziyaretçi WhatsApp yerine formu seçer, sabah cevap alır; kimse boşa beklemez. BEDEL: kod, mesai saati tablosu (admin). Çizildi.

## 4. Bağlam taşıyan iletişim (kim: ürün sayfasındaki ziyaretçi · ürün/seçici sayfası · ne için: sıfırdan anlatmamak)

Ürün sayfasından açılan yaprak başlığının altında "SEAT-30-PP hakkında · mesaj önceden dolu gelir"; WhatsApp ve e-posta metni "SEAT-30-PP hakkında bilgi almak istiyorum" ile başlar; seçici sonucundan açılırsa girdiler eklenir ("kimya laboratuvarı, 90 m² × 3,2 m"); form ürünü seçili getirir. ETKİ: ziyaretçi 0 karakter yazarak bağlamlı mesaj gönderir; satış tarafı ürün kodunu sormaz. BEDEL: kod, mesaj şablonu + sayfa bağlamı okuma. Çizildi (başlık altı satır). Kategori/liste sayfasında bağlam satırı yok — yaprak sade kalır.

## 5. Açılış biçimi: alt yaprak, gösteriş yok

Yelpaze/dairesel/yüzen düğme açılımlarını savunmuyorum. Gerekçe K9'dan bağımsız da geçerli: dört kanal arasında seçim yapan kişinin okuması gereken şey satırın altındaki beklenti metni; yelpaze ikonu gösterir, metni gösteremez. Alt yaprak 4 satır + 1 düğme, 60 px satır (≥44), tek dokunuşla ya da aşağı kaydırmayla kapanır. Açılış 200 ms, alttan.

## 6. Diğer kısayol adayları — süzüldü

| Aday | Kim · nerede · ne için | Hüküm |
|---|---|---|
| "Karşılaştır (n)" çipi, ≥2 ürün seçilince alt çubuğun üstünde | Liste sayfasında model kıyaslayan mühendis · 06/08 · seçtiklerini kaybetmemek | **KONSUN.** Ekran 06 masaüstünde yapışkan çubuk zaten var; mobilde alt çubuğun üstüne tek çip. K10 uyumlu. Çizim: Faz 3 (06 mobil). |
| Ürün sayfasında yapışık eylem çubuğu | Ürün sayfasındaki ziyaretçi · 07* · teklife eklemek | **VAR** (K9, 07 mobil). "Destek" düğmesi buraya eklenmesin — alt çubukta İletişim sekmesi 1 dokunuş uzakta, ikilenir. |
| "Son baktıklarınız" | Geri dönen ziyaretçi · menü alt bölgesi · kaldığı yere dönmek | **VAR** (madde 37). |
| "Yukarı" düğmesi, 2 ekran kaydırınca | Uzun liste/uzun metin okuyan · 06, 14 · başa dönmek | **KONSUN, yalnız 06 ve 14'te.** Ürün sayfasında yapışkan bölüm çubuğu aynı işi yapıyor. 44×44, sağ altta, alt çubuğun üstünde. K9: görünen öğe sayısına girer, 06 mobilde sayım 9'u aşmıyor (çubuk 4 + çip 1 + yukarı 1 + süzgeç düğmesi 1 = 7). |
| Alt çubuğa beşinci sekme | — | **KONMAZ** (OPS kuralı; Hesap sağ üste çıktı, 4 kaldı). |
| "Teklif listesine ekle" kısayolu liste kartında uzun basma | — | **KONMAZ.** Öğrenilmesi gereken jest; ölçüte takılır. |
| Arama sekmesi alt çubukta | — | **KONMAZ.** Arama üst şeritte tam genişlik (K9), ikilenir. |

## 7. Ölçme

Analitik açılınca (Vercel Hobby yeterli, yol düzeyi): İletişim yaprağı açılma oranı sayfa türüne göre; WhatsApp/telefon/e-posta/form tıklama dağılımı (özel olay ister — Hobby'de yok; alternatif: her kanal kendi yönlendirme adresiyle sayılır, `/go/whatsapp` gibi). Karşılaştır çipi ve yukarı düğmesi için de aynı yol.

