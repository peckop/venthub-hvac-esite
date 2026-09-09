/**
 * INV-DENETIM-IZI-1 KİLİDİ — REC-292 denetim izinin üç ayağı da yerinde mi?
 *
 * NİÇİN BU KİLİT VAR
 *
 * REC-292'nin çıktısı üç parçadır ve **üçü birbirine bağlı**: migration (tetikler),
 * canlı-DB kapısı (tetikler duruyor mu), cetvel (kural neden böyle). Biri düşerse diğer
 * ikisi anlamını kaybeder:
 *   · migration inip kapı inmezse → tetik `DROP TRIGGER` ile sökülür, kimse görmez.
 *   · kapı inip migration inmezse → kapı ölçtüğü şey olmadığı için sürekli kırmızı.
 *   · cetvel inmezse → kural "hatırlanan" olur; bu depoda hatırlanan kural yoktur.
 *
 * Bu kilit, üçünün AYNI PR'da ve tutarlı indiğini ölçer. Ayrıca kapı mantığının kendisini
 * fikstürle sınar: **sınanamayan kapı, kanıt değil iddiadır.**
 *
 * ⭐AYIRT EDİCİ ÇİFT: aşağıdaki kollar yalnız "geçiyor mu" diye bakmaz; eksik tetikli ve
 * fail-open'lı fikstürlerin KIRMIZI verdiğini de gösterir. Bir kapının yeşil verdiği tek
 * hâlde de yeşil vermesi, kapı olduğunu kanıtlamaz.
 */
import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const KOK = path.resolve(__dirname, '../../..')
const KAPI = path.join(KOK, 'scripts/db/checks/denetim-izi-tetik-kapisi.mjs')
const CI = path.join(KOK, '.github/workflows/db-advisor.yml')
const CETVEL = path.join(KOK, 'docs/standards/denetim-izi-standard.md')
const MIGRATION_DIZIN = path.join(KOK, 'supabase/migrations')

const oku = (p: string) => fs.readFileSync(p, 'utf8')

/** Kapının döndürdüğü hüküm — kapı ile kilit AYNI sözleşmeyi konuşsun. */
interface Ihlal {
  sinif: string
  tablo: string
  aciklama: string
}
interface Hukum {
  ihlaller: Ihlal[]
  denetimTetikSayisi: number
}
/** Kapının okuduğu tetik satırı (pg_trigger + pg_proc birleşimi). */
interface TetikSatiri {
  tablo: string
  tetik: string
  fonksiyon: string
  govde: string
  tanim: string
}

/** YAML yorumlarını at: "yorumda geçiyor" ile "gerçekten çağrılıyor" ayrışsın. */
function yorumsuz(yaml: string): string {
  return yaml
    .split(/\r?\n/)
    .map((s) => s.replace(/(^|\s)#.*$/, ''))
    .join('\n')
}

function migrationYolu(): string {
  const dosyalar = fs.readdirSync(MIGRATION_DIZIN).filter((f) => /denetim_izi/.test(f))
  expect(
    dosyalar.length,
    'denetim izi migration dosyasi bulunamadi — uc ayaktan biri EKSIK',
  ).toBeGreaterThan(0)
  return path.join(MIGRATION_DIZIN, dosyalar[0])
}

async function degerlendirYukle(): Promise<(s: TetikSatiri[]) => Hukum> {
  const mod: { degerlendir: (s: TetikSatiri[]) => Hukum } = await import(/* @vite-ignore */ KAPI)
  return mod.degerlendir
}

describe('INV-DENETIM-IZI-1 · uc ayak birlikte iner', () => {
  it('CI bu kapiyi GERCEKTEN cagiriyor (yorum degil, kosan satir)', () => {
    const govde = yorumsuz(oku(CI))
    expect(govde).toMatch(/node\s+scripts\/db\/checks\/denetim-izi-tetik-kapisi\.mjs/)
  })

  it('CI adimi DOGRU sirri ve kok sertifikayi veriyor (kardes adimlarla ayni)', () => {
    const govde = yorumsuz(oku(CI))
    const i = govde.indexOf('denetim-izi-tetik-kapisi.mjs')
    // Evren KASITLI olarak adimin kendisi: dosyanin baska yerinde duran sir, bu adimin
    // sirri DEGILDIR. (Bugun sekiz kez "olcut keskin, evren yanlis"a dustum; burada evreni
    // daraltmak o dersin uygulamasi.)
    const pencere = govde.slice(Math.max(0, i - 900), i)
    expect(pencere).toMatch(/SUPABASE_DB_URL:\s*\$\{\{\s*secrets\.SUPABASE_DB_URL\s*\}\}/)
    expect(pencere).toMatch(/PGSSLROOTCERT=.*supabase-root-2021-ca\.pem/)
  })

  it('kapi OLCEMEDIGI hali YESIL saymaz (cikis 2 yollari var, ve kendi hatasini soyler)', () => {
    const kaynak = oku(KAPI)
    expect(kaynak).toMatch(/process\.exit\(2\)/)
    expect(kaynak).toMatch(/OLCULEMEDI/)
    // Bos sorgu = kor kosum; "ihlal yok" DEMEZ.
    expect(kaynak).toMatch(/satirlar\.length\s*===\s*0/)
  })

  it('⛔MUTLAK YOL yok (§24 — depo PUBLIC, kullanici adi tasiyan yol kimlik sizdirir)', () => {
    const kaynak = oku(KAPI)
    expect(kaynak).not.toMatch(/[A-Za-z]:[\\/]Users[\\/]/)
    expect(kaynak).not.toMatch(/\/home\/[a-z]/)
  })

  it('kapi TABAN dosyasi kullanmiyor — ve bunun GEREKCESI yazili', () => {
    const kaynak = oku(KAPI)
    expect(kaynak).not.toMatch(/baseline/i)
    // Gerekce cetvelde: eksiklik gerekcelendirilebilir bir hal DEGIL.
    expect(oku(CETVEL)).toMatch(/[Tt]aban dosyas[ıi] YOKTUR/)
  })
})

describe('INV-DENETIM-IZI-1 · migration ne SOYLUYORSA onu YAPIYOR', () => {
  it('FAIL-CLOSED: tetik fonksiyonunda exception yakalayicisi YOK', () => {
    const sql = oku(migrationYolu())
    // Kod satirlarini yorumlardan ayir: gerekce metninde "exception" GECEBILIR
    // (nicin yazilmadigini anlatiyor), ama KOD icinde gecmemeli. Bu ayrimi yapmayan
    // bir kol, kendi gerekce metnine bakip kirmizi verirdi — dun tam bu oldu.
    const kodSatirlari = sql
      .split(/\r?\n/)
      .filter((s) => !/^\s*--/.test(s))
      .join('\n')
    expect(kodSatirlari).not.toMatch(/\bexception\s+when\b/i)
  })

  it('ATOMIK: tek islem blogu (INV-MIGRATION-1) ve CONCURRENTLY yok', () => {
    const sql = oku(migrationYolu())
    expect(sql).toMatch(/^begin;/m)
    expect(sql).toMatch(/^commit;/m)
    expect(sql).not.toMatch(/concurrently/i)
  })

  it('ALTI tablonun HER BIRINDE tetik var — site_settings DAHIL', () => {
    const sql = oku(migrationYolu())
    for (const tablo of [
      'categories',
      'products',
      'product_families',
      'product_images',
      'brands',
      'site_settings',
    ]) {
      expect(
        new RegExp(`create trigger denetim_izi\\w*\\s+after[\\s\\S]{0,240}on public\\.${tablo}\\b`, 'i').test(sql),
        `${tablo} icin denetim tetigi YOK — ilk bitti olcutum tam bu araligi geciriyordu`,
      ).toBe(true)
    }
  })

  it('products UPDATE tetigi KOLON SUZGECLI ve stok kolonlari DISARIDA (OPS H2)', () => {
    const sql = oku(migrationYolu())
    const m = /create trigger denetim_izi_products_upd([\s\S]*?);/i.exec(sql)
    expect(m, 'products UPDATE tetigi bulunamadi').not.toBeNull()
    const tanim = m ? m[1] : ''
    expect(tanim).toMatch(/after\s+update\s+of/i)
    for (const kolon of ['price', 'category_id', 'status', 'deleted_at', 'sku']) {
      expect(tanim, `ticari cekirdek kolon suzgecte yok: ${kolon}`).toMatch(new RegExp(`\\b${kolon}\\b`))
    }
    for (const kolon of ['stock_qty', 'low_stock_threshold', 'last_purchased_at']) {
      expect(tanim, `otomasyon kolonu suzgece SIZMIS: ${kolon}`).not.toMatch(new RegExp(`\\b${kolon}\\b`))
    }
  })

  it('NO-OP UPDATE elemesi var (ON CONFLICT gurultusu icin) ve updated_at haric', () => {
    const sql = oku(migrationYolu())
    expect(sql).toMatch(/is distinct from/i)
    expect(sql).toMatch(/updated_at/)
  })

  it('actor NULL ise "sistem" DEMEZ — yorum satiri degil, YAZILAN metin', () => {
    const sql = oku(migrationYolu())
    // Tetigin admin_audit_log.comment alanina yazdigi metin bu ayrimi TASIMALI.
    expect(sql).toMatch(/BILINMIYOR[\s\S]{0,40}sistem DEMEZ/i)
  })
})

describe('INV-DENETIM-IZI-1 · cetvel kurali ve sinirlarini ADIYLA yaziyor', () => {
  it('cetvel dosyasi var ve fail-closed hukmunu ispat yukuyle anlatiyor', () => {
    const c = oku(CETVEL)
    expect(c).toMatch(/[Ff]ail-closed/)
    expect(c).toMatch(/[Ii]spat y[üu]k[üu]/)
  })

  it('TRUNCATE boslugu KAPSAM DISI olarak ADIYLA yazili (kapi kapattigini iddia ETMEZ)', () => {
    expect(oku(CETVEL)).toMatch(/TRUNCATE/)
    expect(oku(KAPI)).toMatch(/KAPSAM DISI[\s\S]{0,60}TRUNCATE/)
  })

  it('geriye donuk denetim satiri uretimi YASAK olarak yazili', () => {
    expect(oku(CETVEL)).toMatch(/[Gg]eriye d[öo]n[üu]k denetim sat[ıi]r[ıi][\s\S]{0,30}[ÜU]RET[İI]LMEZ/)
  })

  it('site_settings tenant BORCU gizlenmemis', () => {
    const c = oku(CETVEL)
    expect(c).toMatch(/site_settings/)
    expect(c).toMatch(/bor[çc]/i)
  })
})

describe('INV-DENETIM-IZI-1 · kapi MANTIGI fiksturle sinaniyor (ayirt edici cift)', () => {
  // ⚠FİKSTÜR GERÇEĞİ TAKLİT ETMELİ, yoksa test KÖRDÜR. İlk yazdığımda `products` satırını
  // da "AFTER INSERT OR UPDATE OR DELETE" diye kurmuştum — oysa migration `products`'ı
  // İKİYE bölüyor (INSERT/DELETE ayrı, UPDATE OF ayrı). Taklit etmeyen fikstür, kapının
  // gerçek girdisiyle hiç karşılaşmadığı bir dünyayı sınıyordu.
  const TAM: TetikSatiri[] = [
    'categories',
    'product_families',
    'product_images',
    'brands',
    'site_settings',
  ]
    .map((tablo) => ({
      tablo,
      tetik: `denetim_izi_${tablo}`,
      fonksiyon: 'denetim_izi_yaz',
      govde: 'begin insert into admin_audit_log ... end;',
      tanim: `CREATE TRIGGER denetim_izi_${tablo} AFTER INSERT OR UPDATE OR DELETE ON public.${tablo} FOR EACH ROW EXECUTE FUNCTION denetim_izi_yaz()`,
    }))
    .concat([
      {
        tablo: 'products',
        tetik: 'denetim_izi_products',
        fonksiyon: 'denetim_izi_yaz',
        govde: 'begin insert into admin_audit_log ... end;',
        tanim:
          'CREATE TRIGGER denetim_izi_products AFTER INSERT OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION denetim_izi_yaz()',
      },
    ])

  const PRODUCTS_UPD: TetikSatiri = {
    tablo: 'products',
    tetik: 'denetim_izi_products_upd',
    fonksiyon: 'denetim_izi_yaz',
    govde: 'begin insert into admin_audit_log ... end;',
    tanim:
      'CREATE TRIGGER denetim_izi_products_upd AFTER UPDATE OF name, price, sku, category_id, status, deleted_at ON public.products FOR EACH ROW EXECUTE FUNCTION denetim_izi_yaz()',
  }

  it('YESIL taraf: alti tablo + suzgecli products UPDATE -> ihlal YOK', async () => {
    const degerlendir = await degerlendirYukle()
    const { ihlaller } = degerlendir([...TAM, PRODUCTS_UPD])
    expect(ihlaller).toEqual([])
  })

  it('⭐KIRMIZI taraf 1: site_settings tetigi SILINMIS -> TETIK-YOK', async () => {
    const degerlendir = await degerlendirYukle()
    const eksik = [...TAM.filter((r) => r.tablo !== 'site_settings'), PRODUCTS_UPD]
    const { ihlaller } = degerlendir(eksik)
    expect(ihlaller.map((i) => i.sinif)).toContain('TETIK-YOK')
  })

  it('⭐KIRMIZI taraf 2: govdeye exception yakalayicisi girmis -> FAIL-OPEN', async () => {
    const degerlendir = await degerlendirYukle()
    const bozuk = [...TAM, PRODUCTS_UPD].map((r) => ({
      ...r,
      govde: 'begin insert into admin_audit_log ... exception when others then raise warning; end;',
    }))
    const { ihlaller } = degerlendir(bozuk)
    expect(ihlaller.map((i) => i.sinif)).toContain('FAIL-OPEN')
  })

  it('⭐KIRMIZI taraf 3: products UPDATE suzgeci KALKMIS -> SUZGEC-YOK', async () => {
    const degerlendir = await degerlendirYukle()
    const suzgecsiz: TetikSatiri = {
      ...PRODUCTS_UPD,
      tanim:
        'CREATE TRIGGER denetim_izi_products_upd AFTER UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION denetim_izi_yaz()',
    }
    const { ihlaller } = degerlendir([...TAM, suzgecsiz])
    const siniflar = ihlaller.map((i) => i.sinif)
    expect(siniflar.some((s) => s === 'SUZGEC-YOK' || s === 'SUZGEC-DAR')).toBe(true)
  })

  it('⭐KIRMIZI taraf 4: suzgec DARALTILMIS (price cikarilmis) -> SUZGEC-DAR', async () => {
    const degerlendir = await degerlendirYukle()
    const dar: TetikSatiri = {
      ...PRODUCTS_UPD,
      tanim:
        'CREATE TRIGGER denetim_izi_products_upd AFTER UPDATE OF name, sku, category_id, status, deleted_at ON public.products FOR EACH ROW EXECUTE FUNCTION denetim_izi_yaz()',
    }
    const { ihlaller } = degerlendir([...TAM, dar])
    expect(ihlaller.map((i) => i.sinif)).toContain('SUZGEC-DAR')
  })

  it('ayiklayici gercekten calisiyor: denetim_izi DISI tetikler ihlal saymaz', async () => {
    const degerlendir = await degerlendirYukle()
    // Webhook tetikleri (on_*) kapsamda DEGIL; bunlari saymak yanlis-yesil uretirdi.
    const webhook: TetikSatiri = {
      tablo: 'products',
      tetik: 'on_products_change',
      fonksiyon: 'handle_supabase_webhook',
      govde: '',
      tanim: '',
    }
    const { denetimTetikSayisi } = degerlendir([...TAM, PRODUCTS_UPD, webhook])
    expect(denetimTetikSayisi).toBe(7)
  })
})
