/**
 * INV-I18N-TERS-1 — TÜRKÇE YÜZEYDE İNGİLİZCE METİN KALMAZ.
 *
 * NİÇİN VAR (ölçülmüş boşluk, REC-113 / 2026-09-01):
 * Bugüne kadarki BÜTÜN dil ölçümleri tek yönlüydü — İngilizce sayfada Türkçe metin
 * (REC-103 kategori adları, REC-108 aile adları). Aynası HİÇ ölçülmedi. Recep sorunca
 * ölçüldü: 4200 anahtarın 6'sında Türkçe yüzeyde İngilizce metin vardı.
 * ⭐Sınıf: kusur değil, ÖLÇÜLMEMİŞ YÖN. Envanteri tek yönlü kurmak öbür yöndeki her şeyi
 * görünmez yapar — ve görünmeyen şey "yok" sanılır.
 *
 * ⭐İSTİSNA LİSTESİ CETVELDEN OKUNUR, BURAYA KOPYALANMAZ:
 * "Model", "PVC", "SKU" Türkçede de aynen kullanılır; aynılık tek başına kusur değildir.
 * Ölçütü ayırt edici kılan şey listedir (ham aday 124 → gerçek 6). Liste kapının içine
 * kopyalansaydı cetvelle sessizce ayrışırdı — 2026-09-01'de aynı sınıf üç kez yaşandı
 * (iki yüzey aynı hükmü ayrı yazıyor, biri düzeltilince diğeri eski davranışta kalıyor).
 *
 * Cetvel: docs/standards/i18n-ters-yon-standard.md
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { en } from '../../i18n/dictionaries/en'
import { tr } from '../../i18n/dictionaries/tr'

const CETVEL = join(process.cwd(), 'docs', 'standards', 'i18n-ters-yon-standard.md')

/** Kapsam: yalnız müşteri yüzeyi. `admin.*` ayrı şeridin ve müşteriye görünmez. */
const KAPSAM_DISI = /^admin\./

type Duz = Record<string, string>
const duzlestir = (o: unknown, onek = '', cikti: Duz = {}): Duz => {
  if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      const yol = onek ? `${onek}.${k}` : k
      if (typeof v === 'string') cikti[yol] = v
      else duzlestir(v, yol, cikti)
    }
  }
  return cikti
}

/**
 * Cetvel §3'teki tablodan meşru terimleri çeker. Satır biçimi:
 * `| Sınıf | terim · terim · terim | gerekçe |`
 */
function cetveldenTerimler(): string[] {
  const metin = readFileSync(CETVEL, 'utf8')
  const bolum = metin.split('## 3)')[1]?.split('## 4)')[0] ?? ''
  const terimler: string[] = []
  for (const satir of bolum.split('\n')) {
    if (!satir.startsWith('|') || satir.includes('---') || satir.includes('Niçin meşru')) continue
    const hucreler = satir.split('|').map((h) => h.trim())
    // hucreler: ['', sınıf, örnekler, gerekçe, '']
    const ornekler = hucreler[2] ?? ''
    for (const parca of ornekler.split('·')) {
      const t = parca.replace(/`/g, '').trim()
      if (t) terimler.push(t)
    }
  }
  return terimler
}

/**
 * Cetvel §5'te ERTELENMİŞ olarak kayda geçmiş anahtarlar.
 *
 * ⭐Kapı cetveli OKUMAK zorunda: cetvel "3D kararına ertelendi" derken kapı "ihlal"
 * derse ikisi çelişir ve biri susturulur. Erteleme kaydı silinirse anahtarlar yeniden
 * ihlal sayılır — yani erteleme bedava değil, kayda bağlı.
 */
function cetveldenErtelenenler(): string[] {
  const metin = readFileSync(CETVEL, 'utf8')
  const bolum = metin.split('## 5) ERTELENENLER')[1]?.split('## 6)')[0] ?? ''
  return [...bolum.matchAll(/`([a-zA-Z][\w.]*\.[\w.]+)`/g)].map((m) => m[1])
}

/** Terimle ifade edilemeyen YAPISAL meşruluklar (şablon, yol, adres, salt sembol). */
/**
 * ⭐ŞABLON DEĞİŞKENİNİN ADI EKRANDA GÖRÜNMEZ.
 *
 * İlk yazımda ölçüt ham dizeye bakıyordu ve `"Sayfa {{page}} / {{pageCount}}"` değeri
 * "İngilizce kelime içeriyor" diye ihlal sayıldı — yakalanan kelime `page`, yani
 * KODUN değişken adı. Kullanıcı onu hiç görmez. Ölçüm, görünen metin üzerinde yapılır.
 */
const gorunenMetin = (d: string): string => d.replace(/\{\{[^}]*\}\}/g, ' ').trim()

const YAPISAL_MESRU = [
  // Yer tutucular çıkınca geriye yalnız birim/sembol kalıyorsa çevrilecek sözcük yoktur:
  // "{{v}} m³" → "m³", "{{w}}m × {{h}}m" → "m × m".
  /^[\s\d\W]*(?:[a-zA-Z]{1,3}[\s\d\W]*)*$/,
  /^\d+[-–]\d+\s*\S+$/, // "55-65 dB(A)" — sayı aralığı + birim
  /^\//, //  varlık yolu
  /@[\w.-]+\.\w+$/, // e-posta
  /^[\d\s\W]*$/, // salt rakam/sembol
]

const INGILIZCE_ISLEV =
  /\b(the|and|for|with|your|you|this|that|are|is|to|of|in|on|at|by|from|all|our|we|will|can|please|search|view|page|home|next|previous|show|hide|save|cancel|delete|add|remove|select|choose|continue|back|close|open|send|submit|loading|error|success|failed|required|optional)\b/i
const TURKCE_KARAKTER = /[çğıöşüÇĞİÖŞÜ]/

const trD = duzlestir(tr)
const enD = duzlestir(en)
const TERIMLER = cetveldenTerimler()
const ERTELENEN = new Set(cetveldenErtelenenler())

const kacir = (t: string): string => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const mesruMu = (deger: string): boolean => {
  const d = deger.trim()
  if (YAPISAL_MESRU.some((r) => r.test(gorunenMetin(d)))) return true
  // Terim eşleşmesi BÜYÜK-KÜÇÜK HARF DUYARSIZ: "VENTHUB B2B" ile "VentHub" aynı özel addır.
  if (TERIMLER.some((t) => t.toLowerCase() === d.toLowerCase())) return true
  // Marka / ürün hattı adı İÇEREN bileşik değerler ("VentHub HVAC Solutions.")
  return TERIMLER.some((t) => t.length >= 3 && new RegExp(`\\b${kacir(t)}\\b`, 'i').test(d))
}

const kapsamdakiAnahtarlar = Object.keys(trD).filter((k) => !KAPSAM_DISI.test(k))

describe('INV-I18N-TERS-1 · Türkçe yüzeyde İngilizce metin kalmaz', () => {
  it('⭐BOŞLUK MUHAFIZI — sözlük ve cetvel gerçekten okundu', () => {
    // "0 ihlal" ancak ölçüm koştuysa bilgi taşır. Sözlük yolu ya da cetvel bölüm
    // başlığı değişirse kapı sessizce YEŞİL döner ve hiçbir şey korumaz.
    expect(kapsamdakiAnahtarlar.length, 'sözlük okunamadı ya da kapsam boş').toBeGreaterThan(1000)
    expect(TERIMLER.length, 'cetvel §3 tablosundan terim çekilemedi — kapı kör').toBeGreaterThan(20)
  })

  it('⭐tr === en olan her değerin CETVELDE yazılı bir gerekçesi var', () => {
    const gerekcesiz: string[] = []
    for (const anahtar of kapsamdakiAnahtarlar) {
      const trDeger = trD[anahtar]
      if (enD[anahtar] !== trDeger) continue
      if (ERTELENEN.has(anahtar)) continue // cetvel §5'te kayda geçmiş erteleme
      if (!mesruMu(trDeger)) gerekcesiz.push(`${anahtar} = "${trDeger}"`)
    }
    expect(
      gerekcesiz,
      'TR ve EN değeri AYNI ve cetvelde gerekçesi YOK. Ya çevir, ya cetvel §3\'e SINIFIYLA yaz.'
    ).toEqual([])
  })

  it('TR değeri Türkçe karakter taşımıyor VE İngilizce işlev kelimesi içeriyorsa ihlaldir', () => {
    // İkincil ölçüt: tr != en olduğu halde TR değerin İngilizce kaldığı vakalar.
    const supheli: string[] = []
    for (const anahtar of kapsamdakiAnahtarlar) {
      const d = trD[anahtar]
      if (enD[anahtar] === d) continue
      if (ERTELENEN.has(anahtar)) continue
      // ⭐Ölçüm GÖRÜNEN metin üzerinde: `{{page}}` bir değişken adıdır, ekranda yoktur.
      const g = gorunenMetin(d)
      if (g.length <= 3 || TURKCE_KARAKTER.test(g)) continue
      if (INGILIZCE_ISLEV.test(g) && !mesruMu(d)) supheli.push(`${anahtar} = "${d}"`)
    }
    expect(supheli).toEqual([])
  })

  it('⭐DÖNÜŞ GÜVENCESİ — kapatılan dört bulgu geri gelemez', () => {
    // Mod-bağımlı olmayan bir kapı da iki yönlü yazılabilir: düzeltilen anahtarların
    // TR ve EN değerleri artık FARKLI olmak zorunda. Biri eski hâline döndürülürse
    // yukarıdaki kol da yakalar, ama bu kol NEYİN döndüğünü ADIYLA söyler.
    const kapatilan: [string, string][] = [
      ['knowledge.hub.eyebrow', 'TEKNİK BİLGİ MERKEZİ'],
      ['category.showcase.premiumTitle', 'Premium Mühendislik Çözümleri'],
      ['home.cinematicShowcase.hudStatus', 'Sistem.Veri.Canlı'],
      ['categorySilentFan.comparison.quietLabel', 'Sessiz:'],
    ]
    for (const [anahtar, beklenen] of kapatilan) {
      expect(trD[anahtar], `${anahtar} eski İngilizce değerine dönmüş olabilir`).toBe(beklenen)
      expect(trD[anahtar], `${anahtar} TR ve EN'de aynı — çeviri geri alınmış`).not.toBe(enD[anahtar])
    }
  })

  it('⭐ERTELENENLER CETVELDE DURUYOR — sessiz eksik olmasın', () => {
    // 3D anahtarları GERÇEK bulgudur, 3D kararına ertelendi. Ertelemenin kaydı silinirse
    // iş sessizce kaybolur; bu kol o kaydı zorunlu tutar.
    const metin = readFileSync(CETVEL, 'utf8')
    expect(metin).toContain('## 5) ERTELENENLER')
    expect(metin).toContain('product3d.reset')
    expect(metin).toContain('product3d.free')
    expect(metin, 'marka sloganı kararı cetvelde kayıtlı değil').toContain('brandTagline')
  })
})
