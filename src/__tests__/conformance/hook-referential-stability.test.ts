import ts from 'typescript'
import { describe, expect, it } from 'vitest'

/**
 * INV · hook-referential-stability conformance (kalıcı bekçi).
 *
 * Bir `use*` hook'u, GÖVDESİNDE inline arrow/fonksiyon içeren bir object/array literal'i
 * (useMemo/useCallback ile sarmalamadan) döndürürse, o fonksiyonlar HER RENDER'DA yeni
 * referans olur. Bir tüketici bunları `useEffect`/`useMemo`/`useCallback` BAĞIMLILIĞI olarak
 * kullanırsa → bağımlılık her render değişir → effect her render yeniden çalışır → setState →
 * re-render → **SONSUZ DÖNGÜ**. (2026-06-19: `useRole` bu yüzden tüm admin panelini dondurdu;
 * inbox-count effect'i async olduğu için "Maximum update depth" hatası bile vermeden sessizce.)
 *
 * Bu sınıfı mevcut hiçbir gate yakalamaz:
 *   • tsc — inline fn dönüşü geçerli tip,
 *   • lint — sözdizimi temiz (react-hooks/exhaustive-deps bile KAYNAĞI değil tüketiciyi suçlar),
 *   • test — tek render eden birim test döngüyü görmez,
 *   • build — hata yok.
 * Yalnız bu invariant yakalar: paylaşılan primitif (hook) çıktısı REFERANS-STABİL olmalı.
 *
 * KURAL: object/array literal + inline fonksiyon döndüren her `use*` hook'u memoize etmeli —
 * ya modül-seviyesi sabit (no-op fallback) ya `useMemo` (dönen nesne) ya `useCallback` (fn'ler).
 * Kapsam: src/hooks/use* (culprit burada yaşadı). Test dosyaları atlanır.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const HOOK_SOURCES: Record<string, string> = import.meta.glob('/src/hooks/use*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function unwrap(e: ts.Expression): ts.Expression {
  let cur = e
  while (ts.isParenthesizedExpression(cur)) cur = cur.expression
  return cur
}

// useMemo(...) / useCallback(...) çağrısı → stabil sayılır (sarmalanmış).
function isMemoCall(e: ts.Expression): boolean {
  return (
    ts.isCallExpression(e) &&
    ts.isIdentifier(e.expression) &&
    (e.expression.text === 'useMemo' || e.expression.text === 'useCallback')
  )
}

// object/array literal içinde inline arrow/fonksiyon (= her render yeni referans) var mı?
function literalHasInlineFn(expr: ts.Expression): boolean {
  const e = unwrap(expr)
  if (ts.isObjectLiteralExpression(e)) {
    return e.properties.some((p) => {
      if (ts.isPropertyAssignment(p)) {
        const v = unwrap(p.initializer)
        return ts.isArrowFunction(v) || ts.isFunctionExpression(v)
      }
      return ts.isMethodDeclaration(p) // { foo() {} }
    })
  }
  if (ts.isArrayLiteralExpression(e)) {
    return e.elements.some((el) => {
      const v = unwrap(el)
      return ts.isArrowFunction(v) || ts.isFunctionExpression(v)
    })
  }
  return false
}

const isHookName = (n: string | undefined): boolean => !!n && /^use[A-Z0-9]/.test(n)

function findViolations(fileName: string, source: string): string[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const hits: string[] = []

  function checkBody(body: ts.Node) {
    if (!ts.isBlock(body)) {
      // arrow implicit-return: const useX = () => ({ ... })
      const e = unwrap(body as ts.Expression)
      if (!isMemoCall(e) && literalHasInlineFn(e)) {
        hits.push(`${fileName}:${sf.getLineAndCharacterOfPosition(body.getStart()).line + 1}`)
      }
      return
    }
    function walk(node: ts.Node) {
      // İç içe fonksiyon gövdelerine inme — onların return'ü hook'un return'ü DEĞİL.
      if (
        node !== body &&
        (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node))
      ) {
        return
      }
      if (ts.isReturnStatement(node) && node.expression) {
        const e = unwrap(node.expression)
        if (!isMemoCall(e) && literalHasInlineFn(e)) {
          hits.push(`${fileName}:${sf.getLineAndCharacterOfPosition(node.getStart()).line + 1}`)
        }
      }
      ts.forEachChild(node, walk)
    }
    walk(body)
  }

  function visit(node: ts.Node) {
    // function useX() { ... }
    if (ts.isFunctionDeclaration(node) && node.name && isHookName(node.name.text) && node.body) {
      checkBody(node.body)
    }
    // const useX = (...) => { ... } | function (...) { ... }
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((d) => {
        if (
          ts.isIdentifier(d.name) &&
          isHookName(d.name.text) &&
          d.initializer &&
          (ts.isArrowFunction(d.initializer) || ts.isFunctionExpression(d.initializer)) &&
          d.initializer.body
        ) {
          checkBody(d.initializer.body)
        }
      })
    }
    ts.forEachChild(node, visit)
  }

  visit(sf)
  return hits
}

describe('Hook referential-stability conformance', () => {
  // Stale-guard: glob yolu kırılıp 0 dosya yüklerse test sahte-yeşil olmasın.
  it('use* hook kaynaklarını gerçekten tarıyor (vacuous-pass koruması)', () => {
    expect(Object.keys(HOOK_SOURCES).length).toBeGreaterThan(15)
  })

  it('hiçbir use* hook memoize edilmemiş, inline fonksiyon içeren object/array literal döndürmez', () => {
    const violations: string[] = []
    for (const [path, source] of Object.entries(HOOK_SOURCES)) {
      if (path.includes('__tests__') || path.includes('.test.')) continue
      violations.push(...findViolations(path, source))
    }

    expect(
      violations,
      'Referential-stability İHLALİ — bu hook(lar) her render YENİ inline fonksiyon döndürüyor. ' +
        'Memoize et (modül-sabiti no-op fallback / useMemo dönen nesne / useCallback fn). ' +
        'Tüketici çıktıyı useEffect/useMemo dep yaparsa sonsuz re-render döngüsü olur:\n' +
        violations.join('\n'),
    ).toEqual([])
  })
})
