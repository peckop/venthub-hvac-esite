import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CIKTI-KODLAMA-1 · Edge çıktısı ortak kodlama/maskeleme yardımcısından geçer.
 *
 * Kaynak: `docs/audits/guvenlik-karnesi-2026-11.md` §2 kök 3 ve §9 madde 3. Güvenilmeyen metin
 * (müşteri adı, iade sebebi, istemci hata mesajı) ortak bir kodlama/maskeleme yardımcısından
 * geçmeden HTML e-postaya, loga, Slack'e ve yanıt gövdesine gidiyordu. Yardımcılar:
 * `supabase/functions/_shared/kodlama.ts` (kaçış + şablon motoru) ve `_shared/maske.ts`
 * (e-posta/telefon/ad maskesi, hata ayıklama bayrağı). Davranışları
 * `supabase/functions/_shared/__tests__/kodlama_maske.test.ts` kilitler; bu dosya UÇLARIN
 * onlardan geçtiğini ölçer.
 *
 * Kapatılan bulgular ve kolları:
 *   G1 → (1) e-posta HTML'inde ham `${…}` yok · (2) motor ve kaçış tek yerde
 *   S1 → (3) hata ayıklama bayrağı yalnız ortamdan, sır karakteri loga girmez, ad/soyad maskeli
 *   S2 → (4) `console.*` içinde alıcı değişkeni maskesiz yok
 *   S4, S5 → (5) iç hata metni yanıt gövdesine dönmez (taban + ratchet)
 *   S6 → (6) `log-client-error` istemci alanlarını maskeden geçirir
 *
 * Cetvel: `docs/standards/cikti-kodlama-maske-standard.md`.
 */

const KOK = process.cwd()
const FN = join(KOK, 'supabase', 'functions')

function tsDosyalari(dizin: string): string[] {
  const out: string[] = []
  for (const ad of readdirSync(dizin)) {
    const yol = join(dizin, ad)
    if (statSync(yol).isDirectory()) {
      if (ad === '__tests__' || ad === 'node_modules') continue
      out.push(...tsDosyalari(yol))
    } else if (ad.endsWith('.ts')) out.push(yol)
  }
  return out
}

/**
 * Yorum ANLATIR, kural UYGULAR: blok yorumlar ve tam satır `//` yorumları ölçüt dışıdır.
 * Silinen metindeki satır sonları korunur (`^\s*` boş satırları da yutar) — ihlal mesajındaki
 * satır numarası dosyadakiyle aynı kalsın.
 */
const satirSonlari = (m: string) => m.replace(/[^\n]/g, '')
const govde = (k: string) =>
  k.replace(/\/\*[\s\S]*?\*\//g, satirSonlari).replace(/^\s*\/\/.*$/gm, satirSonlari)

const rel = (p: string) => relative(KOK, p).replace(/\\/g, '/')

const DOSYALAR = tsDosyalari(FN).map((yol) => ({ yol, ad: rel(yol), kod: govde(readFileSync(yol, 'utf8')) }))
const islevKodu = (islev: string) => {
  const d = DOSYALAR.find((x) => x.ad === `supabase/functions/${islev}/index.ts`)
  if (!d) throw new Error(`${islev}/index.ts bulunamadi`)
  return d.kod
}

/** `bas` konumundaki açılış parantezinden eşleşen kapanışa kadar olan metin. */
function parantezIci(kod: string, acilis: number): string {
  let d = 0
  for (let i = acilis; i < kod.length; i++) {
    if (kod[i] === '(') d++
    else if (kod[i] === ')') {
      d--
      if (d === 0) return kod.slice(acilis + 1, i)
    }
  }
  return kod.slice(acilis + 1)
}

/** Çağrı metnindeki KOD kısmı: tek/çift tırnaklı dizgeler silinir, şablon değişmezinden yalnız `${…}` kalır. */
function kodKismi(s: string): string {
  let out = ''
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === "'" || c === '"') {
      const j = s.indexOf(c, i + 1)
      i = j < 0 ? s.length : j + 1
      continue
    }
    if (c === '`') {
      i++
      while (i < s.length && s[i] !== '`') {
        if (s[i] === '\\') { i += 2; continue }
        if (s[i] === '$' && s[i + 1] === '{') {
          let d = 1
          let j = i + 2
          for (; j < s.length && d > 0; j++) {
            if (s[j] === '{') d++
            else if (s[j] === '}') d--
          }
          out += ' ' + s.slice(i + 2, j - 1) + ' '
          i = j
          continue
        }
        i++
      }
      i++
      continue
    }
    out += c
    i++
  }
  return out
}

function cagrilar(kod: string, desen: RegExp): Array<{ satir: number; metin: string }> {
  const out: Array<{ satir: number; metin: string }> = []
  for (const m of kod.matchAll(desen)) {
    const acilis = (m.index ?? 0) + m[0].length - 1
    out.push({ satir: kod.slice(0, m.index).split('\n').length, metin: parantezIci(kod, acilis) })
  }
  return out
}

// ---------------------------------------------------------------- (1)(2) G1 — e-posta HTML'i

/** E-posta HTML gövdesi kuran dosyalar: `html` adı + HTML etiketi taşıyan şablon değişmezi. */
const EPOSTA_EVRENI = DOSYALAR.filter(
  (d) =>
    !d.ad.startsWith('supabase/functions/_shared/') &&
    /\bhtml\b/.test(d.kod) &&
    /`[^`]*<(p|div|h2|li|strong)\b/.test(d.kod) &&
    !d.ad.startsWith('supabase/functions/iyzico-callback/'),
)

/** `${…}` HTML satırında güvenli sayılan biçimler. */
const GUVENLI_INTERP = [
  /^kacir\(/, // ortak kaçış
  // Koşul: `${x ? `…` : ''}` — dal şablon değişmezi ya da dizge olmalı (içteki `${…}` ayrıca taranır);
  // `${ad ? ad : ''}` gibi ham değer döndüren üçlü ifade güvenli SAYILMAZ.
  /^[\w.]+\s*\?\s*[`'"]/,
  /^\w+Html\s*$/, // adı `…Html` ile biten değer: kaçışla KURULMUŞ hazır HTML parçası
]

describe('INV-CIKTI-KODLAMA-1 · G1 e-posta HTML kaçışı', () => {
  it('⭐karne kilidi: e-posta HTML satırlarında ham `${…}` interpolasyonu yok (taban boş)', () => {
    const ihlal: string[] = []
    for (const d of EPOSTA_EVRENI) {
      d.kod.split('\n').forEach((satir, i) => {
        if (!/<\/?[a-zA-Z][^>]*>?/.test(satir)) return
        for (const m of satir.matchAll(/\$\{\s*([^}]*)/g)) {
          if (GUVENLI_INTERP.some((r) => r.test(m[1]))) continue
          ihlal.push(`${d.ad}:${i + 1}  \${${m[1].slice(0, 40)}`)
        }
      })
    }
    expect(
      ihlal,
      'E-posta HTML satirinda kacissiz deger var. `kacir(…)` ile sar ya da sablon motorundan ' +
        '(`_shared/kodlama.ts` renderTemplate) gecir.\n  ' + ihlal.join('\n  '),
    ).toEqual([])
  })

  it('evren kör değil: yedi e-posta dosyası ölçülüyor', () => {
    expect(EPOSTA_EVRENI.map((d) => d.ad).sort()).toEqual([
      'supabase/functions/delivery-notification/index.ts',
      'supabase/functions/notification-service/index.ts',
      'supabase/functions/order-confirmation/index.ts',
      'supabase/functions/quote-notification-webhook/ic_bildirim.ts',
      'supabase/functions/quote-notification-webhook/index.ts',
      'supabase/functions/return-status-notification/index.ts',
      'supabase/functions/shipping-notification/index.ts',
    ])
  })

  it('motor ve kaçış TEK yerde: `_shared/kodlama.ts` dışında renderTemplate/kacir tanımı yok', () => {
    const tanimlar = DOSYALAR.filter((d) => d.ad !== 'supabase/functions/_shared/kodlama.ts')
      .filter((d) => /function\s+renderTemplate\b|(const|let|function)\s+kacir\b/.test(d.kod))
      .map((d) => d.ad)
    expect(tanimlar, 'Elle yazilmis kopya motor/kacis: _shared/kodlama.ts kullan.').toEqual([])
    for (const islev of ['order-confirmation', 'shipping-notification', 'delivery-notification']) {
      expect(islevKodu(islev), `${islev}: renderTemplate _shared/kodlama.ts'ten gelmiyor`).toMatch(
        /import\s*\{[^}]*\brenderTemplate\b[^}]*\}\s*from\s*'\.\.\/_shared\/kodlama\.ts'/,
      )
    }
  })

  it('CSS bağlamındaki marka rengi `guvenliRenk` süzgecinden geçer', () => {
    for (const islev of ['order-confirmation', 'shipping-notification', 'delivery-notification', 'return-status-notification']) {
      expect(islevKodu(islev), `${islev}: brandPrimary süzülmüyor`).toMatch(
        /const brandPrimary = guvenliRenk\(branding\.brandPrimaryColor\)/,
      )
    }
  })

  it('href/src alanları `guvenliUrl` süzgecinden geçer', () => {
    expect(islevKodu('shipping-notification')).toMatch(/tracking_url:\s*guvenliUrl\(/)
    for (const islev of ['order-confirmation', 'shipping-notification']) {
      expect(islevKodu(islev), `${islev}: brand_logo_url süzülmüyor`).toMatch(/brand_logo_url:\s*guvenliUrl\(/)
    }
  })
})

// ---------------------------------------------------------------- (3) S1 — hata ayıklama bayrağı

describe('INV-CIKTI-KODLAMA-1 · S1 hata ayıklama bayrağı ve sır logu', () => {
  it('⭐karne kilidi: hiçbir uç bayrağı istekten okumaz (`x-debug`, `?debug=`)', () => {
    const ihlal = DOSYALAR.filter((d) =>
      /headers\.get\(\s*['"]x-debug['"]|searchParams\.get\(\s*['"]debug['"]/i.test(d.kod),
    ).map((d) => d.ad)
    expect(ihlal).toEqual([])
  })

  it('iyzico-payment bayrağı yalnız `hataAyiklamaAcik(Deno.env.get(…))` ile kurar', () => {
    const kod = islevKodu('iyzico-payment')
    const atamalar = [...kod.matchAll(/debugEnabled\s*=(?!=)\s*([^;\n]+)/g)].map((m) => m[1].trim())
    expect(atamalar.length).toBeGreaterThan(0)
    for (const a of atamalar) {
      expect(a === 'false' || /^hataAyiklamaAcik\(Deno\.env\.get\(\s*'IYZICO_DEBUG'\s*\)\)$/.test(a), a).toBe(true)
    }
  })

  it('sır değişkenleri loga yalnız `sirDurumu(…)` ile girer (karakter dilimi yok)', () => {
    const SIR = /\b\w*(ApiKey|SecretKey|serviceKey|serviceRoleKey|SERVICE_ROLE_KEY|_SECRET)\b/
    const ihlal: string[] = []
    for (const d of DOSYALAR) {
      for (const c of cagrilar(d.kod, /console\.(log|warn|error|info|debug)\(/g)) {
        const kod = kodKismi(c.metin).replace(/sirDurumu\([^)]*\)/g, '')
        if (SIR.test(kod)) ihlal.push(`${d.ad}:${c.satir}`)
      }
    }
    expect(ihlal).toEqual([])
  })

  it('iyzico-payment hata ayıklama dökümünde ad/soyad, e-posta, telefon maskeli', () => {
    const kod = islevKodu('iyzico-payment')
    const m = kod.match(/const adresMaskele = [\s\S]*?\n {8}\}\);/)
    expect(m, 'adresMaskele + sanitize bulunamadi').not.toBeNull()
    const s = (m as RegExpMatchArray)[0]
    expect(s).toMatch(/shippingAddress:\s*adresMaskele\(/)
    expect(s).toMatch(/billingAddress:\s*adresMaskele\(/)
    expect(s).toMatch(/name:\s*maskAd\(/)
    expect(s).toMatch(/surname:\s*maskAd\(/)
    expect(s).toMatch(/email:\s*maskEposta\(/)
    expect(s).toMatch(/gsmNumber:\s*maskTelefon\(/)
    expect(s).toMatch(/contactName:\s*maskAd\(/)
  })
})

// ---------------------------------------------------------------- (4) S2 — alıcı logu

const ALICI = /\b(customer_email|customerEmail|email|toList|to|recipient|recipients|phone|customer_phone|gsmNumber|customer_name|contactEmail|contactPhone|contact_email|contact_phone)\b/

describe('INV-CIKTI-KODLAMA-1 · S2 log satırında kişisel veri', () => {
  it('⭐karne kilidi: `console.*` çağrılarında alıcı değişkeni yalnız `mask*(…)` içinde (taban boş)', () => {
    const ihlal: string[] = []
    for (const d of DOSYALAR) {
      for (const c of cagrilar(d.kod, /console\.(log|warn|error|info|debug)\(/g)) {
        let kod = kodKismi(c.metin)
        // mask*( … ) içi temizlenir — maskeli değer serbest.
        let onceki = ''
        while (onceki !== kod) {
          onceki = kod
          kod = kod.replace(/\b(mask\w*|metniMaskele|nesneyiMaskele)\([^()]*\)/g, ' ')
        }
        // Nesne anahtarı (`{ to: … }`) değil, değer olarak kullanılan değişken aranır.
        const m = kod.replace(/\b\w+\s*:/g, ' ').match(ALICI)
        if (m) ihlal.push(`${d.ad}:${c.satir}  ${m[0]}`)
      }
    }
    expect(ihlal, 'Alici degiskeni maskesiz loglaniyor; _shared/maske.ts kullan.\n  ' + ihlal.join('\n  ')).toEqual([])
  })
})

// ---------------------------------------------------------------- (5) S4, S5 — hata gövdesi

/** Yanıt gövdesinde iç hata metni taşıyan `new Response(JSON.stringify(…))` satırları. */
function hataSizanYanitlar(kod: string): number[] {
  // `.message`'tan türetilen değişken (`const msg = e.message`). Kapsam ölçülmez; yaklaşık olarak
  // yalnız yanıttan ÖNCE tanımlananlar sayılır (aynı adın sonraki başka kapsamda kullanımı yanlış
  // pozitif veriyordu: iyzico-payment `metaFail(msg)` ↔ 300 satır aşağıdaki `const msg`).
  const kirli: Array<{ ad: string; konum: number }> = []
  for (const m of kod.matchAll(/(?:const|let)\s+(\w+)\s*(?::[^=]+)?=([^\n]*\.message\b[^\n]*)/g)) {
    kirli.push({ ad: m[1], konum: m.index ?? 0 })
  }
  const out: number[] = []
  for (const m of kod.matchAll(/new Response\(\s*JSON\.stringify\(/g)) {
    const konum = m.index ?? 0
    const metin = parantezIci(kod, konum + m[0].length - 1)
    // Dizge içeriği ve nesne ANAHTARLARI (`message: 'Sabit metin'`) ölçüt dışı; değerler ölçülür.
    const g = kodKismi(metin).replace(/\b\w+\s*:/g, ' ')
    if (
      /\.message\b/.test(g) ||
      /String\(\s*(_?e|err|error|_err|_error)\s*\)/.test(g) ||
      kirli.some((v) => v.konum < konum && new RegExp(`\\b${v.ad}\\b`).test(g))
    ) out.push(kod.slice(0, konum).split('\n').length)
  }
  return out
}

/**
 * TABAN (ratchet): iç hata metnini bugün yanıta koyan, bu işin DIŞINDA kalan uçlar. Liste yalnız
 * KÜÇÜLÜR; yeni bir uç eklenemez. Hepsi admin/service_role çağıranlı (S5'in "oturumlu müşteri"
 * sınıfında değil) ya da başka PR'ın dosyası.
 */
const HATA_GOVDESI_TABANI = new Set([
  'admin-create-coupon',
  'admin-iyzico-reconcile',
  'admin-order-inspect',
  'admin-orders-latest', // verify_jwt=false ama yanıt admin kapısının arkasında; edge yetki işi (karne kök 2)
  'admin-update-order',
  'admin-update-shipping',
  'apply-coupon',
  'delivery-notification',
  'iyzico-callback', // S4'ün kalan kolu: P1 durum makinesi PR'ında (bu iş dokunmadı)
  'notification-service',
  'order-confirmation',
  'order-housekeeping',
  'order-validate',
  'return-status-notification',
  'shipping-notification',
  'stock-alert',
])

const config = readFileSync(join(KOK, 'supabase', 'config.toml'), 'utf8')
const JWTSIZ = [...config.matchAll(/\[functions\."?([\w-]+)"?\]\s*\n\s*verify_jwt\s*=\s*false/g)].map((m) => m[1])

describe('INV-CIKTI-KODLAMA-1 · S4/S5 iç hata metni yanıt gövdesinde', () => {
  it('⭐karne kilidi: tcmb-rates-sync, iyzico-payment, log-client-error yanıtında `.message` yok', () => {
    for (const islev of ['tcmb-rates-sync', 'iyzico-payment', 'log-client-error']) {
      expect(hataSizanYanitlar(islevKodu(islev)), `${islev}: yanit govdesinde ic hata metni`).toEqual([])
    }
    // tcmb: yanıttaki `errors` dizisine DB hata metni eklenmez.
    expect(islevKodu('tcmb-rates-sync')).not.toMatch(/errors\.push\([^)]*\.message/)
  })

  it('verify_jwt=false uçlarda yanıt gövdesinde iç hata metni yok (tabandakiler hariç)', () => {
    expect(JWTSIZ.length, 'config.toml ayristirilamadi').toBeGreaterThan(5)
    const ihlal = JWTSIZ.filter((f) => !HATA_GOVDESI_TABANI.has(f))
      .filter((f) => DOSYALAR.some((d) => d.ad === `supabase/functions/${f}/index.ts`))
      .filter((f) => hataSizanYanitlar(islevKodu(f)).length > 0)
    expect(ihlal).toEqual([])
  })

  it('ratchet: tabanda olmayan hiçbir uç iç hata metnini yanıta koymaz', () => {
    const ihlal = DOSYALAR.filter((d) => /\/index\.ts$/.test(d.ad))
      .map((d) => ({ islev: d.ad.split('/')[2], satirlar: hataSizanYanitlar(d.kod) }))
      .filter((x) => x.satirlar.length > 0 && !HATA_GOVDESI_TABANI.has(x.islev))
      .map((x) => `${x.islev}: ${x.satirlar.join(',')}`)
    expect(ihlal, 'Yeni uc ic hata metnini yanita koyuyor: sabit hata kodu don, ayrintiyi logla.').toEqual([])
  })
})

// ---------------------------------------------------------------- (6) S6 — log-client-error

describe('INV-CIKTI-KODLAMA-1 · S6 log-client-error maskesi', () => {
  const kod = islevKodu('log-client-error')

  it('⭐karne kilidi: istemci alanlarının HER kullanımı maskeden geçer (Slack, DB, extra)', () => {
    const kullanimlar = [...kod.matchAll(/payload\.(\w+)/g)]
    expect(kullanimlar.length, 'payload kullanimi bulunamadi').toBeGreaterThan(5)
    const ihlal = kullanimlar
      .filter((m) => !/(metniMaskele|nesneyiMaskele)\((String\()?$/.test(kod.slice(Math.max(0, (m.index ?? 0) - 40), m.index)))
      .map((m) => m[0])
    expect(ihlal).toEqual([])
    expect(kod).toMatch(/extra:\s*nesneyiMaskele\(/)
  })

  it('yerel `mask` kopyası kalmadı; Slack çağrılarında ham `payload` yok', () => {
    expect(kod).not.toMatch(/const\s+mask\s*=/)
    for (const c of cagrilar(kod, /slackNotify\(/g)) expect(c.metin).not.toMatch(/payload\./)
  })
})
