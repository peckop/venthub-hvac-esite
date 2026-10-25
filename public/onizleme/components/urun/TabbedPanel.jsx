import React from 'react';

/* TabbedPanel — ürün sayfası altı (Alternatifler 5a · 6a · S5 Öneri). Masaüstü: tek beyaz kart, köşe 24, üstte sekmeler; tek bölüm görünür,
 * öteki bölümler DOM'da kalır (hidden) — arama motoru ve bağlantılar için.
 * Sekme şeridi: dolgu 0 32, gap 32, alt 1 px hairline, 600; sekme dolgu 18 0; etkin 2 px petrol alt çizgi + petrol, öteki text-body. İçerik dolgu 24 32 32.
 * Mobil (6a): 16 px köşeli kart içinde açılır satırlar (52 px, dolgu 0 14, 600, 1 px row ayırıcı, sağda 32 px ⌄ düğme), açılış 280 ms. */
export function TabbedPanel({ bolumler = [], etkin, onEtkin, mobil = false, style }) {
  const gor = bolumler.filter((b) => b && b.icerik !== undefined && b.icerik !== null && b.icerik !== false);
  const [ic, setIc] = React.useState(gor[0] && gor[0].id);
  const [acik, setAcik] = React.useState({});
  if (!gor.length) return null;
  const E = etkin ?? ic;
  const sec = (id) => { if (etkin === undefined) setIc(id); onEtkin && onEtkin(id); };
  if (mobil) {
    return (
      <div style={{ background: 'hsl(var(--surface-card))', borderRadius: 'var(--radius-kart)', border: '1px solid hsl(var(--border-hairline))', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', overflow: 'hidden', ...style }}>
        {gor.map((b, i) => {
          const a = !!acik[b.id];
          return (
            <div key={b.id} id={b.id} style={{ borderTop: i ? '1px solid hsl(var(--border-row))' : 0 }}>
              <button type="button" aria-expanded={a} onClick={() => setAcik((s) => ({ ...s, [b.id]: !s[b.id] }))} style={{ width: '100%', minHeight: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '0 14px', border: 0, background: 'transparent', font: 'inherit', fontWeight: 600, color: 'hsl(var(--text-strong))', textAlign: 'left', cursor: 'pointer' }}>
                <span>{b.baslik}</span>
                <span aria-hidden="true" style={{ flex: 'none', width: '32px', height: '32px', borderRadius: '16px', boxSizing: 'border-box', border: '1px solid ' + (a ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: a ? 'hsl(var(--primary-navy))' : 'transparent', color: a ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', transform: a ? 'rotate(180deg)' : 'none', transition: 'transform var(--hareket-acilis) var(--hareket-egri), background-color var(--hareket-hizli)' }}>⌄</span>
              </button>
              <div style={{ display: 'grid', gridTemplateRows: a ? '1fr' : '0fr', transition: 'grid-template-rows var(--hareket-acilis) var(--hareket-egri)' }}>
                <div style={{ overflow: 'hidden', minHeight: 0 }}><div style={{ padding: '4px 14px 16px' }}>{b.icerik}</div></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ background: 'hsl(var(--surface-card))', borderRadius: 'var(--radius-kart-buyuk)', overflow: 'hidden', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', ...style }}>
      <div role="tablist" style={{ display: 'flex', gap: '32px', padding: '0 32px', borderBottom: '1px solid hsl(var(--border-hairline))', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {gor.map((b) => {
          const on = b.id === E;
          return <button key={b.id} type="button" role="tab" id={'sekme-' + b.id} aria-selected={on} aria-controls={'bolum-' + b.id} onClick={() => sec(b.id)} style={{ flex: 'none', padding: '18px 0', border: 0, borderBottom: '2px solid ' + (on ? 'hsl(var(--primary-navy))' : 'transparent'), marginBottom: '-1px', background: 'transparent', font: 'inherit', fontWeight: 600, color: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--text-body))', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color var(--hareket-hizli), border-color var(--hareket-hizli)' }}>{b.baslik}</button>;
        })}
      </div>
      {gor.map((b) => <div key={b.id} role="tabpanel" id={'bolum-' + b.id} aria-labelledby={'sekme-' + b.id} hidden={b.id !== E} style={{ padding: '24px 32px 32px' }}>{b.icerik}</div>)}
    </div>
  );
}
