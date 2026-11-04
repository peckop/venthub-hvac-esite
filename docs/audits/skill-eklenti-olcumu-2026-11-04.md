# Marketing ve Small Business eklentileri: kurmadan içerik ölçümü (YTN-10)

Tarih: 2026-11-04. Yöntem: salt okuma araştırmacı; kaynak depo okundu, hiçbir şey kurulmadı. Kural: "bizde var" üstünlük gerekçesi değildir; çakışma yan yana koşumla değil açıklama okumasıyla işaretlendi (aşağıdaki çekince).

## Kaynak

| Eklenti | Kaynak | Sürüm | Lisans |
|---|---|---|---|
| Marketing | github.com/anthropics/knowledge-work-plugins/tree/main/marketing | 1.2.0 | Apache-2.0 (klasörde LICENSE okundu) |
| Small Business | github.com/anthropics/knowledge-work-plugins/tree/main/small-business | 1.35.1 | klasörde LICENSE yok; kök LICENSE ölçülmedi |

Yerel kurulum: iki eklenti de bu makinede kurulu değil (`installed_plugins.json` ve `enabledPlugins` içinde yok, oturum skill listesinde önek yok). Masaüstü eklenti dizinindeki durum ölçülemedi.

## Marketing (8 skill, name+description toplamı 2.692 bayt)

| Skill | Açıklama baytı | İş | Bizdeki karşılık |
|---|---|---|---|
| brand-review | 333 | metni marka sesine göre inceler | çakışmıyor |
| campaign-plan | 337 | kampanya brifi | çakışmıyor |
| competitive-brief | 305 | rakip ve konumlandırma karşılaştırması | kısmen research-web |
| content-creation | 278 | kanal şablonları, başlık formülleri | write-seo-geo-content |
| draft-content | 323 | blog, sosyal, bülten taslağı | write-seo-geo-content |
| email-sequence | 343 | çok e-postalı akış metni | çakışmıyor |
| performance-report | 332 | kanal metrikleriyle rapor | çakışmıyor |
| seo-audit | 329 | SEO denetimi | searchfit-seo:seo-audit (kurulu) |

Ek yük: 13 MCP girdisi (11 uzak HTTP, OAuth gerektirir).

## Small Business (44 skill, name+description toplamı 35.441 bayt)

Tek başına oturum listesi tavanını (27.136 bayt) aşıyor (yaklaşık %131). Finans, satış, pazarlama, müşteri, operasyon, brifing ve kurulum kategorilerinde 44 skill; ödeme ve muhasebe bağlayıcılarıyla (Stripe, PayPal, QuickBooks, Xero ve benzerleri) 35 uzak MCP girdisi. Bizim işimizle (HVAC e-ticaret sitesi geliştirme filosu) örtüşen tek skill seo-ai-visibility (geo-fundamentals ile kısmen); geri kalanı bu filonun işi değil.

## Hüküm

| Eklenti | Hüküm | Gerekçe |
|---|---|---|
| Small Business | ALMA | tek başına tavanın %131'i; iş alanı dışı; 35 ödeme/muhasebe bağlayıcısı |
| Marketing (eklenti olarak) | ALMA | 3 skill zaten bizde ya da kurulu searchfit-seo'da; 13 OAuth bağlayıcı |
| Marketing / email-sequence | ihtiyaç doğarsa tek skill uyarlanır | çakışmasız, 343 bayt; bugün e-posta akışı işi yok, bütçe payı ~17 bayt |

## Çekinceler

- İçerik ana daldan (main) okundu; dizin kaydındaki sabitlenmiş commit'lerle (marketing d900840, small-business 2574e29) birebir doğrulanmadı.
- Marketing README'si beş skill adı ve yedi komut sayıyor, skills klasöründe sekiz farklı ad var; README eskimiş görünüyor, sayılar klasörden alındı.
- Small Business için bayt değerleri ölçüldü, işlevler README kategorisinden yazıldı (tek tek açıklama okunmadı).
- Çakışma işaretlemesi açıklama okumasıdır; "aynı iş" iddiası için yan yana koşum yapılmadı. Bu belge al/alma hükmünü çakışmaya değil bütçeye, iş alanına ve bağlayıcı yüküne dayandırır.
