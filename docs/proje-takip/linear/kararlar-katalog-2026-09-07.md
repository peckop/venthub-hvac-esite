# Kararlar — Katalog ve Ürün Verisi (Linear belgesinin TAM dışa aktarımı · 2026-09-07 ayna: K1–K8)

<!-- kaynak_id: 935079bf-b265-49d2-854a-a334abea07af · kaynak_updatedAt: 2026-09-06T20:01:10.763Z · kopya: 2026-09-07T06:52Z -->
<!-- Tazelik yalnız yukarıdaki damgayla ölçülür (kaynak_updatedAt > kopya ise bayat). Tek kopya kuralı: bu dosyanın başka yerde ikinci kopyası tutulmaz. -->

> Karar SSOT'u Linear'dır; bu dosya NotebookLM defteri ve Design projeleri için kopyadır. Çelişkide Linear kazanır.

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

## K7.10 · AVenS: kaynağı olmayan aileye satılabilir sayfa yazılmaz (2026-09-06 09:50Z, **Recep kararı**: "Avens için de onay verdim" — OPS önerisi kabul; kaynak: URUN-KATALOG üç bağımsız ajan ölçümü, dalga 3)

* **BVU-LS serisi + hız anahtarları:** kaynakta anlatım yok, yalnız kod + fiyat → **satılabilir sayfa YAZILMAZ**. AVenS'ten teknik föy istenir (K7.6 kanalıyla Recep iletir); gelene kadar sayfalar kod + fiyat kısa kimlik hâlinde kalır, tarama listesinden düşmez, satış anlatımı olmaz.
* **Sulu batarya:** yazılır.
* **Elektrikli ısıtıcı:** yalnız **aksesuar** olarak; bağımsız ürün sayfası değil.
* **HF/FW + HF/S:** sınırda — kaynak yetersizse yazılmaz; yazılırsa kapıdan GÜÇLÜ geçmeli (ZAYIF doğrulama yetmez).
* "Kendi markamız" uydurma izni **değildir** (K7 aynen). Dalga 4 diye iş yok; taslak işi 40/40 bitti (31 sayımdı, ölçüm 40).

## K8 · Aile föyü: her ürün ailesinin kendi belgesi olur, tablo esas (2026-09-06 23:15 TR, **Recep kararı**: "girsin evet"; OPS hükmü kabul)

* Okuduğumuz her üretici kaynağından **kendimize ait aile föyü** üretilir; ürün föyü onun içindeki satırdır. Yeri: ingestor deposunda aile klasörünün çıktı kademesi (`03-output/`), kaynak kademesindeki PDF/HTML'in yanında.
* **Biçim:** tek kaynak yapılandırılmış tablo (CSV; satır = ürün · alan · değer · birim · kaynak dosya · sayfa · birebir alıntı). Okunabilir föy (MD) **bu tablodan üretilir**, elle yazılmaz (üretilmiş artefakt kuralı). Veritabanına (Supabase ya da ileride başka bir DB) yükleme yalnız tablodan yapılır.
* **Güncelleme:** üretici yeni katalog çıkarınca yeni sürüm indirilir, sha256 ile eskisiyle karşılaştırılır, yalnız değişen sayfalar yeniden çıkarılır, fark staging'e düşer, Katalog kapısı + Recep onayıyla föy ve DB güncellenir. Excel fiyat listesi akışıyla aynı mantık.
* İlk uygulama: REC-172 faz 2 staging'i (8 aile, 764 satır) Katalog kabulünden sonra Nicotra/Danfoss/SEAT aile föylerine dönüşür. Cetvel: `catalog-ingestion-standard` §2 + faz 2'nin yazdığı web kaynağı cetvel eki taslağı (Katalog yazar).
