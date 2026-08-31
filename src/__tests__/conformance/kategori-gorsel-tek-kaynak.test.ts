/**
 * INV-KATEGORI-GORSEL-1 — kategori görseli adresi TEK YERDE kurulur.
 *
 * NİÇİN VAR (ölçülmüş vaka, 2026-08-30):
 * `categories.image_url` alanı vitrinde ÜÇ FARKLI biçimde yorumlanıyordu — biri ham
 * kullanıyor, ikisi `category-images` deposuyla sarıyor, biri de yanlışlıkla
 * `product-images` deposuyla sarıyordu. Canlı veri ölçüldü: dolu olan iki kayıt
 * YEREL DOSYA YOLU taşıyor (`/images/products/...`), yani depo önekiyle saranlar
 * `.../category-images//images/products/air-curtain.png` gibi çift eğik çizgili,
 * 404 dönen adres üretiyordu. Kusur bugüne dek GÖRÜNMEDİ çünkü 37 kategorinin
 * 35'inde alan boştu ve null kontrolleri görseli hiç çizmiyordu — yani veri
 * girildiği anda dört yüzey birden bozulacaktı.
 *
 * KAPI NEYİ ZORLAR: vitrin kodunda Supabase Storage genel-nesne adresi ELLE
 * kurulamaz; `resolveCategoryImageUrl` (ya da ürün tarafında `productImage`)
 * çağrılır. Böylece biçim kararı tek dosyada kalır ve oradaki bir düzeltme
 * bütün yüzeylere yansır.
 *
 * ⭐YÖNTEM — AST, metin taraması DEĞİL: dosyayı düz metin olarak tarayan bir kapı,
 * bu kuralı AÇIKLAYAN yorum satırlarını ihlal sayardı (aynı hatayı INV-TOKEN-SINIF-1'in
 * ilk sürümünde yaptım ve kapı kendi gerekçe yorumumu yakaladı). Burada yalnızca
 * STRING ve TEMPLATE literal düğümleri okunur; yorumlar AST düğümü değildir, bu yüzden
 * doğal olarak kapsam dışıdır.
 *
 * KAPSAM SINIRI (bilinçli, gizlenmiyor): yalnızca vitrin. `src/views/admin/**` HARİÇ —
 * o dosyalar ADMIN şeridinin claim'inde; orada da aynı kopya deseni var (ölçüldü:
 * CategoriesTableBody + ProductsTableBody) ve OPS'a ayrı bulgu olarak bildirildi.
 * Bu kapı onları yakalamaz; yakalıyormuş gibi de göstermez.
 */
import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const DEPO_IZI = 'storage/v1/object/public'

/** Adres kurma YETKİSİ olan dosyalar — tek kaynak burasıdır. */
const YETKILI = [
  'src/lib/images/categoryImage.ts',
  'src/lib/images/productImage.ts',
  'src/utils/imageUtils.ts',
]

/** Başka şeridin claim'i — bu kapı onlar hakkında hüküm vermez (yukarıdaki kapsam notu). */
const KAPSAM_DISI_DIZIN = ['src/views/admin/', 'src/components/admin/']

/**
 * Test dosyaları hariç — ÖLÇÜLEREK eklendi, peşinen değil: ilk koşumda kapı
 * `src/utils/__tests__/imageNormalization.test.ts` içindeki ÜÇ beklenen-değer dizesini
 * ihlal saydı. O dizeler kuralın ihlali değil, kuralın DOĞRULANDIĞI yer — bir
 * normalleştirme testinin beklenen çıktısı zorunlu olarak tam adresi içerir.
 * Sınır `__tests__/` dizinine değil DOSYA ADINA bakar; test dosyaları kaynak
 * ağacının her yerinde durabiliyor (ilk sürüm yalnız `src/__tests__/` diyordu ve
 * o yüzden bu üçünü kaçırmadı — YAKALADI, ki bu da kapının çalıştığının kanıtı).
 */
const testDosyasiMi = (goreli: string): boolean =>
  /\.(test|spec)\.tsx?$/.test(goreli) || goreli.includes('/__tests__/')

function taranacakDosyalar(dizin: string, biriken: string[] = []): string[] {
  for (const girdi of fs.readdirSync(dizin, { withFileTypes: true })) {
    const tam = path.join(dizin, girdi.name)
    const goreli = path.relative(KOK, tam).split(path.sep).join('/')
    if (girdi.isDirectory()) {
      if (girdi.name === 'node_modules' || girdi.name.startsWith('.')) continue
      taranacakDosyalar(tam, biriken)
      continue
    }
    if (!/\.(ts|tsx)$/.test(girdi.name)) continue
    if (KAPSAM_DISI_DIZIN.some(d => goreli.startsWith(d))) continue
    if (testDosyasiMi(goreli)) continue
    if (YETKILI.includes(goreli)) continue
    biriken.push(goreli)
  }
  return biriken
}

/**
 * Dosyadaki metin-değeri düğümlerinden depo adresi kuranları döndürür.
 * SAF fonksiyon — testten bağımsız çağrılabilir (ayırt edicilik kolu bunu kullanır).
 */
export function depoAdresiKuranlar(kaynak: string, dosyaAdi = 'x.tsx'): string[] {
  const agac = ts.createSourceFile(dosyaAdi, kaynak, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const bulunan: string[] = []

  const gez = (dugum: ts.Node): void => {
    const metinDugumu =
      ts.isStringLiteral(dugum) ||
      ts.isNoSubstitutionTemplateLiteral(dugum) ||
      ts.isTemplateHead(dugum) ||
      ts.isTemplateMiddle(dugum) ||
      ts.isTemplateTail(dugum)

    if (metinDugumu && dugum.text.includes(DEPO_IZI)) {
      const satir = agac.getLineAndCharacterOfPosition(dugum.getStart(agac)).line + 1
      bulunan.push(`${satir}: ${dugum.text.trim().slice(0, 80)}`)
    }
    ts.forEachChild(dugum, gez)
  }

  gez(agac)
  return bulunan
}

describe('INV-KATEGORI-GORSEL-1 · depo adresi tek yerde kurulur', () => {
  it('ÖN KOŞUL — yetkili dosyalar GERÇEKTEN var ve deseni içeriyor', () => {
    // Bu kol olmadan kapı "hiçbir yerde yok" diye sahte-yeşil verebilir: yetkili
    // dosyalar silinse/yeniden adlandırılsa tarama boş küme üzerinde çalışırdı.
    const desenTasiyan = YETKILI.filter(y => {
      const tam = path.join(KOK, y)
      return fs.existsSync(tam) && fs.readFileSync(tam, 'utf8').includes(DEPO_IZI)
    })
    expect(desenTasiyan.length).toBeGreaterThan(0)
  })

  it('AYIRT EDİCİ — ihlali YAKALAR, açıklayan yorumu yakalamaz', () => {
    const ihlal = `
      const u = \`\${base}/storage/v1/object/public/category-images/\${x}\`
    `
    expect(depoAdresiKuranlar(ihlal)).toHaveLength(1)

    // Aynı dizeyi ANLATAN yorum ihlal DEĞİLDİR — kapının kendi gerekçesi kırmızı vermemeli.
    const yorum = `
      // adres deseni: /storage/v1/object/public/category-images/<dosya>
      /* storage/v1/object/public — burada elle kurulmaz */
      const u = resolveCategoryImageUrl(x)
    `
    expect(depoAdresiKuranlar(yorum)).toHaveLength(0)

    // Depoyla ilgisiz metinler de sessiz kalmalı (yanlış-pozitif kontrolü).
    expect(depoAdresiKuranlar(`const s = 'public/images/foo.png'`)).toHaveLength(0)
  })

  it('⭐DEPO — vitrin kodunda elle kurulmuş depo adresi YOK', () => {
    const ihlaller: string[] = []

    for (const goreli of taranacakDosyalar(path.join(KOK, 'src'))) {
      const icerik = fs.readFileSync(path.join(KOK, goreli), 'utf8')
      if (!icerik.includes(DEPO_IZI)) continue // hızlı eleme; hüküm AST'ten
      for (const bulgu of depoAdresiKuranlar(icerik, goreli)) {
        ihlaller.push(`${goreli}:${bulgu}`)
      }
    }

    expect(
      ihlaller,
      'Depo adresi ELLE kurulmuş. Bu biçim kararı tek dosyada durmalı, yoksa oradaki ' +
        'düzeltme bu yüzeye yansımaz.\nÇÖZÜM: resolveCategoryImageUrl (kategori) veya ' +
        'resolveProductImageUrl (ürün) çağır.\nİHLALLER:\n' +
        ihlaller.join('\n'),
    ).toEqual([])
  })
})
