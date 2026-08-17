import { describe, expect, it } from 'vitest'

/**
 * INV-FXLOCK-VIS-1 — kur kilidinin GÖRÜNÜRLÜĞÜ.
 *
 * NİÇİN (pricing-standard §8.2.1-C):
 *
 * `pricing_policy.fx_lock`, ürünleri fiyat tazelemesinin DIŞINDA bırakır. Servis bu
 * atlamayı sayıyordu (`skippedFxLocked`) ama sayı HİÇBİR yüzeyde gösterilmiyordu:
 * kilit, ürünleri sessizce atlıyor ve admin bunu göremiyordu. "Fiyatları güncelledim"
 * diyen bir ekran, aslında N ürüne dokunmamış oluyordu.
 *
 * İKİNCİ İŞLEVİ — SESSİZ-ARIZA DEDEKTÖRÜ: aktif kilit varken bu sayaç sürekli 0 ise
 * kilit UYGULANMIYOR demektir. Bu yüzden 0 değeri de gösterilir, gizlenmez; "0 = sorun
 * yok" ile "0 = mekanizma ölü" ancak sayı görünürse ayırt edilebilir.
 *
 * Kardeş atlama sebepleri (`skippedNoRate`, `skippedNoPurchasePrice`, `skippedManual`)
 * zaten gösteriliyordu — eksik olan yalnız kilitti. Yani bu, "aynı düzeltme N yerde
 * gerekiyordu, N-1'inde yapıldı" sınıfının bir örneğiydi.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const ALL: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Yorumları at — yoksa bu dosyanın ve bileşenlerin GEREKÇE metinleri iddiaları
 * tatmin eder ve test kendi açıklamasını doğrular. `[^\n]*` kullanılıyor: depo
 * CRLF ve JS'te `.` satır sonunu yemez.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
}

const SURFACES: Record<string, string> = {
  'CostRefreshModal': stripComments(ALL['/src/components/admin/pricing/CostRefreshModal.tsx'] ?? ''),
  'MaterializePricesModal': stripComments(ALL['/src/components/admin/pricing/MaterializePricesModal.tsx'] ?? ''),
}

describe('INV-FXLOCK-VIS-1 · kur kilidi atlaması görünür', () => {
  it('kaynaklar okunabildi (stale-guard)', () => {
    for (const [name, src] of Object.entries(SURFACES)) {
      expect(src.length, `${name} okunamadı — yol değişmiş olabilir.`).toBeGreaterThan(1000)
    }
  })

  it('fiyat yazan HER yüzey `skippedFxLocked` sayısını gösteriyor', () => {
    /*
      SAYIYA bağlı değil ADA bağlı: her iki modal da ayrı ayrı taşımalı. "Bir yerde
      gösteriliyor" yetmez — admin hangi işlemi çalıştırdıysa onun özetinde görmeli.
    */
    for (const [name, src] of Object.entries(SURFACES)) {
      expect(
        /preview\.skippedFxLocked/.test(src),
        `${name}: kur kilidi yüzünden atlanan ürün sayısı gösterilmiyor — kilit sessiz kalır.`,
      ).toBe(true)
      expect(
        /summary\.skippedFxLocked/.test(src),
        `${name}: sayının etiketi sözlükten gelmeli (ham metin değil).`,
      ).toBe(true)
    }
  })

  it('sayı KOŞULSUZ gösteriliyor — 0 gizlenmiyor', () => {
    /*
      `{preview.skippedFxLocked > 0 && <div/>}` gibi bir koşul, sayacı yalnız pozitifken
      gösterirdi ve sessiz-arıza dedektörünü ÖLDÜRÜRDÜ: "kilit var ama sayaç hep 0"
      durumu ancak 0 görünürse fark edilir. Vurgu rengi koşullu olabilir, VARLIK olamaz.
    */
    for (const [name, src] of Object.entries(SURFACES)) {
      expect(
        /skippedFxLocked\s*>\s*0\s*&&/.test(src),
        `${name}: sayaç koşullu render edilmemeli — 0 değeri de görünmeli (sessiz-arıza dedektörü).`,
      ).toBe(false)
    }
  })
})
