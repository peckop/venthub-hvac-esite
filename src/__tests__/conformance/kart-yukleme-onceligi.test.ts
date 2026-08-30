import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-KART-ONCELIK-1 — liste kartı render eden HER çağrı, görsel yükleme önceliğini
 * AÇIKÇA yazar. Sessiz varsayılana bırakmak yasaktır.
 *
 * Cetvel: `docs/standards/storefront-reflow-standard.md` §R9 (Yükleme önceliği ve yer tutucu).
 *
 * NİÇİN VAR (REC-89, 5. kalem — Recep canlı vitrinde bildirdi):
 * Müşteri ürün listesinde "ilk sekiz geldi, sonraki dörtlü şerit boş kaldı, ondan
 * sonraki daha erken geldi" diye tarif etti. Ölçüldü: 42 görselin 42'si `lazy`,
 * hiçbirinde `priority`/`fetchpriority` yok.
 *
 * ⭐ASIL KUSUR SINIFI "BİLİNMİYOR" DEĞİL, "BİR YERDE UYGULANMIŞ ALTI YERDE UNUTULMUŞ":
 * `FamilyCard` `priority` desteğini ZATEN taşıyor ve `SeriesLandingView` onu kullanıyordu;
 * aynı kart altı başka yerde önceliksiz çağrılıyordu. Kural yazılı olmadığı için hiçbir
 * kapı görmedi — tsc ve ESLint için eksik prop, varsayılanı olan opsiyonel bir proptur.
 *
 * NİÇİN "prop VAR MI" DİYE SORUYOR, "true MU" DEMİYOR:
 * Doğru değer sayfaya göre değişir ve cetvel bunu FOLD ÜSTÜ ölçütüne bağlar (§R7) —
 * fold üstünde kart yoksa doğru cevap `false`'tur. Ölçüldü: `/tr/products` ilk kart
 * 928 px, `/tr/category/kanal-tipi-fanlar` 7960 px, `/tr/products/vortice-lineo-quiet`
 * 4151 px aşağıda; üçünde de fold üstü kart SIFIR. Yani bu kapı "hep true olsun"
 * diyemez; diyebileceği şey KARARIN YAZILMIŞ olmasıdır. Sabit bir sayıyı (eski
 * `index < 4` reçetesi) zorlamak, sayfa düzeni değişince sessizce yanlışa döner.
 *
 * KAPSAM SINIRI, AÇIKÇA: bu kapı yalnız `FamilyCard` JSX çağrılarını okur. Kartın
 * kendi içindeki iki render dalının (liste/ızgara) priority'yi görsele GERÇEKTEN
 * iletip iletmediğini ölçmez — bu, davranış katmanıdır ve ölçülmemiş bir gözlem
 * olarak kayıtlıdır: canlıda ızgara dalındaki dört kartın dördü de `priority` verili
 * olmasına rağmen `lazy` geldi. Sebebi bu turda kesinleştirilemedi; hüküm yazmıyoruz,
 * olguyu adıyla bırakıyoruz.
 */

const KOK = process.cwd()

/** Kartın adı — kural bu bileşene bağlı. */
const KART = 'FamilyCard'

function tsxDosyalari(kok: string): string[] {
  const cikti: string[] = []
  const yur = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) {
        if (!/node_modules|\.next|\.git|__tests__/.test(p)) yur(p)
      } else if (e.name.endsWith('.tsx')) cikti.push(p)
    }
  }
  yur(path.join(kok, 'src'))
  return cikti
}

interface Cagri {
  dosya: string
  satir: number
  priorityVar: boolean
}

/** Bir dosyadaki tüm `<FamilyCard ... />` çağrılarını ve priority prop'unun varlığını döner. */
export function kartCagrilari(dosya: string, icerik: string): Cagri[] {
  const sf = ts.createSourceFile(dosya, icerik, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const bulunan: Cagri[] = []

  const dolas = (n: ts.Node): void => {
    const etiket = ts.isJsxSelfClosingElement(n) || ts.isJsxOpeningElement(n) ? n.tagName.getText(sf) : null
    if (etiket === KART) {
      const el = n as ts.JsxSelfClosingElement | ts.JsxOpeningElement
      let priorityVar = false
      for (const a of el.attributes.properties) {
        // Yayılım (`{...props}`) prop'u gizleyebilir; onu da "yazılmış karar" saymıyoruz,
        // çünkü okuyan kişi kararı GÖREMEZ — kuralın amacı görünürlüktür.
        if (ts.isJsxAttribute(a) && a.name.getText(sf) === 'priority') priorityVar = true
      }
      bulunan.push({
        dosya,
        satir: sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1,
        priorityVar,
      })
    }
    n.forEachChild(dolas)
  }
  dolas(sf)
  return bulunan
}

describe('INV-KART-ONCELIK-1 — kart çağrılarında yükleme önceliği yazılı', () => {
  const dosyalar = tsxDosyalari(KOK)
  const tumCagrilar: Cagri[] = []
  for (const d of dosyalar) {
    const icerik = fs.readFileSync(d, 'utf8')
    if (!icerik.includes(`<${KART}`)) continue
    tumCagrilar.push(...kartCagrilari(d, icerik))
  }

  it('ÖN KOŞUL — tarama gerçekten çağrı buldu (boş küme sahte yeşil üretirdi)', () => {
    // Bu kol olmadan seçici bayatlarsa (kart yeniden adlandırılır) test SESSİZCE yeşil
    // kalırdı: "hiç çağrı yok, o hâlde ihlal de yok". Sıfır bulgu, geçme sebebi değildir.
    expect(tumCagrilar.length, `${KART} çağrısı bulunamadı — seçici bayatlamış olabilir`).toBeGreaterThan(3)
  })

  it('AYIRT EDİCİ — ölçüt yazılmış kararı geçirir, yazılmamışı yakalar', () => {
    const yazilmis = kartCagrilari('x.tsx', 'const a = <FamilyCard family={f} priority={false} />')
    const yazilmamis = kartCagrilari('x.tsx', 'const a = <FamilyCard family={f} layout="grid" />')
    expect(yazilmis[0]?.priorityVar, 'açıkça yazılmış priority yakalanmalıydı').toBe(true)
    expect(yazilmamis[0]?.priorityVar, 'yazılmamış priority geçirildi — ölçüt kör').toBe(false)
  })

  it(`HER ${KART} çağrısı priority değerini AÇIKÇA verir`, () => {
    const eksik = tumCagrilar
      .filter((c) => !c.priorityVar)
      .map((c) => `${path.relative(KOK, c.dosya).replace(/\\/g, '/')}:${c.satir}`)

    expect(
      eksik,
      'Bu çağrılarda görsel yükleme önceliği kararı YAZILMAMIŞ. Cetvel §R7/§R9: karar ' +
        'fold üstü ölçütüne göre verilir ve açıkça yazılır — fold üstünde kart yoksa ' +
        'doğru cevap priority={false} olabilir, ama SESSİZ varsayılan kabul edilmez.',
    ).toEqual([])
  })
})
