/**
 * INV-PURCH-1 — Satınalma: tek durum sözlüğü + kanıtlı mal kabul + kapalı motor köprüsü
 *
 * CETVEL: `docs/standards/purchasing-standard.md` §3 (durum makinesi) + §4 (kanıt satırı)
 * + §5.2/§5.4 (maliyet ilkeleri, köprü v1 KAPALI) + §10 (bu kural seti R1–R5).
 *
 * TEHDİT MODELİ — drift dedektörü. T052'nin öğrettiği sınıfı satınalma tarafında
 * baştan kapatır: (a) statü sözlüğü iki yerde ayrı yaşayıp ayrışır, (b) bir geliştirici
 * stok girişini RPC yerine doğrudan tabloya yazar, (c) mal kabul "madem maliyet
 * güncellendi" diye fiyat motorunu tetikler — Recep'in v1 kararını sessizce deler.
 *
 * TEKNİK ZORUNLULUKLAR (bu deponun ölçülmüş dersleri):
 *  · Yorum sıyırma CRLF-güvenli: satır yorumu `[^\r\n]*` ile kesilir — `.` `\r` ile
 *    eşleşmez, `$`'a bırakmak CRLF depoda HİÇBİR ŞEY sıyırmaz (LEGAL-OPS ölçümü).
 *  · Assert kendi dokümanıyla tatmin olmaz: önce sıyır, sonra ÇAĞRI biçimini ara.
 *  · Eager glob'lar e2e'nin geçici `*.compiled.<rastgele>.ts` dosyalarını `!` deseniyle
 *    dışlar (#571 — filtre yetmez, eager glob içeriği filtreden önce okur).
 *  · Parser sağlığı sentetik örnekle ölçülür, gerçek ihlalin varlığına bağlanmaz.
 */
import { describe, expect, it } from 'vitest'

import { PO_STATUSES } from '@/lib/purchasing/poStatusMachine'
import { canWrite, type UserRole } from '@/lib/rbac'

declare global {
  interface ImportMeta {
    glob(
      pattern: readonly string[],
      options: { query: string; import: string; eager: true },
    ): Record<string, string>
  }
}

const RECEIPT_RPC = 'process_goods_receipt'

const appSources = import.meta.glob(['/src/**/*.{ts,tsx}', '!**/*.compiled.*.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const edgeSources = import.meta.glob(['/supabase/functions/**/*.ts', '!**/*.compiled.*.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

const migrationSql = import.meta.glob(['/supabase/migrations/*.sql'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

function isTestPath(path: string): boolean {
  return /__tests__|\.test\.|\.spec\.|\/tests?\//.test(path)
}

const productionSources: Record<string, string> = Object.fromEntries(
  [...Object.entries(appSources), ...Object.entries(edgeSources)].filter(
    ([p]) => !isTestPath(p) && !p.endsWith('/types/database.types.ts'),
  ),
)

/** Satınalma modülünün kendi dosyaları (cetvel §10 R3/R4 kapsamı). */
const purchasingSources: Record<string, string> = Object.fromEntries(
  Object.entries(productionSources).filter(([p]) =>
    /\/src\/(lib\/purchasing\/|lib\/services\/purchasing|(views|app|components)\/admin\/purchasing\/)/.test(p),
  ),
)

/** CRLF-güvenli yorum sıyırma: blok yorumları ve satır yorumlarını kaldırır. */
function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\r\n]*/g, '')
}

/** Çağrı biçimi: `rpc('process_goods_receipt'` ya da ham `/rest/v1/rpc/process_goods_receipt`. */
function callsReceiptRpc(src: string): boolean {
  const kodsuz = stripComments(src)
  const jsRpc = new RegExp(String.raw`\.rpc\(\s*['"\`]` + RECEIPT_RPC + String.raw`['"\`]`)
  const restRpc = new RegExp(String.raw`/rest/v1/rpc/` + RECEIPT_RPC + String.raw`\b`)
  return jsRpc.test(kodsuz) || restRpc.test(kodsuz)
}

/** `.from('<tablo>')` + yakında `.insert(`/`.upsert(` — istemci tarafı doğrudan yazma. */
function directTableWrite(src: string, table: string): boolean {
  const kodsuz = stripComments(src)
  const fromCall = new RegExp(String.raw`\.from\(\s*['"\`]` + table + String.raw`['"\`]\s*\)`, 'g')
  for (const m of kodsuz.matchAll(fromCall)) {
    const window = kodsuz.slice(m.index ?? 0, (m.index ?? 0) + 300)
    if (/\.(insert|upsert)\s*\(/.test(window)) return true
  }
  // Ham PostgREST POST biçimi.
  const rawUrl = new RegExp(String.raw`/rest/v1/` + table + String.raw`['"\`]`, 'g')
  for (const m of kodsuz.matchAll(rawUrl)) {
    const window = kodsuz.slice(m.index ?? 0, (m.index ?? 0) + 700)
    if (/method\s*:\s*['"`]POST['"`]/i.test(window)) return true
  }
  return false
}

/**
 * `purchase_orders.status` sözlüğünü SON TANIMLAYAN migration'dan çıkarır.
 * CI bayt sırasıyla uygular (T052 deseni) — son tanım kazanır.
 */
function statusDictFromMigrations(): { file: string; statuses: string[] } | null {
  const defs = Object.entries(migrationSql)
    .filter(([, sql]) => /create table[^;]*purchase_orders/i.test(sql) || /purchase_orders[\s\S]*?status in \(/i.test(sql))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  for (let i = defs.length - 1; i >= 0; i--) {
    const [file, sql] = defs[i]
    // `status in ('a', 'b', ...)` listesini, purchase_orders tanımının içinden çek.
    const tableIdx = sql.search(/create table[^;]*purchase_orders|alter table[^;]*purchase_orders/i)
    if (tableIdx === -1) continue
    const scope = sql.slice(tableIdx)
    const m = scope.match(/status in \(([^)]+)\)/i)
    if (!m) continue
    const statuses = [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1])
    if (statuses.length > 0) return { file, statuses }
  }
  return null
}

/**
 * `purchase_orders` SELECT politikasının rol dizisini SON TANIMLAYAN migration'dan çıkarır.
 * (R1a ile aynı "son tanım kazanır" mantığı — politika `drop policy if exists` + `create`
 * ile yeniden yazılabilir.)
 */
function selectPolicyRolesFromMigrations(): { file: string; roles: string[] } | null {
  const defs = Object.entries(migrationSql)
    .filter(([, sql]) => /create policy\s+purchase_orders_admin_select/i.test(sql))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  for (let i = defs.length - 1; i >= 0; i--) {
    const [file, sql] = defs[i]
    const idx = sql.search(/create policy\s+purchase_orders_admin_select/i)
    if (idx === -1) continue
    // Politika gövdesi bir sonraki `;`'e kadar.
    const body = sql.slice(idx, sql.indexOf(';', idx) + 1)
    const m = body.match(/array\s*\[([^\]]+)\]/i)
    if (!m) continue
    const roles = [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1])
    if (roles.length > 0) return { file, roles }
  }
  return null
}

describe('INV-PURCH-1 — satınalma sözleşmeleri', () => {
  it('parser sağlığı: sentetik pozitif/negatif ayırt ediliyor', () => {
    const dogrudanYazan =
      "await supabase.from('goods_receipts').insert({ po_id: id, document_no: no })"
    const rpcCagiran = "await supabase.rpc('process_goods_receipt', { p_po_id: id })"
    const yorumdaAnan =
      "// process_goods_receipt burada anlatılıyor ama çağrılmıyor\nconst x = 1"
    const motorCagiran = 'await refreshCostInBase(supabase)'
    const motoruYorumdaAnan = '// refreshCostInBase zinciri v1 KAPALI\nconst y = 2'

    expect(directTableWrite(dogrudanYazan, 'goods_receipts')).toBe(true)
    expect(directTableWrite(rpcCagiran, 'goods_receipts')).toBe(false)
    expect(callsReceiptRpc(rpcCagiran)).toBe(true)
    expect(callsReceiptRpc(yorumdaAnan)).toBe(false)
    expect(/\brefreshCostInBase\s*\(/.test(stripComments(motorCagiran))).toBe(true)
    expect(/\brefreshCostInBase\s*\(/.test(stripComments(motoruYorumdaAnan))).toBe(false)
    // CRLF-güvenlik: satır yorumu \r\n ile bitse de sıyrılır.
    expect(stripComments('// yorum refreshCostInBase(\r\nconst z = 3')).not.toMatch(/refreshCostInBase/)
  })

  it('R1a — modül sözlüğü ↔ migration CHECK birebir aynı (T052: sözlük iki yerde ayrı yaşayamaz)', () => {
    const fromDb = statusDictFromMigrations()
    expect(
      fromDb,
      'purchase_orders status CHECK listesi hiçbir migration\'da bulunamadı — tarayıcı kör olabilir, önce onu onar.',
    ).not.toBeNull()
    if (!fromDb) return

    expect(
      [...fromDb.statuses].sort(),
      [
        `Statü sözlüğü ayrıştı: modül (poStatusMachine.PO_STATUSES) ile ${fromDb.file} CHECK listesi farklı.`,
        'İkisinden birini değiştirdiysen diğerini AYNI PR\'da güncelle (cetvel §3).',
      ].join('\n'),
    ).toEqual([...PO_STATUSES].sort())
  })

  it('R1b — ikinci geçiş haritası yok: PO statülerini dizi-değerli anahtar yapan tek dosya makine', () => {
    const violations: string[] = []
    for (const [path, src] of Object.entries(productionSources)) {
      if (path.endsWith('/lib/purchasing/poStatusMachine.ts')) continue
      const kodsuz = stripComments(src)
      // Geçiş haritası imzası: statü adı ANAHTAR ve değeri DİZİ. Etiket sözlükleri
      // (statü → metin) string değer taşır ve bu desene UYMAZ.
      if (/\bpartially_received['"]?\s*:\s*\[/.test(kodsuz)) {
        violations.push(path)
      }
    }
    expect(
      violations,
      'İkinci bir PO geçiş haritası bulundu — SSOT src/lib/purchasing/poStatusMachine.ts (cetvel §3):\n' +
        violations.join('\n'),
    ).toEqual([])
  })

  it('R2a — istemci kodu goods_receipts / purchase_receipt hareketini DOĞRUDAN yazamaz', () => {
    const violations: string[] = []
    for (const [path, src] of Object.entries(productionSources)) {
      if (directTableWrite(src, 'goods_receipts')) {
        violations.push(`${path} → goods_receipts'e doğrudan insert`)
      }
      // purchase_receipt kanıt satırını elle yazmak = RPC'yi atlamak.
      const kodsuz = stripComments(src)
      if (
        directTableWrite(src, 'inventory_movements') &&
        /['"`]purchase_receipt['"`]/.test(kodsuz)
      ) {
        violations.push(`${path} → purchase_receipt hareketini elle yazıyor`)
      }
    }
    expect(
      violations,
      [
        'Stok girişi RPC dışı bir yoldan yazılıyor. TEK yazma yolu process_goods_receipt',
        '(cetvel §4): kanıt satırı + miktar tavanı + idempotens + statü türetme hep RPC içinde.',
        ...violations,
      ].join('\n'),
    ).toEqual([])
  })

  it('R2b — parser sağlığı (gerçek çapa): purchasing.service RPC\'yi ÇAĞRI biçimiyle kullanıyor', () => {
    const servicePath = Object.keys(productionSources).find((p) =>
      p.endsWith('/lib/services/purchasing.service.ts'),
    )
    expect(
      servicePath,
      'purchasing.service.ts bulunamadı — dosya taşındıysa bu bekçiyi de güncelle.',
    ).toBeDefined()
    if (!servicePath) return
    expect(
      callsReceiptRpc(productionSources[servicePath]),
      'purchasing.service artık process_goods_receipt RPC\'sini çağırmıyor görünüyor. ' +
        'Çağrı biçimi değiştiyse ÖNCE callsReceiptRpc tarayıcısını uyarla; RPC gerçekten ' +
        'kaldırıldıysa bu, cetvel §4 ihlalidir.',
    ).toBe(true)
  })

  it('R3 — satınalma dosyaları purchase_price/purchase_currency/purchase_rate_to_base YAZMAZ', () => {
    // Kapsam sağlığı: satınalma dosyaları gerçekten taranıyor mu?
    expect(Object.keys(purchasingSources).length).toBeGreaterThanOrEqual(2)

    const violations: string[] = []
    for (const [path, src] of Object.entries(purchasingSources)) {
      const kodsuz = stripComments(src)
      for (const field of ['purchase_price', 'purchase_currency', 'purchase_rate_to_base']) {
        // Yazma biçimi: nesne anahtarı (`alan:`) ya da atama. Salt-okuma select dizeleri uymaz.
        if (new RegExp(String.raw`\b` + field + String.raw`\s*:`).test(kodsuz)) {
          violations.push(`${path} → ${field}`)
        }
      }
    }
    expect(
      violations,
      [
        'Satınalma modülü katalog fiyat alanına yazıyor (cetvel §5.2 — Recep kararı):',
        'purchase_price = katalog liste fiyatı ve fiyat motorunun CANLI girdisi.',
        'Gerçek alış maliyeti PO satırı snapshot\'ı + products.last_purchase_* ile taşınır.',
        ...violations,
      ].join('\n'),
    ).toEqual([])
  })

  it('R4 — mal kabul motor zincirini ÇAĞIRMAZ: köprü v1 KAPALI (cetvel §5.4)', () => {
    expect(Object.keys(purchasingSources).length).toBeGreaterThanOrEqual(2)

    const violations: string[] = []
    for (const [path, src] of Object.entries(purchasingSources)) {
      const kodsuz = stripComments(src)
      for (const fn of ['refreshCostInBase', 'materializePrices']) {
        const call = new RegExp(String.raw`\b` + fn + String.raw`\s*\(`)
        const importForm = new RegExp(String.raw`import[^\r\n]*\b` + fn + String.raw`\b`)
        if (call.test(kodsuz) || importForm.test(kodsuz)) {
          violations.push(`${path} → ${fn}`)
        }
      }
    }
    expect(
      violations,
      [
        'Satınalma kodu fiyat motoru zincirine dokunuyor — köprü v1\'de BİLEREK KAPALI',
        '(cetvel §5.4, Recep kararı). Açmak bir refactor değil TASARIM işidir: cost_source',
        'politikası + fx_lock uyumu + render tetikleri + bu bekçinin güncellenmesi BİRLİKTE',
        'gelir; beş şartın listesi cetveldedir.',
        ...violations,
      ].join('\n'),
    ).toEqual([])
  })

  /*
    R6 — UI izni, DB izninin ötesine geçemez (cetvel §8.1).

    Bu kural 2026-08-16'da ÖLÇÜLEN gerçek bir kusurdan doğdu: D4'te `warehouse` rolüne
    /admin/purchasing sayfa+yazma izni verildi, çünkü mal kabul RPC'si (adjust_stock
    deseni) warehouse'u kabul ediyor. Ama satınalma tablolarının RLS SELECT'i
    (pricing_policy deseni — maliyet hassas) warehouse'u İÇERMİYOR. Sonuç: kullanıcı
    sayfayı açar, RLS boş küme döndürür, ekranda "kayıt yok" yazar ve HİÇBİR HATA
    DÜŞMEZ — yetki eksiği boş veriye benzer. İki meşru desen çarpıştı; kesişimini
    kimse ölçmüyordu.

    Kapsam bilerek DAR: yalnız YAZMA izni. Yazma izni olan rol listeyi görmek
    ZORUNDADIR. Salt-okur `viewer` ('*' sayfa jokeri taşır) kapsam dışıdır — onun
    RLS'lerle ilişkisi satınalmaya özgü değil, ayrı ve daha geniş bir sorudur;
    buraya çekmek yanlış-KIRMIZI üretirdi.
  */
  it('R6 — purchasing YAZMA izni olan her rol, RLS SELECT politikasında da var (sessiz-boş yasağı)', () => {
    const policy = selectPolicyRolesFromMigrations()
    expect(
      policy,
      'purchase_orders_admin_select politikası hiçbir migration\'da bulunamadı — tarayıcı kör olabilir.',
    ).not.toBeNull()
    if (!policy) return

    const ALL_ROLES: UserRole[] = [
      'super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer', 'user',
    ]
    // canWrite'ı ÇAĞIRIR (matrisi regex'le okumaz): rbac'ın gerçek kararı neyse o.
    const writeRoles = ALL_ROLES.filter((r) => canWrite(r, 'purchasing'))
    const missing = writeRoles.filter((r) => !policy.roles.includes(r))

    expect(
      missing,
      [
        'Bu role UI\'da satınalma YAZMA izni verilmiş ama RLS SELECT politikası onu tanımıyor.',
        'Kullanıcı sayfayı açar, boş liste görür, hata almaz — SESSİZ-BOŞ (cetvel §8.1).',
        '',
        `RLS rolleri (${policy.file}): ${policy.roles.join(', ')}`,
        `rbac yazma rolleri: ${writeRoles.join(', ')}`,
        `EKSİK: ${missing.join(', ')}`,
        '',
        'İki doğru çözüm var; "izni geri ekle" tek başına ÇÖZÜM DEĞİL:',
        ' (a) rolü rbac\'tan çıkar (UI, DB\'nin verdiğiyle hizalanır) — migration gerekmez;',
        ' (b) maliyetsiz görünüm + o role SELECT ver, UI görünümü okusun (§8.1 v1.1 şartları).',
      ].join('\n'),
    ).toEqual([])
  })

  it('R5 — RPC\'yi çağıran her dosya zarfın success alanını okur (HTTP 200 ≠ başarı, T052)', () => {
    const violations: string[] = []
    for (const [path, src] of Object.entries(productionSources)) {
      if (!callsReceiptRpc(src)) continue
      if (!/\bsuccess\b/.test(stripComments(src))) {
        violations.push(path)
      }
    }
    expect(
      violations,
      'process_goods_receipt çağıran dosya `success` alanını hiç okumuyor — PostgREST,\n' +
        'gövde success:false olsa da HTTP 200 döner (T052 dersi):\n' +
        violations.join('\n'),
    ).toEqual([])
  })
})
