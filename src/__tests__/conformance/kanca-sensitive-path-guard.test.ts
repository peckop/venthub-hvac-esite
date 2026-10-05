import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

/**
 * INV-KANCA-HASSAS-YOL-1 · `sensitive-path-guard` kancasının KARARI ölçülür.
 *
 * ÖLÇÜLMÜŞ KUSUR (REC-306, 2026-09-12): bu kancanın davranışını ölçen hiçbir test yoktu.
 * Kanca iki sınıfı ayırır ve ayrımı YANLIŞ yapması iki yönde de pahalıdır:
 *   · `.env` ailesi → **deny**. Repo 2026-08-15'ten beri PUBLIC ve geçmiş silinemez; bir sır
 *     commit'lenirse geri dönüşü yok. Kanca burada kaçırırsa hasar kalıcıdır.
 *   · `supabase/migrations/**` → **ask**. Kural 13: migration içeren dal master'a merge
 *     edilince prod DB'ye OTOMATİK uygulanır. Dosyayı yazmak masum görünür, zincirin ucu prod.
 *
 * ⭐SÖZLEŞME FARKI, ADIYLA: bu kanca çıkış KODUYLA konuşmaz. Karar verirken stdout'a
 * `hookSpecificOutput.permissionDecision` basar ve **daima exit 0** verir. "Exit 0 = izin
 * verdi" varsayımı bu kancada YANLIŞTIR — ölçüt stdout'taki karardır. Bu, `exit 2` kullanan
 * kardeş kancalardan (lane-guard, protect-config) bilinçli bir ayrılıktır.
 *
 * Cetvel: `docs/standards/fleet-mechanism-standard.md` · CLAUDE.md kural 13 ·
 * `execution-method-standard.md` §8.1.
 */

const KANCA = path.resolve(__dirname, '../../../.claude/hooks/sensitive-path-guard.cjs')

interface Sonuc {
  kod: number | null
  karar: string | null
  sebep: string
  stderr: string
}

/** Kancayı koşar ve stdout'taki KARARI çözer (yoksa karar = null, yani karışmadı). */
function kos(file_path: string, secenek: { cwd?: string; hamGirdi?: string } = {}): Sonuc {
  const r = spawnSync(process.execPath, [KANCA], {
    input: secenek.hamGirdi ?? JSON.stringify({ tool_name: 'Write', tool_input: { file_path } }),
    encoding: 'utf8',
    cwd: secenek.cwd ?? process.cwd(),
  })
  const stderr = r.stderr ?? ''
  const ham = (r.stdout ?? '').trim()
  if (!ham) return { kod: r.status, karar: null, sebep: '', stderr }
  const j = JSON.parse(ham) as {
    hookSpecificOutput?: { permissionDecision?: string; permissionDecisionReason?: string }
  }
  return {
    kod: r.status,
    karar: j.hookSpecificOutput?.permissionDecision ?? null,
    sebep: j.hookSpecificOutput?.permissionDecisionReason ?? '',
    stderr,
  }
}

describe('INV-KANCA-HASSAS-YOL-1 · sır dosyaları', () => {
  it('.env ailesi REDDEDİLİR ve sebep dosyayı ADIYLA söyler', () => {
    for (const dosya of ['.env', '.env.local', '.env.production', '.env.development.local']) {
      const r = kos(`C:/repo/${dosya}`)
      expect(r.karar, `reddedilmedi: ${dosya}`).toBe('deny')
      expect(r.sebep, `sebep dosya adını söylemiyor: ${dosya}`).toContain(dosya)
      expect(r.kod, 'bu kanca çıkış kodu 0 vermeli — karar stdout\'ta').toBe(0)
    }
  })

  it('ŞABLON MUAFİYETİ: `.env.example` serbest — sır taşımaz, yazımı kapatmak işi durdurur', () => {
    expect(kos('C:/repo/.env.example').karar).toBeNull()
    expect(kos('C:/repo/.env.local.example').karar).toBeNull()
  })

  it('alt dizindeki `.env` de yakalanır — kök dosya sanılmamalı', () => {
    expect(kos('C:/repo/supabase/functions/x/.env').karar).toBe('deny')
  })
})

describe('INV-KANCA-HASSAS-YOL-1 · migration yolu', () => {
  it('`supabase/migrations/**` ONAY İSTER (deny değil) ve sebep kural 13\'ü hatırlatır', () => {
    const r = kos('C:/repo/supabase/migrations/20260912120000_ornek.sql')
    expect(r.karar, 'migration yolunda onay istenmedi').toBe('ask')
    expect(r.sebep.toLowerCase(), 'sebep prod zincirini söylemiyor').toContain('prod')
  })

  it('ters bölü ile yazılmış Windows yolu da yakalanır', () => {
    expect(kos('C:\\repo\\supabase\\migrations\\20260912120000_ornek.sql').karar).toBe('ask')
  })

  it('YANLIŞ-POZİTİF KOLU: benzer ama hassas OLMAYAN yollar serbest', () => {
    // `migrations` kelimesi geçen her yol hassas değildir; aksi halde belge ve tip
    // dosyalarına yazım durur ve kapı "her şeyi sor" hâline gelir.
    for (const dosya of [
      'docs/plans/migrations-notlari.md',
      'src/types/database.types.ts',
      'scripts/db/migrations-listesi.mjs',
      'src/lib/services/urunServisi.ts',
    ]) {
      expect(kos(`C:/repo/${dosya}`).karar, `masum yol için karar üretti: ${dosya}`).toBeNull()
    }
  })
})

/**
 * INV-KANCA-HASSAS-YOL-2 · migration kolu ÜÇ DALA ayrıldı (karar 284, Recep 2026-10-05 "284 evet").
 *
 * NİÇİN: 10-04'te ÜRÜN aynı yeni migration dosyasını birkaç kez düzeltti ve Recep her seferinde elle onay verdi; bu soru bir şeyi
 * korumuyordu (dosya dalda yazılır, prod'a giden yol master birleştirmesi ve o kapı ayrı). Ama UYGULANMIŞ migration'ı düzenlemek
 * gerçek tehlikedir: bu dal bugünkünden gevşek OLMAMALI, daha sert konuşmalı.
 *
 *   dosya diskte yok                    → ask (yeni migration)
 *   diskte var, master'da YOK (dalda yeni) → soru YOK, yalnız additionalContext (karar alanı hiç yazılmaz)
 *   master'da VAR (origin/master ya da yerel master) → ask, "uygulanmış migration düzenlenmez, yeni migration yaz"
 *   git ölçemezse                       → ask (güvenli taraf)
 *
 * Her kol GERÇEK bir geçici git deposunda koşar (sahte git yok). İKİNCİ ve ÜÇÜNCÜ dalı karıştıran mutasyon bu dosyada kırmızı verir.
 */

const UYGULANMIS = '20260101000000_uygulanmis.sql'

function git(dizin: string, ...args: string[]): string {
  const r = spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', '-c', 'commit.gpgsign=false', ...args], { cwd: dizin, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} → ${r.status}: ${r.stderr}`)
  return r.stdout
}

const geciciler: string[] = []

/** master'da bir migration'ı olan, origin/master'ı master'a işaret eden geçici depo. */
function depoKur(): { kok: string; yol: (ad: string) => string } {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'spg-'))
  geciciler.push(kok)
  git(kok, 'init', '-q', '-b', 'master')
  fs.mkdirSync(path.join(kok, 'supabase', 'migrations'), { recursive: true })
  fs.writeFileSync(path.join(kok, 'supabase', 'migrations', UYGULANMIS), 'select 1;\n')
  git(kok, 'add', '-A')
  git(kok, 'commit', '-q', '-m', 'ilk')
  git(kok, 'update-ref', 'refs/remotes/origin/master', 'master')
  return { kok, yol: (ad) => path.join(kok, 'supabase', 'migrations', ad).replace(/\\/g, '/') }
}

afterAll(() => {
  for (const d of geciciler) fs.rmSync(d, { recursive: true, force: true })
})

/** Kancanın stdout'unu HAM okur: karar alanının hiç yazılmadığını da ölçebilmek için. */
function kosHam(file_path: string, tool_name = 'Write'): { cikti: Record<string, unknown> | null; ham: string; kod: number | null } {
  const r = spawnSync(process.execPath, [KANCA], { input: JSON.stringify({ tool_name, tool_input: { file_path } }), encoding: 'utf8' })
  const ham = (r.stdout ?? '').trim()
  return { cikti: ham === '' ? null : (JSON.parse(ham) as Record<string, unknown>), ham, kod: r.status }
}

describe('INV-KANCA-HASSAS-YOL-2 · migration kolu üç dal', () => {
  it('(a) dosya diskte YOK → ask, bugünkü metin (yeni migration)', () => {
    const { yol } = depoKur()
    const r = kos(yol('20260105000000_yeni.sql'))
    expect(r.karar).toBe('ask')
    expect(r.sebep).toContain('MIGRATION DOSYASI')
    expect(r.sebep).not.toContain('UYGULANMIŞ')
  })

  it('(b) diskte var, master\'da YOK (dalda yeni, izlenmiyor) → SORU YOK, karar alanı hiç yazılmaz, additionalContext kural 13\'ü hatırlatır', () => {
    const { yol } = depoKur()
    fs.writeFileSync(yol('20260105000000_dalda_yeni.sql'), 'select 2;\n')
    const { cikti, ham, kod } = kosHam(yol('20260105000000_dalda_yeni.sql'))
    expect(kod).toBe(0)
    const h = (cikti as { hookSpecificOutput?: Record<string, string> }).hookSpecificOutput
    expect(h?.additionalContext, 'hatırlatma yok').toContain('Kural 13')
    expect(h?.additionalContext).toContain('prod')
    // "izin verdim" da demez: kullanıcının kendi izin ayarları işler.
    expect(ham).not.toContain('permissionDecision')
  })

  it('(b) dalda COMMIT\'lenmiş ama master\'a girmemiş migration de "dalda yeni"dir → soru yok', () => {
    const { kok, yol } = depoKur()
    git(kok, 'switch', '-q', '-c', 'dal')
    fs.writeFileSync(yol('20260105000000_dalda_commitli.sql'), 'select 3;\n')
    git(kok, 'add', '-A')
    git(kok, 'commit', '-q', '-m', 'dalda')
    expect(kos(yol('20260105000000_dalda_commitli.sql')).karar).toBeNull()
    expect(kosHam(yol('20260105000000_dalda_commitli.sql')).ham).toContain('additionalContext')
  })

  it('(c) master\'da VAR (uygulanmış) → ask KALIR ve metin SERT: "uygulanmış migration düzenlenmez, yeni migration yaz"', () => {
    const { yol } = depoKur()
    const r = kos(yol(UYGULANMIS))
    expect(r.karar).toBe('ask')
    expect(r.sebep).toContain('UYGULANMIŞ MIGRATION')
    expect(r.sebep).toContain('DÜZENLENMEZ')
    expect(r.sebep).toContain('yeni bir migration yaz')
    expect(r.sebep.toLowerCase()).toContain('prod')
  })

  it('(c) uygulanmış dosya diskte DEĞİŞTİRİLMİŞ olsa da (düzenleme sürüyor) hâlâ ask — master\'daki varlığına bakılır, içeriğe değil', () => {
    const { yol } = depoKur()
    fs.writeFileSync(yol(UYGULANMIS), 'select 99;\n')
    expect(kos(yol(UYGULANMIS)).sebep).toContain('UYGULANMIŞ MIGRATION')
  })

  it('(c) yalnız YEREL master\'da var (origin/master ref\'i yok) → yine ask', () => {
    const { kok, yol } = depoKur()
    git(kok, 'update-ref', '-d', 'refs/remotes/origin/master')
    expect(kos(yol(UYGULANMIS)).sebep).toContain('UYGULANMIŞ MIGRATION')
  })

  it('(c) BAYAT origin/master (dosyadan eski) ama yerel master\'da var → yine ask (ikisinden biri "var" derse var)', () => {
    const { kok, yol } = depoKur()
    // origin/master dosyadan ÖNCEKİ boş bir commit'e çekilir; dosya yalnız yerel master'da kalır.
    git(kok, 'switch', '-q', '--orphan', 'bos')
    git(kok, 'commit', '-q', '--allow-empty', '-m', 'bos')
    git(kok, 'update-ref', 'refs/remotes/origin/master', 'bos')
    git(kok, 'switch', '-q', 'master')
    expect(kos(yol(UYGULANMIS)).sebep).toContain('UYGULANMIŞ MIGRATION')
  })

  it('(c) yalnız ORIGIN/master\'da var (yerel master geride) → yine ask', () => {
    const { kok, yol } = depoKur()
    git(kok, 'switch', '-q', '-c', 'dal2')
    git(kok, 'switch', '-q', '--orphan', 'bos2')
    git(kok, 'commit', '-q', '--allow-empty', '-m', 'bos2')
    git(kok, 'branch', '-f', 'master', 'bos2')
    git(kok, 'switch', '-q', 'dal2')
    expect(kos(yol(UYGULANMIS)).sebep).toContain('UYGULANMIŞ MIGRATION')
  })

  it('(d) git ölçemezse (dosya var ama klasör git deposu DEĞİL) → ask, "ölçülemedi" der', () => {
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'spg-gitsiz-'))
    geciciler.push(kok)
    fs.mkdirSync(path.join(kok, 'supabase', 'migrations'), { recursive: true })
    const dosya = path.join(kok, 'supabase', 'migrations', 'x.sql').replace(/\\/g, '/')
    fs.writeFileSync(dosya, 'select 1;\n')
    const r = kos(dosya)
    expect(r.karar).toBe('ask')
    expect(r.sebep).toContain('ölçülemedi')
  })

  it('(d) depo var ama ne origin/master ne master çözülüyor (yalnız başka bir dal) → ask, "ölçülemedi"', () => {
    const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'spg-dal-'))
    geciciler.push(kok)
    git(kok, 'init', '-q', '-b', 'baska')
    fs.mkdirSync(path.join(kok, 'supabase', 'migrations'), { recursive: true })
    fs.writeFileSync(path.join(kok, 'supabase', 'migrations', 'y.sql'), 'select 1;\n')
    git(kok, 'add', '-A')
    git(kok, 'commit', '-q', '-m', 'x')
    const r = kos(path.join(kok, 'supabase', 'migrations', 'y.sql').replace(/\\/g, '/'))
    expect(r.karar).toBe('ask')
    expect(r.sebep).toContain('ölçülemedi')
  })

  it('ad benzerliği (b)\'yi (c)\'ye çevirmez: master\'da "…uygulanmis.sql" varken "…uygulanmis.sql.bak" dalda yenidir', () => {
    const { yol } = depoKur()
    fs.writeFileSync(yol(UYGULANMIS + '.bak'), 'select 4;\n')
    expect(kos(yol(UYGULANMIS + '.bak')).karar).toBeNull()
  })

  it('⭐HARF FARKI gevşeme açığı değil: master\'da "…uygulanmis.sql" varken diskte/istekte "…UYGULANMIS.sql" (NTFS aynı dosya) → yine ask, SERT metin', () => {
    const { yol } = depoKur()
    const buyuk = '20260101000000_UYGULANMIS.sql'
    fs.writeFileSync(yol(buyuk), 'select 5;\n') // NTFS'te asıl dosyayı yazar; harf duyarlı diskte ayrı dosya olur — ikisinde de ask beklenir
    const r = kos(yol(buyuk))
    expect(r.karar).toBe('ask')
    expect(r.sebep).toContain('UYGULANMIŞ MIGRATION')
  })

  it('⭐BİR REF ÇÖKERSE öteki çözülse bile "yok" ÇIKMAZ: bozuk origin/master + yerel master listeliyor, dosya master\'da yok → ask, "ölçülemedi"', () => {
    const { kok, yol } = depoKur()
    git(kok, 'update-ref', '-d', 'refs/remotes/origin/master')
    // Olmayan bir nesneyi gösteren ref: `show-ref --verify` çıkış 128 verir (ref "yok" değil, BOZUK).
    fs.mkdirSync(path.join(kok, '.git', 'refs', 'remotes', 'origin'), { recursive: true })
    fs.writeFileSync(path.join(kok, '.git', 'refs', 'remotes', 'origin', 'master'), '1111111111111111111111111111111111111111\n')
    fs.writeFileSync(yol('20260105000000_dalda_yeni.sql'), 'select 6;\n')
    const r = kos(yol('20260105000000_dalda_yeni.sql'))
    expect(r.karar, 'bozuk ref sessizce "dalda yeni" sayıldı').toBe('ask')
    expect(r.sebep).toContain('ölçülemedi')
  })

  it('⭐ref VAR ama listelenemiyor (ağaç değil dosya nesnesine işaret ediyor) → `ls-tree` çöker → ask, "ölçülemedi"; boş çıktı "master\'da yok" sayılmaz', () => {
    const { kok, yol } = depoKur()
    const h = spawnSync('git', ['hash-object', '-w', '--stdin'], { cwd: kok, input: 'agac-degil\n', encoding: 'utf8' })
    git(kok, 'update-ref', 'refs/remotes/origin/master', h.stdout.trim())
    fs.writeFileSync(yol('20260105000000_dalda_yeni.sql'), 'select 8;\n')
    const r = kos(yol('20260105000000_dalda_yeni.sql'))
    expect(r.karar, 'ls-tree hatası sessizce "master\'da yok" sayıldı').toBe('ask')
    expect(r.sebep).toContain('ölçülemedi')
  })

  it('git HİÇ çalışmıyorsa (PATH boş) → ask, "ölçülemedi"; "dalda yeni" sayılmaz', () => {
    const { yol } = depoKur()
    fs.writeFileSync(yol('20260105000000_dalda_yeni.sql'), 'select 9;\n')
    const env = { ...process.env }
    for (const k of Object.keys(env)) if (k.toLowerCase() === 'path') delete env[k] // Windows'ta anahtar "Path"
    // PATH'i silmek yetmez (Node üst sürecin PATH'ine döner); içinde git olmayan boş bir klasöre çevrilir.
    const bos = fs.mkdtempSync(path.join(os.tmpdir(), 'spg-bos-'))
    geciciler.push(bos)
    env.PATH = bos
    const r = spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify({ tool_name: 'Write', tool_input: { file_path: yol('20260105000000_dalda_yeni.sql') } }),
      encoding: 'utf8',
      env,
    })
    const c = JSON.parse(r.stdout.trim()) as { hookSpecificOutput: { permissionDecision: string; permissionDecisionReason: string } }
    expect(c.hookSpecificOutput.permissionDecision).toBe('ask')
    expect(c.hookSpecificOutput.permissionDecisionReason).toContain('ölçülemedi')
  })

  it('ref GERÇEKTEN yoksa (origin tanımsız) atlanır: yerel master çözülür, dalda yeni dosya sorusuz geçer', () => {
    const { kok, yol } = depoKur()
    git(kok, 'update-ref', '-d', 'refs/remotes/origin/master')
    fs.writeFileSync(yol('20260105000000_dalda_yeni.sql'), 'select 7;\n')
    expect(kos(yol('20260105000000_dalda_yeni.sql')).karar).toBeNull()
  })

  it('⭐KLASÖR ADI harf farkı kancayı atlatmaz: `Supabase/Migrations/…` da migration yoludur (eski kancada da açıktı)', () => {
    const { kok } = depoKur()
    const r = kos(path.join(kok, 'Supabase', 'Migrations', '20260105000000_yeni.sql').replace(/\\/g, '/'))
    expect(r.karar).toBe('ask')
    expect(r.sebep).toContain('MIGRATION DOSYASI')
  })

  it('⭐`..` ile dolanan yol kancayı atlatmaz: `supabase/foo/../migrations/…` migration yoludur', () => {
    const { kok } = depoKur()
    const r = kos(`${kok.replace(/\\/g, '/')}/supabase/foo/../migrations/20260105000000_yeni.sql`)
    expect(r.karar).toBe('ask')
    expect(r.sebep).toContain('MIGRATION DOSYASI')
  })

  it('⭐`.env` harf farkıyla atlatılamaz: `.ENV` ve `.Env.local` DENY (NTFS aynı dosya); şablon muafiyeti `.env.example` için sürer', () => {
    const { kok } = depoKur()
    const k = kok.replace(/\\/g, '/')
    expect(kos(`${k}/.ENV`).karar).toBe('deny')
    expect(kos(`${k}/.Env.local`).karar).toBe('deny')
    expect(kos(`${k}/.env.example`).karar).toBeNull()
  })

  it('Edit ve MultiEdit araçlarında, ters bölülü Windows yolunda da aynı karar', () => {
    const { yol } = depoKur()
    for (const arac of ['Edit', 'MultiEdit', 'Write']) {
      const c = kosHam(yol(UYGULANMIS), arac).cikti as { hookSpecificOutput?: { permissionDecision?: string } }
      expect(c.hookSpecificOutput?.permissionDecision, arac).toBe('ask')
    }
    const ters = yol(UYGULANMIS).replace(/\//g, '\\')
    expect(kos(ters).sebep).toContain('UYGULANMIŞ MIGRATION')
  })

  it('.env kolu DEĞİŞMEDİ: deny, diskte olsa da olmasa da', () => {
    const { kok } = depoKur()
    fs.writeFileSync(path.join(kok, '.env'), 'X=1\n')
    expect(kos(path.join(kok, '.env').replace(/\\/g, '/')).karar).toBe('deny')
    expect(kos(path.join(kok, '.env.production').replace(/\\/g, '/')).karar).toBe('deny')
    expect(kos(path.join(kok, '.env.example').replace(/\\/g, '/')).karar).toBeNull()
  })

  it('bozuk stdin hâlâ karışmaz ve söyler', () => {
    expect(kos('', { hamGirdi: 'json degil' }).stderr).toContain('stdin okunamadi')
  })
})

describe('INV-KANCA-HASSAS-YOL-1 · sözleşme sınırları', () => {
  it('bozuk / boş / dosyasız girdi KARIŞMAZ — karar üretmez, exit 0', () => {
    const bozuk = kos('', { hamGirdi: 'bu JSON degil' })
    expect(bozuk.karar, 'bozuk girdide karar uydurdu').toBeNull()
    expect(bozuk.kod).toBe(0)
    expect(kos('', { hamGirdi: '{}' }).karar, 'dosya yolu yokken karar uydurdu').toBeNull()
    expect(kos('', { hamGirdi: '' }).karar).toBeNull()
  })

  it('⭐bozuk / boş girdide SESSİZ KALMAZ — stderr tek satır (cetvel §9.7)', () => {
    // Güvenlik kancası da kurala dahil: bozuk girdide .env yazımını DURDURMAZ ama
    // durduramadığını SÖYLER. Sessiz fail-open, kapının hiç koşmamasından ayırt edilemez.
    expect(kos('', { hamGirdi: 'bu JSON degil' }).stderr).toContain('stdin okunamadi')
    expect(kos('', { hamGirdi: '' }).stderr).toContain('stdin okunamadi')
    // Geçerli JSON, hassas olmayan yol: NORMAL hâl, uyarı üretmemeli.
    expect(kos('C:/repo/src/lib/x.ts').stderr, 'normal hâlde gürültü üretti').toBe('')
  })

  it('KARAR CWD\'DEN BAĞIMSIZ — depo dışından koşarken de aynı', () => {
    // 2026-09-12: göreli yol sınıfı bir kancayı depo dışı klasörde düşürdü ve kapı
    // "çalışmış gibi" göründü. Bu kol o sınıfı ölçer.
    const disari = os.tmpdir()
    expect(kos('C:/repo/.env', { cwd: disari }).karar).toBe('deny')
    expect(kos('C:/repo/supabase/migrations/20260912120000_x.sql', { cwd: disari }).karar).toBe('ask')
    expect(kos('C:/repo/src/lib/x.ts', { cwd: disari }).karar).toBeNull()
  })
})
