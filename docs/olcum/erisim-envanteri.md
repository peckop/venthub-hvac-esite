# Ölçüm defteri: "Hangi hesaba, anahtara, bağlayıcıya erişimimiz var?"

Sahibi: OPS · Son doğrulama: 2026-09-30 · Kaynak: Recep 09-27 "bir daha sorulmasın" (GEO-SEO erişim envanteri, 09-27 18:40Z ölçümü) + HARİTA 2026-09-30 ölçümü + hafızadaki tarihli kayıtlar

Bu defterin işi tek hatayı önlemek: erişimi zaten olan bir şeyi Recep'e sormak (Bing 09-27, Resend paneli 09-29, Linear anahtarı 09-07 — üçünde de cevap elimizdeydi).

**Kurallar**
1. Bir hesap, panel, anahtar ya da bağlayıcı sorusu açılınca ÖNCE bu defter okunur. Recep'e sorulmadan önce "Kanıt" sütunundaki yolla ölçülür (bağlayıcı, komut, ortam değişkeni adı).
2. **Değer ASLA yazılmaz** (repo public): yalnız ortam değişkeninin ADI ve var/yok bilgisi girer. Ortam ölçümü `powershell [Environment]::GetEnvironmentVariable(ad,'User')` ile yapılır, sonuç yalnız `True/False` basılır.
3. "Recep'e sorulur mu" varsayılanı HAYIR. EVET ise gerekçesi (hangi bağlayıcı ölçemiyor) satırda yazılıdır.
4. Her satırı o hizmetin sahibi pencere ölçer ve tarihi ile kanıtını günceller (yeni dosya açılmaz). Ölçülmemiş satır "ölçülmedi" yazar; tarihsiz kayıt satıra girmez.

## Kod, yayın, veri

| Hizmet | Erişim | Nasıl | Kanıt (nasıl ölçüldü) | Son doğrulama | Recep'e sorulur mu |
|---|---|---|---|---|---|
| GitHub (peckop/venthub-hvac-esite) | Var: okuma, yazma, PR, iş akışı | `gh` komutu, oturum `GH_TOKEN`, kapsam repo · user · workflow | HARİTA `gh auth status`: hesap peckop, kapsam repo/user/workflow | 2026-09-30 | HAYIR. Birleştirme (merge) izin denetiminden geçer; PR'ı birleştirme cümlesi Recep'in (kural 13) |
| Linear | Var: okuma ve yazma | Linear bağlayıcısı; `LINEAR_API_KEY` ortam değişkeni (bağlayıcının yapamadığı arşiv/GraphQL için) | HARİTA: REC-456 kaydı bağlayıcıyla açıldı; ortam değişkeni var (yalnız var/yok ölçüldü) | 2026-09-30 | HAYIR. Ücretsiz plan 250 kayıt, arşivlenen sayılmaz (09-07 ölçümü) |
| Supabase (venthub-hvac-platform) | Var: okuma; yazma yetkisi bu satırda ölçülmedi | Supabase bağlayıcısı; `supabase` komutu; `SUPABASE_ACCESS_TOKEN` ortamda | HARİTA bağlayıcı `list_projects`: proje ACTIVE_HEALTHY, eu-central-1; ortam değişkeni var | 2026-09-30 | HAYIR. Migration'lı dalın birleştirilmesi canlı veritabanına yazar (kural 13) → Recep kapısı |
| Vercel (peckops-projects) | Var: okuma ve dağıtım | Vercel bağlayıcısı; `vercel` komutu (kendi oturumu; `VERCEL_TOKEN` ortamda yok) | HARİTA bağlayıcı `list_teams`: peckops-projects takımı döndü | 2026-09-30 | HAYIR |
| Vercel dal önizlemesi | YOK: dal ya da PR için önizleme adresi üretilmiyor; yalnız master'a birleşince production dağıtımı olur | "Önizlemede ölç" denen her iş (görsel kontrol, bağlantı sayımı, SEO ölçümü) yerel derleme ya da birleşme sonrası canlıda ölçülür | GEO-SEO 09-30: dal `geoseo/rec452-rehber-ic-baglanti` için `list_deployments` 0 kayıt; HARİTA 09-30 `list_deployments` (proje venthub-hvac-esite): dönen son 7 dağıtımın hepsi target=production, ref=master; PR'larda önizleme adresi/durumu yok | 2026-09-30 | HAYIR |
| Sentry (venthub) | Var, canlıda çalışıyor | Sentry bağlayıcısı; canlıda DSN Vercel ortamında | HARİTA `find_organizations`: venthub (de.sentry.io). Canlı çalışma kanıtı OPS 09-07 (Playwright hatası → Sentry, 200). `SENTRY_AUTH_TOKEN` ortamda yok | 2026-09-30 | HAYIR |
| Katalog PDF kaynak dizini | Var, yerel | Kardeş depo `venthub-pdf-ingestor` (`kaynak-dizini/sayfalar.jsonl`); PDF doğrudan taranmaz | Bu oturumun çalışma dizinleri arasında; cetvel catalog-ingestion-standard §6.3 | 2026-09-30 | HAYIR |

## E-posta, ödeme

| Hizmet | Erişim | Nasıl | Kanıt (nasıl ölçüldü) | Son doğrulama | Recep'e sorulur mu |
|---|---|---|---|---|---|
| Gmail (info@venthub.com.tr teslim kontrolü) | Var: arama ve okuma | Gmail bağlayıcısı `search_threads` | OPS kaydı: 09-24 teklif ve 09-26 iade e-postasının kutuya ulaştığı tek aramada görüldü. HARİTA bu oturumda yeniden ölçmedi | 2026-09-29 (kayıt) | HAYIR. Resend paneli sorusu yerine önce Gmail araması |
| Resend | Panel ve API erişimi ölçülmedi; teslim kanıtı var | `RESEND_API_KEY` ortamda YOK (ölçüldü) → API ile ölçülemiyor; teslim Gmail'den ölçülür | HARİTA ortam ölçümü (yok). Alan doğrulaması: satis-hazirligi.md satır 5 "belirsiz" (REC-368); teslim kanıtı yukarıdaki Gmail satırı | 2026-09-30 | HAYIR (önce Gmail). Panel gerçekten gerekirse gerekçe REC-368'e yazılır |
| İyzico | Yalnız sandbox | Sandbox anahtarı; canlı anahtar yok (şirket kurulmadı) | satis-hazirligi.md 09-29: "İyzico sandbox", satış bilerek kapalı | 2026-09-29 | HAYIR. Canlı anahtarı sormuyoruz (Recep 09-29) |
| Twilio (SMS/WhatsApp) | Ölçülmedi | — | — | — | — |

## Arama görünürlüğü ve ölçüm

| Hizmet | Erişim | Nasıl | Kanıt (nasıl ölçüldü) | Son doğrulama | Recep'e sorulur mu |
|---|---|---|---|---|---|
| Google Search Console (`sc-domain:venthub.com.tr`) | Kısıtlı kullanıcı: okuma ve URL Inspection var; site haritası GÖNDEREMEZ (gerek yok, Google sitemap.xml'i kendisi indirir) | Hizmet hesabı, jeton kapsamı webmasters.readonly (`gsc-token.cjs`, `gsc-taban.mjs`, `gsc-url-denetim.mjs`). Anahtar dosyası hizmet hesabı JSON'udur ve depo DIŞINDA durur; betikler ortam değişkeni `GSC_SA_ANAHTAR`'dan okur, değişkenin DEĞERİ o dosyanın YOLUDUR (anahtarın kendisi değil). Pencereye yükleme: pencere açılmadan önce kullanıcı düzeyinde ortam değişkeni (yeni pencere miras alır) ya da Claude Code kullanıcı ayarlarındaki env bölümü; tek seferlik: `GSC_SA_ANAHTAR=<yol> node scripts/gsc/gsc-token.cjs`. Ne yol ne içerik depoya, belgeye, komut geçmişine ya da hafızaya yazılır; kontrol yalnız var/yok | GEO-SEO ölçümü: son sitemap okuması 09-26, hata 0. ALTYAPI 09-30 (kodda): kullanım `gsc-token.cjs:11,44`, `gsc-taban.mjs:10,68`, `gsc-url-denetim.mjs:10`; değişken kabukta, kullanıcı ve makine ortamında, Claude ayar dosyalarında TANIMLI DEĞİL. HARİTA 09-30: `~/.claude/.env.global` içinde iki satır var ama ikisi de yorum satırı (etkin tanım 0); anahtar dosyası diskte VAR (yalnız varlık ölçüldü) → GSC ölçümü çalışır, ama değişken hiçbir pencerede otomatik gelmez, tek seferlik komutla ya da kullanıcı ortamına yol eklenerek verilir | 2026-09-30 (değişken/dosya); 2026-09-27 (yetki kapsamı, GEO-SEO 18:40Z) | HAYIR. "Dizin iste" düğmesi API'de yok; Recep'e elle dizin işi yüklenmez |
| Bing Webmaster Tools | Kurulu (site haritası 29.08'de gönderildi) | Yalnız panel; API anahtarı YOK ve istenmez (AI Performance raporunun API'si yok, Microsoft "tarih yok") | Recep ekran görüntüsü 09-27: gezinme 25.09, 86 URL, Başarılı; API yokluğu GEO-SEO ölçümü | 2026-09-27 | HAYIR. Yeni panel verisi gerekirse tek seferlik görüntü, tekrarlanan CSV istenmez |
| IndexNow | 09-27'de ÇALIŞMIYORDU; sonrası ölçülmedi | Hesap gerekmez; anahtar dosyası `public/` (ÜRÜN alanı), betik `scripts/seo/indexnow-bildir.mjs` | GEO-SEO 09-27: ortamda `INDEXNOW_KEY` yok (HARİTA 09-30: hâlâ yok), `public/<anahtar>.txt` yoktu; düzeltme REC-405 (#1459) | 2026-09-27 | HAYIR |
| PageSpeed Insights | Var | `PAGESPEED_API_KEY` ortam değişkeni | HARİTA ortam ölçümü (var). PSI localhost'u ölçemez | 2026-09-30 | HAYIR |
| Gemini (GEO ölçümü) | Var, kotalı | `GEMINI_API_KEY` ortam değişkeni; aramalı istekte günde yaklaşık 24, 429'da durulur | HARİTA ortam ölçümü (var); kota GEO-SEO ölçümü 09-25/27 | 2026-09-30 | HAYIR |
| Claude (GEO ölçümü, filo işleri) | Abonelik kotası; API anahtarı yok | Claude Code oturumları (filo ortak kotası) | GEO-SEO 09-27 kaydı | 2026-09-27 | HAYIR. Kota onayı OPS'tan |
| Google Ads | Açılıp açılmadığı kayıtlı DEĞİL | — | GEO-SEO 09-27: marka doğrulaması önünde gizlilik politikası adresi yer tutucu (OPS bilgisi) | 2026-09-27 | EVET, gerekçe: hesabın varlığını hiçbir bağlayıcı ölçemez; OPS tek soruyla sorar (karar 102) |

## Bilgi ve araç bağlayıcıları

| Hizmet | Erişim | Nasıl | Kanıt (nasıl ölçüldü) | Son doğrulama | Recep'e sorulur mu |
|---|---|---|---|---|---|
| NotebookLM (dijital ikiz) | `notebooklm` komutu kurulu; MCP bağlantısı 09-30 sabahı KOPUK | `notebooklm login` (kimlik yenileme); doğrulama `notebooklm list` | HARİTA oturum açılışında bağlayıcı hatası `CONNECTION_CLOSED`; komut yolu `~/.local/bin/notebooklm` | 2026-09-30 | HAYIR. Giriş yenilemeyi pencere KENDİ koşar (hafıza nlm-tiki-recep-e-sorulmaz) |
| Claude Design | Var: GitHub okur, canlı siteyi tarayıcıyla açar, Linear okur ve yazar, Supabase tablo/SQL okur (yazma muhtemel, ölçülmedi). NotebookLM ve özel ingestor deposuna erişmez | Design'ın kendi cevabı (Recep iletti) | Ölçüm 2026-09-04, Design'a sorulan 6 soru; brief'lerde Supabase yalnız SELECT kuralı zorunlu | 2026-09-04 | HAYIR. Yetenek beyanından önce bu satır |
| Diğer bağlayıcılar (Google Drive, Claude Docs, Context7, Kernel bulut tarayıcı, Playwright, GitHub bağlayıcısı) | Oturum araç listesinde görünüyor; kullanımı ölçülmedi | Bağlayıcı adları araç listesinden | HARİTA oturum açılışı araç listesi | 2026-09-30 | HAYIR |

## Yeniden ölçme tetikleyicisi
- Bir pencere "erişimim yok" ya da "Recep'ten iste" demek üzereyken: ÖNCE ilgili satırın "Kanıt" yolu koşulur; sonuç satıra tarihiyle yazılır.
- Satırın son doğrulaması 30 günü geçince ya da hizmette değişiklik olunca (anahtar yenileme, hesap açma/kapama) sahibi pencere yeniden ölçer.
- Yeni bir hizmet erişimi açılınca (ör. canlı İyzico, Twilio, Google Ads) aynı gün buraya satır eklenir.
- Ölçülmemiş satırlar: Twilio, IndexNow'un 09-27 sonrası durumu, Supabase yazma yetkisi, diğer bağlayıcıların gerçek kullanımı.
