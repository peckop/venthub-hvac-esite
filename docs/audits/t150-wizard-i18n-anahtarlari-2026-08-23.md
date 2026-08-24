# T150-VH — Sessiz Fan Sihirbazı i18n Anahtarları

**Tarih:** 2026-08-23 · **Şerit:** URUN · **Dal:** `urun/t150-sessiz-fan-wizard`
**Bağlayan dosya:** `src/components/category/SilentFanWizard.tsx`

## Niçin bu dosya var

`src/i18n/dictionaries/**` I18N şeridinin claim'inde; URUN o dosyalara dokunmaz. Ama OPS'un
koyduğu kural gereği **anahtar ve bağlama aynı PR'da gitmeli** — bağlanmadan eklenen anahtar
ölü anahtardır ve INV-6'yı kırar. Bu dosya o yüzden anahtarları TR/EN karşılıklarıyla teslim
eder; ekleme işini I18N **bu dalda** yapar, ayrı PR açılmaz.

**Toplam:** 52 sabit + 30 dinamik (4 grup × üye sayısı) = **82 anahtar**.

## Sabit anahtarlar

| anahtar | TR | EN |
|---|---|---|
| `silentFanWizard.headerTitle` | Sessiz Fan Seçim Asistanı | Silent Fan Selector |
| `silentFanWizard.goBack` | Önceki adım | Previous step |
| `silentFanWizard.continue` | Devam et | Continue |
| `silentFanWizard.skipToResult` | Sonucu göster | Show result |
| `silentFanWizard.defaultsHint` | Tüm adımlar dolu — istediğiniz an sonuca geçebilirsiniz | All steps are pre-filled — you can jump to the result anytime |
| `silentFanWizard.step1Title` | Fan nereye takılacak? | Where will the fan go? |
| `silentFanWizard.step1Desc` | Mahal tipi, saatte kaç kez hava değişmesi gerektiğini belirler. | The room type determines how many air changes per hour are needed. |
| `silentFanWizard.step2Title` | Oda ne kadar büyük? | How big is the room? |
| `silentFanWizard.step2Desc` | Kabaca bilmeniz yeterli; hacmi ve gereken debiyi biz hesaplıyoruz. | A rough idea is enough — we calculate the volume and required airflow. |
| `silentFanWizard.areaLabel` | Taban alanı | Floor area |
| `silentFanWizard.ceilingLabel` | Tavan yüksekliği | Ceiling height |
| `silentFanWizard.step3Title` | Kanal nasıl gidiyor? | How does the duct run? |
| `silentFanWizard.step3Desc` | Kanal ne kadar uzun ve dolambaçlıysa fan o kadar zorlanır. | The longer and more winding the duct, the harder the fan works. |
| `silentFanWizard.routeLabel` | Kanal güzergâhı | Duct route |
| `silentFanWizard.materialLabel` | Kanal malzemesi | Duct material |
| `silentFanWizard.diameterLabel` | Kanal çapı | Duct diameter |
| `silentFanWizard.diameterUnknown` | Bilmiyorum | I don't know |
| `silentFanWizard.diameterHint` | Bilmiyorsanız boş bırakın — her modeli kendi çapına göre değerlendiririz. | Leave it blank if unsure — we evaluate each model at its own diameter. |
| `silentFanWizard.step4Title` | Sessizlik sizin için ne kadar önemli? | How important is quietness? |
| `silentFanWizard.step4Desc` | Bu tercih sıralamayı değiştirir; yetersiz modeller yine de elenir. | This changes the ranking; underpowered models are still eliminated. |
| `silentFanWizard.calculating` | Modeller sizin tesisatınıza göre hesaplanıyor… | Calculating models for your installation… |
| `silentFanWizard.resultTitle` | Sizin için üç öneri | Three recommendations for you |
| `silentFanWizard.resultNeed` | Odanız yaklaşık {hacim} m³ — bu mahal için saatte {debi} m³ hava taşınması gerekiyor. | Your room is about {hacim} m³ — this space needs {debi} m³ of air per hour. |
| `silentFanWizard.badgeBest` | En uygun | Best match |
| `silentFanWizard.badgeQuietest` | En sessiz | Quietest |
| `silentFanWizard.badgeEfficient` | En verimli | Most efficient |
| `silentFanWizard.cardDelivers` | Sizin kanalınızda | In your duct |
| `silentFanWizard.cardNoise` | Ses seviyesi | Noise level |
| `silentFanWizard.cardDiameter` | Bağlantı çapı | Connection diameter |
| `silentFanWizard.cardCta` | Ürünü incele | View product |
| `silentFanWizard.showDetails` | Hesabı göster | Show the calculation |
| `silentFanWizard.hideDetails` | Hesabı gizle | Hide the calculation |
| `silentFanWizard.detailVolume` | Oda hacmi | Room volume |
| `silentFanWizard.detailAch` | Saatlik hava değişimi | Air changes per hour |
| `silentFanWizard.detailNeed` | Gereken debi | Required airflow |
| `silentFanWizard.detailMinApplied` | (standart alt sınır uygulandı) | (standard minimum applied) |
| `silentFanWizard.detailPressure` | Tahmini sistem direnci | Estimated system resistance |
| `silentFanWizard.detailEliminated` | Yetersiz kalan model | Models ruled out |
| `silentFanWizard.noMatchTitle` | Bu koşullarda uygun model çıkmadı | No suitable model for these conditions |
| `silentFanWizard.noMatchDesc` | Kanal çapını serbest bırakmayı ya da güzergâhı kısaltmayı deneyin. | Try leaving the diameter open, or shortening the duct route. |
| `silentFanWizard.errorTitle` | Modeller getirilemedi | Couldn't load the models |
| `silentFanWizard.errorDesc` | Bağlantıda bir sorun oluştu. Lütfen tekrar deneyin. | Something went wrong. Please try again. |
| `silentFanWizard.restart` | Baştan başla | Start over |
| `silentFanWizard.unitM` | m | m |
| `silentFanWizard.unitM2` | m² | m² |
| `silentFanWizard.unitM3` | m³ | m³ |
| `silentFanWizard.unitM3h` | m³/h | m³/h |
| `silentFanWizard.unitMm` | mm | mm |
| `silentFanWizard.unitPa` | Pa | Pa |
| `silentFanWizard.unitDbA` | dB(A) | dB(A) |
| `silentFanWizard.unitTimes` | × | × |
| `silentFanWizard.approx` | ≈ | ≈ |

## Dinamik gruplar

### `silentFanWizard.room.*` / `roomHint.*`

| anahtar | TR | EN |
|---|---|---|
| `bathroom` | Banyo | Bathroom |
| `roomHint.bathroom` | Nem ve koku hızlı atılmalı | Moisture and odour must clear fast |
| `kitchen` | Mutfak | Kitchen |
| `roomHint.kitchen` | Yağ buharı için en yüksek debi | Highest airflow, for cooking fumes |
| `bedroom` | Yatak odası | Bedroom |
| `roomHint.bedroom` | Gece sessizliği belirleyici | Night-time quiet is decisive |
| `living` | Oturma odası | Living room |
| `roomHint.living` | Sürekli, sakin havalandırma | Continuous, calm ventilation |
| `office` | Ofis | Office |
| `roomHint.office` | Kişi yoğunluğuna göre taze hava | Fresh air for occupancy |
| `shop` | Dükkân / kafe | Shop / café |
| `roomHint.shop` | Yoğun kullanım, yüksek debi | Heavy use, high airflow |

### `silentFanWizard.route.*` / `routeHint.*`

| anahtar | TR | EN |
|---|---|---|
| `short` | Kısa ve düz | Short and straight |
| `routeHint.short` | Yaklaşık 3 m, tek dirsek | About 3 m, one bend |
| `medium` | Orta | Medium |
| `routeHint.medium` | Yaklaşık 6 m, iki-üç dirsek | About 6 m, two or three bends |
| `long` | Uzun / dolambaçlı | Long or winding |
| `routeHint.long` | 10 m üzeri, çok dirsek | Over 10 m, many bends |

### `silentFanWizard.material.*` / `materialHint.*`

| anahtar | TR | EN |
|---|---|---|
| `galvanized` | Sert metal kanal | Rigid metal duct |
| `materialHint.galvanized` | En yaygın; düşük sürtünme | Most common; low friction |
| `pvc` | Sert plastik kanal | Rigid plastic duct |
| `materialHint.pvc` | En düşük sürtünme | Lowest friction |
| `flex` | Esnek spiral boru | Flexible duct |
| `materialHint.flex` | Kolay montaj ama sürtünme çok yüksek | Easy to fit, but much higher friction |

### `silentFanWizard.quiet.*` / `quietHint.*`

| anahtar | TR | EN |
|---|---|---|
| `normal` | Fark etmez | Not a priority |
| `quietHint.normal` | Performans önce gelsin | Performance first |
| `important` | Önemli | Important |
| `quietHint.important` | Sessizlik ve güç dengeli | Balance quiet and power |
| `critical` | Çok önemli | Critical |
| `quietHint.critical` | Yatak odası, gece kullanımı | Bedroom, night-time use |

## Notlar

- `resultNeed` **iki parametre** alır: `{hacim}` ve `{debi}` (ikisi de tam sayıya yuvarlanmış gelir).
- Birimler ayrı anahtar; `formatSpecValue` yolundan geçmiyorlar çünkü bunlar sihirbazın kendi
  hesap çıktısı, ürün spec'i değil. dB(A) birimi bilerek `unitDbA` olarak ayrı duruyor —
  I18N'in 08-22'de yakaladığı "dB(A) yerine Amper basılıyor" kusuru bu yüzeye sıçramasın.
- EN metinlerde İngiliz yazımı tercih edildi (`odour`, `café`), repo genelindeki EN sözlükle
  tutarlılık I18N tarafından kontrol edilmeli.
