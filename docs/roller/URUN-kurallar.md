# KURALLAR: URUN

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/URUN.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

## Departmana özgü iş kuralları (OPS-168)
1. **Servis katmanında DI (Mutlak Kural 2).** `src/lib/services/*` fonksiyonu ilk parametre `supabase` alır, modül düzeyi client yok; her yeni servis için sahte fetch ile süzgeç/hata yolu testi yazılır. Olay: URN-135'te `sessizFanKodlari.service.ts` bu desenle yazıldı, ilk yazımda status/silinmiş süzgeci testle sabitlendi.
2. **Fiyat görünmüyorsa şemada da yok.** Yapısal veride `offers` yalnız vitrinde görünen geçerli fiyat için; teklif kipinde, fiyatsız ya da karışık ailede `ProductGroup/Product/hasVariant/offers` yazılmaz, `CollectionPage` + `ItemList` yazılır; `price: 0`, uydurma `review/aggregateRating` yasak. Olay: REC-111 (80 ürün adresinin 72'sinde gerçek fiyat yayınlandı) ve URN-138 (Search Console KRİTİK, 47 aile / 441 varyant).
3. **`sku` ve model kodu yayınlanmaz kuralı: `INV-SKU-GORUNMEZ-1`.** Varyant SKU'su okunan yer tek modülde kalır; sayfa bileşeninde `variants.map(v => v.sku)` yazılmaz. Olay: URN-135 aile metni ilk sürümü bu kapıyı (bos-sku-render K6) kırmızı verdi.
4. **Ses ve performans sayısı koşulsuz yazılmaz.** Vitrinde dB(A) gibi bir sayı yalnız tek üreticiden (`sesEtiketi`: değer · kademe · ölçüm noktası · mesafe) çıkar; metin dosyasındaki sayı elle yazılmaz, veriden doldurulur. Olay: Design metninde katalogda olmayan 10 ifade vardı, bağımsız doğrulama buldu (URN-135).
5. **İstemci demetine ham veri girmez.** `'use client'` bileşenin import kapanışına büyük veri dosyası ya da veri modülü sokulmaz; veri sunucuda hesaplanıp küçük string/prop olarak geçer; her yeni veri modülü için kapanış testi yazılır. Olay: kategori sayfasına 54 KB veri JSON'u sızdı, doğrulayıcı yakaladı (URN-135, `sesEtiketi.ts` ayrıldı).
6. **Vitrin metni sırası: Design → KATALOG kaynak doğrulaması → ÜRÜN uygulaması (O8).** Katalogda yoksa yazılmaz; düzeltilmiş tek metin kaynağı dosyası tutulur, uygulayıcı oradan okur. Olay: URN-135 (metin md dosyası, yer tutucular veriden).
7. **Migration'lı PR yalnız bu pencerede Recep onayıyla birleşir (Mutlak Kural 13); adres şeması değişikliği tek başına Recep'e sorulur.** Olay: URN-85 (#1802, #1853) migration'ları Recep onayıyla bu pencereden birleşti.
8. **Alt ajan görevine dizin ve dal yazılır, rapor "hangi dizinde, hangi dalda" der; müdür push öncesi `git status`/`git log` ile doğrular.** Bellek düşükken paylaşılan tek kurulu worktree'de iki iş yürütülmez. Olay: URN-138 uygulayıcısı kodu yanlış ağaçta yazdı, yama taşındı.

Genel kurallardan sona alınan: Mevcut OPS-104 "S:0 ayrı sayılır" ve HRT-46 içerik kuralları aynen kalır. K19 ve K20 (3D) 3D departmanına taşındı.

## Genel kurallar

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").
- K2 Tip güvenliği: `any` yasak, strict TypeScript.
- K7 i18n: Kullanıcıya görünen her metin sözlük dosyalarından gelir.
- K9 MVVM/Gateway: UI bileşeni ham veri çekmez (fetch/supabase); veri Gateway kancalarından gelir.
- K10 Design token: Arbitrary Tailwind değeri yasak; değerler `tokens.js`'ten, renk HEX değil CSS custom property (HSL).
- K11 content-auto: Sayfa altı ağır bileşenlerde `.content-auto` zorunlu.
- K12 focus-visible: Etkileşimli elemanlarda `focus:` değil `focus-visible:`.
- K13 Typography prose: Yasal ve bilgi merkezi metin sayfalarında `prose dark:prose-invert max-w-prose` sarmalayıcısı.
- K14 Suspense sınırı: `useSearchParams` kullanan her bileşen `<Suspense fallback={<Skeleton />}>` ile sarılır (sınır yalnız o uç bileşeni sarar).
- K15 Önbellek anahtarı: dil: `unstable_cache` anahtar dizisine aktif dil kodu (`lang`) eklenir.
- K16 ISR + webhook: Statik vitrinde görünen her tablonun DB tetiği VE webhook handler dalı olur; HMAC geçince `revalidatePath`/`revalidateTag`; secret yoksa fail-closed (cetvel: `rendering-cache-standard.md` §3).
- K17 Hreflang: Sitemap ve dinamik rotalarda TR/EN `alternates.languages` saf TypeScript ile üretilir; istemci hook'u yok.
- K21 React Compiler (geçiş, uyarı): Basit bileşende manuel `useMemo`/`useCallback` kısıtlı; Gateway viewmodel ve Provider'lar muaf.
- K22 React.cache (geçiş, katı): RSC ağacında tekrarlanabilen Supabase sorguları `React.cache()` ile tekilleştirilir.
- K27 Feature flag / RSC: Server Component'ta `getTenantConfig()`, Client Component'ta `useTenant()`; RSC'de client hook yok.
- K28 Önbellek anahtarı: tenant: `unstable_cache`/`revalidateTag` anahtarına `tenantId` de girer (`['key', lang, tenantId]`).

## Recep'e mesaj kuralları (ayrıntı; yöneten metin `~/.claude/output-styles/recep.md`)
- Durum mesajı TEK TABLO: `| No: Kanban numarası · karar no | İş | Durum | Önerim | Sorumlu | Sırada |`; onay bekleyenler en üst satırlardır, ayrı tablo yok. Recep'e giden durum cevabı tek tablodur.
- (OPS hariç) tabloya yalnız KENDİ kartların girer; çok departmanlı genel resmi OPS verir; çok elzemse tablo dışında tek cümle hatırlat.
- (OPS hariç) Başka pencereden (OPS dahil) gelen mesajla açılan turda cevap o pencereye SendMessage ile gider, Recep'e ANLATILMAZ; Recep'e görünen metin tek cümle, yalnız kendi kartın (değişen yoksa tablo yok). OPS Recep'e filo durumunu konsolide tabloyla kendisi verir.
- (OPS hariç) Değişen yoksa tablo yok: Recep "devam et" dediğinde ya da durum sorduğunda son rapordan beri kartında değişen yoksa cevap TEK cümledir; bekleyen kartlar her cevapta yeniden dökülmez, tabloya yalnız durumu değişen ya da Recep'in adıyla sorduğu kart girer. İşi kalmayan departman bunu Recep'e değil OPS'a yazar. Recep başka bir departmanı ya da genel durumu sorarsa cevap tek cümle: "Bunu OPS'a iletiyorum, OPS sana toplu durumu verecek".
- İşin başkasını bekliyorsa Sorumlu yine "ben" kalır, Sırada sütununa yalnız "başka bir departmanın işini bekliyor" yaz (adı/işi/sırası yok) (OPS hariç).
- Durum sütunu yalnız şu yedi kelimeden biri: Kırmızı · Onayında · Sürüyor · Sırada · Başlamadı · Beklemede · Bitti. "Bitti" yalnız ölçülmüş işe; "Onayında" yalnız Recep kararı bekleyen iştir (OPS onayı verilmiş, kontrol bekleyen iş "Sürüyor"). Kaydı olmayan iş satıra yazılmaz, önce Kanban kartı açılır.
- Elzem hatırlatma: canlıyı etkileyen ya da Recep'in hemen bilmesi gereken çok elzem durumda tablonun DIŞINDA tek cümle yazılır, ayrıntı karttadır. Tur sonunda "devam edeyim mi" sorma, sırası belli işe geç; tıkanırsan OPS'a yaz.
- 2+ kalem madde işaretli liste olur (tablo dışında, cümle içinde (a) (b) şık dizilmez).
- Compact hazırlığı ("COMPACT YAKIN" uyarısında, compact yapılana kadar her cevapta): cevabın sonuna 3 maddelik liste (durum dosyam güncel mi + dosya adı/saat, yarım iş var mı, hüküm "Şimdi compact yapabilirsin" ya da "X bitince söyleyeceğim"); altına tek kod bloğunda kopyalanabilir `/compact Recep'in son sözlerini aynen koru. Şunları koru: <numara (durum)>, ..., yarım işler (<kısa adlar>). Ayrıntı durum dosyamda. Araç çıktılarını ve eski ölçüm ayrıntılarını at.` satırı.

## Kart planı (karar 241/243)
- Plan karta yazılır (docs/standards/kart-plani-standard.md): konuyu bilmeyenin uygulayabileceği açıklıkta; işi planı yazan değil yeni açılan ekip üyesi yapar; müşteriye görünen, veritabanı ya da site yapısı planı Recep'e tek sayfa özetle OPS'tan gider; planın iskeletinin eksiksizliğini `node scripts/belge/kart-plan-kapisi.cjs --kart <NO>` ölçer.
- Plan, işe başlamadan önce "bu iş daha önce yapıldı mı" aramasını `ÖNCEKİ ÇALIŞMA:` satırında yazar (HRT-26, OPS-30): aranan beş yer (Kanban `search_tasks` Done + arşiv, `git log --all --grep`, `docs/plans` + `docs/audits`, sage, Linear arşivi), `ifade:` ve sonuç (bulunan kart/commit/dosya ya da `yok`); ifadesiz ya da beş yeri anmayan "yok" geçmez, kapı yeni kartta kırmızı verir (cetvel §Önceki çalışma).
- PR başlığında ve gövdesinde kapanmaması gereken Linear numarası (REC-nn) geçmez; yalnız `Kanban: <no>` satırı yazılır (Linear'a bağlı PR birleşince kayıt kendiliğinden Done olur, REC-508 böyle kapandı).

## Çalışan açma (karar 251)
- Salt-okuma çalışan (araştırmacı, çürütücü, doğrulayıcı) `Agent` aracıyla `name` VERİLMEDEN açılır: sonuç doğrudan açana döner ve yazma yasağı ancak böyle işler; yazan uygulayıcı ekip üyesi olarak `name` ile açılır (docs/standards/execution-method-standard.md §10.3).

## Tarayıcı (HRT-61)
- Tarayıcı işinde uygulamanın iki yolundan işe kolay geleni kullanılır: uygulama içi tarayıcı (pencerenin sağ bölmesi; herkese açık sayfa) ya da Chrome eklentisi (claude-in-chrome, oturum adlı sekme grubu; giriş gereken sayfa: Search Console, Bing). Uygulama dışı tarayıcı (Playwright, başsız, kendi başlatılan Chrome) yasaktır; alt ajan görev metnine yazılır.

## Birleştirme ve ölçüm kaydı (HRT-60)
- Kendi PR'ını (migrationsız, edge fonksiyonsuz) kontroller yeşilken `node scripts/hijyen/merge-ritueli.cjs <PR> <dal> --agac=<ağaç> --merge` ile sen birleştirirsin; `gh pr merge` doğrudan çağrılmaz. Kanca ve ayar etkili PR'da (`.claude/hooks`, `scripts/board`, `settings.json`) önce OPS "okundu, uygun" yazar. Migration içeren PR Recep'in sözüyle `--onay` ile birleşir; edge fonksiyonlu PR da Recep'in sözünü bekler (`--onay` yalnız migration içindir); söz işi koşan pencerede geçerlidir (karar 98, 224).
- Çapalı hafıza okunur ve etiketlenir: dosyaya dokunmadan önce kancanın gösterdiği dersi oku; dersi uyguladıysan kart notuna yaz; ders yazarken departman etiketi (`audience.roles`) ve dosya çapası zorunludur (OPS-168 O10).
- Bağımsız doğrulama: canlı yazım betiği, iş akışı ya da kapı, rol kartı üreticisi ve canlıya etkili PR'da doğrulayıcı çalışan varsayılandır. Salt-okuma doğrulayıcı ve çürütücü bellek uyarısında da serbesttir; vitest, tsc, build ve `pnpm install` koşmaz (OPS-168 O5).
- Her ölçüm sonucu tarih ve tazelik süresiyle tek yere yazılır (sage `remember` + `validity` ve `anchor`, ya da ilgili ölçüm defteri): ölçülen şey, tarih, kaynak, ne zaman bayatlar. Bayatlamamış ölçüm tekrarlanmaz; işe başlamadan önce o kayıt aranır.
- Günlük işte Recep'e soru sorulmaz; `docs/standards/filo-tuzugu.md` Madde 2.1'de sayılan Recep kalemleri (`docs/roller/OPS.md` "Recep kapıları" ve ek kalemler: edge fonksiyonlu PR, dış yazışma, ürün kararları, departman açma/kapama) ve izin genişletme dışındaki her onay OPS'a gelir. Otomatik güvenlik kontrolü bir işi reddederse ret metni OPS'a yazılır; Recep'e "şu pencereye şunu yaz" denmez, OPS kalıcı kuralı (`autoMode.allow`) önerir (OPS-169, Recep 16 Ekim).

## Durum dosyası: standart "Yarım iş" satırı (HRT-31)
- Durum dosyasının adı `lane-day`, `state` ya da `durum` içerir (örnek: `<rol>-lane-day-<tarih>.md`, Geo-SEO'da `geoseo-lane-state.md`); kanca dosyayı bu ad kalıbıyla ve frontmatter `metadata.originSessionId` (TAM oturum kimliği) ile bulur. Rolün sürekli dosyası sürdürülür, ortak adla ikinci dosya açılmaz (HRT-61).
- Durum dosyasının SONUNA (DEVİR bloğunun içine) her güncellemede ve compact öncesinde tam bu iki biçimden biri yazılır: `Yarım iş: yok — <kısa>` ya da `Yarım iş: var — <ne>, <ne zaman güvenli>`. Kokpit compact hazırlığı bunu okur; ifade yoksa "ölçülemedi" görünür.
- Kanca dosyanın son 24 KB'ındaki SON `yarım iş yok|var` ifadesini okur: satır en sonda durur, altına aynı ifadeyi taşıyan başka cümle yazılmaz. `yok` derken yarım iş listelenmez; belirsizse `var` yazılır. Ayrıntı AÇIK KUYRUK alanındadır (hafiza-yazma-duzeni-standard §9b madde 7).
- Recep compact hazırlığı istediğinde (ya da "COMPACT YAKIN" uyarısında) üç maddelik not (durum dosyası güncel mi + saat / yarım iş / hüküm) ve iki aşamalı compact cümlesi KENDİ penceresinde Recep'e yazılır; OPS'a yalnız tek satır gider ("hazır" ya da "X bitince hazır"). Notu OPS'a yazıp Recep'e yazmamak kuralı çiğner (OPS 2026-10-05: iki departman bunu yaptı).

## İçerik kuralı (HRT-46)
- Sitede kullanıcıya görünen metinde şirket iddiası (firma, kurum, ekip, kuruluş yılı, referans, "biz" dili) ve reklam dili yazılmaz; tek istisna marka adı VentHub'dır. Cetveller: `docs/standards/rehber-yazisi-standard.md` R4 madde 10, `docs/standards/i18n-localization-standard.md` §4.

## Unvan ve ölçüm kuralları (OPS-104)
- Bayilik unvanı: yazılı distribütörlük ya da yetki sözleşmesi olmayan markanın sitesinde "yetkili bayi", "resmi distribütör", "marka güvencesi" ve "yetkili satış noktası" unvanı yazılmaz; sözleşme netleşince tek satırla geri konur. Yöneten cetvel: docs/standards/vaat-butunlugu-standard.md.
- Ham HTML ölçümünde S:0 kopyası AYRI sayılır: sayfa ham HTML'inde hidden id="S:0" gizli akış bloğunun içindeki metin dış gövdenin ayrı bir kopyasıysa h1, kırıntı ve model bağlantısı sayımı "S:0 dışı" ve "S:0 içi" iki sütunda yazılır, tek toplam verilmez. Aile sayfasındaki ikinci kopya bilinçli fallback'tir (ProductDetailPageView Suspense fallback, URN-25 sonucu) ve kusur sayılmaz; kategori ve ürünler sayfalarında S:0 içi 0 olmalıdır (INV-SSR-GOVDE-2). Ölçüm cetveli docs/standards/geo-olcum-standard.md ve docs/standards/dizin-sistemleri-standard.md başkasının cetvelidir: bu kural onlara atıf verir, onları değiştirmez.
