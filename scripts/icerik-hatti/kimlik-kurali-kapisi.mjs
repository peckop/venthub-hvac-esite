#!/usr/bin/env node
/**
 * KİMLİK KURALI KAPISI — INV-KIMLIK-TEK-KURAL-1 (REC-275)
 *
 * NE ÖLÇER: `kimlik-kurali.mjs` sözleşmesini. Kural iki yerde kullanılıyor (`kademe2-load/load.mjs`
 * ve `icerik-hatti/uydurma-kimlik-tek-kural.mjs`); sözleşme kayarsa "aynı ürün, iki kimlik" doğar.
 *
 * NİÇİN AYRI BETİK, `src/__tests__/conformance/` DEĞİL: o dizin ALTYAPI şeridinde. Kapı bu şeritte
 * yaşıyor ve `node` ile tek başına koşuyor; CI'ya bağlanması ALTYAPI'dan istenecek.
 *
 * DÖRT KOL — her biri "yanlış davranışı GERÇEKTEN yakalıyor mu" diye ters yönden de ölçülür:
 *   1. KODSUZ SATIR DÜŞMEZ, kimliği ADDAN türer, `model_code` null, `confidence` not-ok
 *   2. UYDURMA ÜRETİLMEZ: çıktıdaki her karakter girdiden gelmeli (ardışık sayı EKLENMEZ)
 *   3. KOD VARSA KODDAN türer — mevcut 434 ürünün davranışı değişmemeli (regresyon)
 *   4. ÇAKIŞMA GÖRÜNÜR: aynı ad + aynı önek aynı kimliği verir; çağıran bunu görüp ATLAMALI
 *
 * Çıkış 0 = yeşil, 1 = kırmızı. Fail-closed: modül yüklenemezse kırmızı.
 */
import { kimlikTuret, skuGovdesi, slugifyTr } from './kimlik-kurali.mjs'

let kirmizi = 0
const yaz = (ok, ad, ek = '') => {
  console.log(`  ${ok ? '✓' : '⛔'} ${ad}${ek ? '  — ' + ek : ''}`)
  if (!ok) kirmizi++
}

console.log('INV-KIMLIK-TEK-KURAL-1\n')

// ── KOL 1: kodsuz satır düşmez, kimlik addan türer
console.log('KOL 1 — kodsuz satir DUSMEZ, kimlik ADDAN turer')
{
  const k = kimlikTuret({ onek: 'VRT', ad: 'Vortice CA IL 4020 ES RECT', marka: 'Vortice', model_code: null })
  yaz(k !== null, 'kodsuz satir kimlik URETIR (null donmez)')
  yaz(k?.sku === 'VRT-CA-IL-4020-ES-RECT', 'sku addan turedi', k?.sku)
  yaz(k?.slug === 'vortice-ca-il-4020-es-rect', 'slug addan turedi, sayi eklenmedi', k?.slug)
  yaz(k?.model_code === null, 'model_code null kaldi — uydurulmadi')
  yaz(k?.confidence === 'not-ok', 'confidence not-ok — kacis valfi isaretlendi')
  // TERS YON: ad da yoksa kimlik URETILMEMELI (sessizce bos sku dogmasin)
  yaz(kimlikTuret({ onek: 'VRT', ad: '', marka: 'Vortice', model_code: null }) === null,
    'TERS: ad da yoksa null doner (bos kimlik uretmez)')
  yaz(kimlikTuret({ onek: '', ad: 'X', marka: 'Y', model_code: null }) === null,
    'TERS: onek yoksa null doner')
}

// ── KOL 2: uydurma üretilmez
console.log('\nKOL 2 — UYDURMA URETILMEZ (cikti girdiden gelir)')
{
  const ad = 'Vortice CA IL 4020 ES RECT'
  const k = kimlikTuret({ onek: 'VRT', ad, marka: 'Vortice', model_code: null })
  // sku govdesi, model adinin donusturulmus halinden BASKA bir sey icermemeli
  const beklenen = `VRT-${skuGovdesi('CA IL 4020 ES RECT')}`
  yaz(k.sku === beklenen, 'sku tam olarak ad donusumu — fazladan karakter yok', k.sku)
  // adin tasimadigi bir rakam ciktida OLMAMALI (16076 gibi)
  const adRakam = new Set((ad.match(/\d/g) || []))
  const ciktiRakam = new Set(((k.sku + k.slug).match(/\d/g) || []))
  const fazla = [...ciktiRakam].filter((d) => !adRakam.has(d))
  yaz(fazla.length === 0, 'ciktida adda BULUNMAYAN rakam yok (ardisik kod uydurulmadi)', fazla.join(','))
  // TERS YON: sabotaj — kurala sayi ekleyen bir varyant bu olcutu GECEMEMELI
  const sabotajSku = `${k.sku}-16076`
  const sabotajRakam = new Set((sabotajSku.match(/\d/g) || []))
  const sabotajFazla = [...sabotajRakam].filter((d) => !adRakam.has(d))
  yaz(sabotajFazla.length > 0, 'TERS: sayi eklenmis sahte kimlik olcute TAKILIYOR (olcut kor degil)', sabotajFazla.join(','))
}

// ── KOL 3: kod varsa koddan türer (regresyon — 434 ürünün davranışı)
console.log('\nKOL 3 — KOD VARSA KODDAN turer (mevcut davranis korunur)')
{
  const k = kimlikTuret({ onek: 'VRT', ad: 'Vortice Punto Evo Flexo MEX 100/4"', marka: 'Vortice', model_code: '11313' })
  yaz(k.sku === 'VRT-11313', 'salt sayisal kod: sku koddan', k.sku)
  yaz(k.model_code === '11313', 'model_code korunur')
  yaz(k.confidence === 'ok', 'confidence ok')
  yaz(k.slug.endsWith('-11313'), 'slug kod ekli (mevcut bicim)', k.slug)
  const b = kimlikTuret({ onek: 'AVE', ad: 'ENKELFAN 155 EEC', marka: 'Avensair', model_code: 'ENKEC 155' })
  yaz(b.sku === 'AVE-ENKEC-155', 'bosluklu kod: TIRELI kanonik bicim (442 uzerinde 434 uyumlu)', b.sku)
  const c = kimlikTuret({ onek: 'AVE', ad: 'NIMUS 311 T2 1,1kW', marka: 'Avensair', model_code: 'NS311280' })
  yaz(c.sku === 'AVE-NS311280', 'alfanumerik kod bozulmadan gecer', c.sku)
}

// ── KOL 4: çakışma görünür olmalı
console.log('\nKOL 4 — CAKISMA GORUNUR (cagiran atlayabilsin)')
{
  const a = kimlikTuret({ onek: 'VRT', ad: 'Vortice Model X', marka: 'Vortice', model_code: null })
  const b = kimlikTuret({ onek: 'VRT', ad: 'Vortice Model X', marka: 'Vortice', model_code: null })
  yaz(a.sku === b.sku && a.slug === b.slug,
    'ayni ad + ayni onek -> AYNI kimlik (deterministik; cakisma gizlenmiyor)', a.sku)
  const c = kimlikTuret({ onek: 'AVE', ad: 'Vortice Model X', marka: 'Vortice', model_code: null })
  yaz(c.sku !== a.sku, 'farkli onek -> farkli kimlik', c.sku)
}

// ── slugifyTr sözleşmesi (yükleyiciden taşındı; davranış ayrışmasın)
console.log('\nEK — slugifyTr sozlesmesi (yukleyiciden tasindi)')
yaz(slugifyTr('Şişli Çığır Ünitesi') === 'sisli-cigir-unitesi', 'TR karakterler donusur', slugifyTr('Şişli Çığır Ünitesi'))
yaz(slugifyTr('  A--B  ') === 'a-b', 'bas/son tire temizlenir, coklu tire teklenir', slugifyTr('  A--B  '))

console.log(`\n${kirmizi === 0 ? 'YESIL — dort kol da gecti.' : `KIRMIZI — ${kirmizi} olcut dustu.`}`)
process.exit(kirmizi === 0 ? 0 : 1)
