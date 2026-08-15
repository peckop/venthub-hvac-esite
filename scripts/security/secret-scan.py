#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Git GECMISI sir taramasi — 18 imza x tum gecmis (`git log --all -S`).

NICIN REPODA: `docs/audits/secret-exposure-audit-2026-08-15.md` "bu denetim nasil
tekrarlanir" diyor ve mutlak bir yerel yol gosteriyordu (`C:/Users/alize/venthub-
secret-tarama/scan.py`). Yani belgelenen yordam TEK MAKINEDE calisiyordu; baska
biri — ya da taze bir klon — tekrarlayamazdi. Olcum betige donusmezse tartisma
geri gelir; betik repoya girmezse ayni sey.

GUVENLIK: bu dosyada HICBIR sir yok, yalnizca imza desenleri. Bulunan TAM degerler
yalnizca `--out` ile verilen rapora yazilir ve o dosya GIT'E GIRMEZ (.gitignore).
Konsol ciktisi daima MASKELIDIR.

KULLANIM
    python scripts/security/secret-scan.py
    python scripts/security/secret-scan.py --repo <yol> --out <rapor.txt>

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

Yeni imza eklemek icin SIGS listesine (ad, `git -S` icin sabit dize, tam degeri
cikaran regex) uclusu ekle.
"""
import argparse
import io
import os
import re
import subprocess

_here = os.path.dirname(os.path.abspath(__file__))
_default_repo = os.path.abspath(os.path.join(_here, '..', '..'))

_ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
_ap.add_argument('--repo', default=_default_repo, help='taranacak git deposu (varsayilan: bu betigin deposu)')
_ap.add_argument('--out', default=os.path.join(_default_repo, 'TAM-RAPOR.txt'),
                 help="TAM degerlerin yazilacagi rapor (.gitignore'da) — commit ETME")
_args = _ap.parse_args()
REPO = _args.repo
OUT = _args.out

# (ad, git -S icin sabit dize, tam degeri cikaran regex)
SIGS = [
 ("Supabase access token (sbp_)",      "sbp_",              r"sbp_[A-Za-z0-9]{20,}"),
 ("Supabase service_role JWT",         "InNlcnZpY2Vfcm9sZSI", r"eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{40,}\.[A-Za-z0-9_\-]{20,}"),
 ("GitHub klasik PAT (ghp_)",          "ghp_",              r"ghp_[A-Za-z0-9]{30,}"),
 ("GitHub fine-grained PAT",           "github_pat_",       r"github_pat_[A-Za-z0-9_]{50,}"),
 ("GitHub OAuth/Server token",         "ghs_",              r"gh[sou]_[A-Za-z0-9]{30,}"),
 ("Google/Gemini API key (AIza)",      "AIza",              r"AIza[0-9A-Za-z_\-]{35}"),
 ("Slack webhook",                     "hooks.slack.com",   r"https://hooks\.slack\.com/services/[A-Za-z0-9/]+"),
 ("Slack bot token",                   "xoxb-",             r"xox[baprs]-[A-Za-z0-9\-]{10,}"),
 ("Supabase webhook secret",           "whsec_",            r"whsec_[A-Za-z0-9_]{8,}"),
 ("Resend API key",                    "re_",               r"\bre_[A-Za-z0-9_]{16,}"),
 ("Twilio Account/Key SID",            "AC",                r"\b(?:AC|SK)[0-9a-f]{32}\b"),
 ("Anthropic API key",                 "sk-ant-",           r"sk-ant-[A-Za-z0-9_\-]{20,}"),
 ("OpenAI API key",                    "sk-proj-",          r"sk-proj-[A-Za-z0-9_\-]{20,}"),
 ("OpenRouter API key",                "sk-or-v1-",         r"sk-or-v1-[A-Za-z0-9]{16,}"),
 ("Ozel anahtar blogu",                "PRIVATE KEY-----",  r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
 ("Cloudflare API token atamasi",      "CF_API_TOKEN",      r"CF_API_TOKEN\s*[:=]\s*['\"][^'\"]{20,}['\"]"),
 ("E2E admin sifresi atamasi",         "E2E_ADMIN_PASSWORD",r"E2E_ADMIN_PASSWORD\s*[:=]\s*['\"][^'\"]{4,}['\"]"),
 ("Jules API key atamasi",             "JULES_API_KEY",     r"JULES_API_KEY\s*[:=]\s*['\"][^'\"]{10,}['\"]"),
]

def git(args, **kw):
    return subprocess.run(['git','-C',REPO]+args, capture_output=True, text=True,
                          encoding='utf-8', errors='replace', **kw).stdout

def mask(v):
    return v[:12] + '…' + v[-4:] if len(v) > 20 else v[:6] + '…'

report = io.open(OUT,'w',encoding='utf-8')
report.write("VENTHUB — GIT GECMISI SIR TARAMASI\n")
report.write("Bu dosya git'te DEGIL. Kontrol edip SIL.\n")
report.write("="*70 + "\n\n")

TEST_NOISE = re.compile(r'(test|mock|dummy|example|placeholder|fake|sample|\.anon$|REMOVED)', re.I)
total_real = 0

for name, needle, rx in SIGS:
    shas = [l.split()[0] for l in git(['log','--all','--format=%H %ad %s','--date=short','-S',needle]).strip().split('\n') if l.strip()]
    if not shas:
        print(f"[TEMIZ] {name}", flush=True); continue
    pat = re.compile(rx)
    hits = {}
    for sha in shas[:60]:
        meta = git(['log','-1','--format=%ad %s','--date=short',sha]).strip()[:90]
        for m in pat.findall(git(['show','--format=','-U0',sha])):
            val = m if isinstance(m,str) else m[0]
            hits.setdefault(val, set()).add(f"{sha[:9]} {meta}")
    real = {k:v for k,v in hits.items() if not TEST_NOISE.search(k)}
    noise = len(hits) - len(real)
    if real:
        total_real += len(real)
        print(f"[!! BULUNDU] {name}: {len(real)} benzersiz deger ({noise} test/sahte elendi)", flush=True)
        report.write(f"### {name} — {len(real)} deger\n")
        for v, cs in real.items():
            print(f"      {mask(v)}  ({len(v)} karakter)", flush=True)
            report.write(f"  DEGER: {v}\n")
            for c in sorted(cs): report.write(f"    - {c}\n")
            report.write("\n")
        report.write("\n")
    else:
        print(f"[temiz] {name} — {len(hits)} eslesme ama hepsi test/sahte", flush=True)

report.write(f"\nTOPLAM GERCEK GORUNUMLU DEGER: {total_real}\n")
report.close()
print(f"\n==== TARAMA BITTI — toplam {total_real} gercek gorunumlu deger ====", flush=True)
print("TAM RAPOR:", OUT, flush=True)
