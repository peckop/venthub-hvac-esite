import React from 'react';

/* PhotoStage — ürün fotoğrafı sahnesi (foto-ve-kart-kurali-2026-10-23 §1 · Foto Dili Akış 1–5).
 * Zemin --foto-sahne-zemin (inset → page). Sayfa fotoğrafın zeminini kendisi okur (sol üst piksel, CORS ile):
 * zeminsiz → --shadow-foto (küçükte --shadow-foto-kucuk); beyaz zeminli → mix-blend-mode multiply, gölge yok. Dosyaya dokunulmaz.
 * Boy: satir 60 (72 geniş) · kart 160–200 · kapak 300 · seri 360 · urun/buyuk 400 (5b). Mobil: urun/buyuk 300 (ProductCover); PageCover mobilde 220 verir (yukseklik verilince 300'e çekilmez). Köşe: kart içi 12, satırda 10, kapakta 0;
 * mobilde kapak zemini yalnız fotoğrafın arkasında, fotoğraf alanı köşesi 16 (DESIGN-MENU denetim 10-23 madde 5).
 * Fotoğraf yoksa null (K7). <img> kutuyu doldurur (width/height 100% + maxWidth/maxHeight, object-fit contain): lazy yükleme gerçek bir dikdörtgen görür;
 *   boyutu görselden gelen 0×0 kutuda tarayıcı yüklemeyi hiç başlatmıyordu (satır foto, UrunHaritasi, ModelRow).
 * Fotoğraf noktalarında (FotoNoktalari) kart ve kapak görselleri de bu yüzden boş kalmaz.
 * src değişince zemin kararı hemen o görselin okunmuş değerine döner (yoksa undefined); karar yokken görsel görünmez (yer tutar), 120 ms ile belirir.
 * Okuma başarısızsa (CORS, canvas) multiply varsayılır: zeminsizde etkisiz, beyaz zeminlide doğru — beyaz kutu kalmaz (iş emri #5 madde 3). */
const BOY = { satir: 60, kart: 180, kapak: 300, seri: 360, urun: 400, buyuk: 400 };
const KOSE = { satir: '10px', kart: 'var(--radius-kucuk)', kapak: '0', seri: '0', urun: '0', buyuk: '0' };
const okunan = {};
export function PhotoStage({ src, alt = '', boy = 'kart', yukseklik, genislik, zemin = 'otomatik', sahneZemini = true, mobil = false, kose, children, style, ...rest }) {
  const [oto, setOto] = React.useState(src ? okunan[src] : undefined);
  const [oSrc, setOSrc] = React.useState(src);
  if (oSrc !== src) { setOSrc(src); setOto(src ? okunan[src] : undefined); }
  React.useEffect(() => {
    if (!src || zemin !== 'otomatik') return;
    if (okunan[src] !== undefined) { setOto(okunan[src]); return; }
    let iptal = false;
    const im = new Image(); im.crossOrigin = 'anonymous';
    const bitir = (z) => { okunan[src] = z; if (!iptal) setOto(z); };
    im.onerror = () => bitir(true);
    im.onload = () => { let z = true; try { const c = document.createElement('canvas'); c.width = 4; c.height = 4; const x = c.getContext('2d'); x.drawImage(im, 0, 0, 4, 4, 0, 0, 4, 4); z = x.getImageData(1, 1, 1, 1).data[3] > 200; } catch (e) { z = true; } bitir(z); };
    im.src = src + (src.includes('?') ? '&' : '?') + 'vh-zemin=1'; /* ayrı istek: CORS'lu okuma, sayfadaki <img>'in önbellek kaydıyla çakışmasın */
    return () => { iptal = true; };
  }, [src, zemin]);
  if (!src) return null;
  const beyaz = zemin === 'beyaz' || (zemin === 'otomatik' && oto === true);
  const bekle = zemin === 'otomatik' && oto === undefined;
  const kucuk = boy === 'satir';
  let h = yukseklik ?? BOY[boy] ?? 180;
  const kapakBoy = boy === 'kapak' || boy === 'seri' || boy === 'urun' || boy === 'buyuk';
  if (mobil && yukseklik == null && (boy === 'seri' || boy === 'urun' || boy === 'buyuk')) h = 300;
  const k = kose ?? (mobil && kapakBoy ? 'var(--radius-kart)' : KOSE[boy] ?? 'var(--radius-kucuk)');
  return (
    <div style={{ position: 'relative', height: typeof h === 'number' ? h + 'px' : h, width: genislik ?? (kucuk ? '72px' : '100%'), flex: kucuk ? 'none' : undefined, boxSizing: 'border-box', borderRadius: k, background: sahneZemini ? 'var(--foto-sahne-zemin)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style }} {...rest}>
      <img src={src} alt={alt ?? ''} width={typeof h === 'number' ? Math.round(h * 4 / 3) : 400} height={typeof h === 'number' ? h : 300} decoding="async" loading={kucuk ? 'lazy' : 'eager'} style={{ width: '100%', height: '100%', maxWidth: kucuk ? '84%' : boy === 'kart' ? '80%' : '86%', maxHeight: kucuk ? '84%' : '90%', objectFit: 'contain', objectPosition: 'center', opacity: bekle ? 0 : 1, transition: 'opacity 120ms var(--hareket-egri)', mixBlendMode: beyaz ? 'multiply' : 'normal', filter: beyaz ? 'none' : kucuk ? 'var(--shadow-foto-kucuk)' : 'var(--shadow-foto)' }} />
      {children}
    </div>
  );
}
