import { describe, expect, it } from 'vitest'

import { ADMIN_RESOURCES } from '../../config/admin-resources'
import {
  canAccessPage,
  canWrite,
  ENTITY_TO_RESOURCE,
  RESERVED_WRITE_ENTITIES,
  type UserRole,
} from '../../lib/rbac'

/**
 * INV-RBAC-DRIFT-1 · Arayüz yetki matrisi ile kaynak defteri arasındaki SÜRÜKLENME kapısı.
 *
 * Cetvel: `rbac.ts:10-13` — **ilke ZATEN YAZILI**: "UI izni, DB'nin gerçekten verdiğinin
 * ötesine geçemez." Kusur bir kural EKSİKLİĞİ değil, yazılı kuralın KAPSAM eksikliğidir;
 * ikisi farklı onarım ister (biri kural yazmak, öteki kapsam kapatmak). Bu kapı ikincisini
 * mekanikleştirir. (Tespit AUTH şeridinden geldi.)
 *
 * NİÇİN VAR — ölçülmüş boşluk (2026-08-20):
 * `ROLE_PAGE_ACCESS` `moderator` ve `viewer` rollerine `'*'` veriyordu; canlı `pg_policy`
 * ölçümü ise moderator'a SELECT veren **yalnız yedi tablo** buldu. Sonuç: rol sayfayı
 * AÇABİLİYOR, RLS satır VERMİYOR, ekran "kayıt yok" basıyor — *yetkin yok* demiyor.
 * Buna **sessiz-boş** diyoruz ve bugüne dek üç rotada **elle guard** ile yamandı
 * (`/admin/users`, `/admin/data-requests`, `/admin/invoices`) — yani her yeni rota kusuru
 * yeniden doğuruyordu.
 *
 * ⚠ **BU KAPININ ÖLÇMEDİĞİ — okuyan bunu bilmeden yeşile güvenmesin:**
 * Kapı **statiktir**: kod ile kod arasını ölçer. *"Şu rolün listesindeki rota, DB'nin
 * gerçekten okuma verdiği bir yüzey mi"* sorusunu **ÖLÇEMEZ** — o soru canlı veritabanı
 * ister (CI'da kimlik bilgisi yok; olsaydı da ağ bağımlılığı flake üretirdi).
 * Yani bu kapı yeşilken bile listenin *içeriği* yanlış olabilir. Canlı taraf ayrı bir
 * BETİK işidir (kapı değil, rapor). Yeşili "liste doğrulandı" diye okumak, kapının
 * söylemediğini söyletmektir.
 *
 * KANIT — kapı KASITLI BOZMA ile sınandı (2026-08-20, AUTH commit 8b03d021 tabanında).
 * Beş sabotaj, beş assert; her biri **yalnız kendi** testini kırdı (5 passed | 1 failed):
 *   S1  moderator: ['*']                       → A   (yıldız geri geldi)
 *   S2  data_requests → 'dataRequestsYOK'       → 1   (defterde olmayan anahtar)
 *   S3  orders eşlemeden silindi                → 2   (çağrılan varlık bilinmiyor)
 *   S4  orders REZERVE listesine eklendi        → 3b  (bayat muafiyet)
 *   S5  webhook_events rezerveden düşürüldü     → 3a  (ölü izin)
 * Bu ölçüm ÖNCE commit'siz tabanda denenmiş ve S1 yeşil dönmüştü — düzenleme diske
 * uygulanmamıştı, yani o yeşil kapının değil ÖLÇÜMÜN kusuruydu. Sabotaj, taze artefakt
 * üzerinde koşulmazsa kapıyı değil kendini sınar.
 */

/** `'*'` taşıyan rol, var olmayan bir yola bile ERİŞİR — davranıştan okunur, sabitten değil. */
const OLMAYAN_ROTA = '/admin/__inv-rbac-drift-1-olmayan-rota__'

/** `'*'` taşıması KABUL EDİLEN roller. Başkası taşırsa sessiz-boş sınıfı geri döner. */
const YILDIZ_SERBEST: ReadonlySet<UserRole> = new Set<UserRole>(['super_admin', 'admin'])

const TUM_ROLLER: readonly UserRole[] = [
  'super_admin', 'admin', 'moderator', 'warehouse', 'sales', 'viewer', 'user',
]

/** Defterdeki gerçek anahtarlar — "bu varlık gerçekten var mı" sorusunun tek yeri. */
const DEFTER_ANAHTARLARI = new Set(ADMIN_RESOURCES.map((r) => r.key))

/**
 * Kaynakta GERÇEKTEN çağrılan varlıklar.
 *
 * İki çağrı biçimi var ve **ayırt edilmeleri şart**:
 *   · `canWrite('orders')`            — `useRole()` kancası, TEK argüman → argüman VARLIK
 *   · `canWrite('warehouse','orders')` — modül fonksiyonu, İKİ argüman → ilki ROL
 * Tek argümanlıyı arayan desen, iki argümanlıların ROL adını da yakalar
 * (`rbac.test.ts` içinde canlı örnekleri var). Bu yüzden rol adları AÇIKÇA ayıklanır —
 * sessizce filtrelemek, kapının neyi ölçmediğini gizlerdi.
 */
const KAYNAKLAR: Record<string, string> = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const ROL_ADLARI: ReadonlySet<string> = new Set<string>(TUM_ROLLER)

function cagrilanVarliklar(): Set<string> {
  const out = new Set<string>()
  for (const metin of Object.values(KAYNAKLAR)) {
    for (const m of metin.matchAll(/canWrite\(\s*'([^']+)'/g)) {
      const aday = m[1]
      if (ROL_ADLARI.has(aday)) continue // iki argümanlı çağrının ROL argümanı
      out.add(aday)
    }
  }
  return out
}

/** Bir varlığı super_admin DIŞINDA yazabilen rol var mı? (`'*'` yüzünden o hariç tutulur) */
function matristeMi(entity: string): boolean {
  return TUM_ROLLER.filter((r) => r !== 'super_admin').some((r) => canWrite(r, entity))
}

describe('INV-RBAC-DRIFT-1 · yetki matrisi ↔ kaynak defteri sürüklenmesi', () => {
  it('R0 — ölçüm araçları KÖR DEĞİL (sahte-yeşil kilidi)', () => {
    // Defter ve çağrı taraması boşalırsa aşağıdaki testler sıfır eleman üzerinde koşup GEÇER.
    expect(DEFTER_ANAHTARLARI.size).toBeGreaterThan(20)
    expect(cagrilanVarliklar().size).toBeGreaterThan(10)
    expect(Object.keys(ENTITY_TO_RESOURCE).length).toBeGreaterThan(10)
    // Negatif kontrol: super_admin var olmayan yola erişebilmeli (yıldız gerçekten çalışıyor).
    expect(canAccessPage('super_admin', OLMAYAN_ROTA)).toBe(true)
  })

  it('A — admin/super_admin DIŞINDA hiçbir rol sayfa matrisinde yıldız taşımaz', () => {
    const yildizli = TUM_ROLLER
      .filter((r) => !YILDIZ_SERBEST.has(r))
      .filter((r) => canAccessPage(r, OLMAYAN_ROTA))
    expect(
      yildizli,
      `Bu roller VAR OLMAYAN bir rotaya bile erişiyor — sayfa matrisinde yıldız taşıyorlar. ` +
        `Yıldız, RLS'in gerçekte ne verdiğini GÖRÜNMEZ kılar ve sessiz-boş ekran üretir: ${yildizli.join(', ')}`,
    ).toEqual([])
  })

  it('1 — her rbac varlığı defterde GERÇEKTEN var olan bir anahtara eşleniyor', () => {
    const kirik = Object.entries(ENTITY_TO_RESOURCE)
      .filter(([, key]) => !DEFTER_ANAHTARLARI.has(key))
      .map(([entity, key]) => `${entity} → ${key}`)
    expect(
      kirik,
      `ENTITY_TO_RESOURCE bir varlığı defterde OLMAYAN anahtara bağlıyor. Eşleme, iki ` +
        `sözlüğün tesadüfi örtüşmesini DENETLENEN bir sözleşmeye çevirir; kırılırsa ` +
        `sürüklenme sessizleşir: ${kirik.join(' · ')}`,
    ).toEqual([])
  })

  it('2 — kaynakta çağrılan her varlık BİLİNEN varlıktır (eşlemede tanımlı)', () => {
    const bilinmeyen = [...cagrilanVarliklar()].filter((e) => !(e in ENTITY_TO_RESOURCE))
    expect(
      bilinmeyen,
      `Kod bu varlıklarla canWrite çağırıyor ama eşlemede yoklar. Yeni bir ekran varlığını ` +
        `eşlemeye eklemeyi unutursa canWrite sessizce FALSE döner ve o ekranın yazma ` +
        `düğmeleri kimsede görünmez: ${bilinmeyen.join(', ')}`,
    ).toEqual([])
  })

  it('3a — matriste olup HİÇ çağrılmayan varlık ya kullanılır ya REZERVE listesindedir', () => {
    const cagrilan = cagrilanVarliklar()
    const rezerve = new Set(RESERVED_WRITE_ENTITIES)
    const olu = Object.keys(ENTITY_TO_RESOURCE)
      .filter((e) => matristeMi(e))
      .filter((e) => !cagrilan.has(e) && !rezerve.has(e))
    expect(
      olu,
      `Bu varlıklar bir rolün yazma listesinde duruyor ama hiçbir yüzeyden çağrılmıyor ve ` +
        `REZERVE listesinde de değiller. Ölü izin, silinmiş yeteneğin ölü kod gibi ` +
        `saklanmasıdır: ${olu.join(', ')}`,
    ).toEqual([])
  })

  it('3b — REZERVE listesi BÜYÜMEZ; kullanılan varlık listede kalmaz', () => {
    // Liste boşalmalı. Çağrılmaya başlamış bir varlık hâlâ "rezerve" duruyorsa liste bayattır
    // ve bayat muafiyet kendi kapısını kör eder.
    const cagrilan = cagrilanVarliklar()
    const bayat = RESERVED_WRITE_ENTITIES.filter((e) => cagrilan.has(e))
    expect(
      bayat,
      `Bu varlıklar artık ÇAĞRILIYOR, yani rezerve değiller — listeden çıkarılmalı: ${bayat.join(', ')}`,
    ).toEqual([])
  })
})
