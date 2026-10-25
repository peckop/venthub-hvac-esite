import React from 'react';

/* Kart (kılavuz G): beyaz, 1 px --border-hairline, köşe 16 px. Tıklanır kartta üstüne gelince
 * --shadow-kart-hover + 2 px kalkma, 200 ms. Ölçek yok.
 * Ürün kartı: gorsel verilirse --surface-subtle fotoğraf kutusu (--radius-kucuk, kenarsız, görselde --shadow-urun-gorsel).
 * Fotoğraf yoksa kutu kalkar, kart 2 px petrol üst kuralla başlar. Fotoğrafa rozet/yazı bindirilmez. */
export function Kart({ children, gorsel, gorselAlt = '', marka, baslik, ozet, href, onClick, etkilesimli, dolgu, style, ...rest }) {
  const [ust, setUst] = React.useState(false);
  const urun = marka !== undefined || baslik !== undefined || ozet !== undefined || gorsel !== undefined;
  const tik = etkilesimli ?? Boolean(href || onClick);
  const fotoYok = urun && !gorsel;
  const s = {
    display: 'flex', flexDirection: 'column', gap: 'var(--space-grid)', boxSizing: 'border-box', minWidth: 0,
    background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))',
    borderTop: fotoYok ? '2px solid hsl(var(--primary-navy))' : '1px solid hsl(var(--border-hairline))',
    borderRadius: 'var(--radius-kart)', padding: dolgu ?? (urun ? (gorsel ? '10px' : '14px') : 'var(--space-card-loose)'),
    color: 'hsl(var(--text-strong))', textDecoration: 'none', fontFamily: 'var(--font-sans)',
    boxShadow: tik && ust ? 'var(--shadow-kart-hover)' : 'none', transform: tik && ust ? 'translateY(-2px)' : 'none',
    transition: 'box-shadow var(--hareket-normal) var(--hareket-egri), transform var(--hareket-normal) var(--hareket-egri)',
    cursor: tik ? 'pointer' : undefined, ...style
  };
  const ic = (
    <>
      {gorsel ? (
        <div style={{ aspectRatio: '4 / 3', background: 'hsl(var(--surface-subtle))', borderRadius: 'var(--radius-kucuk)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img src={gorsel} alt={gorselAlt} style={{ maxWidth: '78%', maxHeight: '78%', objectFit: 'contain', filter: 'var(--shadow-urun-gorsel)' }} />
        </div>
      ) : null}
      {urun ? (
        <div style={{ padding: gorsel ? '0 4px 4px' : 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {marka ? <div style={{ fontSize: 'var(--size-overline)', fontWeight: 600, color: 'hsl(var(--primary-navy))' }}>{marka}</div> : null}
          {baslik ? <div style={{ fontSize: 'var(--size-body-small)', fontWeight: 600, color: 'hsl(var(--text-strong))' }}>{baslik}</div> : null}
          {ozet ? <div style={{ fontSize: '13px', color: 'hsl(var(--text-muted))', fontVariantNumeric: 'tabular-nums' }}>{ozet}</div> : null}
        </div>
      ) : null}
      {children}
    </>
  );
  const ortak = { style: s, onMouseEnter: () => setUst(true), onMouseLeave: () => setUst(false), onClick, ...rest };
  return href ? <a href={href} {...ortak}>{ic}</a> : <div {...ortak}>{ic}</div>;
}
