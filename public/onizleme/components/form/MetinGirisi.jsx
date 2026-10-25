import React from 'react';

/* MetinGirisi — metin giriş kutusu (iş emri #5 madde 5). Ürün sayfası "Teklif bilgileri" (proje adı, not) ve teklif formu.
 * Etiket üstte 14 px --text-body · kutu 44 px (çok satırda en az 3 satır), köşe 12, 1 px --border-control, zemin --surface-card;
 * yazı 15 px --text-strong, yer tutucu --text-muted; odakta 2 px petrol halka (kenar yerine, boy değişmez); açıklama altta 14 px --text-body.
 * zorunlu: etiketin yanında "· Zorunlu" (t.zorunlu) + aria-required. ek: o yazının yerine çağıranın sözcüğü (teklif formu: ds.teklif-zorunlu / -istege-bagli, iş emri #15 aşama 3). Parça yazı tutmaz: etiket/yerTutucu/aciklama çağırandan, sabit sözcük `metin`den.
 * Sayfa geneline kural yazmaz; yer tutucu rengi kökün data-vh-metin-girisi seçicisine bağlı. */
export function MetinGirisi({ etiket, deger, onDeger, yerTutucu, cokSatir = false, zorunlu = false, ek, aciklama, metin, id, style }) {
  const M = (k) => { const s = metin && metin[k]; return s == null ? '\u27E6' + k + '\u27E7' : s; };
  const [odak, setOdak] = React.useState(false);
  const oto = React.useId ? React.useId() : 'vh-mg';
  const kimlik = id || 'vh-mg-' + String(oto).replace(/[^a-zA-Z0-9_-]/g, '');
  const acId = aciklama ? kimlik + '-ac' : undefined;
  const ortak = {
    id: kimlik, value: deger ?? '', placeholder: yerTutucu, required: zorunlu || undefined, 'aria-required': zorunlu || undefined, 'aria-describedby': acId,
    onChange: (e) => onDeger && onDeger(e.target.value), onFocus: () => setOdak(true), onBlur: () => setOdak(false),
    style: {
      display: 'block', width: '100%', boxSizing: 'border-box', margin: 0, minHeight: cokSatir ? 'calc(3 * 1.5em + 22px)' : 'var(--hedef-min)', height: cokSatir ? undefined : 'var(--hedef-min)',
      padding: cokSatir ? '10px 14px' : '0 14px', border: '1px solid hsl(var(--border-control))', borderRadius: 'var(--radius-kucuk)', background: 'hsl(var(--surface-card))',
      fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.5, color: 'hsl(var(--text-strong))', outline: 0, resize: cokSatir ? 'vertical' : undefined,
      boxShadow: odak ? '0 0 0 2px hsl(var(--primary-navy))' : 'none', borderColor: odak ? 'hsl(var(--primary-navy))' : 'hsl(var(--border-control))',
      transition: 'box-shadow var(--hareket-hizli) var(--hareket-egri), border-color var(--hareket-hizli) var(--hareket-egri)', WebkitAppearance: 'none',
    },
  };
  return (
    <div data-vh-metin-girisi="" style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, fontFamily: 'var(--font-sans)', ...style }}>
      <style>{'[data-vh-metin-girisi] input::placeholder,[data-vh-metin-girisi] textarea::placeholder{color:hsl(var(--text-muted));opacity:1}[data-vh-metin-girisi] input:focus-visible,[data-vh-metin-girisi] textarea:focus-visible{border-color:hsl(var(--primary-navy));box-shadow:0 0 0 2px hsl(var(--primary-navy))}'}</style>
      {etiket ? <label htmlFor={kimlik} style={{ display: 'flex', alignItems: 'baseline', gap: '6px', fontSize: '14px', fontWeight: 600, lineHeight: 1.4, color: 'hsl(var(--text-body))' }}>{etiket}{ek || zorunlu ? <span style={ek ? { fontSize: '13px', fontWeight: 500, color: 'hsl(var(--text-muted))' } : { fontWeight: 400, color: 'hsl(var(--text-muted))' }}>{'· ' + (ek || M('t.zorunlu'))}</span> : null}</label> : null}
      {cokSatir ? <textarea rows={3} {...ortak}></textarea> : <input type="text" {...ortak} />}
      {aciklama ? <span id={acId} style={{ fontSize: '14px', lineHeight: 1.45, color: 'hsl(var(--text-body))', textWrap: 'pretty' }}>{aciklama}</span> : null}
    </div>
  );
}
