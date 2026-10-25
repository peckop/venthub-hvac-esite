import React from 'react';

/* Karşılaştırma tablosu — satır = alan, kolon = model. 16 px kart kabı, içte yatay kaydırma.
 * Tek grid kap: hücreler doğrudan çocuk, böylece kolonlar satırlar arasında hizalı kalır.
 * K7: en az bir modelde değer varsa satır çizilir; boş hücre boş kalır. Hiç satır yoksa null.
 * Alan kolonu kaydırmada yerinde kalır; sabitKolon=n n'inci modeli de sabitler (--surface-subtle + 1 px --border-control). */
function dolu(v) { return v !== undefined && v !== null && String(v).trim() !== ''; }
export function KarsilastirmaTablosu({ modeller = [], satirlar = [], alanKolonu = '200px', sabitKolon = 0, dil = 'TR', style, ...rest }) {
  const gor = satirlar.filter((s) => s && Array.isArray(s.degerler) && s.degerler.some(dolu));
  if (!modeller.length || !gor.length) return null;
  const sab = Number.isInteger(sabitKolon) && sabitKolon >= 1 && sabitKolon <= modeller.length ? sabitKolon - 1 : -1;
  const ay = '1px solid hsl(var(--border-row))';
  const h = { minWidth: 0, padding: '11px 16px' };
  const alanSabit = { position: 'sticky', left: 0, zIndex: 2 };
  const modelSabit = { position: 'sticky', left: alanKolonu, zIndex: 1, borderRight: '1px solid hsl(var(--border-control))' };
  const c = [];
  c.push(<div key="h" lang={dil === 'EN' ? 'en' : 'tr'} style={{ ...h, ...alanSabit, background: 'hsl(var(--surface-subtle))', borderBottom: ay, fontSize: 'var(--size-overline)', fontWeight: 'var(--weight-overline)', letterSpacing: 'var(--track-overline)', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center' }}>Alan</div>);
  modeller.forEach((m, i) => c.push(<div key={'m' + i} style={{ ...h, background: 'hsl(var(--surface-subtle))', borderBottom: ay, fontFamily: 'var(--font-baslik)', fontWeight: 700, fontSize: 'var(--size-body-small)', ...(i === sab ? modelSabit : null) }}>{m}</div>));
  gor.forEach((s, ri) => {
    const alt = ri === gor.length - 1 ? undefined : ay;
    c.push(<div key={'a' + ri} style={{ ...h, ...alanSabit, background: 'hsl(var(--surface-card))', color: 'hsl(var(--text-muted))', borderBottom: alt }}>{s.alan}</div>);
    modeller.forEach((m, ci) => c.push(<div key={ri + '-' + ci} style={{ ...h, fontWeight: 500, fontVariantNumeric: 'tabular-nums', borderBottom: alt, ...(ci === sab ? { ...modelSabit, background: 'hsl(var(--surface-subtle))' } : null) }}>{dolu(s.degerler[ci]) ? s.degerler[ci] : null}</div>));
  });
  return (
    <div style={{ background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', overflow: 'hidden', ...style }} {...rest}>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', width: 'max-content', minWidth: '100%', gridTemplateColumns: alanKolonu + ' repeat(' + modeller.length + ', minmax(max-content, 1fr))', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-caption)', color: 'hsl(var(--text-strong))' }}>{c}</div>
      </div>
    </div>
  );
}
