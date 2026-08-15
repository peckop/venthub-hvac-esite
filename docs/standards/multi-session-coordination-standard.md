# Çok-Oturumlu Koordinasyon Standardı (Cetvel) — v1.0

> **Bu dosya nedir?** Birden çok Claude Code controller oturumu aynı repoda paralel
> çalışırken **kimin ne yaptığını bilen, akışı bozmayan** bağlantı modelinin cetveli.
>
> **Neden var?** 2026-08-14'te aynı gün üç ayrı durum kaydı bayatladı: şerit panosu
> (1 gün), Orion registry (18 iş emri / **0 tamamlanan**, oysa 7 PR + 4 prod migration
> sevk edilmişti), ~270 companion `.md`. Ortak kök: **hatırlamaya bağlı adım.** Ayrıca
> eş-controller'ın ne yaptığını öğrenmenin tek yolu `git status` çekmekti ve aramızdaki
> mesajları Recep taşıyordu — insan mesaj-otobüsü, akışın kırıldığı yer.

---

## 1. İki ayrı ihtiyaç, iki ayrı depo (karıştırma)

| İhtiyaç | Depo | Ömür | Neden ayrı |
|---|---|---|---|
| **Anlık koordinasyon** — "şu an kim neye dokunuyor?" | `C:/tmp/venthub-board/events.<sid>.jsonl` | TTL'li (4sa), süpürülebilir | Anlık olmalı; git'e yazılan kayıt commit/push/pull'a bağlıdır = **merge zamanlı**, aynı saatteki çakışmayı yapısal olarak göremez |
| **Kalıcı iş durumu** — "T001-VH nerede?" | Orion registry (`~/.orion/registry.db`) | Kalıcı | Yeni bir oturum açıldığında ne yapacağını buradan öğrenir; pano TTL'li olduğu için bu soruyu cevaplayamaz |

**Karıştırmanın bedeli:** panoyu kalıcı durum deposu yaparsan şişer ve bayatlar; kalıcı
durumu anlık kanal yaparsan geç kalır. `docs/DURUM-TAKIP.md` üçüncü bir şeydir: **anlatı/tarih**
(bkz. `work-tracking-ssot-standard.md`).

## 2. Katmanlar

**K0 · Git — sert güvenlik (dokunulmaz).** Dal-başına-iş + PR. Üstteki her şey *tavsiye*
niteliğindedir; master'ın sessizce bozulmasını engelleyen tek şey git'tir.

**K1 · Kira (lease), kilit DEĞİL.** Oturum bir şeridi talep eder; talep **kalp atışıyla**
tazelenir ve TTL dolunca kendiliğinden düşer. Kilit olsaydı ölü bir oturum (compact, çökme,
pencere kapatma) şeridi sonsuza dek bloke ederdi. Ajan oturumları ölür — model bunu varsayar.

**K2 · Yol rezervasyonu.** Çakışma iş emrinde değil **dosyada** olur. Talep bir glob kümesi
taşır. Aynı yolu iki oturum talep ederse **en erken timestamp kazanır**: kıdemli oturum
yazmaya devam eder, **geç gelen** bloklanır. Bu simetrik değildir ve olmamalıdır — "her
çakışanı blokla" demek iki oturumu birden durdurmak, yani katmanın kendisini kesinti
kaynağına çevirmektir.

**Şeritler DAR talep edilir.** `src/**` gibi kök-geniş glob, aynı ağacın ilgisiz bir
köşesinde çalışan oturumu da bloklar (yanlış-pozitif). Doğrusu dokunduğun alt ağaçlar:
`src/lib/services/pricing*` · `src/views/admin/*Pricing*`. Kök-geniş glob yalnız gerçekten
tüm ağacı yeniden yazan bir göç için meşrudur ve o zaman da geçicidir.

**Genişletme birleştirir, daraltma `release` ister.** İkinci bir `claim` globları **birleştirir**
ve ilk talebin kıdemini korur; eskisini sessizce bırakmaz. Şeridi daraltmak/devretmek için
önce `release`.

**Worktree'ler ayrı değildir.** Yol repo köküne göre çözülür (`git rev-parse --show-toplevel`,
`cwd` değil — bu oturumlarda birden çok çalışma dizini var ve `EnterWorktree` cwd'yi
değiştirir). Bu bilinçlidir: aynı **dosyayı** iki dalda düzenlemek gelecekteki merge
çakışmasıdır, katmanın görevi tam olarak onu erken göstermektir.

**K3 · Olay günlüğü (append-only).** Kimse kimsenin satırını düzenlemez → çakışması tanım
gereği imkânsız. Her oturum **yalnız kendi dosyasına** yazar (`events.<sid>.jsonl`), okuma
hepsinin birleşimidir; böylece eşzamanlı append'in satır karıştırma riski de yoktur.

## 3. Yazma anı zorunlu ritüele bağlanır (hatırlama yok)

| An | Ne olur | Neden hatırlanmaya gerek yok |
|---|---|---|
| Oturum açılışı | `SessionStart` kancası kimliği + şeridi + pano özetini **bağlama enjekte eder** | Ajan zaten "neredeyiz" diye bakmak zorunda; kimliğini tahmin etmez, **okur** |
| Her kullanıcı turu | `UserPromptSubmit` kancası **sessiz** brifing basar (yalnız söyleyecek şey varsa) **ve kirayı yeniler** | Bağlamı kirletmeden farkındalık; Recep mesaj taşımaz. Kalp atışını elle beklemek, bu cetvelin teşhis ettiği "hatırlamaya bağlı adım"ı katmanın merkezine geri koyardı |
| **Her yazmada** | `PreToolUse` kancası **kirayı yeniler** | Atış yalnız kullanıcı turuna bağlıyken, uzun **otonom** çalışmada hiç atış olmaz ve oturum KENDİ şeridini kaybeder. Ölçüldü: 5 saatlik bir koşuda üç oturumun **üçü de** düştü. Yazıyorsan yaşıyorsundur |
| Oturum kapanışı | `SessionEnd` kancası şeridi **bırakır** | TTL (4sa) yalnız çökme/kapatma için emniyet ağıdır; düzgün kapanışta sıradaki oturum beklemez |
| Yazmadan önce | `PreToolUse` kancası başka oturumun şeridine yazmayı **reddeder** | Talimat değil **yapı** — protokolü unutmak mümkün değil |
| PR merge | `post-merge` kancası commit künyelerinden registry'yi günceller | Kanca zaten doc üretimi için koşuyor |

**Künye sözleşmesi** — commit gövdesine tek satır:

```
Work-Order: T001-VH progress=70
Work-Order: T011-VH status=completed
```

`status` ∈ `backlog · open · active · blocked · completed`. Değerler mutlaktır (artırılmaz),
senkron **idempotent**tir: aynı commit iki kez işlense sonuç aynıdır.

## 4. Bilinçli tasarım kararları

**Fail-OPEN (bilinçli sapma).** VentHub kuralı "yeni kapıya geçiş modu koyma" der; o kural
**güvenlik** kapıları içindir. Bu bir **koordinasyon** kapısı: pano okunamazsa fail-closed
olmak üç oturumu birden durdurur — kendi kendine kesinti. Pano bozulduğunda yazma serbest
kalır, son emniyet git'tir. **Sessiz değildir:** okunamayan dizin, açılamayan dosya ve
**bozuk satır** ayrı ayrı `stderr`'e düşer — tek bozuk satır bir şeridin korumasını
düşürebilir, sessizce yutulmaz.

**Kilit değil kalite ağı.** Ajan `Bash` ile kapıyı aşabilir, kullanıcı dosyayı elle
düzenleyebilir. Amaç kazara çakışmayı **yazım anında** yüzeye çıkarmak.

**Oturum kimliği uydurulmaz.** Claude Code kalıcı bir UUID verir ve kancaya `stdin` ile
geçirir. Compact'ten sağ çıkar (bağlam sıfırlansa da `SessionStart` yeniden koşar).

**Alt-ajanlar ebeveynin kimliğiyle koşar (ÖLÇÜLDÜ).** `PreToolUse` girdisinde alt-ajanın
`session_id`'si ebeveynininkiyle **aynıdır**; ayrıca `agent_id` + `agent_type` gelir. Yani
alt-ajan, kendisini başlatan oturumun şerit haklarını olduğu gibi devralır. Bundan çıkan iki
sonuç: (1) "alt-ajanlar bloklanıyor" gözlemi **kimlik sorunu değildir** — gerçekten yabancı bir
şerit vardır (ya da kira TTL'den düşmüştür); (2) bir alt-ajan yabancı şeride yazmak zorunda
kalırsa doğru çıkış **yazmak değil raporlamaktır**: içeriği raporunda döndürür, ebeveyn kendi
kapısından geçirip yazar. `Bash` ile kapıyı aşmak yasak ([[worker-direct-push-incident]] deseni).

**Şerit ADI etikettir, talep OTURUM başınadır.** Aynı adı iki oturum kullanabilir (ör. oturum
yeniden başlatıldığında eskisi TTL dolana dek görünür). Pano bunu birleştirmez, **çakışma olarak
işaretler** — çünkü aynı adı taşıyan iki canlı talep birbirini bloklayabilir.

## 5. Kullanım

```bash
node scripts/board/board.cjs claim --sid <oturum> --lane PRICING --globs "src/**,docs/standards/pricing-*.md"
node scripts/board/board.cjs who --sid <oturum>
node scripts/board/board.cjs note --sid <oturum> --to EDGE "views/ bana lazım, INV-9 alma"
node scripts/board/board.cjs release --sid <oturum>
node scripts/board/registry-sync.cjs --dry            # künyeleri raporla, yazma
```

## 6. Bilinen sınırlar (dürüstçe)

- **Tek makine varsayar.** Bir oturum bulutta koşarsa taşıma katmanı değişmeli (o durumda
  registry sqlite doğru yer olur).
- **Anlamsal çakışmayı görmez.** İki şerit farklı dosyalarda aynı kavramı bozarsa pano susar;
  onu conformance testleri yakalar (INV-*).
- **Kiralamaya ZORLAYAMAZ.** Kiralamadan çalışan oturum görünmez kalır — ama `SessionStart`
  ona şeridinin talep edilmediğini söyler. Kaçış yolu var, sessiz değil.
- **Git son hakem.** Pano çakışmayı önler, doğruluğu garanti etmez.
- **`post-merge` kancası repoda DEĞİL** (`.git/hooks/` versiyonlanmaz). Aynı makinedeki
  worktree'ler `.git/hooks`'u paylaştığı için üç oturum da kapsanır; ama **yeni bir klonda
  ya da ikinci bir makinede registry senkronu hiç çalışmaz** — kancayı elle bağlamak gerekir.
- **Glob granülerliği anlamsal değil.** Aynı glob'a giren ama birbiriyle ilgisiz dosyalar da
  bloklanır; çözüm dar şerit talep etmektir (§K2), kodun akıllanması değil.
- **Notlar en fazla 5 ve bir kez teslim edilir** (`seen` işareti). Kalıcı iletişim kanalı
  değildir; kalıcı olması gereken şey PR gövdesine ya da dokümana yazılır.
- **Pano kendini budar:** 24 saatten eski oturum dosyaları hiç okunmaz (maliyet sınırı).
  Silmek gerekirse `C:/tmp/venthub-board/` elle süpürülebilir.

---

> v1.0 · 2026-08-14 · İki controller tasarımının birleşimi. Eş-controller'dan gelen üç fikir
> aynen alındı: `SessionStart` ile kimlik enjeksiyonu · `PreToolUse` ile **yazmadan önce**
> engelleme (commit anında değil) · her turda kısa brifing. Bu oturumdan eklenenler:
> anlık/kalıcı depo ayrımı · oturum-başına ayrı dosya (append çekişmesi yok) · brifingin
> sessizlik kuralı · künye + `post-merge` ile registry'nin kendi kendine güncellenmesi.
