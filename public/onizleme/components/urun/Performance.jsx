import React from 'react';
import { PqEgriNotu } from './PqEgriNotu.jsx';

/* Performance — S5 parca/Performance (DESIGN-MENU, yeni ad) · depo components/products/PqEgriNotu.tsx yanında.
 * Ürün sayfası performans bölümü: debi + statik basınç girişi · kademe çipleri (ÖNERİLEN / SINIRDA / YETMEZ) ·
 * P-Q grafiği (seçili kademe 2.5 px petrol, öteki kademeler --border-control, kesikli hat direnci, petrol ihtiyaç noktası,
 * kiremit çalışma noktası, fareyle okuma) · hüküm kutusu · hidrolik veri tablosu · öneri eylemleri.
 * Hesap katalog.js "hesap" ile aynı: sistem eğrisi p = P·(q/Q)² kesişimi; r = q₀ / Q (q₀: kesişim debisi) · r≥1 YETER (r>1,3 büyük) · 0,9≤r<1 SINIRDA · r<0,9 YETMEZ. */
const ara = (pts, x) => { if (!pts || !pts.length) return null; if (x < pts[0][0] || x > pts[pts.length - 1][0]) return null; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; if (x <= x1) return x1 === x0 ? y0 : y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return pts[pts.length - 1][1]; };
const kesisim = (pq, Q, P) => {
  if (!pq || pq.length < 2 || !(Q > 0) || !(P >= 0)) return null; const f = (q) => ara(pq, q) - P * (q / Q) * (q / Q);
  const qMax = pq[pq.length - 1][0]; let a = pq[0][0]; const fa = f(a); if (fa < 0) return { q: a, p: ara(pq, a) };
  const N = 200; for (let i = 1; i <= N; i++) { const b = pq[0][0] + (qMax - pq[0][0]) * i / N, fb = f(b); if (fb <= 0) { let lo = a, hi = b; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; f(m) > 0 ? (lo = m) : (hi = m); } const q = (lo + hi) / 2; return { q, p: ara(pq, q) }; } a = b; }
  return { q: qMax, p: ara(pq, qMax) };
};
const hukum = (r) => r == null ? 'yok' : r >= 1 ? (r > 1.3 ? 'buyuk' : 'yeter') : r >= 0.9 ? 'sinirda' : 'yetmez';
const nice = (m) => { if (!(m > 0)) return 1; const r = m / 5, p = Math.pow(10, Math.floor(Math.log10(r))), f = r / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };

export function Performance({ kademeler: ham = [], ihtiyac, onIhtiyac, kademe, onKademe, egri, seriBuyugu, seriKucugu, yuksekBasinc = [], mobil = false, metin, yerel = 'tr-TR', dil = 'TR', style }) {
  const kutuR = React.useRef(null); const [kutuW, setKutuW] = React.useState(null); /* #10 madde 5: çizim alanı gerçek genişlikte, yazı ve çizgi ölçeklenmez */
  React.useLayoutEffect(() => { const el = kutuR.current; if (!el) return; const f = () => setKutuW(Math.round(el.clientWidth)); f(); const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(f) : null; if (ro) ro.observe(el); return () => ro && ro.disconnect(); }, []);
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [icI, setIcI] = React.useState({ debi: null, basinc: null });
  const [icK, setIcK] = React.useState(null);
  const [hq, setHq] = React.useState(null);
  const kademelerTemiz = ham.map((k) => ({ ad: k.ad, pq: (k.pq || []).slice().sort((a, b) => a[0] - b[0]), pw: (k.pw || []).slice().sort((a, b) => a[0] - b[0]) })).filter((k) => k.pq.length >= 2);
  if (!kademelerTemiz.length) return null;
  const loc = yerel;
  const nf = (v, d) => new Intl.NumberFormat(loc, { maximumFractionDigits: d || 0, minimumFractionDigits: 0 }).formatToParts(Number(v)).map((p) => (p.type === 'group' ? '\u00A0' : p.value)).join(''); /* binlik boşluk (kılavuz) */
  const I = ihtiyac ?? icI;
  const koyI = (y) => { if (ihtiyac === undefined) setIcI(y); onIhtiyac && onIhtiyac(y); koyK(null); };
  const koyK = (k) => { if (kademe === undefined) setIcK(k); onKademe && onKademe(k); };
  const Q = I.debi > 0 ? +I.debi : null, P = I.basinc !== null && I.basinc !== '' && I.basinc >= 0 ? +I.basinc : null;
  const gir = Q != null && P != null;
  const K = kademelerTemiz.map((k, i) => { const x = gir ? kesisim(k.pq, Q, P) : null, r = x ? x.q / Q : null; return { ...k, i, x, r, h: hukum(r) }; });
  const onerilen = gir ? K.findIndex((k) => k.r >= 1) : -1;
  const kd = kademe !== undefined ? kademe : icK;
  const sel = typeof kd === 'number' && K[kd] ? kd : (onerilen >= 0 ? onerilen : K.length - 1), S = K[sel];
  const W = kutuW || (mobil ? 360 : 640), Hh = mobil ? 260 : 330, mL = 52, mR = 14, mT = 14, mB = 34;
  let qM = Math.max(...K.map((k) => k.pq[k.pq.length - 1][0]), Q ? Q * 1.1 : 0), pM = Math.max(...K.map((k) => Math.max(...k.pq.map((p) => p[1]))), P ? P * 1.15 : 0);
  const sx = nice(qM), sy = nice(pM); qM = Math.ceil(qM / sx) * sx; pM = Math.ceil(pM / sy) * sy;
  const X = (q) => mL + (q / qM) * (W - mL - mR), Y = (p) => mT + (1 - p / pM) * (Hh - mT - mB);
  const yol = (pts) => pts.map((p, j) => (j ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(Math.max(0, p[1])).toFixed(1)).join(' ');
  const yIz = [], xIz = [];
  for (let v = 0; v <= pM + 1e-9; v += sy) yIz.push({ y: Y(v), t: nf(v) });
  for (let v = 0; v <= qM + 1e-9; v += sx) xIz.push({ x: X(v), t: nf(v) });
  const egriler = K.map((k) => ({ d: yol(k.pq), on: k.i === sel })).sort((a, b) => a.on - b.on);
  let sistemD = ''; if (gir && P > 0) { const pts = []; for (let j = 0; j <= 40; j++) { const q = qM * j / 40, p = P * (q / Q) * (q / Q); if (p > pM) break; pts.push([q, p]); } sistemD = yol(pts); }
  const KURAL = { yeter: 'hsl(var(--primary-navy))', buyuk: 'hsl(var(--primary-navy))', sinirda: 'hsl(var(--warn-amber))', yetmez: 'hsl(var(--action-terracotta-deep))', yok: 'hsl(var(--border-control))' };
  const qT = (x) => nf(x.q) + ' m³/h · ' + nf(x.p) + ' Pa', yuz = (r) => '%' + nf(r * 100);
  let hk, eylemler = [], veri = [];
  if (!gir) hk = { kural: KURAL.yok, zemin: 'hsl(var(--surface-subtle))', baslik: M('t.calisma-noktasi').trim(), sebep: M('ds.perf-gir') };
  else if (!S.x) hk = { kural: KURAL.yok, zemin: 'hsl(var(--surface-subtle))', baslik: M('t.degerlendirilemedi'), sebep: M('ds.perf-aralik-disi') };
  else {
    const h = S.h, ad = S.ad;
    if (h === 'yeter' || h === 'buyuk') hk = { kural: KURAL.yeter, zemin: 'hsl(var(--surface-card))', baslik: '✓ ' + ad + ' · ' + M('t.yeter'), sebep: M('ds.perf-yeter', { nokta: qT(S.x), yuzde: yuz(S.r) }) };
    else if (h === 'sinirda') hk = { kural: KURAL.sinirda, zemin: 'hsl(var(--surface-card))', baslik: ad + ' · ' + M('t.sinirda'), sebep: M('ds.perf-sinirda', { nokta: qT(S.x), yuzde: yuz(S.r) }) };
    else hk = { kural: KURAL.yetmez, zemin: 'hsl(var(--surface-card))', baslik: '✗ ' + ad + ' · ' + M('t.yetmez'), sebep: M('ds.perf-yetmez', { q: nf(S.x.q), Q: nf(Q), yuzde: yuz(S.r) }) };
    if (h === 'buyuk') { hk.ek = M('ds.perf-buyuk'); const k = seriKucugu && seriKucugu(Q, P); if (k) eylemler.push({ ad: M('ds.seride-kucugu', { ad: k.ad + ' · ' + k.kademe }), f: k.onSec }); }
    if (h === 'sinirda' || h === 'yetmez') {
      if (onerilen >= 0 && onerilen !== sel) eylemler.push({ ad: M('ds.kademe-yeter-gec', { ad: K[onerilen].ad }), f: () => koyK(onerilen) });
      else if (onerilen < 0) {
        const b = seriBuyugu && seriBuyugu(Q, P);
        if (b) eylemler.push({ ad: M('ds.seride-buyugu', { ad: b.ad + ' · ' + b.kademe }), f: b.onSec });
        else { hk.ek = M('ds.seride-model-yok'); yuksekBasinc.forEach((d) => eylemler.push({ ad: M('ds.yuksek-basinc-icin', { ad: d.ad }), f: d.onSec })); }
      }
      const pQ = ara(S.pq, Q); if (pQ != null && pQ > 0 && pQ < P) eylemler.push({ ad: M('ds.basinci-kabul-et', { p: nf(pQ) }), f: () => koyI({ debi: Q, basinc: Math.round(pQ) }) });
    }
    const w = S.pw && S.pw.length ? ara(S.pw, S.x.q) : null;
    veri = [{ e: M('t.debi'), v: nf(S.x.q) + ' m³/h', h: true }, { e: M('t.statik-basinc'), v: nf(S.x.p) + ' Pa', h: true }, { e: M('t.kademe'), v: S.ad, h: false }];
    if (w != null) { veri.push({ e: M('t.emilen-guc'), v: nf(w, 1) + ' W', h: true }); if (S.x.q > 0) veri.push({ e: 'SFP', v: nf(w / (S.x.q / 3600)) + ' W/(m³/s)', h: true }); }
  }
  const gp = hq != null ? ara(S.pq, hq) : null, gezV = hq != null && gp != null;
  const gez = (ev) => { const r = ev.currentTarget.getBoundingClientRect(), vx = (ev.clientX - r.left) / r.width * W, q = (vx - mL) / (W - mL - mR) * qM; setHq(q >= 0 && q <= qM ? q : null); };
  const giris = (et, birim, deger, ornek, f) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 150px', maxWidth: mobil ? '100%' : '220px' }}>
      <span style={{ fontSize: 'var(--size-caption)', fontWeight: 600, color: 'hsl(var(--text-body))' }}>{et}</span>
      <span style={{ display: 'flex', alignItems: 'center', minHeight: 'var(--hedef-min)', border: '1px solid hsl(var(--border-control))', borderRadius: 'var(--radius-kucuk)', background: 'hsl(var(--surface-card))', padding: '0 12px', gap: '6px' }}>
        <input type="text" inputMode="decimal" value={deger == null ? '' : String(deger)} onChange={f} placeholder={ornek} aria-label={et} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 'var(--size-body)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }} />
        <span style={{ fontSize: 'var(--size-caption)', color: 'hsl(var(--text-muted))' }}>{birim}</span>
      </span>
    </label>
  );
  const sayi = (s) => { const t = String(s).replace(',', '.').replace(/[^\d.]/g, ''); return t === '' ? null : parseFloat(t); };
  const notE = egri !== undefined ? egri : { noktaSay: Math.min(...K.map((k) => k.pq.length)), kaynakTur: 'kitapcik_grafik' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', minWidth: 0, ...style }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px' }}>
        {giris(M('t.debi'), 'm³/h', I.debi, '400', (e) => { const v = sayi(e.target.value); koyI({ ...I, debi: v > 0 ? v : null }); })}
        {giris(M('t.statik-basinc'), 'Pa', I.basinc, '150', (e) => { const v = sayi(e.target.value); koyI({ ...I, basinc: v != null && v >= 0 ? v : null }); })}
        {gir ? <button type="button" onClick={() => koyI({ debi: null, basinc: null })} style={{ minHeight: 'var(--hedef-min)', padding: '0 16px', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--border-control))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>{M('t.temizle')}</button> : null}
      </div>
      <div role="radiogroup" aria-label={M('t.kademe')} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {K.map((k) => {
          const on = k.i === sel, et = !gir ? '' : k.i === onerilen ? M('t.onerilen-2') : k.h === 'yetmez' ? M('t.yetmez') : k.h === 'sinirda' ? M('t.sinirda') : '';
          return (
            <button key={k.i} type="button" role="radio" aria-checked={on} onClick={() => koyK(k.i)} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: 'var(--hedef-min)', padding: '0 16px', borderRadius: 'var(--radius-dugme)', border: '1px solid ' + (on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--text-strong))', font: 'inherit', fontSize: 'var(--size-body-small)', fontWeight: 600, whiteSpace: 'nowrap', flex: 'none', cursor: 'pointer', transition: 'background var(--hareket-hizli),color var(--hareket-hizli)' }}>
              <span style={{ flex: 'none', width: '14px', height: '3px', borderRadius: '2px', background: on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--border-control))' }}></span>{k.ad}{et ? <span style={{ fontSize: 'var(--size-overline)', fontWeight: 600, letterSpacing: '0.04em' }}>{et}</span> : null}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobil ? 'minmax(0,1fr)' : 'minmax(0,640px) minmax(0,1fr)', gap: '20px', alignItems: 'start', minWidth: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
          <div style={{ position: 'relative', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', background: 'hsl(var(--surface-card))', padding: '8px 8px 4px' }}>
            <div ref={kutuR} style={{ width: '100%' }}><svg viewBox={'0 0 ' + W + ' ' + Hh} width={W} height={Hh} role="img" aria-label={M('ds.pq-egrisi')} onPointerMove={gez} onPointerLeave={() => setHq(null)} data-om-raster="true" style={{ display: 'block', touchAction: 'pan-y', fontFamily: 'var(--font-sans)' }}>
              {yIz.map((g, i) => <g key={'y' + i}><line x1={mL} x2={W - mR} y1={g.y} y2={g.y} stroke="hsl(var(--border-row))" strokeWidth="1"></line><text x={mL - 6} y={g.y + 4} textAnchor="end" fontSize="13" fill="hsl(var(--text-body))">{g.t}</text></g>)}
              {xIz.map((g, i) => <g key={'x' + i}><line x1={g.x} x2={g.x} y1={mT} y2={Hh - mB} stroke="hsl(var(--border-row))" strokeWidth="1"></line><text x={g.x} y={Hh - mB + 16} textAnchor="middle" fontSize="13" fill="hsl(var(--text-body))">{g.t}</text></g>)}
              <text x={W - mR} y={Hh - 4} textAnchor="end" fontSize="13" fontWeight="600" fill="hsl(var(--text-body))">m³/h</text>
              <text x="4" y={mT + 4} fontSize="13" fontWeight="600" fill="hsl(var(--text-body))">Pa</text>
              {egriler.map((c, i) => <path key={i} d={c.d} fill="none" stroke={c.on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'} strokeWidth={c.on ? 2.5 : 1.5} strokeLinecap="round" strokeLinejoin="round"></path>)}
              {sistemD ? <path d={sistemD} fill="none" stroke="hsl(var(--text-body))" strokeWidth="1.5" strokeDasharray="5 5"></path> : null}
              {gir ? <g><line x1={X(Q)} x2={X(Q)} y1={Y(P)} y2={Hh - mB} stroke="hsl(var(--primary-navy))" strokeWidth="1" strokeDasharray="2 3"></line><circle cx={X(Q)} cy={Y(P)} r="5" fill="hsl(var(--surface-card))" stroke="hsl(var(--primary-navy))" strokeWidth="2"></circle></g> : null}
              {S && S.x ? <g><circle cx={X(S.x.q)} cy={Y(S.x.p)} r="11" fill="hsl(var(--action-terracotta))" opacity="0.18"></circle><circle cx={X(S.x.q)} cy={Y(S.x.p)} r="6" fill="hsl(var(--action-terracotta))" stroke="hsl(var(--surface-card))" strokeWidth="2"></circle></g> : null}
              {gezV ? <g pointerEvents="none"><line x1={X(hq)} x2={X(hq)} y1={mT} y2={Hh - mB} stroke="hsl(var(--primary-navy))" strokeWidth="1"></line><circle cx={X(hq)} cy={Y(gp)} r="4" fill="hsl(var(--primary-navy))"></circle></g> : null}
            </svg></div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', minHeight: '21px', fontSize: 'var(--size-caption)', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>
            {gezV
              ? <span><strong style={{ fontWeight: 600, color: 'hsl(var(--text-strong))' }}>{S.ad + ': ' + nf(hq) + ' m³/h · ' + nf(gp) + ' Pa'}</strong> · {M('ds.grafikten-okundu')}</span>
              : <span>{gir ? M('ds.perf-not-gir') : M('ds.perf-not-gez')}</span>}
          </div>
          <PqEgriNotu egri={notE} metin={metin} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
          <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', borderRadius: 'var(--radius-kart)', background: hk.zemin, border: '1px solid hsl(var(--border-hairline))', borderLeft: '4px solid ' + hk.kural }}>
            <span style={{ fontFamily: 'var(--font-baslik)', fontSize: 'var(--size-h3)', fontWeight: 700, letterSpacing: '-0.01em', color: 'hsl(var(--text-strong))' }}>{hk.baslik}</span>
            <span style={{ fontSize: 'var(--size-body-small)', lineHeight: 1.5, color: 'hsl(var(--text-body))', textWrap: 'pretty' }}>{hk.sebep}</span>
            {hk.ek ? <span style={{ fontSize: 'var(--size-caption)', lineHeight: 1.5, color: 'hsl(var(--text-body))', textWrap: 'pretty' }}>{hk.ek}</span> : null}
          </div>
          {veri.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', background: 'hsl(var(--surface-card))', overflow: 'hidden' }}>
              <span lang={dil === 'EN' ? 'en' : 'tr'} style={{ padding: '12px 16px 8px', fontSize: 'var(--size-overline)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--text-body))' }}>{M('ds.hidrolik-veri')}</span>
              {veri.map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', padding: '9px 16px', borderTop: '1px solid hsl(var(--border-row))' }}>
                  <span style={{ minWidth: 0, fontSize: 'var(--size-caption)', color: 'hsl(var(--text-body))' }}>{r.e}</span>
                  <span style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}><span style={{ fontSize: 'var(--size-body-small)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{r.v}</span>{r.h ? <span style={{ fontSize: 'var(--size-overline)', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>{M('ds.hesaplanan')}</span> : null}</span>
                </div>
              ))}
            </div>
          ) : null}
          {eylemler.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {eylemler.map((e, i) => <button key={i} type="button" onClick={e.f} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', minHeight: 'var(--hedef-min)', padding: '8px 18px', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--primary-navy))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', font: 'inherit', fontSize: 'var(--size-body-small)', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}><span>{e.ad}</span><span aria-hidden="true">→</span></button>)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
