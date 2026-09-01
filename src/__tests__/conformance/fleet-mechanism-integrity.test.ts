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
