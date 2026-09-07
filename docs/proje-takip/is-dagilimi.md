<!-- uretilmis: scripts/nlm/santiye.py · damga 2026-09-07T17:34Z · Linear disa aktarimi 2026-09-07T12:20:58Z · elle duzenlenmez -->
# ŞANTİYE — kimde ne iş var (2026-09-07T17:34Z)

Kaynak: Linear (2026-09-07T12:20:58Z). Kural: şerit başına yapılıyor ≤1, sırada ≤3. Pano/sohbet kaynak değildir.

## §0 Özet

| Şerit | Yapılıyor | Teslim (PR açık) | Sırada | Backlog | Bakılmadı (≥14 gün) | Bloklu | Recep'ten bekleyen | Uyum |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| URUN | 0 | 8 | 3 | 47 | 3 | 1 | 5 | YEŞİL |
| URUN-KATALOG | 0 | 3 | 3 | 6 | 0 | 0 | 1 | YEŞİL |
| ALTYAPI | 0 | 4 | 3 | 23 | 1 | 0 | 4 | YEŞİL |
| OPS | 1 | 2 | 2 | 26 | 3 | 1 | 3 | YEŞİL |
| DESIGN | 0 | 0 | 0 | 0 | 0 | 0 | 0 | YEŞİL |
| SAHIPSIZ | 0 | 0 | 0 | 0 | 0 | 0 | 0 | YEŞİL |

## §1 Recep'ten bekleyen (13)

- REC-117 · Misafir teklif akışı: teklif için üyelik zorunluluğu kalkıyor (Recep kararı) — anon INSERT/RLS = MIGRATION · URUN · Backlog
- REC-135 · Kategori ağacı boşlukları: 10 dalsız ürün + 7 boş alt dal (365/375 zaten dalında) · URUN · Todo
- REC-138 · SSR duman kilidi PR KAPISI olarak: CI kendi sunucusunu kaldırır — ama gerçek Supabase okuma erişimi ister (Re… · ALTYAPI · Backlog
- REC-156 · Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_order_number NNNN = EPOCH % 10000 çakışma… · URUN · In Review
- REC-168 · ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + NEXT_PUBLIC_ODEME_ACIK + yeniden doğru… · ALTYAPI · In Review
- REC-173 · Tasarım arşivi ve taşınabilirlik: 4 Claude Design projesi depoya günlük çekilir, tasarım kuralları bizim skil… · ALTYAPI · Backlog
- REC-186 · URUN (K12): DD ailesi 6N090P → 61090P ad + slug düzeltmesi, eski slug 301, kanonik/sitemap etkisi ölçülür · URUN · In Review
- REC-191 · URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçiş planı (K3 + K4 + REC-95 kesişimi, 80 … · URUN · In Review
- REC-194 · Mekanizma CRON katmanı: Recep 2026-09-06 "cron kurulmasın, irtibat kopuyor, ayrıca konuşulacak" — kalıcı hükü… · OPS · Backlog
- REC-211 · FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · çelişen güç · IP20 · 50/60 Hz) · URUN-KATALOG · Todo
- REC-50 · venthub.com.tr DNS + kanonik SITE_URL · OPS · Todo
- REC-52 · whsec_ webhook secret rotasyonu (repo PUBLIC) · ALTYAPI · Backlog
- REC-88 · Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor · OPS · Todo

## URUN

**YAPILIYOR (0)**

**TESLİM — PR açık, merge bekler (8)**
- REC-186 · URUN (K12): DD ailesi 6N090P → 61090P ad + slug düzeltmesi, eski slug 301, ka… · [Recep kapısı]
- REC-156 · Sipariş numarası saatten değil günlük sayaçtan üretilsin — generate_order_num… · [Recep kapısı]
- REC-157 · Konformans kapısı: aile açıklamasındaki sayısal değer, ailenin ürünlerinden t…
- REC-161 · Kategori açıklaması i18n yolu: metadata.description_i18n {tr,en} + getCategor…
- REC-182 · REC-178/URUN: pricingMaterialize.ts:126 refreshCostInBase (YAZMA yolu) + :317…
- REC-191 · URUN: Adres şeması + kategori ağacı + nitelik katmanı TEK YAYIN — geçiş planı… · [Recep kapısı]
- REC-204 · URUN: İngilizce vitrin GEÇİCİ olarak dizinden çekilir — açılma şartı ölçülebi…
- REC-205 · URUN: GSC dizinleme kusurları — çift adres kanonikleştirme (34 adres) + giriş…

**SIRADA (3)**
- REC-135 · Kategori ağacı boşlukları: 10 dalsız ürün + 7 boş alt dal (365/375 zaten dalı… · [Recep kapısı]
- REC-188 · REC-179/URUN: 11 fail-open konformans kapısına evren muhafızı — 3d-asset-vali…
- REC-155 · CANLI: 126/375 ürün sayfasında "Ürün Açıklaması" altında iç kademe notu görün…

**BLOKLU (1)**
- REC-169 · URUN: Satış kipinin GÖRÜNEN YÜZÜ — kapalı/açık metinleri, sepet ve PDP vaat s… · bloklu: REC-168

## URUN-KATALOG

**YAPILIYOR (0)**

**TESLİM — PR açık, merge bekler (3)**
- REC-184 · REC-178/Katalog: generate-sitemap.mjs (limit 5000, çağıran yok = ÖLÜ ADAY ölç…
- REC-172 · KATALOG + OPS: Teknik özellik tamamlama hattı — boşluk haritası (aile × alan)…
- REC-207 · KOL 1 — Kaynak dizini tazeliği: 36 belge dizin dışında; yeni PDF inince dizin…

**SIRADA (3)**
- REC-146 · İçerik hattı: 40 aile anlatımı + yapısal altı blok (Gövde·Çark·Motor·Koruma·K…
- REC-190 · Katalog: canlıda 38 teknik hücre sayısal anahtarda birim-gömülü metin taşıyor…
- REC-211 · FAZ 4 artığı: yüklenmeyen 16 teknik değer — dört ayrı karar (ağırlık · çelişe… · [Recep kapısı]

## ALTYAPI

**YAPILIYOR (0)**

**TESLİM — PR açık, merge bekler (4)**
- REC-168 · ALTYAPI: Satış kipine TEK ANAHTARLA geçiş — hide_price (37 kategori) + NEXT_P… · [Recep kapısı]
- REC-162 · Vercel günlük derleme sınırı: kapıda "rate limited" kolu = ÖLÇÜLEMEZ (madde 3…
- REC-177 · Hafıza kancaları: eylem defteri (mv/rm → state) · soru yönlendirme (hatırlıyo…
- REC-192 · ALTYAPI: mekanizma teslimat kanıtı "atıldı" ile "ULAŞTI"yı ayırt etmiyor — gö…

**SIRADA (3)**
- REC-185 · REC-180/ALTYAPI: araç envanteri KAPISI — scripts/hijyen/arac-envanteri.cjs (f…
- REC-189 · REC-179/ALTYAPI: 3 fail-open kapıya evren muhafızı — pricing-money-append-onl…
- REC-121 · Tip-drift kapısı: migration inince database.types.ts canlı şemayla senkron mu…

## OPS

**YAPILIYOR (1)**
- REC-175 · Tek ekran pano (WrongStack 3/3): gün kapanışı betiği her akşam tek dosya üret… · bloklu: REC-141

**TESLİM — PR açık, merge bekler (2)**
- REC-178 · 1000 satır tavanı — sahipsiz 8 kalemin sahip ataması (pricingMaterialize:126 …
- REC-187 · Gün kapanışı v2: şerit dilim kaydı (DEVAM+ANLAM, numaralı) · iş kalemi sipari…

**SIRADA (2)**
- REC-50 · venthub.com.tr DNS + kanonik SITE_URL · [Recep kapısı]
- REC-88 · Açık kaynak CRM/ERP taraması + wacrm incelemesi — karar bekliyor · [Recep kapısı]

**BLOKLU (1)**
- REC-175 · Tek ekran pano (WrongStack 3/3): gün kapanışı betiği her akşam tek dosya üret… · bloklu: REC-141

## DESIGN — yapılıyor 0 · sırada 0 (backlog 0)

## SAHIPSIZ

**YAPILIYOR (0)**

## §8 Bakılmadı (7) — Backlog'da ≥14 gündür kimse bakmamış; iş varsa iştir, iptal yok, sahibi bir bakar

- REC-58 · Onaysız tehlikeli butonlar: tekil iade + tekil rol değişikliği · ALTYAPI · son anlamlı dokunuş 2026-08-24
- REC-55 · Satınalma modülü — v1 tamam, karne + v2 kalemleri açık · OPS · son anlamlı dokunuş 2026-08-24
- REC-62 · ERP çalışma alanı + CRM nesne katmanı — cetveller yazılı, kod sıfır · OPS · son anlamlı dokunuş 2026-08-24
- REC-64 · İkiz taraması: 20 aday eksik — koda karşı doğrula, haritaya işle · OPS · son anlamlı dokunuş 2026-08-24
- REC-57 · LANSMAN ENGELİ: iyzico-refund müşteri self-iadesi · URUN · son anlamlı dokunuş 2026-08-24
- REC-60 · Kapsama: ~210 eksik kod + sürekli sayım kapısı · URUN · son anlamlı dokunuş 2026-08-24
- REC-61 · Sayfa görselleri Gemini üretim hattı — hava perdesi şablonundaki gibi · URUN · son anlamlı dokunuş 2026-08-24

## §9 Hüküm

YEŞİL — her şerit sınırın içinde.
