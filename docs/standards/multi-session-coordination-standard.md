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
taşır: `src/**` · `supabase/functions/**` · `venthub-pdf-ingestor/**`. Aynı yolu iki oturum
talep ederse **en erken timestamp kazanır** (deterministik, tartışmasız).

**K3 · Olay günlüğü (append-only).** Kimse kimsenin satırını düzenlemez → çakışması tanım
gereği imkânsız. Her oturum **yalnız kendi dosyasına** yazar (`events.<sid>.jsonl`), okuma
hepsinin birleşimidir; böylece eşzamanlı append'in satır karıştırma riski de yoktur.

## 3. Yazma anı zorunlu ritüele bağlanır (hatırlama yok)

| An | Ne olur | Neden hatırlanmaya gerek yok |
|---|---|---|
| Oturum açılışı | `SessionStart` kancası kimliği + şeridi + pano özetini **bağlama enjekte eder** | Ajan zaten "neredeyiz" diye bakmak zorunda; kimliğini tahmin etmez, **okur** |
| Her kullanıcı turu | `UserPromptSubmit` kancası **sessiz** brifing basar (yalnız söyleyecek şey varsa) | Bağlamı kirletmeden farkındalık; Recep mesaj taşımaz |
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
kalır, son emniyet git'tir. **Sessiz değildir:** hata `stderr`'e düşer.

**Kilit değil kalite ağı.** Ajan `Bash` ile kapıyı aşabilir, kullanıcı dosyayı elle
düzenleyebilir. Amaç kazara çakışmayı **yazım anında** yüzeye çıkarmak.

**Oturum kimliği uydurulmaz.** Claude Code kalıcı bir UUID verir ve kancaya `stdin` ile
geçirir. Compact'ten sağ çıkar (bağlam sıfırlansa da `SessionStart` yeniden koşar).

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

---

> v1.0 · 2026-08-14 · İki controller tasarımının birleşimi. Eş-controller'dan gelen üç fikir
> aynen alındı: `SessionStart` ile kimlik enjeksiyonu · `PreToolUse` ile **yazmadan önce**
> engelleme (commit anında değil) · her turda kısa brifing. Bu oturumdan eklenenler:
> anlık/kalıcı depo ayrımı · oturum-başına ayrı dosya (append çekişmesi yok) · brifingin
> sessizlik kuralı · künye + `post-merge` ile registry'nin kendi kendine güncellenmesi.
