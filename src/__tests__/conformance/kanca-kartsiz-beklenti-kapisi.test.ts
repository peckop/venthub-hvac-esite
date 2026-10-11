import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * INV-KARTSIZ-KAPI-1..8 · `kartsiz-beklenti-kapisi` Stop kancasının KARARI ölçülür (kart 0c0232db).
 *
 * Recep 10-04: "bana onaya gelen bişey var ise ve bunun kartı yoksa bunun tespitini de yapıp yakalanması
 * lazım ... bu sefer sistem kendisini düzeltir". Kanca Stop'u `exit 2` ile bloklar: yanlış pozitif turu
 * döngüye sokar, yanlış negatif kartsız isteği geçirir (Recep'ten beklenen şey hiçbir yüzeyde görünmez).
 *
 * Kanban gerçek panodan okunmaz: `KARTSIZ_KAPI_KANBAN` ile sahte betik, `KARTSIZ_KAPI_DURUM_DIZINI` ile
 * geçici durum klasörü verilir. Transkript sentetik `.jsonl`'dir; gerçek oturum kaydına dokunulmaz.
 */

const KANCA = path.resolve(__dirname, '../../../.claude/hooks/kartsiz-beklenti-kapisi.cjs')
const require_ = createRequire(import.meta.url)

interface Madde {
  metin: string
}
interface Karar {
  durum: 'temiz' | 'atlatildi' | 'blok' | 'olculemedi'
  sorunlar: string[]
  kartlar: string[]
  atlatmaSebebi?: string
  olculemedi?: string
}
interface Kanca {
  maddeleriCikar: (metin: string) => Madde[]
  degerlendir: (metin: string, dogrula: (k: string[]) => { olculemedi: string } | { gecerli: Set<string> }) => Karar
  ONEKLER: string[]
}
const kanca: Kanca = require_(KANCA)

const hepsiGecerli = (k: string[]) => ({ gecerli: new Set(k) })
const hicbiriGecerli = () => ({ gecerli: new Set<string>() })
const okunamaz = () => ({ olculemedi: 'Kanban betiği çalışmadı (çıkış 1)' })

describe('INV-KARTSIZ-KAPI-1: kalıp var + kart yok → blok', () => {
  it('numaralı istek maddesinde kart no yoksa bloklar', () => {
    const k = kanca.degerlendir('Özet.\n\n**Senden beklenenler.**\n\n- Design penceresine bak\n- Ekran görüntüsünü ver\n', hepsiGecerli)
    expect(k.durum).toBe('blok')
    expect(k.sorunlar).toHaveLength(2)
    expect(k.sorunlar[0]).toContain('kartsız madde')
  })

  it('başlık satırının kalanındaki istek de maddedir', () => {
    const k = kanca.degerlendir('Senden istenen: Design penceresine bak.', hepsiGecerli)
    expect(k.durum).toBe('blok')
  })

  it('"onayına sunuyorum" ve "Evet de" satırları kartsızsa bloklar', () => {
    expect(kanca.degerlendir('Bunu onayına sunuyorum.', hepsiGecerli).durum).toBe('blok')
    expect(kanca.degerlendir('Uygunsa Evet de, ben başlarım.', hepsiGecerli).durum).toBe('blok')
  })

  it('kart no var ama Kanban\'da yok/kapalı/Recep\'e bağlı değil → blok, sebep yazılır', () => {
    const k = kanca.degerlendir('**Senden istenen**\n\n- Ekrana bak (kart OPS-61)\n', hicbiriGecerli)
    expect(k.durum).toBe('blok')
    expect(k.sorunlar[0]).toContain('OPS-61')
  })
})

describe('INV-KARTSIZ-KAPI-2: kalıp var + kart var → geçer', () => {
  it('her maddenin sonunda geçerli kart no varsa temiz', () => {
    const k = kanca.degerlendir('**Senden beklenenler**\n\n- Design penceresine bak (kart OPS-61)\n- Ekran ver (kart OPS-62)\n', hepsiGecerli)
    expect(k.durum).toBe('temiz')
    expect(k.kartlar.sort()).toEqual(['OPS-61', 'OPS-62'])
  })

  it('tam kart kimliği (numarasız MOD kartları) de kabul edilir', () => {
    const uuid = '6edd47ed-948c-45db-bdce-8a17766a3349'
    const k = kanca.degerlendir('Senden istenen: kokpite bak (kart ' + uuid + ').', hepsiGecerli)
    expect(k.durum).toBe('temiz')
    expect(k.kartlar).toEqual([uuid])
  })

  it('karar maddeleri kart no taşıyorsa geçer', () => {
    const k = kanca.degerlendir('**Senden beklenenler**\n\n1. **34.** Google Analytics açılsın mı (kart OPS-40). Önerim evet.\n', hepsiGecerli)
    expect(k.durum).toBe('temiz')
  })
})

describe('INV-KARTSIZ-KAPI-3: kalıp yok ya da "yok" → geçer', () => {
  it('kalıp içermeyen mesaj temiz', () => {
    expect(kanca.degerlendir('Her şey bitti, testler geçti.', hicbiriGecerli).durum).toBe('temiz')
  })

  it('"Senden bir şey istemiyor" ve "Senden istenen yok" temiz', () => {
    expect(kanca.degerlendir('Senden beklenen bir şey yok.', hicbiriGecerli).durum).toBe('temiz')
    expect(kanca.degerlendir('**Senden istenen:** yok.', hicbiriGecerli).durum).toBe('temiz')
    expect(kanca.degerlendir('Senden bir şey istemiyor.', hicbiriGecerli).durum).toBe('temiz')
  })

  it('giriş satırı ("(iki adım):", "iki şey var:") istek sayılmaz; ardından gelen kartlı maddeler geçer', () => {
    const metin = '**Senden beklenenler** (iki adım):\n\niki şey var:\n- Design bak (kart OPS-61)\n- Ekran ver (kart OPS-61)\n'
    const k = kanca.degerlendir(metin, hepsiGecerli)
    expect(k.durum).toBe('temiz')
  })

  it('compact hazırlığı ritüeli kart gerektirmez (kendi kalıbı var)', () => {
    const metin = '**Senden beklenenler**\n\n- compact\'a bas, bittiğinde "yaptım" yaz.\n- `/compact` yaz.\n'
    expect(kanca.degerlendir(metin, hicbiriGecerli).durum).toBe('temiz')
  })

  it('bölüm sonraki başlıkta biter: başka bölümün maddeleri istek sayılmaz', () => {
    const metin = '**Senden beklenenler**\n\n- Design bak (kart OPS-61)\n\n**Bitenler**\n\n- ARC-33 bitti, kartı yok bile\n'
    const k = kanca.degerlendir(metin, hepsiGecerli)
    expect(k.durum).toBe('temiz')
    expect(k.kartlar).toEqual(['OPS-61'])
  })
})

describe('INV-KARTSIZ-KAPI-4: Kanban okunamaz → geçer (uyarıyla), kart no hiç yoksa yine bloklar', () => {
  it('kart no var, Kanban okunamıyor → olculemedi (blok DEĞİL)', () => {
    const k = kanca.degerlendir('Senden istenen: bak (kart OPS-61).', okunamaz)
    expect(k.durum).toBe('olculemedi')
    expect(k.olculemedi).toContain('Kanban')
  })

  it('kartsız madde Kanban\'a bakmadan bloklanır (okunamazlık gizleyemez)', () => {
    expect(kanca.degerlendir('Senden istenen: bak.', okunamaz).durum).toBe('blok')
  })
})

describe('INV-KARTSIZ-KAPI-5: "Kartsız: <sebep>" atlatması', () => {
  it('sebepli satır geçirir ve sebebi döndürür', () => {
    const k = kanca.degerlendir('Senden istenen: bak.\nKartsız: tek seferlik sözlü soru, takip gerekmiyor\n', hicbiriGecerli)
    expect(k.durum).toBe('atlatildi')
    expect(k.atlatmaSebebi).toContain('tek seferlik')
  })

  it('sebepsiz "Kartsız:" atlatma SAYILMAZ', () => {
    expect(kanca.degerlendir('Senden istenen: bak.\nKartsız:\n', hicbiriGecerli).durum).toBe('blok')
    expect(kanca.degerlendir('Senden istenen: bak.\nKartsız: x\n', hicbiriGecerli).durum).toBe('blok')
  })
})

// ---- süreç düzeyi: gerçek çıkış kodları ----

let dizin = ''
let sahteKanban = ''
let durumDizini = ''

const insan = (metin: string) => ({ type: 'user', message: { content: metin } })
const asistan = (metin: string) => ({ type: 'assistant', message: { content: [{ type: 'text', text: metin }] } })
const mesajGonder = (mesaj: string) => ({
  type: 'assistant',
  message: { content: [{ type: 'tool_use', name: 'SendMessage', input: { to: 'Ops', message: mesaj } }] },
})

let sayac = 0
function calistir(kayitlar: object[], ek: { durdurAktif?: boolean; kanban?: 'iyi' | 'bozuk'; govde?: string } = {}) {
  const tp = path.join(dizin, 'tr-' + ++sayac + '.jsonl')
  fs.writeFileSync(tp, kayitlar.map(k => JSON.stringify(k)).join('\n') + '\n')
  const oturum = 'test-oturum-' + process.pid + '-' + sayac
  const r = spawnSync(process.execPath, [KANCA], {
    input: ek.govde ?? JSON.stringify({ transcript_path: tp, session_id: oturum, stop_hook_active: ek.durdurAktif === true }),
    encoding: 'utf8',
    timeout: 20000,
    env: {
      ...process.env,
      KARTSIZ_KAPI_KANBAN: ek.kanban === 'bozuk' ? path.join(dizin, 'yok-boyle-betik.cjs') : sahteKanban,
      KARTSIZ_KAPI_DURUM_DIZINI: durumDizini,
    },
  })
  return { kod: r.status, stderr: r.stderr, oturum, tp }
}

beforeAll(() => {
  dizin = fs.mkdtempSync(path.join(os.tmpdir(), 'kartsiz-kapi-'))
  durumDizini = path.join(dizin, 'mod-durum')
  sahteKanban = path.join(dizin, 'sahte-kanban.cjs')
  // Sahte Kanban: OPS-61 açık ve Sen'de, OPS-70 kapalı (done), OPS-71 açık ama Recep'e bağlı değil.
  fs.writeFileSync(
    sahteKanban,
    `const t=[{task:{id:'aaaa1111-0000-0000-0000-000000000061',title:'OPS-61: SEN: Design bak',status:'pending',columnId:'todo',labels:['recep-bekliyor'],assignee:'Sen'}},
{task:{id:'aaaa1111-0000-0000-0000-000000000070',title:'OPS-70: bitti',status:'completed',columnId:'done',labels:['recep-bekliyor'],assignee:'Sen'}},
{task:{id:'aaaa1111-0000-0000-0000-000000000071',title:'OPS-71: ic is',status:'pending',columnId:'todo',labels:[],assignee:'ARAÇ'}}]
const ids=[];for(let i=2;i<process.argv.length;i++)if(process.argv[i]==='--id')ids.push(String(process.argv[++i]).toLowerCase())
const cikti=t.filter(x=>{const no=(x.task.title.match(/^([A-Z]+-\\d+)/)||[])[1];return ids.includes(String(no).toLowerCase())||ids.includes(x.task.id)})
console.log(JSON.stringify({ok:true,tasks:cikti}))`,
  )
})

afterAll(() => {
  fs.rmSync(dizin, { recursive: true, force: true })
})

describe('INV-KARTSIZ-KAPI-6: süreç — çıkış kodları', () => {
  it('kartsız istek → exit 2, mesajda "KARTSIZ" ve düzeltme yolu', () => {
    const r = calistir([insan('devam'), asistan('Tamam.\n\n**Senden beklenenler**\n\n- Design penceresine bak\n')])
    expect(r.kod).toBe(2)
    expect(r.stderr).toContain('KARTSIZ')
    expect(r.stderr).toContain('Kartsız: <sebep>')
  })

  it('geçerli kartlı istek → exit 0', () => {
    const r = calistir([insan('devam'), asistan('**Senden beklenenler**\n\n- Design penceresine bak (kart OPS-61)\n')])
    expect(r.kod).toBe(0)
  })

  it('kapalı kart ve Recep\'e bağlı olmayan kart → exit 2', () => {
    expect(calistir([insan('x'), asistan('Senden istenen: bak (kart OPS-70).')]).kod).toBe(2)
    expect(calistir([insan('x'), asistan('Senden istenen: bak (kart OPS-71).')]).kod).toBe(2)
  })

  it('kalıp yok → exit 0', () => {
    expect(calistir([insan('x'), asistan('Bitti, hepsi yeşil, ayrıntı kartta.')]).kod).toBe(0)
  })

  it('stop_hook_active → ikinci kez bloklamaz (döngü koruması)', () => {
    const r = calistir([insan('x'), asistan('Senden istenen: bak.')], { durdurAktif: true })
    expect(r.kod).toBe(0)
    expect(r.stderr).toContain('stop_hook_active')
  })

  it('boş ve bozuk stdin → exit 0, sessiz değil', () => {
    const bos = calistir([], { govde: '' })
    expect(bos.kod).toBe(0)
    expect(bos.stderr).toContain('stdin okunamadi')
    expect(calistir([], { govde: '{bozuk' }).stderr).toContain('bozuk JSON')
  })

  it('insan mesajı olmayan tur (salt bildirim) → exit 0', () => {
    expect(calistir([asistan('Senden istenen: bak.')]).kod).toBe(0)
  })
})

describe('INV-KARTSIZ-KAPI-7: Kanban okunamazsa geçer ama durum dosyası uyarır; atlatma kayda düşer', () => {
  it('betik yok → exit 0, kartsiz-kapi.json seviye uyari "kapı ölçemedi"', () => {
    const r = calistir([insan('x'), asistan('Senden istenen: bak (kart OPS-61).')], { kanban: 'bozuk' })
    expect(r.kod).toBe(0)
    expect(r.stderr).toContain('kapi olcemedi')
    const d = JSON.parse(fs.readFileSync(path.join(durumDizini, 'kartsiz-kapi.json'), 'utf8')) as { seviye: string; ozet: string }
    expect(d.seviye).toBe('uyari')
    expect(d.ozet).toContain('kapı ölçemedi')
  })

  it('sağlıklı geçişte durum dosyası iyi yazar', () => {
    calistir([insan('x'), asistan('Senden istenen: bak (kart OPS-61).')])
    const d = JSON.parse(fs.readFileSync(path.join(durumDizini, 'kartsiz-kapi.json'), 'utf8')) as { seviye: string }
    expect(d.seviye).toBe('iyi')
  })

  it('"Kartsız: <sebep>" → exit 0 ve sebep kartsiz-atlatma.log\'a yazılır', () => {
    const r = calistir([insan('x'), asistan('Senden istenen: bak.\nKartsız: Recep sözlü sordu, takip yok\n')])
    expect(r.kod).toBe(0)
    const log = fs.readFileSync(path.join(durumDizini, 'kartsiz-atlatma.log'), 'utf8')
    expect(log).toContain('Recep sözlü sordu')
  })
})

describe('INV-KARTSIZ-KAPI-8: başka pencereye giden mesaj (SendMessage) aynı kuraldan geçer', () => {
  it('kartsız istek içeren SendMessage → exit 2; aynı mesaj ikinci Stop\'ta bir daha bloklamaz', () => {
    const kayitlar = [insan('x'), mesajGonder('Recep için:\n**Senden istenen**\n- Ekrana bak\n'), asistan('Gönderdim.')]
    const tp = path.join(dizin, 'sm-' + ++sayac + '.jsonl')
    fs.writeFileSync(tp, kayitlar.map(k => JSON.stringify(k)).join('\n') + '\n')
    const oturum = 'sm-oturum-' + process.pid + '-' + sayac
    const kos = () =>
      spawnSync(process.execPath, [KANCA], {
        input: JSON.stringify({ transcript_path: tp, session_id: oturum }),
        encoding: 'utf8',
        timeout: 20000,
        env: { ...process.env, KARTSIZ_KAPI_KANBAN: sahteKanban, KARTSIZ_KAPI_DURUM_DIZINI: durumDizini },
      })
    const ilk = kos()
    expect(ilk.status).toBe(2)
    expect(ilk.stderr).toContain('başka pencereye giden mesaj')
    expect(kos().status).toBe(0)
    fs.rmSync(path.join(os.tmpdir(), 'kartsiz-kapi-gorulen-' + oturum.replace(/[^A-Za-z0-9-]/g, '').slice(0, 40) + '.json'), { force: true })
  })

  it('kartlı SendMessage geçer; kalıp içermeyen SendMessage geçer', () => {
    expect(calistir([insan('x'), mesajGonder('**Senden istenen**\n- Bak (kart OPS-61)\n'), asistan('Gönderdim.')]).kod).toBe(0)
    expect(calistir([insan('x'), mesajGonder('Sadece bilgi, Recep\'e bir şey gerekmiyor.'), asistan('Gönderdim.')]).kod).toBe(0)
  })

  it('bilinen kart ön ekleri listesi sabit: yeni departman eklenince bilinçli güncellenir', () => {
    expect(kanca.ONEKLER).toEqual(['OPS', 'ARC', 'HRT', 'URN', 'YTN', 'REC', 'ALT', 'ADM', 'KTL', 'SEO', 'EDG', 'BLG', 'TSR', 'DIL', 'MRK', 'MVZ', 'STS'])
  })
})

// 10-05 sabahı 285 ve 286 kartsız soruldu ve kapı geçirdi: kapı output style'ın kendi karar biçimlerine kördü.
describe('INV-KARTSIZ-KAPI-9: Recep output style karar biçimleri (karar maddesi, "demen yeterli", Önerim tablosu)', () => {
  it('"**285.** … Önerim evet" kartsızsa bloklar, kartlıysa geçer', () => {
    const kartsiz = '**285.** Kokpitte işlem yapılsın mı? Önerim evet, çünkü yazma kapısı hazır.'
    expect(kanca.maddeleriCikar(kartsiz)).toHaveLength(1)
    expect(kanca.degerlendir(kartsiz, hepsiGecerli).durum).toBe('blok')
    expect(kanca.degerlendir(kartsiz + ' (kart OPS-74)', hepsiGecerli).durum).toBe('temiz')
  })

  it('"**Karar 285**" ve madde işaretli "- **285.**" biçimi de karar maddesidir', () => {
    expect(kanca.maddeleriCikar('**Karar 285** Önerim hayır, bedeli yüksek.')).toHaveLength(1)
    expect(kanca.maddeleriCikar('- **285.** Başlasın mı? Onayın yeterli.')).toHaveLength(1)
  })

  it('bitmiş iş anlatımı karar maddesi sayılmaz', () => {
    expect(kanca.maddeleriCikar('**284.** evet verildi, uygulandı.')).toHaveLength(0)
    expect(kanca.maddeleriCikar('**284.** Recep evet dedi, birleşti.')).toHaveLength(0)
  })

  it('karar kelimesi taşımayan kalın numaralı satır (başlık ya da özet) istek sayılmaz', () => {
    expect(kanca.maddeleriCikar('**285.** Kokpit sürümü kopyalandı.')).toHaveLength(0)
  })

  it('"demen yeterli" ve "senin onayını bekliyor" ikinci kişi istektir; üçüncü kişi hâli değildir', () => {
    expect(kanca.degerlendir('Bu pencerede evet demen yeterli.', hepsiGecerli).durum).toBe('blok')
    expect(kanca.degerlendir('Birleştirme senin onayını bekliyor.', hepsiGecerli).durum).toBe('blok')
    expect(kanca.degerlendir('Onayın gerekiyor.', hepsiGecerli).durum).toBe('blok')
    expect(kanca.degerlendir('Ops\'un onayını bekliyorum.', hepsiGecerli).durum).toBe('temiz')
    expect(kanca.degerlendir('Birleştirme OPS onayını bekliyor.', hepsiGecerli).durum).toBe('temiz')
  })

  it('olumsuz ifade ("senden onay gerekmiyor") ve compact ritüeli istek sayılmaz', () => {
    expect(kanca.maddeleriCikar('Senin onayın gerekmiyor.')).toHaveLength(0)
    expect(kanca.maddeleriCikar('Şimdi compact yapabilirsin, evet demen yeterli.')).toHaveLength(0)
  })

  it('karar tablosu: Önerim dolu her satır istektir, kartsızsa bloklar', () => {
    const tablo = '| No | Karar | Önerim | Gerekçe |\n|---|---|---|---|\n| 285 | Kokpitte işlem | Evet | Kapı hazır |\n| 286 | Mavi nokta | Hayır | Karışır |\n'
    expect(kanca.maddeleriCikar(tablo)).toHaveLength(2)
    expect(kanca.degerlendir(tablo, hepsiGecerli).durum).toBe('blok')
  })

  it('karar tablosunda kart no satırda varsa geçer', () => {
    const tablo = '| No | Karar | Önerim |\n|---|---|---|\n| OPS-74 · 285 | Kokpitte işlem | Evet |\n'
    expect(kanca.degerlendir(tablo, hepsiGecerli).durum).toBe('temiz')
  })

  it('durum tablosu: yalnız Onayında satırı istektir; Sürüyor/Bitti satırı Önerim dolu olsa da istek değil', () => {
    const tablo =
      '| No | İş | Durum | Önerim | Sorumlu |\n|---|---|---|---|---|\n| ARC-1 | A | Onayında | Evet | sen |\n| ARC-2 | B | Sürüyor | Evet | ben |\n| ARC-3 | C | Bitti | — | ben |\n'
    const m = kanca.maddeleriCikar(tablo)
    expect(m).toHaveLength(1)
    expect(m[0]?.metin).toContain('ARC-1')
  })

  it('Önerim boş ya da "—" olan satır istek sayılmaz; tablo biter, sonraki düz yazı yine taranır', () => {
    const tablo = '| No | Karar | Önerim |\n|---|---|---|\n| 1 | A | — |\n| 2 | B |  |\n\nBu pencerede evet demen yeterli.\n'
    const m = kanca.maddeleriCikar(tablo)
    expect(m).toHaveLength(1)
    expect(m[0]?.metin).toContain('demen yeterli')
  })

  it('ayraç satırı (|---|) olmayan düz metin "Önerim" başlığıyla tablo sayılmaz', () => {
    expect(kanca.maddeleriCikar('| No | Önerim |\n| 1 | Evet |\n| 2 | Evet |\n| 3 | Evet |\n')).toHaveLength(0)
  })

  it('tablo satırı bitmiş işi ya da compact ritüelini anlatıyorsa istek sayılmaz', () => {
    const tablo = '| No | Karar | Önerim |\n|---|---|---|\n| 1 | Kopyalama | Evet verildi, uygulandı |\n| 2 | Şimdi compact | Evet |\n| 3 | Kokpit | Evet |\n'
    const m = kanca.maddeleriCikar(tablo)
    expect(m).toHaveLength(1)
    expect(m[0]?.metin).toContain('Kokpit')
  })

  it('Önerim sütunu olmayan tablo taranmaz', () => {
    expect(kanca.maddeleriCikar('| No | İş | Durum |\n|---|---|---|\n| ARC-1 | A | Onayında |\n')).toHaveLength(0)
  })

  it('Türkçe harfle biten bitmiş-iş fiilleri (alındı, kapandı, yapıldı, tamamlandı) de istek DEĞİL: \\b bu harflerde sınır saymaz', () => {
    for (const f of ['onayın alındı', 'kapandı', 'yapıldı', 'tamamlandı', 'uygulandı'])
      expect(kanca.maddeleriCikar('**284.** Önerim evet, ' + f + '.'), f).toHaveLength(0)
  })

  it('tırnak, «» ya da ters tırnak içindeki örnek ifade istek sayılmaz (kapıyı anlatan satır)', () => {
    expect(kanca.maddeleriCikar('Kapı «demen yeterli» ifadesini artık tanıyor.')).toHaveLength(0)
    expect(kanca.maddeleriCikar('Kapı "demen yeterli" ve `senin onayını bekliyor` biçimlerini tanıyor.')).toHaveLength(0)
    expect(kanca.maddeleriCikar('Bu pencerede evet demen yeterli.')).toHaveLength(1)
  })

  it('TSR/DIL/MRK/MVZ/STS kartları da tanınır (TASARIM kartı «bilinmeyen kart» diye bloklanmaz)', () => {
    for (const k of ['TSR-6', 'DIL-3', 'MRK-1', 'MVZ-2', 'STS-4']) {
      const r = kanca.degerlendir('Senden istenen: kararı ver (kart ' + k + ').', hepsiGecerli)
      expect(r.durum, k).toBe('temiz')
      expect(r.kartlar, k).toEqual([k])
    }
  })

  it('"Kartsız: <sebep>" atlatması yeni biçimlerde de çalışır', () => {
    const k = kanca.degerlendir('**285.** Başlasın mı? Önerim evet.\nKartsız: tek seferlik sözlü soru, takip gerekmiyor\n', hicbiriGecerli)
    expect(k.durum).toBe('atlatildi')
  })
})
