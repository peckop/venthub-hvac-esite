#!/usr/bin/env node
/**
 * ARAÇ ENVANTERİ ÜRETİCİSİ VE KAPISI — INV-ARAC-1..3 (REC-185, cetvel
 * `docs/standards/arac-envanteri-standard.md`).
 *
 * NİÇİN VAR: cetvelin AXIOM 1'i "envantere yazılmayan araç YOKTUR" der, ama tek başına bir
 * cetvel "hatırlarsam uygularım"dır. Ölçüm bunu aynı gün kanıtladı: envanter 2026-09-07
 * 11:22Z'de master'a indi, altı saat sonra bu betikle ölçtüğümde **26 yerde** dosya
 * sistemiyle ayrışmıştı (11 `.ts` betik evrene hiç girmemiş · 1 karantina taşıması satırda
 * eski yolla duruyor · 12 dosya o gün doğmuş · envanter KENDİ CETVELİNİ yazmamış). Kimse
 * ihmal etmedi; envanteri elle taze tutmak insan işi değil.
 *
 * ⭐KİMLİK KURALI HER BÖLÜMDE FARKLI — ve bu, kapının en pahalı tuzağı. Tabloları ölçtüm:
 *   §3.1 hook    → `` `.claude/hooks/x.cjs` ``  (backtick, TAM yol, 8 sütun)
 *   §3.2 betik   → `` `scripts/x.mjs` ``        (backtick, TAM yol, 7 sütun)
 *   §3.3 skill   → kimlik YOL DEĞİL, (Ad × Ağaç) ikilisi (9 sütun, ilk sütun sıra no)
 *   §3.4 githook → `` `.githooks/pre-commit` `` (backtick, TAM yol)
 *   §3.5 ci      → `` `ci.yml` ``               (backtick, YALNIZ taban ad)
 *   §3.6 cetvel  → `3d-scene-lighting-research` (backtick YOK, `.md` uzantısı YOK)
 * Tek bir "yolu oku" kuralı yazsam §3.6'nın 67 satırı KAYIP, 67 dosya YENİ görünürdü:
 * ölçüt keskin, evren yanlış — bu depoda üç kez tekrarlamış sınıf (hafıza:
 * olcut-keskin-ama-evren-yanlis). Bu yüzden kimlik kuralı bölüm bölüm tanımlıdır ve
 * INV-ARAC-1'in gerçek belge üzerinde koşan kolu tam bu tuzağı bekler.
 *
 * ⭐DİFF 0 İÇİN SATIRLARI YENİDEN SERİLEŞTİRMİYORUM. Kabul ölçütü "OPS'un elle yazdığı
 * alanlar kaybolmuyor". En sağlam yol alanları ayrıştırıp geri yazmak DEĞİL, dokunmadığım
 * satırın metnine hiç dokunmamaktır: değişmeyen satır bayt bayt aynı kalır, KAYIP hükmünde
 * yalnız `durum` hücresi değişir, YENİ satır tablonun sonuna eklenir. Ayrıştır-ve-geri-yaz
 * tasarımı italik notları (`OPS *(devir adayı: URUN)*`), kaçışlı boruları ve hizalamayı
 * sessizce yer.
 *
 * ⭐"ALTI KANAL" ALTI ALGORİTMA DEĞİL, TEK KUSURUN ALTI YÜZÜ. Envanter §2 çağıran taramasının
 * altı sınıfı kaçırdığını yazıyor (yetenek ağaçları · konformans testleri + okudukları JSON ·
 * "Üreten:" satırı · kardeş durum dosyaları · pano JSONL · CI'da tırnaklı `uses:`). Beşi aynı
 * sebepten: taranan DOSYA EVRENİ dardı (`package.json` + CI + `.githooks` + `.claude/hooks` +
 * `docs/standards`). Çare altı ayrı tarayıcı değil, **depo-genişi tek geçiş**. Kalan ikisi
 * betiğe girmez ve niçin girmediği yazılıdır (aşağıda ⛔KAPSAM DIŞI).
 *
 * ⛔KAPSAM DIŞI (bilinçli, cetvel §3'ün "kanıt" alanı elle kalır):
 *   (1) Pano JSONL (`C:/tmp/venthub-board/*.jsonl`) DEPO DIŞIDIR. Kapı CI'da koşar; orada o
 *       dizin yoktur. Okusaydım kapı makineye bağlanır ve CI'da sessizce "iz yok" derdi —
 *       bugün aynı sınıfı defter-bayatlık kancasında yaşadım (testler makinenin
 *       `origin/master`ına bakıyordu, CI'da üç kol kırmızı verdi).
 *   (2) `gh workflow list --all`'un `state` sütunu AĞ ister. Konformans testi ağa çıkmaz.
 *   Bu iki kanalın taşıdığı bilgi `kanit` alanında ELLE durur; betik onu KORUR, ezmez.
 *
 * ⛔"ÖLÇEMEDİM" ≠ "YOK". Yeni satırın `kanit` alanına `yok` YAZMAM — o, ölçmediğim bir
 * yokluğu iddia etmek olur (hafıza: yoklugu-kanitlamak-varligi-kanitlamaktan-zordur).
 * `olculemedi (repo disi izler taranmadi)` yazar; hükmü insan verir.
 *
 * ⛔HÜKÜM VERMEM. Yeni satır daima `durum=YENI` ile iner; KAL/OLU-ADAY/KARANTINA hükmü
 * cetvel AXIOM 3 gereği insanın (OPS'un) işidir. Betik gözlemi yazar, kararı yazmaz.
 *
 * KİPLER
 *   --kontrol (varsayılan) : farkı basar; fark varsa ÇIKIŞ 1 (kapının koştuğu kip)
 *   --yaz                  : belgeyi yerinde günceller (YENİ ekle · kayıpta durum=KAYIP)
 *   --envanter <yol>       : belge yolu (varsayılan: docs/audits/arac-envanteri-*.md en yenisi)
 *   --json                 : farkı JSON olarak basar (test bunu okur)
 *
 * ÇIKTI DETERMİNİSTİK: sıralı, zaman damgası yok (aynı ağaç → aynı çıktı).
 *
 * FAIL-CLOSED: belge yoksa, bölüm bulunamazsa ya da tablo ayrıştırılamazsa ÇIKIŞ 2 —
 * "ölçemedim" asla "fark yok" diye okunmaz (hafıza: fail-open-kapi-kapi-degildir).
 */
'use strict'

const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

// ─────────────────────────────────────────────────────────────────────────────
// Depo kökü: ortam değişkeni EZER, yoksa bu dosyadan yukarı `.git` aranır.
// Sabit mutlak yol YAZILMAZ — depo PUBLIC (kimlik sızıntısı) ve kod tek makineye bağlanır.
// Bu kusuru kendi kapım (INV-MUTLAK-YOL-1) bugün CI'da yakaladı; ders burada uygulanıyor.
// ─────────────────────────────────────────────────────────────────────────────
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

/** Windows ayırıcısını tek biçime indirir; kimlikler daima `/` ile karşılaştırılır. */
function egik(p) {
  return String(p).replace(/\\/g, '/')
}

class Kusur extends Error {}

// ─────────────────────────────────────────────────────────────────────────────
// BÖLÜM TANIMLARI — kimlik kuralı burada, tek yerde.
// ─────────────────────────────────────────────────────────────────────────────

/** Envanterde araç SAYILMAYAN dosyalar (cetvel §1): companion, önbellek, README, yedek. */
function araclDisi(yol) {
  const y = egik(yol)
  if (y.includes('__pycache__')) return true
  if (/\.oncesi-\d/.test(y)) return true // git kancası yedekleri
  if (/(^|\/)README\.md$/.test(y)) return true
  return false
}

/**
 * Çalıştırılabilir uzantılar. `.md` hiç yok: `x.md` yanında `x.<uzanti>` duruyorsa o dosya
 * companion açıklamasıdır, araç değildir (cetvel §1 · 2026-09-07 dersi: 13 companion "kanca"
 * sayıldı ve evren yanlıştı).
 */
const CALISTIRILABILIR = ['.cjs', '.mjs', '.js', '.py', '.ps1', '.sh', '.ts']

function dosyalariTara(kok, sec, derin) {
  const cikti = []
  const tam = path.join(DEPO, kok)
  if (!fs.existsSync(tam)) return cikti
  const yigin = [tam]
  while (yigin.length) {
    const d = yigin.pop()
    for (const g of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, g.name)
      if (g.isDirectory()) {
        if (derin && !araclDisi(p)) yigin.push(p)
        continue
      }
      if (!g.isFile()) continue
      const bagil = egik(path.relative(DEPO, p))
      if (araclDisi(bagil)) continue
      if (sec(bagil, p)) cikti.push(bagil)
    }
  }
  return cikti.sort()
}

/**
 * Kimlik → satır metni eşlemesinde kullanılan bölüm tanımları.
 * `kimlikOku`  : tablo satırının ilk hücresinden kimlik çıkarır
 * `kimlikYaz`  : fs yolundan tablo hücresi üretir (ters yön)
 * `evren`      : dosya sistemindeki araç kümesi (kimlik listesi)
 */
const BOLUMLER = [
  {
    bolum: '3.1',
    tur: 'hook',
    kimlikOku: (h) => h.replace(/`/g, '').trim(),
    kimlikYaz: (k) => '`' + k + '`',
    evren: () => dosyalariTara('.claude/hooks', (b) => b.endsWith('.cjs'), false),
  },
  {
    bolum: '3.2',
    tur: 'betik',
    kimlikOku: (h) => h.replace(/`/g, '').trim(),
    kimlikYaz: (k) => '`' + k + '`',
    // `scripts/**` çalıştırılabilirleri. `.ts` DAHİL: cetvel "çalıştırılabilirler" diyor ve
    // `scripts/db/migrations/*.ts` tsx ile koşan gerçek betikler. İlk envanter `.ts`'i
    // kapsamamıştı → 11 araç envrende yoktu; evren darlığı da bir ayrışmadır.
    evren: () =>
      dosyalariTara('scripts', (b) => CALISTIRILABILIR.includes(path.extname(b)), true),
  },
  {
    bolum: '3.3',
    tur: 'skill',
    // Kimlik = (Ad × Ağaç). Tablonun ilk sütunu SIRA NO, ikinci Ad, üçüncü Ağaç.
    kimlikSutunSayisi: 3,
    kimlikOku: (_no, ad, agac) => egik(String(agac).replace(/`/g, '').trim()) + '/' + String(ad).replace(/`/g, '').trim(),
    kimlikYaz: (k) => k, // §3.3 satırı ayrıca kurulur (aşağıda skillSatiri)
    evren: () => {
      const cikti = []
      for (const agac of ['.claude', '.agent']) {
        const kok = path.join(DEPO, agac, 'skills')
        if (!fs.existsSync(kok)) continue
        for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
          if (!g.isDirectory()) continue
          if (fs.existsSync(path.join(kok, g.name, 'SKILL.md'))) cikti.push(agac + '/' + g.name)
        }
      }
      return cikti.sort()
    },
  },
  {
    bolum: '3.4',
    tur: 'githook',
    kimlikOku: (h) => h.replace(/`/g, '').trim(),
    kimlikYaz: (k) => '`' + k + '`',
    // `.githooks/*` + `.githooks/lib/*`. `.md` dosyaları companion/README'dir, araç değil.
    evren: () => dosyalariTara('.githooks', (b) => !b.endsWith('.md'), true),
  },
  {
    bolum: '3.5',
    tur: 'ci',
    // Hücrede YALNIZ taban ad var (`ci.yml`), kimlik ise tam yol.
    kimlikOku: (h) => '.github/workflows/' + h.replace(/`/g, '').trim(),
    kimlikYaz: (k) => '`' + path.basename(k) + '`',
    evren: () => dosyalariTara('.github/workflows', (b) => b.endsWith('.yml'), false),
  },
  {
    bolum: '3.6',
    tur: 'cetvel',
    // Hücre ÇIPLAK ve UZANTISIZ (`3d-scene-lighting-research`) — backtick yok.
    kimlikOku: (h) => 'docs/standards/' + h.replace(/`/g, '').trim() + '.md',
    kimlikYaz: (k) => path.basename(k, '.md'),
    evren: () => dosyalariTara('docs/standards', (b) => b.endsWith('.md'), false),
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// BELGE AYRIŞTIRMA — satır numaralarıyla, çünkü yazma kipi satır cerrahisi yapar.
// ─────────────────────────────────────────────────────────────────────────────

function envanterYolu(verilen) {
  if (verilen) {
    const p = path.isAbsolute(verilen) ? verilen : path.join(DEPO, verilen)
    if (!fs.existsSync(p)) throw new Kusur('envanter belgesi bulunamadi: ' + egik(p))
    return p
  }
  const dizin = path.join(DEPO, 'docs', 'audits')
  if (!fs.existsSync(dizin)) throw new Kusur('docs/audits dizini yok — envanter olcelemez')
  const adaylar = fs
    .readdirSync(dizin)
    .filter((a) => /^arac-envanteri-\d{4}-\d{2}-\d{2}\.md$/.test(a))
    .sort()
  if (!adaylar.length) throw new Kusur('docs/audits altinda arac-envanteri-<tarih>.md YOK (fail-closed)')
  return path.join(dizin, adaylar[adaylar.length - 1])
}

/**
 * Bir bölümün tablosunu bulur: `### 3.N ·` başlığından sonraki İLK boru tablosu.
 * Döner: { basSatir, ayracSatir, sonSatir, basliklar, satirlar: [{i, hucreler}] }
 */
function tabloBul(satirlar, bolum) {
  const basIdx = satirlar.findIndex((s) => new RegExp('^### ' + bolum.replace('.', '\\.') + '(\\s|·)').test(s))
  if (basIdx < 0) throw new Kusur('bolum basligi bulunamadi: ### ' + bolum)
  let i = basIdx + 1
  while (i < satirlar.length && !satirlar[i].trimStart().startsWith('|')) {
    // Sonraki bölüm başlığına çarparsak tablo yok demektir.
    if (/^#{2,3} /.test(satirlar[i])) throw new Kusur('bolum ' + bolum + ' icinde tablo YOK')
    i++
  }
  if (i >= satirlar.length) throw new Kusur('bolum ' + bolum + ' icinde tablo YOK')
  const basliklar = hucreleriAyir(satirlar[i])
  const ayracIdx = i + 1
  if (!/^\|[\s:|-]+\|?\s*$/.test(satirlar[ayracIdx] || '')) {
    throw new Kusur('bolum ' + bolum + ' tablosunda ayrac satiri yok (ayristirilamadi)')
  }
  const veri = []
  let j = ayracIdx + 1
  while (j < satirlar.length && satirlar[j].trimStart().startsWith('|')) {
    veri.push({ i: j, hucreler: hucreleriAyir(satirlar[j]) })
    j++
  }
  if (!veri.length) throw new Kusur('bolum ' + bolum + ' tablosunda VERI SATIRI yok')
  return { basSatir: i, ayracSatir: ayracIdx, sonSatir: j - 1, basliklar, satirlar: veri }
}

/** Markdown satırını hücrelere böler; `\|` kaçışını korur. */
function hucreleriAyir(satir) {
  const g = satir.trim().replace(/^\|/, '').replace(/\|$/, '')
  const cikti = []
  let cari = ''
  for (let k = 0; k < g.length; k++) {
    if (g[k] === '\\' && g[k + 1] === '|') {
      cari += '\\|'
      k++
      continue
    }
    if (g[k] === '|') {
      cikti.push(cari.trim())
      cari = ''
      continue
    }
    cari += g[k]
  }
  cikti.push(cari.trim())
  return cikti
}

function basligiBul(basliklar, adlar) {
  for (const ad of adlar) {
    const i = basliklar.findIndex((b) => b.toLowerCase().replace(/`/g, '').trim() === ad)
    if (i >= 0) return i
  }
  return -1
}

// ─────────────────────────────────────────────────────────────────────────────
// ÇAĞIRAN TARAMASI — depo-genişi TEK geçiş (envanter §2'nin beş yüzünü birden kapatır).
// ─────────────────────────────────────────────────────────────────────────────

const METIN_UZANTILARI = new Set([
  '.md', '.json', '.yml', '.yaml', '.cjs', '.mjs', '.js', '.ts', '.tsx', '.py', '.sh',
  '.ps1', '.toml', '.txt', '.sql', '', '.cts', '.mts',
])

/** Uzantısız gövde: `x.ts` ile `x.md` aynı aracın iki yüzü sayılsın diye. */
function govde(taban) {
  return taban.replace(/\.[^.]+$/, '')
}

/**
 * ⭐ANILMAK ≠ ÇAĞRILMAK — ve bu ayrım olmadan kapı FAIL-OPEN olur.
 * İlk ölçümde `tetik` sütunu `docs/audits/vibe-coding-20-madde-denetimi-2026-08-13.md`
 * gibi dosyaları çağıran sayıyordu. Bir denetim belgesinde ADI GEÇEN ölü betik böylece
 * "çağıranı var" görünür; oysa denetim belgesi tam tersini, ölü olduğunu yazıyor olabilir.
 * Cetvel AXIOM 3 çağıran kanallarını sayar: package.json `scripts`, CI `run:`, kanca komutu,
 * `.claude/settings.json`, başka betik, skill, komut rehberi. Denetim/plan/kayıt belgeleri
 * KANIT yüzeyidir, çağıran değil.
 * Bu yüzden anma iki sınıfa ayrılır ve anma-sınıfı `cagiran-yok` hükmünü BOZMAZ, yanına
 * yazılır — "ölçtüm, çağıran yok ama şu belgede anılıyor" bilgisi insana gider.
 */
function cagiranSinifi(dosya) {
  const y = egik(dosya)
  if (/^docs\/(audits|plans)\//.test(y)) return 'anma'
  if (/^registry\//.test(y)) return 'anma'
  if (/^docs\/[^/]*master[^/]*\.md$/i.test(y)) return 'anma'
  if (/^docs\/kayitlar/.test(y)) return 'anma'
  if (/^(CHANGELOG|RECOMMENDATIONS|PROJECT|CONTEXT)\.md$/.test(y)) return 'anma'
  return 'cagiran'
}

/** Depodaki metin dosyalarının listesi (git'ten; çalışma ağacına göre). */
function depoDosyalari() {
  const cikti = execFileSync('git', ['-C', DEPO, 'ls-files'], {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, MSYS_NO_PATHCONV: '1' },
  })
  return cikti
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => METIN_UZANTILARI.has(path.extname(s)))
}

/**
 * Tek geçişte "hangi dosya hangi araç adını anıyor" dizini kurar.
 * Neden tek geçiş: envanter §2'deki altı kanalın beşi (yetenek ağaçları · konformans testleri
 * ve okudukları JSON · "Üreten:" satırı · kardeş durum dosyaları · tırnaklı `uses:`) yalnızca
 * DAR DOSYA EVRENİ yüzünden kaçmıştı. Evreni depo genişletince beşi birden görülür.
 */
function cagiranDizini(aranan) {
  const dizin = new Map()
  for (const ad of aranan) dizin.set(ad, [])
  const desen = /[A-Za-z0-9_.\-/]+\.(?:cjs|mjs|js|ts|py|ps1|sh|yml|yaml|md)\b/g
  for (const dosya of depoDosyalari()) {
    let icerik
    try {
      const tam = path.join(DEPO, dosya)
      if (fs.statSync(tam).size > 2 * 1024 * 1024) continue
      icerik = fs.readFileSync(tam, 'utf8')
    } catch {
      continue
    }
    const gorulen = new Set()
    let m
    desen.lastIndex = 0
    while ((m = desen.exec(icerik)) !== null) {
      const taban = path.basename(m[0])
      if (!dizin.has(taban) || gorulen.has(taban)) continue
      gorulen.add(taban)
      // Aracın KENDİSİ ve KENDİ COMPANION'I çağıranı değildir: `x.ts` ile `x.md` aynı aracın
      // iki yüzüdür (ilk ölçümde `fix_category_name.md` kendi betiğinin "çağıranı" göründü).
      if (govde(path.basename(dosya)) === govde(taban)) continue
      dizin.get(taban).push(egik(dosya))
    }
  }
  for (const liste of dizin.values()) liste.sort()
  return dizin
}

/** Aracın kendi ilk açıklama satırından bir cümle çıkarır (cetvel §1: `ne_yapar` boş kalmaz). */
function neYapar(kimlik) {
  const tam = path.join(DEPO, kimlik)
  let icerik = ''
  try {
    icerik = fs.readFileSync(tam, 'utf8').slice(0, 4000)
  } catch {
    return '(okunamadi)'
  }
  const satirlar = icerik.split(/\r?\n/)
  for (const s of satirlar) {
    const t = s.trim()
    if (!t) continue
    // Markdown başlığı, JSDoc/shell/python yorum satırı ya da yml `name:`
    let aday = null
    if (/^#\s+/.test(t)) aday = t.replace(/^#\s+/, '')
    else if (/^name:\s*/.test(t)) aday = t.replace(/^name:\s*/, '').replace(/^["']|["']$/g, '')
    else if (/^\*\s+/.test(t) && !/^\*\s*[@/]/.test(t)) aday = t.replace(/^\*\s+/, '')
    else if (/^(#|\/\/)\s+\S/.test(t) && !/^#!/.test(t)) aday = t.replace(/^(#|\/\/)\s+/, '')
    if (aday) {
      const temiz = aday.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()
      if (temiz.length > 3) return temiz.slice(0, 160)
    }
  }
  return '(aciklama satiri yok — elle yazilmali)'
}

// ─────────────────────────────────────────────────────────────────────────────
// FARK ÖLÇÜMÜ
// ─────────────────────────────────────────────────────────────────────────────

function olc(envanterDosyasi) {
  const metin = fs.readFileSync(envanterDosyasi, 'utf8')
  const crlf = metin.includes('\r\n')
  const satirlar = metin.split(/\r?\n/)
  const sonuc = { belge: egik(path.relative(DEPO, envanterDosyasi)), bolumler: [], yeniToplam: 0, kayipToplam: 0 }

  for (const b of BOLUMLER) {
    const tablo = tabloBul(satirlar, b.bolum)
    const kimlikSayisi = b.kimlikSutunSayisi || 1
    const envanterKimlikleri = new Map()
    for (const s of tablo.satirlar) {
      const arg = s.hucreler.slice(0, kimlikSayisi)
      if (arg.every((h) => !h || /^-+$/.test(h))) continue
      const k = b.kimlikOku(...arg)
      if (!k || k.endsWith('/') || /^docs\/standards\/\.md$/.test(k)) continue
      envanterKimlikleri.set(k, s)
    }
    const fsKimlikleri = new Set(b.evren())
    const yeni = [...fsKimlikleri].filter((k) => !envanterKimlikleri.has(k)).sort()
    /**
     * ⭐UÇLAŞMIŞ SATIR DİSKTE ARANMAZ — yoksa kapı BİR DAHA ASLA yeşile dönmez.
     * İlk yazımda KAYIP satırı farkta bırakıyordum; ölçtüm, `--yaz`dan sonra `--kontrol`
     * hâlâ 1 fark veriyordu ve verecekti — sonsuza kadar. Hiç yeşile dönmeyen kapı üç günde
     * görmezden gelinir (hafıza: her turda öten uyarı). Cetvel AXIOM 3 zaten bunu söylüyor:
     * "envanter satırı SİLİNDİ olarak KALIR (tarihçe)" — tarihçe satırının karşılığı diskte
     * OLMAMALIDIR. Yani bu durumlar hükmü VERİLMİŞ satırlardır, ölçülecek fark değil.
     * Fail-open değil: dosya gerçekten yok, saklanan bir şey yok; saklanan tek şey hükmün
     * kendisidir ve o satırda YAZILI durur.
     */
    const UCLASMIS = /^(KAYIP|SILINDI|SİLİNDİ)\b/
    const uclasmisMi = (k) => {
      const iDurum = basligiBul(tablo.basliklar, ['durum'])
      if (iDurum < 0) return false
      const h = envanterKimlikleri.get(k).hucreler[iDurum] || ''
      return UCLASMIS.test(h.replace(/[*_`]/g, '').trim())
    }
    const kayip = [...envanterKimlikleri.keys()]
      .filter((k) => !fsKimlikleri.has(k))
      .filter((k) => !uclasmisMi(k))
      .sort()
    // Uçlaşmış (tarihçe) satır sayısı DIŞA VERİLİR: "envanter satırı = fs adedi" değişmezi
    // tarihçe satırları yüzünden bozulur, ve kapının kendi testi bunu bilmezse yanlış yerde
    // kırmızı verir (ilk koşumda tam bu oldu: 142 satır ↔ 141 dosya).
    const uclasmisSatir = [...envanterKimlikleri.keys()].filter(uclasmisMi).length
    sonuc.bolumler.push({
      bolum: b.bolum,
      tur: b.tur,
      envanterSatir: envanterKimlikleri.size,
      uclasmisSatir,
      fsAdet: fsKimlikleri.size,
      yeni,
      kayip,
      _tablo: tablo,
      _tanim: b,
      _envanterKimlikleri: envanterKimlikleri,
    })
    sonuc.yeniToplam += yeni.length
    sonuc.kayipToplam += kayip.length
  }
  sonuc._satirlar = satirlar
  sonuc._crlf = crlf
  return sonuc
}

// ─────────────────────────────────────────────────────────────────────────────
// INV-ARAC-2 / INV-ARAC-3 — sahip zorunluluğu ve ölü aday tazeliği
// ─────────────────────────────────────────────────────────────────────────────

/**
 * INV-ARAC-2: `sahip` alanı boş ya da "sahipsiz" olan satırları döndürür.
 * Cetvel AXIOM 2: hiçbir claim kapsamıyorsa sahip OPS'tur; "sahipsiz" GEÇERLİ DEĞER DEĞİL.
 *
 * ⚠GERÇEK BELGEDE BU EVREN BUGÜN BOŞ (ölçtüm: 0 sahipsiz satır). Yani yalnız gerçek belge
 * üzerinde koşan bir kol, ölçütü BOZULMUŞ olsa da yeşil yanar — boş evren üzerindeki yeşil
 * ölçüm değildir (hafıza: ayirt-etmeyen-gosterge-olcum-degildir). Bu yüzden testin fikstür
 * kolu var ve ölçütün gerçekten kızardığını orada kanıtlıyor.
 */
function sahipsizSatirlar(sonuc) {
  const cikti = []
  for (const b of sonuc.bolumler) {
    const iSahip = basligiBul(b._tablo.basliklar, ['sahip', 'sahip (manifest kategorisi)'])
    if (iSahip < 0) continue
    for (const [kimlik, satir] of b._envanterKimlikleri) {
      const h = (satir.hucreler[iSahip] || '').replace(/[*_`]/g, '').trim()
      const cekirdek = h.replace(/\(.*?\)/g, '').trim()
      if (!cekirdek || cekirdek === '—' || /^sahipsiz$/i.test(cekirdek)) {
        cikti.push({ bolum: b.bolum, kimlik, sahip: h })
      }
    }
  }
  return cikti
}

/**
 * INV-ARAC-3: 14 günden eski `OLU-ADAY` satırları. Hüküm ya verilir ya OLCULEMEDI + sebep.
 *
 * YAŞ NEREDEN: satır kendi tarihini taşıyorsa (`OLU-ADAY 2026-09-07`) o kullanılır; yoksa
 * belgenin adındaki tarih (`arac-envanteri-<tarih>.md`) taban alınır. Satır başına tarih
 * zorunlu kılınmadı çünkü ilk envanterin 298 satırı tarihsiz indi; belge tarihi güvenli
 * alt sınırdır (satır belgeden yeni olamaz).
 *
 * ⚠TAKVİMLE KIZARAN KAPI RİSKİ BİLİNİYOR (hafıza: takvimle-kirmiziya-donen-kapi) — bu yüzden
 * eşik GÜN'dür (saat değil) ve mesaj "hüküm ver" der, "sil" demez. `bugun` parametresi
 * zorunlu-enjekte: testin yaşı sabitlemesi için, ve kapının "bugün"ü makineden okuyup
 * deterministikliğini kaybetmemesi için.
 *
 * ⚠GERÇEK BELGEDE BU EVREN DE BUGÜN BOŞ (0 OLU-ADAY satırı) — yukarıdaki uyarı burada da geçer.
 */
function bayatOluAdaylar(sonuc, bugunISO, esikGun) {
  const esik = Number.isFinite(esikGun) ? esikGun : 14
  const bugun = Date.parse(bugunISO)
  if (!Number.isFinite(bugun)) throw new Kusur('bugun tarihi ayristirilamadi: ' + bugunISO)
  const belgeTarihi = (sonuc.belge.match(/(\d{4}-\d{2}-\d{2})/) || [])[1]
  const cikti = []
  for (const b of sonuc.bolumler) {
    const iDurum = basligiBul(b._tablo.basliklar, ['durum'])
    if (iDurum < 0) continue
    for (const [kimlik, satir] of b._envanterKimlikleri) {
      const h = (satir.hucreler[iDurum] || '').replace(/[*_`]/g, '').trim()
      if (!/^OLU-ADAY\b/.test(h)) continue
      const tarih = (h.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] || belgeTarihi
      if (!tarih) {
        cikti.push({ bolum: b.bolum, kimlik, yasGun: null, sebep: 'tarih OLCULEMEDI' })
        continue
      }
      const yasGun = Math.floor((bugun - Date.parse(tarih)) / 86_400_000)
      if (yasGun > esik) cikti.push({ bolum: b.bolum, kimlik, yasGun, tarih })
    }
  }
  return cikti
}

// ─────────────────────────────────────────────────────────────────────────────
// YAZMA KİPİ — satır cerrahisi (dokunulmayan satır bayt bayt aynı kalır)
// ─────────────────────────────────────────────────────────────────────────────

function yeniSatirMetni(bolumSonuc, kimlik, sira, cagiranlar) {
  const t = bolumSonuc._tablo
  const basliklar = t.basliklar
  const tanim = bolumSonuc._tanim
  const hucreler = new Array(basliklar.length).fill('')

  const iNe = basligiBul(basliklar, ['ne_yapar'])
  const iSahip = basligiBul(basliklar, ['sahip', 'sahip (manifest kategorisi)'])
  const iTetik = basligiBul(basliklar, ['tetik'])
  const iKanit = basligiBul(basliklar, ['kanıt', 'kanit', 'kanıt (son değişiklik · manifest)'])
  const iKapi = basligiBul(basliklar, ['kapı', 'kapi'])
  const iDurum = basligiBul(basliklar, ['durum'])
  const iTur = basligiBul(basliklar, ['tur'])

  if (tanim.bolum === '3.3') {
    const [agac, ad] = [kimlik.slice(0, kimlik.indexOf('/')), kimlik.slice(kimlik.indexOf('/') + 1)]
    hucreler[0] = String(sira)
    hucreler[1] = ad
    hucreler[2] = agac
  } else {
    hucreler[0] = tanim.kimlikYaz(kimlik)
  }

  if (iTur >= 0) hucreler[iTur] = tanim.tur
  if (iNe >= 0) hucreler[iNe] = tanim.bolum === '3.3' ? '(SKILL.md ozetinden elle)' : neYapar(kimlik)
  // AXIOM 2: hiçbir claim kapsamıyorsa sahip OPS'tur. Claim panoda (depo dışı) yaşar, kapı
  // ağa/panoya çıkmaz → betik daima cetvelin varsayılanını yazar, devri insan yapar.
  if (iSahip >= 0) hucreler[iSahip] = 'OPS'
  if (iTetik >= 0) {
    const hepsi = (cagiranlar || []).filter((x) => x !== kimlik)
    const gercek = hepsi.filter((x) => cagiranSinifi(x) === 'cagiran').slice(0, 2)
    const anma = hepsi.filter((x) => cagiranSinifi(x) === 'anma').slice(0, 1)
    if (gercek.length) {
      hucreler[iTetik] = gercek.join(', ') + ' (betik taramasi)'
    } else if (anma.length) {
      // ⭐Anma çağıran DEĞİL: hüküm `cagiran-yok` kalır, anma yanına bilgi olarak yazılır.
      hucreler[iTetik] = 'cagiran-yok (betik taramasi; anma: ' + anma[0] + ')'
    } else {
      hucreler[iTetik] = 'cagiran-yok (betik taramasi)'
    }
  }
  // "Ölçemedim" ≠ "yok": pano izleri ve CI state kasten taranmıyor (⛔KAPSAM DIŞI).
  if (iKanit >= 0) hucreler[iKanit] = 'olculemedi (repo disi izler taranmadi)'
  if (iKapi >= 0) {
    const c = (cagiranlar || []).filter((x) => /(__tests__|\/hijyen\/)/.test(x)).slice(0, 2)
    hucreler[iKapi] = c.length ? c.join(', ') : 'yok'
  }
  if (iDurum >= 0) hucreler[iDurum] = 'YENI'

  return '| ' + hucreler.map((h) => h || '—').join(' | ') + ' |'
}

/** Satırın `durum` hücresini değiştirir; geri kalan metne DOKUNMAZ. */
function durumuDegistir(satirMetni, basliklar, yeniDurum) {
  const iDurum = basligiBul(basliklar, ['durum'])
  if (iDurum < 0) return satirMetni
  const hucreler = hucreleriAyir(satirMetni)
  if (iDurum >= hucreler.length) return satirMetni
  const eski = hucreler[iDurum]
  if (eski.startsWith(yeniDurum)) return satirMetni
  // ⭐İÇ İÇE VURGU MARKDOWN'I BOZAR: eski değer `**KARANTINA** *(taşındı)*` gibi vurgulu
  // gelebilir; onu olduğu gibi parantez içine alınca `*(onceki: **X** *(...)*)*` çıkıyordu.
  // Eski hükmü DÜZ metne indirip taşıyoruz — bilgi korunur, biçim bozulmaz.
  const eskiDuz = eski.replace(/\*+/g, '').replace(/\s+/g, ' ').trim()
  hucreler[iDurum] = yeniDurum + (eskiDuz && eskiDuz !== '—' ? ' (onceki: ' + eskiDuz + ')' : '')
  return '| ' + hucreler.join(' | ') + ' |'
}

function yaz(sonuc, envanterDosyasi) {
  const satirlar = sonuc._satirlar.slice()
  // Aranan adlar: tüm yeni kimliklerin taban adları (tek geçişlik çağıran taraması için).
  const aranan = new Set()
  for (const b of sonuc.bolumler) for (const k of b.yeni) aranan.add(path.basename(k))
  const dizin = aranan.size ? cagiranDizini(aranan) : new Map()

  // Ekleme/silme satır indekslerini bozmasın diye SONDAN başa doğru işlenir.
  const bolumlerTersten = sonuc.bolumler.slice().sort((a, b) => b._tablo.sonSatir - a._tablo.sonSatir)
  for (const b of bolumlerTersten) {
    for (const k of b.kayip) {
      const s = b._envanterKimlikleri.get(k)
      satirlar[s.i] = durumuDegistir(satirlar[s.i], b._tablo.basliklar, 'KAYIP')
    }
    if (b.yeni.length) {
      const eklenecek = []
      let sira = b._tablo.satirlar.length
      for (const k of b.yeni) {
        sira++
        eklenecek.push(yeniSatirMetni(b, k, sira, dizin.get(path.basename(k))))
      }
      satirlar.splice(b._tablo.sonSatir + 1, 0, ...eklenecek)
    }
  }
  const yeniMetin = satirlar.join(sonuc._crlf ? '\r\n' : '\n')
  fs.writeFileSync(envanterDosyasi, yeniMetin, 'utf8')
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

function main(argv) {
  const yazKipi = argv.includes('--yaz')
  const jsonKipi = argv.includes('--json')
  const iEnv = argv.indexOf('--envanter')
  const verilen = iEnv >= 0 ? argv[iEnv + 1] : null

  let dosya
  try {
    dosya = envanterYolu(verilen)
  } catch (e) {
    process.stderr.write('[arac-envanteri] OLCULEMEDI (fail-closed): ' + e.message + '\n')
    return 2
  }

  let sonuc
  try {
    sonuc = olc(dosya)
  } catch (e) {
    process.stderr.write('[arac-envanteri] OLCULEMEDI (fail-closed): ' + e.message + '\n')
    return 2
  }

  if (yazKipi) {
    if (sonuc.yeniToplam + sonuc.kayipToplam === 0) {
      process.stdout.write('[arac-envanteri] fark YOK — belge degistirilmedi\n')
      return 0
    }
    yaz(sonuc, dosya)
    process.stdout.write(
      '[arac-envanteri] yazildi: ' + sonuc.yeniToplam + ' YENI satir eklendi, ' +
        sonuc.kayipToplam + ' satir KAYIP isaretlendi -> ' + sonuc.belge + '\n' +
        '  HUKUM SENIN: YENI satirlarin durum/sahip alanlari cetvel AXIOM 3 geregi insan hukmu bekler.\n',
    )
    return 0
  }

  if (jsonKipi) {
    process.stdout.write(
      JSON.stringify(
        {
          belge: sonuc.belge,
          yeniToplam: sonuc.yeniToplam,
          kayipToplam: sonuc.kayipToplam,
          bolumler: sonuc.bolumler.map((b) => ({
            bolum: b.bolum,
            tur: b.tur,
            envanterSatir: b.envanterSatir,
            uclasmisSatir: b.uclasmisSatir,
            fsAdet: b.fsAdet,
            yeni: b.yeni,
            kayip: b.kayip,
          })),
        },
        null,
        2,
      ) + '\n',
    )
    return sonuc.yeniToplam + sonuc.kayipToplam === 0 ? 0 : 1
  }

  // INV-ARAC-2 ve 3, evren farkından BAĞIMSIZ ölçülür: fark 0 olsa da sahipsiz satır ya da
  // bayat ölü aday olabilir. Üçünü tek çıkışta topluyoruz ki "kapı geçti" tek anlama gelsin.
  const sahipsiz = sahipsizSatirlar(sonuc)
  const iBugun = argv.indexOf('--bugun')
  const bugun = iBugun >= 0 ? argv[iBugun + 1] : new Date().toISOString().slice(0, 10)
  const bayat = bayatOluAdaylar(sonuc, bugun, 14)

  process.stdout.write('[arac-envanteri] belge: ' + sonuc.belge + '\n')
  for (const b of sonuc.bolumler) {
    process.stdout.write(
      '  ' + b.bolum + ' ' + b.tur.padEnd(8) + ' envanter ' + String(b.envanterSatir).padStart(3) +
        ' | fs ' + String(b.fsAdet).padStart(3) + ' | YENI ' + b.yeni.length + ' | KAYIP ' + b.kayip.length + '\n',
    )
    for (const k of b.yeni) process.stdout.write('      + ' + k + '\n')
    for (const k of b.kayip) process.stdout.write('      - ' + k + '\n')
  }
  const fark = sonuc.yeniToplam + sonuc.kayipToplam
  if (fark > 0) {
    process.stdout.write(
      '[arac-envanteri] INV-ARAC-1 KIRMIZI — evren farki ' + fark +
        ' (YENI ' + sonuc.yeniToplam + ' · KAYIP ' + sonuc.kayipToplam + ')\n' +
        '  Cetvel AXIOM 1: envantere yazilmayan arac YOKTUR. Onarim: node scripts/hijyen/arac-envanteri.cjs --yaz\n',
    )
  }
  if (sahipsiz.length) {
    process.stdout.write('[arac-envanteri] INV-ARAC-2 KIRMIZI — sahipsiz satir ' + sahipsiz.length + '\n')
    for (const s of sahipsiz) process.stdout.write('      ? ' + s.bolum + ' ' + s.kimlik + '\n')
    process.stdout.write('  Cetvel AXIOM 2: sahipsiz arac yoktur; kapsayan claim yoksa sahip OPS yazilir.\n')
  }
  if (bayat.length) {
    process.stdout.write('[arac-envanteri] INV-ARAC-3 KIRMIZI — bayat OLU-ADAY ' + bayat.length + ' (esik 14 gun)\n')
    for (const s of bayat) {
      process.stdout.write('      ! ' + s.bolum + ' ' + s.kimlik + ' — ' + (s.sebep || s.yasGun + ' gun') + '\n')
    }
    process.stdout.write('  HUKUM VER: OLU DOGRULANDI / CANLI / OLCULEMEDI+sebep. Silme Recep kapisi.\n')
  }
  if (fark === 0 && !sahipsiz.length && !bayat.length) {
    process.stdout.write('[arac-envanteri] INV-ARAC-1..3 YESIL (evren esit · sahip tam · olu aday taze)\n')
    return 0
  }
  return 1
}

module.exports = {
  olc,
  envanterYolu,
  BOLUMLER,
  depoKoku,
  hucreleriAyir,
  durumuDegistir,
  sahipsizSatirlar,
  bayatOluAdaylar,
  cagiranSinifi,
  main,
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)))
}
