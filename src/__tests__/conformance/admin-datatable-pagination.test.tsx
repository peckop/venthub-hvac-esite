/**
 * INV-ADMIN-PAGINATION-1 — sayfalama tablonun ALTINDA ve ÇALIŞIYOR.
 *
 * CETVEL: docs/standards/admin-standard.md §3 (Resource Index bileşim sırası), 4. madde:
 * **"Sayfalama — altta; ~50 öğeden sonra zorunlu."**
 * Kural yazılıydı, uygulanmamıştı — denetimler yalnız üst araç çubuğundaydı (REC-75).
 *
 * NİÇİN İKİ KOLLU: yalnız kaynak taraması yapan bir kapı "DataTablePagination geçiyor mu"
 * sorusuna bakar ve bileşen İÇİ boşaltılsa bile yeşil kalır (metin taraması yorumla tatmin
 * olur). Bu yüzden yerleşim AST ile, davranış GERÇEK RENDER ile ölçülüyor.
 *
 * KAPSAM SINIRI, adıyla: buradaki "altta" ölçümü KAYNAK SIRASI üzerinedir (JSX'te tablodan
 * sonra gelmek). CSS ile görsel olarak yukarı taşınmasını bu kapı GÖRMEZ; onu gören şey
 * görsel regresyon testidir ve bu depoda yok.
 */
import fs from 'node:fs'
import path from 'node:path'

import { render, screen } from '@testing-library/react'
import ts from 'typescript'
import { describe, expect, it, vi } from 'vitest'

import { DataTablePagination } from '@/components/admin/data-table/DataTablePagination'

const KOK = process.cwd()
const KIT = path.join(KOK, 'src/components/admin/data-table/DataTableKit.tsx')

function kitKaynagi(): { sf: ts.SourceFile; metin: string } {
  const metin = fs.readFileSync(KIT, 'utf8')
  return { sf: ts.createSourceFile('DataTableKit.tsx', metin, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX), metin }
}

/** JSX açılış etiketinin adı (self-closing dahil). */
function etiketAdi(node: ts.Node): string | null {
  if (ts.isJsxSelfClosingElement(node)) return node.tagName.getText()
  if (ts.isJsxElement(node)) return node.openingElement.tagName.getText()
  return null
}

function jsxBul(sf: ts.SourceFile, ad: string): ts.Node[] {
  const hits: ts.Node[] = []
  const walk = (n: ts.Node): void => {
    if (etiketAdi(n) === ad) hits.push(n)
    ts.forEachChild(n, walk)
  }
  walk(sf)
  return hits
}

describe('INV-ADMIN-PAGINATION-1 · yerleşim (AST)', () => {
  it('1 · kit sayfalamayı DataTablePagination ile sunar', () => {
    const { sf } = kitKaynagi()
    expect(jsxBul(sf, 'DataTablePagination').length).toBe(1)
  })

  it('2 · sayfalama tablodan SONRA gelir (cetvel: altta)', () => {
    const { sf } = kitKaynagi()
    const tablo = jsxBul(sf, 'table')[0]
    const sayfalama = jsxBul(sf, 'DataTablePagination')[0]
    expect(tablo).toBeDefined()
    expect(sayfalama).toBeDefined()
    // "Altta" = kaynak sırasında tablonun BİTİŞİNDEN sonra başlamak.
    expect(sayfalama.getStart()).toBeGreaterThan(tablo.getEnd())
  })

  it('3 · kitte artık satır-içi sayfalama denetimi KALMADI', () => {
    const { sf } = kitKaynagi()
    let cagri = 0
    const walk = (n: ts.Node): void => {
      if (ts.isCallExpression(n) && n.expression.getText() === 'setPage') cagri++
      ts.forEachChild(n, walk)
    }
    walk(sf)
    // setPage yalnız prop olarak GEÇİLİR; kit onu kendi çağırmaz.
    expect(cagri).toBe(0)
  })
})

describe('INV-ADMIN-PAGINATION-1 · davranış (render)', () => {
  const etiketler = { previousLabel: 'Önceki sayfa', nextLabel: 'Sonraki sayfa' }

  it('4 · tek sayfada hiçbir denetim çizilmez', () => {
    const { container } = render(
      <DataTablePagination page={1} pageCount={1} setPage={vi.fn()} {...etiketler} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('5 · çok sayfada iki düğme + sayfa etiketi çizilir', () => {
    render(<DataTablePagination page={2} pageCount={3} setPage={vi.fn()} {...etiketler} />)
    expect(screen.getByLabelText('Önceki sayfa')).toBeEnabled()
    expect(screen.getByLabelText('Sonraki sayfa')).toBeEnabled()
    expect(screen.getByText('2 / 3')).toBeInTheDocument()
  })

  it('6 · ilk sayfada geri, son sayfada ileri KAPALI', () => {
    const { unmount } = render(<DataTablePagination page={1} pageCount={3} setPage={vi.fn()} {...etiketler} />)
    expect(screen.getByLabelText('Önceki sayfa')).toBeDisabled()
    unmount()
    render(<DataTablePagination page={3} pageCount={3} setPage={vi.fn()} {...etiketler} />)
    expect(screen.getByLabelText('Sonraki sayfa')).toBeDisabled()
  })

  it('7 · ileri/geri DOĞRU sayfayı ister (sınırları aşmadan)', () => {
    const setPage = vi.fn()
    render(<DataTablePagination page={2} pageCount={3} setPage={setPage} {...etiketler} />)
    screen.getByLabelText('Sonraki sayfa').click()
    expect(setPage).toHaveBeenCalledWith(3)
    screen.getByLabelText('Önceki sayfa').click()
    expect(setPage).toHaveBeenCalledWith(1)
  })

  it('8 · kaynak kendi sayfa etiketini verebilir', () => {
    render(
      <DataTablePagination
        page={2}
        pageCount={7}
        setPage={vi.fn()}
        renderPageLabel={(p, c) => `sayfa ${p}, toplam ${c}`}
        {...etiketler}
      />,
    )
    expect(screen.getByText('sayfa 2, toplam 7')).toBeInTheDocument()
  })
})
