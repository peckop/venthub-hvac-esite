import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

/**
 * INV-DOC-2 · Companion KAPSAM paritesi — eksik ve bayat companion birikmesin.
 *
 * INV-DOC-1 (companion-doc-parity.test.ts) ters yönü kapatıyor: kaynağı olmayan
 * companion = ikize giden AKTİF YANLIŞ BİLGİ. Bu bekçi bu yönü kapatıyor:
 *   • C4 — kaynağı var, companion'ı YOK  → ikiz o dosyayı hiç bilmez (bilgi boşluğu)
 *   • C5 — companion var ama kaynaktan ESKİ → ikiz dosyanın eski hâlini bilir
 *
 * NİÇİN AYRI BEKÇİ VE NİÇİN ŞİMDİ MÜMKÜN:
 * Cetvelin §C3'ü bu yönü bilerek kapsam dışı bırakmıştı ve gerekçesi SAĞLAMDI:
 * companion üretimi `post-commit`te ASENKRON, dolayısıyla "her kaynağın companion'ı
 * olmalı" kuralı taze commit'lerde yanlış-kırmızı üretir. Gerekçeyi çürütmüyoruz,
 * ÖLÇTÜK (2026-08-17) ve tasarımla aşıyoruz:
 *
 *   C4 eksik companion : 36 toplam →  1 tanesi 7 günden eski
 *   C5 bayat companion : 189 toplam → 34 tanesi 7 günden eski (34'ü 30 günden de eski)
 *
 * Yani gürültünün tamamı taze pencerede. YAŞ EŞİĞİ (7 gün) asenkron üretim penceresini
 * muaf tutar; eşiğin ötesinde kalan şey artık "henüz üretilmedi" değil, GERÇEK borçtur.
 * 34 dosyanın 30 günden eski olması bunu doğruluyor — o companion'lar üretilmeyi
 * beklemiyor, unutulmuş.
 *
 * NİÇİN RATCHET (sıfır değil):
 * Mevcut borç kapatılmadan kural tam-kapalı kurulamaz; tam-kapalı kurmak bekçiyi
 * ilk günden kırmızı bırakır ve kırmızı bekçi görmezden gelinir (bu depoda yaşandı:
 * rastgele patlayan pre-commit `--no-verify` alışkanlığı doğurdu). Ratchet borcu
 * DONDURUR: yeni borç eklenemez, azalınca taban düşürülür (stale-guard bunu zorlar).
 *
 * ÖLÇÜM KAYNAĞI = GIT, disk DEĞİL.
 * INV-DOC-1'in dersi burada da geçerli: "diskten sildim/ürettim ama commit etmedim"
 * durumunda disk taraması yanlış cevap verir; ikize giden şey DEPO hâlidir. Ayrıca
 * bugün ölçüldü: 17 companion diskte güncel ama git'te eskiydi. Bu AYRIŞMA kendisi
 * bir bulgu — ama bu bekçinin sorusu değil; bu bekçi depoyu ölçer.
 *
 * KAPSAM = `.cc_docs.yaml`'ın GERÇEK kapsamı (SSOT).
 * Bekçi kendi listesini uydurmaz; yaml'ın `source_dirs` + `extra_masters` −
 * `skip_dirs` − `skip_files` kümesini uygular. Niçin kritik: ilk ölçümümde `.agent/`
 * altındaki betikleri saydım ve 84/211 çıktı — oysa `.agent` yaml'da `skip_dirs`
 * içinde, yani doküman hattı oraya hiç bakmıyor. Bekçi üreticiden FARKLI kapsam
 * kullanırsa ölçtüğü şey gerçek değildir.
 */

const YAS_ESIGI_GUN = 7

// Ölçülmüş tabanlar (2026-08-17, yaml-doğru kapsam, 606 kaynak dosya).
// Bunlar HEDEF değil TAVAN: düşürülmeli, asla yükseltilmemeli.
const C4_TABAN = 1
const C5_TABAN = 34

const KAYNAK_UZANTILARI = ['.ts', '.tsx', '.mjs', '.cjs']

function git(args: string[]): string {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

function izlenenDosyalar(): string[] {
  return git(['ls-files']).split('\n').map(s => s.trim()).filter(Boolean)
}

/**
 * Her izlenen dosyanın EN YENİ commit tarihini tek geçişte topla.
 *
 * Dosya başına `git log -1` çağırmak 600+ süreç doğurur ve testi dakikalara çıkarır
 * (ölçüldü: 2 dakikada bitmedi). `--name-only` tek geçişte aynı bilgiyi verir.
 */
function sonCommitTarihleri(): Map<string, string> {
  const ham = git(['log', '--format=@%cs', '--name-only', '--no-renames'])
  const harita = new Map<string, string>()
  let simdiki: string | null = null
  for (const satir of ham.split('\n')) {
    const s = satir.replace(/\r$/, '')
    if (s.startsWith('@')) {
      simdiki = s.slice(1)
    } else if (s.trim() && simdiki && !harita.has(s)) {
      harita.set(s, simdiki)
    }
  }
  return harita
}

interface YamlKapsam {
  koklerRecursive: string[]
  skipDirs: Set<string>
  skipBasenames: Set<string>
}

/** `.cc_docs.yaml`'ı oku — kapsamın SSOT'u orası. */
function yamlKapsamiOku(): YamlKapsam {
  const metin = git(['show', 'HEAD:.cc_docs.yaml'])
  const liste = (anahtar: string): string[] => {
    const m = new RegExp(`^${anahtar}:\\s*\\[([^\\]]*)\\]`, 'm').exec(metin)
    if (!m) return []
    return m[1].split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
  }
  const sourceDirs = liste('source_dirs')
  // extra_masters girdileri tek satırlık obje listesi: {name: "...", source_dirs: "supabase/functions", ...}
  const extraKokler = [...metin.matchAll(/source_dirs:\s*"([^"]+)"/g)].map(m => m[1])

  return {
    koklerRecursive: [...sourceDirs.filter(d => d !== '.'), ...extraKokler],
    skipDirs: new Set(liste('skip_dirs')),
    skipBasenames: new Set(liste('skip_files').map(f => f.split('/').pop() as string)),
  }
}

function kapsamdaMi(yol: string, k: YamlKapsam): boolean {
  if (!KAYNAK_UZANTILARI.some(u => yol.endsWith(u))) return false
  if (yol.endsWith('.d.ts')) return false
  const parcalar = yol.split('/')
  const ad = parcalar[parcalar.length - 1]
  if (k.skipBasenames.has(ad)) return false
  if (parcalar.slice(0, -1).some(p => k.skipDirs.has(p))) return false
  if (k.koklerRecursive.some(kok => yol.startsWith(`${kok}/`))) return true
  return !yol.includes('/') // "." kökü: yalnız o seviye, recursive DEĞİL
}

function gunFarki(tarihISO: string, bugun: Date): number {
  const t = new Date(`${tarihISO}T00:00:00Z`).getTime()
  if (Number.isNaN(t)) return Number.MAX_SAFE_INTEGER
  return Math.floor((bugun.getTime() - t) / 86_400_000)
}

interface Bulgular {
  kaynakSayisi: number
  eksik: string[]
  bayat: string[]
  eksikTaze: number
  bayatTaze: number
}

function olc(): Bulgular {
  const kapsam = yamlKapsamiOku()
  const izlenen = izlenenDosyalar()
  const tarihler = sonCommitTarihleri()
  const mdSet = new Set(izlenen.filter(f => f.endsWith('.md')))
  const bugun = new Date()

  const kaynaklar = izlenen.filter(f => kapsamdaMi(f, kapsam))
  const eksik: string[] = []
  const bayat: string[] = []
  let eksikTaze = 0
  let bayatTaze = 0

  for (const kaynak of kaynaklar) {
    const companion = `${kaynak.replace(/\.[^./]+$/, '')}.md`
    const kaynakTarih = tarihler.get(kaynak) ?? ''
    const yas = kaynakTarih ? gunFarki(kaynakTarih, bugun) : Number.MAX_SAFE_INTEGER

    if (!mdSet.has(companion)) {
      if (yas > YAS_ESIGI_GUN) eksik.push(kaynak)
      else eksikTaze++
      continue
    }
    const companionTarih = tarihler.get(companion) ?? ''
    if (kaynakTarih && companionTarih && kaynakTarih > companionTarih) {
      if (yas > YAS_ESIGI_GUN) bayat.push(companion)
      else bayatTaze++
    }
  }

  return { kaynakSayisi: kaynaklar.length, eksik, bayat, eksikTaze, bayatTaze }
}

describe('INV-DOC-2 · companion kapsam paritesi', () => {
  const b = olc()

  it('C4 — companion\'ı olmayan ESKİ kaynak sayısı tabanı aşmıyor', () => {
    expect(
      b.eksik.length,
      `Companion'ı olmayan ${YAS_ESIGI_GUN} günden eski kaynak sayısı ${b.eksik.length}, ` +
      `taban ${C4_TABAN}. Bu dosyalar ikizde HİÇ YOK, yani "o kod nasıl çalışıyor" ` +
      `sorusuna ikiz eksik cevap verir.\nDosyalar:\n  ${b.eksik.join('\n  ')}`,
    ).toBeLessThanOrEqual(C4_TABAN)
  })

  it('C5 — kaynağından ESKİ companion sayısı tabanı aşmıyor', () => {
    expect(
      b.bayat.length,
      `Kaynağından eski companion sayısı ${b.bayat.length}, taban ${C5_TABAN}. ` +
      `Bunlar ikize dosyanın ESKİ hâlini anlatır — eksik bilgiden daha yanıltıcıdır, ` +
      `çünkü ikiz emin biçimde yanlış cevap verir.\nDosyalar:\n  ${b.bayat.join('\n  ')}`,
    ).toBeLessThanOrEqual(C5_TABAN)
  })

  it('stale-guard: borç azaldıysa TABAN DÜŞÜRÜLMELİ (ratchet geri kaymasın)', () => {
    // Ratchet'in tek işi borcu dondurmak. Borç azaldığında taban güncellenmezse
    // aradaki boşluk sessiz bir bütçeye dönüşür ve yeni borç fark edilmeden dolar.
    const bosluk4 = C4_TABAN - b.eksik.length
    const bosluk5 = C5_TABAN - b.bayat.length
    expect(
      bosluk4 <= 0,
      `C4 borcu ${b.eksik.length}'e düştü (taban ${C4_TABAN}). ` +
      `C4_TABAN'ı ${b.eksik.length} yap — yoksa ${bosluk4} dosyalık sessiz bütçe kalır.`,
    ).toBe(true)
    expect(
      bosluk5 <= 0,
      `C5 borcu ${b.bayat.length}'e düştü (taban ${C5_TABAN}). ` +
      `C5_TABAN'ı ${b.bayat.length} yap — yoksa ${bosluk5} dosyalık sessiz bütçe kalır.`,
    ).toBe(true)
  })

  it('vacuous-guard: kapsam gerçekten dolu (yaml/kapsam bozulunca test sessizce yeşile kaçmasın)', () => {
    // En sinsi arıza biçimi: yaml okuması bozulur, kapsam boşalır, iki iddia da
    // "0 <= taban" ile YEŞİL kalır ve bekçi ölür. Bu iddia o yolu kapatır.
    expect(
      b.kaynakSayisi,
      `Kapsamda yalnız ${b.kaynakSayisi} kaynak dosya bulundu — .cc_docs.yaml okuması ` +
      `ya da kapsam süzgeci bozulmuş olabilir (2026-08-17'de 606 ölçüldü).`,
    ).toBeGreaterThan(400)
  })

  it('yaş eşiği gerçekten iş görüyor: taze gürültü ayrı sayılıyor', () => {
    // Eşik olmasa C4 36, C5 189 olurdu ve bekçi ilk günden kırmızı yanardı.
    // Taze sayaçların dolu olması, eşiğin canlı olarak gürültü kestiğini gösterir.
    expect(
      b.eksikTaze + b.bayatTaze,
      'Taze (eşik içi) bulgu sayısı 0 — companion üretimi durmuş olabilir ya da ' +
      'yaş hesabı bozulmuştur; eşiğin gürültü kestiğini bu sayaç kanıtlar.',
    ).toBeGreaterThan(0)
  })
})
