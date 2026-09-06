/**
 * INV-MECH-1 — filo mekanizmasının bütünlüğü.
 *
 * NİÇİN VAR (2026-08-20 ölçümü, tahmin değil):
 * O sabah DÖRT oturum panoya sağır kaldı. Sağırlık SESSİZDİR — hiçbir satır üretmez, hiçbir
 * kapı kırmızı yanmaz — ve bedeli Recep'in her oturumu elle dürtmesi oldu. Daha keskin olan
 * ikinci vaka bu şeridin kendisidir: hayatta-kalma katmanını mekanikleştirmekle görevli şerit,
 * KENDİ katmanını talimatla kurmadı. Talimat DÖRT kanaldan ulaştı (pano notu, sıralı emir,
 * hafıza dosyası, kendi raporum) ve kurulum üretmedi.
 *
 * Buradan çıkan cümle bu kapının varlık sebebidir:
 *   **Talimat davranış üretmez; mekanizma üretir.** Ve mekanizmanın kendisi de bir kapıya
 *   bağlanmazsa, sessizce çürür.
 *
 * KAPSAM SINIRI — ADIYLA: bu kapı mekanizmanın **yapısını** ölçer (ofset çakışması, çıktı
 * akışının kodda zorlanması, kırmızının sessizlik kuralına yem olmaması). Mekanizmanın o an
 * ÇALIŞIYOR olduğunu ölçmez ve ölçemez — o, çalışma zamanı sorusudur ve cevabı
 * `mechanism-setup.cjs prob` (dış olayla ayırt edici test) ile `board.cjs yoklama`dadır.
 * Yapı denetimi, davranış kanıtının yerine geçmez.
 *
 * Cetvel: docs/standards/fleet-mechanism-standard.md
 */
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect,it } from 'vitest'

const KOK = process.cwd()

/**
 * Dosyalar AÇIK YOLLA okunur, glob'la değil.
 * İki ölçülmüş sebep: (1) `.claude/` bir NOKTA-DİZİNDİR ve varsayılan glob'lar onu atlar —
 * kapı hiçbir şey bulamaz ama yeşil yanar; (2) satır sonları CRLF'tir ve normalize edilmeyen
 * bir düzenli ifade `$` sınırında sessizce kaçırır. İkisi de bu depoda yaşandı.
 */
const oku = (goreli: string): string => {
  const tam = path.join(KOK, goreli)
  if (!fs.existsSync(tam)) return ''
  return fs.readFileSync(tam, 'utf8').replace(/\r\n/g, '\n')
}

const KURULUM = 'scripts/board/mechanism-setup.cjs'
const GOZCU = 'scripts/board/gozcu.cjs'
const PANO = 'scripts/board/board.cjs'
const BRIFING = '.claude/hooks/board-brief.cjs'
const OTURUM = '.claude/hooks/session-board.cjs'

const kurulumKaynak = oku(KURULUM)
const gozcuKaynak = oku(GOZCU)
const panoKaynak = oku(PANO)
const brifingKaynak = oku(BRIFING)
const oturumKaynak = oku(OTURUM)

/**
 * Kaynaktan YORUMLARI soyar — "bu ad artık kullanılmıyor" gibi kolları, o adı ANLATAN
 * açıklamalardan ayırmak için. Ölçülmüş gerek (2026-09-01): eski adı yasaklayan kol, adın
 * kendi gerekçe metninde geçmesi yüzünden çıplak dize aramasıyla yazılamıyordu; dar bir
 * karakter sınıfına kaçınca da takma-ad sabotajını kaçırdı.
 */
function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** `mechanism-setup.cjs` içindeki şerit→ofset tablosunu kaynaktan ayıklar (SSOT orada). */
function ofsetleriAyikla(kaynak: string): Record<string, string> {
  const blok = /const OFSETLER = \{([\s\S]*?)\n\}/.exec(kaynak)
  if (!blok) return {}
  const tablo: Record<string, string> = {}
  for (const m of blok[1].matchAll(/([A-Z0-9_-]+)\s*:\s*'([^']+)'/g)) tablo[m[1]] = m[2]
  return tablo
}

describe('INV-MECH-1: filo mekanizması bütünlüğü', () => {
  it('ölçüm gerçekten koştu — beş dosyanın beşi de okundu', () => {
    // Sessiz-boş tarama yeşil görünür. Bu test, kapının HİÇBİR YERE BAKMADIĞI durumu
    // "hiçbir şey bulamadı"dan ayırır.
    const eksik = [
      [KURULUM, kurulumKaynak],
      [GOZCU, gozcuKaynak],
      [PANO, panoKaynak],
      [BRIFING, brifingKaynak],
      [OTURUM, oturumKaynak],
    ]
      .filter(([, icerik]) => (icerik as string).length < 200)
      .map(([yol]) => yol)

    expect(eksik, `Mekanizma dosyaları okunamadı (kapı KÖR koşuyor): ${eksik.join(', ')}`).toEqual([])
  })

  it('şerit cron ofsetleri ÇAKIŞMAZ ve tablo SSOT olarak kaynakta durur', () => {
    const tablo = ofsetleriAyikla(kurulumKaynak)
    expect(Object.keys(tablo).length, 'OFSETLER tablosu ayıklanamadı ya da boş').toBeGreaterThan(3)

    const gorulen = new Map<number, string>()
    const carpisan: string[] = []
    for (const [serit, ofset] of Object.entries(tablo)) {
      const dakikalar = ofset.split(',').map((d) => Number(d.trim()))
      expect(dakikalar.length, `${serit} ofseti üç dakika olmalı: "${ofset}"`).toBe(3)
      for (const d of dakikalar) {
        expect(Number.isInteger(d) && d >= 0 && d <= 59, `${serit} geçersiz dakika: ${d}`).toBe(true)
        const sahip = gorulen.get(d)
        if (sahip) carpisan.push(`dakika ${d}: ${sahip} ↔ ${serit}`)
        else gorulen.set(d, serit)
      }
    }
    // Çakışan ofset = aynı dakikada uyanan iki şerit = kota ve pano yazımı aynı ana yığılır.
    expect(carpisan, `Cron ofsetleri ÇAKIŞIYOR:\n${carpisan.join('\n')}`).toEqual([])
  })

  it('gözcü olay akışını KODDA UTF-8 yazar — ortam değişkenine güvenmez', () => {
    // Ölçülmüş vaka: bir şeridin Python gözcüsü U+2B50 (yıldız) basamayınca notu SESSİZCE
    // düşürdü. Süreç ölmedi, hata görünmedi, not kayboldu — ve yıldız tam da orkestratörün
    // en önemli notları işaretlediği karakterdi. Kodlama, ortamın değil kodun kararıdır.
    expect(
      /process\.stdout\.write\(\s*Buffer\.from\(/.test(gozcuKaynak),
      'gozcu.cjs olay satırlarını Buffer.from(..., "utf8") ile yazmalı; konsol kodlamasına güvenmek notu sessizce düşürür.',
    ).toBe(true)
  })

  it('gözcü KALICI İMLEÇ tutar ve her taramada canlılık damgası basar', () => {
    // İmleç iki işi birden yapar: (a) yeniden başlayınca geçmişi yeniden basmaz,
    // (b) `sonTarama` damgası sayesinde canlılık DIŞARIDAN ölçülebilir hâle gelir.
    // (b) olmadan "yeni not yok" ile "gözcü ölü" gözlemi ayırt edilemez.
    expect(gozcuKaynak).toMatch(/\.gozcu-imlec\./)
    expect(gozcuKaynak).toMatch(/sonTarama/)
    expect(
      /aralikSn/.test(gozcuKaynak),
      'İmleç tarama aralığını da yazmalı: eşiği bilmeyen ölçen taraf "bayat mı" diyemez.',
    ).toBe(true)
  })

  it('board.cjs yoklama (rollcall) fiilini ve İKİ AYRI ölçümü sunar', () => {
    expect(panoKaynak).toMatch(/verb === 'yoklama' \|\| verb === 'rollcall'/)
    // §23: TARAMA (gözcü süreci panoyu okuyor mu) ile TESLIM (bildirim KONUŞMAYA ulaştı mı)
    // AYRI kavramlardır ve ayrı ölçülür. 2026-09-01'de tek sütun ("GOZCU = panoyu DUYUYOR mu")
    // doğru bir şeyi ölçüp yanlış bir şeyi vaat etti: imleç tazeydi, teslimat yoktu, 62 dk
    // kaybedildi. Bir ölçümün adı, ölçtüğü şeyin sınırını taşımak zorundadır.
    expect(panoKaynak).toMatch(/function taramaDurumu\(/)
    expect(panoKaynak).toMatch(/function teslimDurumu\(/)
    expect(
      /taramaDurumu, teslimDurumu,/.test(panoKaynak),
      'İKİSİ DE DIŞA AÇILMALI: kancalar ölçütü kopyalamak zorunda kalırsa ölçüt ikiye ayrılır ve biri bayatlar.',
    ).toBe(true)
    // ⚠ÖLÇÜT YORUMSUZ KAYNAKTA ARANIR. İlk yazımda `/gozcuDurumu\s*[(,]/` kullandım ve
    // sabotaj (`gozcuDurumu: taramaDurumu,` diye bir TAKMA AD eklemek) kolu DÜŞÜRMEDİ:
    // iki nokta `[(,]` sınıfında yok. Dizeyi çıplak aramak da işe yaramaz, çünkü eski ad
    // bu dosyanın AÇIKLAMA metninde kasten geçiyor. Doğru çözüm: yorumları soy, sonra ara.
    expect(
      /gozcuDurumu/.test(yorumsuz(panoKaynak)) === false,
      'ESKİ AD YAŞAMAYA DEVAM EDEMEZ (takma ad dahil): tek kavrama iki ad, ölçütlerden birinin ' +
        'sessizce bayatlaması demektir. Kancalar `board.gozcuDurumu ? ... : KANITSIZ` kalıbıyla ' +
        'çağırdığı için eski ad kalırsa hata VERMEZ — sessizce KANITSIZ e düşer.',
    ).toBe(true)
  })

  it('TESLIM ölçümü yalnız AJANIN geri yazdığı damgayı okur (kendi kendine yeşillenemez)', () => {
    // En sinsi sahte-yeşil burada olurdu: teslimat damgasını `prob` yazsaydı, hiçbir ajan
    // bildirimi görmeden sütun yeşile dönerdi — yani ölçüm kendi kendini kanıtlardı.
    // Damga YALNIZCA `dogrula` içinde, jeton EŞLEŞTİKTEN sonra yazılır.
    expect(panoKaynak).toMatch(/teslimDogrulandiTs/)
    const dogrulaBlok = kurulumKaynak.slice(kurulumKaynak.indexOf('function dogrula('))
    expect(
      /teslimDogrulandiTs/.test(dogrulaBlok),
      'Damga dogrula() içinde yazılmalı — teslimatın tek kanıtı, kanalın öteki ucundaki ajanın konuşmasıdır.',
    ).toBe(true)
    const probBlok = kurulumKaynak.slice(
      kurulumKaynak.indexOf('function prob('),
      kurulumKaynak.indexOf('function dogrula('),
    )
    expect(
      /teslimDogrulandiTs/.test(probBlok) === false,
      'prob() teslimat damgası YAZAMAZ: prob gözcünün panoyu OKUDUĞUNU kanıtlar, bildirimin ' +
        'ajana ULAŞTIĞINI kanıtlamaz. Yazarsa ölçüm kendi kendini yeşile boyar.',
    ).toBe(true)
  })

  it('eşikler CETVELDEN okunur ve okunamazsa SESSİZ VARSAYILANA DÜŞMEZ', () => {
    // §23 HÜKÜM 4-5: 62 dakikalık sessizlikte ayırt eden sayı satırda ZATEN vardı (SES 64dk);
    // eksik olan onu bir eşiğe bağlamaktı. Eşik koda gömülürse hüküm görünmez olur.
    expect(panoKaynak).toMatch(/function esikleriOku\(/)
    expect(panoKaynak).toMatch(/ESIKLER-BASLANGIC/)
    expect(
      /fleet-mechanism-standard\.md/.test(panoKaynak),
      'Eşikler cetvelden okunmalı; SSOT cetveldir, kod yalnızca okur.',
    ).toBe(true)
    // Cetveldeki blok GERÇEKTEN var mı ve üç eşiği de taşıyor mu (kod ile cetvel birlikte ölçülür).
    const cetvel = oku('docs/standards/fleet-mechanism-standard.md')
    for (const ad of ['SES_ESIK_DK', 'TESLIM_ESIK_DK', 'TARAMA_ESIK_TUR']) {
      expect(
        new RegExp(ad + '\\s*:\\s*\\d+').test(cetvel),
        `Cetveldeki ESIKLER bloğunda ${ad} yok — board.cjs fail-closed davranır ve yoklama hüküm vermez.`,
      ).toBe(true)
    }
  })

  it('MEKANİZMA kırmızısı SESSİZLİK KURALINA yem olmaz', () => {
    // En sinsi kusur burada olurdu: brifingin "yeni bir şey yoksa sus" kuralı, mekanizma
    // kırmızısını da susturursa gözcü öldüğü anda hiçbir satır çıkmaz — yani kapı tam da
    // ölçmesi gereken arızada susar. Bu yüzden ÖLÇÜM erken yapılır ve çıkış koşulu ona bakar.
    const cikis = /if \(others\.length === 0 && notes\.length === 0 && seritAldiMi([^)]*)\) process\.exit\(0\)/.exec(
      brifingKaynak,
    )
    expect(cikis, 'board-brief.cjs sessizlik kuralı satırı bulunamadı (yeniden adlandırılmış olabilir).').not.toBeNull()
    expect(
      cikis && /!mekanizmaSatiri/.test(cikis[1]),
      'Sessizlik kuralı MEKANİZMA kırmızısını yutuyor: çıkış koşuluna !mekanizmaSatiri eklenmeli.',
    ).toBe(true)

    // Sıra ölçümü SATIR indeksiyle yapılır, karakter ofsetiyle değil: ilk denemede
    // indexOf('seritAldiMi &&') dosyanın ÇOK ÖNCESİNDEKİ '!seritAldiMi &&' ile eşleşti ve
    // ölçüm yanlış kırmızı verdi. Substring araması, konum sorusuna yanlış araçtır.
    const L = brifingKaynak.split('\n')
    const cikisSatiri = L.findIndex((l) => l.includes('others.length === 0') && l.includes('process.exit(0)'))
    const olcumSatiri = L.findIndex((l) => l.includes('mekanizmaSatiri ='))
    expect(olcumSatiri, 'mekanizmaSatiri hiç hesaplanmıyor.').toBeGreaterThan(-1)
    expect(cikisSatiri, 'sessizlik çıkışı satırı bulunamadı.').toBeGreaterThan(-1)
    expect(
      olcumSatiri < cikisSatiri,
      'Ölçüm, sessizlik çıkışından SONRA yapılıyor: erken çıkışta hiç koşmaz.',
    ).toBe(true)
  })

  it('SessionStart kancası mekanizmayı oturumun İLK işi olarak dayatır', () => {
    // Üç katman da oturumla birlikte ölür; yeni oturum onları devralmaz. Bunu hatırlatmayı
    // insana bırakmak, 2026-08-20'de dört kez başarısız oldu.
    expect(oturumKaynak).toMatch(/MEKANIZMA/)
    expect(oturumKaynak).toMatch(/mechanism-setup\.cjs plan/)
    expect(
      /prob/.test(oturumKaynak),
      'Kurulum hatırlatması KANIT adımını da içermeli: kurduğunu beyan etmek kurmuş olmak değildir.',
    ).toBe(true)
  })

  it('kurulum betiği ÖLÇÜLEN ile BEYAN EDİLENİ ayırır (fail-closed)', () => {
    // "Ölçemedim" ile "geçti" aynı kovaya girerse bekçinin varlık sebebi silinir. Cron ve
    // uyanış diskten GÖRÜLEMEZ; betik bunu gizlemek yerine adıyla yazmalı.
    expect(kurulumKaynak).toMatch(/OLCULEMEDI/)
    expect(kurulumKaynak).toMatch(/BEYAN/)
    expect(
      /Olcemedim != gecti|OLCULEMEZ/.test(kurulumKaynak),
      'Betik ölçülemeyeni geçmiş saymadığını açıkça söylemeli.',
    ).toBe(true)
  })
})

/**
 * ⭐TESLİMAT KANITI BAĞIMSIZ TANIK İSTER (2026-09-06 ölçümü).
 *
 * NİÇİN: eski kapı, denetlediği ajanın *"jetonu bildirimde gördüm"* BEYANINA güveniyordu ve
 * jetonu ajana **kendi eliyle** veriyordu (`prob` onu stdout'a basar). Bir şerit jetonu
 * bildirimden değil başka bir yerden görüp geri yazdı ve geçerli damga üretti. Kusur ajanda
 * değil TASARIMDA: sınavın cevabı, sınava girenin elindeydi.
 *
 * Çekirdek SAF olduğu için burada FİKSTÜRLE beslenir — saat de dışarıdan verilir. Diske,
 * panoya, saate bağlı bir fonksiyona fikstür veremezsin; veremezsen ayırt ediciliği de
 * kanıtlayamazsın (§25).
 */
const require_ = createRequire(import.meta.url)
const mech = require_(path.join(KOK, 'scripts', 'board', 'mechanism-setup.cjs')) as {
  teslimatKaniti: (g: {
    damga: Record<string, unknown> | null
    gordum: string | null
    kendiSid: string
    simdiMs: number
    esikSn?: number
  }) => { sinif: 'YESIL' | 'ZAYIF' | 'KIRMIZI'; sebep: string; gecenSn: number | null }
  TESLIM_TAZELIK_SN: number
}

const BEN = 'ac03ce11-c975-478d-bf30-66afb7c00f15'
const OPS = 'cb0467f1-f1a3-437d-bc15-52c0bd90feb3'
const T0 = Date.parse('2026-09-06T09:00:00Z')
/** OPS'un attığı, taze, bağımsız jeton — taban fikstür. */
const bagimsizDamga = (uzerine: Record<string, unknown> = {}) => ({
  bekleyenJeton: 'PROB-ac03-XYZ123',
  atanSid: OPS,
  atildiTs: '2026-09-06T09:00:00Z',
  ...uzerine,
})

describe('INV-MECH-1 · teslimat kanıtı BAĞIMSIZ TANIK ister (sahte-yeşil kapatıldı)', () => {
  it('taban: başka oturumun attığı TAZE jeton → YEŞİL', () => {
    const k = mech.teslimatKaniti({
      damga: bagimsizDamga(), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 30_000,
    })
    expect(k.sinif, 'bağımsız ve taze kanıt yeşil sayılmadı — taban kol düşerse alttakiler bir şey kanıtlamaz').toBe('YESIL')
    expect(k.gecenSn).toBe(30)
    expect(k.sebep, 'yeşilin DAYANAĞI yazılmamış; sonradan "yeşildi" demek kanıt değil').toMatch(/BAGIMSIZ/)
  })

  it('⭐AYIRT EDİCİ ÇİFT: jetonu ATAN da kendisiyse → KIRMIZI (tanık, tanıklık ettiği kişi olamaz)', () => {
    const k = mech.teslimatKaniti({
      damga: bagimsizDamga({ atanSid: BEN }), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 30_000,
    })
    expect(k.sinif, 'ajan kendi attığı jetonla kendine kanıt üretti — ölçülmüş sahte-yeşil vakası').toBe('KIRMIZI')
    expect(k.sebep).toMatch(/bagimsiz tanik yok|ATAN da SEN/)
  })

  it('⭐BAYAT jeton kanıt değildir: eşiği aşan geri yazım KIRMIZI', () => {
    const taze = mech.teslimatKaniti({
      damga: bagimsizDamga(), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 179_000,
    })
    const bayat = mech.teslimatKaniti({
      damga: bagimsizDamga(), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 181_000,
    })
    expect(taze.sinif, 'eşiğin ALTINDAKİ geri yazım reddedildi — eşik yanlış tarafa kapanıyor').toBe('YESIL')
    expect(bayat.sinif, 'eski jeton kanalın BUGÜN çalıştığını söylemez ama yeşil sayıldı').toBe('KIRMIZI')
    expect(bayat.sebep).toMatch(/BAYAT/)
    expect(mech.TESLIM_TAZELIK_SN, 'eşik 180 sn değil — cetvelle betik ayrışmış').toBe(180)
  })

  it('⭐ESKİ YOL ÖLDÜRÜLMEDİ, ZAYIF sayıldı: kendi probunun jetonu yeşil DEĞİL, kırmızı da DEĞİL', () => {
    const k = mech.teslimatKaniti({
      damga: { jeton: 'PROB-ac03-ESKI99' }, gordum: 'PROB-ac03-ESKI99', kendiSid: BEN, simdiMs: T0,
    })
    expect(k.sinif, 'geriye uyum kırıldı ya da eski yol hâlâ yeşil sayılıyor').toBe('ZAYIF')
    expect(k.sebep, 'ZAYIF sınıfı sebebini söylemeli: jeton ajanın kendi ekranına da basılıyor').toMatch(/KENDI probunun/)
  })

  it('⭐ÖLÇEMEMEK GEÇMEK DEĞİL: damga yok · jeton yok · zaman okunamıyor · gelecekte → hepsi KIRMIZI', () => {
    const haller: Array<[string, Record<string, unknown> | null, string | null, number]> = [
      ['damga yok', null, 'PROB-ac03-XYZ123', T0],
      ['jeton verilmedi', bagimsizDamga(), null, T0],
      ['jeton uyuşmuyor', bagimsizDamga(), 'PROB-ac03-BASKA1', T0],
      ['atildiTs bozuk', bagimsizDamga({ atildiTs: 'olmayan-tarih' }), 'PROB-ac03-XYZ123', T0],
      ['atildiTs YOK', bagimsizDamga({ atildiTs: undefined }), 'PROB-ac03-XYZ123', T0],
      ['damga GELECEKTE', bagimsizDamga(), 'PROB-ac03-XYZ123', T0 - 60_000],
      ['atanSid YOK', bagimsizDamga({ atanSid: undefined }), 'PROB-ac03-XYZ123', T0 + 10_000],
    ]
    for (const [ad, damga, gordum, simdi] of haller) {
      const k = mech.teslimatKaniti({ damga, gordum, kendiSid: BEN, simdiMs: simdi })
      expect(k.sinif, `"${ad}" hâlinde kanıt ölçülemez ama KIRMIZI dönmedi — ölçemediğini geçmiş saydı`).toBe('KIRMIZI')
    }
  })

  it('⭐prob, BAĞIMSIZ jetonu HEDEFİN ekranına basmaz (yapısal: sınavın cevabı sınava girene verilmez)', () => {
    // Davranışsal kol yukarıda; bu kol tasarımın kendisini korur. Biri "kolaylık olsun" diye
    // jetonu hedefe basarsa, bağımsızlık koda dokunmadan BUHARLAŞIR ve çekirdek bunu göremez.
    expect(kurulumKaynak, '--to bayrağı kaybolmuş').toMatch(/arg\('--to'\)/)
    expect(
      /Jeton HEDEFE bu ekrandan verilmez/.test(kurulumKaynak),
      'prob artık jetonu hedefe vermediğini AÇIKÇA söylemiyor — sınır sessizleşti',
    ).toBe(true)
    expect(
      /--to KENDINE verilemez/.test(kurulumKaynak),
      'prob --to kendine atmayı reddetmiyor: bağımsızlık tek komutla dolanılabilir',
    ).toBe(true)
  })
})
