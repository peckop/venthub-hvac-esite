# CI Test Ölçümü — 2026-10-06

**Sürüm 1.1 · 2026-10-07 · Sahibi: ALTYAPI · Kaynak: Kanban ALT-38 (OPS emri, Recep kararları 296, 297 ve 308) · Cetvel: `docs/standards/test-karnesi-standard.md`**

> **Bu dosya niçin var.** "Hangi test ne kadar sürüyor, neyi okuyor, bir PR'da hangisi gerekli" sorusu her seferinde baştan ölçülüyordu ve ölçüm yalnız ALTYAPI çalışma
> dallarında ve CI kayıtlarında yaşıyordu. Bu belge ölçümü TEK yere koyar. Dosya başına süre ve sınıf tablosu `docs/audits/ci-test-olcum-2026-10-06.csv` dosyasındadır
> (605 satır); shard dengeleme ve test seçimi işleri o tabloyu OKUR, bu metin yalnız sonucu ve sınırlarını söyler.

## 1. Ne ölçüldü

| Ölçü | Değer |
|---|---|
| Vitest test dosyası | 605 |
| Test | 6.634 |
| Dosya sürelerinin toplamı | 873 sn (yerel tam koşu; dosyalar paralel koşar, duvar süresi değil) |
| Sınıf kaynağı | testin KAYNAĞINDAN statik çıkarım: dosyanın okuduğu yol dizgeleri (`okunan_yollar`) ve sınıfı |
| CI'da Test adımı | 6 dk 25 sn (master koşusu 2026-10-06, OPS ölçümü) |

⚠ Süreler yerel, filo yükü altında ölçüldü: **sıralama ve pay güvenilir, mutlak saniye değildir** (kanca testleri alt süreç açtığı için yükte şişer). Mutlak süre için
CI'daki Test adımı esas alınır.

## 2. Sınıflar (yol sınıfı = testin okuduğu yollar)

| Sınıf | Anlamı | Dosya | Süre payı |
|---|---|---|---|
| `belge-kanca-arac` | yalnız docs/, .claude/, .agent/, scripts/, tools/ okur | 94 | %21,6 |
| `karma` | hem kaynak kod (src/) hem belge/betik okur | 87 | %53,1 |
| `kod` | yalnız src/ okur | 100 | %3,1 |
| `yol-yok` | hiçbir yol dizgesi okumaz (içe aktarılan koda dayanır) | 324 | %22,2 |

Küme (klasör türü) gözüyle: conformance 345 dosya ve süre payı %89,4; birim 213 dosya ve %8,2. Dosya sistemi kullanan 299 dosya süre payının %90,4'ünü taşır:
**Test süresi dosya okuyan kapılardadır; saf kod testi payı %6,7'dir (yaklaşık 20 sn).** Bu yüzden `Build` atlamak (ALT-38c, cetvel §4.1) Test'i küçültmez; Test'i
küçültmek ya paralel bölmek (shard) ya da PR'da yalnız ilgili testleri koşmaktır (karar 308).

## 3. Yoğunlaşma (shard dengesi için)

| Ölçü | Değer |
|---|---|
| İlk 10 dosyanın payı | %56,0 |
| İlk 50 dosyanın payı | %85,6 |
| En uzun dosyalar | `sessionstart-tavan` 130 sn, `sessionstart-pencere-adi` 71 sn, `merge-sonrasi-ileri-sar` 67 sn, `departman-ac-kapat` 42 sn, `taban-tazele` 38 sn |

Sonuç: **shard'lar dosya SAYISINA göre değil SÜREYE göre dengelenmelidir** (`--shard=i/N` dosya sayısına böler; tek bir 130 sn'lik dosya bir shard'ın alt sınırını belirler).
Büyük dosyaların hepsi kanca/araç testidir (alt süreç açar); onların tetiği `.claude/hooks/` ve `scripts/` yollarıdır (karar 308 haritasının ilk adayları).

## 4. Sınırlar

- Sınıf statik çıkarımdır ve **kesin değildir**: dosyanın kaynakta adını andığı yol dizgelerine bakar; hesaplanan yolları (`path.join(kok, ad)`) göremez. Bu yüzden test seçimi
  (karar 308) bu tabloya tek başına dayanmaz: değişen dosya ∩ `okunan_yollar` seçer, ayrıca `vitest related` ve master push ile gece tam koşusu güvenlik ağıdır.
- `yol-yok` hiçbir şey okumadığı anlamına gelmez, "yol dizgesi bulunamadı" demektir; seçimde `related` ile birlikte kullanılır.
- Tablo bir anlık görüntüdür (2026-10-06); yeni test dosyası eklenince satırı yoktur: seçim ve shard betikleri satırı olmayan dosyayı HER ZAMAN koşar (güvenli yön).

## 5. İşler ve satırlar

| İş | Durum | Bu tabloya etkisi |
|---|---|---|
| ALT-38c-1 Build ve e2e atlama, iki önbellek (#1739) | birleşti 2026-10-07 12:59 | ölçüm: §6 |
| ALT-38c-2 shard, süreye göre dengeli (#1741) | birleşti 2026-10-07 14:02 | `sure_sn` sütunu girdi; ölçüm: §7 |
| ALT-38c-3 `isolate: false` ölçümü (birleşme YOK) | ölçüldü | §8: önerilmez |
| Karar 308 test seçimi (harita, seçici, CI bağlama) | sürüyor | `okunan_yollar` sütunu girdi; seçici ve geriye dönük doğrulama (kaçırma 0) bitmeden birleşmez |

## 6. Canlı ölçüm: değişiklik sınıfı (ALT-38c-1, #1739)

Saf belge PR'ı (bu PR'ın iki dosyası) aynı commit için iki tabana karşı koşturuldu. Süreler GitHub Actions iş API'sinden okundu (adım başına saniye); koşucu değişkenliği
yüksektir (aynı Test adımı 252-387 sn arasında çıktı), bu yüzden tek koşu "kesin" değil **büyüklük sırası**dır.

| Koşu | `ci` (zorunlu) | `admin-smoke` (zorunlu) | Test | Build | Not |
|---|---|---|---|---|---|
| ÖNCE: `master` tabanı (eski `ci.yml`), 2026-10-07 09:04Z | 11:41 | 4:31 | 387 sn | 182 sn | her şey koşar |
| #1739'un kendi koşuları (sınıflayıcı tabanda yok → `tam`) | 11:34 (soğuk), 8:32 (sıcak) | 5:02, 4:42 | 362, 270 sn | 187, 124 sn | önbellekler: sıcak koşuda Test −92 sn, Build −63 sn (tek örnek) |
| SONRA: aynı commit, taban #1739 dalı (sınıf `belge`), 2026-10-07 | 8:09 | 0:09 | 359 sn | atlandı | Build ve e2e atlandı; `admin-smoke` adı değişmedi ve yeşil; Test belge PR'ında da koşar (kabul edilmiş sapma) |

PR'ın duvar saatiyle toplam bekleme süresi (kontrol listesinde en geç biten): 11:45 → 8:13. Koşular: `ci` 37600486604, `admin-smoke` 37600486557.

## 7. Canlı ölçüm: shard (ALT-38c-2, #1741)

Aynı belge PR'ı ve #1741'in kendisi, shard'lı `ci.yml` ile koşturuldu (4 test işi, süreye göre dengeli; `ci` işi aynı koşunun tüm shard'larını bekler; eksik, iptal ya da zaman aşımı kırmızıdır):

| Koşu | PR toplam bekleme | `ci` | Shard işleri | `admin-smoke` | Önceki |
|---|---|---|---|---|---|
| Belge PR'ı (#1740, taban shard dalı), koşu 37609561091 | 3:17 | 196 sn (checkout 17, install 35, lint 46, shard bekleme 64) | 129 / 139 / 160 / 184 sn | 11 sn | 11:45 |
| Kod PR'ı (#1741, 3. koşu), koşu 37608967577 | 4:56 | 254 sn | 116 - 195 sn | 295 sn (en uzun) | 8:32 - 11:34 |

Kuyruk beklemesi (işin oluşması ile başlaması arası) 3 - 6 sn çıktı. En yoğun an 14:05: dört koşu üst üsteydi (master push, #1740'ın `edited` koşusu, iki dependabot koşusu); 20 eşzamanlı iş sınırına bu yükte ulaşılmadı.

Shard KULLANMAYAN yollar (tasarım gereği, `if: pull_request && action != edited`): PR `edited` koşusu ve master push, testi `ci` işinde tek parça koşturur; ölçülen süreleri 485 - 594 sn'dir (koşular 37611432500, 37611431117, 37610218248).
Master push'unu kimse beklemez. `edited` koşusu yalnız aynanın atlayamadığı durumda uzar: mekanizma yolları (`scripts/ci/`, `.github/workflows/`, `vitest.config.ts`, `package.json`) değişen PR'lar ve tabanı değişen PR'lar. Bu yüzden böyle bir PR'ın gövdesi ilk tam koşudan sonra TEK seferde düzenlenir.

## 8. `isolate: false` ölçümü (ALT-38c-3, birleşme YOK)

Ayrı deneme dalında, elle tetiklenen iki koşu (dalın birleşme isteği yoktur):

| Koşu | Test adımı | Sonuç |
|---|---|---|
| master (yalıtım açık, bugünkü ayar), koşu 37607367998 | 229 sn | yeşil |
| deneme dalı, `isolate: false`, koşu 37607362408 | 213 sn (−16 sn, −%7) | kırmızı: 23 test dosyası düştü (`Test Files: 23 failed, 598 passed, 2 skipped`) |

Sonuç: kazanç küçük, kırılan test çok; **önerilmez**. Test süresini asıl küçülten iş, shard (§7) ve PR'a göre ilgili testlerin seçilmesidir (karar 308).

## 9. Gereksiz olabilecek testler: ADAYLAR (silme YOK)

OPS emri (2026-10-07): dünkü gereksiz test adayları gerekçeli listelenir, **hiçbiri silinmez**. Kaynak: ALT-38b karne denemesi (620 test dosyası, CI geçmişi 2026-07-06..2026-10-07, sabotaj ölçümü). Bu tablo hüküm değil adaydır; silme listesi karneyle Recep onayına gelir.

| Test | Neden aday | Ölçülen kanıt | Süre (yerel, şişkin) | Kaldırılırsa ne düşer |
|---|---|---|---|---|
| `bash-write-audit-uretilmis-sinifi` (6 test) | Ana sabotajı üç başka test de yakalıyor; pencerede hiç kırmızı vermedi | Tek sabotaj denendi (manifest okunamazsa dosyanın "üretilmiş" sayılması): bu test ile `bash-write-audit-claude-deposu`, `-merge-muafiyeti` ve `-tree` kırmızı verdi | 8,4 sn | Ana sabotaj yine yakalanır. Testin öbür maddeleri (üretilmiş artefaktın ihlal sayılmaması, gerçek ihlalin yine ötmesi) için ayrı sabotaj ölçülmedi: silmeden önce o maddeler başka bir teste taşınmalı |
| `e1-kimlik-kontrolu` (10 test) | `lane-precommit-merge` aynı sabotajda da kırmızı; pencerede hiç kırmızı vermedi | Tek sabotaj (tanınmayan kimlikte fail-open) iki testte kırmızı; karne notu: kapı davranışında örtüşme var | 7,5 sn | Kimlik öncelik kuralları (asıl kimlik dosyadaki vekil kimliğe üstündür; tanınmayan kimlik çakışan claim'de bloklar) yalnız bu testte duruyor: birleştirme düşünülür |
| `storage-yazma-nobetcisi` (10 test) | `anon-yazma-nobetcisi` aynı ana sabotajda (nöbetçi adımına `continue-on-error`) birlikte kırmızı; pencerede hiç kırmızı vermedi | Ek sabotaj (fail-closed davranışı) yalnız bu testte denendi ve kırmızı. `anon-yazma-nobetcisi`nin `\|\| true` sabotajına kör olduğu ölçüldü; bu testte aynı sabotaj denenmedi | 0,19 sn | Silinirse `\|\| true` koluna karşı ÖLÇÜLMÜŞ koruma kalmaz: silme önerilmez, birleştirme ya da o sabotajın bu teste de uygulanması önerilir |
| `instruction-surface-ppr` (3 test) | İki sabotajın ikisi de yeşil kaldı (karne "sahte yeşil adayı" dedi) | Sabotajlar commit'siz (çalışma ağacı ve indeks) uygulandı; test ise `git grep … HEAD` ile commit'lenmiş içeriği okur: ölçüm yönteminin sınırı olabilir. Pencerede 1 kez (2026-09-08, dalda) kırmızı verip düzeltildi | 0,4 sn | ADAY SAYILMAZ, yeniden ölçüm adayıdır: sabotaj commit'lenerek tekrarlanana kadar hüküm yok. CI commit'lenmiş içeriği koşar |

Dört testin toplam süresi yaklaşık 16,5 sn: dosya sürelerinin toplamının (873 sn) yaklaşık %1,9'u. **Silmek CI beklemesini anlamlı kısaltmaz**; bu liste sadeleştirme içindir, hız için değil. Hiçbiri silinmedi; silme listesi karneyle (ALT-38b) Recep onayına gelir.
