import React from 'react';
import { HiyerarsiSimgesi } from '../hiyerarsi/HiyerarsiSimgesi.jsx';

/* MobileTree — mobil katalog ağacı (kart-dili-kararlar 10-24 · Kart Dili Akış v2 3a). FloatingNav'ın sol parçası açar; alttan panel "Kategori".
 * Satır iki parça: ad → o sayfaya gider (en az 44 px); sağda 44 px "⌄" yalnız o dalı yerinde açar (200 ms döner). Çocuksuz satırda ok yok.
 * Seviyeler: ürün grubu › ürün türü › ürün ailesi (yalnız 2+ seri; tek seri aile değildir, serisi doğrudan türün altına çıkar) › seri › model (en çok 12).
 * Girinti 12 + seviye × 16 px. Ad 15 (kök) / 14; ağırlık ürünler 600, grup–seri 500, model 400. Sağda sayı 12 text-body.
 * Bulunulan dal açık gelir (seri hariç); bulunulan satır: solda 3 px petrol çizgi, surface-subtle zemin, 700 petrol.
 * Her seviyenin simgesi o seviyenin ilk satırında (yazıyla birlikte), sonraki aynı seviyeli satırlarda yer boş kalır.
 * panel=true: perde + 20 px üst köşeli alt panel, tutamak, isteğe bağlı "Kategori | Filtrele" sekmeleri (filtre içeriği çağırandan). */
const SV = ['urunler', 'urun-grubu', 'urun-turu', 'urun-ailesi', 'seri', 'model'];
const duzle = (L) => L.flatMap((d) => d.seviye === 'urun-ailesi' && (d.cocuklar || []).length < 2 ? (d.cocuklar || []) : [d]).map((d) => ({ ...d, cocuklar: d.cocuklar ? duzle(d.seviye === 'seri' ? d.cocuklar.slice(0, 12) : d.cocuklar) : d.cocuklar }));
const yol = (L, id, y = []) => { for (const d of L) { if (d.id === id) return [...y, d]; const r = d.cocuklar ? yol(d.cocuklar, id, [...y, d]) : null; if (r) return r; } return null; };
export function MobileTree({ dugumler = [], bulunulan, onGit, panel = false, acik = true, onKapat, sekme = 'kategori', onSekme, filtre, filtreSayisi, filtreAlt, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const D = React.useMemo(() => duzle(dugumler), [dugumler]);
  const ilk = React.useMemo(() => { const y = yol(D, bulunulan) || [], o = {}; y.forEach((d, i) => { if (i < y.length - 1 || d.seviye !== 'seri') o[d.id] = true; }); return o; }, [D, bulunulan]);
  const [ac, setAc] = React.useState(ilk);
  React.useEffect(() => setAc(ilk), [ilk]);
  const satirlar = [];
  const yaz = (L, lvl) => L.forEach((d) => { const coc = (d.cocuklar || []).length > 0, a = !!ac[d.id]; satirlar.push({ d, lvl, coc, a }); if (coc && a) yaz(d.cocuklar, lvl + 1); });
  yaz(D, 0);
  const agac = (
    <div role="tree" aria-label={M('tx.markaKolK')} style={{ display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-sans)' }}>
      {satirlar.map(({ d, lvl, coc, a }, i) => {
        const on = d.id === bulunulan, sv = d.seviye || SV[Math.min(lvl, 5)], ikVar = !i || (satirlar[i - 1].d.seviye || '') !== sv;
        const fw = on ? 700 : sv === 'urunler' ? 600 : sv === 'model' ? 400 : 500;
        return (
          <div key={d.id} role="treeitem" aria-expanded={coc ? a : undefined} aria-current={on ? 'page' : undefined} style={{ display: 'flex', alignItems: 'stretch', borderLeft: '3px solid ' + (on ? 'hsl(var(--primary-navy))' : 'transparent'), background: on ? 'hsl(var(--surface-subtle))' : 'transparent' }}>
            <a href={d.href} onClick={(e) => { if (onGit) { e.preventDefault(); onGit(d); } else if (d.onClick) d.onClick(e); }} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px', minHeight: 'var(--hedef-min)', padding: '4px 8px 4px ' + (12 + lvl * 16) + 'px', boxSizing: 'border-box', textDecoration: 'none', color: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--text-strong))', fontSize: lvl ? '14px' : '15px', fontWeight: fw, lineHeight: 1.3 }}>
              <span style={{ flex: 'none', width: '18px', height: '18px' }}>{ikVar ? <HiyerarsiSimgesi seviye={sv} boyut={18} /> : null}</span>
              <span style={{ flex: 1, minWidth: 0, textWrap: 'pretty' }}>{d.ad}</span>
              {d.n != null ? <span style={{ flex: 'none', fontSize: '12px', fontWeight: 400, color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{d.n}</span> : null}
            </a>
            {coc ? <button type="button" onClick={() => setAc((o) => ({ ...o, [d.id]: !a }))} aria-label={(a ? M('ds.daralt', { ad: d.ad }) : M('ds.genislet', { ad: d.ad }))} style={{ flex: 'none', width: 'var(--hedef-min)', minHeight: 'var(--hedef-min)', padding: 0, border: 0, background: 'transparent', color: 'hsl(var(--primary-navy))', fontSize: '15px', cursor: 'pointer' }}><span aria-hidden="true" style={{ display: 'inline-block', transform: a ? 'rotate(180deg)' : 'none', transition: 'transform 200ms var(--hareket-egri)' }}>⌄</span></button> : <span aria-hidden="true" style={{ flex: 'none', width: 'var(--hedef-min)' }}></span>}
          </div>
        );
      })}
    </div>
  );
  if (!panel) return <div style={style}>{agac}</div>;
  if (!acik) return null;
  const sek = filtre ? [['kategori', M('tx.markaKolK')], ['filtre', (filtreSayisi ? M('ds.filtrele-n', { n: filtreSayisi }) : M('ds.filtrele'))]] : null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', ...style }}>
      <button type="button" aria-label={M('t.kapat')} onClick={onKapat} style={{ flex: 1, border: 0, padding: 0, background: 'hsl(var(--text-strong) / 0.45)', cursor: 'pointer' }}></button>
      <div role="dialog" aria-label={M('tx.markaKolK')} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '78%', padding: '10px 16px 16px', boxSizing: 'border-box', background: 'hsl(var(--surface-card))', borderRadius: '20px 20px 0 0', boxShadow: 'var(--shadow-overlay)', fontFamily: 'var(--font-sans)' }}>
        <span aria-hidden="true" style={{ alignSelf: 'center', width: '40px', height: '4px', borderRadius: '2px', background: 'hsl(var(--border-control))' }}></span>
        {sek ? (
          <div role="tablist" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '4px', borderRadius: '24px', background: 'hsl(var(--surface-subtle))' }}>
            {sek.map(([k, ad]) => { const on = sekme === k; return <button key={k} type="button" role="tab" aria-selected={on} onClick={() => onSekme && onSekme(k)} style={{ height: 'var(--hedef-min)', borderRadius: '20px', border: 0, background: on ? 'hsl(var(--surface-card))' : 'transparent', color: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--text-body))', boxShadow: on ? 'var(--shadow-ince)' : 'none', font: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>{ad}</button>; })}
          </div>
        ) : <span style={{ fontFamily: 'var(--font-baslik)', fontSize: '20px', fontWeight: 700 }}>{M('tx.markaKolK')}</span>}
        <div style={{ overflowY: 'auto', minHeight: 0, margin: '0 -16px' }}>{sek && sekme === 'filtre' ? <div style={{ padding: '0 16px' }}>{filtre}</div> : agac}</div>
        {sek && sekme === 'filtre' && filtreAlt ? filtreAlt : null}
      </div>
    </div>
  );
}
