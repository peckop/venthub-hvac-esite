/**
 * INV-AILE-KATEGORI-1'in DÜZENEĞİNİ korur (REC-290).
 *
 * Kapının kendisi canlı DB ister; bu paket sunucusuz/ağsız koşar. Bu yüzden burada ölçülen
 * şey kapının SONUCU değil, KOŞABİLİRLİĞİ ve KARAR MANTIĞI:
 *   · CI onu gerçekten çağırıyor mu (çağrılmayan kapı, koşmadığı her gün YOK demektir)
 *   · "ölçemedim" ile "ihlal yok" ayrı çıkış kodları mı üretiyor
 *   · betik gerçekten SALT OKUR mu
 *
 * ⭐NİÇİN FİKSTÜRLE: kabul ölçütü "bir aileyi bilerek ayrıştır, kırmızı gör, geri al" diyor.
 * O sabotaj PROD `product_families` tablosuna yazmak demek ve prod yazımı Recep kapısı
 * (kural 13). Kapıyı yazarken kapının koruduğu veriyi bozmak yarıda kalırsa vitrini
 * GERÇEKTEN kırar. Sayıya verilen tepki fikstürle, sorgunun doğru şeyi saydığı canlıda
 * ölçüldü (iki yönlü: ayrışan 0 · örtüşen 442) — ikisi ayrı eksen, ikisi de yapıldı.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

function repoKoku(): string {
  return execFileSync('git', ['rev-parse', '--path-format=absolute', '--show-toplevel'], {
    encoding: 'utf8',
  }).trim()
}
const KOK = repoKoku()
const oku = (p: string): string => fs.readFileSync(path.join(KOK, p), 'utf8')

const BETIK = 'scripts/db/checks/aile-kategori-tutarlilik.mjs'
const WF = '.github/workflows/db-advisor.yml'

/**
 * Satır başı `#` yorumlarını atar. Kardeş kilitte (INV-DUMAN) ödenmiş ders: bu workflow
 * kararlarının gerekçesini yorumda taşıyor ve o yorumlar aranan dizeleri kelimesi kelimesine
 * içeriyor — yorumu saymak, gerçek adım silinse bile yeşil kalan bir kapı üretir.
 */
function yorumsuz(metin: string): string {
  return metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

/** Betiği fikstürle koşar; ÇIKIŞ KODUNU ve çıktıyı döner (metin değil DAVRANIŞ ölçülür). */
function kos(sayimlar: Record<string, unknown>): { kod: number; cikti: string } {
  const dosya = path.join(os.tmpdir(), `aile-kategori-fikstur-${process.pid}-${Math.random().toString(36).slice(2)}.json`)
  fs.writeFileSync(dosya, JSON.stringify(sayimlar), 'utf8')
  try {
    const cikti = execFileSync(process.execPath, [path.join(KOK, BETIK), '--fikstur', dosya], {
      encoding: 'utf8',
      stdio: 'pipe',
    })
    return { kod: 0, cikti }
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string }
    return { kod: err.status ?? 1, cikti: `${err.stdout ?? ''}${err.stderr ?? ''}` }
  } finally {
    fs.rmSync(dosya, { force: true })
  }
}

const TEMIZ = { urun: 442, ailesi_olan: 442, aktif_aile: 47, join_evreni: 442, ihlal: 0 }

describe('INV-AILE-KATEGORI-1: kapı CI\'a bağlı ve ölçemediğinde yeşil dönmüyor', () => {
  it('CI onu GERÇEKTEN çağırır (çağrılmayan kapı = olmayan kapı)', () => {
    const w = yorumsuz(oku(WF))
    expect(
      w.includes(`node ${BETIK}`),
      'db-advisor.yml betiği çağırmıyor — kapı yalnız elle koşar hâle gelmiş'
    ).toBe(true)
    expect(
      /SUPABASE_DB_URL:/.test(w),
      'adım bağlantı sırrını beslemiyor — kapı her koşumda ÖLÇÜLEMEDİ (2) döner'
    ).toBe(true)
    expect(
      /PGSSLROOTCERT=/.test(w),
      'kök sertifika verilmiyor — TLS doğrulaması bağlantıyı öldürür'
    ).toBe(true)
  })

  it('⛔SALT OKUR — betikte yazma fiili YOK', () => {
    // Kapının kendisi veri bozarsa, koruduğu şeyi kendi eliyle kırar.
    const s = oku(BETIK)
    const yazmaFiilleri = /\b(insert\s+into|update\s+\w+\s+set|delete\s+from|drop\s+|alter\s+table|truncate)\b/i
    expect(yazmaFiilleri.test(s), 'betikte yazma fiili bulundu — kapı SALT OKUR olmalı').toBe(false)
  })

  it('DAVRANIŞ: ihlal 0 ve evren dolu → çıkış 0', () => {
    const { kod, cikti } = kos(TEMIZ)
    expect(kod, `beklenen 0, çıktı: ${cikti}`).toBe(0)
    expect(cikti).toContain('YESIL')
  })

  it('⭐SABOTAJ: ihlal varsa çıkış 1 ve satırlar ADIYLA basılır', () => {
    const { kod, cikti } = kos({
      ...TEMIZ,
      ihlal: 11,
      satirlar: [
        {
          sku: 'VRT-1',
          urun: 'VORTICENT A',
          aile: 'VORTICENT ATEX',
          urun_kategori: 'c-aksiyel',
          aile_kategori: 'c-eski',
          urun_alt: 's-aksiyel',
          aile_alt: 's-eski',
        },
      ],
    })
    expect(kod, `ihlal varken kapı KIRMIZI olmadı, çıktı: ${cikti}`).toBe(1)
    expect(cikti, 'ihlal sayısı yazılmamış').toContain('11 URUN')
    expect(cikti, 'satır adıyla basılmamış — "11 ihlal" bir sayı, "hangi ürün" iş emri').toContain(
      'VORTICENT ATEX'
    )
    // Sessiz kesme yasak: basılmayan satır sayısı yazılır.
    expect(cikti, 'kesilen satır sayısı bildirilmemiş').toContain('10 satir daha')
  })

  it('⭐KÖRLÜK SABOTAJI: evren 0 iken "ihlal 0" YEŞİL SAYILMAZ, çıkış 2', () => {
    /**
     * Bu kol kapının en sinsi hâlini ölçer: kolon adı değişse ya da `family_id` boşalsa
     * ihlal de 0 çıkar. O hâl temizlik değil KÖRLÜKTÜR ve 0 ile 2 arasındaki fark tam
     * burada yaşar. Bu ayrım olmasaydı kapı, ölçemediği gün en yüksek sesle "temiz" derdi.
     */
    const { kod, cikti } = kos({ ...TEMIZ, ailesi_olan: 0, join_evreni: 0 })
    expect(kod, `evren 0 iken çıkış ${kod} — 0 ya da 1 dönmek fail-open olurdu`).toBe(2)
    expect(cikti).toContain('KORLUK')
  })

  it('AYIRT EDİCİ: üç hâl ÜÇ FARKLI çıkış kodu üretir (aynı koda düşmüyor)', () => {
    const kodlar = [
      kos(TEMIZ).kod,
      kos({ ...TEMIZ, ihlal: 3 }).kod,
      kos({ ...TEMIZ, join_evreni: 0 }).kod,
    ]
    expect(new Set(kodlar).size, `üç hâl ayrışmıyor: ${kodlar.join(',')}`).toBe(3)
  })
})
