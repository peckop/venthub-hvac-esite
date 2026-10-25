import React from 'react';
import { KatliCagriSatiri } from '../dugme/KatliCagriSatiri.jsx';

/* FAQ — Sık sorulan sorular (iş emri #11 · Site S5 SSS bloğu, birebir). Kart yok; en çok 760 px.
 * Liste: üstte 1 px --border-hairline, her satırın altında 1 px --border-hairline, gap 0. Satır KatliCagriSatiri (numara 01, 02 …; numarali=false ile numarasız).
 * Başlık #10 madde 5: h2, Schibsted 800, clamp(24, 3vw, 34); ya da dışarıdan (baslik verilmez). Cevabı olmayan soru çizilmez (K7). */
export function FAQ({ baslik, alt, sorular = [], tekAcik = false, ilkAcik = false, numarali = true, dil, style }) {
  const gor = sorular.filter((s) => s && s.soru && s.cevap);
  const [acik, setAcik] = React.useState(ilkAcik && gor[0] ? { 0: true } : {});
  if (!gor.length) return null;
  return (
    <section lang={dil ? String(dil).toLowerCase() : undefined} style={{ width: '100%', maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'var(--font-sans)', ...style }}>
      {baslik || alt ? <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>{baslik ? <h2 style={{ margin: 0, fontFamily: 'var(--font-baslik)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, letterSpacing: '-0.02em', color: 'hsl(var(--text-strong))' }}>{baslik}</h2> : null}{alt ? <span style={{ fontSize: 'var(--size-body-small)', lineHeight: 1.5, color: 'hsl(var(--text-body))', maxWidth: '66ch' }}>{alt}</span> : null}</div> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid hsl(var(--border-hairline))' }}>
        {gor.map((s, i) => <KatliCagriSatiri key={i} no={numarali ? String(i + 1).padStart(2, '0') : undefined} baslik={s.soru} acik={!!acik[i]} onDegisim={(v) => setAcik((o) => (tekAcik ? { [i]: v } : { ...o, [i]: v }))}>{s.cevap}</KatliCagriSatiri>)}
      </div>
    </section>
  );
}
