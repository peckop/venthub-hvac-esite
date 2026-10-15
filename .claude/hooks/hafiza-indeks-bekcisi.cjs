#!/usr/bin/env node
/**
 * PreToolUse hook — HAFIZA İNDEKSİ BEKÇİSİ (REC-280, REC-433 1.9). Yazımı SERT EŞİKTE ENGELLER.
 *
 * ⭐NİÇİN VAR — ölçülmüş vaka, 2026-09-07 20:41–20:57Z, ÜÇ ŞERİT AYNI DAKİKALARDA:
 * `MEMORY.md` (ortak hafıza indeksi) kırpma sınırını aşınca alt satırlar **SESSİZCE kırpılır** —
 * uyarı yok, hata yok. O gece dosya 16414 → 16510 bayta çıktı ve en alttaki dersler
 * hiçbir oturuma yüklenmedi; kimse görmedi. Üç şerit ayrı ayrı kısalttı (16199 · 16482 ·
 * 14021) ve **son yazan öncekini EZDİ**: KATALOG'un 16199 yazımı üzerine yazıldı.
 *
 * ⭐GERÇEK KIRPMA SINIRI (HARİTA ölçtü, REC-433 1.9, 2026-09-29): 200 SATIR YA DA ~25.000 BAYT,
 * hangisi önce dolarsa. Eski "16384 bayt" yanlış ölçümdü ve yanlış güven verdi (satır sınırı hiç
 * izlenmiyordu). Kırpma modele "Only part of it was loaded" notuyla bildirilir, KULLANICIYA
 * görünmez — bu yüzden taşmayı önceden görmek ve durdurmak tek çare.
 *
 * Üç kol, üç ayrı kusura karşılık gelir:
 *   KOL A — TAŞMA GÖRÜNMÜYOR. YUMUŞAK eşik (160 satır / 20 KB): yazımdan ÖNCE "satır ekleme,
 *           önce katla" der. Ölçülen, YAZIMDAN SONRAKİ dosyadır (Write içeriği, Edit/MultiEdit
 *           uygulanmış hâli) — mevcut dosya değil.
 *   KOL B — KAYIP YAZIM GÖRÜNMÜYOR. KATALOG'un cümlesiyle: *"uyarı kolu taşmayı görür, KAYIP
 *           YAZIMI GÖRMEZ."* Diskteki satırların yeni içerikte kaybolup kaybolmadığını ölçer.
 *   KOL C — UYARI YETMEDİ. SERT eşik (200 satır / 25 KB): yazım sonrası dosya sınırı aşıyorsa
 *           ve yazım dosyayı KÜÇÜLTMİYORSA yazımı ENGELLER (çıkış 2, sebep modele gider).
 *
 * ⭐KOL B'NİN AYIRT EDİCİ NOKTASI — KATLAMA İLE KAYBI KARIŞTIRMAMAK:
 * Bir satırın indeksten çıkması MEŞRU olabilir: dersler `dizin-*.md` dosyalarına bölüm
 * olarak taşınıyor ve indekste yalnız işaretçi kalıyor (kalıcı kural, REC-280 (c)).
 * Bu yüzden ölçüt "satır kayboldu mu" DEĞİL: **kaybolan satırın metni hafıza dizinindeki
 * hiçbir dosyada bulunamıyor mu**. Bulunuyorsa katlanmıştır → SUSAR. Bulunamıyorsa
 * gerçekten silinmiştir → UYARIR ve satırı gösterir. Ayırt etmeyen bir kol, katlamanın
 * her seferinde yanan bir lamba üretirdi ve iki günde mobilyaya dönerdi.
 *
 * ⭐KOL C'NİN İKİ GÜVENCESİ (eski "bloklamaz" kararı bu yüzden geri alındı, ama gerekçesi
 * korundu): eski karar "hafıza yazımını bloklamak oturumun KAYDINI kaybettirir" diyordu
 * (`pre-commit` 2026-08-15'te tam bu sebeple uyarı-only yapıldı). Burada iki şeyle telafi edilir:
 *   (1) Engellenen yazım KAYBOLMAZ: sebep modele döner, model daha KISA yazar (önce katlar) ve
 *       yeniden dener. Oturumun asıl kaydı `arac-serit-durumu`/`ops-cycle-audit-state` gibi AYRI
 *       durum dosyalarındadır; engel yalnız `MEMORY.md` indeksine uygulanır.
 *   (2) KÜÇÜLTEN yazım HER ZAMAN geçer: dosya zaten sınırın üstündeyse ve yazım onu küçültüyorsa
 *       (katlama adımı) engellenmez — yoksa şişmiş bir indeksi kimse onaramaz, kapı kilitlenir.
 * Uyarı yetmedi: uyarı-only kapı, filo aynı gün üç kez kırpmayı görmedi diye eklendi.
 *
 * ⭐YANLIŞ POZİTİF DÜZELTMESİ (HARİTA bildirdi): kol, yazılan dosyayı değil OTURUMUN kendi proje
 * dizinindeki `memory/MEMORY.md`'yi ölçüyordu. Başka projenin indeksi (ör. bir test klasörü)
 * yazılırken gerçek indeksten "103 satır siliniyor" diye yalancı uyarı verdi. Artık ölçülen dosya
 * YAZILAN dosyanın kendisidir; hedef `.../memory/MEMORY.md` biçiminde değilse kanca susar.
 * Bu, worktree oturumlarındaki eski kör noktayı da kapatır (kendi proje dizininde `memory/`
 * yoktu ve kol sessizce hiç koşmuyordu).
 *
 * ⭐DEPARTMAN GENİŞLEMESİ (2026-09-30, HARİTA kararı 4, şartname hafiza-yazma-duzeni §7): kapsam
 * `.../memory/departman/<ROL>/MEMORY.md` dosyalarını da tanır. Departman indeksi Claude'un yerleşik
 * yoluyla YÜKLENMEZ; açılışta SessionStart kancası onu rol kartıyla enjekte eder ve enjeksiyonun
 * ÜST SINIRI 60 satır / 8 KB'tır (aşan kısım sessizce kesilir). Bekçi aynı sayıyı YUMUŞAK eşik
 * olarak kullanır: yoksa bekçiden geçen bir indeks enjeksiyonda görünmeden kırpılırdı.
 *   - Departman YUMUŞAK eşiği: 60 satır / 8 KB — AŞILINCA (>) UYARIR, ENGEL DEĞİL (60 satırın
 *     kendisi enjeksiyona sığar; kesilen ilk satır 61. satırdır).
 *   - SERT eşik ana indeksle AYNI (200 satır / 25 KB) ve engel dalı TEKTİR (KOL C).
 *   - KOL B'nin "katlanmış mı" araması departmanın KENDİ dizininde yapılır (konu dosyaları
 *     `departman/<ROL>/<konu>.md`); ana hafıza dizininde aranmaz.
 *   - ANA `memory/MEMORY.md` davranışı DEĞİŞMEZ (regresyon testi).
 * Tanıma yalnız yola bakar (`memory/departman/<ROL>/MEMORY.md`, harf duyarsız: NTFS); `docs/departman/...`
 * ya da `memory/departman/<ROL>/alt/MEMORY.md` gibi başka yerler susar.
 *
 * ⛔MUTLAK YOL YAZILMAZ (cetvel §24 — depo 2026-08-15'ten beri PUBLIC, kullanıcı adı taşıyan
 * yol kimlik sızdırır): dizin, yazılan dosyanın kendi yolundan türetilir, gövdeye gömülmez.
 *
 * CETVEL: docs/standards/hafiza-kancalari-standard.md · hafıza: memory-index-truncates-silently
 * stdin: { session_id, transcript_path, tool_name, tool_input: { file_path, content?, old_string?,
 *          new_string?, replace_all?, edits? } }
 * Çıkış: uyarıda 0; SERT eşikte 2 (engel); kendi hatasında 0 (fail-open ama SESSİZ DEĞİL).
 */
const fs = require('fs')
const path = require('path')

// Uyarılar stderr + çıkış 0 ile modele ULAŞMIYORDU (2026-09-25 denetimi); kopyası
// additionalContext olarak da gider. Yardımcı yüklenemezse kanca eskisi gibi çalışır.
// (Yardımcı yalnız çıkış 0'da ek çıktı üretir; engel yolu çıkış 2 kullanır, çakışmaz.)
let modeleIlet = { oturum() {} }
try {
  modeleIlet = require(path.join(__dirname, 'modele-ilet.cjs')).stderrModeleIlet('PreToolUse')
} catch {
  /* yardımcı yok: uyarı yalnız stderr'de kalır */
}

/**
 * Eşikler — HARİTA'nın ölçtüğü gerçek kırpma sınırı (200 satır YA DA ~25.000 bayt) ve Ops'un
 * kararı (REC-433 1.9): yumuşak 160 satır / 20 KB, sert 200 satır / 25 KB.
 * Bayt sınırı "~" ile ölçüldü (tam değeri bilinmiyor); sert eşik bu yüzden AŞILINCA (>) tetiklenir
 * ve yumuşak eşik ona 5 KB / 40 satır pay bırakır.
 */
const YUMUSAK_BAYT = 20000
const YUMUSAK_SATIR = 160
const SERT_BAYT = 25000
const SERT_SATIR = 200

/**
 * DEPARTMAN indeksi yumuşak eşiği = SessionStart enjeksiyonunun üst sınırı (şartname §7).
 * Ana indeksin `>=` ölçütünden FARKLI olarak AŞILINCA (>) uyarır: 60 satır enjeksiyona sığar.
 * Sert eşik (SERT_*) ana indeksle ortaktır.
 */
const DEPARTMAN_YUMUSAK_BAYT = 8000
const DEPARTMAN_YUMUSAK_SATIR = 60

/** Kayıp satır raporunda gösterilecek en fazla satır; kalanı sayıyla söylenir. */
const EN_FAZLA_GOSTER = 5

const yaz = (s) => {
  try {
    process.stderr.write(Buffer.from(String(s) + '\n', 'utf8'))
  } catch {
    /* akış kapandıysa süreci öldürme */
  }
}

function stdinOku() {
  try {
    return fs.readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

/**
 * Hedef hangi tür hafıza indeksi? `'ana'` (`.../memory/MEMORY.md`), `'departman'`
 * (`.../memory/departman/<ROL>/MEMORY.md`) ya da `null` (indeks değil → kanca susar).
 * Yalnız ad değil klasör de doğrulanır: ad ölçütü tek başına depodaki ya da bir test klasöründeki
 * başka bir `MEMORY.md`'yi de yakalardı.
 *
 * ANA tür eski ölçütle AYNEN tanınır (kesin harf, ham yol): davranış değişmez.
 * DEPARTMAN türü `..` giderilmiş yolda ve harf duyarsız aranır (NTFS: `Departman\urun\memory.md`
 * aynı dosyadır); `memory` klasörü ŞARTTIR, çünkü hafıza dizini dışındaki `departman/` başka şeydir.
 */
function indeksTuru(filePath) {
  const p = String(filePath).replace(/\\/g, '/')
  if (path.posix.basename(p) === 'MEMORY.md' && path.posix.basename(path.posix.dirname(p)) === 'memory') return 'ana'
  const s = path.posix.normalize(p).split('/')
  const n = s.length
  if (
    n >= 4 &&
    s[n - 1].toLowerCase() === 'memory.md' &&
    s[n - 2] !== '' &&
    s[n - 3].toLowerCase() === 'departman' &&
    s[n - 4].toLowerCase() === 'memory'
  ) {
    return 'departman'
  }
  return null
}

/** Satır sayısı: sondaki satır sonu fazladan boş satır sayılmaz; boş dosya 0 satırdır. */
function satirSayisi(metin) {
  if (!metin) return 0
  const parca = metin.split(/\r?\n/)
  return /\r?\n$/.test(metin) ? parca.length - 1 : parca.length
}

/** Tek düzenleme uygulanmış hâli; `old_string` bulunamazsa null (Edit aracı zaten kendisi reddeder). */
function duzenle(metin, eski, yeni, hepsi) {
  if (typeof eski !== 'string' || typeof yeni !== 'string' || eski === '') return null
  if (!metin.includes(eski)) return null
  return hepsi ? metin.split(eski).join(yeni) : metin.replace(eski, () => yeni)
}

/**
 * YAZIMDAN SONRAKİ dosya içeriği; hesaplanamazsa null.
 * Write → `content`; Edit → mevcut üzerinde tek düzenleme; MultiEdit → düzenlemeler sırayla.
 */
function sonucIcerik(ti, mevcut) {
  if (typeof ti.content === 'string') return ti.content
  if (Array.isArray(ti.edits)) {
    let m = mevcut
    for (const e of ti.edits) {
      const s = duzenle(m, e && e.old_string, e && e.new_string, e && e.replace_all)
      if (s === null) return null
      m = s
    }
    return m
  }
  return duzenle(mevcut, ti.old_string, ti.new_string, ti.replace_all)
}

/**
 * Anlamlı satırlar — NORMALİZE edilmiş (OPS şartı, 2026-09-08).
 *
 * ⭐NİÇİN HAM METİN DEĞİL: satır eşitliği ham metinle ölçülürse, satır sonundaki tek bir
 * boşluk ya da iki boşlukla hizalanmış bir tire "satır kayboldu" sanılır ve kol HER
 * dokunuşta yalancı uyarı basar. Yalancı uyarı üreten kol, iki günde görmezden gelinir —
 * bugünün tekrar eden dersi. Bu yüzden: CRLF→LF, kenar boşlukları atılır, İÇ boşluk
 * dizileri tek boşluğa indirgenir.
 *
 * 12 karakter alt sınırı: tek başına `---`, `-`, başlık işaretleri gibi taşıyıcı olmayan
 * satırlar ölçüme girmez; onların "kaybolması" bilgi kaybı değildir.
 */
function anlamliSatirlar(metin) {
  return String(metin)
    .split(/\r?\n/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length >= 12)
}

/**
 * Kaybolan satırın metni hafıza dizinindeki BAŞKA bir dosyada var mı — yani KATLANMIŞ mı?
 * Ölçüt satırın kendisi değil, satırdaki en uzun köşeli-parantez etiketi ya da ham metin:
 * indeks satırları `- [Baslik](dosya.md) — kanca` biçiminde, katlanmış hâlleri dizin
 * dosyasında bölüm başlığı olarak yaşıyor. Bu yüzden BAŞLIK metni aranır.
 */
function katlanmisMi(satir, memoryDir, indeksAdi) {
  const m = /\[([^\]]{6,})\]/.exec(satir)
  const iz = m ? m[1] : satir.slice(0, 40)
  let adlar = []
  try {
    adlar = fs.readdirSync(memoryDir).filter((a) => a.endsWith('.md') && a !== indeksAdi)
  } catch {
    return false
  }
  for (const ad of adlar) {
    try {
      if (fs.readFileSync(path.join(memoryDir, ad), 'utf8').includes(iz)) return true
    } catch {
      /* okunamayan dosya kanıt üretmez; sonraki */
    }
  }
  return false
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(stdinOku() || '{}')
  } catch {
    process.exit(0)
  }
  modeleIlet.oturum(girdi.session_id) // aynı uyarı bu oturumda modele bir kez gider
  const ti = girdi.tool_input || {}
  const filePath = ti.file_path || ''
  const tur = indeksTuru(filePath)
  if (!tur) process.exit(0)
  const departman = tur === 'departman'

  // ⭐Ölçülen dosya YAZILAN dosyanın kendisi (oturumun proje dizinindeki değil).
  const hedef = path.resolve(String(filePath))
  const memoryDir = path.dirname(hedef) // departmanda: departman/<ROL>/ (katlanmış satırın yaşadığı yer)
  const indeksAdi = path.basename(hedef)
  const ad = departman ? 'Departman MEMORY.md (' + path.basename(memoryDir) + ')' : 'MEMORY.md'
  const katlaYeri = departman
    ? 'konu dosyalarina (departman/<ROL>/<konu>.md) bolum olarak tasi, indekste yalniz isaretci birak'
    : 'dizin-*.md dosyalarina bolum olarak tasi, indekste yalniz isaretci birak'

  let mevcut = ''
  try {
    mevcut = fs.readFileSync(hedef, 'utf8')
  } catch {
    mevcut = '' // dosya yok: ilk yazım; kayıp kolu için taban yok, eşikler yine ölçülür
  }
  const mevcutBayt = Buffer.byteLength(mevcut, 'utf8')
  const mevcutSatir = satirSayisi(mevcut)

  // Yazımdan SONRAKİ hâl; hesaplanamazsa mevcut dosya ölçülür (eski davranış, yalnız uyarı).
  const sonuc = sonucIcerik(ti, mevcut)
  const olculen = sonuc === null ? mevcut : sonuc
  const bayt = Buffer.byteLength(olculen, 'utf8')
  const satir = satirSayisi(olculen)

  // ---- KOL C: SERT eşik. Engel yalnız yazımın sonucu biliniyorsa ve dosyayı KÜÇÜLTMÜYORSA.
  if (sonuc !== null) {
    const baytAsti = bayt > SERT_BAYT && bayt >= mevcutBayt
    const satirAsti = satir > SERT_SATIR && satir >= mevcutSatir
    if (baytAsti || satirAsti) {
      yaz(
        '[hafiza-indeks] ⛔YAZIM ENGELLENDI: ' + ad + ' bu yazimdan sonra ' + satir + ' satir / ' + bayt +
          ' bayt olur; SERT esik ' + SERT_SATIR + ' satir / ' + SERT_BAYT + ' bayt. Bu sinirin ustu ' +
          'SESSIZCE kirpilir: alt satirlar hicbir oturuma yuklenmez ve kullanici bunu GORMEZ.',
      )
      yaz(
        '[hafiza-indeks] YAPILACAK: once KATLA — eski ders satirlarini ' + katlaYeri + '; dosyayi ' +
          'KUCULTEN yazim her zaman gecer. Sonra yeni satirini ekleyip yeniden yaz. Yazim KAYBOLMADI, ' +
          'yalniz ertelendi.',
      )
      process.exit(2)
    }
  }

  const uyarilar = []

  // ---- KOL A: yumuşak eşik (yazımdan ÖNCE, yazımın SONUCU ölçülür)
  if (departman) {
    // Departman: eşik SessionStart enjeksiyonunun üst sınırı; aşılınca (>) kesilir.
    if (bayt > DEPARTMAN_YUMUSAK_BAYT || satir > DEPARTMAN_YUMUSAK_SATIR) {
      uyarilar.push(
        ad + ' yazimdan sonra ' + satir + ' satir / ' + bayt + ' bayt: YUMUSAK ESIK ' +
          DEPARTMAN_YUMUSAK_SATIR + ' satir / ' + DEPARTMAN_YUMUSAK_BAYT + ' bayt asildi (SessionStart ' +
          'enjeksiyonunun ust siniri: asan kisim acilista SESSIZCE kesilir). ⛔SATIR EKLEME — once ' +
          'KATLA: eski satirlari ' + katlaYeri + '. SERT esik ' + SERT_SATIR + ' satir / ' + SERT_BAYT +
          ' bayt ve orada yazim ENGELLENIR.',
      )
    }
  } else if (bayt >= YUMUSAK_BAYT || satir >= YUMUSAK_SATIR) {
    uyarilar.push(
      'MEMORY.md yazimdan sonra ' + satir + ' satir / ' + bayt + ' bayt: YUMUSAK ESIK ' +
        YUMUSAK_SATIR + ' satir / ' + YUMUSAK_BAYT + ' bayt asildi. ⛔SATIR EKLEME — once KATLA: ' +
        'eski ders satirlarini dizin-*.md dosyalarina bolum olarak tasi, indekste yalniz isaretci ' +
        'birak. SERT esik ' + SERT_SATIR + ' satir / ' + SERT_BAYT + ' bayt ve orada yazim ' +
        'ENGELLENIR; ustu SESSIZCE kirpilir (2026-09-07: alt dersler hicbir oturuma yuklenmedi).',
    )
  }

  // ---- KOL B: kayıp yazım (Write, Edit ve MultiEdit — yazımın sonucu ile mevcut karşılaştırılır)
  if (sonuc !== null && mevcut !== '') {
    const eski = anlamliSatirlar(mevcut)
    const yeniKume = new Set(anlamliSatirlar(sonuc))
    const kaybolan = eski.filter((s) => !yeniKume.has(s))
    if (kaybolan.length) {
      // ⭐KATLANMIŞ olanları AYIKLA: taşınmış satır kayıp değildir (ayırt edici nokta).
      const gercektenSilinen = kaybolan.filter((s) => !katlanmisMi(s, memoryDir, indeksAdi))
      if (gercektenSilinen.length) {
        uyarilar.push(
          'KAYIP YAZIM SUPHESI: bu yazim ' + gercektenSilinen.length +
            ' satiri indeksten SILIYOR ve o satirlarin metni hafiza dizinindeki hicbir dosyada YOK ' +
            '(yani katlanmis degil, gercekten kayboluyor). 2026-09-07de UC serit ayni dakikalarda ' +
            'yazdi ve son yazan oncekini EZDI; kayip hicbir kapida gorunmedi. Yazmadan once ' +
            'indeksi YENIDEN OKU ve kendi satirini onun uzerine ekle.',
        )
        for (const s of gercektenSilinen.slice(0, EN_FAZLA_GOSTER)) {
          uyarilar.push('   - ' + s.slice(0, 120))
        }
        if (gercektenSilinen.length > EN_FAZLA_GOSTER) {
          uyarilar.push('   ... ve ' + (gercektenSilinen.length - EN_FAZLA_GOSTER) + ' satir daha')
        }
      }
    }
  }

  if (!uyarilar.length) process.exit(0) // sessiz geçmek doğru: her yazımda yanan uyarı mobilyaya döner
  yaz('[hafiza-indeks] ⚠REC-280 kolu:')
  for (const u of uyarilar) yaz('[hafiza-indeks] ' + u)
  yaz('[hafiza-indeks] Bu bir UYARI — yazma ENGELLENMEDI (sert esik henuz asilmadi).')
  process.exit(0)
}

/**
 * ⛔KENDİ HATASINDA DA SESSİZ OLMAZ (OPS şartı — fail-open kapı dersi).
 * Bekçi bir gün kendi içinde patlarsa, çıkış 0 verip susmak onu ÖLÜ ama YEŞİL yapardı:
 * "uyarı gelmedi" ile "bekçi çalışmadı" ayırt edilemez olurdu. Tek satır bunu ayırt eder.
 * Bekçinin KENDİ hatası yazımı ENGELLEMEZ (çıkış 0): kapı bozuk diye hafıza yazımı durmaz.
 */
try {
  main()
} catch (e) {
  yaz('[hafiza-indeks] ⚠BEKCI CALISAMADI (' + String((e && e.message) || e).slice(0, 160) + ') — ' +
    'olcum YAPILMADI, yazma engellenmedi. Olcemedim ile temiz AYNI SEY DEGILDIR.')
  process.exit(0)
}
