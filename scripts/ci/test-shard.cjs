#!/usr/bin/env node
/**
 * ALT-38c-2 · TEST SHARD DAĞITICISI — test dosyalarını N paralel işe SÜREYE göre dengeli, belirlenimci ve KAPSAMI KANITLI dağıtır.
 *
 * NİÇİN: `ci`nin Test adımı tek işte ~4:30-6:30 sürüyor (dosya okuyan conformance kapıları süre payının %90'ı; ölçüm:
 * docs/audits/ci-test-olcum-2026-10-06.md). Vitest'in `--shard=i/N`'i dosya SAYISINA böler; tek dosya 130 sn'lik (yerel) kanca testleri olduğundan
 * dengesiz kalır. Burada her test dosyası bilinen süresiyle (scripts/ci/test-sureleri.json) en az yüklü shard'a atanır (LPT: en uzun önce).
 *
 * GÜVENLİK YÖNÜ (kapsam kaybı sıfır): dosya listesi `vitest list --filesOnly` çıktısıdır (koşan paketin KENDİ listesi, `dislan` kipi dahil);
 * her dosya TAM BİR shard'a girer (parçalar ayrık ve birleşimi liste); süresi bilinmeyen (yeni) dosya varsayılan ağırlıkla dağıtılır, hiçbir dosya
 * "satırı yok" diye düşmez. Aynı girdi (aynı commit, aynı N) HER shard işinde aynı bölmeyi üretir: iş başına ayrı hesap, ortak durum yok.
 * Boş liste, depo dışı yol, tekrar, geçersiz N ve her hata KIRMIZI (çıkış 1): sessizce "hiçbir şey koşmadı" yeşili olmaz.
 *
 * Kullanım (ci.yml `test-shard` işi): `node scripts/ci/test-shard.cjs --shard 2 --toplam 4 --cikti "$RUNNER_TEMP/shard.json" [--secim L --secim-tam T --secim-sayi N]`;
 * ardından `VENTHUB_TEST_SHARD_DOSYALARI=<cikti> pnpm test -- --run` (vitest.config.ts `include`ı o listeyle sınırlar).
 * Cetvel: docs/standards/test-karnesi-standard.md §4.2 ve §4.3. Test: scripts/ci/__tests__/test-shard.test.ts, test-shard-secim.test.ts, INV-CI-SHARD-1/2, INV-CI-SECIM-1/2.
 *
 * TEST SEÇİMİ (ALT-38e, §4.3): `--secim` grubu verilirse ve seçici çıktısı baştan sona tutarlıysa (`tam=false`, sayı = dosyadaki satır sayısı, yollar geçerli ve diskte var,
 * seçilen her dosya `vitest list`te) `vitest list` yerine SEÇİLEN dosyalar aynı LPT ile dağıtılır. Seçim YALNIZ DARALTIR: tutarsızlık, okunamayan dosya, `tam=true` ya da eksik değer
 * HER ZAMAN tam dağıtımdır (uyarıyla). Seçim modunda boş parça meşrudur (`kos=false`); tam modda boş parça kırmızıdır. Boş seçimde `vitest list` ÇAĞRILMAZ (kurulum atlanmış olabilir).
 */
'use strict';

const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const KOK = path.resolve(__dirname, '..', '..');
const SURE_DOSYASI = path.join(__dirname, 'test-sureleri.json');
const ORTAM_ADI = 'VENTHUB_TEST_SHARD_DOSYALARI';
const EN_FAZLA_SHARD = 32;
/** Seçici çıktısını taşıyan argüman grubu (ALT-38e): liste dosyası, `$GITHUB_OUTPUT`taki `tam` ve `secilen-sayisi` değerleri. Üçü birlikte verilir. */
const SECIM_ARGUMANLARI = Object.freeze(['--secim', '--secim-tam', '--secim-sayi']);
/** picomatch özel karakterleri: yol düz metin olarak eşleşsin diye kaçırılır (`(site)` gibi bir klasör grup sayılmasın). */
const GLOB_OZEL = /[\\*?[\]{}()!+@]/g;

const karsilastir = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/** `include` deseni olarak yolun DÜZ METİN karşılığı. */
function globKacir(yol) {
  return String(yol).replace(GLOB_OZEL, '\\$&');
}

/** Süre dosyasını doğrulayarak okur; bozuksa FIRLATIR (sessizce varsayılana düşen bir ağırlık dengeyi gizlice bozar). */
function sureleriOku(dosya = SURE_DOSYASI) {
  const ham = JSON.parse(fs.readFileSync(dosya, 'utf8'));
  if (!ham || typeof ham !== 'object' || !ham.sureler || typeof ham.sureler !== 'object' || Array.isArray(ham.sureler)) {
    throw new Error(`${path.basename(dosya)}: "sureler" nesne olmalı`);
  }
  if (!Number.isFinite(ham.varsayilan_sn) || ham.varsayilan_sn <= 0) throw new Error(`${path.basename(dosya)}: "varsayilan_sn" pozitif sayı olmalı`);
  for (const [yol, sn] of Object.entries(ham.sureler)) {
    if (!Number.isFinite(sn) || sn < 0) throw new Error(`${path.basename(dosya)}: "${yol}" süresi geçersiz (${JSON.stringify(sn)})`);
  }
  return { sureler: new Map(Object.entries(ham.sureler)), varsayilan: ham.varsayilan_sn };
}

/** Mutlak ya da göreli yolu depo köküne GÖRELİ POSIX yola çevirir; kök dışı, `..` içeren ve boş yol FIRLATIR. */
function yoluNormallestir(yol, kok = KOK) {
  // `vitest list` kaydında `file` yoksa `String(undefined)` "undefined" adlı geçerli bir göreli yol olurdu: metin olmayan girdi sessizce yol sayılmaz.
  if (typeof yol !== 'string') throw new Error(`test yolu metin olmalı (verilen ${JSON.stringify(yol) ?? String(yol)})`);
  const s = yol.replace(/\\/g, '/');
  const kokS = `${String(kok).replace(/\\/g, '/').replace(/\/+$/, '')}/`;
  const rel = s.toLowerCase().startsWith(kokS.toLowerCase()) ? s.slice(kokS.length) : s;
  if (rel === '' || rel.startsWith('/') || /^[A-Za-z]:/.test(rel) || rel.split('/').includes('..') || rel.split('/').includes('')) {
    throw new Error(`test yolu depo kökü altında değil ya da geçersiz: ${JSON.stringify(yol)}`);
  }
  return rel;
}

/**
 * Dosyaları `toplam` gruba dağıtır (LPT: ağırlığa göre azalan, eşitlikte yol sırası; her dosya en az yüklü gruba, eşitlikte en küçük numaraya).
 * Dönüş: `{ gruplar: string[][] (her biri yol sıralı), yuk: number[] }`. Belirlenimcidir: girdi sırasına bağlı DEĞİL.
 */
function dagit(dosyalar, sure, toplam) {
  if (!Number.isInteger(toplam) || toplam < 1 || toplam > EN_FAZLA_SHARD) throw new Error(`shard sayısı 1..${EN_FAZLA_SHARD} arası tam sayı olmalı (verilen ${JSON.stringify(toplam)})`);
  if (!Array.isArray(dosyalar)) throw new Error('dosya listesi dizi olmalı');
  if (new Set(dosyalar).size !== dosyalar.length) throw new Error('dosya listesinde tekrar eden yol var');
  const agirlik = (d) => (sure.sureler.has(d) ? sure.sureler.get(d) : sure.varsayilan);
  const sirali = [...dosyalar].sort((a, b) => agirlik(b) - agirlik(a) || karsilastir(a, b));
  const yuk = new Array(toplam).fill(0);
  const gruplar = Array.from({ length: toplam }, () => []);
  for (const d of sirali) {
    let k = 0;
    for (let i = 1; i < toplam; i++) if (yuk[i] < yuk[k]) k = i;
    gruplar[k].push(d);
    yuk[k] += agirlik(d);
  }
  return { gruplar: gruplar.map((g) => g.sort(karsilastir)), yuk };
}

/** `vitest list --filesOnly --json` çıktısındaki test dosyaları (koşan paketin kendi listesi), depo köküne göreli ve yol sıralı. */
function vitestListesi(kok = KOK, ortam = process.env) {
  const env = { ...ortam };
  delete env[ORTAM_ADI];
  for (const k of Object.keys(env)) if (k.startsWith('VITEST')) delete env[k];
  let cikti;
  try {
    cikti = cp.execFileSync(process.execPath, [path.join(kok, 'node_modules', 'vitest', 'vitest.mjs'), 'list', '--filesOnly', '--json'], {
      cwd: kok,
      env,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120000,
      windowsHide: true,
    });
  } catch (e) {
    throw new Error(`vitest list çalışmadı: ${String(e && e.stderr ? e.stderr : e && e.message).trim().slice(0, 300)}`);
  }
  const liste = JSON.parse(cikti);
  if (!Array.isArray(liste) || liste.length === 0) throw new Error('vitest list boş döndü: hiç test dosyası bulunamadı');
  const yollar = liste.map((x) => yoluNormallestir(x && x.file, kok));
  return [...new Set(yollar)].sort(karsilastir);
}

/** vitest.config.ts için: `VENTHUB_TEST_SHARD_DOSYALARI` doluysa o JSON listeyi doğrulayıp `include` desenlerine çevirir; boşsa null. FIRLATIR: bozuk liste sessizce tam pakete düşmez. */
function ortamdanInclude(ortam = process.env) {
  const yol = ortam[ORTAM_ADI];
  if (!yol) return null;
  const liste = JSON.parse(fs.readFileSync(yol, 'utf8'));
  if (!Array.isArray(liste) || liste.length === 0) throw new Error(`${ORTAM_ADI}: boş ya da dizi değil (${yol})`);
  return liste.map((d) => globKacir(yoluNormallestir(d)));
}

/**
 * Argümanlar: `--shard N --toplam M --cikti DOSYA` ve İSTEĞE BAĞLI seçim grubu `--secim DOSYA --secim-tam DEGER --secim-sayi DEGER` (ALT-38e; üçü BİRLİKTE ya da hiçbiri).
 * Seçim grubu verilmezse dönüşte `secim` anahtarı YOKTUR (eski çağıranlar ve testler aynen çalışır).
 */
function argumanlar(argv) {
  const s = { shard: null, toplam: null, cikti: null };
  const secim = {};
  for (let i = 0; i < argv.length; i += 2) {
    const ad = argv[i];
    const deger = argv[i + 1];
    if (!['--shard', '--toplam', '--cikti', ...SECIM_ARGUMANLARI].includes(ad) || deger === undefined) {
      throw new Error(`geçersiz argüman: ${JSON.stringify(ad)} (--shard N --toplam M --cikti DOSYA [--secim DOSYA --secim-tam DEGER --secim-sayi DEGER])`);
    }
    if (SECIM_ARGUMANLARI.includes(ad)) secim[ad.slice('--secim'.length + 1) || 'dosya'] = deger;
    else s[ad.slice(2)] = deger;
  }
  if (!/^\d+$/.test(String(s.shard)) || !/^\d+$/.test(String(s.toplam)) || !s.cikti) throw new Error('--shard, --toplam (tam sayı) ve --cikti zorunlu');
  const sonuc = { shard: Number(s.shard), toplam: Number(s.toplam), cikti: s.cikti };
  if (Object.keys(secim).length > 0) {
    if (Object.keys(secim).length !== SECIM_ARGUMANLARI.length) throw new Error('--secim, --secim-tam ve --secim-sayi BİRLİKTE verilir (seçici çıktısı eksik okunmasın)');
    sonuc.secim = { dosya: secim.dosya, tam: secim.tam, sayi: secim.sayi };
  }
  return sonuc;
}

/**
 * SEÇİCİ ÇIKTISINI doğrular (ALT-38e). Seçim YALNIZ DARALTIR: seçici tam demedikçe ve çıktısı baştan sona tutarlı olmadıkça `tam` (tüm paket) döner.
 * Seçim modu için HEPSİ gerekir: `tam` harfi harfine `false`, seçilen sayısı geçerli bir tam sayı, liste dosyası okunur ve satır sayısı o sayıya eşit,
 * her yol depo köküne göreli geçerli yol, tekrar yok, her dosya diskte var. Biri tutmazsa `{ mod: 'tam', neden }`; FIRLATMAZ.
 * Dönüş: `{ mod: 'secim', dosyalar }` (sıralı, tekil) ya da `{ mod: 'tam', neden }`.
 */
function secimiCoz(girdi, g = {}) {
  try {
    return secimiCozIc(girdi || {}, g);
  } catch (e) {
    return { mod: 'tam', neden: `seçim doğrulanırken beklenmeyen hata (${String(e && e.message ? e.message : e).slice(0, 120)})` };
  }
}

function secimiCozIc({ dosya, tam, sayi }, { oku = fs.readFileSync, varMi = fs.existsSync, kok = KOK }) {
  const tamKarar = (neden) => ({ mod: 'tam', neden });
  // Seçicinin KENDİ kararı `tam` (küresel dosya, harita bayat...) MEŞRU bir sonuçtur (`mesru: true`): uyarı değil bilgi olarak bildirilir. Öteki her tam, çıktı tutarsızlığıdır ve UYARI verir.
  if (tam === 'true') return { mod: 'tam', neden: 'seçici tam dedi', mesru: true };
  if (tam !== 'false') return tamKarar(`seçici çıktısı yok ya da anlaşılamadı (tam=${JSON.stringify(String(tam).slice(0, 20))})`);
  if (!/^(?:0|[1-9]\d{0,5})$/.test(String(sayi))) return tamKarar(`seçilen sayısı geçersiz (${JSON.stringify(String(sayi).slice(0, 20))})`);
  let metin;
  try {
    metin = String(oku(dosya, 'utf8'));
  } catch {
    return tamKarar('seçim dosyası okunamadı');
  }
  const satirlar = metin.split('\n').map((s) => s.replace(/\r$/, '')).filter((s) => s !== '');
  if (satirlar.length !== Number(sayi)) return tamKarar(`seçici ${sayi} test dedi, dosyada ${satirlar.length} satır var`);
  const yollar = [];
  try {
    for (const s of satirlar) yollar.push(yoluNormallestir(s, kok));
  } catch (e) {
    return tamKarar(`geçersiz test yolu (${String(e && e.message ? e.message : e).slice(0, 120)})`);
  }
  if (new Set(yollar).size !== yollar.length) return tamKarar('seçimde tekrar eden yol var');
  const yok = yollar.filter((y) => !varMi(path.join(kok, y)));
  if (yok.length > 0) return tamKarar(`seçilen ${yok.length} dosya diskte yok (örn. ${yok[0]})`);
  return { mod: 'secim', dosyalar: yollar.sort(karsilastir) };
}

const tekSatir = (m) => String(m).replace(/[\r\n]+/g, ' ').slice(0, 300);

/**
 * Hangi dosya kümesinin dağıtılacağı: seçim geçerliyse SEÇİLEN (vitest listesiyle tutarlıysa), değilse `vitest list`in tamamı.
 * Seçim modunda seçilenin her dosyası vitest'in kendi listesinde OLMALIDIR: olmayan varsa seçici ile vitest ayrışmıştır, şüphede TAM.
 * Boş seçimde `vitest list` ÇAĞRILMAZ (kurulum atlanmış olabilir). Dönüş: `{ dosyalar, mod: 'secim'|'tam', uyari?: string, bilgi?: string }`:
 * `bilgi` seçicinin KENDİ `tam` kararı (meşru), `uyari` çıktı tutarsızlığı ya da seçici-vitest ayrışmasıdır (`::warning::`).
 */
function kumeyiBelirle(secim, listele, secimGirdisi) {
  if (!secim) return { dosyalar: listele(), mod: 'tam' };
  const karar = secimiCoz(secim, secimGirdisi);
  if (karar.mod === 'tam') {
    const mesaj = `seçim kullanılmadı, TAM paket dağıtılıyor: ${karar.neden}`;
    return karar.mesru ? { dosyalar: listele(), mod: 'tam', bilgi: mesaj } : { dosyalar: listele(), mod: 'tam', uyari: mesaj };
  }
  if (karar.dosyalar.length === 0) return { dosyalar: [], mod: 'secim' };
  const liste = listele();
  const bilinen = new Set(liste);
  const yabanci = karar.dosyalar.filter((d) => !bilinen.has(d));
  if (yabanci.length > 0) return { dosyalar: liste, mod: 'tam', uyari: `seçim kullanılmadı, TAM paket dağıtılıyor: seçilen ${yabanci.length} dosya vitest listesinde yok (örn. ${yabanci[0]})` };
  return { dosyalar: karar.dosyalar, mod: 'secim' };
}

/**
 * Komut satırı çekirdeği. `g` test için enjekte edilir. Dönüş: çıkış kodu (0 yeşil, 1 kırmızı). ASLA sessizce başarısız olmaz.
 * TAM modda boş parça KIRMIZIDIR (bölme geçersiz). SEÇİM modunda (`--secim` grubu geçerliyse) boş parça meşrudur: seçilen az olabilir; o zaman parça `[]` yazılır,
 * `kos=false` çıktısı verilir ve ci.yml o parçada vitest koşturmaz. `$GITHUB_OUTPUT`a `kos=true|false` YALNIZ `--secim` grubu verildiyse yazılır.
 */
function main(argv = process.argv.slice(2), g = {}) {
  const { listele = vitestListesi, sureOku = sureleriOku, yaz = fs.writeFileSync, log = (m) => process.stdout.write(`${m}\n`), ortam = process.env, ekle = fs.appendFileSync, secimGirdisi = {} } = g;
  try {
    const { shard, toplam, cikti, secim } = argumanlar(argv);
    if (shard < 1 || shard > toplam) throw new Error(`--shard ${shard}, 1..${toplam} aralığında olmalı`);
    const sure = sureOku();
    const { dosyalar, mod, uyari, bilgi } = kumeyiBelirle(secim, listele, secimGirdisi);
    if (uyari) log(`::warning::test shard: ${tekSatir(uyari)}`);
    if (bilgi) log(`::notice::test shard: ${tekSatir(bilgi)}`);
    const { gruplar, yuk } = dagit(dosyalar, sure, toplam);
    const benim = gruplar[shard - 1];
    if (benim.length === 0 && mod === 'tam') throw new Error(`shard ${shard}/${toplam} BOŞ (${dosyalar.length} dosya): bölme geçersiz`);
    yaz(cikti, `${JSON.stringify(benim)}\n`);
    if (secim) kosCiktisiniYaz(benim.length > 0, ortam, ekle, log);
    if (benim.length === 0) {
      log(`::notice::test shard ${shard}/${toplam} (seçim): bu parçaya test düşmedi (seçilen ${dosyalar.length} dosya); vitest koşmaz, iş yeşil biter`);
      return 0;
    }
    const ort = yuk.reduce((a, b) => a + b, 0) / toplam;
    const etiket = mod === 'secim' ? ' (seçim)' : '';
    log(`::notice::test shard ${shard}/${toplam}${etiket}: ${benim.length} dosya, ağırlık ${yuk[shard - 1].toFixed(1)} sn (tüm shard'lar: ${yuk.map((y) => y.toFixed(0)).join(' / ')}; en yüklü/ortalama ${(Math.max(...yuk) / ort).toFixed(2)}; toplam ${dosyalar.length} dosya)`);
    return 0;
  } catch (e) {
    log(`::error::test shard dağıtımı BAŞARISIZ: ${tekSatir(e && e.message ? e.message : e)}`);
    return 1;
  }
}

/** `kos=true|false` (ci.yml: Test adımının `if`i bunu okur; `false` dışındaki her değer ve çıktı yokluğu testi KOŞTURUR). Yazılamazsa uyarı: çıktı yoksa Test koşar (güvenli yön). */
function kosCiktisiniYaz(kos, ortam, ekle, log) {
  const dosya = ortam && typeof ortam.GITHUB_OUTPUT === 'string' && ortam.GITHUB_OUTPUT !== '' ? ortam.GITHUB_OUTPUT : null;
  if (!dosya) return;
  try {
    ekle(dosya, `kos=${kos}\n`);
  } catch (e) {
    log(`::warning::test shard: GITHUB_OUTPUT yazılamadı (${tekSatir(e && e.message ? e.message : e)}); sonraki adım testi koşturur`);
  }
}

if (require.main === module) process.exitCode = main();

module.exports = { EN_FAZLA_SHARD, ORTAM_ADI, SECIM_ARGUMANLARI, argumanlar, dagit, globKacir, kumeyiBelirle, main, ortamdanInclude, secimiCoz, sureleriOku, vitestListesi, yoluNormallestir };
