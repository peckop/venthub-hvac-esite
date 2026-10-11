/**
 * ALT-38d · TEST HARİTASI KAYDEDİCİSİ — her test dosyasının KOŞARKEN okuduğu dosya ve dizinleri ÖLÇER (karar 308, B1).
 *
 * NİÇİN ÖLÇÜM: "bu dosya değişince hangi test koşmalı" sorusunun cevabı testin KAYNAĞINA bakarak tahmin edilirse
 * hesaplanan yol (`path.join(KOK, ad)`), döngüyle gezilen dizin ve alt süreçte okunan dosya sessizce kaçar. Burada test
 * GERÇEKTEN koşturulur ve `fs` çağrıları yakalanır: okunan dosya ne ise haritaya o girer.
 *
 * KULLANIM (iki kip, aynı modül):
 *   1. vitest işçisinde: `test-haritasi-kurulum.ts` (setupFiles; yalnız ÖLÇÜM yapılandırması
 *      `scripts/ci/test-haritasi.vitest.config.ts` ekler, `vitest.config.ts`e DOKUNULMAZ) `kur()` + `basla()` çağırır,
 *      `afterAll` `bitir()` ile ham kaydı `VENTHUB_HARITA_KLASOR` altına yazar.
 *   2. ALT SÜREÇTE (testin başlattığı `node ...`): `child_process` sarmalayıcısı çocuğun ortamına `NODE_OPTIONS=--require
 *      <bu dosya>` ve `VENTHUB_HARITA_COCUK=1` ekler; bu dosya yüklenince kendini kurar, çıkışta kendi okumalarını
 *      aynı teste ait ayrı bir ham kayıt olarak yazar. Böylece `node scripts/x.cjs` çalıştıran testin betik okumaları da
 *      teste yazılır.
 *
 * NE YAKALANIR: fs eşzamanlı + geri çağrılı + `fs.promises` (readFile, readdir, stat, lstat, access, open, readlink,
 * opendir, copyFile, cp, glob, exists, createReadStream), CJS `require` (genel `fs.readFileSync` ile yüklenir) ve yerel ESM
 * `import()` (`url.pathToFileURL(yol)` çağrısı kaydedilir). `readdir`/`opendir` bir DİZİN okumasıdır (dizin kökü yazılır; `recursive:true` ise
 * alt ağaç), `glob` aranan kökün alt ağacıdır, kalanı DOSYA okumasıdır (var olmayan yolun yoklaması da bağımlılıktır).
 *
 * NE YAKALANMAZ (haritayı üreten betik bunları AYRI ele alır; ikisi de burada yazılı çünkü sessiz kaçar):
 *   1. vite'ın ANA SÜREÇTE yaptığı okumalar: `import.meta.glob(..., { query: '?raw' })` ve `?raw` içe aktarmaları (78 test).
 *      Üretici bunları kaynaktan desen olarak çıkarır ve ÖLÇÜMLE doğrular (test-haritasi-uret.cjs).
 *   2. izlenemeyen alt süreçler: `git` (repo içinde), python, sh, cmd, deno, pnpm... `belirsiz` kaydı düşer ve test her
 *      zaman seçilir. Yalnız `node` çocukları izlenir.
 *
 * GÜVENLİK: bu modül yalnız ÖLÇÜM koşusunda yüklenir (PR kapısında ve normal `pnpm test`te yüklenmez). Yakalama hatası
 * testi ASLA bozmaz (her kayıt try/catch içinde); yazma orijinal `fs` ile yapılır (kendi okuma/yazması kayda girmez).
 */
'use strict';

const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const nodeModule = require('node:module');
const path = require('node:path');
const nodeUrl = require('node:url');
const util = require('node:util');

const { fileURLToPath } = nodeUrl;

const SURUM = 1;
const ORTAM = Object.freeze({
  KLASOR: 'VENTHUB_HARITA_KLASOR',
  KOK: 'VENTHUB_HARITA_KOK',
  TEST: 'VENTHUB_HARITA_TEST',
  COCUK: 'VENTHUB_HARITA_COCUK',
});
const DURUM_ANAHTARI = Symbol.for('venthub.test-haritasi.kaydedici');
const SARILDI = Symbol.for('venthub.test-haritasi.sarildi');
/** Yolu bu parçalardan birini içeren okumalar haritaya GİRMEZ (bağımlılık kodu ve git iç yapısı: PR dosya listesinde çıkmaz). */
const YOK_SAYILAN_PARCALAR = Object.freeze(['node_modules', '.git']);
/**
 * İçeride (repo kökünde) çalışsa da DOSYA içeriğine/izlenen dosya kümesine bağlı OLMAYAN `git` alt komutları: depo üst verisini (ref, dal,
 * çalışma ağacı listesi, yapılandırma) okur ya da kendi yarattığı durumu değiştirir. Hangi dosyanın değiştiği sonucu etkilemez, bu yüzden
 * testi `belirsiz` yapmazlar. Listede OLMAYAN alt komut (ls-files, diff, status, grep, check-ignore, blame...) dosyaya bağlıdır → `belirsiz`.
 */
const GIT_ZARARSIZ = Object.freeze([
  '--version', 'version', 'rev-parse', 'config', 'init', 'help', 'var', 'branch', 'worktree', 'remote', 'symbolic-ref', 'merge-base',
  'for-each-ref', 'show-ref', 'describe', 'tag', 'fetch', 'pull', 'push', 'clone', 'checkout', 'switch', 'commit', 'add', 'reset', 'merge',
  'rebase', 'cherry-pick', 'stash', 'update-ref', 'reflog', 'ls-remote', 'count-objects', 'notes', 'bisect', 'submodule',
]);
/** Hem üst veri hem dosya sorgusu olabilen alt komutlar: bayraklara bakılır (`gitDosyayaBagli`). */
const GIT_KOSULLU = Object.freeze(['log', 'show', 'rev-list']);
/** Dosya içeriği/adı/diff isteyen `git log|show|rev-list` bayrakları. */
const GIT_DOSYA_BAYRAKLARI = /^(?:--name-only|--name-status|--stat(?:=.*)?|--numstat|--shortstat|--summary|--patch|--follow|--diff-filter(?:=.*)?|--cc|--full-diff|--raw|--objects(?:-edge)?|--find-renames(?:=.*)?|--find-copies(?:=.*)?|-p|-m|-M\d*%?|-C\d*%?|-u|--dirstat(?:=.*)?|--patch-with-stat|--all-match)$/;
/** Hiçbir depo dosyasını okumayan, işletim sistemine dair yardımcı araçlar (argümanı depo yolu değilse bağımlılık yoktur). */
const OS_ARACLARI = Object.freeze(['net', 'taskkill', 'tasklist', 'wmic', 'whoami', 'hostname', 'where', 'which', 'chcp', 'ver', 'ipconfig', 'systeminfo', 'uname', 'sleep', 'timeout', 'ping', 'netstat', 'ps', 'id']);
/** `claude` komut satırı aracının depodaki BELGELİ yapılandırma ayak izi (proje düzeyi): alt ağaç ve kök dosyalar. */
const CLAUDE_AYAK_IZI = Object.freeze({ ozy: ['.claude'], okunan: ['CLAUDE.md', '.mcp.json'] });

/** Kaynağı (kök dizini) bulur: ortam değişkeni, yoksa bu dosyanın iki üstü. */
function kokDizini() {
  return path.resolve(process.env[ORTAM.KOK] || path.join(__dirname, '..', '..'));
}

/**
 * Bir fs/alt süreç argümanını KÖKE GÖRELİ POSIX yola çevirir. Kök dışı, `node_modules`/`.git` içi, metin/URL/Buffer olmayan
 * (dosya tanıtıcısı sayı, undefined) girdi için null. Kökün kendisi `.` olur.
 */
function yoluNormalle(girdi, kok = kokDizini()) {
  let ham;
  if (typeof girdi === 'string') ham = girdi;
  else if (girdi instanceof URL) {
    if (girdi.protocol !== 'file:') return null;
    ham = fileURLToPath(girdi);
  } else if (Buffer.isBuffer(girdi)) ham = girdi.toString('utf8');
  else return null;
  if (ham === '' || ham.indexOf('\0') !== -1) return null;
  const goreli = path.relative(kok, path.resolve(ham));
  if (goreli === '') return '.';
  if (goreli === '..' || goreli.startsWith(`..${path.sep}`) || path.isAbsolute(goreli)) return null;
  const parcalar = goreli.split(path.sep);
  if (parcalar.some((p) => YOK_SAYILAN_PARCALAR.includes(p))) return null;
  return parcalar.join('/');
}

/** Glob deseninin SABİT önekini (ilk özel karakterli bileşenden önceki dizin) döndürür; desen dizisi ve metin dışı girdide null. */
function desenOneki(desen) {
  if (typeof desen !== 'string') return null;
  const bilesenler = desen.split(/[\\/]/);
  const sabit = [];
  for (const b of bilesenler) {
    if (/[*?[\]{}()!]/.test(b)) break;
    sabit.push(b);
  }
  if (sabit.length === bilesenler.length) sabit.pop();
  return sabit.join('/');
}

/**
 * Bir alt süreç çağrısını sınıflar. SAF. Dönüş: `{ tur, betik?, taban?, altKomut?, disarida?, belirsiz? }`.
 *   node   `process.execPath`, `node`, `nodejs` (izlenir: çocuk kendi okumalarını yazar; `betik` = ilk seçenek-dışı argüman,
 *          `-e/-p` satır içi koddur: betik null)
 *   git    etkin çalışma dizini (`cwd` seçeneği ve `-C`) ya da `--git-dir/--work-tree` repo DIŞINDAYSA (geçici dizindeki deneme deposu)
 *          `belirsiz` YOK; içindeyse ve alt komut zararsız değilse VAR. Genel seçenekler (`-C yol`, `-c a=b`) alt komut SAYILMAZ.
 *   diger  python, sh, cmd, deno, pnpm... izlenemez: `belirsiz` VAR
 * `secenek.shell` true ise komut ve argümanlar bir kabuk satırıdır (`exec`/`execSync`/`shell:true`): ilk sözcük ve içerdiği `git` sözcüğü bakılır.
 */
function surecSinifla(komut, argv, secenek, kok = kokDizini()) {
  const adim = typeof komut === 'string' ? komut : String(komut);
  const kabuk = Boolean(secenek && typeof secenek === 'object' && secenek.shell);
  const cwdSecenegi = secenek && typeof secenek === 'object' ? secenek.cwd : undefined;
  const cwdMutlak = path.resolve(cwdSecenegi === undefined ? process.cwd() : String(cwdSecenegi instanceof URL ? fileURLToPath(cwdSecenegi) : cwdSecenegi));
  const argumanlar = Array.isArray(argv) ? argv.map(String) : [];
  // Kabuk satırında komut ve argümanlar TEK metindir (`spawn('git', ['log'], { shell: true })` da öyle çalışır).
  const sozcukler = kabuk ? [adim, ...argumanlar].join(' ').trim().split(/\s+/) : [adim, ...argumanlar];
  const ilk = sozcukler[0] || '';
  const adlandir = (s) => path.basename(s).toLowerCase().replace(/\.(exe|cmd|bat)$/, '');
  const taban = adlandir(ilk);
  if (ilk === process.execPath || taban === 'node' || taban === 'nodejs') {
    return { tur: 'node', betik: nodeBetigi(sozcukler.slice(1)) };
  }
  const gitSirasi = sozcukler.findIndex((s) => adlandir(s) === 'git');
  if (taban === 'git' || (kabuk && gitSirasi !== -1)) {
    const g = gitAyristir(sozcukler.slice(gitSirasi + 1), cwdMutlak);
    // Repo DIŞINDA çalışan git (geçici dizindeki deneme deposu: `cwd` ya da `-C`/`--git-dir`/`--work-tree` kök dışı) repo durumuna bağlı değildir.
    const disarida = yoluNormalle(g.cwd, kok) === null || (g.gitDizini !== null && yoluNormalle(g.gitDizini, kok) === null);
    const dosyayaBagli = gitDosyayaBagli(g.altKomut, g.kalan);
    return { tur: 'git', altKomut: g.altKomut, disarida, belirsiz: disarida || !dosyayaBagli ? null : `git ${g.altKomut || '?'} (repo içinde): izlenemeyen süreç` };
  }
  // `claude` komut satırı aracı: depodaki belgeli proje yapılandırmasını (`.claude/`, CLAUDE.md, .mcp.json) okur; `surecKaydet` bu ayak izini ekler.
  if (taban === 'claude') return { tur: 'claude', taban, belirsiz: null };
  if (OS_ARACLARI.includes(taban)) return { tur: 'os', taban, belirsiz: null };
  // Yorumlayıcı/derleyici (python, sh, cmd, deno, pnpm...): çalışma dizini repo DIŞINDA (geçici deneme dizini) ve hiçbir argüman repoya
  // değmiyorsa repo dosyalarına bağlı değildir (testin kopyaladığı dosyalar ana süreçte `fs` okuması olarak zaten kayıtlıdır).
  const icerde = yoluNormalle(cwdMutlak, kok) !== null || argumanlar.some((a) => repoyaDegiyor(a, cwdMutlak, kok)) || (kabuk && repoyaDegiyor(adim, cwdMutlak, kok));
  return { tur: 'diger', taban, disarida: !icerde, belirsiz: icerde ? `${taban || '?'}: izlenemeyen süreç` : null };
}

/** Bir argüman depo kökünü anıyor ya da kökün altında bir yola çözülüyor mu? (kabuk satırı/komut metni için yalnız "kök yolu geçiyor mu") */
function repoyaDegiyor(arguman, cwd, kok) {
  const kokYerel = path.resolve(kok);
  const kokPosix = kokYerel.split(path.sep).join('/');
  if (arguman.includes(kokYerel) || arguman.includes(kokPosix)) return true;
  if (arguman.startsWith('-') || !/[\\/]/.test(arguman) || arguman.length > 1024) return false;
  return yoluNormalle(path.resolve(cwd, arguman), kok) !== null;
}

/**
 * Bir `git` alt komutunun sonucu DOSYA içeriğine/izlenen dosya kümesine bağlı mı? Üst veri komutları (ref, dal, yapılandırma, çalışma ağacı
 * listesi) değil; `ls-files/diff/status/grep/check-ignore...` evet. `log|show|rev-list` yalnız dosya/diff/yol isteyen bayrak ya da yol
 * (`--`, `rev:yol`, uzantılı argüman) varsa; `show` varsayılanı yama basar (`-s/--no-patch/--quiet` yoksa bağlı).
 */
function gitDosyayaBagli(altKomut, kalan) {
  if (GIT_ZARARSIZ.includes(altKomut)) return false;
  const args = Array.isArray(kalan) ? kalan : [];
  // `cat-file -e|-t|-s|--batch-check <rev>`: nesnenin VARLIĞI/türü/boyutu. `rev:yol` biçimi (dosyanın o sürümdeki varlığı/boyutu) dosyaya bağlıdır;
  // yolsuz sürüm (`<sha>^{commit}`) bağlı DEĞİL (ölçüldü: oturum başlangıcı kancaları yalnız bu biçimi kullanır).
  if (altKomut === 'cat-file') {
    const yalnizSorgu = args.some((a) => ['-e', '-t', '-s', '--batch-check'].includes(a));
    return !(yalnizSorgu && !args.some((a) => !a.startsWith('-') && a.includes(':')));
  }
  if (!GIT_KOSULLU.includes(altKomut)) return true;
  if (args.includes('--')) return true;
  if (args.some((a) => !a.startsWith('-') && a.includes(':'))) return true;
  if (args.some((a) => GIT_DOSYA_BAYRAKLARI.test(a))) return true;
  if (args.some((a) => !a.startsWith('-') && !a.includes('..') && /\.[A-Za-z0-9]{1,6}$/.test(a) && !/^v?\d+(?:\.\d+)+$/.test(a))) return true;
  if (altKomut === 'show' && !args.some((a) => a === '-s' || a === '--no-patch' || a === '--quiet')) return true;
  return false;
}

/** `node` argümanlarından betik yolu. `-e/-p/--eval/--print` satır içi koddur (betik yok); değer alan seçenekler (`-r x`) atlanır. */
function nodeBetigi(argumanlar) {
  const DEGER_ALAN = ['-r', '--require', '--import', '--loader', '--experimental-loader', '-C', '--conditions'];
  for (let i = 0; i < argumanlar.length; i++) {
    const a = argumanlar[i];
    if (a === '-e' || a === '-p' || a === '--eval' || a === '--print' || a.startsWith('--eval=') || a.startsWith('--print=')) return null;
    if (DEGER_ALAN.includes(a)) {
      i += 1;
      continue;
    }
    if (a === '' || a.startsWith('-')) continue;
    return a;
  }
  return null;
}

/**
 * `git` argümanları: genel seçenekleri (`-C yol`, `-c ad=değer`, `--git-dir yol`, `--work-tree yol`, `--namespace x`...) atlayıp ALT KOMUTU
 * bulur; `-C` etkin çalışma dizinini, `--git-dir`/`--work-tree` depo yolunu değiştirir.
 * Dönüş: { altKomut, kalan (alt komuttan sonraki argümanlar), cwd (mutlak), gitDizini (mutlak|null) }.
 */
function gitAyristir(sozcukler, cwdBaslangic) {
  const DEGER_ALAN = ['-c', '--namespace', '--super-prefix', '--config-env'];
  let cwd = cwdBaslangic;
  let gitDizini = null;
  for (let i = 0; i < sozcukler.length; i++) {
    const a = sozcukler[i];
    if (a === '-C') {
      cwd = path.resolve(cwd, sozcukler[i + 1] || '.');
      i += 1;
    } else if (a === '--git-dir' || a === '--work-tree') {
      gitDizini = path.resolve(cwd, sozcukler[i + 1] || '.');
      i += 1;
    } else if (a.startsWith('--git-dir=') || a.startsWith('--work-tree=')) {
      gitDizini = path.resolve(cwd, a.slice(a.indexOf('=') + 1));
    } else if (DEGER_ALAN.includes(a)) {
      i += 1;
    } else if (a === '' || a.startsWith('-')) {
      continue;
    } else {
      return { altKomut: a, kalan: sozcukler.slice(i + 1), cwd, gitDizini };
    }
  }
  const secenekOnlari = sozcukler.find((s) => s.startsWith('--')) || '';
  return { altKomut: secenekOnlari, kalan: [], cwd, gitDizini };
}

function bosGrup() {
  return { okunan: new Set(), dizin: new Set(), ozy: new Set() };
}

function durumAl() {
  return globalThis[DURUM_ANAHTARI] || null;
}

/** Bir kayıt grubunu sıralı dizilere çevirir (belirlenimli çıktı). */
function grupDizi(grup) {
  return {
    okunan: [...grup.okunan].sort(),
    dizin: [...grup.dizin].sort(),
    ozy: [...grup.ozy].sort(),
  };
}

/** Yakalanan bir yolu etkin bağlamın etkin grubuna yazar. HİÇBİR ZAMAN fırlatmaz. */
function kaydet(tur, girdi) {
  try {
    const d = durumAl();
    if (!d || !d.aktif) return;
    const goreli = yoluNormalle(girdi, d.kok);
    if (goreli === null) return;
    (d.aktif.faz === 'kurulum' ? d.aktif.kurulum : d.aktif.test)[tur].add(goreli);
  } catch {
    /* yakalama testi bozmamalı */
  }
}

/** Orijinalin sahip olduğu özellikleri (promisify.custom, native...) sarmalayıcıya taşır. */
function ozellikleriKopyala(hedef, kaynak, atla = []) {
  for (const anahtar of Reflect.ownKeys(kaynak)) {
    if (['length', 'name', 'prototype', 'arguments', 'caller', ...atla].includes(anahtar)) continue;
    try {
      Object.defineProperty(hedef, anahtar, Object.getOwnPropertyDescriptor(kaynak, anahtar));
    } catch {
      /* taşınamayan özellik atlanır */
    }
  }
}

function sar(nesne, ad, once) {
  const orijinal = nesne[ad];
  if (typeof orijinal !== 'function' || orijinal[SARILDI]) return;
  const sarici = function (...args) {
    try {
      once(args);
    } catch {
      /* yakalama testi bozmamalı */
    }
    return orijinal.apply(this, args);
  };
  ozellikleriKopyala(sarici, orijinal);
  Object.defineProperty(sarici, SARILDI, { value: true });
  nesne[ad] = sarici;
}

/** `open`/`openSync` bayrağı yalnız YAZMA ise okuma sayılmaz. */
function yazmaBayragiMi(bayrak) {
  return typeof bayrak === 'string' && /^[wa]/.test(bayrak);
}

const FS_DAVRANISLARI = Object.freeze({
  dosya: (args) => kaydet('okunan', args[0]),
  ac: (args) => {
    if (!yazmaBayragiMi(args[1])) kaydet('okunan', args[0]);
  },
  dizin: (args) => {
    const secenek = args[1];
    kaydet(secenek && typeof secenek === 'object' && secenek.recursive ? 'ozy' : 'dizin', args[0]);
  },
  kopya: (args) => {
    const secenek = args[2];
    kaydet(secenek && typeof secenek === 'object' && secenek.recursive ? 'ozy' : 'okunan', args[0]);
  },
  glob: (args) => {
    const secenek = args[1] && typeof args[1] === 'object' ? args[1] : {};
    const kok = secenek.cwd === undefined ? process.cwd() : secenek.cwd;
    const desenler = Array.isArray(args[0]) ? args[0] : [args[0]];
    for (const desen of desenler) {
      const onek = desenOneki(desen);
      kaydet('ozy', onek ? path.resolve(String(kok instanceof URL ? fileURLToPath(kok) : kok), onek) : kok);
    }
  },
});

const FS_TABLOSU = Object.freeze({
  readFileSync: 'dosya', readFile: 'dosya', existsSync: 'dosya', exists: 'dosya', statSync: 'dosya', stat: 'dosya',
  lstatSync: 'dosya', lstat: 'dosya', accessSync: 'dosya', access: 'dosya', readlinkSync: 'dosya', readlink: 'dosya',
  createReadStream: 'dosya', copyFileSync: 'dosya', copyFile: 'dosya', openSync: 'ac', open: 'ac',
  readdirSync: 'dizin', readdir: 'dizin', opendirSync: 'dizin', opendir: 'dizin', cpSync: 'kopya', cp: 'kopya',
  globSync: 'glob', glob: 'glob',
});
const FS_PROMISES_TABLOSU = Object.freeze({
  readFile: 'dosya', stat: 'dosya', lstat: 'dosya', access: 'dosya', readlink: 'dosya', copyFile: 'dosya', open: 'ac',
  readdir: 'dizin', opendir: 'dizin', cp: 'kopya', glob: 'glob',
});

function fsSar() {
  for (const [ad, davranis] of Object.entries(FS_TABLOSU)) sar(fs, ad, FS_DAVRANISLARI[davranis]);
  if (fs.promises) for (const [ad, davranis] of Object.entries(FS_PROMISES_TABLOSU)) sar(fs.promises, ad, FS_DAVRANISLARI[davranis]);
}

/** Çocuğun ortamı: izleme değişkenleri + `NODE_OPTIONS=--require <bu dosya>` (varsa sonuna eklenir, ikilenmez). */
function cocukOrtami(env, d = durumAl()) {
  const kaynak = env && typeof env === 'object' ? env : process.env;
  const yeni = { ...kaynak };
  if (!d || !d.aktif) return yeni;
  yeni[ORTAM.COCUK] = '1';
  yeni[ORTAM.TEST] = d.aktif.testYolu;
  yeni[ORTAM.KLASOR] = d.klasor;
  yeni[ORTAM.KOK] = d.kok;
  const onYukleme = /\s/.test(__filename) ? `--require="${__filename}"` : `--require=${__filename}`;
  const mevcut = typeof yeni.NODE_OPTIONS === 'string' ? yeni.NODE_OPTIONS : '';
  if (!mevcut.includes(__filename)) yeni.NODE_OPTIONS = `${mevcut} ${onYukleme}`.trim();
  return yeni;
}

/** child_process çağrısını (konum argümanları değişken) çözer: komut, argv, seçenek, geri çağrı konumları. */
function surecArgumanlari(ad, args) {
  const kabukDizgesi = ad === 'exec' || ad === 'execSync';
  let i = 1;
  let argv = [];
  if (!kabukDizgesi && Array.isArray(args[i])) {
    argv = args[i];
    i += 1;
  }
  let secenek = {};
  if (args[i] && typeof args[i] === 'object' && !Array.isArray(args[i])) {
    secenek = args[i];
    i += 1;
  }
  const geriCagri = typeof args[i] === 'function' ? args[i] : null;
  return { komut: args[0], argv, secenek, geriCagri, kabukDizgesi };
}

/**
 * Bir alt süreç çağrısını bağlama yazar: `surec` etiketi (rastgele geçici dizin adları etikete GİRMEZ: belirlenimli çıktı),
 * izlenen `node` betiğinin kendisi okunan dosya, izlenemeyen süreç `belirsiz`. Bağlam yoksa hiçbir şey yapmaz.
 */
function surecKaydet(d, ad, komut, argv, secenek, kabukDizgesi) {
  const kabuk = kabukDizgesi || Boolean(secenek.shell);
  const sinif = ad === 'fork' ? { tur: 'node', betik: String(komut) } : surecSinifla(kabukDizgesi ? String(komut) : komut, argv, kabuk ? { ...secenek, shell: true } : secenek, d.kok);
  const grup = d.aktif.faz === 'kurulum' ? d.aktif.kurulum : d.aktif.test;
  let etiket;
  if (sinif.tur === 'node') {
    etiket = 'node (satır içi)';
    if (typeof sinif.betik === 'string') {
      const cwdBaz = secenek.cwd === undefined ? process.cwd() : secenek.cwd;
      const betikYolu = path.isAbsolute(sinif.betik) ? sinif.betik : path.resolve(String(cwdBaz instanceof URL ? fileURLToPath(cwdBaz) : cwdBaz), sinif.betik);
      const goreli = yoluNormalle(betikYolu, d.kok);
      etiket = goreli === null ? 'node (repo dışı betik)' : `node ${goreli}`;
      if (goreli !== null) grup.okunan.add(goreli);
    }
  } else if (sinif.tur === 'git') {
    etiket = `git ${sinif.altKomut || '?'}${sinif.disarida ? ' (repo dışı)' : ''}`;
  } else if (sinif.tur === 'claude') {
    etiket = 'claude';
    // Aracın proje düzeyi yapılandırma ayak izi (yalnız aracın çalışma dizini depo İÇİNDEYSE): belgeli konumlar, tahmin değil.
    const cwdBaz = secenek.cwd === undefined ? process.cwd() : secenek.cwd;
    if (yoluNormalle(cwdBaz, d.kok) !== null) {
      for (const p of CLAUDE_AYAK_IZI.ozy) grup.ozy.add(p);
      for (const p of CLAUDE_AYAK_IZI.okunan) grup.okunan.add(p);
    }
  } else {
    etiket = `${sinif.taban || '?'}${sinif.disarida ? ' (repo dışı)' : ''}`;
  }
  d.aktif.surec.add(etiket);
  if (sinif.belirsiz) d.aktif.belirsiz.add(sinif.belirsiz);
}

function surecHazirla(ad, args) {
  const d = durumAl();
  const { komut, argv, secenek, geriCagri, kabukDizgesi } = surecArgumanlari(ad, args);
  if (d && d.aktif) {
    try {
      surecKaydet(d, ad, komut, argv, secenek, kabukDizgesi);
    } catch {
      // Kayıt hatası ÇOCUĞUN izlenmesini engellemez (ortam enjeksiyonu aşağıda); ama sınıflanamayan süreç izlenemeyen sayılır.
      d.aktif.belirsiz.add('alt süreç sınıflanamadı');
    }
  }
  const yeniArgumanlar = [komut];
  if (!kabukDizgesi) yeniArgumanlar.push(argv);
  yeniArgumanlar.push({ ...secenek, env: cocukOrtami(secenek.env, d) });
  if (geriCagri) yeniArgumanlar.push(geriCagri);
  return yeniArgumanlar;
}

function surecSar() {
  for (const ad of ['spawn', 'spawnSync', 'exec', 'execSync', 'execFile', 'execFileSync', 'fork']) {
    const orijinal = childProcess[ad];
    if (typeof orijinal !== 'function' || orijinal[SARILDI]) continue;
    const sarici = function (...args) {
      let yeni = args;
      try {
        yeni = surecHazirla(ad, args);
      } catch {
        yeni = args;
      }
      return orijinal.apply(this, yeni);
    };
    ozellikleriKopyala(sarici, orijinal, [util.promisify.custom]);
    const ozel = orijinal[util.promisify.custom];
    if (typeof ozel === 'function') {
      Object.defineProperty(sarici, util.promisify.custom, {
        value: function (...args) {
          let yeni = args;
          try {
            yeni = surecHazirla(ad, args);
          } catch {
            yeni = args;
          }
          return ozel.apply(this, yeni);
        },
      });
    }
    Object.defineProperty(sarici, SARILDI, { value: true });
    childProcess[ad] = sarici;
  }
}

/**
 * Yerel ESM `import()` yüklemesi (`await import(pathToFileURL(yol).href)`; 7 test): Node yükleyicisi dosyayı iç `fs` ile okur, genel `fs` yamaları
 * görmez. `module.registerHooks` ile yakalamayı DENEDİM ve BIRAKTIM: vitest işçisinde `require(esm)` çağrısını bozdu (ölçüldü:
 * `isomorphic-dompurify` → jsdom → `@exodus/bytes`, "Cannot read properties of undefined (reading 'exports')"); ölçüm aracı testi
 * kırmızıya çevirmemeli. Yerine `url.pathToFileURL(yol)` çağrısı kaydedilir: bir yoldan dosya URL'si kurmak o dosyayı içe aktarmanın
 * (ya da okumanın) ön koşuludur; fazladan kayıt yalnız genişletir (güvenli yön). CJS `require` zaten genel `fs.readFileSync` ile yüklenir.
 */
function urlSar() {
  sar(nodeUrl, 'pathToFileURL', (args) => kaydet('okunan', args[0]));
}

/**
 * Yamaları BİR KEZ kurar (iş parçacığı başına; `isolate:false` ile aynı işçide birden çok dosya koşarsa tekrar sarmaz).
 * Dönüş: durum nesnesi. `ozgun` orijinal yazma işlevleridir (kayıt yazımı kendi kaydına girmesin).
 */
function kur(secenek = {}) {
  const mevcut = durumAl();
  if (mevcut) return mevcut;
  const klasor = secenek.klasor || process.env[ORTAM.KLASOR];
  if (!klasor) throw new Error(`${ORTAM.KLASOR} tanımlı değil: kayıt klasörü yok`);
  const durum = {
    kok: path.resolve(secenek.kok || kokDizini()),
    klasor: path.resolve(klasor),
    aktif: null,
    ozgun: { yaz: fs.writeFileSync.bind(fs), klasorYap: fs.mkdirSync.bind(fs) },
  };
  globalThis[DURUM_ANAHTARI] = durum;
  fsSar();
  surecSar();
  urlSar();
  try {
    if (typeof nodeModule.syncBuiltinESMExports === 'function') nodeModule.syncBuiltinESMExports();
  } catch {
    /* yerel ESM adlandırılmış içe aktarmaları eski işlevi görebilir: yakalama eksik kalır, test bozulmaz */
  }
  return durum;
}

/** Yeni bir test dosyası bağlamı başlatır. `testYolu` mutlak ya da köke göreli olabilir. */
function basla(testYolu, faz = 'kurulum') {
  const d = durumAl();
  if (!d) throw new Error('kur() çağrılmadan basla() çağrıldı');
  // Mutlak yol köke göre çevrilir; zaten köke göreli verilen (alt süreç kipinde ortamdan gelen) yol OLDUĞU GİBİ kalır:
  // çocuğun `cwd`si kök olmayabilir, göreli yolu ona göre çözmek yanlış teste yazardı.
  const goreli = path.isAbsolute(String(testYolu)) ? yoluNormalle(testYolu, d.kok) : String(testYolu);
  d.aktif = {
    testYolu: goreli === null ? String(testYolu) : goreli,
    faz,
    kurulum: bosGrup(),
    test: bosGrup(),
    surec: new Set(),
    belirsiz: new Set(),
  };
  return d.aktif;
}

/** Kurulum evresi bitti: bundan sonraki okumalar TESTİN okumasıdır (test dosyası içe aktarılırken çalışan kod dahil). */
function fazDegistir(faz) {
  const d = durumAl();
  if (d && d.aktif) d.aktif.faz = faz;
}

/** Şu ana dek yakalananı düz nesneye çevirir (testin kendi dosyası kendi okumalarından çıkarılır). */
function hamKayit() {
  const d = durumAl();
  if (!d || !d.aktif) return null;
  const { aktif } = d;
  const test = grupDizi(aktif.test);
  test.okunan = test.okunan.filter((p) => p !== aktif.testYolu);
  return {
    surum: SURUM,
    test: aktif.testYolu,
    kurulum: grupDizi(aktif.kurulum),
    ...test,
    surec: [...aktif.surec].sort(),
    belirsiz: [...aktif.belirsiz].sort(),
  };
}

function kayitDosyaAdi(testYolu, cocuk) {
  const ozet = crypto.createHash('sha1').update(testYolu).digest('hex');
  return cocuk ? `${ozet}.c${process.pid}-${Date.now()}.json` : `${ozet}.json`;
}

/** Ham kaydı klasöre yazar. Dönüş: yazılan yol (ya da bağlam yoksa null). Yazma hatası fırlatır (üretici bunu "kayıt yok" sayar). */
function bitir(cocuk = false) {
  const d = durumAl();
  const kayit = hamKayit();
  if (!d || !kayit) return null;
  d.ozgun.klasorYap(d.klasor, { recursive: true });
  const hedef = path.join(d.klasor, kayitDosyaAdi(kayit.test, cocuk));
  d.ozgun.yaz(hedef, `${JSON.stringify(kayit)}\n`);
  return hedef;
}

/** Alt süreç kipi: ortam değişkenleri dolu ve `--require` ile yüklendiyse kendini kurar, çıkışta kaydı yazar. */
function cocukKipiniBaslat() {
  if (process.env[ORTAM.COCUK] !== '1' || !process.env[ORTAM.TEST] || !process.env[ORTAM.KLASOR]) return;
  kur();
  basla(process.env[ORTAM.TEST], 'test');
  process.on('exit', () => {
    try {
      bitir(true);
    } catch {
      /* çıkış sırasında yazılamayan kayıt: üretici ana süreç kaydıyla yetinir */
    }
  });
}

if (require.main !== module) cocukKipiniBaslat();

module.exports = {
  GIT_ZARARSIZ,
  ORTAM,
  SURUM,
  basla,
  bitir,
  cocukOrtami,
  desenOneki,
  fazDegistir,
  gitAyristir,
  gitDosyayaBagli,
  hamKayit,
  kur,
  nodeBetigi,
  surecSinifla,
  yoluNormalle,
};
