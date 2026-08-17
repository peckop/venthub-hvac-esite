import { describe, expect, it } from 'vitest'

/**
 * INV-RETURN-CAS-1 — iade statü yazımının eşzamanlılık değişmezleri.
 *
 * NİÇİN (M3 · vibe-coding-20-madde-v2-2026-08-16 denetimi):
 *
 * Arayüzün monotonluk kontrolü (`allowedNextStatuses(row.status)`) satırın SON TABLO
 * YÜKLEMESİNDEN KALMA anlık görüntüsünü okur. İki admin (ya da bir kişinin iki sekmesi)
 * aynı iadeyi açtığında ikisi de "geçiş serbest" der. Eski yazım `.eq('id')` ile
 * gittiği için ikinci yazım, parası ÇIKMIŞ `refunded` kaydını `cancelled`'a geri
 * yürütebiliyordu: kayıt gerçekleşmiş bir para iadesini yalanlıyordu.
 *
 * ÖNEMLİ AYRIM — bu bir PARA kusuru DEĞİL: çift gerçek iade `refund_attempts`
 * benzersiz indeksiyle DB'de zaten kesiliyor (EDGE, 20260816090000). Korumasız kalan
 * KAYDIN KENDİSİYDİ. Bu ayrım düzeltmenin biçimini belirledi: PARA ÖNCE sırası
 * korunabildi, çünkü ikinci sekmenin iade çağrısı `already_refunded` (başarı) döner ve
 * ardından CAS 0 satırla durdurur.
 *
 * BU KUSUR BUGÜN GÖRÜNMEZ: prod'da 0 iade kaydı var. Yani hiçbir manuel test bunu
 * yakalayamaz — kapı tam da bu yüzden var.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const ALL: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/**
 * Yorumları at.
 *
 * İki sebep: (a) kuralı ANLATAN yorum ihlal sayılmamalı, (b) daha sinsisi — bu
 * dosyanın kendi gerekçe metni denetlenen ifadeleri içerir; sıyırmazsak test kendi
 * açıklamasını doğrulayıp YEŞİL kalır. `[^\n]*` kullanılıyor: bu depo CRLF'tir ve
 * `.` satır sonunu yemez.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
}

const RETURNS_UI = stripComments(ALL['/src/views/admin/ReturnsTableBody.tsx'] ?? '')

/** `venthub_returns` üzerine yapılan UPDATE çağrılarını sayar. */
function countReturnUpdates(source: string): number {
  return (source.match(/from\('venthub_returns'\)\s*\.update\(/g) ?? []).length
}

describe('INV-RETURN-CAS-1 · iade yazımı karşılaştır-ve-değiştir', () => {
  it('kaynak okunabildi (stale-guard)', () => {
    // Yol yazım hatası bu dosyadaki HER testi sessizce "temiz"e çevirirdi.
    expect(RETURNS_UI.length).toBeGreaterThan(2000)
  })

  it('R1+R2 · statü yazımı TEK kapıdan geçiyor (ham UPDATE yok)', () => {
    /*
      Kapı bilerek tek fonksiyonda. Tekil ve toplu akışların ayrı ayrı doğru yazması
      beklenirse biri er geç kayar — aynı sınıf hata #554'te yaşandı: koruma UI'daydı,
      bilerek bozulduğunda TÜM testler yeşil kaldı.
    */
    expect(
      countReturnUpdates(RETURNS_UI),
      'venthub_returns üzerine ham UPDATE kalmamalı; yazım `updateReturnStatusCas` kapısından geçmeli.',
    ).toBe(1)

    expect(
      /async function updateReturnStatusCas\(/.test(RETURNS_UI),
      'Tek yazma kapısı `updateReturnStatusCas` tanımlı olmalı.',
    ).toBe(true)
  })

  it('R1 · kapı beklenen statüyü sorguya KOŞUL olarak koyuyor', () => {
    /*
      `UPDATE ... WHERE id = ? AND status = ?` TEK ifadedir; Postgres iki eşzamanlı
      çağrıdan yalnız birinin eşleşmesini garanti eder. `.eq('status', …)` düşerse
      yazım yarışı geri gelir ve HİÇBİR çalışma-zamanı hatası üretmez.
    */
    const gate = RETURNS_UI.slice(RETURNS_UI.indexOf('async function updateReturnStatusCas('))
    expect(
      /\.eq\('id',\s*returnId\)[\s\S]{0,120}\.eq\('status',\s*expectedStatus\)/.test(gate),
      "Kapı `.eq('id', …)` ile birlikte `.eq('status', expectedStatus)` KOŞULUNU da uygulamalı.",
    ).toBe(true)
  })

  it('R3 · 0-satır tespit EDİLEBİLİR (select ile satır geri isteniyor)', () => {
    /*
      `.select()` olmadan Supabase güncellemesi kaç satırın eşleştiğini SÖYLEMEZ;
      yarış kaybedilse bile çağrı sessizce başarılı görünür. Kapı körelir.
    */
    const gate = RETURNS_UI.slice(RETURNS_UI.indexOf('async function updateReturnStatusCas('))
    expect(/\.select\('id'\)/.test(gate), "Kapı `.select('id')` ile eşleşen satırı geri istemeli.").toBe(true)
    expect(
      /data\.length === 0|!data \|\| data\.length === 0/.test(gate),
      '0-satır durumu açıkça kontrol edilmeli.',
    ).toBe(true)
  })

  it('R4 · bayat yazım AYIRT EDİLEBİLİR bir tiple bildiriliyor', () => {
    /*
      Genel `Error` fırlatmak yeterli DEĞİL: dışarıdaki yakalayıcı onu "güncellenemedi"
      sanır ve kullanıcıya TEKRAR DENE dedirtir — oysa doğru eylem tazelemektir.
    */
    expect(/class StaleReturnWriteError extends Error/.test(RETURNS_UI)).toBe(true)
    expect(
      /throw new StaleReturnWriteError\(/.test(RETURNS_UI),
      '0-satır durumunda ayırt edilebilir hata fırlatılmalı.',
    ).toBe(true)
  })

  it('R5 · bayat yazım kullanıcıya görünür VE tabloyu tazeliyor — HER İKİ akışta', () => {
    /*
      SAYIYA bağlı: "bir yerde ele alınıyor" yetmez (INV-REFUND-UI-1 dersi — tekil
      korumayı silmek, toplu koruma var diye testi geçirmişti). Tekil ve toplu
      yakalayıcıların İKİSİ de bayat dalını taşımalı.
    */
    const handledCount = (RETURNS_UI.match(/instanceof StaleReturnWriteError/g) ?? []).length
    expect(
      handledCount,
      'Tekil ve toplu akışların İKİSİ de bayat yazımı ayrı ele almalı.',
    ).toBeGreaterThanOrEqual(2)

    // Her ele alınan yerde tazeleme yapılmalı; aksi hâlde kullanıcı aynı bayat
    // görüntüyle tekrar dener ve aynı hatayı sonsuza kadar alır.
    const branches = RETURNS_UI.split('instanceof StaleReturnWriteError').slice(1)
    for (const branch of branches) {
      expect(
        /table\.reload\(\)/.test(branch.slice(0, 400)),
        'Bayat yazım dalı tabloyu tazelemeli (kullanıcı gerçek statüyü görmeli).',
      ).toBe(true)
    }
  })

  it('R6 · toplu akışta hata NESNESİ korunuyor (tip düşürülmüyor)', () => {
    /*
      `throw new Error(failures[0])` yalnızca METNİ taşır: bayat-okuma tipi düşer ve
      dıştaki dal onu genel hata sanar. Kullanıcı yine yanlış eyleme yönlendirilir.
    */
    expect(
      /throw new Error\(failures\[0\]\)/.test(RETURNS_UI),
      'Toplu akış hata metnini değil hata NESNESİNİ yeniden fırlatmalı.',
    ).toBe(false)
    expect(/throw rejected\[0\]\.reason/.test(RETURNS_UI)).toBe(true)
  })

  it('PARA ÖNCE sözleşmesi bozulmadı — iade çağrısı statü yazımından ÖNCE', () => {
    /*
      CAS eklemek sırayı tersine çevirmeye ayartabilir ("önce satırı kap, sonra
      parayı gönder"). O hâlde kayıt, para çıkmadan `refunded` derdi. Sıra korunuyor;
      güvenli olmasının sebebi `refund_attempts` benzersiz indeksinin ikinci çağrıyı
      `already_refunded` (başarı) yapması — yani iki kapı birbirini tamamlıyor.
    */
    const refundIdx = RETURNS_UI.indexOf('await performRealRefund(')
    const casIdx = RETURNS_UI.indexOf('await updateReturnStatusCas(')
    expect(refundIdx).toBeGreaterThan(-1)
    expect(casIdx).toBeGreaterThan(-1)
    expect(
      refundIdx < casIdx,
      'Gerçek para iadesi statü yazımından ÖNCE denenmeli (PARA ÖNCE, #557).',
    ).toBe(true)
  })
})
