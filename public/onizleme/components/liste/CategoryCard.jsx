import React from 'react';
import { PhotoStage } from '../foto/PhotoStage.jsx';

/* CategoryCard — ürün grubu / ürün türü kartı (kart-dili-kararlar 10-24 · Kart Dili Akış v2 3a): fotoğraf · ad → · "n model". Sade kart; nokta, fotoğraf geçişi, marka ve seri satırı yok (A+ iptal).
 * Beyaz, hairline, 16 px köşe; PhotoStage kenardan 8, köşe 12 (masaüstü 160, mobil 120). Ad 16/600 (mobil 15), en az 2 satır yer tutar, kesilmez. "n model" 13 text-body.
 * Hizalama (Recep 10-25): kart bulunduğu hücreyi doldurur (height 100%); yan yana kartlar eşit boy, ad üstte aynı hizada, "n model" altta aynı hizada (margin-top auto).
 * Kart sonraki sayfayı açar. Kısalma (tek serili tür → seri, tek modelli seri → ürün) çağıranın href'inde. */
export function CategoryCard({ kategori, onAc, href, fotoYukseklik, mobil = false, metin, yerel = 'tr-TR', style, ...rest }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [hv, setHv] = React.useState(false);
  if (!kategori) return null;
  const n = kategori.modelSayisi;
  const Kok = href ? 'a' : 'div';
  return (
    <Kok href={href} role={href ? undefined : 'link'} tabIndex={0} onClick={() => onAc && onAc(kategori.slug)} onKeyDown={(e) => { if (e.key === 'Enter' && onAc) onAc(kategori.slug); }} onMouseEnter={() => setHv(true)} onMouseLeave={() => setHv(false)} style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', background: 'hsl(var(--surface-card))', borderRadius: 'var(--radius-kart)', border: '1px solid ' + (hv ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-hairline))'), overflow: 'hidden', transition: 'border-color var(--hareket-hizli) var(--hareket-egri)', cursor: 'pointer', textDecoration: 'none', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', minWidth: 0, ...style }} {...rest}>
      {kategori.foto ? <PhotoStage src={kategori.foto} alt={kategori.ad} boy="kart" yukseklik={fotoYukseklik ?? (mobil ? 120 : 160)} style={{ margin: '8px', width: 'auto' }} /> : <span aria-hidden="true" style={{ display: 'block', height: '2px', margin: mobil ? '12px 12px 0' : '16px 16px 0', borderRadius: '1px', background: 'hsl(var(--primary-navy))' }}></span> /* §3/§5: fotoğrafsız kartta 2 px petrol üst kural */}
      <span style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '3px', padding: kategori.foto ? (mobil ? '4px 12px 12px' : '6px 16px 16px') : (mobil ? '10px 12px 12px' : '12px 16px 16px') }}>
        <b title={kategori.ad} style={{ fontSize: mobil ? '15px' : '16px', fontWeight: 'var(--weight-baslik)', lineHeight: 1.3, minHeight: '2.6em', textWrap: 'pretty', overflowWrap: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{kategori.ad + ' →'}</b> {/* kart kuralı: ad en çok 2 satır (tam ad title'da; kısa ad veride) */}
        {typeof n === 'number' ? <span style={{ marginTop: 'auto', fontSize: '13px', lineHeight: 1.35, color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{M('ds.n-model', { n: n.toLocaleString(yerel) })}</span> : null}
      </span>
    </Kok>
  );
}
