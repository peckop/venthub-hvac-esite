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
import {
    existsSync,
    lstatSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path'

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

// ---------------------------------------------------------------------------------------------------------------------
// URN-76 — KOPYADA BOZMA KANITI (test-sec kalıbı: scripts/ci/__tests__/test-sec.test.ts, sabotajliModul + mkdtempSync)
//
// Yukarıdaki dedektör testi yalnız düzenli ifadeleri sentetik girdiyle sınar. Burada kapının kendisi (dosya tabanlı hükümleri)
// kırmızı verebiliyor mu diye ölçülür. Gerçek dosyalara DOKUNULMAZ: kaynak ağacın (.ts/.tsx, __tests__ hariç) ve yer tutucu
// SVG'nin DOSYA KOPYASI `os.tmpdir()` altında alınır, kopyada tek yer bozulur ve aynı denetim (`ihlaller`) kopyaya yöneltilir.
// Beklenen: bozulmamış kontrol kopyası YEŞİL; her bozma kendi ihlal kodunu (ve yalnız onu) verir. Kanıt her CI koşusunda yenilenir.
//
// `ihlaller(kok)` yukarıdaki yedi `it`in DOSYA TABANLI hükümlerini kök parametreli yürütür (tanım/sabitler ortak: ESKI_PNG_YEDEK,
// svgKoku, LINEO_IZINLI, kaynakDosyalari). Modül içe aktarımına bağlı `normalizeImageUrl(null)` hükmü kök alamadığı için yalnız
// yukarıda kalır. Gerçek kol `ihlaller(KOK)` aynı kodu çalıştırır; yukarıdaki `it`ler değişirse bu denetim de elle eşlenir.
// ---------------------------------------------------------------------------------------------------------------------

type IhlalKodu = 'YER-TUTUCU' | 'SVG-BOYUT' | 'LINEO' | 'ROZET' | 'PNG-ADRESI' | 'PNG-KLASORU' | 'VENTIMAGE' | 'ORBITAL'
type Ihlal = { kod: IhlalKodu; ayrinti: string }

/** Boş-yeşil koruması: taranan kaynak dosyası sayısının alt sınırı (2026-10-09 ölçümü: 726 dosya; sınır ölçülenin altında paylı). */
const KAYNAK_ALT_SINIR = 600
/** Geçici kopya dizinlerinin öneki; silme yalnız bu önekle başlayan, `os.tmpdir()` doğrudan çocuğu dizinlere izin verir. */
const GECICI_ONEK = 'gorsel-yedegi-kopya-'

const goreliYol = (kok: string, yol: string): string => relative(kok, yol).replace(/\\/g, '/')

function ihlaller(kok: string): Ihlal[] {
    const bulgu: Ihlal[] = []
    const ekle = (kod: IhlalKodu, ayrinti: string): void => {
        bulgu.push({ kod, ayrinti })
    }
    /** Kökten göreli okuma; dosya yoksa `null` (eksik kopya sessiz geçmez, çağıran ihlal yazar). */
    const oku = (...parcalar: string[]): string | null => {
        const yol = join(kok, ...parcalar)
        return existsSync(yol) ? readFileSync(yol, 'utf8') : null
    }

    // 1) Yer tutucu SVG: var, fotoğraf/metin taşımıyor, kök <svg> açık width/height taşıyor (WebGL dokusu için içsel boyut şart).
    const svg = oku('public', YER_TUTUCU_GORSEL)
    if (svg === null) {
        ekle('YER-TUTUCU', `${YER_TUTUCU_GORSEL} dosyası yok`)
    } else {
        if (/<image\b|<text\b/.test(svg)) ekle('YER-TUTUCU', 'yer tutucu fotoğraf/metin taşıyor')
        const koku = svgKoku(svg)
        if (!/\bwidth="\d+"/.test(koku)) ekle('SVG-BOYUT', 'kök <svg> width yok')
        if (!/\bheight="\d+"/.test(koku)) ekle('SVG-BOYUT', 'kök <svg> height yok')
    }

    // 2) Kaynak taraması: Lineo fotoğrafı yalnız izinli vitrin bileşenlerinde; eski placeholders/*.png adresi hiçbir kaynakta yok.
    for (const f of kaynakDosyalari(join(kok, 'src')).map((y) => goreliYol(kok, y))) {
        const metin = readFileSync(join(kok, f), 'utf8')
        if (metin.includes('vortice_lineo_futuristic') && !LINEO_IZINLI.includes(f)) ekle('LINEO', f)
        if (ESKI_PNG_YEDEK.test(metin)) ekle('PNG-ADRESI', f)
    }

    // 3) Fan fotoğrafı yedeklerinin klasörü depoda geri gelmemiş olmalı.
    if (existsSync(join(kok, 'public', 'images', 'placeholders'))) {
        ekle('PNG-KLASORU', 'public/images/placeholders klasörü var')
    }

    // 4) Dayanaksız enerji sınıfı rozeti: sözlükte anahtar yok, odak paneli onları okumuyor.
    for (const sozluk of ['tr', 'en']) {
        const metin = oku('src', 'i18n', 'dictionaries', `${sozluk}.ts`)
        if (metin === null) ekle('ROZET', `${sozluk}.ts sözlüğü okunamadı`)
        else if (/gradeValue|gradeLabel/.test(metin) || metin.includes("'A++'")) ekle('ROZET', `${sozluk}.ts rozet anahtarı taşıyor`)
    }
    const panel = oku('src', 'components', 'home', 'FeaturedCommercialBlocks.tsx')
    if (panel === null) ekle('ROZET', 'FeaturedCommercialBlocks.tsx okunamadı')
    else if (/featuredCommercial\.(grade|standard)(Label|Value)/.test(panel)) ekle('ROZET', 'odak paneli rozet anahtarını okuyor')

    // 5) VentImage tek yer tutucuya bağlı ve alt metni sözlükten alır; Orbital doku yedeği aynı yer tutucuya bağlı.
    const ventImage = oku('src', 'components', 'ui', 'VentImage.tsx')
    if (ventImage === null) {
        ekle('VENTIMAGE', 'VentImage.tsx okunamadı')
    } else {
        if (!ventImage.includes('YER_TUTUCU_GORSEL')) ekle('VENTIMAGE', 'VentImage YER_TUTUCU_GORSEL kullanmıyor')
        if (ventImage.includes('FALLBACK_IMAGES')) ekle('VENTIMAGE', 'tip başına yedek tablosu geri geldi')
        if (!ventImage.includes("t('common.imagePreparing')")) ekle('VENTIMAGE', 'yer tutucu alt metni sözlükten gelmiyor')
    }
    const orbital = oku('src', 'components', 'products', 'OrbitalProductsShowcase.tsx')
    if (orbital === null) ekle('ORBITAL', 'OrbitalProductsShowcase.tsx okunamadı')
    else if (!orbital.includes('useTexture(finalPath || YER_TUTUCU_GORSEL)')) ekle('ORBITAL', 'Orbital doku yedeği yer tutucuya bağlı değil')

    return bulgu
}

// --- kopya güvenliği ------------------------------------------------------------------------------------------------

/** Silinebilir mi: `os.tmpdir()` DOĞRUDAN çocuğu ve `GECICI_ONEK` ile başlayan ad. Başka hiçbir yol silinmez. */
function gecicidenMi(yol: string): boolean {
    const hedef = resolve(yol)
    return dirname(hedef) === resolve(tmpdir()) && basename(hedef).startsWith(GECICI_ONEK)
}

function gecicidenSil(yol: string): void {
    if (!gecicidenMi(yol)) {
        throw new Error(`silme reddedildi: os.tmpdir() altında ${GECICI_ONEK} önekli doğrudan çocuk değil: ${yol}`)
    }
    if (!existsSync(yol)) return
    if (lstatSync(yol).isSymbolicLink()) throw new Error(`silme reddedildi: yol bir bağlantı: ${yol}`)
    rmSync(yol, { recursive: true, force: true, maxRetries: 3 })
}

/** Kopya içinde oluşturulacak/değiştirilecek yol: göreli, `..` yok, boş değil, NUL yok. */
function guvenliGoreli(goreli: string): string {
    if (goreli === '' || goreli.includes('\0') || isAbsolute(goreli) || /^[A-Za-z]:/.test(goreli)) {
        throw new Error(`kopya yolu göreli ve dolu olmalı: ${JSON.stringify(goreli)}`)
    }
    if (goreli.split(/[\\/]+/).includes('..')) throw new Error(`kopya yolu '..' içeremez: ${goreli}`)
    return goreli
}

/** Göreli yolu kopya kökünün altındaki mutlak yola çevirir; kökün dışına çıkan yol reddedilir. */
function kopyaYolu(kopyaKok: string, goreli: string): string {
    const yol = resolve(kopyaKok, guvenliGoreli(goreli))
    const alt = relative(resolve(kopyaKok), yol)
    if (alt === '' || alt.startsWith('..') || isAbsolute(alt)) throw new Error(`yol kopya kökünün dışına çıkıyor: ${goreli}`)
    return yol
}

/** Kopyalanacak dosyalar: taranan tüm kaynak dosyaları + yer tutucu SVG (kapının okuduğu her şey). */
function kopyalanacaklar(): string[] {
    return [...kaynakDosyalari(SRC).map((f) => goreliYol(KOK, f)), `public${YER_TUTUCU_GORSEL}`]
}

/**
 * Yalnız DOSYA kopyası (bağlantı/junction yok): her dosya okunup LF'e çevrilerek geçici dizine yazılır; çalışma ağacındaki
 * CRLF farkı bozma/kontrol arasında sahte bayt farkı üretmez. Hata olursa yarım kopya silinir.
 */
function kopyaKur(): string {
    const kopyaKok = mkdtempSync(join(tmpdir(), GECICI_ONEK))
    try {
        for (const goreli of kopyalanacaklar()) {
            const hedef = kopyaYolu(kopyaKok, goreli)
            mkdirSync(dirname(hedef), { recursive: true })
            writeFileSync(hedef, readFileSync(join(KOK, goreli), 'utf8').replace(/\r\n/g, '\n'), 'utf8')
        }
    } catch (e) {
        gecicidenSil(kopyaKok)
        throw e
    }
    return kopyaKok
}

// --- bozmalar -------------------------------------------------------------------------------------------------------

type Bozma = {
    ad: string
    /** Bu bozmanın verdiği TEK ihlal kodu (başka kod çıkarsa bozma beklenenden geniş etki yapmıştır). */
    beklenen: IhlalKodu
    degistir?: { dosya: string; eski: string; yeni: string }
    olustur?: { yol: string; icerik: string }
}

const BOZMALAR: Bozma[] = [
    {
        ad: 'VentImage hata yedeği yer tutucu yerine placeholders PNG adresine bağlanır',
        beklenen: 'PNG-ADRESI',
        degistir: {
            dosya: 'src/components/ui/VentImage.tsx',
            eski: 'error ? YER_TUTUCU_GORSEL : normalizeImageUrl(src)',
            yeni: "error ? '/images/placeholders/product-placeholder.png' : normalizeImageUrl(src)",
        },
    },
    {
        // Eski dize UZUN çıpa: kısa ` width="400" height="400"` dizesi dosyada iki kez geçer (tam-bir-kez koruması patlardı).
        ad: 'yer tutucu SVG kök etiketinden width/height düşer (boyutsuz SVG, WebGL dokusu için içsel boyut yok)',
        beklenen: 'SVG-BOYUT',
        degistir: {
            dosya: `public${YER_TUTUCU_GORSEL}`,
            eski: '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox',
            yeni: '<svg xmlns="http://www.w3.org/2000/svg" viewBox',
        },
    },
    {
        ad: 'Orbital doku yedeği yer tutucu sabitine bağlı olmaktan çıkar (başka bir fotoğrafa sabitlenir)',
        beklenen: 'ORBITAL',
        degistir: {
            dosya: 'src/components/products/OrbitalProductsShowcase.tsx',
            eski: 'useTexture(finalPath || YER_TUTUCU_GORSEL)',
            yeni: "useTexture(finalPath || '/images/hero_hvac_industrial_premium_1.webp')",
        },
    },
    {
        ad: 'public/images/placeholders klasörü geri gelir (içinde bir .png dosyası)',
        beklenen: 'PNG-KLASORU',
        olustur: { yol: 'public/images/placeholders/product-placeholder.png', icerik: 'kopyada-bozma' },
    },
]

/** Bozmayı kopyaya uygular ve etkilenen mutlak yolu döner. Eski dize kopyada TAM BİR KEZ bulunmalı. */
function bozmaUygula(kopyaKok: string, bozma: Bozma): string {
    if (bozma.degistir) {
        const { dosya, eski, yeni } = bozma.degistir
        if (eski === '' || yeni === eski) throw new Error(`bozma anlamsız (eski boş ya da yeni === eski): ${bozma.ad}`)
        const yol = kopyaYolu(kopyaKok, dosya)
        const metin = readFileSync(yol, 'utf8')
        const adet = metin.split(eski).length - 1
        if (adet !== 1) throw new Error(`bozma noktası kopyada TAM BİR KEZ bulunmalı (${adet} kez): ${bozma.ad}`)
        writeFileSync(yol, metin.split(eski).join(yeni), 'utf8')
        return yol
    }
    if (bozma.olustur) {
        const yol = kopyaYolu(kopyaKok, bozma.olustur.yol)
        if (existsSync(yol)) throw new Error(`oluşturulacak yol kopyada zaten var: ${bozma.olustur.yol}`)
        mkdirSync(dirname(yol), { recursive: true })
        writeFileSync(yol, bozma.olustur.icerik, 'utf8')
        return yol
    }
    throw new Error(`bozma ne değiştiriyor ne oluşturuyor: ${bozma.ad}`)
}

describe('INV-GORSEL-YEDEK-1 · URN-76 kopyada bozma kanıtı (test-sec kalıbı)', () => {
    it('gerçek kök: ihlal yok ve taranan kaynak dosyası sayısı alt sınırın üstünde (boş-yeşil koruması)', () => {
        expect(ihlaller(KOK), 'gerçek kökte ihlal var').toEqual([])
        const taranan = kaynakDosyalari(SRC).length
        expect(taranan, `taranan kaynak dosyası ${taranan} < ${KAYNAK_ALT_SINIR}: tarama boş kalıyor olabilir`).toBeGreaterThanOrEqual(
            KAYNAK_ALT_SINIR,
        )
    })

    it('kopya güvenliği: silme yalnız os.tmpdir() altındaki önekli doğrudan çocuğa izin verir; kaçan yollar reddedilir', () => {
        expect(gecicidenMi(join(tmpdir(), `${GECICI_ONEK}abc123`))).toBe(true)
        expect(gecicidenMi(KOK), 'depo kökü silinebilir sayıldı').toBe(false)
        expect(gecicidenMi(tmpdir()), 'os.tmpdir() kendisi silinebilir sayıldı').toBe(false)
        expect(gecicidenMi(join(tmpdir(), 'baska-dizin'))).toBe(false)
        expect(gecicidenMi(join(tmpdir(), `${GECICI_ONEK}abc`, 'alt'))).toBe(false)
        expect(gecicidenMi(join(tmpdir(), `${GECICI_ONEK}abc`, '..', '..'))).toBe(false)
        for (const kotu of ['/etc/passwd', 'C:\\Windows\\x', '../x', 'a/../../x', 'a\\..\\x', '', 'a\0b']) {
            expect(() => guvenliGoreli(kotu), `kabul edilen yol: ${JSON.stringify(kotu)}`).toThrow()
        }
        expect(guvenliGoreli('src/components/ui/VentImage.tsx')).toBe('src/components/ui/VentImage.tsx')
    })

    it('kontrol kopyası (bozulmamış) YEŞİL ve gerçek ağaçla aynı sayıda kaynak dosyası taranır', () => {
        const kontrol = kopyaKur()
        try {
            expect(ihlaller(kontrol), 'bozulmamış kopya kırmızı: kopya ya da denetim hatalı').toEqual([])
            expect(kaynakDosyalari(join(kontrol, 'src')).length, 'kopya eksik dosya taşıyor').toBe(kaynakDosyalari(SRC).length)
        } finally {
            gecicidenSil(kontrol)
        }
    }, 60_000)

    it.each(BOZMALAR.map((b) => [b.ad, b] as const))(
        'bozma kopyada kapıyı KIRMIZI yapar: %s',
        (_ad, bozma) => {
            const kontrol = kopyaKur()
            const bozuk = kopyaKur()
            try {
                expect(ihlaller(kontrol), 'kontrol kopyası kırmızı').toEqual([])

                const bozulan = bozmaUygula(bozuk, bozma)
                const karsiligi = join(kontrol, relative(bozuk, bozulan))
                if (bozma.olustur) {
                    expect(existsSync(karsiligi), 'oluşturulan yol kontrol kopyasında da var').toBe(false)
                } else {
                    expect(readFileSync(bozulan).equals(readFileSync(karsiligi)), 'bozuk kopya kontrolle bayt bayt aynı').toBe(false)
                }

                const bulgu = ihlaller(bozuk)
                const kodlar = [...new Set(bulgu.map((i) => i.kod))].sort()
                expect(kodlar, `bozma yalnız ${bozma.beklenen} vermeli; bulgu: ${JSON.stringify(bulgu)}`).toEqual([bozma.beklenen])
            } finally {
                gecicidenSil(kontrol)
                gecicidenSil(bozuk)
            }
        },
        60_000,
    )
})
