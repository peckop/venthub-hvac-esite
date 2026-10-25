import React from 'react';

/* VariantPicker — eksen çipleri (Çap (mm), Motor tipi) · Foto Dili 5b · Alternatifler 5a/6a-2/9a.
 * Satır: etiket 13/600 text-body her satırda üstte (ürün grubundaki "Özel ihtiyaç" gibi · not 10-25 madde 3), altında 6 px ile çipler; satırlar arası 14 (satirAra; ProductCover sıkılaştırmada 10). etiketGenisligi artık kullanılmaz. Çip 36 px görünür / 44 px basılır (görünmez pay), padding 0 14, oval, 14/600 tabular;
 * seçili dolu petrol + beyaz + ✓; değil beyaz + 1 px border-control. Yok olan bileşim: inset zemin + muted (opaklık yok).
 * Seçim ürünü değiştirir (foto, ad, değer, fiyat) — o iş çağıranın. */
/* yerlesim="satir" (Karar 7 · Model Secici Alternatifler 1b, Recep 10-25): tek satır — etiket solda (76 px, 13 text-body), ilk eksen açılır liste düğmesi
 *   (oval 44, 1 px border-control, "Ø250 mm ▾"), ikinci eksen oval segment anahtar (iç 3 px, seçenek 38 px · en az 64, seçili dolu petrol). Liste: düğmenin altında katman
 *   (--shadow-overlay, köşe 16, dolgu 6), satır 44: solda seçenek (o.liste ?? o.ad, 600), sağda o.ek (14 text-body; ör. o çapın seçili motordaki debisi); seçili satır --p2-tint.
 *   Pasif (olmayan bileşim) seçenekler listede ve anahtarda çizilmez. Esc ve dışarı tıklama listeyi kapatır. Mobil (MobileBuyBar) bu yerleşimi kullanmaz. */
function SatirSecici({ eksenler, S, sec, etiket, style }) {
  const [acik, setAcik] = React.useState(false);
  const kok = React.useRef(null);
  React.useEffect(() => { if (!acik) return; const esc = (e) => { if (e.key === 'Escape') setAcik(false); }; const dis = (e) => { if (kok.current && !kok.current.contains(e.target)) setAcik(false); }; document.addEventListener('keydown', esc); document.addEventListener('mousedown', dis); return () => { document.removeEventListener('keydown', esc); document.removeEventListener('mousedown', dis); }; }, [acik]);
  const [L, A] = eksenler, lS = L.secenekler.filter((o) => !o.pasif || S[L.id] === o.deger), aS = A ? A.secenekler.filter((o) => !o.pasif || S[A.id] === o.deger) : [];
  const secili = L.secenekler.find((o) => o.deger === S[L.id]) || lS[0] || {};
  return (
    <div ref={kok} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontFamily: 'var(--font-sans)', ...style }}>
      <span style={{ flex: 'none', width: '76px', fontSize: '13px', lineHeight: 1.3, color: 'hsl(var(--text-body))' }}>{etiket || [L.ad, A && A.ad].filter(Boolean).join(' · ')}</span>
      <button type="button" aria-haspopup="listbox" aria-expanded={acik} aria-label={L.ad} onClick={() => setAcik((x) => !x)} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', minHeight: 'var(--hedef-min)', padding: '0 18px', boxSizing: 'border-box', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--border-control))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--text-strong))', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', cursor: 'pointer', WebkitAppearance: 'none' }}>{secili.liste ?? secili.ad}<span aria-hidden="true" style={{ color: 'hsl(var(--primary-navy))', transform: acik ? 'rotate(180deg)' : 'none', transition: 'transform var(--hareket-hizli) var(--hareket-egri)' }}>▾</span></button>
      {aS.length >= 2 ? <div role="radiogroup" aria-label={A.ad} style={{ display: 'inline-flex', padding: '3px', boxSizing: 'border-box', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--border-control))', background: 'hsl(var(--surface-card))' }}>{aS.map((o) => { const on = S[A.id] === o.deger; return <button key={o.deger} type="button" role="radio" aria-checked={on} onClick={() => sec(A.id, o.deger)} style={{ position: 'relative', minHeight: '38px', minWidth: '64px', padding: '0 16px', border: 0, borderRadius: 'var(--radius-dugme)', background: on ? 'hsl(var(--primary-navy))' : 'transparent', color: on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--text-strong))', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background-color var(--hareket-hizli) var(--hareket-egri), color var(--hareket-hizli) var(--hareket-egri)', WebkitAppearance: 'none' }}><span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{o.ad}</button>; })}</div> : null}
      {acik ? <div role="listbox" aria-label={L.ad} style={{ position: 'absolute', top: 'calc(100% + 6px)', left: '88px', zIndex: 20, display: 'flex', flexDirection: 'column', minWidth: '260px', padding: '6px', boxSizing: 'border-box', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: '16px', boxShadow: 'var(--shadow-overlay)' }}>{lS.map((o) => { const on = S[L.id] === o.deger; return <button key={o.deger} type="button" role="option" aria-selected={on} onClick={() => { sec(L.id, o.deger); setAcik(false); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', minHeight: 'var(--hedef-min)', padding: '0 14px', border: 0, borderRadius: '10px', background: on ? 'hsl(var(--p2-tint))' : 'transparent', color: 'hsl(var(--text-strong))', fontFamily: 'var(--font-sans)', fontSize: '15px', textAlign: 'left', cursor: 'pointer', WebkitAppearance: 'none' }}><span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{o.liste ?? o.ad}</span>{o.ek ? <span style={{ fontSize: '14px', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-body))' }}>{o.ek}</span> : null}</button>; })}</div> : null}
    </div>
  );
}
export function VariantPicker({ eksenler = [], secim, onSecim, etiketGenisligi, satirAra, yerlesim = 'cip', etiket, mobil = false, style }) {
  const [ic, setIc] = React.useState(() => Object.fromEntries(eksenler.map((e) => [e.id, e.secili ?? (e.secenekler[0] && e.secenekler[0].deger)])));
  const S = secim ?? ic;
  const gor = eksenler.filter((e) => (e.secenekler || []).length >= 2);
  if (!gor.length) return null;
  const sec = (id, d) => { const y = { ...S, [id]: d }; if (secim === undefined) setIc(y); onSecim && onSecim(y, id); };
  if (yerlesim === 'satir' && !mobil) return <SatirSecici eksenler={gor} S={S} sec={sec} etiket={etiket} style={style} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: satirAra || (mobil ? '16px' : '14px'), fontFamily: 'var(--font-sans)', ...style }}>
      {gor.map((e) => (
        <div key={e.id} role="radiogroup" aria-label={e.ad} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}>
          <span style={{ flex: 'none', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-body))' }}>{e.ad}</span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {e.secenekler.map((o) => {
              const on = S[e.id] === o.deger, pasif = !!o.pasif;
              return (
                <button key={o.deger} type="button" role="radio" aria-checked={on} disabled={pasif} onClick={() => sec(e.id, o.deger)} style={{ position: 'relative', flex: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', height: '36px', padding: '0 14px', boxSizing: 'border-box', borderRadius: 'var(--radius-dugme)', border: on ? '1px solid hsl(var(--primary-navy))' : '1px solid ' + (pasif ? 'hsl(var(--border-hairline))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : pasif ? 'hsl(var(--surface-inset))' : 'hsl(var(--surface-card))', color: on ? 'hsl(var(--text-on-dark))' : pasif ? 'hsl(var(--text-muted))' : 'hsl(var(--text-strong))', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', cursor: pasif ? 'not-allowed' : 'pointer', transition: 'background-color var(--hareket-hizli) var(--hareket-egri), color var(--hareket-hizli) var(--hareket-egri)', WebkitAppearance: 'none' }}>
                  <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{on ? <span aria-hidden="true">✓</span> : null}{o.ad}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
