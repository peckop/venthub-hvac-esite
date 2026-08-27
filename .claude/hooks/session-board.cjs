#!/usr/bin/env node
/**
 * SessionStart hook — OTURUM KİMLİĞİ + PANO DURUMU bağlama enjekte edilir.
 *
 * Neden: ajan "ben hangi oturumum" sorusunu tahmin etmemeli. Claude Code oturum kimliğini
 * hook'a stdin ile verir; buradan bağlama yazılınca ajan onu OKUR. Kimlik compact'ten de
 * sağ çıkar (bağlam sıfırlansa bile SessionStart yeniden koşar).
 *
 * Ayrıca panonun o anki hâli (kim hangi şeritte, okunmamış notlar) ilk turda görünür olur —
 * böylece kullanıcı mesaj taşıyıcısı olmaktan kurtulur.
 *
 * stdin: { session_id, cwd, ... }
 * stdout: { hookSpecificOutput: { hookEventName, additionalContext } }
 */
const fs = require('fs')
const path = require('path')
const { spawn, execFileSync } = require('child_process')

function readStdin() {
  try { return fs.readFileSync(0, 'utf8') } catch { return '' }
}

let input = {}
try { input = JSON.parse(readStdin() || '{}') } catch { input = {} }

const sid = input.session_id || ''
if (!sid) process.exit(0)

/**
 * KİMLİK DOSYASI — `pre-commit` şerit kapısı (E1) için tek kimlik kaynağı.
 *
 * NİÇİN GEREKLİ: `pre-commit`i git çalıştırır; ortada `session_id` YOKTUR. Kimlik olmadan
 * "bu dosya BAŞKASININ şeridinde mi" sorusu sorulamaz.
 *
 * BASİT GÖRÜNEN ALTERNATİF ÖLÇÜLDÜ VE ÇÜRÜTÜLDÜ — dal önekinden şerit türetmek: son 40 uzak
 * dalın 36'sı `önek/konu` kalıbına uyuyor AMA önekler şerit adı DEĞİL
 * (`fix/inv-quote-1-content-scope` AUTH'un, `docs/t116-payment-ledger-standard` PRICING'in).
 * Kullansaydık, yanlış şerit adına karar veren bir kapı kurmuş olurduk.
 *
 * ⚠ WORKTREE-YEREL YAZILIR, ORTAK DİZİNE DEĞİL — ölçüldü:
 *     git rev-parse --absolute-git-dir → …/.git/worktrees/venthub-wt-altyapi  (şeride ÖZEL)
 *     git rev-parse --git-common-dir   → …/.git                               (HEPSİNDE ORTAK)
 * Ortak dizine yazsaydık bütün şeritler AYNI kimliği okurdu ve kapı her şeritte yanlış sahibi
 * gösterirdi — bir şerit kapısı için düşünülebilecek en kötü arıza.
 *
 * BOOTSTRAP: dosya ancak bir şeridin BİR SONRAKİ oturum açılışında oluşur. O ana kadar E1
 * fail-open çalışır ve GÖRÜNÜR uyarı basar (sessizlik kanıt sayılmasın).
 */
try {
  const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
    cwd: input.cwd || process.cwd(),
    encoding: 'utf8',
    timeout: 10000,
  }).trim()
  if (gitDir) fs.writeFileSync(path.join(gitDir, 'venthub-sid'), sid + '\n', 'utf8')
} catch (e) {
  // Sessiz geçmeyiz: kimlik yoksa E1 fail-open olur ve sebebinin bilinmesi gerekir.
  process.stderr.write(
    '[session-board] kimlik dosyasi yazilamadi (' + (e && (e.code || e.message)) +
      ') — E1 serit kapisi bu worktree de KIMLIKSIZ calisir.\n',
  )
}

// SessionStart 'source': startup | resume | clear | compact | fork (Claude Code 2.1.234, hooks-guide).
// 08-22 dersi (docs/audits/platform-capability-audit-2026-08-22.md): makine ~24s kapandi, acilinca
// eklenti oturumlari 'resume' ile geri yuklendi; gozcu (Monitor) olmustu, cron kismen dondu, ekip
// SAGIR kaldi ve Recep elle durtmek zorunda kaldi. Bu alani OKUYUP resume'da davranis veriyoruz.
const source = input.source || 'startup'

/**
 * Registry oto-senkronu — KOPARILMIŞ süreç olarak başlatılır.
 *
 * Neden burada: `post-merge` kancası yalnız yerel `git pull/merge`'de koşar, biz ise PR'ları
 * `gh pr merge` ile GitHub üzerinden kapatıyoruz → senkron hiç çalışmıyordu. CI'a taşımak
 * ÇÖZÜM DEĞİL: registry `~/.orion/registry.db`, yani bu makinedeki yerel bir dosya; runner'da
 * boş bir DB yaratılır ve silinir (yeşil yanar, hiçbir şey senkronlanmaz). Üç oturum da aynı
 * makinede olduğu için doğru yer oturum açılışıdır.
 *
 * Neden koparılmış: `git fetch` ağ işidir; oturum açılışını bekletmemeli. Çıktı
 * `~/.orion/registry-autosync.log`'a düşer.
 *
 * ⚠ `windowsHide: true` ŞART — ölçüldü (2026-08-27). Windows'ta `detached: true` ile başlatılan
 * çocuk süreç, `windowsHide` verilmezse KENDİ konsolunu alır: bir `conhost.exe` penceresi açılıp
 * kapanır. Görünür etkisi "her oturum açılışında bir pencere yanıp söndü" — Recep bunu bildirdi
 * ve teşhis sırasında ölçtük; o gün sayılan 18 pencerenin 1'i buydu (kalan 17 Antigravity MCP
 * config'inden, `npx`/çıplak komut → `.cmd` → `cmd.exe`; ayrı olarak onarıldı).
 * `stdio: 'ignore'` bunu ÖNLEMEZ — çıktıyı yutar, pencereyi değil.
 */
try {
  const child = spawn(process.execPath, [path.join(__dirname, '..', '..', 'scripts', 'board', 'registry-autosync.cjs')], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })
  child.unref()
} catch { /* senkron başlatılamadıysa oturumu bloklama — bir sonraki açılışta tekrar denenir */ }

let context = `Oturum kimliğin: ${sid}\n`
context += `Açılış türü (source): ${source}\n`

// RESUME UYANDIRMA REFLEKSI (Recep 08-22 onayi: yalniz otomatik uyandirma). Makine kapanip
// acildiginda oturumlar 'resume' ile geri gelir ama gozcu/cron olabilir; ekip SAGIR acilir.
// LIDER (OPS/AUDIT-DOCS) resume ile acildiginda ILK IS: ListAgents ile uyuyan peer oturumlarini
// bul, her birine SendMessage ile 'uyan: uclunu kur + panoyu oku + isbasi notu' gonder.
// Bu kanca ajan degil harness'tir; mesaji ATAMAZ — yalnizca lidere TALIMAT yazar, mesaji ajan atar.
if (source === 'resume') {
  const lider = /audit|ops/i.test(process.env.CC_LANE || '') || sid === 'cb0467f1-f1a3-437d-bc15-52c0bd90feb3'
  context +=
    'RESUME ACILISI — makine geri dondu. UCLU YEDEGINI YENIDEN KUR (gozcu Monitor + cron; ' +
    'resume Monitor\'u getirmez, cron\'u 7 gun icinde getirebilir ama GUVENME, CronList ile OLC).\n' +
    (lider
      ? '⭐LIDERSIN: uyandirma refleksi — ListAgents ile canli peer oturumlarini listele, uyuyan ' +
        'her birine SendMessage: "makine dondu, uyan: uclunu kur + panoyu oku + isbasi notu birak". ' +
        'Sonra panoyu ve bu oturuma adresli notlari isle.\n'
      : 'Panoya ISBASI notu birak (uyandiginin kaniti) ve liderin uyandirma mesajini bekleme — ' +
        'kendi ucluunu simdi kur.\n')
}

try {
  const board = require(path.join(__dirname, '..', '..', 'scripts', 'board', 'board.cjs'))
  const live = board.liveClaims()
  const mine = live.find(c => c.sid === sid)

  context += mine
    ? `Şeridin: ${mine.lane} — ${mine.globs.join(', ')}\n`
    : `Şeridin: TALEP EDİLMEMİŞ. Çok dosyalı bir işe başlamadan önce şeridi al:\n` +
      `  node scripts/board/board.cjs claim --sid ${sid} --lane <ad> --globs "src/**"\n`

  // MEKANİZMA (T115-VH) — oturumun İLK işi.
  //
  // Gözcü (Monitor), cron ve tur-sonu uyanışı ÜÇÜ DE bu oturumun içinde yaşar ve oturumla
  // birlikte ÖLÜR; yeni oturum onları devralmaz. 2026-08-20 sabahı dört oturum tam bu yüzden
  // SAĞIR açıldı ve Recep her birini elle dürtmek zorunda kaldı. Talimat dört kanaldan
  // ulaşmıştı; kurulum üretmedi. O yüzden hatırlatma artık oturumun kendi açılışına gömülü.
  try {
    const durum = board.gozcuDurumu ? board.gozcuDurumu(sid, Date.now()) : 'KANITSIZ'
    if (durum === 'CANLI') {
      context += 'MEKANIZMA: gozcun CANLI (imlec taze).\n'
    } else {
      context +=
        'MEKANIZMA — ILK IS BU (' + durum + '): uc katmani kur ve KANITLA.\n' +
        '  node scripts/board/mechanism-setup.cjs plan --sid ' + sid + ' --serit <SERIT>\n' +
        '  Kurulumdan sonra: mechanism-setup.cjs prob --sid ' + sid + '\n' +
        '  prob AYIRT EDICI testtir: gozcu olu olsaydi sonuc FARKLI olurdu. Beyan yeterli degil.\n'
    }
  } catch {
    /* ölçüm aracının kendisi patlarsa oturum yine açılır (fail-open, lane-guard ile aynı ilke) */
  }

  context += board.summary(sid) + '\n'

  const notes = board.notesFor(sid, mine && mine.lane)
  if (notes.length > 0) {
    context += 'OKUNMAMIŞ NOTLAR:\n' +
      notes.map(n => `  · ${String(n.sid).slice(0, 8)} → ${n.to || 'herkes'}: ${n.text}`).join('\n') + '\n'
  }
} catch (e) {
  // Pano okunamazsa oturum yine de açılır — koordinasyon katmanı fail-open (bkz. lane-guard).
  context += `(pano okunamadı: ${e && e.message})\n`
}

// YÖNTEM GÖSTERGESİ (T144-VH, Recep 08-21): ajan panoya baktığında cetveli de görsün —
// tarayıcıda ayrı sayfa değil, bakılan yerin yanında. Öneri, dayatma değil; sapma yazılır.
context += 'YÖNTEM CETVELİ (docs/standards/execution-method-standard.md): iş emrinde YÖNTEM: satırı ' +
  'ZORUNLU, seçim SERBEST (ölç, seç, sapmayı bir cümleyle yaz). Kısa harita: günler süren sahipli prod-kapılı iş=ŞERİT · ' +
  'çok-eksen salt-okuma ölçüm=Sonnet alt-ajan ×N · bağımsız çürütme/çok-eksen denetim=Workflow (emirde "workflow kullan") · ' +
  'aynı değişiklik çok hedefe=maestro · geniş tarama=agy-orchestrate · plan→plan-challenger (migration/veri göçü ZORUNLU) · ' +
  'PR=diff-review · tek dosya=elle. İkiz şerit açılmaz; canlı şerit tavanı 2-3.\n'

process.stdout.write(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: context,
  },
}))
