import React from 'react';

/* ListToolbar — S5 parca/ListToolbar (DESIGN-MENU, yeni ad). Tek araç çubuğu (karar 7): arama · model sayısı · Sırala · Grupla (kat kapsamında yok) · Liste/Kart · Sütunlar.
 * Seçiciler oval 44 px; görünüm düğmeleri 44 px oval, seçili dolu petrol. Arama "Model, kod ya da seri ara" (onArama verilince). Sütunlar: ModelRow değer sütunlarını ekler/çıkarır.
 * Mobilde etiketler gizlenir, seçiciler tam satır. */
const IKON = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
export function ListToolbar({ sayi = 0, kapsam = 'dal', sira, onSira, grup, onGrup, gorunum, onGorunum, arama, onArama, sutunlar, onSutunlar, mobil = false, metin, yerel = 'tr-TR', style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [icQ, setIcQ] = React.useState('');
  const [sutAcik, setSutAcik] = React.useState(false);
  const Q = arama ?? icQ;
  const aramaVar = arama !== undefined || typeof onArama === 'function';
  const [icSira, setIcSira] = React.useState('seri');
  const [icGrup, setIcGrup] = React.useState(kapsam === 'kat' ? 'yok' : 'seri');
  const [icGor, setIcGor] = React.useState('liste');
  const S = sira ?? icSira, G = grup ?? icGrup, V = gorunum ?? icGor;
  const SIRA = [['seri', M('t.seri-ve-boyut')], ['debi-artan', M('t.debi-artan')], ['debi-azalan', M('t.debi-azalan')], ['basinc-azalan', M('t.basinc-azalan')], ['ses', M('t.ses-en-sessizden')], ['guc', M('t.guc-en-dusukten')]];
  const GRUP = [['yok', M('t.gruplama-yok')], ['seri', M('tx.markaKolS')], ['cap', M('js.Çap')], ['devir', M('t.devir')], ['motor', M('t.motor-tipi')]];
  const sel = { minHeight: 'var(--hedef-min)', minWidth: 0, width: mobil ? '100%' : 'auto', padding: '0 36px 0 16px', border: '1px solid hsl(var(--border-control))', borderRadius: 'var(--radius-dugme)', background: 'hsl(var(--surface-card))', font: 'inherit', fontWeight: 600, color: 'hsl(var(--text-strong))', cursor: 'pointer' };
  const lab = { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, fontSize: 'var(--size-caption)', fontWeight: 600, color: 'hsl(var(--text-body))' };
  const et = { display: mobil ? 'none' : 'inline' };
  const gB = (id, ad, liste) => {
    const on = V === id;
    return (
      <button key={id} type="button" title={ad} aria-label={ad} aria-pressed={on} onClick={() => { if (gorunum === undefined) setIcGor(id); onGorunum && onGorunum(id); }} style={{ width: 'var(--hedef-min)', height: 'var(--hedef-min)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: 'var(--radius-dugme)', border: '1px solid ' + (on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))', cursor: 'pointer', transition: 'background var(--hareket-hizli),color var(--hareket-hizli)' }}>
        {liste
          ? <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" style={IKON}><path d="M9 6h11M9 12h11M9 18h11"></path><circle cx="4.5" cy="6" r="1.2"></circle><circle cx="4.5" cy="12" r="1.2"></circle><circle cx="4.5" cy="18" r="1.2"></circle></svg>
          : <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" style={IKON}><rect x="4" y="4" width="7" height="7" rx="2"></rect><rect x="13" y="4" width="7" height="7" rx="2"></rect><rect x="4" y="13" width="7" height="7" rx="2"></rect><rect x="13" y="13" width="7" height="7" rx="2"></rect></svg>}
      </button>
    );
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 14px', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', ...style }}>
      {aramaVar ? (
        <label style={{ order: -1, flex: mobil ? '1 1 100%' : '1 1 260px', maxWidth: mobil ? 'none' : '360px', display: 'flex', alignItems: 'center', gap: '8px', minHeight: 'var(--hedef-min)', padding: '0 14px', boxSizing: 'border-box', border: '1px solid hsl(var(--border-control))', borderRadius: 'var(--radius-dugme)', background: 'hsl(var(--surface-card))' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" style={{ flex: 'none', stroke: 'hsl(var(--text-body))', strokeWidth: 1.8, strokeLinecap: 'round' }}><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg>
          <input value={Q} onChange={(e) => { if (arama === undefined) setIcQ(e.target.value); onArama && onArama(e.target.value); }} placeholder={M('ds.model-kod-ya-da-seri-ara')} aria-label={M('ds.model-kod-ya-da-seri-ara')} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 'var(--size-body-small)', color: 'hsl(var(--text-strong))' }} />
        </label>
      ) : null}
      <span style={{ order: mobil && kapsam === 'kat' ? 2 : 0, flex: mobil ? (kapsam === 'kat' ? '1 1 0' : '1 1 100%') : '1 1 auto', minWidth: 0, fontSize: 'var(--size-body-small)', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{M('ds.n-model', { n: sayi.toLocaleString(yerel) })}</span>
      <label style={{ ...lab, order: 1, flex: mobil ? '1 1 100%' : '0 1 auto' }}><span style={et}>{M('t.sirala')}</span>
        <select value={S} onChange={(e) => { if (sira === undefined) setIcSira(e.target.value); onSira && onSira(e.target.value); }} aria-label={M('t.sirala')} style={sel}>{SIRA.map(([id, ad]) => <option key={id} value={id}>{ad}</option>)}</select>
      </label>
      {kapsam !== 'kat' ? (
        <label style={{ ...lab, order: 2, flex: mobil ? '1 1 0' : '0 1 auto' }}><span style={et}>{M('t.grupla')}</span>
          <select value={G} onChange={(e) => { if (grup === undefined) setIcGrup(e.target.value); onGrup && onGrup(e.target.value); }} aria-label={M('t.grupla')} style={sel}>{GRUP.map(([id, ad]) => <option key={id} value={id}>{ad}</option>)}</select>
        </label>
      ) : null}
      <div role="group" aria-label={M('t.gorunum')} style={{ order: 3, display: 'flex', gap: '6px', flex: 'none', marginLeft: mobil ? 'auto' : 0 }}>{[gB('liste', M('t.liste'), true), gB('kart', M('js.Kart'), false)]}</div>
      {Array.isArray(sutunlar) && sutunlar.length && V === 'liste' ? (
        <div style={{ order: 4, position: 'relative', flex: 'none' }}>
          <button type="button" aria-expanded={sutAcik} onClick={() => setSutAcik((v) => !v)} style={{ minHeight: 'var(--hedef-min)', padding: '0 16px', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--border-control))', background: sutAcik ? 'hsl(var(--p2-tint))' : 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', font: 'inherit', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{M('t.sutunlar')} ⌄</button>
          {sutAcik ? (
            <div role="group" aria-label={M('t.sutunlar')} style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 20, minWidth: '220px', padding: '6px', display: 'flex', flexDirection: 'column', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', boxShadow: 'var(--shadow-overlay)' }}>
              {sutunlar.map((s) => (
                <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: 'var(--hedef-min)', padding: '0 10px', borderRadius: 'var(--radius-kucuk)', fontSize: 'var(--size-body-small)', color: 'hsl(var(--text-strong))', cursor: 'pointer' }}>
                  <input type="checkbox" checked={!!s.secili} onChange={() => onSutunlar && onSutunlar(sutunlar.map((x) => (x.id === s.id ? { ...x, secili: !x.secili } : x)))} style={{ width: '18px', height: '18px', accentColor: 'hsl(var(--primary-navy))' }} />{s.ad}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
