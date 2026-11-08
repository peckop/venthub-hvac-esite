#!/usr/bin/env node
/**
 * REHBER DOĞRULAMA TURU — komut satırı (rehber-yazisi-standard.md R5.1.2, OPS-255). Mantık: tur-lib.mjs.
 *
 * Kullanım (hepsi ağsız; çıkış 0 temiz/başarılı · 1 kırmızı ya da hata):
 *   node scripts/rehber/tur/tur.mjs iskelet <taslak.md> <iddialar.json>        # tabloyu günceller: yeni satırlar alıntısız eklenir, kapsam açıkları yazılır
 *   node scripts/rehber/tur/tur.mjs yama    <girdi.md> <yama.json> <cikti.md>   # [{eski,yeni,adet?}] uygular, sha basar
 *   node scripts/rehber/tur/tur.mjs fark    <onceki.md> <sonraki.md>           # değişen cümleler + önceki/sonraki sha (kart notu için)
 *   node scripts/rehber/tur/tur.mjs kapi    <taslak.md> [iddialar.json]        # denetle() + aynı-sayı + kapsam sözcüğü açıkları
 *   node scripts/rehber/tur/tur.mjs tuzak   <taslak.md> <tuzak.json> <klasor> <ad>   # <klasor>/<ad>-temiz.md ve <ad>-tuzakli.md
 *   node scripts/rehber/tur/tur.mjs kayit   <tur.json> <cikti.md>              # turN-bulgular.md üretir
 *
 * ⚠Bu takım YARGI vermez: doğrulayıcı/çürütücü okuması ve engelleyici hükmü elle kalır (tur-lib.mjs başlığı).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { denetle } from '../rehber-denetim.mjs'
import { degisenCumleler, iddiaIskeleti, sayiTutarliligi, sha12, tuzakliKopya, turKaydiMetni, yamaUygula } from './tur-lib.mjs'

const oku = (yol) => readFileSync(yol, 'utf8')
const okuJson = (yol) => JSON.parse(oku(yol))
const yaz = (yol, metin) => writeFileSync(yol, metin, 'utf8')
const log = (...a) => console.log(...a)

export function calistir(argv) {
  const [komut, ...a] = argv
  switch (komut) {
    case 'iskelet': {
      const [taslak, tabloYolu] = a
      if (!taslak || !tabloYolu) throw new Error('kullanım: iskelet <taslak.md> <iddialar.json>')
      const mevcutDosya = existsSync(tabloYolu) ? okuJson(tabloYolu) : { surum: '', iddialar: [] }
      const r = iddiaIskeleti(oku(taslak), mevcutDosya.iddialar || [])
      yaz(tabloYolu, `${JSON.stringify({ ...mevcutDosya, iddialar: r.iddialar }, null, 1)}\n`)
      log(`iskelet: ${r.iddialar.length} satır (${r.eslenen} korundu, ${r.yeni.length} yeni alıntısız)`)
      for (const k of r.kapsamAciklari) log(` ~ KAPSAM-SOZCUGU "${k.sozcuk}": ${k.cumle.slice(0, 160)}`)
      return r.kapsamAciklari.length === 0 ? 0 : 1
    }
    case 'yama': {
      const [girdi, yamaYolu, cikti] = a
      if (!girdi || !yamaYolu || !cikti) throw new Error('kullanım: yama <girdi.md> <yama.json> <cikti.md>')
      const once = oku(girdi)
      const sonra = yamaUygula(once, okuJson(yamaYolu))
      yaz(cikti, sonra)
      log(`yama: ${sha12(once)} → ${sha12(sonra)} (${cikti})`)
      return 0
    }
    case 'fark': {
      const [onceki, sonraki] = a
      if (!onceki || !sonraki) throw new Error('kullanım: fark <onceki.md> <sonraki.md>')
      const r = degisenCumleler(oku(onceki), oku(sonraki))
      log(`sha: ${r.oncekiSha} → ${r.sonrakiSha}`)
      log(`silinen (${r.silinen.length}):`)
      for (const s of r.silinen) log(` - ${s}`)
      log(`eklenen (${r.eklenen.length}):`)
      for (const s of r.eklenen) log(` + ${s}`)
      return 0
    }
    case 'kapi': {
      const [taslak, tabloYolu] = a
      if (!taslak) throw new Error('kullanım: kapi <taslak.md> [iddialar.json]')
      const md = oku(taslak)
      const dosya = tabloYolu && existsSync(tabloYolu) ? okuJson(tabloYolu) : { iddialar: [] }
      const r = denetle(md, { iddialar: dosya.iddialar || [] })
      const sayi = sayiTutarliligi(md)
      const kapsam = iddiaIskeleti(md, dosya.iddialar || []).kapsamAciklari
      log(`sha ${sha12(md)} · ozet ${JSON.stringify(r.ozet)}`)
      log(`kirmizi ${r.kirmizi.length}`)
      for (const k of r.kirmizi) log(` - ${k.sinif} | ${String(k.ayrinti).slice(0, 220)}`)
      log(`uyari ${r.uyari.length + sayi.length + kapsam.length}`)
      for (const u of r.uyari) log(` ~ ${u.sinif} | ${String(u.ayrinti).slice(0, 200)}`)
      for (const u of sayi) log(` ~ ${u.sinif} | ${u.ayrinti}`)
      for (const k of kapsam) log(` ~ KAPSAM-SOZCUGU "${k.sozcuk}" tabloda alıntısız | ${k.cumle.slice(0, 160)}`)
      return r.kirmizi.length === 0 ? 0 : 1
    }
    case 'tuzak': {
      const [taslak, listeYolu, klasor, ad] = a
      if (!taslak || !listeYolu || !klasor || !ad) throw new Error('kullanım: tuzak <taslak.md> <tuzak.json> <klasor> <ad>')
      const r = tuzakliKopya(oku(taslak), okuJson(listeYolu))
      mkdirSync(klasor, { recursive: true })
      yaz(join(klasor, `${ad}-temiz.md`), r.temiz)
      yaz(join(klasor, `${ad}-tuzakli.md`), r.tuzakli)
      log(`tuzak: ${r.tuzakSayisi} tuzak · temiz ${r.temizSha} · tuzaklı ${r.tuzakliSha}`)
      return 0
    }
    case 'kayit': {
      const [turYolu, cikti] = a
      if (!turYolu || !cikti) throw new Error('kullanım: kayit <tur.json> <cikti.md>')
      yaz(cikti, turKaydiMetni(okuJson(turYolu)))
      log(`kayit: ${cikti}`)
      return 0
    }
    default:
      throw new Error('komut: iskelet | yama | fark | kapi | tuzak | kayit (başlıktaki kullanıma bak)')
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = calistir(process.argv.slice(2))
  } catch (e) {
    console.error(`tur.mjs: ${e.message}`)
    process.exitCode = 1
  }
}
