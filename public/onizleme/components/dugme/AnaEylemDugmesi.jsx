import React from 'react';

/* Sayfanın tek dolu ana eylem düğmesi (kılavuz G). Oval, --action-terracotta-deep #BF5309, beyaz etiket 4.71.
 * Teklif kipinde "Teklif iste", satış kipinde "Sepete ekle"; panel fiili "Ödemeye geç". "Teklif al" yazılmaz.
 * Üstüne gelince yalnız --shadow-ince (seçili düğme gölgesi) 120 ms; renk ve opaklık değişmez. */
export function AnaEylemDugmesi({ children, onClick, href, tam = false, disabled = false, type = 'button', style, ...rest }) {
  const [ust, setUst] = React.useState(false);
  const s = {
    display: tam ? 'flex' : 'inline-flex', width: tam ? '100%' : undefined, alignItems: 'center', justifyContent: 'center', gap: 'var(--space-inline)',
    minHeight: '48px', padding: '0 24px', boxSizing: 'border-box', border: 0, borderRadius: 'var(--radius-dugme)',
    background: disabled ? 'hsl(var(--surface-inset))' : 'hsl(var(--action-terracotta-deep))',
    color: disabled ? 'hsl(var(--text-muted))' : 'hsl(var(--text-on-dark))',
    fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-small)', fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap', textDecoration: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer', boxShadow: ust && !disabled ? 'var(--shadow-ince)' : 'none',
    transition: 'box-shadow var(--hareket-hizli) var(--hareket-egri)', WebkitAppearance: 'none', ...style
  };
  const ortak = { style: s, onMouseEnter: () => setUst(true), onMouseLeave: () => setUst(false), ...rest };
  if (href && !disabled) return <a href={href} onClick={onClick} {...ortak}>{children}</a>;
  return <button type={type} onClick={onClick} disabled={disabled} {...ortak}>{children}</button>;
}
