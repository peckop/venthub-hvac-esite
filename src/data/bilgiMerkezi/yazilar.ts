/**
 * BİLGİ MERKEZİ YAZILARI — ilk sürümün içerik kaynağı (karar 92, PR-2).
 *
 * ⚠GEÇİCİ YER, BİLEREK: rehber-yazisi-standard.md R6 yayındaki metni bir DB tablosunda ister
 * (dil başına satır, durum ↔ sha256, ziyaretçi rolü yalnız `yayında` satırı okur). O tablo ayrı bir
 * migration PR'ıdır (kural 13). O gelene kadar yalnız ZATEN CANLIDA OLAN metin burada durur:
 * aşağıdaki üç yazı bugünkü `knowledge.topics` sözlük içeriğinden taşındı. R4.8 gereği yayından
 * önceki taslak (ör. BLOG'un frekans konvertörü yazısı) BURAYA GİRMEZ — depo PUBLIC.
 *
 * TAŞIMA KURALI (R0.1 + R2): kaynaksız teknik sayı TAŞINMADI ("7–9 m/s", "50–100 N", "%70–85",
 * "EN 16798-1" vb.). Kaynak listesi olmayan yazıda rakam bulunamaz — test ölçer
 * (INV-BILGI-MERKEZI-ICERIK-1). Bu yazılar R5 doğrulamasından GEÇMEMİŞTİR; yeniden yazımları
 * BLOG'un R9 ritmine girer. `air-curtain` ile `hava-perdesi` aynı metni taşıyordu (R1.3) → tek yazı.
 *
 * BİÇİM: gövde markdown'dır (R6), izinli alt küme `src/lib/bilgiMerkezi/markdown.ts`'te. Site içi
 * bağlantı düz adres DEĞİL kimliktir: `[metin](vh:<tür>/<anahtar>)` (R3; BLOG kapısı
 * `icBaglantiDenetle` ile aynı biçim). Kimlik sayfa üretilirken güncel adrese çözülür; çözülemeyen
 * kimlik derlemeyi DURDURUR.
 */

export type YaziDili = 'tr' | 'en'

/** Liste kartındaki konu etiketi; görünen ad sözlükte `bilgiMerkezi.konular.<anahtar>`. */
export type YaziKonusu = 'konfor' | 'guvenlik' | 'verimlilik'

export interface YaziMetni {
  /** Adres metni (o dilde). */
  slug: string
  /** Liste kartı ve meta açıklaması. Gövdenin ilk paragrafıyla aynı cevap, tek cümle. */
  ozet: string
  /** Markdown; tek `# ` başlık (H1) ile başlar. */
  govde: string
}

export interface RehberYazisi {
  /** Dilden bağımsız kalıcı kimlik. */
  kimlik: string
  konu: YaziKonusu
  /** ISO tarih (YYYY-MM-DD). Taşınan yazılarda bu adreste yayına girdiği gün. */
  yayinTarihi: string
  guncellemeTarihi: string
  /** Ürün kartı olarak basılacak kimlikler (`vh:aile/…`, `vh:model/…`). Fiyat basılmaz (R3). */
  urunler: readonly string[]
  /** Yalnız yazılmış diller. Olmayan dilde sayfa YOKTUR (başka dile düşme yasak, K10). */
  diller: Partial<Record<YaziDili, YaziMetni>>
}

const SORUMLULUK_TR =
  'Bu yazı genel mühendislik bilgisi verir; projeye özel hesabın, üretici kılavuzunun ve güncel resmî metinlerin yerini tutmaz.'
const SORUMLULUK_EN =
  'This article provides general engineering information; it does not replace project-specific calculations, the manufacturer’s manual or current official texts.'

export const YAZILAR: readonly RehberYazisi[] = [
  {
    kimlik: 'hava-perdesi',
    konu: 'konfor',
    yayinTarihi: '2026-09-24',
    guncellemeTarihi: '2026-09-24',
    urunler: ['vh:aile/vortice-hava-perdesi', 'vh:aile/vortice-h-ad-elektrikli'],
    diller: {
      tr: {
        slug: 'hava-perdesi',
        ozet: 'Hava perdesi, konforu korumak ve enerji kaybını azaltmak için girişlerin üzerine kurulur; cihaz kapı genişliğini tamamen kapatmalıdır.',
        govde: `# Hava Perdesi

Hava perdesi, konforu korumak ve enerji kaybını azaltmak için girişlerin üzerine kurulur; cihaz kapı genişliğini tamamen kapatmalıdır.

## Seçimde dikkat edilecekler

- Doğru seçimde kapı yüksekliği, kapı genişliği ve kullanım amacı (konfor ya da endüstriyel) belirleyicidir.
- Cihaz genişliği kapı genişliğine eşit olmalıdır; hava bariyeri kesintisiz kalmalıdır.
- Nozül iç mekâna doğru eğimli olmalıdır; kapı kontağıyla hız otomatik ayarlanabilir.

## Sık yapılan hatalar

- Kapıdan kısa cihaz kullanmak
- Çok düşük hava hızıyla çalıştırmak
- Nozülü dışa doğru eğmek

## Boyutlandırma

Kapınıza uygun cihazı [hava perdesi hesaplayıcısıyla](vh:hesaplayici/hava-perdesi) bulabilir, [hava perdesi modellerini](vh:kategori/air-curtains) inceleyebilirsiniz.

## Teknik sorumluluk notu

${SORUMLULUK_TR} Kurulum yetkili personel tarafından yapılmalıdır.
`,
      },
      en: {
        slug: 'air-curtain',
        ozet: 'An air curtain is installed above entrances to preserve comfort and reduce energy loss; the unit should fully cover the door width.',
        govde: `# Air Curtain

An air curtain is installed above entrances to preserve comfort and reduce energy loss; the unit should fully cover the door width.

## What to consider when selecting

- Door height, door width and purpose of use (comfort or industrial) are decisive for the right selection.
- The unit width should equal the door width; the air barrier should stay unbroken.
- The nozzle should be tilted inwards; speed can be adjusted automatically via a door contact.

## Common mistakes

- Using a unit shorter than the door
- Running at too low an air velocity
- Tilting the nozzle outwards

## Sizing

You can find the right unit for your door with the [air curtain calculator](vh:hesaplayici/hava-perdesi) and browse the [air curtain models](vh:kategori/air-curtains).

## Technical disclaimer

${SORUMLULUK_EN} Installation should be carried out by authorised personnel.
`,
      },
    },
  },
  {
    kimlik: 'jet-fan',
    konu: 'guvenlik',
    yayinTarihi: '2026-09-24',
    guncellemeTarihi: '2026-09-24',
    // Katalogda jet fan ailesi yok (`jet-fans` kategorisi pasif, aile 0 — 2026-09-24 ölçüldü):
    // kart basılmaz, uydurma bağ kurulmaz.
    urunler: [],
    diller: {
      tr: {
        slug: 'otopark-jet-fan',
        ozet: 'Otopark jet fanları, CO/NOx ve duman senaryosunda akışı egzoza yönlendiren tavan fanlarıdır; yerleşim kör nokta bırakmadan yapılmalıdır.',
        govde: `# Jet Fan (Otopark)

Otopark jet fanları, CO/NOx ve duman senaryosunda akışı egzoza yönlendiren tavan fanlarıdır; yerleşim kör nokta bırakmadan yapılmalıdır.

## Seçimde dikkat edilecekler

- Gerekli debi, otoparkın hacmine ve istenen hava değişim sayısına göre belirlenir.
- İtme kuvveti, fanlar arasındaki mesafeye ve otopark planına göre seçilir.
- Yerleşim havayı egzoza doğru sürüklemeli, sensör bölgelerinin tamamını kapsamalıdır.

## Sık yapılan hatalar

- Kör hacim bırakmak
- Sensör kapsamasını atlamak

## Ön boyutlandırma

Ön boyutlandırma için [jet fan hesaplayıcısını](vh:hesaplayici/jet-fan) kullanabilirsiniz.

## Teknik sorumluluk notu

${SORUMLULUK_TR} Kurulum yetkili personel tarafından yapılmalıdır.
`,
      },
      en: {
        slug: 'car-park-jet-fan',
        ozet: 'Car park jet fans are ceiling fans that direct the flow towards the exhaust in CO/NOx and smoke scenarios; the layout must leave no dead zones.',
        govde: `# Jet Fan (Car Park)

Car park jet fans are ceiling fans that direct the flow towards the exhaust in CO/NOx and smoke scenarios; the layout must leave no dead zones.

## What to consider when selecting

- The required airflow is determined by the car park volume and the desired air change rate.
- Thrust is selected according to the distance between fans and the car park plan.
- The layout should drive the air towards the exhaust and cover all sensor zones.

## Common mistakes

- Leaving dead zones
- Missing sensor coverage

## Preliminary sizing

You can use the [jet fan calculator](vh:hesaplayici/jet-fan) for preliminary sizing.

## Technical disclaimer

${SORUMLULUK_EN} Installation should be carried out by authorised personnel.
`,
      },
    },
  },
  {
    kimlik: 'isi-geri-kazanim',
    konu: 'verimlilik',
    yayinTarihi: '2026-09-24',
    guncellemeTarihi: '2026-09-24',
    urunler: ['vh:aile/vortice-isi-geri-kazanim', 'vh:aile/avens-isi-geri-kazanim', 'vh:aile/vortice-vort-mono'],
    diller: {
      tr: {
        slug: 'isi-geri-kazanim',
        ozet: 'Isı geri kazanım cihazları taze havayı ısı geri kazanımıyla sağlar; seçimde debi, verim, özgül fan gücü ve harici statik basınç belirleyicidir.',
        govde: `# Isı Geri Kazanım (HRV/ERV)

Isı geri kazanım cihazları taze havayı ısı geri kazanımıyla sağlar; seçimde debi, verim, özgül fan gücü ve harici statik basınç belirleyicidir.

## Seçimde dikkat edilecekler

- **Debi:** kişi sayısına ve mahalle göre toplam taze hava ihtiyacı belirlenir.
- **Verim ve özgül fan gücü (SFP):** yüksek ısı geri kazanım verimi ile düşük özgül fan gücü işletme maliyetini düşürür.
- **Basınç:** cihazın harici statik basıncı filtre ve kanal kayıplarını karşılamalıdır.

## Sık yapılan hatalar

- Yüksek verime bakıp harici statik basıncı atlamak

## Boyutlandırma

İhtiyacınızı [ısı geri kazanım hesaplayıcısıyla](vh:hesaplayici/hrv) hesaplayabilir, [ısı geri kazanım cihazlarını](vh:kategori/heat-recovery-vmc) inceleyebilirsiniz.

## Teknik sorumluluk notu

${SORUMLULUK_TR} Örnek değerler kendi sisteminizde farklı çıkabilir.
`,
      },
      en: {
        slug: 'heat-recovery',
        ozet: 'Heat recovery units provide fresh air with heat recovery; airflow, efficiency, specific fan power and external static pressure are decisive in selection.',
        govde: `# Heat Recovery (HRV/ERV)

Heat recovery units provide fresh air with heat recovery; airflow, efficiency, specific fan power and external static pressure are decisive in selection.

## What to consider when selecting

- **Airflow:** the total fresh air demand is determined by occupancy and space.
- **Efficiency and specific fan power (SFP):** high heat recovery efficiency and low specific fan power reduce operating costs.
- **Pressure:** the unit’s external static pressure should cover filter and duct losses.

## Common mistakes

- Focusing on high efficiency while ignoring external static pressure

## Sizing

You can calculate your demand with the [heat recovery calculator](vh:hesaplayici/hrv) and browse the [heat recovery units](vh:kategori/heat-recovery-vmc).

## Technical disclaimer

${SORUMLULUK_EN} Example values may differ in your own system.
`,
      },
    },
  },
]

/** O dilde yazılmış yazılar, yeniden eskiye (R3 liste sayfası). */
export function dildekiYazilar(dil: YaziDili, yazilar: readonly RehberYazisi[] = YAZILAR): RehberYazisi[] {
  return yazilar
    .filter((y) => y.diller[dil])
    .slice()
    .sort((a, b) => (a.yayinTarihi < b.yayinTarihi ? 1 : a.yayinTarihi > b.yayinTarihi ? -1 : a.kimlik < b.kimlik ? -1 : 1))
}

/** Adres metninden yazı; o dilde yoksa `null`. */
export function yaziBul(dil: YaziDili, slug: string, yazilar: readonly RehberYazisi[] = YAZILAR): RehberYazisi | null {
  return yazilar.find((y) => y.diller[dil]?.slug === slug) ?? null
}
