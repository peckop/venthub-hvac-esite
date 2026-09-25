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

/** Yalnız BELLEK bloğu kullanır: arka plan ölçümü gerçek oturumda (UUID kimlik) başlar, testte değil. */
let girdi = {}
try {
  girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}') || {}
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

/**
 * ÜÇÜNCÜ SATIR — ŞEMA TABANI TAZELİĞİ (INV-TABAN-TAZE-1'in görünen yüzü)
 *
 * ⭐NİÇİN BURADA, YENİ BİR KANCADA DEĞİL: node yorumlayıcısının açılışı tek başına
 * 170-292 ms ölçüldü (REC-345). İkinci bir kanca eklemek aynı bilgiyi iki kat bedelle
 * gösterir. Bu yüzden satır MEVCUT kancaya ekleniyor; kancanın kendi işi ~135-240 ms
 * bandında kalır.
 *
 * ⭐NİÇİN GÖRÜNÜR OLMASI ŞART (REC-342 dersi): aynı ölçümü yapan bir CI kapısı var
 * (`taban-tazeligi.test.ts`) ama o yalnız PR'da konuşur. Recep'in sorusu *"DB'de değişiklik
 * yaptığım an yedeğin bayat olacak, tazelemek yine 2 gün mü sürecek"* — o an PR anı DEĞİL,
 * karar anıdır. Ölçen ama kararın verildiği yerde görünmeyen kapı, görünmeyen kapıdır.
 *
 * ÖLÇÜT tamamen dosya adlarından: en yeni TAM taban tarihi ↔ en yeni migration damgası.
 * Sır yok, ağ yok. Gerekçe Recep'in kendi düzeltmesi: DB'ye giden her değişiklik onaylanmış
 * bir migration dosyasıdır.
 */
try {
  const TABAN_DIZIN = path.join(DEPO, 'supabase', 'baselines')
  const MIG_DIZIN = path.join(DEPO, 'supabase', 'migrations')

  // TAM/KISMİ ayrımı dosya ADIYLA değil İÇERİKLE yapılır: tam döküm RLS politikası taşır.
  // (2026-09-14'te "en yeni dosya" seçilip kısmi bir döküm taban sanılmıştı.)
  const tabanlar = fs
    .readdirSync(TABAN_DIZIN)
    .filter((a) => /^\d{4}-\d{2}-\d{2}_public_schema\.sql$/.test(a))
    .filter((a) => /create\s+policy/i.test(fs.readFileSync(path.join(TABAN_DIZIN, a), 'utf8')))
    .sort()
  if (tabanlar.length === 0) throw new Error('TAM taban yok (create policy gecen dosya 0)')
  const tabanTarih = tabanlar.slice(-1)[0].slice(0, 10)

  // Sahada ÜÇ damga biçimi var: 14, 12 ve 8 hane. Üçü de ayrıştırılır — okunamayan dosya
  // karşılaştırmadan sessizce düşerse satır YANLIŞ "taze" der.
  const damga = (ad) => {
    const m = /^(\d{8})(\d{4}|\d{6})?_/.exec(ad)
    return m ? m[1].slice(0, 4) + '-' + m[1].slice(4, 6) + '-' + m[1].slice(6, 8) : null
  }
  const migler = fs.readdirSync(MIG_DIZIN).filter((a) => a.endsWith('.sql'))
  const cozulemeyen = migler.filter((a) => damga(a) === null).length
  const sonra = migler.filter((a) => {
    const t = damga(a)
    return t !== null && t > tabanTarih
  })

  const gun = Math.floor((Date.now() - Date.parse(tabanTarih)) / 86_400_000)
  const parca = ['taban ' + tabanTarih + ' (' + gun + ' gun)']
  if (sonra.length > 0) parca.push('SONRASINDA ' + sonra.length + ' migration')
  else parca.push('sonrasinda migration yok')
  if (cozulemeyen > 0) parca.push('⚠damgasi cozulemeyen ' + cozulemeyen)

  const uyar = sonra.length > 0 || cozulemeyen > 0
  process.stdout.write((uyar ? '⚠TABAN: ' : 'TABAN: ') + parca.join(' · ') + '\n')
  if (sonra.length > 0) {
    process.stdout.write(
      '  ONARIM: sema-tabani-uret.yml elle tetiklenir (salt-okuma, ~57 sn), cikti artefakt, INSAN PR acar\n',
    )
  }
} catch (e) {
  // ÖLÇEMEDİM ≠ TAZE.
  process.stdout.write('⚠TABAN: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── SAGE YEDEĞİ (REC-345, karar 51) ──
 *
 * ⭐BU BLOK EŞİKLİDİR, KOMŞULARI DEĞİL. DEFTER ve TABAN her turda yazar çünkü ikisi de
 * karar anında sürekli lazım olan sayılardır. Yedek öyle değil: her şey yolundayken her tura
 * bir satır eklemek, hiçbir şey söylemeyen bir satırdır. Bu yüzden yalnız ÜÇ hâlde konuşur:
 *   · doğrulanamamış bir yedek dosyası duruyor (bir koşum DÜŞMÜŞ — en ağırı, hep görünür),
 *   · hiç yedek yok,
 *   · son yedek 2 günden eski.
 *
 * ⛔"SON BAKIM" BURADA ÖLÇÜLMÜYOR ve uydurulmuyor. Sage'in `memory_hygiene` işlemi MCP
 * üzerinden koşuyor ve hiçbir yere damga bırakmıyor; damga olmadan "14 gündür bakım yok"
 * cümlesi ölçüm değil tahmindir. Bakım damgası ayrı ve küçük bir iştir; o gelene kadar bu
 * satır yalnız ölçebildiğini söyler.
 */
try {
  const sy = require(path.join(__dirname, '..', '..', 'scripts', 'hijyen', 'sage-yedek.cjs'))
  const d = sy.sonDurum()
  const parca = []
  if (d.dogrulanmadi.length > 0) parca.push('⛔DOGRULANMAMIS ' + d.dogrulanmadi.length + ' dosya (bir kosum DUSTU)')
  if (d.gun === null) parca.push('HIC YEDEK YOK')
  else if (d.gun > 2) parca.push('son yedek ' + d.gun + ' gun once')
  if (parca.length > 0) {
    process.stdout.write('⚠SAGE: ' + parca.join(' · ') + '\n')
    process.stdout.write('  ONARIM: node scripts/hijyen/sage-yedek.cjs (salt-okuma, ~1 sn, git disina yazar)\n')
  }
} catch (e) {
  process.stdout.write('⚠SAGE: YEDEK DURUMU OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── BELLEK (Ops emri 2026-09-25) — EŞİKLİ, SAGE gibi ──
 * 3 GB üstü tek süreç ya da 2 GB altı boş bellek varsa konuşur. Ölçüm arka planda ve
 * önbellekten; bu blok bütçeye yalnız bir dosya okuması ekler. Gerekçe: bellek-yoklama.cjs.
 */
try {
  const by = require(path.join(__dirname, 'bellek-yoklama.cjs'))
  const simdi = Date.now()
  const s = by.satir(by.oku(), simdi)
  if (s) process.stdout.write(s + '\n')
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(girdi.session_id || ''))) {
    by.gerekirseTazele(simdi)
  }
} catch (e) {
  process.stdout.write('⚠BELLEK: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

process.exit(0)
