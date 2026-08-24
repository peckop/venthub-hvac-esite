import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-NOTIFY-1 / INV-NOTIFY-2 — bildirim cetveli ile GERÇEK yüzey arasındaki bağ.
 *
 * NİÇİN BU İKİ KAPI, NİÇİN MÜKERRERLİK KAPISI DEĞİL:
 * Bugün ölçüldü ki dört bildirim ucundan üçünde mükerrerlik koruması YOK
 * (docs/standards/notification-standard.md §B7). "Yeni kapı mevcut ihlalle açılmaz"
 * kuralı gereği o kapı BU sürümde yazılmıyor — kırmızı doğarsa herkesin kapısı kırmızı
 * olur ve kapı bilgi değil gürültü üretir. Bu iki kapı ise bugün YEŞİL ve tam da bugünkü
 * kusurun DOĞMASINI sağlayan boşluğu kapatıyor:
 *
 *   order-confirmation gerçekten VARDI ve gerçekten e-posta gönderiyordu; ama hiçbir
 *   cetvelde yazılı olmadığı için "ödeme onay e-postası yok" diye yanlış hüküm kuruldu
 *   ve neredeyse bir iş emri açılıyordu. Kusur kodda değil, KOD ile CETVEL arasındaki
 *   boşluktaydı. INV-NOTIFY-1 tam o boşluğu ölçer.
 */

const KOK = process.cwd()
const CETVEL = join(KOK, 'docs/standards/notification-standard.md')
const UCLAR_KOK = join(KOK, 'supabase/functions')
const SUPABASE_KOK = join(KOK, 'supabase')

function cetvelMetni(): string {
  return readFileSync(CETVEL, 'utf8')
}

/** Her uç dizininin `index.ts` metni: ad → kaynak. */
function ucKaynaklari(): Map<string, string> {
  const harita = new Map<string, string>()
  for (const ad of readdirSync(UCLAR_KOK)) {
    const dizin = join(UCLAR_KOK, ad)
    if (!statSync(dizin).isDirectory()) continue
    const giris = join(dizin, 'index.ts')
    if (!existsSync(giris)) continue
    harita.set(ad, readFileSync(giris, 'utf8'))
  }
  return harita
}

/** api.resend.com'a gönderim yapan uç dizinlerinin adları. */
function resendGonderenUclar(): string[] {
  return [...ucKaynaklari().entries()]
    .filter(([, kaynak]) => kaynak.includes('api.resend.com'))
    .map(([ad]) => ad)
    .sort()
}

/**
 * DEVREDEN UÇ: kendisi Resend'i çağırmaz ama `functions/v1/<ad>` ile — doğrudan ya da
 * ZİNCİRLEME — bir gönderici ucu tetikler.
 *
 * NİÇİN VAR (2026-08-23; EDGE getirdi, I18N ölçtü): INV-NOTIFY-1'in ilk sürümü kapsamı
 * SAĞLAYICI ADINA (`api.resend.com`) bağlıyordu. Bir uç gönderimi başka bir uca devrederse
 * o ölçüye GÖRÜNMEZ olur — kapı haklı olarak susar, ama cetvel "hepsi burada" der ve
 * değildir. Ölçüm: 6 doğrudan gönderici + 5 devreden; yani sistemin yarısı ölçünün
 * dışındaydı. Kapsamı ADA (sağlayıcı) değil DAVRANIŞA (bir bildirim akışını başlatıyor mu)
 * bağlamak gerekiyordu.
 *
 * NİÇİN GEÇİŞLİ, tek adım DEĞİL: ölçüm sırasında zincir bulundu —
 *   `iyzico-callback` → `stock-alert` → `notification-service` (gönderici)
 * `stock-alert` hem devreden hem hedef. Tek adıma bakan bir kural, YALNIZCA `stock-alert`
 * üzerinden gönderen bir ucu kaçırır ve yine "hepsi burada" derdi. Kapsamı davranışın BİR
 * ADIMINA bağlamak, davranışa bağlamak değildir.
 */
function devredenUclar(): string[] {
  const kaynaklar = ucKaynaklari()
  const gonderenler = resendGonderenUclar()
  const ulasan = new Set(gonderenler)
  // Sabit nokta: küme büyümeyi durdurana kadar tekrarla (zincir derinliği sınırsız).
  let degisti = true
  while (degisti) {
    degisti = false
    for (const [ad, kaynak] of kaynaklar) {
      if (ulasan.has(ad)) continue
      for (const hedef of ulasan) {
        if (kaynak.includes(`functions/v1/${hedef}`)) {
          ulasan.add(ad)
          degisti = true
          break
        }
      }
    }
  }
  return [...ulasan].filter((ad) => !gonderenler.includes(ad)).sort()
}

/**
 * Hedef adı DEĞİŞKENDEN üretilen `functions/v1` çağrıları.
 *
 * Bugün ölçüldü: 27 ucun tamamında hedef adı SABİT metin (`${supabaseUrl}/functions/v1/x`) —
 * birleşen kısım yalnız önek. Yani yukarıdaki tarama bugün TAM kapsıyor. Ama hedef adı
 * dinamik yazılırsa tarama SESSİZCE kör kalır. Körlüğü sessiz yaşamak yerine ALARM
 * yapıyoruz: böyle bir çağrı doğduğu gün bu kapı kırmızı olur ve kural yeniden düşünülür.
 */
function dinamikHedefliCagrilar(): string[] {
  const bulunan: string[] = []
  for (const [ad, kaynak] of ucKaynaklari()) {
    if (/functions\/v1\/(?:\$\{|['"`]\s*\+)/.test(kaynak)) bulunan.push(ad)
  }
  return bulunan.sort()
}

/**
 * Cetvelin BİR BÖLÜMÜNÜ döndürür (başlıktan bir sonraki aynı/üst düzey başlığa kadar).
 *
 * NİÇİN VAR — 2026-08-23'te SABOTAJ YAKALADI, kapı SAHTE YEŞİL verdi:
 * İlk sürüm "ad cetvelde geçiyor mu" diye BELGENİN TAMAMINA bakıyordu. `order-paid-webhook`
 * satırını §B2.1.b tablosundan sildim ve kapı YEŞİL geçti — çünkü adı §B8.1'in gerekçe
 * metninde de yazılıydı. Yani kapı "envanterde kayıtlı mı" değil "bu kelime dosyada var mı"
 * ölçüyordu; envanter boşalsa bile bir anma cümlesi onu yeşil tutardı.
 * Ders (bugün filo genelinde üç kez çıktı): kapsamı ADA değil, adın BULUNMASI GEREKEN YERE
 * bağla. Kapının kendi sabotajı olmasaydı bu kusur kapının içinde yaşardı.
 */
function cetvelBolumu(baslikDeseni: RegExp): string {
  const metin = cetvelMetni()
  const parcalar = metin.split(baslikDeseni)
  if (parcalar.length < 2) return ''
  // Bölüm, bir sonraki `#`-başlığında biter (aynı ya da üst düzey).
  return parcalar[1].split(/^#{1,4}\s/m)[0]
}

/**
 * `venthub_orders_status_check` sözlüğünü DEPODAKİ DDL'den çıkarır.
 *
 * Otorite aslında canlı DB'dir (pg_constraint) ve test canlı DB'ye bakamaz. Bu yüzden
 * burada depodaki DDL metni kullanılıyor VE bir kanarya ile korunuyor: hiç tanım
 * bulunamazsa ya da altıdan az değer çıkarsa kapı kırmızı olur. Yani "bulamadım" sessizce
 * "ihlal yok" diye okunamaz.
 */
function statusSozlugu(): string[] {
  const dosyalar: string[] = []
  const gez = (dizin: string) => {
    for (const ad of readdirSync(dizin)) {
      const yol = join(dizin, ad)
      const st = statSync(yol)
      if (st.isDirectory()) {
        if (ad === 'node_modules' || ad.startsWith('.')) continue
        gez(yol)
      } else if (ad.endsWith('.sql')) {
        dosyalar.push(yol)
      }
    }
  }
  gez(SUPABASE_KOK)

  // NOT: `s` (dotAll) bayragi tsconfig hedefinde YOK (TS1501). Ayni isi [\s\S] ile
  // yapiyoruz — bayrakla gelen kolayligi degil, DAVRANISI koruyoruz.
  const desen = /venthub_orders_status_check\s+CHECK\s*\(\(([\s\S]*?)\)\)/
  for (const yol of dosyalar) {
    const m = desen.exec(readFileSync(yol, 'utf8'))
    if (!m) continue
    const degerler = [...m[1].matchAll(/'([a-z_]+)'::text/g)].map((x) => x[1])
    if (degerler.length > 0) return [...new Set(degerler)].sort()
  }
  return []
}

/** §B2.3 tablosundaki `status` sütunundan okunan durum adları. */
function cetveldekiDurumlar(): string[] {
  const metin = cetvelMetni()
  const bolum = metin.split(/^###\s+B2\.3\s/m)[1]
  if (!bolum) return []
  const tablo = bolum.split(/^##\s/m)[0]
  const adlar = [...tablo.matchAll(/^\|\s*`([a-z_]+)`\s*\|/gm)].map((m) => m[1])
  return [...new Set(adlar)].sort()
}

describe('INV-NOTIFY-1 · bildirim envanteri cetvelde tam', () => {
  it('e-posta gonderen HER uc, cetvelin B2.1 tablosunda adiyla gecmeli', () => {
    const uclar = resendGonderenUclar()

    // KAPSAM KANARYASI: tarama gercekten dosya gordu mu? Sifir uc bulmak "ihlal yok"
    // degil, "hicbir yere bakmadim" demektir.
    expect(uclar.length).toBeGreaterThan(0)

    // KAPSAM BELGENIN TAMAMI DEGIL, §B2.1 TABLOSU. "Adi bir yerde geciyor" yeterli
    // sayilirsa bir anma cumlesi envanteri yesil tutar (sabotajla olculdu, bkz. cetvelBolumu).
    const bolum = cetvelBolumu(/^###\s+B2\.1\s/m)
    expect(bolum.length, '§B2.1 bolumu cetvelde BULUNAMADI — baslik degismis olabilir.').toBeGreaterThan(0)
    const eksik = uclar.filter((ad) => !bolum.includes(`\`${ad}\``))

    expect(
      eksik,
      `Bu uclar e-posta gonderiyor ama docs/standards/notification-standard.md §B2.1 ` +
        `tablosunda gecmiyor: ${eksik.join(', ')}. Yeni bir bildirim ucu eklediyseniz once ` +
        `cetvelin B2.1 tablosuna satir ekleyin — "bildirimlerimiz neler" sorusunun tek ` +
        `cevabi orasidir.`,
    ).toEqual([])
  })

  it('bildirim akisini DEVREDEN her uc da cetvelde adiyla gecmeli', () => {
    const devreden = devredenUclar()

    // KAPSAM KANARYASI — iki tarafli. Bugun olculen sayi 5; sifire duserse tarama
    // bozulmustur (zincir hesabi coktu ya da cagri bicimi degisti), "devreden kalmadi"
    // DEGIL. Sifiri sessizce yesil saymak, bu kapinin kapatmak icin dogdugu kusurun ta
    // kendisi olurdu.
    expect(
      devreden.length,
      'Devreden uc SIFIR olcusuldu. Bugun 5 taneydi; tarama bozulmus olabilir ' +
        '(gecisli kapanis ya da functions/v1 cagri bicimi). "Kalmadi" diye okuma.',
    ).toBeGreaterThan(0)

    // Kapsam: §B2.1.b tablosu. Belgenin tamamina bakmak SAHTE YESIL uretir — olculdu.
    const bolum = cetvelBolumu(/^####\s+B2\.1\.b\s/m)
    expect(
      bolum.length,
      '§B2.1.b (DEVREDEN UCLAR) bolumu cetvelde BULUNAMADI. Kural yaziliysa basligi ' +
        'degismis, yazili degilse once cetvele yazilmali — kapi kuralsiz olcemez.',
    ).toBeGreaterThan(0)
    const eksik = devreden.filter((ad) => !bolum.includes(`\`${ad}\``))

    expect(
      eksik,
      `Bu uclar e-postayi KENDILERI gondermiyor ama functions/v1 ile (dogrudan ya da ` +
        `zincirleme) bir gonderici ucu tetikliyor; yani kullanicinin gozunden bildirimi ` +
        `BASLATAN sey onlar. Cetvelde hic gecmiyorlar: ${eksik.join(', ')}. ` +
        `docs/standards/notification-standard.md §B2.1 tablosuna DEVREDEN UC olarak ` +
        `satir ekleyin. Kapsam saglayici adina (api.resend.com) degil DAVRANISA baglidir.`,
    ).toEqual([])
  })

  it('functions/v1 hedefi DINAMIK uretilmiyor (uretilirse tarama korlesir)', () => {
    const dinamik = dinamikHedefliCagrilar()
    expect(
      dinamik,
      `Bu uclarda functions/v1 hedefi degiskenden uretiliyor: ${dinamik.join(', ')}. ` +
        `Devreden-uc taramasi hedef adini KAYNAK METINDEN okur; dinamik ad onu SESSIZCE ` +
        `kor eder ve envanter yine "hepsi burada" der. Ya hedefi sabit metin yazin, ya da ` +
        `bu kapinin kuralini yeniden dusunun — korlugu sessizce yasamak secenek degil.`,
    ).toEqual([])
  })

  it('cetvel, olcum tabanini ve dis kaynagini yazmis olmali', () => {
    const metin = cetvelMetni()
    expect(metin).toContain('KAYNAK/CETVEL')
    expect(metin).toContain('ÇELİŞEN-MEVCUT')
    expect(metin).toMatch(/ÖLÇÜLEMEDİ/)
  })
})

describe('INV-NOTIFY-2 · siparis durumu kapsam tablosu tam', () => {
  it('status CHECK sozlugundeki HER deger B2.3 tablosunda bir satira sahip olmali', () => {
    const dbDurumlari = statusSozlugu()

    // KANARYA: DDL bulunamadiysa ya da alti degerden az cikardiysak, karsilastirma
    // anlamsizdir. Bos kume ile bos kumeyi karsilastirip yesil kalmayi engeller.
    expect(
      dbDurumlari.length,
      'venthub_orders_status_check tanimi supabase/ altinda bulunamadi ya da cok az ' +
        'deger cikardi — kapi olcemedigi icin kirmizi. Ayiklayiciyi onarin.',
    ).toBeGreaterThanOrEqual(6)

    const cetvelDurumlari = cetveldekiDurumlar()
    const eksik = dbDurumlari.filter((d) => !cetvelDurumlari.includes(d))

    expect(
      eksik,
      `Bu siparis durumlari icin bildirim karari cetvelde YAZILI DEGIL: ${eksik.join(', ')}. ` +
        `"Bildirim yok" gecerli bir cevaptir; satirin HIC olmamasi degil — cunku o zaman ` +
        `"karar verilmedi" ile "bildirim istemiyoruz" ayirt edilemez.`,
    ).toEqual([])
  })
})
