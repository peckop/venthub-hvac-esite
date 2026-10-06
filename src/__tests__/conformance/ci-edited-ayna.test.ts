import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-EDITED-1 · `edited` aynası `ci` iş akışına DOĞRU bağlı (ALT-38).
 *
 * NİÇİN VAR: `edited` (PR başlığı/gövdesi düzenleme) koşusu ağır adımları yalnız şu koşulda atlar: aynı head SHA için daha
 * önce TAM koşu yeşil bitti ve base ilerlemedi (mantık: scripts/ci/edited-ayna.cjs, karar tablosu:
 * scripts/ci/__tests__/edited-ayna.test.ts). Bu dosya BAĞLANTIYI korur; bağlantı bozulursa mantık ne kadar doğru olursa olsun:
 *   1. bir AĞIR adım koşulsuz kalırsa ayna koşusu gereksiz yere paketin tamamını koşar (kazanç sıfır, sessiz israf),
 *   2. bir HAFİF/KAPI adımı (özellikle PR kayıt kapısı) atlama koşulu alırsa düzenleme kayıt kapısını da atlar:
 *      kırmızı bir PR yalnız gövdesi düzenlenerek YEŞİLE çevrilir. En ağır bozulma budur,
 *   3. ayna adımı kayıt kapısından ÖNCE koşarsa ya da adı kodla ayrışırsa ayna koşusu tanınamaz (tam koşu sanılır),
 *   4. `edited` ayrı concurrency grubunda değilse koşan TAM koşuyu yine iptal eder,
 *   5. `actions: read` düşerse mantık önceki koşuları okuyamaz (güvenli düşer: hep tam koşu; kazanç sıfır).
 * Her yeni adım SINIFLANDIRILMAK zorundadır (ağır mı, hep koşan mı): sınıfsız adım KIRMIZI.
 *
 * Ölçüm yüzeyi: `node:fs` + satır taraması (YAML ayrıştırıcı yok). ci.yml'i DEĞİŞTİRMEZ.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const CI_YOLU = path.join(KOK, '.github/workflows/ci.yml')
const { AYNA_ADIM_ADI } = require_(path.join(KOK, 'scripts/ci/edited-ayna.cjs')) as { AYNA_ADIM_ADI: string }

const KOSUL = "if: steps.ayna.outputs.atla != 'true'"
/** Ayna koşusunda ATLANAN adımlar: hepsi bu koşulu taşır. */
const AGIR = [
  'Setup Deno',
  'Install dependencies',
  'Lint (blocking)',
  'Type check',
  'Deno check (edge functions — kapı-körlüğü guard)',
  'Edge mangle-guard (string-literal — deno check göremez)',
  'Edge CORS guard (ölü getCorsHeaders importu + eksik Allow-Origin)',
  'Secret guard (hardcoded DB connection string)',
  'Test',
  'Build (blocking)',
]
/** Ayna koşusunda DA koşan adımlar: HİÇBİRİ atlama koşulu taşımaz (özellikle PR kayıt kapısı). */
const HEP_KOSAN = [
  'Merge-ref çözümle (yalnız elle tetiklemede)',
  'Checkout',
  'Setup pnpm',
  'Setup Node',
  'PR kayıt kapısı (karar 187)',
  AYNA_ADIM_ADI,
]

interface Adim {
  ad: string
  satirlar: string[]
}

function adimlariAyir(metin: string): Adim[] {
  const satirlar = metin.split('\n')
  const adimlar: Adim[] = []
  let mevcut: Adim | null = null
  let adimlarda = false
  for (const s of satirlar) {
    if (/^ {4}steps:\s*$/.test(s)) {
      adimlarda = true
      continue
    }
    if (!adimlarda) continue
    const m = /^ {6}- name:\s*(.+?)\s*$/.exec(s)
    if (m) {
      mevcut = { ad: m[1], satirlar: [s] }
      adimlar.push(mevcut)
    } else if (mevcut) mevcut.satirlar.push(s)
  }
  return adimlar
}

const yorumsuz = (satirlar: string[]) => satirlar.filter((s) => !/^\s*#/.test(s))

function denetle(metin: string): string[] {
  const ihlal: string[] = []
  const satirlar = yorumsuz(metin.split('\n'))
  const adimlar = adimlariAyir(metin)
  const sira = (ad: string) => adimlar.findIndex((a) => a.ad === ad)

  // 1) sınıflandırma: her adım ağır ya da hep-koşan; ikisi birden olamaz
  for (const a of adimlar) {
    const agir = AGIR.includes(a.ad)
    const hep = HEP_KOSAN.includes(a.ad)
    if (!agir && !hep) ihlal.push(`adım "${a.ad}" SINIFSIZ: ayna koşusunda atlanır mı? INV-CI-EDITED-1 listesine (AGIR ya da HEP_KOSAN) ekle`)
  }
  for (const ad of [...AGIR, ...HEP_KOSAN]) if (sira(ad) < 0) ihlal.push(`adım "${ad}" ci.yml içinde yok (adı değişti mi? liste ve iş akışı birlikte güncellenir)`)

  // 2) koşullar
  for (const a of adimlar) {
    const blok = yorumsuz(a.satirlar).join('\n')
    const kosulVar = blok.includes(KOSUL)
    if (AGIR.includes(a.ad) && !kosulVar) ihlal.push(`AĞIR adım "${a.ad}" atlama koşulu taşımıyor: ayna koşusu paketin tamamını koşar`)
    if (HEP_KOSAN.includes(a.ad) && /steps\.ayna\.outputs/.test(blok)) {
      ihlal.push(`HEP KOŞAN adım "${a.ad}" atlama koşulu taşıyor: düzenleme bu kapıyı atlatır (kırmızı PR yalnız gövdesi düzenlenerek yeşile döner)`)
    }
  }

  // 3) ayna adımının kendisi
  const ayna = adimlar.find((a) => a.ad === AYNA_ADIM_ADI)
  if (ayna) {
    const blok = yorumsuz(ayna.satirlar).join('\n')
    if (!/^\s+id: ayna\s*$/m.test(blok)) ihlal.push('ayna adımının `id: ayna` satırı yok: sonraki adımların koşulu çıktıyı okuyamaz')
    if (!/^\s+if: github\.event_name == 'pull_request' && github\.event\.action == 'edited'\s*$/m.test(blok)) {
      ihlal.push("ayna adımı yalnız `github.event_name == 'pull_request' && github.event.action == 'edited'` iken koşmalı")
    }
    if (!/^\s+run: node scripts\/ci\/edited-ayna\.cjs\s*$/m.test(blok)) ihlal.push('ayna adımı `node scripts/ci/edited-ayna.cjs` koşturmuyor')
    for (const e of ['GH_TOKEN', 'DEPO', 'HEAD_SHA', 'BASE_REF', 'KOSU_ID']) {
      if (!new RegExp(`^\\s+${e}: \\$\\{\\{`, 'm').test(blok)) ihlal.push(`ayna adımında ${e} ortam değişkeni yok`)
    }
  }

  // 4) sıra: kayıt kapısı < ayna < her ağır adım
  const kapi = sira('PR kayıt kapısı (karar 187)')
  const aynaSira = sira(AYNA_ADIM_ADI)
  if (kapi >= 0 && aynaSira >= 0 && aynaSira < kapi) ihlal.push('ayna adımı PR kayıt kapısından ÖNCE: kapı her zaman ilk ve koşulsuz değerlendirilmeli')
  for (const ad of AGIR) {
    const i = sira(ad)
    if (aynaSira >= 0 && i >= 0 && i < aynaSira) ihlal.push(`AĞIR adım "${ad}" ayna adımından ÖNCE: koşul henüz hesaplanmamışken koşar`)
  }

  // 5) concurrency: edited ayrı grup, iptal açık
  if (!satirlar.some((s) => /^\s+group: ci-\$\{\{ github\.ref \}\}\$\{\{ github\.event\.action == 'edited' && '-edited' \|\| '' \}\}\s*$/.test(s))) {
    ihlal.push("concurrency grubu `edited` için ayrı değil: düzenleme koşan TAM koşuyu iptal eder")
  }
  if (!satirlar.some((s) => /^\s+cancel-in-progress: true\s*$/.test(s))) ihlal.push('cancel-in-progress: true yok')

  // 6) izinler: actions: read var, yazma YOK
  if (!satirlar.some((s) => /^\s+actions: read\s*$/.test(s))) ihlal.push('`permissions: actions: read` yok: ayna önceki koşuları okuyamaz')
  const yazma = satirlar.filter((s) => /:\s*write\s*$/.test(s))
  if (yazma.length) ihlal.push(`ci.yml yazma yetkisi içeriyor: ${yazma.map((s) => s.trim()).join(', ')}`)

  // 7) zaman aşımı: edited bekleyebilir
  if (!satirlar.some((s) => /^\s+timeout-minutes: \$\{\{ github\.event\.action == 'edited' && 30 \|\| 15 \}\}\s*$/.test(s))) {
    ihlal.push('timeout-minutes edited için 30, diğerleri için 15 olmalı (ayna tam koşuyu bekleyebilir ve gerekirse paketin tamamını koşar)')
  }
  return ihlal
}

describe('INV-CI-EDITED-1 — edited aynası ci iş akışına doğru bağlı', () => {
  const ci = readFileSync(CI_YOLU, 'utf8').replace(/\r\n/g, '\n')

  it('bugünkü ci.yml bağlantı kurallarına uyuyor', () => {
    expect(denetle(ci)).toEqual([])
  })

  it('kanarya: adımlar ayrıştırıldı (denetçi boş metinle yeşil vermesin)', () => {
    expect(adimlariAyir(ci).length).toBeGreaterThanOrEqual(15)
    expect(AGIR.length + HEP_KOSAN.length).toBe(adimlariAyir(ci).length)
  })

  it('betik ci.yml adım adının BAŞI ile aynı adı kullanıyor', () => {
    expect(AYNA_ADIM_ADI).toBe('edited ayna kararı')
  })

  // ── SABOTAJ: her bozulma yolu GERÇEKTEN yakalanıyor mu ────────────────────────
  it('sabotaj 1: ağır adımdan atlama koşulu silinirse yakalanır', () => {
    const bozuk = ci.replace(
      /(- name: Test\n)\s+if: steps\.ayna\.outputs\.atla != 'true'\n/,
      '$1',
    )
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('AĞIR adım "Test" atlama koşulu taşımıyor')
  })

  it('sabotaj 2: PR kayıt kapısına atlama koşulu girerse yakalanır (en ağır bozulma)', () => {
    const bozuk = ci.replace(
      "- name: PR kayıt kapısı (karar 187)\n        if: github.event_name == 'pull_request'\n",
      "- name: PR kayıt kapısı (karar 187)\n        if: github.event_name == 'pull_request' && steps.ayna.outputs.atla != 'true'\n",
    )
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('HEP KOŞAN adım "PR kayıt kapısı (karar 187)" atlama koşulu taşıyor')
  })

  it('sabotaj 3: ayna adımının adı değişirse yakalanır', () => {
    const bozuk = ci.replace('- name: edited ayna kararı', '- name: edited aynası')
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('SINIFSIZ')
  })

  it('sabotaj 4: concurrency grubundan edited soneki düşerse yakalanır', () => {
    const bozuk = ci.replace("${{ github.event.action == 'edited' && '-edited' || '' }}", '')
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('`edited` için ayrı değil')
  })

  it('sabotaj 5: ayna adımı kayıt kapısından önceye taşınırsa yakalanır', () => {
    const satirlar = ci.split('\n')
    const bas = satirlar.findIndex((s) => s.includes('- name: edited ayna kararı'))
    const bit = satirlar.findIndex((s, i) => i > bas && /^ {6}- name:/.test(s))
    const adim = satirlar.slice(bas, bit)
    const kalan = [...satirlar.slice(0, bas), ...satirlar.slice(bit)]
    const kapi = kalan.findIndex((s) => s.includes('- name: PR kayıt kapısı'))
    const bozuk = [...kalan.slice(0, kapi), ...adim, ...kalan.slice(kapi)].join('\n')
    expect(denetle(bozuk).join('|')).toContain('PR kayıt kapısından ÖNCE')
  })

  it('sabotaj 6: yeni sınıfsız adım eklenirse yakalanır', () => {
    const bozuk = ci.replace('      - name: Build (blocking)\n', '      - name: Yeni ağır kapı\n        run: echo x\n\n      - name: Build (blocking)\n')
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('"Yeni ağır kapı" SINIFSIZ')
  })

  it('sabotaj 7: actions: read düşerse ve yazma yetkisi girerse yakalanır', () => {
    const okumasiz = ci.replace('  actions: read\n', '')
    expect(okumasiz).not.toBe(ci)
    expect(denetle(okumasiz).join('|')).toContain('actions: read')
    const yazmali = ci.replace('  actions: read\n', '  actions: write\n')
    expect(denetle(yazmali).join('|')).toContain('yazma yetkisi')
  })

  it('sabotaj 8: ayna adımından id düşerse yakalanır (çıktı okunamaz, ağır adımlar HEP koşar)', () => {
    const bozuk = ci.replace('        id: ayna\n', '')
    expect(bozuk).not.toBe(ci)
    expect(denetle(bozuk).join('|')).toContain('`id: ayna` satırı yok')
  })
})
