# Ölçüm defteri: e-Fatura / e-Arşiv / muhasebe / ERP / sunucu

Sahibi: OPS · Son doğrulama: 2026-09-29 · Kaynak: Recep 09-29 "önceki ve şimdiki ölçümleri bir md'de birleştir"
Son ölçüm: 2026-09-29 (OPS, 3 Sonnet web araştırması). Bağlam: ŞİRKET KURULMADI, muhasebe programı yok, tek operatör, az sipariş (bkz. sirket-kurulmadi-satis-hazirligi).

## Yasal zorunluluk (kaynak: 509 Sıra No VUK Genel Tebliği mevzuat.gov.tr; TÜRMOB sirküler 12.01.2026/25)
| Konu | Sonuç |
|---|---|
| e-Arşiv | 1.1.2026'dan e-Fatura mükellefi olmayanlar tutara bakmadan e-Arşiv keser (bilanço esaslı şirket hep; basit usul 3.000 TL altı kâğıt 31.12.2026'ya kadar). BAŞLANGIÇTA ZORUNLU. |
| İnternet satışı e-Arşiv'i | Faturada "Bu satış internet üzerinden yapılmıştır." + site, ödeme şekli/tarihi, taşıyıcı (Tebliğ IV.2.4.5). Teslimden en geç 7 gün (VUK 231/5). |
| e-Fatura | İnternet satışında brüt 500 bin TL (ertesi yılın 1 Temmuz'u, Tebliğ IV.1.4); genel eşik 3 milyon TL. İlk yıl "3 ay içinde geçiş" kuralı yalnız aracı hizmet sağlayıcılar için (ikincil kaynak genelliyor, metinle uyuşmuyor) → mali müşavire YAZILI teyit. |
| e-İrsaliye | 10 milyon TL üstü (ikincil kaynak); başlangıçta gerekmez. |
| Ceza | Kâğıt fatura özel usulsüzlük ilk tespit 17.000 TL. |
| Ön koşul | Şirket + mali mühür ya da e-imza. |

## Kim yapabilir
| Yol | Sonuç |
|---|---|
| GİB e-Arşiv portalı | Ücretsiz, ELLE; kamuya açık API YOK; ~500 fatura/ay. |
| Portalı otomasyonla taklit (mlevent/fatura, n8n+tarayıcı) | Resmi değil; portal değişirse sessiz kayıp → OPS önermez. |
| Kendi entegratörümüz / doğrudan entegrasyon | GİB izni + bilgi güvenliği belgesi; küçük şirkete gerçekçi değil (bilgi; doğrulama araştırması 09-29 sürüyordu → sonucu buraya eklenecek). |
| Yetkili entegratör / API'li ön muhasebe | Otomasyonun tek yasal yolu. İyzico kendiliğinden fatura KESMEZ: ödeme onayında bizim sunucu tarafı API'yi tetikler. |
| Fatura üretimi, tetik, e-posta, arşiv, panel | BİZİM sistem (Supabase + n8n + kod). Mevcut: order_invoices manuel defter + AdminInvoicesPage (0 satır). |

## Programlar (fiyatlar ikincil kaynak, KDV hariç, 09-29)
| Program | Not |
|---|---|
| Paraşüt | e-Fatura+Ön Muhasebe 940 TL/ay (yıllık 11.280); API v4 stok/ürün/fatura/webhook; kontör 10,78–15,70 TL (bir kaynakta paket ~1.320 TL/yıl — çelişkili, teyit). |
| BizimHesap | 870–1.100 TL/ay; kontör ~0,99 TL; API dar (sipariş/fatura ekleme, stok okuma). |
| Logo İşbaşı | e-ticaret 49,90 TL/ay, 1000 kontör/yıl; API belgesi girişli (ölçülmedi). |
| Nilvera, Uyumsoft, Sovos, eLogo | Doğrudan entegratör API'si; fiyat teklifle / bulunamadı. |

## ERP (ERPNext / Odoo CE / Dolibarr)
| | ERPNext | Odoo CE | Dolibarr |
|---|---|---|---|
| Lisans | AGPL, tüm modüller ücretsiz | Community LGPL-3; Online Standard planında API yok, kendi sunucu ve harici API yalnız Custom planında (26 Kasım düzeltmesi aşağıda) | GPL |
| TR hesap planı | Çekirdekte (v15.29) | l10n_tr var; mali tablolar, banka mutabakatı, l10n_tr_reports ve e-Defter Community'de yok | YOK |
| e-Fatura | Topluluk: Turkish-Delight (Logedosoft, 25 yıldız) | Resmî Nilvera modülleri 19.0 Community'de LGPL-3; Enterprise'a taşınma yalnız 20.0'da | Tek kişilik İşNet modülü |
| Sunucu | AYRI (Frappe Cloud $5–20/ay ya da VPS 4–8 GB) | AYRI (VPS 4 GB) | AYRI (hafif) |
Hetzner ~€4–7/ay; bakım (yedek, güncelleme) bize kalır.

### Düzeltme 2026-11-26 — Odoo Community ve Enterprise ayrımı (OPS-413)
Kaynak: OPS-413 ölçümü, 26 Kasım, ops-arastirmaci. Yukarıdaki tablonun Odoo sütunu bu ölçümle düzeltildi; Hüküm bölümleri değişmedi.
- **e-Fatura modülleri:** "resmî Nilvera modülü Enterprise'a taşındı" cümlesi yalnız Odoo 20.0 için doğru. 19.0 Community'de l10n_tr_nilvera, l10n_tr_nilvera_einvoice, l10n_tr_nilvera_einvoice_extended, l10n_tr_gib_invoice_scenarios ve l10n_tr_nilvera_edispatch LGPL-3 olarak duruyor. Taşıma 20.0 dalında b7786f2669 commit'iyle yapıldı (2026-09-15). 19.0 desteği Eylül 2028'e kadar sürüyor (planlı).
- **Community'de olmayanlar:** mali tablolar (account_reports), banka mutabakatı (account_accountant), l10n_tr_reports ve e-Defter. **Community'de olanlar:** dönem kilitleri ve kilit istisnası (account/models/company.py, account_lock_exception.py).
- **Fiyat** (odoo.com/pricing, 26 Kasım, EUR, kullanıcı başına aylık): Standard 11,90–14,80, yalnız Online, API yok. Custom 22,90–27,90; kendi sunucuda kurulum ve harici API yalnız bu planda.
- **Ürün kaydı:** Odoo'nun stock modülü kendi product tablosuna bağlı. Stok Odoo'da tutulursa ürün ana kaydı iki yerde olur.
- **19.0 için üçüncü taraf modüller:** Birfatura e-Fatura 250 € (AGPL), Uyumsoft 149 €, Viyug 149 €, mali tablo modülü 119 €. İzibiz modülü yalnız 18.0'da var. OCA'nın 19.0 dalı boş.

## Hüküm (09-29)
Başlangıç: API'li ön muhasebe ya da kontörlü entegratör + bizim sistemden otomatik tetik; ERP ERKEN. ERP tetikleyicileri: hacim artışı, 2. kişi, gerçek satınalma/depo/teknik servis → o gün ilk aday ERPNext (Frappe Cloud). Mali müşavir: şirket türü, defter usulü, e-Fatura takvimi (yazılı).
## Ölçülmedi
Paraşüt/BizimHesap API oran sınırı ve paket kapsamı (deneme hesabı), kontör-başı entegratör fiyatları (araştırma sürüyordu), Turkish-Delight güncelliği.
## Yeniden ölçme tetikleyicisi
Şirket kuruluşu tamamlanınca; entegratör seçimi öncesi deneme hesabı; mevzuat değişikliği (GİB duyurusu); yıllık ciro 500 bin TL'ye yaklaşınca.

## EK 09-29 — "kendimiz çözebilir miyiz" ölçümü
- Doğrudan entegrasyon (Tebliğ V.1.3) yasal ama GİB izni + sermaye/satış/BT şartları + test süreci; özel entegratörlük ayrıca rapor, Türkiye'de donanım, mali mühür+zaman damgası (ISO 27001/22301/20000 ikincil kaynak). Küçük şirket için GERÇEKÇİ DEĞİL.
- Portal otomasyonu (mlevent/fatura): açık yasak bulunamadı; resmi değil, SMS onayı insan adımı, imzalı fatura geri alınamaz, token IP'ye bağlı. Yalnız elle onaylı köprü olarak kabul edilebilir.
- Kontörlü entegratörler (KDV hariç): Mükellef 1000 kontör 999 TL (API doğrulanmadı) · Turkcell e-Şirket 1000/5.250 TL, zorunlu yıllık yok, REST · İzibiz 1000/6.165 TL + 10.000 TL kurulum · Uyumsoft 100/400 TL, SOAP · Nilvera REST/OAuth2 test ortamlı, e-Arşiv aktivasyonu ücretsiz, fiyat bulunamadı (fiyat artışı şikayeti tek kaynak) · faturaentegrator.com tek REST ile 15+ entegratör, kontör 1,63 TL'den. n8n hazır node YOK; REST olanlarda HTTP Request yeter.
- Mali mühür ~2.040 TL/3 yıl (aracı kaynak); şahıs firmasında e-imza ~1.440 TL/yıl. Entegratör yolunda kendi mali mührümüz gerekmez (entegratör imzalar); portal yolunda da gerekmez.
- HÜKÜM: fatura hazırlama/tetik/e-posta/arşiv BİZDE; GİB iletimi dışarıda; en ucuz yasal yol = yıllık paketsiz REST'li kontörlü entegratör (aday: Nilvera, Turkcell e-Şirket, Mükellef — yazılı teklif alınır). Küçük hacimde yılda birkaç yüz–birkaç bin TL.

## GÜNCELLEME 2026-11-24 — ERP kararı değişti
Sahibin kendi ERP'si Design Venthub New içinde geliştirildi (ERP ve Mağaza iki uygulama, tek kabuk; 4 Kasım kararı: ayrı satılır). Hüküm: **hazır ERP (ERPNext/Odoo) kurulmaz**; yönetici paneli, ERP ve müşteri paneli Design kodundan canlıya taşınır. Gerekçe: tek veritabanı (ürün, fiyat, stok, cari, teklif, sipariş iki sisteme bölünmez, eşitleme arızası yok), sektöre özel akış (fan seçimi, metraj, teklif, servis), ikinci teknoloji ve ayrı sunucu bakımı yok, satılabilir ürün. e-Fatura/e-Arşiv için entegratör kararı (yukarıdaki tablolar) geçerli. Risk: muhasebe çekirdeği yeni; para defterleri (ekstre, tahsilat, çek-senet, kasa) taşımada sona, değişmez kayıt + denetim izi, mali müşavir çıktıları önceden yazılı. Bu bölümle eski "ilk aday ERPNext" hükmü geçersiz.

## GÜNCELLEME 2026-11-26 — ERP satılacak, Odoo kurulmaz (OPS-413, Recep kararı)
- **Karar:** ERP satılacak. Kendi ERP'miz tek veritabanında kalır, Odoo kurulmaz. Gerekçe satılabilirlik: Odoo Enterprise abonelik olduğu için yeniden satılamaz; Community'de mali tablolar, banka mutabakatı ve e-Defter yok, 20.0'da e-belge modülleri de Enterprise'a taşındı (ölçüm: yukarıdaki 2026-11-26 Odoo düzeltmesi, ALT-229). Odoo'nun stok modülü kendi ürün tablosuna bağlı olduğu için ürün iki yerde tutulurdu.
- **Kapsam dışı:** mali tablolar ve e-Defter müşavirin programında kalır; biz fiş, fatura ve ekstreyi dışa aktarırız (2026-11-25 ekindeki üç dosya). e-belge kontörlü entegratörden kesilir.
- **Örnek alınacak:** Odoo Community'nin LGPL dönem kilidi (satış, alış, vergi, mali yıl, kesin kilit ve kilit istisnası) ile stok ve satınalma desenleri.
- **Yeniden ölçme tetiği:** müşavirsiz tam muhasebe ihtiyacı doğarsa ya da satma kararı değişirse.

## EK 2026-11-25 — para defteri çekirdeği (OPS-393)
Hazır çekirdek alınmaz; kendi şema: fiş başlığı + satırlar, ertelenmiş borç=alacak tetiği (Lefra deseni, MIT), UPDATE/DELETE yasağı, ters kayıt, dönem kilidi (ERPNext Accounting Period deseni). pgledger'dan (MIT, v0.9) idempotency, event_at, önceki/sonraki bakiye fikri. TigerBeetle fazla (ayrı küme). ERPNext lisansı GPL-3.0 (GitHub API; yukarıdaki "AGPL" düzeltildi). Müşavir aktarımı: müşavirin programı sorulur, o programın şablonu esas; dışa aktarım üç dosya: fiş (GİB elektronik muhasebe fişi alanları), fatura XML/PDF (UBL-TR 1.2.1), banka ekstresi. Tekdüzen Hesap Planı resmî kaynağı RG 26.12.1992 / 21447 mükerrer (taranmış PDF, makine okunur liste yok) → 3 haneli liste bir kez çıkarılır. Luca Excel/XML içe alıyor; Zirve/Mikro/Logo/ETA resmî şablonu bulunamadı.
