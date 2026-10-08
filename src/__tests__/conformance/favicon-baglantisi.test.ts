/**
 * INV-FAVICON-1 (REC-491): site ikonu HTML'e bağlıdır ve dosyalar gerçekten dosya türüdür.
 *
 * Neden: `public/favicon.ico` aslında SVG metniydi (gövde "<svg" ile başlıyordu), kök layout
 * `icons` vermiyordu, /icon.png ve /apple-icon.png yoktu; aramada site ikonu çıkmıyordu ve hiçbir
 * kapı görmüyordu (dosya var, ama yanlış türde ve bağlı değil).
 *
 * Ölçüt: (1) kök layout `icons` bildiriyor (svg + png + apple); (2) bildirilen her dosya
 * public/ altında var; (3) .ico gerçek ICO başlığıyla başlıyor; (4) .png dosyaları PNG imzasıyla.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const layoutMetni = readFileSync(join(KOK, 'src/app/layout.tsx'), 'utf8')

const BILDIRILEN = [
    '/favicon.svg',
    '/favicon-48x48.png',
    '/favicon.ico',
    '/apple-touch-icon.png',
] as const

const PNG_IMZASI = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

describe('INV-FAVICON-1 — site ikonu bağlı ve gerçek', () => {
    it('kök layout icons bloğunda dört ikon yolunu bildirir', () => {
        expect(layoutMetni).toMatch(/icons:\s*\{/)
        for (const yol of BILDIRILEN) {
            expect(layoutMetni, `${yol} layout icons içinde yok`).toContain(`'${yol}'`)
        }
    })

    it('bildirilen her ikon dosyası public/ altında var', () => {
        for (const yol of BILDIRILEN) {
            expect(existsSync(join(KOK, 'public', yol)), `${yol} public/ altında yok`).toBe(true)
        }
    })

    it('favicon.ico gerçek ICO başlığıyla başlar (SVG metni DEĞİL)', () => {
        const b = readFileSync(join(KOK, 'public/favicon.ico'))
        expect([b[0], b[1], b[2], b[3]]).toEqual([0, 0, 1, 0])
    })

    it('PNG ikonları PNG imzasıyla başlar', () => {
        for (const yol of ['/favicon-48x48.png', '/apple-touch-icon.png']) {
            const b = readFileSync(join(KOK, 'public', yol))
            expect([...b.subarray(0, 8)], `${yol} PNG değil`).toEqual(PNG_IMZASI)
        }
    })

    it('favicon.svg SVG kökü taşır', () => {
        expect(readFileSync(join(KOK, 'public/favicon.svg'), 'utf8')).toMatch(/^\s*<svg\b/)
    })
})
