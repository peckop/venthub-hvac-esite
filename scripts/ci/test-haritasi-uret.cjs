#!/usr/bin/env node
/**
 * ALT-38d · TEST HARİTASI ÜRETİCİSİ (karar 308, B1) — `scripts/ci/test-haritasi.json`u ÖLÇÜMLE üretir.
 *
 * AKIŞ: (1) tam vitest koşusu (`VENTHUB_DUNYA_DURUMU=dislan`, PR kapısıyla aynı küme; yapılandırma
 * `test-haritasi.vitest.config.ts`: kaydedici setupFiles ile açılır, `vitest.config.ts`e dokunulmaz; test listesi `--parti` parçaya bölünür ve
 * her parça ayrı vitest sürecidir: kesilirse en çok bir parça kaybolur) her test dosyasının okuduğu dosya/dizinleri ham kayıt olarak bir geçici
 * klasöre yazar; (2) bu betik ham kayıtları birleştirir, sıkıştırır, ana süreçte vite'ın yaptığı `import.meta.glob` okumalarını kaynaktan
 * çıkarıp ÖLÇÜMLE doğrular ve haritayı BELİRLENİMLİ biçimde yazar.
 *
 * Kullanım:
 *   node scripts/ci/test-haritasi-uret.cjs                       tam koşu + harita yaz
 *   node scripts/ci/test-haritasi-uret.cjs --devam <ham klasör>   yarım kalan koşuyu sürdür (yalnız sonuç dosyası olmayan parçalar koşar)
 *   node scripts/ci/test-haritasi-uret.cjs --yalniz a.test.ts …  yalnız bu testleri yeniden ölç, kalanını koru (araç özeti AYNI olmalı)
 *   node scripts/ci/test-haritasi-uret.cjs --ham <klasor>         koşmadan, var olan ham kayıt klasöründen yaz (vitest-*.json aynı klasörde)
 *   node scripts/ci/test-haritasi-uret.cjs --kontrol              depodaki haritayı ağaçla karşılaştır (yazmaz; sorun varsa çıkış 1)
 *   Seçenekler: --isci N (varsayılan 6) · --parti N (varsayılan 12) · --cikti yol (varsayılan scripts/ci/test-haritasi.json) · --ham-sil
 *
 * ELE ALINAN KÖR NOKTALAR (ölçüldü; sessiz kaçtığı için burada yazılı):
 *   1. `import.meta.glob(..., { query: '?raw' })` vite'ın ANA SÜRECİNDE okunur (78 test): kaydedici göremez. Desenler kaynaktan çıkarılır
 *      (köke göreli desen; yeni eklenen dosya da kapsanır), ölçülen `?raw` genişlemesiyle doğrulanır: ölçülen bir yol desenlerle
 *      kapsanmıyorsa test `belirsiz` olur ve yol AYRICA `okunan`a yazılır.
 *   2. izlenemeyen alt süreç (repo içinde git, python, sh...), ölçümde atlanan ya da kırmızı olan test → `belirsiz` (her zaman koşar).
 *   3. test dışı kodda `import.meta.glob` → `kuresel_desenler` (değişirse `tam`).
 * Çıktı BELİRLENİMLİDİR: tarih/ana makine adı/süre yok, her şey sıralı; aynı ağaç + aynı ham kayıt = bayt bayt aynı dosya.
 */
'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const sec = require('./test-sec.cjs');

const HARITA_YOLU = 'scripts/ci/test-haritasi.json';
const VITEST_YAPILANDIRMASI = 'scripts/ci/test-haritasi.vitest.config.ts';
/** Sıkıştırma eşikleri: aşılınca daha GENİŞ (güvenli yön) girdiye çevrilir. */
const ESIK = Object.freeze({ dizinAltAgac: 8, dosyaDizin: 40, altAgacDosya: 60 });
const KOD_UZANTISI = /\.(?:[cm]?[jt]sx?)$/;
const KOD_KOKLERI = Object.freeze(['src/', 'scripts/', 'supabase/functions/', 'tools/', 'tests/', 'e2e/']);
const KAYIT_ALANLARI = Object.freeze(['sha', 'okunan', 'dizin', 'ozy', 'desenler', 'surec', 'belirsiz']);

function posix(yol) {
  return yol.split(path.sep).join('/');
}

function sirali(kume) {
  return [...kume].sort();
}

// ---------------------------------------------------------------------------------------------------------------------------
// import.meta.glob: kaynaktan desen çıkarımı
// ---------------------------------------------------------------------------------------------------------------------------

const GLOB_CAGRISI = /import\s*\.\s*meta\s*\.\s*glob\s*(?:<[^>()]*>)?\s*\(/g;

/** `metin[bas]` bir tırnakla başlıyorsa metin değişmezini okur: { deger, son } (son = kapanış tırnağından sonraki indeks) ya da null. */
function dizgeOku(metin, bas) {
  const tirnak = metin.charAt(bas);
  if (tirnak !== "'" && tirnak !== '"' && tirnak !== '`') return null;
  let deger = '';
  let i = bas + 1;
  while (i < metin.length) {
    const c = metin.charAt(i);
    if (c === '\\') {
      deger += metin.charAt(i + 1);
      i += 2;
      continue;
    }
    if (c === tirnak) return { deger, son: i + 1 };
    if (tirnak === '`' && c === '$' && metin.charAt(i + 1) === '{') return null;
    if (c === '\n' && tirnak !== '`') return null;
    deger += c;
    i += 1;
  }
  return null;
}

function bosluk(metin, i) {
  let k = i;
  for (;;) {
    while (k < metin.length && /\s/.test(metin.charAt(k))) k += 1;
    if (metin.startsWith('//', k)) {
      while (k < metin.length && metin.charAt(k) !== '\n') k += 1;
    } else if (metin.startsWith('/*', k)) {
      const son = metin.indexOf('*/', k + 2);
      k = son === -1 ? metin.length : son + 2;
    } else return k;
  }
}

/** `import.meta.glob(` çağrısının birinci argümanı (metin ya da metin dizisi) ve kalan seçenek metni. null = çıkarılamadı. */
function globArgumani(metin, parantezSonrasi) {
  let i = bosluk(metin, parantezSonrasi);
  const desenler = [];
  if (metin.charAt(i) === '[') {
    i += 1;
    for (;;) {
      i = bosluk(metin, i);
      if (metin.charAt(i) === ']') {
        i += 1;
        break;
      }
      const d = dizgeOku(metin, i);
      if (!d) return null;
      desenler.push(d.deger);
      i = bosluk(metin, d.son);
      if (metin.charAt(i) === ',') i += 1;
      else if (metin.charAt(i) !== ']') return null;
    }
  } else {
    const d = dizgeOku(metin, i);
    if (!d) return null;
    desenler.push(d.deger);
    i = d.son;
  }
  // kalan: `, { ... })` ya da `)`; seçenek metnini eşleşen parantez sonuna dek al
  let derinlik = 1;
  let k = i;
  while (k < metin.length && derinlik > 0) {
    const c = metin.charAt(k);
    if (c === '(') derinlik += 1;
    else if (c === ')') derinlik -= 1;
    k += 1;
  }
  return { desenler, secenek: metin.slice(i, k) };
}

/** `import.meta.glob` ifadesinin yorum satırında ya da metin içinde ANILDIĞI durumu (gerçek çağrı olmayan) ayıklar. */
function gercekCagriMi(metin, indeks) {
  const satirBasi = metin.lastIndexOf('\n', indeks - 1) + 1;
  const onu = metin.slice(satirBasi, indeks);
  if (/^\s*(?:\/\/|\*|\/\*)/.test(onu)) return false;
  for (const t of ["'", '"', '`']) {
    let say = 0;
    for (let i = 0; i < onu.length; i++) {
      if (onu.charAt(i) === '\\') i += 1;
      else if (onu.charAt(i) === t) say += 1;
    }
    if (say % 2 === 1) return false;
  }
  return true;
}

/** Bir deseni köke göreli desene çevirir (`!` korunur). null = çözülemedi (köke göre dışarıda ya da desteklenmeyen biçim). */
function desenCoz(desen, dosyaYolu) {
  const olumsuz = desen.startsWith('!');
  const d = olumsuz ? desen.slice(1) : desen;
  let cozulen = null;
  if (d.startsWith('/')) cozulen = d.slice(1);
  else if (d.startsWith('./') || d.startsWith('../')) cozulen = path.posix.normalize(path.posix.join(path.posix.dirname(dosyaYolu), d));
  else if (d.startsWith('@/')) cozulen = `src/${d.slice(2)}`;
  else if (d.startsWith('**')) cozulen = d; // vite `**` ile başlayan deseni olduğu gibi bırakır (her yerde eşleşir)
  if (cozulen === null || cozulen === '' || cozulen.startsWith('../')) return null;
  return `${olumsuz ? '!' : ''}${cozulen}`;
}

/**
 * Bir dosyanın kaynağındaki TÜM `import.meta.glob` çağrılarından köke göreli desenleri çıkarır.
 * Dönüş: { desenler: string[] (sıralı, tekil), belirsiz: string[] }. Çıkarılamayan çağrı `belirsiz` düşer (sessiz geçilmez).
 */
function globCikar(kaynak, dosyaYolu) {
  const desenler = new Set();
  const belirsiz = new Set();
  for (const eslesme of kaynak.matchAll(GLOB_CAGRISI)) {
    if (!gercekCagriMi(kaynak, eslesme.index)) continue;
    const satir = kaynak.slice(0, eslesme.index).split('\n').length;
    const arg = globArgumani(kaynak, eslesme.index + eslesme[0].length);
    if (!arg) {
      belirsiz.add(`import.meta.glob argümanı çıkarılamadı (satır ${satir})`);
      continue;
    }
    if (/\bbase\s*:/.test(arg.secenek)) {
      belirsiz.add(`import.meta.glob base seçeneği (satır ${satir})`);
      continue;
    }
    for (const d of arg.desenler) {
      const coz = desenCoz(d, dosyaYolu);
      if (coz === null) belirsiz.add(`import.meta.glob deseni çözülemedi: ${d.slice(0, 60)} (satır ${satir})`);
      else desenler.add(coz);
    }
  }
  return { desenler: sirali(desenler), belirsiz: sirali(belirsiz) };
}

/** Ana süreçte ölçülen `?raw` içe aktarma belirtecini (`../x.md?raw`, `/src/a.ts?raw`) köke göreli yola çevirir; çözülemezse null. */
function rawYolu(belirtec, kimlikGoreli) {
  const temiz = belirtec.split('?')[0];
  let yol;
  if (temiz.startsWith('/@fs/')) return null;
  if (temiz.startsWith('/')) yol = temiz.slice(1);
  else yol = path.posix.normalize(path.posix.join(path.posix.dirname(kimlikGoreli), temiz));
  if (yol.startsWith('../') || yol === '' || yol.split('/').includes('node_modules')) return null;
  return yol;
}

// ---------------------------------------------------------------------------------------------------------------------------
// ham kayıtlar → test kaydı
// ---------------------------------------------------------------------------------------------------------------------------

/** `a` yolu `b` dizininin içinde mi (ya da `b` kök `.` mü)? */
function altinda(a, b) {
  return b === '.' || a === b || a.startsWith(`${b}/`);
}

function ustDizin(yol) {
  const i = yol.lastIndexOf('/');
  return i === -1 ? '.' : yol.slice(0, i);
}

/**
 * Bir test kaydını (Set/dizi alanları) SIKIŞTIRIR. Hepsi GENİŞLETME yönündedir (eşleşen yol kümesi hiç daralmaz):
 *   1. alt ağaç girdisi (`ozy`) kapsadığı dizin/dosya girdilerini yutar,
 *   2. bir dizin girdisi o dizinin DOĞRUDAN çocuk dosya girdilerini yutar (dizin eşleşmesi çocuğun HER değişimini zaten yakalar),
 *   3. bir dizinde `ESIK.dosyaDizin` ya da daha çok dosya girdisi varsa o dizin girdisi olur,
 *   4. bir üst dizinin altında `ESIK.dizinAltAgac` ya da daha çok DİZİN girdisi, ya da `ESIK.altAgacDosya` ya da daha çok DOSYA girdisi
 *      (alt dizinlere yayılmış olsa da) varsa hepsi o üst dizinin ALT AĞACI olur (en derin aday önce; kök `.` asla aday değildir).
 * Neden: depoyu tarayan testler (`git ls-files` + hepsini oku) binlerce tekil yol yazardı; alt ağaç girdisi aynı değişiklikleri (üstelik
 * yeni dosyayı da) yakalar, dosya boyutu ve seçim süresi küçülür. Bedeli: o alt ağaçtan HER değişiklik testi seçer (güvenli yön).
 */
function sikistir(girdi, esik = ESIK) {
  let okunan = new Set(girdi.okunan);
  let dizin = new Set(girdi.dizin);
  const ozy = new Set(girdi.ozy);
  const ozyYut = () => {
    for (const r of [...ozy]) if ([...ozy].some((u) => u !== r && altinda(r, u))) ozy.delete(r);
    dizin = new Set([...dizin].filter((d) => ![...ozy].some((r) => altinda(d, r))));
    okunan = new Set([...okunan].filter((f) => ![...ozy].some((r) => altinda(f, r))));
  };
  const dizinYut = () => {
    okunan = new Set([...okunan].filter((f) => !dizin.has(ustDizin(f))));
  };
  ozyYut();
  dizinYut();
  const dizineSayac = new Map();
  for (const f of okunan) dizineSayac.set(ustDizin(f), (dizineSayac.get(ustDizin(f)) || 0) + 1);
  for (const [d, n] of dizineSayac) if (n >= esik.dosyaDizin) dizin.add(d);
  dizinYut();
  // Her verimli tur en az bir girdiyi yutar: tur sayısı girdi sayısını AŞAMAZ. Aşarsa sonlanmayan döngü demektir; takılmak yerine FIRLATIR
  // (sessiz sonsuz döngü ölçüm koşusunu ve CI'ı kilitlerdi).
  const turSiniri = okunan.size + dizin.size + ozy.size + 8;
  for (let tur = 0; ; tur++) {
    if (tur > turSiniri) throw new Error('sikistir sonlanmadı (tur sınırı aşıldı): girdi sıkıştırılamıyor');
    const sayac = new Map();
    const say = (yol, alan) => {
      const parcalar = yol === '.' ? [] : yol.split('/');
      for (let i = 1; i <= parcalar.length; i++) {
        const atasi = parcalar.slice(0, i).join('/');
        const o = sayac.get(atasi) || { dizin: 0, dosya: 0 };
        o[alan] += 1;
        sayac.set(atasi, o);
      }
    };
    for (const d of dizin) say(d, 'dizin');
    for (const f of okunan) say(ustDizin(f), 'dosya');
    const adaylar = [...sayac.entries()].filter(([, o]) => o.dizin >= esik.dizinAltAgac || o.dosya >= esik.altAgacDosya).map(([a]) => a);
    if (adaylar.length === 0) break;
    adaylar.sort((a, b) => b.split('/').length - a.split('/').length || (a < b ? -1 : 1));
    ozy.add(adaylar[0]);
    ozyYut();
    dizinYut();
  }
  return { okunan: sirali(okunan), dizin: sirali(dizin), ozy: sirali(ozy) };
}

/** Süreç etiketi düzeltmesi: rastgele geçici dizin adları etikete sızmışsa (eski kayıt) `node (repo dışı betik)` yapar. */
function surecEtiketi(etiket) {
  return /^node (?:[A-Za-z]:|\/)/.test(etiket) ? 'node (repo dışı betik)' : etiket;
}

/**
 * Bir testin ham kayıtlarından (ana süreç + alt süreçler) harita kaydını kurar.
 * Dönüş: { kayit, kurulum } — `kurulum` kurulum evresinde okunanlar (haritanın `kuresel` listesine birleşir).
 */
function kayitKur({ ana, cocuklar, kaynak, testYolu, vitestDurumu, globOlcum, yoksayilan = new Set() }) {
  const okunan = new Set(ana.okunan);
  const dizin = new Set(ana.dizin);
  const ozy = new Set(ana.ozy);
  const surec = new Set((ana.surec || []).map(surecEtiketi));
  const belirsiz = new Set(ana.belirsiz || []);
  for (const c of cocuklar) {
    for (const p of c.okunan) okunan.add(p);
    for (const p of c.dizin) dizin.add(p);
    for (const p of c.ozy) ozy.add(p);
    for (const b of c.belirsiz || []) belirsiz.add(b);
    for (const s of c.surec || []) surec.add(surecEtiketi(s));
  }
  const glob = globCikar(kaynak, testYolu);
  for (const b of glob.belirsiz) belirsiz.add(b);
  const olculen = new Set();
  for (const g of globOlcum) for (const b of g.raw) {
    const yol = rawYolu(b, testYolu);
    if (yol !== null) olculen.add(yol);
  }
  const kapsanmayan = sirali(olculen).filter((p) => glob.desenler.length === 0 || !sec.globEslesir(glob.desenler, p));
  if (kapsanmayan.length > 0) {
    for (const p of kapsanmayan) okunan.add(p);
    if (glob.desenler.length > 0) belirsiz.add(`ölçülen ?raw okumasını desen kapsamıyor (${kapsanmayan.length} dosya, ilki ${kapsanmayan[0]})`);
  }
  if (vitestDurumu) {
    if (vitestDurumu.basarisiz) belirsiz.add('ölçüm koşusunda kırmızı: okuma kaydı eksik olabilir');
    if (vitestDurumu.atlanan > 0) belirsiz.add(`ölçüm koşusunda ${vitestDurumu.atlanan} test atlandı: koşullu okuma görünmeyebilir`);
  }
  // İzlenmeyen VE `.gitignore` kapsamındaki dosya (testin kendi yazdığı geçici dosya: `tmp/<ad>-<pid>.json`, yerel yapılandırma, `.env*`...) hiçbir PR
  // farkında çıkamaz ve adı koşudan koşuya değişebilir (belirlenimlilik): okunan listesinden atılır. İzlenen dosya (ignore desenine uysa da) KALIR.
  const sikisik = sikistir({ okunan: [...okunan].filter((p) => p !== testYolu && !yoksayilan.has(p)), dizin, ozy });
  const kayit = {
    sha: sec.icerikOzeti(kaynak),
    okunan: sikisik.okunan,
    dizin: sikisik.dizin,
    ozy: sikisik.ozy,
    desenler: glob.desenler,
    surec: sirali(surec),
    belirsiz: sirali(belirsiz),
  };
  return { kayit, kurulum: ana.kurulum };
}

// ---------------------------------------------------------------------------------------------------------------------------
// ham klasör okuma, harita kurma, serileştirme
// ---------------------------------------------------------------------------------------------------------------------------

function jsonOku(dosya) {
  return JSON.parse(fs.readFileSync(dosya, 'utf8'));
}

/**
 * Ham klasör: ana kayıtlar (`<özet>.json`), alt süreç kayıtları (`<özet>.c<pid>-<zaman>.json`), glob ölçümü (`glob-olcum.jsonl`) ve
 * parti başına vitest sonuçları (`vitest-<n>.json`; tek parça kullanımda `vitest.json`).
 */
function hamKlasoruOku(klasor, kok) {
  const anaKayitlar = new Map();
  const cocuklar = new Map();
  const vitestDosyalari = [];
  for (const ad of fs.readdirSync(klasor)) {
    if (/^vitest(?:-\d+)?\.json$/.test(ad)) {
      vitestDosyalari.push(path.join(klasor, ad));
      continue;
    }
    if (!ad.endsWith('.json')) continue;
    let k;
    try {
      k = jsonOku(path.join(klasor, ad));
    } catch {
      continue;
    }
    if (!k || typeof k.test !== 'string') continue;
    if (/\.c\d+-\d+\.json$/.test(ad)) {
      const liste = cocuklar.get(k.test) || [];
      liste.push(k);
      cocuklar.set(k.test, liste);
    } else {
      anaKayitlar.set(k.test, k);
    }
  }
  const globOlcum = new Map();
  const globDosyasi = path.join(klasor, 'glob-olcum.jsonl');
  if (fs.existsSync(globDosyasi)) {
    for (const satir of fs.readFileSync(globDosyasi, 'utf8').split('\n')) {
      if (satir.trim() === '') continue;
      try {
        const g = JSON.parse(satir);
        const goreli = posix(path.relative(kok, g.kimlik)).split('?')[0];
        const liste = globOlcum.get(goreli) || [];
        liste.push({ kimlik: goreli, raw: g.raw });
        globOlcum.set(goreli, liste);
      } catch {
        /* bozuk satır: o modülün ölçümü yok sayılır (desen doğrulaması yalnız ölçülene bakar) */
      }
    }
  }
  const vitestDurumlari = new Map();
  for (const vitestDosyasi of vitestDosyalari.sort()) {
    try {
      for (const r of jsonOku(vitestDosyasi).testResults || []) {
        const goreli = posix(path.relative(kok, r.name));
        const sonuclar = r.assertionResults || [];
        vitestDurumlari.set(goreli, {
          basarisiz: r.status === 'failed',
          atlanan: sonuclar.filter((a) => ['pending', 'skipped', 'todo', 'disabled'].includes(a.status)).length,
          testSayisi: sonuclar.length,
          sn: Math.max(0, (r.endTime - r.startTime) / 1000),
        });
      }
    } catch {
      /* okunamayan vitest sonucu: o parti için durum bilgisi yok (kırmızı/atlanan tespit edilemez; `kayitsiz` raporu bunu gösterir) */
    }
  }
  return { anaKayitlar, cocuklar, globOlcum, vitestDurumlari };
}

function gitDosyalari(kok) {
  const cikti = childProcess.execFileSync('git', ['ls-files', '-z'], { cwd: kok, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  return cikti.split('\0').filter((s) => s !== '');
}

/**
 * Ham kayıtlardaki `okunan` yollardan İZLENMEYEN ve `.gitignore` kapsamında olanlar (`git check-ignore`: izlenen dosyayı ignore desenine uysa bile
 * "ignore" saymaz). Çıkış kodu 1 = hiçbiri ignore değil (hata değil). Dönüş: Set.
 */
function yoksayilanYollar(kok, ham) {
  const yollar = new Set();
  const topla = (k) => {
    for (const p of k.okunan || []) yollar.add(p);
  };
  for (const k of ham.anaKayitlar.values()) topla(k);
  for (const liste of ham.cocuklar.values()) for (const k of liste) topla(k);
  if (yollar.size === 0) return new Set();
  const sonuc = childProcess.spawnSync('git', ['check-ignore', '-z', '--stdin'], { cwd: kok, input: [...yollar].join('\0'), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  if (sonuc.status !== 0 && sonuc.status !== 1) throw new Error(`git check-ignore başarısız (çıkış ${sonuc.status}): ${String(sonuc.stderr).slice(0, 200)}`);
  return new Set(String(sonuc.stdout).split('\0').filter((s) => s !== ''));
}

/** Test dışı kodda `import.meta.glob` kullanımı: bunlar HERHANGİ bir testin bağımlılığı olabilir → küresel desen. */
function kodGlobTaramasi(kok, dosyalar, testMi) {
  const desenler = new Set();
  const belirsiz = [];
  for (const d of dosyalar) {
    if (!KOD_UZANTISI.test(d) || testMi(d) || !KOD_KOKLERI.some((o) => d.startsWith(o))) continue;
    let metin;
    try {
      metin = fs.readFileSync(path.join(kok, d), 'utf8');
    } catch {
      continue;
    }
    if (!metin.includes('meta')) continue;
    const g = globCikar(metin, d);
    for (const p of g.desenler) desenler.add(p);
    for (const b of g.belirsiz) belirsiz.push(`${d}: ${b}`);
  }
  return { desenler: sirali(desenler), belirsiz };
}

/**
 * Haritayı kurar. `girdi`: { kok, ham (hamKlasoruOku çıktısı), testler (köke göreli test yolları), kaynakOku(yol), dosyalar (git ls-files) }.
 * Ham kaydı olmayan test haritaya GİRMEZ (seçici onu her zaman koşturur). Dönüş: { harita, ozet }.
 */
function haritaKur({ kok, ham, testler, kaynakOku, dosyalar, uretim, yoksayilan = new Set() }) {
  const testKumesi = new Set(testler);
  const kayitlar = {};
  const kurulumOkunan = new Set();
  const kayitsiz = [];
  for (const test of sirali(testKumesi)) {
    const ana = ham.anaKayitlar.get(test);
    if (!ana) {
      kayitsiz.push(test);
      continue;
    }
    const { kayit, kurulum } = kayitKur({
      ana,
      cocuklar: ham.cocuklar.get(test) || [],
      kaynak: kaynakOku(test),
      testYolu: test,
      vitestDurumu: ham.vitestDurumlari.get(test) || null,
      globOlcum: ham.globOlcum.get(test) || [],
      yoksayilan,
    });
    // Ölçüm sonuçları (vitest JSON) varsa ama bu test için YOKSA kırmızı/atlanan olup olmadığı bilinemez: belirsiz.
    if (ham.vitestDurumlari.size > 0 && !ham.vitestDurumlari.has(test)) kayit.belirsiz = sirali(new Set([...kayit.belirsiz, 'ölçüm sonucu (vitest JSON) bu test için yok']));
    kayitlar[test] = kayit;
    for (const p of [...kurulum.okunan, ...kurulum.dizin, ...kurulum.ozy]) kurulumOkunan.add(p);
  }
  const kodGlob = kodGlobTaramasi(kok, dosyalar, (d) => sec.TEST_DESENI.test(d));
  const kuresel = new Set(kurulumOkunan);
  // Test OLMAYAN bir modülün `?raw` okumaları (yardımcı): kendi desenleri kapsıyorsa `kuresel_desenler` yeter; kapsamayan ölçülen yol küreseldir.
  for (const [kimlik, liste] of ham.globOlcum) {
    if (testKumesi.has(kimlik) || kimlik.startsWith('..')) continue;
    let kaynak;
    try {
      kaynak = kaynakOku(kimlik);
    } catch {
      continue;
    }
    const kendi = globCikar(kaynak, kimlik);
    for (const g of liste) {
      for (const b of g.raw) {
        const yol = rawYolu(b, kimlik);
        if (yol !== null && (kendi.desenler.length === 0 || !sec.globEslesir(kendi.desenler, yol))) kuresel.add(yol);
      }
    }
  }
  const kokler = new Set(dosyalar.map((d) => d.split('/')[0]));
  const harita = {
    surum: sec.HARITA_SURUMU,
    uretim,
    arac: sec.aracOzeti(kok),
    kokler: sirali(kokler),
    kuresel: sirali(kuresel),
    kuresel_desenler: kodGlob.belirsiz.length > 0 ? sirali(new Set([...kodGlob.desenler, '**'])) : kodGlob.desenler,
    testler: kayitlar,
  };
  return { harita, ozet: { kayitli: Object.keys(kayitlar).length, kayitsiz, kodGlobBelirsiz: kodGlob.belirsiz } };
}

/** CANONICAL serileştirme: sabit anahtar sırası, her test kaydı TEK satır, boş alanlar yok, sonda satır sonu. */
function serilestir(harita) {
  const dizi = (a) => JSON.stringify(a);
  const satirlar = [
    '{',
    `  "surum": ${harita.surum},`,
    `  "uretim": ${JSON.stringify(harita.uretim)},`,
    `  "arac": ${JSON.stringify(harita.arac)},`,
    `  "kokler": ${dizi([...harita.kokler].sort())},`,
    `  "kuresel": ${dizi([...(harita.kuresel || [])].sort())},`,
    `  "kuresel_desenler": ${dizi([...(harita.kuresel_desenler || [])].sort())},`,
    '  "testler": {',
  ];
  const adlar = Object.keys(harita.testler).sort();
  adlar.forEach((ad, i) => {
    const k = harita.testler[ad];
    const sade = {};
    for (const alan of KAYIT_ALANLARI) {
      if (alan === 'sha') sade.sha = k.sha;
      else if (Array.isArray(k[alan]) && k[alan].length > 0) sade[alan] = [...k[alan]].sort();
    }
    satirlar.push(`    ${JSON.stringify(ad)}: ${JSON.stringify(sade)}${i < adlar.length - 1 ? ',' : ''}`);
  });
  satirlar.push('  }', '}');
  return `${satirlar.join('\n')}\n`;
}

/**
 * Depodaki haritayı ağaçla karşılaştırır (KOŞMAZ). `sorunlar` KIRMIZI nedenleridir (bozuk biçim, canonical olmayan bayt, ölçüm aracı
 * değişmiş); `bilgi` kırmızı DEĞİLDİR (bayat/eksik test kaydı seçicide "her zaman koşar" olur; yenilemek için üretici koşturulur).
 */
function kontrolEt(kok, testler, harita = null, metin = null) {
  const sorunlar = [];
  const yol = path.join(kok, HARITA_YOLU);
  // Satır sonu normalleştirilir: Windows çalışma ağacı (`* text=auto`) CRLF'e çevirmiş olabilir; depodaki bayt dizisi LF'tir.
  const ham = (metin !== null ? metin : fs.readFileSync(yol, 'utf8')).split('\r\n').join('\n');
  const nesne = harita !== null ? harita : JSON.parse(ham);
  const biçim = sec.haritaSorunu(nesne);
  if (biçim) sorunlar.push(`harita biçimi geçersiz: ${biçim}`);
  if (!biçim) {
    if (serilestir(nesne) !== ham) sorunlar.push('harita canonical biçimde değil (sıra/boşluk/alan): üreticinin yazdığı bayt dizisi değil');
    const guncel = sec.aracOzeti(kok);
    if (nesne.arac !== guncel) sorunlar.push(`ölçüm aracı özeti haritadakiyle farklı (${nesne.arac} ≠ ${guncel}): kaydedici/kurulum/yapılandırma değişti, haritayı yeniden üret`);
  }
  const bilgi = { bayat: [], kayitsiz: [], hayalet: [] };
  if (!biçim) {
    for (const t of testler) {
      const k = nesne.testler[t];
      if (!k) {
        bilgi.kayitsiz.push(t);
        continue;
      }
      try {
        if (sec.dosyaOzeti(kok, t) !== k.sha) bilgi.bayat.push(t);
      } catch {
        bilgi.bayat.push(t);
      }
    }
    const var_ = new Set(testler);
    for (const t of Object.keys(nesne.testler)) if (!var_.has(t)) bilgi.hayalet.push(t);
  }
  return { sorunlar, bilgi };
}

// ---------------------------------------------------------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------------------------------------------------------

function argumanlariCoz(argv) {
  const s = { ham: null, devam: null, yalniz: [], isci: 6, parti: 12, cikti: HARITA_YOLU, kontrol: false, hamSil: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ham') s.ham = argv[++i];
    else if (a === '--devam') s.devam = argv[++i];
    else if (a === '--yalniz') {
      while (argv[i + 1] && !argv[i + 1].startsWith('--')) s.yalniz.push(argv[++i]);
    } else if (a === '--isci') s.isci = Number.parseInt(argv[++i], 10);
    else if (a === '--parti') s.parti = Number.parseInt(argv[++i], 10);
    else if (a === '--cikti') s.cikti = argv[++i];
    else if (a === '--kontrol') s.kontrol = true;
    else if (a === '--ham-sil') s.hamSil = true;
    else throw new Error(`bilinmeyen argüman: ${a}`);
  }
  if (!Number.isInteger(s.isci) || s.isci < 1) throw new Error('--isci pozitif tam sayı olmalı');
  if (!Number.isInteger(s.parti) || s.parti < 1) throw new Error('--parti pozitif tam sayı olmalı');
  if (s.ham && s.devam) throw new Error('--ham (koşmadan işle) ile --devam (yarım koşuyu sürdür) birlikte verilemez');
  return s;
}

/** Sıralı listeyi `n` bitişik parçaya böler (belirlenimli; boş parça oluşmaz). */
function partilereBol(liste, n) {
  const boyut = Math.max(1, Math.ceil(liste.length / n));
  const partiler = [];
  for (let i = 0; i < liste.length; i += boyut) partiler.push(liste.slice(i, i + boyut));
  return partiler;
}

function vitestSurumu(kok) {
  try {
    return jsonOku(path.join(kok, 'node_modules', 'vitest', 'package.json')).version;
  } catch {
    return 'bilinmiyor';
  }
}

function uretimBilgisi(kok) {
  return { vitest: vitestSurumu(kok), kip: 'dislan', node: process.versions.node.split('.')[0] };
}

/**
 * Ölçüm koşusu: test listesi `--parti` bitişik parçaya bölünür ve her parça AYRI bir vitest süreciyle koşar (`vitest-<n>.json` parça
 * bitince yazılır). NİÇİN: tek uzun koşu dışarıdan öldürülürse (ölçüldü: 13:17'de süreç ağacı bir anda sonlandı, sonuç dosyası hiç yazılmadı)
 * bütün ölçüm kaybolurdu; parçalı koşuda en çok bir parça kaybolur ve `--devam <ham klasör>` yalnız eksik parçaları koşar. Parça bölmesi
 * klasördeki `parti.json`dan okunur (devam ederken ağaç değişse de aynı bölme). Vitest kırmızı çıksa da ham kayıtlar geçerlidir.
 * Dönüş: { klasor, eksik: [parça numaraları] }.
 */
function olcumKos(kok, s, hedefler) {
  const devam = s.devam !== null;
  const klasor = devam ? path.resolve(s.devam) : fs.mkdtempSync(path.join(os.tmpdir(), 'vh-harita-'));
  if (devam && !fs.existsSync(path.join(klasor, 'parti.json'))) throw new Error(`--devam klasöründe parti.json yok: ${klasor}`);
  const manifestYolu = path.join(klasor, 'parti.json');
  const partiler = devam ? jsonOku(manifestYolu).partiler : partilereBol(hedefler, s.parti);
  if (!devam) fs.writeFileSync(manifestYolu, `${JSON.stringify({ partiler })}\n`, 'utf8');
  const vitestBin = path.join(kok, 'node_modules', 'vitest', 'vitest.mjs');
  const env = { ...process.env, VENTHUB_DUNYA_DURUMU: 'dislan', VENTHUB_HARITA_KLASOR: klasor, VENTHUB_HARITA_KOK: kok, CI: 'true' };
  process.stdout.write(`[harita] ölçüm koşusu: ${partiler.length} parça, işçi ${s.isci}, ham klasör: ${klasor}\n`);
  const eksik = [];
  partiler.forEach((parca, i) => {
    const sonucDosyasi = path.join(klasor, `vitest-${i}.json`);
    if (fs.existsSync(sonucDosyasi)) {
      process.stdout.write(`[harita] parça ${i + 1}/${partiler.length}: tamam (atlandı)\n`);
      return;
    }
    const baslangic = Date.now();
    const args = [vitestBin, 'run', '--config', VITEST_YAPILANDIRMASI, '--reporter=dot', '--reporter=json', `--outputFile.json=${sonucDosyasi}`, `--maxWorkers=${s.isci}`, '--no-color', ...parca];
    const sonuc = childProcess.spawnSync(process.execPath, args, { cwd: kok, env, stdio: 'inherit', windowsHide: true });
    const var_ = fs.existsSync(sonucDosyasi);
    if (!var_) eksik.push(i);
    process.stdout.write(`\n[harita] parça ${i + 1}/${partiler.length}: ${parca.length} dosya, ${((Date.now() - baslangic) / 1000).toFixed(0)} sn, vitest çıkış ${sonuc.status}${var_ ? '' : ' — SONUÇ DOSYASI YOK'}\n`);
  });
  return { klasor, eksik };
}

/** vitest'in `VENTHUB_DUNYA_DURUMU=dislan` kipinde listelediği test dosyaları (PR kapısının evreni). */
async function testListesi(kok) {
  const onceki = process.env.VENTHUB_DUNYA_DURUMU;
  process.env.VENTHUB_DUNYA_DURUMU = 'dislan';
  let oturum = null;
  try {
    oturum = await sec.vitestOturumuAc(kok);
    return oturum.testler;
  } finally {
    if (onceki === undefined) delete process.env.VENTHUB_DUNYA_DURUMU;
    else process.env.VENTHUB_DUNYA_DURUMU = onceki;
    if (oturum) await oturum.kapat();
  }
}

async function calistir(argv, kok = path.resolve(__dirname, '..', '..')) {
  const s = argumanlariCoz(argv);
  const dosyalar = gitDosyalari(kok);
  if (s.kontrol) {
    const sonuc = kontrolEt(kok, await testListesi(kok));
    process.stdout.write(`[harita] sorun ${sonuc.sorunlar.length} · bayat kayıt ${sonuc.bilgi.bayat.length} · kayıtsız test ${sonuc.bilgi.kayitsiz.length} · hayalet kayıt ${sonuc.bilgi.hayalet.length}\n`);
    for (const sorun of sonuc.sorunlar) process.stdout.write(`[harita] KIRMIZI: ${sorun}\n`);
    return sonuc.sorunlar.length === 0 ? 0 : 1;
  }
  let onceki = null;
  if (s.yalniz.length > 0) {
    onceki = JSON.parse(fs.readFileSync(path.join(kok, s.cikti), 'utf8'));
    if (onceki.arac !== sec.aracOzeti(kok)) throw new Error('ölçüm aracı değişmiş: --yalniz ile kısmi yenileme güvenli değil, tam üretim koş');
  }
  const tumTestler = await testListesi(kok);
  const olculecek = s.yalniz.length > 0 ? s.yalniz.map((y) => posix(path.relative(kok, path.resolve(kok, y)))) : tumTestler;
  let klasor;
  if (s.ham) {
    klasor = path.resolve(s.ham);
  } else {
    const kosu = olcumKos(kok, s, olculecek);
    klasor = kosu.klasor;
    if (kosu.eksik.length > 0) {
      process.stdout.write(`[harita] ${kosu.eksik.length} parçanın sonuç dosyası yok (koşu kesilmiş olabilir): harita YAZILMADI. Sürdür: node scripts/ci/test-haritasi-uret.cjs --devam ${klasor}\n`);
      return 2;
    }
  }
  const ham = hamKlasoruOku(klasor, kok);
  const kaynakOku = (yol) => fs.readFileSync(path.join(kok, yol), 'utf8');
  const yoksayilan = yoksayilanYollar(kok, ham);
  const { harita, ozet } = haritaKur({ kok, ham, testler: olculecek, kaynakOku, dosyalar, uretim: uretimBilgisi(kok), yoksayilan });
  if (onceki) {
    const birlesik = { ...onceki.testler };
    for (const t of olculecek) delete birlesik[t];
    for (const t of Object.keys(birlesik)) if (!tumTestler.includes(t)) delete birlesik[t];
    harita.testler = { ...birlesik, ...harita.testler };
  }
  fs.writeFileSync(path.join(kok, s.cikti), serilestir(harita), 'utf8');
  process.stdout.write(`[harita] yazıldı: ${s.cikti} · kayıtlı test ${Object.keys(harita.testler).length}/${tumTestler.length} · ham kaydı olmayan ${ozet.kayitsiz.length}\n`);
  for (const t of ozet.kayitsiz.slice(0, 20)) process.stdout.write(`[harita]   kayıtsız: ${t}\n`);
  if (s.hamSil && !s.ham && path.basename(klasor).startsWith('vh-harita-') && path.dirname(klasor) === os.tmpdir()) fs.rmSync(klasor, { recursive: true, force: true });
  return 0;
}

if (require.main === module) {
  calistir(process.argv.slice(2)).then(
    (kod) => process.exit(kod),
    (e) => {
      process.stderr.write(`[harita] HATA: ${e && e.message ? e.message : String(e)}\n`);
      process.exit(1);
    },
  );
}

module.exports = {
  ESIK,
  HARITA_YOLU,
  VITEST_YAPILANDIRMASI,
  altinda,
  calistir,
  desenCoz,
  globCikar,
  haritaKur,
  hamKlasoruOku,
  kayitKur,
  kodGlobTaramasi,
  kontrolEt,
  partilereBol,
  rawYolu,
  serilestir,
  sikistir,
  surecEtiketi,
  yoksayilanYollar,
};
