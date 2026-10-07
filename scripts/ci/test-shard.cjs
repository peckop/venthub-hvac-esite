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
 * Kullanım (ci.yml `test-shard` işi): `node scripts/ci/test-shard.cjs --shard 2 --toplam 4 --cikti "$RUNNER_TEMP/shard.json"`; ardından
 * `VENTHUB_TEST_SHARD_DOSYALARI=<cikti> pnpm test -- --run` (vitest.config.ts `include`ı o listeyle sınırlar).
 * Cetvel: docs/standards/test-karnesi-standard.md §4.2. Test: scripts/ci/__tests__/test-shard.test.ts, INV-CI-SHARD-1/2.
 */
'use strict';

const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const KOK = path.resolve(__dirname, '..', '..');
const SURE_DOSYASI = path.join(__dirname, 'test-sureleri.json');
const ORTAM_ADI = 'VENTHUB_TEST_SHARD_DOSYALARI';
const EN_FAZLA_SHARD = 32;
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

function argumanlar(argv) {
  const s = { shard: null, toplam: null, cikti: null };
  for (let i = 0; i < argv.length; i += 2) {
    const ad = argv[i];
    const deger = argv[i + 1];
    if (!['--shard', '--toplam', '--cikti'].includes(ad) || deger === undefined) throw new Error(`geçersiz argüman: ${JSON.stringify(ad)} (--shard N --toplam M --cikti DOSYA)`);
    s[ad.slice(2)] = deger;
  }
  if (!/^\d+$/.test(String(s.shard)) || !/^\d+$/.test(String(s.toplam)) || !s.cikti) throw new Error('--shard, --toplam (tam sayı) ve --cikti zorunlu');
  return { shard: Number(s.shard), toplam: Number(s.toplam), cikti: s.cikti };
}

/** Komut satırı çekirdeği. `g` test için enjekte edilir. Dönüş: çıkış kodu (0 yeşil, 1 kırmızı). ASLA sessizce başarısız olmaz. */
function main(argv = process.argv.slice(2), g = {}) {
  const { listele = vitestListesi, sureOku = sureleriOku, yaz = fs.writeFileSync, log = (m) => process.stdout.write(`${m}\n`) } = g;
  try {
    const { shard, toplam, cikti } = argumanlar(argv);
    if (shard < 1 || shard > toplam) throw new Error(`--shard ${shard}, 1..${toplam} aralığında olmalı`);
    const sure = sureOku();
    const dosyalar = listele();
    const { gruplar, yuk } = dagit(dosyalar, sure, toplam);
    const benim = gruplar[shard - 1];
    if (benim.length === 0) throw new Error(`shard ${shard}/${toplam} BOŞ (${dosyalar.length} dosya): bölme geçersiz`);
    yaz(cikti, `${JSON.stringify(benim)}\n`);
    const ort = yuk.reduce((a, b) => a + b, 0) / toplam;
    log(`::notice::test shard ${shard}/${toplam}: ${benim.length} dosya, ağırlık ${yuk[shard - 1].toFixed(1)} sn (tüm shard'lar: ${yuk.map((y) => y.toFixed(0)).join(' / ')}; en yüklü/ortalama ${(Math.max(...yuk) / ort).toFixed(2)}; toplam ${dosyalar.length} dosya)`);
    return 0;
  } catch (e) {
    log(`::error::test shard dağıtımı BAŞARISIZ: ${String(e && e.message ? e.message : e).replace(/[\r\n]+/g, ' ').slice(0, 300)}`);
    return 1;
  }
}

if (require.main === module) process.exitCode = main();

module.exports = { EN_FAZLA_SHARD, ORTAM_ADI, argumanlar, dagit, globKacir, main, ortamdanInclude, sureleriOku, vitestListesi, yoluNormallestir };
