/**
 * `jsdom` için dar tip bildirimi.
 *
 * NİÇİN VAR: `jsdom` paketi kendi tiplerini getirmiyor ve `@types/jsdom` bu depoda kurulu
 * değil. Paketi bağımlılık olarak eklemek pnpm workspace kökünü ve kilit dosyasını
 * değiştirirdi — tek bir test dosyası için orantısız. Depoda bu desenin örneği zaten var
 * (`isomorphic-dompurify.d.ts`, `vitest-axe.d.ts`).
 *
 * KİM KULLANIYOR: `src/views/checkout/__tests__/injectCheckoutForm.test.ts`. Projenin
 * varsayılan test ortamı betikleri **çalıştırmıyor** (ölçüldü); o test, PSP betiğinin
 * gerçekten yürüdüğünü kanıtlamak için `runScripts: 'dangerously'` açık kendi belgesini kurar.
 *
 * KAPSAM: yalnız o testin kullandığı yüzey bildirilir. `any` YOK — eksik bir alan gerekirse
 * buraya açıkça eklenir; böylece bildirim, kullanımın gerçek sınırını gösterir.
 */
declare module 'jsdom' {
  export interface JSDOMOptions {
    /** `'dangerously'` olmadan jsdom sayfa içindeki betikleri ÇALIŞTIRMAZ. */
    runScripts?: 'dangerously' | 'outside-only'
    url?: string
    pretendToBeVisual?: boolean
  }

  export class JSDOM {
    constructor(html?: string, options?: JSDOMOptions)
    readonly window: Window & typeof globalThis
  }
}
