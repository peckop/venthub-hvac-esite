import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CI-1 — zorunlu kontroller BİRLEŞİK ağacı test eder, dalın ucunu değil.
 *
 * NİÇİN VAR (T066-VH · 2026-08-16)
 *
 * GitHub required status check'leri **ADA** göre eşler, tetikleyici olaya göre değil.
 * Yani `workflow_dispatch` ile elle koşturulan bir `ci` koşusu da branch protection'ı
 * açar. Buraya kadar tasarım gereği — kaçış kapısı bilerek var.
 *
 * Zaaf, `actions/checkout` varsayılanının olay-bağımlı olmasından doğuyordu:
 *
 *   · `pull_request`       → `refs/pull/N/merge`  (PR head + base BİRLEŞİK)
 *   · `workflow_dispatch`  → dalın UCU            (base hiç karışmaz)
 *
 * Elle alınan yeşil "bu dal kendi başına geçiyor" der; required check'in VAAT ETTİĞİ
 * ise "master'la birleştiğinde geçiyor"dur. İkisi farklı sorudur ve fark tam olarak
 * en tehlikeli anda ortaya çıkar: dal yazılırken master ilerlemişse.
 *
 * ÖLÇÜLDÜ, varsayılmadı: PR #557 (2026-08-16 06:52) açılışında otomatik kontroller
 * HİÇ ateşlenmedi; `ci` ve `admin-smoke` 07:04'te elle `workflow_dispatch` ile koştu
 * ve o yeşil merge'i açtı. Otomatik `pull_request` koşuları ancak 07:47'de, yeni bir
 * push ile geldi. Yani birleşik ağaç bir kez bile test edilmeden kapı açılmıştı.
 *
 * ── İKİNCİ KURAL: job ADI dokunulmaz ────────────────────────────────────────
 * Branch protection kontrolü ADIYLA bekler. Bir job yeniden adlandırılırsa AÇIK olan
 * TÜM PR'lar "beklenen kontrol hiç gelmedi" diyerek kilitlenir ve bunu ancak insan
 * çözebilir. Bu yüzden adlar burada da sabitlenir: kapsamı genişletirken workflow'un
 * ADI değişebilir, job id'si DEĞİŞMEZ.
 *
 * Sınır: branch protection ayarları repodan okunamaz. Aşağıdaki liste 2026-08-16'da
 * `gh pr checks` çıktısından ÖLÇÜLDÜ. Zorunlu kontrol kümesi değişirse bu liste elle
 * güncellenmeli — ve o an bu testin kırmızı yanması istenen davranıştır.
 */

/**
 * ⚠️ NOKTA-DİZİN GLOB TUZAĞI — ölçüldü, tahmin edilmedi (2026-08-16).
 *
 * İlk sürüm `import.meta.glob('/.github/workflows/*.yml', …)` kullanıyordu ve
 * `workflows['/.github/workflows/ci.yml']` **undefined** dönüyordu. İlk teşhisim
 * "glob nokta-dizinleri atlıyor" oldu; YANLIŞTI. Ölçünce görüldü:
 *
 *   · `/src/**` globunun anahtarları  → `/src/...`      (BAŞTA eğik çizgi VAR)
 *   · `/.github/**` globunun anahtarları → `.github/...`  (BAŞTA eğik çizgi YOK)
 *
 * Yani glob 24 dosyayı buluyordu; sorun anahtar biçimiydi. En sinsi yanı şu: bir
 * "kaç dosya bulundu" sağlık kontrolü GEÇER (liste dolu), ama tam-anahtarla yapılan
 * her arama sessizce `undefined` döner — kapı dosyayı hiç okumadan yeşil kalır.
 *
 * Bu yüzden burada `node:fs` kullanılıyor: anahtarları BİZ üretiyoruz, dolayısıyla
 * biçim varsayım olmaktan çıkıyor. (Yalnız içeriğe göre filtreleyen testler —
 * ör. `shipping-alarm-ops` — anahtar biçiminden etkilenmez ve glob orada sorunsuz.)
 */
const WORKFLOW_DIR = path.resolve(__dirname, '../../../.github/workflows')

const workflows: Record<string, string> = Object.fromEntries(
  readdirSync(WORKFLOW_DIR)
    .filter((f) => f.endsWith('.yml'))
    .map((f) => [`/.github/workflows/${f}`, readFileSync(path.join(WORKFLOW_DIR, f), 'utf8')]),
)

/** 2026-08-16'da ölçüldü: branch protection'ın beklediği kontrol adları. */
const ZORUNLU: ReadonlyArray<{ dosya: string; jobId: string }> = [
  { dosya: '/.github/workflows/ci.yml', jobId: 'ci' },
  { dosya: '/.github/workflows/e2e-smoke.yml', jobId: 'admin-smoke' },
]

function icerik(dosya: string): string {
  const src = workflows[dosya]
  expect(src, `${dosya} bulunamadı. Workflow taşındıysa ZORUNLU listesini güncelle.`).toBeTruthy()
  return src
}

describe('INV-CI-1 · zorunlu kontroller merge-ref test eder', () => {
  it('workflow taraması gerçekten dosya buluyor (dedektör sağlığı)', () => {
    // Boş glob "her şey uyumlu" gibi görünür — bu testin en olası kör kalma biçimi.
    expect(Object.keys(workflows).length).toBeGreaterThan(5)
  })

  for (const { dosya, jobId } of ZORUNLU) {
    it(`${jobId} · job id DEĞİŞMEMİŞ (branch protection adla eşler)`, () => {
      const y = icerik(dosya)
      expect(
        new RegExp(`^\\s{2}${jobId}:\\s*$`, 'm').test(y),
        `${dosya} içinde \`${jobId}\` job'ı yok. Yeniden adlandırıldıysa AÇIK olan tüm ` +
          "PR'lar \"beklenen kontrol gelmedi\" ile kilitlenir. Önce branch protection " +
          'kuralını güncelle, sonra job id\'sini — workflow ADI serbest, job id DEĞİL.',
      ).toBe(true)
    })

    it(`${jobId} · elle tetiklemede merge-ref'e geçiyor`, () => {
      const y = icerik(dosya)
      const dispatchVar = /^\s*workflow_dispatch:/m.test(y)
      if (!dispatchVar) {
        // Dispatch yoksa zaaf da yok; kural boşta kalır ama sessiz geçmesin diye yazılır.
        expect(dispatchVar).toBe(false)
        return
      }
      expect(
        /id:\s*mergeref/.test(y),
        `${dosya} \`workflow_dispatch\` kabul ediyor ama merge-ref çözümleme adımı yok. ` +
          'Elle koşturulan yeşil, required check\'i açar; ama dalın UCUNU test etmiş olur, ' +
          'master\'la birleşik hâli DEĞİL.',
      ).toBe(true)
      expect(
        /ref:\s*\$\{\{\s*steps\.mergeref\.outputs\.ref\s*\|\|\s*''\s*\}\}/.test(y),
        `${dosya} içindeki checkout adımı merge-ref çıktısını KULLANMIYOR. Adımın var ` +
          'olması yetmez — bir ismin dosyada geçmesi, o şeyin bağlandığı anlamına gelmez.',
      ).toBe(true)
      expect(
        /refs\/pull\/\$\{pr\}\/merge/.test(y),
        `${dosya} merge-ref biçimini üretmiyor (\`refs/pull/<N>/merge\` bekleniyor).`,
      ).toBe(true)
      expect(
        /-gt 1 \]/.test(y),
        `${dosya} aynı dal için birden çok açık PR durumunu ele almıyor. Rastgele birini ` +
          'seçmek YANLIŞ base\'e karşı yeşil üretebilir; belirsizlikte durmak gerekir.',
      ).toBe(true)
    })
  }

  /** Kapının kendisini kanıtla — sözdizimsel sağlık. */
  it('kendi kendini doğrular: desenler gerçek ve sahte biçimi ayırt ediyor', () => {
    const gercek = "        with:\n          ref: ${{ steps.mergeref.outputs.ref || '' }}\n"
    const sahte = '        with:\n          ref: ${{ github.sha }}\n'
    const re = /ref:\s*\$\{\{\s*steps\.mergeref\.outputs\.ref\s*\|\|\s*''\s*\}\}/
    expect(re.test(gercek)).toBe(true)
    expect(re.test(sahte)).toBe(false)

    // Job id deseni: girinti duyarlı olmalı, yoksa yorum içindeki "ci:" de eşleşir.
    const jobRe = /^\s{2}ci:\s*$/m
    expect(jobRe.test('jobs:\n  ci:\n    runs-on: x')).toBe(true)
    expect(jobRe.test('# eskiden  ci: vardi\njobs:\n  baska:\n')).toBe(false)
  })
})
