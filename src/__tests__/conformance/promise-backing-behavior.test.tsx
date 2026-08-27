import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * INV-PROMISE-1 — vaat ↔ davranış bağı (T104 hazırlığı · 2026-08-20).
 *
 * NİÇİN DAVRANIŞSAL
 *
 * Bu kapı üç kez STATİK yazılmaya çalışıldı ve üçü de ölçümle çürütüldü
 * (`docs/audits/t104-vaat-dayanagi-olcumu-2026-08-20.md`):
 *
 *   (a) Anahtar adına bakmak → %75 sahte pozitif (`checkout.saved.title` = "Kayıtlı
 *       Adresler"; "saved" sıfat, vaat değil).
 *   (b) Dosyada ağ çağrısı aramak → İKİ YÖNDE de yanıldı: `RegisterPage` doğru sonucu
 *       yanlış gerekçeyle aldı (eşleşen `fetch` parola sızıntı kontrolündeydi),
 *       `ForgotPasswordPage` yanlış suçlandı (gerçek çağrı iki seviye aşağıda).
 *   (c) Düzenli ifadeyle "başarıyı açan fonksiyonu" bulmak → 41 yüzeyin 40'ını atladı,
 *       sınıfın bilinen tek üyesi DAHİL. (LeadModal'ın işleyicisinin adı `submit` —
 *       `handle`/`on` öneki yok.)
 *
 * Ders: statik tarama yüzeyin ne SÖYLEDİĞİNİ görür, ne YAPTIĞINI göremez. Bu yüzden
 * kapı bileşeni gerçekten render eder, formu doldurur, gönderir ve ağ/yazma katmanının
 * çağrılıp çağrılmadığını SAYAR.
 *
 * KENDİNİ TEMİZLEYEN TABAN ÇİZGİSİ
 *
 * `LeadModal` bugün kusurludur: kullanıcıdan zorunlu rıza alır, "Talebiniz Alındı!" der
 * ve hiçbir yere yazmaz (kodun kendi yorumu: "Simulate API Call"). Onarımı T104-VH
 * kapsamında ve BAŞKA bir şeritte (I18N-SWEEP).
 *
 * Bu kapı onu "muaf" diye ATLAMAZ — bugünkü kusurlu davranışı ADIYLA doğrular. Onarım
 * indiği an R2 KIRMIZIYA döner ve kaydın güncellenmesini zorlar. Muafiyet unutulamaz,
 * sessizce kalıcılaşamaz. Kırmızı gördüğünde yapılacak şey testi gevşetmek değil,
 * R2'yi "çağrı YAPILIYOR" iddiasına çevirmektir.
 *
 * KAPININ GÖREMEDİĞİ (dürüst sınır): yalnız kayıtlı yüzeyleri ölçer. Kayda girmemiş
 * bir form, bu kapı yeşilken de dayanaksız olabilir. Kaydın büyümesi elle yapılır.
 */

vi.mock('@/i18n/I18nProvider', () => ({
  useI18n: () => ({
    t: (anahtar: string) => anahtar,
    lang: 'tr' as const,
  }),
}))

vi.mock('@/hooks/useLocalizedRoutes', () => ({
  useLocalizedRoutes: () => ({ legal: { kvkk: () => '/tr/kvkk' } }),
}))

import LeadModal from '@/components/LeadModal'

/** Ağ/yazma katmanına yapılan HER denemeyi sayan gözcü. */
function agGozcusu(): string[] {
  const cagrilar: string[] = []
  const sahteFetch = vi.fn((girdi: RequestInfo | URL) => {
    cagrilar.push(String(girdi))
    return Promise.resolve(new Response('{}', { status: 200 }))
  })
  vi.stubGlobal('fetch', sahteFetch)
  return cagrilar
}

/** Formu geçerli biçimde doldurup gönderir (ad + e-posta + zorunlu rıza). */
async function formuGonder(container: HTMLElement) {
  const girdiler = container.querySelectorAll('input')
  fireEvent.change(girdiler[0], { target: { value: 'Test Kullanici' } })
  fireEvent.change(girdiler[2], { target: { value: 'test@example.com' } })

  const riza = container.querySelector('#consent')
  if (!(riza instanceof HTMLInputElement)) throw new Error('Zorunlu rıza kutusu bulunamadı')
  fireEvent.click(riza)

  const form = container.querySelector('form')
  if (!(form instanceof HTMLFormElement)) throw new Error('Form bulunamadı')
  fireEvent.submit(form)

  // NİÇİN ASENKRON OLDU — 2026-08-26, T104 onarımıyla birlikte: gönderim artık bir
  // zamanlayıcı değil GERÇEK bir yazma çağrısı bekliyor. Zamanlayıcı ilerletmek tek
  // başına yetmez; söz zincirinin (microtask) boşalması gerekir, yoksa React durum
  // güncellemesini hiç görmez ve kapı "başarı ekranı açılmadı" diye YANLIŞ kırmızı verir.
  await act(async () => {
    vi.advanceTimersByTime(1500)
    await Promise.resolve()
    await Promise.resolve()
  })
  return girdiler.length
}

describe('INV-PROMISE-1 — vaat eden yüzey gerçekten bir şey yapıyor mu', () => {
  let cagrilar: string[]

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    cagrilar = agGozcusu()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('R0 — GÖZCÜ SAĞLIKLI: gerçek bir çağrı yapılsa görürdü', () => {
    // Sahte-yeşil kilidi. Bu iddia olmasaydı, `fetch` stub'ı hiç bağlanmamışken de
    // "çağrı yok" sonucu çıkardı ve kapı KÖR koşardı.
    const Deneme: React.FC = () => (
      <button type="button" onClick={() => void fetch('/api/deneme')}>
        {'gonder'}
      </button>
    )
    render(<Deneme />)
    fireEvent.click(screen.getByRole('button'))

    expect(
      cagrilar,
      'Gözcü hiçbir şey görmedi — stub bağlanmamış olabilir. Bu hâlde aşağıdaki ' +
        'iddiaların hepsi anlamsızdır.',
    ).toHaveLength(1)
  })

  it('R1 — senaryo geçerli: gönderim başarı vaadini gerçekten açıyor', async () => {
    const { container } = render(<LeadModal open onClose={vi.fn()} />)
    const alanSayisi = await formuGonder(container)

    expect(
      alanSayisi,
      'Form alanları bulunamadı — bileşen yeniden yazıldıysa bu senaryo körleşir.',
    ).toBeGreaterThanOrEqual(5)

    expect(
      screen.queryByText('lead.success.title'),
      'Gönderim başarı ekranına ULAŞMADI — senaryo doğrulama hatasına takılmış olabilir; ' +
        'bu durumda R2 hiçbir şey kanıtlamaz.',
    ).toBeTruthy()
  })

  it('R2 — VAAT DAYANAKLI: "Talebiniz Alındı" derken GERÇEKTEN yazma çağrısı yapılıyor', async () => {
    // KAYIT GÜNCELLENDİ — 2026-08-26. Bu iddia eskiden TERSİYDİ ("hiçbir çağrı yapılmıyor")
    // ve LeadModal'ın o günkü KUSURLU davranışını adıyla donduruyordu. Testin kendi notu
    // şunu emrediyordu: *"Onarım indiği an R2 KIRMIZIYA döner... Yapılacak: bu iddiayı
    // tersine çevir (çağrı YAPILIYOR olmalı) ve kaydı güncelle. Testi gevşetme."*
    // Onarım REC-80 ile indi; iddia gevşetilmedi, TERSİNE ÇEVRİLDİ.
    //
    // Kusurun bedeli ölçülmüştü: prod'da `contact_messages` tablosu 0 kayıt taşıyordu.
    const { container } = render(<LeadModal open onClose={vi.fn()} />)
    await formuGonder(container)

    expect(
      cagrilar.length,
      '\nLeadModal başarı ekranını açtı ama HİÇBİR yazma çağrısı görülmedi.\n' +
        'Bu, T104 kusurunun GERİ DÖNDÜĞÜ anlamına gelir: müşteriye "aldık" denip\n' +
        'hiçbir yere yazılmıyor. Testi gevşetme — bileşeni onar.',
    ).toBeGreaterThan(0)

    // Ve vaat artık dayanaklı: ekranda "alındı" yazıyor VE arkasında bir yazma var.
    expect(screen.queryByText('lead.success.title')).toBeTruthy()
  })
})
