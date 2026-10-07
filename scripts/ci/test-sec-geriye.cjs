#!/usr/bin/env node
/**
 * ALT-38d · GERİYE DÖNÜK DOĞRULAMA (karar 308, B4): "seçici, CI'da kırmızı veren her PR koşusunda kırılan testi SEÇER miydi?"
 * Kaçırılan = 0 olmalı. Koşuyu ayrı süreçlere bölmek için üç kip (hepsi satır başına JSON, ayrı ajanlara dağıtılabilir):
 *
 *   --liste [--gun 30] [--ci-gecmis dosya.json]
 *       Aday kırmızı koşular: `pull_request` olayı, sonuç `failure`, kırılan test dosyası bilinen koşular (ci-gecmis.json:
 *       `kosular[].testDosyalari`). Her satır: { kosuId, dal, sha, tarih, kirilan: [test yolları] }.
 *   --kos girdi.jsonl [--harita yol] [--depo sahip/depo] [--taban master]
 *       Her aday için değişen dosyalar `gh api repos/<depo>/compare/<taban>...<sha>` ile alınır (PR'ın o koşudaki farkı: taban ile
 *       dal ucu arasındaki merge-base farkı; squash ile birleşmiş PR'ın dal commit'leri GitHub'da durur), seçici BUGÜNKÜ harita ve
 *       ağaçla koşar. Her satır: { kosuId, dal, sha, degisen, durum, tam, secilen, kirilan, kacirilan, kapsamDisi, neden }.
 *       durum: SECILDI (tüm ölçülebilir kırılanlar seçildi) | TAM (seçici tam dedi: kaçırma imkânsız) | KACIRILDI | OLCULEMEDI.
 *   --ozet sonuc1.jsonl [sonuc2.jsonl ...]
 *       Satırları toplar: { kosu, secildi, tam, kacirildi, olculemedi, kacirilanlar: [...] }.
 *
 * SINIRLAR (dürüstçe): (1) harita ve içe aktarma grafiği BUGÜNÜN ağacındandır; koşudan sonra silinen/değişen testler `kapsamDisi`
 * sayılır, bugün var olan testin geçmiş bağımlılığı bugünkü hâliyle ölçülür. (2) `compare` en çok 300 dosya verir; ≥300 ise `tam`
 * varsayılır. (3) merge-base'i master'da olan (ör. normal birleştirme commit'iyle girmiş) bir dal ucu için fark boş gelir: OLCULEMEDI.
 * (4) Dünya durumu testleri (`dunya-durumu-testleri.json`) PR kapısında koşmadığı için `kapsamDisi`dır.
 */
'use strict';

const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const sec = require('./test-sec.cjs');

const KOK = path.resolve(__dirname, '..', '..');
const DOSYA_SINIRI_COMPARE = 300;

function satirYaz(nesne) {
  process.stdout.write(`${JSON.stringify(nesne)}\n`);
}

function argumanlar(argv) {
  const s = { liste: false, kos: null, ozet: [], gun: 30, ciGecmis: null, harita: 'scripts/ci/test-haritasi.json', depo: null, taban: 'master' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--liste') s.liste = true;
    else if (a === '--kos') s.kos = argv[++i];
    else if (a === '--ozet') {
      while (argv[i + 1] && !argv[i + 1].startsWith('--')) s.ozet.push(argv[++i]);
    } else if (a === '--gun') s.gun = Number.parseInt(argv[++i], 10);
    else if (a === '--ci-gecmis') s.ciGecmis = argv[++i];
    else if (a === '--harita') s.harita = argv[++i];
    else if (a === '--depo') s.depo = argv[++i];
    else if (a === '--taban') s.taban = argv[++i];
    else throw new Error(`bilinmeyen argüman: ${a}`);
  }
  return s;
}

function depoAdi() {
  const url = childProcess.execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: KOK, encoding: 'utf8', windowsHide: true }).trim();
  const eslesme = /github\.com[:/]([^/]+\/[^/.]+)(?:\.git)?$/.exec(url);
  if (!eslesme) throw new Error(`origin adresi GitHub deposu değil: ${url.replace(/\/\/[^@]*@/, '//')}`);
  return eslesme[1];
}

function adaylariListele(s) {
  if (!s.ciGecmis) throw new Error('--ci-gecmis <ci-gecmis.json> verilmedi (ALT-38 ci geçmişi; depoda tutulmaz)');
  const veri = JSON.parse(fs.readFileSync(s.ciGecmis, 'utf8'));
  const sinir = new Date(Date.now() - s.gun * 86400000).toISOString();
  let sayi = 0;
  for (const k of veri.kosular) {
    if (k.olay !== 'pull_request' || k.sonuc !== 'failure' || k.olusturma < sinir) continue;
    const kirilan = [...new Set((k.testDosyalari || []).map((t) => String(t.dosya || '').split('\\').join('/')).filter(Boolean))].sort();
    if (kirilan.length === 0) continue;
    satirYaz({ kosuId: k.kosuId, dal: k.dal, sha: k.sha, tarih: k.olusturma, kirilan });
    sayi += 1;
  }
  process.stderr.write(`[geriye] ${sayi} aday kırmızı koşu (son ${s.gun} gün)\n`);
}

/** `gh api compare` ile bir dal ucunun taban ile farkı: { degisen: string[], silinen: Set } ya da fırlatır. */
function degisenleriAl(depo, taban, sha) {
  const ham = childProcess.execFileSync('gh', ['api', `repos/${depo}/compare/${taban}...${sha}`], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  const cevap = JSON.parse(ham);
  const dosyalar = cevap.files || [];
  const degisen = new Set();
  const silinen = new Set();
  for (const f of dosyalar) {
    degisen.add(f.filename);
    if (f.status === 'removed') silinen.add(f.filename);
    if (f.previous_filename) {
      degisen.add(f.previous_filename);
      silinen.add(f.previous_filename);
    }
  }
  return { degisen: [...degisen].sort(), silinen, kesik: dosyalar.length >= DOSYA_SINIRI_COMPARE };
}

async function koslariDegerlendir(s) {
  const depo = s.depo || depoAdi();
  const harita = JSON.parse(fs.readFileSync(path.join(KOK, s.harita), 'utf8'));
  process.env.VENTHUB_DUNYA_DURUMU = 'dislan';
  const oturum = await sec.vitestOturumuAc(KOK);
  const evren = new Set(oturum.testler);
  const tazelik = sec.tazelikHesapla(KOK, oturum.testler);
  try {
    for (const satir of fs.readFileSync(s.kos, 'utf8').split('\n')) {
      if (satir.trim() === '') continue;
      const aday = JSON.parse(satir);
      const cikti = { kosuId: aday.kosuId, dal: aday.dal, sha: aday.sha, degisen: 0, durum: 'OLCULEMEDI', tam: false, secilen: 0, kirilan: aday.kirilan, kacirilan: [], kapsamDisi: [], neden: [] };
      try {
        const fark = degisenleriAl(depo, s.taban, aday.sha);
        cikti.degisen = fark.degisen.length;
        if (fark.degisen.length === 0) {
          cikti.neden = ['compare boş döndü: dal ucu tabanda (merge-base farkı yok)'];
          satirYaz(cikti);
          continue;
        }
        const olculebilir = aday.kirilan.filter((t) => evren.has(t));
        cikti.kapsamDisi = aday.kirilan.filter((t) => !evren.has(t));
        const dosyaVarMi = (y) => !fark.silinen.has(y);
        const adaylar = sec.ilgiliAdaylari(fark.degisen, dosyaVarMi);
        const ilgiliSonuc = adaylar.length > 0 ? await oturum.ilgili(adaylar) : [];
        const sonuc = sec.sec({ degisenDosyalar: fark.degisen, testDosyalari: oturum.testler, harita, ilgili: () => ilgiliSonuc, tazelik, dosyaVarMi });
        cikti.tam = sonuc.tam || fark.kesik;
        cikti.secilen = sonuc.secilen.length;
        cikti.neden = sonuc.neden.slice(0, 3);
        const secilenKume = new Set(sonuc.secilen);
        cikti.kacirilan = cikti.tam ? [] : olculebilir.filter((t) => !secilenKume.has(t));
        cikti.durum = olculebilir.length === 0 ? 'OLCULEMEDI' : cikti.kacirilan.length > 0 ? 'KACIRILDI' : cikti.tam ? 'TAM' : 'SECILDI';
        if (olculebilir.length === 0) cikti.neden.push('kırılan testlerin hiçbiri bugünkü PR evreninde yok (silinmiş ya da dünya durumu)');
      } catch (e) {
        cikti.neden = [`hata: ${String(e && e.message ? e.message : e).slice(0, 200)}`];
      }
      satirYaz(cikti);
    }
  } finally {
    await oturum.kapat();
  }
}

function ozetle(dosyalar) {
  const ozet = { kosu: 0, secildi: 0, tam: 0, kacirildi: 0, olculemedi: 0, kacirilanlar: [] };
  for (const d of dosyalar) {
    for (const satir of fs.readFileSync(d, 'utf8').split('\n')) {
      if (satir.trim() === '' || !satir.startsWith('{')) continue;
      const k = JSON.parse(satir);
      ozet.kosu += 1;
      if (k.durum === 'SECILDI') ozet.secildi += 1;
      else if (k.durum === 'TAM') ozet.tam += 1;
      else if (k.durum === 'KACIRILDI') {
        ozet.kacirildi += 1;
        ozet.kacirilanlar.push({ kosuId: k.kosuId, dal: k.dal, kacirilan: k.kacirilan });
      } else ozet.olculemedi += 1;
    }
  }
  satirYaz(ozet);
}

async function main() {
  const s = argumanlar(process.argv.slice(2));
  if (s.liste) adaylariListele(s);
  else if (s.kos) await koslariDegerlendir(s);
  else if (s.ozet.length > 0) ozetle(s.ozet);
  else throw new Error('kip seçilmedi: --liste | --kos <jsonl> | --ozet <jsonl...>');
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

module.exports = { adaylariListele, degisenleriAl, ozetle };
