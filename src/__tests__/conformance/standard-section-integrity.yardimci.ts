import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { kapsamla } from './_ortak/pr-kapsami'

/**
 * INV-CETVEL-YAPI · ORTAK YARDIMCI (ALT-38i parça 2: kapı PR kolu ve DÜNYA kolu olarak ikiye bölündü).
 *
 * Test DEĞİLDİR (vitest yalnız `*.test.ts` toplar; aynı desen: `ci-test-secimi.yardimci.ts`,
 * `depo-dokum-kapisi.yardimci.ts`). İki kol bu dosyayı içe aktarır:
 *   · `standard-section-integrity.test.ts`        PR kolu: kendi fikstürleri + DEĞİŞEN cetveller + kanaryalar,
 *   · `standard-section-integrity-dunya.test.ts`  dünya kolu: TAM klasör (master push + zamanlı koşu).
 *
 * Bu dosya YALNIZ bu teste özgüdür (başlık deseni, bölüm ayıklayıcı, cetvel dosyaları, çapa, tarama işlevleri, kontrol
 * kodu listesi). PR'ın değişen dosyalarını okuyan ve kümeyi daraltan GENEL kısım ayrı dosyadadır:
 * `_ortak/pr-kapsami.ts` (`prDegisenleri`, `kapsamla`).
 *
 * NİÇİN KOPYA DEĞİL: önceki bölme (`taban-tazeligi` / `taban-tazeligi-dunya`) ortak kodu iki dosyada kopya
 * tutup bir "kayma testi" ile aynı kalmasını ölçüyordu. Burada ayıklayıcı (başlık deseni, tekillik anahtarı,
 * çapa deseni) TEK yerde yaşar: iki kol aynı kodu çalıştırır, birinin ötekinden ayrışması mümkün değildir.
 *
 * Aşağıdaki desen ve ayıklayıcı blokları `standard-section-integrity.test.ts`ten TAŞINDI, bayt bayt aynıdır
 * (yalnız `export` eklendi); gerekçe yorumları da kodla birlikte buraya geldi. `cetvelDosyalari` / `olculenler`
 * artık yol listesi alır (kapsamı çağıran belirler); tarama işlevleri (`mukerrerIhlalleri`, `sahipsizIhlalleri`,
 * `capaTara`) orijinal test gövdelerinin birebir karşılığıdır.
 */

export const KOK = 'docs/standards'

/**
 * Geniş sözlük — cetveller üç ayrı biçim kullanıyor ve üçü de meşru:
 *   `## 3. Başlık`  ·  `## 0) Başlık`  ·  `## 2.4 Başlık`  ·  `## D13 — Başlık`
 * Dar bir desen buranın %90'ını sessizce atlar; bu bir kez yaşandı (aşağıdaki
 * "kendi kapsamını ölçer" testinin varlık sebebi).
 */
export const BASLIK =
  /^(#{2,4})\s+(?:[^\p{L}\p{N}\s]+\s*)?(?:§\s*)?([A-ZÇĞİÖŞÜ]{0,6})[\s-]*(\d+(?:\.\d+)*(?:\.[a-zA-Z])?)\s*[.):\-—–]?\s/u

/**
 * ⭐REC-120 · DESEN İKİ YERDEN KÖRDÜ — ölçülerek bulundu, varsayımla değil (2026-09-03).
 *
 * **(1) BAŞTAKİ SÜSLEME.** Bu depoda başlıklar sık sık bir işaretle başlıyor
 * (`### ⭐D8.1`, `### ⚠D8.3`, `#### ✅D8.3 SONUÇ`). Eski desen ilk karakterin harf ya da
 * rakam olmasını bekliyordu, dolayısıyla bunların **hiçbirini görmüyordu.**
 *
 * Bedeli soyut değil: `deploy-build-skip-standard.md` içinde **`D8.3` İKİ KEZ tanımlıydı**
 * (satır 286 `⚠D8.3`, satır 315 `✅D8.3 SONUÇ`) ve bu kapı — *"aynı bölüm numarası iki kez
 * yazılmasın"* diye **tam bu dosyadaki `## D13` ikizlemesinden doğan** kapı — ikisini de
 * göremiyordu. Yani kapı, kendi doğuş sebebine kör kalmıştı.
 *
 * **(2) HARF SONEKİ.** `#### B2.1.b` gibi kimlikler (`notification-standard.md:60`) sayı
 * grubuna uymuyordu; kardeşi `### B2.1` ölçülürken o atlanıyordu. Aynı dosyada bir kısım
 * başlığın ölçülüp bir kısmının **sessizce** atlanması, bu depoda adı konmuş sınıftır:
 * ayırt etmeyen gösterge ölçüm değildir.
 *
 * ÖLÇÜM (üç senaryo, tüm cetveller): eski desen 743 başlık / 0 mükerrer · yeni desen
 * 747 başlık (**+4**) / **1 mükerrer** — yani genişleme gürültü değil, GERÇEK bir ihlal
 * açığa çıkardı. Sahipsiz alt bölüm her iki desende de 0.
 *
 * ⚠GENİŞLEME NİÇİN GÜRÜLTÜ ÜRETMEDİ: süsleme atlandıktan sonra kalan metin yine sayı
 * kuralına uymak zorunda. `### ⭐Dört ders` gibi **numarasız** düz metin başlıkları hâlâ
 * kapsam dışıdır — ki öyle kalmalı: numaralandırma kullanmayan başlığı numaraya zorlamak
 * kusur onarımı değil biçim dayatmasıdır (dosya başındaki gerekçe).
 */

export type Bolum = { seviye: number; no: string; satir: number; ust: string }

export function bolumleriCikar(metin: string): Bolum[] {
  const out: Bolum[] = []
  let ustL2 = ''
  metin.split(/\r?\n/).forEach((satir, i) => {
    const m = BASLIK.exec(satir)
    if (!m) return
    const seviye = m[1].length
    const no = `${m[2] ?? ''}${m[3]}`
    if (seviye === 2) ustL2 = no
    out.push({ seviye, no, satir: i + 1, ust: seviye === 2 ? '' : ustL2 })
  })
  return out
}

/**
 * ⭐REC-120 · TEKİLLİK ANAHTARI — kimlik ebeveynini KODLUYOR mu?
 *
 * ÖLÇÜLMÜŞ YANLIŞ ALARM (2026-09-01): `fleet-mechanism-standard.md`'de §23 ile §24'ün
 * **kendi** hükümleri vardı (`### HÜKÜM 1`, `### HÜKÜM 2`, …). Desen bunları `HÜKÜM1`
 * diye okuyor ve **dosya çapında** tekil sanıyordu; sonuç: farklı bölümlerin hükümleri
 * birbirine numara kilitliyordu. Sahadaki geçici çözüm §24'ün başlıklarını numarasız
 * yazmak olmuştu — yani cetvel, kapının kusuru yüzünden şeklini değiştirmişti. Kapı
 * belgeye biçim dayatmaya başladığında ölçüt olmaktan çıkar.
 *
 * ⚠DÜZ "hepsini bölüme göre kapsa" ÇÖZÜMÜ REDDEDİLDİ: `2.4` numarası `## 2` altında ve
 * `## 3` altında ayrı ayrı meşru sayılırdı, oysa ikincisi gerçek bir kusurdur. O yüzden
 * ayrım kimliğin KENDİSİNDEN okunur:
 *   · ebeveynini KODLAYAN kimlik (nokta içerir ya da üst kimliğin önekiyle başlar:
 *     `D8.3`, `2.4`, `B2.1.b`) → **DOSYA ÇAPINDA** tekil. Eski güç birebir korunur.
 *   · ÇIPLAK kimlik (`HÜKÜM 1`) → **en yakın ana bölüme** göre tekil.
 *
 * Ölçüldü: bu ayrım `D8.3` ikizlemesini yakalamaya devam ediyor (kayıp yok) ve HÜKÜM
 * fikstüründe çakışmayı 1'den 0'a indiriyor. İki kol aşağıda bunu ayrı ayrı kanıtlıyor.
 */
export function tekillikAnahtari(b: Bolum): string {
  const ebeveyniKodluyor = b.no.includes('.') || (b.ust !== '' && b.no.startsWith(b.ust))
  return ebeveyniKodluyor || b.seviye === 2 ? b.no : `${b.ust}::${b.no}`
}

/**
 * Cetvel dosyaları: `docs/standards/*.md` (yalnız bu dizinin doğrudan çocukları; alt dizin taranmaz).
 * Yollar POSIX ayraçlıdır (`docs/standards/x.md`): git'in değişen dosya listesiyle doğrudan karşılaştırılır.
 * `depo` deponun kökü (varsayılan: işlem dizini); fikstür testleri geçici bir kök verir.
 */
export function cetvelDosyalari(depo: string = process.cwd()): string[] {
  const kok = resolve(depo, KOK)
  return readdirSync(kok, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md'))
    .map((d) => `${KOK}/${d.name}`)
    .sort()
}

export type Olculen = { yol: string; bolumler: Bolum[] }

/** Verilen cetvellerin bölümleri. Numaralandırma kullanmayan cetvel kural dışıdır (dosya başındaki gerekçe) ve düşer. */
export function olculenler(yollar: readonly string[], depo: string = process.cwd()): Olculen[] {
  return yollar
    .map((yol) => ({
      yol,
      bolumler: bolumleriCikar(readFileSync(resolve(depo, yol), 'utf8')),
    }))
    // Numaralandırma kullanmayan cetvel kural dışıdır (yukarıdaki gerekçe).
    .filter((d) => d.bolumler.length > 0)
}

/** Aynı bölüm numarası bir cetvelde İKİ KEZ tanımlanmış mı? (doğuş vakası: `## D13`). Dosya başınadır. */
export function mukerrerIhlalleri(olculen: readonly Olculen[]): string[] {
  return olculen.flatMap(({ yol, bolumler }) => {
    const sayim = new Map<string, number[]>()
    for (const b of bolumler) {
      const k = tekillikAnahtari(b)
      sayim.set(k, [...(sayim.get(k) ?? []), b.satir])
    }
    return [...sayim.entries()]
      .filter(([, satirlar]) => satirlar.length > 1)
      .map(([no, satirlar]) => `${yol} → ${no} (satır ${satirlar.join(', ')})`)
  })
}

/** Ana bölümü olmayan alt bölüm (`X<n>.<m>`) var mı? Dosya başınadır. */
export function sahipsizIhlalleri(olculen: readonly Olculen[]): string[] {
  return olculen.flatMap(({ yol, bolumler }) => {
    const anahtarlar = new Set(bolumler.map((b) => b.no))
    return bolumler
      .filter((b) => b.seviye >= 3 && b.no.includes('.'))
      .filter((b) => !anahtarlar.has(b.no.slice(0, b.no.lastIndexOf('.'))))
      .map((b) => `${yol} → ${b.no} (satır ${b.satir})`)
  })
}

/** Başarısızlık iletileri: iki kol AYNI metni gösterir (okuyan hangi kolda kırıldığını dosya adından görür). */
export const MESAJ = {
  mukerrer:
    'mükerrer bölüm numarası. Kimlik ebeveynini kodluyorsa (D8.3, 2.4, B2.1.b) dosya ' +
    'çapında tekil olmalı; çıplak kimlik (HÜKÜM 1) yalnız kendi ana bölümünde tekildir.',
  sahipsiz: 'sahipsiz alt bölüm: ana bölümü yok',
  capa:
    'aynı kod kimliği bir cetvelde iki kez başlık olmuş: bir konunun iki tarifi. ' +
    'Biri güncellenir öteki kalır ve okuyan hangisine bakacağını bilemez. ' +
    'Numarayı değiştirmek bunu ÇÖZMEZ — blokları birleştirin.',
  capaKanarya: 'hiçbir başlıkta kod kimliği bulunamadı — ÇAPA deseni bozulmuş olabilir',
} as const

/**
 * ÇAPA KOLU (INV-CETVEL-YAPI · tekrar) — LEGAL'in 2026-08-20 isteği üzerine eklendi.
 *
 * ONLARIN SORUSU: mükerrer 3.6'yı yakaladık ama numarayı doğru artırsalardı aynı
 * mükerrerlik SESSİZ kalırdı. Kapının gerçek hedefi numara değil TEKRAR.
 *
 * ÜÇ TASARIM ÖLÇÜLDÜ (42 dosya, 557 başlık), İKİSİ ÇÜRÜDÜ:
 *   A · normalize edilmiş başlık metni birebir eşit → 0 bulgu, AMA gerçek vakayı
 *       YAKALAYAMIYOR (iki başlığın metni farklıydı). Boş sıfır, yanlış güven.
 *   B · sözcük kümesi Jaccard ≥ 0.5 → 4 bulgu ve DÖRDÜ DE MEŞRU (admin 8↔10.4,
 *       purchasing 10↔13.3, companion C4↔C5, admin 9↔10.5); üstelik gerçek vaka
 *       j≈0.45 ile eşiğin ALTINDA. Hem gürültü hem ıska.
 *   C · ÇAPA: başlıkta geçen KOD KİMLİĞİ (backtickli yol/dosya ya da çıplak /rota)
 *       aynı dosyada iki başlıkta geçiyorsa → tek bulgu = gerçek vaka, yanlış
 *       pozitif SIFIR, ve numara değişse de yakalar. KABUL EDİLEN.
 *
 * ⚠ BU DARALTMANIN KIRILGAN BİR BAĞIMLILIĞI VAR (ÜRÜN şeridi yakaladı, kayda geçiyorum):
 * yukarıdaki yanlış kırmızının temizlenmesi, o dosyada `2.6`'nın `###` ve `11.6`'nın `##`
 * olmasına — yani bir YAPISAL TUTARSIZLIĞA — dayanıyor. Biri o başlık düzeylerini
 * "düzeltirse" aynı çapa aynı düzeyde iki kez görünür ve kol yeniden yanlış kırmızı verir;
 * üstelik bu sefer HAKLI görünür. Yani kolun doğruluğu, düzeltilmesi gereken bir
 * tutarsızlığın DURMASINA bağlı. Bu rahatsız edici ve gizlenmemeli: düzey normalizasyonu
 * yapılacaksa önce bu kola ADIYLA muafiyet eklenmeli (şema tanımı ↔ sözleşme çifti meşrudur).
 *
 * MENZİL DÜRÜSTLÜĞÜ: 557 başlığın yalnız ~32'si çapa taşır. Bu kol DAR ama KESİN;
 * çapasız iki tarifi görmez. Dar-kesin, geniş-gürültülüye tercih edildi çünkü B'nin
 * dört yanlış kırmızısı kapıyı ilk gününde gürültüye çevirirdi.
 */
export const CAPA = /`([^`]+)`|(?<![\w`])(\/[a-z0-9][a-z0-9\-/[\]]{3,})/g

export function capalar(baslikMetni: string): string[] {
  const out = new Set<string>()
  for (const m of baslikMetni.matchAll(CAPA)) {
    const ham = (m[1] ?? m[2] ?? '').trim()
    if (ham.length < 4) continue
    // yalnız yol/dosya benzeri kimlikler: içinde / . veya _ geçmeli
    if (!/[/._]/.test(ham)) continue
    out.add(ham.replace(/\/+$/, '').toLowerCase())
  }
  return [...out]
}

/**
 * Çapa kolunun taraması: aynı BAŞLIK DÜZEYİNDE aynı kod kimliği iki başlıkta geçiyorsa ihlaldir.
 * `capaliBaslik`, taranan cetvellerde çapa taşıyan başlık sayısıdır: KANARYA. Sıfır "ihlal yok" değil
 * "hiçbir yere bakmadım" demektir (hiç çapa bulunmadıysa karşılaştırma boş kümede yapılmıştır).
 */
export function capaTara(yollar: readonly string[], depo: string = process.cwd()): { ihlaller: string[]; capaliBaslik: number } {
  const ihlaller: string[] = []
  let capaliBaslik = 0

  for (const yol of yollar) {
    // Çapa → aynı BAŞLIK DÜZEYİNDEKİ satırlar (düzey neden ayırt edici: yorum bloğunda).
    const harita = new Map<string, Map<number, number[]>>()
    readFileSync(resolve(depo, yol), 'utf8')
      .split(/\r?\n/)
      .forEach((satir, i) => {
        const m = /^(#{2,4})\s+(.*)$/.exec(satir)
        if (!m) return
        const seviye = m[1].length
        const c = capalar(m[2])
        if (c.length > 0) capaliBaslik++
        for (const x of c) {
          const seviyeler = harita.get(x) ?? new Map<number, number[]>()
          seviyeler.set(seviye, [...(seviyeler.get(seviye) ?? []), i + 1])
          harita.set(x, seviyeler)
        }
      })
    for (const [capa, seviyeler] of harita) {
      for (const satirlar of seviyeler.values()) {
        if (satirlar.length > 1) ihlaller.push(`${yol} → ${capa} (satır ${satirlar.join(', ')})`)
      }
    }
  }
  return { ihlaller, capaliBaslik }
}

// ─────────────────────────────────────────────────────────────────────────────
// PR KOLUNUN KAPSAMI — hangi cetveller taranır? (ALT-38i parça 2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bu kapının üç kuralı (mükerrer numara, sahipsiz alt bölüm, çapa tekrarı) DOSYA BAŞINADIR: bir cetvelin
 * ihlali yalnız o cetvelin içeriğinden doğar. Bu yüzden PR kapısında yalnız PR'ın DEĞİŞTİRDİĞİ cetveller
 * taranır; değişmeyen cetvelin ihlali PR'dan gelmez (başka bir dalın, ya da kapı gevşekken girmiş eski bir
 * kusurun bedelini suçsuz PR ödemesin). Tam klasör taraması DÜNYA kolundadır (master push + zamanlı koşu):
 * ölçülen CI geçmişi (karne, 2026-07-06..10-07): 13 kırmızı koşu, 12 dal, 11'i dünya olayı kümesinde
 * (aynı test ≥3 dalda 12 saat içinde kırmızı), 2'si izole (sonraki koşuda düzeldi: PR'ın kendi hatası).
 *
 * GÜVENLİ TARAF (fail-closed), kapsam hiçbir yolla BOŞ KÜMEYE düşmez, "ölçemedim" iken:
 *   · değişen dosya listesi okunamadıysa (`null`: git yok, `HEAD^1` yok, kesik ya da boş git çıktısı,
 *     okunamayan ortam dosyası) → TAM klasör taranır;
 *   · kontrolün kendi kodu değiştiyse (aşağıdaki liste) → TAM klasör taranır: desen genişleyince hiç
 *     değişmemiş bir cetvel de yeni ihlal verebilir, "dosya değişmedi" artık yeterli bir cevap değildir.
 * Boş küme YALNIZ "liste okundu ve hiçbir cetvele dokunulmadı" iken kullanılır.
 */
export const KONTROL_KODU: readonly string[] = [
  'src/__tests__/conformance/standard-section-integrity.test.ts',
  'src/__tests__/conformance/standard-section-integrity-dunya.test.ts',
  'src/__tests__/conformance/standard-section-integrity.yardimci.ts',
  // Değişen listeyi okuyan ve daraltan genel yardımcı ile onun okuyucusu: bozulurlarsa PR kolu sessizce boş kümeye daralırdı.
  'src/__tests__/conformance/_ortak/pr-kapsami.ts',
  'scripts/ci/dunya-durumu.cjs',
]

export type Kapsam = { yollar: string[]; tam: boolean; neden: string }

/**
 * Hangi cetveller taranır? Genel daraltma `_ortak/pr-kapsami.ts` `kapsamla`dır; bu işlev ona teste özgü kararı ekler
 * (kontrolün kendi kodu değiştiyse TAM klasör) ve nedeni yazar.
 * @param degisen PR'ın değişen dosyaları (kanonik, POSIX, köke göreli; `prDegisenleri()`) ya da `null` (ölçülemedi)
 * @param tum     tam klasörün cetvel yolları (`cetvelDosyalari()`)
 */
export function taramaKumesi(degisen: string[] | null, tum: readonly string[]): Kapsam {
  const kontrol = Array.isArray(degisen) ? KONTROL_KODU.find((y) => degisen.includes(y)) : undefined
  if (kontrol) return { yollar: [...tum], tam: true, neden: `kontrolün kendi kodu değişti (${kontrol}): TAM klasör` }
  // Kesişim `tum` ile alınır: silinen cetvel (diskte yok), alt dizindeki dosya ve .md olmayan yol kendiliğinden düşer.
  const k = kapsamla([...tum], (y) => y, degisen)
  if (k.tam) return { yollar: k.liste, tam: true, neden: 'değişen dosyalar okunamadı: TAM klasör (fail-closed, boş küme kullanılmaz)' }
  return {
    yollar: k.liste,
    tam: false,
    neden: k.liste.length > 0 ? `${k.liste.length} değişen cetvel` : 'PR hiçbir docs/standards/*.md cetveline dokunmadı: taranacak cetvel yok (TAM klasör dünya kolunda)',
  }
}
