import { describe, expect, it } from 'vitest'

/**
 * INV-ADMIN-CUSTOMER-1 — müşteri yönetimi yüzeyinin değişmezleri.
 *
 * NİÇİN (T059-VH · operasyon döngüsü denetimi §6):
 *
 *  (1) Kullanıcı listesi `paginationMode: 'none'` ile çalışıyor ve sorguda ne `range`
 *      ne `limit` vardı. PostgREST kendi azami satır sınırını uygular (varsayılan
 *      1000) ve **bunu haber vermez**: 1001. kullanıcıdan sonrası listede hiç
 *      görünmez, toplam sayı da doğru sanılır. Hata "yavaşlama" olarak değil,
 *      VERİNİN YOKLUĞU olarak ortaya çıkar.
 *  (2) Sunucu sayfalaması + istemci sıralaması birlikte YANILTICIDIR: istemci yalnız
 *      görünen sayfayı sıralar ve kullanıcıya "en yenisi bu" diye yanlış bir liste
 *      gösterir.
 *  (3) "Bu müşterinin siparişleri" görünümü yoktu; admin bir kullanıcıdan siparişine
 *      geçemiyordu.
 *
 * BU KUSURLAR BUGÜN GÖRÜNMEZ: prod'da 2 kullanıcı ve 0 sipariş var (2026-08-16
 * ölçümü). Yani hiçbir manuel test bunları yakalayamaz — kapı tam da bu yüzden var.
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

/** Yorumları at — kuralı ANLATAN yorum ihlal sayılmamalı (yanlış-KIRMIZI da kusurdur). */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
    .join('\n')
}

const usersUi = stripComments(ALL['/src/views/admin/AdminUsersTableBody.tsx'] ?? '')
const ordersUi = stripComments(ALL['/src/views/admin/OrdersTableBody.tsx'] ?? '')

describe('INV-ADMIN-CUSTOMER-1 · kullanıcı listesi', () => {
  it('kaynaklar okunabildi (stale-guard)', () => {
    // Yol yazım hatası bu dosyadaki HER testi sessizce "temiz"e çevirirdi.
    expect(usersUi.length).toBeGreaterThan(2000)
    expect(ordersUi.length).toBeGreaterThan(2000)
  })

  it('sayfalama SUNUCUDA — sessiz satır tavanı yok', () => {
    expect(
      /paginationMode:\s*'server'/.test(usersUi),
      "`paginationMode: 'none'` + limitsiz sorgu = PostgREST'in sessiz 1000-satır tavanı. " +
        'Bu hata veri YOKLUĞU olarak görünür ve hiçbir hata mesajı üretmez.',
    ).toBe(true)
    expect(
      /paginationMode:\s*'none'/.test(usersUi),
      "Kullanıcı tablosu artık `'none'` ile çalışmamalı.",
    ).toBe(false)
  })

  it('sorgu sayfa aralığını AÇIKÇA istiyor', () => {
    // `range` yoksa sunucu sayfalaması sözde kalır: tablo sayfa gösterir ama sorgu
    // hep aynı ilk bloğu çeker.
    expect(/\.range\(\s*offset/.test(usersUi), 'Sorguda `.range(offset, …)` olmalı.').toBe(true)
  })

  it('gerçek toplam `count` ile geliyor, sayfa uzunluğuyla DEĞİL', () => {
    /*
      `totalMatched: rows.length` sunucu sayfalamasında YANLIŞ olur: 50 satırlık
      sayfada toplam 50 görünür, sayfalama düğmeleri kaybolur ve kalan kayıtlara
      ulaşmanın yolu kalmaz. Sessiz tavanın ikinci biçimi budur.
    */
    expect(/count:\s*'exact'/.test(usersUi), "Sorgu `count: 'exact'` istemeli.").toBe(true)
    expect(
      /totalMatched:\s*typeof count === 'number'/.test(usersUi),
      '`totalMatched` sayfa uzunluğundan değil `count`tan türemeli.',
    ).toBe(true)
  })

  it('sıralama da SUNUCUDA — istemci sıralaması yalnız görünen sayfayı sıralardı', () => {
    expect(/sortMode:\s*'server'/.test(usersUi)).toBe(true)
  })
})

describe('INV-ADMIN-CUSTOMER-1 · müşteri → siparişleri', () => {
  it('kullanıcı satırından sipariş listesine bağlantı var', () => {
    expect(
      /\/admin\/orders\?customer=/.test(usersUi),
      'Admin bir kullanıcıdan siparişlerine geçebilmeli.',
    ).toBe(true)
  })

  it('bağlantı gizli-hover kabında DEĞİL (klavyeyle erişilebilir)', () => {
    /*
      Aksiyon sütunu `opacity-0 group-hover:opacity-100` ile gizli. Bağlantıyı oraya
      koymak onu klavye ve dokunmatik kullanıcısı için keşfedilemez kılardı; bağlantı
      bir GEZİNME yolu, fareyle bulunan bir aksiyon değil.
    */
    const linkIndex = usersUi.indexOf('/admin/orders?customer=')
    const around = usersUi.slice(Math.max(0, linkIndex - 800), linkIndex)
    expect(
      /opacity-0\s+group-hover:opacity-100/.test(around),
      'Sipariş bağlantısı hover ile açılan gizli kaba konmamalı.',
    ).toBe(false)
  })

  it('sipariş tablosu `customer` filtresini UYGULUYOR', () => {
    expect(
      /filters\.customer/.test(ordersUi) && /\.eq\('user_id',\s*customerId\)/.test(ordersUi),
      'Filtre okunmalı VE sorguya uygulanmalı — yalnız okunup kullanılmaması sessiz no-op olurdu.',
    ).toBe(true)
  })

  it('aktif müşteri filtresi kullanıcıya GÖRÜNÜYOR ve kaldırılabiliyor', () => {
    /*
      Sessiz filtre tuzağı: liste tek müşteriye daralmışken bunu söylemeyen bir ekran,
      admin'e "siparişler nereye gitti?" dedirtir. URL paylaşıldığında karşı taraf
      filtrelenmiş olduğunu hiç bilmez.
    */
    expect(/customerFilter\s*&&/.test(ordersUi), 'Filtre aktifken şerit gösterilmeli.').toBe(true)
    expect(
      /setFilter\('customer',\s*\[\]\)/.test(ordersUi),
      'Şeritte filtreyi kaldıran bir çıkış olmalı.',
    ).toBe(true)
  })
})

describe('INV-ADMIN-CUSTOMER-1 · müşteri e-postası', () => {
  it('e-posta `admin_list_all_users` RPC ile geliyor', () => {
    /*
      `user_profiles`ta e-posta YOK (auth.users'ta ve istemciden okunamaz). Eskiden
      alan `email: undefined` diye SABİT yazılıydı: admin kimin kim olduğunu göremiyor,
      CSV e-postasız çıkıyordu.
    */
    expect(/rpc\('admin_list_all_users'\)/.test(usersUi)).toBe(true)
    expect(
      /email:\s*undefined/.test(usersUi),
      'E-posta artık sabit `undefined` olmamalı.',
    ).toBe(false)
  })

  it('RPC listenin KAYNAĞI değil, yalnız zenginleştirme', () => {
    /*
      RPC sayfa parametresi almıyor, tüm kümeyi döndürüyor. Kaynak yapmak az önce
      kapatılan sessiz satır tavanını geri getirirdi. Sayfalama/sayım
      `user_profiles`ta kalmalı.
    */
    expect(/from\('user_profiles'\)/.test(usersUi)).toBe(true)
    expect(/\.range\(\s*offset/.test(usersUi)).toBe(true)
  })

  it('eksik e-posta eşlemesi SESSİZ GEÇMİYOR', () => {
    /*
      RPC yanıtı da bir üst sınıra takılabilir (PostgREST `max-rows` DB'den
      okunamadı — varsayılmıyor). Eşleme eksikse boş hücre "bu kullanıcının
      e-postası yok" gibi okunur; oysa gerçek "gösteremiyorum"dur.
    */
    expect(/emailsComplete/.test(usersUi), 'Eksiklik tespit edilmeli.').toBe(true)
    expect(
      /list\.length < count/.test(usersUi),
      'Eksiklik, dönen satır sayısı ile gerçek toplam KARŞILAŞTIRILARAK anlaşılmalı.',
    ).toBe(true)
    expect(
      /emailsIncomplete/.test(usersUi),
      'Eksiklik kullanıcıya BİLDİRİLMELİ.',
    ).toBe(true)
  })
})
