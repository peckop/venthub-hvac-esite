import { describe, expect, it } from 'vitest'

/**
 * INV-REFUND-UI-1 — admin iade akışı GERÇEK ödeme ucuna bağlı.
 *
 * NİÇİN (T053-VH · operasyon döngüsü denetimi §3):
 * Admin panelindeki iade akışı `refunded` derken `refund-order-mock` çağırıyordu.
 * O uç kendi başlığında *"no real PSP call, only DB state updates"* diyordu ve bunu
 * dürüstçe yapıyordu. Sonuç, denetimin "sessiz sahte-başarı" dediği sınıfın en
 * pahalı örneğiydi:
 *   · `payment_status = 'refunded'` yazılıyordu,
 *   · denetim kaydı düşüyordu,
 *   · müşteriye "iadeniz tamamlandı" e-postası gidiyordu,
 *   · İyzico'ya **tek bir istek bile gitmiyordu.**
 * Üstüne hata `catch {}` ile yutuluyordu: mock 500 dönse bile statü `refunded`
 * kalıyordu. Mock bugün emekli (410 Gone) — yani çağrı hiçbir şey yapmıyor.
 *
 * Bu kapı ÜÇ şeyi birden kilitler: doğru uç çağrılıyor, mock geri gelmiyor,
 * ve para başarısızsa statü yazılmıyor.
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

const RETURNS_UI = '/src/views/admin/ReturnsTableBody.tsx'

/**
 * Yorumları AT. Bu dosyanın kendi açıklamaları `refund-order-mock`'tan söz ediyor;
 * ham alt-dize araması onları ihlal sanardı. (Yanlış-KIRMIZI da kusurdur ve insanı
 * kurumsal hafızayı silmeye iter.)
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
    .join('\n')
}

const source = stripComments(ALL[RETURNS_UI] ?? '')

describe('INV-REFUND-UI-1 · gerçek para iadesi', () => {
  it('kaynak okunabildi (stale-guard)', () => {
    // Yol yazım hatası bu dosyadaki HER testi sessizce "temiz"e çevirirdi.
    expect(source.length).toBeGreaterThan(2000)
  })

  it('emekli `refund-order-mock` ucu ÇAĞRILMIYOR', () => {
    // Adın geçmesi değil, ÇAĞRILMASI aranıyor: yorumda anılması meşrudur.
    const calls = [...source.matchAll(/invoke[^)]*['"`]refund-order-mock['"`]/g)]
    expect(
      calls.length,
      'Mock uç emekli (410 Gone) ve hiçbir şey yapmıyor. Gerçek uç: `iyzico-refund`.',
    ).toBe(0)
  })

  it('gerçek uç `iyzico-refund` çağrılıyor', () => {
    expect(
      /invoke[\s\S]{0,80}['"`]iyzico-refund['"`]/.test(source),
      'İade akışı gerçek PSP ucuna bağlı olmalı.',
    ).toBe(true)
  })

  it('iade BAŞARISIZSA akış duruyor (statü yazılmıyor)', () => {
    /*
      Kritik değişmez: para gitmediyse kayıt "iade edildi" DEMEMELİ. Kodda bu,
      iade sonucunun `ok` olmadığı durumda `throw` ile sağlanıyor — `mutateWithAudit`
      gövdesinden atılan hata hem statü yazımını hem audit kaydını engeller.
    */
    /*
      SAYIYA BAĞLI — "bir yerde var" YETMEZ. İlk yazımda `guard.test(source)` idi;
      sabotaj turunda TEK SATIR akışındaki `throw`u `console.warn`a çevirdim ve kapı
      YEŞİL kaldı, çünkü toplu akıştaki koruma iddiayı tek başına tatmin ediyordu.
      Yani kapı "korunuyor mu"yu değil "herhangi bir yerde koruma var mı"yı ölçüyordu.
      İki çağrı yeri var (tek satır + toplu); her birinin ardından throw'lu bir
      koruma gelmeli.
    */
    // `await` ile daraltıldı: `async function performRealRefund(` TANIMI da
    // çağrı sanılıyordu (sayaç 2 yerine 3 veriyordu).
    const callSites = [...source.matchAll(/await\s+performRealRefund\s*\(/g)].length
    const guarded = [
      ...source.matchAll(/await\s+performRealRefund\s*\([\s\S]{0,200}?if \(!refund\.ok\)[\s\S]{0,160}?throw/g),
    ].length

    expect(callSites, 'İade çağrısı hem tek satır hem toplu akışta olmalı').toBeGreaterThanOrEqual(2)
    expect(
      guarded,
      `${callSites} çağrı yerinin yalnız ${guarded} tanesi korunuyor. Başarısız iade ` +
        '`throw` ile akışı DURDURMALI; aksi halde "para gitmedi ama kayıt iade göründü" durumu doğar.',
    ).toBe(callSites)
  })

  it('iade sonucu SESSİZCE yutulmuyor (boş catch yok)', () => {
    // Eski hâlde `catch {}` vardı ve mock 500 dönse bile statü `refunded` kalıyordu.
    const swallow = /performRealRefund[\s\S]{0,200}?catch\s*\{\s*\}/
    expect(swallow.test(source), 'İade hatası boş `catch` ile yutulamaz.').toBe(false)
  })
})
