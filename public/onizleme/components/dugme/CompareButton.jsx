import React from 'react';

/* CompareButton — karşılaştırmaya ekle/çıkar (yeni ad · ds-cevap 10-22 madde 4). 44×44 oval (etikette 48), kenar --border-control, petrol simge
 * (assets/icons/ui/venthub-ui-karsilastir-22.svg). Seçili: --p2-tint zemin + petrol kenar. Teklif düğmesinin solunda durur (karar 8). */
export function CompareButton({ secili = false, boyut = 'ikon', yazili = false, onClick, metin, style, ...rest }) {
  const [ust, setUst] = React.useState(false);
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const ad = secili ? M('ds.karsilastirmadan-cikar') : M('t.karsilastir-2');
  const w = boyut === 'etiket' ? '48px' : 'var(--hedef-min)';
  return (
    <button type="button" role="checkbox" aria-checked={secili} aria-label={ad} title={ad} onClick={onClick} onMouseEnter={() => setUst(true)} onMouseLeave={() => setUst(false)} style={{ width: yazili ? 'auto' : w, height: w, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: yazili ? '0 18px 0 14px' : 0, fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', boxSizing: 'border-box', border: '1px solid ' + (secili ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))'), borderRadius: 'var(--radius-dugme)', background: secili ? 'hsl(var(--p2-tint))' : ust ? 'hsl(var(--surface-subtle))' : 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', cursor: 'pointer', transition: 'background-color var(--hareket-hizli) var(--hareket-egri), border-color var(--hareket-hizli) var(--hareket-egri)', WebkitAppearance: 'none', ...style }} {...rest}>
      <svg viewBox="0 0 22 22" width="20" height="20" fill="none" aria-hidden="true" style={{ stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}><path d="M8 4v14M14 4v14"></path><path d="M3.5 8.5 8 4l4.5 4.5M9.5 13.5 14 18l4.5-4.5"></path></svg>{yazili ? <span>{ad}</span> : null}
    </button>
  );
}
