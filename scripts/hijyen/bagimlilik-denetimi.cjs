#!/usr/bin/env node
/**
 * BAĞIMLILIK DENETİMİ — karar 52 (Recep, 2026-09-19). CI'da koşar.
 *
 * Cetvel: `docs/standards/bagimlilik-guvenlik-yukseltme-standard.md` §11.
 * Kabul listesi: `docs/standards/bagimlilik-kararlari.md` §7.
 *
 * ⭐NİÇİN VAR: 2026-09-19'da ÖLÇÜLDÜ — `.github/workflows/` altında hiçbir `pnpm audit`
 * adımı YOKTU; tarama yalnız yerelde, elle koşuluyordu. İki haftalık tarama kuralı (karar 13)
 * yazılıydı ama tetiği bizim hafızamızdı, ve hafıza unutur (Recep: "otonom bir yapıya
 * gelemeyen herşey bir gün unutulacak").
 *
 * NE ÖLÇER — iki yönlü eşitlik, tek yönlü değil:
 *   (1) Üretim ağacındaki her YÜKSEK / KRİTİK kayıt §7'de KABUL EDİLMİŞ olmalı.
 *       Kabul listesinde olmayan yeni kayıt → KIRMIZI.
 *   (2) §7'deki her kabul, bugün GERÇEKTEN var olan bir kayda karşılık gelmeli.
 *       Kapanmış bir kaydın kabulü listede kalırsa → KIRMIZI (bayat bastırma).
 *   İkinci yön olmadan liste yalnız büyür: kapanan kayıtlar silinmez, bir gün aynı kimlikle
 *   geri dönen bir açık "zaten kabul edilmiş" görünür.
 *
 * ⭐CETVEL §1 İLE ÇELİŞMEZ: §1 "otomatik kapı bilinçli olarak yok" diyor, çünkü her gün
 * kırmızı veren kapı üçüncü günde bakılmayan kapıdır. Bu kapı her gün KOŞMAZ: yalnız
 * kilit dosyası değiştiğinde ve haftada bir koşar (iş akışı `bagimlilik-denetimi.yml`).
 * Haftalık koşudaki kırmızı, tam da görünmesi gereken şeydir: kilitli sürüme SONRADAN
 * yayımlanmış bir kayıt.
 *
 * ÇIKIŞ: 0 = temiz · 1 = kabul edilmemiş yeni kayıt ya da bayat kabul · 2 = ÖLÇÜLEMEDİ.
 * ⛔ÖLÇÜLEMEYEN GEÇMİŞ SAYILMAZ (dependency-integrity-standard §5, fail-closed): ağ hatası ya
 * da bozuk JSON "temiz" diye okunmaz.
 *
 * KULLANIM:
 *   node scripts/hijyen/bagimlilik-denetimi.cjs                 # pnpm audit'i kendisi koşar
 *   node scripts/hijyen/bagimlilik-denetimi.cjs --json <dosya>  # hazır çıktıyı okur (test/CI)
 *   ... --kayit <md>                                            # kabul listesi dosyası
 */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const KOK = path.resolve(__dirname, '..', '..')
const VARSAYILAN_KAYIT = path.join(KOK, 'docs', 'standards', 'bagimlilik-kararlari.md')
const AGIR = new Set(['high', 'critical'])

function arg(ad) {
  const i = process.argv.indexOf(ad)
  return i >= 0 ? process.argv[i + 1] : undefined
}

/** §7 tablosundan kabul edilmiş GHSA kimliklerini okur. */
function kabulListesi(metin) {
  const bolum = metin.split(/^##\s*7\s*·/m)[1]
  if (!bolum) return null
  const govde = bolum.split(/^##\s/m)[0]
  const kimlikler = []
  for (const ham of govde.split('\n')) {
    const s = ham.trim()
    if (!s.startsWith('|')) continue
    const m = s.match(/\|\s*`?(GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4})`?\s*\|/)
    if (m) kimlikler.push(m[1])
  }
  return kimlikler
}

/** pnpm audit JSON'undan yüksek/kritik kayıtların kimliklerini çıkarır. */
function agirKayitlar(audit) {
  if (!audit || typeof audit !== 'object' || !audit.advisories) return null
  const out = new Map()
  for (const v of Object.values(audit.advisories)) {
    if (!AGIR.has(v.severity)) continue
    const id = v.github_advisory_id
    if (!id) continue
    out.set(id, `${v.severity} · ${v.module_name} ${v.vulnerable_versions} · ${(v.title || '').slice(0, 70)}`)
  }
  return out
}

function auditKostur() {
  // `pnpm audit` kayıt bulunca 1 ile çıkar — bu bir hata değil, çıktı stdout'tadır.
  try {
    return execFileSync('pnpm', ['audit', '--prod', '--json'], {
      cwd: KOK,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 64 * 1024 * 1024,
      shell: process.platform === 'win32',
    })
  } catch (e) {
    if (e && typeof e.stdout === 'string' && e.stdout.trim().startsWith('{')) return e.stdout
    throw e
  }
}

function denetle({ auditMetni, kayitMetni }) {
  let audit
  try {
    audit = JSON.parse(auditMetni)
  } catch {
    return { kod: 2, satirlar: ['ÖLÇÜLEMEDİ: audit çıktısı JSON değil — temiz SAYILMAZ.'] }
  }
  const agir = agirKayitlar(audit)
  if (!agir) {
    return { kod: 2, satirlar: ['ÖLÇÜLEMEDİ: audit çıktısında `advisories` yok — temiz SAYILMAZ.'] }
  }
  const kabul = kabulListesi(kayitMetni)
  if (!kabul) {
    return { kod: 2, satirlar: ['ÖLÇÜLEMEDİ: kayıt dosyasında §7 bölümü bulunamadı.'] }
  }
  const kabulKumesi = new Set(kabul)
  const yeni = [...agir.keys()].filter((id) => !kabulKumesi.has(id))
  const bayat = kabul.filter((id) => !agir.has(id))

  const satirlar = [
    `yüksek/kritik: ${agir.size} · kabul listesinde: ${kabul.length} · yeni: ${yeni.length} · bayat kabul: ${bayat.length}`,
  ]
  for (const id of yeni) satirlar.push(`  ⛔YENİ (kabul edilmemiş): ${id} — ${agir.get(id)}`)
  for (const id of bayat) {
    satirlar.push(`  ⛔BAYAT KABUL: ${id} artık audit çıktısında yok — §7'den SİL (kapanan kayıt listede kalmaz)`)
  }
  if (yeni.length || bayat.length) {
    satirlar.push(
      'Yapılacak: yeni kaydı ya KAPAT (yükselt/override, cetvel §3-§4) ya da §7\'ye gerekçesi ve',
      'KALDIRMA ŞARTIYLA yaz. Kabul, bilinçli ertelemedir; sessiz görmezden gelme değil.',
    )
    return { kod: 1, satirlar }
  }
  satirlar.push('TEMİZ: her yüksek/kritik kayıt kabul edilmiş, her kabul gerçek bir kayda karşılık geliyor.')
  return { kod: 0, satirlar }
}

function main() {
  const kayitYolu = arg('--kayit') || VARSAYILAN_KAYIT
  let kayitMetni
  try {
    kayitMetni = fs.readFileSync(kayitYolu, 'utf8')
  } catch {
    console.log(`[bagimlilik-denetimi] ÖLÇÜLEMEDİ: kayıt dosyası okunamadı: ${kayitYolu}`)
    process.exit(2)
  }
  let auditMetni
  const jsonYolu = arg('--json')
  try {
    auditMetni = jsonYolu ? fs.readFileSync(jsonYolu, 'utf8') : auditKostur()
  } catch (e) {
    console.log(`[bagimlilik-denetimi] ÖLÇÜLEMEDİ: audit koşturulamadı — ${String(e && e.message).split('\n')[0]}`)
    process.exit(2)
  }
  const { kod, satirlar } = denetle({ auditMetni, kayitMetni })
  for (const s of satirlar) console.log(`[bagimlilik-denetimi] ${s}`)
  process.exit(kod)
}

if (require.main === module) main()

module.exports = { denetle, kabulListesi, agirKayitlar }
