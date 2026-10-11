#!/usr/bin/env node
/**
 * ALT-38d · SEÇİCİNİN GERİYE DÖNÜK DOĞRULAMASI VE PR ÖLÇÜMÜ (karar 308, B4). Tek süreçte koşar (ajan dağıtımı gerekmez).
 *
 *   --b4 kirmizi-kosular.json [--cikti sonuc.jsonl] [--harita yol] [--depo sahip/depo] [--taban master]
 *       "Seçici, CI'da kırmızı veren her PR koşusunda kırılan testi SEÇER miydi?" Kaçırılan = 0 olmalı.
 *       Girdi kaydı: { runId, attempt, event, prNo, dal, headSha, baseSha, olusturma, kirilanAdimlar[], kirilanTestDosyalari[],
 *       degisenDosyalar[], testAyiklanamadi, degisenDosyaYok, sonradanYesilAyniCommit, dalDeneme }; dosya dizi ya da { kosular | kayitlar }.
 *       Değişen dosyalar KAYITTAN alınır; yalnız `degisenDosyaYok` ise `gh api compare/<baseSha>...<headSha>` çağrılır.
 *       Her koşu için seçici BUGÜNKÜ harita ve ağaçla koşar. Kategoriler (HER BİRİ AYRI sayılır, kaçırma sayısına KARIŞMAZ):
 *         ASIL            normal kayıt: kırılan test(ler) bilinir; seçilmediyse KACIRILDI sayılır
 *         TEST-AYIKLANAMADI  kırılan test dosyası log'dan çıkarılamadı: değerlendirilemez
 *         TEST-YOK        kırılan test dosyası listesi boş (kırmızı adım Test değil: Lint, Build, Install...): değerlendirilecek test yok
 *         DAL-DENEME      dal üzerindeki deneme koşusu (`dalDeneme`)
 *         SONRADAN-YESIL  aynı commit sonradan yeşile döndü (`sonradanYesilAyniCommit`): dünya durumu/dalgalanma
 *         PR-DISI         `event` pull_request değil (seçici yalnız PR kapısında koşar)
 *       durum (ASIL için): SECILDI | TAM (seçici tam dedi: kaçırma imkânsız) | KACIRILDI | OLCULEMEDI.
 *       Ayrı kategorilerde seçim yine hesaplanır ve `kacirilan` bilgi olarak yazılır, ama özetin "kacirilanlar" listesine GİRMEZ.
 *       --log-dizini <dizin>   (isteğe bağlı) `<runId>-*.txt` vitest günlükleri: kırılan test BAŞLIKLARI çıkarılır (kayıtta `kirilanBasliklar`
 *       { test: [zincir] } varsa o kullanılır) ve ham KACIRILDI koşuları AÇIKLANIR (`kacirilanlariAcikla`). Ham sayı `asil.kacirildi`de DURUR;
 *       açıklanamayan koşular `gercekKacirilan` listesine düşer: ŞART = 0. Başlık bilinmiyorsa koşu açıklanmış SAYILMAZ (güvenli yön).
 *   --ozet sonuc.jsonl [...]   satırları toplar (kaçırılan listesi dahil).
 *   --pr-olc --sure vitest-0.json [...] [--ci-log ci.log] [--belge 12] [--kod 12] [--limit 150] [--depo ...]
 *       Son birleşmiş PR'lardan (bu ağacın atası olanlar) belge-yalnız ve kod PR'ı seçer, her biri için seçilen test dosyası/test/süre ve
 *       tam pakete göre yüzdeyi yazar. `--sure`: ölçüm koşusunun `vitest-*.json` dosyaları (dosya süreleri ve test sayıları; YEREL makine).
 *       `--ci-log`: bir CI koşusunun Test adımı günlüğü (Linux, CI'ın gerçek süreleri): her dosyanın test süresi + dosya başı ortak yük payı
 *       (transform+setup+import+environment ÷ dosya) `ciSure*` alanlarına yazılır. `belirsiz*` alanları seçimin içindeki "her zaman koşan"
 *       (izlenemeyen alt süreç) testlerin payıdır.
 *
 * SINIRLAR (dürüstçe): (1) harita ve içe aktarma grafiği BUGÜNÜN ağacındandır; koşudan sonra silinen/değişen testler `kapsamDisi` sayılır.
 * (2) Kayıtta dosya DURUMU (silindi/taşındı) yoksa tüm yollar var sayılır (silinmiş kod dosyası kuralı işlemez); bu kural yalnız ek tam üretir,
 * yani kaçırma saymayı gizlemez. (3) `compare` en çok 300 dosya verir; ≥300 ise `tam` varsayılır. (4) Dünya durumu testleri PR kapısında
 * koşmadığı için `kapsamDisi`dır.
 */
'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const sec = require('./test-sec.cjs');

const KOK = path.resolve(__dirname, '..', '..');
const DOSYA_SINIRI_COMPARE = 300;
const AYRI_KATEGORILER = ['TEST-AYIKLANAMADI', 'TEST-YOK', 'DAL-DENEME', 'SONRADAN-YESIL', 'PR-DISI'];
/** Aynı test+başlık bu süre içinde yeniden kırmızıysa AYNI zincirdendir (karne ölçümündeki "dünya olayı" penceresiyle aynı: 12 saat). */
const ZINCIR_PENCERESI_MS = 12 * 60 * 60 * 1000;
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*[A-Za-z]`, 'g');

function satirYaz(nesne, hedef = null) {
  const metin = `${JSON.stringify(nesne)}\n`;
  if (hedef) fs.appendFileSync(hedef, metin, 'utf8');
  else process.stdout.write(metin);
}

function argumanlar(argv) {
  const s = { b4: null, cikti: null, ozet: [], prOlc: false, harita: 'scripts/ci/test-haritasi.json', depo: null, taban: 'master', sure: [], belge: 12, kod: 12, limit: 150, logDizini: null, ciLog: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--b4') s.b4 = argv[++i];
    else if (a === '--cikti') s.cikti = argv[++i];
    else if (a === '--pr-olc') s.prOlc = true;
    else if (a === '--ozet' || a === '--sure') {
      while (argv[i + 1] && !argv[i + 1].startsWith('--')) (a === '--ozet' ? s.ozet : s.sure).push(argv[++i]);
    } else if (['--belge', '--kod', '--limit'].includes(a)) s[a.slice(2)] = Number.parseInt(argv[++i], 10);
    else if (a === '--harita') s.harita = argv[++i];
    else if (a === '--depo') s.depo = argv[++i];
    else if (a === '--taban') s.taban = argv[++i];
    else if (a === '--log-dizini') s.logDizini = argv[++i];
    else if (a === '--ci-log') s.ciLog = argv[++i];
    else throw new Error(`bilinmeyen argüman: ${a}`);
  }
  return s;
}

function gh(args) {
  return childProcess.execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
}

function depoAdi() {
  const url = childProcess.execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: KOK, encoding: 'utf8', windowsHide: true }).trim();
  const eslesme = /github\.com[:/]([^/]+\/[^/.]+)(?:\.git)?$/.exec(url);
  if (!eslesme) throw new Error('origin adresi GitHub deposu değil');
  return eslesme[1];
}

/** Yol kayıtlarını (metin ya da { filename|dosya|yol|path, status|durum, previous_filename|onceki }) değişen/silinen kümelerine çevirir. */
function dosyaKumeleri(kayitlar) {
  const degisen = new Set();
  const silinen = new Set();
  for (const f of kayitlar || []) {
    if (typeof f === 'string') {
      degisen.add(f.split('\\').join('/'));
      continue;
    }
    if (!f || typeof f !== 'object') continue;
    const ad = f.filename || f.dosya || f.yol || f.path;
    if (typeof ad !== 'string') continue;
    degisen.add(ad.split('\\').join('/'));
    const durum = String(f.status || f.durum || '').toLowerCase();
    if (durum === 'removed' || durum === 'silindi' || durum === 'deleted') silinen.add(ad.split('\\').join('/'));
    const onceki = f.previous_filename || f.onceki;
    if (typeof onceki === 'string' && onceki !== '') {
      degisen.add(onceki.split('\\').join('/'));
      silinen.add(onceki.split('\\').join('/'));
    }
  }
  return { degisen: [...degisen].sort(), silinen };
}

/** `gh api compare` ile iki commit arasındaki fark (yalnız kayıtta değişen dosya yoksa). */
function degisenleriAl(depo, taban, sha) {
  const cevap = JSON.parse(gh(['api', `repos/${depo}/compare/${taban}...${sha}`]));
  const dosyalar = cevap.files || [];
  return { ...dosyaKumeleri(dosyalar), kesik: dosyalar.length >= DOSYA_SINIRI_COMPARE };
}

/** `gh api pulls/N/files` (sayfalı) ile bir PR'ın dosyaları. */
function prDosyalari(depo, no) {
  const ham = gh(['api', `repos/${depo}/pulls/${no}/files`, '--paginate', '--jq', '.[] | [.filename, .status, (.previous_filename // "")] | @tsv']);
  const kayitlar = ham
    .split('\n')
    .filter((s) => s !== '')
    .map((s) => {
      const [filename, status, onceki] = s.split('\t');
      return { filename, status, previous_filename: onceki || undefined };
    });
  return dosyaKumeleri(kayitlar);
}

async function oturumVeBaglam(s) {
  const harita = JSON.parse(fs.readFileSync(path.join(KOK, s.harita), 'utf8'));
  process.env.VENTHUB_DUNYA_DURUMU = 'dislan';
  const oturum = await sec.vitestOturumuAc(KOK);
  const tazelik = sec.tazelikHesapla(KOK, oturum.testler);
  return { harita, oturum, tazelik, evren: new Set(oturum.testler) };
}

/** Bir değişiklik kümesi için seçici sonucu (bağlamdaki harita, tazelik ve ÖNBELLEKLİ içe aktarma grafiğiyle). */
async function secimYap(baglam, degisen, silinen) {
  const dosyaVarMi = (y) => !silinen.has(y);
  const adaylar = sec.ilgiliAdaylari(degisen, dosyaVarMi);
  const ilgiliSonuc = adaylar.length > 0 ? await baglam.oturum.ilgili(adaylar) : [];
  return sec.sec({ degisenDosyalar: degisen, testDosyalari: baglam.oturum.testler, harita: baglam.harita, ilgili: () => ilgiliSonuc, tazelik: baglam.tazelik, dosyaVarMi });
}

function kayitlariOku(dosya) {
  const ham = JSON.parse(fs.readFileSync(dosya, 'utf8'));
  const dizi = Array.isArray(ham) ? ham : ham.kosular || ham.kayitlar || ham.runs;
  if (!Array.isArray(dizi)) throw new Error('B4 dosyası dizi değil ({ kosular | kayitlar } da kabul)');
  return dizi;
}

/** Kaydın kategorisi (öncelik sırası sabit: bir kayıt TEK kategoriye girer). */
function kategori(k) {
  if (k.testAyiklanamadi) return 'TEST-AYIKLANAMADI';
  if (kirilanTestler(k).length === 0) return 'TEST-YOK';
  if (k.event && k.event !== 'pull_request') return 'PR-DISI';
  if (k.dalDeneme) return 'DAL-DENEME';
  if (k.sonradanYesilAyniCommit) return 'SONRADAN-YESIL';
  return 'ASIL';
}

function kirilanTestler(k) {
  const ham = Array.isArray(k.kirilanTestDosyalari) ? k.kirilanTestDosyalari : [];
  return [...new Set(ham.map((t) => (typeof t === 'string' ? t : t && (t.dosya || t.file)) || '').map((t) => String(t).split('\\').join('/')).filter(Boolean))].sort();
}

/** vitest günlüğünden (ANSI'li ve zaman damgalı olabilir) bir test dosyasının KIRMIZI başlık zincirleri: `FAIL  <test> > <başlık zinciri>`. SAF. */
function basliklariCikar(metin, testDosyasi) {
  const onek = `FAIL  ${testDosyasi} > `;
  const bulunan = new Set();
  for (const satir of String(metin).replace(ANSI, '').split('\n')) {
    const i = satir.indexOf(onek);
    if (i === -1) continue;
    const zincir = satir.slice(i + onek.length).trim();
    if (zincir !== '') bulunan.add(zincir);
  }
  return [...bulunan].sort();
}

/** Başlık zincirinin son halkası (testin kendi adı). */
function yaprakBaslik(zincir) {
  const parcalar = String(zincir).split(' > ');
  return parcalar[parcalar.length - 1].trim();
}

/** Kaynak metni başlığı (yaprak) AYNEN içeriyor mu? Kaçışlı tırnak (`\'`) kaynakta düz tırnağa çevrilerek bakılır. */
function baslikIcerir(kaynak, zincir) {
  const yaprak = yaprakBaslik(zincir);
  if (yaprak === '') return false;
  const duz = String(kaynak).replace(/\\(['"`])/g, '$1');
  return duz.includes(yaprak);
}

/**
 * Başlık bugünkü kaynakta VAR mı? Yer tutuculu başlık (`%s`, `$ad`: it.each) kaynakla birebir karşılaştırılamaz → VAR sayılır
 * (güvenli yön: kırmızı bugünkü kapıda kalmış sayılır, açıklama sınıfına girmez).
 */
function baslikVarMi(kaynak, zincir) {
  const yaprak = yaprakBaslik(zincir);
  if (yaprak === '' || /[%$]/.test(yaprak)) return true;
  return baslikIcerir(kaynak, zincir);
}

/**
 * ASIL kategorisinde KACIRILDI görünen koşuları AÇIKLAR. SAF: dışarıdan yalnız bugünkü kaynak okuyucusu ve dünya durumu test listesi gelir.
 * Her kırılan (test, başlık) için sınıf (`gercek` = seçicinin kapatması GEREKEN kaçırma):
 *   DUNYA-KOLU-TASINDI  başlık bugünkü test dosyasında YOK, bir DÜNYA DURUMU testinde VAR: kol PR kapısından çıkarılmış, bugünkü kapı o kırmızıyı üretmez
 *   TEST-DEGISTI        başlık ne bugünkü dosyada ne dünya testlerinde var (silinmiş/yeniden adlandırılmış): bugünkü harita ile değerlendirilemez (ayrı sayılır)
 *   DEVRALINAN          aynı test+başlık ZİNCİRİNDE (12 saat) BAŞKA dalda/master push'ta daha önce kırmızı: kırmızı bu PR'ın diff'inden değil tabandan geliyor.
 *                       Zincirin KÖKÜ PR dışı (master push TAM koşar) ya da seçilmiş/TAM bir PR koşusuysa güvence VAR; KÖK seçicinin kaçırdığı bir PR koşusuysa GERÇEK
 *   KOK                 zincirin ilk ve tek üyesi (ya da aynı dalın kendi tekrarı): PR'ın kendi kırmızısı, seçici seçmedi → GERÇEK
 *   BASLIK-YOK          başlık bilinmiyor (günlük/alan yok): açıklanamaz → GERÇEK
 * Girdi: kayitlar (B4 kayıtları; `kirilanBasliklar` { test: [zincir] } alanı olanlar), sonuclar (b4 sonuç satırları), dunyaTestleri (yol listesi), kaynakOku (yol → metin).
 * Dönüş: Map<"runId#attempt", { aciklama: [{ test, baslik, sinif, gercek, kok? }], gercek: boolean }> (yalnız ASIL KACIRILDI satırları).
 */
function kacirilanlariAcikla({ kayitlar, sonuclar, dunyaTestleri, kaynakOku }) {
  const anahtar = (r) => `${r.runId}#${r.attempt}`;
  const sonucHaritasi = new Map(sonuclar.filter((r) => r && r.tur !== 'OZET').map((r) => [anahtar(r), r]));
  const gruplar = new Map();
  for (const k of kayitlar) {
    const basliklar = k && typeof k.kirilanBasliklar === 'object' && k.kirilanBasliklar !== null ? k.kirilanBasliklar : {};
    for (const test of kirilanTestler(k)) {
      for (const baslik of Array.isArray(basliklar[test]) ? basliklar[test] : []) {
        const g = `${test}\0${baslik}`;
        if (!gruplar.has(g)) gruplar.set(g, []);
        gruplar.get(g).push({ anahtar: anahtar(k), t: Date.parse(k.olusturma), dal: String(k.dal || ''), event: k.event || 'pull_request', runId: k.runId, test, baslik });
      }
    }
  }
  // Zincir kurma: 12 saati aşmayan ardışık kırmızılar aynı zincir; üye, zincirde BAŞKA bir daldan önceki üye varsa devralınandır.
  const olay = new Map();
  for (const uyeler of gruplar.values()) {
    uyeler.sort((a, b) => (a.t - b.t) || String(a.anahtar).localeCompare(String(b.anahtar)));
    let kok = null;
    let sonT = Number.NEGATIVE_INFINITY;
    let dallar = new Set();
    for (const u of uyeler) {
      const zamanYok = Number.isNaN(u.t);
      if (kok === null || zamanYok || Number.isNaN(sonT) || u.t - sonT > ZINCIR_PENCERESI_MS) {
        kok = u;
        dallar = new Set();
      }
      u.devralan = [...dallar].some((d) => d !== u.dal);
      u.kok = kok;
      dallar.add(u.dal);
      sonT = u.t;
      olay.set(`${u.anahtar}\0${u.test}\0${u.baslik}`, u);
    }
  }
  const dunyaKaynaklari = (dunyaTestleri || []).map((d) => kaynakOku(d));
  const sonuc = new Map();
  for (const r of sonuclar) {
    if (!r || r.tur === 'OZET' || r.kategori !== 'ASIL' || r.durum !== 'KACIRILDI') continue;
    const kayit = kayitlar.find((k) => anahtar(k) === anahtar(r));
    const basliklar = kayit && typeof kayit.kirilanBasliklar === 'object' && kayit.kirilanBasliklar !== null ? kayit.kirilanBasliklar : {};
    const aciklama = [];
    for (const test of r.kacirilan) {
      const liste = Array.isArray(basliklar[test]) ? basliklar[test] : [];
      if (liste.length === 0) {
        aciklama.push({ test, baslik: null, sinif: 'BASLIK-YOK', gercek: true });
        continue;
      }
      const bugun = kaynakOku(test);
      for (const baslik of liste) {
        if (!baslikVarMi(bugun, baslik)) {
          const dunyada = dunyaKaynaklari.some((d) => baslikIcerir(d, baslik));
          aciklama.push({ test, baslik, sinif: dunyada ? 'DUNYA-KOLU-TASINDI' : 'TEST-DEGISTI', gercek: false });
          continue;
        }
        const u = olay.get(`${anahtar(r)}\0${test}\0${baslik}`);
        if (!u || !u.devralan) {
          aciklama.push({ test, baslik, sinif: 'KOK', gercek: true });
          continue;
        }
        const kokSonuc = sonucHaritasi.get(u.kok.anahtar);
        const kokPrDisi = u.kok.event !== 'pull_request';
        const kokSecildi = Boolean(kokSonuc) && !(Array.isArray(kokSonuc.kacirilan) && kokSonuc.kacirilan.includes(test));
        aciklama.push({ test, baslik, sinif: 'DEVRALINAN', gercek: !(kokPrDisi || kokSecildi), kok: { runId: u.kok.runId, dal: u.kok.dal, olay: u.kok.event, guvence: kokPrDisi ? 'master-push-tam' : kokSecildi ? 'secildi' : 'yok' } });
      }
    }
    sonuc.set(anahtar(r), { aciklama, gercek: aciklama.some((a) => a.gercek) });
  }
  return sonuc;
}

/** Günlük dizininden bir koşunun (runId'nin TÜM denemeleri) kırılan test başlıkları: { test: [zincir] }. G/Ç: günlükleri okur. */
function gunluktenBasliklar(logDizini, runId, testler) {
  const sonuc = {};
  let dosyalar = [];
  try {
    dosyalar = fs.readdirSync(logDizini).filter((a) => a.startsWith(`${runId}-`));
  } catch {
    return sonuc;
  }
  const metin = dosyalar.map((a) => fs.readFileSync(path.join(logDizini, a), 'utf8')).join('\n');
  for (const t of testler) sonuc[t] = basliklariCikar(metin, t);
  return sonuc;
}

function dunyaTestleriniOku() {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(KOK, 'scripts/ci/dunya-durumu-testleri.json'), 'utf8'));
    return (Array.isArray(j.testler) ? j.testler : []).map((t) => t && t.test).filter((t) => typeof t === 'string');
  } catch {
    return [];
  }
}

function kaynakOkuyucu() {
  return (yol) => {
    try {
      return fs.readFileSync(path.join(KOK, yol), 'utf8');
    } catch {
      return '';
    }
  };
}

async function b4Degerlendir(s) {
  const depo = s.depo;
  const kayitlar = kayitlariOku(s.b4);
  if (s.logDizini) {
    for (const k of kayitlar) {
      const testler = kirilanTestler(k);
      if (testler.length > 0 && (typeof k.kirilanBasliklar !== 'object' || k.kirilanBasliklar === null)) k.kirilanBasliklar = gunluktenBasliklar(s.logDizini, k.runId, testler);
    }
  }
  const baglam = await oturumVeBaglam(s);
  const sonuclar = [];
  try {
    for (const k of kayitlar) {
      const kat = kategori(k);
      const kirilan = kirilanTestler(k);
      const cikti = { runId: k.runId, attempt: k.attempt, prNo: k.prNo ?? null, dal: k.dal, kategori: kat, degisen: 0, durum: 'OLCULEMEDI', tam: false, secilen: 0, kirilan, kacirilan: [], kapsamDisi: [], neden: [] };
      try {
        if (kat === 'TEST-AYIKLANAMADI' || kat === 'TEST-YOK') {
          cikti.neden = [kat === 'TEST-YOK' ? 'kırılan test dosyası yok (kırmızı adım test değil)' : "kırılan test dosyası log'dan çıkarılamadı"];
        } else {
          let fark = dosyaKumeleri(k.degisenDosyalar);
          let kesik = false;
          if (k.degisenDosyaYok || fark.degisen.length === 0) {
            const taban = k.baseSha || s.taban;
            const uzak = degisenleriAl(depo || depoAdi(), taban, k.headSha);
            fark = uzak;
            kesik = uzak.kesik;
          }
          cikti.degisen = fark.degisen.length;
          if (fark.degisen.length === 0) {
            cikti.neden = ['değişen dosya listesi boş (kayıtta yok, compare da boş)'];
          } else {
            const olculebilir = kirilan.filter((t) => baglam.evren.has(t));
            cikti.kapsamDisi = kirilan.filter((t) => !baglam.evren.has(t));
            const sonuc = await secimYap(baglam, fark.degisen, fark.silinen);
            cikti.tam = sonuc.tam || kesik;
            cikti.secilen = sonuc.secilen.length;
            cikti.neden = sonuc.neden.slice(0, 3);
            const secilenKume = new Set(sonuc.secilen);
            cikti.kacirilan = cikti.tam ? [] : olculebilir.filter((t) => !secilenKume.has(t));
            if (olculebilir.length === 0) {
              cikti.neden.push('kırılan testlerin hiçbiri bugünkü PR evreninde yok (silinmiş ya da dünya durumu)');
            } else {
              cikti.durum = cikti.kacirilan.length > 0 ? 'KACIRILDI' : cikti.tam ? 'TAM' : 'SECILDI';
            }
          }
        }
      } catch (e) {
        cikti.neden = [`hata: ${String(e && e.message ? e.message : e).slice(0, 200)}`];
      }
      sonuclar.push(cikti);
    }
  } finally {
    await baglam.oturum.kapat();
  }
  // Açıklama: ham KACIRILDI koşuları başlıklarıyla sınıflanır (günlük dizini ya da kayıttaki `kirilanBasliklar` gerekir; yoksa hiçbiri açıklanmış sayılmaz).
  const aciklamalar = kacirilanlariAcikla({ kayitlar, sonuclar, dunyaTestleri: dunyaTestleriniOku(), kaynakOku: kaynakOkuyucu() });
  for (const cikti of sonuclar) {
    const a = aciklamalar.get(`${cikti.runId}#${cikti.attempt}`);
    if (a) {
      cikti.aciklama = a.aciklama;
      cikti.gercek = a.gercek;
    }
    satirYaz(cikti, s.cikti);
  }
  satirYaz(ozetKur(sonuclar), s.cikti);
}

/** Sonuç satırlarından özet: ASIL kayıtlar ayrı, ayrı kategoriler ayrı sayılır; kaçırılanlar yalnız ASIL'den. */
function ozetKur(satirlar) {
  const ozet = { tur: 'OZET', kosu: 0, asil: { toplam: 0, secildi: 0, tam: 0, kacirildi: 0, olculemedi: 0 }, ayri: {}, kacirilanlar: [], ayriKacirilanlar: [], aciklanan: {}, gercekKacirilan: [] };
  for (const k of AYRI_KATEGORILER) ozet.ayri[k] = { toplam: 0, kacirildi: 0 };
  for (const k of satirlar) {
    if (!k || k.tur === 'OZET') continue;
    ozet.kosu += 1;
    if (k.kategori === 'ASIL') {
      ozet.asil.toplam += 1;
      if (k.durum === 'SECILDI') ozet.asil.secildi += 1;
      else if (k.durum === 'TAM') ozet.asil.tam += 1;
      else if (k.durum === 'KACIRILDI') {
        ozet.asil.kacirildi += 1;
        ozet.kacirilanlar.push({ runId: k.runId, attempt: k.attempt, prNo: k.prNo, dal: k.dal, kacirilan: k.kacirilan });
        // Açıklama yoksa (günlük verilmedi) koşu AÇIKLANMAMIŞTIR: gerçek kaçırma sayılır (güvenli yön).
        if (k.gercek === false) {
          for (const a of k.aciklama || []) ozet.aciklanan[a.sinif] = (ozet.aciklanan[a.sinif] || 0) + 1;
        } else {
          ozet.gercekKacirilan.push({ runId: k.runId, attempt: k.attempt, prNo: k.prNo, dal: k.dal, kacirilan: k.kacirilan, aciklama: k.aciklama || [] });
        }
      } else ozet.asil.olculemedi += 1;
    } else if (ozet.ayri[k.kategori]) {
      ozet.ayri[k.kategori].toplam += 1;
      if (k.kacirilan && k.kacirilan.length > 0) {
        ozet.ayri[k.kategori].kacirildi += 1;
        ozet.ayriKacirilanlar.push({ kategori: k.kategori, runId: k.runId, dal: k.dal, kacirilan: k.kacirilan });
      }
    }
  }
  return ozet;
}

function ozetle(dosyalar) {
  const satirlar = [];
  for (const d of dosyalar) {
    for (const satir of fs.readFileSync(d, 'utf8').split('\n')) {
      if (satir.trim() !== '' && satir.startsWith('{')) satirlar.push(JSON.parse(satir));
    }
  }
  satirYaz(ozetKur(satirlar));
}

/** PR türü: belge (tüm yollar docs/ .claude/ .agent/ ya da kök *.md), kuresel (küresel yol var), kod (src/ var), diger. */
function prTuru(degisen) {
  const belgeMi = (y) => /^(?:docs|\.claude|\.agent)\//.test(y) || (!y.includes('/') && y.endsWith('.md') && !y.startsWith('.'));
  if (degisen.every(belgeMi)) return 'belge';
  if (degisen.some((y) => sec.kureselGirdiNedeni(y, sec.KURESEL_GIRDILER) !== null)) return 'kuresel';
  if (degisen.some((y) => y.startsWith('src/'))) return 'kod';
  return 'diger';
}

/** vitest sonuç dosyaları: test dosyası → { sn, test }. */
function sureleriOku(dosyalar) {
  const harita = new Map();
  for (const dosya of dosyalar) {
    const ham = JSON.parse(fs.readFileSync(dosya, 'utf8'));
    for (const r of ham.testResults || []) {
      const goreli = path.relative(KOK, r.name).split(path.sep).join('/');
      harita.set(goreli, { sn: Math.max(0, (r.endTime - r.startTime) / 1000), test: (r.assertionResults || []).length });
    }
  }
  return harita;
}

/** CI günlüğündeki dosya satırı: `✓ <test dosyası> (N tests[ | K skipped]) <ms>ms` (iç içe test satırlarının `(N tests)` kısmı yoktur: eşleşmez). */
const CI_DOSYA_SATIRI = /(?:^|\s)[✓↓❯×]\s+(\S+\.(?:test|spec)\.[cm]?[jt]sx?)\s+\((\d+) tests?(?:\s*\|\s*\d+ (?:skipped|failed|todo))*\)(?:\s+(\d+)ms)?\s*$/;
const CI_SURE_OZETI = /Duration\s+[\d.]+s\s+\(transform ([\d.]+)s, setup ([\d.]+)s, import ([\d.]+)s, tests ([\d.]+)s, environment ([\d.]+)s\)/;
const CI_DOSYA_TOPLAMI = /Test Files\s+.*\((\d+)\)\s*$/;

/**
 * Bir CI koşusunun vitest günlüğü (`gh run view --log` çıktısı; ANSI ya da `^[[32m` yazımı olabilir) → her test dosyası için MALİYET MODELİ:
 * `sn` = dosyanın kendi test süresi (günlükte basılan ms) + dosya başı ORTAK YÜK payı (transform+setup+import+environment ÷ dosya sayısı).
 * Toplam model süresi = tüm işlemci saniyesi (paralel iş sayısına bölünmemiş): yüzdeler oransaldır, duvar saati değildir. SAF.
 */
function ciGunluguOku(metin) {
  const temiz = String(metin).replace(ANSI, '').replace(/\^\[\[[0-9;]*[A-Za-z]/g, '');
  const ham = new Map();
  let yuk = null;
  let dosyaToplami = null;
  for (const satir of temiz.split('\n')) {
    const d = CI_DOSYA_SATIRI.exec(satir.trimEnd());
    if (d) {
      ham.set(d[1], { test: Number(d[2]), ms: d[3] === undefined ? 0 : Number(d[3]) });
      continue;
    }
    const o = CI_SURE_OZETI.exec(satir);
    if (o) yuk = Number(o[1]) + Number(o[2]) + Number(o[3]) + Number(o[5]);
    const t = CI_DOSYA_TOPLAMI.exec(satir.trimEnd());
    if (t) dosyaToplami = Number(t[1]);
  }
  const dosyaBasiYuk = yuk !== null && (dosyaToplami || ham.size) > 0 ? yuk / (dosyaToplami || ham.size) : 0;
  const sureler = new Map();
  for (const [dosya, k] of ham) sureler.set(dosya, { sn: k.ms / 1000 + dosyaBasiYuk, test: k.test });
  return { sureler, dosyaBasiYuk, dosyaToplami: dosyaToplami || ham.size };
}

function agacinAtasiMi(oid) {
  try {
    childProcess.execFileSync('git', ['merge-base', '--is-ancestor', oid, 'HEAD'], { cwd: KOK, stdio: 'ignore', windowsHide: true });
    return true;
  } catch {
    return false;
  }
}

async function prOlc(s) {
  if (s.sure.length === 0) throw new Error('--sure <vitest-*.json ...> gerekli (ölçüm koşusunun süre ve test sayıları)');
  const depo = s.depo || depoAdi();
  const sureler = sureleriOku(s.sure);
  const ci = s.ciLog ? ciGunluguOku(fs.readFileSync(s.ciLog, 'utf8')) : null;
  const baglam = await oturumVeBaglam(s);
  const toplam = { dosya: baglam.oturum.testler.length, test: 0, sn: 0, ciSn: 0 };
  for (const t of baglam.oturum.testler) {
    const k = sureler.get(t) || { sn: 0, test: 0 };
    toplam.test += k.test;
    toplam.sn += k.sn;
    if (ci) toplam.ciSn += (ci.sureler.get(t) || { sn: ci.dosyaBasiYuk }).sn;
  }
  const belirsizMi = (t) => Boolean(baglam.harita.testler[t] && baglam.harita.testler[t].belirsiz);
  const kota = { belge: s.belge, kod: s.kod };
  const sayac = { belge: 0, kod: 0, kuresel: 0, diger: 0 };
  try {
    const liste = JSON.parse(gh(['pr', 'list', '--state', 'merged', '--base', s.taban, '--limit', String(s.limit), '--json', 'number,title,mergeCommit']));
    for (const pr of liste) {
      if (sayac.belge >= kota.belge && sayac.kod >= kota.kod) break;
      if (!pr.mergeCommit || !agacinAtasiMi(pr.mergeCommit.oid)) continue;
      let fark;
      try {
        fark = prDosyalari(depo, pr.number);
      } catch {
        continue;
      }
      if (fark.degisen.length === 0) continue;
      const tur = prTuru(fark.degisen);
      if ((tur === 'belge' || tur === 'kod') && sayac[tur] >= kota[tur]) continue;
      const sonuc = await secimYap(baglam, fark.degisen, fark.silinen);
      let test = 0;
      let sn = 0;
      let ciSn = 0;
      let belirsizDosya = 0;
      let belirsizCiSn = 0;
      for (const t of sonuc.secilen) {
        const k = sureler.get(t) || { sn: 0, test: 0 };
        test += k.test;
        sn += k.sn;
        const cik = ci ? (ci.sureler.get(t) || { sn: ci.dosyaBasiYuk }).sn : 0;
        ciSn += cik;
        if (!sonuc.tam && belirsizMi(t)) {
          belirsizDosya += 1;
          belirsizCiSn += cik;
        }
      }
      sayac[tur] += 1;
      const satir = {
        pr: pr.number,
        tur,
        baslik: pr.title.slice(0, 80),
        degisen: fark.degisen.length,
        tam: sonuc.tam,
        secilenDosya: sonuc.secilen.length,
        toplamDosya: toplam.dosya,
        secilenTest: test,
        toplamTest: toplam.test,
        testYuzde: Number(((100 * test) / toplam.test).toFixed(1)),
        secilenSureSn: Number(sn.toFixed(1)),
        toplamSureSn: Number(toplam.sn.toFixed(1)),
        sureYuzde: Number(((100 * sn) / toplam.sn).toFixed(1)),
        neden: sonuc.neden,
      };
      if (ci) {
        Object.assign(satir, {
          ciSecilenSn: Number(ciSn.toFixed(1)),
          ciToplamSn: Number(toplam.ciSn.toFixed(1)),
          ciSureYuzde: Number(((100 * ciSn) / toplam.ciSn).toFixed(1)),
          belirsizDosya,
          belirsizCiSn: Number(belirsizCiSn.toFixed(1)),
          belirsizHaricCiSureYuzde: Number(((100 * (ciSn - belirsizCiSn)) / toplam.ciSn).toFixed(1)),
        });
      }
      satirYaz(satir, s.cikti);
    }
    process.stderr.write(`[pr-olc] belge ${sayac.belge}/${kota.belge} · kod ${sayac.kod}/${kota.kod} · küresel ${sayac.kuresel} · diğer ${sayac.diger}\n`);
  } finally {
    await baglam.oturum.kapat();
  }
}

async function main() {
  const s = argumanlar(process.argv.slice(2));
  if (s.b4) await b4Degerlendir(s);
  else if (s.prOlc) await prOlc(s);
  else if (s.ozet.length > 0) ozetle(s.ozet);
  else throw new Error('kip seçilmedi: --b4 <dosya> | --ozet <jsonl...> | --pr-olc --sure <vitest-*.json...>');
}

if (require.main === module) {
  main().then(
    () => process.exit(0),
    (e) => {
      process.stderr.write(`[geriye] HATA: ${e && e.message ? e.message : String(e)}\n`);
      process.exit(1);
    },
  );
}

module.exports = { basliklariCikar, baslikVarMi, ciGunluguOku, dosyaKumeleri, kacirilanlariAcikla, kategori, kirilanTestler, ozetKur, prTuru };
