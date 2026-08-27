import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it } from 'vitest'

/**
 * INV-DOC-5 · BILEREK DONDURULMUS companion sessizce EZILEMEZ.
 *
 * ÖLÇÜLMÜŞ VAKA (2026-08-27, REC-83). Üreteç bazı dosyalarda sembol KAYBEDİYOR; o dosyalarda
 * "bayat ama TAM" sürüm, "taze ama EKSİK" olana tercih edildi ve dört şerit toplam ~40 companion'ı
 * bilerek geri aldı. Sonra I18N bir yapısal çelişki ölçtü: **bir süpürme aracına bakıldığında
 * "bayat" ile "bilerek dondurulmuş" AYNI görünüyor.** Bir sonraki bayat-süpürmesi, dokuz dosyalık
 * onarımı sessizce geri alacaktı — hem de onarımı yapan kişinin hiç haberi olmadan.
 *
 * ⚠ İKİ KAYIT BİRDEN, GEREKÇESİYLE — bu maddenin özü budur:
 *   · YALNIZ dosya içi işaret yetmez: yeniden üretim dosyayı EZER, işaret de silinir ve kapı
 *     kör kalır. Kaybı ölçen şeyi, tam da kaybın olduğu yerde kaybederdik.
 *   · YALNIZ liste yetmez: liste ile gerçek AYRIŞIR. Bugün tam bu yaşandı — dokuz dosyalık
 *     listeyi elle kopyalayan İKİ taraf da birer dosyayı yanlış saydı.
 *   · ÇÖZÜM: `.companion-dondurulmus.json` "hangi dosyalar dondurulmuş" sorusunun SSOT'u;
 *     dosya içi işaret onun insan-görünür yankısı. **Kapı ikisini KARŞILAŞTIRIR** — listede olan
 *     bir dosyada işaret YOKSA o dosya yeniden üretilmiştir ve bu KIRMIZI'dır.
 *
 * ⚠ FIXTURE KOLLARI KASITLI: gerçek liste bir gün haklı olarak BOŞALABİLİR (üreteç düzelirse
 * kayıtlar silinir). O hâlde yalnız gerçek dosyalara bakan bir kapı BOŞ GEÇER — ölçtüğünü
 * sanıp hiçbir şey ölçmez. Bu yüzden mantık, listeden BAĞIMSIZ fixture'larla kanıtlanır.
 */

const require = createRequire(import.meta.url)
const KOK = require
  .resolve('../../../package.json')
  .replace(/[\\/]package\.json$/, '')
  .replace(/\\/g, '/')

/** `node:fs` KULLANILMIYOR (bkz. board-invariants.test.ts ortam notu) — çocuk süreç. */
const dosyaOku = (yol: string): string =>
  execFileSync(
    process.execPath,
    [
      '-e',
      'const fs=require("fs");try{process.stdout.write(fs.readFileSync(process.argv[1],"utf8"))}catch{process.stdout.write("")}',
      yol,
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )

/**
 * GERÇEK sembol sayımı — v4. **Önceki iki ölçüt de yanlıştı, ters yönlerde** (2026-08-27):
 *
 * | ölçüt | hata | kanıt |
 * |---|---|---|
 * | "sonu `)` ile bitmeyen başlık gerçektir" (filo çapında benimsenmişti) | **şişirir** | `::productsByTab useMemo callback` ve `::(d) => { return {...} }` sözde ama `)` ile bitmiyor → gerçek sayılıyordu; `FeaturedCommercialBlocks` 4 sanıldı, gerçekte 1 |
 * | "sadece düz tanımlayıcı olsun" (ilk düzeltmem) | **azaltır** | `ErrorBoundary`'nin 8 sembolünün 6'sı `ErrorBoundary.render` biçiminde metot; hepsi eleniyordu |
 *
 * **v4:** `::` sonrası **noktalı tanımlayıcı yolu** olmalı — boşluk yok, parantez yok.
 * Bu düzeltme dokuz kaydın **beşini** değiştirdi. Şişmiş bir eşik kapıyı **gevşetir**:
 * gerçek bir kayıpta bile `sembol >= eşik` tutabilir, yani ölçüt hatası kapıyı kör eder.
 */
const YOL_DESENI = /^[A-Za-z_$][A-Za-z0-9_$]*(\.[A-Za-z_$][A-Za-z0-9_$]*)*$/

const sembolAdlari = (metin: string): string[] =>
  (metin.match(/AST Pointer:[^\n]*/g) ?? [])
    .map((baslik) => {
      const i = baslik.lastIndexOf('::')
      if (i < 0) return null
      const ham = baslik.slice(i + 2).replace(/`/g, '').trim()
      return YOL_DESENI.test(ham) ? ham : null
    })
    .filter((x): x is string => x !== null)

const gercekSembol = (metin: string): number => sembolAdlari(metin).length

const ISARET_DESENI = /<!--\s*ORION-DONDURULMUS:\s*gercek-sembol=(\d+)\s*·\s*kaynak=([0-9a-f]{7,40})\s*·\s*sebep=([a-z0-9-]+)\s*·\s*kayit=(REC-\d+)\s*-->/

interface Kayit {
  yol: string
  gercek_sembol: number
  kaynak: string
  sebep: string
  kayit: string
  serit?: string
}

interface Ihlal {
  yol: string
  sinif: 'isaret-yok' | 'isaret-bozuk' | 'sayi-uyusmuyor' | 'sembol-dustu' | 'dosya-yok'
  ayrinti: string
}

/**
 * TEK UYGULAMA — hem fixture hem gerçek dosya bu fonksiyondan geçer. İki ayrı kontrol yazmak,
 * bugün `post-commit`/`post-merge`de onardığımız "süzgeç iki yerde" sınıfını üretirdi.
 */
function denetle(kayit: Kayit, icerik: string | null): Ihlal | null {
  if (icerik === null || icerik === '') {
    return { yol: kayit.yol, sinif: 'dosya-yok', ayrinti: 'listede var, dosya okunamadi' }
  }
  if (!icerik.includes('ORION-DONDURULMUS')) {
    return {
      yol: kayit.yol,
      sinif: 'isaret-yok',
      ayrinti: 'listede DONDURULMUS ama dosyada isaret YOK — dosya yeniden uretilmis olmali',
    }
  }
  const m = icerik.match(ISARET_DESENI)
  if (!m) {
    return {
      yol: kayit.yol,
      sinif: 'isaret-bozuk',
      ayrinti: 'ORION-DONDURULMUS dizisi var ama BICIM cozulemedi — sessizce atlanmaz',
    }
  }
  const isaretteki = Number(m[1])
  if (isaretteki !== kayit.gercek_sembol) {
    return {
      yol: kayit.yol,
      sinif: 'sayi-uyusmuyor',
      ayrinti: `isaret ${isaretteki}, liste ${kayit.gercek_sembol} — iki kayit AYRISMIS`,
    }
  }
  const suanki = gercekSembol(icerik)
  if (suanki < kayit.gercek_sembol) {
    return {
      yol: kayit.yol,
      sinif: 'sembol-dustu',
      ayrinti: `gercek sembol ${suanki} < dondurulan ${kayit.gercek_sembol}`,
    }
  }
  return null
}

const govde = (sembolSayisi: number, isaret: string | null): string => {
  const basliklar = Array.from(
    { length: sembolSayisi },
    (_, i) => `### [N1] AST Pointer: src/x.ts::Sembol${i}`,
  ).join('\n')
  return ['---', 'domain: general', '---', '', isaret ?? '', '', basliklar, ''].join('\n')
}

describe('INV-DOC-5 · dondurulmus companion sessizce ezilemez', () => {
  const TAM_ISARET =
    '<!-- ORION-DONDURULMUS: gercek-sembol=4 · kaynak=4f542c31 · sebep=uretec-sembol-kaybi · kayit=REC-83 -->'
  const ORNEK: Kayit = {
    yol: 'src/ornek.md',
    gercek_sembol: 4,
    kaynak: '4f542c31',
    sebep: 'uretec-sembol-kaybi',
    kayit: 'REC-83',
  }

  it('FIXTURE: tutarli dosya IHLAL DEGIL (yanlis pozitif uretmiyor)', () => {
    expect(denetle(ORNEK, govde(4, TAM_ISARET))).toBeNull()
    // Daha fazla sembol de kabul: uretec duzelirse sayi ARTABILIR ve bu iyi haberdir.
    expect(denetle(ORNEK, govde(7, TAM_ISARET))).toBeNull()
  })

  it('FIXTURE: sembol sayisi dondurulanin ALTINA duserse yakalanir', () => {
    const i = denetle(ORNEK, govde(1, TAM_ISARET))
    expect(i?.sinif).toBe('sembol-dustu')
    // Ayrinti IKI sayiyi da tasimali: "dustu" demek yetmez, NEREDEN NEREYE dustugu yazili olmali.
    // Rapor bu iki sayi olmadan okuyanı "ne kadar kaybettim" sorusuyla bas basa birakir.
    expect(i?.ayrinti).toMatch(/\b1\b/)
    expect(i?.ayrinti).toMatch(/\b4\b/)
  })

  it('FIXTURE: yeniden uretim isareti SILERSE yakalanir — kapinin asil isi bu', () => {
    // Uretec dosyayi ezer: isaret gider, semboller de duser. Iki kayit ayri oldugu icin
    // liste ayakta kalir ve kayip GORULUR. Isaret tek kayit olsaydi bu hal sessiz gecerdi.
    const i = denetle(ORNEK, govde(1, null))
    expect(i?.sinif).toBe('isaret-yok')
  })

  it('FIXTURE: BOZUK isaret sessizce atlanmaz', () => {
    const i = denetle(ORNEK, govde(4, '<!-- ORION-DONDURULMUS: bozuk-bicim -->'))
    expect(i?.sinif).toBe('isaret-bozuk')
  })

  it('FIXTURE: isaret ile liste AYRISIRSA yakalanir', () => {
    const farkli =
      '<!-- ORION-DONDURULMUS: gercek-sembol=9 · kaynak=4f542c31 · sebep=uretec-sembol-kaybi · kayit=REC-83 -->'
    const i = denetle(ORNEK, govde(9, farkli))
    expect(i?.sinif).toBe('sayi-uyusmuyor')
  })

  it('GERCEK: listedeki her kayit dosyasiyla TUTARLI', () => {
    const ham = dosyaOku(`${KOK}/.companion-dondurulmus.json`)
    expect(ham, '.companion-dondurulmus.json okunamadi').not.toBe('')

    const liste = JSON.parse(ham) as { surum: number; kayitlar: Kayit[] }
    expect(Array.isArray(liste.kayitlar), 'kayitlar bir dizi degil — SSOT bozuk').toBe(true)

    const ihlaller = liste.kayitlar
      .map((k) => denetle(k, dosyaOku(`${KOK}/${k.yol}`)))
      .filter((x): x is Ihlal => x !== null)

    expect(
      ihlaller,
      `dondurulmus companion ihlali:\n${ihlaller.map((i) => `  · ${i.yol} [${i.sinif}] ${i.ayrinti}`).join('\n')}`,
    ).toEqual([])
  })
})
