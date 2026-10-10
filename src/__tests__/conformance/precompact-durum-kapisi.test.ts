import { execFileSync, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn, `vitest.config.ts`).
 * Ölçüm 2026-08-30, boş makine: gövde **1,79 sn**, 3 alt süreç çağrısı.
 * Yük altında gözlenen amplifikasyon ~27× (tek gözlem: `eol` 1,47 → 39,9 sn).
 * 60 sn'yi aşan kırmızı GERÇEK aşımdır. Gerekçe: `docs/standards/fleet-mechanism-standard.md` §13.
 */
vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-COMPACT-1 · Compact, durum yazılmadan sessizce geçmemeli.
 *
 * NİÇİN VAR — ölçülmüş vakalar, hipotez değil:
 *  · 2026-08-27: compact dönüşünde durum dosyası okunmadı, gün boyu bedel ödendi.
 *  · 2026-08-28: geçiş anında yazılan kullanıcı mesajı yutuldu → 3 tur kayıp + güven hasarı.
 *  · Aynı gün ölçüldü: bu makinede PreCompact kancası HİÇBİR ayar katmanında tanımlı değildi
 *    (proje/kullanıcı/local settings + 11 eklenti hooks.json → 0; negatif kontrol olarak
 *    SessionStart aynı taramada 153 dosyada bulundu). Yani compact dayanıklılığı tamamen
 *    ajan disiplinine dayanıyordu; "kural yazılıydı, mekanizma yoktu".
 *
 * ⚠ KOL SEÇİMİ KASITLI — her kolun cevapladığı soru "bu kol olmasaydı sonuç FARKLI olur muydu":
 *  · BAĞLILIK kolu: kanca dosyası var ama settings.json'a bağlanmamışsa hiç koşmaz. Bu depoda
 *    ölçülmüş bir sınıf ("kapıları settings.json'da Bash'e BAĞLA — yazıldı-ama-bağlanmadı
 *    boşluğu"). Kanca testleri yeşilken kancanın hiç çalışmadığı hali yalnız bu kol yakalar.
 *  · AYIRT EDİCİLİK kolu: kapının ilk uygulaması "originSessionId eşleşen en taze dosya"
 *    diyordu ve bu AYIRT ETMİYORDU — bu oturumun 23 hafıza dosyası var, çoğu DERS dosyası.
 *    Kapı bir ders dosyasını durum dosyası sanıp yanlış alarm verdi. Hata bağlanmadan önce
 *    testte yakalandı; bu kol onun geri gelmesini engeller.
 *  · MODÜL kolu: `session-board.cjs` bu dosyayı `require` ediyor. Kanca `require` anında
 *    koşarsa stdin okur ve `process.exit` çağırır — yani ÇAĞIRANIN oturumunu öldürür.
 *  · VALF kolu: blok kilitlenme üretebilir; kaçış yolu ölçülebilir olmalı.
 *
 * NOT — `node:fs` KULLANILMIYOR: bu ortamda yerel `@types/node` bozuk ve `tsc` `fs`'i
 * çözemiyor (bkz. `board-invariants.test.ts`). Dosya işleri çocuk süreçle yapılıyor.
 */

const require_ = createRequire(import.meta.url)
const KAPI = require_.resolve('../../../.claude/hooks/precompact-durum-kapisi.cjs')
const AYARLAR = require_.resolve('../../../.claude/settings.json')

/** Çocuk süreçle dosya sistemi kurulumu — `node:fs` importu yasak olduğu için. */
function nodeKos(betik: string): string {
  return execFileSync(process.execPath, ['-e', betik], { encoding: 'utf8' })
}

const SID = '11111111-2222-3333-4444-555555555555'

/**
 * Sahte proje dizini kurar: <tmp>/<rastgele>/memory + transcript yolu.
 * `dosyalar` = [ad, gövde] çiftleri. Gövdeye SID gömülür (frontmatter kimliği).
 */
function projeKur(dosyalar: Array<[string, string]>): { transcript: string; kok: string } {
  const kok = nodeKos(`
    const fs=require('fs'),os=require('os'),path=require('path');
    const kok=fs.mkdtempSync(path.join(os.tmpdir(),'precompact-kol-'));
    fs.mkdirSync(path.join(kok,'memory'),{recursive:true});
    process.stdout.write(kok);
  `).trim()
  for (const [ad, govde] of dosyalar) {
    nodeKos(`
      const fs=require('fs'),path=require('path');
      fs.writeFileSync(path.join(${JSON.stringify(kok)},'memory',${JSON.stringify(ad)}), ${JSON.stringify(govde)}, 'utf8');
    `)
  }
  return { transcript: `${kok.replace(/\\/g, '/')}/${SID}.jsonl`, kok }
}

function kapiKos(transcript: string, sid = SID, cevre: Record<string, string> = {}) {
  return spawnSync(process.execPath, [KAPI], {
    input: JSON.stringify({ session_id: sid, trigger: 'manual', transcript_path: transcript }),
    encoding: 'utf8',
    env: { ...process.env, ...cevre },
  })
}

/** Dört sabit alanı taşıyan, taze bir durum dosyası gövdesi. */
const TAM_DURUM =
  `---\nname: kol-lane-day\nmetadata:\n  originSessionId: ${SID}\n---\n\n` +
  `## Durum\n**SON GIRDI:** kullanici X dedi\n**ACIK KUYRUK:** iki kalem\n` +
  `**VERILEN SOZLER:** rapor\n**BEKLEYEN KARARLAR:** Recep'te bir onay\n`

/**
 * ⭐AYNI DOSYA, TÜRKÇE BAŞLIKLARLA — sahadaki gerçek biçim.
 *
 * NİÇİN VAR: kapı testte YEŞİLDİ ama sahada GÜNDE İKİ KEZ yanlış alarm verdi. Sebep
 * fikstürdü: bütün fikstürler ASCII başlık (`SON GIRDI`) üretiyordu, oysa şeritler Türkçe
 * yazıyor (`SON GİRDİ`). Yani fikstür, biçimin sahada KULLANILAN varyantını hiç üretmiyordu —
 * kol vardı, ölçtüğü şey yoktu. (URUN bildirdi, ALTYAPI ölçtü, 2026-09-01.)
 */
const TAM_DURUM_TR =
  `---\nname: kol-lane-day\nmetadata:\n  originSessionId: ${SID}\n---\n\n` +
  `## Durum\n## SON GİRDİ\nkullanıcı X dedi\n## AÇIK KUYRUK\niki kalem\n` +
  `## VERİLEN SÖZLER\nrapor\n## BEKLEYEN KARARLAR\nRecep'te bir onay\n`

describe('INV-COMPACT-1 — PreCompact durum kapısı', () => {
  it('BAĞLILIK: kanca settings.json içinde PreCompact olayına bağlı — dosyanın var olması yetmez', () => {
    const ayarlar = require_(AYARLAR) as { hooks?: Record<string, Array<{ hooks?: Array<{ command?: string }> }>> }
    const pre = ayarlar.hooks?.PreCompact
    expect(pre, 'settings.json içinde PreCompact YOK — kanca dosyası yazılmış ama HİÇ KOŞMAZ').toBeTruthy()
    const komutlar = (pre ?? []).flatMap(g => (g.hooks ?? []).map(h => h.command ?? ''))
    expect(
      komutlar.some(k => k.includes('precompact-durum-kapisi.cjs')),
      `PreCompact bağlı ama başka komuta: ${komutlar.join(' | ')}`,
    ).toBe(true)
  })

  it('BLOK: oturumun durum dosyası hiç yoksa çıkış kodu 2 ve sebep stderr\'de', () => {
    const { transcript } = projeKur([['baskasinin-dosyasi.md', '---\nname: x\n---\nalakasiz\n']])

    const r = kapiKos(transcript)

    expect(r.status, `blok beklenirdi; stdout=${r.stdout} stderr=${r.stderr}`).toBe(2)
    expect(r.stderr).toMatch(/COMPACT DURDURULDU/)
    expect(r.stderr, 'sebep yazılmalı: operatör ne yapacağını bilmeli').toMatch(/durum dosyani yaz/i)
  })

  it('TEMİZ: taze ve dört alanlı durum dosyası varsa geçer, uyarı basmaz', () => {
    const { transcript } = projeKur([['kol-lane-day-2026-08-28.md', TAM_DURUM]])

    const r = kapiKos(transcript)

    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/TEMIZ/)
    expect(r.stdout, 'temiz halde uyarı basmamalı — her koşumda öten satır üç günde görmezden gelinir').not.toMatch(/⚠/)
  })

  it('EKSİK ALAN: dört alandan biri yoksa UYARIR ama BLOKLAMAZ', () => {
    const eksik = TAM_DURUM.replace(/\*\*BEKLEYEN KARARLAR:\*\*.*\n/, '')
    const { transcript } = projeKur([['kol-lane-day-2026-08-28.md', eksik]])

    const r = kapiKos(transcript)

    expect(r.status, 'bayatlık/eksiklik compact\'i BLOKLAMAMALI — engellemek kaybettiğinden fazlasına mal olur').toBe(0)
    expect(r.stdout).toMatch(/EKSIK ALAN/)
    expect(r.stdout).toMatch(/bekleyen kararlar/i)
  })

  it('YAŞ OKUNUR YAZILIR: dakika → saat → gün (Ops 09-29: iki günlük dosya "2880 dakika" görünüyordu)', () => {
    const m = require_(KAPI) as { yasMetni?: (dk: number) => string }
    expect(typeof m.yasMetni, 'yasMetni dışa açık olmalı').toBe('function')
    expect(m.yasMetni?.(90)).toBe('90 dakika')
    expect(m.yasMetni?.(300)).toBe('5 saat')
    expect(m.yasMetni?.(3 * 1440)).toBe('3 gun')
  })

  it('ESKİ DOSYA: durum dosyası VAR ama 3 günlük → gün olarak UYARIR, "compact öncesi güncelle" der, BLOKLAMAZ', () => {
    const { transcript, kok } = projeKur([['kol-lane-day-2026-08-28.md', TAM_DURUM]])
    nodeKos(`
      const fs=require('fs'),path=require('path');
      const y=path.join(${JSON.stringify(kok)},'memory','kol-lane-day-2026-08-28.md');
      const t=new Date(Date.now()-3*86400000); fs.utimesSync(y,t,t);
    `)

    const r = kapiKos(transcript)

    expect(r.status, 'eski dosya compact\'ı BLOKLAMAMALI').toBe(0)
    expect(r.stdout, 'hangi dosya ve ne kadar eski yazılmalı').toMatch(/BAYAT[^\n]*3 gun[^\n]*kol-lane-day-2026-08-28\.md/)
    expect(r.stdout).toMatch(/compact ONCESI kol-lane-day-2026-08-28\.md dosyasini guncelle/)
    expect(r.stdout, 'dakika olarak yazılmamalı').not.toMatch(/4320 dakika/)
  })

  it('⭐TÜRKÇE BAŞLIK: `SON GİRDİ` biçimi de TANINIR (sahadaki yanlış alarmın kökü)', () => {
    // Bu kol OLMADAN kapı yeşildi ve sahada günde iki kez yanlış alarm veriyordu.
    // JavaScript'in /i bayrağı noktalı İ'yi i'ye KATLAMAZ; dahası 'İ'.toLowerCase() düz 'i'
    // değil, 'i' + BİRLEŞİK NOKTA (U+0307) verir — küçültmek TEK BAŞINA yetmez.
    const { transcript } = projeKur([['kol-lane-day-2026-08-28.md', TAM_DURUM_TR]])

    const r = kapiKos(transcript)

    expect(r.status).toBe(0)
    expect(r.stdout, `Türkçe başlıklı dosya EKSİK sanıldı; stdout=${r.stdout}`).not.toMatch(/EKSIK ALAN/)
    expect(r.stdout).toMatch(/TEMIZ/)
  })

  it('⭐AYIRT EDİCİ ÇİFT: Türkçe dosyadan bir alan GERÇEKTEN silinirse UYARIR', () => {
    // URUN'un istediği kol: "dolu dosyada yeşil, gerçekten silinmiş örnekte kırmızı" —
    // yoksa kapı doluyla boşu AYIRT ETMİYOR demektir. Yukarıdaki kol tek başına yetmez:
    // her hâlde yeşil veren bir kapı da o kolu geçer.
    const eksik = TAM_DURUM_TR.replace(/## VERİLEN SÖZLER\nrapor\n/, '')
    expect(eksik, 'fikstür değişmedi — sabotaj hiçbir şey yapmadı').not.toBe(TAM_DURUM_TR)
    const { transcript } = projeKur([['kol-lane-day-2026-08-28.md', eksik]])

    const r = kapiKos(transcript)

    expect(r.status, 'eksiklik BLOKLAMAMALI').toBe(0)
    expect(r.stdout).toMatch(/EKSIK ALAN/)
    expect(r.stdout).toMatch(/verilen sozler/i)
  })

  it('KATLAMA: Türkçe harfler ASCII\'ye iner ve kapı ile test AYNI işlevi kullanır', () => {
    const kapi = require_(KAPI) as { asciiKatla?: (s: string) => string }
    expect(
      typeof kapi.asciiKatla,
      'asciiKatla DIŞA AÇILMALI: test kendi katlamasını yazarsa iki ölçüt ayrışır ve biri bayatlar',
    ).toBe('function')
    const katla = kapi.asciiKatla as (s: string) => string
    expect(katla('SON GİRDİ')).toBe('son girdi')
    expect(katla('VERİLEN SÖZLER')).toBe('verilen sozler')
    expect(katla('AÇIK KUYRUK')).toBe('acik kuyruk')
    expect(katla('bana ulaşan son girdin')).toBe('bana ulasan son girdin')
    // Noktasız ı ayrıştırılamaz (NFD onu bölmez), bu yüzden elle eşlenmek ZORUNDA.
    expect(katla('KIRMIZI ışık')).toBe('kirmizi isik')
    // ⚠Birleşik nokta gerçekten atılıyor mu? Küçültmenin ürettiği ara biçim doğrudan sınanır.
    expect('SON GİRDİ'.toLowerCase()).not.toBe('son girdi')
  })

  it('AYIRT EDİCİLİK: ders dosyası durum dosyası sanılmaz (ilk uygulama burada yanlış alarm verdi)', () => {
    // Ders dosyası DAHA TAZE olacak: yalnız "en taze mtime" ölçen bir kapı onu seçer ve
    // "dört alan eksik" diye YANLIŞ ALARM verir. Doğru davranış: ad kalıbı durum dosyasını seçer.
    const ders = `---\nname: dizin-olcum-dersleri\nmetadata:\n  originSessionId: ${SID}\n---\n\n## Ders\nolcum yap\n`
    const { transcript, kok } = projeKur([
      ['kol-lane-day-2026-08-28.md', TAM_DURUM],
      ['dizin-olcum-dersleri.md', ders],
    ])
    // Ders dosyasının mtime'ını GELECEĞE al: "en taze" ölçütü onu seçmek zorunda kalsın.
    nodeKos(`
      const fs=require('fs'),path=require('path');
      const y=path.join(${JSON.stringify(kok)},'memory','dizin-olcum-dersleri.md');
      const t=new Date(Date.now()+600000); fs.utimesSync(y,t,t);
    `)

    const r = kapiKos(transcript)

    expect(r.status).toBe(0)
    expect(r.stdout, 'kapı DERS dosyasını ölçtü — ad kalıbı katmanı çalışmıyor').not.toMatch(/dizin-olcum-dersleri/)
    expect(r.stdout).toMatch(/kol-lane-day-2026-08-28\.md/)
  })

  it('MODÜL: require edilince kapı KOŞMAZ (session-board.cjs onu modül olarak çağırıyor)', () => {
    // Kanca require anında stdin okuyup process.exit çağırırsa ÇAĞIRANIN oturumunu öldürür.
    const cikti = nodeKos(`
      const m = require(${JSON.stringify(KAPI)});
      process.stdout.write('KOSMADI:' + Object.keys(m).sort().join(','));
    `)

    expect(cikti).toMatch(/^KOSMADI:/)
    expect(cikti, 'session-board.cjs bu iki yüzeyi çağırıyor').toMatch(/durumDosyasiBul/)
    expect(cikti).toMatch(/sonBlok/)
  })

  it('VALF: VENTHUB_PRECOMPACT_KAPALI=1 bloğu atlar (kilitlenme kaçışı ölçülebilir olmalı)', () => {
    const { transcript } = projeKur([['baskasinin-dosyasi.md', 'alakasiz\n']])

    const r = kapiKos(transcript, SID, { VENTHUB_PRECOMPACT_KAPALI: '1' })

    expect(r.status).toBe(0)
    expect(r.stdout).toMatch(/ATLANDI/)
  })

  it('EŞİK SAYIYLA YAZILI: bayatlık ve MEMORY.md eşikleri kodda sabit olarak durur', () => {
    // OPS hükmü: "bayatlık eşiği cetvelde SAYIYLA yazılı olacak". Sayı sihirli kalırsa
    // sonraki değiştiren neyi neden değiştirdiğini bilemez.
    const m = require_(KAPI) as { BAYAT_ESIK_DK?: number; MEMORY_ESIK_BAYT?: number }
    expect(typeof m.BAYAT_ESIK_DK, 'eşik export edilmeli — cetvel ile kod aynı sayıyı göstermeli').toBe('number')
    expect(m.BAYAT_ESIK_DK).toBe(60)
    // REC-433 1.9: gerçek kırpma sınırı 200 satır YA DA ~25.000 bayt (eski 16384 yanlış ölçümdü).
    expect(m.MEMORY_ESIK_BAYT).toBe(25000)
  })
})

/**
 * INV-COMPACT-2 · Özet yönergesi (ARC-69, karar 321): otomatik compact uyarısız gelir; kapı durum dosyasının
 * SON bloğunu "özete AYNEN taşı" yönergesiyle stdout'a da yazar (PreCompact stdout'u özet talimatı olarak işlenir,
 * 10-08 denemesinde kancanın cümlesi özete aynen geçti). Bayatsa (30 dk) dönüşte ilk işin son konuşma dökümünü
 * okumak olduğunu söyler. Yönerge uzunluğu sınırlıdır (SessionStart 4500 karakterde bloğu ortadan kesiyordu).
 */
describe('INV-COMPACT-2 — özet yönergesi', () => {
  const ESKI_BLOK = '## ESKI GUN\n**SON GIRDI:** ESKI-BLOK-ISARETI eski gunun isi\n'
  const YENI_BLOK = '## YENI GUN\n**SON GIRDI:** YENI-BLOK-ISARETI son is\n**ACIK KUYRUK:** iki kalem\n**VERILEN SOZLER:** rapor\n**BEKLEYEN KARARLAR:** yok\n'
  const front = `---\nname: kol-lane-day\nmetadata:\n  originSessionId: ${SID}\n---\n\n`

  const yaslandir = (kok: string, ad: string, dakika: number) =>
    nodeKos(`
      const fs=require('fs'),path=require('path');
      const y=path.join(${JSON.stringify(kok)},'memory',${JSON.stringify(ad)});
      const t=new Date(Date.now()-${dakika}*60000); fs.utimesSync(y,t,t);
    `)

  it('SON BLOK AYNEN yazılır: yönerge işareti ve sınırlayıcı satırlar var, eski blok yok', () => {
    const { transcript } = projeKur([['kol-lane-day-2026-10-10.md', front + ESKI_BLOK + '\n' + YENI_BLOK]])

    const r = kapiKos(transcript)

    expect(r.status, 'yönerge compact\'ı BLOKLAMAMALI').toBe(0)
    expect(r.stdout).toMatch(/OZET YONERGESI[^\n]*kol-lane-day-2026-10-10\.md[^\n]*SON blogudur/)
    expect(r.stdout).toContain('AYNEN tasi')
    const bas = r.stdout.indexOf('<<<DURUM-DOSYASI-SON-BLOK')
    const son = r.stdout.indexOf('DURUM-DOSYASI-SON-BLOK>>>')
    expect(bas, 'açılış sınırlayıcısı yok').toBeGreaterThanOrEqual(0)
    expect(son, 'kapanış sınırlayıcısı yok').toBeGreaterThan(bas)
    const blok = r.stdout.slice(bas, son)
    expect(blok, 'son blok içeriği yok').toContain('YENI-BLOK-ISARETI')
    expect(blok, 'ESKİ blok özete taşınıyor (yalnız SON blok olmalı)').not.toContain('ESKI-BLOK-ISARETI')
  })

  it('TAZE dosyada bayat notu YOK; 30 dakikadan eskide VAR ve son-konusma dökümünü gösterir', () => {
    const { transcript, kok } = projeKur([['kol-lane-day-2026-10-10.md', front + YENI_BLOK]])
    const taze = kapiKos(transcript)
    expect(taze.stdout, 'taze dosyada bayat notu çıktı').not.toContain('DURUM DOSYASI BAYAT')

    yaslandir(kok, 'kol-lane-day-2026-10-10.md', 45)
    const bayat = kapiKos(transcript)
    expect(bayat.status).toBe(0)
    expect(bayat.stdout, '45 dk eski dosyada bayat notu yok').toContain('DURUM DOSYASI BAYAT')
    expect(bayat.stdout, 'son konuşma dökümünün adı yok').toContain(`son-konusma-${SID}.md`)
    expect(bayat.stdout, 'ilk iş yönergesi yok').toMatch(/ILK IS/)
  })

  it('UZUN BLOK kırpılır: başı ve sonu korunur, kırpma söylenir, yönerge sınırı aşılmaz', () => {
    // sonBlok en çok 60 satır verir (var olan davranış): başlık + 1 + 55 + 1 = 58 satır, hepsi içeride.
    const uzunGovde = Array.from({ length: 55 }, (_, i) => `satir-${i} ${'x'.repeat(180)}`).join('\n')
    const uzun = '## UZUN\n**SON GIRDI:** BAS-ISARETI\n' + uzunGovde + '\n**VERILEN SOZLER:** SON-ISARETI\n'
    const { transcript } = projeKur([['kol-lane-day-2026-10-10.md', front + uzun]])

    const r = kapiKos(transcript)

    const bas = r.stdout.indexOf('<<<DURUM-DOSYASI-SON-BLOK')
    const son = r.stdout.indexOf('DURUM-DOSYASI-SON-BLOK>>>')
    const blok = r.stdout.slice(bas, son)
    expect(blok).toContain('BAS-ISARETI')
    expect(blok, 'kırpma blok sonunu yutmuş').toContain('SON-ISARETI')
    expect(blok, 'kırpma söylenmiyor').toMatch(/karakter kirpildi/)
    const m = require_(KAPI) as { YONERGE_MAX_KARAKTER?: number }
    expect(typeof m.YONERGE_MAX_KARAKTER).toBe('number')
    // 2800 üst sınır + sınırlayıcılar + kırpma notu için pay.
    expect(blok.length, 'yönerge bloğu sınırı aştı').toBeLessThan((m.YONERGE_MAX_KARAKTER ?? 0) + 250)
  })

  it('YÖNERGE eşiği kodda sayıyla durur ve uyarı eşiğinden (60) AYRIDIR', () => {
    const m = require_(KAPI) as { YONERGE_BAYAT_DK?: number; BAYAT_ESIK_DK?: number }
    expect(m.YONERGE_BAYAT_DK).toBe(30)
    expect(m.BAYAT_ESIK_DK, 'uyarı eşiği değişti: ölçüm 2026-08-28 60 dk der').toBe(60)
  })

  it('TEMİZ kapı satırı korunur: yönerge eklenince uyarı simgesi ⚠ çıkmaz', () => {
    const { transcript } = projeKur([['kol-lane-day-2026-10-10.md', TAM_DURUM]])

    const r = kapiKos(transcript)

    expect(r.stdout).toMatch(/TEMIZ/)
    expect(r.stdout, 'yönerge her koşumda öten uyarı satırı üretmemeli').not.toMatch(/⚠/)
  })
})
