import { describe, expect, it } from 'vitest'

/**
 * INV-CSP-1 · CSP origin kapsaması (kalıcı bekçi) — cetvel: `docs/standards/csp-standard.md`.
 *
 * KORUDUĞU KUSUR SINIFI: kod bir dış origin'e bağımlı hâle gelir, CSP güncellenmez. Bugün
 * politika `Content-Security-Policy-Report-Only` olduğu için hiçbir şey kırılmaz — kusur
 * GÖRÜNMEZ. Enforce'a geçildiği gün o özellik sessizce ölür ve sebebi görünmez; üstelik
 * kodu yazan ile CSP'yi enforce'a alan kişi FARKLI zamanlarda çalıştığı için bağlantı
 * hiç kurulamaz. `analytics-standard.md` bu tuzağı GA/GTM için adıyla yazmıştı (satır 86-92)
 * ama bir kontrol listesi maddesi zaman farkına dayanmaz; bekçi dayanır.
 *
 * tsc/lint/build bunu GÖRMEZ: CSP bir runtime header'ıdır, statik tip değil.
 *
 * KARDEŞ BEKÇİ: `3d-csp.test.ts` (INV-3D-5) yalnız `connect-src` + 3D asset CDN'lerini
 * korur (CLAUDE.md #9 stale-guard). Bu dosya diğer direktifleri (script/style/frame) ve
 * genel kullanım sınıflarını kapsar. İkisi bilerek ayrıdır; birleştirme.
 *
 * TARAMANIN KAPSAMI — ölçmediğim sınıfı adıyla yazıyorum (cetvel §4):
 *  KAPSAR   : literal URL taşıyan `<Script src>` / `<script src>` / `<iframe src>` /
 *             `fetch(...)` / CSS `@import url(...)` çağrıları, `src/**` altında.
 *  KAPSAMAZ : origin'i çalışma anında değişkenden/env'den kuran çağrılar
 *             (`fetch(base + path)`), `next/image` uzak host'ları (`images.remotePatterns`
 *             ayrı yönetilir, img-src zaten `https:`), üçüncü-parti script'in KENDİ
 *             yaptığı alt-istekler (ör. GTM'in google-analytics'e gönderdiği olay — bunlar
 *             kaynakta hiç görünmez, cetvelden elle girilir), `supabase/functions/**`
 *             (Deno, sunucu tarafı — CSP tarayıcıya bakar).
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const SOURCES: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

// TAM literal yol şart: `/next.config.*` Orion'un ürettiği `next.config.md` companion'ını da
// yakalar ve yanlış dosyayı ölçtürür (INV-3D-5 aynı tuzağı belgeliyor).
const CONFIG_FILES: Record<string, string> = import.meta.glob('/next.config.mjs', {
  query: '?raw',
  import: 'default',
  eager: true,
})
const CONFIG: string = CONFIG_FILES['/next.config.mjs'] ?? ''

/* ------------------------------- CSP ayrıştırma ------------------------------- */

/** CSP header değerini direktif → kaynak listesi haritasına çevirir. */
function parseCsp(config: string): Record<string, string[]> {
  // Header value'yu tek tırnaklı JS string literalinden çek (Report-Only VEYA enforce).
  const m = config.match(
    /key:\s*'Content-Security-Policy(?:-Report-Only)?'[\s\S]{0,400}?value:\s*"([^"]+)"/,
  )
  const out: Record<string, string[]> = {}
  if (!m) return out
  for (const part of m[1].split(';')) {
    const bits = part.trim().split(/\s+/).filter(Boolean)
    if (bits.length === 0) continue
    out[bits[0]] = bits.slice(1)
  }
  return out
}

/** CSP header ANAHTARI — enforce mi rapor-only mu (cetvel §5, Recep kapısı). */
function cspHeaderKey(config: string): string | null {
  const m = config.match(/key:\s*'(Content-Security-Policy(?:-Report-Only)?)'/)
  return m ? m[1] : null
}

/** `https://*.x.co/y` → `*.x.co` · `'self'` gibi anahtar kelimeler → null. */
function entryHost(entry: string): string | null {
  if (entry.startsWith("'")) return null
  return entry.replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '') || null
}

function hostOf(url: string): string {
  return url.replace(/^[a-z]+:\/\//i, '').replace(/\/.*$/, '')
}

/**
 * Bir host, verilen direktif altında izinli mi?
 *
 * CSP geri-düşme (fallback) semantiği burada modellenir ve bu bekçinin ASIL değeri odur:
 * direktif politikada HİÇ YOKSA tarayıcı `default-src`'e düşer. `default-src 'self'`
 * altında dış origin YASAKTIR — yani "yazmayı unutmak" ile "açıkça yasaklamak" aynı şeydir.
 * `frame-src` bu repoda tam olarak böyle eksikti ve YouTube gömüsü enforce'ta ölecekti.
 */
function allows(csp: Record<string, string[]>, directive: string, host: string): boolean {
  const sources = csp[directive] ?? csp['default-src'] ?? []
  for (const entry of sources) {
    if (entry === '*') return true
    if (entry === 'https:') return true // şemа-geneli izin (img-src/font-src'te kullanılıyor)
    const h = entryHost(entry)
    if (!h) continue
    if (h === host) return true
    if (h.startsWith('*.') && host.endsWith(h.slice(1))) return true // *.x.co ⊇ a.x.co
  }
  return false
}

/* ------------------------------ Kaynak tarama ------------------------------ */

/**
 * Yorumları sıyır. İKİ ayrı tuzak var ve ikisi de bu bekçiyi yazarken CANLI yakalandı:
 *
 * (1) `[^\r\n]` ZORUNLU: repo dosyaları CRLF ve JS'te `.` satır sonlandırıcı olan `\r` ile
 *     EŞLEŞMEZ — `/\/\/.*$/` bu repoda hiçbir şey sıyırmaz, dedektör kör kalır.
 *
 * (2) `(?<!:)` ZORUNLU: naif bir satır-yorumu sıyırıcısı `https://host` içindeki `//`'ı
 *     yorum başlangıcı sanar ve URL'i `https:`e indirger. Yani sıyırıcı, dedektörün ARADIĞI
 *     ŞEYİ yok eder. İlk sürümde tam olarak bu oldu: taramada SIFIR kullanım çıktı ve
 *     "ihlal yok" sonucu ölçümden değil körlükten geliyordu — sahte-yeşil kilidi yakaladı.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(?<!:)\/\/[^\r\n]*/g, '')
}

interface Usage {
  host: string
  directive: string
  file: string
  kind: string
  /** Host'u çalışma anında kuruluyor (`https://${env}/...`) → statik çözülemez. */
  dynamic: boolean
}

/**
 * HOST'U ÇALIŞMA ANINDA KURULAN kullanımların ELLE kaydı.
 *
 * Neden liste: `https://${process.env.X}/...` biçimindeki bir origin statik olarak
 * çözülemez. Sessizce atlamak dedektörü kör eder (kusur sınıfı geri gelir); uydurma bir
 * host iddia etmek yanlış-KIRMIZI üretir. Ortası: her dinamik kullanım burada ADIYLA
 * kayda geçer ve kaydettiği host CSP'de aranır. Yeni bir dinamik-host kullanımı eklenirse
 * kayıt olmadığı için test KIRMIZI yanar — yani liste bir muafiyet değil, bir RATCHET'tir.
 */
const DYNAMIC_HOST_DECLARATIONS: {
  file: string
  directive: string
  host: string
  why: string
}[] = [
  {
    file: 'src/components/authority/VideoAuthority.tsx',
    directive: 'frame-src',
    host: '*.cloudflarestream.com',
    why:
      'Cloudflare Stream müşteri alt alan adı NEXT_PUBLIC_CLOUDFLARE_STREAM_DOMAIN env ' +
      "değişkeninden gelir (yedek: customer-XXXXX.cloudflarestream.com) → joker şart.",
  },
]

/**
 * Kullanım sınıfı → CSP direktifi eşlemesi.
 *
 * Etiket desenlerinde gövde `[^>]*` ile SINIRLI: açılış etiketinin dışına taşıp komşu
 * elemanın URL'ini yanlış direktife yazmasın (yanlış-KIRMIZI da kusurdur).
 */
const PATTERNS: { kind: string; directive: string; re: RegExp }[] = [
  {
    kind: '<Script src>',
    directive: 'script-src',
    re: /<[Ss]cript[^>]*\ssrc=\{?[`'"]\s*(https?:\/\/[^`'"\s]+)/g,
  },
  {
    kind: '<iframe src>',
    directive: 'frame-src',
    re: /<iframe[^>]*\ssrc=\{?[`'"]\s*(https?:\/\/[^`'"\s]+)/g,
  },
  {
    kind: 'fetch()',
    directive: 'connect-src',
    re: /\bfetch\(\s*[`'"](https?:\/\/[^`'"\s]+)/g,
  },
  {
    kind: '@import url()',
    directive: 'style-src',
    re: /@import\s+url\(\s*[`'"]?(https?:\/\/[^`'")\s]+)/g,
  },
]

function collectUsages(sources: Record<string, string>): Usage[] {
  const out: Usage[] = []
  for (const [file, raw] of Object.entries(sources)) {
    // Testler ve mock'lar üretim yüzeyi değildir.
    if (/__tests__\/|__mocks__\/|\.test\.|\.spec\./.test(file)) continue
    const code = stripComments(raw)
    for (const { kind, directive, re } of PATTERNS) {
      re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(code)) !== null) {
        const host = hostOf(m[1])
        out.push({
          host,
          directive,
          file: file.replace(/^\//, ''),
          kind,
          dynamic: host.includes('${'),
        })
      }
    }
  }
  return out
}

/* ---------------------------------- Testler ---------------------------------- */

describe('INV-CSP-1 · CSP origin kapsaması', () => {
  const csp = parseCsp(CONFIG)
  const usages = collectUsages(SOURCES)

  it('next.config.mjs CSP header değeri ayrıştırılabiliyor', () => {
    expect(
      Object.keys(csp).length,
      'CSP ayrıştırılamadı — next.config.mjs header biçimi değişti mi? ' +
        'Ayrıştırma başarısızsa AŞAĞIDAKİ TÜM testler boş kümeyi doğrular ve sahte-yeşil yanar.',
    ).toBeGreaterThan(3)
    expect(csp['default-src'], "default-src tanımlı olmalı (fallback'in temeli)").toBeDefined()
  })

  it('dedektör gerçekten kullanım buluyor (sahte-yeşil kilidi)', () => {
    // Kapsanan dört sınıfın en az biri boşalırsa desen bozulmuş demektir ve
    // "ihlal yok" sonucu ölçümden değil KÖRLÜKTEN gelir.
    expect(
      usages.length,
      'Hiç dış-origin kullanımı bulunamadı — desenler bozuldu (repoda en az GA script, ' +
        'YouTube iframe ve pwnedpasswords fetch var).',
    ).toBeGreaterThan(2)
  })

  it('kaynakta geçen her dış origin, ait olduğu direktifte izinli', () => {
    const offenders = usages
      .filter((u) => !u.dynamic)
      .filter((u) => !allows(csp, u.directive, u.host))
      .map(
        (u) =>
          `${u.file} — ${u.kind} '${u.host}' → CSP ${u.directive} altında İZİNLİ DEĞİL` +
          (csp[u.directive] ? '' : ` (direktif politikada YOK, default-src'e düşüyor)`),
      )
    expect(
      [...new Set(offenders)],
      `\nCSP eksik — kod bu origin'e bağımlı ama politika izin vermiyor:\n${offenders.join('\n')}\n` +
        `Çözüm: origin'i next.config.mjs CSP'sine AYNI PR'da ekle (cetvel §3).`,
    ).toEqual([])
  })

  it('çalışma anında kurulan her host kayıtlı VE kaydettiği host CSP altında izinli (ratchet)', () => {
    const sorunlar: string[] = []

    // (a) Kayıtsız dinamik kullanım → kör nokta. Liste muafiyet değil, ratchet.
    for (const u of usages.filter((x) => x.dynamic)) {
      const kayit = DYNAMIC_HOST_DECLARATIONS.find(
        (d) => d.file === u.file && d.directive === u.directive,
      )
      if (!kayit) {
        sorunlar.push(
          `${u.file} — ${u.kind} host'u çalışma anında kuruluyor ama DYNAMIC_HOST_DECLARATIONS'ta kaydı YOK. ` +
            `Hangi host'a çıktığını kayda geç (cetvel §4), yoksa CSP bu bağımlılığı hiç göremez.`,
        )
      }
    }

    // (b) Kayıtlı host CSP'de gerçekten izinli mi.
    for (const d of DYNAMIC_HOST_DECLARATIONS) {
      if (!allows(csp, d.directive, d.host.replace(/^\*\./, 'x.'))) {
        sorunlar.push(`${d.file} — kayıtlı '${d.host}' CSP ${d.directive} altında İZİNLİ DEĞİL`)
      }
    }

    // (c) Ölü kayıt: kullanım kalkmışsa kayıt da kalksın (liste bayatlamasın).
    for (const d of DYNAMIC_HOST_DECLARATIONS) {
      if (!usages.some((u) => u.dynamic && u.file === d.file && u.directive === d.directive)) {
        sorunlar.push(`${d.file} — ÖLÜ kayıt: bu dosyada artık dinamik-host kullanımı yok, kaydı sil`)
      }
    }

    expect(sorunlar, `\n${sorunlar.join('\n')}`).toEqual([])
  })

  it("sertleştirme direktifleri düşmemiş (stale-guard)", () => {
    const required: Record<string, string> = {
      'object-src': "'none'",
      'frame-ancestors': "'none'",
      'base-uri': "'self'",
      'form-action': "'self'",
    }
    const missing = Object.entries(required)
      .filter(([d, v]) => !(csp[d] ?? []).includes(v))
      .map(([d, v]) => `${d} ${v}`)
    expect(
      missing,
      `\nCSP'den DÜŞMÜŞ sertleştirme direktif(ler)i: ${missing.join(', ')} — cetvel §2 ihlali`,
    ).toEqual([])
  })

  it('ödeme sağlayıcı origin dört direktifte de izinli (T080-P2 kilidi)', () => {
    // İyzico gömülü form dört yüzey kullanır: script yüklenir, iframe açılır, form POST
    // edilir, XHR atılır. Dördünden BİRİ eksikse enforce gününde ödeme yolu SESSİZCE ölür
    // (Report-Only bugün hiçbirini göstermez). Host çalışma anında IYZICO_BASE_URL
    // secret'ından kurulur ve Edge fonksiyonunda yaşar — dedektörün taramadığı iki sınıf
    // (cetvel §4) — o yüzden burada ADIYLA kilitleniyor, taramaya bırakılmıyor.
    const ornek = 'sandbox-api.iyzipay.com'
    const eksik = ['script-src', 'frame-src', 'form-action', 'connect-src'].filter(
      (d) => !allows(csp, d, ornek),
    )
    expect(
      eksik,
      `
Ödeme sağlayıcı origin'i şu direktif(ler)de İZİNLİ DEĞİL: ${eksik.join(', ')}. ` +
        'Enforce gününde ödeme yolu kırılır; cetvel §6 origin siciline bak.',
    ).toEqual([])
  })
  it('CSP enforce edilecekse cetvelin enforce bölümü de güncellenmiş olmalı (Recep kapısı)', () => {
    const key = cspHeaderKey(CONFIG)
    expect(key, 'CSP header anahtarı bulunamadı').not.toBeNull()
    // Bu bekçi enforce'a geçmeyi YASAKLAMAZ — geçişin sessizce olmasını yasaklar.
    // Anahtar değişirse bu test KIRMIZI yanar ve geçişi yapanı cetvele bakmaya zorlar.
    expect(
      key,
      'CSP enforce moduna alınmış. Bu AYRI VE BÜYÜK bir karardır (cetvel §5): önce ' +
        'Report-Only raporlarında sıfır ihlal kanıtlanmalı ve Recep onayı alınmalıdır. ' +
        'Bilinçli geçiş yapıyorsan bu testi cetvel §5 ile birlikte güncelle.',
    ).toBe('Content-Security-Policy-Report-Only')
  })

  it('dedektör sağlığı: sentetik ihlali görür, sentetik uyumluyu görmez', () => {
    const sentetikCsp = parseCsp(
      `key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; script-src 'self' https://izinli.example"`,
    )
    // (a) POZİTİF: izinli olmayan host yakalanmalı
    expect(allows(sentetikCsp, 'script-src', 'yasak.example')).toBe(false)
    // (b) NEGATİF: izinli host yanlış-KIRMIZI vermemeli
    expect(allows(sentetikCsp, 'script-src', 'izinli.example')).toBe(true)
    // (c) FALLBACK: direktif yoksa default-src'e düşmeli (frame-src vakasının ta kendisi)
    expect(allows(sentetikCsp, 'frame-src', 'izinli.example')).toBe(false)
    // (d) YORUM YANLIŞ-POZİTİF KİLİDİ: doğru kodu ANLATAN yorum ihlal sayılmamalı
    const yorumlu = collectUsages({
      '/src/ornek.ts': '// fetch("https://yorumdaki.example/x") yapmayı bıraktık\nexport const a = 1\n',
    })
    expect(yorumlu).toEqual([])
  })
})
