/* VentHub — Tailwind eşleme parçası (KARAR 405, 21 Ekim 2026).
 * tailwind.config.js içindeki theme.extend'e birleştirilir. Renkler hsl(var(--token) / <alpha-value>).
 * Ham hex yazılmaz. Mevcut gold-accent ve admin ölçekleri DOKUNULMAZ.
 */
const c = (t) => `hsl(var(--${t}) / <alpha-value>)`;
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary-navy': c('primary-navy'), 'brand-cyan': c('brand-cyan'), 'brand-cyan-ink': c('brand-cyan-ink'),
        'action-terracotta': c('action-terracotta'), 'action-terracotta-deep': c('action-terracotta-deep'),
        'accent-air-green': c('accent-air-green'), 'warn-amber': c('warn-amber'),
        'surface-page': c('surface-page'), 'surface-card': c('surface-card'), 'surface-subtle': c('surface-subtle'),
        'surface-inset': c('surface-inset'), 'p2-tint': c('p2-tint'),
        'surface-dark': c('surface-dark'), 'surface-dark-inset': c('surface-dark-inset'),
        'border-control': c('border-control'), 'border-hairline': c('border-hairline'), 'border-row': c('border-row'),
        'text-strong': c('text-strong'), 'text-body': c('text-body'), 'text-muted': c('text-muted'),
        'text-on-dark': c('text-on-dark'), 'text-on-dark-muted': c('text-on-dark-muted'),
      },
      borderRadius: {
        dugme: 'var(--radius-dugme)', kart: 'var(--radius-kart)', 'kart-buyuk': 'var(--radius-kart-buyuk)',
        kucuk: 'var(--radius-kucuk)', panel: 'var(--radius-panel)',
      },
      boxShadow: {
        ince: 'var(--shadow-ince)', 'kart-hover': 'var(--shadow-kart-hover)', overlay: 'var(--shadow-overlay)',
      },
      dropShadow: { 'urun-gorsel': '0 16px 14px hsl(var(--text-strong) / 0.18)' },
      transitionDuration: {
        hizli: 'var(--hareket-hizli)', normal: 'var(--hareket-normal)', acilis: 'var(--hareket-acilis)', gecis: 'var(--hareket-gecis)',
      },
      transitionTimingFunction: { hareket: 'var(--hareket-egri)', gecis: 'var(--hareket-gecis-egri)' },
      fontFamily: {
        sans: ['Onest', 'system-ui', 'sans-serif'],
        baslik: ['Schibsted Grotesk', 'Onest', 'system-ui', 'sans-serif'],
        wordmark: ['Archivo', 'sans-serif'],
      },
      fontSize: {
        overline: ['var(--size-overline)', { lineHeight: 'var(--lh-overline)', letterSpacing: 'var(--track-overline)', fontWeight: 'var(--weight-overline)' }],
        caption: 'var(--size-caption)', 'body-small': 'var(--size-body-small)', body: 'var(--size-body)', editorial: 'var(--size-editorial)',
      },
      spacing: {
        tight: 'var(--space-tight)', inline: 'var(--space-inline)', grid: 'var(--space-grid)', stack: 'var(--space-stack)',
        card: 'var(--space-card)', 'card-loose': 'var(--space-card-loose)', 'page-mobile': 'var(--space-page-mobile)',
        block: 'var(--space-block)', page: 'var(--space-page)',
      },
    },
  },
};
