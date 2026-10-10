/**
 * Harita çalıştırıcısının SAF fonksiyonları (ALT-37a). Ağ, dosya ve ortam değişkeni YOK; bu yüzden
 * testten içe aktarılabilir (çalıştırıcı kendisi içe aktarıldığında kendiliğinden koşardı).
 */

/** Çıktıda bulunmaması gerekenler: anahtar değeri ayrıca denetlenir; bunlar desen denetimidir. */
const YASAK_DESENLER: ReadonlyArray<{ ad: string; desen: RegExp }> = [
  { ad: 'JWT biçimli dizi', desen: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\./ },
  { ad: 'e-posta biçimi', desen: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { ad: 'service_role ifadesi', desen: /service_role/i },
]

/** Çıktı metninde yasak içerik var mı. Anahtar kısaysa (kuru çalışma / doğrulama) anahtar denetimi atlanır. */
export function sizintiBul(metin: string, anahtar: string): string[] {
  const bulunan: string[] = []
  if (anahtar.length >= 20 && metin.includes(anahtar)) bulunan.push('service-role anahtar değeri')
  for (const { ad, desen } of YASAK_DESENLER) if (desen.test(metin)) bulunan.push(ad)
  return bulunan
}

/**
 * Yazılmış harita dosyasının biçimi ve içeriği. Sır GEREKTİRMEZ (iş akışında ikinci, sırsız adım):
 * üretimden bağımsız olarak dosyanın boş/yarım olmadığını ve yasak içerik taşımadığını doğrular.
 */
export function haritaDogrula(metin: string): string[] {
  const sorunlar: string[] = []
  let dosya: unknown
  try {
    dosya = JSON.parse(metin)
  } catch {
    return ['JSON değil']
  }
  const kiracilar = (dosya as { kiracilar?: Record<string, { urunSayisi?: unknown }> } | null)?.kiracilar
  if ((dosya as { surum?: unknown } | null)?.surum !== 1) sorunlar.push('surum 1 değil')
  if (!kiracilar || Object.keys(kiracilar).length === 0) sorunlar.push('kiracı yok')
  else if (!Object.values(kiracilar).every((k) => typeof k?.urunSayisi === 'number' && k.urunSayisi > 0)) {
    sorunlar.push('ürün sayısı 0 ya da yok')
  }
  for (const s of sizintiBul(metin, '')) sorunlar.push(`yasak içerik: ${s}`)
  return sorunlar
}
