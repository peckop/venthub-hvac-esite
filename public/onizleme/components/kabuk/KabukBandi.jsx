import React from 'react';

/* KabukBandi — site kabuğu (S5 · DESIGN-MENU ds-cevap 10-23 madde 1, düzeltilmiş). Kaynak: Site S5.dc.html header/footer.
 * header varsayılan TEK BANT (masaüstü): beyaz, alt 1 px hairline, en az 74 px, dolgu 0 40, gap 26:
 *   logo (32, -tamrenk) · arama (surface-inset, köşe 25, en az 50) · İletişim (yalnız simge, panel açar K37-c) ·
 *   Teklif/Sepet (simge + yazı, 44 px, 1,5 px petrol kenar, köşe 24, Schibsted 600 16, artısız belge/araba, sayaç rozeti 24 px; dolu değil, K5) ·
 *   Hesap/Giriş (yalnız simge) · Menü (simge). Bilgi Merkezi ve "Ürünler" header'da yok (tam ekran menüde ve alt bilgide).
 *   Simge düğmeleri 44×44, petrol, 22 px çizgi simge (assets/icons/ui çizimleri; DS kendi simgesini çizmez).
 * ikiKat (varsayılan değil): ≥1180 px'te Bilgi Merkezi ⌄ + yazılı İletişim / Giriş yap; kategoriler verilirse altında ürün grubu şeridi.
 * header (mobil, Alternatifler 6a): 56 px, dolgu 0 16, logo 24, sağda children (⌕) + menü.
 * footer: --primary-navy (#0B4F6C petrol), logo -tamrenk-koyu, metin --text-on-dark / --text-on-dark-muted. */
const TEKLIF = <><path d="M5 5h10v15H5z"></path><path d="M8 9h4M8 12.5h4M8 16h2"></path></>;
const SEPET = <><path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2"></path><circle cx="9.5" cy="19.5" r="1.3"></circle><circle cx="17" cy="19.5" r="1.3"></circle></>;
const ILETISIM = <path d="M3.5 5h15v10H11l-4 3.5V15H3.5z"></path>;
const HESAP = <><circle cx="11" cy="7.5" r="3.4"></circle><path d="M4.5 18.5c0-3.6 2.9-5.8 6.5-5.8s6.5 2.2 6.5 5.8"></path></>;
const MENU = <path d="M3.5 6h15M3.5 11h15M3.5 16h15"></path>; /* S5 header satır içi çizimi (ds-cevap 10-23b madde 2): 18 px, çizgi 1.6 */
const genis = () => typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(min-width: 1180px)').matches : true;
export function KabukBandi({ rol = 'header', logoSrc, logoHref, children, arama, aramaDeger, onArama, sayac, sayacEtiketi, kip = 'teklif', onSayacClick, onIletisim, onHesap, onMenu, girisYapildi = false, sonEk, ikiKat = false, onBilgiMerkezi, kategoriler, yapiskan = false, mobil = false, metin, style, ...rest }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [buyuk, setBuyuk] = React.useState(genis);
  React.useEffect(() => {
    if (!ikiKat || typeof window === 'undefined' || !window.matchMedia) return;
    const m = window.matchMedia('(min-width: 1180px)'), f = () => setBuyuk(m.matches);
    f(); m.addEventListener('change', f); return () => m.removeEventListener('change', f);
  }, [ikiKat]);
  if (rol === 'footer') {
    return (
      <footer style={{ background: 'hsl(var(--primary-navy))', color: 'hsl(var(--text-on-dark))', padding: mobil ? '28px var(--space-page-mobile)' : '34px var(--space-page)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-small)', ...style }} {...rest}>
        {logoSrc ? (logoHref ? <a href={logoHref} style={{ display: 'block', alignSelf: 'flex-start' }}><img src={logoSrc} alt="VentHub" style={{ height: '28px', display: 'block' }} /></a> : <img src={logoSrc} alt="VentHub" style={{ height: '28px', display: 'block', alignSelf: 'flex-start' }} />) : null}
        {children}
      </footer>
    );
  }
  const satis = kip === 'satis';
  const yazili = ikiKat && buyuk && !mobil;
  const svg = (ic, w = 22, sw = 1.5) => <svg viewBox="0 0 22 22" width={w} height={w} fill="none" aria-hidden="true" style={{ display: 'block', flex: 'none', stroke: 'currentColor', strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' }}>{ic}</svg>;
  const simgeB = (ic, ad, f, yazi, w, sw) => (
    <button type="button" onClick={f} aria-label={yazi ? undefined : ad} title={yazi ? undefined : ad} style={{ flex: 'none', minWidth: 'var(--hedef-min)', height: 'var(--hedef-min)', padding: yazi ? '0 4px' : 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 0, borderRadius: 'var(--radius-dugme)', background: 'transparent', color: 'hsl(var(--primary-navy))', fontFamily: 'var(--font-baslik)', fontSize: 'var(--size-body)', fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', WebkitAppearance: 'none' }}>
      {svg(ic, w, sw)}{yazi ? <span style={{ color: 'hsl(var(--text-strong))' }}>{ad}</span> : null}
    </button>
  );
  const logo = logoSrc ? <img src={logoSrc} alt="VentHub" style={{ height: mobil ? '24px' : '32px', width: 'auto', display: 'block', flex: 'none' }} /> : null;
  const aramaEl = arama === false || mobil ? null : arama && arama !== true ? arama : (
    <label style={{ flex: '1 1 240px', minWidth: '140px', maxWidth: '620px', minHeight: '50px', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', boxSizing: 'border-box', borderRadius: '25px', background: 'hsl(var(--surface-inset))' }}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" style={{ flex: 'none', stroke: 'hsl(var(--text-body))', strokeWidth: 1.8, strokeLinecap: 'round' }}><circle cx="11" cy="11" r="6.5"></circle><path d="M16 16l4 4"></path></svg>
      <input value={aramaDeger} onChange={onArama ? (e) => onArama(e.target.value) : undefined} placeholder={M('tx.aramaIpucu')} aria-label={M('t.ara-2')} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-small)', color: 'hsl(var(--text-strong))' }} />
    </label>
  );
  const sayacEl = typeof sayac === 'number' && !mobil ? (
    <button type="button" onClick={onSayacClick} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: '9px', minHeight: 'var(--hedef-min)', padding: '0 16px 0 14px', boxSizing: 'border-box', border: '1.5px solid hsl(var(--primary-navy))', borderRadius: '24px', background: 'transparent', color: 'hsl(var(--primary-navy))', fontFamily: 'var(--font-baslik)', fontSize: 'var(--size-body)', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', WebkitAppearance: 'none' }}>
      <svg viewBox={satis ? '0 0 24 24' : '-2 0 24 24'} width="20" height="20" fill="none" aria-hidden="true" style={{ flex: 'none', stroke: 'currentColor', strokeWidth: satis ? 1.8 : 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }}>{satis ? SEPET : TEKLIF}</svg>
      {sayacEtiketi ?? (satis ? M('t.sepet') : M('t.teklif'))}
      {sayac > 0 ? <span style={{ minWidth: '24px', height: '24px', padding: '0 6px', boxSizing: 'border-box', borderRadius: '12px', background: 'hsl(var(--primary-navy))', color: 'hsl(var(--text-on-dark))', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-caption)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>{sayac}</span> : null}
    </button>
  ) : null;
  const hesapAd = girisYapildi ? M('t.hesabim-2') : M('t.giris-yap');
  return (
    <div style={{ position: yapiskan ? 'sticky' : 'relative', top: yapiskan ? 0 : undefined, zIndex: 30, fontFamily: 'var(--font-sans)', ...style }} {...rest}>
      <header style={{ background: 'hsl(var(--surface-card))', borderBottom: '1px solid hsl(var(--border-hairline))', minHeight: mobil ? '56px' : '74px', padding: mobil ? '0 16px' : '0 var(--space-page)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: mobil ? '12px' : '26px', color: 'hsl(var(--text-strong))' }}>
        {logo ? (logoHref ? <a href={logoHref} style={{ display: 'block', flex: 'none' }}>{logo}</a> : logo) : null}
        {aramaEl}
        <div style={{ marginLeft: 'auto', flex: 'none', display: 'flex', alignItems: 'center', gap: mobil ? '4px' : yazili ? '18px' : '10px', whiteSpace: 'nowrap', fontSize: 'var(--size-body)', color: 'hsl(var(--text-strong))' }}>
          {yazili ? <button type="button" onClick={onBilgiMerkezi} style={{ flex: 'none', minHeight: 'var(--hedef-min)', padding: '0 4px', border: 0, background: 'transparent', fontFamily: 'var(--font-baslik)', fontSize: 'var(--size-body)', fontWeight: 500, color: 'hsl(var(--text-strong))', cursor: 'pointer' }}>{M('t.bilgi-merkezi') + ' ⌄'}</button> : null}
          {children}
          {!mobil ? simgeB(ILETISIM, M('t.iletisim'), onIletisim, yazili) : null}
          {sayacEl}
          {!mobil ? simgeB(HESAP, hesapAd, onHesap, yazili) : null}
          {sonEk !== undefined ? sonEk : simgeB(MENU, M('t.menu-2'), onMenu, false, 18, 1.6)}
        </div>
      </header>
      {ikiKat && kategoriler && kategoriler.length && !mobil ? (
        <nav aria-label={M('t.urun-gruplari-2')} style={{ display: 'flex', alignItems: 'stretch', gap: '28px', padding: '0 var(--space-page)', minHeight: '46px', background: 'hsl(var(--surface-card))', borderBottom: '1px solid hsl(var(--border-hairline))', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {kategoriler.map((k, i) => (
            <button key={i} type="button" onClick={k.onClick} aria-current={k.etkin ? 'page' : undefined} style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: 0, border: 0, borderBottom: '2px solid ' + (k.etkin ? 'hsl(var(--primary-navy))' : 'transparent'), background: 'transparent', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-small)', fontWeight: k.etkin ? 700 : 500, color: k.etkin ? 'hsl(var(--primary-navy))' : 'hsl(var(--text-strong))' /* #12 B: bulunulan grup petrol 700 + 2 px petrol alt çizgi (SectionRail etkin sekmesiyle aynı); ara 28; adlar çağırandan, katalogdan */, whiteSpace: 'nowrap', cursor: 'pointer' }}>
              {k.ikon ? <img src={k.ikon} alt="" aria-hidden="true" style={{ width: '24px', height: '24px', flex: 'none' }} /> : null}{k.ad}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
