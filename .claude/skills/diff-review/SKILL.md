---
name: diff-review
context: fork
agent: denetim-opus
description: Git diff çıktılarını analiz ederek yıkıcı ve tehlikeli kod örüntülerini
  (pattern) tespit eder. Sadece kod değişikliklerini (git diff veya commit öncesi)
  incelemek için kullanın. Yeni git branch'i oluşturma, kod commit'leme veya genel
  git işlemleri için KULLANMAYIN.
category: audit
metadata:
  triggers:
  - diff review
  - commit check
  - git diff check
  inputs:
  - git diff output
  outputs:
  - checks verdict (pass/fail)
  commands:
    validate: python .claude/skills/diff-review/scripts/check_diff_rules.py
depends_on: []
next_steps:
- git-commit
run_last: false
exclusions: []
---

# Diff-Review Skill (Değişiklik Güvenliği Kontrolü)

## Ne Zaman Kullanılır
- Kod değişiklikleri commitlemeye (örn: `/bitir`) gönderilmeden *hemen önce*.
- Bir fonksiyonun silindiği veya tip güvenliğinden şüphelenilen değişikliklerde.

## Çalışma Prensibi
Ajanın insiyatifine ("Baktım, her şey yolunda" halüsinasyonuna) bırakılmamış bir `Guardrail` (Duvar) sistemidir. Dalın TABANINA (`origin/master`, yoksa `master`; `--taban <dal>` ile değişir) göre diff alır: commitlenmiş + staged + unstaged değişiklik tek geçişte taranır. Çıktının ikinci satırı hangi tabanın tarandığını söyler. Taban çözülemezse `[UYARI] taban bulunamadi` basar ve yalnız commitlenmemiş değişikliğe (`git diff HEAD`) düşer — sessiz yeşil vermez; `--taban` çözülemezse çıkış 2.
Eğer riskli bir hareket tespit ederse `Exit Code 1` döner ve süreci bloklar.

## Kapsanan Kurallar (Siyah Liste)
1. **Type Any (`+.*: any`, vb.):** Sıkı TS kurallarına göre bir şeye `any` atamak bir zayıflıktır.
2. **Yıkıcı DB İşlemleri (`+.*DROP TABLE`, vb.):** Supabase migrate sırasında kazara bir verisinin düşmesi engellenir.
3. **Kritik İhracatları Kesmek (`-.*export function` vb.):** Varolan bir servisin public methodunun silinmesine `[MAJOR]` uyarı fırlatır, dikkat çeker.

## Nasıl Çalıştırılır
Terminale (veya `SafeToAutoRun` workflowuna) şu komut girilerek otonom denetim sağlanır:
```bash
python .claude/skills/diff-review/scripts/check_diff_rules.py            # tabanı kendisi bulur
python .claude/skills/diff-review/scripts/check_diff_rules.py --taban origin/master
```
Çıkış kodu: `0` temiz (ya da yalnız MAJOR/MINOR uyarı) · `1` BLOCKER var · `2` tarama ÇALIŞAMADI (git yok, `--taban` çözülemedi). `2` "temiz" demek değildir.
Kapı testi: `src/__tests__/conformance/diff-review-taban.test.ts` (python ister; `python` ya da `python3`).

Eğer haklı bir gerekçe (Örn: Veritabanı masayı *bilerek* drop etmeli) varsa, kod satırının yanına `// diff-ignore` comment'i eklenerek kural aşılır.
Örn:
```ts
const foo: any = parseUnknownData(); // diff-ignore: Dış API'den gelen veriye Type uygulanamadı.
```
4. **Console.log kalıntısı:** Geliştirme çöpünün production'a sızması engellenir.
5. **Hardcoded URL sızıntısı (localhost:3000):** Geliştirme ortamı URL'si production bundle'a gitmemeli.
6. **Mock data sızıntısı:** app/ path'lerinde inline object array kalıntıları (geçici test verisi).
7. **Secret sızıntısı (service_role):** Supabase service_role anahtarının client bundle'a sızması.
8. **useSearchParams Suspense İhlali (⚠BETİK BUNU ÖLÇMEZ — yalnız elle/gözle bakılır; betiğe ekleme ayrı iş, D11):** Git diff'te yeni eklenen veya değiştirilen bir dosyada `useSearchParams` hook'unun kullanıldığı, ancak dosya içerisinde `<Suspense>` sarmalının veya wrapper'ının yer almadığı durumlar riskli kabul edilerek uyarılır.

## Çıtayı düşürerek yeşil (YTN-21 eki, elle okunur)

Ajan akıllıca kaçak aramaz; kırmızı bir kapıyla karşılaşınca yeşile en ucuz yolu seçer. Diff okunurken şu beş hareket aranır (betik çoğunu ölçmez; `git diff <taban>...HEAD` ile gözle bakılır, betiğe ekleme ayrı iş):

1. **Eşik oynadı.** Bütçe düşürüldü, ciddiyet indirildi, bir kontrol hızlı aşamadan çıkarıldı. Kısıt/eşik dosyası dal noktasındaki hâliyle karşılaştırılır.
2. **Test kolaylaştı.** `.skip`/`.only` eklendi, test dosyası silindi, kalan testlerden assert çıkarıldı.
3. **Denetleyici susturuldu.** Yeni `@ts-ignore`, `@ts-expect-error`, `eslint-disable`. Bir kontrolü kapattıkları için ayrıca dikkat: kapsamdan düşüren `istanbul ignore`, hayatta kalan mutantı saklayan `Stryker disable`, güvenlik bulgusunu susturan `nosemgrep` ve `gitleaks:allow`.
4. **İş yarım.** Fırlatan taslak, hatayı sessizliğe çeviren boş `catch`, uygulamanın yerinde duran `TODO`.
5. **Yeni istisna.** Kimsenin tartışmadığı bir istisna satırı.

**İstisna tablosu:** her istisna (`// diff-ignore` dahil) yanında sahip + bitiş tarihi + gerekçe taşır; sahibi ve tarihi olmayan istisna bulgudur. Eşiği sıkılaştırmak sessiz geçer, gevşetmek yüksek sesle raporlanır.

Her bulgu bir kırılma girdisi ve sonucuyla yazılır (`code-review` ile aynı kural). Tam test/tsc yerelde koşmadığımız için çıtası düşürülmüş bir değişiklik CI'da da yeşil görünür; fark ancak bu elle okumada yakalanır.

Kaynak: addyosmani/agent-skills constraint-driven-development @f3400940f6961e68fa56bdb6214d0183d8d8ae49 (MIT)

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
