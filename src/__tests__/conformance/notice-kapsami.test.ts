// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-NOTICE-KAPSAM-1 — lisans/yazar ibaresi taşıyan her skill, `NOTICE.md`'de geçer.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR — 2026-09-19'da ölçülmüş boşluk
 * ══════════════════════════════════════════════════════════════════════════════
 * `NOTICE.md` kendi kuralını yazıyor: *"dış kaynaktan uyarlanan her skill buraya bir satır
 * ekler."* Kural yazılıydı; **uygulanmamıştı.** Tarama, künyesinde `license: MIT` taşıyan DÖRT
 * skill'in listede hiç geçmediğini gösterdi (`fallow`, `git-commit`,
 * `vercel-react-best-practices`, `vercel-composition-patterns`) — üstelik **iki ayrı skill
 * ağacında** (`.claude/skills/` ve `.agent/skills/`, ikisi de aktif ve kasıtlı).
 *
 * ⛔ATIF BEYANLA KORUNMAZ. "Eksik satır görürsen ekle" cümlesi bir dilektir; ölçen bir kol
 * olmadan liste, eklenen her yeni skill'le sessizce bayatlar. Depo PUBLIC ve MIT atıf
 * ZORUNLU bir lisanstır: eksik atıf yalnız nezaket meselesi değil, lisans ihlalidir.
 *
 * ⭐ÖLÇÜT ADA DEĞİL İBAREYE BAĞLIDIR: kapı "hangi skill dışarıdan geldi" diye tahmin etmez,
 * **kaynağında ibare var mı** diye bakar. İbaresiz kaynak (ör. `graphify`) bu kapının konusu
 * değildir — Recep'in kalıbı gereği ondan kod alınmaz, yalnız referans verilir.
 *
 * Cetvel: `docs/standards/SOURCES.md` §C · atıf yeri: `NOTICE.md`.
 */
const KOK = process.cwd()
const NOTICE = path.join(KOK, 'NOTICE.md')
const AGACLAR = [path.join(KOK, '.claude', 'skills'), path.join(KOK, '.agent', 'skills')]

/**
 * Skill künyesinde AÇIK lisans ibaresi.
 *
 * ⛔"KAYNAK bloğu var mı" ÖLÇÜT DEĞİLDİR — ilk yazımda öyleydi ve kapı bizim KENDİ
 * skill'lerimizi (`venthub-tasarim-dili`, `video-kaynak`) üçüncü taraf sandı. CLAUDE.md kural 1
 * gereği bizim skill'lerimizin de KAYNAK/CETVEL bloğu vardır; blok "dışarıdan geldi" demez.
 * Ayırt etmeyen ölçüt ölçüm değildir. Ölçüt: **bir LİSANS ADI geçiyor mu.**
 */
const IBARE = /^\s*license:\s*(MIT|Apache[^\n]*|BSD[^\n]*|CC[ -]BY[^\n]*)\s*$/im
/** Gövdede açıkça adı geçen dış lisans (ör. task-observer'ın "CC BY 4.0" künyesi). */
const LISANS_ADI = /\b(MIT (?:License|©|lisans)|Apache License|BSD-[23]-Clause|CC[ -]BY(?:[ -]\d(?:\.\d)?)?)\b/

type Bulgu = { skill: string; yol: string; ibare: string }

/** İki ağacı tarar, künyesinde ibare taşıyan skill dosyalarını döndürür. */
function ibareTasiyanlar(): Bulgu[] {
  const out: Bulgu[] = []
  for (const agac of AGACLAR) {
    if (!fs.existsSync(agac)) continue
    for (const girdi of fs.readdirSync(agac, { withFileTypes: true })) {
      if (!girdi.isDirectory()) continue
      const dosya = path.join(agac, girdi.name, 'SKILL.md')
      if (!fs.existsSync(dosya)) continue
      const metin = fs.readFileSync(dosya, 'utf8')
      const m = IBARE.exec(metin)
      if (m) out.push({ skill: girdi.name, yol: path.relative(KOK, dosya).replace(/\\/g, '/'), ibare: m[1] })
      else {
        const l = LISANS_ADI.exec(metin)
        if (l) out.push({ skill: girdi.name, yol: path.relative(KOK, dosya).replace(/\\/g, '/'), ibare: l[1] })
      }
    }
  }
  return out
}

describe('INV-NOTICE-KAPSAM-1 · ibare tasiyan skill NOTICE ta gecer', () => {
  it('kapi VAKUMDA YESIL VERMEZ: iki agac da okunuyor ve ibare tasiyan skill BULUNUYOR', () => {
    /**
     * Sessiz-boş sınıfı: tarama bir gün hiçbir şey bulmazsa aşağıdaki asıl kol sıfır kayıt
     * üzerinde koşar ve GEÇER. O zaman kapı "atıf tam" demez, hiçbir şey demez.
     */
    const varOlan = AGACLAR.filter((a) => fs.existsSync(a))
    expect(varOlan.length, 'hicbir skill agaci bulunamadi — kapi kor').toBeGreaterThan(0)
    const bulgular = ibareTasiyanlar()
    expect(bulgular.length, 'ibare tasiyan skill BULUNAMADI — desen bozuldu, kapi hicbir sey olcmuyor').toBeGreaterThan(
      3,
    )
  })

  it('⭐ASIL İDDİA — ibare tasiyan HER skill NOTICE.md de geciyor (eski halde KIRMIZI)', () => {
    const notice = fs.readFileSync(NOTICE, 'utf8')
    const eksik = ibareTasiyanlar().filter((b) => !notice.includes(b.skill))
    expect(
      eksik.map((b) => `${b.skill} (${b.ibare}) → ${b.yol}`),
      'Bu skill ler kaynaklarinda lisans/yazar ibaresi TASIYOR ama NOTICE.md de gecmiyor. ' +
        'MIT atfi ZORUNLUDUR ve depo PUBLIC: eksik atif lisans ihlalidir. ' +
        'Cozum: NOTICE.md ye satir ekle (kaynak · lisans · ne alindi · nerede) ve SOURCES.md §C ye lisans kaydini yaz.',
    ).toEqual([])
  })

  it('NOTICE.md IKI SKILL AGACINI da adlandirir (yalniz birini yazmak otekini kunyesiz kullanmaktir)', () => {
    const notice = fs.readFileSync(NOTICE, 'utf8')
    expect(notice, 'NOTICE.md `.claude/skills/` yolunu hic anmiyor').toContain('.claude/skills/')
    expect(notice, 'NOTICE.md `.agent/skills/` yolunu hic anmiyor — ikinci agac kunyesiz').toContain('.agent/skills/')
  })

  it('SOURCES.md §C kalibi YAZILI: lisans HAVUZDA degil BILESENDE aranir (Recep karari 2026-09-19)', () => {
    const kaynaklar = fs.readFileSync(path.join(KOK, 'docs', 'standards', 'SOURCES.md'), 'utf8')
    expect(kaynaklar, 'SOURCES.md de §C LISANS KAYDI bolumu yok').toMatch(/LİSANS KAYDI|LISANS KAYDI/)
    expect(
      kaynaklar,
      'bilesen-bazinda kalip yazili degil — "havuz MIT" diye kod alinmasinin onunde yazili kural kalmaz',
    ).toMatch(/BİLEŞENDE|BILESENDE/)
  })
})
