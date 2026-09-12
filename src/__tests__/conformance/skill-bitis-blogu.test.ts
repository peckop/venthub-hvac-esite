import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-BITIS-1 · Ortak bitiş bloğu 71 skill'in HEPSİNDE var (REC-305).
 *
 * ÖLÇÜLEN KUSUR: `outputs:` 26/36 skill'de serbest metin, bitiş protokolü **2/36**, hata dalı
 * 5/36. Sonucu iki tanıdık kusur sınıfı: *"yaptım"* deyip yarım bırakma ve **kanıtsız** *"olmuyor"*
 * (hafıza: `yesil-kapi-gorundugunu-kanitlamaz`, `duzeltilmis-ama-kosulmamis-arac`).
 *
 * ⭐BU KAPI VARLIK ÖLÇER, ETKİ ÖLÇMEZ — ve bu sınırı burada yazmak zorundayım. Blok bir metin;
 * metnin dosyada olması, çağrıldığında OKUNDUĞU anlamına gelmez. Etki ölçümü PR'da ayrı yapıldı
 * (gerçek bir skill çağrısının kapanışında durum kelimesi göründü mü). Varlık kapısını "etki
 * kanıtı" gibi sunmak, bu projede düzeltmeye çalıştığımız kusurun aynısı olurdu.
 *
 * ⭐İKİNCİ KOL: blok GÖVDEDE olmalı, frontmatter'da OLMAMALI. Sebep ölçülmüş (REC-304): oturum
 * açılışında yalnız `name` + `description` okunuyor. Blok frontmatter'a girse her oturumun sabit
 * bedeli 71 x ~16 satır artardı — yani kural, kendi bedelini gizleyen bir kurala dönerdi.
 *
 * Cetvel: `execution-method-standard.md` §8 · kaynak metin `.claude/skills/_ortak/bitis-durumu.md`.
 */

const AGACLAR = ['.claude/skills', '.agent/skills']
const BAS = '<!-- ORTAK-BITIS-BASLANGIC'
const SON = '<!-- ORTAK-BITIS-SON -->'
const DURUM_KELIMELERI = ['BITTI', 'CEKINCELI', 'ENGELLI', 'BAGLAM-EKSIK']

interface SkillDosyasi {
  yol: string
  etiket: string
  ham: string
}

function skilleriTopla(): SkillDosyasi[] {
  const out: SkillDosyasi[] = []
  for (const agac of AGACLAR) {
    const kok = path.resolve(__dirname, '../../../', agac)
    if (!fs.existsSync(kok)) continue
    for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
      if (!g.isDirectory() || g.name.startsWith('_')) continue
      const yol = path.join(kok, g.name, 'SKILL.md')
      if (!fs.existsSync(yol)) continue
      out.push({ yol, etiket: `${agac}/${g.name}`, ham: fs.readFileSync(yol, 'utf8') })
    }
  }
  return out
}

const skiller = skilleriTopla()

describe('INV-SKILL-BITIS-1 · blok varlığı', () => {
  it('ölçüm evreni: iki ağaçtan en az 60 SKILL.md okundu', () => {
    // Boş okuma "hepsinde var" diye YEŞİL verirdi — yokluk kanıtı değildir.
    expect(skiller.length, 'skill dosyaları okunamadı (yanlış kök?)').toBeGreaterThanOrEqual(60)
  })

  it('her SKILL.md ortak bloğu TAŞIYOR (işaretler tam)', () => {
    const eksik = skiller.filter((s) => !s.ham.includes(BAS) || !s.ham.includes(SON)).map((s) => s.etiket)
    expect(eksik, 'blok eksik ya da işaretleri yarım: node scripts/hijyen/skill-bitis-blogu.mjs').toEqual([])
  })

  it('dört durum kelimesi blok içinde geçiyor', () => {
    const eksik: string[] = []
    for (const s of skiller) {
      const bas = s.ham.indexOf(BAS)
      const son = s.ham.indexOf(SON)
      const govde = bas === -1 || son === -1 ? '' : s.ham.slice(bas, son)
      for (const k of DURUM_KELIMELERI) if (!govde.includes(k)) eksik.push(`${s.etiket}:${k}`)
    }
    expect(eksik, 'durum kelimesi eksik').toEqual([])
  })

  it('blok BİR KEZ geçiyor — betiğin ikinci koşusu çoğaltmamalı', () => {
    const cok = skiller
      .filter((s) => s.ham.split(SON).length - 1 !== 1)
      .map((s) => `${s.etiket} (${s.ham.split(SON).length - 1})`)
    expect(cok, 'blok birden fazla kez yazılmış').toEqual([])
  })
})

describe('INV-SKILL-BITIS-1 · blok GÖVDEDE, frontmatter DEĞİL (always-on yükü artmaz)', () => {
  it('hiçbir dosyada blok frontmatter sınırının içinde değil', () => {
    const ihlal: string[] = []
    for (const s of skiller) {
      const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(s.ham)
      if (!fm) continue
      if (fm[1].includes('ORTAK-BITIS')) ihlal.push(s.etiket)
      // Blok, frontmatter'ın bittiği yerden SONRA başlamalı.
      const bas = s.ham.indexOf(BAS)
      if (bas !== -1 && bas < fm[0].length) ihlal.push(s.etiket + ' (konum)')
    }
    expect(ihlal, 'blok frontmatter içinde — her oturumun sabit bedelini artırır').toEqual([])
  })

  it('kaynak metin tek yerde ve 25 satır tavanını aşmıyor', () => {
    const kaynak = path.resolve(__dirname, '../../../.claude/skills/_ortak/bitis-durumu.md')
    expect(fs.existsSync(kaynak), 'ortak blok kaynağı yok — fikir 71 kopyaya dağılmış olur').toBe(true)
    const dolu = fs.readFileSync(kaynak, 'utf8').split(/\r?\n/).filter((x) => x.trim()).length
    expect(dolu, 'ortak blok 25 satır tavanını aştı').toBeLessThanOrEqual(25)
  })
})
