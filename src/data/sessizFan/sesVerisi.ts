// Lineo Quiet ses ve eğri verisi: tipler, doğrulayıcı ve okuyucular (URN-135, U1).
// Neden: ses/eğri/SSS verisi DB'ye yazılmaz, depoda sürümlü dosyada durur (OPS kararı 10-16);
// bu modül dosyayı tip güvenli okur ve "bu kod için veri var mı" sorusunu cevaplar.
// Kaynak: Vortice LINEO kataloğu, Mayıs 2026; veri lineoQuiet.veri.json (Design İçerik 2026-10-15).
// Kural: koşulsuz tek ses sayısı yazılmaz; ham sayı yalnız `sesEtiketi` ile basılır (aşağıda).
// Saf veri modülüdür: servis değil (DI kuralı dışı), UI ve sözlük içermez.

import ham from './lineoQuiet.veri.json'

/** Ses basıncının ölçüldüğü/hesaplandığı yer. */
export type SesYeri = 'emis' | 'ufleme' | 'govde'

/** Ses değerinin ZORUNLU koşulu: 3 m, serbest alan; yer ve kademe adı. */
export type SesKosulu = Readonly<{ mesafeM: 3; yer: SesYeri; kademe: string }>

/** Koşullu ses basıncı (dB(A)). Koşul alanı zorunludur; koşulsuz değer kurulamaz. */
export type SesDegeri = Readonly<{ dbA: number; kosul: SesKosulu }>

/** Çağıranın sözlükten verdiği sözcükler (bu modül sözlük dosyasına dokunmaz). */
export type SesEtiketSozlugu = {
  yer: Record<SesYeri, string>
  metre: string
  kademe: Record<string, string>
}

export type KontrolTuru = 'kademeli' | 'ec'

export type KademeSesSatiri = Readonly<{
  kademe: string
  emisLp: SesDegeri
  uflemeLp: SesDegeri
  govdeLp: SesDegeri
}>

export type SeriOzeti = Readonly<{
  enDusukGovde: SesDegeri
  enYuksekGovde: SesDegeri
  enDusukEmis: SesDegeri
  enYuksekEmis: SesDegeri
}>

/** [Q m³/h, P Pa] ya da [Q m³/h, W] çifti. */
export type EgriNoktasi = readonly [number, number]

export type EgriKademesi = Readonly<{
  kademe: string
  pq: readonly EgriNoktasi[]
  pw: readonly EgriNoktasi[]
}>

type SesGrubu = Readonly<{
  emis: readonly number[]
  ufleme: readonly number[]
  govde: readonly number[]
}>

export type ModelVerisi = Readonly<{
  ad: string
  lpEmis: readonly number[]
  kademeler: readonly string[]
  lw: SesGrubu
  lp: SesGrubu
  egri: readonly Readonly<{ pq: readonly EgriNoktasi[]; pw: readonly EgriNoktasi[] }>[]
  kontrol: KontrolTuru
  kalite: string
}>

const MESAFE_M = 3 as const

function kayitMi(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function sayiDizisi(v: unknown): readonly number[] | null {
  if (!Array.isArray(v) || v.length === 0) return null
  const cikti: number[] = []
  for (const x of v) {
    if (typeof x !== 'number' || !Number.isFinite(x)) return null
    cikti.push(x)
  }
  return cikti
}

function metinDizisi(v: unknown): readonly string[] | null {
  if (!Array.isArray(v) || v.length === 0) return null
  const cikti: string[] = []
  for (const x of v) {
    if (typeof x !== 'string' || x === '') return null
    cikti.push(x)
  }
  return cikti
}

function ciftDizisi(v: unknown): readonly EgriNoktasi[] | null {
  if (!Array.isArray(v) || v.length < 2) return null
  const cikti: EgriNoktasi[] = []
  for (const c of v) {
    if (!Array.isArray(c) || c.length !== 2) return null
    const [a, b] = c
    if (typeof a !== 'number' || typeof b !== 'number') return null
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null
    cikti.push([a, b])
  }
  return cikti
}

function sesGrubu(v: unknown, n: number): SesGrubu | null {
  if (!kayitMi(v)) return null
  const emis = sayiDizisi(v.emis)
  const ufleme = sayiDizisi(v.ufleme)
  const govde = sayiDizisi(v.govde)
  if (!emis || !ufleme || !govde) return null
  if (emis.length !== n || ufleme.length !== n || govde.length !== n) return null
  return { emis, ufleme, govde }
}

function egriKademeleri(v: unknown, n: number): ModelVerisi['egri'] | null {
  if (!Array.isArray(v) || v.length !== n) return null
  const cikti: { pq: readonly EgriNoktasi[]; pw: readonly EgriNoktasi[] }[] = []
  for (const k of v) {
    if (!kayitMi(k)) return null
    const pq = ciftDizisi(k.pq)
    const pw = ciftDizisi(k.pw)
    if (!pq || !pw) return null
    cikti.push({ pq, pw })
  }
  return cikti
}

function modelDogrula(d: unknown, s: unknown, e: unknown, kontrol: unknown, kalite: unknown): ModelVerisi | null {
  if (!kayitMi(d) || !kayitMi(s)) return null
  if (typeof d.ad !== 'string' || d.ad === '') return null
  const lpEmis = sayiDizisi(d.lp)
  const kademeler = metinDizisi(s.kademe)
  if (!lpEmis || !kademeler) return null
  const n = kademeler.length
  if (lpEmis.length !== n) return null
  const lw = sesGrubu(s.lw, n)
  const lp = sesGrubu(s.lp, n)
  const egri = egriKademeleri(e, n)
  if (!lw || !lp || !egri) return null
  if (kontrol !== 'kademeli' && kontrol !== 'ec') return null
  if (typeof kalite !== 'string' || kalite === '') return null
  return { ad: d.ad, lpEmis, kademeler, lw, lp, egri, kontrol, kalite }
}

/**
 * Ham JSON'u kod başına doğrular. Bozuk ya da eksik kod sessizce düşer (fail-closed):
 * düşen kod için `veriVarMi` false olur, istisna fırlatılmaz.
 */
export function modelleriDogrula(girdi: unknown): ReadonlyMap<string, ModelVerisi> {
  const harita = new Map<string, ModelVerisi>()
  if (!kayitMi(girdi) || !kayitMi(girdi.D)) return harita
  const { D, ses, egri, kontrol, kalite } = girdi
  if (!kayitMi(ses) || !kayitMi(egri) || !kayitMi(kontrol) || !kayitMi(kalite)) return harita
  for (const kod of Object.keys(D)) {
    const model = modelDogrula(D[kod], ses[kod], egri[kod], kontrol[kod], kalite[kod])
    if (model) harita.set(kod, model)
  }
  return harita
}

const MODELLER = modelleriDogrula(ham)

/** Tek kurucu: SesDegeri yalnız burada kurulur (koşul her zaman 3 m ile birlikte). */
function degerKur(dbA: number, yer: SesYeri, kademe: string): SesDegeri {
  return { dbA, kosul: { mesafeM: MESAFE_M, yer, kademe } }
}

function lpDegeri(m: ModelVerisi, yer: SesYeri, i: number): SesDegeri | null {
  const v = m.lp[yer][i]
  const kademe = m.kademeler[i]
  if (v === undefined || kademe === undefined) return null
  return degerKur(v, yer, kademe)
}

function sayiMetni(n: number, lang: 'tr' | 'en'): string {
  const metin = String(n)
  return lang === 'tr' ? metin.replace('.', ',') : metin
}

/**
 * SES DEĞERİNİ BASAN TEK ÜRETİCİ. Hiçbir yerde `dbA` ham sayı olarak yazılmaz; çıktı daima
 * koşullu bir cümledir: TR '9,9 dB(A) · 4 V · gövde, 3 m', EN '9.9 dB(A) · 4 V · casing, 3 m'.
 * Yer ve kademe sözcüklerini çağıran sözlükten verir; kademe sözlükte yoksa veri adı aynen yazılır.
 * Geçersiz değer (sonlu olmayan sayı) boş metin döner: çağıran boş kutuyu ÇİZMEZ.
 */
export function sesEtiketi(d: SesDegeri, lang: 'tr' | 'en', etiket: SesEtiketSozlugu): string {
  if (!Number.isFinite(d.dbA)) return ''
  const kademe = Object.prototype.hasOwnProperty.call(etiket.kademe, d.kosul.kademe)
    ? etiket.kademe[d.kosul.kademe]
    : d.kosul.kademe
  return `${sayiMetni(d.dbA, lang)} dB(A) · ${kademe} · ${etiket.yer[d.kosul.yer]}, ${d.kosul.mesafeM} ${etiket.metre}`
}

/** Bu kod için veri modülünde geçerli bir kayıt var mı. */
export function veriVarMi(kod: string): boolean {
  return MODELLER.has(kod)
}

export function modelAdi(kod: string): string | null {
  return MODELLER.get(kod)?.ad ?? null
}

export function kontrolTuru(kod: string): KontrolTuru | null {
  return MODELLER.get(kod)?.kontrol ?? null
}

/** Artan hız sırasıyla kademe adları (AC: en düşük/orta/en yüksek; ES: 4/6/8/10 V). */
export function kademeAdlari(kod: string): readonly string[] | null {
  return MODELLER.get(kod)?.kademeler ?? null
}

/** Eğri vektör grafikten okunduysa (kalite B) 'grafikten okunmuştur' etiketi ZORUNLUDUR. */
export function EGRI_GRAFIKTEN_OKUNDU(kod: string): boolean {
  return MODELLER.get(kod)?.kalite === 'B'
}

/** Kademe başına basınç-debi (pq) ve güç-debi (pw) noktaları. */
export function egriNoktalari(kod: string): readonly EgriKademesi[] | null {
  const m = MODELLER.get(kod)
  if (!m) return null
  const cikti: EgriKademesi[] = []
  for (const [i, k] of m.egri.entries()) {
    const kademe = m.kademeler[i]
    if (kademe === undefined) return null
    cikti.push({ kademe, pq: k.pq, pw: k.pw })
  }
  return cikti
}

/** Tek ses değeri gerekiyorsa: en düşük kademede GÖVDE Lp + koşul. Veri yoksa null. */
export function enDusukKademeGovdeLp(kod: string): SesDegeri | null {
  const m = MODELLER.get(kod)
  return m ? lpDegeri(m, 'govde', 0) : null
}

/** Kademe başına emiş/üfleme/gövde Lp (3 m, serbest alan). Veri yoksa null. */
export function kademeSesTablosu(kod: string): readonly KademeSesSatiri[] | null {
  const m = MODELLER.get(kod)
  if (!m) return null
  const satirlar: KademeSesSatiri[] = []
  for (const [i, kademe] of m.kademeler.entries()) {
    const emisLp = lpDegeri(m, 'emis', i)
    const uflemeLp = lpDegeri(m, 'ufleme', i)
    const govdeLp = lpDegeri(m, 'govde', i)
    if (!emisLp || !uflemeLp || !govdeLp) return null
    satirlar.push({ kademe, emisLp, uflemeLp, govdeLp })
  }
  return satirlar
}

/**
 * Verilen kodların ses aralığı (gövde ve emiş Lp, tüm kademeler). YALNIZ verilen kodlar içinden
 * hesaplanır; verisi olmayan kod atlanır, hiç kod kalmazsa null (kesişim alma çağıranın işidir).
 */
export function seriOzeti(kodlar: readonly string[]): SeriOzeti | null {
  let enDusukGovde: SesDegeri | null = null
  let enYuksekGovde: SesDegeri | null = null
  let enDusukEmis: SesDegeri | null = null
  let enYuksekEmis: SesDegeri | null = null
  for (const kod of kodlar) {
    const m = MODELLER.get(kod)
    if (!m) continue
    for (let i = 0; i < m.kademeler.length; i += 1) {
      const govde = lpDegeri(m, 'govde', i)
      const emis = lpDegeri(m, 'emis', i)
      if (!govde || !emis) return null
      if (!enDusukGovde || govde.dbA < enDusukGovde.dbA) enDusukGovde = govde
      if (!enYuksekGovde || govde.dbA > enYuksekGovde.dbA) enYuksekGovde = govde
      if (!enDusukEmis || emis.dbA < enDusukEmis.dbA) enDusukEmis = emis
      if (!enYuksekEmis || emis.dbA > enYuksekEmis.dbA) enYuksekEmis = emis
    }
  }
  if (!enDusukGovde || !enYuksekGovde || !enDusukEmis || !enYuksekEmis) return null
  return { enDusukGovde, enYuksekGovde, enDusukEmis, enYuksekEmis }
}
