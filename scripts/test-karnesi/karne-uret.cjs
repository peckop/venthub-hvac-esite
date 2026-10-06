#!/usr/bin/env node
/**
 * ALT-38 · TEST KARNESİ ÜRETİCİSİ — her test dosyası için yedi soru, ölçülen ve ÖLÇÜLMEYEN ayrı.
 *
 * Girdiler (hepsi ölçüm çıktısı; bu betik HİÇBİR ŞEY ÖLÇMEZ, yalnız birleştirir ve sınıflar):
 *   --ci        ci-gecmis.cjs çıktısı (GitHub `ci.yml` koşuları ve kırmızılardaki başarısız test dosyaları)
 *   --vitest    tam yerel vitest JSON raporu (süre ve yerel kırmızı)
 *   --sabotaj   sabotaj.cjs JSONL dizini (gNN.jsonl; koruduğu şey bozulunca kırmızı veriyor mu)
 *   statik.cjs  kaynak tarama (çağrılır): ortam imzası, benzerlik adayı, INV/karar/cetvel atıfları
 *   scripts/ci/dunya-durumu-testleri.json  PR kapısından çıkan testler ve yeni yerleri
 *
 * Çıktı: `--cikti-json` (makine okunur, her test dosyası için bir kayıt) ve `--cikti-md` (insan özeti).
 * Cetvel: docs/standards/test-karnesi-standard.md. Kapı: src/__tests__/conformance/test-karnesi-yapisi.test.ts.
 *
 * ⛔ HÜKÜM VERMEZ: `oneri` bir ADAYDIR. Silme/taşıma kararı insanındır (silme listesi Recep onayıyla; sensiz test silinmez).
 * "Ölçülmedi" yazılır, tahmin yazılmaz.
 */
'use strict';

const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const KOK = path.resolve(__dirname, '..', '..');
const statik = require('./statik.cjs');

/** Aynı testin ≥ MIN_DAL farklı dalda, arka arkaya KUMELEME_SAAT içinde kırmızı vermesi bir "dünya olayı" kümesidir. */
const KUMELEME_SAAT = 12;
const MIN_DAL = 3;
const SURUM = 1;

// ------------------------------------------------------------------ saf fonksiyonlar (test edilir)

/** Zaman damgalı koşuları, ardışık aralığı ≤ KUMELEME_SAAT olan kümelere böler. */
function kumele(liste, saat = KUMELEME_SAAT) {
  const s = [...liste].sort((a, b) => a.olusturma.localeCompare(b.olusturma));
  const kumeler = [];
  let mevcut = [];
  for (const k of s) {
    if (mevcut.length && Date.parse(k.olusturma) - Date.parse(mevcut[mevcut.length - 1].olusturma) > saat * 3600000) {
      kumeler.push(mevcut);
      mevcut = [];
    }
    mevcut.push(k);
  }
  if (mevcut.length) kumeler.push(mevcut);
  return kumeler;
}

/**
 * Kırmızı koşudan SONRA aynı dalda ne oldu? 'duzeldi' (farklı commit, bu test artık kırmızı değil),
 * 'hala-kirmizi' (farklı commit, bu test yine kırmızı) ya da 'belirsiz' (dalın sonraki koşusu yok ya da iptal).
 */
function sonrakiSonuc(dalKosulari, kirmizi, test) {
  const sonra = dalKosulari.filter((k) => k.olusturma > kirmizi.olusturma && k.sha !== kirmizi.sha && k.olay === 'pull_request');
  for (const k of sonra) {
    if (k.sonuc === 'cancelled') continue;
    if (k.sonuc === 'success') return 'duzeldi';
    if (k.sonuc === 'failure') {
      const ayni = (k.testDosyalari || []).some((t) => t.dosya === test);
      return ayni ? 'hala-kirmizi' : 'duzeldi';
    }
  }
  return 'belirsiz';
}

/** CI geçmişinden test başına kırmızı özeti. */
function ciOzeti(kosular) {
  const dalaGore = new Map();
  for (const k of kosular) {
    if (!dalaGore.has(k.dal)) dalaGore.set(k.dal, []);
    dalaGore.get(k.dal).push(k);
  }
  const kirmizilar = kosular.filter((k) => k.sonuc === 'failure' && k.testDosyalari && k.testDosyalari.length);
  const testKosulari = new Map();
  for (const k of kirmizilar) {
    for (const t of k.testDosyalari) {
      if (!testKosulari.has(t.dosya)) testKosulari.set(t.dosya, []);
      testKosulari.get(t.dosya).push(k);
    }
  }
  const sonuc = new Map();
  for (const [dosya, liste] of testKosulari) {
    let kumeIci = 0;
    let izole = 0;
    let kumeSayisi = 0;
    const izoleKosular = [];
    for (const kume of kumele(liste)) {
      if (new Set(kume.map((k) => k.dal)).size >= MIN_DAL) {
        kumeIci += kume.length;
        kumeSayisi += 1;
      } else {
        izole += kume.length;
        izoleKosular.push(...kume);
      }
    }
    const sonlar = { duzeldi: 0, 'hala-kirmizi': 0, belirsiz: 0 };
    for (const k of izoleKosular) {
      if (k.olay !== 'pull_request') {
        sonlar.belirsiz += 1;
        continue;
      }
      sonlar[sonrakiSonuc((dalaGore.get(k.dal) || []).sort((a, b) => a.olusturma.localeCompare(b.olusturma)), k, dosya)] += 1;
    }
    const tarihler = liste.map((k) => k.olusturma).sort();
    sonuc.set(dosya, {
      kirmizi: liste.length,
      dal: new Set(liste.map((k) => k.dal)).size,
      master: liste.filter((k) => k.olay === 'push').length,
      dunyaKumesi: kumeIci,
      kumeSayisi,
      izole,
      duzeldi: sonlar.duzeldi,
      halaKirmizi: sonlar['hala-kirmizi'],
      belirsiz: sonlar.belirsiz,
      ilk: tarihler[0].slice(0, 10),
      son: tarihler[tarihler.length - 1].slice(0, 10),
    });
  }
  return sonuc;
}

/** Ortama bağlılık hükmü: ölçüm sinyalleri (bagli) > imza/ajan notu (supheli) > hiçbiri (bagimsiz). */
function ortamHukmu({ imza, yerelKirmizi, tabanKirmizi, ciKumeOrani, ajan }) {
  const sebepler = [];
  if (tabanKirmizi) sebepler.push('sabotajsız taban koşusu (boş ev dizini, secret yok) kırmızı');
  if (yerelKirmizi) sebepler.push('tam yerel koşuda kırmızı');
  if (ciKumeOrani >= 0.5) sebepler.push(`CI kırmızılarının %${Math.round(ciKumeOrani * 100)}'i dünya olayı kümesinde (PR'dan bağımsız)`);
  if (sebepler.length) return { hukum: 'bagli', sebepler };
  const zayif = [];
  if (imza.length) zayif.push(`kaynak imzası: ${imza.join(', ')}`);
  const a = String(ajan || '').trim();
  if (a && !/^(yok|hayır|hayir)\b/i.test(a)) zayif.push(`ajan notu: ${a.slice(0, 160)}`);
  if (zayif.length) return { hukum: 'supheli', sebepler: zayif };
  return { hukum: 'bagimsiz', sebepler: [] };
}

/** Test dosyasının kaynak imzası (statik.cjs `ortam` alanından, yalnız ayırt edici olanlar). */
function imzaListesi(ortam) {
  const s = [];
  if (ortam.evDizini) s.push('ev dizini');
  if (ortam.gitGecmisi) s.push('git geçmişi');
  if (ortam.ag) s.push('ağ çağrısı');
  if (ortam.veritabani) s.push('veritabanı');
  if (ortam.sunucuGerekir) s.push('sunucu ister');
  if (ortam.saat && !ortam.saatSabitlenmis) s.push('saat (sabitlenmemiş)');
  return s;
}

/** Aday öneri. KARAR DEĞİL: silme/taşıma insan onayıdır. */
function oneriVer({ sabotaj, ortam, ci, kopya, dunya }) {
  const sebepler = [];
  if (dunya) return { tur: 'TASINDI', sebepler: [`PR kapısından çıktı; yeni yer: ${dunya.yeniYer.join(' + ')}`] };
  if (sabotaj.durum === 'olculdu' && sabotaj.hukum === 'YESIL') {
    sebepler.push(`${sabotaj.denenen} sabotajın hiçbiri yakalanmadı`);
    return { tur: 'SAHTE-YESIL-ADAYI', sebepler };
  }
  if (sabotaj.durum === 'olculdu' && sabotaj.hukum === 'TABAN_KIRMIZI') {
    sebepler.push('sabotajsız bile kırmızı: ortam ya da gerçek hata, incelenmeli');
    return { tur: 'ORTAM-INCELE', sebepler };
  }
  if (ortam.hukum === 'bagli' && ci.kirmizi > 0 && ci.dunyaKumesi / ci.kirmizi >= 0.5) {
    sebepler.push(`CI kırmızılarının çoğu PR'dan bağımsız (${ci.dunyaKumesi}/${ci.kirmizi})`);
    return { tur: 'TASI-ADAYI-DUNYA-DURUMU', sebepler };
  }
  if (kopya.olculen.length > 0 && ci.kirmizi === 0) {
    sebepler.push(`aynı sabotajı ${kopya.olculen.length} başka test de yakalıyor ve bu test pencerede hiç kırmızı vermedi`);
    return { tur: 'COKLU-KORUMA-ADAYI', sebepler };
  }
  if (sabotaj.durum !== 'olculdu') return { tur: 'OLCULMEDI', sebepler: ['sabotaj yoklaması bu dosya için yapılmadı'] };
  return { tur: 'KORU', sebepler: [] };
}

// ------------------------------------------------------------------ girdi okuyucular

function jsonOku(yol) {
  return JSON.parse(fs.readFileSync(yol, 'utf8'));
}

function sabotajOku(dizin) {
  const harita = new Map();
  if (!dizin || !fs.existsSync(dizin)) return harita;
  for (const f of fs.readdirSync(dizin).filter((x) => /^g\d+\.jsonl$/.test(x)).sort()) {
    for (const s of fs.readFileSync(path.join(dizin, f), 'utf8').split('\n')) {
      if (!s.trim()) continue;
      try {
        const k = JSON.parse(s);
        harita.set(k.test, k);
      } catch {
        /* yarım satır: atlanır */
      }
    }
  }
  return harita;
}

function vitestOku(yol, testler) {
  const harita = new Map();
  if (!yol || !fs.existsSync(yol)) return harita;
  const r = jsonOku(yol);
  const norm = (a) => a.replace(/\\/g, '/');
  for (const d of r.testResults || []) {
    const ad = norm(d.name);
    const dosya = testler.find((t) => ad.endsWith(`/${t}`));
    if (!dosya) continue;
    const testMs = (d.assertionResults || []).reduce((t, a) => t + (a.duration || 0), 0);
    harita.set(dosya, {
      durum: d.status,
      dosyaMs: Math.round((d.endTime || 0) - (d.startTime || 0)),
      testMs: Math.round(testMs),
      testSayisi: (d.assertionResults || []).length,
      kirmizi: (d.assertionResults || []).filter((a) => a.status === 'failed').length,
    });
  }
  return harita;
}

/** Dosya başına ilk eklenme tarihi (tek `git log` çağrısı). */
function ilkEklenme() {
  const cikti = cp.execFileSync('git', ['log', '--diff-filter=A', '--name-only', '--format=%x01%cI'], {
    cwd: KOK,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  // `git log` yeniden eskiye gider; aynı yol silinip yeniden eklenmişse EN ESKİ ekleme tutulur (sonraki satır ezer).
  const harita = new Map();
  let tarih = null;
  for (const satir of cikti.split('\n')) {
    if (satir.startsWith('\u0001')) tarih = satir.slice(1, 11);
    else if (satir && tarih) harita.set(satir, tarih);
  }
  return harita;
}

// ------------------------------------------------------------------ birleştirme

function karneUret({ ci, vitest, sabotaj, dunyaListesi, tarih, ciPencere }) {
  const stat = statik.testDosyalari().map(statik.analiz);
  const yakin = statik.benzerlik(
    // benzerlik parmak izi ister; analiz() onu döndürür
    stat,
  );
  const dunya = new Map((dunyaListesi.testler || []).map((t) => [t.test, t]));
  const eklenme = ilkEklenme();
  const ciKayit = ci ? ciOzeti(ci.kosular) : new Map();
  const ciVar = Boolean(ci);
  const kayitlar = stat.map((s, i) => {
    const sab = sabotaj.get(s.dosya);
    const v = vitest.get(s.dosya);
    const c = ciKayit.get(s.dosya) || { kirmizi: 0, dal: 0, master: 0, dunyaKumesi: 0, kumeSayisi: 0, izole: 0, duzeldi: 0, halaKirmizi: 0, belirsiz: 0, ilk: null, son: null };
    const imza = imzaListesi(s.ortam);
    const ajan = (sab && sab.ajan) || {};

    // 1) neyi koruyor
    const q1 = {
      kaynak: sab && sab.korur ? 'ajan' : 'statik',
      metin: sab && sab.korur ? sab.korur : s.baslik || s.yorum || null,
      inv: s.invler,
      kararlar: s.kararlar,
      cetveller: s.cetveller,
    };
    // 2) CI geçmişi
    const q2 = ciVar
      ? { pencere: ciPencere, ...c }
      : { pencere: null, olculmedi: 'CI geçmişi verilmedi' };
    // 3) sabotaj
    let q3;
    if (!sab) q3 = { durum: 'olculmedi', neden: s.kume === 'conformance' ? 'sabotaj yoklaması bu dosyaya ulaşmadı' : 'kapsam dışı: bugünkü yoklama yalnız conformance testleri' };
    else {
      const den = sab.denemeler || [];
      const gecerli = den.filter((d) => d.sonuc === 'KIRMIZI' || d.sonuc === 'GECTI');
      q3 = {
        durum: 'olculdu',
        hukum: sab.hukum,
        denenen: gecerli.length,
        yakalanan: den.filter((d) => d.sonuc === 'KIRMIZI').length,
        yakalanmayanlar: den.filter((d) => d.sonuc === 'GECTI').map((d) => d.ad),
        gecersiz: den.filter((d) => d.sonuc !== 'KIRMIZI' && d.sonuc !== 'GECTI').map((d) => `${d.ad}: ${d.sonuc}`),
        not: ajan.not || undefined,
      };
    }
    // 6) kopya
    const q6 = {
      olculen: (sab && sab.ortakKirmizi) || [],
      olculenAday: (sab && sab.ortakAdaylari ? sab.ortakAdaylari.length : 0),
      adaylar: (yakin[i] || []).map((b) => ({ dosya: b.dosya, skor: b.skor })),
      ajan: ajan.kopya === undefined ? null : ajan.kopya,
    };
    // 4) ortam
    const ciKumeOrani = c.kirmizi > 0 ? c.dunyaKumesi / c.kirmizi : 0;
    const o = ortamHukmu({
      imza,
      yerelKirmizi: Boolean(v && v.kirmizi > 0),
      tabanKirmizi: Boolean(sab && sab.hukum === 'TABAN_KIRMIZI'),
      ciKumeOrani,
      ajan: ajan.ortam,
    });
    const q4 = { ...o, yerelKirmizi: Boolean(v && v.kirmizi > 0), tabanKirmizi: Boolean(sab && sab.hukum === 'TABAN_KIRMIZI'), imza, ajan: ajan.ortam || null };
    // 5) süre
    const q5 = v
      ? { dosyaMs: v.dosyaMs, testMs: v.testMs, testSayisi: v.testSayisi, olcum: 'tam yerel koşu, 3 işçi (çekişmeyle şişkin: göreli sıralama için)' }
      : { olculmedi: statik.VITEST_DISLANANLAR.some((d) => d.test(s.dosya)) ? 'vitest dışı (kendi yerinde koşar)' : 'tam yerel koşuda bu dosya yok' };
    // 7) Kanban/kokpit
    const q7 = { ajan: ajan.kanban === undefined ? null : ajan.kanban, statikAday: Boolean(s.kanbanAdayi) };

    const d = dunya.get(s.dosya) || null;
    const oneri = oneriVer({ sabotaj: q3, ortam: q4, ci: c, kopya: q6, dunya: d });
    return {
      dosya: s.dosya,
      kume: s.kume,
      satir: s.satir,
      testSayisi: s.testSayisi,
      atlanan: s.atlanan,
      ilkEklenme: eklenme.get(s.dosya) || null,
      vitestDisinda: statik.VITEST_DISLANANLAR.some((d) => d.test(s.dosya)),
      q1_korur: q1,
      q2_ci: q2,
      q3_sabotaj: q3,
      q4_ortam: q4,
      q5_sure: q5,
      q6_kopya: q6,
      q7_kanban: q7,
      dunyaDurumu: d ? { yeniYer: d.yeniYer, neden: d.neden, kanit: d.kanit } : null,
      oneri,
    };
  });
  return {
    surum: SURUM,
    tarih,
    ciPencere,
    dosyaSayisi: kayitlar.length,
    kayitlar,
  };
}

function ozetle(karne, ci) {
  const say = (f) => karne.kayitlar.filter(f).length;
  const kumeler = {};
  for (const k of karne.kayitlar) kumeler[k.kume] = (kumeler[k.kume] || 0) + 1;
  const hukumler = {};
  for (const k of karne.kayitlar) if (k.q3_sabotaj.durum === 'olculdu') hukumler[k.q3_sabotaj.hukum] = (hukumler[k.q3_sabotaj.hukum] || 0) + 1;
  const oneriler = {};
  for (const k of karne.kayitlar) oneriler[k.oneri.tur] = (oneriler[k.oneri.tur] || 0) + 1;
  const ortamlar = {};
  for (const k of karne.kayitlar) ortamlar[k.q4_ortam.hukum] = (ortamlar[k.q4_ortam.hukum] || 0) + 1;
  const ciOz = ci
    ? (() => {
        const say2 = {};
        for (const k of ci.kosular) say2[k.sonuc] = (say2[k.sonuc] || 0) + 1;
        const testSure = ci.kosular.filter((k) => typeof k.testAdimiSuresiSn === 'number').map((k) => k.testAdimiSuresiSn).sort((a, b) => a - b);
        return { koşu: ci.kosular.length, sonuclar: say2, testAdimiSnMedyan: testSure.length ? testSure[Math.floor(testSure.length / 2)] : null, testAdimiOrnek: testSure.length };
      })()
    : null;
  return {
    dosyaSayisi: karne.dosyaSayisi,
    kumeler,
    sabotajHukumleri: hukumler,
    sabotajOlculen: say((k) => k.q3_sabotaj.durum === 'olculdu'),
    sabotajOlculmeyen: say((k) => k.q3_sabotaj.durum !== 'olculdu'),
    ortam: ortamlar,
    oneriler,
    ciKirmiziVerenDosya: say((k) => k.q2_ci.kirmizi > 0),
    ciHicKirmiziVermeyen: say((k) => k.q2_ci.kirmizi === 0),
    ci: ciOz,
  };
}

function mdYaz(karne, oz) {
  const L = [];
  const tablo = (baslik, satirlar) => {
    L.push(`| ${baslik.join(' | ')} |`);
    L.push(`|${baslik.map(() => '---').join('|')}|`);
    for (const s of satirlar) L.push(`| ${s.join(' | ')} |`);
    L.push('');
  };
  L.push(`# Test karnesi — ${karne.tarih}`);
  L.push('');
  L.push('> ÜRETİLMİŞ BELGE: elle düzenleme. Kaynak: `node scripts/test-karnesi/karne-uret.cjs` (cetvel: `docs/standards/test-karnesi-standard.md`).');
  L.push('> Bu belge HÜKÜM VERMEZ: `oneri` sütunu bir ADAYDIR. Silme/taşıma kararı insanındır; silme listesi Recep onayıyla, sensiz test silinmez.');
  L.push(`> CI geçmişi penceresi: ${karne.ciPencere}. "ölçülmedi" = ölçüm yapılmadı (tahmin yazılmadı).`);
  L.push('');
  L.push('## Özet');
  L.push('');
  tablo(
    ['Konu', 'Sayı'],
    [
      ['test dosyası (git ls-files)', String(oz.dosyaSayisi)],
      ...Object.entries(oz.kumeler).map(([k, n]) => [`· ${k}`, String(n)]),
      ['sabotajla ÖLÇÜLEN dosya', String(oz.sabotajOlculen)],
      ['sabotajla ÖLÇÜLMEYEN dosya', String(oz.sabotajOlculmeyen)],
      ['CI penceresinde kırmızı veren dosya', String(oz.ciKirmiziVerenDosya)],
      ['CI penceresinde HİÇ kırmızı vermeyen dosya', String(oz.ciHicKirmiziVermeyen)],
    ],
  );
  L.push('### Sabotaj hükümleri (ölçülen dosyalarda)');
  L.push('');
  tablo(['Hüküm', 'Dosya'], Object.entries(oz.sabotajHukumleri).map(([h, n]) => [h, String(n)]));
  L.push('### Ortama bağlılık');
  L.push('');
  tablo(['Hüküm', 'Dosya'], Object.entries(oz.ortam).map(([h, n]) => [h, String(n)]));
  L.push('### Öneri adayları (KARAR DEĞİL)');
  L.push('');
  tablo(['Aday', 'Dosya'], Object.entries(oz.oneriler).map(([h, n]) => [h, String(n)]));
  if (oz.ci) {
    L.push('### CI koşuları (ci.yml, pencere içi)');
    L.push('');
    tablo(['Sonuç', 'Koşu'], Object.entries(oz.ci.sonuclar).map(([h, n]) => [h, String(n)]));
    L.push(`Test adımı süresi medyanı: ${oz.ci.testAdimiSnMedyan === null ? 'ölçülmedi' : `${oz.ci.testAdimiSnMedyan} sn`} (örnek ${oz.ci.testAdimiOrnek} başarılı koşu).`);
    L.push('');
  }
  const bol = (baslik, filtre, kolonlar, satir) => {
    const liste = karne.kayitlar.filter(filtre);
    L.push(`## ${baslik} (${liste.length})`);
    L.push('');
    if (!liste.length) {
      L.push('Yok.');
      L.push('');
      return;
    }
    tablo(kolonlar, liste.map(satir));
  };
  bol(
    'PR kapısından çıkan (dünya durumu) testler ve yeni yerleri',
    (k) => k.dunyaDurumu,
    ['Test', 'Yeni yer', 'Neden', 'Kanıt'],
    (k) => [`\`${k.dosya}\``, k.dunyaDurumu.yeniYer.join(' + '), k.dunyaDurumu.neden.replace(/\|/g, '/'), k.dunyaDurumu.kanit.replace(/\|/g, '/')],
  );
  bol(
    'Sahte yeşil adayları (sabotajların hiçbiri yakalanmadı)',
    (k) => k.oneri.tur === 'SAHTE-YESIL-ADAYI',
    ['Test', 'Korur', 'Denenen', 'Not'],
    (k) => [`\`${k.dosya}\``, String(k.q1_korur.metin || '').slice(0, 120).replace(/\|/g, '/'), String(k.q3_sabotaj.denenen), String(k.q3_sabotaj.not || '').slice(0, 160).replace(/\|/g, '/')],
  );
  bol(
    'Sabotajsız bile kırmızı (ortam ya da gerçek hata)',
    (k) => k.oneri.tur === 'ORTAM-INCELE',
    ['Test', 'Ortam notu'],
    (k) => [`\`${k.dosya}\``, String(k.q4_ortam.ajan || k.q4_ortam.sebepler.join('; ')).slice(0, 200).replace(/\|/g, '/')],
  );
  bol(
    'Çoklu koruma adayları (aynı sabotajı başka test de yakalıyor, pencerede hiç kırmızı vermedi)',
    (k) => k.oneri.tur === 'COKLU-KORUMA-ADAYI',
    ['Test', 'Birlikte yakalayan'],
    (k) => [`\`${k.dosya}\``, k.q6_kopya.olculen.map((x) => `\`${x.split('/').pop()}\``).join(', ')],
  );
  bol(
    'Kısmi koruma (bazı sabotajlar yakalanmadı)',
    (k) => k.q3_sabotaj.durum === 'olculdu' && k.q3_sabotaj.hukum === 'KIRMIZI' && k.q3_sabotaj.yakalanmayanlar.length > 0,
    ['Test', 'Yakalanmayan sabotaj'],
    (k) => [`\`${k.dosya}\``, k.q3_sabotaj.yakalanmayanlar.map((x) => String(x).replace(/\|/g, '/')).join('; ').slice(0, 260)],
  );
  L.push('## Tüm dosyalar');
  L.push('');
  L.push('Ayrıntı (yedi soru, her dosya için) `test-karnesi-*.json` içindedir. Bu tablo yalnız özet sütunlarını verir.');
  L.push('');
  tablo(
    ['Dosya', 'Küme', 'CI kırmızı', 'Sabotaj', 'Ortam', 'Süre (ms)', 'Aday'],
    karne.kayitlar.map((k) => [
      `\`${k.dosya}\``,
      k.kume,
      k.q2_ci.kirmizi === undefined ? 'ölçülmedi' : String(k.q2_ci.kirmizi),
      k.q3_sabotaj.durum === 'olculdu' ? `${k.q3_sabotaj.hukum} (${k.q3_sabotaj.yakalanan}/${k.q3_sabotaj.denenen})` : 'ölçülmedi',
      k.q4_ortam.hukum,
      k.q5_sure.olculmedi ? 'ölçülmedi' : String(k.q5_sure.testMs),
      k.oneri.tur,
    ]),
  );
  return `${L.join('\n')}\n`;
}

// ------------------------------------------------------------------ komut satırı

function argumanlar(argv) {
  const a = { ci: null, vitest: null, sabotaj: null, ciktiJson: null, ciktiMd: null, tarih: new Date().toISOString().slice(0, 10), ciPencere: null };
  for (let i = 0; i < argv.length; i += 1) {
    const k = argv[i];
    if (k === '--ci') a.ci = argv[++i];
    else if (k === '--vitest') a.vitest = argv[++i];
    else if (k === '--sabotaj') a.sabotaj = argv[++i];
    else if (k === '--cikti-json') a.ciktiJson = argv[++i];
    else if (k === '--cikti-md') a.ciktiMd = argv[++i];
    else if (k === '--tarih') a.tarih = argv[++i];
    else throw new Error(`bilinmeyen bayrak: ${k}`);
  }
  if (!a.ciktiJson || !a.ciktiMd) throw new Error('--cikti-json ve --cikti-md gerekli');
  return a;
}

function main() {
  const a = argumanlar(process.argv.slice(2));
  const ci = a.ci ? jsonOku(a.ci) : null;
  const ciPencere = ci ? `${ci.pencere.baslangic}..${ci.pencere.bitis}` : null;
  const dunyaListesi = jsonOku(path.join(KOK, 'scripts/ci/dunya-durumu-testleri.json'));
  const testler = statik.testDosyalari();
  const karne = karneUret({
    ci,
    vitest: vitestOku(a.vitest, testler),
    sabotaj: sabotajOku(a.sabotaj),
    dunyaListesi,
    tarih: a.tarih,
    ciPencere,
  });
  const oz = ozetle(karne, ci);
  karne.ozet = oz;
  fs.mkdirSync(path.dirname(path.resolve(a.ciktiJson)), { recursive: true });
  fs.writeFileSync(a.ciktiJson, `${JSON.stringify(karne)}\n`);
  fs.writeFileSync(a.ciktiMd, mdYaz(karne, oz));
  process.stderr.write(`[karne] ${karne.dosyaSayisi} dosya · sabotaj ölçülen ${oz.sabotajOlculen} · ${a.ciktiJson}\n`);
}

if (require.main === module) main();

module.exports = { MIN_DAL, KUMELEME_SAAT, SURUM, ciOzeti, imzaListesi, karneUret, kumele, mdYaz, oneriVer, ortamHukmu, ozetle, sonrakiSonuc };
