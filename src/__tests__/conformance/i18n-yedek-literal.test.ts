/**
 * INV-I18N-YEDEK-1 — `t('anahtar') || 'Türkçe yedek'` deseni vitrinde YASAK.
 *
 * NİÇİN VAR (REC-125 / 2026-09-05 ölçümü): vitrinde **75** yerde bu desen yaşıyordu.
 * Zararsız görünür — "anahtar yoksa Türkçesi düşsün" der gibi. Gerçekte iki şey yapar:
 *
 *  1. **Anahtar VARSA** yedek ölü koddur ve KODU OKUYANI YANILTIR. Ölçülmüş örnek:
 *     `AccountLayout`'ta grup başlığı `t('account.tabs.overview') || 'Özet'`, altındaki
 *     tek öğe `t('account.tabs.overview') || 'Hesap Özeti'` idi — iki farklı yedek, TEK
 *     anahtar. Kodu okuyan iki farklı metin sanıyordu; ekranda ikisi de 'Genel Bakış'tı.
 *  2. **Anahtar YOKSA** çok daha kötüsü olur: İngilizce kullanıcıya **sessizce Türkçe**
 *     servis edilir ve eksik anahtar hiçbir kapıya görünmez — çünkü sayfa "çalışıyor".
 *     Yedek, i18n kapılarının görmesi gereken boşluğu KAPATIR.
 *
 * ⭐NİÇİN KALDIRMAK GÜVENLİYDİ (kanıt zinciri, tahmin değil):
 *   • Ölçüldü: kaldırılan 75 çağrının **tamamı** çok segmentli anahtar; tek segmentli **0**.
 *   • INV-5 (`i18n-key-resolution.test.ts`) her statik çok segmentli `t()` anahtarının
 *     `tr` sözlüğünde ÇÖZÜLDÜĞÜNÜ zorlar — yeşil.
 *   • `en` sözlüğü `export const en: typeof tr` diye tiplenmiş → `tsc` her anahtarın
 *     İngilizcesinin de VAR olduğunu garanti eder.
 *   ⇒ Üçü birlikte: yedekler erişilemez koddu; kaldırmak ekranı DEĞİŞTİRMEZ.
 *
 * ⚠ÖLÇÜT TUZAĞI (bugün sahada düşüldü, buraya yazılıyor): naif `t\(` deseni
 * `get('token') || 'x'` gibi çağrıların KUYRUĞUNU yakalar — `_` ve harfler kelime
 * karakteridir, `t` ile öncesi arasında sınır yoktur. İlk ölçümüm bu yüzden 82 dedi,
 * doğrusu 75'ti. Bu yüzden aşağıdaki desen `(?<![\w$])` lookbehind'i ile başlar
 * (INV-5 aynı tuzağı `_t(` alias'ında yaşamış ve belgelemiş).
 *
 * KAPSAM: vitrin = `src/` eksi admin, eksi test. Ölçülen kalan (2026-09-05, temizlik sonrası):
 * **admin 22** — kendi cetveli ve kendi şeridi var, bu kapı ona hüküm VERMEZ;
 * **test dosyası 2** — kapı gövdesi, kendi örneğini taşıması normal;
 * **companion `.md` 2** (`SearchOverlay.md`, `AddressFormModal.md`) — ÜRETİLMİŞ belge,
 * üretimi dondurulmuş (REC-132) ve INV-DOC-4b kaynak+üretilmişi aynı commit'te yasaklıyor,
 * bu yüzden bilerek dokunulmadı; kapı `.ts/.tsx` dışına bakmaz.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = join(process.cwd(), 'src')
/** Yorum ANLATIR, kural UYGULAR — ölçüt daima gövdede koşar. */
const govde = (k: string) => k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')

/** `t('a.b') || 'yedek'` — lookbehind ŞART (bkz. başlıktaki ölçüt tuzağı). */
const YEDEK = /(?<![\w$])_?t\(\s*['"][A-Za-z]\w*(?:\.\w+)+['"]\s*\)\s*\|\|\s*['"][^'"]*['"]/g

function dosyalar(dizin: string, biriktir: string[] = []): string[] {
  for (const e of readdirSync(dizin, { withFileTypes: true })) {
    const tam = join(dizin, e.name)
    if (e.isDirectory()) {
      // admin = BAŞKA ŞERİDİN cetveli · __tests__ = kapının kendi gövdesi
      if (e.name !== 'admin' && e.name !== '__tests__') dosyalar(tam, biriktir)
    } else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) {
      biriktir.push(tam)
    }
  }
  return biriktir
}

describe('INV-I18N-YEDEK-1 · sözlük çağrısının arkasına Türkçe yedek yazılmaz', () => {
  const kaynaklar = dosyalar(KOK).map((yol) => ({
    yol: yol.replace(process.cwd(), '').replace(/\\/g, '/'),
    kod: govde(readFileSync(yol, 'utf8')),
  }))

  it('⭐ASIL İDDİA — vitrinde hiçbir `t(...) || "yedek"` kalmadı', () => {
    const isabetler: string[] = []
    for (const { yol, kod } of kaynaklar) {
      for (const m of kod.matchAll(YEDEK)) isabetler.push(`${yol}: ${m[0].slice(0, 80)}`)
    }
    expect(
      isabetler,
      'Sozluk cagrisinin arkasina Turkce yedek yazilmis. Anahtar varsa yedek OLU KODdur ve\n' +
        'kodu okuyani yaniltir; anahtar yoksa EN kullaniciya sessizce Turkce duser ve eksik\n' +
        'anahtar hicbir kapiya gorunmez. Dogrusu: anahtari sozluge EKLE, yedegi yazma.\n' +
        'Isabetler:\n  ' + isabetler.join('\n  '),
    ).toEqual([])
  })

  it('AYIRT EDİCİ — ölçüt gerçekten bu deseni yakalıyor (kendi üzerinde sınandı)', () => {
    // Kapinin KENDI olcutu olculur: sahte-yesil en sik buradan dogar (desen bozulur,
    // hicbir sey eslesmez, test sonsuza dek yesil kalir).
    const ornek = "const x = t('account.tabs.orders') || 'Siparişler'"
    expect([...ornek.matchAll(YEDEK)].length, 'Olcut GERCEK deseni yakalamiyor.').toBe(1)
    // Ve yanlis-pozitif vermiyor: `get('token') || 'x'` YAKALANMAMALI.
    const tuzak = "const q = params.get('token') || 'yok'"
    expect(
      [...tuzak.matchAll(YEDEK)].length,
      "Olcut get('token') gibi cagrilarin KUYRUGUNU yakaliyor — lookbehind bozulmus.",
    ).toBe(0)
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okunuyor', () => {
    // Yol/gez bozulsa ustteki "0 isabet" beklentisi SAHTE-YESIL verirdi.
    expect(kaynaklar.length, 'Vitrin kaynagi hic okunmadi.').toBeGreaterThan(200)
    expect(
      kaynaklar.some((k) => /(?<![\w$])_?t\(/.test(k.kod)),
      'Hicbir dosyada t() cagrisi gorunmuyor — evren yanlis.',
    ).toBe(true)
  })
})
