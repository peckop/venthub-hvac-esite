#!/usr/bin/env node
/**
 * INV-STORAGE-YAZMA-1 nöbetçisi — storage.objects'e KAPISIZ yazma politikası açılmasını yakalar.
 *
 * REC-442. Ölçüldü (2026-09-29, canlı prod): category-images kovasında "Auth Upload/Update/Delete"
 * politikaları yalnız `auth.role() = 'authenticated'` diyordu; kayıt açık olduğundan giriş yapmış
 * herkes kamuya açık kovaya yükleyebilirdi. Politikalar HİÇBİR migration'da yoktu (panelden elle
 * oluşturulmuştu), yani dosya tarayan bir kapı onları göremezdi: bu nöbetçi CANLI KATALOĞU okur.
 * Onarım #1513'te indi; bu nöbetçi sınıfın geri gelmesini yakalar.
 *
 * Kardeşi: anon-yazma-nobetcisi.mjs (aynı ilan+mandal deseni, aynı bağlantı/TLS düzeni).
 *
 * ⚠SINIR (adıyla): nöbetçi politika VARLIĞINI ve ifadesindeki kapı BELİRTECİNİ ölçer, koşulun
 * gerçekten kısıtlayıcı olduğunu değerlendirmez; kova düzeyi MIME/boyut sınırı da kapsam dışıdır.
 * "İlan edildi" otomatik "güvenli" DEMEK DEĞİLDİR (ayrıntı: storage-yazma-politika-ilani.json).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

import { resolveTls } from '../../katalog/katalog-sayim.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SORGU_YOLU = path.join(__dirname, 'storage-yazma-nobetcisi.sql')
const ILAN_YOLU = path.join(__dirname, 'storage-yazma-politika-ilani.json')

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (!dbUrl) {
    // FAIL-CLOSED: ölçememek geçmek değildir; güvenlik nöbetçisi sessizce atlanamaz.
    console.error('::error title=storage yazma nobetcisi::SUPABASE_DB_URL yok — nobetci OLCEMEDI. Olcememek gecmek DEGILDIR.')
    process.exit(1)
  }

  const sorgu = fs.readFileSync(SORGU_YOLU, 'utf8')
  const ilan = JSON.parse(fs.readFileSync(ILAN_YOLU, 'utf8'))
  const ilanli = new Set((ilan.ilan_edilen_politikalar ?? []).map((k) => k.politika))

  // sslmode bağlantı dizesinden sökülür: node-postgres URL'deki sslmode'u kendi ssl nesnemizin
  // YERİNE geçirebilir ve doğrulanmış CA sessizce devre dışı kalır (kardeş kapıdan öğrenildi).
  const temizUrl = dbUrl.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')

  const client = new pg.Client({ connectionString: temizUrl, ssl: resolveTls() })
  await client.connect()
  let satirlar
  try {
    const r = await client.query(sorgu)
    satirlar = r.rows
  } finally {
    await client.end()
  }

  console.error(`storage-yazma-nobetcisi: ${satirlar.length} kapisiz yazma politikasi bulundu, ilanda ${ilanli.size} kalem var.`)

  const ihlaller = satirlar.filter((s) => !ilanli.has(s.policyname))
  // İlan edilmiş ama ARTIK OLMAYAN kalemler de bildirilir: ilan bayatlamasın (mandal iki yönlü).
  const bulunan = new Set(satirlar.map((s) => s.policyname))
  const olu = [...ilanli].filter((k) => !bulunan.has(k))

  for (const s of satirlar) {
    const durum = ilanli.has(s.policyname) ? 'ILAN EDILMIS' : 'ILAN EDILMEMIS'
    console.error(`  [${durum}] storage.objects.${s.policyname} cmd=${s.cmd} roller=${s.roller} qual=${s.qual || '(yok)'} with_check=${s.with_check || '(yok)'}`)
  }

  if (olu.length > 0) {
    console.error(`::warning title=storage yazma nobetcisi::ilanda OLU kalem var (${olu.join(', ')}) — politika kaldirilmis, ilan guncellenmeli.`)
  }

  if (ihlaller.length > 0) {
    console.error('::error title=storage yazma nobetcisi::ILAN EDILMEMIS kapisiz yazma politikasi bulundu — giris yapmis herkes bir kovaya yukleyebilir/silebilir olabilir.')
    for (const s of ihlaller) {
      console.error(`::error::storage.objects.${s.policyname} (cmd=${s.cmd}, roller=${s.roller}, qual=${s.qual || '(yok)'}, with_check=${s.with_check || '(yok)'})`)
    }
    console.error('YAPILACAK: politika gercekten herkese yazma veriyorsa KALDIR (migration = Recep kapisi); vermiyorsa scripts/db/checks/storage-yazma-politika-ilani.json\'a GEREKCESIYLE ve ELLE DOGRULANMIS olarak ekle.')
    process.exit(1)
  }

  console.error('storage-yazma-nobetcisi: TEMIZ — ilan edilmemis kapisiz yazma politikasi YOK.')
}

main().catch((e) => {
  console.error(`::error title=storage yazma nobetcisi::nobetci KOSAMADI: ${e.message}`)
  process.exit(1)
})
