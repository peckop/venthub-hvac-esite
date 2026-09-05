# Belge çelişki ve mükerrerlik taraması — 2026-09-04 (v1)

Yöntem: NotebookLM "Venthub Proje Takip" defteri (13 demet: cetveller, planlar, ölçümler, arşiv, hafıza notları, Linear
dışa aktarımı, Design brief'leri) ile SERİ soru (tek konuşma, alan alan, 6 tur). Defter çıktısı ADAY bulgudur; her satır
OPS tarafından kod/DB/Linear/dosya metniyle doğrulandı ve DURUM sütunu ona göre yazıldı. Cetvel:
`docs/standards/proje-takip-defteri-standard.md` §4. Bu dosya deftere de yüklenir (manifest demet 11).

DURUM sözlüğü: **GERÇEK** (doğrulandı, düzeltme gerekir) · **GİDERİLDİ** (bugün düzeltildi) · **TAKİPTE** (Linear'da
zaten kayıtlı) · **KOD/VERİ İŞİ** (belge değil, uygulama bekliyor) · **YANLIŞ POZİTİF** (defter yanıldı; metin
ölçüldü, iddia tutmuyor) · **DÜŞÜK** (teori/ideal bölümü, çelişki değil).

## A. Ticari model, fiyat, teklif, kipler
| # | Bulgu | Kazanan | Düzeltilecek | DURUM |
|---|---|---|---|---|
| A1 | "K1 gereği sepet/ödeme YOK" (brief 7 m.70, içerik haritası, boşluk listesi) ↔ K1 "şirket kurulunca açılır, kod silinmez" | K1a (Recep 09-04) | geri-bildirim-9 ile Design'a gitti; hafıza + Linear K1a yazıldı | GİDERİLDİ |
| A2 | quote-standard v2 "misafir kabul yok, Q4 login şartı korunur" ↔ REC-117 "üyelik zorunlu değil" (Recep 09-01) | REC-117 | `docs/standards/quote-standard.md` §8 ve §14 | TAKİPTE (REC-117 kapsamında "cetvel Q4 hükmü güncellenecek" yazılı) |
| A3 | f5b-family plan EK4 "marka kartına fiyat/Teklif modeli" ↔ rendering-cache §2 "fiyat yalnız PDP" | 08-15 kararı | `docs/plans/f5b-family-architecture-plan.md` EK4 satırına "fiyat kısmı düştü" notu | GERÇEK (plan belgesi, düşük etki) |
| A4 | pricing-standard "Teklif Alın" ↔ K5 "tek fiil Teklif iste" | K5 | — | YANLIŞ POZİTİF: `grep "Teklif Al" pricing-standard.md` = 0 |
| A5 | brief §78 "/cart teklif listesine dönüşür (adres açık)" ↔ K 15:55 "/tr/teklif-listesi EKLE, /cart kalır" | 15:55 kararı | brief 7 §78 (eski boşluk listesi satırı) | GİDERİLDİ (brief 9 §78 yeni hâli yazdı) |
| A6 | checkout-payment-standard başlık "A/B kararı beklemede" ↔ aynı belge §6 "A: gömülü form (Recep 08-18)" | §6 | `docs/standards/checkout-payment-standard.md` satır 7 | GERÇEK (tek satır; sahip PRICING-STOK/ALTYAPI) |
| A7 | dealer-network §3 "storefront combined price list okur" ↔ K1 "bayi fiyatı hiçbir ekranda geçmez" | K1 (bayi hattı PARK) | — | DÜŞÜK: §3 kendi içinde "uygulanan ≠ ideal" diyor |
| A8 | quote-standard v2 §14 "talebiniz alındı e-postası v1'de yok" ↔ Ç10 "request_email_sent_at canlı" | Ç10 | `quote-standard.md` §14 tablosu | **YANLIŞ POZİTİF** (ALTYAPI ölçtü 09-05: §14 tablosunda o kesim YOK; belge çelişkiyi Ç10 + §12 + §14 girişinde üç yerde kapatmış; #1002) |
| A9 | dealer-blueprint §2 "iki çözücü aynı kurala iner" ↔ ground-truth 06-11 "iki uyumsuz çözücü" | plan hedef, ölçüm gerçek | — | KOD İŞİ (R2, bayi hattı PARK) |

## B. Katalog ve ürün verisi
| # | Bulgu | Kazanan | Düzeltilecek | DURUM |
|---|---|---|---|---|
| B1 | Sığınak level=1 (plan, t099) ↔ K3 "Sığınak ÜST kategori" | K3 (09-03) | DB: `shelter-ventilation` level=1 (ölçüldü 09-04) | KOD/VERİ İŞİ: K3 taksonomi geçişi Faz 2 (URUN; migration = Recep kapısı) |
| B2 | Kategori adresi `/tr/category/<slug>` (product-schema §7, taxonomy §4, slug-localization, rendering-cache §3) ↔ K3 kısa slug, /category/ kalkar | K3 | 4 cetvel, kod inince | KOD İŞİ + cetvel güncellemesi K3 uygulanınca (URUN); `grep "/category/"` taxonomy+schema = 0, rendering-cache'te var |
| B3 | Design "ürünü kategori altına model bazlı taşı" ↔ K3 ürün adresi kalır | K3 | brief metni | GİDERİLDİ (canlı-durum §3 zaten yazıyor) |
| B4 | model_code "zorunlu tekil köprü" (csv §2A, ingestion §1) ↔ t119: 543 kodun 41'i mükerrer | ölçüm | `csv-import-export-standard.md` §2A | GERÇEK; ingestion §1 zaten "tekil değil, Recep kararı bekliyor" yazıyor; csv §2A yazmıyor. Karar: Recep (bileşik anahtar mı, kırmızı mı) |
| B5 | seri bölüm başlığından türetildi (t099 EK.1) ↔ ingestion §3.1 yasak | §3.1 (08-27) | t099 arşiv notu | DÜŞÜK (ölçüm belgesi tarihçe) |
| B6 | image_url ↔ product_images SSOT | product-image-standard | `csv-import-export-standard.md` §2A image_url alanı | GERÇEK: CSV alanı "ithalat girdisi" olarak kalabilir ama "MİRAS, yeni yüzey bağlanamaz" notu yok |
| B7 | 3D vitrinde (3d-webgl, storefront-design §2.7) ↔ 09-01 3D kapalı | 09-01 | `3d-webgl-standard.md` başlığına "vitrinde KAPALI (bayrak)" notu | GERÇEK (cetvel kapalı yeteneği anlatmaya devam eder; başlık notu yeter) |
| B8 | description %95 sahte (ground-truth 06-21) ↔ PS-006 yasak | cetvel | veri | KOD/VERİ İŞİ (REC-56 içerik/derinlik) |
| B9 | "yeni slug İngilizce" ↔ TR alt-slug 301 için kalır | slug-localization | — | YANLIŞ POZİTİF: iki kural farklı şeyi söyler (yeni vs mevcut) |
| B10 | "375 ürün kökte" ↔ 365 dalda | katalog-sayım 09-03 | — | GİDERİLDİ (kategori-esleme 09-04 düzeltti) |

## C. Vitrin tasarımı ve sayfa mimarisi
| # | Bulgu | Kazanan | Düzeltilecek | DURUM |
|---|---|---|---|---|
| C1 | 3D "fark yaratan unsur" (CONTEXT/README vizyon, 3d-webgl) ↔ 3D kapalı | 09-01 | CONTEXT.md üretilmiş (NLM); README vizyon paragrafı | GERÇEK, düşük: README "3D" cümlesi "kapalı, bayrak arkasında" diye güncellenir (URUN kapsamı README? → OPS küçük PR) |
| C2 | PDP "7 dikey bölüm" (arşiv) ↔ K12 kabuk + katlı panel | K12 | — | YANLIŞ POZİTİF: arşiv klasörü (docs/archive) tarihçedir |
| C3 | ürün adresi kategori altına ↔ K3 | K3 | — | GİDERİLDİ (=B3) |
| C4 | "Teklif Al" (3d-showroom-ux-research, arşiv/araştırma) ↔ K5 | K5 | — | DÜŞÜK (araştırma belgesi) |
| C5 | **Kararlar K9 "5 sekme · Destek yaprağı · üstte yalnız logo+arama" ↔ 09-04 16:50/18:30 "4 sekme · İletişim · hesap sağ üst"** (belgenin kendi içinde) | 09-04 | Linear Kararlar K9 + K16 | GİDERİLDİ (OPS 09-04 akşam K9/K16 metnini güncelledi) |
| C6 | vaat-butunlugu "quickOrder" satırları | REC-94 | — | YANLIŞ POZİTİF: cetvel kaldırılanı tarihçe olarak yazıyor |
| C7 | arama ayrı sayfa (CONTEXT "kategori ve ürün arama sayfaları") ↔ K14 liste şablonu + şerit | K14 | CONTEXT üretilmiş | DÜŞÜK |
| C8 | matris eşiği tek başına (matris-gorunum §0) ↔ K13 iki kat | K13 | — | YANLIŞ POZİTİF: matris-gorunum §0 zaten "ham kural yetmiyor, iki kat" diyor |
| C9 | vaat-butunlugu "K9 mobil üstte yalnız logo+arama" ↔ 16:50 | 16:50 | `vaat-butunlugu-standard.md` K9 alıntısı | **YANLIŞ POZİTİF** (URUN ölçtü 09-05: alıntı belgede yok / güncel; düzeltme yapılmadı) |
| C10 | "Hesaplayıcılar index linki TBD" (arşiv) ↔ Ürün Seçici | 16:10 | — | YANLIŞ POZİTİF (arşiv) |

## D. İş yönetimi, işbirliği, altyapı
| # | Bulgu | Kazanan | Düzeltilecek | DURUM |
|---|---|---|---|---|
| D1 | work-tracking-ssot-standard v1.0 (06-20) "registry = work-order SSOT" ↔ is-kayit-duzeni (08-26) "Linear SSOT, registry arşiv" | is-kayit-duzeni | `docs/standards/work-tracking-ssot-standard.md` | GİDERİLDİ (bu PR: başlığa yürürlük notu; içerik tarihçe) |
| D2 | "DURUM-TAKIP KIBridge ile üretilir" ↔ "KIBridge kurulu değil" | ölçüm | aynı belge | GİDERİLDİ (D1 notu kapsar) |
| D3 | eski nlm paketi/ps1 betikleri referansı | notebooklm-py (08-17) | — | YANLIŞ POZİTİF: `grep jacob-bd|nlm-*.ps1` docs/standards = 0 |
| D4 | companion §C6 INV-DOC-3 kimlik çakışması, #640 dalında | 09-03 notu | `companion-doc-standard.md` §C6 | TAKİPTE (REC-118 parkta) |
| D5 | companion "tarihsel en yüksek sembol" ↔ §C8.3 | §C8.3 | — | YANLIŞ POZİTİF: cetvel düzeltmeyi kendisi taşıyor |
| D6 | tek turda build ↔ AXIOM 7 iki commit | AXIOM 7 | — | YANLIŞ POZİTİF (eski akış belgede yok) |
| D7 | multi-session-coordination "--sid zorunlu değil" | K6 | — | YANLIŞ POZİTİF: dosyada "sid" 9 geçiş |
| D8 | **"FAZ" kelimesi 4 ayrı katmanda** (SaaS Faz 1-4 · 15A üretim Faz 1-4 · admin göç Faz 0-6 · bayi R0-B2) | — | CLAUDE.md "Faz 1 bitti, Faz 2 park" = SaaS fazı; 15A brief'lerinde "Faz 1 kabuk" = üretim fazı | GERÇEK, KÖK SORUN: yeni kural — belgede/emirde "Faz" tek başına yazılmaz: **SaaS-F2 · 15A-F2 · ADMIN-F3 · BAYİ-R4**. Uygulama: bu PR cetvel §6; mevcut belgelere geriye dönük dokunulmaz, yeni yazımda zorunlu |
| D9 | deploy-build-skip ↔ gitattributes merge=ours | AXIOM 7 | `deploy-build-skip-standard.md` | TAKİPTE (REC-132) |
| D10 | PPR aktif (CONTEXT satır 59) ↔ kullanılmıyor | 08-15 | CONTEXT.md üretilmiş, elle not var (satır 61-64) | GİDERİLDİ (not var; üretilmiş metne dokunulmaz) |

## E. Güvenlik, kimlik, veri erişimi
| # | Bulgu | Kazanan | Düzeltilecek | DURUM |
|---|---|---|---|---|
| E1 | is_admin_user user_metadata dalı (t047 plan) ↔ A11 tek otorite | A11 (08-18) | — | GİDERİLDİ (plan uygulandı; belge plan tarihçesi) |
| E2 | autoMode.environment "repo PRIVATE" | PUBLIC (08-15) | — | YANLIŞ POZİTİF: dosyadaki 4 "private" geçişi `APP_PRIVATE_KEY` adı; "repo private" cümlesi 08-18'de temizlenmişti (hafıza notu doğru) |
| E3 | REC-51 "leaked password protection AÇ" ↔ audit G5 "ücretsiz planda yok" | audit | Linear REC-51 | GİDERİLDİ (REC-51 iptal, gerekçe yazıldı) |
| E4 | anon view yetkileri | T101 (08-19) | — | GİDERİLDİ (migration indi) |
| E5 | shipping-webhook fail-open | T025 (08-15) | — | YANLIŞ POZİTİF: cetvel "kapatıldı" diye yazıyor |
| E6 | Design erişim varsayımı | 09-04 ölçüm | — | GİDERİLDİ (hafıza + brief kuralları) |
| E7 | "sızan service_role" iddiası | audit 08-15: 0 commit | `memory/user-side-open-items.md` | GERÇEK, düşük: hafıza notuna "çürütüldü" satırı (OPS) |
| E8 | SaaS Faz 1 "BİTTİ" ↔ "stub, izolasyon yok" | ölçüm 06-11 | `docs/plans/venthub_saas_master_roadmap.md` | GERÇEK (plan başlığına "izolasyon R4'e bağlı" notu; SaaS park) |

## F. Eksik belge türleri (defterin önerisi, OPS süzgeci)
Yazılması meşru ve kayıtlı: `anonim-yazma-standard.md` (REC-117 kapsamı) · `db-metin-dil-cozumu-standard.md` (REC-108
borcu) · `hvac-calculation-standard.md` / `secim-motoru-standard.md` (T143 + bugünkü seçici işi; OPS borcu) · çoklu depo /
lot / rezervasyon (T129 §4; satış kipi sonrası). Yazılmayacak: customer-account-standard zaten var (v0.1).

## G. Bu turda yapılanlar
K9/K16 Kararlar metni düzeltildi (C5) · REC-51 iptal (E3) · work-tracking-ssot yürürlük notu (D1/D2) · "Faz" kapsam
belirteci kuralı cetvele (D8) · K1a + Anahtar ve Kip Haritası (A1) · bu rapor deftere.

## H. Sahiplere düşen (Linear: tek paket kaydı)
URUN: B2 (K3 uygulanınca 4 cetvel), C1 README cümlesi, ~~C9~~ (yanlış pozitif), B6/B4 csv §2A notları.
ALTYAPI/PRICING: A6 checkout-payment başlığı [GİDERİLDİ #1002], ~~A8~~ (yanlış pozitif), E8 SaaS plan notu [GİDERİLDİ #1002 — rapordan farklı: eksik olan R4 notu değil, 08-28 PARK kararıydı].
OPS: A3 plan notu, E7 hafıza notu, B7 3d-webgl başlık notu.
Recep kararı: B4 model_code bileşik anahtar mı / çakışma kırmızı mı (ingestion §1'de bekleyen soru).

## I. Düzeltme sonrası (2026-09-05, OPS)
İki bulgu sahiplerince **düzeltmeden önce ölçüldü** ve yanlış pozitif çıktı: **C9** (URUN) ve **A8** (ALTYAPI). Üçüncüsü
(**E8**) gerçekti ama raporun gösterdiği yerde değildi. Ortak kök sebep adayı: rapor ikizin cevaplarından üretildi, ikiz
**bayat küme master** okuyor (`standards_master.md` 09-03 derlenmiş, cetveller 09-04 değişmiş) → **REC-144** (küme master
tazelik paritesi). Kural (cetvel §4'e girecek): defter bulgusu **düzeltme emrine dönüşmeden önce** sahibi metni ölçer;
ölçmeden düzeltme YOK. Sayı: 50 aday → GERÇEK sayısı bu turla 2 azaldı.
