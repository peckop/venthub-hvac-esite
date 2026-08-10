# VentHub — İş-Takibi & Dokümantasyon SSOT Standardı (Cetvel) — v1.0

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

## 2. Çekirdek kural — her bilgi TEK yerde yaşar, ötekiler İŞARET eder (kopyalamaz)

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

## 3. Mevcut model — **Model A (hibrit)** [ŞİMDİ]
- **Registry `tasks` = yapısal work-order + status SSOT** → `session recall` / `orion_durum` canlı gösterir (KURULU, çalışıyor).
- **`DURUM-TAKIP.md` = insan anlatısı / lane / gerekçe**, registry **id-referansı** taşır; paralel yetkili status-listesi tutmaz.
- **Detay = plan/standart doc** · **biten = CHANGELOG/git** · **ders = memory.**
- → Her work-order tek yerde (registry); anlatı tek yerde (DURUM-TAKIP); detay tek yerde (doc). **Mükerrerlik yok.**

## 4. Hedef model — **Model B (DB-First, MD generated)** [HEDEF]
- **registry = tam SSOT; `DURUM-TAKIP.md` DB'den OTOMATİK üretilir** (KIBridge / db→md). Elle-bakım biter, drift kökten ölür.
- Bu Orion'un kendi **AXIOM-1 (DB-First / MD-as-Output)** doktrini — bizim tercihimiz değil, mimari doğru son-durak.
- ⛔ **ENGEL:** KIBridge **hiçbir yerde kurulu değil** (bkz §5) → **net-new inşa** gerekir.

## 5. Orion altyapı paritesi (kanıt — 2026-06-20 canlı doğrulama)
3 proje (orion-registry + cortex + corpus-callosum) **tek `orion` çatısına** birleşti ("%100 değil, ihtiyacı çözecek kadar"; `cc` CLI → `orion` CLI).

- **✅ KURULU + bizim kullandığımız:** registry (task/idea/decision) · `session recall/seal/summary/diff/timeline` · `orion_durum`/`orion_twin` · doc-pipeline + NLM twin · memory · code/alignment (drift/blast) · safety (autonomy L0-L3/andon/audit).
- **❌ TAŞINMADI (bilinçli kesim — biz kullanmıyoruz):** ACEE orchestrate/DAG executor · scope_police · kaizen · department_manager · Voltran REST servis (kod var, entry-point yok).
- **❌ KIBridge (work-state→MD) — KAYNAK-DOĞRULAMALI KESİN:** ne `orion-registry`'de (referans; `class KIBridge`/`reassemble_markdown` grep BOŞ, son commit 2026-06-12 = donmuş) ne birleşik `orion`'da var. **Hiçbir yerde kurulmamış**; her ikisinde backlog. *(NLM "Orion" defteri "kurulu" dedi = halüsinasyon; "Orion Registry" defteri "backlog" = doğru → çelişince kaynağa bak.)*

## 6. Aşamalı yol haritası
| Aşama | İş | Durum |
|---|---|---|
| **1** | Registry temizliği (kontaminasyon→orion) + 3 çöken komut (C1/C2/C3) + I1/I3/G1/G4/D1-D2 | ✅ **BİTTİ** (worker commit `5a04725` + kullanıcı MCP restart; canlı doğrulandı). Kalan tek kozmetik: G3 (decision/idea list escape) → worker'da |
| **2** | Gerçek work-order setini temiz `venthub-hvac` registry'sine gir (Model A) | ⬜ **SIRADAKİ** — bu set aynı zamanda **KIBridge'in spec'i** olur |
| **3** | Session hook'ları: start=durum (recall) · end=seal (checkpoint+öğrenim) | ⬜ |
| **(sonra)** | **KIBridge net-new inşa** (worker görevi) → Model B'ye tam geçiş | ⬜ |

## 7. KIBridge spec yönü (gelecek worker görevi — net-new ama sıfırdan değil)
- **Girdi:** registry `tasks`/`decisions` + git durumu + son checkpoint.
- **Çıktı:** `DURUM-TAKIP.md`-şekilli MD (kesin kontrat **Aşama 2'de** registry doldurulunca netleşir — "standart-önce: önce cetvel, sonra jeneratör").
- **Mevcut yapı taşları:** `session recall` zaten yapısal durum render ediyor · `_update_capability_map` MD'yi otomatik yazıyor · doc-pipeline (`migrator/parser.reassemble_markdown`) MD reassemble ediyor.
- **Robustluk şartı:** KIBridge sonrası bile `DURUM-TAKIP.md` git-diff'li + twin-sync'li **fallback** kalır (registry tek-sepete-yumurta değil).
