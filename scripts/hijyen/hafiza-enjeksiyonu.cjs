/**
 * HAFIZA ENJEKSİYONU + KULLANIM SAYACI + HİJYEN — konu farkında sage hafızası (REC-519).
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR
 * ══════════════════════════════════════════════════════════════════════════════
 * WrongStack'in üç "kapalı" parçası Claude Code'da hiç çalışmıyordu çünkü hepsi WrongStack'in
 * kendi boru hattına (`pipelines.toolCall/request`) bağlıydı; Claude Code'da o boru hattı
 * yok (ARAÇ ölçümü 2026-09-30, `wrongstack-kancadan-cagrilabilirlik-ARAC.md`):
 *   1. MemoryInjectorAgent  → konuya göre ders bağlama girmiyordu
 *   2. recordUse sayacı     → hangi dersin işe yaradığı hiç yazılmıyordu
 *   3. saatlik hijyen       → hiçbir tetiğe bağlı değildi
 * Bu modül üçünü de KANCA olarak çalıştıran mantığı taşır. Kancalar (`.claude/hooks/
 * hafiza-enjeksiyonu.cjs` · `hafiza-kullanim-sayaci.cjs` · `sage-hijyen-oturum-sonu.cjs`)
 * yalnız kablodur; karar burada, `port` nesnesi ENJEKTE edilerek yazılmıştır ki gerçek
 * daemon olmadan sabotajlı test koşabilsin.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * ⛔KANCA DAEMON BAŞLATMAZ (ölçüldü)
 * ══════════════════════════════════════════════════════════════════════════════
 * `ProjectSageMemoryPort.initialize()` ve her `call()`, daemon yoksa onu ARKA PLANDA
 * BAŞLATIR (index.js `ensureConnected(true)`). Daemon yokken açılış süresi ölçülmedi ve bir
 * kancanın her istemde süreç doğurması kabul edilmez. Bu yüzden: (1) `server.json` yoksa ya
 * da içindeki pid ölüyse SESSİZCE çıkılır ve sage paketi hiç yüklenmez; (2) gerçek port,
 * `initialize()` DEĞİL spawn etmeyen `connection.status()` ile açılır. "Ölçemedik" ile "ders
 * yok" bu kolda İKİSİ DE sessizdir (her istemde konuşan kanca üç turda görmezden gelinir —
 * cetvel K3); Stop ve SessionEnd kolları ise atlamanın sebebini loga yazar.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * BÜTÇE — bağlam yüzdesine göre AZALTMA YAPILMADI (bilinçli)
 * ══════════════════════════════════════════════════════════════════════════════
 * Yukarı akımın MemoryInjectorAgent'ı bağlam baskısına göre azaltır (<%65 taban · ≥%65 en çok
 * 3 ipucu/1400 kr · ≥%82 1/600 · ≥%95 sıfır). Bu kancada eşik kolu YOK, sebepleri:
 *   1. UserPromptSubmit girdisi doluluğu TAŞIMAZ (yalnız durum çubuğuna verilir); kanca
 *      onu `transcript_path`'ten kestirebilir (`baglam-doluluk.cjs` aynısını yapıyor) ama bu
 *      bir TAHMİNDİR ve bu kancanın kararı o tahmine bağlanmadı.
 *   2. Eşik değerleri (65/82/95) yukarı akımın kendi bağlamı için seçilmiş sayılardır; bizim
 *      pencerelerimiz için ölçülmemiştir. Cetvel §6.1: "bir eşik başka bir ölçekten
 *      kopyalanmaz" — kopyalanırsa NE sildiği ölçülür, ve burada ölçülmedi.
 *   3. Cetvel §6.1'in hükmü: bağlam bütçesi adına ders kalitesi kısılmaz.
 * Bu yüzden yukarı akımın ORTA kademesi (≥%65: en çok 3 ders, 1400 karakter) SABİT kullanılır.
 * Doluluğa duyarlı kademe istenirse AYRI iş olarak, `baglam-doluluk.cjs` ölçümü üzerinden ve
 * kademeleri sahada ölçerek eklenir.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * ⭐ALAKA SÜZGECİ — ölçümle eklendi, şartnamede yoktu
 * ══════════════════════════════════════════════════════════════════════════════
 * `searchSage` doğal dil istemini FTS önek terimlerine böler ve "hepsi" eşleşmezse
 * `OR` ile yeniden dener (index.js `searchSqliteSage`); durak sözcük süzgeci YOK. 2026-09-30'da
 * gerçek daemon'a sorulan 5 istemin 5'i de 2-5 ders döndürdü — "merhaba nasilsin bugun" ve
 * "bu dosyadaki testleri calistir" dahil, ikisi de alakasız. Sonuç süzülmeden basılsaydı kanca
 * HER istemde ötecek ve cetvel K3'ün öldürdüğü kanca olacaktı. Bu yüzden: (a) sorgu istemin
 * İÇERİK terimlerinden kurulur (≥4 karakter, durak sözcük değil, en çok 12); (b) dönen ders,
 * istemin içerik terimlerinden EN AZ 2'sini kendi metninde (önek eşleşmesiyle: Türkçe ek
 * çeken sözcükler için) taşımıyorsa basılmaz; (c) bu oturum-nesilde daha önce basılmış ders
 * bir daha basılmaz (compact nesli artırır → tekrar görünür). Eşik 2 bir yargıdır, ölçülmüş
 * bir optimum DEĞİLDİR; kullanımla yeniden ölçülecek.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * KULLANIM EŞLEŞTİRMESİ — kural KAYNAKTAN okundu, kopyası yerel
 * ══════════════════════════════════════════════════════════════════════════════
 * Yukarı akım kuralı (`InjectionTracker.consumeMatches`, sage 1.0.26 index.js ~8644):
 *   · ders ID'si asistan metninde geçiyorsa → kullanıldı
 *   · normalize dersin İLK 80 karakteri (ders ≥24 karakterse) asistan metninde geçiyorsa
 *   · belirteç kesişimi ≥3 VE kesişim/min(ders belirteci, asistan belirteci) ≥0.5
 *   · dersin en az 4 belirteci olmalı (yoksa hiç kaydedilmez)
 *   · belirteç = NFKC + küçük harf, `[^\p{L}\p{N}_.-]+` ile bölünmüş, ≥3 karakter
 * Bu modül kuralı AYNEN uygular; iki fark bilinçlidir:
 *   1. ⛔TÜRKÇE `İ`: `toLowerCase()` `İ`yi `i` + U+0307 (birleşik nokta) yapar; U+0307
 *      `\p{L}` değil `\p{M}` olduğundan belirteci İKİYE böler ("İstanbul" → "i","stanbul").
 *      Yukarı akım bunu düzeltmez; burada `İ→i` ve U+0307 silme uygulanır.
 *   2. TÜRKÇE HARF KATLAMA (ç ğ ı ö ş ü → c g i o s u): sage derslerinin bir kısmı ASCII
 *      ("SAGE DERSI"), asistan metni çoğunlukla aksanlı; katlama olmadan aynı sözcük iki
 *      farklı belirteç olur ve eşleşme kaçar. İki taraf da katlanır.
 * Neden InjectionTracker'ı kendisi çağırmıyoruz: (a) sage paketi yalnız ana ağaçta kurulu,
 * CI'da yok → sabotajlı test yazılamazdı; (b) `İ` düzeltmesi girdiyi katlamayı gerektirir ve
 * iki kopya yan yana ölçüldü (bkz. test: sage kuruluysa aynı girdide aynı hüküm).
 *
 * ⭐ETİKETSİZ SAHA ÖLÇÜMÜ (2026-09-30, salt okuma): bu oturumun son 60 asistan mesajı × 166
 * aktif ders (ilk 200 karakter). Kesişim oranı eşiği → toplam eşleşme: 0.5 → 0 · 0.4 → 2 ·
 * 0.3 → 12 · 0.25 → 63 · 0.2 → 265. Yani yukarı akım eşiği (0.5) rastgele eşleşme ÜRETMİYOR ama
 * asistan bir dersi kendi cümleleriyle uyguladığında da eşleşmesi zor (elle kurulan bir
 * paraphrase 0.4'te kaldı). 0.25'in altında gürültü patlıyor. ETİKETLİ örneklem olmadan eşik
 * DEĞİŞTİRİLMEDİ; yukarı akımla parite korundu. Ölçülecek iş: gerçek `useCount` birikince
 * hangi derslerin hiç kullanılmadığı → elle etiketle → 0.4/0.3 karşılaştır.
 *
 * ⚠YANLIŞ-POZİTİF/NEGATİF ORANI ÖLÇÜLMEDİ (etiket yok). Yön kararı:
 * YANLIŞ-NEGATİF daha pahalıdır. `useCount` hiç artmayan bir ders, 10+ enjeksiyon ve 30 gün
 * sonra hijyende "injected_never_used" inceleme adayı olur (silme önerisi; otomatik
 * uygulanmaz). Yanlış-pozitif ise yalnız bir dersi gereğinden "işe yarar" gösterir. Bu
 * yüzden kural daha da sıkılaştırılmadı. Defter dersin yalnız İLK 200 KARAKTERİNİ tutar
 * (belirteç oranı o alt kümeye göre hesaplanır; ilk-80-karakter kuralı zaten baştan bakar).
 *
 * ── SAYAÇ NE ZAMAN YAZILIR ──
 * Enjeksiyon anında DEĞİL, Stop'ta toplu: konu kancası ve dosya dersi kancası yalnız deftere
 * yazar (dosya dersi kancası her araç çağrısında koşar, ona IPC eklenmez); Stop kancası tek
 * süreçte `recordInjection` → transcript taraması → `recordUse` yapar ve satırları
 * `sayildi/kullanildi` ile işaretler (çift sayma yok). Sayaç yazımı daemon'un tek-yazar
 * zincirinden geçer; doğrudan sqlite UPDATE YASAK.
 *
 * ── HİJYEN ──
 * Yalnız oturum kapanışında ve YALNIZ taze doğrulanmış yedek varken: hijyen soft-delete ve
 * `superseded` işaretler (geri alınır: `memory_recover`) ama geri dönüşü olan tek güvence
 * yedektir. `purgeDeletedAfterDays` HİÇBİR çağrıda verilmez (fiziksel silme yok).
 *
 * Yöneten cetvel: docs/standards/hafiza-kancalari-standard.md §8.
 */
const fs = require('node:fs')
const path = require('node:path')
const defter = require('./sage-enjeksiyon-defteri.cjs')

// ── SAYILAR (kapı bunları DEĞERLERİYLE ölçer; yorumda kalan bütçe bütçe değildir) ──
/** Bundan kısa istem ("tamam", "evet", "devam") konu aramasını tetiklemez. */
const ASGARI_ISTEM_KARAKTER = 15
/** `searchSage` limiti. */
const ARAMA_LIMITI = 5
/** Bir istemde en çok basılacak ders. */
const EN_FAZLA_DERS = 3
/** Basılan derslerin toplam karakter tavanı (başlık dahil; "N ders daha var" notu hariç). */
const TOPLAM_KARAKTER = 1400
/** `sage-dosya-dersi.cjs` ile aynı süzgeç — yukarı akımın DEFAULT_MIN_IMPORTANCE değeri. */
const ASGARI_ONEM = 0.5
/** Dersin, istemin içerik terimlerinden en az kaçını taşıması gerektiği: alt sınır (kısa istem). */
const ASGARI_ORTAK_TERIM = 2
/** Aynı gereksinimin üst sınırı (uzun istem): yarı-yarıya kuralı bu sayıda durur. */
const EN_COK_ORTAK_TERIM = 3
const EN_FAZLA_SORGU_TERIMI = 12
const ASGARI_TERIM_UZUNLUGU = 4
/** Duvar saati bütçeleri (ms). Kanca bunları aşarsa SESSİZ çıkar. */
const KONU_BUTCE_MS = 2500
const SAYAC_BUTCE_MS = 20_000
const HIJYEN_BUTCE_MS = 60_000
/** Hijyen için son doğrulanmış sage yedeği bundan yeni olmalı. */
const YEDEK_TAZE_SAAT = 24
/** Yedek kancası paralel koşuyor olabilir; hijyen bu kadar bekleyip yeniden bakar. */
const YEDEK_BEKLEME_MS = 20_000
const YEDEK_YOKLAMA_ARALIGI_MS = 1000
/** Yukarı akım `InjectionTracker` varsayılan TTL'i: 2 saat. */
const KULLANIM_PENCERESI_MS = 2 * 60 * 60 * 1000
/** Transcript'in yalnız SONU okunur (ölçüldü: gerçek oturum kaydı 681 MB). */
const TRANSKRIPT_KUYRUK_BAYT = 600_000
const ZAMAN_ASIMI = Symbol('zaman-asimi')

/** Durak sözcükler — katlanmış biçimde. Yalnız sorgu/alaka için; kullanım eşleştirmesi dışı. */
const DURAK = new Set(
  (
    'icin ile gibi daha cok ama fakat ancak veya yada olan olarak oldu olur olmak olsa var yok ' +
    'nasil neden nicin hangi nerede nereye zaman simdi sonra once bunu sunu onu bunun bunlar sunlar ' +
    'onlar bana sana biz siz beni seni lutfen tamam evet hayir yapalim yapabilir yapiyor yapildi ' +
    'yapmak etmek edelim gerek lazim kadar bile hala hep hic her tum tek iki ben sen mi mu ' +
    'merhaba selam nasilsin nasilsiniz bugun yarin gunaydin tesekkurler tesekkur sagol ' +
    'nasil uygulanir ' +
    'the and for with that this what how why when are was were have has not you can please should ' +
    'would could from into about there their them then than will just also'
  ).split(' '),
)

// ── METİN NORMALLEŞTİRME ──────────────────────────────────────────────────────

const KATLAMA = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }
/**
 * U+0307 (birleşik nokta). ⛔Kaynakta KAÇIŞ DİZİSİYLE ya da ham karakterle yazılmaz: araçlar
 * ikisini de sessizce birbirine çevirebiliyor (ilk yazımda ham, görünmez bir karakter kaldı).
 */
const BIRLESIK_NOKTA = new RegExp(String.fromCharCode(0x307), 'g')

/**
 * Karşılaştırma biçimi: NFKC · `İ→i` (toLowerCase birleşik nokta üretmesin) · küçük harf ·
 * U+0307 sil · Türkçe harfleri ASCII'ye kat. Katlama iki tarafa da uygulanır.
 */
function katla(metin) {
  return String(metin || '')
    .normalize('NFKC')
    .replace(/İ/g, 'i')
    .toLowerCase()
    .replace(BIRLESIK_NOKTA, '')
    .replace(/[çğıöşü]/g, (h) => KATLAMA[h])
}

/** Yukarı akım `normalizeTextKey` eşdeğeri (katlamalı). */
function anahtar(metin) {
  return katla(metin).replace(/\s+/g, ' ').trim()
}

/** Yukarı akım `tokenize` eşdeğeri (katlamalı): ≥3 karakter, benzersiz. */
function belirtecler(metin) {
  return [...new Set(katla(metin).split(/[^\p{L}\p{N}_.-]+/u).filter((t) => t.length >= 3))]
}

/** Ders metnini TEK SATIRA indirir — KIRPMAZ (cetvel §6.2 kural 1). */
function tekSatir(metin) {
  return String(metin || '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── KONU KOLU ─────────────────────────────────────────────────────────────────

/** İstem konu aramasını tetikler mi? Kısa istem ya da `/komut` tetiklemez. */
function istemUygunMu(istem) {
  if (typeof istem !== 'string') return false
  const t = istem.trim()
  if (t.length < ASGARI_ISTEM_KARAKTER) return false
  if (t.startsWith('/')) return false
  return true
}

/**
 * İstemin içerik terimleri: ≥4 karakter, durak sözcük değil, benzersiz, en çok 12.
 * `hamlar` sorguya HAM (katlanmamış, küçük harfli) gider — sage'in FTS ayrıştırıcısı kendi
 * aksan işlemesini yapar; `katlanmislar` alaka ölçümü içindir.
 * @returns {{ham: string, kat: string}[]}
 */
function icerikTerimleri(istem) {
  const gorulen = new Set()
  const sonuc = []
  // Ham metin harf/rakam dışından bölünür; `-` ve `_` alt parçalara da ayrılır (pdf-ingestor).
  for (const parca of String(istem || '').split(/[^\p{L}\p{N}]+/u)) {
    if (!parca) continue
    const kat = katla(parca)
    if (kat.length < ASGARI_TERIM_UZUNLUGU || DURAK.has(kat) || gorulen.has(kat)) continue
    gorulen.add(kat)
    sonuc.push({ ham: parca.replace(/İ/g, 'i').toLowerCase().replace(BIRLESIK_NOKTA, ''), kat })
    if (sonuc.length >= EN_FAZLA_SORGU_TERIMI) break
  }
  return sonuc
}

/**
 * Bir dersin istemin içerik terimlerinden kaçını taşıdığı. Eşleşme önek esaslıdır (kısa olan
 * ≥4 karakter): "rapor" ↔ "raporunda", "testleri" ↔ "test". Türkçe ek çeken sözcükler için
 * tam eşitlik çok dar kalırdı.
 */
function ortakTerimSayisi(terimler, dersMetni) {
  // ⛔Durak sözcük DERS tarafında da eşleşme sayılmaz: ilk ölçümde "nasilsin" istemi,
  // dersteki "Nasil uygulanir:" başlığıyla önek eşleşip alakasız bir dersi bastı.
  const dersBelirteci = belirtecler(dersMetni).filter((b) => !DURAK.has(b))
  let n = 0
  for (const { kat } of terimler) {
    const bulundu = dersBelirteci.some((b) => {
      const kisa = Math.min(b.length, kat.length)
      if (kisa < ASGARI_TERIM_UZUNLUGU) return false
      return b.startsWith(kat) || kat.startsWith(b)
    })
    if (bulundu) n++
  }
  return n
}

/**
 * Dersin basılması için gereken ortak terim sayısı — İSTEMİN UZUNLUĞUNA GÖRE:
 * terimlerin yarısı (yukarı yuvarlı), alt sınır 2, üst sınır 3. Kısa istemde ("migration merge
 * edildi mi") 3 terimin ikisi yeter; uzun ve yazım hatalı bir sohbet cümlesinde ("oturum",
 * "dedim", "işleri" gibi HER derste geçen sözcükler) 2 ortak terim tesadüftür — gerçek
 * istemlerde ölçüldü, bkz. başlık.
 */
function gerekliOrtakTerim(terimSayisi) {
  return Math.max(ASGARI_ORTAK_TERIM, Math.min(EN_COK_ORTAK_TERIM, Math.ceil(terimSayisi / 2)))
}

/**
 * Basılacak metni kurar. Ders KIRPILMAZ: sığmayan ders BÜTÜN atlanır ve atlananların sayısı
 * adresiyle yazılır (atlanmış iş yeşil değildir). İLK ders tavandan büyükse yine basılır —
 * dersi olan istemde hiçbir şey basmayan kol, onardığı kusuru tekrar eder (§6.1).
 * @param {{id:string, kind:string, metin:string}[]} adaylar alaka sırasıyla
 * @returns {{metin:string, basilan:{id:string, kind:string, metin:string}[], atlanan:number}}
 */
function bicimlendir(adaylar, sorgu) {
  const bas = 'HAFIZA (konu):\n'
  const secilen = adaylar.slice(0, EN_FAZLA_DERS)
  let atlanan = adaylar.length - secilen.length
  let cikti = bas
  const basilan = []
  for (const d of secilen) {
    const satir = `  · [${d.kind}] ${d.metin}\n`
    if (basilan.length > 0 && (cikti + satir).length > TOPLAM_KARAKTER) {
      atlanan++
      continue
    }
    cikti += satir
    basilan.push(d)
  }
  if (!basilan.length) return { metin: '', basilan, atlanan }
  if (atlanan > 0) {
    cikti += `  (${atlanan} ders daha var, butceye sigmadi — tamami: memory_search "${sorgu}")\n`
  }
  return { metin: cikti, basilan, atlanan }
}

/**
 * Konu kolunun tek girişi. Basılacak metni döndürür; ders yoksa ya da HERHANGİ bir şey
 * ölçülemezse BOŞ dize (fail-open ve sessiz). Asla fırlatmaz.
 *
 * @param {object} p
 * @param {{prompt?:string, session_id?:string}} p.girdi
 * @param {() => Promise<object|null>} p.portAc  gerçek portu AÇAR (pahalı) — kapılardan SONRA çağrılır
 * @param {() => boolean} p.daemonCanli
 * @param {string} [p.pano]
 */
async function konuEnjekte({ girdi, portAc, daemonCanli, pano = defter.panoDizini(), simdi = Date.now }) {
  try {
    const istem = girdi && girdi.prompt
    if (!istemUygunMu(istem)) return ''
    if (!daemonCanli()) return ''
    const terimler = icerikTerimleri(istem)
    if (terimler.length < ASGARI_ORTAK_TERIM) return ''

    const port = await portAc()
    if (!port) return ''
    const sorgu = terimler.map((t) => t.ham).join(' ')
    const sonuc = await port.searchSage(sorgu, { limit: ARAMA_LIMITI, sessionId: girdi.session_id })
    if (!Array.isArray(sonuc) || !sonuc.length) return ''

    const okunan = defter.oku(girdi.session_id, { pano })
    const gorulen = new Set(okunan.satirlar.filter((s) => s.nesil === okunan.guncelNesil).map((s) => s.id))

    const gerekli = gerekliOrtakTerim(terimler.length)
    const adaylar = []
    for (const m of sonuc) {
      if (!m || typeof m.id !== 'string' || typeof m.text !== 'string') continue
      if (Number(m.importance || 0) < ASGARI_ONEM) continue
      if (gorulen.has(m.id)) continue
      const metin = tekSatir(m.text)
      if (!metin) continue
      if (ortakTerimSayisi(terimler, metin) < gerekli) continue
      adaylar.push({ id: m.id, kind: typeof m.kind === 'string' ? m.kind : 'note', metin })
    }
    if (!adaylar.length) return ''

    const { metin, basilan } = bicimlendir(adaylar, sorgu)
    if (!basilan.length) return ''
    defter.yaz(
      girdi.session_id,
      basilan.map((d) => ({ id: d.id, metin: d.metin, kaynak: 'konu' })),
      { pano, simdi: simdi() },
    )
    return metin
  } catch {
    return '' // ağ/IPC/parse hatası: ders yok DEMEDEN sessiz; turu bloklamıyoruz
  }
}

// ── SAYAÇ KOLU (Stop) ─────────────────────────────────────────────────────────

/**
 * Transcript'in SON asistan metinlerini okur. Dosya 681 MB'a çıkabildiği için yalnız
 * kuyruk okunur ve ilk (yarım olabilecek) satır atılır. Yalnız `text` blokları: düşünce ve
 * araç çağrıları asistanın söylediği şey değildir.
 * @returns {{t:number|null, text:string}[]}
 */
function transkriptMesajlari(yol, kuyrukBayt = TRANSKRIPT_KUYRUK_BAYT) {
  if (typeof yol !== 'string' || !yol) return []
  const fd = fs.openSync(yol, 'r')
  try {
    const { size } = fs.fstatSync(fd)
    const n = Math.min(size, kuyrukBayt)
    const tampon = Buffer.alloc(n)
    fs.readSync(fd, tampon, 0, n, size - n)
    let ham = tampon.toString('utf8')
    if (size > n) ham = ham.slice(ham.indexOf('\n') + 1)
    const mesajlar = []
    for (const satir of ham.split('\n')) {
      if (!satir.trim()) continue
      let o
      try {
        o = JSON.parse(satir)
      } catch {
        continue
      }
      if (!o || o.type !== 'assistant' || o.isSidechain === true) continue
      const icerik = o.message && o.message.content
      if (!Array.isArray(icerik)) continue
      const text = icerik
        .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
        .map((b) => b.text)
        .join('\n')
      if (!text) continue
      const t = Date.parse(o.timestamp)
      mesajlar.push({ t: Number.isFinite(t) ? t : null, text })
    }
    return mesajlar
  } finally {
    try {
      fs.closeSync(fd)
    } catch {
      /* kapanmazsa süreç zaten bitiyor */
    }
  }
}

/**
 * Bir dersin asistan metninde "kullanıldığı" kararı — yukarı akım kuralı, bkz. başlık.
 * @param {string} dersMetni deftere yazılmış (ilk 200 karakter) ders metni
 * @param {string} asistanMetni
 * @param {string} [id]
 */
function eslesirMi(dersMetni, asistanMetni, id) {
  const dersAnahtar = anahtar(dersMetni)
  const dersBelirteci = new Set(belirtecler(dersMetni))
  if (dersBelirteci.size < 4) return false // yukarı akım: <4 belirteçli ders kaydedilmez
  const asistanAnahtar = anahtar(asistanMetni)
  if (!asistanAnahtar) return false
  if (id && (String(asistanMetni).includes(id) || asistanAnahtar.includes(anahtar(id)))) return true
  const asistanBelirteci = new Set(belirtecler(asistanMetni))
  if (!asistanBelirteci.size) return false
  if (dersAnahtar.length >= 24 && asistanAnahtar.includes(dersAnahtar.slice(0, 80))) return true
  let kesisim = 0
  for (const b of dersBelirteci) if (asistanBelirteci.has(b)) kesisim++
  const kucuk = Math.min(dersBelirteci.size, asistanBelirteci.size)
  return kesisim >= 3 && kucuk > 0 && kesisim / kucuk >= 0.5
}

/** Aynı ID'nin birden çok satırını turlara böler: her tur ID başına TEK satır (tek sayım). */
function turlaraBol(satirlar) {
  const turlar = []
  for (const s of satirlar) {
    const tur = turlar.find((t) => !t.some((x) => x.id === s.id))
    if (tur) tur.push(s)
    else turlar.push([s])
  }
  return turlar
}

/**
 * Stop kolu: defterdeki henüz SAYILMAMIŞ enjeksiyonları `recordInjection` ile yazar, sonra
 * transcript'te kullanım arar ve YALNIZ eşleşenler için `recordUse` çağırır.
 * Asla fırlatmaz; her hata "sayılmadı" bırakır (bir sonraki Stop yeniden dener).
 * @returns {Promise<{durum:string, sayilan?:number, kullanilan?:number}>}
 */
async function sayacTopla({
  girdi,
  portAc,
  daemonCanli,
  pano = defter.panoDizini(),
  simdi = Date.now,
  mesajOku = transkriptMesajlari,
}) {
  try {
    const oturum = girdi && girdi.session_id
    if (!oturum) return { durum: 'oturumsuz' }
    const { satirlar } = defter.oku(oturum, { pano })
    if (!satirlar.length) return { durum: 'defter-bos' }

    const sayilmamis = satirlar.filter((s) => !s.sayildi)
    const pencere = satirlar.filter((s) => !s.kullanildi && simdi() - Date.parse(s.t) < KULLANIM_PENCERESI_MS)

    // Eşleştirme SAF hesaptır (sage'e ihtiyacı yok): önce o yapılır, gönderilecek bir şey
    // yoksa sage paketi hiç yüklenmez — Stop her turda koşuyor.
    let eslesen = []
    if (pencere.length) {
      let mesajlar = []
      try {
        mesajlar = mesajOku(girdi.transcript_path)
      } catch {
        mesajlar = []
      }
      if (mesajlar.length) {
        eslesen = pencere.filter((s) => {
          const t0 = Date.parse(s.t)
          const metin = mesajlar
            .filter((m) => m.t === null || m.t >= t0 - 1000)
            .map((m) => m.text)
            .join('\n')
          return metin ? eslesirMi(s.metin, metin, s.id) : false
        })
      }
    }
    if (!sayilmamis.length && !eslesen.length) return { durum: 'is-yok' }
    if (!daemonCanli()) return { durum: 'daemon-yok' }
    const port = await portAc()
    if (!port) return { durum: 'port-yok' }

    // 1) enjeksiyon sayacı — turlar halinde, başarılı olan satır işaretlenir
    let sayilan = 0
    const sayilmisSatirlar = new Set(satirlar.filter((s) => s.sayildi).map((s) => s.n))
    for (const tur of turlaraBol(sayilmamis)) {
      try {
        await port.recordInjection(
          tur.map((s) => s.id),
          'claude_code_hook',
          oturum,
        )
      } catch {
        break // IPC düştü: kalanlar sayılmamış kalır, sonraki Stop dener
      }
      for (const s of tur) {
        defter.isaretle(s, 'sayildi')
        sayilmisSatirlar.add(s.n)
        sayilan++
      }
    }

    // 2) kullanım sayacı — YALNIZ enjeksiyonu sayılmış ve eşleşen satırlar
    const kullanilacak = eslesen.filter((s) => sayilmisSatirlar.has(s.n))
    let kullanilan = 0
    if (kullanilacak.length) {
      const idler = [...new Set(kullanilacak.map((s) => s.id))]
      try {
        await port.recordUse(idler, 'claude_code_transcript', oturum)
        for (const s of kullanilacak) defter.isaretle(s, 'kullanildi')
        kullanilan = idler.length
      } catch {
        /* sayılmadı; işaretlenmedi → sonraki Stop yeniden dener */
      }
    }
    return { durum: 'tamam', sayilan, kullanilan }
  } catch {
    return { durum: 'hata' }
  }
}

// ── HİJYEN KOLU (SessionEnd) ──────────────────────────────────────────────────

/**
 * Oturum kapanışı hijyeni. İki KAPI: daemon canlı VE doğrulanmış sage yedeği taze.
 * Yedek kancası PARALEL koşuyor olabileceğinden yedek yoksa `YEDEK_BEKLEME_MS` boyunca
 * saniyede bir yeniden bakılır; hâlâ yoksa hijyen ATLANIR ve sebebi loga yazılır.
 * `purgeDeletedAfterDays` HİÇBİR çağrıda verilmez (fiziksel silme yok).
 * @param {object} p
 * @param {() => boolean} p.yedekTaze  son doğrulanmış sage yedeği <24 saat mi
 * @param {(ms:number) => Promise<void>} [p.bekle]
 * @param {() => number} [p.simdi]
 * @param {(satir:string) => void} p.log
 */
async function hijyenKos({
  portAc,
  daemonCanli,
  yedekTaze,
  log,
  bekle = (ms) => new Promise((r) => setTimeout(r, ms)),
  simdi = Date.now,
}) {
  try {
    if (!daemonCanli()) {
      log('ATLANDI — sage daemon canli degil (server.json yok ya da pid olu); daemon baslatilmadi')
      return { durum: 'daemon-yok' }
    }
    let taze = yedekTaze()
    const bitis = simdi() + YEDEK_BEKLEME_MS
    while (!taze && simdi() < bitis) {
      await bekle(YEDEK_YOKLAMA_ARALIGI_MS)
      taze = yedekTaze()
    }
    if (!taze) {
      log(`ATLANDI — ${YEDEK_TAZE_SAAT} saatten yeni DOGRULANMIS sage yedegi yok; yedeksiz hijyen kosulmaz`)
      return { durum: 'yedek-yok' }
    }
    const port = await portAc()
    if (!port) {
      log('ATLANDI — daemon baglantisi acilamadi')
      return { durum: 'port-yok' }
    }
    // automatic:true uzak port tarafından eklenir (ProjectSageMemoryPort.hygiene, 1 saat kısma);
    // seçenek nesnesi BİLİNÇLİ boş: varsayılanlar yukarı akımın, purgeDeletedAfterDays yok.
    const r = (await port.hygiene({})) || {}
    log(
      `HIJYEN tamam — incelenen ${r.examined ?? '?'} · tekillestirilen ${r.deduplicated ?? '?'} · superseded ${r.superseded ?? '?'} · ` +
        `bayat ${r.staled ?? '?'} · inceleme adayi ${r.reviewCandidatesCreated ?? '?'} · session GC ${r.deleted ?? '?'} · ` +
        `dogrulanan ${r.verified ?? '?'} (1 saat icinde onceki rapor donebilir: daemon kismasi)`,
    )
    return { durum: 'tamam', rapor: r }
  } catch (e) {
    try {
      log(`HATA — ${String((e && e.message) || e)}`)
    } catch {
      /* log yazılamıyorsa da oturum kapanışı bloklanmaz */
    }
    return { durum: 'hata' }
  }
}

// ── DAEMON / PORT KABLOSU (test edilen mantığın dışındaki tek yer) ────────────

function pidCanliMi(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    return Boolean(e && e.code === 'EPERM') // var ama sahibi başka: yaşıyor
  }
}

/**
 * Daemon canlı mı? `server.json` var VE içindeki pid yaşıyor. Hiçbir bağlantı açılmaz,
 * hiçbir süreç başlatılmaz. Okunamazsa `false` (sessiz).
 */
function daemonCanliMi(dbKok, { oku = fs.readFileSync, canliMi = pidCanliMi } = {}) {
  try {
    const j = JSON.parse(oku(path.join(dbKok, '.wrongstack', 'memories', 'server.json'), 'utf8'))
    return canliMi(Number(j && j.pid))
  } catch {
    return false
  }
}

/**
 * Gerçek daemon portunu açar — SPAWN ETMEZ (`connection.status()` yalnız var olana bağlanır).
 * Sage paketi ANA AĞAÇTAN yüklenir (worktree'de node_modules yok).
 * @returns {Promise<null | {searchSage:Function, recordInjection:Function, recordUse:Function, hygiene:Function}>}
 */
async function gercekPortAc(dbKok) {
  process.removeAllListeners('warning')
  process.on('warning', () => {})
  const { createRequire } = require('node:module')
  const sage = createRequire(path.join(dbKok, 'tools', 'wrongstack-mcp', 'package.json'))('@wrongstack/sage')
  const port = new sage.ProjectSageMemoryPort({
    projectRoot: dbKok,
    clientId: `claude-code-hook-${process.pid}`,
  })
  const durum = await port.connection.status()
  if (!durum) return null
  const ret = sage.getSageRetrieval(port)
  return {
    searchSage: (q, o) => ret.searchSage(q, o),
    recordInjection: (ids, tetik, oturum) => ret.recordInjection(ids, tetik, oturum),
    recordUse: (ids, kaynak, oturum) => ret.recordUse(ids, kaynak, oturum),
    hygiene: (o) => port.hygiene(o),
  }
}

/** Son doğrulanmış SAGE yedeği `saat` saatten yeni mi? (Kanban yedeği bu soruya girmez.) */
function sageYedegiTazeMi(saat = YEDEK_TAZE_SAAT, simdi = Date.now()) {
  const yedek = require('./sage-yedek.cjs')
  const sage = (yedek.sonDurum(yedek.yedekDizini(), simdi).depolar || []).find((d) => d.depo === 'sage')
  return Boolean(sage && sage.sonYedek && simdi - Date.parse(sage.sonYedek) < saat * 3_600_000)
}

/** Duvar saati sınırı: süre dolarsa `ZAMAN_ASIMI` döner (çağıran sessiz çıkar). */
function zamanAsimi(vaat, ms) {
  let zamanlayici
  const asim = new Promise((coz) => {
    zamanlayici = setTimeout(() => coz(ZAMAN_ASIMI), ms)
  })
  return Promise.race([vaat, asim]).finally(() => clearTimeout(zamanlayici))
}

function logaYaz(satir, pano = defter.panoDizini()) {
  try {
    fs.mkdirSync(pano, { recursive: true })
    fs.appendFileSync(path.join(pano, 'hafiza-kancalari.log'), `${new Date().toISOString()} ${satir}\n`, 'utf8')
  } catch {
    /* log yazılamıyorsa da kanca bloklanmaz */
  }
}

/** Kanca gövdeleri: kablo + bütçe. `.claude/hooks/*.cjs` yalnız bunları çağırır. */
async function konuKancasi(girdi) {
  const { anaKok } = require('./ana-kok.cjs')
  const dbKok = anaKok()
  const sonuc = await zamanAsimi(
    konuEnjekte({
      girdi,
      daemonCanli: () => daemonCanliMi(dbKok),
      portAc: () => gercekPortAc(dbKok),
    }),
    KONU_BUTCE_MS,
  )
  return sonuc === ZAMAN_ASIMI ? '' : sonuc
}

async function sayacKancasi(girdi) {
  const { anaKok } = require('./ana-kok.cjs')
  const dbKok = anaKok()
  const sonuc = await zamanAsimi(
    sayacTopla({
      girdi,
      daemonCanli: () => daemonCanliMi(dbKok),
      portAc: () => gercekPortAc(dbKok),
    }),
    SAYAC_BUTCE_MS,
  )
  if (sonuc === ZAMAN_ASIMI) logaYaz('SAYAC — butce asildi (20 sn), sayilmayanlar sonraki Stop a kaldi')
  else if (sonuc.sayilan || sonuc.kullanilan || sonuc.durum === 'hata') {
    logaYaz(`SAYAC ${sonuc.durum} — enjeksiyon ${sonuc.sayilan || 0} · kullanim ${sonuc.kullanilan || 0}`)
  }
}

async function hijyenKancasi() {
  const { anaKok } = require('./ana-kok.cjs')
  const dbKok = anaKok()
  const sonuc = await zamanAsimi(
    hijyenKos({
      daemonCanli: () => daemonCanliMi(dbKok),
      portAc: () => gercekPortAc(dbKok),
      yedekTaze: () => sageYedegiTazeMi(),
      log: (s) => logaYaz(`SAGE-HIJYEN ${s}`),
    }),
    HIJYEN_BUTCE_MS,
  )
  if (sonuc === ZAMAN_ASIMI) logaYaz('SAGE-HIJYEN BUTCE ASILDI — 60 sn')
}

module.exports = {
  ASGARI_ISTEM_KARAKTER,
  ARAMA_LIMITI,
  EN_FAZLA_DERS,
  TOPLAM_KARAKTER,
  ASGARI_ONEM,
  ASGARI_ORTAK_TERIM,
  EN_COK_ORTAK_TERIM,
  gerekliOrtakTerim,
  KONU_BUTCE_MS,
  SAYAC_BUTCE_MS,
  HIJYEN_BUTCE_MS,
  YEDEK_TAZE_SAAT,
  KULLANIM_PENCERESI_MS,
  ZAMAN_ASIMI,
  katla,
  belirtecler,
  istemUygunMu,
  icerikTerimleri,
  ortakTerimSayisi,
  bicimlendir,
  konuEnjekte,
  transkriptMesajlari,
  eslesirMi,
  sayacTopla,
  hijyenKos,
  pidCanliMi,
  daemonCanliMi,
  gercekPortAc,
  sageYedegiTazeMi,
  zamanAsimi,
  konuKancasi,
  sayacKancasi,
  hijyenKancasi,
}
