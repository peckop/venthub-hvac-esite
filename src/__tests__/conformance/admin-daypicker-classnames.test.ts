import { Animation, DayFlag, SelectionState, UI } from 'react-day-picker'
import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-DAYPICKER-CLASS-1 · takvimin sınıf haritası KURULU sürümün
 * sözlüğünden gelir (T113-VH).
 *
 * NİÇİN VAR
 *
 * `react-day-picker` v8'den v9'a çıkarken sınıf anahtarlarının ÇOĞU yeniden
 * adlandırıldı (`head_cell` → `weekday`, `cell` → `day`, `day` → `day_button`,
 * `day_selected` → `selected`, `nav_button_previous` → `button_previous` …).
 *
 * BU KIRILMA SESSİZDİR — ve sessiz olduğunu ÖLÇTÜM, varsaymadım:
 *
 *   · v9 kurulduktan sonra, `dayPickerClassNames` haritası v8 anahtarlarıyla
 *     olduğu hâlde `pnpm type-check` TERTEMİZ geçti.
 *   · Sebebi tipin gevşekliği değil, haritanın ÇIPLAK BİR `const` olması:
 *     serbest nesne değişmezi doğrudan prop'a verilmediği için TypeScript'in
 *     fazla-özellik denetimi HİÇ çalışmıyor. Tanınmayan anahtarları da
 *     kütüphane sessizce yok sayıyor.
 *   · Sonuç: derleyici susar, test susar, takvim çıplak render olur.
 *
 * Bu yüzden kapı DAVRANIŞSAL bir kaynağa bağlanır: anahtarların doğruluğu,
 * KURULU paketin kendi enum'larından ölçülür. Kütüphane bir gün anahtarları
 * yine değiştirirse (v10), bu test kendiliğinden kırmızıya döner — çünkü
 * karşılaştırdığı sözlük dosyada sabitlenmiş değil, `node_modules`'tan gelir.
 *
 * ÖLÇMEDİĞİ ŞEY (adıyla)
 *
 *   · Sınıfların GÖRSEL olarak doğru göründüğünü ölçmez; yalnız anahtarların
 *     kütüphanenin tanıdığı isimler olduğunu ölçer.
 *   · Haritada eksik anahtar olmasını yasaklamaz — bir öğeyi bilerek
 *     biçimlendirmemek meşrudur. Yasakladığı şey TANINMAYAN anahtardır.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const KAYNAKLAR: Record<string, string> = import.meta.glob('/src/components/admin/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const TANINAN: ReadonlySet<string> = new Set<string>([
  ...Object.values(UI),
  ...Object.values(DayFlag),
  ...Object.values(SelectionState),
  ...Object.values(Animation),
])

/**
 * `dayPickerClassNames` haritasının anahtarlarını BİLEŞENİN KAYNAĞINDAN okur.
 *
 * Bilerek kaynak metin üzerinde çalışır: haritayı testin içinde yeniden
 * tanımlasaydım iki taraf tanım gereği uyuşurdu ve kural bir totolojiyi
 * doğrulardı — birinin bileşende eski anahtarı geri yazması hiç yakalanmazdı.
 */
function haritaAnahtarlari(): { dosya: string; anahtarlar: string[] } | null {
  for (const [yol, ham] of Object.entries(KAYNAKLAR)) {
    const satirlar = ham.split(/\r?\n/)
    const bas = satirlar.findIndex((s) => s.includes('dayPickerClassNames'))
    if (bas < 0) continue
    const anahtarlar: string[] = []
    for (let i = bas + 1; i < satirlar.length; i++) {
      const satir = satirlar[i]
      /*
       * Bitişi YALNIZ kendi başına duran kapanış süslüsü belirler.
       * "İçinde } geçen ilk satır" demek YETMEZ ve bunu ilk yazımda
       * öğrendim: değer bir şablon dizesi ise (`${navButton} …`) tarama
       * haritanın ortasında durup 5 anahtar okuyordu. Aşağıdaki
       * stale-guard tam da bunu yakaladı.
       */
      if (/^\s*\}\s*$/.test(satir)) break
      const eslesme = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*:/.exec(satir)
      if (eslesme) anahtarlar.push(eslesme[1])
    }
    return { dosya: yol, anahtarlar }
  }
  return null
}

describe('INV-ADMIN-DAYPICKER-CLASS-1 · kapsam (stale-guard)', () => {
  it('kurulu sürümün sözlüğü boş değil', () => {
    /* Sözlük boşalırsa aşağıdaki kural her anahtarı "tanınmıyor" sayardı. */
    expect(TANINAN.size).toBeGreaterThan(20)
  })

  it('bileşenin sınıf haritası bulunabiliyor', () => {
    const harita = haritaAnahtarlari()
    expect(harita, 'dayPickerClassNames tanimi hic bulunamadi').not.toBeNull()
    expect(harita!.anahtarlar.length, 'harita bos okundu').toBeGreaterThan(5)
  })
})

describe('INV-ADMIN-DAYPICKER-CLASS-1 · kural', () => {
  it('haritadaki HİÇBİR anahtar kurulu sürümün sözlüğü dışında olamaz', () => {
    const harita = haritaAnahtarlari()!
    const taninmayan = harita.anahtarlar.filter((a) => !TANINAN.has(a))
    expect(
      taninmayan,
      `Bu anahtarlari kutuphane TANIMIYOR - sessizce yok sayilirlar ve takvim ciplak render olur:\n  ${taninmayan.join('\n  ')}`,
    ).toEqual([])
  })
})
