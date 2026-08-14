/// <reference types="node" />
import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import { describe, expect,it } from 'vitest'

describe('DI Signature compliance static analysis', () => {
  const serviceFiles = [
    'address.service.ts',
    'cart.service.ts',
    'category.service.ts',
    'invoice.service.ts',
    'pricing.service.ts',
    'product.service.ts',
    'project.service.ts'
  ]

  /**
   * SAF (pure) export'lar: DB'ye hiç dokunmayan, bu yüzden `supabase` parametresi ALMAYAN
   * fonksiyonlar. DI kuralı (CLAUDE.md §2) "veri erişen servis fonksiyonu" içindir; saf hesap
   * fonksiyonuna client zorlamak sahte bağımlılık üretir ve test edilebilirliği bozar.
   *
   * Bu liste BİLİNÇLİ ve DAR tutulur: yeni bir isim eklemeden önce fonksiyonun gerçekten
   * DB'ye dokunmadığını doğrula. Aşağıdaki stale-guard, listede olup dosyada artık bulunmayan
   * bir ismi FAIL ettirir (liste çürümesin).
   *
   * Not: bu istisna listesi 2026-08-14'te eklendi — test W1'den beri kırmızıydı ama CI
   * çıkış kodunu yuttuğu için görünmüyordu (fiyat motoru saf çekirdek fonksiyonları).
   */
  const PURE_EXPORTS: Record<string, string[]> = {
    'pricing.service.ts': [
      'getUserPriceSegment', // JWT app_metadata → segment (saf eşleme)
      'ruleMatchesProduct', // kural ↔ ürün hedef eşleşmesi (saf)
      'sortRules', // merdiven sıralaması (saf)
      'computePriceFromRule', // tek kuraldan net/gross hesabı (saf)
      'resolvePriceWithRules', // motorun SAF çekirdeği; DB'li sarmalayıcısı resolvePrice()
    ],
  }

  serviceFiles.forEach(file => {
    it(`should enforce that every exported function in ${file} accepts supabase as its first parameter`, () => {
      const filePath = path.join(process.cwd(), 'src/lib/services', file)
      expect(fs.existsSync(filePath)).toBe(true)

      const sourceCode = fs.readFileSync(filePath, 'utf-8')
      const sourceFile = ts.createSourceFile(
        filePath,
        sourceCode,
        ts.ScriptTarget.Latest,
        true
      )

      interface ExportedFunctionInfo {
        name: string
        parameters: ts.NodeArray<ts.ParameterDeclaration>
      }

      const exportedFunctions: ExportedFunctionInfo[] = []

      function visit(node: ts.Node) {
        if (ts.isFunctionDeclaration(node)) {
          const isExported = node.modifiers?.some(
            m => m.kind === ts.SyntaxKind.ExportKeyword
          )
          if (isExported) {
            const funcName = node.name ? node.name.text : 'anonymous'
            exportedFunctions.push({ name: funcName, parameters: node.parameters })
          }
        } else if (ts.isVariableStatement(node)) {
          const isExported = node.modifiers?.some(
            m => m.kind === ts.SyntaxKind.ExportKeyword
          )
          if (isExported) {
            node.declarationList.declarations.forEach(decl => {
              if (
                decl.initializer &&
                (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
              ) {
                const funcName = decl.name.getText(sourceFile)
                exportedFunctions.push({
                  name: funcName,
                  parameters: decl.initializer.parameters
                })
              }
            })
          }
        }
        ts.forEachChild(node, visit)
      }

      visit(sourceFile)

      // Ensure we found at least one exported function to make the test meaningful
      expect(
        exportedFunctions.length,
        `Expected to find at least one exported function in ${file}`
      ).toBeGreaterThan(0)

      const pureExports = PURE_EXPORTS[file] ?? []

      // Stale-guard: istisna listesindeki her isim dosyada GERÇEKTEN export edilmiş olmalı
      // (yeniden adlandırma/silme sonrası liste sessizce genişlemesin).
      const exportedNames = new Set(exportedFunctions.map(f => f.name))
      pureExports.forEach(pureName => {
        expect(
          exportedNames.has(pureName),
          `PURE_EXPORTS['${file}'] içindeki '${pureName}' artık export edilmiyor — listeyi güncelle`
        ).toBe(true)
      })

      exportedFunctions
        .filter(({ name }) => !pureExports.includes(name))
        .forEach(({ name, parameters }) => {
        expect(
          parameters.length,
          `Exported function '${name}' in '${file}' must have at least one parameter (supabase)`
        ).toBeGreaterThanOrEqual(1)

        const firstParam = parameters[0]
        const paramName = firstParam.name.getText(sourceFile)
        expect(
          paramName,
          `First parameter of exported function '${name}' in '${file}' must be named 'supabase'`
        ).toBe('supabase')

        expect(
          firstParam.type,
          `First parameter 'supabase' of exported function '${name}' in '${file}' must have a type annotation`
        ).toBeDefined()

        const typeText = firstParam.type!.getText(sourceFile).replace(/\s+/g, '')
        const isValidType =
          typeText === 'SupabaseClient<Database>' || typeText === 'SupabaseClient'
        
        expect(
          isValidType,
          `First parameter of exported function '${name}' in '${file}' must be typed as 'SupabaseClient<Database>' or 'SupabaseClient', but got '${typeText}'`
        ).toBe(true)
      })
    })
  })
})
