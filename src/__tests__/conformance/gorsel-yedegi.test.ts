/**
 * INV-GORSEL-YEDEK-1 (URN-57): görseli olmayan ürün başka bir ürünün fotoğrafıyla gösterilmez;
 * veriye dayanmayan sabit enerji sınıfı rozeti basılmaz.
 *
 * Neden: `normalizeImageUrl` varsayılan yedeği ve ana sayfa kategori kartı yedeği
 * `vortice_lineo_futuristic.webp` idi (bir Vortice Lineo fotoğrafı); "12 kW Elektrikli Isıtıcı"
 * paneli bu fanla çiziliyordu. Altında her ürüne aynı "Sınıf A++ / Standart ERP" yazılıyordu;
 * canlı veritabanında (441 aktif ürün) technical_specs içinde enerji sınıfı anahtarı yok.
 *
 * Ölçüt: (1) yedek ürün içermeyen yer tutucu; (2) Lineo fotoğrafı yalnız Lineo'nun KENDİ vitrin
 * bileşenlerinde (doğru ürün) geçer; (3) rozet anahtarları sözlükte yok, bileşen onları okumuyor.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

import { normalizeImageUrl, YER_TUTUCU_GORSEL } from '@/utils/imageUtils'

const KOK = process.cwd()
const SRC = join(KOK, 'src')

/** Lineo fotoğrafının DOĞRU ürün olduğu vitrin bileşenleri (kartta DOKUNULMAZ listesi). */
const LINEO_IZINLI = [
    'src/components/home/CinematicProductShowcase.tsx',
    'src/components/home/HomeSinevizyon.tsx',
]

function kaynakDosyalari(dizin: string, cikti: string[] = []): string[] {
    for (const ad of readdirSync(dizin)) {
        const yol = join(dizin, ad)
        if (statSync(yol).isDirectory()) {
            if (ad === '__tests__' || ad === 'node_modules') continue
            kaynakDosyalari(yol, cikti)
        } else if (/\.(ts|tsx)$/.test(ad)) {
            cikti.push(yol)
        }
    }
    return cikti
}

describe('INV-GORSEL-YEDEK-1 — yanlış ürün görseli ve dayanaksız rozet yok', () => {
    it('varsayılan yedek ürün içermeyen yer tutucudur ve dosyası vardır', () => {
        expect(normalizeImageUrl(null)).toBe(YER_TUTUCU_GORSEL)
        expect(YER_TUTUCU_GORSEL).toBe('/images/urun-gorseli-yok.svg')
        expect(existsSync(join(KOK, 'public', YER_TUTUCU_GORSEL))).toBe(true)
        const svg = readFileSync(join(KOK, 'public', YER_TUTUCU_GORSEL), 'utf8')
        expect(svg, 'yer tutucu fotoğraf/metin taşımamalı').not.toMatch(/<image\b|<text\b/)
    })

    it('vortice_lineo_futuristic yalnız Lineo vitrin bileşenlerinde geçer', () => {
        const ihlal = kaynakDosyalari(SRC)
            .map((f) => relative(KOK, f).replace(/\\/g, '/'))
            .filter((f) => readFileSync(join(KOK, f), 'utf8').includes('vortice_lineo_futuristic'))
            .filter((f) => !LINEO_IZINLI.includes(f))
        expect(ihlal, `Lineo fotoğrafı izinsiz yerde: ${ihlal.join(', ')}`).toEqual([])
    })

    it('enerji sınıfı rozeti: sözlükte anahtar yok, odak paneli onları okumuyor', () => {
        for (const sozluk of ['tr', 'en']) {
            const metin = readFileSync(join(SRC, `i18n/dictionaries/${sozluk}.ts`), 'utf8')
            expect(metin, `${sozluk}.ts içinde gradeValue`).not.toMatch(/gradeValue|gradeLabel/)
            expect(metin, `${sozluk}.ts içinde "A++"`).not.toContain("'A++'")
        }
        const panel = readFileSync(join(SRC, 'components/home/FeaturedCommercialBlocks.tsx'), 'utf8')
        expect(panel).not.toMatch(/featuredCommercial\.(grade|standard)(Label|Value)/)
    })
})
