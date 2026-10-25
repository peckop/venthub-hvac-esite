import React from 'react';

/* HiyerarsiSimgesi — katalog seviye simgeleri (13a + 14b · kart-dili-kararlar 10-24). Çizimler assets/icons/ui/venthub-ui-{urunler,urun-grubu,urun-turu,urun-ailesi,seri,model}-22.svg ile birebir;
 * renk currentColor (petrol zeminde beyaz kullanılabilsin diye). Yalnız yazıyla birlikte kullanılır.
 * SeviyeEtiketi: simge 18 + büyük harf etiket 12.5/700, 0,08em, petrol (ÜRÜN GRUBU · ÜRÜN TÜRÜ · ÜRÜN AİLESİ · SERİ · MODEL; marka verilirse "SERİ · VORTICE"). */
const C = (cx, cy, r) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none"></circle>;
const R = (x, y, w, h, rx) => <rect x={x} y={y} width={w} height={h} rx={rx}></rect>;
const CIZIM = {
  urunler: { vb: '0 0 22 22', sw: 1.5, ic: <>{R(4, 4, 6, 6)}{R(12, 4, 6, 6)}{R(4, 12, 6, 6)}{R(12, 12, 6, 6)}</> },
  'urun-grubu': { vb: '0 0 24 24', sw: 1.7, ic: <>{R(8.5, 1.8, 7, 5, 1.4)}<path d="M12 6.8V10M4 10h16M4 10v3M12 10v3M20 10v3"></path>{R(1.5, 13.5, 5, 6.5, 1.2)}<path d="M9.3 15.78V19a1.2 1.2 0 0 0 1.2 1.2h3a1.2 1.2 0 0 0 1.2-1.2V15.78a1.2 1.2 0 0 0-1.2-1.2H12l-1.4-1.58H10.5a1.2 1.2 0 0 0-1.2 1.2z"></path>{R(17.5, 13.5, 5, 6.5, 1.2)}</> },
  'urun-turu': { vb: '0 0 24 24', sw: 1.7, ic: <><path d="M2 8.5V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.5a2 2 0 0 0-2-2h-8l-2-2.5H4a2 2 0 0 0-2 2z"></path>{R(5.5, 13.5, 3.6, 5, 0.8)}{C(7.3, 16, 0.75)}{R(10.2, 11.5, 3.8, 7, 0.9)}{C(12.1, 15, 0.95)}{R(15, 9.5, 3.8, 9, 0.9)}{C(16.9, 14, 1.15)}</> },
  'urun-ailesi': { vb: '0 0 24 24', sw: 1.7, ic: <><path d="M3.5 5.5V3h17v2.5M12 1.5V3"></path>{R(1.5, 14.5, 4.2, 6.5, 1)}{C(3.6, 17.75, 0.75)}{R(6.6, 11.5, 4.4, 9.5, 1)}{C(8.8, 16.25, 0.9)}{R(13, 13, 4.4, 8, 1)}{C(15.2, 17, 0.85)}{R(18.3, 9.5, 4.4, 11.5, 1)}{C(20.5, 15.25, 1)}</> },
  seri: { vb: '0 0 24 24', sw: 1.7, ic: <>{R(1.5, 13.5, 5.5, 7.5, 1.2)}{C(4.25, 17.25, 0.9)}{R(8.6, 10.5, 6.4, 10.5, 1.4)}{C(11.8, 15.75, 1.2)}{R(16.5, 7, 6, 14, 1.5)}{C(19.5, 14, 1.5)}</> },
  model: { vb: '0 0 24 24', sw: 1.7, ic: <>{R(5, 5, 14, 14, 2.5)}{C(12, 12, 2.6)}</> }
};
const AD = {
  urunler: 'tx.e_urunlerU', 'urun-grubu': 't.urun-grubu-2', 'urun-turu': 'ds.urun-turu-ust',
  'urun-ailesi': 'ds.urun-ailesi-ust', seri: 't.seri-2', model: 't.model-3',
  'uygulama-alani': 'ds.uygulama-alani-ust' /* iş emri #6 madde 2: simgesiz. Sözlükte "Uygulama alanı"; büyük harf CSS ile, sayfanın lang'ına göre (tr: İ, en: I) */
};
export function HiyerarsiSimgesi({ seviye = 'model', boyut = 22, renk, style }) {
  const c = CIZIM[seviye] || CIZIM.model;
  return <svg viewBox={c.vb} width={boyut} height={boyut} fill="none" aria-hidden="true" style={{ display: 'block', flex: 'none', stroke: 'currentColor', strokeWidth: c.sw, strokeLinecap: 'round', strokeLinejoin: 'round', color: renk || 'hsl(var(--primary-navy))', ...style }}>{c.ic}</svg>;
}
export function SeviyeEtiketi({ seviye = 'model', marka, metin, dil = 'TR', style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const a = AD[seviye] || AD.model, m = marka ? String(marka).toLocaleUpperCase('en-US') : '';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-overline)', fontWeight: 700, letterSpacing: '0.08em', color: 'hsl(var(--primary-navy))', ...style }}>
      {CIZIM[seviye] ? <HiyerarsiSimgesi seviye={seviye} boyut={18} /> : null}<span lang={dil === 'EN' ? 'en' : 'tr'} style={{ textTransform: 'uppercase' }}>{M(a)}</span>{m ? ' · ' + m : ''}
    </span>
  );
}
