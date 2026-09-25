/**
 * REHBER YAZISI MARKDOWN'I — izin listeli alt küme ayrıştırıcısı (rehber-yazisi-standard.md R6).
 *
 * NİÇİN KENDİ AYRIŞTIRICIMIZ: cetvel "gövde markdown; sunucuda, izin listeli etiketlerle render"
 * diyor. Depoda markdown ayrıştırıcı bağımlılığı yok ve bu PR `package.json`'a dokunamaz; yazının
 * kullandığı biçim de dar (başlık, paragraf, liste, tablo, kalın/eğik, bağlantı). Ayrıştırıcı HTML
 * ÜRETMEZ, düz bir ağaç üretir; ağacı React basar — yani ham HTML'in sayfaya geçmesinin YOLU YOK
 * (`<script>` yazılsa bile metin olarak kaçışlanır). İleride tam bir ayrıştırıcı gerekirse
 * bağımlılık kararı `bagimlilik-kararlari.md`'ye satır olarak girer.
 *
 * DESTEKLENMEYEN BİÇİM SESSİZCE GEÇMEZ: `####`, görsel, kod bloğu, ham HTML satırı ya da izin
 * listesi dışındaki bağlantı ATAR. Yazı derlemede kırmızı yanar; müşteri yarım biçimli sayfa görmez.
 *
 * İZİNLİ BAĞLANTILAR (BLOG kapısı `icBaglantiDenetle` ile aynı biçim, scripts/rehber/rehber-denetim.mjs):
 *   · site içi → `vh:<tür>/<anahtar>` (tür ∈ KIMLIK_TURLERI), düz site adresi YASAK
 *   · dış kaynak → `https://…` (venthub.com.tr değil) · sayfa içi → `#çapa` · `mailto:` · `tel:`
 */

export const KIMLIK_TURLERI = ['model', 'aile', 'kategori', 'marka', 'hesaplayici', 'sayfa'] as const
export type KimlikTuru = (typeof KIMLIK_TURLERI)[number]

/** BLOG kapısıyla birebir: `^vh:([a-z]+)\/([A-Za-z0-9][A-Za-z0-9._-]*)$` */
export const KIMLIK_DESENI = /^vh:([a-z]+)\/([A-Za-z0-9][A-Za-z0-9._-]*)$/
const SITE = /^https?:\/\/(?:www\.)?venthub\.com\.tr(?:[/?#]|$)/i

export type Satirici =
  | { tur: 'metin'; metin: string }
  | { tur: 'kalin'; icerik: Satirici[] }
  | { tur: 'egik'; icerik: Satirici[] }
  | { tur: 'kod'; metin: string }
  | { tur: 'baglanti'; hedef: string; icerik: Satirici[] }

export type Blok =
  | { tur: 'baslik'; duzey: 2 | 3; metin: string; id: string; icerik: Satirici[] }
  | { tur: 'paragraf'; icerik: Satirici[] }
  | { tur: 'liste'; sirali: boolean; maddeler: Satirici[][] }
  | { tur: 'tablo'; basliklar: Satirici[][]; satirlar: Satirici[][][] }
  | { tur: 'alinti'; icerik: Satirici[] }

export interface AyrismisYazi {
  /** Tek H1'in düz metni. */
  h1: string
  bloklar: Blok[]
}

export class MarkdownHatasi extends Error {
  constructor(mesaj: string) {
    super(`[rehber markdown] ${mesaj}`)
    this.name = 'MarkdownHatasi'
  }
}

/** Başlık çapası: Türkçe harfler sadeleştirilir, yalnız [a-z0-9-] kalır. */
export function capaUret(metin: string): string {
  const harita: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' }
  const sade = metin
    .toLocaleLowerCase('tr')
    .replace(/[çğıöşüâîû]/g, (h) => harita[h] ?? h)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return sade || 'bolum'
}

/** Bir bağlantı hedefini izin listesine karşı denetler; geçersizse ATAR. */
export function hedefDenetle(hedef: string): void {
  if (/^vh:/i.test(hedef)) {
    const k = hedef.match(KIMLIK_DESENI)
    if (!k || !(KIMLIK_TURLERI as readonly string[]).includes(k[1])) {
      throw new MarkdownHatasi(`bozuk iç bağlantı kimliği: "${hedef}" (beklenen vh:<${KIMLIK_TURLERI.join('|')}>/<anahtar>)`)
    }
    return
  }
  if (SITE.test(hedef)) {
    throw new MarkdownHatasi(`düz site adresi: "${hedef}" — site içi bağlantı kimlikle yazılır: [metin](vh:<tür>/<anahtar>)`)
  }
  if (/^https?:\/\//i.test(hedef) || /^#[^\s]+$/.test(hedef) || /^(mailto|tel):/i.test(hedef)) return
  throw new MarkdownHatasi(`izin listesi dışındaki bağlantı: "${hedef}" — site içi bağlantı kimlikle yazılır: [metin](vh:<tür>/<anahtar>)`)
}

/** Satır içi biçim: `**kalın**`, `*eğik*`, `` `kod` ``, `[metin](hedef)`. */
export function satiriciAyristir(kaynak: string): Satirici[] {
  const cikti: Satirici[] = []
  let tampon = ''
  const bosalt = () => {
    if (tampon) cikti.push({ tur: 'metin', metin: tampon })
    tampon = ''
  }
  let i = 0
  while (i < kaynak.length) {
    const kalan = kaynak.slice(i)
    if (kalan.startsWith('![')) throw new MarkdownHatasi(`görsel sözdizimi desteklenmiyor: "${kalan.slice(0, 40)}"`)
    if (kalan.startsWith('**')) {
      const son = kaynak.indexOf('**', i + 2)
      if (son > i + 2) {
        bosalt()
        cikti.push({ tur: 'kalin', icerik: satiriciAyristir(kaynak.slice(i + 2, son)) })
        i = son + 2
        continue
      }
    }
    if (kalan[0] === '*' && kalan[1] !== ' ') {
      const son = kaynak.indexOf('*', i + 1)
      if (son > i + 1) {
        bosalt()
        cikti.push({ tur: 'egik', icerik: satiriciAyristir(kaynak.slice(i + 1, son)) })
        i = son + 1
        continue
      }
    }
    if (kalan[0] === '`') {
      const son = kaynak.indexOf('`', i + 1)
      if (son > i + 1) {
        bosalt()
        cikti.push({ tur: 'kod', metin: kaynak.slice(i + 1, son) })
        i = son + 1
        continue
      }
    }
    if (kalan[0] === '[') {
      const m = kalan.match(/^\[([^\]]+)\]\(\s*([^)\s]+)\s*\)/)
      if (m) {
        hedefDenetle(m[2])
        bosalt()
        cikti.push({ tur: 'baglanti', hedef: m[2], icerik: satiriciAyristir(m[1]) })
        i += m[0].length
        continue
      }
    }
    tampon += kalan[0]
    i += 1
  }
  bosalt()
  return cikti
}

/** Satır içi ağacın düz metni (çapa, içindekiler, JSON-LD başlığı için). */
export function duzMetin(icerik: Satirici[]): string {
  return icerik
    .map((s) => (s.tur === 'metin' || s.tur === 'kod' ? s.metin : duzMetin(s.icerik)))
    .join('')
}

const tabloHucreleri = (satir: string) =>
  satir
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((h) => h.trim())

/** Gövdeyi ayrıştırır. Tek H1 ilk blok olmak zorunda; desteklenmeyen biçim ATAR. */
export function markdownAyristir(kaynak: string): AyrismisYazi {
  const satirlar = kaynak.replace(/\r\n?/g, '\n').split('\n')
  const bloklar: Blok[] = []
  const h1ler: string[] = []
  const kullanilanCapalar = new Map<string, number>()
  let i = 0

  const paragrafBitti = (s: string) =>
    s.trim() === '' || /^(#{1,6}\s|[-*]\s|\d+\.\s|\||>|```|<)/.test(s.trimStart())

  while (i < satirlar.length) {
    const satir = satirlar[i]
    const kirpik = satir.trim()
    if (kirpik === '') {
      i++
      continue
    }
    if (kirpik.startsWith('```')) throw new MarkdownHatasi('kod bloğu desteklenmiyor')
    if (kirpik.startsWith('<')) throw new MarkdownHatasi(`ham HTML satırı desteklenmiyor: "${kirpik.slice(0, 40)}"`)

    const baslik = kirpik.match(/^(#{1,6})\s+(.+)$/)
    if (baslik) {
      const duzey = baslik[1].length
      if (duzey === 1) {
        if (bloklar.length > 0 || h1ler.length > 0) throw new MarkdownHatasi('H1 yalnız bir kez ve en başta yazılır')
        h1ler.push(duzMetin(satiriciAyristir(baslik[2])))
      } else if (duzey === 2 || duzey === 3) {
        const icerik = satiriciAyristir(baslik[2])
        const metin = duzMetin(icerik)
        const temel = capaUret(metin)
        const kez = (kullanilanCapalar.get(temel) ?? 0) + 1
        kullanilanCapalar.set(temel, kez)
        bloklar.push({ tur: 'baslik', duzey, metin, id: kez === 1 ? temel : `${temel}-${kez}`, icerik })
      } else {
        throw new MarkdownHatasi(`H${duzey} desteklenmiyor (yalnız H1–H3): "${kirpik}"`)
      }
      i++
      continue
    }

    if (/^[-*]\s+/.test(kirpik) || /^\d+\.\s+/.test(kirpik)) {
      const sirali = /^\d+\.\s+/.test(kirpik)
      const desen = sirali ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/
      const maddeler: Satirici[][] = []
      while (i < satirlar.length && desen.test(satirlar[i].trim())) {
        maddeler.push(satiriciAyristir((satirlar[i].trim().match(desen) as RegExpMatchArray)[1]))
        i++
      }
      bloklar.push({ tur: 'liste', sirali, maddeler })
      continue
    }

    if (kirpik.startsWith('|')) {
      const tabloSatirlari: string[] = []
      while (i < satirlar.length && satirlar[i].trim().startsWith('|')) {
        tabloSatirlari.push(satirlar[i])
        i++
      }
      if (tabloSatirlari.length < 2 || !/^\|?\s*:?-{3,}/.test(tabloSatirlari[1].trim())) {
        throw new MarkdownHatasi('tablo başlık satırı ve ayraç satırı (| --- |) ister')
      }
      const basliklar = tabloHucreleri(tabloSatirlari[0]).map(satiriciAyristir)
      const govde = tabloSatirlari.slice(2).map((s) => {
        const hucreler = tabloHucreleri(s)
        if (hucreler.length !== basliklar.length) {
          throw new MarkdownHatasi(`tablo satırının hücre sayısı başlıkla aynı değil: "${s.trim()}"`)
        }
        return hucreler.map(satiriciAyristir)
      })
      bloklar.push({ tur: 'tablo', basliklar, satirlar: govde })
      continue
    }

    if (kirpik.startsWith('>')) {
      const parcalar: string[] = []
      while (i < satirlar.length && satirlar[i].trim().startsWith('>')) {
        parcalar.push(satirlar[i].trim().replace(/^>\s?/, ''))
        i++
      }
      bloklar.push({ tur: 'alinti', icerik: satiriciAyristir(parcalar.join(' ')) })
      continue
    }

    const parcalar: string[] = [kirpik]
    i++
    while (i < satirlar.length && !paragrafBitti(satirlar[i])) {
      parcalar.push(satirlar[i].trim())
      i++
    }
    bloklar.push({ tur: 'paragraf', icerik: satiriciAyristir(parcalar.join(' ')) })
  }

  if (h1ler.length !== 1) throw new MarkdownHatasi(`tek H1 gerekir, ${h1ler.length} bulundu`)
  return { h1: h1ler[0], bloklar }
}

/** Ağaçtaki bütün bağlantı hedefleri (sırayla, tekrarsız). */
export function baglantilariTopla(yazi: AyrismisYazi): string[] {
  const hedefler = new Set<string>()
  const gez = (icerik: Satirici[]) => {
    for (const s of icerik) {
      if (s.tur === 'baglanti') hedefler.add(s.hedef)
      if (s.tur === 'kalin' || s.tur === 'egik' || s.tur === 'baglanti') gez(s.icerik)
    }
  }
  for (const b of yazi.bloklar) {
    if (b.tur === 'baslik' || b.tur === 'paragraf' || b.tur === 'alinti') gez(b.icerik)
    else if (b.tur === 'liste') b.maddeler.forEach(gez)
    else if (b.tur === 'tablo') {
      b.basliklar.forEach(gez)
      b.satirlar.forEach((s) => s.forEach(gez))
    }
  }
  return [...hedefler]
}

/** İçindekilere GİRMEYEN bölümler (R3: "Kaynaklar" ve "Teknik sorumluluk notu" hariç). */
export const ICINDEKILER_DISI = new Set(['kaynaklar', 'teknik-sorumluluk-notu', 'sources', 'references', 'technical-disclaimer'])

export interface IcindekilerOgesi {
  id: string
  metin: string
}

export function icindekiler(yazi: AyrismisYazi): IcindekilerOgesi[] {
  return yazi.bloklar
    .filter((b): b is Extract<Blok, { tur: 'baslik' }> => b.tur === 'baslik' && b.duzey === 2)
    .filter((b) => !ICINDEKILER_DISI.has(capaUret(b.metin)))
    .map((b) => ({ id: b.id, metin: b.metin }))
}

/** Okuma süresi: kelime ÷ 200, yukarı yuvarlanmış dakika, en az 1 (R3 künye satırı). */
export function okumaSuresiDakika(kaynak: string): number {
  const kelime = kaynak
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*|`>[\]-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.ceil(kelime / 200))
}
