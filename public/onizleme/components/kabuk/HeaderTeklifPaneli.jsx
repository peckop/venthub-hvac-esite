import React from 'react';
import { MetinGirisi } from '../form/MetinGirisi.jsx';
import { PhotoStage } from '../foto/PhotoStage.jsx';

/* HeaderTeklifPaneli — header "Teklif"/"Sepet" yan paneli (depo HeaderTeklifPaneli.tsx · TeklifPaneliIcerigi.tsx · S5 6c-9 · karar 21).
 * Perde text-strong/0,45. Masaüstü: sağda sabit, tam yükseklik, 440 px (en çok %92), sol köşeler 16. Mobil: alttan, en çok 390 px, en çok %84 yükseklik, köşe 8 8 0 0.
 * Üst: başlık 22/600 −0,02em + "{n} ürün · {n} adet" 13 · × 44 (1 px border-control). Boşken açıklama. Satır: 64 px foto · ad 15/600 · kod 12 · − adet + (44×36) · Listeden çıkar.
 * Teklif kipinde "Talebi tamamla"nın üstünde proje adı ve not (MetinGirisi; teklifin bilgisi, bir kez sorulur — iş emri #10).
 * Alt: dolu kiremit "Talebi tamamla →" / "Siparişi tamamla →" (48, yalnız doluyken) + çerçeveli petrol "Sayfaya dön" (44). İletişim panel değil, sayfa. */
export function HeaderTeklifPaneli({ acik = true, onKapat, kip = 'teklif', urunler = [], onAdet, onSil, onAc, onTamamla, projeAdi, onProjeAdi, not, onNot, mobil = false, metin, style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const satis = kip === 'satis';
  React.useEffect(() => { if (!acik) return; const f = (e) => { if (e.key === 'Escape' && onKapat) onKapat(); }; window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, [acik, onKapat]);
  if (!acik) return null;
  const top = urunler.reduce((a, x) => a + (x.adet || 0), 0), dolu = urunler.length > 0;
  const B = satis ? M('t.sepetiniz') : M('t.teklif-listeniz');
  const konum = mobil ? { left: '50%', bottom: 0, transform: 'translateX(-50%)', width: 'min(390px, 100vw)', maxHeight: '84vh', borderRadius: '8px 8px 0 0' } : { top: 0, right: 0, bottom: 0, width: 'min(440px, 92vw)', borderRadius: '16px 0 0 16px' };
  const adetB = (et, f) => <button type="button" onClick={f} aria-label={et} style={{ width: '44px', height: '44px', border: '1px solid hsl(var(--border-control))', borderRadius: '22px', background: 'hsl(var(--surface-card))', color: 'hsl(var(--text-strong))', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: '18px', padding: 0 }}>{et}</button>;
  return (
    <>
      <div onClick={onKapat} style={{ position: 'fixed', inset: 0, background: 'hsl(var(--text-strong) / 0.45)', zIndex: 70 }}></div>
      <aside role="dialog" aria-modal="true" aria-label={B} style={{ position: 'fixed', zIndex: 71, ...konum, display: 'flex', flexDirection: 'column', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', boxShadow: 'var(--shadow-overlay)', overflow: 'hidden', fontFamily: 'var(--font-sans)', color: 'hsl(var(--text-strong))', ...style }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', padding: '18px 20px 14px', borderBottom: '1px solid hsl(var(--border-hairline))' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: '1 1 auto' }}>
            <span style={{ fontSize: '22px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2, whiteSpace: 'nowrap' }}>{B}</span>
            {dolu ? <span style={{ fontSize: '13px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{M('ds.n-urun-n-adet', { n: urunler.length, adet: top })}</span> : null}
          </div>
          <button type="button" onClick={onKapat} aria-label={M('t.sayfaya-don')} style={{ flex: 'none', width: '44px', height: '44px', border: '1px solid hsl(var(--border-control))', borderRadius: '22px', background: 'hsl(var(--surface-card))', fontSize: '20px', lineHeight: 1, color: 'hsl(var(--text-strong))', cursor: 'pointer', padding: 0 }}>×</button>
        </div>
        <div style={{ flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {!dolu ? <p style={{ margin: 0, padding: '24px 20px', fontSize: 'var(--size-body-small)', lineHeight: 1.55, color: 'hsl(var(--text-body))' }}>{satis ? M('t.sepetiniz-bos-fiyati-gorunen-urunleri-model-kart') : M('t.listeniz-bos-model-kartlarindaki-teklif-listesin')}</p> : null}
          {urunler.map((u) => (
            <div key={u.sku} style={{ display: 'grid', gridTemplateColumns: (u.foto ? '64px' : '2px') + ' minmax(0,1fr)', gap: '12px', padding: '12px 20px', borderBottom: '1px solid hsl(var(--border-row))' }}>
              {u.foto ? <button type="button" onClick={() => onAc && onAc(u.sku)} aria-label={u.ad} style={{ width: '64px', height: '64px', padding: 0, border: '1px solid hsl(var(--border-hairline))', borderRadius: '10px', background: 'transparent', cursor: 'pointer', overflow: 'hidden' }}><PhotoStage src={u.foto} alt={u.ad} boy="satir" genislik="62px" yukseklik={62} kose="9px" /></button> : <span aria-hidden="true" style={{ alignSelf: 'stretch', width: '2px', borderRadius: '1px', background: 'hsl(var(--primary-navy))' }}></span> /* #17 D: fotoğrafsız → boş kutu yok, 2 px petrol sol kural */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                <button type="button" onClick={() => onAc && onAc(u.sku)} style={{ padding: 0, border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer', font: 'inherit', fontSize: '15px', fontWeight: 600, lineHeight: 1.3, color: 'hsl(var(--text-strong))' }}>{u.ad}</button>
                {u.kod ? <span style={{ fontSize: '12px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{u.kod}</span> : null}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{adetB('−', () => onAdet && onAdet(u.sku, Math.max(0, (u.adet || 1) - 1)))}<span style={{ minWidth: '32px', textAlign: 'center', fontSize: '15px', fontVariantNumeric: 'tabular-nums' }}>{u.adet}</span>{adetB('+', () => onAdet && onAdet(u.sku, (u.adet || 0) + 1))}</div>
                  <button type="button" onClick={() => onSil && onSil(u.sku)} style={{ minHeight: '44px', padding: '0 12px', border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', color: 'hsl(var(--primary-navy))' }}>{satis ? M('t.sepetten-cikar') : M('t.listeden-cikar')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px 20px', borderTop: '1px solid hsl(var(--border-hairline))' }}>
          {dolu && kip === 'teklif' && (onProjeAdi || onNot) ? <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '4px' }}>{onProjeAdi ? <MetinGirisi etiket={M('ds.proje-adi')} deger={projeAdi} onDeger={onProjeAdi} metin={metin} /> : null}{onNot ? <MetinGirisi etiket={M('t.not')} cokSatir deger={not} onDeger={onNot} yerTutucu={M('ds.proje-not-yer')} metin={metin} /> : null}</div> : null}
          {dolu ? <button type="button" onClick={onTamamla} style={{ width: '100%', minHeight: '48px', border: 0, borderRadius: '24px', background: 'hsl(var(--action-terracotta-deep))', color: 'hsl(var(--text-on-dark))', font: 'inherit', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>{satis ? M('t.siparisi-tamamla') : M('t.talebi-tamamla')}</button> : null}
          <button type="button" onClick={onKapat} style={{ width: '100%', minHeight: 'var(--hedef-min)', border: '1px solid hsl(var(--primary-navy))', borderRadius: '22px', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', font: 'inherit', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>{M('t.sayfaya-don')}</button>
        </div>
      </aside>
    </>
  );
}
