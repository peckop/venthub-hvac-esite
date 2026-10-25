import React from 'react';

/* CutawayView — "İçinde ne var": kesit görseli + numaralı işaretler + kısa açıklama listesi (iş emri #2 · sayfa-sablonu-aile blok 4 · karar 17).
 * Kapalı (varsayılan): tek satır düğme — 96×64 beyaz önizleme · başlık (Schibsted 18/700) + "n parça" (13 text-body) · sağda 36 px "⌄" (44 basılır). Satıra basınca açılır.
 * Açık: masaüstü görsel (beyaz zemin, 16 köşe, hairline) | liste, 1.4fr / 1fr, gap 32; mobilde görsel üstte, liste altta.
 *   İşaret: 28 px petrol daire, beyaz 13/700 numara, 2 px beyaz halka; konum görselin yüzdesiyle. Listede numara + ad (15/600) + açıklama (14 text-body).
 *   Liste satırının üzerine gelince ya da odaklanınca işareti büyür (1.15) ve tersine döner (beyaz zemin, 2 px petrol kenar, petrol numara); kiremit yalnız teklif/sepet eyleminde. İşarete basınca o satır vurgulanır.
 *   Görsele basınca tam ekran: beyaz zemin, görsel sığdırılır, işaretler aynı; sağ üstte 44 px "×", Esc kapatır.
 * Katalog görseli beyaz zeminde (fotoğraf sahnesi gradyanı yok). İşaretsiz ya da görselsiz kesit çizilmez (K7). */
export function CutawayView({ gorsel, alt = '', isaretler = [], baslik, acik, onAcik, mobil = false, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [icA, setIcA] = React.useState(false);
  const [vur, setVur] = React.useState(null);
  const [tam, setTam] = React.useState(false);
  const A = acik ?? icA;
  const koyA = (v) => { if (acik === undefined) setIcA(v); onAcik && onAcik(v); };
  React.useEffect(() => { if (!tam) return; const f = (e) => { if (e.key === 'Escape') setTam(false); }; document.addEventListener('keydown', f); return () => document.removeEventListener('keydown', f); }, [tam]);
  if (!gorsel || !isaretler.length) return null;
  const b = baslik ?? M('ds.icinde-ne-var');
  const isaret = (m, i, buyuk) => { const on = vur === i; return (
    <button key={i} type="button" onClick={(e) => { e.stopPropagation(); setVur(i); }} aria-label={(i + 1) + '. ' + m.ad} style={{ position: 'absolute', left: m.x + '%', top: m.y + '%', width: (buyuk ? 32 : 28) + 'px', height: (buyuk ? 32 : 28) + 'px', margin: buyuk ? '-16px 0 0 -16px' : '-14px 0 0 -14px', padding: 0, borderRadius: '50%', border: 0, boxShadow: on ? 'inset 0 0 0 2px hsl(var(--primary-navy)), 0 0 0 2px hsl(var(--surface-card))' : '0 0 0 2px hsl(var(--surface-card))', background: on ? 'hsl(var(--surface-card))' : 'hsl(var(--primary-navy))', color: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--text-on-dark))', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transform: on ? 'scale(1.15)' : 'none', transition: 'transform var(--hareket-hizli) var(--hareket-egri), background-color var(--hareket-hizli) var(--hareket-egri)' }}>
      <span aria-hidden="true" style={{ position: 'absolute', inset: '-8px' }}></span>{i + 1}
    </button>
  ); };
  const sahne = (buyuk) => (
    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', lineHeight: 0 }}>
      <img src={gorsel} alt={alt} style={{ display: 'block', maxWidth: '100%', maxHeight: buyuk ? 'calc(100vh - 120px)' : 'none', height: 'auto' }} />
      {isaretler.map((m, i) => isaret(m, i, buyuk))}
    </div>
  );
  const liste = (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
      {isaretler.map((m, i) => (
        <li key={i} tabIndex={0} onMouseEnter={() => setVur(i)} onFocus={() => setVur(i)} onMouseLeave={() => setVur(null)} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr)', gap: '12px', padding: '12px 0', borderTop: i ? '1px solid hsl(var(--border-row))' : 0, outline: 'none' }}>
          <span aria-hidden="true" style={{ width: '28px', height: '28px', borderRadius: '50%', background: vur === i ? 'hsl(var(--surface-card))' : 'hsl(var(--primary-navy))', boxShadow: vur === i ? 'inset 0 0 0 2px hsl(var(--primary-navy))' : 'none', color: vur === i ? 'hsl(var(--primary-navy))' : 'hsl(var(--text-on-dark))', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}><b style={{ fontSize: '15px', fontWeight: 600 }}>{m.ad}</b>{m.aciklama ? <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'hsl(var(--text-body))', textWrap: 'pretty' }}>{m.aciklama}</span> : null}</span>
        </li>
      ))}
    </ol>
  );
  return (
    <section style={{ fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', background: 'hsl(var(--surface-card))', borderRadius: 'var(--radius-kart)', border: '1px solid hsl(var(--border-hairline))', overflow: 'hidden', ...style }}>
      <button type="button" onClick={() => koyA(!A)} aria-expanded={A} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '14px', minHeight: '80px', padding: '8px 12px 8px 8px', boxSizing: 'border-box', border: 0, background: 'transparent', font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ flex: 'none', width: '96px', height: '64px', borderRadius: '10px', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src={gorsel} alt="" style={{ maxWidth: '92%', maxHeight: '92%' }} /></span>
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}><b style={{ fontFamily: 'var(--font-baslik)', fontSize: mobil ? '17px' : '18px', fontWeight: 700 }}>{b}</b><span style={{ fontSize: '13px', color: 'hsl(var(--text-body))' }}>{M('ds.n-parca', { n: isaretler.length })}</span></span>
        <span aria-hidden="true" style={{ flex: 'none', width: '36px', height: '36px', boxSizing: 'border-box', borderRadius: '18px', border: '1px solid ' + (A ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: A ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: A ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transform: A ? 'rotate(180deg)' : 'none', transition: 'transform 280ms var(--hareket-egri)' }}>⌄</span>
      </button>
      {A ? (
        <div style={{ display: 'grid', gridTemplateColumns: mobil ? 'minmax(0,1fr)' : 'minmax(0,1.4fr) minmax(0,1fr)', gap: mobil ? '12px' : '32px', alignItems: 'center', padding: mobil ? '0 12px 12px' : '8px 24px 24px' }}>
          <div role="button" tabIndex={0} aria-label={M('ds.tam-ekran-ac')} onClick={() => setTam(true)} onKeyDown={(e) => { if (e.key === 'Enter') setTam(true); }} style={{ textAlign: 'center', cursor: 'zoom-in' }}>{sahne(false)}</div>
          {liste}
        </div>
      ) : null}
      {tam ? (
        <div role="dialog" aria-label={b} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'hsl(var(--surface-card))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: mobil ? '56px 8px 8px' : '56px 40px 40px', boxSizing: 'border-box' }}>
          <button type="button" onClick={() => setTam(false)} aria-label={M('t.kapat')} style={{ position: 'absolute', top: '8px', right: '8px', width: 'var(--hedef-min)', height: 'var(--hedef-min)', border: 0, borderRadius: '22px', background: 'transparent', fontSize: '24px', color: 'hsl(var(--primary-navy))', cursor: 'pointer' }}>×</button>
          {sahne(true)}
        </div>
      ) : null}
    </section>
  );
}
