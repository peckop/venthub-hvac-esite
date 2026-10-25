import React from 'react';
import { PhotoStage } from '../foto/PhotoStage.jsx';

/* UrunHaritasi — Ürünler sayfasının ürün haritası (iş emri #6 madde 3 · kaynak DESIGN-MENU paket-B/Kombin Urunler Harita.dc.html, birebir).
 * Her ürün grubu bir kutu: beyaz, 1 px hairline, köşe 16. Üstte grup satırı (PhotoStage 'satir' 64×56 köşe 12 · ad → Schibsted 600 18 · altında "n model" 14 muted),
 * altında ürün türü satırları (Onest 15 text-body · sayı 14 muted tabular; 44 px; üstüne gelince --surface-subtle + petrol). Ürün türünde fotoğraf yok.
 * Izgara: masaüstü auto-fill minmax(320px,1fr), mobil tek sütun; gap 16. Her satır gerçek <a href>.
 * Gidiş çağıranda: grup → ürün grubu sayfası, tür → ürün türü sayfası, tek serili tür doğrudan seri sayfası (kısalma; çağıran href'i öyle verir). Modeli olmayan tür çizilmez (K7).
 * Sayfa geneline kural yazmaz; üstüne gelme rengi kökün [data-vh-urun-haritasi] seçicisine bağlı. */
const HARITA_CSS = '[data-vh-urun-haritasi] a[data-grup]:hover{color:hsl(var(--primary-navy)) !important}[data-vh-urun-haritasi] a[data-tur]:hover{background:hsl(var(--surface-subtle));color:hsl(var(--primary-navy)) !important}';
/* yerlesim="anasayfa" (iş emri #12 C · Ana Sayfa ABC, C): ana sayfanın "Ürünler" bölümü — aynı parça, ikinci yerleşim (ikinci kopya yazılmaz, §1.1).
 *   h2 (baslik) · her grup: başlık satırı = kategori simgesi 24 (g.ikon) · ad (Schibsted 600, 20 / mobil 18) · "n model →" (13 muted); grup sayfasını açar.
 *   Altında bütün ürün türleri küçük kart: fotoğraf (sahne zemini, multiply) · ad (15/600, en çok 2 satır) · "n model" (13). Köşe 12, hairline; üstüne gelince kenar petrol.
 *   Masaüstü: grup başına satır (C-3) — 200px | türler 3 sütun; kart 64 px fotoğraf + metin, en az 68.
 *   Mobil: gruplar alt alta, türler 2 sütun, fotoğraf üstte 72, ad altta. Sıra veri sırası; boş tür çizilmez (K7); teklif/sepet yok. Kart basma alanı ≥ 44. */
const ANA_CSS = '[data-vh-ana-urunler] a[data-ana-tur]:hover{border-color:hsl(var(--primary-navy)) !important}[data-vh-ana-urunler] a[data-ana-grup]:hover [data-ana-grup-ad]{color:hsl(var(--primary-navy))}';
function AnaSayfaUrunler({ G, baslik, mobil, nModel, style }) {
  const turKart = (t) => (
    <a key={t.id || t.ad} data-ana-tur="" href={t.href || '#'} onClick={t.onClick} style={{ display: 'grid', gridTemplateColumns: mobil ? 'minmax(0,1fr)' : '64px minmax(0,1fr)', gridTemplateRows: mobil ? '72px auto' : undefined, alignItems: 'center', gap: mobil ? '8px' : '12px', minHeight: mobil ? '64px' : '68px', height: '100%', padding: mobil ? '8px 8px 10px' : '8px 12px 8px 8px', boxSizing: 'border-box', border: '1px solid hsl(var(--border-hairline))', borderRadius: '12px', background: 'hsl(var(--surface-card))', textDecoration: 'none', color: 'hsl(var(--text-strong))', transition: 'border-color var(--hareket-hizli) var(--hareket-egri)', minWidth: 0 }}>
      <span style={{ display: 'block', width: mobil ? '100%' : '64px', height: mobil ? '72px' : '56px', borderRadius: '8px', overflow: 'hidden' }}>{t.foto ? <PhotoStage src={t.foto} boy="satir" genislik="100%" yukseklik={mobil ? 72 : 56} kose="8px" /> : null}</span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'break-word' }}>{t.ad}</span>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-muted))' }}>{nModel(t.model)}</span>
      </span>
    </a>
  );
  /* C-3 (Recep 10-25): masaüstünde her grup kendi satırında — ızgara 200px | 1fr, ara 20; satır üstünde 1 px hairline, 20 iç boşluk.
   * Sol: simge 24 → ad (Schibsted 600, 20) → "n model →" (13). Sağ: türler repeat(3), ara 12, kart en az 68, satırdaki kartlar eşit boy. İki sütunlu grup ızgarası kalktı. */
  const grup = (g) => {
    const T = (g.turler || []).filter((t) => t.model > 0);
    if (mobil) return (
      <section key={g.id || g.ad} style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
        <a data-ana-grup="" href={g.href || '#'} onClick={g.onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: 'var(--hedef-min)', textDecoration: 'none', color: 'hsl(var(--text-strong))', alignSelf: 'flex-start', flexWrap: 'wrap' }}>
          {g.ikon ? <img src={g.ikon} alt="" aria-hidden="true" style={{ width: '24px', height: '24px', flex: 'none' }} /> : null}
          <span data-ana-grup-ad="" style={{ fontFamily: 'var(--font-baslik)', fontWeight: 600, fontSize: '18px', lineHeight: 1.2 }}>{g.ad}</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>{nModel(g.model) + ' →'}</span>
        </a>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '10px' }}>{T.map(turKart)}</div>
      </section>
    );
    return (
      <section key={g.id || g.ad} data-ana-satir="" style={{ display: 'grid', gridTemplateColumns: '200px minmax(0,1fr)', gap: '20px', paddingTop: '20px', borderTop: '1px solid hsl(var(--border-hairline))', minWidth: 0 }}>
        <a data-ana-grup="" href={g.href || '#'} onClick={g.onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', alignSelf: 'start', textDecoration: 'none', color: 'hsl(var(--text-strong))', minWidth: 0 }}>
          {g.ikon ? <img src={g.ikon} alt="" aria-hidden="true" style={{ width: '24px', height: '24px', flex: 'none' }} /> : null}
          <span data-ana-grup-ad="" style={{ fontFamily: 'var(--font-baslik)', fontWeight: 600, fontSize: '20px', lineHeight: 1.2, textWrap: 'balance' }}>{g.ad}</span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>{nModel(g.model) + ' →'}</span>
        </a>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gridAutoRows: '1fr', gap: '12px', minWidth: 0 }}>{T.map(turKart)}</div>
      </section>
    );
  };
  return (
    <section data-vh-ana-urunler="" style={{ display: 'flex', flexDirection: 'column', gap: mobil ? '18px' : '24px', fontFamily: 'var(--font-sans)', ...style }}>
      <style>{ANA_CSS}</style>
      {baslik ? <h2 style={{ margin: 0, fontFamily: 'var(--font-baslik)', fontWeight: 800, fontSize: 'clamp(24px,3vw,34px)', letterSpacing: '-0.02em', color: 'hsl(var(--text-strong))' }}>{baslik}</h2> : null}
      <div style={{ display: 'flex', flexDirection: 'column', gap: mobil ? '24px' : '20px' }}>{G.map(grup)}</div>
    </section>
  );
}
export function UrunHaritasi({ gruplar = [], mobil = false, metin, yerel = 'tr-TR', yerlesim = 'harita', baslik, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '\u27E6' + k + '\u27E7'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
  const nModel = (n) => M('ds.n-model', { n: Number(n || 0).toLocaleString(yerel) });
  const G = (gruplar || []).filter((g) => g && (g.model > 0 || (g.turler || []).some((t) => t.model > 0)));
  if (!G.length) return null;
  if (yerlesim === 'anasayfa') return <AnaSayfaUrunler G={G} baslik={baslik} mobil={mobil} nModel={nModel} style={style} />;
  return (
    <div data-vh-urun-haritasi="" style={{ display: 'grid', gridTemplateColumns: mobil ? 'minmax(0,1fr)' : 'repeat(auto-fill,minmax(320px,1fr))', gap: '16px', alignItems: 'start', ...style }}>
      <style>{HARITA_CSS}</style>
      {G.map((g) => (
        <section key={g.id || g.ad} style={{ background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <a data-grup="" href={g.href || '#'} onClick={g.onClick} style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr)', alignItems: 'center', gap: '14px', padding: '14px 16px', textDecoration: 'none', color: 'hsl(var(--text-strong))', borderBottom: '1px solid hsl(var(--border-row))' }}>
            <div style={{ width: '64px', height: '56px', borderRadius: '12px', overflow: 'hidden' }}>{g.foto ? <PhotoStage src={g.foto} boy="satir" genislik="64px" yukseklik={56} kose="12px" /> : null}</div>
            <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <span style={{ fontFamily: 'var(--font-baslik)', fontWeight: 600, fontSize: '18px', lineHeight: 1.2, textWrap: 'pretty' }}>{g.ad + ' →'}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-muted))' }}>{nModel(g.model)}</span>
            </span>
          </a>
          <ul style={{ margin: 0, padding: '5px 0', listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
            {(g.turler || []).filter((t) => t.model > 0).map((t) => (
              <li key={t.id || t.ad} style={{ display: 'flex' }}>
                <a data-tur="" href={t.href || '#'} onClick={t.onClick} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', minHeight: 'var(--hedef-min)', padding: '0 16px', textDecoration: 'none', fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'hsl(var(--text-body))' }}>
                  <span style={{ flex: '1 1 auto', minWidth: 0 }}>{t.ad}</span>
                  <span style={{ fontSize: '14px', fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap' }}>{Number(t.model).toLocaleString(yerel)}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
