import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-CRON-1 — periyodik koşması GEREKEN uçların gerçekten bir çağıranı var.
 *
 * NİÇİN VAR (T095-VH · 2026-08-19 · prod'da ölçüldü)
 *
 * Bu, kod incelemesinin YAPISI GEREĞİ göremediği bir kusur sınıfıdır: kodda hata
 * YOKTUR. `order-housekeeping` iki dalıyla da doğru yazılmıştı — token yoksa 30
 * dakika sonra iptal, token varsa 15 dakika sonra bir kez mutabakat ve tutmazsa
 * iptal. Eksik olan şey kodun DIŞINDAYDI: onu çağıran hiçbir şey yoktu.
 *
 * ÖLÇÜM (2026-08-19, prod):
 *   · cron.job tablosunda TEK iş vardı — tcmb-rates-sync-daily.
 *   · Depoda hiçbir workflow / istemci kodu bu uçları çağırmıyordu.
 *   · Sonuç: 5 sipariş `pending` durumunda asılı kaldı (en eskisi ~23 saat),
 *     hiçbirinde ödeme işlemi satırı ve stok hareketi yoktu.
 *
 * AYNI SINIF DAHA ÖNCE DE GÖRÜLDÜ: T061'de `stock-alert`'in tüm-katalog taraması
 * yalnızca bir SATIŞ anında çalışıyordu — yani alarmın koşması, alarmı gereksiz
 * kılan olaya bağlıydı. O zaman tek fonksiyon için nokta atışı bir iddia yazıldı
 * (`shipping-alarm-ops`). Bu kapı sınıfı KAPATIR: liste büyüdükçe kapsam da büyür,
 * her yeni uç için ayrı bir kapı yazmak gerekmez.
 *
 * SINIR — DÜRÜSTÇE: bu kapı DEPOYU okur, prod'u değil. "Workflow dosyası var"
 * demek "iş gerçekten koşuyor" demek DEĞİLDİR (sır eksikse iş düşer, iş elle
 * devre dışı bırakılabilir). Kapının vaadi dar ve nettir: çağıran DOSYA düzeyinde
 * kaybolursa kırmızı yanar. Koşumun kendisi iş kaydından (Actions) izlenir.
 */
const KOK = path.resolve(__dirname, '../../..')
const WORKFLOW_DIR = path.join(KOK, '.github/workflows')

/**
 * Zamanlanmış çağıranı ZORUNLU olan uçlar. Yeni bir "periyodik" uç eklendiğinde
 * buraya da eklenir; eklenmezse kapı onu göremez (kapsam listesi cetvelin parçası).
 */
const ZAMANLANMASI_GEREKENLER: Array<{ fonksiyon: string; nicin: string }> = [
  {
    fonksiyon: 'order-housekeeping',
    nicin:
      'Ödenmemiş pending siparişi kapatır. Çağıran yokken 5 sipariş ~23 saat asılı kaldı (T095-VH).',
  },
  {
    fonksiyon: 'release-expired-reservations',
    nicin:
      'Rezervasyon süresi dolan siparişleri süpürür ve stok geri-vermesini KANITA bağlı dener (T095-VH).',
  },
  {
    fonksiyon: 'stock-alert',
    nicin:
      'Tüm-katalog düşük stok taraması. Çağıran yokken alarm yalnız SATIŞ anında kuruluyordu (T061-VH).',
  },
]

const workflowlar: Record<string, string> = Object.fromEntries(
  readdirSync(WORKFLOW_DIR)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => [f, readFileSync(path.join(WORKFLOW_DIR, f), 'utf8')]),
)

/** Yorum satırları sıyrılır: gerekçe metninde geçen ad ÇAĞIRAN sayılmaz. */
function yorumsuz(kaynak: string): string {
  return kaynak
    .split(/\r?\n/)
    .filter((s) => !/^\s*#/.test(s))
    .join('\n')
}

describe('INV-CRON-1 — periyodik uçların zamanlanmış çağıranı var', () => {
  it('ölçüm yüzeyi boş değil (kapı kendi ön koşulunu doğrular)', () => {
    expect(Object.keys(workflowlar).length).toBeGreaterThan(5)
    expect(ZAMANLANMASI_GEREKENLER.length).toBeGreaterThan(0)
  })

  it.each(ZAMANLANMASI_GEREKENLER)('$fonksiyon için zamanlanmış bir iş var', ({ fonksiyon, nicin }) => {
    const bulunan = Object.entries(workflowlar)
      .filter(([, ham]) => {
        const govde = yorumsuz(ham)
        return govde.includes(fonksiyon) && /^\s*schedule:/m.test(govde)
      })
      .map(([ad]) => ad)

    expect(
      bulunan,
      `${fonksiyon} için 'schedule:' içeren bir workflow YOK. ${nicin} ` +
        'Yetenek var, tetikleyici yok — kodda hata görünmez, ama iş hiç koşmaz.',
    ).not.toEqual([])
  })

  it.each(ZAMANLANMASI_GEREKENLER)('$fonksiyon gerçekten var (ölü kayıt birikmesin)', ({ fonksiyon }) => {
    expect(
      existsSync(path.join(KOK, 'supabase/functions', fonksiyon, 'index.ts')),
      `${fonksiyon} listede duruyor ama uç dosyası yok — liste bayatlamış.`,
    ).toBe(true)
  })
})
