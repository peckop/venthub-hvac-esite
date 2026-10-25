import React from 'react';

/* Rozet (kılavuz G): tıklanmaz, oval, büyük harf (lang="tr"), 12.5 px 600, 0.06em. Üç sınıf:
 *  nesnel — ürünün taşıdığı belge/değer (IP54, ErP): --p2-tint + --text-body
 *  hukum  — sistemin sözü (Önerilen): petrol + beyaz (8.94)
 *  soluk  — veri yok / edilgen (Arşiv): --surface-inset + --text-muted (5.19)
 * Kiremit rozette yok. Marka ve ürün adı rozete yazılmaz (büyük harfe çevrilmez). */
const SINIF = {
  nesnel: ['--p2-tint', '--text-body'],
  hukum: ['--primary-navy', '--text-on-dark'],
  soluk: ['--surface-inset', '--text-muted']
};
export function Rozet({ children, sinif = 'nesnel', dil = 'TR', style, ...rest }) {
  const [z, m] = SINIF[sinif] || SINIF.nesnel;
  return (
    <span lang={dil === 'EN' ? 'en' : 'tr'} style={{ display: 'inline-flex', alignItems: 'center', background: 'hsl(var(' + z + '))', color: 'hsl(var(' + m + '))', borderRadius: 'var(--radius-dugme)', padding: '5px 12px', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-overline)', fontWeight: 600, letterSpacing: '0.06em', lineHeight: 1.2, textTransform: 'uppercase', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', ...style }} {...rest}>{children}</span>
  );
}
