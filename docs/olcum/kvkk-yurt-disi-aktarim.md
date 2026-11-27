# Ölçüm defteri: KVKK yurt dışı aktarım ve veri yerleşimi

Sahibi: OPS · Son doğrulama: 2026-11-26 · Kart: OPS-394, OPS-398 (ALT-225, ALT-228)
Son ölçüm: 2026-11-25 (OPS araştırmacısı; resmî sayfalar ham indirildi). Sağlayıcı ölçümü ve veri haritası: 2026-11-26 (ALTYAPI, aşağıda). Hukuki son söz avukat/mali müşavir.

## Kural (KVKK m.9, 7499 s. Kanun)
| Konu | Bulgu |
|---|---|
| Yürürlük | m.9 01.06.2024; eski rızalı aktarım 01.09.2024'te bitti. Yönetmelik RG 10.07.2024 (32598) |
| Yeterlilik kararı | Yok (AB/Almanya dahil), kvkk.gov.tr 2026-11-25 |
| Sürekli aktarım | Standart sözleşme (4 tür), metin değiştirilemez, Türkçe, imzadan sonra 5 iş günü içinde Kurum'a bildirim; BCR ve taahhütname Kurul izinli |
| Arızi/rıza | Yalnız düzensiz, tek-birkaç sefer; sürekli barındırma arızi sayılmaz |
| Bulut | Rehber No:48 (Ocak 2025): yurt dışı bulutta depolama aktarımdır |
| Ceza (2026) | Bildirimsizlik 90.308–1.806.177 TL; veri güvenliği 256.357–17.092.242 TL |
Kaynak: kvkk.gov.tr/Icerik/2053, /8170, /8043, /8145; resmigazete 20240710-2; mevzuat.gov.tr 1.5.6698.

## Sağlayıcılar (DPA, 2026-11-25)
Supabase (DPA 1 Ağu 2026), DigitalOcean (14 Eki 2026), Cloudflare (6.4, 3 Nis 2026): yalnız AB SCC/UK/DPF; Türkiye/KVKK anılmıyor. İmzalayıp imzalamayacakları yazılı sorulmadı.

## Dış servisler (depo okuması)
Supabase (tüm müşteri verisi, Frankfurt) · DO+Coolify (Amsterdam; 26 Kasım düzeltmesi, önceki "Frankfurt" yanlıştı) · Cloudflare (DNS, gelen e-posta, R2 yalnız ürün görseli) · Resend (e-posta, ad, adres, sipariş; ABD) · Twilio (telefon, mesaj; ABD, doğrulanmadı) · Sentry (Almanya, 26 Kasım ölçümü) · iyzico (Türk, doğrulanmadı) · GA4 (rızalı) · Google Drive (şifreli DB yedeği) · Anthropic (uygulamada çağrı yok).

## Türkiye'de barındırma (fiyat 2026-11-25)
Natro XCloud TR 8 GB ₺1.518/ay (indirimli) · Turhost VDS TR 8 GB $24,99 → $72,79 (İstanbul) · Radore Cloud 8 GB $29,5 (İstanbul) · Turkcell/TT/Bulutistan teklifle. Supabase self-host: en az 4 GB, önerilen 8 GB+. Tuzak: Natro "Sanal Sunucu" ve Turhost "VPS Plus" Hollanda'da. Docker/KVM satıştan teyit edilmeli. Dört firmanın ayrıntılı ölçümü aşağıda: "Türkiye'de sunucu sağlayıcı ölçümü (2026-11-26)".

## Hüküm (2026-11-25, Recep kararı bekliyor)
Seçenek A: yurt dışında kal, her işleyenle standart sözleşme + bildirim (sağlayıcılar imzalamayabilir). Seçenek B: veri Türkiye'de (self-host Supabase + Coolify), e-posta/SMS için Türk sağlayıcı ya da sözleşme. OPS önerisi B, Design canlı taşımasıyla birlikte.
## Ölçülmedi
Sağlayıcı imza kararları; firmaların yazılı cevapları ve yayımlanmış sözleşme/sertifika dosyalarının içeriği; Twilio/iyzico konumu; e-fatura/e-defter yurt içi saklama (VUK 509 resmî metni); aydınlatma metni.
## Yeniden ölçme tetikleyicisi
Kurul yeterlilik kararı; sağlayıcı cevabı; barındırma kararı.

## Türkiye'de sunucu sağlayıcı ölçümü (2026-11-26, ALT-225 / OPS-398)

Yöntem: dört araştırmacı firmaların kendi sayfalarını okudu (26 Kasım 2026); fiyat, belge ve konum iddialarının bir örneklemi aynı gün sayfadan ikinci kez okundu. Form doldurulmadı, sipariş adımı açılmadı, firmaya yazılmadı, dosya diske indirilmedi. "bulunamadı" = taranan sayfalarda yok; "hizmet yok" demek değildir. Fiyatlar sayfadaki para birimiyle yazıldı, çevrilmedi.

Kaynak kısaltmaları: **N** [netinternet.tr/ssd-vds-sanal-sunucu](https://www.netinternet.tr/ssd-vds-sanal-sunucu) · **NK** [netinternet.tr KVKK şartları](https://www.netinternet.tr/altyapimiz/kvkk-veri-isleme-ve-gizlilik-sartlari) · **İ** [ilkbyte.com/llms.txt](https://www.ilkbyte.com/llms.txt) ve [cloud sunucu](https://www.ilkbyte.com/kiralik-sunucu-paketlerimiz/cloud-sunucu) (İlkbyte, Netinternet'in bulut markası) · **T** [turhost.com VDS TR](https://www.turhost.com/sunucu/vps-tr-sunucu/) · **TS** [turhost.com/sunucu](https://www.turhost.com/sunucu/) · **R** [radore.com bulut sunucu](https://radore.com/tr/hizmetler/bulut-sunucu) · **RV** [veri merkezi](https://radore.com/tr/veri-merkezi) · **RH** [hakkında](https://radore.com/tr/hakkinda) · **RK** [KVKK uyumlu sunucu](https://radore.com/tr/hizmetler/kvkk-uyumlu-sunucu-bulut) · **H** [hostopya.com/vds-sunucu](https://hostopya.com/vds-sunucu) · **HC** [colocation](https://hostopya.com/colocation) · **HK** [KVKK belgeleri](https://hostopya.com/kvkk-belgeleri) · **HG** [gold sanal sunucu](https://hostopya.com/gold-sanal-sunucu) ve [sipariş paneli listesi](https://musteri.hostopya.com/store/gold-sanal-sunucu)

### 8 GB ve 16 GB paketler (aylık)

| Firma | Paket | İşlemci | Disk | Port / trafik | Fiyat | KDV | Kaynak |
|---|---|---|---|---|---|---|---|
| Netinternet | SSD VDS III, 8 GB | 4 çekirdek, model yazmıyor | 80 GB "Raid50 SSD" (aynı sayfada "NVMe/SSD") | port yazmıyor / 8 TB | $17,50 ilk 3 ay; liste $35,00 | ibare yok | N |
| Netinternet | SSD VDS V, 16 GB | 8 çekirdek, model yazmıyor | 160 GB, aynı | port yazmıyor / 10 TB | $31,07 ilk 3 ay; liste $54,50 | ibare yok | N |
| İlkbyte | Cloud III, 8 GB | 4 vCPU, "Intel Xeon" (sayfada "SAS/SATA disk" ifadesi de geçiyor) | 80 GB SSD | 1 Gbps port, 100 Mbps'e kadar garantili / 3000 GB | $21,99 | paket tablosunda ibare yok | İ |
| İlkbyte | Enterprise I, 16 GB | 6 vCPU | 120 GB NVMe | aynı port / 5000 GB | $48,00 | aynı | İ |
| Turhost | VDS TR 4, 8 GB | 4 vCPU, "Intel Xeon" (sayfanın genel VPS metninde "Xeon E5") | 200 GB "SSD" (genel VPS metninde "NVMe SSD", "%100 NVME SAN") | kartta 200 Mbit (genel VPS metninde 100 Mbit) / 3000 GB | liste $72,79; ilk 3 ay $24,99; 12 ayda $29,99/ay | hariç | T |
| Turhost | VDS TR 6, 16 GB | 6 vCPU, aynı | 300 GB, aynı | kartta 400 Mbit / 5000 GB | liste $110,42; ilk 3 ay $44,99; 12 ayda $49,99/ay | hariç | T |
| Radore | Disk-Elite, 8 GB | 4 çekirdek 2,70 GHz, model yazmıyor | 300 GB NVMe SSD | yazmıyor | $29,5 | hariç | R |
| Radore | CPU-Elite, 8 GB | 8 çekirdek 2,70 GHz | 150 GB NVMe SSD | yazmıyor | $31,0 | hariç | R |
| Radore | RAM-Advance, 16 GB | 2 çekirdek 2,70 GHz | 100 GB NVMe SSD | yazmıyor | $21,0 | hariç | R |
| Radore | Disk-Infinity, 16 GB | 6 çekirdek 2,70 GHz | 500 GB NVMe SSD | yazmıyor | $49,5 | hariç | R |
| Radore | CPU-Infinity, 16 GB | 16 çekirdek 2,70 GHz | 250 GB NVMe SSD | yazmıyor | $60,0 | hariç | R |
| Hostopya | VDS-5, 8 GB | 6 çekirdek, Xeon E5-2680 v4 | 90 GB "NVMe/SSD" | 100 Mbps paylaşımlı / sınırsız (adil kullanım) | ₺239,99 | hariç (%20 eklenir) | H |
| Hostopya | VDS-8, 16 GB | 8 çekirdek, aynı | 150 GB "NVMe/SSD" | aynı | ₺529,99 | hariç | H |
| Hostopya | Gold-4, 8 GB | Xeon Gold 6138; sayfa 4 çekirdek/100 GB, panel 6 CPU/70 GB (çelişki) | NVMe | 100 Mbps | ₺319,99 | hariç | HG |

Radore'da 8 GB'lik daha ucuz bir seri de var (RAM-Core, 1 çekirdek, 50 GB NVMe, $10,5, KDV hariç). Daha önce ayrı ayrı kaydedilen $29,5 (bu defter, 25 Kasım) ve $31 (OPS-398 kartı) ikisi de doğrudur: ayrı serilerdir.

### Konum, belge, KVKK, depolama, iletişim

| Kalem | Netinternet | Turhost | Radore | Hostopya |
|---|---|---|---|---|
| Veri merkezi | Kendi merkezi, Denizli (Pamukkale Teknokent); altyapı yedekleri de Denizli (NK). İlkbyte'ta ücretli Acronis yedekleri İstanbul ([SSS](https://www.ilkbyte.com/sik-sorulan-sorular)) | Türk Telekom Gayrettepe, İstanbul (T). "VDS Plus / VPS Plus" ürünleri Amsterdam: karıştırılmaz | Kendi merkezi, Levent MetroCity, İstanbul (RV) | Datacasa, Başakşehir İstanbul; üçüncü taraf tesis (HC, HK) |
| KVM / Docker | Docker kurulabileceği yazılı (N); "KVM" ifadesi yok | "Bütün bulut altyapılarında KVM" cümlesi [Amsterdam VDS sayfasında](https://www.turhost.com/sunucu/vds-server/); VDS TR sayfasında KVM yok; iki sayfada da Docker ifadesi yok | ikisi de bulunamadı | "KVM", tam root, Docker ve Kubernetes yazılı (H) |
| Tier | Çelişki: [llms-full](https://www.netinternet.tr/llms-full.txt) "Tier III+" diyor; NK'de "Uptime Institute Tier veya TSE veri merkezi belgesi bulunmamaktadır" cümlesi köşeli parantez içinde, yani doldurulmamış taslak alanlarıyla aynı biçimde duruyor (kesin beyan sayılmaz) | "Tier 3 sertifikalı" iddiası (Türk Telekom tesisi için), belge no yok (TS) | Veri merkezi sayfasının açıklaması "Tier III standartlarında" (RV); [blog yazısında](https://radore.com/blog/sla-nedir-uptime-nedir) "TIER II ve TIER III çözümleri"; yayımlanan belgeler arasında Tier yok (RH) | "Tier III+ sertifikalı" (H) ve "standardına göre tasarlanmış" (HC); belge no yok |
| ISO 27001 | ISO/IEC 27001:2022, no IS-190122, PROKS (NK); sertifika dosyası yayımda. İlkbyte'ın [kendi metni](https://www.ilkbyte.com/llms-full.txt) eski sürüm (2013) yazıyor | bulunamadı | ISO 27001:2022, dosya yayımda (RH) | yalnız "standartlarına uygun yönetilmektedir" beyanı; belgenin kime ait olduğu yazmıyor (HC) |
| Veri işleyen sözleşmesi | VAR (dosya yayımda). Aynı sayfada doldurulmamış taslak alanları duruyor: "[3] iş günü", "[N] gün sonra silinir" (NK) | bulunamadı (aydınlatma metni ve kullanıcı sözleşmesinde KVKK maddesi var) | "veri işleyen sıfatıyla" beyanı (RK); ayrı ek bulunamadı | aydınlatma metninde "veri işleyen sıfatıyla" (HK); ayrı ek bulunamadı |
| Yurt dışına veri çıkışı (firmanın beyanı) | NK: "yurt dışına veri aktarımı, yurt dışı yedekleme, CDN veya proxy kullanımı yapılmaz". İlkbyte [anti-DDoS sayfası](https://www.ilkbyte.com/ozellikler/antiddos-servisi): yurt dışı kaynaklı saldırılar yurt dışındaki merkezde engellenir; İ aynı özet için "trafiğiniz ülke sınırları dışına çıkmaz" diyor (iki ifade birlikte netleşmeli) | [aydınlatma metni](https://www.turhost.com/yasal/aydinlatma-metni/): kural olarak Türkiye, müşteri isterse yurt dışı; yurt dışı alıcılar arasında uzak destek araçları (Anydesk, Teamviewer, WhatsApp), alan adı, SSL ve lisans firmaları ile yapay zekâ eklentisi de anılıyor | "Verileriniz Türkiye sınırları içerisinde" (RK) | HK §8.2 yurt dışına aktarım listesi: Cloudflare (ABD) ve Gcore (Lüksemburg; "IP adresi ve trafik meta verileri") dahil, ayrıca Google Workspace, WhatsApp, açık rızayla Google Analytics ve alan adı kuruluşları; H: trafik Gcore'un küresel ağında da temizlenir |
| S3 uyumlu depolama | yönetilen hizmet bulunamadı (kendi sunucunda MinIO imajı) | bulunamadı | bulunamadı | bulunamadı |
| Satış kanalı | satışa özel adres bulunamadı: bilgi@ni.net.tr, bilgi@netinternet.com.tr; İlkbyte bilgi@ilkbyte.com ([metin](https://www.ilkbyte.com/llms-full.txt)); 0850 885 0 885; WhatsApp bulunamadı ([iletişim](https://www.netinternet.tr/iletisim)) | satis@turhost.com; 0212 227 74 74; WhatsApp numarası bulunamadı ([iletişim](https://www.turhost.com/iletisim/)) | satis@radore.com; 0212 344 04 94 (destek); WhatsApp bulunamadı ([iletişim](https://radore.com/tr/iletisim)) | destek@hostopya.com; telefon ve WhatsApp +90 850 309 88 67 ([iletişim](https://hostopya.com/iletisim)) |

**Sayfalardan çıkan sonuç:** hiçbir firmada dört şart (KVM ile Docker, imzalanabilir veri işleyen sözleşmesi, ISO 27001 belgesi, Türkiye'de ikinci yedek için S3) birlikte doğrulanamadı. Seçim yazılı cevaplardan sonra yapılabilir. 8 GB'de en düşük dolar liste fiyatı Radore RAM-Core ($10,5; tek çekirdek), sonra İlkbyte Cloud III ($21,99; NVMe değil); birden çok çekirdekli NVMe seçeneklerinde en düşük Radore Disk-Elite ($29,5). TL fiyatlı Hostopya kur çevrilmeden kıyaslanmadı.

**Yayımlanmış, içeriği okunmamış dosyalar** (indirme ayrıca onay ister):
Netinternet [veri işleyen sözleşmesi](https://kova1.ni.net.tr/pdf/Netinternet_Tedarikci_Gizlilik_ve_KVK_Sozlesmesi.pdf) (207.688 bayt) ve [ISO 27001 sertifikası](https://kova1.ni.net.tr/pdf/Netinternet_27001_Sertifika.pdf) (873.907 bayt) · Radore [genel hizmet sözleşmesi](https://static.radore.com/documents/radore-web-genel-hizmet-sozlesmesi.pdf) (154.600), [gizlilik/KVKK ilkeleri](https://static.radore.com/documents/radore-web-gizlilik-kvkk-ilkeleri.pdf) (436.730), [ISO 27001](https://static.radore.com/pdf/certificates/Radore-27001-2026.pdf) (350.430). Bir araştırmacı, "indirme yok" talimatı gelmeden önce üç Radore dosyasına istek attı; gelen içerik atıldı, diske yazılmadı ve okunmadı.

### Firmalara gidecek metin (gönderimi OPS yapar)

**Eskidi (26 Kasım, ALT-228):** gönderilecek güncel metin ve alıcılar aşağıdaki "Asgari şartlar ve aday eleme" bölümündedir.

Konu: VentHub için sunucu bilgisi ve fiyat teklifi talebi

> Merhaba,
> VentHub için Türkiye'de barındırılacak, 8 GB ve 16 GB bellekli sanal sunucu seçeneklerini araştırıyoruz. Sunucuda Docker ile kendi barındırdığımız Supabase (PostgreSQL), Coolify ve bir Next.js uygulaması çalışacak; kişisel veriler Türkiye'de kalmalı.
> Aşağıdaki soruları yanıtlamanızı ve güncel fiyat teklifinizi rica ederiz. Bu ileti yalnız bilgi ve teklif talebidir; sipariş ya da ödeme taahhüdü içermez.
> [firmaya özel sorular]
> Teşekkürler.
> VentHub, [imza]

Yalnız sayfada cevabı bulunmayan sorular:

| Firma · adres | Sorular |
|---|---|
| Netinternet · bilgi@netinternet.com.tr, bilgi@ni.net.tr, bilgi@ilkbyte.com | 1) VDS III ve V ile İlkbyte Cloud III ve Enterprise I'in işlemci modeli nedir? 2) VDS diskleri SSD mi NVMe mi? 3) VDS port hızı ve garantili hız nedir? 4) Sanallaştırma KVM mi? 5) Liste fiyatlarına KDV dahil mi; yıllık ödemede fiyat nedir? 6) Yayımlanan veri işleyen sözleşmesi İlkbyte'ı da kapsıyor mu; sayfadaki boş alanların (süreler) imzalanacak değerleri nedir? 7) İlkbyte sayfalarında yurt dışı kaynaklı saldırıların yurt dışındaki merkezde engellendiği ve trafiğin ülke dışına çıkmadığı birlikte yazıyor; yurt dışındaki merkezde hangi veri (IP, trafik içeriği) işleniyor ve bu, veri işleyen sözleşmesinde nasıl yer alıyor? 8) Sitede Tier için iki farklı ifade var; geçerli bir Tier belgeniz var mı? 9) Türkiye'de S3 uyumlu depolama sunuyor musunuz, fiyatı nedir? |
| Turhost · satis@turhost.com | 1) VDS TR 4 ve 6'nın işlemci modeli nedir? 2) Disk NVMe mi, RAID düzeyi nedir? 3) Port hızı 200/400 Mbit mi 100 Mbit mi; trafik aşımında ne olur? 4) VDS TR'de sanallaştırma KVM mi; Docker çalıştırılabilir mi? 5) İndirim bitince yenileme fiyatı nedir? 6) Yedekler hangi merkezde tutulur? 7) Tier belgesinin numarası nedir; ISO 27001 belgeniz var mı? 8) İmzalanacak KVKK veri işleyen sözleşmesi metnini paylaşır mısınız? 9) Türkiye'de S3 uyumlu depolama sunuyor musunuz, fiyatı nedir? |
| Radore · satis@radore.com | 1) Disk-Elite, CPU-Elite ve 16 GB paketlerin işlemci modeli nedir? 2) RAID düzeyi nedir? 3) Port hızı ve trafik sınırı nedir? 4) Sanallaştırma KVM mi; Docker çalıştırılabilir mi? 5) Taahhüt indirimi geçerli mi, koşulu nedir? 6) Bulut sunucu ve yedekleri hangi veri merkezinde tutulur? 7) Veri merkezi için Tier belgeniz var mı, numarası nedir? 8) İmzalanacak KVKK veri işleyen sözleşmesi metnini paylaşır mısınız? 9) Türkiye'de S3 uyumlu depolama sunuyor musunuz, fiyatı nedir? |
| Hostopya · destek@hostopya.com, WhatsApp +90 850 309 88 67 | 1) VDS-5 ve VDS-8 diskleri NVMe mi SSD mi, RAID düzeyi nedir? 2) Port hızı yükseltilebilir mi, ücreti nedir? 3) Gold-4 için tanıtım sayfası ile sipariş paneli farklı; hangisi geçerli? 4) Yıllık ödeme fiyatı ve yenileme koşulu nedir? 5) Yedekler nerede tutulur, ücreti nedir? 6) Belgelerinizde DDoS filtreleme için Gcore'a yurt dışı aktarım yazıyor; bu kapatılabiliyor mu, kapatılırsa koruma nasıl sağlanır? 7) ISO 27001 ve Tier belgeleri kime ait, numaraları nedir? 8) İmzalanacak KVKK veri işleyen sözleşmesi metnini paylaşır mısınız? 9) Türkiye'de S3 uyumlu depolama sunuyor musunuz, fiyatı nedir? |

### Bugünkü servislerin veri haritası (2026-11-26)

| Servis | Ne veri tutuyor ya da alıyor | Nerede | Kanıt | Yerine ne konabilir (öneri, ölçülmedi) |
|---|---|---|---|---|
| Supabase | veritabanı, kimlik, dosya, sunucu fonksiyonları: müşteri verisinin ana deposu | `eu-central-1` (Frankfurt) | proje listesi, 26 Kasım | Türkiye'deki sunucuda self-host Supabase |
| DigitalOcean + Coolify (sitenin sunucusu) | uygulama trafiği ve sunucu kayıtları | Amsterdam | alan adının IP'si DigitalOcean [bölge listesinde](https://digitalocean.com/geo/google.csv) Amsterdam; bölge kodu AMS3 OPS bildirimi | Türkiye'deki sunucu ve Coolify |
| Resend | giden e-posta: alıcı adresi, ad, sipariş, teklif ve kargo bildirimi içeriği | ABD (25 Kasım kaydı, yeniden ölçülmedi) | `supabase/functions/` bildirim fonksiyonları | Türk e-posta gönderim sağlayıcısı ya da standart sözleşme |
| Sentry | hata kayıtları ve %5 izleme örneği; hata içeriğinde kişisel veri geçebilir (ölçülmedi) | Almanya alım noktası (`ingest.de`) | canlı sitenin paketindeki adres, 26 Kasım | Türkiye'deki sunucuda kendi hata toplayıcımız ya da sözleşme |
| Cloudflare | DNS; gelen e-posta yönlendirme (ileti içeriği geçer); R2'de ürün görseli ve katalog dosyaları | küresel ağ; R2 konumu ölçülmedi | barindirma-standard §B1, §B7 | gelen e-posta için Türk posta hizmeti; DNS ve açık ürün dosyaları ayrıca değerlendirilir |
| GitHub | kaynak kod, CI kayıtları ve çıktıları, derlenmiş imaj; müşteri verisi saklamak için kullanılmıyor | GitHub; konum ölçülmedi | `.github/workflows/` | kalabilir; CI çıktılarına kişisel veri girmemesi kuraldır |
| Vercel (kalıntı) | site buradan sunulmuyor; eski proje duruyor (içerdiği veri ve ortam değişkenleri ölçülmedi). `@vercel/analytics` bağımlılığı kodda | Vercel | canlı IP; barindirma-standard §B1, §B4 | proje silinir (geri alınamaz, Recep kararı), bağımlılık sökülür |
| iyzico | ödeme isteği: ad, soyad, e-posta, telefon, adres, IP | Türk ödeme kuruluşu; veri konumu ölçülmedi | `supabase/functions/iyzico-payment` | kalır; aktarım ve işleyen metni teyit edilir |
| Twilio (emirde yoktu) | SMS ve WhatsApp: telefon ve ileti metni | ABD (doğrulanmadı) | `supabase/functions/notification-service` | Türk SMS sağlayıcısı |
| Google Analytics (emirde yoktu) | rıza veren ziyaretçinin kullanım verisi | Google; konum ölçülmedi | `ConsentGatedAnalytics` | Türkiye'de barındırılan analitik ya da sözleşme |
| Google Drive (emirde yoktu) | şifreli veritabanı yedeği | Google; konum ölçülmedi | barindirma-standard §B1 | Türkiye'de ikinci firmanın S3 depolaması |

## Asgari şartlar ve aday eleme (2026-11-26, ALT-228)

Dayanak: yalnız firmaların kendi sayfaları (yukarıdaki ölçüm ve aynı gün yapılan eksik madde araması). Firmaya yazılmadı, dosya indirilmedi. **GEÇTİ** = sayfa şartı karşıladığını söylüyor; **KALDI** = sayfa karşılamadığını gösteriyor; **?** = bilinmiyor, soruya girer. "Bilinmiyor" firmanın hizmeti olmadığı anlamına gelmez.

### Şartlar ve dayanakları

| No | Şart | Dayanak | Niteliği |
|---|---|---|---|
| Ş1 | Tam sanal makine (KVM benzeri; OpenVZ ya da konteyner değil) ve Docker çalıştırma izni | Supabase [kendi sunucuda kurulum](https://supabase.com/docs/guides/self-hosting/docker) Docker ister; Coolify [root ya da sudo erişimli sunucu](https://coolify.io/docs/get-started/installation) ister | Docker ve root belgeden; "tam sanal makine" bizim çıkarımımız (konteyner tabanlı VDS'te Docker çalışmayabilir) |
| Ş2 | En az 8 GB RAM, 4 vCPU, 80 GB disk | Supabase belgesinde önerilen: 8 GB+, 4 çekirdek+, 80 GB+ SSD (asgari 4 GB, 2 çekirdek, 40 GB); Coolify ayrıca 2 çekirdek, 2 GB, 10 GB ister | önerilen düzey (pay bırakır) |
| Ş3 | Disk NVMe | belge yalnız SSD diyor | tercih (OPS emri) |
| Ş4 | Veri ve yedek Türkiye'de; DDoS ya da CDN yurt dışı aktarımı kapatılabilir | 6698 s. Kanun m.9 (yukarıdaki "Kural" tablosu) | hukuki hedef (Recep kararı: veri Türkiye'de) |
| Ş5 | İmzalanabilir veri işleyen sözleşmesi | 6698 s. Kanun m.12 (veri sorumlusu, veri işleyenle birlikte sorumlu; [mevzuat.gov.tr](https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6698&MevzuatTur=1&MevzuatTertip=5)) | hukuki güvence (kanun sözleşmeyi adıyla şart koşmaz; m.12/2 müşterek sorumluluk yükler) |
| Ş6 | ISO 27001 belgesi | kanuni zorunluluk değil | güvence tercihi (OPS emri) |
| Ş7 | Türkiye'de yedek hizmeti ya da S3 uyumlu depolama | barındırma yedek kuralı (ikinci kopya) | işletme zorunluluğu |
| Ş8 | Port: 1 Gbps güçlü tercih; 200 Mbps üstü kabul | Supabase ve Coolify belgelerinde port şartı yok | güçlü tercih, zorunlu değil (OPS kararı, 26 Kasım) |
| Ş9 | IPv4 adresi ve KDV'li kurumsal fatura | alan adı yönlendirmesi; muhasebe | işletme zorunluluğu (yasal KDV istisnalı e-fatura da muhasebeye uygundur) |

### Aday tablosu

| Şart | Netinternet SSD VDS III (8) ve V (16) | İlkbyte Enterprise I (16) | Radore 4 vCPU ve üstü (Disk-Elite, CPU-Elite, Disk-Infinity, CPU-Infinity) | Turhost VDS TR 4 (8) ve TR 6 (16) |
|---|---|---|---|---|
| Ş1 sanallaştırma türü | ? ([bilgi bankası](https://www.netinternet.tr/teknik-sorular) VDS için VMware Tools anıyor; tarihi yok) | ? (metinde "qcow2"; tür yazmıyor) | ? (sayfa verisinde "Proxmox VPS"; sanal makine mi konteyner mi yazmıyor) | GEÇTİ, genel sayfada "KVM" ([VDS nedir](https://www.turhost.com/vds-nedir/)); VDS TR sayfasında yok |
| Ş1 Docker | GEÇTİ | GEÇTİ ([Docker](https://www.ilkbyte.com/uygulamalar/docker)) | ? | ? |
| Ş2 RAM, vCPU, disk | GEÇTİ (4 ve 8 çekirdek; 80 ve 160 GB) | GEÇTİ (6 vCPU, 120 GB) | GEÇTİ | GEÇTİ |
| Ş3 NVMe | ? (kartta "Raid50 SSD", metinde "NVMe/SSD") | GEÇTİ | GEÇTİ | ? (kartta "SSD", genel metinde "NVMe") |
| Ş4 veri ve yedek Türkiye'de | GEÇTİ (Denizli, firma beyanı) | GEÇTİ (Denizli; Acronis yedeği İstanbul) | veri ve yedek GEÇTİ ("yurt dışına çıkmaz", "hizmetlerin tamamında Türkiye içerisinde" [beyanı](https://radore.com/tr/hizmetler/kvkk-uyumlu-sunucu-bulut)); yedek şehri ? | ? (sunucular Türkiye'de, fakat [kullanıcı sözleşmesi](https://www.turhost.com/yasal/kullanici-sozlesmesi/) firmanın ve iş birliği yaptığı üçüncü kişilerin kişisel veriyi yurt dışına aktarabileceğini yazıyor); yedek yeri ? |
| Ş4 yurt dışı aktarım kapatılabilir | ? ([ağ sayfası](https://www.netinternet.tr/altyapimiz/network-altyapisi) yurt dışı temizleme merkezi diyor, KVKK sayfası yurt içi operatör diyor) | ? (yurt dışı saldırılar yurt dışında filtreleniyor; kapatma yolu yazmıyor) | ? ([güvenlik sayfası](https://radore.com/tr/hizmetler/guvenlik) DDoS için Cloudflare anıyor; pakette varsayılan mı yazmıyor) | ? |
| Ş5 veri işleyen sözleşmesi | GEÇTİ, çekinceli (sayfada boş taslak alanları; dosya okunmadı) | ? (metinde İlkbyte adı geçmiyor; tüzel kişi aynı) | ? (yalnız "veri işleyen sıfatıyla" beyanı) | KALDI (yasal sayfalarda imzalanacak sözleşme bulunamadı) |
| Ş6 ISO 27001 | GEÇTİ (2022, no IS-190122; kapsam okunmadı) | ? (kendi metni 2013 sürümü, numara yok) | GEÇTİ (sayfada "ISO 27001"; sürüm ve numara doğrulanmadı, dosya indirilmedi) | KALDI (ana sayfa, hakkımızda, yasal, sunucu sayfalarında geçmiyor) |
| Ş7 Türkiye'de yedek ya da S3 | GEÇTİ (ücretli yedek) | GEÇTİ | hizmet var; ülke Türkiye (genel beyan), şehir ve ücret ? | hizmet var, yeri ? |
| Ş8 port | ? | GEÇTİ (1 Gbps; 100 Mbps garantili) | ? (süresi geçmiş 24.02-30.04.2026 kampanya koşulunda "100 Mbps simetrik") | TR 6 400 Mbit kabul aralığında; TR 4 200 Mbit sınırda; 1 Gbps yok ([kart](https://www.turhost.com/sunucu/vps-tr-sunucu/)) |
| Ş9 IPv4 | GEÇTİ (1 adet) | GEÇTİ ([1 IPv4, 1 IPv6](https://www.ilkbyte.com/kiralik-sunucu-paketlerimiz/enterprise-sunucu)) | ? | ? |
| Ş9 KDV'li fatura | e-fatura GEÇTİ ([2022 duyurusu](https://www.netinternet.tr/blog/oedeme-ve-faturalandirma-islemleri-hakkinda-degisiklik): ödemeden sonra 7 gün içinde); KDV oranı ? | e-fatura GEÇTİ; sunucu hizmeti 4691 sayılı Kanunla KDV'den muaf ([2018 yazısı](https://www.ilkbyte.com/bulut-sunucu-bilgi-bankasi/ilkbyte-saatlik-sunucu-ucretlendirmesi-ve-vergilendirme-hakkinda-bilgiler)), istisnanın sürdüğü sorulur | fiyata KDV eklenir ([sayfa](https://radore.com/tr/hizmetler/bulut-sunucu): "Fiyatlara KDV dahil değildir", sepette %20); e-fatura ? | KDV siparişte eklenir (kullanıcı sözleşmesi); e-fatura ? |
| **Sonuç** | **Aday** | **Aday** (yurt dışı filtreleme cevaplanmadan karar yok) | **Aday** | **Elendi (Ş4, Ş5, Ş6)** |

### Elenenler

| Firma ya da paket | Gerekçe | Kaynağı |
|---|---|---|
| Hostopya (canlı ortam) | port 100 Mbps paylaşımlı; DDoS ve içerik dağıtımı için Gcore ve Cloudflare'a yurt dışı aktarım | kendi ölçümümüz ([VDS](https://hostopya.com/vds-sunucu), [KVKK belgeleri](https://hostopya.com/kvkk-belgeleri)) |
| Hostopya (canlı ortam), ek | işlemci Xeon E5-2680 v4 (2016); disk paylaşımlı | Recep'in araştırması (işlemci adı sayfada da yazıyor; "paylaşımlı disk" tarafımızdan ölçülmedi) |
| İlkbyte Cloud III (8 GB) | disk NVMe değil (Ş3) | ölçüm |
| Radore RAM-Core ve RAM-Advance | 1 ve 2 çekirdek (Ş2) | ölçüm |
| Turhost VDS TR 4 ve TR 6 | Asıl gerekçe: [kullanıcı sözleşmesi](https://www.turhost.com/yasal/kullanici-sozlesmesi/) kişisel verinin yurt dışına aktarılabileceğini yazıyor (Ş4); ISO 27001 belgesi ve imzalanacak veri işleyen sözleşmesi sayfalarda bulunamadı (Ş6, Ş5). İkincil: port 200 ve 400 Mbit, 1 Gbps yok (Ş8) | ölçüm. 1 Gbps sanal pakette yalnız 64 GB'lik VDS TR 10 ve üstünde (liste $198,23); [fiziksel sunucuda](https://www.turhost.com/sunucu/dedicated-server/) stoktaki en küçük model 32 GB E65 (liste $219,77, ilk 3 ay $79,99; disk E-SSD, NVMe değil). 8 ve 16 GB için 1 Gbps yolu bulunamadı; sipariş panelindeki ek port seçeneği ölçülmedi. |

### Güncel mesaj (yalnız adaylar; gönderimi OPS yapar)

Konu: VentHub için sunucu şartları ve fiyat teklifi talebi

> Merhaba,
> VentHub için Türkiye'de barındırılacak 8 GB ve 16 GB bellekli sanal sunucu arıyoruz. Sunucuda Docker ile kendi barındırdığımız Supabase (PostgreSQL), Coolify ve bir Next.js uygulaması çalışacak. Asgari şartlarımız: tam sanal makine, en az 4 vCPU ve NVMe disk, veri ve yedeğin Türkiye'de kalması, imzalanabilir KVKK veri işleyen sözleşmesi, ISO 27001, tercihen 1 Gbps (en az 200 Mbps üstü) port.
> Aşağıdaki soruları yanıtlamanızı ve güncel fiyat teklifinizi rica ederiz. Bu ileti yalnız bilgi ve teklif talebidir; sipariş ya da ödeme taahhüdü içermez.
> [firmaya özel sorular]
> Teşekkürler.
> VentHub, [imza]

| Firma · alıcı | Sorular |
|---|---|
| Netinternet ve İlkbyte (tek ileti) · bilgi@netinternet.com.tr, bilgi@ni.net.tr, bilgi@ilkbyte.com | 1) SSD VDS III, V ve İlkbyte Enterprise I'de hipervizör nedir (VDS için VMware mi), tam sanal makine mi? 2) VDS III ve V diskleri NVMe mi? 3) VDS III ve V'te port 1 Gbps mi, garantili hız nedir? 4) VDS fiyatlarına KDV ekleniyor mu; İlkbyte sunucu hizmetindeki 4691 sayılı Kanun KDV istisnası bugün de geçerli mi? 5) DDoS koruması için yurt dışındaki merkeze hangi veri gidiyor; VDS ve İlkbyte için bu aktarım kapatılabiliyor mu, kapatılırsa koruma nasıl sağlanır? 6) Yayımlanan veri işleyen sözleşmesi İlkbyte hizmetlerini de kapsıyor mu; sayfadaki boş alanların (süreler) imzalanacak değerleri nedir? 7) IS-190122 numaralı ISO 27001 belgenizin kapsamı İlkbyte'ı da içeriyor mu? |
| Radore · satis@radore.com | 1) Disk-Elite, CPU-Elite, Disk-Infinity ve CPU-Infinity'de hipervizör nedir; tam sanal makine mi, konteyner mi? 2) Docker çalıştırılabilir mi? 3) Bu paketlerde port hızı nedir, 1 Gbps sunuluyor mu? 4) IPv4 adresi dahil mi? 5) Kurumsal e-fatura kesiyor musunuz? 6) Yedekler hangi şehirde tutulur, pakete dahil mi, ücreti nedir? 7) Bulut sunucuda DDoS koruması Cloudflare üzerinden mi geçiyor; yurt dışına veri aktarımı kapatılabiliyor mu? 8) İmzalanacak KVKK veri işleyen sözleşmesi metnini paylaşır mısınız? 9) ISO 27001 belge numaranız ve kapsamı nedir? |

Turhost ve Hostopya'ya ileti gitmez. Yukarıdaki 26 Kasım soru tablosunun yerini bu liste aldı.

## Firma cevapları, kurumsal bulut ve yedek düzeni (2026-11-27, ALT-233 / OPS-398)
Kaynak: 26 Kasım teklif iletilerine gelen yazılı cevaplar (Recep'in e-posta kutusu) ve ALTYAPI araştırması (resmî sayfalar, dört kilit iddia ikinci ajanla doğrulandı).

| Konu | İlkbyte / Netinternet (yazılı, 27 Kas) | Radore (yazılı, 26 Kas) |
|---|---|---|
| Sanallaştırma | İlkbyte KVM, Netinternet VDS VMware | KVM, tam sanal makine, Docker serbest |
| Disk | Netinternet VDS SATA SSD (RAID50) | NVMe |
| Port | Garanti 100 Mbit | 100 Mbit; 1 Gbps ayda 9.900 TL ek |
| KDV | Fiyatlar KDV dahil; İlkbyte'ta KDV istisnası sürüyor | Fiyatlar KDV hariç |
| DDoS | Yurt içi saldırı trafiği Türkiye'de, yurt dışı kaynaklı trafik yurt dışındaki merkezde temizlenir | Pakete dahil değil, ücretli; üçüncü taraf yok |
| Yedek | — | Türkiye'de; işletim sistemi başına ayda 10 $ + her 10 GB için 0,40 $ |
| Veri işleyen sözleşmesi | Sözleşme İlkbyte'ı da kapsar (güncel PDF ekte geldi) | Yalnız 12 ay taahhütlü yönetilen hizmette taraf olur; yönetilmeyen sunucuda yok |
| ISO 27001 | Tüm hizmetler için geçerli | Var (sertifika sayfası) |
| Paket (16 GB) | İlkbyte Enterprise I 48 $/ay | Disk-Infinity 49,50 $/ay + KDV |

Netinternet VDS (VMware ESXi) 4-5 Ekim 2026'da fidye saldırısıyla yaklaşık 29,5 saat kesildi (status.ni.tr/maintenance/902); VDS elendi. bilgi@netinternet.com.tr adresi geri döndü (550), cevap satis@ni.net.tr üzerinden geldi.

Kurumsal bulut: Turkcell Sanal Veri Merkezi fiyat yayımlamıyor (teklif), VMware tabanlı; Türk Telekom Bulut sanal sunucu 400-450 TL'den, 12 ay taahhüt. İkisinde SLA yüzdesi ve veri işleyen sözleşmesi sayfada bulunamadı; Şikâyetvar'da bulut sunucuya özgü kayıt 0. Yazılı teklif olmadan kıyaslanamaz.

Yedek (3-2-1): canlı veritabanı 279 MB, depolama 36 MB (ölçüldü). İkinci kopya sunucuda şifreli artımlı depo (pgBackRest ya da wal-g; Supabase imajında yok, yan konteyner gerekir), sürekli açık yerel cihaz her gece değişeni çeker (Synology DS124 + 2 TB yaklaşık 18-20 bin TL tek sefer, satıcı fiyatı). Üçüncü kopya Türkiye'de nesne deposu (DT Cloud 0,04 $/GB, dönem yazmıyor) ya da İlkbyte Acronis (teklifle). Yerel cihaz için tam disk şifreleme, kilitli oda, erişim kaydı, uzaktan erişimde iki aşamalı doğrulama. Geri yükleme süresi ölçülmedi.

Google Drive: kişisel hesap şartlarında veri işleme sözleşmesi yok; yurt dışı veri merkezinde tutmak aktarım sayılır (Kurul 2022/249). Şifreli yedekte anahtar bizdeyse aktarım sayılmaz diyen Kurum metni bulunamadı. Google Cloud DPA'da Türkiye faturalı müşteri için Türk standart sözleşmesi var, bildirim müşterinin yükümlülüğü. Hüküm: kişisel Drive yedek kopya sayılmaz; bugünkü şifreli DB yedeği yeni düzen kurulunca Türkiye'deki kopyaya taşınır.

Hüküm (2026-11-27): ana sunucu İlkbyte önerilir; Turkcell ve Türk Telekom yazılı teklifi Recep kararı bekliyor. Şirket kurulmadan imza ve sipariş yok.
