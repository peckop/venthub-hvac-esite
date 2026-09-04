#!/usr/bin/env python
"""Venthub Proje Takip defteri esitleyicisi — DETERMINISTIK.

Manifest (docs/proje-takip/manifest.json) proje yurutme kaynaklarini listeler. Bu betik:
  1. manifestteki demetleri dosyalardan derler (ayni girdi -> ayni cikti, sirali, tarih damgasi yok),
  2. her demetin sha256'sini docs/proje-takip/state.json'daki son esitlenmis degerle karsilastirir,
  3. degisen demeti defterde YENILER (ayni baslikli kaynagi siler, yenisini ekler, hazir olana kadar bekler),
  4. state.json'u gunceller ve raporu basar.

Komutlar:
  python scripts/nlm/proje_takip_sync.py olc            # derle + karsilastir, defterde HICBIR SEY yapma (cikis 0 = degisiklik yok, 3 = degisen var)
  python scripts/nlm/proje_takip_sync.py esitle         # degisenleri deftere yaz
  python scripts/nlm/proje_takip_sync.py taban          # defter zaten guncelse: hash'leri 'esitlenmis' olarak kaydet (ilk kurulum)
  python scripts/nlm/proje_takip_sync.py listele        # manifestin SECTIGI dosyalari ve HARIC tuttuklarini goster

Kanit: `notebooklm source list -n <id>` — betik cikis kodu degil, defterdeki kaynak listesi kanittir.
Cetvel: docs/standards/proje-takip-defteri-standard.md
"""
from __future__ import annotations
import fnmatch, glob, hashlib, json, os, subprocess, sys, tempfile

sys.stdout.reconfigure(encoding="utf-8")
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
MANIFEST = os.path.join(REPO, "docs", "proje-takip", "manifest.json")
STATE = os.path.join(REPO, "docs", "proje-takip", "state.json")


def oku_json(p, varsayilan):
    if not os.path.exists(p):
        return varsayilan
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def yaz_json(p, v):
    with open(p, "w", encoding="utf-8", newline="\n") as f:
        json.dump(v, f, ensure_ascii=False, indent=2)
        f.write("\n")


def kok_yolu(m, ad):
    k = m["kokler"][ad]
    return REPO if k == "." else k


def haric_mi(rel, desenler):
    rel = rel.replace("\\", "/")
    return any(fnmatch.fnmatchcase(rel, d) for d in desenler)


def demet_dosyalari(m, d):
    kok = kok_yolu(m, d["kok"])
    secilen = []
    for desen in d["dahil"]:
        for p in glob.glob(os.path.join(kok, desen)):
            if os.path.isfile(p):
                secilen.append(p)
    secilen = sorted(set(secilen), key=lambda p: os.path.relpath(p, kok).replace("\\", "/").lower())
    haric = list(d.get("haric", [])) + list(m["asla_dahil_etme"]["desenler"])
    tutulan, atilan = [], []
    for p in secilen:
        rel = os.path.relpath(p, kok).replace("\\", "/")
        (atilan if haric_mi(rel, haric) or haric_mi(os.path.basename(p), haric) else tutulan).append(p)
    return kok, tutulan, atilan


def derle(m, d):
    """Deterministik: dosyalar sirali, icerik oldugu gibi, damga yok. Ust siniri asarsa parcalar."""
    kok, dosyalar, _ = demet_dosyalari(m, d)
    limit = int(m.get("demet_ust_siniri_bayt", 900000))
    header = f"# {d['baslik']}\n\nKaynak: VentHub proje yurutme belgeleri (manifest demeti `{d['ad']}`). Koddan uretilen md'ler HARIC.\n"
    parcalar, cur, size = [], [header], len(header.encode("utf-8"))
    for p in dosyalar:
        rel = os.path.relpath(p, kok).replace("\\", "/")
        if d["kok"] != "repo":
            rel = d["kok"] + "/" + rel
        with open(p, encoding="utf-8", errors="replace") as f:
            govde = f.read()
        blok = f"\n\n---\n\n## DOSYA: {rel}\n\n{govde}"
        b = len(blok.encode("utf-8"))
        if size + b > limit and len(cur) > 1:
            parcalar.append("".join(cur)); cur, size = [header], len(header.encode("utf-8"))
        cur.append(blok); size += b
    parcalar.append("".join(cur))
    if len(parcalar) == 1:
        return [(d["ad"], parcalar[0])]
    return [(f"{d['ad']}-{i+1}", t) for i, t in enumerate(parcalar)]


def sha(t):
    return hashlib.sha256(t.encode("utf-8")).hexdigest()


def nlm(*args, girdi=None):
    cmd = ["notebooklm", *args]
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", input=girdi)
    return r.returncode, (r.stdout or "") + (r.stderr or "")


def defter_kaynaklari(nid):
    rc, out = nlm("source", "list", "-n", nid, "--json")
    if rc != 0:
        raise SystemExit(f"defter kaynak listesi alinamadi (login?):\n{out[:400]}")
    try:
        j = json.loads(out)
    except json.JSONDecodeError:
        raise SystemExit(f"source list JSON degil:\n{out[:400]}")
    kalemler = j if isinstance(j, list) else j.get("sources", j.get("items", []))
    return {k.get("title"): k.get("id") for k in kalemler if isinstance(k, dict)}


def komut_olc(m, state, goster=True):
    degisen, ayni, toplam = [], [], {}
    for d in m["demetler"]:
        for ad, metin in derle(m, d):
            h = sha(metin); toplam[ad] = (h, len(metin.encode("utf-8")), metin)
            (ayni if state.get("demetler", {}).get(ad) == h else degisen).append(ad)
    if goster:
        for ad, (h, n, _) in toplam.items():
            print(f"{'DEGISTI' if ad in degisen else 'ayni   '}  {ad:<36} {n:>9} bayt  {h[:12]}")
        print(f"\nOZET: {len(degisen)} degisen / {len(ayni)} ayni / {len(toplam)} demet")
    return degisen, toplam


def komut_esitle(m, state):
    nid = m["defter"]["id"]
    degisen, toplam = komut_olc(m, state)
    if not degisen:
        print("Defter guncel; yazilacak sey yok."); return 0
    mevcut = defter_kaynaklari(nid)
    tmp = tempfile.mkdtemp(prefix="proje-takip-")
    for ad in degisen:
        h, n, metin = toplam[ad]
        baslik = f"{ad}.md"
        yol = os.path.join(tmp, baslik)
        with open(yol, "w", encoding="utf-8", newline="\n") as f:
            f.write(metin)
        if baslik in mevcut and mevcut[baslik]:
            rc, out = nlm("source", "delete", "-n", nid, mevcut[baslik], "-y")
            print(f"  sil   {baslik}: {'ok' if rc == 0 else out[:120]}")
        rc, out = nlm("source", "add", "-n", nid, yol, "--type", "file", "--title", baslik, "--request-timeout", "120")
        if rc != 0:
            print(f"  EKLENEMEDI {baslik}: {out[:200]}"); return 2
        print(f"  ekle  {baslik} ({n} bayt)")
        state.setdefault("demetler", {})[ad] = h
        yaz_json(STATE, state)  # her adimda kaydet: yarida kesilirse bir sonraki kosu kaldigi yerden
    rc, out = nlm("source", "wait", "-n", nid, "--timeout", "300") if False else (0, "")
    print(f"\n{len(degisen)} demet yenilendi. Kanit icin: notebooklm source list -n {nid}")
    return 0


def komut_taban(m, state):
    _, toplam = komut_olc(m, state, goster=False)
    state["demetler"] = {ad: h for ad, (h, _, _) in toplam.items()}
    state["not"] = "taban: defter elle yuklenmis kabul edildi; hash'ler esitlenmis sayildi"
    yaz_json(STATE, state)
    print(f"taban yazildi: {len(toplam)} demet -> {os.path.relpath(STATE, REPO)}")
    return 0


def komut_listele(m):
    for d in m["demetler"]:
        kok, tutulan, atilan = demet_dosyalari(m, d)
        print(f"\n== {d['ad']}  ({len(tutulan)} dosya, {len(atilan)} haric)")
        for p in tutulan:
            print("   +", os.path.relpath(p, kok).replace("\\", "/"))
        for p in atilan:
            print("   -", os.path.relpath(p, kok).replace("\\", "/"), "(HARIC)")
    return 0


def main(argv):
    if len(argv) < 2 or argv[1] not in {"olc", "esitle", "taban", "listele"}:
        print(__doc__); return 1
    m = oku_json(MANIFEST, None)
    if m is None:
        print("manifest yok:", MANIFEST); return 1
    state = oku_json(STATE, {"surum": 1, "demetler": {}})
    if argv[1] == "listele":
        return komut_listele(m)
    if argv[1] == "olc":
        degisen, _ = komut_olc(m, state)
        return 3 if degisen else 0
    if argv[1] == "taban":
        return komut_taban(m, state)
    return komut_esitle(m, state)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
