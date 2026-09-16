---
name: to-prd
description: Turns the current conversation transcript or context into a structured
  PRD (Product Requirements Document). Trigger for generating a PRD (prd üret, prd
  oluştur, chat to prd). Do NOT use for git commands, styling fonts, running unit
  tests, or database resets.
category: utils
metadata:
  triggers:
  - prd üret
  - prd oluştur
  - chat to prd
  inputs:
  - conversation transcript
  outputs:
  - product requirements document
depends_on: []
next_steps:
- to-issues
run_last: false
exclusions: []
---

# To PRD

This skill takes the current conversation context and codebase understanding and produces a PRD (Product Requirements Document). Do NOT interview the user — just synthesize what you already know.

## Process

1. Explore the repo to understand the current state of the codebase. Use the project's domain glossary vocabulary throughout the PRD.
2. Sketch out the seams at which you're going to test the feature.
3. Write the PRD using the template below and save it to `docs/plans/prd-<konu>-<YYYY-AA-GG>.md`.

### Template:
- **Problem Statement**: The problem from the user's perspective.
- **Solution**: The proposed solution.
- **User Stories**: A numbered list of user stories.
- **Technical Specs**: Seams, APIs, and RLS rules impacted.

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
