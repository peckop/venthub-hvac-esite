# T077-VH — "Ad-arayan iddia" filo taraması (conformance bekçileri)

> **Tarih:** 2026-08-17 · **Şerit:** LEGAL-SEO (`eda80084`) · **Tür:** ölçüm-only, kod değişikliği YOK
> **Kaynak kusur sınıfı:** `substring-assert-is-not-a-gate` — *"bir ismin dosyada GEÇMESİ hiçbir şey kanıtlamaz"*
> **Tetikleyen olay:** PR #620 sabotaj turunda `INV-CANONICAL-1` kuralı, import silinip yerine
> `const SITE_URL = 'https://sabit.example'` konulunca **yeşil kaldı** — kapı, tam olarak
> yasaklamak istediği davranışı ödüllendiriyordu.

## 1. Aranan altı biçim

| # | Biçim | Nasıl atlatılır |
|---|---|---|
| F1 | rename-körü `toContain('ad')` | `adX` de alt-dize olarak `ad` içerir → yeniden adlandırma görünmez |
| F2 | kaçış zinciri | regex'e görünmez kontrol baytı sızar (`\b` → 0x08); desen hiç eşleşmez |
| F3 | **IMPORT satırı tatmin eder** | çağrı sabit değerle değiştirilir, `import { ad }` satırı kalır → yeşil |
| F4 | **YORUM tatmin eder** | kuralı anlatan yorum, naif alt-dize iddiasını doyurur |
| F5 | fakir argüman | çağrı var ama girdisi denetlenmiyor |
| F6 | **YEREL SABİT gölgeleme** | `const SSOT_ADI = '...'` — import yokken de ad dosyada geçer |

## 2. Yöntem ve **aracın göremedikleri** (adıyla)

Tarayıcı 61 conformance testini okudu; 58'i kaynak tarıyor, 3'ü taramıyor.

**Araç önce kendini sınadı** (kör araç yalan söyler): sentetik kötü örnek (`toContain('parseAdminTheme')`)
yakalandı, sentetik iyi örnek (`toContain('parseAdminTheme(')`) temiz geçti, yorum-sıyırma varlığı ve
yokluğu ayrı ayrı doğrulandı. Sınav geçilmeseydi rapor üretilmeyecekti.

**Araç GÖREMEZ — bu sınıflar elle bakılmalı:**
- **`toContain` öznesi DİZİ mi STRING mi.** Dizide `toContain` **tam eşitliktir**, string'de
  alt-dizedir. Statik olarak ayırt edilemez → `edge-security.test.ts:489` bu yüzden yanlış-pozitif
  çıktı ve elle elendi (`blocks` bir dizi).
- **F5 (fakir argüman).** Çağrının argümanının anlamlı olup olmadığı statik olarak bilinemez.
- **F2 (kaçış zinciri).** Tarandı, **sıfır** bulundu — ama yalnız kontrol baytı arandı; bozuk
  ama yazdırılabilir kaçışlar (`\\b` yerine `\b`) kapsam dışı.
- Testin `.md` cetvel metni mi kod mu denetlediği — düzyazıda kelime aramak MEŞRUDUR
  (`auth-session-security.test.ts:84` bu yüzden elendi).
- **AST tabanlı analiz.** Araç *"kaynak tarıyor ama yorum sıyırmıyor"* imzasını kusur sayar;
  oysa TypeScript AST'i üzerinde çalışan bir bekçide (`ts.forEachChild`) yorumlar **zaten yoktur**
  ve sıyırıcı gereksizdir. `hook-referential-stability.test.ts` bu yüzden yanlış-pozitif çıktı
  ve §3.3'ten ÇIKARILDI. Ders: *"tarama var mı"* ile *"nasıl tarıyor"* farklı sorulardır.

**Elenen yanlış-pozitif sınıfları** (bir sonraki tarayan tekrar uğraşmasın):
yol filtreleri (`key.includes('__tests__')`), kapsam seçiciler
(`if (!clean.includes('mutateWithAudit')) continue`), regex bayrakları, dizi öznesi, cetvel düzyazısı.

## 3. Bulgular

### 3.1 ORTA — `import` satırı tatmin ediyor (F3)

Bu iddialar tüm dosya gövdesinde çıplak identifier arıyor. Çağrıyı sabitle değiştirip import'u
bırakan bir sabotaj **yeşil geçer** — INV-RETURN-1'de (PR #555) birebir yaşandı.

| Dosya:satır | İddia | Sahip |
|---|---|---|
| `auth-account-surface.test.ts:79` | `expect(pdp).toContain('useFavorites')` | AUTH |
| `auth-reset-chain.test.ts:102` | `expect(src).toContain('hibpPwnedCount')` | AUTH |
| `auth-reset-chain.test.ts:126` | `expect(src).toContain('exchangeCodeForSession')` | AUTH |
| `kvkk-request-ledger.test.ts:139` | `expect(bodySrc).toContain('computeDueState')` | AUTH |

**Çözüm:** import satırlarını çıkar, sonra **çağrıyı** ara — `/\buseFavorites\s*\(/`.

> `auth-account-surface.test.ts:79` iki kat riskli: o dosyada **yorum sıyırma YOK** (§3.3),
> yani F3 ve F4 aynı iddiada üst üste biniyor.

### 3.2 ORTA — yerel sabit gölgeleme, **kendi bekçimde** (F6)

| Dosya:satır | İddia | Sahip |
|---|---|---|
| `legal-promise-backing.test.ts:182` | `expect(kodSatirlari).toContain('identityThreshold')` | **LEGAL (ben)** |

Kural: *"fatura haddi koda gömülmemiş, konfigürasyondan gelir."* Aynı `it()` bloğu `12000/9900/5000`
sabitlerini yasaklıyor — ama `const identityThreshold = BASKA_SABIT` biçiminde bir yerel tanım
**her iki iddiayı da geçer**. Yani kural "dışarıdan parametre olarak geliyor" demek istiyor,
ölçtüğü şey ise "bu kelime dosyada var".

**Çözüm:** parametre bağını ara — `checkInvoiceIdentity` imzasında üçüncü parametrenin varlığı
+ `legal.ts` tarafında `invoiceIdentityThreshold` alanının **import edildiği** kanıtı.

Ayrıca aynı dosyanın yorum sıyırıcısı satır-başı kipinde
(`filter(s => !/^\s*(\*|\/\/|\/\*)/)`) — **satır sonundaki** yorumlar (`kod // not`) hayatta kalır.

### 3.3 ORTA — yorum sıyırma hiç yok (F4)

Kaynak tarayan ama yorumları hiç sıyırmayan bekçiler. Kuralı **anlatan** bir yorum, iddiayı
doyurabilir — INV-STOCK-1'de (PR #556) birebir yaşandı.

| Dosya | Sahip | Yön |
|---|---|---|
| `auth-account-surface.test.ts` | AUTH | yanlış-YEŞİL (`toContain` gerektiren kurallar) |
| `pricing-cache-invariants.test.ts` | PRICING-STOK | her iki yön: `/is_derived/.test(source)` yorumla doyar (yanlış-YEŞİL); yasaklı yazma deseni yorumda geçerse yanlış-KIRMIZI |

> **DÜZELTME (aynı gün, ilk yayından sonra):** bu listede üçüncü sıradaki
> `hook-referential-stability.test.ts` **ÇIKARILDI — yanlış-pozitifti.** O bekçi alt-dize
> aramıyor; TypeScript **AST**'ı üzerinde çalışıyor (`ts.forEachChild`, `isObjectLiteralExpression`).
> AST'te yorumlar zaten **yok**, dolayısıyla sıyırıcıya ihtiyacı da yok — üstelik AST analizi
> alt-dize aramasından kesinlikle daha güçlüdür. Bulgu, düzeltmeye oturulduğunda dosya
> okununca çürüdü. Aracın göremediği **dördüncü sınıf** bu: *"kaynak tarıyor ama sıyırmıyor"*
> imzası, AST tabanlı analizde bir kusur DEĞİLDİR (§2'ye eklendi).

### 3.4 DÜŞÜK — rename-körü alt-dize (F1)

| Dosya:satır | İddia | Not |
|---|---|---|
| `admin-theme-invariants.test.ts:284` | `toContain('defaultThemeResolved')` | Bir üst satır dersi öğrenmiş (`toContain('parseAdminTheme(')`), bu satır **atlanmış** |
| `auth-account-surface.test.ts:87` | `toContain('address_line')` | DB alan adı; import riski yok, yalnız rename-körü |
| `kvkk-request-ledger.test.ts:116` | `toContain('due_at')` | DB kolon adı; aynı sınıf |

### 3.5 TEMİZ — sıfır bulgu

- **F2 (kontrol baytı):** 58 dosyanın hiçbirinde görünmez kontrol baytı yok.
- **Doğru desenin canlı örneği:** `auth-reset-chain.test.ts:85-90` —
  `extractCallArgs(src, 'resetPasswordForEmail')` ile **çağrıyı** bulup **argümanları** denetliyor.
  Aranan desen budur: *çağrı + girdi birlikte*.

## 4. İş emirleri (sahiplerine)

| Sahip | İş |
|---|---|
| AUTH | §3.1'in üç satırı + §3.3'ün bir dosyası — import'u çıkar, çağrıyı ara |
| PRICING-STOK | §3.3 `pricing-cache-invariants.test.ts` — yorum sıyırma ekle |
| ADMIN-CUSTOMER | §3.4 `admin-theme-invariants.test.ts:284` — sınır ekle |
| ~~sahipsiz~~ | ~~`hook-referential-stability.test.ts`~~ — **iş emri İPTAL**, yanlış-pozitif (§3.3 düzeltmesi) |
| LEGAL-SEO (ben) | §3.2 kendi bekçim — ✅ **YAPILDI** (aşağıda) |

### 4.1 ✅ Kapanan: §3.2 (LEGAL-SEO)

`legal-promise-backing.test.ts` — `toContain('identityThreshold')` yerine **bağ** aranıyor:

1. eşik `checkInvoiceIdentity` **imzasında** parametre mi,
2. gövdede aynı adla **yerel tanım YOK** mu (parametreyi gölgelemesin),
3. çağıran `config/legal` modülünü **import ediyor** mu,
4. çağrıya `legalConfig.invoiceIdentityThreshold` **geçiriliyor** mu.

**Sabotaj 4/4** — dördü de eski kuralın GEÇİRDİĞİ sabotajlar; dördü de artık KIRMIZI:
eşiği parametre olmaktan çıkarıp gövdeye taşımak · parametreyi aynı adlı yerel sabitle
gölgelemek · çağıranın SSOT alanı yerine sabit geçirmesi · çağıranın import'u bırakması.

**Her düzeltme sabotajla kanıtlanmalı:** kuralı bilerek boz, KIRMIZI gör, düzelt, **tekrar boz**.
Yeni kural yazarken yanlış-POZİTİF kontrolü de koy (doğru kodu yorumda tekrarla → YEŞİL kalmalı).

## 5. Taramanın kendi sınırı

Bu rapor **aday listesi değil, elle doğrulanmış** bulgu listesidir: tarayıcının ürettiği 25 aday
satır tek tek okundu, 12'si yanlış-pozitif olarak elendi. *"Aday listesi kanıt değildir"* —
`measure-tool-can-be-blind`.

Buna rağmen liste **tam değildir**: §2'de adı konan sınıflar (dizi/string ayrımı, F5, yazdırılabilir
bozuk kaçışlar) taranamadı. Bunlar "temiz" değil, **ölçülmemiş**tir.
