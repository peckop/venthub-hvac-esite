#!/usr/bin/env node
/**
 * ALT-38 · DÜNYA DURUMU TESTLERİ — PR kapısından çıkan, master push + zamanlı koşuda kalan testler.
 *
 * NEDEN: bir pull request'in KODUNDAN bağımsız kırmızı veren testler (master'ın taşınan durumu, saat,
 * yerel makine, dış sistem) suçsuz PR'ları bloklar ve yazarın düzeltemeyeceği bir şeyi bekletir.
 * Ölçüldü (2026-10-06, 07-06..10-06 CI geçmişi, `ci-gecmis.cjs`): INV-TABAN-TAZE-1 55 kırmızı koşu,
 * 39 farklı dal, 52'si "dünya olayı" kümesinde (aynı test ≥3 dalda 12 saat içinde), 11'i master push.
 * Bu testler SİLİNMEZ ve ZAYIFLAMAZ: liste (`dunya-durumu-testleri.json`) her kaydın NEDEN ve KANITını,
 * hangi yeni yerlerde koştuğunu taşır; `INV-TEST-KOSU-1` her kaydın o yerlerde GERÇEKTEN koştuğunu doğrular.
 *
 * KİPLER (`VENTHUB_DUNYA_DURUMU` ortam değişkeni; vitest.config.ts bu modülü kullanır):
 *   (boş)   TAM paket — listedeki testler DAHİL. Yerel `pnpm test`, master push ve elle koşum böyle koşar.
 *           Liste bu kipte HİÇ okunmaz ve doğrulanmaz: kapının kendisi hiçbir şeyi dışlamaz.
 *   dislan  PR listesi ∩ TABAN listesi DIŞARIDA. Yalnız `pull_request` olayında `ci` işinin Test adımı böyle koşar.
 *   yalniz  YALNIZ listedeki testler. Zamanlı iş akışı (`dunya-durumu.yml`) böyle koşar (master'dan: kendi listesi).
 *   Geçersiz değer FIRLATIR (sessizce "tam"a düşmez): yanlış yazılmış bir kip kapıyı gizlice kaldırırdı.
 *
 * GÜVEN SINIRI (ALT-38a güvenlik incelemesi, bulgu B3, orta): dışlama listesi PR'ın KENDİ dosyasından ve doğrulanmadan
 * okunuyordu. Bir PR listeye kendi kırmızı testini ve bu mekanizmayı koruyan `test-kosu-kapsami.test.ts`'i ekleyip `ci`'ı
 * yeşile çevirebilirdi (kapıyı koruyan test de dışarıda kalır, kimse kırmızı görmez). Düzeltme üç parça, hepsi gerekli:
 *   1. `dislan` ve `yalniz` önce `dogrula` çalıştırır; liste geçersizse FIRLATIR (vitest başlamaz: kırmızı, fail-closed).
 *   2. `dislan` yalnız TABANDA da yazılı kayıtları dışlar. TABAN = birleştirme commit'inin ilk ebeveyni (`HEAD^1`, yani base
 *      dalı: master'a zaten girmiş, yani incelenmiş liste). PR'ın listeye yeni eklediği kayıt kendi PR'ında DIŞLANMAZ,
 *      birleşince sonraki PR'larda etkili olur: inceleme geçmeden hiçbir test PR kapısından çıkamaz. Taban okunamazsa
 *      hiçbir şey dışlanmaz ve `uyari` döner (TAM paket koşar: güvenli taraf, sessiz değil).
 *   3. Mekanizmanın KENDİ koruyucu testleri (`DISLANAMAZ`) listeye hiç giremez: kapıyı koruyan test kapıdan çıkarılamaz.
 *
 * YOL SÜZGECİ (ALT-38i, OPS hükmü 2026-10-09): bir kayıt `yolFiltresi` taşıyabilir (dizin öneki `a/b/` ya da tam dosya yolu; glob YASAK). Süzgeçli
 * test PR kapısından YALNIZ PR'ın değişen dosyalarından HİÇBİRİ süzgece uymuyorsa çıkar; biri uyarsa PR kapısında KOŞAR (testin girdisine dokunan PR
 * onun korumasını kaybetmez). Üç sertlik, hepsi B3'ün devamıdır:
 *   1. Süzgeç PR'ın kaydından DEĞİL, TABAN kaydından okunur: PR kendi kaydına süzgeç yazıp/değiştirip kendi dışlamasını genişletemez.
 *   2. Değişen dosyalar okunamazsa (git yok, `HEAD^1` yok, dosya bozuk) süzgeçli test DIŞLANMAZ ve `uyari` döner (güvenli taraf: koşar).
 *   3. Tabandaki süzgeç geçersizse (dizi değil, boş, glob, kanonik olmayan yol) o test DIŞLANMAZ.
 *   Süzgeçsiz kayıt eskisi gibi her PR'da dışlanır. `yalniz` kipinde süzgeç YOKTUR: zamanlı koşu listenin tamamını koşar.
 *
 * Kullanım (kütüphane): const { ayar } = require('./scripts/ci/dunya-durumu.cjs');
 * Kullanım (komut):     node scripts/ci/dunya-durumu.cjs [--kip dislan|yalniz|tam] [--json]
 *   Taban listesini elle vermek (yerel kullanım): VENTHUB_DUNYA_TABAN_LISTESI=<dosya yolu> (boşsa git HEAD^1'den okunur).
 *   Değişen dosyaları elle vermek (yerel kullanım ve testler): VENTHUB_DUNYA_DEGISEN_DOSYALAR=<dosya yolu; NUL ya da satır ayraçlı>
 *   (boşsa `git diff --name-only -z --no-renames HEAD^1 HEAD`; doluyken okunamıyorsa git'e DÜŞÜLMEZ, süzgeçli testler dışlanmaz).
 */
'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const KOK = path.resolve(__dirname, '..', '..');
const LISTE_YOLU = 'scripts/ci/dunya-durumu-testleri.json';
const ORTAM_ADI = 'VENTHUB_DUNYA_DURUMU';
/** TABAN listesinin DOSYA YOLU (yerel kullanım ve testler); boşsa taban `git show HEAD^1:<LISTE_YOLU>`dan okunur. */
const TABAN_LISTE_ORTAM = 'VENTHUB_DUNYA_TABAN_LISTESI';
/** PR'ın DEĞİŞEN dosyalarının DOSYA YOLU (yerel kullanım ve testler); boşsa `git diff HEAD^1 HEAD` (süzgeçli kayıtlar için). */
const DEGISEN_ORTAM = 'VENTHUB_DUNYA_DEGISEN_DOSYALAR';
const DEGISEN_GIT_ARGUMANLARI = Object.freeze(['diff', '--name-only', '-z', '--no-renames', 'HEAD^1', 'HEAD']);
const KIPLER = ['dislan', 'yalniz'];
const YENI_YERLER = ['master-push', 'zamanli'];
const TEST_DESENI = /\.(test|spec)\.(ts|tsx|js|cjs|mjs)$/;
/**
 * Dışlama mekanizmasının KENDİ koruyucuları: bunlar PR kapısından ÇIKARILAMAZ (`dogrula` listede görürse hata verir).
 * NİÇİN: kapıyı koruyan test kapıdan çıkarsa, mekanizmayı bozan bir PR'ı hiçbir kırmızı yakalayamaz (B3). Her biri bir halkayı tutar:
 *   edited-ayna.test.ts        `edited` aynasının karar mantığı (düzenleme kırmızıyı yeşile çeviremez),
 *   dunya-durumu.test.ts       bu modülün kendi birim testi (kesişim, doğrulama, taban okuma, DISLANAMAZ),
 *   ci-edited-ayna.test.ts     ci.yml ile ayna adımının bağı,
 *   test-kosu-kapsami.test.ts  INV-TEST-KOSU-1: liste ↔ iş akışları ↔ vitest.config.ts bağı,
 *   dunya-durumu-satiri.test.ts  zamanlı koşunun kırmızısını her mesajda gösteren kanca satırı,
 *   degisiklik-sinifi.test.ts  (ALT-38c) sınıflayıcının karar tablosu: yanlış yön HEP `tam`,
 *   ci-degisiklik-sinifi.test.ts (ALT-38c) INV-CI-SINIF-1/2: sınıfın iş akışlarına bağı ve "siteye dokunmayan" tanımının ölçümü.
 */
const DISLANAMAZ = Object.freeze([
  'scripts/ci/__tests__/edited-ayna.test.ts',
  'scripts/ci/__tests__/dunya-durumu.test.ts',
  'scripts/ci/__tests__/degisiklik-sinifi.test.ts',
  'src/__tests__/conformance/ci-edited-ayna.test.ts',
  'src/__tests__/conformance/test-kosu-kapsami.test.ts',
  'src/__tests__/conformance/dunya-durumu-satiri.test.ts',
  'src/__tests__/conformance/ci-degisiklik-sinifi.test.ts',
]);

function listeyiOku(kok = KOK) {
  return JSON.parse(fs.readFileSync(path.join(kok, LISTE_YOLU), 'utf8'));
}

/**
 * Bir yolun "özü": vitest `exclude`/`include` bu yazımları AYNI dosyaya eşler (ölçüldü 2026-10-06: `./x`, `a//x`, `a/./x`, `a/../x`
 * dosyayı dışlıyor). Yalın metin eşitliği ile DISLANAMAZ/taban karşılaştırması bu takma yazımlarla aşılırdı.
 */
function yolOzu(yol) {
  return path.posix.normalize(yol.replace(/\\/g, '/'));
}

/** Kanonik yol: kökten göreli, POSIX, `./` `//` `/./` `..` `\` içermez. Liste yalnız bu yazımı taşır, karşılaştırmalar böylece eşitlik olur. */
function kanonikYolMu(yol) {
  return yol === yolOzu(yol) && !yol.startsWith('/') && !yol.startsWith('../') && yol !== '..';
}

/**
 * `yolFiltresi` hataları (boş = geçerli). Girdi: dizin öneki `a/b/` (sondaki `/` zorunlu) ya da tam dosya yolu; glob YASAK, kanonik yazım şart,
 * tekrar yok. `dosyaVarMi(yol, dizinMi)` yetim süzgeç yolunu yakalar (silinen/taşınan dizin süzgeci sessizce hiç eşleşmez ve test PR kapısından HEP çıkardı)
 * ve TÜRÜ de denetler: sondaki `/` varsa yol bir DİZİN, yoksa bir DOSYA olmalı (dizin `/`sız yazılırsa tam eşitlik hiçbir dosyayla eşleşmez, aynı sessiz çıkış).
 */
function yolFiltresiHatalari(filtre, dosyaVarMi) {
  if (!Array.isArray(filtre) || filtre.length === 0) return ['yolFiltresi en az bir yol taşıyan dizi olmalı (süzgeç istenmiyorsa alan HİÇ yazılmaz)'];
  const hatalar = [];
  const gorulen = new Set();
  for (const g of filtre) {
    if (typeof g !== 'string' || g === '') {
      hatalar.push('yolFiltresi öğesi boş olmayan metin olmalı');
      continue;
    }
    const govde = g.endsWith('/') ? g.slice(0, -1) : g;
    if (g.includes('*')) hatalar.push(`yolFiltresi "${g}": glob YASAK (dizin öneki "a/b/" ya da tam dosya yolu)`);
    else if (govde === '' || govde === '.' || govde.endsWith('/') || !kanonikYolMu(govde)) hatalar.push(`yolFiltresi "${g}": yol kanonik değil (köke göreli, "./" "//" ".." "\\" içermeyen yazım şart)`);
    else if (gorulen.has(g)) hatalar.push(`yolFiltresi "${g}": tekrar`);
    else if (!dosyaVarMi(govde, g.endsWith('/'))) {
      hatalar.push(`yolFiltresi "${g}": yol yok ya da türü uyuşmuyor ("a/b/" bir dizin, "a/b" bir dosya olmalı; yetim süzgeç hiç eşleşmez ve test PR kapısından HEP çıkar)`);
    }
    gorulen.add(g);
  }
  return hatalar;
}

/** Süzgeç öğesi bu yolu kapsıyor mu: `a/b/` dizin önekidir (`a/bc` uymaz), diğerleri tam eşitlik. Yol önce kanonik özüne indirilir (`./x`, `a//x`). */
function filtreEslesirMi(filtre, yol) {
  const o = yolOzu(String(yol));
  return filtre.some((g) => (g.endsWith('/') ? o.startsWith(g) : o === g));
}

/**
 * Varsayılan dosya-varlık denetimi. `dizinMi` verilmezse (test yolu) yalnız VAR mı diye bakar; verilirse (süzgeç yolu) türü de eşleşmeli:
 * true ise dizin, false ise dosya. Okunamayan yol "yok" sayılır (fail-closed: süzgeç doğrulanamadıysa liste geçersizdir).
 */
function varsayilanDosyaVarMi(yol, dizinMi) {
  try {
    const st = fs.statSync(path.join(KOK, yol));
    if (dizinMi === undefined) return true;
    return dizinMi ? st.isDirectory() : st.isFile();
  } catch {
    return false;
  }
}

/** Listeyi doğrular; hataları metin listesi olarak döner (boş = geçerli). `dosyaVarMi(yol, dizinMi?)` test için enjekte edilir. */
function dogrula(liste, dosyaVarMi = varsayilanDosyaVarMi) {
  const hatalar = [];
  if (!liste || liste.surum !== 1) hatalar.push('surum 1 olmalı');
  if (!liste || !Array.isArray(liste.testler)) {
    hatalar.push('testler dizi olmalı');
    return hatalar;
  }
  const gorulen = new Set();
  liste.testler.forEach((t, i) => {
    const ad = `testler[${i}]${t && t.test ? ` (${t.test})` : ''}`;
    if (!t || typeof t.test !== 'string' || !TEST_DESENI.test(t.test)) {
      hatalar.push(`${ad}: test yolu bir test dosyası olmalı`);
      return;
    }
    if (t.test.includes('*')) hatalar.push(`${ad}: glob YASAK (liste tek tek dosya yolu taşır, kapsam sessizce genişlemesin)`);
    if (!kanonikYolMu(t.test)) {
      hatalar.push(`${ad}: yol kanonik değil (köke göreli, "./" "//" "/./" ".." ve "\\" içermeyen yazım şart: vitest bu yazımları aynı dosyaya eşler, takma yazım DISLANAMAZ ve taban kesişimini atlatırdı)`);
    }
    if (gorulen.has(t.test)) hatalar.push(`${ad}: tekrar`);
    gorulen.add(t.test);
    if (DISLANAMAZ.includes(yolOzu(t.test))) hatalar.push(`${ad}: bu test dışlama mekanizmasının KENDİ koruyucusu, PR kapısından çıkarılamaz`);
    if (!dosyaVarMi(t.test)) hatalar.push(`${ad}: dosya yok (listede yetim kayıt)`);
    for (const alan of ['neden', 'kanit']) {
      if (typeof t[alan] !== 'string' || t[alan].trim().length < 20) hatalar.push(`${ad}: ${alan} en az 20 karakterlik gerekçe taşımalı`);
    }
    if (!Array.isArray(t.yeniYer) || t.yeniYer.length === 0) hatalar.push(`${ad}: yeniYer boş (çıkan kapının yeni yeri yazılı olmalı)`);
    else for (const y of t.yeniYer) if (!YENI_YERLER.includes(y)) hatalar.push(`${ad}: yeniYer "${y}" geçersiz (${YENI_YERLER.join(' | ')})`);
    if (Array.isArray(t.yeniYer) && !t.yeniYer.includes('zamanli')) {
      hatalar.push(`${ad}: yeniYer "zamanli" içermeli (master push koşuları concurrency ile iptal edilir; zamanlı koşu asıl güvencedir)`);
    }
    if (t.yolFiltresi !== undefined) for (const h of yolFiltresiHatalari(t.yolFiltresi, dosyaVarMi)) hatalar.push(`${ad}: ${h}`);
  });
  return hatalar;
}

/** Taban listesinin şekli: `surum` 1, `testler` dizi, her öğe `test` metni taşır. Bozuk taban = taban YOK (güvenli taraf: hiçbir şey dışlanmaz). */
function tabanSekliGecerliMi(taban) {
  return (
    Boolean(taban) &&
    typeof taban === 'object' &&
    taban.surum === 1 &&
    Array.isArray(taban.testler) &&
    taban.testler.every((k) => Boolean(k) && typeof k.test === 'string')
  );
}

/**
 * TABAN listesi: PR'ın dışlama isteğini sınırlayan, PR'dan ÖNCE var olan (master'a girmiş, incelenmiş) liste.
 *   (a) `VENTHUB_DUNYA_TABAN_LISTESI` doluysa o DOSYA YOLU okunur (yerel kullanım ve testler),
 *   (b) değilse `git show HEAD^1:<LISTE_YOLU>`: `pull_request` olayında `actions/checkout` birleştirme commit'ini (`refs/pull/N/merge`)
 *       çıkarır ve ilk ebeveyni base dalıdır (PR'ın kendi commit'i DEĞİL; `HEAD` yazılırsa taban PR'ın kendi listesi olur ve düzeltme boşa düşer).
 *       Kabuk YOK (`execFileSync`): yol argüman dizisinde, kabuk yorumlamaz.
 * HER başarısızlık (git yok, ref yok, dosya tabanda yok, JSON bozuk, dosya okunamadı, şekil bozuk) FIRLATMAZ: null döner, çağıran
 * hiçbir şey dışlamaz. (a) doluyken okunamıyorsa (b)'ye DÜŞÜLMEZ: istenen kaynak okunamadıysa başka kaynak sessizce yerini almaz.
 * Taban dosya-varlık denetimine TABİ DEĞİL (PR'da silinmiş test tabanda yazılı olabilir); yalnız şekli denetlenir.
 */
function tabanListesiniOku(env = process.env, kok = KOK, execFn = childProcess.execFileSync) {
  try {
    const yol = env[TABAN_LISTE_ORTAM];
    const metin = yol
      ? fs.readFileSync(yol, 'utf8')
      : execFn('git', ['show', `HEAD^1:${LISTE_YOLU}`], {
          cwd: kok,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'ignore'],
          maxBuffer: 1048576,
          timeout: 10000,
        });
    const taban = JSON.parse(String(metin));
    return tabanSekliGecerliMi(taban) ? taban : null;
  } catch {
    return null;
  }
}

/**
 * PR'ın DEĞİŞEN dosyaları (yalnız süzgeçli kayıtlar için sorulur). Kaynak tabanla aynı kural:
 *   (a) `VENTHUB_DUNYA_DEGISEN_DOSYALAR` doluysa o DOSYA YOLU (NUL ya da satır ayraçlı; boş dosya = değişiklik yok),
 *   (b) değilse `git diff --name-only -z --no-renames HEAD^1 HEAD` (birleştirme commit'inin ilk ebeveynine göre; kabuk YOK).
 * Her yol kanonik özüne indirilir. HER başarısızlık (git yok, `HEAD^1` yok, kesilmiş çıktı, okunamayan dosya, `..`/mutlak yol) FIRLATMAZ: null döner
 * ve çağıran süzgeçli testi DIŞLAMAZ. (a) doluyken okunamıyorsa (b)'ye DÜŞÜLMEZ.
 */
function degisenYollariniOku(env = process.env, kok = KOK, execFn = childProcess.execFileSync) {
  try {
    const yol = env[DEGISEN_ORTAM];
    const metin = String(
      yol
        ? fs.readFileSync(yol, 'utf8')
        : execFn('git', [...DEGISEN_GIT_ARGUMANLARI], {
            cwd: kok,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 16 * 1024 * 1024,
            timeout: 10000,
          }),
    );
    let ham;
    if (metin === '') ham = [];
    else if (metin.includes('\0')) {
      if (!metin.endsWith('\0')) return null; // kesilmiş çıktı
      ham = metin.slice(0, -1).split('\0');
    } else if (yol) ham = metin.split('\n').map((s) => s.replace(/\r$/, '')).filter((s) => s !== '');
    else return null; // `git -z` çıktısı NUL ile biter; NUL'suz dolu çıktı kesilmiş ya da `-z` düşmüş demektir
    const cikti = [];
    for (const p of ham) {
      if (typeof p !== 'string' || p === '') return null;
      const o = yolOzu(p);
      if (o === '' || o === '.' || o === '..' || o.startsWith('/') || o.startsWith('../') || /^[A-Za-z]:/.test(o)) return null;
      cikti.push(o);
    }
    return cikti;
  } catch {
    return null;
  }
}

/** Değişen dosyalar okunamayınca verilen uyarı (kaynağı söyler). */
function degisenUyarisi(env) {
  const yol = env[DEGISEN_ORTAM];
  const kaynak = yol
    ? `${DEGISEN_ORTAM}=${JSON.stringify(yol)}`
    : `git diff HEAD^1 HEAD; pull_request birleştirme commit'i ve fetch-depth >= 2 gerekir`;
  return `değişen dosyalar okunamadı (${kaynak}): yol süzgeçli testler DIŞLANMADI, PR kapısında koşar (güvenli taraf)`;
}

/** Taban okunamayınca verilen uyarı: HANGİ kaynağın okunamadığını söyler (ortam değişkeni mi, git mi). */
function tabanUyarisi(env) {
  const yol = env[TABAN_LISTE_ORTAM];
  const kaynak = yol
    ? `${TABAN_LISTE_ORTAM}=${JSON.stringify(yol)}`
    : `git show HEAD^1:${LISTE_YOLU}; pull_request birleştirme commit'i ve fetch-depth >= 2 gerekir`;
  return `taban listesi okunamadı ya da geçersiz (${kaynak}): hiçbir test dışlanmadı, TAM paket koşar (güvenli taraf)`;
}

/**
 * Ortam değişkenine göre vitest'e verilecek ayar. Geçersiz kip ve (dislan/yalniz'da) geçersiz liste FIRLATIR.
 *   liste    PR'ın (çalışma ağacının) listesi. Verilmezse YALNIZ gerektiğinde okunur: `tam` kipinde HİÇ okunmaz ve doğrulanmaz.
 *   secenek  test için enjeksiyon: `tabanOku` (parametresiz; ayrıştırılmış taban listesi ya da null döner), `dosyaVarMi` (dogrula'ya geçer),
 *            `degisenOku` (parametresiz; kanonik değişen yollar dizisi ya da null; yalnız süzgeçli kayıt varsa ve TAM BİR kez çağrılır).
 * Dönüş: { kip, exclude, include } (+ `uyari`: `dislan`da taban okunamadıysa (exclude boştur) ya da süzgeçli kayıt için değişen dosyalar okunamadıysa;
 *   + `suzgeceTakilan`: yalnız `dislan`da, süzgeci PR'ın dosyalarına uyduğu için PR kapısında KALAN taban kayıtları; boşsa anahtar hiç yazılmaz).
 */
function ayar(env = process.env, liste, secenek = {}) {
  const kip = env[ORTAM_ADI] || '';
  if (kip === '' || kip === 'tam') return { kip: 'tam', exclude: [], include: null };
  if (!KIPLER.includes(kip)) {
    throw new Error(`${ORTAM_ADI}="${kip}" geçersiz (boş | tam | ${KIPLER.join(' | ')}); kapı sessizce kalkmasın diye durduruldu`);
  }
  let pr = liste;
  if (pr === undefined) {
    try {
      pr = listeyiOku();
    } catch (e) {
      throw new Error(`${LISTE_YOLU} okunamadı ya da JSON değil: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const hatalar = dogrula(pr, secenek.dosyaVarMi);
  if (hatalar.length) {
    throw new Error(`${LISTE_YOLU} GEÇERSİZ (${hatalar.length} hata): ${hatalar.slice(0, 5).join(' | ')}`);
  }
  const yollar = pr.testler.map((t) => t.test);
  if (kip === 'yalniz') return { kip, exclude: [], include: yollar };
  const taban = (secenek.tabanOku || (() => tabanListesiniOku(env)))();
  if (!taban) return { kip, exclude: [], include: null, uyari: tabanUyarisi(env) };
  // Süzgeç PR'ın kaydından DEĞİL tabandan okunur (PR kendi dışlamasını genişletemez); süzgeçsiz kayıt her PR'da dışlanır.
  const tabanKaydi = new Map(taban.testler.map((t) => [t.test, t]));
  let degisen;
  let degisenSorulduMu = false;
  const degisenAl = () => {
    if (!degisenSorulduMu) {
      degisenSorulduMu = true;
      try {
        degisen = (secenek.degisenOku || (() => degisenYollariniOku(env)))();
      } catch {
        degisen = null; // okuyucu fırlatırsa da güvenli taraf: süzgeçli test dışlanmaz (degisenYollariniOku zaten fırlatmaz; bu, ileride bozulursa kapıyı açık bırakmaz)
      }
    }
    return degisen;
  };
  const dislanan = [];
  const takilan = [];
  let degisenUyari = null;
  for (const y of yollar) {
    const k = tabanKaydi.get(y);
    if (!k) continue;
    if (k.yolFiltresi === undefined) {
      dislanan.push(y);
    } else if (yolFiltresiHatalari(k.yolFiltresi, () => true).length > 0) {
      takilan.push(y); // tabandaki süzgeç geçersiz: koşar
    } else {
      const d = degisenAl();
      if (!Array.isArray(d)) {
        takilan.push(y);
        degisenUyari = degisenUyarisi(env);
      } else if (d.some((yol) => filtreEslesirMi(k.yolFiltresi, yol))) takilan.push(y);
      else dislanan.push(y);
    }
  }
  const sonuc = { kip, exclude: dislanan, include: null };
  if (takilan.length > 0) sonuc.suzgeceTakilan = takilan;
  if (degisenUyari) sonuc.uyari = degisenUyari;
  return sonuc;
}

module.exports = {
  KOK,
  LISTE_YOLU,
  ORTAM_ADI,
  TABAN_LISTE_ORTAM,
  DEGISEN_ORTAM,
  KIPLER,
  YENI_YERLER,
  TEST_DESENI,
  DISLANAMAZ,
  ayar,
  dogrula,
  listeyiOku,
  tabanListesiniOku,
  degisenYollariniOku,
  filtreEslesirMi,
};

/** Komut satırı. Çıkış kodunu DÖNER; `process.exit` yerine `process.exitCode` kullanılır ki stderr yazımı yarıda kesilmesin. */
function komutSatiri(argv, ortam) {
  const i = argv.indexOf('--kip');
  // `--kip` ortamın GERİ KALANINI silmez: taban listesi değişkeni (`VENTHUB_DUNYA_TABAN_LISTESI`) de bu yoldan geçer.
  const env = i > -1 ? { ...ortam, [ORTAM_ADI]: argv[i + 1] } : ortam;
  try {
    const liste = listeyiOku();
    const hatalar = dogrula(liste);
    if (hatalar.length) {
      process.stderr.write(`[dunya-durumu] liste GEÇERSİZ:\n  - ${hatalar.join('\n  - ')}\n`);
      return 1;
    }
    const r = ayar(env, liste);
    if (r.uyari) process.stderr.write(`[dunya-durumu] ${r.uyari}\n`);
    if (argv.includes('--json')) process.stdout.write(`${JSON.stringify(r, null, 1)}\n`);
    else {
      const takilan = r.suzgeceTakilan ? ` suzgece-takilan=${r.suzgeceTakilan.length}` : '';
      process.stdout.write(`kip=${r.kip} dışarıda=${r.exclude.length} yalnız=${r.include ? r.include.length : '-'}${takilan}\n`);
    }
    return 0;
  } catch (e) {
    process.stderr.write(`[dunya-durumu] ${e instanceof Error ? e.message : String(e)}\n`);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = komutSatiri(process.argv.slice(2), process.env);
}
