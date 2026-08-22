import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CETVEL-YAPI · Cetvellerin BÖLÜM YAPISI tutarlı olmalı.
 *
 * KAPSAM: `docs/standards/**\/*.md` — numaralandırma KULLANAN dosyalar.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NİÇİN VAR — ölçülmüş bir kusurdan doğdu, varsayımdan değil
 * ─────────────────────────────────────────────────────────────────────────────
 * 2026-08-20'de `deploy-build-skip-standard.md`'ye `## D13` bölümü İKİ KEZ yazıldı:
 * biri 08-19 akşamı, ikincisi ertesi gün aynı yazar tarafından, dosyaya bakılmadan.
 * İki özdeş başlık oluştu ve HİÇBİR KAPI KIRMIZI VERMEDİ.
 *
 * Sebep yapısaldı: cetvelleri okuyan tek bir kapı yoktu. `build-skip-positive-logic`
 * betiği ölçer, cetveli değil. 400+ satırlık bir belgenin başlık listesini kimse elle
 * saymaz. SINIF: "cetvel var, onu ölçen kapı yok" — cetvel + zorlayıcı test = kontrol;
 * tek başına cetvel iyi niyettir.
 *
 * ÖNKOŞUL KARŞILANDI: genelleşmeden önce 35 cetvelin tamamı tarandı, 0 ihlal çıktı
 * (OPS-AUDIT onayı, 2026-08-20). Yeni kapı mevcut ihlalle açılmaz.
 *
 * NUMARASIZ CETVELLER KURAL DIŞIDIR, bilerek: beş cetvel düz metin başlık kullanıyor
 * (`## Kural`, `## KOMUT-A`). Onları numaralandırmaya zorlamak kusur onarımı değil,
 * biçim dayatmasıdır. Kural şudur: **numaralandırma kullanan tutarlı kullanır.**
 */

const KOK = 'docs/standards'

/**
 * Geniş sözlük — cetveller üç ayrı biçim kullanıyor ve üçü de meşru:
 *   `## 3. Başlık`  ·  `## 0) Başlık`  ·  `## 2.4 Başlık`  ·  `## D13 — Başlık`
 * Dar bir desen buranın %90'ını sessizce atlar; bu bir kez yaşandı (aşağıdaki
 * "kendi kapsamını ölçer" testinin varlık sebebi).
 */
const BASLIK = /^(#{2,4})\s+(?:§\s*)?([A-ZÇĞİÖŞÜ]{0,6})[\s-]*(\d+(?:\.\d+)*)\s*[.):\-—–]?\s/

type Bolum = { seviye: number; no: string; satir: number }

function bolumleriCikar(metin: string): Bolum[] {
  return metin.split(/\r?\n/).flatMap((satir, i) => {
    const m = BASLIK.exec(satir)
    if (!m) return []
    return [{ seviye: m[1].length, no: `${m[2] ?? ''}${m[3]}`, satir: i + 1 }]
  })
}

function cetvelDosyalari(): string[] {
  const kok = resolve(process.cwd(), KOK)
  return readdirSync(kok, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md'))
    .map((d) => join(KOK, d.name))
    .sort()
}

function olculenler(): { yol: string; bolumler: Bolum[] }[] {
  return cetvelDosyalari()
    .map((yol) => ({
      yol,
      bolumler: bolumleriCikar(readFileSync(resolve(process.cwd(), yol), 'utf8')),
    }))
    // Numaralandırma kullanmayan cetvel kural dışıdır (yukarıdaki gerekçe).
    .filter((d) => d.bolumler.length > 0)
}

describe('INV-CETVEL-YAPI · cetvellerin bölüm yapısı', () => {
  it('aynı bölüm numarası bir cetvelde İKİ KEZ tanımlanmaz', () => {
    const ihlaller = olculenler().flatMap(({ yol, bolumler }) => {
      const sayim = new Map<string, number[]>()
      for (const b of bolumler) sayim.set(b.no, [...(sayim.get(b.no) ?? []), b.satir])
      return [...sayim.entries()]
        .filter(([, satirlar]) => satirlar.length > 1)
        .map(([no, satirlar]) => `${yol} → ${no} (satır ${satirlar.join(', ')})`)
    })
    expect(ihlaller, 'mükerrer bölüm numarası').toEqual([])
  })

  it('her alt bölüm (X<n>.<m>) kendi ana bölümüne sahiptir', () => {
    const ihlaller = olculenler().flatMap(({ yol, bolumler }) => {
      const anahtarlar = new Set(bolumler.map((b) => b.no))
      return bolumler
        .filter((b) => b.seviye >= 3 && b.no.includes('.'))
        .filter((b) => !anahtarlar.has(b.no.slice(0, b.no.lastIndexOf('.'))))
        .map((b) => `${yol} → ${b.no} (satır ${b.satir})`)
    })
    expect(ihlaller, 'sahipsiz alt bölüm: ana bölümü yok').toEqual([])
  })

  /**
   * KAPININ KENDİ KÖRLÜĞÜNE KARŞI — bugünün asıl dersi.
   *
   * Bu envanterin ilk koşusu "0 ihlal" döndürdü ve o sıfır BOŞTU: desen 445 başlığın
   * yalnız 47'sini görüyordu, 35 dosyanın 29'unda tamamen kördü. Sıfır "ihlal yok"
   * değil "bakmadım" demekti.
   *
   * Bu yüzden kapı kendi kapsamını da ölçer. Desen ileride bozulur/daraltılırsa
   * yukarıdaki iki test sessizce yeşile döner; bu test KIRMIZI verir.
   *
   * Kanarya olarak sabit bir dosya seçildi — eşik zamanla kaymaz.
   */
  it('kendi kapsamını ölçer: desen bozulursa sessizce yeşile dönmez', () => {
    const KANARYA = `${KOK}/deploy-build-skip-standard.md`
    const kanaryaBolumleri = bolumleriCikar(
      readFileSync(resolve(process.cwd(), KANARYA), 'utf8'),
    )
    expect(
      kanaryaBolumleri.length,
      `${KANARYA} numaralı bölüm içerir; sıfır çıkması desenin bozulduğunu gösterir`,
    ).toBeGreaterThanOrEqual(5)

    expect(olculenler().length, 'ölçülen cetvel sayısı').toBeGreaterThanOrEqual(10)
  })

  /**
   * YANLIŞ KIRMIZI KORUMASI — AUTH'un (99fa366e, 2026-08-20 10:11Z) uyarısından doğdu.
   *
   * "Her alt bölüm ana bölümüne sahip olmalı" cümlesi iki biçimde kodlanabilir:
   * ANA = en üst düzey (`3`) ya da ANA = DOĞRUDAN ebeveyn (`3.8`). İlkini kodlayan
   * üç düzeyli belgelerde hiçbir şey yakalamaz; ikincisini kodlarken ebeveyn kümesine
   * yalnız noktasız başlıkları koyan, `3.8.1`'e YANLIŞ KIRMIZI verir.
   *
   * AUTH tam bu tuzağa düştü ve `admin-design-standard` ile `pricing-standard`
   * dosyalarına iki yanlış alarm üretti (ikisi de başka şeritlerin dosyası).
   * Yeni bir kapının ilk işi yanlış kırmızı olursa kapıya güven biter.
   */
  it('meşru üç düzeyli başlığa YANLIŞ KIRMIZI vermez', () => {
    const SATIR_SONU = String.fromCharCode(10)
    const temiz = ['## 3. Ana', '### 3.8 Ara', '#### 3.8.1 Alt alt'].join(SATIR_SONU)
    const bolumler = bolumleriCikar(temiz)
    const anahtarlar = new Set(bolumler.map((b) => b.no))

    // Ara başlık `3.8` ebeveyn kümesinde OLMALI — asıl tuzak burada.
    expect(anahtarlar.has('3.8'), '`3.8` ebeveyn adayı sayılmalı').toBe(true)

    const yetim = bolumler
      .filter((b) => b.seviye >= 3 && b.no.includes('.'))
      .filter((b) => !anahtarlar.has(b.no.slice(0, b.no.lastIndexOf('.'))))
    expect(yetim.map((b) => b.no), 'meşru üç düzeyli belge temiz dönmeli').toEqual([])
  })

  it('ayıklayıcı gerçekten çalışıyor: bozuk girdi yakalanır (vacuous-pass koruması)', () => {
    const SATIR_SONU = String.fromCharCode(10)
    const bozuk = ['## 3. Bir bolum', '### 3.1 Alt', '## 3. AYNI NUMARA', '### 9.7 Anasiz'].join(
      SATIR_SONU,
    )
    const bolumler = bolumleriCikar(bozuk)

    expect(bolumler.filter((b) => b.no === '3')).toHaveLength(2)

    const anahtarlar = new Set(bolumler.map((b) => b.no))
    const yetim = bolumler.filter(
      (b) => b.seviye >= 3 && b.no.includes('.') && !anahtarlar.has(b.no.split('.')[0]),
    )
    expect(yetim.map((b) => b.no)).toEqual(['9.7'])
  })
})

/**
 * ÇAPA KOLU (INV-CETVEL-YAPI · tekrar) — LEGAL'in 2026-08-20 isteği üzerine eklendi.
 *
 * ONLARIN SORUSU: mükerrer 3.6'yı yakaladık ama numarayı doğru artırsalardı aynı
 * mükerrerlik SESSİZ kalırdı. Kapının gerçek hedefi numara değil TEKRAR.
 *
 * ÜÇ TASARIM ÖLÇÜLDÜ (42 dosya, 557 başlık), İKİSİ ÇÜRÜDÜ:
 *   A · normalize edilmiş başlık metni birebir eşit → 0 bulgu, AMA gerçek vakayı
 *       YAKALAYAMIYOR (iki başlığın metni farklıydı). Boş sıfır, yanlış güven.
 *   B · sözcük kümesi Jaccard ≥ 0.5 → 4 bulgu ve DÖRDÜ DE MEŞRU (admin 8↔10.4,
 *       purchasing 10↔13.3, companion C4↔C5, admin 9↔10.5); üstelik gerçek vaka
 *       j≈0.45 ile eşiğin ALTINDA. Hem gürültü hem ıska.
 *   C · ÇAPA: başlıkta geçen KOD KİMLİĞİ (backtickli yol/dosya ya da çıplak /rota)
 *       aynı dosyada iki başlıkta geçiyorsa → tek bulgu = gerçek vaka, yanlış
 *       pozitif SIFIR, ve numara değişse de yakalar. KABUL EDİLEN.
 *
 * MENZİL DÜRÜSTLÜĞÜ: 557 başlığın yalnız ~32'si çapa taşır. Bu kol DAR ama KESİN;
 * çapasız iki tarifi görmez. Dar-kesin, geniş-gürültülüye tercih edildi çünkü B'nin
 * dört yanlış kırmızısı kapıyı ilk gününde gürültüye çevirirdi.
 */
const CAPA = /`([^`]+)`|(?<![\w`])(\/[a-z0-9][a-z0-9\-/[\]]{3,})/g

function capalar(baslikMetni: string): string[] {
  const out = new Set<string>()
  for (const m of baslikMetni.matchAll(CAPA)) {
    const ham = (m[1] ?? m[2] ?? '').trim()
    if (ham.length < 4) continue
    // yalnız yol/dosya benzeri kimlikler: içinde / . veya _ geçmeli
    if (!/[/._]/.test(ham)) continue
    out.add(ham.replace(/\/+$/, '').toLowerCase())
  }
  return [...out]
}

describe('INV-CETVEL-YAPI · aynı konunun İKİ TARİFİ (çapa kolu)', () => {
  it('bir cetvelde aynı KOD KİMLİĞİ iki ayrı başlıkta anlatılmaz', () => {
    const ihlaller: string[] = []
    let capaliBaslik = 0

    for (const yol of cetvelDosyalari()) {
      // Çapa → aynı BAŞLIK DÜZEYİNDEKİ satırlar (düzey neden ayırt edici: yorum bloğunda).
      const harita = new Map<string, Map<number, number[]>>()
      readFileSync(yol, 'utf8')
        .split(/\r?\n/)
        .forEach((satir, i) => {
          const m = /^(#{2,4})\s+(.*)$/.exec(satir)
          if (!m) return
          const seviye = m[1].length
          const c = capalar(m[2])
          if (c.length > 0) capaliBaslik++
          for (const x of c) {
            const seviyeler = harita.get(x) ?? new Map<number, number[]>()
            seviyeler.set(seviye, [...(seviyeler.get(seviye) ?? []), i + 1])
            harita.set(x, seviyeler)
          }
        })
      for (const [capa, seviyeler] of harita) {
        for (const [seviye, satirlar] of seviyeler) {
        if (satirlar.length > 1) ihlaller.push(`${yol} → ${capa} (satır ${satirlar.join(', ')})`)
        }
      }
    }

    // KAPSAM KANARYASI: hiç çapa bulunmadıysa karşılaştırma boş kümede yapılmıştır
    // ve kol sessizce yeşil kalır. Sıfırın "ihlal yok" mu "hiçbir yere bakmadım" mı
    // olduğunu ayıran tek şey bu satır.
    expect(
      capaliBaslik,
      'hiçbir başlıkta kod kimliği bulunamadı — ÇAPA deseni bozulmuş olabilir',
    ).toBeGreaterThan(0)

    expect(
      ihlaller,
      'aynı kod kimliği bir cetvelde iki kez başlık olmuş: bir konunun iki tarifi. ' +
        'Biri güncellenir öteki kalır ve okuyan hangisine bakacağını bilemez. ' +
        'Numarayı değiştirmek bunu ÇÖZMEZ — blokları birleştirin.',
    ).toEqual([])
  })

  it('çapa ayıklayıcısı gerçekten çalışıyor (bozuk girdi yakalanır)', () => {
    const iki = capalar('3.6 Veri sahibinin kendi kanalı — `/account/data-requests` (T063)')
    expect(iki).toContain('/account/data-requests')
    // çapasız başlık hiçbir şey döndürmemeli — aksi hâlde kol her başlığı eşleştirirdi
    expect(capalar('4. Fiyat ve Stok')).toEqual([])
    // tek sözcüklü backtick (yol değil) çapa SAYILMAZ
    expect(capalar('C4 — `Companion` kuralı')).toEqual([])
  })
})
