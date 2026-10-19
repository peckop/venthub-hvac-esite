# KURALLAR: ALTYAPI

> Üretilmiştir (`scripts/belge/rol-karti-uret.cjs`); elle düzenleme. Rol kartı: `docs/roller/ALTYAPI.md`. K = tam listedeki madde no; gerekçeli tam metin: `docs/standards/gelistirme-kurallari-tam-liste.md`.

## Departmana özgü iş kuralları (OPS-168)
1. **İzin bloğu.** İş akışına `permissions:` yazılınca `contents: read` ZORUNLUDUR (herkese açık depoda varsayılanlar düşer, yoksa checkout "Repository not found" verir). Ek izin yalnız gerekçeyle yazılır (örnek: dağıtım kapısında `statuses: read`). Kaynak: CLAUDE.md Notlar; `dagitim-hazir.yml` (ALT-82).
2. **Aksiyonlar ve sırlar.** Her `uses:` tam 40 haneli commit'e sabitlenir (sürüm yorumda); `secrets.*`, `self-hosted` ve `pnpm install` yazılmaz (yabancı fork kodu kendi sunucuda çalışır; kurulum yüzeyi büyür). Kaynak: CLAUDE.md (herkese açık depo); `INV-DAGITIM-HAZIR-1` ve `INV-DIZIN-TETIGI-1` bunu ölçer.
3. **Tetik seçimi birleşmeyi belirler.** Birleşmeyi BLOKLAMAYACAK kapıya `pull_request` tetiği yazılmaz: birleştirme ritüeli zorunlu çekirdeği `pull_request` tetikli, `paths`/`if` süzgeçsiz işlerden türetir; zorunlu çekirdeğe girecek işe `if:` ya da `paths:` konmaz. Kaynak: `merge-ritueli.cjs` türetme başlığı; ALT-82 (#1963).
4. **`deployment_status` süzgeci.** Olay her ortam ve her durum için gelir; işe iş düzeyinde `environment == 'Production'` ve `state == 'success'` süzgeci yazılır, `schedule` ve elle tetik için `event_name != 'deployment_status'` kolu eklenir; ortam adı canlıdan ölçülür (16 Ekim: son 12 dağıtımın 12'si `Production`). Kaynak: ALT-91 (#1976).
5. **Önbellekli taban.** `actions/cache` anahtarı değişmez: `cache/restore` ve `cache/save` ayrı adımlar, anahtar `run_id` + `run_attempt`, `restore-keys` önek; kaydetme adımı `always()`. Veri depo DIŞINDA (`runner.temp`) durur. Taban kaybolursa sessiz yeşil değil açık `::warning`. Kaynak: ALT-91 tasarımı; `INV-DIZIN-TETIGI-1` davranış senaryoları.
6. **Aynı PR'da üç parça.** Yeni iş akışı ya da kapı betiği tek PR'da şunlarla gelir: sabotajlı test, `test-haritasi.json` satırı (`test-haritasi-uret.cjs --yalniz <test>`) ve araç envanteri satırı (PR sahibi ekler, ARAÇ okur; satırsız PR `INV-ARAC-1` "YENİ n" ile kırmızıdır). Kaynak: #1963, #1976; OPS-168 O4.
7. **Ortak dosya ve çakışma.** Araç envanteri ve `test-haritasi.json`'a dokunan PR'lar SIRAYLA birleşir. PR dalı master'la çakışırsa master dala MERGE edilir ve normal push yapılır (zorla itme izni yoktur). Kaynak: 16 Ekim üç çakışma (#1963 iki kez, #1976 bir kez).
8. **Done kanıtı ve doğrulayıcı.** Kanban `command` kontrolünde `pnpm` komutu doğrulayıcıda reddedilir (`pnpm exec` kısıtlı), `file_matches` ANA klasörü okur: önce `ana-agac-tazelik.cjs --ileri-sar`. Canlıya etkili iş akışı/kapı işinde `altyapi-curutucu` varsayılandır (O5) ve iş, birleşmeden sonraki İLK gerçek koşu ölçülmeden "Bitti" sayılmaz. Kaynak: ALT-84, ALT-82 Done koşulu.

Genel kurallardan sona alınan: K3, K4, K6, K8, K15, K16, K18, K20, K24, K25, K26, K28 site koduna aittir (ALTYAPI bunlara yalnız inceleyen olarak dokunur); K29, K30, K31 ikinci faz (park). K1 ve K2 yerinde kalır.

## Genel kurallar

- K1 Plan önce: Değişiklikten önce plan çıkar, onay al; plan kendisini hangi cetvelin yönettiğini söyler (dosya adı ya da açıkça "cetvel yok").
- K2 Tip güvenliği: `any` yasak, strict TypeScript.
- K3 RLS-first: Her tablo RLS politikasıyla korunur.
- K4 Monoton durum: Sipariş ve iade durumları yalnız ileri gider, geri dönüş engellenir.
- K6 HMAC: Webhook uçları HMAC-SHA256 ile korunur.
- K8 Replay koruması: Webhook'ta HMAC'e ek olarak zaman damgası (`x-timestamp`) ya da idempotency.
- K15 Önbellek anahtarı: dil: `unstable_cache` anahtar dizisine aktif dil kodu (`lang`) eklenir.
- K16 ISR + webhook: Statik vitrinde görünen her tablonun DB tetiği VE webhook handler dalı olur; HMAC geçince `revalidatePath`/`revalidateTag`; secret yoksa fail-closed (cetvel: `rendering-cache-standard.md` §3).
- K18 Edge dil izolasyonu: Sipariş anında kullanıcı dili (`user_locale`) kaydedilir; e-posta şablonu ürün adını o dile göre süzer.
- K20 CSP 3D CDN: `connect-src` beyaz listesinde `raw.githubusercontent.com` ve `raw.githack.com` kalıcıdır; kaldırmak yasak.
- K24 Tenant izolasyonu: Okuma/yazma, Edge API ve Realtime kanalları tenant-scoped olur; data bleeding kabul edilmez.
- K25 Middleware Edge: `middleware.ts` Edge'de DB sorgusu atmaz; tenant çözümü header/Edge Config ile, URL rewrite yok.
- K26 app_metadata: Yetki kararı `app_metadata` üzerinden verilir; kullanıcının kendi düzenleyebildiği meta veriden asla.
- K28 Önbellek anahtarı: tenant: `unstable_cache`/`revalidateTag` anahtarına `tenantId` de girer (`['key', lang, tenantId]`).
- K29 Tenant-aware iletişim: E-posta logo ve unvanı global `.env`'den değil `tenants.config`'ten gelir. (Faz 2 park: tasarım kuralı, kodda ölçülmedi)
- K30 Storage RLS: Tenant bucket'larında `tenant_id = jwt_tenant_id()` RLS kontrolü. (Faz 2 park: tasarım kuralı, kodda ölçülmedi)
- K31 super_admin pivotu: Çapraz kiracı `super_admin` için 1-N FK yerine `tenant_users` pivot tablosu. (Faz 2 park: tasarım kuralı, kodda ölçülmedi)

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
