
# Boşluk listesi v2 — 47 müşteri yolu, beş hâl, iki kip (DESIGN-MENU, 2026-09-05)

Kaynak: depo `peckop/venthub-hvac-esite@6556a6b2`, `src/app/[lang]/**/page.tsx` (admin hariç) · Design ekranları
`Menü Tasarımı v15.dc.html` (27 kare) + `Venthub Ana Sayfa v9.dc.html`. Brief: geri-bildirim-9 madde 78.
Çerçeve: **K1a — site iki kipli**; satış kipi kapalı, YOK değil. Hiçbir satırda "K1 gereği yok" yazmaz.

**Bağımsız sayım tutuyor.** OPS 47 yol saydı; ben `page.tsx` dosyalarını ayrı saydım: **47** (admin 25 hariç, toplam 73 –
1 kök `[lang]/page.tsx` dahil). Fark yok. 404 bu listede yol olarak görünmez çünkü `not-found.tsx` ayrı dosya tipidir —
ayrı satır olarak eklendi.

Hâller: **ÇİZİLDİ** (ekran no) · **ŞABLONLA KAPANIR** (hangi şablon) · **SATIŞ KİPİ** (şimdi çizilir, kapalı bekler) ·
**FAZ 4** · **GERÇEKTEN YOK** (sebep).

---

## Vitrin ve katalog (7 yol)

| # | Yol | Teklif kipinde var | Hâl | Not |
|---|---|---|---|---|
| 1 | `/[lang]` ana sayfa | ✓ | **ÇİZİLDİ** — Ana Sayfa v9 | 1440 + 390 |
| 2 | `/category/[categorySlug]` | ✓ | **ÇİZİLDİ** — ekran 04 (üç mod: 04 · 04-mod2 · 04-mod3) | Adres K3 ile kısa slug'a geçer |
| 3 | `/category/[categorySlug]/[subCategorySlug]` | ✓ | **ÇİZİLDİ** — ekran 05 | Aynı slug kararı |
| 4 | `/products` tüm ürünler | ✓ | **ŞABLONLA KAPANIR** — ekran 06, kategori süzgeci boş | Marka × kategori haritası K13, Faz 3 |
| 5 | `/products/[slug]` ürün (aile) | ✓ | **ÇİZİLDİ** — 07c varsayılan · 07 · 07b · 07d · 07e | `?sku=` varyant ön seçer (ölçüm raporu m.6) |
| 6 | `/brands` | ✓ | **ŞABLONLA KAPANIR** — ekran 06 + marka başlığı | Menüde "Markalar" satırı var, hedef çizilmedi |
| 7 | `/brands/[slug]` | ✓ | **ŞABLONLA KAPANIR** — ekran 06, marka faseti seçili | 5 marka |

## Arama, seçici, karşılaştırma — Design'da var, kodda yol yok (3 kalem)

| # | Yol | Kodda | Hâl | Not |
|---|---|---|---|---|
| 8 | `/destek/hesaplayicilar/kanal` | ✓ | **ÇİZİLDİ** — ekran 13s (Ürün Seçici) | K17: dört hesaplayıcı yolu tek yola iner, eskiler 301 |
| 9 | `/destek/hesaplayicilar/hava-perdesi` | ✓ | **ÇİZİLDİ** — 13s, perde kipi | 301 kaynağı |
| 10 | `/destek/hesaplayicilar/hrv` | ✓ | **GERÇEKTEN YOK** (motor yok) | K18: kural tablosu yazılınca 13s'e grup eklenir |
| 11 | `/destek/hesaplayicilar/jet-fan` | ✓ | **GERÇEKTEN YOK** (motor yok) | Aynı |
| — | `/arama` | **kodda YOK** | ÇİZİLDİ — 08 · 08b · 08c | Bugün SearchOverlay; yeni yol Faz 2 (K14) |
| — | `/karsilastir` | **kodda YOK** | ÇİZİLDİ — ekran 11 | K10 |
| — | `/senaryo/[slug]` | **kodda YOK** | ÇİZİLDİ — ekran 09 | 8 senaryo; içerik kaynağı kararı açık |
| — | `/teklif-listesi` | **kodda YOK** | ÇİZİLDİ — ekran 10 | K17 #7b: yeni adres; `/cart` silinmez |

## Destek ve Bilgi Merkezi (6 yol)

| # | Yol | Hâl | Not |
|---|---|---|---|
| 12 | `/destek/merkez` | **ŞABLONLA KAPANIR** — ekran 14 (uzun metin) + içindekiler | Merkez sayfası liste görünümü ister; ayrı kare gerekebilir |
| 13 | `/destek/sss` | **ŞABLONLA KAPANIR** — ekran 14, akordeon varyantı | Akordeon çizilmedi |
| 14 | `/destek/konular/[slug]` | **ŞABLONLA KAPANIR** — ekran 14 | Makale şablonu; arama Faz 4 (K14) |
| 15 | `/destek/garanti-servis` | **ŞABLONLA KAPANIR** — ekran 14 | Satış kipinde iade/değişim ile eşleşir |
| 16 | `/destek/iade-degisim` | **SATIŞ KİPİ** — ekran 14 kalıbı, kapalı bekler | İade süreci satışla açılır |
| 17 | `/destek/teslimat-kargo` | **SATIŞ KİPİ** — ekran 14 kalıbı, kapalı bekler | Teklif kipinde teslim taahhüdü yok |

## Kurumsal ve hukuki (8 yol)

| # | Yol | Hâl | Not |
|---|---|---|---|
| 18 | `/about` | **ŞABLONLA KAPANIR** — ekran 14 | Footer'da var |
| 19 | `/contact` | **ÇİZİLMEDİ** — ekran 58 masaüstü paneli var, tam sayfa yok | K19: İletişim header'da yaprak; tam sayfa ayrı |
| 20 | `/legal/kvkk` | **ŞABLONLA KAPANIR** — ekran 14 | Source Serif 4 (K2) |
| 21 | `/legal/gizlilik-politikasi` | **ŞABLONLA KAPANIR** — ekran 14 | |
| 22 | `/legal/cerez-politikasi` | **ŞABLONLA KAPANIR** — ekran 14 | Çerez şeridi çizilmez (GB8 m.75) |
| 23 | `/legal/kullanim-kosullari` | **ŞABLONLA KAPANIR** — ekran 14 | |
| 24 | `/legal/mesafeli-satis-sozlesmesi` | **SATIŞ KİPİ** — ekran 14, kapalı bekler | Footer Yasal'ın satış hâli |
| 25 | `/legal/on-bilgilendirme-formu` | **SATIŞ KİPİ** — ekran 14, kapalı bekler | Aynı |

## Giriş ve şifre (5 yol) — hepsi FAZ 4

| # | Yol | Hâl |
|---|---|---|
| 26 | `/auth/login` | **FAZ 4** — Recep fark etti (K16); Hesap "Giriş yapın" der, hedef çizilmedi |
| 27 | `/auth/register` | **FAZ 4** |
| 28 | `/auth/forgot-password` | **FAZ 4** |
| 29 | `/auth/reset-password` | **FAZ 4** |
| 30 | `/auth/callback` | **GERÇEKTEN YOK** — teknik yönlendirme, ekranı yok |

## Hesap alanı (14 yol)

| # | Yol | Hâl | Not |
|---|---|---|---|
| 31 | `/account` | **FAZ 4** — K19 ile mimarisi karara bağlandı (kimlik kartı → 4 kare → gruplar); kare çizilmedi | Kabuk v2 turunda çizilir |
| 32 | `/account/quotes` | **FAZ 4** — ekran 53 yaprağında satır var, sayfa yok | Teklif kipinin ana hesap sayfası |
| 33 | `/account/quotes/detail` | **FAZ 4** | Teklif yanıtı burada okunur |
| 34 | `/account/projects` | **FAZ 4** | Proje = klasör (ad + açıklama + adetli kalem; kod `project_items`) |
| 35 | `/account/favorites` | **FAZ 4** | |
| 36 | `/account/profile` | **FAZ 4** | |
| 37 | `/account/addresses` | **FAZ 4** | Teklif kipinde teslim adresi de işe yarar |
| 38 | `/account/security` | **FAZ 4** | |
| 39 | `/account/data-requests` | **FAZ 4** | KVKK bağlı |
| 40 | `/account/orders` | **SATIŞ KİPİ** — çizilir, kapalı bekler | K19 Hesap grubu "Sipariş & Kargo" |
| 41 | `/account/orders/detail` | **SATIŞ KİPİ** | |
| 42 | `/account/invoices` | **SATIŞ KİPİ** | |
| 43 | `/account/returns` | **SATIŞ KİPİ** | |
| 44 | `/account/shipments` | **SATIŞ KİPİ** | İletişim yaprağına "Kargo takibi" satırı (satış hâli) |

## Satış kipi akışı (3 yol)

| # | Yol | Hâl | Not |
|---|---|---|---|
| 45 | `/cart` | **SATIŞ KİPİ** — ekran 10 kalıbı, düğme adı değişir | Adres silinmez; kapalıyken teklif listesine yönlenir, sitemap'ten çıkar (K17 #7b) |
| 46 | `/checkout` | **SATIŞ KİPİ** — çizilmedi (adres · ödeme · özet) | Ayrı tur |
| 47 | `/payment-success` | **SATIŞ KİPİ** — çizilmedi | Ayrı tur |

## Yol olmayan ama gereken ekranlar

| Kalem | Hâl | Not |
|---|---|---|
| 404 / `not-found.tsx` | **ÇİZİLMEDİ** — 08b boş sonuçla aynı dil olabilir | Yol değil, dosya |
| Teklif formu + teşekkür ekranı | **ÇİZİLMEDİ** | Ekran 12'de panel var, form gönderim sonrası yok |
| "Nasıl teklif alınır" | **ÇİZİLMEDİ** — ekran 14 kalıbı | GB8 m.76: Şirket sütununda ilk sıra |
| Ürün sayfası eylem bloğu satış hâli | **ÇİZİLDİ** — ekran 13 (iki kip) | Etiket "ARŞİV" → **"kapalı bekler"** olacak (K1a) |
| Hesap yaprağı satış hâli | **SATIŞ KİPİ** — 53'ün satış varyantı çizilmedi | |
| Footer Yasal satış hâli (6 kalem) | **SATIŞ KİPİ** — çizilmedi | v16 footer düzeniyle (GB8 m.76) |

## Systemair ölçümünden gelen üç yeni satır

| Kalem | Hâl | Kaynak |
|---|---|---|
| Seri / aile anlatım yüzeyi | **ŞABLONLA KAPANIR** — `SeriesLandingView` kodda var (HTTP 200), 15A diline taşınır; veri dalı bugün ölü (`parent_family_id` 0) | ölçüm raporu m.6 |
| Ürün anlatımı yapısal altı blok | **GERÇEKTEN YOK (bugün)** — veri taşımıyor; 374 açıklama ortalama 111 karakter, tek cümle | m.3 |
| Kataloglar / İndirmeler sayfası | **GERÇEKTEN YOK** — belge tablosu yok, ızgara %100 boş | m.4, m.5 |

## Sayı

- 47 kod yolu: **ÇİZİLDİ 8** · ŞABLONLA KAPANIR 13 · SATIŞ KİPİ 11 · FAZ 4 13 · GERÇEKTEN YOK 3 (hrv, jet-fan, auth/callback) — toplam 48 (yol 5 beş kareyle sayıldığı için ÇİZİLDİ sütunu yolu bir kez sayar).
- Design'da olup kodda yolu olmayan: **4** (arama, karşılaştır, senaryo, teklif-listesi) — Faz 2–3 kodlaması.
- Yol olmayan gereken ekran: **6**.
- OPS'un 09-04 listesindeki "Design'da karşılığı olmayan 42/47" oranı v15 ile **34/47**'ye indi (ekran 14 uzun metin şablonu 10 hukuki/destek yolunu kapatıyor, 13s seçiciyi, 04'ün üç modu kategoriyi).

— DESIGN-MENU (Fable) 2026-09-05

