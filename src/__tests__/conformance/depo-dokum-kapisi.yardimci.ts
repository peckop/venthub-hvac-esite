// INV-DEPO-DOKUM-1 test yardımcıları (ortak): kapı yükleyici, sahte git deposu kurucuları, sahte işaretçi değerler.
// Test DEĞİLDİR (vitest yalnız *.test.ts toplar). Gerçek değer taşımaz.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'



export const KOK = path.resolve(__dirname, '../../..')
export const BETIK = path.join(KOK, 'scripts/security/depo-dokum-kapisi.cjs')
export const KANCA = path.join(KOK, '.githooks/pre-push')
export const CI_YOLU = path.join(KOK, '.github/workflows/ci.yml')
export const GITIGNORE_YOLU = path.join(KOK, '.gitignore')
export const TABAN_YOLU = path.join(KOK, 'supabase/baselines/2026-10-05_public_schema.sql')

export type Bulgu = { kural: string; ayrinti: string }
export type Kayit = { kural: string; ad: string; dosya: string; ayrinti: string }
export type OlculemediKaydi = { dosya: string; ayrinti: string }
export type IzinKaydi = { yol: string; kural: string; blob?: string; neden?: string; kanit?: string }
export type TaramaSonucu = {
  ihlaller: Kayit[]
  izinliler: Kayit[]
  olculemedi: OlculemediKaydi[]
  taranan: { dosya: number; veri: number; blob?: number }
}
export type Kapi = {
  VERI_UZANTILARI: readonly string[]
  KISISEL_ALANLAR: readonly string[]
  KISISEL_GENEL_ALANLAR: readonly string[]
  KISISEL_ESIK: number
  HASSAS_TABLOLAR: readonly string[]
  FIYAT_ESIGI: number
  KURALLAR: Readonly<Record<string, string>>
  YOL_KURALLARI: ReadonlyArray<{ ad: string }>
  IZIN_KURALLARI: readonly string[]
  IZIN_LISTESI: readonly IzinKaydi[]
  KISISEL_GENEL_KOKLER: readonly string[]
  KISISEL_GENEL_PARCALAR: readonly string[]
  KISISEL_GENEL_SON_PARCALAR: readonly string[]
  KISISEL_BELIRGIN_KOKLER: readonly string[]
  norm: (s: string) => string
  kisiselAlanSinifi: (ad: string) => 'belirgin' | 'genel' | null
  sqliteImzasiMi: (kok: string) => (yol: string) => boolean
  gitBlobu: (kok: string, env: NodeJS.ProcessEnv) => (yol: string) => string | null
  yolIhlali: (yol: string) => string[]
  pozitifSayi: (v: unknown) => boolean
  metneCevir: (t: Buffer) => string
  csvAyristir: (metin: string, ayrac: string) => string[][]
  sqlIfadeleri: (sql: string) => string[]
  dosyaTara: (yol: string, metin: string) => Bulgu[]
  dosyaDegerlendir: (yol: string, metin: string) => { bulgular: Bulgu[]; olculemedi: string[] }
  tara: (g: {
    dosyalar: string[]
    oku: (yol: string) => string | null
    izin?: readonly IzinKaydi[]
    ikili?: (yol: string) => boolean
    blobOf?: (yol: string) => string | null
  }) => TaramaSonucu
  yeniNesneleriTara: (g: {
    kok: string
    ucler: string[]
    haric?: string[]
    izin?: readonly IzinKaydi[]
    nesneTavani?: number
    okumaTavani?: number
  }) => TaramaSonucu
  itilecekUclar: (stdin: string) => string[]
  diskOkuyucu: (kok: string, sinir?: number) => (yol: string) => string | null
  calistir: (
    argv: string[],
    ortam?: {
      cwd?: string
      env?: NodeJS.ProcessEnv
      yaz?: (s: string) => void
      hata?: (s: string) => void
      izin?: readonly IzinKaydi[]
      stdin?: string
    },
  ) => number
}

export const kapi = createRequire(import.meta.url)(BETIK) as Kapi

/** Dosya içeriğinin hangi kuralları tetiklediği (sıralı, tekil). */
export const kurallar = (yol: string, metin: string): string[] =>
  [...new Set(kapi.dosyaTara(yol, metin).map((b) => b.kural))].sort()

/** Test sahipliğinde, bilerek BAĞIMSIZ yazılmış beklenen listeler: kapıdaki liste değişirse kırmızı. */
export const BEKLENEN_KISISEL = ['customer_email', 'customer_phone', 'customer_name', 'billing_address', 'shipping_address']
export const BEKLENEN_KISISEL_EK = ['invoice_info', 'tckn', 'card_number', 'card_token', 'card_user_key', 'cvc', 'invoice_profile']
export const BEKLENEN_GENEL = [
  'email',
  'e_mail',
  'full_name',
  'phone',
  'phone_number',
  'first_name',
  'last_name',
  'contact_name',
  'contact_email',
  'contact_phone',
  'address_line',
  'full_address',
  'street_address',
  'postal_code',
  'tax_no',
  'tax_number',
  'tax_office',
  'ip_address',
]
export const BEKLENEN_HASSAS_TABLOLAR = [
  'user_profiles',
  'contact_messages',
  'suppliers',
  'user_addresses',
  'user_invoice_profiles',
  'venthub_orders',
  'product_costs',
  // ALT-39 2. tur (O2): şema tabanı taraması
  'data_subject_requests',
  'order_email_events',
  'quote_email_events',
  'shipping_email_events',
  'inventory_settings',
  'venthub_quotes',
  'wizard_selections',
]

// Uydurma işaretçi değerler: çıktıda ASLA geçmemeli. (BOM, kaçış dizisi yazmadan kod noktasıyla kurulur.)
export const BOM = String.fromCharCode(0xfeff)
export const GIZLI_EPOSTA = 'gizli.kisi.7f3a@ornek.test'
export const GIZLI_AD = 'Gizli Kisi 7f3a'
export const GIZLI_ADRES = 'Gizli Mahalle 7f3a Sokak 12'
export const GIZLI_FIYAT = '98765.43'
export const GIZLI_BIN = '531234'
export const GIZLI_SON4 = '4321'

// ── Sahte git deposu ──────────────────────────────────────────────────────────────────────────

export const gecici: string[] = []

/** GIT_* ve GITHUB_* üst sürecin ortamından alınmaz: kanca/CI içinde koşulsa da test sahte depoya bakar. */
export function temizOrtam(ek: Record<string, string> = {}): NodeJS.ProcessEnv {
  // `NodeJS.ProcessEnv` bu projede zorunlu anahtarlarla genişletilmiş (NODE_ENV, NEXT_PUBLIC_*): boş `{}` atanamaz,
  // bu yüzden `process.env` yayılır, sonra temizlenir. Önce temizlik, SONRA `ek`: GitHub kolları değişkenini kendisi verir.
  const env: NodeJS.ProcessEnv = { ...process.env }
  for (const k of Object.keys(env)) {
    if (k.startsWith('GIT_') || k.startsWith('GITHUB_')) delete env[k]
  }
  return { ...env, ...ek }
}

export const GIT_AYAR = ['-c', 'user.name=test', '-c', 'user.email=test@ornek.test', '-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false']

export function gitCikti(dizin: string, ...args: string[]): string {
  const r = spawnSync('git', [...GIT_AYAR, ...args], { cwd: dizin, env: temizOrtam(), encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} başarısız: ${r.stderr}`)
  return r.stdout.trim()
}

export function git(dizin: string, ...args: string[]): void {
  gitCikti(dizin, ...args)
}

export function geciciDizin(on: string): string {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), on))
  gecici.push(d)
  return d
}

export function yaz(dizin: string, yol: string, icerik: string | Buffer): void {
  const mutlak = path.join(dizin, yol)
  fs.mkdirSync(path.dirname(mutlak), { recursive: true })
  fs.writeFileSync(mutlak, icerik)
}

/** `dosyalar` ile geçici bir git deposu kurar ve hepsini İNDEKSE ekler (commit gerekmez). */
export function sahteDepo(dosyalar: Record<string, string | Buffer>): string {
  const dizin = geciciDizin('depo-dokum-')
  git(dizin, 'init', '-q')
  for (const [yol, icerik] of Object.entries(dosyalar)) yaz(dizin, yol, icerik)
  git(dizin, 'add', '-A')
  return dizin
}

export function kapiyiKos(dizin: string, ek: string[] = [], env: Record<string, string> = {}, girdi?: string) {
  const r = spawnSync(process.execPath, [BETIK, '--kok', dizin, ...ek], {
    env: temizOrtam(env),
    encoding: 'utf8',
    input: girdi,
  })
  return { kod: r.status, cikti: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

export function commitle(dizin: string, mesaj: string): string {
  git(dizin, 'add', '-A')
  git(dizin, 'commit', '-q', '--allow-empty', '-m', mesaj)
  return gitCikti(dizin, 'rev-parse', 'HEAD')
}


/** Her test dosyası `afterAll(geciciTemizle)` ile çağırır. */
export function geciciTemizle(): void {
  for (const d of gecici) fs.rmSync(d, { recursive: true, force: true })
}
