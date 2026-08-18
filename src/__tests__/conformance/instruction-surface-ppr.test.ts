import { execFileSync } from 'node:child_process'

import { describe, expect, it } from 'vitest'

/**
 * INV-PPR-1 · CANLI TALİMAT YÜZEYLERİ var olmayan PPR özelliğini öğretmesin.
 *
 * NİÇİN VAR: bu projede **PPR kullanılmıyor** — `next.config.mjs`'te `experimental.ppr`
 * hiç açılmadı (2026-08-15 ölçüldü, 2026-08-17 yeniden doğrulandı: dosyada `ppr` geçen sıfır
 * satır). Buna rağmen 2026-08-17'de ölçüldüğünde **canlı talimat yüzeylerinde 8 yerde** PPR
 * hâlâ yürürlükteki kural gibi anlatılıyordu: `venthub-architecture` kendini "PPR config"
 * işi için tetiklenmeye açıyordu (evals'ta 4 sorgu), `fallow` ve `plan-challenger` ise
 * **denetim** skill'leriydi — yani yanlış gerekçe okuyanı yanıltmakla kalmayıp ürettikleri
 * RAPORA geçiyordu.
 *
 * Kusur "yanlış cevap" değil **yanlış YÖNLENDİRME**: kural (`useSearchParams` → `<Suspense>`)
 * doğrudur ve CLAUDE.md kural 5'tir; yanlış olan gerekçenin PPR'a bağlanmasıdır. Bugünün
 * tekrarlayan dersi: **yanlış gerekçe, doğru kuralın içinde taşınabiliyor ve hiçbir test onu
 * yakalamıyor** — kod/kural çalıştığı için yalnız o satırı okuyan insan (veya ajan) yanılır.
 *
 * KAPSAM (cetvele de yazıldı, bekçi kendi listesini uydurmuyor): aşağıdaki `KAPSAM` dizileri.
 * Yalnız **talimat** yüzeyleri: ajanlara ne yapacağını söyleyen dosyalar. Tarihsel kayıtlar ve
 * ÜRETİLMİŞ dosyalar kapsam dışıdır — gerekçeleri `MUAF_SEBEPLERI`'nde ADIYLA yazılı.
 */

/** Talimat yüzeyleri — ajan davranışını BUGÜN yönlendiren dosyalar. */
const KAPSAM = ['.claude/skills', '.agent/skills', '.agent/rules']

/**
 * MUAFİYETLER — her biri ADIYLA ve GEREKÇESİYLE. Geniş kaçış deliği yok.
 *
 * Not: `.archive/`, `registry/`, `CHANGELOG.md` ve üretilmiş master MD'ler zaten `KAPSAM`
 * dışında (tarama yalnız yukarıdaki üç dizine bakar); yine de niçin dışarıda olduklarını
 * burada yazıyoruz, çünkü bir sonraki okuyan "neden taranmıyor" diye soracak.
 */
const MUAF_SEBEPLERI: Record<string, string> = {
  'supabase/SKILL.md':
    'UPSTREAM metin (Supabase tarafından yazılmış genel doküman); "Partially Prerendered (PPR) ' +
    'components" ifadesi Next.js\'in genel yeteneğini anlatıyor, VentHub\'a kural dayatmıyor. ' +
    'Yerelleştirmek upstream ile ayrışma üretir. — OPS-AUDIT kararı 2026-08-17.',
}

/** Kapsam dışı bırakılan yüzeyler ve NİÇİN (dokümantasyon amaçlı; tarama oralara hiç gitmez). */
const KAPSAM_DISI_GEREKCE = [
  '.archive/ — dokunulmayan arşiv; PPR o dönem gerçekten planlıydı, geçmişi yeniden yazmak yanlış',
  'registry/ — iş kayıtları; P05-004 "partial-prerendering" görevi TARİHSEL bir kayıt',
  'CHANGELOG.md — tarihsel kayıt, aynı gerekçe',
  'docs/venthub_skills_master.md ve diğer üretilmiş master MD\'ler — kaynak skill\'lerden ÜRETİLİR; ' +
    'kaynak düzeltilince kendiliğinden düzelir, elle düzenlemek CLAUDE.md\'ye aykırı',
  'CLAUDE.md · CONTEXT.md · docs/standards/rendering-cache-standard.md · docs/audits · docs/plans — ' +
    'bunlar PPR\'ı kural diye ÖĞRETMİYOR, KULLANILMADIĞI KARARINI belgeliyor; doğru hâldeler',
]

interface Ihlal {
  yol: string
  satir: number
  metin: string
}

/** Depo hâlini oku (disk değil git): ikize/ajana giden şey depo hâlidir. */
function izlenenDosyalar(): string[] {
  const ham = execFileSync('git', ['ls-files', ...KAPSAM], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
    env: { ...process.env, MSYS_NO_PATHCONV: '1' },
  })
  return ham.split('\n').map(s => s.trim()).filter(Boolean)
}

function dosyaIcerik(yol: string): string {
  return execFileSync('git', ['show', `HEAD:${yol}`], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
    env: { ...process.env, MSYS_NO_PATHCONV: '1' },
  })
}

function muafMi(yol: string): boolean {
  return Object.keys(MUAF_SEBEPLERI).some(son => yol.endsWith(son))
}

/**
 * PPR'ı CANLI KURAL gibi anan satırlar.
 *
 * Bilinçli olarak "PPR kelimesi geçmesin" DEMİYORUZ: bir satır "PPR DEĞİL / PPR
 * kullanılmıyor" diyorsa o satır çözümün parçasıdır, ihlal değildir. Aksi hâlde bekçi kendi
 * düzeltmesini ihlal sayar (bu tuzağa düşen bir kapı yazılmıştı: `substring-assert` ailesi).
 */
function pprIhlalleri(): Ihlal[] {
  const ihlaller: Ihlal[] = []

  // ── TEK GEÇİŞ: `git grep` bir süreçte tüm eşleşen satırları verir ──
  //
  // ⚠ NİÇİN BÖYLE (ölçülmüş bir arıza): ilk sürüm kapsamdaki HER dosya için ayrı bir
  // `git show HEAD:<yol>` açıyordu — yüzlerce süreç. İzole koşumda geçiyordu, TAM TAKIMDA
  // **20 sn timeout'a düşüp KIRMIZI** yandı (25.8 sn ölçüldü). Kritik ayrıntı: timeout
  // kırmızısı bir İDDİA mesajı taşımaz, yani "hangi dosya" bilgisi olmadan sadece "kırmızı"
  // görünür — bu tam olarak INV-EOL-1'de bildirilen belirtiye benziyor (tam takımda kırmızı,
  // izole yeşil, bağımsız ölçüm temiz). Süreç sayısı bir bekçinin GÜVENİLİRLİĞİDİR.
  const gerekliDosyalar = new Set(
    izlenenDosyalar().filter(y => /\.(md|json|ya?ml)$/i.test(y) && !muafMi(y)),
  )

  let grepCiktisi = ''
  try {
    grepCiktisi = execFileSync(
      'git',
      ['grep', '-n', '-I', '-E', '\\bPPR\\b', 'HEAD', '--', ...KAPSAM],
      { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024, env: { ...process.env, MSYS_NO_PATHCONV: '1' } },
    )
  } catch (e) {
    // `git grep` eşleşme yoksa exit 1 verir — bu TEMİZ demektir, hata değil.
    const f = e as { status?: number; stdout?: string; stderr?: string }
    if (f.status === 1) grepCiktisi = ''
    else {
      throw new Error(
        'ÖLÇÜM YAPILAMADI (ihlal bulundu DEĞİL): "git grep" başarısız oldu. ' +
          `çıkış kodu: ${f.status ?? '(yok)'} · stderr: ${(f.stderr ?? '').trim().slice(0, 200) || '(boş)'}`,
      )
    }
  }

  /** evals dosyaları yapısal okunacak — grep satırları onlar için kullanılmaz. */
  const evalsYollari = [...gerekliDosyalar].filter(y => /evals[/\\]evals\.json$/i.test(y))

  for (const satir of grepCiktisi.split('\n')) {
    if (!satir.trim()) continue
    // Biçim: "HEAD:<yol>:<satir>:<icerik>"
    const m = /^HEAD:([^:]+):(\d+):(.*)$/.exec(satir)
    if (!m) continue
    const [, yol, satirNo, metin] = m
    if (!gerekliDosyalar.has(yol)) continue
    if (/evals[/\\]evals\.json$/i.test(yol)) continue // aşağıda yapısal okunuyor
    if (/PPR[^.!?\n]{0,40}(DEĞİL|DEGIL|kullanılmıyor|kullanilmiyor|KULLANILMIYOR)/i.test(metin)) continue
    if (/experimental\.ppr[^.\n]{0,30}yok/i.test(metin)) continue
    ihlaller.push({ yol, satir: Number(satirNo), metin: metin.trim().slice(0, 160) })
  }

  for (const yol of evalsYollari) {
    let icerik: string
    try {
      icerik = dosyaIcerik(yol)
    } catch {
      continue // HEAD'de yok (yeni, henüz commit'lenmemiş) — commit edilince taranır
    }
    // evals dosyaları YAPISAL okunur, satır satır değil.
    //
    // ⚠ İKİNCİ YANLIŞ POZİTİF (ve ikinci ders): satır eşleme, `should_not_trigger` içine
    // BİLEREK konmuş PPR sorgularını ihlal saydı — oysa onlar çözümün parçası: "PPR sorusu
    // bu skill'i tetiklememeli" iddiasını kayda geçiriyorlar. Sadece dosyayı kapsam dışı
    // bırakmak YANLIŞ olurdu, çünkü asıl kusur `should_trigger` içindeki PPR sorgularıydı
    // (4 tane vardı). Yani doğru çözüm kapsamı daraltmak değil, ölçümü YAPIYA duyarlı kılmak.
    let evals: { should_trigger?: unknown }
    try {
      evals = JSON.parse(icerik) as { should_trigger?: unknown }
    } catch {
      ihlaller.push({ yol, satir: 0, metin: 'evals.json AYRIŞTIRILAMADI — ölçüm yapılamadı' })
      continue
    }
    const tetikleyiciler = Array.isArray(evals.should_trigger) ? evals.should_trigger : []
    for (const q of tetikleyiciler) {
      if (typeof q === 'string' && /\bPPR\b/i.test(q)) {
        ihlaller.push({ yol, satir: 0, metin: `should_trigger içinde PPR sorgusu: "${q}"` })
      }
    }
  }

  return ihlaller
}

describe('INV-PPR-1 · talimat yüzeyi PPR temizliği', () => {
  it('ölçüm aracı GERÇEKTEN dosya görüyor (vacuous-pass koruması)', () => {
    const dosyalar = izlenenDosyalar()
    expect(
      dosyalar.length,
      `KAPSAM (${KAPSAM.join(', ')}) altında hiç izlenen dosya bulunamadı — ölçüm yolu bozuk, ` +
        'bu bekçi hiçbir şey ölçmüyor olurdu',
    ).toBeGreaterThan(50)
    expect(
      dosyalar.filter(y => y.endsWith('SKILL.md')).length,
      'hiç SKILL.md görülmedi — kapsam dizinleri değişmiş olabilir',
    ).toBeGreaterThan(10)
  })

  it('hiçbir talimat yüzeyi PPR\'ı YÜRÜRLÜKTEKİ kural gibi anlatmasın', () => {
    const ihlaller = pprIhlalleri()

    expect(
      ihlaller.map(i => `${i.yol}:${i.satir} — ${i.metin}`),
      'Bu satırlar PPR\'ı canlı kural gibi anlatıyor. Bu projede PPR KULLANILMIYOR ' +
        '(`next.config.mjs`\'te `experimental.ppr` yok). Etkisi "yanlış cevap" değil yanlış ' +
        'YÖNLENDİRME: bir ajan/insan var olmayan bir yapılandırmayı anlatmaya, hatta eklemeye ' +
        'kalkar. Denetim skill\'lerinde daha ağır — yanlış gerekçe üretilen RAPORA geçer.\n' +
        'DÜZELTME: kuralı KORU, gerekçeyi düzelt. Doğru gerekçe: sınırsız `useSearchParams` sayfa ' +
        'kabuğunu istemciye zorlar (SSR zehirlenmesi) ve statik üretimi bozar. SSOT: CLAUDE.md ' +
        'kural 5 · `docs/standards/rendering-cache-standard.md`.\n' +
        'Bir satır "PPR DEĞİL / PPR kullanılmıyor" diyorsa ihlal SAYILMAZ (çözümün parçasıdır).\n' +
        'Muafiyet ADLA verilir: bu dosyadaki MUAF_SEBEPLERI sözlüğüne gerekçe yazılır.',
    ).toEqual([])
  })

  it('muafiyetler ve kapsam-dışı gerekçeleri YAZILI (gerekçesiz muafiyet taşınmasın)', () => {
    // Muafiyet listesi boş OLABİLİR; ama dolu olan her girdinin gerekçesi anlamlı olmalı.
    for (const [ad, sebep] of Object.entries(MUAF_SEBEPLERI)) {
      expect(sebep.length, `${ad} muafiyeti gerekçesiz — "niçin muaf" yazılmamış`).toBeGreaterThan(40)
    }
    expect(
      KAPSAM_DISI_GEREKCE.length,
      'kapsam-dışı gerekçe listesi boş — bir sonraki okuyan "niçin taranmıyor" sorusunu ' +
        'yeniden ölçmek zorunda kalır',
    ).toBeGreaterThan(3)
  })
})
