#!/usr/bin/env node
/**
 * ALT-82 · DAĞITIM HAZIR KAPISI — master'a her birleşmeden SONRA o commit'in Vercel üretim dağıtımının sonucunu ölçer.
 *
 * NİÇİN VAR (ölçüldü, 12-14 Ekim): ci.yml yeşil olsa da üretim dağıtımı ayrı bir sistemde (Vercel) yürür ve orada kırılabilir.
 * 12 Ekim'de iki birleşme (5d82ca6dc, 17212fba1) "Deployment has failed" ile düştü ve hiçbir kapı kırmızı vermedi: birleşmeden sonra dağıtımın
 * çıkıp çıkmadığına bakan kimse yoktu. Bu kapı o boşluğu kapatır; BİRLEŞMEYİ BLOKLAMAZ (push-only, zorunlu çekirdeğe girmez), yalnız sonucu görünür kılar.
 *
 * NE ÖLÇER: GitHub commit status uç noktasını (`GET /repos/<repo>/commits/<sha>/status`) yoklar; bağlamı `Vercel` olan kaydın durumunu okur.
 * Vercel API'si, token'ı ve errorCode'u KULLANILMAZ: commit durumundan yalnız `state` ve `description` gelir (errorCode gelmez).
 *
 * SINIFLAR ve ÇIKIŞ (kartın kararı):
 *   READY                  success + /completed/                               → ::notice, çıkış 0
 *   ATLANDI                success + /Ignored Build Step/                      → ::notice, çıkış 0 (site kodu içermeyen birleşme; KIRMIZI DEĞİL)
 *   İPTAL, yerine geçildi  failure + /^Canceled/, master ucu bu commit DEĞİL    → ::notice, çıkış 0
 *   İPTAL, yerine geçen yok failure + /^Canceled/, master ucu BU commit         → ::error,  çıkış 1 (elle dağıtım gerekir)
 *   HATA                   failure/error + diğer her şey                       → ::error,  çıkış 1
 *   ZAMAN_AŞIMI            ~12 dk (20 sn aralıkla) içinde terminal durum yok   → ::warning, çıkış 0
 *   ÖLÇÜLEMEDİ             API okunamadı (401/403/404/422, ağ, 5xx sürekli), girdi eksik/geçersiz, beklenmeyen state ya da tanınmayan
 *                          success açıklaması                                  → ::warning, çıkış 0 — "ölçülemedi" açıkça yazılır, SESSİZ YEŞİL YOK
 *   `pending` yalnız state'e bakılarak beklenir (açıklama metnine bağımlı değil); `Vercel` bağlamı hiç yoksa yoklama sürer (dağıtım henüz açılmamış olabilir).
 *
 * KARAR NOTLARI (sapma yok, yorum): `error` state'i (GitHub'ın dördüncü durumu) `failure` gibi sayılır; tanınmayan state'in kendisi ÖLÇÜLEMEDİ'dir.
 * Kalıcı görünen HTTP kodlarında (401/403/404/422) yoklama SÜRMEZ: yetki/uç yanlışı beklemekle düzelmez ve hız sınırını zorlamamak gerekir.
 *
 * GÜVEN SINIRI: commit durumu açıklaması ve hedef URL'si DIŞARIDAN gelen veridir; iş akışı komutu enjeksiyonuna karşı çıktıya girmeden temizlenir
 * (kontrol karakteri → boşluk, `%` silinir, `::` tek olur; scripts/ci/test-sec.cjs `satirTemizle` kalıbı). Token hiçbir satıra yazılmaz (yazılırsa maskelenir).
 *
 * Kullanım: node scripts/ci/dagitim-hazir-kapisi.cjs   (ortam: GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_TOKEN; isteğe bağlı GITHUB_REF)
 * Kütüphane: const { vercelDurumu, hukumVer, olc, main, satirTemizle } = require('./scripts/ci/dagitim-hazir-kapisi.cjs');
 * Cetvel: docs/standards/fleet-mechanism-standard.md §38.
 */
'use strict';

const API_KOKU = 'https://api.github.com';
const VERCEL_BAGLAMI = 'Vercel';
const YOKLAMA_ARALIGI_MS = 20 * 1000;
const YOKLAMA_AZAMI_MS = 12 * 60 * 1000;
const ISTEK_ZAMAN_ASIMI_MS = 15 * 1000;
const PARCA_AZAMI = 160;
const SATIR_AZAMI = 700;
const SHA_DESENI = /^[0-9a-f]{40}$/i;
const REPO_DESENI = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const KALICI_HTTP = new Set([401, 403, 404, 422]);
const GEREKEN_REF = 'refs/heads/master';

/** C0/C1 kontrol karakterleri ve satır/paragraf ayırıcıları: çıktıda yeni satır açıp komut uydurabilir. */
function kontrolKodu(kod) {
  return kod < 32 || (kod >= 127 && kod <= 159) || kod === 0x2028 || kod === 0x2029;
}

/** Gizli değerin (token) her geçtiği yeri maskeler; çok kısa gizli maskelenmez (yanlış eşleşme). */
function maskele(metin, gizli) {
  return typeof gizli === 'string' && gizli.length >= 4 ? metin.split(gizli).join('***') : metin;
}

/** Çıktıya girecek tek satırlık metin (iş akışı komutu enjeksiyonuna karşı). `gizli` verilirse (token) maskelenir. */
function satirTemizle(metin, azami = PARCA_AZAMI, gizli = '') {
  const ham = maskele(metin === null || metin === undefined ? '' : String(metin), gizli);
  const kisa = ham.length > azami ? `${ham.slice(0, azami)}…` : ham;
  let temiz = '';
  for (let i = 0; i < kisa.length; i++) temiz += kontrolKodu(kisa.charCodeAt(i)) ? ' ' : kisa.charAt(i);
  return temiz.split('%').join('').replace(/:{2,}/g, ':');
}

function hataMetni(e) {
  return e instanceof Error ? e.message : String(e);
}

function sha7(sha) {
  return typeof sha === 'string' ? sha.slice(0, 7) : '?';
}

/**
 * SAF sınıflayıcı: birleşik durum yanıtından (`commits/<sha>/status` gövdesi) Vercel bağlamının anlık sınıfını çıkarır.
 * Dönen `sinif`: YOK · BEKLIYOR · READY · ATLANDI · IPTAL · HATA · BELIRSIZ.
 */
function vercelDurumu(govde) {
  if (govde === null || typeof govde !== 'object' || !Array.isArray(govde.statuses)) {
    return { sinif: 'BELIRSIZ', neden: 'durum yanıtı tanınmadı (statuses dizisi yok)' };
  }
  const nesneler = govde.statuses.filter((s) => s !== null && typeof s === 'object');
  const vercel = nesneler.filter((s) => s.context === VERCEL_BAGLAMI);
  if (vercel.length === 0) {
    return { sinif: 'YOK', baglamlar: nesneler.map((s) => String(s.context)) };
  }
  const zaman = (s) => (typeof s.updated_at === 'string' ? s.updated_at : '');
  const kayit = vercel.reduce((a, b) => (zaman(b) >= zaman(a) ? b : a));
  const state = typeof kayit.state === 'string' ? kayit.state.toLowerCase() : '';
  const aciklama = typeof kayit.description === 'string' ? kayit.description : '';
  const url = typeof kayit.target_url === 'string' ? kayit.target_url : '';
  const ayrinti = { state, aciklama, url };
  if (state === 'pending') return { sinif: 'BEKLIYOR', ...ayrinti };
  if (state === 'success') {
    if (/Ignored Build Step/i.test(aciklama)) return { sinif: 'ATLANDI', ...ayrinti };
    if (/completed/i.test(aciklama)) return { sinif: 'READY', ...ayrinti };
    return { sinif: 'BELIRSIZ', neden: 'success ama açıklama tanınmadı', ...ayrinti };
  }
  if (state === 'failure' || state === 'error') {
    if (/^\s*cancell?ed/i.test(aciklama)) return { sinif: 'IPTAL', ...ayrinti };
    return { sinif: 'HATA', ...ayrinti };
  }
  return { sinif: 'BELIRSIZ', neden: `beklenmeyen state: ${state === '' ? '(boş)' : state}`, ...ayrinti };
}

/**
 * SAF hüküm: terminal bir anlık sınıftan (ve gerekirse master ucundan) çıkış kararı üretir.
 * @param {{sinif:string, state?:string, aciklama?:string, url?:string, neden?:string}} olcum `vercelDurumu` çıktısı (terminal sınıf)
 * @param {{sha:string, masterSha?:string|null, masterHata?:string}} baglam
 * @returns {{sinif:string, seviye:'notice'|'warning'|'error', cikis:0|1, mesaj:string}}
 */
function hukumVer(olcum, baglam) {
  const kisa = sha7(baglam.sha);
  const aciklama = satirTemizle(olcum.aciklama);
  const url = olcum.url ? ` ayrıntı: ${satirTemizle(olcum.url)}` : '';
  switch (olcum.sinif) {
    case 'READY':
      return { sinif: 'READY', seviye: 'notice', cikis: 0, mesaj: `Vercel üretim dağıtımı hazır (${kisa}): ${aciklama}` };
    case 'ATLANDI':
      return { sinif: 'ATLANDI', seviye: 'notice', cikis: 0, mesaj: `Vercel dağıtımı atlandı (${kisa}): site kodu içermiyor, üretime çıkmadı; kırmızı değil (${aciklama})` };
    case 'IPTAL': {
      const master = typeof baglam.masterSha === 'string' && SHA_DESENI.test(baglam.masterSha) ? baglam.masterSha.toLowerCase() : null;
      if (master === null) {
        return {
          sinif: 'OLCULEMEDI',
          seviye: 'warning',
          cikis: 0,
          mesaj: `ÖLÇÜLEMEDİ (${kisa}): dağıtım iptal edilmiş (${aciklama}) ama master ucu okunamadı (${satirTemizle(baglam.masterHata || 'yanıt tanınmadı')}); yerine geçen olup olmadığı bilinmiyor, elle bak`,
        };
      }
      if (master !== String(baglam.sha).toLowerCase()) {
        return {
          sinif: 'IPTAL_YERINE_GECILDI',
          seviye: 'notice',
          cikis: 0,
          mesaj: `Vercel dağıtımı iptal edildi (${kisa}) ama master ucu ${sha7(master)}: yerine geçen birleşmenin sonucu kendi koşusunda ölçülür (${aciklama})`,
        };
      }
      return {
        sinif: 'IPTAL_YERINE_GECEN_YOK',
        seviye: 'error',
        cikis: 1,
        mesaj: `Vercel üretim dağıtımı iptal edildi ve yerine geçen yok (${kisa}; master ucu bu commit): elle dağıtım gerekir (karar 342: OPS'a tek satır, Recep sözü OPS'ta) (${aciklama})${url}`,
      };
    }
    case 'HATA':
      return {
        sinif: 'HATA',
        seviye: 'error',
        cikis: 1,
        mesaj:
          `Vercel üretim dağıtımı BAŞARISIZ (${kisa}): ${aciklama}.${url} GitHub ikincil hız sınırı (git_info_fail) olabilir ` +
          `(hata kodu commit durumundan okunamaz); \`npx vercel inspect <dağıtım-url>\` ile bak ve karar 342 ile elle dağıt (OPS'a tek satır).`,
      };
    default:
      return {
        sinif: 'OLCULEMEDI',
        seviye: 'warning',
        cikis: 0,
        mesaj: `ÖLÇÜLEMEDİ (${kisa}): ${satirTemizle(olcum.neden || 'sınıflanamadı')}. Bu YEŞİL DEĞİL: dağıtımın sonucu bilinmiyor, elle bak`,
      };
  }
}

/** Bir GitHub API uç noktasını okur. Dönüş: {tamam:true, govde} ya da {tamam:false, kalici, neden}. Hiçbir durumda fırlatmaz. */
async function jsonOku(fetchFn, url, token) {
  let yanit;
  try {
    yanit = await fetchFn(url, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'User-Agent': 'venthub-dagitim-hazir-kapisi',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(ISTEK_ZAMAN_ASIMI_MS),
    });
  } catch (e) {
    // Token KESMEDEN ÖNCE, kaynakta maskelenir: sonradan kesilen metin token'ın yarısını sızdırabilir.
    return { tamam: false, kalici: false, neden: `ağ hatası: ${maskele(hataMetni(e), token)}` };
  }
  if (!yanit || yanit.ok !== true) {
    const kod = yanit ? yanit.status : 'yanıt yok';
    return { tamam: false, kalici: KALICI_HTTP.has(kod), neden: `GitHub API HTTP ${kod}` };
  }
  try {
    return { tamam: true, govde: await yanit.json() };
  } catch (e) {
    return { tamam: false, kalici: false, neden: `JSON okunamadı: ${maskele(hataMetni(e), token)}` };
  }
}

function olculemedi(sha, neden) {
  return hukumVer({ sinif: 'BELIRSIZ', neden }, { sha: String(sha || '') });
}

/**
 * Yoklama döngüsü. Tüm dış etkiler enjekte edilir (ağ yok): `fetch`, `uyku(ms)`, `saat()`.
 * @returns {Promise<{sinif:string, seviye:string, cikis:number, mesaj:string, deneme:number}>}
 */
async function olc(girdi) {
  const { repo, sha, token, uyku, saat } = girdi;
  const fetchFn = girdi.fetch;
  const aralikMs = girdi.aralikMs === undefined ? YOKLAMA_ARALIGI_MS : girdi.aralikMs;
  const azamiMs = girdi.azamiMs === undefined ? YOKLAMA_AZAMI_MS : girdi.azamiMs;
  const gunluk = typeof girdi.gunluk === 'function' ? girdi.gunluk : () => {};

  if (typeof repo !== 'string' || !REPO_DESENI.test(repo)) return { ...olculemedi(sha, 'GITHUB_REPOSITORY yok ya da geçersiz'), deneme: 0 };
  if (typeof sha !== 'string' || !SHA_DESENI.test(sha)) return { ...olculemedi(sha, 'GITHUB_SHA yok ya da geçersiz'), deneme: 0 };
  if (typeof token !== 'string' || token === '') return { ...olculemedi(sha, 'GITHUB_TOKEN yok'), deneme: 0 };
  if (typeof fetchFn !== 'function') return { ...olculemedi(sha, 'fetch kullanılamıyor (Node 18+ gerekir)'), deneme: 0 };

  const durumUrl = `${API_KOKU}/repos/${repo}/commits/${sha}/status?per_page=100`;
  const masterUrl = `${API_KOKU}/repos/${repo}/commits/master`;
  const baslangic = saat();
  let deneme = 0;
  let sonHata = null;
  let sonOlcum = null;

  for (;;) {
    deneme += 1;
    const okuma = await jsonOku(fetchFn, durumUrl, token);
    if (!okuma.tamam) {
      sonHata = okuma.neden;
      gunluk(`deneme ${deneme}: okunamadı (${okuma.neden})`);
      if (okuma.kalici) return { ...olculemedi(sha, `${okuma.neden} (kalıcı görünüyor: yetki/uç; yoklama sürdürülmedi)`), deneme };
    } else {
      sonHata = null;
      sonOlcum = vercelDurumu(okuma.govde);
      gunluk(`deneme ${deneme}: ${sonOlcum.sinif}${sonOlcum.state ? ` (state=${sonOlcum.state})` : ''}`);
      if (sonOlcum.sinif === 'IPTAL') {
        const m = await jsonOku(fetchFn, masterUrl, token);
        const masterSha = m.tamam && m.govde !== null && typeof m.govde === 'object' ? m.govde.sha : null;
        const masterHata = m.tamam ? 'yanıtta sha yok' : m.neden;
        return { ...hukumVer(sonOlcum, { sha, masterSha, masterHata }), deneme };
      }
      if (sonOlcum.sinif !== 'YOK' && sonOlcum.sinif !== 'BEKLIYOR') return { ...hukumVer(sonOlcum, { sha }), deneme };
    }
    if (saat() - baslangic + aralikMs > azamiMs) break;
    await uyku(aralikMs);
  }

  const dk = Math.round(azamiMs / 60000);
  if (sonHata !== null) {
    return { ...olculemedi(sha, `son ${dk} dk içinde durum hiç okunamadı (son hata: ${sonHata})`), deneme };
  }
  const son = sonOlcum && sonOlcum.sinif === 'BEKLIYOR' ? 'pending' : `Vercel bağlamı görülmedi (görülen bağlamlar: ${((sonOlcum && sonOlcum.baglamlar) || []).slice(0, 8).map((b) => satirTemizle(b, 40)).join(', ') || 'yok'})`;
  return {
    sinif: 'ZAMAN_ASIMI',
    seviye: 'warning',
    cikis: 0,
    mesaj: `Vercel dağıtımı ${dk} dk içinde terminal duruma ulaşmadı (${sha7(sha)}; son: ${son}); kapı bloklamaz, OPS dağıtımı elle kontrol etmeli`,
    deneme,
  };
}

/** İş akışı komutu satırı. */
function komutSatiri(seviye, mesaj, gizli = '') {
  return `::${seviye}::${satirTemizle(mesaj, SATIR_AZAMI, gizli)}\n`;
}

/** CLI gövdesi. Çıkış kodunu döner; asla fırlatmaz (iç hata ÖLÇÜLEMEDİ'dir, birleşmeyi bloklamaz). */
async function main(ortam, yaz, bagimliliklar) {
  const dep = bagimliliklar || {};
  const token = typeof ortam.GITHUB_TOKEN === 'string' ? ortam.GITHUB_TOKEN : '';
  const gunluk = (metin) => yaz(`[dagitim-hazir] ${satirTemizle(metin, PARCA_AZAMI, token)}\n`);
  try {
    if (typeof ortam.GITHUB_REF === 'string' && ortam.GITHUB_REF !== '' && ortam.GITHUB_REF !== GEREKEN_REF) {
      yaz(komutSatiri('notice', `dağıtım kapısı yalnız master içindir (ref: ${satirTemizle(ortam.GITHUB_REF)}); ölçülmedi`));
      return 0;
    }
    const sonuc = await olc({
      repo: ortam.GITHUB_REPOSITORY,
      sha: ortam.GITHUB_SHA,
      token,
      fetch: dep.fetch || globalThis.fetch,
      uyku: dep.uyku || ((ms) => new Promise((coz) => setTimeout(coz, ms))),
      saat: dep.saat || (() => Date.now()),
      aralikMs: dep.aralikMs,
      azamiMs: dep.azamiMs,
      gunluk,
    });
    yaz(`[dagitim-hazir] sonuç: ${sonuc.sinif} · ${sonuc.deneme} deneme\n`);
    yaz(komutSatiri(sonuc.seviye, sonuc.mesaj, token));
    return sonuc.cikis;
  } catch (e) {
    yaz(komutSatiri('warning', `ÖLÇÜLEMEDİ: kapı beklenmeyen hatayla durdu (${hataMetni(e)}). Bu YEŞİL DEĞİL: dağıtımın sonucu bilinmiyor, elle bak`, token));
    return 0;
  }
}

if (require.main === module) {
  main(process.env, (s) => process.stdout.write(s)).then(
    (kod) => {
      process.exitCode = kod;
    },
    (e) => {
      process.stdout.write(`::warning::ÖLÇÜLEMEDİ: kapı çöktü (${satirTemizle(hataMetni(e))})\n`);
      process.exitCode = 0;
    },
  );
}

module.exports = {
  API_KOKU,
  VERCEL_BAGLAMI,
  YOKLAMA_ARALIGI_MS,
  YOKLAMA_AZAMI_MS,
  hukumVer,
  komutSatiri,
  main,
  olc,
  satirTemizle,
  vercelDurumu,
};
