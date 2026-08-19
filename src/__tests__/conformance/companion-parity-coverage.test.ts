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

/**
 * KAPI KAPSAMININ BAŞLANGIÇ TARİHİ — ölçülmüş bir kusurun düzeltmesi (2026-08-18).
 *
 * İLK TASARIM DRIFT EDİYORDU: borç "kaynak `YAS_ESIGI_GUN` günden eski + companion bayat"
 * diye sayılıyordu ve taban bir SAYI idi (C5=33). Sayı **takvim ilerledikçe kendiliğinden
 * büyüyor**: 2026-08-17'de 33 ölçüldü, ertesi gün hiçbir commit atılmadan 39 oldu. Ölçtüm —
 * fark tam 6 ve tam 6 dosyanın kaynak yaşı 8 gündü, yani 7 günlük eşiği O GECE geçmişlerdi.
 *
 * Yani kapı, kimse hiçbir şey yapmasa bile birkaç günde bir kırmızıya dönecekti. Bu bir
 * YANLIŞ-KIRMIZI ÜRETECİ ve tam olarak bu bekçinin cetvelinde uyardığım şey: "bekçi ilk
 * günden (ya da rastgele) kırmızı yanarsa görmezden gelinir" — bu depoda yaşandı, rastgele
 * patlayan `pre-commit` tüm filoda `--no-verify` alışkanlığı doğurdu (T033).
 *
 * ÇÖZÜM: eşiği "şimdi"ye değil KAPININ İNDİĞİ TARİHE demirle. Kapı yalnız **bu tarihten
 * sonra** dokunulan kaynakları denetler; daha eski borç TARİHSEL kabul edilir, kapsam
 * dışıdır ama GÖRÜNÜR kalır (aşağıdaki tarihsel-borç testi sayıyı basar ve sıfırlanınca
 * demiri kaldırmaya zorlar). Böylece:
 *   · zaman geçmesi yeni ihlal ÜRETMEZ (drift kapandı)
 *   · yeni bir commit companion'ını bayat bırakırsa 7 gün sonra KIRMIZI (asıl amaç korundu)
 *   · tabanlar SIFIR olur — ratchet'in en güçlü hâli, sessiz bütçe yok
 */
const KAPI_BASLANGIC = '2026-08-18'

// Tabanlar SIFIR: kapı yalnız KAPI_BASLANGIC sonrası dokunulan kaynakları denetliyor, yani
// tarihsel borç kapsam dışı. Bu sayılar HEDEF değil TAVAN ve YÜKSELTİLEMEZ — yükseltmek
// "yeni borca izin ver" demektir. Tarihsel borç ayrı testte görünür kalıyor.
const C4_TABAN = 0
const C5_TABAN = 0

/**
 * ÖLÇÜM ÖNKOŞULU: TAM GİT GEÇMİŞİ.
 *
 * Bu bekçi yaşı `git log` üzerinden hesaplıyor. Sığ (shallow) bir klonda `git log`
 * yalnız son commit(ler)i görür, tarih haritası boşalır ve bekçi SESSİZCE yanlış
 * ölçer. 2026-08-17'de tam bu yaşandı: `actions/checkout@v4` `fetch-depth`
 * belirtilmediği için varsayılan **1** ile çalışıyor: CI'da C4 borcu **0** göründü,
 * oysa tam geçmişte **1**. Kapı yeşil kalsaydı hiç ölçmediği hâlde "geçti" derdi —
 * kendi stale-guard'ı yakaladığı için fark edildi.
 *
 * AYNI TUZAĞA BEN DE DÜŞTÜM: ara ölçümde `git merge --no-commit` ile ağacı birleştirip
 * C4=8 okudum ve bunu gerçek sandım. Ağaç birleşmişti ama GEÇMİŞ birleşmemişti, yani
 * master'ın commit tarihleri haritada yoktu ve o 7 taze dosya "tarihsiz = çok eski"
 * sayıldı. Gerçek merge sonrası sayı 1'e döndü. Ders: yaş ölçen bir bekçi için
 * "hangi dosyalar var" ile "hangi commit'ler görünüyor" AYRI sorulardır.
 *
 * Bu yüzden önkoşul AÇIKÇA doğrulanıyor ve karşılanmıyorsa test KIRMIZI olur.
 * "Ölçemedim, o hâlde geçtim" (fail-open / uyar-geç modu) bu depoda yasak: yeni
 * kapıya muafiyet tanımak kapıyı dekoratif yapar. Çözüm testte değil CI'da:
 * checkout adımına `fetch-depth: 0`.
 */
const ASGARI_COMMIT_SAYISI = 50

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
  /** KAPI_BASLANGIC ONCESI borc: kapsam DISI ama gorunur tutuluyor. */
  tarihselEksik: string[]
  tarihselBayat: string[]
  /** Kapi kapsamindaki (demir sonrasi dokunulmus) kaynak sayisi. */
  kapidakiKaynak: number
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
  const tarihselEksik: string[] = []
  const tarihselBayat: string[] = []
  let kapidakiKaynak = 0
  let eksikTaze = 0
  let bayatTaze = 0

  for (const kaynak of kaynaklar) {
    const companion = `${kaynak.replace(/\.[^./]+$/, '')}.md`
    const kaynakTarih = tarihler.get(kaynak) ?? ''
    const yas = kaynakTarih ? gunFarki(kaynakTarih, bugun) : Number.MAX_SAFE_INTEGER

    // Kapı kapsamı: KAPI_BASLANGIC sonrası dokunulmuş kaynaklar. Daha eskisi TARİHSEL borç
    // (kapsam dışı ama görünür) — bkz. KAPI_BASLANGIC yorumu, drift ölçümü orada.
    const kapidaMi = kaynakTarih >= KAPI_BASLANGIC
    if (kapidaMi) kapidakiKaynak++

    if (!mdSet.has(companion)) {
      if (yas <= YAS_ESIGI_GUN) eksikTaze++
      else if (kapidaMi) eksik.push(kaynak)
      else tarihselEksik.push(kaynak)
      continue
    }
    const companionTarih = tarihler.get(companion) ?? ''
    if (kaynakTarih && companionTarih && kaynakTarih > companionTarih) {
      if (yas <= YAS_ESIGI_GUN) bayatTaze++
      else if (kapidaMi) bayat.push(companion)
      else tarihselBayat.push(companion)
    }
  }

  return {
    kaynakSayisi: kaynaklar.length, eksik, bayat, eksikTaze, bayatTaze,
    tarihselEksik, tarihselBayat, kapidakiKaynak,
  }
}

describe('INV-DOC-2 · companion kapsam paritesi', () => {
  const b = olc()

  it('ÖNKOŞUL: git geçmişi TAM (sığ klonda bu bekçi ölçemez, o hâlde geçmiş de sayılmaz)', () => {
    const sigMi = git(['rev-parse', '--is-shallow-repository']).trim() === 'true'
    const commitSayisi = git(['rev-list', '--count', 'HEAD']).trim()

    expect(
      sigMi,
      'Depo SIĞ klonlanmış (shallow). Bu bekçi yaşı `git log` ile hesaplıyor; sığ klonda ' +
      'tarih haritası boşalır ve bekçi SESSİZCE yanlış ölçer — 2026-08-17\'de yerelde 8 ' +
      'ölçülen borç CI\'da 0 göründü. ÇÖZÜM TESTTE DEĞİL CI\'DA: checkout adımına ' +
      '`fetch-depth: 0` ekle (.github/workflows/ci.yml). "Ölçemedim ama geçtim" kabul edilmez.',
    ).toBe(false)

    expect(
      Number(commitSayisi),
      `Git geçmişinde yalnız ${commitSayisi} commit görünüyor (asgari ${ASGARI_COMMIT_SAYISI}). ` +
      'Geçmiş budanmışsa yaş hesabı anlamsızdır; `fetch-depth: 0` gerekli.',
    ).toBeGreaterThan(ASGARI_COMMIT_SAYISI)
  })

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

  it('TARİHSEL borç GÖRÜNÜR kalır (kapsam dışı ≠ yok sayıldı)', () => {
    // Kapsamı KAPI_BASLANGIC ile daraltmak drift'i kapattı ama yeni bir tehlike doğurdu:
    // eski borç sessizce yok sayılabilir. Bu yüzden sayı BASILIYOR ve sıfırlandığında test
    // KIRMIZI yanıp demiri kaldırmaya zorluyor — gerekçesiz kapsam daraltması taşınmasın.
    const toplam = b.tarihselEksik.length + b.tarihselBayat.length
    // eslint-disable-next-line no-console
    console.info(
      `[INV-DOC-2] TARİHSEL companion borcu (KAPI_BASLANGIC=${KAPI_BASLANGIC} öncesi, kapı ` +
      `kapsamı DIŞINDA): ${b.tarihselEksik.length} eksik + ${b.tarihselBayat.length} bayat ` +
      `= ${toplam}. Kapı yalnız yeni borcu engelliyor; bu yığın ayrı bir iş emri konusudur.
` +
      `[INV-DOC-2] Kapı kapsamındaki kaynak: ${b.kapidakiKaynak} · bunlardan ihlal: ` +
      `${b.eksik.length} eksik + ${b.bayat.length} bayat. DÜRÜST NOT: KAPI_BASLANGIC'tan ` +
      `sonra dokunulan bir dosya ${YAS_ESIGI_GUN} günü doldurmadıkça ihlal ÜRETEMEZ — yani ` +
      `kapı ilk ${YAS_ESIGI_GUN} gün yapısal olarak sessizdir. Bu YEŞİLİ "borç yok" diye ` +
      `okuma; "yeni borç henüz olgunlaşmadı" diye oku.`,
    )
    expect(
      toplam,
      'İYİ HABER olabilir: tarihsel companion borcu SIFIRA düştü. Öyleyse KAPI_BASLANGIC ' +
      'demiri gereksizleşti — kaldır (ya da bugüne çek) ve bu testi sil, yoksa kapı geçmişi ' +
      'gerekçesiz biçimde kapsam dışı tutmaya devam eder.',
    ).toBeGreaterThan(0)
  })

  it('ratchet geri kaymasın: tabanlar SIFIR kalmalı (yükseltmek yeni borca izin verir)', () => {
    // Sayı-tabanlı ratchet'in yerini bu aldı. Eski sürümde "borç azaldıysa tabanı düşür"
    // diyordu; taban artık 0 olduğu için düşürülecek bir şey yok — korunması gereken şey
    // tabanın YÜKSELTİLMEMESİ. Biri kırmızıyı susturmak için sayıyı büyütürse burası yanar.
    expect(C4_TABAN, 'C4_TABAN yükseltilmiş — kırmızıyı susturmak için taban büyütmek, kapıyı sökmektir').toBe(0)
    expect(C5_TABAN, 'C5_TABAN yükseltilmiş — kırmızıyı susturmak için taban büyütmek, kapıyı sökmektir').toBe(0)
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
