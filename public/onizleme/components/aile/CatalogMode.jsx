import React from 'react';

/* CatalogMode — aynı sayfanın katalog kipi (iş emri #2 blok 13 · iş emri #4 madde 5, Recep 10-24). Kapaktaki "Katalog modu" çipi açar; "Siteye dön" kapatır.
 * Bizim dilde yalnız çerçeve: zemin --primary-navy; üst çubuk (yapışkan): "‹ Siteye dön" (44) · başlık (Schibsted 18/700) · "‹ s. n / N ›" (44, tabular);
 *   masaüstünde altında atlama çipleri (tablo, eğri): 36 görünür / 44 basılır, seçili beyaz dolu.
 *   Mobil (ds-cevap 10-24f madde 3): üst çubuk tek satır ≤ 64 px (‹ Siteye dön · ‹ s. n / N ›); atlama çipleri ve modeller altta "Bölümler" düğmesiyle açılan panelde.
 * "Bu sayfadaki modeller" (ds-cevap 10-24f madde 4, Recep onaylı): katmandaki tıklanır adlardan çip listesi, 36 görünür / 44 basılır — asıl yol; sayfadaki adlar ek yol.
 *   Masaüstünde sayfanın altında; mobilde "Bölümler" panelinde (atlama çiplerinin altında).
 * Archivo (madde 5, Recep onaylı): metin katmanı Archivo 400–700; yazı tipi yalnız bu kip açılınca yüklenir (<link id="vh-archivo-katalog">). Sitenin başka yerinde yok;
 *   kılavuzdaki "Archivo yalnız logo" kuralına katalog istisnası.
 * Sayfa PDF görünümüyle, katalog gibi kalır: 595×842 en-boy; `zemin` görseli (yazısız katalog sayfası) + üstüne konumlu metin katmanı (gerçek yazı, seçilebilir, aranabilir)
 *   + tıklanır model adları (katmandaki öğenin 8. alanı model anahtarı → onModel). Metin boyu cqw: sayfa genişliğine göre ölçeklenir.
 *   Masaüstü sayfa en çok 820 px, ortada; mobilde ekran genişliğinde (kenar boşluğu yok), yakınlaştırma serbest.
 *   Katman öğesi: [x%, y% (taban çizgisi), boy cqw, yazı, kalın 0/1, renk, açı°, model anahtarı]. Kaynak: İçerik projesi lineo-sayfa/veri-sayfalari.js (yalnız okundu).
 *   Katman dile göre ayrı gelir (TR/EN); dizi değilse sayfa yazısı çizilmez (TR'ye düşülmez). Katman yokken kip açılmamalı: giriş çipini çağıran çizmez (K7).
 * Parça adres yazmaz; adres çağıranda. Teklif/sepet bu kipte yok. */
export function CatalogMode({ baslik, sayfalar = [], toplam, sayfa, onSayfa, atlamalar = [], onSiteyeDon, onModel, mobil = false, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [icS, setIcS] = React.useState(sayfalar[0] ? sayfalar[0].no : 1);
  const cur = sayfa ?? icS, i = Math.max(0, sayfalar.findIndex((p) => p.no === cur)), P = sayfalar[i];
  const N = toplam ?? (sayfalar.length ? sayfalar[sayfalar.length - 1].no : 1);
  const git = (no) => { if (sayfa === undefined) setIcS(no); onSayfa && onSayfa(no); };
  const [panel, setPanel] = React.useState(false);
  React.useEffect(() => { if (typeof document === 'undefined' || document.getElementById('vh-archivo-katalog')) return; const l = document.createElement('link'); l.id = 'vh-archivo-katalog'; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,400..700&display=swap'; document.head.appendChild(l); }, []);
  if (!P) return null;
  const modeller = []; if (Array.isArray(P.katman)) { const g = {}; P.katman.forEach((o) => { if (o[7] && !g[o[7]]) { g[o[7]] = 1; modeller.push({ k: o[7], ad: o[3] }); } }); }
  const okS = (pasif) => ({ flex: 'none', width: 'var(--hedef-min)', height: 'var(--hedef-min)', borderRadius: '22px', border: '1px solid ' + (pasif ? 'hsl(var(--text-on-dark) / 0.25)' : 'hsl(var(--text-on-dark) / 0.6)'), background: 'transparent', color: pasif ? 'hsl(var(--text-on-dark-muted))' : 'hsl(var(--text-on-dark))', font: 'inherit', fontSize: '18px', cursor: pasif ? 'default' : 'pointer' });
  const nav = (
    <div style={{ display: 'flex', alignItems: 'center', gap: mobil ? '4px' : '8px', flex: 'none' }}>
      <button type="button" onClick={() => i > 0 && git(sayfalar[i - 1].no)} aria-disabled={i === 0} aria-label={M('ds.onceki-katalog-sayfasi')} style={okS(i === 0)}>‹</button>
      <span aria-live="polite" style={{ minWidth: mobil ? '68px' : '92px', textAlign: 'center', fontSize: '15px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{M('ds.katalog-sayfa-n', { n: P.no, N })}</span>
      <button type="button" onClick={() => i < sayfalar.length - 1 && git(sayfalar[i + 1].no)} aria-disabled={i === sayfalar.length - 1} aria-label={M('ds.sonraki-katalog-sayfasi')} style={okS(i === sayfalar.length - 1)}>›</button>
    </div>
  );
  const don = <button type="button" onClick={onSiteyeDon} style={{ flex: 'none', minHeight: 'var(--hedef-min)', padding: '0 16px', borderRadius: '22px', border: '1px solid hsl(var(--text-on-dark) / 0.6)', background: 'transparent', color: 'hsl(var(--text-on-dark))', font: 'inherit', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}>{M('ds.siteye-don')}</button>;
  const pad = mobil ? 'var(--space-page-mobile)' : 'var(--space-page)';
  const cipEl = (a, on, f, k) => <button key={k} type="button" aria-pressed={on} onClick={f} style={{ position: 'relative', flex: 'none', height: '36px', padding: '0 14px', borderRadius: '18px', border: '1px solid ' + (on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--text-on-dark) / 0.45)'), background: on ? 'hsl(var(--surface-card))' : 'transparent', color: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--text-on-dark))', fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer' }}><span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{a}</button>;
  const modelListe = modeller.length && onModel ? <div role="group" aria-label={M('ds.bu-sayfadaki-modeller')} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-on-dark-muted))' }}>{M('ds.bu-sayfadaki-modeller')}</span><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{modeller.map((m) => cipEl(m.ad, false, () => { setPanel(false); onModel(m.k); }, m.k))}</div></div> : null;
  return (
    <div data-kip="katalog" style={{ background: 'hsl(var(--primary-navy))', color: 'hsl(var(--text-on-dark))', fontFamily: 'var(--font-sans)', minHeight: '100%', paddingBottom: '40px', ...style }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'hsl(var(--primary-navy))', borderBottom: '1px solid hsl(var(--text-on-dark) / 0.18)', padding: (mobil ? '8px ' : '10px ') + pad, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: mobil ? '8px' : '16px', minHeight: '44px' }}>
          {don}
          {mobil ? null : <span style={{ flex: '1 1 auto', minWidth: 0, fontFamily: 'var(--font-baslik)', fontSize: '18px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{baslik}</span>}
          <span style={{ marginLeft: 'auto' }}>{nav}</span>
        </div>
        {!mobil && atlamalar.length ? <div role="group" aria-label={M('ds.dogrudan-git')} style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none' }}>{atlamalar.map((a) => cipEl(M('ds.katalog-atlama', { ad: a.ad, n: a.no }), a.no === P.no, () => git(a.no), a.no + a.ad))}</div> : null}
      </div>
      <div style={{ margin: mobil ? '12px 0 0' : '28px auto 0', maxWidth: mobil ? 'none' : '820px', touchAction: 'pan-x pan-y pinch-zoom' }}>
        <article aria-label={M('ds.katalog-sayfa-ust', { n: P.no })} style={{ position: 'relative', width: '100%', aspectRatio: '595 / 842', containerType: 'inline-size', overflow: 'hidden', background: '#FFFFFF', color: '#111', fontFamily: 'Archivo, var(--font-sans)', fontStretch: '88%', boxShadow: mobil ? 'none' : 'var(--shadow-orta)' }}>
          {P.zemin ? <img src={P.zemin} alt={P.alt || ''} decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', userSelect: 'none', pointerEvents: 'none' }} /> : null}
          {Array.isArray(P.katman) ? P.katman.map((o, k) => {
            const [x, y, b, t, kalin, renk, aci, model] = o;
            const st = { position: 'absolute', left: x + '%', top: y + '%', fontSize: b + 'cqw', lineHeight: 1, whiteSpace: 'pre', color: renk || '#111', fontWeight: kalin ? 700 : 400, transform: 'translateY(-80%)' + (aci ? ' rotate(' + (-aci) + 'deg)' : ''), transformOrigin: '0 80%' };
            return model && onModel ? <button key={k} type="button" onClick={() => onModel(model)} style={{ ...st, padding: 0, margin: 0, border: 0, borderBottom: '1.5px solid hsl(var(--primary-navy))', background: 'transparent', fontFamily: 'inherit', fontStretch: 'inherit', fontSize: b + 'cqw', fontWeight: kalin ? 700 : 400, color: 'hsl(var(--primary-navy))', cursor: 'pointer' }}>{t}</button> : <span key={k} style={st}>{t}</span>;
          }) : null}
        </article>
        {!mobil && modelListe ? <div style={{ marginTop: '20px' }}>{modelListe}</div> : null}
      </div>
      {mobil && (atlamalar.length || modelListe) ? <div style={{ position: 'sticky', bottom: '16px', zIndex: 21, display: 'flex', justifyContent: 'center', marginTop: '16px', pointerEvents: 'none' }}><button type="button" aria-expanded={panel} onClick={() => setPanel(true)} style={{ pointerEvents: 'auto', height: '48px', padding: '0 22px', borderRadius: '24px', border: '1px solid hsl(var(--text-on-dark) / 0.6)', background: 'hsl(var(--primary-navy))', color: 'hsl(var(--text-on-dark))', fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, boxShadow: '0 10px 24px hsl(var(--primary-navy) / 0.35)', cursor: 'pointer' }}>{M('ds.bolumler')}</button></div> : null}
      {mobil && panel ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column' }}>
          <button type="button" aria-label={M('tx.e_kapatX')} onClick={() => setPanel(false)} style={{ flex: 1, border: 0, padding: 0, background: 'hsl(var(--text-strong) / 0.45)', cursor: 'pointer' }}></button>
          <div role="dialog" aria-label={M('ds.bolumler')} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '78%', overflowY: 'auto', padding: '10px 16px 20px', boxSizing: 'border-box', background: 'hsl(var(--primary-navy))', borderRadius: '20px 20px 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ fontFamily: 'var(--font-baslik)', fontSize: '20px', fontWeight: 700 }}>{M('ds.bolumler')}</span><button type="button" onClick={() => setPanel(false)} aria-label={M('tx.e_kapatX')} style={{ width: 'var(--hedef-min)', height: 'var(--hedef-min)', border: 0, borderRadius: '22px', background: 'transparent', color: 'hsl(var(--text-on-dark))', fontSize: '22px', cursor: 'pointer' }}>×</button></div>
            {atlamalar.length ? <div role="group" aria-label={M('ds.dogrudan-git')} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{atlamalar.map((a) => cipEl(M('ds.katalog-atlama', { ad: a.ad, n: a.no }), a.no === P.no, () => { git(a.no); setPanel(false); }, a.no + a.ad))}</div> : null}
            {modelListe}
          </div>
        </div>
      ) : null}
    </div>
  );
}
