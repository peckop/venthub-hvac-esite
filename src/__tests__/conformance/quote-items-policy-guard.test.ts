import { describe, expect, it } from 'vitest'

/**
 * INV-QUOTE-2 · T164-VH — `venthub_quote_items` UPDATE POLİTİKASI ADMİN ŞARTI TAŞIMALI
 *
 * KORUNAN DEĞİŞMEZ (canlı prod ölçümü, 2026-08-27, AUTH):
 *   "venthub_quote_items ASLA müşterinin sağlayabileceği bir UPDATE politikası kazanmayacak."
 *
 * NİÇİN BİR KAPI GEREKİYOR — ölçülmüş durum, varsayım değil:
 *   `authenticated` rolünün kalem tablosundaki UPDATE kolon yetkisi 8 kolondur ve
 *   içinde `unit_price, currency, discount_rate, tax_rate, line_total` VARDIR.
 *   Grant'in geniş olması ZORUNLUDUR, çünkü admin de `authenticated`'tır: kolon
 *   yetkisi admin'e ve müşteriye AYNI ANDA verilir. Yani bugün müşterinin teklif
 *   tutarını değiştirememesinin TEK sebebi, kalem tablosunda UPDATE politikasının
 *   yalnızca `quote_items_update_admin` olması ve onun `is_admin_user()` şartı
 *   taşımasıdır (ölçüm: admin şartı taşımayan UPDATE politikası sayısı = 0).
 *
 *   Koruma tek bacaklıdır ve o bacağı hiçbir şey tutmuyordu. Yarın biri
 *   "müşteri kendi `requested` kalemlerini düzeltebilsin" diye bir politika
 *   eklerse fiyat kolonları AYNI ANDA yazılabilir olur — grant katmanı ZATEN
 *   açıktır ve `with check` bunu yakalayamaz (eski değere referans veremez).
 *
 * NİÇİN MEVCUT R5 BUNU GÖRMEZ:
 *   R5 **koddaki** fiyat-kolonu yazımını yasaklar. Buradaki tehlike kod değil
 *   **politika eklenmesi**. Farklı yüzey, farklı kapı.
 *
 * ÇÖZÜM GRANT'İ DARALTMAK DEĞİLDİR (bilerek kapsam dışı):
 *   Grant daraltılırsa admin fiyat giremez. Mesele grant değil politika disiplini.
 *
 * KAPSAM ADA DEĞİL İÇERİĞE BAĞLI (R2'nin T134 dersi): dosya adına bakan bir kapı,
 * yeniden adlandırmayla sessizce atlatılır. Bütün migration'lar okunur, seçim
 * içerikten yapılır.
 *
 * YORUM KÖRLÜĞÜ (bu deponun ölçülmüş dersi): metin taraması yorumla tatmin olur.
 * `-- is_admin_user()` yazan bir yorum kapıyı yeşil tutardı; SQL yorumları
 * CRLF-güvenli biçimde ([^\r\n], NOKTA DEĞİL) sıyrılır.
 *
 * BOŞ EVREN KORUMASI (2026-08-27'nin filo dersi): "ihlal 0" ile "hiç ölçmedim"
 * aynı çıktıyı vermemelidir. Politika hiç bulunamazsa gösterge AYIRT ETMİYOR
 * demektir; o hâlde test yeşile kaçmaz, KIRMIZI verir.
 */

const ALL_MIGRATIONS: Record<string, string> = import.meta.glob(
  '/supabase/migrations/*.sql',
  { query: '?raw', import: 'default', eager: true },
)

/** SQL satır-yorumlarını CRLF-güvenli sıyırır. */
function stripSqlComments(sql: string): string {
  return sql.replace(/--[^\r\n]*/g, '')
}

interface PolitikaBlogu {
  dosya: string
  ad: string
  komut: string
  govde: string
}

/**
 * `create policy` / `alter policy` bloklarını çıkarır.
 * `alter policy` de dahildir: mevcut bir politikanın şartını GEVŞETMEK de
 * yeni politika eklemek kadar tehlikelidir ve yalnız `create` arayan bir kapı
 * onu göremezdi.
 */
function kalemPolitikalari(): PolitikaBlogu[] {
  const re =
    /(create|alter)\s+policy\s+"?([a-z_0-9]+)"?\s+on\s+public\.venthub_quote_items\b([\s\S]*?);/gi
  const out: PolitikaBlogu[] = []
  for (const [dosya, ham] of Object.entries(ALL_MIGRATIONS)) {
    const sql = stripSqlComments(ham)
    let m: RegExpExecArray | null
    while ((m = re.exec(sql)) !== null) {
      const govde = m[3]
      const komutEsleme = govde.match(/for\s+(all|select|insert|update|delete)\b/i)
      out.push({
        dosya: dosya.replace(/\\/g, '/'),
        ad: m[2],
        // `for` yazılmamışsa PostgreSQL varsayılanı ALL'dır — yani UPDATE'i de kapsar.
        komut: (komutEsleme?.[1] ?? 'all').toLowerCase(),
        govde,
      })
    }
    re.lastIndex = 0
  }
  return out
}

const POLITIKALAR = kalemPolitikalari()
const YAZAN_KOMUTLAR = new Set(['update', 'all'])
const YAZAN_POLITIKALAR = POLITIKALAR.filter((p) => YAZAN_KOMUTLAR.has(p.komut))

describe('INV-QUOTE-2 · venthub_quote_items yazma politikası admin şartı', () => {
  it('boş evren koruması: kalem tablosunda politika BULUNDU (yoksa bekçi ayırt etmiyor)', () => {
    expect(
      POLITIKALAR.length,
      'venthub_quote_items üzerinde HİÇ politika bulunamadı. Bu "ihlal yok" DEĞİL, ' +
        '"ölçüm yok" demektir: tablo yeniden adlandırılmış, migration klasörü kapsam ' +
        'dışı kalmış ya da regex bozulmuş olabilir. Ayırt etmeyen bir gösterge kanıt üretmez.',
    ).toBeGreaterThan(0)
  })

  it('boş evren koruması: YAZAN (update/all) politika en az bir tane BULUNDU', () => {
    expect(
      YAZAN_POLITIKALAR.length,
      'Kalem tablosunda hiç update/all politikası bulunamadı. Bu testin koruduğu şey ' +
        'tam olarak bu kümedir; küme boşsa test her zaman yeşil verir ve bekçi ölür.',
    ).toBeGreaterThan(0)
  })

  it('kalem tablosuna yazan HER politika is_admin_user() şartı taşır', () => {
    const ihlal = YAZAN_POLITIKALAR.filter((p) => !/is_admin_user\s*\(\s*\)/i.test(p.govde))
    expect(
      ihlal.map((p) => `${p.ad} (${p.komut}) — ${p.dosya}`),
      'venthub_quote_items üzerinde is_admin_user() şartı TAŞIMAYAN bir yazma politikası ' +
        'var. Bu politika, `authenticated` rolüne zaten açık olan fiyat kolonlarını ' +
        '(unit_price, currency, discount_rate, tax_rate, line_total) müşteriye AÇAR — ' +
        've `with check` bunu yakalayamaz, çünkü eski değere referans veremez. ' +
        'Müşteri kendi teklifinin tutarını değiştirip kabul edebilir hâle gelir.\n' +
        'Grant\'i daraltmak ÇÖZÜM DEĞİLDİR: admin de authenticated\'tır, daraltmak ' +
        'admin fiyat girişini kırar. Doğru çözüm politikanın admin şartı taşımasıdır.',
    ).toEqual([])
  })

  it('ratchet: kalem tablosuna yazan politika sayısı beklenen kümede kalır', () => {
    // Sayı büyüdüğünde bu satır kırmızı yanar ve YENİ politikanın bilinçli olarak
    // gözden geçirilmesini zorlar. Yükseltmek serbesttir — ama SESSİZCE değil.
    const adlar = [...new Set(YAZAN_POLITIKALAR.map((p) => p.ad))].sort()
    expect(
      adlar,
      'Kalem tablosuna yazan politika kümesi değişti. Yeni bir politika eklendiyse ' +
        'is_admin_user() şartını taşıdığını doğrula ve bu listeyi bilerek güncelle.',
    ).toEqual(['quote_items_update_admin'])
  })
})
