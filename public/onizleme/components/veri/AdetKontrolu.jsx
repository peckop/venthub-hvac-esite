import React from 'react';

/* Adet kontrolü: oval, 44 px yükseklik, düğmeler 44×44. Kenar 1 px --border-control.
 * Sınırda düğme devre dışı: --text-muted (5.93) — opaklık kullanılmaz. Değer tabular-nums. */
export function AdetKontrolu({ deger, varsayilan = 1, min = 1, max = 999, adim = 1, onDegisim, etiket = 'Adet', style, ...rest }) {
  const [ic, setIc] = React.useState(varsayilan);
  const kontrollu = typeof deger === 'number';
  const v = kontrollu ? deger : ic;
  const yaz = (n) => { const y = Math.min(max, Math.max(min, n)); if (!kontrollu) setIc(y); if (onDegisim) onDegisim(y); };
  const dugme = (pasif) => ({
    width: '44px', height: '44px', flexShrink: 0, border: 0, borderRadius: 'var(--radius-dugme)', background: 'transparent',
    color: pasif ? 'hsl(var(--text-muted))' : 'hsl(var(--primary-navy))', fontFamily: 'var(--font-sans)', fontSize: '20px', fontWeight: 500,
    lineHeight: 1, cursor: pasif ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitAppearance: 'none'
  });
  return (
    <div role="group" aria-label={etiket} style={{ display: 'inline-flex', alignItems: 'center', height: '44px', boxSizing: 'border-box', border: '1px solid hsl(var(--border-control))', borderRadius: 'var(--radius-dugme)', background: 'hsl(var(--surface-card))', ...style }} {...rest}>
      <button type="button" aria-label="Azalt" disabled={v <= min} onClick={() => yaz(v - adim)} style={dugme(v <= min)}>−</button>
      <input aria-label={etiket} inputMode="numeric" value={v} onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, ''), 10); if (!isNaN(n)) yaz(n); }}
        style={{ width: '40px', border: 0, background: 'transparent', textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body)', fontWeight: 600, color: 'hsl(var(--text-strong))', fontVariantNumeric: 'tabular-nums', outline: 'none', padding: 0 }} />
      <button type="button" aria-label="Artır" disabled={v >= max} onClick={() => yaz(v + adim)} style={dugme(v >= max)}>+</button>
    </div>
  );
}
