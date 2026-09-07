/**
 * ORTAK VERI ERISIMI (JS) — 1000 satir tavanina karsi sayfalama + veri-tamligi kapisi.
 *
 * `_veri.py`'nin JS esdegeri. NICIN AYRI DEGIL ORTAK: ayni kapi her betikte KOPYA dursa,
 * biri duzeltilip oteki unutulur (2026-09-06'da tam bu oldu — fiyatsiz-ayrim.py kendi
 * kopyasini tasiyordu ve `select=*` duzeltmesi ona girmemisti).
 *
 * ⭐OLCULDU (2026-09-06/07, filo notu `icerik-hatti-1000-satir-tavani-filo-notu-2026-09-06.md`):
 *  1. PostgREST tek cagrida en cok 1000 satir doner (Supabase `max_rows` AYARI; varsayilan 1000,
 *     Dashboard/Management API ile degisir). `limit=2000` ISE YARAMAZ — 2000 istendi, 1000 geldi.
 *  2. Kesin sayi alinamazsa denetimi ATLAMAK fail-open'dir: kapi tam gerektigi anda kapanir.
 *  3. Dongu tavani yoksa sayfalama bozulunca (offset ilerlemezse) SONSUZ dongu.
 *  4. SIRASIZ sayfalama satir atlar/tekrarlar ve toplam sayi YINE tutar -> `order=` sart.
 *  5. Sayi AYNI FILTREYLE alinmali; tablo toplami ile filtreli cekim karsilastirilirsa kapi
 *     daima kirmizi (ya da filtre unutulursa daima yesil) olur.
 *  6. `Number.isInteger` sart: PostgREST `*` donerse `parseInt('*')` = NaN, `typeof NaN === 'number'`
 *     GECER ve tavan NaN olur -> sonsuz dongu (workflow curutmesi buldu).
 *
 * SINAV: `SAYFA_BOYU=100` ile ≤1000 satirlik tabloda da sayfalama yolu KOSAR. Tablo tek sayfaya
 * sigiyorsa "offset ilerlemesin" sabotaji BOS SINAVDIR — sayfa boyunu kucult.
 */

/** `yol` = "products?select=id&brand=eq.SEAT" gibi TAM sorgu (tablo + filtre). */
function sorguEkle(yol, ek) {
  return yol + (yol.includes('?') ? '&' : '?') + ek
}

/** Sunucunun bildirdigi KESIN satir sayisi — AYNI filtreyle. Alinamazsa KIRMIZI. */
export async function kesinSayi(dbUrl, basliklar, yol) {
  const sorgu = yol.includes('?') ? yol : `${yol}?select=*`
  const cevap = await fetch(`${dbUrl}/rest/v1/${sorguEkle(sorgu, 'limit=1')}`, {
    headers: { ...basliklar, Prefer: 'count=exact' },
  })
  if (!cevap.ok) {
    throw new Error(`OLCUM GUVENILIR DEGIL: ${yol} sayim istegi HTTP ${cevap.status}`)
  }
  const aralik = cevap.headers.get('content-range') || ''
  const son = aralik.split('/').pop() || ''
  if (!/^\d+$/.test(son)) {
    throw new Error(
      `OLCUM GUVENILIR DEGIL: ${yol} icin kesin sayi alinamadi (Content-Range: ${JSON.stringify(aralik)}). ` +
      'Cikti uretilmedi.')
  }
  const n = Number(son)
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`OLCUM GUVENILIR DEGIL: ${yol} kesin sayi tamsayi degil (${son})`)
  }
  return n
}

/**
 * Sayfalar VE sayfalamanin dogru calistigini OLCER. Ikisi ayri sey.
 * Doner: satir dizisi. Herhangi bir tutarsizlikta THROW eder (cagiran cikis 1 vermeli).
 */
export async function tumSatirlar(dbUrl, basliklar, yol, secenek = {}) {
  const sira = secenek.sira || 'id'
  const boy = Number(secenek.boy || process.env.SAYFA_BOYU || 1000)
  if (!Number.isInteger(boy) || boy < 1 || boy > 1000) {
    throw new Error(`SAYFA_BOYU gecersiz: ${boy} (1..1000)`)
  }
  const sirali = /(^|[?&])order=/.test(yol) ? yol : sorguEkle(yol, `order=${sira}`)
  const kesin = await kesinSayi(dbUrl, basliklar, sirali)
  const turTavani = Math.floor(kesin / boy) + 2
  let top = []
  let bas = 0
  let tur = 0
  for (;;) {
    tur += 1
    if (tur > turTavani) {
      throw new Error(`DONGU TAVANI asildi: ${yol} — ${tur} tur, beklenen en cok ${turTavani}. ` +
        'Sayfalama bozuk; cikti uretilmedi.')
    }
    const cevap = await fetch(`${dbUrl}/rest/v1/${sorguEkle(sirali, `offset=${bas}&limit=${boy}`)}`,
      { headers: basliklar })
    if (!cevap.ok) throw new Error(`DB okuma hatasi ${cevap.status} (${yol})`)
    const parca = await cevap.json()
    if (!Array.isArray(parca)) {
      throw new Error(`BEKLENMEYEN CEVAP: ${yol} — liste degil: ${JSON.stringify(parca).slice(0, 120)}`)
    }
    if (parca.length === 0) break
    top = top.concat(parca)
    if (parca.length < boy) break
    bas += boy
  }
  if (top.length !== kesin) {
    throw new Error(`EKSIK VERI: ${yol} — cekilen ${top.length}, sunucu ${kesin}. ` +
      'Olcum GECERSIZ; cikti uretilmedi.')
  }
  return top
}
