#!/usr/bin/env node
/**
 * PreToolUse hook — HAFIZA İNDEKSİ BEKÇİSİ (REC-280). ⛔BLOKLAMAZ, daima çıkış 0.
 *
 * ⭐NİÇİN VAR — ölçülmüş vaka, 2026-09-07 20:41–20:57Z, ÜÇ ŞERİT AYNI DAKİKALARDA:
 * `MEMORY.md` (ortak hafıza indeksi) 16384 baytı aşınca alt satırlar **SESSİZCE kırpılır** —
 * uyarı yok, hata yok. O gece dosya 16414 → 16510 bayta çıktı ve en alttaki dersler
 * hiçbir oturuma yüklenmedi; kimse görmedi. Üç şerit ayrı ayrı kısalttı (16199 · 16482 ·
 * 14021) ve **son yazan öncekini EZDİ**: KATALOG'un 16199 yazımı üzerine yazıldı.
 *
 * Yani iki AYRI kusur var ve bu kancanın iki kolu tam onlara karşılık gelir:
 *   KOL A — TAŞMA GÖRÜNMÜYOR. Precompact kancası yalnız compact anında ve yalnız SERT
 *           eşikte (16384) uyarıyordu; o an dosya ZATEN kırpılmış oluyor. Burada uyarı
 *           yazımdan ÖNCE ve YUMUŞAK eşikte (15800) düşer: "satır ekleme, önce katla".
 *   KOL B — KAYIP YAZIM GÖRÜNMÜYOR. KATALOG'un kendi cümlesiyle: *"uyarı kolu taşmayı
 *           görür, KAYIP YAZIMI GÖRMEZ."* Bu kol, diskteki satırların yeni içerikte
 *           kaybolup kaybolmadığını ölçer.
 *
 * ⭐KOL B'NİN AYIRT EDİCİ NOKTASI — KATLAMA İLE KAYBI KARIŞTIRMAMAK:
 * Bir satırın indeksten çıkması MEŞRU olabilir: dersler `dizin-*.md` dosyalarına bölüm
 * olarak taşınıyor ve indekste yalnız işaretçi kalıyor (kalıcı kural, REC-280 (c)).
 * Bu yüzden ölçüt "satır kayboldu mu" DEĞİL: **kaybolan satırın metni hafıza dizinindeki
 * hiçbir dosyada bulunamıyor mu**. Bulunuyorsa katlanmıştır → SUSAR. Bulunamıyorsa
 * gerçekten silinmiştir → UYARIR ve satırı gösterir. Ayırt etmeyen bir kol, katlamanın
 * her seferinde yanan bir lamba üretirdi ve iki günde mobilyaya dönerdi.
 *
 * ⛔NİÇİN BLOKLAMAZ: (1) kanca cetveli hızlı ve çevrimdışı olmayı şart koşuyor;
 * (2) hafıza yazımını bloklamak oturumun KAYDINI kaybettirir — `pre-commit` 2026-08-15'te
 * tam bu sebeple uyarı-only yapıldı ve o karar geri alınmıyor. Kayıp yazımı YASAKLAMIYORUZ,
 * GÖRÜNÜR kılıyoruz: kaybı görmeyen bir yasak, görünür bir kayıptan kötüdür.
 *
 * ⛔MUTLAK YOL YAZILMAZ (cetvel §24 — depo 2026-08-15'ten beri PUBLIC, kullanıcı adı taşıyan
 * yol kimlik sızdırır): hafıza dizini `os.homedir()` + oturumun transcript'inden türetilir,
 * gövdeye gömülmez. Türetim `precompact-durum-kapisi.cjs` ile AYNI mantık ve aynı ölçülmüş
 * sebeple: worktree'de açılan oturumların kendi proje dizini var ve orada `memory/` YOK;
 * cwd'ye güvenen bir kapı en çok ihtiyaç duyulan yerde kör olur.
 *
 * CETVEL: docs/standards/hafiza-kancalari-standard.md · hafıza: memory-index-truncates-silently
 * stdin: { session_id, transcript_path, tool_name, tool_input: { file_path, content?, old_string? } }
 * Çıkış: DAİMA 0.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')

/** Yumuşak eşik — satır eklemeden önce katlamayı söyler. Sert eşik (16384) precompact'ta. */
const YUMUSAK_ESIK = 15800

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
 * Proje dizini: önce transcript yolu (en doğrudan kanıt), sonra `<sid>.jsonl` araması.
 * Aynı gerekçe precompact kancasında yazılı — cwd'den slug türetmek bu filoda YANLIŞ
 * dizine gider (worktree oturumları, ölçüldü 2026-08-28).
 */
function projeDiziniBul(sid, transcriptPath) {
  if (transcriptPath) {
    const d = path.dirname(transcriptPath)
    if (fs.existsSync(d)) return d
  }
  const kok = path.join(os.homedir(), '.claude', 'projects')
  let adaylar = []
  try {
    adaylar = fs.readdirSync(kok, { withFileTypes: true }).filter((e) => e.isDirectory())
  } catch {
    return null
  }
  for (const e of adaylar) {
    if (sid && fs.existsSync(path.join(kok, e.name, sid + '.jsonl'))) return path.join(kok, e.name)
  }
  return null
}

/** Hedef, hafıza indeksinin kendisi mi? (Ad ölçütü; dizin ayrıca doğrulanır.) */
function indeksMi(filePath) {
  return path.basename(String(filePath).replace(/\\/g, '/')) === 'MEMORY.md'
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
  const ti = girdi.tool_input || {}
  const filePath = ti.file_path || ''
  if (!indeksMi(filePath)) process.exit(0)

  const proje = projeDiziniBul(girdi.session_id || '', girdi.transcript_path || '')
  if (!proje) {
    // Kimlik ölçülemedi: FAIL-OPEN ama SESSİZ DEĞİL (kanca cetvelinin şartı).
    yaz('[hafiza-indeks] proje dizini cozulemedi — olcum ATLANDI (yazma engellenmedi).')
    process.exit(0)
  }
  const memoryDir = path.join(proje, 'memory')
  const indeks = path.join(memoryDir, 'MEMORY.md')

  let mevcut = ''
  try {
    mevcut = fs.readFileSync(indeks, 'utf8')
  } catch {
    process.exit(0) // indeks yoksa ilk yazımdır; ölçülecek taban yok
  }
  const bayt = Buffer.byteLength(mevcut, 'utf8')
  const uyarilar = []

  // ---- KOL A: yumuşak eşik (yazımdan ÖNCE)
  if (bayt >= YUMUSAK_ESIK) {
    uyarilar.push(
      'MEMORY.md ' + bayt + ' bayt, YUMUSAK ESIK ' + YUMUSAK_ESIK + ' asildi. ' +
        '⛔SATIR EKLEME — once KATLA: eski ders satirlarini dizin-*.md dosyalarina bolum ' +
        'olarak tasi, indekste yalniz isaretci birak. Sert esik 16384 ve orada kirpma ' +
        'SESSIZ olur (2026-09-07: 16510 baytta alt dersler hicbir oturuma yuklenmedi).',
    )
  }

  // ---- KOL B: kayıp yazım (yalnız Write ölçülebilir; Edit'te old_string ölçülür)
  const eski = anlamliSatirlar(mevcut)
  let kaybolan = []
  if (typeof ti.content === 'string') {
    const yeniKume = new Set(anlamliSatirlar(ti.content))
    kaybolan = eski.filter((s) => !yeniKume.has(s))
  } else if (typeof ti.old_string === 'string' && typeof ti.new_string === 'string') {
    const yeniKume = new Set(anlamliSatirlar(ti.new_string))
    kaybolan = anlamliSatirlar(ti.old_string).filter((s) => !yeniKume.has(s))
  }
  if (kaybolan.length) {
    // ⭐KATLANMIŞ olanları AYIKLA: taşınmış satır kayıp değildir (ayırt edici nokta).
    const gercektenSilinen = kaybolan.filter((s) => !katlanmisMi(s, memoryDir, 'MEMORY.md'))
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

  if (!uyarilar.length) process.exit(0) // sessiz geçmek doğru: her yazımda yanan uyarı mobilyaya döner
  yaz('[hafiza-indeks] ⚠REC-280 kolu:')
  for (const u of uyarilar) yaz('[hafiza-indeks] ' + u)
  yaz('[hafiza-indeks] Bu bir UYARI — yazma ENGELLENMEDI.')
  process.exit(0)
}

/**
 * ⛔KENDİ HATASINDA DA SESSİZ OLMAZ (OPS şartı — fail-open kapı dersi).
 * Bekçi bir gün kendi içinde patlarsa, çıkış 0 verip susmak onu ÖLÜ ama YEŞİL yapardı:
 * "uyarı gelmedi" ile "bekçi çalışmadı" ayırt edilemez olurdu. Tek satır bunu ayırt eder.
 */
try {
  main()
} catch (e) {
  yaz('[hafiza-indeks] ⚠BEKCI CALISAMADI (' + String((e && e.message) || e).slice(0, 160) + ') — ' +
    'olcum YAPILMADI, yazma engellenmedi. Olcemedim ile temiz AYNI SEY DEGILDIR.')
  process.exit(0)
}
