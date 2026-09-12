---
name: web-design-guidelines
description: Reviews UI code for Web Interface Guidelines and design compliance. Trigger
  for accessibility checks (erişilebilirlik denetle, a11y check), or design guidelines
  checks. Do NOT use for git commands, styling fonts, or running unit tests.
metadata:
  author: vercel
  version: 1.0.0
  argument-hint: <file-or-pattern>
  triggers:
  - erişilebilirlik denetle
  - a11y check
  - design guidelines check
  inputs:
  - UI code files
  outputs:
  - a11y compliance report
category: guards
depends_on:
- ui-ux-pro-max
next_steps: []
run_last: false
exclusions: []
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

### 💎 Strict Token Sistemi (Tailwind Arbitrary Class Yasağı)
VentHub UI tasarımı sıkı bir token sistemine bağlıdır. Tasarım değerlerinin bütünlüğü için aşağıdaki kısıtlamalar **ZORUNLUDUR**:
* **Tailwind Arbitrary Class Yasağı:** Tailwind CSS içerisinde `w-[92vw]`, `bg-[#ff0000]`, `h-[42px]` gibi serbest/keyfi (arbitrary) köşeli parantezli değerlerin doğrudan yazılması kesinlikle **YASAKTIR**.
* **HSL CSS Custom Property Kullanımı:** Tüm renk ve tasarım değerleri, projenin global CSS değişkenleri (CSS Custom Properties - HSL token'ları) üzerinden tüketilmelidir. 
  - *Yanlış:* `bg-[#1a202c]` veya `text-[#ff4500]`
  - *Doğru:* HSL değişkenlerinden türeyen Tailwind sınıfları (örneğin `bg-background`, `text-primary`, `border-border` vb.) ya da CSS Custom Property değerleri.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:
1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

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
