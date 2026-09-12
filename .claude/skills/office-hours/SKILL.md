---
name: office-hours
description: >-
  Bir FİKİR, özellik önerisi ya da "şunu yapsak mı" sorusu ortaya çıktığında — iş emri AÇILMADAN ve
  plan YAZILMADAN önce — BU SKILL'İ KULLAN. Tetikleyiciler: "office hours", "bu fikir değer mi",
  "şunu yapsak mı", "beyin fırtınası", "bunu düşünelim", "buna gerek var mı", "önce bir tartışalım".
  Fikri altı zorlayıcı soruyla (talep kanıtı, mevcut çözüm, somut insan, en dar dilim, gözlem,
  gelecek-uyumu) ve öncül çürütmesiyle sıkıştırır, 2-3 alternatif yol üretir, tek çıktı bir
  TASARIM NOTU'dur (docs/plans/). KOD YAZMAZ, EMİR AÇMAZ, PLAN YAZMAZ. Sınır: yazılmış bir planı
  çürütmek → plan-challenger; kod/PR incelemesi → diff-review/code-review; kapsam belli tek işi
  planlamak → plan modu. Bu skill plandan ÖNCEKİ basamaktır: "doğru problemi mi çözüyoruz?"
---

# Office Hours — Fikir Sorgusu (plandan önceki basamak)

> **KAYNAK:** garrytan/gstack `office-hours` (MIT) — 2026-09-08'de SKILL.md (77 KB) +
> `sections/phase-2a-startup-diagnostic.md` (13 KB) tamamı okundu.
> **ALINAN (yöntem):** altı zorlayıcı soru ve kırmızı bayrakları, "bir kez daha it" duruşu,
> yasak yumuşatıcı kalıplar, aşama-akıllı yönlendirme, öncül çürütme, zorunlu 2-3 alternatif
> ("asgari" + "ideal"), "ödev" fikri, kaçış kapısı, bitiş durumları.
> **BİZDEN:** mühendislik modu (S1 yerine "hangi ölçülmüş arıza?"), Kararlar-defteri kontrolü,
> CLAUDE.md kural çatışması ve render/önbellek adımı, şerit çakışması, çıktı yeri (`docs/plans/`),
> KAYNAK/CETVEL bloğu, DROPPED durumu, tüm Türkçe metin. **ALINMAYAN:** brain cache, telemetry,
> Aside tarayıcı, learnings-log, cross-model second opinion, builder modu.

## Niçin var

CLAUDE.md kural 1 (No-Plan-No-Code) planı zorunlu kılar; `plan-challenger` planı çürütür. İkisinin
de önünde bir boşluk vardı: **fikrin kendisi** hiç sorgulanmıyordu. Bir fikir "iyi görünüyor" diye
doğrudan emir/plan oluyor, sonra plan-challenger doğru çözülmüş yanlış problemi onaylıyordu.
Bu skill o boşluğu doldurur: *plandan önce* "doğru problem mi, gerçek talep mi, en dar dilim ne?"

**SERT KAPI:** Bu skill kod yazmaz, dosya scaffold etmez, iş emri açmaz, plan yazmaz. Tek çıktısı
bir tasarım notudur. Onaydan sonraki adım plan modu / plan-challenger'dır, uygulama değil.

## Ne zaman KULLANILMAZ

- Kapsamı belli, tek dosyalık düzeltme (elle yap).
- Zaten yazılmış bir planın red-team'i (→ `plan-challenger`).
- Recep'in kararı verilmiş, "niçin" sorusu kapanmış iş (kararı yeniden açma; Kararlar defteri var).

## Adım 0 — Bağlam (5 dakika, salt okuma)

1. `CLAUDE.md`, `docs/DURUM-TAKIP.md` (canlı "neredeyiz" + şerit panosu), ilgili
   `docs/standards/*` cetvelini oku.
2. `git log --oneline -30` — yakın geçmişte aynı alana dokunulmuş mu?
3. **Önceki karar var mı?** `docs/plans/` ve Kararlar defterinde (REC-* / K-* başlıkları) fikrin
   anahtar kelimelerini ara. Varsa **önce onu söyle**: "Bu konu REC-nn'de şöyle karara bağlanmış —
   yeniden mi açıyoruz?" Karar yeniden açılmıyorsa skill burada biter.
4. Kod tabanında fikrin dokunacağı alanı CodeGraph ile haritala (grep'ten önce).
5. **Şerit çakışması:** panoda o dosyaları tutan canlı şerit var mı? Varsa notta belirt.

## Adım 1 — Mod seçimi

- **Ürün modu:** vitrin, müşteri, bayi, sipariş, fiyat, katalog — müşteriye dokunan her şey.
  Altı zorlayıcı soru burada.
- **Mühendislik modu:** iç araç, mekanizma, cetvel, hook, CI. Yalnız S2 (mevcut çözüm) ve
  S4 (en dar dilim) sorulur; S1 yerine "hangi ölçülmüş arıza bunu istiyor?" sorulur
  (CLAUDE.md'deki her kural bir arızadan doğdu — yeni mekanizma da öyle doğmalı).

## Adım 2 — Altı zorlayıcı soru (ürün modu)

**Kural: sorular TEK TEK sorulur** (`AskUserQuestion` ya da düz metin; hiçbir zaman toplu).
İlk cevap genelde cilalı versiyondur; **bir kez daha it.** Rahat cevap = yeterince derine
inilmemiş. Her cevapta tavır al ve "hangi kanıt fikrimi değiştirir" de. Yasak kalıplar:
"ilginç bir yaklaşım", "birçok açıdan bakılabilir", "düşünmeye değer" — bunlar pozisyon almaktan
kaçmadır. "Bu şu yüzden yanlış / şu yüzden çalışır" de.

Aşama-akıllı yönlendirme (hepsini sormak şart değil):
- Ürün yok / yeni özellik → S1, S2, S3
- Kullanıcısı var → S2, S4, S5
- Ödeyen müşterisi var → S4, S5, S6
- Saf altyapı → S2, S4

**S1 Talep gerçekliği.** "Birinin bunu gerçekten istediğinin en güçlü kanıtı ne? 'İlgi' değil,
'iyi olur' değil — yarın kaybolsa kim üzülür / kim arar?" *Kırmızı bayrak:* "müşteriler ister",
"rakiplerde var". *Aranan:* somut davranış — bayinin WhatsApp'tan sorduğu, teklif formunda tekrar
tekrar yazılan, destek kaydına düşen şey.

**S2 Mevcut çözüm.** "Bunu bugün nasıl yapıyorlar — kötü de olsa? O yol onlara neye mal oluyor?"
*Kırmızı bayrak:* "hiçbir şey yapmıyorlar, fırsat o yüzden büyük" (o zaman acı yeterince büyük
değil). *Aranan:* telefon, Excel, PDF katalogda arama, teknikerin hesap makinesi.

**S3 Somut insan.** "Buna en çok ihtiyacı olan GERÇEK kişi kim? Unvanı ne? İşini ne kolaylaştırır,
ne zorlaştırır?" *Kırmızı bayrak:* "HVAC firmaları", "bayiler", "mühendisler" — bunlar filtre,
insan değil; kategoriye e-posta atamazsın. *Aranan:* "X firmasında satın alma yapan Y, ay sonu
teklif yetiştiremeyince…"

**S4 En dar dilim.** "Bunun bu hafta çıkarılabilecek, birinin gerçekten kullanacağı en küçük hali
ne?" *Kırmızı bayrak:* "önce altyapıyı kurmak lazım", "küçültürsek anlamı kalmaz" (mimariye
bağlılık, değere değil). *Ek itiş:* "Kullanıcı hiçbir şey yapmadan değer alsa nasıl olurdu?"
VentHub notu: Faz 2 (multi-tenant) PARK'ta (REC-88) — dilim tek operatörle çıkmalı.

**S5 Gözlem ve sürpriz.** "Birinin bunu (ya da mevcut halini) yardım etmeden kullanmasını izledin
mi? Seni şaşırtan ne yaptı?" *Kırmızı bayrak:* "anket yaptık", "demo gösterdik", "beklendiği
gibi". *Altın:* ürünün tasarlanmadığı bir şey için kullanılması — gerçek ürün orada saklıdır.

**S6 Gelecek-uyumu.** "3 yıl sonra sektör farklıysa — ve olacak — bu daha mı gerekli olur, daha
mı az?" *Kırmızı bayrak:* "pazar büyüyor" (büyüme oranı vizyon değil, herkes aynı istatistiği
söyler). *Aranan:* somut tez — mesela "üretici katalogları PDF'ten yapısal veriye geçince
seçici/hesaplayıcı katmanı asıl ürün olur".

**Kaçış kapısı:** Recep "geç bunları, yap" derse: "Sorular işin değeri; iki tane daha sorup
geçiyorum" de, aşama tablosundan en kritik ikisini sor, geç. İkinci kez derse hemen geç — üçüncü
kez sorma. Tam atlama yalnız gerçek kanıtlı (kullanıcı adı, sayı, kayıt) hazır planla; o zaman bile
Adım 3 ve 4 koşar.

## Adım 3 — Öncül çürütme

Çözüm önermeden önce öncülleri açık cümleler halinde yaz, onay al:

1. **Doğru problem mi?** Farklı bir çerçeve dramatik derecede basit bir çözüm verir mi?
2. **Hiçbir şey yapmazsak ne olur?** Gerçek acı mı, varsayımsal mı?
3. **Mevcut kod ne kadarını çözüyor?** CodeGraph ile: hangi servis/bileşen/hesaplayıcı zaten var?
   (Kural: yeniden yazmadan önce yeniden kullan.)
4. **Kural çatışması var mı?** CLAUDE.md 13 mutlak kural + ilgili cetvel: fikir bunlardan biriyle
   çelişiyorsa (ör. Edge'de DB sorgusu, `ssr:false`, PPR — PPR kullanılmıyor, örnek olarak anılır) burada söylenir, planda değil.
5. **Render/önbellek etkisi:** fikir statik vitrin sayfasında görünen bir veriye dokunuyorsa
   `rendering-cache-standard.md` gereği tetik + revalidate dalı gerekir (2026-08-15 arızası).

```
ÖNCÜLLER:
1. [cümle] — katılıyor musun?
2. [cümle] — katılıyor musun?
3. [cümle] — katılıyor musun?
```

Katılmadığı öncülde anlayışı düzelt, geri dön.

## Adım 4 — Alternatifler (ZORUNLU, en az 2)

```
YOL A: [ad]
  Özet:     1-2 cümle
  Efor:     S/M/L/XL   Risk: Düşük/Orta/Yüksek
  Artı:     2-3 madde   Eksi: 2-3 madde
  Yeniden kullanır: mevcut kod/cetvel
  Dokunur:  dosya/alan (şerit çakışması?)   Migration gerekir mi: E/H (kural 13)
YOL B: …
YOL C: … (isteğe bağlı, yan çerçeve)
```

Biri **"asgari uygulanabilir"** (en az dosya, en hızlı), biri **"ideal mimari"** olmalı.
**ÖNERİ:** [X] çünkü [Recep'in söylediği hedefe bağlanan tek cümle].

Tek soru ile seçim iste. **DUR.** Cevap gelmeden tasarım notu yazılmaz; "açıkça kazanan yol"
bile bir karardır ve açık onay ister.

## Adım 5 — Tasarım notu

Onaylanan yolu `docs/plans/<konu>-tasarim-notu-YYYY-MM-DD.md` olarak yaz. Bölümler:
Problem (S1-S3 cevaplarıyla, somut insan adıyla) · Öncüller (onaylı) · Yollar ve seçim · Kapsam
dışı (bilinçli bırakılanlar) · **KAYNAK/CETVEL bloğu** (kural 1: yöneten cetvel dosya adları ya da
"cetvel yok — yazımı işin kapsamında") · **Sonraki adım:** plan modu mu, doğrudan plan-challenger mı,
iş emri mi (`YÖNTEM:` satırıyla) · **Ödev:** Recep'in yapacağı somut gerçek-dünya eylemi
("bir bayiye bunu göster", "üç teklif formuna bak") — strateji değil, eylem.

Hiçbir tasarım notu ödevsiz bitmez.

## Bitiş durumu

- **DONE** — tasarım notu onaylandı, sonraki adım yazıldı.
- **DONE_WITH_CONCERNS** — onaylandı, açık sorular listelendi.
- **NEEDS_CONTEXT** — sorular cevapsız kaldı, not eksik.
- **DROPPED** — sorgu fikrin gereksiz olduğunu gösterdi; bu da başarılı bir çıktıdır, notta
  "niçin bırakıldı" yazılır (aynı fikir bir daha gelince tekrar sorgulanmasın).

<!-- ORTAK-BITIS-BASLANGIC (kaynak: .claude/skills/_ortak/bitis-durumu.md) -->
## Bitiş Durumu, Karışıklık ve Kanıtsız Kısıt

**Bitiş durumu — son satırda `DURUM: <kelime>` biçiminde söylenir.** Kelime **yalnız şu dörtten
biri** olabilir: `BITTI` (istenen yapıldı ve ölçüldü) · `CEKINCELI` (yapıldı ama adı konmuş bir
çekince var) · `ENGELLI` (dışarıdan bir şey bekliyor) · `BAGLAM-EKSIK` (soru cevaplanmadan devam
edilemez).

⚠**Beşinci kelime uydurulmaz.** "BEKLEMEDE", "KISMEN", "DEVAM EDIYOR" gibi kelimeler bu listede
yoktur; beklemek `ENGELLI`dir, yarım kalmak `CEKINCELI`dir. Kapalı liste bilinçli: kelime serbest
kalırsa her çağrı kendi sözlüğünü yazar ve durum makine tarafından okunamaz hâle gelir.

`BITTI` dışındaki her durum şu üçünü de yazar: **SEBEP** (tek cümle) · **DENENEN** (ne denendi,
sonucu ne oldu) · **ÖNERİ** (bir sonraki somut adım, kimde).

**Karışıklık:** yüksek riskli bir belirsizlikte tahminle devam edilmez — **DURULUR**, iki üç
seçenek gerekçesiyle yazılır ve biri önerilir. Yüksek risk: geri alınması pahalı olan, prod'a
dokunan, başka şeridin dosyasını değiştiren, para veya sır ilgilendiren iş.

**Kanıtsız kısıt yoktur:** *"olmuyor / erişemiyorum / araç desteklemiyor"* tek başına sonuç
değildir. Kısıt iddiası **birebir hata metni**, **belgeden alıntı** ya da **canlı ölçüm** ile
gelir. Kanıt yoksa doğru cümle *"ölçemedim"*dir, *"yapılamaz"* değil.

⚠**Ölçemedim ile ihlal ayrı sonuçlardır.** İkisini aynı kovaya koymak, bozuk bir ölçümü
gerçek bir kusur gibi raporlar.
<!-- ORTAK-BITIS-SON -->
