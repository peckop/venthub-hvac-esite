/**
 * INV-SECICI-1 — Ürün Seçici tek giriştir ve DÖRT ARAÇ KAYBOLMAZ.
 *
 * NİÇİN VAR (2026-09-05): karar metni "dört hesaplayıcı yolu tek yola iner, eskiler 301"
 * diyor. Bu cümle olduğu gibi uygulansaydı **canlıda çalışan dört araç** tek bir sayfaya
 * yönlenirdi — ve o sayfanın motoru henüz yok (K18 açıkça "İSTİŞARE, KARAR DEĞİL").
 * Yani müşteri bugün kanal hesabı yapıyorken, yarın aynı adres hesaplama yapmayan bir
 * sayfaya düşecekti. İş ikiye bölündü (OPS onayı): önce TEK GİRİŞ, sonra motor.
 *
 * ⭐BU KAPININ ASIL İŞİ: ikinci adımın **sessizce erken** atılmasını engellemek.
 * Bir gün biri "kararda 301 yazıyor" deyip dört aracı yönlendirirse, kapı KIRMIZI verir
 * ve gerekçeyi ekrana yazar. Yönlendirme meşrulaştığında bu kapı BİLEREK güncellenir —
 * kaza ile değil.
 *
 * ⛔NE ÖLÇMEZ: hesap motorlarının doğru sonuç verdiğini. Bu kapı YAPIYI ölçer
 * (giriş var mı, araçlar duruyor mu, bağlantılar doğru mu), ANLAMI değil.
 */
import { readFileSync } from 'node:fs'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const oku = (...p: string[]) => readFileSync(join(KOK, ...p), 'utf8')
const varMi = (...p: string[]) => existsSync(join(KOK, ...p))

/** Dört araç — adları ve klasörleri. Bu liste kısalırsa yetenek düşmüş demektir. */
const ARACLAR = ['kanal', 'hrv', 'hava-perdesi', 'jet-fan'] as const

const SECICI = oku('src', 'app', '[lang]', 'urun-secici', 'page.tsx')
const ROTALAR = oku('src', 'utils', 'routes.ts')
const SITEMAP = oku('src', 'app', 'sitemap.ts')
const NEXT_CONFIG = oku('next.config.mjs')
const ANA_SAYFA_BLOK = oku('src', 'components', 'home', 'KnowledgeBlock.tsx')
const TR = oku('src', 'i18n', 'dictionaries', 'tr.ts')
const EN = oku('src', 'i18n', 'dictionaries', 'en.ts')

/** Yorumları at — bir kuralın yalnız yorumda anılması onu uygulamaz. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

describe('INV-SECICI-1 — Ürün Seçici girişi ve araçların korunması', () => {
    it('⭐DÖRT ARAÇ SAYFASI HÂLÂ DURUYOR — yetenek sessizce düşemez', () => {
        for (const arac of ARACLAR) {
            expect(
                varMi('src', 'app', '[lang]', 'destek', 'hesaplayicilar', arac, 'page.tsx'),
                `"${arac}" hesaplayici sayfasi YOK. Dort arac da 2026-09-05'te canlida CALISIYORDU ` +
                    '(kanal olculdu: HTTP 200). Silinmesi ya da tasinmasi YETENEK KAYBIDIR ve ancak ' +
                    'K18 karara donustukten sonra, ayri emirle olur.',
            ).toBe(true)
        }
    })

    it('⭐DÖRT ARACIN ADRESİ YÖNLENDİRİLMİYOR — erken 301 kazası engelli', () => {
        for (const arac of ARACLAR) {
            const desen = new RegExp(`source:\\s*['\`][^'\`]*hesaplayicilar/${arac}`, 'i')
            expect(
                desen.test(NEXT_CONFIG),
                `next.config.mjs "${arac}" aracini YONLENDIRIYOR. Karar metnindeki "dort yol tek yola ` +
                    'iner" hukmu K18 e baglidir ve K18 ISTISARE, KARAR DEGIL. Motor hazir olmadan ' +
                    'yonlendirme, calisan bir araci olu sayfaya gonderir. Yonlendirme mesrulastiginda ' +
                    'ONCE bu kapi bilerek guncellenir.',
            ).toBe(false)
        }
    })

    it('ölü dizin adresi Ürün Seçici’ye yönleniyor (404 onarımı)', () => {
        expect(
            /source:\s*'\/:lang\(tr\|en\)\/destek\/hesaplayicilar'/.test(NEXT_CONFIG),
            'Dizin adresi /destek/hesaplayicilar icin yonlendirme YOK. O adres canlida 404 veriyordu ' +
                'ama Routes.destek.hesaplayicilar() slugsiz cagrilinca tam onu uretiyor — kodda ' +
                'uretilebilen, sitede olmayan adres.',
        ).toBe(true)
        expect(/destination:\s*'\/:lang\/urun-secici'/.test(NEXT_CONFIG)).toBe(true)
    })

    it('⭐giriş sayfası DÖRT ARACIN HEPSİNE bağlantı veriyor', () => {
        const g = govde(SECICI)
        for (const arac of ARACLAR) {
            expect(
                g.includes(`'${arac}'`),
                `Secici sayfasi "${arac}" aracina baglanmiyor. Giris sayfasinin tek isi araclari ` +
                    'toplamak; eksik birakilan arac, sitede ulasilamaz hale gelir.',
            ).toBe(true)
        }
        expect(
            /Routes\.destek\.hesaplayicilar\(/.test(g),
            'Secici sayfasi araclara Routes yardimcisiyla baglanmali (kural 7: elle /tr/ birlestirme yasak).',
        ).toBe(true)
    })

    it('giriş sayfası SERVER COMPONENT — etkileşimi yok, istemciye düşmemeli', () => {
        // ⚠GÖVDEDE ara, ham metinde DEĞİL: sayfanın kendi yorumu "burada 'use client' YOK"
        // diye yazıyor ve ham arama o cümleyi ihlal sanıyor. 2026-09-05'te bu kapı kendi
        // yorumumu yakaladı — ölçütün yanlış EVRENDE çalışmasının küçük ama net örneği.
        expect(
            /'use client'/.test(govde(SECICI)),
            "Secici sayfasi 'use client' tasiyor. Sayfa baslik + dort baglanti karti; etkilesimli " +
                'degil. CLAUDE.md kural 4: page.tsx varsayilan Server Component.',
        ).toBe(false)
    })

    it('Routes.urunSecici tanımlı ve ana sayfa kartı ona bağlanıyor', () => {
        expect(/urunSecici:\s*\(\)\s*=>\s*'\/urun-secici'/.test(ROTALAR)).toBe(true)
        const g = govde(ANA_SAYFA_BLOK)
        expect(
            g.includes('Routes.urunSecici()'),
            'Ana sayfa bilgi karti Urun Secici girisine baglanmiyor.',
        ).toBe(true)
        expect(
            /Routes\.destek\.hesaplayicilar\('hrv'\)/.test(g),
            'Ana sayfa karti HALA dogrudan tek araca (hrv) gidiyor. Karar K17: tek ad, TEK HEDEF — ' +
                'kart giris sayfasina gitmeli, bir araca degil.',
        ).toBe(false)
    })

    it('sitemap girişi var, araçların kendi adresleri sitemap’te YOK (kasıtlı)', () => {
        expect(/'\/urun-secici'/.test(SITEMAP), 'Urun Secici sitemap staticRoutesList icinde YOK.').toBe(true)
        expect(
            /hesaplayicilar/.test(govde(SITEMAP)),
            'Araclarin kendi adresleri sitemap e eklenmis. Arama motoruna verilen kapi TEK olmali; ' +
                'araclar giris sayfasindan bulunur.',
        ).toBe(false)
    })

    it('iki sözlükte de urunSecici bölümü var ve dört aracı adlandırıyor', () => {
        for (const [ad, metin] of [['tr', TR], ['en', EN]] as const) {
            expect(/urunSecici:\s*\{/.test(metin), `Sozluk (${ad}) urunSecici bolumu YOK.`).toBe(true)
            for (const alan of ['kanal', 'hrv', 'havaPerdesi', 'jetFan']) {
                expect(
                    new RegExp(`${alan}:\\s*\\{`).test(metin),
                    `Sozluk (${ad}) "${alan}" araci icin ad/aciklama tasimiyor — kart bos cikar.`,
                ).toBe(true)
            }
        }
    })
})
