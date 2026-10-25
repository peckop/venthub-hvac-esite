import React from 'react';

/* SectionRail — bölüm şeridi (depo components/ui/ScrollObserver.tsx davranışı · S5 6c-6, 6c-10 · Alternatifler 6a · kararlar 14, 16, 19, 38, 42).
 * Kombin (iş emri #7 madde 2, 9–11): kapağın üstünde, kapakla aynı sol hizada — iç boşluk 10 (mobil 8) üst/alt, yanda 0 (sayfa oluğu verir), dış boşluk 0, alt çizgi yok; bağlantı ve düğmelerde el imleci; bölüm yoksa da konum (mobil "‹ geri") çizilir.
 * Masaüstü: yapışkan, zemin surface-page, yükseklik 61; konum satırı solda TAM ve tek satır (kırılmaz, kesilmez · DESIGN-MENU denetim 10-23 madde 3);
 * sekmeler kalan yere sağa yaslı sığar (genişlik ölçülür), sığmayanlar sondan "Diğer (n) ⌄" listesine;
 * sekme 48 px, Onest 15, petrol yazı, dolgu yok; etkin 700 + altında 2 px petrol çizgi, öteki 600 çizgisiz (DESIGN-MENU 23 Ekim). Etkin sekme dışarıda kalmaz. `sigan` verilirse ölçüm yerine o sayı kullanılır.
 * Mobil: tek satır 44 px "‹ geri · Bölüm ⌄ n/m"; basınca şeridin altından liste (dolgu 2 18 10, köşe 0 0 8 8): üstte ‹ geri + sayfa adı, bölüm satırı 44 px 14/400 petrol;
 * bulunulan 48 px 16/700, solda 2 px petrol çizgi. Kaydırma izleme (ScrollObserver) çağıranın: etkin + onSec. */
export function SectionRail({ enCok = 4, konum, geri, sayfaAdi, bolumler = [], etkin, onSec, sigan, yapiskan = true, mobil = false, metin, style }) {
  const [acik, setAcik] = React.useState(false);
  const [olcuN, setOlcuN] = React.useState(null);
  const navR = React.useRef(null);
  const kokR = React.useRef(null), konumR = React.useRef(null), olcR = React.useRef(null), kOlcR = React.useRef(null), kAcR = React.useRef(null);
  const yapili = Array.isArray(konum), KL = yapili ? konum.filter((x) => x && x.ad != null) : [];
  const [katla, setKatla] = React.useState(0); /* 0: tam · 1: ilk + … + son iki · 2: ilk + … + son bir */
  const [kAcik, setKAcik] = React.useState(false);
  React.useEffect(() => { if (!kAcik) return; const esc = (e) => { if (e.key === 'Escape') setKAcik(false); }; const dis = (e) => { if (kAcR.current && !kAcR.current.contains(e.target)) setKAcik(false); }; document.addEventListener('keydown', esc); document.addEventListener('mousedown', dis); return () => { document.removeEventListener('keydown', esc); document.removeEventListener('mousedown', dis); }; }, [kAcik]);
  React.useLayoutEffect(() => {
    if (mobil || typeof sigan === 'number' || !kokR.current || !olcR.current) return;
    const hesap = () => {
      const k = kokR.current, o = olcR.current; if (!k || !o) return;
      const cs = getComputedStyle(k), ic = k.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const w = [...o.children].map((c) => c.offsetWidth), dW = w.pop(), N = w.length;
      let kW = konumR.current ? konumR.current.offsetWidth : 0;
      if (yapili && kOlcR.current && KL.length > 3) {
        /* Katlama (iş emri #9): konum + en az bir sekme + "Diğer (n)" sığmıyorsa orta seviyeler "…"ya. Ölçü: her öğe, ayraç, "…" düğmesi. */
        const c = [...kOlcR.current.children].map((x) => x.offsetWidth), ay = c[KL.length], el = c[KL.length + 1], oW = c.slice(0, KL.length);
        const gen = (gor, nokta) => gor.reduce((a, i) => a + oW[i], 0) + (gor.length - 1 + (nokta ? 1 : 0)) * ay + (nokta ? el : 0);
        const sekmeMin = N ? (w[0] + (N > 1 ? 4 + dW : 0)) : 0, L = KL.length;
        const secenek = [[gen([...Array(L).keys()], false), 0], [gen([0, L - 2, L - 1], true), 1], [gen([0, L - 1], true), 2]];
        const asti = L > enCok; /* #10 madde 4: 4 seviyeyi aşan yol sığsa da katlanır */
        let sec = secenek.find(([g], j) => (!asti || j > 0) && g + 16 + sekmeMin <= ic) || secenek[2];
        if (sec[1] !== katla) setKatla(sec[1]);
        kW = sec[0];
      }
      const kalan = ic - (konum ? kW + 16 : 0);
      let top = 0, n = 0;
      for (let i = 0; i < N; i++) { const ek = (i ? 4 : 0) + w[i], son = i === N - 1; if (top + ek + (son ? 0 : 4 + dW) <= kalan) { top += ek; n = i + 1; } else break; }
      setOlcuN(Math.max(1, n));
    };
    hesap();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(hesap) : null; if (ro) ro.observe(kokR.current);
    return () => ro && ro.disconnect();
  }, [mobil, sigan, bolumler.map((b) => b.ad).join('|'), yapili ? KL.map((x) => x.ad).join('|') : konum, katla]);
  React.useLayoutEffect(() => { /* güvenlik: ölçüm sonrası gerçek taşma kalırsa bir sekme daha Diğer'e (1220'de 25 px taşma, #10 ölçüm 10-25) */
    const k = kokR.current; if (mobil || typeof sigan === 'number' || !k || olcuN == null || olcuN <= 1) return;
    const nv = navR.current, kr = k.getBoundingClientRect(), pr = parseFloat(getComputedStyle(k).paddingRight) || 0;
    if (k.scrollWidth > k.clientWidth + 0.5 || (nv && nv.getBoundingClientRect().right > kr.right - pr + 0.5)) setOlcuN(olcuN - 1); /* sekme şeridi kabın sağ iç kenarını geçerse (960/1020'de 4–11 px) */
  });
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  if (!bolumler.length && !konum && !geri) return null; /* bölümsüz şerit: yalnız konum (masaüstü) ya da "‹ geri" (mobil) — kapaklar konum çizmez (iş emri #6 madde 4) */
  const ei = Math.max(0, bolumler.findIndex((b) => b.id === etkin));
  const git = (id) => { setAcik(false); onSec && onSec(id); };
  if (mobil) {
    const E = bolumler[ei];
    return (
      <div style={{ position: yapiskan ? 'sticky' : 'relative', top: 0, zIndex: 15, padding: '8px 0', margin: 0, fontFamily: 'var(--font-sans)', ...style }}>
        <div style={{ height: '44px', display: 'flex', alignItems: 'center', gap: '8px', padding: 0, background: 'hsl(var(--surface-page))', borderBottom: '1px solid hsl(var(--border-hairline))', fontSize: '14px', color: 'hsl(var(--primary-navy))' }}>
          {geri ? <a href={geri.href} onClick={geri.onClick} style={{ cursor: 'pointer', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'inherit', textDecoration: 'none', minHeight: 'var(--hedef-min)', display: 'flex', alignItems: 'center' }}>{'‹ ' + geri.ad}</a> : null}
          {E ? <button type="button" aria-expanded={acik} onClick={() => setAcik((v) => !v)} style={{ marginLeft: 'auto', flex: 'none', minHeight: 'var(--hedef-min)', padding: '0 0 0 12px', border: 0, borderLeft: '1px solid hsl(var(--border-hairline))', background: 'transparent', font: 'inherit', fontWeight: 600, color: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{(E.kisa || E.ad) + ' ⌄ ' + (ei + 1) + '/' + bolumler.length}</button> : null}
        </div>
        {acik && E ? (
          <nav aria-label={M('ds.bolumler')} style={{ position: 'absolute', left: 0, right: 0, top: '44px', padding: '2px 18px 10px', background: 'hsl(var(--surface-card))', borderRadius: '0 0 8px 8px', boxShadow: 'var(--shadow-overlay)', display: 'flex', flexDirection: 'column' }}>
            {geri || sayfaAdi ? <span style={{ minHeight: '44px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 4px', fontSize: '14px', color: 'hsl(var(--primary-navy))', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', borderBottom: '1px solid hsl(var(--border-row))' }}>{geri ? <a href={geri.href} onClick={geri.onClick} style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'none' }}>{'‹ ' + geri.ad}</a> : null}{sayfaAdi ? <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{(geri ? '· ' : '') + sayfaAdi}</span> : null}</span> : null}
            {bolumler.map((b, i) => {
              const on = i === ei;
              return <button key={b.id} type="button" aria-current={on ? 'location' : undefined} onClick={() => git(b.id)} style={{ minHeight: on ? '48px' : '44px', display: 'flex', alignItems: 'center', padding: on ? '0 4px 0 12px' : '0 4px', border: 0, borderLeft: on ? '2px solid hsl(var(--primary-navy))' : '2px solid transparent', background: 'transparent', font: 'inherit', fontSize: on ? '16px' : '14px', fontWeight: on ? 700 : 400, color: 'hsl(var(--primary-navy))', textAlign: 'left', cursor: 'pointer' }}>{b.ad}</button>;
            })}
          </nav>
        ) : null}
      </div>
    );
  }
  const n = typeof sigan === 'number' ? Math.max(1, Math.min(sigan, bolumler.length)) : olcuN != null ? Math.min(olcuN, bolumler.length) : bolumler.length;
  let gorunen = bolumler.slice(0, n), diger = bolumler.slice(n);
  if (diger.some((b) => b.id === etkin)) { const E = bolumler[ei]; gorunen = gorunen.slice(0, -1).concat(E); diger = bolumler.filter((b) => !gorunen.includes(b)); }
  const sekme = (b) => {
    const on = b.id === etkin;
    return <button key={b.id} type="button" aria-current={on ? 'location' : undefined} onClick={() => git(b.id)} style={{ flex: 'none', height: '48px', padding: '0 12px', boxSizing: 'border-box', border: 0, borderBottom: '2px solid ' + (on ? 'hsl(var(--primary-navy))' : 'transparent'), borderRadius: 0, background: 'transparent', color: 'hsl(var(--primary-navy))', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: on ? 700 : 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'border-color var(--hareket-hizli) var(--hareket-egri)' }}>{b.ad}</button>;
  };
  return (
    <div ref={kokR} style={{ position: yapiskan ? 'sticky' : 'relative', top: 0, zIndex: 15, minHeight: '61px', boxSizing: 'border-box', padding: '10px 0', margin: 0, background: 'hsl(var(--surface-page))', borderBottom: 0, display: 'flex', alignItems: 'center', gap: '16px', fontFamily: 'var(--font-sans)', ...style }}>
      {konum && !yapili ? <span ref={konumR} data-vh-konum="" style={{ flex: 'none', whiteSpace: 'nowrap', fontSize: '15px', color: 'hsl(var(--primary-navy))' }}><style>{'[data-vh-konum] a{cursor:pointer;color:inherit}'}</style>{konum}</span> : null}
      {yapili ? (() => {
        const L = KL.length, gizli = katla === 1 ? KL.slice(1, L - 2) : katla === 2 ? KL.slice(1, L - 1) : [], gor = katla === 1 ? [0, -1, L - 2, L - 1] : katla === 2 ? [0, -1, L - 1] : [...Array(L).keys()];
        const oge = (x, i) => i === L - 1 || !(x.href || x.onClick) ? <span key={i} aria-current={i === L - 1 ? 'page' : undefined}>{x.ad}</span> : <a key={i} href={x.href || '#'} onClick={x.onClick}>{x.ad}</a>;
        const ay = (k) => <span key={'a' + k} aria-hidden="true" style={{ padding: '0 6px' }}>›</span>;
        const parca = []; gor.forEach((i, k) => { if (k) parca.push(ay(k)); if (i === -1) parca.push(<span key="nokta" ref={kAcR} style={{ position: 'relative', display: 'inline-flex' }}><button type="button" aria-label={M('ds.konum-gizli-seviyeler')} aria-expanded={kAcik} onClick={() => setKAcik((v) => !v)} style={{ position: 'relative', minWidth: '28px', height: '28px', padding: '0 6px', border: 0, borderRadius: '14px', background: kAcik ? 'hsl(var(--surface-inset))' : 'transparent', font: 'inherit', color: 'inherit', cursor: 'pointer' }}><span aria-hidden="true" style={{ position: 'absolute', left: '-8px', right: '-8px', top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>…</button>{kAcik ? <nav aria-label={M('ds.konum-gizli-seviyeler')} style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 40, minWidth: '220px', padding: '6px', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: '16px', boxShadow: 'var(--shadow-overlay)', display: 'flex', flexDirection: 'column' }}>{gizli.map((x, j) => <a key={j} href={x.href || '#'} onClick={(e) => { setKAcik(false); x.onClick && x.onClick(e); }} style={{ display: 'flex', alignItems: 'center', minHeight: 'var(--hedef-min)', padding: '0 12px', borderRadius: '10px', color: 'hsl(var(--primary-navy))', textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'pointer' }}>{x.ad}</a>)}</nav> : null}</span>); else parca.push(oge(KL[i], i)); });
        return <nav ref={konumR} data-vh-konum="" aria-label={M('tx.e_konumN')} style={{ flex: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', fontSize: '15px', color: 'hsl(var(--primary-navy))' }}><style>{'[data-vh-konum] a{cursor:pointer;color:inherit;text-decoration:none}[data-vh-konum] a:hover{text-decoration:underline}'}</style>{parca}</nav>;
      })() : null}
      <div aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, overflow: 'hidden' }}>{/* ölçüm kopyaları kırpılır: sayfaya yana taşma vermez (900/960'ta 11 px, #10 ölçüm) */}
      {yapili ? <div ref={kOlcR} aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', left: 0, top: 0, display: 'flex', whiteSpace: 'nowrap', fontSize: '15px' }}>{KL.map((x, i) => <span key={i}>{x.ad}</span>)}<span style={{ padding: '0 6px' }}>›</span><span style={{ minWidth: '28px', padding: '0 6px', boxSizing: 'border-box' }}>…</span></div> : null}
      <div ref={olcR} aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', left: 0, top: 0, display: 'flex', whiteSpace: 'nowrap' }}>{bolumler.map((b) => <span key={b.id} style={{ flex: 'none', padding: '0 12px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 700 }}>{b.ad}</span>)}<span style={{ flex: 'none', padding: '0 16px', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600 }}>{M('ds.diger-n', { n: bolumler.length })}</span></div>
      </div>
      <nav ref={navR} aria-label={M('ds.bolumler')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0, flex: 'none' }}>
        {gorunen.map(sekme)}
        {diger.length ? (
          <span style={{ position: 'relative', flex: 'none' }}>
            <button type="button" aria-expanded={acik} onClick={() => setAcik((v) => !v)} style={{ height: '48px', padding: '0 16px', border: 0, borderRadius: 'var(--radius-dugme)', background: 'transparent', borderBottom: '2px solid transparent', borderRadius: 0, color: 'hsl(var(--primary-navy))', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}>{M('ds.diger-n', { n: diger.length })}</button>
            {acik ? <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', minWidth: '220px', padding: '6px', display: 'flex', flexDirection: 'column', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', boxShadow: 'var(--shadow-overlay)' }}>{diger.map((b) => <button key={b.id} type="button" onClick={() => git(b.id)} style={{ minHeight: 'var(--hedef-min)', padding: '0 12px', border: 0, borderRadius: 'var(--radius-kucuk)', background: 'transparent', font: 'inherit', fontSize: '15px', color: 'hsl(var(--primary-navy))', textAlign: 'left', cursor: 'pointer' }}>{b.ad}</button>)}</div> : null}
          </span>
        ) : null}
      </nav>
    </div>
  );
}
