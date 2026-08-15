import { describe, expect, it } from 'vitest'

/**
 * INV-HOOKS-1 · Versiyonlanan git kancalarının bütünlüğü.
 *
 * NİÇİN VAR — üçü de yaşandı, tahmin değil (2026-08-15):
 *
 *  1) **Kanca versiyonlandı ama biri unutuldu.** `pre-commit` ve `post-commit`
 *     `.githooks/`'a taşındı, `post-merge` `.git/hooks/` içinde kaldı. Orada da
 *     aşağıdaki (2) numaralı hatayı taşıyordu — yani hem bozuktu hem görünmezdi.
 *     Taze klon/yeni worktree onu hiç almadı.
 *
 *  2) **`$REPO_ROOT/.git/...` yolu worktree'de patlar.** Worktree'de `.git` bir DİZİN
 *     değil, ana repoya işaret eden bir DOSYADIR. Yönlendirme "Not a directory" verir ve
 *     kabuk, yönlendirme başarısız olunca alt-kabuğu HİÇ ÇALIŞTIRMAZ. Kaybolan bir log
 *     satırı değil, işin TAMAMI. Ölçüldü: ana repo logunun son satırı 08-14 12:31 —
 *     iş worktree'lere taşındığından beri companion üretimi de registry-sync de ölüydü.
 *
 *  3) **README kurulum adımı olarak yanlış komutu veriyordu.** `git config core.hooksPath
 *     .githooks` depo-geneli bir ayardır ama `.githooks/` dala bağlıdır → dalında dizin
 *     olmayan worktree'nin BÜTÜN kancaları sessizce kapanır. `setup-hooks.mjs` bu ayarı
 *     artık kaldırıyor; README'nin onu tavsiye etmeye devam etmesi aktif zarardı.
 *
 * Bu bekçi statiktir: kanca metinlerini okur. `pnpm build`/`tsc`/`lint` bu sınıfı GÖRMEZ —
 * kabuk betiği onların derleme yolunda değildir.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

/**
 * ÖLÇÜLDÜ: `/src/**` glob'ları anahtarları baştaki `/` ile döndürürken bu desen
 * `.githooks/README.md` (eğik çizgisiz) döndürüyor. Anahtar biçimine güvenme —
 * normalize et; yoksa `SOURCES['/.githooks/README.md']` sessizce `undefined` olur
 * ve bekçi "dosya yok" diye değil, hiç kontrol etmeden yeşil geçer.
 */
function normalize(sources: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(sources).map(([p, src]) => [p.replace(/^\//, ''), src]),
  )
}

const HOOK_SOURCES = normalize(
  import.meta.glob('/.githooks/*', { query: '?raw', import: 'default', eager: true }),
)

const PACKAGE_JSON = normalize(
  import.meta.glob('/package.json', { query: '?raw', import: 'default', eager: true }),
)

/** README hariç, gerçek kanca dosyaları. */
const hookEntries = Object.entries(HOOK_SOURCES).filter(([p]) => !p.endsWith('.md'))
const hookNames = hookEntries.map(([p]) => p.split('/').pop() as string).sort()

/**
 * Yorum satırlarını at. Kancaların başındaki gerekçe blokları HATALI kalıbı bilerek
 * alıntılıyor ("şunu yazma: ..."); anlatımı ihlal saymak, gerekçe yazmayı cezalandırırdı.
 */
function kodSatirlari(src: string): string {
  return src
    .split('\n')
    .filter((l) => !/^\s*#/.test(l))
    .join('\n')
}

/** Versiyonlanmış olması ZORUNLU kancalar — biri düşerse sessiz gerileme olur. */
const ZORUNLU = ['post-commit', 'post-merge', 'pre-commit']

describe('INV-HOOKS-1 · versiyonlanan git kancaları', () => {
  it('bekçinin okuduğu dizin duruyor (stale-guard)', () => {
    expect(
      hookEntries.length,
      '.githooks/ okunamadı — dizin taşındıysa bekçinin yolunu güncelle, testi silme.',
    ).toBeGreaterThan(0)
  })

  it('zorunlu kancaların hepsi .githooks/ içinde (yalnız .git/hooks içinde DEĞİL)', () => {
    for (const ad of ZORUNLU) {
      expect(
        hookNames,
        `"${ad}" .githooks/ içinde yok. Yalnız .git/hooks'ta duran kanca versiyonlanmamıştır: ` +
          'taze klon ve yeni worktree onu hiç görmez, onarım tek makinede kalır.',
      ).toContain(ad)
    }
  })

  it('hiçbir kanca $REPO_ROOT/.git/ yolunu kullanmıyor (worktree\'de patlar)', () => {
    // Değişken adı ne olursa olsun: "<bir yol değişkeni>/.git/" kalıbı yasak.
    const YASAK = /\$\{?[A-Za-z_][A-Za-z0-9_]*\}?\/\.git\//
    const ihlal = hookEntries
      .filter(([, src]) => YASAK.test(kodSatirlari(src)))
      .map(([p]) => p)

    expect(
      ihlal,
      `Bu kancalar worktree'de sessizce hiç koşmaz: ${ihlal.join(', ')}. ` +
        '`git rev-parse --absolute-git-dir` kullan (bkz. .githooks/README.md).',
    ).toEqual([])
  })

  it('log yazan kancalar --absolute-git-dir ile yolu çözüyor', () => {
    // "log YAZAN" = gerçekten yönlendiren. `pre-commit` yalnız kullanıcıya log yolunu
    // SÖYLÜYOR (echo); onu ihlal saymak yanlış-pozitif olurdu — ölçüldü, kırmızı verdi.
    const LOG_YONLENDIRMESI = />>?\s*"[^"]*\.log"/
    for (const [p, src] of hookEntries) {
      if (!LOG_YONLENDIRMESI.test(kodSatirlari(src))) continue
      expect(
        src,
        `${p} log yazıyor ama --absolute-git-dir kullanmıyor — worktree'de yol yanlış olur.`,
      ).toMatch(/rev-parse --absolute-git-dir/)
    }
  })

  it('her kanca kabuk shebang\'i ile başlıyor', () => {
    for (const [p, src] of hookEntries) {
      expect(src.startsWith('#!/bin/sh'), `${p} "#!/bin/sh" ile başlamıyor.`).toBe(true)
    }
  })

  it('README kanca tablosu her kancayı listeliyor', () => {
    const readme = HOOK_SOURCES['.githooks/README.md']
    expect(readme, '.githooks/README.md bulunamadı.').toBeTruthy()

    for (const ad of hookNames) {
      expect(
        readme.includes(`\`${ad}\``),
        `README kanca tablosunda "${ad}" yok — listelenmeyen kanca görünmez kancadır.`,
      ).toBe(true)
    }
  })

  it('README artık core.hooksPath kurulumunu TAVSİYE etmiyor', () => {
    const readme = HOOK_SOURCES['.githooks/README.md']
    // Komut yasaklı değil (yanlış olduğunu ANLATMAK için geçmesi gerekiyor);
    // yasak olan onu bir kurulum adımı gibi sunmak.
    const kurulumBolumu = readme.slice(0, readme.indexOf('## Kancalar'))
    const uyariVar = /⛔[^\n]*core\.hooksPath/.test(kurulumBolumu)
    expect(
      uyariVar,
      'README kurulum bölümünde core.hooksPath için ⛔ uyarısı yok. Bu komut worktree ' +
        'başına farklı dallarda çalışan eş-oturumların kancalarını sessizce kapatır.',
    ).toBe(true)
  })

  it('shim kurulumu pnpm install\'a bağlı (prepare)', () => {
    const pkg = PACKAGE_JSON['package.json']
    expect(pkg, 'package.json okunamadı.').toBeTruthy()
    expect(
      pkg,
      '"prepare" script\'i setup-hooks.mjs\'i çağırmıyor — kancalar kurulmaz, ' +
        'kimse de kurmayı hatırlamaz.',
    ).toMatch(/"prepare":\s*"[^"]*setup-hooks\.mjs/)
  })
})
