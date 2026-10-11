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
 *   2. o tam koşu AYNI TABANI test etmiş: her tam koşu test ettiği tabanı (merge-ref'in birinci ebeveyni) `taban izi <sha>`
 *      adlı adımın ADINA yazar; bu koşunun tabanı (`git rev-parse HEAD^1`) o izle BİREBİR aynı olmalı (B1),
 *   3. bu iz taşıyan koşuların HİÇBİRİ kırmızı/iptal değil; en az biri `success` ile BİTMİŞ (süren varsa bitmesi BEKLENİR).
 * Aksi her durumda (ve her hatada) TAM koşu yapılır. Yani yeşil bir `ci` DAİMA gerçek bir tam yeşile dayanır;
 * bir düzenleme kırmızı bir koşuyu yeşile ÇEVİREMEZ. PR kayıt kapısı bu adımdan ÖNCE koşar ve her zaman koşar.
 *
 * GÜVENLİK İNCELEMESİ (ALT-38a, security-reviewer): önceki sürüm adayı yalnız head SHA ile seçiyor, tabanı tarihle
 * kıyaslıyordu.
 *   B1 (yüksek): aynı SHA'lı iki PR'dan birinin yeşil koşusu ötekinin kırmızısını örtebilirdi; `gh pr edit --base` ile taban
 *      değişince X+yeni taban HİÇ test edilmeden birleşebilirdi. Şimdi: taban SHA'sı izle eşleşmek ZORUNDA (tarih ve güvenlik
 *      payı kalktı) ve `edited` yükünde `changes.base` doluysa (TABAN_DEGISTI) doğrudan TAM koşu.
 *   B2 (orta): karar PR'ın KENDİ kopyasından geliyordu. Şimdi ci.yml bu betiği TABANDAN (HEAD^1) çıkarıp koşturur
 *      (taban kopyası yoksa TAM); ayrıca PR bu mekanizmaya dokunuyorsa (scripts/ci/, iş akışları, vitest.config.ts,
 *      package.json) bu betik kendisi TAM der.
 *   B4 (düşük): aynı head+taban için BİRDEN FAZLA tam koşu varsa HERHANGİ biri kırmızıysa TAM (sıralamaya güvenilmez:
 *      yeniden koşturma `created_at`'i değiştirmez).
 *   B5 (düşük): bekleme döngüsü her turda yalnız koşu listesini okur; biten koşunun işleri BİR KEZ okunur (önbellek),
 *      aralık 30 sn (GITHUB_TOKEN bütçesi saatte 1000 istek).
 * Güven sınırı: iş akışı dosyasının KENDİSİNİ (ci.yml) değiştiren bir PR bu korumayı da değiştirebilir; onu kod incelemesi
 * yakalar (cetvel: docs/standards/test-karnesi-standard.md §4).
 *
 * Çıktı: `$GITHUB_OUTPUT` içine `atla=true|false` ve `neden=<tek satır>`; ayrıca ekrana `::notice::`.
 * Çıkış kodu DAİMA 0 (ölçemezse atla=false: tam koşu).
 *
 * Ortam: GH_TOKEN, DEPO (sahip/depo), HEAD_SHA, KOSU_ID (bu koşunun id'si), TABAN_DEGISTI ('true' ise taban değişti),
 * GITHUB_OUTPUT. Çalışma dizini = PR'ın merge-ref checkout'u (HEAD = birleşim, HEAD^1 = taban, HEAD^2 = PR başı).
 */
'use strict';

const cp = require('node:child_process');
const fs = require('node:fs');

/** ci.yml'deki adım adıyla BİREBİR aynı olmalı (INV-CI-EDITED-1 doğrular): ayna koşusunu bu adımın sonucundan tanırız. */
const AYNA_ADIM_ADI = 'edited ayna kararı';
/** ci.yml'deki iz adımının adının BAŞI; devamı 40 haneli taban SHA'sıdır (INV-CI-EDITED-1 doğrular). */
const IZ_ADIM_ONEKI = 'taban izi ';
const IZ_DESENI = /^taban izi ([0-9a-f]{40})$/;
const SHA_DESENI = /^[0-9a-f]{40}$/;
const IS_ADI = 'ci';
const ARALIK_SN = 30;
const BEKLEME_SN = 660;
const EN_FAZLA_ADAY = 6;
/** PR bunlara dokunuyorsa karar mekanizmasının kendisi değişiyor: atlama YOK (B2). */
const MEKANIZMA_YOLLARI = ['scripts/ci/', '.github/workflows/'];
const MEKANIZMA_DOSYALARI = ['vitest.config.ts', 'package.json'];

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
 * Bir koşunun test ettiği taban SHA'sı: `ci` işinde BAŞARIYLA bitmiş, adı `taban izi <40 hane>` olan TEK adımdan.
 * İz yoksa, adım başarısızsa/atlandıysa, SHA geçersizse ya da birden fazla iz adımı varsa null (iz yok = kanıt yok).
 */
function izTabani(isler) {
  const is = ((isler && isler.jobs) || []).find((j) => j.name === IS_ADI);
  if (!is) return null;
  const izler = (is.steps || []).filter((s) => s && s.conclusion === 'success' && IZ_DESENI.test(String(s.name)));
  if (izler.length !== 1) return null;
  return IZ_DESENI.exec(String(izler[0].name))[1];
}

/** PR'ın değiştirdiği dosyalardan karar mekanizmasına ait olanlar (B2). */
function mekanizmayaDokunan(dosyalar) {
  return (dosyalar || []).filter((d) => MEKANIZMA_DOSYALARI.includes(d) || MEKANIZMA_YOLLARI.some((y) => String(d).startsWith(y)));
}

const tamKoru = (neden) => ({ atla: false, bekle: false, neden });

/**
 * Karar (saf). `adaylar`: bu koşudan ÖNCE başlamış, aynı head SHA'lı koşular, SINIFLANDIRILMIŞ:
 * [{ id, status, conclusion, created_at, tur, taban }]. `tabanSha`: BU koşunun test ettiği taban (HEAD^1).
 * Dönüş: { atla, bekle, neden }.
 */
function karar({ adaylar, tabanSha }) {
  if (!SHA_DESENI.test(String(tabanSha))) return tamKoru('bu koşunun tabanı (HEAD^1) okunamadı');
  const uygun = adaylar.filter((a) => a.tur === 'tam' && a.taban === tabanSha);
  const bozuk = uygun.find((a) => a.status === 'completed' && a.conclusion !== 'success');
  if (bozuk) return tamKoru(`aynı head ve tabanı test eden tam koşu ${bozuk.id} sonucu "${bozuk.conclusion}" (yalnız success atlatır)`);
  const belirsiz = adaylar.find((a) => a.tur === 'belirsiz' && a.status !== 'completed');
  if (belirsiz) return { atla: false, bekle: true, neden: `koşu ${belirsiz.id} henüz sınıflandırılamıyor (adımlar başlamadı)` };
  if (!uygun.length) return tamKoru('aynı head SHA ve AYNI taban (taban izi) için BİTMİŞ ya da süren bir TAM koşu yok');
  const suren = uygun.find((a) => a.status !== 'completed');
  if (suren) return { atla: false, bekle: true, neden: `tam koşu ${suren.id} sürüyor (${suren.status})` };
  const idler = uygun.map((a) => a.id).join(', ');
  return { atla: true, bekle: false, neden: `kod ve taban aynı: tam koşu ${idler} success; taban ${tabanSha.slice(0, 12)}` };
}

/** Bir koşuyu sınıflandırır; BİTMİŞ koşunun işleri bir kez okunur (B5). */
async function adayOlustur(k, api, onbellek) {
  const anahtar = `${k.id}|${k.status}|${k.conclusion}|${k.updated_at || ''}`;
  let isler;
  if (k.status === 'completed' && onbellek.has(anahtar)) {
    isler = onbellek.get(anahtar);
  } else {
    isler = await api.isler(k.id);
    if (k.status === 'completed') onbellek.set(anahtar, isler);
  }
  return { id: k.id, status: k.status, conclusion: k.conclusion, created_at: k.created_at, tur: siniflandir(isler), taban: izTabani(isler) };
}

/**
 * Akış: yerel ön koşulları denetle (taban değişti mi, merge-ref biçimi, mekanizmaya dokunuluyor mu), sonra adayları topla,
 * sınıflandır, karar ver; "tam koşu sürüyor" ise bitmesini bekle (en fazla BEKLEME_SN).
 * `api`: { kosular(sha), isler(id), ebeveynler(), degisenDosyalar() }. `bekle(ms)` ve `simdi()` test için enjekte edilir.
 * Her hatada TAM koşu (atla=false); bu fonksiyon FIRLATMAZ.
 */
async function calistir({ api, sha, kendiId, tabanDegisti = false, bekle, simdi, bekleSn = BEKLEME_SN, aralikSn = ARALIK_SN }) {
  try {
    if (tabanDegisti) return { atla: false, neden: 'PR\'ın taban dalı bu düzenlemede değişti (changes.base): önceki tam koşu başka tabana karşıydı' };
    if (!SHA_DESENI.test(String(sha))) return { atla: false, neden: 'HEAD_SHA geçerli bir 40 haneli SHA değil' };
    const ebeveynler = await api.ebeveynler();
    if (!Array.isArray(ebeveynler) || ebeveynler.length !== 2 || !SHA_DESENI.test(String(ebeveynler[0])) || ebeveynler[1] !== sha) {
      return { atla: false, neden: 'checkout beklenen merge-ref değil (HEAD^1 taban, HEAD^2 PR başı olmalı)' };
    }
    const tabanSha = ebeveynler[0];
    const dokunulan = mekanizmayaDokunan(await api.degisenDosyalar());
    if (dokunulan.length) {
      return { atla: false, neden: `PR karar mekanizmasına dokunuyor (${dokunulan.slice(0, 3).join(', ')}${dokunulan.length > 3 ? ', …' : ''}): atlama yok` };
    }
    const son = simdi() + bekleSn * 1000;
    const onbellek = new Map();
    for (;;) {
      const kosular = await api.kosular(sha);
      const kendi = kosular.find((k) => String(k.id) === String(kendiId));
      const bizdenEski = (k) => String(k.id) !== String(kendiId) && (!kendi || Date.parse(k.created_at) <= Date.parse(kendi.created_at));
      const adaylar = [];
      for (const k of kosular.filter(bizdenEski).sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, EN_FAZLA_ADAY)) {
        adaylar.push(await adayOlustur(k, api, onbellek));
      }
      const k = karar({ adaylar, tabanSha });
      if (!k.bekle) return { atla: k.atla, neden: k.neden };
      if (simdi() >= son) return { atla: false, neden: `${k.neden}; bekleme süresi (${bekleSn} sn) doldu → tam koşu` };
      await bekle(aralikSn * 1000);
    }
  } catch (e) {
    return { atla: false, neden: `ölçülemedi: ${String(e && e.message ? e.message : e).slice(0, 200)} → tam koşu` };
  }
}

function calistirCikti(komut, args) {
  return new Promise((coz, red) => {
    cp.execFile(komut, args, { maxBuffer: 64 * 1024 * 1024, windowsHide: true }, (err, cikti, hata) => {
      if (err) red(new Error(`${komut} ${args[0]}: ${(hata || err.message).trim().slice(0, 200)}`));
      else coz(cikti);
    });
  });
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
      return (y.workflow_runs || []).map((r) => ({ id: r.id, status: r.status, conclusion: r.conclusion, created_at: r.created_at, updated_at: r.updated_at }));
    },
    async isler(id) {
      return JSON.parse(await ghApi(`repos/${depo}/actions/runs/${id}/jobs?per_page=30`));
    },
    async ebeveynler() {
      return (await calistirCikti('git', ['rev-parse', 'HEAD^1', 'HEAD^2'])).trim().split(/\r?\n/);
    },
    async degisenDosyalar() {
      return (await calistirCikti('git', ['diff', '--name-only', '--no-renames', '-z', 'HEAD^1', 'HEAD'])).split('\0').filter(Boolean);
    },
  };
}

async function main() {
  const { DEPO, HEAD_SHA, KOSU_ID, TABAN_DEGISTI, GITHUB_OUTPUT } = process.env;
  if (!DEPO || !HEAD_SHA || !KOSU_ID) {
    process.stderr.write('[edited-ayna] eksik ortam (DEPO, HEAD_SHA, KOSU_ID) → tam koşu\n');
    yaz(GITHUB_OUTPUT, { atla: false, neden: 'eksik ortam' });
    return;
  }
  const r = await calistir({
    api: gercekApi(DEPO),
    sha: HEAD_SHA,
    kendiId: KOSU_ID,
    tabanDegisti: TABAN_DEGISTI === 'true',
    bekle: (ms) => new Promise((c) => setTimeout(c, ms)),
    simdi: () => Date.now(),
  });
  yaz(GITHUB_OUTPUT, r);
}

/** `neden` TEK satıra indirilir: satır sonu `::notice::` satırından çıkıp yeni bir iş akışı komutu yazamasın (enjeksiyon). */
const tekSatir = (m) => String(m).replace(/[\r\n]+/g, ' ');

function yaz(cikti, r) {
  const neden = tekSatir(r.neden);
  process.stdout.write(`::notice::edited ayna: ${r.atla ? 'ATLA (ağır adımlar koşmayacak)' : 'TAM KOŞU'} — ${neden}\n`);
  if (cikti) fs.appendFileSync(cikti, `atla=${r.atla ? 'true' : 'false'}\nneden=${neden}\n`);
}

if (require.main === module) {
  main().catch((e) => {
    process.stdout.write(`::notice::edited ayna: TAM KOŞU — beklenmeyen hata: ${tekSatir(String(e && e.message).slice(0, 160))}\n`);
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'atla=false\nneden=beklenmeyen hata\n');
  });
}

// `gercekApi`, `ghApi`, `main` ve `yaz` YALNIZ sınanabilsin diye dışa açıktır (test: scripts/ci/__tests__/edited-ayna.test.ts):
// dış dünya `child_process.execFile` sınırında sahtelenir, ağa ve gerçek `gh`/`git`e çıkılmaz. Davranış değişmez.
module.exports = {
  ARALIK_SN,
  AYNA_ADIM_ADI,
  BEKLEME_SN,
  IZ_ADIM_ONEKI,
  calistir,
  gercekApi,
  ghApi,
  izTabani,
  karar,
  main,
  mekanizmayaDokunan,
  siniflandir,
  yaz,
};
