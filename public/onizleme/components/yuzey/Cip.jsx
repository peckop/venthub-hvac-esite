import React from 'react';

/* Çip (kılavuz G): tıklanır, oval; 36 px görünür, basılan alan görünmez payla 44 px (basma alanı kuralı, Recep 10-23). Seçilmemiş: --p2-tint zemin + petrol etiket (8.94 civarı).
 * Seçili: dolu petrol + beyaz + ✓ + --shadow-ince. Kiremit çipte yok. */
export function Cip({ children, secili = false, onClick, disabled = false, style, ...rest }) {
  return (
    <button type="button" aria-pressed={secili} onClick={onClick} disabled={disabled} style={{
      position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 14px', boxSizing: 'border-box',
      border: 0, borderRadius: 'var(--radius-dugme)',
      background: secili ? 'hsl(var(--primary-navy))' : disabled ? 'hsl(var(--surface-inset))' : 'hsl(var(--p2-tint))',
      color: secili ? 'hsl(var(--text-on-dark))' : disabled ? 'hsl(var(--text-muted))' : 'hsl(var(--primary-navy))',
      boxShadow: secili ? 'var(--shadow-ince)' : 'none',
      fontFamily: 'var(--font-sans)', fontSize: 'var(--size-caption)', fontWeight: 600, lineHeight: 1.2, whiteSpace: 'nowrap',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background-color var(--hareket-hizli) var(--hareket-egri), color var(--hareket-hizli) var(--hareket-egri)',
      WebkitAppearance: 'none', ...style
    }} {...rest}>
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>
      {secili ? <span aria-hidden="true">✓</span> : null}
      {children}
    </button>
  );
}
