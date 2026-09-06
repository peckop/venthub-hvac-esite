# AYNA · Kararlar — Katalog ve Ürün Verisi · dışa aktarım 2026-09-06 (OPS)

> Kaynak: Linear belgesi `Kararlar — Katalog ve Ürün Verisi` (id 935079bf-b265-49d2-854a-a334abea07af), `updatedAt 2026-09-05T15:14:34Z`.
> Bu dosya kopyadır; çelişirse Linear kazanır. Not: URUN-KATALOG'un 2026-09-06 gece andığı "K7.7" (Tier C temizliği Recep onayı) ve "K7.9" (Heatmaster/Slimroof sırası) bu belgede YOK — REC-155/REC-146 yorumlarında; OPS bugün belgeye taşıyacak.

Tek kaynak; karar buraya yazılmadan verilmiş sayılmaz.

## K1 · Teknik alan hedefi (2026-09-03, Recep)

Her üründe teknik veri TAM olur; eksik "kabul edilen" değil "takip edilip tamamlanan" şeydir. İlk aşamada giriş eksik olabilir. Eksikler admin listesinde takip edilir; vitrinde eksik satır hiç görünmez.

## K2 · İkinci çıkarım turu (2026-09-03, Recep: zorunlu iş, zamanı Recep'te)

SEAT (basınç/IP/ErP/motor 0), Nicotra (yalnız debi), AVenS kataloglarından ikinci çıkarım. Malzeme, montaj, sertifika alanları şemada yok; şema genişletme migration'ı Recep kapısı.

## K3 · Markalar (2026-09-03 ölçüm)

Vortice 173 · SEAT 81 · AVenS 51 · Nicotra Gebhardt 35 · Danfoss 35. Casals ve Storm marka DEĞİL (Storm bir SEAT serisi). Resmi logolar 15A projesinde brand/logos/.

## K4 · Kategori verisi göçü (2026-09-03, Recep)

Canlı ağaç 15A ağacına göçer: 7 boş eski üst kategori + boş alt dallar temizlenir; Sığınak üst kategori olur; ürün atamaları 15A'ya göre. Migration = prod (kural 13) → Recep kapısı.

## K5 · Görsel (kayıtlı kararlar)

Ürün fotoğrafı üretici kaynağından (Gemini ürün fotoğrafı ÜRETMEZ; REC-61 yalnız sayfa/kapak görselleri). 867 izole görsel Supabase storage'da; 35 ürün görselsiz (REC-44). Görsel hattı gerçek çözümü REC-91.

## K6 · Veri yazımı

Prod DB'ye ürün/kategori yazımı iki-göz + Recep kapısı; toplu yazım öncesi render/önbellek cetveli (rendering-cache-standard) uygulanır (2026-08-15 dersi: 1044 fiyat yazıldı, vitrin değişmedi).

## K7 · İçerik hattı — Recep kararları (2026-09-05, doğrudan Recep)

REC-146 Adım 1/1b/2a raporları sunuldu, Recep yedi maddelik sorun listesine karar verdi:

**K7.1 — Satmadığımız varyantların metni YAZILIR, YÜKLENMEZ.** IoT, EP, MONO 20 boy gibi katalogda olup bizde satılmayan varyantların metinleri **ön hazırlık olarak yazılır**, dosyada durur; DB'ye **yüklenmez**. (OPS/URUN-KATALOG önerisi "hiç yazılmasın" idi; Recep "yazılsın ama yüklemeyiz" dedi — hazır dursun, ürün açılırsa beklemeyelim.)

**K7.2 — Çeviri gerekiyorsa YAPILIR.** Kaynağın 22/24'ü İngilizce; çeviri işin parçası, ayrı onay gerekmez.

**K7.3 — Üretici web sitelerinden araştırma ve katalog çekme SERBEST.** Kaynağı olmayan aileler için marka ve ürün sitelerinde araştırma yapılır, ürün bilgileri ve oradaki kataloglar çekilir.

**K7.4 — Sessiz boşluklar ÖNCE RAPORLANIR, sonra doldurulur.** "Kaynağı var görünüp aslında olmayan" kalemler (ör. TIRACAMINO) tespit edilir; doldurulabiliyorsa doldurulur ama **rapor önce gelir**, sessizce kapatılmaz.

**K7.5 — Her tespit KAYIT ALTINA alınır.** Recep'in sözü: *"herşey kesinlikle kayıt altında olacak, yapılan tüm tespitler; sonra geri dönüp gelecekte bu neymiş dememeliyiz."* Ölçüm, sapma, çürütülen ölçüt, kaynak hatası — hepsi belgeye yazılır.

**K7.6 — AVenS kaynak hataları: kendimize doğrusunu yazarız, hatayı da raporlarız.** AVenS fiyat kataloğu 2026'da bulunan hatalar (s.41/s.43 aynı kimlik cümlesi; s.45 başlığı STORM/JET ATEX ama gövdesi "SEAT ATEX" diyor ve STORM'un aralığını veriyor) düzeltilmiş hâliyle bizim metnimize girer; **ayrı bir hata raporu** tutulur, **Recep AVenS'e kendisi iletir**.

---

*2026-09-04 ilk sürüm (OPS). 2026-09-05 K7 eklendi (URUN-KATALOG, Recep'in doğrudan kararı).*

---
*Ayna notu (OPS, 2026-09-06): Tier C iç notu temizliği KOŞULDU (187 ürün + 11 aile, 2026-09-06 00:44–00:47 TR, REC-155); seri metinleri Lineo/Lineo Quiet/Slimroof/Heatmaster taslak (PR #1025/#1027, DB'ye yazılmadı); 10 aile/109 ürün "tek model sayısı" bulgusu (PR #1027 raporu) → konformans kapısı URUN kuyruğunda.*
