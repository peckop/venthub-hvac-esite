import { describe, expect, it } from 'vitest'

/**
 * INV-QUOTE-3 · REC-54 Kalem 1 — TEKLİF INSERT POLİTİKALARI DURUMU ÇİVİLER
 *
 * KORUNAN DEĞİŞMEZ:
 *   "Teklif tablolarına INSERT eden her politika ya `is_admin_user()` şartı taşır,
 *    ya da yazılan (veya bağlanılan) teklifin durumunu `'requested'`'a ÇİVİLER."
 *
 * NİÇİN BU BİÇİMDE — INV-QUOTE-2 İLE FARKI:
 *   Kardeş kapı (INV-QUOTE-2, UPDATE tarafı) "yazan HER politika admin şartı taşır"
 *   diyebiliyordu, çünkü müşterinin meşru bir kalem-UPDATE'i YOK. Burada durum farklı:
 *   müşterinin `'requested'` teklif açması ve kendi `'requested'` teklifine kalem
 *   eklemesi MEŞRU (v1'den beri canlı). Bu yüzden "hepsi admin olsun" demek yanlış
 *   olurdu — bugünkü doğru politikaları kırmızıya düşürürdü. Korunması gereken şey
 *   admin tekeli değil, **durum sınırı**.
 *
 * TEHLİKE (canlı prod ölçümü, 2026-08-27, AUTH):
 *   `'draft'` admin'in teklifi YAZDIĞI durumdur; fiyat orada oluşur. `authenticated`
 *   rolünün INSERT kolon yetkisi venthub_quotes'ta 7, venthub_quote_items'ta 8 kolondur
 *   ve grant admin ile müşteriye AYNI ANDA verilir (admin de `authenticated`'tır).
 *   Yani durumu çivilemeyen bir müşteri-INSERT politikası eklenirse, müşteri kendine
 *   doğrudan `'draft'` teklif üretip fiyat kolonlarını yazabilir ve akışın tamamını
 *   atlayabilir. `with check` bunu kendiliğinden engellemez — engelleyen şey, bugün
 *   politikaların gövdesinde duran `status = 'requested'` çivisidir.
 *
 * NİÇİN R5 VE INV-QUOTE-2 BUNU GÖRMEZ:
 *   R5 **koddaki** fiyat yazımını yasaklar; INV-QUOTE-2 **UPDATE** politikalarını
 *   tutar. Buradaki yüzey INSERT politikası eklenmesidir — üçü ayrı yüzey.
 *
 * KAPSAM ADA DEĞİL İÇERİĞE BAĞLI: dosya adına bakan bir kapı yeniden adlandırmayla
 * atlatılır. Bütün migration'lar okunur, seçim içerikten yapılır.
 *
 * YORUM KÖRLÜĞÜ: metin taraması yorumla tatmin olur. `-- is_admin_user()` yazan bir
 * yorum kapıyı yeşil tutardı; SQL yorumları CRLF-güvenli ([^\r\n], NOKTA DEĞİL) sıyrılır.
 *
 * BOŞ EVREN KORUMASI: "ihlal 0" ile "hiç ölçmedim" aynı çıktıyı vermemelidir.
 *
 * BU KAPININ ÖLÇMEDİĞİ (bilerek yazılı, sınırı gizlemiyorum):
 *   1. Politikanın canlıda ETKİN olduğunu ölçmez — kaynak okur, veritabanı değil.
 *      Davranışsal kanıt ayrı koldadır (quote-standard.md:530, begin/rollback).
 *   2. Şartların KONJONKSİYON içinde olduğunu ispatlamaz: `status = 'requested'`
 *      dizesi bir `or` dalında dursaydı çivi işlevi görmezdi ama bu kapı yeşil kalırdı.
 *      Bu boşluğun bekçisi 4. testtir: politika adı kümesi RATCHET'lidir, yani yeni
 *      ya da yeniden adlandırılmış her politika kapıyı kırmızıya düşürür ve insan
 *      gözden geçirmesini ZORLAR. Sessizce eklenemez.
 */

declare global {
  interface ImportMeta {
    glob(
      pattern: string,
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

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
  tablo: string
  komut: string
  govde: string
}

/**
 * `create policy` / `alter policy` bloklarını çıkarır. `alter policy` de dahildir:
 * mevcut bir politikanın şartını GEVŞETMEK, yeni politika eklemek kadar tehlikelidir
 * ve yalnız `create` arayan bir kapı onu göremezdi. `drop policy` eşleşmez.
 */
function insertPolitikalari(): PolitikaBlogu[] {
  const re =
    /(create|alter)\s+policy\s+"?([a-z_0-9]+)"?\s+on\s+public\.(venthub_quotes|venthub_quote_items)\b([\s\S]*?);/gi
  const out: PolitikaBlogu[] = []
  for (const [dosya, ham] of Object.entries(ALL_MIGRATIONS)) {
    const sql = stripSqlComments(ham)
    let m: RegExpExecArray | null
    while ((m = re.exec(sql)) !== null) {
      const govde = m[4]
      const komutEsleme = govde.match(/for\s+(all|select|insert|update|delete)\b/i)
      out.push({
        dosya: dosya.replace(/\\/g, '/'),
        ad: m[2],
        tablo: m[3],
        // `for` yazılmamışsa PostgreSQL varsayılanı ALL'dır — INSERT'i de kapsar.
        komut: (komutEsleme?.[1] ?? 'all').toLowerCase(),
        govde,
      })
    }
    re.lastIndex = 0
  }
  return out
}

const HEPSI = insertPolitikalari()
const YAZAN_KOMUTLAR = new Set(['insert', 'all'])
const INSERT_POLITIKALARI = HEPSI.filter((p) => YAZAN_KOMUTLAR.has(p.komut))

const adminSarti = (p: PolitikaBlogu): boolean => /is_admin_user\s*\(\s*\)/i.test(p.govde)
/** `status = 'requested'` — kendi sütunu ya da bağlı teklifin (`q.status`) sütunu. */
const durumCivisi = (p: PolitikaBlogu): boolean =>
  /\bstatus\s*=\s*'requested'/i.test(p.govde)

describe('INV-QUOTE-3 · teklif INSERT politikaları durumu çiviler', () => {
  it('boş evren koruması: teklif tablolarında politika BULUNDU', () => {
    expect(
      HEPSI.length,
      'venthub_quotes/venthub_quote_items üzerinde HİÇ politika bulunamadı. Bu ' +
        '"ihlal yok" DEĞİL, "ölçüm yok" demektir: tablo yeniden adlandırılmış, ' +
        'migration klasörü kapsam dışı kalmış ya da regex bozulmuş olabilir.',
    ).toBeGreaterThan(0)
  })

  it('boş evren koruması: INSERT eden politika en az bir tane BULUNDU', () => {
    expect(
      INSERT_POLITIKALARI.length,
      'Teklif tablolarında hiç insert/all politikası bulunamadı. Bu testin koruduğu ' +
        'küme tam olarak budur; küme boşsa test her zaman yeşil verir ve bekçi ölür.',
    ).toBeGreaterThan(0)
  })

  it('INSERT eden HER politika ya admin şartı ya durum çivisi taşır', () => {
    const ihlal = INSERT_POLITIKALARI.filter(
      (p) => !adminSarti(p) && !durumCivisi(p),
    ).map((p) => `${p.ad} (${p.tablo}, ${p.komut}) — ${p.dosya}`)

    expect(
      ihlal,
      'Teklif tablosuna INSERT eden bir politika NE is_admin_user() şartı NE de ' +
        "status = 'requested' çivisi taşıyor. Böyle bir politika müşterinin kendine " +
        "doğrudan 'draft' teklif üretmesine izin verir; 'draft' fiyatın oluştuğu " +
        'admin durumudur ve INSERT kolon yetkisi (quotes 7, kalem 8 kolon) zaten ' +
        '`authenticated` rolüne açıktır — admin de authenticated olduğu için grant ' +
        'daraltmak ÇÖZÜM DEĞİLDİR.\n' +
        'Doğru çözüm: politika ya admin şartı taşısın, ya da yazdığı/bağlandığı ' +
        "teklifin durumunu 'requested' değerine çivilesin.",
    ).toEqual([])
  })

  it('ratchet: INSERT politikası adları beklenen kümede kalır', () => {
    // Sessiz ekleme/yeniden adlandırma bu satırda kırmızı yanar ve insan gözden
    // geçirmesini ZORLAR. Yükseltmek serbesttir — ama bilerek.
    const adlar = [...new Set(INSERT_POLITIKALARI.map((p) => p.ad))].sort()
    expect(
      adlar,
      'Teklif tablolarına INSERT eden politika kümesi değişti. Yeni politika ' +
        'eklendiyse admin şartını ya da durum çivisini taşıdığını DOĞRULA ve bu ' +
        'listeyi bilerek güncelle. Bu ratchet, 3. testin ölçemediği durumun ' +
        '(şartın bir `or` dalında kalması) tek bekçisidir.',
    ).toEqual([
      'quote_items_insert_admin',
      'quote_items_insert_own_requested',
      'quotes_insert_admin_draft',
      'quotes_insert_own_requested',
    ])
  })
})
