# Seçim motoru kapsam haritası — TASLAK (OPS, 2026-09-04 akşam; Recep ile istişareye gider)

Amaç: "Ürün Seçici" tek bir hesap değil, ürün grubu başına ayrı bir MOTOR ister. Bu belge hangi grubun hangi girdiyle,
hangi kuralla, hangi veriyle seçileceğini tek tabloda tutar. Cetvel yoktu; bu taslak cetvelin çekirdeğidir
(`docs/standards/secim-motoru-standard.md` olacak). Kural: atıfsız tablo YASAK (Recep, 2026-08-23) — her katsayı kaynak ister.

## Bugün ne var (ölçüldü, kod)
- **Kanal fanı motoru** (`src/lib/hvac/ductFanSelection.ts`, T150): mahal tipi (banyo · mutfak · yatak odası · salon ·
  ofis · dükkân) → ACH tablosu (ASHRAE 62.2 / EN 16798-1 atıflı); alan × yükseklik → hacim; güzergâh (kısa/orta/uzun) →
  Colebrook-White ile basınç kaybı; kanal malzemesi (sert/esnek); sessizlik ağırlığı; ürün P-Q eğrisiyle eşleşme
  (145 üründe eğri var, 12 sessiz kanal fanında tam veri). Çıktı: YETER / SINIRDA / YETMEZ + devir + ses kıyası.
- **Dört hesaplayıcı sayfası** (canlı, ayrı ayrı): kanal boyutlandırma (debi, kesit, uzunluk, malzeme) · hava perdesi
  (kapı en/boy, uygulama, rüzgâr, trafik) · ısı geri kazanım (bina tipi, iklim bölgesi, alan, kişi, çalışma saati,
  verimler, elektrik bedeli) · jet fan (otopark/tünel, boyutlar, araç kapasitesi, trafik).
- **Teknik veri doluluğu** (canlı, 09-04): güç %86 · gerilim %83 · faz %80 · çap %79 · debi %74 · devir %67 ·
  statik basınç %50 · ses %40 · IP 209 ürün · ATEX az · eğri 145 ürün. Sıcaklık sınıfı, nem sınıfı, korozyon sınıfı
  alanı YOK.

## Ne yok (Recep, 09-04 19:00)
Fan türüne göre ayrı seçim mantığı; mahal listesi 6 tiple sınırlı (mutfak-endüstriyel, depo, laboratuvar, galvaniz,
sığınak, spor salonu, kapalı havuz yok); ortam düzeltmeleri: sıcaklık (motor sınıfı, hava yoğunluğu), bağıl nem
(malzeme/IP), deniz kenarı tuz (korozyon sınıfı, C3–C5), rakım (hava yoğunluğu → debi düzeltmesi), ATEX/gaz;
grup başına faset mimarisi (kategori sayfasındaki gibi).

## Harita (satır = ürün grubu; Recep ile doldurulacak)
| Ürün grubu | Ziyaretçinin bildiği girdiler | Hesaplanan ara değer | Ürünü eleyen fasetler | Ortam düzeltmeleri | Bugün motor | Eksik veri |
|---|---|---|---|---|---|---|
| Kanal fanı (konut/ofis) | mahal · alan · yükseklik · güzergâh · sessizlik | debi (ACH) · basınç (kayıp) | çap · ses · güç | rakım (yoğunluk), sıcaklık (motor) | VAR | mahal listesi dar; ortam yok |
| Endüstriyel/aksiyal fan (depo, atölye, mutfak egzoz) | mahal · hacim · ısı yükü/duman · montaj (duvar/çatı/kanal) | debi (ACH veya ısı yükü) · basınç | debi · çap · malzeme · IP · ATEX | sıcaklık (egzoz gazı), tuz (korozyon), nem | YOK | ısı yükü tablosu; korozyon sınıfı alanı |
| Hava perdesi | kapı en/boy · giriş tipi · rüzgâr · trafik · ısıtmalı mı | hız/debi · ısı gücü | genişlik · debi · ısıtıcı tipi | dış sıcaklık (ısı gücü), rüzgâr | Hesaplayıcı VAR (seçime bağlı değil) | ürün eşleşmesi kodda yok |
| Isı geri kazanım (VMC) | bina tipi · alan · kişi · iklim · çalışma saati | debi · verim · tasarruf | debi · verim · gürültü · boyut | iklim bölgesi, nem (entalpi) | Hesaplayıcı VAR | ürün eşleşmesi yok |
| Jet fan / otopark | araç sayısı · boyutlar · mod (duman/CO) | itki (N) · debi | itki · sıcaklık dayanımı (F300/F400) · ATEX | duman sıcaklığı | Hesaplayıcı VAR | itki alanı ürünlerde var mı ölçülmeli |
| Sığınak havalandırma | sığınak hacmi · kişi · filtre tipi | debi · basınç | debi · filtre uyumu · elle tahrik | — | YOK | ürün 3, kural yok |
| Kontrol / sürücü | fan gücü · faz · kontrol tipi | akım | güç · faz · IP | sıcaklık (kabin) | YOK (eşleşme: uyumlu ürün) | uyumluluk tablosu |
| Aksesuar | bağlı ürün | — | çap/uyumluluk | — | YOK | uyumluluk tablosu |

## İlkeler (öneri; Recep onayı ister)
1. **Seçici = tek KABUK + grup MODÜLÜ** (ürün sayfası mimarisi K6/K12 ile aynı desen): kabuk ortak (mekân çipleri, sonuç
   kartı, sorumluluk satırı, teklife aktar); girdi bloğu ve motor gruba göre takılır. Design bunu çizer, motor sonra gelir.
2. **Ortam düzeltmeleri ayrı katman:** sıcaklık · nem · tuz · rakım · ATEX her motora aynı arayüzle girer (çarpan ya da
   faset filtresi); tablo tek yerde, atıflı.
3. **Kural tablosu Recep ile yazılır:** katsayılar, mahal listesi, sınıf eşikleri makine mühendisi onayıyla; OPS/URUN
   yalnız kodlar ve test eder. Atıfsız satır koda girmez.
4. **Sorumluluk dili her motorda aynı:** "ön seçim · proje verisiyle doğrulanır · Teknik destek iste".
5. **Sıra:** Faz 3'te yalnız kanal fanı motoru seçicide (var olan); ikinci: endüstriyel fan (en çok ürün, 295); sonra
   hava perdesi ve VMC (hesaplayıcılar ürünle eşleştirilir); jet fan, sığınak, kontrol en sona.
6. **Veri işi önce:** sıcaklık sınıfı, korozyon sınıfı, nem/IP, itki alanları katalog şemasına eklenir (product-schema
   standardı, migration = Recep kapısı); ithalat CSV'lerinde bu sütunlar var mı ölçülür.
