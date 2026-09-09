# REC-296 — Edge Function köken allowlist'inin daraltılması (ALTYAPI)

**Şerit:** ALTYAPI (`supabase/functions/_shared/**`) · **Dal:** `altyapi/rec296-koken-allowlist`
**Worktree:** `c:/tmp/vh-altyapi-851` · **Taban:** `origin/master` = `1f7fe3e54`
**YÖNTEM:** elle (tek dosya + cetvel + konformans kolu). Sapma yok — çok-eksen ölçüm ya da
bağımsız çürütme gerektirecek bir tasarım kararı içermiyor; değişiklik tek satırlık bir
predicate daraltması ve riski ÖLÇÜLEBİLİR (aşağıda ölçüldü).

---

## KAYNAK / CETVEL

| kalem | durum |
|---|---|
| `docs/standards/edge-function-security-standard.md` §3.4 | **VAR** — CORS'un TEK KAYNAĞINI düzenler (`_shared/cors.ts` → `getCorsHeaders`), elle `cors` objesini yasaklar |
| allowlist'in **GENİŞLİĞİ** hakkında hüküm | ⛔**YOK** — cetvel "hangi köken kabul edilir" sorusuna hiç değinmiyor |
| Sonuç | **Cetvel eksik.** Bu iş, §3.6'nın yazımını da KAPSAR (kural 1: "cetvel yok" bedava değil) |

Karne/tazelik: aşağıdaki ölçümlerin hepsi **2026-09-09 08:3x–08:4xZ** damgalıdır ve canlı
prod'dan (SELECT/OPTIONS, yazım YOK) alınmıştır.

---

## 1. SORUN — tek cümle

`getCorsHeaders` **her** `*.vercel.app` kökenini kabul ediyor; bu, bize ait olmayan
herhangi bir Vercel projesinin tarayıcıdan Edge Function çağırabilmesi demektir.

```ts
const isVercel = origin.endsWith('.vercel.app');   // ⛔ JOKER
```

`.vercel.app` **paylaşılan bir son ektir** — herkes oraya deploy edebilir. Yani allowlist
"bizim önizlemelerimiz" değil, "Vercel'e deploy eden herkes" anlamına geliyor.

---

## 2. ÖLÇÜMLER (hatırlanan sayı yok)

### 2.1 Blast radius
- Edge fonksiyon sayısı: **28**
- `_shared/cors.ts` kullanan: **21**
- `_shared/origins.ts` (katı, env güdümlü, `isOriginAccepted`) kullanan: **2**
  (`iyzico-payment`, `iyzico-callback` — ikisi de AYNI ZAMANDA cors.ts kullanıyor)
- Tarayıcıdan Edge çağıran vitrin dosyası: **18** (ödeme, admin kupon/kargo, teklif dahil)

⭐**İki mekanizma bir arada yaşıyor:** para akışındaki iki fonksiyon katı allowlist'e tabi,
kalan 19'u joker'e. Bu iş yalnız joker'i daraltır; `origins.ts`'e DOKUNMAZ (kapsam dışı).

### 2.2 Canlı davranış — OPTIONS preflight, `log-client-error` ucu (08:3xZ)

| Origin | `Access-Control-Allow-Origin` | hüküm |
|---|---|---|
| `https://venthub.com.tr` | `https://venthub.com.tr` | izinli (kanonik) |
| `https://venthub-hvac-esite.vercel.app` | aynısı | izinli |
| `https://evil.example.com` | `https://venthub-hvac-esite.vercel.app` (yedek) | reddedildi |

Yani yedek dal ÇALIŞIYOR; kusur yedekte değil, **joker dalın genişliğinde**.

⚠**KENDİ HATAM, ADIYLA:** ilk okumada ana çalışma ağacındaki `cors.ts`'i okudum ve kanonik
alan adını GÖRMEDİM → "dağıtım sapması" demeye bir adım kalmıştı. Ağaç **11 commit
geride**ydi (`cf06104a6` vs `1f7fe3e54`); kanonik köken bugün URUN tarafından eklenmişti
(REC-117 bulgu 6). Beni durduran şey canlı ölçümdü. Sınıf: **ölçüt doğru, evren doğru,
TAZELİK yanlış** — bugünün üçüncü tekrarı.

### 2.3 Önizleme adresleri — gerçek biçim (depoda geçen örnekler)
```
venthub-hvac-esite.vercel.app
venthub-hvac-esite-1fk7v482n-peckops-projects.vercel.app
venthub-hvac-esite-m8cog5tbe-peckops-projects.vercel.app
```
Hepsi `venthub-hvac-esite` ile BAŞLIYOR. Daraltmanın önizlemeleri kırmaması bu ölçüme dayanır.

---

## 3. DEĞİŞİKLİK

```ts
const ONIZLEME = /^https:\/\/venthub-hvac-esite[a-z0-9-]*\.vercel\.app$/;
const isVercel = ONIZLEME.test(origin);
```

Neden regex, neden `startsWith` değil: `startsWith('https://venthub-hvac-esite')` ise
`https://venthub-hvac-esite.evil.example` de geçer. Kalıp **sonu da** çiviliyor (`$`).

**Değişmeyenler:** `localhost:` dalı (yerel geliştirme), kanonik dal, yedek adres, başlıklar.

---

## 4. RİSK VE BEDEL — önden yazılıyor

| risk | ölçüm | hüküm |
|---|---|---|
| Bir önizleme adresi kalıba uymaz → tarayıcıdan Edge çağrısı kırılır | depoda geçen 3 biçimin 3'ü de uyuyor | **düşük**, ama önizleme adresi ŞEMASI değişirse yeniden ölçülmeli |
| Merge = Edge fonksiyonların prod'a dağıtımı (`deploy-functions.yml`) | 21 fonksiyon yeniden dağıtılır | davranış değişikliği YALNIZ reddedilen kökenlerde; kabul edilenlerde bit-aynı |
| Ödeme akışı | `iyzico-*` ayrıca `origins.ts`'e tabi | bu değişiklik onları GEVŞETMEZ |

⛔**Bunun bir prod davranış değişikliği olduğunu saklamıyorum:** merge dağıtım tetikler.
Migration DEĞİL, yani kural 13 kapısına girmez; ama "yalnız kod" da değil.

---

## 5. KAPI (kalıcı katman — hand-patch değil)

`src/__tests__/conformance/` altına kol: `_shared/cors.ts` içinde
`endsWith('.vercel.app')` **geçmeyecek** + kalıbın ayrım çifti:
- YEŞİL taraf: `venthub-hvac-esite.vercel.app`, `venthub-hvac-esite-1fk7v482n-peckops-projects.vercel.app`
- KIRMIZI taraf: `baskasi.vercel.app`, `venthub-hvac-esite.evil.example`, `http://venthub-hvac-esite.vercel.app` (şema)
- **Dedektör sağlığı:** dosya okunamazsa/boş tararsa **exit 2** — "ihlal yok" DEMEZ.

## 6. CETVEL YAZIMI (bu işin parçası)

`edge-function-security-standard.md` **§3.13** — *"Köken allowlist'i JOKER SON EK içermez"*:

⚠**NUMARA DÜZELTİLDİ:** bu planın ilk hâli (ve OPS emri) "§3.6" diyordu; **§3.6 ZATEN DOLU**
(`service_role` kuralı). Ölçmeden yazsaydım cetvelde iki tane §3.6 olurdu. Yeni madde §3.13.

kural + niçin (`.vercel.app` paylaşılan son ektir) + ölçüm tablosu + kapı adı.

---

## 7. KAPSAM DIŞI (adıyla, sessizce bırakmıyorum)
- `_shared/origins.ts` ve env güdümlü allowlist — dokunulmaz.
- `apply-coupon` içindeki elle yazılmış ACAO (cetvel E4 tabanı) — ayrı kalem.
- Paylaşılan TLS yardımcısı, TRUNCATE latent yetkisi — ayrı kayıtlar.

## 8. BİTTİ ÖLÇÜTÜ
1. Konformans paketi TAMAMI yeşil (`Test Files N/N`, `Tests N/N` — sayıyla, §3.2).
2. Yeni kolun ayrım çifti ölçüldü: bozulmuş kalıpla **kırmızı**, doğrusuyla **yeşil**.
3. Cetvel §3.6 yazıldı ve kola ADIYLA atıf yapıyor.
4. Merge SONRASI canlı OPTIONS ölçümü: `baskasi.vercel.app` **yedek adrese** düşüyor,
   `venthub-hvac-esite*.vercel.app` **izinli**. ⛔Bu ölçüm yapılmadan iş "bitti" DEĞİL —
   "tetik var" ile "tetik çalışıyor" ayrımının aynısı (REC-292 dersi).
