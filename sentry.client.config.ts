import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isProd = process.env.NODE_ENV === 'production';

if (dsn && !dsn.includes("placeholder")) {
  Sentry.init({
    dsn,
    tracesSampleRate: isProd ? 0.05 : 0,
    replaysSessionSampleRate: isProd ? 0.01 : 0,
    replaysOnErrorSampleRate: isProd ? 0.1 : 0,
    debug: false,
  });
}

