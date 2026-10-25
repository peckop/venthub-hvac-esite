import React from 'react';
import { HiyerarsiSimgesi } from '../hiyerarsi/HiyerarsiSimgesi.jsx';

/* FloatingNav — mobil yüzen düğme (kart-dili-kararlar 10-24 · Kart Dili Akış v2 3a). Petrol, 48 px, köşe 24, gölge; alt çubuğun (64) üstünde, alttan 76 px, yatayda ortalı.
 * Sol parça: bulunulan yerin simgesi (18, beyaz) + adı (14/600, tek satır, kesilir) → MobileTree paneli. Sağ parça (onFiltrele verilirse): 1 px ayraç + "Filtrele" (+ beyaz sayı rozeti 22).
 * Seri/ürün sayfasında seriGecis: "‹ seri adı n/m ›" — oklar 44 px, aynı türün önceki/sonraki serisi; sınırda ok --text-on-dark %35 değil, düğme pasif ve aria-disabled.
 * Ürünler sayfasında çizilmez (çağıran koymaz). Kapak çipleri görünürken gizlemek çağıranda (gizli=true: soluklaşır, 12 px aşağı, basılmaz). */
export function FloatingNav({ yer, seviye = 'urun-turu', onYer, onFiltrele, filtreSayisi = 0, seriGecis, gizli = false, sabit = true, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const sg = seriGecis;
  const ok = (yon) => { const var_ = yon < 0 ? sg.sira > 1 : sg.sira < sg.toplam; const ad = yon < 0 ? sg.oncekiAd : sg.sonrakiAd; return (
    <button type="button" onClick={var_ ? (yon < 0 ? sg.onOnceki : sg.onSonraki) : undefined} aria-disabled={!var_} aria-label={var_ ? (yon < 0 ? M('ds.onceki-seri', { ad: ad || '' }) : M('ds.sonraki-seri', { ad: ad || '' })) : (yon < 0 ? M('ds.onceki-seri-yok') : M('ds.sonraki-seri-yok'))} style={{ flex: 'none', width: 'var(--hedef-min)', border: 0, background: 'transparent', color: var_ ? 'hsl(var(--text-on-dark))' : 'hsl(var(--text-on-dark-muted))', font: 'inherit', fontSize: '20px', cursor: var_ ? 'pointer' : 'default' }}>{yon < 0 ? '‹' : '›'}</button>
  ); };
  return (
    <div style={{ position: sabit ? 'fixed' : 'relative', left: sabit ? '12px' : undefined, right: sabit ? '12px' : undefined, bottom: sabit ? '76px' : undefined, zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none', opacity: gizli ? 0 : 1, transform: gizli ? 'translateY(12px)' : 'none', transition: 'opacity 200ms var(--hareket-egri), transform 200ms var(--hareket-egri)', ...style }}>
      <nav aria-label={M('ds.bulundugunuz-yer')} style={{ pointerEvents: gizli ? 'none' : 'auto', display: 'flex', alignItems: 'stretch', maxWidth: '100%', height: '48px', borderRadius: '24px', background: 'hsl(var(--primary-navy))', color: 'hsl(var(--text-on-dark))', boxShadow: '0 10px 24px hsl(var(--primary-navy) / 0.35)', fontFamily: 'var(--font-sans)' }}>
        {sg ? ok(-1) : null}
        <button type="button" onClick={onYer} style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, padding: sg ? '0 4px' : '0 14px 0 18px', border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <HiyerarsiSimgesi seviye={seviye} boyut={18} renk="hsl(var(--text-on-dark))" />
          <span style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{yer}</span>
          {sg ? <span style={{ flex: 'none', fontSize: '12px', fontWeight: 500, color: 'hsl(var(--text-on-dark-muted))', fontVariantNumeric: 'tabular-nums' }}>{sg.sira + '/' + sg.toplam}</span> : null}
        </button>
        {sg ? ok(1) : null}
        {onFiltrele ? <><span aria-hidden="true" style={{ width: '1px', margin: '10px 0', background: 'hsl(var(--text-on-dark) / 0.35)' }}></span>
          <button type="button" onClick={onFiltrele} style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 18px 0 14px', border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true" style={{ flex: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' }}><path d="M4 7h10M18 7h2M4 17h4M12 17h8"></path><circle cx="16" cy="7" r="2"></circle><circle cx="10" cy="17" r="2"></circle></svg>
            {M('ds.filtrele')}
            {filtreSayisi > 0 ? <span style={{ minWidth: '22px', height: '22px', padding: '0 6px', boxSizing: 'border-box', borderRadius: '11px', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>{filtreSayisi}</span> : null}
          </button></> : null}
      </nav>
    </div>
  );
}
