#!/usr/bin/env node
/**
 * ALT-38 · Test karnesi — kaynak koddan ölçülebilen kısım (YALNIZ OKUMA).
 *
 * Her test dosyası için: ne okuyor/koruyor (INV, karar, cetvel atıfları), hangi yollara dokunuyor
 * (kod / belge / kanca / araç), ortama bağlılık imzaları (ev dizini, mutlak yol, alt süreç, ağ, saat,
 * git geçmişi, yazma), test sayısı, atlanan test sayısı ve "aynı şeyi koruyan başka test" adayları.
 *
 * ⚠Bu betik HÜKÜM VERMEZ; imza toplar. "Dünya durumu" ya da "gereksiz" kararı karne birleştirmesinde
 * (CI geçmişi + sabotaj + okuma) verilir. İmza yoksa "yok" yazılır, bilinmiyorsa "ölçülmedi".
 *
 * Kullanım: node scripts/test-karnesi/statik.cjs --cikti C:/tmp/alt38-veri/statik.json
 */
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const KOK = path.resolve(__dirname, '..', '..');
const TEST_DESENI = /\.(test|spec)\.(ts|tsx|js|cjs|mjs)$/;

// vitest.config.ts `exclude` ile birebir; config değişirse bu liste de değişir
// (karne testi ikisini karşılaştırır — bkz. test-kosu-kapsami.test.ts).
const VITEST_DISLANANLAR = [/^tests\/e2e\/empirical_.*\.test\.ts$/, /^tests\/smoke\//];

function testDosyalari() {
  const cikti = execFileSync('git', ['ls-files'], { cwd: KOK, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return cikti
    .split('\n')
    .filter((d) => d && TEST_DESENI.test(d))
    .sort();
}

function kume(dosya) {
  if (dosya.startsWith('src/__tests__/conformance/')) return 'conformance';
  if (dosya.startsWith('tests/smoke/')) return 'smoke';
  if (dosya.startsWith('tests/e2e/')) return 'e2e';
  if (dosya.startsWith('scripts/')) return 'betik';
  if (dosya.startsWith('supabase/')) return 'edge';
  if (dosya.startsWith('src/')) return 'birim';
  return 'diger';
}

function ilkYorum(metin) {
  // Dosyanın başındaki /** ... */ bloğu ya da ardışık satır yorumları. Satır yorumu işaretini DÜZ METİN olarak tanırız
  // (başlangıç eşleşmesi): `//` içeren regex, URL şemasını yorum sanan sıyırıcı kalıbıyla karışır (INV-SCRUB-1).
  const satirlar = metin.split('\n');
  const yorumSatiri = (s) => s.trim().startsWith('//');
  let i = 0;
  while (i < satirlar.length && (satirlar[i].trim() === '' || yorumSatiri(satirlar[i]))) i += 1;
  const kalan = satirlar.slice(i).join('\n');
  let ham = '';
  if (kalan.startsWith('/*')) {
    const son = kalan.indexOf('*/');
    if (son > 1) ham = kalan.slice(2, son).replace(/^\*/, '');
  }
  if (!ham) {
    const toplanan = [];
    for (const s of satirlar.slice(0, 40)) {
      if (yorumSatiri(s)) toplanan.push(s.trim().slice(2).trim());
      else if (toplanan.length) break;
    }
    ham = toplanan.join(' ');
  }
  return ham
    .replace(/^\s*\*\s?/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 320);
}

function tekil(dizi) {
  return [...new Set(dizi)];
}

function eslesmeler(metin, desen, grup = 0) {
  const sonuc = [];
  let m;
  const d = new RegExp(desen.source, desen.flags.includes('g') ? desen.flags : `${desen.flags}g`);
  while ((m = d.exec(metin)) !== null) sonuc.push(m[grup]);
  return sonuc;
}

function yolSinifi(yol) {
  if (/^(src|supabase|public|next\.config|tailwind|middleware)/.test(yol) || /^(package\.json|tsconfig)/.test(yol)) return 'kod';
  if (/^\.claude\/hooks|^\.claude\/settings/.test(yol)) return 'kanca';
  if (/^\.claude\/skills|^\.agent\/|^docs\/roller|^docs\//.test(yol)) return 'belge';
  if (/^scripts\/|^tools\/|^\.github\//.test(yol)) return 'arac';
  return 'diger';
}

function analiz(dosya) {
  const mutlak = path.join(KOK, dosya);
  const metin = fs.readFileSync(mutlak, 'utf8');
  const satir = metin.split('\n').length;

  const invler = tekil(eslesmeler(metin, /\bINV-[A-Z0-9]+(?:-[A-Z0-9]+)*/));
  const kararlar = tekil(eslesmeler(metin, /\bkarar\s+(\d{1,3})\b/i, 1)).map(Number);
  const kayitlar = tekil(eslesmeler(metin, /\b(?:REC|OPS|ALT|ARC|HRT|URN|ADM|YTN|TSR|SEO|KTL|BLG)-\d+\b/));
  const cetveller = tekil(eslesmeler(metin, /docs\/standards\/[A-Za-z0-9._-]+\.md/));

  const yolHamlari = tekil(
    eslesmeler(
      metin,
      /['"`]((?:src|docs|scripts|tools|\.claude|\.agent|\.github|supabase|public|tests|e2e-canli|memory)\/[^'"`\s)]*|package\.json|next\.config\.mjs|pnpm-lock\.yaml|vitest\.config\.ts|tsconfig\.json)['"`]/,
      1,
    ),
  ).filter((y) => !y.includes('${'));
  // `join(ROOT, 'src', 'x')` biçimi: kök bölümleri ayrı sabitler olarak geçer.
  const bolumKokleri = tekil(
    eslesmeler(
      metin,
      /(?:join|resolve)\([^)]*?['"`](src|docs|scripts|tools|\.claude|\.agent|\.github|supabase|public|tests|e2e-canli)['"`]/,
      1,
    ),
  );
  const yolSiniflari = tekil([...yolHamlari, ...bolumKokleri.map((b) => `${b}/`)].map(yolSinifi)).filter(
    (s) => s !== 'diger',
  );
  const sinif =
    yolSiniflari.length === 0
      ? 'yol-yok'
      : yolSiniflari.length === 1 && yolSiniflari[0] === 'kod'
        ? 'kod'
        : yolSiniflari.includes('kod')
          ? 'karma'
          : 'belge-kanca-arac';

  const ortam = {
    ortamDegiskenleri: tekil(eslesmeler(metin, /process\.env\.([A-Z0-9_]+)/, 1)).sort(),
    evDizini: /homedir\(|USERPROFILE|C:[\\/]+Users|\.claude[\\/]+projects|~\/\.claude/.test(metin),
    mutlakYol: /['"`]C:[\\/]|['"`]\/c\/|['"`]\/home\//.test(metin),
    altSurec: tekil(
      eslesmeler(metin, /(?:execSync|execFileSync|spawnSync|spawn|execFile|exec)\(\s*['"`]([A-Za-z0-9._-]+)/, 1),
    ).sort(),
    altSurecVar: /child_process|execSync|execFileSync|spawnSync|execFile\(/.test(metin),
    ag: /\bfetch\(|https?\.request\(|net\.connect\(|new WebSocket\(|createConnection\(/.test(metin),
    canliAdres: /https?:\/\/(?:www\.)?venthub\.com\.tr|\.supabase\.co/.test(metin),
    saat: /Date\.now\(\)|new Date\(\)|performance\.now\(\)/.test(metin),
    saatSabitlenmis: /useFakeTimers|setSystemTime/.test(metin),
    gitGecmisi: /git['"`,\s]+(?:log|diff|merge-base|rev-list|blame|show)\b|['"`]log['"`]/.test(metin),
    gitIndeksi: /ls-files/.test(metin),
    yazma: /writeFileSync|appendFileSync|mkdtempSync|rmSync|renameSync|copyFileSync|mkdirSync/.test(metin),
    platform: /process\.platform/.test(metin),
    sunucuGerekir: /SMOKE_BASE_URL|localhost:\d{4}/.test(metin),
    veritabani: /DATABASE_URL|createClient\(|pg\.Client|new Client\(/.test(metin),
  };

  const itSayisi = (metin.match(/(?:^|[^\w.])(?:it|test)(?:\.each\([^)]*\))?\s*\(/g) || []).length;
  const describeSayisi = (metin.match(/(?:^|[^\w.])describe(?:\.each\([^)]*\))?\s*\(/g) || []).length;
  const atlanan = (metin.match(/\.(?:skip|todo)\b|skipIf\(|\bxit\(|\bxdescribe\(/g) || []).length;
  const ilkDescribe = /describe\(\s*(['"`])((?:\\.|(?!\1).)*)\1/.exec(metin);

  // Benzerlik için parmak izi: INV kimlikleri + yol atıfları + uzun ve ayırt edici metin sabitleri.
  const sabitler = tekil(
    eslesmeler(metin, /['"`]([^'"`\n]{18,90})['"`]/, 1).filter((s) => !/[{}]|\$\{|\\n/.test(s) && /[a-zA-ZğüşıöçĞÜŞİÖÇ]{4}/.test(s)),
  ).slice(0, 60);

  return {
    dosya,
    kume: kume(dosya),
    satir,
    bayt: Buffer.byteLength(metin),
    testSayisi: itSayisi,
    describeSayisi,
    atlanan,
    baslik: ilkDescribe ? ilkDescribe[2].slice(0, 160) : null,
    yorum: ilkYorum(metin),
    invler,
    kararlar,
    kayitlar: kayitlar.slice(0, 12),
    cetveller,
    okunanYollar: yolHamlari.slice(0, 40),
    sinif,
    ortam,
    kanbanAdayi: /\bLinear\b|\bkanban\b|\bboard\.cjs|pr-kayit|DURUM-TAKIP|is-kayit|kokpit/i.test(metin),
    parmakIzi: { invler, yollar: yolHamlari.slice(0, 40), sabitler },
  };
}

function benzerlik(kayitlar) {
  // Jaccard: INV (ağırlık 3) + yol (2) + sabit (1). Yüksek benzerlik "aynı şeyi koruyor olabilir" adayıdır;
  // HÜKÜM DEĞİL — okuma/sabotajla doğrulanır.
  const kumeler = kayitlar.map((k) => {
    const s = new Set();
    for (const i of k.parmakIzi.invler) s.add(`I:${i}`);
    for (const y of k.parmakIzi.yollar) s.add(`Y:${y}`);
    for (const t of k.parmakIzi.sabitler) s.add(`S:${t}`);
    return s;
  });
  const agirlik = (oge) => (oge[0] === 'I' ? 3 : oge[0] === 'Y' ? 2 : 1);
  const toplam = (set) => {
    let t = 0;
    for (const o of set) t += agirlik(o);
    return t;
  };
  const toplamlar = kumeler.map(toplam);
  const ters = new Map();
  kumeler.forEach((s, i) => {
    for (const o of s) {
      if (!ters.has(o)) ters.set(o, []);
      ters.get(o).push(i);
    }
  });
  const sonuc = kayitlar.map(() => []);
  kayitlar.forEach((_, i) => {
    const kesisim = new Map();
    for (const o of kumeler[i]) {
      const liste = ters.get(o);
      if (liste.length > 25) continue; // çok yaygın sabitler (ör. 'src/') ayırt edici değil
      for (const j of liste) {
        if (j === i) continue;
        kesisim.set(j, (kesisim.get(j) || 0) + agirlik(o));
      }
    }
    const adaylar = [];
    for (const [j, ortak] of kesisim) {
      const birlesim = toplamlar[i] + toplamlar[j] - ortak;
      const skor = birlesim > 0 ? ortak / birlesim : 0;
      if (skor >= 0.25 && ortak >= 6) {
        const ortakInv = kayitlar[i].parmakIzi.invler.filter((x) => kayitlar[j].parmakIzi.invler.includes(x));
        adaylar.push({ dosya: kayitlar[j].dosya, skor: Number(skor.toFixed(2)), ortakInv });
      }
    }
    adaylar.sort((a, b) => b.skor - a.skor);
    sonuc[i] = adaylar.slice(0, 3);
  });
  return sonuc;
}

function main() {
  const iBay = process.argv.indexOf('--cikti');
  const cikti = iBay > -1 ? process.argv[iBay + 1] : null;
  if (!cikti) {
    process.stderr.write('kullanım: node scripts/test-karnesi/statik.cjs --cikti <json>\n');
    process.exit(2);
  }
  const dosyalar = testDosyalari();
  const kayitlar = dosyalar.map(analiz);
  const yakin = benzerlik(kayitlar);
  kayitlar.forEach((k, i) => {
    k.benzerler = yakin[i];
    k.vitestDisinda = VITEST_DISLANANLAR.some((d) => d.test(k.dosya));
    delete k.parmakIzi;
  });
  fs.mkdirSync(path.dirname(path.resolve(cikti)), { recursive: true });
  fs.writeFileSync(cikti, `${JSON.stringify({ alinma: new Date().toISOString(), dosyaSayisi: kayitlar.length, kayitlar }, null, 1)}\n`);
  process.stderr.write(`[statik] ${kayitlar.length} test dosyası → ${cikti}\n`);
}

if (require.main === module) main();

module.exports = { analiz, benzerlik, testDosyalari, VITEST_DISLANANLAR };
