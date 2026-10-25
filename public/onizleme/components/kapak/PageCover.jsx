import React from 'react';
import { PhotoStage } from '../foto/PhotoStage.jsx';
import { FotoNoktalari, useFotoGecis } from '../foto/FotoNoktalari.jsx';
import { HiyerarsiSimgesi, SeviyeEtiketi } from '../hiyerarsi/HiyerarsiSimgesi.jsx';

/* PageCover — sayfa kapağı (foto-ve-kart-kurali §2 · Foto Dili Akış 2·3·4). Kategori, alt kategori, seri, ürün aynı yapıdan.
 * Zemin --foto-sahne-zemin, tam genişlik; masaüstü padding 24 40 28, iki eşit sütun, gap 40, dikey ortalı.
 * Kombin (iş emri #7 madde 2, 1–8): kapak kutu — köşe 24, 1 px hairline, sayfa oluğunun içinde; zemin --foto-sahne-zemin (mobilde de), alt çizgi yok; iç boşluk üst/alt 28.
 *   Fotoğraf multiply, gölgesiz (zemin 'beyaz' varsayılan); soluk (opacity) öğe yok — fotoğraf geçişinde solma yok. `ozet` değer satırı auto-fit minmax(90px,132px), sola toplu, ara 24 (sütuna yayılmaz · Recep 10-25, ProductCover ile aynı). `sade`: gezinti ve fotoğraf yok.
 * Kapak genişliği (Recep 10-25 · 2a, Kapak Genislik): masaüstünde en çok 1060, ortalı — bölümlerle sol ve sağ kenar aynı; iç boşluk yan 32, sütun arası 32 (her sayfa türünde).
 * Konum satırı kapakta çizilmez (iş emri #6 madde 4, Recep 10-24): konum yalnız SectionRail'de (mobil "‹ geri" dahil). `konum` girdisi yok sayılır.
 * Seviye etiketi: ürün grubu/türü/ailesi/seri ve 'uygulama-alani' ("UYGULAMA ALANI", simgesiz).
 * Sol: başlık (Schibsted 44/800, −0.03em, 1.02) → 28×2 petrol çizgi + açıklama satırı (Schibsted 18/500 petrol)
 * → en çok 4 çip + "Tümü ↓" ya da sayfanın tek eylemi. Sağ: PhotoStage (kapak 300). Fotoğraf kategori ve ürün kapağında sağda, seri ve seri şablonlu alt kategori kapağında solda (foto-ve-kart-kurali §2, 23 Ekim).
 * gezinti (kategori kapağında alt kategoriler, alt kategori kapağında seriler): fotoğrafın altında noktalar (FotoNoktalari) + seçilenin adı →;
 *   kendiliğinden dönmez, üzerine gelince ya da basınca 280 ms geçiş (ds-cevap 10-23b madde 1).
 * seviye (kart-dili-kararlar 10-24): başlığın üstünde SeviyeEtiketi (simge + ÜRÜN GRUBU / ÜRÜN TÜRÜ / ÜRÜN AİLESİ / SERİ · MARKA / MODEL · MARKA);
 *   'urunler'de etiket yok, simge h1'in başında (0,82 em). Ürün türü kapağı: altSatir "n seri · n ürün ailesi · n model", tumu "Seriler ↓".
 * Mobil fotoğraf boyu (ds-cevap 10-24 madde 1): sayfa kapağı (Ürünler, ürün grubu, ürün türü, ürün ailesi/seri) 220; ürün kapağı (fotoBoy 'buyuk'/'urun', ProductCover) 300.
 * Mobil: fotoğraf üstte, kapak zemini yalnız fotoğrafın arkasında; başlık 32, çizgi 22.
 *   Recep 10-25 (390 görüntüsü): fotoğrafın kendi zemin kutusu yok — kapak kutusunun zemini tek zemin (iç içe iki kutu görünmesin). */
export function PageCover({ baslikBoy, sutunlar, seviye, marka, cipBaslik, konum, baslik, baslikIcerik, altSatir, cipler = [], enCokCip = 4, ozet, sade = false, dil = 'TR', tumu, eylem, foto, fotoBoy = 'kapak', fotoTaraf = 'sag', fotoEk, gezinti, mobil = false, children, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const gorCip = cipler.slice(0, enCokCip); /* uygulama alanı kapağında bölüm çipleri hepsi (enCokCip = bölüm sayısı) */
  const G = sade ? [] : (gezinti || []).filter((g) => g && g.foto), fg = useFotoGecis(G.length);
  const F = sade ? null : G.length ? { src: G[fg.gi].foto, alt: G[fg.gi].ad } : foto;
  const secG = G.length ? G[fg.gi] : null;
  const gezEk = G.length > 1 ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <FotoNoktalari adet={G.length} secili={fg.gi} onSec={fg.sec} etiketler={G.map((g) => g.ad)} metin={metin} />
      <a href={secG.href} onClick={secG.onClick} style={{ minHeight: 'var(--hedef-min)', display: 'inline-flex', alignItems: 'center', fontSize: '15px', fontWeight: 600, color: 'hsl(var(--primary-navy))', textDecoration: 'none', whiteSpace: 'nowrap' }}>{secG.ad + ' →'}</a>
    </div>
  ) : null;
  const cip = (c, i) => {
    const s = { position: 'relative', flex: 'none', display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 14px', boxSizing: 'border-box', borderRadius: 'var(--radius-dugme)', border: '1px solid hsl(var(--border-control))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--text-strong))', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none', cursor: 'pointer' };
    return c.href ? <a key={i} href={c.href} onClick={c.onClick} style={s}><span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{c.ad}</a> : <button key={i} type="button" onClick={c.onClick} style={{ ...s, WebkitAppearance: 'none' }}><span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{c.ad}</button>;
  };
  const sol = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
      {seviye && seviye !== 'urunler' ? <SeviyeEtiketi seviye={seviye} marka={seviye === 'seri' || seviye === 'model' || seviye === 'urun-ailesi' ? marka : undefined} metin={metin} dil={dil} /> : null}
      <h1 style={{ margin: 0, display: seviye === 'urunler' ? 'flex' : undefined, alignItems: 'center', gap: '0.28em', fontFamily: 'var(--font-baslik)', fontSize: mobil ? '32px' : (baslikBoy || '44px'), fontWeight: 'var(--weight-h1)', letterSpacing: '-0.03em', lineHeight: 1.02, color: 'hsl(var(--text-strong))', textWrap: 'balance' }}>{seviye === 'urunler' ? <HiyerarsiSimgesi seviye="urunler" boyut="0.82em" /> : null}{baslikIcerik ?? baslik}</h1>
      {altSatir ? <span style={{ display: 'flex', alignItems: 'center', gap: mobil ? '10px' : '12px', fontFamily: 'var(--font-baslik)', fontSize: mobil ? '16px' : '18px', fontWeight: 500, lineHeight: 1.2, color: 'hsl(var(--primary-navy))' }}><span aria-hidden="true" style={{ flex: 'none', width: mobil ? '22px' : '28px', height: '2px', background: 'hsl(var(--primary-navy))' }}></span>{altSatir}</span> : null}
      {children}
      {ozet && ozet.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(90px,132px))', justifyContent: 'start', gap: '10px 24px', paddingTop: '14px', borderTop: '1px solid hsl(var(--border-row))' }}>{ozet.filter((o) => o && o.v != null && String(o.v).trim() !== '').map((o, i) => <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}><span style={{ fontSize: 'var(--size-caption)', color: 'hsl(var(--text-muted))' }}>{o.ad}</span><span style={{ fontSize: 'var(--size-body-small)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))' }}>{o.v}</span></div>)}</div> : null}
      {cipBaslik && (gorCip.length || tumu) ? <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-body))', marginBottom: '-6px' }}>{cipBaslik}</span> : null}
      {gorCip.length || tumu ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>{gorCip.map(cip)}{tumu ? cip(tumu, 'tumu') : null}</div> : eylem ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{eylem}</div> : null}
    </div>
  );
  const sag = F && F.src ? (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: 0 }}>
      <PhotoStage src={F.src} alt={F.alt || ''} boy={fotoBoy} yukseklik={mobil && fotoBoy !== 'buyuk' && fotoBoy !== 'urun' ? 220 : undefined} mobil={mobil} sahneZemini={false} kose="0" zemin={F.zemin || 'beyaz'}>{F.ust}</PhotoStage>
      {gezEk}{fotoEk}
    </div>
  ) : null;
  if (mobil) {
    return (
      <header data-vh-kapak="" style={{ background: 'var(--foto-sahne-zemin)', padding: '28px 0', borderRadius: '24px', border: '1px solid hsl(var(--border-hairline))', overflow: 'hidden', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', ...style }}>
        {sag}
        <div style={{ padding: '16px var(--space-page-mobile) 20px' }}>{sol}</div>
      </header>
    );
  }
  return (
    <header data-vh-kapak="" style={{ width: '100%', maxWidth: '1060px', margin: '0 auto', boxSizing: 'border-box', background: 'var(--foto-sahne-zemin)', padding: '28px 32px', borderRadius: '24px', border: '1px solid hsl(var(--border-hairline))', overflow: 'hidden', fontFamily: 'var(--font-sans)', display: 'grid', gridTemplateColumns: sag ? (sutunlar || 'minmax(0,1fr) minmax(0,1fr)') : 'minmax(0,1fr)', gap: '32px', alignItems: 'center', ...style }}>
      {fotoTaraf === 'sol' && sag ? <>{sag}{sol}</> : <>{sol}{sag}</>}
    </header>
  );
}
