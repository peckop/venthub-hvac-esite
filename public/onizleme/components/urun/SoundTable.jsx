import React from 'react';
import { CompareButton } from '../dugme/CompareButton.jsx';
import { QuoteRequestButton } from '../dugme/QuoteRequestButton.jsx';

/* SoundTable — seri sayfası "Ses karşılaştırması" (S5 data-ses-sade · 6c-1). Mekân uygunluğu iptal (Recep 10-24 · iş emri #4):
 * sınır çizgisi, "C sınıfı", uyan sayısı, onay işareti yok. Değer katalogdaki gibi (emiş, 3 m).
 * Üstte cevap cümlesi (17/600). Beyaz kart (dolgu 14, köşe 16): ölçek 20–60 dB(A); satır ayrı yuvarlak kutu (köşe 12, ara 4), ızgara 36% · çizgi; ad 14/600.
 * Hız noktası 12 px dolu petrol. Satıra basınca kutu açılır: hız etiketleri (30 px, köşe 15, petrol kenar) · "Ürün sayfası →" (44, 36 px foto) · ⇄ · teklif/sepet.
 * Altta değer notu (`ds.ses-deger-notu`, 13 text-body). */
export function SoundTable({ modeller = [], olcek = { min: 20, max: 60 }, kip = 'teklif', listede = {}, karsilastirmada = {}, onEkle, onKarsilastir, onAc, mobil = false, metin, yerel = 'tr-TR', style }) {
  const [acik, setAcik] = React.useState(null);
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '\u27E6' + k + '\u27E7'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const nf = (v) => Number(v).toLocaleString(yerel, { maximumFractionDigits: 1 });
  const Mo = (modeller || []).map((m) => ({ ...m, hizlar: (m.hizlar || []).filter((h) => Number.isFinite(h.db)) })).filter((m) => m.hizlar.length);
  if (!Mo.length) return null;
  Mo.sort((a, b) => Math.min(...a.hizlar.map((h) => h.db)) - Math.min(...b.hizlar.map((h) => h.db)));
  const X = (v) => Math.max(0, Math.min(100, ((v - olcek.min) / (olcek.max - olcek.min)) * 100)) + '%';
  const en1 = Mo[0], enAz = Math.min(...en1.hizlar.map((h) => h.db));
  const tikler = []; for (let v = olcek.min; v <= olcek.max; v += 10) tikler.push(v);
  const izgara = { display: 'grid', gridTemplateColumns: 'minmax(0,36%) minmax(0,1fr)', columnGap: '8px', alignItems: 'center' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '900px', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', ...style }}>
      <p style={{ margin: 0, fontSize: '17px', lineHeight: 1.45, fontWeight: 600, textWrap: 'pretty' }}>{M('ds.ses-en-sessiz', { ad: en1.ad, db: nf(enAz) })}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '14px', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)' }}>
        <div role="table" style={{ display: 'flex', flexDirection: 'column' }}>
          <div role="row" style={{ ...izgara, padding: '0 18px 4px 10px' }}>
            <span></span>
            <div style={{ position: 'relative', height: '18px' }}>
              {tikler.map((v, i) => <span key={v} style={{ position: 'absolute', left: X(v), bottom: 0, transform: 'translateX(-50%)', fontSize: '11px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{i === tikler.length - 1 ? v + ' dB(A)' : v}</span>)}
            </div>
          </div>
          {Mo.map((m, ri) => {
            const dbs = m.hizlar.map((h) => h.db), lo = Math.min(...dbs), hi = Math.max(...dbs), a = acik === ri;
            const fiyatVar = typeof m.fiyat === 'number' && m.fiyat > 0;
            return (
              <div key={m.sku || ri} style={{ display: 'flex', flexDirection: 'column', marginTop: '4px', borderRadius: '12px', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-row))' }}>
                <button type="button" role="row" aria-expanded={a} onClick={() => setAcik(a ? null : ri)} style={{ ...izgara, position: 'relative', minHeight: mobil ? '48px' : '34px', padding: '4px 18px 4px 10px', border: 0, background: 'transparent', font: 'inherit', textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
                  <span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>
                  <span role="cell" style={{ minWidth: 0, fontSize: '14px', fontWeight: 600, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.ad}</span>
                  <span role="cell" aria-label={m.hizlar.map((h) => h.ad + ' ' + nf(h.db) + ' dB(A)').join(', ')} style={{ position: 'relative', display: 'block', height: '20px' }}>
                    <span style={{ position: 'absolute', left: 0, right: 0, top: '9px', height: '2px', borderRadius: '1px', background: 'hsl(var(--surface-subtle))' }}></span>
                    <span style={{ position: 'absolute', left: X(lo), width: 'calc(' + X(hi) + ' - ' + X(lo) + ')', top: '8px', height: '4px', borderRadius: '2px', background: 'hsl(var(--border-control))' }}></span>
                    {m.hizlar.map((h, i) => <span key={i} title={h.ad + ' · ' + nf(h.db) + ' dB(A)'} style={{ position: 'absolute', left: X(h.db), top: '4px', width: '12px', height: '12px', marginLeft: '-6px', borderRadius: '6px', background: 'hsl(var(--primary-navy))' }}></span>)}
                  </span>
                </button>
                {a ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 6px 6px', padding: '10px 12px', background: 'hsl(var(--surface-card))', borderRadius: '10px', boxShadow: 'var(--shadow-ince)' }}>
                    <div role="list" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>{m.hizlar.map((h, i) => <span key={i} role="listitem" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 10px', boxSizing: 'border-box', borderRadius: '15px', border: '1px solid hsl(var(--primary-navy))', background: 'hsl(var(--surface-card))', fontSize: '13px' }}><span style={{ fontWeight: 600 }}>{h.ad}</span><span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{nf(h.db)}</span></span>)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button type="button" onClick={() => onAc && onAc(m.sku)} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', minHeight: 'var(--hedef-min)', padding: '0 14px 0 4px', boxSizing: 'border-box', border: '1px solid hsl(var(--primary-navy))', borderRadius: '22px', background: 'hsl(var(--surface-card))', font: 'inherit', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--primary-navy))', cursor: 'pointer' }}>{m.foto ? <span style={{ width: '36px', height: '36px', borderRadius: '18px', background: 'hsl(var(--surface-card)) url(' + m.foto + ') center / 80% no-repeat' }}></span> : null}{M('t.urun-sayfasi')}</button>
                      <span style={{ flex: '1 1 auto' }}></span>
                      <CompareButton secili={!!karsilastirmada[m.sku]} onClick={() => onKarsilastir && onKarsilastir(m.sku)} metin={metin} />
                      <QuoteRequestButton kip={kip} fiyatVar={fiyatVar} listede={!!listede[m.sku]} onClick={() => onEkle && onEkle(m.sku)} metin={metin} />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'hsl(var(--text-body))' }}>{M('ds.ses-deger-notu')}</span>
    </div>
  );
}
