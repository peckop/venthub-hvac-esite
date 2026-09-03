#!/usr/bin/env node
/**
 * Çok-oturumlu controller panosu — ANLIK koordinasyon katmanı.
 *
 * NEDEN VAR: birden çok Claude Code oturumu aynı repoda paralel çalışıyor. Kimin neye
 * dokunduğunu öğrenmenin tek yolu `git status` çekmek ya da Recep'in mesaj taşımasıydı;
 * ikisi de tesadüfe bağlı. Elle tutulan kayıtlar (şerit panosu, registry) aynı gün üç kez
 * bayatladı — ortak kök: HATIRLAMAYA bağlı adım.
 *
 * NE DEĞİL: bu bir kilit değil, git'in yerine de geçmez. Son emniyet her zaman git'tir
 * (dal-başına-iş + PR). Bu katman, çakışmayı MERGE'DEN ÖNCE görünür kılar.
 *
 * NEDEN GIT'TE DEĞİL: git'e yazılan pano commit/push/pull'a bağlıdır — merge zamanlı bir
 * kanaldır, aynı saat içindeki çakışmayı yapısal olarak göremez. Oturumların hepsi aynı
 * makinede olduğu için dosya sistemi zaten paylaşımlı: pano anlık olabilir.
 *
 * NEDEN OTURUM BAŞINA AYRI DOSYA: tek bir jsonl'e üç süreç aynı anda append ederse
 * (Windows'ta atomiklik garanti değil) satırlar iç içe geçebilir. Her oturum YALNIZ kendi
 * dosyasına yazar, okuma hepsinin birleşimidir → yazma çekişmesi tanımı gereği yok.
 *
 * KALICI iş durumu (T00X-VH %70 gibi) buraya YAZILMAZ — o Orion registry'nin işi.
 * Pano TTL'li ve süpürülebilir; registry kalıcıdır. İkisini karıştırmak panoyu şişirir.
 */
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const BOARD_DIR = process.env.VENTHUB_BOARD_DIR || path.join('C:', 'tmp', 'venthub-board')
/** Kira ömrü: bu süre atış almayan talep BAYAT sayılır ve engellemez (ölü oturum kilitlemesin). */
const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000
/** Bu yaştan eski dosyalar hiç OKUNMAZ (sınırsız büyümeye karşı; pano anlık kanaldır). */
const PRUNE_MS = 24 * 60 * 60 * 1000
/** Kalp atışı bu sıklıktan daha sık yazılmaz (her tur satır eklemek dosyayı şişirir). */
const HEARTBEAT_MIN_INTERVAL_MS = 10 * 60 * 1000
/**
 * Cetvelden okunması ZORUNLU eşik adları (§23). Üçü de bulunamazsa `esikleriOku` null döner ve
 * yoklama hüküm vermez — eksik eşik, sessiz varsayılan DEĞİL, alarmdır.
 * ⚠Burada tanımlıdır çünkü `module.exports` bu dosyada fonksiyon tanımlarından ÖNCE gelir:
 * `const` hoist EDİLMEZ, aşağıda tanımlansaydı modül TDZ hatasıyla hiç yüklenmezdi. Bunu
 * `node --check` GÖRMEZ (sözdizimi geçerli); yakalayan şey modülü gerçekten `require` etmektir.
 */
const ESIK_ADLARI = ['SES_ESIK_DK', 'TESLIM_ESIK_DK', 'TARAMA_ESIK_TUR']
/**
 * Yoklamanın EKSENLERİ — TEK KAYNAK. Başlık dizesi ve `--help` metni BUNDAN üretilir;
 * `board-invariants` kolu ikisini de buna karşı ölçer. Sıra SÜTUN SIRASIDIR.
 *
 * ⭐NİÇİN TEK KAYNAK (ölçülmüş vaka, 2026-09-01): eksen adları ÜÇ yerde tekrar ediyordu —
 * açıklama yorumu, `yoklama()` başlığı ve `--help` metni. #942'de eksen `GOZCU` → `TARAMA`
 * oldu ve dördüncü eksen `TESLIM` eklendi; başlık güncellendi, **help geride kaldı** ve
 * günlerce "UC EKSENLI ... GOZCU=duyuyor" dedi. Eski adı yasaklayan konformans kolu bunu
 * GÖRMEDİ çünkü kol TANIMLAYICI arıyordu, kullanıcıya görünen METNİ ölçmüyordu.
 * Bu, §23'ün "gösterge doğruydu, adı yanlıştı" sınıfının aynısıdır: **kullanıcıya görünen
 * metin ölçütün adını TEKRAR ETMEZ, ondan ÜRETİLİR.** Tek satır yamamak kaymayı geri
 * getirirdi; kaymanın İMKÂNSIZ olması gerekiyordu.
 *
 * ⚠`ESIK_ADLARI` ile aynı yerde tanımlıdır ve aynı sebeple: `module.exports` aşağıdaki
 * fonksiyon tanımlarından ÖNCE gelir, `const` hoist edilmez (TDZ).
 */
const EKSENLER = [
  { ad: 'ATIS', aciklama: 'yasiyor' },
  { ad: 'TARAMA', aciklama: 'panoyu okuyor' },
  { ad: 'TESLIM', aciklama: 'bildirim ULASTI' },
  { ad: 'SES', aciklama: 'uretiyor' },
]
/** Eksen sayısının Türkçe sözcüğü — help metni "DORT EKSENLI" derken sayıyı da ÜRETİR. */
const SAYI_SOZU = { 1: 'TEK', 2: 'IKI', 3: 'UC', 4: 'DORT', 5: 'BES', 6: 'ALTI' }

/** `ATIS=yasiyor, TARAMA=panoyu okuyor, ...` — başlık ve help AYNI bu dizeyi kullanır. */
function eksenOzeti() {
  return EKSENLER.map((e) => e.ad + '=' + e.aciklama).join(', ')
}

/** `--help` metni. Eksen adı/sayısı ELLE YAZILMAZ; `EKSENLER`den üretilir (yukarıdaki vaka). */
function kullanimMetni() {
  const sayi = SAYI_SOZU[EKSENLER.length] || String(EKSENLER.length)
  return [
    'kullanım: board.cjs <claim|heartbeat|release|note|who|yoklama> --sid X [--lane Y] [--globs "a/**,b/**"] [--exact] [--to Z] [--text "..."]',
    '  --globs AYIRICISI VIRGUL — bosluk iceren deger REDDEDILIR (tek dev glob hicbir seyle eslesmez).',
    '  --exact: verilen listeyi KESIN kilar (birlestirme yok) ve KIDEMI KORUR; daraltmak icin release KULLANMA.',
    'yoklama (rollcall): filonun ' + sayi + ' EKSENLI canlilik fotografi — ' + eksenOzeti() + '. --sid istemez.',
    '--sid YAZAN fiillerde (claim/heartbeat/release/note) ZORUNLUDUR; CLAUDE_SESSION_ID doluysa oradan okunur.',
  ].join('\n')
}
/**
 * Panoya YAZAN fiiller — kimliksiz koşamazlar (T079-VH, CLI bloğuna bakınız).
 * DIŞA AÇILIR ki bekçi bu listeyi kopyalamak zorunda kalmasın: buraya yeni bir yazan fiil
 * eklenirse kapı onu kendiliğinden kapsar. Kopyalayan bir bekçi, liste büyüdüğünde kör kalır.
 */
const PANOYA_YAZAN_FIILLER = new Set(['claim', 'heartbeat', 'release', 'note'])

function ensureDir() {
  try { fs.mkdirSync(BOARD_DIR, { recursive: true }) } catch { /* yoksay */ }
}

function sessionFile(sid) {
  const safe = String(sid || 'unknown').replace(/[^\w.-]/g, '_')
  return path.join(BOARD_DIR, `events.${safe}.jsonl`)
}

/** Tek satır append — oturum kendi dosyasına yazar, çekişme yok. */
function append(sid, event) {
  ensureDir()
  const line = JSON.stringify({ ts: new Date().toISOString(), sid, ...event }) + '\n'
  fs.appendFileSync(sessionFile(sid), line, 'utf8')
}

/**
 * Kalp atışı — ama YALNIZ gerekiyorsa. Kira modeli atış olmadan çalışmaz; atışı elle
 * yapmayı beklemek "hatırlamaya bağlı adım"ı katmanın merkezine geri koyar. Bu yüzden
 * `board-brief` her turda burayı çağırır, biz de aralığı burada kısarız.
 * @returns {boolean} atış yazıldı mı
 */
function touch(sid, minIntervalMs = HEARTBEAT_MIN_INTERVAL_MS) {
  let lastTs = 0
  try {
    const raw = fs.readFileSync(sessionFile(sid), 'utf8')
    const lines = raw.split('\n').filter(l => l.trim())
    for (let i = lines.length - 1; i >= 0; i--) {
      try { const e = JSON.parse(lines[i]); lastTs = Date.parse(e.ts) || 0; break } catch { /* bozuk satır */ }
    }
  } catch { return false } // dosya yok = bu oturum hiç talep etmemiş, atacak kalp yok
  if (Date.now() - lastTs < minIntervalMs) return false
  append(sid, { type: 'heartbeat' })
  return true
}

/**
 * Tüm oturum dosyalarını oku.
 * - PRUNE_MS'ten eski dosyalar hiç AÇILMAZ (maliyet sınırı).
 * - Bozuk satır atlanır ama SESSİZ DEĞİL: stderr'e uyarı düşer (fail-open'ın sessiz
 *   olmaması cetvelin yazılı kuralı; bozuk tek satır bir şeridin korumasını düşürebilir).
 */
function readEvents() {
  ensureDir()
  let files = []
  try { files = fs.readdirSync(BOARD_DIR).filter(f => f.startsWith('events.') && f.endsWith('.jsonl')) } catch (e) {
    warn(`pano dizini okunamadı: ${e && e.message}`)
    return []
  }
  const out = []
  const cutoff = Date.now() - PRUNE_MS
  for (const f of files) {
    const full = path.join(BOARD_DIR, f)
    try { if (fs.statSync(full).mtimeMs < cutoff) continue } catch { continue }
    let raw = ''
    try { raw = fs.readFileSync(full, 'utf8') } catch (e) { warn(`okunamadı ${f}: ${e && e.message}`); continue }
    let bad = 0
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue
      try { out.push(JSON.parse(line)) } catch { bad++ }
    }
    if (bad > 0) warn(`${f}: ${bad} bozuk satır atlandı — o şeridin koruması eksik olabilir`)
  }
  out.sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
  return out
}

function warn(msg) {
  try { process.stderr.write(`[board] ${msg}\n`) } catch { /* yoksay */ }
}

/**
 * Şu an CANLI olan talepler. Kurallar:
 *  - release edilmiş şerit düşer,
 *  - TTL dolmuş talep düşer (ölü oturum kilitlemez),
 *  - aynı oturum tekrar claim ederse globlar BİRLEŞTİRİLİR ve KIDEM (ilk ts) korunur
 *    — "şeridimi genişleteyim" hareketi eskisini sessizce bırakmasın diye; daraltmak
 *    isteyen önce `release` eder.
 */
function liveClaims(now = Date.now()) {
  const events = readEvents()
  const bySession = new Map()
  for (const e of events) {
    if (e.type === 'claim') {
      const globs = Array.isArray(e.globs) ? e.globs : []
      const prev = bySession.get(e.sid)
      bySession.set(e.sid, {
        sid: e.sid,
        lane: e.lane || (prev && prev.lane) || 'lane',
        globs: prev && !e.exact ? [...new Set([...prev.globs, ...globs])] : globs,
        ts: prev ? prev.ts : e.ts, // kıdem korunur
        heartbeat: e.ts,
        ttlMs: typeof e.ttlMs === 'number' ? e.ttlMs : DEFAULT_TTL_MS,
      })
    } else if (e.type === 'heartbeat') {
      const c = bySession.get(e.sid)
      if (c) c.heartbeat = e.ts
    } else if (e.type === 'release') {
      bySession.delete(e.sid)
    }
  }
  const live = []
  for (const c of bySession.values()) {
    const age = now - Date.parse(c.heartbeat)
    if (Number.isFinite(age) && age <= c.ttlMs) live.push(c)
  }
  // En erken talep önce (çakışan yol iddialarında deterministik sonuç — bkz. findConflict).
  live.sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
  return live
}

/**
 * BIRAKILMAMIŞ tüm talepler — bayat olanlar DÜŞMEZ, `bayat: true` ile işaretlenir (T084-VH).
 *
 * NİÇİN AYRI FONKSİYON: `liveClaims` TTL'i dolmuş talebi listeden ATAR ve bu **engelleme**
 * için doğrudur (ölü oturum kimseyi kilitlemesin). Ama aynı liste panoyu/brifingi de
 * besliyordu ve orada **sessiz bir bilgi kaybı** üretiyordu: 2026-08-18'de EDGE şeridi
 * 240 dakika atış almadıktan sonra listeden TAMAMEN kayboldu. Sonuç: "listede yok" ifadesi
 * iki bambaşka durumu aynı gösteriyor —
 *   (a) iş bitti, şerit bilinçli bırakıldı  ·  (b) oturum koptu, şerit SAHİPSİZ kaldı.
 * (b) hâlinde o globlar kimsenin bakmadığı bir alan olur ve kimse fark etmez; oysa bu
 * devralma kararı gerektiren bir bilgidir. Sahte-yeşil ailesinin görünürlük biçimi:
 * yokluk "sorun yok" gibi okunuyor.
 *
 * ⚠ `findConflict` bilinçli olarak BUNU KULLANMAZ, `liveClaims`'i kullanır: bayat bir şerit
 * GÖRÜNÜR olmalı ama BLOKLAMAMALIDIR. İkisini birleştirmek ölü oturumun kilidini geri getirir.
 */
function tumTalepler(now = Date.now()) {
  const canli = new Set(liveClaims(now).map(c => c.sid))
  const events = readEvents()
  const bySession = new Map()
  for (const e of events) {
    if (e.type === 'claim') {
      const globs = Array.isArray(e.globs) ? e.globs : []
      const prev = bySession.get(e.sid)
      bySession.set(e.sid, {
        sid: e.sid,
        lane: e.lane || (prev && prev.lane) || 'lane',
        globs: prev && !e.exact ? [...new Set([...prev.globs, ...globs])] : globs,
        ts: prev ? prev.ts : e.ts,
        heartbeat: e.ts,
        ttlMs: typeof e.ttlMs === 'number' ? e.ttlMs : DEFAULT_TTL_MS,
      })
    } else if (e.type === 'heartbeat') {
      const c = bySession.get(e.sid)
      if (c) c.heartbeat = e.ts
    } else if (e.type === 'release') {
      bySession.delete(e.sid) // BIRAKILAN şerit gerçekten düşer: bu bilinçli bir kapanış
    }
  }
  const out = []
  for (const c of bySession.values()) {
    const yasMs = now - Date.parse(c.heartbeat)
    out.push({
      ...c,
      bayat: !canli.has(c.sid),
      yasDk: Number.isFinite(yasMs) ? Math.max(0, Math.round(yasMs / 60000)) : null,
    })
  }
  out.sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
  return out
}

/** Glob → RegExp. `**` her şeyi, `*` tek segmenti karşılar. */
function globToRegExp(glob) {
  const norm = String(glob).replace(/\\/g, '/')
  let re = ''
  for (let i = 0; i < norm.length; i++) {
    const ch = norm[i]
    if (ch === '*') {
      if (norm[i + 1] === '*') { re += '.*'; i++; if (norm[i + 1] === '/') i++ }
      else re += '[^/]*'
    } else if ('\\^$+?.()|{}[]'.includes(ch)) {
      re += '\\' + ch
    } else {
      re += ch
    }
  }
  return new RegExp('^' + re + '$', 'i')
}

/**
 * Dosyanın ait olduğu repo kökü. `cwd`'ye GÜVENİLMEZ: bu oturumda birden çok çalışma
 * dizini kayıtlı ve `EnterWorktree` cwd'yi değiştiriyor; alt dizinden koşulduğunda da
 * cwd kök değildir. İkisinde de yol repo-göreli olmaz, hiçbir glob tutmaz ve koruma
 * SESSİZCE düşer (yanlış-negatif). Kökü git'ten sorarız.
 */
function repoRootFor(filePath) {
  const norm = String(filePath).replace(/\\/g, '/')
  const dir = norm.endsWith('/') ? norm : path.posix.dirname(norm)
  try {
    return execFileSync('git', ['-C', dir, 'rev-parse', '--show-toplevel'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim().replace(/\\/g, '/')
  } catch { return '' }
}

/**
 * AĞAÇ KONUMU — "burası ANA dizin mi, yoksa bir worktree mi?" (§28)
 *
 * ⭐NİÇİN VAR: 2026-09-01..04 arasında ALTI vaka ölçüldü (URUN 4 + ALTYAPI 2) — kabuk
 * sessizce ANA dizine kaydı ve şerit işi paylaşılan ağaçta koştu. Altı vakanın beşinde
 * zarar SIFIRDI ve tam bu yüzden hiçbiri bir mekanizma doğurmadı: **bedelsiz hata en
 * uzun yaşayandır** (§27).
 *
 * ⭐AYIRT EDİCİ ÖLÇÜT, ölçülerek bulundu: `--git-dir` ile `--git-common-dir`.
 * Bağlı bir worktree'de bunlar FARKLIDIR (`<ana>/.git/worktrees/<ad>` ve `<ana>/.git`);
 * ana worktree'de AYNIDIR. Yani konum, dizin ADINDAN ya da sabit bir yol listesinden
 * değil, git'in kendi durumundan okunur — sabit yol yazmak bu ölçütü makineye bağlar
 * ve başka makinede sessizce yanlış cevap verir.
 *
 * ⚠NİÇİN "kök eşitliği" YETMEZ: `rev-parse --show-toplevel` her iki hâlde de bir kök
 * döndürür ve iki farklı worktree'nin kökleri de farklıdır — yani kök karşılaştırması
 * "iki ayrı worktree" ile "worktree vs ana dizin" arasında AYRIM YAPMAZ. Aranan ayrım
 * ikincisidir, çünkü tehlikeli olan paylaşılan ağaçta çalışmaktır.
 */
/**
 * ⭐AYRISMA SAYIMI — VAKA ile TUR AYRI BIRIMLERDIR (REC-130 duzeltmesi, Recep emri 09-04).
 *
 * ⚠NICIN VAR: bu sayac ilk halinde her TUR SONU artiyordu ama metin "N. kayitli VAKA"
 * diyordu. OLCULDU: bana once "6. vaka", iki saat sonra "32. vaka" dedi — arada 26 yeni
 * ayrisma OLMADI, 26 TUR gecti. Yani sayi olceginin ADI yanlisti ve sinifin ne kadar can
 * yaktigi hakkinda buyutulmus bir izlenim veriyordu.
 *
 * Bu, kendi yazdigim dersin ihlaliydi: **alan adi BIRIMI taahhut eder.** Kusuru kendim
 * buldum, olctum ve Recep siradan cikarip duzeltmemi soyledi.
 *
 * IKI BIRIM, IKISI DE ANLAMLI (OPS karari: (b)+(c)):
 *   · VAKA = ayrismanin KENDISI. Ayni oturum ayni dizinde kaldigi surece TEK vakadir;
 *     dizin degisip GERI DONULURSE yeni vaka baslar.
 *   · TUR  = MARUZIYET olcusu. Her tur sonu artar; ayrismanin ne kadar SURDUGUNU soyler.
 * Metin ikisini birden gosterir ("3. vaka · 33. tur") cunku biri "kac kez oldu", oteki
 * "ne kadar surdu" sorusunu cevaplar ve tek sayi ikisini birden anlatamaz.
 *
 * ⚠SAF TUTULDU (s25/s26): girdi onceki KAYIT, cikti yeni kayit. Disk/saat okumaz —
 * `ts` parametre olarak gelir. Boylece kol durumu URETEBILIR ve kanca bu fonksiyonun
 * TUKETICISI olur; sayim iki yerde iki kez hesaplanmaz.
 *
 * GERIYE UYUM: eski kayitta yalniz `toplam` vardi, `vaka` alani YOKTU. Eski turlarin kac
 * ayri vaka oldugu BILINMIYOR — o yuzden en MUHAFAZAKAR secim yapilir ve hepsi TEK vaka
 * sayilir (uydurulmus bir sayi, olculmemis bir gecmisi olculmus gibi gosterirdi).
 */
function ayrismaSay(onceki, sid, dizin, ts) {
  const yer = String(dizin || '').replace(/\\/g, '/').toLowerCase()
  const o = onceki && typeof onceki === 'object' ? onceki : null
  // `tur` yoksa eski `toplam` alanindan devralinir — eski kayit TUR sayiyordu.
  const turOnce = Number(o && (o.tur !== undefined ? o.tur : o.toplam)) || 0
  const vakaOnce = Number(o && o.vaka) || 0
  const sonYer = String((o && o.son && o.son.dizin) || '').replace(/\\/g, '/').toLowerCase()
  const ayniYer = !!(o && o.son && String(o.son.sid) === String(sid) && sonYer === yer)
  return {
    vaka: ayniYer ? Math.max(vakaOnce, 1) : vakaOnce + 1,
    tur: turOnce + 1,
    son: { sid: String(sid), ts: String(ts), dizin: String(dizin) },
  }
}

function agacKonumu(dir) {
  const hedef = String(dir || process.cwd()).replace(/\\/g, '/')
  try {
    const cikti = execFileSync(
      'git',
      ['-C', hedef, 'rev-parse', '--path-format=absolute', '--git-dir', '--git-common-dir'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    )
    const [gitDir, ortakGitDir] = cikti.trim().split('\n').map(s => s.trim().replace(/\\/g, '/'))
    if (!gitDir || !ortakGitDir) return { olculdu: false, sebep: 'git-dir okunamadi' }
    return {
      olculdu: true,
      gitDir,
      ortakGitDir,
      /** Ana worktree'de git-dir ile ortak git-dir AYNIDIR. */
      anaMi: gitDir.toLowerCase() === ortakGitDir.toLowerCase(),
      kok: repoRootFor(hedef + '/'),
      /** Ana worktree yolu = ortak .git'in ebeveyni. Sabit yol YAZILMAZ, türetilir. */
      anaAgac: ortakGitDir.replace(/\/\.git$/i, ''),
    }
  } catch (e) {
    // FAIL-OPEN AMA GÖRÜNÜR: git yoksa/dizin yoksa çağıran karar verir; sessiz "temiz"
    // dönmek, ölçememeyi geçmek saymak olurdu.
    return { olculdu: false, sebep: String((e && e.message) || e).slice(0, 120) }
  }
}

/** Mutlak/göreli yolu repo-göreli hâle getir (pano yolları repo-göreli tutulur). */
function toRepoRelative(filePath, repoRoot) {
  const norm = String(filePath).replace(/\\/g, '/')
  const roots = [repoRoot, repoRootFor(norm), process.cwd()]
    .filter(Boolean)
    .map(r => String(r).replace(/\\/g, '/').replace(/\/$/, ''))
  for (const root of roots) {
    if (norm.toLowerCase().startsWith(root.toLowerCase() + '/')) return norm.slice(root.length + 1)
  }
  return norm.replace(/^\.\//, '')
}

/**
 * Bu yol BAŞKA bir oturumun canlı talebine giriyor mu?
 *
 * "EN ERKEN KAZANIR" (cetvel §K2): benim talebimden SONRA gelen bir talep beni bloklamaz.
 * Aksi hâlde aynı yolu iki oturum talep ettiğinde İKİSİ de yazamaz — karşılıklı kilit,
 * yani katmanın kendisi kesinti kaynağı olur. Kıdemli olan çalışır, geç gelen engellenir.
 */
function findConflict(filePath, sid, repoRoot) {
  const rel = toRepoRelative(filePath, repoRoot)
  const live = liveClaims()
  const mine = live.find(c => c.sid === sid)
  for (const c of live) {
    if (c.sid === sid) continue
    if (mine && String(c.ts).localeCompare(String(mine.ts)) > 0) continue // ben daha kıdemliyim
    for (const g of c.globs) {
      if (globToRegExp(g).test(rel)) return { claim: c, glob: g, rel }
    }
  }
  return null
}

/**
 * İnsan/ajan için kısa pano özeti.
 *
 * Talepler OTURUM başına tutulur, şerit ADI başına değil: aynı adı iki oturum kullanabilir
 * (ör. bir oturum yeniden başlatıldığında eskisi TTL dolana dek görünür). Bu, "şerit iki kez
 * yazılmış" gibi okunup kafa karıştırıyordu — artık ÇAKIŞMA olarak işaretlenir, çünkü aynı
 * adı taşıyan iki canlı talep birbirini bloklayabilir (kıdemsiz olan yazamaz).
 */
function summary(sid) {
  // BAYAT şeritler artık DÜŞMEZ, etiketle gösterilir (T084-VH — bkz. tumTalepler yorumu).
  const hepsi = tumTalepler()
  if (hepsi.length === 0) return 'PANO: talep yok.'
  const laneCount = new Map()
  for (const c of hepsi) if (!c.bayat) laneCount.set(c.lane, (laneCount.get(c.lane) || 0) + 1)
  const lines = hepsi.map(c => {
    const mine = c.sid === sid ? ' (sen)' : ''
    // Çakışma uyarısı yalnız CANLI şeritler için anlamlı: bayat olan bloklamıyor.
    const dup = !c.bayat && laneCount.get(c.lane) > 1 ? ' ⚠ AYNI ŞERİT ADI birden çok oturumda' : ''
    const bayat = c.bayat
      ? ` ⚠ BAYAT (${c.yasDk}dk atış yok — bırakılmadı, SAHİPSİZ olabilir; bloklamıyor)`
      : ''
    return `  · ${c.lane}${mine}${dup}${bayat} — ${c.globs.join(', ')} [${c.sid.slice(0, 8)}, ${c.yasDk}dk önce]`
  })
  const bayatSayi = hepsi.filter(c => c.bayat).length
  const bas = bayatSayi > 0
    ? `PANO — şeritler (${hepsi.length - bayatSayi} canlı, ${bayatSayi} BAYAT):`
    : 'PANO — canlı şeritler:'
  return bas + '\n' + lines.join('\n')
}

/** Bu oturumun teslim aldığı son not zamanı (`seen` işareti). */
function lastSeen(sid, events) {
  let last = ''
  for (const e of events || []) {
    if (e.type === 'seen' && e.sid === sid && typeof e.upto === 'string' && e.upto > last) last = e.upto
  }
  return last
}

/**
 * OKUNMAMIŞ notlar. `seen` işaretiyle filtrelenir; yoksa aynı not her turda tekrar basılır
 * ve brifingin tek değeri olan "sessizlik kuralı" zamanla bozulur (gürültü → okunmaz katman).
 */
function notesFor(sid, lane, events) {
  const evs = events || readEvents()
  const since = lastSeen(sid, evs)
  return evs.filter(e =>
    e.type === 'note' &&
    e.sid !== sid &&
    String(e.ts) > since &&
    (!e.to || e.to === sid || (lane && e.to === lane))
  ).slice(-5)
}

/**
 * "herkese" anlamına gelen serbest-metin hedefleri. GÖNDERİMDE broadcast'e çevrilirler.
 *
 * NİÇİN LİSTE: `notesFor` tam-eşitlik arıyor, yani `to:'herkes'` **hiçbir** oturumla eşleşmez
 * ve not sessizce yok olur. 2026-08-16'da ölçüldü: 110 notun 38'i tam bu yüzden kayboldu
 * (`herkes` 37 + `ALL` 1) ve komut her seferinde "not bırakıldı" bastı.
 */
const BROADCAST_WORDS = new Set(['herkes', 'hepsi', 'tumu', 'tümü', 'all', 'everyone', 'broadcast', '*'])

/** Panoda adı geçen tüm oturumlar (yalnız canlı olanlar değil). */
function knownSids(events) {
  return [...new Set((events || readEvents()).map(e => e.sid).filter(Boolean))]
}

/**
 * `--to` değerini TESLİM EDİLEBİLİR bir hedefe çevir. Çözüm GÖNDERİM ANINDA yapılır ve
 * sonuç kalıcı yazılır — şerit adı sonradan değişse (`PRICING`→`PRICING-STOK`,
 * `EDGE`→`EDGE-REFUND`, `ADMIN-UX`→`ADMIN-OPS` hepsi 2026-08-16'da oldu) veya şerit
 * bırakılsa bile not teslim edilebilir kalır.
 *
 * ⚠ KARAR: şerit adı → **OTURUM**a çözülür, role değil. Bugünkü modelde şerit = oturum
 * olduğu için doğru; cetvel `multi-session-coordination-standard.md §Not adresleme`'de
 * tek cümleyle yazılı. Rol-tabanlı teslim isteniyorsa çözüm burada değil, cetvelde değişir.
 *
 * @returns {{ok:true,to:string,how:string}|{ok:false,reason:string,valid:string[]}}
 */
/**
 * Bir sid'in ŞERİT ADI — en son `claim`inden okunur.
 *
 * ⭐NİÇİN VAR (ölçülmüş vaka, 2026-08-30/31, üç kez): çıktı `oturum ac03ce11 (kısaltmadan
 * çözüldü)` diyordu. Bu satırın doğruladığı TEK şey "bu sid'i çözdüm"dür; "bu sid OPS'tur"
 * kısmını GÖNDEREN varsayıyordu ve araç onu hiç doğrulamıyordu. Üç kez yanlış şeride not
 * düştü — biri bir iş emrinin sıralama talebi, biri prod migration onayı. Hiçbirinde hata
 * oluşmadı: **başarılı teslimat, DOĞRU ALICI kanıtı değildir.**
 *
 * Çözüm ucuz: hedefi basarken ŞERİDİ de bas. O zaman gönderen "OPS bekliyordum, ALTYAPI
 * yazıyor" diye GÖNDERİM ANINDA görür — okuyanın fark etmesini beklemeden.
 * Cetvel: `docs/standards/fleet-mechanism-standard.md` §17.
 */
function seritAdi(sid, evs) {
  let ad = '', enSon = ''
  for (const e of evs) {
    if (e.type !== 'claim' || e.sid !== sid || !e.lane) continue
    if (String(e.ts) >= enSon) { enSon = String(e.ts); ad = String(e.lane) }
  }
  return ad
}

/** `oturum <8hane>` + varsa `[ŞERİT]`. Şerit bilinmiyorsa SESSİZ KALMAZ, "şerit? " der. */
function hedefEtiketi(sid, evs, ek) {
  const ad = seritAdi(sid, evs)
  const serit = ad ? `${ad} ` : 'şerit? '
  return `${serit}[${sid.slice(0, 8)}]${ek ? ' ' + ek : ''}`
}

function resolveNoteTarget(rawTo, events) {
  const evs = events || readEvents()
  const raw = String(rawTo == null ? '' : rawTo).trim()
  if (!raw) return { ok: true, to: '', how: 'broadcast (hedef verilmedi)' }
  if (BROADCAST_WORDS.has(raw.toLowerCase())) return { ok: true, to: '', how: `broadcast ("${raw}" → herkese)` }

  const sids = knownSids(evs)
  const exact = sids.find(s => s === raw)
  if (exact) return { ok: true, to: exact, how: hedefEtiketi(exact, evs) }

  // Kısaltma (8-hane vb.) → tam UUID. Belirsizse hata: yanlış oturuma teslim etmeyiz.
  if (raw.length >= 4) {
    const pref = sids.filter(s => s.startsWith(raw))
    if (pref.length === 1) return { ok: true, to: pref[0], how: hedefEtiketi(pref[0], evs, '(kısaltmadan çözüldü)') }
    if (pref.length > 1) {
      return { ok: false, reason: `"${raw}" kısaltması ${pref.length} oturumla eşleşiyor — tam UUID ver`, valid: pref }
    }
  }

  // Şerit adı → o şeridi en SON talep eden oturum. Canlı olan tercih edilir.
  const laneOwners = new Map()
  for (const e of evs) {
    if (e.type === 'claim' && e.lane && String(e.lane).toLowerCase() === raw.toLowerCase()) laneOwners.set(e.sid, e.ts)
  }
  if (laneOwners.size > 0) {
    const liveSids = new Set(liveClaims().map(c => c.sid))
    const cands = [...laneOwners.entries()].sort((a, b) => String(b[1]).localeCompare(String(a[1])))
    const live = cands.filter(([s]) => liveSids.has(s))
    const pick = (live.length > 0 ? live : cands)[0][0]
    if (live.length > 1) {
      return { ok: false, reason: `"${raw}" şeridini ${live.length} canlı oturum tutuyor — tam UUID ver`, valid: live.map(([s]) => s) }
    }
    return { ok: true, to: pick, how: hedefEtiketi(pick, evs, `(şerit adı "${raw}" ile verildi)`) }
  }

  const lanes = [...new Set(evs.filter(e => e.type === 'claim' && e.lane).map(e => e.lane))]
  return {
    ok: false,
    reason: `"${raw}" ne bir oturum ne de bir şerit — not YAZILMADI`,
    valid: [...lanes, ...sids.map(s => s.slice(0, 8))],
  }
}

/** Teslim edilen notları okundu işaretle (append-only modele sadık: kendi dosyana yazarsın). */
function markSeen(sid, notes) {
  if (!notes || notes.length === 0) return
  const upto = notes.map(n => String(n.ts)).sort().pop()
  append(sid, { type: 'seen', upto })
}

module.exports = {
  BOARD_DIR, DEFAULT_TTL_MS, PRUNE_MS, BROADCAST_WORDS, PANOYA_YAZAN_FIILLER,
  append, touch, readEvents, liveClaims, tumTalepler, findConflict, summary,
  notesFor, markSeen, lastSeen, resolveNoteTarget, knownSids, yoklama, sidDogrula,
  taramaDurumu, teslimDurumu, esikleriOku, ESIK_ADLARI,
  EKSENLER, SAYI_SOZU, eksenOzeti, kullanimMetni,
  globToRegExp, toRepoRelative, repoRootFor, agacKonumu, ayrismaSay,
}

/**
 * YOKLAMA — filonun canlılık fotoğrafı, ÜÇ AYRI EKSENDE.
 *
 * NİÇİN ÜÇ EKSEN (2026-08-20 ölçümü): "atışı taze" ile "şerit çalışıyor" AYNI ŞEY DEĞİL.
 * Ölçülen vaka: bir şeridin atışı 1 dakikalıktı, son notu 1642 dakikalıktı ve içeriği
 * "test"ti. Atış oturumun YAŞADIĞINI söyler; panoyu DUYDUĞUNU ya da iş ÜRETTİĞİNİ söylemez.
 * Tek eksenli canlılık bu üç durumu tek kelimeye ("canlı") indirger ve sağırlığı GİZLER.
 *
 *   ATIS   = oturum yaşıyor mu        → board heartbeat yaşı
 *   TARAMA = gözcü panoyu OKUYOR mu   → gozcu.cjs kalıcı imlecinin son tarama yaşı
 *   TESLIM = bildirim KONUŞMAYA ULAŞTI mı → son DOĞRULANMIŞ teslimat damgasının yaşı
 *   SES    = iş ÜRETİYOR mu           → son notunun yaşı
 *
 * TARAMA ekseni 2026-08-20'de kazanılmıştı: o sabah dört oturum sağır kaldı ve bunu kimse
 * panodan göremedi, çünkü pano yalnızca YAZANI ölçüyordu, OKUYANI değil.
 *
 * ⭐TARAMA ile TESLIM NİÇİN AYRI SÜTUN (§23, ölçüldü 2026-09-01 — 62 dakika kayıp):
 * Bu eksen eskiden tek sütundu ve adı `GOZCU = panoyu DUYUYOR mu`ydu. O gün şerit compact
 * sonrası bir saat boyunca hiçbir bildirim almadı; Recep uyandırdı. Sütun o an **YEŞİL**
 * gösteriyordu ve **yanlış da değildi**: imleç 14 saniye öncesine aitti. Çünkü imleci
 * **gözcü süreci** yazar ve o süreç compact'i bir OS süreci olarak sağ atlatır. Ölen şey
 * bildirimin **konuşmaya teslimi**dir; imleçte bunun izi YOKTUR.
 * Yani sütun gerçek bir şeyi doğru ölçüyor, ama okuyucuya **başka bir şeyi** vaat ediyordu.
 * Bir ölçümün adı, ölçtüğü şeyin sınırını taşımak zorundadır — paneli okuyan, ölçümün
 * kodunu okumaz. Bu yüzden iki kavram iki sütundur ve `gozcuDurumu` adı kaldırılmıştır
 * (tek kavrama iki ad, ölçütün birinin bayatlaması demektir).
 */
function taramaDurumu(sid, now, esikTur = 3) {
  try {
    const iy = path.join(BOARD_DIR, '.gozcu-imlec.' + String(sid).slice(0, 8) + '.json')
    const im = JSON.parse(fs.readFileSync(iy, 'utf8'))
    const aralikSn = Number(im.aralikSn || 60)
    if (!im.sonTarama) return 'IMLEC BOS'
    const yasSn = (now - Date.parse(im.sonTarama)) / 1000
    // Üç tarama aralığı: bir tur kaçırmak gürültü, üç tur kaçırmak arızadır.
    return yasSn <= aralikSn * esikTur ? 'TARIYOR' : 'ASILMIS'
  } catch {
    // Dosya yok ya da bozuk. DİKKAT: bu "gözcüsü YOK" demek DEĞİL — şeridin kendi
    // izleyicisi olabilir ama ölçülebilir imleç sözleşmesini yazmıyordur. "Ölçemedim" ile
    // "yok" ayrı şeylerdir; etiket bu yüzden KANITSIZ. Fail-closed davranış aynı kalır
    // (kanıtsız katman çökmüş sayılır), ama hüküm doğru adlandırılır.
    return 'KANITSIZ'
  }
}

/**
 * TESLIM — bildirimin KONUŞMAYA ulaştığı en son DOĞRULANMIŞ an (§23 HÜKÜM 3).
 *
 * Damgayı `mechanism-setup.cjs dogrula --jeton <bildirimde-görülen>` yazar; yani bu ölçüm
 * ancak bir AJAN jetonu gerçekten bildirimde GÖRÜP geri yazdıysa doludur. Hiçbir süreç bu
 * damgayı kendi kendine üretemez — `prob`un yazdığı `jeton` alanı YETMEZ, çünkü prob yalnızca
 * gözcünün panoyu okuduğunu kanıtlar. Ayrım kasıtlıdır: teslimatın tek kanıtı, kanalın öteki
 * ucundaki ajanın konuşmasıdır.
 *
 * DÖNÜŞ: dakika (sayı) · 'KANITSIZ' (damga hiç yok / okunamadı) — "ölçemedim" ile "yok" ayrı
 * şeyler olduğu için etiket KANITSIZ'dır, fakat hüküm fail-closed'dır: kanıtsız katman
 * çökmüş sayılır.
 */
function teslimDurumu(sid, now) {
  try {
    const dy = path.join(BOARD_DIR, '.mekanizma-durum.' + String(sid).slice(0, 8) + '.json')
    const d = JSON.parse(fs.readFileSync(dy, 'utf8'))
    if (!d.teslimDogrulandiTs) return 'KANITSIZ'
    const yas = Math.round((now - Date.parse(d.teslimDogrulandiTs)) / 60000)
    return Number.isFinite(yas) ? yas : 'KANITSIZ'
  } catch {
    return 'KANITSIZ'
  }
}

/**
 * EŞİKLER CETVELDEN OKUNUR, KODA GÖMÜLMEZ (§23 HÜKÜM 4-5).
 *
 * NİÇİN: 62 dakikalık sessizlikte ayırt eden sayı satırda ZATEN vardı (`SES 64dk`); eksik olan
 * şey onu bir eşiğe bağlamaktı. Eşik koda gömülürse hüküm görünmez olur ve değiştirmek için
 * kod okumak gerekir. Cetvel SSOT'tur; burası yalnızca okur.
 *
 * FAIL-CLOSED: blok yoksa ya da biçimi bozulmuşsa SESSİZ VARSAYILANA DÜŞMEZ — `null` döner ve
 * yoklama bunu ALARM olarak basar. Sessiz varsayılan, eşiği silen bir değişikliği yeşil
 * gösterirdi; tam olarak kaçındığımız kusur bu.
 */
function esikleriOku(cetvelYolu) {
  try {
    const yol = cetvelYolu || path.join(
      repoRootFor(__filename) || path.join(__dirname, '..', '..'),
      'docs', 'standards', 'fleet-mechanism-standard.md',
    )
    const metin = fs.readFileSync(yol, 'utf8')
    const bas = metin.indexOf('ESIKLER-BASLANGIC')
    const son = metin.indexOf('ESIKLER-BITIS')
    if (bas < 0 || son < 0 || son < bas) return null
    const blok = metin.slice(bas, son)
    const cikti = {}
    for (const ad of ESIK_ADLARI) {
      const m = blok.match(new RegExp(ad + '\\s*:\\s*(\\d+)'))
      if (!m) return null
      cikti[ad] = Number(m[1])
    }
    return cikti
  } catch {
    return null
  }
}

function yoklama(now = Date.now()) {
  const events = readEvents()
  const hepsi = tumTalepler(now)
  if (hepsi.length === 0) return 'YOKLAMA: panoda talep yok.'

  const dk = (ts) => (ts ? Math.round((now - Date.parse(ts)) / 60000) : null)
  const yasYaz = (d) => (d === null ? 'YOK' : d + 'dk')

  const sonNot = new Map()
  for (const e of events) {
    if (e.type !== 'note' || !e.sid) continue
    const o = sonNot.get(e.sid)
    if (!o || String(e.ts) > String(o)) sonNot.set(e.sid, e.ts)
  }

  /**
   * Eşikler CETVELDEN. Okunamazsa hiçbir satırda hüküm verilmez ve bu SESSİZ KALMAZ:
   * varsayılana düşmek, eşiği silen değişikliği yeşil göstermek olurdu (§23 HÜKÜM 5).
   */
  const esik = esikleriOku()

  const durumlar = hepsi.map((c) => ({
    c,
    tarama: taramaDurumu(c.sid, now, esik ? esik.TARAMA_ESIK_TUR : 3),
    teslim: teslimDurumu(c.sid, now),
    sesDk: dk(sonNot.get(c.sid)),
  }))

  const teslimYaz = (t) => (t === 'KANITSIZ' ? 'KANITSIZ' : t + 'dk')

  const satirlar = durumlar.map(({ c, tarama, teslim, sesDk }) => {
    const bayrak = c.bayat ? ' [BAYAT-TALEP]' : ''
    // Alarm işareti satırın kendisinde: panoyu okuyan alt satırı kaçırsa da işareti görür.
    const sesAlarm = esik && sesDk !== null && sesDk > esik.SES_ESIK_DK ? ' <SESSIZ!' : ''
    const teslimAlarm =
      esik && (teslim === 'KANITSIZ' || teslim > esik.TESLIM_ESIK_DK) ? ' <TESLIM?' : ''
    return (
      '  ' + String(c.lane).padEnd(16) +
      ' ATIS ' + yasYaz(c.yasDk).padStart(7) +
      '  TARAMA ' + tarama.padEnd(10) +
      ' TESLIM ' + teslimYaz(teslim).padStart(8) + teslimAlarm +
      ' SES ' + yasYaz(sesDk).padStart(7) + sesAlarm +
      '  [' + c.sid.slice(0, 8) + ']' + bayrak
    )
  })

  const bas =
    'YOKLAMA — ' + hepsi.length +
    ' serit (' + eksenOzeti() + ')'

  const altlar = []

  if (!esik) {
    altlar.push(
      '  ⛔ESIK OKUNAMADI — docs/standards/fleet-mechanism-standard.md icindeki ESIKLER blogu' +
      '\n    yok ya da bicimi bozuk. HICBIR SESSIZLIK/TESLIMAT HUKMU VERILMEDI: asagidaki' +
      '\n    sayilar cıplak veridir. Fail-closed: bu satirin kendisi alarmdir.',
    )
  }

  const asilmis = durumlar.filter((d) => d.tarama !== 'TARIYOR')
  altlar.push(
    asilmis.length === 0
      ? '  Panoyu OKUDUGU kanitlanamayan serit YOK.'
      : '  UYARI — PANOYU OKUDUGU KANITLANAMAYAN ' + asilmis.length + ' serit: ' +
        asilmis.map((d) => d.c.lane + '/' + d.c.sid.slice(0, 8)).join(', ') +
        '\n  Bunlar panoya YAZABILIR ama OKUDUKLARI kanitli DEGIL: adresli emir ulasmayabilir.' +
        '\n  Kurulum: node scripts/board/mechanism-setup.cjs plan --sid <uuid> --serit <SERIT>',
  )

  if (esik) {
    const teslimsiz = durumlar.filter(
      (d) => d.teslim === 'KANITSIZ' || d.teslim > esik.TESLIM_ESIK_DK,
    )
    if (teslimsiz.length) {
      altlar.push(
        '  UYARI — TESLIMAT KANITI BAYAT/YOK (' + teslimsiz.length + ' serit): ' +
        teslimsiz.map((d) => d.c.lane + '/' + d.c.sid.slice(0, 8) + '=' + teslimYaz(d.teslim)).join(', ') +
        '\n  TARAMA yesil olsa bile bildirim KONUSMAYA ulasmiyor olabilir: gozcu sureci compact i' +
        '\n  sag atlatir, teslimat kanali atlatmaz (olculdu 2026-09-01, 62 dk kayip).' +
        '\n  Kanit: mechanism-setup.cjs prob --sid X, sonra dogrula --sid X --jeton <bildirimdeki>',
      )
    }

    const sessiz = durumlar.filter((d) => d.sesDk !== null && d.sesDk > esik.SES_ESIK_DK)
    if (sessiz.length) {
      altlar.push(
        '  UYARI — SESSIZLIK ESIGI ASILDI (' + esik.SES_ESIK_DK + 'dk, ' + sessiz.length + ' serit): ' +
        sessiz.map((d) => d.c.lane + '/' + d.c.sid.slice(0, 8) + '=' + d.sesDk + 'dk').join(', ') +
        '\n  Sessizlik "sakin gun" ile "durmus serit" arasinda ayrim YAPMAZ; bu satir o ayrimi' +
        '\n  sorar. Uyandirma tepkisel katmana birakilamaz — tepkisel katman, kimsenin acmadigi' +
        '\n  sessizligi kiramaz. Bir AKRAN dursun (§23 HUKUM 1-2).',
      )
    }
  }

  /**
   * ⭐COMPANION BORCU — SAYILIR, BLOKLANMAZ (Recep karari 2026-08-31 + 09-03).
   *
   * NICIN BURADA: companion uretici tasiyici KAPALI. Kapali tasiyiciyla INV-DOC-2 C4
   * borcu ONLEYEMEZ, yalniz cezalandirir — 09-03'te olculdu: bir dosya HICBIR COMMIT
   * olmadan, yalniz TAKVIM ilerledigi icin butun acik PR'lari kirmiziya cevirdi. Kapi
   * bloklamaktan SAYIMA dondu; sayinin GORUNUR kalacagi yer burasi.
   *
   * NICIN METIN BURADA YAZILMIYOR: cumleyi sayac modulu URETIR (s26). Pano kendi
   * cumlesini yazsa iki metin ayrisir ve hangisinin hukum oldugu belirsizlesir.
   * Bir konformans kolu bu iki ciktiyi karsilastirir.
   *
   * NICIN try/catch: sayac git okur; git olmayan bir dizinde yoklama COKMEMELI. Ama
   * hata SESSIZ KALMAZ — "olculemedi" ACIKCA basilir, cunku olcememek gecmek degildir.
   */
  try {
    const sayac = require('../hijyen/companion-sayim.cjs')
    altlar.push('  ' + sayac.ozetSatiri(sayac.olc({ kok: repoRootFor(__filename) || undefined })))
  } catch (e) {
    altlar.push(
      '  companion borcu OLCULEMEDI (' + String((e && e.message) || e).slice(0, 90) + ')' +
      '\n  Olcememek gecmek DEGILDIR: bu satir alarmdir, sayinin sifir oldugu anlamina gelmez.',
    )
  }

  /**
   * ARTEFAKT BAYATLIK SAYIMI — REC-132 D1: kapi DONDURULDU, olcum SURUYOR.
   *
   * NICIN PANODA: uretim dondurulunca bayatlik artik CI'da kirmizi vermiyor. Gorunurlugu
   * hicbir yere yazmazsak "kabul edilen boskuk" SESSIZLESIR ve s21'in yasagina duseriz.
   * Kapiyi kapatmak olcumu susturmak DEGILDIR; bu satir borcun kac oldugunu her yoklamada
   * soyler. Metin sayimdan URETILIR (s26 tek kaynak), burada TEKRAR YAZILMAZ.
   */
  try {
    const bayatlik = require('../hijyen/artefakt-bayatlik-sayim.cjs')
    altlar.push(
      '  ' + bayatlik.ozetSatiri(bayatlik.olc({ kok: repoRootFor(__filename) || undefined })))
  } catch (e) {
    altlar.push(
      '  artefakt bayatligi OLCULEMEDI (' + String((e && e.message) || e).slice(0, 90) + ')' +
      '\n  Olcememek gecmek DEGILDIR.',
    )
  }

  return bas + '\n' + satirlar.join('\n') + '\n' + altlar.join('\n')
}

/**
 * OTURUM KİMLİĞİ DOĞRULAMASI — `--to` doğrulanıyordu, `--sid` DOĞRULANMIYORDU.
 *
 * ⚠ ÖLÇÜLMÜŞ VAKA (2026-08-20): bir şerit uzun bir karar notu gönderirken kendi sid'ine
 * altı KİRİL harf karıştı (kod noktaları 0x432 0x437 0x430 0x438 0x43c 0x43e). Komut
 * **başarılı** döndü ve "not bırakıldı" yazdı. Ama `sessionFile()` geçersiz karakterleri
 * `_` ile değiştirdiği için not `events.99fa366e-d8bb-4______61.jsonl` adlı YENİ bir
 * dosyaya düştü: gönderen teslim edildiğini sandı, alıcı hiç görmedi. Not ancak başka bir
 * şerit dizini tararken bulundu.
 *
 * Sınıf tanıdık ve bu dosyada zaten yazılı: **sahte-yeşil**. `--to` için 2026-08-16'da
 * kapatılmıştı (bkz. `resolveNoteTarget`), `--sid` tarafı açık kalmıştı. Yani kapı vardı,
 * kapsamı eksikti.
 *
 * NİÇİN SANITIZE YETMEZ: temizleme, bozulmayı ONARMAZ — GİZLER. Yanlış kimlik yanlış dosyaya
 * yazar, kıdem yanlış oturuma geçer, `who` panoyu iki sahiple gösterir. Doğru davranış
 * fail-closed: okunamayan kimlikle YAZMA.
 */
const SID_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Elle çalıştıran için serbest kimlik — ASCII, dar küme. */
const SID_ELLE = /^[A-Za-z0-9][A-Za-z0-9._-]{1,40}$/

/** Kimliğin içindeki kabul edilmeyen karakterleri KOD NOKTASIYLA gösterir. */
function bozukKarakterler(sid) {
  const kotu = []
  for (const ch of String(sid)) {
    if (!/[A-Za-z0-9._-]/.test(ch)) {
      kotu.push(`"${ch}" (U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')})`)
    }
  }
  return kotu
}

/**
 * @returns {{ok: true, tur: string} | {ok: false, sebep: string, oneri: string}}
 */
function sidDogrula(sid) {
  const ham = String(sid)

  if (SID_UUID.test(ham)) return { ok: true, tur: 'oturum kimliği' }

  const kotu = bozukKarakterler(ham)
  if (kotu.length > 0) {
    return {
      ok: false,
      sebep: `kimlikte kabul edilmeyen karakter var: ${kotu.slice(0, 8).join(', ')}`,
      oneri:
        'Bu tam olarak 2026-08-20 vakası: karakterler sessizce "_" yapılır, not YENİ bir ' +
        'dosyaya düşer ve alıcı hiç görmez. Kimliği yeniden yaz (kopyala-yapıştır, elle DEĞİL).',
    }
  }

  // UUID'e BENZİYOR ama uymuyor: en tehlikeli sınıf — göz onu doğru sanır.
  if (ham.includes('-') && ham.length >= 24) {
    return {
      ok: false,
      sebep: `kimlik uuid'e benziyor ama geçerli bir uuid DEĞİL (uzunluk ${ham.length})`,
      oneri: 'Beklenen biçim: 8-4-4-4-12 onaltılık. Kimliği yeniden kopyala.',
    }
  }

  if (!SID_ELLE.test(ham)) {
    return {
      ok: false,
      sebep: 'kimlik ne geçerli bir uuid ne de kabul edilebilir bir elle-kimlik',
      oneri: 'Elle çalıştırıyorsan dar biçim kullan: --sid recep-manual',
    }
  }

  // Buraya gelen kimlik dar ASCII biçimini karşılıyor → ELLE KİMLİK, serbest.
  //
  // ⚠ BURADA BİR KOL DENEDİM VE GERİ ALDIM — gerekçesi ölçüm: ilk sürüm, panoda geçmişi
  // olmayan yeni bir elle-kimliği reddedip `--yeni-kimlik` bayrağı istiyordu ("yazım hatası
  // ile kasıtlı yeni kimlik ayırt edilemez"). İki sebeple çıkardım:
  //   1) INV-BOARD-3 bunu KIRDI: `--sid recep-manual` bayraksız çalışmalı — bu YAZILI bir
  //      muafiyet ve insanın elle çalışmasını koruyor. Kapı kendi sözleşmemizi bozuyordu.
  //   2) Asıl vakayı o kol YAKALAMADI: 2026-08-20'de bozulan kimlik Kiril harf taşıyordu ve
  //      onu KARAKTER kolu yakalıyor. Yani kolun bedeli ölçülmüş, getirisi ölçülmemişti.
  // Ölçülmemiş getiri için yazılı bir muafiyeti kırmak, kapıyı sertleştirmek değil daraltmaktır.
  return { ok: true, tur: 'elle kimlik' }
}

/* ---------------------------- CLI ---------------------------- */
if (require.main === module) {
  /** Değer alan bayraklar — değerleri serbest metinden AYIKLANMALI, yoksa nota sızar. */
  const VALUE_FLAGS = new Set(['sid', 'lane', 'globs', 'to', 'text'])
  /**
   * TEKRARLANAN bayrağın BİRİKTİĞİ tek bayrak. Ayırıcı virgül olduğu için
   * `--globs a --globs b` ile `--globs "a,b"` AYNI şeyi demek ister; birleştirmek
   * kullanıcının kastını korur.
   */
  const BIRIKEN_FLAGS = new Set(['globs'])
  const [, , verb, ...rest] = process.argv
  const flags = {}
  const positional = []
  /**
   * ⭐TEKRARLANAN BAYRAK SESSİZCE EZİYORDU (ölçüldü 2026-08-30, ALTYAPI).
   *
   * Eski satır `flags[name] = rest[i + 1]` idi: `--globs "A/**" --globs "B/**"`
   * çağrısında SON değer öncekini eziyor, claim yalnız `B/**` ile kaydediliyordu.
   * Ölçüm: iki globlu tek çağrı → `talep alındı: SINAV → BBB/**`, `who` da tek yol
   * gösteriyor. (Filo notunda "yalnız İLKİ kaydediliyor" yazıyordu — yön yanlıştı;
   * son kazanıyor. Kayıp aynı, teşhis değil.)
   *
   * Niçin önemli: claim EKSİK kaydolunca şerit, talep ettiğini sandığı yolları
   * korumuyor; başka bir şerit o yollara girdiğinde kapı çakışmayı GÖREMİYOR —
   * yani sessiz kayıp doğrudan şerit izolasyonunu deliyor.
   *
   * İKİ AYRI DAVRANIŞ, BİLEREK:
   *   · `globs` BİRİKİR — tekrarın tek anlamlı yorumu birleşimdir.
   *   · diğer değer bayrakları (`sid`, `lane`, `to`, `text`) tekrarlanırsa HATA.
   *     Bunlarda "hangisini kastettin" sorusunun doğru cevabı yok; sessizce birini
   *     seçmek, ezmenin başka bir adıdır. Kimliği ya da hedefi tahmin etmeyiz.
   */
  const gorulen = new Set()
  for (let i = 0; i < rest.length; i++) {
    const t = rest[i]
    if (t.startsWith('--')) {
      const name = t.slice(2)
      if (VALUE_FLAGS.has(name)) {
        const deger = rest[i + 1]
        if (gorulen.has(name)) {
          if (BIRIKEN_FLAGS.has(name)) {
            flags[name] = [flags[name], deger].filter(Boolean).join(',')
          } else {
            console.error(`--${name} BIRDEN FAZLA KEZ verildi — hangisinin gecerli oldugunu TAHMIN ETMEYIZ.`)
            console.error(`  onceki: ${JSON.stringify(flags[name])}`)
            console.error(`  sonraki: ${JSON.stringify(deger)}`)
            console.error(`  YAPILACAK: tek --${name} ver.`)
            process.exit(1)
          }
        } else {
          flags[name] = deger
        }
        gorulen.add(name)
        i++
      } else flags[name] = true
    } else positional.push(t)
  }
  if (gorulen.has('globs') && String(flags.globs || '').includes(',')) {
    // Birleştirmeyi GÖRÜNÜR kıl: sessiz birleştirme de sessiz ezme kadar okunaksızdır.
    const parcalar = String(flags.globs).split(',').map(s => s.trim()).filter(Boolean)
    if (parcalar.length > 1) console.error(`[board] --globs ${parcalar.length} yol olarak okundu: ${parcalar.join(' · ')}`)
  }
  const sid = flags.sid || process.env.CLAUDE_SESSION_ID || ''

  /**
   * Kimlik çözülemediyse YAZAN fiiller koşmaz (T079-VH).
   *
   * Eski hâli `os.hostname() + '-manual'` ile sessizce fallback yapıyordu. Bash kabuğunda
   * `CLAUDE_SESSION_ID` YOK, dolayısıyla `--sid` verilmeyen her çağrı
   * `events.<makine-adı>-manual.jsonl` dosyasına yazıyor, komut ise `exit 0` verip
   * "not bırakıldı" diyordu: gönderen teslim edildiğini sanıyor, alıcı hiç görmüyor.
   * Sahte-yeşil ailesinin pano biçimi — 34 kayıt bu hayalet dosyaya düştü ve biri CANLI bir
   * `claim`di, yani pano aynı şeridi İKİ ayrı sahiple gösterdi; kıdem hayalete geçtiği için
   * şerit-çakışma kontrolü gerçek sahibi KENDİ dosyalarında engelleyebilir hâle geldi.
   *
   * Muafiyet ADLA verilir: elle çalıştıran kendine bir kimlik yazar (`--sid recep-manual`).
   * Sessiz varsayılan yok. `who` yazmadığı için koşar, ama kimliksiz "(sen)" işaretlenemez —
   * bunu susarak geçmek yerine söylüyoruz, yoksa okuyan kendi şeridini listede aramaya kalkar.
   */
  if (!sid && PANOYA_YAZAN_FIILLER.has(verb)) {
    console.error(`oturum kimliği ÇÖZÜLEMEDİ: --sid verilmedi ve CLAUDE_SESSION_ID boş.`)
    console.error(`"${verb}" panoya YAZAR; kimliksiz yazım hayalet bir oturum üretir ve komut yine`)
    console.error('başarılı görünür — o yüzden yazmıyoruz (T079-VH).')
    console.error('çözüm: --sid <oturum-kimliğin> ekle. Elle çalıştırıyorsan kendine ad ver: --sid recep-manual')
    process.exit(1)
  }

  // KIMLIGIN VARLIGI YETMEZ, BICIMI DE DOGRULANIR (2026-08-20 vakasi — sidDogrula yorumuna bak).
  // Eski hali yalniz "sid var mi" diye bakiyordu; bozuk bir kimlik sessizce YENI bir pano
  // dosyasi doguruyor ve komut yine "not birakildi" diyordu. Ayni sahte-yesil ailesi.
  if (PANOYA_YAZAN_FIILLER.has(verb)) {
    // ⭐KONUM BEYANI (§27) — YAZAN fiil, KOŞAN DOSYANIN yolunu söyler.
    //
    // Ölçülmüş vaka (2026-09-01/02, DÖRT kez: URUN 3 + ALTYAPI 1): kabuk sessizce birincil
    // çalışma dizinine kaydı ve `node scripts/board/board.cjs claim` ANA DİZİNDEKİ kopyayı
    // koştu. Üç vakada zarar sıfırdı — ve tam o yüzden hiçbiri bir kapı doğurmadı; iki ajan
    // "dikkatli olacağım" dedi, 3. ve 4. yine oldu. Dikkat bir mekanizma değildir.
    //
    // ⚠NİÇİN KÖK DEĞİL DOSYA: ilk tasarım "kullandığın KÖKÜ bas" idi, ölçünce YETERSİZ çıktı.
    // O vakada yanlış ağacın VERİSİ ölçülmedi (pano paylaşımlıdır, veri doğruydu); zarar
    // BAYAT SÜRÜMÜN koşmasıydı ve bayat sürüm de doğru kökü basar. Ayırt eden şey KOŞAN
    // DOSYADIR. Ölçüldü: ana dizin `origin/master`'dan 0 GERİDE iken iki kopya FARKLIYDI —
    // yani "ağaç güncel" ile "aynı araç koşuyor" AYRI iddialardır.
    //
    // ⚠NİÇİN YALNIZ YAZAN FİİLLER: `yoklama`/`who` okuyan fiildir, çıktıları insan tarafından
    // taranır ve gürültü onları okunmaz kılar. Durum DEĞİŞTİREN fiil ise nereden koştuğunu
    // söylemek zorundadır. stderr'e yazılır ki stdout ayrıştıran çağıranlar bozulmasın.
    console.error('[board] kosan: ' + __filename)

    /**
     * ⭐§28 — AYRISMA UYARISI: kosan DOSYANIN agaci ile CAGIRANIN dizini ayni mi?
     *
     * NICIN GEREKLI (URUN olctu, 2026-09-04, 6. vaka): tehlike olcum komutunun
     * KENDISINDE degil, ARADAKI masum yardimci komutta. `node scripts/board/board.cjs`
     * GORELI yolla cagrilinca hangi dizinde bulunuyorsan ORADAKI kopya kosar ve kabugun
     * cwd'si oraya CEKILIR — sonraki komutlar da sessizce yanlis agacta calisir.
     * §27 kosan dosyayi BEYAN ediyordu; beyan tek basina yetmiyor, cunku beyan eden
     * komut dogru kosar, ONDAN SONRAKI komut kayar.
     *
     * NICIN KAPI DEGIL UYARI: alti vakanin BESINDE zarar sifirdi. Bloklamak gurultu
     * yapar ve gurultulu kapi bir sure sonra OKUNMAYAN kapidir (s25). Recep onayli
     * hukum: UYARI + SAYIM.
     */
    const kosanAgac = repoRootFor(__filename)
    const cagiranAgac = repoRootFor(process.cwd() + '/')
    if (kosanAgac && cagiranAgac && kosanAgac.toLowerCase() !== cagiranAgac.toLowerCase()) {
      console.error(
        '[board] ⚠AYRISMA: kosan dosya ' + kosanAgac + ' agacinda, ' +
        'bulundugun dizin ' + cagiranAgac + ' agacinda.\n' +
        '[board]   Bu komut DOGRU kostu, ama kabugun cwd si kayabilir ve SONRAKI komutlar ' +
        'yanlis agacta calisir.\n' +
        '[board]   Kanonik cagri: MUTLAK yol kullan (node <agac>/scripts/board/board.cjs) ' +
        've git icin daima git -C <agac>.',
      )
    }
  }
  if (sid && PANOYA_YAZAN_FIILLER.has(verb)) {
    const kimlik = sidDogrula(sid)
    // KAÇIŞ KAPISI YOK — ve bu bilinçli. İlk sürümde `--yeni-kimlik` bayrağı vardı; kendi
    // sabotaj testimde Kiril harfli kimliğe o bayrağı verdim ve komut YAZDI, yani kaçış
    // kapısı kapının kapattığı deliği yeniden açıyordu. Bayrak tümden kaldırıldı: bozuk
    // kimlik hiçbir biçimde geçmez, geçerli elle-kimlik ise zaten bayrak istemez.
    if (!kimlik.ok) {
      console.error('oturum kimliği REDDEDİLDİ: ' + kimlik.sebep)
      console.error(kimlik.oneri)
      console.error('YAZMIYORUZ: bozuk kimlikle yazmak SESSİZCE yeni bir pano dosyası doğurur;')
      console.error('komut başarılı görünür ama not TESLİM EDİLMEZ (sahte-yeşil).')
      process.exit(1)
    }
  }
  if (!sid && verb === 'who') {
    console.error('uyarı: --sid yok, kendi şeridin "(sen)" olarak işaretlenemez.')
  }

  if (verb === 'claim') {
    const globs = String(flags.globs || '').split(',').map(s => s.trim()).filter(Boolean)
    if (globs.length === 0) { console.error('--globs zorunlu (virgülle ayır)'); process.exit(1) }
    /**
     * BOŞLUKLU GLOB REDDEDİLİR — ölçülmüş sessiz arıza (2026-08-26).
     *
     * Ayırıcı YALNIZ virgül. Boşluk ayırmalı tek dize verildiğinde eski hâl hata VERMEZDİ:
     * dizeyi aynen geri basar, "talep alındı" derdi ve TEK bir dev glob saklardı. O glob
     * hiçbir yolla eşleşmez, yani claim VAR görünür ama koruma YOKTUR; pano "çakışma yok" der
     * ve şerit kapısı YEŞİL yanar. Sahte-yeşil ailesinin pano biçimi.
     * Filo taraması: 8 canlı şeritten 3'ünde (EDGE, ALTYAPI, URUN) bu vardı; claim birleştirdiği
     * için çoğu parça başka girdiyle kapsanıyordu, GERÇEKTEN korumasız kalan 5 yol çıktı — ikisi
     * Bash yazma kapısının KENDİ kaynak dosyalarıydı (kapıyı yaz, kapıyı claim etmeyi kaçır).
     *
     * NİÇİN "boşluktan da ayır" DEĞİL de RED: sessizce yeniden yorumlamak, boşluk içeren gerçek
     * bir yolu iki ayrı globa bölerek ÇOK GENİŞ bir claim üretirdi — aynı sınıfın öteki yönü.
     * Fail-closed davranış deterministiktir ve doğru komutu ÖĞRETİR.
     */
    const bosluklu = globs.filter(g => /[\s]/.test(g))
    if (bosluklu.length) {
      console.error('--globs REDDEDILDI: glob degeri BOSLUK iceriyor. Ayirici YALNIZ virgul.')
      for (const g of bosluklu) {
        const parca = g.split(/[\s]+/).filter(Boolean)
        console.error(`  bosluklu deger (${parca.length} parcaya benziyor): ${g.slice(0, 120)}${g.length > 120 ? '...' : ''}`)
        console.error(`  bunu demek istediysen: --globs "${parca.join(',')}"`)
      }
      console.error('Niçin reddediyoruz: bosluklu dize TEK dev glob olarak saklanir, hicbir yolla')
      console.error('eslesmez ve claim VAR gorunurken koruma OLMAZ (olculdu 2026-08-26).')
      process.exit(1)
    }
    /**
     * --exact: verilen liste KESİN olur (birleştirme YOK) ve KIDEM KORUNUR.
     *
     * NİÇİN GEREKLİ: claim birleştirir, yani bir şeridi DARALTMANIN yolu yoktu. İki şerit aynı
     * cetvel dosyasını meşru sebeplerle talep ettiğinde (2026-08-26: ALTYAPI ve I18N) ayrışma
     * yalnız SÖZLE mümkün oluyordu, mekanik değil. `release` bir çözüm DEĞİL: oturumu haritadan
     * siler, sonraki claim YENİ bir ts alır ve şerit bütün ortak yollarda kıdemsiz düşer.
     * Yani "bir dosyayı bırakmak" istemek, başka her yerde kapıyı aleyhine çevirmek anlamına
     * geliyordu. --exact daraltmayı kıdem bedeli ödemeden yapar.
     */
    const exact = flags.exact === true
    append(sid, exact
      ? { type: 'claim', lane: flags.lane || 'lane', globs, exact: true }
      : { type: 'claim', lane: flags.lane || 'lane', globs })
    console.log(`talep alındı${exact ? ' (KESIN — onceki globlar DUSTU, kidem korundu)' : ''}: ${flags.lane || 'lane'} → ${globs.join(', ')}`)
  } else if (verb === 'heartbeat') {
    append(sid, { type: 'heartbeat' })
    console.log('atış kaydedildi')
  } else if (verb === 'release') {
    append(sid, { type: 'release' })
    console.log('şerit bırakıldı')
  } else if (verb === 'note') {
    const text = (flags.text || positional.join(' ')).trim()
    if (!text) { console.error('not metni boş'); process.exit(1) }
    // Hedefi YAZMADAN ÖNCE çöz. Teslim edilemez hedefte yazmak = sahte başarı (T064-VH).
    const target = resolveNoteTarget(flags.to)
    if (!target.ok) {
      console.error(`not GÖNDERİLMEDİ: ${target.reason}`)
      if (target.valid && target.valid.length) console.error(`geçerli hedefler: ${target.valid.join(', ')}`)
      console.error('herkese göndermek için --to VERME (ya da --to herkes).')
      process.exit(1)
    }
    append(sid, { type: 'note', to: target.to, text })
    console.log(`not bırakıldı → ${target.how}`)
  } else if (verb === 'who') {
    console.log(summary(sid))
  } else if (verb === 'yoklama' || verb === 'rollcall') {
    // OKUYAN fiil: --sid ISTEMEZ. Yoklamayı kimlik şartının ardına koymak, sağırlığı ölçmek
    // isteyen tarafı (orkestratör, Recep, yeni açılan oturum) tam da ölçüme muhtaç anda
    // dışarıda bırakırdı. Yazan fiiller kimliksiz koşmaz; okuyan fiiller koşar.
    console.log(yoklama())
  } else {
    // Eksen adı/sayısı BURADA YAZILMAZ — `kullanimMetni()` onu `EKSENLER`den üretir.
    // Elle yazıldığı sürece help, eksen değişince sessizce bayatlıyordu (bkz. EKSENLER yorumu).
    console.log(kullanimMetni())
  }
}
