import React from 'react';
import { AdetKontrolu } from '../veri/AdetKontrolu.jsx';
import { VariantPicker } from './VariantPicker.jsx';
import { QuoteRequestButton } from '../dugme/QuoteRequestButton.jsx';

/* MobileBuyBar — ürün sayfası mobil alt çubuğu (Alternatifler 6a · 6a-2). Sayfaya girer girmez fiyat görünür, kaydırırken hep durur.
 * Çubuk iki satır (390'da tek satıra sığmıyordu, fiyat kesiliyordu · Recep 10-25): üstte seçim çipi ("Ø100 · EC ▾", 28 görünür / 44 hedef, petrol kenar 13/600) solda,
 *   fiyat sağda (18/700 tabular + "+ KDV %20" 13, kesilmez); altta adet + ana eylem (kalan genişlik). Beyaz, üstte 1 px hairline, gölge 0 −6 18 petrol/0,10, dolgu 10 14.
 * Çipe basınca alttan panel: perde text-strong/0,45, panel köşe 16 16 0 0, dolgu 10 18 18, gap 16; tutamak 40×4; "Model seçin" Schibsted 20/700 + × 44;
 * VariantPicker (44 px çip); değerler (3 sütun, surface-subtle, köşe 12); fiyat 22 + ana eylem. Değerler seçimle canlı değişir (çağıran verir). */
const fiyatYaz = (n, yerel) => '₺' + Number(n).toLocaleString(yerel, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); /* fiyatta binlik nokta (Recep 10-25) */
export function MobileBuyBar({ secimEtiketi, eksenler, secim, onSecim, degerler = [], kip = 'teklif', fiyat, kdvOrani = 20, listede = false, onEkle, adet = 1, onAdet, acik, onAcik, metin, yerel = 'tr-TR', style }) {
  const [ic, setIc] = React.useState(false);
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const A = acik ?? ic;
  const koy = (v) => { if (acik === undefined) setIc(v); onAcik && onAcik(v); };
  const fiyatVar = typeof fiyat === 'number' && fiyat > 0, goster = kip === 'satis' && fiyatVar;
  const fiyatBlok = (px, kpx) => goster ? <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}><span style={{ fontFamily: 'var(--font-sans)', fontSize: px + 'px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{fiyatYaz(fiyat, yerel)}</span><span style={{ fontSize: kpx + 'px', color: 'hsl(var(--text-body))' }}>{M('ds.kdv-n', { n: kdvOrani })}</span></span> : null;
  const secimVar = eksenler && eksenler.length;
  const dolu = degerler.filter((d) => d && d.v !== undefined && d.v !== null && String(d.v).trim() !== '');
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 14px', boxSizing: 'border-box', background: 'hsl(var(--surface-card))', borderTop: '1px solid hsl(var(--border-hairline))', boxShadow: '0 -6px 18px hsl(var(--primary-navy) / 0.10)', fontFamily: 'var(--font-sans)', ...style }}>
        {(secimVar && secimEtiketi) || goster ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', minWidth: 0 }}>
          {secimVar && secimEtiketi ? (
            <button type="button" onClick={() => koy(true)} aria-haspopup="dialog" aria-expanded={A} style={{ flex: 'none', minHeight: 'var(--hedef-min)', margin: '-8px 0', padding: 0, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', cursor: 'pointer', WebkitAppearance: 'none' }}>
              <span style={{ height: '28px', padding: '0 10px', boxSizing: 'border-box', borderRadius: '14px', border: '1px solid hsl(var(--primary-navy))', display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--primary-navy))', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{secimEtiketi + ' ▾'}</span>
            </button>
          ) : <span></span>}
          {goster ? <span style={{ display: 'flex', alignItems: 'baseline', gap: '6px', whiteSpace: 'nowrap' }}><span style={{ fontSize: '18px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{fiyatYaz(fiyat, yerel)}</span><span style={{ fontSize: '13px', color: 'hsl(var(--text-body))' }}>{M('ds.kdv-n', { n: kdvOrani })}</span></span> : null}
        </div> : null}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onAdet ? <AdetKontrolu deger={adet} min={1} onDegisim={onAdet} etiket={M('t.adet')} /> : null}
          <QuoteRequestButton boyut="etiket" kip={kip} fiyatVar={fiyatVar} listede={listede} onClick={() => onEkle && onEkle(adet)} metin={metin} style={{ flex: 1, justifyContent: 'center', padding: '0 16px' }} />
        </div>
      </div>
      {A ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, fontFamily: 'var(--font-sans)' }}>
          <div onClick={() => koy(false)} style={{ position: 'absolute', inset: 0, background: 'hsl(var(--text-strong) / 0.45)' }}></div>
          <div role="dialog" aria-modal="true" aria-label={M('t.model-secin')} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '86vh', overflow: 'auto', background: 'hsl(var(--surface-card))', borderRadius: '16px 16px 0 0', padding: '10px 18px 18px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 -8px 24px hsl(var(--primary-navy) / 0.18)' }}>
            <span aria-hidden="true" style={{ alignSelf: 'center', width: '40px', height: '4px', borderRadius: '2px', background: 'hsl(var(--border-control))' }}></span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-baslik)', fontSize: '20px', fontWeight: 700, color: 'hsl(var(--text-strong))' }}>{M('t.model-secin')}</span>
              <button type="button" onClick={() => koy(false)} aria-label={M('tx.e_kapatX')} style={{ width: 'var(--hedef-min)', height: 'var(--hedef-min)', border: 0, background: 'transparent', color: 'hsl(var(--primary-navy))', fontSize: '22px', cursor: 'pointer', padding: 0 }}>×</button>
            </div>
            {secimVar ? <VariantPicker eksenler={eksenler} secim={secim} onSecim={onSecim} mobil /> : null}
            {dolu.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + Math.min(3, dolu.length) + ', minmax(0,1fr))', gap: '8px', padding: '12px', background: 'hsl(var(--surface-subtle))', borderRadius: 'var(--radius-kucuk)' }}>{dolu.map((d, i) => <span key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}><span style={{ fontSize: '13px', color: 'hsl(var(--text-body))' }}>{d.e}</span><b style={{ fontSize: '15px', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{d.v}</b></span>)}</div> : null}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ flex: 1, minWidth: 0 }}>{fiyatBlok(22, 13)}</span>
              {onAdet ? <AdetKontrolu deger={adet} min={1} onDegisim={onAdet} etiket={M('t.adet')} /> : null}<QuoteRequestButton boyut="etiket" kip={kip} fiyatVar={fiyatVar} listede={listede} onClick={() => onEkle && onEkle(adet)} metin={metin} style={{ padding: '0 20px' }} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
