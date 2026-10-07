#!/usr/bin/env node
/**
 * ALT-38c-2 · TEST SHARD SONUÇ BEKLEYİCİSİ — `ci` işinin son adımı: aynı koşunun `test-shard (i/N)` işlerinin HEPSİ başarıyla bitmeden `ci` yeşil olmaz.
 *
 * NİÇİN BU YOL (needs'li toplayıcı DEĞİL): zorunlu kontrol `ci` adıyla işin KENDİSİdir ve ALT-38a aynası (`edited-ayna.cjs`) `ci` işinin adımlarını
 * (`taban izi`, `edited ayna kararı`) okur; `ci`yi ikiye bölmek aynayı ve onun 321 testini yeniden yazdırır. Burada `ci` adımlarını korur, shard'lar
 * paralel koşar, `ci` son adımda onları API'den bekler. Lint/Build shard'larla ÜST ÜSTE koşar (needs olsaydı sırayla koşardı).
 *
 * GÜVENLİK YÖNÜ (OPS şartları, 10-07): her belirsizlik KIRMIZIDIR.
 *   · SADECE bu koşunun BU DENEMESİNİN (run_id + run_attempt) işlerine bakılır (`actions/runs/{id}/attempts/{n}/jobs`): ad benzerliğiyle başka koşuya
 *     kayılmaz, yeniden koşumda eski deneme yeşili sayılmaz (kısmi yeniden koşumda eksik shard = KIRMIZI: "Re-run all jobs" gerekir).
 *   · Beklenen N shard'dan eksik (kısa bir listeleme gecikmesi toleransından sonra), fazladan/tekrar eden shard adı, kırmızı/iptal/atlanan sonuç,
 *     zaman aşımı, okunamayan API, geçersiz ortam: KIRMIZI. Kırmızı shard görülünce diğerleri beklenmeden hemen kırmızı.
 *
 * Ortam: GH_TOKEN, DEPO (sahip/depo), KOSU_ID (github.run_id), KOSU_DENEME (github.run_attempt), SHARD_TOPLAM (N), BEKLEME_SN (isteğe bağlı).
 * Çıkış: 0 yalnız N shard'ın hepsi `success` ise. Cetvel: docs/standards/test-karnesi-standard.md §4.2. Test: scripts/ci/__tests__/test-shard-bekle.test.ts.
 */
'use strict';

const cp = require('node:child_process');

const IS_ON_EKI = 'test-shard';
const ARALIK_SN = 10;
const BEKLEME_SN = 900;
const EKSIK_TOLERANS_SN = 45;
const ART_ARDA_HATA = 3;
const SAYFA = 100;
const EN_FAZLA_SHARD = 32;

/** ci.yml'deki `test-shard` işinin adıyla BİREBİR aynı olmalı: `test-shard (${{ matrix.shard }}/N)` (INV-CI-SHARD-1 doğrular). */
const beklenenAdlar = (toplam) => Array.from({ length: toplam }, (_, i) => `${IS_ON_EKI} (${i + 1}/${toplam})`);

/** Saf değerlendirme: bir iş listesinden shard durumunu çıkarır. FIRLATMAZ; bozuk girdi "iş yok" sayılır (eksik → kırmızı yolu). */
function degerlendir(isler, toplam) {
  const beklenen = beklenenAdlar(toplam);
  const liste = Array.isArray(isler) ? isler : [];
  const shardlar = liste.filter((j) => j && typeof j.name === 'string' && j.name.startsWith(IS_ON_EKI));
  const adSayisi = (ad) => shardlar.filter((j) => j.name === ad).length;
  const olanlar = beklenen.filter((ad) => adSayisi(ad) === 1).map((ad) => shardlar.find((j) => j.name === ad));
  return {
    beklenen,
    eksik: beklenen.filter((ad) => adSayisi(ad) === 0),
    tekrar: beklenen.filter((ad) => adSayisi(ad) > 1),
    beklenmeyen: [...new Set(shardlar.map((j) => j.name).filter((ad) => !beklenen.includes(ad)))],
    bozuk: olanlar.filter((j) => j.status === 'completed' && j.conclusion !== 'success'),
    bekleyen: olanlar.filter((j) => j.status !== 'completed'),
    basarili: olanlar.filter((j) => j.status === 'completed' && j.conclusion === 'success'),
  };
}

const tekSatir = (m) => String(m).replace(/[\r\n]+/g, ' ').slice(0, 400);
const ayrinti = (j) => `${j.name}: ${j.conclusion || j.status}${j.html_url ? ` (${j.html_url})` : ''}`;

/**
 * Bekler ve karar verir. `api.isler()` bu denemenin iş listesini döner (hata FIRLATIR); `uyku(ms)` ve `simdi()` test için enjekte edilir.
 * Dönüş: `{ tamam: boolean, neden: string }`. FIRLATMAZ.
 */
async function bekle({ api, toplam, uyku, simdi, bekleSn = BEKLEME_SN, aralikSn = ARALIK_SN, toleransSn = EKSIK_TOLERANS_SN, log = () => {} }) {
  if (!Number.isInteger(toplam) || toplam < 1 || toplam > EN_FAZLA_SHARD) return { tamam: false, neden: `SHARD_TOPLAM geçersiz (${JSON.stringify(toplam)})` };
  const baslangic = simdi();
  const son = baslangic + bekleSn * 1000;
  let sonDurum = '';
  let ardaHata = 0;
  for (;;) {
    let isler;
    try {
      isler = await api.isler();
      ardaHata = 0;
    } catch (e) {
      ardaHata += 1;
      if (ardaHata >= ART_ARDA_HATA) return { tamam: false, neden: `iş listesi ${ART_ARDA_HATA} kez üst üste okunamadı (${tekSatir(e && e.message ? e.message : e)}): doğrulanamayan shard yeşil sayılmaz` };
      await uyku(aralikSn * 1000);
      continue;
    }
    const d = degerlendir(isler, toplam);
    if (d.bozuk.length) return { tamam: false, neden: `shard KIRMIZI: ${d.bozuk.map(ayrinti).join('; ')}` };
    if (d.tekrar.length) return { tamam: false, neden: `aynı adlı birden fazla shard işi var: ${d.tekrar.join(', ')}` };
    if (d.beklenmeyen.length) return { tamam: false, neden: `beklenmeyen shard işi var (${d.beklenmeyen.join(', ')}); matrix ile SHARD_TOPLAM=${toplam} uyuşmuyor` };
    if (d.eksik.length && simdi() - baslangic >= toleransSn * 1000) {
      return { tamam: false, neden: `beklenen ${toplam} shard'dan ${d.eksik.length} tanesi bu denemenin iş listesinde YOK: ${d.eksik.join(', ')} (kısmi yeniden koşumda "Re-run all jobs" kullanın)` };
    }
    if (!d.eksik.length && !d.bekleyen.length && d.basarili.length === toplam) return { tamam: true, neden: `${toplam}/${toplam} shard success` };
    if (simdi() >= son) return { tamam: false, neden: `zaman aşımı (${bekleSn} sn): ${d.bekleyen.map((j) => `${j.name}=${j.status}`).concat(d.eksik.map((a) => `${a}=yok`)).join(', ')}` };
    const durum = `${d.basarili.length}/${toplam} bitti, ${d.bekleyen.length} sürüyor${d.eksik.length ? `, ${d.eksik.length} listede yok` : ''}`;
    if (durum !== sonDurum) log(durum);
    sonDurum = durum;
    await uyku(aralikSn * 1000);
  }
}

function ghApi(yol) {
  return new Promise((coz, red) => {
    cp.execFile('gh', ['api', yol], { maxBuffer: 64 * 1024 * 1024, windowsHide: true }, (err, cikti, hata) => {
      if (err) red(new Error(`gh api ${yol}: ${String(hata || err.message).trim().slice(0, 200)}`));
      else coz(cikti);
    });
  });
}

/** Gerçek API: koşunun BELİRLİ DENEMESİNİN işleri (sayfalı). */
function gercekApi(depo, kosuId, deneme, ghCagri = ghApi) {
  return {
    async isler() {
      const hepsi = [];
      for (let sayfa = 1; sayfa <= 10; sayfa += 1) {
        const y = JSON.parse(await ghCagri(`repos/${depo}/actions/runs/${kosuId}/attempts/${deneme}/jobs?per_page=${SAYFA}&page=${sayfa}`));
        const jobs = Array.isArray(y.jobs) ? y.jobs : [];
        hepsi.push(...jobs);
        if (jobs.length < SAYFA || hepsi.length >= (Number.isFinite(y.total_count) ? y.total_count : Infinity)) return hepsi;
      }
      throw new Error('iş listesi 10 sayfadan uzun: beklenmiyor');
    },
  };
}

function ortamiOku(ortam) {
  const { DEPO, KOSU_ID, KOSU_DENEME, SHARD_TOPLAM, BEKLEME_SN: bekleme } = ortam;
  if (!DEPO || !/^[\w.-]+\/[\w.-]+$/.test(DEPO)) throw new Error('DEPO (sahip/depo) eksik ya da geçersiz');
  if (!/^\d+$/.test(String(KOSU_ID))) throw new Error('KOSU_ID (github.run_id) eksik ya da geçersiz');
  if (!/^[1-9]\d*$/.test(String(KOSU_DENEME))) throw new Error('KOSU_DENEME (github.run_attempt) eksik ya da geçersiz');
  if (!/^\d+$/.test(String(SHARD_TOPLAM)) || Number(SHARD_TOPLAM) < 1 || Number(SHARD_TOPLAM) > EN_FAZLA_SHARD) throw new Error('SHARD_TOPLAM eksik ya da geçersiz');
  if (bekleme !== undefined && bekleme !== '' && !/^[1-9]\d*$/.test(String(bekleme))) throw new Error('BEKLEME_SN geçersiz');
  return { depo: DEPO, kosuId: KOSU_ID, deneme: KOSU_DENEME, toplam: Number(SHARD_TOPLAM), bekleSn: bekleme ? Number(bekleme) : BEKLEME_SN };
}

/** Komut satırı çekirdeği; dönüş çıkış kodu. `g` test için enjekte edilir. */
async function main(ortam = process.env, g = {}) {
  const { api, uyku = (ms) => new Promise((c) => setTimeout(c, ms)), simdi = () => Date.now(), yaz = (m) => process.stdout.write(`${m}\n`) } = g;
  let o;
  try {
    o = ortamiOku(ortam);
  } catch (e) {
    yaz(`::error::test shard bekleyici: ${tekSatir(e.message)}`);
    return 1;
  }
  const r = await bekle({ api: api || gercekApi(o.depo, o.kosuId, o.deneme), toplam: o.toplam, uyku, simdi, bekleSn: o.bekleSn, log: (m) => yaz(`test shard: ${m}`) });
  yaz(r.tamam ? `::notice::test shard: ${tekSatir(r.neden)} (koşu ${o.kosuId}, deneme ${o.deneme})` : `::error::test shard: ${tekSatir(r.neden)} (koşu ${o.kosuId}, deneme ${o.deneme})`);
  return r.tamam ? 0 : 1;
}

if (require.main === module) {
  main().then(
    (kod) => {
      process.exitCode = kod;
    },
    (e) => {
      process.stdout.write(`::error::test shard bekleyici beklenmeyen hata: ${tekSatir(e && e.message ? e.message : e)}\n`);
      process.exitCode = 1;
    },
  );
}

module.exports = { ARALIK_SN, BEKLEME_SN, EKSIK_TOLERANS_SN, IS_ON_EKI, bekle, beklenenAdlar, degerlendir, gercekApi, main, ortamiOku };
