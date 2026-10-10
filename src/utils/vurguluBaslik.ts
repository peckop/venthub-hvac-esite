/**
 * Vurgulu başlık parçalayıcı (URN-101, 2026-10-10).
 *
 * NİÇİN VAR: kategori sayfasındaki "Katalogda Neler Var?" başlığı eskiden başlığı `'VentHub'` kelimesinden
 * bölüp markayı italik bir span'a koyuyordu (marka adıyla dizge bölme). Sözlük metni "Neden VentHub?"
 * iken çalıştı; metin marka adını içermeyen "Katalogda Neler Var?" olunca bölme işe yaramadı ve marka adı
 * her zaman başlığın ucuna yapıştı: canlıda "Katalogda Neler Var?VentHub" (EN: "What the Catalogue
 * OffersVentHub"). Kusur sözlük değiştiğinde çıktı, bileşende önceden vardı.
 *
 * SÖZLEŞME: marka adı başlıkta geçiyorsa (ilk geçiş) `once` + `vurgulu` + `sonra` birleşimi başlığın AYNISIDIR;
 * geçmiyorsa başlık düz tek parça döner (`vurgulu: null`). Marka adı başlığa ASLA eklenmez: ekran metni
 * her durumda sözlük metnine eşittir (bekçi: `vurguluBaslik.test.ts`).
 */
export interface VurguluBaslik {
  /** Marka adından önceki metin (marka geçmiyorsa başlığın tamamı). */
  once: string
  /** Marka adının kendisi (vurgulanacak parça); başlıkta geçmiyorsa null. */
  vurgulu: string | null
  /** Marka adından sonraki metin; marka geçmiyorsa boş dize. */
  sonra: string
}

export function vurguluBaslikParcalari(baslik: string, marka: string): VurguluBaslik {
  if (!marka) return { once: baslik, vurgulu: null, sonra: '' }
  const i = baslik.indexOf(marka)
  if (i < 0) return { once: baslik, vurgulu: null, sonra: '' }
  return { once: baslik.slice(0, i), vurgulu: marka, sonra: baslik.slice(i + marka.length) }
}
