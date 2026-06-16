import { describe, expect, it } from 'vitest'

/**
 * Legal EN içerik — çevrilmemiş Türkçe sızıntı bekçisi (sezgisel guard).
 *
 * Legal uzun-form metni bilinçli olarak tr/en AYRIK bileşenlerde tutulur (sözlüğe taşınmaz —
 * bkz. i18n-localization-standard §3 / dict-vs-split kararı). Bu split'in zayıf noktası: iki
 * dosya elle senkron tutulduğu için EN dosyasında bir başlık/cümle yanlışlıkla Türkçe kalabilir
 * ve hiçbir tip/lint/parite testi bunu yakalamaz (kanıt: en/KvkkContent.tsx §8 başlığı uzun süre
 * "Yürürlük" kaldı). Bu bekçi tam o sınıfı yakalar.
 *
 * Yöntem (sezgisel, düşük yanlış-pozitif): `src/views/legal/components/en/` altındaki dosyalarda
 * Türkçe'ye ÖZGÜ harfler aranır. KAPSAM DIŞI: küçük `ç` — çünkü KVKK madde atıfları İngilizce
 * metinde meşruen geçer ("KVKK Art. 5/2-ç"). Geri kalan Türkçe harfler (ı ş ğ ü ö ve büyükleri +
 * büyük Ç) İngilizce hukuki metinde pratikte yalnız çevrilmemiş Türkçe kelimelerde görünür.
 * Heuristik olduğu için "her sızıntıyı yakalar" iddiası YOK; yaygın çok-heceli Türkçe kelimeleri
 * (Yürürlük, Çerez, açık rıza...) sıfıra yakın yanlış-pozitifle yakalar. Phase B'de yazılacak
 * diğer EN legal dosyalarına da otomatik uygulanır.
 *
 * NOT: Kaynağı Vite'ın import.meta.glob('?raw')'ı ile okuyoruz (INV-1..4 ile aynı sebep).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/views/legal/components/en/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// Türkçe'ye özgü harfler — küçük `ç` HARİÇ (KVKK madde atfı "5/2-ç" meşrudur).
const TURKISH_LETTER = /[ışğüöİŞĞÜÖÇ]/

function toRelPath(globKey: string): string {
  const marker = '/src/'
  const idx = globKey.indexOf(marker)
  return (idx >= 0 ? globKey.slice(idx + marker.length) : globKey).replace(/\\/g, '/')
}

describe('Legal EN içerik — çevrilmemiş Türkçe sızıntı bekçisi', () => {
  it('en/ legal bileşenlerinde Türkçe-kalmış metin olmamalı (ç hariç)', () => {
    const offenders: string[] = []

    for (const [key, source] of Object.entries(SOURCES)) {
      const rel = toRelPath(key)
      const lines = source.split('\n')
      lines.forEach((line, i) => {
        const code = line.replace(/\/\/.*$/, '') // satır yorumu at
        if (TURKISH_LETTER.test(code)) {
          offenders.push(`${rel}:${i + 1}  ${line.trim().slice(0, 90)}`)
        }
      })
    }

    expect(
      offenders,
      `İngilizce legal bileşeninde Türkçe-kalmış metin bulundu (çevir; "5/2-ç" tipi atıf hariç):\n  ${offenders.join('\n  ') || '—'}`,
    ).toEqual([])
  })
})
