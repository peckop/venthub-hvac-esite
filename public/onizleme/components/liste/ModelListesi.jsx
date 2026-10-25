import React from 'react';
import { ModelRow, MODEL_SATIR_SUTUN } from './ModelRow.jsx';
import { Pagination } from './Pagination.jsx';

/* ModelListesi — model listesi 4c (kart-dili-kararlar 10-24 · Kart Dili Akış v2 3a): tek liste, filtre solda, 24 model/sayfa (SEO, Recep 10-24 · iş emri #5), numaralı.
 * Masaüstü: başlık (Schibsted 24/700) + sayı sağda · gövde 240 px filtre kartı | liste (gap 24). Filtre kartı beyaz, hairline, 16 köşe, dolgu 16;
 *   Sıra (iş emri #17 A): bileşen sıralamaz, verilen sırayı korur; çağıran her sıralamada ikinci anahtar SKU kullanır (VHKatalog.sirala).
 *   grup adı 12.5/600 0,06em büyük harf petrol; satır 44 px: 18 px kutu (5 köşe, 1.5 kenar) · ad 14 · sayı 12. İşaret listeyi anında daraltır, sayfa 1'e döner.
 *   Liste: sütun başlıkları 12/600 text-body (ModelRow ile aynı ızgara) · satırlar gap 8 · altta ‹ 1 2 … N › (44 px).
 * Mobil (390): başlık 20 · seri çipleri yapışkan şerit (36 görünür / 44 basılır; Tümü + seriler) · satırlar · "‹ Sayfa 2 / 4 ›".
 *   Filtre alttan açılan "Filtrele" panelinde (FloatingNav sağ parçası ya da `filtreDugmesi`): gruplar 20 px kutu, 15 px ad; altta Temizle + "n modeli göster".
 *   Liste altında 150 px boşluk (yüzen düğme + alt çubuk). Arayüzde "Filtrele"; "Süzgeç" yazılmaz.
 * Model: ModelRow urun + `suz` ({ grupId: deger }) ile filtrelenir; sıralama çağıranda (varsayılan debi ↑). */
const kutu = (on, px) => ({ flex: 'none', width: px + 'px', height: px + 'px', boxSizing: 'border-box', borderRadius: '5px', border: '1.5px solid ' + (on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: 'hsl(var(--text-on-dark))', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' });
const say = (modeller, F, haric) => modeller.filter((m) => Object.keys(F).every((g) => g === haric || !(F[g] || []).length || (F[g] || []).includes((m.suz || {})[g])));
export function FiltreGruplari({ dil = 'TR', gruplar = [], secili = {}, onDegis, modeller = [], mobil = false, style }) {
  const tik = (g, d) => { const L = (secili[g] || []).slice(), i = L.indexOf(d); i >= 0 ? L.splice(i, 1) : L.push(d); onDegis && onDegis({ ...secili, [g]: L }); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mobil ? '14px' : '18px', fontFamily: 'var(--font-sans)', ...style }}>
      {gruplar.filter((g) => (g.secenekler || []).length >= 2).map((g) => {
        const uy = say(modeller, secili, g.id);
        return (
          <div key={g.id} role="group" aria-label={g.baslik} style={{ display: 'flex', flexDirection: 'column', gap: mobil ? '2px' : '6px' }}>
            <span lang={dil === 'EN' ? 'en' : 'tr'} style={{ fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'hsl(var(--primary-navy))' }}>{g.baslik}</span>
            {g.secenekler.map((o) => {
              const on = (secili[g.id] || []).includes(o.deger), n = o.n ?? uy.filter((m) => (m.suz || {})[g.id] === o.deger).length;
              return (
                <button key={o.deger} type="button" role="checkbox" aria-checked={on} onClick={() => tik(g.id, o.deger)} style={{ display: 'flex', alignItems: 'center', gap: mobil ? '12px' : '10px', minHeight: 'var(--hedef-min)', padding: 0, border: 0, background: 'transparent', font: 'inherit', fontSize: mobil ? '15px' : '14px', color: 'hsl(var(--text-strong))', textAlign: 'left', cursor: 'pointer' }}>
                  <span aria-hidden="true" style={kutu(on, mobil ? 20 : 18)}>{on ? '✓' : ''}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>{o.ad}</span>
                  <span style={{ fontSize: mobil ? '13px' : '12px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
export function ModelListesi({ baslik, modeller = [], gruplar = [], sutunlar = [], serit, secili, onSecili, sayfa, onSayfa, sayfaBoyutu = 24, kip = 'teklif', onEkle, onKarsilastir, onAc, seriGoster = true, mobil = false, filtreDugmesi = false, panelAcik, onPanel, mobilUst = 61, metin, yerel = 'tr-TR', dil = 'TR', style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [icF, setIcF] = React.useState({});
  const [icS, setIcS] = React.useState(1);
  const [icP, setIcP] = React.useState(false);
  const F = secili ?? icF, P = panelAcik ?? icP, cur = sayfa ?? icS;
  const koyS = (k) => { if (sayfa === undefined) setIcS(k); onSayfa && onSayfa(k); };
  const koyF = (y) => { if (secili === undefined) setIcF(y); onSecili && onSecili(y); koyS(1); };
  const koyP = (v) => { if (panelAcik === undefined) setIcP(v); onPanel && onPanel(v); };
  const uy = say(modeller, F), N = Math.max(1, Math.ceil(uy.length / sayfaBoyutu)), c = Math.min(cur, N);
  const gor = uy.slice((c - 1) * sayfaBoyutu, c * sayfaBoyutu);
  const nF = Object.values(F).reduce((a, L) => a + (L || []).length, 0);
  const sayiEt = M('ds.n-model', { n: uy.length });
  const b = baslik ?? M('t.modeller');
  const sg = serit ? gruplar.find((g) => g.id === serit) : null;
  const seritL = sg ? [{ deger: null, ad: M('t.tumu') }].concat(sg.secenekler) : [];
  const cip = (o) => { const L = F[sg.id] || [], on = o.deger == null ? !L.length : L.length === 1 && L[0] === o.deger; return (
    <button key={String(o.deger)} type="button" aria-pressed={on} onClick={() => koyF({ ...F, [sg.id]: o.deger == null ? [] : [o.deger] })} style={{ position: 'relative', flex: 'none', height: '36px', padding: '0 14px', boxSizing: 'border-box', borderRadius: '18px', border: '1px solid ' + (on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--text-strong))', font: 'inherit', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}>
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{o.ad}
    </button>); };
  /* Dar kap (seri sayfası 900, süzgeç yanında): masaüstü satır ızgarası sığmıyorsa satırlar mobil düzene geçer; yana taşma 0 (#10 ölçüm 10-25, 900'de 138 px taşıyordu). */
  const nS = sutunlar.length || 2, gerek = 72 + 170 + nS * 72 + 150 + 96 + (nS + 4) * 16 + 18;
  const sR = React.useRef(null); const [dar, setDar] = React.useState(false);
  React.useLayoutEffect(() => { const el = sR.current; if (!el || mobil) return; const h = () => setDar(el.clientWidth < gerek); h(); const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(h) : null; if (ro) ro.observe(el); return () => ro && ro.disconnect(); }, [mobil, gerek]);
  const satirMobil = mobil || dar;
  const satirlar = (
    <div ref={sR} style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 }}>
      {!satirMobil && sutunlar.length ? (
        <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: MODEL_SATIR_SUTUN(sutunlar.length), gap: '16px', padding: '0 12px 0 6px', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-body))' }}>
          <span></span><span>{M('ds.model-sutun')}</span>{sutunlar.map((s, i) => <span key={i}>{s}</span>)}<span style={{ textAlign: 'right' }}>{kip === 'satis' ? M('t.fiyat') : ''}</span><span></span>
        </div>
      ) : null}
      {gor.map((m) => <ModelRow key={m.sku} urun={m} kip={kip} mobil={satirMobil} seriGoster={seriGoster} degerSayisi={sutunlar.length || 2} onEkle={onEkle} onKarsilastir={onKarsilastir} onAc={onAc} metin={metin} yerel={yerel} />)}
      {!gor.length ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', minHeight: 'var(--hedef-min)', padding: '0 6px 0 14px', borderRadius: '12px', background: 'hsl(var(--surface-subtle))', fontSize: '14px' }}><span>{M('ds.secimle-model-yok')}</span><button type="button" onClick={() => koyF({})} style={{ minHeight: 'var(--hedef-min)', padding: '0 10px', border: 0, background: 'transparent', font: 'inherit', fontWeight: 600, color: 'hsl(var(--primary-navy))', cursor: 'pointer' }}>{M('t.temizle')}</button></div> : null}
      <Pagination toplam={uy.length} boyut={sayfaBoyutu} sayfa={c} onSayfa={koyS} kisa={mobil} metin={metin} style={{ marginTop: '8px' }} />
    </div>
  );
  return (
    <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', paddingBottom: mobil ? '150px' : 0, ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-baslik)', fontSize: mobil ? '20px' : '24px', fontWeight: 700 }}>{b}</h2>
        <span style={{ fontSize: '14px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{sayiEt}</span>
      </div>
      {mobil && sg && sg.secenekler.length > 1 ? <div style={{ position: 'sticky', top: mobilUst, zIndex: 3, margin: '0 calc(-1 * var(--space-page-mobile))', padding: '10px var(--space-page-mobile)', background: 'hsl(var(--surface-page))', borderBottom: '1px solid hsl(var(--border-hairline))', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>{seritL.map(cip)}</div> : null}
      {mobil && filtreDugmesi ? <button type="button" onClick={() => koyP(true)} style={{ height: 'var(--hedef-min)', borderRadius: '22px', border: '1px solid hsl(var(--primary-navy))', background: nF ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: nF ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))', font: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>{nF ? M('ds.filtrele-n', { n: nF }) : M('ds.filtrele')}</button> : null}
      {mobil ? satirlar : (
        <div style={{ display: 'grid', gridTemplateColumns: gruplar.length ? '240px minmax(0,1fr)' : 'minmax(0,1fr)', gap: '24px', alignItems: 'start' }}>
          {gruplar.length ? <aside aria-label={M('ds.filtrele')} style={{ padding: '16px', background: 'hsl(var(--surface-card))', borderRadius: 'var(--radius-kart)', border: '1px solid hsl(var(--border-hairline))' }}><FiltreGruplari gruplar={gruplar} secili={F} onDegis={koyF} modeller={modeller} dil={dil} /></aside> : null}
          {satirlar}
        </div>
      )}
      {mobil && P ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <button type="button" aria-label={M('t.kapat')} onClick={() => koyP(false)} style={{ flex: 1, border: 0, padding: 0, background: 'hsl(var(--text-strong) / 0.45)', cursor: 'pointer' }}></button>
          <div role="dialog" aria-label={M('ds.filtrele')} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '78%', padding: '10px 16px 16px', boxSizing: 'border-box', background: 'hsl(var(--surface-card))', borderRadius: '20px 20px 0 0', boxShadow: 'var(--shadow-overlay)' }}>
            <span aria-hidden="true" style={{ alignSelf: 'center', width: '40px', height: '4px', borderRadius: '2px', background: 'hsl(var(--border-control))' }}></span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontFamily: 'var(--font-baslik)', fontSize: '20px', fontWeight: 700 }}>{M('ds.filtrele')}</span><button type="button" onClick={() => koyP(false)} aria-label={M('t.kapat')} style={{ width: 'var(--hedef-min)', height: 'var(--hedef-min)', border: 0, background: 'transparent', fontSize: '22px', color: 'hsl(var(--primary-navy))', cursor: 'pointer' }}>×</button></div>
            <div style={{ overflowY: 'auto', minHeight: 0 }}><FiltreGruplari gruplar={gruplar} secili={F} onDegis={koyF} modeller={modeller} mobil dil={dil} /></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => koyF({})} style={{ flex: 'none', height: '48px', padding: '0 18px', borderRadius: '24px', border: '1px solid hsl(var(--border-control))', background: 'hsl(var(--surface-card))', font: 'inherit', fontSize: '15px', fontWeight: 600, color: 'hsl(var(--text-strong))', cursor: 'pointer' }}>{M('t.temizle')}</button>
              <button type="button" onClick={() => koyP(false)} style={{ flex: 1, height: '48px', borderRadius: '24px', border: 0, background: 'hsl(var(--primary-navy))', color: 'hsl(var(--text-on-dark))', font: 'inherit', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>{M('ds.n-modeli-goster', { n: uy.length })}</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
