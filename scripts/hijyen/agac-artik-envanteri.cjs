#!/usr/bin/env node
/**
 * ÇALIŞMA AĞACI ARTIK ENVANTERİ — SALT OKUMA (REC-142 · DoD 4, REC-107 ile birlikte).
 *
 * NİÇİN VAR: 2026-09-05 ölçümü — 37 çalışma ağacında ~411 bekleyen değişiklik, ezici
 * çoğunluğu `.md`. Sebebi bu işin kendisiydi: taşıyıcı 08-28'de kapandı ama `post-commit`
 * ve `post-merge` üretmeye devam etti; `post-merge` `pull` ile tetiklendiği için ŞERİDİN
 * ağacını şeridin haberi olmadan kirletti.
 *
 * ⛔BU BETİK HİÇBİR ŞEY SİLMEZ, GERİ ALMAZ, YAZMAZ. Yalnız sınıflandırır ve raporlar.
 * Temizlik kararı ayrı ve sahibinin; `git stash clear` YASAK (fleet kuralı).
 *
 * ⭐NİÇİN SINIFLANDIRMA ŞART — ÖLÇÜLDÜ, VARSAYILMADI: "hepsi .md, hepsi çöp" demek iş
 * kaybettirirdi. `venthub-wt-quote` ağacında 46 kirli dosyanın yalnız 6'sı `.md`; kalan 40'ı
 * `.archive` altındaki arşiv `.ps1` dosyaları (BOM/satır-sonu yeniden yazımı) ve o dalda
 * **3 GÖNDERİLMEMİŞ COMMIT** var. Körlemesine `git checkout --` orada gerçek iş silerdi.
 * (Glob deseni bu yoruma YAZILMADI: yıldız-yıldız-bölü dizisi blok yorumu erken kapatıyor;
 * aynı tuzağa 09-04'te de düşülmüştü.)
 *
 * SINIFLAR:
 *   URETILMIS  — doküman hattının ürettiği artık; geri alınması GÜVENLİ (sahibi onaylarsa).
 *                · `docs/*_master.md`, `docs/system_tree.md`, `docs/artefakt_manifest.json`
 *                · companion: `X.md` ve yanında `X.<kaynak-uzantısı>` DURUYOR
 *   SUPHELI    — `.md` ama companion değil / eşleşen kaynağı yok → ELLE YAZILMIŞ olabilir.
 *   GERCEK_IS  — geri kalan her şey. DOKUNULMAZ, sahibine panodan yazılır.
 *
 * ⭐ÜRETECİN İMZASI (bu envanterin doğduğu bulgu): üreteç ağacın ADINI belgeye gömüyor —
 * `# Veritabani Semasi — vh-t137`. Yani aynı kaynak, hangi ağaçta derlendiğine göre FARKLI
 * çıktı veriyor. Bu yüzden bu artıkların "değişiklik" görünmesi içerikten değil KİMLİKTEN
 * geliyor; geri almak bilgi kaybetmez.
 */
'use strict'

const path = require('path')
const { execFileSync } = require('child_process')

const KAYNAK_UZANTILARI = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.ps1', '.sh', '.sql']

function git(args, kok) {
  try {
    return execFileSync('git', args, { cwd: kok, encoding: 'utf8', timeout: 60_000 })
  } catch {
    return ''
  }
}

function agaclar() {
  const cikti = git(['worktree', 'list', '--porcelain'], process.cwd())
  return cikti.split('\n').filter(s => s.startsWith('worktree ')).map(s => s.slice(9).trim())
}

/**
 * Bir yolun sınıfını söyler. SAF: dosya sistemine bakmaz, `git ls-files` kümesine bakar.
 * NİÇİN İZLENEN KÜMESİ, DİSK DEĞİL: "diskten sildim ama commit etmedim" durumunda disk
 * taraması companion'ı kaynaksız sanır ve ŞÜPHELİ'ye atar. Doğru soru "DEPODA kaynak var
 * mı?" — aynı gerekçe INV-DOC-1'de de yazılı (companion-doc-standard §C1).
 */
function sinifla(yol, izlenenSet) {
  if (/^docs\/[^/]+_master\.md$/.test(yol)) return 'URETILMIS'
  if (yol === 'docs/system_tree.md' || yol === 'docs/artefakt_manifest.json') return 'URETILMIS'
  if (yol.endsWith('.md')) {
    const taban = yol.slice(0, -3)
    const kaynakVar = KAYNAK_UZANTILARI.some(u => izlenenSet.has(taban + u))
    return kaynakVar ? 'URETILMIS' : 'SUPHELI'
  }
  return 'GERCEK_IS'
}

function main() {
  // Uzaktaki dal adları TEK SEFERDE okunur (dal başına ağ çağrısı 37 ağaçta pahalı).
  // Ağ yoksa küme BOŞ kalır ve her dal "uzakta yok" sayılır — yani fail-closed: ölçemediğimizde
  // ağaçlar RİSKLİ görünür, dokunulmaz. Ölçememek "temiz" demek DEĞİLDİR.
  const uzakDallar = new Set(
    git(['ls-remote', '--heads', 'origin'], process.cwd())
      .split('\n')
      .map(s => s.split('refs/heads/')[1])
      .filter(Boolean)
      .map(s => s.trim()),
  )

  const satirlar = []
  const toplam = { URETILMIS: 0, SUPHELI: 0, GERCEK_IS: 0 }
  let agacSayisi = 0
  let riskliAgac = 0

  for (const kok of agaclar()) {
    const durum = git(['status', '--porcelain'], kok).split('\n').filter(Boolean)

    /**
     * ⛔ÖLÇÜM TUZAĞI — İLK SÜRÜMDE BU BLOK YOKTU VE İKİ DALI KAYBEDİYORDUK.
     *
     * `git log @{u}..` bir dalın UPSTREAM'İ YOKSA hata verir; sarmalayıcı boş dönerdi ve
     * sayı **0** çıkardı. Yani "hiç push edilmemiş dal" — yani riskin EN YÜKSEK hâli —
     * envanterde "temiz" görünüyordu. 2026-09-05'te ölçüldü: `edge/t137-uc-2-2`
     * (master'dan 3 commit ileri) ve `docs/t118-bildirim-cetveli-v11` (3 commit) hiçbir
     * uzakta YOKTU ve ikisi de RİSKSİZ işaretlenmişti.
     *
     * Ders adıyla: *ölçememek geçmek değildir.* Upstream yoksa cevap "0" değil,
     * "hepsi gönderilmemiş"tir.
     */
    const dal = git(['branch', '--show-current'], kok).trim()

    /**
     * ⭐ÖLÇÜT URUN'DAN GELDİ VE BENİMKİNDEN GÜÇLÜ (2026-09-05):
     * "upstream var mı" YETMEZ — upstream `origin/master`'ı gösteriyorsa **dalın kendisi
     * uzakta YOKTUR** ve kaybolmaya en açık sınıf tam olarak odur. Doğru soru:
     * *dal origin'de duruyor mu?* (`git ls-remote --heads`, burada tek seferde okunup
     * kümeye alınır — dal başına ağ çağrısı 37 ağaçta pahalıdır).
     */
    const uzaktaVar = dal ? uzakDallar.has(dal) : false
    const masterDisi = dal
      ? Number(git(['rev-list', '--count', `origin/master..${dal}`], kok).trim() || 0)
      : 0
    // "master'dan ileri" ≠ "kaybolacak iş": içerik squash ile inmiş olabilir. Ayırt eden
    // ölçüt `git cherry` — master'da EŞDEĞERİ olmayan commit'ler ('+' ile işaretli).
    const cherry = dal ? git(['cherry', 'origin/master', dal], kok) : ''
    const gercektenYeni = cherry.split('\n').filter(s => s.startsWith('+')).length
    const gonderilmemis = uzaktaVar ? masterDisi : gercektenYeni
    if (durum.length === 0) continue
    agacSayisi++

    const izlenen = new Set(git(['ls-files'], kok).split('\n').filter(Boolean))
    const kova = { URETILMIS: [], SUPHELI: [], GERCEK_IS: [] }
    for (const s of durum) {
      const yol = s.slice(3).trim().replace(/^"|"$/g, '')
      kova[sinifla(yol, izlenen)].push(yol)
    }
    for (const k of Object.keys(toplam)) toplam[k] += kova[k].length

    /**
     * ⭐İKİ EKSEN AYRI — İLK SÜRÜMDE BUNLARI BİRBİRİNE BAĞLAMIŞTIM VE YANLIŞTI.
     *
     * (a) COMMIT KAYBI RİSKİ: dal origin'de yok ve master'da eşdeğeri olmayan commit
     *     taşıyor. Çaresi PUSH'tur; çalışma ağacındaki dosyalarla ilgisi YOKTUR.
     * (b) DOSYA SINIFI: hangi dosyaya dokunulabilir. `git checkout -- <dosya>` yalnız
     *     ÇALIŞMA KOPYASINI geri alır; commit'lere, dallara, stash'e DOKUNMAZ.
     *
     * İkisini birbirine bağlamak, 25 ağacı gereksiz yere "dokunulmaz" ilan ediyordu —
     * oysa üretilmiş bir artığı geri almak, o ağaçta 14 gönderilmemiş commit olsa bile
     * o commit'lere hiçbir şey yapmaz. Doğru kural: **dosya sınıfına bak, commit'e değil.**
     */
    const kayipRiski = !uzaktaVar && gercektenYeni > 0
    if (kayipRiski) riskliAgac++
    const riskli = kayipRiski || kova.GERCEK_IS.length > 0 || kova.SUPHELI.length > 0

    satirlar.push(
      `${riskli ? '⛔' : '  '} ${path.basename(kok)}  ` +
      `[uretilmis ${kova.URETILMIS.length} · supheli ${kova.SUPHELI.length} · ` +
      `gercek-is ${kova.GERCEK_IS.length} · master-disi ${gonderilmemis}` +
      `${uzaktaVar ? '' : ` (DAL ORIGIN DE YOK — master ta esdegeri olmayan: ${gercektenYeni})`}]`,
    )
    satirlar.push(`     ${kok}`)
    if (kova.SUPHELI.length) satirlar.push(`     SUPHELI : ${kova.SUPHELI.slice(0, 5).join(', ')}${kova.SUPHELI.length > 5 ? ' …' : ''}`)
    if (kova.GERCEK_IS.length) satirlar.push(`     GERCEK  : ${kova.GERCEK_IS.slice(0, 5).join(', ')}${kova.GERCEK_IS.length > 5 ? ' …' : ''}`)
  }

  process.stdout.write('== CALISMA AGACI ARTIK ENVANTERI (SALT OKUMA) ==\n\n')
  process.stdout.write(satirlar.join('\n') + '\n\n')
  /**
   * ⚠STASH DEPO BAZINDADIR, AĞAÇ BAZINDA DEĞİL — bu yüzden BİR KEZ yazılır.
   * İlk sürümde her ağacın satırında basılıyordu ve 37 satırda "84" görünüyordu;
   * okuyan 37×84 = 3108 sanabilirdi. Sayı doğruydu, SUNUMU yanlış cevap üretiyordu.
   */
  const stashSayisi = git(['stash', 'list'], process.cwd()).split('\n').filter(Boolean).length

  process.stdout.write(
    `TOPLAM: uretilmis ${toplam.URETILMIS} · supheli ${toplam.SUPHELI} · ` +
    `gercek-is ${toplam.GERCEK_IS} · kirli agac ${agacSayisi} (${riskliAgac} tanesi RISKLI)\n` +
    `STASH: ${stashSayisi} (DEPO BAZINDA TEK LISTE — agac basina degil; silme YASAK)\n`,
  )
  process.stdout.write(
    '\nOKUMA KILAVUZU — IKI EKSEN AYRI:\n' +
    '  · RISKLI AGAC SAYISI = dali origin de OLMAYAN ve master ta esdegeri bulunmayan\n' +
    '    commit tasiyan agac. Caresi PUSH; calisma agaci dosyalariyla ILGISI YOK.\n' +
    '  · GERI ALMA yalniz URETILMIS kovasinda yapilir ve HER agacta guvenlidir:\n' +
    '    `git checkout -- <dosya>` commit e, dala, stash e DOKUNMAZ.\n' +
    '  · SUPHELI ve GERCEK_IS kovalarina DOKUNULMAZ, sahibine panodan yazilir.\n' +
    '  · `git stash clear` YASAK; stash sayisi burada yalniz GORUNUR kilinir.\n',
  )
}

if (require.main === module) main()
module.exports = { sinifla, KAYNAK_UZANTILARI }
