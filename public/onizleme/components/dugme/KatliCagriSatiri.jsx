import React from 'react';

/* Katlı çağrı satırı — SSS satırı (iş emri #11 · Site S5 SSS bloğu `gg.sss`, birebir).
 * Kap yok; satır altında 1 px --border-hairline (liste üstü çizgiyi FAQ çizer).
 * Düğme: grid 32px · 1fr · 36px (numarasızda 1fr · 36px), gap 14, en az 64, padding 14 6; üstüne gelince --surface-subtle, 200 ms.
 * Numara: --size-caption (14), tabular, --brand-cyan-ink, aria-hidden (S5'te mono; kuralda mono yok → Onest).
 * Soru: 17/600/1.4, −0.01em, --text-strong, text-wrap pretty. Ok: 36 daire, 1 px border-control; açıkken dolu petrol + beyaz ok; 180°, 260 ms.
 * Gövde: grid-template-rows 0fr↔1fr 280 ms; iç padding 2 56 22 52 (sol 52 = 6 + 32 + 14, soru hizası; numarasızda 6), flex sütun gap 8;
 * cevap --size-editorial (17)/1.6/--text-body, en çok 66ch (S5'te serif; kuralda serif yok → Onest). */
export function KatliCagriSatiri({ baslik, children, no, acik = false, onDegisim, sonSatir = false, style, ...rest }) {
  const [ic, setIc] = React.useState(acik);
  const [ust, setUst] = React.useState(false);
  const kontrollu = typeof onDegisim === 'function';
  const gor = kontrollu ? acik : ic;
  const cevir = () => { if (kontrollu) onDegisim(!acik); else setIc((v) => !v); };
  const numarali = no != null && no !== '';
  return (
    <div style={{ borderBottom: sonSatir === 'yok' ? 0 : '1px solid hsl(var(--border-hairline))', ...style }} {...rest}>
      <button type="button" onClick={cevir} aria-expanded={gor} onMouseEnter={() => setUst(true)} onMouseLeave={() => setUst(false)} style={{ display: 'grid', gridTemplateColumns: numarali ? '32px minmax(0,1fr) 36px' : 'minmax(0,1fr) 36px', alignItems: 'center', gap: '14px', width: '100%', minHeight: '64px', padding: '14px 6px', boxSizing: 'border-box', border: 0, background: ust ? 'hsl(var(--surface-subtle))' : 'transparent', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-sans)', WebkitAppearance: 'none', transition: 'background-color 200ms ease' }}>
        {numarali ? <span aria-hidden="true" style={{ fontSize: 'var(--size-caption)', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--brand-cyan-ink))' }}>{no}</span> : null}
        <span style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '-0.01em', color: 'hsl(var(--text-strong))', textWrap: 'pretty' }}>{baslik}</span>
        <span aria-hidden="true" style={{ width: '36px', height: '36px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + (gor ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), borderRadius: '18px', background: gor ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: gor ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))', transition: 'background-color 200ms ease, border-color 200ms ease, color 200ms ease' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" style={{ display: 'block', stroke: 'currentColor', strokeWidth: 1.5, transform: gor ? 'rotate(180deg)' : 'none', transition: 'transform 260ms ease' }}><path d="M6 9l6 6 6-6"></path></svg>
        </span>
      </button>
      <div style={{ display: 'grid', gridTemplateRows: gor ? '1fr' : '0fr', transition: 'grid-template-rows 280ms ease' }}>
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: numarali ? '2px 56px 22px 52px' : '2px 56px 22px 6px' }}>
            <div style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: 'var(--size-editorial)', lineHeight: 1.6, color: 'hsl(var(--text-body))', maxWidth: '66ch' }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
