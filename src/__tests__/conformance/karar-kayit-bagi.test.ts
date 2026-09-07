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
  // 'kararlar-vitrin-15a': 'KIRMIZI',  // OPS doldurmasi master'a ininde ACILACAK (REC-274)
}

type Baslik = { ham: string; satir: number; kararMi: boolean; nolar: number[]; govde: string }

/** Karar başlığı mı? `K1 ·` / `K — ` / `K32–K35` / `AÇIK — ` evet; düz metin başlığı hayır. */
function kararBasligiMi(baslik: string): boolean {
  return /^##\s+(K\d|K\s*[·—–-]|AÇIK\s*[·—–-])/.test(baslik)
}

/** Başlıktaki numara(lar). `K32–K35` aralığı tek başlıkta kabul (kayıt hükmü). */
function numaralar(baslik: string): number[] {
  const m = /^##\s+K(\d+)(?:\s*[–—-]\s*K?(\d+))?/.exec(baslik)
  if (!m) return []
  const bas = Number(m[1])
  const son = m[2] ? Number(m[2]) : bas
  if (!Number.isFinite(bas) || !Number.isFinite(son) || son < bas || son - bas > 50) return [bas]
  const out: number[] = []
  for (let i = bas; i <= son; i++) out.push(i)
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
      nolar: numaralar(satirlar[i]),
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
 * DURUM değerini doğrula. Dört biçim (kayıt hükmü):
 *   `KURAL → kapı: <dosya>`  · dosya `src/__tests__/conformance/` altında VAR olmalı
 *   `İŞ → REC-nnn (<state>)` · kayıt dökümde var olmalı, Canceled ise KIRMIZI
 *   `İSTİŞARE — karar değil`
 *   `AÇIK — karar bekliyor`  · başlıktaki tarih 7 günden eskiyse KIRMIZI
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
  const gorulen = new Map<number, number>()
  let kararSayisi = 0
  let yapisalSayisi = 0

  for (const b of basliklar) {
    if (!b.kararMi) { yapisalSayisi++; continue }
    kararSayisi++

    if (b.nolar.length === 0) {
      ihlaller.push({ belge: belgeAdi, satir: b.satir, baslik: b.ham.slice(0, 90), sebep: 'NUMARASIZ karar basligi' })
    }
    for (const n of b.nolar) {
      if (gorulen.has(n)) {
        ihlaller.push({
          belge: belgeAdi, satir: b.satir, baslik: b.ham.slice(0, 90),
          sebep: 'MUKERRER numara K' + n + ' (ilk gorulus satir ' + gorulen.get(n) + ')',
        })
      } else {
        gorulen.set(n, b.satir)
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
    const onek = ad.replace(/-\d{4}-\d{2}-\d{2}\.md$/, '')
    enYeni.set(onek, ad) // sirali oldugu icin son yazan EN YENI tarihtir
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

  it('ARALIK basligi kabul: K32–K35 dort numara tutar', () => {
    expect(numaralar('## K32–K35 · Toplu karar (Recep)')).toEqual([32, 33, 34, 35])
    expect(numaralar('## K7 · Tek karar')).toEqual([7])
    expect(numaralar('## K — numarasiz')).toEqual([])
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

    it('GECERLI belge: dort DURUM bicimi de kabul edilir, ihlal 0', () => {
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
        '## Yapisal bolum (OPS)',
        'DURUM satiri YOK ama karar da degil.',
      ].join('\n'))
      expect(o.ihlaller.map((i) => i.sebep), 'gecerli belgede ihlal uretildi — yanlis alarm').toEqual([])
      expect(o.kararSayisi).toBe(4)
      expect(o.yapisalSayisi, 'yapisal baslik karar sayilmis').toBe(1)
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

    it('SABOTAJ 3: ayni numara iki kez KIRMIZI', () => {
      const o = olc([
        '## K18 · Birinci (2026-09-07, Recep)',
        'DURUM: İSTİŞARE — karar değil',
        '## K18 · Ikinci, yanlislikla (2026-09-07, Recep)',
        'DURUM: İSTİŞARE — karar değil',
      ].join('\n'))
      expect(o.ihlaller.length).toBe(1)
      expect(o.ihlaller[0].sebep).toContain('MUKERRER numara K18')
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
