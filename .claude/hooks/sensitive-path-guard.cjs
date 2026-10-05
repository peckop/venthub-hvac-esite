#!/usr/bin/env node
// sensitive-path-guard — PreToolUse (Edit|Write|MultiEdit) bekçisi (2026-08-26, Recep GO'su; migration kolu 3 dala ayrıldı 2026-10-05, karar 284)
//
// İki hassas yol sınıfı:
//   1) supabase/migrations/** → ÜÇ DAL (Kural 13: migration içeren dal master'a merge edilince
//      supabase-migrate.yml prod DB'ye OTOMATİK uygular; zincirin ucu prod'dur):
//        a) dosya diskte YOK (yeni migration)                       → ASK (bugünkü metin)
//        b) dosya diskte VAR ama master'da YOK (bu dalda yeni açıldı) → soru YOK, yalnız additionalContext
//           (ajana kural 13 hatırlatılır). Gerekçe: 10-04'te aynı yeni dosya birkaç kez düzeltildi, Recep her seferinde
//           elle onay verdi; bu ask bir şeyi korumuyordu: dosya dalda yazılır, prod'a giden yol master birleştirmesidir
//           ve o kapı ayrıdır (merge ritüeli + Recep onayı).
//        c) dosya master'da VAR (uygulanmış migration)               → ASK, daha sert metin ("uygulanmış migration
//           düzenlenmez, yeni migration yaz"). Bu dal bugünkünden gevşek OLMAMALI.
//        d) git ölçemezse (repo değil, zaman aşımı, git hatası, bozuk ref, hiç master ref'i yok) → ASK (güvenli taraf)
//      "Master'da var mı" ölçümü: origin/master VEYA yerel master'dan biri dosyayı listeliyorsa var sayılır
//      (origin/master bayatsa yerel master'ı da bakar; biri bile "var" derse ask kalır). Ad karşılaştırması HARF DUYARSIZdır
//      (NTFS'te `_Uygulanmis.sql` ile `_uygulanmis.sql` aynı dosya). Bir ref gerçekten yoksa atlanır; ama ref'lerden biri
//      çözülüp ÖTEKİ git hatası/zaman aşımı verirse sonuç 'yok' DEĞİL 'ölçülemedi'dir (ask).
//      KALINTI RİSK: hem origin/master hem yerel master bayatsa (fetch yok) uygulanmış migration "dalda yeni" görünebilir;
//      koruma ana-agac-tazelik --ileri-sar + düzenli fetch. Kural 13 merge kapısı bundan bağımsızdır.
//   2) .env ailesi (.env, .env.local, .env.production...) → DENY. Repo PUBLIC (2026-08-15'ten
//      beri) ve geçmiş silinemez; sır dosyalarına ajan eli değmez. İstisna: *.example dosyaları
//      şablondur, sır taşımaz → serbest. BU KOL DEĞİŞMEDİ.
//
// Sözleşme: stdin'den hook JSON'u okur; karar vermeyecekse HİÇBİR ŞEY basmaz (= allow, normal izin akışı). (b) dalında karar
// alanı HİÇ yazılmaz (izin verdim demez; kullanıcının kendi izin ayarları işler), yalnız additionalContext basılır.
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')

const GIT_ZAMAN_ASIMI_MS = 5000
const GIT_CIKTI_SINIRI = 16 * 1024 * 1024
// TAM ref adları: `show-ref --verify` bunlarla "yok" (çıkış 1) ile "bozuk / depo değil" (çıkış 128) ayrımını yapar
// (2026-10-05 ölçüldü; `rev-parse --quiet` ikisini de 1 verir, ayıramaz).
const MASTER_REFLERI = ['refs/remotes/origin/master', 'refs/heads/master']

function gitCalistir(dizin, args) {
  return spawnSync('git', ['-C', dizin, ...args], { encoding: 'utf8', timeout: GIT_ZAMAN_ASIMI_MS, maxBuffer: GIT_CIKTI_SINIRI })
}

// NTFS ve macOS harf duyarsızdır ("diskte var mı" sorusu öyle cevaplanır) ama `git ls-tree` ad eşlemesi harf duyarlıdır;
// karşılaştırma iki tarafta da aynı biçime çekilerek yapılır. Linux'ta bu ek ask üretebilir (güvenli yön), asla ask'ı kaldırmaz.
function adAnahtari(ad) {
  return String(ad).normalize('NFC').toLowerCase()
}

/**
 * Dosya master'da (origin/master ya da yerel master) izleniyor mu?
 *   - ref gerçekten yoksa (show-ref çıkış 1) atlanır; en az bir ref çözülmeli.
 *   - herhangi bir git komutu hata verir, zaman aşımına uğrar ya da ref bozuksa → 'olculemedi' (ask). Biri çözülüp diğeri çökerse
 *     sonuç ASLA 'yok' olmaz.
 * KALINTI RİSK (belgelenmiş, kapatılamaz): hem origin/master hem yerel master BAYATSA (fetch yapılmamış, master geride) prod'a
 * uygulanmış bir migration "dalda yeni" görünebilir. Koruma kancada değil, tazelikte: ana-agac-tazelik --ileri-sar ve
 * fetch'in düzenli yapılması. Kural 13 merge kapısı (Recep onayı) bu riskten bağımsız çalışır.
 * @returns {{ durum: 'var' | 'yok' | 'olculemedi', sebep?: string }}
 */
function masterdaMi(dosya) {
  // ls-tree çalışma dizinine göre o klasörü listeler → depo kökü hesabına gerek yok. Adlar -z ile ham alınır (tırnaklama yok).
  const dizin = path.dirname(dosya)
  const anahtar = adAnahtari(path.basename(dosya))
  let cozulen = 0
  for (const ref of MASTER_REFLERI) {
    const v = gitCalistir(dizin, ['show-ref', '--verify', '--quiet', ref])
    if (v.error) return { durum: 'olculemedi', sebep: String(v.error.message || v.error) }
    if (v.status === 1) continue // ref gerçekten yok (örn. origin tanımsız)
    if (v.status !== 0) return { durum: 'olculemedi', sebep: `git ${ref} çıkış ${v.status}` }
    const l = gitCalistir(dizin, ['ls-tree', '-z', '--name-only', ref])
    if (l.error) return { durum: 'olculemedi', sebep: String(l.error.message || l.error) }
    if (l.status !== 0) return { durum: 'olculemedi', sebep: `git ls-tree ${ref} çıkış ${l.status}` }
    cozulen++
    if (String(l.stdout || '').split('\0').some((n) => n !== '' && adAnahtari(n) === anahtar)) return { durum: 'var' }
  }
  // En az bir ref çözüldü, hiçbir git komutu hata vermedi ve dosya listelenmedi → master'da yok. Hiçbiri çözülemediyse ölçemedik.
  return cozulen > 0 ? { durum: 'yok' } : { durum: 'olculemedi', sebep: 'ne origin/master ne master ref\'i var' }
}

const YENI_MIGRATION_METNI =
  '[sensitive-path-guard] MIGRATION DOSYASI — Kural 13: bu dosya master\'a merge edilince ' +
  'prod DB\'ye OTOMATİK uygulanır. Yazmadan önce: plan-challenger koşuldu mu, Recep merge ' +
  'onayı planlandı mı? (Onaylarsan yazım devam eder; merge kapısı yine ayrıdır.)'

const UYGULANMIS_MIGRATION_METNI =
  '[sensitive-path-guard] UYGULANMIŞ MIGRATION — bu dosya master\'da var ve prod DB\'ye uygulanmış sayılır (Kural 13). ' +
  'Uygulanmış migration DÜZENLENMEZ: değişiklik gerekiyorsa yeni bir migration yaz ' +
  '(supabase/migrations/YYYYMMDDHHMMSS_aciklama.sql, damga 14 hane). Yine de yazmak istiyorsan Recep\'in açık onayı gerekir.'

const DALDA_YENI_BAGLAM =
  '[sensitive-path-guard] Bu migration dosyası bu dalda yeni açılmış (master\'da yok): düzenleme serbest. Hatırlatma, Kural 13: ' +
  'migration içeren dal master\'a merge edilince prod DB\'ye OTOMATİK uygulanır; migration\'lı PR\'ı yalnız Recep onayıyla merge et.'

let raw = ''
process.stdin.on('data', (c) => { raw += c; })
process.stdin.on('end', () => {
  // §9.7: bozuk/boş stdin → fail-OPEN ama SESSİZ DEĞİL. Güvenlik kancası da dahil: bozuk
  // girdide .env yazımını DURDURMAZ ama durduramadığını SÖYLER.
  let input;
  if (!String(raw).trim()) {
    process.stderr.write('[sensitive-path-guard] stdin okunamadi (bos), karisilmadi\n');
    process.exit(0);
  }
  try { input = JSON.parse(raw); } catch {
    process.stderr.write('[sensitive-path-guard] stdin okunamadi (bozuk JSON), karisilmadi\n');
    process.exit(0);
  }
  const ham = String((input.tool_input || {}).file_path || '').replace(/\\/g, '/');
  if (!ham) process.exit(0);
  // `a/../b` ve `./` normalleştirilir: aksi halde `supabase/x/../migrations/…` desene hiç girmez.
  const p = path.posix.normalize(ham);

  const karar = (permissionDecision, reason) => {
    console.log(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision, permissionDecisionReason: reason },
    }));
    process.exit(0);
  };

  // .env ailesi — example HARİÇ
  const base = p.split('/').pop();
  // /i: NTFS'te `.ENV` ile `.env` aynı dosyadır. Şablon muafiyeti harf DUYARLI kalır (`.env.EXAMPLE` muaf değil: güvenli yön).
  if (/^\.env(\..+)?$/i.test(base) && !/\.example$/.test(base)) {
    karar('deny',
      `[sensitive-path-guard] ${base} sır dosyasıdır ve repo PUBLIC — ajan yazımı kapalı. ` +
      'Değişiklik gerekiyorsa Recep elle yapar; şablon değişikliği için .env.example kullan.');
  }

  // supabase/migrations/**
  // /i: NTFS'te `Supabase/Migrations/` aynı klasördür (eski kancada da bu açık vardı).
  if (/(^|\/)supabase\/migrations\//i.test(p)) {
    // (a) Diskte yok: yeni migration. Dosya sistemi hatası ölçülemedi sayılır → ask.
    let diskte;
    try { diskte = fs.existsSync(path.resolve(p)); } catch { diskte = null; }
    if (diskte !== true) {
      karar('ask', diskte === false ? YENI_MIGRATION_METNI : YENI_MIGRATION_METNI + ' (Dosya durumu ölçülemedi.)');
    }
    const m = masterdaMi(path.resolve(p));
    if (m.durum === 'var') karar('ask', UYGULANMIS_MIGRATION_METNI);                       // (c)
    // (d) Yalnız açıkça 'yok' geçer; 'olculemedi' ya da tanınmayan her değer güvenli tarafta sorulur.
    if (m.durum !== 'yok') {
      karar('ask', YENI_MIGRATION_METNI + ' (Master\'da olup olmadığı ölçülemedi: ' + String(m.sebep).slice(0, 120) + ' — güvenli tarafta soruluyor.)');
    }
    // (b) Diskte var, master'da yok: soru yok, yalnız ajana hatırlatma. Karar alanı yazılmaz.
    console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: DALDA_YENI_BAGLAM } }));
    process.exit(0);
  }

  process.exit(0);
});
