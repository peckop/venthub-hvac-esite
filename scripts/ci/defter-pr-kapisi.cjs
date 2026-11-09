#!/usr/bin/env node
'use strict';
/**
 * DEFTER PR KAPISI (OPS-258, ALT-178): "izlenen yol değişti, defter değişmedi" uyarısı.
 *
 * Plan: docs/plans/departman-defter-duzeni-2026-11-09.md §4.1 (manifest), §6.3 (PR kapısı), §7 (ALTYAPI görüşü).
 * Kalıp: scripts/board/pr-kayit-kapisi.cjs (saf mantık burada, CI yalnız girdiyi ortamdan okur; LLM yok, yeni sır yok).
 *
 * KURAL. PR'ın değiştirdiği dosyalar manifestteki bir defterin `izlenen` yollarıyla kesişiyorsa:
 *   (1) defter dosyası da değişmiş olmalı, ve
 *   (2) defterin `Son doğrulama: YYYY-MM-DD` tarihi ilerlemiş olmalı (boş dokunuş geçmesin), PR'ın açıldığı günden geri
 *       olmamalı ve gelecekte olmamalı.
 * Aksi hâlde ihlal. Muafiyet yalnız: PR gövdesinde `Defter-gerekmez: <sebep>` (en az 20 karakter; sayılır), bot PR'ı, manifestte
 * olmayan departman, `durum: emekli` kayıt.
 *
 * KİP. Varsayılan UYARI: ihlal `::warning` olur, çıkış kodu 0. KIRMIZI kip (çıkış 1) yalnız iş akışındaki `DEFTER_KAPISI_KIP`
 * ortam değişkeni ile açılır; UYARI → KIRMIZI geçişi iki haftalık ölçümden sonra OPS onayıyla yapılır (yanlış alarm sayımı:
 * her koşu `DEFTER_KAPISI {json}` satırı yazar ve adım özetine tablo ekler).
 *
 * FAIL-CLOSED. Değişen dosya listesi okunamazsa (`degisenYollariniOku` null) sonuç `olculemedi`: UYARI kipinde uyarı, KIRMIZI
 * kipinde çıkış 1. "Ölçülemedi" asla "yeşil" sayılmaz. Manifest dosyası YOKSA kapı atlanır (Harita manifesti birleştirene kadar
 * etkisiz); manifest VARSA ama bozuksa `olculemedi`.
 *
 * GÜVENLİK. PR gövdesi ve yazar yalnız ortam değişkeniyle gelir; gövde yalnız desenle okunur, açıklamaya YAZILMAZ (sebep metni
 * günlüğe basılmaz). Git yalnız argüman dizisiyle (`execFile`), kabuk yok.
 */

const fs = require('node:fs');
const path = require('node:path');
const childProcess = require('node:child_process');

const KOK = path.resolve(__dirname, '../..');
const MANIFEST_YOLU = 'docs/defter/manifest.json';
const KIPLER = ['uyari', 'kirmizi'];
const VARSAYILAN_KIP = 'uyari';
const DURUMLAR = ['planli', 'pilot', 'aktif', 'kontrolsuz', 'emekli'];
/** Kapı dışı durumlar: henüz kurulmamış (planli) ve kapatılmış (emekli) defter izlenmez (manifest sema:1, PR #2440). */
const ATLANAN_DURUMLAR = ['planli', 'emekli'];
const ISTISNA_ANAHTARI = 'Defter-gerekmez';
const ISTISNA_MIN_SEBEP = 20;
const GENIS_GLOB_ESIGI = 100;
const BOT_YAZARLAR = new Set(['dependabot[bot]', 'renovate[bot]', 'github-actions[bot]']);
const BOT_KALIBI = /\[bot\]$/i;
const GUN_KALIBI = /^\d{4}-\d{2}-\d{2}$/;

/** Kod çitleri ve HTML yorumlarındaki satırlar sayılmaz (şablon örneği kapıyı geçirmesin). */
function govdeyiTemizle(govde) {
  return String(govde || '')
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '');
}

/** `Defter-gerekmez: <sebep>` satırı. Sebep yalnız UZUNLUK için ölçülür, hiçbir yere yazılmaz. */
function istisnaBul(govde) {
  const temiz = govdeyiTemizle(govde);
  const kalip = new RegExp(`^[ \\t>*_-]*${ISTISNA_ANAHTARI}[ \\t]*:[ \\t]*(.*)$`, 'gim');
  const sebepler = [];
  let e;
  while ((e = kalip.exec(temiz)) !== null) sebepler.push(e[1].trim());
  if (sebepler.length === 0) return { var: false, gecerli: false, sebepUzunlugu: 0 };
  const enUzun = sebepler.reduce((a, s) => (s.length > a ? s.length : a), 0);
  return { var: true, gecerli: enUzun >= ISTISNA_MIN_SEBEP, sebepUzunlugu: enUzun };
}

function yolNormallestir(yol) {
  return String(yol).replace(/\\/g, '/').replace(/^\.\//, '');
}

/**
 * Dar glob: `**` (her derinlik), `*` (bir segment içi), `?` (bir karakter), sondaki `/` (dizin öneki). Başka özel karakter
 * düz metindir (köşeli/küme parantezi yok: sadelik, yanlış alarm yüzeyi küçük).
 */
function globRegex(glob) {
  let g = yolNormallestir(glob);
  if (g.endsWith('/')) g += '**';
  let r = '';
  for (let i = 0; i < g.length; i++) {
    const c = g[i];
    if (c === '*') {
      if (g[i + 1] === '*') {
        i++;
        if (g[i + 1] === '/') {
          r += '(?:.*/)?'; // `a/**/b`: sıfır ya da daha çok dizin (`a/b` ve `a/x/y/b`), `a/xb` DEĞİL
          i++;
        } else r += '.*';
      } else r += '[^/]*';
    } else if (c === '?') r += '[^/]';
    else r += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${r}$`);
}

function globEsle(glob, yol) {
  return globRegex(glob).test(yolNormallestir(yol));
}

function yolGecerliMi(y) {
  if (typeof y !== 'string' || y.trim() === '') return false;
  const n = yolNormallestir(y);
  return !(n.startsWith('/') || /^[A-Za-z]:/.test(n) || n.split('/').includes('..'));
}

/** Kayıt başına sorunlar (Harita'nın manifest testiyle AYNI şema: plan §4.1; burada yalnız kapının güvenle okuması için). */
function kaydiDogrula(k, depoDosyalari) {
  const sorunlar = [];
  if (!k || typeof k !== 'object') return ['kayıt nesne değil'];
  if (typeof k.ad !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(k.ad)) sorunlar.push('ad geçersiz');
  if (!yolGecerliMi(k.dosya)) sorunlar.push('dosya yolu geçersiz');
  if (typeof k.sahip !== 'string' || k.sahip.trim() === '') sorunlar.push('sahip yok');
  if (!DURUMLAR.includes(k.durum)) sorunlar.push('durum geçersiz');
  if (!Array.isArray(k.izlenen) || k.izlenen.length === 0 || !k.izlenen.every(yolGecerliMi)) sorunlar.push('izlenen geçersiz');
  else {
    for (const g of k.izlenen) {
      if (/^(\*\*?|\*\*\/\*\*?)$/.test(yolNormallestir(g))) sorunlar.push(`izlenen çok geniş: ${g}`);
    }
    if (Array.isArray(depoDosyalari)) {
      for (const g of k.izlenen) {
        const re = globRegex(g);
        let n = 0;
        for (const d of depoDosyalari) if (re.test(d)) n++;
        if (n > GENIS_GLOB_ESIGI) sorunlar.push(`izlenen glob ${n} dosyayı kapsıyor (eşik ${GENIS_GLOB_ESIGI}): ${g}`);
      }
    }
  }
  return sorunlar;
}

/** Manifesti kapı için ayıklar: geçerli (kapıya girer) ve sorunlu (kapı dışı + ihlal) kayıtlar. Saf. */
function manifestiAyikla(manifest, depoDosyalari) {
  const gecerli = [];
  const sorunlu = [];
  if (!manifest || !Array.isArray(manifest.defterler)) return { bozuk: true, gecerli, sorunlu };
  const adlar = new Map();
  const dosyalar = new Map();
  for (const k of manifest.defterler) {
    if (k && typeof k.ad === 'string') adlar.set(k.ad, (adlar.get(k.ad) || 0) + 1);
    if (k && typeof k.dosya === 'string') dosyalar.set(yolNormallestir(k.dosya), (dosyalar.get(yolNormallestir(k.dosya)) || 0) + 1);
  }
  for (const k of manifest.defterler) {
    const sorunlar = kaydiDogrula(k, depoDosyalari);
    if (k && typeof k.ad === 'string' && adlar.get(k.ad) > 1) sorunlar.push('ad tekrarlı');
    if (k && typeof k.dosya === 'string' && dosyalar.get(yolNormallestir(k.dosya)) > 1) sorunlar.push('aynı dosya birden çok kayıtta');
    if (sorunlar.length) sorunlu.push({ ad: k && k.ad ? String(k.ad) : '(adsız)', sorunlar });
    else gecerli.push(k);
  }
  return { bozuk: false, gecerli, sorunlu };
}

/** `Son doğrulama: 2026-11-09` (kalın işaretli ya da değil). Bulunamazsa null. */
function sonDogrulamaOku(metin) {
  if (typeof metin !== 'string') return null;
  const e = /^[ \t>*_-]*Son do[ğg]rulama[ \t*_]*:[ \t*_]*(\d{4}-\d{2}-\d{2})/im.exec(metin.replace(/\r\n?/g, '\n'));
  return e ? e[1] : null;
}

/** Saat dilimi farkı (yazar Türkiye saatiyle gece yarısı, CI UTC) yanlış alarm üretmesin: tarih kuralları ±1 gün toleranslı. */
const GUN_TOLERANSI = 1;

function gunKaydir(gun, n) {
  const d = new Date(`${gun}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Defter gövdesi, `Son doğrulama` satırları çıkarılmış hâliyle (yalnız tarih basarak sahte tazelik ayrımı için). */
function gövdeSansTarih(metin) {
  return String(metin || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .filter((s) => !/^[ \t>*_-]*Son do[ğg]rulama[ \t*_]*:/i.test(s))
    .join('\n')
    .trim();
}

/**
 * Karar. Saf: dosya sistemi, git ve ağ YOK.
 * girdi: { manifest, degisenYollar, govde, yazar, prAcilisGunu, bugun, defterMetinleri, depoDosyalari, kip }
 *   defterMetinleri: { [dosya]: { onceki: string|null, sonraki: string|null } }  (yalnız değişen defterler için)
 */
function degerlendir(girdi) {
  const kip = KIPLER.includes(girdi.kip) ? girdi.kip : VARSAYILAN_KIP;
  const bos = { kontrolEdilen: 0, kesisen: 0, uyumlu: 0, ihlalli: 0, muaf: 0 };
  const sonuc = (durum, neden, ekstra) => ({ kip, durum, neden, ihlaller: [], istisna: { var: false, gecerli: false, sebepUzunlugu: 0 }, kapsam: { ...bos }, ...ekstra });

  const yazarKucuk = String(girdi.yazar || '').toLowerCase();
  if (BOT_YAZARLAR.has(yazarKucuk) || BOT_KALIBI.test(yazarKucuk)) return sonuc('atlandi', 'bot');
  if (girdi.manifest === null || girdi.manifest === undefined) return sonuc('atlandi', 'manifest-yok');
  const istisna = istisnaBul(girdi.govde);
  const ayik = manifestiAyikla(girdi.manifest, girdi.depoDosyalari);
  if (ayik.bozuk) return sonuc('olculemedi', 'manifest-bozuk', { istisna });
  if (!Array.isArray(girdi.degisenYollar)) return sonuc('olculemedi', 'degisen-dosya-okunamadi', { istisna });

  const degisen = girdi.degisenYollar.map(yolNormallestir);
  const degisenKume = new Set(degisen);
  const metinler = girdi.defterMetinleri || {};
  const ihlaller = [];
  const kapsam = { ...bos, kontrolEdilen: ayik.gecerli.filter((k) => !ATLANAN_DURUMLAR.includes(k.durum)).length };

  for (const s of ayik.sorunlu) ihlaller.push({ defter: s.ad, tur: 'manifest-gecersiz', mesaj: s.sorunlar.join('; ') });

  const defterDosyalari = new Set(ayik.gecerli.map((k) => yolNormallestir(k.dosya)));
  let istisnaKullanildi = false;
  for (const k of ayik.gecerli) {
    if (ATLANAN_DURUMLAR.includes(k.durum)) continue;
    const dosya = yolNormallestir(k.dosya);
    // Defter dosyası (hiçbiri) bir başkasının izlenen yolu sayılmaz: defter, defterin izlenen yolu değildir (zincir alarmı olmasın).
    const kesisen = degisen.filter((y) => !defterDosyalari.has(y) && k.izlenen.some((g) => globEsle(g, y)));
    if (kesisen.length === 0) continue;
    kapsam.kesisen++;
    const dokunuldu = degisenKume.has(dosya);
    const ornek = kesisen.slice(0, 3).join(', ');
    if (!dokunuldu) {
      if (istisna.gecerli) { kapsam.muaf++; istisnaKullanildi = true; continue; }
      kapsam.ihlalli++;
      ihlaller.push({ defter: k.ad, tur: 'defter-degismedi', mesaj: `izlenen yol değişti (${kesisen.length} dosya, örn. ${ornek}) ama ${dosya} değişmedi` });
      continue;
    }
    const m = metinler[dosya] || {};
    const yeni = sonDogrulamaOku(m.sonraki);
    const eski = sonDogrulamaOku(m.onceki);
    let sorun = null;
    if (yeni === null) sorun = ['son-dogrulama-yok', `${dosya} içinde "Son doğrulama: YYYY-MM-DD" satırı yok`];
    else if (eski !== null && yeni <= eski) sorun = ['son-dogrulama-ilerlemedi', `Son doğrulama ilerlemedi (${eski} → ${yeni})`];
    else if (eski !== null && m.onceki !== null && gövdeSansTarih(m.onceki) === gövdeSansTarih(m.sonraki)) sorun = ['son-dogrulama-sahte', `${dosya} içinde yalnız "Son doğrulama" tarihi değişti, gövde aynı: tarih tek başına tazelik üretmez (plan §6.3)`];
    else if (GUN_KALIBI.test(String(girdi.prAcilisGunu || '')) && yeni < gunKaydir(girdi.prAcilisGunu, -GUN_TOLERANSI)) sorun = ['son-dogrulama-geri', `Son doğrulama (${yeni}) PR'ın açıldığı günden (${girdi.prAcilisGunu}) ${GUN_TOLERANSI} günden fazla geri`];
    else if (GUN_KALIBI.test(String(girdi.bugun || '')) && yeni > gunKaydir(girdi.bugun, GUN_TOLERANSI)) sorun = ['son-dogrulama-gelecek', `Son doğrulama (${yeni}) gelecekte (bugün ${girdi.bugun}, tolerans ${GUN_TOLERANSI} gün)`];
    if (sorun) {
      if (istisna.gecerli) { kapsam.muaf++; istisnaKullanildi = true; continue; }
      kapsam.ihlalli++;
      ihlaller.push({ defter: k.ad, tur: sorun[0], mesaj: sorun[1] });
    } else kapsam.uyumlu++;
  }

  if (istisna.var && !istisna.gecerli) {
    ihlaller.push({ defter: '-', tur: 'istisna-kisa', mesaj: `${ISTISNA_ANAHTARI} sebebi ${istisna.sebepUzunlugu} karakter; en az ${ISTISNA_MIN_SEBEP} gerekir` });
  }
  const durum = ihlaller.length === 0 ? 'yesil' : kip === 'kirmizi' ? 'kirmizi' : 'uyari';
  return { kip, durum, neden: ihlaller.length === 0 ? (kapsam.kesisen === 0 ? 'ilgisiz-pr' : 'uyumlu') : 'ihlal', ihlaller, istisna: { ...istisna, kullanildi: istisnaKullanildi }, kapsam };
}

/** Çıkış kodu: yalnız KIRMIZI kipte ihlal ya da ölçülemedi kırar. UYARI kipi HİÇBİR ZAMAN kırmaz. */
function cikisKodu(s) {
  if (s.kip !== 'kirmizi') return 0;
  return s.durum === 'kirmizi' || s.durum === 'olculemedi' ? 1 : 0;
}

/** GitHub ek açıklaması: yüzde ve satır sonu kaçışı (iş akışı komutu enjeksiyonuna karşı). */
function aciklamaKacis(s) {
  return String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A').replace(/::/g, ':​:');
}

/** `title=` özelliği için ek kaçış: `,` ve `:` özellik ayırıcıdır. */
function ozellikKacis(s) {
  return aciklamaKacis(s).replace(/:/g, '%3A').replace(/,/g, '%2C');
}

function satirlar(s) {
  const cikti = [];
  const seviye = s.kip === 'kirmizi' ? 'error' : 'warning';
  if (s.durum === 'olculemedi') {
    cikti.push(`::${seviye} title=Defter kapısı ölçülemedi::${aciklamaKacis(s.neden)}`);
  }
  for (const i of s.ihlaller) {
    cikti.push(`::${seviye} title=Defter kapısı (${s.kip === 'kirmizi' ? 'KIRMIZI' : 'UYARI'}) ${ozellikKacis(i.defter)}::${aciklamaKacis(`${i.tur}: ${i.mesaj}`)}`);
  }
  // Yanlış alarm sayımı: sabit anahtarlı tek satır (iki haftalık ölçüm bu satırı sayar). Sebep METNİ yazılmaz.
  cikti.push(`DEFTER_KAPISI ${JSON.stringify({ kip: s.kip, durum: s.durum, neden: s.neden, kapsam: s.kapsam, ihlal: s.ihlaller.map((i) => i.tur), istisna: { var: s.istisna.var, gecerli: s.istisna.gecerli, kullanildi: Boolean(s.istisna.kullanildi) } })}`);
  return cikti;
}

function ozetTablosu(s) {
  const k = s.kapsam;
  const t = [
    '### Defter PR kapısı',
    `Kip: **${s.kip === 'kirmizi' ? 'KIRMIZI' : 'UYARI'}** · Sonuç: **${s.durum}** (${s.neden})`,
    '',
    '| Kontrol edilen defter | İzlenen yolu değişen | Uyumlu | İhlalli | Muaf (`Defter-gerekmez`) |',
    '|---|---|---|---|---|',
    `| ${k.kontrolEdilen} | ${k.kesisen} | ${k.uyumlu} | ${k.ihlalli} | ${k.muaf} |`,
  ];
  if (s.ihlaller.length) {
    t.push('', '| Defter | Tür | Ayrıntı |', '|---|---|---|');
    for (const i of s.ihlaller) t.push(`| ${i.defter} | ${i.tur} | ${String(i.mesaj).replace(/\|/g, '\\|')} |`);
  }
  return t.join('\n') + '\n';
}

function varsayilanBagimliliklar() {
  return {
    okuManifest() {
      const yol = path.join(KOK, MANIFEST_YOLU);
      if (!fs.existsSync(yol)) return null;
      return JSON.parse(fs.readFileSync(yol, 'utf8')); // bozuksa fırlatır: main yakalar -> manifest-bozuk
    },
    degisenYollar() {
      return require('./dunya-durumu.cjs').degisenYollariniOku();
    },
    depoDosyalari() {
      const cikti = childProcess.execFileSync('git', ['ls-files', '-z'], { cwd: KOK, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 15000, stdio: ['ignore', 'pipe', 'ignore'] });
      return cikti.split('\0').filter(Boolean);
    },
    okuSonraki(dosya) {
      try { return fs.readFileSync(path.join(KOK, dosya), 'utf8'); } catch { return null; }
    },
    okuOnceki(dosya) {
      try {
        return childProcess.execFileSync('git', ['show', `HEAD^1:${dosya}`], { cwd: KOK, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, timeout: 10000, stdio: ['ignore', 'pipe', 'ignore'] });
      } catch { return null; }
    },
    yaz(metin) { process.stdout.write(metin + '\n'); },
    ozetYaz(yol, metin) { fs.appendFileSync(yol, metin); },
    simdi() { return new Date(); },
  };
}

/** CI girişi. Ortamdan okur; hiçbir koşulda fırlatmaz. Çıkış kodu döner. */
function main(env = process.env, bag = varsayilanBagimliliklar()) {
  let sonuc;
  try {
    const kip = KIPLER.includes(String(env.DEFTER_KAPISI_KIP || '').toLowerCase()) ? String(env.DEFTER_KAPISI_KIP).toLowerCase() : VARSAYILAN_KIP;
    if (!env.PR_YAZAR) {
      sonuc = { kip, durum: 'atlandi', neden: 'pr-degil', ihlaller: [], istisna: { var: false, gecerli: false, sebepUzunlugu: 0 }, kapsam: { kontrolEdilen: 0, kesisen: 0, uyumlu: 0, ihlalli: 0, muaf: 0 } };
    } else {
      let manifest;
      let manifestBozuk = false;
      try { manifest = bag.okuManifest(); } catch { manifestBozuk = true; }
      if (manifestBozuk) manifest = { bozuk: true };
      let depo = null;
      let degisen = null;
      try { depo = bag.depoDosyalari(); } catch { depo = null; }
      try { degisen = bag.degisenYollar(); } catch { degisen = null; }
      const simdi = bag.simdi();
      const bugun = simdi.toISOString().slice(0, 10);
      const acilis = String(env.PR_ACILIS || '').slice(0, 10);
      const defterMetinleri = {};
      if (manifest && Array.isArray(manifest.defterler) && Array.isArray(degisen)) {
        const kume = new Set(degisen.map(yolNormallestir));
        for (const k of manifest.defterler) {
          if (!k || !yolGecerliMi(k.dosya)) continue;
          const d = yolNormallestir(k.dosya);
          if (kume.has(d)) defterMetinleri[d] = { onceki: bag.okuOnceki(d), sonraki: bag.okuSonraki(d) };
        }
      }
      sonuc = degerlendir({ manifest, degisenYollar: degisen, govde: env.PR_GOVDE, yazar: env.PR_YAZAR, prAcilisGunu: GUN_KALIBI.test(acilis) ? acilis : null, bugun, defterMetinleri, depoDosyalari: depo, kip });
    }
  } catch (e) {
    sonuc = { kip: KIPLER.includes(String(env.DEFTER_KAPISI_KIP || '').toLowerCase()) ? String(env.DEFTER_KAPISI_KIP).toLowerCase() : VARSAYILAN_KIP, durum: 'olculemedi', neden: 'ic-hata', ihlaller: [], istisna: { var: false, gecerli: false, sebepUzunlugu: 0 }, kapsam: { kontrolEdilen: 0, kesisen: 0, uyumlu: 0, ihlalli: 0, muaf: 0 } };
  }
  for (const s of satirlar(sonuc)) bag.yaz(s);
  if (env.GITHUB_STEP_SUMMARY) {
    try { bag.ozetYaz(env.GITHUB_STEP_SUMMARY, ozetTablosu(sonuc)); } catch { /* özet yazılamadı: kapıyı etkilemez */ }
  }
  return cikisKodu(sonuc);
}

module.exports = {
  MANIFEST_YOLU,
  KIPLER,
  VARSAYILAN_KIP,
  DURUMLAR,
  ISTISNA_ANAHTARI,
  ISTISNA_MIN_SEBEP,
  GENIS_GLOB_ESIGI,
  BOT_YAZARLAR,
  govdeyiTemizle,
  istisnaBul,
  globEsle,
  kaydiDogrula,
  manifestiAyikla,
  sonDogrulamaOku,
  degerlendir,
  cikisKodu,
  aciklamaKacis,
  satirlar,
  ozetTablosu,
  main,
};

if (require.main === module) {
  process.exitCode = main();
}
