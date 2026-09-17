#!/usr/bin/env node
/**
 * INV-SEARCH-BEHAVIOR-1 — arama DAVRANIŞI kapısı (Katman B, canlı).
 *
 * Cetvel: `docs/standards/arama-standard.md` §8 · Kayıt: REC-340 Faz 1 Adım 1.
 * Kardeş kapı: `INV-SEARCH-ROUTE-1` (`search-route-ssot.test.ts`) — o GEZİNMEYİ ölçer,
 * bu DAVRANIŞI. Ad ailesi bilerek aynı (cetvel K8.2: aynı alanda iki aile taşınmaz).
 *
 * ── NİÇİN CANLI KATMAN GEREKLİ ──
 *
 * CI'daki vitest `https://dummy.supabase.co` ile koşuyor. Arama davranışını orada ölçmek
 * **sessizce yanlış ölçer**: sorgu hiç gitmez, sonuç boş döner ve "0 sonuç" bir ÖLÇÜM gibi
 * görünür. Bu yüzden davranış yalnız gerçek veritabanına karşı ölçülür (cetvel K8.1).
 *
 * ── ⭐KAPI BUGÜN KIRMIZI BAŞLIYOR, VE BU BİR KUSUR DEĞİL ──
 *
 * Ölçüldü (2026-09-15, prod, salt-okuma): on vakanın **beşi sıfır dönüyor**. Düzeltme
 * (REC-340 Faz 1 Adım 2-3) henüz yazılmadı. Kapı düzeltmeden ÖNCE yazılıyor ki
 * *"düzeldi"* iddiası ölçülebilsin — sonra yazılan kapı, düzeltmenin kendi ödevini
 * işaretlemesi olurdu.
 *
 * ── BİLİNEN KIRMIZI İLANI VE İKİ YÖNLÜ MANDAL ──
 *
 * Bilinen kırmızılar `BILINEN_KIRMIZI` içinde **adıyla** ilan edilir ve o vakalar
 * **uyarı** üretir, çıkışı kırmızı yapmaz — yoksa kapı indiği gün master'ı bloklardı ve
 * üçüncü günde kapatılırdı.
 *
 * ⭐MANDAL İKİ YÖNLÜ ÇALIŞIR (ilan bir muafiyet listesi DEĞİL):
 *   · İlanda OLMAYAN bir vaka düşerse → **KIRMIZI** (yeni gerileme).
 *   · İlanda OLAN bir vaka GEÇMEYE BAŞLARSA → **KIRMIZI** (ilan bayat; düzeltme geldi,
 *     satır listeden çıkarılmalı). Yani liste yalnız KÜÇÜLEBİLİR ve küçültmek düzeltme
 *     işinin PARÇASIDIR.
 * İkinci yön olmasa ilan sonsuza kadar yaşar ve kapı hiç yeşile dönmez.
 *
 * ── ÖLÇÜT BİÇİMLERİ: SABİT SAYI YOK (cetvel K8.3) ──
 *
 * Katalog şeridi her gün ürün ekliyor; `= 47` diyen bir kapı ilk eklemede sahte kırmızı
 * yanar ve kimse ona güvenmez. Kullanılan biçimler: **sıfır-değil**, **oran**,
 * **aynı küme**, **adıyla bilinen bir ürünün varlığı**. Kesin sayı yalnız tam SKU
 * vakasında anlamlıdır (orada ölçüt "tam 1" ve bu bir REGRESYON koludur — cetvel K8.5).
 *
 * KOŞTURMA:
 *   SUPABASE_DB_URL=... node scripts/db/checks/arama-davranisi.mjs [--json]
 *
 * Bağlantı dizesi yoksa çıkış **0** ve "ÖLÇÜLEMEDİ" der — "geçti" DEMEZ.
 * ⛔"ATLANMIS IS YESIL DEGILDIR": atlandığı yazılmadıkça atlanmamış sayılır.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import pg from 'pg'

const KOK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const JSON_KIPI = process.argv.includes('--json')

/** Hassasiyet tavanı (cetvel K8.4): hiçbir vaka aktif ürünlerin bu oranını AŞAMAZ. */
const TAVAN_ORAN = 0.4
/** Türkçe karakter körlüğü koluna izin verilen kayıp (cetvel, vaka 2): ≥ %90. */
const TR_ASGARI_ORAN = 0.9

/**
 * VAKA KÜMESİ — cetvel §8 "Asgari vaka kümesi" tablosunun makine karşılığı.
 * ⚠Bu liste **taban**dır: genişletilebilir, DARALTILAMAZ. Daraltma cetvel değişikliği ister.
 */
const VAKALAR = [
  { no: 1, q: 'havalandırma', olcut: 'sifir-degil', nicin: 'temel eşleşme' },
  { no: 2, q: 'havalandirma', olcut: 'oran', referans: 1, asgari: TR_ASGARI_ORAN, nicin: 'Türkçe karakter körlüğü (K5.1)' },
  { no: 3, q: 'jet fan', olcut: 'sifir-degil', nicin: 'gövdede aile/kategori adı (K3.2)' },
  { no: 4, q: 'fan jet', olcut: 'ayni-kume', referans: 3, nicin: 'kelime sırası bağımsızlığı (K6.1)' },
  { no: 5, q: 'vortis', olcut: 'marka-var', marka: 'vortice', nicin: 'yazım hatası toleransı (K6.4)' },
  { no: 6, q: 'ısı geri kazanım', olcut: 'sifir-degil', nicin: 'çok kelimeli tamlama (K6.2)' },
  { no: 7, q: 'VRT-17160', olcut: 'tam-tek-sku', sku: 'VRT-17160', nicin: 'kesinlik REGRESYONU (K8.5)' },
  { no: 8, q: 'kanal tipi fan', olcut: 'sifir-degil', nicin: 'üç kelime + kategori' },
  { no: 9, q: 'duvar tipi aspiratör', olcut: 'sifir-degil', nicin: "dört kelime, ad'da geçmeyen terim" },
  { no: 10, q: 'ISI GERI KAZANIM', olcut: 'ayni-kume', referans: 6, nicin: 'büyük harf + noktasız (K5.2)' },
  // ── 2026-09-17, URUN #1246 (cetvel §8 vaka 13/14/15) ──
  { no: 13, q: 'jet fan', olcut: 'ad-isabeti-sira', nicin: 'ilk satır = kümedeki en yüksek ad isabeti (K3.1e)' },
  { no: 14, q: 'vortis', olcut: 'marka-tavani', marka: 'vortice', nicin: 'marka tavanı: ≤ marka aktif sayısı, marka dışı 0 (K8.4a)' },
  { no: 15, q: 'ISI GERİ KAZANIM', olcut: 'ayni-sayi', referans: 6, nicin: 'büyük İ lower() öncesi indirilir (K5.2a)' },
  // Cetvel vaka 15'in ikinci sorgusu ("İNLİNE") küçük harfli karşılığa ihtiyaç duyar; o karşılık
  // tabloda ayrı vaka değil, bu yüzden 16 (referans) + 17 (büyük İ) olarak iki satıra açıldı.
  { no: 16, q: 'inline', olcut: 'sifir-degil', nicin: 'vaka 17 referansı (küçük harf)' },
  { no: 17, q: 'İNLİNE', olcut: 'ayni-sayi', referans: 16, nicin: 'büyük İ lower() öncesi indirilir (K5.2a, cetvel vaka 15)' },
]

/** K8.4a: bu ölçütlerde genel %40 tavanı UYGULANMAZ — tavan markanın aktif ürün sayısıdır. */
const MARKA_OLCUTLERI = new Set(['marka-var', 'marka-tavani'])

/**
 * BİLİNEN KIRMIZILAR — ⭐LİSTE 09-16'DA KÜÇÜLDÜ (mandalın ikinci yönü işledi).
 *
 * 2026-09-15 prod ölçümü (Adım 1): 1→47 · 2→**0** · 3→**0** · 4→**0** · 5→**0** · 6→9 ·
 * 7→1 · 8→52 · 9→**0** · 10→3.
 *
 * 2026-09-16 prod ölçümü (REC-340 Faz 1 **Adım 2** canlıya indi, PR #1221 · squash 70a81b11):
 * vaka 3 "jet fan" **0 → 61** · vaka 4 "fan jet" **0 → 61 (vaka 3 ile AYNI KÜME)** ·
 * yan ölçümler: "asit dayanımlı fan" 0 → 80, "banyo" 4 → 40, "kanal tipi fan" 52 → 66,
 * "havalandırma" 47 → 50, VRT-17160 **1** (kesinlik regresyonu YOK).
 *
 * ⭐3 VE 4 BU YÜZDEN LİSTEDEN ÇIKARILDI. Mandalın ikinci yönü tam bunun için var: düzeltme
 * geldiğinde ilan satırının kalması kapıyı KIRMIZI yapar ve nitekim yaptı (master be88580ea,
 * "İHLAL 2 — ilan BAYAT"). Satırı silmek düzeltme işinin PARÇASIdır, ayrı bir iş değil.
 *
 * ⚠VAKA 9'UN GEREKÇESİ DEĞİŞTİ, KOPYALANMADI: eskiden "vaka 3 ile aynı kök" yazıyordu.
 * Adım 2 gövde genişletmesini canlıya indirdi ve vaka 3 düzeldi, ama vaka 9 HÂLÂ 0 —
 * yani kök AYNI DEĞİLDİ. Ölçüm bir varsayımı çürüttü; satır ona göre yazıldı.
 *
 * 2026-09-17 prod ölçümü (URUN #1235, pgroonga + tek arama gövdesi canlıda, merge 92049ac2f):
 * vaka 2 "havalandirma" **0 → 50** · vaka 9 "duvar tipi aspiratör" **0 → 40** · vaka 10
 * "ISI GERI KAZANIM" **3 → 20 (vaka 6 ile AYNI KÜME)**. ⭐2, 9, 10 LİSTEDEN ÇIKTI — mandalın
 * ikinci yönü PR #1240'ta KIRMIZI verdi, satırlar o yüzden silindi.
 * Vaka 5 "vortis" 0 → 184 geçti ama TAVAN kolu kırmızı: ilanın GEREKÇESİ değişti (arama hatası
 * değil, marka vakasında tavan kuralının kendisi yanlış) — satır yeni gerekçeyle yazıldı.
 *
 * Her satır NİÇİN kırmızı olduğunu ve düzeltmenin HANGİ adımda geldiğini yazar. Gerekçesiz
 * satır kabul edilmez (kardeş kapı `catalog-integrity` ile aynı kural).
 */
const BILINEN_KIRMIZI = {
  // 2026-09-17: vaka 5 ilanı SİLİNDİ — cetvel K8.4a (URUN #1246) marka vakasında genel %40
  // tavanını kaldırdı, kapı ona göre güncellendi (MARKA_OLCUTLERI). Liste BOŞ: hedef budur.
}

function baglantiDizesi() {
  const d = process.env.SUPABASE_DB_URL
  // ⛔DEĞER BASILMAZ — yalnız VARLIĞI ölçülür. `${VAR:-YOK}` kalıbı değeri yazdırır ve
  // 2026-09-04'te prod bağlantı dizesini log'a düşürdü; o kalıp bu depoda YASAK.
  return typeof d === 'string' && d.length > 0 ? d : null
}

async function olc(client, vaka) {
  const { rows } = await client.query(
    'select id, sku, brand from public.fts_search_products($1, 500, $2::jsonb)',
    [vaka.q, '{}'],
  )
  return rows
}

/**
 * ⭐ROL KOLU (INV-SEARCH-BEHAVIOR-1 · 2026-09-17).
 *
 * Kapı bağlantı dizesinin kullanıcısıyla (postgres) ölçüyordu. #1235 canlıya inince
 * yardımcı fonksiyonlardan EXECUTE alındı, dış uçlar SECURITY INVOKER kaldı ve arama
 * ziyaretçide + girişli müşteride TAMAMEN BOŞ döndü (anon REST: 42501 permission denied for
 * function arama_eslesen_urunler). Kapı o gün "jet fan 61" diye YEŞİL verdi — yetki kusuru
 * yalnız o rolde görünür; sahibin rolüyle ölçen kapı onu tanım gereği göremez.
 *
 * Bu yüzden her vaka vitrinin GERÇEK rolleriyle de koşar: `set local role` bir işlem içinde,
 * sonunda ROLLBACK (yazma yok, oturum rolü sızmaz). Ölçüt sabit sayı değil: sahip rolü sonuç
 * bulurken vitrin rolü hata veriyor ya da BOŞ dönüyorsa İHLAL.
 */
const VITRIN_ROLLERI = ['anon', 'authenticated']

/**
 * ⭐ROL TEK BAŞINA GERÇEK İSTEK DEĞİL — JWT iddiaları da vitrindeki gibi kurulur.
 *
 * 2026-09-17 ölçüldü: `set local role authenticated` iddiasız koşunca `fts_search_products`
 * 54001 stack depth ile patlıyor (display_price → is_user_admin → user_profiles politikası →
 * is_admin_user → iddia yoksa YİNE user_profiles …). Ama canlıda `custom_access_token_hook`
 * ETKİN (Auth config: hook_custom_access_token_enabled=true) ve her jetona `user_role` yazıyor
 * — profili olmayana bile "user". Yani iddiasız authenticated jeton vitrinde ÜRETİLMEZ; iddiasız
 * ölçmek müşterinin görmediği bir kırmızıyı ölçer. İddiasız hâl GERÇEK bir kusurdur (REC-355,
 * VULN) ve onarımıyla AYNI PR'da ayrı kol olarak gelir.
 * Kanca çıktısının biçimi birebir: kök + app_metadata altında user_role.
 */
const VITRIN_IDDIALARI = {
  anon: { role: 'anon' },
  authenticated: { role: 'authenticated', user_role: 'user', app_metadata: { user_role: 'user' } },
}

async function olcRolle(client, vaka, rol) {
  await client.query('begin')
  try {
    await client.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(VITRIN_IDDIALARI[rol])])
    await client.query(`set local role ${rol}`)
    const { rows } = await client.query(
      'select id from public.fts_search_products($1, 500, $2::jsonb)',
      [vaka.q, '{}'],
    )
    return { n: rows.length, hata: null }
  } catch (e) {
    return { n: 0, hata: `${e.code ?? ''} ${e.message}`.trim() }
  } finally {
    await client.query('rollback')
  }
}

async function main() {
  const dizi = baglantiDizesi()
  if (!dizi) {
    console.log('arama-davranisi: OLCULEMEDI — SUPABASE_DB_URL yok (deger BASILMADI).')
    console.log('⛔ATLANMIS IS YESIL DEGILDIR: bu kosumda arama davranisi HIC olculmedi.')
    process.exit(0)
  }
  console.log(`arama-davranisi: sir MEVCUT (uzunluk ${dizi.length} karakter, deger BASILMADI).`)

  /**
   * ⛔`sslmode` BAĞLANTI DİZESİNDEN SÖKÜLÜR — bunu INV-DENETIM-IZI-1 kapısı yakaladı
   * (bu betiğin ilk yazımında eksikti ve kapı KIRMIZI verdi; sekizinci betik olarak aynı
   * boşlukla doğuyordum).
   *
   * Sebep (2026-09-09'da ölçülmüş): node-postgres bağlantı dizesini kendi ayrıştırıcısıyla
   * okuyor ve oradaki `sslmode`, bizim verdiğimiz `ssl` nesnesinin YERİNE geçiyor — o an
   * kök sertifika sessizce devre dışı kalıyor ve zincir "self-signed certificate in
   * certificate chain" ile düşüyor. Belirti sinsi: aynı betik aynı sertifikayla YERELDE
   * çalışır (yerel dizede `sslmode` yok), CI'da çalışmaz.
   *
   * ⭐KUSUR BİLGİ EKSİKLİĞİ DEĞİL, KOPYA SÜRÜKLENMESİ: çözüm her betiğe elle taşındığı için
   * yeni betik onu almadan doğuyor. Kapı tam bunun için var ve beni yakaladı. Paylaşılan
   * yardımcıya çıkarmak ayrı kalem olarak duruyor (o kapının kendi yorumunda yazılı).
   */
  const sslmodeVarDi = /[?&]sslmode=/.test(dizi)
  const temizDizi = dizi.replace(/([?&])sslmode=[^&]*/g, '$1').replace(/[?&]$/, '')
  if (sslmodeVarDi) {
    console.log('arama-davranisi: baglanti dizesindeki sslmode kaldirildi (TLS ayari KODDA belirlenir)')
  }

  const kokSertifika = path.join(KOK, 'scripts', 'db', 'checks', 'supabase-root-2021-ca.pem')
  const client = new pg.Client({
    connectionString: temizDizi,
    ssl: fs.existsSync(kokSertifika) ? { ca: fs.readFileSync(kokSertifika, 'utf8') } : undefined,
  })
  await client.connect()

  let aktif = 0
  try {
    const r = await client.query(
      "select count(*)::int as n from public.products where status='active' and deleted_at is null",
    )
    aktif = r.rows[0].n
  } finally {
    /* aktif sayısı ölçülemezse tavan kolu atlanır ve bu SÖYLENİR (aşağıda) */
  }

  const sonuclar = new Map()
  for (const v of VAKALAR) sonuclar.set(v.no, await olc(client, v))

  // K8.4a: marka vakalarının tavanı = markanın aktif ürün sayısı (sabit sayı değil, canlıdan).
  const markaAktif = new Map()
  for (const v of VAKALAR.filter((x) => x.olcut === 'marka-tavani')) {
    const r = await client.query(
      "select count(*)::int as n from public.products where status='active' and deleted_at is null and brand ilike $1",
      [`%${v.marka}%`],
    )
    markaAktif.set(v.no, r.rows[0].n)
  }

  // K3.1e: ad isabeti canlı fonksiyonla ölçülür. Fonksiyon YOKSA bu bir ihlal değil ÖLÇEMEMEKTİR
  // → exit 2 (catch). Aynı fonksiyonu kapıda yeniden yazmak iki uygulama doğururdu.
  const adIsabeti = new Map()
  for (const v of VAKALAR.filter((x) => x.olcut === 'ad-isabeti-sira')) {
    const idler = sonuclar.get(v.no).map((r) => r.id)
    if (idler.length === 0) { adIsabeti.set(v.no, new Map()); continue }
    const r = await client.query(
      `select p.id::text as id,
              public.arama_ad_isabeti(concat_ws(' ', p.name, p.name_i18n->>'tr', p.name_i18n->>'en'), $1)::float8 as puan
         from public.products p where p.id = any($2::uuid[])`,
      [v.q, idler],
    )
    adIsabeti.set(v.no, new Map(r.rows.map((x) => [x.id, Number(x.puan)])))
  }

  const ihlaller = []
  const uyarilar = []
  const gecenler = []

  // Rol kolu İLANA TABİ DEĞİL: vitrinde aramanın çalışmaması "bilinen kırmızı" olamaz.
  for (const v of VAKALAR) {
    const sahipN = sonuclar.get(v.no).length
    for (const rol of VITRIN_ROLLERI) {
      const r = await olcRolle(client, v, rol)
      if (r.hata) {
        ihlaller.push(`[vaka ${v.no}] "${v.q}" ROL ${rol} — sorgu HATA verdi: ${r.hata}`)
      } else if (sahipN > 0 && r.n === 0) {
        ihlaller.push(`[vaka ${v.no}] "${v.q}" ROL ${rol} — BOS (sahip rolu ${sahipN} sonuc buluyor)`)
      }
    }
  }
  await client.end()

  const kimlikKumesi = (rows) => new Set(rows.map((r) => String(r.id)))

  for (const v of VAKALAR) {
    const rows = sonuclar.get(v.no)
    const n = rows.length
    let hata = null

    if (v.olcut === 'sifir-degil') {
      if (n === 0) hata = `0 sonuc (olcut: sifir-degil)`
    } else if (v.olcut === 'oran') {
      const refN = sonuclar.get(v.referans).length
      if (refN === 0) hata = `referans vaka ${v.referans} BOS — oran olculemez`
      else if (n / refN < v.asgari) {
        hata = `oran ${(n / refN).toFixed(2)} < ${v.asgari} (vaka ${v.referans}: ${refN}, bu: ${n})`
      }
    } else if (v.olcut === 'ayni-kume') {
      const a = kimlikKumesi(rows)
      const b = kimlikKumesi(sonuclar.get(v.referans))
      if (b.size === 0) hata = `referans vaka ${v.referans} BOS — kume karsilastirmasi anlamsiz`
      else if (a.size !== b.size || [...a].some((x) => !b.has(x))) {
        hata = `vaka ${v.referans} ile AYNI KUME DEGIL (${a.size} vs ${b.size})`
      }
    } else if (v.olcut === 'marka-var') {
      const varMi = rows.some((r) => String(r.brand ?? '').toLowerCase().includes(v.marka))
      if (!varMi) hata = `markasi "${v.marka}" olan sonuc YOK (${n} sonuc icinde)`
    } else if (v.olcut === 'tam-tek-sku') {
      if (n !== 1) hata = `tam 1 sonuc beklenirken ${n}`
      else if (String(rows[0].sku) !== v.sku) hata = `ilk satir SKU ${rows[0].sku}, beklenen ${v.sku}`
    } else if (v.olcut === 'marka-tavani') {
      const tavan = markaAktif.get(v.no) ?? 0
      const disi = rows.filter((r) => !String(r.brand ?? '').toLowerCase().includes(v.marka)).length
      if (tavan === 0) hata = `markanin aktif urun sayisi 0 — tavan olculemez (marka "${v.marka}")`
      else if (n === 0) hata = `0 sonuc (marka "${v.marka}" aktif ${tavan})`
      else if (n > tavan) hata = `marka TAVANI asildi: ${n} > ${v.marka} aktif ${tavan}`
      else if (disi > 0) hata = `marka disi sonuc ${disi} (beklenen 0)`
    } else if (v.olcut === 'ayni-sayi') {
      const refN = sonuclar.get(v.referans).length
      if (refN === 0) hata = `referans vaka ${v.referans} BOS — sayi karsilastirmasi anlamsiz`
      else if (n !== refN) hata = `vaka ${v.referans} ile AYNI SAYI DEGIL (${n} vs ${refN})`
    } else if (v.olcut === 'ad-isabeti-sira') {
      const puanlar = adIsabeti.get(v.no) ?? new Map()
      if (n === 0) hata = '0 sonuc — sira olculemez'
      else {
        const ilk = puanlar.get(String(rows[0].id))
        const enYuksek = Math.max(...puanlar.values())
        if (ilk === undefined) hata = 'ilk satirin ad isabeti olculemedi'
        else if (ilk < enYuksek) hata = `ilk satir ad isabeti ${ilk.toFixed(2)} < kumedeki en yuksek ${enYuksek.toFixed(2)}`
      }
    } else {
      hata = `TANIMSIZ olcut "${v.olcut}" — kapi bu vakayi OLCMUYOR`
    }

    // Hassasiyet tavanı — marka ölçütleri DIŞINDAKİ her vakaya (cetvel K8.4; marka için K8.4a).
    if (!hata && !MARKA_OLCUTLERI.has(v.olcut) && aktif > 0 && n > aktif * TAVAN_ORAN) {
      hata = `hassasiyet TAVANI asildi: ${n} > aktif ${aktif} x ${TAVAN_ORAN}`
    }

    const ilanli = Object.prototype.hasOwnProperty.call(BILINEN_KIRMIZI, v.no)
    if (hata && ilanli) {
      uyarilar.push(`[vaka ${v.no}] "${v.q}" — ${hata}\n      ilan: ${BILINEN_KIRMIZI[v.no]}`)
    } else if (hata) {
      ihlaller.push(`[vaka ${v.no}] "${v.q}" (${v.nicin}) — ${hata}`)
    } else if (ilanli) {
      // ⭐MANDALIN İKİNCİ YÖNÜ: ilanlı vaka GEÇTİ → ilan BAYAT, listeden çıkarılmalı.
      ihlaller.push(
        `[vaka ${v.no}] "${v.q}" ARTIK GECIYOR (${n} sonuc) ama BILINEN_KIRMIZI icinde duruyor.\n` +
          `      Ilan BAYAT: duzeltme geldi, satir SILINMELI. Liste yalniz KUCULEBILIR.`,
      )
    } else {
      gecenler.push(`[vaka ${v.no}] "${v.q}" -> ${n} sonuc`)
    }
  }

  if (aktif === 0) {
    uyarilar.push('aktif urun sayisi 0 olculdu — hassasiyet TAVANI kolu bu kosumda ATLANDI.')
  }

  if (JSON_KIPI) {
    console.log(JSON.stringify({ aktif, ihlaller, uyarilar, gecenler }, null, 2))
  } else {
    console.log(`\naktif urun: ${aktif} | hassasiyet tavani: ${Math.floor(aktif * TAVAN_ORAN)} sonuc\n`)
    console.log(`GECEN ${gecenler.length}:`)
    for (const g of gecenler) console.log('  ' + g)
    if (uyarilar.length) {
      console.log(`\n⚠BILINEN KIRMIZI ${uyarilar.length} (REC-340, kapi bu yuzden kirmizi DEGIL):`)
      for (const u of uyarilar) console.log('  ' + u)
      console.log('\n  Bu satirlar duzeltme indikce SILINIR. Silinmezse mandalin ikinci yonu')
      console.log('  onlari KIRMIZI yapar — ilan sonsuza kadar yasayamaz.')
      console.log(`::warning title=ARAMA DAVRANISI (bilinen kirmizi)::${uyarilar.length} vaka ilanli kirmizi (REC-340 Faz 1). Duzeltme Adim 2-3 te.`)
    }
  }

  if (ihlaller.length) {
    console.log(`\n⛔IHLAL ${ihlaller.length} — ILANDA OLMAYAN ya da ILANI BAYATLAMIS vaka:`)
    for (const i of ihlaller) console.log('  ' + i)
    console.log('\nYa davranis duzeltilir, ya ilan GEREKCESIYLE guncellenir. Gerekcesiz ilan kabul edilmez.')
    process.exit(1)
  }
  console.log('\narama-davranisi: ILANDA OLMAYAN ihlal YOK.')
  process.exit(0)
}

main().catch((err) => {
  const sertifikaHatasi = /certificate|self-signed|SELF_SIGNED/i.test(err.message)
  if (sertifikaHatasi) {
    console.error('arama-davranisi: OLCULEMEDI — TLS zinciri dogrulanamadi:', err.message)
    console.error('Kok sertifikayi PGSSLROOTCERT/dosya ile verin; dogrulamayi KAPATMAK cozum degildir.')
  } else {
    console.error('arama-davranisi: kosum HATASI —', err.message)
  }
  // Çıkış 2 = ÖLÇEMEDİM (ihlal 1'den AYRI kod): "iş kırmızı değil ADIM kırmızı".
  process.exit(2)
})
