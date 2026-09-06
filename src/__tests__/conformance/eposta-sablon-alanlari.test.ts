/**
 * INV-EPOSTA-SABLON-1 — e-posta şablonu ile render çağrısı AYNI alan kümesini taşır.
 *
 * OLAY (ölçülmüş, 2026-09-06 · REC-154):
 *
 * 1) **Geçilen alan sessizce çöpe gidiyordu.** `delivery-notification/index.ts` render
 *    çağrısında `brand_name`, `brand_primary_color`, `brand_logo_url` geçiyordu; şablonu
 *    `delivered.html` ise marka adını `VentHub`, marka rengini `#2563eb` olarak **sabit
 *    kodluyordu**. Üç alanın da şablonda KARŞILIĞI YOKTU. Marka değişse (tenant config ya da
 *    `BRAND_NAME` ortam değişkeni) e-posta değişmezdi ve hiçbir test bunu görmezdi.
 *    Aynı kusurun küçüğü `shipping.html`'de: altbilgide sabit "VentHub Ekibi".
 *
 * 2) **`support_email` ve `company_footer` HİÇBİR yerde yoktu.** Depo genelinde ölçüm:
 *    `support_email|supportEmail|SUPPORT_EMAIL` → **0 isabet**;
 *    `company_footer|companyFooter|COMPANY_FOOTER` → **0 isabet**.
 *    Üç şablon da "Lütfen yanıtlamayın" diyordu ama nereye yazılacağını SÖYLEMİYORDU —
 *    gönderim adresi domain doğrulaması düşerse `onboarding@resend.dev`'e iniyor ve o kutu
 *    okunmuyor. Yani müşteri için çıkmaz sokak.
 *
 * ⭐BU KAPININ ÖLÇTÜĞÜ ŞEY, AÇIKÇA: **alan sözleşmesinin iki yönlü tuttuğunu** ölçer.
 * ÖLÇMEZ: e-postanın gönderildiğini (çalışma zamanı), üretilen HTML'in doğru GÖRÜNDÜĞÜNÜ
 * (istemci uyumu), `companyFooter`'ın DOLU olduğunu (bugün bilerek boş — cetvel §4),
 * numaranın tekil ÜRETİLDİĞİNİ (o INV-SIPARIS-NO-1 + SQL kanıtının işi).
 *
 * KAPSAM: cetvelde adı geçen DÖRT bildirim ucu. `notification-service` ve SMS/WhatsApp
 * gövdeleri HARİÇ — onlar `notification-standard.md`'nin alanı.
 *
 * Cetvel: `docs/standards/email-template-standard.md` (INV-EPOSTA-SABLON-1).
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const ISLEVLER = [
  'delivery-notification',
  'order-confirmation',
  'return-status-notification',
  'shipping-notification',
] as const

/** Yorum ANLATIR, kural UYGULAR — ölçüt daima gövdede koşar. */
const govde = (k: string) =>
  k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
/**
 * HTML **ve** CSS yorumları ölçüt dışıdır: yorumda geçen `VentHub`/`#2563eb` müşteriye
 * BASILMAZ, dolayısıyla kusur değildir — kusurun ne olduğunu ANLATAN metindir.
 * (Bu ayrım kapıyı zayıflatmaz: yorumda saklanan bir değer zaten render edilmiyor.)
 */
const htmlGovde = (k: string) =>
  k.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '')

function islevYolu(islev: string) {
  return join(KOK, 'supabase', 'functions', islev, 'index.ts')
}

/** İşlevin şablon dosyası — `loadTemplate` içindeki `new URL('./templates/…')`den okunur. */
function sablonYolu(islev: string, kod: string): string | null {
  const m = kod.match(/new URL\(\s*'\.\/(templates\/email\/[^']+)'/)
  if (!m) return null
  return join(KOK, 'supabase', 'functions', islev, ...m[1].split('/'))
}

/**
 * `renderTemplate(x, { … })` çağrısındaki ÜST DÜZEY anahtarları çıkarır.
 * Süslü parantezleri sayarak dengeler — iç içe nesne/şablon değişmezi olsa da doğru kapanır.
 */
function renderAlanlari(kod: string): string[] {
  const bas = kod.search(/renderTemplate\(\s*\w+\s*,\s*\{/)
  if (bas < 0) return []
  const acilis = kod.indexOf('{', bas)
  let derinlik = 0
  let son = -1
  for (let i = acilis; i < kod.length; i++) {
    if (kod[i] === '{') derinlik++
    else if (kod[i] === '}') {
      derinlik--
      if (derinlik === 0) { son = i; break }
    }
  }
  if (son < 0) return []
  const govdeMetni = kod.slice(acilis + 1, son)
  // Üst düzey anahtar: derinlik 0'da duran `ad:` ya da kısa yazım `ad,`/`ad}`.
  const alanlar: string[] = []
  let d = 0
  let parca = ''
  for (const ch of govdeMetni) {
    if (ch === '{' || ch === '[' || ch === '(') d++
    else if (ch === '}' || ch === ']' || ch === ')') d--
    if (ch === ',' && d === 0) { alanlar.push(parca); parca = '' } else parca += ch
  }
  alanlar.push(parca)
  return alanlar
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.includes(':') ? p.slice(0, p.indexOf(':')) : p).trim())
    .filter((a) => /^\w+$/.test(a))
}

/** Şablondaki `{{alan}}` + `{{#if alan}}` adları (tekilleştirilmiş). */
function sablonAlanlari(html: string): string[] {
  const küme = new Set<string>()
  for (const m of html.matchAll(/{{#if\s+(\w+)}}/g)) küme.add(m[1])
  for (const m of html.matchAll(/{{(\w+)}}/g)) küme.add(m[1])
  return [...küme].sort()
}

const OLCUM = ISLEVLER.map((islev) => {
  const kod = govde(readFileSync(islevYolu(islev), 'utf8'))
  const sYol = sablonYolu(islev, kod)
  const sablonVar = !!sYol && existsSync(sYol)
  const html = sablonVar ? htmlGovde(readFileSync(sYol as string, 'utf8')) : ''
  return {
    islev,
    kod,
    sablonVar,
    sablonAdi: sablonVar ? (sYol as string).replace(KOK, '').replace(/\\/g, '/') : null,
    html,
    sablonKume: sablonVar ? sablonAlanlari(html) : [],
    renderKume: sablonVar ? renderAlanlari(kod).sort() : [],
  }
})

describe('INV-EPOSTA-SABLON-1 · e-posta şablonu ↔ render alan sözleşmesi', () => {
  it('⭐ASIL İDDİA A — şablondaki HER `{{alan}}` render çağrısında GEÇİLİYOR', () => {
    const eksikler: string[] = []
    for (const o of OLCUM) {
      if (!o.sablonVar) continue
      for (const alan of o.sablonKume) {
        if (!o.renderKume.includes(alan)) eksikler.push(`${o.islev} · ${o.sablonAdi}: {{${alan}}}`)
      }
    }
    expect(
      eksikler,
      'Sablonda delik var ama render cagrisi o alani GECMIYOR — delik BOS basar.\n' +
        'Cetvel: docs/standards/email-template-standard.md §3.\nEksikler:\n  ' +
        eksikler.join('\n  '),
    ).toEqual([])
  })

  it('⭐ASIL İDDİA B — render çağrısında GEÇİLEN her alan şablonda KULLANILIYOR', () => {
    const bosunalar: string[] = []
    for (const o of OLCUM) {
      if (!o.sablonVar) continue
      for (const alan of o.renderKume) {
        if (!o.sablonKume.includes(alan)) bosunalar.push(`${o.islev} · ${alan}`)
      }
    }
    expect(
      bosunalar,
      'Deger geciliyor ama sablon onu KULLANMIYOR — SESSIZCE COPE gidiyor.\n' +
        'Olculmus ornek: delivered.html marka adini "VentHub" diye SABIT KODLUYORDU,\n' +
        'index.ts ise brand_name geciyordu. Marka degisse e-posta degismezdi.\n' +
        'Bosuna gecilenler:\n  ' + bosunalar.join('\n  '),
    ).toEqual([])
  })

  it('⭐DÖRT İŞLEV DE destek adresi + şirket altbilgisi TAŞIR', () => {
    for (const o of OLCUM) {
      // Kaynak zinciri: dördü de AYNI yerden okur (getTenantBranding) — ayrı yol yok.
      expect(
        /branding\.supportEmail/.test(o.kod),
        `${o.islev}: branding.supportEmail okunmuyor — "yanitlamayin" der, adres vermez.`,
      ).toBe(true)
      expect(
        /branding\.companyFooter/.test(o.kod),
        `${o.islev}: branding.companyFooter okunmuyor.`,
      ).toBe(true)
      // Ortam degiskenini DOGRUDAN okumak = ikinci bir yol = ayri bayatlama noktasi.
      expect(
        /Deno\.env\.get\(\s*['"](SUPPORT_EMAIL|COMPANY_FOOTER)['"]\s*\)/.test(o.kod),
        `${o.islev}: destek/altbilgi icin IKINCI yol acilmis (Deno.env). Zincir tek: cetvel §5.`,
      ).toBe(false)

      if (o.sablonVar) {
        expect(o.sablonKume, `${o.sablonAdi}: {{support_email}} yok.`).toContain('support_email')
        expect(o.sablonKume, `${o.sablonAdi}: {{company_footer}} yok.`).toContain('company_footer')
      } else {
        // Sablonsuz uc (return-status-notification): govde satir-ici kuruluyor.
        expect(
          /\$\{supportEmail\}/.test(o.kod),
          `${o.islev}: sablonsuz uc, satir-ici govdede \${supportEmail} yok.`,
        ).toBe(true)
        expect(
          /\$\{companyFooter\}/.test(o.kod),
          `${o.islev}: sablonsuz uc, satir-ici govdede \${companyFooter} yok.`,
        ).toBe(true)
      }
    }
  })

  it('⭐ŞABLONDA SABİT MARKA YOK — değer zinciri şablonla delinemez', () => {
    const isabetler: string[] = []
    for (const o of OLCUM) {
      if (!o.sablonVar) continue
      // `VentHub` duz metni: {{brand_name}} yerine gecmis sabit deger.
      for (const m of o.html.matchAll(/VentHub/g)) isabetler.push(`${o.sablonAdi}: ${m[0]}`)
      // `#2563eb`: {{brand_primary_color}} yerine gecmis sabit HEX.
      for (const m of o.html.matchAll(/#2563eb/gi)) isabetler.push(`${o.sablonAdi}: ${m[0]}`)
    }
    expect(
      isabetler,
      'Sablonda marka adi/rengi SABIT KODLANMIS — tenant config veya BRAND_* degisse\n' +
        'e-posta degismez. Cetvel: email-template-standard.md §5.\nIsabetler:\n  ' +
        isabetler.join('\n  '),
    ).toEqual([])
  })

  it('⭐MOTOR DÖNGÜ İÇERMEZ — `each` ne şablonda ne motorda', () => {
    for (const o of OLCUM) {
      expect(
        /{{#each/.test(o.html),
        `${o.sablonAdi}: {{#each}} kullanilmis. Liste gerekiyorsa HTML'i CAGIRAN hazirlar.`,
      ).toBe(false)
      expect(
        /{{#each|#each\\s/.test(o.kod),
        `${o.islev}: motora dongu eklenmis. Cetvel §2 — motor BUYUTULMEZ, tasinir.`,
      ).toBe(false)
    }
  })

  it('⭐SİPARİŞ NUMARASI TAM BASILIR (REC-156 ile tutarlı)', () => {
    for (const o of OLCUM) {
      // Render cagrisi TAM numarayi (siparisNo) gecer — parcalanmis degeri degil.
      if (o.sablonVar) {
        expect(o.sablonKume, `${o.sablonAdi}: {{order_number}} yok.`).toContain('order_number')
        expect(
          /order_number:\s*siparisNo/.test(o.kod),
          `${o.islev}: render cagrisi order_number'a TAM numarayi (siparisNo) gecmiyor.`,
        ).toBe(true)
        // `#` onegi yasak: numara zaten `VH-` ile baslar → "#VH-2026…" diye okunur.
        expect(
          /#\s*\{\{order_number\}\}/.test(o.html),
          `${o.sablonAdi}: '#' onegi eklenmis — document-numbering-standard.md §3 yasakliyor.`,
        ).toBe(false)
      }
      // Dortunde de TAM numara bicimi (INV-SIPARIS-NO-1 ile ayni olcut, burada da tutulur).
      expect(
        /const\s+siparisNo\s*=\s*order_number\s*\?\s*String\(order_number\)\.trim\(\)/.test(o.kod),
        `${o.islev}: TAM numara bicimi yok.`,
      ).toBe(true)
    }
  })

  it('BOŞLUK MUHAFIZI — dosyalar gerçekten okundu, kümeler boş değil', () => {
    expect(OLCUM.length, 'Dort islev okunmadi.').toBe(4)
    // Ucunde sablon VAR, birinde (return-status-notification) YOK — bugunku olculmus durum.
    expect(OLCUM.filter((o) => o.sablonVar).length, 'Sablonlu uc sayisi 3 degil.').toBe(3)
    expect(
      OLCUM.find((o) => o.islev === 'return-status-notification')?.sablonVar,
      'return-status-notification icin sablon BELIRMIS — kapinin evreni guncellenmeli.',
    ).toBe(false)
    for (const o of OLCUM) {
      expect(o.kod.length, `${o.islev}: index.ts bos okundu.`).toBeGreaterThan(1000)
      if (o.sablonVar) {
        expect(o.sablonKume.length, `${o.sablonAdi}: hic {{alan}} bulunamadi — evren yanlis.`).toBeGreaterThan(3)
        expect(o.renderKume.length, `${o.islev}: render cagrisi ayristirilamadi — evren yanlis.`).toBeGreaterThan(3)
      }
    }
  })
})
