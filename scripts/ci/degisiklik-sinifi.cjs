#!/usr/bin/env node
/**
 * ALT-38c · DEĞİŞİKLİK SINIFLAYICI — PR'ın değişen dosyalarına bakıp `ci` işinin NE koşacağını seçen KABA sınıflayıcı (karar 296).
 *
 * TEK DEĞİŞMEZ: yanlış yön HEP `tam`dır. Bir yol ancak AÇIKÇA dar bir sınıfın içinde görülürse dar sayılır; şüpheli, bilinmeyen, hatalı,
 * uzun, mutlak, `..` içeren, kontrol karakterli, hiçbir sınıfa girmeyen HER yol ve ayrıca boş liste, çok büyük liste ve her git hatası
 * `tam` koşudur. NİÇİN: sınıflayıcı bir yolu yanlışlıkla dar sayarsa kapı testleri SESSİZCE atlar (PR'ın kırmızısı yeşil görünür ve kimse
 * kırmızı görmez); `tam`ı fazladan seçmenin bedeli ise yalnız dakikadır. Bu yüzden her dal "emin değilsem tam" der, hiçbir kod yolu
 * fırlatmaz ve çıkış kodu DAİMA 0'dır (başarısız çıkış, kapıyı atlamak yerine koşuyu kırardı; bu yüzden hata = `tam` çıktısıdır).
 *
 * SINIFLAR (yol ÖNEKİ, `/` sınırında: `docs-ekstra/` ve `scripts-eski/` EŞLEŞMEZ; büyük/küçük harf DUYARLI: `Docs/x.md` belge DEĞİLDİR):
 *   belge  docs/ · .claude/ · .agent/ · kökteki *.md        (`src/**` altındaki `.md` belge DEĞİL: tam)
 *   edge   supabase/functions/                               (`supabase/migrations/` ve öteki supabase yolları tam)
 *   betik  scripts/ (scripts/ci/ HARİÇ) · tools/
 *   tam    ötesi. HER_ZAMAN_TAM (mekanizma/küresel) dar sınıflardan ÖNCE değerlendirilir; çakışmada `tam` kazanır
 *          (ör. `scripts/ci/` ⊂ `scripts/`, kökte `next.config.md` ↔ `next.config.*`).
 *   karma  birden çok dar sınıf (`siniflar` hangileri). `siniflar` yalnız TÜM yollar dar olduğunda DOLUDUR; `tam` sonucunda her zaman
 *          boştur: kısmen dar bir iddia taşımaz, yanlışlıkla "belge de var" diye okunup daraltma gerekçesi olmaz.
 *
 * YOL NORMALLEŞTİRME (hepsi "dar sayılacak yolu daraltmadan önce" yapılır; her ret `tam`dır):
 *   `\` → `/` · baştaki ve ardışık `./`, `//` ve iç `.` bileşenleri atılır · `..` bileşeni, mutlak yol (`/x`, `\x`, `C:`), boş yol, NUL ve
 *   öteki kontrol karakteri (C0, DEL, C1, U+2028/2029), 1024 karakterden uzun yol (ham uzunluk, normalleştirmeden ÖNCE) ve metin olmayan
 *   eleman reddedilir. İç `.` ve `//` atılmazsa `scripts/./ci/x.cjs` mekanizma yolunu `betik` diye daraltırdı; bu yüzden atılırlar.
 *   Boşluk KIRPILMAZ (` docs/a.md` belge değildir). Eşleşme önekle ve `/` sınırında; dizinin kendisi DOSYA olarak gelirse
 *   (`scripts/ci`, `docs`) önek sayılmaz (`docs` tam; `scripts/ci` HER_ZAMAN_TAM'da adıyla yazılıdır).
 *
 * ÇIKTI (`calistir`): `$GITHUB_OUTPUT`a `sinif=`, `siniflar=` (virgülle) ve `neden=` (TEK satır) ve ekrana `::notice::`. `neden` içinde
 * dosya adı yer alabilir ve dosya adını PR yazarı belirler: bu yüzden `neden` ÇIKTIYA girmeden `satirTemizle`den geçer (satır sonu ve
 * öteki kontrol karakteri boşluğa, `%` silinir, `::` tek `:` olur, 300 karakterde kesilir). Aksi halde yeni satırlı bir dosya adı
 * `neden=` satırından çıkıp `sinif=belge` yazabilir ya da `::error::` gibi bir iş akışı komutu üretebilirdi. Çıktı tüketicisi `neden`i bir
 * kabuk betiğine `${{ }}` ile gömmemelidir (tek satır ve temiz olsa da bu bir tüketici kuralıdır; güvenilmeyen metindir).
 *
 * Kullanım (komut):     node scripts/ci/degisiklik-sinifi.cjs      (çalışma dizini = PR'ın birleştirme commit'i checkout'u)
 * Kullanım (kütüphane): const { siniflandir } = require('./scripts/ci/degisiklik-sinifi.cjs');
 *
 * BAĞLAMA ŞARTLARI (ci.yml işi için; bu betik bunları DOĞRULAYAMAZ, bu yüzden burada yazılı):
 *   1. Yalnız `pull_request` olayında, varsayılan (birleştirme commit'i) checkout'ta ve `fetch-depth` >= 2 ile koşturulur; push ve elle koşumda
 *      sınıf YOK SAYILIR (tam koşu).
 *   2. Betik PR'ın KENDİ kopyasından değil TABANDAN (`git show HEAD^1:scripts/ci/degisiklik-sinifi.cjs`) çıkarılıp koşturulur; taban kopyası yoksa
 *      sınıf çıktısı verilmez ve tam koşulur. NİÇİN: aksi halde bir PR sınıflayıcıyı değiştirip her değişikliğe `belge` dedirtebilir (edited-ayna.cjs
 *      B2 ile aynı güven sınırı; `scripts/ci/**` değişen PR bu betikçe `tam` sayılır ama o kararı PR'ın kendi kopyası vermemeli).
 *   3. Ağır adımlar yalnız DARALTMA yönünde koşullanır (`steps.sinif.outputs.sinif != 'belge'` biçimi): çıktı boş ya da yoksa HER ŞEY koşar;
 *      sınıf çıktısının eksikliği asla "atla" anlamına gelmez. `ci` işinin ADI değişmez (zorunlu kontrol), yalnız adımları atlanır.
 *   4. `degisiklik-sinifi.test.ts` dünya durumu `DISLANAMAZ` listesine eklenmelidir (kapıyı koruyan test kapıdan çıkarılamaz).
 *
 * DÜRÜSTÇE ELE ALINMAYAN SINIRLAR (bağlama işi bunları bilmeli):
 *   1. Yalnız YOL sınıflanır. İçerik, dosya modu, sembolik bağ ve alt modül işaretçisine BAKILMAZ (`docs/x` bir sembolik bağ olabilir).
 *   2. `belge` sınıfı docs'u OKUYAN testleri atlamamalıdır (ör. `arac-envanteri.test.ts` `docs/audits/...` okur): sınıflayıcı yalnız yolu
 *      söyler, hangi testin koşacağı bağlamanın işidir.
 *   3. Fark `git diff HEAD^1 HEAD`tir ve birleştirme commit'ini varsayar (`pull_request` varsayılan checkout'u: HEAD^1 = base, HEAD = birleşim).
 *      HEAD PR'ın kendi ucuysa (`ref: head.sha`) ya da tek ebeveynli commit ise (push, elle koşum) YALNIZ SON COMMIT sınıflanır: çok
 *      commit'li bir PR'da yanlış-dar sonuç doğar. Bağlama yalnız `pull_request` olayında ve varsayılan checkout'ta kullanılmalıdır;
 *      bu betik ebeveyn sayısını DOĞRULAMAZ (SPEC tek git çağrısı ister).
 *   4. Linux'ta `\` geçerli bir dosya adı karakteridir; `docs\a.ts` adlı bir KÖK dosya normalleştirmeyle `docs/a.ts` sayılır ve `belge`
 *      olur. Etkisi yok denecek kadar (köke eklenen böyle bir dosya hiçbir yerden içe aktarılmaz) ama SPEC böyle ister, burada yazılı.
 *   5. 2000 ve üstü dosyada sınıflama yapılmaz (`tam`).
 */
'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');

/** Bu sayıya ULAŞAN ya da AŞAN liste `tam`dır: bu kadar dosyalı bir değişiklik kaba bir "belge/betik" değişikliği değildir. */
const DOSYA_SINIRI = 2000;
/** Ham yol uzunluğu üst sınırı (aşan `tam`); sınır doğrusal işlemleri de sınırlar. */
const EN_UZUN_YOL = 1024;
/** `neden` içinde gösterilen yol değerinin en çok karakteri (fazlası `…`). */
const GOSTER_AZAMI = 80;
/** Çıktıya yazılan `neden` satırının en çok karakteri (fazlası `…`). */
const NEDEN_AZAMI = 300;
const GIT_CIKTI_AZAMI = 8 * 1024 * 1024;
const GIT_ZAMAN_ASIMI_MS = 30000;
/**
 * Git çağrısı SPEC ile BİREBİR: `-z` NUL ayraçlı ve TIRNAKSIZ çıktı verir (yoksa Türkçe/boşluklu yol `"docs/\303\207..."` olur ve dar sınıf
 * kaçar); `--no-renames` taşınan dosyanın ESKİ ve YENİ yolunu birlikte listeler (yoksa `src/a.ts` → `docs/a.ts` taşıması yalnız `docs/a.ts` görünür
 * ve kaynak koddan çıkış `belge` sayılırdı).
 */
const GIT_ARGUMANLARI = Object.freeze(['diff', '--name-only', '-z', '--no-renames', 'HEAD^1', 'HEAD']);

/** Dar sınıflar: sınıf → yol önekleri. Önekler `/` ile BİTER (sınır): `docs-ekstra/` `docs/` ile eşleşmez. Test bu nesneyi OKUR. */
const DAR_SINIFLAR = Object.freeze({
  belge: Object.freeze(['docs/', '.claude/', '.agent/']),
  edge: Object.freeze(['supabase/functions/']),
  betik: Object.freeze(['scripts/', 'tools/']),
});

/**
 * HER ZAMAN `tam` (mekanizma/küresel). Dört yazım biçimi:
 *   `dizin/`      dizin öneki (`/` sınırında; dizin adının kendisi bir DOSYA olarak gelirse de eşleşir: `scripts/ci`),
 *   `ad`          KÖK dizindeki tam dosya adı,
 *   `a*b`         KÖK dizindeki ad deseni (en çok BİR `*`, boş eşleşebilir: `tsconfig*.json` → `tsconfig.json`),
 *   `dizin/ad`    TAM YOL (ALT-38c): yalnız o dosya, başka hiçbir şey (`scripts/assert-node-major.mjs.bak`, alt dizin, büyük harf EŞLEŞMEZ).
 * Kök yazımlar YALNIZ kökte eşleşir (`docs/package.json` mekanizma değildir; `docs/` belgedir). Dar sınıflardan ÖNCE değerlendirilir.
 * Tam yol girdileri dar bir önekin (`scripts/`) ALTINDAKİ build-sırası betiklerdir: `package.json`ın build/lint/test/type-check/prepare
 * betikleri onları çağırır, değişirse siteye dokunulmuş sayılır (derivasyon testi: src/__tests__/conformance/ci-degisiklik-sinifi.test.ts).
 */
const HER_ZAMAN_TAM = Object.freeze([
  '.github/',
  'scripts/ci/',
  'scripts/assert-node-major.mjs',
  'scripts/setup-hooks.mjs',
  '.githooks/',
  'src/',
  'public/',
  'supabase/migrations/',
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig*.json',
  'vitest.config.*',
  'next.config.*',
  'eslint.config.*',
  '.eslintrc*',
  'tailwind.config.*',
  'postcss.config.*',
  '.npmrc',
  '.nvmrc',
  '.node-version',
  '.gitignore',
  '.gitattributes',
  'knip.*',
  'middleware.*',
]);

/** Kontrol karakteri: C0 (NUL, satır sonu, sekme, ESC...), DEL, C1 ve Unicode satır/paragraf ayracı. */
function kontrolKodu(k) {
  return k < 0x20 || (k >= 0x7f && k <= 0x9f) || k === 0x2028 || k === 0x2029;
}

function kontrolVarMi(metin) {
  for (let i = 0; i < metin.length; i++) {
    if (kontrolKodu(metin.charCodeAt(i))) return true;
  }
  return false;
}

/** Hata nesnesinden mesaj: nesnenin KENDİSİ okunurken de fırlayabilir (getter), o yüzden bu işlev asla fırlatmaz. */
function hataMetni(e) {
  try {
    if (typeof e === 'string') return e;
    if (e && typeof e.message === 'string') return e.message;
  } catch {
    /* hata nesnesi okunamıyor: sabit metne düşülür */
  }
  return 'bilinmeyen hata';
}

/** `neden` içinde gösterilecek yol değeri: metin değilse yalnız TÜRÜ, metinse kontrol karakterleri `?`, en çok GOSTER_AZAMI karakter. */
function goster(deger) {
  if (typeof deger !== 'string') return `<${typeof deger}>`;
  const kisa = deger.length > GOSTER_AZAMI ? `${deger.slice(0, GOSTER_AZAMI)}…` : deger;
  let cikti = '';
  for (let i = 0; i < kisa.length; i++) cikti += kontrolKodu(kisa.charCodeAt(i)) ? '?' : kisa.charAt(i);
  return cikti;
}

/**
 * Ham yolu normalleştirir. Dönüş: `{ yol }` (normal biçim) ya da `{ sebep }` (reddedildi: çağıran `tam` der; neden metni için).
 * Metin olmayan eleman, 1024 karakterden uzun, kontrol karakterli, mutlak, `..` bileşenli ve boş yol REDDEDİLİR.
 */
function yoluNormallestir(ham) {
  if (typeof ham !== 'string') return { sebep: 'yol bir metin değil' };
  if (ham.length > EN_UZUN_YOL) return { sebep: `yol ${EN_UZUN_YOL} karakterden uzun` };
  if (kontrolVarMi(ham)) return { sebep: 'yol kontrol karakteri (NUL, satır sonu vb.) içeriyor' };
  const duz = ham.split('\\').join('/');
  // Mutlaklık, ardışık `/` tek yapılmadan ÖNCE sorulur (`//sunucu/paylaşım` ve `\\sunucu\paylaşım` mutlaktır).
  if (duz.charAt(0) === '/' || /^[A-Za-z]:/.test(duz)) return { sebep: 'yol mutlak' };
  const parcalar = [];
  for (const parca of duz.split('/')) {
    if (parca === '' || parca === '.') continue;
    if (parca === '..') return { sebep: "yol '..' bileşeni içeriyor" };
    parcalar.push(parca);
  }
  // Boş girdi, `.`, `./`, `//` ve benzerleri buraya düşer: bir dosya yolu değildir.
  if (parcalar.length === 0) return { sebep: 'yol boş' };
  return { yol: parcalar.join('/') };
}

/** Kök desen eşleşmesi: en çok bir `*`; baş ve son birbirine BİNMEZ (`ab*ba` ↔ `aba` eşleşmez). */
function kokDeseniEslesirMi(desen, ad) {
  const yildiz = desen.indexOf('*');
  if (yildiz === -1) return ad === desen;
  const bas = desen.slice(0, yildiz);
  const son = desen.slice(yildiz + 1);
  return ad.length >= bas.length + son.length && ad.startsWith(bas) && ad.endsWith(son);
}

/** HER_ZAMAN_TAM'a girerse neden metni, girmezse null. */
function herZamanTamNedeni(yol) {
  const kokteMi = yol.indexOf('/') === -1;
  for (const girdi of HER_ZAMAN_TAM) {
    if (girdi.endsWith('/')) {
      if (yol.startsWith(girdi) || yol === girdi.slice(0, -1)) return `küresel/mekanizma yolu (${girdi})`;
    } else if (girdi.indexOf('/') !== -1) {
      // TAM YOL girdisi: yalnız birebir eşitlik (önek, sonek, alt dizin ve büyük/küçük harf farkı eşleşmez).
      if (yol === girdi) return `küresel/mekanizma dosyası (${girdi})`;
    } else if (kokteMi && kokDeseniEslesirMi(girdi, yol)) {
      return `küresel/mekanizma dosyası (${girdi})`;
    }
  }
  return null;
}

/** Kökteki `*.md`: ad nokta ile BAŞLAMAZ (gizli dosya ve çıplak `.md` değil: kabuktaki `*` baştaki noktayı eşlemez), uzantı küçük harf `.md`. */
function kokBelgeDosyasiMi(ad) {
  return ad.charAt(0) !== '.' && ad.endsWith('.md');
}

/** Yolun dar sınıfı (`belge` | `edge` | `betik`) ya da null. Yol normalleştirilmiş ve HER_ZAMAN_TAM'dan geçmiş olmalıdır. */
function darSinifBul(yol) {
  for (const sinif of Object.keys(DAR_SINIFLAR)) {
    for (const onek of DAR_SINIFLAR[sinif]) {
      if (yol.startsWith(onek)) return sinif;
    }
  }
  if (yol.indexOf('/') === -1 && kokBelgeDosyasiMi(yol)) return 'belge';
  return null;
}

/** Normalleştirilmiş tek yolun kararı: `{ sinif, sebep }` (`tam` ise sebep dolu). */
function yolSinifla(yol) {
  const tamNedeni = herZamanTamNedeni(yol);
  if (tamNedeni) return { sinif: 'tam', sebep: tamNedeni };
  const sinif = darSinifBul(yol);
  if (sinif) return { sinif, sebep: null };
  return { sinif: 'tam', sebep: 'hiçbir dar sınıfta (belge, edge, betik) değil' };
}

function tamSonuc(neden) {
  return { sinif: 'tam', siniflar: [], neden };
}

function siniflandirIc(dosyalar) {
  if (!Array.isArray(dosyalar)) return tamSonuc(['girdi bir yol dizisi değil']);
  const adet = dosyalar.length;
  if (adet === 0) return tamSonuc(['değişen dosya listesi boş: karar verilemez']);
  if (adet >= DOSYA_SINIRI) return tamSonuc([`${adet} dosya değişmiş (sınır ${DOSYA_SINIRI}): kaba sınıflama güvenilmez`]);
  const sayac = {};
  for (const sinif of Object.keys(DAR_SINIFLAR)) sayac[sinif] = 0;
  for (let i = 0; i < adet; i++) {
    const ham = dosyalar[i];
    const norm = yoluNormallestir(ham);
    const karar = norm.sebep ? { sinif: 'tam', sebep: norm.sebep } : yolSinifla(norm.yol);
    if (karar.sinif === 'tam') return tamSonuc([`'${goster(ham)}' dar sınıflarda değil: ${karar.sebep}`]);
    sayac[karar.sinif] += 1;
  }
  const siniflar = Object.keys(sayac)
    .filter((sinif) => sayac[sinif] > 0)
    .sort();
  const sinif = siniflar.length === 1 ? siniflar[0] : 'karma';
  const ozet = siniflar.map((s) => `${s} ${sayac[s]}`).join(', ');
  return { sinif, siniflar, neden: [`${adet} dosyanın tümü dar sınıflarda: ${ozet}`] };
}

/**
 * Değişen dosya yollarını sınıflar. SAF ve FIRLATMAZ: her hata, boş liste, hatalı girdi `tam`dır.
 * Dönüş: `{ sinif: 'tam'|'belge'|'edge'|'betik'|'karma', siniflar: string[] (sıralı; yalnız hepsi dar ise dolu), neden: string[] }`.
 */
function siniflandir(dosyalar) {
  try {
    return siniflandirIc(dosyalar);
  } catch (e) {
    return tamSonuc([`sınıflama sırasında beklenmeyen hata (${goster(hataMetni(e))}): güvenli tarafta tam koşu`]);
  }
}

/**
 * Çıktıya girecek tek satırlık metin (çıktı enjeksiyonuna karşı): kontrol karakteri ve satır ayracı → boşluk, `%` silinir (iş akışı komutu
 * kaçışı `%0A`), ardışık iki nokta üst üste tek olur (`::komut::`), NEDEN_AZAMI karakterde kesilir. Sıra önemlidir: `%` silme `:%:`yı `::`
 * yapabilir, bu yüzden `::` sadeleştirmesi ondan SONRA gelir.
 */
function satirTemizle(metin) {
  const kisa = metin.length > NEDEN_AZAMI ? `${metin.slice(0, NEDEN_AZAMI)}…` : metin;
  let temiz = '';
  for (let i = 0; i < kisa.length; i++) temiz += kontrolKodu(kisa.charCodeAt(i)) ? ' ' : kisa.charAt(i);
  return temiz.split('%').join('').replace(/:{2,}/g, ':');
}

/** Gerçek git: kabuk YOK (`execFileSync`), çıktı metin, sınırlı süre ve boyut. Hata (git yok, ref yok, sığ klon, zaman aşımı) FIRLATIR. */
function gercekGit(args) {
  return childProcess.execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: GIT_CIKTI_AZAMI,
    timeout: GIT_ZAMAN_ASIMI_MS,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
}

/** `git diff -z` çıktısını yollara böler. Boş çıktı = değişiklik yok. Çıktı NUL ile BİTMİYORSA kesilmiş ya da `-z`siz demektir: FIRLATIR. */
function yollariAyir(ham) {
  if (typeof ham !== 'string') throw new Error('git çıktısı metin değil');
  if (ham === '') return [];
  // Kesilmiş çıktı yolu ortadan bölebilir (`scripts/c` ← `scripts/ci/x.cjs`) ve mekanizma yolunu betik gösterirdi.
  if (!ham.endsWith('\0')) throw new Error('git çıktısı NUL ile bitmiyor (kesilmiş ya da -z yok)');
  return ham.slice(0, -1).split('\0');
}

/** Varsayılan yazıcı: `yol` null ise ekran (stdout), değilse o dosyaya EKLER (`$GITHUB_OUTPUT` başka adımların satırlarını da taşır). */
function gercekCiktiYaz(yol, metin) {
  if (yol === null) process.stdout.write(metin);
  else fs.appendFileSync(yol, metin, 'utf8');
}

/** Sonucu yazar: `$GITHUB_OUTPUT` varsa dosyaya, yoksa (ya da yazılamazsa) ekrana da anahtar satırlarıyla. FIRLATMAZ. */
function yaz(sonuc, dosya, ciktiYaz) {
  const neden = satirTemizle(sonuc.neden.join('; '));
  const satirlar = `sinif=${sonuc.sinif}\nsiniflar=${sonuc.siniflar.join(',')}\nneden=${neden}\n`;
  let ekran = `::notice::değişiklik sınıfı: ${sonuc.sinif} — ${neden}\n`;
  if (dosya === null) {
    ekran += satirlar;
  } else {
    try {
      ciktiYaz(dosya, satirlar);
    } catch (e) {
      ekran += `::warning::GITHUB_OUTPUT yazılamadı (${satirTemizle(hataMetni(e))}): sonraki adımlar sinif çıktısını göremez, tam koşu varsayılmalı\n${satirlar}`;
    }
  }
  try {
    ciktiYaz(null, ekran);
  } catch {
    /* ekran da yazılamıyorsa söylenecek başka yer yok */
  }
}

/**
 * Komut satırının çekirdeği. Enjeksiyon (testler gerçek git/ağ kullanmasın): `gitCalistir(args)` stdout METNİNİ döner, hata FIRLATIR;
 * `ciktiYaz(yol, metin)` yol null ise ekrana, değilse dosyaya yazar; `ortam` ortam değişkenleri (`GITHUB_OUTPUT`).
 * ASLA fırlatmaz; HERHANGİ bir hata (git yok, HEAD^1 yok, sığ klon, kesik çıktı, 2000+ dosya) `sinif=tam` olarak yazılır. Sonucu da döner.
 */
function calistir(secenek) {
  const { gitCalistir = gercekGit, ciktiYaz = gercekCiktiYaz, ortam = process.env } = secenek || {};
  let sonuc;
  try {
    sonuc = siniflandir(yollariAyir(gitCalistir([...GIT_ARGUMANLARI])));
  } catch (e) {
    sonuc = tamSonuc([`değişen dosyalar okunamadı (git diff HEAD^1 HEAD): ${hataMetni(e)}`]);
  }
  const dosya = ortam && typeof ortam.GITHUB_OUTPUT === 'string' && ortam.GITHUB_OUTPUT !== '' ? ortam.GITHUB_OUTPUT : null;
  yaz(sonuc, dosya, ciktiYaz);
  return sonuc;
}

/** Son sigorta: `calistir` fırlarsa bile kapı SESSİZ kalmaz (tam bildirilir) ve çıkış kodu 0 kalır. */
function sonSigorta(e) {
  try {
    const metin = `sinif=tam\nsiniflar=\nneden=${satirTemizle(`beklenmeyen hata: ${hataMetni(e)}`)}\n`;
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, metin);
    else process.stdout.write(metin);
    process.stdout.write('::notice::değişiklik sınıfı: tam — beklenmeyen hata\n');
  } catch {
    /* son sigorta da yazamıyorsa yapılacak bir şey yok; çıkış kodu 0 kalır */
  }
}

/** `calistirFn` yalnız test için enjekte edilir (`calistir`ı fırlatmaya zorlayıp son sigortayı ölçmek için). */
function main(calistirFn = calistir) {
  try {
    calistirFn();
  } catch (e) {
    sonSigorta(e);
  }
}

if (require.main === module) {
  main();
}

// `main`, `satirTemizle`, `yoluNormallestir`, `kokDeseniEslesirMi` ve sabitler YALNIZ sınanabilsin diye dışa açıktır (test: scripts/ci/__tests__/degisiklik-sinifi.test.ts).
module.exports = {
  DAR_SINIFLAR,
  DOSYA_SINIRI,
  EN_UZUN_YOL,
  HER_ZAMAN_TAM,
  NEDEN_AZAMI,
  calistir,
  kokDeseniEslesirMi,
  main,
  satirTemizle,
  siniflandir,
  yoluNormallestir,
};
