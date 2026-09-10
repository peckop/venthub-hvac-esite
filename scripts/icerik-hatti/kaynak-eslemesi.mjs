#!/usr/bin/env node
/**
 * ADIM 3 — KAYNAK EŞLEMESİ: her teknik değer ↔ kaynak dizini (REC-212 F1, OPS emri 12:13Z)
 *
 * ── NİÇİN VAR
 * Paketin `kaynak_dosya` / `kaynak_sayfa` / `alinti` kolonları F1 koşumunda BOŞ bırakılmıştı.
 * Bu betik onları doldurur: 5168 teknik değerin her biri kaynak dizininde aranır ve
 * bulunma DURUMU sayıyla raporlanır. ⛔**PDF AÇILMAZ** (K15) — dizin satırı yeter.
 *
 * ── ⛔KANITSIZ DEĞER SİLİNMEZ, İŞARETLENİR
 * Kaynakta bulunamayan değer pakette KALIR; `kaynak_dosya` boş kalır ve `durum` kolonu
 * niçin boş olduğunu söyler. Silmek veriyi kaybettirirdi; sessizce bırakmak ise
 * kanıtlıyla kanıtsızı aynı görünüme sokardı.
 *
 * ── DÖRT DURUM (ölçülen ile ölçülemeyen AYRI)
 *   VAR              → ürünün kodu geçen bir sayfada değer de geçiyor (dosya+sayfa+alıntı)
 *   DEGER YOK        → ürünün sayfası bulundu ama değer o sayfalarda geçmiyor
 *   URUN KAYNAKTA YOK→ ürünün kodu hiçbir kaynak sayfasında yok; değer ÖLÇÜLEMEZ
 *   CELISIYOR        → alanın etiketi ürünün sayfasında var, yanındaki sayı(lar) paketteki
 *                      değerle uyuşmuyor. Yalnız ETİKET SÖZLÜĞÜ OLAN alanlarda ölçülür;
 *                      sözlüğü olmayan alanda çelişki "ÖLÇÜLMEDİ" sayılır ve raporda
 *                      AYRI yazılır — ölçülmeyeni "çelişki yok" diye saymak yalan olurdu.
 *
 * ── EŞLEŞME SAYI ÜZERİNDEN, METİN ARAMASIYLA DEĞİL
 * Kaynakta "1.500", "1 500", "1,5" aynı sayının farklı yazımlarıdır. Sayfa metnindeki her
 * sayı normalize edilip kümeye alınır, değer de normalize edilip o kümede aranır. Ham
 * altdize araması "150" değerini "1500" içinde bulur ve YANLIŞ KANIT üretirdi.
 *
 * KOŞUM: node scripts/icerik-hatti/kaynak-eslemesi.mjs --hedef=<paket> [--dizin=<jsonl>] [--yaz]
 *   --yaz olmadan: yalnız ölçüm raporu (paket CSV'sine dokunulmaz)
 * Çıkış: 0 geçti · 2 ÖLÇÜLEMEDİ (fail-closed). CANLIYA YAZMAZ.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const arg = (ad, vars) => process.argv.find(a => a.startsWith(`--${ad}=`))?.slice(ad.length + 3) || vars
const HEDEF = arg('hedef', 'katalog-paketi')
// ⛔MUTLAK YOL GÖMÜLMEZ (INV-MUTLAK-YOL-1): depo PUBLIC — kullanıcı adı taşıyan yol hem
// sızıntıdır hem de betiği sessizce TEK MAKİNEYE bağlar (CI'da ve başka ağaçta kırılır).
// Kaynak dizini bu deponun DIŞINDA (ingestor deposu), o yüzden yolu çağıran verir:
//   --dizin=<yol>  ya da  VENTHUB_INGESTOR=<ingestor kökü>
const INGESTOR = process.env.VENTHUB_INGESTOR
const DIZIN = arg('dizin', INGESTOR ? join(INGESTOR, 'kaynak-dizini', 'sayfalar.jsonl') : '')
if (!DIZIN) {
  console.error('ÖLÇÜLEMEDİ — kaynak dizini yolu verilmedi.')
  console.error('  --dizin=<sayfalar.jsonl> ya da VENTHUB_INGESTOR=<ingestor kökü>')
  process.exit(2)
}
const YAZ = process.argv.includes('--yaz')

if (!existsSync(DIZIN)) { console.error(`ÖLÇÜLEMEDİ — kaynak dizini YOK: ${DIZIN}`); process.exit(2) }

// ── CSV okuma (paket biçimi: ';' + BOM + CRLF, tırnaklı hücre)
const csvOku = (yol) => {
  const ham = readFileSync(yol, 'utf8').replace(/^\ufeff/, '')
  const satirlar = []
  let hucre = '', satir = [], tirnak = false
  for (let i = 0; i < ham.length; i++) {
    const c = ham[i]
    if (tirnak) {
      if (c === '"' && ham[i + 1] === '"') { hucre += '"'; i++ }
      else if (c === '"') tirnak = false
      else hucre += c
    } else if (c === '"') tirnak = true
    else if (c === ';') { satir.push(hucre); hucre = '' }
    else if (c === '\n') { satir.push(hucre); satirlar.push(satir); satir = []; hucre = '' }
    else if (c !== '\r') hucre += c
  }
  if (hucre || satir.length) { satir.push(hucre); satirlar.push(satir) }
  const bas = satirlar.shift()
  return satirlar.filter(s => s.some(v => v !== ''))
    .map(s => Object.fromEntries(bas.map((b, i) => [b, s[i] ?? ''])))
}

// ── SAYI NORMALİZASYONU
// "1.500" TR'de bin beş yüz, EN'de bir buçuktur. Hangisi olduğu METİNDEN bilinemez, o yüzden
// İKİ okuma da kümeye girer. Yanlış negatif (kanıtı kaçırmak) burada yanlış pozitiften
// (olmayan kanıtı uydurmaktan) daha az zararlıdır — ama ikisini de sayıyoruz.
const sayiVaryant = (ham) => {
  const s = String(ham).trim().replace(/\s/g, '')
  const c = new Set()
  const ekle = (x) => {
    const n = Number(x)
    if (Number.isFinite(n)) c.add(String(n))
  }
  ekle(s.replace(',', '.'))
  ekle(s.replace(/[.,]/g, ''))          // binlik ayraç okuması
  ekle(s.replace(/\./g, '').replace(',', '.'))
  return c
}
const SAYI_DESENI = /\d[\d.,]*/g
const sayfaSayilari = (metin) => {
  const k = new Set()
  for (const m of metin.match(SAYI_DESENI) || []) for (const v of sayiVaryant(m)) k.add(v)
  return k
}

// ── DEĞERİN METİNDEKİ YAZILI BİÇİMLERİ (konum bulmak için — küme üyeliği konum vermez)
const yaziliBicimler = (ham) => {
  const s = String(ham).trim()
  const c = new Set([s])
  const n = Number(s.replace(',', '.'))
  if (Number.isFinite(n)) {
    const tam = String(n)
    c.add(tam)
    c.add(tam.replace('.', ','))
    if (Number.isInteger(n) && Math.abs(n) >= 1000) {
      const g = String(Math.abs(n))
      const ayrilmis = g.replace(/\B(?=(\d{3})+(?!\d))/g, '#')
      for (const ay of ['.', ',', ' ']) c.add((n < 0 ? '-' : '') + ayrilmis.replaceAll('#', ay))
    }
  }
  return [...c].filter(Boolean)
}

// ── ⭐YAKINLIK ŞARTI — sayfada bulunmak KANIT DEĞİLDİR
// Sabotaj sınavı ölçtü (2026-09-09): değerlerin hepsi +7 kaydırılıp SAHTE yapıldığında
// bile satırların **%19,5'i "VAR" dedi** — çünkü bir katalog sayfası yüzlerce sayı taşır
// ve ürün kodu ile herhangi bir sayının aynı sayfada bulunması tesadüftür.
// Kapı: değer, ürün kodunun **YAKININDA** geçmeli (aynı tablo satırı mertebesi).
// Ölçüt keskindi ama EVREN yanlıştı — "sayfa" değil, "satır" doğru evren.
// Pencere 80 karakter: 40/80/120/200 taranıp ölçüldü — net sinyal (gerçek − tesadüf)
// 80'de doruğa çıkıyor ve gürültü oranı en düşük kalıyor.
const YAKINLIK = 80

// ── ALAN ETİKET SÖZLÜĞÜ — çelişki YALNIZ buradaki alanlarda ölçülebilir.
// Sözlük kasıtlı olarak DAR: uydurma etiket, uydurma çelişki üretir. Kapsam dışı alan
// "çelişki ÖLÇÜLMEDİ" sayılır ve raporda ayrı satırda görünür.
// Sözlük AYRI DOSYADA: `alan-etiket-sozlugu.json`. Betiğe gömülü liste iki sebeple
// bırakıldı — (1) aynı sözlük Design sözleşme v1'in kolon karşılıkları için de kullanılıyor,
// gömülü liste kopyalanır ve ayrışır; (2) etiket eklemek kod değişikliği olmamalı.
const SOZLUK_YOLU = new URL('./alan-etiket-sozlugu.json', import.meta.url)
let ETIKET = {}
try {
  const s = JSON.parse(readFileSync(SOZLUK_YOLU, 'utf8'))
  ETIKET = Object.fromEntries(Object.entries(s.alanlar).map(([a, v]) => [a, v.etiketler]))
} catch (e) {
  console.error(`ÖLÇÜLEMEDİ — alan-etiket sözlüğü okunamadı: ${e.message}`)
  process.exit(2)   // fail-closed: sözlüksüz koşum "çelişki yok" yanılsaması üretirdi
}

// ── VERİ
const teknik = csvOku(join(HEDEF, 'teknik-ozellikler.csv'))
const urunler = csvOku(join(HEDEF, 'urunler.csv'))
const kod = new Map(urunler.map(u => [u.sku, String(u.model_kodu || '').trim()]))

const sayfalar = []
for (const s of readFileSync(DIZIN, 'utf8').split('\n')) {
  if (!s.trim()) continue
  const k = JSON.parse(s)
  const tb = Array.isArray(k.tablo) ? JSON.stringify(k.tablo) : ''
  const govde = ((k.metin || '') + ' ' + tb)
  sayfalar.push({ dosya: k.dosya, sayfa: k.sayfa, govde, kucuk: govde.toLowerCase(), sayilar: sayfaSayilari(govde) })
}
if (!sayfalar.length) { console.error('ÖLÇÜLEMEDİ — dizin BOŞ'); process.exit(2) }

// ── ürün kodu → sayfalar (kelime sınırlı: "20210" kodu "120210" içinde SAYILMAZ)
const kacis = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// ── ⭐KODU OLMAYAN ÜRÜN İÇİN İKİNCİ EŞLEME: AD (OPS hükmü 12:32Z-b)
// Bu sabah 5 üründe uydurma model kodu silindi; kodları NULL olduğu için ilk koşumda
// arama HİÇ YAPILAMADI. Ama ürün kaynakta olabilir — kodla değil ADIYLA. Ad normalize
// edilir (boşluk/tire/nokta eşdeğer sayılır: kaynakta "CA-IL 8060", pakette "CA IL 8060")
// ve marka adı düşürülür. Eşleşme en uzun parçadan başlar, üç parçaya kadar KISALTILIR;
// üçün altına inilmez — "8060" tek başına ayırt edici değildir ve uydurma kanıt üretir.
const sadeAd = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const sayfaSade = new Map(sayfalar.map(p => [p, sadeAd(p.govde)]))
const adIleAra = (ad, marka) => {
  let parca = sadeAd(ad).split(' ').filter(Boolean)
  if (marka) { const m = sadeAd(marka); if (parca[0] === m) parca = parca.slice(1) }
  // Alt sınır 2: kaynak bazı ürünleri MODEL MODEL değil SERİ olarak anıyor — CA-RM belgesi
  // "VORT CA RM ES · Diameters 100-125-150-160-200 mm" diyor, yani model adı ile ölçü AYRI
  // yerlerde. Üç parça ("ca rm 100") hiçbir sayfada geçmiyor, iki parça ("ca rm") geçiyor.
  // İki parçaya inmek yanlış eşleşme riskini artırır; bu yüzden o eşleşme AYRI işaretlenir
  // (`aile duzeyi`) ve tesadüf tabanı her koşumda riski ÖLÇER — beyan değil, sayı.
  for (let n = parca.length; n >= 2; n--) {
    const aday = parca.slice(0, n).join(' ')
    const aileDuzeyi = n <= 2
    // Yakınlık ölçümü HAM metin üzerinde yapıldığı için çapa da ham metinde bulunmalı:
    // normalize metindeki konum ham metne birebir düşmez (uzunluk değişir). Çapa =
    // ad parçasındaki en uzun sayı (ör. "8060") — ürünün sayfadaki fiziksel yeri odur.
    const capa = aday.split(' ').filter(x => /^\d+$/.test(x)).sort((a, b) => b.length - a.length)[0]
    // Sayı çapası yoksa (ör. "ca rm") adın KENDİSİ çapa olur: ham metinde boşluk/tire
    // toleranslı aranır — kaynakta "CA RM" da geçebiliyor, "CA-RM" da.
    const capaRe = capa
      ? new RegExp(`(?<![\\w-])${capa}(?![\\w-])`, 'g')
      : new RegExp(aday.split(' ').map(kacis).join('[\\s\\-]*'), 'gi')
    const bulunan = []
    for (const p of sayfalar) {
      if (!sayfaSade.get(p).includes(aday)) continue
      capaRe.lastIndex = 0
      const yerler = [...p.govde.matchAll(capaRe)].map(m => m.index)
      if (yerler.length) bulunan.push({ ...p, kodYerleri: yerler, adEslesmesi: aday, aileDuzeyi })
    }
    if (bulunan.length) {
      // ⭐AİLE DÜZEYİNDE DOĞRU SAYFAYI SEÇ — ölçüldü ve düzeltildi (2026-09-10)
      // "ca rm" iki sayfada geçiyor: s.23 kanal serisi (IPX7), s.24 çatı serisi (IP45).
      // Kısaltma ÖN EKten yapıldığı için "rf" gibi ORTADAKİ ayırt edici parça düşüyor ve
      // ilk sayfa seçiliyordu — çatı fanı için kanal fanının sayfası kanıt gösteriliyordu.
      // Yanlış sayfa, yanlış kanıttır. Sayfalar adın KALAN parçalarına göre puanlanır.
      const kalan = parca.slice(n)
      if (kalan.length) {
        // NOT: `bulunan` içindeki nesneler sayfanın KOPYASIDIR ({...p}), o yüzden
        // `sayfaSade` Map'inde anahtarları YOKTUR — puanı gövdeden yeniden türetiyoruz.
        // (İlk yazımda Map'ten okunuyordu; sessizce undefined dönüyor ve sıralama hiç
        // çalışmıyordu. Sessiz başarısızlık, yanlış sayfayı kanıt diye gösteriyordu.)
        const puan = (p) => {
          const s = sadeAd(p.govde)
          return kalan.filter(x => new RegExp(`(?<![\\w])${kacis(x)}(?![\\w])`).test(s)).length
        }
        bulunan.sort((a, b) => puan(b) - puan(a))
      }
      return bulunan
    }
  }
  return []
}

const urunSayfa = new Map()
const adIleBulunan = new Set()
const skuAd = new Map(urunler.map(u => [u.sku, u]))
for (const [sku, k] of kod) {
  if (!k) {
    const u = skuAd.get(sku)
    const bulunan = adIleAra(u?.ad, u?.marka)
    if (bulunan.length) adIleBulunan.add(sku)
    urunSayfa.set(sku, bulunan)
    continue
  }
  const re = new RegExp(`(?<![\\w-])${kacis(k)}(?![\\w-])`, 'g')
  const bulunan = []
  for (const p of sayfalar) {
    re.lastIndex = 0
    const yerler = []
    let m
    while ((m = re.exec(p.govde))) yerler.push(m.index)
    if (yerler.length) bulunan.push({ ...p, kodYerleri: yerler })
  }
  // ⭐KOD BULAMADIYSA AD İLE İKİNCİ TUR — kural genişletildi (2026-09-10, ödenmiş ders)
  // Bu kural önce YALNIZ kodu olmayan ürünlerde çalışıyordu. Ama ürünün kodu OLMASI, o kodun
  // KAYNAKTA bulunacağı anlamına gelmez: `16257…16281` Avensair SİPARİŞ kodlarıdır ve
  // üreticinin kendi belgesi onları taşımaz. Sekiz CA-RM ürünü tam bu yüzden "kaynakta yok"
  // sayıldı — oysa belge elimizdeydi (42 sayfa) ve ürünler s.23/24'te yazılıydı.
  // Kural doğruydu, KAPSAMI DARDI.
  if (!bulunan.length) {
    const u = skuAd.get(sku)
    const adla = adIleAra(u?.ad, u?.marka)
    if (adla.length) { adIleBulunan.add(sku); urunSayfa.set(sku, adla); continue }
  }
  urunSayfa.set(sku, bulunan)
}

// Değerin sayfadaki konumları — kelime sınırlı, sayının içindeki sayıyı saymaz
// ("150", "1500"ün içinde bulunursa yanlış kanıt olurdu).
const degerYerleri = (govde, bicim) => {
  const yer = []
  const re = new RegExp(`(?<![\\d.,])${kacis(bicim)}(?![\\d])`, 'g')
  let m
  while ((m = re.exec(govde))) yer.push(m.index)
  return yer
}

// ── EŞLEME
const alinti = (govde, iz) => {
  const i = govde.indexOf(iz)
  if (i < 0) return ''
  return govde.slice(Math.max(0, i - 80), i + 120).replace(/\s+/g, ' ').trim().slice(0, 200)
}
// ── ⭐TÜREV DEĞER KAYNAKTA ARANMAZ (OPS teşhis emri 12:25Z sonrası, ölçüldü)
// İlk teşhiste "DEGER YOK" kovasının tepesinde `erp_compliant: true` (174),
// `pq_curve: [[0,353],…]` (132) ve `max_delivery_ls: 27.78` (156) çıktı. Bunların hiçbiri
// katalogda YAZMAZ: biri boolean bir hüküm, biri çizilmiş eğrinin sayısallaştırılmışı,
// biri m³/h değerinden BÖLÜNEREK üretilmiş. "Kaynakta bulunamadı" demek onları kusur
// gibi gösterir ve OLMAYAN bir iş doğurur — oysa doğru cevap "orada aranmaz"dır.
// Ölçüt uydurulmaz, ÖLÇÜLÜR: birim türevi, kardeş alanla bölme sınanarak doğrulanır.
const TUREV_BOLME = { max_delivery_ls: ['max_delivery_m3h', 3.6] }
const turevMi = (t, ayniUrununAlanlari) => {
  const d = String(t.deger || '').trim()
  if (d === 'true' || d === 'false') return 'boolean hüküm — metinde geçmez'
  if (d.startsWith('[') || d.startsWith('{')) return 'yapılandırılmış değer (eğri/dizi)'
  const kural = TUREV_BOLME[t.alan]
  if (kural) {
    const kaynakDeger = Number(String(ayniUrununAlanlari.get(kural[0]) || '').replace(',', '.'))
    const bu = Number(d.replace(',', '.'))
    if (Number.isFinite(kaynakDeger) && Number.isFinite(bu) && bu > 0
        && Math.abs(kaynakDeger / kural[1] - bu) / bu < 0.01) {
      return `${kural[0]} ÷ ${kural[1]} — birim türevi (ölçüldü)`
    }
  }
  return null
}

const esle = (girdi) => {
// Ürün başına alan tablosu: türev sınaması kardeş alanı okumak zorunda.
const urunAlan = new Map()
for (const t of girdi) {
  if (!urunAlan.has(t.sku)) urunAlan.set(t.sku, new Map())
  urunAlan.get(t.sku).set(t.alan, t.deger)
}
const sonuc = []
const sayim = { VAR: 0, TUREV: 0, 'DEGER YOK': 0, 'KOD YOK': 0, 'URUN KAYNAKTA YOK': 0, CELISIYOR: 0 }
let celiskiOlculmedi = 0
const celiskiListesi = []

for (const t of girdi) {
  const adaylar = urunSayfa.get(t.sku) || []
  const deger = String(t.deger || '').trim()

  // Türev önce sınanır: kaynakta ARANMAYAN değeri "bulunamadı" saymak yanlış iş doğurur.
  const turev = turevMi(t, urunAlan.get(t.sku) || new Map())
  if (turev) {
    sayim.TUREV++
    sonuc.push({ ...t, durum: 'TUREV', kaynak_tur: `turev(${turev.split(' ')[0]})`,
      kaynak_dosya: '', kaynak_sayfa: '', alinti: turev })
    continue
  }
  if (!adaylar.length) {
    // İKİ AYRI SEBEP, İKİ AYRI KOVA: kodu OLMAYAN ürün ile kodu OLUP kaynakta bulunmayan
    // ürün aynı şey değildir. Birincisi arama hiç YAPILAMADI demek (bu sabah 5 üründe
    // uydurma kimlik silindi, kod NULL oldu); ikincisi arandı ve BULUNAMADI demek.
    const kodsuz = !kod.get(t.sku)
    const d = kodsuz ? 'KOD YOK' : 'URUN KAYNAKTA YOK'
    sayim[d]++
    sonuc.push({ ...t, durum: d, kaynak_tur: kodsuz ? 'kodsuz, adla da bulunamadi' : '',
      kaynak_dosya: '', kaynak_sayfa: '',
      alinti: kodsuz ? 'model kodu yok — adla ikinci arama da sonuç vermedi' : '' })
    continue
  }
  const sayisal = /^-?\d[\d.,]*$/.test(deger)
  const bicimler = sayisal ? yaziliBicimler(deger) : (deger ? [deger] : [])
  let bulundu = null, iz = '', enYakin = Infinity
  for (const p of adaylar) {
    for (const b of bicimler) {
      const yerler = sayisal ? degerYerleri(p.govde, b)
        : [...p.kucuk.matchAll(new RegExp(kacis(b.toLowerCase()), 'g'))].map(m => m.index)
      for (const y of yerler) {
        // Kanıt = değerin ürün koduna UZAKLIĞI. En yakın olanı seçeriz ki alıntı
        // gerçekten o ürünün satırından gelsin, sayfanın rastgele bir yerinden değil.
        const d = Math.min(...p.kodYerleri.map(k => Math.abs(k - y)))
        if (d < enYakin) { enYakin = d; bulundu = p; iz = b }
      }
    }
  }
  if (enYakin > YAKINLIK) { bulundu = null }
  if (bulundu) {
    sayim.VAR++
    // kaynak_tur: kanıtın NASIL kurulduğu. "Bulundu" yetmez — kodla mı, adla mı, türev mi
    // bulunduğu okuyanın hükmünü değiştirir (OPS hükmü 12:32Z-a).
    sonuc.push({ ...t, durum: 'VAR',
      // Aile düzeyi eşleşme AYRI ADLA anılır: o değer ürünün kendi satırından değil,
      // serinin ortak beyanından geliyor (K8 föy kalıbı). Aynı kolonda "model kodu" ile
      // yan yana durursa okuyan ikisini eşit kanıt sanar.
      kaynak_tur: bulundu.adEslesmesi
        ? (bulundu.aileDuzeyi ? `aile duzeyi ("${bulundu.adEslesmesi}")` : `ad ("${bulundu.adEslesmesi}")`)
        : 'model kodu',
      kaynak_dosya: bulundu.dosya, kaynak_sayfa: bulundu.sayfa,
      alinti: alinti(bulundu.govde, iz) })
    continue
  }
  // Değer bulunamadı — ÇELİŞKİ mi, yoksa sadece yok mu? Yalnız etiket sözlüğü olan alanda ayırt edilir.
  const etiketler = ETIKET[t.alan]

  // ── METİN ALANINDA ÇELİŞKİ: aynı BİÇİMDE başka bir değer var mı?
  // `ip_rating` sayısal değil, o yüzden sayısal çelişki kuralı onu hiç görmüyordu — ve
  // gerçek bir çelişki (pakette IPX5, kaynakta IP45) "DEGER YOK" diye geçiyordu.
  // Ölçüt dar tutulur: değerin kendi biçim deseni (ör. `IP` + son ek) sayfada BAŞKA bir
  // değerle karşılanıyorsa çelişkidir. Etiket kelimesi aramak burada işe yaramaz —
  // "ip" her sayfada geçer, bu da uydurma çelişki üretirdi.
  // SINIR: yalnız KISA, KODSU değer (IPX5, IP45). Uzun serbest metin —
  // "ATEX Zone II, category 3 G, ATEX directive 94/9/CE" gibi — bu desene takılıp
  // ALTI YANLIŞ ÇELİŞKİ üretti: kaynakta "ATEX" geçiyor diye "farklı değer" sayıldı.
  // Bir cümle, bir kod değildir; desen karşılaştırması yalnız kod biçimli değerde geçerli.
  if (!sayisal && deger && deger.length <= 8 && !deger.includes(' ')
      && /^[A-Za-z]{2,4}[\dXx]/.test(deger)) {
    // ⛔ÖNEKTEKİ `X` HARF DEĞİL, JOKERDİR. `IPX5`ten önek "IPX" almak, kaynaktaki `IP45`i
    // hiç aramamak demekti — ve ölçüm bu yüzden yanlış sayfayı (IPX7 geçen s.23) kanıt
    // gösteriyordu. `IPX5` ile `IP45` aynı ailenin iki değeridir; ortak önek **IP**'dir.
    const onek = deger.match(/^[A-Za-z]+?(?=[Xx]?[\dXx])/)?.[0] || deger.match(/^[A-Za-z]{2}/)[0]
    const desen = new RegExp(`(?<![\\w-])${kacis(onek)}[\\dXx][\\dXx]?(?![\\w-])`, 'gi')
    for (const p of adaylar) {
      const bulunanlar = [...new Set((p.govde.match(desen) || []).map(x => x.toUpperCase()))]
      const farkli = bulunanlar.filter(x => x !== deger.toUpperCase())
      if (bulunanlar.length && !bulunanlar.includes(deger.toUpperCase()) && farkli.length) {
        sayim.CELISIYOR++
        celiskiListesi.push({ sku: t.sku, urun: t.urun, alan: t.alan, paket_degeri: deger,
          sinif: `metin: kaynakta ${farkli.join('/')}`, kaynak_dosya: p.dosya, kaynak_sayfa: p.sayfa })
        sonuc.push({ ...t, durum: 'CELISIYOR', kaynak_tur: 'bicim deseni',
          kaynak_dosya: p.dosya, kaynak_sayfa: p.sayfa,
          alinti: `kaynakta ${farkli.join('/')}, pakette ${deger}` })
        break
      }
    }
    if (sonuc.length && sonuc[sonuc.length - 1].sku === t.sku
        && sonuc[sonuc.length - 1].alan === t.alan) continue
  }

  if (etiketler && sayisal) {
    const etiketli = adaylar.find(p => etiketler.some(e => p.kucuk.includes(e)))
    if (etiketli) {
      // ── ÇELİŞKİ SINIFLANDIRMASI (makine, gözle değil — OPS emri 12:25Z)
      // Ürün kodunun yakınındaki sayılar toplanır ve paket değeriyle ORANLANIR. Her sınıf
      // FARKLI bir işe götürür: birim düzeltmesi toplu kuralla çözülür, gerçek çelişki
      // tek tek bakılır. Karıştırılırsa 299 satırın hepsi "elle incele" olur.
      const yakinSayilar = []
      for (const p of adaylar) {
        for (const m of p.govde.matchAll(/\d[\d.,]*/g)) {
          if (Math.min(...p.kodYerleri.map(k => Math.abs(k - m.index))) <= YAKINLIK) {
            const n = Number(String(m[0]).replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'))
            if (Number.isFinite(n) && n > 0) yakinSayilar.push(n)
          }
        }
      }
      const bu = Number(deger.replace(',', '.'))
      let sinif = 'gercek celiski'
      if (Number.isFinite(bu) && bu > 0 && yakinSayilar.length) {
        const oran = yakinSayilar.map(n => n / bu)
        if (oran.some(o => Math.abs(o - 3.6) / 3.6 < 0.02 || Math.abs(o - 1 / 3.6) * 3.6 < 0.02))
          sinif = 'birim (m3/h ↔ l/s)'
        else if (oran.some(o => Math.abs(o - 1) < 0.02)) sinif = 'yuvarlama'
        else if (oran.some(o => [10, 100, 1000, 0.1, 0.01, 0.001].some(k => Math.abs(o - k) / k < 0.02)))
          sinif = 'olcek (10 kati)'
        else if (yakinSayilar.filter(n => n !== bu).length > 3) sinif = 'ayni alanda cok deger'
      }
      sayim.CELISIYOR++
      celiskiListesi.push({ sku: t.sku, urun: t.urun, alan: t.alan, paket_degeri: deger,
        sinif, kaynak_dosya: etiketli.dosya, kaynak_sayfa: etiketli.sayfa })
      sonuc.push({ ...t, durum: 'CELISIYOR', kaynak_tur: 'etiket yakini', kaynak_dosya: etiketli.dosya,
        kaynak_sayfa: etiketli.sayfa, alinti: `çelişki sınıfı: ${sinif}` })
      continue
    }
  }
  if (!etiketler) celiskiOlculmedi++
  sayim['DEGER YOK']++
  sonuc.push({ ...t, durum: 'DEGER YOK', kaynak_tur: '', kaynak_dosya: '', kaynak_sayfa: '', alinti: '' })
}
return { sonuc, sayim, celiskiOlculmedi, celiskiListesi }
}

const { sonuc, sayim, celiskiOlculmedi, celiskiListesi } = esle(teknik)

// ── KAPI: hiçbir satır kaybolmamalı (fail-closed)
if (sonuc.length !== teknik.length) {
  console.error(`ÖLÇÜLEMEDİ — girdi ${teknik.length}, çıktı ${sonuc.length}`)
  process.exit(2)
}

// ── ⭐TESADÜF TABANI — rakam kendi güvenilirliğini söylemeli
// Aynı eşleme, değerlerin hepsi kaydırılmış SAHTE bir kopya üzerinde koşulur. Oradan çıkan
// "VAR" sayısı, yöntemin gürültü tabanıdır: bu kadarı kanıt değil, tesadüftür. Taban
// yazılmadan verilen bir "%X kanıtlı" rakamı, okuyanı olduğundan emin yapar.
// (Sabotaj sınavı kalıbı: kapı, YEŞİL tabanı bozunca kırmızıya dönerek ayırt ettiğini kanıtlar.)
const kaydir = (d) => {
  const n = Number(String(d).replace(',', '.'))
  if (!Number.isFinite(n)) return d
  return Number.isInteger(n) ? String(n + 7) : String(Math.round((n + 0.7) * 100) / 100)
}
const sahte = teknik.map(t => (/^-?\d[\d.,]*$/.test(String(t.deger || '').trim())
  ? { ...t, deger: kaydir(t.deger) } : t))
const taban = esle(sahte).sayim.VAR
const netOran = sayim.VAR ? ((sayim.VAR - taban) / sayim.VAR * 100).toFixed(1) : '0.0'

const yuzde = (n) => `${((n / teknik.length) * 100).toFixed(1)}%`
console.log(`KAYNAK EŞLEMESİ — ${teknik.length} teknik değer · ${sayfalar.length} kaynak sayfası`)
for (const [k, v] of Object.entries(sayim)) console.log(`  ${k.padEnd(18)} ${String(v).padStart(5)}  ${yuzde(v)}`)
console.log(`  (çelişki ÖLÇÜLMEDİ: ${celiskiOlculmedi} satır — alanın etiket sözlüğü yok)`)
console.log(`\nTESADÜF TABANI (sahte değerlerle aynı koşum): VAR ${taban}`)
console.log(`  → "VAR" satırlarının ~%${(taban / sayim.VAR * 100).toFixed(1)}'i tesadüf olabilir.`)
console.log(`  → GERÇEK KANIT payı: %${netOran} · ${sayim.VAR - taban} satır`)
// ── ARANABİLİR EVREN: türev değer ve kodsuz ürün kaynakta ARANMAZ. Oranı ham 5168
// üzerinden vermek yöntemi olduğundan kötü gösterir — evren düzeltmesi bu hattın
// tekrar eden dersi (§6.6 ve "ölçüt keskin ama evren yanlış").
const aranabilir = teknik.length - sayim.TUREV - sayim['KOD YOK']
console.log(`\nARANABİLİR EVREN: ${aranabilir} (${teknik.length} − türev ${sayim.TUREV} − kodsuz ${sayim['KOD YOK']})`)
console.log(`  → bu evrende VAR oranı: %${(sayim.VAR / aranabilir * 100).toFixed(1)}`)

// \u2500\u2500 TE\u015eH\u0130S (--teshis): say\u0131lar ne DEMEK \u2014 OPS emri 12:25Z
// Toplam rakam "ne kadar" der, "ni\u00e7in" demez. D\u00f6rt kova ayr\u0131 ayr\u0131 a\u00e7\u0131l\u0131r; her biri
// farkl\u0131 bir i\u015fe g\u00f6t\u00fcr\u00fcr ve kar\u0131\u015ft\u0131r\u0131l\u0131rsa yanl\u0131\u015f i\u015fi do\u011fururlar.
if (process.argv.includes('--teshis')) {
  const say = (liste, anahtar) => {
    const m = new Map()
    for (const r of liste) m.set(anahtar(r), (m.get(anahtar(r)) || 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }
  const marka = (sku) => String(sku).split('-')[0]

  const yokDeger = sonuc.filter(r => r.durum === 'DEGER YOK')
  const yokUrun = sonuc.filter(r => r.durum === 'URUN KAYNAKTA YOK')

  console.log('\n\u2550\u2550\u2550 TE\u015eH\u0130S \u2550\u2550\u2550')
  console.log(`\n\u25b8 DEGER YOK (${yokDeger.length}) \u2014 ilk 10 alan:`)
  for (const [a, n] of say(yokDeger, r => r.alan).slice(0, 10)) console.log(`    ${String(n).padStart(4)}  ${a}`)
  console.log(`  marka da\u011f\u0131l\u0131m\u0131:`)
  for (const [m, n] of say(yokDeger, r => marka(r.sku))) console.log(`    ${String(n).padStart(4)}  ${m}`)

  console.log(`\n\u25b8 URUN KAYNAKTA YOK (${yokUrun.length}) \u2014 ka\u00e7 AYRI \u00fcr\u00fcn:`)
  const urunKume = new Map()
  for (const r of yokUrun) urunKume.set(r.sku, (urunKume.get(r.sku) || 0) + 1)
  console.log(`    ${urunKume.size} \u00fcr\u00fcn \u00b7 ${yokUrun.length} de\u011fer`)
  console.log('  \u00fcr\u00fcn ba\u015f\u0131na (kod ile):')
  for (const [sku, n] of [...urunKume].sort((a, b) => b[1] - a[1])) {
    console.log(`    ${String(n).padStart(3)} de\u011fer \u00b7 ${sku} \u00b7 kod="${kod.get(sku) || '(YOK)'}"`)
  }

  console.log(`\n\u25b8 CELISIYOR (${celiskiListesi.length}) \u2014 SINIF da\u011f\u0131l\u0131m\u0131 (her s\u0131n\u0131f ayr\u0131 i\u015fe g\u00f6t\u00fcr\u00fcr):`)
  for (const [a, n] of say(celiskiListesi, r => r.sinif)) console.log(`    ${String(n).padStart(4)}  ${a}`)
  console.log('  alan da\u011f\u0131l\u0131m\u0131:')
  for (const [a, n] of say(celiskiListesi, r => r.alan)) console.log(`    ${String(n).padStart(4)}  ${a}`)
}

if (YAZ) {
  const BOM = '\ufeff'
  const hucre = (v) => {
    if (v == null) return ''
    let s = String(v).replace(/\r?\n/g, ' ').trim()
    return (s.includes(';') || s.includes('"')) ? '"' + s.replace(/"/g, '""') + '"' : s
  }
  const BAS = ['sku', 'urun', 'alan', 'deger', 'durum', 'kaynak_tur', 'kaynak_dosya', 'kaynak_sayfa', 'alinti']
  writeFileSync(join(HEDEF, 'teknik-ozellikler.csv'),
    BOM + [BAS.join(';'), ...sonuc.map(r => BAS.map(b => hucre(r[b])).join(';'))].join('\r\n') + '\r\n', 'utf8')
  const CB = ['sku', 'urun', 'alan', 'paket_degeri', 'sinif', 'kaynak_dosya', 'kaynak_sayfa']
  writeFileSync(join(HEDEF, 'celiski-listesi.csv'),
    BOM + [CB.join(';'), ...celiskiListesi.map(r => CB.map(b => hucre(r[b])).join(';'))].join('\r\n') + '\r\n', 'utf8')
  // MANIFEST bölümü — ÜRETİLİR, idempotent (aynı koşum dosyayı büyütmez).
  const mYol = join(HEDEF, 'MANIFEST.md')
  if (existsSync(mYol)) {
    const BASLIK = '## Kaynak eşlemesi (teknik-ozellikler.csv · durum kolonu)'
    const blok = `${BASLIK}

Her teknik değer kaynak dizininde arandı. **PDF açılmadı** (K15).

| durum | satır | ne demek |
|---|---|---|
| VAR | ${sayim.VAR} | değer, ürünün kodunun **yakınında** geçiyor — dosya+sayfa+alıntı dolu |
| DEGER YOK | ${sayim['DEGER YOK']} | ürünün sayfası bulundu, değer o sayfalarda yok |
| URUN KAYNAKTA YOK | ${sayim['URUN KAYNAKTA YOK']} | ürünün kodu hiçbir kaynakta geçmiyor — **ölçülemez** |
| CELISIYOR | ${sayim.CELISIYOR} | alanın etiketi sayfada var, değer uyuşmuyor → \`celiski-listesi.csv\` |

⛔**"VAR" mutlak kanıt değildir.** Aynı eşleme, değerleri kaydırılmış **sahte** bir kopya
üzerinde de koşuldu: orada da **${taban} satır "VAR" dedi.** Yani bu yöntemin tesadüf tabanı
%${(taban / sayim.VAR * 100).toFixed(1)}'dir; gerçek kanıt payı **%${netOran} (${sayim.VAR - taban} satır)**.
Bir alıntıya dayanıp karar vereceksen **alıntıyı oku** — sayı tek başına yetmez.

⛔**Kanıtsız değer SİLİNMEDİ, İŞARETLENDİ.** \`DEGER YOK\` ve \`URUN KAYNAKTA YOK\`
satırları pakette duruyor; boş \`kaynak_dosya\` hücresi bir eksiklik değil, bir **beyandır**.

Çelişki yalnız **etiket sözlüğü olan 10 alanda** ölçülebildi; ${celiskiOlculmedi} satırda
çelişki **ÖLÇÜLMEDİ** — bunları "çelişki yok" saymak yanlış olurdu.
`
    const mevcut = readFileSync(mYol, 'utf8')
    const i = mevcut.indexOf(BASLIK)
    const j = mevcut.indexOf('## Belge tablosu')
    // Bölüm sırası korunur: kaynak eşlemesi, belge tablosundan ÖNCE gelir.
    if (i >= 0) {
      const son = mevcut.indexOf('\n## ', i + 5)
      writeFileSync(mYol, mevcut.slice(0, i) + blok + (son >= 0 ? mevcut.slice(son + 1) : ''), 'utf8')
    } else if (j >= 0) {
      // '\n' EKLENMEZ: blok zaten satır sonuyla biter. Eklenirse ilk koşum ile ikinci
      // koşum arasında 1 baytlık fark doğar ve "üretilmiş artefakt" iddiası zayıflar.
      writeFileSync(mYol, mevcut.slice(0, j) + blok + mevcut.slice(j), 'utf8')
    } else {
      writeFileSync(mYol, mevcut.trimEnd() + '\n\n' + blok, 'utf8')
    }
  }
  console.log(`\n✓ teknik-ozellikler.csv YAZILDI (durum kolonu eklendi) · celiski-listesi.csv ${celiskiListesi.length} satır`)
} else {
  console.log('\nKURU KOŞUM — paket CSV\'sine dokunulmadı. Yazmak için: --yaz')
}
