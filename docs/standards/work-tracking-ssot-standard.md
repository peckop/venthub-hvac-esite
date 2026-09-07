> ⛔ **YÜRÜRLÜK (2026-08-26): SSOT = Linear.** Aşağıdaki **Model A / Orion Registry / Model B / KIBridge**
> hükümleri **TARİHÇEDİR, uygulanmaz** → yürürlükteki cetvel: `docs/standards/is-kayit-duzeni-standard.md` (§1 katman
> haritası). Orion registry = donmuş **salt arşiv** (REC-42/REC-53). Bu dosyada hiçbir hüküm canlı iş takibini
> yönetmez; çelişkide is-kayit-duzeni kazanır. (Not tarihi: OPS 2026-09-04; başa taşıma + netleştirme OPS 2026-09-06.)
> "DURUM-TAKIP.md KIBridge ile üretilir" satırı da hiç uygulanmadı (§3 notu).
> Kaynak: `docs/proje-takip/celiski-mukerrerlik-analizi-2026-09-04.md` D1/D2.

# VentHub — İş-Takibi & Dokümantasyon SSOT Standardı (Cetvel) — v1.0 — **[ESKİ — tarihçe]**

> **Bu dosya nedir?** *"Bir iş / karar / durum bilgisi NEREDE yaşar ve mükerrerlik nasıl önlenir?"* sorusunun
> karar veren cetveli. Amaç: aynı bilgi iki yerde **elle** tutulmasın — yoksa drift olur, takip ölür, işler
> birbirine girer.
> **Kaynak:** 2026-06-20 tasarım oturumu — lokal twin + iki NLM defteri (Orion + Orion Registry) + **canlı CLI
> doğrulaması** + `orion-registry` kaynak doğrulaması. Strateji memory: `documents-are-the-decision`,
> `orion-consolidation-parity`, `doc-committed-not-work-done`.

---

## 1. Sorun — neden bu cetvel var
Aynı "ne yapılacak / neredeyiz" bilgisi şu yüzeylere dağılabilir: `DURUM-TAKIP.md` · Orion registry (task/decision) ·
standart/plan docs · `CHANGELOG`/git · agent-memory. **İki+ yüzey aynı bilgiyi elle tutarsa → drift → takip imkânsız.**

## 2. Çekirdek kural — her bilgi TEK yerde yaşar, ötekiler İŞARET eder (kopyalamaz) — **[ESKİ — tarihçe: tablodaki "Orion registry" SSOT satırları 2026-08-26'dan beri Linear'a geçti]**

| Bilgi türü | SSOT (tek yer) | Ötekiler ne yapar |
|---|---|---|
| Ne + niçin yapılacak (**detay**) | standart/plan/`VISION.md` | registry task **link verir**, detayı kopyalamaz |
| **Neredeyiz** (lane/durum anlatısı) | **`DURUM-TAKIP.md`** (insan-SSOT) | registry id'lerine referans; paralel status-listesi TUTMAZ |
| Yapısal work-order (id/status/priority) | **Orion registry** (`tasks`) | `session recall`/`orion_durum` canlı okur |
| Mimari/stratejik **karar** | Orion registry (`decisions`) + bu tür docs | registry kaydı + doküman, biri ötekine link |
| Biten iş geçmişi | `CHANGELOG` + git | registry'de `completed` işaretlenir, anlatı değil |
| Claude cross-session ders | agent-memory (`.claude/.../memory`) | docs/registry'yi tekrarlamaz, ince pointer |

> **Demir kural:** Yeni doküman/satır yazmadan önce sor — *"Bu bilgi başka yerde zaten SSOT mu?"* Evetse **link ver,
> kopyalama.** Registry entry = **ince kulp** (`id + başlık + status + link`), detayı taşımaz. Bir work-order'ın
> **status'ü TEK yerde** güncellenir.

## 3. [ESKİ — tarihçe] Mevcut model — **Model A (hibrit)** [ŞİMDİ → 2026-08-26'ya kadar; sonrası Linear]
- **Registry `tasks` = yapısal work-order + status SSOT** → `session recall` / `orion_durum` canlı gösterir (KURULU, çalışıyor).
- **`DURUM-TAKIP.md` = insan anlatısı / lane / gerekçe**, registry **id-referansı** taşır; paralel yetkili status-listesi tutmaz.
- **Detay = plan/standart doc** · **biten = CHANGELOG/git** · **ders = memory.**
- → Her work-order tek yerde (registry); anlatı tek yerde (DURUM-TAKIP); detay tek yerde (doc). **Mükerrerlik yok.**

## 4. [ESKİ — tarihçe] Hedef model — **Model B (DB-First, MD generated)** [HEDEF → terk edildi; SSOT Linear]
- **registry = tam SSOT; `DURUM-TAKIP.md` DB'den OTOMATİK üretilir** (KIBridge / db→md). Elle-bakım biter, drift kökten ölür.
- Bu Orion'un kendi **AXIOM-1 (DB-First / MD-as-Output)** doktrini — bizim tercihimiz değil, mimari doğru son-durak.
- ⛔ **ENGEL:** KIBridge **hiçbir yerde kurulu değil** (bkz §5) → **net-new inşa** gerekir.

## 5. [ESKİ — tarihçe] Orion altyapı paritesi (kanıt — 2026-06-20 canlı doğrulama)
3 proje (orion-registry + cortex + corpus-callosum) **tek `orion` çatısına** birleşti ("%100 değil, ihtiyacı çözecek kadar"; `cc` CLI → `orion` CLI).

- **✅ KURULU + bizim kullandığımız:** registry (task/idea/decision) · `session recall/seal/summary/diff/timeline` · `orion_durum`/`orion_twin` · doc-pipeline + NLM twin · memory · code/alignment (drift/blast) · safety (autonomy L0-L3/andon/audit).
- **❌ TAŞINMADI (bilinçli kesim — biz kullanmıyoruz):** ACEE orchestrate/DAG executor · scope_police · kaizen · department_manager · Voltran REST servis (kod var, entry-point yok).
- **❌ KIBridge (work-state→MD) — KAYNAK-DOĞRULAMALI KESİN:** ne `orion-registry`'de (referans; `class KIBridge`/`reassemble_markdown` grep BOŞ, son commit 2026-06-12 = donmuş) ne birleşik `orion`'da var. **Hiçbir yerde kurulmamış**; her ikisinde backlog. *(NLM "Orion" defteri "kurulu" dedi = halüsinasyon; "Orion Registry" defteri "backlog" = doğru → çelişince kaynağa bak.)*

## 6. [ESKİ — tarihçe] Aşamalı yol haritası (Model A/B için; 2026-08-26 Linear göçüyle geçersiz)
| Aşama | İş | Durum |
|---|---|---|
| **1** | Registry temizliği (kontaminasyon→orion) + 3 çöken komut (C1/C2/C3) + I1/I3/G1/G4/D1-D2 | ✅ **BİTTİ** (worker commit `5a04725` + kullanıcı MCP restart; canlı doğrulandı). Kalan tek kozmetik: G3 (decision/idea list escape) → worker'da |
| **2** | Gerçek work-order setini temiz `venthub-hvac` registry'sine gir (Model A) | ⬜ **SIRADAKİ** — bu set aynı zamanda **KIBridge'in spec'i** olur |
| **3** | Session hook'ları: start=durum (recall) · end=seal (checkpoint+öğrenim) | ⬜ |
| **(sonra)** | **KIBridge net-new inşa** (worker görevi) → Model B'ye tam geçiş | ⬜ |

## 7. [ESKİ — tarihçe] KIBridge spec yönü (gelecek worker görevi — net-new ama sıfırdan değil; hiç yapılmadı)
- **Girdi:** registry `tasks`/`decisions` + git durumu + son checkpoint.
- **Çıktı:** `DURUM-TAKIP.md`-şekilli MD (kesin kontrat **Aşama 2'de** registry doldurulunca netleşir — "standart-önce: önce cetvel, sonra jeneratör").
- **Mevcut yapı taşları:** `session recall` zaten yapısal durum render ediyor · `_update_capability_map` MD'yi otomatik yazıyor · doc-pipeline (`migrator/parser.reassemble_markdown`) MD reassemble ediyor.
- **Robustluk şartı:** KIBridge sonrası bile `DURUM-TAKIP.md` git-diff'li + twin-sync'li **fallback** kalır (registry tek-sepete-yumurta değil).

## 8. İş dağılımı kuralları — 2026-09-07 (YÜRÜRLÜKTE; Recep: "sistem olana kadar iş yok", "hiçbir iş VentHub dışında değil")

Kaynak: Recep'in 2026-09-07 sabah hükmü (bir haftadır "iş açıldı mı, kimde, nerede" sorusuna cevap alamıyordu; sabah Linear'da 53 kayıt "yapılıyor" görünürken gerçek sayı 3'tü) + Katalog şeridinin yığın ölçümü (203 kayıt: 58 bitti · 4 iptal · 31 aktif · 110 backlog) + Recep düzeltmesi (Mart kayıtları arşivlenmez, bağlanır). Uygulayan betik: `scripts/nlm/santiye.py` → `docs/proje-takip/santiye.md` (ad "iş dağılımı"na dönecek). Kaynak yalnız Linear; pano notu, sohbet, durum dosyası kaynak DEĞİLDİR.

1. **Sahiplik = etiket.** Şerit etiketleri: URUN · URUN-KATALOG · ALTYAPI · OPS · DESIGN. Etiketsiz kayıt SAHİPSİZ'dir ve tabloyu KIRMIZI yapar; proje sessizce sahip yapmaz (09-07 ölçümü: proje ölçütü Katalog'a 8 iş sayıyordu, gerçek 1).
2. **Şerit başına "yapılıyor" (In Progress) ≤ 1, "sırada" (Todo) ≤ 3.** Aşım KIRMIZI; şerit Linear'ı gerçek duruma çekmeden yeni iş almaz. "Recep kapısı" etiketli kayıt "yapılıyor" limitinden muaftır (bekleyen Recep'tir, şerit değil).
3. **"Teslim" = In Review:** iş bitti, PR açık, yalnız merge bekler. Merge olmadan Done denmez (iş master'da yoktur). Merge olunca Done.
4. **Durum değişikliği panoya yazılmaz, Linear'da YAPILIR.** Pano notu REC numarası taşır; taşımayan not iş sayılmaz.
5. **Recep'ten bir şey bekleyen kayıt "Recep kapısı" etiketi taşır;** taşımayan görünmez ve Recep'e sunulmaz.
6. **Kayıt açmanın bedeli:** yeni kayıt yalnız (a) canlıda ÖLÇÜLMÜŞ kusur, (b) Recep kararı, (c) aktif işin alt adımı ise açılır. "İyi olurdu" fikri yol haritası satırıdır, kayıt değil.
7. **Bakılmadı işareti (Recep düzeltmesi 09-07: "iş varsa iştir"):** 14 gündür kimsenin bakmadığı Backlog kaydı "bakılmadı" listesine düşer (§8 tablo). Bu bir İPTAL mekanizması DEĞİLDİR; sahibine "bir bak" işaretidir. Gerekçe yazma zorunluluğu yok; yorum/gövde spreyi yapılmaz. Ölçüt son yorum / PR eki / açılış tarihi (updatedAt, startedAt, completedAt DEĞİL: etiket, bakım ve durum gezdirme saati sıfırlamaz). İptal yalnız Recep sözüyle.
8. **Eski kayıt arşivlenmez, BAĞLANIR.** Her eski kayıt için tek soru: "bu iş bugünkü mimaride hâlâ duruyor mu" → devam ediyor (bugünkü kayda bağla, eskisini kapat) / devralındı (hangi kayıt) / mimari değişti (gerekçe yaz, kapat). Kayıt silinmez, gerekçe kayıtta kalır.
9. **Kova kayıt yasak:** bitiş ölçütü yazılamayan kayıt kayıt değildir; parçalanır ya da kapanır.
10. **Kayıt gerçek mi?** Sahiplendirme "sahibi var mı" ile yetinmez; iş olmayan kayıt (şablon, deneme) iptal edilir (09-07: Linear onboarding şablonu iki kayıt OPS etiketi almıştı).
11. **Açılış kapısı:** sabah tablo KIRMIZI ise ya da şeritlerin panoda anlattığıyla uyuşmuyorsa iş başlamaz.
12. **Şerit sıralaması (Recep 09-07: "her şerit kendi içinde sıralayıp sunar"):** her şerit açık kayıtlarını iki sütunla sunar — ÖNEM (müşteri bugün görüyor mu · Google görüyor mu · arka plan) ve YAPILABİLİR (bugün başlanabilir mi; engel: karar / başka iş / altyapı). Her satırda ETKİ (ölçülmüş mü) · BÜYÜKLÜK (Linear tahmin puanı) · ENGEL. Tek liste iki soruya cevap veremez: "ne önemli" ile "sıradaki iş ne" ayrı sütundur (URUN, 09-07). Biçim örneği: `C:/tmp/ops-rapor/musteri-google-oncelik-2026-09-07.md`.
13. **Sıralamaya giren satır eyleme dönmeden ölçümü tazelenir.** "Kayıtta yazıyor" ölçüm değildir (09-07: REC-155 iki raporda 1 numaraydı, ölçülünce işin 2 gün önce bittiği çıktı).
14. **Recep'in sözü hangi pencereye düşerse düşsün aynı turda kayda girer:** şerit, ilgili kayda "Recep sözü, tarih, tırnak içinde" yorum yazar ve panoya OPS'a not düşer. Yazılmayan karar OPS için yoktur ve Recep'e ikinci kez sorulur (09-07: boş kategoriler kararı Katalog penceresindeydi, OPS yeniden sordu). OPS de Recep'e karar götürmeden önce kaydın yorumlarını ve son 2 saatin pano notlarını tarar.
15. **Karar devredildiği turda "Recep kapısı" etiketi düşer.** Etiket bayat kalırsa Recep'ten bekleyen listesi yalan söyler (09-07: REC-207/193).
16. **Kayıt açmadan önce aynı konuyu anlatan kayıt aranır** (etiket + anahtar kelime). Bulunursa yeni kayıt açılmaz; mevcut kayıt daraltılır ya da bağlanır (09-07: REC-214, REC-135'in 14 kategorisini yeniden anlattı).
17. **Recep'e tık ya da karar götürülürken üç satır:** SORUN (tek cümle, hangi sistem) · BU TIK NEYİ DEĞİŞTİRİR · BEDEL. İki değişiklik varsa her birinin TEK BAŞINA ne çözdüğü ayrı yazılır (09-07 Vercel: çözüm sorundan önce anlatıldı, üç kez yön değişti).

Değişiklik kaydı: 2026-09-07 OPS — bölüm eklendi (commit ile); aynı gün akşam 12–17 eklendi (şerit sıralaması, ölçüm tazeleme, Recep sözü aynı turda, etiket düşer, mükerrer kayıt araması, üç satır kuralı). Kapı/saatlik yenileme: REC-187.
