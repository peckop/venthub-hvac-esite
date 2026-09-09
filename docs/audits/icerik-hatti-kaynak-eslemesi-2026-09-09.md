# ADIM 3 — KAYNAK EŞLEMESİ ÖLÇÜMÜ (REC-212 F1, 2026-09-09)

**Soru:** Paketteki 5168 teknik değerin her biri kaynak dizininde bulunuyor mu?
**Yöntem:** `scripts/icerik-hatti/kaynak-eslemesi.mjs` — tek koşum, 2129 kaynak sayfası,
**PDF açılmadı** (K15). Canlı DB'ye yazım yok, salt okuma.

## Sonuç (OPS teşhis emri 12:25Z sonrası — sınıflar AYRIŞTIRILDI)

| durum | satır | oran | ne demek |
|---|---|---|---|
| VAR | 2192 | 42.4% | değer, ürün kodunun 80 karakter yakınında |
| TUREV | 655 | 12.7% | **kaynakta ARANMAZ** — türetilmiş değer |
| DEGER YOK | 1800 | 34.8% | ürünün sayfası var, değer yok |
| KOD YOK | 75 | 1.5% | ürünün model kodu yok → **arama YAPILAMADI** |
| URUN KAYNAKTA YOK | 147 | 2.8% | kod var, hiçbir kaynakta geçmiyor |
| CELISIYOR | 299 | 5.8% | → `celiski-listesi.csv` (sınıflı) |

**ARANABİLİR EVREN 4438** (5168 − türev 655 − kodsuz 75) → bu evrende **VAR %49.4**.

### İlk tablo YANLIŞ İŞ DOĞURACAKTI — iki sınıf ayrıştırıldı

**1. TÜREV (655).** İlk teşhiste "DEGER YOK" kovasının tepesinde `erp_compliant: true` (174),
`pq_curve: [[0,353],…]` (132), `max_delivery_ls: 27.78` (156) çıktı. Bunların **hiçbiri
katalogda yazmaz**: biri boolean bir hüküm, biri eğrinin sayısallaştırılmışı, biri m³/h
değerinden **bölünerek** üretilmiş. Ölçüt uydurulmadı, **ölçüldü**: birim türevi kardeş
alanla bölme sınanarak doğrulanıyor (`max_delivery_m3h ÷ 3.6`, %1 tolerans).
Bunlara "kaynakta bulunamadı" demek **olmayan bir iş** doğururdu.

**2. KOD YOK (75) ≠ URUN KAYNAKTA YOK (147).** İlk koşumda 261 satır tek kovadaydı; teşhis
gösterdi ki bu **13 ürün**tü ve ikiye ayrılıyordu:
- **5 ürün** (`VRT-CA-IL-*-ES-RECT`) → bu sabah **uydurma kimliği silinen** ürünler; kodları
  NULL olduğu için **arama hiç yapılamadı**. Bulunamamak değil, aranamamak.
- **8 ürün** (`VRT-16257…16281`) → kodu var, kaynakta **gerçekten yok**.
"Aranamadı" ile "arandı, bulunamadı" aynı kovaya konursa ilki de kusur sayılır.

### Çelişki sınıfları (299) — makine, gözle değil

| sınıf | satır |
|---|---|
| olcek (10 katı) | 125 |
| ayni alanda cok deger | 101 |
| birim (m3/h ↔ l/s) | 63 |
| yuvarlama | 10 |
| **gercek celiski** | **0** |

⚠**Bu sınıflandırma CÖMERTTİR, kesin hüküm değil.** Ürün kodunun yakınında onlarca sayı
bulunduğu için neredeyse her satır bir sınıfa oturuyor; "gerçek çelişki 0" sonucunu
*"çelişki yok"* diye okumak yanlış olur. Kesin hüküm **etiket↔değer eşlemesi** ister —
o da etiket sözlüğünün genişletilmesine bağlı. Şimdilik sınıf bir **ön elemedir**:
birim ve ölçek sınıfları toplu kuralla çözülebilir, diğerleri tek tek bakılır.

### İlk koşumun (ayrıştırma öncesi) rakamları

| durum | satır |
|---|---|
| VAR | 2205 |
| DEGER YOK | 2403 |
| URUN KAYNAKTA YOK | 261 |
| CELISIYOR | 299 |

Çelişki yalnız **etiket sözlüğü olan 10 alanda** ölçülebildi. **1669 satırda çelişki
ÖLÇÜLMEDİ** ve bu ayrı yazıldı — ölçülmeyeni "çelişki yok" saymak, olmayan bir güvence
vermek olurdu.

## ⭐"VAR" mutlak kanıt değil — tesadüf tabanı ÖLÇÜLDÜ

İlk koşum %56 "VAR" verdi ve bu rakama güvenilmedi. Sebep: bir katalog sayfası yüzlerce
sayı taşır; ürün kodunun ve bir sayının **aynı sayfada** bulunması tesadüf olabilir.

Sınav: bütün sayısal değerler kaydırılıp **sahte** yapıldı ve aynı eşleme tekrar koşuldu.

| koşum | VAR | not |
|---|---|---|
| sayfa içi eşleşme, gerçek değerler | 2892 (%56.0) | |
| sayfa içi eşleşme, **sahte** değerler | 1007 (%19.5) | ⚠**gürültü** |
| **yakınlık şartı (80 karakter)**, gerçek | **2205 (%42.7)** | |
| yakınlık şartı, **sahte** | 355 (%6.9) | tesadüf tabanı |

**Hüküm:** "VAR" satırlarının **~%16'sı tesadüf olabilir**; gerçek kanıt payı **%84
(1850 satır)**. Bu taban artık **betiğin kendisi tarafından her koşumda ölçülür** ve
MANIFEST'e yazılır — rakam kendi güvenilirliğini söylemek zorundadır.

**Ders (cetvel §6.6'nın devamı):** *Ölçüt keskindi ama EVREN yanlıştı.* Doğru evren
"sayfa" değil, **"satır"**dı. Pencere 40/80/120/200 taranarak seçildi; net sinyal
(gerçek − tesadüf) 80'de doruğa çıkıyor.

## Kanıtsız değer SİLİNMEDİ

`DEGER YOK` (2403) ve `URUN KAYNAKTA YOK` (261) satırları **pakette duruyor**. Boş
`kaynak_dosya` hücresi bir eksiklik değil, bir **beyandır**: "bu değeri kaynakta
bulamadık". Silmek veriyi kaybettirir, sessizce bırakmak ise kanıtlıyla kanıtsızı
aynı görünüme sokardı.

## Örnekleme denetimi (gözle, 6 satır)

Rastgele 6 "VAR" satırının alıntısı okundu: **5'i sağlam** (değer, ürün kodunun bitişiğinde
ve doğru sütunda), **1'i şüpheli** (`VRT-65196 airflow_speed_min_ms=9`, alıntıda değerin
konumu ikna edici değil). Bu oran ölçülen %84 kanıt payıyla tutarlı.

## Sırada

- `URUN KAYNAKTA YOK` 261 satır → ürünün kodu hiçbir kaynakta geçmiyor. Bu, bugün
  5 üründe yaşanan **uydurma kimlik** sınıfının aday listesidir; ölçülür, **silinmez**.
- Etiket sözlüğü 10 alandan geniş tutulursa çelişki kapsamı büyür — sözlük **dar tutuldu**,
  çünkü uydurma etiket uydurma çelişki üretir.
- Adım 5 (round-trip + DB fark raporu) bu tabloyu girdi alır.

---
> Ölçüm: 2026-09-09 · URUN-KATALOG şeridi · PDF açılmadı · prod DB yazımı yok
