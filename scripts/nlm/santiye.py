#!/usr/bin/env python3
"""
SANTIYE TABLOSU — "kimde ne is var, ne yapiliyor, ne bekliyor" tek ekran (Recep 2026-09-07).

Kaynak: Linear disa aktarimi (scripts/nlm/linear_disa_aktar.py ciktisi is-dagilimi-<tarih>.json).
Hafizadan degil kayittan: tablo yalniz Linear'daki DURUM alanindan uretilir; pano notu, sohbet, durum
dosyasi kaynak DEGILDIR. Serit panoya ne yazarsa yazsin, Linear'da durum degismediyse tabloda gorunmez.

Kurallar (cetvel: docs/standards/work-tracking-ssot-standard.md, 2026-09-07 eki):
  - serit basina In Progress <= 1  (asim = KIRMIZI, cikis 1); "Recep kapisi" etiketli kayit limitten MUAF
  - In Review = TESLIM: is bitti, PR acik, yalniz merge bekler (ALTYAPI hukmu 2026-09-07); limite girmez
  - serit basina Todo <= 3         (asim = SARI, uyari)
  - sahiplik olcutu ETIKET; etiketsiz kayit SAHIPSIZ (proje sessizce sahip yapmaz)
  - Recep'ten bir sey bekleyen kayit "Recep kapisi" etiketi tasir; tasimayan gorunmez
  - blockedBy dolu kayit "BLOKLU" sutununda

Kullanim:
  python scripts/nlm/santiye.py --json <is-dagilimi.json> [--hedef <md yolu>] [--simdi <ISO>]
  python scripts/nlm/santiye.py --tarih 2026-09-07   # docs/proje-takip/linear/is-dagilimi-<tarih>.json okur
"""
import argparse, json, os, sys, datetime

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SERITLER = ["URUN", "URUN-KATALOG", "ALTYAPI", "OPS", "DESIGN"]
DIS_PROJELER = set()   # Recep 2026-09-07: "hicbir is VentHub disinda degil" — proje disi tutma YOK (Q-Validator eski mimari, kayitlari baglandi/kapandi)
KATALOG_PROJE = "Katalog ve Ürün Verisi"
LIMIT_IP, LIMIT_TODO = 1, 3
CURUME_GUN = 14   # Backlog'da bu kadar gun kimsenin bakmadigi kayit "BAKILMADI" isareti. Recep 09-07: "is varsa istir" — iptal YOK, yalniz sahibine "bir bak" isareti.
# Olcut updatedAt DEGIL "sonAnlamli" (son yorum / PR eki / baslama / bitis / acilis): etiket, toplu bakim, betik dokunusu yasi TAZELEMEZ.
# Sinav: bir kayda yalniz etiket ekle -> yas degismemeli (updatedAt degisir, sonAnlamli degismez). Katalog uyarisi 09-07.


def serit_of(k):
    """Sahiplik olcutu ETIKET'tir, proje degil (URUN-KATALOG duzeltmesi 2026-09-07 09:2xZ:
    proje olcutu Katalog projesinde duran URUN isini Katalog seridine yaziyordu — 8 gorundu, gercek 1).
    Etiketi olmayan kayit SAHIPSIZ'dir; proje yalnizca tabloda not olarak gecer, sessizce atanmaz."""
    labels = set(k.get("labels") or [])
    if "URUN-KATALOG" in labels or "KATALOG" in labels:
        return "URUN-KATALOG"
    for s in ("ALTYAPI", "URUN", "OPS", "DESIGN"):
        if s in labels:
            return s
    return "SAHIPSIZ"


def recep_kapisi(k):
    return "Recep kapısı" in (k.get("labels") or [])


def kisa(t, n=78):
    t = (t or "").replace("|", "/").strip()
    return t if len(t) <= n else t[: n - 1] + "…"


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")   # Windows cp1254 konsolu "≤" ve "…"de patliyor (olculdu 09-07)
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--json")
    ap.add_argument("--tarih")
    ap.add_argument("--hedef")
    ap.add_argument("--simdi")
    a = ap.parse_args()
    if not a.json:
        if not a.tarih:
            print("HATA: --json ya da --tarih gerekli", file=sys.stderr); sys.exit(2)
        a.json = os.path.join(REPO, "docs", "proje-takip", "linear", f"is-dagilimi-{a.tarih}.json")
    if not os.path.exists(a.json):
        print(f"HATA: disa aktarim yok: {a.json} — once linear_disa_aktar.py", file=sys.stderr); sys.exit(2)
    d = json.load(open(a.json, encoding="utf-8"))
    rows = d.get("kayitlar") or []
    damga = a.simdi or datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
    kaynak_damga = d.get("damga", "?")

    rows = [k for k in rows if (k.get("project") or "") not in DIS_PROJELER and k.get("status") != "Canceled"]
    simdi_dt = datetime.datetime.strptime(damga[:16], "%Y-%m-%dT%H:%M").replace(tzinfo=datetime.timezone.utc)
    def curudu(k):
        u = k.get("sonAnlamli") or k.get("createdAt") or ""   # updatedAt bilerek KULLANILMAZ
        try:
            dt = datetime.datetime.fromisoformat(u.replace("Z", "+00:00"))
        except ValueError:
            return False
        return (simdi_dt - dt).days >= CURUME_GUN
    by = {s: {"In Progress": [], "In Review": [], "Todo": [], "Backlog": [], "Done": [], "BLOKLU": [], "RECEP": [], "CURUDU": []} for s in SERITLER + ["SAHIPSIZ"]}
    for k in rows:
        s = serit_of(k)
        st = k.get("status") or "?"
        if st not in by[s]:
            by[s][st] = []
        by[s][st].append(k)
        if k.get("blockedBy") and st != "Done":
            by[s]["BLOKLU"].append(k)
        if recep_kapisi(k) and st != "Done":
            by[s]["RECEP"].append(k)
        if st == "Backlog" and curudu(k):
            by[s]["CURUDU"].append(k)

    L = []
    L.append(f"<!-- uretilmis: scripts/nlm/santiye.py · damga {damga} · Linear disa aktarimi {kaynak_damga} · elle duzenlenmez -->")
    L.append(f"# ŞANTİYE — kimde ne iş var ({damga})")
    L.append("")
    L.append(f"Kaynak: Linear ({kaynak_damga}). Kural: şerit başına yapılıyor ≤{LIMIT_IP}, sırada ≤{LIMIT_TODO}. Pano/sohbet kaynak değildir.")
    L.append("")
    L.append("## §0 Özet")
    L.append("")
    L.append(f"| Şerit | Yapılıyor | Teslim (PR açık) | Sırada | Backlog | Bakılmadı (≥{CURUME_GUN} gün) | Bloklu | Recep'ten bekleyen | Uyum |")
    L.append("|---|---:|---:|---:|---:|---:|---:|---:|---|")
    kirmizi = []
    for s in SERITLER + ["SAHIPSIZ"]:
        b = by[s]
        ip_all, td, rv = len(b["In Progress"]), len(b["Todo"]), len(b["In Review"])
        ip = len([k for k in b["In Progress"] if not recep_kapisi(k)])   # Recep kapisi limitten muaf
        uyum = "YEŞİL"
        if ip > LIMIT_IP:
            uyum = f"KIRMIZI (yapılıyor {ip} > {LIMIT_IP})"; kirmizi.append((s, ip))
        elif td > LIMIT_TODO:
            uyum = f"SARI (sırada {td} > {LIMIT_TODO})"
        if s == "SAHIPSIZ" and (ip or td or len(b["Backlog"])):
            uyum = "KIRMIZI (sahipsiz kayıt)"; kirmizi.append((s, ip + td + len(b["Backlog"])))
        L.append(f"| {s} | {ip_all} | {rv} | {td} | {len(b['Backlog'])} | {len(b['CURUDU'])} | {len(b['BLOKLU'])} | {len(b['RECEP'])} | {uyum} |")
    L.append("")
    recep = [k for s in by for k in by[s]["RECEP"]]
    L.append(f"## §1 Recep'ten bekleyen ({len(recep)})")
    L.append("")
    for k in sorted(recep, key=lambda x: x["identifier"]):
        L.append(f"- {k['identifier']} · {kisa(k['title'], 110)} · {serit_of(k)} · {k['status']}")
    L.append("")
    for s in SERITLER + ["SAHIPSIZ"]:
        b = by[s]
        if not any(b[x] for x in ("In Progress", "In Review", "Todo", "BLOKLU")) and s != "SAHIPSIZ":
            L.append(f"## {s} — yapılıyor 0 · sırada 0 (backlog {len(b['Backlog'])})"); L.append(""); continue
        L.append(f"## {s}")
        L.append("")
        for st, ad in (("In Progress", "YAPILIYOR"), ("In Review", "TESLİM — PR açık, merge bekler"), ("Todo", "SIRADA"), ("BLOKLU", "BLOKLU")):
            items = b[st]
            if not items and st != "In Progress":
                continue
            L.append(f"**{ad} ({len(items)})**")
            for k in sorted(items, key=lambda x: (-(x.get('priority') or 0), x['identifier'])):
                blk = f" · bloklu: {', '.join(x if isinstance(x, str) else x.get('identifier', '?') for x in k.get('blockedBy') or [])}" if k.get("blockedBy") else ""
                rk = " · [Recep kapısı]" if recep_kapisi(k) else ""
                L.append(f"- {k['identifier']} · {kisa(k['title'])}{rk}{blk}")
            L.append("")
        if s == "SAHIPSIZ" and b["Backlog"]:
            L.append(f"**BACKLOG ({len(b['Backlog'])}) — etiket borcu (proje yalnız not)**")
            for k in sorted(b["Backlog"], key=lambda x: x["identifier"]):
                L.append(f"- {k['identifier']} · {kisa(k['title'])} · proje: {k.get('project') or '-'}")
            L.append("")
    curu = [k for s in by for k in by[s]["CURUDU"]]
    L.append(f"## §8 Bakılmadı ({len(curu)}) — Backlog'da ≥{CURUME_GUN} gündür kimse bakmamış; iş varsa iştir, iptal yok, sahibi bir bakar")
    L.append("")
    for k in sorted(curu, key=lambda x: (serit_of(x), x["identifier"])):
        L.append(f"- {k['identifier']} · {kisa(k['title'], 100)} · {serit_of(k)} · son anlamlı dokunuş {(k.get('sonAnlamli') or '?')[:10]}")
    L.append("")
    L.append("## §9 Hüküm")
    L.append("")
    if kirmizi:
        L.append("KIRMIZI — " + " · ".join(f"{s}: {n}" for s, n in kirmizi) + ". Şerit Linear'ı gerçek duruma çekmeden yeni iş almaz.")
    else:
        L.append("YEŞİL — her şerit sınırın içinde.")
    metin = "\n".join(L) + "\n"
    hedef = a.hedef or os.path.join(REPO, "docs", "proje-takip", "santiye.md")
    os.makedirs(os.path.dirname(hedef), exist_ok=True)
    open(hedef, "w", encoding="utf-8", newline="\n").write(metin)
    print(metin)
    print(f"→ {os.path.relpath(hedef, REPO)}")
    sys.exit(1 if kirmizi else 0)


if __name__ == "__main__":
    main()
