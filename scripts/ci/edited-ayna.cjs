#!/usr/bin/env node
/**
 * ALT-38 · `edited` AYNASI — PR başlığı/gövdesi düzenlenince paketin tamamını yeniden koşturma.
 *
 * SORUN (ölçüldü 2026-10-06, 07-06..10-06 `ci.yml` geçmişi): `pull_request` türlerinde `edited` var (karar 187: gövdeye
 * `Kanban:` satırı sonradan eklenince kayıt kapısı yeniden koşsun). Düzenleme KODU değiştirmez ama `ci` işi paketin
 * tamamını yeniden koşturuyor VE aynı `concurrency` grubundaki koşan tam koşuyu İPTAL ediyordu. 10-03..10-06'da 187 PR
 * koşusunun 50'si (%27) aynı commit'in tekrarıydı; bunların 30'u iptal edilen bir koşunun ardından, 5'i yeşil bir tam
 * koşunun ardından geldi (11'i kayıt kapısı kırmızısından sonra: gerçekten tam koşu gerekiyordu).
 *
 * ÇÖZÜM — "AYNA", ATLAMA DEĞİL. `edited` koşusu YALNIZ şu koşullar HEPSİ sağlanırsa ağır adımları atlar:
 *   1. Aynı head SHA için, bu koşudan ÖNCE başlamış bir TAM koşu (edited ayna koşusu DEĞİL) var,
 *   2. o koşu `success` ile BİTMİŞ (kırmızı/iptal/süren → atlama yok; süren ise bitmesi BEKLENİR),
 *   3. base dalı (master) o koşunun başlamasından (güvenlik payıyla) sonra ilerlememiş: kod aynı, taban aynı.
 * Aksi her durumda (ve her hatada) TAM koşu yapılır. Yani yeşil bir `ci` DAİMA gerçek bir tam yeşile dayanır;
 * bir düzenleme kırmızı bir koşuyu yeşile ÇEVİREMEZ. PR kayıt kapısı bu adımdan ÖNCE koşar ve her zaman koşar.
 *
 * Çıktı: `$GITHUB_OUTPUT` içine `atla=true|false` ve `neden=<tek satır>`; ayrıca ekrana `::notice::`.
 * Çıkış kodu DAİMA 0 (ölçemezse atla=false: tam koşu).
 *
 * Ortam: GH_TOKEN, DEPO (sahip/depo), HEAD_SHA, BASE_REF, KOSU_ID (bu koşunun id'si), GITHUB_OUTPUT.
 */
'use strict';

const cp = require('node:child_process');
const fs = require('node:fs');

/** ci.yml'deki adım adıyla BİREBİR aynı olmalı (INV-CI-EDITED-1 doğrular): ayna koşusunu bu adımın sonucundan tanırız. */
const AYNA_ADIM_ADI = 'edited ayna kararı';
const IS_ADI = 'ci';
const GUVENLIK_PAYI_SN = 120;
const ARALIK_SN = 20;
const BEKLEME_SN = 660;
const EN_FAZLA_ADAY = 6;

/**
 * Bir koşunun TAM koşu mu, AYNA koşusu mu, BELİRSİZ mi olduğunu iş adımlarından çıkarır.
 * `ayna` adımı: yoksa (bu değişiklikten ÖNCEKİ koşu) hepsi tamdı; `skipped` ise edited olayı değildi (tam);
 * `success` ise ayna koşusudur; sonuçsuz (henüz değerlendirilmemiş) ise belirsiz.
 */
function siniflandir(isler) {
  const liste = (isler && isler.jobs) || [];
  const is = liste.find((j) => j.name === IS_ADI);
  if (!is) return 'belirsiz';
  const adim = (is.steps || []).find((s) => String(s.name).startsWith(AYNA_ADIM_ADI));
  if (!adim) return 'tam';
  if (adim.conclusion === 'skipped') return 'tam';
  if (adim.conclusion === 'success') return 'ayna';
  if (adim.conclusion === 'failure') return 'ayna';
  return 'belirsiz';
}

/**
 * Karar (saf). `adaylar`: bu koşudan ÖNCE başlamış, aynı head SHA'lı koşular, SINIFLANDIRILMIŞ:
 * [{ id, status, conclusion, created_at, tur }]. `tabanTarihi`: base dalının son commit'inin tarihi (ISO) ya da null.
 * Dönüş: { atla, bekle, neden }.
 */
function karar({ adaylar, tabanTarihi }) {
  const yeniden = [...adaylar].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const tamlar = yeniden.filter((a) => a.tur === 'tam');
  const belirsiz = yeniden.find((a) => a.tur === 'belirsiz' && a.status !== 'completed');
  if (belirsiz && (!tamlar.length || Date.parse(belirsiz.created_at) > Date.parse(tamlar[0].created_at))) {
    return { atla: false, bekle: true, neden: `koşu ${belirsiz.id} henüz sınıflandırılamıyor (adımlar başlamadı)` };
  }
  if (!tamlar.length) return { atla: false, bekle: false, neden: 'aynı head SHA için daha önce BİTMİŞ ya da süren bir TAM koşu yok' };
  const son = tamlar[0];
  if (son.status !== 'completed') return { atla: false, bekle: true, neden: `tam koşu ${son.id} sürüyor (${son.status})` };
  if (son.conclusion !== 'success') return { atla: false, bekle: false, neden: `son tam koşu ${son.id} sonucu "${son.conclusion}" (yalnız success atlatır)` };
  if (!tabanTarihi) return { atla: false, bekle: false, neden: 'base dalının son commit tarihi okunamadı' };
  const sinir = Date.parse(son.created_at) - GUVENLIK_PAYI_SN * 1000;
  if (!(Date.parse(tabanTarihi) <= sinir)) {
    return { atla: false, bekle: false, neden: `base dalı tam koşudan (${son.created_at}) sonra ilerlemiş (son commit ${tabanTarihi}); taban değişti, yeniden doğrulanmalı` };
  }
  return { atla: true, bekle: false, neden: `kod ve taban aynı: tam koşu ${son.id} (${son.created_at}) success; base son commit ${tabanTarihi}` };
}

/**
 * Akış: adayları topla, sınıflandır, karar ver; "tam koşu sürüyor" ise bitmesini bekle (en fazla BEKLEME_SN).
 * `api`: { kosular(sha), isler(id), tabanTarihi(ref) }. `bekle(ms)` ve `simdi()` test için enjekte edilir.
 * Her hatada TAM koşu (atla=false); bu fonksiyon FIRLATMAZ.
 */
async function calistir({ api, sha, baseRef, kendiId, bekle, simdi, bekleSn = BEKLEME_SN, aralikSn = ARALIK_SN }) {
  try {
    const son = simdi() + bekleSn * 1000;
    for (;;) {
      const kosular = await api.kosular(sha);
      const kendi = kosular.find((k) => String(k.id) === String(kendiId));
      const bizdenEski = (k) => String(k.id) !== String(kendiId) && (!kendi || Date.parse(k.created_at) <= Date.parse(kendi.created_at));
      const adaylar = [];
      for (const k of kosular.filter(bizdenEski).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, EN_FAZLA_ADAY)) {
        const isler = await api.isler(k.id);
        adaylar.push({ id: k.id, status: k.status, conclusion: k.conclusion, created_at: k.created_at, tur: siniflandir(isler) });
      }
      const tabanTarihi = await api.tabanTarihi(baseRef);
      const k = karar({ adaylar, tabanTarihi });
      if (!k.bekle) return { atla: k.atla, neden: k.neden };
      if (simdi() >= son) return { atla: false, neden: `${k.neden}; bekleme süresi (${bekleSn} sn) doldu → tam koşu` };
      await bekle(aralikSn * 1000);
    }
  } catch (e) {
    return { atla: false, neden: `ölçülemedi: ${String(e && e.message ? e.message : e).slice(0, 200)} → tam koşu` };
  }
}

function ghApi(yol, jq) {
  const args = ['api', yol];
  if (jq) args.push('--jq', jq);
  return new Promise((coz, red) => {
    cp.execFile('gh', args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true }, (err, cikti, hata) => {
      if (err) red(new Error(`gh api ${yol}: ${(hata || err.message).trim().slice(0, 200)}`));
      else coz(cikti);
    });
  });
}

function gercekApi(depo) {
  return {
    async kosular(sha) {
      const y = JSON.parse(await ghApi(`repos/${depo}/actions/workflows/ci.yml/runs?head_sha=${sha}&event=pull_request&per_page=30`));
      return (y.workflow_runs || []).map((r) => ({ id: r.id, status: r.status, conclusion: r.conclusion, created_at: r.created_at }));
    },
    async isler(id) {
      return JSON.parse(await ghApi(`repos/${depo}/actions/runs/${id}/jobs?per_page=30`));
    },
    async tabanTarihi(ref) {
      const t = (await ghApi(`repos/${depo}/commits/${encodeURIComponent(ref)}`, '.commit.committer.date')).trim();
      return t || null;
    },
  };
}

async function main() {
  const { DEPO, HEAD_SHA, BASE_REF, KOSU_ID, GITHUB_OUTPUT } = process.env;
  if (!DEPO || !HEAD_SHA || !BASE_REF || !KOSU_ID) {
    process.stderr.write('[edited-ayna] eksik ortam (DEPO, HEAD_SHA, BASE_REF, KOSU_ID) → tam koşu\n');
    yaz(GITHUB_OUTPUT, { atla: false, neden: 'eksik ortam' });
    return;
  }
  const r = await calistir({
    api: gercekApi(DEPO),
    sha: HEAD_SHA,
    baseRef: BASE_REF,
    kendiId: KOSU_ID,
    bekle: (ms) => new Promise((c) => setTimeout(c, ms)),
    simdi: () => Date.now(),
  });
  yaz(GITHUB_OUTPUT, r);
}

function yaz(cikti, r) {
  process.stdout.write(`::notice::edited ayna: ${r.atla ? 'ATLA (ağır adımlar koşmayacak)' : 'TAM KOŞU'} — ${r.neden}\n`);
  if (cikti) fs.appendFileSync(cikti, `atla=${r.atla ? 'true' : 'false'}\nneden=${String(r.neden).replace(/[\r\n]+/g, ' ')}\n`);
}

if (require.main === module) {
  main().catch((e) => {
    process.stdout.write(`::notice::edited ayna: TAM KOŞU — beklenmeyen hata: ${String(e && e.message).slice(0, 160)}\n`);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'atla=false\nneden=beklenmeyen hata\n');
  });
}

module.exports = { AYNA_ADIM_ADI, BEKLEME_SN, GUVENLIK_PAYI_SN, calistir, karar, siniflandir };
