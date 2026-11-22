import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-MALIYET-OKUYUCU-1 · `products`'tan maliyet/tedarik kolonu OKUNMAZ (ALT-123; REC-140 plan §4 Faz 2-kod).
 *
 * NİÇİN: 8 maliyet/tedarik kolonu `authenticated` rolünün SELECT yetkisinden alınır; okuma `product_costs`'tan
 * (RLS: yalnız yönetici) yapılır. `products` üzerinde SELECT listesinde (açık liste, `*`, boş `select()`, gömme)
 * bu kolonlardan biri kalırsa canlıda "permission denied" ile patlar; bu kapı hatayı PR'da adıyla gösterir.
 * Varsayılan `select()` (argümansız) `*` demektir: `.update(...).select()` / `.insert(...).select()` döndürmesi de
 * kolonları ister, bu yüzden aynı şekilde yakalanır.
 *
 * YAZIM SERBEST: update/insert/upsert/delete yük anahtarları (`{ purchase_price: 1 }`) bu kapının konusu değildir;
 * yazımlar Faz 3'e kadar products üzerinden gider (INV-MALIYET-YAZICI-1). Kapı yalnız SELECT listesini ayrıştırır.
 * `product_costs(...)` gömmesinin İÇİ meşru okumadır (RLS yönetici dışına 0 satır verir) ve sayılmaz.
 *
 * İZİN LİSTESİ YOK. Okuyan bir yer gerçekten gerekliyse `product_costs` gömmesine çevrilir.
 * Kapsam: src/ (üretim kodu; __tests__ ve üretilmiş tipler hariç). Edge Functions ve betikler service_role'dür, dışarıda.
 */

const KOK = path.resolve(__dirname, '../../..')
const KOLONLAR = [
  'purchase_price',
  'purchase_currency',
  'purchase_rate_to_base',
  'cost_in_base',
  'last_purchase_cost',
  'last_purchase_currency',
  'last_purchased_at',
  'supplier_name',
] as const
const FILTRE_YONTEMLERI = new Set([
  'order', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'in', 'not', 'contains', 'match', 'filter',
])
const KOLON_RE =new RegExp(`\\b(${KOLONLAR.join('|')})\\b`)
const YILDIZ_RE = /(^|[\s,(])\*/
const COSTS_ACILIS_RE = /\bproduct_costs\s*(?:![\w]+)?\s*\(/
const PRODUCTS_GOMME_RE = /\bproducts\s*(?:![\w]+)?\s*\(/g

function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/^(\s*)(?<!:)\/\/.*$/gm, '$1')
}

/** `(` konumundan eşleşen `)` konumunu bulur; dizgeleri atlar. */
function eslesenParantez(s: string, acik: number): number {
  let derin = 0
  for (let i = acik; i < s.length; i++) {
    const c = s[i]
    if (c === "'" || c === '"' || c === '`') {
      const kapat = c
      i++
      while (i < s.length && s[i] !== kapat) {
        if (s[i] === '\\') i++
        i++
      }
    } else if (c === '(') derin++
    else if (c === ')') {
      derin--
      if (derin === 0) return i
    }
  }
  return -1
}

interface Cagri {
  yontem: string
  arg: string
}

/** `from('x')` çağrısından sonraki `.yontem(args)` zincirini çıkarır. */
function zincir(s: string, baslangic: number): Cagri[] {
  const out: Cagri[] = []
  let i = baslangic
  for (;;) {
    while (i < s.length && /\s/.test(s[i])) i++
    if (s[i] === '?' && s[i + 1] === '.') i++
    if (s[i] !== '.') break
    const m = /^\.\s*([A-Za-z_$][\w$]*)\s*(<[^()]*>)?\s*\(/.exec(s.slice(i, i + 200))
    if (!m) break
    const acik = i + m[0].length - 1
    const kapat = eslesenParantez(s, acik)
    if (kapat < 0) break
    out.push({ yontem: m[1], arg: s.slice(acik + 1, kapat) })
    i = kapat + 1
  }
  return out
}

/** Üst düzey ilk argüman (virgülden önce). */
function ilkArguman(arg: string): string {
  let derin = 0
  for (let i = 0; i < arg.length; i++) {
    const c = arg[i]
    if (c === "'" || c === '"' || c === '`') {
      const kapat = c
      i++
      while (i < arg.length && arg[i] !== kapat) {
        if (arg[i] === '\\') i++
        i++
      }
    } else if (c === '(' || c === '{' || c === '[') derin++
    else if (c === ')' || c === '}' || c === ']') derin--
    else if (c === ',' && derin === 0) return arg.slice(0, i)
  }
  return arg
}

/** src/ içindeki `const ADI = '...'` dizgeleri (select listesi sabitleri). */
function sabitHaritasi(dosyalar: Array<{ yol: string; govde: string }>): Map<string, string[]> {
  const harita = new Map<string, string[]>()
  const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*((?:'[^'\n]*'|"[^"\n]*"|`[^`]*`)(?:\s*\+\s*(?:'[^'\n]*'|"[^"\n]*"|`[^`]*`))*)/g
  for (const { govde } of dosyalar) {
    for (const m of govde.matchAll(re)) {
      const liste = harita.get(m[1]) ?? []
      liste.push(m[2])
      harita.set(m[1], liste)
    }
  }
  return harita
}

/** product_costs gömmelerini siler: gömmenin İÇİNDEKİ maliyet kolonları meşru okumadır. */
function costsGommesiz(metin: string): string {
  let out = metin
  for (;;) {
    const m = COSTS_ACILIS_RE.exec(out)
    if (!m) return out
    const acik = m.index + m[0].length - 1
    const kapat = eslesenParantez(out, acik)
    out = out.slice(0, m.index) + ' ' + (kapat < 0 ? '' : out.slice(kapat + 1))
  }
}

/** İlk argümanın çözülmüş metni: dizgeler olduğu gibi, tanımlayıcılar sabit haritasından. */
function secimMetni(ilk: string, sabitler: Map<string, string[]>): string {
  const t = ilk.trim()
  if (t === '') return '*' // argümansız select() = tüm kolonlar
  const parcalar: string[] = []
  for (const m of t.matchAll(/'[^'\n]*'|"[^"\n]*"|`[^`]*`/g)) parcalar.push(m[0])
  const govdeSiz = t.replace(/'[^'\n]*'|"[^"\n]*"|`[^`]*`/g, ' ')
  for (const m of govdeSiz.matchAll(/\b[A-Za-z_$][\w$]*\b/g)) {
    const cozum = sabitler.get(m[0])
    if (cozum) parcalar.push(...cozum)
  }
  return parcalar.join(' ')
}

/** `products` gömmesi: `products(...)`, `products!inner(...)`, `ad:products(...)`; parantez içi `*` ya da hassas kolon. */
function gommeIhlali(metin: string): string | null {
  for (const m of metin.matchAll(PRODUCTS_GOMME_RE)) {
    const acik = m.index + m[0].length - 1
    const kapat = eslesenParantez(metin, acik)
    const ic = costsGommesiz(metin.slice(acik + 1, kapat < 0 ? undefined : kapat))
    if (YILDIZ_RE.test(ic) || KOLON_RE.test(ic)) return `products(${ic.trim().slice(0, 60)})`
  }
  return null
}

/** Bir kaynakta ihlalleri döndürür (saf; sabotaj testleriyle sınanır). */
export function okuyucuIhlalleri(kaynak: string, sabitler: Map<string, string[]> = new Map()): string[] {
  const govde = yorumsuz(kaynak)
  const out: string[] = []

  // (1) from('products') zincirinin SELECT listesi
  for (const m of govde.matchAll(/\.from\(\s*['"`]products['"`]\s*\)/g)) {
    for (const c of zincir(govde, m.index + m[0].length)) {
      // Süzgeç ve sıralama kolonları da SELECT yetkisi ister (PostgREST): `.order('supplier_name')`, `.eq('cost_in_base', 1)`.
      if (FILTRE_YONTEMLERI.has(c.yontem)) {
        const kolon = /^\s*['"`]([a-z_]+)['"`]/.exec(ilkArguman(c.arg))?.[1]
        if (kolon && (KOLONLAR as readonly string[]).includes(kolon)) out.push(`from('products').${c.yontem}('${kolon}')`)
        continue
      }
      if (c.yontem !== 'select') continue
      const metin = costsGommesiz(secimMetni(ilkArguman(c.arg), sabitler))
      if (YILDIZ_RE.test(metin.replace(/['"`]/g, ' ')) || KOLON_RE.test(metin)) {
        out.push(`from('products').select(${metin.replace(/\s+/g, ' ').trim().slice(0, 90)})`)
      }
    }
  }

  // (2) başka tablonun SELECT listesinde products gömmesi (`*` ya da hassas kolon)
  for (const m of govde.matchAll(/\.select\(/g)) {
    const acik = m.index + m[0].length - 1
    const kapat = eslesenParantez(govde, acik)
    if (kapat < 0) continue
    const metin = secimMetni(ilkArguman(govde.slice(acik + 1, kapat)), sabitler)
    const ihlal = gommeIhlali(metin.replace(/['"`]/g, ' '))
    if (ihlal) out.push(`select içinde gömme ${ihlal}`)
  }
  return out
}

function kaynaklar(dizin: string): string[] {
  const out: string[] = []
  for (const g of fs.readdirSync(dizin, { withFileTypes: true })) {
    const p = path.join(dizin, g.name)
    if (g.isDirectory()) {
      if (g.name === 'node_modules' || g.name === '__tests__') continue
      out.push(...kaynaklar(p))
    } else if (/\.(ts|tsx)$/.test(g.name) && !/\.(test|spec)\./.test(g.name) && g.name !== 'database.types.ts') {
      out.push(p)
    }
  }
  return out
}

describe('INV-MALIYET-OKUYUCU-1 · products SELECT listesinde maliyet/tedarik kolonu yok', () => {
  const yollar = kaynaklar(path.join(KOK, 'src'))
  const dosyalar = yollar.map((yol) => ({ yol, govde: yorumsuz(fs.readFileSync(yol, 'utf8')) }))
  const sabitler = sabitHaritasi(dosyalar)

  it('evren boş değil', () => {
    expect(dosyalar.length).toBeGreaterThan(200)
    expect(KOLONLAR).toHaveLength(8)
  })

  it('src/ altında products SELECT listesi (açık liste, *, boş select(), gömme) 8 kolondan hiçbirini içermez', () => {
    const ihlal = dosyalar.flatMap(({ yol, govde }) =>
      okuyucuIhlalleri(govde, sabitler).map((z) => `${path.relative(KOK, yol)} :: ${z}`),
    )
    expect(ihlal, 'okuma product_costs gömmesinden yapılır; yazım products üzerinden serbest').toEqual([])
  })

  it('SABOTAJ: açık liste, *, boş select(), yazımdan dönen select() ve gömme yakalanır', () => {
    expect(okuyucuIhlalleri(`await s.from('products').select('id, purchase_price').eq('id', 1)`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from("products").select("id, supplier_name")`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('products').select('*').eq('id', 1)`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('products').select()`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('products').update({ name: 'x' }).eq('id', 1).select()`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('products').insert([p]).select('id, cost_in_base')`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('orders').select('id, products(*)')`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('orders').select('id, product:products(name, last_purchased_at)')`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('products').select('id').order('supplier_name')`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('products').select('id').gt('cost_in_base', 5)`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('products').select('id').order('name').eq('status', 'active')`)).toHaveLength(0)
    const sabit = new Map([['KOLON_LISTESI', [`'id, name, purchase_currency'`]]])
    expect(okuyucuIhlalleri(`await s.from('products').select(KOLON_LISTESI)`, sabit)).toHaveLength(1)
  })

  it('YAZIM ve temiz okuma geçer: yük anahtarları, product_costs gömmesi, başka tablo', () => {
    expect(okuyucuIhlalleri(`await s.from('products').update({ purchase_price: 5, supplier_name: 'x' }).eq('id', 1)`)).toHaveLength(0)
    expect(okuyucuIhlalleri(`await s.from('products').insert([{ cost_in_base: 5 }])`)).toHaveLength(0)
    expect(okuyucuIhlalleri(`await s.from('products').select('id, name, product_costs(purchase_price)')`)).toHaveLength(0)
    expect(okuyucuIhlalleri(`await s.from('orders').select('id, products(name, product_costs(cost_in_base))')`)).toHaveLength(0)
    expect(okuyucuIhlalleri(`await s.from('product_costs').select('purchase_price')`)).toHaveLength(0)
    expect(okuyucuIhlalleri(`await s.from('inventory_velocity').select('product_id, supplier_name')`)).toHaveLength(0)
    expect(okuyucuIhlalleri(`await s.from('orders').select('id, products(name, sku)')`)).toHaveLength(0)
    expect(okuyucuIhlalleri(`// s.from('products').select('purchase_price')`)).toHaveLength(0)
    // Şema-güvenlik alt sınırı: URL taşıyan satır sıyırılmaz, hedef GERÇEKTEN toplanır.
    expect(okuyucuIhlalleri(`const u = 'https://x.test'; await s.from('products').select('purchase_price')`)).toHaveLength(1)
    expect(okuyucuIhlalleri(`await s.from('products').select('id', { count: 'exact', head: true })`)).toHaveLength(0)
  })
})
