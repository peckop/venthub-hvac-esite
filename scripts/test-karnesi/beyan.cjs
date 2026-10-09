#!/usr/bin/env node
/**
 * ALT-38 · TEST BEYANI — "her test neyi değişince koşacağını (TETİK) ve nerede koşacağını (YER) kendisi söyler".
 *
 * NİÇİN: test karnesinin 8. sorusu "bu test neyi değişince koşmalı?"dır (OPS, 2026-10-06; Recep sorusu: "kapıları
 * oluşturuyoruz, bu kapılar yine çalışacak mı, test süresini yakacak mı?"). Eski testler için cevap statik taramadan
 * (`statik.cjs`, okunan yollar) çıkarılır; YENİ her test cevabını başlık yorumunda KENDİSİ yazar. Beyansız yeni test
 * birleşmez (`INV-TEST-BEYAN-1`, `src/__tests__/conformance/test-beyan-kapisi.test.ts`).
 *
 * BİÇİM (test dosyasının ilk 80 satırında, yorum içinde; iki satır):
 *   TETİK: src/lib/pricing/**, docs/standards/pricing-standard.md
 *   YER: PR
 * · TETİK: virgül ya da noktalı virgülle ayrılmış yol/glob listesi. Her öğe depoda en az bir İZLENEN dosyayla eşleşmek
 *   ZORUNDA (yazım hatası testi sessizce hiç seçilmez hâle getirmesin). `*` = "her değişiklikte koşar" (bilmiyorsan bunu yaz).
 *   Dizin öğesi (`docs/standards/`) altındaki her dosyayı kapsar; `**` her derinliği, `*` tek yol parçasını eşler.
 * · YER: `PR` (pull request kapısında koşar) ya da `zamanlı` (PR kapısından çıkarılmıştır; master push + zamanlı koşuda
 *   koşar; `scripts/ci/dunya-durumu-testleri.json` listesinde OLMAK ZORUNDA). `YER` ile gerçek yer çelişirse kırmızı.
 *
 * TABAN (mandal): bu kapı yazıldığı gün var olan ve beyanı olmayan test dosyaları `beyan-tabani.json`dadır; yeni dosya
 * tabana EKLENEMEZ (sayı tavanı testte sabittir, artırmak görünür bir diff'tir), beyanı yazılan dosya tabandan ÇIKARILMAK
 * ZORUNDADIR. Böylece liste yalnız küçülür.
 *
 * Kullanım:
 *   node scripts/test-karnesi/beyan.cjs                 # depoyu denetle (hata varsa çıkış 1)
 *   node scripts/test-karnesi/beyan.cjs --tabani-yaz    # beyanı olmayan mevcut testlerle tabanı yeniden yaz
 */
'use strict';

const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const KOK = path.resolve(__dirname, '..', '..');
const TEST_DESENI = /\.(test|spec)\.(ts|tsx|js|cjs|mjs)$/;
const TABAN_YOLU = 'scripts/test-karnesi/beyan-tabani.json';
const DUNYA_LISTESI = 'scripts/ci/dunya-durumu-testleri.json';
const BASLIK_SATIRI = 80;
const YERLER = new Map([
  ['pr', 'PR'],
  ['zamanlı', 'zamanli'],
  ['zamanli', 'zamanli'],
]);

/** Test dosyasının başlığından beyanı okur. Dönüş: { tetik: string[]|null, yer: 'PR'|'zamanli'|null, hatalar: string[] }. */
function beyanOku(metin) {
  const satirlar = String(metin).split(/\r?\n/).slice(0, BASLIK_SATIRI);
  const hatalar = [];
  let tetik = null;
  let yer = null;
  for (const satir of satirlar) {
    const t = /^\s*(?:\/\*+|\*|\/\/)?\s*TET[İIi]K\s*:\s*(.*?)\s*(?:\*\/)?\s*$/.exec(satir);
    if (t) {
      if (tetik !== null) hatalar.push('TETİK satırı birden çok kez yazılmış');
      const ogeler = t[1].split(/\s*[,;]\s*/).map((x) => x.trim()).filter(Boolean);
      if (!ogeler.length) hatalar.push('TETİK satırı boş');
      else tetik = ogeler;
      continue;
    }
    const y = /^\s*(?:\/\*+|\*|\/\/)?\s*YER\s*:\s*(.*?)\s*(?:\*\/)?\s*$/.exec(satir);
    if (y) {
      if (yer !== null) hatalar.push('YER satırı birden çok kez yazılmış');
      const norm = YERLER.get(y[1].trim().toLocaleLowerCase('tr'));
      if (!norm) hatalar.push(`YER değeri geçersiz: "${y[1].trim().slice(0, 30)}" (PR | zamanlı)`);
      else yer = norm;
    }
  }
  if (tetik === null && !hatalar.some((h) => h.startsWith('TETİK'))) hatalar.push('TETİK satırı yok');
  if (yer === null && !hatalar.some((h) => h.startsWith('YER'))) hatalar.push('YER satırı yok');
  for (const o of tetik || []) {
    if (o !== '*' && /\s/.test(o)) hatalar.push(`TETİK öğesinde boşluk var: "${o.slice(0, 40)}" (virgülle ayır)`);
    if (o !== '*' && (o.startsWith('/') || o.includes('..'))) hatalar.push(`TETİK öğesi depo içi göreli yol olmalı: "${o.slice(0, 40)}"`);
  }
  return { tetik, yer, hatalar };
}

/** glob → RegExp: `**` her derinlik, `*` tek yol parçası, `?` tek karakter. */
function globRegex(glob) {
  let s = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        s += '.*';
        i += 1;
        if (glob[i + 1] === '/') i += 1;
      } else s += '[^/]*';
    } else if (c === '?') s += '[^/]';
    else s += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${s}$`);
}

/** Bir TETİK öğesi izlenen dosyalardan en az biriyle eşleşiyor mu? (`*` her zaman). */
function ogeEslesir(oge, dosyalar) {
  if (oge === '*') return true;
  const dizin = oge.endsWith('/') ? oge : `${oge}/`;
  const re = globRegex(oge.endsWith('/') ? `${oge}**` : oge);
  return dosyalar.some((d) => d === oge || d.startsWith(dizin) || re.test(d));
}

/**
 * Denetim (saf): { dosyalar: izlenen dosya yolları, oku: yol → metin, taban: string[], dunya: string[], tavan: sayı }.
 * Dönüş: { hatalar: string[], ozet: { test, beyanli, tabanda } }.
 */
function denetle({ dosyalar, oku, taban, dunya, tavan }) {
  const hatalar = [];
  const testler = dosyalar.filter((d) => TEST_DESENI.test(d));
  const testKumesi = new Set(testler);
  const tabanKumesi = new Set(taban);
  const dunyaKumesi = new Set(dunya);
  let beyanli = 0;

  if (typeof tavan === 'number' && taban.length > tavan) {
    hatalar.push(`taban ${taban.length} kayıt, tavan ${tavan}: tabana yeni dosya EKLENEMEZ (beyanı yaz)`);
  }
  for (const t of taban) {
    if (!testKumesi.has(t)) hatalar.push(`${t}: tabanda ama depoda test dosyası değil (yetim kayıt; tabandan çıkar)`);
  }
  for (const t of testler) {
    const b = beyanOku(oku(t));
    const gecerli = b.hatalar.length === 0;
    if (gecerli) beyanli += 1;
    if (tabanKumesi.has(t)) {
      if (gecerli) hatalar.push(`${t}: beyanı VAR, tabandan çıkarılmalı (taban yalnız küçülür)`);
      continue;
    }
    if (!gecerli) {
      hatalar.push(`${t}: TETİK/YER beyanı eksik ya da hatalı → ${b.hatalar.join('; ')} (biçim: scripts/test-karnesi/beyan.cjs başlığı)`);
      continue;
    }
    for (const o of b.tetik) {
      if (!ogeEslesir(o, dosyalar)) hatalar.push(`${t}: TETİK öğesi hiçbir izlenen dosyayla eşleşmiyor: "${o}" (yazım hatası? test sessizce hiç seçilmez)`);
    }
    const listede = dunyaKumesi.has(t);
    if (listede && b.yer !== 'zamanli') hatalar.push(`${t}: dünya durumu listesinde (PR kapısından çıkmış) ama YER: ${b.yer}`);
    if (!listede && b.yer === 'zamanli') hatalar.push(`${t}: YER: zamanlı yazıyor ama ${DUNYA_LISTESI} içinde YOK (PR kapısında koşuyor)`);
  }
  return { hatalar, ozet: { test: testler.length, beyanli, tabanda: taban.length } };
}

function depoGirdisi(kok = KOK) {
  const dosyalar = cp
    .execFileSync('git', ['ls-files'], { cwd: kok, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
    .split('\n')
    .filter(Boolean);
  const oku = (d) => fs.readFileSync(path.join(kok, d), 'utf8');
  const tabanYolu = path.join(kok, TABAN_YOLU);
  const taban = fs.existsSync(tabanYolu) ? JSON.parse(fs.readFileSync(tabanYolu, 'utf8')).testler || [] : [];
  const dunyaYolu = path.join(kok, DUNYA_LISTESI);
  const dunya = fs.existsSync(dunyaYolu) ? (JSON.parse(fs.readFileSync(dunyaYolu, 'utf8')).testler || []).map((t) => t.test) : [];
  return { dosyalar, oku, taban, dunya };
}

/** Tabanı yeniden yazar: beyanı olmayan her mevcut test dosyası (sıralı). */
function tabaniYaz(kok = KOK) {
  const { dosyalar, oku } = depoGirdisi(kok);
  const testler = dosyalar.filter((d) => TEST_DESENI.test(d)).sort();
  const beyansiz = testler.filter((t) => beyanOku(oku(t)).hatalar.length > 0);
  const yol = path.join(kok, TABAN_YOLU);
  fs.writeFileSync(
    yol,
    `${JSON.stringify(
      {
        surum: 1,
        aciklama:
          'ALT-38 TEST BEYANI TABANI (mandal): bu listede olmayan her test dosyası başlığında TETİK ve YER beyan eder (INV-TEST-BEYAN-1). Liste yalnız KÜÇÜLÜR: beyanı yazılan dosya buradan çıkarılır, yeni dosya eklenemez.',
        uretildi: new Date().toISOString().slice(0, 10),
        testler: beyansiz,
      },
      null,
      1,
    )}\n`,
  );
  return beyansiz.length;
}

module.exports = { TEST_DESENI, TABAN_YOLU, DUNYA_LISTESI, YERLER, beyanOku, globRegex, ogeEslesir, denetle, depoGirdisi, tabaniYaz };

if (require.main === module) {
  if (process.argv.includes('--tabani-yaz')) {
    process.stdout.write(`[beyan] taban yazıldı: ${tabaniYaz()} beyansız test dosyası (${TABAN_YOLU})\n`);
  } else {
    const { hatalar, ozet } = denetle({ ...depoGirdisi(), tavan: undefined });
    process.stdout.write(`[beyan] test ${ozet.test} · beyanlı ${ozet.beyanli} · tabanda ${ozet.tabanda}\n`);
    if (hatalar.length) {
      process.stderr.write(`[beyan] ${hatalar.length} hata:\n  - ${hatalar.slice(0, 30).join('\n  - ')}\n`);
      process.exit(1);
    }
  }
}
