# REC-319 — Claude Code'un YERLEŞİK skill araçları: ölçüm ve karar

**Tarih:** 2026-09-13 · **Şerit:** ALTYAPI · **Araç sürümü:** `claude` **2.1.269**
**Yöntem:** elle, tek dal, tek PR (iş emrine uygun, yöntem sapması yok)

## KAYNAK/CETVEL

- **Kaynak:** Claude Code yerleşik komutları — `claude plugin validate`,
  `claude plugin eval`, `claude plugin details`, `/skill-doctor`.
- **Yöneten cetvel:** `docs/standards/execution-method-standard.md` (yöntem seçimi) ·
  REC-303 (elle yazdığımız sınav betiği) · REC-304 (oturum başı skill yükü bütçesi) ·
  REC-314 (atıl araç kapısı).
- **Cetvel boşluğu:** "bir skill'in frontmatter'ı ayrıştırılabilir mi" sorusunu
  yöneten yazılı bir cetvel yoktu. Bu iş o boşluğu bir konformans kapısıyla
  kapatıyor (INV-SKILL-FRONTMATTER-1).

## 0. Emirdeki iki iddia — biri yarım doğru çıktı

İş emri (09-12 ölçümüne dayanıyordu) iki kısıt yazıyordu. İkisini de yeniden ölçtüm.

| Emirdeki iddia | Bugünkü ölçüm | Sonuç |
|---|---|---|
| `--plugin-dir` bu sürümde yok | `claude plugin details --plugin-dir ... ` → `error: unknown option '--plugin-dir'` | ✅**DOĞRU** |
| Düz `.claude/skills` klasörü `plugin.json`suz tanınmaz | `claude plugin validate .claude` → **çalışıyor**. `claude plugin eval .claude --case ...` → hedef **çözüldü** (`No eval cases found ... under C:\...\.claude`) | ⚠**YARIM DOĞRU** |

⭐**Yani paketleme adımı, doğrulama için tamamen gereksiz; sınav için de hedef
çözünürlüğü açısından gereksiz.** Paketleme yine gerekebilir ama sebebi
"tanınmıyor" değil, **vaka biçimi** (bölüm 3).

⚠**Aracın kendi hata mesajı BAYAT:** `claude plugin details <yok>` hatası
*"or pass `--plugin-dir <path>` to load one from disk"* diyor — ama o seçenek
bu sürümde **yok**. Mesaja güvenip yola çıkan boşa dolaşır. Ders: **araç
mesajı da bir iddiadır, ölçülür.**

## 1. ⭐`plugin validate` — ilk koşuşunda ÜÇ GERÇEK KUSUR buldu

`claude plugin validate .claude` ve `.agent`, iki ağaçta üç `SKILL.md` için aynı
hatayı verdi. Aracın kendi cümlesi:

> YAML frontmatter failed to parse: YAML Parse error: Unexpected token.
> **At runtime this skill loads with empty metadata (all frontmatter fields
> silently dropped).**

| Dosya | Bozuk alan | Kesin konum (PyYAML) |
|---|---|---|
| `.claude` + `.agent` `/venthub-architecture` | `description` | fm satır 4, kolon 91 — `PPR icin DEGIL:` |
| `.claude` + `.agent` `/venthub-tasarim-dili` | `metadata.kaynak` | fm satır 27, kolon 44 — `Recep: tasarimlar...` |
| `.agent` `/venthub-catalog-importer` | `description` | fm satır 4, kolon 8 — `Tetik: katalog oku, ...` |

**Kök sebep, tek cümleyle:** alıntılanmamış bir YAML düz skalerinin içinde iki
nokta + boşluk geçerse — ya da satır iki noktayla biterse — ayrıştırıcı onu alan
ayracı sanar ve **tüm frontmatter bloğunu** düşürür.

**Etki:** `name` ve `description` yok olur. Açıklama yoksa yönlendirme o skill'i
**hiç seçemez** — skill dosyada durur ama erişilemez. Bu, REC-309'daki "sınavdan
düşen tetik" sorusunun bir parçası olabilir; `find-skills` 6/12 sonucuna bu
açıdan yeniden bakmaya değer (bu işin kapsamında değil).

**Onarım:** yalnızca alıntılama (tek tırnak, içteki kesme işaretleri ikilendi:
`next.config.mjs''te`). **Metnin anlamı değişmedi.** Doğrulama sonrası `.claude`
ve `.agent` ikisi de *"Validation passed"*.

`catalog-importer` **yalnız** `.agent` ağacında bozuktu; `.claude` kopyası
sağlamdı (çift ağaç bilinçli, `CLAUDE.md`). `tasarim-dili` iki ağaçta birebir
aynıydı → onarılmış kopya aktarıldı. `architecture` iki ağaçta **farklıydı** →
ikisi ayrı ayrı onarıldı.

### 1.1 ⚠Bizim kapılarımız bu süre boyunca YEŞİLDİ

`skill-yuku-butcesi` (4 kol) ve `skill-bitis-blogu` (6 kol) o üç dosya bozukken
de **10/10 yeşil** veriyordu. Sebep: ikisi de frontmatter'ı **ayrıştırmayı
denemiyor**, metin olarak tarıyor. **Yeşil kapı, bakmadığı şeyi kanıtlamaz.**

Bu, "yerleşik araç üst küme mi" sorusunun **ilk somut kanıtı**: bir eksen
(frontmatter geçerliliği) yerleşik araçta vardı, bizde yoktu.

### 1.2 Yeni kapı — INV-SKILL-FRONTMATTER-1 (4 kol)

Onarım tek seferliktir, kapı kalıcı. `src/__tests__/conformance/skill-frontmatter-ayrisir.test.ts`

**Kapının sınırı, adıyla:** bu bir **YAML ayrıştırıcısı değildir**. Depoda YAML
bağımlılığı yok (ölçüldü: ne `yaml` ne `js-yaml`; aynı ölçüm
`anon-yazma-nobetcisi.test.ts` içinde de yazılı). Kapı **ölçülmüş kusur
sınıfını** hedefler, her olası YAML hatasını değil. Tam doğrulama
`claude plugin validate` ile yapılır; o komut abonelik ister ve **CI'da koşmaz**.

**Anahtar ayrım:** bir `anahtar:` satırının sağında değer varsa, ondan sonraki
daha derin girintili satırlar o skalerin **devamıdır** — anahtara benzeseler
bile. `Tetik: katalog oku` satırı tam bu yüzden göze çarpmıyor.

**Sabotaj kanıtı** (sabotajdan önce commit `6dc5868f2`):

| Durum | Benim kapım | Yerleşik doğrulayıcı |
|---|---|---|
| Alıntı kaldırıldı (yeniden bozuldu) | **KIRMIZI** — 2 kol (sınıf kolu + kilitli vaka kolu) | **Validation failed** |
| Geri alındı | 4/4 yeşil | Validation passed |

İkisi aynı dosyada **aynı hükmü** verdi. Kapının ölçtüğü şeyin gerçek olduğunun
bağımsız kanıtı budur.

**⚠Kapı fazla ateş etti, ölçüm düzeltti:** ilk hâlim YAML yorumunu değer sandı
ve **beş** dosyayı yanlış yere kırmızı yaptı
(`on_auth_expired: notebooklm login  # 2026-08-17: urun degisti...`). Yerleşik
doğrulayıcı o beşini **geçiriyordu**; iki ölçüm çelişti ve **haklı olan araç
oldu, ben değildim.** Düz skalerde boşluk + `#` bir yorum başlatır; sınır
eklendi, gerekçesi kodda yazılı.

## 2. `plugin eval` — hedef çözülüyor, VAKA BİÇİMİ uyuşmuyor

Yerleşik koşucunun beklediği biçim: `<eval dir>/**/case.yaml`, ya da
`prompt.md` + `graders/*.md`. Bizim biçimimiz `evals/evals.json`.

| Kalem | Sayı |
|---|---:|
| Depodaki `evals.json` | **62** |
| Depodaki `case.yaml` | **0** |
| Depodaki `prompt.md` | **0** |

⭐**Yani yerleşik sınavı koşturmanın önündeki engel paketleme değil, BİÇİM
DÖNÜŞÜMÜ.** 62 dosyalık bir dönüşüm işi ve bu işin kapsamında değil — ayrı
kalem olarak yazılmalı.

Hedef çözünürlüğü kanıtı (ücret üretmeyen kuru yol):

```
claude plugin eval .claude --case "__hicbir-vaka-eslesmesin__" --no-publish --runs 1
→ No eval cases found matching --case "..." under C:\tmp\vh-altyapi-kip\.claude
→ cikis 0
```

Hedef **çözüldü** (dizini tanıdı, altında vaka aradı), vaka **bulunamadı**.

### 2.1 Yerleşik sınavın BİZDE OLMAYAN yetenekleri

Bunlar `--help` metninden okundu, **koşturularak ölçülmedi** (ücret):

- **`--ablation with-without`** — eklentisiz bir taban kolu koşup **fark puanı**
  veriyor. Bizim betiğimizde bu **yok**: bugüne kadar "skill açıkken geçti"
  ölçtük, "skill kapalıyken de geçer miydi" hiç ölçmedik. Tesadüf tabanı yok.
- **`tool_used: Skill`** grader'ı — skill'in gerçekten **tetiklenip
  tetiklenmediğini** doğrudan ölçüyor; ablation altında bu bir "eklenti ateşledi"
  göstergesi sayılıyor, puana karışmıyor.
- **`--max-cost-usd`** — sert bütçe tavanı; tavan her koşum ÖNCESİ kontrol
  ediliyor, yani aşım uçuştaki koşum sayısıyla sınırlı. Tavan aşılırsa ücretli
  grader'lar atlanıyor, ücretsizler yine puanlıyor.
- **Abonelikle koşuyor, API anahtarı GEREKMEZ.** Bu, REC-309'daki
  `ANTHROPIC_API_KEY` bütçe kararını büyük ölçüde **düşürür**.
- Ek bayraklar: `--json`, `--concurrency` (1-8, hepsi aynı kredide), `--tag`,
  `--judge-model` (varsayılan haiku), `--threshold` (varsayılan **1.0**),
  `--trust-plugin` (CI için), HTML rapor + `--no-publish`.

## 3. KARAR TABLOSU — bizim betik mi, yerleşik mi

| Eksen | REC-303 betiği (bizim) | Yerleşik | Hüküm |
|---|---|---|---|
| Frontmatter geçerliliği | **yok** (metin tarar) | **var**, 3 gerçek kusur buldu | ⭐**Yerleşik ÜST KÜME — hemen benimse** |
| Hedef çözünürlüğü | dosya okur, engel yok | düz dizini tanıyor | eşit |
| Vaka biçimi | `evals.json` × 62, **çalışıyor** | `case.yaml`/`prompt.md` × **0** | bizimki **bugün** çalışan tek şey |
| Tesadüf tabanı (ablation) | **yok** | `--ablation with-without` | yerleşik üstün |
| Tetiklendi mi ölçümü | dolaylı (cevap metninden) | `tool_used: Skill` grader'ı | yerleşik üstün |
| Bütçe tavanı | yok (kuru tahmin ~0.13 USD/60 istek) | `--max-cost-usd` | yerleşik üstün |
| Kimlik | API anahtarı ister — **YOK** | **abonelik**, anahtar gerekmez | yerleşik üstün |
| CI'da koşabilir mi | evet (anahtar olursa) | **hayır** (abonelik, etkileşimli kimlik) | **bizimki üstün** |

### Hüküm

1. **Doğrulama ekseninde yerleşik araç hemen benimsendi.** Üç kusur onarıldı,
   kalıcı kapı yazıldı. Bu kısım bitti.
2. **Sınav ekseninde betik EMEKLİ EDİLMEZ — henüz.** Yerleşik yetenek olarak
   üst küme ama **bugün bizim vakalarımızı koşturamıyor** (biçim) ve **CI'da
   koşamıyor** (abonelik). Emeklilik koşulu yazılı olsun: *62 vaka yeni biçime
   dönüştükten sonra aynı üç skill'de kafa kafaya bir koşum yapılır; yerleşiğin
   puanı bizimkiyle tutarlıysa betik emekli olur ve `skills:eval` yerleşiği
   çağırır.*
3. **Anahtar kararı büyük ölçüde düştü.** Yerleşik sınav abonelikle koşuyor;
   `ANTHROPIC_API_KEY` yalnız CI'da otomatik sınav istiyorsak gerekli.

## 4. ÖLÇEMEDİĞİM ŞEYLER — adıyla

Bunlar "yapılamaz" değil, **bu oturumda ölçülmedi**:

- **`claude plugin details <ad>` token maliyeti tablosu.** Komut kurulu bir
  eklenti **adı** istiyor; bizim ağaç kurulu bir eklenti değil ve
  `--plugin-dir` bu sürümde yok. Yani REC-304 betiğiyle sayı karşılaştırması
  (*"hangisi doğru evren"*) **paketleme yapılmadan mümkün değil.** Bu, paketleme
  adımının **tek gerçek gerekçesi** olarak kaldı.
- **`/skill-doctor` ilk raporu.** Etkileşimli bir slash komutu; otonom bir
  oturumda koşturamadım. REC-314'ün `son_kullanim` alanı bu rapordan beslenecek,
  yani o iş buna bağımlı. Recep bir oturumda `/skill-doctor` koşup çıktıyı
  verirse kalan kısım ölçülebilir.
- **Gerçek eval koşumu** (puan, ablation farkı, gerçek maliyet). Biçim dönüşümü
  olmadan koşulamaz; dönüşüm bu işin kapsamında değil.

## 5. Bu raporun kendi sınırları

- Yerleşik araçların yetenek listesi büyük ölçüde `--help` metninden okundu;
  koşturulmuş olanlar yalnız `validate` ve `eval`in kuru hedef çözünürlüğüdür.
- Yeni kapı, frontmatter'ın **bu** kusur sınıfına bakar; başka bir YAML hatası
  (ör. yinelenen anahtar, bozuk girinti) onu **geçer**. Tam doğrulama hâlâ
  `claude plugin validate`tir ve o CI'da koşmaz.
- `find-skills` 6/12 sonucunun bozuk frontmatter'la ilişkisi **kurulmadı**, yalnız
  ihtimal olarak yazıldı.

---

# EK — ADIM 2b: dönüştürücü + PİLOT KOŞUM (2026-09-13 akşam)

Yukarıdaki bölüm 2 "vaka biçimi uyuşmuyor" diyordu ve gerçek koşumu gelecek bir
işe bırakıyordu. O iş yapıldı: dönüştürücü yazıldı ve **sınav gerçekten koştu.**

## 6. Dönüştürücü — `scripts/skills-eval-convert.mjs`

Deterministik, idempotent, `--kuru` destekli. Kaynak `evals.json` **silinmez**;
REC-303 betiği onu kullanmaya devam eder, ikisi birlikte yaşar.

| Kalem | Sayı |
|---|---:|
| Kaynak `evals.json` | **62** |
| Üretilebilecek vaka | **1261** |
| Üretilecek dosya | **2522** |

⭐**Tam dönüşüm depoya KONMADI** (`.gitignore`; betik depoda, çıktı değil —
üretilmiş-artefakt cetveliyle tutarlı ve 2522 dosyalık bir diff'i önler).

⛔**Tam sınav bu biçimde PRATİK DEĞİL, sayıyla:** 1261 vaka × varsayılan 3 koşum
= **3783 ajan koşumu**, `--ablation` açıkken iki katı. Her koşum aboneliğin
üzerinden giden tam bir `claude` çocuğu. REC-309'daki "tam 60 koşu" hedefi bu
sayıya göre yeniden tanımlanmalı (örnekleme: skill başına 4+2, `--runs 1`).

### 6.1 Üç yanlış varsayımım, aracın kendi cümleleriyle düzeltildi

Üçü de **ücret üretmedi** — vakalar yüklenmeden düştü ya da tavan çalıştırmadan
önce kesti.

| Varsayımım | Aracın cevabı | Doğrusu |
|---|---|---|
| Vakalar skill'in altına (`skills/<ad>/evals-yerlesik/`) | *"No eval cases found under …\.claude"* (2 sn) | Sınav dizini **eklenti kökünde**; tek dizin, skill başına değil |
| Ablation kendi başına çalışır | *"ablation requested but no plugin resolved for this case … The with and without arms would run identical configs, so Δ would measure nothing."* | Vaka **`plugins:` beyanı** taşımalı |
| `plugins: skills/<ad>` | *"plugins entry … does not exist"* | Yol **vaka dizinine göreli**: `../../skills/<ad>` |
| `--case "…-0[1-4]*"` | *"No eval cases found matching…"* | Glob **köşeli parantez aralığı desteklemiyor**, yalnız `*` |

⭐**Emirdeki paketleme kısıtına net cevap:** araç `SKILL.md`'yi de kabul ediyor.
Yani `plugin.json` paketlemesi **ne `validate`, ne `eval`, ne `ablation`** için
gerekli. Paketlemenin tek gerçek gerekçesi `plugin details` token maliyeti
olarak kaldı (bölüm 4).

## 7. PİLOT — 18 vaka, 36 koşum, gerçekten koştu

3 skill × (4 tetiklenmeli + 2 tetiklenmemeli). `--runs 1 --ablation with-without
--concurrency 2 --no-publish`.

| Kalem | Ölçüm |
|---|---|
| Vaka | **18** · koşum **36** (2 kol) |
| Süre | **612 sn** (10 dk 12 sn) |
| Maliyet | **5,76 USD eşdeğeri** · `partial: false` (tavan aşılmadı) |
| Geçen | **10/18** · ortalama puan 0,556 · **ortalama Δ 0,333** |

⚠**"USD" NE DEĞİLDİR:** aracın bastığı tutar bir **fatura değil**, abonelik
kotasından harcanan bedelin araç tahminidir. Ölçüldü: `ANTHROPIC_API_KEY` ve
`ANTHROPIC_AUTH_TOKEN` uzunluğu **0**, `.env` dosyalarında eşleme yok — yani
koşum **abonelikten** gitti, ayrı bir anahtar kullanılmadı.

### Skill başına (kol türüne ayrılmış)

| Skill | TETİKLENMELİ | with | without | **Δ** | TETİKLENMEMELİ |
|---|---|---:|---:|---:|---|
| `investigate` | **4/4** | 1,00 | 0,00 | **+1,00** | 1/2 |
| `diff-review` | **4/4** | 1,00 | 0,50 | **+0,50** | 0/2 |
| `venthub-architecture` | **0/4** | 0,00 | 0,00 | **0,00** | 1/2 |

## 8. ⭐⭐KONTROLLÜ DENEY — bozuk frontmatter skill'i ERİŞİLEMEZ yapıyor

Pilot, `altyapi/rec319-eval-donusturucu` dalında koştu ve o dal **#1174 merge
edilmeden önce** açılmıştı. Yani **çalışma ağacında frontmatter onarımı yoktu**
ve `claude plugin validate` aynı ağaçta hâlâ *"loads with empty metadata (all
frontmatter fields silently dropped)"* diyordu.

`venthub-architecture`'ın 0/4'ü tesadüf değildi. Aynı 4 vaka, onarım **olan**
ağaçta (güncel `origin/master`) yeniden koşuldu. **Tek değişken: frontmatter'ın
alıntılanması.**

| Vaka | Bozuk ağaç (with / Δ) | Onarımlı ağaç (with / without / Δ) | sn | USD eşd. |
|---|---|---|---:|---:|
| `…-01-yeni-bile-en-olu-tur` | 0 / 0 | **1 / 0 / +1** | 49 | 0,26 |
| `…-02-rsc-render` | 0 / 0 | **1 / 0 / +1** | 62 | 0,29 |
| `…-03-render-cache-stratejisi` | 0 / 0 | **1 / 0 / +1** | 47 | 0,27 |
| `…-04-dashboard-i-in-yeni-bile-en-olu-tur` | 0 / 0 | **1 / 0 / +1** | 38 | 0,25 |
| **TOPLAM** | **0/4 · Δ 0,00** | **4/4 · Δ 1,00** | **196** | **1,07** |

⭐**Sonuç:** bozuk bir frontmatter, skill'i **hiç tetiklenemez** hâle getiriyor;
onarıldığında aynı istemlerde **dördü de** tetikleniyor ve tesadüf tabanı
(`without` kolu) her seferinde 0 — yani tetikleme skill'den geliyor, şanstan
değil. Bu artık iki fonksiyon gövdesinden çıkarılan bir **yorum değil, ölçülmüş
davranış**.

Bu bulgu REC-309'u doğrudan besliyor: `find-skills` **6/12** sonucu, ölçüm
evreni değiştiği için **bayat** sayılmalı ve #1174 sonrası yeniden ölçülmeli.

**Günün toplamı:** 5,76 + 1,07 = **6,83 USD eşdeğeri** (onaylanan zarf 7,50).

## 9. ÜÇ SINIR — aracın bu koldaki zayıflıkları

1. **`tool_used: Skill` HANGİ skill'i ayırt ETMİYOR.** Yalnızca `Skill`
   aracının çağrıldığını sayıyor. Grader gövdesine *"çağrılan skill X olmalı"*
   yazdım ama **tip bunu okumuyor**. Ölçülmüş sonucu: `diff-review`'ın `without`
   kolu **0,50** — eklenti kapalıyken de bir **başka** skill ateşleniyor ve
   grader onu "geçti" sayıyor. Yani `diff-review`'ın Δ 0,50'si "yarısında
   tesadüf olabilir" demektir.
2. **OLUMSUZLAMA grader'ı YOK.** Resmi belgede de yok. `should_not_trigger`
   kolu bu yüzden `llm` grader ile yazıldı ve o, **aracın izine değil cevabın
   metnine** bakıyor. Ölçülmüş sonuç: `diff-review` 0/2, `investigate` 1/2,
   `venthub-architecture` 1/2 — ve `diff-review-06`'da **Δ −1** (eklenti
   KAPALIYKEN geçti, AÇIKKEN düştü). Bu sayı bir kusur değil, **ölçüm aracının
   bu koldaki zayıflığıdır.**
3. **CI'da koşamıyor** (abonelik, etkileşimli kimlik) — bölüm 3'te zaten yazılı.

## 10. KARAR TABLOSU — DÜZELTİLDİ: üst küme değil, KESİŞİM

Bölüm 3'teki hüküm bu ölçümlerle **düzeltiliyor**. Yerleşik araç her eksende
üstün değil:

| Eksen | Kazanan | Gerekçe (ölçülmüş) |
|---|---|---|
| Frontmatter geçerliliği | **Yerleşik** | 3 gerçek kusur buldu, bizim 10 kolumuz görmedi |
| Tesadüf tabanı (ablation) | **Yerleşik** | bizde YOK; `investigate` Δ +1,00 ölçüldü |
| Gerçek maliyet | **Yerleşik** | vaka başı ~0,28 USD eşd.; REC-303'te "ölçülemedi" idi |
| Bütçe tavanı | **Yerleşik** | `--max-cost-usd` çalıştırma öncesi kesiyor (ölçüldü) |
| Kimlik | **Yerleşik** | abonelik; anahtar gerekmez |
| **Hangi skill tetiklendi** | **Bizim betik** | `tool_used` ayırt etmiyor (sınır 1) |
| **Tetiklenmemeli kolu** | **Bizim betik** | olumsuzlama grader'ı yok (sınır 2) |
| CI'da koşabilme | **Bizim betik** | yerleşik etkileşimli kimlik ister |
| Bugün çalışan vaka biçimi | **Bizim betik** | 62 `evals.json` çalışıyor; dönüşüm yeni |

**HÜKÜM: yerleşik araç ÜST KÜME DEĞİL, KESİŞİM.** Doğrulama ekseninde
tartışmasız üstün ve **hemen benimsendi**. Tetikleme ekseninde üstün ama
"hangi skill" ayrımını yapamıyor. Tetiklenmemeli ekseninde **bizim betiğimiz
üstün olabilir**.

**Betik EMEKLİ EDİLMEZ.** Emeklilik koşulu güncellendi: *yerleşik araca (a)
olumsuzlama grader'ı ve (b) hangi skill'in tetiklendiğini ayırt eden bir ölçüm
geldiğinde, aynı vakalarda kafa kafaya bir koşum yapılır; yerleşik iki eksende
de eşit ya da üstünse betik emekli olur.*

**`ANTHROPIC_API_KEY` kararı:** büyük ölçüde düştü. Yerleşik sınav abonelikle
koşuyor (ölçüldü). Anahtar yalnız **CI'da otomatik sınav** istenirse gerekli.

## 11. Bu ekin kendi sınırları

- Pilot **`--runs 1`** ile koştu; varsayılan 3'tür. Tek koşum, LLM
  değişkenliğini ölçmez. `investigate` 4/4 ve `venthub-architecture` 0/4 → 4/4
  farkı tek koşumda bile çok net, ama 0,50 gibi ara değerler tek koşumla
  **güvenilir değildir**.
- Örnekleme skill başına ilk 4 tetik + ilk 2 tetiksiz vakayı aldı; **rastgele
  değil**, dosyadaki sıra. Sıra bir yanlılık taşıyorsa ölçüm onu taşır.
- Kontrollü deney **tek skill** üzerinde yapıldı (`venthub-architecture`).
  Diğer iki bozuk skill (`venthub-tasarim-dili`, `venthub-catalog-importer`)
  için aynı önce/sonra **koşulmadı**.
- `/skill-doctor` ve `plugin details` hâlâ **ölçülmedi** (bölüm 4'teki
  gerekçeler geçerli).

## 12. Kendi ölçüm hatalarım — adıyla

- **Özetleyici betiğim iki kez yanlış alan okudu** ve sahte tablo üretti: önce
  "hepsi 0/6 geçti", sonra "hepsi TETİKSİZ". İkisini de çıktı makul görünmediği
  için yakaladım ve JSON yapısını okuyup düzelttim. Doğru ayrım grader
  tipinden: `tool_used` = tetik kolu, `llm` = tetiksiz kolu. Skor alanları
  `case.aggregates` içinde: `{score, passRate, scoreWithout, passRateWithout,
  delta}`. **Bugün üçüncü kez kendi süzgecim yanılttı** — sayı makul
  görünmüyorsa önce ölçüm aracına bakılır.
- **Belirsiz süzgeç ölçüm değildir:** yol biçimlerini denerken `grep "1 case"`
  kullandım; o ifade hem *"1 case file(s) failed to load"* hem *"1 case(s) ·
  mean Δ"* içinde geçiyor ve iki zıt sonucu aynı gösterdi. Tam çıktı okununca
  doğrusu belli oldu.
- **Kancam bir sır sızıntısını durdurdu:** anahtar varlığını ölçerken
  varsayılan-değer kalıbı yazdım; o kalıp değişken **dolu** olduğunda varsayılanı
  değil **değerin kendisini** basar. `bash-write-guard` reddetti ve gerekçesini
  hatırlattı (2026-09-04'te aynı kalıp prod DB bağlantı dizesini dökmüş).
  Doğru biçim uzunluk ölçümüdür; reddi **kılık değiştirip tekrar denemedim**,
  yöntemi değiştirdim.
