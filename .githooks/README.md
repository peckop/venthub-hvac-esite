# `.githooks/` — versiyonlanan git kancaları

## Niçin bu dizin var

Git kancaları normalde `.git/hooks/` içinde durur ve **git tarafından takip edilmez**.
Sonucu 2026-08-15'te ölçüldü: o gün onarılan iki kanca (aşağıda) yalnız tek bir makinede,
tek bir çalışma kopyasında vardı. Taze bir klon, yeni bir worktree ya da ikinci bir
geliştirici bunları **hiç görmez**; onarılan bozuk davranış sessizce geri gelir.

Bu dizin kancaların **kaynağıdır**; `core.hooksPath` ayarı git'i buraya bakmaya zorlar.

## Kurulum (tek seferlik, klon başına)

```bash
git config core.hooksPath .githooks
```

Doğrulama:

```bash
git config core.hooksPath      # -> .githooks
```

> **Worktree notu:** `core.hooksPath` ana depo yapılandırmasına yazılır ve tüm
> worktree'ler tarafından paylaşılır — worktree başına ayrıca kurmaya gerek yok.
> (Zaten worktree'lerin `.git/hooks`'u da paylaşması bu projede ayrı bir sorun
> kaynağıydı; bkz. `post-commit` içindeki log-yolu düzeltmesi.)

## Kancalar

| Kanca | Ne yapar | Bloklar mı? |
|---|---|---|
| `pre-commit` | Companion `.md` dokümanı olmayan **yeni** kaynak dosyaları listeler | **Hayır** — uyarı, `exit 0` |
| `post-commit` | `system_tree.md` tazeler + son commit'in dosyaları için companion üretir (arka planda) | Hayır |

Her iki dosyanın başında **niçin öyle yazıldıklarının** ölçüme dayalı gerekçesi var;
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

Öncesi yedekleri (yalnız o makinede): `.git/hooks/*.oncesi-2026-08-15`.

## Yeni kanca eklerken

1. Dosyayı **bu dizine** ekle, `chmod +x` ver.
2. Başına *niçin* var olduğunu ve ölçütünün **neden deterministik** olduğunu yaz.
3. Blokluyorsa: kapıyı **bilerek bozup** kırmızı gördüğünü doğrula. Yeşil olması
   çalıştığını kanıtlamaz.
