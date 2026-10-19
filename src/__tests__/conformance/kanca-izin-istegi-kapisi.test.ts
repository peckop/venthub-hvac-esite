/**
 * INV-KANCA-IZIN-ISTEGI-1 — PermissionRequest kancası (ARC-179): salt-okuma Bash komutları izin sorusu çıkarmadan geçer,
 * diğerleri Recep'e düşmeden modele "OPS'a yaz" denerek reddedilir, her karar kayda yazılır, kanca bozulunca karar VERMEZ.
 *
 * Kanca: .claude/hooks/izin-istegi-kapisi.cjs · Belge: Claude Code hooks, PermissionRequest (kanca allow dese bile
 * deny/ask kuralları önce uygulanır; bu yüzden yasakları aşamaz).
 * Regresyon: 18 Ekim, GEO-SEO'nun salt-okuma zinciri (cd && git status && curl ... "$U" && grep) insana düştü.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const gerek = createRequire(import.meta.url)
const KOK = path.resolve(__dirname, '../../..')
const KANCA = path.join(KOK, '.claude', 'hooks', 'izin-istegi-kapisi.cjs')

interface Kanca {
  siniflandir: (komut: string) => { karar: 'allow' | 'deny'; sebep: string }
  ayristir: (komut: string) => { hata?: string; parcalar?: string[][] }
  RED_MESAJI: string
}
const k = gerek(KANCA) as Kanca

const karar = (komut: string) => k.siniflandir(komut).karar

describe('INV-KANCA-IZIN-ISTEGI-1 · salt-okuma komutlar geçer', () => {
  it.each([
    ['tek git okuma', 'git status'],
    ['GEO-SEO vakası: cd, git, curl, grep zinciri', 'cd src && git status && curl -s "https://example.com/x" && grep -n foo a.txt'],
    ['değişkenli curl: değişken aynı komutta literal atanmış', 'U="https://example.com/a?b=1"; curl -s "$U" | head -20'],
    ['git -C ve 2>&1', 'git -C src log --oneline -3 2>&1'],
    ['gh pr okuma', 'gh pr view 12 --json state'],
    ['gh api GET', 'gh api repos/a/b/pulls/1'],
    ['boru hattı süzgeçleri', 'ls -la | grep foo | wc -l'],
    ['git branch --show-current', 'git branch --show-current'],
    ['curl çıktı /dev/null', 'curl -s -o /dev/null https://example.com/'],
    ['.env.example okunabilir', 'cat .env.example'],
    ['tırnaklı jq süzgeci glob sayılmaz', 'jq ".[0].title" a.json'],
    ['tırnaklı grep deseni glob sayılmaz', 'grep ".*foo" a.txt'],
    ['arama sözcüğü token dosya adı değildir (tek dosya)', 'grep -n token src/a.ts'],
    ['grep sade bayraklar tek dosya', 'grep -n -i -c foo a.txt'],
    ['grep tam adlı uzun seçenek', 'grep --line-number foo a.txt'],
    ['sort sade bayraklarla', 'sort -u a'],
    ['gh api GET açık', 'gh api -X GET repos/a/b'],
    ['gh api --method=GET', 'gh api --method=GET repos/a/b'],
    ['gh api güvenli jq süzgeci', 'gh api repos/a/b/pulls --jq ".[0].title"'],
    ['gh auth status', 'gh auth status'],
    ['curl HEAD (-I) yönlendirmesiz', 'curl -sI https://example.com/'],
    ['URL içinde token geçmesi dosya yolu değildir', 'curl -s "https://example.com/get-token?key=abc"'],
  ])('ALLOW · %s', (_ad, komut) => {
    expect(karar(komut)).toBe('allow')
  })
})

describe('INV-KANCA-IZIN-ISTEGI-1 · yazan, tehlikeli ya da ayrıştırılamayan komutlar reddedilir', () => {
  it.each([
    ['rm', 'rm -rf x'],
    ['zincirin ortasında rm', 'ls && rm a'],
    ['> yönlendirme', 'echo hi > a.txt'],
    ['>> yönlendirme', 'echo hi >> a.txt'],
    ['komut ikamesi', 'echo $(whoami)'],
    ['ters tırnak', 'echo `whoami`'],
    ['git push', 'git push origin x'],
    ['git commit', 'git commit -m x'],
    ['git branch -D', 'git branch -D x'],
    ['git branch yeni dal', 'git branch newbranch'],
    ['curl POST', 'curl -X POST https://example.com/'],
    ['curl -d', 'curl -d a=b https://example.com/'],
    ['curl dosyaya yazar', 'curl -s -o out.txt https://example.com/'],
    ['canlı yazım onay anahtarı dosyası okunamaz', 'cat ~/.claude/ops-yazim-onayi.txt'],
    ['onay anahtarı Windows yoluyla', 'cat ../x/.claude/ops-yazim-onayi.txt'],
    ['onay anahtarı git show biçimi', 'git show HEAD:ops-yazim-onayi.txt'],
    ['~/.claude içine tırnaksız glob (?)', 'cat ~/.claude/ops-yazim-onay?.txt'],
    ['~/.claude içine tırnaksız glob (*)', 'cat ~/.claude/ops*'],
    ['8.3 kısa ad ile anahtar dosyası', 'cat ../x/.claude/OPS-YA~1.TXT'],
    ['diff dizin düzeyinde okuma', 'diff -r ~/.claude /tmp/bos'],
    ['cd ~/.claude sonra glob', 'cd ~/.claude && cat ops*'],
    ['argümansız cd', 'cd && cat ops*'],
    ['cd - önceki dizin', 'cd - && cat ops*'],
    ['cd ~ ev dizini', 'cd ~ && cat ops*'],
    ['cd ~- (OLDPWD)', 'cd ~- && cat ops*'],
    ['cd ~+ (PWD)', 'cd ~+ && cat ops*'],
    ['cd ~kullanici', 'cd ~root && cat ops*'],
    ['cd seçenekli', 'cd -P - && cat ops*'],
    ['cd glob ile .claude', 'cd ~/.cl* && cat ops-yazim-onayi.txt'],
    ['cd 8.3 kısa ad', 'cd ../x/CLAUDE~1 && cat ops*'],
    ['curl yerel adres', 'curl -s http://localhost:3000/x'],
    ['curl bulut meta verisi', 'curl -s http://169.254.169.254/latest'],
    ['tanımsız değişken', 'curl -s "$U"'],
    ['find -exec', 'find . -name a -exec rm {} ;'],
    ['sed -i', 'sed -i s/a/b/ f'],
    ['.env oku', 'cat .env'],
    ['.env.local oku', 'cat .env.local'],
    ['git show ile .env (ayırıcı iki nokta)', 'git show HEAD:.env'],
    ['git show ile .env.local', 'git show main:.env.local'],
    ['oturum anahtarı dosyası', 'cat ~/.claude/.credentials.json'],
    ['aws kimlik dosyası', 'cat ~/.aws/credentials'],
    ['gh hosts.yml', 'cat ~/.config/gh/hosts.yml'],
    ['ssh dizini', 'cat ~/.ssh/config'],
    ['adında token geçen dosya', 'cat secrets/api-token.txt'],
    ['uzantılı token dosyası', 'cat access_token.json'],
    ['nokta-dosya glob', 'cat .e*'],
    ['tüm nokta dosyaları glob', 'cat .*'],
    ['köşeli parantezli nokta dosyası', 'cat .[e]nv'],
    ['arka plan &', 'sleep 5 &'],
    ['alt kabuk', '(cd x && ls)'],
    ['ortam ön eki', 'FOO=1 git status'],
    ['here-doc', 'cat <<EOF\nx\nEOF'],
    ['süreç ikamesi', 'diff <(ls) <(ls)'],
    ['gh api POST', 'gh api -X POST /repos/a/b/issues'],
    ['gh api alan yazar', 'gh api repos/a/b -f title=x'],
    ['git diff --output', 'git diff --output=x.patch'],
    ['jq env sızdırır', 'jq -n env'],
    ['node -e', 'node -e "1"'],
    ['xargs rm', 'ls | xargs rm'],
    ['brace expansion .env dosyasını kurar', 'cat .e{nv,}'],
    ['brace expansion bayrak üretir', 'git status{,}'],
    ['git ls-remote komut çalıştırır', 'git ls-remote --upload-pack=sh origin'],
    ['git ls-remote ağa çıkar', 'git ls-remote origin'],
    ['git log --textconv', 'git log -p --textconv'],
    ['git grep --untracked ignore edilenleri okur', 'git grep --untracked foo'],
    ['git diff --no-index çalışma ağacı dışı okur', 'git diff --no-index a b'],
    ['sort --compress-program komut çalıştırır', 'sort --compress-program=sh a'],
    ['sort -o dosyaya yazar', 'sort -o x a'],
    ['gh api --method=POST', 'gh api --method=POST repos/a/b/issues'],
    ['gh api -X=POST', 'gh api -X=POST repos/a/b/issues'],
    ['gh api --input', 'gh api repos/a/b --input file'],
    ['gh api -H @dosya', 'gh api repos/a/b -H @file'],
    ['gh api --jq env', 'gh api repos/a/b --jq env'],
    ['gh auth status --show-token', 'gh auth status --show-token'],
    ['curl -H @dosya', 'curl -s -H @file https://example.com/'],
    ['curl -w @dosya', 'curl -s -w @out https://example.com/'],
    ['curl -w %output dosya yazar', 'curl -s -w "%output{x.txt}" https://example.com/'],
    ['curl --write-out=%output dosya yazar', 'curl -s --write-out=%output{x.txt} https://example.com/'],
    ['uniq çıkış dosyası yazar', 'uniq in.txt out.txt'],
    ['file -C magic.mgc yazar', 'file -C -m magic'],
    ['file --comp kısaltması magic yazar', 'file --comp -m magic'],
    ['file -0C rakamlı küme magic yazar', 'file -0C -m magic'],
    ['curl yönlendirme izler (SSRF)', 'curl -sL https://example.com/'],
    ['curl IPv6 IPv4-eşlemeli yerel', 'curl -s "http://[::ffff:7f00:1]/"'],
    ['curl URL kullanıcı bilgisi', 'curl -s https://user:pw@example.com/'],
    ['grep -r nokta dizini (.env dahil)', 'grep -rn foo .'],
    ['grep -r ev dizini', 'grep -r token ~'],
    ['grep -r üst dizin', 'grep -rn foo ..'],
    ['grep -r yolsuz (stdin ya da kök belirsiz)', 'grep -rn foo'],
    ['rg --hidden', 'rg --hidden foo'],
    ['rg -uu ignore dosyalarını atlar', 'rg -uu foo'],
    ['tırnaksız glob .env: [!0] sınıfı', 'cat .[!0]nv'],
    ['tırnaksız glob .env: [0e] sınıfı', 'cat .[0e]nv'],
    ['tırnaksız glob .env: ? joker', 'cat .e?v'],
    ['git kısaltması --outp', 'git diff --outp=x.patch'],
    ['git kısaltması --textc', 'git log -p --textc'],
    ['git kısaltması --untrack', 'git grep --untrack foo'],
    ['git kısaltması --no-ind', 'git diff --no-ind a b'],
    ['grep -r1n küme', 'grep -r1n foo .'],
    ['grep -d recurse', 'grep -d recurse foo .'],
    ['grep bitişik -reFOO', 'grep -reFOO .'],
    ['grep --regexp= ile özyineleme', 'grep --regexp=foo -r .'],
    ['rg -nu küme', 'rg -nu foo'],
    ['rg -. gizli dosyalar', 'rg -. foo'],
    ['rg --hid kısaltması', 'rg --hid foo'],
    ['rg --no-ig kısaltması', 'rg --no-ig foo'],
    ['curl URL globbing {}', 'curl -s "http://example.com/{a,b}"'],
    ['curl URL globbing []', 'curl -s "http://example.com/[1-3]"'],
    ['rg ailesi tamamen çıkarıldı', 'rg foo'],
    ['rg -g .env* tırnaklı glob', 'rg -g ".env*" foo'],
    ['rg --glob= ile', 'rg --glob=.env* foo'],
    ['find ailesi çıkarıldı', 'find . -name ".env*"'],
    ['grep --include tırnaklı glob', 'grep -n --include=.env* foo a.txt'],
    ['grep --exclude-dir', 'grep -n --exclude-dir=x foo a.txt'],
    ['grep uzun seçenek kısaltması --recurs', 'grep --recurs foo .'],
    ['grep uzun seçenek kısaltması --dir=recurse', 'grep --dir=recurse foo .'],
    ['grep -r bir dizin üzerinde', 'grep -rn foo src'],
    ['git pathspec :(glob)', 'git log -- ":(glob)**/.env*"'],
    ['git grep pathspec sihri', 'git grep foo -- ":(glob).env*"'],
    ['date -s saati değiştirir', 'date -s 10:00'],
    ['tail -f sonsuz bekler', 'tail -f log.txt'],
    ['kapanmamış tırnak', 'ls "unclosed'],
    ['boş komut', ''],
  ])('DENY · %s', (_ad, komut) => {
    expect(karar(komut)).toBe('deny')
  })

  it('ayrıştırma hatası sebebi söyler (kayıtta işe yarar)', () => {
    expect(k.siniflandir('echo $(whoami)').sebep).toMatch(/ayrıştırılamadı/)
    expect(k.siniflandir('rm a').sebep).toMatch(/salt-okuma listesinde değil/)
  })
})

describe('INV-KANCA-IZIN-ISTEGI-1 · kanca süreci (stdin → stdout, kayıt)', () => {
  const kayitDizini = fs.mkdtempSync(path.join(os.tmpdir(), 'izin-kayit-'))
  const calistir = (girdi: unknown, ham?: string) =>
    spawnSync(process.execPath, [KANCA], {
      input: ham ?? JSON.stringify(girdi),
      encoding: 'utf8',
      env: { ...process.env, IZIN_KAYIT_DIZINI: kayitDizini },
    })
  const bash = (command: string, ek: Record<string, unknown> = {}) => ({
    hook_event_name: 'PermissionRequest',
    tool_name: 'Bash',
    tool_input: { command },
    session_id: 'test-oturumu',
    cwd: os.tmpdir(),
    permission_mode: 'default',
    ...ek,
  })
  const kararOku = (cikti: string) => JSON.parse(cikti).hookSpecificOutput

  it('zararsız komut: PermissionRequest allow kararı', () => {
    const r = calistir(bash('git status'))
    expect(r.status).toBe(0)
    const o = kararOku(r.stdout)
    expect(o.hookEventName).toBe('PermissionRequest')
    expect(o.decision.behavior).toBe('allow')
  })

  it('zararlı komut: deny + modele mesaj, Recep sorusu yok, interrupt kapalı', () => {
    const r = calistir(bash('ls && rm a'))
    const o = kararOku(r.stdout)
    expect(o.decision.behavior).toBe('deny')
    expect(o.decision.message).toBe(k.RED_MESAJI)
    expect(o.decision.message).toMatch(/OPS'a SendMessage/)
    expect(o.decision.interrupt).toBe(false)
  })

  it('Bash dışı araç: karar yok, izin akışı değişmez', () => {
    const r = calistir({ ...bash('x'), tool_name: 'Edit' })
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })

  it('OPS penceresi (agent_type ops-pencere): karar yok, kayıtta muaf', () => {
    const r = calistir(bash('rm -rf x', { agent_type: 'ops-pencere' }))
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })

  it('bozuk girdi: karar yok, çıkış 0 (kanca hatası işi kilitlemez)', () => {
    const r = calistir(null, '{bozuk json')
    expect(r.status).toBe(0)
    expect(r.stdout).toBe('')
  })

  it('kayıt: Bearer, -u parola, URL kullanıcı bilgisi, AWS ve Slack anahtarları maskelenir', () => {
    const yerel = fs.mkdtempSync(path.join(os.tmpdir(), 'izin-kayit-gizli-'))
    const komut =
      'curl -s -H "Authorization: Bearer abcdef123456ghijkl" -u admin:hunter2pass https://usr:pwd9@example.com/ AKIAABCDEFGHIJKLMNOP xoxb-1234567890-abcdefghij'
    spawnSync(process.execPath, [KANCA], {
      input: JSON.stringify(bash(komut)),
      encoding: 'utf8',
      env: { ...process.env, IZIN_KAYIT_DIZINI: yerel },
    })
    const gun = new Date().toISOString().slice(0, 10)
    const ham = fs.readFileSync(path.join(yerel, `${gun}.jsonl`), 'utf8')
    for (const sir of ['abcdef123456ghijkl', 'hunter2pass', 'pwd9', 'AKIAABCDEFGHIJKLMNOP', 'xoxb-1234567890-abcdefghij']) {
      expect(ham, `kayıtta sır kaldı: ${sir}`).not.toContain(sir)
    }
    expect(ham).toMatch(/GIZLI/)
  })

  it('her karar kayda yazılır; komuttaki sır maskelenir', () => {
    calistir(bash('curl -s https://example.com/?token=abc123supersecret'))
    const gun = new Date().toISOString().slice(0, 10)
    const satirlar = fs.readFileSync(path.join(kayitDizini, `${gun}.jsonl`), 'utf8').trim().split('\n').map((s) => JSON.parse(s))
    expect(satirlar.length).toBeGreaterThanOrEqual(4)
    const son = satirlar[satirlar.length - 1]
    expect(son.karar).toBe('allow')
    expect(son.komut).not.toMatch(/abc123supersecret/)
    expect(son.komut).toMatch(/GIZLI/)
    expect(satirlar.some((s) => s.karar === 'deny')).toBe(true)
    expect(satirlar.some((s) => s.karar === 'muaf')).toBe(true)
    for (const s of satirlar) {
      expect(Object.keys(s)).toEqual(expect.arrayContaining(['t', 'sid', 'pencere', 'kip', 'komut', 'karar', 'sebep']))
    }
  })
})

type Grup = { matcher?: string; hooks?: { command?: string; onFailure?: string }[] }
const grupBul = (gruplar: Grup[]) => gruplar.find((g) => (g.hooks ?? []).some((h) => /izin-istegi-kapisi\.cjs/.test(h.command ?? '')))
const grupDogru = (g: Grup | undefined) => {
  expect(g, 'izin-istegi-kapisi kaydı yok').toBeDefined()
  expect(g?.matcher).toBe('Bash')
  for (const h of g?.hooks ?? []) expect(h.onFailure).not.toBe('block')
}

describe('INV-KANCA-IZIN-ISTEGI-1 · kayıt parçası ve ayar', () => {
  it('hazır ayar parçası PermissionRequest altında Bash eşleştiricili; onFailure block DEĞİL (kanca bozulursa iş kilitlenmez)', () => {
    const parca = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'izin-istegi-kapisi.settings-parcasi.json'), 'utf8'))
    grupDogru(grupBul(parca.PermissionRequest ?? []))
  })

  it('settings.json PermissionRequest altında izin-istegi-kapisi KAYITLI (karar 398, Recep onayı OPS penceresinde) ve biçim doğru', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    grupDogru(grupBul(ayar.hooks?.PermissionRequest ?? []))
  })

  it('ayardaki kayıt hazır parçayla AYNI (parça ile ayar ayrışmasın)', () => {
    const ayar = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'settings.json'), 'utf8'))
    const parca = JSON.parse(fs.readFileSync(path.join(KOK, '.claude', 'hooks', 'izin-istegi-kapisi.settings-parcasi.json'), 'utf8'))
    expect(ayar.hooks.PermissionRequest).toEqual(parca.PermissionRequest)
  })
})
