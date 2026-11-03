---
name: skills-creator
description: Automatically creates, updates, and optimizes modular agent skills. Trigger
  for creating new skills (yeni skill oluştur, skill yarat/optimize et), adding capabilities
  (yetenek ekle/oluştur), or compiling the manifest. Do NOT use for database operations,
  font formatting, or running general unit tests.
category: orchestration
metadata:
  triggers:
  - yeni skill oluştur
  - skill yarat
  - skill optimize et
  - yetenek ekle
  - yetenek oluştur
  - yetenek yaz
  - skill yaz
  - skill güncelle
  - skills-creator
  inputs:
  - skill name and requirements
  outputs:
  - .claude/skills/<ad>/SKILL.md and evals/evals.json
  - set JSON link, envanter row, ortak bitiş bloğu
  recovery:
  - Yerel kapı kırmızıysa aşağıdaki "Yerel kapı listesi" bölümünde ilgili satırı onar, kapıyı gevşetme.
  commands:
    validate: 'node -e "for (const p of [''scripts/hijyen/skill-bitis-blogu.mjs'', ''scripts/hijyen/arac-envanteri.cjs'']) if (!require(''fs'').existsSync(p)) throw new Error(p); console.log(''Yerel kapı betikleri hazır.'')"'
depends_on: []
next_steps: []
run_last: false
exclusions: []
---

# Skill yazma ve değiştirme

> **Kural (Recep, 3 Kasım 2026):** skill yazma ve değiştirme **yalnız Claude Code'un kendi skill-creator yeteneğiyle**
> (`anthropic-skills:skill-creator`) yapılır. Elle `SKILL.md` yazmak yasaktır. Bu yerel skill onun yerine geçmez; onun
> **ardından** VentHub'a özel kapı listesini ve Türkçe tetik kuralını işletir. Neden: elle yazılan iki skill (CE
> dosyası, kopya silme) açıklama tetik ölçümü olmadan birleşti; açıklamanın işe yarayıp yaramadığı yazı ile değil sınavla anlaşılır.

## Ne zaman

Yeni skill yazılacağında, mevcut bir skill'in açıklaması ya da gövdesi değişeceğinde, "yeni yetenek yaz", "skill güncelle" gibi bir istek geldiğinde.

## Ne zaman DEĞİL

- Skill'i **kullanmak**: ilgili skill'i çağır. Hangi departman hangisini kullanır: `docs/audits/skill-departman-setleri-2026-09-30.md`.
- `.agent/skills` ağacı: kasıtlı çift ağaçtır (Antigravity), burada dokunulmaz ve birleştirilmez.

## Akış

1. **Niyet.** Skill ne yapacak, kim çağıracak, hangi Türkçe cümlelerle tetiklenecek? Cetvel ya da betik varsa skill ona işaret eder, kuralı kopyalamaz.
2. **Taslak ve sınav: Anthropic skill-creator.** Onu çağır (adıyla; Türkçe istek kendiliğinden tetiklemeyebilir). Taslağı onunla yaz, sınav sorgularını onunla hazırla.
3. **Türkçe duyarlılık, en üst önce.** Sınavda hem tetiklenmesi hem tetiklenmemesi gereken Türkçe örnekler zorunludur: çekimli ve ekli ("kopyaları sildirsek", "uygunluk beyanını hazırlar mısın"), yazım hatalı ("worktre temizle"), `ı/İ` ve aksansız varyantlı ("kopyalari sil", "ISIL işlem" gibi benzer kelimelerle karışmayan örnekler), kısa ve uzun cümle. Açıklama yalnız tırnaklı birkaç ifade değil, **işin tarif edildiği ifadeleri** kapsamalıdır; model anlamla eşleştirir, birebir kelimeyle değil.
4. **Sınav dosyası.** `evals/evals.json`, mevcut biçimde (`should_trigger`, `should_not_trigger`), en az 20 sorgu, 12 eğitim / 8 bekletilen bölmesiyle; böylece depodaki `scripts/skills-eval` düzeni ve CI işi "skills yonlendirme sinavi (ucretli, skill degisince)" yeni skill'i de yakalar. **Recep'in gerçek cümleleri dosyaya yazılmaz** (depo herkese açık); türetilmiş örnekler yazılır, gerçek cümlelerle test depo dışında yapılır ve sonuç yalnız sayı olarak raporlanır.
5. **Sınav raporu PR'a.** Tetiklenmeli ve tetiklenmemeli sonuçları ayrı ayrı, Türkçe örneklerin sonucu ayrı satırla. Ağır koşu bellek uyarısında (boş bellek 2 GB altı) bekler; OPS'a yazılır, kapı gevşetilmez.
6. **Yerel kapı listesi** (aşağıda). Hepsi aynı PR'da.
7. **Karta `YÖNTEM:` satırı.** "skill-creator ile" yazılır; sapma varsa sebebiyle yazılır.

## Yerel kapı listesi

| Ne | Nasıl | Kapı |
|---|---|---|
| Set bağı | `docs/audits/skill-departman-setleri-2026-09-30.json`: bir sete ya da `mudurCekirdegi`ne yaz, `.md` karşılığına da | `skill-bagli.test.ts` |
| Yük bütçesi | `name` + `description` her oturumda okunur; açıklama en çok 300 karakter, toplam tavan test dosyasında (kalan pay küçükse bütçe kararı OPS'tan) | `skill-yuku-butcesi.test.ts` |
| Frontmatter | Açıklamada `: ` varsa tek tırnak içine al; ad klasör adıyla aynı | `skill-frontmatter-ayrisir.test.ts`, `skill-ad-cakismasi.test.ts` |
| Bitiş bloğu | `node scripts/hijyen/skill-bitis-blogu.mjs` (gövdeye ekler, frontmatter'a girmez) | `skill-bitis-blogu.test.ts` |
| Araç envanteri | `node scripts/hijyen/arac-envanteri.cjs --yaz --envanter docs/audits/arac-envanteri-2026-09-07.md`, sonra sahip ve durumu elle doldur (`KAL`) | `arac-envanteri.test.ts` |
| Kaynak ve lisans | Dış kaynaklı ise `NOTICE.md` ve `metadata.kaynak` satırı | `notice-kapsami.test.ts` |
| Herkese açık depo | Firma adı, kişi, adres, telefon, kullanıcı klasörü yolu ve sır yazılmaz | PR taraması |

## Çakışma ve kalite

- İki skill'in açıklaması birbirine çok benzemez; tetiklenmeyi karıştıran yakın komşuları sınavda `should_not_trigger` olarak dene.
- Açıklama ne zaman çağrılacağını net söyler: çok geniş ya da çok dar olmaz.
- Yıkıcı eylem içeren skill (silme, geri alma) açık onay ve kuru koşum basamağı taşır.

## Eski yol (kullanma)

`scripts/skills-creator.py`, `scripts/compile_skills.py` ve `orion doc tree --nlm-sync` **`.agent/skills` ağacı** içindir. `.claude/skills` için manifest derlemesi ya da NotebookLM eşitlemesi gerekmez; yerel kapılar yukarıdaki tablodadır.

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
