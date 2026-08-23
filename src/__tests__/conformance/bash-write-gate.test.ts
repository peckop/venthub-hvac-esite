import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-BASH-WRITE-1 · Bash ile yazma, şerit kapısından GEÇMELİ
 *
 * ÖLÇÜLMÜŞ KUSUR (2026-08-23): PreToolUse kancaları `matcher: "Edit|Write|MultiEdit"` ile
 * bağlıydı; Bash ile yazılan dosya hiçbir kapıdan geçmiyordu. Kapının kendisine sentetik yük
 * verilerek üç kollu ölçüldü: Edit + yabancı dosya BLOKLANDI · Bash + aynı dosyaya sed -i GEÇTİ
 * · Edit + kendi dosyam GEÇTİ. Yani kapı görüyordu ve Bash onu atlıyordu.
 *
 * ⚠ BU DOSYANIN ASIL KOLU YANLIŞ-POZİTİF KOLUDUR. "auto mode" talimatı her şeride Bash'i
 * dayatıyor ve komutların çoğu OKUMA. Yanlış pozitif veren bir kapı YEDİ ŞERİDİ BİRDEN durdurur —
 * yani bu kapının en olası arıza biçimi "kaçırmak" değil, "her şeyi reddetmek"tir. Aşağıdaki
 * masum komutlar kolu olmadan, "daima reddet" diyen bozuk bir uygulama da bu suite'i geçerdi.
 */

const require_ = createRequire(import.meta.url)

interface Cikti {
  yazmaVar: boolean
  hedefler: string[]
  cozulemeyen: string[]
  sebepler: string[]
}

const MODUL = path.resolve(__dirname, '../../../.claude/hooks/bash-write-targets.cjs')
const { yazmaHedefleri } = require_(MODUL) as { yazmaHedefleri: (k: string) => Cikti }

/** Kapının fiilî kararı: çözülemeyen yazma varsa REDDET, yoksa hedefleri şerit kapısına ver. */
const reddedilirMi = (k: string): boolean => yazmaHedefleri(k).cozulemeyen.length > 0

describe('INV-BASH-WRITE-1 · Bash yazma hedefi çıkarımı', () => {
  it('YANLIŞ-POZİTİF KOLU: masum OKUMA komutları ne reddedilir ne hedef üretir', () => {
    const masum = [
      'git status --porcelain',
      'git log --oneline -1',
      'grep -rn "foo" src/',
      'ls -la scripts/board/',
      'cat package.json',
      'pnpm test -- --run',
      'node -e "console.log(1 + 1)"',
      'node --check .claude/hooks/bash-write-targets.cjs',
      'gh pr view 786 --json state',
      'wc -l src/app/layout.tsx',
    ]
    for (const k of masum) {
      const r = yazmaHedefleri(k)
      expect(r.cozulemeyen, `REDDEDİLDİ ama masum bir okuma komutu: ${k}`).toEqual([])
      expect(r.hedefler, `hedef uydurdu: ${k}`).toEqual([])
    }
  })

  it('AKIŞ BİRLEŞTİRME ve /dev/null hedef SAYILMAZ — bunları bloklamak filoyu durdurur', () => {
    // `2>&1` bir dosya değildir; `> /dev/null` hiçbir şeyi korumaz. İkisi de günlük kullanımda.
    expect(yazmaHedefleri('pnpm lint 2>&1').hedefler).toEqual([])
    expect(yazmaHedefleri('grep -c foo dosya.txt > /dev/null').hedefler).toEqual([])
    expect(reddedilirMi('pnpm build > /dev/null 2>&1')).toBe(false)
  })

  it('YÖNLENDİRME hedefi çıkarılır — bitişik ve boşluklu yazım', () => {
    expect(yazmaHedefleri('echo x > src/i18n/sort.ts').hedefler).toContain('src/i18n/sort.ts')
    expect(yazmaHedefleri('echo x >>src/i18n/sort.ts').hedefler).toContain('src/i18n/sort.ts')
  })

  it('sed -i · tee · cp · mv · dd · truncate · rm hedefleri çıkarılır', () => {
    expect(yazmaHedefleri("sed -i 's/a/b/' src/lib/rbac.ts").hedefler).toContain('src/lib/rbac.ts')
    expect(yazmaHedefleri('cat x | tee src/lib/rbac.ts').hedefler).toContain('src/lib/rbac.ts')
    expect(yazmaHedefleri('cp yeni.ts src/lib/rbac.ts').hedefler).toContain('src/lib/rbac.ts')
    expect(yazmaHedefleri('mv yeni.ts src/lib/rbac.ts').hedefler).toContain('src/lib/rbac.ts')
    expect(yazmaHedefleri('dd if=/dev/zero of=src/lib/rbac.ts').hedefler).toContain('src/lib/rbac.ts')
    expect(yazmaHedefleri('truncate -s 0 src/lib/rbac.ts').hedefler).toContain('src/lib/rbac.ts')
    // Silme de bir yazmadır: başka şeridin dosyasını silmek, ona yazmaktan beterdir.
    expect(yazmaHedefleri('rm -f src/lib/rbac.ts').hedefler).toContain('src/lib/rbac.ts')
  })

  it('git checkout -- ve git restore çalışma ağacına YAZAR, hedefi çıkarılır', () => {
    // Ölçülmüş vaka: `git checkout -- <dosya>` INDEX'ten geri yazar; sessizce başkasının
    // düzenlemesini ezebilir. Kapı bunu bir yazma saymazsa boşluk açık kalır.
    expect(yazmaHedefleri('git checkout -- src/lib/rbac.ts').hedefler).toContain('src/lib/rbac.ts')
    expect(yazmaHedefleri('git restore src/lib/rbac.ts').hedefler).toContain('src/lib/rbac.ts')
  })

  it('KOMPOZİT komutta hedef kaybolmaz (cd X && sed -i ...)', () => {
    const r = yazmaHedefleri("cd C:/repo && sed -i 's/a/b/' src/lib/rbac.ts && echo bitti")
    expect(r.hedefler, 'kompozit komutta hedef kayboldu — && ile bölünmüyor').toContain('src/lib/rbac.ts')
  })

  it('FAIL-CLOSED: yorumlayıcı gövdesindeki yazma ÇÖZÜLEMEZ sayılır, TAHMİN EDİLMEZ', () => {
    // Yol değişken/ifade olduğu için statik çıkarım yapılamaz. Doğru davranış tahmin değil REDDİR.
    expect(reddedilirMi('node -e "require(\'fs\').writeFileSync(hedef, veri)"')).toBe(true)
    expect(reddedilirMi('python -c "open(yol, \'w\').write(x)"')).toBe(true)
  })

  it('FAIL-CLOSED: heredoc gövdesindeki yazma da çözülemez sayılır', () => {
    const komut = ['node <<JS', "require('fs').writeFileSync(p, s)", 'JS'].join('\n')
    expect(reddedilirMi(komut), 'heredoc içindeki yazma sessizce geçti').toBe(true)
  })

  it('HEREDOC BÖLÜNMEZ: gövdedeki ; ve | kabuk ayracı sayılmamalı', () => {
    // Bölünürse gövde parçaları komut sanılır ve karar yanlış zeminde verilir.
    const komut = ['cat <<TXT > notlar.md', 'a; b | c', 'TXT'].join('\n')
    expect(yazmaHedefleri(komut).hedefler).toContain('notlar.md')
  })

  it('KAPI AYIRT EDİCİ: aynı dosya, okuma GEÇER — yazma YAKALANIR', () => {
    // Vacuous karşıtı: modül yolu tanıdığı için değil, FİİLİ yazma olduğu için işaretlemeli.
    const yol = 'src/lib/rbac.ts'
    expect(yazmaHedefleri(`cat ${yol}`).hedefler).toEqual([])
    expect(yazmaHedefleri(`sed -i 's/a/b/' ${yol}`).hedefler).toContain(yol)
  })
})
