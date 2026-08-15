# `.githooks/` — versiyonlanan git kancaları

## Niçin bu dizin var

Git kancaları normalde `.git/hooks/` içinde durur ve **git tarafından takip edilmez**.
Sonucu 2026-08-15'te ölçüldü: o gün onarılan iki kanca (aşağıda) yalnız tek bir makinede,
tek bir çalışma kopyasında vardı. Taze bir klon, yeni bir worktree ya da ikinci bir
geliştirici bunları **hiç görmez**; onarılan bozuk davranış sessizce geri gelir.

Bu dizin kancaların **kaynağıdır**. `.git/hooks/` içine, tek işi buraya delege etmek
olan küçük **shim**'ler kurulur.

## Kurulum

```bash
pnpm install     # `prepare` -> node scripts/setup-hooks.mjs
```

Doğrulama:

```bash
head -2 "$(git rev-parse --git-common-dir)/hooks/pre-commit"   # -> venthub-githooks-shim
```

### ⛔ `git config core.hooksPath .githooks` ÇALIŞTIRMA

Bu komut daha önce bu dosyada **kurulum adımı olarak yazılıydı ve yanlıştı** — 2026-08-15'te
ölçülerek görüldü, `scripts/setup-hooks.mjs` artık bu ayarı görürse **kaldırıyor**. Sebep:

`core.hooksPath` ana depo yapılandırmasına yazılır ve o deponun **bütün worktree'leri**
tarafından paylaşılır. Ama `.githooks/` **dala bağlıdır**. Bu repoda aynı anda 4 worktree,
4 ayrı dal var:

```
worktree A (dalında .githooks VAR)  -> kancalar çalışır
worktree B (dalında .githooks YOK)  -> git var olmayan dizini SESSİZCE atlar
                                        -> B'nin BÜTÜN kancaları kapanır
```

Yani "kanca kurmak", eş-controller'ın kancalarını sessizce kapatıyordu. Dala bağlı bir
dizini depo-geneli bir ayarla göstermek yapısal olarak yanlış.

**Bunun yerine shim:** `.git/hooks/<ad>` içindeki üç satırlık betik her koşuda *o
worktree'nin kendi çalışma ağacına* bakar; `.githooks/<ad>` varsa çalıştırır, yoksa
sessizce `exit 0` yapar. Kanca dosyaları versiyonlanır (asıl amaç), davranış dal başına
doğru kalır.

## Kancalar

| Kanca | Ne yapar | Bloklar mı? |
|---|---|---|
| `pre-commit` | Companion `.md` dokümanı olmayan **yeni** kaynak dosyaları listeler | **Hayır** — uyarı, `exit 0` |
| `post-commit` | `system_tree.md` tazeler + son commit'in dosyaları için companion üretir (arka planda) | Hayır |
| `post-merge` | Pull/merge ile **gelen** kod için companion + şema/edge master'ı tazeler, `registry-sync` koşturur | Hayır |

> `post-merge` bu dizine en son geldi (2026-08-15) ve o gecikme pahalıya patladı: diğer
> ikisi versiyonlanırken o `.git/hooks/` içinde unutuldu, orada da log-yolu hatasını
> taşıyordu — yani hem bozuktu hem görünmezdi. Bir kanca "onarıldı" sayılmadan önce
> **bu dizinde** olmalı.

Dosyaların başında **niçin öyle yazıldıklarının** ölçüme dayalı gerekçesi var;
değiştirmeden önce oku. Özeti:

- **Kapı deterministik olmalı.** Eski `pre-commit` bir **LLM kalite skoruna** göre commit
  reddediyordu; aynı dosya bir koşuda 80/100, diğerinde 100/100 aldı. Rastgele patlayan
  kapı, kapısızlıktan kötüdür — `--no-verify` alışkanlığı kazandırır, o da i18n paritesi
  ve lint gibi **gerçek** kapıları birlikte atlatır.
- **Sessiz başarısızlık kancası, olmayan kancadan kötüdür.** Eski `pre-commit`'in üç
  dalından ikisi var olmayan bir `--workspace` seçeneğini çağırıyordu; her koşuda hata
  veriyor, çıkış kodu okunmadığı için sessizce geçiliyordu. Şema dokümanı bu kancayla
  hiç güncellenmemişti.
- **Ağ/LLM gerektiren iş commit'i bekletmemeli.** Üretim `post-commit`e, arka plana taşındı.
- **Worktree'de `.git` bir dosyadır, dizin değil.** Bu yüzden hiçbir kanca
  `"$REPO_ROOT/.git/…"` yazamaz; `git rev-parse --absolute-git-dir` kullanır. Yönlendirme
  başarısız olunca kabuk alt-kabuğu HİÇ çalıştırmaz, yani hata bir log satırını değil
  **işin tamamını** yutar. `post-commit` ve `post-merge` ikisi de bu yüzden onarıldı.

Öncesi yedekleri (yalnız o makinede): `.git/hooks/*.oncesi-2026-08-15`.

## Yeni kanca eklerken

1. Dosyayı **bu dizine** ekle, `chmod +x` ver (`git add --chmod=+x`).
2. Başına *niçin* var olduğunu ve ölçütünün **neden deterministik** olduğunu yaz.
3. Log yazacaksan `git rev-parse --absolute-git-dir` kullan — yukarıdaki maddeye bak.
4. Bu README'deki kanca tablosuna satırını ekle.
5. Blokluyorsa: kapıyı **bilerek bozup** kırmızı gördüğünü doğrula. Yeşil olması
   çalıştığını kanıtlamaz.

(1), (3) ve (4) elle hatırlamaya bırakılmadı — `src/__tests__/conformance/githooks-integrity.test.ts`
üçünü de zorlar.
