// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-EDGE-SAYFALAMA — Edge fonksiyonlarında SESSİZ 1000 SATIR TAVANI kapısı (REC-183).
 *
 * KAPATILAN SINIF: PostgREST bir sorguya en çok 1000 satır döner ve bunu HATA İLE BİLDİRMEZ.
 * Kusur veri büyüyünce doğar, kod değişmeden; fonksiyon 200 ve "ok" döndüğü için alarm çalmaz.
 *
 * ⚠ÖLÇÜT NİÇİN DAR — dürüstçe: `supabase/functions` altında 42 "sınırsız görünen" sorgu
 * saydım (2026-09-07), ama incelendiğinde neredeyse hepsi `id=eq.<tek satır>` anahtar araması
 * ya da yazma. Yani kaba "select var, limit yok" ölçütü FAZLA sayıyor ve kapıyı yalancı
 * kırmızıya boğardı. Kümeyi ayırt eden ölçüt (anahtarla tek satır mı, küme mi) henüz yazılmadı;
 * bu yüzden kapı ÜÇ KESKİN kolla sınırlı ve kapsam sınırı burada YAZILI:
 *   1. Açık `limit=1000` / `limit(1000)` yasak — elle konmuş tavan, sessiz tavanın kopyası.
 *   2. Onarılan iki yer sayfalamayı KAYBETMEZ (gerileme kilidi).
 *   3. Yardımcı, üç fail-closed fırlatmasını korur (kapının kendisi kapı olarak kalsın).
 * Geri kalan sınıfın taraması ayrı iş; "sınıfı kapattım" demek burada YALAN olurdu.
 */

const KOK = process.cwd()
const FN = path.join(KOK, 'supabase', 'functions')

function yorumsuz(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function tsDosyalari(dizin: string, cikti: string[] = []): string[] {
  let girdiler: fs.Dirent[]
  try {
    girdiler = fs.readdirSync(dizin, { withFileTypes: true })
  } catch {
    return cikti
  }
  for (const g of girdiler) {
    const tam = path.join(dizin, g.name)
    if (g.isDirectory()) {
      if (g.name === '__tests__') continue
      tsDosyalari(tam, cikti)
    } else if (g.name.endsWith('.ts')) {
      cikti.push(tam)
    }
  }
  return cikti
}

const DOSYALAR = tsDosyalari(FN)

describe('INV-EDGE-SAYFALAMA: elle konmuş 1000 tavanı YASAK, onarılan yerler sayfalı KALIR', () => {
  it('EVREN BOŞ DEĞİL (boş evren her zaman yeşildir)', () => {
    expect(DOSYALAR.length, 'supabase/functions altında .ts bulunamadı — kapı hiçbir şey ölçmüyor').toBeGreaterThan(10)
  })

  it('⛔hiçbir Edge fonksiyonunda açık 1000 tavanı yok', () => {
    const bulunan: string[] = []
    for (const f of DOSYALAR) {
      const k = yorumsuz(fs.readFileSync(f, 'utf8'))
      if (/limit=1000\b/.test(k) || /\.limit\(\s*1000\s*\)/.test(k)) bulunan.push(path.relative(KOK, f))
    }
    expect(
      bulunan,
      'elle konmuş 1000 tavanı: PostgREST\'in sessiz tavanının kopyası. 1001. satır hiç görülmez ve ' +
        'fonksiyon yine "ok" döner. Sayfalama için _shared/tum_satirlar.ts kullan.',
    ).toEqual([])
  })

  it('ONARILAN İKİ YER sayfalamayı kaybetmez (gerileme kilidi)', () => {
    const beklenen: Array<[string, RegExp]> = [
      [path.join(FN, 'order-housekeeping', 'index.ts'), /tumSatirlar<\{ id: string \}>\(/],
      [path.join(FN, 'stock-alert', 'index.ts'), /tumSatirlar<Product>\(/],
    ]
    for (const [dosya, kalip] of beklenen) {
      const k = yorumsuz(fs.readFileSync(dosya, 'utf8'))
      expect(k, path.relative(KOK, dosya) + ': sayfalama çağrısı kaybolmuş').toMatch(kalip)
      expect(k, path.relative(KOK, dosya) + ': yardımcı import edilmiyor').toMatch(/_shared\/tum_satirlar\.ts/)
    }
  })

  it('stock-alert: count SEÇENEĞİ select çağrısına verilir (zincir sonunda yutulur)', () => {
    const k = yorumsuz(fs.readFileSync(path.join(FN, 'stock-alert', 'index.ts'), 'utf8'))
    // Ayırt edici: seçenek `select(...)`in İKİNCİ argümanı olmalı.
    expect(k, 'count seçeneği select çağrısına verilmemiş — filtre zincirinin sonunda sessizce yutulur').toMatch(
      /\.select\(\s*'[^']*'\s*,\s*secenek\s*\)/,
    )
  })

  it('⛔YARDIMCI FAIL-CLOSED KALIR: üç fırlatma da yerinde', () => {
    const k = yorumsuz(fs.readFileSync(path.join(FN, '_shared', 'tum_satirlar.ts'), 'utf8'))
    const firlatmalar = k.match(/throw new Error\(/g) ?? []
    expect(firlatmalar.length, 'fırlatma sayısı azaldı — yardımcı sessizce fail-open olmuş olabilir').toBeGreaterThanOrEqual(4)
    expect(k, 'toplam okunamadığında fırlatma yok').toMatch(/OKUNAMADI/)
    expect(k, 'üst sınır aşımında fırlatma yok').toMatch(/Sessizce KESMIYORUM/)
    expect(k, 'eksik toplama karşılaştırması yok').toMatch(/satir toplandi/)
    // `Number(null)` sıfırdır: bu tuzağa bir daha düşülmesin diye ölçüt yazılı.
    expect(k, 'null, sayıya dönüştürülmeden elenmiyor — "ölçemedim" sessizce 0 satır olur').toMatch(
      /toplam !== null && Number\.isFinite\(toplam\)/,
    )
  })

  it('order-housekeeping: iptal RAPORU gövde uzunluğuna değil sunucunun sayısına dayanır', () => {
    const k = yorumsuz(fs.readFileSync(path.join(FN, 'order-housekeeping', 'index.ts'), 'utf8'))
    expect(k, 'count=exact istenmiyor — return=representation gövdesi 1000\'de kesilir ve rapor eksik kalır').toMatch(
      /return=representation,count=exact/,
    )
    expect(k, 'cancelled_count hâlâ gövde uzunluğunu sayıyor').toMatch(/cancelled_count:\s*cancelledGercekSayi/)
  })
})
