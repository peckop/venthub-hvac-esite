import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-KATALOG-1 — ÜRETİLMİŞ katalog, kaynak yetenek ağacıyla AYNI EVRENİ anlatmalı.
 *
 * ⭐ÖLÇÜLEN KUSUR (REC-347, 2026-09-16): `.agent/plugins/venthub-core/manifest.yaml`
 * `scripts/compile_skills.py` tarafından ÜRETİLİR, ama depoda **yeniden üretilmemişti**.
 * Bayat kataloğun içinde `investigate` gibi yetenekler **HİÇ YOKTU**.
 *
 * Sonucu, bu projede tekrar eden kusur sınıfının bir örneği daha:
 * `scripts/skills-evaluator.py` yetenekleri **manifestten** gezdiği için var olmayanı hiç
 * sınamadı ve **"0 uyarı"** bastı. Üretici bir kez koşturulunca sayı 0 → 26 çıktı ve 25'i
 * ÖNCEDEN vardı. Yani ölçüt keskindi, **EVREN yanlıştı** — kapı kendi kör noktasını
 * "sorun yok" diye raporluyordu.
 *
 * ⛔KAPININ SINIRI, ADIYLA: bu bir YAML AYRIŞTIRICISI DEĞİLDİR ve öyle olamaz — depoda YAML
 * bağımlılığı yok (aynı ölçüm `skill-frontmatter-ayrisir.test.ts` başlığında da yazılı).
 * Bu yüzden kapı iki ÖLÇÜLEBİLİR şeye bakar: (a) yetenek AD KÜMESİ iki yönlü eşit mi,
 * (b) her yeteneğin katalogdaki `triggers_on` SAYISI, kaynak `metadata.triggers` sayısına
 * eşit mi. Tam içerik eşitliği iddia etmez; ama bugünkü kusuru (eksik yetenek) ve en yaygın
 * kayma biçimini (tetik listesi değişti, katalog değişmedi) yakalar.
 *
 * ⚠BU KAPI "KATALOG DOĞRU" DEMEZ, "KATALOG KAYNAKLA AYNI EVRENDE" DER. Üreticinin kendi
 * hatası bu kapıdan geçer; onun yeri `compile_skills.py`'nin kendi sınavıdır.
 *
 * ⚠KAPSAM `.agent/skills` İLE SINIRLI ve bu bilinçli: katalog yalnız o ağacı derliyor
 * (`compile_skills.py` satır ~123). `.claude/skills` tarafında katalog YOK — orada eşdeğer
 * kusur `skills-evaluator.py`'nin o ağacı hiç gezmemesidir, ki o AYRI bir borç (REC-347 EK).
 *
 * Cetvel: `uretilmis-artefakt-standard.md` (AXIOM 3 — üretilmiş dosya elle düzeltilmez,
 * üreticisi koşturulur) · `arac-envanteri-standard.md`.
 */

const KOK = path.resolve(__dirname, '..', '..', '..')
const KAYNAK_AGAC = path.join(KOK, '.agent', 'skills')
const KATALOG = path.join(KOK, '.agent', 'plugins', 'venthub-core', 'manifest.yaml')
const URETICI = path.join(KOK, 'scripts', 'compile_skills.py')
const URETICI_KOMUTU = 'python scripts/compile_skills.py'

/** Katalogdaki `  - name: <ad>` satırlarından yetenek adları. */
function katalogAdlari(ham: string): string[] {
  const out: string[] = []
  for (const satir of ham.split(/\r?\n/)) {
    const m = /^\s{2}- name:\s*(\S+)\s*$/.exec(satir)
    if (m) out.push(m[1])
  }
  return out
}

/** Kaynak ağaçta SKILL.md taşıyan dizin adları. */
function kaynakAdlari(): string[] {
  if (!fs.existsSync(KAYNAK_AGAC)) return []
  return fs
    .readdirSync(KAYNAK_AGAC, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(KAYNAK_AGAC, d.name, 'SKILL.md')))
    .map((d) => d.name)
    .sort()
}

/**
 * Bir YAML blok listesinin öğe SAYISI: `<anahtar>:` satırından sonra gelen `- ` satırları.
 * Ayrıştırıcı değil, SAYAÇ. Dönen -1 "o anahtar hiç yok" demektir ve bu, 0'dan AYRI bir
 * sonuçtur (biri "liste boş", öteki "liste yok").
 */
function listeUzunlugu(ham: string, anahtar: string, baslangic: number): number {
  const satirlar = ham.split(/\r?\n/)
  let i = satirlar.findIndex(
    (s, idx) => idx >= baslangic && new RegExp(`^\\s*${anahtar}:\\s*$`).test(s),
  )
  if (i === -1) return -1
  const girinti = /^(\s*)/.exec(satirlar[i])![1].length
  let n = 0
  for (i += 1; i < satirlar.length; i += 1) {
    const s = satirlar[i]
    if (s.trim() === '') continue
    const bu = /^(\s*)/.exec(s)![1].length
    if (/^\s*-\s+/.test(s) && bu >= girinti) {
      n += 1
      continue
    }
    if (bu <= girinti) break
  }
  return n
}

/** Katalogda bir yeteneğin girdisinin başladığı satır numarası (-1 = yok). */
function katalogGirdiSatiri(satirlar: string[], ad: string): number {
  return satirlar.findIndex((s) => new RegExp(`^\\s{2}- name:\\s*${ad}\\s*$`).test(s))
}

describe('INV-SKILL-KATALOG-1 · uretilmis katalog kaynakla ayni evrende', () => {
  const ham = fs.existsSync(KATALOG) ? fs.readFileSync(KATALOG, 'utf8') : ''
  const satirlar = ham.split(/\r?\n/)
  const katalog = katalogAdlari(ham).sort()
  const kaynak = kaynakAdlari()

  it('URETICI, KATALOG ve KAYNAK ucu de VAR (yoklugu kapinin sessizce gecmesine sebep olmasin)', () => {
    expect(fs.existsSync(URETICI), `uretici YOK: ${URETICI}`).toBe(true)
    expect(fs.existsSync(KATALOG), `katalog YOK: ${KATALOG}`).toBe(true)
    expect(
      kaynak.length,
      'kaynak agacta hic yetenek bulunamadi — kapi KOR kosuyor, yesili anlamsiz',
    ).toBeGreaterThan(0)
    expect(katalog.length, 'katalogda hic yetenek girdisi yok').toBeGreaterThan(0)
  })

  it('KAYNAKTA olup KATALOGDA olmayan yetenek YOK (bugunun kusuru: investigate eksikti)', () => {
    const eksik = kaynak.filter((a) => !katalog.includes(a))
    expect(
      eksik,
      `Katalog BAYAT. Kaynakta var, katalogda YOK: ${eksik.join(', ')}\n` +
        `      Bu dosya URETILMISTIR — elle EKLEME (AXIOM 3). Duzeltme: ${URETICI_KOMUTU}`,
    ).toEqual([])
  })

  it('KATALOGDA olup KAYNAKTA olmayan yetenek YOK (silinmis yetenek katalogda yasamasin)', () => {
    const hayalet = katalog.filter((a) => !kaynak.includes(a))
    expect(
      hayalet,
      `Katalog BAYAT. Katalogda var, kaynakta YOK: ${hayalet.join(', ')}\n` +
        `      Duzeltme: ${URETICI_KOMUTU}`,
    ).toEqual([])
  })

  it('her yetenegin TETIK SAYISI katalogda ve kaynakta AYNI (tetik degisip katalog degismesin)', () => {
    const uyusmayan: string[] = []
    for (const ad of kaynak) {
      const satir = katalogGirdiSatiri(satirlar, ad)
      if (satir === -1) continue // ayri kol olctu
      const skillHam = fs.readFileSync(path.join(KAYNAK_AGAC, ad, 'SKILL.md'), 'utf8')
      const kaynakSayi = listeUzunlugu(skillHam, 'triggers', 0)
      const katalogSayi = listeUzunlugu(ham, 'triggers_on', satir)
      if (kaynakSayi !== katalogSayi) {
        const g = (n: number) => (n === -1 ? 'yok' : String(n))
        uyusmayan.push(`${ad}: kaynak=${g(kaynakSayi)} katalog=${g(katalogSayi)}`)
      }
    }
    expect(
      uyusmayan,
      `Tetik sayilari KAYMIS:\n      ${uyusmayan.join('\n      ')}\n` +
        `      Duzeltme: ${URETICI_KOMUTU} (elle DUZELTME YOK — AXIOM 3)`,
    ).toEqual([])
  })

  it('⭐SABOTAJ: katalogdan BIR yetenek dusurulurse kapi onu GORUR (kor olmadiginin kaniti)', () => {
    // Gercek dosyaya DOKUNMAZ; kopya uzerinde olcer. Canli agaca yazan kapi, kardes
    // kapilarla yarisa girer (olculdu: arac-envanteri / render-revalidation vakasi).
    const kurban = kaynak[0]
    const bas = katalogGirdiSatiri(satirlar, kurban)
    expect(bas, `fikstur kurulamadi: ${kurban} katalogda bulunamadi`).toBeGreaterThan(-1)
    let son = bas + 1
    while (son < satirlar.length && !/^\s{2}- name:\s*\S+\s*$/.test(satirlar[son])) son += 1
    const sakat = [...satirlar.slice(0, bas), ...satirlar.slice(son)].join('\n')

    const sakatAdlar = katalogAdlari(sakat)
    expect(sakatAdlar, 'sabotaj fiksturu kurbani DUSURMEDI').not.toContain(kurban)
    const eksik = kaynak.filter((a) => !sakatAdlar.includes(a))
    expect(eksik, 'sabotajli katalogda eksik yetenek GORULMEDI — kapi kor').toContain(kurban)
  })

  it('⭐URETICI KOMUTU hata mesajinda ADIYLA yaziyor (kirmizi gorenin ne yapacagi belli olsun)', () => {
    // Kapinin kendi metnini olcer: "duzeltmeyi biliyorum" iddiasi dosyada YAZILI olmali.
    const bu = fs.readFileSync(__filename, 'utf8')
    expect(bu).toContain(URETICI_KOMUTU)
    const ureticiMetin = fs.readFileSync(URETICI, 'utf8')
    expect(
      ureticiMetin,
      'uretici katalog dosyasini kendi icinde ADIYLA yazmali — yoksa komut yanlis dosyayi uretir',
    ).toContain('manifest.yaml')
  })
})
