#!/usr/bin/env python
"""KONUSMA GUNLUGU — oturum transkriptlerinden gun bazli, SIR SUZGECINDEN gecmis konusma ozeti (deterministik).

Recep 2026-09-04: "konusma gecmisini de NLM'e koysak" → bu betik. Kaynak: ~/.claude/projects/c--Users-alize-venthub-hvac/*.jsonl
(yalniz ana oturumlar; alt-ajan/sidechain ve isMeta (pano trafigi, kanca ciktisi, akran mesaji) ATLANIR). Yalniz
user (Recep) ve assistant METNI alinir; tool_use / tool_result / thinking asla alinmaz (dosya icerikleri, sirlar, gurultu).

CIKTI DEPOYA GIRMEZ (repo PUBLIC). Gunluk dosyalari hafiza kokunun yanina yazilir:
  ~/.claude/projects/c--Users-alize-venthub-hvac/konusma-gunlugu/<YYYY-MM-DD>.md   (gun = Turkiye gunu, UTC+3)
Manifest demeti 12 (kok "gunluk") bunlari deftere tasir. Ayni girdi -> ayni cikti (sirali, damgasiz).

SIR SUZGECI ZORUNLU ve KAPATILAMAZ: postgres URI parolasi, JWT, sk-/ghp_/github_pat_/sbp_/xox/AKIA/re_/whsec_ onekleri,
"parola|password|secret|token|api key = deger" kaliplari, 60+ karakterlik bosluksuz base64 dizeler → [SIR-KALDIRILDI].
Deger HIC basilmaz; rapor yalniz SAYI verir.

Komutlar:
  python scripts/nlm/konusma_gunlugu.py olc              # gun/girdi/bayt/sir sayimi, dosya YAZMAZ
  python scripts/nlm/konusma_gunlugu.py uret             # gunluk dosyalarini yaz (klasoru sifirdan kurar)
  python scripts/nlm/konusma_gunlugu.py uret --gun 2026-09-04
Cikis kodu: 0 basari · 2 kaynak klasor yok.
Cetvel: docs/standards/proje-takip-defteri-standard.md §8
"""
from __future__ import annotations
import glob, json, os, re, sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

sys.stdout.reconfigure(encoding="utf-8")
KAYNAK = os.path.expanduser(os.environ.get("VENTHUB_PROJE_TAKIP_TRANSKRIPT") or "~/.claude/projects/c--Users-alize-venthub-hvac")
HEDEF = os.path.expanduser(os.environ.get("VENTHUB_PROJE_TAKIP_GUNLUK") or "~/.claude/projects/c--Users-alize-venthub-hvac/konusma-gunlugu")
TR = timezone(timedelta(hours=3))
SERIT = {"cb0467f1": "OPS-AUDIT", "4a8eaf9c": "URUN", "ac03ce11": "ALTYAPI"}

SIR = [
    re.compile(r"postgres(?:ql)?://[^:@\s/]+:[^@\s]+@"),
    re.compile(r"eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
    re.compile(r"\b(?:sk-[A-Za-z0-9_-]{20,}|sk_(?:live|test)_[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sbp_[a-f0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16}|re_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,})\b"),
    re.compile(r"(?i)\b(parola|password|passwd|secret|token|api[_ -]?key|service[_ -]?role[_ -]?key|anon[_ -]?key)\b\s*[:=]\s*[\"']?([^\s\"',;]{8,})"),
    re.compile(r"(?<![A-Za-z0-9+/=])[A-Za-z0-9+/]{60,}={0,2}(?![A-Za-z0-9+/=])"),
]
GURULTU = [
    re.compile(r"<system-reminder>.*?</system-reminder>", re.S),
    re.compile(r"<local-command-[a-z]+>.*?</local-command-[a-z]+>", re.S),
    re.compile(r"<command-(?:name|message|args)>.*?</command-(?:name|message|args)>", re.S),
    re.compile(r"<ide_selection>.*?</ide_selection>", re.S),
    re.compile(r"<task-notification>.*?</task-notification>", re.S),
    re.compile(r"<cross-session-message[^>]*>.*?</cross-session-message>", re.S),
]


SIR_SAYAC = [0] * len(SIR)  # desen basina kac kez vurdu (deger degil, sayi)
KIP = "ozet"  # recep: yalniz Recep · ozet: Recep tam + her turun SON Claude cevabi (ilk OZET_KR kr) · tam: hepsi
OZET_KR = 1500


def sir_suz(t: str):
    n = 0
    for i, p in enumerate(SIR):
        t, k = p.subn(lambda m: (m.group(1) + ": [SIR-KALDIRILDI]") if m.lastindex and m.lastindex >= 2 else "[SIR-KALDIRILDI]", t)
        SIR_SAYAC[i] += k
        n += k
    return t, n


def temizle(t: str) -> str:
    for p in GURULTU:
        t = p.sub("", t)
    t = t.strip()
    if t.startswith("[Request interrupted") or t.startswith("Another Claude session sent a message"):
        return ""
    return t


def insan_mi(d: dict) -> bool:
    """user satiri GERCEKTEN Recep mi? Olculdu (09-05): 'user' satirlarinin 5 MB'i makineydi — sdk-py guvenlik
    incelemesi istekleri (400 KB tek satir), cron/uyandirma promptlari (promptSource=sdk, origin yok), compact
    ozetleri (promptSource yok), kanca/sistem bildirimleri. Insan izi: origin.kind == 'human' ya da klavye kaynagi."""
    if ((d.get("origin") or {}).get("kind")) == "human":
        return True
    return d.get("promptSource") in ("typed", "queued", "suggestion_accepted")


def metin(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(c.get("text", "") for c in content if isinstance(c, dict) and c.get("type") == "text")
    return ""


def topla(gun_filtre: str | None):
    """{gun: [(ts, sid, rol, metin)]} — sirali, deterministik."""
    if not os.path.isdir(KAYNAK):
        return None, 0
    gunler, sir_sayisi = defaultdict(list), 0

    def ekle(ts, sid, rol, m):
        nonlocal sir_sayisi
        m, k = sir_suz(m)
        sir_sayisi += k
        t = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(TR)
        gun = t.strftime("%Y-%m-%d")
        if gun_filtre and gun != gun_filtre:
            return
        gunler[gun].append((t.strftime("%H:%M"), ts, sid, rol, m))

    for f in sorted(glob.glob(os.path.join(KAYNAK, "*.jsonl"))):
        son_cevap = None  # (ts, sid, rol, m) — Recep'in GORDUGU son Claude metni; arac arasi anlatim atilir
        with open(f, encoding="utf-8", errors="replace") as fh:
            for satir in fh:
                try:
                    d = json.loads(satir)
                except json.JSONDecodeError:
                    continue
                if d.get("type") not in ("user", "assistant") or d.get("isMeta") or d.get("isSidechain"):
                    continue
                if d["type"] == "user" and not insan_mi(d):
                    continue
                ts = d.get("timestamp")
                if not ts:
                    continue
                m = temizle(metin((d.get("message") or {}).get("content")))
                if not m:
                    continue
                sid = (d.get("sessionId") or os.path.basename(f))[:8]
                if d["type"] == "assistant":
                    if KIP == "recep":
                        continue
                    if KIP == "ozet" and len(m) > OZET_KR:
                        m = m[:OZET_KR].rstrip() + " […]"
                    if KIP == "tam":
                        ekle(ts, sid, f"Claude/{SERIT.get(sid, 'oturum')} ({sid})", m)
                    else:
                        son_cevap = (ts, sid, f"Claude/{SERIT.get(sid, 'oturum')} ({sid})", m)
                    continue
                if son_cevap:  # Recep yazmadan once Claude'un son soyledigi = Recep'in okudugu cevap
                    ekle(*son_cevap)
                    son_cevap = None
                ekle(ts, sid, "Recep", m)
        if son_cevap:
            ekle(*son_cevap)
    for g in gunler:
        gunler[g].sort(key=lambda x: (x[1], x[2]))
    return gunler, sir_sayisi


def uret_md(gun, girdiler) -> str:
    sids = sorted({g[2] for g in girdiler})
    out = [f"# Konusma gunlugu {gun} (Turkiye gunu, UTC+3)", "",
           f"Kaynak: Claude Code oturum transkriptleri; yalniz Recep ve Claude METNI (arac cagrisi/ciktisi yok). Oturumlar: {', '.join(sids)} · girdi {len(girdiler)}.",
           "Sir suzgecinden gecti; [SIR-KALDIRILDI] gorunen yerde bir parola/anahtar vardi. Bu dosya depoya girmez; defter kaynagidir.", ""]
    for saat, _, sid, rol, m in girdiler:
        out += [f"### {saat} · {rol}", "", m, ""]
    return "\n".join(out)


def main(argv):
    global KIP
    komut = argv[1] if len(argv) > 1 else "olc"
    gun_filtre = argv[argv.index("--gun") + 1] if "--gun" in argv else None
    if "--kip" in argv:
        KIP = argv[argv.index("--kip") + 1]
        assert KIP in ("recep", "ozet", "tam"), "--kip recep|ozet|tam"
    gunler, sir = topla(gun_filtre)
    if gunler is None:
        print(f"HATA: kaynak klasor yok: {KAYNAK}")
        return 2
    toplam = 0
    for g in sorted(gunler):
        b = len(uret_md(g, gunler[g]).encode("utf-8"))
        toplam += b
        print(f"{g}  girdi {len(gunler[g]):5d}  {b/1024:8.0f} KB  oturum {len({x[2] for x in gunler[g]})}")
    print(f"\nTOPLAM gun {len(gunler)} · {toplam/1024/1024:.1f} MB · kip {KIP} · sir kaldirilan {sir} (desen basina {SIR_SAYAC}; deger basilmaz)")
    if komut == "uret":
        os.makedirs(HEDEF, exist_ok=True)
        if not gun_filtre:
            for eski in glob.glob(os.path.join(HEDEF, "*.md")):
                os.remove(eski)
        for g in sorted(gunler):
            with open(os.path.join(HEDEF, f"{g}.md"), "w", encoding="utf-8", newline="\n") as f:
                f.write(uret_md(g, gunler[g]))
        print(f"YAZILDI: {HEDEF} ({len(gunler)} dosya)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
