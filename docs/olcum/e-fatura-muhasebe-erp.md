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
| Lisans | AGPL, tüm modüller ücretsiz | LGPL; ücretsiz Online tek uygulama, API yok | GPL |
| TR hesap planı | Çekirdekte (v15.29) | l10n_tr var; tam raporlar Enterprise | YOK |
| e-Fatura | Topluluk: Turkish-Delight (Logedosoft, 25 yıldız) | Resmî Nilvera modülü Enterprise'a taşındı | Tek kişilik İşNet modülü |
| Sunucu | AYRI (Frappe Cloud $5–20/ay ya da VPS 4–8 GB) | AYRI (VPS 4 GB) | AYRI (hafif) |
Hetzner ~€4–7/ay; bakım (yedek, güncelleme) bize kalır.

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
