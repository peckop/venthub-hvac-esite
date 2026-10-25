#!/usr/bin/env node
/**
 * AILE YEDEKTEN GERI — `aile-blok-duzelt.mjs --yedek` dosyasindaki description'i AYNEN geri koyar (KTL-62).
 * NICIN: duzeltici K4 yuzunden uretim artigini ([MANIFEST], ---, >) geri yazamaz; artikli metne donus yalniz
 * yedekten olur. Kurallar: `aile-yedekten-geri-kurallar.mjs` (saf, testli).
 *
 * VARSAYILAN KURU KOSUM: her aile icin karar (geri / zaten / red) yazilir, hicbir sey yazilmaz. Canliya yalniz
 * IKI ANAHTARLA dokunur: `--yaz` bayragi VE ortamda `CANLI_YAZIM_ONAYI=evet`. Herhangi bir aile RED ise hicbiri yazilmaz.
 * ANON ANAHTAR KULLANILMAZ (RLS yazmayi sessizce bosaltir). PATCH `updated_at=eq.<okunan>` kosulludur; 0 satir
 * donerse KIRMIZI. Yazdiktan sonra canlidan geri okunur ve yedekle kanonik karsilastirilir.
 *
 * KULLANIM: node scripts/icerik-hatti/aile-yedekten-geri.mjs --yedek <yedek.json> [--yaz]
 * CIKIS: 0 tamam (kuru kosum dahil) · 1 karar/yazim hatasi · 2 onkosul.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { kanonikEsit } from './aile-blok-duzelt-kurallar.mjs'
import { OKUMA_SECIMI, patchYolu } from './aile-metni-kurallar.mjs'
import { geriKarari, yedekDogrula } from './aile-yedekten-geri-kurallar.mjs'

const argv = process.argv.slice(2)
const deger = (/** @type {string} */ ad) => {
  const i = argv.indexOf(ad)
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null
}
const YEDEK_YOL = deger('--yedek')
const YAZ = argv.includes('--yaz')

const bitir = (/** @type {number} */ kod, /** @type {string[]} */ satirlar) => {
  for (const s of satirlar) console.error(s)
  process.exitCode = kod
}

async function main() {
  if (!YEDEK_YOL) return bitir(2, ['ONKOSUL: --yedek <yedek.json> zorunlu (aile-blok-duzelt.mjs --yedek ciktisi).'])
  let ham
  try {
    ham = JSON.parse(readFileSync(YEDEK_YOL, 'utf8'))
  } catch (e) {
    return bitir(2, [`ONKOSUL: yedek okunamadi/gecerli JSON degil: ${YEDEK_YOL} (${/** @type {Error} */ (e).message})`])
  }
  const { hatalar, satirlar } = yedekDogrula(ham)
  if (hatalar.length) return bitir(2, ['ONKOSUL: yedek gecersiz:', ...hatalar.map((h) => '   ' + h)])

  const ENV_YOL = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
  let ortam
  try {
    ortam = Object.fromEntries(
      readFileSync(ENV_YOL, 'utf8').split(/\r?\n/).filter((s) => s && !s.startsWith('#') && s.includes('=')).map((s) => {
        const i = s.indexOf('=')
        return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
      }),
    )
  } catch {
    return bitir(2, [`ONKOSUL: ortam dosyasi okunamadi: ${ENV_YOL}`])
  }
  const URL_ = String(ortam.SUPABASE_URL || ortam.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '')
  const ANAHTAR = String(ortam.SUPABASE_SERVICE_ROLE_KEY || '')
  if (!URL_ || !ANAHTAR) return bitir(2, [`ONKOSUL: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY yok: ${ENV_YOL}`])
  const basliklar = { apikey: ANAHTAR, Authorization: `Bearer ${ANAHTAR}`, 'Content-Type': 'application/json' }

  const ham2 = async (/** @type {string} */ yol, /** @type {RequestInit} */ secenek) => {
    try {
      const r = await fetch(`${URL_}/rest/v1/${yol}`, { ...secenek, signal: AbortSignal.timeout(30000) })
      return { ok: r.ok, durum: r.status, metin: await r.text() }
    } catch (e) {
      return { ok: false, durum: 0, metin: String(/** @type {Error} */ (e).message) }
    }
  }
  const oku = async (/** @type {string[]} */ sluglar) => {
    const h = await ham2(`product_families?select=${OKUMA_SECIMI}&slug=in.(${sluglar.map(encodeURIComponent).join(',')})`, { headers: basliklar })
    if (!h.ok) throw new Error(`aile sorgusu basarisiz: ${h.durum} ${h.metin.slice(0, 200)}`)
    return /** @type {import('./aile-yedekten-geri-kurallar.mjs').AileSatiri[]} */ (JSON.parse(h.metin))
  }

  let canli
  try {
    canli = new Map((await oku(satirlar.map((s) => s.slug))).map((a) => [a.slug, a]))
  } catch (e) {
    return bitir(1, [`⛔ ${/** @type {Error} */ (e).message}`, '   Hicbir aile yazilmadi.'])
  }
  const kararlar = satirlar.map((y) => geriKarari(y, canli.get(y.slug)))
  for (const k of kararlar) console.log(`${k.durum.toUpperCase().padEnd(5)} ${k.slug} — ${k.neden}`)
  if (kararlar.some((k) => k.durum === 'red')) return bitir(1, ['⛔ RED var: hicbir aile yazilmadi (KIRMIZI).'])
  const yazilacak = satirlar.filter((y) => kararlar.find((k) => k.slug === y.slug)?.durum === 'geri')
  if (!yazilacak.length) return void console.log('Geri konacak degisiklik yok (hepsi zaten yedekle ayni).')

  if (!YAZ || process.env.CANLI_YAZIM_ONAYI !== 'evet') {
    return void console.log('KURU KOSUM — hicbir sey yazilmadi. Yazim icin iki anahtar: --yaz VE CANLI_YAZIM_ONAYI=evet')
  }

  const hatalar2 = []
  for (const y of yazilacak) {
    const a = /** @type {import('./aile-yedekten-geri-kurallar.mjs').AileSatiri} */ (canli.get(y.slug))
    const h = await ham2(patchYolu(a), {
      method: 'PATCH',
      headers: { ...basliklar, Prefer: 'return=representation' },
      body: JSON.stringify({ description: y.description, is_description_manual: y.is_description_manual }),
    })
    let satir = -1
    try { satir = JSON.parse(h.metin).length } catch { /* hata asagida */ }
    if (!h.ok || satir !== 1) hatalar2.push(`${y.slug}: PATCH ${h.durum}, donen satir ${satir} (yaris/yetki)`)
  }
  try {
    const son = new Map((await oku(yazilacak.map((s) => s.slug))).map((a) => [a.slug, a]))
    const uymayan = yazilacak.filter((y) => {
      const c = son.get(y.slug)
      return !c || !kanonikEsit(c.description, y.description) || c.is_description_manual !== y.is_description_manual
    }).map((y) => y.slug)
    console.log(`DOGRULAMA (canlidan okundu): yedekle kanonik esit ${yazilacak.length - uymayan.length}/${yazilacak.length}`)
    if (uymayan.length) hatalar2.push(`canlida yedekle uymayan: ${uymayan.join(', ')}`)
  } catch (e) {
    hatalar2.push(`geri okuma basarisiz: ${/** @type {Error} */ (e).message}`)
  }
  if (hatalar2.length) return bitir(1, [`⛔ HATA ${hatalar2.length}:`, ...hatalar2.map((h) => '   ' + h)])
}

main().catch((e) => bitir(1, [`⛔ beklenmeyen hata: ${e?.message ?? e}`]))
