# KTL-63 · Kategori adı ve adres envanteri — Menü isteği × canlı `categories` (satır satır)

Tarih: 2026-10-26. Emir: OPS (Recep 26 Ekim: "değişecek başka kategori adları ve adresleri de var, hepsi 308 ile tek seferde"). Kaynaklar: canlı SELECT (bugün, 35 kategori satırı: 28 aktif, 7 pasif); Menü projesi (DesignSync `be615496-25af-4630-aa2c-324c2cfc88e0`): `veri/adres.json` (damga 10-21, kategori bölümü okundu; dosyanın sonu 256 KiB sınırında kesik, kategori bölümü eksiksiz), `surec/ops-istek-2026-10-25-kategori-adlari.md`, `surec/ops-istek-2026-10-26-elektrik-adres.md`; süzgeç/sayfalama (`-suzgec-adres`), seri kısa adı (`-kisa-ad`) ve aile listesi (`-aile-listesi`) isteklerini de okudum: kategori adı ya da adresi değiştirmiyorlar, bu envantere girmiyor. **Okunmadı:** `ops-istek-2026-10-25-kip-anahtari.md`, `-uygulama-etiket.md`, `-arama-es-anlam.md` (adlarından kategori adresi değil; ölçülmedi). Hiçbir yazım yapılmadı.

Adres kalıbı (karar 407): kategori ve alt kategori TEK segment: `/tr/kategori/<slug>`, `/en/category/<slug>`. EN yayın kapalı (10 Ekim migration'ı notu); TR adres bugün `/tr/category/<slug>`, K3-b bayrağı (PR #1811) açılınca `/tr/kategori/<slug>`.

## 1. Canlıda ve Menü'de AYNI olanlar (değişiklik yok)

Fanlar kökü ve 9 alt kategorisi (korozyon, duman, çatı, banyo, tavan vantilatörü, radyal, plug, hücreli, şömine; kanal tipi ve aksiyel yalnız EN slug farkıyla §2'de); hava şartlandırma kökü + sulu batarya, elektrikli kanal ısıtıcı, nem alma; hava perdeleri kökü + ısıtıcısız + elektrikli; frekans konvertörleri ve hız anahtarları TR/EN slug'ları. TR ve EN adresleri iki tarafta aynı.

## 2. FARK VAR — satır satır

| # | Düğüm (canlı EN kanonik) | Bugün canlı: ad · TR slug · EN slug | İstenen | Gereken 308 | Kaynak | Onay durumu |
|---|---|---|---|---|---|---|
| 1 | `control-systems` (kök) | Kontrol Sistemleri · `kontrol-ve-suruculer` · `control-systems` (4 aile / 37 ürün) | Ana grup "Elektrik Aksesuarları / Electrical Accessories", TR `elektrik-aksesuarlari`; EN Menü'nün dosyasında `controls-drives` ("değişmez" diyor ama canlıda öyle bir slug YOK) | `/tr/kategori/kontrol-ve-suruculer` → yeni TR; EN eski slug → yeni EN | Karar 409; Menü 10-26 | Ad+TR slug: karar 409 (Recep). EN slug: **Recep/OPS onayı bekler** (bkz. §4) |
| 2 | `frequency-converters` | Frekans Konvertörleri · `frekans-konvertorleri` · `frequency-converters` | Görünen ad "Frekans Konvertörleri (İnvertör)"; adres aynı | yok | Karar 409; Menü 10-26 | karar 409 |
| 3 | `speed-controllers` | Hız Anahtarları · `hiz-anahtarlari` · `speed-controllers` | 10-26: "Hız Anahtarları" (aynı). 10-25 dosyası: "Hız Kontrol Cihazları" | yok | **ÇELİŞKİ:** Menü 10-25 ≠ 10-26 | **Recep onayı bekler** (hangisi?) |
| 4 | `spare-parts-sensors` | Yedek Parça ve Sensörler · `yedek-parcalar-ve-sensorler` · `spare-parts-sensors` (altı: accessories) | "Sensörler ve Koruma", TR `sensorler-ve-koruma`, EN `spare-parts-sensors`; üstü yeni kök (kontrol); Menü notu: "BVU-LS Aksesuarlar'da kalır (Recep 10-26)" | `/tr/kategori/yedek-parcalar-ve-sensorler` → `/tr/kategori/sensorler-ve-koruma` | Karar 409; Menü 10-26 | Ad ve TR slug: karar 409. **BVU-LS yeri: OPS bu cümleyi (Menü dosyasındaki Recep atfı) Recep'e soruyor; teyit gerekir** |
| 5 | `accessories` (kök) | Aksesuarlar · `aksesuarlar` · `accessories` (2 aile / 3 ürün) | Menü modelinde AYRI kök olarak KALIR ("aksesuar": `/tr/kategori/aksesuarlar`, `/en/category/accessories`), BVU-LS orada | yok (Model B) | Menü adres.json | Karar 409 metni "Aksesuarlar kalkar" demiyor; **Recep/OPS teyidi** |
| 6 | `duct-fans` | Kanal Tipi Fanlar · `kanal-tipi-fanlar` · `duct-fans` | EN `in-duct-fans` | EN `duct-fans` → `in-duct-fans` | Menü adres.json (damga 10-21); 10-25 dosyası "adres değişmez" diyor | **Recep onayı bekler** (Menü'nün adres.json'u yeni EN mi istiyor, eski mi?) |
| 7 | `axial-industrial-fans` | Aksiyel Fanlar · `aksiyel-fanlar` · `axial-industrial-fans` | EN `axial-fans` | EN `axial-industrial-fans` → `axial-fans` | Menü adres.json | aynı soru |
| 8 | `heat-recovery-vmc` (kök) | Isı Geri Kazanım (VMC) · `isi-geri-kazanim` · `heat-recovery-vmc` | Ad "Isı Geri Kazanım"; EN `heat-recovery` | EN `heat-recovery-vmc` → `heat-recovery` | 10-25 ad; adres.json EN | Ad: Menü 10-25 (Recep 10-25 atfı); EN: **onay bekler** |
| 9 | `ducted-central-hrv` | Kanallı Merkezi Üniteler · `kanalli-merkezi-uniteler` · `ducted-central-hrv` | Ad "Kanallı Isı Geri Kazanım Cihazları"; EN `ducted-central-units` | EN `ducted-central-hrv` → `ducted-central-units` | 10-25 ad; adres.json EN | Ad: Menü 10-25; EN: **onay bekler** |
| 10 | `single-room-hrv` | Tekil Oda Üniteleri · `tek-oda-uniteleri` · `single-room-hrv` | Ad "Oda Tipi Isı Geri Kazanım Cihazları"; EN `single-room-units` | EN `single-room-hrv` → `single-room-units` | 10-25 ad; adres.json EN | Ad: Menü 10-25; EN: **onay bekler** |
| 11 | `water-coil-duct-heaters` | Sulu Batarya Kanal Tipi · `sulu-bataryalar` · `water-coil-duct-heaters` | Ad "Sulu Bataryalı Kanal Isıtıcıları"; adres aynı | yok | Menü 10-25 | Menü 10-25 (Recep 10-25 atfı) |
| 12 | `shelter-ventilation` (KÖK, 1 aile / 3 ürün) | Sığınak Havalandırma Fanları · `siginak-havalandirma` · `shelter-ventilation` | Menü iki düğüm ister: kök "Sığınak Havalandırma" (`siginak-havalandirma` / `shelter-ventilation`) ve altında tür "Sığınak Havalandırma Üniteleri" (`siginak-havalandirma-uniteleri` / `shelter-ventilation-units`) | Kök adresi aynı; yeni alt kategori yeni adres (308 gerekmez) ama canlıda alt satır YOK → **yeni kategori satırı** (ya da mevcut satır alt kategori olur, yeni kök açılır) | Menü 10-25 ad + adres.json | **Yapı kararı: Recep onayı bekler** (yeni satır; "yapısal karar paketle sorulmaz") |
| 13 | `air-treatment` (kök) | İklimlendirme ve Hava Şartlandırma · `hava-sartlandirma` · `air-treatment` | Menü'de aynı adres; görünen ad Menü dosyalarında geçmiyor | yok | — | değişiklik yok |
| 14 | `fans` (kök) | Fanlar · `fanlar` · `fans` | 10-25: "Fanlar ve Aspiratörler → Fanlar" (canlı zaten "Fanlar") | yok | Menü 10-25 | yok (Menü eski adı görmüş) |

Canlıda olup Menü'de olmayan düğümler: 7 PASİF satır (ticari havalandırma, dikdörtgen kanal, konut tipi havalandırma, kanal içi hayalet, jet fans, otopark jet fan, ex-proof ATEX): yayında değil, kapsamda değil.

## 3. Karar 409'un iki uygulama biçimi (fark Menü'nün modelinden çıktı)

| | A. (hazırladığım dal) | B. (Menü modeli) |
|---|---|---|
| Fikir | `accessories` satırı yeni ana kategori olur; iki alt kategori ona taşınır; `control-systems` pasif, altına konur | `control-systems` satırı "Elektrik Aksesuarları" olur; `accessories` ("Aksesuarlar") kalır; yalnız `spare-parts-sensors` yeni köke taşınır |
| Taşınan aile / ürün | 4 aile / 37 ürün | PTC 1 aile / 1 ürün; BVU-LS 1 aile / 2 ürün (Aksesuarlar kökünde kalır) |
| Pasif kök hilesi | gerekir (eşleyici pasif kökü üstüne tırmanarak çözer) | gerekmez |
| 308 | kök: aksesuarlar, kontrol-ve-suruculer, kontrol-sistemleri, yedek-parcalar | kök: kontrol-ve-suruculer (tetik otomatik), yedek-parcalar (tetik otomatik); aksesuarlar değişmez |
| EN slug | `accessories` (değişmez) | `control-systems` ad ile örtüşmez; `electrical-accessories` (ya da Menü'nün `controls-drives`) önerilir, EN yayın kapalı |
| Menü modeliyle uyum | `aksesuar` ayrı kök yok | birebir |

Önerim B: Menü modeliyle birebir uyumlu, 37 ürün yerine 3 ürün taşınır, pasif kök hilesi yok, eski adresleri tetik kendisi yazar. A'yı yalnız "Aksesuarlar kalkıyor" kararı gelirse seçerim. A'nın migration'ı ve testi dalda hazır (PR açılmadı).

## 4. Recep onayı bekleyen satırlar (ayrı)

1. Aksesuarlar kökü kalıyor mu (Model B) ve BVU-LS orada mı kalıyor? (§2 satır 4-5; Menü dosyası Recep atfı veriyor, OPS'ta teyit gerekir.)
2. Hız anahtarlarının görünen adı: "Hız Anahtarları" (10-26) mı "Hız Kontrol Cihazları" (10-25) mı? (§2 satır 3)
3. EN slug'ların değişmesi: Menü'nün adres.json'u 5 EN slug farkı taşıyor (kanal tipi, aksiyel, ısı geri kazanım ve iki alt); 10-25 dosyası "adres değişmez" diyor. Menü'nün adres.json'u yeni mi istiyor? (§2 satır 6-10). Ayrıca ana grubun EN slug'ı: `controls-drives` (Menü) / `electrical-accessories` / olduğu gibi. (§2 satır 1)
4. Sığınak: yeni alt kategori satırı açılması (yapısal karar). (§2 satır 12)

## 5. PR #1811 (URN-85, adres açılışı) ve "adres açılışı içerikle birlikte" kararıyla çakışma

- Dosya çakışması: yalnız `src/data/__tests__/markaKaynagi.test.ts`. #1811'in hunk'ları satır 82, 307, 340 civarı; benimki 499-515 civarı: aynı dosya, farklı hunk, otomatik birleşme beklenir (ÖLÇÜLMEDİ: gerçek merge denemesi yapılmadı). Taban: #1811'in tabanı master atası.
- Davranış çakışması: bu migration adresleri AÇMAZ; yalnız slug ve ad değiştirir. Bayrak kapalıyken yeni TR adresler `/tr/category/<yeni>` biçiminde yayına girer (eski adresler tek 308), bayrak açılınca `/tr/kategori/<yeni>`. "Adres açılışı içerikle birlikte" kararının metnini bulamadım (ÖLÇÜLMEDİ); sıralama tercihi: migration, #1811'den ÖNCE ya da SONRA aynı şekilde çalışır, fakat Recep açılışı içerikle birlikte yapacaksa slug değişikliklerini açılışa bağlamak gerekir. Bu karar OPS'ta.
