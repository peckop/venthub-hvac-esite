# syntax=docker/dockerfile:1.7
#
# VentHub — kendi sunucusunda (DigitalOcean + Coolify) çalışan Next.js standalone imajı (ALT-190, OPS-280).
#
# ⚠ DERLEME SUNUCUDA YAPILMAZ: 2 GB RAM `next build` için yetmez. Bu dosya GitHub Actions'ta
# (.github/workflows/yayin-imaji.yml) derlenir, imaj GHCR'a gider; Coolify hazır imajı çeker.
#
# ⚠ SIR YOK: yalnız halka açık NEXT_PUBLIC_* değerleri ARG olarak derlemeye girer (zaten istemci
# paketine gömülürler). Sunucu sırları (JWT_CLAIMS_COOKIE_SECRET, SUPABASE_WEBHOOK_SECRET...)
# imaja GİRMEZ; Coolify çalışma anında ortam değişkeni olarak verir.
#
# Cetvel: docs/standards/barindirma-standard.md (§ kendi sunucu), docs/standards/rendering-cache-standard.md.

ARG NODE_SURUMU=24-bookworm-slim

# ── 1) Derleme ────────────────────────────────────────────────────────────────
FROM node:${NODE_SURUMU} AS derleme
ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH
RUN npm install --global pnpm@10
WORKDIR /uygulama
COPY . .
# `postinstall` tüm tsc'yi koşturur (8 GB); imaj derlemesinde gereksiz — tip denetimini ci.yml yapar.
RUN --mount=type=cache,id=pnpm-magaza,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts --store-dir /pnpm/store

# Halka açık derleme değerleri (istemci paketine gömülür). Boş geçilirse Next varsayılanı kullanır.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SHOP_WHATSAPP
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SHOP_WHATSAPP=$NEXT_PUBLIC_SHOP_WHATSAPP \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION \
    VENTHUB_CIKTI=standalone
RUN node scripts/assert-node-major.mjs && NODE_OPTIONS=--max-old-space-size=8192 pnpm exec next build

# ── 2) Çalıştırma ─────────────────────────────────────────────────────────────
FROM node:${NODE_SURUMU} AS calisma
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
WORKDIR /uygulama
RUN groupadd --system --gid 1001 venthub && useradd --system --uid 1001 --gid venthub venthub
# Standalone çıktı kendi node_modules alt kümesini taşır; static ve public ayrıca kopyalanır.
COPY --from=derleme --chown=venthub:venthub /uygulama/.next/standalone ./
COPY --from=derleme --chown=venthub:venthub /uygulama/.next/static ./.next/static
COPY --from=derleme --chown=venthub:venthub /uygulama/public ./public
# ISR/etiket önbelleği .next/server ve .next/cache altına yazar: kullanıcı yazabilmeli.
RUN mkdir -p .next/cache && chown -R venthub:venthub .next
USER venthub
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
