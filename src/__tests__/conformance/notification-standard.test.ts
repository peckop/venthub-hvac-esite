import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-NOTIFY-1 / INV-NOTIFY-2 — bildirim cetveli ile GERÇEK yüzey arasındaki bağ.
 *
 * NİÇİN BU İKİ KAPI, NİÇİN MÜKERRERLİK KAPISI DEĞİL:
 * Bugün ölçüldü ki dört bildirim ucundan üçünde mükerrerlik koruması YOK
 * (docs/standards/notification-standard.md §B7). "Yeni kapı mevcut ihlalle açılmaz"
 * kuralı gereği o kapı BU sürümde yazılmıyor — kırmızı doğarsa herkesin kapısı kırmızı
 * olur ve kapı bilgi değil gürültü üretir. Bu iki kapı ise bugün YEŞİL ve tam da bugünkü
 * kusurun DOĞMASINI sağlayan boşluğu kapatıyor:
 *
 *   order-confirmation gerçekten VARDI ve gerçekten e-posta gönderiyordu; ama hiçbir
 *   cetvelde yazılı olmadığı için "ödeme onay e-postası yok" diye yanlış hüküm kuruldu
 *   ve neredeyse bir iş emri açılıyordu. Kusur kodda değil, KOD ile CETVEL arasındaki
 *   boşluktaydı. INV-NOTIFY-1 tam o boşluğu ölçer.
 */

const KOK = process.cwd()
const CETVEL = join(KOK, 'docs/standards/notification-standard.md')
const UCLAR_KOK = join(KOK, 'supabase/functions')
const SUPABASE_KOK = join(KOK, 'supabase')

function cetvelMetni(): string {
  return readFileSync(CETVEL, 'utf8')
}

/** api.resend.com'a gönderim yapan uç dizinlerinin adları. */
function resendGonderenUclar(): string[] {
  const bulunan: string[] = []
  for (const ad of readdirSync(UCLAR_KOK)) {
    const dizin = join(UCLAR_KOK, ad)
    if (!statSync(dizin).isDirectory()) continue
    const giris = join(dizin, 'index.ts')
    if (!existsSync(giris)) continue
    if (readFileSync(giris, 'utf8').includes('api.resend.com')) bulunan.push(ad)
  }
  return bulunan.sort()
}

/**
 * `venthub_orders_status_check` sözlüğünü DEPODAKİ DDL'den çıkarır.
 *
 * Otorite aslında canlı DB'dir (pg_constraint) ve test canlı DB'ye bakamaz. Bu yüzden
 * burada depodaki DDL metni kullanılıyor VE bir kanarya ile korunuyor: hiç tanım
 * bulunamazsa ya da altıdan az değer çıkarsa kapı kırmızı olur. Yani "bulamadım" sessizce
 * "ihlal yok" diye okunamaz.
 */
function statusSozlugu(): string[] {
  const dosyalar: string[] = []
  const gez = (dizin: string) => {
    for (const ad of readdirSync(dizin)) {
      const yol = join(dizin, ad)
      const st = statSync(yol)
      if (st.isDirectory()) {
        if (ad === 'node_modules' || ad.startsWith('.')) continue
        gez(yol)
      } else if (ad.endsWith('.sql')) {
        dosyalar.push(yol)
      }
    }
  }
  gez(SUPABASE_KOK)

  // NOT: `s` (dotAll) bayragi tsconfig hedefinde YOK (TS1501). Ayni isi [\s\S] ile
  // yapiyoruz — bayrakla gelen kolayligi degil, DAVRANISI koruyoruz.
  const desen = /venthub_orders_status_check\s+CHECK\s*\(\(([\s\S]*?)\)\)/
  for (const yol of dosyalar) {
    const m = desen.exec(readFileSync(yol, 'utf8'))
    if (!m) continue
    const degerler = [...m[1].matchAll(/'([a-z_]+)'::text/g)].map((x) => x[1])
    if (degerler.length > 0) return [...new Set(degerler)].sort()
  }
  return []
}

/** §B2.3 tablosundaki `status` sütunundan okunan durum adları. */
function cetveldekiDurumlar(): string[] {
  const metin = cetvelMetni()
  const bolum = metin.split(/^###\s+B2\.3\s/m)[1]
  if (!bolum) return []
  const tablo = bolum.split(/^##\s/m)[0]
  const adlar = [...tablo.matchAll(/^\|\s*`([a-z_]+)`\s*\|/gm)].map((m) => m[1])
  return [...new Set(adlar)].sort()
}

describe('INV-NOTIFY-1 · bildirim envanteri cetvelde tam', () => {
  it('e-posta gonderen HER uc, cetvelin B2.1 tablosunda adiyla gecmeli', () => {
    const uclar = resendGonderenUclar()

    // KAPSAM KANARYASI: tarama gercekten dosya gordu mu? Sifir uc bulmak "ihlal yok"
    // degil, "hicbir yere bakmadim" demektir.
    expect(uclar.length).toBeGreaterThan(0)

    const metin = cetvelMetni()
    const eksik = uclar.filter((ad) => !metin.includes(`\`${ad}\``))

    expect(
      eksik,
      `Bu uclar e-posta gonderiyor ama docs/standards/notification-standard.md icinde ` +
        `hic gecmiyor: ${eksik.join(', ')}. Yeni bir bildirim ucu eklediyseniz once ` +
        `cetvelin B2.1 tablosuna satir ekleyin — "bildirimlerimiz neler" sorusunun tek ` +
        `cevabi orasidir.`,
    ).toEqual([])
  })

  it('cetvel, olcum tabanini ve dis kaynagini yazmis olmali', () => {
    const metin = cetvelMetni()
    expect(metin).toContain('KAYNAK/CETVEL')
    expect(metin).toContain('ÇELİŞEN-MEVCUT')
    expect(metin).toMatch(/ÖLÇÜLEMEDİ/)
  })
})

describe('INV-NOTIFY-2 · siparis durumu kapsam tablosu tam', () => {
  it('status CHECK sozlugundeki HER deger B2.3 tablosunda bir satira sahip olmali', () => {
    const dbDurumlari = statusSozlugu()

    // KANARYA: DDL bulunamadiysa ya da alti degerden az cikardiysak, karsilastirma
    // anlamsizdir. Bos kume ile bos kumeyi karsilastirip yesil kalmayi engeller.
    expect(
      dbDurumlari.length,
      'venthub_orders_status_check tanimi supabase/ altinda bulunamadi ya da cok az ' +
        'deger cikardi — kapi olcemedigi icin kirmizi. Ayiklayiciyi onarin.',
    ).toBeGreaterThanOrEqual(6)

    const cetvelDurumlari = cetveldekiDurumlar()
    const eksik = dbDurumlari.filter((d) => !cetvelDurumlari.includes(d))

    expect(
      eksik,
      `Bu siparis durumlari icin bildirim karari cetvelde YAZILI DEGIL: ${eksik.join(', ')}. ` +
        `"Bildirim yok" gecerli bir cevaptir; satirin HIC olmamasi degil — cunku o zaman ` +
        `"karar verilmedi" ile "bildirim istemiyoruz" ayirt edilemez.`,
    ).toEqual([])
  })
})
