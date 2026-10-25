import React from 'react';

/* SeriesPicker — ürün ailesi sayfasında seri seçimi (iş emri #2 · sayfa-sablonu-aile blok 2).
 * "Seri seçin · n seri" (13/600 text-body) + çipler: 36 px görünür / 44 px basılır (görünmez pay), padding 0 14, 14/600; seçili petrol dolu + "✓ ".
 * Seçince seri kısmı (özet, ürün seçimi, modeller, ses, teknik veri) değişir; adres seçilen serinin adresi (href/onSec çağıranda). Aile kısmı sabit kalır.
 * Masaüstü: kapağın altında, kaydırılır (flex-wrap). Mobil: aynı çipler, yapışkan değil; durum yüzen düğmedeki "‹ seri n/m ›" ile aynı (secili ortak).
 * Tek serili ailede çizilmez. Veride olmayan seri çağıran tarafından listeye konmaz (K7). */
export function SeriesPicker({ seriler = [], secili, onSec, mobil = false, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  if (seriler.length < 2) return null;
  return (
    <div role="radiogroup" aria-label={M('ds.seri-secin')} style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-sans)', ...style }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-body))' }}>{M('ds.seri-secin-n', { n: seriler.length })}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: mobil ? '8px' : '8px 10px' }}>
        {seriler.map((s) => {
          const on = s.id === secili;
          const st = { position: 'relative', flex: 'none', display: 'inline-flex', alignItems: 'center', height: '36px', padding: '0 14px', boxSizing: 'border-box', borderRadius: '18px', border: '1px solid ' + (on ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), background: on ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))', color: on ? 'hsl(var(--text-on-dark))' : 'hsl(var(--text-strong))', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none', cursor: on ? 'default' : 'pointer' };
          const ic = <><span aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 'var(--hedef-min)', transform: 'translateY(-50%)' }}></span>{(on ? '✓ ' : '') + s.ad}</>;
          const sec = (e) => { if (onSec) { if (s.href) e.preventDefault(); onSec(s.id); } };
          return s.href ? <a key={s.id} role="radio" aria-checked={on} href={s.href} onClick={sec} style={st}>{ic}</a> : <button key={s.id} type="button" role="radio" aria-checked={on} onClick={sec} style={{ ...st, WebkitAppearance: 'none' }}>{ic}</button>;
        })}
      </div>
    </div>
  );
}
