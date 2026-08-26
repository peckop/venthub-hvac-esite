# T134-VH Sentez — VentHub Teklif/Proje Kararları: Otonom mu, Config mi, Kullanıcıya mı?
> OPS-AUDIT sentezi, 2026-08-20. Girdiler: rapor-1 (açık-kaynak ERP, kod-doğrulamalı) + rapor-2 (CPQ/proposal + saha satışı).
> Recep gerekçesi: "ikimizin de fikrinin olmadığı alanda yanlış cevap üretmeyelim" — her öneri sektör kanıtına bağlı.

## Karar tablosu (T131/T130 tasarımlarına BAĞLAYICI öneri)

| # | Karar noktası | Sektör bulgusu | VentHub önerisi |
|---|---|---|---|
| 1 | Süre dolunca davranış | Yalnız ERPNext gerçek otomatik (günlük cron); Odoo/Dolibarr'da yıllardır açık boşluk; Proposify LAZY expiry (erişim anında) | OTONOM davranış + CONFIG değer: günlük cron (zamanlanmış-bakım modülümüz hazır) VE müşteri linki açıldığında ikinci kontrol (çift kapı: cron gecikse bile süresi dolmuş teklif kabul edilemez) |
| 2 | Kabul kimlik seviyesi | Sektör varsayılanı e-posta-linki (zayıf); DocuSign kademeli (code/SMS-OTP/kimlik) gönderen seçimiyle | Tabanımız sektörden GÜÇLÜ: login'li hesap zorunlu (mevcut). Eşik üstünde ek doğrulama = CONFIG + MÜŞTERİ-BAZLI (Recep 08-20 kararıyla örtüşür; DocuSign kademe deseni) |
| 3 | Kabul kanıt seti | Dolibarr: IP+damga+imza-görseli+kullanıcı (koda gömülü); PandaDoc/DocuSign: sertifika + chain-of-custody; hukuk: checkbox=imza eşdeğeri (ESIGN/UETA, Meyer v. Uber) | OTONOM (her kabulde otomatik): damga + kullanıcı kimliği + IP + REVİZYON NO + beyan-metni sürümü → audit log. Çizim imza GEREKMEZ (clickwrap yeterli, kanıtlı) |
| 4 | Onay eşiği | SF CPQ + ERPNext Authorization Rule: mekanizma platform sabiti, DEĞER tamamen config; hiçbir üründe insan-tanımsız eşik yok | Mekanizma OTONOM, değer CONFIG + müşteri-bazlı override (Recep kararı sektör deseniyle birebir doğrulandı) |
| 5 | Revizyon modeli | ERPNext amend zinciri (yeni belge + amended_from) en disiplinli; Odoo manuel-duplicate (zincirsiz, dağınık); Axelor PDF-sürüm; Dolibarr clone proje bağını KOPARIYOR (anti-örnek) | AMEND ZİNCİRİ: revizyon = yeni kayıt + önceki-revizyon bağı; proje/muhatap bağı KORUNUR (Dolibarr anti-örneğinden ders). Yalnız SON revizyon kabul edilebilir |
| 6 | Revizyonda eski link | Sektörde ÖLÇÜLEMEDİ (hiçbir üründe net davranış bulunamadı) | Cetvele BİZ yazacağız: eski revizyon linki "bu teklifin yeni sürümü var" sayfasına yönlenir, eski PDF portalda arşiv olarak görünür kalır |
| 7 | Fırsata/projeye çoklu teklif | Odoo+ERPNext SERBEST (kısıtsız, uyarısız); SF: Primary quote seçimi (kullanıcı); Dolibarr tek-muhatap kilidi (anti-örnek) | SERBEST + Primary benzeri "kazanan işareti" kullanıcıda; sistem BLOKLAMAZ |
| 8 | Çakışan/rakip teklif tepkisi | ÜÇ ERP'DE DE YOK; deal-registration deseni: varsayılan otonom kural (ilk-kayıt) + istisnada İNSAN HAKEMLİĞİ | UYARI + İNSAN KARARI: proje panosu "çakışan canlı teklif" uyarısı verir (otonom), kapatma/iptal kararı DAİMA kullanıcıda; otomatik iptal YOK. (Recep'in sorusu böylece sektör kanıtıyla cevaplandı) |
| 9 | Aynı projede farklı taraflara farklı fiyat | Sektör pratiği YOK (satıcı-sistemi uyarısı bulunamadı; alıcı tarafı disiplini var) | ÖZGÜN CETVEL: kompozör uyarır ("bu projede aynı ürün X'e %n farklı fiyatla teklifte"), BLOKLAMAZ — ticari karar kullanıcının |
| 10 | Çoklu-taraf-tek-proje (Zorlu Center senaryosu) | ENDÜSTRİ BOŞLUĞU — iki rapor bağımsız doğruladı: Dolibarr #13524 ("most companies need it", yıllardır açık) + bid-management'ta standart yok | FARK YARATAN ÖZELLİK: Satış Projesi (saha) nesnesi CRM'de; teklif→saha bağı + muhatap rolü (işveren/ana yüklenici/alt yüklenici/kiracı); RLS: her muhatap YALNIZ kendi teklifini görür, proje çatısını asla |
| 11 | Kabul→otomatik sipariş | SF CPQ: checkbox + admin-tanımlı tetik status; araya insan onayı konabilir | CONFIG: varsayılan = kabul sonrası TASLAK sipariş otomatik doğar (checkout'suz), sevke insan onayı; tetik koşulu yapılandırılabilir |
| 12 | Süre değeri | Şirket-ayarı (Odoo) / plan-bazlı üst sınır (PandaDoc) | CONFIG: global varsayılan + teklif-başına override |

## Türetilmiş sınır kuralları
- Her kritik dallanmada ya admin-kurulu kural ya insan hakemi — sektörde tam-otonom kritik karar YOK; biz de icat etmiyoruz.
- ERPNext'in iki deseni (expiry cron + Authorization Rule) mimarimize en yakın (zamanlanmış-bakım + config katmanı zaten var) — referans uygulama olarak T131'e işaret edilir.
- Dolibarr'ın delil-zinciri alan seti (date_signature/ip/name/user) veri modeline aynen aday; bildirim-eksikliği kusuru (#20204) bizde INV kapısıyla önlenir (kabul→bildirim zorunlu).
