# REC-129 Faz 1 — Kabuk (renk değişkenleri + logo + header/footer) · PLAN

> **Durum: PLAN — kod yazılmadı.** Kural 1 gereği. Bu faz **tasarım çıktısına bağımlıdır**;
> aşağıdaki bölümlerden biri (logo) bugün **BLOKE**, ölçümle gösteriliyor.
> Merge: Recep onayı (vitrinde marka değişikliği).

## KAYNAK/CETVEL

| | |
|---|---|
| **Yöneten cetveller** | `docs/standards/rendering-cache-standard.md` · `docs/standards/vaat-butunlugu-standard.md` · `docs/standards/storefront-reflow-standard.md` · CLAUDE.md kural 8 (design token) |
| **Kapı** | `src/__tests__/conformance/tailwind-token-sinif-gecerliligi.test.ts` |
| **Cetvel EKSİĞİ** | **"marka kılavuzu → kod token eşlemesi" cetveli YOK.** REC-129 bunu Faz 1 kapsamına yazmış; **bu planın teslimatının parçasıdır** (kural 1: "cetvel yok" bedava değil). |
| **Karne tazeliği** | Ölçümler 2026-09-04, `C:/tmp/vh-urun-rec89`, taban `origin/master@480352bd`. |
| **YÖNTEM** | Şerit (URUN), tek dal, tek PR; plan-challenger her faz planında (REC-129 şartı). |

**Kapalı kararlar (REC-129, tartışılmaz):** palet lacivert `#1A2B4A` · turkuaz `#0088B0` ·
kiremit `#D95D0E` (yalnız logo + ana eylem) · uyarı amberi `#F59E0B` (yalnız arayüz uyarısı);
yazı tipi Archivo + Source Serif 4; kabuk = tek lacivert bant header + Kategoriler paneli,
aydınlık gövde, lacivert footer.

---

## 1) Ölçülmüş zemin

| Ne | Ölçüm | Nerede |
|---|---|---|
| Renk SSOT | **HSL custom property bloğu** | [index.css:275-290](src/index.css#L275-L290) |
| `primary-navy` tüketen dosya | **134** | `grep -rl primary-navy src` |
| `secondary-blue` tüketen dosya | **50** | `grep -rl secondary-blue src` |
| ⚠**İkinci, paralel palet** | `--navy-900…500`, `--cyan-400/500`, `--amber-400` — **HEX**, "Legacy Variables (backward compat)" başlığı altında | [index.css:299-312](src/index.css#L299-L312) |
| ⚠**Gömülü HEX taşıyan .tsx** | **21 dosya** | `grep -rlE '#[0-9a-fA-F]{6}' src --include=*.tsx` |
| Bunların dağılımı | 7 = 3D · 4 = admin (**şeridim değil**) · **10 = müşteri yüzeyi** | HomeSinevizyon · HVACIcons · BentPlaneGeometry · BlueprintCanvas · InfiniteProductsShowcase · OrbitalProductsShowcase · AirCurtainCalcPage · JetFanCalcPage · LoginPage |
| Header / Footer | `StickyHeader.tsx` (299 satır) · `Footer.tsx` | `src/components/` |
| ⚠**VentHub logo varlığı** | **DEPODA YOK.** Tek logo dosyası `public/Vortice_logo.png` — o bir **tedarikçi markası**, bizim değil. | `find public src -iname '*logo*'` |

---

## 2) Merkezî bulgu — "tek yerden değiştir" iddiası YARIM doğru

Palet gerçekten merkezî: [index.css](src/index.css) içindeki HSL bloğunun değerlerini
değiştirmek 134 + 50 dosyanın görünümünü **tek hamlede** çevirir. Faz 1'in kaldıracı budur.

**Ama üç sızıntı kanalı var ve üçü de ölçüldü:**

1. **İkinci palet.** `--navy-*` / `--cyan-*` HEX bloğu ayrı bir kaynaktır. HSL bloğunu
   çevirip bunu bırakmak, sitenin **iki farklı laciverti** aynı anda göstermesi demektir.
2. **10 müşteri-yüzeyi dosyasında gömülü HEX.** Bunlar token'ı hiç okumaz; palet değişince
   **eski markada kalırlar** ve yeni palet yanında yanlış görünürler. Bu, kural 8 ihlalinin
   bugüne kadar sessiz duran bedelidir.
3. **Hedef palet mevcut değerlerden UZAK.** `--primary-navy: 226 71% 40%` parlak bir mavi;
   hedef `#1A2B4A` koyu ve doygunluğu düşük bir lacivert. Yani bu bir ton ayarı değil,
   **kontrast rejiminin değişmesi** — beyaz metin/odak halkası oranları yeniden ölçülmeli.

**Sonuç:** Faz 1 "üç değeri değiştir" işi DEĞİL. Doğru sıralaması: önce sızıntı kanallarını
kapat (tek palet + gömülü HEX'leri token'a çek), sonra değerleri çevir.

---

## 3) Kapsam — dört alt-iş

### 3.1 · Tek palet (ön koşul)
Legacy HEX bloğu HSL SSOT'una **eşlenir**; iki blok arasında değer çakışması kalmaz.
Amaç: paletin **tek** kaynağı olsun. Bu alt-iş tasarımdan bağımsız, **şimdi yapılabilir.**

### 3.2 · Gömülü HEX'lerin token'a çekilmesi (ön koşul)
10 müşteri-yüzeyi dosyası. **Admin dosyalarına dokunulmaz** (ADMIN şeridi).
3D dosyaları teklif-modu paketiyle zaten kapanıyorsa **kapsam dışı bırakılır** — o karar
teklif-modu paketinin inişinden sonra netleşir, bu plan onu varsaymaz.

### 3.3 · Palet değerlerinin çevrilmesi
Hedef dört renk uygulanır. **Kiremit ve amberin kullanım sınırı kuralın parçasıdır**
(kiremit yalnız logo + ana eylem; amber yalnız arayüz uyarısı) — bu sınırı kapı ölçer,
insan hatırlamaz.

### 3.4 · Header / Footer kabuğu
Tek lacivert bant header + aydınlık gövde + lacivert footer.
⚠**"Teklif al" kiremit tek sıcak nokta** kararı, teklif-modu paketinin nav kararıyla
**aynı yüzeye** dokunuyor — sıra çakışması bölüm 5'te.

---

## 4) BLOKE olan ve niçin

**Logo alt-işi bugün yapılamaz.** Depoda VentHub logosu **yok** (ölçüldü). Faz 1'in logo
ayağı, Design'dan gelecek altı sürümlük SVG paketine **tamamen bağımlı**. Bu bir tahmin
değil dosya sisteminin ölçümü.

Dolayısıyla Faz 1 **ikiye ayrılır:**
- **Faz 1a (şimdi yapılabilir):** 3.1 + 3.2 + cetvelin yazımı. Tasarım çıktısı gerekmez,
  müşteriye görünen değişiklik **sıfıra yakın** (aynı renkler, tek kaynaktan).
- **Faz 1b (Design export'una bağlı):** 3.3 + 3.4 + logo.

**Bu ayrım planın en somut önerisidir:** aksi halde Faz 1'in tamamı Design turlarını bekler
ve ön-koşul işleri de birlikte donar.

---

## 5) Sıra çakışması — açıkça yazılıyor

Teklif-modu paketi (`docs/plans/teklif-modu-tutarlilik-paketi-2026-09-04.md`) `StickyHeader`
ve `/products` yüzeyine dokunuyor; Faz 1b de aynı kabuğa dokunuyor.
**Hüküm: teklif-modu paketi ÖNCE iner.** Gerekçesi tercih değil ölçü — o paket bugünkü bir
**yanlış vaadi** kaldırıyor (sipariş verilemeyen sitede "Hızlı Sipariş"), Faz 1b ise
tasarım çıktısına bağımlı ve zaten bekliyor.

---

## 6) Kapılar

| Kapı | Ne ölçer | Sabotaj |
|---|---|---|
| `INV-PALET-TEKLIK-1` (**yeni**) | Kaynakta paletin **tek** tanımı var mı; ikinci bir renk bloğu doğarsa | İkinci HEX bloğu geri koy → KIRMIZI |
| `INV-PALET-SINIR-1` (**yeni**) | Kiremit/amber **yalnız** izinli yüzeylerde mi | Kiremidi gövde metnine uygula → KIRMIZI |
| `tailwind-token-sinif-gecerliligi` (mevcut) | Uydurma token sınıfı | — |
| a11y axe (mevcut) | Yeni paletin kontrast oranları | — |

**Kapının göremeyeceği:** paletin **doğru** olduğu (tasarım kararı) ve gerçek ekrandaki
görünüm. Onun ölçütü **Vercel preview + Recep'in gözü** — REC-129'un kendi şartı.

---

## 7) Kabul ölçütleri

1. Kaynakta palet tanımı **tek** blok; müşteri yüzeyi .tsx'lerinde gömülü HEX **0**
   (admin ve — karar verilirse — 3D hariç, hariç tutulanlar **listeyle** yazılı).
2. "Marka kılavuzu → kod token eşlemesi" cetveli **yazılı ve kapıya bağlı**.
3. a11y axe yeşil; yeni palette metin/zemin kontrastı ölçülmüş **sayı** olarak raporda.
4. Faz 1a müşteriye görünen değişiklik üretmiyor — preview'da **fark yok** diye doğrulanır.
5. Beş maddelik merge ritüeli + **Recep onayı**.

---

## 8) Sıra

1. Bu plan → plan-challenger red-team.
2. Rapor + plan → Recep'e 5 satırlık sunum (özellikle **Faz 1a/1b ayrımı** kararı).
3. Onay → Faz 1a kodu. Faz 1b, Design export'u geldiğinde ayrı PR.
