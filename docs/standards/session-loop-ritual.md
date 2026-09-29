# Oturum Açılış ve Tekrarlanan Tur Rehberi (SSOT) — v2

> **Ne yönetir:** Bilgisayar/pencereler yeniden açıldığında ne yapılır; tekrarlanan tur (loop / cron / uyandırma) gerekirse nasıl ve kimin onayıyla kurulur.
> **Niçin var:** Loop zincirleri, cron işleri ve gözcüler oturum-içi yaşar, kapanışta ölür; pano ve pull request'ler kalıcıdır. Eski sürüm (KOMUT-A/KOMUT-B) 2026-09-14'te emekli edilen gözcü + her tur `ScheduleWakeup` düzenini emrediyordu ve karar 53, 117 ile çelişiyordu; arşive taşındı.
> **Sahibi:** OPS · **Belge düzeni:** HARİTA (REC-400 D5)
> **Son doğrulama:** 2026-09-29 (fleet-mechanism-standard v2.0 §0 ve SessionStart kancasının çıktısıyla karşılaştırıldı).
> **Yöneten cetveller:** `fleet-mechanism-standard.md` §0 (yürürlükteki model), `collaboration-protocol.md` (şerit sahipliği, worktree, bir-iş-bir-dal).

## 1. Yeniden açılış (makine kapandı, pencereler yeniden açıldı)

Filo **doğrudan mesajla çalışır** (`fleet-mechanism-standard.md` §0, REC-328). Motor kurmak gerekmez; iş kaybolmaz çünkü pano, Linear, pull request ve durum dosyaları kalıcıdır.

1. **Pencereyi aç.** Oturum açılış kancası (`session-board`) açılış türünü söyler: `resume` (makine geri döndü) ya da `compact` (bağlam sıkıştı).
2. **Kendi durum dosyanı oku.** `compact` dönüşünde ilk iş durum dosyasının son bloğudur (`fleet-mechanism-standard.md` §10.4). `resume` dönüşünde durum dosyası + Linear'daki kaydın.
3. **Şeridini tazele.** Canlılık claim atışından gelir: `node scripts/board/board.cjs claim --sid <kendi sid> --lane <departman> --globs "<dosyalar>"`.
4. **Hangi işte olduğunu lidere mesajla yaz** (`SendMessage`); lider açılış emrini mesajla verir. İş bitince `notify_when_idle`.
5. **Recep'e plan sorma.** Kalıcı iş kayıttan (Linear + pano kartı) kurulur; Recep'e yalnız karar sorusu gider, OPS üzerinden.

**Açılış çıktısının tavanı (ölçüldü 2026-09-29, REC-433).** Bir SessionStart kancasının çıktısı 10.000 karakteri aşınca bağlama yalnız ilk yaklaşık 2.000 karakter girer. Bu yüzden `session-board` çıktısı en çok 9.000 karakter tutar: bölümler öncelik sırasındadır, Recep mesajları aynen ama sınırlı gelir, gerisi dosya işaretçisi olarak yazılır. Tavanı kapı (INV-SESSIONSTART-TAVAN-1) ölçer. Çıktıda "ROL KARTI:" satırının yeri ayrılmıştır; satırı `docs/roller/<DEPARTMAN>.md` kartından (en çok 300 karakter) HARİTA doldurur.

## 2. Tekrarlanan tur (loop / cron) — yalnız ihtiyaç ölçülünce, önce Recep

- **Karar 53 (2026-09-19):** cron / zamanlayıcı / loop **yasak değildir**; dönemsel bir karardı. Gerekiyorsa **önce Recep'le konuşulur**.
- **Karar 117 (2026-09-25):** tekrarlanan tur Recep'in işidir; gerekliliği **ölçümle** gösterilir. Ajan kendiliğinden tur kurmaz. Recep'in sözü: *"ihtiyaca göre önce konu bana gelir, gerekiyorsa da gerçekten ölçüm ile karar verilir."*
- `board-brief` kancası şerit talep etmemiş taze bir oturuma `LOOP:` satırıyla **kurmayı değil sormayı** hatırlatır (bekçi `INV-BOARD-5`); şerit alınınca satır susar.
- **Küçük tek amaçlı otomasyon serbesttir** ama gözcü değil **kanca** olarak (kendi süreci yok, zaten koşan kancanın içinde, tek satır, fail-open) — `fleet-mechanism-standard.md` §0.2.

### Recep onaylarsa: kurulum mekaniği

- Dinamik zincir `ScheduleWakeup` ile, sabit aralık `CronCreate` ile kurulur; her tur promptu **o işin kendisidir**, eski KOMUT metinleri kullanılmaz.
- Cron için **dakika 0/30 SEÇME** (ör. `23,53 * * * *`): herkes aynı ana yığılmasın.
- Cron **oturum ömürlüdür** (diske yazılmaz, Claude kapanınca gider) ve **7 günde** kendini siler; pencere yenilenince yeniden kurulur.
- Kurduktan sonra **iş kimliğini panoya bildir**; "kurdum" yetmez, kanıt iş kimliğidir.
- Dinamik zincir tek noktadan kopabilir (Recep araya girince tur biter, yeniden kurulmazsa oturum uyur). Kopma ölçülürse ajan Recep'e söyler ve ikinci kanal önerir.

## 3. Notlar

- Gece kesintisiz otonomi isteniyorsa bu rehber yetmez (makine kapanınca durur) → `/schedule` ile bulut rutini ayrı kurulur, Recep kararıdır.
- Bu dosya SSOT'tur: açılış düzeni değişecekse önce burada değişir.
- Kaynak kararlar: `collaboration-protocol.md` (şerit sahipliği, tek-giriş kuralı, ana-dizin parkı) · `fleet-mechanism-standard.md` §0.

---

## Değişiklik kaydı

- **v2 (2026-09-29, REC-400 D5):** gövde yürürlükteki modele (filo mesajla çalışır, karar 53/117) göre yeniden yazıldı. Emekli KOMUT-A/KOMUT-B ve gözcü/`/loop` her-tur-yeniden-kur düzeni `docs/archive/session-loop-ritual-v1-2026-09-25.md` dosyasına taşındı (geçerli değildir).
- v1 (2026-08 → 2026-09-25): KOMUT-A / KOMUT-B loop komutları.
