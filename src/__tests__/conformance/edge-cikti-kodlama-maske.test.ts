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
 *   K8 → (7) sağlayıcı/DB yanıt metni (`await x.text()`) maskesiz kullanılmaz (taban + ratchet)
 *   OPS-213 → (8) `log-client-error` gövde boyutu sınırlı, Slack yükü mrkdwn kaçışlı
 *   (G1 dedektörü OPS-213'te ayrıştırıcıya geçti: üçlü ifadenin iki dalı da taranır.)
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

/*
 * G1 dedektörü — şablon değişmezlerini AYRIŞTIRIR (satır regex'i değil).
 *
 * NİÇİN (güvenlik incelemesi 2026-11-03 takibi, OPS-213): eski kapı `${` sonrasını `[^}]*` ile
 * ilk `}`'ye kadar alıyor ve `^[\w.]+\s*\?\s*[`'"]` önekine bakıyordu. İki kör nokta vardı:
 *   (a) `${x ? `<p>${kacir(a)}</p>` : ad}` — yakalama içteki ilk `}`'de bitiyordu, `: ad` dalı hiç
 *       okunmuyordu; `${x ? 'a' : ad}` da önek eşleştiği için geçiyordu.
 *   (b) Çok satırlı üçlü ifadenin `${` satırında etiket yoksa ifade hiç taranmıyordu.
 * Şimdi her `${…}` ayraç sayılarak tümüyle okunur; üçlü ifadenin İKİ dalı da denetlenir.
 */

/** `s[i]` bir tırnak ise eşleşen kapanışın indeksi (şablonda `${…}` iç içeliği sayılır). */
function dizgeSonu(s: string, i: number): number {
  const q = s[i]
  for (let j = i + 1; j < s.length; j++) {
    if (s[j] === '\\') { j++; continue }
    if (q === '`' && s[j] === '$' && s[j + 1] === '{') { j = ayracSonu(s, j + 1); continue }
    if (s[j] === q) return j
  }
  return s.length - 1
}

/** `s[i] === '{'` için eşleşen `}` indeksi; aradaki dizge/şablonlar atlanır. */
function ayracSonu(s: string, i: number): number {
  let d = 0
  for (let j = i; j < s.length; j++) {
    const c = s[j]
    if (c === "'" || c === '"' || c === '`') { j = dizgeSonu(s, j); continue }
    if (c === '{') d++
    else if (c === '}' && --d === 0) return j
  }
  return s.length - 1
}

type Sablon = { bas: number; son: number }
type Interp = { bas: number; ifade: string }

/** Metindeki EN DIŞ şablon değişmezleri (dizge içindekiler değil; `${…}` içindekiler ayrıca bulunur). */
function sablonlar(s: string): Sablon[] {
  const out: Sablon[] = []
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === "'" || c === '"') { i = dizgeSonu(s, i); continue }
    if (c === '`') {
      const son = dizgeSonu(s, i)
      out.push({ bas: i, son })
      i = son
    }
  }
  return out
}

/** Bir şablon değişmezinin doğrudan `${…}` ifadeleri (iç içe şablonlarınki değil). */
function interplar(s: string, t: Sablon): Interp[] {
  const out: Interp[] = []
  for (let j = t.bas + 1; j < t.son; j++) {
    if (s[j] === '\\') { j++; continue }
    if (s[j] === '$' && s[j + 1] === '{') {
      const k = ayracSonu(s, j + 1)
      out.push({ bas: j, ifade: s.slice(j + 2, k) })
      j = k
    }
  }
  return out
}

/** En üst düzeyde `kosul ? a : b` ise üç parça; değilse null. `?.` ve `??` üçlü değildir. */
function ucluBol(e: string): [string, string, string] | null {
  let d = 0
  let soru = -1
  let ic = 0
  for (let i = 0; i < e.length; i++) {
    const c = e[i]
    if (c === "'" || c === '"' || c === '`') { i = dizgeSonu(e, i); continue }
    if ('([{'.includes(c)) d++
    else if (')]}'.includes(c)) d--
    else if (d === 0 && c === '?') {
      if (e[i + 1] === '.' || e[i + 1] === '?' || e[i - 1] === '?') { if (e[i + 1] === '?') i++; continue }
      if (soru < 0) soru = i
      else ic++
    } else if (d === 0 && c === ':' && soru >= 0) {
      if (ic > 0) { ic--; continue }
      return [e.slice(0, soru), e.slice(soru + 1, i), e.slice(i + 1)]
    }
  }
  return null
}

const HTML_ETIKETI = /<\/?[a-zA-Z][^>]*>?/

/** `kacir(…)` sonrası izinli tek ek: SABİT dizgeyle `.replace(/…/g, '<br>')` zinciri (notification-service). */
const KACIS_SONRASI_SERBEST = /^(?:\.replace\(\s*\/(?:[^/\\\n]|\\.)+\/[gimsuy]*\s*,\s*'[^'$]*'\s*\))*$/

/**
 * HTML bağlamındaki bir `${ifade}` güvenli mi. Güvenli biçimler:
 *   - tek bir `kacir(…)` çağrısı (çağrıdan sonra `+ ham` gibi ek YOK),
 *   - adı `…Html` ile biten değer (kaçışla KURULMUŞ hazır HTML parçası),
 *   - üçlü ifade: İKİ dal da güvenli (dizge değişmezi, içi güvenli şablon değişmezi ya da yine bu kurallar).
 */
function ifadeGuvenli(kod: string): boolean {
  const e = kod.trim()
  const k = /^kacir\s*\(/.exec(e)
  if (k) {
    let d = 0
    for (let i = k[0].length - 1; i < e.length; i++) {
      const c = e[i]
      if (c === "'" || c === '"' || c === '`') { i = dizgeSonu(e, i); continue }
      if (c === '(') d++
      else if (c === ')' && --d === 0) return KACIS_SONRASI_SERBEST.test(e.slice(i + 1).trim())
    }
    return false
  }
  if (/^\w+Html$/.test(e)) return true
  const uc = ucluBol(e)
  if (uc) return dalGuvenli(uc[1]) && dalGuvenli(uc[2])
  return false
}

function dalGuvenli(kod: string): boolean {
  const e = kod.trim()
  if (/^'[^']*'$|^"[^"]*"$/.test(e)) return true
  if (e.startsWith('`') && dizgeSonu(e, 0) === e.length - 1) {
    return interplar(e, { bas: 0, son: e.length - 1 }).every((x) => ifadeGuvenli(x.ifade))
  }
  return ifadeGuvenli(e)
}

/**
 * Kaynakta HTML bağlamında olup güvenli olmayan `${…}` listesi (`<satır>  ${<ifade başı>`).
 * HTML bağlamı: `${`'nin satırı etiket taşır YA DA ifadenin kendisi etiket taşır (çok satırlı koşul).
 * Bağlam dışı ifadelerin içindeki şablonlar da (ör. `.map(x => `<li>…`)`) kendi başına taranır.
 */
function hamInterplar(kod: string, sayac = { baglam: 0 }): string[] {
  const satirlar = kod.split('\n')
  const satirNo = (konum: number) => kod.slice(0, konum).split('\n').length
  const out: string[] = []
  const tara = (metin: string, kaydirma: number) => {
    for (const t of sablonlar(metin)) {
      for (const x of interplar(metin, t)) {
        const no = satirNo(kaydirma + x.bas)
        const baglam = HTML_ETIKETI.test(satirlar[no - 1] ?? '') || HTML_ETIKETI.test(x.ifade)
        if (baglam) {
          sayac.baglam++
          if (!ifadeGuvenli(x.ifade)) out.push(`${no}  \${${x.ifade.trim().replace(/\s+/g, ' ').slice(0, 40)}`)
        } else {
          tara(x.ifade, kaydirma + x.bas + 2)
        }
      }
    }
  }
  tara(kod, 0)
  return out
}

describe('INV-CIKTI-KODLAMA-1 · G1 e-posta HTML kaçışı', () => {
  it('⭐karne kilidi: e-posta HTML satırlarında ham `${…}` interpolasyonu yok (taban boş)', () => {
    const ihlal: string[] = []
    for (const d of EPOSTA_EVRENI) for (const h of hamInterplar(d.kod)) ihlal.push(`${d.ad}:${h}`)
    expect(
      ihlal,
      'E-posta HTML satirinda kacissiz deger var. `kacir(…)` ile sar ya da sablon motorundan ' +
        '(`_shared/kodlama.ts` renderTemplate) gecir.\n  ' + ihlal.join('\n  '),
    ).toEqual([])
  })

  it('dedektör çalışıyor: üçlü ifadenin her iki dalı da taranır (sabotaj kolları, OPS-213)', () => {
    const ham = (s: string) => hamInterplar(s).length
    // Güvenli biçimler.
    expect(ham('const h = `<p>${kacir(ad)}</p>`')).toBe(0)
    expect(ham("const h = `<p>${x ? `<b>${kacir(ad)}</b>` : ''}</p>`")).toBe(0)
    expect(ham("const h = `<p>${x ? 'evet' : \"hayir\"}</p>`")).toBe(0)
    expect(ham('const h = `<ul>${satirHtml}</ul>`')).toBe(0)
    expect(ham("const h = `<p>${a ? kacir(a) : b ? kacir(b) : '-'}</p>`")).toBe(0)
    expect(ham("const h = `<p>${o?.x ?? '' ? 'a' : 'b'}</p>`")).toBe(0)
    // SABOTAJ: eski kapının geçirdiği her biçim artık kırmızı.
    expect(ham("const h = `<p>${x ? 'a' : ad}</p>`"), 'else dalı ham').toBe(1)
    expect(ham('const h = `<p>${x ? `<b>a</b>` : ad}</p>`'), 'şablon dallı, else ham').toBe(1)
    expect(ham("const h = `<p>${x ? `<b>${ad}</b>` : ''}</p>`"), 'iç şablonda ham').toBe(1)
    expect(ham("const h = `<p>${a ? kacir(a) : b ? b : '-'}</p>`"), 'iç içe üçlüde ham').toBe(1)
    expect(ham("const h = `<p>${kacir(m).replace(/\\n/g, '<br>')}</p>`")).toBe(0)
    expect(ham('const h = `<p>${kacir(a) + ad}</p>`'), 'kacir sonrası ek').toBe(1)
    expect(ham("const h = `<p>${kacir(a).replace(/x/g, ad)}</p>`"), 'kacir sonrası ham replace').toBe(1)
    expect(ham('const h = `<p>${ad}</p>`'), 'düz ham').toBe(1)
    // Çok satırlı: `${` satırında etiket yok, else dalı ham.
    expect(ham("const h = `\n  ${notlar ? `\n  <div>${kacir(notlar)}</div>\n  ` : ad}\n`"), 'çok satırlı').toBe(1)
    // Bağlam dışı ifadenin içindeki şablon da taranır.
    expect(ham("const h = `\n  ${liste.map((x) => `<li>${x.ad}</li>`).join('')}\n`"), 'map içi ham').toBe(1)
  })

  it('dedektör kör değil: evrende HTML bağlamlı `${…}` gerçekten bulunuyor', () => {
    const sayac = { baglam: 0 }
    for (const d of EPOSTA_EVRENI) hamInterplar(d.kod, sayac)
    expect(sayac.baglam, 'Ayristirici sablon bulamiyor — kapi olcmuyor.').toBeGreaterThan(50)
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

// ---------------------------------------------------------------- (7) K8 — sağlayıcı/DB hata metni

/**
 * `const v = await x.text()` ile okunan DIŞ yanıt metni (Resend, Twilio, İyzico, PostgREST) serbest
 * metindir: alıcı adresi, telefon ya da satır değeri yankılanabilir. Değişkenin her kullanımı
 * `metniMaskele(v…)` içinde olmalı; tek istisna ham metinden SINIFLANDIRMA (`v.toLowerCase()`,
 * `v.includes(…)`) — sonuç dışarı çıkmaz. İstek gövdesi (`req.text()`) ölçüt dışıdır.
 * Güvenlik incelemesi 2026-11-03 takibi (OPS-213): `return-status-notification` ve
 * `shipping-notification` Resend metnini log, Sentry, yanıt ve denetim kaydına maskesiz koyuyordu.
 */
function maskesizSaglayiciMetni(kod: string): string[] {
  const out: string[] = []
  for (const m of kod.matchAll(/const\s+(\w+)\s*=\s*(metniMaskele\(\s*)?await\s+(\w+)\.text\(\)/g)) {
    const [, ad, sarili, kaynak] = m
    if (sarili || /^(req|request)$/.test(kaynak)) continue
    const bildirimSonu = (m.index ?? 0) + m[0].length
    // Kapsam yaklaşığı: aynı adın bir sonraki bildirimine kadar (başka bloktaki `const detail` ayrı değişkendir).
    const kalan = kod.slice(bildirimSonu)
    const yeniden = new RegExp(`\\b(?:const|let)\\s+${ad}\\b`).exec(kalan)
    const kapsam = yeniden ? kalan.slice(0, yeniden.index) : kalan
    const kullanimlar = [...kapsam.matchAll(new RegExp(`\\b${ad}\\b`, 'g'))]
    const ham = kullanimlar.filter((u) => {
      const konum = bildirimSonu + (u.index ?? 0)
      const once = kod.slice(Math.max(0, konum - 20), konum)
      const sonra = kod.slice(konum + ad.length, konum + ad.length + 14)
      if (/(metniMaskele|\.test)\(\s*$/.test(once)) return false // maskeli ya da regex sınıflandırması
      if (/(JSON\.parse|\b\w+M[iıuü])\(\s*$/.test(once)) return false // başarılı gövdeyi ayrıştırma, `…Mi(` yüklemi
      if (/^\.(toLowerCase\(\)|includes\()/.test(sonra)) return false // sınıflandırma
      if (/^\s*:(?!:)/.test(sonra) && /[{,]\s*$/.test(once)) return false // nesne ANAHTARI (`detail: …`)
      return true
    })
    if (ham.length > 0 || kullanimlar.length === 0) out.push(`${kod.slice(0, m.index).split('\n').length}: ${ad}`)
  }
  return out
}

/**
 * TABAN (ratchet): sağlayıcı/DB yanıt metnini bugün maskesiz kullanan, bu işin (OPS-213) DIŞINDA
 * kalan dosyalar. Liste yalnız KÜÇÜLÜR; yeni bir dosya eklenemez.
 */
const K8_TABANI = new Set<string>([
  // DOKUNULMADI: ödeme durum makinesi PR'ı (karne kök 1) bu dosyada çalışıyor; RPC hata metni loga gidiyor.
  'supabase/functions/iyzico-callback/index.ts',
])

describe('INV-CIKTI-KODLAMA-1 · K8 sağlayıcı/DB hata metni maskeli', () => {
  it('dedektör çalışıyor: ham kullanımı yakalar, maskeli ve sınıflandırma kullanımını geçirir (sabotaj kolları)', () => {
    const ham = (s: string) => maskesizSaglayiciMetni(s).length
    expect(ham("const t = await resp.text()\nthrow new Error(`x ${metniMaskele(t, 500)}`)")).toBe(0)
    expect(ham("const t = metniMaskele(await resp.text().catch(() => ''), 500)\nthrow new Error(t)")).toBe(0)
    expect(ham("const h = await resp.text()\nconst r = h.toLowerCase().includes('domain')\nconst t = metniMaskele(h, 500)")).toBe(0)
    expect(ham('const raw = await req.text()\nJSON.parse(raw)')).toBe(0)
    // SABOTAJ: #2215 sonrası kalan biçimler.
    expect(ham('const errorText = await r.text()\nthrow new Error(`Email failed: ${errorText}`)'), 'throw').toBe(1)
    expect(ham("const t = await r.text()\nconsole.error('x', metniMaskele(t, 9))\nlog({ e: t.slice(0, 500) })"), 'denetim').toBe(1)
    expect(ham('const t = await r.text()'), 'okunup kullanılmayan da şüpheli').toBe(1)
  })

  it('⭐OPS-213: return-status-notification, shipping-notification, iyzico-payment temiz', () => {
    for (const islev of ['return-status-notification', 'shipping-notification', 'iyzico-payment']) {
      expect(maskesizSaglayiciMetni(islevKodu(islev)), `${islev}: saglayici metni maskesiz`).toEqual([])
    }
  })

  it('ratchet: tabanda olmayan hiçbir dosya sağlayıcı metnini maskesiz kullanmaz', () => {
    const bulunan = DOSYALAR.map((d) => ({ ad: d.ad, isabet: maskesizSaglayiciMetni(d.kod) }))
      .filter((x) => x.isabet.length > 0)
    const ihlal = bulunan.filter((x) => !K8_TABANI.has(x.ad)).map((x) => `${x.ad}  ${x.isabet.join(', ')}`)
    expect(ihlal, 'Saglayici/DB hata metni maskesiz: metniMaskele(v, N) ile sar.\n  ' + ihlal.join('\n  ')).toEqual([])
    const bayat = [...K8_TABANI].filter((ad) => !bulunan.some((x) => x.ad === ad))
    expect(bayat, 'Duzelen dosyayi K8_TABANI listesinden sil.').toEqual([])
  })

  it('iyzico-payment geniş catch ve Slack alanları maskeli (OPS-213 madde 3)', () => {
    const kod = islevKodu('iyzico-payment')
    const kritik = cagrilar(kod, /console\.error\(\s*'Critical Error:'/g)
    expect(kritik.length).toBe(1)
    expect(kritik[0].metin).toMatch(/metniMaskele\(/)
    expect(kodKismi(kritik[0].metin)).not.toMatch(/,\s*error\s*$/)
    const slack = cagrilar(kod, /slackNotify\(/g)
    expect(slack.length).toBeGreaterThanOrEqual(3)
    for (const c of slack) {
      const g = kodKismi(c.metin)
      expect(g, `slackNotify satir ${c.satir}: ham hata metni`).not.toMatch(/\.message\b|errorMessage|String\(\s*(_?e|err|error)\s*\)/)
    }
    expect(kod).toMatch(/const errMsg = metniMaskele\(/)
    expect(kod).toMatch(/const iyzicoHata = metniMaskele\(/)
  })

  it('Sentry olay mesajı merkezde maskelenir (`_shared/sentry.ts`)', () => {
    const kod = DOSYALAR.find((d) => d.ad === 'supabase/functions/_shared/sentry.ts')?.kod ?? ''
    expect(kod).toMatch(/import \{ metniMaskele \} from '\.\/maske\.ts'/)
    expect(kod.match(/metniMaskele\(/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
  })
})

// ---------------------------------------------------------------- (8) OPS-213 — gövde sınırı ve Slack kaçışı

describe('INV-CIKTI-KODLAMA-1 · gövde boyutu ve Slack mrkdwn', () => {
  it('log-client-error gövdeyi yalnız `govdeyiSinirliOku` ile okur (sınırsız `req.json()` / `req.text()` yok)', () => {
    const kod = islevKodu('log-client-error')
    expect(kod).toMatch(/import \{ govdeyiSinirliOku \} from '\.\.\/_shared\/govde_siniri\.ts'/)
    expect(kod).toMatch(/govdeyiSinirliOku\(req,\s*GOVDE_SINIRI_BAYT\)/)
    expect(kod).toMatch(/const GOVDE_SINIRI_BAYT = \d+ \* 1024/)
    expect(kod).not.toMatch(/\breq\.(json|text|arrayBuffer|formData)\(/)
    expect(kod).toMatch(/status: buyuk \? 413 : 400/)
  })

  it('notify: Slack yükündeki metin, alan başlığı ve değeri `slackKacir`dan geçer', () => {
    const kod = DOSYALAR.find((d) => d.ad === 'supabase/functions/_shared/notify.ts')?.kod ?? ''
    const slack = kod.slice(kod.indexOf('async function sendSlack'), kod.indexOf('async function sendEmail'))
    expect(slack.length, 'sendSlack bulunamadi').toBeGreaterThan(50)
    expect(slack).toMatch(/\{\s*text:\s*slackKacir\(text\)\s*\}/)
    expect(slack).toMatch(/title:\s*slackKacir\(f\.title\)/)
    expect(slack).toMatch(/value:\s*slackKacir\(f\.value\)/)
    expect(slack).not.toMatch(/String\(f\.(title|value)\)/)
  })
})
