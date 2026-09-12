---
name: venthub-tasarim-dili
description: 'VentHub''in KENDI tasarim dili: Kararlar belgelerinden K numarali sert
  kurallar, tek kaynak adresleri, kare kabul olcum satiri ve OPS->Design emir/cevap
  kalibi. Vitrin/menu/urun sayfasi/liste-karsilastirma/kurumsal belge/marka-logo
  tasarimi, design token-renk kurallari, Claude Design emri yazma ve kare kabulu
  icin. Yabanci stil recetesi ya da gorsel uretim DEGILDIR.'
category: guards
metadata:
  triggers:
  - tasarim dili
  - vitrin tasarimi
  - menu tasarimi
  - urun sayfasi tasarimi
  - kurumsal belge tasarimi
  - Claude Design emri
  - kare kabul olcumu
  - design system kurali
  inputs:
  - docs/proje-takip/linear/kararlar-*.md
  - src/design-system/tokens.js
  outputs:
  - kare kabul/ret hukmu + olcum satiri
  - ops-emir-<tarih>-<n>-<proje>.md
  recovery:
    Kararlar ayna BAYAT: python scripts/nlm/kararlar_disa_aktar.py --tarih <bugun> (betik PR #1062 ile gelir)
  sahip: OPS (Kararlar'i OPS tutar; Design seritleri yazar, OPS olcer ve kabul eder)
  kaynak: REC-173 adim 3 (2026-09-06, Recep: tasarimlar bizim tarafimizda koruma altina alinmali; yarin baska bir AI araci kullanilabilir)
---

# VentHub tasarım dili — bizim skill'imiz

> 2026-09-06'da yazıldı. Kaynağı **Kararlar belgeleri**dir; buradaki her kural oradaki bir K numarasına bağlıdır.
> Çelişirse Kararlar kazanır. Kararlar'da olmayan bir kural buraya eklenmez (kural 1: karar yazılmadan verilmiş sayılmaz).
> Araçtan bağımsızdır: Claude Code, Antigravity ya da başka bir AI kod aracı aynı dosyayı okur.

## When to Use
- Vitrin, menü, ürün sayfası, liste/karşılaştırma, kurumsal belge (kartvizit, e-posta, föy) tasarımı yapılırken ya da incelenirken.
- Claude Design projelerine (MENU · BELGE · LOGO/MARKA · DS) emir yazarken, gelen kareyi kabul/ret ederken.
- "Bu renk / yarıçap / gölge / kiremit / kip anahtarı doğru mu" sorusunda.
- KULLANMA: kod refactor, git, test koşumu, veri tabanı işi, görsel üretimi (yetenek yok), hazır tema arayışı.

## 1. Tek kaynaklar (önce bunlara bak)

| Ne | Nerede | Not |
|---|---|---|
| Vitrin/menü/ürün sayfası kararları (K1–K39) | Linear belge "Kararlar — Vitrin 15A" `061e6113-0f57-4296-a327-4e0f1a07cd76`; ayna `docs/proje-takip/linear/kararlar-vitrin-15a-<tarih>.md` | Ayna gün kapanışında yenilenir; eski tarihli ayna BAYAT (recovery komutu) |
| Kurumsal belge kararları | Linear belge "Kararlar — Kurumsal Belgeler" `9e95d258-98a2-4c51-9a2d-40576c87a7bf`; ayna `kararlar-kurumsal-belgeler-<tarih>.md` | |
| Katalog / ürün verisi kararları (K1–K8: teknik alan, aile föyü) | Linear belge "Kararlar — Katalog ve Ürün Verisi" `935079bf-b265-49d2-854a-a334abea07af`; ayna `kararlar-katalog-<tarih>.md` | Vitrinde görünen her teknik değer buradan |
| Tasarım token'ları | `src/design-system/tokens.js` + Tailwind ayarı | Kural 8: arbitrary Tailwind değeri YASAK; renk HEX değil CSS custom property (HSL); a11y `focus-visible:` |
| Claude Design projeleri (kum havuzu; kod değil) | MENU `be615496…` · BELGE `4e491d28…` · LOGO/MARKA `670f9f75…` · DS `31b0824c…` | Onaylanan tasarım koda geçince gerçek değer depodadır (REC-173 günlük arşiv) |
| Marka kılavuzu | LOGO projesinde `1 Venthub Marka Kilavuzu.dc.html` (K32–K35: bölüm F5–F8) + `brand/logo/*.svg` | Logo elle çizilmez (K23) |

> Doğrulama: docs/audits/rec176-skill-dogrulama-2026-09-07.md — her satır Kararlar gövdesiyle karşılaştırıldı (2026-09-07).

## 2. Sert kurallar (K numarasıyla; ihlal = kare RET)

- **K21 · Örnek ürün değişirse her şey veriden.** Çizimde örnek ürün DEĞİŞİRSE aynı turda kimlik satırı + sertifika çipleri + açıklama + hesap gerekçesi + seçici eksenleri `technical_specs`/`description_i18n`'den yeniden yazılır; anahtarsız eksen seçici olarak çizilmez (K7 uzantısı). (K21 uygulama notu: SEAT 40 ve STORM 40 katalogda YOK → gerçek kardeşle, SEAT 35 / JET 25, değişir; var olmayan model çizilmez.)
- **K7 · Teknik alan yalnız dolu.** Teknik tabloda varsa satır, yoksa satır hiç yok ("—" / "belirtilmemiş" yazılmaz); süzgeçler de yalnız dolu alanlardan kurulur. Şema dışı alan (malzeme/montaj/sertifika gibi) katalog K2'nin konusu: şemada yok, genişletme migration'ı Recep kapısından geçer.
- **K18a · Değerlendirilemeyen gizlenmez.** Eğrisi/verisi olmayan ürün "değerlendirilemedi" hükmüyle görünür; "uymaz" denmez, saklanmaz.
- **K5 · Kiremit ve düğme.** Her sayfada TEK dolu kiremit, o da sayfanın işini bitiren eylem; diğer her düğme çerçeveli. Eylem asla ince metin bağlantısı olmaz. Kart eylemleri çerçeveli: Karşılaştır + Teklif listesine ekle. Tek fiil "Teklif iste" ("Teklif al" yok); gövde düğmeleri bağlama özel etiketli (hero/ürün/liste/senaryo ayrı metin).
- **K37-c · Recep'in üç hükmü.** U3 = PANEL (karar, kalıcı sütun hâli ARŞİV). Öncelik: v17 kip anahtarı (Teklif ↔ Satış) tek yerden bütün karelere uygulanır, kısmi adaptasyon kabul değil. Prototip kare 13 kalıbına yeniden kurulur. (K37-c uygulama notu — teslim/ölçüm kaydı, ayrı bir yasak değil: kip anahtarı kabuğu tek kaynaktan döndüğü DOM'da doğrulandı, `kipSayacAdi`/`kipSekmeAdi`; teklif karelerinde ₺ ölçümü 0. Kuralın kendisi K37/K18-c'de: kural motoru `secim-kurallari.json` tek kaynak.)
- **K38 · Satış kipi kimliği.** Satış kipinde kiremit "Sepete ekle", "Teklif iste" çerçeveli (teklif kipinde bugünkü hâl kalır). Fiil ailesi kod sözlüğünden (`tr.ts` SSOT): satır eylemi "Sepete Ekle", listeyi bitiren eylem "Ödemeye Geç"; "Siparişi tamamla"/"Satın al"/"Sipariş ver" açılmaz. Fiyat tipografisi IBM Plex Mono `tabular-nums`, yeni renk/rozet yok. Stok K30 rozet sınıflarıyla (yeşil/kırmızı nokta açılmaz).
- **K39 · Fiyatsız ürün satış kipinde "Teklif iste".** `product_prices`'ta geçerli fiyatı olmayan her ürün satış kipinde kart ve PDP'de "Teklif iste" eylemiyle görünür (K5 kiremit, tek fiil), fiyat satırı yok, sepete eklenemez, gizlenmez. Fiyatsız ailede "…'den başlayan" satırı çizilmez (K7); aile eylemi de "Teklif iste". Teklif kipinde değişen yok.
- **K22 · Durum alfa ile anlatılmaz;** çizilmez/arşiv/yetersiz/kapalı gibi durumlar `opacity` ile değil **soluk hex + zemin + rozet** ile gösterilir; metin her zaman tam opaklık, tek istisna görsel (`<img>`) şeritleri. (K23-b, yalnız marka işareti/logo için: sönükleştirme de kaynak dosyadan gelir — `venthub-isaret-soluk*.svg` — CSS filtre/opacity ile üretilmez; bu K22'nin genel UI durumlarına değil, logoya özeldir.)
- **K25 · Turkuaz metin rengi değildir;** metinde `--brand-cyan-ink`. **K25-b:** sayaç ve kiremit düğme zemini koyulaşır.
- **K28 · Ham hex ölçütü.** Ham hex ihlaldir ancak ve ancak DS'te yayınlanmış bir token karşılığı varsa. **"Ham hex 0" hedef DEĞİLDİR**; doğru beyan A kümesi 0 (token karşılığı olan değer ham yazılmış). DS'in ölçüp tanımladığı ama token yayınlamadığı değer (B) ham kalır ve token isteği K26 yoluyla DESIGN-MARKA'ya gider; tek kullanımlık kabuk varyantları (C) ve bilinçli semantik çiftler (D) ihlal değildir.
- **K26 / K27 · Değer emri kaynağa gider, DS türetir; tekrar eden desen DS'e çıkar, ekran DS'e girmez.**
- **K23 / K23-a · Logo elle çizilmez; ikon kontur kalınlığı sözleşmedir.**
- **K37 · Dinamik, statik değil.** Tasarım kararı çalıştırılarak verilir (Ürün Seçici prototipi); kural motoru tek kaynak (`secim-kurallari.json`).
- **K37-a U3 · Yapısal karar tek başına sorulur.** Ekran 58 panel mi kalıcı sütun mu sorusunda Menü iki hâli tek karede önerir, karar Recep'in — yapısal, tek başına sorulur, toplu onaya gömülmez. (Bu ilke şimdilik yalnız bu örneğe bağlı; genel bir "menü yeri/URL şeması/sayfa mimarisi" kategorisi Kararlar gövdesinde YOK.)

## 3. Kare kabul ölçümü (Instructions — OPS böyle ölçer, Design böyle raporlar)

1. Kararlar aynasının tarihini kontrol et; bayatsa recovery komutuyla yenile.
2. Kareyi indir (`design_dl.py <proje-uuid> "<kare>.dc.html" <hedef>`), metnini çıkar, §2 kurallarını tek tek say.
3. **Ölçüm satırı** yaz: sayılabilir, tekrarlanabilir, DOM ya da dosya üzerinden. Örnek:
   `kip=Satış DOM'da fiyatsız üründe "Sepete ekle" 0 · "Teklif iste" ≥1 · ₺ 0 · "fiyat yok/—" 0 · ham hex 0 · kırık görsel 0`.
4. Hüküm: KABUL / KISMEN (tek düzeltme, ölçüm satırıyla) / RET (K numarası + sayı). "Güven" ölçü değildir.
5. Ölçülmemiş sayı karede duramaz: koşullu cümle motorla sınanır ya da sayısız yazılır.

## 4. OPS → Design emir/cevap kalıbı

- Emir dosyası: `ops-emir-<YYYY-MM-DD>-<n>-<proje>.md` (proje köküne `design_push.py <PROJ> <dosya>` ile); başlık `# OPS EMRİ → DESIGN-<PROJE> · <tarih> · #<n> · <tek cümle>`; gövde: önceki teslimin kabul/ret ölçümü → sıradaki iş (tek tur) → ölçüm satırı → "Recep'e soru var mı" (yoksa açıkça "Recep'e soru yok").
- Cevap dosyası: `ops-cevap-<tarih>-<proje>-<konu>.md`. Design'ın notu: `emir-<n>-notlar.md` ya da `<kare>-notlar.md`.
- Devir: yeni sohbet önce `DEVIR.md`, sonra `ops-devir-eki-*.md`. Design kendiliğinden tetiklenmez; Recep "Linear'a bak" der.
- Design projeleri kum havuzudur: Design **koda ve canlıya yazmaz**; API anahtarı proje dosyasına girmez; kare dış ağa çıkmaz (K18-c madde 3 RET).

## 5. Bu skill NE DEĞİLDİR

Hazır tema, stil reçetesi, "pahalı görünüm" tarifi, görsel üretim yeteneği değildir (2026-09-06'da 20 yabancı skill bu yüzden karantinaya alındı: `docs/audits/skill-envanteri-2026-09-05.md`). Yeni bir tasarım kuralı gerekiyorsa önce Kararlar'a K numarasıyla girer, sonra buraya satır eklenir.

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
