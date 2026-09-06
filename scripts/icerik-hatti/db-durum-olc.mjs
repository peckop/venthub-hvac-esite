#!/usr/bin/env node
/**
 * DB DURUM OLCUMU — SALT OKUMA.
 *
 * Nicin ayri betik: toplu sunumdaki "DB'de var mi / kac urun / uzerine yazilacak mi"
 * bilgisi ELLE KOPYALANIRSA uydurmaya acik olur. Olculen sayi karara gidiyorsa
 * BETIKTEN gelmeli. Bu betik yalnizca SELECT yapar; hicbir yazma yolu yoktur.
 *
 * ⚠ ANON ANAHTAR KULLANILMAZ: RLS okumayi sessizce bosaltir ve "0 satir" basari gibi
 * gorunur (Tier C temizliginde olculdu). Servis anahtari zorunlu.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

// ⚠ KIMLIK TASIYAN MUTLAK YOL YAZILMAZ (INV-MUTLAK-YOL-1). Ilk surumde kullanici adini
// iceren tam yol gomuluydu; kapi hakli olarak dusururdu. Ev dizininden turetiliyor.
const ENV_YOL = process.env.VENTHUB_ENV || join(homedir(), 'venthub-hvac', '.env')
const ortam = Object.fromEntries(
  readFileSync(ENV_YOL, 'utf8')
    .split(/\r?\n/)
    .filter((s) => s && !s.startsWith('#') && s.includes('='))
    .map((s) => {
      const i = s.indexOf('=')
      return [s.slice(0, i).trim(), s.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)

const URL_ = ortam.SUPABASE_URL || ortam.NEXT_PUBLIC_SUPABASE_URL
const ANAHTAR = ortam.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !ANAHTAR) {
  // Anahtarin KENDISI asla basilmaz — yalnizca varligi bildirilir.
  console.error('⛔ SUPABASE_URL veya SUPABASE_SERVICE_ROLE_KEY yok:', ENV_YOL)
  process.exit(2)
}

const sluglar = process.argv.slice(2)
if (sluglar.length === 0) {
  console.error('kullanim: node db-durum-olc.mjs <slug> [slug...]   (cikti: stdout JSON)')
  process.exit(2)
}

const basliklar = { apikey: ANAHTAR, Authorization: `Bearer ${ANAHTAR}` }

const aileYanit = await fetch(
  `${URL_}/rest/v1/product_families?select=id,slug,description&slug=in.(${sluglar.join(',')})`,
  { headers: basliklar },
)
if (!aileYanit.ok) {
  console.error('⛔ aile sorgusu basarisiz:', aileYanit.status)
  process.exit(1)
}
const aileler = await aileYanit.json()

const cikti = {}
for (const s of sluglar) {
  const a = aileler.find((x) => x.slug === s)
  if (!a) {
    cikti[s] = { db_de_var: false }
    continue
  }
  const sayimYanit = await fetch(
    `${URL_}/rest/v1/products?select=id&family_id=eq.${a.id}`,
    { headers: { ...basliklar, Prefer: 'count=exact', Range: '0-0' } },
  )
  const aralik = sayimYanit.headers.get('content-range') || '/0'
  cikti[s] = {
    db_de_var: true,
    urun: Number(aralik.split('/')[1] || 0),
    // "dolu" = bugun vitrinde metin GORUNUYOR demektir; yazim bunun UZERINE yazar.
    aciklama_dolu: !!(a.description && JSON.stringify(a.description) !== '{}'),
  }
}
const hedef = process.env.VENTHUB_DB_DURUM_CIKTI
if (hedef) writeFileSync(hedef, JSON.stringify(cikti, null, 2) + '\n', 'utf8')
else process.stdout.write(JSON.stringify(cikti, null, 2) + '\n')
