import React from 'react';

/* CategoryFilters — S5 parca/CategoryFilters (DESIGN-MENU) · depo components/category/CategoryFilters.tsx.
 * Süzgeç paneli + tek arama: başlık · oval arama kutusu · (arama ≥2 harf) sonuç listesi ya da kategori ağacı · süzgeç grupları (çip) · Temizle.
 * Masaüstü: 16 px köşeli kart. Mobil: tetik düğmesi → alttan açılan panel (24 px üst köşe, --shadow-overlay, perde) + "N modeli göster".
 * Aralık süzgeci (grup.dagilim): çiplerin üstünde dağılım sütunları; sütun boyu sayıya göre (en az 3 px, en çok 40), basınca o aralık seçilir.
 *   Basma alanı sütunun üstüne 44 px şeffaf pay (padding-top 44, margin-top −44, background-clip content-box · ds-cevap 10-23b madde 1).
 * #18 ölçümü (10-25): dar panelde (≤ 420) çip yazısı kırılıp 36 px kutuda kesiliyordu, başlık ikinci satırda arama kutusunun altına giriyordu → çip flex:none + nowrap; başlık line-height 1.25.
 * DS sapması: kaynakta sonucu kalmayan çip opacity 0.45; burada --surface-inset zemin + --text-muted (opaklık durum anlatmaz, kontrast ≥ 4.5). */
const IKON = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
const nz = (s) => String(s || '').toLocaleLowerCase('tr-TR').replace(/[\s·\-]+/g, '');

export function CategoryFilters({ agac = [], gruplar = [], secili, onSuzgec, arama, onArama, sonuclar, gorunurSayi, onTemizle, mobil = false, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [acik, setAcik] = React.useState(false);
  const [icF, setIcF] = React.useState({});
  const [icQ, setIcQ] = React.useState('');
  const F = secili ?? icF, q = arama ?? icQ, qq = nz(q);
  const koyF = (y) => { if (secili === undefined) setIcF(y); onSuzgec && onSuzgec(y); };
  const koyQ = (v) => { if (arama === undefined) setIcQ(v); onArama && onArama(v); };
  const aktif = Object.values(F).some((L) => L && L.length) || !!q;
  const temizle = () => { koyF({}); koyQ(''); onTemizle && onTemizle(); };
  const panelB = M('t.kategoriler-ve-filtreler');
  let sonuc = [];
  if (qq.length >= 2) sonuc = (sonuclar || agac.filter((k) => nz(k.ad).includes(qq)).map((k) => ({ ad: k.ad, tur: k.seviye ? M('ds.urun-turu') : M('t.urun-grubu'), onSec: k.onSec }))).slice(0, 8);
  const kapat = () => setAcik(false);
  if (mobil && !acik) {
    return (
      <button type="button" onClick={() => setAcik(true)} style={{ width: '100%', minHeight: 'var(--hedef-min)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--primary-navy))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-small)', fontWeight: 600, cursor: 'pointer', ...style }}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" style={IKON}><path d="M4 6h16M7 12h10M10 18h4"></path></svg>{panelB}
      </button>
    );
  }
  const panelStil = mobil
    ? { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 61, maxHeight: '82vh', overflow: 'auto', borderRadius: 'var(--radius-kart-buyuk) var(--radius-kart-buyuk) 0 0', boxShadow: 'var(--shadow-overlay)' }
    : { position: 'relative', borderRadius: 'var(--radius-kart)' };
  const satir = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minHeight: 'var(--hedef-min)', border: 0, borderRadius: 'var(--radius-kucuk)', textAlign: 'left', font: 'inherit', fontSize: 'var(--size-body-small)', cursor: 'pointer' };
  return (
    <>
      {mobil ? <div onClick={kapat} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'hsl(var(--text-strong) / 0.45)' }}></div> : null}
      <aside aria-label={panelB} style={{ ...panelStil, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', ...(mobil ? null : style) }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ flex: '1 1 auto', minWidth: 0, fontFamily: 'var(--font-baslik)', fontSize: '18px', fontWeight: 800, lineHeight: 1.25, textWrap: 'balance' }}>{panelB}</span>
          {mobil ? <button type="button" onClick={kapat} aria-label={M('tx.e_kapatX')} style={{ width: 'var(--hedef-min)', height: 'var(--hedef-min)', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--border-control))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--text-strong))', font: 'inherit', fontSize: '18px', cursor: 'pointer' }}>✕</button> : null}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: 'var(--hedef-min)', padding: '0 14px', border: '1px solid hsl(var(--border-control))', borderRadius: 'var(--radius-dugme)' }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" style={{ flex: 'none', stroke: 'hsl(var(--text-body))', strokeWidth: 1.8, strokeLinecap: 'round' }}><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg>
          <input value={q} onChange={(e) => koyQ(e.target.value)} placeholder={M('ds.kategori-seri-ya-da-model-ara')} aria-label={M('ds.kategori-seri-ya-da-model-ara')} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 'var(--size-body-small)', color: 'hsl(var(--text-strong))' }} />
        </label>
        {qq.length >= 2 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {sonuc.map((r, i) => <SonucSatiri key={i} r={r} satir={satir} />)}
            {!sonuc.length ? <span style={{ padding: '8px 10px', fontSize: 'var(--size-caption)', color: 'hsl(var(--text-body))' }}>{M('ds.eslesen-sonuc-yok')}</span> : null}
          </div>
        ) : agac.length ? (
          <nav aria-label={M('t.kategoriler')} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {agac.map((k, i) => (
              <button key={i} type="button" onClick={k.onSec} aria-current={k.secili ? 'page' : undefined} style={{ ...satir, padding: '0 10px 0 ' + (k.seviye ? '26px' : '10px'), background: k.secili ? 'hsl(var(--p2-tint))' : 'transparent', fontWeight: k.secili || (k.acik && !k.seviye) ? 700 : k.seviye ? 400 : 500, color: k.secili || (k.acik && !k.seviye) ? 'hsl(var(--primary-navy))' : k.seviye ? 'hsl(var(--text-body))' : 'hsl(var(--text-strong))' }}><span>{k.ad}</span><span style={{ fontSize: 'var(--size-caption)', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-body))', fontWeight: 400 }}>{k.n}</span></button>
            ))}
          </nav>
        ) : null}
        {gruplar.filter((g) => (g.secenekler || []).length >= 2).map((g) => (
          <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '14px', borderTop: '1px solid hsl(var(--border-row))' }}>
            <span style={{ fontSize: 'var(--size-caption)', fontWeight: 600, letterSpacing: '0.04em', color: 'hsl(var(--text-body))' }}>{g.baslik}</span>
            {g.dagilim ? (() => { const mx = Math.max(1, ...g.secenekler.map((o) => o.n || 0)); const L = F[g.id] || []; return (
              <div role="group" aria-label={g.baslik} style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '40px' }}>
                {g.secenekler.map((o) => { const on = L.includes(o.deger), bos = !on && o.n === 0; const sec = () => { const Y = L.slice(), i = Y.indexOf(o.deger); i >= 0 ? Y.splice(i, 1) : Y.push(o.deger); koyF({ ...F, [g.id]: Y }); };
                  return <button key={o.deger} type="button" onClick={sec} disabled={bos} aria-pressed={on} aria-label={o.ad + (o.n != null ? ' · ' + o.n : '')} title={o.ad} style={{ flex: '1 1 0', minWidth: 0, height: (44 + Math.max(3, Math.round(((o.n || 0) / mx) * 40))) + 'px', paddingTop: '44px', marginTop: '-44px', boxSizing: 'border-box', border: 0, borderRadius: '2px 2px 0 0', background: on ? 'hsl(var(--primary-navy))' : bos ? 'hsl(var(--surface-inset))' : 'hsl(var(--pq-ton-2))', backgroundClip: 'content-box', cursor: bos ? 'not-allowed' : 'pointer', WebkitAppearance: 'none', transition: 'background-color var(--hareket-hizli) var(--hareket-egri)' }}></button>; })}
              </div>); })() : null}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {g.secenekler.map((o) => {
                const L = F[g.id] || [], on = L.includes(o.deger), bos = !on && o.n === 0;
                const sec = () => { const Y = L.slice(), i = Y.indexOf(o.deger); i >= 0 ? Y.splice(i, 1) : Y.push(o.deger); koyF({ ...F, [g.id]: Y }); };
                return (
                  <button key={o.deger} type="button" onClick={sec} aria-pressed={on} disabled={bos} style={{ position: 'relative', flex: 'none', height: '36px', boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0 14px', whiteSpace: 'nowrap', borderRadius: 'var(--radius-dugme)', border: '1px solid ' + (on ? 'hsl(var(--primary-navy))' : bos ? 'hsl(var(--border-hairline))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : bos ? 'hsl(var(--surface-inset))' : 'hsl(var(--surface-card))', color: on ? 'hsl(var(--text-on-dark))' : bos ? 'hsl(var(--text-muted))' : 'hsl(var(--text-strong))', font: 'inherit', fontSize: 'var(--size-caption)', fontWeight: 600, cursor: bos ? 'not-allowed' : 'pointer' }}>
                    <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>
                    {on ? <span aria-hidden="true">✓</span> : null}<span>{o.ad}</span>{o.n != null ? <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{o.n}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {aktif || mobil ? (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '6px' }}>
            {aktif ? <button type="button" onClick={temizle} style={{ minHeight: 'var(--hedef-min)', padding: '0 16px', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--border-control))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--text-strong))', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>{M('t.temizle')}</button> : null}
            {mobil ? <button type="button" onClick={kapat} style={{ flex: 1, minHeight: 'var(--hedef-min)', borderRadius: 'var(--radius-dugme)', border: 0, background: 'hsl(var(--primary-navy))', color: 'hsl(var(--text-on-dark))', font: 'inherit', fontWeight: 600, cursor: 'pointer' }}>{typeof gorunurSayi === 'number' ? M('ds.n-modeli-goster', { n: gorunurSayi }) : M('ds.goster')}</button> : null}
          </div>
        ) : null}
      </aside>
    </>
  );
}

function SonucSatiri({ r, satir }) {
  const [hv, setHv] = React.useState(false);
  return (
    <button type="button" onClick={r.onSec} onMouseEnter={() => setHv(true)} onMouseLeave={() => setHv(false)} style={{ ...satir, padding: '0 10px', background: hv ? 'hsl(var(--surface-subtle))' : 'transparent', color: 'hsl(var(--text-strong))' }}>
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.ad}</span>
      <span style={{ flex: 'none', fontSize: 'var(--size-caption)', color: 'hsl(var(--text-body))' }}>{r.tur}</span>
    </button>
  );
}
