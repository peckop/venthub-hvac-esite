import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SKILL-FRONTMATTER-1 — hiçbir SKILL.md'nin frontmatter'ı SESSİZCE düşmemeli.
 *
 * ⭐KUSUR SINIFI (ölçülmüş, REC-319 / 2026-09-13): alıntılanmamış bir YAML düz
 * skalerinin içinde iki nokta + boşluk geçerse — ya da satır iki noktayla
 * biterse — ayrıştırıcı onu ALAN AYRACI sanır ve TÜM frontmatter bloğunu
 * düşürür. Çalışma anındaki sonucu, `claude plugin validate`ın kendi cümlesiyle:
 *
 *   "At runtime this skill loads with EMPTY METADATA
 *    (all frontmatter fields silently dropped)."
 *
 * Yani `name` ve `description` yok olur. Açıklama yoksa yönlendirme o skill'i
 * HİÇ seçemez: skill dosyada durur, ama erişilemez. Sahada üç dosya böyleydi:
 *   · venthub-architecture   `description`  (satır sonu `PPR icin DEGIL:`)
 *   · venthub-tasarim-dili   `metadata.kaynak`  (`Recep: tasarimlar...`)
 *   · venthub-catalog-importer `description`  (`Tetik: katalog oku, ...`)
 *
 * ⚠NİÇİN BU KAPI GEREKTİ: mevcut skill kapılarımız (`skill-yuku-butcesi`,
 * `skill-bitis-blogu`) o üç dosya bozukken de YEŞİL veriyordu — çünkü ikisi de
 * frontmatter'ı AYRIŞTIRMAYI denemiyor, metin olarak tarıyor. Yeşil kapı,
 * bakmadığı şeyi kanıtlamaz.
 *
 * ⛔KAPININ SINIRI, ADIYLA: bu bir YAML AYRIŞTIRICISI DEĞİLDİR. Depoda YAML
 * bağımlılığı yok (ölçüldü: ne `yaml` ne `js-yaml`; aynı ölçüm
 * `anon-yazma-nobetcisi.test.ts` içinde de yazılı). Bu yüzden kapı, ÖLÇÜLMÜŞ
 * kusur sınıfını hedefler — her olası YAML hatasını değil. Tam doğrulama
 * `claude plugin validate .claude` ve `.agent` ile yapılır; o komut abonelik
 * ister, CI'da koşmaz.
 */

const KOK = path.resolve(__dirname, '..', '..', '..')
const AGACLAR = ['.claude/skills', '.agent/skills']

/** Alıntılanmış / blok / akış biçimleri: bunların içinde iki nokta SERBESTTİR. */
const GUVENLI_BASLANGIC = ["'", '"', '|', '>', '[', '{', '&', '*', '!']

/**
 * Düz skalerde ` #` bir YORUM başlatır — ondan sonrası değerin parçası DEĞİLDİR.
 *
 * ⚠BU SATIR ÖLÇÜMLE GELDİ: kapının ilk hâli yorumu değer sanıp BEŞ dosyayı
 * yanlış yere kırmızı yaptı (`on_auth_expired: notebooklm login  # 2026-08-17:
 * urun degisti...`). Yerleşik `claude plugin validate` o beşini GEÇİRİYORDU;
 * yani çelişen iki ölçüm vardı ve haklı olan araçtı, ben değildim.
 */
function yorumsuz(deger: string): string {
  const i = deger.search(/\s#/)
  return i === -1 ? deger : deger.slice(0, i)
}

/** Ölçülmüş kusur: iki nokta + boşluk, ya da satır sonunda iki nokta. */
function kusurlu(deger: string): string | null {
  const s = yorumsuz(deger).trimEnd()
  if (/:\s/.test(s)) return 'icinde iki nokta + bosluk'
  if (/:$/.test(s)) return 'satir iki noktayla bitiyor'
  return null
}

function skillDosyalari(): string[] {
  const cikti: string[] = []
  for (const agac of AGACLAR) {
    const kok = path.join(KOK, agac)
    if (!fs.existsSync(kok)) continue
    for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
      if (!g.isDirectory() || g.name.startsWith('_')) continue
      const dosya = path.join(kok, g.name, 'SKILL.md')
      if (fs.existsSync(dosya)) cikti.push(dosya)
    }
  }
  return cikti
}

function frontmatter(ham: string): string | null {
  const metin = ham.replace(/\r\n/g, '\n')
  const m = metin.match(/^---\n([\s\S]*?)\n---\n/)
  return m ? m[1] : null
}

/**
 * Frontmatter'ı satır satır yürür ve düz skaler kusurlarını döndürür.
 *
 * Anahtar ayrım: bir `anahtar:` satırının SAĞINDA değer varsa, ondan sonraki
 * DAHA DERİN girintili satırlar o skalerin DEVAMIDIR — anahtar gibi görünseler
 * bile. `Tetik: katalog oku` satırı tam bu yüzden gözden kaçıyor: anahtara
 * benziyor ama aslında bir açıklamanın devamı.
 */
function duzSkalerKusurlari(fm: string): string[] {
  const bulgular: string[] = []
  let aktifGirinti: number | null = null

  const satirlar = fm.split('\n')
  for (let i = 0; i < satirlar.length; i++) {
    const satir = satirlar[i]
    if (!satir.trim()) {
      aktifGirinti = null
      continue
    }
    const girinti = satir.length - satir.trimStart().length

    // Açık bir düz skalerin DEVAM satırı mı?
    if (aktifGirinti !== null && girinti > aktifGirinti) {
      const sebep = kusurlu(satir.trim())
      if (sebep) bulgular.push(`frontmatter satir ${i + 1}: devam satiri — ${sebep}: ${satir.trim().slice(0, 70)}`)
      continue
    }
    aktifGirinti = null

    const anahtar = satir.match(/^(\s*)([A-Za-z0-9_.-]+):(?:\s+(.*))?$/)
    if (anahtar) {
      const deger = (anahtar[3] ?? '').trim()
      if (!deger) continue // blok ya da eşleme geliyor
      if (GUVENLI_BASLANGIC.includes(deger[0])) continue // alintili/blok: serbest
      aktifGirinti = girinti
      const sebep = kusurlu(deger)
      if (sebep) bulgular.push(`frontmatter satir ${i + 1}: ${anahtar[2]} degeri — ${sebep}: ${deger.slice(0, 70)}`)
      continue
    }

    const liste = satir.trim().match(/^-\s+(.*)$/)
    if (liste) {
      const deger = liste[1].trim()
      if (deger && !GUVENLI_BASLANGIC.includes(deger[0])) {
        const sebep = kusurlu(deger)
        if (sebep) bulgular.push(`frontmatter satir ${i + 1}: liste ogesi — ${sebep}: ${deger.slice(0, 70)}`)
      }
    }
  }
  return bulgular
}

const dosyalar = skillDosyalari()

describe('INV-SKILL-FRONTMATTER-1 · frontmatter SESSIZCE dusmemeli', () => {
  it('her iki agacta SKILL.md okundu (kor tarama degil)', () => {
    // Sıfır dosya "temiz" değil, ÖLÇÜM BOZUK demektir.
    expect(dosyalar.length).toBeGreaterThanOrEqual(60)
  })

  it('her SKILL.md frontmatter SINIRI tasiyor', () => {
    const sinirsiz = dosyalar
      .filter((d) => frontmatter(fs.readFileSync(d, 'utf8')) === null)
      .map((d) => path.relative(KOK, d))
    expect(sinirsiz, 'Frontmatter blogu (--- ... ---) bulunamadi').toEqual([])
  })

  it('alintilanmamis duz skalerde IKI NOKTA yok (olculmus kusur sinifi)', () => {
    const kusurlular: string[] = []
    for (const d of dosyalar) {
      const fm = frontmatter(fs.readFileSync(d, 'utf8'))
      if (fm === null) continue
      for (const b of duzSkalerKusurlari(fm)) kusurlular.push(`${path.relative(KOK, d)} :: ${b}`)
    }
    expect(
      kusurlular,
      'Alintilanmamis bir YAML duz skalerinde iki nokta gecerse ayristirici onu ALAN AYRACI\n' +
        'sanar ve TUM frontmatter dusrer. Sonuc: skill calisma aninda name/description SIZ\n' +
        'yuklenir, yani HIC tetiklenemez. Care: degeri tek tirnakla alintila, ictekileri ikile\n' +
        "(ornek: next.config.mjs''te). Anlami degistirme, yalniz alintila.\n" +
        'Tam dogrulama: claude plugin validate .claude  (ve .agent)',
    ).toEqual([])
  })

  it('OLCULMUS UC VAKA korunuyor: ucu de hala mevcut ve saglam', () => {
    // Bu kol, kapinin dogdugu vakalari kilitler. Dosya adi degisirse ya da
    // silinirse kirmizi verir; boylece kapi sebebini kaybetmez.
    const vakalar = [
      '.claude/skills/venthub-architecture/SKILL.md',
      '.agent/skills/venthub-architecture/SKILL.md',
      '.claude/skills/venthub-tasarim-dili/SKILL.md',
      '.agent/skills/venthub-tasarim-dili/SKILL.md',
      '.agent/skills/venthub-catalog-importer/SKILL.md',
    ]
    const yok = vakalar.filter((v) => !fs.existsSync(path.join(KOK, v)))
    expect(yok, 'Olculmus vaka dosyasi kayip').toEqual([])
    for (const v of vakalar) {
      const fm = frontmatter(fs.readFileSync(path.join(KOK, v), 'utf8'))
      expect(fm, `${v} frontmatter sinirsiz`).not.toBeNull()
      expect(duzSkalerKusurlari(fm as string), `${v} yeniden bozulmus`).toEqual([])
    }
  })
})
