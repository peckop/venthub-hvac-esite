import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

/**
 * INV-DOC-1 · Companion doküman paritesi (kalıcı bekçi).
 *
 * 2026-08-17 ölçümü (T067 kapanışında QUOTE'un işaret ettiği boşluk): kod dizinlerinde
 * 668 companion `.md` vardı, 2'si YETİMDİ — kaynağı SİLİNMİŞ ya da YENİDEN ADLANDIRILMIŞ
 * dosyaları anlatıyorlardı:
 *   • src/components/admin/BulkActionToolbar.md → kaynağı #544'te BulkBar'a birleşti
 *   • src/components/products/3d/FanRenderer.md → ProductModelRenderer olarak yeniden adlandı
 *
 * NEDEN KAPI GEREKİYOR: companion'lar Orion/Corpus-Callosum hattıyla NotebookLM dijital
 * ikizine yükleniyor. Yetim companion "sessiz bayat doküman" değil, ikize giden AKTİF
 * YANLIŞ BİLGİ: RAG, var olmayan bir bileşeni varmış gibi anlatır ve buna dayanan mimari
 * cevaplar üretir. Hiçbir mevcut kapı görmüyordu — tsc/lint `.md`'ye bakmaz, build derlemez,
 * post-commit üretici yalnız EKLER (silinen kaynağın companion'ını kaldırmaz).
 *
 * Zorlanan kural (cetvel: docs/standards/companion-doc-standard.md §C1):
 *   Kod dizinlerindeki her `X.md` için aynı yolda bir kaynak dosya (`X.<uzantı>`) BULUNMALIDIR.
 *
 * ÖLÇÜM KAYNAĞI = `git ls-files` (disk DEĞİL) — bilinçli: "diskten sildim ama commit
 * etmedim" durumunda disk taraması yeşil verir, oysa depoda dosya durur ve ikize o gider.
 * Sorunun doğru hali "DEPODA yetim var mı?"dır. (2026-08-17'de tam bu farkı yaşadım:
 * ana çalışma dizininde iki dosya diskte silinmiş, git'te duruyordu.)
 *
 * NOT — yorum-sıyırma/CRLF tuzağı (crlf-blinds-conformance-regex) BU bekçi için
 * uygulanabilir DEĞİL: burada dosya İÇERİĞİNDE desen aranmıyor, dosya VARLIĞI ölçülüyor.
 * Regex yok → yorumun/CRLF'in körleştireceği bir iddia da yok. Bilerek-boz kanıtı yapıldı
 * (PR açıklamasında çıktı var).
 */

/** Companion'ın üretildiği kod kökleri — docs/ ve .agent/ altındaki elle yazılmış MD'ler companion DEĞİL. */
const CODE_ROOTS = ['src/', 'supabase/functions/', 'scripts/']

/** Bir companion'ın meşru kaynağı olabilecek uzantılar. */
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.ps1', '.sh', '.sql']

/**
 * Muafiyetler ADLA sabitlenir (cetvel §C2). Bunlar companion değil, elle yazılmış
 * dizin dokümanlarıdır; kaynak dosyası olması beklenmez.
 */
const EXEMPT_BASENAMES = /(^|\/)(README|CHANGELOG|LICENSE)\.md$/i

/** SAF çekirdek — testler bunu hem gerçek hem sentetik dosya listesiyle çağırır. */
export function findOrphanCompanions(trackedFiles: readonly string[]): string[] {
  const all = new Set(trackedFiles)
  const orphans: string[] = []

  for (const file of trackedFiles) {
    if (!file.endsWith('.md')) continue
    if (!CODE_ROOTS.some(root => file.startsWith(root))) continue
    if (EXEMPT_BASENAMES.test(file)) continue

    const base = file.slice(0, -'.md'.length)
    const hasSource = SOURCE_EXTENSIONS.some(ext => all.has(base + ext))
    if (!hasSource) orphans.push(file)
  }

  return orphans
}

function trackedFiles(): string[] {
  // execFile + argüman dizisi (kabuk yok, enterpolasyon yok).
  const out = execFileSync('git', ['ls-files'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  return out.split('\n').map(line => line.trim()).filter(Boolean)
}

describe('INV-DOC-1 · companion doküman paritesi', () => {
  it('kaynağı olmayan companion .md YOK (yetim doküman ikize yanlış bilgi taşır)', () => {
    const orphans = findOrphanCompanions(trackedFiles())
    expect(
      orphans,
      `Kaynağı olmayan companion .md bulundu. Kaynak silindiyse/yeniden adlandırıldıysa ` +
      `companion'ı da SİL (ya da meşruysa cetvel §C2 muafiyetine ADLA ekle): ${orphans.join(', ')}`,
    ).toEqual([])
  })

  /**
   * Dedektör sağlığı — SENTETİK örneklerle. Gerçek ihlal listesinin dolu olmasını şart
   * koşmak yasak: liste boşalınca kapı kendi başarı koşulunda kırılır ve doğru düzeltmeyi
   * ihlal gibi gösterir (ADMIN-OPS'un #557'de yaşadığı tuzak).
   */
  it('dedektör sağlığı: yetimi YAKALAR, eşli olanı yakalamaz', () => {
    const positive = findOrphanCompanions([
      'src/components/Ghost.md', // kaynağı yok → ihlal
      'src/components/Real.md',
      'src/components/Real.tsx', // eşli → temiz
    ])
    expect(positive).toEqual(['src/components/Ghost.md'])
  })

  it('yanlış-pozitif kontrolü: kapsam dışı MD, muafiyet ve .py/.sql kaynakları temiz sayılır', () => {
    const clean = findOrphanCompanions([
      'docs/standards/anything.md', // kod kökü değil → companion değil
      '.agent/skills/x/SKILL.md', // kod kökü değil
      'src/components/authority/README.md', // muaf (elle yazılmış dizin dokümanı)
      'scripts/compile_skills.md',
      'scripts/compile_skills.py', // Python kaynağı da meşru eş
      'supabase/functions/x/index.md',
      'supabase/functions/x/index.ts',
      'scripts/db/seed.md',
      'scripts/db/seed.sql', // SQL kaynağı da meşru eş
    ])
    expect(clean).toEqual([])
  })

  it('kapı gerçekten ölçüyor: kod dizinlerinde beklenen büyüklükte companion var', () => {
    // Kapsam sıfıra düşerse (kök adı değişti, glob bozuldu) test yeşil kalıp körleşmesin.
    const files = trackedFiles()
    const companions = files.filter(
      f => f.endsWith('.md') && CODE_ROOTS.some(r => f.startsWith(r)) && !EXEMPT_BASENAMES.test(f),
    )
    expect(companions.length, 'Kod dizinlerinde hiç companion görünmüyor — kökler mi değişti?').toBeGreaterThan(100)
  })
})
