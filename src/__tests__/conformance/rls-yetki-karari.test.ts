import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-AUTH-ROLE-2 — RLS yetki kararı doğru JWT talebinden okunur.
 *
 * NİÇİN VAR (REC-322, 2026-09-13/14 ölçümü): Supabase'de JWT'nin üst düzey `role`
 * talebi POSTGRES rolüdür (`anon` / `authenticated` / `service_role`), uygulama
 * rolü DEĞİLDİR. `... ->> 'role' IN ('admin','moderator')` biçimindeki bir koşul
 * normal bir kullanıcı için HİÇBİR ZAMAN doğru olmaz. Uygulama rolü kararı yalnız
 * `public.is_admin_user()` üzerinden verilir (CLAUDE.md kural 12).
 *
 * ⚠ÖLÇÜM YÜZEYİ: `supabase/migrations/*.sql` METNİ, canlı veritabanı DEĞİL —
 * CI'da veritabanı kimliği yok. Yani bu kapı "depoya YENİ bir yanlış politika
 * girmesin" der; "canlıda yanlış politika yok" DEMEZ. Bu sınır cetvelde de yazılı
 * (docs/standards/rls-yetki-karari-standard.md §6).
 *
 * Cetvel: docs/standards/rls-yetki-karari-standard.md
 * Borç defteri: docs/rls-yetki-karari-borc-ilani.json
 */

const KOK = path.resolve(__dirname, '../../..')
const MIGRATION_DIZINI = path.join(KOK, 'supabase', 'migrations')
const ILAN_YOLU = path.join(KOK, 'docs', 'rls-yetki-karari-borc-ilani.json')

/**
 * ⭐YORUMLAR ÇIKARILDIKTAN SONRA KALAN SQL ÖLÇÜLÜR.
 *
 * Bu yardımcı, 2026-09-14'te REC-328'de sahada öğrenilen bir tuzağın karşılığıdır:
 * kusuru ANLATAN yorumlar da kusurun metnini içerir. Yorumu saymak metni ölçüp
 * davranışı ölçmemektir. Tersi de tuzak: yorumu hiç saymazsam, ihlali bir yorumun
 * içine taşıyan bir değişiklik kapıyı YEŞİL bırakır — ama SQL yorumu çalıştırılmaz,
 * yani davranış üretmez, dolayısıyla burada doğru ölçüt gerçekten "yorumsuz kod".
 */
const yorumsuzSql = (kaynak: string): string =>
  kaynak
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((satir) => !satir.trim().startsWith('--'))
    .join('\n')

/**
 * ⭐İKİLENMİŞ TIRNAK DÜZLEŞTİRİLİR — bu kol bağımsız çürütmede bulunan kör noktayı kapatır.
 *
 * Bazı migration'lar politikayı DİNAMİK üretiyor: politika ifadesini bir METİN olarak
 * bir yardımcıya veriyor (ör. `_create_select_policy_if_absent(..., 'auth.jwt() ->> ''role''
 * = ''admin''')`). SQL metin literalinde tırnak İKİLENİR, yani `->> 'role'` deseni ham
 * metinde `->> ''role''` olarak görünür ve tek-tırnak arayan bir düzenli ifade onu GÖRMEZ.
 * Düzleştirmeden bu dosya kapıdan SESSİZCE geçiyordu (ölçüldü 2026-09-14).
 */
const tirnakDuzlestir = (kod: string): string => kod.replace(/''/g, "'")

/**
 * JWT'den `role` talebini okuyan DÖRT kaynak — biri bile yetmez, dördü ayrı ayrı aranır.
 *
 * ⭐Bu liste, "çağıranı yok iddiası DÖRT kalıbı arar" dersinin RLS'teki karşılığıdır:
 * tek bir yazım biçimini arayan ölçüm, aynı hatanın öteki yazımını kanıtlamaz.
 * `auth.jwt()` Supabase'in yaygın kısayolu ve depoda ZATEN kullanılmış; `claim.role`
 * eski sürümlerin tekil GUC yolu — bugün örneği yok ama yazılabilir bir kaçış yolu.
 */
const JWT_KAYNAKLARI: ReadonlyArray<{ ad: string; re: RegExp }> = [
  { ad: 'request.jwt.claims', re: /request\.jwt\.claims[\s\S]{0,220}?->>\s*'role'/i },
  { ad: 'jwt.claims', re: /jwt\.claims[\s\S]{0,140}?->>\s*'role'/i },
  { ad: 'auth.jwt()', re: /auth\.jwt\(\)\s*->>\s*'role'/i },
  { ad: 'claim.role GUC', re: /current_setting\(\s*'request\.jwt\.claim\.role'/i },
]

/** JWT bağlamında `role` talebi okunuyor mu (yalnız `->> 'role'` yetmez: `user_role` masum). */
const jwtKaynaklari = (kod: string): string[] =>
  JWT_KAYNAKLARI.filter((k) => k.re.test(kod)).map((k) => k.ad)

/** Okunan değer admin/moderator ile karşılaştırılıyor mu — yani YETKİ KARARI mı. */
const yetkiKarariMi = (kod: string): boolean =>
  /->>\s*'role'\s*\)?\s*(IN|=)\s*\(?\s*'(admin|moderator)'/i.test(kod) ||
  /'request\.jwt\.claim\.role'[\s\S]{0,40}?(IN|=)\s*\(?\s*'(admin|moderator)'/i.test(kod)

/** Bir migration dosyası yanlış kaynaktan yetki kararı veriyor mu. */
const ihlalMi = (ham: string): boolean => {
  const kod = tirnakDuzlestir(yorumsuzSql(ham))
  return jwtKaynaklari(kod).length > 0 && yetkiKarariMi(kod)
}

const migrationDosyalari = (): string[] =>
  fs
    .readdirSync(MIGRATION_DIZINI)
    .filter((d) => d.endsWith('.sql'))
    .sort()

type Borc = { dosya: string; ne: string; canli_durumu: string; kapanma_yolu: string }
type Ilan = { surum: number; borclar: Borc[] }

const ilaniOku = (): Ilan => JSON.parse(fs.readFileSync(ILAN_YOLU, 'utf8')) as Ilan

describe('INV-AUTH-ROLE-2: RLS yetki karari yalniz is_admin_user() uzerinden verilir', () => {
  it('dedektor calisiyor: taranan migration sayisi makul', () => {
    // Evren muhafızı: dizin boşalırsa ya da yol kayarsa aşağıdaki kollar
    // SESSİZCE yeşil olurdu. "Bakmadığı şeyi kanıtlamayan yeşil kapı" sınıfı.
    expect(migrationDosyalari().length).toBeGreaterThan(200)
  })

  it('ilan dosyasi gecerli ve her borc satiri dort alani da tasiyor', () => {
    const ilan = ilaniOku()
    expect(Array.isArray(ilan.borclar)).toBe(true)
    for (const b of ilan.borclar) {
      expect(b.dosya, 'borc satirinda dosya adi').toBeTruthy()
      expect(b.ne, `${b.dosya}: NE ihlal ediliyor yazili olmali`).toBeTruthy()
      expect(b.canli_durumu, `${b.dosya}: canli durumu yazili olmali (OLCULMEDI de gecerli cevap)`).toBeTruthy()
      expect(b.kapanma_yolu, `${b.dosya}: borc NASIL kapanir yazili olmali`).toBeTruthy()
    }
  })

  it('R1 · ILAN EDILMEMIS hicbir migration yanlis kaynaktan yetki karari vermiyor', () => {
    const ilanEdilen = new Set(ilaniOku().borclar.map((b) => b.dosya))
    const kacaklar: string[] = []
    for (const dosya of migrationDosyalari()) {
      if (ilanEdilen.has(dosya)) continue
      const ham = fs.readFileSync(path.join(MIGRATION_DIZINI, dosya), 'utf8')
      if (ihlalMi(ham)) kacaklar.push(dosya)
    }
    expect(
      kacaklar,
      'Bu dosyalar `jwt.claims ->> \'role\'` uzerinden admin/moderator karari veriyor ve ILAN EDILMEMIS.\n' +
        'O talep POSTGRES rolunu tasir, uygulama rolunu TASIMAZ — kosul normal kullanici icin asla dogru olmaz.\n' +
        'Dogrusu: public.is_admin_user(). Cetvel: docs/standards/rls-yetki-karari-standard.md\n' +
        'Kacaklar: ' +
        kacaklar.join(', '),
    ).toEqual([])
  })

  it('R2 · BAYATLIK: ilan edilen her dosya HALA var ve HALA kalibi tasiyor', () => {
    // ⭐Bu kol tersini arar. Cozulmus bir borc defterde kalirsa kapi o dosya icin
    // KOR kalir: ilan listesindeki ad, kacak taramasindan muaf tutuluyor. Ayni
    // ders 2026-09-14'te skill ad cakismasi ilaninda SAHADA olculdu ve ilanin
    // bosaltilmasini ZORLADI.
    const bayatlar: string[] = []
    for (const b of ilaniOku().borclar) {
      const yol = path.join(MIGRATION_DIZINI, b.dosya)
      if (!fs.existsSync(yol)) {
        bayatlar.push(`${b.dosya} (dosya YOK)`)
        continue
      }
      if (!ihlalMi(fs.readFileSync(yol, 'utf8'))) {
        bayatlar.push(`${b.dosya} (kalip artik YOK — borc kapanmis)`)
      }
    }
    expect(
      bayatlar,
      'Ilan BAYAT: asagidaki borclar artik gecerli degil, ilandan CIKARILMALI.\n' +
        'Ilan bir MUAFIYET listesi degil BORC DEFTERIDIR; kapanmis borc defterde kalirsa\n' +
        'o dosya adi kacak taramasindan bosuna muaf kalir ve kapi KOR olur.\n' +
        'Bayatlar: ' +
        bayatlar.join(', '),
    ).toEqual([])
  })

  it('R3 · REC-322 migration\'i jwt_role\'u CASCADE\'SIZ dusuruyor', () => {
    // Cetvel §5: cascade bagli politikalari SESSIZCE siler. Cascade'siz drop
    // bagimlilik varsa KIRMIZI yanar — yani "canlida cagiran yok" varsayimi
    // yanlissa sonuc sessiz yetki kaybi DEGIL, gurultulu hata olur.
    const dosya = migrationDosyalari().find((d) => d.includes('jwt_role_emekli'))
    expect(dosya, 'REC-322 migration dosyasi bulunamadi').toBeTruthy()
    const kod = yorumsuzSql(fs.readFileSync(path.join(MIGRATION_DIZINI, dosya as string), 'utf8'))
    expect(/drop\s+function\s+if\s+exists\s+public\.jwt_role\s*\(\s*\)/i.test(kod)).toBe(true)
    expect(
      /drop\s+function[^;]*jwt_role[^;]*cascade/i.test(kod),
      'CASCADE YASAK: bagli politikalari sessizce silerdi (cetvel §5)',
    ).toBe(false)
  })

  it('R4 · REC-322 migration\'i UC politikayi SEMA+TABLO ile dusuruyor (yalniz ada dayanmiyor)', () => {
    // Cetvel §4: ayni uc ad `public.product_images` uzerinde DE var ve orasi
    // CALISIYOR. Sema/tablo yazmayan bir DROP calisan politikayi silerdi.
    const dosya = migrationDosyalari().find((d) => d.includes('jwt_role_emekli')) as string
    const kod = yorumsuzSql(fs.readFileSync(path.join(MIGRATION_DIZINI, dosya), 'utf8'))
    for (const ad of [
      'product_images_insert_admin',
      'product_images_update_admin',
      'product_images_delete_admin',
    ]) {
      expect(
        new RegExp(`drop\\s+policy\\s+if\\s+exists\\s+${ad}\\s+on\\s+storage\\.objects`, 'i').test(kod),
        `${ad} storage.objects belirtilerek dusurulmeli`,
      ).toBe(true)
      expect(
        new RegExp(`drop\\s+policy[^;]*${ad}\\s+on\\s+public\\.product_images`, 'i').test(kod),
        `${ad} public.product_images uzerinde DUSURULMEMELI — orasi calisiyor (cetvel §4)`,
      ).toBe(false)
    }
  })

  it('KENDINI DOGRULAR: yorum siyirici gercekten yoruma bakmiyor', () => {
    // SABOTAJ 1 — ihlal YALNIZ yorumda: yakalanMAmali (SQL yorumu kosmaz).
    const yalnizYorum = [
      '-- request.jwt.claims ->> \'role\' IN (\'admin\',\'moderator\') boyle YAZILMAZ',
      '/* claims ->> \'role\' = \'admin\' da yanlistir */',
      'select 1;',
    ].join('\n')
    expect(ihlalMi(yalnizYorum)).toBe(false)

    // SABOTAJ 2 — ihlal GERCEK kodda: yakalanMALI.
    const gercekKod = [
      '-- zararsiz bir aciklama',
      'create policy p on t for insert with check (',
      "  (current_setting('request.jwt.claims', true)::jsonb ->> 'role') IN ('admin','moderator')",
      ');',
    ].join('\n')
    expect(ihlalMi(gercekKod)).toBe(true)

    // SABOTAJ 3 — AYIRT EDER: `user_role` masum, yakalanMAmali.
    const masum = "select claims ->> 'user_role' = 'admin';"
    expect(ihlalMi(masum)).toBe(false)

    // SABOTAJ 4 — AYIRT EDER: jwt baglami OLMADAN 'role' karsilastirmasi (ornegin
    // bir tablo kolonu) yakalanMAmali. Kapi yanlis KAYNAGI arar, kelimeyi degil.
    const tabloKolonu = "select 1 from user_profiles where role IN ('admin','moderator');"
    expect(ihlalMi(tabloKolonu)).toBe(false)

    // ⭐SABOTAJ 5 — `auth.jwt()` KISAYOLU. Bagimsiz curutmede bulunan kor nokta:
    // ilk yazimda kapi yalniz `request.jwt.claims` ve `jwt.claims` ariyordu, yani
    // Supabase'in EN YAYGIN kisayolu kapidan sessizce geciyordu.
    const authJwt = "create policy p on t for select using (auth.jwt() ->> 'role' = 'admin');"
    expect(ihlalMi(authJwt)).toBe(true)

    // ⭐SABOTAJ 6 — IKILENMIS TIRNAK / DINAMIK POLITIKA. En derin kor nokta: politika
    // ifadesi bir METIN olarak yardimciya veriliyor ve tirnaklar ikileniyor. Duzlestirme
    // olmadan bu kacar — depoda GERCEK bir ornegi var (202508270945_enable_rls_public.sql).
    const dinamik =
      "perform public._create_select_policy_if_absent('public','t','p','auth.jwt() ->> ''role'' = ''admin''');"
    expect(ihlalMi(dinamik)).toBe(true)

    // SABOTAJ 7 — AYIRT EDER: duzlestirme masum bir metni ihlal SAYMAMALI.
    const masumDinamik = "perform f('public','t','p','tenant_id = jwt_tenant_id()');"
    expect(ihlalMi(masumDinamik)).toBe(false)

    // SABOTAJ 8 — eski tekil GUC yolu (`request.jwt.claim.role`) da yakalanMALI.
    const guc =
      "create policy p on t for select using (current_setting('request.jwt.claim.role', true) = 'admin');"
    expect(ihlalMi(guc)).toBe(true)
  })

  it('KENDINI DOGRULAR: DORT jwt kaynagi da ayri ayri taniniyor', () => {
    // Evren muhafızı: bir kaynak regex'i bozulursa bu kol kırmızı yanar. Dördünü
    // birlikte ölçmek, birinin sessizce ölmesini gizler.
    const ornekler: Array<[string, string]> = [
      ['request.jwt.claims', "current_setting('request.jwt.claims', true)::jsonb ->> 'role'"],
      ['jwt.claims', "x.jwt.claims ->> 'role'"],
      ['auth.jwt()', "auth.jwt() ->> 'role'"],
      ['claim.role GUC', "current_setting('request.jwt.claim.role', true)"],
    ]
    for (const [ad, ornek] of ornekler) {
      expect(jwtKaynaklari(ornek), `${ad} kaynagi taninmali`).toContain(ad)
    }
  })

  it('AYIRT EDER: REC-322 migration\'inin KENDISI kacak sayilmiyor (ihlali yalniz yorumda aniyor)', () => {
    // Bu kol, yorum siyiricinin GERCEK dosyada da calistigini kanitlar. Migration'in
    // yorum bloklari kalibi bilerek aniyor (emeklilik gerekcesini anlatiyor); kod
    // tarafinda tek bir ihlal yok. Siyirici bozulursa BU kol kirmizi yanar.
    const dosya = migrationDosyalari().find((d) => d.includes('jwt_role_emekli')) as string
    const ham = fs.readFileSync(path.join(MIGRATION_DIZINI, dosya), 'utf8')
    expect(ham.includes("->> 'role'"), 'ham metinde kalip yorumda GECIYOR olmali').toBe(true)
    expect(ihlalMi(ham), 'ama yorumsuz kodda GECMEMELI').toBe(false)
  })
})
