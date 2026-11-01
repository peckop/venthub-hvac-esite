#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Git GECMISI sir taramasi — 20 imza x tum gecmis (`git log --all -S/-G`).

NICIN REPODA: `docs/audits/secret-exposure-audit-2026-08-15.md` "bu denetim nasil
tekrarlanir" diyor ve mutlak bir yerel yol gosteriyordu (`C:/Users/alize/venthub-
secret-tarama/scan.py`). Yani belgelenen yordam TEK MAKINEDE calisiyordu; baska
biri — ya da taze bir klon — tekrarlayamazdi. Olcum betige donusmezse tartisma
geri gelir; betik repoya girmezse ayni sey.

GUVENLIK: bu dosyada HICBIR sir yok, yalnizca imza desenleri. Hicbir degerin KENDISI
konsola ya da rapora yazilmaz: yalnizca degerin sha256 on eki (8 hane = parmak izi),
uzunluk, commit ve dosya yolu. Tam deger yalniz `--tam-deger` ile ve `--out` raporuna
yazilir; o dosya GIT'E GIRMEZ (.gitignore).

KAPATILMIS BULGULAR (ALT-102/ALT-103): degeri DONDURULMUS (eski anahtar olu) bulgular
`scripts/security/secret-scan-kapatildi.json` icinde (imza adi + parmak izi + durum)
tutulur. Bu listedeki bir deger yeniden bulunursa "KAPATILDI" diye SAYILIR ve uyari
uretmez. Listede OLMAYAN her gercek gorunumlu deger KIRMIZIdir (cikis kodu 1): yeni bir
sizinti kapatilmis sayilmaz. Liste degeri icermez; parmak izi tersine cevrilemez.

KULLANIM
    python scripts/security/secret-scan.py
    python scripts/security/secret-scan.py --ulasilamayan
    python scripts/security/secret-scan.py --repo <yol> --out <rapor.txt> [--tam-deger]

    --ulasilamayan : ek olarak, hicbir dal/etiketten erisilemeyen (dangling) commit'leri
                     de tarar (`git fsck --unreachable --no-reflogs`). GitHub bu commit'leri
                     numarasiyla sunmaya devam edebilir; `--all` bunlari GORMEZ.

CIKIS KODU: 0 = acik (kapatilmamis) bulgu yok; 1 = en az bir acik bulgu; 2 = kapatma
listesi okunamadi (sessizce her seyi kirmizi/yesil saymayiz).

NE ZAMAN KOSULUR
  * gorunurluk degistirmeden ONCE (private -> public tek yonlu kapidir),
  * riskli bir commit'ten once,
  * "sizmis mi?" tartismasi her acildiginda — hatirlamak yerine OLC.

BULUNAN TOKEN OLU MU? Tahmin etme, CAGIR — ve KONTROL GRUBU koy:
    Supabase : GET https://api.supabase.com/v1/projects   Authorization: Bearer <sbp_...>
    GitHub   : GET https://api.github.com/user            Authorization: Bearer <ghp_...>
Ayni cagriyi bilerek BOZUK bir degerle de yap. Iki cevap AYNI geliyorsa arac
olcmuyordur. (2026-08-15: User-Agent'siz istek Supabase'in onundeki Cloudflare'e
takilip `403 error code: 1010` dondu; "token olu" diye okundu ve YANLISTI. Gercek
token `401 "Unauthorized"`, bozuk token `401 "JWT could not be decoded"` verir.)

Yeni imza eklemek icin SIGS listesine (ad, kip, `git log` icin dize/regex, tam degeri
cikaran regex, regex grubu) besilisini ekle. Kip `S` = sabit dize (-S), `G` = regex (-G).
"""
import argparse
import hashlib
import io
import json
import os
import re
import subprocess
import sys

_here = os.path.dirname(os.path.abspath(__file__))
_default_repo = os.path.abspath(os.path.join(_here, '..', '..'))
_default_kapatildi = os.path.join(_here, 'secret-scan-kapatildi.json')

_ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
_ap.add_argument('--repo', default=_default_repo, help='taranacak git deposu (varsayilan: bu betigin deposu)')
_ap.add_argument('--out', default=os.path.join(_default_repo, 'TAM-RAPOR.txt'),
                 help="rapor dosyasi (.gitignore'da) — commit ETME")
_ap.add_argument('--ulasilamayan', action='store_true',
                 help='erisilemeyen (dangling) commit\'leri de tara')
_ap.add_argument('--kapatildi', default=_default_kapatildi,
                 help='kapatilmis bulgu listesi (JSON)')
_ap.add_argument('--tam-deger', action='store_true',
                 help='TAM degerleri rapora yaz (varsayilan: yazma; konsola ASLA yazilmaz)')
_args = _ap.parse_args()
REPO = _args.repo
OUT = _args.out

# (ad, kip, git log icin dize/regex, tam degeri cikaran regex, regex grubu: 0 = tum eslesme)
SIGS = [
 ("Supabase access token (sbp_)",      "S", "sbp_",              r"sbp_[A-Za-z0-9]{20,}", 0),
 ("Supabase service_role JWT",         "S", "InNlcnZpY2Vfcm9sZSI", r"eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{40,}\.[A-Za-z0-9_\-]{20,}", 0),
 ("GitHub klasik PAT (ghp_)",          "S", "ghp_",              r"ghp_[A-Za-z0-9]{30,}", 0),
 ("GitHub fine-grained PAT",           "S", "github_pat_",       r"github_pat_[A-Za-z0-9_]{50,}", 0),
 ("GitHub OAuth/Server token",         "S", "ghs_",              r"gh[sou]_[A-Za-z0-9]{30,}", 0),
 ("Google/Gemini API key (AIza)",      "S", "AIza",              r"AIza[0-9A-Za-z_\-]{35}", 0),
 ("Slack webhook",                     "S", "hooks.slack.com",   r"https://hooks\.slack\.com/services/[A-Za-z0-9/]+", 0),
 ("Slack bot token",                   "S", "xoxb-",             r"xox[baprs]-[A-Za-z0-9\-]{10,}", 0),
 ("Supabase webhook secret",           "S", "whsec_",            r"whsec_[A-Za-z0-9_]{8,}", 0),
 ("Resend API key",                    "S", "re_",               r"\bre_[A-Za-z0-9_]{16,}", 0),
 ("Twilio Account/Key SID",            "S", "AC",                r"\b(?:AC|SK)[0-9a-f]{32}\b", 0),
 ("Anthropic API key",                 "S", "sk-ant-",           r"sk-ant-[A-Za-z0-9_\-]{20,}", 0),
 ("OpenAI API key",                    "S", "sk-proj-",          r"sk-proj-[A-Za-z0-9_\-]{20,}", 0),
 ("OpenRouter API key",                "S", "sk-or-v1-",         r"sk-or-v1-[A-Za-z0-9]{16,}", 0),
 ("Ozel anahtar blogu",                "S", "PRIVATE KEY-----",  r"-----BEGIN [A-Z ]*PRIVATE KEY-----", 0),
 ("Cloudflare API token atamasi",      "S", "CF_API_TOKEN",      r"CF_API_TOKEN\s*[:=]\s*['\"][^'\"]{20,}['\"]", 0),
 ("E2E admin sifresi atamasi",         "S", "E2E_ADMIN_PASSWORD", r"E2E_ADMIN_PASSWORD\s*[:=]\s*['\"][^'\"]{4,}['\"]", 0),
 ("Jules API key atamasi",             "S", "JULES_API_KEY",     r"JULES_API_KEY\s*[:=]\s*['\"][^'\"]{10,}['\"]", 0),
 # ALT-102: 15 Agustos taramasinda bu iki imza yoktu; sizan Postgres sifresi bu yuzden gorunmedi.
 # Parmak izi yalniz SIFRE kismindan (regex grubu 1) alinir; baglanti dizesinin geri kalani degildir.
 ("Postgres baglanti dizesi (kullanici:sifre@)", "G",
  r"postgres(ql)?://[^:@/ '\"]+:[^@/ '\"]{4,}@",
  r"postgres(?:ql)?://[^:@/\s'\"]+:([^@/\s'\"]{4,})@", 1),
 ("SUPABASE_DB_PASSWORD atamasi",      "G",
  r"SUPABASE_DB_PASSWORD[ \t]*[:=][ \t]*['\"]?[^'\"\s$<{ ]{6,}",
  r"SUPABASE_DB_PASSWORD[ \t]*[:=][ \t]*['\"]?([^'\"\s$<{ ]{6,})", 1),
]

# Gercek olmayan degerleri eler: test/ornek sozcukleri ve yer tutucu kaliplari
# ($, ${, <, ***, [, {{, %s gibi). "password" sozcugu de elenir (ornek atamalar).
NOISE = re.compile(r'(test|mock|dummy|example|placeholder|fake|sample|\.anon$|REMOVED'
                   r'|^\$|\$\{|<|\*{3}|password|^x+$|^\.\.\.|\[|\{\{|%s|%\()', re.I)


def git(args, inp=None):
    return subprocess.run(['git', '-C', REPO] + args, capture_output=True, text=True,
                          encoding='utf-8', errors='replace', input=inp).stdout


def parmak_izi(v):
    """Degerin sha256 on eki (8 hane). Tersine cevrilemez; ayni degeri tekrar saymamak
    ve kapatma listesiyle eslemek icin kullanilir."""
    return hashlib.sha256(v.encode('utf-8', 'replace')).hexdigest()[:8]


YOL_KAYITLARI = []


def kapatilmis_yukle(yol):
    """{(imza, parmak_izi): durum}. Dosya yoksa bos liste (hicbir sey kapatilmis degildir);
    bozuksa cikis 2 — okunamayan liste sessizce 'hepsi kirmizi' ya da 'hepsi yesil' olmaz."""
    if not os.path.exists(yol):
        return {}
    try:
        with io.open(yol, encoding='utf-8') as f:
            veri = json.load(f)
        sonuc = {}
        for k in veri['kayitlar']:
            sonuc[(k['imza'], k['parmak_izi'])] = k['durum']
        # ALT-107: imza bulgusu OLMAYAN, kapatilmis GECMIS YOLLARI. Zorunlu degil; varsa her satir
        # kapsam + durum (bos olmayan metin) tasimali, yoksa liste bozuk sayilir (cikis 2).
        for y in veri.get('yol_kayitlari', []):
            if not (isinstance(y['kapsam'], str) and isinstance(y['durum'], str) and y['kapsam'] and y['durum']):
                raise TypeError('yol_kayitlari satiri')
            YOL_KAYITLARI.append((y['kapsam'], y['durum']))
        return sonuc
    except (OSError, ValueError, KeyError, TypeError) as e:
        print(f"HATA: kapatma listesi okunamadi ({yol}): {type(e).__name__}", file=sys.stderr)
        sys.exit(2)


def ulasilamayan_commitler():
    """Hicbir ref ve reflog'dan erisilemeyen commit'ler (dangling). Cikti satiri:
    `unreachable commit <sha>`."""
    cikti = git(['fsck', '--unreachable', '--no-reflogs', '--no-progress'])
    return [s.split()[2] for s in cikti.split('\n') if s.startswith('unreachable commit ')]


def tara(sig, kapsam, kapatilmis):
    """Bir imzayi bir kapsamda tara. kapsam: ('all',) ya da ('rev', [sha, ...]).
    Doner: (bulunan_commit_sayisi, {parmak_izi: {len, c, f}})."""
    ad, kip, igne, rx, grp = sig
    bayrak = ('-S' if kip == 'S' else '-G') + igne
    # Tek `git log -p` sureci: eslesen her commit'in yamasi akar, commit basina ayri `git show` YOK.
    komut = ['log', '-U0', '-p', '--format=@@C %H %ad %s', '--date=short', bayrak]
    inp = None
    if kapsam[0] == 'all':
        komut.insert(1, '--all')
    else:
        komut[1:1] = ['--no-walk=unsorted', '--stdin']
        inp = '\n'.join(kapsam[1]) + '\n'
    cikti = git(komut, inp=inp)
    pat = re.compile(rx)
    hits = {}
    commit = None
    meta = ''
    dosya = None
    n_commit = 0
    for line in cikti.split('\n'):
        if line.startswith('@@C '):
            _, sha, rest = (line.split(' ', 2) + [''])[:3]
            commit, meta, dosya = sha, rest[:80], None
            n_commit += 1
            continue
        if line.startswith('+++ b/'):
            dosya = line[6:]
            continue
        if not line.startswith('+') or line.startswith('+++') or commit is None:
            continue
        for m in pat.finditer(line):
            v = m.group(grp) if grp else m.group(0)
            if NOISE.search(v):
                continue
            e = hits.setdefault(parmak_izi(v), {'len': len(v), 'c': set(), 'f': set(), 'v': v})
            e['c'].add(f"{commit[:9]} {meta}")
            e['f'].add(dosya or '?')
    return n_commit, hits


def main():
    # Windows konsolu/yonlendirmesi varsayilan kod sayfasinda Turkce karakteri bozar; cikti UTF-8 olsun.
    for akis in (sys.stdout, sys.stderr):
        try:
            akis.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    kapatilmis = kapatilmis_yukle(_args.kapatildi)
    kapsamlar = [('erisilebilir (--all)', ('all',))]
    if _args.ulasilamayan:
        revs = ulasilamayan_commitler()
        print(f"[bilgi] erisilemeyen commit sayisi: {len(revs)}", flush=True)
        if revs:
            kapsamlar.append(('ULASILAMAYAN (dangling)', ('rev', revs)))

    rep = io.open(OUT, 'w', encoding='utf-8')

    def say(s, konsol=True):
        if konsol:
            print(s, flush=True)
        rep.write(s + '\n')

    rep.write("VENTHUB — GIT GECMISI SIR TARAMASI\nBu dosya git'te DEGIL. Kontrol edip SIL.\n")
    rep.write("=" * 70 + "\n\n")
    if _args.tam_deger:
        rep.write("UYARI: --tam-deger verildi; bu dosya TAM degerleri icerir.\n\n")

    acik = 0
    kapali = 0
    for kapsam_ad, kapsam in kapsamlar:
        say(f"\n=== KAPSAM: {kapsam_ad} ===")
        for sig in SIGS:
            ad = sig[0]
            n, hits = tara(sig, kapsam, kapatilmis)
            if not n:
                say(f"[TEMIZ] {ad}")
                continue
            if not hits:
                say(f"[temiz] {ad} — {n} commit tarandi, gercek gorunumlu deger yok")
                continue
            acik_h = {k: e for k, e in hits.items() if (ad, k) not in kapatilmis}
            kapali_h = {k: e for k, e in hits.items() if (ad, k) in kapatilmis}
            kapali += len(kapali_h)
            acik += len(acik_h)
            if acik_h:
                say(f"[!! ACIK] {ad}: {len(acik_h)} KAPATILMAMIS deger ({n} commit tarandi)")
            else:
                say(f"[kapatildi] {ad}: {len(kapali_h)} deger, hepsi kapatma listesinde")
            for k, e in sorted(hits.items()):
                durum = kapatilmis.get((ad, k))
                etiket = f"KAPATILDI: {durum}" if durum else "ACIK — KIRMIZI"
                say(f"    parmak_izi={k} uzunluk={e['len']} commit={len(e['c'])} "
                    f"dosya={sorted(e['f'])[:4]} -> {etiket}")
                for c in sorted(e['c'])[:4]:
                    say(f"        - {c}")
                if _args.tam_deger:
                    rep.write(f"        DEGER: {e['v']}\n")

    if YOL_KAYITLARI:
        say("\n=== KAPATILMIS GECMIS YOLLARI (bilgi; imza bulgusu degil, SIR bulgusunu kapatmaz) ===")
        for kapsam_y, durum_y in YOL_KAYITLARI:
            say(f"    {kapsam_y} -> {durum_y}")

    say(f"\n==== TARAMA BITTI — acik (kapatilmamis): {acik} · kapatilmis: {kapali} ====")
    rep.close()
    print("RAPOR:", OUT, flush=True)
    return 1 if acik else 0


if __name__ == '__main__':
    sys.exit(main())
