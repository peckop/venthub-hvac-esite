// @vitest-environment node
//
// Kapı saf Node'dur; DOM ortamı yalnız maliyet ve kırılganlıktır.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SEARCH-BEHAVIOR-1 · KATMAN A — arama kapısının DÜZENEĞİ ve İLANI ölçülür.
 *
 * Cetvel: `docs/standards/arama-standard.md` §8 · Kayıt: REC-340 Faz 1 Adım 1.
 * Ad ailesi `INV-SEARCH-ROUTE-1` ile hizalı (cetvel K8.2: aynı alanda iki aile taşınmaz;
 * o kapı GEZİNMEYİ, bu DAVRANIŞI ölçer).
 *
 * ── ⛔BU KATMAN NEYİ ÖLÇMEZ, VE NİÇİN ──
 *
 * **Arama sonuçlarını ölçmez.** CI'daki vitest `https://dummy.supabase.co` ile koşuyor:
 * sorgu hiç gitmez, sonuç boş döner ve "0 sonuç" bir ÖLÇÜM gibi görünür. Yani davranışı
 * burada ölçmek **sessizce yanlış ölçmek** olurdu (cetvel K8.1). Davranış Katman B'de,
 * canlıya karşı ölçülür (`scripts/db/checks/arama-davranisi.mjs`).
 *
 * Bu katmanın işi şudur: **Katman B'nin var olduğunu, bağlı olduğunu ve ilanının dürüst
 * kaldığını** ölçmek. Yani kapının kendi kapısı.
 *
 * ── ⚠SORGU KURUCUSU HENÜZ YAZILMADI — İSKELET AÇIKÇA İŞARETLİ ──
 *
 * Cetvel K8.1 Katman A için *"sorgu kurucusunun semantiği saf fonksiyon olarak, fikstürle"*
 * diyor. O kurucu REC-340 Faz 1 **Adım 3'te** yazılacak; bugün depoda YOK (ölçüldü:
 * `ftsSearchProducts` doğrudan RPC çağırıyor, normalizasyon/eşleştirme mantığı
 * veritabanında). Bu yüzden saf-fonksiyon kolları bugün **iskelet** ve aşağıda
 * `ISKELET_ADIM_3` altında ADIYLA işaretli — boş geçilmedi.
 *
 * ⭐İSKELET DE ÖLÇÜLÜYOR: aşağıdaki kol, kurucu yazıldığı gün bu iskeletin fark edilmesini
 * ZORLAR — kurucu dosyası doğduğunda kol KIRMIZI olur ve "iskeleti gerçek kolla değiştir"
 * der. Yoksa iskelet sonsuza kadar yeşil yanar ve kimse onu doldurmaz (bu depoda ölçülmüş
 * bir kusur sınıfı: "düzeltilmiş ama koşulmamış araç").
 */

const KOK = process.cwd()
const BETIK = path.join(KOK, 'scripts', 'db', 'checks', 'arama-davranisi.mjs')
const WF = path.join(KOK, '.github', 'workflows', 'db-advisor.yml')
const CETVEL = path.join(KOK, 'docs', 'standards', 'arama-standard.md')

/**
 * Sorgu kurucusunun doğacağı yol — Adım 3'te yazılacak. Bugün YOK.
 * Doğduğu gün iskelet kolu KIRMIZI olur ve gerçek kolla değiştirilmesini zorlar.
 */
const ISKELET_ADIM_3 = path.join(KOK, 'src', 'lib', 'search', 'sorgu-kurucu.ts')

const oku = (p: string): string => fs.readFileSync(p, 'utf8')

/** `#` ile başlayan YAML yorumlarını atar — gerekçe metni ölçüme karışmasın. */
const yorumsuz = (metin: string): string =>
  metin
    .split('\n')
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')

/** JS blok/satır yorumlarını atar — aynı sebep. */
const jsYorumsuz = (metin: string): string =>
  metin
    .split('\n')
    .filter((s) => !/^\s*(\/\/|\/\*|\*)/.test(s))
    .join('\n')

describe('INV-SEARCH-BEHAVIOR-1 · Katman B VAR ve BAGLI', () => {
  it('kosucu betigi VAR (kapi KOR kosmasin)', () => {
    expect(fs.existsSync(BETIK), 'arama-davranisi.mjs yok — kapi hicbir sey olcmez ama yesil yanardi').toBe(true)
  })

  it('⭐WORKFLOW BETIGI GERCEKTEN CAGIRIYOR (yorum degil, adim)', () => {
    const w = yorumsuz(oku(WF))
    expect(w, "workflow betigi cagirmiyor — kapi yazildi ama KOSMUYOR").toContain(
      'node scripts/db/checks/arama-davranisi.mjs',
    )
    expect(w, 'SUPABASE_DB_URL beslenmiyor — betik OLCULEMEDI deyip cikar').toMatch(
      /SUPABASE_DB_URL:\s*\$\{\{\s*secrets\.SUPABASE_DB_URL\s*\}\}/,
    )
  })

  it('⭐ON-YOKLAMA KOSULUNA BAGLI (emsal: catalog-integrity / INV-CATALOG-1)', () => {
    // Sır yoksa iş hiç koşmamalı; koşup boş ölçmek "geçti" izlenimi verir.
    const w = yorumsuz(oku(WF))
    expect(w).toMatch(/needs\.db-gate-precheck\.outputs\.ready\s*==\s*'true'/)
  })

  it('⭐"ATLANMIS IS YESIL DEGILDIR" uyarisi arama kapisini da ADIYLA aniyor', () => {
    // Emsal metni birebir kopyalandi; ama uyari eski iki kapiyi sayip bu kapiyi
    // ANMAZSA, atlanan is SESSIZ kalir ve atlama gorunmez olur.
    const w = yorumsuz(oku(WF))
    expect(w).toContain('ATLANMIS IS YESIL DEGILDIR')
    const uyariSatiri = w.split('\n').find((s) => s.includes('ATLANMIS IS YESIL DEGILDIR')) ?? ''
    expect(uyariSatiri, 'atlama uyarisi arama kapisini anmiyor').toContain('INV-SEARCH-BEHAVIOR-1')
    expect(uyariSatiri, 'atlananin NE oldugu yazilmamis').toMatch(/ARAMA DAVRANISI/i)
  })

  it('SIR DEGERI BASILMIYOR — ${VAR:-...} kalibi YASAK', () => {
    // 2026-09-04'te `${VAR:-YOK}` kalibi prod baglanti dizesini log'a dusurdu.
    const s = oku(BETIK)
    expect(s, 'betik sir degerini basabilecek kalip tasiyor').not.toMatch(/\$\{SUPABASE_DB_URL:-/)
    expect(s, 'sir varligi UZUNLUKLA olculmuyor').toMatch(/dizi\.length/)
  })

  it('⭐OLCEMEDI ile IHLAL AYRI CIKIS KODU (is kirmizi degil ADIM kirmizi)', () => {
    const s = jsYorumsuz(oku(BETIK))
    expect(s, 'ihlalde cikis 1 yok').toMatch(/process\.exit\(1\)/)
    expect(s, 'olcum hatasinda cikis 2 yok — ihlalle karisir').toMatch(/process\.exit\(2\)/)
    expect(s, 'sir yokken cikis 0 yok — kapi sir olmadan KIRMIZI verirse herkesi bloklar').toMatch(
      /process\.exit\(0\)/,
    )
  })
})

describe('INV-SEARCH-BEHAVIOR-1 · ILAN DURUST KALIYOR', () => {
  const betik = (): string => oku(BETIK)

  it('VAKA KUMESI cetvelin asgari kumesini KARSILIYOR (daraltilamaz)', () => {
    const s = betik()
    // Cetvel §8 tablosundaki on sorgu ADIYLA gecmeli; biri dusse kapi sessizce daralir.
    const sorgular = [
      'havalandırma',
      'havalandirma',
      'jet fan',
      'fan jet',
      'vortis',
      'ısı geri kazanım',
      'VRT-17160',
      'kanal tipi fan',
      'duvar tipi aspiratör',
      'ISI GERI KAZANIM',
    ]
    const eksik = sorgular.filter((q) => !s.includes(`'${q}'`))
    expect(eksik, `vaka kumesi DARALMIS — eksik sorgular: ${eksik.join(' | ')}`).toEqual([])
  })

  it('⭐SABIT SAYI YOK (cetvel K8.3) — tek istisna tam SKU vakasi', () => {
    /**
     * Katalog şeridi her gün ürün ekliyor. `=== 47` diyen bir kol ilk eklemede sahte
     * kırmızı yanar ve kimse ona güvenmez. Ölçüt biçimleri ilan edilmiş sabitlerdir;
     * bu kol, biri gelip araya çıplak bir beklenen-sayı yazmasını engeller.
     */
    const s = jsYorumsuz(betik())
    for (const bicim of ['sifir-degil', 'oran', 'ayni-kume', 'marka-var', 'tam-tek-sku']) {
      expect(s, `olcut bicimi kayip: ${bicim}`).toContain(bicim)
    }
    // Vaka tanımlarında `beklenen: <sayı>` gibi çıplak bir sayı ölçütü OLMAMALI.
    expect(s, 'vaka tanimina ciplak beklenen-sayi girmis').not.toMatch(/beklenen\s*:\s*\d+/)
  })

  it('⭐HASSASIYET TAVANI VAR ve ORANLA yazili (cetvel K8.4)', () => {
    // Duzeltme sifir-sonuc sorununu ALAKASIZ-SONUC sorununa cevirebilir; kapi hem alt
    // hem UST sinir olcer. Tavan ORAN olmali: mutlak sayi katalog buyudukce yanlislasir.
    const s = jsYorumsuz(betik())
    expect(s).toMatch(/TAVAN_ORAN\s*=\s*0\.4/)
    expect(s, 'tavan hicbir vakaya uygulanmiyor').toMatch(/hassasiyet TAVANI asildi/)
  })

  it('⭐BILINEN KIRMIZI ILANI: her satir GEREKCELI ve REC-340 a bagli', () => {
    const s = betik()
    const blok = s.slice(s.indexOf('const BILINEN_KIRMIZI'), s.indexOf('function baglantiDizesi'))
    const satirlar = [...blok.matchAll(/^\s*(\d+):\s*'([^']+)'/gm)]
    expect(satirlar.length, 'ilan BOS — bugun bes vaka kirmizi, ilan olmadan kapi master i bloklar').toBeGreaterThan(0)
    for (const [, no, gerekce] of satirlar) {
      expect(gerekce.length, `vaka ${no} ilani cok kisa — gerekcesiz ilan kabul edilmez`).toBeGreaterThan(60)
      expect(gerekce, `vaka ${no} ilani duzeltmenin HANGI adimda geldigini yazmiyor`).toMatch(/REC-340|Vaka \d/)
    }
  })

  it('⭐ROL KOLU — vakalar VITRIN ROLLERIYLE de olculur, ilana TABI DEGIL, yazma sizmaz', () => {
    /**
     * 2026-09-17: #1235 sonrası arama anon + authenticated rolünde 42501 ile TAMAMEN boştu,
     * kapı postgres rolüyle ölçtüğü için YEŞİL verdi. Yetki kusuru yalnız o rolde görünür.
     * Bu kol silinir ya da ilana bağlanırsa aynı körlük geri gelir.
     */
    const s = jsYorumsuz(betik())
    expect(s, 'vitrin rolleri tanimli degil').toMatch(/VITRIN_ROLLERI\s*=\s*\[\s*'anon'\s*,\s*'authenticated'\s*\]/)
    expect(s, 'rol gercekten degistirilmiyor').toMatch(/set local role \$\{rol\}/)
    // Iddiasiz authenticated vitrinde uretilmez (kanca her jetona user_role yazar); iddia
    // kurulmazsa kol musterinin gormedigi 54001 i olcer. Iddia IŞLEM-YEREL (true) olmali.
    expect(s, 'JWT iddialari islem-yerel kurulmuyor').toMatch(/set_config\('request\.jwt\.claims', \$1, true\)/)
    expect(s, 'authenticated iddiasi kancanin bicimini taklit etmiyor').toMatch(/authenticated:\s*\{[^}]*user_role:\s*'user'/)
    expect(s, 'rol olcumu islem icinde ROLLBACK ile bitmiyor').toMatch(/finally\s*\{\s*await client\.query\('rollback'\)/)
    const kol = s.slice(s.indexOf('for (const rol of VITRIN_ROLLERI)'), s.indexOf('await client.end()'))
    expect(kol.length, 'rol dongusu client.end ONCESINDE degil').toBeGreaterThan(0)
    expect(kol, 'rol hatasi ihlale yazilmiyor').toMatch(/ihlaller\.push\([^)]*ROL/)
    expect(kol, 'rol kolu BILINEN_KIRMIZI ilanina baglanmis — vitrinde calismayan arama ilanlanamaz').not.toMatch(/BILINEN_KIRMIZI/)
  })

  it('⭐MANDAL IKI YONLU — ilanli vaka GECERSE kapi KIRMIZI (ilan bayatlayamaz)', () => {
    /**
     * Bu kolun ölçtüğü şey, bu tasarımın en kritik parçası: ilan bir MUAFİYET listesi
     * değil. İkinci yön olmazsa ilan sonsuza kadar yaşar, düzeltme gelse bile kapı hiç
     * gerçek kapıya dönmez ve "bilinen kırmızı" kalıcı bir kör noktaya dönüşür.
     */
    const s = jsYorumsuz(betik())
    expect(s, 'ilanli vakanin GECMESI hali hic ele alinmamis').toContain('ARTIK GECIYOR')
    expect(s, 'ilan bayatligi ihlal listesine yazilmiyor').toMatch(/Ilan BAYAT/)
    expect(s, 'listenin yalniz kuculebilecegi yazilmamis').toMatch(/yalniz KUCULEBILIR/)
  })

  it('CETVEL BAGI: betik ve workflow cetvele ADIYLA isaret ediyor', () => {
    expect(fs.existsSync(CETVEL), 'arama cetveli yok — kapi kaynaksiz kalir').toBe(true)
    expect(oku(BETIK)).toContain('docs/standards/arama-standard.md')
    expect(oku(WF)).toContain('docs/standards/arama-standard.md')
  })

  it('⭐KOSUCU GERCEKTEN AYIRT EDIYOR — sir yokken OLCULEMEDI der, "gecti" DEMEZ', () => {
    // Davranış ölçümü: betik sırsız koşturulur. Çıkış 0 olmalı AMA çıktı "atlandı"
    // demelidir; sessiz sıfır, geçmiş gibi okunur.
    const r = (() => {
      try {
        const stdout = execFileSync(process.execPath, [BETIK], {
          cwd: KOK,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, SUPABASE_DB_URL: '' },
          timeout: 60_000,
        })
        return { kod: 0, stdout }
      } catch (e) {
        const h = e as { status?: number; stdout?: string }
        return { kod: h.status ?? -1, stdout: String(h.stdout ?? '') }
      }
    })()
    expect(r.kod, 'sir yokken kapi KIRMIZI verdi — herkesin merge ini bloklar').toBe(0)
    expect(r.stdout).toContain('OLCULEMEDI')
    expect(r.stdout, 'atlama SESSIZ kaldi').toContain('ATLANMIS IS YESIL DEGILDIR')
  })
})

describe('INV-SEARCH-BEHAVIOR-1 · Katman A saf fonksiyon ISKELETI (Adim 3)', () => {
  it('⛔ISKELET ADIYLA ISARETLI — sorgu kurucusu HENUZ YAZILMADI', () => {
    /**
     * Cetvel K8.1 saf-fonksiyon katmanını istiyor; o kurucu Adım 3'te doğacak. Bugün
     * yokluğu ÖLÇÜLÜYOR, varsayılmıyor — ve boş geçilmiyor.
     */
    expect(
      fs.existsSync(ISKELET_ADIM_3),
      'SORGU KURUCUSU DOGMUS (' + ISKELET_ADIM_3 + ').\n' +
        'Bu kol ARTIK ISKELET OLAMAZ: cetvel K8.1 Katman A icin saf-fonksiyon kollari\n' +
        'istiyor (normalizasyon, kelime sirasi, obek kurulumu — fiksturle, canli DB YOK).\n' +
        'Bu kolu SIL ve yerine gercek kollari yaz. Iskeletin sonsuza kadar yesil yanmasi,\n' +
        'bu depoda olculmus bir kusur sinifidir.',
    ).toBe(false)
  })

  it('ISKELETIN NICIN ISKELET OLDUGU BELGEDE YAZILI (sessiz eksik yok)', () => {
    // Bir eksigin "eksik" oldugunu SOYLEMEYEN belge, eksigi gizler.
    const s = oku(path.join(KOK, 'src', '__tests__', 'conformance', 'arama-davranisi.test.ts'))
    expect(s).toContain('ISKELET_ADIM_3')
    expect(s).toMatch(/HENUZ YAZILMADI|HENÜZ YAZILMADI/)
  })
})
