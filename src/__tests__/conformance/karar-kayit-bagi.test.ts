// @vitest-environment node
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-KARAR-KAYIT-1 — karar belgesindeki her karar başlığı KENDİSİNİ BİR YERE BAĞLAR (REC-274).
 *
 * NİÇİN VAR — Recep, 2026-09-07 20:13Z: *"çöz lütfen, sabahtan beri aynı sorunlar."*
 * URUN'un filo bulgusu (REC-271): kapılar KODU ölçüyor, KARARI ölçmüyor. Karar yazıldığı an
 * bitmiş sayılıyor; kararla onu hayata geçiren iş arasında hiçbir bağ yok. Sonuç: aynı konu
 * gün içinde birden fazla kez yeniden tartışılıyor.
 *
 * ⭐KAPININ DOĞRULUĞUNU BELİRLEYEN AYRIM — ÖLÇÜMLE BULUNDU, VARSAYIMLA DEĞİL:
 * Numarasız `##` başlıkların hepsi karar DEĞİL. Yedi belgeyi taradım, iki sınıf çıktı:
 *   · `## K — <başlık>` ve `## AÇIK — <başlık>` → numarası DÜŞMÜŞ gerçek karar (14 tane)
 *   · `## Tasarım Programı Haritası` · `## Belge sırası` · `## Açık işler` → YAPISAL BÖLÜM (3)
 * Yapısal başlıkları ihlal saymak, kapının düz metne BİÇİM DAYATMASI olurdu — INV-CETVEL-YAPI
 * tam bu hatadan kaçınmak için numarasız düz başlıkları kapsam dışı tutuyor. Bu kapı da
 * yalnız `K…` / `AÇIK…` ile başlayan başlıkları ölçer.
 *
 * ÖLÇÜLEN İHLAL ENVANTERİ (2026-09-07, dışa aktarılmış dosyalar):
 *   · 87 `## K<n>` + 14 numarasız karar başlığı + 3 yapısal başlık
 *   · MÜKERRER numara 7 kalem, ÜÇ dosyada: katalog K7 · kurumsal K3 · vitrin K1/K18/K23/K25/K31
 *   · `DURUM:` satırı henüz HİÇBİR belgede yok (7 dosyada 0)
 * ⚠OPS'un notu "16 numarasız / 4 mükerrer" diyordu; fark bildirildi. OPS Linear belgelerini,
 * bu kapı dışa aktarılmış DOSYALARI ölçüyor — rapor edilen sayılar dosyaların sayılarıdır.
 *
 * ⛔KİP: DURUM satırı henüz doldurulmadığı için yedi belge de UYARI kipinde başlar. Kırmızıya
 * geçiş, OPS'un doldurması master'a indikten SONRA `KIP` haritasında tek satırla yapılır.
 * Aksi hâlde bu PR'ın kendi CI'ı kırmızı olurdu ve kapı hiçbir şey kanıtlamamış sayılırdı.
 *
 * ⛔⛔UYARI KİPİ FAIL-OPEN'DIR ve bu dosyanın en büyük riski o. O yüzden KIRMIZI davranışın
 * gerçekten kırmızı verdiği FİKSTÜR üzerinde kanıtlanır (aşağıdaki sekiz kol). Uyarı kipi
 * canlı belgelerin sayısını RAPOR eder; kapının dişi fikstürlerde ölçülür. "Bugün kimse
 * düşmüyor" ile "kapı ölçmüyor" aynı görünmesin.
 */

const BELGE_DIZINI = path.join(process.cwd(), 'docs', 'proje-takip', 'linear')
const KAPI_DIZINI = path.join(process.cwd(), 'src', '__tests__', 'conformance')
const DOKUM_ONEK = 'is-dagilimi-'

/**
 * KİP HARİTASI — dosya adı önekine göre. Varsayılan UYARI.
 * ⭐Kırmızıya geçiş tarihi REC-274'e yazılır; buradaki satır o kararın KODDAKİ karşılığıdır.
 */
const KIP: Record<string, 'KIRMIZI' | 'UYARI'> = {
  // ⛔2026-09-08: KIRMIZI'ya ALINAMADI ve sebebi ÖLÇÜLDÜ — öncül çürüdü.
  // #1113 ile 57 başlığa DURUM satırı indi, ama kip açılınca **26 ihlal** çıktı; ikisi
  // ayrı sınıf ve YALNIZ BİRİ bendeydi:
  //   (a) 21 satır `KURAL → kapı YOK (REC-nnn)` — MEŞRU bir hâl, kapı beni yanlış ölçüyordu.
  //       Beşinci biçim olarak TANINDI (aşağıda), REC varlık kontrolüyle.
  //   (b) 8 satır MÜKERRER numara (K1, K18×2, K23×3, K25, K31) — belgenin GERÇEK kusuru ve
  //       OPS'un dosyası; onarımı onda. Kip, o düzeltme master'a inince açılır.
  // Kendi CI'ımı başkasının dosyasındaki kusurla kırmızı yapmak, kapıyı susturulası hâle
  // getirirdi; UYARI kipi bugün o kusuru RAPOR ediyor ve sahibi biliyor.
  // ⭐AÇILDI 2026-09-08 (#1118 master'a indikten SONRA), ve açmadan ÖNCE ölçüldü:
  // UYARI kipindeki canlı rapor `kararlar-vitrin-15a-2026-09-08.md — karar 49, ihlal 0`
  // dedi. "İndi demek temiz demek" saymadım; bu satır bir ölçümün sonucudur, bir umudun değil.
  //
  // YOL BURAYA NASIL GELDİ — üç adım, ikisi KAPININ kendi kusuruydu:
  //   26 ihlal → (beşinci DURUM biçimi tanındı: `KURAL → kapı YOK (REC-nnn)`) → 7
  //            → (ek karar `K<n>-<harf>` ayrı kimlik sayıldı) → 2
  //            → (#1118: OPS iki biçimsiz başlığı K18-a / K1-a yaptı) → 0
  // Yani 26'nın 26'sı belgenin kusuru DEĞİLDİ; 21+5'i kapının okuma kusuruydu.
  //
  // Diğer altı belge UYARI'da kalır — onlarda DURUM satırı henüz yok; OPS doldurdukça
  // her biri kendi ölçümüyle, tek tek açılır.
  'kararlar-vitrin-15a': 'KIRMIZI',
}

type Baslik = { ham: string; satir: number; kararMi: boolean; kimlik: string[]; govde: string }

/** Karar başlığı mı? `K1 ·` / `K — ` / `K32–K35` / `AÇIK — ` evet; düz metin başlığı hayır. */
function kararBasligiMi(baslik: string): boolean {
  return /^##\s+(K\d|K\s*[·—–-]|AÇIK\s*[·—–-])/.test(baslik)
}

/** Başlıktaki numara(lar). `K32–K35` aralığı tek başlıkta kabul (kayıt hükmü). */
/**
 * Başlığın KİMLİK(LER)İ. Sayı değil DİZE döner ve sebebi ölçülmüş bir kusurdur.
 *
 * ⭐ÖNCE SAYI DÖNÜYORDU VE BU YANLIŞTI (2026-09-08, OPS ölçtü, kabul ettim):
 * Belgede `K<n>-<harf>` **ek karar** biçimi KASITLI ve beş başlıkta zaten kullanılıyordu
 * (K18-b, K23-a, K23-b, K25-b, K31-a). Eski çözümleme yalnız ön rakamı alıp **ek harfi
 * YUTUYORDU**, yani `K23-a` ile `K23-b` aynı kimlik sanılıyor ve kapı bunları MÜKERRER
 * diye kırmızıya yazıyordu.
 *
 * ⛔BU BENİM KENDİ HATAMIN DÜZELTMESİ, ve atfı da düzeltiyor: dün "7 mükerrer numara,
 * belgenin kusuru" diye raporladım. SAYI doğruydu, ATIF yanlıştı — yedinin **beşi**
 * kapının çözümleme kusuruydu, yalnız ikisi gerçekten biçimsiz başlıktı (onları OPS
 * `K18-a` / `K1-a` olarak düzeltti). "Ölçüt keskin ama yorum yanlış" sınıfı.
 *
 * KURAL: kimlik `K<n>` YA DA `K<n>-<harf>`; ikisi AYRI kimliktir. Aralık (`K32–K35`)
 * her sayıyı ayrı kimlik üretir. Mükerrer ölçütü **tam kimliğin** iki kez geçmesidir.
 */
function kimlikler(baslik: string): string[] {
  // 1) Ek karar: K<n>-<harf>. Harf ekini aralık ayıracından ayırt eder (aralıkta rakam gelir).
  const ek = /^##\s+K(\d+)-([A-Za-zÇĞİıÖŞÜçğöşü]+)/.exec(baslik)
  if (ek) return ['K' + Number(ek[1]) + '-' + ek[2].toLowerCase()]

  // 2) Aralık ya da tek numara.
  const m = /^##\s+K(\d+)(?:\s*[–—-]\s*K?(\d+))?/.exec(baslik)
  if (!m) return []
  const bas = Number(m[1])
  const son = m[2] ? Number(m[2]) : bas
  if (!Number.isFinite(bas) || !Number.isFinite(son) || son < bas || son - bas > 50) return ['K' + bas]
  const out: string[] = []
  for (let i = bas; i <= son; i++) out.push('K' + i)
  return out
}

function basliklariCikar(metin: string): Baslik[] {
  const satirlar = metin.split(/\r?\n/)
  const idx: number[] = []
  satirlar.forEach((s, i) => { if (/^##\s+/.test(s)) idx.push(i) })
  return idx.map((i, k) => {
    const son = k + 1 < idx.length ? idx[k + 1] : satirlar.length
    return {
      ham: satirlar[i],
      satir: i + 1,
      kararMi: kararBasligiMi(satirlar[i]),
      kimlik: kimlikler(satirlar[i]),
      govde: satirlar.slice(i + 1, son).join('\n'),
    }
  })
}

/** Gövdedeki `DURUM:` satırı — kalın yazım (`**DURUM:**`) da kabul. */
function durumSatiri(govde: string): string | null {
  const m = /^\s*(?:\*\*)?DURUM:?(?:\*\*)?\s*(.+?)\s*$/m.exec(govde)
  return m ? m[1].replace(/\*\*/g, '').trim() : null
}

type Ihlal = { belge: string; satir: number; baslik: string; sebep: string }

function dokumKayitlari(): Map<string, string> {
  const harita = new Map<string, string>()
  let dosyalar: string[] = []
  try {
    dosyalar = fs.readdirSync(BELGE_DIZINI).filter((d) => d.startsWith(DOKUM_ONEK) && d.endsWith('.json')).sort()
  } catch { return harita }
  const enYeni = dosyalar[dosyalar.length - 1]
  if (!enYeni) return harita
  try {
    const j = JSON.parse(fs.readFileSync(path.join(BELGE_DIZINI, enYeni), 'utf8'))
    for (const k of j.kayitlar || []) {
      if (k && k.identifier) harita.set(String(k.identifier), String(k.status || ''))
    }
  } catch { /* bos harita → asagida fail-closed */ }
  return harita
}

/**
 * DURUM değerini doğrula. BEŞ biçim (kayıt hükmü):
 *   `KURAL → kapı: <dosya>`      · dosya `src/__tests__/conformance/` altında VAR olmalı
 *   `KURAL → kapı YOK (REC-nnn)` · kapısı HENÜZ yazılmamış kural; REC dökümde VAR olmalı
 *   `İŞ → REC-nnn (<state>)`     · kayıt dökümde var olmalı, Canceled ise KIRMIZI
 *   `İSTİŞARE — karar değil`
 *   `AÇIK — karar bekliyor`      · başlıktaki tarih 7 günden eskiyse KIRMIZI
 *
 * ⭐BEŞİNCİ BİÇİM SONRADAN EKLENDİ, VE SEBEBİ ÖLÇÜMDÜR (2026-09-08).
 * Kapı KIRMIZI kipe alınmak istendiğinde vitrin belgesinde 26 ihlal çıktı; **21'i**
 * `KURAL → kapı YOK (REC-nnn)` biçimindeydi. İlk tepki "OPS yanlış yazmış" olurdu —
 * DEĞİLDİ. Bu, MEŞRU ve bu depoda ADI KONMUŞ bir hâl: CLAUDE.md kural 1 "cetvel yok
 * geçerli bir cevaptır ama BEDAVA DEĞİLDİR — o zaman iş, cetveli yazmayı da kapsar"
 * der. Yani "kural karara bağlandı, kapısı henüz yazılmadı, takibi şu kayıtta" tam
 * olarak o cümlenin karşılığıdır. Kapı bunu ihlal sayarken **kendi cetvelini** ölçmüyordu.
 *
 * ⛔AMA KAÇIŞ DELİĞİ DEĞİL: REC dökümde YOKSA ya da İPTAL ise KIRMIZI. Aksi hâlde
 * "kapı YOK (REC-9999)" yazmak her kararı susturmanın bedava yolu olurdu — yani
 * ölçmeyen bir gösterge. Kontrol `İŞ` kolundakinin AYNISI, bilerek: iki yerde iki
 * kural olmasın.
 */
export function durumDogrula(
  durum: string,
  baslik: string,
  kayitlar: Map<string, string>,
  kapiVarMi: (dosya: string) => boolean,
  bugun: Date,
): string | null {
  const d = durum.trim()

  let m
  // ⭐SIRA ÖNEMLİ: "kapı YOK (...)" kolu, "kapı: <dosya>" kolundan ÖNCE denenir. Tersi
  // olsaydı iki nokta içermeyen bu biçim ikinci kola düşüp "biçimsiz" sayılırdı.
  if ((m = /^KURAL\s*(?:→|->)\s*kap[ıi]\s+YOK\s*\((REC-\d+)[^)]*\)\s*$/i.exec(d))) {
    const rec = m[1].toUpperCase()
    if (!kayitlar.has(rec)) {
      return 'KURAL kapisi YOK deniyor ama takip kaydi dokumde YOK: ' + rec +
        ' (kapisiz kural ancak bir kayda bagliysa mesrudur)'
    }
    const durumu = kayitlar.get(rec) || ''
    if (/^cancel/i.test(durumu)) {
      return 'KURAL kapisi YOK ve takip kaydi IPTAL: ' + rec + ' (' + durumu +
        ') — kapi da kayit da yok, karar sahipsiz'
    }
    return null
  }

  if ((m = /^KURAL\s*(?:→|->)\s*kap[ıi]\s*:\s*(.+)$/i.exec(d))) {
    const dosya = m[1].trim().replace(/^`|`$/g, '')
    if (!/^[\w./-]+$/.test(dosya)) return 'KURAL kapi adi bicimsiz: ' + dosya
    if (!kapiVarMi(dosya)) return 'KURAL kapisi YOK: ' + dosya + ' (var olmayan kapi adi, karari koruyormus gibi gorunur)'
    return null
  }

  if ((m = /^[İI]Ş\s*(?:→|->)\s*(REC-\d+)/i.exec(d))) {
    const rec = m[1].toUpperCase()
    if (!kayitlar.has(rec)) return 'IS kaydi dokumde YOK: ' + rec
    const durumu = kayitlar.get(rec) || ''
    if (/^cancel/i.test(durumu)) return 'IS kaydi IPTAL: ' + rec + ' (' + durumu + ') — karar sahipsiz kaldi'
    return null
  }

  if (/^[İI]ST[İI]ŞARE\b/i.test(d)) return null

  if (/^AÇIK\b/i.test(d)) {
    const t = /(\d{4}-\d{2}-\d{2})/.exec(baslik)
    if (!t) return 'ACIK durumu var ama basliktan TARIH okunamadi — yas olculemez'
    const yasGun = (bugun.getTime() - Date.parse(t[1] + 'T00:00:00Z')) / 86_400_000
    if (yasGun > 7) return 'ACIK karar ' + Math.floor(yasGun) + ' gundur bekliyor (esik 7)'
    return null
  }

  return 'DURUM bicimi taninmiyor: ' + d.slice(0, 80)
}

/** Bir belgeyi ölç. Saf işlev: girdi metin, çıktı ihlal listesi (fikstürle de koşulur). */
export function belgeOlc(
  belgeAdi: string,
  metin: string,
  kayitlar: Map<string, string>,
  kapiVarMi: (dosya: string) => boolean,
  bugun: Date,
): { ihlaller: Ihlal[]; kararSayisi: number; yapisalSayisi: number } {
  const basliklar = basliklariCikar(metin)
  const ihlaller: Ihlal[] = []
  const gorulen = new Map<string, number>()
  let kararSayisi = 0
  let yapisalSayisi = 0

  for (const b of basliklar) {
    if (!b.kararMi) { yapisalSayisi++; continue }
    kararSayisi++

    if (b.kimlik.length === 0) {
      ihlaller.push({ belge: belgeAdi, satir: b.satir, baslik: b.ham.slice(0, 90), sebep: 'NUMARASIZ karar basligi' })
    }
    for (const k of b.kimlik) {
      if (gorulen.has(k)) {
        ihlaller.push({
          belge: belgeAdi, satir: b.satir, baslik: b.ham.slice(0, 90),
          sebep: 'MUKERRER kimlik ' + k + ' (ilk gorulus satir ' + gorulen.get(k) + ')',
        })
      } else {
        gorulen.set(k, b.satir)
      }
    }

    const durum = durumSatiri(b.govde)
    if (!durum) {
      ihlaller.push({ belge: belgeAdi, satir: b.satir, baslik: b.ham.slice(0, 90), sebep: 'DURUM satiri YOK' })
      continue
    }
    const hata = durumDogrula(durum, b.ham, kayitlar, kapiVarMi, bugun)
    if (hata) ihlaller.push({ belge: belgeAdi, satir: b.satir, baslik: b.ham.slice(0, 90), sebep: hata })
  }

  return { ihlaller, kararSayisi, yapisalSayisi }
}

/**
 * KİP ANAHTARI = dosya adının TARİHSİZ öneki.
 *
 * ⭐NİÇİN DIŞA AÇIK VE ÖLÇÜLÜYOR (OPS uyarısı, 2026-09-08): Kararlar belgeleri her gün
 * yeni tarih damgasıyla yeniden yazılıyor ve eski kopya SİLİNİYOR
 * (`kararlar-vitrin-15a-2026-09-07.md` → `...-2026-09-08.md`). `KIP` haritası TAM DOSYA
 * ADIYLA bakıyor olsaydı, belge her yenilendiğinde kip sessizce UYARI'ya düşer ve kimse
 * farketmezdi — yani "kırmızıya aldık" sanılan kapı ölçmez hâle gelirdi. Önek türetimi
 * bunu yapısal olarak imkânsız kılar, ve bu satır artık BİR KOLLA sabitlenmiştir.
 */
export function onekCikar(ad: string): string {
  return ad.replace(/-\d{4}-\d{2}-\d{2}\.md$/, '')
}

/** Her proje için EN YENİ `kararlar-<proje>-<tarih>.md`. Eski kopyalar ölçülmez. */
function kararBelgeleri(): { ad: string; onek: string; yol: string }[] {
  let hepsi: string[] = []
  try {
    hepsi = fs.readdirSync(BELGE_DIZINI).filter((d) => /^kararlar-.+-\d{4}-\d{2}-\d{2}\.md$/.test(d))
  } catch {
    return []
  }
  const enYeni = new Map<string, string>()
  for (const ad of hepsi.sort()) {
    enYeni.set(onekCikar(ad), ad) // sirali oldugu icin son yazan EN YENI tarihtir
  }
  return [...enYeni.entries()].map(([onek, ad]) => ({ ad, onek, yol: path.join(BELGE_DIZINI, ad) }))
}

const kapiVarMiGercek = (dosya: string) => fs.existsSync(path.join(KAPI_DIZINI, path.basename(dosya)))

describe('INV-KARAR-KAYIT-1: karar basligi kendisini bir yere baglar', () => {
  it('EVREN SAGLIGI: belgeler VAR, karar basliklari VAR, dokum VAR (fail-closed)', () => {
    const belgeler = kararBelgeleri()
    expect(belgeler.length, 'karar belgesi bulunamadi — kapi BOS KUMEDE olcum yapar ve yesil gorunur').toBeGreaterThanOrEqual(5)

    const kayitlar = dokumKayitlari()
    expect(
      kayitlar.size,
      'Linear dokumu okunamadi/bos — "IS -> REC-nnn" kolu kaydin var oldugunu DOGRULAYAMAZ ve ' +
        'her REC numarasi gecerli sayilirdi.',
    ).toBeGreaterThanOrEqual(100)

    let toplamKarar = 0
    for (const b of belgeler) {
      const o = belgeOlc(b.ad, fs.readFileSync(b.yol, 'utf8'), kayitlar, kapiVarMiGercek, new Date())
      toplamKarar += o.kararSayisi
    }
    expect(
      toplamKarar,
      'karar basligi sayisi cok az — ya bicim degisti ya ayristirici bozuldu. Olculen taban: 101.',
    ).toBeGreaterThanOrEqual(50)
  })

  /**
   * ⭐AYIRT EDİCİ KOL: yapısal başlıklar karar SAYILMAZ. Bu kol olmasa "her `##` bir karardır"
   * diyen bir uygulama da geçerdi ve kapı, OPS'tan düz metin bölümlerine DURUM satırı
   * eklemesini isterdi — yani belgeye biçim dayatırdı.
   */
  it('YAPISAL basliklar karar sayilmaz (bicim dayatmasi yok)', () => {
    expect(kararBasligiMi('## Tasarım Programı Haritası (OPS, 2026-09-05 gece)')).toBe(false)
    expect(kararBasligiMi('## Belge sırası (OPS, 2026-09-05)')).toBe(false)
    expect(kararBasligiMi('## Açık işler (2026-09-05)')).toBe(false)
    // Karar OLANLAR:
    expect(kararBasligiMi('## K1 · Ticari model (2026-08-31, Recep)')).toBe(true)
    expect(kararBasligiMi('## K — Liste sayfaları MATRİS görünümü (Recep, 2026-09-04)')).toBe(true)
    expect(kararBasligiMi('## AÇIK — Ürün sayfasındaki hesap paneli (Recep, 2026-09-04)')).toBe(true)
  })

  it('ARALIK basligi kabul: K32–K35 dort kimlik tutar', () => {
    expect(kimlikler('## K32–K35 · Toplu karar (Recep)')).toEqual(['K32', 'K33', 'K34', 'K35'])
    expect(kimlikler('## K7 · Tek karar')).toEqual(['K7'])
    expect(kimlikler('## K — numarasiz')).toEqual([])
  })

  /**
   * ⭐EK KARAR `K<n>-<harf>` AYRI KİMLİKTİR — ve bu kol, kapının dünkü kusurunun
   * geri gelmesini engeller. Eski çözümleme yalnız ön rakamı alıyordu; `K23-a` ile
   * `K23-b` aynı sanılıp MÜKERRER yazılıyordu. Beş canlı başlık bu yüzden yanlış
   * yere ihlal olarak raporlandı ve ben onu "belgenin kusuru" diye bildirdim —
   * sayı doğruydu, ATIF yanlıştı.
   */
  it('EK KARAR ayri kimlik: K23-a ile K23-b mukerrer DEGIL', () => {
    expect(kimlikler('## K23-a · Ek karar (Recep)')).toEqual(['K23-a'])
    expect(kimlikler('## K23-b · Baska ek karar (Recep)')).toEqual(['K23-b'])
    expect(kimlikler('## K23 · Ana karar (Recep)')).toEqual(['K23'])
    // Üçü de FARKLI kimlik: küme boyutu 3 olmalı.
    expect(new Set([
      ...kimlikler('## K23 · x'), ...kimlikler('## K23-a · y'), ...kimlikler('## K23-b · z'),
    ]).size).toBe(3)
  })

  /**
   * ⛔KAPININ DİŞİ BURADA ÖLÇÜLÜR. Canlı belgeler bugün UYARI kipinde olduğu için kırmızı
   * davranışı fikstürle kanıtlanır; yoksa uyarı kipi incir yaprağı olurdu.
   */
  describe('KIRMIZI davranis — fiksturle kanitlanir', () => {
    const kayitlar = new Map<string, string>([['REC-100', 'In Progress'], ['REC-1', 'Canceled']])
    const kapiVar = (d: string) => d === 'var-olan-kapi.test.ts'
    const bugun = new Date('2026-09-07T00:00:00Z')
    const olc = (metin: string) => belgeOlc('fikstur.md', metin, kayitlar, kapiVar, bugun)

    it('GECERLI belge: BES DURUM bicimi de kabul edilir, ihlal 0', () => {
      const o = olc([
        '## K1 · Kural karari (2026-09-07, Recep)',
        'DURUM: KURAL → kapı: var-olan-kapi.test.ts',
        '',
        '## K2 · Is karari (2026-09-07, Recep)',
        'DURUM: İŞ → REC-100 (In Progress)',
        '',
        '## K3 · Tartisma (2026-09-07, Recep)',
        'DURUM: İSTİŞARE — karar değil',
        '',
        '## K4 · Bekleyen (2026-09-05, Recep)',
        'DURUM: AÇIK — karar bekliyor',
        '',
        // BEŞİNCİ BİÇİM: kural karara bağlanmış, kapısı henüz YAZILMAMIŞ, takibi bir kayıtta.
        '## K5 · Kapisi yazilmamis kural (2026-09-07, Recep)',
        'DURUM: KURAL → kapı YOK (REC-100 açıldı)',
        '',
        '## Yapisal bolum (OPS)',
        'DURUM satiri YOK ama karar da degil.',
      ].join('\n'))
      expect(o.ihlaller.map((i) => i.sebep), 'gecerli belgede ihlal uretildi — yanlis alarm').toEqual([])
      expect(o.kararSayisi).toBe(5)
      expect(o.yapisalSayisi, 'yapisal baslik karar sayilmis').toBe(1)
    })

    /**
     * ⛔BEŞİNCİ BİÇİM KAÇIŞ DELİĞİ OLMASIN — iki kol tam bunu ölçer. Bunlar olmasaydı
     * "kapı YOK (REC-9999)" yazmak her kararı susturmanın BEDAVA yolu olurdu; yani
     * kapı, ölçtüğünü sandığı şeyi ölçmez hâle gelirdi.
     */
    it('KAPISIZ KURAL: takip kaydi dokumde YOKSA KIRMIZI', () => {
      const o = olc(['## K1 · Karar (2026-09-07, Recep)', 'DURUM: KURAL → kapı YOK (REC-9999 açıldı)'].join('\n'))
      expect(o.ihlaller.map((i) => i.sebep).join(' ')).toContain('takip kaydi dokumde YOK')
    })

    it('KAPISIZ KURAL: takip kaydi IPTAL ise KIRMIZI (kapi da kayit da yok)', () => {
      const o = olc(['## K1 · Karar (2026-09-07, Recep)', 'DURUM: KURAL → kapı YOK (REC-1, Canceled)'].join('\n'))
      expect(o.ihlaller.map((i) => i.sebep).join(' ')).toContain('takip kaydi IPTAL')
    })

    it('SABOTAJ 1: DURUM satiri silinirse KIRMIZI', () => {
      const o = olc(['## K1 · Karar (2026-09-07, Recep)', 'Metin var, DURUM yok.'].join('\n'))
      expect(o.ihlaller.map((i) => i.sebep)).toEqual(['DURUM satiri YOK'])
    })

    it('SABOTAJ 2: var olmayan kapi adi KIRMIZI (karari koruyormus gibi gorunmesin)', () => {
      const o = olc(['## K1 · Karar (2026-09-07, Recep)', 'DURUM: KURAL → kapı: hayali-kapi.test.ts'].join('\n'))
      expect(o.ihlaller.length).toBe(1)
      expect(o.ihlaller[0].sebep).toContain('KURAL kapisi YOK')
    })

    it('SABOTAJ 3: ayni kimlik iki kez KIRMIZI', () => {
      const o = olc([
        '## K18 · Birinci (2026-09-07, Recep)',
        'DURUM: İSTİŞARE — karar değil',
        '## K18 · Ikinci, yanlislikla (2026-09-07, Recep)',
        'DURUM: İSTİŞARE — karar değil',
      ].join('\n'))
      expect(o.ihlaller.length).toBe(1)
      expect(o.ihlaller[0].sebep).toContain('MUKERRER kimlik K18')
    })

    // ⭐AYIRT EDİCİ ÇİFT: aynı EK kimlik iki kez de kırmızı olmalı. Bu kol olmasaydı
    // "ek harf ayrı kimliktir" düzeltmesi, ek kararları TOPTAN denetimsiz bırakabilirdi.
    it('SABOTAJ 3b: ayni EK kimlik (K23-a) iki kez KIRMIZI', () => {
      const o = olc([
        '## K23-a · Birinci ek (2026-09-07, Recep)',
        'DURUM: İSTİŞARE — karar değil',
        '## K23-a · Ayni ek, yanlislikla (2026-09-07, Recep)',
        'DURUM: İSTİŞARE — karar değil',
      ].join('\n'))
      expect(o.ihlaller.length).toBe(1)
      expect(o.ihlaller[0].sebep).toContain('MUKERRER kimlik K23-a')
    })

    it('KIP ANAHTARI tarihten bagimsiz: belge her gun yenilenince kip DUSMEZ', () => {
      expect(onekCikar('kararlar-vitrin-15a-2026-09-07.md')).toBe('kararlar-vitrin-15a')
      expect(onekCikar('kararlar-vitrin-15a-2026-09-08.md')).toBe('kararlar-vitrin-15a')
      // Tarih taşımayan ad olduğu gibi kalır (yanlış kırpma yapmaz).
      expect(onekCikar('kararlar-belge.md')).toBe('kararlar-belge.md')
    })

    it('NUMARASIZ karar basligi KIRMIZI', () => {
      const o = olc(['## K — Numarasiz karar (2026-09-07, Recep)', 'DURUM: İSTİŞARE — karar değil'].join('\n'))
      expect(o.ihlaller.map((i) => i.sebep)).toEqual(['NUMARASIZ karar basligi'])
    })

    it('DOKUMDE OLMAYAN REC KIRMIZI', () => {
      const o = olc(['## K1 · Karar (2026-09-07, Recep)', 'DURUM: İŞ → REC-9999 (Todo)'].join('\n'))
      expect(o.ihlaller[0].sebep).toContain('dokumde YOK')
    })

    it('IPTAL EDILMIS kayda baglanan karar KIRMIZI (karar sahipsiz kalir)', () => {
      const o = olc(['## K1 · Karar (2026-09-07, Recep)', 'DURUM: İŞ → REC-1 (Canceled)'].join('\n'))
      expect(o.ihlaller[0].sebep).toContain('IPTAL')
    })

    it('ACIK karar 7 gunden eskiyse KIRMIZI', () => {
      const taze = olc(['## K1 · Karar (2026-09-05, Recep)', 'DURUM: AÇIK — karar bekliyor'].join('\n'))
      expect(taze.ihlaller, '2 gunluk ACIK karar kirmizi verdi — esik yanlis').toEqual([])
      const bayat = olc(['## K1 · Karar (2026-08-20, Recep)', 'DURUM: AÇIK — karar bekliyor'].join('\n'))
      expect(bayat.ihlaller[0].sebep).toContain('gundur bekliyor')
    })

    it('TANINMAYAN DURUM bicimi KIRMIZI (serbest metin gecmez)', () => {
      const o = olc(['## K1 · Karar (2026-09-07, Recep)', 'DURUM: hallederiz'].join('\n'))
      expect(o.ihlaller[0].sebep).toContain('bicimi taninmiyor')
    })
  })

  /**
   * CANLI BELGELER — kip haritasına göre. KIRMIZI kipteki dosya ihlal taşırsa kol DÜŞER;
   * UYARI kipindeki dosya yalnız RAPOR eder.
   * ⚠Rapor bir kapı değildir ve öyleymiş gibi yazılmıyor: sayı ekrana basılır, kol geçer.
   * Kapının dişi yukarıdaki fikstür kollarındadır.
   */
  it('CANLI: KIRMIZI kipteki belgeler ihlalsiz; UYARI kipindekiler RAPOR edilir', () => {
    const kayitlar = dokumKayitlari()
    const bugun = new Date()
    const kirmiziIhlaller: Ihlal[] = []
    const satirlar: string[] = []

    for (const b of kararBelgeleri()) {
      const o = belgeOlc(b.ad, fs.readFileSync(b.yol, 'utf8'), kayitlar, kapiVarMiGercek, bugun)
      const kip = KIP[b.onek] || 'UYARI'
      satirlar.push(
        '  ' + kip.padEnd(7) + ' ' + b.ad + ' — karar ' + o.kararSayisi +
        ', yapisal ' + o.yapisalSayisi + ', ihlal ' + o.ihlaller.length,
      )
      if (kip === 'KIRMIZI') kirmiziIhlaller.push(...o.ihlaller)
    }
    console.warn('[INV-KARAR-KAYIT-1] kip haritasi ve olculen:\n' + satirlar.join('\n'))

    expect(
      kirmiziIhlaller.map((i) => i.belge + ':' + i.satir + ' ' + i.sebep),
      'KIRMIZI kipteki belgede ihlal var. Her karar basligi ya bir KAPIYA ya bir REC kaydina ' +
        'baglanir; baglanmayan karar, yazildigi an bitmis SAYILIR ve gun icinde yeniden tartisilir.',
    ).toEqual([])
  })
})
