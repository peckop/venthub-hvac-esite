#!/usr/bin/env node
/**
 * ALT-38 · Test karnesi — soru 2: "CI geçmişinde bu test kaç kez kırmızı verdi".
 *
 * `ci.yml` koşularını GitHub'dan çeker (YALNIZ OKUMA: `gh api` + `gh run view`), kırmızı
 * koşularda başarısız adımı ve başarısız test dosyalarını çıkarır, tek bir JSON'a yazar.
 * Hiçbir şey yeniden koşturulmaz, hiçbir şey yazılmaz.
 *
 * Kullanım:
 *   node scripts/test-karnesi/ci-gecmis.cjs --cikti C:/tmp/alt38-veri/ci-gecmis.json
 *   [--baslangic 2026-07-06] [--bitis 2026-10-07] [--pencere-gun 7] [--es 5]
 *   [--is-akisi ci.yml] [--repo sahip/depo] [--sure-ornek 30]
 *
 * NEDEN PENCERE: `status=failure&page=N` ile sayfalamak GitHub'da kararsız çıktı (ölçüldü
 * 2026-10-06: 400 satırın yalnız 320'si benzersiz, en yeni tarih 09-16 — son üç haftanın
 * kırmızıları eksikti). `created=<gün>..<gün>` pencereleri her pencerede 1000 sonuç sınırının
 * çok altında kalır ve `total_count` ile doğrulanır.
 *
 * NEDEN ANSI İKİ BİÇİM: GitHub günlüğünde renk kodu gerçek ESC karakteri olarak DEĞİL, iki
 * karakterlik "^[" metni olarak geliyor (ölçüldü: karakter kodları 94,91,91,52,49,109).
 * Yalnız ESC'yi soyan ilk sürüm 182 kırmızı koşuda 0 test dosyası buldu.
 *
 * Çıktı (koşu başına):
 *   { kosuId, olay, dal, sha, olusturma, baslama, guncelleme, sonuc, deneme, pr, baslik }
 *   kırmızı koşuda ek olarak:
 *   { basarisizAdimlar:[...], testDosyalari:[{dosya,adlar:[...]}], basarisizDosyaSayisi?,
 *     logAlinamadi? }
 *
 * Günlük saklama süresi GitHub'da 90 gündür; süresi dolmuş günlük "logAlinamadi" olur ve
 * karne o koşuyu "ölçülmedi" sayar (tahmin yürütülmez).
 */
'use strict';

const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

/** Gerçek ESC (\u001b) ve günlükte görülen "^[" metni; ikisi de `[<sayılar>m` ile devam eder. */
const ANSI = /(?:\u001b|\^\[)\[[0-9;]*m/g;

function ansiSoy(metin) {
  return String(metin).replace(ANSI, '');
}

function argumanlar(argv, bugun = new Date()) {
  const gunEkle = (d, n) => new Date(d.getTime() + n * 86400000);
  const a = {
    cikti: null,
    baslangic: null,
    bitis: null,
    pencereGun: 7,
    es: 5,
    isAkisi: 'ci.yml',
    repo: null,
    sureOrnek: 30,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    if (k === '--cikti') a.cikti = argv[++i];
    else if (k === '--baslangic') a.baslangic = argv[++i];
    else if (k === '--bitis') a.bitis = argv[++i];
    else if (k === '--pencere-gun') a.pencereGun = Number(argv[++i]);
    else if (k === '--es') a.es = Number(argv[++i]);
    else if (k === '--is-akisi') a.isAkisi = argv[++i];
    else if (k === '--repo') a.repo = argv[++i];
    else if (k === '--sure-ornek') a.sureOrnek = Number(argv[++i]);
    else throw new Error(`bilinmeyen bayrak: ${k}`);
  }
  if (!a.cikti) throw new Error('--cikti gerekli');
  // Varsayılan: günlük saklama süresinin biraz ötesi (92 gün) → bugünün ertesi günü.
  if (!a.baslangic) a.baslangic = gunEkle(bugun, -92).toISOString().slice(0, 10);
  if (!a.bitis) a.bitis = gunEkle(bugun, 1).toISOString().slice(0, 10);
  if (!(a.pencereGun >= 1)) throw new Error('--pencere-gun >= 1 olmalı');
  return a;
}

/** [baslangic, bitis] günlerini `pencereGun` günlük, çakışmayan, kapalı aralıklara böler. */
function pencereler(baslangic, bitis, pencereGun) {
  const gun = (s) => new Date(`${s}T00:00:00Z`);
  const bicim = (d) => d.toISOString().slice(0, 10);
  const son = gun(bitis);
  const sonuc = [];
  for (let b = gun(baslangic); b <= son; ) {
    let e = new Date(b.getTime() + (pencereGun - 1) * 86400000);
    if (e > son) e = son;
    sonuc.push([bicim(b), bicim(e)]);
    b = new Date(e.getTime() + 86400000);
  }
  return sonuc;
}

function gh(args, { json = false } = {}) {
  return new Promise((resolve, reject) => {
    execFile('gh', args, { maxBuffer: 256 * 1024 * 1024, windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        const e = new Error(`gh ${args.slice(0, 3).join(' ')}: ${(stderr || err.message).trim().slice(0, 300)}`);
        e.kod = err.code;
        reject(e);
        return;
      }
      if (!json) {
        resolve(stdout);
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(new Error(`gh çıktısı JSON değil: ${stdout.slice(0, 200)}`));
      }
    });
  });
}

/** Geçici hatalarda (ağ, 5xx, hız sınırı) üç deneme; kalıcı hatada hemen bırakır. */
async function ghDene(args, secenek, deneme = 3) {
  let son;
  for (let i = 1; i <= deneme; i += 1) {
    try {
      return await gh(args, secenek);
    } catch (e) {
      son = e;
      if (/HTTP 4(0[0-9]|10|22)\b/.test(e.message) && !/HTTP 429/.test(e.message)) break;
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
  throw son;
}

/**
 * Vitest günlüğünden başarısız test satırlarını ayıklar. Saf fonksiyon; test edilebilir.
 * Biçim: ` FAIL  src/x.test.ts > describe > it` ya da paket düzeyinde
 * ` FAIL  src/x.test.ts [ src/x.test.ts ]` (ANSI renkleri soyulduktan sonra).
 */
function basarisizTestleriAyikla(metin) {
  const sonuc = new Map();
  for (const ham of String(metin).split('\n')) {
    const satir = ansiSoy(ham).replace(/\r$/, '');
    const m = /\bFAIL\s+(\S+?\.(?:test|spec)\.[a-z]+)(?:\s*(?:>\s*(.*)|\[.*\]))?\s*$/.exec(satir);
    if (!m) continue;
    const dosya = m[1];
    const ad = (m[2] || '').trim();
    if (!sonuc.has(dosya)) sonuc.set(dosya, new Set());
    if (ad) sonuc.get(dosya).add(ad.slice(0, 200));
  }
  return [...sonuc.entries()].map(([dosya, adlar]) => ({ dosya, adlar: [...adlar].slice(0, 8) }));
}

/** Günlükteki "Test Files  1 failed | 597 passed ..." satırından başarısız dosya sayısı. */
function basarisizDosyaSayisiOku(metin) {
  const m = /Test Files\s+(\d+) failed/.exec(ansiSoy(metin));
  return m ? Number(m[1]) : null;
}

function kosuKaydi(r) {
  return {
    kosuId: r.id,
    olay: r.event,
    dal: r.head_branch,
    sha: r.head_sha,
    olusturma: r.created_at,
    baslama: r.run_started_at || null,
    guncelleme: r.updated_at || null,
    sonuc: r.conclusion || r.status || null,
    deneme: r.run_attempt || 1,
    pr: (r.pull_requests && r.pull_requests[0] && r.pull_requests[0].number) || null,
    baslik: String(r.display_title || '').slice(0, 100),
  };
}

async function pencereyiCek(repo, isAkisi, [b, e]) {
  const kosular = new Map();
  let toplam = null;
  for (let sayfa = 1; ; sayfa += 1) {
    const yanit = await ghDene(
      ['api', `repos/${repo}/actions/workflows/${isAkisi}/runs?created=${b}..${e}&per_page=100&page=${sayfa}`],
      { json: true },
    );
    if (toplam === null) toplam = yanit.total_count;
    const liste = yanit.workflow_runs || [];
    for (const r of liste) kosular.set(r.id, kosuKaydi(r));
    if (liste.length < 100) break;
  }
  return { kosular: [...kosular.values()], toplam, pencere: `${b}..${e}` };
}

/** Test adımının süresi (sn). Adım yoksa ya da bitmediyse null. */
function testAdimiSuresi(isler) {
  for (const is of (isler && isler.jobs) || []) {
    for (const adim of is.steps || []) {
      if (!/^test$/i.test(String(adim.name).trim())) continue;
      if (!adim.started_at || !adim.completed_at) continue;
      return Math.round((Date.parse(adim.completed_at) - Date.parse(adim.started_at)) / 1000);
    }
  }
  return null;
}

async function kirmiziKosuyuIsle(repo, k) {
  const kayit = { ...k, basarisizAdimlar: [], testDosyalari: [] };
  try {
    const isler = await ghDene(['api', `repos/${repo}/actions/runs/${k.kosuId}/jobs?per_page=30`], { json: true });
    for (const is of isler.jobs || []) {
      if (is.conclusion !== 'failure') continue;
      for (const adim of is.steps || []) {
        if (adim.conclusion === 'failure') kayit.basarisizAdimlar.push(adim.name);
      }
    }
    kayit.testAdimiSuresiSn = testAdimiSuresi(isler);
  } catch (e) {
    kayit.isBilgisiAlinamadi = e.message;
  }
  // Günlük yalnız test adımı kırıldıysa gerekir; adım bilgisi alınamadıysa yine de denenir.
  const testKirik = kayit.basarisizAdimlar.some((ad) => /^test$/i.test(ad.trim())) || kayit.isBilgisiAlinamadi;
  if (!testKirik) return kayit;
  try {
    const log = await ghDene(['run', 'view', String(k.kosuId), '--repo', repo, '--log-failed']);
    kayit.testDosyalari = basarisizTestleriAyikla(log);
    const n = basarisizDosyaSayisiOku(log);
    if (n !== null) kayit.basarisizDosyaSayisi = n;
  } catch (e) {
    kayit.logAlinamadi = true;
    kayit.logHatasi = e.message;
  }
  return kayit;
}

async function basariliKosuSuresi(repo, k) {
  try {
    const isler = await ghDene(['api', `repos/${repo}/actions/runs/${k.kosuId}/jobs?per_page=30`], { json: true });
    return { ...k, testAdimiSuresiSn: testAdimiSuresi(isler) };
  } catch (e) {
    return { ...k, isBilgisiAlinamadi: e.message };
  }
}

async function havuz(isler, es, fn) {
  const sonuc = new Array(isler.length);
  let sira = 0;
  async function isci() {
    while (true) {
      const i = sira;
      sira += 1;
      if (i >= isler.length) return;
      sonuc[i] = await fn(isler[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, es) }, isci));
  return sonuc;
}

async function main() {
  const a = argumanlar(process.argv.slice(2));
  const repo =
    a.repo || (await gh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner'])).trim();
  const tum = new Map();
  const uyarilar = [];
  for (const p of pencereler(a.baslangic, a.bitis, a.pencereGun)) {
    const { kosular, toplam, pencere } = await pencereyiCek(repo, a.isAkisi, p);
    for (const k of kosular) tum.set(k.kosuId, k);
    if (toplam !== null && kosular.length !== toplam) {
      uyarilar.push(`${pencere}: total_count=${toplam} ama ${kosular.length} benzersiz koşu alındı`);
    }
    if (toplam !== null && toplam >= 1000) uyarilar.push(`${pencere}: 1000 sınırına dayandı, pencereyi daralt`);
  }
  const hepsi = [...tum.values()].sort((x, y) => x.olusturma.localeCompare(y.olusturma));
  const kirmizilar = hepsi.filter((k) => k.sonuc === 'failure');
  const basarililar = hepsi
    .filter((k) => k.sonuc === 'success')
    .slice(-Math.max(0, a.sureOrnek));
  process.stderr.write(
    `[ci-gecmis] ${hepsi.length} koşu (${repo}, ${a.baslangic}..${a.bitis}); kırmızı ${kirmizilar.length}, ` +
      `süre örneği ${basarililar.length}. Uyarı: ${uyarilar.length}\n`,
  );
  let bitti = 0;
  const toplamIs = kirmizilar.length + basarililar.length;
  const ilerle = () => {
    bitti += 1;
    if (bitti % 25 === 0) process.stderr.write(`[ci-gecmis] ${bitti}/${toplamIs}\n`);
  };
  const kirmiziKayitlar = await havuz(kirmizilar, a.es, async (k) => {
    const r = await kirmiziKosuyuIsle(repo, k);
    ilerle();
    return r;
  });
  const basariliKayitlar = await havuz(basarililar, a.es, async (k) => {
    const r = await basariliKosuSuresi(repo, k);
    ilerle();
    return r;
  });
  const zenginKosu = new Map([...kirmiziKayitlar, ...basariliKayitlar].map((k) => [k.kosuId, k]));
  const kosular = hepsi.map((k) => zenginKosu.get(k.kosuId) || k);
  fs.mkdirSync(path.dirname(path.resolve(a.cikti)), { recursive: true });
  fs.writeFileSync(
    a.cikti,
    `${JSON.stringify(
      {
        repo,
        isAkisi: a.isAkisi,
        alinma: new Date().toISOString(),
        pencere: { baslangic: a.baslangic, bitis: a.bitis, gun: a.pencereGun },
        uyarilar,
        kosular,
      },
      null,
      1,
    )}\n`,
  );
  const logsuz = kirmiziKayitlar.filter((k) => k.logAlinamadi).length;
  const bulunan = kirmiziKayitlar.filter((k) => k.testDosyalari.length > 0).length;
  process.stderr.write(
    `[ci-gecmis] yazıldı: ${a.cikti} · test dosyası ayıklanan kırmızı koşu: ${bulunan} · günlüğü alınamayan: ${logsuz}\n`,
  );
}

if (require.main === module) {
  main().catch((e) => {
    process.stderr.write(`[ci-gecmis] HATA: ${e.message}\n`);
    process.exit(1);
  });
}

module.exports = {
  ansiSoy,
  argumanlar,
  basarisizDosyaSayisiOku,
  basarisizTestleriAyikla,
  pencereler,
  testAdimiSuresi,
};
