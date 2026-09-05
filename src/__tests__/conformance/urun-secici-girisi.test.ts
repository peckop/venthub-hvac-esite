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
        // ⚠İKİ KAYNAK BİRDEN taranır. İlk sürüm yalnız next.config.mjs'e bakıyordu; kod
        // incelemesi (2026-09-05) haklı olarak sordu: middleware.ts'te altı ayrı yönlendirme
        // noktası var, oraya konan bir kural bu kapıyı SESSİZCE atlardı. Kapının amacı
        // "yönlendirme yok" demek; hangi dosyadan geldiği amacı değiştirmez.
        // ⚠GÖVDEDE ara: next.config.mjs'in KENDİ YORUMU gerekçe olarak
        // "/tr/destek/hesaplayicilar/kanal 200 dönüyor" cümlesini taşıyor. Ham metinde
        // arayınca kapı kendi belgesini ihlal sandı — ölçütün yanlış evrende çalışmasının
        // bugünkü ikinci örneği. Yorum ANLATIR, kural UYGULAR; kapı yalnız uygulayana bakar.
        const MIDDLEWARE = oku('src', 'middleware.ts')
        const YONLENDIRME_KAYNAKLARI = govde(NEXT_CONFIG) + '\n' + govde(MIDDLEWARE)
        for (const arac of ARACLAR) {
            const desen = new RegExp(`hesaplayicilar/${arac}`, 'i')
            expect(
                desen.test(YONLENDIRME_KAYNAKLARI),
                `next.config.mjs YA DA src/middleware.ts "${arac}" aracini YONLENDIRIYOR (ikisi de ` +
                    'tarandi, hangisinde oldugunu o dosyalarda "hesaplayicilar/' + arac + '" arayarak ' +
                    'bul). Karar metnindeki "dort yol tek yola ' +
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

    it('⭐HALKA KAPANIYOR — araçtan çıkış Ürün Seçici’ye döner, ham yol yok', () => {
        // NİÇİN (REC-148 B2/B3): giriş Ürün Seçici, çıkış "/products" idi — ikinci aracı
        // denemek isteyen ziyaretçi seçiciye dönemiyordu. Üstelik o yol DİL ÖNEKSİZ ham
        // yoldu; aynı sayfadaki diğer bağlantılar /tr/... taşırken bu taşımıyordu
        // (CLAUDE.md kural 7). İkisi de sessiz kusurdu: sayfa açılıyor, kimse fark etmiyor.
        const LAYOUT = govde(oku('src', 'components', 'calculators', 'CalculatorLayout.tsx'))
        expect(
            LAYOUT.includes('Routes.urunSecici()'),
            'Hesaplayici layout varsayilan geri yolu Urun Secici DEGIL. Halka kapanmazsa ziyaretci ' +
                'ikinci araci denemek icin yolu bastan aramak zorunda kalir.',
        ).toBe(true)
        expect(
            /backLink\s*=\s*'\/products'/.test(LAYOUT),
            "Varsayilan geri yol hala ham '/products'. Dil oneksiz ham yol kural 7 ihlalidir ve " +
                'ziyaretciye fazladan yonlendirme yedirir.',
        ).toBe(false)
    })

    it('⭐Bilgi Merkezi “yakında” VAAT ETMİYOR — var olanı yok gösteremez', () => {
        // NİÇİN: 2026-09-05'e kadar Bilgi Merkezi'nde İKİ vaat kutusu duruyordu —
        // "Hesaplayıcılar Yakında" (geliştirme aşamasında rozetiyle) ve "Ürün Seçici Yakında"
        // (planlama aşamasında). İKİSİ DE YALANDI: dört hesaplayıcı canlıda çalışıyordu ve
        // Ürün Seçici aynı gün yayına girdi. Recep yakaladı: "ikilik üçlük olmamalı".
        // K1: "'Yakında', boş dal, vaat kutusu YOK; vitrin yalnız var olanı gösterir."
        const HUB = oku('src', 'views', 'knowledge', 'HubPage.tsx')
        for (const olu of ['calculatorsSoon', 'selectorSoon', 'inDevelopment', 'inPlanning']) {
            expect(
                govde(HUB).includes(olu),
                `Bilgi Merkezi yeniden "${olu}" anahtarini kullaniyor. Bu anahtarlar VAR OLAN bir ` +
                    'yetenegi "yakinda" diye ilan ediyordu ve kaldirildi. Geri gelirse ayni celiski ' +
                    'dogar: ana sayfa Urun Secici ye goturur, Bilgi Merkezi "planlaniyor" der.',
            ).toBe(false)
        }
        expect(
            govde(HUB).includes('Routes.urunSecici()'),
            'Bilgi Merkezi Urun Secici ye GERCEK bir baglanti vermiyor. Vaat kutusunun yerine ' +
                'calisan bir kapi kondu; kapi kaldirilirsa yetenek yine ulasilmaz olur.',
        ).toBe(true)
        for (const [ad, metin] of [['tr', TR], ['en', EN]] as const) {
            for (const olu of ['calculatorsSoon:', 'selectorSoon:', 'inDevelopment:', 'inPlanning:']) {
                expect(
                    metin.includes(olu),
                    `Sozluk (${ad}) "${olu}" anahtarini geri getirmis. Bu metinler iki yerde birden ` +
                        'tanimliydi (biri ekranda, biri olu); ikisi de silindi.',
                ).toBe(false)
            }
        }
    })

    it('⭐TEK AD — yetenek tek adla anılır, sekme başlığı dahil (K17)', () => {
        // NİÇİN (REC-148 B1, 2026-09-05): bu yeteneğin ONDAN fazla adı vardı. İkisi ölçüldü
        // ve düzeltildi; bu kol ikisinin de geri gelmesini engeller.
        //
        // (1) "Hesap Makinesi": Türkçede üç araç "… Hesaplayıcı" derken jet fan tek başına
        //     "Hesap Makinesi" diyordu. İngilizcede dördü de "Calculator" idi — ayrışma
        //     yalnız TR'deydi, bu yüzden parite kapısı da göremezdi (iki dilde de anahtar
        //     vardı, değerler farklı ayrışıyordu).
        // (2) "VentHub Mühendislik Araçları": her hesaplayıcı sayfasının SEKME başlığında
        //     duruyordu, sabit kodlu ve TÜRKÇE. Sayfanın gövdesinde görünmediği için hiçbir
        //     inceleme fark etmemişti; İngilizce ziyaretçi sekmesinde Türkçe ad görüyordu.
        const LAYOUT = govde(oku('src', 'components', 'calculators', 'CalculatorLayout.tsx'))

        expect(
            /Hesap Makinesi/.test(govde(TR)),
            'Sozlukte (tr) "Hesap Makinesi" geri gelmis. K17 tek ad: kardesleri "Hesaplayici" ' +
                'derken bir arac baska turlu adlandirilamaz.',
        ).toBe(false)

        expect(
            /Mühendislik Araçları/.test(LAYOUT),
            'Hesaplayici sayfasinin sekme basligina SABIT KODLU ad geri konmus. Iki kusur: ' +
                'yetenegin onuncu adi olur (K17) ve Turkce sabit, Ingilizce ziyaretcinin ' +
                'sekmesinde Turkce cikar (kural 7).',
        ).toBe(false)

        expect(
            LAYOUT.includes("t('urunSecici.ustBaslik')"),
            'Sekme basligi TEK ADI sozlukten almiyor. Ad koda yazilirsa dil ile birlikte ' +
                'degismez ve tekillik sessizce bozulur.',
        ).toBe(true)

        // ⭐SİTE ADI İKİ KEZ YAZILMAZ — önizlemede ölçülerek yakalandı (2026-09-05).
        // `Seo` bileşeni başlığın sonuna zaten "| VentHub" ekliyor. Bu satıra bir daha
        // "VentHub" yazmak "… | Ürün Seçici · VentHub | VentHub" üretiyordu: mükerrerliği
        // temizleyen PR'ın kendisi mükerrerlik getiriyordu. Ölçmeseydim inecekti.
        const seoBasligiSatiri = /title=\{`\$\{title\}[^`]*`\}/.exec(LAYOUT)?.[0] ?? ''
        expect(seoBasligiSatiri, 'Hesaplayici SEO baslik satiri BULUNAMADI — olcut kor.').not.toBe('')
        expect(
            /VentHub/.test(seoBasligiSatiri),
            'Hesaplayici SEO basligina site adi ELLE yazilmis. `Seo` zaten "| VentHub" ekliyor; ' +
                'ikisi birlesince sekmede site adi IKI KEZ cikar.',
        ).toBe(false)

        // ⭐KAPSAM TÜM `<Seo>` KULLANICILARINA GENİŞLETİLDİ (2026-09-05, OPS hükmü).
        // NİÇİN: yukarıdaki kol yalnız hesaplayıcıya bakıyordu ve aynı kusur canlıda BEŞ
        // yüzeyde daha duruyordu — "Hakkımızda | VentHub | VentHub", "Markalar | …",
        // "İletişim | …", "Bilgi, Mühendisliğin Ham Maddesidir | …" ve "Hava Perdesi |
        // VentHub Teknik Bilgi | VentHub" (sonuncusu ayrıca fazladan bir AD varyantıydı).
        // Tek dosyayı kilitlemek kusuru DEĞİL yalnız o dosyadaki örneğini kapatır.
        const SEO_KULLANICILARI = [
            ['src', 'views', 'AboutPage.tsx'],
            ['src', 'views', 'BrandsPage.tsx'],
            ['src', 'views', 'ContactPage.tsx'],
            ['src', 'views', 'BrandDetailPage.tsx'],
            ['src', 'views', 'knowledge', 'HubPage.tsx'],
            ['src', 'views', 'knowledge', 'TopicPage.tsx'],
            ['src', 'app', '_components', 'ProductDetailPageView.tsx'],
            ['src', 'components', 'calculators', 'CalculatorLayout.tsx'],
        ] as const
        const elleYazanlar: string[] = []
        let bulunanBaslikSayisi = 0
        for (const yol of SEO_KULLANICILARI) {
            const g = govde(oku(...yol))
            /**
             * ⭐ÖLÇÜT SATIR TEMELLİ — sabotajla düzeltildi (2026-09-05).
             *
             * İlk yazdığım desen `title=\{[^}]*\}` idi ve AYIRT ETMİYORDU: şablon dizesindeki
             * `${t('...')}` parçası kendi `}`'ini taşıyor, desen orada KESİLİYOR ve satırın
             * geri kalanındaki "| VentHub" hiç görülmüyordu. Sabotaj koştum (hesaplayıcı
             * DIŞINDA bir yüzeye site adını geri koydum) ve kol YEŞİL kaldı — yani gerçek
             * kusurda susacaktı. Bu depoda `title` prop'u tek satırda yazılıyor; satırın
             * tamamını okumak hem basit hem de iç içe süslü parantezden etkilenmiyor.
             */
            for (const satir of g.split(/\r?\n/)) {
                if (!satir.includes('title={')) continue
                bulunanBaslikSayisi++
                if (/VentHub/.test(satir)) elleYazanlar.push(`${yol.join('/')} · ${satir.trim()}`)
            }
        }
        expect(
            elleYazanlar,
            'SEO basligina site adi ELLE yazilmis. `Seo` bileseni sonuna zaten "| VentHub" ' +
                'ekliyor; ikisi birlesince sekmede ve arama sonucunda site adi IKI KEZ cikar:\n' +
                elleYazanlar.join('\n'),
        ).toEqual([])
        // BOŞLUK MUHAFIZI: dosya adları değişirse ya da regex tutmazsa liste boş kalır ve
        // kol sessizce yeşil verirdi. Kaç başlık gerçekten görüldüğü ÖLÇÜLÜR.
        expect(
            bulunanBaslikSayisi,
            'Hicbir `title={...}` bulunamadi — tarayici kor, kol sahte-yesil verir.',
        ).toBeGreaterThan(4)

        // AYIRT EDİCİ: ölçüt gerçekten TR sözlüğüne bakıyor mu — dosya boş/kırık gelirse
        // üstteki iki "false" beklentisi sahte-yeşil verirdi.
        expect(govde(TR).includes('Hesaplayıcı'), 'TR sozlukte hicbir "Hesaplayici" yok — tarayici kor.').toBe(true)
    })

    it('⭐KART ÜST BAŞLIĞI ÇİZİLİYOR — tek ad ana sayfada görünür (B5)', () => {
        // NİÇİN: sözlükte üç kartın da `eyebrow` alanı vardı ama bileşenin props tipi
        // yalnız title+description kabul ediyordu; üçü de HİÇ çizilmiyordu ve derleyici
        // susuyordu (fazla alan taşıyan nesneyi dar tipe geçirmek hata değildir).
        // Sonuç: K17'nin tek adı "Ürün Seçici" ana sayfada hiçbir yerde görünmüyordu.
        const g = govde(ANA_SAYFA_BLOK)
        // ⭐ÖLÇÜT `items` TİPİNİN İÇİNE BAKAR — sabotajla düzeltildi (2026-09-05):
        // ilk yazdığım ölçüt düz `eyebrow: string` arıyordu ve AYIRT ETMİYORDU, çünkü
        // aynı dize props tipinin ÜST DÜZEYİNDE de var (bölümün kendi üst başlığı,
        // `t.eyebrow`). Kart alanını silip sabotaj koştuğumda kol AYAKTA KALDI — yani
        // gerçek kusurda yeşil verirdi. Ölçüt artık `items` kaydının gövdesini okur.
        const itemsTipi = /items:\s*Record<string,\s*\{([^}]*)\}/.exec(g)?.[1] ?? ''
        expect(
            /\beyebrow\s*:\s*string/.test(itemsTipi),
            'KnowledgeBlock props tipinde KART kaydi (`items`) `eyebrow` alanini KABUL ETMIYOR — ' +
                'sozlukteki ad yine olu kalir ve kimse fark etmez (tip hatasi vermez).',
        ).toBe(true)
        expect(
            /\.eyebrow\b/.test(g.split('interface KnowledgeBlockProps')[1] ?? ''),
            'Kart `eyebrow` degeri hicbir yerde OKUNMUYOR — tipe eklemek tek basina cizmez.',
        ).toBe(true)
        expect(
            /eyebrow:\s*'Ürün Seçici'/.test(TR),
            'TR sozlukte Urun Secici kartinin ust basligi YOK — cizilecek ad kalmaz.',
        ).toBe(true)
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
