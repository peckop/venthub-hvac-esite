import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

/**
 * ÜRETİLMİŞ ARTEFAKT TAZELİĞİ · ortak yardımcı (ALT-38i parça 2). Test DEĞİLDİR (vitest yalnız `*.test.ts` toplar).
 *
 * `uretilmis-artefakt-tazeligi.test.ts` (PR kolu) ve `uretilmis-artefakt-tazeligi-dunya.test.ts` (dünya kolu) AYNI kuralları
 * koşar; fark yalnız KAPSAMDIR. Kural kodu (depo okuyucuları, ihlal hesabı, ihlal mesajı) bu dosyada TEK yerdedir ki iki kol
 * sessizce ayrışmasın; kolların kendi dosyalarında yalnız "hangi kapsamla, hangi iddiayla" kalır.
 *
 *   PR kolu     (her PR'da)              kural yalnız PR'ın DOKUNDUĞU girdiler için koşar (aşağıdaki "PR KAPSAMI").
 *   Dünya kolu  (master push + zamanlı)  kural HER ZAMAN depodaki TÜM veriyle koşar.
 *
 * ⭐NİÇİN BÖLÜNDÜ: karne (docs/audits/test-karnesi-2026-10-09.json) bu dosyada 36 kırmızı koşu, 29 farklı dal, 32'si dünya olayı
 * kümesinde, PR'a ait yalnız 4. Kırmızıların çoğu PR'ın kodundan değil, master'daki kaynak/manifest durumunun PR'dan bağımsız
 * kaymasından geliyordu. Tümden taşımak (ALT-38 ilk kayıt: taban-tazeligi) PR'ın GERÇEK hatasını da, yani elle düzenlenmiş
 * üretilmiş dosyayı ve silinmiş artefaktı da PR kapısından çıkarırdı; bu yüzden kural kolu bölünür, PR'a ait kısım PR'da kalır.
 * Cetvel: `docs/standards/test-karnesi-standard.md` §3 ve §7.4.
 *
 * ⭐PR KAPSAMI (FAIL-CLOSED)
 * ==========================
 * "Bu PR hangi dosyalara dokundu" `scripts/ci/dunya-durumu.cjs` `degisenYollariniOku`dan gelir (CI'da
 * `git diff --name-only -z --no-renames HEAD^1 HEAD`; elle: `VENTHUB_DUNYA_DEGISEN_DOSYALAR=<dosya yolu>`). Kural:
 *   · liste okunamadıysa (`null`) KAPSAM TAMDIR: her PR-kolu kuralı eski haliyle, tüm veriyle koşar;
 *   · kontrolün KENDİ girdisinden biri değiştiyse (bu test dosyaları, yardımcı, sayım modülü, taşıyıcı anahtarı) KAPSAM TAMDIR:
 *     kuralın kendisi değişmişken "ilgili girdi değişmedi" diyerek susamaz;
 *   · aksi halde bir kural YALNIZ girdisi diff'te ise koşar. Girdi, kuralın baktığı dosyaların HEPSİDİR: manifest, ilan
 *     yaml'ı VE artefaktın kendisi (bir artefaktı SİLEN ya da yer değiştiren PR, yaml ya da manifestte tek satır
 *     değişmeden kuralı kırar; yalnız "yaml/manifest diff'te mi" diye bakmak o PR'ı kaçırırdı).
 * Boş kapsam yalnız "liste okundu ve hiçbir girdiye dokunulmadı" iken olur. KANARYALAR (ilan, manifest, kaynak haritası boş
 * olamaz) kapsamdan bağımsız, TAM veriden hesaplanır.
 *
 * `prDegisenleri` ve `kapsamla` başka çalışma kopyalarındaki ortak yardımcıyla AYNI imzayı taşır (birleştirmede tekleşecek).
 */

export const ARTEFAKT_MANIFESTI = 'docs/artefakt_manifest.json'
export const ILAN_DOSYASI = '.cc_docs.yaml'

/** Kanarya tabanları: kapsamdan bağımsız, TAM veride en az bu kadar kayıt olmalı (boş veriyle geçen kapı ölçmemiştir). */
export const ILAN_TABANI = 2
export const MANIFEST_TABANI = 1
export const KAYNAK_HARITASI_TABANI = 10

/**
 * Repo kökü GİT'TEN türetilir, sabit yol YAZILMAZ (depo PUBLIC; `INV-MUTLAK-YOL-1`).
 * `cwd`'ye de güvenilmez: kabuk sessizce ana dizine kayabiliyor (§28, altı ölçülmüş vaka).
 */
export function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
}

/**
 * ⭐DONDURULMUŞ MOD ARTIK TAŞIYICI ANAHTARINDAN TÜRER (REC-142, Recep kararı 2026-09-05).
 *
 * Önce bu kolun "bloklamıyor" hâli KODA GÖMÜLÜYDÜ ve gerekçesi bir TARİHTİ (09-04 kararı).
 * Aynı kusur companion kapılarında da vardı: taşıyıcı kapandı, kapılar açık kaldı ve
 * çelişki her hafta başka bir koldan filoyu kilitledi. Artık üretimin açık/kapalı olduğu
 * TEK yerde yazılı; bu kol onu OKUR. Taşıyıcı açıldığı gün donmuş kollar kendiliğinden
 * bloklamaya döner — kimsenin hatırlaması gerekmez, tek çevirme yeter.
 */
export const tasiyici = createRequire(import.meta.url)(
  `${repoKoku()}/scripts/hijyen/tasiyici-anahtari.cjs`,
) as {
  oku: (kok: string) => { durum: 'ACIK' | 'KAPALI'; yol: string; okundu: boolean; sebep: string }
  durumSatiri: (kok: string) => string
}
export const UYKUDA = tasiyici.oku(repoKoku()).durum === 'KAPALI'

export interface SayimSonucu {
  bayat: Array<{ artefakt: string; degisen: string[]; silinen: string[] }>
  artefaktSayisi: number
  kaynakSayisi: number
  olculdu: boolean
  sebep?: string
}

/** Dondurulmuş modun TEK KAYNAĞI (§26) — iki kol da onun tüketicisi. */
export const sayimModulu = createRequire(import.meta.url)(
  `${repoKoku()}/scripts/hijyen/artefakt-bayatlik-sayim.cjs`,
) as {
  olc: (o?: { kok?: string }) => SayimSonucu
  sayimCekirdegi: (g: {
    manifest: { artefaktlar?: Array<{ yol?: string; kaynak?: { dosyalar?: Record<string, string> } }> } | null
    bloblar: ReadonlyMap<string, string>
  }) => SayimSonucu
  ozetSatiri: (b: { olculdu: boolean; artefaktSayisi: number; kaynakSayisi: number; sebep?: string }) => string
}

function git(args: string[]): string {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

let blobOnbellegi: Map<string, string> | null = null

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
 *
 * Bir koşuda HEAD değişmez; harita bir kez okunur.
 */
export function headBlobHaritasi(): Map<string, string> {
  if (blobOnbellegi) return blobOnbellegi
  const harita = new Map<string, string>()
  for (const satir of git(['ls-tree', '-r', 'HEAD']).split('\n')) {
    const temiz = satir.replace(/\r$/, '')
    const sekme = temiz.indexOf('\t')
    if (sekme < 0) continue
    const parcalar = temiz.slice(0, sekme).split(/\s+/)
    if (parcalar.length < 3) continue
    harita.set(temiz.slice(sekme + 1).trim(), parcalar[2])
  }
  blobOnbellegi = harita
  return harita
}

export function izlenenDosyalar(): Set<string> {
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
export function headIcerikOzeti(yol: string): string {
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
export function ilanEdilenArtefaktlar(): string[] {
  const metin = git(['show', `HEAD:${ILAN_DOSYASI}`])
  const yollar: string[] = []

  const master = /^master_md:\s*"([^"]+)"/m.exec(metin)
  if (master) yollar.push(master[1])

  for (const m of metin.matchAll(/^\s*output:\s*"([^"]+)"/gm)) {
    yollar.push(m[1])
  }
  return [...new Set(yollar)]
}

export interface KaynakOzeti {
  ozet: string
  dosya_sayisi: number
  izlenmeyen: string[]
  /** {derlemeye giren yol: derleme anindaki blob SHA} */
  dosyalar: Record<string, string>
}

export interface ManifestKaydi {
  ad: string
  yol: string
  kaynak_kumesi: string[]
  kaynak_commit: string
  icerik_sha256: string
  kaynak: KaynakOzeti
}

export interface ArtefaktManifesti {
  surum: number
  kaynak_commit: string
  calisma_agaci: string
  artefaktlar: ManifestKaydi[]
}

export function manifestOku(): ArtefaktManifesti | null {
  try {
    const govde: ArtefaktManifesti = JSON.parse(git(['show', `HEAD:${ARTEFAKT_MANIFESTI}`]))
    return govde
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// PR KAPSAMI
// ---------------------------------------------------------------------------------------------------------------------------

/**
 * PR'ın değişen dosyaları: kanonik, POSIX, köke göreli yollar; okunamadıysa `null`.
 * Tek okuyucu `scripts/ci/dunya-durumu.cjs` `degisenYollariniOku`dur. Okuyucunun kendisi yüklenemese ya da fırlatsa da bu işlev
 * FIRLATMAZ, `null` döner (çağıran TAM denetime düşer).
 * ⚠Yerelde commit sonrası `HEAD^1..HEAD` yalnız SON commit'tir; çok commitli yerel dalda PR'ın tamamı için liste elle verilir.
 */
export function prDegisenleri(): string[] | null {
  try {
    const modul = createRequire(import.meta.url)(`${repoKoku()}/scripts/ci/dunya-durumu.cjs`) as {
      degisenYollariniOku: () => string[] | null
    }
    const d = modul.degisenYollariniOku()
    return Array.isArray(d) ? d : null
  } catch {
    return null
  }
}

/**
 * `tumu` kümesini PR'ın değişen dosyalarına göre daraltır.
 * @param tumu     tam küme
 * @param anahtar  bir öğenin değişen listedeki yol karşılığı (kanonik, POSIX, köke göreli)
 * @param degisen  testler için enjeksiyon; verilmezse `prDegisenleri()` okunur. Açık `null` = "okunamadı" (varsayılan DEVREYE GİRMEZ).
 * @returns `degisen` okunamadıysa `{ liste: tumu (aynen), tam: true }`; okunduysa `{ liste: tumu ∩ değişen (tumu sırasında), tam: false }`
 */
export function kapsamla<T>(
  tumu: T[],
  anahtar: (x: T) => string,
  degisen: string[] | null = prDegisenleri(),
): { liste: T[]; tam: boolean } {
  if (!Array.isArray(degisen)) return { liste: tumu, tam: true }
  const kume = new Set(degisen)
  return { liste: tumu.filter((x) => kume.has(anahtar(x))), tam: false }
}

/**
 * Kontrolün KENDİ girdileri: biri değişirse PR kolu TAM denetler. Bunlar kuralı ya da kuralın baktığı dondurma anahtarını
 * tanımlar; "ilgili girdi değişmedi" demek kuralın kendisi değişmişken anlamsızdır. Dünya koluna ve sayım modülüne dokunan PR
 * da böylece eski, tam denetimle karşılaşır.
 */
export const KENDI_GIRDILERI: readonly string[] = [
  'src/__tests__/conformance/uretilmis-artefakt-tazeligi.test.ts',
  'src/__tests__/conformance/uretilmis-artefakt-tazeligi-dunya.test.ts',
  'src/__tests__/conformance/uretilmis-artefakt-tazeligi.yardimci.ts',
  'scripts/hijyen/artefakt-bayatlik-sayim.cjs',
  'scripts/hijyen/tasiyici-anahtari.cjs',
  '.companion-tasiyici.json',
]

export interface PrKapsami {
  /** PR'ın değişen dosyaları; okunamadıysa `null` */
  degisen: string[] | null
  /** `true`: her PR-kolu kuralı TAM veriyle koşar (liste okunamadı ya da kontrolün kendi girdisi değişti) */
  tam: boolean
  /** İnsana: kapsam neden tam ya da dar (günlükte görünür; dışlama sessiz bir karardır) */
  sebep: string
}

export function prKapsami(degisen: string[] | null = prDegisenleri()): PrKapsami {
  if (!Array.isArray(degisen)) {
    return { degisen: null, tam: true, sebep: 'değişen dosyalar okunamadı: fail-closed, tam denetim' }
  }
  const kendi = kapsamla([...KENDI_GIRDILERI], (y) => y, degisen).liste
  if (kendi.length > 0) {
    return { degisen, tam: true, sebep: `kontrolün kendi girdisi değişti (${kendi.join(', ')}): tam denetim` }
  }
  return { degisen, tam: false, sebep: `${degisen.length} dosya değişti, kontrolün kendi girdilerine dokunulmadı` }
}

/** Kuralın girdilerinden biri PR'da değişti mi (ya da kapsam tam mı)? */
export function girdiDegisti(kapsam: PrKapsami, girdiler: string[]): boolean {
  if (kapsam.tam) return true
  return kapsamla(girdiler, (y) => y, kapsam.degisen).liste.length > 0
}

/**
 * AXIOM 3 (içerik özeti) kapsamı: PR'ın dokunduğu artefaktlar. MANİFEST de diff'teyse HEPSİ: karşılaştırmanın öbür ucu manifestteki
 * özettir; yalnız manifestteki bir özeti oynatan PR'da artefaktın kendisi diff'te olmaz ama karşılaştırma yine de kırılır.
 */
export function icerikKapsamindakiler(artefaktlar: ManifestKaydi[], kapsam: PrKapsami): ManifestKaydi[] {
  if (girdiDegisti(kapsam, [ARTEFAKT_MANIFESTI])) return artefaktlar
  return kapsamla(artefaktlar, (a) => a.yol, kapsam.degisen).liste
}

/**
 * INV-DOC-4b (parity) kapsamı: KAYNAĞI bu PR'da değişen artefaktlar. Bir artefaktın kaynağı manifestteki `kaynak.dosyalar`
 * anahtarlarıdır. MANİFEST diff'teyse HEPSİ: kayıtlı blob SHA'ları değişmiş olabilir.
 * Sayımın kendisi YENİDEN YAZILMAZ: sonuç `sayimModulu.sayimCekirdegi`ye bu daraltılmış manifestle verilir.
 */
export function kaynagiDegisenArtefaktlar(artefaktlar: ManifestKaydi[], kapsam: PrKapsami): ManifestKaydi[] {
  if (girdiDegisti(kapsam, [ARTEFAKT_MANIFESTI])) return artefaktlar
  const degisen = new Set(kapsam.degisen ?? [])
  return artefaktlar.filter((a) => Object.keys(a.kaynak?.dosyalar ?? {}).some((y) => degisen.has(y)))
}

/** Günlükte görünen TEK satır: PR kolu neyi neden denetledi. */
export function kapsamSatiri(
  kapsam: PrKapsami,
  s: { ilan: boolean; manifest: boolean; icerik: number; bayatlik: number; toplamArtefakt: number },
): string {
  return (
    `[INV-DOC · PR kolu] kapsam=${kapsam.tam ? 'TAM' : 'DAR'} (${kapsam.sebep}); ` +
    `ilan-izlenen=${s.ilan ? 'koştu' : 'girdisi değişmedi'} manifest=${s.manifest ? 'koştu' : 'girdisi değişmedi'} ` +
    `içerik-özeti=${s.icerik}/${s.toplamArtefakt} parity=${s.bayatlik}/${s.toplamArtefakt} artefakt; tam denetim: ` +
    'uretilmis-artefakt-tazeligi-dunya.test.ts (master push + zamanlı)'
  )
}

// ---------------------------------------------------------------------------------------------------------------------------
// KURALLAR: iki kol da aynı işlevi çağırır, fark yalnız verdiği veri kümesidir
// ---------------------------------------------------------------------------------------------------------------------------

export interface Kural {
  /** Boş = kural tutuyor. */
  ihlaller: string[]
  /** `expect(ihlaller, mesaj).toEqual([])` mesajı: sebep ve KOŞULACAK TAM KOMUT (kırmızı mesaj komutu basar). */
  mesaj: string
}

/** Kanarya: TAM veride en az `taban` kayıt var mı. Boş veriyle geçen kapı ölçmediği hâlde "geçti" der. */
export function kanarya(sayi: number, taban: number, ad: string, mesaj: string): Kural {
  return { ihlaller: sayi >= taban ? [] : [`${ad}: ${sayi} kayıt (en az ${taban} bekleniyor)`], mesaj }
}

export const ILAN_KANARYA_MESAJI =
  '.cc_docs.yaml okumasından 0 artefakt çıktı — ayrıştırma bozulmuş olmalı. ' +
  'Boş kapsamla geçen bir kapı, ölçmediği hâlde "geçti" der.'
export const MANIFEST_KANARYA_MESAJI = 'Manifest boş — boş listeyle geçen bir kapı ölçmediği hâlde "geçti" der.'
export const KAYNAK_HARITASI_KANARYA_MESAJI =
  'Manifestteki kaynak haritası boş — kapı ölçecek dosya bulamıyor. ' +
  'Boş haritayla geçen bir kapı, ölçmediği hâlde "geçti" der.'

/** Manifestteki toplam kaynak kaydı sayısı (kaynak haritası kanaryası). */
export function kaynakHaritasiToplami(manifest: ArtefaktManifesti | null): number {
  return (manifest?.artefaktlar ?? []).reduce((t, a) => t + Object.keys(a.kaynak?.dosyalar ?? {}).length, 0)
}

/** INV-DOC-3 · Kapı C: yaml'ın ilan ettiği her artefakt depoda izlenen bir dosya mı. */
export function kuralIlanIzlenen(ilan: string[], izlenen: ReadonlySet<string>): Kural {
  const eksik = ilan.filter((y) => !izlenen.has(y))
  return {
    ihlaller: eksik,
    mesaj:
      '.cc_docs.yaml şu artefaktları İLAN EDİYOR ama depoda YOKLAR:\n' +
      eksik.map((y) => `  · ${y}`).join('\n') +
      "\n\nBu, 2026-08-26'da yaşanan T020 kusurunun ta kendisi: TARİF depoya " +
      "girdi, ÜRÜN girmedi. Üretilen dosya geçici bir worktree'de doğup o " +
      'ağaçla birlikte ölmüş olabilir.\n\nÇÖZÜM:\n' +
      `  orion doc build\n  git add ${eksik.join(' ')}`,
  }
}

/**
 * INV-DOC-4 · Kapı A: artefakt manifesti depoda VAR (ölçülemedi ≠ geçti).
 *
 * ⭐MANİFEST DE BİR ARTEFAKTTIR VE COMMİT'LENMELİDİR.
 * Commit'lenmemiş bir manifest CI'da HİÇ YOKTUR; kapı ölçecek şey bulamaz
 * ve SESSİZCE YOK OLUR — kapatmaya çalıştığımız körlüğün ta kendisi.
 * Bu, orion deposunda CANLI ölçüldü (2026-08-26): manifest izlenmiyordu.
 */
export function kuralManifestVar(manifest: ArtefaktManifesti | null): Kural {
  return {
    ihlaller: manifest === null ? [ARTEFAKT_MANIFESTI] : [],
    mesaj:
      `${ARTEFAKT_MANIFESTI} depoda yok. Bu kapı onsuz HİÇBİR ŞEY ölçemez ve ` +
      '"ölçemedim, o hâlde geçtim" bu depoda YASAKTIR.\n\nÇÖZÜM:\n' +
      `  orion doc build\n  git add ${ARTEFAKT_MANIFESTI}`,
  }
}

/** Manifestteki her artefakt depoda izlenen bir dosya mı. */
export function kuralManifestIzlenen(manifest: ArtefaktManifesti | null, izlenen: ReadonlySet<string>): Kural {
  const eksik = (manifest?.artefaktlar ?? []).map((a) => a.yol).filter((y) => !izlenen.has(y))
  return {
    ihlaller: eksik,
    mesaj:
      'Manifest şu artefaktları kayda geçirmiş ama depoda YOKLAR:\n' + eksik.map((y) => `  · ${y}`).join('\n'),
  }
}

/**
 * ⭐AXIOM 3: depodaki artefaktın içeriği manifestteki özetle AYNI mı.
 *
 * NİÇİN BU AYAK ŞART (OPS şartı E1): "kaynak değişti mi" sorusu, kaynak
 * HİÇ DEĞİŞMEDEN ürünün bozulduğu vakayı GÖREMEZ. Birisi master'ı editörde
 * açıp kaydeder, bir betik üstüne yazar, ya da merge çakışması yanlış
 * çözülür — kaynak tarafı tertemizdir ve tazelik ölçümü yeşil kalır.
 * Manifest özeti ucuzdur ve bu körü tam olarak kapatır.
 *
 * `kayitlar` çağıranın kapsamıdır: dünya kolu hepsini, PR kolu `icerikKapsamindakiler` sonucunu verir.
 */
export function kuralIcerikOzeti(kayitlar: ManifestKaydi[], izlenen: ReadonlySet<string>): Kural {
  const uyusmayan: string[] = []
  for (const a of kayitlar) {
    if (!izlenen.has(a.yol)) continue // "manifestteki her artefakt izlenen" kuralı söylüyor
    const gercek = headIcerikOzeti(a.yol)
    if (gercek !== a.icerik_sha256) {
      uyusmayan.push(`  · ${a.yol}\n      manifest: ${a.icerik_sha256}\n      depoda:   ${gercek}`)
    }
  }
  return {
    ihlaller: uyusmayan,
    mesaj:
      `Depodaki artefakt manifestteki özetle UYUŞMUYOR:\n${uyusmayan.join('\n')}\n\n` +
      'İki olasılık var ve ikisi de düzeltilmeli:\n' +
      '  (a) artefakt ELLE düzenlendi — üretilen dosya elle değiştirilmez;\n' +
      '      kaynağı düzeltip yeniden üretin.\n' +
      '  (b) artefakt yeniden üretildi ama manifest tazelenmedi.\n\nÇÖZÜM:\n' +
      `  orion doc build\n  git add ${ARTEFAKT_MANIFESTI} <artefaktlar>`,
  }
}

/**
 * Manifest kayıtları eksiksiz mi (alan atlanarak kapı köreltilemez).
 * Bir kaydın `icerik_sha256`'sı boşsa içerik özeti karşılaştırması o artefakt
 * için sessizce hiçbir şey sormaz hâle gelirdi. Kaydın TAM olması kapının önkoşuludur.
 */
export function kuralKayitEksiksiz(manifest: ArtefaktManifesti | null): Kural {
  const bozuk = (manifest?.artefaktlar ?? []).filter(
    (a) =>
      !a.yol ||
      !a.icerik_sha256 ||
      !Array.isArray(a.kaynak_kumesi) ||
      a.kaynak_kumesi.length === 0,
  )
  return {
    ihlaller: bozuk.map((a) => a.yol || '(yolsuz kayıt)'),
    mesaj:
      'Manifest kaydı eksik alanlı — eksik alan, kapının o artefakt için ' +
      'sessizce hiçbir şey sormaması demektir.',
  }
}

/**
 * Kapı C ile Kapı A aynı kümeyi gösteriyor mu.
 * ⭐İKİ KAYNAK AYRIŞIRSA HANGİSİNİN DOĞRU OLDUĞU BİLİNMEZ.
 * yaml "şunu üretiyorum" der, manifest "şunu ürettim" der. Ayrışma, ya
 * üreticinin yaml'ı tam okumadığını ya da manifestin bayat olduğunu
 * gösterir; ikisi de kapının ölçtüğü şeyi sessizce daraltır.
 */
export function kuralIlanManifestAyni(ilan: string[], manifest: ArtefaktManifesti | null): Kural {
  const kayitli = new Set((manifest?.artefaktlar ?? []).map((a) => a.yol))
  const fark = [...new Set(ilan)].filter((y) => !kayitli.has(y))
  return {
    ihlaller: fark,
    mesaj:
      '.cc_docs.yaml ilan ediyor ama manifest kayda geçirmemiş:\n' +
      fark.map((y) => `  · ${y}`).join('\n') +
      "\n\nÜretici yaml'ı tam okumamış ya da manifest bayat. ÇÖZÜM: orion doc build",
  }
}

/**
 * Manifest derleme anında İZLENMEYEN kaynak taşımıyor mu.
 * Derleme anında commit'lenmemiş bir kaynak özete `IZLENMIYOR` olarak girer.
 * Depoya giren manifestte böyle bir kayıt varsa, artefakt yarım bir dünyadan
 * derlenmiş demektir: dosya sonradan commit'lenince özet değişir ve kapı
 * zaten kırmızı yanar — ama sebebini SÖYLEMEK daha iyidir.
 */
export function kuralIzlenmeyenKaynak(manifest: ArtefaktManifesti | null): Kural {
  const kirli: string[] = []
  for (const a of manifest?.artefaktlar ?? []) {
    for (const y of a.kaynak?.izlenmeyen ?? []) kirli.push(`  · ${a.yol} ← ${y}`)
  }
  return {
    ihlaller: kirli,
    mesaj:
      "Manifest, derleme anında commit'lenmemiş kaynaklar içeriyor:\n" +
      kirli.join('\n') +
      "\n\nÖnce kaynakları commit'leyin, SONRA `orion doc build` koşun.",
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// INV-DOC-4b · parity (dondurulmuş mod)
// ---------------------------------------------------------------------------------------------------------------------------

/**
 * BAĞIMSIZ HESAP — modülün dediğini tekrar etmek tautoloji olurdu. Sayım modülünden AYRI yazılmış, aynı soruyu soran ikinci
 * uygulama: paylaşılan tek uygulama iki yönde birden yanılabilir (§26). Bir kol modülün sayısıyla bunu çapraz doğrular.
 */
export function bagimsizBayatArtefaktlar(artefaktlar: ManifestKaydi[], bloblar: ReadonlyMap<string, string>): string[] {
  const bagimsiz: string[] = []
  for (const a of artefaktlar) {
    const kayitli = a.kaynak?.dosyalar ?? {}
    let sapan = 0
    for (const [yol, sha] of Object.entries(kayitli)) {
      if (bloblar.get(yol) !== sha) sapan += 1
    }
    if (sapan > 0) bagimsiz.push(a.yol)
  }
  return bagimsiz
}

/** Dondurulmuş modun gösterge satırları: kabul edilen boşluk SESSİZ olamaz. */
export function dondurulmusModSatirlari(olcum: Parameters<typeof sayimModulu.ozetSatiri>[0]): string {
  return (
    '[INV-DOC-4b] ' + tasiyici.durumSatiri(repoKoku()) + '\n' + '[INV-DOC-4b] ' + sayimModulu.ozetSatiri(olcum) + '\n'
  )
}

export function olculemediMesaji(sebep: string | undefined): string {
  return (
    `bayatlık ÖLÇÜLEMEDİ (${sebep ?? ''}) — ölçememek geçmek DEĞİLDİR; ` +
    'dondurulmuş mod "ölçmüyorum" demek değil, "bloklamıyorum" demektir'
  )
}

export function ayrisiyorMesaji(modulSayisi: number, bagimsizSayisi: number): string {
  return (
    `Modülün sayısı (${modulSayisi}) ile bu testin bağımsız hesabı ` +
    `(${bagimsizSayisi}) AYRIŞIYOR — tek kaynak iddiası çökmüş demektir.`
  )
}

/** Taşıyıcı AÇIKken bayat artefakt sayısı 0 olmalıdır; mesaj. */
export function tasiyiciAcikBayatMesaji(sayi: number, bayatAdlari: string[]): string {
  return (
    `Bayat artefakt ${sayi} ve taşıyıcı AÇIK — üretim çalışıyor, ` +
    `yani bu borç ÖDENEBİLİR ve bloklar.\nArtefaktlar:\n  ${bayatAdlari.join('\n  ')}`
  )
}

/**
 * Kaynak parity dökümü (insana: hangi dosyalar bayat). Bloklamaz; dünya kolunda yazdırılır.
 *
 * ⭐NİÇİN BLOB SHA, ATA-SOY DEĞİL — ÖLÇÜLDÜ (2026-08-26):
 * Depolar SQUASH MERGE kullanıyor; dal commit'leri master geçmişine HİÇ
 * girmiyor. `feat/t020-kume-masterlari` ucu `cd2cd16` içeriğiyle master'a
 * girdiği hâlde `git merge-base --is-ancestor cd2cd16 master` ÇIKIŞ 1
 * veriyor. Ata-soya dayanan bir kapı HER MERGE'DEN SONRA kırmızı yanardı.
 *
 * ⭐NİÇİN İLAN EDİLEN DİZİNİN AĞAÇ SHA'SI DA DEĞİL — o da ölçüldü:
 * `source_dirs` `[src, "."]` ve KÖK DİZİNİN ağaç SHA'sı HER COMMIT'TE
 * değişiyor (ecac1ca → 73f9bde; aradaki commit yalnız docs/ altına dokundu).
 * Ana master kalıcı bayat olurdu. Bu yüzden çözünürlük DOSYA düzeyinde.
 */
export function bayatlikDokumu(artefaktlar: ManifestKaydi[], bloblar: ReadonlyMap<string, string>): string[] {
  const bayat: string[] = []
  for (const a of artefaktlar) {
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
  return bayat
}

export function bayatlikDokumuMetni(bayat: string[]): string {
  return (
    `[INV-DOC-4b · dondurulmus mod] kaynaklari derlemeden SONRA degisen artefaktlar:\n` +
    bayat.join('\n') +
    `\n  ELLE TAZELEME: orion doc build --force-sync; git add docs/*_master.md ` +
    `${ARTEFAKT_MANIFESTI}\n  ⭐DURMA OLCUTU: "diff bos" DEGIL, bu kapinin YESILI. ` +
    `Bu zincir byte duzeyinde sabit noktaya HIC ulasmaz (compiled_at + source_commit ` +
    `her kosumda degisir) — URUN bunu 2026-09-04'te bedel odeyerek olctu.\n`
  )
}
