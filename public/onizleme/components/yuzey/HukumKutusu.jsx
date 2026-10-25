import React from 'react';

/* Hüküm kutusu (kılavuz G · K31; karar 21 Ekim: S5 ile 4 px): 4 px sol kural + etiket; zemin --surface-subtle, köşe 0 12 12 0.
 * yeter: petrol · sinirda: amber kural · yetmez: kiremit-deep kural + etiket · bilgi: petrol.
 * Yeni renk yok, kiremit dolu zemin olmaz. Verisi olmayan modelde hüküm verilmez. */
const KURAL = { yeter: '--primary-navy', sinirda: '--warn-amber', yetmez: '--action-terracotta-deep', bilgi: '--primary-navy' };
const ETIKET = { yeter: 'Yeter', sinirda: 'Sınırda', yetmez: 'Yetmez', bilgi: 'Bilgi' };
export function HukumKutusu({ hal = 'bilgi', etiket, children, dil = 'TR', style, ...rest }) {
  const k = KURAL[hal] || KURAL.bilgi;
  const e = etiket === undefined ? ETIKET[hal] : etiket;
  return (
    <div role={hal === 'yetmez' || hal === 'sinirda' ? 'alert' : 'status'} lang={dil === 'EN' ? 'en' : 'tr'} style={{
      borderLeft: '4px solid hsl(var(' + k + '))', background: 'hsl(var(--surface-subtle))', borderRadius: '0 var(--radius-kucuk) var(--radius-kucuk) 0',
      padding: '11px 14px', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-caption)', lineHeight: 1.5, color: 'hsl(var(--text-strong))', ...style
    }} {...rest}>
      {e ? <b lang={dil === 'EN' ? 'en' : 'tr'} style={{ textTransform: 'uppercase', color: hal === 'yetmez' ? 'hsl(var(--action-terracotta-deep))' : 'hsl(var(--text-strong))' }}>{e}</b> : null}
      {e ? ' · ' : null}{children}
    </div>
  );
}
