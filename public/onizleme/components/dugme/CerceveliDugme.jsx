import React from 'react';

/* Çerçeveli düğme (kılavuz G). Oval. İki ton:
 *  petrol — 1.5 px --primary-navy kenar + petrol etiket, 48 px, 15/600 (ana eylemin yanındaki ikinci fiil)
 *  sade   — 1 px --border-control kenar + --text-body, 44 px, 14/500 (karşılaştır, indir, filtre)
 * koyuZemin: alt bilgi bandında --text-on-dark-muted kenar + beyaz etiket. Üstüne gelince (S5 parçaları, karar 21 Ekim) dolu petrol + beyaz etiket, 120 ms. */
export function CerceveliDugme({ children, ton = 'petrol', koyuZemin = false, onClick, href, tam = false, disabled = false, type = 'button', style, ...rest }) {
  const [ust, setUst] = React.useState(false);
  const petrol = ton === 'petrol';
  let kenar = petrol ? '1.5px solid hsl(var(--primary-navy))' : '1px solid hsl(var(--border-control))';
  let renk = petrol ? 'hsl(var(--primary-navy))' : 'hsl(var(--text-body))';
  let zemin = 'hsl(var(--surface-card))';
  if (ust && !disabled && !koyuZemin) { kenar = (petrol ? '1.5px' : '1px') + ' solid hsl(var(--primary-navy))'; renk = 'hsl(var(--text-on-dark))'; zemin = 'hsl(var(--primary-navy))'; }
  if (koyuZemin) { kenar = '1px solid hsl(var(--text-on-dark-muted))'; renk = 'hsl(var(--text-on-dark))'; zemin = ust ? 'hsl(var(--surface-dark-inset))' : 'transparent'; }
  if (disabled) { kenar = '1px solid hsl(var(--border-hairline))'; renk = 'hsl(var(--text-muted))'; }
  const s = {
    display: tam ? 'flex' : 'inline-flex', width: tam ? '100%' : undefined, alignItems: 'center', justifyContent: 'center', gap: 'var(--space-inline)',
    minHeight: petrol ? '48px' : '44px', padding: petrol ? '0 22px' : '0 20px', boxSizing: 'border-box',
    border: kenar, borderRadius: 'var(--radius-dugme)', background: zemin, color: renk,
    fontFamily: 'var(--font-sans)', fontSize: petrol ? 'var(--size-body-small)' : 'var(--size-caption)', fontWeight: petrol ? 600 : 500,
    lineHeight: 1.2, whiteSpace: 'nowrap', textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color var(--hareket-hizli) var(--hareket-egri), color var(--hareket-hizli) var(--hareket-egri), border-color var(--hareket-hizli) var(--hareket-egri)', WebkitAppearance: 'none', ...style
  };
  const ortak = { style: s, onMouseEnter: () => setUst(true), onMouseLeave: () => setUst(false), ...rest };
  if (href && !disabled) return <a href={href} onClick={onClick} {...ortak}>{children}</a>;
  return <button type={type} onClick={onClick} disabled={disabled} {...ortak}>{children}</button>;
}
