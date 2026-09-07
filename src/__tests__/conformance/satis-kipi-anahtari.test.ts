// @vitest-environment node
//
// NİÇİN NODE ORTAMI: bu kapı DOM'a dokunmaz — dosya okur, betik koşturur, metin tarar.
// Varsayılan `jsdom` ortamı burada yalnız maliyet ve kırılganlıktır (worktree'de jsdom
// bağımlılık zinciri çözülemedi ve test HİÇ KOŞMADI — "0 test" sessizce yeşil görünür).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SATIS-KIPI-1..5 — SATIŞ KİPİ ANAHTARININ BEKÇİSİ (REC-168).
 * Cetvel: docs/standards/satis-kipi-gecis-standard.md §9.
 *
 * NİÇİN VAR: "tek anahtarla satış kipine geç" emrinin bedeli, anahtarın İKİ YERDE
 * yaşamasıdır — env burada, `hide_price` kategorilerde. İki kaynaklı anahtar "hangisi
 * kazandı" sorusunu doğurur ve o soru üretimde sorulmaz, sessizce yanlış cevaplanır.
 * Bu dosya anahtarın TEK kalmasını ve varsayılanının KAPALI olmasını mekanik tutar.
 *
 * ⭐KAPSAM SINIRI, ADIYLA: buradaki kollar KOD YAPISINI ölçer (statik). Canlı DB davranışı
 * (anon SELECT reddi, RPC'nin iyzico sızdırmaması, tetik zinciri) BU DOSYADA ÖLÇÜLEMEZ —
 * onlar `scripts/db/checks/` altındaki INV-SATIS-KIPI-2a/2b/2c/2d canlı kollarıdır ve
 * migration indikten sonra koşar. Burada "2" numarası bilerek ATLANMIŞTIR: numaranın
 * boş durması, ölçülmeyen bir şeyi ölçülmüş sanmaktan iyidir.
 */

const KOK = path.resolve(__dirname, '..', '..', '..')
const oku = (p: string) => fs.readFileSync(path.join(KOK, p), 'utf8')

/**
 * Yorumları çıkarır: satır (`//`) ve blok (`/* … *\/`). YAKLAŞIKTIR ve sınırı yazılıdır —
 * bir dizgi içinde `//` geçerse o satırın kalanı da düşer. Kabul edilebilir: burada aranan şey
 * `process.env.…` okuması; onu dizgi içine gömen bir kod yazılırsa zaten ayrı bir sorundur.
 * Amaç ölçütü KOD'a bağlamak — kelimenin yorumda geçmesi ihlal değildir.
 */
function yorumsuz(kaynak: string): string {
  return kaynak
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** `src/**` altındaki tüm .ts/.tsx dosyaları (node_modules ve build çıktıları hariç). */
function kaynakDosyalari(): string[] {
  const cikti: string[] = []
  const yuru = (dizin: string) => {
    for (const girdi of fs.readdirSync(dizin, { withFileTypes: true })) {
      if (girdi.name === 'node_modules' || girdi.name.startsWith('.')) continue
      const tam = path.join(dizin, girdi.name)
      if (girdi.isDirectory()) yuru(tam)
      else if (/\.tsx?$/.test(girdi.name)) cikti.push(tam)
    }
  }
  yuru(path.join(KOK, 'src'))
  return cikti
}

describe('INV-SATIS-KIPI: satış kipi anahtarı TEK kaynaktan okunur ve varsayılanı KAPALI', () => {
  /**
   * ⭐EVREN MUHAFIZI (URUN'un 2026-09-06 fail-open bulgusu): yürüme kökü daralırsa bu kapı
   * "ihlal yok" der ve YEŞİL kalır — evren SIFIR olmasa bile. Sayıyı bir eşiğe bağlamak,
   * kapının neyi taradığını görünür kılar.
   */
  const dosyalar = kaynakDosyalari()
  it('EVREN: tarama kökü daralmadı (fail-open muhafızı)', () => {
    expect(dosyalar.length, 'src/** taraması beklenenden küçük — kapı kusurun yaşadığı yeri görmüyor olabilir').toBeGreaterThan(300)
  })

  it('INV-SATIS-KIPI-1: NEXT_PUBLIC_ODEME_ACIK doğrudan okunmaz (checkout dahil)', () => {
    /**
     * Sabotaj: checkout'a `process.env.NEXT_PUBLIC_ODEME_ACIK === '1'` satırı geri konur → düşer.
     * NİÇİN: env derleme anında gömülür ve vitrin statik üretilir; env'i çevirmek yeniden yayın
     * ister — "tek tuş" olmaz. Anahtar DB satırında yaşar, okuma `satisKipiOku()` içindedir.
     *
     * ⭐ÖLÇÜT İKİ KEZ KESKİNLEŞTİRİLDİ (ikisi de ölçümle, 2026-09-07):
     * (1) İlk hâli ÇIPLAK ADI arıyordu ve **9 dosya** düştü — hiçbiri okuma değildi: dört
     *     yorum/companion satırı, üç vitrin yüzeyinde "ödeme şu env ile kapalı" diyen AÇIKLAMA,
     *     iki sözlük yorumu. Yani ölçüt ihlali değil, KELİMEYİ sayıyordu.
     * (2) `process.env.` öneki eklendi — hâlâ 4 düşüyordu, hepsi PROSE (bu dosyanın kendi
     *     sabotaj açıklaması dahil). Bugün aynı sınıfa üçüncü kez düştüm: `mechanism-setup`
     *     kapısı da benim YORUMUMLA kırmızı vermişti.
     * ⭐KURAL: kod tarayan kapı YORUMLARI ÇIKARIR, sonra ölçer. Aksi hâlde belgelemek
     * kapıyı kırmızıya düşürür ve ajan çareyi "yorumu sil"de arar — yani kapı, kendi
     * gerekçesinin yazılmasını cezalandırır.
     */
    const ihlaller = dosyalar
      .filter((d) => /process\.env\.NEXT_PUBLIC_ODEME_ACIK/.test(yorumsuz(fs.readFileSync(d, 'utf8'))))
      .map((d) => path.relative(KOK, d).replace(/\\/g, '/'))
    expect(
      ihlaller,
      'ödeme yolu yine env okuyor: anahtar iki yerde yaşar ve "hangisi kazandı" sorusu üretimde sessizce yanlış cevaplanır',
    ).toEqual([])
  })

  it('INV-SATIS-KIPI-1b: checkout sayfası satisKipiOku() çağırır', () => {
    // 1 numaranın ikinci yüzü: env'i SİLMEK yetmez, yerine DOĞRU kaynağı koymak gerekir.
    // Yoksa "ihlal 0" der ve sayfa hiçbir anahtara bakmadan hep açık/hep kapalı kalır.
    const sayfa = oku('src/app/[lang]/checkout/page.tsx')
    expect(sayfa, 'checkout anahtarı okumuyor — env kaldırıldı ama yerine kaynak konmadı').toMatch(/satisKipiOku\(/)
  })

  it('INV-SATIS-KIPI-3: önizleme zorlaması YALNIZ preview ortamında okunur', () => {
    /**
     * Sabotaj: `VERCEL_ENV === 'preview'` koşulu kaldırılır → düşer.
     * NİÇİN: preview AYNI prod DB'yi okur. Provayı DB'de açmak prod'u da açardı; zorlama bu
     * yüzden var. Prod'da değişken tanımlı OLSA BİLE yok sayılmalı — yoksa unutulmuş bir
     * ortam değişkeni canlı mağazayı satışa açar.
     */
    const modul = oku('src/lib/kip/satisKipi.ts')
    const zorlamaSatiri = modul.split('\n').find((s) => s.includes('SATIS_KIPI_ONIZLEME')) ?? ''
    expect(zorlamaSatiri, 'önizleme zorlaması ortam koşulundan koptu — prod da açılabilir').toMatch(/VERCEL_ENV/)
    expect(zorlamaSatiri, "koşul 'preview' dışında bir değere bakıyor").toMatch(/'preview'/)
  })

  it('INV-SATIS-KIPI-3b: okuma FAIL-CLOSED — bilinmemek satış açmaz', () => {
    const modul = oku('src/lib/kip/satisKipi.ts')
    expect(modul, 'kapalı varsayılan sabiti yok').toMatch(/const KAPALI/)
    // Cevap ELLE doğrulanır: tip dökümü (`as`) ile geçiştirilirse bozuk cevap açık sayılabilir.
    expect(modul, 'cevap doğrulaması yok — bozuk/eksik cevap açık sayılabilir').toMatch(/acik !== true/)
  })

  it('INV-SATIS-KIPI-4: betik VARSAYILAN KURU — --uygula yokken hiçbir yazma çağrısı yapılmaz', () => {
    /**
     * Sabotaj: `if (!UYGULA) ... return` silinir → mock istemcide yazma sayacı artar → düşer.
     * Mock istemci gerçek ağa ÇIKMAZ; ölçtüğümüz şey "betik yazmaya kalkıştı mı".
     */
    const betik = oku('scripts/kip/satis-kipine-gec.mjs')
    expect(betik, 'kuru koşum dalı kayboldu: betik --uygula olmadan da yazabilir').toMatch(/!UYGULA/)
    expect(betik, '--uygula onay şartı kalktı: kayıtsız canlı yazma mümkün').toMatch(/--onay/)
  })

  it('INV-SATIS-KIPI-4b: --uygula onaysız çağrı ÇIKIŞ KODUYLA reddedilir', () => {
    // Kanıt beyanla değil KOŞUMLA: betiği gerçekten çağırıp çıkış kodunu ölçüyoruz.
    // Env verilmez → betik canlıya bağlanamaz; zaten argüman kapısı ondan ÖNCE düşmeli.
    let cikis = 0
    try {
      execFileSync(process.execPath, [path.join(KOK, 'scripts', 'kip', 'satis-kipine-gec.mjs'), '--yon', 'ac', '--uygula'], {
        cwd: KOK,
        env: { ...process.env, VENTHUB_ENV_PATH: path.join(KOK, 'boyle-bir-dosya-yok.env') },
        stdio: 'pipe',
      })
    } catch (e) {
      cikis = Number((e as { status?: number }).status ?? 0)
    }
    expect(cikis, '--uygula onaysız kabul edildi: canlı yazma kayıtsız koşabilir').not.toBe(0)
  })

  it('INV-SATIS-KIPI-5: tutarlılık ARA HÂLİ kabul etmez (açık+0 ✓ · kapalı+37 ✓ · açık+5 ✗)', async () => {
    /**
     * Sabotaj: ara hâli kabul eden bir değişiklik → düşer.
     * NİÇİN: anahtar açıkken 5 kategoride fiyat gizliyse mağaza YARIM açılmıştır — müşteri
     * bazı yerlerde fiyat görür bazı yerlerde görmez. Yarım hâl, kapalı hâlden daha kötüdür:
     * kapalıyken tutarlıdır, yarımken güven kırar.
     */
    const mod = await import(path.join(KOK, 'scripts', 'kip', 'satis-kipine-gec.mjs').replace(/\\/g, '/'))
    /**
     * ⚠DÖNÜŞ ŞEKLİ: `{ tutarli, beklenen }` — düz boolean DEĞİL. İlk yazışımda boolean
     * varsaydım ve kol kırmızı verdi; kusur betikte değil TESTTEYDİ. Beklenen metni bilerek
     * döndürülüyor: rapor "TUTARSIZ" derken NEYİN beklendiğini de yazabilsin (yalnız
     * "tutarsız" demek, okuyanı ölçüme geri göndermez).
     */
    type Tutar = { tutarli: boolean; beklenen: string }
    const tutarliMi = mod.tutarliMi as (d: { anahtar: { acik: boolean }; kategori: { toplam: number; hidePriceTrue: number } }) => Tutar
    expect(tutarliMi({ anahtar: { acik: true }, kategori: { toplam: 37, hidePriceTrue: 0 } }).tutarli, 'açık + hiç gizli yok = TUTARLI').toBe(true)
    expect(tutarliMi({ anahtar: { acik: false }, kategori: { toplam: 37, hidePriceTrue: 37 } }).tutarli, 'kapalı + hepsi gizli = TUTARLI').toBe(true)
    expect(tutarliMi({ anahtar: { acik: true }, kategori: { toplam: 37, hidePriceTrue: 5 } }).tutarli, 'açık ama 5 kategoride fiyat gizli — YARIM açık hâl kabul edildi').toBe(false)
    expect(tutarliMi({ anahtar: { acik: false }, kategori: { toplam: 37, hidePriceTrue: 36 } }).tutarli, 'kapalı ama 1 kategoride fiyat görünüyor — sızıntı kabul edildi').toBe(false)
    // Beklenen metni SAYIYI taşımalı: "kapalı → 37" demezse rapor okuyanı ölçüme geri göndermez.
    expect(tutarliMi({ anahtar: { acik: false }, kategori: { toplam: 37, hidePriceTrue: 1 } }).beklenen).toContain('37')
  })
})
