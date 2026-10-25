import React from 'react';
import { FotoNoktalari } from '../foto/FotoNoktalari.jsx';
import { AdetKontrolu } from '../veri/AdetKontrolu.jsx';
import { PageCover } from './PageCover.jsx';
import { VariantPicker } from '../urun/VariantPicker.jsx';
import { QuoteRequestButton } from '../dugme/QuoteRequestButton.jsx';
import { CompareButton } from '../dugme/CompareButton.jsx';

/* İş emri #10: sağ sütun — temel değerler (paragraf yok; aciklama çizilmez, sayfada "Ürün hakkında"), ana eylem satırı Adet · ana eylem · Karşılaştır (onEkle(adet)),
 *   ikincil çerçeveli eylemler (Teknik föy, Seçiminiz karşılıyor mu ↓, satışta Toplu alım), kod kopyalama (44 basma, 1,5 sn aria-live).
 * Dizilim (Recep 10-25): temel değerler sütun genişliğine yayılmaz (en çok 132, sola toplu, ara 24); fiyat ile adet · ana eylem · Karşılaştır yan yana, ara 24 (sağa itilmez).
 * Karar 7 (Recep 10-25 · Model Secici Alternatifler 1b): sütunlar 5 : 7 (fotoğraf dar), h1 40; sağ sütun: seviye · ad · alt satır → temel değerler (tek satır, ara 28)
 *   → seçim tek satır (VariantPicker yerlesim='satir': çap açılır liste + AC | EC anahtarı) → fiyat · adet · ana eylem → ikincil: Karşılaştır · Seçiminiz karşılıyor mu? · Toplu alım.
 *   İlk ekran: ana eylem pencere altından 16 px içeride değilse yalnız iç boşluk 28 → 20 (kapak kendini ölçer; pencere boyu değişince baştan). Başka sıkılaştırma yok.
 * Not 10-25 (kapak): seviye etiketi "MODEL · MARKA" başlığın üstünde (PageCover seviye='model'); seçim etiketi her satırda üstte; kod + kopyala düğmesi arası 7 (--space-inline), birlikte kırılır.
 * #10 madde 6: Katalog modu ürün kapağında yok (yeri seri ve aile sayfası); teknikFoy yalnız modelin kendi föyü.
 * Fotoğraf varsayılan solda, seçim/fiyat/eylem sağda (iş emri #8, Recep 10-25; seri kapağıyla aynı yön). fotoTaraf: 'sag' eski hâl. Mobil değişmez.
 * ProductCover — ürün sayfası kapağı (Foto Dili Akış 5b · Alternatifler 9a · 6a).
 * 5b düzeni: seçim, fiyat ve eylem kapağın sol sütununda, 1 px border-control çizgiyle ayrılır (ayrı kutu yok).
 * Sol: logo (22) → h1 (Schibsted 44/800) → çizgili alt satır (seri tanımı · kod) → öne çıkan değer yuvası (FeatureSlot, kutusuz, ölçekte mekân yok) → açıklama/belge
 * → VariantPicker → fiyat (Onest 28/700 tabular, ₺ önde, "+ KDV %20", "KDV dahil …") + ana eylem (48) + ⇄ (48).
 * Sağ: PhotoStage 400 (5b; mobil 300) + küçük resimler 72×60 (seçili 2 px petrol). Teklif kipinde fiyat yok, ana eylem "Teklif listesine ekle".
 * Mobil (6a): fotoğraf üstte 300, seçim ve fiyat MobileBuyBar'a geçer (bu bileşen çizmez). */
const fiyatYaz = (n, yerel) => '₺' + Number(n).toLocaleString(yerel, { minimumFractionDigits: 2, maximumFractionDigits: 2 }); /* fiyatta binlik nokta: ₺70.977,23 (Recep 10-25); teknik değerde boşluk */
const gizli = { position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };
export function ProductCover({ secimEtiketi, marka, markaLogo, markaHref, ad, altSatir, konum, gorseller = [], yuva, aciklama, belge, degerler = [], kod, adet = 1, onAdet, teknikFoy, onSecimKarsiliyor, onTopluAlim, eksenler, secim, onSecim, kip = 'teklif', fiyat, kdvOrani = 20, listede = false, onEkle, karsilastirmada = false, onKarsilastir, mobil = false, metin, dil = 'TR', fotoTaraf = 'sol', yerel = 'tr-TR', style }) {
  const [gi, setGi] = React.useState(0);
  const [sik, setSik] = React.useState(0); /* Karar 7 (1b): tek sıkılaştırma — ana eylem pencere altından 16 px içeride değilse iç boşluk 28 → 20 */
  const eylemRef = React.useRef(null);
  React.useEffect(() => { if (mobil) return; const yeni = () => setSik(0); window.addEventListener('resize', yeni); return () => window.removeEventListener('resize', yeni); }, [mobil]);
  React.useLayoutEffect(() => { if (mobil || sik >= 1 || !eylemRef.current) return; const alt = eylemRef.current.getBoundingClientRect().bottom + window.scrollY; if (alt > window.innerHeight - 16) setSik(sik + 1); });
  const M = (k, v) => { let s = metin && metin[k]; if (s == null) return '⟦' + k + '⟧'; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; }; /* metin: sözlük anahtarı → yazı (çağıran verir). Eksik anahtar ⟦anahtar⟧ çizilir; TR'ye düşülmez (ds-kural-metin 10-24). */
  const [kopya, setKopya] = React.useState(false);
  const kopyala = () => { try { navigator.clipboard && navigator.clipboard.writeText(kod); } catch (e) {} setKopya(true); setTimeout(() => setKopya(false), 1500); };
  const ik = { display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: 'var(--hedef-min)', padding: '0 16px', boxSizing: 'border-box', borderRadius: '22px', border: '1px solid hsl(var(--primary-navy))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', fontFamily: 'var(--font-sans)', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none', cursor: 'pointer' };
  const kodDugme = kod ? <><button type="button" onClick={kopyala} aria-label={M('ds.kodu-kopyala')} title={M('ds.kodu-kopyala')} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', marginLeft: 'var(--space-inline)', padding: 0, border: '1px solid hsl(var(--border-control))', borderRadius: '8px', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', cursor: 'pointer', verticalAlign: 'middle' }}><span aria-hidden="true" style={{ position: 'absolute', left: '50%', top: '50%', width: 'var(--hedef-min)', height: 'var(--hedef-min)', transform: 'translate(-50%,-50%)' }}></span><svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><rect x="5" y="5" width="8" height="8" rx="1.5"></rect><path d="M3 10.5V4a1 1 0 0 1 1-1h6.5"></path></svg></button><span aria-live="polite" style={{ marginLeft: 'var(--space-inline)', fontSize: '13px', fontWeight: 600, color: 'hsl(var(--primary-navy))' }}>{kopya ? M('ds.kopyalandi') : ''}</span></> : null;
  const altYazi = typeof altSatir === 'string' && kod && altSatir.endsWith(kod) ? altSatir.slice(0, -kod.length).replace(/\s*·\s*$/, '') : altSatir; /* kod düğmeyle birlikte kırılır (not 10-25 madde 4) */
  const D = (degerler || []).filter((x) => x && x.v != null && String(x.v).trim() !== '');
  const n = gorseller.length, g = Math.min(gi, Math.max(0, n - 1));
  const fiyatVar = typeof fiyat === 'number' && fiyat > 0, goster = kip === 'satis' && fiyatVar;
  const logo = markaLogo ? <img src={markaLogo} alt="" aria-hidden="true" style={{ display: 'block', height: mobil ? '20px' : '22px', width: 'auto', maxWidth: '140px', objectFit: 'contain', objectPosition: 'left' }} /> : null;
  const baslikIcerik = <span style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'flex-start' }}>{logo ? (markaHref ? <a href={markaHref} aria-label={marka} style={{ display: 'block' }}>{logo}</a> : logo) : null}<span>{marka ? <span style={logo ? gizli : undefined}>{marka + ' '}</span> : null}{ad}</span></span>;
  /* Recep 10-25 (390): oklar fotoğrafın üstünde değil, altında noktaların iki yanında (ürünü kapatmasın); "1 / n" sayacı yerine noktalar (üst şeritteki bölüm sayacıyla karışmasın). */
  const okS = { flex: 'none', width: 'var(--hedef-min)', height: 'var(--hedef-min)', borderRadius: '22px', background: 'hsl(var(--surface-card))', border: '1px solid hsl(var(--border-control))', color: 'hsl(var(--primary-navy))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer', padding: 0 };
  const oklar = null;
  const kucukler = n > 1 ? (
    <div style={{ display: 'flex', gap: mobil ? '16px' : '10px', alignItems: 'center' }}>
      {mobil ? <><button type="button" aria-label={M('t.onceki-fotograf')} onClick={() => setGi((g - 1 + n) % n)} style={okS}>‹</button><FotoNoktalari adet={n} secili={g} onSec={setGi} metin={metin} /><button type="button" aria-label={M('t.sonraki-fotograf')} onClick={() => setGi((g + 1) % n)} style={okS}>›</button></> : gorseller.map((s, i) => (
        <button key={i} type="button" onClick={() => setGi(i)} aria-label={M('ds.n-fotograf', { n: i + 1 })} aria-pressed={i === g} style={{ width: '72px', height: '60px', padding: 0, boxSizing: 'border-box', borderRadius: '10px', border: i === g ? '2px solid hsl(var(--primary-navy))' : '1px solid hsl(var(--border-hairline))', background: 'var(--foto-sahne-zemin)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}><img src={s} alt="" style={{ maxWidth: '84%', maxHeight: '84%', objectFit: 'contain', mixBlendMode: 'multiply' }} /></button>
      ))}
    </div>
  ) : null;
  return (
    <PageCover seviye="model" marka={marka} baslikBoy="40px" sutunlar={fotoTaraf === 'sol' ? 'minmax(0,5fr) minmax(0,7fr)' : 'minmax(0,7fr) minmax(0,5fr)'} dil={dil} fotoTaraf={fotoTaraf} baslikIcerik={baslikIcerik} altSatir={kodDugme ? <span>{altYazi}{altYazi ? ' · ' : ''}<span style={{ whiteSpace: 'nowrap' }}>{kod}{kodDugme}</span></span> : altSatir} foto={n ? { src: gorseller[g], alt: [marka, ad].filter(Boolean).join(' '), ust: oklar } : null} fotoBoy="buyuk" fotoEk={kucukler} mobil={mobil} metin={metin} style={{ padding: mobil ? '0' : (sik >= 1 ? '20px' : '28px') + ' 32px', ...style }}>
      {yuva}
      {D.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 28px', paddingTop: '14px', borderTop: '1px solid hsl(var(--border-row))' }}>{D.map((x, i) => <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}><span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--size-body-small)', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: 'hsl(var(--text-strong))', whiteSpace: 'nowrap' }}>{x.v}{x.birim ? <span style={{ fontWeight: 400, fontSize: '13px', color: 'hsl(var(--text-body))' }}>{' ' + x.birim}</span> : null}</span><span style={{ fontSize: 'var(--size-caption)', color: 'hsl(var(--text-muted))' }}>{x.ad}</span></div>)}</div> : null}
      {belge && !teknikFoy ? <a href={belge.href} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', height: 'var(--hedef-min)', padding: '0 16px', boxSizing: 'border-box', borderRadius: '22px', border: '1px solid hsl(var(--primary-navy))', background: 'hsl(var(--surface-card))', color: 'hsl(var(--primary-navy))', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none' }}>{belge.ad}</a> : null}
      {!mobil ? (
        <>
          {eksenler && eksenler.length ? <div style={{ paddingTop: '14px', marginTop: '2px', borderTop: '1px solid hsl(var(--border-control))' }}><VariantPicker yerlesim="satir" etiket={secimEtiketi} eksenler={eksenler} secim={secim} onSecim={onSecim} /></div> : null}
          <div ref={eylemRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '14px 24px', marginTop: '4px', flexWrap: 'wrap' }}>
            {goster ? (
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: '8px', whiteSpace: 'nowrap' }}><span style={{ fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums', fontSize: '28px', fontWeight: 700, color: 'hsl(var(--text-strong))' }}>{fiyatYaz(fiyat, yerel)}</span><span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--text-body))' }}>{M('ds.kdv-n', { n: kdvOrani })}</span></span>
                <span style={{ fontSize: '13px', color: 'hsl(var(--text-body))', fontVariantNumeric: 'tabular-nums' }}>{M('ds.kdv-dahil-fiyat', { fiyat: fiyatYaz(fiyat * (1 + kdvOrani / 100), yerel) })}</span>
              </span>
            ) : null}
            <span style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {onAdet ? <AdetKontrolu deger={adet} min={1} onDegisim={onAdet} etiket={M('t.adet')} /> : null}
              <QuoteRequestButton boyut="etiket" kip={kip} fiyatVar={fiyatVar} listede={listede} onClick={() => onEkle && onEkle(adet)} metin={metin} />
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <CompareButton boyut="etiket" yazili secili={karsilastirmada} onClick={onKarsilastir} metin={metin} />
            {teknikFoy ? <a href={teknikFoy.href || '#'} onClick={teknikFoy.onClick} style={ik}>{M('ds.teknik-foy-indir')}</a> : null}
            {onSecimKarsiliyor ? <button type="button" onClick={onSecimKarsiliyor} style={ik}>{M('ds.secim-karsiliyor-mu')}</button> : null}
            {kip === 'satis' && onTopluAlim ? <button type="button" onClick={onTopluAlim} style={ik}>{M('ds.toplu-alim-teklif')}</button> : null}
          </div>
        </>
      ) : null}
    </PageCover>
  );
}
