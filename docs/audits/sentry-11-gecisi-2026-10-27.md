# Sentry 8.55.2 → 11.9.0 geçişi ve kaynak haritası kapatma — ölçüm belgesi, 2026-10-27

Kartlar: ALT-46 (Sentry 11 geçişi) ve ALT-112 (canlıda kaynak haritaları herkese açık). Yazan: ALTYAPI.
Tek PR: iki iş aynı dosyaya (`next.config.mjs`) dokunuyor. `next.config.mjs` ve `src/middleware.ts` URUN alanındadır; PR gövdesinde URUN notu var.

## KAYNAK / CETVEL

- Yöneten cetveller: `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md` (ana sürüm geçişi, §11 kapı), `docs/standards/bagimlilik-kararlari.md` (§6 sürüm tablosu, §7 kabul listesi, §7a orta kayıtlar), `docs/standards/rendering-cache-standard.md` (üretim çıktısı).
- Önceki ölçümler (üstüne kuruldu): `docs/audits/bagimlilik-2026-09-19.md`, `docs/audits/bagimlilik-2026-10-16.md`.
- Tazelik: ölçümler 27 Ekim 2026; kilit dosyası değişince bayatlar.

## 1. Kök sebep (ALT-112)

`next.config.mjs` içinde `withSentryConfig` üç argümanla çağrılıyordu; kurulu 8.55.2 yalnız iki argüman okuyor (`withSentryConfig.js`). Üçüncü bloktaki `hideSourceMaps`, `tunnelRoute`, `disableClientWebpackPlugin` ve `disableServerWebpackPlugin` hiç okunmadı. SDK istemci derlemesini `hidden-source-map` yapıyor ve yüklemeden sonra silme ayarı yoktu; harita dosyaları Vercel'de yayımlandı. Canlı ölçüm: 28 istemci betiğinin 26'sında `.map` dosyası açık.

## 2. Yapılan değişiklikler

| Dosya | Değişiklik |
|---|---|
| `package.json`, `pnpm-lock.yaml` | `@sentry/nextjs` ^8.54.0 → ^11.9.0; `vite` ^6.4.3 → ^6.4.5 (11.9.0 üretim ağacına `vite` çekiyor, 6.4.3 için beş yeni kayıt açılıyordu) |
| `next.config.mjs` | İçe aktarma `@sentry/nextjs/config`; seçenekler tek nesnede; `tunnelRoute: "/monitoring"` artık gerçekten okunuyor; `sourcemaps: { disable: true }`; `webpack.treeshake.removeDebugLogging: true` (eski `disableLogger` yerine); eski `automaticVercelMonitors`, `widenClientBounds`, `hideSourceMaps`, `disable*WebpackPlugin` silindi (11'de yok ya da eskiden de etkisizdi) |
| `src/middleware.ts` | Matcher `/monitoring`'i dışlıyor; yoksa tünel POST'u `/tr/monitoring`'e 307 ile yönleniyor |
| `src/instrumentation.ts` (yeni) | `register()` sunucu ve edge Sentry başlatmasını yükler; `onRequestError` sunucu istek hatalarını iletir |
| `src/instrumentation-client.ts` (yeni), `sentry.client.config.ts` (silindi) | İstemci başlatması taşındı (11 eski dosyayı kullanımdan kaldırılmış sayıyor). Etkisiz replay oranları silindi: `replayIntegration()` hiç eklenmediği için oranlar zaten çalışmıyordu |
| `src/app/global-error.tsx` (yeni) | Kök düzende yakalanmayan çizim hatalarını Sentry'ye bildirir; metin mevcut sözlük anahtarlarından (`common.errorGeneric`, `search.retry`) |
| `.github/dependabot.yml` | `@sentry/*` ana sürüm ertelemesi (karar 17) kaldırıldı; kaldırma şartı oluştu |
| `bagimlilik-denetimi.test.ts`, `e2e-hizli-derleme.test.ts` | Ertelemenin kalktığını ve ana sürüm 11'i doğrular; silinen dosya yerine yeni dosya yüzey listesinde |
| `bagimlilik-kararlari.md` | §6 satırı güncellendi; §7a'daki iki kapanan OpenTelemetry satırı silindi |

Eklenmeyenler (karar gereği): `replayIntegration()` (replay açmak ayrı bir iştir), `sendDefaultPii` satırı ve `beforeSend` ile IP/başlık temizliği (SDK varsayılanı kalır), `SENTRY_AUTH_TOKEN` (Vercel'de yok; token eklemek ayrı karardır).

## 3. Ölçümler

| Ölçüt | Önce (8.55.2) | Sonra (11.9.0) |
|---|---|---|
| `pnpm audit --prod` kayıt sayısı | 13 | 6 |
| Kapanan kayıt | — | 7 (Sentry zinciri: iki OpenTelemetry kaydı dahil) |
| Kalan 6 kayıt | — | `zod` (yüksek, §7 kabulü), `fast-uri` ×4, `postcss-selector-parser` — hiçbiri Sentry zincirinden değil |
| Derlemede istemci `.map` dosyası (`.next/static`) | 223 | 0 |
| Derlemede sunucu `.map` dosyası | 166 | 2 |
| `/monitoring` yeniden yazma kuralı | yok (üçüncü argüman okunmuyordu) | var |
| Kilit dosyasında `@sentry/cli` (kurulumda ikili dosya indiren paket) | var | yok |

Build süresi, GitHub Actions `ci` işi (Test adımı kapalı, elle tetiklenen ölçüm dalları; PR yok):

| Koşu | Dal | `ci` (sn) | Build (sn) |
|---|---|---|---|
| 1 | taban | 249 | 152 |
| 2 | taban | 183 | 109 |
| 3 | taban | 202 | 113 |
| 4 | 11.9.0 | 274 | 183 |
| 5 | 11.9.0 | 283 | 183 |
| 6 | 11.9.0 | 201 | 110 |

Her dalın ilk koşusu önbellek soğuk koştu (taban 152, 11.9.0 için 183 sn). Önbellek ısındıktan sonra Build iki dalda da 109–113 sn: ısınmış koşuda ölçülebilir fark yok. Soğuk koşuda 11.9.0 yaklaşık 30 sn yavaş. Kilit dosyası değiştiği için birleşmeden sonraki ilk `master` koşusu soğuk olacak; sonrakiler ısınmış taban seviyesine döner. Koşu sayısı küçük (3 + 3); sonuç eğilimdir, kesin rakam değildir.

## 4. Bilinen bedeller

- **Yığın izi derlenmiş kodda kalır.** Haritalar Sentry'ye yüklenmiyor (`SENTRY_AUTH_TOKEN` Vercel'de yok, yalnız `SENTRY_DSN` ve `NEXT_PUBLIC_SENTRY_DSN` var), ve canlıda yayımlanmıyor. Sentry'deki hata kayıtlarında kare numaraları küçültülmüş kodu gösterir. Token eklenip yükleme açılırsa (`sourcemaps.disable` kalkar) yığın izleri okunur hale gelir ve istemci haritaları yüklemeden sonra silinir (11 varsayılanı); bu ayrı bir karardır.
- **Sunucu hataları artık Sentry'ye gidiyor.** Öncesinde `sentry.server.config.ts` ve `sentry.edge.config.ts` hiçbir yerden çağrılmıyordu. `src/instrumentation.ts` ile ilk kez başlıyor; Sentry'de yeni türde kayıtlar görünebilir.
- **Ziyaretçi IP adresi.** Sentry olayında `sentry:user` olarak ziyaretçi IP'si görünüyor (VENTHUB-6 ölçümü). Kod tarafı SDK varsayılanında bırakıldı ve Sentry proje ayarı değişmiyor (karar kaydı: ALT-46 kartı, 27 Ekim).

## 5. Kabul ölçüleri (canlıda, birleşmeden sonra)

1. Önceden listelenen 28 istemci betiğinin tamamında `.map` isteği 404 döner.
2. `POST /monitoring` 307 yerine Sentry'ye ulaşır (200).
3. Önizleme ortamından üretilen sunucu hatası Sentry'de görünür (VENTHUB-6 deneme hatasının sunucu eşi).
4. `pnpm audit --prod` 6 kayıt verir; `bagimlilik-denetimi` kapısı yeşil.
5. Dependabot, `@sentry/*` ana sürümlerini normal PR olarak açar.
