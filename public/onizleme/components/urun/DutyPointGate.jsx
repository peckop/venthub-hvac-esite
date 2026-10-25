import React from 'react';

/* DutyPointGate — İhtiyacınız çubuğu (depo NeedsAnalysisWizard/EnhancedNeedsWizard yerine · S5 id="k-secim" · 6c-2 · kararlar 39–40).
 * Modeller listesinin hemen üstünde; ayrı sonuç listesi yok: girdi yalnız altındaki listeyi sıralar ve satıra sonuç yazar (o iş çağıranın).
 * Kök: beyaz, 1 px hairline, köşe 16, dolgu 16 18, satır sarmalı gap 12 24, alt hizalı. Üst etiket 12/600 0,08em büyük harf petrol.
 * Sıra: Debi (m³/h) → Statik basınç (Pa) → Temizle. Mekân çipleri iptal (Recep 10-24 · iş emri #4). Giriş 120×44, köşe 22, border-control, 16/600 tabular. */
export function DutyPointGate({ deger, onDegisim, mobil = false, metin, dil = 'TR', style }) {
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [ic, setIc] = React.useState({ debi: null, basinc: null });
  const V = deger ?? ic;
  const koy = (y) => { if (deger === undefined) setIc(y); onDegisim && onDegisim(y); };
  const sayi = (s) => { const t = String(s).replace(',', '.').replace(/[^\d.]/g, ''); return t === '' ? null : parseFloat(t); };
  const girVar = V.debi != null || V.basinc != null;
  const giris = (et, birim, alan, ornek) => (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: mobil ? '1 1 0' : '0 0 auto', minWidth: 0, whiteSpace: 'nowrap', fontSize: 'var(--size-body-small)', fontWeight: 600, color: 'hsl(var(--text-strong))' }}>
      {et + ' (' + birim + ')'}
      <input type="text" inputMode="numeric" value={V[alan] == null ? '' : String(V[alan])} onChange={(e) => { const v = sayi(e.target.value); koy({ ...V, [alan]: v != null && v >= 0 ? v : null }); }} placeholder={ornek} style={{ width: mobil ? '100%' : '120px', minHeight: 'var(--hedef-min)', padding: '0 12px', boxSizing: 'border-box', border: '1px solid hsl(var(--border-control))', borderRadius: '22px', background: 'hsl(var(--surface-card))', fontFamily: 'var(--font-sans)', fontSize: '16px', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))', outline: 'none' }} />
    </label>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', gap: '12px 24px', padding: '16px 18px', boxSizing: 'border-box', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-hairline))', borderRadius: 'var(--radius-kart)', fontFamily: 'var(--font-sans)', ...style }}>
      <span lang={dil === 'EN' ? 'en' : 'tr'} style={{ flex: '1 1 100%', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'hsl(var(--primary-navy))' }}>{M('ds.ihtiyaciniz-ust')}</span>
      <div style={{ display: 'flex', gap: '12px 16px', alignItems: 'flex-end', flex: mobil ? '1 1 100%' : '0 1 auto', flexWrap: mobil ? 'nowrap' : 'wrap' }}>
        {giris(M('t.debi'), 'm³/h', 'debi', '400')}
        {giris(M('t.statik-basinc'), 'Pa', 'basinc', '150')}
      </div>
      {girVar ? <button type="button" onClick={() => koy({ debi: null, basinc: null })} style={{ minHeight: 'var(--hedef-min)', padding: '0 18px', border: '1px solid hsl(var(--border-control))', borderRadius: '22px', background: 'hsl(var(--surface-card))', fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-small)', fontWeight: 600, color: 'hsl(var(--text-strong))', cursor: 'pointer' }}>{M('t.temizle')}</button> : null}
    </div>
  );
}
