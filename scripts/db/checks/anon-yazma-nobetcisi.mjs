#!/usr/bin/env node
/**
 * INV-ANON-YAZMA-1 nöbetçisi — anon rolüne YENİ yazma politikası açılmasını yakalar.
 *
 * REC-138 yan bulgusu. Ölçüldü (2026-09-04, canlı prod): anon anahtarı prod istemci
 * paketinde AÇIK ve öyle tasarlanmış; anon vitrin tablolarını okuyabiliyor; yazmayı
 * engelleyen tek şey RLS politikası yokluğu — çünkü tablo düzeyinde anon rolüne
 * DELETE/INSERT/UPDATE **grant'i verilmiş**. Koruma TEK KATMANDA.
 *
 * Bu nöbetçi grant'ları düzeltmez (o migration ister = Recep kapısı); sınıfı GÖRÜNÜR
 * tutar ve regresyonu yakalar: ilan edilmemiş bir yazma politikası çıkarsa KIRMIZI.
 *
 * ⭐NİÇİN İLAN + MANDAL, "politika varsa kırmızı" DEĞİL: ilk ölçümde canlıda bir kalem
 * çıktı (`order_invoices_admin_insert`, roles={public}, with_check=is_admin_user()) ve
 * o kalem MEŞRU — anon için koşul false döner. "Varsa kırmızı" yazsaydım kapı doğar
 * doğmaz sahte kırmızı verir ve güvenilmez olurdu.
 *
 * ⚠SINIR (adıyla): bu nöbetçi politika VARLIĞINI ölçer, KOŞULUNU değerlendirmez.
 * `with_check` içindeki fonksiyonun anon için gerçekten false döndüğü SQL ile statik
 * kanıtlanamaz; ilan dosyasındaki her kalem ELLE doğrulanmıştır ve yenisi eklenirken
 * aynı doğrulama elle yapılmalıdır. "İlan edildi" otomatik "güvenli" DEMEK DEĞİLDİR.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

import { resolveTls } from '../../katalog/katalog-sayim.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_KOK = path.join(__dirname, '..', '..', '..')
const SORGU_YOLU = path.join(__dirname, 'anon-yazma-nobetcisi.sql')
const ILAN_YOLU = path.join(REPO_KOK, 'docs', 'anon-yazma-politika-ilani.json')

/** İlan kalemini karşılaştırma anahtarına indirger. */
const anahtar = (t, p) => `${t}::${p}`

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    // FAIL-CLOSED. db-advisor'ın "Skipping" deseni BİLEREK taklit edilmedi: bu bir
    // güvenlik nöbetçisi ve sessizce atlanması tam da korktuğumuz şey (§29).
    console.error('::error title=anon yazma nobetcisi::SUPABASE_DB_URL yok — nobetci OLCEMEDI. Olcememek gecmek DEGILDIR.')
    process.exit(1)
  }

  const sorgu = fs.readFileSync(SORGU_YOLU, 'utf8')
  const ilan = JSON.parse(fs.readFileSync(ILAN_YOLU, 'utf8'))
  const ilanli = new Set((ilan.ilan_edilen_politikalar ?? []).map((k) => anahtar(k.tablo, k.politika)))

  /**
   * ⭐`sslmode` BAĞLANTI DİZESİNDEN SÖKÜLÜR — kardeş kapıdan öğrenildi.
   *
   * `scripts/db/checks/rls-role-coverage.mjs:112-116` bu tuzağı zaten çözmüş:
   * node-postgres, URL'deki `sslmode` parametresini bizim `ssl` nesnemizin YERİNE
   * geçirebiliyor; yani depodaki doğrulanmış CA sessizce devre dışı kalır ve
   * `rejectUnauthorized` beklentisi kaybolur. Nöbetçiyi yazarken bu adım eksikti,
   * komşu betiği ölçünce çıktı. Aynı sunucuya aynı sertifikayla bağlanan iki betiğin
   * biri korunup öteki korunmasız kalmasın.
   */
  const sslmodeVardi = /[?&]sslmode=/.test(dbUrl)
  const temizUrl = dbUrl.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (sslmodeVardi) console.error('anon-yazma-nobetcisi: baglanti dizesindeki sslmode kaldirildi')

  const client = new pg.Client({ connectionString: temizUrl, ssl: resolveTls() })
  await client.connect()
  let satirlar
  try {
    const r = await client.query(sorgu)
    satirlar = r.rows
  } finally {
    await client.end()
  }

  console.error(`anon-yazma-nobetcisi: ${satirlar.length} yazma politikasi bulundu, ilanda ${ilanli.size} kalem var.`)

  const ihlaller = satirlar.filter((s) => !ilanli.has(anahtar(s.tablename, s.policyname)))
  // İlan edilmiş ama ARTIK OLMAYAN kalemler de bildirilir: ilan bayatlamasın (mandal
  // iki yönlü çalışır — kalem kaldırıldıysa ilandan da düşmeli).
  const bulunan = new Set(satirlar.map((s) => anahtar(s.tablename, s.policyname)))
  const olu = [...ilanli].filter((k) => !bulunan.has(k))

  for (const s of satirlar) {
    const durum = ilanli.has(anahtar(s.tablename, s.policyname)) ? 'ILAN EDILMIS' : 'ILAN EDILMEMIS'
    console.error(`  [${durum}] ${s.tablename}.${s.policyname} cmd=${s.cmd} roller=${s.roller} with_check=${s.with_check || '(yok)'}`)
  }

  if (olu.length > 0) {
    console.error(`::warning title=anon yazma nobetcisi::ilanda OLU kalem var (${olu.join(', ')}) — politika kaldirilmis, ilan guncellenmeli.`)
  }

  if (ihlaller.length > 0) {
    console.error('::error title=anon yazma nobetcisi::ILAN EDILMEMIS yazma politikasi bulundu — anon anahtari HERKESE ACIK oldugu icin bu bir yazma yolu olabilir.')
    for (const s of ihlaller) {
      console.error(`::error::${s.tablename}.${s.policyname} (cmd=${s.cmd}, roller=${s.roller}, with_check=${s.with_check || '(yok)'})`)
    }
    console.error('YAPILACAK: politika gercekten anon\'a yazma veriyorsa KALDIR; vermiyorsa (kosulu yetki fonksiyonu ise) docs/anon-yazma-politika-ilani.json\'a GEREKCESIYLE ve ELLE DOGRULANMIS olarak ekle.')
    process.exit(1)
  }

  console.error('anon-yazma-nobetcisi: TEMIZ — ilan edilmemis yazma politikasi YOK.')
}

main().catch((e) => {
  console.error(`::error title=anon yazma nobetcisi::nobetci KOSAMADI: ${e.message}`)
  process.exit(1)
})
