#!/usr/bin/env node
// sensitive-path-guard — PreToolUse (Edit|Write|MultiEdit) bekçisi (2026-08-26, Recep GO'su)
//
// İki hassas yol sınıfı:
//   1) supabase/migrations/** → ASK. Kural 13: migration içeren dal master'a merge edilince
//      supabase-migrate.yml prod DB'ye OTOMATİK uygular. Dosyayı yazmak masum görünür ama
//      zincirin ucu prod'dur; bekçi her yazımda bunu hatırlatır ve onay ister.
//   2) .env ailesi (.env, .env.local, .env.production...) → DENY. Repo PUBLIC (2026-08-15'ten
//      beri) ve geçmiş silinemez; sır dosyalarına ajan eli değmez. İstisna: *.example dosyaları
//      şablondur, sır taşımaz → serbest.
//
// Sözleşme: stdin'den hook JSON'u okur; karar vermeyecekse HİÇBİR ŞEY basmaz (= allow).
let raw = '';
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); } // bozuk girdi → karışma
  const p = String((input.tool_input || {}).file_path || '').replace(/\\/g, '/');
  if (!p) process.exit(0);

  const karar = (permissionDecision, reason) => {
    console.log(JSON.stringify({
      hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision, permissionDecisionReason: reason },
    }));
    process.exit(0);
  };

  // .env ailesi — example HARİÇ
  const base = p.split('/').pop();
  if (/^\.env(\..+)?$/.test(base) && !/\.example$/.test(base)) {
    karar('deny',
      `[sensitive-path-guard] ${base} sır dosyasıdır ve repo PUBLIC — ajan yazımı kapalı. ` +
      'Değişiklik gerekiyorsa Recep elle yapar; şablon değişikliği için .env.example kullan.');
  }

  // supabase/migrations/**
  if (/(^|\/)supabase\/migrations\//.test(p)) {
    karar('ask',
      '[sensitive-path-guard] MIGRATION DOSYASI — Kural 13: bu dosya master\'a merge edilince ' +
      'prod DB\'ye OTOMATİK uygulanır. Yazmadan önce: plan-challenger koşuldu mu, Recep merge ' +
      'onayı planlandı mı? (Onaylarsan yazım devam eder; merge kapısı yine ayrıdır.)');
  }

  process.exit(0);
});
