---
name: mutasyon-testi
description: >-
  Testler kodu gerçekten koruyor mu diye mutasyon ve kaos yoklamalarıyla ölçer, sağ kalan mutantı kanıtlayıp yalnız test ekler. Kritik koda (ödeme, sipariş/iade durumu, fiyat, yetki, webhook) dokunan PR'ı bağımsız doğrularken ya da bir kapsamı taramak için kullan. Üretim hatasını düzeltmez.
category: audit
metadata:
  triggers:
    - mutasyon testi
    - testler kodu koruyor mu
    - sağ kalan mutant
    - mutation testing
    - kritik koda dokunan PR doğrulama
---

# mutasyon-testi

Amaç test yazmak değil, **var olan testlerin kodu gerçekten koruyup korumadığını kanıtlamak**: koda kontrollü, geri alınan bir bozukluk sokar, testlerin fark edip etmediğine bakarsın. Fark etmeyen bozukluk (sağ kalan mutant) test boşluğunun somut kanıtıdır. Her iddia çalıştırılmış bir komutun çıktısıyla gelir; çalıştıramadığın şeyi söylemezsin.

## İki kullanım

| Mod | Ne zaman | Kapsam | Mutant | Kim koşar |
|---|---|---|---|---|
| **HIZLI** | Kritik koda dokunan her PR'da, müdür modelinin "bağımsız doğrula" adımı | `git diff --name-only origin/master...HEAD` içinden kritik yollar ve testleri | 5-8 | Tek Doğrulayıcı çalışan, kendi worktree'sinde, sırayla |
| **TARAMA** | Düzenli, bütün kod | Risk sırasıyla kapsam kapsam (Aşama 0 aday listesi) | 8-20 kapsam başına | Lider, kapsam başına Haiku çalışan; paralel worktree **en çok 3** |

**Kritik kod** (bu yollara dokunan PR HIZLI moda girer): fiyat `src/lib/services/{pricing*,displayPrice,pricingProductPrice}*.ts` ve `src/lib/pricing/**` · teklif `src/lib/quotes/**`, `quoteService`, `adminQuoteService` · sipariş ve iade durumu `src/lib/{order,orderStatusService}.ts`, `src/lib/admin/{order,return}Status*.ts`, `src/lib/purchasing/poStatusMachine.ts` · sepet ve ödeme `cart.service`, `orderInvoice.service`, `src/hooks/useCheckout*.ts` · yetki `src/hooks/{useRole,useAuth}.ts` · edge `supabase/functions/{iyzico-*,order-paid-webhook,returns-webhook,shipping-webhook,quote-notification-webhook,admin-update-order,order-validate}/**`. Liste örnektir: dokunulan dosyanın kritik olup olmadığını CodeGraph ile (kim çağırıyor) doğrula. `supabase/migrations/**` bu skill'in konusu değildir.

## Değişmez kurallar

Kod koşucusu (K) işaretli olanları **zorlar**, geri kalanı sen uygularsın.

1. **Üretim kodu salt-okunur.** Yalnız koşucu, tek mutasyonu uygular, ölçer ve aynı koşuda geri alır; sha256 ile doğrular (K).
2. **Ana ağaçta asla.** Her çalışanın kendi bağlı worktree'si vardır; koşucu ana ağacı reddeder (K).
3. **Kural 13.** `supabase/migrations/**` ve `.sql` hedef olamaz (K). Ödeme, posta ve SMS sağlayıcısına istek gitmez: koşu ortamından bu anahtarlar silinir (K).
4. **Yeni bağımlılık yok.** Mutasyon aracı, kapsam aracı, doğrulama kitaplığı eklenmez; deponun kendi vitest'i kullanılır.
5. **Mevcut test silinmez, atlanmaz, yeniden yazılmaz.** Yalnız yeni test EKLENİR ya da var olan teste assertion EKLENİR (Aşama 5).
6. **Üretim hatası düzeltilmez.** Bulursan bulgu olarak, yeniden üretim betiğiyle raporlanır; düzeltme ayrı iştir.
7. **Ölçülmemiş iddia yok.** "Bu test zayıf" hipotezdir; ancak bir sağ kalan mutant onu kanıtlar.
8. **Çalışma klasörü** `scratch/mutasyon/` (gitignore'lu); başka yere dosya bırakılmaz. Her aşama sonunda `git status --porcelain` temiz olmalı (K, koşucu sonunda kontrol eder).
9. **Commit yalnız müdürde.** PR'da yalnız test dosyaları görünür; `git diff --stat` bunu kanıtlar.

> §10.3 notu: Doğrulayıcı tanımı "yazmaz" der; mutasyon atılabilir worktree'de üretim dosyasını geçici değiştirir. Bu istisna cetvele işlenene kadar raporda "istisna beklemede" yazılır (koşucu zaten mekanik zorlar).

## Aşama 0: kapsam kapısı

Kapsam somut dosya yollarına eşlenmiyorsa ("testler", "hepsi") dur: hafif bir yapı taraması yap (testler nerede, hangi koşucu, hangi kaynak modülü hangi test dizinini hedefliyor), risk sırasıyla 5-8 aday kapsam listele (yol, ne yapar, neden iyi aday) ve **müdüre dön**; kendin seçme. Kapsam somutsa tek satırda onayla ("Kapsam: …") ve Aşama 1'e geç.

## Aşama 1: taban

Çalışan için worktree kur, bağımlılıkları yükle, testleri **kapsam kadar** koş:

```
git worktree add C:/tmp/vh-mut-<slug> -b mut/<slug> origin/master
cd C:/tmp/vh-mut-<slug> && pnpm install --frozen-lockfile --offline
node .claude/skills/mutasyon-testi/mutasyon-kosucu.cjs --repo C:/tmp/vh-mut-<slug> --plan scratch/mutasyon/<slug>/plan.json --out scratch/mutasyon/<slug>/taban.json --taban
```

Taban kırmızıysa (çıkış 5) **dur ve bildir**; kırmızı takımı denetleme. Ayrıca kapsamdaki test dosyalarını listele: her biri kaç test içeriyor, hangi sembolleri çağırıyor.

## Aşama 2: test test statik denetim (yargı, Sonnet)

Kapsamdaki **her** test dosyasında **her** test için tek satır hüküm ver: Sağlam · Totolojik · Assert'siz · Aşırı mock'lu · Uygulamaya bağlı · Yalnız mutlu yol · Kırılgan · Kopya. Her kaynak sembol için kapsanmayan uç durumları yaz (boş, sıfır, sınır, geçersiz girdi, bağımlılık hatası, eşzamanlılık, tekrar çağrı) ve her birinin ulaşılabilir olduğunu kod satırıyla göster. Bu aşama **hipotez** üretir, bulgu değil.

## Aşama 3: mutasyon ve kaos

**3a. Mutant seç** (Aşama 2'nin zayıf saydığı yerlerden, çoğu kapsamda 8-20; HIZLI modda 5-8). Her mutant tek küçük değişiklik, tek yer; operatör adı zorunlu:

| Operatör | Örnek |
|---|---|
| Koşul sınırı | `<` ↔ `<=`, `>` ↔ `>=` (fiyat eşiği, miktar sınırı) |
| Koşul tersleme | `if (x)` → `if (!x)`, `===` → `!==` |
| Aritmetik | `+` → `-`, `*` → `/`, `+1` sil |
| Dönüş değeri | sabit dön, `null`, boş dizi, `true` ↔ `false` |
| Deyim silme | koruma, erken dönüş, hata denetimi, `break` sil |
| Hata yutma | `throw` → `return`, hatayı yut |
| Veri tablosu | geçiş haritasından bir girdiyi sil ya da ekle |
| Varsayılan | `?? []` → `?? ['x']`, `?? false` → `?? true` |
| Kapalı-güvenli → açık | bilinmeyeni reddeden koşulu `true` yap (fail-closed bozulur) |
| Kapsam koşulu | `tenantId`, `lang`, `app_metadata`, HMAC ya da zaman damgası denetimini kaldır |

**3b. Plan ve koşucu.** Mutantları `scratch/mutasyon/<slug>/plan.json`'a yaz:

```json
{ "slug": "siparis-iade",
  "testler": ["src/lib/admin/__tests__/statusMachines.test.ts"],
  "mutasyonlar": [ { "id": "M1", "dosya": "src/lib/admin/orderStatusMachine.ts", "satir": 68,
    "operator": "Veri tablosu", "aciklama": "delivered geçişlerinden partial_refunded çıkar",
    "bul": "delivered: ['refunded', 'partial_refunded'],", "yerine": "delivered: ['refunded'],"} ] }
```

`bul` dosyada **tam bir kez** geçmeli (koşucu aksi hâlde uygulamaz, HATA-CAPA yazar). Koşucuyu `--paralel` bayrağıyla ve `--out .../once.json` ile çalıştır; çıktı tablosunu **olduğu gibi** rapora yapıştır. Sonuçlar: **KILLED** (en az bir test düştü) · **SURVIVED** (hepsi geçti = test boşluğu) · **TIMEOUT** · **ERROR** (kod yüklenemedi/derlenemedi; öldürme sayılmaz, mutantı yeniden tasarla ya da at). Paralel koşarken boş bellek 2 GB altındaysa koşucu reddeder (çıkış 4): sırayla koş.

**3c. Kaos yoklamaları** (2-5 tane, mock'suz, `scratch/mutasyon/<slug>/kaos-*.test.ts`): boş, null, sıfır, negatif, çok büyük girdi · bozuk ya da düşmanca girdi · tekrar çağrı ve durum sızıntısı · eşzamanlı çağrı. Her yoklama `INPUT / EXPECTED / ACTUAL` basar ve üç sonuçtan biri etiketlenir: (a) **eksik test** (davranış doğru, kimse doğrulamıyor) · (b) **üretim hatası** (raporla, düzeltme) · (c) **hiçbiri** (rapordan çıkar).

**3d. Bulguları birleştir.** T1, T2… kimlikli: sağ kalan mutant · kaos ile çıkan eksik test · kanıtlanmış zayıf test · üretim hatası. Şiddet: ödeme, yetki ve durum yolundaki bir koruma mutantı Kritik/Yüksek, günlük metni Düşük. Aşama 3'ün doğrulamadığı Aşama 2 hipotezi "Şüpheli, kanıtsız" bölümüne gider ve eylem alınmaz.

**Eşdeğer mutant uyarısı.** Davranışı hiç değiştirmeyen bir mutant sağ kalır ama test boşluğu değildir. Onu öldürecek bir girdi bulamıyorsan "eşdeğer olabilir" yaz, skordan ayrı say, testle öldürmeye zorlama.

## Aşama 4: test önerisi (kısa plan)

Kanıtlanmış her bulgu için (üretim hatası hariç) kod yazmadan önce: testin **davranış** cümlesi ("süresi dolmuş kuponu reddeder", "checkout'u 1 kez çağırır" değil) · öldüreceği mutant kimlikleri · yeri (mevcut dosya ve güçlendirilen test, ya da yeni dosya) · neden mock'lamadığı ve içeriğe bağlı olmadığı.

## Aşama 5: test ekle ve her birini kanıtla

Her yeni ya da güçlendirilen test için, komutlarla: (1) **özgün kodda geçiyor** · (2) **hedeflediği mutantı öldürüyor**: aynı `plan.json`, aynı kimliklerle koşucu yeniden koşulur (`--out .../sonra.json`), hedef mutantlar KILLED olmalı; olmazsa **testi düzelt**, mutantı listeden atma · (3) **deterministik**: en az 5 kez üst üste geçer. Sonra tam paket yeşil ve test sayısı taban sayıdan kesin büyük; `git diff --stat` yalnız test dosyalarını göstermeli. Skor: `node mutasyon-kosucu.cjs --karsilastir once.json sonra.json`.

## Aşama 6: rapor ve dur

Rapor yapısı `references/rapor-sablonu.md`'de (Türkçe, tablolu). Raporun sonunda **dur**: başka kapsam başlatma, üretim hatasını düzeltme, `scratch/` temizleme. Commit ve PR müdürün işi. Bağımsız doğrulama: işi yapmamış bir çalışan **önce/sonra tablosundan en az 3 mutantı** yeniden koşar ve sonucu eşleştirir; eşleşmeyen skor rapora girmez.

## Skor ne söyler, ne söylemez

Skor = KILLED / (KILLED + SURVIVED); ERROR, TIMEOUT ve HATA-CAPA paydaya girmez. Yalnız **seçilen mutantların** öldürülme oranıdır: mutantları sen seçtin, bu bütün olası hataların örneği değildir. Öncesi/sonrası farkı, eklenen testlerin gerçekten yeni bir şey yakaladığını gösterir; kapsam yüzdesi ikincil kanıttır ve depoda kapsam aracı yapılandırılmışsa raporlanır.

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
