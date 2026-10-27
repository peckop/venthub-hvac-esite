#!/usr/bin/env node
'use strict'

/**
 * UserPromptSubmit hook — AÇILIŞ SATIRLARI (dosya adı tarihsel: eskiden DEFTER TAZELİK SATIRI, REC-342).
 *
 * ── KARAR 419 (2026-10-26, ARC-216 eki): DEFTER SATIRI KALDIRILDI ──
 *
 * NotebookLM defterleri salt okunur arşivdir; "son eşitleme / olc / Kararlar kopyası" ölçümü ve
 * onu besleyen Stop kancası (`defter-bayatlik-olcumu.cjs`) emekli. Bu dosya ADIYLA DURUR çünkü
 * diğer kancalar, testler ve belgeler onu adıyla çağırır; içeriği artık yalnız aşağıdaki satırlardır:
 * BAĞIMLILIK, TABAN, SAGE, BELLEK, KİLİT, BAĞLAM, KAYIT, BELGE, WRONGSTACK, DÜNYA, SAHİPSİZ PR, AYAR DEĞİŞTİ.
 * Her satırın eşiği ve gerekçesi kendi bloğunda ve kendi modülünde yazılıdır.
 *
 * Çıkış DAİMA 0 — turu bloklamaz. Ölçemezse "ölçülemedi (sebep)" yazar; sessiz kalmak "yok" göstermek olur.
 *
 * stdin: { session_id?, cwd?, transcript_path? } · stdout: satırlar (bağlama eklenir) · çıkış: 0
 */

const fs = require('fs')
const path = require('path')

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

/** Arka plan ölçümlerini (BELLEK, BELGE, WRONGSTACK...) yalnız gerçek oturumda (UUID kimlik) başlatır, testte değil. */
let girdi = {}
try {
  girdi = JSON.parse(fs.readFileSync(0, 'utf8') || '{}') || {}
} catch {
  /* girdi okunamadı: bu kanca girdiye BAĞLI DEĞİL, ölçmeye devam eder */
}

/**
 * ── BAĞIMLILIK TARAMASI TAZELİĞİ (REC-345) ──
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
 * ⭐NİÇİN GÖRÜNÜR OLMASI ŞART (REC-342 dersi): aynı ölçümü yapan bir kapı var
 * (`taban-tazeligi-dunya.test.ts`) ama o yalnız master'a her push'ta ve zamanlı koşuda konuşur
 * (ALT-38: PR kapısından çıktı, suçsuz PR'ları bekletiyordu). Recep'in sorusu *"DB'de değişiklik
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
 * ⭐BU BLOK EŞİKLİDİR, KOMŞULARI DEĞİL. BAĞIMLILIK ve TABAN her turda yazar çünkü ikisi de
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
  // Eşik DEPO BAŞINA (kanban 24 saat, sage 72 saat): ayrı depoların gecikmesi ayrı söylenir (ARC-9).
  else for (const g of d.geciken || []) parca.push(g.depo + ' yedegi ' + g.saat + ' saat once')
  // Recep sözü defteri (ARC-15): karar kaydı; yedeği hiç yoksa ya da 24 saati aştıysa konuşur. Defter yoksa susar.
  try {
    const dy = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'recep-sozu-defteri-yedek.cjs'))
    const dd = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'recep-sozu-defteri.cjs'))
    if (require('fs').existsSync(dd.defterYolu())) {
      const y = dy.durum()
      if (y.dogrulanmadi.length > 0) parca.push('⛔defter yedegi DOGRULANMAMIS ' + y.dogrulanmadi.length + ' dosya')
      if (y.sonYedek === null) parca.push('defter HIC YEDEK YOK')
      else if (y.gecikti) parca.push('defter yedegi ' + y.saat + ' saat once')
    }
  } catch (e) {
    parca.push('defter yedegi OLCULEMEDI (' + String(e.message).slice(0, 50) + ')')
  }
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

/**
 * ── KİLİT (ARC-81) — EŞİKLİ ──
 * Ağır komut yuvası doluysa kim tuttuğunu söyler (boşken susar). Yalnız yuva dizini okunur.
 * Gerekçe ve sınıflama: agir-komut-kilidi.cjs.
 */
try {
  const ak = require(path.join(__dirname, 'agir-komut-kilidi.cjs'))
  const s = ak.satir(String(girdi.session_id || ''), Date.now())
  if (s) process.stdout.write(s + '\n')
} catch (e) {
  process.stdout.write('⚠KILIT: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── BAĞLAM (karar 148, 2026-09-27) — HER MESAJDA ──
 * Eşik altında düz "BAGLAM: 146k/1M"; compact sınırından sonra cevap yoksa "compact sonrasi".
 * 300k "doluyor", 500k "compact yakın" (pencere küçültülmüşse %60/%80). Konuşma kaydının son
 * 512 KB'ı okunur (~1 ms). Gerekçe ve ölçüm tanımı: baglam-doluluk.cjs.
 */
try {
  const bd = require(path.join(__dirname, 'baglam-doluluk.cjs'))
  const token = bd.sonBaglam(girdi.transcript_path)
  const pencere = bd.compactPenceresi(DEPO)
  // Compact hazırlığı (ARC-31 madde 2): durum dosyası yolu + "yarım iş" ifadesi pencere dosyasına; kokpit satırı bundan kurar.
  // ARC-131: aynı ölçüm hüküm (HAZIR/DEĞİL) ve hazır /compact metni üretir; COMPACT YAKIN satırı onu taşır.
  const durum = bd.pencereDurumOzeti(bd.PENCERE_KLASORU, girdi.session_id, girdi.transcript_path, token, pencere)
  const hazirlik =
    durum && typeof durum.hazir === 'boolean'
      ? { hazir: durum.hazir, neden: durum.hazirNeden, compactMetni: durum.compactMetni }
      : null
  const s = bd.satir(token, pencere, hazirlik)
  if (s) process.stdout.write(s + '\n')
  // ARC-131 madde 4: compact dönüşünde ilk cevap "bana ulaşan son girdin" ile başlamadıysa bir kez uyar.
  const bildirilen = bd.donusBildirilenOku(bd.PENCERE_KLASORU, girdi.session_id)
  let sonBildirilen = bildirilen
  try {
    const donus = bd.donusKontrolu(girdi.transcript_path)
    const ds = bd.donusSatiri(donus, bildirilen)
    if (ds) {
      process.stdout.write(ds + '\n')
      sonBildirilen = donus.anahtar
    }
  } catch {
    // ölçülemedi: uyarı yok, kanca bozulmaz
  }
  // Modlar bu ölçümü pencere başına dosyadan okur (ARC-33 madde 2); yazım hatası satırı bozmaz.
  bd.pencereDosyasiYaz(bd.PENCERE_KLASORU, girdi.session_id, token, pencere, process.env.CC_LANE, undefined, durum, sonBildirilen)
} catch (e) {
  process.stdout.write('⚠BAGLAM: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── KAYIT (ARC-82) — HER MESAJDA ──
 * Pencerenin konuşma dosyasının boyutu: "KAYIT: 612 MB"; 1 GB ⚠, 1,5 GB ⛔ yeni oturuma devret.
 * Yalnız statSync (dosya açılmaz). Gerekçe ve eşikler: baglam-doluluk.cjs "KAYIT BOYUTU".
 */
try {
  const bd = require(path.join(__dirname, 'baglam-doluluk.cjs'))
  const s = bd.kayitSatiri(bd.kayitBoyutuMb(girdi.transcript_path))
  if (s) process.stdout.write(s + '\n')
} catch (e) {
  process.stdout.write('⚠KAYIT: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── BELGE (REC-400 D2, HARİTA tarifi) — EŞİKLİ ──
 * Yalnız önbellek okunur; ölçüm 6 saatte bir arka planda. Gerekçe: belge-satiri.cjs.
 */
try {
  const bs = require(path.join(__dirname, 'belge-satiri.cjs'))
  const simdi = Date.now()
  const s = bs.satir(bs.oku(bs.onbellekYolu(PANO)), simdi)
  if (s) process.stdout.write(s + '\n')
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(girdi.session_id || ''))) {
    bs.gerekirseTazele(PANO, DEPO, simdi)
  }
} catch (e) {
  process.stdout.write('⚠BELGE: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── WRONGSTACK (ARC-24, karar 257) — HER MESAJDA, EŞİKSİZ ──
 * "bizde X, son Y": sabitli sürüm taze okunur, son sürüm GitHub'dan günde en çok bir kez
 * arka planda ölçülüp önbelleğe yazılır. Ağ yoksa "OLCULEMEDI". Gerekçe: wrongstack-satiri.cjs.
 */
try {
  const ws = require(path.join(__dirname, 'wrongstack-satiri.cjs'))
  const simdi = Date.now()
  process.stdout.write(ws.satir(ws.oku(ws.onbellekYolu(PANO)), DEPO, simdi) + '\n')
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(girdi.session_id || ''))) {
    ws.gerekirseTazele(PANO, simdi)
  }
} catch (e) {
  process.stdout.write('⚠WRONGSTACK: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── DIŞ KAYNAK (ARC-216 kalan kollar, KARAR 417) — EŞİKLİ ──
 * Claude Code sürümü, açık güncelleme PR sayısı, MCP bağlantı sağlığı, claude-seo / agent-skills sapması. Yalnız önbellek okunur;
 * ağ ve `claude mcp list` yalnız arka plan işçisinde, günde en çok bir kez. Eşik altında SATIR YOK. BLOKLAMAZ. Gerekçe: dis-kaynak-satirlari.cjs.
 */
try {
  const dk = require(path.join(__dirname, 'dis-kaynak-satirlari.cjs'))
  const simdi = Date.now()
  for (const s of dk.satir(dk.oku(dk.onbellekYolu(PANO)), simdi)) process.stdout.write(s + '\n')
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(girdi.session_id || ''))) {
    dk.gerekirseTazele(PANO, simdi)
  }
} catch (e) {
  process.stdout.write('⚠DIS KAYNAK: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── DÜNYA DURUMU (ALT-38) — EŞİKLİ ──
 * PR kapısından çıkan dünya durumu testlerinin zamanlı koşusu (dunya-durumu.yml) kırmızı, iptal ya da
 * sessizce ölmüşse konuşur; yoluna girdiğinde susar. Yalnız önbellek okunur, ölçüm arka planda
 * (30 dakikada bir). PR'ı BLOKLAMAZ. Gerekçe: dunya-durumu-satiri.cjs.
 */
try {
  const ds = require(path.join(__dirname, 'dunya-durumu-satiri.cjs'))
  const simdi = Date.now()
  const s = ds.satir(ds.oku(ds.onbellekYolu(PANO)), DEPO, simdi)
  if (s) process.stdout.write(s + '\n')
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(girdi.session_id || ''))) {
    ds.gerekirseTazele(PANO, simdi)
  }
} catch (e) {
  process.stdout.write('⚠DUNYA: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── SAHİPSİZ PR (ARC-111, OPS-120 madde 3) — EŞİKLİ ──
 * 7 günden eski açık PR kartsız ya da kartı kapalıysa konuşur; yoluna girince susar. Yalnız önbellek
 * okunur, ölçüm arka planda (60 dakikada bir). BLOKLAMAZ. Gerekçe: sahipsiz-pr-satiri.cjs.
 */
try {
  const sp = require(path.join(__dirname, 'sahipsiz-pr-satiri.cjs'))
  const simdi = Date.now()
  const s = sp.satir(sp.oku(sp.onbellekYolu(PANO)), simdi)
  if (s) process.stdout.write(s + '\n')
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(girdi.session_id || ''))) {
    sp.gerekirseTazele(PANO, simdi)
  }
} catch (e) {
  process.stdout.write('⚠SAHIPSIZ PR: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

/**
 * ── AYAR DEĞİŞTİ (ARC-118, REC-529 madde 1) — EŞİKLİ ──
 * Oturum içinde bir ayar (settings) ya da skill dosyası değiştiyse (ConfigChange olayının kaydı, Bash yolu dahil)
 * son 30 dakikada bu oturuma bir kez konuşur, sonra susar. Yalnız küçük bir kayıt dosyası okunur. BLOKLAMAZ.
 * Gerekçe ve kapsam sınırı: ayar-degisti-bekci.cjs.
 */
try {
  const ab = require(path.join(__dirname, 'ayar-degisti-bekci.cjs'))
  const s = ab.satir(String(girdi.session_id || ''), Date.now())
  if (s) process.stdout.write(s + '\n')
} catch (e) {
  process.stdout.write('⚠AYAR DEGISTI: OLCULEMEDI (' + String(e.message).slice(0, 70) + ')\n')
}

process.exit(0)
