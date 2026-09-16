import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-SEMA-GRAF-1 — şema graf üreticisinin SÖZLEŞMESİ ölçülür.
 *
 * ══════════════════════════════════════════════════════════════════════════════
 * NİÇİN VAR
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Recep'in tasarım sorusu (2026-09-16): *"yama gibi mi olacak yoksa AST gibi mi olacak…
 * bir ürün geliştirir gibi geliştirip bir başkası da kursaydı sağlıklı çalışır mantığı mı
 * olacak?"* Bu kapı o sorunun **makine karşılığıdır**: aşağıdaki kollar "yama değil" ve
 * "başkası kursa çalışır" iddialarını tek tek ölçer.
 *
 * ⛔BU KAPI GRAF ÜRETMEZ ve veritabanına BAĞLANMAZ. Ölçtüğü şey betiğin SÖZLEŞMESİ:
 * sır davranışı, TLS kararı, taşınabilirlik, çıkış kodları, çıktı biçimi. Davranış ölçümü
 * (gerçek graf üretimi) canlı/yerel bir veritabanı ister ve o AYRI bir koşumdur — bu ayrımı
 * yazmak zorundayım, yoksa "kapı yeşil" cümlesi "graf doğru" gibi okunur.
 *
 * ⭐TEK DAVRANIŞ KOLU VAR ve o da ağ İSTEMEZ: sır yokken betiğin ne yaptığı gerçekten
 * koşturulur (atlanmış iş yeşil sayılmasın).
 *
 * Cetvel: `docs/audits/sema-graf-uretici-2026-09-16.md` · `denetim-izi-standard.md`
 * (sır ölçme kalıbı) · `arac-envanteri-standard.md` (AXIOM 1).
 */

const KOK = path.resolve(__dirname, '..', '..', '..')
const BETIK = path.join(KOK, 'scripts', 'db', 'sema-graf-uret.mjs')

const kaynak = (): string => fs.readFileSync(BETIK, 'utf8')

/**
 * Yorum satırlarını atan KOD görünümü.
 *
 * ⭐NİÇİN GEREKLİ — bu kapı ilk koşumunda kendi kusurunu gösterdi: "yasak kalıp" arayan bir
 * kol, o kalıbın **yasak olduğunu anlatan yorumun** üstünde de tetikleniyor. Yani kapı kendi
 * belgesini ihlal sanıyor. Sınıf bu depoda ölçülmüş: `protect-config` kancası da yorum
 * içindeki tip-kaçış kalıplarını bloklar ve bu dosyayı yazarken **beni de bir kez durdurdu.**
 * Ölçülen şey KODDA olan kalıptır, anlatılan kalıp değil.
 */
const kodu = (): string =>
  kaynak()
    .split('\n')
    .filter((l) => {
      const t = l.trim()
      return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*')
    })
    .join('\n')

describe('INV-SEMA-GRAF-1 · sema graf ureticisi sozlesmesi', () => {
  it('BETIK VAR (yoklugu kapinin sessizce gecmesine sebep olmasin)', () => {
    expect(fs.existsSync(BETIK), `betik YOK: ${BETIK}`).toBe(true)
    expect(kaynak().length, 'betik bos').toBeGreaterThan(1000)
  })

  it('⭐SIR DEGERI BASILMAZ — yasak kalip yok, varlik UZUNLUKLA olculuyor', () => {
    const s = kaynak()
    // 2026-09-04'te bir betik prod baglanti dizesini log'a dusurdu: degeri varsayilanla
    // birlikte genisleten kabuk kalibi, deger DOLUYSA onu EKRANA yazar. O kalip YASAK.
    // ⚠KODDA aranir, YORUMDA aranmaz — yoksa kapi kendi belgesini ihlal sanar (olculdu).
    expect(kodu(), 'yasak deger-genisletme kalibi KODDA var').not.toMatch(/\$\{[A-Z_]+:-/)
    expect(s, 'sir varligi uzunlukla olculmuyor').toMatch(/\.length\} karakter/)
    expect(s, '"deger BASILMADI" ibaresi yok').toContain('BASILMADI')
  })

  it('⭐sslmode SOKULUYOR (INV-DENETIM-IZI-1 kalibi — sekiz betik bu bosluga dogdu)', () => {
    const s = kaynak()
    expect(s, 'sslmode sokme kalibi yok').toMatch(/sslmode=\[\^&\]\*/)
    expect(s, 'sslmode kaldirildi bildirimi yok').toMatch(/sslmode kaldirildi/i)
  })

  it('⭐TLS SESSIZCE DUSURULMEZ — SSL hatasinda "tekrar dene" yolu YOK', () => {
    const s = kaynak()
    // Kolay ama yanlis cozum: "SSL hatasi alirsan SSL'siz tekrar dene". Uzak sunucu TLS'i
    // dusurdugunde de ayni yola girer ve sifreleme SESSIZCE kaybolur.
    expect(s, 'sessiz SSL geri dusme izi (ssl:false ile ikinci deneme)').not.toMatch(
      /catch[\s\S]{0,200}ssl:\s*false/,
    )
    expect(s, 'uzak hedefte sertifika zorunlulugu yazili degil').toMatch(
      /kok sertifika (ZORUNLU|YOK)/i,
    )
    expect(s, 'yerel/uzak ayrimi yok').toMatch(/localhost\|127\\\.0\\\.0\\\.1/)
  })

  it('⭐TASINABILIR — hicbir VentHub adi GOMULU DEGIL (Recep sinavi: baskasi kursa calisir mi)', () => {
    const s = kaynak()
    // Yorumlarda proje adi gecebilir; olculen sey KODDA gomulu tablo/sema adi.
    const kodSatirlari = s
      .split('\n')
      .filter((l) => {
        const t = l.trim()
        return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*')
      })
      .join('\n')
    for (const yasak of ['venthub_', 'products', 'categories', 'iyzico']) {
      expect(kodSatirlari, `kodda gomulu proje adi: ${yasak}`).not.toContain(yasak)
    }
    // Sema listesi DISARIDAN gelmeli.
    expect(s, 'sema listesi parametre degil').toMatch(/--semalar|arg\('semalar'/)
  })

  it('KIMLIK SIZDIRAN MUTLAK YOL YOK (depo PUBLIC)', () => {
    const s = kaynak()
    expect(s, 'kimlik sizdiran yol var').not.toMatch(/[Cc]:[\\/]Users[\\/]/)
    expect(s, 'POSIX kimlik yolu var').not.toMatch(/\/(home|Users)\/[a-z]/)
  })

  it('⭐CIKIS KODU SOZLESMESI BETIGIN KENDI BASLIGINDA YAZILI (0/1/2 ayri anlam)', () => {
    const s = kaynak()
    // "Cikis kodu kanit degil" dersinin TERSI: sozlesmesi YAZILI bir betik icin kod bir
    // CEVAPTIR. O yuzden sozlesme dosyanin kendisinde durmak ZORUNDA.
    // ⚠TÜRKÇE HARF: desen `uretildi` yazılırsa `üretildi` EŞLEŞMEZ ve kapı yanlış kırmızı
    // verir (ilk koşumda tam bunu yaptı). Karakter sınıfı ikisini de kabul eder.
    expect(s, 'cikis 0 sozlesmesi yazili degil').toMatch(/0 = [üu]retildi/i)
    expect(s, 'cikis 1 sozlesmesi yazili degil').toMatch(/1 = [üu]retildi AMA/i)
    expect(s, 'cikis 2 sozlesmesi yazili degil').toMatch(/2 = [ÖO]L[ÇC]EMED[İI]/i)
    // Uc kod GERCEKTEN kullanilmali; yazip kullanmamak sozlesmeyi suse cevirir.
    expect(s).toMatch(/process\.exit\(1\)/)
    expect(s).toMatch(/process\.exit\(2\)/)
  })

  it('⭐DOGRULAMA KOLU VAR — uretilen sayi ile katalog sayisi KARSILASTIRILIYOR', () => {
    const s = kaynak()
    expect(s, 'tablo paritesi olculmuyor').toMatch(/tablo sayisi TUTMADI/)
    expect(s, 'fk paritesi olculmuyor').toMatch(/fk sayisi TUTMADI/)
    // Bos graf bir cevap DEGILDIR.
    expect(s, 'bos graf reddi yok').toMatch(/HIC tablo yok/)
  })

  it('⭐KAPSAM DISI ILISKI GIZLENMIYOR — sayisi ayrica RAPORLANIYOR', () => {
    const s = kaynak()
    // Bu kol bir HATADAN sonra yazildi: ilk kosumda uretici 13 kenar verdi, dogrulama 19
    // dedi. Iki sayi FARKLI EVREN olcuyordu (hedefi baska semada olan anahtarlar). Dogrusu
    // paritenin AYNI evrende olcumu + kapsam disinin ADIYLA raporlanmasi.
    expect(s, 'kapsam disi fk sayaci yok').toMatch(/kapsam_disi_fk|kapsamDisiFk/)
    expect(s, 'kapsam disi cizilmedigi soylenmiyor').toMatch(/cizilmedi/)
  })

  it('CIKTI graphify BICIMINDE (node-link: nodes + links) — kendi kisayolumuzu uydurmuyoruz', () => {
    const s = kaynak()
    expect(s, 'nodes alani yok').toMatch(/\bnodes,/)
    expect(s, 'links alani yok (graphify edges DEGIL links kullaniyor)').toMatch(/\blinks,/)
    expect(s, 'directed/multigraph alanlari yok').toMatch(/multigraph:/)
    // Dugum kimlikleri KENDI AD ALANINDA: graphify kendi sartnamesinde ghost-duplicate
    // uyarisi veriyor; ayni varlik icin farkli kimlik uretmek orphan dogurur.
    expect(s, 'db_ ad alani oneki yok').toMatch(/`db_\$\{/)
  })

  it('⭐DAVRANIS — SIR YOKKEN betik cikis 0 verir AMA "atlanmis is yesil degildir" yazar', () => {
    const r = spawnSync(process.execPath, [BETIK, '--db-url-env', 'INV_SEMA_GRAF_YOK_DEGISKEN'], {
      encoding: 'utf8',
      cwd: KOK,
      timeout: 60_000,
    })
    expect(r.status, `beklenen cikis 0, gelen ${r.status}: ${r.stderr}`).toBe(0)
    const cikti = (r.stdout ?? '') + (r.stderr ?? '')
    expect(cikti, 'OLCULEMEDI yazilmamis').toMatch(/OLCULEMEDI/)
    expect(cikti, 'atlanmis is yesil degildir uyarisi yok').toMatch(/ATLANMIS IS YESIL DEGILDIR/)
    // Degisken adi yazilir, DEGER yazilmaz — ad zaten sir degildir, deger sirdir.
    expect(cikti).toContain('INV_SEMA_GRAF_YOK_DEGISKEN')
  })

  it('ARAC ENVANTERINDE ILAN EDILMIS (AXIOM 1: envantere yazilmayan arac YOKTUR)', () => {
    const envanter = path.join(KOK, 'docs', 'audits', 'arac-envanteri-2026-09-07.md')
    expect(fs.existsSync(envanter), `envanter YOK: ${envanter}`).toBe(true)
    expect(
      fs.readFileSync(envanter, 'utf8'),
      'betik envanterde ilan edilmemis — INV-ARAC-1 CI da kirmizi verir',
    ).toContain('sema-graf-uret')
  })
})
