# Hafıza Kancaları Standardı (REC-177)

> **Kapsam:** ajanın *hatırlama/kayıt* davranışını mekanikleştiren kancalar — `.claude/hooks/`
> altındaki `eylem-defteri`, `hafiza-sorusu-yonlendirme`, `defter-bayatlik-olcumu`,
> `soguk-okuyucu-sinavi`. Şerit/claim kapıları (`lane-guard`), sır kapıları
> (`sensitive-path-guard`, `sir-basan-kalip`) ve pano kancaları BU CETVELİN DIŞINDA.
> **Sürüm:** v1.0 · 2026-09-07 · sahibi ALTYAPI şeridi.
> **Niçin bu cetvel doğdu:** dört kanca yazıldı ve hiçbirini yöneten cetvel yoktu; kural 1
> gereği "cetvel yok" geçerli ama bedava değil — cetveli yazmak işin parçası.

---

## §1 Bu kancalar niçin var — ölçülmüş kayıp sınıfı

Dördü de aynı kökten doğdu: **hatırlamaya bırakılan adım hatırlanmadı.** Vakalar ölçüldü,
tahmin edilmedi:

| # | ölçülmüş kayıp | tarih | kancanın cevabı |
|---|---|---|---|
| 1 | 20 skill depo dışına taşındı, 40 dk "bulamadım" (git depo dışını görmez) | 09-06 | `eylem-defteri` — taşıma/silme fiillerini JSONL'e yazar |
| 2 | "konuşmuş muyduk" sorusu bağlamdan cevaplandı; aynı gün 3 kez eksik çıktı | 09-04 | `hafiza-sorusu-yonlendirme` — adresi hatırlatır, cevap üretmez |
| 3 | Takip defteri 8 saat bayat kaldı ve yanlış cevap verdi | 09-06 | `defter-bayatlik-olcumu` — yaşı ölçer, uyarır |
| 4 | Kendi notundan ne yaptığını çıkaramama (2 vaka aynı gün) | 09-06 | `soguk-okuyucu-sinavi` — notu bağlamsız okuyan geçirir |

**Ders:** hafıza kaybı bir *bilgi* eksikliği değil, bir *ritüel* eksikliğidir. Ritüel yazıya
(kancaya) dökülmediği sürece "hatırlanan" şeydir ve hatırlanmaz.

---

## §2 Zorunlu kurallar

**K1 — KANCA CEVAP ÜRETMEZ, ADRES VE ÖLÇÜT VERİR.**
Kanca modeli çağırmaz, ağ isteği yapmaz. Sebep iki katlı: (a) her isteme gecikme ve hata
yüzeyi bindirir, (b) yanlış cevap üretme riski taşır — *hatırlatma ucuz, yanlış cevap pahalı.*
Ölçümü ajan yapar. `hafiza-sorusu-yonlendirme` ve `soguk-okuyucu-sinavi` kapılarında bu kural
**bir şeyin olmadığını ölçen** kolla korunur (kaynakta `exec*/spawn/fetch/http` yasak).

**K2 — DIŞ SERVİSE YAZMAYI KANCA TETİKLEMEZ.**
Ölçmek serbest, yazmak insan kapısı. `defter-bayatlik-olcumu` defterin yaşını ölçer ve
`esitle` komutunu **söyler**, koşturmaz (OPS hükmü 2026-09-07, ALTYAPI itirazı üzerine).
Kapı, çalıştırma çağrılarının **argümanlarına** bakar — çıplak kelimeye değil; yoksa kanca
kendi gerekçesini yazamaz.

**K3 — KAPSAM DARLIĞI KASITLIDIR: her turda öten kanca ölmüş kancadır.**
Üç günde görmezden gelinir ve o andan sonra **VAR ama YOK** sayılır. Bu yüzden:
tek kelimelik ipucu kullanılmaz (yalnız çok kelimeli kalıplar) · sınav yalnız iki yüzeyde
istenir (compact dilim kaydının ANLAM kısmı + gün kapanışı notu) · günlük üst sınır **6** ·
aynı dosya için sınav bir kez · uyarıda soğuma penceresi (2 saat).
**Her kapıda hem "ötmeli" hem "ÖTMEMELİ" kolu bulunur** — ikincisi daha kolay kaçar.

**K4 — ÖLÇEMEDİM ≠ TAZE / GEÇTİ.**
Ölçüm başarısızsa kanca susmaz, "OLCULEMEDI" der ve sebebini yazar. Sessizlik, olmayan şeyi
"yok" değil "sorun yok" gibi gösterir; fail-open yüzün en sık hâli budur.

**K5 — ÖLÇÜT ADA DEĞİL GERÇEĞE BAĞLANIR.**
Depo tespiti ad eşlemesiyle değil `.git` arayarak · tazelik dosya damgasıyla değil
`git log origin/master` ile (eşitleme başka worktree'de koşar, ana dizin kopyası güncellenmez;
09-07'de ana dizin damgası 21 saat eskiydi, gerçek eşitleme 18 saat önceydi) · dosya kimliği
basename ile değil **tam yolla** (iki şeridin `state.md`si çarpışır, ikincisi sessizce muaf kalır).
**Ayırt etmeyen ölçüt ölçüm değildir.**

**K6 — TURU BLOKLAMAZ.** Hepsi daima 0 ile çıkar; uyarı stderr/additionalContext'e gider.
Kancanın kendi hatası işi durdurmamalı — ama sessizce yutulmamalı (stderr'e yazılır).

**K7 — ALT-AJAN MODELİ AÇIKÇA YAZILIR.**
Sınav emrinde model **sonnet**. Model boş bırakılırsa pahalı modele düşer (Recep, 09-06).

---

## §3 Soğuk okuyucu sınavı — geçme ölçütü

Not, o anki bağlamı bilen birine yazılır; okuyan (yarınki ben, defter, şerit) o bağlamı
görmez. **Compact sonrası yazan da soğuk okuyucudur.**

1. Bağlamsız bir alt-ajan **yalnız notu** okur (başka girdi verilmez).
2. Dört alanı söyler: **NE** (fiil+nesne) · **DURUM** (YAPILDI/AÇIK/YARIN/ÇÜRÜDÜ, *kelimeyle*)
   · **KANIT** (dosya/PR/saat/yol) · **KİMDE**.
3. Çıkaramadığı alan için "çıkaramadım" der — tahmin etmez.
4. **GEÇMEZ:** bir alan "çıkaramadım" ise, ya da cevap yazanın bildiğiyle uyuşmuyorsa.
   O zaman not yeniden yazılır ve sınav tekrarlanır. **"Ben anlıyorum" kanıt değildir.**
5. Kısaltma ve parantez **durum belirtmez**: "(sabah cetvel)" defterde "yapıldı"ya döndü.

**§3.1 İlk koşumun bulgusu (09-07, bu cetvelin kendi kaydı üzerinde):** sınav, compact dilim
kaydının yedi kalemini doğru çıkardı, ama **HAYIR** verdi: karar kalemleri "Recep'ten bekleniyor"
diyordu, *beklenen cümlenin kendisini* yazmıyordu. Düzeltme kayda işlendi.
**Kural bu vakadan doğdu: karar kaleminde beklenen CEVABIN KENDİSİ yazılır** — "onay bekliyor"
bir durum değil, bir boşluktur.

---

## §4 Envanter (araç, envantere girmeden bitmiş sayılmaz — REC-180 kuralı)

| ad | tür | ne yapar | tetik | sahip | kanıt |
|---|---|---|---|---|---|
| `eylem-defteri.cjs` | kanca | git'in görmediği taşıma/silme fiillerini JSONL'e yazar | PostToolUse | ALTYAPI | `src/__tests__/conformance/eylem-defteri.test.ts` (10 kol) |
| `hafiza-sorusu-yonlendirme.cjs` | kanca | hafıza sorusunu deftere/CodeGraph'e yönlendirir | UserPromptSubmit | ALTYAPI | `…/hafiza-sorusu-yonlendirme.test.ts` (16 kol) |
| `defter-bayatlik-olcumu.cjs` | kanca | takip defterinin yaşını ölçer, eşitlemeyi TETİKLEMEZ | Stop | ALTYAPI | `…/defter-bayatlik-olcumu.test.ts` (7 kol) |
| `soguk-okuyucu-sinavi.cjs` | kanca | iki kayıt yüzeyinde soğuk okuyucu sınavı ister | PostToolUse | ALTYAPI | `…/soguk-okuyucu-sinavi.test.ts` (13 kol) |

⚠**AYARA KAYIT RECEP KAPISI:** dördü de `.claude/settings.json`'a bağlanmadıkça **dosya olarak
var, tetik olarak ölüdür.** Akran isteğiyle ayar dosyasına dokunulmaz. Kayıt satırları Recep'e
sunulur; sunulana kadar bu cetveldeki "tetik" kolonu *tasarlanan* tetiği gösterir, *çalışan* değil.

`.md` künyeleri (companion) **üretilmiş artefakttır** — post-commit üretir, elle yazılmaz (AXIOM 3).

---

## §5 Bu cetvelin kendi kapısı

`src/__tests__/conformance/` altındaki dört test dosyası bu cetvelin kollarıdır. Kanca eklenirse
aynı PR'da: (1) gerçek stdin ile koşum kanıtı, (2) "ötmemeli" kolu, (3) §4 envanter satırı,
(4) varsa "bir şeyin olmadığını ölçen" kol. **Koda bakarak sınama kanıt sayılmaz** — dört
kancanın üçünde kusurlar ancak gerçek koşumla çıktı (tilde çözülmemesi, worktree'lerin depo dışı
sayılması, MSYS `/c/` yolunun Windows'ta olmayan yere çözülmesi, basename çarpışması).
