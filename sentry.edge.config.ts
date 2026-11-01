import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// ALT-46: bu dosya `src/instrumentation.ts` ile ilk kez çalışıyor. DSN yoksa ya da yer tutucuysa
// başlatma (istemci ile aynı koruma). İzleme oranı üç yerde de 0.05: ücretsiz kota dolarsa hata
// olayları da düşer.
if (dsn && !dsn.includes("placeholder")) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.05,
    debug: false,
  });
}
