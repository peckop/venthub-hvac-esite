# İş-Kayıt Düzeni Standardı

> **Durum:** v1 · 2026-08-26 · Sahip: OPS
> **Kaynak:** Recep'in 08-26 ilkeleri + ORION çürütmesi (`C:/tmp/orion-kayit-duzeni-curutme.md`, 7 bölüm)
> + REC-53 triyaj ölçümleri (`docs/audits/registry-triyaj-2026-08-26.md`).
> **Niçin var:** 2026-08-26'da "açık" görünen 120 kaydın 54'ü ZATEN YAPILMIŞTI, 19'u
> tanımlanamayacak kadar kötü açılmıştı, 5 kimlik çakışıyordu. Sistem geçmişini bilmiyordu;
> aynı iş yeniden öne sürülebiliyordu. Bu cetvel o sınıfı kapatır.

## 1. Katman haritası — hangi soru nereye

| Katman | Rolü | SSOT olduğu alan |
|---|---|---|
| **Linear** | Canlı işlerin tek listesi; açılış ve kapanış burada | **Açık/süren iş** — çelişkide Linear kazanır |
| **orion registry** | Donmuş arşiv defteri (görev takibinden 08-26'da emekli) | **Tarihçe** — "bu iş geçmişte var mıydı/ne oldu" sorusunda registry kazanır |
| **git / PR** | Kanıt | Kodun ve kapanış kanıtının kendisi |
| **Pano (C:/tmp/venthub-board)** | Ajanlar arası anlık telsiz; TTL'li | Hiçbir şeyin SSOT'u DEĞİL — iş kaydı tutulamaz |
| **NLM ikizi** | Doğal dilde aranabilir hafıza | "Niçin/hangi karar/hangi desen" soruları |

Katı kurallar (ORION §5, ampirik sınırlarla):
- **Sayım/enümerasyon/"şu an" sorusu ikize SORULMAZ** (RAG eksik liste verir, snapshot bayattır).
  Kapanış kararı asla ikizden doğrulanmaz.
- **Registry gerekçe METNİ tutmaz, gerekçeye İŞARET tutar** (PR/dosya referansı). Kopyalanan
  anlatı bayatlar; işaret bayatlamaz.
- Beşinci bir katman EKLENMEZ (Notion/Jira/ayrı dashboard/ayrı cron servisi — 08-26 araştırma
  raporu: mevcut dört katman + GitHub Actions cron'ları yeterli; yeni katman SSOT'u böler).

**ORION §4'ten sapma, gerekçesiyle:** ORION "registry SSOT, Linear ayna" önerdi. Sapıyoruz
çünkü Recep 08-26'da registry'yi görev takibinden emekli etti — canlı iş artık yalnız
Linear'da yaşar ve orada yönetilir; registry'nin otoritesi kapanmış tarihçeyle sınırlıdır.
Alan ayrımı yazıldığı için "hangisi doğru" belirsizliği (ORION'un asıl endişesi) doğmaz.

## 2. Kayıt AÇMA şablonu (Linear)

Zorunlu dört alan — dördü de açılış anında **dürüstçe** doldurulabilir olanlardır
(ORION §2: açılışta zorunlu kanıt alanı uydurma üretir — `required-field-pressures-fabrication`):

1. **Ne** — iş tanımı.
2. **Niçin** — değer cümlesi (satan platforma / SaaS hedefine / ekip verimine katkı).
3. **Kabul ölçütü** — "bittiğini nereden anlayacağız." Kapanışı ölçülebilir kılan asıl alan.
4. **Eleme kaydı** — mükerrer adayları ve eleme gerekçeleri (§3).

`Kanıt-Referans` açılışta ZORUNLU DEĞİL (varsa yazılır); **kapanışta zorunludur** (§4).

Kimlik: taşınan kayıtlar eski registry kimliğini (`Txxx-VH` vb.) gövdede taşır.
Başlık konvansiyonu: kimlik kodu baştaki köşeli parantezin İÇİNDE (`[ŞERİT · Txxx-VH]`).

## 3. Mükerrer önleme — aramanın EYLEMİ değil SONUCU

"Arandı, yok" satırı BEYANDIR ve beyan 08-26'da iki kez düştü (ORION §1). Kural:

- Kayıt açan (insan ya da ajan) açmadan önce üç yüzeyde arar: **triyaj/audit belgeleri +
  registry + Linear**. Ama kayda yazılan şey "aradım" değil, **aday listesi + eleme**dir:
  en yakın adaylar ve her birinin tek-cümle eleme gerekçesi "Eleme kaydı" alanına girer.
- Aday yoksa "aday çıkmadı (aranan kelimeler: ...)" yazılır — aranan kelimeler yazılır ki
  yanlış-kelime hatası sonradan teşhis edilebilsin.
- Bu kapı **BLOKLAMAZ** (aday listesi kesin değildir; bloklayan mükerrer-kapısı ilk
  yanlış-kırmızıda atlatılır — T033). Ölçülen şey atlatma oranıdır: elenen bir adayın
  sonradan mükerrer çıkması arama iyileştirme sinyalidir.
- **Kapı adayı (v2):** kayıt açma komutunun aramayı kendisinin koşup adayları ekrana
  basması (araç arar, insan eler). v1'de disiplin + eleme kaydı; v2'de araç.

## 4. Kayıt KAPAMA kuralları

- **Kanıt-Referans zorunlu:** dosya yolu / commit / PR / ölçüm satırı olmadan "bitti" yazılamaz.
- **Kapanış sebebi kapalı sözlükten** (ORION §3 — serbest metin sayılamaz, sayılamayan
  alan üzerinde kapı kurulamaz):
  `yapildi` · `gereksiz-mukerrer` · `gereksiz-kapsam-disi` · `vazgecildi` ·
  `belirsiz-insana-soruldu` · `kurtarilamaz-kayit`
  Son ikisi meşru hükümlerdir: "anlamadık" canlı işle aynı görünürse bir sonraki triyajda
  yine vekil ölçü (tarih!) icat edilir — REC-53 vetosunun kökü buydu.
- Kapanan iş bir sonraki işi doğuruyorsa (T063 örneği: mekanizma bitti, kanal Recep'te),
  **önce ardıl kayıt açılır, sonra eski kayıt ona işaret ederek kapanır** (ORION §6).
- PR gövdesinde `Fixes REC-nn` satırı zorunlu — Linear'ın GitHub entegrasyonu durumu
  otomatik akıtır (08-26 araştırması: free planda dahil; ayrı Action gerekmez).

## 5. Arşiv ve silme

- **Silme YOK.** Kayıt statüyle kapanır, gövdesi ve tarihi arşivde kalır
  (Recep 08-26: "arşiv olmazsa geçmişimizi kaybediyoruz").
- Registry'ye yazma yalnız CLI/engine yolundan (elle SQL yasak).
- Linear free tavanı (250 arşivlenmemiş kayıt) için periyodik arşivleme rutini OPS'ta.
- Toplu kapanış koşumları: önce yedek + kuru koşum + log; "tarihsizlik = ölülük" gibi
  **zaman-vekilli ölçüler YASAK** — bayatlık değişimle ölçülür.

## 6. Şerit reaktivasyon ritüeli

Duraklatılmış bir şerit yeniden açılırken:
1. Dal master'a rebase edilir (yaş ≠ bayatlık; çelişki varsa değişimden ölçülür).
2. İşin Linear kaydı yoksa §2 şablonuyla açılır; varsa durum güncellenir.
3. Triyaj/audit belgelerinde işin geçmişi kontrol edilir (yapılmış kısmı tekrar yapılmaz).
4. Şerit, kapanışlarını `Fixes REC-nn` ile Linear'a bağlar.

## 7. Bu cetvelin kendi kapıları (uygulama sırası)

| Kapı | Soru | Durum |
|---|---|---|
| Ayna-parite | Taşınan her açık registry kaydının Linear kimliği var mı? | ORION kuyruğunda |
| NULL-id | Registry'de id'si boş kayıt var mı? (kök: PK NOT NULL garantisi vermiyor — ORION §7) | ORION kuyruğunda (şema onarımıyla) |
| Sözlük | Kapanış sebebi sözlük dışı mı? | Sözlük sütunuyla birlikte |
