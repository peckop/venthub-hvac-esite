import React from 'react';

/* Teknik tablo: alan · değer · anlam. 16 px kart kabı, başlık satırı --surface-subtle + overline.
 * Değerler Onest 500 + tabular-nums; zebra yok, yalnız 1 px --border-row ayırıcı.
 * K7: değeri boş satır çizilmez; bütün satırlar boşsa bileşen null döner. */
function dolu(v) { return v !== undefined && v !== null && String(v).trim() !== ''; }
export function TeknikTablo({ dil = 'TR', satirlar = [], basliklar, kolonlar = {}, ilkSatirVurgulu = false, style, ...rest }) {
  const gor = satirlar.filter((s) => s && dolu(s.deger));
  if (!gor.length) return null;
  const izgara = (kolonlar.alan || '190px') + ' ' + (kolonlar.deger || '150px') + ' ' + (kolonlar.anlam || 'minmax(0,1fr)');
  const satirS = { display: 'grid', gridTemplateColumns: izgara, gap: '0 var(--space-stack)', padding: '11px 18px' };
  const hucre = { minWidth: 0, overflowWrap: 'anywhere' };
  return (
    <div style={{ background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', overflow: 'hidden', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-caption)', color: 'hsl(var(--text-strong))', ...style }} {...rest}>
      {basliklar && basliklar.length ? (
        <div lang={dil === 'EN' ? 'en' : 'tr'} style={{ ...satirS, padding: '12px 18px', background: 'hsl(var(--surface-subtle))', borderBottom: '1px solid hsl(var(--border-row))', fontSize: 'var(--size-overline)', fontWeight: 'var(--weight-overline)', letterSpacing: 'var(--track-overline)', lineHeight: 'var(--lh-overline)', textTransform: 'uppercase', color: 'hsl(var(--text-muted))' }}>
          {basliklar.map((b, i) => <div key={i} style={hucre}>{b}</div>)}
        </div>
      ) : null}
      {gor.map((s, i) => (
        <div key={i} style={{ ...satirS, borderBottom: i === gor.length - 1 ? 0 : '1px solid hsl(var(--border-row))', background: ilkSatirVurgulu && i === 0 ? 'hsl(var(--surface-inset))' : undefined }}>
          <div style={{ ...hucre, color: 'hsl(var(--text-muted))' }}>{s.alan}</div>
          <div style={{ ...hucre, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{s.deger}</div>
          <div style={{ ...hucre, color: 'hsl(var(--text-body))' }}>{dolu(s.anlam) ? s.anlam : null}</div>
        </div>
      ))}
    </div>
  );
}
