/**
 * INV-KATALOG-TLS-1 — sayaç kök sertifikayı doğru çözer ve bunu BEYAN eder.
 *
 * NİÇİN VAR (2026-09-04, ölçülmüş iki olay):
 * `katalog-sayim.mjs` `PGSSLROOTCERT` yokken bağlanamıyordu. O gün bu değişken iki kez
 * unutuldu — biri canlı iş akışıydı ve düştü. Ev geleneği (`catalog-integrity.mjs`)
 * bilerek varsayılana düşmüyor ve gerekçesi yazılı: *"sessizce sistem deposuna düşmek
 * YANLIŞ olurdu — hata mesajı o zaman sertifikayı değil SUNUCUYU suçlar."*
 *
 * ⭐AYIRT EDİCİ SORU (ALTYAPI hükmü): varsayılan, **doğru davranışı** mı kolaylaştırıyor
 * yoksa **yanlış bir varsayımı** mı gizliyor? Buradaki varsayılan sistem güven deposu
 * DEĞİL — depoda duran tek ve doğrulanmış bir dosya. Yani birincisi.
 * Bu yüzden: **fallback VAR, ama SESSİZ DEĞİL.**
 *
 * ⭐NİÇİN BETİĞİ İÇE AKTARMIYOR, ÇALIŞTIRIYOR:
 * İlk hâli `resolveTls`'i import ediyordu ve vitest `.mjs` içindeki `import.meta`'da
 * ayrıştırma hatası verdi. Çözüm ölçütü **iyileştirdi**: kapı artık iç fonksiyonu değil
 * **teslim edilen komutun kendisini** ölçüyor — kullanıcının/CI'nın gördüğü davranış bu.
 * Yan fayda: "yalnız doğrudan çalıştırılınca koş" koruması da bu yolla sınanıyor.
 *
 * NE ÖLÇER (dört kol, ayırt edici):
 *  1. Depodaki varsayılan CA gerçekten var (önkoşul ayrı ölçülür ki teşhis şaşmasın).
 *  2. Değişken YOKKEN varsayılana düşer VE hangi kökü kullandığını BASAR.
 *  3. Değişken VARKEN o yolu kullanır ve bunu da BASAR (beyan iki yönde de var).
 *  4. Kök dosyası BOZUKSA fail-closed — varsayılana düşmek, bozuk köke güvenmek DEĞİLDİR.
 *
 * KAPSAM SINIRI (gizlenmiyor): bu kapı TLS **çözümünü ve beyanını** ölçer; gerçek bir
 * sunucu doğrulaması yapmaz. "Sunucu bu kökle gerçekten doğrulanıyor mu" sorusunun cevabı
 * canlı koşumdur (`katalog-sayim.yml`), burada değil. Bağlantı dizesi bilerek
 * ULAŞILAMAZ bir adrestir: TLS çözümü bağlantıdan ÖNCE koşar, yani kol prod'a dokunmaz.
 */
import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const KOK = process.cwd()
const BETIK = join(KOK, 'scripts', 'katalog', 'katalog-sayim.mjs')
const VARSAYILAN_CA = join(KOK, 'scripts', 'db', 'checks', 'supabase-root-2021-ca.pem')

/** Prod'a DOKUNMAZ: ulaşılamaz adres; TLS çözümü bağlantı denemesinden önce koşar. */
const SAHTE_DB = 'postgresql://kullanici:parola@127.0.0.1:1/olmayan'

function kos(env: Record<string, string | undefined>) {
  // Ortamı SIFIRDAN kurmuyoruz: proje `ProcessEnv`'i zorunlu alanlarla genişletiyor ve
  // eksik sözlük tipi bozar. Mevcut ortamın kopyası üzerinde oynuyoruz — `undefined`
  // verilen anahtar SİLİNİR ki "değişken yok" hâli gerçekten üretilebilsin.
  const temiz: NodeJS.ProcessEnv = { ...process.env }
  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete temiz[k]
    else temiz[k] = v
  }

  const r = spawnSync(process.execPath, [BETIK], { env: temiz, encoding: 'utf8', timeout: 60_000 })
  return { cikis: r.status, hata: r.stderr ?? '', cikti: r.stdout ?? '' }
}

describe('INV-KATALOG-TLS-1 — kök sertifika çözümü beyanlıdır', () => {
  it('depodaki varsayılan CA dosyası GERÇEKTEN var (önkoşul)', () => {
    // Ayrı kol: dosya silinirse 2. kol da düşer ve sebebi "fallback bozuldu" sanılırdı.
    expect(existsSync(VARSAYILAN_CA), `Varsayilan CA bulunamadi: ${VARSAYILAN_CA}`).toBe(true)
  })

  it('değişken YOKKEN varsayılana düşer VE bunu beyan eder', () => {
    const { hata } = kos({ PGSSLROOTCERT: undefined, SUPABASE_DB_URL: SAHTE_DB })

    expect(
      /varsayilan CA kullanildi/i.test(hata),
      'SESSIZ fallback: hangi kokun kullanildigi basilmadi. Beyansiz varsayilan, ev ' +
        `geleneginin korktugu seydir (hata mesaji yanlis yeri suclar).\nCIKTI:\n${hata}`,
    ).toBe(true)
  })

  it('değişken VARKEN o yolu kullanır ve bunu da beyan eder', () => {
    const { hata } = kos({ PGSSLROOTCERT: VARSAYILAN_CA, SUPABASE_DB_URL: SAHTE_DB })

    expect(
      /PGSSLROOTCERT.?ten alindi/i.test(hata),
      `Beyan tek yonlu: acikca verilen kok icin satir basilmiyor.\nCIKTI:\n${hata}`,
    ).toBe(true)
  })

  it('kök dosyası BOZUKSA fail-closed — sessizce güvenmez', () => {
    const bozuk = join(mkdtempSync(join(tmpdir(), 'katalog-tls-')), 'bozuk.pem')
    // PEM değil: gerçek hayatta en sık sebep panoya kopyalarken satır sonlarının kaybı.
    writeFileSync(bozuk, 'bu bir sertifika degil', 'utf8')

    const { cikis, hata } = kos({ PGSSLROOTCERT: bozuk, SUPABASE_DB_URL: SAHTE_DB })

    expect(cikis, 'bozuk kok ile cikis kodu 1 degil — sessizce kabul edilmis olabilir').toBe(1)
    expect(/PEM degil/i.test(hata), `Bozuk kok reddedilmedi.\nCIKTI:\n${hata}`).toBe(true)
  })
})
