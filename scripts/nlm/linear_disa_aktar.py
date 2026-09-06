#!/usr/bin/env python3
"""Linear -> "santiye durumu" disa aktarimi (deterministik, stdlib).

Kaynak: Linear GraphQL API (https://api.linear.app/graphql). Anahtar ortam degiskeninden okunur:
  LINEAR_API_KEY (surec ortami) yoksa Windows kullanici ortam degiskeni (HKCU\\Environment) denenir.
Anahtar hicbir ciktiya yazilmaz.

Ciktilar (varsayilan docs/proje-takip/linear/):
  is-dagilimi-<tarih>.json  ham kayitlar (identifier, title, status, statusType, assignee, project,
                            projectMilestone, labels, priority, createdAt, updatedAt, completedAt, url)
  is-dagilimi-<tarih>.md    §1 proje ozeti (% bitti) · §2 etiket/serit · §3 proje→kilometre tasi→is ·
                            §4 bayat acik isler (>7 gun) · §5 olcum satiri

Kullanim: python scripts/nlm/linear_disa_aktar.py [--tarih YYYY-MM-DD] [--hedef-dizin DIR] [--simdi ISO]
Determinizm: ayni Linear durumu + ayni --simdi -> bayt-ayni cikti (siralama: proje adi, kilometre tasi, identifier no).
--simdi 'Z'siz verilirse UTC varsayilir (yerel saat DEGIL; iso_utc — gun_kapanisi/kararlar ile ayni yardimci).
Iliskiler: blockedBy (bu isi bloklayanlar = inverseRelations type 'blocks') ve blocks JSON'a girer (2026-09-06 olculdu:
REC-168 blocks REC-169 → REC-169.blockedBy = [REC-168]).
Sir suzgeci: is basligi pano_disa_aktar.sir_suz + yol_suz'dan gecer (repo PUBLIC); OZET satirinda 'sir N · yol N'.
Cikis: 0 · 1 anahtar yok / Linear HTTP-ag hatasi (okunur mesaj, traceback yok).
"""
import argparse, datetime as dt, io, json, os, sys, urllib.error, urllib.request

BURASI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BURASI)
from pano_disa_aktar import sir_suz, yol_suz  # noqa: E402  (deger basilmaz; repo PUBLIC)

API = "https://api.linear.app/graphql"
QUERY = """
query($after: String) {
  issues(first: 100, after: $after, includeArchived: false) {
    pageInfo { hasNextPage endCursor }
    nodes {
      identifier title priority createdAt updatedAt completedAt url
      state { name type }
      assignee { name }
      project { name }
      projectMilestone { name }
      labels { nodes { name } }
      relations { nodes { type relatedIssue { identifier } } }
      inverseRelations { nodes { type issue { identifier } } }
    }
  }
}
"""


def iso_utc(s):
    """ISO-8601 → aware UTC. 'Z' ya da ofset yoksa UTC VARSAYILIR (yerel saat degil): ayni --simdi uc betikte ayni damga."""
    d = dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
    return (d.replace(tzinfo=dt.timezone.utc) if d.tzinfo is None else d).astimezone(dt.timezone.utc)


def anahtar():
    k = os.environ.get("LINEAR_API_KEY")
    if k:
        return k
    if os.name == "nt":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, "Environment") as h:
                v, _ = winreg.QueryValueEx(h, "LINEAR_API_KEY")
                if v:
                    return v
        except OSError:
            pass
    sys.exit("LINEAR_API_KEY yok (ortam degiskeni ya da HKCU\\Environment).")


def sorgu(key, variables, query=QUERY):
    body = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    req = urllib.request.Request(API, data=body, headers={"Content-Type": "application/json", "Authorization": key})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:  # govde basilmaz (anahtar/istek yansiyabilir); yalniz kod
        sys.exit(f"Linear HTTP {e.code} ({'anahtar/yetki' if e.code in (400, 401, 403) else 'sunucu'}); anahtar basilmadi")
    except urllib.error.URLError as e:
        sys.exit(f"Linear'a ulasilamadi (ag): {type(e.reason).__name__ if hasattr(e, 'reason') else 'URLError'}")
    except TimeoutError:
        sys.exit("Linear zaman asimi (60 sn)")


def cek(key):
    after, out, cagri, sir, yol = None, [], 0, 0, 0
    while True:
        j = sorgu(key, {"after": after})
        cagri += 1
        if "errors" in j:
            sys.exit("Linear hatasi: " + json.dumps(j["errors"])[:300])
        blk = j["data"]["issues"]
        for n in blk["nodes"]:
            baslik, y = yol_suz(n["title"] or "")
            baslik, s = sir_suz(baslik)
            sir += s; yol += y
            out.append({
                "identifier": n["identifier"], "title": baslik,
                "status": n["state"]["name"], "statusType": n["state"]["type"],
                "assignee": (n.get("assignee") or {}).get("name"),
                "project": (n.get("project") or {}).get("name"),
                "projectMilestone": (n.get("projectMilestone") or {}).get("name"),
                "labels": sorted(l["name"] for l in n["labels"]["nodes"]),
                "priority": n["priority"], "createdAt": n["createdAt"], "updatedAt": n["updatedAt"],
                "completedAt": n.get("completedAt"), "url": n["url"],
                "blockedBy": sorted({r["issue"]["identifier"] for r in (n.get("inverseRelations") or {}).get("nodes", []) if r.get("type") == "blocks" and r.get("issue")}),
                "blocks": sorted({r["relatedIssue"]["identifier"] for r in (n.get("relations") or {}).get("nodes", []) if r.get("type") == "blocks" and r.get("relatedIssue")}),
            })
        if not blk["pageInfo"]["hasNextPage"]:
            break
        after = blk["pageInfo"]["endCursor"]
    return out, cagri, sir, yol


def no(i):
    try:
        return int(i["identifier"].split("-")[1])
    except (IndexError, ValueError):
        return 0


def yuzde(done, toplam, iptal):
    payda = toplam - iptal
    return f"{round(100 * done / payda)}%" if payda else "-"


def sayim(rows):
    d = sum(1 for r in rows if r["statusType"] == "completed")
    s = sum(1 for r in rows if r["statusType"] == "started")
    t = sum(1 for r in rows if r["statusType"] in ("unstarted", "backlog", "triage"))
    c = sum(1 for r in rows if r["statusType"] == "canceled")
    return len(rows), d, s, t, c


def md_uret(rows, damga, simdi, cagri):
    L = []
    L.append(f"<!-- uretilmis: Linear GraphQL disa aktarimi (scripts/nlm/linear_disa_aktar.py) · damga {damga} · elle duzenlenmez; yenileme: gun kapanisi ritueli -->")
    L.append(f"# Linear İş Dağılımı — Şantiye Durumu ({damga[:10]})\n")
    L.append(f"**Damga:** {damga} · **Kaynak:** Linear GraphQL `issues` (sayfalama {cagri} çağrı) · **Toplam iş:** {len(rows)}\n")
    L.append("> Okuma kılavuzu: her proje bir kat, her kilometre taşı bir dükkân sırası, her iş bir dükkân. **% bitti = Done / (Toplam − Canceled)**. Sorumluluk = şerit etiketi (assignee alanı çoğunlukla boş).\n")
    T, D, S, Tt, C = sayim(rows)
    L.append(f"Durum dağılımı: Done {D} · In Progress {S} · Todo/Backlog {Tt} · Canceled {C} → **genel % bitti {yuzde(D, T, C)}**\n")
    projeler = sorted({r["project"] or "(projesiz)" for r in rows})
    L.append("## §1 ÖZET — proje başına\n")
    L.append("| Proje | Toplam | Done | In Progress | Todo/Backlog | Canceled | % bitti |\n|---|---:|---:|---:|---:|---:|---:|")
    for p in projeler:
        pr = [r for r in rows if (r["project"] or "(projesiz)") == p]
        t, d, s, tt, c = sayim(pr)
        L.append(f"| {p} | {t} | {d} | {s} | {tt} | {c} | {yuzde(d, t, c)} |")
    L.append(f"| **TOPLAM** | {T} | {D} | {S} | {Tt} | {C} | {yuzde(D, T, C)} |\n")
    etiketler = sorted({l for r in rows for l in r["labels"]})
    L.append("## §2 ŞERİT (etiket) başına\n")
    L.append("| Etiket | Toplam | Done | In Progress | Todo/Backlog | % bitti |\n|---|---:|---:|---:|---:|---:|")
    for e in etiketler:
        er = [r for r in rows if e in r["labels"]]
        t, d, s, tt, c = sayim(er)
        L.append(f"| {e} | {t} | {d} | {s} | {tt} | {yuzde(d, t, c)} |")
    ets = [r for r in rows if not r["labels"]]
    t, d, s, tt, c = sayim(ets)
    L.append(f"| (etiketsiz) | {t} | {d} | {s} | {tt} | {yuzde(d, t, c)} |\n")
    L.append("## §3 Proje → kilometre taşı → iş (açık işler; Done ayrı)\n")
    for p in projeler:
        pr = [r for r in rows if (r["project"] or "(projesiz)") == p]
        L.append(f"### {p}\n")
        kts = sorted({r["projectMilestone"] or "(kilometre taşı yok)" for r in pr})
        for k in kts:
            kr = sorted([r for r in pr if (r["projectMilestone"] or "(kilometre taşı yok)") == k and r["statusType"] != "completed"], key=no)
            if not kr:
                continue
            L.append(f"**{k}**\n\n| İş | Durum | Başlık | Şerit | Öncelik | Son güncelleme |\n|---|---|---|---|---:|---|")
            for r in kr:
                L.append(f"| {r['identifier']} | {r['status']} | {r['title'][:80]} | {', '.join(r['labels']) or '-'} | {r['priority']} | {r['updatedAt'][:10]}{' · BEKLİYOR: ' + ', '.join(r['blockedBy']) if r.get('blockedBy') else ''} |")
            L.append("")
        done = sorted([r for r in pr if r["statusType"] == "completed"], key=no)
        if done:
            L.append("<details><summary>Done (" + str(len(done)) + ")</summary>\n")
            for r in done:
                L.append(f"- {r['identifier']} · {r['title'][:80]} · {(r['completedAt'] or r['updatedAt'])[:10]}")
            L.append("\n</details>\n")
    L.append("## §4 BAYAT AÇIK İŞLER (started/unstarted, updatedAt > 7 gün)\n")
    esik = simdi - dt.timedelta(days=7)
    bayat = sorted([r for r in rows if r["statusType"] in ("started", "unstarted") and dt.datetime.fromisoformat(r["updatedAt"].replace("Z", "+00:00")) < esik], key=no)
    if bayat:
        L.append("| İş | Durum | Başlık | Şerit | Son güncelleme |\n|---|---|---|---|---|")
        for r in bayat:
            L.append(f"| {r['identifier']} | {r['status']} | {r['title'][:80]} | {', '.join(r['labels']) or '-'} | {r['updatedAt'][:10]} |")
    else:
        L.append("(yok)")
    acik = sum(1 for r in rows if r["statusType"] in ("started", "unstarted"))
    L.append(f"\n## §5 Ölçüm satırı\n\nçağrı {cagri} · kayıt {len(rows)} · proje {len(projeler)} · etiket {len(etiketler)} · bayat açık {len(bayat)}/{acik} · damga {damga}\n")
    return "\n".join(L) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--tarih", default=None)
    ap.add_argument("--hedef-dizin", default="docs/proje-takip/linear")
    ap.add_argument("--simdi", default=None, help="ISO UTC; determinizm icin sabitlenebilir")
    a = ap.parse_args()
    simdi = iso_utc(a.simdi) if a.simdi else dt.datetime.now(dt.timezone.utc)
    damga = simdi.strftime("%Y-%m-%dT%H:%M:%SZ")
    tarih = a.tarih or simdi.strftime("%Y-%m-%d")
    rows, cagri, sir, yol = cek(anahtar())
    rows.sort(key=no)
    os.makedirs(a.hedef_dizin, exist_ok=True)
    jp = os.path.join(a.hedef_dizin, f"is-dagilimi-{tarih}.json")
    mp = os.path.join(a.hedef_dizin, f"is-dagilimi-{tarih}.md")
    with io.open(jp, "w", encoding="utf-8", newline="\n") as f:
        json.dump({"damga": damga, "kaynak": "Linear GraphQL issues", "toplam": len(rows), "kayitlar": rows}, f, ensure_ascii=False, indent=1)
        f.write("\n")
    with io.open(mp, "w", encoding="utf-8", newline="\n") as f:
        f.write(md_uret(rows, damga, simdi, cagri))
    print(f"OZET: kayit {len(rows)} · cagri {cagri} · sir {sir} · yol {yol} · {yol_suz(mp.replace(chr(92), '/'))[0]}")  # makine yolu basilmaz


if __name__ == "__main__":
    main()
