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
 *   dislan  listedeki testler DIŞARIDA. Yalnız `pull_request` olayında `ci` işinin Test adımı böyle koşar.
 *   yalniz  YALNIZ listedeki testler. Zamanlı iş akışı (`dunya-durumu.yml`) böyle koşar.
 *   Geçersiz değer FIRLATIR (sessizce "tam"a düşmez): yanlış yazılmış bir kip kapıyı gizlice kaldırırdı.
 *
 * Kullanım (kütüphane): const { ayar } = require('./scripts/ci/dunya-durumu.cjs');
 * Kullanım (komut):     node scripts/ci/dunya-durumu.cjs [--kip dislan|yalniz|tam] [--json]
 */
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const KOK = path.resolve(__dirname, '..', '..');
const LISTE_YOLU = 'scripts/ci/dunya-durumu-testleri.json';
const ORTAM_ADI = 'VENTHUB_DUNYA_DURUMU';
const KIPLER = ['dislan', 'yalniz'];
const YENI_YERLER = ['master-push', 'zamanli'];
const TEST_DESENI = /\.(test|spec)\.(ts|tsx|js|cjs|mjs)$/;

function listeyiOku(kok = KOK) {
  return JSON.parse(fs.readFileSync(path.join(kok, LISTE_YOLU), 'utf8'));
}

/** Listeyi doğrular; hataları metin listesi olarak döner (boş = geçerli). `dosyaVarMi` test için enjekte edilir. */
function dogrula(liste, dosyaVarMi = (yol) => fs.existsSync(path.join(KOK, yol))) {
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
    if (gorulen.has(t.test)) hatalar.push(`${ad}: tekrar`);
    gorulen.add(t.test);
    if (!dosyaVarMi(t.test)) hatalar.push(`${ad}: dosya yok (listede yetim kayıt)`);
    for (const alan of ['neden', 'kanit']) {
      if (typeof t[alan] !== 'string' || t[alan].trim().length < 20) hatalar.push(`${ad}: ${alan} en az 20 karakterlik gerekçe taşımalı`);
    }
    if (!Array.isArray(t.yeniYer) || t.yeniYer.length === 0) hatalar.push(`${ad}: yeniYer boş (çıkan kapının yeni yeri yazılı olmalı)`);
    else for (const y of t.yeniYer) if (!YENI_YERLER.includes(y)) hatalar.push(`${ad}: yeniYer "${y}" geçersiz (${YENI_YERLER.join(' | ')})`);
    if (Array.isArray(t.yeniYer) && !t.yeniYer.includes('zamanli')) {
      hatalar.push(`${ad}: yeniYer "zamanli" içermeli (master push koşuları concurrency ile iptal edilir; zamanlı koşu asıl güvencedir)`);
    }
  });
  return hatalar;
}

/** Ortam değişkenine göre vitest'e verilecek ayar. Geçersiz kip FIRLATIR. */
function ayar(env = process.env, liste = listeyiOku()) {
  const kip = env[ORTAM_ADI] || '';
  if (kip === '' || kip === 'tam') return { kip: 'tam', exclude: [], include: null };
  if (!KIPLER.includes(kip)) {
    throw new Error(`${ORTAM_ADI}="${kip}" geçersiz (boş | tam | ${KIPLER.join(' | ')}); kapı sessizce kalkmasın diye durduruldu`);
  }
  const yollar = liste.testler.map((t) => t.test);
  return kip === 'dislan' ? { kip, exclude: yollar, include: null } : { kip, exclude: [], include: yollar };
}

module.exports = { KOK, LISTE_YOLU, ORTAM_ADI, KIPLER, YENI_YERLER, TEST_DESENI, ayar, dogrula, listeyiOku };

if (require.main === module) {
  const a = process.argv.slice(2);
  const i = a.indexOf('--kip');
  const env = i > -1 ? { [ORTAM_ADI]: a[i + 1] } : process.env;
  const liste = listeyiOku();
  const hatalar = dogrula(liste);
  if (hatalar.length) {
    process.stderr.write(`[dunya-durumu] liste GEÇERSİZ:\n  - ${hatalar.join('\n  - ')}\n`);
    process.exit(1);
  }
  const r = ayar(env, liste);
  if (a.includes('--json')) process.stdout.write(`${JSON.stringify(r, null, 1)}\n`);
  else process.stdout.write(`kip=${r.kip} dışarıda=${r.exclude.length} yalnız=${r.include ? r.include.length : '-'}\n`);
}
