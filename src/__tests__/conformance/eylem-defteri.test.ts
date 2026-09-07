// @vitest-environment node
//
// Kanca saf Node'dur; DOM ortamı yalnız maliyet ve kırılganlıktır.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-EYLEM-DEFTERI — `.claude/hooks/eylem-defteri.cjs`
 *
 * NİÇİN VAR — ölçülmüş vaka, 2026-09-06/07:
 * 06:55Z'de `~/.claude/skills` altından **20 beceri karantinaya taşındı**. Öğleden sonra Recep
 * "bugün pek çok skill temizlendi" dedi ve **hiçbir şerit bulamadı** — taşımayı yapan oturum
 * compact'ten sonra hatırlamıyordu, hiçbir yere yazmamıştı. Üç şerit ayrı ayrı aradı; iz ancak
 * dizin damgasından çıktı, NE taşındığı hiçbir yerde yoktu. Cevabı en sonunda insan verdi.
 *
 * ⭐BOŞLUĞUN ADI: `bash-write-audit.cjs` `git status` deltası ölçer, yani DEPO İÇİNİ görür.
 * Beceri dizini depo DIŞINDADIR; git onu hiç görmez. Kaybolan sınıf tam buydu.
 *
 * Bu kapı davranışı ölçer: kancayı GERÇEK stdin ile ÇALIŞTIRIR, defter dosyasını okur.
 * Statik tarama değil — "kaydeder" demek, kaydettiğini görmekle aynı şey değildir.
 */

const KOK = process.cwd()
const KANCA = path.join(KOK, '.claude', 'hooks', 'eylem-defteri.cjs')

/** Kancayı izole bir pano diziniyle koşturur ve o dizindeki defter satırlarını döndürür. */
function kancayiKostur(komut: string, opts: { toolName?: string; cwd?: string } = {}) {
  const pano = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-eylem-'))
  const girdi = JSON.stringify({
    session_id: 'aaaaaaaa-1111-4111-8111-111111111111',
    tool_name: opts.toolName ?? 'Bash',
    tool_input: { command: komut },
    cwd: opts.cwd ?? KOK,
  })
  execFileSync(process.execPath, [KANCA], {
    input: girdi,
    env: { ...process.env, VENTHUB_BOARD_DIR: pano },
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  const dosya = path.join(pano, '.eylem-defteri.aaaaaaaa.jsonl')
  if (!fs.existsSync(dosya)) return []
  return fs
    .readFileSync(dosya, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((s) => JSON.parse(s) as { fiiller: string[]; repoDisiYollar: string[]; yollar: string[]; komut: string })
}

describe('INV-EYLEM-DEFTERI: giṫin görmediği taşıma/silme deftere geçer', () => {
  it('kanca dosyası VAR ve okunabiliyor (kapı KÖR koşmasın)', () => {
    expect(fs.existsSync(KANCA), 'kanca yok — kapı hiçbir şey ölçmüyor ama yeşil yanardı').toBe(true)
    expect(fs.readFileSync(KANCA, 'utf8').length).toBeGreaterThan(500)
  })

  /**
   * ⭐ASIL VAKA. Bu kol düşerse defterin varlık sebebi ölmüştür: 20 becerinin taşındığı
   * komut yine hiçbir yere yazılmaz.
   */
  it('BECERİ TAŞIMASI kaydedilir ve DEPO DIŞI işaretlenir (2026-09-06 vakası)', () => {
    const satirlar = kancayiKostur('mv ~/.claude/skills/pptx C:/tmp/skills-kaldir-2026-09-06/')
    expect(satirlar.length, 'ev dizinindeki taşıma deftere HİÇ girmedi').toBe(1)
    expect(satirlar[0].fiiller).toContain('mv')
    expect(
      satirlar[0].repoDisiYollar.some((y) => y.includes('.claude/skills')),
      'taşınan yol DEPO DIŞI sayılmadı — `~` çözülmüyorsa cwd\'ye göre çözülür ve depo içi sanılır (ölçülmüş kusur)',
    ).toBe(true)
  })

  it('PowerShell silmesi de görülür (bu makinede iki kabuk birden koşuyor)', () => {
    /**
     * ⭐YOL FİKSTÜRÜ KİMLİK TAŞIMAZ ve PLATFORMDAN TÜRETİLİR (CI'da ölçüldü, 2026-09-07):
     * ilk yazımda burada kullanıcı adı içeren mutlak bir Windows yolu vardı. İki zarar birden —
     * INV-MUTLAK-YOL-1 kapısı onu kimlik sızıntısı olarak yakaladı (depo PUBLIC), VE Linux
     * koşucusunda o dize mutlak sayılmadığı için `cwd`ye göre çözülüp "depo içi" sanıldı,
     * kol kırmızı verdi. `os.homedir()` ikisini birden çözer: kimlik yok, her platformda mutlak.
     */
    const evYolu = path.join(os.homedir(), '.claude', 'skills', 'docx').replace(/\\/g, '/')
    const satirlar = kancayiKostur(`Remove-Item ${evYolu} -Recurse`)
    expect(satirlar.length).toBe(1)
    expect(satirlar[0].fiiller).toContain('Remove-Item')
    expect(satirlar[0].repoDisiYollar.length, 'PowerShell yolu depo dışı sayılmadı').toBeGreaterThan(0)
  })

  /**
   * ⭐WORKTREE = DEPO. İşin çoğu `C:/tmp/vh-*` altında koşar ve o yollarda depo adı GEÇMEZ.
   * İlk yazımda ölçüt yolda "venthub-hvac" arıyordu ve worktree'deki her silme "depo dışı"
   * görünüyordu — yani defterin en çok kullanılacağı yer yanlış kovadaydı.
   */
  it('WORKTREE içindeki silme DEPO İÇİ sayılır (ad değil `.git` gerçeği ölçülür)', () => {
    const satirlar = kancayiKostur(`git -C ${KOK.replace(/\\/g, '/')} rm docs/eski.md`)
    expect(satirlar.length).toBe(1)
    expect(
      satirlar[0].repoDisiYollar,
      'worktree depo dışı sayıldı — ölçüt yol ADINA bakıyor olmalı, oysa `.git` aranmalı',
    ).toEqual([])
  })

  it('MSYS yolu (/c/...) Windows\'ta doğru çözülür', () => {
    // Git-Bash `/c/Users/...` verir; Windows Node bunu `C:\c\Users\...` diye çözer ve o YOKTUR.
    // Çeviri olmazsa ana dizindeki bir silme bile "depo dışı" görünür.
    const msys = '/' + KOK.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_m, d) => String(d).toLowerCase())
    const satirlar = kancayiKostur(`rm ${msys}/docs/x.md`)
    expect(satirlar.length).toBe(1)
    expect(satirlar[0].repoDisiYollar, 'MSYS yolu çevrilmiyor — depo içi silme dışarıda görünüyor').toEqual([])
  })

  describe('AYIRT EDİYOR MU — kaydetmemesi gereken haller', () => {
    it('zararsız komut kaydedilmez', () => {
      expect(kancayiKostur('git status --porcelain').length, 'okuma komutu deftere girdi — defter gürültüye boğulur').toBe(0)
    })
    it('Bash DIŞI araç kaydedilmez', () => {
      expect(kancayiKostur('mv a/b c/d', { toolName: 'Read' }).length).toBe(0)
    })
    it('fiil ADINA benzeyen kelime kaydedilmez (kapsam darlığı)', () => {
      // `remove-old.sh` içinde "rm" GEÇER ama fiil değildir; sınıf sessizce genişlemesin.
      expect(kancayiKostur('node scripts/normalize.mjs --dry-run').length).toBe(0)
    })
  })

  it('KOMUT kırpılırsa KIRPILDIĞI SÖYLENİR (sessiz kırpma = yanlış veri yayınlamak)', () => {
    const uzun = 'mv ~/.claude/skills/x C:/tmp/y/ # ' + 'a'.repeat(600)
    const satirlar = kancayiKostur(uzun)
    expect(satirlar.length).toBe(1)
    expect(satirlar[0].komut, 'kırpma SESSİZ yapıldı — okuyan tam komutu gördüğünü sanır').toMatch(/KIRPILDI/)
  })

  it('DEFTER ENGELLEMEZ: kanca daima 0 ile çıkar (bu bir kapı değil, kayıt)', () => {
    // execFileSync sıfırdan farklı çıkışta FIRLATIR; buraya gelmek zaten kanıttır.
    const satirlar = kancayiKostur('rm -rf C:/tmp/bir-sey')
    expect(satirlar.length).toBe(1)
  })
})
