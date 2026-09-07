// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-WORKFLOW-MODEL — workflow betiklerinde her `agent()` çağrısı MODELİNİ AÇIKÇA yazar.
 *
 * NİÇİN VAR (Recep, 2026-09-06, ikinci kez söyledi): `model:` boş bırakılan `agent()` çağrısı
 * modeli MİRAS ALIR — oturum hangi modeldeyse ajan da odur. Mekanik bir dosya düzenlemesi için
 * pahalı model açmak, hiç ölçülmeden alınan bir maliyet kararıdır. Karar YAZILI olmalı.
 *
 * ⭐ÖLÇÜT TOPLAM SAYI DEĞİL, ÇAĞRI BAŞINA: "dosyada 4 agent( ve 4 model: var" demek yetmez —
 * `model:` başka yerde (meta.phases, yorum, ayar nesnesi) geçebilir ve agrega sayı ters gideni
 * gizler. Bu yüzden her `agent(` çağrısının KENDİ seçenek bloğuna bakılır.
 *
 * ⚠EVREN: yalnız KOŞAN workflow betikleri (`export const meta` içeren .mjs/.cjs/.js).
 * Belge (.md) içindeki örnekler DIŞARIDA — belgede geçen `agent(` koşmaz ve onu saymak kapıyı
 * yalancı kırmızıya boğar ("ölçüt keskin ama evren yanlış" dersi, 2026-09-01).
 */

const KOK = process.cwd()

/** Metin tarayan kapı ÖNCE yorumları çıkarır (bugünün üç kez tekrarlanan dersi). */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function betikleriTara(dizin: string, cikti: string[] = []): string[] {
  let girdiler: fs.Dirent[]
  try {
    girdiler = fs.readdirSync(dizin, { withFileTypes: true })
  } catch {
    return cikti
  }
  for (const g of girdiler) {
    const tam = path.join(dizin, g.name)
    if (g.isDirectory()) {
      if (g.name === 'node_modules' || g.name === '.git') continue
      betikleriTara(tam, cikti)
    } else if (/\.(mjs|cjs|js)$/.test(g.name)) {
      cikti.push(tam)
    }
  }
  return cikti
}

/** Workflow betiği = `export const meta` + `agent(` içeren KOŞAN dosya. */
function workflowBetikleri(): string[] {
  const adaylar = [
    ...betikleriTara(path.join(KOK, '.claude', 'skills')),
    ...betikleriTara(path.join(KOK, '.claude', 'workflows')),
    ...betikleriTara(path.join(KOK, 'scripts', 'workflows')),
  ]
  return adaylar.filter((f) => {
    const k = yorumsuz(fs.readFileSync(f, 'utf8'))
    return /export\s+const\s+meta\s*=/.test(k) && /\bagent\s*\(/.test(k)
  })
}

/**
 * Her `agent(` çağrısı için seçenek bloğunu çıkarır.
 * Yöntem: çağrının başlangıcından itibaren ilk `{ … }` bloğu (iç içe süslü parantezi sayarak).
 * SINIR — dürüstçe: seçenekler değişkenden geliyorsa (`agent(p, opts)`) blok bulunamaz; o hâl
 * "model yok" sayılır ve KIRMIZI verir. Kasıtlı: dolaylı seçenek, modeli okunamaz kılar.
 */
function agentCagrilari(kaynak: string): string[] {
  const bloklar: string[] = []
  const re = /\bagent\s*\(/g
  let m: RegExpExecArray | null
  while ((m = re.exec(kaynak)) !== null) {
    const bas = kaynak.indexOf('{', m.index)
    const cagriSonu = kaynak.indexOf('agent(', m.index + 1)
    if (bas === -1 || (cagriSonu !== -1 && bas > cagriSonu)) {
      bloklar.push('')
      continue
    }
    let derinlik = 0
    let son = -1
    for (let i = bas; i < kaynak.length; i++) {
      if (kaynak[i] === '{') derinlik++
      else if (kaynak[i] === '}') {
        derinlik--
        if (derinlik === 0) {
          son = i
          break
        }
      }
    }
    bloklar.push(son === -1 ? '' : kaynak.slice(bas, son + 1))
  }
  return bloklar
}

const BETIKLER = workflowBetikleri()

describe('INV-WORKFLOW-MODEL: her agent() çağrısı modelini AÇIKÇA yazar', () => {
  it('EVREN BOŞ DEĞİL (boş evren her zaman yeşildir — fail-open yüz)', () => {
    expect(
      BETIKLER.length,
      'hiç workflow betiği bulunamadı; kapı hiçbir şey ölçmüyor demektir (yol değişmiş olabilir)',
    ).toBeGreaterThan(0)
  })

  it('hiçbir agent() çağrısı model alanı OLMADAN kalmaz', () => {
    const eksikler: string[] = []
    for (const f of BETIKLER) {
      const kaynak = yorumsuz(fs.readFileSync(f, 'utf8'))
      agentCagrilari(kaynak).forEach((blok, i) => {
        if (!/\bmodel\s*:/.test(blok)) {
          eksikler.push(path.relative(KOK, f) + ' → agent() #' + (i + 1))
        }
      })
    }
    expect(
      eksikler,
      'model alanı yazılmamış agent() çağrıları — boş model oturumun modelini miras alır ve ' +
        'mekanik iş için pahalı modele düşer (Recep 2026-09-06). Her çağrıya model: yaz.',
    ).toEqual([])
  })

  it('yazılan model TANINAN bir değer (uydurma model sessizce miras almaya döner)', () => {
    const TANINAN = ['sonnet', 'opus', 'haiku', 'fable']
    const kotu: string[] = []
    for (const f of BETIKLER) {
      const kaynak = yorumsuz(fs.readFileSync(f, 'utf8'))
      for (const blok of agentCagrilari(kaynak)) {
        const m = /\bmodel\s*:\s*'([^']+)'|\bmodel\s*:\s*"([^"]+)"/.exec(blok)
        if (!m) continue
        const deger = (m[1] || m[2]).toLowerCase()
        if (!TANINAN.some((t) => deger.includes(t))) kotu.push(path.relative(KOK, f) + ' → ' + deger)
      }
    }
    expect(kotu, 'tanınmayan model değeri').toEqual([])
  })

  it('CETVEL BU KURALI YAZIYOR (kapı var cetvel yok = hatırlamaya bağlı kural)', () => {
    const cetvel = fs.readFileSync(path.join(KOK, 'docs', 'standards', 'execution-method-standard.md'), 'utf8')
    expect(cetvel, 'yürütme yöntemi cetvelinde model yönlendirme bölümü yok').toMatch(/model/i)
    expect(cetvel, 'cetvelde "model açıkça yazılır" hükmü geçmiyor').toMatch(/AÇIKÇA|acikca/)
    expect(cetvel, 'hangi işin hangi modele gittiği yazılmamış').toMatch(/sonnet/i)
  })
})
