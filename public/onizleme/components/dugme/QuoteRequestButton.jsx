import React from 'react';

/* QuoteRequestButton — teklif/sepet eylemi (depo components/quotes/QuoteRequestButton.tsx · ds-cevap 10-22 madde 4).
 * Eylem: satış kipi + fiyatlı ürün → sepet (araba simgesi), aksi hâlde teklif (belge simgesi). Kart/satır düğmesinde artılı simge (S5 satır içi çizimi: belge + artı, araba + artı); header ve mobil alt çubukta artısız (kart-*-22.svg) — ds-cevap 10-23 madde 4.
 * boyut="ikon" (kart, satır, SoundTable kutusu): 44×44 oval. Sepet dolu kiremit + beyaz simge; teklif çerçeveli petrol (S5 6c-3).
 * boyut="etiket" (ürün sayfası, alt çubuk): 48 px, dolu kiremit, "Teklif listesine ekle" / "Sepete ekle" (Ürün Sayfası Alternatifler 5a, 9a).
 * Eklenince (listede): yazı yerine ✓ (Recep 10-22: "yazı yok, ikonlarımız var"); etikette "✓ Teklif listesinde" / "✓ Sepette". */
const TEKLIF = <><path d="M5 5h10v15H5z"></path><path d="M8 9h4M8 12.5h4M8 16h2"></path><path d="M19 9v6M16 12h6"></path></>;
const SEPET = <><path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2"></path><circle cx="9.5" cy="19.5" r="1.3"></circle><circle cx="17" cy="19.5" r="1.3"></circle><path d="M13 9.5v4M11 11.5h4"></path></>;
export function QuoteRequestButton({ kip = 'teklif', fiyatVar = false, boyut = 'ikon', listede = false, onClick, tam = false, metin, style, ...rest }) {
  const [ust, setUst] = React.useState(false);
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const sepet = kip === 'satis' && fiyatVar;
  const ad = listede ? (sepet ? M('ds.sepette') : M('ds.teklif-listesinde')) : (sepet ? M('t.sepete-ekle') : M('t.teklif-listesine-ekle'));
  const ikon = (renk, w) => <svg viewBox="0 0 24 24" width={w} height={w} fill="none" aria-hidden="true" style={{ flex: 'none', stroke: renk, strokeWidth: sepet ? 1.8 : 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }}>{sepet ? SEPET : TEKLIF}</svg>;
  const gecis = 'background-color var(--hareket-hizli) var(--hareket-egri), color var(--hareket-hizli) var(--hareket-egri), box-shadow var(--hareket-hizli) var(--hareket-egri)';
  const ortak = { type: 'button', onClick, 'aria-pressed': listede, onMouseEnter: () => setUst(true), onMouseLeave: () => setUst(false), ...rest };
  if (boyut === 'etiket') {
    return (
      <button {...ortak} style={{ display: tam ? 'flex' : 'inline-flex', width: tam ? '100%' : undefined, alignItems: 'center', justifyContent: 'center', gap: '8px', height: '48px', padding: '0 24px', boxSizing: 'border-box', border: 0, borderRadius: '24px', background: 'hsl(var(--action-terracotta-deep))', color: 'hsl(var(--text-on-dark))', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body)', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', boxShadow: ust ? 'var(--shadow-ince)' : 'none', transition: gecis, WebkitAppearance: 'none', ...style }}>
        {listede ? <span aria-hidden="true">✓</span> : null}{ad}
      </button>
    );
  }
  const dolu = sepet || listede;
  const zemin = sepet ? 'hsl(var(--action-terracotta-deep))' : listede ? 'hsl(var(--primary-navy))' : ust ? 'hsl(var(--primary-navy))' : 'hsl(var(--surface-card))';
  const renk = dolu || ust ? 'hsl(var(--text-on-dark))' : 'hsl(var(--primary-navy))';
  return (
    <button {...ortak} aria-label={ad} title={ad} style={{ width: 'var(--hedef-min)', height: 'var(--hedef-min)', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, boxSizing: 'border-box', border: sepet ? 0 : '1px solid hsl(var(--primary-navy))', borderRadius: '22px', background: zemin, color: renk, cursor: 'pointer', boxShadow: sepet && ust ? 'var(--shadow-ince)' : 'none', transition: gecis, WebkitAppearance: 'none', fontFamily: 'var(--font-sans)', fontSize: '18px', fontWeight: 700, ...style }}>
      {listede ? <span aria-hidden="true">✓</span> : ikon(renk, 20)}
    </button>
  );
}
