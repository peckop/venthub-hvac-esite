/**
 * ESKİ ADRES HARİTASI ÇALIŞTIRICISI (ALT-37a; plan rec-adres-agac-tek-yayin §4.1, ALT-13 parçası).
 *
 * NE YAPAR: `eskiAdresHaritasiUret` (src/lib/adres/haritaUret.ts) üretecini canlı veritabanına karşı
 * bir kez koşturur ve `eski-adres-haritasi.json` dosyasını yazar. Üretecin kendisi bu betikte DEĞİŞMEZ;
 * burası yalnız istemci kurar, tohumu doğrular, sonucu yazar ve çıktıyı sızıntıya karşı denetler.
 *
 * ⛔YALNIZ OKUMA: veritabanına tek çağrı türü vardır, SELECT (üretecin `.select(...)` sorguları).
 * Bu dosyada ve üreteçte yazma çağrısı (insert/update/upsert/delete/rpc) YOKTUR; conformance testi
 * (src/__tests__/conformance/harita-uret-is-akisi.test.ts) bunu grep ile 0 olarak ölçer.
 *
 * ⛔SIR: service-role anahtarı yalnız ortam değişkeninden okunur, hiçbir yere yazılmaz ve basılmaz.
 * Çıktı dosyası yazılmadan önce anahtar değerini, JWT biçimli diziyi ve e-posta biçimini İÇERMEDİĞİ
 * doğrulanır; içeriyorsa dosya YAZILMAZ ve betik hata kodu 1 ile düşer.
 *
 * ÇALIŞTIRMA (jiti: TypeScript'i ve `@/` takma adını çözer):
 *   JITI_ALIAS='{"@/":"./src/"}' SUPABASE_PROJECT_REF=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     pnpm exec jiti scripts/adres/harita-uret.ts --cikti eski-adres-haritasi.json
 *   --kuru-calisma : modülleri yükler, ağa GİTMEZ, çıkar (araç zincirinin çalıştığını ölçer).
 * ÇIKIŞ: 0 yazıldı · 1 üretim ya da sızıntı denetimi başarısız · 2 kullanım hatası / ortam eksik.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { Database } from '../../src/types/database.types'
import { eskiAdresHaritasiUret, haritaDosyasiKur } from '../../src/lib/adres/haritaUret'
import { tohumDogrula } from '../../src/lib/adres/tohum'
import { haritaDogrula, sizintiBul } from './harita-uret-yardimci'

const TOHUM_YOLU = resolve(__dirname, '../../src/data/eski-adres-tohum.json')

function kullanimHatasi(mesaj: string): never {
  process.stderr.write(`harita-uret: ${mesaj}\n`)
  process.exit(2)
}

async function ana(argv: string[]): Promise<void> {
  const dogrulaIndeksi = argv.indexOf('--dogrula')
  if (dogrulaIndeksi >= 0) {
    const dosya = argv[dogrulaIndeksi + 1]
    if (!dosya) kullanimHatasi('--dogrula <dosya> gerekli')
    const sorunlar = haritaDogrula(readFileSync(dosya, 'utf8'))
    if (sorunlar.length > 0) {
      process.stderr.write(`harita-uret: doğrulama KIRMIZI: ${sorunlar.join('; ')}\n`)
      process.exit(1)
    }
    process.stdout.write(`harita-uret: doğrulama tamam (${dosya})\n`)
    return
  }
  const kuru = argv.includes('--kuru-calisma')
  const ciktiIndeksi = argv.indexOf('--cikti')
  const cikti = ciktiIndeksi >= 0 ? argv[ciktiIndeksi + 1] : undefined
  if (!kuru && !cikti) kullanimHatasi('--cikti <dosya> gerekli')

  const tohum = tohumDogrula(JSON.parse(readFileSync(TOHUM_YOLU, 'utf8')))
  if (kuru) {
    process.stdout.write(`harita-uret: kuru çalışma tamam (tohum kiracısı ${tohum.kiraci}, ağa gidilmedi)\n`)
    return
  }

  const ref = process.env.SUPABASE_PROJECT_REF ?? ''
  const anahtar = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!/^[a-z0-9]{10,40}$/.test(ref)) kullanimHatasi('SUPABASE_PROJECT_REF eksik ya da biçimsiz')
  if (anahtar.length < 20) kullanimHatasi('SUPABASE_SERVICE_ROLE_KEY eksik')

  const istemci = createClient<Database>(`https://${ref}.supabase.co`, anahtar, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const harita = await eskiAdresHaritasiUret(istemci, { kiraciId: tohum.kiraci, tohum, oncekiUrunSayisi: null })
  const metin = JSON.stringify(haritaDosyasiKur({ [tohum.kiraci]: harita }, new Date()), null, 2) + '\n'

  const sizinti = sizintiBul(metin, anahtar)
  if (sizinti.length > 0) {
    process.stderr.write(`harita-uret: çıktıda yasak içerik (${sizinti.join(', ')}) — dosya YAZILMADI\n`)
    process.exit(1)
  }
  writeFileSync(cikti as string, metin)
  process.stdout.write(
    `harita-uret: yazıldı ${cikti} (${metin.length} bayt, ${harita.urunSayisi} ürün, ${harita.aileler.length} aile, ` +
      `${harita.kategoriler.length} kategori)\n`
  )
}

ana(process.argv.slice(2)).catch((e: unknown) => {
  // Mesaj anahtarı içermez: istemci hataları URL/durum taşır, anahtar taşımaz; yine de kırpılır.
  const ileti = e instanceof Error ? e.message : String(e)
  process.stderr.write(`harita-uret: üretim başarısız: ${ileti.slice(0, 300)}\n`)
  process.exit(1)
})
