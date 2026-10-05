# Red Team Denetimi, İkinci Tur: `rehber-yazisi-standard.md` v0.2 (REC-369 F2)

> **Hedef:** [rehber-yazisi-standard.md](../standards/rehber-yazisi-standard.md), dal `blog/rec369-rehber-cetveli`, commit `efc928980` (md5 `ed878f26…`; denetim boyunca değişmedi).
> **Denetçi:** bağımsız alt ajan (Opus 5.5), cetveli yazmadı. Yalnız bu dosyayı yazdı; kod yazmadı, commit atmadı.
> **Tarih:** 2026-09-24. **Kapsam (dar):** dört eksen. (1) İki raporun bulguları v0.2'de işlendi mi. (2) v0.2 kendi içinde ya da emsal cetvellerle çelişiyor mu. (3) K4.1 öz-taraması: olgusal cümleler kaynağına sadık mı. (4) R5.1 akışı ve R8.1 kapıları bir sonraki adımda (F4, ilk yazı) uygulanabilir mi.
> **Denetim sırasında dala iki commit indi:** `8b23a8912` (rehber doğrulama betikleri) ve `f2d8f8b83` (envanter satırı). Hedef dosyaya dokunmadılar; yalnız 4. eksende kanıt olarak kullanıldılar.
> **Genel hüküm:** **KOŞULLU** (§5). v0.1'in BLOK sebepleri büyük ölçüde kapandı. Ancak v0.2 dört yeni Yüksek bulgu taşıyor; bunlar düzelmeden F4'ün ilk doğrulama turu başlamamalı.

---

## 0. Bu turda koşulan ölçümler

**A sınıfı (bu denetimde, 2026-09-24):**

1. **Canlı site, `curl`, 08:16Z.** 10 bilgi merkezi adresi incelendi: durum kodu, `<title>` sayısı, bailout işareti, `rel="canonical"`, `meta robots`.
2. **Canlı site, gerçek tarayıcı (Playwright), 08:17–08:18Z.** `hava-perdesi`, `jet-fan` ve `hrv` konu sayfaları hidrasyondan 4 saniye sonra okundu: görünür metin ve `document.title`.
3. **Bot karnesi, 08:25Z.** `node scripts/seo/bot-karnesi.mjs --cikti <scratchpad>` yeniden koşuldu (45 adres × 5 kimlik).
4. **Google belgeleri, ham HTML.** Önce `curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}"`, sonra `curl -sSL`. Metin, etiket soyularak kendim tarafından arandı. **WebFetch kullanılmadı.** Aynı sayfa iki kez çekilip sha256'lar karşılaştırıldı.
5. **Prod DB, salt okuma (Supabase MCP).** `pg_default_acl`, `admin_audit_log` alanları, rehber/yazı tablosu var mı, `product_families`/`categories` alanları.
6. **Depo.** Kod, cetvel, iş akışı dosyaları, `vercel.json` (dal ve `origin/master`), PR #1339 durumu (`gh`).
7. **`platform.claude.com/docs/en/about-claude/pricing`, ham HTML.** Fable 5.1 ve Opus 5.5 birim fiyatı.

**B sınıfı (okundu, ölçen ben değilim):** Linear REC-369 yorumları. Bunlar F1 Search Console ve arama önerisi sayıları, OPS rakip ölçümü ve 08:06Z yan yana denetim notudur. Search Console'a doğrudan erişmedim.

---

## 1. İşlenme tablosu

Durum kümesi: **KARŞILANDI · KISMEN · KARŞILANMADI · BİLİNÇLİ REDDEDİLDİ**. "Yer", v0.2'deki bölümdür.

### 1.1 Fable raporu (B1–B13; B14 özet)

| # | Bulgu (kısa) | v0.2'deki yer | Durum | Not |
|---|---|---|---|---|
| B1 | R5'in evreni yazarın tablosu; sabotaj kolu yok; kabul ölçütü ayırt edici değil; aynı hücrede birden çok aday değer | R5.1 3a, 3e; R5.3 | **KISMEN** | 3a, 3e, "eşlenmeyen iddia = 0" ve "N/N" yazıldı. İki şey eksik. Birincisi, "kaynak dizini satırında aranan sayı birden çok hücrede geçiyorsa DESTEKSİZ; alıntı hücre yoluyla verilir" kuralı yok; 3d yalnız "model mi seri mi" diyor. İkincisi, önerilen kalıcı kapı ("kayıt kontrolü geçmeden durum `doğrulandı` yazılamaz") yok. İkincisi → **T2-3**. |
| B2 | Link rot, ücretli kaynak, müşteriye verilen PDF ≠ doğrulanan nesne | R2.2, R2.3, R2.4, R7 | **KISMEN** | Erişim sınıfı, kayıt alanları ve aylık bakım yazıldı. Herkese açık PDF'in dizindeki kopyayla aynı sürüm olduğunu gösteren hash şartı yok; R2.4 o adresi "tercih edilir" diyerek riski büyütüyor. Arşiv adresi (web.archive.org) önerisi gerekçesiz düşmüş. |
| B3 | Konu 3 değil 4; yönlendirme sayısı yanlış | R0, R0.1, R6 | **KARŞILANDI** | 4 konu, 10 adres, "404'e düşen adres 0". Canlıda 10/10 adres 200 döndü (ölçüldü). |
| B4 | Rota sınıfı ilanı yok; SSR kapısı yeni rotayı görmüyor; `searchParams`/`headers()` | R6 (rota, SSR, kiracı satırları); R5.6 | **KARŞILANDI** | — |
| B5 | Tazeleme: §3 ana tablo sınırı, site haritası dalı, ters yön | R6 tazeleme satırı | **KISMEN** | Site haritası dalı ve ters yön yazıldı. "Satır §3'ün ANA tablosuna, ilk `###`ten önce" yazılmadı; kapı tam o sınırda kesiyor. Ayrıca R8.1 site haritası dalını INV-RENDER-2'ye yüklüyor → **T2-9**. |
| B6 | Yazma politikası, önbellek anahtarı, önizleme, RLS test düzeneği | R6 kiracı + veri/yetki; R5.6 | **KISMEN** | Anahtar, önizleme ve REVOKE yazıldı. Yazıyı kimin yazdığı yok: servis rolü mü, `app_metadata` kararlı yönetici mi. Üç kollu testin hangi düzeneğe bağlanacağı da yok → **T2-13**. |
| B7 | `EN_YAYIN`, K10, koşulsuz `alternates` | R3 (Dil), R6 (harita, hreflang) | **KISMEN** | Bayrak ve `alternates` kuralı yazıldı. INV-DIL-DUSUSU-1'e rehber rotası eklenmedi. EN adres satırıyla yeni çelişki var → **T2-7**. Fable'ın `dynamicParams = false` önerisi bilinçli reddedildi, gerekçesi yazılı ([:276](../standards/rehber-yazisi-standard.md#L276)). |
| B8 | K2 deseni rehberde yanlış pozitif veriyor | R0, R8.2 | **KARŞILANDI** | — |
| B9 | R4'ün 6 maddesi kapısız | R8.1 | **KISMEN** | R4.1, 4.2, 4.3, 4.5 ve 4.6 için satır eklendi. R4.7 (kişi/proje adı) ve R4.8'in depo tarafı için satır yok; neden olmadığı da yazılmamış. |
| B10 | Cetvelin kendi sayıları ve atıfları | Başlık, R6, Ölçüm geçmişi | **KISMEN** | `adres-semasi` işareti yazıldı (PR #1339 bugün hâlâ OPEN, ölçüldü). Rakip hakkındaki kaynaksız cümle silindi. `author.name`/`author.url` eklenmedi → **T2-16**. ⚠Bu bulgunun FAQ satırı ("anlam aynı ✓") **kendisi yanlıştı**, çünkü alıntı bayattı. v0.2 onu doğru olarak reddetti. |
| B11 | Kapıların zamanlaması kural 14'le çelişiyor | R8.1 başlığı | **KARŞILANDI** | — |
| B12 | Markdown ayrıştırıcı yeni bağımlılık | R6 markdown satırı | **KISMEN** | Bağımlılık kararı ve token şartı yazıldı. İzin listesindeki etiketler ve dış bağlantı `rel` politikası yok. |
| B13 | Doğrulayıcı modelinin gerekçesi yok | R5.2 | **KARŞILANDI** | Opus seçildi, ölçüm gerekçe olarak yazıldı. "2,5 kat" doğru ama cetvelde kaynaksız → **T2-15**. |
| (B14) | CLAUDE.md özet kontrolü | — | **KISMEN** | Kural 7'nin istediği `Routes` girişi (`Routes.bilgiMerkezi`) yazılmadı → **T2-18**. |

### 1.2 Opus raporu (§2.1–2.22)

| # | Bulgu (kısa) | v0.2'deki yer | Durum | Not |
|---|---|---|---|---|
| 2.1 | Kapsam açığı: tablo dışındaki iddia doğrulanmıyor | R5.1 3a, R5.3 | **KARŞILANDI** | — |
| 2.2 | Sabotaj, belirlenimci alıntı kontrolü, örnekleme, ikinci turda tüm metin | R5.1 3c/3e/3f/5, R2.3 | **KISMEN** | Metne yazıldı. Yayına bağlı kalıcı kapı (INV-REHBER-DOGRULAMA-1) yok → **T2-3**. Tuzağın metnin **kopyasına** eklenmesi yazılmadı → **T2-1**. |
| 2.3 | FAQPage satırı bayat | R6, R2.3, Ölçüm geçmişi | **KARŞILANDI** | Dört Google alıntısı bu turda ham HTML'den yeniden doğrulandı (§3). |
| 2.4 | Link rot, ücretli kaynak, adresi olmayan belge, bayi belgesi | R2.1–R2.4, R7 | **KISMEN** | Ücretli kaynak, bayi belgesi (dizinde bu turda ölçüldü) ve aylık bakım yazıldı. Arşiv adresi yok, gerekçesi de yok. Adresi olmayan üretici belgesi için Opus'un "yalnız ürüne özgü değerde" sınırı yerine "atıf olabilir, özette belirtilir" seçildi. Bu bilinçli bir seçim ama R2.2 ile çelişiyor → **T2-2**. |
| 2.5 | Durum metne bağlı değil; revizyon ve onay kaydı yok | R5.5 | **KARŞILANDI** | Tuzakla etkileşimi → **T2-1**. |
| 2.6 | Sütun sızıntısı, EN taslağı, anon yazma yetkisi | R6 veri/yetki | **KISMEN** | Ayrı tablo, dil başına durum, REVOKE ve üç kol yazıldı. Test listesine iki kol girmedi: "`public`'te RLS'i kapalı tablo = 0" ve "yayındaki satırda EN taslak gövdesi yok". |
| 2.7 | Önizleme tanımsız | R5.6, R8.1 | **KARŞILANDI** | Revizyon bağı → **T2-11**. |
| 2.8 | "Tablo gelince otomatik" yanlış; ters yön, site haritası, `dynamicParams`, rota sınıfı, `webhook_setup.sql` | R6, R8.1 | **KARŞILANDI** | "Otomatik" düzeltildi. Artıklar → **T2-9**, **T2-19**. |
| 2.9 | SSR: gövde sunucu HTML'inde yok | R6 | **KARŞILANDI** | — |
| 2.10 | Mevcut 4 konu, sayımlar | R0, R0.1 | **KARŞILANDI** | AYRI KAYIT yerine karar 92 işine bağlandı; bilinçli ve gerekçeli. ⚠Bulgunun "kaynaksız sayı taşıyor" kısmı **kısmen yanlıştı**: sayılar kodda duruyor ama ziyaretçiye görünmüyor → **T2-5**. |
| 2.11 | 7/8 yasak kapısız; fiyat yasağı da | R8.1 | **KISMEN** | R4.7 ve R4.8'in depo tarafı yok. `vaat-butunlugu-standard.md` bağı ve `FORBIDDEN_PREFIXES` yok. |
| 2.12 | K2 deseni JS'e birebir taşınamaz (`\m`) | R8.2 | **KARŞILANDI** | `node` ile yeniden ölçüldü: `/\mTODO\M/.test('bir TODO var')` → `false`. |
| 2.13 | Kural 12 ayrıntıları | R6 kiracı | **KARŞILANDI** | — |
| 2.14 | `EN_YAYIN`, koşulsuz `alternates` | R3, R6 | **KARŞILANDI** | EN adres çelişkisi → **T2-7**. |
| 2.15 | JSON-LD tek kaynak, görsel, yazar ve yapay zekâ açıklaması | R6, R3 | **KARŞILANDI** | "Açık soru (Recep)" olarak doğru yere konmuş. Google'ın faydalı içerik sorusu ham HTML'de birebir var. |
| 2.16 | Model seçimi yöntem cetveliyle çelişiyor | R5.2 | **KARŞILANDI** | — |
| 2.17 | Hesap örneği ↔ kaynaksız sayı; H2 sayısı | R2.5, R3 | **KISMEN** | Kural yazıldı. "Hesaplayıcıyla aynı sonuç" kontrolünün R5.1'de adımı, R8.1'de kapısı yok. |
| 2.18 | Markdown render ayrıntısı | R6 | **KISMEN** | Şunlar yazılmamış: ham HTML kapalı mı, `class`/`style` yasak mı, görsel `<Image/>` + boyut ile mi basılır (kural 10), dış bağlantı `rel`, mobil tablo. |
| 2.19 | `adres-semasi-standard.md` master'da yok | Başlık | **KARŞILANDI** | — |
| 2.20 | R1.2c birleşim kolonu | R1.2 | **KARŞILANDI** | Şema bu turda okundu: `category_id`, `subcategory_id` ve `categories.is_active` var. |
| 2.21 | Kaynak sınıfı yazılmamış | Ölçüm geçmişi | **KARŞILANDI** | Küçük artık → **T2-15**. |
| 2.22 | `blog/**` dal öneki `vercel.json`'da yok | — (cetvel dışı) | **BİLİNÇLİ REDDEDİLDİ** (ALTYAPI'ya yönlendirildi) | Gerekçe Linear REC-369'da (08:06Z): "`blog/**` vercel.json → ALTYAPI". `vercel.json`'da bugün hâlâ yok (dal ve `origin/master` ölçüldü). Kural 14'ün istediği kayıt numarası yok → **T2-20**. |

### 1.3 Özet

- 35 bulgu (B1–B13 + 2.1–2.22): **20 KARŞILANDI · 14 KISMEN · 0 KARŞILANMADI · 1 BİLİNÇLİ**. B14 ayrıca KISMEN.
- Fable: 5 KARŞILANDI, 8 KISMEN. Opus: 15 KARŞILANDI, 6 KISMEN, 1 BİLİNÇLİ.
- Kendi başına yanlış olan bulgular: Fable B10'un FAQ satırı (bayat alıntıyı onaylıyordu; v0.2 doğru olarak reddetti) ve Opus 2.10'un "sayı basıyor" kısmı (v0.2 bu yanlışı devraldı → T2-5).
- v0.2'nin Durum satırı *"Birleşik 29 gerçek bulgu bu sürüme işlendi"* diyor ([:28](../standards/rehber-yazisi-standard.md#L28)). Ölçüm 14 KISMEN veriyor → **T2-17**.

---

## 2. Yeni çelişkiler (eksen 2)

### T2-1 · Tuzaklı metin doğrulanıyor, tuzaksız metin yayınlanıyor; durum makinesi geçişe izin vermiyor — **Yüksek**

- **Bulgu:** R5.1 her turda metne tuzak eklenmesini istiyor. Tuzaklar 4. adımda çıkarılıyor, 5. adımdaki ikinci turda yeniden ekleniyor ("her turda"). R5.3'ün kabulü (N/N yakalandı) yalnız **tuzaklı** metinde sağlanabilir. R5.5 ise doğrulanan metnin sha256'sını kaydediyor ve "tek karakter" değişirse durumu taslağa düşürüyor. Yayına giden tuzaksız metin, doğrulanan metinle aynı olamaz. Yazıldığı hâliyle akış ya hiç `doğrulandı → onaylı` geçişine varamaz, ya da sha256 "tuzaklar çıktıktan sonra" alınır. İkinci durumda R5.5'in bağladığı metin, hiçbir turun bütün olarak doğrulamadığı metindir.
- **Kanıt:** [rehber-yazisi-standard.md:218](../standards/rehber-yazisi-standard.md#L218) *"Her turda **en az 3 tuzak** eklenir"* · [:220](../standards/rehber-yazisi-standard.md#L220) *"tuzaklar çıkarılır"* · [:252](../standards/rehber-yazisi-standard.md#L252) *"doğrulanan metnin **sha256**'sı"* · [:256](../standards/rehber-yazisi-standard.md#L256) *"Metin doğrulamadan sonra **tek karakter** değişirse durum taslağa düşer."*
- **Kural:** R5.5'in kendisi; karar 62 ("Recep onayıyla yayın" doğrulanan metne bağlıdır).
- **Düzeltme (tek satır):** R5.1 3e'ye şu eklenir: "Tuzaklar asıl metnin **kopyasına** konur. Doğrulayıcı kopyayı görür. `doğrulanan sha256` tuzaksız asıl metnindir. Kopya = asıl + tuzak satırları eşitliği betikle (diff) kanıtlanır ve doğrulama kaydına yazılır."

### T2-2 · R2.2 her sayıyı AÇIK kaynağa bağlıyor; birinci öncelikli kaynak çoğu zaman AÇIK değil — **Yüksek**

- **Bulgu:** R2.2 üç sınıf tanımlıyor ve **her** sayının en az bir AÇIK kaynağa (tam metni herkese açık) bağlanmasını istiyor. R2.1'in 1. önceliği kaynak dizinindeki üretici belgesi. R2.4 ise herkese açık adresi olmayan üretici belgesine de atıf izni veriyor ("doğrulanabilirlik iç kayıttadır"). Böyle bir belge R2.2 tablosunda hiçbir sınıfa girmiyor. AÇIK değil, çünkü tam metin herkese açık değil. KAPALI da değil, çünkü ücretli değil. Harfiyen okuyan doğrulayıcı en önemli sayıları (ürün değerleri) DESTEKSİZ işaretler; esnek okuyan geçirir. İki doğrulayıcı aynı metne farklı hüküm verir. Başlık "açılamayan", gövde "açılmamış" diyor; kimin açabileceği (biz mi, okuyucu mu) belirsiz.
- **Kanıt:** [:110](../standards/rehber-yazisi-standard.md#L110) *"açılamayan kaynak atıf alamaz"* · [:118-119](../standards/rehber-yazisi-standard.md#L118) *"Metindeki her sayı, birim, oran ve teknik iddia en az bir AÇIK kaynağa (ya da ÖZET'in kendi ifadesine) bağlıdır. **Açılmamış kaynak atıf alamaz.**"* · [:143-145](../standards/rehber-yazisi-standard.md#L143) *"Adresi yoksa atıf yine yapılabilir; doğrulanabilirlik iç kayıttadır"*. Dizinde bu sınıfa giren belge var: `markalar/vortice/hava-perdesi/01-input/Air_Conditioning_Air_Door_2.pdf` (`sayfalar.jsonl`, 2.211 satır, ölçüldü).
- **Kural:** R2.2 ↔ R2.1/R2.4 iç tutarlılığı; karar 62 ("uydurma atıf = kırmızı" kararının belirlenimci olması).
- **Düzeltme (tek satır):** R2.2 tablosuna dördüncü satır eklenir: "**İÇ-DİZİN** | kaynak dizininde, herkese açık adresi yok | iddia + sayı alınır, doğrulama `pdf_hash`+sayfa+alıntı ile; yazı başına sayılır ve R5.4 özetinde ayrıca belirtilir". Gövdedeki cümle "en az bir AÇIK **ya da İÇ-DİZİN** kaynağa" olarak düzeltilir.

### T2-7 · R3 "EN yazılmaz" ile R6'nın EN adres satırı ve R0.1'in "404 = 0" şartı birbirini tutmuyor — **Orta**

- **Bulgu:** R3, `EN_YAYIN` kapalıyken EN yazının yazılmadığını ve "EN yoksa EN sayfa yoktur" dediğini söylüyor. R6 ise yazıları ve çatıyı `/en/knowledge-hub/<article>` · `/en/knowledge-hub` adresine koyuyor. R0.1 ve R6 bugünkü 10 adresin her birine hedef istiyor ve 404'e düşen adresi 0 sayıyor. Bugün canlıda 5 EN adres 200 dönüyor (4 konu + merkez; hepsi `noindex, follow`, ölçüldü). Bu adreslerin aynı dilde gidebileceği bir yazı yok. TR yazıya yönlendirmek dil düşüşüdür (K10). Geriye EN kategori sayfası ya da içi boş bir EN çatı kalıyor, ama cetvel hangisi olduğunu söylemiyor. `/en/knowledge-hub` çatısının 0 yazıyla ne göstereceği de tanımsız: boş sayfa mı, TR liste mi (K10 ihlali), yoksa hiç olmayacak mı.
- **Kanıt:** [:176-178](../standards/rehber-yazisi-standard.md#L176) *"`EN_YAYIN` kapalıyken … **EN yazılmaz** … EN yoksa EN sayfa **yoktur**"* ↔ [:269-272](../standards/rehber-yazisi-standard.md#L269) *"`/en/knowledge-hub/<article>` … Bugünkü 10 adres (R0.1) kalıcı yönlendirmeyle taşınır; hedefsiz adres 0"* · [vitrin-metni-standard.md:250](../standards/vitrin-metni-standard.md#L250) *"**başka dile düşmek yasaktır**"*.
- **Kural:** vitrin-metni K10; CLAUDE.md kural 7; `adres-semasi` A5 (PR #1339).
- **Düzeltme (tek satır):** R6'ya şu satır eklenir: "`EN_YAYIN` kapalıyken EN çatı ve EN yazı rotası üretilmez. 5 EN eski adres, konunun EN kategori sayfasına 308 alır (merkez → `/en`). Bayrak açılınca EN çatı açılır ve yönlendirmeler güncellenir."

### T2-8 · R5.1 3d "Yargı"yı alt ajana veriyor; yöntem cetveli yargıyı alt ajana vermiyor; 3f'de başarısızlık kuralı yok — **Orta**

- **Bulgu:** R5.1'in 3d adımının adı "Yargı", sahibi "Doğrulayıcı alt ajan". Yöntem cetveli §4 ve §5.2 yargıyı açıkça şeride bırakıyor. 3f örneklemi (en az 3 DOĞRULANDI satırı yeniden açılır) bu çelişkiyi kısmen onarıyor. Ama örneklenen satırlardan biri yanlış çıkarsa ne olacağı yazılı değil (tur geçersiz mi, yalnız o satır mı?). Yazılı olmayınca örneklem ayırt edici değildir.
- **Kanıt:** [:217](../standards/rehber-yazisi-standard.md#L217) *"3d. Yargı | Doğrulayıcı alt ajan"* · [:219](../standards/rehber-yazisi-standard.md#L219) *"en az 3'ü BLOG tarafından ham kaynaktan yeniden açılır"* ↔ [execution-method-standard.md:124](../standards/execution-method-standard.md#L124) *"**Alt-ajan yargı vermez.** Çıktısı şerit sahibi tarafından örneklenerek doğrulanır"* · [:151](../standards/execution-method-standard.md#L151) *"**Yargı, sentez, hüküm** | **şerit** (alt-ajana verilmez)"*.
- **Kural:** execution-method §4, §5.2 ("yazılmamış sapma hatadır").
- **Düzeltme (tek satır):** 3d'nin adı "Sınıflama (alt ajan)" olur; kabul hükmü BLOG'undur. 3f'ye şu eklenir: "örneklenen satırlardan biri bile yanlışsa tur geçersizdir ve örneklem 3'ten 10'a çıkar."

### T2-9 · R8.1'in tazeleme satırı INV-RENDER-2'ye ölçmediği bir şeyi yüklüyor — **Orta**

- **Bulgu:** R8.1'e göre tazeleme kapısı "§3 satırı + tetik + handler + sitemap dalı"nı ölçüyor ve doğum yeri "INV-RENDER-2 satırı okur". INV-RENDER-2 site haritası dalını **ölçmez**: test dosyasında `sitemap` kelimesi **0 kez** geçiyor (ölçüldü). Ayrıca kapı §3'ü ilk `\n### ` başlığında kesiyor. R6 "§3 tablosuna satır" diyor ama "ana tabloya, §3.1'den önce" demiyor. v0.1'in "tablo gelince otomatik" hatası daraltılmış ama aynı sınıfta yaşamaya devam ediyor: kapıya, göremediği bir şey yazılmış.
- **Kanıt:** [:323](../standards/rehber-yazisi-standard.md#L323) *"§3 satırı + tetik + handler + sitemap dalı | migration PR'ı (INV-RENDER-2 satırı okur)"* · [render-revalidation-contract.test.ts:349-357](../../src/__tests__/conformance/render-revalidation-contract.test.ts#L349) (`section.indexOf('\n### ')` ile kesim) · `grep -c sitemap` → 0.
- **Kural:** rendering-cache §3 ("biri eksikse veri değişir, sayfa değişmez"), R8.1'in kendi "sabotajla kırmızı yanmadan kapı sayılmaz" şartı.
- **Düzeltme (tek satır):** Satır şöyle olur: "INV-RENDER-2: §3 **ana** tablosundaki satır + tetik + handler. Site haritası dalı için INV-RENDER-2'ye yeni kol (sahibi ve kayıt numarasıyla) ya da `route.tags` birim testi aynı PR'da."

### T2-10 · "7 günde en fazla 2" eşiği R0.1 onarımıyla, R9'un "Recep'in tercihi" cümlesiyle ve revizyon sayımıyla netleşmemiş — **Orta**

- **Bulgu:** (a) R0.1 dört konunun, karar 92 taşımasıyla **aynı işte** ya yeniden yazılmasını ya da kaldırılıp yönlendirilmesini istiyor. Üç konu (`hava-perdesi`, `hrv`, `jet-fan`) yeniden yazılırsa aynı gün 3 yayın olur ve toplu üretim kapısı kırmızı yanar. (b) R9 ritmin Recep'in tercihi olduğunu söylüyor, ama R8.1 sabit 2 yazıyor. Recep haftada 3 derse kapı bunu reddeder. Fable eşiğin Recep kararı olmasını önermişti. (c) Yayındaki yazının revizyonu (R5.5) ve aynı yazının sonradan eklenen EN'i bu sayaca giriyor mu, pencere kayan 7 gün mü takvim haftası mı, tanımlı değil. Hata onarımı revizyonu sayaca girerse onarımı geciktirir.
- **Kanıt:** [:53-56](../standards/rehber-yazisi-standard.md#L53) *"Onarım karar 92 taşımasıyla aynı işte yapılır … her konu ya R3/R5'ten geçerek yeni adreste yeniden yazılır ya da kaldırılıp … kalıcı yönlendirilir"* · [:318](../standards/rehber-yazisi-standard.md#L318) *"7 günde yayına geçen yazı sayısı > 2 → KIRMIZI"* · [:339-340](../standards/rehber-yazisi-standard.md#L339) *"Üst sınır R8.1'deki toplu üretim kapısıdır (7 günde en fazla 2). Ritim Recep'in tercihidir"*.
- **Kural:** R0.1 ↔ R8.1 ↔ R9 iç tutarlılığı.
- **Düzeltme (tek satır):** "Taşıma anında 4 konu kaldırılıp yönlendirilir; yeniden yazım R9 ritmiyle kuyruğa girer. Sayaç yeni yazının dil başına ilk yayınını sayar, revizyonu saymaz. Pencere kayan 7 gündür. Eşik Recep'in R9 kararıdır (başlangıç 2)."

### T2-11 · Önizleme hangi metni gösteriyor? R5.6 revizyona ve sha256'ya bağlı değil — **Orta**

- **Bulgu:** R5.5 onayı "sha256 doğrulananla aynı" şartına, yayındaki yazının güncellemesini de "ayrı revizyon"a bağlıyor. R5.6 ise önizlemeyi yalnız rota olarak tarif ediyor. Hangi revizyonu gösterdiği (yayındaki satırı mı, bekleyen revizyonu mu), metnin sha256'sını gösterip göstermediği yazılı değil. Önizleme "son taslağı" çizerse Recep, doğrulanan metinden farklı bir metni onaylayabilir. Yayındaki bir yazının revizyonunda önizleme eski sürümü de gösterebilir.
- **Kanıt:** [:253](../standards/rehber-yazisi-standard.md#L253) *"Recep sözü; metnin sha256'sı doğrulananla **aynı**"* · [:256-258](../standards/rehber-yazisi-standard.md#L256) *"güncelleme **ayrı revizyon** olarak …"* ↔ [:262-265](../standards/rehber-yazisi-standard.md#L262) (önizleme tanımı; revizyon ve sha geçmiyor).
- **Kural:** karar 62 (Recep onayı doğrulanan metne verilir); R5.5.
- **Düzeltme (tek satır):** R5.6'ya şu eklenir: "Önizleme adresi revizyon kimliği taşır. Sayfa doğrulanan sha256'nın ilk 12 hanesini gösterir. R5.4 özeti aynı haneleri yazar; onay bu haneye verilir."

---

## 3. K4.1 öz-taraması (eksen 3)

| # | v0.2 cümlesi (yer) | Ölçüm | Sonuç |
|---|---|---|---|
| 1 | "10 canlı adres" (R0 [:38](../standards/rehber-yazisi-standard.md#L38)) | `curl`, 08:16Z: TR/EN × (merkez + 4 konu) | **DOĞRU**: 10/10 200 |
| 2 | 4 konu `knowledge.topics`'te (R0) | [tr.ts:330-357](../../src/i18n/dictionaries/tr.ts#L330) | **DOĞRU** |
| 3 | "dört konu kaynaksız teknik sayı **basıyor**" (R0.1 [:48-50](../standards/rehber-yazisi-standard.md#L48)) | Sunucu HTML'inde `7–9`, `50–100`, `70–85`, `16798`: 0. Tarayıcıda hidrasyondan 4 sn sonra: 0 (`main li` = 0). | **YANLIŞ** → T2-5 |
| 4 | "Adım ve sık hata listeleri sunucu HTML'inde **boş** (R6, **istemci bailout**)" (R0.1 [:51](../standards/rehber-yazisi-standard.md#L51)) | Liste sunucuda boş, istemcide de boş. Sebep bailout değil: `t()` dizi döndürmüyor ([TopicPage.tsx:55-59](../../src/views/knowledge/TopicPage.tsx#L55), [I18nProvider.tsx:129-139](../../src/i18n/I18nProvider.tsx#L129)) | **Olgu doğru, sebep YANLIŞ** → T2-5 |
| 5 | `air-curtain` = `hava-perdesi` metni; ikisi de kendini kanonik ilan ediyor | tr.ts:335 = :354; canlıda iki ayrı `rel="canonical"` | **DOĞRU** |
| 6 | `dynamicParams = false`, sözlükten üretim (R6 [:276](../standards/rehber-yazisi-standard.md#L276)) | [page.tsx:4-7](../../src/app/%5Blang%5D/destek/konular/%5Bslug%5D/page.tsx#L4) | **DOĞRU** |
| 7 | "2 bailout işareti" (R6 [:277](../standards/rehber-yazisi-standard.md#L277)) | 10/10 adreste 2 | **DOĞRU** |
| 8 | Bot karnesi: 45/45 aynı HTML · 32 sorunlu · hreflang 28 · iki title 15 · varsayılan başlık + canonical yok 13 (R6, Ölçüm geçmişi) | Karne 08:25Z'de yeniden koşuldu | **DOĞRU** (5/5 sayı birebir) |
| 9 | `sitemap.ts` koşulsuz tr+en `alternates` (R6 [:282](../standards/rehber-yazisi-standard.md#L282)) | [sitemap.ts:84-89](../../src/app/sitemap.ts#L84); bilinçli olduğu [:34-36](../../src/app/sitemap.ts#L34)'te yazılı | **DOĞRU** |
| 10 | Prod `public` varsayılan yetkisi `anon=arwdDxtm` "(ölçüldü)" (R6 [:285](../standards/rehber-yazisi-standard.md#L285)) | `pg_default_acl` (postgres ve supabase_admin sahipli iki satır): `anon=arwdDxtm` | **DOĞRU**. Ama tarih ve sınıf yok; kaynağı [db-grant-hygiene-standard.md:29](../standards/db-grant-hygiene-standard.md#L29) (2026-08-19, B) → T2-15 |
| 11 | "INV-RENDER-2 tablo listesini §3 tablosundan okur" (R6 [:286](../standards/rehber-yazisi-standard.md#L286)) | Test :349-357 | **DOĞRU ama eksik**: yalnız ilk `###`e kadar okur, site haritasını ölçmez → T2-9 |
| 12 | `/\mTODO\M/.test('bir TODO var')` → false (R8.2) | `node` | **DOĞRU** |
| 13 | Spam politikası alıntıları + "Last updated 2026-08-28" (R4.1) | `curl` 200. Etiket soyulunca birebir var; **ham HTML'de birebir yok**. Çevrede kaldırma notu yok (sayfadaki AB notu "site reputation abuse" politikasına ait). | **DOĞRU** |
| 14 | Article alıntısı + "Last updated 2026-09-08" (R6 [:280](../standards/rehber-yazisi-standard.md#L280)) | 200. Normalize edince birebir var; ham HTML'de `<a><code>` ile bölünmüş. | **DOĞRU**. "Önerilen alanlar" listesi **EKSİK**: Google `author.name` ve `author.url`'i de listeliyor → T2-16 |
| 15 | FAQ: `faqpage` 301 → updates; "This feature will no longer appear … May 7, 2026." (R2.3, R6) | `301 -> …/search/updates#removing-faq-rich-result`; alıntı ham HTML'de birebir var; 2023 kaydı ve Haziran 2026'daki "Removed documentation for the FAQ rich result feature" girdisi de var | **DOĞRU** |
| 16 | Indexing API alıntısı + "Last updated 2026-07-16" (R4.9) | 200. Normalize edince birebir var; ham HTML'de `<a><code>` ile bölünmüş. Kaldırma notu yok. updates sayfasında 11 Eylül girdisi: "subject to spam detection" | **DOĞRU** |
| 17 | Faydalı içerik rehberi "otomasyon/yapay zekâ ziyaretçiye açık mı" (R3 [:180-181](../standards/rehber-yazisi-standard.md#L180)) | *"Is the use of automation, including AI-generation, self-evident to visitors through disclosures or in other ways?"* birebir var ("Last updated 2025-12-10") | **DOĞRU** (Türkçe özet, tırnak içinde değil) |
| 18 | "Fable'ın birim fiyatı 2,5 kat" (R5.2 [:227](../standards/rehber-yazisi-standard.md#L227)) | pricing ham HTML: Fable 5.1 $10/$50, Opus 5.5 $4/$20 | **DOĞRU**. Cetvelde kaynak yok (kaynak Linear 08:06Z'de) → T2-15 |
| 19 | 29 / Fable 18 / Opus 26 / ortak 15 (R5.2, Ölçüm geçmişi) | Linear 08:06Z (B); 18+26−15 = 29 ve 15+3+11 = 29 | **TUTARLI** (B) |
| 20 | F1: 34 tık · 448 gösterim · sıra 28,0 · %50/%26 · bilgi niyetli 2 gösterim · 11 küme · 57 gösterim | Linear 07:26Z (B) | **TUTARLI** (B; Search Console'u ben ölçmedim) |
| 21 | 16 tohum, 93 öneri, "hava perdesi" 16 | Linear 07:26Z tablosu toplandı: 16+13+11+9+8+8+6+6+4+3+3+3+2+1+0 = 93; 16 tohum | **DOĞRU** (aritmetik A, veri B) |
| 22 | Rakip: 2.561 kelime · 15 H2 · 8 SSS · 17 kaynak; TR 433–1.565, 0 kaynak | Linear OPS 07:17Z (B): "~433–1.565" | **TUTARLI** (B) |
| 23 | Hesaplayıcılar: kanal, hrv, hava-perdesi, jet-fan | `ls` | **DOĞRU** |
| 24 | Karar 87 günlüğü "henüz depoda yok" | `grep` → yalnız bu cetvel ve Opus raporu | **DOĞRU** |
| 25 | `adres-semasi` master'da yok, PR #1339 açık | `ls` + `gh pr view 1339` → OPEN | **DOĞRU** |
| 26 | Dizinde `ticaret/avensair-fiyat-listesi-2026/…` | `sayfalar.jsonl` | **DOĞRU** |
| 27 | Görseller: "ikisi aynı dosya" (R3 [:173](../standards/rehber-yazisi-standard.md#L173)) | 4 konudan 3'ü `premium_3.webp` (`hava-perdesi` varsayılan yoldan), `hrv` ise `premium_4.png` | **YANLIŞ** (üçü aynı) → T2-14 |
| 28 | "Dal önizlemeleri kapalıdır" (R5.6 [:264](../standards/rehber-yazisi-standard.md#L264)) | `vercel.json`'da `blog/**` yok. Linear'a göre `blog/` dalı "Canceled by Ignored Build Step" (B) | **Sonuç doğru**, mekanizma INV-VERCEL-DAL-1 değil |
| 29 | `EN_YAYIN` kapalı, EN ağacı `noindex` | Canlıda 5/5 EN adres `noindex, follow` | **DOĞRU** |
| 30 | "Birleşik 29 gerçek bulgu bu sürüme işlendi" (Durum [:28](../standards/rehber-yazisi-standard.md#L28)) | §1: 14 KISMEN | **ABARTILI** → T2-17 |
| 31 | "Fable yazarla (Opus) aynı hatayı yaptı" (R5.2 [:229-230](../standards/rehber-yazisi-standard.md#L229)) | Yazarın modeli depoda yok | **ÖLÇÜLEMEDİ** |

### T2-5 · R0.1'in "ölçüldü" dediği olgu yanlış: sayılar ziyaretçiye görünmüyor. Asıl görünen kusur başka, gizli risk yazılmamış — **Orta**

- **Bulgu:** R0.1 dört konunun kaynaksız teknik sayı "bastığını" ve bunun "müşteriye görünen kusur" olduğunu yazıyor, dayanak olarak da "ölçüldü (kod + canlı)" diyor. Ölçtüm: sayılar sözlükte duruyor ama **ne sunucu HTML'inde ne de hidrasyon sonrası tarayıcıda** görünüyor. `t()` bir dizi yerine dizge döndürüyor, bu yüzden `Array.isArray` yanlış çıkıyor ve liste `[]` oluyor. Ziyaretçinin gördüğü kusur farklı: "3 adımda seçim" ve "Sık hatalar" başlıkları var ama altları boş. Sekme başlığı da hidrasyondan sonra "Hava Perdesi | VentHub"dan site varsayılanı "VentHub — Premium HVAC Çözümleri"ye dönüyor (3/3 sayfa). Sebebin "istemci bailout" olarak yazılması iki sonuç doğuruyor. Birincisi, onarımı yanlış yere yönlendiriyor. İkincisi, **gizli bir riski saklıyor**: birisi listeleri görünür kılarsa (SSR onarımı ya da `t()`'ye dizi desteği; bu genel bir i18n değişikliğiyle de olabilir), kaynaksız sayılar canlıya **ilk kez** çıkar. Cetvel, sayıların kod tarafında hemen silinmesi gibi küçük bir ara onarımı da söylemiyor. Onarımı büyük karar 92 işine bağlıyor.
- **Kanıt:** [:48-51](../standards/rehber-yazisi-standard.md#L48) *"Ölçüldü (2026-09-24, kod + canlı): dört konu kaynaksız teknik sayı basıyor … Adım ve sık hata listeleri sunucu HTML'inde **boş** (R6, istemci bailout)."* · Playwright, 08:17Z: `hava-perdesi` → `"Çıkış hızı 7–9"=false, "Nozül 10–15"=false`, `title = "VentHub — Premium HVAC Çözümleri"`. `jet-fan` → `"50–100"=false`. `hrv` → `"70–85"=false, "16798"=false, main li = 0`. · [TopicPage.tsx:55-59](../../src/views/knowledge/TopicPage.tsx#L55) · [tr.ts:335](../../src/i18n/dictionaries/tr.ts#L335), [:342](../../src/i18n/dictionaries/tr.ts#L342), [:349](../../src/i18n/dictionaries/tr.ts#L349).
- **Kural:** K4.1 dersi (v0.2'nin kendi son paragrafı: *"bu sürümün de her olgusal cümlesi aynı kurala karşı tarandı"*); `hukum-kaynak-standard.md` (Opus raporundaki B sınıfı iddia, "ölçüldü" diye A sınıfına taşınmış); memory "müşteriye görünen kusur onarımdır".
- **Düzeltme (tek satır):** R0.1 şöyle yazılır: "Sayılar sözlükte ([tr.ts]/[en.ts] `steps`) duruyor ama `t()` dizi döndürmediği için hiç görünmüyor. Görünen kusur: boş iki bölüm, ikiz sayfa ve hidrasyonda değişen başlık. **Ara onarım (hemen, taşımayı beklemez):** kaynaksız `steps`/`pitfalls` sözlükten silinir, `air-curtain` → `hava-perdesi` 308 verilir."

### T2-6 · R2.3'ün kayıt ve arama tarifi betiğin gerisinde kalmış: ham HTML'in sha256'sı her çekimde değişiyor, "normalize" tanımsız — **Orta**

- **Bulgu:** R2.3, adres `curl -sSL` ile "(ham HTML)" çekildikten sonra "ham metnin sha256'sı"nın kaydedilmesini istiyor. R7 de "sha256 değişen kaynak → gözden geçir listesine" diyor. Ölçtüm: aynı Google sayfası art arda iki kez çekildi ve **ham HTML sha256'sı farklı çıktı** (210.981 / 210.977 bayt; öznitelik sırası her çekimde değişiyor). Etiket soyulmuş metnin sha256'sı ise **aynı** (40.033 karakter). Ham HTML okunursa R7 her ay her kaynağı "değişti" diye işaretler; bu %100 yanlış alarm demektir. 3c "normalize edilerek aranır" diyor ama normalleştirmeyi tanımlamıyor. Ölçtüm: 7 alıntının 4'ü ham HTML'de birebir yok. Etiketi boşlukla değiştiren saf bir normalleştirme 2/7'yi kaçırıyor (Article ve Indexing API; `<a><code>…</code></a>.` → "VideoObject ."), yani doğru alıntıya DESTEKSİZ diyor. Betik ([alinti-dogrula.mjs:136](../../scripts/rehber/alinti-dogrula.mjs#L136)) iki sorunu da doğru çözüyor: soyulmuş metnin hash'ini alıyor, noktalama önündeki boşluğu siliyor. Cetvel ise betiği anmıyor ve ondan farklı bir şey tarif ediyor.
- **Kanıt:** [:131-134](../standards/rehber-yazisi-standard.md#L131) *"`curl -sSL` (ham HTML) … ham metnin sha256'sı"* · [:294-296](../standards/rehber-yazisi-standard.md#L294) *"son adres, durum ya da sha256 değişen kaynak → yazı 'gözden geçir' listesine"* · `sha256sum`: `580b372e…` ≠ `5d672b3b…`; `htmlMetin` sha: eşit.
- **Kural:** R7'nin ayırt ediciliği; R5.1 3c ("LLM bu adımı yapmaz", yani betik belirlenimci olmalı).
- **Düzeltme (tek satır):** R2.3'e şu yazılır: "sha256, **etiket soyulmuş görünür metnin** hash'idir (ham HTML'in değil; öznitelik sırası her çekimde değişir, ölçüldü). Normalleştirme ve arama tarifinin tek kaynağı `scripts/rehber/alinti-dogrula.mjs`'tir."

### T2-14 · Görsel cümlesi yanlış — **Düşük**

- **Kanıt:** [:173](../standards/rehber-yazisi-standard.md#L173) *"ikisi aynı dosya"*. Ölçüm: `air-curtain`, `jet-fan` ve (varsayılan yoldan) `hava-perdesi` aynı `premium_3.webp` dosyasını, `hrv` ise `premium_4.png`'yi kullanıyor ([TopicPage.tsx:72](../../src/views/knowledge/TopicPage.tsx#L72)).
- **Düzeltme:** "4 konudan 3'ü aynı dosya".

### T2-15 · B sınıfı olgu A sınıfı gibi sunulmuş ya da kaynaksız bırakılmış — **Düşük**

- **Kanıt:** [:285](../standards/rehber-yazisi-standard.md#L285) `anon=arwdDxtm` *"(ölçüldü, `pg_default_acl`)"*: tarih yok; kaynağı db-grant-hygiene'deki 2026-08-19 ölçümü. [:227](../standards/rehber-yazisi-standard.md#L227) "2,5 kat": kaynak yok. İkisini de bugün doğruladım (§3 #10, #18). [hukum-kaynak-standard.md:26](../standards/hukum-kaynak-standard.md#L26) *"⛔**B'yi A gibi sunmak yasak.**"*
- **Düzeltme:** İki cümleye tarih ve sınıf eklenir: "(`pg_default_acl`, B: db-grant-hygiene 2026-08-19; A: 2026-09-24 yeniden)" ve "(platform.claude.com pricing, 2026-09-24)".

### T2-16 · Article "önerilen alanlar" eksik (Fable B10'dan kalan) — **Düşük**

- **Kanıt:** [:280](../standards/rehber-yazisi-standard.md#L280) *"Önerilen alanlar: `author`, `dateModified`, `datePublished`, `headline`, `image`"*. Ham HTML'de Google'ın listesi: *"author … author.name … author.url … dateModified … datePublished … headline … image"*.
- **Düzeltme:** `author.name` ve `author.url` eklenir; `author` = Kurum ise `url` = hakkımızda adresi.

### T2-17 · Durum satırı işlenmeyi abartıyor — **Düşük**

- **Kanıt:** [:27-28](../standards/rehber-yazisi-standard.md#L27) *"Birleşik 29 gerçek bulgu bu sürüme işlendi"*. Ölçüm §1: 35 kalemden 14'ü KISMEN.
- **Düzeltme:** "29 bulgunun hepsine cevap verildi; 14'ü kısmen, eksikleri tur 2 raporunda (bu dosya)."

### T2-18 · Kural 7 sapması yazılmamış (dil başına satır ↔ JSONB; `Routes` girişi) — **Düşük**

- **Kanıt:** [:284-285](../standards/rehber-yazisi-standard.md#L284) *"`UNIQUE (tenant_id, dil, slug)` … durum **dil başına**"* (dil başına satır modeli) ↔ [CLAUDE.md:86](../../CLAUDE.md#L86) *"DB çevirileri JSONB (`metadata->>lang`)"*. `Routes.bilgiMerkezi` girişi yazılmamış; OPS'un F3 ikinci gözü bunu şart olarak yazmıştı (Linear 07:34Z, B).
- **Düzeltme:** R6'ya şu satır eklenir: "Dil başına satır, kural 7'nin JSONB kuralından bilinçli sapmadır (gerekçe: dil başına durum ve slug tekilliği). URL'ler `Routes.bilgiMerkezi.*` + `useLocalizedRoutes` ile üretilir."

### T2-19 · Tetik yalnız `webhook_setup.sql`'e bağlanmış — **Düşük**

- **Kanıt:** [:286](../standards/rehber-yazisi-standard.md#L286) *"tetik (`scripts/webhook_setup.sql`)"*. Oysa INV-RENDER-2 yaşayan tetiği baseline + migration'lardan hesaplıyor ve kurulum betiğini ayrıca istiyor ([render-revalidation-contract.test.ts:513-529](../../src/__tests__/conformance/render-revalidation-contract.test.ts#L513)). Yalnız betiğe yazılan tetik prod'a gitmez. Kapı bunu yakalar, bu yüzden risk düşük.
- **Düzeltme:** "tetik: migration **ve** `scripts/webhook_setup.sql` (ikisi aynı PR'da)".

### T2-20 · 2.22 ALTYAPI'ya yönlendirildi ama kayıt numarası yok — **Düşük**

- **Kanıt:** Linear REC-369 08:06Z (B) *"`blog/**` vercel.json → ALTYAPI"*; `vercel.json` ve `origin/master`'da `blog` 0 kez geçiyor (ölçüldü). CLAUDE.md kural 14 kapsam dışı işi *"ayrı kayıt olarak açılır ve numarası raporda geçer"* diye tanımlıyor.
- **Düzeltme:** ALTYAPI kaydının REC numarası REC-369 yorumuna ve Ölçüm geçmişine yazılır.

---

## 4. Uygulanabilirlik: F4 ilk yazı (eksen 4)

Bugünkü durum ölçüldü. Prod'da rehber, yazı, article, blog ya da içerik tablosu **yok** (information_schema: 0 satır). Önizleme rotası, markdown ayrıştırıcısı ve rehber rotası da yok. `scripts/rehber/` bu denetim sırasında `8b23a8912` ile geldi. Sonuç şu: F4'te **araştırma, yazım ve 3b/3c betikleri çalışabilir**; **R5.4 (önizlemeli sunum), R5.5 (durum kaydı) ve yayın çalışamaz**.

### T2-3 · İçerik kapıları hiçbir durum geçişine bağlı değil: R8.1'deki "kapı"ların çoğu aracın kendi testi — **Yüksek**

- **Bulgu:** R8.1 atıf, alıntı, not, vaat, olumsuz iddia ve mevzuat için "kapı" yazıyor. Kapının doğum yeri "BLOG doğrulama betikleri PR'ı". Oysa yazının metni hiçbir PR'dan geçmiyor: R4.8'e göre depoya girmiyor, DB'de yaşıyor. CI'da koşan şey betiklerin **fikstür testi**. Yani araç sınanıyor, yazı sınanmıyor. Betiklerin kendisi de bunu söylüyor: alıntı betiği CI'da koşmuyor, denetim betiği yazı için "ilk yazıda elle" koşuyor. R5.5'in `doğrulandı` geçişi yalnız "R5.3 tam + doğrulama raporu" istiyor. DB tarafındaki tek zorlayıcı sha256 eşitliği (R8.1 "Durum ↔ sha256"). Betik çıktısının (numarasız iddia 0, alıntı bulundu, tuzak N/N) geçişe **bağlı** olduğunu gösteren hiçbir kol yok. 3b/3c atlanır ya da kırmızıya rağmen "doğrulandı" yazılırsa hiçbir şey kırmızı yanmaz. Bu, R8.1'in kendi ölçütünü de karşılamıyor: "sabotaj koluyla kırmızı yandığı gösterilmeden kapı sayılmaz". Betiğin sabotaj kolu var, **uygulama noktasının** yok.
- **Kanıt:** [:312-317](../standards/rehber-yazisi-standard.md#L312) (altı satırın hepsi *"BLOG doğrulama betikleri PR'ı"*) · [:252](../standards/rehber-yazisi-standard.md#L252) · [alinti-dogrula.mjs:15](../../scripts/rehber/alinti-dogrula.mjs#L15) *"⚠AĞA ÇIKAR. CI kapısı bu dosyayı çalıştırmaz"* · [rehber-denetim.mjs:14](../../scripts/rehber/rehber-denetim.mjs#L14) *"taslak yayından önce depoya GİRMEZ — R4.8; dosyalar depo dışındadır"* · [arac-envanteri-2026-09-07.md:396](arac-envanteri-2026-09-07.md#L396) *"`__tests__/rehber-denetim.test.ts`; ilk yazıda elle"*.
- **Kural:** karar 62 ("uydurma atıf = kırmızı" sözünün kırmızısı bir yerde yanmalı); rendering-cache §3 dersi; R8.1 başlığı.
- **Düzeltme (tek satır):** R8.1'e şu satır eklenir: "Doğrulama kaydı (betik JSON çıktısı: `numarasiz=0`, `alinti_bulunamayan=0`, `tuzak_yakalanan=tuzak_sayisi≥3`, `eslenmeyen=0`, doğrulanan sha256) iç tabloda saklanır. `doğrulandı` geçişi bu alanlara DB kısıtıyla bağlanır; sabotaj: alanlardan biri bozulunca geçiş REDDEDİLİR (migration PR'ı)."

### T2-4 · F4 için ara çözüm yok: kayıt yeri, önizleme, bağımlılık sırası ve kayıt numaraları — **Yüksek**

- **Bulgu:** (a) **Kayıt yeri.** R4.8 taslak, iddia tablosu ve doğrulama kaydı için iki yer sayıyor: "veritabanının iç tablosu ya da Linear kaydı". İç tablo yok. Betiklerin girdi biçimi üçüncü bir yer kullanıyor: "depo dışındaki dosyalar", yani pencereye özgü, paylaşılmayan ve kalıcı olmayan bir disk. R5.5'in sha256 kaydı ve onay kaydı (`admin_audit_log`; prod'da `table_name` ve `tenant_id` NOT NULL, ölçüldü) tablo gelene kadar nereye yazılacak, tanımlı değil. (b) **Önizleme.** R5.4, Recep'e giden özetin önizleme bağlantısı içermesini istiyor. R5.6 rotası rota PR'ı gelmeden yok. Önizlemesiz onay mı alınacak, yoksa F4 onay adımında mı bekleyecek, yazılı değil. (c) **Sıra.** Yayın için gerekenler: migration (tablolar, RLS, REVOKE, durum ve sha kısıtı, denetim izi), rota (RSC, markdown ayrıştırıcı + bağımlılık kararı, JSON-LD, site haritası), önizleme rotası, tazeleme (tetik + handler + site haritası), karar 92'nin 10 yönlendirmesi. R8.1 bunları "migration PR'ı / rota PR'ı" diye anıyor ama kayıt numarası, sahip sırası ve F4 ile ilişkisi yok. Kural 14 ayrı kayıt numarası istiyor.
- **Kanıt:** [:197-198](../standards/rehber-yazisi-standard.md#L197) · [:244](../standards/rehber-yazisi-standard.md#L244) *"önizleme bağlantısı (R5.6)"* · [:29](../standards/rehber-yazisi-standard.md#L29) *"Yayın, R8'deki kapılar kendi PR'larında doğmadan yapılmaz"* · [rehber-denetim.mjs:14](../../scripts/rehber/rehber-denetim.mjs#L14) · prod: rehber/yazı tablosu sorgusu → `[]`.
- **Kural:** CLAUDE.md kural 14 (ayrı kayıt numarası), kural 1 (plan cetveli gösterir); R4.8.
- **Düzeltme (tek satır):** Yeni "R10 — Tablo gelene kadar (F4)" satırı: "Taslak, iddia tablosu, betik çıktıları ve sha256 REC-369'un alt kaydında **Linear eki** olarak tutulur (depoya girmez). Recep'e önizleme yerine sha256'lı özet + Linear ekindeki render gider. Onay 'yayın kuyruğu' anlamına gelir; yayın migration (REC-___), rota (REC-___) ve önizleme (REC-___) inince ve sha256 değişmemişse yapılır."

### T2-12 · Sabotaj tuzakları LLM katmanını sınamayabilir; 3a eşlemesinin yöntemi yok — **Orta**

- **Bulgu:** 3e'nin örnek tuzakları (yanlış sayı, yanlış kaynak sayfası, bayat alıntı, desteksiz olumsuz iddia) bir sıraya konmuyor. Üç tuzağın üçü de 3b/3c'nin belirlenimci olarak yakalayacağı türdense (yanlış sayfa → alıntı bulunamaz; numarasız cümle → 3b), "N/N yakalandı" LLM doğrulayıcının (3d) körlüğü hakkında **hiçbir şey** söylemez. Bu turun asıl dersi olan "alıntı var ama iddia bayat ya da bağlamı yanlış" sınıfı, tam olarak betiklerden geçen sınıftır. Ayrıca 3a'da "eşlenmeyen iddia = 0" ölçütünü kimin, hangi kuralla eşlediği yazılı değil. İki LLM listesinin tanecikliği farklı olacağı için ölçüt öznel kalır.
- **Kanıt:** [:218](../standards/rehber-yazisi-standard.md#L218) · [:214](../standards/rehber-yazisi-standard.md#L214). Envanterdeki alıntı betiği ölçümü: *"5 Google alıntısı → GECTI 2 · INCELE 3"* ([arac-envanteri-2026-09-07.md:395](arac-envanteri-2026-09-07.md#L395)). Betik bayatlığı yargılamıyor, 3d'ye bırakıyor.
- **Kural:** vitrin-metni K9.7 (sabotaj, sınanan katmanı kör olmadığını göstermelidir); rendering-cache §3 dersi.
- **Düzeltme (tek satır):** "Tuzakların en az biri 3b/3c'den **geçen** türdendir: alıntı kaynakta birebir var ama iddia bağlamı (model ↔ seri) ya da güncelliği yanlış. 3a eşlemesi iddia tablosunun satır kimliğiyle yapılır; eşlenmeyen satırlar listelenip BLOG tarafından tek tek kapatılır."

### T2-13 · Migration ve rota PR'ında doğacak kapılar, PR üzerinde boşa koşar — **Orta**

- **Bulgu:** (a) "Ziyaretçi rolü" kapısı migration PR'ında doğuyor. DB nöbetçileri CI'da **prod** bağlantısıyla koşuyor (`SUPABASE_DB_URL`). Migration merge edilmeden (kural 13: merge = prod) tablolar prod'da yok, dolayısıyla PR üzerindeki koşum ölçecek bir şey bulamaz. İlk gerçek ölçüm merge'ten, yani prod'a uygulamadan **sonra** olur. (b) "Sunucu HTML" kapısı rota PR'ında doğuyor. SSR kuralları temsilci adresi **site haritasından** seçiyor. Yayında yazı yokken rehber sınıfının temsilcisi yok; sınıf "atlananlar"a düşüyor ve kırmızı yanmıyor. İlk yazı R4.8 yüzünden test amaçlı yayınlanamaz. İki kapı da "doğduğu PR'da sabotajla kırmızı yanar" ölçütünü karşılayamaz.
- **Kanıt:** [:320-321](../standards/rehber-yazisi-standard.md#L320) · [db-advisor.yml:376-383](../../.github/workflows/db-advisor.yml#L376) (`SUPABASE_DB_URL` ile `anon-yazma-nobetcisi.mjs`) · [ssr-kurallari.ts:13](../../tests/smoke/ssr-kurallari.ts#L13) *"SLUG'LAR SABİT YAZILMAZ — SITEMAP'TEN TÜRETİLİR"* · [:393](../../tests/smoke/ssr-kurallari.ts#L393) *"bulunamayan sınıf `atlananlar`a SEBEBİYLE yazılır"*.
- **Kural:** R8.1 başlığı; CLAUDE.md kural 13, 14.
- **Düzeltme (tek satır):** "Ziyaretçi rolü kapısı migration PR'ında Supabase dalında (branch DB) sabotajla koşar; prod kolu ilk yayından önce master'da yeşil olmalıdır. Sunucu HTML kapısı rota PR'ında DB'siz bir fikstür yazıyla derleme anında koşar; rehber sınıfı site haritasında 0 adres verirse ilk yayından sonra KIRMIZI yanar."

---

## 5. Sonuç

**Genel hüküm: KOŞULLU.**

v0.1'in BLOK gerekçeleri (tablo dışı iddia, bayat alıntı, "otomatik" kapı, yanlış sayımlar, önizleme ve durum boşlukları) v0.2'de metin düzeyinde kapandı. 35 kalemin 20'si tam, 14'ü kısmen karşılandı; karşılanmayan kalem yok. Dört Google alıntısının dördü de ham HTML'de doğrulandı ve tarihleri doğru. Bot karnesinin beş sayısı yeniden koşumda birebir çıktı.

Buna karşılık v0.2 **dört yeni Yüksek bulgu** getiriyor. Tuzaklı metinle yayınlanan metnin sha256'sı ayrışıyor (T2-1). R2.2 ile R2.4 aynı kaynağa iki ayrı hüküm veriyor (T2-2). İçerik kapılarının hiçbiri yayın geçişine bağlı değil (T2-3). F4'ün kayıt yeri, önizlemesi ve sırası tanımsız (T2-4). Ayrıca cetvelin "ölçüldü" dediği bir olgu yanlış: sayılar ziyaretçiye görünmüyor ve gizli risk yazılmamış (T2-5). Bu, v0.2'nin kendi K4.1 iddiasını çürütüyor.

**Koşullar:**
1. Cetvel **TASLAK olarak** birleştirilebilir. Yalnız belge değişiyor, canlıya dokunmuyor.
2. **F4'ün ilk doğrulama turu**, T2-1, T2-2, T2-3 (en az metin düzeyinde: "geçiş kayda bağlıdır, kapı migration PR'ında") ve T2-4 cetvele yazılmadan başlamaz. Bu koşul çiğnenirse hüküm **BLOK**'a döner.
3. T2-5'in ara onarımı (kaynaksız `steps`/`pitfalls` sözlükten silinir, `air-curtain` → `hava-perdesi` 308) karar 92 taşımasını beklemez. Müşteriye görünen kusur onarımdır, karar değildir.
4. Orta bulgular (T2-6 … T2-13) ilgili PR'ın kabul ölçütüne yazılır. Düşük bulgular (T2-14 … T2-20) v0.3'te tek geçişte düzeltilir.

**Sınırlar:** Search Console ve arama önerisi sayılarını yeniden ölçmedim; Linear'daki B sınıfı kayıtla tutarlılıklarını kontrol ettim. Karar 92 ve 93'ün metnini Linear Kararlar belgesinden okumadım; emirde verildiği gibi aldım. `scripts/rehber/` betiklerini denetlemedim; yalnız 4. eksende kanıt olarak okudum.

DURUM: BITTI
