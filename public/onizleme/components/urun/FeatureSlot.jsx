import React from 'react';

/* FeatureSlot — öne çıkan değer yuvası (Foto Dili Akış 5b · Alternatifler 8a · DESIGN-MENU denetim 10-23 madde 1).
 * Kutusuz: zemin, çerçeve, dolgu yok; değer doğrudan kapak zemininde.
 * Büyük sayı Schibsted 800 56 px, −0.02em, petrol; tabular ve ek harf aralığı yok ("27,4" bitişik).
 * Birim iki satır: üstte kalın birim (dB(A)), altında açıklama ("katalog ses seviyesi, 3 m", kırılmaz).
 * Ölçek: 6 px şerit (pq-ton-1 → border-control) + modelin işareti: nokta (14 px petrol, 3 px beyaz halka) · bolum (10 px petrol aralık).
 * Mekân yazısı, sınır çizgisi ve seri noktaları çizilmez (mekân uygunluğu iptal, iş emri #4).
 * İçi alt kategoriye göre: SoundCard (ses), WidthCard (genişlik). Değer yoksa çizilmez (K7). kompakt: mobil (6a) — sayı 40 solda, çizgi sağda. */
const yuzde = (v, o) => Math.max(0, Math.min(100, ((v - o.min) / (o.max - o.min)) * 100));
/* Görsel varyant (blok 5 · ds-cevap 10-24d): gorseller verilince değer yerine görsel + işaret. Masaüstü görseller yan yana (gap 24), mobil alt alta.
 * Her görsel beyaz zeminde (16 köşe, hairline); işaret 28 px petrol daire + numara, halkanın üstünde (x/y yüzde); altında etiket (15/600) + açıklama (14 text-body).
 * Altta üretici atfı (12 text-body). Görsel ya da işaret yoksa o görsel çizilmez (K7). */
function GorselYuva({ baslik, gorseller, atif, mobil, genislik, style }) {
  const G = gorseller.filter((g) => g && g.src);
  if (!G.length) return null;
  return (
    <div style={{ boxSizing: 'border-box', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', width: genislik, maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '12px', ...style }}>
      {baslik ? <span style={{ fontFamily: 'var(--font-baslik)', fontSize: mobil ? '18px' : '20px', fontWeight: 700 }}>{baslik}</span> : null}
      <div style={{ display: 'grid', gridTemplateColumns: mobil ? 'minmax(0,1fr)' : 'repeat(' + G.length + ', minmax(0,1fr))', gap: mobil ? '12px' : '24px' }}>
        {G.map((g, i) => (
          <figure key={i} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ position: 'relative', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', minHeight: mobil ? '180px' : '220px', boxSizing: 'border-box' }}>
              <span style={{ position: 'relative', display: 'inline-block', lineHeight: 0 }}>
                <img src={g.src} alt={g.alt || ''} style={{ display: 'block', maxWidth: '100%', maxHeight: mobil ? '170px' : '210px' }} />
                {g.isaret ? <span aria-hidden="true" style={{ position: 'absolute', left: g.isaret.x + '%', top: g.isaret.y + '%', width: '28px', height: '28px', margin: '-14px 0 0 -14px', borderRadius: '50%', background: 'hsl(var(--primary-navy))', boxShadow: '0 0 0 2px hsl(var(--surface-card))', color: 'hsl(var(--text-on-dark))', fontSize: '13px', fontWeight: 700, lineHeight: '28px', textAlign: 'center' }}>{i + 1}</span> : null}
              </span>
            </div>
            <figcaption style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr)', gap: '10px' }}>
              <span aria-hidden="true" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'hsl(var(--primary-navy))', color: 'hsl(var(--text-on-dark))', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}><b style={{ fontSize: '15px', fontWeight: 600 }}>{g.etiket}</b>{g.aciklama ? <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'hsl(var(--text-body))', textWrap: 'pretty' }}>{g.aciklama}</span> : null}</span>
            </figcaption>
          </figure>
        ))}
      </div>
      {atif ? <span style={{ fontSize: '12px', color: 'hsl(var(--text-body))' }}>{atif}</span> : null}
    </div>
  );
}
export function FeatureSlot({ deger, birim, etiket, olcek, isaret, not, kompakt = false, genislik, gorseller, baslik, atif, mobil, style }) {
  if (gorseller) return <GorselYuva baslik={baslik} gorseller={gorseller} atif={atif} mobil={mobil ?? kompakt} genislik={genislik} style={style} />;
  if (deger === undefined || deger === null || String(deger).trim() === '') return null;
  const o = olcek && olcek.max > olcek.min ? olcek : null;
  const serit = (h, ust) => o ? (
    <div style={{ position: 'relative', height: h + 'px', marginTop: ust }}>
      <span style={{ position: 'absolute', left: 0, right: 0, top: (h - 6) / 2 + 'px', height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, hsl(var(--pq-ton-1)), hsl(var(--border-control)))' }}></span>
      {isaret && isaret.tur === 'bolum' ? <span style={{ position: 'absolute', left: yuzde(isaret.bas, o) + '%', width: (yuzde(isaret.son, o) - yuzde(isaret.bas, o)) + '%', top: (h - 10) / 2 + 'px', height: '10px', borderRadius: '5px', background: 'hsl(var(--primary-navy))' }}></span> : null}
      {isaret && isaret.tur === 'nokta' ? <span style={{ position: 'absolute', left: yuzde(isaret.deger, o) + '%', top: (h - 14) / 2 + 'px', width: '14px', height: '14px', marginLeft: '-7px', borderRadius: '7px', background: 'hsl(var(--primary-navy))', boxShadow: '0 0 0 3px hsl(var(--surface-card))' }}></span> : null}
    </div>
  ) : null;
  const sayi = (px) => <span style={{ fontFamily: 'var(--font-baslik)', fontSize: px + 'px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 0.9, color: 'hsl(var(--primary-navy))', flex: 'none' }}>{deger}</span>;
  const birimEl = (bpx, epx) => (
    <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
      {birim ? <b style={{ fontSize: bpx + 'px', fontWeight: 700, lineHeight: 1.2, color: 'hsl(var(--text-strong))' }}>{birim}</b> : null}
      {etiket ? <span style={{ fontSize: epx + 'px', lineHeight: 1.3, color: 'hsl(var(--text-body))', whiteSpace: 'nowrap' }}>{etiket}</span> : null}
    </span>
  );
  const kap = { boxSizing: 'border-box', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', width: genislik, maxWidth: '100%' };
  if (kompakt) {
    return (
      <div style={{ ...kap, display: 'flex', alignItems: 'center', gap: '12px', ...style }}>
        {sayi(40)}
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {birimEl(14, 12)}
          {serit(14, 0)}
        </span>
      </div>
    );
  }
  return (
    <div style={{ ...kap, display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {sayi(56)}
        {birimEl(16, 14)}
      </div>
      {serit(22, '4px')}
      {o && o.etiketler && o.etiketler.length ? <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px', color: 'hsl(var(--text-body))' }}>{o.etiketler.map((e, i) => <span key={i}>{e}</span>)}</div> : null}
      {not ? <span style={{ fontSize: '13px', lineHeight: 1.45, color: 'hsl(var(--text-body))', textWrap: 'pretty' }}>{not}</span> : null}
    </div>
  );
}
