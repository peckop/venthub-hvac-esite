import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'

import { describe, expect, it, vi } from 'vitest'

/**
 * AĞIR-SINIF ZAMAN AŞIMI EŞİĞİ — 60 sn (global varsayılan 20 sn).
 * Gerekçe: `docs/standards/fleet-mechanism-standard.md` §13. Bu dosya `git` alt süreci
 * doğurur ve `docs/` altındaki her `.md`'yi HEAD'den okur (185 dosya).
 */
vi.setConfig({ testTimeout: 60_000 })

/**
 * INV-DOC-7 · Kapı A'nın EKSİK YÖNÜ — üretilmiş artefakt İLAN EDİLMİŞ mi?
 *
 * ÖLÇÜLMÜŞ BOŞLUK (2026-08-31, REC-84). Mevcut tazelik kapısı tek yönü soruyor:
 * *"ilan edilen her artefakt depoda İZLENEN bir dosya mı?"* Ters yönü **hiç kimse
 * sormuyordu**: *"depodaki üretilmiş bir dosya ilan edilmiş mi?"* Sonuç, sessiz bir kör
 * nokta: manifestte görünmeyen bir artefaktın bayatlığı **ölçülemez** — ve ölçülemeyen
 * bayatlık, AXIOM 4 gereği "taze" sayılamaz.
 *
 * Ölçüm üç gerçek kalem buldu: `database_schema_master.md`, `system_tree.md`,
 * `venthub_skills_master.md` — üçü de üretilmiş, üçü de manifestte YOK.
 *
 * NİÇİN "MANİFESTE EKLE" ÇÖZÜM DEĞİL: `docs/artefakt_manifest.json` ÜRETİLMİŞ bir
 * dosyadır (`orion doc build` yazar, yalnız kendi derlediği 4 artefaktı sayar). Elle satır
 * eklemek AXIOM 3 ihlali olur ve bir sonraki derlemede silinir. Gerçek çözüm üreteç
 * tarafındadır. Bu kapı boşluğu KAPATMAZ; **GÖRÜNÜR ve SINIRLI** kılar: bilinen kalemler
 * gerekçeli bir kayıtta durur, YENİSİ eklenirse kırmızı verir.
 *
 * ⚠ ÖLÇÜT NİÇİN DAMGA, NİÇİN İSİM DEĞİL (AXIOM 8): isim-tabanlı tarama
 * `docs/design_system_config.md`'yi (elle tutulan ayna) yanlışlıkla "üretilmiş" sayıyordu.
 * ⚠ ÖLÇÜT NİÇİN BAŞLIK BÖLGESİNDE: gövdede arandığında
 * `docs/standards/product-schema-standard.md` yanlış-pozitif verdi — orada "otomatik
 * üretilmiş" ifadesi ÜRÜN AÇIKLAMALARINI anlatıyor, dosyanın kendisini değil.
 * İkisi de ölçülmüş yanlış-pozitiftir; ölçüt onlara göre daraltıldı.
 */

const require = createRequire(import.meta.url)
const KOK = require
  .resolve('../../../package.json')
  .replace(/[\\/]package\.json$/, '')
  .replace(/\\/g, '/')

const MANIFEST = 'docs/artefakt_manifest.json'
const ISTISNA_KAYDI = 'docs/artefakt-ilan-istisnalari.json'

/** `node:fs` KULLANILMIYOR (bkz. board-invariants.test.ts ortam notu) — git alt süreci. */
function git(args: string[]): string {
  return execFileSync('git', ['-C', KOK, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

/** HEAD'den oku — DİSK DEĞİL. Kapı commit'lenmiş durumu ölçer (tazelik kapısıyla aynı ilke). */
function headOku(yol: string): string | null {
  try {
    return git(['show', `HEAD:${yol}`])
  } catch {
    return null
  }
}

/**
 * ÜRETİM DAMGALARI — üretece ÖZGÜ, gövdede değil BAŞLIK BÖLGESİNDE aranır.
 * Genel ifadeler (ör. yalnız "otomatik üretil") BİLEREK yok: ölçülmüş yanlış-pozitif üretti.
 */
const DAMGALAR: ReadonlyArray<readonly [RegExp, string]> = [
  [/^compiled_at:\s*\S/m, 'compiled_at'],
  [/otonom olarak derlenmi/i, 'otonom-derlendi'],
  [/Generated automatically from/i, 'generated-automatically-from'],
]
const BASLIK_SATIR_SAYISI = 40

function damgalar(icerik: string): string[] {
  const baslik = icerik.split('\n').slice(0, BASLIK_SATIR_SAYISI).join('\n')
  return DAMGALAR.filter(([re]) => re.test(baslik)).map(([, ad]) => ad)
}

interface Istisna {
  yol: string
  damga: string
  uretec: string
  nicin_ilan_edilemiyor: string
  kapanacagi_taraf: string
  sahibi: string
  kayit: string
}

const ZORUNLU_ALANLAR: ReadonlyArray<keyof Istisna> = [
  'yol', 'damga', 'uretec', 'nicin_ilan_edilemiyor', 'kapanacagi_taraf', 'sahibi', 'kayit',
]

function manifestUrunleri(): Set<string> {
  const ham = headOku(MANIFEST)
  if (ham === null) return new Set()
  const m = JSON.parse(ham) as { artefaktlar?: Array<{ ad?: string }> }
  const liste = Array.isArray(m.artefaktlar) ? m.artefaktlar : []
  return new Set(liste.map((a) => 'docs/' + String(a.ad)))
}

function istisnalar(): Istisna[] {
  const ham = headOku(ISTISNA_KAYDI)
  if (ham === null) return []
  const k = JSON.parse(ham) as { istisnalar?: Istisna[] }
  return Array.isArray(k.istisnalar) ? k.istisnalar : []
}

/** docs/ altındaki İZLENEN her `.md` — damgası olanlar süzülür. */
function damgaliDosyalar(): Array<{ yol: string; damga: string[] }> {
  const yollar = git(['ls-tree', '-r', '--name-only', 'HEAD', 'docs/'])
    .trim()
    .split('\n')
    .filter((p) => p.endsWith('.md'))
  const out: Array<{ yol: string; damga: string[] }> = []
  for (const yol of yollar) {
    const icerik = headOku(yol)
    if (icerik === null) continue
    const d = damgalar(icerik)
    if (d.length) out.push({ yol, damga: d })
  }
  return out
}

describe('INV-DOC-7 · uretilmis artefakt ILAN EDILMIS mi (Kapi A ters yon)', () => {
  it('vacuous-guard: tarama GERCEKTEN damgali dosya buldu (bos evrende kosan kapi olcum degildir)', () => {
    const bulunan = damgaliDosyalar()
    expect(
      bulunan.length,
      'docs/ altinda damgali dosya BULUNAMADI — olcut bozulmus ya da damgalar degismis olabilir. ' +
        'Bu hal "ihlal yok" DEGIL, "hicbir sey olculmedi"dir.',
    ).toBeGreaterThan(0)
  })

  it('ON KOSUL: manifest okunabiliyor ve gercekten artefakt sayiyor', () => {
    expect(headOku(MANIFEST), `${MANIFEST} HEAD'de okunamadi`).not.toBeNull()
    expect(manifestUrunleri().size, 'manifest 0 urun ilan ediyor — asagidaki kollar bosluk olcerdi')
      .toBeGreaterThan(0)
  })

  it('⭐damgali her dosya ya MANIFESTTE ILAN EDILMIS ya da GEREKCELI ISTISNADA', () => {
    const urunler = manifestUrunleri()
    const muaf = new Set(istisnalar().map((i) => i.yol))
    const kacaklar = damgaliDosyalar().filter((d) => !urunler.has(d.yol) && !muaf.has(d.yol))

    expect(
      kacaklar.map((k) => `${k.yol} [${k.damga.join(', ')}]`),
      'URETILMIS ama NE ILAN EDILMIS NE ISTISNADA olan dosya(lar) var. Bunlarin bayatligi ' +
        'OLCULEMEZ ve olculemeyen bayatlik "taze" sayilamaz (AXIOM 4).\n' +
        `YAPILACAK: ya uretec hattina baglayip manifestte ilan ettir, ya ${ISTISNA_KAYDI} ` +
        'kaydina GEREKCESIYLE ekle (niçin ilan edilemiyor + hangi tarafta kapanacak + sahibi).',
    ).toEqual([])
  })

  it('istisna kayitlari EKSIKSIZ — alan bos birakilarak kapi korletilemez', () => {
    const eksikler: string[] = []
    for (const i of istisnalar()) {
      for (const alan of ZORUNLU_ALANLAR) {
        const v = i[alan]
        if (typeof v !== 'string' || v.trim().length === 0) eksikler.push(`${i.yol || '(yolsuz kayit)'} → ${alan}`)
      }
      // "Nicin" alani tek kelimeyle gecistirilemez: gerekce OKUNABILIR olmali.
      if (typeof i.nicin_ilan_edilemiyor === 'string' && i.nicin_ilan_edilemiyor.trim().length < 40) {
        eksikler.push(`${i.yol} → nicin_ilan_edilemiyor COK KISA (gerekce degil, etiket)`)
      }
    }
    expect(eksikler, 'istisna kaydinda eksik/yetersiz alan var — muafiyet GEREKCESIZ verilemez').toEqual([])
  })

  it('istisna kaydi BAYATLAMAZ: her kayit GERCEK ve HALA damgali bir dosyayi gosterir', () => {
    const sorunlar: string[] = []
    for (const i of istisnalar()) {
      const icerik = headOku(i.yol)
      if (icerik === null) {
        sorunlar.push(`${i.yol} → HEAD'de YOK (silinmis/tasinmis; kayit temizlenmeli)`)
        continue
      }
      if (damgalar(icerik).length === 0) {
        sorunlar.push(`${i.yol} → artik URETIM DAMGASI TASIMIYOR (uretilmis olmaktan cikmis olabilir)`)
      }
    }
    expect(
      sorunlar,
      'bayat istisna kaydi, kapiyi sessizce genisletir: olmayan bir dosya icin verilen muafiyet ' +
        'ileride ayni ada sahip GERCEK bir kacagi ortebilir',
    ).toEqual([])
  })

  it('CELISKI YOK: manifestte ILAN EDILEN bir dosya ayni zamanda ISTISNA olamaz', () => {
    const urunler = manifestUrunleri()
    const celisen = istisnalar().map((i) => i.yol).filter((y) => urunler.has(y))
    expect(
      celisen,
      'hem ilan edilmis hem istisna: iki kayit AYRISMIS. Ilan edildiyse istisna DUSMELIDIR — ' +
        'yoksa kayit "boslugu goruyoruz" derken kapanmis bir boslugu gostermeye devam eder',
    ).toEqual([])
  })
})

/**
 * INV-ARAC-ONBELLEGI-1 — takipli ARAÇ ÖNBELLEĞİ / GEÇİCİ DURUM dosyası yoktur.
 *
 * ⭐NİÇİN AYRI BİR SORU (2026-09-01, REC-102): bu sınıf mevcut İKİ kapının da ÖLÇÜT
 * EVRENİ DIŞINDA kalıyordu.
 *  · INV-DOC-7'nin ölçütü DAMGA'dır (AXIOM 8) — araç önbelleği damga TAŞIMAZ; ölçüldü:
 *    `supabase/.temp` altındaki 8 dosyanın hiçbirinde damga yok.
 *  · INV-MUTLAK-YOL-1'in ölçütü KİMLİK YOLU'dur — aynı 8 dosyada kimlik yolu SIFIR.
 * Yani iki kapı da yeşilken bu dosyalar takipte kalmaya devam edebiliyordu. Kapının
 * sebebi bir sızıntı değil, bir KÖR ALAN. Mevcut bir kolun içine sıkıştırmak, kapının
 * ADI ile ÖLÇTÜĞÜ şeyi ayırmak olurdu.
 *
 * Ölçülmüş vaka: 8 takipli dosya, `.gitignore`'da HİÇ kural yok, `cli-latest` geçmişte
 * 10 kez değişmiş (churn); 4 dosya canlı altyapı sürümünü ilan ediyordu (public repoda
 * hafif bilgi açığı). Kimlik bilgisi YOK. CI hiçbirini okumuyor (project-ref `secrets`'ten,
 * prod migration `psql` + `SUPABASE_DB_URL`) — bu ölçüm şarttı, aksi hâlde silmek
 * canlıyı kırardı.
 *
 * ⚠ÖLÇÜT NİÇİN INDEX (ls-files), HEAD DEĞİL: bu dosyanın diğer kolları HEAD okur, çünkü
 * İÇERİK tazeliği ölçer. Bu kol ise TAKİP durumunu ölçer ve takibin tanımı index'tir;
 * `git rm --cached` ile düşürülmüş bir dosya commit'ten önce de "takipsiz"dir. Böylece
 * kol, commit'ten ÖNCE koşulabilir ve sabotajı commit'siz ölçmek mümkün olur.
 *
 * ⚠KENDİ BOŞ-EVREN KORUMASI ZORUNLU: "takipli önbellek YOK" iddiası, `git ls-files` bir
 * sebeple BOŞ dönerse de yeşil verir — kapı kırılınca "geçti" der. INV-MUTLAK-YOL-1'de
 * kardeş kollar ("ölü muafiyet", "mandal geri kaçmaz") boş evrende DÜŞTÜĞÜ için bu tehlike
 * yoktu (ölçüldü). Bu describe'ın böyle kardeşi yok; vacuous-guard kolu o yüzden var.
 */
const ARAC_ONBELLEGI_DESENLERI: { desen: RegExp; ornek: string; nicin: string }[] = [
  {
    desen: /^supabase\/\.temp\//,
    ornek: 'supabase/.temp/cli-latest',
    nicin:
      'Supabase CLI önbelleği: bağlı proje/sürüm bilgisini her komutta yeniden yazar. ' +
      'Depoda tutulması churn üretir ve canlı altyapı sürümlerini public repoda ilan eder. ' +
      'CI bu dosyaları OKUMAZ (ölçüldü: project-ref secrets üzerinden, migration psql ile).',
  },
  {
    desen: /(^|\/)__pycache__\//,
    ornek: 'registry/__pycache__/engine.cpython-311.pyc',
    nicin:
      'Python bytecode: üretilmiş artefakt, her koşuda değişir ve KAYNAK YOLUNU içine gömer ' +
      '(4/9 dosya kimlik yolu sızdırıyordu). REC-102 ile index dışına alındı; INV-MUTLAK-YOL-1 ' +
      'nüksü KİMLİK ekseninde, bu kol SINIF düzeyinde kapatır.',
  },
]

/** Index'teki takipli dosyalar (HEAD değil — gerekçe yukarıda). */
function takipliDosyalar(): string[] {
  return git(['ls-files', '-z']).split('\0').filter(Boolean)
}

/** `git check-ignore`: yol yok sayılıyorsa 0 döner, sayılmıyorsa 1. Kuralın VARLIĞI değil, ÇALIŞMASI ölçülür. */
function yokSayiliyor(yol: string): boolean {
  try {
    execFileSync('git', ['-C', KOK, 'check-ignore', '-q', yol], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

describe('INV-ARAC-ONBELLEGI-1 · takipli ARAÇ ÖNBELLEĞİ yoktur (damgasız + kimliksiz sınıf)', () => {
  it('vacuous-guard: tarama GERÇEKTEN takipli dosya buldu (boş evrende koşan kapı ölçüm değildir)', () => {
    const n = takipliDosyalar().length
    expect(
      n,
      `git ls-files yalnız ${n} dosya döndü. Depo binlerce dosya izler; bu sayı ya git çağrısının ` +
        'kırıldığını ya da yanlış kökte koştuğunu gösterir. Boş evrende "önbellek yok" demek ölçüm değildir.',
    ).toBeGreaterThan(500)
  })

  it('desen listesinin HER kaydı gerekçeli ve örnekli (sınıf ilanı bedava değildir)', () => {
    for (const k of ARAC_ONBELLEGI_DESENLERI) {
      expect(k.nicin.length, `${k.desen} gerekçesi çok kısa`).toBeGreaterThan(60)
      expect(k.desen.test(k.ornek), `${k.desen} kendi örneğiyle EŞLEŞMİYOR: ${k.ornek}`).toBe(true)
    }
  })

  it('⭐HİÇBİR takipli dosya araç-önbelleği desenine uymaz', () => {
    const takipli = takipliDosyalar()
    const ihlal = takipli.filter((y) => ARAC_ONBELLEGI_DESENLERI.some((k) => k.desen.test(y)))
    expect(
      ihlal,
      'Takipli araç önbelleği/geçici durum dosyası bulundu. Bu sınıf ne damga taşır (INV-DOC-7 ' +
        'görmez) ne kimlik yolu (INV-MUTLAK-YOL-1 görmez); yalnız bu kol görür. ' +
        '⚠.gitignore kuralı zaten takipteki dosyayı KORUMAZ — git yalnız takipsiz dosyayı yok ' +
        'sayar. Çözüm: git rm --cached <yol>.',
    ).toEqual([])
  })

  it('⭐.gitignore her deseni GERÇEKTEN yok sayıyor (kuralın varlığı değil, ÇALIŞMASI ölçülür)', () => {
    // Ölçüt `git check-ignore`: kural yanlış dizinde, yanlış biçimde ya da yorumda kalmışsa
    // metin araması yeşil verir, bu ölçüm KIRMIZI verir. "Kural yazıldı" ≠ "koruma çalışıyor".
    const korumasiz = ARAC_ONBELLEGI_DESENLERI.filter((k) => !yokSayiliyor(k.ornek))
    expect(
      korumasiz.map((k) => k.ornek),
      'Bu örnek yollar .gitignore tarafından YOK SAYILMIYOR: bir sonraki araç koşusu dosyayı ' +
        'yeniden takibe sokabilir (git add -A / IDE otomatik ekleme). Nüks kapısı yalnız index ' +
        'tarafını tutar; takipsiz tarafı .gitignore tutmalı.',
    ).toEqual([])
  })
})
