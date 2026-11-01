/**
 * KATEGORİ ZİNCİRİ — kök → orta → yaprak kimliğinin TEK kaynağı (URN-144, karar 410).
 *
 * Kategori ağacı üç kademeye kadar derinleşebilir. Kök/orta/yaprak kimliği ürün ya da aile sütunlarından
 * (`category_id`/`subcategory_id` eşitliği) DEĞİL, `categories.parent_id` zincirinden türer: KATALOG göçünden
 * sonra sütunlar karma olabilir (bir dalda `category_id` = 1. kademe, öbüründe kök). Adres şeması bu modülün
 * konusu değildir: kategori adresi TEK segmenttir (karar 407, `kategoriSegmenti.ts`).
 *
 * SAF ve DB'siz: `ataZinciri`/`altAgacKimlikleri` haritalarla çalışır; `ataZinciriGetir` okuyucuyu çağıranın
 * verdiği fonksiyondan alır (DI). Döngü ve eksik üst kırılmaz, zincir kısalır.
 */

/** Zincirin çalıştığı en küçük satır biçimi. */
export interface ZincirDugumu {
  id: string
  parent_id: string | null
  is_active?: boolean | null
}

/** Döngü koruması: ağaç üç kademedir; bu sayı veri bozulursa sonsuz döngüyü keser. */
export const AZAMI_ZINCIR_DERINLIGI = 10

/**
 * `id`'nin ATALARI, kökten başa doğru (ilk eleman kök, son eleman doğrudan üst); kendisi DAHİL DEĞİL.
 * Üst haritada yoksa ya da döngü varsa zincir orada biter (kısalır).
 */
export function ataZinciri<T extends ZincirDugumu>(
  id: string,
  byId: ReadonlyMap<string, T>,
  azami: number = AZAMI_ZINCIR_DERINLIGI,
): T[] {
  const zincir: T[] = []
  const gorulen = new Set<string>([id])
  let simdiki = byId.get(id)?.parent_id ?? null
  while (simdiki && zincir.length < azami && !gorulen.has(simdiki)) {
    gorulen.add(simdiki)
    const ust = byId.get(simdiki)
    if (!ust) break
    zincir.push(ust)
    simdiki = ust.parent_id
  }
  return zincir.reverse()
}

/**
 * `baslangicId` kategorisinden YUKARI doğru okuyucuyla tırmanır (kendisi DAHİL) ve kökten başa sıralı döner.
 * `ataZinciri`nin okuyucu enjekte edilen eşi: haritanın elde olmadığı sunucu yolunda kullanılır. Okuyucu
 * hatası YUTULMAZ (fırlatılır). Bulunamayan satırda ya da döngüde zincir kısalır.
 */
export async function ataZinciriGetir<T extends ZincirDugumu>(
  baslangicId: string | null,
  getir: (id: string) => Promise<T | null>,
  azami: number = AZAMI_ZINCIR_DERINLIGI,
): Promise<T[]> {
  const zincir: T[] = []
  const gorulen = new Set<string>()
  let simdiki = baslangicId
  while (simdiki && zincir.length < azami && !gorulen.has(simdiki)) {
    gorulen.add(simdiki)
    const satir = await getir(simdiki)
    if (!satir) break
    zincir.push(satir)
    simdiki = satir.parent_id
  }
  return zincir.reverse()
}

/** `parent_id` → çocuk kimlikleri haritası (satır sırası korunur). */
export function cocuklarHaritasi(satirlar: Iterable<{ id: string; parent_id: string | null }>): Map<string, string[]> {
  const harita = new Map<string, string[]>()
  for (const s of satirlar) {
    if (!s.parent_id) continue
    const liste = harita.get(s.parent_id) ?? []
    liste.push(s.id)
    harita.set(s.parent_id, liste)
  }
  return harita
}

/** `id` + TÜM torunları (genişlik öncelikli; kendisi ilk). Döngüye karşı korumalı. */
export function altAgacKimlikleri(id: string, cocuklar: ReadonlyMap<string, readonly string[]>): string[] {
  const sonuc: string[] = [id]
  const gorulen = new Set<string>([id])
  for (let i = 0; i < sonuc.length; i++) {
    for (const cocuk of cocuklar.get(sonuc[i]) ?? []) {
      if (gorulen.has(cocuk)) continue
      gorulen.add(cocuk)
      sonuc.push(cocuk)
    }
  }
  return sonuc
}

/**
 * Aile/model sayfası kırıntısının kategori zinciri (kökten yaprağa, yaprak DAHİL). Yaprak = en derin satır
 * (alt kategori varsa o, yoksa ana); ailenin kendi `ana`/`alt` satırları elde olduğu için okuyucu yalnız EKSİK
 * halkalar (karma sütunda kök/orta) için çağrılır — iki kademede ek okuma YOKTUR. Ailenin kendi satırları
 * (ana/alt) bugünkü gibi her durumda kalır; ARADAN okunan PASİF ata atlanır (sayfası aktif atasına yönlenir).
 * Okuyucu hatası FIRLATILIR: sessizce kısalan kırıntı önbelleğe yazılmasın.
 */
export async function aileKategoriZinciri<T extends ZincirDugumu, U extends ZincirDugumu>(
  ana: T | null,
  alt: T | null,
  getir: (id: string) => Promise<U | null>,
): Promise<(T | U)[]> {
  const yaprak = alt ?? ana
  if (!yaprak) return []
  const bilinen = new Map<string, T | U>()
  for (const k of [ana, alt]) if (k) bilinen.set(k.id, k)
  const satirlar = await ataZinciriGetir<T | U>(yaprak.id, async (id) => bilinen.get(id) ?? (await getir(id)))
  return satirlar.filter((k) => bilinen.has(k.id) || k.is_active === true)
}

/**
 * `id`'nin YUKARISINDAKİ ilk AKTİF ata (`is_active === true`); yoksa null. Pasif kategori sayfasının hedefi
 * (karar O4) ve eşleyicinin tırmanışıyla aynı hüküm: pasif ara kademeler atlanır, tırmanış kökte biter.
 */
export function ilkAktifAta<T extends ZincirDugumu>(
  id: string,
  byId: ReadonlyMap<string, T>,
  azami: number = AZAMI_ZINCIR_DERINLIGI,
): T | null {
  const yakindan = ataZinciri(id, byId, azami).reverse()
  return yakindan.find((a) => a.is_active === true) ?? null
}

/** `ilkAktifAta`nın okuyucu enjekte edilen eşi; `ustId` pasif kategorinin `parent_id`'sidir. */
export async function ilkAktifAtaGetir<T extends ZincirDugumu>(
  ustId: string | null,
  getir: (id: string) => Promise<T | null>,
  azami: number = AZAMI_ZINCIR_DERINLIGI,
): Promise<T | null> {
  const gorulen = new Set<string>()
  let simdiki = ustId
  for (let adim = 0; simdiki && adim < azami && !gorulen.has(simdiki); adim++) {
    gorulen.add(simdiki)
    const satir = await getir(simdiki)
    if (!satir) return null
    if (satir.is_active === true) return satir
    simdiki = satir.parent_id
  }
  return null
}
