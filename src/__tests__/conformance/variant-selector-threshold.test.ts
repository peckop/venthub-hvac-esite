/**
 * INV-VARIANT-PILL-1 — "varyant YERİNDE seçilir" cümlesinin sayısal karşılığı.
 *
 * NİÇİN BU KAPI VAR: `catalog-depth-standard` §K1 "aile sayfası varyantı yerinde
 * seçtirir" diyor. Bu cümlenin koddaki karşılığı tek bir sabittir —
 * `VARIANT_PILL_MAX`. Sabitin ALTINDA seçici ürünün yanında durur; ÜSTÜNDE seçici
 * gövdeden çıkar ve "N model" düğmesi + sayfanın altındaki Modeller bölümüne dönüşür.
 *
 * Yani bu sayı bir görünüm tercihi değil, **cetvelin yürürlük noktasıdır**. Sessizce
 * düşürülürse cetvel hâlâ yazılı kalır ama artık hiçbir şeyi yönetmiyor olur — bugüne
 * kadar defalarca gördüğümüz "yazılı ama erişilemez kural" sınıfı.
 *
 * Kapı üç şeyi tutar:
 *   1. Kademelenme tutarlı: hap sınırı, matris eşiğinin ALTINDA kalmalı.
 *   2. TEK KAYNAK: PDP kendi sayısını yazmamalı, sabiti içe aktarmalı.
 *   3. Recep kararı (2026-08-23): sınır 12'nin altına DÜŞÜRÜLEMEZ.
 */
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { VARIANT_MATRIX_MIN,VARIANT_PILL_MAX } from '../../components/products/VariantSelector'

const PDP = path.join(process.cwd(), 'src', 'app', '_components', 'ProductDetailPageView.tsx')

describe('INV-VARIANT-PILL-1 — varyant seçici eşiği', () => {
  it('kademelenme tutarlı: hap sınırı matris eşiğinin ALTINDA', () => {
    // Aksi hâlde hap listesi hiç bitmeden matris açılır; iki kademe çakışır.
    expect(VARIANT_PILL_MAX).toBeLessThan(VARIANT_MATRIX_MIN)
  })

  it('Recep kararı: sınır 12\'nin ALTINA düşürülemez', () => {
    // 2026-08-23 kararı. Düşürmek, 9–12 varyantlı aileleri sayfanın gövdesinden
    // çıkarır — cetvelin §K1'de söz verdiği şeyin tersi. Yükseltmek serbest DEĞİL
    // ama yasak da değil: 20+ varyantta matris devreye girdiği için üst sınır
    // VARIANT_MATRIX_MIN tarafından zaten korunuyor (üstteki iddia).
    expect(VARIANT_PILL_MAX).toBeGreaterThanOrEqual(12)
  })

  it('TEK KAYNAK — PDP eşiği kendi yazmaz, sabiti içe aktarır', () => {
    const src = fs.readFileSync(PDP, 'utf8')
    // (a) sabit gerçekten içe aktarılıyor
    expect(src).toMatch(/import\s*\{[^}]*VARIANT_PILL_MAX[^}]*\}\s*from\s*'[^']*VariantSelector'/)
    // (b) yerinde-seçim dalı sabite bağlı
    expect(src).toMatch(/variants\.length\s*<=\s*VARIANT_PILL_MAX/)
    // (c) POZİTİF KONTROL: iddia gerçekten PDP'yi okuyor. Dosya boş/yanlış olsaydı
    //     (a) ve (b) patlardı; ama okunan metnin PDP olduğunu ayrıca doğrularız.
    //     ÇAPA SEÇİMİ ÖLÇÜLDÜ: dosya kendi ADINI içermiyor (ilk denemem buydu ve
    //     kırmızı verdi — kontrolün kendisi çalıştığı için yakalandı). Bunun yerine
    //     PDP'ye özgü, başka hiçbir yüzeyde bulunmayan sözlük öneki kullanılır.
    expect(src).toContain('pdp.variant.')
  })
})
