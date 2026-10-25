import React from 'react';
import { PhotoStage } from '../foto/PhotoStage.jsx';
import { QuoteRequestButton } from '../dugme/QuoteRequestButton.jsx';
import { CompareButton } from '../dugme/CompareButton.jsx';
import { ModelRow } from './ModelRow.jsx';

/* ProductCard — ürün kartı (S5 · 23 Ekim: Foto Dili Akış 1 · foto-ve-kart-kurali §3). Depo components/ProductCard.tsx, sözleşme aynen (quoteMode / showPrice).
 * En çok üç bilgi: ad · seri · fiyat (teklif kipinde fiyat yerine teklif düğmesi). Kartta teknik değer yok.
 * Kart: beyaz, 1 px hairline, 16 px köşe; PhotoStage 180 px, kenardan 8 px, köşe 12. Metin dolgu 8 16 16, gap 4: ad 16/600 · seri 13 text-body · fiyat Onest 18/700 tabular, ₺ önde.
 * Eylemler: ⇄ (CompareButton) + teklif/sepet (QuoteRequestButton) 44 px, fiyatın sağında (karar 20). Üstüne gelince kart gölgesi + 2 px kalkma.
 * yerlesim="liste" → ModelRow (aynı parça, iki yerleşim). */
const fiyatYaz = (n, yerel) => '₺' + Number(n).toLocaleString(yerel, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); /* fiyatta binlik nokta (Recep 10-25) */
export function ProductCard({ urun, yerlesim = 'kart', kip = 'teklif', listede, karsilastirmada, onEkle, onKarsilastir, onAc, fotoYukseklik = 180, metin, yerel = 'tr-TR', style, ...rest }) {
  const [hv, setHv] = React.useState(false);
  const [icL, setIcL] = React.useState(false);
  const [icK, setIcK] = React.useState(false);
  if (!urun) return null;
  if (yerlesim === 'liste') return <ModelRow urun={urun} kip={kip} listede={listede} karsilastirmada={karsilastirmada} onEkle={onEkle} onKarsilastir={onKarsilastir} onAc={onAc} metin={metin} yerel={yerel} style={style} {...rest} />;
  const fiyatVar = typeof urun.fiyat === 'number' && urun.fiyat > 0, showPrice = kip === 'satis' && fiyatVar;
  const L = listede ?? icL, K = karsilastirmada ?? icK;
  const dur = (e) => e && e.stopPropagation && e.stopPropagation();
  const ac = () => onAc && onAc(urun.sku);
  const foto = (urun.gorseller || [])[0];
  return (
    <div role="link" tabIndex={0} onClick={ac} onKeyDown={(e) => { if (e.key === 'Enter') ac(); }} onMouseEnter={() => setHv(true)} onMouseLeave={() => setHv(false)} style={{ height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', overflow: 'hidden', boxShadow: hv ? 'var(--shadow-kart-hover)' : 'none', transform: hv ? 'translateY(-2px)' : 'none', transition: 'box-shadow var(--hareket-normal) var(--hareket-egri), transform var(--hareket-normal) var(--hareket-egri)', cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', minWidth: 0, ...style }} {...rest}>
      {foto ? <PhotoStage src={foto} alt={urun.ad} boy="kart" yukseklik={fotoYukseklik} style={{ margin: '8px', width: 'auto' }} /> : <div style={{ height: '2px', margin: '14px 16px 4px', background: 'hsl(var(--primary-navy))', borderRadius: '2px' }}></div>}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 16px 16px', minWidth: 0 }}>
        <span style={{ fontSize: '16px', fontWeight: 'var(--weight-baslik)', lineHeight: 1.3, minHeight: '2.6em' /* Recep 10-25: yan yana kartlarda seri satırı aynı hizada */, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textWrap: 'pretty' }}>{urun.ad}</span>
        {urun.seri ? <span style={{ fontSize: '13px', color: 'hsl(var(--text-body))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{urun.seri}</span> : null}
        <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {showPrice ? <span style={{ flex: '1 1 auto', minWidth: 0, fontSize: '18px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fiyatYaz(urun.fiyat, yerel)}</span> : null}
          <span style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
            <CompareButton secili={K} metin={metin} onClick={(e) => { dur(e); if (karsilastirmada === undefined) setIcK((v) => !v); onKarsilastir && onKarsilastir(urun.sku); }} />
            <QuoteRequestButton kip={kip} fiyatVar={fiyatVar} listede={L} metin={metin} onClick={(e) => { dur(e); if (listede === undefined) setIcL(true); onEkle && onEkle(urun.sku, showPrice ? 'sepet' : 'teklif'); }} />
          </span>
        </div>
      </div>
    </div>
  );
}
