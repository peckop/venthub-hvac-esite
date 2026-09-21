import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-SOZLUK-1 — `admin.*` sözlük anahtarı, admin olmayan bir dosyada kullanılamaz.
 *
 * NİÇİN VAR — saha ölçümü (2026-09-18, REC-59):
 * Her müşteri sayfasının HTML'ine gömülü sözlüğün %46-65'i ölü ağırlıktı ve içinde admin
 * panelinin 1008 anahtarı vardı. Paket ölçümü: `static/chunks/7681-*.js` = 348 KB, içinde
 * admin bloğu ~68,7 KB (%19,3) ve 901 anahtarın TAMAMI; iki ayrı ürün sayfası da bu paketi
 * indiriyordu. Yani müşteri, hiç görmeyeceği yönetim ekranının yazılarını her sayfada
 * indiriyor.
 *
 * Admin sözlüğünü vitrin paketinden ayırmanın (karar 47 / Faz 2) önündeki TEK engel küçüktü:
 * `admin.*` anahtarını kullanan 119 dosyanın yalnız **2**'si admin dışındaydı ve topu topu
 * **4** anahtar kullanıyordu — `admin.common.yes/no` (EnhancedNeedsWizard) ve
 * `admin.ui.edit/delete` (AccountAddressesPage). Dördünün de birebir karşılığı vitrin
 * sözlüğünde ZATEN vardı (`common.yes/no/edit/delete`), yani anahtar taşımak bile gerekmedi;
 * çağrı yerleri düzeltildi.
 *
 * ⭐BU KAPI O ONARIMI KALICI YAPAR. Onarım kapısız kalırsa, yarın bir vitrin bileşenine
 * `t('admin.common.yes')` yazan bir el Faz 2'yi sessizce geri kırar: kod derlenir, tip
 * kontrolü geçer, sözlük paritesi geçer, ekranda doğru yazı görünür — yalnız admin sözlüğü
 * vitrin paketine geri girer ve kimse fark etmez. Görünmeyen regresyon tam bu sınıftır.
 *
 * ⛔İKİ KOL, BİRİ MUAFİYETİ DENETLER:
 *  · 1. kol: admin olmayan dosyada `admin.*` kullanımı = KIRMIZI.
 *  · 2. kol: muafiyet listesindeki her dosya GERÇEKTEN admin kodu mu — yalnız admin
 *    yollarından (ya da testlerden) içe aktarılıyor mu? Muafiyet çürürse KIRMIZI.
 *    Sebep: k45'te elle muafiyet listesinin bedelini ölçtük — liste, kuralı yazılı bir
 *    borca çevirir ama kendini denetlemezse sessiz bir kapıya dönüşür.
 */

const PROJE_KOKU = join(__dirname, '..', '..', '..')
const KAYNAK_KOKU = join(PROJE_KOKU, 'src')

/** Admin paketine ait yollar — buradaki dosya `admin.*` kullanmakta serbesttir. */
const ADMIN_YOLLARI = [
  join('src', 'app', 'admin'), // admin rotalari — ilk yazimda ATLANMISTI, kapiyi kosturunca cikti
  join('src', 'views', 'admin'),
  join('src', 'components', 'admin'),
  join('src', 'lib', 'admin'),
  join('src', 'i18n', 'dictionaries', 'admin'),
]

/**
 * MUAF DOSYALAR — admin kodu oldukları HALDE admin yolunda durmayanlar.
 * Her satırın gerekçesi yazılı; 2. kol her koşumda gerekçeyi yeniden ölçer.
 */
const MUAF_DOSYALAR: Array<{ yol: string; gerekce: string }> = [
  {
    yol: join('src', 'hooks', 'useAdminTable.ts'),
    gerekce: 'Yalnız admin veri tablosu ekranlarından çağrılır (ölçüldü: 10+ içe aktaran, hepsi admin).',
  },
  {
    yol: join('src', 'hooks', 'useInventoryDetail.ts'),
    gerekce: 'Yalnız admin stok ekranından çağrılır (ölçüldü: InventoryTableBody + bir kapı testi).',
  },
]

/** Kapı kapsamı dışı: sözlüklerin kendisi ve test dosyaları. */
const KAPSAM_DISI_DESENLER = [
  join('src', 'i18n', 'dictionaries'),
  `${sep}__tests__${sep}`,
  join('src', '__tests__'),
  join('src', 'test'),
]

/**
 * ⚠DESEN NİÇİN İKİ BİÇİMİ BİRDEN TANIR: `t('admin.x')` anahtarı İLK argümanda taşır,
 * `getDictValue(dict, 'admin.x')` ise İKİNCİ argümanda. İlk yazımda yalnız birincisini
 * tanıyordum; çapa testi bunu yakaladı. Tek biçim tanıyan bir kapı, `getDictValue` kullanan
 * her vitrin dosyasına KÖR kalırdı ve yeşil yanarak "ihlal yok" derdi.
 */
const ADMIN_ANAHTAR_DESENI =
  /\b(?:t|getDictValue)\(\s*(?:[A-Za-z0-9_.[\]?]+\s*,\s*)?'(admin\.[A-Za-z0-9_.]+)'/g

function kaynakDosyalari(kok: string): string[] {
  const cikti: string[] = []
  for (const ad of readdirSync(kok)) {
    const tam = join(kok, ad)
    if (statSync(tam).isDirectory()) {
      if (ad === 'node_modules') continue
      cikti.push(...kaynakDosyalari(tam))
      continue
    }
    if (/\.(ts|tsx)$/.test(ad) && !/\.d\.ts$/.test(ad)) cikti.push(tam)
  }
  return cikti
}

function goreli(tam: string): string {
  return relative(PROJE_KOKU, tam)
}

function adminYolundaMi(goreliYol: string): boolean {
  return ADMIN_YOLLARI.some(p => goreliYol.startsWith(p))
}

function kapsamDisiMi(goreliYol: string): boolean {
  return KAPSAM_DISI_DESENLER.some(p => goreliYol.includes(p))
}

/**
 * Yorumları düşürür. ⚠NİÇİN GEREKLİ (2026-09-18, Faz 2'de ölçüldü): kapı, `I18nContext.ts`
 * içindeki bir AÇIKLAMA satırını ihlal saydı — orada `t('admin.users.title')` ifadesi örnek
 * olarak geçiyordu. Yorumdaki örnek pakete girmez, yani yanlış KIRMIZI'ydı. Yanlış kırmızı
 * da bedava değildir: kapıyı gürültülü yapar, gürültülü kapı da susturulur.
 */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
}

/** Bir metinde kullanılan admin anahtarlarını çıkarır. Saf fonksiyon — çapa testi bunu ölçer. */
export function adminAnahtarlari(kaynak: string): string[] {
  const bulunan = new Set<string>()
  for (const m of yorumsuz(kaynak).matchAll(ADMIN_ANAHTAR_DESENI)) bulunan.add(m[1])
  return [...bulunan].sort()
}

describe('INV-ADMIN-SOZLUK-1 · admin sözlüğü vitrin dosyasında kullanılmaz', () => {
  const dosyalar = kaynakDosyalari(KAYNAK_KOKU).map(goreli)

  it('1. KOL: admin olmayan hiçbir dosya admin.* anahtarı kullanmaz', () => {
    const muafYollar = MUAF_DOSYALAR.map(m => m.yol)
    const ihlaller: string[] = []

    for (const yol of dosyalar) {
      if (adminYolundaMi(yol) || kapsamDisiMi(yol) || muafYollar.includes(yol)) continue
      const anahtarlar = adminAnahtarlari(readFileSync(join(PROJE_KOKU, yol), 'utf8'))
      if (anahtarlar.length > 0) ihlaller.push(`${yol} → ${anahtarlar.join(', ')}`)
    }

    if (ihlaller.length > 0) {
      console.error(
        '[INV-ADMIN-SOZLUK-1] Admin sözlüğü anahtarı admin OLMAYAN dosyada kullanılmış.\n' +
          'Bu, admin sözlüğünü vitrin paketinden ayırma işini (karar 47) sessizce geri kırar.\n' +
          'ONARIM: anahtarın vitrin sözlüğündeki karşılığını kullan (ör. admin.common.yes → common.yes).\n' +
          'Karşılığı yoksa vitrin sözlüğüne EKLE; admin sözlüğünden çağırma.\n' +
          ihlaller.map(s => `  · ${s}`).join('\n')
      )
    }
    expect(ihlaller).toEqual([])
  })

  it('2. KOL: muafiyet listesindeki her dosya GERÇEKTEN yalnız admin kodundan çağrılıyor', () => {
    const bozukMuafiyet: string[] = []

    for (const { yol, gerekce } of MUAF_DOSYALAR) {
      const modulAdi = yol.split(sep).pop()!.replace(/\.tsx?$/, '')
      const vitrinIceAktaranlar = dosyalar.filter(d => {
        if (d === yol || kapsamDisiMi(d) || adminYolundaMi(d)) return false
        const kaynak = readFileSync(join(PROJE_KOKU, d), 'utf8')
        return new RegExp(`from\\s+'[^']*${modulAdi}'`).test(kaynak)
      })
      if (vitrinIceAktaranlar.length > 0) {
        bozukMuafiyet.push(
          `${yol} artık admin dışından da çağrılıyor (${vitrinIceAktaranlar.join(', ')}). Yazılı gerekçe: "${gerekce}"`
        )
      }
    }

    if (bozukMuafiyet.length > 0) {
      console.error(
        '[INV-ADMIN-SOZLUK-1 · 2. kol] Muafiyet ÇÜRÜDÜ: muaf dosya artık vitrinden de çağrılıyor,\n' +
          'yani admin sözlüğü dolaylı yoldan vitrin paketine giriyor.\n' +
          bozukMuafiyet.map(s => `  · ${s}`).join('\n')
      )
    }
    expect(bozukMuafiyet).toEqual([])
  })

  it('⭐ÇAPA: dedektör gerçekten yakalıyor (kör değil)', () => {
    // POZİTİF: admin anahtarı yakalanır
    expect(adminAnahtarlari("<div>{t('admin.common.yes')}</div>")).toEqual(['admin.common.yes'])
    expect(adminAnahtarlari("title={t('admin.ui.delete')}")).toEqual(['admin.ui.delete'])
    expect(adminAnahtarlari("getDictValue(dict, 'admin.inventory.toasts.undoSuccess')")).toEqual([
      'admin.inventory.toasts.undoSuccess',
    ])
    // NEGATİF: vitrin anahtarı yakalanmaz (kapı her şeyi reddetmiyor)
    expect(adminAnahtarlari("<div>{t('common.yes')}</div>")).toEqual([])
    expect(adminAnahtarlari("<div>{t('account.adminPanel')}</div>")).toEqual([])
    // YORUMDAKİ ÖRNEK ihlal DEĞİLDİR — pakete girmez (Faz 2'de yanlış kırmızı verdi)
    expect(adminAnahtarlari("// ornek: t('admin.users.title')")).toEqual([])
    expect(adminAnahtarlari("/* ornek: t('admin.users.title') yazilabilir */")).toEqual([])
    // ...ama yorumun YANINDAKİ gerçek kullanım hâlâ yakalanır
    expect(adminAnahtarlari("// aciklama\nconst x = t('admin.ui.edit')")).toEqual(['admin.ui.edit'])
  })

  it('⭐ÇAPA: onarılan dört çağrı yeri vitrin anahtarını kullanıyor', () => {
    const sihirbaz = readFileSync(
      join(PROJE_KOKU, 'src', 'components', 'category', 'EnhancedNeedsWizard.tsx'),
      'utf8'
    )
    const adresler = readFileSync(
      join(PROJE_KOKU, 'src', 'views', 'account', 'AccountAddressesPage.tsx'),
      'utf8'
    )
    expect(sihirbaz).toContain("t('common.yes')")
    expect(sihirbaz).toContain("t('common.no')")
    expect(adresler).toContain("t('common.edit')")
    expect(adresler).toContain("t('common.delete')")
    expect(adminAnahtarlari(sihirbaz)).toEqual([])
    expect(adminAnahtarlari(adresler)).toEqual([])
  })
})
