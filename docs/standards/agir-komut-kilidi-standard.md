# Ağır Komut Kilidi Standardı (ARC-81)

> **Kapsam:** aynı anda birden çok pencerenin ağır komut (type-check, build, tam test, install)
> koşmasını sınırlayan kanca ve istem satırı. Tek pencerenin kendi bellek kuralı
> (`.claude/rules/filo-ortak.md` "Test ve bellek") bu cetvelin DIŞINDA; bu cetvel o kuralı
> **makine düzeyinde** zorlar. §6, aynı bellek ailesinden konuşma dosyası boyutu satırını (KAYIT,
> ARC-82) tanımlar.
> **Sürüm:** v1.2 · 2026-10-11 (v1.1 · 2026-10-11, v1.0 · 2026-10-10)
> **Sahibi:** ARAÇ
> **Son doğrulama:** 2026-10-11 (kanca, test ve bozma ölçüldü; canlı kabul ölçüldü, §5; arka plan
> sarmalayıcı testi ve bozması ölçüldü, canlı kabulü bekliyor, §7)
> **Niçin bu cetvel doğdu:** kart ARC-81 "ağır komut kilidi için cetvel yok: yazımı bu işin
> kapsamında" dedi (kural 1). Kanca: `.claude/hooks/agir-komut-kilidi.cjs`; test:
> `src/__tests__/conformance/kanca-agir-komut-kilidi.test.ts`.

---

## §1 Niçin var — ölçülmüş kayıp

2026-10-09 19:57'de uygulama bellek bittiği için kapandı: 32,6 GB'ın 123 MB'ı boştu, dokuz pencere
14,9 GB tutuyordu, 399 süreç vardı, 19:58-20:02 arasında beş yeniden başlama oldu. Her pencere
kendi kuralına uyuyordu; makineyi bağlayan bir şey yoktu. Pencereler birbirinin ne koştuğunu bilmiyordu.

## §2 Kurallar

1. **Ağır sayılan komutlar:** type-check / `tsc`, `build` / `next build`, tam test (dosya argümansız
   `vitest` ya da `pnpm test`), tam `pnpm lint`, `knip`, `install` / `add` / `ci`, `docker`.
   `pnpm test:ilgili` ve dosya argümanlı `vitest` / `eslint` HAFİFTİR, kilitlenmez.
2. **Yuva:** ağır komut için `<pano>/agir-kilit/yuva-<i>` dizini atomik `mkdir` ile alınır.
   Varsayılan yuva sayısı **1**. Yuva doluysa komut REDDEDİLİR; cevap sahibi (pencere, komut, kaç dk
   önce) söyler ve "döngü kurma, bir kez daha dene" der.
3. **Bırakma:** PostToolUse(Bash) ve **PostToolUseFailure(Bash)** `--birak` yuvayı verir; başarısız
   komut (tsc çıkış 2, kırmızı test) PostToolUse üretmez, olay PostToolUseFailure'dır. Yalnız
   **AĞIR komutun** olayı bırakır: aynı pencerenin sonraki hafif Bash çağrısı (`git status`) yuvayı
   düşürmez. Arka plan komutu (`run_in_background`) yuvayı BIRAKMAZ (komut hâlâ koşuyordur) ve
   yuvaya `arkaPlan` işareti konur; o yuvaya girilen ön plan ağır komutun olayı da onu düşürmez.
   Arka plan yuvasını komutun kendi **sarmalayıcısı** komut gerçekten bitince bırakır (§7, ARC-87);
   TTL güvenlik ağıdır.
4. **Bayat yuva:** 20 dakikadan eski yuva ölü sayılır ve bir sonraki deneyen onu siler (pencere
   kapanır, iptal edilir, PostToolUse gelmez).
5. **Açık kalır:** kilit dizini yazılamıyor, girdi bozuk ya da beklenmeyen hata varsa komut GEÇER.
   Kilit emniyet kemeridir; bozulunca işi durdurmamalı.
6. **İstem satırı:** yuva doluyken `⚠KILIT: agir komut 1/1 dolu (<pencere> <komut> <dk> dk)`;
   kendi pencerende tutan sensin ise "sende". Boşken susar (eşikli satır, `bellek-yoklama` gibi).
7. **Pencere başına süreç sayımı** `bellek-yoklama.cjs` önbelleğindedir (`pencereler`,
   `pencereToplam`); `⚠BELLEK` satırı pencere başına 80 ya da pencereler toplamı 400 süreci
   aşınca "KALABALIK" der.

## §3 Eşikler ve nasıl ölçüldü

| Eşik | Değer | Dayanak | Ayar |
|---|---|---|---|
| Yuva sayısı (N) | 1 | boş bellek 2 GB civarı; tek type-check ~730 MB, tam test ve build bunun katı | `VENTHUB_AGIR_KILIT_N` |
| Bayat yuva (TTL) | 20 dk | tam test 10+ dk sürebilir; PostToolUse gelmezse en çok 20 dk bekletir | `VENTHUB_AGIR_KILIT_TTL_DK` |
| Pencere başı süreç | 80 | 2026-10-10 ölçümü: 7 pencere, 32-56 alt süreç (en çok 56); eşik gözlenen dağılımın üstünde | `VENTHUB_BELLEK_PENCERE_SUREC` |
| Pencereler toplamı | 400 | aynı ölçüm: toplam ~260-310; 10-09 olayında toplam süreç 399 idi | `VENTHUB_BELLEK_PENCERE_TOPLAM` |

**Sınır:** süreç eşikleri tek günün ölçümüdür; kullanımla yeniden ayarlanır (karne tarihi 2026-10-10).
Aynı ölçümde 124 `conhost.exe` ve 46 `python.exe` görüldü; hangi kancanın/sunucunun bıraktığı bu
cetvelin kapsamı dışında, ayrı ölçüm işidir.

## §4 Ayar kaydı (OPS kapısı)

`.claude/settings.json` değişikliği OPS'tadır; metin ARAÇ'tan gelir, OPS uygular.

PreToolUse → `matcher: "Bash"` grubuna eklenecek kanca:

```json
{
  "type": "command",
  "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/agir-komut-kilidi.cjs\"",
  "statusMessage": "agir-komut-kilidi"
}
```

PostToolUse → yeni grup:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/agir-komut-kilidi.cjs\" --birak"
    }
  ]
}
```

PostToolUseFailure → yeni grup (başarısız komut PostToolUse üretmez; bu kayıt olmazsa yuva 20 dk dolu kalır
ve bütün filo bekler). Aynı komut, aynı `--birak`:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/agir-komut-kilidi.cjs\" --birak"
    }
  ]
}
```

**Geri alma:** üç kaydı (PreToolUse, PostToolUse, PostToolUseFailure) sil. Yuva dizinini silmek
gerekmez (20 dk içinde bayatlar). Kancayı geçici kapatmak için `VENTHUB_AGIR_KILIT_N=99` yeter.

**Onay:** filoda komutu REDDEDEN yeni bir davranıştır; ayar kaydı Recep'in sözüyle OPS tarafından
uygulanır (karar 224: onay pencereler arası taşınmaz).

## §5 Kabul

- Test: `INV-AGIR-KILIT-1..3` (sınıflama tablosu, yuva dışlama/bırakma/bayat, kanca protokolü,
  istem satırı, pencere sayımı, hafif komutun ve başarısız komutun bırakma davranışı). Bozma:
  2026-10-10'da 22 mutasyonun 22'si yakalandı (OPS düzeltmeleri: hafif komut bırakmaz,
  PostToolUseFailure, arkaPlan işareti dahil).
- Canlı kabul (ayar kaydından sonra): iki pencerede aynı anda `pnpm type-check` denenince ikincisi
  `AGIR KOMUT KILIDI` ile reddedilir ve istem satırında `⚠KILIT` görünür. Bu ölçüm kayıttan sonra
  karta yazılır; ölçülmeden "çalışıyor" denmez.
- **Canlı kabul ölçüldü (2026-10-11, #1842'den sonra).** Komut `tsc --version`
  (sınıflayıcıda "type-check" sayılır, proje derlemesi koşturmaz: tam type-check bellek kuralı gereği
  koşturulmadı):
  1. **İkinci pencere reddi:** URUN penceresi (`4a8eaf9c`) yuvayı arka plandaki `pnpm install --offline`
     ile tutarken ARAÇ penceresindeki `tsc --version`, `AGIR KOMUT KILIDI (ARC-81)` mesajıyla
     reddedildi; mesaj sahibi ve süreyi söyledi ("4a8eaf9c install 2 dk önce başladı").
  2. **İstem satırı:** istem satırı kancası UserPromptSubmit girdisiyle koşturulunca
     `⚠KILIT: agir komut 1/1 dolu (4a8eaf9c install 2 dk) — ikinci agir komut reddedilir` verdi.
  3. **Bırakma:** ön plan `tsc --version` bitince yuva boşaldı (bir sonraki pencere hemen aldı).
  4. **Başarısız komut:** `tsc --nonexistent-flag-xyz` (çıkış 1) sonrası yuva BOŞ; PostToolUseFailure
     kaydı çalışıyor.
- **Gözlem (kancanın çözüldüğü yer):** kanca, çalışma ağacının `settings.json`'unda kayıt olmasa ve
  betik dosyası ağaçta bulunmasa bile koştu (ARAÇ penceresinin ağacı #1842'den 234 commit gerideydi;
  `agir-komut-kilidi.cjs` o ağaçta yok, yuva yine de pencerenin kimliğiyle alındı). Çıkarım (ölçülmedi):
  worktree pencerelerinde kanca kaydı ve betiği ana ağaçtan (proje kökü) çözülüyor; "ağaç geride
  olduğu için kanca kayıtlı değildir" varsayımı bu pencerede doğrulanmadı.
- **Gözlem (tasarımın bedeli, §2 madde 3):** arka plan komutunun yuvası TTL'e kalır. URUN'un birkaç
  dakikalık `install`'ı ve ardından aynı pencerenin `docker` komutu (yeniden giriş yuvayı yeniler)
  yuvayı 11:21-11:53 arası, yaklaşık 32 dk dolu tuttu. Bir arka plan ağır komut, filonun geri kalanını
  en çok TTL kadar bekletir. OPS kararı (2026-10-11): komut sonuna bırakma eki; §7'de uygulandı
  (ARC-87).

## §6 KAYIT satırı: konuşma dosyasının boyutu (ARC-82)

**Niçin:** konuşma dosyası (`<sid>.jsonl`) compact'a rağmen küçülmez, yalnız büyür. 2026-10-10
ölçümü: en büyük kayıtlar 2129 MB (OPS), 2043 MB, 773 MB, 760 MB, 453 MB. Dosyayı okuyan kancalar ve
pencere büyüdükçe yavaşlıyor. 10-09 20:00 kapanması bellekten (OPS, main.log); dosya boyutu İKİNCİL
etken sayılır, kanıtlanmış sebep değildir.

**Kural:** pencerenin kendi konuşma dosyasının boyutu her istemde görünür. Boyut yalnız `statSync` ile
okunur (dosya AÇILMAZ, içerik okunmaz); yol yoksa ya da dosya değilse satır SUSAR.

| Boyut | Satır | Dayanak | Ayar |
|---|---|---|---|
| 1 GB altı | `KAYIT: 612 MB` (eşiksiz, BAGLAM gibi) | Recep bağlamın yanında kayıt boyutunu da görür | yok |
| 1 GB ve üstü | `⚠KAYIT: 1,0 GB — … 1,5 GB'ta yeni oturuma devret` | 10-10: 2 dosya 2 GB üstünde, 3 dosya 750 MB üstünde | `VENTHUB_KAYIT_UYARI_MB` (1024) |
| 1,5 GB ve üstü | `⛔KAYIT: 1,5 GB — yeni oturuma DEVRET` | OPS emri 10-09 madde 3: "1,5 GB yeni oturuma devret" | `VENTHUB_KAYIT_DEVRET_MB` (1536) |

**Biçim kuralları:** GB değeri AŞAĞI yuvarlanır (1535 MB "1,5 GB" görünmez; aksi halde satır "1,5 GB'ta
devret" diyen metinle çelişir). Bozuk (sayı değil, ≤0, boş dize) ya da sırası ters (devret ≤ uyarı)
ortam değeri İKİ eşiği de varsayılana döndürür.

**Kod ve test:** `.claude/hooks/baglam-doluluk.cjs` (`kayitBoyutuMb`, `kayitSatiri`),
`.claude/hooks/defter-tazelik-satiri.cjs` (çağrı); test `INV-KAYIT-BOYUTU-1..3`
(`src/__tests__/conformance/kanca-kayit-boyutu.test.ts`). Bozma: 2026-10-11'de 17 mutasyonun 17'si
yakalandı (ilk koşuda 16; kaçan "≤0 eşik kabul" için tek başına sıfır eşik ve tanımsız-değişken kolu
eklendi).

**Sınır:** her istemde boyutu gösterir ama kilit gibi komut REDDETMEZ; devret kararı insandadır.
Kancaların dosyayı bütün okuması ayrı iştir (ARC-83, #1838: tur sonu kapıları kuyruk okur).

## §7 Arka plan sarmalayıcı: yuva komut bitince bırakılır (ARC-87)

**Niçin:** §5 gözlemi: arka plan ağır komutun yuvası yalnız TTL ile (20 dk) düşüyordu; URUN'un kısa
`install`'ı ve ardından `docker` komutu yuvayı 11:21-11:53 arası, yaklaşık 32 dk dolu tuttu ve filo
bekledi. OPS kararı (2026-10-11): PreToolUse arka plan ağır komutu sarar, komut gerçekten bitince
yuva bırakılır.

**Mekanizma:** arka plan ağır komut yuvayı alınca kanca komutu `updatedInput` ile şu biçimde döndürür
(girdi nesnesinin diğer alanları korunur; `permissionDecision` DÖNMEZ, izin akışı değişmez):

```bash
(
<özgün komut>
)
__agir_rc=$?
node "<kanca betiği>" --birak --yuva <i> --belirtec <t> --dizin "<kilit dizini>" >/dev/null 2>&1
exit $__agir_rc
```

**Kurallar:**

1. **Çıkış kodu aynen korunur** (komut 0, 1 ya da başka kodla bitse de yuva bırakılır ve kod döner).
2. **Yalnız arka planda koşan ağır komut sarılır.** Ön plan akışı, hafif komut ve Bash dışı araç değişmez.
3. **Belirteç şart:** `--belirtec` yuvadaki sahip kaydında yoksa bırakma HİÇBİR ŞEY düşürmez. TTL ile
   yuvayı başka pencere aldıysa geç gelen bırakma onu silmemelidir.
4. **Aynı pencerenin birden çok arka plan komutu:** her komutun kendi belirteci vardır; yuva son
   belirteç düşünce verilir. Ön plan ağır komutun PostToolUse'u arka plan yuvasını yine düşürmez.
5. **Bırakma kolu stdin OKUMAZ:** arka plan kabuğunda stdin açık kalabilir; okuma takılırdı.
6. **TTL (20 dk) güvenlik ağı olarak kalır:** pencere kapanır, süreç öldürülür ya da sarmalayıcı hiç
   çalışmazsa yuva yine bayatlar.
7. **Kapatma:** `VENTHUB_AGIR_KILIT_SARMA=0` sarmayı kapatır (davranış v1.1'e döner, kayıt değişmez).

**Ayar kaydı değişmez:** §4'teki üç kayıt aynıdır; sarmalayıcı kancanın ÇIKTISIDIR, yeni kayıt gerekmez.

**Kod ve test:** `.claude/hooks/agir-komut-kilidi.cjs` (`kilitAl` belirteç üretir, `belirtecBirak`,
`sarmala`); test `INV-AGIR-KILIT-4` (`src/__tests__/conformance/kanca-agir-komut-kilidi.test.ts`):
sarma biçimi ve alanların korunması, çıkış 0 ve çıkış 1 ile biten komut, yorum satırıyla biten komut,
belirteç uyuşmazlığı, iki arka plan komutu, N=2, kancanın ürettiği komutun uçtan uca koşması, bırakma
kolunun stdin okumaması. **Bozma:** bırakma eki kaldırılınca yuva dolu kalır (testte) ve 13 mutasyon
(çıkış kodunu bozma, belirteç denetimini kaldırma, ön planı da sarma, karar ekleme, kapanış parantezi,
belirteç listesini kaybetme, son belirteçten önce silme, stdin okuma, kapatma anahtarını yok sayma,
yanlış yuva/dizin, alanları düşürme) test dosyasınca yakalanır (sonuç kart notunda).

**Bilinen sınırlar (ölçülmedi ya da kapsam dışı):**

- **`updatedInput`'un `permissionDecision` olmadan uygulanıp uygulanmadığı resmî belgede yazmıyor**
  (belge yalnız `allow` ve `ask` ile birlikte örnekliyor) ve bu pencerede ölçülemedi (yalıtılmış deneme
  için gereken ikinci `claude` oturumu oturum açmıyor). Uygulanmıyorsa sarmalayıcı etkisiz kalır ve
  TTL işler (çökme yok). `allow` döndürmek istemin atlanması demektir; bu karar OPS'tadır ve canlı
  kabul ölçümüne bağlıdır (aşağıda).
- Komutun kendisi `&` ile iç arka plan işi başlatırsa sarmalayıcı hemen biter ve yuva erken bırakılır.
- Aynı pencerenin ön plan ağır komutu koşarken arka plan komutu biterse yuva ön plan komutuna rağmen
  düşer (belirteç listesi boşalınca yuva silinir); kısa süreli çift yük riski, kabul edildi.
- Uygulamanın uzun ön plan komutu kendiliğinden arka plana atması "ön plan" sayılır (PreToolUse'ta
  `run_in_background` yok); sarılmaz ve PostToolUse'ta bırakılır (v1.1 davranışı).

**Canlı kabul (ayar kaydı gerekmez, yeni pencerede):** (1) pencerede arka planda hafif bir ağır komut
başlat (örn. `run_in_background` ile `tsc --version`); (2) komut bitince `<pano>/agir-kilit/yuva-0`
dizininin yok olduğunu oku (TTL beklenmeden); (3) o sırada ikinci pencerenin ağır komutunun
reddedilmediğini ölç; (4) hata veren arka plan komutunda da (`tsc --nonexistent-flag-xyz`) yuvanın
bırakıldığını ölç. Yuva komut bitince boşalmıyorsa `updatedInput` kararsız uygulanmıyor demektir:
OPS'a yaz, §7 sınırı. Ölçülmeden "çalışıyor" denmez.
