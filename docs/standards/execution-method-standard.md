# Yürütme Yöntemi Cetveli — v1.0 (T144-VH)

> **Bu dosya nedir?** Bir işin **hangi yürütme yöntemiyle** yapılacağına karar verirken bakılan
> tablo: kalıcı şerit mi, şerit içinde alt-ajan mı, Workflow mu, maestro mu, hazır skill mi, düz
> elle mi. Yöntem ≠ iş emri; yöntem, emrin **nasıl** koşacağıdır.
>
> **Neden var?** 2026-08-21 Recep tespiti: *"skill'leri biliyorum diyorsun ama kullanmıyorsun."*
> Ölçüm doğruladı: yöntem seçimi hiçbir yerde yazılı değildi, ajanın o an hatırlamasına
> bırakılmıştı; hatırlanmayınca varsayılan hep "elle yap" oldu. Aynı gün T141 ölçümü üç paralel
> Sonnet ajanıyla 30 dakikada bitti — doğru yöntemdi ama karar emirde değil, aklımdaydı.
> Cetveli olmayan karar, kimsenin göremediği bir boşlukta verilir (CLAUDE.md kural 1).
>
> **Bu cetvel DAYATMAZ, GÖRÜNÜR KILAR.** Zorunlu olan seçimin *kendisi* değil, seçimin
> **yazılması**dır (§3). Ajan işi ölçer, yöntemi kendi seçer; emirdeki satır **öneridir**,
> sahibi gerekçesiyle değiştirebilir. (Recep, 08-21: *"kendileri ölçebilecek; zorunluluk
> sorun yaratır."*)

---

## 1. Yöntemler (araç kutusu)

| Yöntem | Nedir | Ömür / hafıza | Maliyet sınıfı |
|---|---|---|---|
| **Şerit** (kalıcı oturum) | Adlı, sahipli Claude Code oturumu; pano claim + üçlü yedek nabız + kendi cron ofseti | Günler; compact'a dayanır (damga + kalıcı imleç) | YÜKSEK (tam bağlam, insan kararı ister) |
| **Alt-ajan** (`Agent`, çoğunlukla Sonnet) | Şeridin içinden açılan kısa ömürlü ajan; sonucu döner, hafızası yok | Dakikalar; tek görev | DÜŞÜK-ORTA (Sonnet mekanik okuma için) |
| **Workflow** | Deterministik betikle çok ajanı düzenleme: fan-out → çürütme → sentez | Tek koşum | ORTA-YÜKSEK (ajan sayısına göre) |
| **maestro** (skill) | Çok dosyaya **aynı** yapısal değişikliği paralel dalgalarla uygulama + yargıç + merkezi kapı | Tek koşum, çok PR | YÜKSEK ama elle yapmaktan ucuz |
| **agy-orchestrate** (skill) | Antigravity/Gemini filosuyla ucuz geniş tarama; Claude CodeGraph ile doğrular | Tek koşum | DÜŞÜK (Claude kotası yerine Gemini) |
| **Tekil skill** (plan-challenger, diff-review, code-review, 20-eksen, prd-complexity, supabase-security…) | Paketlenmiş tek amaçlı prosedür | Tek koşum | DÜŞÜK-ORTA |
| **Elle** (oturumun kendisi) | Doğrudan okuma/düzenleme | — | En ucuz, en dar |

---

## 2. Karar tablosu (iş tipi → önerilen yöntem)

| İşin şekli | Önerilen | Ne zaman **kullanılmaz** | Çıktı nereye |
|---|---|---|---|
| Günler süren, **sahiplik** isteyen, **prod kapısı** olan iş (migration, veri göçü, bir alanın tüm hattı) | **Şerit** | Bir saatlik iş (şerit kurulumunun sabit maliyeti ~1 saat) · başka şeridin dosyalarında (ikiz şerit açılmaz, §4) | Pano + registry + PR'lar |
| **Salt-okuma ölçüm**, birden çok bağımsız eksen (mekanizma nasıl çalışıyor / kırılma noktaları / envanter) | **Alt-ajan ×N paralel** (Sonnet), yargı şeritte | Tek soru tek dosyadaysa → CodeGraph/elle | `scratchpad` → sahibi doğrulayıp `docs/audits/` |
| **Çok-eksenli denetim** ya da bulgunun **bağımsız çürütülmesi** gerekiyor ("gerçek mi?") | **Workflow** (fan-out + çürütme + sentez) | Kullanıcı açık opt-in vermediyse araç kilitli → emirde **"workflow kullan"** yazmalı | `docs/audits/` |
| Repo çapında **geniş tarama** ("her X'i bul", 50+ dosya) | **agy-orchestrate** (ucuz) → CodeGraph doğrulama | Yargı gerektiren her adım (agy tarar, karar vermez) | `docs/audits/` |
| **Aynı yapısal değişiklik çok hedefe** (24 admin sayfası → ortak kit; 40 bileşen → aynı hook) | **maestro** | Tek dosya · hedefler birbirinden farklı (o zaman şerit içinde sıralı) | Dalga PR'ları |
| **Plan** yazıldı, uygulanmadan önce — özellikle **migration / veri göçü / rota değişikliği** | **plan-challenger** (red-team) | Docs-only plan, geri alınabilir tek PR | `red_team_report.md` → plana "ÇELİŞEN-MEVCUT" |
| **PR diff** incelemesi | **diff-review** / **code-review** | — | PR yorumu |
| **Lansman öncesi / büyük katman değişti** | **venthub-20-eksen-denetimi** (karne) | Tek kusur avı | `docs/audits/` karne |
| "Neyi silebiliriz, vizyona sadık mı" | **prd-complexity-audit** | Bug avı | `docs/audits/` |
| RLS / politika / migration yazımı | **supabase-security** + plan-challenger | — | migration + INV |
| Tek dosya, tek PR, net iş | **Elle** | Dosya sayısı 5'i geçince yukarıdakilerden birine | PR |

**Seçim ilkesi:** önce *şekli* tanı (kaç dosya? salt-okuma mı yazım mı? yargı mı tarama mı? kaç gün?),
sonra tabloya bak. Şüphede: **ölç** (dosya sayısını, hedef sayısını, süreyi) — cetvel tahminle değil
ölçümle kullanılır.

---

## 3. Görünürlük kuralı (tek zorunluluk)

1. **İş emrinde `YÖNTEM:` satırı** — emri yazan (OPS / şerit sahibi) önerilen yöntemi **ve bir
   cümle gerekçeyi** yazar. Yazılmamışsa emir eksiktir. Workflow gerekiyorsa opt-in cümlesi
   ("workflow kullan") bu satırda geçer; böylece araç kilidi açılır.
2. **Sahibi değiştirebilir** — ölçüp başka yöntem seçerse işbaşı/pano notuna *"YÖNTEM: X yerine Y,
   çünkü …"* yazar. Bu sapma hata değildir; **yazılmamış sapma** hatadır.
3. **Ölçüm** — haftalık denetimde *emirdeki yöntem ≠ kullanılan* sayılır; sapmaların gerekçesi
   cetveli **günceller** (cetvel yanlışsa cetvel değişir, ajan zorlanmaz). Standart + ölçen denetim =
   kontrol; yalnız standart = raf.

---

## 4. Şerit sınırları (ölçülmüş dersler)

- **Aynı şeridin ikizi açılmaz.** Pano kilidi oturum bazlıdır; aynı globları iki oturum claim
  ederse iki sahip, karışık kıdem, çarpışan PR (08-17 hayalet-sid vakası). Paralellik ya **ayrık
  dosyalı ikinci şerit** ya **şerit içinde alt-ajan** ile sağlanır.
- **Canlı şerit sayısı insan bant genişliğiyle sınırlıdır.** 08-21 ölçümü: 7 şeritten 5'i BAYAT —
  tek karar mercii 7 pencereye yetişemez. Pratik tavan: **2-3 canlı şerit + şerit içi alt-ajan + lider.**
- **Alt-ajan yargı vermez.** Çıktısı şerit sahibi tarafından örneklenerek doğrulanır; doğrulanmamış
  ajan çıktısı rapora girmez (T141: ajan raporları önce scratchpad, sonra denetlenip audits).
- **Mekanik okuma Sonnet'e, yargı ve sentez şeride** (filo kuralı 08-20).

---

## 5. Bilinen sınırlar (dürüstçe)

- Cetvel, ajanın **hatırlamasına** bağlı kalmasın diye CLAUDE.md'den işaretlenir ve emir şablonuna
  satır olarak girer; yine de ajan satırı boş geçebilir — bunu yalnız haftalık sapma sayımı yakalar.
- Maliyet sınıfları nitel; token ölçümü yapılmadı. İlk dört haftanın pano notlarından nicel tablo
  çıkarılınca v1.1.
- Workflow'un opt-in kilidi araç düzeyindedir; cetvel onu kaldıramaz, yalnız emirde cümleyi
  hatırlatır.

---

## 6. ÖLÇÜLMÜŞ VAKALAR (2026-09-06) — ve üçün **ikisi zaten yazılıydı**

⭐Bu bölüm "üç ders yazılsın" diye açıldı; ölçünce ikisinin **bu cetvelde hâlihazırda yazılı**
olduğu görüldü (§4 alt-ajan maddesi · §2'nin `plan-challenger` satırı). Eksik olan **kural
değil, uygulamaydı** — *cetveli yazmak, cetveli kullanmak değildir.* Bu yüzden aşağıda **bir**
yeni kural var; diğer ikisine **kanıt** eklendi. Aynı satırı ikinci kez yazmak cetveli
şişirir ve okunmaz kılar.

### 6.1 YENİ KURAL — **İSİM LİSTESİ ÖLÇÜM DEĞİLDİR**

> Bir listedeki **adlar** doğru gözlem olabilir; **o adların neden listede olduğu** ölçülmemiş
> varsayımdır. İş emri açılmadan önce listenin **evreni** ölçülür: her ad, iddia edilen
> mekanizmaya gerçekten maruz mu?

Aynı gün **dört** vaka çıktı:

| şerit | liste ne diyordu | ölçüm ne dedi |
|---|---|---|
| ALTYAPI | "paralelde yarışan **4 kararsız kapı**" | **2 dosya** — INV-DOC-7 ayrı dosya değil (aynı dosyada `describe`), `bash-write-audit-merge-muafiyeti` izole (`mkdtempSync`) → **yarışamaz** |
| URUN | "**24** alt kategoride doğrudan ürün yok" | yalnız `category_id` ölçülmüş; `subcategory_id` ile **17'sinde ürün var** (365 ürün) |
| URUN-KATALOG | aile sayımı **31** | **40** (ölçüt: kimlik cümlesi başlığı) |
| OPS | "yeniden yüklendi" (iki kez) | `design_push` mutlak yol çöpü — alıcının okuduğu yerden ölçülmemişti |

Ortak ad: ⭐**ölçüt keskin, evren yanlış.** Bedeli ucuz değil — yanlış evren **iş emri doğurur**.

### 6.2 §4'ün alt-ajan maddesi ÖDEDİ — çift yönlü (kanıt)

Altı alt-ajan koştu. Örnekleme **iki yönde** kazandırdı: bir ajan **benim** plan premisimi deldi
(yukarıdaki 4→2 vakası ondan çıktı); başka bir ajan **yanıldı** (*"PDF üretim kütüphanesi yok"* —
`jspdf` duruyordu). İkisi de aynı kuralın karşılığı: **ajan hızlı ölçer, yargı şeritte kalır.**

### 6.3 §2'nin `plan-challenger` satırı ÖDEDİ (kanıt)

REC-158 planı red-team'den geçti ve **düştü**: *"tek biçim kaynağı `productHelpers.ts`"* denmişti,
etiketin gerçek kaynağı `specLabel.ts`'ti. Plan o hâliyle uygulansaydı iş **"yeşil" biter,
parite yine sağlanmazdı** — kapı bile fark etmezdi, çünkü kapı da aynı yanlış kaynağa bakardı.

⚠**Sapma notu:** emir "üç satır" diyordu; ikisi zaten yazılı olduğu için **bir kural + iki kanıt**
yazıldı. Sebep burada, kararı veren ALTYAPI (§3.2: yazılmamış sapma hatadır, yazılmış sapma değil).

---

İlgili: `collaboration-protocol.md` §2.1 · `measurement-discipline-standard.md` ·
`session-loop-ritual.md` · CLAUDE.md kural 1 (No-Plan-No-Code: plan hangi cetvelle yönetildiğini söyler —
artık **hangi yöntemle koşacağını da**).
