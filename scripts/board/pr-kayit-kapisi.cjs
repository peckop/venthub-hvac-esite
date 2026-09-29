#!/usr/bin/env node
'use strict';
/**
 * PR kayıt kapısı (karar 187, REC-433): her birleşen PR bir Linear kaydına bağlanır.
 *
 * Kabul edilen üç yol:
 *   1. `Fixes REC-nn` (Closes/Resolves de Linear'ın sihirli kelimesi): PR kendi kaydını kapatır.
 *   2. `Kayıtsız: <sebep>`: bilerek kayıtsız; sebep zorunlu, istisna SAYILIR (etiket + özet).
 *   3. Bağımlılık botu PR'ı (dependabot/renovate): gövdeye satır yazamaz; SAYILIR.
 * `Part of REC-nn` tek başına YETMEZ (kapatmayan kelime kaydı görünmez bırakır). Linear kayıt
 * sınırı (250) doluyken tek geçici istisna: `Kayıtsız: Linear sınırı dolu, Part of REC-nn`
 * kabul edilir ve ayrı sayılır.
 *
 * Uyarı kolu: Fixes'in hedefi AÇIK alt kaydı olan bir çatıysa uyarı (kırmızı DEĞİL): PR birleşince
 * çatı kapanır ve altındaki açık işler yetim kalır. Ölçüm Linear API'siyle; anahtar yoksa ya da
 * çağrı başarısızsa "ölçülemedi" denir, kapı kırmızıya dönmez.
 *
 * Saf mantık burada; CI iş akışı (.github/workflows/pr-kayit-kapisi.yml) yalnız ortamdan girdiyi
 * okuyup bu modülü çağırır. LLM yok, yeni sır yok.
 */

const KAPATAN_KELIME = '(?:fixes|closes|resolves)';
const KAYIT_KALIBI = 'REC-\\d+';
const BOT_YAZARLAR = new Set(['dependabot[bot]', 'renovate[bot]']);
const MIN_SEBEP_UZUNLUGU = 8;

/** Kod çitleri ve HTML yorumlarındaki satırlar sayılmaz (şablon örneği kapıyı geçirmesin). */
function govdeyiTemizle(govde) {
  return String(govde || '')
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '');
}

/** `Fixes REC-12, REC-13` ve `Fixes REC-12\nFixes REC-13` biçimlerinin ikisini de toplar. */
function fixesKayitlari(temiz) {
  const kayitlar = new Set();
  const satirKalibi = new RegExp(
    `^[ \\t>*_-]*${KAPATAN_KELIME}[ \\t]*:?[ \\t]*((?:${KAYIT_KALIBI})(?:[ \\t]*(?:,|ve|and|&)?[ \\t]*${KAYIT_KALIBI})*)`,
    'gim',
  );
  let e;
  while ((e = satirKalibi.exec(temiz)) !== null) {
    for (const k of e[1].match(new RegExp(KAYIT_KALIBI, 'gi')) || []) kayitlar.add(k.toUpperCase());
  }
  return [...kayitlar];
}

function kayitsizSebebi(temiz) {
  const m = /^[ \t>*_-]*kay[ıi]ts[ıi]z[ \t]*:[ \t]*(\S[^\n]*)$/im.exec(temiz);
  return m ? m[1].trim() : null;
}

/**
 * @param {{govde?: string, yazar?: string}} girdi
 * @returns {{gecti: boolean, tur: string, kayitlar: string[], sebep: string}}
 *   tur: fixes | kayitsiz | kayitsiz-linear-siniri | bot | yok | kayitsiz-sebepsiz | sadece-part-of
 */
function degerlendir(girdi) {
  const yazar = String((girdi && girdi.yazar) || '').toLowerCase();
  if (BOT_YAZARLAR.has(yazar)) {
    return { gecti: true, tur: 'bot', kayitlar: [], sebep: `bağımlılık botu (${yazar}) gövdeye satır yazamaz; sayılır` };
  }
  const temiz = govdeyiTemizle(girdi && girdi.govde);
  const fixes = fixesKayitlari(temiz);
  if (fixes.length > 0) {
    return { gecti: true, tur: 'fixes', kayitlar: fixes, sebep: `Fixes ${fixes.join(', ')}` };
  }
  const sebep = kayitsizSebebi(temiz);
  if (sebep !== null) {
    if (sebep.length < MIN_SEBEP_UZUNLUGU) {
      return {
        gecti: false,
        tur: 'kayitsiz-sebepsiz',
        kayitlar: [],
        sebep: `"Kayıtsız:" satırındaki sebep en az ${MIN_SEBEP_UZUNLUGU} karakter olmalı (şu an: "${sebep}")`,
      };
    }
    const partOf = new RegExp(`part of[ \\t]+(${KAYIT_KALIBI})`, 'i').exec(sebep);
    if (/linear/i.test(sebep) && /s[ıi]n[ıi]r/i.test(sebep) && partOf) {
      return {
        gecti: true,
        tur: 'kayitsiz-linear-siniri',
        kayitlar: [partOf[1].toUpperCase()],
        sebep: `Linear sınırı dolu, ${partOf[1].toUpperCase()} altında (geçici istisna, sayılır)`,
      };
    }
    return { gecti: true, tur: 'kayitsiz', kayitlar: [], sebep: `Kayıtsız: ${sebep}` };
  }
  if (new RegExp(`part of[ \\t]+${KAYIT_KALIBI}`, 'i').test(temiz)) {
    return {
      gecti: false,
      tur: 'sadece-part-of',
      kayitlar: [],
      sebep: '"Part of REC-nn" tek başına yetmez: kayıt görünmez kalır. Kendi kaydını `Fixes REC-nn` ile kapat ya da `Kayıtsız: <sebep>` yaz',
    };
  }
  return {
    gecti: false,
    tur: 'yok',
    kayitlar: [],
    sebep: 'PR gövdesinde `Fixes REC-nn` ya da `Kayıtsız: <sebep>` satırı yok',
  };
}

const KAPALI_DURUM_TIPLERI = new Set(['completed', 'canceled']);

/**
 * Uyarı kolu. `getir(kayitId)` Linear'dan `{ identifier, children: [{identifier, stateType}] }` döner;
 * yoksa `null`. Hiçbir hata kapıyı kırmızıya çevirmez.
 * @returns {Promise<{durum: 'temiz'|'uyari'|'olculemedi', cati: string[], aciklama: string}>}
 */
async function catiKontrolu(kayitlar, getir) {
  if (!kayitlar || kayitlar.length === 0) return { durum: 'temiz', cati: [], aciklama: 'kontrol edilecek kayıt yok' };
  if (typeof getir !== 'function') {
    return { durum: 'olculemedi', cati: [], aciklama: 'Linear anahtarı bu ortamda yok; çatı kontrolü ölçülemedi' };
  }
  const cati = [];
  let olculemeyen = 0;
  for (const kayit of kayitlar) {
    try {
      const v = await getir(kayit);
      if (!v) { olculemeyen += 1; continue; }
      const acik = (v.children || []).filter((c) => !KAPALI_DURUM_TIPLERI.has(c.stateType));
      if (acik.length > 0) cati.push(`${kayit} (${acik.length} açık alt kayıt: ${acik.map((c) => c.identifier).join(', ')})`);
    } catch {
      olculemeyen += 1;
    }
  }
  if (cati.length > 0) {
    return {
      durum: 'uyari',
      cati,
      aciklama: `Fixes hedefi açık alt kaydı olan çatı: ${cati.join('; ')}. Birleşince çatı kapanır, altındaki iş yetim kalır. Kendi alt kaydını Fixes et ya da çatıyı ` + '`Part of`' + ' ile an',
    };
  }
  if (olculemeyen > 0) return { durum: 'olculemedi', cati: [], aciklama: `${olculemeyen} kayıt Linear'dan okunamadı; çatı kontrolü ölçülemedi` };
  return { durum: 'temiz', cati: [], aciklama: 'çatı uyarısı yok' };
}

/** Linear GraphQL ile tek kaydın alt kayıtlarını okur (anahtar ortamdan; CI'da yoksa çağrılmaz). */
function linearGetirici(anahtar, fetchFn) {
  const f = fetchFn || (typeof fetch === 'function' ? fetch : null);
  if (!anahtar || !f) return null;
  return async function getir(kayitId) {
    const r = await f('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: anahtar },
      body: JSON.stringify({
        query: 'query($id:String!){issue(id:$id){identifier children(first:100){nodes{identifier state{type}}}}}',
        variables: { id: kayitId },
      }),
    });
    if (!r.ok) throw new Error(`Linear HTTP ${r.status}`);
    const j = await r.json();
    const kayit = j && j.data && j.data.issue;
    if (!kayit) return null;
    return {
      identifier: kayit.identifier,
      children: ((kayit.children && kayit.children.nodes) || []).map((n) => ({ identifier: n.identifier, stateType: n.state && n.state.type })),
    };
  };
}

module.exports = { degerlendir, catiKontrolu, linearGetirici, govdeyiTemizle, fixesKayitlari, kayitsizSebebi, BOT_YAZARLAR };

// CLI: CI iş akışı ortamdan okur (govde enjeksiyona karşı env üzerinden gelir, komut satırına GÖMÜLMEZ).
if (require.main === module) {
  (async () => {
    const fs = require('node:fs');
    const yazar = process.env.PR_YAZAR || '';
    const govde = process.env.PR_GOVDE || '';
    const s = degerlendir({ govde, yazar });
    const cati = s.gecti && s.tur === 'fixes'
      ? await catiKontrolu(s.kayitlar, linearGetirici(process.env.LINEAR_API_KEY))
      : { durum: 'temiz', cati: [], aciklama: '' };

    const satirlar = [`KAYIT-KAPISI: ${s.gecti ? 'GEÇTİ' : 'KIRMIZI'} · tür=${s.tur} · ${s.sebep}`];
    if (cati.durum === 'uyari') satirlar.push(`ÇATI-UYARISI: ${cati.aciklama}`);
    else if (cati.durum === 'olculemedi' && s.tur === 'fixes') satirlar.push(`ÇATI-KONTROLÜ: ${cati.aciklama}`);
    for (const l of satirlar) console.log(l);

    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `### PR kayıt kapısı\n\n${satirlar.map((l) => `- ${l}`).join('\n')}\n`);
    }
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `tur=${s.tur}\ngecti=${s.gecti}\ncati=${cati.durum}\n`);
    }
    if (cati.durum === 'uyari') console.log(`::warning title=Çatı kaydı::${cati.aciklama}`);
    if (!s.gecti) {
      console.log(`::error title=PR kayıt kapısı::${s.sebep}`);
      process.exit(1);
    }
  })().catch((e) => {
    console.error(`PR kayıt kapısı beklenmedik hata: ${e && e.message}`);
    process.exit(1);
  });
}
