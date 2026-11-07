# Uygulayıcı izolasyonu ve ekip (agent teams) ölçümü — `isolation: worktree` ve `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`

Sahibi: ARAÇ · Kart: ARC-120 (OPS emri 12 Ekim, REC-529 madde 3) · Son doğrulama: 2026-11-07 · Kaynak: ARC-193 kart notları (1 Kasım), `docs/standards/execution-method-standard.md` §10 (ekip deneyleri 30 Eylül, 1 Ekim; pilot 19 Ekim), code.claude.com alt ajan belgesi.

Bu defter yeni koşum DEĞİL, dağınık ölçümlerin tek yerde toplanmasıdır; "ölçüldü" yazan her satırın kaynağı yanındadır, "ölçülmedi" yazan satır yeniden ölçme sırasıdır.

## 1. Soru ve hüküm

**Soru 1:** Yedi uygulayıcı ajan dosyasına (admin, altyapı, edge, i18n, satış, tasarım, ürün) `isolation: worktree` eklemek akışı bozar mı?

**Hüküm: toplu yayma yok. Koşullu uygun:** yalnız master'dan başlayan ve `node_modules` gerektirmeyen okuma/analiz işlerinde. Test koşturan uygulayıcılara uygun değil (karar 88 ile çakışıyor). OPS hükmü ARC-84 "uygun" (4 Kasım). Ajan dosyalarında DEĞİŞİKLİK YOK; ajan tanımı Yetenek/OPS alanıdır.

**Soru 2:** `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` açıkken adlandırılmış (`name` verilmiş) alt ajan teammate'e dönüşüyor mu?

**Hüküm: yüzeye bağlı.** Etkileşimli terminalde evet (`in-process teammate`). Claude Desktop Code sekmesinde HAYIR: bayrak açıkken bile düz alt ajan olarak sessizce açılıyor. Departman pencereleri Desktop'ta çalıştığı için bizim ortamımızda bayrak adlandırılmış alt ajanı teammate yapmıyor.

## 2. `isolation: worktree` ölçümleri

| # | Ölçülen | Sonuç | Kaynak |
|---|---|---|---|
| 1 | Özellik var mı | Var: `isolation: worktree` alt ajan frontmatter'ında; değişiklik yoksa kopya otomatik temizlenir. claude 2.1.296. | belge + sürüm, 1 Kasım 13:35 |
| 2 | Ajan dosyalarında kullanım | 73 ajan tanımında `isolation` satırı 0 (10 uygulayıcı dahil). | `git grep`, 1 Kasım |
| 3 | Kopyanın tabanı | `origin/master` ucu, müdürün açık dalı DEĞİL. Yerel dallardaki commit nesneleri depo ortak olduğu için okunur, ama dosya ağacında görünmez. | gerçek koşum, 1 Kasım 16:48 (~79 sn); pilot 19 Ekim |
| 4 | `node_modules` | YOK; kurulum gerekir. Karar 88 çakışması sürüyor: kopyada test koşamaz. | aynı koşum |
| 5 | Kural yükleme | `CLAUDE.md`, `.claude/hooks`, `.claude/rules` kopyada VAR ve bağlama yüklendi (Mutlak Kurallar ve filo-ortak görüldü). Eski 7 Eylül denetim notundaki "yüklenmez" iddiası doğrulanmadı, tersi çıktı. | aynı koşum |
| 6 | Şerit (claim) | `board.cjs who` okunuyor; kopya yine de oturum kimliği vermedi ("kendi şeridin olarak işaretlenemez"). | aynı koşum |
| 7 | Temizlik | Değişiklik yapılmadığı için kopya, klasör ve dal otomatik silindi. Kopya çalışırken 168 satırlık worktree listesinde `locked`. | aynı koşum |
| 8 | Maliyet (pilot) | Kurulum ~2 dk 28 sn, ~1 GB disk, boş bellek 6,1 → 3,6 GB. Yeniden ölçülmedi. | pilot 19 Ekim, `urun-uygulayici` |
| 9 | Ajan hatası | Talimata rağmen yanlış yola `cd` denedi (yol yoktu, dizin değişmedi): kopya yolunu görev metnine yazmak gerek. | aynı koşum |

**Bizim akışımız bozuluyor mu?**
- Yerel dal + C:/tmp ağaçları akışı: kopya müdürün dalını görmez (madde 3); müdürün açık dalındaki işe katkı veremez, ancak master tabanlı bağımsız işe uygundur.
- Kanca ve şerit kapıları: kurallar ve kancalar yükleniyor (madde 5); şerit kimliği alınamıyor (madde 6).
- Test: kopyada koşamaz (madde 4), bu yüzden test koşturan uygulayıcılar kapsam dışı.

**Ölçülmedi (yeniden ölçme sırası):** değişiklik yapan kopyanın dal ve yol olarak kalması, gerçek kurulum süresi (kurulum yapılmadı), kancaların kopyada çalışması, `baseRef` ayarı.

## 3. Ekip (agent teams) bayrağı ölçümleri

| # | Ölçülen | Sonuç | Kaynak |
|---|---|---|---|
| 1 | Etkileşimli terminal (`entrypoint=cli`, temiz ortam) | Ekip kuruldu: ayar dizininde `teams/` altında oturum klasörü ve `config.json`; `Agent` + `name` ile açılan üye `in-process teammate` olarak kayıtlı. | ekip deneyi 2, oturum 757ab120 |
| 2 | Claude Desktop Code sekmesi (bayrak ortamda AÇIK; Desktop 2.16120.0, claude-code 2.1.284) | Ekip dizini OLUŞMADI. İki denemede `Agent` + `name` ile açılan üye düz alt ajan oldu, `config.json` yok, sistem isteminde `team-lead`/`teammate` yok; hata metni yok, sessizce açılmadı. | ekip deneyi, 30 Eylül - 1 Ekim |
| 3 | Teslim (terminal liderli ekip) | Üyeler 5/5 rapor teslim etti; üyelerin kendi alt işçileri (3. katman, 25 Haiku) 25/25 "rapor teslim etmeden bitti". | deney 205 |
| 4 | VS Code eklentisi | Ölçülmedi. Belgede yalnız "`-p` ve SDK kipinde üye açılmaz" yazar. | belge |

**Dar okuma (madde 2):** üyenin rapor ettiği gözlemdir; Teammates paneli görülmedi, Recep teyit etmedi, ikinci üyenin raporu ölçüm sırasında gelmedi.

## 4. Öneri (karar OPS'ta)

1. `isolation: worktree` yedi uygulayıcı dosyasına toplu yazılmaz. Gerekirse tek iş için, master tabanlı ve test gerektirmeyen okuma/analiz görevinde, çağrıda `isolation` verilerek denenir; kopya yolu görev metnine yazılır.
2. Karar 88 çözülünce (kopyada test koşabilme) yeniden ölçülür: değişiklik yapan kopyanın kalışı, kurulum süresi ve kanca davranışı.
3. Ekip bayrağı departman pencerelerinde (Desktop) açılmaz; ekip yalnız etkileşimli terminalde liderle denenir (cetvel §10 dört koşul).
4. Adlandırılmış alt ajan Desktop'ta teammate'e dönüşmediği için `name` vermek yalnız adreslenebilirlik içindir, ekip davranışı beklenmez.

## 5. Yeniden ölçme tetikleyicisi

Claude Code sürümü 2.1.296'dan yükselirse, Desktop sürümü değişirse ya da karar 88 (worktree kurulumu) çözülürse madde 2'nin 4, 6 ve "ölçülmedi" satırları yeniden ölçülür.
