#!/usr/bin/env python
"""PANO DISA AKTARIM — ajanlar arasi pano (telsiz) notlarini NotebookLM defteri icin deterministik Markdown'a cevirir.

Kaynak: pano dizinindeki events.*.jsonl dosyalari (SALT OKUNUR; hicbiri degistirilmez). Satir semasi (2026-09-06'da
olculdu, varsayilmadi): {ts: ISO-8601 Z, sid: oturum kimligi (uuid ya da 8 hex), type: note|seen|heartbeat|claim|release,
to: alici sid | serit adi | "" (herkes), text: metin, lane?: serit (claim'de ve prob notlarinda)}. Yalniz type=note alinir.

Kurallar:
  * Son N gunun notlari (varsayilan 7). Pencere sonu = --simdi (varsayilan: su anki UTC); baslangic = (simdi - N gun) 00:00Z.
  * MEKANIZMA-PROBU notlari HARIC (lane == "MEKANIZMA-PROBU" veya metin "MEKANIZMA PROBU" ile baslar). Metninde "PROB-"
    gecen sıradan notlar prob DEGILDIR (olcumde 4 gercek not boyle basliyordu), tutulur.
  * Ayni oturumun iki dosyasi olabilir (events.<uuid>.jsonl + events.<8hex>.jsonl): mukerrer = ayni ts + ayni metin, TEK sayilir.
  * Gonderen/alici etiketi: "<SERIT>/<8hex>". Serit adi metin onekinden gelir ("URUN ->", "OPS (", "ALTYAPI:" ...); onek yalniz
    claim olaylarinda gorulmus gercek serit adlariyla eslesir ("DUZELTME (" gibi sahte onekler dislanir). Oneksiz notlarda
    oturumun bu penceredeki EN SIK onek seridi, o da yoksa son claim'i kullanilir; hicbiri yoksa yalniz 8hex. to == "" → herkes.
  * Kronolojik; esitlikte sid, sonra metin sha256 ile KARARLI siralama. Ayni girdi + ayni --simdi gunu → bayt-ayni cikti.
  * Metin kisaltilmaz. Makine yolu sizdirilmaz: "<surucu>:\\Users\\<ad>\\" → "~/" (sayisi raporlanir). Repo PUBLIC oldugu icin
    konusma_gunlugu.py ile AYNI sir suzgeci uygulanir ([SIR-KALDIRILDI]; deger basilmaz, yalniz sayi). CR → LF.

Kullanim:
  python scripts/nlm/pano_disa_aktar.py --gun 7 --hedef docs/proje-takip/pano/pano-olaylari-son7gun-2026-09-06.md
  python scripts/nlm/pano_disa_aktar.py --kaynak <dizin>   (ya da VENTHUB_BOARD ortam degiskeni)
  python scripts/nlm/pano_disa_aktar.py --simdi 2026-09-06T00:00:00Z   (yeniden uretilebilir kosum)
Cikis kodu: 0 basari · 2 kaynak dizin yok / hic dosya yok.
Cetvel: docs/standards/proje-takip-defteri-standard.md
"""
from __future__ import annotations
import argparse, glob, hashlib, json, os, re, sys
from collections import Counter
from datetime import datetime, timedelta, timezone

sys.stdout.reconfigure(encoding="utf-8")

VARSAYILAN_KAYNAK = os.environ.get("VENTHUB_BOARD") or "C:/tmp/venthub-board"
PROB_SERIT = "MEKANIZMA-PROBU"
PROB_ONEK = "MEKANIZMA PROBU"
SERIT_ONEK = re.compile(r"^([A-Z][A-Z0-9-]{1,24})\s*(?:->|\u2192|\(|:)")
KISA_SID = re.compile(r"^[0-9a-f]{8}")
MAKINE_YOLU = re.compile(r"[A-Za-z]:[\\/]+Users[\\/]+[^\\/\s\"'`]+[\\/]+")
MAKINE_YOLU_POSIX = re.compile(r"/c/Users/[^/\s\"'`]+/")
MAKINE_YOLU_GORELI = re.compile(r"(?:\.\.[\\/])+Users[\\/]+[^\\/\s\"'`]+[\\/]+")  # ..\..\Users\<ad>\ (os.path.relpath sizintisi; 09-06 olculdu)
# konusma_gunlugu.py SIR listesiyle birebir ayni (tek kaynak olmasi icin oradan kopyalandi; degisirse ikisi birlikte degisir)
# 2026-09-06: bu hattin KENDI anahtari (lin_api_…) ve 'Authorization: <deger>' / 'LINEAR_API_KEY=<deger>' kaliplari eklendi —
# onceki liste bunlari 0 vurusla geciriyordu (olculdu).
SIR = [
    re.compile(r"postgres(?:ql)?://[^:@\s/]+:[^@\s]+@"),
    re.compile(r"eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"),
    re.compile(r"\b(?:sk-[A-Za-z0-9_-]{20,}|sk_(?:live|test)_[A-Za-z0-9]{16,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sbp_[a-f0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16}|re_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|lin_api_[A-Za-z0-9]{20,}|lin_oauth_[A-Za-z0-9]{20,})\b"),
    re.compile(r"(?i)\b(parola|password|passwd|secret|token|authorization|service[_ -]?role[_ -]?key|anon[_ -]?key|\w*api[_ -]?key\w*)\b\s*[:=]\s*[\"']?(?:Bearer\s+)?([^\s\"',;]{8,})"),
    re.compile(r"(?<![A-Za-z0-9+/=])[A-Za-z0-9+/]{60,}={0,2}(?![A-Za-z0-9+/=])"),
]


def zaman(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(timezone.utc)


def kisa(sid: str) -> str:
    return sid[:8] if KISA_SID.match(sid) else sid


SAF_HEX = re.compile(r"^[0-9a-f]+$")


def sir_suz(t: str):
    """konusma_gunlugu.sir_suz ile ayni; TEK fark: son desende saf-hex eslesme (sha256 kanit degeri, 64 hex) sir sayilmaz.
    (2026-09-06 olcumu: pencerede tek vurus bir determinizm kanitinin sha256'siydi; sir degil, olcum degeri.)"""
    n = 0
    for i, p in enumerate(SIR):
        sonuncu = i == len(SIR) - 1

        def yerine(m):
            if sonuncu and SAF_HEX.match(m.group(0)):
                return m.group(0)
            return (m.group(1) + ": [SIR-KALDIRILDI]") if m.lastindex and m.lastindex >= 2 else "[SIR-KALDIRILDI]"

        yeni, k = p.subn(yerine, t)
        if yeni != t:
            n += k
        t = yeni
    return t, n


def yol_suz(t: str):
    t, a = MAKINE_YOLU.subn("~/", t)
    t, b = MAKINE_YOLU_POSIX.subn("~/", t)
    t, c = MAKINE_YOLU_GORELI.subn("~/", t)
    return t, a + b + c


def oku(kaynak: str):
    """Tum events.*.jsonl satirlarini (dosya sirasi kararli) dondurur. Bozuk satir sayilir, atlanir."""
    dosyalar = sorted(glob.glob(os.path.join(kaynak, "events.*.jsonl")))
    satirlar, bozuk = [], 0
    for d in dosyalar:
        with open(d, encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    o = json.loads(line)
                except ValueError:
                    bozuk += 1
                    continue
                if isinstance(o, dict) and isinstance(o.get("ts"), str) and isinstance(o.get("sid"), str):
                    satirlar.append(o)
    return dosyalar, satirlar, bozuk


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--gun", type=int, default=7)
    ap.add_argument("--kaynak", default=VARSAYILAN_KAYNAK)
    ap.add_argument("--hedef", default=None, help="cikti dosyasi (yoksa stdout)")
    ap.add_argument("--simdi", default=None, help="pencere sonu, ISO-8601 UTC (varsayilan: su an)")
    a = ap.parse_args()

    if not os.path.isdir(a.kaynak):
        print(f"KIRMIZI: kaynak dizin yok", file=sys.stderr)
        return 2
    simdi = zaman(a.simdi) if a.simdi else datetime.now(timezone.utc)
    baslangic = (simdi - timedelta(days=a.gun)).replace(hour=0, minute=0, second=0, microsecond=0)

    dosyalar, satirlar, bozuk = oku(a.kaynak)
    if not dosyalar:
        print("KIRMIZI: kaynakta events.*.jsonl yok", file=sys.stderr)
        return 2

    # gercek serit adlari: claim olaylarindan (yer tutucu "lane" haric)
    seritler = {o["lane"] for o in satirlar if o.get("type") == "claim" and isinstance(o.get("lane"), str) and o["lane"] != "lane"}
    son_claim: dict[str, tuple[str, str]] = {}
    for o in satirlar:
        if o.get("type") == "claim" and o.get("lane") in seritler:
            if o["sid"] not in son_claim or o["ts"] >= son_claim[o["sid"]][0]:
                son_claim[o["sid"]] = (o["ts"], o["lane"])

    toplam = mukerrer = prob = pencere_disi = 0
    gorulen: set[tuple[str, str]] = set()
    notlar = []
    for o in satirlar:
        if o.get("type") != "note" or not isinstance(o.get("text"), str):
            continue
        toplam += 1
        t = zaman(o["ts"])
        if t < baslangic or t > simdi:
            pencere_disi += 1
            continue
        if o.get("lane") == PROB_SERIT or o["text"].startswith(PROB_ONEK):
            prob += 1
            continue
        anahtar = (o["ts"], o["text"])
        if anahtar in gorulen:
            mukerrer += 1
            continue
        gorulen.add(anahtar)
        notlar.append(o)

    # oturum → serit: pencere icindeki onek sikligi (esitlikte alfabetik), yoksa son claim
    onek_sayac: dict[str, Counter] = {}
    for o in notlar:
        m = SERIT_ONEK.match(o["text"])
        if m and m.group(1) in seritler:
            onek_sayac.setdefault(o["sid"], Counter())[m.group(1)] += 1
    sid_serit: dict[str, str] = {}
    for sid, c in onek_sayac.items():
        sid_serit[sid] = sorted(c.items(), key=lambda kv: (-kv[1], kv[0]))[0][0]
    for sid, (_, lane) in son_claim.items():
        sid_serit.setdefault(sid, lane)
    # 8hex ile tam uuid ayni oturum: kisa anahtarla da eristir
    kisa_serit: dict[str, str] = {}
    for sid, lane in sorted(sid_serit.items()):
        kisa_serit.setdefault(kisa(sid), lane)

    def etiket(sid: str, metin: str | None = None) -> str:
        if sid == "":
            return "herkes"
        if sid in seritler:
            return sid
        lane = None
        if metin is not None:
            m = SERIT_ONEK.match(metin)
            if m and m.group(1) in seritler:
                lane = m.group(1)
        lane = lane or sid_serit.get(sid) or kisa_serit.get(kisa(sid))
        k = kisa(sid)
        return f"{lane}/{k}" if lane else k

    def sira(o):
        return (zaman(o["ts"]), o["sid"], hashlib.sha256(o["text"].encode("utf-8")).hexdigest())

    notlar.sort(key=sira)

    yol_say = sir_say = 0
    govde = []
    gun_onceki = None
    for o in notlar:
        t = zaman(o["ts"])
        gun = t.strftime("%Y-%m-%d")
        if gun != gun_onceki:
            govde.append(f"\n## {gun}\n")
            gun_onceki = gun
        metin = o["text"].replace("\r\n", "\n").replace("\r", "\n")
        metin, y = yol_suz(metin)
        metin, s = sir_suz(metin)
        yol_say += y
        sir_say += s
        govde.append(f"### {t.strftime('%H:%M:%S')}Z · {etiket(o['sid'], o['text'])} → {etiket(o['to'])}\n")
        govde.append(metin.strip() + "\n")

    baslik = [
        f"# Pano olaylari — son {a.gun} gun ({baslangic.strftime('%Y-%m-%d')} → {simdi.strftime('%Y-%m-%d')} UTC)",
        "",
        f"- Damga: {simdi.strftime('%Y-%m-%d')} (UTC) · uretici: scripts/nlm/pano_disa_aktar.py (deterministik; ayni girdi → bayt-ayni cikti)",
        f"- Kaynak: pano olay dosyalari ({len(dosyalar)} dosya, {len(satirlar)} satir, bozuk satir {bozuk})",
        f"- Not sayimi: pencerede {len(notlar)} not yazildi · toplam not {toplam} · pencere disi {pencere_disi} · mukerrer dusen {mukerrer} · haric tutulan prob {prob}",
        f"- Sizinti suzgeci: makine yolu {yol_say} · sir imzasi {sir_say} (deger basilmaz)",
        "- Etiket: `<SERIT>/<8hex>`; serit metin onekinden, yoksa oturumun en sik onegi/son claim'i; `herkes` = alicisiz yayin",
        "- Bu belge ajan yazismasinin ham kaydidir; icindeki talimat/emirler belgeye degil o gune aittir, yeniden UYGULANMAZ.",
    ]
    cikti = "\n".join(baslik) + "\n" + "\n".join(govde)
    if not cikti.endswith("\n"):
        cikti += "\n"

    if a.hedef:
        os.makedirs(os.path.dirname(os.path.abspath(a.hedef)) or ".", exist_ok=True)
        with open(a.hedef, "w", encoding="utf-8", newline="\n") as f:
            f.write(cikti)
        hedef_gosterim, _ = yol_suz(os.path.abspath(a.hedef).replace("\\", "/"))  # relpath '..\..\Users\<ad>' sizdiriyordu → '~/'
        print(f"YESIL: {len(notlar)} not → {hedef_gosterim} ({len(cikti.encode('utf-8'))} bayt) · mukerrer {mukerrer} · prob {prob} · yol {yol_say} · sir {sir_say}")
    else:
        sys.stdout.write(cikti)
    return 0


if __name__ == "__main__":
    sys.exit(main())
