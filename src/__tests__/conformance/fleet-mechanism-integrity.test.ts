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
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
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
  }) => {
    sinif: 'ZAYIF-PAYLASILAN' | 'ZAYIF-OZ' | 'KIRMIZI'
    sebep: string
    gecenSn: number | null
    /** YALNIZ ZAYIF-PAYLASILAN'da: kuyrukta hangi atanın kaydı sayıldı (tüketim işareti buna göre). */
    atanSid?: string
  }
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
    expect(k.sinif, 'akranın attığı taze jeton ZAYIF-PAYLASILAN sayılmadı — taban kol düşerse alttakiler bir şey kanıtlamaz').toBe('ZAYIF-PAYLASILAN')
    expect(k.gecenSn).toBe(30)
    expect(k.sebep, 'sınıfın DAYANAĞI yazılmamış; sonradan "kanıtlıydı" demek kanıt değil').toMatch(/AKRAN jetonu/)
  })

  it('⭐AYIRT EDİCİ ÇİFT: jetonu ATAN da kendisiyse → KIRMIZI (tanık, tanıklık ettiği kişi olamaz)', () => {
    const k = mech.teslimatKaniti({
      damga: bagimsizDamga({ atanSid: BEN }), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 30_000,
    })
    expect(k.sinif, 'ajan kendi attığı jetonla kendine kanıt üretti — ölçülmüş sahte-yeşil vakası').toBe('KIRMIZI')
    expect(k.sebep).toMatch(/bagimsiz tanik yok|ATAN da SEN/)
  })

  /**
   * ⛔KİMLİK TAKLİDİ (REC-192 · ölçüm 2026-09-07): eşitlik kontrolü YETMEZ.
   * `events.mekanizma-probu.jsonl` içindeki 185 kaydın 185'i de
   * `00000000-0000-4000-8000-<hedefin son 12 hanesi>` biçimli sentetik bir sid'den atılmıştı;
   * gerçek bir akran oturumundan atılan prob SIFIR. Böyle bir sid `atanSid !== kendiSid`
   * şartını GEÇER ve "bağımsız tanık" görünür — oysa hedefin kendi kanalıdır.
   * Bu kol, kanıt tanımının kandırılabilir olmadığını ölçer (OPS hükmü, 2026-09-07).
   */
  it('SENTETİK KİMLİK bağımsız sayılmaz: aynı uuid kuyruğu → KIRMIZI', () => {
    const sentetik = '00000000-0000-4000-8000-' + BEN.slice(-12)
    expect(sentetik, 'fikstür yanlış: sentetik sid gerçek sid ile aynı olmamalı').not.toBe(BEN)
    const k = mech.teslimatKaniti({
      damga: bagimsizDamga({ atanSid: sentetik }), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 30_000,
    })
    expect(
      k.sinif,
      'sentetik kimlikli öz-prob YEŞİL sayıldı — bağımsızlık şartı taklit edilebiliyor demektir (vekil kanıt)',
    ).toBe('KIRMIZI')
    expect(k.sebep, 'sebep "kimlik taklidi" demiyor; okuyan niçin düştüğünü anlamaz').toMatch(/KIMLIK TAKLIDI/)
  })

  it('GERÇEK akran hâlâ YEŞİL (kol gerçek bağımsız tanığı vurmuyor)', () => {
    expect(OPS.slice(-12)).not.toBe(BEN.slice(-12))
    const k = mech.teslimatKaniti({
      damga: bagimsizDamga(), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 30_000,
    })
    expect(k.sinif, 'yeni kol gerçek akranı da düşürdü — kapı fazla geniş').toBe('ZAYIF-PAYLASILAN')
  })

  /**
   * ⭐ÖLÇÜT EŞİTLİK, BENZERLİK DEĞİL — ve bu kol onu AYIRT EDER.
   * Yukarıdaki "gerçek akran yeşil" kolu genişlemeyi yakalamıyordu: ölçütü 12 haneden 2 haneye
   * indirdim (sabotaj) ve test yine geçti, çünkü OPS'un sid'i benimkiyle son 2 hanede de
   * uyuşmuyordu. Yani o kol "kapı fazla geniş değil" demiyor, yalnız o fikstürü sabitliyordu —
   * ayırt etmeyen bir kol ölçüm değildir (bugünün tekrar eden dersi, kendi kapımda yakaladım).
   * Bu kol, son 11 haneyi PAYLAŞAN ama 12'nci hanede AYRIŞAN gerçek bir oturum kullanır:
   * ölçüt eşitlikse YEŞİL kalır, ölçüt "benzerlik"e kaydırılırsa KIRMIZI olur ve sabotaj görünür.
   */
  it('SON 11 HANE aynı, 12. hane FARKLI olan akran → YEŞİL (ölçüt eşitlik olduğu için)', () => {
    const kuyruk = BEN.slice(-12)
    const farkli = (kuyruk[0] === 'a' ? 'b' : 'a') + kuyruk.slice(1)
    const akran = '7f3c9d21-1111-4111-8111-' + farkli
    expect(akran.slice(-12), 'fikstür yanlış: kuyruk aynı çıktı, kol taklit vakasını ölçer').not.toBe(kuyruk)
    expect(akran.slice(-11), 'fikstür yanlış: son 11 hane aynı olmalı ki genişleme görünsün').toBe(BEN.slice(-11))
    const k = mech.teslimatKaniti({
      damga: bagimsizDamga({ atanSid: akran }), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 30_000,
    })
    expect(
      k.sinif,
      'ölçüt eşitlikten benzerliğe kaymış — bu hâlde sid kuyruğu tesadüfen yakın olan GERÇEK akranlar da reddedilir',
    ).toBe('ZAYIF-PAYLASILAN')
  })

  it('⭐BAYAT jeton kanıt değildir: eşiği aşan geri yazım KIRMIZI', () => {
    const taze = mech.teslimatKaniti({
      damga: bagimsizDamga(), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 179_000,
    })
    const bayat = mech.teslimatKaniti({
      damga: bagimsizDamga(), gordum: 'PROB-ac03-XYZ123', kendiSid: BEN, simdiMs: T0 + 181_000,
    })
    expect(taze.sinif, 'eşiğin ALTINDAKİ geri yazım reddedildi — eşik yanlış tarafa kapanıyor').toBe('ZAYIF-PAYLASILAN')
    expect(bayat.sinif, 'eski jeton kanalın BUGÜN çalıştığını söylemez ama yeşil sayıldı').toBe('KIRMIZI')
    expect(bayat.sebep).toMatch(/SURESI GECMIS/)
    expect(mech.TESLIM_TAZELIK_SN, 'eşik 180 sn değil — cetvelle betik ayrışmış').toBe(180)
  })

  /**
   * ⭐INV-MECH-JETON-KUYRUK — üç canlı vaka (2026-09-06/07): Katalog 15:1xZ tüketilmiş jeton,
   * URUN 06:43Z 12 saatlik jeton, ALTYAPI 18:42Z + 06:41Z. Hepsinde ÖLÜ jeton CANLI kapıyı
   * kilitledi: eski akış `bekleyenJeton` doluysa öz-prob yoluna hiç ulaşmadan dönüyordu.
   * Sabotaj kolu şu soruya cevap verir: "kuyruk yerine tek slot olsaydı bu testler geçer miydi?"
   * Hayır — üçü de kırmızı verirdi. Ölçüt ayırt ediyor.
   */
  describe('INV-MECH-JETON-KUYRUK: bekleyen jeton bir DURUM değil KUYRUK', () => {
    const ATAN_A = '4a8eaf9c-9b4f-4470-9761-69c58e2a926a'
    const ATAN_B = '3a7976a1-6510-43a8-a306-c2942e3d1bc2'

    it('TÜKETİLMİŞ kayıt öz-prob yolunu KESMEZ (Katalog 15:1xZ vakası)', () => {
      const damga = {
        jeton: 'PROB-ac03-OZPROB',
        bekleyenler: { [ATAN_A]: { jeton: 'PROB-ac03-ESKI11', atildiTs: new Date(T0).toISOString(), tuketildi: true } },
      }
      const k = mech.teslimatKaniti({ damga, gordum: 'PROB-ac03-OZPROB', kendiSid: BEN, simdiMs: T0 + 10_000 })
      expect(k.sinif, 'tüketilmiş bekleyen kayıt taze öz-probu bloke etti — eski tek-slot davranışı geri gelmiş').toBe('ZAYIF-OZ')
    })

    it('SÜRESİ GEÇMİŞ kayıt öz-prob yolunu KESMEZ (URUN 06:43Z, 12 saatlik jeton)', () => {
      const damga = {
        jeton: 'PROB-ac03-OZPROB',
        bekleyenler: { [ATAN_A]: { jeton: 'PROB-ac03-OLU22', atildiTs: new Date(T0).toISOString() } },
      }
      const k = mech.teslimatKaniti({ damga, gordum: 'PROB-ac03-OZPROB', kendiSid: BEN, simdiMs: T0 + 43_200_000 })
      expect(k.sinif, 'süresi geçmiş bekleyen kayıt taze öz-probu bloke etti').toBe('ZAYIF-OZ')
    })

    it('İKİ FARKLI ATAN aynı hedefte YAN YANA yaşar (çarpışma bulgusu)', () => {
      const damga = {
        bekleyenler: {
          [ATAN_A]: { jeton: 'PROB-ac03-AAA111', atildiTs: new Date(T0).toISOString() },
          [ATAN_B]: { jeton: 'PROB-ac03-BBB222', atildiTs: new Date(T0).toISOString() },
        },
      }
      const a = mech.teslimatKaniti({ damga, gordum: 'PROB-ac03-AAA111', kendiSid: BEN, simdiMs: T0 + 5_000 })
      const b = mech.teslimatKaniti({ damga, gordum: 'PROB-ac03-BBB222', kendiSid: BEN, simdiMs: T0 + 5_000 })
      expect(a.sinif, 'A kaydı okunamadı — tek slot davranışı: son yazan ötekini siliyor').toBe('ZAYIF-PAYLASILAN')
      expect(b.sinif, 'B kaydı okunamadı').toBe('ZAYIF-PAYLASILAN')
      expect(a.atanSid, 'hangi atanın kaydı sayıldığı dönmüyor — tüketim yanlış kaydı işaretler').toBe(ATAN_A)
      expect(b.atanSid).toBe(ATAN_B)
    })

    it('TÜKETİLMİŞ jeton İKİNCİ kez sayılmaz ve sebebi TÜKETİLMİŞ der (uyuşmuyor DEMEZ)', () => {
      const damga = {
        bekleyenler: { [ATAN_A]: { jeton: 'PROB-ac03-BIRKEZ', atildiTs: new Date(T0).toISOString(), tuketildi: true } },
      }
      const k = mech.teslimatKaniti({ damga, gordum: 'PROB-ac03-BIRKEZ', kendiSid: BEN, simdiMs: T0 + 5_000 })
      expect(k.sinif).toBe('KIRMIZI')
      expect(k.sebep, 'yanlış sebep: ajan "uyuşmuyor" okuyup jetonu yanlış sanıyor').toMatch(/tuketilmis/)
    })

    it('⛔BEKLENEN JETON EKRANA BASILMAZ: eşleşmeyen geri yazım cevabı SIZDIRMAZ', () => {
      const damga = {
        bekleyenler: { [ATAN_A]: { jeton: 'PROB-ac03-GIZLI9', atildiTs: new Date(T0).toISOString() } },
      }
      const k = mech.teslimatKaniti({ damga, gordum: 'PROB-ac03-YANLIS', kendiSid: BEN, simdiMs: T0 + 5_000 })
      expect(k.sinif).toBe('KIRMIZI')
      expect(
        k.sebep.includes('PROB-ac03-GIZLI9'),
        'kapı sınavın CEVABINI ekrana yazdı: bildirimi görmeyen ajan bu satırdan okuyup geçerli damga üretebilir',
      ).toBe(false)
      expect(k.sebep, 'ajan neyi bekleyeceğini bilmeli: canlı kayıt SAYISI ve ATAN söylenir').toMatch(/CANLI bekleyen/)
    })

    it('ESKİ TEK SLOT okunmaya devam eder (geriye uyum — diskteki damgalar filo koşarken yazıldı)', () => {
      const damga = { bekleyenJeton: 'PROB-ac03-ESKIYOL', atanSid: ATAN_A, atildiTs: new Date(T0).toISOString() }
      const k = mech.teslimatKaniti({ damga, gordum: 'PROB-ac03-ESKIYOL', kendiSid: BEN, simdiMs: T0 + 5_000 })
      expect(k.sinif, 'eski biçim damga artık okunamıyor — filonun diskteki kayıtları kör kaldı').toBe('ZAYIF-PAYLASILAN')
    })
  })

  /**
   * ⛔CRON KAPALI (Recep kararı 2026-09-06). Kapalı bir katmanın "kanıtlanmadı" diye kırmızı
   * yazması fail-closed değil GÜRÜLTÜdür: kararı uygulayan her oturum ceza alır ve gerçek
   * kırmızılar (gözcü, teslimat) gölgelenir. Karar aracın çıktısına YAZILMAZSA araç kararın
   * aksini önermeye devam eder — 09-06/07'de dört oturum aynı satırı ayrı ayrı açıklamak zorunda kaldı.
   */
  it('⛔CRON katmanı KAPALI etiketi taşır ve plan çıktısı KURMAYI ÖNERMEZ', () => {
    expect(kurulumKaynak, 'cron kararı betiğe yazılmamış — araç kararın aksini önermeye devam eder').toMatch(/RECEP KARARI 2026-09-06/)
    const planBlok = kurulumKaynak.slice(kurulumKaynak.indexOf("yaz('2) CRON"), kurulumKaynak.indexOf("yaz('3) TUR-SONU"))
    expect(planBlok, 'plan çıktısı hâlâ CronCreate öneriyor').not.toMatch(/CronCreate/)
    expect(planBlok, 'KAPALI etiketi yok — okuyan kurmaya kalkar').toMatch(/KAPALI/)
  })

  it('⭐ESKİ YOL ÖLDÜRÜLMEDİ, ZAYIF sayıldı: kendi probunun jetonu yeşil DEĞİL, kırmızı da DEĞİL', () => {
    const k = mech.teslimatKaniti({
      damga: { jeton: 'PROB-ac03-ESKI99' }, gordum: 'PROB-ac03-ESKI99', kendiSid: BEN, simdiMs: T0,
    })
    expect(k.sinif, 'geriye uyum kırıldı ya da eski yol hâlâ yeşil sayılıyor').toBe('ZAYIF-OZ')
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
    /**
     * ⚠ÖLÇÜT 2026-09-07'de GERÇEĞE BAĞLANDI (REC-192). Eski hâli şu CÜMLEYİ birebir arıyordu:
     * "Jeton HEDEFE bu ekrandan verilmez". O gün garanti **güçlendirildi** — jeton artık
     * hedefin değil ATANIN da ekranına basılmıyor (atanın ekranı bir aklama yoluydu: atan
     * jetonu hedefe iletirse kapı "bağımsız tanık" der). Cümle değişti, kol düştü, oysa
     * korunan şey iyileşmişti. *Ölçüt ada değil GERÇEĞE bağlanır* — bugün bu sınıfın
     * dördüncü tekrarı, bu sefer kendi kapımızda.
     * Yeni ölçüt: bağımsız dal jetonu BASMADIĞINI söylüyor, ve basma çağrısı KOŞULLU.
     */
    expect(
      /jeton bu ekrana BASILMADI/.test(kurulumKaynak),
      'prob artık jetonu basmadığını AÇIKÇA söylemiyor — sınır sessizleşti',
    ).toBe(true)
    expect(
      /hedefSid[\s\S]{0,80}jeton bu ekrana BASILMADI[\s\S]{0,320}:[\s\S]{0,60}jeton/.test(kurulumKaynak),
      'jeton basımı KOŞULSUZ — akran probunda da değer ekrana düşer, ekran hijyeni buharlaşır',
    ).toBe(true)
    expect(
      /--to KENDINE verilemez/.test(kurulumKaynak),
      'prob --to kendine atmayı reddetmiyor: bağımsızlık tek komutla dolanılabilir',
    ).toBe(true)
  })
})

/**
 * ============================================================================
 * INV-MECH-BAGIMSIZLIK-1 — REC-287: TESLİMAT KATMANINDA YEŞİL YOKTUR.
 * ============================================================================
 *
 * NİÇİN VAR (2026-09-08'de ÖLÇÜLDÜ, ve bu kapı o gün ÜÇ KEZ kanıt diye kullanıldı):
 * `dogrula --gordum`, akranın attığı bir jeton geri yazıldığında `YESIL` yazıyor ve sebebine
 * *"BAGIMSIZ tanik"* diyordu. Üç ölçüm bunun sahte-bağımsız olduğunu gösterdi:
 *   1) `prob --to` yardımı "Jeton ATANIN ekranina basilir" diyordu, kod BASMIYORDU — yani
 *      aracın kendi kanıt hikâyesi kendi davranışıyla çelişiyordu.
 *   2) Gizlemek zaten işe yaramıyor: `gozcu.cjs` `type:'note'` olan HER olayı basar, `to`
 *      süzgeci YOKTUR; prob olayının sid'i hedeften türetilmiş sentetik bir uuid olduğu için
 *      ATANIN kendi gözcüsü de onu basar. Saha kanıtı: ALTYAPI'nın URUN'a attığı jeton
 *      ALTYAPI'nın kendi bildirimine düştü; OPS gözcüsü kendisine ait olmayan iki probu gördü.
 *   3) Ve pano düz bir jsonl dizinidir: jetonu görmek için hiçbir bildirime gerek yok, `cat` yeter.
 *
 * ⛔KAYITTAKİ 3. SEÇENEK (hedefin kendi koşumunda üretilen ikinci sır) UYGULANMADI, ve
 * gerekçesi hem kodda hem burada yazılı: sınanan kanalın KENDİSİ panodur, test malzemesi
 * panodan geçmek zorundadır, panodan geçen her şey okunabilir. İkinci sır sırrın YAZARINI
 * değiştirir, OKUNABİLİRLİĞİNİ değiştirmez — geri yazılan jeton "bildirim KONUŞMAYA ulaştı"
 * ile "ajan DOSYAYI okudu"yu hâlâ ayırt edemez. Bu koldaki asıl iş, o yanılsamanın bir daha
 * `YESIL` adıyla dönmesini ENGELLEMEKTİR.
 *
 * KAPSAM SINIRI — ADIYLA: bu kollar kanıtın GÜÇLENDİĞİNİ ölçmez (güçlendirilemez).
 * Kanıt SINIFININ doğru ADLANDIRILDIĞINI ölçer. Adlandırma bu vakada işin kendisidir:
 * ölçüm doğruydu, ADI yanlıştı ve üç şerit o ada güvenerek karar verdi.
 */
describe('INV-MECH-BAGIMSIZLIK-1 · teslimat kanıtı YEŞİL olamaz, sınıfı ADIYLA anılır', () => {
  const KENDI = 'ac03ce11-c975-478d-bf30-66afb7c00f15'
  const AKRAN = 'cb0467f1-f1a3-437d-bc15-52c0bd90feb3'
  const T = Date.parse('2026-09-08T12:00:00Z')

  /**
   * ⭐EN ÖNEMLİ KOL: çekirdek, HİÇBİR fikstürde `YESIL` dönmez.
   * Tek tek sınıf eşitliği ölçen kollar bu garantiyi vermiyordu — biri "kolaylık olsun" diye
   * yeni bir yeşil dal eklerse o kollar sessiz kalırdı. Bu kol EVRENİ ölçer: girdi uzayının
   * temsili bir kesitinde yeşil ÇIKMAMALI. (Evren tam değil; sınırı burada yazılı.)
   */
  it('⭐ÇEKİRDEK HİÇBİR HÂLDE `YESIL` DÖNDÜRMEZ (sınıf kaldırıldı, dal eklenirse bu kol düşer)', () => {
    const haller = [
      { damga: { bekleyenler: { [AKRAN]: { jeton: 'J1', atildiTs: new Date(T).toISOString() } } }, gordum: 'J1', simdi: T + 5_000 },
      { damga: { jeton: 'J2' }, gordum: 'J2', simdi: T },
      { damga: { bekleyenJeton: 'J3', atanSid: AKRAN, atildiTs: new Date(T).toISOString() }, gordum: 'J3', simdi: T + 1_000 },
      { damga: null, gordum: 'J4', simdi: T },
      { damga: { bekleyenler: { [AKRAN]: { jeton: 'J5', atildiTs: new Date(T).toISOString() } } }, gordum: 'YANLIS', simdi: T },
    ]
    for (const h of haller) {
      const k = mech.teslimatKaniti({ damga: h.damga, gordum: h.gordum, kendiSid: KENDI, simdiMs: h.simdi })
      expect(
        k.sinif,
        'teslimat katmanında YEŞİL yeniden doğmuş — REC-287: jeton panoyu okuyan herkese açık, ' +
          'bu katmanda kanıt tavanı ZAYIF-PAYLASILAN dır',
      ).not.toBe('YESIL')
    }
  })

  it('TAVAN sınıfı SINIRINI söyler: paylaşıldığını ve neyi AYIRT ETMEDİĞİNİ yazar', () => {
    const k = mech.teslimatKaniti({
      damga: { bekleyenler: { [AKRAN]: { jeton: 'PROB-ac03-TAVAN1', atildiTs: new Date(T).toISOString() } } },
      gordum: 'PROB-ac03-TAVAN1', kendiSid: KENDI, simdiMs: T + 10_000,
    })
    expect(k.sinif).toBe('ZAYIF-PAYLASILAN')
    // Sebep okunmadan karar verilmiyor: sınıf adı kısa, sınırı taşıyan şey SEBEPTİR.
    expect(k.sebep, 'sınıfın PAYLAŞILAN olduğu yazılmıyor — okuyan bunu bağımsız sanar').toMatch(/PAYLASILAN/)
    expect(k.sebep, 'neyi ayırt ETMEDİĞİ yazılmıyor').toMatch(/ayirt ETMEZ|ayirt etmez/)
    expect(k.sebep, '"YESIL DEGIL" demiyor — kaldırılan yanılsama sebep metninde yaşamaya devam eder').toMatch(/YESIL DEGIL/)
  })

  /**
   * ⭐DAVRANIŞSAL KOL — kaynak taraması DEĞİL: CLI gerçekten koşuluyor, fikstür panoyla.
   * Sebep: sınıf adını değiştirip çıktıda "YESIL" bırakmak mümkündü; o hâlde bütün kaynak
   * kolları geçerdi ve ekranda okunan şey yine yeşil olurdu. Ekranda ne yazdığı ölçülür.
   */
  describe('CLI davranışı (fikstür pano, gerçek koşum)', () => {
    const kos = (
      damga: Record<string, unknown> | null,
    ): { kod: number; cikti: string; damgaSonu: Record<string, unknown> | null } => {
      const dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'rec287-'))
      const sid8 = KENDI.slice(0, 8)
      // Gözcü katmanı YEŞİL olsun ki ölçülen tek şey TESLİMAT satırı ve çıkış kodu olsun.
      fs.writeFileSync(
        path.join(dizin, '.gozcu-imlec.' + sid8 + '.json'),
        JSON.stringify({ sid: KENDI, aralikSn: 60, sonTarama: new Date().toISOString(), ofsetler: { 'events.x.jsonl': 1 } }),
      )
      const dy = path.join(dizin, '.mekanizma-durum.' + sid8 + '.json')
      if (damga) fs.writeFileSync(dy, JSON.stringify(damga))
      let kod = 0
      let cikti = ''
      try {
        cikti = execFileSync(
          process.execPath,
          [path.join(KOK, 'scripts', 'board', 'mechanism-setup.cjs'), 'dogrula', '--sid', KENDI, '--gordum', 'PROB-ac03-CLI001'],
          { encoding: 'utf8', env: { ...process.env, VENTHUB_BOARD_DIR: dizin }, stdio: 'pipe' },
        )
      } catch (e) {
        const err = e as { status?: number; stdout?: string; stderr?: string }
        kod = err.status ?? 1
        cikti = `${err.stdout ?? ''}${err.stderr ?? ''}`
      }
      let damgaSonu: Record<string, unknown> | null = null
      try {
        damgaSonu = JSON.parse(fs.readFileSync(dy, 'utf8'))
      } catch {
        damgaSonu = null
      }
      return { kod, cikti, damgaSonu }
    }

    const tazeAkran = () => ({
      bekleyenler: { [AKRAN]: { jeton: 'PROB-ac03-CLI001', atildiTs: new Date().toISOString() } },
    })

    it('⭐AKRAN jetonu: çıktıda `TESLIMAT  : YESIL` YOK, sınıf adı VAR', () => {
      const { cikti } = kos(tazeAkran())
      expect(cikti, 'TESLIMAT satırı hâlâ YEŞİL yazıyor — REC-287 ekranda geri gelmiş').not.toMatch(/TESLIMAT\s*:\s*YESIL/)
      expect(cikti, 'sınıf adı ekranda yok; okuyan neye güvendiğini bilemez').toMatch(/ZAYIF-PAYLASILAN/)
      expect(cikti, 'ekran "YESIL DEGIL" demiyor').toMatch(/YESIL DEGIL/)
    })

    it('⭐TAVAN KIRMIZI SAYILMAZ: akran jetonu → çıkış 0 (kanıtlanamaz katmanı cezalandırmak gürültüdür)', () => {
      const { kod, cikti } = kos(tazeAkran())
      expect(
        kod,
        'tavan sınıfı kırmızı sayıldı: her oturum kalıcı kırmızı alır ve gerçek kırmızılar ' +
          '(gözcü, bayat/taklit jeton) gölgelenir — CRON katmanı için 2026-09-06 da verilen hükmün aynısı',
      ).toBe(0)
      expect(cikti).toMatch(/KIRMIZI YOK/)
    })

    it('AYIRT EDİCİ ÇİFT — ÖZ prob (tavanın ALTI) → çıkış 1 (erişilebilir üst sınıf varken bedava geçmez)', () => {
      const { kod, cikti } = kos({ jeton: 'PROB-ac03-CLI001' })
      expect(kod, 'ZAYIF-OZ kırmızı saymıyor — kapı iki hâli ayırt etmiyor demektir').toBe(1)
      expect(cikti).toMatch(/ZAYIF-OZ/)
    })

    it('SINIF DAMGAYA YAZILIR (yoksa aşağı akış onu "kanıtlı" diye yeniden yeşillendirir)', () => {
      const { damgaSonu } = kos(tazeAkran())
      expect(damgaSonu, 'damga hiç yazılmadı — yoklamanın TESLİM sütunu körleşir').not.toBeNull()
      expect(damgaSonu?.teslimKanitSinifi, 'sınıf damgada yok').toBe('ZAYIF-PAYLASILAN')
      expect(damgaSonu?.teslimDogrulandiTs, 'yaş damgası yazılmamış').toBeTruthy()
    })
  })

  it('YARDIM METNİ ile DAVRANIŞ eşit: "atanin ekranina basilir" cümlesi KALDIRILDI (kabul ölçütü 1)', () => {
    /**
     * ⭐ÖLÇÜM EVRENİ = YALNIZ KULLANIM BLOĞU, dosyanın tamamı DEĞİL — ve bunu bu kol
     * KENDİSİ ÖĞRETTİ (2026-09-08, ilk koşum): kol dosya genelinde arıyordu ve KIRMIZI verdi,
     * çünkü REC-287 gerekçesi eski yanlış cümleyi **alıntılıyor** ("yardım metni şunu diyordu:
     * ...") — yani kol, kusurun ONARIM KAYDINI kusurun kendisi saydı.
     * Aynı sınıfın bir örneği daha: *ölçüt keskin, evren yanlış.* Doğru evren, ekrana basılan
     * kullanım bloğudur; yorumdaki tarihsel alıntı ekrana çıkmaz ve çıkmaması da gerekmez —
     * gerekçenin silinmesi, gerekçesiz bir kurala dönüşmek olurdu.
     */
    const kullanimBlogu = kurulumKaynak.slice(kurulumKaynak.indexOf("yaz('kullanim: mechanism-setup.cjs"))
    expect(kullanimBlogu.length, 'kullanım bloğu bulunamadı — ölçüm evreni boş, kol kör').toBeGreaterThan(200)
    expect(
      /Jeton ATANIN ekranina basilir/.test(kullanimBlogu),
      'yardım metni hâlâ davranışın TERSİNİ söylüyor — REC-287 kabul ölçütü 1',
    ).toBe(false)
    // Ve yeni metin doğruyu söylüyor: gizlemenin bir bariyer OLMADIĞINI.
    expect(kurulumKaynak, 'yardım metni jetonun atanın bildirimine düştüğünü söylemiyor').toMatch(/BASILMAZ; ama GIZLI DE DEGILDIR/)
    expect(kurulumKaynak, 'yardım metni bu katmanda yeşil olmadığını söylemiyor').toMatch(/BU KATMANDA YESIL YOKTUR/)
  })

  /**
   * ⭐İDDİANIN DAYANAĞI KODDA SABİTLENİR — ve bu kol bilerek `gozcu.cjs`'e bakar.
   * Bütün gerekçe şu ölçüme dayanıyor: gözcü `to` süzmez, bu yüzden jeton atanın bildirimine
   * de düşer. Yarın biri gözcüye hedef süzgeci eklerse gerekçe BAYATLAR — ve bayat bir gerekçe,
   * yanlış bir gerekçeden daha sinsidir çünkü kimse ona bakmaz. O gün bu kol kırmızı vererek
   * "sınıf adını yeniden düşün" der. Kol, süzgeci YASAKLAMIYOR; gerekçeyle birlikte
   * değerlendirilmesini ZORUNLU kılıyor.
   */
  it('⭐GEREKÇENİN DAYANAĞI: gozcu.cjs not basarken `to` ile SÜZMÜYOR (değişirse bu kol uyarır)', () => {
    expect(gozcuKaynak, 'gözcü kaynağı okunamadı — dayanak ölçülemez').toContain('notSatiri')
    const basimBlogu = gozcuKaynak.slice(gozcuKaynak.indexOf('for (const satir of'), gozcuKaynak.indexOf('if (bozukSatir)'))
    expect(basimBlogu.length, 'basım bloğu bulunamadı; ölçüm evreni boş — kör kol').toBeGreaterThan(100)
    expect(
      /o\.to/.test(basimBlogu),
      'gözcüye hedef süzgeci EKLENMİŞ. Bu iyi bir değişiklik olabilir ama REC-287 gerekçesi ' +
        '"jeton atanın bildirimine de düşer" ölçümüne dayanıyor: gerekçeyi ve kanıt sınıfını ' +
        'YENİDEN ÖLÇ. (Panonun dosya olarak okunabilirliği yine de yeşili geri getirmez.)',
    ).toBe(false)
  })

  it('AÇILIŞ SATIRI teslimatı "KANITLI" diye sunmaz ve sınıfı DAMGADAN okur (yer değiştiren yeşil)', () => {
    expect(
      /TESLIMAT ' \+ teslim \+ 'dk once KANITLI/.test(oturumKaynak),
      'açılış satırı hâlâ "KANITLI" diyor — sahte-yeşil mechanism-setup tan buraya TAŞINMIŞ olur',
    ).toBe(false)
    expect(oturumKaynak, 'açılış satırı sınıfı damgadan okumuyor (kendi adını uyduruyor)').toMatch(/teslimKanitSinifi/)
    expect(oturumKaynak, 'açılış satırı yeşil olmadığını söylemiyor').toMatch(/YESIL DEGILDIR/)
    expect(panoKaynak, 'board.cjs sınıf okuyucusunu dışa açmıyor').toMatch(/teslimKanitSinifi,/)
  })

  it('YOKLAMA, TESLİM sütununun sınırını KOŞULSUZ basar (taze olduğu günler de dahil)', () => {
    // Sınırı yalnız "teslimatsız şerit varken" basmak, tam da yanlış kanaatin serbest kaldığı
    // günü (hepsi taze) açıkta bırakırdı.
    expect(panoKaynak, 'TESLİM sütununun sınırı yoklamada yazılı değil').toMatch(/TESLIM sutunu YAS olcer, GUC olcmez/)
    expect(panoKaynak).toMatch(/Teslimatta YESIL YOKTUR/)
  })

  it('CETVEL bu hükmü taşıyor (araç ile cetvel ayrışmaz)', () => {
    const cetvel = oku('docs/standards/fleet-mechanism-standard.md')
    expect(cetvel, 'cetvel okunamadı').not.toBe('')
    expect(cetvel, 'kanıt sınıfları cetvelde yok — araç kararı tek başına taşıyor').toMatch(/ZAYIF-PAYLASILAN/)
    // Cetvel Türkçe yazılır (YEŞİL), araç ASCII basar (YESIL) — ölçüt ikisini de kabul eder.
    expect(cetvel, 'cetvel teslimatta yeşil olmadığını yazmıyor').toMatch(/(YEŞİL|YESIL)[^\n.]{0,40}YOKTUR/)
    expect(
      cetvel,
      'ikinci-sır seçeneğinin NİÇİN reddedildiği cetvelde yazılı değil — altı ay sonra "nonce ekleyelim" diye yeniden açılır',
    ).toMatch(/[İIi]kinci s[ıi]r/)
  })
})
