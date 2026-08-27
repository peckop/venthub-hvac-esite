import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-HOOKS-2 · `post-commit` ve `post-merge` AYNI kapsam süzgecini kullanmalı.
 *
 * ÖLÇÜLMÜŞ VAKA (2026-08-27, T166-VH): iki kanca aynı işi yapıyordu (değişen kaynaklar için
 * companion üret) ama süzgeç İKİ YERDE ayrı yazılmıştı:
 *
 *     post-commit : grep -E '\.(ts|tsx|mjs|cjs)$' | grep -v '\.test\.' | grep -v '__tests__'
 *     post-merge  : grep -E '^src/.*\.(ts|tsx)$'          <-- test/skip süzgeci YOK
 *
 * Ayırt edici kanıt üç şeritten bağımsız geldi: `build-skip-positive-logic.test.md` dosyasının
 * mtime'ı merge commit'inin SANİYESİYLE aynıydı ve o dakikada hiçbir toplu üretim çağrısı
 * koşmamıştı — yani üreten post-merge'di. `grep -v` sayımı: post-commit 1, post-merge 0.
 * O günün filo genelindeki "başkası dosyamı kirletti" alarmlarının büyük kısmının gerçek
 * yazarı bu satırdı.
 *
 * ⚠ BU DOSYA METİN TARAMASIYLA YETİNMİYOR. Kabuk kancasında "grep zinciri aynı mı" diye
 * bakmak, aynı zinciri iki yere kopyalayan bir çözümü de yeşil gösterir — oysa sürüklenmenin
 * sebebi tam olarak İKİ UYGULAMA olmasıydı. Bu yüzden asıl kollar DAVRANIŞ ölçer: scratch
 * git reposunda GERÇEK kancalar koşturulur, `python` yerine argümanlarını loglayan bir sahte
 * çalıştırılabilir konur ve **hangi dosyalar için companion üretilmeye çalışıldığı** okunur.
 *
 * Yapısal kol yalnızca DESTEK olarak var: kancaların içinde ikinci bir uzantı süzgeci
 * KALMAMIŞ olmalı (yoksa süzgeç yine iki yerde olur ve davranış kolları bir süre daha
 * tesadüfen yeşil kalabilir).
 */

const require = createRequire(import.meta.url)
const KOK = require.resolve('../../../package.json').replace(/[\\/]package\.json$/, '').replace(/\\/g, '/')

const KAYNAK = {
  postCommit: `${KOK}/.githooks/post-commit`,
  postMerge: `${KOK}/.githooks/post-merge`,
  scope: `${KOK}/.githooks/lib/doc-scope.cjs`,
  yaml: `${KOK}/.cc_docs.yaml`,
}

function tmpRoot(): string {
  const raw =
    process.env.RUNNER_TEMP || process.env.TMPDIR || process.env.TEMP || process.env.TMP || '/tmp'
  return raw.replace(/\\/g, '/').replace(/\/$/, '')
}

let sayac = 0
function benzersizDizin(onek: string): string {
  sayac += 1
  return `${tmpRoot()}/${onek}-${Date.now()}-${Math.random().toString(36).slice(2)}-${sayac}`
}

/** `node:fs` KULLANILMIYOR (bkz. board-invariants.test.ts başındaki ortam notu) — çocuk süreç. */
function nodeKos(kod: string, ...argv: string[]): string {
  return execFileSync(process.execPath, ['-e', kod, ...argv], { encoding: 'utf8' })
}

const dosyaYaz = (yol: string, icerik: string): void => {
  nodeKos(
    'const fs=require("fs");const p=require("path");fs.mkdirSync(p.dirname(process.argv[1]),{recursive:true});fs.writeFileSync(process.argv[1],process.argv[2])',
    yol,
    icerik,
  )
}

const dosyaOku = (yol: string): string =>
  nodeKos(
    'const fs=require("fs");try{process.stdout.write(fs.readFileSync(process.argv[1],"utf8"))}catch{process.stdout.write("")}',
    yol,
  )

const dosyaKopyala = (kaynak: string, hedef: string): void => {
  nodeKos(
    'const fs=require("fs");const p=require("path");fs.mkdirSync(p.dirname(process.argv[2]),{recursive:true});fs.copyFileSync(process.argv[1],process.argv[2])',
    kaynak,
    hedef,
  )
}

const calistirilabilirYap = (yol: string): void => {
  nodeKos('require("fs").chmodSync(process.argv[1],0o755)', yol)
}

const SAHTE_PYTHON = `#!/bin/sh
# Sahte python: orion'u çağırmaz, YALNIZCA argümanlarını loglar. Kancanın hangi dosyalar için
# companion üretmeye çalıştığını böyle ölçüyoruz — "üretti mi" değil, "kimi hedefledi".
echo "PYCALL $*" >> "$PY_LOG"
exit 0
`

interface Repo {
  yol: string
  pyLog: string
  gitDir: string
}

/**
 * Scratch repo: iki commit, ikincisi dört dosya getirir. GERÇEK kancalar ve GERÇEK
 * `.cc_docs.yaml` kopyalanır — stub değil; yoksa test kendi uydurduğu kapsamı doğrular.
 */
function kur(onek: string, opts: { scopeKopyala?: boolean } = {}): Repo {
  const yol = benzersizDizin(onek)
  const pyLog = `${yol}/py.log`

  execFileSync('git', ['init', '-q', yol])
  execFileSync('git', ['-C', yol, 'config', 'user.email', 'hooks@test.local'])
  execFileSync('git', ['-C', yol, 'config', 'user.name', 'Hooks Test'])
  execFileSync('git', ['-C', yol, 'commit', '-q', '--allow-empty', '--no-verify', '-m', 'birinci'])
  const birinci = execFileSync('git', ['-C', yol, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()

  dosyaKopyala(KAYNAK.postCommit, `${yol}/.githooks/post-commit`)
  dosyaKopyala(KAYNAK.postMerge, `${yol}/.githooks/post-merge`)
  dosyaKopyala(KAYNAK.yaml, `${yol}/.cc_docs.yaml`)
  if (opts.scopeKopyala !== false) dosyaKopyala(KAYNAK.scope, `${yol}/.githooks/lib/doc-scope.cjs`)

  dosyaYaz(`${yol}/.venv/bin/python`, SAHTE_PYTHON)
  calistirilabilirYap(`${yol}/.venv/bin/python`)

  // İkinci commit: KAPSAMDA üç dosya, KAPSAM DIŞI iki dosya.
  dosyaYaz(`${yol}/src/lib/gercek.ts`, 'export const a = 1\n')
  dosyaYaz(`${yol}/next.config.mjs`, 'export default {}\n')
  // `src` DIŞI ama skip_dirs'te de OLMAYAN bir kaynak — ÖLÇÜLMÜŞ REGRESYON KORUMASI:
  // ilk süzgecim kapsamı "src/** + kök seviyesi" ile sınırlamıştı ve master'da TRACKED duran
  // 46 gerçek companion'ı (supabase/functions/**, e2e/, scripts/**, .claude/hooks) sessizce
  // dışarıda bırakıyordu. `post-commit`in eski hâli yol kısıtı KOYMUYORDU — yani daraltmayı
  // bu iş emri sırasında BEN ekledim ve indikten sonra ölçüp geri aldım. Bu kol o daraltmanın
  // sessizce geri gelmesini engeller.
  dosyaYaz(`${yol}/supabase/functions/_shared/kritik.ts`, 'export const s = 1\n')
  dosyaYaz(`${yol}/src/__tests__/conformance/sahte.test.ts`, 'export const t = 1\n')
  dosyaYaz(`${yol}/src/lib/index.ts`, 'export * from "./gercek"\n')
  execFileSync('git', ['-C', yol, 'add', '-A'])
  execFileSync('git', ['-C', yol, 'commit', '-q', '--no-verify', '-m', 'ikinci'])
  execFileSync('git', ['-C', yol, 'update-ref', 'ORIG_HEAD', birinci])

  const gitDir = execFileSync('git', ['-C', yol, 'rev-parse', '--absolute-git-dir'], {
    encoding: 'utf8',
  })
    .trim()
    .replace(/\\/g, '/')

  return { yol, pyLog, gitDir }
}

/**
 * Kancayı koşturur ve ARKA PLAN bloğunun bitmesini bekler. Kancalar işi `( … ) &` ile
 * koparıyor; beklemeden ölçmek "hiçbir şey yapmadı" yanılsaması üretir.
 */
function kancaKos(r: Repo, kanca: 'post-commit' | 'post-merge', bitisIzi: string): string {
  execFileSync('sh', [`${r.yol}/.githooks/${kanca}`], {
    cwd: r.yol,
    encoding: 'utf8',
    env: { ...process.env, PY_LOG: r.pyLog },
  })

  // İKİ LOG DA İZLENİR: sahte python yalnız `PY_LOG`'a yazar, kancanın kendi satırları
  // `orion-*.log`'a. Tek dosyaya bakan ilk sürümüm post-commit kolunda zaman aşımına düştü —
  // beklenen iz öteki dosyadaydı ve ölçüm hiçbir zaman "bitti" göremedi.
  const izlenen = kanca === 'post-merge' ? `${r.gitDir}/orion-postmerge.log` : `${r.gitDir}/orion-doc.log`
  const bitti = Date.now() + 15_000
  let birlesik = ''
  while (Date.now() < bitti) {
    birlesik = dosyaOku(r.pyLog) + '\n----LOG----\n' + dosyaOku(izlenen)
    if (birlesik.includes(bitisIzi)) break
    execFileSync(process.execPath, ['-e', 'setTimeout(()=>{},250)'])
  }
  return birlesik
}

describe('INV-HOOKS-2 · companion kapsam süzgeci TEK uygulama', () => {
  it('post-merge KAPSAM DIŞI dosya için companion ÜRETMEZ (bugünün alarm gürültüsünün kökü)', () => {
    const r = kur('hooks-pm')

    const cikti = kancaKos(r, 'post-merge', '=== bitti')

    expect(cikti, 'kapsamdaki kaynak hedeflenmedi — süzgeç fazla kesiyor').toContain('src/lib/gercek.ts')
    expect(cikti, 'kök seviyesi kaynak hedeflenmedi (post-merge eskiden yalnız src/ bakıyordu)').toContain(
      'next.config.mjs',
    )
    expect(
      cikti,
      'src DISI kaynak hedeflenmedi — kapsam yol derinligiyle daraltilmis demektir; masterda ' +
        'TRACKED duran 46 gercek companion tam bu yuzden uretilmeyecekti',
    ).toContain('supabase/functions/_shared/kritik.ts')
    expect(
      cikti,
      'TEST DOSYASI hedeflendi — post-merge süzgeci hâlâ post-commit ile aynı değil; bu tam olarak ' +
        'filo genelinde "başkası dosyamı kirletti" alarmlarını yağdıran davranış',
    ).not.toContain('sahte.test.ts')
    expect(cikti, 'skip_files listesindeki index.ts hedeflendi').not.toContain('src/lib/index.ts')
  }, 60_000)

  it('post-commit AYNI kapsamı verir — iki kanca aynı girdide aynı kümeyi hedefler', () => {
    const r = kur('hooks-pc')

    const cikti = kancaKos(r, 'post-commit', 'PYCALL')

    expect(cikti).toContain('src/lib/gercek.ts')
    expect(cikti).toContain('next.config.mjs')
    expect(cikti, 'post-commit src disi kaynagi hedeflemedi').toContain('supabase/functions/_shared/kritik.ts')
    expect(cikti, 'post-commit test dosyasını hedefledi').not.toContain('sahte.test.ts')
    expect(cikti, 'post-commit skip_files dosyasını hedefledi').not.toContain('src/lib/index.ts')
  }, 60_000)

  it('SÜZGEÇ DOSYASI YOKSA sessizce süzgeçsiz ÜRETMEZ, GÖRÜNÜR uyarır', () => {
    // I18N'in shim bulgusu: canlı kanca `$ROOT/.githooks/<ad>` çalıştırır, yani davranış
    // DALA BAĞLI. Süzgeci içermeyen eski bir dalda süzgeçsiz üretmek, onarılan arızanın aynısı.
    const r = kur('hooks-yok', { scopeKopyala: false })

    const cikti = kancaKos(r, 'post-merge', 'KAPSAM SUZGECI YOK')

    expect(cikti, 'atlama SESSİZ — "kanca koştu" ile "kanca süzgeçsiz koştu" ayırt edilemez').toContain(
      'KAPSAM SUZGECI YOK',
    )
    expect(cikti, 'süzgeç yokken companion üretmeye çalıştı').not.toContain('doc single')
  }, 60_000)

  it('YAPISAL DESTEK: kancalarda İKİNCİ bir uzantı süzgeci kalmamış olmalı', () => {
    // Davranış kolları geçerken bile, kancanın içinde kendi grep zinciri kalmışsa süzgeç yine
    // iki yerdedir ve sürükleniyor. Bu kol o ihtimali kapatır.
    for (const [ad, yol] of [
      ['post-commit', KAYNAK.postCommit],
      ['post-merge', KAYNAK.postMerge],
    ] as const) {
      const metin = dosyaOku(yol)
      const kodSatirlari = metin
        .split('\n')
        .filter((s) => !s.trim().startsWith('#'))
        .join('\n')
      expect(kodSatirlari, `${ad} hâlâ kendi uzantı süzgecini taşıyor`).not.toMatch(
        /grep -E ['"][^'"]*\\\.\(ts\|tsx/,
      )
      expect(kodSatirlari, `${ad} paylaşılan süzgece başvurmuyor`).toContain('DOC_SCOPE')
    }
  }, 60_000)

  it('SSOT okunamazsa YEDEK süzgece düşer ama SESSİZ kalmaz', () => {
    const r = kur('hooks-yaml')
    // `.cc_docs.yaml` çok satırlı biçimde yeniden üretilirse ayrıştırıcı düşer. O hâl
    // sessizce "kapsam boş" olmamalı — companion üretimi durur ve kimse fark etmez.
    dosyaYaz(`${r.yol}/.cc_docs.yaml`, 'skip_dirs:\n  - __tests__\n  - tests\n')

    const cikti = kancaKos(r, 'post-merge', '=== bitti')

    expect(cikti, 'SSOT düştü ve bu hiçbir yere yazılmadı').toContain('SSOT OKUNAMADI')
    expect(cikti, 'yedek süzgeç de test dosyasını kesmeli').not.toContain('sahte.test.ts')
    expect(cikti, 'yedeğe düşünce üretim TAMAMEN durdu — sessiz kayıp sınıfı').toContain(
      'src/lib/gercek.ts',
    )
  }, 60_000)
})
