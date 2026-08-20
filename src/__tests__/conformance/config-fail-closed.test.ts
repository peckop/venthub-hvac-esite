import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CONFIG-1 — **yapılandırma boşluğu sessizce davranış değiştiremez.** (T100-VH · 2026-08-19)
 *
 * NİÇİN VAR
 * ---------
 * Ölçülen desen şuydu: `Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com'`
 * — üç ödeme ucunda birden. Hemen alt satırlarda `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` için
 * fail-CLOSED kontrol duruyordu (eksikse 500 CONFIG_ERROR). Yani **aynı dosyada, aynı
 * yapılandırma ailesi için iki farklı politika** yaşıyordu: anahtar eksikse duruyoruz,
 * hedef ORTAM eksikse sessizce başka bir ortama gidiyoruz.
 *
 * Tehlike sıralaması sezgiye aykırı: eksik anahtar GÜRÜLTÜLÜDÜR (istek düşer, biri görür),
 * eksik adres SESSİZDİR (istek başarılı olur, yanlış yere gider). Sessiz olan daha tehlikeli.
 *
 * Bu kusurun bir kere "onarıldığını" da not etmek gerekiyor: `iyzico-callback` içindeki
 * T022-VH yorumu tehlikeyi zaten adıyla anlatıyor ("para çekilir, sipariş doğrulanamaz").
 * O düzeltme sabit-kodlu sandbox'ı env'e taşımış ama **sandbox varsayılanını korumuştu**.
 * Sınıf kapanmamış, yalnızca yer değiştirmişti — kapı, tam da bunun tekrarını engelliyor.
 *
 * NE KİLİTLİYOR
 * -------------
 *  1. Hiçbir edge fonksiyonunda env okuması, mutlak bir http(s) ADRESİNE düşmez.
 *  2. `healthz` ölçemediği durumda yeşil dönemez (koşulsuz `ok: true` yasak).
 *  3. `healthz` `config.toml`'da BEYAN EDİLMİŞ olmalı (§3.7 — örtük değer diff'te görünmez).
 *
 * Cetvel: docs/standards/edge-function-security-standard.md §3.11
 */

const KOK = join(process.cwd(), 'supabase', 'functions')
const CONFIG_TOML = join(process.cwd(), 'supabase', 'config.toml')
const HEALTHZ = join(KOK, 'healthz', 'index.ts')

/**
 * Yorum sıyırıcı — `3d-csp.test.ts` ile AYNI şema-korumalı biçim. `(?<!:)` olmadan
 * `https://...` içindeki çift eğik çizgi yorum sanılır ve satırın YARISI silinir; o körlük
 * bu depoda daha önce iki bekçiyi birden kör etti. Alt sınır aşağıda ayrıca kilitleniyor.
 */
function yorumlariSiyir(kaynak: string): string {
  return kaynak.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/[^\n]*/g, '')
}

/** `supabase/functions` altındaki tüm gerçek kaynak dosyaları (test/doküman hariç). */
function tsDosyalari(dizin: string): string[] {
  const out: string[] = []
  for (const ad of readdirSync(dizin)) {
    const tam = join(dizin, ad)
    if (statSync(tam).isDirectory()) {
      if (ad === '__tests__' || ad === 'node_modules') continue
      out.push(...tsDosyalari(tam))
      continue
    }
    if (!ad.endsWith('.ts')) continue
    if (ad.endsWith('.test.ts') || ad.endsWith('.d.ts')) continue
    out.push(tam)
  }
  return out
}

/**
 * ORTAM DEĞİŞTİREN SESSİZ VARSAYILAN.
 *
 * Yalnız `Deno.env.get(...)` sonrası gelen `||` / `??` varsayılanı ve yalnız MUTLAK
 * http(s) adresleri yakalanır. Bu darlık kasıtlı: `|| ''` ya da `|| 0` gibi varsayılanlar
 * davranışı başka bir SUNUCUYA taşımaz, dolayısıyla bu kapının konusu değildir — geniş bir
 * kural yazıp gürültü üretmek, kapının okunmamasına yol açar.
 */
const SESSIZ_ADRES_VARSAYILANI =
  /Deno\.env\.get\(\s*['"][A-Z0-9_]+['"]\s*\)\s*(?:\|\||\?\?)\s*['"]https?:\/\/[^'"]*['"]/g

interface Ihlal {
  dosya: string
  satir: number
  metin: string
}

function ihlalleriTopla(): Ihlal[] {
  const ihlaller: Ihlal[] = []
  for (const tam of tsDosyalari(KOK)) {
    // CRLF normalize: satır numarası ve regex davranışı işletim sistemine bağlı olmamalı.
    const ham = readFileSync(tam, 'utf8').replace(/\r\n/g, '\n')
    const temiz = yorumlariSiyir(ham)
    temiz.split('\n').forEach((satirMetni, i) => {
      SESSIZ_ADRES_VARSAYILANI.lastIndex = 0
      if (SESSIZ_ADRES_VARSAYILANI.test(satirMetni)) {
        ihlaller.push({
          dosya: relative(process.cwd(), tam).replace(/\\/g, '/'),
          satir: i + 1,
          metin: satirMetni.trim(),
        })
      }
    })
  }
  return ihlaller
}

describe('INV-CONFIG-1 · yapilandirma bosugu sessizce davranis degistiremez', () => {
  it('hicbir edge fonksiyonu env okumasini mutlak bir ADRESE dusurmez', () => {
    const ihlaller = ihlalleriTopla()
    const rapor = ihlaller.map((i) => `  ${i.dosya}:${i.satir}  ${i.metin}`).join('\n')
    expect(
      ihlaller,
      'Ortam degistiren SESSIZ varsayilan bulundu. Yapilandirma eksikse dogru cevap ' +
        '"baska bir sey yap" degil, "yapma"dir: cozucuyu _shared/config_audit.ts uzerinden ' +
        'kur ve eksik degerde istegi adiyla dusur (CONFIG_ERROR).\n' +
        'Cetvel: docs/standards/edge-function-security-standard.md 3.11\n' +
        rapor,
    ).toEqual([])
  })

  it('healthz olcemedigi durumda YESIL donemez', () => {
    const temiz = yorumlariSiyir(readFileSync(HEALTHZ, 'utf8').replace(/\r\n/g, '\n'))
    // Kosulsuz `ok: true` YASAK. Eski hâlin tam kusuru buydu: DB'ye hic bakmadan saglikli
    // ilan ediyordu. `ok` artik yalniz bir HUKUMDEN turetilebilir.
    expect(
      /\bok:\s*true\b/.test(temiz),
      'healthz icinde kosulsuz "ok: true" var — olculemeyen bir sey saglikli ilan edilemez.',
    ).toBe(false)
    expect(
      temiz.includes('config_audit'),
      'healthz yapilandirma oz-denetimini cagirmiyor — pozitif denetim yoksa kapi yalniz DB olcer.',
    ).toBe(true)
  })

  it('healthz config.toml icinde BEYAN EDILMIS', () => {
    const toml = readFileSync(CONFIG_TOML, 'utf8')
    expect(
      toml.includes('[functions."healthz"]'),
      'healthz config.toml\'da yok — ortuk varsayilan diff\'te gorunmez (cetvel 3.7).',
    ).toBe(true)
  })

  /**
   * ALT SINIR — ARACIN KENDİSİ ÖLÇÜLÜR.
   *
   * Sıyırıcı körleşirse (ör. `(?<!:)` düşerse) yukarıdaki tarama sessizce hiçbir şey
   * bulamaz hâle gelir ve kapı YEŞİL yanar — ölçmediği hâlde. Bu testler o körlüğü
   * ÖNCE kırmızı yakar: biri deseni yakaladığını, diğeri yorumda kalanı yakalamadığını,
   * üçüncüsü URL şemasını yemediğini kanıtlar.
   */
  it('tarayici gercek deseni YAKALAR (yanlis-yesil sigortasi)', () => {
    const sabotaj = `const x = Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com'`
    SESSIZ_ADRES_VARSAYILANI.lastIndex = 0
    expect(SESSIZ_ADRES_VARSAYILANI.test(yorumlariSiyir(sabotaj))).toBe(true)
    // `??` biçimi de aynı kusurdur — `||` yazmaktan kaçınarak kapıdan geçilemez.
    const sabotaj2 = `const y = Deno.env.get("API_BASE") ?? "http://ornek.test/v1"`
    SESSIZ_ADRES_VARSAYILANI.lastIndex = 0
    expect(SESSIZ_ADRES_VARSAYILANI.test(yorumlariSiyir(sabotaj2))).toBe(true)
  })

  it('YORUMDAKI ayni desen ihlal SAYILMAZ', () => {
    const yorumda = `// eskiden Deno.env.get('IYZICO_BASE_URL') || 'https://sandbox-api.iyzipay.com' vardi`
    SESSIZ_ADRES_VARSAYILANI.lastIndex = 0
    expect(SESSIZ_ADRES_VARSAYILANI.test(yorumlariSiyir(yorumda))).toBe(false)
  })

  it('siyirici URL semasini YEMEZ', () => {
    // `https://` icindeki cift egik cizgi yorum sanilirsa satirin yarisi silinir ve
    // tarayici gercek ihlali kacirir. Bu depoda ayni korluk daha once yasandi.
    const kod = `const u = Deno.env.get('X') || 'https://ornek.test/yol'`
    expect(yorumlariSiyir(kod)).toContain('ornek.test/yol')
  })
})
