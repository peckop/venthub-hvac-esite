// @vitest-environment node
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KARTSIZ-KAYIT-1 · "Linear'da başlatılan kaydın panoda açık kartı var mı" sayacı (karar 144).
 *
 * 09-27 ölçümü: 09-18'den beri başlatılan kayıtların çoğunun kartı yoktu ve hiçbir yüzey
 * göstermiyordu. Sayaç BLOKLAMAZ, tek satır verir; ölçemediğinde susmaz, OLCULEMEDI der.
 * Ayırt edici çiftler: kartlı kayıt listede YOK / kartsız VAR; kapalı kart SAYILMAZ / açık
 * kart SAYILIR; pilot tarihinden önce başlatılan ESKİ / sonra başlatılan PİLOT.
 */

interface Kayit {
  identifier: string
  createdAt?: string
  startedAt?: string | null
}
interface Pano {
  tasks: { title?: string; status?: string }[]
}
interface Olcum {
  olculemedi?: string
  baslangic?: string
  toplam?: number
  kartsiz?: string[]
  eskiToplam?: number
  eskiKartsiz?: number
}
interface Sayac {
  kartsizlar: (baslatilmis: string[], kartRecleri: Set<string>) => string[]
  acikKartRecleri: (panolar: Pano[]) => Set<string>
  ayir: (kayitlar: Kayit[], baslangic?: string) => { pilot: string[]; eski: string[] }
  satir: (s: Olcum) => string
  panolariOku: (yol: string | null) => Pano[] | null
}

const BETIK = path.resolve(process.cwd(), 'scripts', 'board', 'kartsiz-kayit.cjs')
const sayac = createRequire(import.meta.url)(BETIK) as Sayac

describe('INV-KARTSIZ-KAYIT-1: kartsız kayıt sayacı ayırt edici ve bloklamaz', () => {
  it('kartlı kayıt listede YOK, kartsız kayıt VAR; sıra numaraya göre', () => {
    const kartlar = new Set(['REC-10'])
    expect(sayac.kartsizlar(['REC-100', 'REC-10', 'REC-9'], kartlar)).toEqual(['REC-9', 'REC-100'])
  })

  it('yalnız AÇIK kart sayılır: tamamlanmış kartın kaydı kartsız kalır', () => {
    const panolar: Pano[] = [
      {
        tasks: [
          { title: 'REC-1 ARAC: dilim', status: 'in_progress' },
          { title: 'REC-2 + REC-3 ortak kart', status: 'pending' },
          { title: 'REC-4 bitti', status: 'completed' },
          { title: 'numarasiz kart', status: 'pending' },
        ],
      },
    ]
    const k = sayac.acikKartRecleri(panolar)
    expect([...k].sort()).toEqual(['REC-1', 'REC-2', 'REC-3'])
    expect(sayac.kartsizlar(['REC-1', 'REC-4'], k)).toEqual(['REC-4'])
  })

  it('pilot evreni: sınırdan önce açılıp başlatılan ESKİ, sonra açılan ya da başlatılan PİLOT', () => {
    const r = sayac.ayir(
      [
        { identifier: 'REC-1', createdAt: '2026-09-17T23:59:00Z', startedAt: '2026-09-17T23:59:30Z' },
        { identifier: 'REC-2', createdAt: '2026-09-10T00:00:00Z', startedAt: '2026-09-18T00:00:01Z' },
        { identifier: 'REC-3', createdAt: '2026-09-18T08:00:00Z', startedAt: null },
      ],
      '2026-09-18',
    )
    expect(r).toEqual({ pilot: ['REC-2', 'REC-3'], eski: ['REC-1'] })
  })

  it('satır: sıfırda liste yok, kartsızda ilk 8 + kalan sayısı; ölçülemeyen hâl susmaz', () => {
    expect(sayac.satir({ baslangic: '2026-09-18', toplam: 5, kartsiz: [] })).toBe(
      'KARTSIZ KAYIT: 0/5 baslatilmis kaydin (09-18 sonrasi) panoda acik karti yok',
    )
    const on = Array.from({ length: 10 }, (_, i) => `REC-${i + 1}`)
    const s = sayac.satir({ baslangic: '2026-09-18', toplam: 12, kartsiz: on, eskiToplam: 4, eskiKartsiz: 3 })
    expect(s).toMatch(/^KARTSIZ KAYIT: 10\/12 .*\(REC-1, .*REC-8 \+2\) · eski started 3\/4 kartsiz/)
    expect(sayac.satir({ olculemedi: 'LINEAR_API_KEY yok' })).toBe('KARTSIZ KAYIT: OLCULEMEDI (LINEAR_API_KEY yok)')
  })

  it('pano SQLite dosyasından SALT OKUMA ile okunur; dosya yoksa null', () => {
    const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'kartsiz-'))
    const yol = path.join(dizin, 'pano.sqlite')
    const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as {
      DatabaseSync: new (p: string) => { exec: (s: string) => void; close: () => void }
    }
    const db = new DatabaseSync(yol)
    const payload = JSON.stringify({ tasks: [{ title: 'REC-7 x', status: 'pending' }] }).replace(/'/g, "''")
    db.exec(`create table kanban_boards (id text primary key, payload text not null); insert into kanban_boards values ('b', '${payload}')`)
    db.close()
    expect(sayac.panolariOku(yol)).toEqual([{ tasks: [{ title: 'REC-7 x', status: 'pending' }] }])
    expect(sayac.panolariOku(path.join(dizin, 'yok.sqlite'))).toBeNull()
  })

  it('komut satırı: anahtar yoksa OLCULEMEDI der ve çıkış 0 (bloklamaz)', () => {
    const r = spawnSync(process.execPath, [BETIK], {
      encoding: 'utf8',
      env: { ...process.env, LINEAR_API_KEY: '' },
      timeout: 20_000,
    })
    expect(r.status).toBe(0)
    expect(r.stdout.trim()).toBe('KARTSIZ KAYIT: OLCULEMEDI (LINEAR_API_KEY yok)')
  })

  it('kaynak: kendi alt sürecini açmaz (kök ana-kok yardımcısından), anahtar basılmaz', () => {
    const k = fs.readFileSync(BETIK, 'utf8')
    expect(k).not.toMatch(/child_process/)
    expect(k).toMatch(/require\(path\.join\(__dirname, '\.\.', 'hijyen', 'ana-kok\.cjs'\)\)/)
    expect(k).not.toMatch(/(console\.log|stdout\.write)\([^)]*anahtar/)
  })
})
