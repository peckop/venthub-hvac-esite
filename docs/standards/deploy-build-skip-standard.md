# Dağıtım Atlama Cetveli (Ignored Build Step) — v1.1

> **Kapsam:** Vercel'de hangi değişikliğin build tetikleyeceği.
> **Bekçi:** `src/__tests__/conformance/build-skip-positive-logic.test.ts` (INV-BUILD-SKIP).
> **Betik:** `scripts/vercel-ignore-build.sh`
> **Doğuş sebebi:** T086 — dağıtım tavanının **%47'si israftı** (2026-08-17 ölçümü);
> altı adet salt-Markdown PR'ı tek başına günlük tavanın **%12'sini** yakmıştı. Tavan
> dolunca tüm filo durur, yani bir doküman commit'i kod PR'ının önünü keser.

---

## D1 — Çıkış kodu sezgiye TERSTİR

```
exit 0  →  build ATLANIR   (ignore)
exit 1  →  build ÇALIŞIR   (continue)
```

"Başarı" (0) burada "yapma" demektir. Ters çevirmek **her build'i sessizce atlar** ve
hiçbir kırmızı üretmez — dağıtım "başarılı" görünür, sadece hiçbir şey değişmez.
INV-BUILD-SKIP'in asıl varlık sebebi bu sessiz felaketi imkânsız kılmaktır.

## D2 — POZİTİF mantık, varsayılan "BUILD ET" (DEĞİŞMEZ)

Soru **"hangi değişiklik build'i atlayabilir"** diye kurulmaz. Tersi sorulur:

> **"Bu değişiklik build GEREKTİRİR Mİ?" — bilmiyorsak, GEREKTİRİR.**

Negatif liste ("şunlar tetiklemesin") yazılırsa, listeye eklemeyi unuttuğumuz **her yeni
dosya türü sessizce build'i atlar**. Bu, 2026-08-15 vitrin kazasının kardeşidir: kod/veri
değişti, yüzey değişmedi, hiçbir kapı görmedi. Bu yüzden **tanınmayan her şey build'i
tetikler**; yalnız §D3'te ADIYLA sayılan sınıf atlanır.

## D3 — Build gerektirmeyen sınıf (pozitif liste)

| Desen | Gerekçe |
|---|---|
| `*.md` (her yol) | Ölçüldü (2026-08-18): depoda **hiçbir kod `.md` import etmiyor**, `next.config.mjs`'te MDX/remark yok. Companion doküman üretimi de `.md` yazar — israfın ana kaynağı buydu. |
| `docs/**` | Salt doküman ağacı |
| `.claude/**` · `.agent/**` | Ajan yetenek ağaçları; derlemeye girmez |
| `.github/**` | CI yapılandırması; Vercel çıktısını etkilemez |
| `registry/**` | İş emri kayıtları |
| `LICENSE` | Metin |

**Bilerek DIŞARIDA (build tetikler):** `supabase/migrations/**` — build'i doğrudan
etkilemez, ama önizleme dağıtımı migration'ın vitrine yansımasını görmenin **tek**
yoludur ve bu depoda migration merge'i prod'a **otomatik** uygulanır. Ayrıca
`.gitignore`, `package.json`, tüm yapılandırma ve elbette `src/**`.

**Listeye ekleme kuralı:** yeni bir sınıf eklemek isteyen, "bu dosya türü derlemeye
girmiyor" iddiasını **ölçerek** kanıtlar (import taraması + yapılandırma kontrolü) ve
INV-BUILD-SKIP'e o sınıf için bir assert ekler. Gerekçesiz satır eklenmez.

## D4 — Karşılaştırma tabanı `VERCEL_GIT_PREVIOUS_SHA`, `HEAD^` DEĞİL

Bu değişken **son BAŞARILI dağıtımın** SHA'sıdır — önceki commit değil. Arka arkaya
birkaç commit atlanmışsa `HEAD^` yalnız en son commit'e bakar ve daha önceki, atlanmaması
gereken bir kaynak değişikliğini **göremez** → "kod değişti, deploy olmadı".
Son başarılı dağıtımdan bu yana biriken **tüm** değişiklikler karşılaştırılır.

> Not: `VERCEL_GIT_PREVIOUS_SHA` yalnız Ignored Build Step yapılandırıldığında ortama
> verilir; yoksa (ilk dağıtım) betik **BUILD**'e düşer.

## D5 — Fail-safe: her belirsizlik BUILD'e düşer

| Durum | Karar |
|---|---|
| `git` komutu başarısız | BUILD |
| Taban commit klonda yok (sığ klon / force-push) | BUILD |
| Değişen dosya listesi **BOŞ** | BUILD |

Sonuncusu kritik: boş liste "hiçbir şey değişmedi" değil, **"ölçemedim"** olabilir. Boş
kümede "her dosya güvenli" iddiası **vacuous olarak doğrudur** ve kapıyı sessizce açar.

## D6 — Kapı davranışı ölçer, metni değil

INV-BUILD-SKIP betiği **gerçekten çalıştırır** (fixture dosya listesiyle) ve çıkış kodunu
okur. Betiğin metnine bakan bir test, `case` dallarının gerçekte ne yaptığını göremez.
Kapı ayrıca `sh` hiç çalışmazsa **hata fırlatır** — "ölçemedim ama yeşilim" durumunu
imkânsız kılar.

---

## Kurulum — YAPILDI (2026-08-18, sahada doğrulandı)

Ayar **canlı**. Kaynak: **Vercel dashboard** (repo içi yapılandırma dosyası DEĞİL — bkz. D7).

1. Vercel → proje `venthub-hvac-esite` → **Settings** → **Build and Deployment**
   → doğrudan bağlantı: `/peckops-projects/venthub-hvac-esite/settings/build-and-deployment`
2. **Ignored Build Step** → *Behavior*: **Custom**
3. Komut kutusuna **tam olarak**:

```
sh scripts/vercel-ignore-build.sh
```

4. **Save**.

> **DÜZELTME — cetvel iki kişiyi olmayan bir sayfaya gönderdi.** v1.0'da bu adım
> "Settings → **Git**" yazıyordu; orada **Ignored Build Step diye bir alan yok**.
> Recep sayfayı arattı, bulamadı; doğru yer **Build and Deployment**. Kusurun sınıfı
> ölçülmemiş talimatı ölçülmüş gibi yazmaktı — o bölüm zaten "dashboard erişimi bende
> yok" diye işaretliydi, yani **kendi belirsizliğini taşıyordu ama emir kipiyle konuştu.**
> Ders: erişemediğim bir yüzeyin adımını yazarken **adı değil, adı ARAMANIN yolunu** ver
> (ayarın kendi metnini arat), ya da doğrulanana dek "önerilen" diye işaretle.

## D7 — Ayarın TEK kaynağı: dashboard (yapılandırma dosyası ALTERNATİFTİR, EK DEĞİL)

Aynı ayar iki yerden verilebilir:

| Kaynak | Durum |
|---|---|
| **Vercel dashboard** → Ignored Build Step | ✅ **UYGULANAN** (2026-08-18'den beri canlı) |
| Repo kökünde `vercel.json` / `vercel.ts` → `ignoreCommand` | ⚠️ **ALTERNATİF — kurulu DEĞİL** |

**İkisini birden koymak yasak.** Vercel dokümanına göre yapılandırma dosyasındaki
`ignoreCommand` **dashboard ayarını EZER**. Yani dosyayı ekleyen kişi, farkında olmadan
canlı ayarı devre dışı bırakır ve iki kaynak sessizce çelişir — bu deponun bu hafta
iki kez yaşadığı **çift-cetvel** sınıfının aynısı.

Yapılandırma dosyasına **geçilecekse**: önce dashboard *Behavior*'ı **Automatic**'e
çevir, sonra dosyayı ekle. Sıra tersse hangi kaynağın konuştuğu belirsiz kalır.

### Kurulumdan sonra DOĞRULANACAK tek şey — HÂLÂ AÇIK

Salt-Markdown bir PR'da **Vercel kapısının ne rapor ettiği** ölçülmedi:

- Kapı **success/neutral** veriyorsa → iş bitti.
- Kapı **pending'de kalıyorsa** → salt-doküman PR'ları **merge edilemez** hale gelir
  (Vercel zorunlu kapı). Bu durumda ya "Vercel" zorunlu kapı listesinden çıkarılır,
  ya da Ignored Build Step **Automatic**'e alınır.

**Bu PR'ın kendisi o ölçümdür:** salt-Markdown değişiklik taşır, yani kurulum sonrası
ilk temiz deney budur. Sonuç bu bölüme yazılacak. (Açık doküman PR'ları #644, #587,
#654 de aynı soruyu yanıtlar ama **bayat** — kapı durumları kurulumdan ÖNCE yazıldı,
o yüzden kanıt değiller.)

### Geri alma

Ignored Build Step *Behavior*'ı **Automatic**'e çevirmek yeterli; repoda değişiklik
gerekmez. Betik ve bekçi zararsız biçimde durur.
