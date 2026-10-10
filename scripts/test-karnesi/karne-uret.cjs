#!/usr/bin/env node
/**
 * ALT-38 · TEST KARNESİ ÜRETİCİSİ — her test dosyası için sekiz soru, ölçülen ve ÖLÇÜLMEYEN ayrı.
 *
 * Girdiler (hepsi ölçüm çıktısı; bu betik HİÇBİR ŞEY ÖLÇMEZ, yalnız birleştirir ve sınıflar):
 *   --ci        ci-gecmis.cjs çıktısı (GitHub `ci.yml` koşuları ve kırmızılardaki başarısız test dosyaları)
 *   --vitest    tam yerel vitest JSON raporu (süre ve yerel kırmızı)
 *   --sabotaj   sabotaj.cjs JSONL dizini (gNN.jsonl; koruduğu şey bozulunca kırmızı veriyor mu)
 *   statik.cjs  kaynak tarama (çağrılır): ortam imzası, benzerlik adayı, INV/karar/cetvel atıfları, okunan yollar
 *   beyan.cjs   testin başlığındaki TETİK:/YER: beyanı (8. soru: bu test hangi dosya değişince koşmalı)
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
const beyan = require('./beyan.cjs');

/** Aynı testin ≥ MIN_DAL farklı dalda, arka arkaya KUMELEME_SAAT içinde kırmızı vermesi bir "dünya olayı" kümesidir. */
const KUMELEME_SAAT = 12;
const MIN_DAL = 3;
const SURUM = 1;

/**
 * sabotaj.cjs `hukumVer` sözlüğünde bir şey ÖLÇMÜŞ olan hükümler. UYGULANAMADI (hiçbir sabotaj uygulanamadı) ve TABAN_ATLANDI
 * (taban koşusunda tüm testler atlandı) kayıt bırakır ama ÖLÇÜM DEĞİLDİR: "ölçülemeyen cevap 'ölçülmedi' yazılır".
 * Sözlük KAPALI tutulur: koşucuya yeni bir hüküm eklenirse bu listeye girene kadar öneri KORU değil OLCULMEDI olur.
 */
const OLCULEN_HUKUMLER = new Set(['KIRMIZI', 'YESIL', 'TABAN_KIRMIZI']);

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

/**
 * Üçüncü soru (koruduğu şey bozulunca kırmızı veriyor mu): sabotaj kaydı + ek yoklamalar → karne alanı.
 * `kismi` = test KIRMIZI veriyor ama ölçülen gerçekçi bozulmalardan en az birine (ana kayıtta ya da ek yoklamada) YEŞİL kaldı.
 * Kayıt yoksa "ölçülmedi" (tahmin yazılmaz); conformance dışı dosyalar için kapsam notu ayrıdır.
 */
function sabotajOzeti({ sab, ekler = [], kume }) {
  if (!sab) {
    return { durum: 'olculmedi', neden: kume === 'conformance' ? 'sabotaj yoklaması bu dosyaya ulaşmadı' : 'kapsam dışı: bugünkü yoklama yalnız conformance testleri' };
  }
  if (sab.hukum === 'CELISKI') {
    return { durum: 'celiski', kaynaklar: sab.celiski, neden: 'aynı test için farklı hüküm çıktı; çözülmedi, karar insanındır' };
  }
  // Kayıt VAR ama hiçbir şey ölçülmemiş (UYGULANAMADI / TABAN_ATLANDI / bilinmeyen hüküm): soru 3 "ölçüldü" demez (7a).
  if (!OLCULEN_HUKUMLER.has(sab.hukum)) {
    return { durum: 'olculmedi', hukum: sab.hukum, neden: `sabotaj hükmü ${sab.hukum || 'yok'}: hiçbir şey ölçülmedi (sabotaj uygulanamadı ya da taban atlandı)` };
  }
  const den = sab.denemeler || [];
  const ajan = sab.ajan || {};
  const yakalanmayanlar = den.filter((d) => d.sonuc === 'GECTI').map((d) => d.ad);
  const ekYakalanmayan = ekler.filter((d) => d.sonuc === 'GECTI').map((d) => d.ad);
  return {
    durum: 'olculdu',
    hukum: sab.hukum,
    denenen: den.filter((d) => d.sonuc === 'KIRMIZI' || d.sonuc === 'GECTI').length,
    yakalanan: den.filter((d) => d.sonuc === 'KIRMIZI').length,
    yakalanmayanlar,
    gecersiz: den.filter((d) => d.sonuc !== 'KIRMIZI' && d.sonuc !== 'GECTI').map((d) => `${d.ad}: ${d.sonuc}`),
    ekDenenen: ekler.filter((d) => d.sonuc === 'KIRMIZI' || d.sonuc === 'GECTI').length,
    ekYakalanmayan,
    kismi: sab.hukum === 'KIRMIZI' && yakalanmayanlar.length + ekYakalanmayan.length > 0,
    tekrar: sab.tekrar,
    not: ajan.not || undefined,
  };
}

/**
 * Sekizinci soru (bu test hangi dosya değişince koşmalı): testin KENDİ beyanı (başlıkta TETİK:/YER:) varsa o; yoksa statik
 * taramanın okuduğu yol dizgeleri (KESİN DEĞİL: yalnız testin kaynakta adını andığı yollar); ikisi de yoksa "ölçülmedi".
 * `beyanSonucu`: beyan.beyanOku() çıktısı ya da null.
 */
function tetikOzeti({ beyanSonucu, okunanYollar, dunya }) {
  if (beyanSonucu && beyanSonucu.tetik && beyanSonucu.tetik.length) {
    return { kaynak: 'beyan', tetik: beyanSonucu.tetik, yer: beyanSonucu.yer || (dunya ? 'zamanli' : 'PR') };
  }
  const yollar = Array.isArray(okunanYollar) ? okunanYollar : [];
  if (yollar.length) {
    return { kaynak: 'statik', tetik: yollar, yer: dunya ? 'zamanli' : 'PR', kesin: false, not: 'testin kaynakta adını andığı yol dizgeleri: kapsam kesin değil; beyan yazılınca kesinleşir' };
  }
  return { kaynak: 'yok', tetik: [], yer: dunya ? 'zamanli' : 'PR', olculmedi: 'beyan yok ve test hiçbir yol dizgesi okumuyor: hangi değişiklikte koşacağı belirlenemedi (yalnız TAM pakette koşar)' };
}

/** Aday öneri. KARAR DEĞİL: silme/taşıma insan onayıdır. */
function oneriVer({ sabotaj, ortam, ci, kopya, dunya }) {
  const sebepler = [];
  if (dunya) return { tur: 'TASINDI', sebepler: [`PR kapısından çıktı; yeni yer: ${dunya.yeniYer.join(' + ')}`] };
  if (sabotaj.durum === 'celiski') {
    return { tur: 'CELISKI-INCELE', sebepler: [`aynı test için farklı hüküm: ${(sabotaj.kaynaklar || []).map((x) => `${x.dosya}=${x.hukum}`).join(', ')}`] };
  }
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
  // Kısmi koruma, silme adayı DEĞİL güçlendirme adayıdır: bir kolu korur, bir kolu görmez. Çoklu koruma adaylığından ÖNCE gelir.
  if (sabotaj.durum === 'olculdu' && sabotaj.kismi) {
    const ad = [...sabotaj.yakalanmayanlar, ...(sabotaj.ekYakalanmayan || [])];
    sebepler.push(`${ad.length} bozulma yakalanmadı: ${ad.slice(0, 3).join('; ')}${ad.length > 3 ? '; …' : ''}`);
    return { tur: 'KISMI-KORUMA', sebepler };
  }
  if (kopya.olculen.length > 0 && ci.kirmizi === 0) {
    sebepler.push(`aynı sabotajı ${kopya.olculen.length} başka test de yakalıyor ve bu test pencerede hiç kırmızı vermedi`);
    return { tur: 'COKLU-KORUMA-ADAYI', sebepler };
  }
  // Kayıt VAR ama hiçbir şey ölçülmemiş (UYGULANAMADI / TABAN_ATLANDI / bilinmeyen hüküm): "ölçüldü" sayılmaz, KORU yazılmaz.
  // Sırası "kayıt yok" ile AYNIDIR (CI kanıtı ve çoklu koruma önce gelir): OLCULMEDI düşük öncelikli, KORU'dan hemen öncedir.
  if (sabotaj.durum === 'olculdu' && !OLCULEN_HUKUMLER.has(sabotaj.hukum)) {
    return { tur: 'OLCULMEDI', sebepler: [`sabotaj hükmü ${sabotaj.hukum || 'yok'}: hiçbir şey ölçülmedi (sabotaj uygulanamadı ya da taban atlandı)`] };
  }
  if (sabotaj.durum !== 'olculdu') return { tur: 'OLCULMEDI', sebepler: [sabotaj.hukum ? sabotaj.neden : 'sabotaj yoklaması bu dosya için yapılmadı'] };
  return { tur: 'KORU', sebepler: [] };
}

// ------------------------------------------------------------------ girdi okuyucular

/** Test dosyasının başlığındaki beyanı diskten okur; dosya okunamazsa null (8. soru statik okumaya düşer). */
function beyanDisktenOku(dosya) {
  try {
    return beyan.beyanOku(fs.readFileSync(path.join(KOK, dosya), 'utf8'));
  } catch {
    return null;
  }
}

function jsonOku(yol) {
  return JSON.parse(fs.readFileSync(yol, 'utf8'));
}

/**
 * Aynı test BİRDEN ÇOK sabotaj kaydında geçerse SESSİZCE biri seçilmez (Recep 10-06: "çelişki çelişki olarak raporlanır"):
 *   · kayıt tek ise o kullanılır;
 *   · `yerine-gecen.json` o test için bir kaydı AÇIKÇA yerine geçen ilan etmişse (gerekçeyle) o seçilir, `tekrar` ile işaretlenir;
 *   · ilan yok ve hükümler AYNI ise son kayıt kullanılır, `tekrar: ayni-hukum` ile işaretlenir;
 *   · ilan yok ve hükümler FARKLI ise hüküm 'CELISKI' olur (karar insanındır; karnede ayrı bölümde listelenir).
 * `liste`: [{ dosya, kayit }] (dosya sırasıyla); `ilan`: { dosya, neden } | undefined.
 */
function sabotajBirlestir(test, liste, ilan) {
  if (liste.length === 1) return liste[0].kayit;
  const kaynaklar = liste.map((x) => ({ dosya: x.dosya, hukum: x.kayit.hukum }));
  const secilen = ilan ? liste.find((x) => x.dosya === ilan.dosya) : undefined;
  if (secilen) return { ...secilen.kayit, tekrar: { tur: 'yerine-gecti', secilen: ilan.dosya, neden: ilan.neden, kaynaklar } };
  if (new Set(kaynaklar.map((x) => x.hukum)).size === 1) {
    const son = liste[liste.length - 1];
    return { ...son.kayit, tekrar: { tur: 'ayni-hukum', secilen: son.dosya, kaynaklar } };
  }
  return { test, hukum: 'CELISKI', denemeler: [], ajan: {}, celiski: kaynaklar };
}

/** `yerine-gecen.json`: [{ test, dosya, neden }]. Bozuk ilan FIRLATIR (fail-closed: ilan sessizce kaybolmaz). */
function yerineGecenOku(dizin) {
  const yol = path.join(dizin, 'yerine-gecen.json');
  const harita = new Map();
  if (!fs.existsSync(yol)) return harita;
  const liste = JSON.parse(fs.readFileSync(yol, 'utf8'));
  if (!Array.isArray(liste)) throw new Error('yerine-gecen.json bir dizi olmalı');
  for (const x of liste) {
    if (!x || !x.test || !x.dosya || !x.neden) throw new Error(`yerine-gecen.json kaydı eksik (test, dosya, neden zorunlu): ${JSON.stringify(x)}`);
    harita.set(x.test, { dosya: x.dosya, neden: x.neden });
  }
  return harita;
}

function sabotajOku(dizin) {
  const harita = new Map();
  if (!dizin || !fs.existsSync(dizin)) return harita;
  const kayitlar = new Map();
  for (const f of fs.readdirSync(dizin).filter((x) => /^g\d+\.jsonl$/.test(x)).sort()) {
    for (const s of fs.readFileSync(path.join(dizin, f), 'utf8').split('\n')) {
      if (!s.trim()) continue;
      try {
        const k = JSON.parse(s);
        if (!kayitlar.has(k.test)) kayitlar.set(k.test, []);
        kayitlar.get(k.test).push({ dosya: f, kayit: k });
      } catch {
        /* yarım satır: atlanır */
      }
    }
  }
  const ilanlar = yerineGecenOku(dizin);
  for (const [test, liste] of kayitlar) harita.set(test, sabotajBirlestir(test, liste, ilanlar.get(test)));
  return harita;
}

/**
 * EK YOKLAMALAR: ajanın ilk sabotajı yakalansa bile, aynı test için BAŞKA bir kolu bozduğu kayıtlar
 * (`gNN-ek*.jsonl`, `ek/*.jsonl`). Ana kaydı (hüküm) EZMEZ; yalnız "kısmi koruma" kanıtı olarak eklenir:
 * test KIRMIZI verir ama bu kol bozulunca YEŞİL kalıyorsa o kolda KORUMA YOKTUR.
 */
function ekOku(dizin) {
  const harita = new Map();
  if (!dizin || !fs.existsSync(dizin)) return harita;
  const dosyalar = fs.readdirSync(dizin).filter((x) => /^g\d+-ek[^/\\]*\.jsonl$/.test(x)).map((x) => path.join(dizin, x));
  const ekDizin = path.join(dizin, 'ek');
  if (fs.existsSync(ekDizin)) {
    for (const f of fs.readdirSync(ekDizin).filter((x) => x.endsWith('.jsonl'))) dosyalar.push(path.join(ekDizin, f));
  }
  for (const yol of dosyalar.sort()) {
    for (const s of fs.readFileSync(yol, 'utf8').split('\n')) {
      if (!s.trim()) continue;
      try {
        const k = JSON.parse(s);
        if (!k.test) continue;
        if (!harita.has(k.test)) harita.set(k.test, []);
        for (const d of k.denemeler || []) harita.get(k.test).push({ ad: d.ad, sonuc: d.sonuc, kaynak: path.basename(yol) });
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

function karneUret({ ci, vitest, sabotaj, ek = new Map(), dunyaListesi, tarih, ciPencere, beyanOku = beyanDisktenOku }) {
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
    const q3 = sabotajOzeti({ sab, ekler: ek.get(s.dosya) || [], kume: s.kume });
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
    // 8) hangi dosya değişince koşmalı
    const q8 = tetikOzeti({ beyanSonucu: beyanOku(s.dosya), okunanYollar: s.okunanYollar, dunya: Boolean(d) });
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
      q8_tetik: q8,
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
    sabotajOlculmeyen: say((k) => k.q3_sabotaj.durum === 'olculmedi'),
    sabotajCeliski: say((k) => k.q3_sabotaj.durum === 'celiski'),
    sabotajKismi: say((k) => k.q3_sabotaj.durum === 'olculdu' && k.q3_sabotaj.kismi),
    ortam: ortamlar,
    oneriler,
    tetikBeyanli: say((k) => k.q8_tetik.kaynak === 'beyan'),
    tetikStatik: say((k) => k.q8_tetik.kaynak === 'statik'),
    tetikOlculmeyen: say((k) => k.q8_tetik.kaynak === 'yok'),
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
      ['sabotajda ÇELİŞKİ (aynı test için farklı hüküm, çözülmedi)', String(oz.sabotajCeliski)],
      ['KISMİ koruma (kırmızı veriyor ama ölçülen bir bozulmaya yeşil kalıyor)', String(oz.sabotajKismi)],
      ['8. soru: TETİK beyanı yazılı dosya (kesin)', String(oz.tetikBeyanli)],
      ['8. soru: yalnız statik okumadan (kesin DEĞİL)', String(oz.tetikStatik)],
      ['8. soru: ÖLÇÜLMEDİ (beyan yok, okunan yol yok)', String(oz.tetikOlculmeyen)],
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
    'ÇELİŞKİLER (aynı test için farklı sabotaj hükmü; çözülmedi, sessizce seçilmedi)',
    (k) => k.q3_sabotaj.durum === 'celiski',
    ['Test', 'Kayıtlar'],
    (k) => [`\`${k.dosya}\``, k.q3_sabotaj.kaynaklar.map((x) => `${x.dosya}=${x.hukum}`).join('; ')],
  );
  bol(
    'Yerine geçen ölçümler (bilinçli tekrar: önceki kaydın yerine açıkça ilan edilmiş yeniden ölçüm)',
    (k) => k.q3_sabotaj.tekrar && k.q3_sabotaj.tekrar.tur === 'yerine-gecti',
    ['Test', 'Seçilen kayıt', 'Neden', 'Kayıtlar'],
    (k) => [
      `\`${k.dosya}\``,
      k.q3_sabotaj.tekrar.secilen,
      String(k.q3_sabotaj.tekrar.neden).replace(/\|/g, '/'),
      k.q3_sabotaj.tekrar.kaynaklar.map((x) => `${x.dosya}=${x.hukum}`).join('; '),
    ],
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
    'Kısmi koruma (test kırmızı veriyor ama bazı bozulmalara yeşil kalıyor: silme adayı DEĞİL, güçlendirme adayı)',
    (k) => k.q3_sabotaj.durum === 'olculdu' && k.q3_sabotaj.kismi,
    ['Test', 'Yakalanmayan bozulma'],
    (k) => [
      `\`${k.dosya}\``,
      [...k.q3_sabotaj.yakalanmayanlar, ...(k.q3_sabotaj.ekYakalanmayan || []).map((x) => `${x} (ek yoklama)`)]
        .map((x) => String(x).replace(/\|/g, '/'))
        .join('; ')
        .slice(0, 300),
    ],
  );
  L.push('## Tüm dosyalar');
  L.push('');
  L.push('Ayrıntı (sekiz soru, her dosya için) `test-karnesi-*.json` içindedir. Bu tablo yalnız özet sütunlarını verir.');
  L.push('');
  tablo(
    ['Dosya', 'Küme', 'CI kırmızı', 'Sabotaj', 'Ortam', 'Süre (ms)', 'Tetik', 'Aday'],
    karne.kayitlar.map((k) => [
      `\`${k.dosya}\``,
      k.kume,
      k.q2_ci.kirmizi === undefined ? 'ölçülmedi' : String(k.q2_ci.kirmizi),
      k.q3_sabotaj.durum === 'olculdu' ? `${k.q3_sabotaj.hukum} (${k.q3_sabotaj.yakalanan}/${k.q3_sabotaj.denenen})` : 'ölçülmedi',
      k.q4_ortam.hukum,
      k.q5_sure.olculmedi ? 'ölçülmedi' : String(k.q5_sure.testMs),
      k.q8_tetik.kaynak === 'yok' ? 'ölçülmedi' : `${k.q8_tetik.kaynak} (${k.q8_tetik.tetik.length})`,
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
    ek: ekOku(a.sabotaj),
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

module.exports = {
  MIN_DAL,
  KUMELEME_SAAT,
  SURUM,
  ciOzeti,
  ekOku,
  imzaListesi,
  karneUret,
  kumele,
  mdYaz,
  oneriVer,
  ortamHukmu,
  ozetle,
  sabotajBirlestir,
  sabotajOku,
  sabotajOzeti,
  sonrakiSonuc,
  tetikOzeti,
  yerineGecenOku,
};
