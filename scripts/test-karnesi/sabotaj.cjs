#!/usr/bin/env node
/**
 * ALT-38 · Test karnesi — soru 3: "koruduğu şeyi bozunca kırmızı veriyor mu" (sabotaj yoklaması).
 *
 * Bir plan dosyasındaki her test için: (1) testi olduğu gibi koşar (taban), (2) KORUDUĞU şeyi bozan
 * tek bir sabotajı uygular, (3) aynı testi yeniden koşar, (4) sabotajı geri alır ve sha256 ile doğrular.
 * Sabotaj testi kırmızıya çevirirse test o şeyi gerçekten korur; yeşil kalırsa SAHTE YEŞİL adayıdır.
 *
 * Mevcut `mutasyon-kosucu.cjs`den farkı: hedef yalnız `src/` kodu değil, testin koruduğu HER izlenen
 * dosya olabilir (iş akışı, belge, kanca, betik, migration); çünkü conformance testleri çoğunlukla
 * kod değil, depo düzenini korur. Aynı mekanik korumalar BURADA da zorlanır:
 *
 *   1. Yalnız BAĞLI git worktree'de koşar; ana ağaçta REDDEDER.
 *   2. Ağaç temiz başlamalı; her sabotajdan sonra sha256 ile geri alma doğrulanır, tutmazsa DURUR.
 *   3. Sabotaj hedefi: depo içi, izlenen ya da yeni dosya. `.git/`, `node_modules/` ve SINANAN TESTİN
 *      KENDİSİ reddedilir (testi bozarak kırmızı üretmek sabotaj değildir).
 *   4. `degistir` çapası dosyada TAM 1 KEZ geçmeli (0 ya da 2+ → HATA-CAPA, uygulanmaz).
 *   5. Alt süreç ortamından sır/anahtar/jeton silinir; ağa çıkan test sabotajdan etkilenmez, taban
 *      aşamasında bile dış sağlayıcıya istek atamaz.
 *   6. Sabotajlar YALNIZ atılabilir worktree'de koşar; hiçbir şey commit'lenmez.
 *   7. Alt süreçler BOŞ geçici bir ev dizini görür (HOME/USERPROFILE) ve CLAUDE* ortam değişkenleri
 *      silinir: testler gerçek ev dizinine (defter, ayar, hafıza) yazamaz, CI'daki gibi boş ev görür.
 *
 * Kullanım:
 *   node scripts/test-karnesi/sabotaj.cjs --repo <worktree> --plan <plan.json> --cikti <sonuc.jsonl>
 *        [--zaman-asimi 150] [--yalniz <test yolu>] [--bellek-esigi-gb 2] [--ortak 4]
 *
 * Soru 6 ("aynı şeyi başka test koruyor mu") ÖLÇÜLÜR: sabotaj testi kırmızıya çevirirse, aynı sabotaj
 * AYAKTAYKEN sabotaj edilen dosyayı (yol, dosya adı ya da dizin) anan en fazla `--ortak` başka test
 * koşulur; kırmızı verenler, sabotaj geri alındıktan sonra bir kez daha koşulup tabanda YEŞİL oldukları
 * doğrulanırsa `ortakKirmizi` listesine girer (taban zaten kırmızı olan test "yakaladı" sayılmaz).
 *
 * Plan biçimi (surum 1):
 *   { "surum": 1, "testler": [ {
 *       "test": "src/__tests__/conformance/x.test.ts",
 *       "korur": "tek cümle: bu test neyi koruyor",
 *       "sabotajlar": [ { "ad": "kısa ad", "adimlar": [
 *           { "tur": "degistir", "dosya": "yol", "bul": "tam 1 kez geçen metin", "yerine": "bozuk metin" },
 *           { "tur": "sonaEkle", "dosya": "yol", "icerik": "\n// ihlal\n" },
 *           { "tur": "ekle",     "dosya": "yeni/yol.ts", "icerik": "..." },
 *           { "tur": "sil",      "dosya": "yol" } ] } ] } ] }
 *
 * Plan'da testin yanında isteğe bağlı AJAN DEĞERLENDİRMESİ alanları taşınır (ölçüm değildir, çıktıda
 * "ajan" altında ayrı durur): `ortam` (ortama bağlılık notu), `kanban` (artık Kanban/kokpit koruyor mu),
 * `kopya` (aynı şeyi koruyan başka test adayları), `not`.
 *
 * Çıktı (JSONL, her test için bir satır; yeniden koşturulursa tamamlanmış testler atlanır):
 *   { test, korur, taban:{sonuc,sureMs,toplam,gecen,atlanan},
 *     denemeler:[{ad,sonuc,olduren,neden,sureMs,ortak:[{test,sonuc,tabanGecti?}]}],
 *     ortakKirmizi:[test...], ortakAdaylari:[test...], hukum, yanEtki:[...], ajan:{ortam,kanban,kopya,not} }
 *   hukum: KIRMIZI (sabotaj yakalandı) · YESIL (hiçbir sabotaj yakalanmadı: SAHTE YEŞİL adayı) ·
 *          TABAN_KIRMIZI · TABAN_ATLANDI · UYGULANAMADI (hiçbir sabotaj uygulanamadı)
 *
 * Çıkış kodları: 0 tamam · 1 kullanım/plan hatası · 2 GERİ ALMA/AĞAÇ İHLALİ (durdu) · 3 ana ağaç reddi · 4 bellek düşük.
 */
'use strict';

const cp = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const VARSAYILAN_ZAMAN_ASIMI_SN = 150;
const YASAK_ORTAM =
  /IYZICO|RESEND|TWILIO|SERVICE_ROLE|SENTRY_(AUTH|DSN)|STRIPE|SECRET|PRIVATE_KEY|API_KEY|_TOKEN$|PASSWORD|DATABASE_URL|^GH_TOKEN$|^GITHUB_TOKEN$|ANTHROPIC|OPENAI/i;
const TUR_LISTESI = new Set(['degistir', 'sonaEkle', 'ekle', 'sil']);

// ------------------------------------------------------------------ saf yardımcılar (test edilir)

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/** Yolu `/` ayraçlı ve depo köküne göreli yapar. */
function goreli(repo, dosya) {
  return path.relative(repo, path.resolve(repo, dosya)).split(path.sep).join('/');
}

/** Sabotaj hedefi olabilir mi? Dönüş: null (uygun) ya da ret nedeni. */
function hedefRedNedeni(rel, sinananTest) {
  if (!rel || rel.startsWith('../') || path.isAbsolute(rel)) return 'depo dışı yol';
  if (rel === '.git' || rel.startsWith('.git/')) return '.git hedef olamaz';
  if (rel.startsWith('node_modules/')) return 'node_modules hedef olamaz';
  if (rel === sinananTest) return 'sınanan testin kendisi hedef olamaz';
  return null;
}

/** İçerikte `bul` kaç kez geçiyor (çakışmasız)? */
function kacKez(icerik, bul) {
  if (!bul) return 0;
  let n = 0;
  let i = 0;
  while ((i = icerik.indexOf(bul, i)) !== -1) {
    n += 1;
    i += bul.length;
  }
  return n;
}

/** Satır sonlarını LF'ye indirger; özgün biçim (CRLF mi) ayrıca döner ki geri yazarken korunsun. */
function eolAyir(metin) {
  const crlf = metin.includes('\r\n');
  return { metin: crlf ? metin.replace(/\r\n/g, '\n') : metin, crlf };
}

function eolGeriVer(metin, crlf) {
  return crlf ? metin.replace(/\n/g, '\r\n') : metin;
}

/** Planı doğrular; kullanım hatalarını bir liste olarak döner (boşsa geçerli). */
function planDogrula(plan) {
  const hatalar = [];
  if (!plan || plan.surum !== 1) hatalar.push('plan.surum 1 olmalı');
  if (!plan || !Array.isArray(plan.testler) || plan.testler.length === 0) {
    hatalar.push('plan.testler boş');
    return hatalar;
  }
  const gorulen = new Set();
  plan.testler.forEach((t, i) => {
    const ad = `testler[${i}]`;
    if (!t.test || typeof t.test !== 'string') hatalar.push(`${ad}.test yok`);
    else if (gorulen.has(t.test)) hatalar.push(`${ad}.test tekrar: ${t.test}`);
    else gorulen.add(t.test);
    if (!t.korur || typeof t.korur !== 'string') hatalar.push(`${ad}.korur yok (tek cümle: neyi koruyor)`);
    if (!Array.isArray(t.sabotajlar) || t.sabotajlar.length === 0) hatalar.push(`${ad}.sabotajlar boş`);
    (t.sabotajlar || []).forEach((s, j) => {
      const sad = `${ad}.sabotajlar[${j}]`;
      if (!s.ad) hatalar.push(`${sad}.ad yok`);
      if (!Array.isArray(s.adimlar) || s.adimlar.length === 0) hatalar.push(`${sad}.adimlar boş`);
      (s.adimlar || []).forEach((a, k) => {
        const aad = `${sad}.adimlar[${k}]`;
        if (!TUR_LISTESI.has(a.tur)) hatalar.push(`${aad}.tur geçersiz: ${a.tur}`);
        if (!a.dosya) hatalar.push(`${aad}.dosya yok`);
        if (a.tur === 'degistir' && (typeof a.bul !== 'string' || a.bul === '' || typeof a.yerine !== 'string')) {
          hatalar.push(`${aad}: degistir için bul (boş olmayan) ve yerine gerekli`);
        }
        if ((a.tur === 'ekle' || a.tur === 'sonaEkle') && typeof a.icerik !== 'string') {
          hatalar.push(`${aad}: ${a.tur} için icerik gerekli`);
        }
      });
    });
  });
  return hatalar;
}

/** Vitest JSON raporundan koşuyu sınıflar. */
function vitestSinifla(rapor, cikis, zamanAsimi) {
  if (zamanAsimi) return { sonuc: 'TIMEOUT', neden: 'zaman aşımı' };
  if (!rapor) return { sonuc: 'ERROR', neden: 'vitest JSON raporu yok ya da okunamadı' };
  const toplam = rapor.numTotalTests ?? 0;
  const basarisiz = rapor.numFailedTests ?? 0;
  const suitHata = rapor.numFailedTestSuites ?? 0;
  const atlanan = (rapor.numPendingTests ?? 0) + (rapor.numTodoTests ?? 0);
  const gecen = rapor.numPassedTests ?? 0;
  const ozet = { toplam, gecen, atlanan };
  if (basarisiz > 0) {
    const olduren = [];
    for (const dosya of rapor.testResults ?? []) {
      for (const t of dosya.assertionResults ?? []) {
        if (t.status === 'failed' && olduren.length < 3) olduren.push((t.fullName || t.title || '').slice(0, 160));
      }
    }
    return { sonuc: 'KIRMIZI', olduren, ...ozet };
  }
  if (suitHata > 0) return { sonuc: 'ERROR', neden: `${suitHata} test dosyası YÜKLENEMEDİ (derleme/yükleme hatası; öldürme sayılmaz)`, ...ozet };
  if (toplam === 0) return { sonuc: 'ERROR', neden: 'hiç test koşmadı', ...ozet };
  if (gecen === 0 && atlanan > 0) return { sonuc: 'ATLANDI', neden: 'tüm testler atlandı', ...ozet };
  if (cikis === 0) return { sonuc: 'GECTI', ...ozet };
  return { sonuc: 'ERROR', neden: `çıkış kodu ${cikis} ama başarısız test yok`, ...ozet };
}

/**
 * Test kaynağını yol aramasına uygun hâle getirir: `join(KOK, '.github', 'workflows')` gibi bölünmüş
 * yol sabitlerini `.github/workflows` biçimine birleştirir, ters eğik çizgiyi düzeltir.
 */
function kaynagiNormallestir(metin) {
  return String(metin)
    .replace(/['"`]\s*,\s*['"`]/g, '/')
    .replace(/\\\\/g, '/')
    .replace(/\\/g, '/');
}

/**
 * Bir testin, sabotaj edilen dosyayı ne kadar andığının puanı: tam yol 3, ayırt edici dosya adı 2,
 * dizin 1. `rel` depo köküne göreli, `/` ayraçlıdır.
 */
function ortakPuan(normalKaynak, rel) {
  let puan = 0;
  if (normalKaynak.includes(rel)) puan += 3;
  const ad = rel.split('/').pop();
  if (ad.length >= 8 && normalKaynak.includes(ad)) puan += 2;
  const dizin = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '';
  if (dizin.length >= 8 && normalKaynak.includes(dizin)) puan += 1;
  return puan;
}

/** Bir sabotajla birlikte koşulacak ortak test adayları (en yüksek puandan, en fazla `enFazla`). */
function ortakAdaylariSec(kaynaklar, sinananTest, sabotajDosyalari, enFazla) {
  const puanlar = [];
  for (const [test, normal] of kaynaklar) {
    if (test === sinananTest) continue;
    let puan = 0;
    for (const rel of sabotajDosyalari) puan += ortakPuan(normal, rel);
    if (puan > 0) puanlar.push({ test, puan });
  }
  puanlar.sort((x, y) => y.puan - x.puan || x.test.localeCompare(y.test));
  return puanlar.slice(0, enFazla).map((p) => p.test);
}

/** Bir test için sabotaj denemelerinden hüküm çıkarır. */
function hukumVer(taban, denemeler) {
  if (taban.sonuc === 'KIRMIZI') return 'TABAN_KIRMIZI';
  if (taban.sonuc === 'ATLANDI') return 'TABAN_ATLANDI';
  if (taban.sonuc !== 'GECTI') return 'UYGULANAMADI';
  if (denemeler.some((d) => d.sonuc === 'KIRMIZI')) return 'KIRMIZI';
  if (denemeler.some((d) => d.sonuc === 'GECTI')) return 'YESIL';
  return 'UYGULANAMADI';
}

// ------------------------------------------------------------------ git / dosya işlemleri

function git(repo, args) {
  const r = cp.spawnSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  // `cikti` YALNIZ SONDAN kırpılır (ALT-38b): `git status --porcelain` satırları `XY yol` biçimindedir ve X boşluk olabilir (` M a.md`).
  // `.trim()` ilk satırın baştaki boşluğunu siliyordu (→ `M a.md`); `yanEtkiyiTemizle`deki `slice(3)` yolu bozuyordu (→ `.md`), test
  // koşusunun İZLENEN dosyada bıraktığı yan etki temizlenmiyor ve koşucu "sonrası ağaç temiz değil — DURDU" ile çıkış 2 veriyordu.
  // Öteki çağıranlar (`rev-parse` yolları, `ls-files`) baştaki boşluk taşımaz: sondaki satır sonu yine kırpılır, davranışları değişmez.
  return { kod: r.status, cikti: (r.stdout || '').trimEnd(), hata: (r.stderr || '').trim() };
}

function bagliWorktreeMi(repo) {
  const g = git(repo, ['rev-parse', '--path-format=absolute', '--git-dir']);
  const c = git(repo, ['rev-parse', '--path-format=absolute', '--git-common-dir']);
  if (g.kod !== 0 || c.kod !== 0) return false;
  return path.resolve(g.cikti) !== path.resolve(c.cikti);
}

function izleniyorMu(repo, rel) {
  return git(repo, ['ls-files', '--error-unmatch', '--', rel]).kod === 0;
}

function agacKirli(repo) {
  return git(repo, ['status', '--porcelain']).cikti.split('\n').filter(Boolean);
}

let SAHTE_EV = null;

/**
 * Alt süreçlere BOŞ bir geçici ev dizini verilir (HOME/USERPROFILE): ev dizinine yazan testler (Recep
 * sözü defteri, ayar, hafıza) gerçek dosyaya dokunamaz ve CI'daki gibi boş bir ev görür. Bu aynı
 * zamanda "ev dizinine bağlı mı" sorusunun ölçümüdür: ev ister testler TABAN_KIRMIZI verir.
 */
function sahteEv() {
  if (!SAHTE_EV) {
    SAHTE_EV = fs.mkdtempSync(path.join(os.tmpdir(), 'sabotaj-ev-'));
    process.on('exit', () => {
      try {
        fs.rmSync(SAHTE_EV, { recursive: true, force: true });
      } catch {
        /* geçici dizin; kalırsa os.tmpdir'dedir */
      }
    });
  }
  return SAHTE_EV;
}

function temizOrtam() {
  const e = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (!YASAK_ORTAM.test(k) && !/^CLAUDE/i.test(k)) e[k] = v;
  }
  const ev = sahteEv();
  e.HOME = ev;
  e.USERPROFILE = ev;
  e.FORCE_COLOR = '0';
  return e;
}

function testKos(repo, test, zamanAsimiSn) {
  const cikti = path.join(os.tmpdir(), `sabotaj-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);
  const giris = path.join(repo, 'node_modules', 'vitest', 'vitest.mjs');
  const bas = Date.now();
  const r = cp.spawnSync(
    process.execPath,
    [giris, 'run', test, '--reporter=json', `--outputFile=${cikti}`, '--maxWorkers=1', '--no-color'],
    { cwd: repo, env: temizOrtam(), encoding: 'utf8', timeout: zamanAsimiSn * 1000, maxBuffer: 64 * 1024 * 1024 },
  );
  const sureMs = Date.now() - bas;
  const zamanAsimi = r.error && r.error.code === 'ETIMEDOUT';
  let rapor = null;
  try {
    rapor = JSON.parse(fs.readFileSync(cikti, 'utf8'));
  } catch {
    rapor = null;
  }
  try {
    fs.rmSync(cikti, { force: true });
  } catch {
    /* geçici dosya; kalırsa os.tmpdir'dedir */
  }
  return { ...vitestSinifla(rapor, r.status, zamanAsimi), sureMs };
}

/** Bir sabotajın adımlarını uygular; geri alma için kayıt döner ya da hata fırlatır (HATA-CAPA). */
function sabotajUygula(repo, adimlar, sinananTest) {
  const kayitlar = [];
  try {
    for (const a of adimlar) {
      const rel = goreli(repo, a.dosya);
      const red = hedefRedNedeni(rel, sinananTest);
      if (red) throw Object.assign(new Error(`${rel}: ${red}`), { capa: true });
      const mutlak = path.join(repo, rel);
      if (a.tur === 'ekle') {
        if (fs.existsSync(mutlak)) throw Object.assign(new Error(`${rel}: ekle için dosya zaten var`), { capa: true });
        fs.mkdirSync(path.dirname(mutlak), { recursive: true });
        fs.writeFileSync(mutlak, a.icerik);
        // `git ls-files` okuyan testler (indeks) yeni dosyayı yalnız İNDEKSTE görür: sabotaj indekse de yansır,
        // geri alınırken indeksten de çıkar (aksi hâlde "dosya ekleme" sabotajı bu testlerde sessizce YEŞİL kalırdı).
        git(repo, ['add', '-f', '--', rel]);
        kayitlar.push({ tur: 'ekle', mutlak, rel, repo });
        continue;
      }
      if (!fs.existsSync(mutlak)) throw Object.assign(new Error(`${rel}: dosya yok`), { capa: true });
      if (!izleniyorMu(repo, rel)) throw Object.assign(new Error(`${rel}: git izlemiyor`), { capa: true });
      const ozgun = fs.readFileSync(mutlak);
      const ozgunSha = sha256(ozgun);
      if (a.tur === 'sil') {
        kayitlar.push({ tur: 'sil', mutlak, rel, ozgun, ozgunSha });
        fs.rmSync(mutlak);
        continue;
      }
      const { metin, crlf } = eolAyir(ozgun.toString('utf8'));
      let yeni;
      if (a.tur === 'degistir') {
        const bul = a.bul.replace(/\r\n/g, '\n');
        const adet = kacKez(metin, bul);
        if (adet !== 1) throw Object.assign(new Error(`${rel}: çapa ${adet} kez geçiyor (tam 1 olmalı)`), { capa: true });
        yeni = metin.replace(bul, () => a.yerine.replace(/\r\n/g, '\n'));
      } else {
        yeni = metin + a.icerik.replace(/\r\n/g, '\n');
      }
      kayitlar.push({ tur: 'degistir', mutlak, rel, ozgun, ozgunSha });
      fs.writeFileSync(mutlak, eolGeriVer(yeni, crlf));
    }
  } catch (e) {
    geriAl(kayitlar); // yarım kalmış sabotajı bırakma
    throw e;
  }
  return kayitlar;
}

/** Sabotajı ters sırayla geri alır; sha256 tutmazsa ihlal fırlatır. */
function geriAl(kayitlar) {
  for (const k of [...kayitlar].reverse()) {
    if (k.tur === 'ekle') {
      fs.rmSync(k.mutlak, { force: true });
      // İNDEKS de özgün hâline döner (ALT-38b): `git reset -q -- <yol>` girdiyi HEAD'dekine çevirir. Yeni dosyada HEAD'de girdi yoktur, girdi
      // kalkar; AYNI yolda `sil` + `ekle` ile yaratılmış İZLENEN dosyada HEAD girdisi GERİ GELİR. Önceki `git rm --cached` her iki durumda
      // girdiyi tümüyle silerdi: `sil` kaydı dosyayı özgün içerikle diske geri yazınca ağaç `D  x` + `?? x` kalırdı (sha doğrulaması yalnız
      // dosya baytına baktığı için bunu görmez) ve yan etki temizliği `?? x`i `git clean` ile SİLERDİ. Ağaç sabotaj başında temiz olduğundan
      // indeks == HEAD'dir; HEAD'e dönmek özgün indekse dönmektir.
      if (k.repo) git(k.repo, ['reset', '-q', '--', k.rel]);
      // Oluşturulan boş üst dizinler kalmasın (yalnız boşsa silinir).
      let d = path.dirname(k.mutlak);
      for (let i = 0; i < 4; i += 1) {
        try {
          if (fs.readdirSync(d).length === 0) fs.rmdirSync(d);
          else break;
        } catch {
          break;
        }
        d = path.dirname(d);
      }
      continue;
    }
    fs.mkdirSync(path.dirname(k.mutlak), { recursive: true });
    fs.writeFileSync(k.mutlak, k.ozgun);
    if (sha256(fs.readFileSync(k.mutlak)) !== k.ozgunSha) {
      throw Object.assign(new Error(`GERİ ALMA TUTMADI: ${k.rel}`), { ihlal: true });
    }
  }
}

/** Test koşusunun bıraktığı yan etkiyi (izlenen dosya değişimi / yeni dosya) listeler ve temizler. */
function yanEtkiyiTemizle(repo) {
  const satirlar = agacKirli(repo);
  // Porcelain satırı `XY yol`: iki durum karakteri (X boşluk olabilir) + bir boşluk, sonra yol. `slice(3)` bu yüzden HAM satırdan alınır;
  // `git()` baştaki boşluğu kırpsaydı (ALT-38b'den önceki `.trim()`) ilk satırın yolu bozulurdu. Boşluklu adlar git'te tırnaklanır.
  const yol = (s) => s.slice(3).replace(/^"|"$/g, '');
  for (const s of satirlar) {
    const rel = yol(s);
    if (s.startsWith('??')) git(repo, ['clean', '-fd', '--', rel]);
    else git(repo, ['checkout', '--', rel]);
  }
  return satirlar.map((s) => s.trim());
}

const TEST_DESENI = /\.(test|spec)\.(ts|tsx|js|cjs|mjs)$/;

/** Vitest'in koşturduğu test dosyaları ve normalleştirilmiş kaynakları (vitest.config `exclude` dışarıda). */
function testKaynaklariniOku(repo) {
  const kaynaklar = new Map();
  for (const d of git(repo, ['ls-files']).cikti.split('\n')) {
    if (!d || !TEST_DESENI.test(d)) continue;
    if (/^tests\/smoke\//.test(d) || /^tests\/e2e\/empirical_.*\.test\.ts$/.test(d)) continue;
    try {
      kaynaklar.set(d, kaynagiNormallestir(fs.readFileSync(path.join(repo, d), 'utf8')));
    } catch {
      /* okunamayan dosya aday olmaz */
    }
  }
  return kaynaklar;
}

// ------------------------------------------------------------------ ana akış

function argumanlar(argv) {
  const a = {
    repo: null,
    plan: null,
    cikti: null,
    zamanAsimi: VARSAYILAN_ZAMAN_ASIMI_SN,
    yalniz: null,
    bellekEsigiGB: 2,
    ortak: 4,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    if (k === '--repo') a.repo = path.resolve(argv[++i]);
    else if (k === '--plan') a.plan = path.resolve(argv[++i]);
    else if (k === '--cikti') a.cikti = path.resolve(argv[++i]);
    else if (k === '--zaman-asimi') a.zamanAsimi = Number(argv[++i]);
    else if (k === '--yalniz') a.yalniz = argv[++i];
    else if (k === '--bellek-esigi-gb') a.bellekEsigiGB = Number(argv[++i]);
    else if (k === '--ortak') a.ortak = Number(argv[++i]);
    else throw new Error(`bilinmeyen bayrak: ${k}`);
  }
  if (!a.repo || !a.plan || !a.cikti) throw new Error('--repo, --plan ve --cikti gerekli');
  return a;
}

function tamamlananlar(cikti) {
  const set = new Set();
  if (!fs.existsSync(cikti)) return set;
  for (const s of fs.readFileSync(cikti, 'utf8').split('\n')) {
    if (!s.trim()) continue;
    try {
      set.add(JSON.parse(s).test);
    } catch {
      /* yarım satır: yeniden koşulur */
    }
  }
  return set;
}

function main() {
  let a;
  try {
    a = argumanlar(process.argv.slice(2));
  } catch (e) {
    process.stderr.write(`[sabotaj] ${e.message}\n`);
    process.exit(1);
  }
  if (!bagliWorktreeMi(a.repo)) {
    process.stderr.write('[sabotaj] REDDEDİLDİ: yalnız BAĞLI git worktree\'de koşar (ana ağaçta asla).\n');
    process.exit(3);
  }
  if (os.freemem() / 1e9 < a.bellekEsigiGB) {
    process.stderr.write(`[sabotaj] boş bellek ${Math.round(os.freemem() / 1e8) / 10} GB < ${a.bellekEsigiGB} GB; başlamıyor.\n`);
    process.exit(4);
  }
  let plan;
  try {
    plan = JSON.parse(fs.readFileSync(a.plan, 'utf8'));
  } catch (e) {
    process.stderr.write(`[sabotaj] plan okunamadı: ${e.message}\n`);
    process.exit(1);
  }
  const hatalar = planDogrula(plan);
  if (hatalar.length) {
    process.stderr.write(`[sabotaj] plan geçersiz:\n  - ${hatalar.join('\n  - ')}\n`);
    process.exit(1);
  }
  if (agacKirli(a.repo).length) {
    process.stderr.write('[sabotaj] ağaç temiz başlamalı (git status --porcelain boş değil).\n');
    process.exit(2);
  }
  fs.mkdirSync(path.dirname(a.cikti), { recursive: true });
  const bitenler = tamamlananlar(a.cikti);
  let kaynaklar = null;

  for (const t of plan.testler) {
    if (a.yalniz && t.test !== a.yalniz) continue;
    if (bitenler.has(t.test)) continue;
    const kayit = {
      test: t.test,
      korur: t.korur,
      taban: null,
      denemeler: [],
      hukum: null,
      yanEtki: [],
      ajan: { ortam: t.ortam, kanban: t.kanban, kopya: t.kopya, not: t.not },
    };
    if (!fs.existsSync(path.join(a.repo, t.test))) {
      kayit.taban = { sonuc: 'ERROR', neden: 'test dosyası yok' };
      kayit.hukum = 'UYGULANAMADI';
      fs.appendFileSync(a.cikti, `${JSON.stringify(kayit)}\n`);
      continue;
    }
    kayit.taban = testKos(a.repo, t.test, a.zamanAsimi);
    kayit.yanEtki.push(...yanEtkiyiTemizle(a.repo));
    if (kayit.taban.sonuc === 'GECTI') {
      for (const s of t.sabotajlar) {
        let uygulanan = null;
        try {
          uygulanan = sabotajUygula(a.repo, s.adimlar, t.test);
        } catch (e) {
          if (e.ihlal) {
            process.stderr.write(`[sabotaj] ${e.message} — DURDU (ağaç kirli olabilir).\n`);
            process.exit(2);
          }
          kayit.denemeler.push({ ad: s.ad, sonuc: 'HATA-CAPA', neden: e.message });
          continue;
        }
        let sonuc;
        const ortak = [];
        try {
          sonuc = testKos(a.repo, t.test, a.zamanAsimi);
          if (sonuc.sonuc === 'KIRMIZI' && a.ortak > 0) {
            // Sabotaj hâlâ AYAKTA: sabotaj edilen dosyayı anan başka testler de kırmızı veriyor mu?
            kaynaklar = kaynaklar || testKaynaklariniOku(a.repo);
            const dosyalar = s.adimlar.map((x) => goreli(a.repo, x.dosya));
            for (const aday of ortakAdaylariSec(kaynaklar, t.test, dosyalar, a.ortak)) {
              ortak.push({ test: aday, sonuc: testKos(a.repo, aday, a.zamanAsimi).sonuc });
            }
          }
        } finally {
          try {
            geriAl(uygulanan);
          } catch (e) {
            process.stderr.write(`[sabotaj] ${e.message} — DURDU (ağaç kirli olabilir).\n`);
            process.exit(2);
          }
        }
        // Geri alındı: kırmızı veren adayın TABANDA yeşil olduğu doğrulanır (zaten kırmızıysa yakalamış sayılmaz).
        for (const o of ortak) {
          if (o.sonuc === 'KIRMIZI') o.tabanGecti = testKos(a.repo, o.test, a.zamanAsimi).sonuc === 'GECTI';
        }
        const yan = yanEtkiyiTemizle(a.repo);
        if (yan.length) kayit.yanEtki.push(...yan);
        kayit.denemeler.push({
          ad: s.ad,
          sonuc: sonuc.sonuc,
          olduren: sonuc.olduren,
          neden: sonuc.neden,
          sureMs: sonuc.sureMs,
          ortak: ortak.length ? ortak : undefined,
        });
        if (sonuc.sonuc === 'KIRMIZI') break; // yakalandı: kalan sabotajlara gerek yok
      }
    }
    kayit.yanEtki = [...new Set(kayit.yanEtki)];
    kayit.ortakAdaylari = [...new Set(kayit.denemeler.flatMap((d) => (d.ortak || []).map((o) => o.test)))];
    kayit.ortakKirmizi = [
      ...new Set(
        kayit.denemeler.flatMap((d) => (d.ortak || []).filter((o) => o.sonuc === 'KIRMIZI' && o.tabanGecti).map((o) => o.test)),
      ),
    ];
    kayit.hukum = hukumVer(kayit.taban, kayit.denemeler);
    if (agacKirli(a.repo).length) {
      process.stderr.write(`[sabotaj] ${t.test} sonrası ağaç temiz değil — DURDU.\n`);
      process.exit(2);
    }
    fs.appendFileSync(a.cikti, `${JSON.stringify(kayit)}\n`);
    process.stderr.write(`[sabotaj] ${kayit.hukum.padEnd(13)} ${t.test}\n`);
  }
}

if (require.main === module) main();

module.exports = {
  VARSAYILAN_ZAMAN_ASIMI_SN,
  agacKirli,
  bagliWorktreeMi,
  eolAyir,
  eolGeriVer,
  geriAl,
  goreli,
  hedefRedNedeni,
  hukumVer,
  kacKez,
  kaynagiNormallestir,
  ortakAdaylariSec,
  ortakPuan,
  planDogrula,
  sabotajUygula,
  vitestSinifla,
  yanEtkiyiTemizle,
};
