import React from 'react';

/* PqEgriNotu — S5 parca/PqEgriNotu · depo components/products/PqEgriNotu.tsx (ad korunur).
 * ≤3 nokta ya da türetilmiş eğri → "yaklaşık eğri" notu; katalog grafiğinden okunmuş → grafik notu; eğri yoksa hiçbir şey. */
export function PqEgriNotu({ egri, metin, style }) {
  if (!egri) return null;
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const yak = (egri.noktaSay != null && egri.noktaSay <= 3) || egri.kaynakTur === 'turetilmis';
  return (
    <span data-testid={yak ? 'yaklasik-egri-notu' : 'grafik-egri-notu'} style={{ display: 'block', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-caption)', lineHeight: 1.5, color: 'hsl(var(--text-body))', textWrap: 'pretty', ...style }}>
      {yak
        ? M('ds.egri-yaklasik')
        : M('ds.egri-grafikten')}
    </span>
  );
}
