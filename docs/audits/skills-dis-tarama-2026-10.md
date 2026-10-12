# Aday skill tablosu: WrongStack 1.1.0 paketindeki 78 yeni skill (REC-515, YTN-18, 2026-10-12)

Yazan: YETENEK. Emir: OPS 12 Ekim 14:25. Kurulum YAPILMADI; kurulum ayrı onay ister (dış kod: lisans + güvenlik incelemesi).
Cetvel: `execution-method-standard.md`, `docs/audits/skill-departman-setleri-2026-09-30.md` (set bağları, 35 KB / 8 skill sınırı),
`docs/audits/gstack-skill-envanteri-2026-09-15.md` (lisans/kurulum ölçütü), kapı `INV-SKILL-BAGLI-1`.

## 1. Kapsam ve dürüstlük notu

- **Kaynak:** `@wrongstack/core` 1.1.0 paketinin `skills/` dizini (MIT; paketin `package.json` lisansı). 1.0.26'da 36 skill vardı, 1.1.0'da 114; 78'i yeni, hepsi yerelde okunabilir.
- **Okunan:** her skill için `trigger`/açıklama satırı. **Gövdesi okunanlar:** payments-webhooks, nextjs-modern, web-performance, database-migrations. Diğer adayların gövdesi kurulumdan önce okunur; tablodaki "gövde" sütunu bunu söyler.
- **Yapılmayan:** find-skills / skills.sh üzerinden internet taraması bu belgede YOK. REC-515'in ilk kabulü (her departman için dış arama) bu yüzden **kısmen** karşılanır: kaynak yalnız WrongStack paketidir. İnternet taraması istenirse ayrı iş.
- **Yargı kimin:** "hangi departmana lazım" kararı benim (YETENEK), kullanımla ölçülmüş değil. 10 günlük ölçümde 15 WrongStack skill'inin yalnız ikisi çağrılmıştı (YTN-11); aday sayısını kısa tutmam bu yüzden.

## 2. Ana bulgu: 78'in büyük kısmı bize uymaz

| Küme | Sayı | Gerekçe |
|---|---|---|
| Bizim yığınla örtüşmeyen dil/çerçeve | 21 | angular-modern, astro-modern, dotnet-backend, flutter-mobile, go-services, graphql-development, java-spring, kotlin-android, php-laravel, react-native-expo, rust-systems, sveltekit-modern, swift-ios, vue-nuxt, node-backend, mobile-design, mobile-performance, mobile-release, offline-sync, cloudflare-workers, kubernetes-operations |
| Sunucu/konteyner işletimi (biz Vercel + Supabase'deyiz) | 9 | compose-operations, container-debugging, container-hardening, infrastructure-as-code, linux-service-ops, reverse-proxy-tls, ssh-operations, vps-deploy, remote-debugging |
| Medya/görsel üretim | 11 | algorithmic-art, audio-studio, canvas-design, manim-video, media-production, micro-animation-gif, motion-canvas-video, theme-factory, web-artifacts, brand-guidelines (WrongStack'in kendi markası), design-assets |
| Zaten başka yolla var | 9 | docx, pdf, pptx, xlsx, office-documents (kullanıcı düzeyi eklentiler); webapp-testing, accessibility (kullanıcı düzeyinde var); i18n-localization (bizde `i18n-conventions` VentHub'a özel); threejs-3d (bizde `threejs-webgl-performance`) |
| Başka araca bağlı | 1 | codex-adversarial-review (Codex CLI ister) |
| Uyumsuz | 1 | nextjs-modern (bkz. §4) |
| **Aday** | **26** | §3 |

## 3. Aday tablosu (öncelik sırasıyla)

Öncelik 1 = ihtiyaç gerçek ve bugünkü yığınla uyumlu; 2 = faydalı, ölçüm bekler; 3 = zayıf, şimdilik alma.

| Skill | KB | Departman / çalışan türü | Neden | Bizdeki karşılığı | Öncelik | Gövde |
|---|---|---|---|---|---|---|
| payments-webhooks | 3,3 | SATIS ve EDGE / Uygulayıcı, Doğrulayıcı | Ham gövdede imza doğrulama, atomik tekilleştirme, sıra dışı teslimat, idempotency, "yönlendirme başarısı kanıt değildir" (kural 11 ile aynı ilkeler). Örnek dili Stripe; bizde İyzico: VentHub ek kuralına İyzico eşlemesi yazılır | kural 11 + `supabase-security`; İyzico'ya özel skill yok | 1 | okundu |
| database-migrations | 3,3 | ALTYAPI ve EDGE / Uygulayıcı, Çürütücü | expand/backfill/validate/contract, "down migration veriyi geri getirmez", kilit ve toplu doldurma tahmini; kural 13 (migration = prod) için eksik ayrıntıyı verir | `create-migration` (adlandırma + kural 13 zinciri); bu skill yöntem tarafını tamamlar | 1 | okundu |
| web-performance | 3,1 | URUN ve GEO-SEO / Uygulayıcı, Doğrulayıcı | LCP/INP/CLS eşikleri, "geliştirme sunucusu ölçümü üretim değildir", aynı koşulda önce/sonra; REC-150 tipi ölçüm işlerinin yöntemi | `vercel-react-best-practices` (kural listesi, ölçüm yöntemi yok) | 1 | okundu |
| authentication-sessions | 3,3 | ADMIN ve EDGE / Doğrulayıcı | Hesap/kiracı yetkisi, oturum, passkey; kural 12 (app_metadata) denetiminde ikinci okuma | `supabase-security` | 2 | yalnız açıklama |
| release-rollback | 3,5 | ALTYAPI / Uygulayıcı | Sürüm yükseltme ve geri alma: tam artefakt + veri uyumu | yok (Vercel geri alma elle) | 2 | yalnız açıklama |
| incident-response | 3,3 | ALTYAPI ve OPS / Uygulayıcı | Kesinti sırasında sınırlı değişiklik, zaman çizelgesi kanıtı | yok | 2 | yalnız açıklama |
| backup-recovery | 3,5 | ALTYAPI / Doğrulayıcı | "Yedek var" ile "geri yükleme denendi" ayrımı (Supabase yedekleri) | yok | 2 | yalnız açıklama |
| ci-cd | 3,3 | ALTYAPI / Uygulayıcı | GitHub Actions: "kırmızıyı gizleme", yetkili kontrolü koru; `permissions: contents: read` kuralımızla örtüşür | yok | 2 | yalnız açıklama |
| storage-uploads | 3,3 | ADMIN ve KATALOG / Uygulayıcı | Yükleme meta verisi doğrulama, erişim, yaşam döngüsü (Supabase Storage) | yok | 2 | yalnız açıklama |
| code-quality | 3,0 | ARAC ve HARITA / Uygulayıcı | Knip çıktısı ve ölü kod temizliği; "genel/dinamik giriş noktalarını koru" | bizde `fallow`, `pnpm knip` (komut var, yöntem yok) | 2 | yalnız açıklama |
| visual-regression | 2,9 | TASARIM ve URUN / Doğrulayıcı | Yeniden üretilebilir ekran görüntüsü + gözden geçirilmiş taban çizgisi | `qa`, `design-review` (gstack) kısmen | 2 | yalnız açıklama |
| design-to-code | 3,1 | TASARIM / Uygulayıcı | Figma/ekran görüntüsünü çalışan arayüze çevirme; Claude Design çıktısını koda alma yolu | `venthub-tasarim-dili` (kurallar), `taste-skill` | 2 | yalnız açıklama |
| python-backend | 3,1 | KATALOG / Uygulayıcı | Kardeş depo `venthub-pdf-ingestor` Python; doğrulama, async sınırları, kaynak kapatma | yok | 2 | yalnız açıklama |
| interaction-design | 3,1 | ADMIN / Uygulayıcı | Form, gezinme, kurtarma durumu | `ui-ux-pro-max` | 3 | yalnız açıklama |
| evidence-audit | 15,5 | OPS / Çürütücü | "Çalışan kanıtla yeniden üretilebilen kusur" ilkesi bizimkiyle örtüşür ama 15,5 KB, set bütçesini tek başına yer | `bug-hunter`, `venthub-20-eksen-denetimi` | 3 | yalnız açıklama |
| discernment-nudge | 3,6 | OPS / Çürütücü | Sonuçlu tavsiyede ifade edilmemiş varsayımları açar | `plan-challenger` | 3 | yalnız açıklama |
| doc-coauthoring | 3,6 | HARITA ve BLOG / Uygulayıcı | Büyük belge/tasarım kaydı yazımı | `to-prd`, `sdd` | 3 | yalnız açıklama |
| skill-router | 4,1 | YETENEK | "Hangi skill" yönlendirmesi; bizde `scripts/skills-router.py` ve set belgeleri aynı işi yapıyor | `skills-router.py` | 3 | yalnız açıklama |
| queues-jobs | 3,0 | ALTYAPI / Uygulayıcı | Kuyruk/tekrar semantiği; bizde cron + Edge Function, kuyruk yok | — | 3 | yalnız açıklama |
| realtime-systems | 3,1 | ADMIN / Uygulayıcı | Kimlik doğrulama + yeniden bağlanma; Supabase Realtime kullanımı sınırlı | — | 3 | yalnız açıklama |
| llm-runtime | 3,7 | ARAC / Uygulayıcı | Ajan çalışma zamanı, araç çağrı döngüsü; bizim çalışma zamanımız Claude Code | — | 3 | yalnız açıklama |
| mcp-development | 3,3 | ARAC / Uygulayıcı | MCP sunucusu yazımı | `mcp-builder` (var, daha geniş) | 3 | yalnız açıklama |
| motion-design | 3,3 | TASARIM / Uygulayıcı | Motion/GSAP/CSS animasyon; biz Framer Motion | — | 3 | yalnız açıklama |
| internal-comms | 3,9 | HARITA / Uygulayıcı | Teknik güncelleme, olay incelemesi metni | Recep çıktı stili zaten bağlayıcı | 3 | yalnız açıklama |
| database-development | 3,4 | ALTYAPI / Uygulayıcı | SQL erişimi, işlem, sınırlı sonuç; `supabase` skill'iyle örtüşür | `supabase` | 3 | yalnız açıklama |
| cloud-architecture | 3,5 | ALTYAPI / Araştırmacı | Bulut hizmeti seçimi; karar bizde verildi (Vercel + Supabase) | — | 3 | yalnız açıklama |

## 4. UYUMSUZ: nextjs-modern (alınmaz)

Gövdesi okundu. Skill "en son kararlı sürümü hedefle: Next.js 16.4" der ve "eski ana sürümü önermez" der; bizim yığın Next 15.5 ve
PPR kullanılmıyor (`CLAUDE.md`, ölçüm 2026-08-15). Bu skill bir ajanı bizde bilmeden 16'ya geçiş önerisine iter. Alınırsa
"hedef sürüm: bizdeki kilit dosyası" diye ek kural şart; bu emek 3,0 KB'lık kazancı aşar. Şimdilik **alma**; bizde `react-modern`
ve `venthub-architecture` aynı alanı yönetir.

## 5. Departman başına arama sonucu (REC-515 kabulü, yalnız WrongStack paketi kapsamı)

| Departman | Sonuç |
|---|---|
| ADMIN | authentication-sessions (2), storage-uploads (2), interaction-design (3), realtime-systems (3) |
| ALTYAPI | database-migrations (1), release-rollback (2), incident-response (2), backup-recovery (2), ci-cd (2) |
| ARAC | code-quality (2), mcp-development (3), llm-runtime (3) |
| BLOG | uygun yok. Arama terimleri: editorial, content writing, SEO copy (adaylar yalnız doc-coauthoring, 3) |
| EDGE | payments-webhooks (1), authentication-sessions (2) |
| GEO-SEO | web-performance (1); nextjs-modern uyumsuz |
| HARITA | code-quality (2), doc-coauthoring (3), internal-comms (3) |
| I18N | uygun yok: `i18n-localization` genel kalır, `i18n-conventions` zaten VentHub'a özel |
| KATALOG | python-backend (2), storage-uploads (2) |
| MEVZUAT | uygun yok. Arama terimleri: legal, compliance, KVKK, consumer law (yalnız data-governance var, bizde) |
| OPS | incident-response (2), evidence-audit (3), discernment-nudge (3) |
| SATIS | payments-webhooks (1) |
| TAKIP | uygun yok. Arama terimleri: dashboard, tracking, reporting |
| TASARIM | design-to-code (2), visual-regression (2), motion-design (3); `accessibility` kullanıcı düzeyinde zaten var |
| URUN | web-performance (1), visual-regression (2) |
| YETENEK | skill-router (3, bizim `skills-router.py` ile karşılaştır) |

## 6. Kurulum olursa (onaydan sonra) bedel ve sıra

- Her skill: dizini kopyala + başına "Araç eşlemesi" ve "VentHub ek kuralları" + NOTICE.md satırı + çalışan seti bağı (35 KB / 8 skill sınırı) + `INV-SKILL-BAGLI-1`. Bu belge kurulum değildir.
- Oturum yükü: her skill ~300 karakter açıklama ekler; bütçe 24 KB (`skill-yuku-butcesi`). Öncelik 1'in üçü sığar; hepsi kurulursa bütçe yeniden ölçülür.
- Önerilen ilk dalga: **payments-webhooks, database-migrations, web-performance** (üçü de gövdesi okundu, ihtiyaç gerçek). Beklenen iş: skill başına ~20 dakika (ek kural + set bağı), tek PR.
- Karar: kurulum onayı OPS/Recep'te; hazır paketi ben çıkarırım.
