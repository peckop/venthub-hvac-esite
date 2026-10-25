import React from 'react';
/* KULLANIM DIŞI (iş emri #4): yerini SeriesCard + FamilyHeader aldı. Metin kuralına dönüştürülmedi. */

/* FamilyCard — S5 parca/FamilyCard (DESIGN-MENU) · depo components/products/FamilyCard.tsx.
 * Seri kartı / seri satırı: model sayısı rozeti (p2-tint), marka · kod, ad (h3 18 px), değer aralığı hapları, "Seriyi incele" + ok düğmesi.
 * Üstüne gelince kart gölgesi + 2 px kalkma, ok düğmesi dolu petrol. */
const IKON = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ok = <svg viewBox="0 0 24 24" width="18" height="18" fill="none" style={IKON}><path d="M5 12h14M13 6l6 6-6 6"></path></svg>;

export function FamilyCard({ aile, yerlesim = 'kart', mobil = false, onAc, dil = 'TR', style }) {
  const [hv, setHv] = React.useState(false);
  if (!aile) return null;
  const en = dil === 'EN', T = (a, b) => (en ? b : a);
  const n = aile.modelSayisi || 0, modelSay = n + ' ' + T('model', n === 1 ? 'model' : 'models');
  const degerler = aile.degerler || [];
  const git = () => onAc && onAc(aile.slug);
  const ortak = { role: 'link', tabIndex: 0, 'aria-label': aile.ad + ' · ' + T('seri sayfası', 'series page'), onClick: git, onKeyDown: (e) => { if (e.key === 'Enter') git(); }, onMouseEnter: () => setHv(true), onMouseLeave: () => setHv(false) };
  const okS = { width: 'var(--hedef-min)', height: 'var(--hedef-min)', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--primary-navy))', background: hv ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: hv ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))', transition: 'background var(--hareket-hizli),color var(--hareket-hizli)' };
  const rozet = { display: 'inline-flex', alignItems: 'center', minHeight: '26px', padding: '0 10px', borderRadius: 'var(--radius-dugme)', background: 'hsl(var(--p2-tint))', color: 'hsl(var(--primary-navy))', fontSize: 'var(--size-overline)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };
  if (yerlesim === 'liste') {
    return (
      <div {...ortak} style={{ display: 'grid', gridTemplateColumns: mobil ? '76px minmax(0,1fr) auto' : '96px minmax(0,1fr) auto', alignItems: 'center', gap: '14px', padding: '12px', background: hv ? 'hsl(var(--surface-subtle))' : 'hsl(var(--surface-card))', borderBottom: '1px solid hsl(var(--border-row))', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', transition: 'background var(--hareket-hizli)', minWidth: 0, ...style }}>
        {aile.kapak ? <div style={{ aspectRatio: '1 / 1', borderRadius: 'var(--radius-kucuk)', background: 'hsl(var(--surface-subtle))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src={aile.kapak} alt={aile.ad} loading="lazy" style={{ width: '86%', height: '86%', objectFit: 'contain' }} /></div> : <div style={{ alignSelf: 'stretch', borderTop: '2px solid hsl(var(--primary-navy))' }}></div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
          <span style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', fontSize: 'var(--size-overline)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'hsl(var(--text-body))' }}><span>{aile.marka}</span><span style={{ color: 'hsl(var(--primary-navy))' }}>{modelSay}</span></span>
          <span style={{ fontFamily: 'var(--font-baslik)', fontSize: 'var(--size-body)', fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{aile.ad}</span>
          {degerler.length ? <span style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px', fontSize: 'var(--size-caption)', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{degerler.map((d, i) => <span key={i} style={{ whiteSpace: 'nowrap' }}>{d.e} {d.v}</span>)}</span> : null}
        </div>
        <span aria-hidden="true" style={okS}>{ok}</span>
      </div>
    );
  }
  return (
    <div {...ortak} style={{ height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', boxShadow: hv ? 'var(--shadow-kart-hover)' : 'none', transform: hv ? 'translateY(-2px)' : 'none', transition: 'box-shadow var(--hareket-normal) var(--hareket-egri),transform var(--hareket-normal) var(--hareket-egri)', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', minWidth: 0, ...style }}>
      {aile.kapak ? (
        <div style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 'var(--radius-kucuk)', background: 'hsl(var(--surface-subtle))', overflow: 'hidden' }}>
          <img src={aile.kapak} alt={aile.ad} loading="lazy" style={{ position: 'absolute', inset: '8%', width: '84%', height: '84%', objectFit: 'contain', filter: 'var(--shadow-urun-gorsel)' }} />
          <span style={{ ...rozet, position: 'absolute', top: '10px', left: '10px' }}>{modelSay}</span>
        </div>
      ) : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><div style={{ height: '2px', background: 'hsl(var(--primary-navy))', borderRadius: '2px' }}></div><span style={{ ...rozet, alignSelf: 'flex-start' }}>{modelSay}</span></div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
        <span style={{ display: 'flex', gap: '6px', minWidth: 0, fontSize: 'var(--size-overline)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'hsl(var(--text-body))' }}><span>{aile.marka}</span>{aile.kod ? <><span aria-hidden="true">·</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aile.kod}</span></> : null}</span>
        <h3 style={{ margin: 0, minHeight: '2.5em' /* Recep 10-25: hizalama */, fontFamily: 'var(--font-baslik)', fontSize: 'var(--size-h3)', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.015em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textWrap: 'pretty' }}>{aile.ad}</h3>
      </div>
      {degerler.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{degerler.map((d, i) => <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', minHeight: '28px', padding: '0 10px', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--border-hairline))', fontSize: 'var(--size-caption)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: 'hsl(var(--text-strong))' }}><span style={{ color: 'hsl(var(--text-muted))' }}>{d.e}</span>{d.v}</span>)}</div> : null}
      <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid hsl(var(--border-row))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: 'var(--size-caption)', fontWeight: 600, color: 'hsl(var(--primary-navy))' }}>{T('Seriyi incele', 'View series')}</span>
        <span aria-hidden="true" style={okS}>{ok}</span>
      </div>
    </div>
  );
}
