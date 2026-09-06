
# OPS EMRİ → DESIGN-BELGE · 2026-09-05 · #3 · İki hüküm + eksik kayıt + e-posta turu

#1 emri (Belge Kabuğu) senin hızına yetişemedi: K11 altı belgeyle bitmiş, gri-ton ve 40 kalem provası ölçülmüş — **KABUL**, turkuaz
küçük metnin lacivert 500'e dönmesi ve tamrenk logonun gri tonda iki blok okunması ölçümleri kayda geçti (Marka'nın üç zemin ölçümüyle
aynı sonuç: turkuaz küçük metin hiçbir zeminde 4.5:1 vermez). `break-after: avoid` için "önlem kondu, çözüldü demiyorum" doğru dil.

## Hüküm 1 · Sayfa no / nakli yekûn → **1. yol: üretim tarafına devret**
Kabuk yalnız **alanı ve biçimi** taşır (`__ / __` yer tutucu doğru; bilinen tek sayfalıda "1 / 1" doğru). Gerçek numara ve nakli yekûn
PDF üreticisinde (Puppeteer `footerTemplate` `pageNumber`/`totalPages`; tablo sayfalama orada). Kabuk footer'ında sayfa-no yuvasının
**adı** yazılı olsun (`alanAdlari` kipinde `sayfaNo` · `toplamSayfa` · `nakliYekun`), üretim tarafı o adları doldurur. 2. yol reddedildi
(tablo bölme motoru bakım yükü), 3. yol reddedildi (kurumsal belgede sayfa no eksik olmaz). Karar Kararlar — Kurumsal Belgeler **K13**.

## Hüküm 2 · E-posta biçimi → **gönderime hazır HTML e-posta**
Sebep ölçülü: kod zaten böyle çalışıyor — `supabase/functions/order-confirmation` kendi yanındaki
`templates/email/order_confirmation.html` şablonunu yükleyip `{{alan}}` ve
`{{#if alan}}…{{/if}}` ile dolduruyor; şablon yoksa Arial ile gömülü HTML basıyor (marka yok). Yani e-posta belgesi **o şablonun** yerine
geçer. Kurallar: tablo tabanlı, inline stil, 600 px, web-safe yedek yazı tipi (Archivo yüklenmezse Arial), logo `brand_logo_url` alanından
(dosya değil, URL), renk `brand_primary_color` alanından. **Alan adları koddaki adlarla birebir:** `brand_name` · `brand_primary_color` ·
`brand_logo_url` · `customer_name` · `order_number` (+ her şablonun kendi alanları; `alanAdlari` kipi burada da zorunlu, K12).
Tek kalıp, değişen gövde: talep alındı · teklif yanıtlandı · hesap oluşturuldu · sipariş onayı (kapalı bekler) · kargo (kapalı bekler).
K1 istisnası: e-posta "ekran" değil gönderim çıktısıdır, bu projede kalır. Yetenek: **HTML email**. Karar **K14**.

## Eksik kayıt · E13–E17
Sipariş Onayı ve Kargo Bildirimi'ndeki **E13–E17 Design eklemeleri Linear'da ve projede yok** (yalnız Recep'in sohbetinde). Protokol:
dosya + yorum, yoksa yarım. Bu turda ilk iş: `design-eklemeleri-e13-e17-2026-09-05.md` (madde · ne · gerekçe · hangi belge) + proje
yorumu; OPS hükmü sonra gelir. Hüküm gelmeden o beş madde karar değildir (belge başı kural).

## Sıra
1. E13–E17 dosyası + yorum → 2. e-posta kalıbı + ilk üç gövde (talep alındı · teklif yanıtlandı · hesap oluşturuldu) → 3. kapalı bekleyen
iki gövde → föy şablonu ayrı emirle. Her teslim: dosya + Kurumsal Belgeler proje yorumu + kullanılan yetenek. Sorular REC-153'e numaralı.

— OPS · 2026-09-05

