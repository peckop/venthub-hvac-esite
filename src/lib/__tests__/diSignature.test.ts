/// <reference types="node" />
import * as fs from 'fs'
import * as path from 'path'
import * as ts from 'typescript'
import { describe, expect,it } from 'vitest'

describe('DI Signature compliance static analysis', () => {
  /**
   * DİZİNDEN TÜRETİLİR — elle liste DEĞİL (W5, 2026-08-16).
   *
   * Eskiden burada 8 dosyalık sabit bir liste vardı ve `displayPrice.service.ts`,
   * `pricingAdmin.service.ts` **hiç taranmıyordu**; yeni bir servis dosyası da sessizce
   * kapının dışında kalıyordu (`pricingPolicy.service.ts` tam bunu yaşadı). Kapının
   * KAPSAMI, koruduğu kuraldan daha dar olduğunda kapı "var" görünür ama yoktur —
   * bu, kapsam≠gerçek hatasının ders kitabı hâli.
   *
   * Artık `lib/services/` altındaki her `*.service.ts` otomatik taranır: yeni dosya
   * eklemek onu KENDİLİĞİNDEN kurala tabi kılar.
   */
  const SERVICES_DIR = path.join(process.cwd(), 'src/lib/services')
  const serviceFiles = fs
    .readdirSync(SERVICES_DIR)
    .filter(f => f.endsWith('.service.ts'))
    .sort()

  it('kapsam sağlığı: en az bir servis dosyası taranıyor', () => {
    // Sıfır dosya "temiz" değil, "dedektör kör" demektir (dizin taşınmış olabilir).
    expect(
      serviceFiles.length,
      `${SERVICES_DIR} altında hiç *.service.ts bulunamadı — dizin taşındıysa SERVICES_DIR'i güncelle.`,
    ).toBeGreaterThan(5)
  })

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
        text: string
      }

      const exportedFunctions: ExportedFunctionInfo[] = []

      function visit(node: ts.Node) {
        if (ts.isFunctionDeclaration(node)) {
          const isExported = node.modifiers?.some(
            m => m.kind === ts.SyntaxKind.ExportKeyword
          )
          if (isExported) {
            const funcName = node.name ? node.name.text : 'anonymous'
            exportedFunctions.push({ name: funcName, parameters: node.parameters, text: node.getText(sourceFile) })
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
                  parameters: decl.initializer.parameters,
                  text: decl.initializer.getText(sourceFile)
                })
              }
            })
          }
        }
        ts.forEachChild(node, visit)
      }

      visit(sourceFile)

      // DI kuralının AMACI: servis fonksiyonları kendi Supabase client'ını YARATMASIN,
      // client çağırandan enjekte edilsin. Supabase'e hiç dokunmayan SAF yardımcılar bu
      // amacın dışındadır — onlara kullanılmayan bir `supabase` parametresi eklemek kuralı
      // güçlendirmez, sadece imzayı yalanlar. Bu yüzden muafiyet ADLA verilir (desenle değil):
      // yeni bir ad eklemek bilinçli bir karar olmalı ve saflığı doğrulanmalıdır.
      // NOT: mimari olarak daha temizi bu saf yardımcıları `lib/services/` dışına taşımaktır;
      // bu, fiyat motoru şeridinin kararı (dosya o şeritte aktif).
      const PURE_HELPERS_EXEMPT: Record<string, string[]> = {
        'pricing.service.ts': [
          'getUserPriceSegment',   // user.app_metadata → segment
          'scopeMatchesProduct',   // (scopedRow, product, ancestors) → boolean; merdivenin TEK hedef eşleştiricisi (W5)
          'ruleMatchesProduct',    // (rule, product, ancestors) → boolean; scopeMatchesProduct'a delege eder
          'sortRules',             // kural dizisini sıralar
          'computePriceFromRule',  // saf aritmetik: maliyet + kural → net/brüt
          'resolvePriceWithRules', // motorun SAF çekirdeği; DB'li sarmalayıcısı resolvePrice()
        ],
        'pricingPolicy.service.ts': [
          'sortPolicies',              // politika dizisini merdivene göre sıralar (W5)
          'resolveFxLockWithPolicies', // SAF çekirdek: havuz + ürün → kilit kararı (W5)
        ],
        'pricingAdmin.service.ts': [
          'toPricingProductInput',  // (row, brandMap) → motor girdisi; DB'ye dokunmaz
          'marginPctToCoefficient', // saf aritmetik
          'coefficientToMarginPct', // saf aritmetik
        ],
        'displayPrice.service.ts': [
          'attachDisplayPrices',    // (items, priceMap) → items; DB'ye dokunmaz
        ],
      }
      const exempt = new Set(PURE_HELPERS_EXEMPT[file] ?? [])

      // Ensure we found at least one exported function to make the test meaningful
      expect(
        exportedFunctions.length,
        `Expected to find at least one exported function in ${file}`
      ).toBeGreaterThan(0)

      // Stale-guard: muafiyet listesindeki her isim dosyada GERÇEKTEN export edilmiş olmalı
      // (yeniden adlandırma/silme sonrası liste sessizce büyümesin, ölü muafiyet kalmasın).
      const exportedNames = new Set(exportedFunctions.map(f => f.name))
      exempt.forEach(exemptName => {
        expect(
          exportedNames.has(exemptName),
          `PURE_HELPERS_EXEMPT['${file}'] içindeki '${exemptName}' artık export edilmiyor — listeyi güncelle`
        ).toBe(true)
      })

      exportedFunctions.forEach(({ name, parameters, text }) => {
        if (exempt.has(name)) {
          // Muafiyet KENDİNİ DENETLER: saf olduğu iddia edilen fonksiyon gövdesinde
          // supabase geçiyorsa muafiyet geçersizdir — listeye ekleyerek gerçek bir
          // DI ihlali gizlenemez.
          expect(
            /supabase/i.test(text),
            `'${name}' in '${file}' is exempt as a PURE helper but references supabase — remove the exemption or inject the client`
          ).toBe(false)
          return
        }
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
