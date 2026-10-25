import React from 'react';
import { PhotoStage } from '../foto/PhotoStage.jsx';
import { QuoteRequestButton } from '../dugme/QuoteRequestButton.jsx';
import { CompareButton } from '../dugme/CompareButton.jsx';

/* ModelRow — model satırı (Foto Dili Akış 4 · foto-ve-kart-kurali §4 · S5 6c-3 · kararlar 4, 5, 8, 20, 25, 40). = ProductCard yerlesim="liste".
 * Masaüstü: 72 px foto (60 px sahne) · ad + kod (+ AC/EC kodun sağında) · ürün türünün 2–3 değeri · fiyat 150 (+ KDV %20 altında) · ⇄ + teklif/sepet 96.
 *   Sütunlar sabit (MODEL_SATIR_SUTUN): satırlar alt alta hizalı. Satış kipinde fiyatsız modelde "Fiyat için teklif isteyin".
 * Satır: beyaz, 1 px hairline, köşe 14, dolgu 6 12 6 6, gap 16. Ad 15/600 · kod 12 text-body · değer 14 (sayı kalın) · fiyat Onest 17/700 tabular.
 * Sonuç etiketi (İhtiyacınız girilince): ad altında "{kademe} · {dB} dB(A)" 13/600 + durum rozeti 22 px (Yeter · Sınırda · Yetmez); yetmez satırda ad --text-muted.
 * Mobil (ds-cevap 10-24b): foto 64×56 · ad en çok 2 satır · kod · motor · seri tek satır · değerler 13 px, her değer bütün (kırılmaz); sığmayan değer bütün olarak alt satıra geçer, en çok 2 satır. Satır içinde yatay kaydırma yok (ds-cevap 10-24c).
 *   Teklif kipinde tek kat; satış kipinde iki kat (alt: fiyat + "+ KDV %20" | ⇄ + sepet; fiyatsızda "Fiyat için teklif isteyin" + teklif). */
/* Masaüstü sütunları sabit (kart-dili 10-24): satırlar ve ModelListesi başlık satırı aynı ızgarada hizalanır.
 * Ad sütunu önce genişlik alır (en az 170, 2fr; değerler en az 72, 1fr). Ad üstte (sığmazsa en çok 2 satır, sonra …), altında kod · motor · seri ayrı satır (ds-cevap 10-24h madde 3).
 * Alt satır tek satır: kod ve motor kesilmez, yalnız seri adı "…" ile biter; satırın title'ı tam metin. */
export const MODEL_SATIR_SUTUN = (n) => '72px minmax(170px,2fr)' + (n ? ' repeat(' + n + ', minmax(72px,1fr))' : '') + ' 150px 96px';
const fiyatYaz = (n, yerel) => '₺' + Number(n).toLocaleString(yerel, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); /* fiyatta binlik nokta (Recep 10-25) */
const ROZET = {
  yeter: { bg: 'hsl(var(--primary-navy))', fg: 'hsl(var(--text-on-dark))', bd: 'hsl(var(--primary-navy))', k: 't.yeter-2' },
  sinirda: { bg: 'hsl(var(--surface-card))', fg: 'hsl(var(--text-strong))', bd: 'hsl(var(--warn-amber))', k: 't.sinirda-2' },
  yetmez: { bg: 'hsl(var(--surface-inset))', fg: 'hsl(var(--text-muted))', bd: 'hsl(var(--surface-inset))', k: 't.yetmez-2' }
};
export function ModelRow({ urun, kip = 'teklif', listede, karsilastirmada, onEkle, onKarsilastir, onAc, sonuc, seriGoster = false, degerSayisi = 2, mobil = false, metin, yerel = 'tr-TR', style, ...rest }) {
  const [hv, setHv] = React.useState(false);
  const [icL, setIcL] = React.useState(false);
  const [icK, setIcK] = React.useState(false);
  if (!urun) return null;
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const fiyatVar = typeof urun.fiyat === 'number' && urun.fiyat > 0, satis = kip === 'satis', showPrice = satis && fiyatVar;
  const L = listede ?? icL, K = karsilastirmada ?? icK;
  const dur = (e) => e && e.stopPropagation && e.stopPropagation();
  const ac = () => onAc && onAc(urun.sku);
  const foto = (urun.gorseller || [])[0];
  const yetmez = sonuc && sonuc.durum === 'yetmez';
  const degerler = (urun.degerler || []).slice(0, Math.max(0, degerSayisi));
  const dolu = (d) => d && d.v !== undefined && d.v !== null && String(d.v).trim() !== '';
  const tamAd = [urun.marka, urun.ad].filter(Boolean).join(' ') + (urun.kod ? ' · ' + urun.kod : '');
  const eylemler = (
    <span style={{ display: 'flex', gap: '6px', flex: 'none' }}>
      <CompareButton secili={K} metin={metin} onClick={(e) => { dur(e); if (karsilastirmada === undefined) setIcK((v) => !v); onKarsilastir && onKarsilastir(urun.sku); }} style={{ border: 0 }} />
      <QuoteRequestButton kip={kip} fiyatVar={fiyatVar} listede={L} metin={metin} onClick={(e) => { dur(e); if (listede === undefined) setIcL(true); onEkle && onEkle(urun.sku, showPrice ? 'sepet' : 'teklif'); }} />
    </span>
  );
  const adBlok = (
    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
      <span title={urun.ad} style={{ fontSize: '15px', fontWeight: 'var(--weight-baslik)', lineHeight: 1.3, color: yetmez ? 'hsl(var(--text-muted))' : 'hsl(var(--text-strong))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'break-word', minWidth: 0 }}>{urun.ad}</span>
      {urun.kod || urun.motor || (seriGoster && urun.seri) ? <span title={[urun.kod, urun.motor, seriGoster ? urun.seri : null].filter(Boolean).join(' · ')} style={{ display: 'flex', minWidth: 0, fontSize: '12px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}><span style={{ flex: 'none' }}>{urun.kod}{urun.motor ? <>{urun.kod ? ' · ' : ''}<b style={{ fontWeight: 600, color: 'hsl(var(--primary-navy))' }}>{urun.motor}</b></> : null}{seriGoster && urun.seri && (urun.kod || urun.motor) ? '\u00a0·\u00a0' : ''}</span>{seriGoster && urun.seri ? <span style={{ flex: '0 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{urun.seri}</span> : null}</span> : null}
      {sonuc ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
          {sonuc.metin ? <span style={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{sonuc.metin}</span> : null}
          {ROZET[sonuc.durum] ? <span style={{ display: 'inline-flex', alignItems: 'center', height: '22px', padding: '0 9px', boxSizing: 'border-box', borderRadius: '11px', border: '1px solid ' + ROZET[sonuc.durum].bd, background: ROZET[sonuc.durum].bg, color: ROZET[sonuc.durum].fg, fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{M(ROZET[sonuc.durum].k)}</span> : null}
        </span>
      ) : null}
    </span>
  );
  const degerYaz = (d, i) => <span key={i} style={{ fontSize: mobil ? '13px' : '14px', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{dolu(d) ? <><b style={{ fontWeight: 600 }}>{d.v}</b>{d.birim ? ' ' + d.birim : ''}</> : null}</span>;
  const fiyatEl = (px) => showPrice ? <span style={{ fontSize: px + 'px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', color: 'hsl(var(--text-strong))' }}>{fiyatYaz(urun.fiyat, yerel)}</span> : null;
  const kok = { role: 'link', tabIndex: 0, 'aria-label': tamAd, onClick: ac, onKeyDown: (e) => { if (e.key === 'Enter') ac(); }, onMouseEnter: () => setHv(true), onMouseLeave: () => setHv(false) };
  const kutu = { boxSizing: 'border-box', background: 'hsl(var(--surface-card))', borderRadius: '14px', border: '1px solid ' + (hv ? 'hsl(var(--border-control))' : 'hsl(var(--border-hairline))'), cursor: 'pointer', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', transition: 'border-color var(--hareket-hizli) var(--hareket-egri)', minWidth: 0 };
  const fW = mobil ? 64 : 72, fH = mobil ? 56 : 60;
  const fotoEl = foto ? <PhotoStage src={foto} alt={urun.ad} boy="satir" genislik={fW + 'px'} yukseklik={fH} /> : <span style={{ width: fW + 'px', height: fH + 'px', flex: 'none', borderRadius: '10px', background: 'var(--foto-sahne-zemin)' }}></span>;
  /* Mobil ad bloğu (ds-cevap 10-24b): ad en çok 2 satır · kod · motor · seri tek satır (kesilir) · değerler bütün olarak kaydırılır, en çok 2 satır. */
  const altSatir = [urun.kod, urun.motor, seriGoster ? urun.seri : null].filter(Boolean).join(' · ');
  const adBlokMobil = (
    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
      <span style={{ fontSize: '15px', fontWeight: 'var(--weight-baslik)', lineHeight: 1.25, color: yetmez ? 'hsl(var(--text-muted))' : 'hsl(var(--text-strong))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}>{urun.ad}</span>
      {altSatir ? <span title={altSatir} style={{ display: 'flex', minWidth: 0, fontSize: '12px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}><span style={{ flex: 'none' }}>{[urun.kod, urun.motor].filter(Boolean).join(' · ')}{seriGoster && urun.seri && (urun.kod || urun.motor) ? '\u00a0·\u00a0' : ''}</span>{seriGoster && urun.seri ? <span style={{ flex: '0 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{urun.seri}</span> : null}</span> : null}
      {sonuc ? adBlok.props.children[2] : null}
    </span>
  );
  if (mobil) {
    const ikiKat = satis;
    return (
      <div {...kok} style={{ ...kutu, display: 'flex', flexDirection: 'column', gap: '6px', padding: '6px 10px 6px 6px', ...style }} {...rest}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {fotoEl}
          <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>{adBlokMobil}{degerler.some(dolu) ? <span style={{ display: 'flex', flexWrap: 'wrap', columnGap: '10px', rowGap: '0', maxHeight: '2.7em', overflow: 'hidden', lineHeight: 1.35, marginTop: '2px', fontSize: '13px' }}>{degerler.filter(dolu).map(degerYaz)}</span> : null}</span>
          {!ikiKat ? eylemler : null}
        </div>
        {ikiKat ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '6px', paddingTop: '6px', borderTop: '1px solid hsl(var(--border-row))' }}>
            <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              {showPrice ? <>{fiyatEl(17)}<span style={{ fontSize: '12px', color: 'hsl(var(--text-body))', whiteSpace: 'nowrap' }}>{M('ds.kdv-20')}</span></> : <span style={{ fontSize: '13px', color: 'hsl(var(--text-body))' }}>{M('ds.fiyat-icin-teklif')}</span>}
            </span>
            {eylemler}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div {...kok} style={{ ...kutu, display: 'grid', gridTemplateColumns: MODEL_SATIR_SUTUN(degerler.length), gap: '16px', alignItems: 'center', padding: '6px 12px 6px 6px', ...style }} {...rest}>
      {fotoEl}
      {adBlok}
      {degerler.map(degerYaz)}
      <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>{showPrice ? <>{fiyatEl(16)}<span style={{ fontSize: '12px', color: 'hsl(var(--text-body))', whiteSpace: 'nowrap' }}>{M('ds.kdv-20')}</span></> : satis ? <span style={{ fontSize: '12px', color: 'hsl(var(--text-body))', textAlign: 'right' }}>{M('ds.fiyat-icin-teklif')}</span> : null}</span>
      <span style={{ display: 'flex', justifyContent: 'flex-end' }}>{eylemler}</span>
    </div>
  );
}
