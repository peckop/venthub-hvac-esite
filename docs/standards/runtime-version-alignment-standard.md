# Çalışma Zamanı Sürüm Hizalaması — Cetvel v1.0

> **Kapsam:** Node.js **ana sürümü**. Tek soru: *kapıların ölçtüğü çalışma zamanı, siteyi
> gerçekten derleyip servis eden çalışma zamanı mı?*
> **Zorlayan kapı:** `INV-NODE-1` → `src/__tests__/conformance/runtime-version-alignment.test.ts`
> **İlk yazım:** 2026-08-18 (T092-VH) · **Ölçüm sahibi:** ALTYAPI

---

## 1. Niçin bu cetvel var — ölçülmüş boşluk

2026-08-18'de üç yüzey ölçüldü ve **ikisi ayrışmıştı**:

| yüzey | okunan değer | kaynak |
|---|---|---|
| Vercel — derleyen ve servis eden | `nodeVersion: "24.x"` | Vercel Projects API (`get_project`) |
| CI / kapılar | `node-version: '22'` (4 yerde) | `ci.yml:115`, `deploy-functions.yml:80` ve `:224`, `e2e-smoke.yml:83` |
| Geliştirici makinesi | `v22.16.0` | `node --version` |
| `package.json > engines` | **YOK** | ölçüldü |
| `.node-version` | **YOK** | ölçüldü |

Yani `ci`, `admin-smoke` ve `type-check` **Node 22'de** yeşil oluyordu; prod **Node 24'te**
derleniyordu. Bu, projenin en pahalı hata sınıfıdır: **kapının görmediği boşluk.** Ana sürüme
özgü bir davranış farkı CI'da yeşil görünüp prod'da patlar — ya da tersi, prod'da çalışan bir
şey kapıda kırmızı verir ve sahte-kırmızı avına saat harcanır.

Bu projede riski taşıyan somut yüzeyler:

- **Intl / ICU** — para ve tarih biçimlemesi. Fiyat vitrini ve i18n doğrudan etkilenir; ICU
  sürümü Node ana sürümüyle gelir.
- **undici / `fetch`** — Edge API çağrıları, webhook istemcileri.
- **`require(esm)` davranışı** — 22 ile 24 arasında değişti; karışık modül grafiği olan
  betikler farklı davranır.

## 2. SSOT: `package.json` > `engines.node`

**Tek doğru kaynak `package.json` içindeki `engines.node` alanıdır** ve biçimi `24.x`'tir.

Bu keyfi bir seçim değil, ölçülmüş bir platform davranışı: Vercel dokümanı
(`vercel.com/docs/functions/runtimes/node-js/node-js-versions`) bu alan için açıkça
*"This setting overrides any version selected in project settings"* diyor. Sonuç:

> `engines.node` yazıldığı anda prod sürümü **panodan depoya** taşınır.

Bu, cetvelin en önemli maddesidir. Pano ayarı bir kapının **göremediği** yüzeydir: kimse
farkında olmadan değiştirir, hiçbir test bilmez. `engines` ile aynı değer sürüm kontrolüne
girer, kod incelemesinden geçer ve `INV-NODE-1` tarafından ölçülür.

**Aralık yazmak yasak.** `>=24` teknik olarak geçerli görünür ama hangi ana sürümün koştuğunu
okuyana söylemez. Biçim `<MAJOR>.x` olarak kilitlidir ve kapı bunu ADIYLA doğrular.

## 3. Üç yüzey, tek değer

| yüzey | nerede yazılı | kim okur |
|---|---|---|
| **prod / build** | `package.json` → `engines.node` = `24.x` | Vercel (pano ayarını ezer) |
| **kapılar** | `.github/workflows/*.yml` → `node-version: '24'` | `actions/setup-node` |
| **lokal** | `.node-version` = `24` | `fnm`, `nvm`, `volta`, Vercel CLI |

`INV-NODE-1` üçünün **ana sürümünün** eşit olduğunu ölçer. Yama sürümü serbesttir (24.3 ile
24.9 arasındaki fark bu cetvelin konusu değil); ayrışma **ana sürümde** tehlikelidir.

## 4. Niçin 24 — ve niçin 26 değil

`nodejs/Release` `schedule.json` 2026-08-18'de okundu:

| sürüm | durum | EOL |
|---|---|---|
| v22 | **maintenance** (2025-10-21'den beri; yalnız güvenlik/kritik yama) | 2027-04-30 |
| **v24** | **Aktif LTS** (2025-10-28'den beri) ← **hedef** | 2028-04-30 |
| v26 | **henüz LTS DEĞİL** — LTS 2026-10-28'de | 2029-04-30 |

Yani Node 22 bugün bir **güvenlik** sorunu değil (20 aylık desteği var); sorun **ayrışmanın
kendisi**. Ve en yeniyi kovalamak da yanlış olurdu: 26 LTS olmadan üretim çalışma zamanı
seçilmez. Hedef, prod'un zaten koştuğu ve aktif LTS olan **24**'tür.

## 5. Ana sürümü değiştirme usulü

Bu bir "sürüm güncellemesi" değil, **bilinçli bir karar**dır. Sırayla:

1. **Ölç:** `nodejs/Release` `schedule.json` — hedef sürüm *Aktif LTS* mi? Değilse dur.
2. **Tek PR'da üç yüzeyi birlikte değiştir:** `engines.node`, `.node-version`, tüm workflow
   pinleri. Kapı zaten üçünü birden ölçtüğü için yarım geçiş kırmızı verir — bu kasıtlıdır.
3. `INV-NODE-1` içindeki `BEKLENEN_MAJOR` sabitini güncelle. Bu sabit bir **fren**dir: kapı
   kendi hedefini dosyalardan türetmez, yoksa "hepsi tutarlı biçimde YANLIŞ" durumu sessizce
   geçerdi.
4. **Kanıt CI'dır:** yeni ana sürümde `ci` + `admin-smoke` + Vercel preview yeşil olmalı.
   Lokalde ölçmek yeterli DEĞİL — lokal, tanımı gereği üçüncü yüzeydir.
5. Cetveldeki tabloları ve tarihleri güncelle.

## 6. Bilinen sınır — dürüstçe

- **Pano ayarı hâlâ orada.** `engines` onu ezer, ama pano değerini bu kapı **okuyamaz** (repo
  dışı yüzey). Ezme davranışına güveniyoruz; kanıtı Vercel dokümanı ve preview build'in
  kendisi. Ezmenin bir gün değişmesi bu cetvelin varsayımını çürütür — o gün yeniden ölçülür.
- **Lokal makine gecikebilir.** `pnpm install` `engines` uyuşmazlığında **kırılmaz** (ölçüldü:
  2026-08-18, `engine-strict` ayarlı değil, `pnpm install` çıkış kodu 0 — yalnız uyarır). Bu
  kasıtlı bir yumuşaklıktır: filoyu gün ortasında bloke etmemek için. Ama lokal 22'de kalırken
  kapılar 24'te koşuyorsa, **lokal ölçüm prod kanıtı değildir** — o dönemde kanıt CI'dır.
- **Prod ana sürümü, platform yüzeylerinden OKUNAMIYOR — 2026-08-19'da üç yüzey tek tek denendi:**
  Vercel build günlüğü Node sürümünü hiç yazmıyor · dağıtım kaydında `nodeVersion` alanı yok
  (`lambdaRuntimeStats` yalnız `{"nodejs":5}` diyor, sürüm değil) · `/api/health` `process.version`
  yayınlamıyor. Bu yüzden "prod 24'te koşuyor" iddiası bir dönem **ölçüme değil belgeye** dayandı.
  Boşluk `scripts/assert-node-major.mjs` ile kapatıldı: derleme sırasında sürümü **günlüğe basar**
  (pozitif satır) ve ayrışmada derlemeyi **düşürür**. Reddedilen alternatif: sürümü bir uç noktadan
  yayınlamak — kalıcı bir public bilgi-sizdirma yüzeyi, tek seferlik bir doğrulama için fazla bedel.
- **Betik `prebuild` DEĞİL, `build` betiğinin İÇİNE zincirlenmiştir.** Ölçüldü: depoda `.npmrc` yok,
  dolayısıyla pnpm'in `enable-pre-post-scripts` ayarı varsayılan `false` — `prebuild` yazmak **hiç
  koşmayan** bir bekçi yazmak olurdu. `INV-NODE-1` bu çağrının `scripts.build` içinde kalmasını ölçer.
- **Ölçülen şey BUILD çalışma zamanıdır, lambda çalışma zamanı DEĞİL.** İkisinin aynı ana sürüm
  olduğunu **varsayıyoruz**; bu varsayım ölçülmedi ve burada adıyla durur. Lambda tarafını ölçmenin
  bilinen tek yolu çalışma zamanı sürümünü dışarıya yayınlamaktır ve o bedel kabul edilmedi.
- **Lokal muafiyet ADIYLA:** `assert-node-major.mjs` yalnız `VERCEL` veya `CI` ortamında **katı**dır
  (çıkış 1); geliştirici makinesinde **uyarır ve geçer**. Gerekçe §6'nın ilk maddesiyle aynı: filoyu
  gün ortasında bloke etmemek. Muafiyet **yalnız lokaldedir**; CI ve Vercel'de muafiyet yoktur.
  Hedef türetilemiyorsa (`engines.node` yok/bozuk) betik **lokalde de** düşer — *ölçemedim ≠ geçtim*.
- **`pnpm` ana sürümü bu cetvelin konusu değil.** Workflow'lardaki `pnpm/action-setup version: 10`
  ile lokal pnpm ayrı bir hizalama kalemidir; karıştırılmasın.

## 7. Kapı ne ölçer, ne ölçmez

**Ölçer:** `engines.node` var mı ve `<MAJOR>.x` biçiminde mi · `.node-version` aynı major mu ·
tüm workflow pinleri hedef major mu · her `setup-node` adımı **kendi** sürümünü beyan ediyor mu
(beyan etmeyen adım action'ın sessiz varsayılanına düşer) · ölçüm gerçekten yapıldı mı
(workflow dizini boş gelirse kapı **susmaz**, kırmızı verir — *ölçemedim ≠ geçtim*).

**Ölçmez:** Vercel pano değeri (repo dışı) · geliştirici makinesinin gerçek `node --version`'ı
(kapı CI'da koşar, orada zaten pin geçerlidir) · yama sürümü farkları.

**Pin sayısı bilerek sabitlenmedi.** "Tam 4 pin olmalı" demek, yeni workflow ekleyen şeridi
ilgisiz bir kırmızıyla cezalandırırdı. Kapı yerine *her* `setup-node` adımının pinli ve hedef
majorda olduğunu ölçer — kapsam büyüyünce kapı kendiliğinden büyür.
