import React from 'react';

/* CompareTable — karşılaştırma tablosu standardı (CLAUDE.md "Karşılaştırma tablosu standardı" · S5 "Seriler arasındaki fark" · karar 10).
 * Açılır satır içinde durur (baslik verilince): satır 64, dolgu 14 18; 36 px açma düğmesi SSS ile aynı (1 px border-control, ince ok; açıkken petrol dolu).
 * Sütun başlığı üstten/sola hizalı, eşit yükseklik (≥64): üstte marka 13/600 0,06em büyük harf, altta kısa ad 15/600; tam ad title'da; altta 2 px çizgi (hairline; gezinince petrol).
 * Hücre sola hizalı, tek satır, yalnız sayı (15/600 tabular); birim satır adının altında 13 (#10 madde 5.6). Değere göre renk yok.
 * Gezinme: satır + sütun --surface-inset; üzerindeki hücre --p2-tint + 2 px petrol çerçeve. Hücre zemini --surface-subtle, köşe 10, ara 4.
 * K7: en az bir sütunda değer varsa satır çizilir, boş hücre boş kalır. Yana taşma 0; sığmazsa yalnız tablo kayar. */
/* kartIci (tablo tek dil · Tablo Kabı Yan Yana 2a/2b, not 10-25): kartın içinde kenardan kenara. Hücre zemini yok; her satır altında 1 px --border-row, sütun başlığı altında 2 px hairline.
 *   Izgara: ad 240 (mobil 130) · değer minmax(72,1fr) (mobil minmax(84,1fr)); dolgu sütunu yok, sütunlar kartın sağ kenarına kadar (geçerli hâl B2). secili: o sütun --p2-tint, başlık altı 2 px petrol, altında seciliEtiket ("bu model").
 *   Ad 15/400 text-body, birim altında 13; değer 15/600 tabular text-strong. Satır en az 52; yan boşluk ad 20, değer 16. Gezinme: satır + sütun --surface-subtle, hücre --p2-tint + 2 px petrol.
 *   Kaydırma çubuğu çizilmez (Recep 10-25: mobilde parmakla kayar); dikey kaydırma yok.
 *   Not verilirse tablonun altında, 13 px, 12/20 boşluk (ürün sayfası kaynağı bölüm altında yazar, not vermez). Sığmazsa yalnız tablo kayar. Varsayılan (kartıcı false) değişmedi. */
const KART_ICI_AD = { masaustu: 240, mobil: 130 };
/* E-2 (Recep 10-25): satırda isteğe bağlı `grup` → grup değişince tam genişlik ara başlık (sola hizalı, 13/600 büyük harf text-body, altta tek 1 px border-row; değere göre renk yok). Sayfa ayrıca çizmez. */
const grupBas = (gor, ri) => { const g = gor[ri].grup; return g && (ri === 0 || gor[ri - 1].grup !== g) ? g : null; };
const GrupSatir = ({ ad, dil, pad }) => <span role="rowheader" aria-level={1} lang={dil === 'EN' ? 'en' : 'tr'} style={{ gridColumn: '1 / -1', display: 'block', padding: pad, borderBottom: '1px solid hsl(var(--border-row))', fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.3, color: 'hsl(var(--text-body))', textAlign: 'left' }}>{ad}</span>;
function KartIciTablo({ kolonlar, gor, not, mobil, dil, dolu, secili, seciliEtiket, style }) {
  const [hv, setHv] = React.useState({});
  const ad = mobil ? KART_ICI_AD.mobil : KART_ICI_AD.masaustu, n = kolonlar.length;
  const cols = ad + 'px repeat(' + n + ', ' + (mobil ? 'minmax(84px,1fr)' : 'minmax(72px,1fr)') + ')'; /* geçerli hâl B2: dolgu sütunu yok, sütunlar kartın sağ kenarına kadar */
  const ton = (r, c) => (hv.r === r && hv.c === c && r != null && c != null ? 'hsl(var(--p2-tint))' : (r != null && hv.r === r) || (c != null && hv.c === c) ? 'hsl(var(--surface-subtle))' : c != null && c === secili ? 'hsl(var(--p2-tint))' : 'transparent');
  const hucre = { display: 'flex', alignItems: 'center', minHeight: '52px', boxSizing: 'border-box', borderBottom: '1px solid hsl(var(--border-row))', transition: 'background 140ms, outline-color 140ms' };
  return (
    <div style={{ fontFamily: 'var(--font-sans)', ...style }}>
      <div data-vh-tablo-kay="" onMouseLeave={() => setHv({})} style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}><style>{'[data-vh-tablo-kay]::-webkit-scrollbar{display:none}'}</style>
        <div role="table" style={{ display: 'grid', gridTemplateColumns: cols, minWidth: (ad + n * (mobil ? 84 : 72)) + 'px' }}>
          <span role="columnheader" style={{ borderBottom: '2px solid hsl(var(--border-hairline))' }}></span>
          {kolonlar.map((k, ci) => (
            <button key={ci} type="button" role="columnheader" title={k.tam || k.kisa} onClick={k.onAc} onMouseEnter={() => setHv({ r: null, c: ci })} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '3px', minHeight: '56px', padding: '10px 16px', boxSizing: 'border-box', border: 0, borderBottom: '2px solid ' + (hv.c === ci || ci === secili ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-hairline))'), background: hv.c === ci ? 'hsl(var(--surface-subtle))' : ci === secili ? 'hsl(var(--p2-tint))' : 'transparent', font: 'inherit', textAlign: 'left', cursor: k.onAc ? 'pointer' : 'default', transition: 'background 140ms, border-color 140ms' }}>
              {k.marka ? <span lang={dil === 'EN' ? 'en' : 'tr'} style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--text-body))' }}>{k.marka}</span> : null}
              <span style={{ fontSize: 'var(--size-body-small)', fontWeight: 600, lineHeight: 1.25, color: 'hsl(var(--text-strong))', textWrap: 'balance', overflowWrap: 'anywhere', whiteSpace: 'nowrap' }}>{k.kisa}</span>
              {ci === secili && seciliEtiket ? <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--primary-navy))' }}>{seciliEtiket}</span> : null}
            </button>
          ))}
          {gor.map((r, ri) => (
            <React.Fragment key={ri}>
              {grupBas(gor, ri) ? <GrupSatir ad={grupBas(gor, ri)} dil={dil} pad="18px 20px 8px" /> : null}
              <span role="rowheader" onMouseEnter={() => setHv({ r: ri, c: null })} style={{ ...hucre, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '1px', padding: '8px 20px', background: ton(ri, null) }}>
                <span title={r.ad} style={{ fontSize: 'var(--size-body-small)', fontWeight: 400, lineHeight: 1.3, color: 'hsl(var(--text-body))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.ad}</span>
                {r.birim ? <span style={{ fontSize: '13px', color: 'hsl(var(--text-body))' }}>{r.birim}</span> : null}
              </span>
              {kolonlar.map((k, ci) => { const v = (r.degerler || [])[ci], ust = hv.r === ri && hv.c === ci; return <span key={ci} role="cell" onMouseEnter={() => setHv({ r: ri, c: ci })} style={{ ...hucre, padding: '0 16px', whiteSpace: 'nowrap', background: ton(ri, ci), outline: '2px solid ' + (ust ? 'hsl(var(--primary-navy))' : 'transparent'), outlineOffset: '-2px', fontSize: 'var(--size-body-small)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{dolu(v) ? v : null}</span>; })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {not ? <span style={{ display: 'block', padding: '12px 20px', fontSize: '13px', lineHeight: 1.5, color: 'hsl(var(--text-body))', textWrap: 'pretty' }}>{not}</span> : null}
    </div>
  );
}
export function CompareTable({ kolonlar = [], satirlar = [], not, baslik, altBaslik, acik, onAcik, mobil = false, dil = 'TR', kartIci = false, secili, seciliEtiket, style }) {
  const [hv, setHv] = React.useState({});
  const [icA, setIcA] = React.useState(false);
  const dolu = (v) => v !== undefined && v !== null && String(v).trim() !== '';
  const gor = satirlar.filter((r) => r && (r.degerler || []).some(dolu));
  if (kolonlar.length < 2 || !gor.length) return null;
  if (kartIci && !baslik) return <KartIciTablo kolonlar={kolonlar} gor={gor} not={not} mobil={mobil} dil={dil} dolu={dolu} secili={secili} seciliEtiket={seciliEtiket} style={style} />;
  const A = acik ?? icA;
  const ilk = mobil ? 130 : 170, kol = mobil ? 104 : 108;
  const tablo = (
    <>{/* kaydırma çubuğu gizli (Recep 10-25) */}<style>{'[data-vh-tablo-kay]::-webkit-scrollbar{display:none}'}</style>
    <div data-vh-tablo-kay="" onMouseLeave={() => setHv({})} style={{ overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain', padding: baslik ? '12px 14px 16px' : 0, borderTop: baslik ? '1px solid hsl(var(--border-row))' : 0 }}>
      <div role="table" style={{ display: 'grid', gridTemplateColumns: (mobil ? ilk + 'px' : 'minmax(180px,260px)') + ' repeat(' + kolonlar.length + ', ' + (mobil ? 'minmax(' + kol + 'px, 1fr)' : 'minmax(72px,140px)') + ')', gap: '4px', justifyContent: 'start', minWidth: (mobil ? ilk + kolonlar.length * (kol + 4) : 180 + kolonlar.length * 76) + 'px' /* #10 madde 5: değer 72–140, ad 180–260, boşluk sağda */ }}>
        <span role="columnheader"></span>
        {kolonlar.map((k, ci) => (
          <button key={ci} type="button" role="columnheader" title={k.tam || k.kisa} onClick={k.onAc} onMouseEnter={() => setHv({ r: null, c: ci })} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '3px', height: '100%', minHeight: '64px', padding: '10px 12px', boxSizing: 'border-box', border: 0, borderBottom: '2px solid ' + (hv.c === ci ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-hairline))'), borderRadius: '10px 10px 0 0', background: hv.c === ci ? 'hsl(var(--surface-inset))' : 'transparent', font: 'inherit', textAlign: 'left', cursor: k.onAc ? 'pointer' : 'default', transition: 'background 140ms, border-color 140ms' }}>
            {k.marka ? <span lang={dil === 'EN' ? 'en' : 'tr'} style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--text-body))' }}>{k.marka}</span> : null}
            <span style={{ fontSize: 'var(--size-body-small)', fontWeight: 600, lineHeight: 1.25, color: 'hsl(var(--text-strong))', textWrap: 'balance', overflowWrap: 'anywhere' }}>{k.kisa}</span>
          </button>
        ))}
        {gor.map((r, ri) => (
          <React.Fragment key={ri}>
            {grupBas(gor, ri) ? <GrupSatir ad={grupBas(gor, ri)} dil={dil} pad={ri === 0 ? '10px 10px 6px' : '18px 10px 6px'} /> : null}
            <span role="rowheader" onMouseEnter={() => setHv({ r: ri, c: null })} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1px', padding: '0 10px', minHeight: '48px', borderRadius: '10px', background: hv.r === ri ? 'hsl(var(--surface-inset))' : 'transparent', transition: 'background 140ms' }}>
              <span title={r.ad} style={{ fontSize: 'var(--size-body-small)', fontWeight: 600, lineHeight: 1.25, color: 'hsl(var(--text-strong))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.ad}</span>
              {r.birim ? <span style={{ fontSize: '13px', color: 'hsl(var(--text-body))' }}>{r.birim}</span> : null}
            </span>
            {kolonlar.map((k, ci) => {
              const v = (r.degerler || [])[ci], ust = hv.r === ri && hv.c === ci, iz = hv.r === ri || hv.c === ci;
              return <span key={ci} role="cell" onMouseEnter={() => setHv({ r: ri, c: ci })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', minHeight: '48px', padding: '0 12px', whiteSpace: 'nowrap', borderRadius: '10px', background: ust ? 'hsl(var(--p2-tint))' : iz ? 'hsl(var(--surface-inset))' : 'hsl(var(--surface-subtle))', outline: '2px solid ' + (ust ? 'hsl(var(--primary-navy))' : 'transparent'), outlineOffset: '-2px', fontSize: 'var(--size-body-small)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))', transition: 'background 140ms, outline-color 140ms' }}>{dolu(v) ? v : null}</span>;
            })}
          </React.Fragment>
        ))}
      </div>
      {not ? <span style={{ display: 'block', marginTop: '10px', fontSize: '13px', lineHeight: 1.5, color: 'hsl(var(--text-body))', textWrap: 'pretty' }}>{not}</span> : null}
    </div>
    </>
  );
  if (!baslik) return <div style={{ fontFamily: 'var(--font-sans)', ...style }}>{tablo}</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', background: 'hsl(var(--surface-card))', overflow: 'hidden', fontFamily: 'var(--font-sans)', ...style }}>
      <button type="button" aria-expanded={A} onClick={() => { if (acik === undefined) setIcA((v) => !v); onAcik && onAcik(!A); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: '64px', padding: '14px 18px', border: 0, background: A ? 'hsl(var(--surface-subtle))' : 'transparent', transition: 'background-color 200ms ease', font: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'hsl(var(--text-strong))' }}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><span style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em' }}>{baslik}</span>{altBaslik ? <span style={{ fontSize: 'var(--size-caption)', color: 'hsl(var(--text-body))' }}>{altBaslik}</span> : null}</span>
        <span aria-hidden="true" style={{ flex: 'none', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', border: '1px solid ' + (A ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), borderRadius: '18px', background: A ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: A ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))', transition: 'background-color 200ms ease, border-color 200ms ease, color 200ms ease' }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" style={{ display: 'block', stroke: 'currentColor', strokeWidth: 1.5, transform: A ? 'rotate(180deg)' : 'none', transition: 'transform var(--hareket-acilis) var(--hareket-egri)' }}><path d="M6 9l6 6 6-6"></path></svg>
        </span>
      </button>
      {A ? tablo : null}
    </div>
  );
}
