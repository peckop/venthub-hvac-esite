import React from 'react';
import { HiyerarsiSimgesi } from '../hiyerarsi/HiyerarsiSimgesi.jsx';

/* SearchBox — katalog araması (kart-dili-kararlar 10-24 · Kart Dili Akış v2 3a). Sonuçlar gruplu: ürün grubu · ürün türü · ürün ailesi · seri · model.
 * Kutu: 44 px, oval, surface-subtle, açıkken 1 px petrol kenar; ⌕ 18 · yazı 15 · "×" temizle 32 (eksi kenarla 44 hedef).
 * En az 2 harfte açılır: altında beyaz, 16 px köşeli, gölgeli liste (en çok 440 px, kaydırılır). İsteğe bağlı kapsam çipleri ("X içinde" / "Bütün katalogda").
 * Grup başlığı: simge 16 + ad (12/600, 0,06em, büyük harf, petrol) + "· n" (fazlası varsa). Satır 52 px: 44×40 foto sahnesi · ad 14/700 + alt 12 (tek satır, kesilir) · sağda 12/600 petrol (tür ya da fiyat).
 * Mobil: header'da yalnız ⌕ (44); basınca tam ekran: "‹" geri + kutu, altında ipucu ya da sonuçlar. */
const Bul = () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" style={{ flex: 'none', stroke: 'hsl(var(--text-body))', strokeWidth: 1.8, strokeLinecap: 'round' }}><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg>;
/* İş emri #16 (Recep 10-25): satır türleri ve boş hâller. Eşleştirme çağıranda (VHKatalog.ara); bileşen sıra ve klavyeyi yönetir.
 * dogrudan: sorgu bir ürün türü adıyla tam/baştan eşleşince en üstte tek vurgulu satır (surface-subtle + 1 px petrol, sağda →) + altında o türün serileri.
 * sonuc.vurgu: vurgulu satır (sorguda rakam varsa ilk model). sonBakilan: yazı yokken gösterilir (yalnız geçmiş varsa). bos: eşleşme yokken grup çipleri + teklif.
 * Klavye: ↑/↓ satır seçer; Enter seçili satırı açar (seçim yoksa ilk satır); Tab ilk öneriyi seçer; Esc kapatır. Seçili satır yeni sonuç gelince anahtarıyla korunur. */
export function SearchBox({ deger, onDeger, gruplar = [], dogrudan, sonBakilan = [], bos, bunuMu, uyari, kapsam, tumSonuc, mobil = false, acik, onAcik, yerTutucu, metin, dil = 'TR', style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [icQ, setIcQ] = React.useState('');
  const [icA, setIcA] = React.useState(false);
  const q = deger ?? icQ, A = acik ?? icA;
  const koyQ = (v) => { if (deger === undefined) setIcQ(v); onDeger && onDeger(v); };
  const koyA = (v) => { if (acik === undefined) setIcA(v); onAcik && onAcik(v); };
  const kok = React.useRef(null);
  React.useEffect(() => { if (!A || mobil) return; const f = (e) => { if (kok.current && !kok.current.contains(e.target)) koyA(false); }; document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f); }, [A, mobil]);
  const ph = yerTutucu ?? (mobil ? M('ds.arama-ph-kisa') : M('ds.arama-ph'));
  const yeter = q.trim().length >= 2, dolu = gruplar.filter((g) => (g.sonuclar || []).length), bosQ = !q.trim();
  const [sec, setSec] = React.useState(null);
  const duz = [];
  if (yeter && dogrudan) { duz.push({ k: 'd:' + dogrudan.ad, r: dogrudan }); (dogrudan.seriler || []).forEach((r) => duz.push({ k: 'ds:' + r.ad, r })); }
  if (yeter) dolu.forEach((g) => { const lim = g.sinir ?? (g.seviye === 'model' ? 6 : 4); g.sonuclar.slice(0, lim).forEach((r) => duz.push({ k: g.seviye + ':' + r.ad, r })); });
  if (bosQ) sonBakilan.forEach((r) => duz.push({ k: 'son:' + r.ad, r }));
  const tumVar = !!tumSonuc && yeter && (dolu.length > 0 || !!dogrudan); /* Eksik Sayfalar (2): 'tüm sonuçlar' arama sayfasını açar; klavyede son satır */
  if (tumVar) duz.push({ k: 'tum:', r: { ad: tumSonuc.metin, onClick: tumSonuc.onClick } });
  const secI = duz.findIndex((x) => x.k === sec);
  const ac = (x) => { if (!x) return; koyA(false); x.r.onClick && x.r.onClick({ preventDefault() {} }); };
  const tus = (e) => { if (e.key === 'Escape') { koyA(false); return; } if (!duz.length) return; if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = secI < 0 ? (e.key === 'ArrowDown' ? 0 : duz.length - 1) : (secI + (e.key === 'ArrowDown' ? 1 : -1) + duz.length) % duz.length; setSec(duz[n].k); koyA(true); } else if (e.key === 'Enter') { e.preventDefault(); ac(secI >= 0 ? duz[secI] : duz[0]); } else if (e.key === 'Tab' && !e.shiftKey && secI < 0 && A) { e.preventDefault(); setSec(duz[0].k); } };
  const yokVar = yeter && !dolu.length && !dogrudan;
  const kutu = (oto) => (
    <label style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', height: 'var(--hedef-min)', padding: '0 14px', boxSizing: 'border-box', borderRadius: '22px', background: 'hsl(var(--surface-subtle))', border: '1px solid ' + (A ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-hairline))') }}>
      <Bul />
      <input type="search" autoFocus={oto} value={q} onChange={(e) => { koyQ(e.target.value); koyA(true); }} onFocus={() => koyA(true)} onKeyDown={tus} aria-activedescendant={secI >= 0 ? 'vh-ara-' + secI : undefined} placeholder={ph} aria-label={M('t.ara-2')} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: mobil ? '16px' : '15px', color: 'hsl(var(--text-strong))' }} />
      {q ? <button type="button" onClick={() => koyQ('')} aria-label={M('t.temizle')} style={{ flex: 'none', width: '32px', height: '32px', margin: '0 -8px 0 0', padding: '6px', boxSizing: 'content-box', border: 0, borderRadius: '16px', background: 'transparent', fontSize: '18px', lineHeight: 1, color: 'hsl(var(--text-body))', cursor: 'pointer' }}>×</button> : null}
    </label>
  );
  const sonuclar = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {kapsam && yeter ? <div role="radiogroup" aria-label={M('ds.arama-yeri')} style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>{kapsam.secenekler.map((k) => { const on = kapsam.secili === k.deger; return <button key={k.deger} type="button" role="radio" aria-checked={on} onClick={() => kapsam.onSec && kapsam.onSec(k.deger)} style={{ position: 'relative', height: '36px', padding: '0 14px', borderRadius: '18px', border: '1px solid ' + (on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--text-strong))', font: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}><span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{k.ad}</button>; })}</div> : null}
      {!yeter && mobil ? <span style={{ fontSize: '14px', color: 'hsl(var(--text-body))' }}>{M('ds.arama-en-az-2')}</span> : null}
      {bosQ && sonBakilan.length ? <div role="group" aria-label={M('t.son-baktiklariniz')} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><span lang={dil === 'EN' ? 'en' : 'tr'} style={{ padding: '0 6px 4px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--primary-navy))' }}>{M('t.son-baktiklariniz')}</span>{sonBakilan.slice(0, 3).map((r, i) => { const di = duz.findIndex((x) => x.k === 'son:' + r.ad); return <SonucSatiri key={i} id={'vh-ara-' + di} r={r} secili={di === secI} onSec={() => koyA(false)} />; })}</div> : null}
      {yeter && uyari && !yokVar ? <span role="status" style={{ padding: '2px 6px 4px', fontSize: '13px', lineHeight: 1.45, color: 'hsl(var(--text-body))' }}>{uyari}</span> : null}
      {yokVar && bunuMu ? <button type="button" onClick={(e) => bunuMu.onClick && bunuMu.onClick(e)} style={{ alignSelf: 'flex-start', minHeight: 'var(--hedef-min)', padding: '0 6px', border: 0, background: 'transparent', font: 'inherit', fontSize: '15px', fontWeight: 600, color: 'hsl(var(--primary-navy))', cursor: 'pointer', textAlign: 'left' }}>{bunuMu.metin}</button> : null}
      {yokVar ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '6px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'hsl(var(--text-strong))' }}>{M('ds.arama-yok-baslik', { q: q.trim() })}</span>
          <span style={{ fontSize: '14px', lineHeight: 1.45, color: 'hsl(var(--text-body))' }}>{M('ds.arama-yok-yazim')}</span>
          {bos && bos.gruplar && bos.gruplar.length ? <><span lang={dil === 'EN' ? 'en' : 'tr'} style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--primary-navy))' }}>{M('ds.arama-yok-gruplar')}</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{bos.gruplar.map((g, i) => <button key={i} type="button" onClick={(e) => { koyA(false); g.onClick && g.onClick(e); }} style={{ position: 'relative', height: '36px', padding: '0 14px', borderRadius: '18px', border: 0, background: 'hsl(var(--p2-tint))', color: 'hsl(var(--primary-navy))', font: 'inherit', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}><span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{g.ad}</button>)}</div></> : null}
          {bos && bos.onTeklif ? <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px', paddingTop: '12px', borderTop: '1px solid hsl(var(--border-row))' }}><span style={{ fontSize: '14px', lineHeight: 1.45, color: 'hsl(var(--text-body))' }}>{M('ds.arama-yok-teklif')}</span><button type="button" onClick={(e) => { koyA(false); bos.onTeklif(e); }} style={{ minHeight: 'var(--hedef-min)', padding: '0 18px', borderRadius: '22px', border: '1px solid hsl(var(--primary-navy))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', font: 'inherit', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>{M('t.teklif-iste')}</button></div> : null}
        </div>
      ) : null}
      {yeter && dogrudan ? (
        <div role="group" aria-label={M('ds.arama-dogrudan-git')} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span lang={dil === 'EN' ? 'en' : 'tr'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 6px 4px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--primary-navy))' }}><HiyerarsiSimgesi seviye="urun-turu" boyut={16} />{M('ds.arama-dogrudan-git')}</span>
          <SonucSatiri id={'vh-ara-0'} r={{ ...dogrudan, sag: dogrudan.sag || '→' }} vurgu={true} secili={secI === 0} onSec={() => koyA(false)} />
          {(dogrudan.seriler || []).map((r, i) => <SonucSatiri key={i} id={'vh-ara-' + (i + 1)} r={r} secili={secI === i + 1} onSec={() => koyA(false)} />)}
        </div>
      ) : null}
      {yeter ? dolu.map((g, gi) => { const lim = g.sinir ?? (g.seviye === 'model' ? 6 : 4), L = g.sonuclar.slice(0, lim); return (
        <div key={gi} role="group" aria-label={g.ad} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span lang={dil === 'EN' ? 'en' : 'tr'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 6px 4px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--primary-navy))' }}><HiyerarsiSimgesi seviye={g.seviye} boyut={16} />{g.ad + (g.sonuclar.length > lim ? ' · ' + g.sonuclar.length : '')}</span>
          {L.map((r, i) => { const di = duz.findIndex((x) => x.k === g.seviye + ':' + r.ad); return <SonucSatiri key={i} id={'vh-ara-' + di} r={r} vurgu={!!r.vurgu} secili={di === secI} onSec={() => koyA(false)} />; })}
        </div>); }) : null}
      {tumVar ? (() => { const di = duz.findIndex((x) => x.k === 'tum:'); return <a id={'vh-ara-' + di} role="option" aria-selected={di === secI} href={tumSonuc.href || '#'} onClick={(e) => { koyA(false); tumSonuc.onClick && tumSonuc.onClick(e); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', minHeight: 'var(--hedef-min)', padding: '0 10px', marginTop: '2px', borderTop: '1px solid hsl(var(--border-row))', borderRadius: di === secI ? '10px' : 0, background: di === secI ? 'hsl(var(--surface-subtle))' : 'transparent', fontSize: '14px', fontWeight: 600, color: 'hsl(var(--primary-navy))', textDecoration: 'none' }}><span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tumSonuc.metin}</span><span aria-hidden="true">→</span></a>; })() : null}
    </div>
  );
  if (mobil) {
    return (
      <>
        <button type="button" onClick={() => koyA(true)} aria-label={M('t.ara-2')} style={{ flex: 'none', width: 'var(--hedef-min)', height: 'var(--hedef-min)', border: 0, borderRadius: '22px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', ...style }}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true" style={{ stroke: 'hsl(var(--primary-navy))', strokeWidth: 1.8, strokeLinecap: 'round' }}><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg></button>
        {A ? (
          <div role="dialog" aria-label={M('t.ara-2')} style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', background: 'hsl(var(--surface-card))', fontFamily: 'var(--font-sans)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderBottom: '1px solid hsl(var(--border-hairline))' }}>
              <button type="button" onClick={() => koyA(false)} aria-label={M('t.geri-2')} style={{ flex: 'none', width: 'var(--hedef-min)', height: 'var(--hedef-min)', border: 0, background: 'transparent', fontSize: '22px', color: 'hsl(var(--primary-navy))', cursor: 'pointer' }}>‹</button>
              {kutu(true)}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>{sonuclar}</div>
          </div>
        ) : null}
      </>
    );
  }
  return (
    <div ref={kok} style={{ position: 'relative', flex: '1 1 240px', minWidth: 0, display: 'flex', fontFamily: 'var(--font-sans)', ...style }}>
      {kutu(false)}
      {A && (yeter || (bosQ && sonBakilan.length)) ? <div role="listbox" style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 8px)', zIndex: 40, maxHeight: '440px', overflowY: 'auto', padding: '12px', boxSizing: 'border-box', background: 'hsl(var(--surface-card))', borderRadius: 'var(--radius-kart)', border: '1px solid hsl(var(--border-hairline))', boxShadow: '0 12px 32px hsl(var(--primary-navy) / 0.18)' }}>{sonuclar}</div> : null}
    </div>
  );
}
function SonucSatiri({ r, onSec, vurgu = false, secili = false, id }) {
  const [hv, setHv] = React.useState(false);
  return (
    <a id={id} role="option" aria-selected={secili} href={r.href} onClick={(e) => { onSec(); r.onClick && r.onClick(e); }} onMouseEnter={() => setHv(true)} onMouseLeave={() => setHv(false)} style={{ display: 'grid', gridTemplateColumns: (r.foto ? '44px' : '2px') + ' minmax(0,1fr) auto', gap: '10px', alignItems: 'center', minHeight: '52px', padding: '4px 6px', boxSizing: 'border-box', borderRadius: '10px', background: hv || vurgu || secili ? 'hsl(var(--surface-subtle))' : 'transparent', border: '1px solid ' + (vurgu || secili ? 'hsl(var(--primary-navy))' : 'transparent'), textDecoration: 'none', color: 'hsl(var(--text-strong))' }}>
      {r.foto ? <span style={{ width: '44px', height: '40px', borderRadius: '8px', background: 'var(--foto-sahne-zemin)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={r.foto} alt={r.ad} width={44} height={40} loading="lazy" decoding="async" style={{ width: 'auto', height: 'auto', maxWidth: '84%', maxHeight: '84%', mixBlendMode: 'multiply' }} /></span> : <span aria-hidden="true" style={{ alignSelf: 'stretch', width: '2px', margin: '4px 0', justifySelf: 'start', borderRadius: '1px', background: 'hsl(var(--primary-navy))' }}></span> /* #17 D: fotoğrafsız → boş kutu yok, 2 px petrol sol kural */}
      <span style={{ display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 }}><b style={{ fontSize: '14px', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ad}</b>{r.alt ? <span style={{ fontSize: '12px', color: 'hsl(var(--text-body))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.alt}</span> : null}</span>
      {r.sag ? <span style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--primary-navy))', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{r.sag}</span> : <span></span>}
    </a>
  );
}
