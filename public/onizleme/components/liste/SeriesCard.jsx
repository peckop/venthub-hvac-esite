import React from 'react';
import { CategoryCard } from './CategoryCard.jsx';

/* SeriesCard — seri kartı (iş emri #14 D, Recep 10-25): CategoryCard kalıbı birebir — fotoğraf · "marka + kısa seri adı →" · "n model"; kartın tamamı basılır.
 * İkinci kopya değil: görünümü CategoryCard çizer, bu parça yalnız seri verisini ona çevirir (§1.1). Marka satırı ve "Aç →" düğmesi yok.
 * Kaynak: paket-B/Kombin Urun Turu.dc.html "Seriler". Kullanıldığı yerler: uygulama alanı bölümleri (UygulamaBolumu), ana sayfa "Uygulama alanlarından"; ürün türü şablonu CategoryCard'ı doğrudan çağırır (aynı görünüm). */
export function SeriesCard({ seri, onAc, href, mobil = false, metin, dil = 'TR', yerel, fotoYukseklik, style }) {
  if (!seri) return null;
  const ad = [seri.marka, seri.kisaAd || seri.ad].filter(Boolean).join(' ');
  return <CategoryCard kategori={{ slug: seri.slug, ad, foto: seri.foto, modelSayisi: seri.modelSayisi }} onAc={onAc} href={href} fotoYukseklik={fotoYukseklik} mobil={mobil} metin={metin} yerel={yerel || (String(dil).toUpperCase() === 'EN' ? 'en-GB' : 'tr-TR')} style={style} />;
}
