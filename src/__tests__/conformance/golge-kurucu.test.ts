/**
 * INV-GOLGE-1 — gölge veritabanı kurucusunun SÖZLEŞMESİ ölçülür.
 *
 * NİÇİN VAR
 * =========
 * `scripts/db/golge-kur.mjs` envantere "KAL-KAPISIZ" diye girdi ve kapı borcu ADIYLA
 * yazıldı (`docs/audits/arac-envanteri-2026-09-07.md`). Kural 14 borcu sonraki işe
 * bırakmayı yasaklıyor; bu dosya o borcu kapatır.
 *
 * ⭐NE ÖLÇÜLÜR, NE ÖLÇÜLMEZ: burada gölgenin DOĞRU kurulduğu ölçülmez — o ölçüm Docker
 * gerektirir ve betiğin kendi sadakat eşikleri yapar. Burada **sözleşme** ölçülür:
 * yıkıcı komutun yokluğu, akranın korunması, izin verilen ad kümesi, çıkış kodlarının
 * hem yazılmış hem KULLANILMIŞ olması.
 *
 * ⚠YASAKLI DESEN KENDİ YORUMUNDA TRİPLER: bu dosya "şu komut geçmesin" diye ölçüyor ve
 * o komutun adını yorumda anmak zorunda. Bu yüzden ölçüm KOD üzerinde yapılır, yorum
 * satırları atılarak. Aynı tuzağa 2026-09-16'da iki kez düşüldü.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const YOL = resolve(process.cwd(), 'scripts/db/golge-kur.mjs')
const kaynak = (): string => readFileSync(YOL, 'utf8')

/** Yorum satırlarını atar — yasaklı desen ölçümü YALNIZ kodda yapılır. */
const kodu = (): string =>
  kaynak()
    .split('\n')
    .filter((l) => {
      const t = l.trim()
      return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*')
    })
    .join('\n')

describe('INV-GOLGE-1 — gölge kurucusu sözleşmesi', () => {
  it('betik VAR ve okunabilir', () => {
    expect(kaynak().length).toBeGreaterThan(1000)
  })

  it('küme düzeyinde sıfırlayan komut KODDA GEÇMEZ', () => {
    // Niçin: o komut aynı kümedeki AKRANIN veritabanını da siliyor (2026-09-16 olayı).
    //
    // ⭐İKİ BİÇİM ÖLÇÜLÜR — TEK BİÇİM ÖLÇMEK KÖR KAPIDIR. İlk hâlde yalnız kabuk
    // dizgesi aranıyordu; negatif sınamada betiğe aynı komut ARGV DİZİSİ olarak
    // eklendi ve kapı YEŞİL kaldı — yani Node'un gerçekte kullandığı biçimi hiç
    // görmüyordu. Bir kapı, ölçtüğü ihlali üretip KIRMIZI verdirilmeden bitmiş
    // sayılmaz (2026-09-16'da bu dosyada yaşandı).
    const k = kodu()
    const kabukBicimi = /supabase\s+db\s+reset/i
    const argvBicimi = /\[[^\]]*['"`]db['"`][\s,]*['"`]reset['"`]/i
    expect(kabukBicimi.test(k)).toBe(false)
    expect(argvBicimi.test(k)).toBe(false)
  })

  it('var olan veritabanı SESSIZCE ezilmez — ad çakışması ayrı çıkış kodu verir', () => {
    const k = kodu()
    expect(k).toMatch(/pg_database/)
    expect(k).toMatch(/dur\(\s*3\s*,/)
  })

  it('ezme yalnız AÇIK bir bayrakla mümkündür', () => {
    expect(kodu()).toMatch(/bayrak\('yeniden'\)/)
  })

  it('veritabanı adı için izin verilen karakter kümesi DARALTILMIŞ', () => {
    // SQL kimlikleri parametrelenemez; tek güvenli yol allowlist.
    const k = kodu()
    expect(k).toMatch(/\^\[a-z_\]\[a-z0-9_\]\{0,62\}\$/)
    expect(k).toMatch(/process\.exit\(2\)/)
  })

  it('ad sınırı 63 karakteri AŞMAZ (PostgreSQL sessizce kırpar)', () => {
    const m = /\{0,(\d+)\}/.exec(kodu())
    expect(m).not.toBeNull()
    expect(Number(m![1]) + 1).toBeLessThanOrEqual(63)
  })

  it('kendi veritabanını düşüren bayrak VAR (sıfırlama komutunun yerine)', () => {
    expect(kodu()).toMatch(/bayrak\('dusur'\)/)
  })

  it('düşürme kolu küme altyapısı adlarını REDDEDER', () => {
    const k = kodu()
    for (const ad of ['postgres', '_supabase', 'template0', 'template1']) {
      expect(k).toContain(`'${ad}'`)
    }
  })

  it('ÇIKIŞ KODLARI hem başlıkta YAZILI hem kodda KULLANILMIŞ', () => {
    const k = kodu()
    // 0 hazır · 1 sadakat tutmadı · 2 ölçemedi · 3 ad çakıştı
    expect(k).toMatch(/process\.exit\(0\)/)
    expect(k).toMatch(/dur\(\s*1\s*,/)
    expect(k).toMatch(/dur\(\s*2\s*,/)
    expect(k).toMatch(/dur\(\s*3\s*,/)
  })

  it('BOŞ gölgeyi reddeden sadakat eşikleri VAR ve sıfır DEĞİL', () => {
    const k = kodu()
    const m = /const ESIK = \{([^}]+)\}/.exec(k)
    expect(m).not.toBeNull()
    const sayilar = (m![1].match(/\d+/g) ?? []).map(Number)
    expect(sayilar.length).toBeGreaterThanOrEqual(5)
    for (const s of sayilar) expect(s).toBeGreaterThan(0)
  })

  it('TAŞINABİLİR — proje adı KODA gömülü değil, bayrakla verilir', () => {
    const k = kodu()
    expect(k).toMatch(/arg\('konteyner'/)
  })

  it('bağlantı dizesi ya da şifre KODDA GEÇMEZ', () => {
    const k = kodu()
    expect(k).not.toMatch(/postgres(ql)?:\/\/[^'"\s]*:[^'"\s]*@/)
  })

  it('varsayılan ad DAMGALI — sabit ad akranın gölgesini ezer', () => {
    expect(kodu()).toMatch(/golge_\$\{DAMGA\}/)
  })
})
