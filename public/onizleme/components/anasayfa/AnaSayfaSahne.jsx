import React from 'react';

/* AnaSayfaSahne — ana sayfa üst sahnesi (iş emri #6 madde 1 · kaynak DESIGN-MENU "Ana Sayfa Sahne S5.dc.html", birebir).
 * Ürün grupları yarım çember üzerinde döner; öndeki grubun adı, sırası ve ilk üç ürün türü solda; "Teklif iste" (tek dolu kiremit, K5) + "İncele →" (çerçeveli).
 * Masaüstü 500 px, köşe 20, sürüklenir (170 px = bir grup), noktalarla seçilir; öndeki gruba basınca uçuş geçişi (ilk sefer uzun, sonra kısa) ve urun.onAc(id).
 * Mobil 500 px, kaydırmayla geçer, düğmeler alt satırda yan yana. Açılışta perde (1100 ms) açılır.
 * Kendi kendine dönme yalnız burada: masaüstünde 6 sn'de bir (iş emri #12); üstüne gelince durur, son etkileşimden 6 sn sonra sürer. Mobilde kendiliğinden dönmez: yalnız kaydırma ve noktalar. "Hareketi azalt" açıkken dönmez, perde ve uçuş yok.
 * Renkler token: sahne tonları --sahne-ton-1…13 (tokens/sahne.css), yazı --text-strong/--text-body, vurgu --primary-navy, düğme --action-terracotta-deep.
 * Üst etiket Onest (kaynakta IBM Plex Mono). Zemin geçişi gradyan istisnası (ana sayfa sahnesi). Metin `metin`den; grup adı ve türler veriden.
 * Sayfa geneline kural yazmaz: tek <style> kökün [data-vh-sahne] seçicisine bağlı. */
const T = (v, a) => 'hsl(var(' + v + ')' + (a != null ? ' / ' + a : '') + ')';
const SAHNE_CSS = '[data-vh-sahne] [data-sahne-urun]:hover,[data-vh-sahne] [data-sahne-urun]:focus{background:transparent !important;background-image:none !important;outline:none !important}';
const yumus = (t) => t * t * (3 - 2 * t);
export function AnaSayfaSahne({ urunler = [], kip = 'teklif', onTeklif, mobil = false, metin, style }) {
  const M = (k) => { const s = metin && metin[k]; return s == null ? '\u27E6' + k + '\u27E7' : s; };
  const SAT = kip === 'satis';
  const G = urunler || [], n = G.length || 1;
  const azalt = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [s, setS] = React.useState({ dI: 0, dF: null, dDur: false, dmI: 0, dmF: null, perde: !azalt, gec: null });
  const sR = React.useRef(s); sR.current = s;
  const set = (x) => setS((o) => ({ ...o, ...(typeof x === 'function' ? x(o) : x) }));
  const R = React.useRef({ drag: null, sonEl: 0, yut: false, n: 0, tx: 0, uzerinde: false, gecT: null, gSk: null });
  const nR = React.useRef(n); nR.current = n;
  React.useEffect(() => {
    const r = R.current;
    const puW = () => { r.drag = null; };
    window.addEventListener('pointerup', puW);
    const yak = (f, t, N) => { if (f == null) return t; let d = ((t - f) % N + N) % N; if (d > N / 2) d -= N; return Math.abs(d) < 0.004 ? t : ((f + d * 0.09) % N + N) % N; };
    const orb = setInterval(() => { const o = sR.current, N = nR.current; if (!N) return; const a = r.drag ? o.dF : yak(o.dF, o.dI, N), b = yak(o.dmF, o.dmI, N); if (a !== o.dF || b !== o.dmF) set({ dF: a, dmF: b }); }, 16);
    const t0 = azalt ? null : setTimeout(() => set({ perde: false }), 400);
    const iv = azalt ? null : setInterval(() => {
      const o = sR.current, N = nR.current; if (!N) return; r.n++;
      if (r.n % 150 === 0) { /* iş emri #12 A: masaüstü 6 sn (150 × 40 ms); mobil kendiliğinden dönmez */
        const bos = Date.now() - (r.sonEl || 0) > 6000;
        const up = {};
        if (o.dDur && !r.drag && !o.gec && bos && !r.uzerinde) up.dDur = false;
        if (!o.dDur && !r.drag && !o.gec && !r.uzerinde) up.dI = (o.dI + 1) % N;
        set(up);
      }
    }, 40);
    return () => { clearTimeout(r.gecT); window.removeEventListener('pointerup', puW); clearInterval(orb); clearInterval(iv); clearTimeout(t0); };
  }, []);
  const git = (g) => (e) => {
    if (sR.current.gec || !g) return;
    const src = e && e.currentTarget, img = src && [...src.querySelectorAll('span')].find((x) => /url\(/.test(x.style.background || x.style.backgroundImage || ''));
    const KISA = g.kisaAd || g.ad;
    const gir = (t0) => {
      const t1 = Date.now();
      const ara = () => {
        const sec = document.querySelector('[data-screen-label="Kategori"]');
        const hb = sec && [...sec.querySelectorAll('button')].find((b) => b.style.minHeight === '250px' && b.getBoundingClientRect().width > 80);
        if (!hb) { if (Date.now() - t1 < 1500) return setTimeout(ara, 40); return; }
        const Rb = hb.getBoundingClientRect(); const sk = Math.round(Rb.top) + ':' + Math.round(window.scrollY);
        if (R.current.gSk !== sk || Date.now() - t1 < 160) { R.current.gSk = sk; if (Date.now() - t1 < 1500) return setTimeout(ara, 50); }
        if (Rb.top > window.innerHeight || Rb.bottom < 0) return;
        { const hd2 = [...document.querySelectorAll('a,button')].find((x) => (x.innerText || '').trim() === KISA && x.getBoundingClientRect().height > 0 && x.getBoundingClientRect().top >= 0 && x.getBoundingClientRect().top < 200); if (hd2) { const q = (hd2.querySelector('img,svg') || hd2).getBoundingClientRect(); t0 = { left: q.left, top: q.top, width: q.width, height: q.height, m: t0.m ? { x: t0.m.x, y: t0.m.y - (t0.top - q.top) } : null }; } }
        hb.style.opacity = '0';
        const k2 = document.createElement('div'); Object.assign(k2.style, { position: 'fixed', left: t0.left + 'px', top: t0.top + 'px', width: t0.width + 'px', height: t0.height + 'px', background: 'url(' + g.foto + ') center / contain no-repeat', zIndex: 9999, pointerEvents: 'none' }); document.body.appendChild(k2);
        const ic = { x: t0.left + t0.width / 2, y: t0.top + t0.height / 2 }, son = { x: Rb.left + Rb.width / 2, y: Rb.top + Rb.height / 2, w: Rb.width * 0.8, h: Rb.height * 0.8 }, mz = t0.m || ic, ux = ic.x + (mz.x - ic.x) * 0.38, uy = ic.y + (mz.y - ic.y) * 0.38, bx = ux + (son.x - ux) * 0.55, by = uy + (son.y - uy) * 0.35, bw = son.w * 0.55, bh = son.h * 0.55;
        const kf = (x, y, w, h, o, off) => { const f = { left: x - w / 2 + 'px', top: y - h / 2 + 'px', width: w + 'px', height: h + 'px', opacity: o }; if (off != null) f.offset = off; return f; };
        const a2 = k2.animate([kf(ic.x, ic.y, t0.width, t0.height, 0.4), kf(ux, uy, bw * 0.6, bh * 0.6, 0.9, 0.35), kf(bx, by, bw, bh, 1, 0.65), kf(son.x, son.y, son.w, son.h, 1)], { duration: 760, easing: 'cubic-bezier(.3,.1,.2,1)', fill: 'forwards' });
        a2.onfinish = () => { hb.style.transition = 'opacity 180ms ease'; hb.style.opacity = '1'; setTimeout(() => { k2.remove(); hb.style.transition = ''; }, 200); };
      };
      ara();
    };
    const bitir = (t0) => { if (g.onAc) g.onAc(g.id); if (t0) gir(t0); R.current.gecT = setTimeout(() => set({ gec: null }), 400); };
    set({ gec: g.id }); clearTimeout(R.current.gecT);
    let kac = 0; try { kac = +(sessionStorage.getItem('vh-sahne-gec') || 0); sessionStorage.setItem('vh-sahne-gec', String(kac + 1)); } catch (x) {}
    const kisa = kac >= 1;
    if (azalt) { if (g.onAc) g.onAc(g.id); R.current.gecT = setTimeout(() => set({ gec: null }), 50); return; }
    if (!img || !img.animate) { R.current.gecT = setTimeout(bitir, 500); return; }
    const r = img.getBoundingClientRect(), vw = window.innerWidth, vh = window.innerHeight;
    const hd = [...document.querySelectorAll('a,button')].find((x) => (x.innerText || '').trim() === KISA && x.getBoundingClientRect().height > 0 && x.getBoundingClientRect().top >= 0);
    const t = hd ? (hd.querySelector('img,svg') || hd).getBoundingClientRect() : { left: vw / 2 - 12, top: 8, width: 24, height: 24 };
    const k = document.createElement('div'); Object.assign(k.style, { position: 'fixed', left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', background: 'url(' + g.foto + ') center / contain no-repeat', zIndex: 9999, pointerEvents: 'none', transformOrigin: '50% 50%', filter: 'drop-shadow(0 18px 24px ' + T('--text-strong', '.22') + ')' }); document.body.appendChild(k);
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, mx = vw / 2, my = Math.min(vh * 0.5, r.top + r.height / 2), S = Math.min(1.7, (Math.min(vw, vh) * 0.62) / Math.max(r.width, r.height)), tx = t.left + t.width / 2, ty = t.top + t.height / 2, ts = Math.max(t.width, t.height) / Math.max(r.width, r.height);
    const a = k.animate(kisa ? [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + (tx - cx) + 'px,' + (ty - cy) + 'px) scale(' + ts + ')', opacity: 0.35 }] : [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + (mx - cx) + 'px,' + (my - cy) + 'px) scale(' + S + ')', opacity: 1, offset: 0.45 }, { transform: 'translate(' + (mx - cx) + 'px,' + (my - cy) + 'px) scale(' + S + ')', opacity: 1, offset: 0.55 }, { transform: 'translate(' + (tx - cx) + 'px,' + (ty - cy) + 'px) scale(' + ts + ')', opacity: 0.35 }], { duration: kisa ? 480 : 820, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'forwards' });
    a.onfinish = () => { k.remove(); if (hd && hd.animate) hd.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 260, easing: 'ease-out' }); setTimeout(() => bitir({ left: t.left, top: t.top, width: t.width, height: t.height, m: kisa ? null : { x: mx, y: my } }), kisa ? 60 : 160); };
  };
  const sira = (i) => String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
  const relF = (i, f) => { let x = ((i - f) % n + n) % n; if (x > n / 2) x -= n; return x; };
  const posD = (dd, mob, komsu, kendi) => {
    const th = dd / n * Math.PI * 2, sn = Math.sin(th), cs = Math.cos(th), dep = (cs + 1) / 2, rx = 36, cx = mob ? 50 : 59;
    const sc = (mob ? 0.62 * (0.22 + 0.78 * dep * dep) : 0.84 * (0.32 + 0.68 * dep)) * (1 - 0.38 * yumus(Math.min(1, Math.abs(dd))) * Math.max(mob ? (komsu || 0) : 0, kendi ? 1 : 0));
    const gizli = mob && Math.abs(dd) > 1.6, xp = cx + rx * sn, kenar = mob ? 1 : Math.max(0, Math.min(1, (99 - xp) / 5));
    return { x: xp.toFixed(2) + '%', y: Math.round((mob ? 120 : 64) + (1 - dep) * (mob ? 40 : 74)) + 'px', tf: 'perspective(900px) rotateY(' + (-sn * 38).toFixed(1) + 'deg) scale(' + sc.toFixed(3) + ')', op: gizli ? '0' : ((0.3 + 0.7 * dep) * kenar).toFixed(2), z: Math.round(dep * 100), vis: gizli ? 'hidden' : 'visible', fl: dep < 0.55 ? 'blur(' + ((0.55 - dep) * 3).toFixed(1) + 'px) saturate(' + (0.6 + dep).toFixed(2) + ')' : 'none', gol: (0.08 + 0.26 * dep * dep).toFixed(2), gol2: (0.06 + 0.24 * dep * dep).toFixed(2) };
  };
  const oge = (g, i, f, mob, sel) => {
    const dd = relF(i, f), pI = G.findIndex((x) => x.id === 'perde'), kW = pI < 0 ? 0 : yumus(Math.max(0, 1 - Math.abs(relF(pI, f))));
    const hava = g.hava || 0, gl = (g.golge || [15, 85])[0], gr = (g.golge || [15, 85])[1];
    let p = posD(dd, mob, kW, g.id === 'perde');
    if (g.olcek && g.olcek !== 1) p = { ...p, tf: p.tf.replace(/scale\(([\d.]+)\)/, (m, v) => 'scale(' + (v * g.olcek).toFixed(3) + ')') };
    const gec = s.gec ? { op: '0', trn: s.gec === g.id ? 'none' : 'opacity 300ms ease' } : { trn: 'none' };
    return { g, i, hava, havaM: Math.round(hava * 1.1), golM: hava ? '0.45' : '1', golW: (gr - gl) + '%', golL: gl + '%', golB: (hava ? -14 - hava * 0.2 : -8) + 'px', golH: (hava ? 16 : 22) + 'px', golBl: (hava ? 6 : 2) + 'px', ...p, ...gec, git: i === sel ? git(g) : () => set(mob ? { dmI: i } : { dI: i, dDur: true }) };
  };
  if (!G.length) return null;
  const gd = G[s.dI] || G[0], gdm = G[s.dmI] || G[0];
  const tOn = M(SAT ? 'ds.sahne-on-satis' : 'ds.sahne-on-teklif'), tSon = M(SAT ? 'ds.sahne-son-satis' : 'ds.sahne-son-teklif');
  const tTeklif = SAT ? M('t.sepetim') : M('tx.teklifIsteKisa'), tIncele = M('tx.incele');
  const kel = (g) => g.kelime || M('ds.sahne-kelime-' + g.id);
  const perdeSol = s.perde ? 'translateX(0)' : 'translateX(-101%)', perdeSag = s.perde ? 'translateX(0)' : 'translateX(101%)';
  const perde = <><div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '50%', background: T('--text-strong'), transform: perdeSol, transition: 'transform 1100ms cubic-bezier(.7,0,.2,1)', zIndex: 40 }}></div><div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '50%', background: T('--text-strong'), transform: perdeSag, transition: 'transform 1100ms cubic-bezier(.7,0,.2,1)', zIndex: 40 }}></div></>;
  const etiketSt = { fontFamily: 'var(--font-sans)', fontSize: '13px' /* en küçük yazı 13 (iş emri #12 ölçümü: 12 idi) */, letterSpacing: '0.08em', color: T('--text-body') };
  const nokta = (sel, on, mob) => G.map((g, i) => { const a = i === sel; return <button key={g.id} type="button" onClick={() => { R.current.sonEl = Date.now(); set(mob ? { dmI: i } : { dI: i, dDur: true }); }} aria-label={g.ad} aria-current={a} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '44px', padding: mob ? '0 3px' : '0 4px', border: 0, background: 'transparent', cursor: 'pointer' }}><span style={{ display: 'block', width: a ? (mob ? '18px' : '22px') : (mob ? '6px' : '8px'), height: mob ? '6px' : '8px', borderRadius: mob ? '3px' : '4px', background: a ? T('--text-strong') : T('--border-control'), transition: 'width 200ms ease' }}></span></button>; });
  if (!mobil) {
    const f = s.dF == null ? s.dI : s.dF;
    const d = {
      pd: (e) => { R.current.sonEl = Date.now(); if (e.button !== 0 || (e.target.closest && e.target.closest('[data-sabit]'))) return; R.current.drag = { x: e.clientX, f: s.dF == null ? s.dI : s.dF, mv: false, el: e.currentTarget, id: e.pointerId }; },
      pm: (e) => { const D = R.current.drag; if (!D) return; const dx = e.clientX - D.x; if (!D.mv && Math.abs(dx) > 6) { D.mv = true; try { D.el.setPointerCapture(D.id); } catch (x) {} set({ dDur: true }); } if (!D.mv) return; const ff = ((D.f - dx / 170) % n + n) % n; set({ dF: ff, dI: Math.round(ff) % n }); },
      pu: () => { R.current.sonEl = Date.now(); const D = R.current.drag; if (!D) return; R.current.drag = null; R.current.yut = D.mv; if (!D.mv) return; const ff = sR.current.dF == null ? s.dI : sR.current.dF; set({ dI: Math.round(ff) % n }); },
      cc: (e) => { if (R.current.yut) { R.current.yut = false; e.stopPropagation(); e.preventDefault(); } },
    };
    const gecOp = s.gec ? '0' : '1', gecBeyaz = s.gec ? '0.85' : '0';
    return (
      <div data-vh-sahne="" onPointerDown={d.pd} onPointerMove={d.pm} onPointerUp={d.pu} onPointerCancel={d.pu} onMouseEnter={() => { R.current.uzerinde = true; }} onMouseLeave={() => { R.current.uzerinde = false; R.current.drag = null; }} onClickCapture={d.cc} style={{ position: 'relative', height: '500px', overflow: 'hidden', borderRadius: '20px', cursor: R.current.drag ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'pan-y', background: 'linear-gradient(180deg,' + T('--sahne-ton-1') + ' 0%,' + T('--sahne-ton-2') + ' 56%,' + T('--sahne-ton-3') + ' 100%)', perspective: '1100px', ...style }}>
        <style>{SAHNE_CSS}</style>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '56%', background: 'linear-gradient(180deg,' + T('--sahne-ton-6') + ' 0%,' + T('--sahne-ton-7') + ' 70%,' + T('--sahne-ton-8') + ' 100%)' }}></div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '56%', background: 'radial-gradient(34% 120% at 59% 0%,' + T('--surface-card', '0.95') + ' 0%,' + T('--surface-card', '0') + ' 72%)' }}></div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(56% - 46px)', height: '92px', background: 'linear-gradient(180deg,' + T('--sahne-ton-8', '0') + ' 0%,' + T('--sahne-ton-9') + ' 50%,' + T('--sahne-ton-9', '0') + ' 100%)' }}></div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '6%', transformOrigin: '0 50%', transform: 'perspective(900px) rotateY(58deg)', background: 'linear-gradient(90deg,' + T('--sahne-ton-4') + ' 0%,' + T('--sahne-ton-5') + ' 100%)' }}></div>
        <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '6%', transformOrigin: '100% 50%', transform: 'perspective(900px) rotateY(-58deg)', background: 'linear-gradient(270deg,' + T('--sahne-ton-4') + ' 0%,' + T('--sahne-ton-5') + ' 100%)' }}></div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '18px', background: 'linear-gradient(180deg,' + T('--sahne-ton-10') + ',' + T('--sahne-ton-10', '0') + ')' }}></div>
        <div style={{ position: 'absolute', left: '-10%', right: '-10%', bottom: '-40px', height: '290px', transform: 'rotateX(68deg)', transformOrigin: '50% 100%', background: 'repeating-linear-gradient(90deg,' + T('--text-strong', '0.05') + ' 0 1px,transparent 1px 90px),radial-gradient(42% 60% at 62% 38%,' + T('--surface-card') + ' 0%,' + T('--sahne-ton-11') + ' 70%,' + T('--sahne-ton-12') + ' 100%)' }}></div>
        {G.map((g, i) => { const o = oge(g, i, f, false, s.dI); return (
          <button key={g.id} type="button" data-sahne-urun="1" onClick={o.git} aria-label={g.ad} style={{ position: 'absolute', left: o.x, bottom: o.y, width: '280px', height: '250px', marginLeft: '-140px', padding: 0, border: 0, outline: 'none', WebkitTapHighlightColor: 'transparent', background: 'transparent', cursor: 'inherit', transformOrigin: '50% 100%', transform: o.tf, opacity: o.op, zIndex: o.z, visibility: o.vis, filter: o.fl, transition: o.trn }}>
            <span style={{ position: 'absolute', left: o.golL, width: o.golW, bottom: o.golB, height: o.golH, borderRadius: '50%', background: 'radial-gradient(closest-side,' + T('--text-strong', o.gol) + ',' + T('--text-strong', '0') + ')', filter: 'blur(' + o.golBl + ')' }}></span>
            <span style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: o.hava + 'px', background: 'url(' + g.foto + ') center bottom / contain no-repeat', filter: 'drop-shadow(0 12px 10px ' + T('--text-strong', o.gol2) + ')' }}></span>
          </button>
        ); })}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 280, pointerEvents: 'none', background: 'radial-gradient(60% 70% at 50% 55%,' + T('--surface-card') + ' 0%,' + T('--sahne-ton-13') + ' 100%)', opacity: gecBeyaz, transition: 'opacity 500ms ease' }}></div>
        <div data-sabit="1" style={{ opacity: gecOp, transition: 'opacity 250ms ease', textShadow: '0 0 18px ' + T('--sahne-ton-3', '0.95') + ',0 0 4px ' + T('--sahne-ton-3', '0.9'), position: 'absolute', left: '40px', top: '40px', display: 'flex', flexDirection: 'column', gap: '14px', width: 'min(520px,44%)', zIndex: 200, cursor: 'auto' }}>
          <span style={etiketSt}>{sira(s.dI) + ' · ' + gd.ad}</span>
          <h1 style={{ margin: 0, fontSize: 'clamp(28px,2.7vw,38px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: T('--text-strong') }}><span style={{ display: 'block' }}>{tOn}</span><span style={{ display: 'block', whiteSpace: 'nowrap', color: T('--primary-navy') }}>{kel(gd)}</span><span style={{ display: 'block' }}>{tSon}</span></h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>{(gd.alt || []).slice(0, 3).map((c, i) => <span key={i} style={{ display: 'block', fontSize: '15px', lineHeight: 1.4, color: T('--text-body') }}>{c}</span>)}</div>
        </div>
        <div data-sabit="1" style={{ opacity: gecOp, transition: 'opacity 250ms ease', position: 'absolute', left: '40px', bottom: '28px', display: 'flex', alignItems: 'center', gap: '28px', zIndex: 200, cursor: 'auto' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => onTeklif && onTeklif()} style={{ minHeight: '48px', padding: '0 24px', border: 0, borderRadius: '24px', background: T('--action-terracotta-deep'), color: T('--surface-card'), font: 'inherit', fontSize: '16px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{tTeklif}</button>
            <button type="button" onClick={git(gd)} style={{ minHeight: '48px', padding: '0 22px', border: '1.5px solid ' + T('--primary-navy'), borderRadius: '24px', background: T('--surface-card'), color: T('--primary-navy'), font: 'inherit', fontSize: '16px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{tIncele}</button>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>{nokta(s.dI, null, false)}</div>
        </div>
        {perde}
      </div>
    );
  }
  const fm = s.dmF == null ? s.dmI : s.dmF;
  return (
    <div data-vh-sahne="" onTouchStart={(e) => { R.current.tx = e.touches[0].clientX; R.current.sonEl = Date.now(); }} onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - (R.current.tx || 0); if (Math.abs(dx) > 30) set({ dmI: (s.dmI + (dx < 0 ? 1 : -1) + n) % n }); }} style={{ position: 'relative', width: '100%', height: '500px', overflow: 'hidden', borderRadius: '20px', background: 'linear-gradient(180deg,' + T('--sahne-ton-1') + ' 0%,' + T('--sahne-ton-2') + ' 50%,' + T('--sahne-ton-3') + ' 100%)', perspective: '900px', touchAction: 'pan-y', ...style }}>
      <style>{SAHNE_CSS}</style>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '290px', background: 'linear-gradient(180deg,' + T('--sahne-ton-6') + ' 0%,' + T('--sahne-ton-7') + ' 70%,' + T('--sahne-ton-8') + ' 100%)' }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '290px', background: 'radial-gradient(34% 120% at 50% 0%,' + T('--surface-card', '0.95') + ' 0%,' + T('--surface-card', '0') + ' 72%)' }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(290px - 46px)', height: '92px', background: 'linear-gradient(180deg,' + T('--sahne-ton-8', '0') + ' 0%,' + T('--sahne-ton-9') + ' 50%,' + T('--sahne-ton-9', '0') + ' 100%)' }}></div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '5%', transformOrigin: '0 50%', transform: 'perspective(900px) rotateY(58deg)', background: 'linear-gradient(90deg,' + T('--sahne-ton-4') + ' 0%,' + T('--sahne-ton-5') + ' 100%)' }}></div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '5%', transformOrigin: '100% 50%', transform: 'perspective(900px) rotateY(-58deg)', background: 'linear-gradient(270deg,' + T('--sahne-ton-4') + ' 0%,' + T('--sahne-ton-5') + ' 100%)' }}></div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '18px', background: 'linear-gradient(180deg,' + T('--sahne-ton-10') + ',' + T('--sahne-ton-10', '0') + ')' }}></div>
      <div style={{ position: 'absolute', left: '-20%', right: '-20%', bottom: '90px', height: '200px', transform: 'rotateX(68deg)', transformOrigin: '50% 100%', background: 'repeating-linear-gradient(90deg,' + T('--text-strong', '0.05') + ' 0 1px,transparent 1px 60px),radial-gradient(45% 60% at 50% 40%,' + T('--surface-card') + ' 0%,' + T('--sahne-ton-11') + ' 70%,' + T('--sahne-ton-12') + ' 100%)' }}></div>
      {G.map((g, i) => { const o = oge(g, i, fm, true, s.dmI); return (
        <button key={g.id} type="button" data-sahne-urun="1" onClick={o.git} aria-label={g.ad} tabIndex={i === s.dmI ? 0 : -1} aria-hidden={i === s.dmI ? undefined : 'true'} style={{ pointerEvents: i === s.dmI ? 'auto' : 'none' /* mobil: arkadaki küçülmüş kareler basılmaz (basma alanı < 44, #13 ölçümü); geçiş kaydırma ve noktalarla */, position: 'absolute', left: o.x, bottom: o.y, width: '220px', height: '200px', marginLeft: '-110px', padding: 0, border: 0, background: 'transparent', transformOrigin: '50% 100%', transform: o.tf, opacity: o.op, zIndex: o.z, visibility: o.vis, filter: o.fl, transition: 'none' }}>
          <span style={{ position: 'absolute', left: '12%', right: '12%', bottom: '-8px', height: '20px', borderRadius: '50%', opacity: o.golM, background: 'radial-gradient(closest-side,' + T('--text-strong', o.gol) + ',' + T('--text-strong', '0') + ')' }}></span>
          <span style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: o.havaM + 'px', background: 'url(' + g.foto + ') center bottom / contain no-repeat', filter: 'drop-shadow(0 16px 14px ' + T('--text-strong', o.gol2) + ')', transition: 'bottom 600ms cubic-bezier(.2,.9,.25,1)' }}></span>
        </button>
      ); })}
      <div style={{ position: 'absolute', left: '18px', right: '18px', top: '20px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 200 }}>
        <span style={etiketSt}>{sira(s.dmI) + ' · ' + gdm.ad}</span>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15, color: T('--text-strong') }}>{tOn + ' '}<span style={{ color: T('--primary-navy') }}>{kel(gdm)}</span>{' ' + tSon}</h1>
      </div>
      <div style={{ position: 'absolute', left: '18px', right: '18px', bottom: '14px', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '6px', zIndex: 200 }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>{nokta(s.dmI, null, true)}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={git(gdm)} style={{ flex: '1 1 0', boxSizing: 'border-box', minWidth: 0, minHeight: '44px', padding: '0 14px', border: '1.5px solid ' + T('--primary-navy'), borderRadius: '22px', background: T('--surface-card'), color: T('--primary-navy'), font: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{tIncele}</button>
          <button type="button" onClick={() => onTeklif && onTeklif()} style={{ flex: '1 1 0', boxSizing: 'border-box', minWidth: 0, minHeight: '44px', padding: '0 14px', border: '1.5px solid ' + T('--action-terracotta-deep'), borderRadius: '22px', background: T('--action-terracotta-deep'), color: T('--surface-card'), font: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>{tTeklif}</button>
        </div>
      </div>
      {perde}
    </div>
  );
}
