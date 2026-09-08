import fs from 'node:fs'
import path from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV-ALTGRUP-GORSEL-1 — "Alt Ürün Grupları" kartı, kategori görselini OKUMAYI bırakamaz.
 *
 * NİÇİN (REC-291, Recep isteği: *"görselli olması lazım bence"*).
 * ÖLÇÜM (canlı `/tr/category/fanlar`, hiç sorulmamış adres): sayfada 18 storage görseli
 * vardı ama **"Alt Ürün Grupları" bölümünde `<img>` 0, `background-image` 0** — bölüm yalnız
 * ikon + başlık + metin çiziyordu. Oysa `categories.image_url` o alt kategorilerin **10'unda
 * DOLU**. Yani veri hazırdı, eksik olan onu okuyan karttı.
 *
 * ⭐KUSURUN SINIFI, VE BU KAPININ ASIL SEBEBİ: "veride var" ile "ekranda görünür" ayrı
 * iddialardır. Bu, filoda aynı gün ÜÇÜNCÜ kez yaşandı (aile taşıma · kategori görseli · bu).
 * Bir alanın DB'de dolu olması, hiçbir yüzeyin onu okuduğunu kanıtlamaz — ve okumayı bırakan
 * kod SESSİZDİR: hata vermez, test kırmaz, yalnız kart boşalır.
 *
 * ── BU KAPININ SINIRI, ADIYLA ──
 * Kapı KAYNAK KODU okur (AST): kartın `image_url` alanına dokunduğunu ve bir görsel bileşeni
 * çizdiğini ölçer. **Görselin canlıda GERÇEKTEN göründüğünü ölçmez** — onu yalnız canlı
 * ölçüm söyler (`<img>` sayısı = görseli olan alt kategori sayısı), ve o REC-291'in kabul
 * ölçütünde ayrıca yazılı. Bu kapı yeşilken bile bir CSS kuralı görseli gizleyebilir.
 */

const DOSYA = path.join(process.cwd(), 'src', 'views', 'category', 'CategoryShowcaseView.tsx')
const kaynak = (): string => fs.readFileSync(DOSYA, 'utf8')

const agac = (src: string) =>
  ts.createSourceFile('x.tsx', src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

/**
 * AST — metin taraması DEĞİL. Sebebi ölçülerek öğrenildi: bugün bu depoda bir kapı, kendi
 * gerekçe YORUMUNU ihlal saydı (`kategori-rotasi-statik`), `kategori-adi-tek-kaynak` de aynı
 * dersi yazmış. Yorum kod değildir; AST yorum düğümü üretmez.
 */
function ozellikErisimleri(src: string): Set<string> {
  const bulunan = new Set<string>()
  const gez = (n: ts.Node): void => {
    if (ts.isPropertyAccessExpression(n)) bulunan.add(n.name.text)
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return bulunan
}

/** JSX'te kullanılan eleman adları (`<VentImage .../>` → "VentImage"). */
function jsxElemanlari(src: string): Set<string> {
  const bulunan = new Set<string>()
  const gez = (n: ts.Node): void => {
    if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
      bulunan.add(n.tagName.getText())
    }
    ts.forEachChild(n, gez)
  }
  gez(agac(src))
  return bulunan
}

describe('INV-ALTGRUP-GORSEL-1 — alt grup kartı kategori görselini okur', () => {
  it('K1 (ön-koşul) — dosya duruyor ve alt grup bölümünü çiziyor', () => {
    expect(fs.existsSync(DOSYA), `dosya yok: ${DOSYA}`).toBe(true)
    expect(
      kaynak().includes('category.showcase.subGroups'),
      'Alt Ürün Grupları başlığı bu dosyada değil — kapının evreni kaymış, aşağıdaki kollar ' +
        'yanlış dosyayı ölçüyor olurdu.',
    ).toBe(true)
  })

  it('K2 (kural) — kart `image_url` alanını OKUYOR', () => {
    expect(
      ozellikErisimleri(kaynak()).has('image_url'),
      'Kart artık `image_url` okumuyor. Veri DB\'de dolu kalır, kart boş görünür ve HİÇBİR ' +
        'hata çıkmaz — REC-291\'in kapattığı kusurun ta kendisi.',
    ).toBe(true)
  })

  it('K3 (kural) — bir görsel bileşeni çiziliyor', () => {
    const elemanlar = jsxElemanlari(kaynak())
    expect(
      elemanlar.has('VentImage') || elemanlar.has('Image') || elemanlar.has('img'),
      'Görsel bileşeni kaldırılmış. `image_url` okunuyor olsa bile ekrana hiçbir şey çizilmez.',
    ).toBe(true)
  })

  it('K4 (ayırt edicilik) — AST çözücüleri GERÇEKTEN yakalıyor, kapı boş değil', () => {
    // ⭐BU KOL KAPININ KENDİSİNİ SINAR. K2/K3 yeşilse sebebi "kural tutuyor" olabileceği gibi
    // "çözücü hiçbir şeyi eşleştirmiyor" da olabilir — ikisi dışarıdan AYNI görünür.
    const dolu = `const a = sub.image_url; const el = <VentImage src={a} alt="" fill />`
    expect(ozellikErisimleri(dolu).has('image_url'), 'özellik çözücüsü ölü').toBe(true)
    expect(jsxElemanlari(dolu).has('VentImage'), 'JSX çözücüsü ölü').toBe(true)

    // ⭐VE TERSİ: yalnız YORUMDA geçen ad, ihlal/uygunluk sayılmamalı.
    const yalnizYorum = `// eskiden sub.image_url okunurdu ve <VentImage/> çizilirdi\nconst x = 1`
    expect(ozellikErisimleri(yalnizYorum).has('image_url'), 'AST yorumu kod sandı').toBe(false)
    expect(jsxElemanlari(yalnizYorum).has('VentImage'), 'AST yorumu JSX sandı').toBe(false)
  })

  it('K5 (hüküm kilidi) — görseli OLMAYAN kategoriye yer tutucu BASILMAZ', () => {
    // ⭐BU KOL BİR KURALI DEĞİL BİR HÜKMÜ kilitler (REC-291, benim kararım):
    // `VentImage` görsel bulunamayınca `category-placeholder.png` basar. Onu koşulsuz
    // çizmek, hangi kategorinin görseli eksik olduğunu EKRANDA GÖRÜNMEZ yapar — bugün
    // 10/13'ün dolu olması sorunu ucuz sanmaya yol açar. Bu yüzden görsel bloğu
    // `image_url` doluyken çizilir; boşsa kart ikon düzeninde kalır.
    //
    // Ölçüm: görsel bileşeni bir KOŞULLU ifadenin içinde mi, ve o koşul `image_url`'e mi bakıyor?
    //
    // ⭐BU KOL İLK YAZIŞTA SABOTAJDAN GEÇTİ, ve sebebi kayda değer: koşulu `n.getText()` ile
    // metin olarak arıyordum. `getText()` düğümün kaynak ARALIĞINI döndürür — YORUMLAR DAHİL.
    // Yani AST kullanmama rağmen yorumdaki "image_url" kelimesi kolu yeşil tutuyordu.
    // Sabotaj (`{sub.image_url ?` → `{true ?`) K6'yı kırdı ama bunu KIRAMADI.
    // DERS: AST'ye geçmek yetmez; `getText()` çağıran her ölçüm metin taramasına GERİ DÖNER.
    // Doğrusu düğümün KENDİSİNİ gezmek — aşağıda koşul ifadesinin içindeki özellik
    // erişimlerine bakılıyor, metnine değil.
    const src = kaynak()
    let kosulluCizim = false
    const gez = (n: ts.Node): void => {
      if (kosulluCizim) return
      if (ts.isConditionalExpression(n)) {
        let kosulImageUrl = false
        const kosulGez = (k: ts.Node): void => {
          if (ts.isPropertyAccessExpression(k) && k.name.text === 'image_url') kosulImageUrl = true
          ts.forEachChild(k, kosulGez)
        }
        kosulGez(n.condition)

        let dalGorsel = false
        const dalGez = (d: ts.Node): void => {
          if (
            (ts.isJsxOpeningElement(d) || ts.isJsxSelfClosingElement(d)) &&
            ['VentImage', 'Image', 'img'].includes(d.tagName.getText())
          ) {
            dalGorsel = true
          }
          ts.forEachChild(d, dalGez)
        }
        dalGez(n.whenTrue)

        if (kosulImageUrl && dalGorsel) kosulluCizim = true
      }
      ts.forEachChild(n, gez)
    }
    gez(agac(src))
    expect(
      kosulluCizim,
      'Görsel bloğu artık `image_url` koşuluna bağlı değil. Görseli olmayan kategoriye yer ' +
        'tutucu basılır ve eksik veri ekranda görünmez olur. Yer tutucu istenmiyorsa koşul ' +
        'korunur; isteniyorsa bu HÜKÜM önce REC-291\'de değiştirilir, sonra bu kol.',
    ).toBe(true)
  })

  it('K6 (erişilebilirlik) — görsel DEKORATİF, kategori adını ikinci kez okutmuyor', () => {
    // WCAG 1.1.1 (REC-268'de canlıda ölçülmüş sınıf): kategori adı hemen altındaki `h3`'te
    // zaten yazıyor. Görsele aynı adı `alt` olarak vermek ekran okuyucuya AYNI ŞEYİ İKİ KEZ
    // okutur. Bu yüzden `alt=""` + `aria-hidden`.
    const src = kaynak()
    let altBos = false
    const gez = (n: ts.Node): void => {
      if (altBos) return
      if (ts.isJsxSelfClosingElement(n) && n.tagName.getText() === 'VentImage') {
        const govde = n.getText()
        if (/alt=""/.test(govde) && /image_url|src=\{sub\./.test(govde)) altBos = true
      }
      ts.forEachChild(n, gez)
    }
    gez(agac(src))
    expect(
      altBos,
      'Alt grup kartındaki görsel `alt=""` değil. Kategori adı `h3`\'te zaten yazdığı için ' +
        'görsele ad vermek mükerrer okuma üretir (WCAG 1.1.1, REC-268).',
    ).toBe(true)
  })
})
