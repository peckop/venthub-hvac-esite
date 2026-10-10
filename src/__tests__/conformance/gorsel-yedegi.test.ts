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
 * bileşenlerinde (doğru ürün) geçer; (3) rozet anahtarları sözlükte yok, bileşen onları okumuyor;
 * (4) URN-69: `VentImage`, `productImagePlaceholder` ve Orbital doku yedeği de aynı yer tutucuya bağlı;
 * `public/images/placeholders/*.png` (gerçek bir endüstriyel fan fotoğrafı) kaynakta geçmez, dosyalar depoda yok.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

import { normalizeImageUrl, YER_TUTUCU_GORSEL } from '@/utils/imageUtils'

const KOK = process.cwd()
const SRC = join(KOK, 'src')

/** URN-69: eski yedek adresi (`public/images/placeholders/*-placeholder.png`, gerçek bir fan fotoğrafı). */
const ESKI_PNG_YEDEK = /images\/placeholders\/[\w-]+\.png/
/** Kök `<svg ...>` açılış etiketi (WebGL dokusu için içsel boyut orada aranır). */
const svgKoku = (svg: string): string => svg.match(/<svg\b[^>]*>/)?.[0] ?? ''

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

    it('URN-69: placeholders/*.png yedekleri kaynakta geçmez ve dosyalar depoda yok', () => {
        // Eskiden VentImage (ürün/kategori/marka/genel), productImagePlaceholder ve Orbital doku yedeği
        // `public/images/placeholders/*-placeholder.png` dosyalarına bağlıydı: siyah bir endüstriyel fan
        // fotoğrafı. Görseli olmayan ısıtıcı, marka ya da kategori de fan gibi görünüyordu.
        const ihlal = kaynakDosyalari(SRC)
            .map((f) => relative(KOK, f).replace(/\\/g, '/'))
            .filter((f) => ESKI_PNG_YEDEK.test(readFileSync(join(KOK, f), 'utf8')))
        expect(ihlal, `placeholders/*.png adresi kaynakta: ${ihlal.join(', ')}`).toEqual([])
        expect(
            existsSync(join(KOK, 'public', 'images', 'placeholders')),
            'public/images/placeholders klasörü geri geldi (fan fotoğrafı yedekleri)',
        ).toBe(false)
    })

    it('URN-69: VentImage yedeği tek yer tutucudur ve alt metni sözlükten alır', () => {
        const kaynak = readFileSync(join(SRC, 'components/ui/VentImage.tsx'), 'utf8')
        expect(kaynak, 'VentImage YER_TUTUCU_GORSEL kullanmıyor').toContain('YER_TUTUCU_GORSEL')
        expect(kaynak, 'tip başına yedek tablosu geri geldi').not.toContain('FALLBACK_IMAGES')
        expect(kaynak, 'yer tutucu alt metni sözlükten gelmiyor').toContain("t('common.imagePreparing')")
        const orbital = readFileSync(join(SRC, 'components/products/OrbitalProductsShowcase.tsx'), 'utf8')
        expect(orbital, 'Orbital doku yedeği yer tutucuya bağlı değil').toContain('useTexture(finalPath || YER_TUTUCU_GORSEL)')
    })

    it('URN-69: yer tutucu SVG açık width/height taşır (WebGL dokusu için içsel boyut şart)', () => {
        const svg = readFileSync(join(KOK, 'public', YER_TUTUCU_GORSEL), 'utf8')
        const kok = svgKoku(svg)
        expect(kok, 'kök <svg> width yok').toMatch(/\bwidth="\d+"/)
        expect(kok, 'kök <svg> height yok').toMatch(/\bheight="\d+"/)
    })

    it('URN-69: dedektörler canlı — eski yedek adresi ve boyutsuz SVG kötü girdide YAKALANIR', () => {
        // Üretim koduna dokunmadan kapının ölü olmadığını gösterir (sahte-yeşil koruması).
        expect(ESKI_PNG_YEDEK.test("product: '/images/placeholders/product-placeholder.png',")).toBe(true)
        expect(ESKI_PNG_YEDEK.test("category: `/images/placeholders/category-placeholder.png`")).toBe(true)
        expect(ESKI_PNG_YEDEK.test("src: '/images/urun-gorseli-yok.svg'")).toBe(false)
        expect(svgKoku('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">')).not.toMatch(/\bwidth="\d+"/)
        expect(svgKoku('<svg width="400" height="400" viewBox="0 0 400 400">')).toMatch(/\bwidth="\d+"/)
    })
})
