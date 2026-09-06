# REC-158 — Föy PDF ile vitrin AYNI biçimlendiriciyi kullanmalı

> **Durum:** PLAN (kod yok) · **Şerit:** ALTYAPI · **Tarih:** 2026-09-06
> **KAYNAK/CETVEL:** Kararlar — Kurumsal Belgeler **K3** (veri koddan) · **K11** (tek kabuk) ·
> **K12** (`alanAdlari`) · **K13** (sayfa no üretim tarafında) ·
> `docs/standards/rendering-cache-standard.md` (PDF önbelleği) ·
> **PDF cetveli YOK** — "belge üretim hattı" bölümü bu işin kapsamında yazılır.
> **YÖNTEM:** ALTYAPI şeridi, kendi worktree, kod PR'ı; migration yok. K8: PDF görünür
> çıktı → Recep önizleme. Plan uygulanmadan önce **plan-challenger** (red-team).

---

## ⛔ÖNCE PREMİS DÜZELTMESİ — kayıttaki iddia ölçümle DARALDI

Kayıt *"föy PDF'i ÜRETİMDE `technical_specs`'ten basılsın"* diyor. Ölçüldü (2026-09-06):

| kayıttaki varsayım | ölçülen gerçek | kanıt |
|---|---|---|
| PDF üretimi yok | ⛔**VAR** — `jspdf` + `jspdf-autotable` | `package.json` |
| föy `technical_specs` okumuyor | ⛔**OKUYOR** | `src/lib/pdfGenerator.ts:196,215` |
| föy hiç üretilmiyor | ⛔**Üretiliyor**, ürün sayfasından çağrılıyor | `src/app/_components/ProductDetailPageView.tsx:332` |

⭐**Yani "veriden basma" işi ZATEN YAPILMIŞ.** Bir alt ajan ölçümü *"PDF üretim kütüphanesi
bulunamadı"* demişti; **doğrulama sırasında çürüdü** — `package.json`'da `jspdf` duruyor.
(Ders: ajan çıktısı örneklenerek doğrulanır; bu kayıt onun canlı örneğidir.)

## ⭐GERÇEK BOŞLUK — "aynı veri, iki yüzeyde İKİ FARKLI BİÇİM"

⛔**BU BÖLÜM RED-TEAM'DEN SONRA DÜZELTİLDİ.** İlk yazımda "biçimlendirmenin tek kaynağı
`productHelpers.ts`" demiştim — **eksikti**. Etiketin gerçek kaynağı `src/utils/specLabel.ts`:

| yüzey | ETİKET | DEĞER | GRUP | SIRA |
|---|---|---|---|---|
| **Vitrin** | `specFieldLabel` / `specGroupLabel` (satır 983, 991) | `formatSpecValue` ✅ | `groupTechnicalSpecs` ✅ | `SPEC_SORT_ORDER` ✅ |
| **Föy PDF** | ⛔`translateSpecKey` *(parametre, satır 339)* | ⛔**YOK** — ham `String(value)` | ⛔**YOK** | ⛔**YOK** |

⭐**`translateSpecKey` vitrinin etiket kaynağı DEĞİL.** `ProductDetailPageView.tsx`'e yalnızca
**PDF'e parametre geçmek için** import ediliyor; vitrin kendi render'ında onu hiç çağırmıyor.
`specFieldLabel` önce i18n sözlüğüne (`pdp.specs.<key>`) bakar, ancak orada yoksa
`translateSpecKey`'e düşer (`specLabel.ts:76-90`).

⚠**Sonuç:** ilk planın *"`translateKey` parametresi korunur"* kararı **kabul ölçütünü
sağlayamazdı** — canlı anahtarların çoğunda föy jenerik fallback'e düşer (`"Ip Rating"`),
vitrin sözlük etiketini gösterir (`"Koruma Sınıfı (IP)"`). Bu, planı yazan (ben) tarafından
değil **red-team tarafından** yakalandı; düzeltilmeseydi iş "yeşil" bitip parite yine
sağlanmayacaktı.

Föy, değeri ham basıyor: `String(value)` — `pdfGenerator.ts:216`.
`grep -c "formatSpecValue|groupTechnicalSpecs|SPEC_SORT_ORDER"` → vitrin **6**, föy **0**.

**Bunun müşteriye görünen sonucu, adıyla:** `formatSpecValue` **birim ekler**
(`productHelpers.ts:112-134`: `°C`, `L`, `V`, `W`, `dB(A)`, `RPM`, `L/24h`).
Föy bunu çağırmadığı için aynı ürünün aynı alanı:

- vitrinde → **`45 dB(A)`**
- föyde → **`45`**

Ayrıca föyde **gruplama yok** (düz alfabetik olmayan tek tablo) ve **sıralama yok**
(`SPEC_SORT_ORDER` devrede değil), yani vitrinde "Performans / Elektrik" diye ayrılan
alanlar föyde tek yığın hâlinde ve rastgele sırada çıkıyor.

⚠**Bu, bu depoda ölçülmüş bir hata sınıfıdır: "aynı ölçüt, iki uygulama."** Föy müşteriye
gönderilen bir belgedir; vitrinle çelişen bir föy, teklif ekinde çelişki üretir.

## HÜKÜM — işin doğru tanımı

> REC-158 = *"föy DB'den bassın"* **değil** (zaten basıyor);
> **"föy ile vitrin AYNI biçimlendiriciyi kullansın"** — tek kaynak `productHelpers.ts`.

Bu, K11'in (tek kabuk) veri tarafındaki karşılığıdır: kabuk tek olsa da **biçim iki yerden
geliyorsa** belge yine ayrışır.

## ADIMLAR

1. **Adım 0 — ölçüm dondurulur (bu belge).** Yukarıdaki tablo, değişiklikten önceki durumdur;
   PR'da "önce/sonra" olarak karşılaştırılacak.
2. **Föy DÖRT eksende de aynı kaynağa bağlanır** (red-team koşulu 1 — ilk planda ÜÇÜ vardı):
   - **etiket** → `specFieldLabel(key, t)` *(yeni; `translateSpecKey` parametresi YETMEZ)*
   - **grup başlığı** → `specGroupLabel(groupKey, t, group.label)` *(yeni)*
   - **değer** → `formatSpecValue`
   - **gruplama/sıra** → `groupTechnicalSpecs` + `SPEC_SORT_ORDER`
   ⚠Föy `lang` alıyor ama `t` almıyor: çağıran taraf (`ProductDetailPageView`) `t`'yi zaten
   biliyor — **`translateKey` yerine `t` geçirilir**. Aksi hâlde EN föyde grup başlıkları TR
   kalır (`group.label` hardcoded TR).
3. **Gruplamanın PDF'te NASIL render edileceği ÖNCE kararlaştırılır** (red-team koşulu 2).
   Ölçüldü: `pdfGenerator.ts`'te **tek** `autoTable` çağrısı var, `didDrawPage` hook'u **YOK**.
   Dört bölüm istenirse: 4× `autoTable` + `lastAutoTable.finalY` takibi + her bölüm öncesi
   taşma kontrolü + `didDrawPage`'de `drawHeader()` **gerekir**.
   ⚠**ÖNCEDEN VAR OLAN KUSUR, adıyla:** bugün bile `autoTable` kendi iç taşmasıyla 2. sayfaya
   geçerse o sayfada **başlık çizilmiyor** (`didDrawPage` yok). Gruplama bunu **4 kat** büyütür.
   ⭐Karar Faz 1'de: **tek tablo + doğru SIRA** (görsel risk minimum) · grup başlıklı 4 bölüm
   **Faz 2**'ye bırakılır (K8 önizleme gerektirir).
4. **K13 — sayfa numarası.** Dosyada 4 eşleşme var ama **davranış ölçülmedi**; PR'da çok sayfalı
   bir fikstürle sayılarak gösterilir. Ölçmeden "var" denmez.
5. **Kapı: `INV-FOY-PARITE-1`.** Ölçüt **metin taraması değil**, davranış: aynı `technical_specs`
   fikstürü hem vitrin yardımcılarına hem föy üreticisine verilir; **çıkan etiket/değer/sıra
   listesi EŞİT olmalı**. Sabotaj kolu: föyden `formatSpecValue` çıkarılınca kol DÜŞMELİ.
   ⭐Kapı `pdfGenerator`'ın `productHelpers`'ı *import ettiğini* değil, **aynı çıktıyı ürettiğini**
   ölçer — import denetimi, ikinci bir biçimlendirme yolunu görmez.
   ✅**Uygulanabilirliği kanıtlı** (red-team koşulu 3): `src/lib/__tests__/pdfGeneratorFallback.test.ts`
   zaten `jsPDF`'i ve `jspdf-autotable`'ı mock'luyor (`vi.mock` ×2). Kapı, `autoTable`'a geçen
   `head`/`body` argümanını yakalayıp vitrin çıktısıyla karşılaştırır — **emsal desen budur**.
   OPS hükmü: üç altın ürün (17160 · 17143 · bir SEAT) fikstür olarak kullanılır.
6. **Cetvel:** `docs/standards/` altına **belge üretim hattı** bölümü — "müşteriye giden her
   belge, vitrinle aynı biçimlendiriciden geçer" hükmü + bu vaka.

## SINIRLAR — adıyla

- ⛔**Migration YOK.** Önbellek tablosu gerekirse **ayrı karar** (kural 13: merge = prod'a
  otomatik uygulama).
- ⛔**K8:** föy görünür müşteri çıktısıdır → **Recep önizlemesi** olmadan inmez.
- ⚠**Design `.dc.html` şablonu bu depoda YOK** ve olmaması doğrudur; şablon "dizgi kaynağı"
  olarak işaretlenecek, veri kaynağı değil. Bu belgenin kapsamı **üretim tarafıdır**.
- ⚠**Ölçülmedi:** föyün 375 ürünün tamamında nasıl göründüğü (toplu üretim REC-145'e bağlı);
  bu plan **tek ürün** föyünü hedefler.
- ✅**"Önbellek tetiği" maddesi KONUSUZ çıktı** (red-team koşulu 4 — ilk planda *"ölçülmedi"*
  yazmıştım, **ölçülebilirdi ve ölçtüm**): `rendering-cache-standard.md`'de `pdfGenerator` /
  `datasheet` / `föy` kelimeleri **0 kez** geçiyor. Sebebi de var: föy **istemci tarafında**,
  buton tıklamasında üretiliyor (`handleDownloadPdf` → dinamik `import` → `doc.save()`),
  her tıklamada taze veri çekiliyor. **Tazelenecek bir sunucu önbelleği YOK.** Yani bu bir
  gizli-migration riski değil, **konusuz bir soru**.
  ⛔Sunucu tarafı PDF hattı (varsa) **Faz 2** — ayrı karar (OPS hükmü).
- ⚠**`SPEC_SORT_ORDER` ve `translateSpecKey` sözlükleri BAYAT.** Canlı şemadaki anahtarların
  çoğu bu tablolarda yok (eski adlar taşıyorlar). Pratik etkisi düşük — her iki yüzey de aynı
  `Object.entries` sırasını koruduğu için sıralama **stabil** kalıyor — ama plan bunu
  *"sıra tek kaynağa bağlandı"* diye **sunmamalı**: kaynak çoğunlukla **etkisiz**.
  Sözlük tazeleme **bu işin kapsamı dışında**, ayrı kalem olarak not edildi.

## KABUL ÖLÇÜTÜ

- Aynı fikstürde vitrin ve föy çıktısı **birebir aynı** etiket, değer (birimli) ve sırayı verir.
- `INV-FOY-PARITE-1` yeşil; **sabotajda düşüyor**.
- Föyde birim taşıyan alan sayısı: **önce 0**, sonra vitrindekiyle eşit (PR'da sayı verilir).
- Migration **0**; Recep önizleme onayı yazılı.

---

## RED-TEAM SONUCU — **KOŞULLU**, dört koşul da bu belgeye İŞLENDİ

`plan-challenger` bağımsız koşuldu (alt ajan) ve **planın kabul ölçütünü sağlayamayacağını**
gösterdi. Dört koşulun dördü de yukarıya işlendi; **iddiaların dördünü de kendim doğruladım**:

| red-team iddiası | benim ölçümüm | sonuç |
|---|---|---|
| Etiket kaynağı `specLabel.ts`, `translateSpecKey` değil | `ProductDetailPageView.tsx:983,991` → `specGroupLabel`/`specFieldLabel`; `translateSpecKey` yalnız satır 339'da **PDF parametresi** | ✅**HAKLI** — Adım 2 düzeltildi |
| Gruplama sayfa düzenini bozar | `autoTable` çağrısı **1**, `didDrawPage` **0** | ✅**HAKLI** — Adım 3, Faz 1'de tek tablo |
| Kapı yazılabilir, emsali var | `pdfGeneratorFallback.test.ts`'te `vi.mock` **×2** | ✅**HAKLI** — Adım 5'e emsal yazıldı |
| Önbellek maddesi "ölçülmedi" değil, **konusuz** | `rendering-cache-standard.md`'de PDF/föy geçişi **0**; `handleDownloadPdf` **3** (istemci) | ✅**HAKLI** — sınırlara işlendi |

⭐**DERS, adıyla:** ilk plan *"biçimlendirmenin tek kaynağı `productHelpers.ts`"* diyordu ve bu
**eksikti** — ikinci bir kaynak (`specLabel.ts`) vardı, ben onu görmedim. Plan o hâliyle
uygulansaydı iş **"yeşil" bitecek ama parite yine sağlanmayacaktı**: föy jenerik fallback
etiketleri basmaya devam edecekti. Red-team'in yakaladığı şey bir hata değil, **kör noktaydı** —
ve kör nokta ancak bağımsız bir gözle görülür.

⚠**Kapsam sınırı (OPS hükmü, 2026-09-06):** Faz 1 = föy ile vitrin aynı biçimlendirici.
Sunucu tarafı PDF hattı **Faz 2**, ayrı karar. `src/utils/productHelpers.ts` **URUN
claim'inde** — kod PR'ından önce URUN'a yazılır, çakışma olmasın.
