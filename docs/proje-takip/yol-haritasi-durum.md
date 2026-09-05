# VentHub Yol Haritasi ve Durum — 2026-09-05T06:02:54Z (uretilmis; elle duzenlenmez; kaynak yol-haritasi.json)

Satir 23/40 · YESIL 15 · KIRMIZI 2 · KANITSIZ 6 · olculmemis kanit 21 (saglik olcusu; haftalik dusmeli) · canli OLCULMEDI

Renk KANITTAN turer: YESIL = kanitlar bekleneni verdi · KIRMIZI = belge celiskisi YA DA karar degisti (ikisi de gorunur, biri duzeltilir) · KANITSIZ = borc · YESIL* = olculen kanitlar yesil, bir kismi olculemedi. 'durum' sutunu BEYANDIR; renk beyanin kanitidir.

## 15A-F1

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-10 | YESIL | KAPALI-HAZIR | Yeni kabuk gezinmesi: header tek oge 'Teklif' + panel | #981 indi (09-04, Recep 'insin'); bayrak kapali, Recep onizleme sonrasi acilir (K16) | URUN | K16 · REC-129 | YESIL: YENI_KABUK_GEZINMESI = false (beklenen false)<br>YESIL: src/components/navigation/HeaderTeklifPaneli.tsx var (beklenen var) |
| YH-11 | KIRMIZI | KAPALI-HAZIR | Mobil alt sekme cubugu: 4 sekme (Ana sayfa · Urunler · Teklif · Iletisim) | K9 + K 09-04 18:30; ayni bayrakla acilir; DESIGN 09-05 Kabuk v2 'Hesap' sekmesi onerdi → Recep karari bekliyor | URUN · Recep | K9 · K 09-04 16:50/18:30 | KIRMIZI: sinav S06 = KIRMIZI<br>YESIL: src/components/navigation/MobilAltSekmeCubugu.tsx var (beklenen var) |
| YH-12 | KANITSIZ | PLANLI | Mobil header: hesap sag ust + akilli dil cipi | K 09-04 16:50 karari; DESIGN 09-05 'bildirim rozeti + dil Hesap'ta' onerdi → Recep karari bekliyor | URUN · Recep | K 09-04 16:50 | KANITSIZ: sinav S07 son kosumda yok |
| YH-13 | YESIL* | KAPALI-HAZIR | 3D urun gorunumu musteri yuzeyinde | K8 / vaat-butunlugu: teklif modunda vaat edilmez; admin onizleme bagli degil | URUN | K8 · REC-94 | YESIL: UC_BOYUT_MUSTERI_YUZEYINDE = false (beklenen false)<br>KANITSIZ: sinav S10 son kosumda yok |
| YH-14 | YESIL* | BEKLIYOR | Footer: marka logolari kalkar, 'Markalar' metin baglantisi kalir | Recep+Design+OPS ayni gorus (09-04 aksam); Design v16 turu ile kodlanir; bugun footer'da marka baglantisi var, logo yok mu olculur | DESIGN → URUN | K 09-04 aksam | KANITSIZ: sinav S12 son kosumda yok<br>YESIL: src/components/Footer.tsx desen /Routes\.brands\(\)/ var (beklenen var) |

## 15A-F2

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-15 | KANITSIZ | PLANLI | Kategori agaci 7 kategori · 26 dal · Siginak ust kategori · kisa slug | K3 (09-03); shelter-ventilation bugun level=1 (09-04 olcumu) → uygulanmadi | URUN | K3 | KANITSIZ: sinav S09 son kosumda yok<br>KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select slug, level from categories where slug='shelter-venti<br>KANITSIZ: canli olculmedi (--canli yok): https://venthub.com.tr/tr/fanlar |
| YH-16 | YESIL | PLANLI | Arama sonucu sayfasi /tr/arama (ekran 08) | K14: liste sablonu + arama seridi; bugun arama kayan katman (SearchOverlay), rota yok | URUN | K14 | YESIL: src/app/[lang]/arama yok (beklenen yok)<br>YESIL: src/components/SearchOverlay.tsx var (beklenen var) |
| YH-17 | YESIL* | YAPILIYOR | Urun Secici: tek sayfa, grup grup motor (ilk kanal fani), urun sayfasina entegrasyon EN SON | K17 + K18 (istisare, Recep 'karar' deyince kesinlesir); hesaplayicilar rotasi var, secici sayfasi Design A akisi | DESIGN → URUN | K17 · K18 | KANITSIZ: sinav S08 son kosumda yok<br>YESIL: src/app/[lang]/destek/hesaplayicilar/kanal var (beklenen var)<br>KANITSIZ: sinav S20 son kosumda yok |
| YH-19 | YESIL | PLANLI | Karsilastirma sayfasi /tr/karsilastir (ekran 11) | K10; rota yok | URUN | K10 | YESIL: src/app/[lang]/karsilastir yok (beklenen yok) |

## 15A-F3

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-18 | KANITSIZ | PLANLI | Liste sayfalari MATRIS gorunumu (kart/tablo/seri) | K13: 15A-F3; bugun yalniz kart | URUN | K13 | — (kanit yok) |

## GUVENLIK

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-50 | KANITSIZ | ACIK | Design (15A) yalniz OKUR: Supabase SELECT, Linear'a tur sonu yorumu | Recep 09-04 13:45 | OPS | K 09-04 13:45 | KANITSIZ: sinav S18 son kosumda yok |
| YH-51 | YESIL* | ACIK | Rol otoritesi user_profiles.role / app_metadata; raw_user_meta_data YASAK | auth-account A11; CLAUDE.md kural 12 | ALTYAPI | auth-account-standard A11 | KANITSIZ: sinav S19 son kosumda yok<br>YESIL: src/middleware.ts desen /raw_user_meta_data/ yok (beklenen yok) |

## KATALOG

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-20 | YESIL* | ACIK | Katalog: 374 urun / 32 aile / 5 marka prod'da; sayim tek kaynak betik | Kademe-2 F4 (08-11); REC-136 sayim betigi; karara giden sayi BETIKTEN gelir (09-04 dersi) | URUN | REC-136 | YESIL: scripts/katalog/katalog-sayim.mjs var (beklenen var)<br>KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select count(*) from products where deleted_at is null |

## SUREC

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-40 | YESIL | ACIK | Migration iceren PR yalniz Recep onayiyla birlesir (merge = prod'a otomatik) | CLAUDE.md kural 13; supabase-migrate.yml master'a otomatik uygular | OPS | CLAUDE.md 13 | YESIL: sinav S15 = YESIL<br>YESIL: .github/workflows/supabase-migrate.yml var (beklenen var) |
| YH-41 | YESIL* | ACIK | Is takibi SSOT = Linear; registry salt arsiv | 08-26 goc bitti (REC-42/53); work-tracking-ssot yururluk notu | OPS | is-kayit-duzeni-standard | KANITSIZ: sinav S17 son kosumda yok<br>YESIL: docs/standards/is-kayit-duzeni-standard.md var (beklenen var)<br>YESIL: docs/standards/work-tracking-ssot-standard.md desen /tek kaynağı \*\*Linear/ var (beklenen var) |
| YH-42 | KIRMIZI | ACIK | Belgeler icin kapi: hafiza sinavi (compact/resume donusu) | v1 09-04, v1.1 09-05; anahtar YAZILI kararlardan | OPS | proje-takip-defteri-standard §5 | KIRMIZI: scripts/nlm/hafiza_sinavi.py desen /beklenen_biri/ yok (beklenen var)<br>YESIL: docs/proje-takip/hafiza-sinavi-sonuc.md var (beklenen var) |
| YH-43 | YESIL | ACIK | Companion (yardimci belge) uretimi DONDURULDU; C4 bloklamaz | Recep 09-03: tasiyici kapali, kapi onleyemez cezalandirir; C5 ayni siniftan 09-05'te kirmizi (ALTYAPI'ya not) | ALTYAPI | Recep 09-03 | YESIL: src/__tests__/conformance/companion-dondurulmus.test.ts var (beklenen var)<br>YESIL: src/__tests__/conformance/companion-parity-coverage.test.ts desen /C5_TABAN = 0/ var (beklenen var) |

## SaaS-F1

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-30 | YESIL* | ACIK | Cok kiracili temel: tenant_id + RLS + tenantResolver (derleme anında sabit) | SaaS Faz 1 Foundation bitti (roadmap); kural 12 surer | ALTYAPI | venthub_saas_master_roadmap · CLAUDE.md kural 12 | KANITSIZ: sinav S13 son kosumda yok<br>YESIL: src/lib/tenantResolver.ts var (beklenen var)<br>YESIL: supabase/migrations desen /tenant_id/ var (beklenen var) |

## SaaS-F2

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-31 | KANITSIZ | PARK | White-label / kiraci ekle-cikar / kiraciya gore tema | Recep 08-28 (REC-88): oncelik kendi sirket + tek operator; yeniden acilis Recep karari | Recep | REC-88 | KANITSIZ: sinav S13 son kosumda yok<br>KANITSIZ: sinav S14 son kosumda yok |

## TICARI

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-01 | YESIL* | ACIK | Teklif kipi: fiyat gizli, teklif akisi acik | K1: sirket kurulmadan satis yapilmaz; fiyat yalniz urun detayda, kategori/kartta yok | Recep | K1 · K1a | KANITSIZ: sinav S03 son kosumda yok<br>YESIL: src/lib/pricing/quoteMode.ts desen /hide_price/ var (beklenen var)<br>YESIL: src/__tests__/conformance/storefront-fiyat-sizintisi.test.ts var (beklenen var) |
| YH-02 | YESIL* | KAPALI-HAZIR | Satis kipi: sepet · odeme · siparis · fatura · iade · kargo | K1a: YOK degil KAPALI; kodda var, tek anahtar; sirket kurulunca acilir (yeni tur degil, anahtar) | Recep (sirket kurulusu) | K1a · Anahtar ve Kip Haritasi | KANITSIZ: sinav S01 son kosumda yok<br>KANITSIZ: sinav S02 son kosumda yok<br>YESIL: src/app/[lang]/checkout/page.tsx desen /NEXT_PUBLIC_ODEME_ACIK/ var (beklenen var)<br>YESIL: src/app/[lang]/cart/page.tsx var (beklenen var) |
| YH-03 | KANITSIZ | PLANLI | Misafir teklif: uyelik zorunlu degil | REC-117 (09-01): anon INSERT icin RLS migration gerekir → Recep kapisi | Teklif Akisi seridi | REC-117 | KANITSIZ: sinav S04 son kosumda yok<br>KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select count(*) from pg_policies where tablename='quote_requ |
| YH-04 | YESIL* | PLANLI | Teklif listesi adresi /tr/teklif-listesi (/cart silinmez) | K 09-04 15:45: adres eklenir, /cart satis kipinde geri gelir; rota henuz yok | URUN | K 09-04 15:45 | KANITSIZ: sinav S05 son kosumda yok<br>YESIL: src/app/[lang]/teklif-listesi yok (beklenen yok)<br>YESIL: src/app/[lang]/cart var (beklenen var) |
