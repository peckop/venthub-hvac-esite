import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

import { BETIK, commitle, geciciDizin, geciciTemizle, git, gitCikti, GIZLI_AD, GIZLI_ADRES, GIZLI_BIN, GIZLI_EPOSTA, GIZLI_FIYAT, GIZLI_SON4, KANCA, kapi, kapiyiKos, KOK, sahteDepo, temizOrtam, yaz } from './depo-dokum-kapisi.yardimci'

/**
 * INV-DEPO-DOKUM-1 · UÇTAN UCA kollar (yavaş: her kol sahte git deposu kurar ve CLI/kanca süreci başlatır).
 * Hızlı birim kolları depo-dokum-kapisi.test.ts içindedir; ortak yardımcılar depo-dokum-kapisi.yardimci.ts.
 * Kapsam: CLI çıkış kodları ve çıktı (değer basmaz), YENİ NESNELER (sonradan silinen dosya, PR ara commit'i,
 * pre-push stdin'i, tavan), pre-push kancası (gerçek sh), gerçek ağaç taraması. Başlık beyanı (TETİK/YER)
 * ve dürüst sınır: depo-dokum-kapisi.test.ts başlığına bakın; bu dosya aynı sözleşmeyi paylaşır.
 */

afterAll(geciciTemizle)

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · uçtan uca: sahte git deposunda CLI (DEĞER BASMAZ)', () => {
  it('TEMİZ depo: çıkış 0, ihlal yok, yalnız CREATE TABLE içeren migration geçer', { timeout: 60_000 }, () => {
    const d = sahteDepo({
      'README.md': '# proje',
      'package.json': '{"name":"x"}',
      'veri/ornek.json': JSON.stringify({ a: 1, customer_email: '' }),
      'supabase/migrations/20260101000000_siparis.sql':
        'create table public.siparisler (id uuid primary key, customer_email text, customer_phone text, customer_name text, billing_address jsonb, shipping_address jsonb);\n',
    })
    const r = kapiyiKos(d)
    expect(r.kod, r.cikti).toBe(0)
    expect(r.cikti).toMatch(/ihlal 0/)
    expect(r.cikti).not.toContain('IHLAL')
  })

  it('R1 KIRMIZI: çıkış 1, DOSYA ADI + KURAL ADI + ALAN ADI basılır, değer BASILMAZ', { timeout: 60_000 }, () => {
    const d = sahteDepo({
      'veri/siparisler.json': JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA, customer_name: GIZLI_AD, billing_address: { fullAddress: GIZLI_ADRES } }]),
    })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/siparisler.json')
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).toContain('customer_email')
    for (const deger of [GIZLI_EPOSTA, GIZLI_AD, GIZLI_ADRES, 'gizli.kisi', '7f3a']) expect(r.cikti).not.toContain(deger)
  })

  it("R2 KIRMIZI: INSERT'li SQL; değer basılmaz", { timeout: 60_000 }, () => {
    const d = sahteDepo({
      'seed/dokum.sql': `INSERT INTO public.siparisler (id, customer_email) VALUES (1, '${GIZLI_EPOSTA}');\n`,
    })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('seed/dokum.sql')
    expect(r.cikti).toContain('sql-veri-ifadesi-kisisel-alan')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('R3 KIRMIZI: fiyat dökümü; fiyat değeri basılmaz', { timeout: 60_000 }, () => {
    const d = sahteDepo({
      'veri/urunler.json': JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ id: `p${i}`, sku: `S${i}`, price: Number(GIZLI_FIYAT) + i }))),
    })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/urunler.json')
    expect(r.cikti).toContain('fiyat-dokumu')
    expect(r.cikti).not.toContain(GIZLI_FIYAT)
  })

  it('R4 KIRMIZI: yol kuralı içerikten bağımsız (boş dosya bile kırmızı)', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'docs/archive/db-backup-2026/notlar.txt': 'hiçbir şey', 'x/yedek.sql.gz': 'x' })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('docs/archive/db-backup-2026/notlar.txt')
    expect(r.cikti).toContain('x/yedek.sql.gz')
    expect(r.cikti).toContain('dokum-yolu')
  })

  it('R5 KIRMIZI: ödeme parçası; BIN ve son dört basılmaz', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/yanit.json': JSON.stringify({ binNumber: GIZLI_BIN, lastFourDigits: GIZLI_SON4 }) })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('odeme-parcasi')
    expect(r.cikti).not.toContain(GIZLI_BIN)
    expect(r.cikti).not.toContain(GIZLI_SON4)
  })

  it('başlıksız CSV: ölçülemedi → çıkış 2 (ihlal DEĞİL, yeşil de DEĞİL), değer basılmaz', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/d.csv': `${GIZLI_EPOSTA},Ad,5\nb@ornek.test,Ad2,6\n` })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('OLCULEMEDI')
    expect(r.cikti).toContain('veri/d.csv')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('ihlal + ölçülemedi birlikte: ihlal baskın (çıkış 1), ikisi de listelenir', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/d.csv': 'a@ornek.test,Ad\n', 'veri/s.json': JSON.stringify({ customer_email: 'x' }) })
    const r = kapiyiKos(d)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('IHLAL')
    expect(r.cikti).toContain('OLCULEMEDI')
  })

  it('GitHub Actions kipinde ek açıklama biçimi: dosya + kural, yine değer yok', { timeout: 60_000 }, () => {
    const d = sahteDepo({ 'veri/s.json': JSON.stringify([{ customer_email: GIZLI_EPOSTA }]) })
    const r = kapiyiKos(d, [], { GITHUB_ACTIONS: 'true' })
    expect(r.kod).toBe(1)
    expect(r.cikti).toMatch(/::error file=veri\/s\.json,title=Depo d/)
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('ÇIKIŞ 2: git deposu olmayan dizin (ölçülemedi) — yeşil DEĞİL', { timeout: 60_000 }, () => {
    const d = geciciDizin('depo-dokum-depo-degil-')
    const r = kapiyiKos(d)
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('Çalıştırma hatası')
  })

  it('ÇIKIŞ 2: olmayan dizin, bilinmeyen argüman, eksik --kok/--yeni-nesneler/--haric değeri, --haric tek başına', { timeout: 60_000 }, () => {
    expect(kapiyiKos(path.join(os.tmpdir(), 'depo-dokum-yok-', String(process.pid))).kod).toBe(2)
    const kos = (...args: string[]) => spawnSync(process.execPath, [BETIK, ...args], { env: temizOrtam(), encoding: 'utf8', cwd: KOK }).status
    expect(kos('--bilinmeyen')).toBe(2)
    expect(kos('--kok')).toBe(2)
    expect(kos('--yeni-nesneler')).toBe(2)
    expect(kos('--haric')).toBe(2)
    expect(kos('--haric', 'HEAD')).toBe(2)
  })

  it('ÇIKIŞ 2: boş evren (hiç izlenen dosya yok) yeşil vermez', { timeout: 60_000 }, () => {
    const d = geciciDizin('depo-dokum-bos-')
    git(d, 'init', '-q')
    const r = kapiyiKos(d)
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('boş evren')
  })

  it('izlenmeyen (.gitignore ile dışlanmış) dosya taranmaz: kapı İZLENEN ağaca bakar', { timeout: 60_000 }, () => {
    const d = sahteDepo({
      '.gitignore': 'yerel/\n',
      'README.md': 'x',
      'yerel/siparisler.json': JSON.stringify([{ customer_email: GIZLI_EPOSTA }]),
    })
    const r = kapiyiKos(d)
    expect(r.kod, r.cikti).toBe(0)
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · YENİ NESNELER: sonradan silinen dosya, PR ara commit\'i, pre-push (bulgu 1)', () => {
  /** base commit → dal: dökümü ekle → dökümü SİL. Uçtaki ağaç TEMİZ; ara commit kirli. */
  function silinmisDokumluDepo() {
    const d = geciciDizin('depo-dokum-nesne-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    yaz(d, 'veri/siparisler.json', JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA }]))
    const dokumlu = commitle(d, 'dokum eklendi')
    fs.rmSync(path.join(d, 'veri/siparisler.json'))
    const uc = commitle(d, 'dokum silindi')
    return { d, taban, dokumlu, uc }
  }

  it('AĞAÇ taraması TEMİZ (döküm uçta silinmiş), ama --yeni-nesneler KIRMIZI: sonradan silinen dosya yakalanır', { timeout: 90_000 }, () => {
    const { d, taban, uc } = silinmisDokumluDepo()
    expect(kapiyiKos(d).kod).toBe(0)
    const r = kapiyiKos(d, ['--yeni-nesneler', uc, '--haric', taban])
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('veri/siparisler.json')
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('--yeni-nesneler: yeni nesne yoksa (uç = hariç) çıkış 0', { timeout: 90_000 }, () => {
    const { d, taban } = silinmisDokumluDepo()
    const r = kapiyiKos(d, ['--yeni-nesneler', taban, '--haric', taban])
    expect(r.kod, r.cikti).toBe(0)
    expect(r.cikti).toMatch(/0 nesne/)
  })

  it('--yeni-nesneler: yol kuralı (R4) sonradan silinmiş .zip için de çalışır', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-nesne-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    yaz(d, 'yedek/arsiv.zip', 'x')
    commitle(d, 'zip eklendi')
    fs.rmSync(path.join(d, 'yedek/arsiv.zip'))
    const uc = commitle(d, 'zip silindi')
    const r = kapiyiKos(d, ['--yeni-nesneler', uc, '--haric', taban])
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('yedek/arsiv.zip')
    expect(r.cikti).toContain('dokum-yolu')
  })

  it('--yeni-nesneler: ölçülemeyen blob (başlıksız CSV) ölçülemedi → çıkış 2', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-nesne-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    yaz(d, 'veri/d.csv', 'a@ornek.test,Ad\n')
    const uc = commitle(d, 'csv')
    const r = kapiyiKos(d, ['--yeni-nesneler', uc, '--haric', taban])
    expect(r.kod).toBe(2)
    expect(r.cikti).toContain('OLCULEMEDI')
  })

  // BİLİNÇLİ DEĞİŞİKLİK (ALT-39 2. tur, Y1): önceki test "nesne/okuma tavanı aşılırsa FIRLATIR" diyordu (taramanın TAMAMI iptal). Artık sığan
  // taranır, sığmayan "ölçülemedi" listelenir: çıkış 2 korunur (ölçemeyen kapı yeşil vermez) ama sığana bakılır (önüne çöp yığıp dökümü gizlemek olmaz).
  it('nesne tavanı aşılırsa TÜM TARAMA İPTAL EDİLMEZ (Y1): sığan nesneler taranır (ihlal bulunur), kalanı "ölçülemedi" diye listelenir', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-tavan-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    for (let i = 0; i < 12; i++) yaz(d, `cop/c${i}.txt`, `cop ${i}`)
    commitle(d, 'cop yigini') // eski commit: nesneleri tavanın ÖTESİNE düşer
    // `rev-list --objects` commit'leri ÖNCE, sonra ağaç/blob'ları ağaç sırasıyla (alfabetik) basar: dökümün dizini `cop`tan ÖNCE sıralanır, tavana sığar.
    yaz(d, 'a-veri/siparisler.json', JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA }]))
    const uc = commitle(d, 'dokum (tavana sığan nesneler)')
    const s = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban], nesneTavani: 8 })
    expect(s.ihlaller.map((k) => `${k.kural} ${k.dosya}`)).toEqual(['R1 a-veri/siparisler.json'])
    const tavan = s.olculemedi.filter((o) => /tavanı aştı/.test(o.ayrinti))
    expect(tavan.length).toBe(1)
    expect(tavan[0].ayrinti).toMatch(/TARANAMADI/)
    expect(JSON.stringify(s)).not.toContain('gizli.kisi')
  })

  it('nesne tavanı yeterliyse "tavan" kaydı YOK (sınır değeri: tam sığan)', { timeout: 90_000 }, () => {
    const { d, taban, uc } = silinmisDokumluDepo()
    const hepsi = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban] })
    expect(hepsi.olculemedi).toEqual([])
    const sayi = hepsi.taranan.dosya
    expect(kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban], nesneTavani: sayi }).olculemedi).toEqual([])
    expect(kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban], nesneTavani: sayi - 1 }).olculemedi.length).toBe(1)
  })

  it('okuma tavanı aşılırsa SIĞAN blob taranır, sığmayan adıyla "ölçülemedi" listelenir (Y1)', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-tavan-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    const kucukDokum = JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA }])
    yaz(d, 'veri/a.json', kucukDokum) // alfabetik önce: tavana sığar
    yaz(d, 'veri/b.json', JSON.stringify(Array.from({ length: 200 }, (_, i) => ({ sira: i, not: 'masum metin' }))))
    const uc = commitle(d, 'iki veri dosyasi')
    const s = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban], okumaTavani: kucukDokum.length + 50 })
    expect(s.ihlaller.map((k) => `${k.kural} ${k.dosya}`)).toEqual(['R1 veri/a.json'])
    expect(s.olculemedi.map((o) => o.dosya)).toEqual(['veri/b.json'])
    expect(s.olculemedi[0].ayrinti).toMatch(/okuma tavanı aşıldı/)
    // tavan hiç sığmazsa: ihlal YOK ama ölçülemedi VAR (çıkış 2 sınıfı); yeterliyse ikisi de taranır
    const hicbiri = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban], okumaTavani: 1 })
    expect(hicbiri.ihlaller).toEqual([])
    expect(hicbiri.olculemedi.length).toBeGreaterThanOrEqual(2)
    const hepsi = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban] })
    expect(hepsi.olculemedi).toEqual([])
    expect(hepsi.ihlaller.length).toBe(1)
  })

  // ── D2: aynı içerik, birden çok yol ─────────────────────────────────────────────────────────────
  it('D2: aynı içerik uzantısız VE veri uzantılı yolla itilirse HER yolla ölçülür (rev-list tek yol basar; içerik taraması basılan yola bağlı olmaz)', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-yol-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    const icerik = JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA }])
    yaz(d, 'a-ham', icerik) // alfabetik ÖNCE: `rev-list --objects` bu yolu basar
    yaz(d, 'z-veri.json', icerik)
    const uc = commitle(d, 'ayni icerik iki yol')
    // kanıt: rev-list tek yol basıyor (içerik taraması tek başına buna bağlı olsaydı kaçardı)
    const satirlar = gitCikti(d, 'rev-list', '--objects', uc, '--not', taban).split('\n')
    expect(satirlar.filter((s) => / (a-ham|z-veri\.json)$/.test(s)).length).toBe(1)
    const s = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban] })
    expect(s.ihlaller.map((k) => `${k.kural} ${k.dosya}`)).toEqual(['R1 z-veri.json'])
    expect(JSON.stringify(s)).not.toContain('gizli.kisi')
  })

  it('D2: iki yol AYRI commit\'lerde gelirse de (önce uzantısız, sonra veri uzantılı) ölçülür', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-yol-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    const icerik = JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA }])
    yaz(d, 'ham.txt', icerik)
    commitle(d, 'uzantisiz')
    yaz(d, 'veri.json', icerik)
    const uc = commitle(d, 'veri uzantili')
    const s = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban] })
    expect(s.ihlaller.map((k) => `${k.kural} ${k.dosya}`)).toEqual(['R1 veri.json'])
  })

  it('D2: aynı içeriğin İKİ veri yolu (a.json, b.json) için bulgu HER yol için kaydedilir; yol kuralları da her yola uygulanır (.db ikinci yolda)', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-yol-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    const icerik = JSON.stringify([{ id: 1, customer_email: GIZLI_EPOSTA }])
    yaz(d, 'a.json', icerik)
    yaz(d, 'b.json', icerik)
    const uc = commitle(d, 'iki veri yolu')
    expect(kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban] }).ihlaller.map((k) => k.dosya).sort()).toEqual(['a.json', 'b.json'])
    // R6 uzantı kuralı ikinci yolda: rev-list yalnız ilk (uzantısız) yolu basardı
    const imza = Buffer.concat([Buffer.from('SQLite format 3'), Buffer.from([0]), Buffer.alloc(60)])
    yaz(d, 'a-yedek', imza)
    yaz(d, 'z-yerel.db', imza)
    const uc2 = commitle(d, 'ayni imza iki yol')
    const s2 = kapi.yeniNesneleriTara({ kok: d, ucler: [uc2], haric: [uc] })
    expect(s2.ihlaller.map((k) => k.dosya).sort()).toEqual(['a-yedek', 'z-yerel.db'])
  })

  // ── O1: itilen nesne kipinde SQLite imzası (uzantıdan bağımsız) ─────────────────────────────────
  it('O1: itilen nesne kipinde SQLite imzası UZANTIDAN BAĞIMSIZ okunur: app.db.20261006, x.sqlite.orig, uzantısız, .png → R6; düz metin temiz', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-imza-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    const imza = (i: number) => Buffer.concat([Buffer.from('SQLite format 3'), Buffer.from([0]), Buffer.alloc(80), Buffer.from(String(i))])
    const adlar = ['yedek/app.db.20261006', 'yedek/x.sqlite.orig', 'yedek/dosya', 'yedek/resim.png', 'yedek/veri.dat']
    adlar.forEach((ad, i) => yaz(d, ad, imza(i)))
    yaz(d, 'yedek/duz.orig', 'düz metin, imza yok')
    yaz(d, 'yedek/kisa.bin', 'SQLite') // imza uzunluğundan kısa
    const uc = commitle(d, 'imzali yedekler')
    const s = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban] })
    expect(s.ihlaller.map((k) => k.dosya).sort()).toEqual([...adlar].sort())
    expect(s.ihlaller.every((k) => k.kural === 'R6' && /SQLite imzası/.test(k.ayrinti))).toBe(true)
    // CLI + pre-push stdin: çıkış 1
    const r = kapiyiKos(d, ['--pre-push'], {}, `refs/heads/x ${uc} refs/heads/x ${'0'.repeat(40)}\n`)
    expect(r.kod, r.cikti).toBe(1)
    expect(r.cikti).toContain('ikili-veritabani')
    expect(r.cikti).toContain('yedek/app.db.20261006')
    expect(r.cikti).not.toContain('yedek/duz.orig')
  })

  it('O1: imzalı VERİ uzantılı blob da imza kuralına takılır (data.json içine SQLite); NUL baytlı içerik ayrıca ölçülemedi', { timeout: 90_000 }, () => {
    const d = geciciDizin('depo-dokum-imza-')
    git(d, 'init', '-q')
    yaz(d, 'README.md', '# proje')
    const taban = commitle(d, 'taban')
    yaz(d, 'veri/gizli.json', Buffer.concat([Buffer.from('SQLite format 3'), Buffer.from([0]), Buffer.alloc(80)]))
    const uc = commitle(d, 'imzali json')
    const s = kapi.yeniNesneleriTara({ kok: d, ucler: [uc], haric: [taban] })
    expect(s.ihlaller.map((k) => `${k.kural} ${k.dosya}`)).toEqual(['R6 veri/gizli.json'])
    expect(s.olculemedi.length).toBe(1) // NUL baytı: veri dosyası olarak okunamadı
  })

  it('itilecekUclar: silme satırı (0000…) ve bozuk satır atlanır, tekil uç döner', () => {
    const a = 'a'.repeat(40)
    const b = 'b'.repeat(40)
    const stdin = [`refs/heads/x ${a} refs/heads/x ${'0'.repeat(40)}`, `refs/heads/y ${a} refs/heads/y ${b}`, `(delete) ${'0'.repeat(40)} refs/heads/z ${b}`, 'bozuk', ''].join('\n')
    expect(kapi.itilecekUclar(stdin)).toEqual([a])
    expect(kapi.itilecekUclar('')).toEqual([])
  })

  it('--pre-push: uzak izleme dalında OLMAYAN nesneler taranır (sonradan silinen dahil) → çıkış 1', { timeout: 120_000 }, () => {
    const { d, taban, uc } = silinmisDokumluDepo()
    const uzak = geciciDizin('depo-dokum-uzak-')
    git(uzak, 'init', '-q', '--bare')
    git(d, 'remote', 'add', 'origin', uzak)
    git(d, 'update-ref', 'refs/heads/ana', taban)
    git(d, 'push', '-q', 'origin', 'ana')
    const stdin = `refs/heads/pr ${uc} refs/heads/pr ${'0'.repeat(40)}\n`
    const r = kapiyiKos(d, ['--pre-push'], {}, stdin)
    expect(r.kod, r.cikti).toBe(1)
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  it('--pre-push: nesneler zaten uzakta (remote-tracking) ise yeniden taranmaz → çıkış 0', { timeout: 120_000 }, () => {
    const { d, uc } = silinmisDokumluDepo()
    const uzak = geciciDizin('depo-dokum-uzak-')
    git(uzak, 'init', '-q', '--bare')
    git(d, 'remote', 'add', 'origin', uzak)
    git(d, 'update-ref', 'refs/heads/pr', uc)
    git(d, 'push', '-q', 'origin', 'pr')
    const stdin = `refs/heads/pr ${uc} refs/heads/pr ${'0'.repeat(40)}\n`
    const r = kapiyiKos(d, ['--pre-push'], {}, stdin)
    expect(r.kod, r.cikti).toBe(0)
  })

  it('--pre-push: silme itmesi (yalnız 0000… yerel uç) ve boş girdi → taranacak şey yok, çıkış 0', { timeout: 60_000 }, () => {
    const { d } = silinmisDokumluDepo()
    expect(kapiyiKos(d, ['--pre-push'], {}, `(delete) ${'0'.repeat(40)} refs/heads/x ${'b'.repeat(40)}\n`).kod).toBe(0)
    expect(kapiyiKos(d, ['--pre-push'], {}, '').kod).toBe(0)
  })

  /** GitHub'ın `refs/pull/N/merge` biçimi: HEAD = birleşme commit'i, HEAD^1 = taban, HEAD^2 = PR ucu. */
  function prBirlesmeDeposu() {
    const { d, taban, uc } = silinmisDokumluDepo()
    git(d, 'checkout', '-q', '--detach', taban)
    git(d, 'merge', '-q', '--no-ff', '-m', 'birlesme', uc)
    return d
  }

  it('CI (GitHub Actions pull_request, tam geçmiş, birleşme commit\'i): ara commit\'teki döküm yakalanır → çıkış 1', { timeout: 120_000 }, () => {
    const d = prBirlesmeDeposu()
    const r = kapiyiKos(d, [], { GITHUB_EVENT_NAME: 'pull_request' })
    expect(r.kod, r.cikti).toBe(1)
    expect(r.cikti).toContain('veri/siparisler.json')
    expect(r.cikti).toContain('kisisel-alan-dolu')
    expect(r.cikti).not.toContain('gizli.kisi')
  })

  // BİLİNÇLİ DEĞİŞİKLİK (ALT-39 2. tur, D4): önceki iki test "yalnız pull_request olayında taranır; olay yoksa/push'ta TEMİZ görünür" diyordu.
  // `workflow_dispatch` (elle tetikleme: Checkout merge-ref'e gider) aynı birleşme commit'ini sessizce ATLIYORDU. Artık olaydan bağımsız tarar.
  it.each([
    ['pull_request', 'pull_request'],
    ['workflow_dispatch', 'workflow_dispatch'],
    ['push', 'push'],
    ['olay yok (yerel koşu)', ''],
  ])('D4: ara commit taraması OLAYDAN BAĞIMSIZ — %s → ara commit\'teki döküm yakalanır (çıkış 1)', { timeout: 120_000 }, (_ad, olay) => {
    const d = prBirlesmeDeposu()
    const r = kapiyiKos(d, [], olay === '' ? {} : { GITHUB_EVENT_NAME: olay })
    expect(r.kod, r.cikti).toBe(1)
    expect(r.cikti).toContain('veri/siparisler.json')
    expect(r.cikti).toContain("ağaç + PR ara commit'leri")
    expect(r.cikti).not.toContain('ara commit taraması atlandı')
  })

  it('D4: birleşme commit\'i değil: ara commit taraması atlandığı SÖYLENİR (olaydan bağımsız), çıkış 0', { timeout: 90_000 }, () => {
    const { d } = silinmisDokumluDepo()
    for (const olay of ['pull_request', 'workflow_dispatch', 'push']) {
      const r = kapiyiKos(d, [], { GITHUB_EVENT_NAME: olay })
      expect(r.kod, `${olay}: ${r.cikti}`).toBe(0)
      expect(r.cikti, olay).toContain('ara commit taraması atlandı')
      expect(r.cikti, olay).toContain("HEAD birleşme commit'i değil")
    }
  })

  it('D4: Actions\'ta pull_request/workflow_dispatch olayında atlama GÖRÜNÜR bir ek açıklamayla (::warning) bildirilir; push olayında yalnız not', { timeout: 90_000 }, () => {
    const { d } = silinmisDokumluDepo()
    for (const olay of ['pull_request', 'workflow_dispatch']) {
      const r = kapiyiKos(d, [], { GITHUB_EVENT_NAME: olay, GITHUB_ACTIONS: 'true' })
      expect(r.cikti, olay).toMatch(/::warning title=Depo d[^:]*::Ara commit taraması atlandı/)
    }
    const push = kapiyiKos(d, [], { GITHUB_EVENT_NAME: 'push', GITHUB_ACTIONS: 'true' })
    expect(push.cikti).not.toContain('::warning')
    expect(push.cikti).toContain('ara commit taraması atlandı')
  })

  it('D4: SIĞ depoda (shallow) birleşme commit\'i olsa bile atlama söylenir ve nedeni "sığ" diye yazılır', { timeout: 120_000 }, () => {
    const d = prBirlesmeDeposu()
    const sig = geciciDizin('depo-dokum-sig-')
    const k = spawnSync('git', ['clone', '-q', '--depth', '1', pathToFileURL(d).href, sig], { env: temizOrtam(), encoding: 'utf8' })
    expect(k.status, k.stderr).toBe(0)
    const r = kapiyiKos(sig, [], { GITHUB_EVENT_NAME: 'pull_request' })
    expect(r.kod, r.cikti).toBe(0)
    expect(r.cikti).toContain('ara commit taraması atlandı')
    expect(r.cikti).toContain('depo sığ')
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · pre-push kancası (bulgu 1)', () => {
  const kanca = () => fs.readFileSync(KANCA, 'utf8')

  it('kanca döküm kapısını --pre-push ile çağırıyor; çıkış 1 VE çıkış 2 push\'u ENGELLİYOR (Y1); kaçış değişkeni belgeli', () => {
    const k = kanca()
    expect(k.startsWith('#!/bin/sh')).toBe(true)
    expect(k).toMatch(/scripts\/security\/depo-dokum-kapisi\.cjs/)
    expect(k).toMatch(/--pre-push/)
    expect(k).toMatch(/exit 1/)
    expect(k).toMatch(/OLCULEMEDI/)
    expect(k).toMatch(/VH_DOKUM_OLCULEMEDI_IZIN/) // bilinçli kaçış kancanın kendi gövdesinde
    expect(k).toMatch(/--no-verify/) // dürüst sınır kancanın kendi başlığında yazılı
    expect(k).toMatch(/scripts\/hijyen\/kapali-dal-push\.cjs/) // mevcut kapı korunuyor
    // Y1: "uyarıp geçir" eski cümlesi kancada KALMADI (ölçülemedi artık engeller)
    expect(k).not.toMatch(/push'a IZIN VERILIYOR ama dokum kontrolu YAPILMADI/)
  })

  /** Kancayı SAHTE depoda gerçek `sh` ile koşturur; kapı betiği yerine koşulan taslak çıkış kodu verir. */
  function kancayiKos(kapiCikis: number | null, girdi = 'refs/heads/x aaaa refs/heads/x bbbb\n', ek: Record<string, string> = {}) {
    const d = geciciDizin('depo-dokum-kanca-')
    git(d, 'init', '-q')
    yaz(d, '.githooks/pre-push', kanca())
    yaz(d, 'scripts/hijyen/kapali-dal-push.cjs', `require('node:fs').writeFileSync(${JSON.stringify(path.join(d, 'kapali-kosti.txt'))}, 'x'); process.stdin.resume(); process.stdin.on('end', () => process.exit(0))\n`)
    if (kapiCikis !== null) {
      yaz(d, 'scripts/security/depo-dokum-kapisi.cjs', `require('node:fs').writeFileSync(${JSON.stringify(path.join(d, 'dokum-kosti.txt'))}, 'x'); process.stdin.resume(); process.stdin.on('end', () => process.exit(${kapiCikis}))\n`)
    }
    const r = spawnSync('sh', ['.githooks/pre-push'], { cwd: d, env: temizOrtam(ek), encoding: 'utf8', input: girdi })
    return {
      kod: r.status,
      cikti: `${r.stdout ?? ''}${r.stderr ?? ''}`,
      dokumKosti: fs.existsSync(path.join(d, 'dokum-kosti.txt')),
      kapaliKosti: fs.existsSync(path.join(d, 'kapali-kosti.txt')),
    }
  }

  it('kapı çıkış 0 → kanca 0 (kapalı-dal kapısı da koşar)', { timeout: 60_000 }, () => {
    const r = kancayiKos(0)
    expect(r.kod).toBe(0)
    expect(r.dokumKosti).toBe(true)
    expect(r.kapaliKosti).toBe(true)
  })

  it('kapı çıkış 1 → kanca 1 ve "PUSH ENGELLENDI" basar; kapalı-dal kapısına GEÇİLMEZ', { timeout: 60_000 }, () => {
    const r = kancayiKos(1)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('PUSH ENGELLENDI')
    expect(r.kapaliKosti).toBe(false)
  })

  it('Y1: kapı çıkış 2 (ölçülemedi) → kanca 1 ve "PUSH ENGELLENDI"; nedeni ve bilinçli kaçışı söyler', { timeout: 60_000 }, () => {
    // BİLİNÇLİ DEĞİŞİKLİK (Y1): önceki sürümde bu test "çıkış 2 → kanca 0 ama YÜKSEK SESLE uyarır" diyordu. Ölçemeyen kapı yeşil vermez;
    // ağa çıkış geri alınamaz. Eski davranış (uyar ve geçir) ölçüm dışı bir push'u sessizce serbest bırakıyordu.
    const r = kancayiKos(2)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('PUSH ENGELLENDI')
    expect(r.cikti).toContain('OLCULEMEDI')
    expect(r.cikti).toContain('VH_DOKUM_OLCULEMEDI_IZIN=1')
    expect(r.kapaliKosti).toBe(false)
  })

  it('Y1: VH_DOKUM_OLCULEMEDI_IZIN=1 ile çıkış 2 GEÇER (kanca 0) ama YÜKSEK SESLE uyarır; kapalı-dal kapısı yine koşar', { timeout: 60_000 }, () => {
    const r = kancayiKos(2, undefined, { VH_DOKUM_OLCULEMEDI_IZIN: '1' })
    expect(r.kod).toBe(0)
    expect(r.cikti).toContain('UYARI')
    expect(r.cikti).toContain('OLCULEMEDI')
    expect(r.cikti).not.toContain('PUSH ENGELLENDI')
    expect(r.kapaliKosti).toBe(true)
  })

  it.each(['0', 'true', 'evet', ' 1', '11', ''])('Y1: kaçış değişkeni yalnız TAM "1" ile geçerli (%j geçmez)', (deger) => {
    const r = kancayiKos(2, undefined, { VH_DOKUM_OLCULEMEDI_IZIN: deger })
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('PUSH ENGELLENDI')
  })

  it.each([3, 127, 137])('Y1: kapı beklenmeyen çıkış koduyla (%i: çökme/sinyal) biterse de ENGELLER (yalnız 0 geçer)', (kod) => {
    const r = kancayiKos(kod)
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('PUSH ENGELLENDI')
  })

  it('Y1: kaçış değişkeni İHLALİ (çıkış 1) geçirmez: yalnız "ölçülemedi" için', { timeout: 60_000 }, () => {
    const r = kancayiKos(1, undefined, { VH_DOKUM_OLCULEMEDI_IZIN: '1' })
    expect(r.kod).toBe(1)
    expect(r.cikti).toContain('PUSH ENGELLENDI')
  })

  it('Y1: `node` PATH\'te yoksa kanca SESSİZ geçmez: yüksek sesle uyarır, nedenini ve çözümü söyler, kapıyı koşturmaz (engellemez)', { timeout: 60_000 }, () => {
    const r = kancayiKos(0, undefined, { VH_NODE_YOLU: path.join(os.tmpdir(), 'node-yok-boyle-bir-komut') })
    expect(r.kod).toBe(0)
    expect(r.cikti).toContain('UYARI')
    expect(r.cikti).toContain("node PATH'te yok")
    expect(r.cikti).toContain('YAPILMADI')
    expect(r.cikti).toContain('CI')
    expect(r.dokumKosti).toBe(false)
    expect(r.kapaliKosti).toBe(false)
  })

  it('kapı betiği yoksa kanca geçer (kapalı-dal kapısına düşer)', { timeout: 60_000 }, () => {
    expect(kancayiKos(null).kod).toBe(0)
  })

  it('stdin kapıya ve kapalı-dal kapısına BİR KEZ okunup İKİSİNE de verilir', { timeout: 60_000 }, () => {
    const d = geciciDizin('depo-dokum-kanca-')
    git(d, 'init', '-q')
    yaz(d, '.githooks/pre-push', kanca())
    const kayit = (ad: string) => `require('node:fs').writeFileSync(${JSON.stringify(path.join(d, ad))}, require('node:fs').readFileSync(0, 'utf8'))\n`
    yaz(d, 'scripts/hijyen/kapali-dal-push.cjs', kayit('kapali.txt'))
    yaz(d, 'scripts/security/depo-dokum-kapisi.cjs', kayit('dokum.txt'))
    const girdi = 'refs/heads/x aaaa refs/heads/x bbbb\nrefs/heads/y cccc refs/heads/y dddd\n'
    const r = spawnSync('sh', ['.githooks/pre-push'], { cwd: d, env: temizOrtam(), encoding: 'utf8', input: girdi })
    expect(r.status).toBe(0)
    expect(fs.readFileSync(path.join(d, 'dokum.txt'), 'utf8').trim()).toBe(girdi.trim())
    expect(fs.readFileSync(path.join(d, 'kapali.txt'), 'utf8').trim()).toBe(girdi.trim())
  })
})

// ══════════════════════════════════════════════════════════════════════════════════════════════
describe('INV-DEPO-DOKUM-1 · GERÇEK AĞAÇ taraması', () => {
  it('izlenen ağaç YEŞİL ve evren BOŞ DEĞİL', { timeout: 120_000 }, () => {
    const r = kapiyiKos(KOK)
    expect(r.kod, `kapı kırmızı:\n${r.cikti}`).toBe(0)
    const m = /(\d+) izlenen dosya, (\d+) veri dosyası tarandı/.exec(r.cikti)
    expect(m, 'özet satırı yok').not.toBeNull()
    // Kanarya: boş evren geçerli ölçüm değildir. Gerçek ağaçta binlerce dosya, yüzlerce veri dosyası var.
    expect(Number(m?.[1])).toBeGreaterThan(1000)
    expect(Number(m?.[2])).toBeGreaterThan(200)
  })

  it('gerçek ağaçta döküm yolu kalıplı (R4) izlenen dosya YOK; izin listesindekiler dışında R5/R6 isabeti de yok', { timeout: 120_000 }, () => {
    const izlenen = (spawnSync('git', ['ls-files', '-z'], { cwd: KOK, env: temizOrtam(), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).stdout ?? '')
      .split('\0')
      .filter(Boolean)
    expect(izlenen.filter((y) => kapi.yolIhlali(y).length > 0)).toEqual([])
  })

  // O1 (ALT-39 2. tur): önceki test başlığı "R5/R6 isabeti de yok" diyordu ama yalnız R4'ü ölçüyordu. Bu kol R5/R6'yı GERÇEKTEN ölçer:
  // izinsiz taramada R5/R6 isabetleri TAM izin listesindeki R5/R6 kayıtlarıdır (ne eksik ne fazla; imza UZANTIDAN BAĞIMSIZ okunur).
  it('gerçek ağaçta R5/R6 isabetleri (izinsiz tarama, imza uzantıdan bağımsız) TAM izin listesine eşit: yeni ikili veritabanı yok, yetim izin yok', { timeout: 180_000 }, () => {
    const izlenen = (spawnSync('git', ['ls-files', '-z'], { cwd: KOK, env: temizOrtam(), encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }).stdout ?? '')
      .split('\0')
      .filter(Boolean)
    expect(izlenen.length).toBeGreaterThan(1000)
    const s = kapi.tara({ dosyalar: izlenen, oku: kapi.diskOkuyucu(KOK), izin: [], ikili: kapi.sqliteImzasiMi(KOK) })
    const isabetler = s.ihlaller.filter((k) => k.kural === 'R5' || k.kural === 'R6').map((k) => `${k.kural} ${k.dosya}`)
    const beklenen = kapi.IZIN_LISTESI.filter((e) => e.kural === 'R5' || e.kural === 'R6').map((e) => `${e.kural} ${e.yol}`)
    expect([...new Set(isabetler)].sort()).toEqual([...beklenen].sort())
    // imza kolunun kanıtı: uzantısı .db OLMAYAN en az bir kayıt imzayla bulundu (uzantı süzgeci geri gelirse kırmızı)
    expect(isabetler).toContain('R6 .cc/memory.db.pre_qwen.20260524_1830')
  })
})
