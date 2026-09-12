import { spawnSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KANCA-PROTECT-CONFIG-1 · `protect-config` kancasının KARARI ölçülür.
 *
 * ÖLÇÜLMÜŞ KUSUR (REC-306, 2026-09-12): `.claude/hooks` altındaki 19 betikten beşinin
 * davranışını ölçen HİÇBİR test yoktu; `protect-config` bunlardan biriydi. Adı üç test
 * dosyasında geçiyordu ama üçünde de **yorum içinde** — yani "grep eşleşti" ile "davranış
 * ölçüldü" arasındaki fark. Bu kapı işi DURDURMA yetkisine sahip: yanlış pozitifte filo
 * durur, yanlış negatifte kural sessizce delinir. İkisini de yalnız test görür.
 *
 * ⚠ASIL KOL YANLIŞ-POZİTİF KOLUDUR. "Her şeyi reddet" diyen bozuk bir uygulama, yalnızca
 * "yasak girdi bloklandı" kolu olan bir suite'i GEÇER. Bu yüzden aşağıda masum yazımlar,
 * `.claude/` muafiyeti ve kod-dışı dosya kolları var.
 *
 * ⭐BU DOSYA KENDİ ÖLÇTÜĞÜ KAPIYA TAKILIR — desen parçalardan kurulur. Kanca, yasak kalıbı
 * İÇEREN her yazımı (yorum dahi olsa) reddediyor; bir DEDEKTÖRÜN o kalıbı taşıması ise
 * zorunludur. Aynı çözüm `auth-role-source.test.ts`te de kullanıldı.
 *
 * Cetvel: `docs/standards/fleet-mechanism-standard.md` (exit 0/2 sözleşmesi) ·
 * `execution-method-standard.md` §8.1 (test aynı PR'da).
 */

const KANCA = path.resolve(__dirname, '../../../.claude/hooks/protect-config.cjs')

interface Sonuc {
  kod: number | null
  stderr: string
}

/** Kancayı gerçek bir süreç olarak koşar: stdin JSON → çıkış kodu + stderr. */
function kos(girdi: unknown, secenek: { cwd?: string; hamGirdi?: string } = {}): Sonuc {
  const r = spawnSync(process.execPath, [KANCA], {
    input: secenek.hamGirdi ?? JSON.stringify(girdi),
    encoding: 'utf8',
    cwd: secenek.cwd ?? process.cwd(),
  })
  return { kod: r.status, stderr: r.stderr ?? '' }
}

const yazma = (file_path: string, content: string) => ({
  tool_name: 'Write',
  tool_input: { file_path, content },
})

/** Yasak kalıplar PARÇALARDAN kurulur — bu dosyanın kendisi kancaya takılmasın diye. */
const yasak = {
  anyCast: ['as', 'any'].join(' '),
  tsSustur: ['@ts', 'ignore'].join('-'),
  lintSustur: ['eslint', 'disable'].join('-'),
  hamMeta: ['raw', 'user', 'meta', 'data'].join('_'),
  golge: 'PCFSoft' + 'ShadowMap',
}

describe('INV-KANCA-PROTECT-CONFIG-1 · katman A: lint/TS zorlayan config', () => {
  it('tsconfig ve eslint config düzenlemesi BLOKLANIR ve mesaj dosyayı ADIYLA söyler', () => {
    for (const dosya of ['tsconfig.json', 'tsconfig.build.json', 'eslint.config.cjs', '.lintstagedrc.json']) {
      const r = kos(yazma(`C:/repo/${dosya}`, 'x'))
      expect(r.kod, `bloklanmadı: ${dosya}`).toBe(2)
      expect(r.stderr, `mesaj dosya adını söylemiyor: ${dosya}`).toContain(dosya)
    }
  })

  it('YANLIŞ-POZİTİF KOLU: adı benzeyen masum dosyalar serbest', () => {
    // "tsconfig" kelimesini İÇEREN ama o dosya OLMAYAN yollar bloklanmamalı.
    for (const dosya of ['src/lib/tsconfigOkuyucu.ts', 'docs/tsconfig-notlari.md', 'eslint.config.md']) {
      const r = kos(yazma(`C:/repo/${dosya}`, 'export const x = 1\n'))
      expect(r.kod, `masum dosya bloklandı: ${dosya}`).toBe(0)
    }
  })
})

describe('INV-KANCA-PROTECT-CONFIG-1 · katman B: kod içeriği taraması', () => {
  it('yasak kalıp yazımı BLOKLANIR ve mesaj SEBEBİ söyler (kalıp adı geçer)', () => {
    const vakalar: Array<[string, string]> = [
      ['tip kestirmesi', `const x = veri ${yasak.anyCast}\n`],
      ['tip hatasını susturma', `// ${yasak.tsSustur}\nconst x = 1\n`],
      ['lint susturma', `/* ${yasak.lintSustur} */\nconst x = 1\n`],
      ['yetki alanı', `select('${yasak.hamMeta}')\n`],
      ['3D gölge', `renderer.shadowMap.type = ${yasak.golge}\n`],
    ]
    for (const [ad, icerik] of vakalar) {
      const r = kos(yazma('C:/repo/src/lib/deneme.ts', icerik))
      expect(r.kod, `bloklanmadı: ${ad}`).toBe(2)
      expect(r.stderr.length, `mesaj boş: ${ad}`).toBeGreaterThan(20)
      expect(r.stderr, `mesaj dosyayı söylemiyor: ${ad}`).toContain('deneme.ts')
    }
  })

  it('MUAFİYET KOLU: kod olmayan dosya ve `.claude/` altı taranmaz', () => {
    // Bu muafiyet bilinçli: kancaların ve cetvellerin kendisi yasak kalıbı ANLATMAK
    // zorundadır; taranırsa kapı kendi belgesini yazdırmaz.
    const kirli = `ornek: ${yasak.anyCast}\n`
    expect(kos(yazma('C:/repo/docs/standards/ornek.md', kirli)).kod, 'md dosyası bloklandı').toBe(0)
    expect(kos(yazma('C:/repo/.claude/hooks/ornek.cjs', kirli)).kod, '.claude altı bloklandı').toBe(0)
  })

  it('YANLIŞ-POZİTİF KOLU: temiz kod yazımı ve boş içerik serbest', () => {
    expect(kos(yazma('C:/repo/src/lib/temiz.ts', 'export const topla = (a: number, b: number) => a + b\n')).kod).toBe(0)
    expect(kos(yazma('C:/repo/src/lib/temiz.ts', '   ')).kod, 'boş içerik bloklandı').toBe(0)
  })

  it('Edit ve MultiEdit yükleri de taranır — yalnız `content` değil', () => {
    const kirli = `const x = veri ${yasak.anyCast}\n`
    const edit = kos({ tool_name: 'Edit', tool_input: { file_path: 'C:/repo/src/a.ts', new_string: kirli } })
    expect(edit.kod, 'Edit yükü taranmadı').toBe(2)
    const multi = kos({
      tool_name: 'MultiEdit',
      tool_input: { file_path: 'C:/repo/src/a.ts', edits: [{ new_string: 'temiz\n' }, { new_string: kirli }] },
    })
    expect(multi.kod, 'MultiEdit yükü taranmadı').toBe(2)
  })
})

describe('INV-KANCA-PROTECT-CONFIG-1 · sözleşme sınırları', () => {
  it('bozuk / boş / dosyasız girdi KARIŞMAZ (exit 0) — fail-open, kancanın yazılı sözleşmesi', () => {
    expect(kos(null, { hamGirdi: 'bu JSON degil' }).kod, 'bozuk JSON bloklandı').toBe(0)
    expect(kos(null, { hamGirdi: '' }).kod, 'boş girdi bloklandı').toBe(0)
    expect(kos({ tool_name: 'Write', tool_input: {} }).kod, 'dosya yolu yokken bloklandı').toBe(0)
  })

  it('KARAR CWD\'DEN BAĞIMSIZ — depo dışından koşarken de aynı sonucu verir', () => {
    // 2026-09-12 vakası: göreli yol sınıfı yüzünden bir kanca depo dışı bir klasörde
    // MODULE_NOT_FOUND ile düştü ve kapı "çalışmış gibi" göründü. Bu kol o sınıfı ölçer.
    const disari = os.tmpdir()
    expect(kos(yazma('C:/repo/tsconfig.json', 'x'), { cwd: disari }).kod, 'dışarıdan blok kayboldu').toBe(2)
    expect(kos(yazma('C:/repo/src/lib/temiz.ts', 'const x = 1\n'), { cwd: disari }).kod).toBe(0)
  })
})
