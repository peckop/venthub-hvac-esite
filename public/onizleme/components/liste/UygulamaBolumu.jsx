import React from 'react';
import { SeriesCard } from './SeriesCard.jsx';

/* UygulamaBolumu — uygulama alanı sayfasında bir ihtiyaç bölümü (iş emri #6 madde 2 · kaynak DESIGN-MENU Konut Listesi Taslak.dc.html 2a).
 * Başlık (Schibsted 700 24, mobil 20) + yanında ilgili ürün türleri tek satır (13 text-body, " · " ile); altta 1 px hairline, 8 dolgu.
 * Altında seri kartları (SeriesCard) ızgarası: masaüstü 4 sütun, mobil 2 sütun; gap 12. Serisi olmayan bölüm çizilmez (K7). */
export function UygulamaBolumu({ id, baslik, turler = [], seriler = [], mobil = false, metin, dil = 'TR', onSeri, style }) {
  const S = (seriler || []).filter(Boolean);
  if (!S.length) return null;
  return (
    <section id={id} style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0, scrollMarginTop: '72px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px 12px', flexWrap: 'wrap', paddingBottom: '8px', borderBottom: '1px solid hsl(var(--border-hairline))' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-baslik)', fontSize: mobil ? '20px' : '24px', fontWeight: 700, lineHeight: 1.2, color: 'hsl(var(--text-strong))' }}>{baslik}</h2>
        {turler.length ? <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'hsl(var(--text-body))' }}>{turler.filter(Boolean).join(' · ')}</span> : null}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: mobil ? 'repeat(2,minmax(0,1fr))' : 'repeat(4,minmax(0,1fr))', gap: '12px' }}>
        {S.map((s) => <SeriesCard key={s.slug || s.ad} seri={s} mobil={mobil} metin={metin} dil={dil} href={s.href} onAc={onSeri ? () => onSeri(s) : undefined} />)}
      </div>
    </section>
  );
}
