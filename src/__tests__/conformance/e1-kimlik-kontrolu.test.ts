import { execFileSync } from 'node:child_process'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn, `vitest.config.ts`).
 * Ölçüm 2026-08-30, boş makine: gövde **5,05 sn**, 6 alt süreç çağrısı (her kol gerçek bir
 * geçici depo + gerçek commit kurar). Yük altında gözlenen amplifikasyon ~27×.
 * 60 sn'yi aşan kırmızı GERÇEK aşımdır. Gerekçe: `docs/standards/fleet-mechanism-standard.md` §13.
 */
vi.setConfig({ testTimeout: 60_000 })

/**
 * E1-v2 — "bu commit'i HANGİ oturum yapıyor" sorusunun kapı içindeki cevabı.
 *
 * ⭐NİÇİN VAR (2026-08-28, ALTYAPI kendi ağacında ölçtü): E1 kimliği `<git-dir>/venthub-sid`
 * dosyasından okuyordu. O dosyayı SessionStart kancası oturumun AÇILDIĞI ağaca yazar, ÇALIŞTIĞI
 * ağaca değil — bir oturum ana dizinde açılıp işi worktree'de yaparsa oradaki kimlik ESKİ sahibin
 * sid'i olarak kalır. Kapı `vh-altyapi-851` ağacında ALTYAPI'yı "başka şerit" sanıp KENDİ
 * claim'indeki dosyada bloklad. Eski dedektör bu hâli görmez: yalnız "dosya YOK"u arıyordu.
 *
 * ⭐YÖN ÖNEMLİ: o vakada hata güvenli yöne düştü (kendi işini bloklamak). Ters yön SESSİZDİR —
 * bayat sid canlı bir şeride aitse, o ağaçta çalışan kişi ONUN yetkisiyle yazar ve kapı susar.
 *
 * ⭐TESTİN BİÇİMİ KASITLI — kaynak METNİ taranmıyor, kapı GERÇEKTEN KOŞTURULUYOR. Bu depoda
 * metin taraması yorumla tatmin olan bir sahte-yeşil sınıfı ölçüldü: sabotaj gerçek çağrıyı
 * sildi, dize hâlâ dosyadaydı, kapı yeşil kaldı. Burada her kol bir alt süreç açar, gerçek bir
 * git deposunda gerçek bir commit dener ve çıktısını okur.
 *
 * Pano `VENTHUB_BOARD_DIR` ile İZOLE edilir: testin canlı filo panosuna yazması ölçümü
 * kirletirdi (bu depoda pytest'in canlı registry'ye yazdığı vaka kayıtlı).
 */

const KAPI = 'scripts/board/lane-precommit.cjs'
const CANLI = 'aaaaaaaa-1111-2222-3333-444444444444'
const BAYAT = 'bbbbbbbb-9999-8888-7777-666666666666'

interface Sonuc {
  kod: number
  ciktilar: string
  /** Kapı koştuktan SONRA kimlik dosyasında ne yazıyor — onarımın VEKİL değil ASIL kanıtı. */
  kimlikSonrasi?: string
}

function altSurecte(betik: string): Sonuc {
  const ham = execFileSync(process.execPath, ['-e', betik], { encoding: 'utf8', timeout: 90000 })
  const satirlar = ham.trim().split('\n')
  return JSON.parse(satirlar[satirlar.length - 1]) as Sonuc
}

/**
 * Geçici depo kurar, kimlik dosyasını yazar, kapıyı gerçek bir staged commit üstünde koşar.
 *
 * ⭐İLK COMMIT ZORUNLU — ölçülmüş tuzak: commit'i olmayan depoda `git rev-parse HEAD` patlar,
 * kapı "git okunamadi" koluna düşer ve HİÇ KOŞMADAN fail-open geçer. İlk yazışımda böyleydi ve
 * NEGATİF KONTROL kolları YEŞİL verdi — çünkü "susuyor" ile "hiç çalışmıyor" aynı görünür.
 * Bu yüzden aşağıda ayrıca MEKANİZMA CANLI kolu var: aynı fikstürde kapının karar VERDİĞİ
 * kanıtlanmadan sessizliği kanıt saymıyoruz.
 */
function kapiyiKos(opts: {
  dosyadaki?: string
  env?: string
  panodaGorulen?: string
  claimGlob?: string
  claimSid?: string
  /**
   * BAĞLI WORKTREE'de mi koşsun? — kimlik ONARIMI artık yalnız orada yapılıyor (cetvel §19:
   * ortak/ana ağaç hiçbir şeridin değildir, oraya kimlik yazmak yarışı sürdürür). Fikstürün
   * varsayılanı ANA ağaçtır; onarım kolları bunu açıkça `worktree: true` ile ister.
   */
  worktree?: boolean
}): Sonuc {
  const kimlikYaz = opts.dosyadaki
    ? `fs.writeFileSync(path.join(gitDir, 'venthub-sid'), ${JSON.stringify(opts.dosyadaki)} + '\\n')`
    : ''
  const panoYaz = opts.panodaGorulen
    ? `fs.writeFileSync(path.join(pano, 'events.' + ${JSON.stringify(opts.panodaGorulen)} + '.jsonl'),
         JSON.stringify({ ts: new Date().toISOString(), sid: ${JSON.stringify(opts.panodaGorulen)}, type: 'heartbeat' }) + '\\n')`
    : ''
  const envAyar = opts.env
    ? `env.CLAUDE_CODE_SESSION_ID = ${JSON.stringify(opts.env)}`
    : 'delete env.CLAUDE_CODE_SESSION_ID'
  const claimYaz =
    opts.claimGlob && opts.claimSid
      ? `fs.appendFileSync(path.join(pano, 'events.' + ${JSON.stringify(opts.claimSid)} + '.jsonl'),
           JSON.stringify({ ts: new Date().toISOString(), sid: ${JSON.stringify(opts.claimSid)},
             type: 'claim', lane: 'BASKA', globs: [${JSON.stringify(opts.claimGlob)}] }) + '\\n')`
      : ''

  return altSurecte(`
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process')
const kapi = path.resolve(${JSON.stringify(KAPI)})
const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'e1-'))
const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'e1pano-'))
const g = (a) => cp.execFileSync('git', a, { cwd: kok, encoding: 'utf8' })
g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't'])
// İLK COMMIT: HEAD olmadan kapı 'git okunamadi' koluna düşer ve hiç koşmaz.
fs.writeFileSync(path.join(kok, 'ilk.txt'), 'ilk')
g(['add', 'ilk.txt']); g(['-c', 'core.hooksPath=', 'commit', '-q', '-m', 'ilk'])
// AGAC SECIMI: kosulanKok kapinin cwd'sidir. Bagli worktree istendiginde git'in KENDI
// yerlesimi kurulur (ortak/worktrees/ad), taklit EDILMEZ — olcut yapisal oldugu icin
// fikstur de yapisal olmali.
const kosulanKok = ${opts.worktree ? `(() => {
  const wt = path.join(os.tmpdir(), 'e1wt-' + Math.random().toString(36).slice(2, 8))
  g(['worktree', 'add', '-q', wt])
  return wt
})()` : 'kok'}
const gw = (a) => cp.execFileSync('git', a, { cwd: kosulanKok, encoding: 'utf8' })
fs.writeFileSync(path.join(kosulanKok, 'dosya.txt'), 'x')
gw(['add', 'dosya.txt'])
const gitDir = gw(['rev-parse', '--absolute-git-dir']).trim()
${kimlikYaz}
${panoYaz}
${claimYaz}
const env = Object.assign({}, process.env, { VENTHUB_BOARD_DIR: pano })
${envAyar}
const r = cp.spawnSync(process.execPath, [kapi], { cwd: kosulanKok, env, encoding: 'utf8' })
let kimlikSonrasi = ''
try { kimlikSonrasi = fs.readFileSync(path.join(gitDir, 'venthub-sid'), 'utf8').trim() } catch {}
console.log(JSON.stringify({ kod: r.status, ciktilar: (r.stdout || '') + (r.stderr || ''), kimlikSonrasi }))
`)
}

describe('E1-v2 — kimlik kontrolü: dosya VEKİL kanıt, oturum ASIL kanıt', () => {
  it('MEKANİZMA CANLI — bu fikstürde kapı GERÇEKTEN karar veriyor (sessizliği kanıt yapan kol)', () => {
    // Bu kol olmadan aşağıdaki NEGATİF KONTROL hiçbir şey kanıtlamaz: hiç koşmayan kapı da
    // "susar". Burada başka bir şeridin claim'i kurulur ve kapının BLOKLADIĞI ölçülür.
    const r = kapiyiKos({
      dosyadaki: CANLI,
      env: CANLI,
      panodaGorulen: CANLI,
      claimGlob: 'dosya.txt',
      claimSid: BAYAT,
    })
    expect(r.ciktilar).toMatch(/COMMIT BLOKLANDI/)
    expect(r.kod).toBe(1)
  })

  it('NEGATİF KONTROL — kimlik doğruyken SUSAR (uyarı üretmez, commit geçer)', () => {
    const r = kapiyiKos({ dosyadaki: CANLI, env: CANLI, panodaGorulen: CANLI })
    expect(r.ciktilar).not.toMatch(/BAYAT KIMLIK/)
    expect(r.ciktilar).not.toMatch(/TANINMAYAN KIMLIK/)
    expect(r.kod).toBe(0)
  })

  it('POZİTİF — dosya BAYAT sid taşırken öter ve ASIL kimliği kullanır', () => {
    const r = kapiyiKos({ dosyadaki: BAYAT, env: CANLI, panodaGorulen: CANLI })
    expect(r.ciktilar).toMatch(/BAYAT KIMLIK/)
    expect(r.ciktilar).toMatch(new RegExp(CANLI.slice(0, 8)))
    expect(r.kod).toBe(0)
  })

  it('ÇELİŞKİDE dosyayı ASIL kimlikle onarır — DOSYA İÇERİĞİ ölçülür, mesaj değil', () => {
    // ⭐Sabotaj bu kolu bir kez kör yakaladı: writeFileSync sökülünce onar() yine `true` dönüyor
    // ve "ONARILDI" yazılıyordu. Mesaj VEKİL kanıttır; dosyanın yeni içeriği ASIL kanıttır.
    // ⭐worktree ZORUNLU (2026-08-31, §19): onarım artık YALNIZ bağlı worktree'de yapılıyor.
    const r = kapiyiKos({ dosyadaki: BAYAT, env: CANLI, panodaGorulen: CANLI, worktree: true })
    expect(r.kimlikSonrasi).toBe(CANLI)
    expect(r.ciktilar).toMatch(/ONARILDI/)
  })

  /**
   * ⭐ORTAK/ANA AĞAÇ — kimlik ONARILMAZ ve bu SESSİZ OLMAZ (2026-08-31, cetvel §19).
   *
   * Ölçülen kusur: ana dizinin git dizini ORTAK dizindir; orada açılan/resume olan her oturum
   * kimliğini oraya yazıyordu ve "sahip" en son açılan oluyordu (30 Ağustos'ta ölü bir oturum,
   * 31 Ağustos'ta canlı bir başkası). Ana dizin hiçbir şeridin DEĞİLDİR — yanlış cevap veren
   * bir kayıt, cevap vermeyenden kötüdür: okuyucuların fail-open kolunu kapatır.
   *
   * Bu kolun ölçtüğü İKİ ŞEY birlikte gerekli: dosya DEĞİŞMEMİŞ olmalı (yazma gerçekten
   * kesildi mi) VE atlamanın gerekçesi BASILMIŞ olmalı (sessizce atlamak, bu depoda tekrar
   * tekrar onarılan sınıf). Yalnız birini ölçmek yarım kapıdır.
   */
  it('⭐ORTAK AĞAÇTA kimlik ONARILMAZ — dosya DEĞİŞMEZ ve gerekçe BASILIR', () => {
    const r = kapiyiKos({ dosyadaki: BAYAT, env: CANLI, panodaGorulen: CANLI })
    expect(r.kimlikSonrasi, 'ortak agacta kimlik dosyasi YAZILMAMALI').toBe(BAYAT)
    expect(r.ciktilar, 'atlama SESSIZ olmamali').toMatch(/ONARILMADI/)
    expect(r.ciktilar).toMatch(/ORTAK agac/)
    // ASIL kimlik yine de kullanılmalı — yazmayı kesmek karar vermeyi kesmez.
    expect(r.ciktilar).toMatch(new RegExp(CANLI.slice(0, 8)))
    expect(r.kod, 'ortak agacta commit BLOKLANMAZ').toBe(0)
  })

  it('bagliWorktreeMi — ölçüt YOL BİLEŞENİ, alt-dize DEĞİL (AXIOM 8: ad süzgeci kesme yapar)', () => {
    // Modül ALT SÜREÇTE yüklenir — bu dosyanın bütün kolları gibi. (Doğrudan `require()`
    // ESLint'te yasak: `@typescript-eslint/no-require-imports`; `pnpm build` lint'i koşar,
    // yani doğrudan çağrı YEREL testte geçip ÜRETİM derlemesini kırardı — ölçüldü.)
    // Yol, dosyanın kendi idiyomuyla çözülür (bkz. KAPI): alt süreçte `path.resolve`.
    const ham = execFileSync(
      process.execPath,
      [
        '-e',
        `const m = require(require('path').resolve('scripts/board/kimlik.cjs'));
         const yollar = ['C:/repo/.git/worktrees/vh-x', 'C:\\\\repo\\\\.git\\\\worktrees\\\\vh-x',
           'C:/repo/.git', 'C:/my-worktrees-backup/.git', 'C:/repo/.git/worktrees-eski'];
         console.log(JSON.stringify(yollar.map((y) => m.bagliWorktreeMi(y))))`,
      ],
      { encoding: 'utf8', timeout: 30000 },
    )
    const [wt, wtWin, ana, altDize1, altDize2] = JSON.parse(ham.trim()) as boolean[]

    expect(wt, 'bagli worktree taninmali').toBe(true)
    expect(wtWin, 'ters bolulu yol da taninmali').toBe(true)
    expect(ana, 'ana agacin git dizini worktree DEGIL').toBe(false)
    // ⭐Alt-dize araması bu iki yolu YANLIŞ sınıflandırırdı:
    expect(altDize1, 'my-worktrees-backup alt-dizeye takilmamali').toBe(false)
    expect(altDize2, 'worktrees-eski alt-dizeye takilmamali').toBe(false)
  })

  it('⭐TANINMAYAN kimlik ÇAKIŞAN CLAIM varken BLOKLAR — uyarır ama kontrolü ATLAMAZ', () => {
    // ⭐BU KOL BİR KEZ TERS YAZILDI VE KUSURU CI BULDU (2026-08-28). İlk hâli fail-open'ı
    // (çıkış 0) doğruluyordu; gerekçem "yanlış blok --no-verify alışkanlığı doğurur" idi.
    // Gerekçe ölçümle çöktü: panoda HİÇ görülmemiş bir sid panoya HİÇ claim yazmamıştır,
    // dolayısıyla hiçbir yolun sahibi değildir — bu kolda yanlış blok YAPISAL OLARAK
    // İMKÂNSIZ. Fail-open ise gerçek bir delikti: tanınmayan her oturum başka şeridin
    // dosyasını serbestçe commit'leyebiliyordu.
    //
    // Yerel takım bunu göremedi çünkü ortamda `CLAUDE_CODE_SESSION_ID` doluydu ve env kolu
    // koşuyordu; bu dala hiç girilmiyordu. Aynı sızıntı `lane-precommit-merge` testinde de
    // vardı ve orada onarıldı.
    const r = kapiyiKos({ dosyadaki: BAYAT, claimGlob: 'dosya.txt', claimSid: CANLI })
    expect(r.ciktilar).toMatch(/TANINMAYAN KIMLIK/)
    expect(r.ciktilar).toMatch(/kontrol ATLANMIYOR/)
    expect(r.kod, 'tanınmayan kimlik başkasının claimindeki dosyayı commitleyememeli').toBe(1)
  })

  it('TANINAN kimlik (env yok ama sid panoda var) tanınmayan uyarısı ÜRETMEZ', () => {
    const r = kapiyiKos({ dosyadaki: CANLI, panodaGorulen: CANLI })
    expect(r.ciktilar).not.toMatch(/TANINMAYAN KIMLIK/)
    expect(r.kod).toBe(0)
  })

  it('KİMLİK HİÇ YOKKEN eski bootstrap kolu korunur (fail-open + görünür iz)', () => {
    const r = kapiyiKos({})
    expect(r.ciktilar).toMatch(/KIMLIK YOK/)
    expect(r.kod).toBe(0)
  })

  it('BAĞLILIK — kapı kimlik modülüne GERÇEKTEN bağlı (modül yoksa sesini değiştirir)', () => {
    // Modülün varlığı değil, kapının ONA BAĞLI olduğu ölçülüyor: kimlik.cjs'siz bir kopyada
    // kapı yükleme koluna düşer ve bunu SÖYLER. Dize araması bunu ayırt edemezdi.
    const r = altSurecte(`
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process')
const d = fs.mkdtempSync(path.join(os.tmpdir(), 'e1bag-'))
fs.mkdirSync(path.join(d, 'board'), { recursive: true })
fs.copyFileSync(${JSON.stringify(KAPI)}, path.join(d, 'board', 'lane-precommit.cjs'))
fs.copyFileSync('scripts/board/board.cjs', path.join(d, 'board', 'board.cjs'))
const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'e1bagr-'))
const g = (a) => cp.execFileSync('git', a, { cwd: kok, encoding: 'utf8' })
g(['init', '-q']); g(['config', 'user.email', 't@t']); g(['config', 'user.name', 't'])
fs.writeFileSync(path.join(kok, 'ilk.txt'), 'ilk')
g(['add', 'ilk.txt']); g(['-c', 'core.hooksPath=', 'commit', '-q', '-m', 'ilk'])
fs.writeFileSync(path.join(kok, 'a.txt'), 'x'); g(['add', 'a.txt'])
const r = cp.spawnSync(process.execPath, [path.join(d, 'board', 'lane-precommit.cjs')], { cwd: kok, encoding: 'utf8' })
console.log(JSON.stringify({ kod: r.status, ciktilar: (r.stdout || '') + (r.stderr || '') }))
`)
    expect(r.ciktilar).toMatch(/kimlik\.cjs|pano yuklenemedi/)
    expect(r.kod).toBe(0)
  })
})
