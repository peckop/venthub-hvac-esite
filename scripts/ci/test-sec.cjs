#!/usr/bin/env node
/**
 * ALT-38d · TEST SEÇİCİ — PR'da TÜM paket yerine YALNIZ değişenle ilgili testleri koşturur (karar 308, B2).
 *
 * TEK DEĞİŞMEZ: yanlış yön HEP `tam`dır (tam = vitest'in listelediği HER test koşar). Seçici bir testi yanlışlıkla elerse o testin
 * koruduğu kural SESSİZCE kırılır ve kimse kırmızı görmez; fazladan test seçmenin bedeli ise yalnız dakikadır.
 * Bu yüzden şüphe, hata, bilinmeyen, hesaplanamayan her durum `tam` döner; `sec` ASLA fırlatmaz.
 *
 * KARAR (bir değişen dosya `y` için):
 *   1. KÜRESEL dosya (kilit, paket, yapılandırma, iş akışı, vitest/playwright yapılandırması, test kurulum dosyaları, `scripts/ci/`,
 *      migration'lar, haritanın "kurulum evresinde okunan" yolları) → `tam`.
 *   2. Haritanın BİLMEDİĞİ kök ad (yeni üst dizin / kök dosya) → `tam` (sınıflanamayan).
 *   3. Silinmiş/taşınmış KOD dosyası → `tam` (içe aktaran test, dosya yokken `vitest related` grafiğinde görünmez).
 *   4. Değişen TEST dosyası → o dosya seçilir.
 *   5. `vitest related` (içe aktarma grafiği; yalnız içe aktarılabilir dosya değiştiyse hesaplanır) ∪
 *   6. HARİTA eşleşmesi: testin KOŞARKEN okuduğu dosya/dizin (ölçüm: test-haritasi-kaydedici.cjs) ya da `import.meta.glob` deseni
 *      değişen yolu kapsıyorsa. Neden ikisi birden: `related` vite'ın `?raw` / `import.meta.glob` okumalarını GÖRMEZ (78 test),
 *      harita ise içe aktarma grafiğini görmez; biri diğerinin kör noktasını kapatır.
 *   7. HER ZAMAN koşanlar: haritada kaydı OLMAYAN test (yeni test atlanamaz), kaydı bayat olan test (kaynağı ölçümden sonra değişmiş),
 *      `belirsiz` işaretli test (izlenemeyen alt süreç, ölçümde atlanan/kırmızı olan test, çıkarılamayan desen).
 *
 * `tam` sonucunda `secilen` de TÜM test dosyalarıdır: `tam` bayrağını okumayı unutan bir tüketici bile hepsini koşturur (boş liste
 * "hiçbir şey koşma" demek olurdu; o yön asla varsayılan olmamalı).
 *
 * Kullanım (kütüphane): const { sec } = require('./scripts/ci/test-sec.cjs');
 * Kullanım (komut):     node scripts/ci/test-sec.cjs [--kok <dizin>] [--harita scripts/ci/test-haritasi.json] [--cikti secilen.txt]
 *                       [--degisen-dosya yollar.txt] [--test-listesi liste.json] [--vitestsiz] [--json]
 *   --kok        depo kökü (varsayılan: betiğin iki üstü). vitest, test kaynakları, sınıflayıcı ve git çalışma dizini BU köke bağlanır:
 *                betik tabandan RUNNER_TEMP'e çıkarılıp koşturulabilir (`--kok "$GITHUB_WORKSPACE" --harita "$RUNNER_TEMP/test-haritasi.json"`).
 *   --vitestsiz  vitest AÇMAZ (kurulumdan önce koşar): test listesi `git ls-files` ile (vitest listesinin ÜST KÜMESİ: dağıtıcı kendi
 *                `vitest list`iyle kesiştirmeli). İçe aktarılabilir dosya değiştiyse karar vitest ister: `tam=true` + "vitest gerekli" nedeni;
 *                kurulumdan sonra bu bayraksız yeniden koşulur. Yalnız md/csv/sql/yaml gibi dosyalar değiştiyse seçimi kendisi verir.
 *   --yerel      YEREL kullanım (`pnpm test:ilgili`): değişen dosyalar tabana (`--taban`, varsayılan origin/master, yoksa master) göre git'ten
 *                alınır (kayıtlı + kaydedilmemiş izlenen dosyalar + izlenmeyen yeni dosyalar), seçilen testler vitest ile koşar. TAM'a
 *                düşerse `TAM: <sebep>` yazılır ve HİÇBİR test koşmaz (yerelde tam paket yok; CI koşar). `--kuru` yalnız seçimi listeler.
 *                Çıkış kodu = seçilen testleri koşturan vitest'in çıkış kodu.
 *   Değişen dosyalar varsayılan olarak `git diff -z --name-only --no-renames HEAD^1 HEAD`ten (PR'ın birleştirme commit'i) okunur.
 *   Çıkış kodu DAİMA 0'dır; hata `tam` olarak yazılır. `$GITHUB_OUTPUT` varsa `tam=`, `secilen-sayisi=`, `toplam=`, `neden=` eklenir.
 *   `--cikti` dosyası satır başına bir test yoludur (`tam` ise TÜM testler); tam ve liste YOKSA (git/harita hatası) dosya yazılmaz, eskisi silinir:
 *   tüketici önce `tam` çıktısına bakmalı. Aynı girdi → aynı sıralı çıktı (değişen dosya ve test listesi SIRASI fark etmez).
 *
 * BAĞLAMA ŞARTLARI (ci.yml / test-shard için; bu betik bunları DOĞRULAYAMAZ, bu yüzden burada yazılı):
 *   1. Yalnız `pull_request` olayında, varsayılan (birleştirme commit'i) checkout'ta, `fetch-depth` >= 2 ile. Push ve elle koşumda
 *      seçim YOK SAYILIR (tam koşu).
 *   2. Betik ve harita PR'ın KENDİ kopyasından değil TABANDAN (`git show HEAD^1:scripts/ci/test-sec.cjs`) çıkarılıp koşturulur
 *      (degisiklik-sinifi.cjs / edited-ayna.cjs ile aynı güven sınırı). PR bunlara dokunuyorsa zaten `scripts/ci/` küreseldir: `tam`.
 *   3. Seçim yalnız DARALTIR: çıktı yoksa/okunamazsa HER ŞEY koşar.
 *
 * DÜRÜSTÇE ELE ALINMAYAN SINIRLAR:
 *   1. Harita bir ÖLÇÜMDÜR: ölçüm koşusunda çalışmayan bir kol (platforma/ortama bağlı atlanan test, koşullu okuma) eksik kalabilir.
 *      Kapatan: atlanan test `belirsiz` sayılır; master push TAM koşar; haritanın gece yenilenmesi önerilir (cetvel §6).
 *   2. Test dosyasının DOLAYLI bağımlılığı (içe aktardığı yardımcı modülün sonradan başka dosya okuması) test kaynağının özetini
 *      değiştirmez; `related` o PR'da testi seçer ama harita yenilenene dek SONRAKİ PR'lar yeni okumayı görmez. Master push TAM koşar.
 *   3. Yalnız YOL bakılır; içerik, dosya modu ve sembolik bağ değil.
 */
'use strict';

const childProcess = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const nodeModule = require('node:module');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const HARITA_SURUMU = 1;
/** Bu sayıya ULAŞAN ya da AŞAN değişiklik listesi `tam`dır (kaba bir PR değil; degisiklik-sinifi.cjs ile aynı sınır). */
const DOSYA_SINIRI = 2000;
const EN_UZUN_YOL = 1024;
const NEDEN_AZAMI = 300;
const GIT_CIKTI_AZAMI = 16 * 1024 * 1024;
const GIT_ZAMAN_ASIMI_MS = 30000;
const GIT_ARGUMANLARI = Object.freeze(['diff', '--name-only', '-z', '--no-renames', 'HEAD^1', 'HEAD']);
const TEST_DESENI = /\.(?:test|spec)\.[cm]?[jt]sx?$/;
/** Ölçüm aracı: bunlardan biri değişirse haritadaki ölçümler artık geçerli sayılmaz (harita bayat → `tam`). */
const ARAC_DOSYALARI = Object.freeze([
  'scripts/ci/test-haritasi-kaydedici.cjs',
  'scripts/ci/test-haritasi-kurulum.ts',
  'scripts/ci/test-haritasi-kurulum-son.ts',
  'scripts/ci/test-haritasi.vitest.config.ts',
]);

/**
 * KÜRESEL girdiler (değişirse `tam`). Yazım biçimleri degisiklik-sinifi.cjs ile BİREBİR aynı:
 *   `dizin/`   dizin öneki (`/` sınırında), `ad` kökteki tam dosya, `a*b` kökteki ad deseni (en çok bir `*`), `dizin/ad` tam yol.
 * Kök yazımlar YALNIZ kökte eşleşir (`docs/package.json` küresel değildir).
 */
const KURESEL_GIRDILER = Object.freeze([
  '.github/',
  '.githooks/',
  'scripts/ci/',
  'supabase/migrations/',
  'scripts/assert-node-major.mjs',
  'scripts/setup-hooks.mjs',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  '.npmrc',
  '.nvmrc',
  '.node-version',
  '.gitignore',
  '.gitattributes',
  'tsconfig*.json',
  'vitest*',
  'playwright*',
  'next.config.*',
  'eslint.config.*',
  '.eslintrc*',
  'tailwind.config.*',
  'postcss.config.*',
  'knip.*',
  'middleware.*',
]);
/** Sınıflayıcının (degisiklik-sinifi.cjs) `HER_ZAMAN_TAM` listesinden YENİDEN KULLANILMAYAN girdiler: bunlar daraltılmak İSTENEN yüzeylerdir. */
const SINIFLAYICIDAN_ALINMAYAN = Object.freeze(['src/', 'public/']);
/** İçe aktarılabilir uzantılar: bunlardan biri değiştiyse `vitest related` (içe aktarma grafiği) hesaplanır. Belge/CSV/SQL için HESAPLANMAZ. */
const ICE_AKTARILABILIR = /\.(?:[cm]?[jt]sx?|json|css|scss|sass|less|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|glb|gltf|hdr|wasm|html)$/i;
/** Silinince içe aktaran testi kırabilen kod yüzeyleri. */
const KOD_YUZEYLERI = Object.freeze(['src/', 'scripts/', 'supabase/functions/', 'tools/', 'tests/', 'e2e/']);

/** Hata nesnesinden mesaj: nesnenin KENDİSİ okunurken de fırlayabilir, bu işlev asla fırlatmaz. */
function hataMetni(e) {
  try {
    if (typeof e === 'string') return e;
    if (e && typeof e.message === 'string') return e.message;
  } catch {
    /* okunamayan hata nesnesi */
  }
  return 'bilinmeyen hata';
}

function kontrolKodu(k) {
  return k < 0x20 || (k >= 0x7f && k <= 0x9f) || k === 0x2028 || k === 0x2029;
}

function kontrolVarMi(metin) {
  for (let i = 0; i < metin.length; i++) if (kontrolKodu(metin.charCodeAt(i))) return true;
  return false;
}

/**
 * Ham yolu normalleştirir (degisiklik-sinifi.cjs ile aynı kurallar). Dönüş `{ yol }` ya da `{ sebep }` (reddedildi: çağıran `tam` der).
 * `\` → `/`, `./` ve `//` atılır; `..`, mutlak yol, boş, NUL/kontrol karakteri, 1024+ karakter ve metin olmayan girdi REDDEDİLİR.
 */
function yoluNormalle(ham) {
  if (typeof ham !== 'string') return { sebep: 'yol bir metin değil' };
  if (ham.length > EN_UZUN_YOL) return { sebep: `yol ${EN_UZUN_YOL} karakterden uzun` };
  if (kontrolVarMi(ham)) return { sebep: 'yol kontrol karakteri (NUL, satır sonu vb.) içeriyor' };
  const duz = ham.split('\\').join('/');
  if (duz.charAt(0) === '/' || /^[A-Za-z]:/.test(duz)) return { sebep: 'yol mutlak' };
  const parcalar = [];
  for (const parca of duz.split('/')) {
    if (parca === '' || parca === '.') continue;
    if (parca === '..') return { sebep: "yol '..' bileşeni içeriyor" };
    parcalar.push(parca);
  }
  if (parcalar.length === 0) return { sebep: 'yol boş' };
  return { yol: parcalar.join('/') };
}

/** Kök desen eşleşmesi: en çok bir `*`; baş ve son birbirine BİNMEZ. */
function kokDeseniEslesirMi(desen, ad) {
  const yildiz = desen.indexOf('*');
  if (yildiz === -1) return ad === desen;
  const bas = desen.slice(0, yildiz);
  const son = desen.slice(yildiz + 1);
  return ad.length >= bas.length + son.length && ad.startsWith(bas) && ad.endsWith(son);
}

/** Küresel girdilerden birine uyan yolun neden metni, uymuyorsa null. */
function kureselGirdiNedeni(yol, girdiler) {
  const kokteMi = yol.indexOf('/') === -1;
  for (const girdi of girdiler) {
    if (typeof girdi !== 'string' || girdi === '') continue;
    if (girdi.endsWith('/')) {
      if (yol.startsWith(girdi) || yol === girdi.slice(0, -1)) return `küresel yol (${girdi})`;
    } else if (girdi.indexOf('/') !== -1) {
      if (yol === girdi) return `küresel dosya (${girdi})`;
    } else if (kokteMi && kokDeseniEslesirMi(girdi, yol)) {
      return `küresel dosya (${girdi})`;
    }
  }
  return null;
}

/** Sınıflayıcı nesnesinden (degisiklik-sinifi.cjs dışa aktarımı) yeniden kullanılacak küresel girdiler. Geçersiz nesne → boş. */
function siniflayiciGirdileri(siniflayici) {
  try {
    const liste = siniflayici && siniflayici.HER_ZAMAN_TAM;
    if (!Array.isArray(liste)) return [];
    return liste.filter((g) => typeof g === 'string' && !SINIFLAYICIDAN_ALINMAYAN.includes(g));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// GLOB: `import.meta.glob` desenleri için küçük, DUYARLI eşleştirici. Tanımadığı söz dizimi (extglob) için DAHA GENİŞ eşleşir.
// ---------------------------------------------------------------------------------------------------------------------------

const KACIS_OZEL = /[.+^${}()|[\]\\]/g;

/** `{a,b}` kümelerini açar (iç içe olabilir). Açılım 1000'i aşarsa null (çağıran önek eşleşmesine düşer). */
function suslerleAc(desen) {
  const ac = (metin) => {
    let derinlik = 0;
    let bas = -1;
    for (let i = 0; i < metin.length; i++) {
      const c = metin.charAt(i);
      if (c === '\\') {
        i += 1;
        continue;
      }
      if (c === '{') {
        if (derinlik === 0) bas = i;
        derinlik += 1;
      } else if (c === '}' && derinlik > 0) {
        derinlik -= 1;
        if (derinlik === 0) {
          const ic = metin.slice(bas + 1, i);
          const parcalar = [];
          let d = 0;
          let son = 0;
          for (let j = 0; j < ic.length; j++) {
            const k = ic.charAt(j);
            if (k === '\\') j += 1;
            else if (k === '{') d += 1;
            else if (k === '}') d -= 1;
            else if (k === ',' && d === 0) {
              parcalar.push(ic.slice(son, j));
              son = j + 1;
            }
          }
          parcalar.push(ic.slice(son));
          if (parcalar.length < 2) return [metin];
          const onek = metin.slice(0, bas);
          const sonek = metin.slice(i + 1);
          const cikti = [];
          for (const parca of parcalar) for (const acik of ac(onek + parca + sonek)) cikti.push(acik);
          return cikti;
        }
      }
    }
    return [metin];
  };
  const sonuc = ac(desen);
  return sonuc.length > 1000 ? null : sonuc;
}

/** Süssüz tek desen → RegExp ya da null (extglob `@(`, `+(`, `!(`, `?(`, `*(` gibi tanınmayan söz dizimi). */
function tekDesenRegexi(desen) {
  let r = '^';
  const n = desen.length;
  let i = 0;
  while (i < n) {
    const c = desen.charAt(i);
    const sonraki = desen.charAt(i + 1);
    if (/[@+!?*]/.test(c) && sonraki === '(') return null;
    if (c === '*') {
      if (sonraki === '*') {
        const onceAyrac = i === 0 || desen.charAt(i - 1) === '/';
        const sonraAyrac = i + 2 === n || desen.charAt(i + 2) === '/';
        if (onceAyrac && sonraAyrac) {
          if (i + 2 === n) {
            r += '.*';
            i += 2;
          } else {
            r += '(?:.*/)?';
            i += 3;
          }
          continue;
        }
        r += '.*';
        i += 2;
        continue;
      }
      r += '[^/]*';
      i += 1;
      continue;
    }
    if (c === '?') {
      r += '[^/]';
      i += 1;
      continue;
    }
    if (c === '[') {
      const kapanis = desen.indexOf(']', i + 2);
      if (kapanis === -1) {
        r += '\\[';
        i += 1;
        continue;
      }
      let sinif = desen.slice(i + 1, kapanis);
      if (sinif.charAt(0) === '!') sinif = `^${sinif.slice(1)}`;
      r += `[${sinif.split('\\').join('\\\\')}]`;
      i = kapanis + 1;
      continue;
    }
    if (c === '\\') {
      r += sonraki.replace(KACIS_OZEL, '\\$&');
      i += 2;
      continue;
    }
    r += c.replace(KACIS_OZEL, '\\$&');
    i += 1;
  }
  try {
    return new RegExp(`${r}$`);
  } catch {
    return null;
  }
}

/** Desenin SABİT önek dizini (ilk özel karakterli bileşenden önceki kısım); özel karakter yoksa desenin kendisi (dosya). */
function sabitOnek(desen) {
  const sabit = [];
  for (const b of desen.split('/')) {
    if (/[*?[\]{}()!@+\\]/.test(b)) break;
    sabit.push(b);
  }
  return sabit.join('/');
}

/**
 * Bir desen DİZİSİNİ (`!` ile başlayanlar olumsuz) derler. Dönüş: `{ arti: [(yol)=>bool], eksi: [...] }`.
 * Tanınmayan söz dizimi olumlu desende SABİT ÖNEKİN tüm alt ağacına (öneki yoksa her şeye) genişler (daha çok eşleşir: güvenli),
 * olumsuz desende YOK SAYILIR (daha az dışlar: güvenli).
 */
function desenleriDerle(desenler) {
  const arti = [];
  const eksi = [];
  for (const ham of desenler) {
    if (typeof ham !== 'string' || ham === '') continue;
    const olumsuz = ham.charAt(0) === '!';
    const metin = olumsuz ? ham.slice(1) : ham;
    const acik = suslerleAc(metin);
    const eslestiriciler = [];
    let tanindi = acik !== null;
    if (acik) {
      for (const d of acik) {
        const regex = tekDesenRegexi(d);
        if (regex === null) {
          tanindi = false;
          break;
        }
        eslestiriciler.push((yol) => regex.test(yol));
      }
    }
    if (!tanindi) {
      if (olumsuz) continue;
      const onek = sabitOnek(metin);
      arti.push(onek === '' ? () => true : (yol) => yol === onek || yol.startsWith(`${onek}/`));
      continue;
    }
    (olumsuz ? eksi : arti).push(...eslestiriciler);
  }
  return { arti, eksi };
}

/** `yol` verilen desen dizisinin (olumsuzlar düşüldükten sonra) KAPSAMINDA mı? */
function globEslesir(desenler, yol) {
  const derli = desenleriDerle(desenler);
  return derli.arti.some((f) => f(yol)) && !derli.eksi.some((f) => f(yol));
}

// ---------------------------------------------------------------------------------------------------------------------------
// HARİTA
// ---------------------------------------------------------------------------------------------------------------------------

function dizgeDizisiMi(deger) {
  return Array.isArray(deger) && deger.every((x) => typeof x === 'string');
}

/** Haritanın biçimini doğrular. Dönüş: sorun metni ya da null. */
function haritaSorunu(harita) {
  if (!harita || typeof harita !== 'object' || Array.isArray(harita)) return 'harita yok ya da nesne değil';
  if (harita.surum !== HARITA_SURUMU) return `harita sürümü ${String(harita.surum)} (beklenen ${HARITA_SURUMU})`;
  if (typeof harita.arac !== 'string' || harita.arac === '') return 'harita ölçüm aracı özeti taşımıyor';
  if (!dizgeDizisiMi(harita.kokler) || harita.kokler.length === 0) return 'harita kök listesi yok';
  if (!dizgeDizisiMi(harita.kuresel || []) || !dizgeDizisiMi(harita.kuresel_desenler || [])) return 'harita küresel listeleri geçersiz';
  if (!harita.testler || typeof harita.testler !== 'object' || Array.isArray(harita.testler)) return 'harita test kayıtları yok';
  for (const [ad, kayit] of Object.entries(harita.testler)) {
    if (!kayit || typeof kayit !== 'object' || Array.isArray(kayit)) return `kayıt geçersiz: ${ad}`;
    if (typeof kayit.sha !== 'string') return `kaydın özeti yok: ${ad}`;
    for (const alan of ['okunan', 'dizin', 'ozy', 'desenler', 'surec', 'belirsiz']) {
      if (kayit[alan] !== undefined && !dizgeDizisiMi(kayit[alan])) return `kayıt alanı geçersiz: ${ad}.${alan}`;
    }
  }
  return null;
}

function ekle(harita, anahtar, test) {
  const liste = harita.get(anahtar);
  if (liste) liste.push(test);
  else harita.set(anahtar, [test]);
}

/**
 * Haritadan ters indeks: yol → testler (okunan), dizin → testler, alt ağaç → testler, desen grubu → testler.
 * ÖNBELLEKLENMEZ (nesne kimliğine göre önbellek, aynı nesnenin yerinde değiştirilmesi halinde bayat indeks verirdi; kurma maliyeti ms).
 */
function indeksKur(harita) {
  const okunan = new Map();
  const dizin = new Map();
  const ozy = new Map();
  const desenGruplari = new Map();
  for (const [test, kayit] of Object.entries(harita.testler)) {
    for (const p of kayit.okunan || []) ekle(okunan, p, test);
    for (const p of kayit.dizin || []) ekle(dizin, p, test);
    for (const p of kayit.ozy || []) ekle(ozy, p, test);
    if (kayit.desenler && kayit.desenler.length > 0) {
      const imza = JSON.stringify(kayit.desenler);
      let grup = desenGruplari.get(imza);
      if (!grup) {
        grup = { derli: desenleriDerle(kayit.desenler), testler: [] };
        desenGruplari.set(imza, grup);
      }
      grup.testler.push(test);
    }
  }
  return { okunan, dizin, ozy, desenGruplari: [...desenGruplari.values()] };
}

/** `a/b/c.md` → ['a', 'a/b'] (yolu İÇEREN dizinler, kökten derine). */
function ustDizinler(yol) {
  const parcalar = yol.split('/');
  const cikti = [];
  for (let i = 1; i < parcalar.length; i++) cikti.push(parcalar.slice(0, i).join('/'));
  return cikti;
}

/** Bir değişen yolu okuyan/kapsayan testler (Set). */
function haritaEslesmeleri(indeks, yol) {
  const bulunan = new Set();
  const uste = ustDizinler(yol);
  const tumu = (liste) => {
    for (const t of liste || []) bulunan.add(t);
  };
  tumu(indeks.okunan.get(yol));
  for (const u of uste) tumu(indeks.okunan.get(u));
  tumu(indeks.dizin.get(uste.length > 0 ? uste[uste.length - 1] : '.'));
  tumu(indeks.ozy.get('.'));
  for (const u of uste) tumu(indeks.ozy.get(u));
  for (const grup of indeks.desenGruplari) {
    if (grup.derli.arti.some((f) => f(yol)) && !grup.derli.eksi.some((f) => f(yol))) tumu(grup.testler);
  }
  return bulunan;
}

/** Haritanın küresel listeleri (kurulum evresi okumaları, ana süreç yardımcılarının desenleri) için neden metni ya da null. */
function haritaKureselNedeni(harita, yol) {
  for (const p of harita.kuresel || []) {
    if (yol === p || yol.startsWith(`${p}/`) || p === '.') return `kurulum evresinde okunan yol (${p})`;
  }
  if ((harita.kuresel_desenler || []).length > 0 && globEslesir(harita.kuresel_desenler, yol)) return 'test dışı kodun import.meta.glob deseni kapsıyor';
  return null;
}

function tamSonuc(neden, testDosyalari) {
  const hepsi = Array.isArray(testDosyalari) ? testDosyalari.filter((t) => typeof t === 'string').sort() : [];
  return { tam: true, secilen: hepsi, neden: Array.isArray(neden) ? neden : [String(neden)] };
}

/** `degisenDosyalar` içinde `vitest related` için hesaplanacak dosyalar (var olan, test olmayan, içe aktarılabilir). */
function ilgiliAdaylari(yollar, dosyaVarMi) {
  return yollar.filter((y) => ICE_AKTARILABILIR.test(y) && !TEST_DESENI.test(y) && (typeof dosyaVarMi === 'function' ? dosyaVarMi(y) !== false : true));
}

function secIc(girdi) {
  const { degisenDosyalar, testDosyalari, harita, ilgili, tazelik, dosyaVarMi, siniflayici } = girdi;
  if (!Array.isArray(testDosyalari) || testDosyalari.length === 0 || !dizgeDizisiMi(testDosyalari)) {
    return tamSonuc(['test dosyası listesi yok ya da geçersiz: karar verilemez'], testDosyalari);
  }
  if (!Array.isArray(degisenDosyalar)) return tamSonuc(['değişen dosya listesi bir dizi değil'], testDosyalari);
  if (degisenDosyalar.length === 0) return tamSonuc(['değişen dosya listesi boş: karar verilemez'], testDosyalari);
  if (degisenDosyalar.length >= DOSYA_SINIRI) {
    return tamSonuc([`${degisenDosyalar.length} dosya değişmiş (sınır ${DOSYA_SINIRI}): kaba seçim güvenilmez`], testDosyalari);
  }
  const sorun = haritaSorunu(harita);
  if (sorun) return tamSonuc([`harita kullanılamaz: ${sorun}`], testDosyalari);
  if (tazelik && typeof tazelik === 'object' && tazelik.arac !== undefined && tazelik.arac !== harita.arac) {
    return tamSonuc(['harita bayat: ölçüm aracı (kaydedici/kurulum/yapılandırma) haritanın ölçüldüğü sürümden farklı'], testDosyalari);
  }

  const yollar = [];
  for (const ham of degisenDosyalar) {
    const norm = yoluNormalle(ham);
    if (norm.sebep) return tamSonuc([`'${String(ham).slice(0, 80)}' kullanılamaz: ${norm.sebep}`], testDosyalari);
    yollar.push(norm.yol);
  }
  const tekil = [...new Set(yollar)].sort();
  const kureselGirdileri = [...KURESEL_GIRDILER, ...siniflayiciGirdileri(siniflayici)];
  for (const y of tekil) {
    const neden = kureselGirdiNedeni(y, kureselGirdileri) || haritaKureselNedeni(harita, y);
    if (neden) return tamSonuc([`${y}: ${neden}`], testDosyalari);
  }
  const kokler = new Set(harita.kokler);
  for (const y of tekil) {
    if (!kokler.has(y.split('/')[0])) return tamSonuc([`${y}: haritanın bilmediği kök (sınıflanamayan yol)`], testDosyalari);
  }
  for (const y of tekil) {
    // Silinen TEST dosyası içe aktarılmaz (başka testi kıramaz; onu OKUYAN test haritada yoluyla bulunur): tam gerektirmez.
    const kodMu = KOD_YUZEYLERI.some((o) => y.startsWith(o)) && !/\.(?:md|mdx|txt|snap|csv)$/i.test(y) && !TEST_DESENI.test(y);
    if (kodMu && typeof dosyaVarMi === 'function' && dosyaVarMi(y) === false) {
      return tamSonuc([`${y}: silinmiş/taşınmış kod dosyası (içe aktaran testi grafikte görünmez)`], testDosyalari);
    }
  }

  const liste = new Set(testDosyalari);
  const secilen = new Set();
  const neden = [];

  const degisenTestler = tekil.filter((y) => TEST_DESENI.test(y) || liste.has(y));
  for (const y of degisenTestler) if (liste.has(y)) secilen.add(y);
  neden.push(`${tekil.length} değişen dosya; ${degisenTestler.length} tanesi test dosyası`);

  const adaylar = ilgiliAdaylari(tekil, dosyaVarMi);
  let ilgiliSayisi = 0;
  if (adaylar.length > 0) {
    let sonuc;
    try {
      sonuc = typeof ilgili === 'function' ? ilgili(adaylar) : null;
    } catch (e) {
      return tamSonuc([`vitest related hesaplanamadı (${hataMetni(e)}): güvenli tarafta tam`], testDosyalari);
    }
    if (!dizgeDizisiMi(sonuc)) return tamSonuc(['vitest related sonucu yok ya da geçersiz: güvenli tarafta tam'], testDosyalari);
    for (const t of sonuc) {
      const norm = yoluNormalle(t);
      if (norm.yol && liste.has(norm.yol)) {
        if (!secilen.has(norm.yol)) ilgiliSayisi += 1;
        secilen.add(norm.yol);
      }
    }
    neden.push(`vitest related (${adaylar.length} dosya için): ${ilgiliSayisi} yeni test`);
  } else {
    neden.push('vitest related atlandı: içe aktarılabilir dosya değişmedi');
  }

  const indeks = indeksKur(harita);
  let haritaSayisi = 0;
  for (const y of tekil) {
    for (const t of haritaEslesmeleri(indeks, y)) {
      if (liste.has(t) && !secilen.has(t)) haritaSayisi += 1;
      if (liste.has(t)) secilen.add(t);
    }
  }
  neden.push(`harita eşleşmesi: ${haritaSayisi} yeni test`);

  let belirsiz = 0;
  let kayitsiz = 0;
  let bayat = 0;
  const tazeTestler = tazelik && typeof tazelik === 'object' && tazelik.testler && typeof tazelik.testler === 'object' ? tazelik.testler : null;
  for (const t of liste) {
    const kayit = harita.testler[t];
    let nedeni = null;
    if (!kayit) {
      kayitsiz += 1;
      nedeni = 'kayitsiz';
    } else if (tazeTestler && tazeTestler[t] !== kayit.sha) {
      bayat += 1;
      nedeni = 'bayat';
    } else if (kayit.belirsiz && kayit.belirsiz.length > 0) {
      belirsiz += 1;
      nedeni = 'belirsiz';
    }
    if (nedeni) secilen.add(t);
  }
  neden.push(`her zaman koşan: ${belirsiz + kayitsiz + bayat} test (belirsiz ${belirsiz}, haritada yok ${kayitsiz}, bayat kayıt ${bayat})`);
  const sirali = [...secilen].sort();
  neden.push(`seçilen ${sirali.length}/${liste.size} test dosyası`);
  return { tam: false, secilen: sirali, neden };
}

/**
 * Seçim. SAF ve FIRLATMAZ: her hata, belirsizlik ve hesaplanamayan girdi `tam`dır.
 *   degisenDosyalar  PR'ın değişen yolları (`git diff -z --name-only --no-renames HEAD^1 HEAD`; taşıma eski+yeni yolu birlikte verir)
 *   testDosyalari    vitest'in bu koşuda listelediği test dosyaları (köke göreli POSIX)
 *   harita           scripts/ci/test-haritasi.json (ayrıştırılmış nesne)
 *   ilgili           (dosyalar: string[]) => string[]: `vitest related` sonucu (eşzamanlı; CLI önceden hesaplar)
 *   tazelik          (isteğe bağlı) { arac, testler: { yol: özet } }: haritanın bayatlığını ölçer (CLI HER ZAMAN verir)
 *   dosyaVarMi       (isteğe bağlı) (yol) => boolean: silinen kod dosyasını bulur
 *   siniflayici      (isteğe bağlı) degisiklik-sinifi.cjs dışa aktarımı: HER_ZAMAN_TAM girdileri küresele eklenir
 * Dönüş: { tam: boolean, secilen: string[] (tam ise TÜM testler), neden: string[] }
 */
function sec(girdi) {
  try {
    return secIc(girdi || {});
  } catch (e) {
    return tamSonuc([`seçim sırasında beklenmeyen hata (${hataMetni(e)}): güvenli tarafta tam`], girdi && girdi.testDosyalari);
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// ÖZETLER (tazelik)
// ---------------------------------------------------------------------------------------------------------------------------

/** Metin özeti: satır sonu normalleştirilir (Windows CRLF çalışma ağacı ile Linux LF aynı özeti vermeli). 16 onaltılık hane. */
function icerikOzeti(metin) {
  return crypto.createHash('sha1').update(String(metin).split('\r\n').join('\n')).digest('hex').slice(0, 16);
}

function dosyaOzeti(kok, goreli) {
  return icerikOzeti(fs.readFileSync(path.join(kok, goreli), 'utf8'));
}

/** Ölçüm aracının özeti (kaydedici + kurulum + yapılandırma). Dosya okunamazsa `yok` yazılır (özet haritadakiyle eşleşmez: bayat). */
function aracOzeti(kok) {
  const parcalar = ARAC_DOSYALARI.map((d) => {
    try {
      return `${d}:${dosyaOzeti(kok, d)}`;
    } catch {
      return `${d}:yok`;
    }
  });
  return icerikOzeti(parcalar.join('\n'));
}

/** CLI'nin `sec`e verdiği tazelik nesnesi: araç özeti + listedeki her testin kaynak özeti. */
function tazelikHesapla(kok, testDosyalari) {
  const testler = {};
  for (const t of testDosyalari) {
    try {
      testler[t] = dosyaOzeti(kok, t);
    } catch {
      testler[t] = 'okunamadi';
    }
  }
  return { arac: aracOzeti(kok), testler };
}

// ---------------------------------------------------------------------------------------------------------------------------
// vitest: test listesi + `related` (içe aktarma grafiği)
// ---------------------------------------------------------------------------------------------------------------------------

function kokDizini() {
  return path.resolve(__dirname, '..', '..');
}

function posix(yol) {
  return yol.split(path.sep).join('/');
}

/**
 * vitest programatik oturumu: yapılandırma `vitest.config.ts` (ortam `VENTHUB_DUNYA_DURUMU` dikkate alınır). Dönüş:
 *   testler          vitest'in listelediği test dosyaları (köke göreli POSIX)
 *   ilgili(dosyalar) verilen dosyaları (doğrudan ya da dolaylı) içe aktaran testler; grafik ilk çağrıda kurulur ve önbelleğe alınır
 *   kapat()
 * `getTestDependencies` vitest'in iç API'sidir; yoksa `getRelevantTestSpecifications` ile (çağrı başına grafik) devam edilir,
 * ikisi de yoksa fırlatır (çağıran `tam` der).
 */
async function vitestOturumuAc(kok) {
  // vitest, BU BETİĞİN değil `kok`ün node_modules'ından çözülür (betik tabandan RUNNER_TEMP'e çıkarılıp koşturulabilir).
  const vitestNode = nodeModule.createRequire(path.join(kok, 'package.json')).resolve('vitest/node');
  const { createVitest } = await import(pathToFileURL(vitestNode).href);
  const vitest = await createVitest('test', { watch: false, reporters: [], root: kok }, {});
  const spec = await vitest.specifications.globTestSpecifications();
  const goreli = (s) => posix(path.relative(kok, s.moduleId));
  const testler = spec.map(goreli).sort();
  const mutlak = (yol) => posix(path.resolve(kok, yol));
  let bagimliliklar = null;
  const ilgili = async (dosyalar) => {
    const kume = new Set(dosyalar.map(mutlak));
    if (typeof vitest.specifications.getTestDependencies === 'function') {
      if (!bagimliliklar) {
        // vitest'in kendi `filterTestsBySource`ı gibi PARALEL (dönüşümler eşzamansız; ardışık beklemek grafiği kurma süresini katlar).
        const bagimlilikListesi = await Promise.all(spec.map(async (s) => [goreli(s), await vitest.specifications.getTestDependencies(s)]));
        bagimliliklar = new Map(bagimlilikListesi);
      }
      const bulunan = [];
      for (const [test, deps] of bagimliliklar) {
        for (const d of kume) {
          if (deps.has(d) || deps.has(d.split('/').join(path.sep))) {
            bulunan.push(test);
            break;
          }
        }
      }
      return bulunan.sort();
    }
    vitest.config.related = [...kume];
    const ilgiliSpec = await vitest.specifications.getRelevantTestSpecifications();
    return ilgiliSpec.map(goreli).sort();
  };
  return { testler, ilgili, kapat: () => vitest.close() };
}

// ---------------------------------------------------------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------------------------------------------------------

function gercekGit(args) {
  return childProcess.execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: GIT_CIKTI_AZAMI,
    timeout: GIT_ZAMAN_ASIMI_MS,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
}

/** `git diff -z` çıktısını yollara böler. Boş çıktı = değişiklik yok. NUL ile BİTMİYORSA kesilmiş demektir: FIRLATIR. */
function yollariAyir(ham) {
  if (typeof ham !== 'string') throw new Error('git çıktısı metin değil');
  if (ham === '') return [];
  if (!ham.endsWith('\0')) throw new Error('git çıktısı NUL ile bitmiyor (kesilmiş ya da -z yok)');
  return ham.slice(0, -1).split('\0');
}

/** Değişen yol dosyası: JSON dizisi, NUL ayraçlı ya da satır ayraçlı. */
function yolDosyasiniOku(dosya) {
  const metin = fs.readFileSync(dosya, 'utf8');
  if (metin.trimStart().startsWith('[')) return JSON.parse(metin);
  const ayrac = metin.includes('\0') ? '\0' : '\n';
  return metin.split(ayrac).map((s) => s.replace(/\r$/, '')).filter((s) => s !== '');
}

const VARSAYILAN_ARGUMANLAR = Object.freeze({ kok: null, harita: null, cikti: null, degisenDosya: null, testListesi: null, vitestsiz: false, json: false, yerel: false, taban: null, kuru: false });

function argumanlariCoz(argv) {
  const secenek = { ...VARSAYILAN_ARGUMANLAR };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--kok') secenek.kok = argv[++i];
    else if (a === '--harita') secenek.harita = argv[++i];
    else if (a === '--cikti') secenek.cikti = argv[++i];
    else if (a === '--degisen-dosya') secenek.degisenDosya = argv[++i];
    else if (a === '--test-listesi') secenek.testListesi = argv[++i];
    else if (a === '--vitestsiz') secenek.vitestsiz = true;
    else if (a === '--json') secenek.json = true;
    else if (a === '--yerel') secenek.yerel = true;
    else if (a === '--taban') secenek.taban = argv[++i];
    else if (a === '--kuru') secenek.kuru = true;
    else throw new Error(`bilinmeyen argüman: ${String(a).slice(0, 60)}`);
  }
  return secenek;
}

// ---------------------------------------------------------------------------------------------------------------------------
// YEREL kullanım (`pnpm test:ilgili`): değişen dosyalar master'a göre, seçilen testler koşar, TAM'a düşerse sebep yazılır
// ---------------------------------------------------------------------------------------------------------------------------

/** Yerel taban: `HEAD` ile `--taban` (varsayılan origin/master, yoksa master) arasındaki ORTAK ATA. Hiçbiri yoksa FIRLATIR. */
function tabanBul(gitCalistir, kok, istenen) {
  const adaylar = istenen ? [istenen] : ['origin/master', 'master'];
  for (const ref of adaylar) {
    try {
      const sha = String(gitCalistir(['-C', kok, 'merge-base', 'HEAD', ref])).trim();
      if (/^[0-9a-f]{7,40}$/.test(sha)) return sha;
    } catch {
      /* bu ref yok: sonrakini dene */
    }
  }
  throw new Error(`taban bulunamadı (${adaylar.join(', ')}): git fetch origin master`);
}

/** Yerel değişenler: tabana göre çalışma ağacı farkı (kayıtlı + kaydedilmemiş izlenen dosyalar, silinenler dahil) ∪ izlenmeyen yeni dosyalar (`.gitignore` hariç). */
function yerelDegisenler(gitCalistir, kok, taban) {
  const izlenen = yollariAyir(gitCalistir(['-C', kok, 'diff', '--name-only', '-z', '--no-renames', taban]));
  const yeni = yollariAyir(gitCalistir(['-C', kok, 'ls-files', '--others', '--exclude-standard', '-z']));
  return [...new Set([...izlenen, ...yeni])].sort();
}

/** Seçilen test dosyalarını vitest ile koşar (yerel tam paket DEĞİL). Dönüş: vitest çıkış kodu. */
function vitestiKos(kok, dosyalar) {
  const vitestBin = path.join(kok, 'node_modules', 'vitest', 'vitest.mjs');
  const sonuc = childProcess.spawnSync(process.execPath, [vitestBin, 'run', '--passWithNoTests', ...dosyalar], {
    cwd: kok,
    stdio: 'inherit',
    env: { ...process.env, VENTHUB_DUNYA_DURUMU: process.env.VENTHUB_DUNYA_DURUMU || 'dislan' },
    windowsHide: true,
  });
  return typeof sonuc.status === 'number' ? sonuc.status : 1;
}

/** `--yerel` çıktısı ve koşusu. TAM ise HİÇBİR test koşmaz (yerelde tam paket yok; CI koşar) ve sebebi yazar. Dönüş: çıkış kodu. */
function yerelBitir(sonuc, toplam, arg, vitestKos, kok, yaz) {
  if (sonuc.tam) {
    yaz(`TAM: ${sonuc.neden[0]}\n  Yerelde tam paket koşturulmaz (CI koşar); gerekirse elle: pnpm test -- --run\n`);
    return 0;
  }
  yaz(`Seçilen ${sonuc.secilen.length}/${toplam} test dosyası (${sonuc.neden.slice(1, 4).join('; ')})\n`);
  if (sonuc.secilen.length === 0) {
    yaz('Koşacak test yok.\n');
    return 0;
  }
  if (arg.kuru) {
    for (const t of sonuc.secilen) yaz(`  ${t}\n`);
    return 0;
  }
  return vitestKos(kok, sonuc.secilen);
}

/** Çıktıya girecek tek satırlık metin (iş akışı komutu enjeksiyonuna karşı: kontrol karakteri → boşluk, `%` silinir, `::` tek olur). */
function satirTemizle(metin) {
  const kisa = metin.length > NEDEN_AZAMI ? `${metin.slice(0, NEDEN_AZAMI)}…` : metin;
  let temiz = '';
  for (let i = 0; i < kisa.length; i++) temiz += kontrolKodu(kisa.charCodeAt(i)) ? ' ' : kisa.charAt(i);
  return temiz.split('%').join('').replace(/:{2,}/g, ':');
}

function testListesiniOku(dosya, kok) {
  const ham = JSON.parse(fs.readFileSync(dosya, 'utf8'));
  const dizi = Array.isArray(ham) ? ham : ham.testler || ham.files || [];
  return dizi
    .map((x) => (typeof x === 'string' ? x : x && (x.file || x.dosya)))
    .filter((x) => typeof x === 'string')
    .map((x) => (path.isAbsolute(x) ? posix(path.relative(kok, x)) : x.split('\\').join('/')))
    .sort();
}

/** Sınıflayıcı (degisiklik-sinifi.cjs): önce betiğin yanında, yoksa `kok`te; ikisi de yoksa null (kendi küresel listemiz üst kümedir). */
function siniflayiciYukle(kok) {
  for (const yol of [path.join(__dirname, 'degisiklik-sinifi.cjs'), path.join(kok, 'scripts', 'ci', 'degisiklik-sinifi.cjs')]) {
    try {
      return require(yol);
    } catch {
      /* bu konumda yok ya da yüklenemedi: sonrakini dene */
    }
  }
  return null;
}

const ILGILI_GEREKLI = 'vitest-related-gerekli';

/** `sec`e "içe aktarma grafiği gerekirse söyle" diye verilir: gerekmiyorsa hiç çağrılmaz, gerekiyorsa bu hata `sec`in `tam` nedenine girer. */
function ilgiliGerekliSinyali() {
  throw new Error(ILGILI_GEREKLI);
}

/** `sec` sonucu "grafik gerekli" sinyali yüzünden mi `tam` oldu (gerçek bir tam nedeni değil)? */
function ilgiliGerekliMi(sonuc) {
  return sonuc.tam === true && sonuc.neden.some((n) => n.includes(ILGILI_GEREKLI));
}

/** `git ls-files` ile test dosyaları (vitest'siz kip): vitest listesinin ÜST KÜMESİ (dışlanan testler de olabilir; dağıtıcı kendi listesiyle kesiştirir). */
function gitTestListesi(gitCalistir, kok) {
  const ham = gitCalistir(['-C', kok, 'ls-files', '-z']);
  return yollariAyir(ham.endsWith('\0') || ham === '' ? ham : `${ham}\0`)
    .filter((y) => TEST_DESENI.test(y) && fs.existsSync(path.join(kok, y)))
    .sort();
}

/**
 * CLI çekirdeği. Enjeksiyon (testler gerçek git/vitest kullanmasın): `gitCalistir`, `oturumAc(kok)`, `ortam`, `kok`, `yaz`.
 * `--kok` verilirse enjekte kökü ezer (vitest, dosya okuma ve git çalışma dizini o köke bağlanır).
 * ASLA fırlatmaz: her hata `tam` olarak yazılır. Sonucu da döner.
 */
async function calistir(argv, secenekler = {}) {
  const { gitCalistir = gercekGit, oturumAc = vitestOturumuAc, ortam = process.env, kok: kokVarsayilan = kokDizini(), yaz = (m) => process.stdout.write(m), vitestKos = vitestiKos } = secenekler;
  let sonuc;
  let testler = [];
  let oturum = null;
  const argGuvenli = argumanlarGuvenli(argv);
  let kokKullanilan = kokVarsayilan;
  try {
    const arg = argumanlariCoz(argv);
    const kok = arg.kok ? path.resolve(arg.kok) : kokVarsayilan;
    kokKullanilan = kok;
    const haritaYolu = path.resolve(kok, arg.harita || 'scripts/ci/test-haritasi.json');
    const siniflayici = siniflayiciYukle(kok);
    // Yerel kipte vitest.config.ts'in PR kapısı kümesini görmesi için (dünya durumu testleri dışarıda); enjekte oturumda ortam kirletilmez.
    if (arg.yerel && oturumAc === vitestOturumuAc && !process.env.VENTHUB_DUNYA_DURUMU) process.env.VENTHUB_DUNYA_DURUMU = 'dislan';
    let degisen;
    if (arg.degisenDosya) degisen = yolDosyasiniOku(arg.degisenDosya);
    else if (arg.yerel) degisen = yerelDegisenler(gitCalistir, kok, tabanBul(gitCalistir, kok, arg.taban));
    else degisen = yollariAyir(gitCalistir(['-C', kok, ...GIT_ARGUMANLARI]));
    if (arg.yerel && degisen.length === 0) {
      yaz('Değişiklik yok (tabana göre): koşacak test yok.\n');
      return { tam: false, secilen: [], neden: ['değişiklik yok'], cikisKodu: 0 };
    }
    const harita = JSON.parse(fs.readFileSync(haritaYolu, 'utf8'));
    if (arg.testListesi) testler = testListesiniOku(arg.testListesi, kok);
    else if (arg.vitestsiz) testler = gitTestListesi(gitCalistir, kok);
    const normaller = degisen.map((d) => yoluNormalle(d).yol).filter((y) => typeof y === 'string');
    const dosyaVarMi = (y) => fs.existsSync(path.join(kok, y));
    const adaylar = ilgiliAdaylari(normaller, dosyaVarMi);
    if (arg.vitestsiz && adaylar.length > 0) {
      sonuc = tamSonuc([`vitest gerekli: içe aktarılabilir dosya değişti (${adaylar[0]}${adaylar.length > 1 ? ` +${adaylar.length - 1}` : ''}); kurulumdan sonra --vitestsiz OLMADAN koşulmalı`], testler);
    } else {
      // vitest oturumu yalnız test LİSTESİ için (~2 sn) gerekirse açılır; içe aktarma grafiği (en pahalı iş, 20-60 sn) yalnız karar GERÇEKTEN ona
      // bağlıysa kurulur: küresel dosya, bilinmeyen kök, silinen kod ve belge-yalnız değişikliklerde `sec` grafiğe hiç bakmadan karar verir.
      if (!arg.vitestsiz && testler.length === 0) {
        oturum = await oturumAc(kok);
        testler = oturum.testler;
      }
      const girdi = { degisenDosyalar: degisen, testDosyalari: testler, harita, tazelik: tazelikHesapla(kok, testler), dosyaVarMi, siniflayici };
      sonuc = sec({ ...girdi, ilgili: ilgiliGerekliSinyali });
      if (ilgiliGerekliMi(sonuc) && adaylar.length > 0) {
        if (!oturum) oturum = await oturumAc(kok);
        const ilgiliSonuc = await oturum.ilgili(adaylar);
        sonuc = sec({ ...girdi, ilgili: () => ilgiliSonuc });
      }
    }
  } catch (e) {
    sonuc = tamSonuc([`seçim hesaplanamadı (${hataMetni(e)}): güvenli tarafta tam`], testler);
  } finally {
    if (oturum) {
      try {
        await oturum.kapat();
      } catch {
        /* kapanış hatası sonucu değiştirmez */
      }
    }
  }
  if (argGuvenli.yerel) return { ...sonuc, cikisKodu: yerelBitir(sonuc, testler.length, argGuvenli, vitestKos, kokKullanilan, yaz) };
  yazCikti(sonuc, argGuvenli, ortam, yaz, testler.length);
  return sonuc;
}

function argumanlarGuvenli(argv) {
  try {
    return argumanlariCoz(argv);
  } catch {
    return { ...VARSAYILAN_ARGUMANLAR };
  }
}

/**
 * Sonucu yazar: `--cikti` dosyası (satır başına bir test yolu; `tam` ise TÜM testler), stdout JSON özeti + `::notice::`, `$GITHUB_OUTPUT`
 * (`tam=`, `secilen-sayisi=`, `toplam=`, `neden=`: dört satır, `neden` tek satır ve temizlenmiş). `tam` ve seçilebilecek test listesi
 * YOKSA (git/harita hatası) dosya YAZILMAZ ve eskisi silinir: boş bir dosya "hiçbir şey koşma" diye okunmasın; tüketici `tam=true` görüp
 * tam koşar. FIRLATMAZ.
 */
function yazCikti(sonuc, arg, ortam, yaz, toplam) {
  const nedenTek = satirTemizle(sonuc.neden.join('; '));
  try {
    if (arg.cikti) {
      if (sonuc.tam && sonuc.secilen.length === 0) fs.rmSync(arg.cikti, { force: true });
      else fs.writeFileSync(arg.cikti, `${sonuc.secilen.join('\n')}${sonuc.secilen.length > 0 ? '\n' : ''}`, 'utf8');
    }
  } catch (e) {
    yaz(`::warning::seçim dosyası yazılamadı (${satirTemizle(hataMetni(e))}): tüketici tam koşu varsaymalı\n`);
  }
  const ozet = { tam: sonuc.tam, secilenSayisi: sonuc.secilen.length, toplam, neden: sonuc.neden };
  yaz(`${JSON.stringify(arg.json ? { ...ozet, secilen: sonuc.secilen } : ozet)}\n`);
  yaz(`::notice::test seçimi: ${sonuc.tam ? 'TAM' : `${sonuc.secilen.length}/${toplam} test dosyası`} — ${nedenTek}\n`);
  const dosya = ortam && typeof ortam.GITHUB_OUTPUT === 'string' && ortam.GITHUB_OUTPUT !== '' ? ortam.GITHUB_OUTPUT : null;
  if (dosya) {
    try {
      fs.appendFileSync(dosya, `tam=${sonuc.tam}\nsecilen-sayisi=${sonuc.secilen.length}\ntoplam=${toplam}\nneden=${nedenTek}\n`, 'utf8');
    } catch (e) {
      yaz(`::warning::GITHUB_OUTPUT yazılamadı (${satirTemizle(hataMetni(e))}): sonraki adımlar tam koşu varsaymalı\n`);
    }
  }
}

if (require.main === module) {
  // CI kipinde çıkış kodu DAİMA 0'dır (hata = tam çıktısı); `--yerel` kipinde seçilen testleri koşturan vitest'in çıkış kodu geçer.
  calistir(process.argv.slice(2)).then(
    (sonuc) => process.exit(sonuc && typeof sonuc.cikisKodu === 'number' ? sonuc.cikisKodu : 0),
    (e) => {
      process.stdout.write(`tam=true\n::notice::test seçimi: TAM — beklenmeyen hata (${satirTemizle(hataMetni(e))})\n`);
      process.exit(0);
    },
  );
}

module.exports = {
  ARAC_DOSYALARI,
  DOSYA_SINIRI,
  HARITA_SURUMU,
  ICE_AKTARILABILIR,
  KURESEL_GIRDILER,
  SINIFLAYICIDAN_ALINMAYAN,
  TEST_DESENI,
  aracOzeti,
  calistir,
  dosyaOzeti,
  globEslesir,
  haritaEslesmeleri,
  haritaSorunu,
  icerikOzeti,
  ilgiliAdaylari,
  indeksKur,
  kureselGirdiNedeni,
  sabitOnek,
  satirTemizle,
  sec,
  suslerleAc,
  tabanBul,
  tazelikHesapla,
  vitestOturumuAc,
  yerelDegisenler,
  yoluNormalle,
  yollariAyir,
};
