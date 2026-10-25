import React from 'react';

/* P-Q eğrisi (kılavuz G · K35). Ana eğri 2 px petrol; ikincil seri 1.5 px kesikli petrol (açık nokta 2).
 * Izgara 1 px --border-row (4 yatay + 4 düşey), eksen 1 px --border-control.
 * Çalışma noktası kiremit #D95D0E: 5 px daire + 1 px iniş çizgisi + etiket. Grafikteki tek kiremit.
 * Dolgu, gradyan, gölge, çizim animasyonu, yuvarlatılmış uç yok. İki noktadan az veride null (K7).
 * Ölçü: tam 520×260 · kisa 330×200 (kısada ikincil seri düşer, çalışma noktası kalır). */
const OLCU = { tam: { w: 520, h: 260 }, kisa: { w: 330, h: 200 } };
function temiz(a) { return (a || []).filter((n) => n && Number.isFinite(n.q) && Number.isFinite(n.p)).sort((x, y) => x.q - y.q); }
function bicim(n) { return Math.round(n).toLocaleString('tr-TR'); }
export function PQEgrisi({ noktalar, ikincilNoktalar, calismaNoktasi, boyut = 'tam', qBirim = 'm³/h', pBirim = 'Pa', style, ...rest }) {
  const ana = temiz(noktalar);
  if (ana.length < 2) return null;
  const ik = boyut === 'kisa' ? [] : temiz(ikincilNoktalar);
  const { w, h } = OLCU[boyut] || OLCU.tam;
  const x0 = 46, x1 = w - 20, y0 = 20, y1 = h - 50;
  const hepsi = ana.concat(ik, calismaNoktasi ? [calismaNoktasi] : []);
  const qMax = Math.max(...hepsi.map((n) => n.q)) * 1.05 || 1;
  const pMax = Math.max(...hepsi.map((n) => n.p)) * 1.1 || 1;
  const X = (q) => x0 + (q / qMax) * (x1 - x0);
  const Y = (p) => y1 - (p / pMax) * (y1 - y0);
  const yol = (a) => a.map((n) => X(n.q).toFixed(1) + ',' + Y(n.p).toFixed(1)).join(' ');
  const yat = [1, 2, 3, 4].map((i) => y0 + ((y1 - y0) * (i - 1)) / 4);
  const dus = [1, 2, 3, 4].map((i) => x0 + ((x1 - x0) * i) / 5);
  const cn = calismaNoktasi && Number.isFinite(calismaNoktasi.q) && Number.isFinite(calismaNoktasi.p) ? calismaNoktasi : null;
  const sagda = cn && X(cn.q) > x0 + (x1 - x0) * 0.6;
  return (
    <svg viewBox={'0 0 ' + w + ' ' + h} role="img" aria-label={'P-Q eğrisi, debi ' + qBirim + ', basınç ' + pBirim} data-om-raster="true" style={{ width: '100%', maxWidth: w + 'px', height: 'auto', display: 'block', ...style }} {...rest}>
      <g stroke="hsl(var(--border-row))" strokeWidth="1">
        {yat.map((y, i) => <line key={'y' + i} x1={x0} y1={y} x2={x1} y2={y} />)}
        {dus.map((x, i) => <line key={'x' + i} x1={x} y1={y0} x2={x} y2={y1} />)}
      </g>
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke="hsl(var(--border-control))" />
      <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="hsl(var(--border-control))" />
      {ik.length >= 2 ? <polyline points={yol(ik)} fill="none" stroke="hsl(var(--primary-navy))" strokeWidth="1.5" strokeDasharray="5 4" /> : null}
      <polyline points={yol(ana)} fill="none" stroke="hsl(var(--primary-navy))" strokeWidth="2" strokeLinejoin="miter" strokeLinecap="butt" />
      {cn ? (
        <g>
          <line x1={X(cn.q)} y1={Y(cn.p)} x2={X(cn.q)} y2={y1} stroke="hsl(var(--action-terracotta))" strokeWidth="1" />
          <circle cx={X(cn.q)} cy={Y(cn.p)} r="5" fill="hsl(var(--action-terracotta))" />
          <text x={X(cn.q) + (sagda ? -12 : 12)} y={Y(cn.p) - 6} textAnchor={sagda ? 'end' : 'start'} fontFamily="Onest, sans-serif" fontSize="12" fill="hsl(var(--text-strong))" style={{ fontVariantNumeric: 'tabular-nums' }}>{bicim(cn.q) + ' ' + qBirim + ' · ' + bicim(cn.p) + ' ' + pBirim}</text>
        </g>
      ) : null}
      <text x={x0} y={h - 24} fontFamily="Onest, sans-serif" fontSize="12" fill="hsl(var(--text-muted))">{'Debi ' + qBirim + ' · Basınç ' + pBirim}</text>
    </svg>
  );
}
