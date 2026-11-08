import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * INV-PUSH-KAPISI-1 · git push ayrıştıran PreToolUse kapısı (ARC-171, #1988 güvenlik incelemesi).
 * settings.json deny satırları ham desendir; kapı refspec'i, -C yolunu ve zincirleri ayrıştırır.
 * Sabotaj kolu: korunan dal / force / -C denetimleri bozulursa ilgili test kırmızıya döner.
 */

const require_ = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '..', '..', '..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'push-kapisi.cjs')
type Secenek = { cwd: string; mevcutDal?: (c: string) => string | null; gitDeposu?: (p: string) => boolean }
const motor = require_(KANCA) as { degerlendir: (k: string, o: Secenek) => string | null; parcala: (k: string) => string[][]
  heredocGovdesiniAyikla: (k: string) => string
}

const CWD = path.resolve('/depo/calisma')
const o = (mevcut: string | null = 'feat-x'): Secenek => ({ cwd: CWD, mevcutDal: () => mevcut, gitDeposu: (p) => !p.includes('depo-degil') })
const ret = (k: string, s: Secenek = o()) => motor.degerlendir(k, s)

describe('INV-PUSH-KAPISI-1 — izin verilen tek biçim', () => {
  it.each([
    'git push origin feat-x',
    'git push -u origin feat-x',
    'git push --set-upstream origin arac/arc171-push-kapisi',
    'git push origin HEAD',
    'git push origin HEAD:feat-x',
    'git push origin feat-a:feat-b',
    'git push -n origin feat-x',
    'git -C /depo/calisma push origin feat-x',
    'git -C D:/depolar/venthub-pdf-ingestor push origin kaynak-dizini-x',
    'git -C /kardes/ingestor push -u origin feat-x',
    'git -C "D:\\depolar\\venthub-pdf-ingestor" push origin feat-x',
    'cd /kardes/ingestor && git push origin feat-x',
    'git status && git push origin feat-x',
    'git push',
    'git -c core.quotepath=off status',
    'git -c core.pager=cat push origin feat-x',
    'git -c user.name=Ali -c user.email=a@b.c push origin feat-x',
    'git -c core.pager=cat log --oneline -5',
    'GIT_PAGER=cat git status',
    'echo "push"',
    'git log --oneline',
  ])('geçer: %s', (k) => {
    expect(ret(k)).toBeNull()
  })
})

describe('INV-PUSH-KAPISI-1 — reddedilenler', () => {
  it.each([
    ['git push origin master', 'korunan'],
    ['git push origin main', 'korunan'],
    ['git push origin HEAD:master', 'korunan'],
    ['git push origin feat:refs/heads/main', 'korunan'],
    ['git push origin refs/heads/master', 'korunan'],
    ['git push -u origin master', 'korunan'],
    ['git push --force origin feat-x', 'yasak bayrak'],
    ['git push -f origin feat-x', 'yasak bayrak'],
    ['git push --force-with-lease origin feat-x', 'yasak bayrak'],
    ['git push -uf origin feat-x', 'birleşik'],
    ['git push origin +feat-x', 'force'],
    ['git push origin :feat-x', 'siler'],
    ['git push --delete origin feat-x', 'yasak bayrak'],
    ['git push --mirror origin', 'yasak bayrak'],
    ['git push --all origin', 'yasak bayrak'],
    ['git push https://github.com/x/y.git feat-x', 'adlı bir uzak değil'],
    ['git push git@github.com:x/y.git feat-x', 'adlı bir uzak değil'],
    ['git push origin HEAD:feat-*', 'joker'],
    ['git -C /baska/depo-degil push origin feat-x', 'git deposu değil'],
    ['git -C ../depo-degil push origin feat-x', 'git deposu değil'],
    ['git -C /kardes/ingestor push origin master', 'korunan'],
    ['git -C /kardes/ingestor push -f origin feat-x', 'yasak bayrak'],
    ['git status && git push origin master', 'korunan'],
    ['ls; git push -f origin x', 'yasak bayrak'],
    ['bash -c "git push origin master"', 'korunan'],
    ['eval "git push --force origin x"', 'yasak bayrak'],
    ['FOO=1 git push origin main', 'korunan'],
    ['git -c core.x=1 push origin master', 'global seçeneği'],
    ['git push --receive-pack=evil origin feat-x', 'hedefini'],
    // Otomatik güvenlik incelemesi bulguları (PR #2252): global seçenekler, hedef çözümü, komut tanıma, kabuklar, art arda -C
    ['git -c remote.origin.pushurl=evil push origin feat-x', 'global seçeneği'],
    ['git -c alias.p=push p origin master', 'global seçeneği'],
    ['git --git-dir=/x/.git push origin feat-x', 'global seçeneği'],
    ['git push origin feat:heads/master', 'korunan'],
    ['git push origin feat:refs/tags/v1', 'refs/heads/ dışında'],
    ['git push origin feat:refs/for/x', 'refs/heads/ dışında'],
    ['git push origin @:master', 'korunan'],
    ['/usr/bin/git push origin master', 'korunan'],
    ['"C:/Program Files/Git/cmd/git.exe" push origin master', 'korunan'],
    ['GIT.EXE push -f origin x', 'yasak bayrak'],
    ['env git push origin master', 'korunan'],
    ['sudo git push -f origin x', 'yasak bayrak'],
    ['xargs -n1 git push origin master', 'xargs'],
    ['echo master | xargs git push origin', 'xargs'],
    ['env -S "git push origin master"', 'env -S'],
    ['timeout 30 git push origin master', 'korunan'],
    ['nice -n 5 git push -f origin x', 'yasak bayrak'],
    ['sudo -u root git push origin main', 'korunan'],
    ['GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=remote.origin.pushurl git push origin feat-x', 'ortam değişkeni'],
    ['export GIT_DIR=/baska/.git; git push origin feat-x', 'ortam değişkeni'],
    ['GIT_SSH_COMMAND=evil git push origin feat-x', 'ortam değişkeni'],
    ['pwsh -EncodedCommand ZwBpAHQA', 'kodlanmış'],
    ['powershell -enc ZwBpAHQA', 'kodlanmış'],
    ['bash -c "git push origin $DAL"', 'genişletme'],
    ['git -c core.fsmonitor=evil status', 'global seçeneği'],
    ['git -c core.sshCommand=evil push origin feat-x', 'global seçeneği'],
    ['git -c core.pager=less log', 'global seçeneği'],
    ['git -c core.quotepath=off -c alias.p=push p origin master', 'global seçeneği'],
    ['sudo -u root echo x git push origin master', 'korunan'],
    ['nice -n 5 bash -c x git push -f origin x', 'yasak bayrak'],
    ['bash -lc "git push origin master"', 'korunan'],
    ['pwsh -Command "git push -f origin x"', 'yasak bayrak'],
    ['cmd /c "git push origin main"', 'korunan'],
    ['git -C /baska/depo-degil -C . push origin feat-x', 'git deposu değil'],
    ['git -C //sunucu/paylasim/depo push origin feat-x', 'UNC'],
    ['git -C "\\\\sunucu\\paylasim" push origin feat-x', 'UNC'],
    ['git -C \\\\?\\C:\\depo push origin feat-x', 'UNC'],
  ])('reddeder: %s', (k, parca) => {
    const sonuc = ret(k)
    expect(sonuc, k).not.toBeNull()
    expect(sonuc as string).toContain(parca)
  })

  it('mevcut dal master iken argümansız push ve HEAD reddedilir', () => {
    expect(ret('git push', o('master'))).toContain('master')
    expect(ret('git push origin HEAD', o('main'))).toContain('main')
    expect(ret('git push origin', o('master'))).toContain('master')
    expect(ret('git push origin @', o('master'))).toContain('master')
  })

  it('cd X && git push: mevcut dal çalışma klasöründe değil X\'te ölçülür (OPS notu #2252)', () => {
    const dal = (c: string) => (c.endsWith('ana-master') ? 'master' : 'feat-x')
    const s = (cwd: string): Secenek => ({ cwd, mevcutDal: dal, gitDeposu: () => true })
    expect(ret('cd /depo/ana-master && git push', s(CWD))).toContain('master')
    expect(ret('cd /depo/ana-master && git push origin HEAD', s(CWD))).toContain('master')
    // fail-closed: özgün klasör korunan dalda ise `cd` koşullu/alt kabukta kalmış olabilir → yine reddedilir (güvenlik incelemesi, 3. tur)
    expect(ret('cd /depo/ozellik && git push', s(path.resolve('/depo/ana-master')))).toContain('master')
    expect(ret('cd /depo/ozellik && git push', s(CWD))).toBeNull()
    expect(ret('false || cd /depo/ana-master; git push origin HEAD', s(CWD))).toContain('master')
    // iç içe: bash -c içinde cd, özgün klasör (master) yine ölçülür
    expect(ret('cd /depo/ozellik && bash -c "cd /depo/ozellik2 && git push origin HEAD"', s(path.resolve('/depo/ana-master')))).toContain('master')
    expect(ret('cd //sunucu/paylasim && git push origin feat-x', s(CWD))).toContain('UNC')
    expect(ret('git push', s(path.resolve('/depo/ana-master')))).toContain('master')
    expect(ret('cd /depo/ozellik; git -C ../ana-master push origin HEAD', s(CWD))).toContain('master')
  })

  it('genişletme ve stdin kabuğu atlatmaları kapalı (denetçi bulgusu 1-2, #2252)', () => {
    for (const k of [
      'git push origin $(echo master)',
      'git push origin `echo master`',
      'B=master; git push origin $B',
      'git push origin "$BRANCH"',
      'printf "git push origin master" | bash',
      'echo "git push origin master" | sh',
      'bash <<< "git push origin master"',
    ]) expect(ret(k), k).not.toBeNull()
    // güvenlik incelemesi (#2252, 2. tur): stdin kabuğunun diğer biçimleri ve cmd yükünde # yorum farkı
    for (const k of [
      'echo "git push origin master" | bash -s',
      'echo "git push origin master" | bash -',
      'echo "git push origin master" | bash /dev/stdin',
      'echo "git push origin master" | bash -c "$(cat)"',
      'echo "git push origin master" | sh -c "eval \\"$(cat)\\""',
      'cmd /c "echo x # & git push origin master"',
      'pwsh -Command "echo x # ; git push origin master"',
      'git $(echo push) origin master',
      '$(echo git) push origin master',
      'echo "git push origin master" | ksh',
      'bash < /dev/null; echo "git push origin master" | bash < plan.txt',
    ]) expect(ret(k), k).not.toBeNull()
    expect(ret('git commit -m "$(cat msg.txt)"')).toBeNull()
    expect(ret('which git')).toBeNull()
    // yanlış pozitif olmamalı: push olmayan komutta $ ve ters tırnak, yorum ve -o değeri
    expect(ret('git commit -m "fix `git push` $x"')).toBeNull()
    expect(ret('git push origin feat-x # master')).toBeNull()
    expect(ret('git push origin feat-x -o ci.skip')).toBeNull()
    expect(ret('git push -o ci.skip origin feat-x')).toBeNull()
    expect(ret('git push origin master -o ci.skip')).toContain('korunan')
    expect(ret('git push origin feat#1')).toBeNull()
  })

  it('⛔SABOTAJ: korunan dal listesi boşalsaydı master push geçerdi (kapı gerçekten ayırt ediyor)', () => {
    expect(ret('git push origin master')).not.toBeNull()
    expect(ret('git push origin feat-x')).toBeNull()
  })
})

describe('INV-PUSH-KAPISI-1 — ayrıştırıcı', () => {
  it('tırnak içindeki operatör bölmez', () => {
    expect(motor.parcala('echo "a && git push origin master"')).toEqual([['echo', 'a && git push origin master']])
  })
})

describe('INV-PUSH-KAPISI-1 — ters eğik çizgi + satır sonu (ARC-278)', () => {
  it.each([
    'git \\\npush origin master',
    'git push origin mas\\\nter',
    'git push \\\n  origin \\\n  master',
    'git push origin master \\\n',
    'gi\\\nt push origin master',
    'git \\\r\npush origin master',
    'git push origin "mas\\\nter"',
    'git push --for\\\nce origin feat-x',
    'git push origin feat-x:ma\\\nster',
    'cd /depo/calisma && git \\\npush origin HEAD:refs/heads/mas\\\nter',
  ])('bash satır devamını siler; kapı push ve hedefi doğru görür, reddeder (%j)', (k) => {
    expect(ret(k)).not.toBeNull()
  })

  it('satır devamıyla yazılmış MEŞRU push geçer; tek tırnak içi ters eğik çizgi + satır sonu devam sayılmaz', () => {
    expect(ret('git \\\npush origin feat-x')).toBeNull()
    expect(ret('git push \\\n  -u \\\n  origin feat-x')).toBeNull()
    expect(ret('git push origin feat-x \\\n')).toBeNull()
    // tek tırnak: bash'te literal; ayrıştırıcı jetonu böl-ma-z, push hedefi feat-x
    expect(motor.parcala("echo 'a\\\nb' && git push origin feat-x")).toEqual([["echo", "a\\\nb"], ['git', 'push', 'origin', 'feat-x']])
  })

  it('ayrıştırıcı: satır devamı jetonu birleştirir', () => {
    expect(motor.parcala('git \\\npush origin mas\\\nter')).toEqual([['git', 'push', 'origin', 'master']])
    expect(motor.parcala('echo "a\\\nb"')).toEqual([['echo', 'ab']])
  })
})

describe('INV-PUSH-KAPISI-1 — --no-verify reddi (ARC-277)', () => {
  it.each([
    'git push --no-verify origin feat-x',
    'git push origin feat-x --no-verify',
    'git push -u --no-verify origin feat-x',
    'git -C /depo/calisma push --no-verify origin feat-x',
    'cd /depo/calisma && git push --no-verify origin feat-x',
  ])('pre-push katmanını atlayan bayrak reddedilir (%s)', (k) => {
    expect(ret(k)).toContain('--no-verify')
  })

  it('--no-verify olmadan aynı push geçer (sabotaj kolu: bayrak listesi boşalırsa üstteki kırmızı)', () => {
    expect(ret('git push -u origin feat-x')).toBeNull()
    expect(ret('git push --verify origin feat-x')).toBeNull()
  })
})

describe('INV-PUSH-KAPISI-1 — heredoc gövdesi (ARC-277, MVZ-10 yanlış pozitifi)', () => {
  const veriGovdesi = (govde: string, onek = "cat > betik.cjs <<'E'") => `${onek}\n${govde}\nE`

  it.each([
    "arr.push(1)\nconst G = $(echo)\nfoo $x push",
    'const a = []; a.push(x); $kabuk push',
    '$g push origin master',
    'git push origin master',
  ])('tırnaklı sınırlayıcı + cat alıcısı: gövde veri sayılır, yanlış pozitif yok (%s)', (govde) => {
    expect(ret(veriGovdesi(govde))).toBeNull()
    expect(ret(veriGovdesi(govde, "tee betik.cjs <<'E'"))).toBeNull()
    expect(ret(veriGovdesi(govde, 'cat > betik.cjs <<"E"'))).toBeNull()
  })

  it('gövdeden sonraki GERÇEK komut yine denetlenir', () => {
    expect(ret(veriGovdesi('arr.push(1)') + '\ngit push origin master')).toContain('korunan dal')
    expect(ret("cat > a <<'E' && git push origin master\nx\nE")).toContain('korunan dal')
  })

  it('⛔SABOTAJ: gövdenin KOŞULABİLECEĞİ durumlarda gövde taranmaya devam eder', () => {
    // yorumlayıcı alıcılar
    expect(ret("bash <<'E'\ngit push origin master\nE")).not.toBeNull()
    expect(ret("sh <<'E'\ngit push origin master\nE")).not.toBeNull()
    expect(ret("cat <<'E' | bash\ngit push origin master\nE")).not.toBeNull()
    // bilinen sınır: node/python gövdesinde TIRNAKLI dizge içindeki `git push` bu kancada görülmez (komut metni dışı); katman pre-push (ARC-277 PR2)
    // tırnaksız sınırlayıcı: $(...) çalışır
    expect(ret('cat > a <<E\n$(git push origin master)\nE')).not.toBeNull()
  })

  it('⛔SABOTAJ (güvenlik incelemesi): gövde dosyaya yazılıp aynı komutta koşulursa gövde taranır', () => {
    for (const kos of ['bash betik.sh', 'sh ./betik.sh', './betik.sh', '. ./betik.sh', 'source betik.sh', 'node betik.cjs', 'exec bash betik.sh', 'cat betik.sh | bash'])
      expect(ret(`cat > betik.sh <<'E'\ngit push origin master\nE\n${kos}`)).not.toBeNull()
    // dosya yolu ./ ile yazılsa da (hedef) yürütme sayılmaz
    expect(ret("cat > ./betik.cjs <<'E'\narr.push(1)\n$x push\nE")).toBeNull()
  })

  it('⛔SABOTAJ (3. güvenlik turu): iç içe yükte (eval, bash -c) ayıklama yok; dış kabuk $(...) genişletir', () => {
    expect(ret('eval "cat > a <<\'E\'\n$(git push origin master)\nE"')).not.toBeNull()
    expect(ret('bash -c "cat > a <<\'E\'\n$(git push origin master)\nE"')).not.toBeNull()
    expect(ret('sh -c "cat > a <<\'E\'\n`git push origin master`\nE"')).not.toBeNull()
  })

  it('ayıklayıcı: <<- sekmeli kapanışı tanır; kapanışsız gövde ve erken kapanıştan sonraki satır FAIL-CLOSED (taranır)', () => {
    expect(ret("cat > a <<-'E'\n\tx.push(1)\n\tE")).toBeNull()
    expect(ret("cat > a <<'E'\narr.push(1)\n$x push")).not.toBeNull()
    // gövde içinde erken kapanış satırı: sonrası KOMUTTUR
    expect(ret("cat > a <<'E'\nx\nE\ngit push origin master\nE")).not.toBeNull()
  })

  it('⛔SABOTAJ (2. güvenlik turu): ayrıştırıcı farkı biçimleri ayıklanmaz, gövde taranır', () => {
    const gov = '\n$g push origin master\nE'
    for (const op of [
      "echo 'x\ncat > a <<'E'", // açık tırnak sonrası satır
      "cat > a <<'E' \\", // satır devamı
      "cat > a <<'E' | bash", // boru
      "cat > a <<'E' ; bash a", // zincir
      "cat > a <<'E' && bash a",
      "cat > a <<'E' <<'F'", // ikinci heredoc
      "echo ' <<'E'", // tırnak içi operatör
      "# cat > a <<'E'", // yorum
      "cat $(x) <<'E'", // genişleme
      "cat `x` <<'E'",
      "cat a b <<'E'", // çoklu argüman
      "cat \\<<'E'", // bash'te \< kaçış, heredoc değil (denetçi bulgusu)
      "cat <<<'E'", // here-string
      "cat f # <<'E'",
      "cat \"<<'E'\"",
      "cat > Makefile <<'E'\n\tgit push origin master\nE\nmake #",
      "cat <<'E' | $SHELL",
      "cat <<'E' | ash",
      "cat <<'E' | while read l; do $l; done",
      "dd of=f <<'E'",
      "cat() { $SHELL; }; cat <<'E'",
      "sort --compress-program=/tmp/x <<'E'",
    ])
      expect(motor.heredocGovdesiniAyikla(op + gov)).toBe(op + gov) // ayıklanmaz → gövde eski davranışla taranır
    // Açık tırnak/satır devamı biçimleri ayıklama öncesi de geçiyordu (ARC-250 notu: ayrıştırıcının bilinen sınırı); regresyon değil.
    for (const op of ["cat > a <<'E' | bash", "cat > a <<'E' ; bash a", "cat > a <<'E' && bash a", "cat $(x) <<'E'"]) expect(ret(op + gov)).not.toBeNull()
  })
})

describe('INV-PUSH-KAPISI-1 — kanca süreci', () => {
  const kos = (komut: string, ek: Record<string, string> = {}) =>
    spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: { command: komut }, cwd: KOK }),
      encoding: 'utf8',
      env: { ...process.env, VENTHUB_PUSH_KAPISI_KAPAT: '', ...ek },
    })

  it('korunan dala push deny JSON basar', () => {
    const r = kos('git push origin master')
    expect(r.status).toBe(0)
    const j = JSON.parse(r.stdout)
    expect(j.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(j.hookSpecificOutput.permissionDecisionReason).toContain('[push-kapisi]')
  })

  it('izinli push, push olmayan komut ve bozuk girdi sessiz geçer; vana kapatır', () => {
    expect(kos('git push origin feat-x').stdout).toBe('')
    expect(kos('ls -la').stdout).toBe('')
    expect(kos('git push origin master', { VENTHUB_PUSH_KAPISI_KAPAT: '1' }).stdout).toBe('')
    expect(spawnSync(process.execPath, [KANCA], { input: 'bozuk', encoding: 'utf8' }).status).toBe(0)
  })
})
