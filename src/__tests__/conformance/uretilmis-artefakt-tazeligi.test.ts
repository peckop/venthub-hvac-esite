import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-DOC-3 · INV-DOC-4 — ÜRETİLEN ARTEFAKT DEPODA VAR VE TAZE Mİ (T021-OR)
 *
 * NİÇİN VAR
 * =========
 * Boru hattı bir artefakt (master `.md`) ÜRETİR, DİSKE YAZAR ve gerisini insana
 * bırakır. "Üretildi mi, depoya girdi mi, kaynağıyla aynı sürümden mi" diye
 * soran bir kapı YOKTU. 2026-08-26'da ısırdı ve kusuru **kapı değil İNSAN**
 * buldu:
 *
 *   PR #821 `.cc_docs.yaml`'a iki küme master'ı TANIMLADI (40 satırlık ayar).
 *   Üretilen dosyalar geçici bir worktree'de doğdu, dijital ikize oradan
 *   yüklendi, worktree silinince yerel kopyalar öldü. Depoda HİÇ görünmediler.
 *   Yani TARİF depoya girdi, ÜRÜN girmedi — ve hiçbir test bunu sormadı.
 *
 * İKİ AYRI SORU, İKİ AYRI KAPI
 * ============================
 *   · INV-DOC-3 (Kapı C) — yaml'ın İLAN ETTİĞİ her artefakt depoda VAR MI?
 *   · INV-DOC-4 (Kapı A) — depodaki artefakt, manifestteki özetle EŞLEŞİYOR MU?
 *
 * Kapı C "ürün hiç gelmedi"yi, Kapı A "ürün geldi ama bozuldu"yu yakalar.
 * Birini diğerinin yerine koymak kör nokta bırakır: kaynak hiç değişmeden ürün
 * elle bozulursa (editörde açılıp kaydedilir, betik üstüne yazar, merge
 * çakışması yanlış çözülür) Kapı C yeşil kalır.
 *
 * ⭐CI GELİŞTİRİCİNİN DİSKİNİ GÖREMEZ
 * ===================================
 * "Üretildi ama commit'lenmedi" durumu tanım gereği yalnız yerel makinede
 * vardır — PR'a giren şey zaten commit'lenmiştir. O soruyu CI'da sormak, hiç
 * kırmızı yanmayacak bir kapı kurmak olurdu. O ayak YERELDE koşar
 * (`orion doc durum`, `pre-push`). Buradaki kapılar DEPO İÇİNİ ölçer ve
 * koşumun hangi ağaçta yapıldığından BAĞIMSIZDIR.
 *
 * ⭐İŞ AKIŞI BEDELİ AÇIKÇA YAZILIDIR (cetvel: `uretilmis-artefakt-standard.md`)
 * =============================================================================
 * Bu kapı bir bedel getirir: doküman kaynaklarına dokunan PR, `orion doc build`
 * çıktısını da AYNI PR'da taşımak zorundadır. Bedel kabul edilmiştir ama
 * YAZILI olmalıdır — yazılmayan bedel, kırmızıyı atlatma alışkanlığı doğurur
 * (T033: rastgele patlayan `pre-commit` tüm filoda `--no-verify` alışkanlığı
 * doğurdu). Bu yüzden her kırmızı mesaj KOŞULACAK TAM KOMUTU basar.
 */

const ARTEFAKT_MANIFESTI = 'docs/artefakt_manifest.json'

/**
 * Repo kökü GİT'TEN türetilir, sabit yol YAZILMAZ (depo PUBLIC; `INV-MUTLAK-YOL-1`).
 * `cwd`'ye de güvenilmez: kabuk sessizce ana dizine kayabiliyor (§28, altı ölçülmüş vaka).
 */
function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
}

/** Dondurulmuş modun TEK KAYNAĞI (§26) — bu dosya onun tüketicisi. */
const sayimModulu = createRequire(import.meta.url)(
  `${repoKoku()}/scripts/hijyen/artefakt-bayatlik-sayim.cjs`,
) as {
  olc: (o?: { kok?: string }) => {
    bayat: Array<{ artefakt: string; degisen: string[]; silinen: string[] }>
    artefaktSayisi: number
    kaynakSayisi: number
    olculdu: boolean
    sebep?: string
  }
  sayimCekirdegi: (g: {
    manifest: { artefaktlar?: Array<{ yol?: string; kaynak?: { dosyalar?: Record<string, string> } }> } | null
    bloblar: Map<string, string>
  }) => { artefaktSayisi: number; kaynakSayisi: number; olculdu: boolean }
  ozetSatiri: (b: { olculdu: boolean; artefaktSayisi: number; kaynakSayisi: number; sebep?: string }) => string
}

function git(args: string[]): string {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

/**
 * HEAD agacindaki her dosyanin BLOB SHA'si. Disk DEGIL — ikize giden sey DEPO
 * halidir; diskteki dosya commit'lenmemis olabilir ve o soruyu yerel Kapi B
 * (`orion doc durum`) zaten soruyor.
 *
 * Blob SHA icerik-adreslidir: ayni icerik → ayni SHA; dal, commit tarihi ve
 * merge bicimi onu etkilemez. Ata-soy yerine bunun secilmesinin sebebi budur:
 * olculdu, depolar SQUASH MERGE kullaniyor ve dal commit'leri master gecmisine
 * HIC girmiyor — ata-soya dayanan kapi her merge'den sonra KALICI KIRMIZI
 * yanardi, kalici kirmizi kapi da gormezden gelinir (T033).
 */
function headBlobHaritasi(): Map<string, string> {
  const harita = new Map<string, string>()
  for (const satir of git(['ls-tree', '-r', 'HEAD']).split('\n')) {
    const temiz = satir.replace(/\r$/, '')
    const sekme = temiz.indexOf('\t')
    if (sekme < 0) continue
    const parcalar = temiz.slice(0, sekme).split(/\s+/)
    if (parcalar.length < 3) continue
    harita.set(temiz.slice(sekme + 1).trim(), parcalar[2])
  }
  return harita
}

function izlenenDosyalar(): Set<string> {
  return new Set(headBlobHaritasi().keys())
}

/**
 * CRLF → LF, BAYT düzeyinde.
 *
 * ⭐NİÇİN NORMALİZE EDİYORUZ: üretim Windows'ta olur ve metin modu yazımı
 * dosyayı CRLF yapar; `core.autocrlf=true` commit'te LF'e çevirir; CI Linux'ta
 * LF iner. Ham bayt özetini karşılaştırsaydık kapı DAHA KURULMADAN KALICI
 * KIRMIZI olurdu — yani artefaktın İÇERİĞİNİ değil TAŞIMA KATMANINI ölçerdi.
 * Satır sonu burada sinyal değil GÜRÜLTÜDÜR: git onu iki uçta iki farklı hâle
 * sokuyor. Üretici taraf (orion `icerik_sha256`) aynı normalizasyonu yapar;
 * iki uç aynı soruyu sormazsa karşılaştırma anlamsızdır.
 *
 * Bayt düzeyinde yapılıyor çünkü metne çevirmek (utf8) geçersiz baytları
 * sessizce U+FFFD'ye dönüştürür ve iki farklı dosya aynı özeti verebilir.
 */
function crlfLfyeCevir(ham: Buffer): Buffer {
  const cikti = Buffer.allocUnsafe(ham.length)
  let n = 0
  for (let i = 0; i < ham.length; i++) {
    if (ham[i] === 0x0d && ham[i + 1] === 0x0a) continue
    cikti[n++] = ham[i]
  }
  return cikti.subarray(0, n)
}

/** İçerik özeti — HEAD'deki blob'dan, DİSKTEN DEĞİL.
 *
 * Diskteki dosya commit'lenmemiş olabilir; kapının sorusu "depodaki artefakt"
 * hakkındadır. Diski okumak başka bir soruya cevap verir ve o soruyu yerel
 * kapı (`orion doc durum`) zaten soruyor.
 */
function headIcerikOzeti(yol: string): string {
  const ham = execFileSync('git', ['show', `HEAD:${yol}`], {
    maxBuffer: 256 * 1024 * 1024,
  })
  return createHash('sha256').update(crlfLfyeCevir(ham)).digest('hex')
}

/**
 * `.cc_docs.yaml`'ın İLAN ETTİĞİ artefaktlar — kapsamın SSOT'u orası.
 *
 * Bekçi kendi listesini UYDURMAZ. Uydursaydı, yaml'a eklenen yeni bir küme
 * master'ı kapının kapsamı dışında kalır ve tam da T020'de olan şey sessizce
 * tekrarlanırdı.
 */
function ilanEdilenArtefaktlar(): string[] {
  const metin = git(['show', 'HEAD:.cc_docs.yaml'])
  const yollar: string[] = []

  const master = /^master_md:\s*"([^"]+)"/m.exec(metin)
  if (master) yollar.push(master[1])

  for (const m of metin.matchAll(/^\s*output:\s*"([^"]+)"/gm)) {
    yollar.push(m[1])
  }
  return [...new Set(yollar)]
}

interface KaynakOzeti {
  ozet: string
  dosya_sayisi: number
  izlenmeyen: string[]
  /** {derlemeye giren yol: derleme anindaki blob SHA} */
  dosyalar: Record<string, string>
}

interface ManifestKaydi {
  ad: string
  yol: string
  kaynak_kumesi: string[]
  kaynak_commit: string
  icerik_sha256: string
  kaynak: KaynakOzeti
}

interface ArtefaktManifesti {
  surum: number
  kaynak_commit: string
  calisma_agaci: string
  artefaktlar: ManifestKaydi[]
}

function manifestOku(): ArtefaktManifesti | null {
  try {
    const govde: ArtefaktManifesti = JSON.parse(git(['show', `HEAD:${ARTEFAKT_MANIFESTI}`]))
    return govde
  } catch {
    return null
  }
}

describe('INV-DOC-3 · Kapı C — yaml ürünü ilan ediyorsa ürün DEPODA olmalı', () => {
  const izlenen = izlenenDosyalar()
  const ilanEdilen = ilanEdilenArtefaktlar()

  it('vacuous-guard: yaml okuması gerçekten artefakt buldu', () => {
    // ⭐EN SİNSİ ARIZA BİÇİMİ: yaml okuması bozulur, liste boşalır, ve aşağıdaki
    // iddia HİÇBİR ŞEY ÖLÇMEDEN yeşil yanar. Kapsamı boşalan bir kapının
    // sessizce geçmesi, kapının hiç olmamasından KÖTÜDÜR: var sanılır.
    expect(
      ilanEdilen.length,
      '.cc_docs.yaml okumasından 0 artefakt çıktı — ayrıştırma bozulmuş olmalı. ' +
        'Boş kapsamla geçen bir kapı, ölçmediği hâlde "geçti" der.',
    ).toBeGreaterThanOrEqual(2)
  })

  it('ilan edilen her artefakt depoda İZLENEN bir dosya', () => {
    const eksik = ilanEdilen.filter(y => !izlenen.has(y))
    expect(
      eksik,
      '.cc_docs.yaml şu artefaktları İLAN EDİYOR ama depoda YOKLAR:\n' +
        eksik.map(y => `  · ${y}`).join('\n') +
        "\n\nBu, 2026-08-26'da yaşanan T020 kusurunun ta kendisi: TARİF depoya " +
        'girdi, ÜRÜN girmedi. Üretilen dosya geçici bir worktree\'de doğup o ' +
        'ağaçla birlikte ölmüş olabilir.\n\nÇÖZÜM:\n' +
        `  orion doc build\n  git add ${eksik.join(' ')}`,
    ).toEqual([])
  })
})

describe('INV-DOC-4 · Kapı A — depodaki artefakt manifestle EŞLEŞİYOR mu', () => {
  const izlenen = izlenenDosyalar()
  const manifest = manifestOku()

  it('artefakt manifesti depoda VAR (ölçülemedi ≠ geçti)', () => {
    // ⭐MANİFEST DE BİR ARTEFAKTTIR VE COMMİT'LENMELİDİR.
    // Commit'lenmemiş bir manifest CI'da HİÇ YOKTUR; kapı ölçecek şey bulamaz
    // ve SESSİZCE YOK OLUR — kapatmaya çalıştığımız körlüğün ta kendisi.
    // Bu, orion deposunda CANLI ölçüldü (2026-08-26): manifest izlenmiyordu.
    expect(
      manifest,
      `${ARTEFAKT_MANIFESTI} depoda yok. Bu kapı onsuz HİÇBİR ŞEY ölçemez ve ` +
        '"ölçemedim, o hâlde geçtim" bu depoda YASAKTIR.\n\nÇÖZÜM:\n' +
        `  orion doc build\n  git add ${ARTEFAKT_MANIFESTI}`,
    ).not.toBeNull()
  })

  it('vacuous-guard: manifest gerçekten artefakt sayıyor', () => {
    expect(
      manifest?.artefaktlar?.length ?? 0,
      'Manifest boş — boş listeyle geçen bir kapı ölçmediği hâlde "geçti" der.',
    ).toBeGreaterThanOrEqual(1)
  })

  it('manifestteki her artefakt depoda İZLENEN bir dosya', () => {
    const eksik = (manifest?.artefaktlar ?? [])
      .map(a => a.yol)
      .filter(y => !izlenen.has(y))
    expect(
      eksik,
      'Manifest şu artefaktları kayda geçirmiş ama depoda YOKLAR:\n' +
        eksik.map(y => `  · ${y}`).join('\n'),
    ).toEqual([])
  })

  it('⭐depodaki artefaktın içeriği manifestteki özetle AYNI', () => {
    // ⭐NİÇİN BU AYAK ŞART (OPS şartı E1): "kaynak değişti mi" sorusu, kaynak
    // HİÇ DEĞİŞMEDEN ürünün bozulduğu vakayı GÖREMEZ. Birisi master'ı editörde
    // açıp kaydeder, bir betik üstüne yazar, ya da merge çakışması yanlış
    // çözülür — kaynak tarafı tertemizdir ve tazelik ölçümü yeşil kalır.
    // Manifest özeti ucuzdur ve bu körü tam olarak kapatır.
    const uyusmayan: string[] = []
    for (const a of manifest?.artefaktlar ?? []) {
      if (!izlenen.has(a.yol)) continue // bir üstteki test söylüyor
      const gercek = headIcerikOzeti(a.yol)
      if (gercek !== a.icerik_sha256) {
        uyusmayan.push(
          `  · ${a.yol}\n      manifest: ${a.icerik_sha256}\n      depoda:   ${gercek}`,
        )
      }
    }
    expect(
      uyusmayan,
      `Depodaki artefakt manifestteki özetle UYUŞMUYOR:\n${uyusmayan.join('\n')}\n\n` +
        'İki olasılık var ve ikisi de düzeltilmeli:\n' +
        '  (a) artefakt ELLE düzenlendi — üretilen dosya elle değiştirilmez;\n' +
        '      kaynağı düzeltip yeniden üretin.\n' +
        '  (b) artefakt yeniden üretildi ama manifest tazelenmedi.\n\nÇÖZÜM:\n' +
        `  orion doc build\n  git add ${ARTEFAKT_MANIFESTI} <artefaktlar>`,
    ).toEqual([])
  })

  it('manifest kayıtları eksiksiz (alan atlanarak kapı köreltilemez)', () => {
    // Bir kaydın `icerik_sha256`'sı boşsa yukarıdaki karşılaştırma o artefakt
    // için sessizce hiçbir şey sormaz hâle gelirdi. Kaydın TAM olması kapının
    // önkoşuludur.
    const bozuk = (manifest?.artefaktlar ?? []).filter(
      a =>
        !a.yol ||
        !a.icerik_sha256 ||
        !Array.isArray(a.kaynak_kumesi) ||
        a.kaynak_kumesi.length === 0,
    )
    expect(
      bozuk.map(a => a.yol || '(yolsuz kayıt)'),
      'Manifest kaydı eksik alanlı — eksik alan, kapının o artefakt için ' +
        'sessizce hiçbir şey sormaması demektir.',
    ).toEqual([])
  })
})

describe('Kapı C ile Kapı A birbirini kapsamıyor — ikisi de gerekli', () => {
  it('yaml ilanı ile manifest kaydı AYNI kümeyi gösteriyor', () => {
    // ⭐İKİ KAYNAK AYRIŞIRSA HANGİSİNİN DOĞRU OLDUĞU BİLİNMEZ.
    // yaml "şunu üretiyorum" der, manifest "şunu ürettim" der. Ayrışma, ya
    // üreticinin yaml'ı tam okumadığını ya da manifestin bayat olduğunu
    // gösterir; ikisi de kapının ölçtüğü şeyi sessizce daraltır.
    const manifest = manifestOku()
    const ilan = new Set(ilanEdilenArtefaktlar())
    const kayitli = new Set((manifest?.artefaktlar ?? []).map(a => a.yol))

    const ilanEdilipUretilmeyen = [...ilan].filter(y => !kayitli.has(y))
    expect(
      ilanEdilipUretilmeyen,
      ".cc_docs.yaml ilan ediyor ama manifest kayda geçirmemiş:\n" +
        ilanEdilipUretilmeyen.map(y => `  · ${y}`).join('\n') +
        "\n\nÜretici yaml'ı tam okumamış ya da manifest bayat. ÇÖZÜM: orion doc build",
    ).toEqual([])
  })
})

describe('INV-DOC-4b · Kapı A ikinci ayak — kaynak derlemeden sonra DEĞİŞTİ mi', () => {
  const manifest = manifestOku()
  const bloblar = headBlobHaritasi()

  /**
   * ⭐DONDURULMUŞ MOD (REC-132 · D1, Recep/OPS kararı 2026-09-04) — BLOKLAMAZ, SAYAR.
   *
   * NİÇİN: bu kol her şeridin PR'ında üretilmiş toplamaların yol almasını zorunlu kılıyordu.
   * Ölçüldü (2026-09-03/04): **yedi** taban tazelemesi, her biri tam bir CI koşumu; ve İKİ
   * PR'da kapılar **hiç doğmadı**, çünkü çakışık PR'ın birleşme ref'i üretilemiyor. Yani
   * sınıf yalnız zaman yakmıyor, **sahte yeşil** de üretiyor.
   *
   * ⚠KAPI SİLİNMEDİ, EŞİK UZATILMADI. Ölçüm sürüyor; yalnız bloklamıyor. Bir kapıyı kapatmak
   * ölçümü susturmak değildir (§21: kabul edilen boşluk sessiz olamaz). C4'te (companion)
   * aynı biçim uygulandı.
   *
   * ⚠DONDURULAN KOL YALNIZ BU: "kaynak derlemeden sonra değişti mi" (parity). Bu describe'ın
   * DİĞER İKİ kolu (izlenmeyen kaynak + vacuous-guard) ve **AXIOM 3 kolu** — INV-DOC-4
   * içindeki *"depodaki artefaktın içeriği manifestteki özetle AYNI"* — **BLOKLAMAYA DEVAM
   * EDER.** Üretilmiş dosyayı elle düzenlemek hâlâ KIRMIZIDIR.
   *
   * (Bu ayrımı bir plan-challenger buldu: ilk planım "INV-DOC-4b'nin İKİ kolu var" diyordu;
   * ÜÇ kolu var ve üçü de kaynak tarafında, elle-düzenleme kolu başka bir değişmezin içinde.
   * Yanlış kolu dondurmak kapıyı SESSİZCE BOŞALTIRDI.)
   *
   * §26 TEK KAYNAK: sayı `scripts/hijyen/artefakt-bayatlik-sayim.cjs`ten gelir; bu kol onun
   * TÜKETİCİSİDİR ve kendi BAĞIMSIZ hesabıyla çapraz doğrular — paylaşılan tek uygulama iki
   * yönde birden yanılabilir.
   */
  it('⭐DONDURULMUŞ MOD: parity BLOKLAMAZ ama SAYAR, ve sayı MODÜLDEN gelir (§26)', () => {
    const olcum = sayimModulu.olc({ kok: repoKoku() })
    expect(
      olcum.olculdu,
      `bayatlık ÖLÇÜLEMEDİ (${olcum.sebep ?? ''}) — ölçememek geçmek DEĞİLDİR; ` +
        'dondurulmuş mod "ölçmüyorum" demek değil, "bloklamıyorum" demektir',
    ).toBe(true)

    // BAĞIMSIZ HESAP — modülün dediğini tekrar etmek tautoloji olurdu.
    const bagimsiz: string[] = []
    for (const a of manifest?.artefaktlar ?? []) {
      const kayitli = a.kaynak?.dosyalar ?? {}
      let sapan = 0
      for (const [yol, sha] of Object.entries(kayitli)) {
        if (bloblar.get(yol) !== sha) sapan += 1
      }
      if (sapan > 0) bagimsiz.push(a.yol)
    }
    expect(
      olcum.artefaktSayisi,
      `Modülün sayısı (${olcum.artefaktSayisi}) ile bu testin bağımsız hesabı ` +
        `(${bagimsiz.length}) AYRIŞIYOR — tek kaynak iddiası çökmüş demektir.`,
    ).toBe(bagimsiz.length)

    // Kabul edilen boşluk SESSİZ olamaz: sayım her koşuda görünür.
    process.stdout.write('[INV-DOC-4b] ' + sayimModulu.ozetSatiri(olcum) + '\n')
  })

  it('⭐SAYIM AYIRT EDER: bayat kaynak eklenince sayı ARTAR (kelime değil SAYI ölçülür)', () => {
    // Saf çekirdek fikstürü — durumu ÜRETİR, depoda bayat dosya bulunmasına GÜVENMEZ (§25).
    const temizManifest = {
      artefaktlar: [{ yol: 'docs/a_master.md', kaynak: { dosyalar: { 'src/x.ts': 'aaa' } } }],
    }
    const temizBloblar = new Map([['src/x.ts', 'aaa']])
    const temiz = sayimModulu.sayimCekirdegi({ manifest: temizManifest, bloblar: temizBloblar })
    expect(temiz.artefaktSayisi, 'eşleşen kaynak bayat sayıldı — yanlış alarm').toBe(0)

    const bayatBloblar = new Map([['src/x.ts', 'bbb']])
    const bayatOlcum = sayimModulu.sayimCekirdegi({
      manifest: temizManifest, bloblar: bayatBloblar,
    })
    expect(bayatOlcum.artefaktSayisi, 'kaynak değişti ama sayı ARTMADI').toBe(1)
    expect(bayatOlcum.kaynakSayisi, 'kaynak sayısı taşınmıyor').toBe(1)

    // SİLİNEN kaynak da bayatlıktır — ayrı yön, ayrı ölçüm.
    const silinmis = sayimModulu.sayimCekirdegi({ manifest: temizManifest, bloblar: new Map() })
    expect(silinmis.artefaktSayisi, 'silinen kaynak bayatlık saymadı').toBe(1)

    // Özet satırı SAYIYI taşır — sabit metin sabotajı burada yakalanır.
    expect(
      sayimModulu.ozetSatiri(bayatOlcum),
      'Özet satırı sayıyı taşımıyor. Sabit metin, sayaç bozulsa bile aynı kalır ve ' +
        'ayırt etmeyen gösterge ölçüm değildir.',
    ).toMatch(/\b1 artefakt\b/)
    expect(sayimModulu.ozetSatiri(temiz), 'bayat YOK hâli ayrı yazılmıyor').toMatch(/YOK/)
  })

  it('ÖLÇEMEMEK GEÇMEK DEĞİL: manifest okunamazsa "bayat yok" DENMEZ', () => {
    const yok = sayimModulu.sayimCekirdegi({ manifest: null, bloblar: new Map() })
    expect(yok.olculdu, 'manifest yokken ölçülmüş gibi döndü').toBe(false)
    expect(
      sayimModulu.ozetSatiri(yok),
      '"ölçemedim" ile "bayat yok" aynı cümleye düşmüş — iki AYRI cevap',
    ).toMatch(/OLCULEMEDI/)
  })

  it('kaynak parity dökümü (bilgi — dondurulmuş modda bloklamaz)', () => {
    // ⭐NİÇİN BLOB SHA, ATA-SOY DEĞİL — ÖLÇÜLDÜ (2026-08-26):
    // Depolar SQUASH MERGE kullanıyor; dal commit'leri master geçmişine HİÇ
    // girmiyor. `feat/t020-kume-masterlari` ucu `cd2cd16` içeriğiyle master'a
    // girdiği hâlde `git merge-base --is-ancestor cd2cd16 master` ÇIKIŞ 1
    // veriyor. Ata-soya dayanan bir kapı HER MERGE'DEN SONRA kırmızı yanardı.
    //
    // ⭐NİÇİN İLAN EDİLEN DİZİNİN AĞAÇ SHA'SI DA DEĞİL — o da ölçüldü:
    // `source_dirs` `[src, "."]` ve KÖK DİZİNİN ağaç SHA'sı HER COMMIT'TE
    // değişiyor (ecac1ca → 73f9bde; aradaki commit yalnız docs/ altına dokundu).
    // Ana master kalıcı bayat olurdu. Bu yüzden çözünürlük DOSYA düzeyinde.
    const bayat: string[] = []
    for (const a of manifest?.artefaktlar ?? []) {
      const kayitli = a.kaynak?.dosyalar ?? {}
      const degisen: string[] = []
      for (const [yol, sha] of Object.entries(kayitli)) {
        const simdiki = bloblar.get(yol)
        if (simdiki === undefined) {
          degisen.push(`      SİLİNDİ  ${yol}`)
        } else if (simdiki !== sha) {
          degisen.push(`      DEĞİŞTİ  ${yol}`)
        }
      }
      if (degisen.length) {
        bayat.push(`  · ${a.yol} (${degisen.length} kaynak):\n${degisen.slice(0, 10).join('\n')}`)
      }
    }
    // ⚠BLOKLAMAZ (dondurulmuş mod). Döküm yine BASILIR: kabul edilen boşluk sessiz olamaz.
    // Sayının kendisi ve ayırt ediciliği ÜSTTEKİ iki kolda ölçülüyor; bu kol yalnız İNSANA
    // hangi dosyaların bayat olduğunu gösterir.
    if (bayat.length) {
      process.stdout.write(
        `[INV-DOC-4b · dondurulmus mod] kaynaklari derlemeden SONRA degisen artefaktlar:\n` +
          bayat.join('\n') +
          `\n  ELLE TAZELEME: orion doc build --force-sync; git add docs/*_master.md ` +
          `${ARTEFAKT_MANIFESTI}\n  ⭐DURMA OLCUTU: "diff bos" DEGIL, bu kapinin YESILI. ` +
          `Bu zincir byte duzeyinde sabit noktaya HIC ulasmaz (compiled_at + source_commit ` +
          `her kosumda degisir) — URUN bunu 2026-09-04'te bedel odeyerek olctu.\n`,
      )
    }
    // Kolun kendisi bir şey İDDİA ETMELİ, yoksa boş bir `it` olur ve sessizce ölür.
    expect(Array.isArray(bayat), 'döküm üretilemedi — kol hiçbir şey ölçmüyor').toBe(true)
  })

  it('manifest derleme anında İZLENMEYEN kaynak taşımıyor', () => {
    // Derleme anında commit'lenmemiş bir kaynak özete `IZLENMIYOR` olarak girer.
    // Depoya giren manifestte böyle bir kayıt varsa, artefakt yarım bir dünyadan
    // derlenmiş demektir: dosya sonradan commit'lenince özet değişir ve kapı
    // zaten kırmızı yanar — ama sebebini SÖYLEMEK daha iyidir.
    const kirli: string[] = []
    for (const a of manifest?.artefaktlar ?? []) {
      for (const y of a.kaynak?.izlenmeyen ?? []) kirli.push(`  · ${a.yol} ← ${y}`)
    }
    expect(
      kirli,
      'Manifest, derleme anında commit\'lenmemiş kaynaklar içeriyor:\n' +
        kirli.join('\n') +
        '\n\nÖnce kaynakları commit\'leyin, SONRA `orion doc build` koşun.',
    ).toEqual([])
  })

  it('vacuous-guard: kaynak haritası gerçekten dolu', () => {
    // Harita boşalırsa yukarıdaki iddia HİÇBİR ŞEY ölçmeden yeşil yanar.
    const toplam = (manifest?.artefaktlar ?? []).reduce(
      (t, a) => t + Object.keys(a.kaynak?.dosyalar ?? {}).length, 0)
    expect(
      toplam,
      'Manifestteki kaynak haritası boş — kapı ölçecek dosya bulamıyor. ' +
        'Boş haritayla geçen bir kapı, ölçmediği hâlde "geçti" der.',
    ).toBeGreaterThanOrEqual(10)
  })
})
