import React from 'react';
import { PageCover } from './PageCover.jsx';

/* SeriesHeader — seri sayfası kapağı (yeni ad · Foto Dili Akış 4 · S5 6c-4 · ds-cevap madde 3, 7).
 * PageCover (fotoğraf solda, seri 360) + h1'de marka logosu (yükseklik 22; "Vortice" metni ekranda gizli, h1'de kalır — SEO; logoya basınca marka sayfası)
 * + seri tanımı alt satırı (28 px petrol çizgi) + aralık değerleri (beyaz kart, hücre 12 16, 1 px row ayırıcı) + çerçeveli "Sessiz modelinizi bulun ↓"
 * (seri adında Quiet/Sessiz varsa; yoksa "Uygun modeli bulun ↓"). Seri sayfasında teklif/sepet düğmesi yok. */
const gizli = { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };
export function SeriesHeader({ marka, markaLogo, markaHref, seriAdi, seriTanimi, tanimHref, konum, degerler = [], foto, onBul, bulEtiketi, mobil = false, metin, dil = 'TR', sessiz = false, style }) {
  const [ust, setUst] = React.useState(false);
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const bul = bulEtiketi ?? (sessiz ? M('ds.sessiz-modelinizi-bulun') : M('ds.uygun-modeli-bul'));
  const logo = markaLogo ? <img src={markaLogo} alt="" aria-hidden="true" style={{ display: 'block', height: mobil ? '20px' : '22px', width: 'auto', maxWidth: '160px', objectFit: 'contain', objectPosition: 'left' }} /> : null;
  const baslikIcerik = (
    <span style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' }}>
      {logo ? (markaHref ? <a href={markaHref} aria-label={marka} style={{ display: 'block' }}>{logo}</a> : logo) : null}
      <span>{marka ? <span style={logo ? gizli : undefined}>{marka + ' '}</span> : null}{seriAdi}</span>
    </span>
  );
  const altSatir = seriTanimi ? (tanimHref ? <a href={tanimHref} style={{ color: 'inherit', textDecoration: 'none' }}>{seriTanimi}</a> : seriTanimi) : null;
  const dolu = degerler.filter((d) => d && d.v !== undefined && d.v !== null && String(d.v).trim() !== '');
  return (
    <PageCover dil={dil} baslikIcerik={baslikIcerik} altSatir={altSatir} foto={foto} fotoBoy="seri" fotoTaraf="sol" mobil={mobil} metin={metin} style={{ padding: mobil ? undefined : '28px var(--space-page)', ...style }}
      eylem={onBul !== null ? <button type="button" onClick={onBul} onMouseEnter={() => setUst(true)} onMouseLeave={() => setUst(false)} style={{ height: 'var(--hedef-min)', padding: '0 18px', borderRadius: '22px', border: '1px solid hsl(var(--primary-navy))', background: ust ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: ust ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background-color var(--hareket-hizli) var(--hareket-egri), color var(--hareket-hizli) var(--hareket-egri)', WebkitAppearance: 'none' }}>{bul}</button> : null}>
      {dolu.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(90px,1fr))' /* Kombin madde 7: tek satır */, background: 'hsl(var(--surface-card))', borderRadius: 'var(--radius-kart)', border: '1px solid hsl(var(--border-hairline))', overflow: 'hidden' }}>
          {dolu.map((d, i) => {
            const kol = mobil ? Math.min(2, dolu.length) : dolu.length, sonKol = (i + 1) % kol === 0, ustSatir = i >= kol;
            return <div key={i} style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '2px', borderRight: sonKol ? 0 : '1px solid hsl(var(--border-row))', borderTop: ustSatir ? '1px solid hsl(var(--border-row))' : 0, minWidth: 0 }}><span style={{ fontSize: '13px', color: 'hsl(var(--text-body))' }}>{d.e}</span><b style={{ fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{d.v}</b></div>;
          })}
        </div>
      ) : null}
    </PageCover>
  );
}
