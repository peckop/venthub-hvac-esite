import React from 'react';

/* Pagination — S5 parca/Pagination (DESIGN-MENU) · depo components/ui/Pagination.tsx.
 * kisa (mobil, kart-dili 10-24): "‹ Sayfa 2 / 4 ›". 24 model/sayfa (boyut=24) liste parçalarında (iş emri #5).
 * 44 px oval düğmeler; ilk, son, geçerli ±1 ve aralarda "…". Geçerli sayfa dolu petrol.
 * DS sapması: kaynakta sınırdaki ‹ › opacity 0.4; burada opaklık yerine --border-hairline + --text-muted (opaklık durum anlatmaz). */
export function Pagination({ toplam = 0, boyut = 24, sayfa, onSayfa, kisa = false, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [ic, setIc] = React.useState(1);
  const n = Math.max(1, Math.ceil(toplam / (boyut || 24)));
  const cur = Math.min(n, Math.max(1, sayfa ?? ic));
  if (n <= 1) return null;
  const git = (k) => () => { const y = Math.min(n, Math.max(1, k)); if (sayfa === undefined) setIc(y); onSayfa && onSayfa(y); };
  const set = [...new Set([1, n, cur - 1, cur, cur + 1].filter((k) => k >= 1 && k <= n))].sort((a, b) => a - b);
  const ok = (pasif) => ({ width: 'var(--hedef-min)', height: 'var(--hedef-min)', padding: 0, borderRadius: 'var(--radius-dugme)', border: '1px solid ' + (pasif ? 'hsl(var(--border-hairline))' : 'hsl(var(--border-control))'), background: 'hsl(var(--surface-card))', color: pasif ? 'hsl(var(--text-muted))' : 'hsl(var(--primary-navy))', cursor: pasif ? 'not-allowed' : 'pointer', font: 'inherit', fontSize: '18px' });
  if (kisa) return (
    <nav aria-label={M('t.sayfalar')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'var(--font-sans)', ...style }}>
      <button type="button" onClick={git(cur - 1)} disabled={cur === 1} aria-label={M('ds.onceki-sayfa')} style={ok(cur === 1)}>‹</button>
      <span aria-live="polite" style={{ minWidth: '120px', textAlign: 'center', fontSize: '15px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{M('ds.sayfa-n', { n: cur, N: n })}</span>
      <button type="button" onClick={git(cur + 1)} disabled={cur === n} aria-label={M('ds.sonraki-sayfa')} style={ok(cur === n)}>›</button>
    </nav>
  );
  const out = [];
  set.forEach((k, i) => {
    if (i && k - set[i - 1] > 1) out.push(<span key={'b' + k} aria-hidden="true" style={{ minWidth: '24px', textAlign: 'center', color: 'hsl(var(--text-body))' }}>…</span>);
    const on = k === cur;
    out.push(<button key={k} type="button" onClick={git(k)} aria-current={on ? 'page' : undefined} style={{ minWidth: 'var(--hedef-min)', height: 'var(--hedef-min)', padding: '0 10px', borderRadius: 'var(--radius-dugme)', border: '1px solid ' + (on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--text-strong))', font: 'inherit', fontWeight: 600, fontVariantNumeric: 'tabular-nums', cursor: 'pointer' }}>{k}</button>);
  });
  return (
    <nav aria-label={M('t.sayfalar')} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'var(--font-sans)', ...style }}>
      <button type="button" onClick={git(cur - 1)} disabled={cur === 1} aria-label={M('ds.onceki-sayfa')} style={ok(cur === 1)}>‹</button>
      {out}
      <button type="button" onClick={git(cur + 1)} disabled={cur === n} aria-label={M('ds.sonraki-sayfa')} style={ok(cur === n)}>›</button>
    </nav>
  );
}
