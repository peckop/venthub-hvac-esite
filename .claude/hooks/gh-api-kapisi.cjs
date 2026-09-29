#!/usr/bin/env node
'use strict'
/**
 * GH API KAPISI — REC-410 S2 (izin denetimi 09-28). Cetvel: docs/standards/izin-kapilari-standard.md §S2.
 *
 * ── NİÇİN VAR (ölçüldü 09-28) ──
 *
 * `Bash(gh api *)` proje settings.json'da ALLOW. Bu makinedeki kayıtlarda 893 `gh api` komutunun 131'i
 * yazıyor. Çoğu zararsız (PR aç/düzelt 80, yorum 6, update-branch 7), ama beş kapıyı DOLANANLAR da var:
 *   · `PUT pulls/N/merge` 7 kez — `gh pr merge` yolunu ve migration onayını (kapı 1) atlar;
 *   · `PUT/DELETE branches/master/protection` 2 kez — dal koruması kalkınca tüm zorunlu kontroller düşer;
 *   · `PUT contents/.claude/settings.json` 1 kez — PR'sız doğrudan master'a dosya yazar;
 *   · `DELETE git/refs/heads/*` 4 kez — dal siler (master'da kapı 3: geçmişi silen git).
 *
 * ── SAPMA (emri verene bildirildi) ──
 *
 * Emir "yalnız GET" diyordu. Ölçüm: yazmaların ~%80'i zararsız PR/yorum işi; hepsini sormak Recep'i
 * günde onlarca kez yorardı (09-28 kararı: ayar işi Recep'e sorulmaz, beş kapı onda). Kapı bu yüzden
 * yazmanın TÜRÜNE bakar: beş kapıya dokunan uç noktalar `ask`, gerisi geçer. Ayrıştırılamayan yazma → `ask`.
 */

// Tehlikeli uç noktalar (yöntemden bağımsız, yazma ise sorulur).
const TEHLIKELI = [
  [/\/pulls\/[^/\s]+\/merge\b/, 'PR merge (gh pr merge ve migration onayi atlanir — kapi 1)'],
  [/\/branches\/[^\s]*\/protection\b/, 'dal korumasi (zorunlu kontroller duser)'],
  [/\/rulesets\b/, 'depo kural setleri (zorunlu kontroller duser)'],
  [/\/contents\//, 'PR siz dogrudan dosya yazma'],
  [/\/git\/(refs|commits|trees|blobs|tags)\b/, 'git nesnesi/dal yazma (gecmisi degistirir — kapi 3)'],
  [/\/actions\/(secrets|variables)\b|\/environments\b|\/dependabot\/secrets\b|\/codespaces\/secrets\b/, 'sir/degisken (kapi 2)'],
  [/\/(collaborators|keys|hooks|invitations|teams)\b/, 'erisim/anahtar/webhook'],
  [/\/(actions\/permissions|pages|transfer)\b/, 'depo yetki/yayin ayari'],
]
const DEPO_KOKU = /(?:^|\s|["'])\/?repos\/[^/\s"']+\/[^/\s"']+\/?(?=["'\s]|$)/ // PATCH/DELETE repos/o/r = depo ayarı/silme

const YAZMA_YONTEM = /(?:-X|--method)[\s=]*["']?(POST|PATCH|PUT|DELETE)\b/i
const OKUMA_YONTEM = /(?:-X|--method)[\s=]*["']?(GET|HEAD)\b/i
const ALAN = /(?:^|\s)(-f|-F|--field|--raw-field|--input)(?=[\s=])/

/** Komuttaki her `gh api …` parçası için { yazma, yontem, sebep|null } */
function incele(komut) {
  const sonuc = []
  for (const m of String(komut).matchAll(/\bgh\s+api\b([^\n;&|]*)/g)) {
    const govde = m[1]
    let yontem = (govde.match(YAZMA_YONTEM) || [])[1]
    if (!yontem && !OKUMA_YONTEM.test(govde) && ALAN.test(govde)) yontem = 'POST' // gh api: alan varsa POST
    if (!yontem) {
      sonuc.push({ yazma: false })
      continue
    }
    yontem = yontem.toUpperCase()
    let sebep = null
    if (/\bgraphql\b/.test(govde) && /\bmutation\b/i.test(govde)) sebep = 'GraphQL mutation (icerik ayristirilamaz)'
    for (const [d, s] of TEHLIKELI) if (!sebep && d.test(govde)) sebep = s
    if (!sebep && yontem === 'DELETE') sebep = 'DELETE istegi'
    if (!sebep && (yontem === 'PATCH' || yontem === 'PUT') && DEPO_KOKU.test(govde)) sebep = 'depo ayari'
    if (!sebep && !/(repos|orgs|user|graphql)\//.test(govde) && !/\bgraphql\b/.test(govde)) sebep = 'uc nokta ayristirilamadi'
    sonuc.push({ yazma: true, yontem, sebep })
  }
  return sonuc
}

function karar(girdi) {
  if (String(girdi.tool_name || '') !== 'Bash') return null
  const riskli = incele((girdi.tool_input || {}).command || '').find((p) => p.sebep)
  return riskli ? { karar: 'ask', sebep: 'gh api ' + riskli.yontem + ': ' + riskli.sebep } : null
}

function main() {
  let girdi = {}
  try {
    girdi = JSON.parse(require('fs').readFileSync(0, 'utf8') || '{}')
  } catch {
    process.exit(0) // Bash girdisi okunamadıysa bu kapının söyleyeceği yok; diğer Bash kapıları sürer
  }
  const k = karar(girdi)
  if (!k) process.exit(0)
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: '[gh-api-kapisi] ' + k.sebep + ' — Recep onayi gerekir (REC-410 S2).',
      },
    }),
  )
  process.exit(0)
}

module.exports = { incele, karar }
if (require.main === module) main()
