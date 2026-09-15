#!/usr/bin/env node
'use strict'

/**
 * UserPromptSubmit hook — DEFTER TAZELİK SATIRI (REC-342).
 *
 * ── NİÇİN VAR, VE KAYDIN VARSAYIMI NİÇİN YANLIŞTI ──
 *
 * Kayıt "kural var, KAPI YOK" diyordu. **Ölçtüm: kapı VAR, bağlı, ve doğru çalışıyor.**
 * `.claude/hooks/defter-bayatlik-olcumu.cjs` bir Stop kancası olarak kurulu ve elle
 * koşturulduğunda "178 saat önce" diye doğru cevabı veriyor. Yani eksik olan şey ölçüm
 * değil, ölçümün **GÖRÜNDÜĞÜ YÜZEY**:
 *
 *   1. O kanca **Stop** olayında koşar — yani turun SONUNDA. Açılışta karar veren kişi onu
 *      görmez; defterin bayat olduğunu ancak defteri kullandıktan SONRA öğrenir.
 *   2. `async: true` ile kurulu ve çıktısı **stderr**'e gider. Eşzamansız bir kancanın
 *      stderr'i turun akışına girmez.
 *   3. Soğuma penceresi (2 saat) uyarıyı seyrekleştirir — gürültü için doğru, ama açılışta
 *      "bugün defter kaç gün bayat" sorusunun cevabı HER TURDA gerekir.
 *
 * ⭐DERS (kaydın kendisine de yazıldı): **bir kapının var olması, kararın verildiği yerde
 * GÖRÜNDÜĞÜ anlamına gelmez.** 2026-09-15'te defter 7 gün bayattı, kanca bunu ölçüyordu ve
 * kimse görmedi. Aynı sınıf: "yeşil kapı göründüğünü kanıtlamaz".
 *
 * ── NE YAPAR ──
 *
 * UserPromptSubmit çıktısı turun bağlamına EKLENİR (pano ve yöntem satırları böyle görünür).
 * Bu kanca oraya TEK SATIR yazar:
 *
 *   DEFTER: son esitleme 2026-09-08 (7 gun) · olc 14 degisen/22 · Kararlar kopyasi 3 gun
 *
 * Eşik aşılırsa satır `⚠` ile başlar. Eşik: yaş ≥ 2 gün YA DA değişen demet ≥ 1.
 *
 * ── BÜTÇE VE NİÇİN ÖNBELLEK ──
 *
 * Bütçe 300 ms. Ölçülen süreler (2026-09-15, bu makine): `git log` 63 ms · `python olc`
 * **631 ms**. Yani `olc` bu bütçeye SIĞMAZ ve burada KOŞTURULMAZ; sayı, Stop kancasının
 * yazdığı önbellekten okunur. Önbellek yoksa ya da bayatsa satır bunu SÖYLER — eski bir
 * sayıyı taze gibi göstermek, hiç göstermemekten kötüdür.
 *
 * ⛔DIŞ SERVİSE ÇIKMAZ: NotebookLM'e hiçbir istek atılmaz (cetvel kuralı; eşitleme insan
 * tetikler). Bu kanca yalnız yerel dosya ve `git log` okur.
 *
 * ── FAIL-OPEN AMA SESSİZ DEĞİL ──
 *
 * Çıkış DAİMA 0 — turu bloklamaz. Ama ölçemezse **"ölçülemedi (sebep)"** yazar; sessiz
 * kalmak bayatlığı "yok" göstermek olur (is-kirmizi-degil-adim-kirmizi).
 *
 * stdin: { session_id?, cwd? } · stdout: tek satır (bağlama eklenir) · çıkış: 0
 */

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const PANO = process.env.VENTHUB_BOARD_DIR || process.env.VENTHUB_PANO_DIR || 'C:/tmp/venthub-board'

/**
 * ⛔DEPO YOLU SABİT YAZILMAZ — INV-MUTLAK-YOL-1 bunu daha önce CI'da yakaladı: mutlak yol
 * hem kimlik sızdırır (depo PUBLIC) hem kodu tek makineye bağlar.
 */
function depoKoku() {
  if (process.env.VENTHUB_REPO) return process.env.VENTHUB_REPO
  let d = __dirname
  for (let i = 0; i < 10; i++) {
    if (fs.existsSync(path.join(d, '.git'))) return d
    const ust = path.dirname(d)
    if (ust === d) break
    d = ust
  }
  return process.cwd()
}

const DEPO = depoKoku()
const DURUM_YOLU = 'docs/proje-takip/state.json'
const KARARLAR_DIZINI = path.join(DEPO, 'docs', 'proje-takip', 'linear')
const ONBELLEK = path.join(PANO, '.defter-olc-onbellek.json')

/** Eşikler. Yaş 2 gün: gün atlaması affedilmez ama gün içi birden çok eşitleme beklenmez. */
const ESIK_GUN = Number(process.env.VENTHUB_DEFTER_ESIK_GUN || 2)
/** Önbellek bu yaştan eskiyse SAYI KULLANILMAZ — bayat sayı yanlış güven üretir. */
const ONBELLEK_ESIK_SAAT = Number(process.env.VENTHUB_DEFTER_ONBELLEK_SAAT || 24)

try {
  JSON.parse(fs.readFileSync(0, 'utf8') || '{}')
} catch {
  /* girdi okunamadı: bu kanca girdiye BAĞLI DEĞİL, ölçmeye devam eder */
}

const parcalar = []
let uyari = false

/** ÖLÇÜM 1 — son eşitlemenin PAYLAŞILAN gerçeğe (origin/master) indiği an. */
let yasGun = null
try {
  const iso = execFileSync(
    'git',
    ['-C', DEPO, 'log', 'origin/master', '-1', '--format=%aI', '--', DURUM_YOLU],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5_000 },
  ).trim()
  if (!iso) throw new Error('git log bos dondu (origin/master ref yok olabilir)')
  const ms = Date.parse(iso)
  if (!Number.isFinite(ms)) throw new Error('tarih cozulemedi')
  yasGun = Math.floor((Date.now() - ms) / 86_400_000)
  parcalar.push('son esitleme ' + iso.slice(0, 10) + ' (' + yasGun + ' gun)')
  if (yasGun >= ESIK_GUN) uyari = true
} catch (e) {
  parcalar.push('son esitleme OLCULEMEDI (' + String(e.message).slice(0, 70) + ')')
  uyari = true // ölçemedim ≠ taze
}

/** ÖLÇÜM 2 — değişen demet sayısı, ÖNBELLEKTEN (bütçe gerekçesi başlıkta). */
try {
  const ob = JSON.parse(fs.readFileSync(ONBELLEK, 'utf8'))
  const obYasSaat = (Date.now() - Date.parse(ob.ts)) / 3_600_000
  if (!Number.isFinite(obYasSaat) || obYasSaat > ONBELLEK_ESIK_SAAT) {
    parcalar.push('olc OLCULMEDI (onbellek bayat)')
    uyari = true
  } else if (ob.degisen == null) {
    parcalar.push('olc OLCULEMEDI (' + String(ob.hata || 'sebep yazilmamis').slice(0, 60) + ')')
    uyari = true
  } else {
    parcalar.push('olc ' + ob.degisen + ' degisen/' + ob.toplam)
    if (ob.degisen >= 1) uyari = true
  }
} catch {
  parcalar.push('olc OLCULMEDI (onbellek yok)')
  uyari = true
}

/**
 * ÖLÇÜM 3 — Kararlar kopyalarının yaşı.
 *
 * ⚠SINIRI ADIYLA: bu ölçüm DOSYA ADINDAKİ tarihi okur, Linear'daki belgenin gerçek
 * `updatedAt` değerini DEĞİL. Yani "kopya ne zaman alındı" sorusunu cevaplar, "kaynak o
 * gün değişti mi" sorusunu CEVAPLAMAZ. Doğrusu API ister ve bu kanca çevrimdışıdır.
 * Kopya bugünse kaynak yine de değişmiş olabilir — o boşluk açıktır ve burada yazılıdır.
 */
try {
  const adlar = fs.readdirSync(KARARLAR_DIZINI).filter((a) => /^kararlar-.*\d{4}-\d{2}-\d{2}\.md$/.test(a))
  if (adlar.length === 0) throw new Error('kararlar-*.md yok')
  const tarihler = adlar
    .map((a) => /(\d{4}-\d{2}-\d{2})\.md$/.exec(a))
    .filter(Boolean)
    .map((m) => Date.parse(m[1]))
    .filter(Number.isFinite)
  if (tarihler.length === 0) throw new Error('dosya adindan tarih cozulemedi')
  const enYeni = Math.max(...tarihler)
  const kGun = Math.floor((Date.now() - enYeni) / 86_400_000)
  parcalar.push('Kararlar kopyasi ' + kGun + ' gun')
  if (kGun >= ESIK_GUN) uyari = true
} catch (e) {
  parcalar.push('Kararlar kopyasi OLCULEMEDI (' + String(e.message).slice(0, 50) + ')')
  uyari = true
}

process.stdout.write((uyari ? '⚠DEFTER: ' : 'DEFTER: ') + parcalar.join(' · ') + '\n')

/**
 * ── İKİNCİ SATIR: BAĞIMLILIK TARAMASI TAZELİĞİ (REC-345) ──
 *
 * NİÇİN AYNI KANCA: ölçüm zaten yazılı bir kayıtta duruyor
 * (`docs/audits/bagimlilik-YYYY-MM-DD.md`) ve REC-342'de öğrenilen ders tam buydu —
 * **ölçümün var olması, kararın verildiği yerde göründüğü anlamına gelmez.** İkinci bir
 * kanca açmak yerine aynı yüzeye ikinci satır yazmak, hem bütçeyi hem dikkat payını korur.
 *
 * ⭐NE ÖLÇER, NE ÖLÇMEZ: tarama KAYDININ yaşını ölçer, taramanın kendisini KOŞTURMAZ.
 * `pnpm outdated` ve `pnpm audit` ikisi de AĞ ister ve saniyeler sürer; bu satırın bütçesi
 * 300 ms. Sayı kayıttan okunur.
 * ⚠Sınırı adıyla: "tarama yapıldı" ile "tarama KAYDA GEÇTİ" aynı şey değildir. Kayda
 * geçmeyen bir tarama burada görünmez — ve bu KASITLI, çünkü kayda geçmeyen ölçüm bir
 * hafta sonra yok sayılır.
 *
 * ⭐`high ≥ 1` TEK BAŞINA UYARI SEBEBİ DEĞİLDİR: bugün 11 yüksek kayıt var ve hepsi
 * bilinen, kayda geçmiş, insan kararı bekleyen kalemler. Her turda kırmızı yanan bir satır
 * üç günde görmezden gelinir (bu projede ölçülmüş bir kusur). Kapı TARAMA TAZELİĞİNİ ölçer;
 * sayı yine de YAZILIR, çünkü gizlenmesi de yanlış olurdu.
 */
const BAGIMLILIK_ESIK_GUN = Number(process.env.VENTHUB_BAGIMLILIK_ESIK_GUN || 14)
const DENETIM_DIZINI = path.join(DEPO, 'docs', 'audits')

try {
  // Dizin hiç yoksa da "kayıt yok" demek DOĞRU cevaptır: ham `ENOENT` metnini basmak,
  // okuyana yol hatası gibi görünür ve gerçek sebebi (tarama kaydı yazılmamış) gizler.
  let adlar = []
  try {
    adlar = fs.readdirSync(DENETIM_DIZINI).filter((a) => /^bagimlilik-\d{4}-\d{2}-\d{2}\.md$/.test(a))
  } catch {
    adlar = []
  }
  if (adlar.length === 0) throw new Error('bagimlilik-*.md kaydi yok')

  const enYeniAd = adlar.sort().slice(-1)[0]
  const gun = Math.floor((Date.now() - Date.parse(/(\d{4}-\d{2}-\d{2})/.exec(enYeniAd)[1])) / 86_400_000)

  // `high` sayısı kaydın kendi tablosundan okunur; ayrı bir yerde tutulan sayı bayatlar.
  const metin = fs.readFileSync(path.join(DENETIM_DIZINI, enYeniAd), 'utf8')
  const m = /Yüksek önemde güvenlik kaydı[^|]*\|\s*\*\*(\d+)\*\*/.exec(metin)
  const high = m ? m[1] : null

  const satir = 'son tarama ' + gun + ' gun' + (high === null ? ' · high OKUNAMADI (kayitta tablo satiri yok)' : ' · high ' + high)
  process.stdout.write((gun >= BAGIMLILIK_ESIK_GUN || high === null ? '⚠BAGIMLILIK: ' : 'BAGIMLILIK: ') + satir + '\n')
} catch (e) {
  // ÖLÇEMEDİM ≠ TAZE.
  process.stdout.write('⚠BAGIMLILIK: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

process.exit(0)
