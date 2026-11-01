#!/usr/bin/env node
/**
 * INV-WEBHOOK-YANIT-1 nöbetçisi — önbellek webhook'unun 401 (ve diğer başarısız) yanıtlarını sayar.
 *
 * ALT-121 (ALT-76 PR 2 güvenlik raporu, bulgu 1-2). handle_supabase_webhook() imzalı gönderince
 * zaman damgası TETİK anında alınır, pg_net isteği COMMIT sonrası gönderir: 5 dakikadan uzun tek
 * işlem ya da birikmiş kuyruk olayları sunucuda 'bayat' (401) olur ve sayfa yenileme SESSİZCE kaybolur
 * (vitrin ISR yedeğine, en çok 1 saat, kalır). İmza bütünüyle bozulursa (yanlış anahtar, başlık kayması)
 * yanıtların TAMAMI 401 olur. Hiçbir alarm yoktu; tek iz net._http_response tablosudur.
 *
 * Ölçüm yeri: canlı veritabanı (SUPABASE_DB_URL), salt okuma: select status_code, timed_out, error_msg,
 * created from net._http_response. Tablo pg_net.ttl (ölçüldü 2026-11-01: 6 saat) kadar saklar.
 *
 * ⚠SINIR (adıyla):
 *  (1) Bu nöbetçi yalnız KOŞTUĞU ANDAKİ son ~6 saati görür; PR/master push'ta koşar, zamanlanmış değildir.
 *      6 saatten eski 401'ler görünmez. Kalıcı sayaç ve zamanlama ayrı karardır (cron = Recep, karar 53).
 *  (2) net._http_response'ta adres sütunu yoktur: tablo TÜM pg_net çağrılarını (teklif ve ödeme bildirimleri
 *      dahil) içerir. Bu yüzden sayı "önbellek webhook'u" değil "pg_net giden istekleri" için ölçümdür.
 *  (3) Kırmızı eşiği (aşağıda) bir ÖNERİDİR, ölçülmüş bir taban değildir; ilk haftalarda gözle ayarlanır.
 *
 * Davranış: tek bir başarısız yanıt ::warning verir (PR'ı bloklamaz). Pencerede en az KIRMIZI_ASGARI
 * yanıt varsa ve bunların KIRMIZI_ORAN'ı ya da fazlası 401 ise (imza sistematik bozulmuş) KIRMIZI.
 * Ölçememek geçmek değildir: SUPABASE_DB_URL yoksa ya da sorgu patlarsa KIRMIZI.
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import pg from 'pg'

import { resolveTls } from '../../katalog/katalog-sayim.mjs'

export const KIRMIZI_ASGARI = 5
export const KIRMIZI_ORAN = 0.5

const SORGU =
  'select status_code, coalesce(timed_out, false) as timed_out, (error_msg is not null) as hata, created from net._http_response'

/**
 * Saf karar: satırlardan özet ve hüküm çıkarır (ağ/DB yok; testlenir).
 * @param {Array<{status_code: number|null, timed_out?: boolean, hata?: boolean}>} satirlar
 */
export function degerlendir(satirlar) {
  const durumlar = {}
  let bayat401 = 0
  let zamanAsimi = 0
  let hata = 0
  let basarisiz = 0
  for (const s of satirlar) {
    const kod = s.status_code ?? 'yok'
    durumlar[kod] = (durumlar[kod] ?? 0) + 1
    const basarili = typeof s.status_code === 'number' && s.status_code >= 200 && s.status_code < 300
    if (s.status_code === 401) bayat401 += 1
    if (s.timed_out) zamanAsimi += 1
    if (s.hata) hata += 1
    if (!basarili || s.timed_out || s.hata) basarisiz += 1
  }
  const toplam = satirlar.length
  const oran401 = toplam > 0 ? bayat401 / toplam : 0
  const kirmizi = toplam >= KIRMIZI_ASGARI && oran401 >= KIRMIZI_ORAN
  const uyari = !kirmizi && basarisiz > 0
  return { toplam, durumlar, bayat401, zamanAsimi, hata, basarisiz, oran401, kirmizi, uyari }
}

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    console.error(
      '::error title=webhook yanit nobetcisi::SUPABASE_DB_URL yok — nobetci OLCEMEDI. Olcememek gecmek DEGILDIR.',
    )
    process.exit(1)
  }
  // sslmode bağlantı dizesinden sökülür (kardeş nöbetçilerle aynı gerekçe: doğrulanmış CA sessizce düşmesin).
  const temizUrl = dbUrl.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  const client = new pg.Client({ connectionString: temizUrl, ssl: resolveTls() })
  await client.connect()
  let satirlar
  try {
    satirlar = (await client.query(SORGU)).rows
  } finally {
    await client.end()
  }

  const o = degerlendir(satirlar)
  console.error(
    `webhook-yanit-nobetcisi: ${o.toplam} yanit (pg_net, son ~6 saat), durumlar=${JSON.stringify(o.durumlar)}, ` +
      `401=${o.bayat401}, zaman asimi=${o.zamanAsimi}, hata=${o.hata}.`,
  )

  if (o.kirmizi) {
    console.error(
      `::error title=webhook yanit nobetcisi::yanitlarin %${Math.round(o.oran401 * 100)}'i 401 (${o.bayat401}/${o.toplam}) — ` +
        'imza sistematik bozulmus olabilir; sayfa yenileme duruyor olabilir.',
    )
    console.error(
      'YAPILACAK: sunucu gunlugunde "imza: gecersiz|bayat" ayrimina bak; imza kaynakli ise ' +
        'scripts/db/rollback/20261031230000_webhook_imzali_gonderim_geri_al.sql (Recep sozuyle) ile duz secret yoluna don.',
    )
    process.exit(1)
  }
  if (o.uyari) {
    console.error(
      `::warning title=webhook yanit nobetcisi::${o.basarisiz} basarisiz pg_net yaniti (401=${o.bayat401}, ` +
        `zaman asimi=${o.zamanAsimi}, hata=${o.hata}) — tek tek olaylar kacmis olabilir; ISR yedegi en cok 1 saat.`,
    )
    return
  }
  console.error('webhook-yanit-nobetcisi: TEMIZ — pencerede basarisiz pg_net yaniti YOK.')
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  main().catch((e) => {
    console.error(`::error title=webhook yanit nobetcisi::nobetci KOSAMADI: ${e.message}`)
    process.exit(1)
  })
}
