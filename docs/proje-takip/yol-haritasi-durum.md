# VentHub Yol Haritasi ve Durum — 2026-09-06T14:30:00Z (uretilmis; elle duzenlenmez; kaynak yol-haritasi.json)

Satir 37/40 · YESIL 33 · KIRMIZI 3 · KANITSIZ 1 · olculmemis kanit 6 (saglik olcusu; haftalik dusmeli) · canli OLCULMEDI

Renk KANITTAN turer: YESIL = kanitlar bekleneni verdi · KIRMIZI = belge celiskisi YA DA karar degisti (ikisi de gorunur, biri duzeltilir) · KANITSIZ = borc · YESIL* = olculen kanitlar yesil, bir kismi olculemedi. 'durum' sutunu BEYANDIR; renk beyanin kanitidir.

## 15A-F1

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-10 | YESIL | KAPALI-HAZIR | Yeni kabuk gezinmesi: header tek oge 'Teklif' + panel | #981 indi (09-04, Recep 'insin'); bayrak kapali, Recep onizleme sonrasi acilir (K16) | URUN | K16 · REC-129 | YESIL: YENI_KABUK_GEZINMESI = false (beklenen false)<br>YESIL: src/components/navigation/HeaderTeklifPaneli.tsx var (beklenen var) |
| YH-11 | YESIL | KAPALI-HAZIR | Mobil alt sekme cubugu: 4 sekme (Ana sayfa · Urunler · Teklif · Iletisim) | K9 + K 09-04 18:30; ayni bayrakla acilir; DESIGN 09-05 Kabuk v2 'Hesap' sekmesi onerdi → Recep karari bekliyor | URUN · Recep | K9 · K 09-04 16:50/18:30 | YESIL: sinav S06 = YESIL<br>YESIL: src/components/navigation/MobilAltSekmeCubugu.tsx var (beklenen var) |
| YH-12 | YESIL | PLANLI | Mobil header: hesap sag ust + akilli dil cipi | K 09-04 16:50 karari; DESIGN 09-05 'bildirim rozeti + dil Hesap'ta' onerdi → Recep karari bekliyor | URUN · Recep | K 09-04 16:50 | YESIL: sinav S07 = YESIL |
| YH-13 | YESIL | KAPALI-HAZIR | 3D urun gorunumu musteri yuzeyinde | K8 / vaat-butunlugu: teklif modunda vaat edilmez; admin onizleme bagli degil | URUN | K8 · REC-94 | YESIL: UC_BOYUT_MUSTERI_YUZEYINDE = false (beklenen false)<br>YESIL: sinav S10 = YESIL |
| YH-14 | YESIL | BEKLIYOR | Footer: marka logolari kalkar, 'Markalar' metin baglantisi kalir | Recep+Design+OPS ayni gorus (09-04 aksam); Design v16 turu ile kodlanir; bugun footer'da marka baglantisi var, logo yok mu olculur | DESIGN → URUN | K 09-04 aksam | YESIL: sinav S12 = YESIL<br>YESIL: src/components/Footer.tsx desen /Routes\.brands\(\)/ var (beklenen var) |

## 15A-F2

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-15 | YESIL* | PLANLI | Kategori agaci 7 kategori · 26 dal · Siginak ust kategori · kisa slug | K3 (09-03); shelter-ventilation bugun level=1 (09-04 olcumu) → uygulanmadi | URUN | K3 | YESIL: sinav S09 = YESIL<br>KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select slug, level from categories where slug='shelter-venti<br>KANITSIZ: canli olculmedi (--canli yok): https://venthub.com.tr/tr/fanlar |
| YH-16 | YESIL | PLANLI | Arama sonucu sayfasi /tr/arama (ekran 08) | K14: liste sablonu + arama seridi; bugun arama kayan katman (SearchOverlay), rota yok | URUN | K14 | YESIL: src/app/[lang]/arama yok (beklenen yok)<br>YESIL: src/components/SearchOverlay.tsx var (beklenen var) |
| YH-17 | YESIL | YAPILIYOR | Urun Secici: tek sayfa, grup grup motor (ilk kanal fani), urun sayfasina entegrasyon EN SON | K17 + K18 (istisare, Recep 'karar' deyince kesinlesir); hesaplayicilar rotasi var, secici sayfasi Design A akisi | DESIGN → URUN | K17 · K18 | YESIL: sinav S08 = YESIL<br>YESIL: src/app/[lang]/destek/hesaplayicilar/kanal var (beklenen var)<br>YESIL: sinav S20 = YESIL |
| YH-19 | YESIL | PLANLI | Karsilastirma sayfasi /tr/karsilastir (ekran 11) | K10; rota yok | URUN | K10 | YESIL: src/app/[lang]/karsilastir yok (beklenen yok) |
| YH-21 | YESIL | PLANLI | Urun Secici girisi header'da kendi ogesi (izgara alternatifi ARSIV) | K24 (09-06, Recep OPS'a devretti); Menu v17 B4 karesinde uygulandi; tek giris sayfasi /urun-secici 09-05 indi (Adim 1), header ogesi kod Faz 2 — inince navigation kaniti 'var'a cevrilir | DESIGN-MENU → URUN | K24 · K 09-04 16:10 | YESIL: sinav S08 = YESIL<br>YESIL: src/app/[lang]/urun-secici var (beklenen var)<br>YESIL: src/components/navigation desen /urun-secici/ yok (beklenen yok) |
| YH-22 | YESIL | PLANLI | Renk tokenleri: turkuaz metin degil; --brand-cyan-ink #00708F + --action-terracotta-deep #BF5309 (AA) | K25/K25-b (09-06); Marka kaynaga yazdi, DS turetti, Menu v17 uyguladi (ink 251 · deep 36); kod tarafi tokens.js'e girmedi | DESIGN-MARKA → URUN | K25 · K25-b · K26 | YESIL: src/design-system/tokens.js desen /cyan-ink|cyanInk/ yok (beklenen yok) |
| YH-23 | YESIL | YAPILIYOR | Urun Secici A+C CALISAN PROTOTIP (dinamik yontem): gercek veri JSON + kural dosyasi tek kaynak + oturum kaydi; Claude API adimi YOK | K37 Recep karari 09-06 (statik degil dinamik); Menu emir #10 tek paket; kod tarafi ayni kural dosyasindan (URUN, sonra) | DESIGN-MENU → URUN | K37 · K18 · K18-c | YESIL: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /K37 · Yöntem: dinamik/ var (beklenen var)<br>YESIL: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /Claude API adımı YOK/ var (beklenen var) |
| YH-24 | YESIL | PLANLI | Recep UI iyilestirmeleri: ekran 11 farki goster · Bilgi Merkezi ic tasarimi · ekran 58 panel/sutun (karar Recep) | K37-a 09-06; Menu #10 paketinde prototipten sonra; U3 yapisal karar tek basina sorulur | DESIGN-MENU · Recep | K37-a | YESIL: docs/proje-takip/linear/kararlar-vitrin-15a-2026-09-06.md desen /K37-a · Recep'in UI/ var (beklenen var) |

## 15A-F3

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-18 | KANITSIZ | PLANLI | Liste sayfalari MATRIS gorunumu (kart/tablo/seri) | K13: 15A-F3; bugun yalniz kart | URUN | K13 | — (kanit yok) |

## GUVENLIK

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-50 | YESIL | ACIK | Design (15A) yalniz OKUR: Supabase SELECT, Linear'a tur sonu yorumu | Recep 09-04 13:45 | OPS | K 09-04 13:45 | YESIL: sinav S18 = YESIL |
| YH-51 | YESIL | ACIK | Rol otoritesi user_profiles.role / app_metadata; raw_user_meta_data YASAK | auth-account A11; CLAUDE.md kural 12 | ALTYAPI | auth-account-standard A11 | YESIL: sinav S19 = YESIL<br>YESIL: src/middleware.ts desen /raw_user_meta_data/ yok (beklenen yok) |

## KATALOG

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-20 | YESIL* | ACIK | Katalog: 374 urun / 32 aile / 5 marka prod'da; sayim tek kaynak betik | Kademe-2 F4 (08-11); REC-136 sayim betigi; karara giden sayi BETIKTEN gelir (09-04 dersi) | URUN | REC-136 | YESIL: scripts/katalog/katalog-sayim.mjs var (beklenen var)<br>KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select count(*) from products where deleted_at is null |
| YH-32 | YESIL* | ACIK | Ic ingest notu ('Tier C') musteri yuzeyinde YOK: veri temizlendi + render muhafizi | REC-155 (09-06): 187 urun + 11 aile temizlendi (OPS kostu), #1023 muhafiz; canli 8 sayfa 0 kalinti | URUN-KATALOG · URUN | K7 · vaat-butunlugu | YESIL: src/utils/icIngestNotu.ts var (beklenen var)<br>YESIL: scripts/icerik-hatti/tier-c-temizlik.mjs var (beklenen var)<br>KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select count(*) from products where description_i18n::text i |
| YH-33 | YESIL | PLANLI | Aile metnindeki sayi ailenin urunlerinden turemis ARALIK (tek model sayisi yasak) | REC-157 (09-06): 10 aile / 109 urun tek model sayisi; veri Katalog 2b-2'de, kapi URUN'da (REC-156 sonrasi) | URUN | K1 · K7.4 · REC-157 | YESIL: src/__tests__/conformance desen /aile-metni-aralik/ yok (beklenen yok) |
| YH-34 | YESIL | ACIK | AVenS: kaynagi olmayan aileye satilabilir sayfa YAZILMAZ (BVU-LS + hiz anahtarlari); sulu batarya yazilir; elektrikli isitici aksesuar | K7.10 Recep 09-06 'Avens icin de onay verdim'; 38 aile canliya yazildi, AVenS 2 aile disari | URUN-KATALOG | K7.10 | YESIL: docs/proje-takip/linear/kararlar-katalog-2026-09-06.md desen /K7.10/ var (beklenen var) |

## SUREC

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-40 | YESIL | ACIK | Migration iceren PR yalniz Recep onayiyla birlesir (merge = prod'a otomatik) | CLAUDE.md kural 13; supabase-migrate.yml master'a otomatik uygular | OPS | CLAUDE.md 13 | YESIL: sinav S15 = YESIL<br>YESIL: .github/workflows/supabase-migrate.yml var (beklenen var) |
| YH-41 | KIRMIZI | ACIK | Is takibi SSOT = Linear; registry salt arsiv | 08-26 goc bitti (REC-42/53); work-tracking-ssot yururluk notu | OPS | is-kayit-duzeni-standard | YESIL: sinav S17 = YESIL<br>YESIL: docs/standards/is-kayit-duzeni-standard.md var (beklenen var)<br>KIRMIZI: docs/standards/work-tracking-ssot-standard.md desen /tek kaynağı \*\*Linear/ yok (beklenen var) |
| YH-42 | YESIL | ACIK | Belgeler icin kapi: hafiza sinavi (compact/resume donusu) | v1 09-04, v1.1 09-05; anahtar YAZILI kararlardan | OPS | proje-takip-defteri-standard §5 | YESIL: scripts/nlm/hafiza_sinavi.py desen /beklenen_biri/ var (beklenen var)<br>YESIL: docs/proje-takip/hafiza-sinavi-sonuc.md var (beklenen var) |
| YH-43 | YESIL | ACIK | Companion (yardimci belge) uretimi DONDURULDU; C4 bloklamaz | Recep 09-03 (C4) + 09-05 K9 UYKU KIPI (REC-142, #997): tek tasiyici anahtari KAPALI; tum companion kapilari sayar+raporlar+bloklamaz, kancalar uretmez; uyandirma = anahtar ACIK | ALTYAPI | Kararlar-Altyapi K9 · REC-142 | YESIL: .companion-tasiyici.json desen /KAPALI/ var (beklenen var)<br>YESIL: scripts/hijyen/tasiyici-anahtari.cjs var (beklenen var)<br>YESIL: src/__tests__/conformance/companion-dondurulmus.test.ts var (beklenen var) |
| YH-44 | YESIL | ACIK | Merge yalniz merge-ritueli.cjs --merge ile (kapi ile eylem ayni surecte); gh pr merge dogrudan cagrilmaz | Katalog ihlal bildirimi 09-06 (pipe cikis kodunu yuttu, #1027 kirmiziya ragmen indi); #1029 + #1031; --onay bayragi ALTYAPI'da | ALTYAPI | fleet-mechanism §20.1-a | YESIL: scripts/hijyen/merge-ritueli.cjs desen /--merge/ var (beklenen var)<br>YESIL: docs/standards/fleet-mechanism-standard.md desen /20.1-a/ var (beklenen var) |
| YH-45 | KIRMIZI | YAPILIYOR | Gozcu yalniz Monitor araciyla; teslimat kaniti baska oturumun jetonu + sure (beyan degil); acilista SendMessage (cron yok) | 09-06 sabah: Katalog Bash-arka-plan gozcusu bildirim uretmedi (5 not kacti); dogrula ajan beyanina guveniyor; ALTYAPI kuyrugunda | ALTYAPI · OPS | Recep 09-06 (cron yok) · wake-peers-via-sendmessage | YESIL: scripts/board/mechanism-setup.cjs desen /--gordum/ var (beklenen var)<br>KIRMIZI: docs/standards/fleet-mechanism-standard.md desen /run_in_background/ var (beklenen yok) |
| YH-46 | KIRMIZI | PLANLI | Kaynak Dizini (PDF sayfa+tablo hash dizini) CETVELDE anilir: catalog-ingestion bolum + CLAUDE.md satir + docs/README satir; kural PDF dogrudan taranmaz | 09-06 Katalog+URUN bulgusu: dizin hicbir cetvelde yok, yarin ajan bulamaz; REC-163 artim 0, belge-only PR (Vercel kotasi) | URUN-KATALOG | OPS hukmu 09-06 · REC-163 | KIRMIZI: docs/standards/catalog-ingestion-standard.md desen /Kaynak Dizini/ yok (beklenen var)<br>YESIL: CLAUDE.md desen /kaynak-dizini/ var (beklenen var) |
| YH-47 | YESIL | PLANLI | Gun kapanisi TEK KOMUT: Kararlar disa aktarim → yol haritasi → defter esitle → sinav → Linear ayna → damgali sonuc + seviye satiri; acilis kapisi damga>24s KIRMIZI | Recep 09-06: 'hakimiyet yok, seviyeyi soylemiyorsun'; parcalar var isletme yok (5'te 2,5); bugun elle kosuldu | OPS | Recep 09-06 aksam · proje-takip-defteri-standard | YESIL: scripts/nlm/gun_kapanisi.py desen /esitle/ var (beklenen var)<br>YESIL: docs/proje-takip/linear/venthub-yol-haritasi-ve-durum.md desen /AYNA/ var (beklenen var)<br>YESIL: scripts/nlm/acilis_kapisi.py desen /gun_kapanisi/ var (beklenen var) |

## SaaS-F1

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-30 | YESIL | ACIK | Cok kiracili temel: tenant_id + RLS + tenantResolver (derleme anında sabit) | SaaS Faz 1 Foundation bitti (roadmap); kural 12 surer | ALTYAPI | venthub_saas_master_roadmap · CLAUDE.md kural 12 | YESIL: sinav S13 = YESIL<br>YESIL: src/lib/tenantResolver.ts var (beklenen var)<br>YESIL: supabase/migrations desen /tenant_id/ var (beklenen var) |

## SaaS-F2

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-31 | YESIL | PARK | White-label / kiraci ekle-cikar / kiraciya gore tema | Recep 08-28 (REC-88): oncelik kendi sirket + tek operator; yeniden acilis Recep karari | Recep | REC-88 | YESIL: sinav S13 = YESIL<br>YESIL: sinav S14 = YESIL |

## TICARI

| id | renk | durum (beyan) | yetenek | sebep | sorumlu | karar | kanit |
|---|---|---|---|---|---|---|---|
| YH-01 | YESIL | ACIK | Teklif kipi: fiyat gizli, teklif akisi acik | K1: sirket kurulmadan satis yapilmaz; fiyat yalniz urun detayda, kategori/kartta yok | Recep | K1 · K1a | YESIL: sinav S03 = YESIL<br>YESIL: src/lib/pricing/quoteMode.ts desen /hide_price/ var (beklenen var)<br>YESIL: src/__tests__/conformance/storefront-fiyat-sizintisi.test.ts var (beklenen var) |
| YH-02 | YESIL | KAPALI-HAZIR | Satis kipi: sepet · odeme · siparis · fatura · iade · kargo | K1a: YOK degil KAPALI; kodda var, tek anahtar; sirket kurulunca acilir (yeni tur degil, anahtar) | Recep (sirket kurulusu) | K1a · Anahtar ve Kip Haritasi | YESIL: sinav S01 = YESIL<br>YESIL: sinav S02 = YESIL<br>YESIL: src/app/[lang]/checkout/page.tsx desen /NEXT_PUBLIC_ODEME_ACIK/ var (beklenen var)<br>YESIL: src/app/[lang]/cart/page.tsx var (beklenen var) |
| YH-03 | YESIL* | PLANLI | Misafir teklif: uyelik zorunlu degil | REC-117 (09-01): anon INSERT icin RLS migration gerekir → Recep kapisi | Teklif Akisi seridi | REC-117 | YESIL: sinav S04 = YESIL<br>KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select count(*) from pg_policies where tablename='quote_requ |
| YH-04 | YESIL | PLANLI | Teklif listesi adresi /tr/teklif-listesi (/cart silinmez) | K 09-04 15:45: adres eklenir, /cart satis kipinde geri gelir; rota henuz yok | URUN | K 09-04 15:45 | YESIL: sinav S05 = YESIL<br>YESIL: src/app/[lang]/teklif-listesi yok (beklenen yok)<br>YESIL: src/app/[lang]/cart var (beklenen var) |
| YH-05 | YESIL* | ACIK | Siparis numarasi gunun sira sayaci (saat degil); tam numara her yerde | REC-156 (09-06): EPOCH%10000 cakisma riski; #1032 Recep 'sen merge et' ile 05:13Z indi, migration prod'a uygulandi; URUN prod kaniti (3 cagri 3 numara, eszamanli 2 oturum) REC-156 yorumuna gelecek | URUN | REC-156 · kural 13 · document-numbering-standard | YESIL: supabase/migrations/20260906043551_siparis_no_gunluk_sayac.sql var (beklenen var)<br>YESIL: src/utils/siparisNo.ts var (beklenen var)<br>YESIL: docs/standards/document-numbering-standard.md var (beklenen var)<br>KANITSIZ: veri kaniti v1'de betikten kosulmaz (Supabase erisimi MCP'de): select generate_order_number(), generate_order_number() -- i |
| YH-06 | YESIL | PLANLI | Iade semasi: kalem/adet + refund_amount + return_no (IA-YYYYMMDD-NNNN) | REC-159 (09-06, Belge sema olcumu): venthub_returns dar; satis kipi acilmadan; migration Recep | URUN · Recep | REC-159 · 153-7 | YESIL: supabase/migrations desen /venthub_return_items/ yok (beklenen yok) |
| YH-07 | YESIL | YAPILIYOR | Kurumsal belgeler: kartvizit YAPILIR; kesif raporu v1 kabul, 7 alan sema bekler (site_surveys, Linear kaydi acilir); rapor kabugu ikinci raporla | K17-a Recep 'yapilsin' 09-06; K17-b 153-28/29/30 OPS hukmu; migration Recep kapisi | DESIGN-BELGE · OPS · Recep | K17-a · K17-b | YESIL: docs/proje-takip/linear/kararlar-kurumsal-belgeler-2026-09-06.md desen /K17-a · Kartvizit = KARAR/ var (beklenen var)<br>YESIL: docs/proje-takip/linear/kararlar-kurumsal-belgeler-2026-09-06.md desen /site_surveys/ var (beklenen var) |
