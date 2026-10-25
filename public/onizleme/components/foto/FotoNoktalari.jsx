import React from 'react';

/* FotoNoktalari — fotoğraf noktaları (DESIGN-MENU ds-cevap 10-23b madde 1 · Kart Dili Akış). PageCover ve CategoryCard içinde kullanılır.
 * Görünen nokta 6 px (seçili 18×6 petrol hap); diğerleri border-control. Düğme 22×32, basma alanı dolgu + eksi kenar boşluğuyla 44 px yükseklik.
 * Fotoğraf kendiliğinden dönmez; noktanın üzerine gelince ya da basınca seçilir (geçiş çağıranda, 280 ms). */
export function FotoNoktalari({ adet, secili = 0, onSec, etiketler = [], metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  if (!adet || adet < 2) return null;
  return (
    <div role="group" aria-label={M('ds.fotograflar')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      {Array.from({ length: adet }, (_, i) => {
        const on = i === secili;
        const sec = (e) => { e.stopPropagation(); e.preventDefault && e.type === 'click' && e.preventDefault(); onSec && onSec(i); };
        return (
          <button key={i} type="button" aria-label={etiketler[i] || M('ds.n-fotograf', { n: i + 1 })} aria-pressed={on} onClick={sec} onMouseEnter={sec} onFocus={sec} style={{ flex: 'none', width: '22px', height: '44px', margin: '-6px 0', padding: '6px 0', boxSizing: 'border-box', border: 0, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitAppearance: 'none' }}>
            <span aria-hidden="true" style={{ display: 'block', width: on ? '18px' : '6px', height: '6px', borderRadius: '3px', background: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))', transition: 'width var(--hareket-acilis) var(--hareket-egri), background-color var(--hareket-acilis) var(--hareket-egri)' }}></span>
          </button>
        );
      })}
    </div>
  );
}
/* 280 ms geçiş: önce soluklaşır, sonra yeni fotoğraf gelir. */
export function useFotoGecis(n) {
  const [gi, setGi] = React.useState(0);
  const [op, setOp] = React.useState(1);
  const t = React.useRef(null);
  const sec = (i) => {
    if (i === gi || i < 0 || i >= n) return;
    clearTimeout(t.current); setOp(0);
    t.current = setTimeout(() => { setGi(i); setOp(1); }, 140);
  };
  React.useEffect(() => () => clearTimeout(t.current), []);
  return { gi: Math.min(gi, Math.max(0, n - 1)), sec, stil: { opacity: op, transition: 'opacity 140ms var(--hareket-egri)' } };
}
