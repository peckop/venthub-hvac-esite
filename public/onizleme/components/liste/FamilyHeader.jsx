import React from 'react';
import { HiyerarsiSimgesi } from '../hiyerarsi/HiyerarsiSimgesi.jsx';

/* FamilyHeader — ürün türü sayfasında 2+ serili ürün ailesinin başlığı (kart-dili-kararlar 10-24 · Kart Dili Akış v2 3a).
 * simge 22 · ÜRÜN AİLESİ (12.5/600, 0,08em, petrol) · ad (Schibsted 18/700) · "n seri · n model" (13 text-body). Satır kaydırılır (gap 6 12), üstte 6 px.
 * Seri kartı ızgarasında tam satır kaplar (grid-column 1/-1). Tek serili ailede çizilmez (tek seri aile değildir).
 * Sıra çağıranda: önce tek seriler, sonra aileler (her ailenin başlığı + kartları). */
export function FamilyHeader({ ad, seriSayisi, modelSayisi, metin, style }) {
  if (!ad || !(seriSayisi >= 2)) return null;
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const bilgi = [M('ds.n-seri', { n: seriSayisi }), typeof modelSayisi === 'number' ? M('ds.n-model', { n: modelSayisi }) : null].filter(Boolean).join(' · ');
  return (
    <div role="heading" aria-level={3} style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 12px', marginTop: '6px', fontFamily: 'var(--font-sans)', ...style }}>
      <HiyerarsiSimgesi seviye="urun-ailesi" boyut={22} />
      <span style={{ fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.08em', color: 'hsl(var(--primary-navy))' }}>{M('ds.urun-ailesi-ust')}</span>
      <b style={{ fontFamily: 'var(--font-baslik)', fontSize: '18px', fontWeight: 700, color: 'hsl(var(--text-strong))' }}>{ad}</b>
      <span style={{ fontSize: '13px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{bilgi}</span>
    </div>
  );
}
