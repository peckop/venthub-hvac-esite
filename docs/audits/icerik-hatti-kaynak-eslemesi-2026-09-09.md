# ADIM 3 — KAYNAK EŞLEMESİ ÖLÇÜMÜ (REC-212 F1, 2026-09-09)

**Soru:** Paketteki 5168 teknik değerin her biri kaynak dizininde bulunuyor mu?
**Yöntem:** `scripts/icerik-hatti/kaynak-eslemesi.mjs` — tek koşum, 2129 kaynak sayfası,
**PDF açılmadı** (K15). Canlı DB'ye yazım yok, salt okuma.

## Sonuç

| durum | satır | oran |
|---|---|---|
| VAR | 2205 | 42.7% |
| DEGER YOK | 2403 | 46.5% |
| URUN KAYNAKTA YOK | 261 | 5.1% |
| CELISIYOR | 299 | 5.8% |

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
