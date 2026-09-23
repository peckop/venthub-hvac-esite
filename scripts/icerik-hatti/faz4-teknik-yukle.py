#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""FAZ 4 ADIM 2 — duzeltilmis staging CSV'lerini products.technical_specs'e YUKLEYICI.

VARSAYILAN: KURU KOSUM (hicbir sey yazilmaz). Canliya yazim icin `--yaz` VE ortam
degiskeni CANLI_YAZIM_ONAYI=<Recep'in verdigi damga> gerekir — ikisi birden.
⛔Recep'in KENDI sozu olmadan yazilmaz; akran aktarimi onay degildir.

KAPILAR (hepsi fail-closed):
1. EVREN — duzeltilmis/ altinda 8 dosya olmali (dar dizin = sessiz eksik yukleme).
2. VERI  — canli okuma `_veri.tumunu_cek` ile: kesin sayi + sirali sayfalama + karsilastirma
           (PostgREST 1000 satirda SESSIZCE keser).
3. ESLESME — CSV'deki her sku canlida bulunmali; bulunamayan varsa YAZIM YAPILMAZ.
4. IDEMPOTENT — ayni deger zaten yaziliysa hucre DEGISMEZ sayilir; ikinci kosum 0 degisiklik.

Cikti: hangi SKU · hangi anahtar · eski -> yeni. Rapor Recep'e gider.

─── GIRDI KIPI (REC-172 plan v5.1 kabul 7 + adim 3): `--girdi <csv>` ───
Kolonlar: sku,urun_id,alan,deger,birim,belge,sayfa,alinti,kaynak,kural
(kaynak ∈ alıntı|koşullu|türetildi). `--girdi` yoksa yukaridaki eski kip AYNEN calisir.
- Urun basina tum satirlardan `technical_specs` kurulur (sayi → int/float, metin oldugu gibi).
  Bos `deger` = ✗ satiri (kabul 6: uydurma yok) → yazilmaz, sayilir.
- Canlidan id,sku,tenant_id,technical_specs,updated_at okunur; sku ile eslenir. sku yok / urun_id
  tutmuyor / sku birden cok kiracida → KIRMIZI, HIC PATCH atilmaz.
- YALNIZ technical_specs NULL urune yazilir. Dolu ve girdiyle BIREBIR ayni → "degisiklik yok"
  (ikinci kosum); dolu ve farkli → o urun yazilmaz, KIRMIZI.
- Yazim TEK atomik kosullu PATCH:
  products?id=eq.<id>&tenant_id=eq.<t>&technical_specs=is.null&updated_at=eq.<quote(ham, safe='')>
  (`+00:00`'daki `+` kodlanmazsa PostgREST onu BOSLUK okur → hic eslesmez, her satir "yaris" gorunur).
  0 satir → urun yeniden okunur; hala NULL ise yeni damgayla 1 kez denenir; yine 0 → KIRMIZI.
- Denetim kaydi TETIGE birakilir (denetim_izi_products_upd); bu betik audit satiri YAZMAZ.
- Iki anahtar: `--yaz` VE CANLI_YAZIM_ONAYI=evet. Tek anahtar (`--yaz` onaysiz) REDDEDILIR.
- Yazimdan once `--yedek` (okunan satirlar, updated_at dahil); yazimdan sonra canlidan geri okunur
  ve yazilan sozlukle birebir karsilastirilir.
"""
import argparse
import csv
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _veri  # noqa: E402

# Mutlak yol YAZILMAZ (depo PUBLIC + tek makineye baglanma); ortam degiskeni + akilli varsayilan.
DUZELTILMIS = Path(os.environ.get("INGESTOR_STAGING")
                   or Path.home() / "venthub-pdf-ingestor" / "staging") / "duzeltilmis"
BEKLENEN_DOSYA = 8


def csv_oku() -> tuple[dict, int]:
    if not DUZELTILMIS.exists():
        raise SystemExit(f"⛔ EVREN YOK: {DUZELTILMIS} — once faz4-etiket-duzelt.py kos")
    dosyalar = sorted(DUZELTILMIS.glob("teknik-*-duzeltilmis.csv"))
    if len(dosyalar) != BEKLENEN_DOSYA:
        raise SystemExit(f"⛔ EVREN EKSIK: {len(dosyalar)} dosya, {BEKLENEN_DOSYA} bekleniyordu "
                         f"— dar dizinle uretilen yukleme SESSIZCE eksik yazar")
    veri, satir = defaultdict(dict), 0
    for d in dosyalar:
        with open(d, encoding="utf-8", newline="") as fh:
            for s in csv.DictReader(fh):
                deger = s["deger"].strip()
                try:
                    deger = int(deger) if deger.lstrip("-").isdigit() else float(deger.replace(",", "."))
                except ValueError:
                    pass  # metin deger (ip_rating, wiring, atex_marking...) oldugu gibi kalir
                veri[s["sku"]][s["alan"]] = deger
                satir += 1
    return veri, satir


# ─────────────────────────── GIRDI KIPI (REC-172) ───────────────────────────
GIRDI_KOLONLARI = ["sku", "urun_id", "alan", "deger", "birim", "belge", "sayfa", "alinti", "kaynak", "kural"]
KAYNAK_TURLERI = {"alıntı", "koşullu", "türetildi"}
OKUMA_SECIMI = "id,sku,tenant_id,technical_specs,updated_at"
_TAM = re.compile(r"^-?\d+$")
_ONDALIK = re.compile(r"^-?\d+[.,]\d+$")


def sayi_coz(ham: str):
    """Tam sayi → int, tek ayiricili ondalik (1,5 / 1.5) → float, gerisi metin OLDUGU GIBI.
    `float()` kullanilmaz: 'nan', 'inf', '1e3' sayi sanilir (metin alan sessizce sayiya doner)."""
    if _TAM.match(ham):
        return int(ham)
    if _ONDALIK.match(ham):
        return float(ham.replace(",", "."))
    return ham


def girdi_oku(yol: Path) -> tuple[dict, dict, list, int]:
    """Doner: (sku → {alan: deger}, sku → urun_id, satir listesi, bos ✗ satir sayisi).
    Yapisal her kusur KIRMIZI (SystemExit) — hicbir sey yazilmadan."""
    if not yol.exists():
        raise SystemExit(f"⛔ GIRDI YOK: {yol}")
    with open(yol, encoding="utf-8-sig", newline="") as fh:
        okuyucu = csv.DictReader(fh)
        eksik_kolon = [k for k in GIRDI_KOLONLARI if k not in (okuyucu.fieldnames or [])]
        if eksik_kolon:
            raise SystemExit(f"⛔ GIRDI KOLONU EKSIK: {eksik_kolon} — beklenen {GIRDI_KOLONLARI}")
        satirlar = list(okuyucu)
    specs, kimlik, hatalar, bos = defaultdict(dict), {}, [], 0
    for no, s in enumerate(satirlar, start=2):
        sku, uid, alan = (s["sku"] or "").strip(), (s["urun_id"] or "").strip(), (s["alan"] or "").strip()
        kaynak, ham = (s["kaynak"] or "").strip(), (s["deger"] or "").strip()
        if not (sku and uid and alan):
            hatalar.append(f"satir {no}: sku/urun_id/alan bos")
            continue
        if kimlik.setdefault(sku, uid) != uid:
            hatalar.append(f"satir {no}: {sku} iki farkli urun_id tasiyor ({kimlik[sku]} / {uid})")
            continue
        if not ham:
            bos += 1  # ✗ satiri: kaynak vermiyor, yazilmaz (kabul 6)
            continue
        if kaynak not in KAYNAK_TURLERI:
            hatalar.append(f"satir {no}: {sku}.{alan} kaynak={kaynak!r} — {sorted(KAYNAK_TURLERI)} olmali")
            continue
        if kaynak == "alıntı" and not all((s[k] or "").strip() for k in ("belge", "sayfa", "alinti")):
            hatalar.append(f"satir {no}: {sku}.{alan} alıntı ama belge/sayfa/alinti eksik (kabul 1)")
            continue
        if kaynak == "koşullu" and not (s["kural"] or "").strip():
            hatalar.append(f"satir {no}: {sku}.{alan} koşullu ama kural metni yok (kabul 1)")
            continue
        deger = sayi_coz(ham)
        if alan in specs[sku] and specs[sku][alan] != deger:
            hatalar.append(f"satir {no}: {sku}.{alan} iki farkli deger ({specs[sku][alan]!r} / {deger!r})")
            continue
        specs[sku][alan] = deger
    if hatalar:
        raise SystemExit("⛔ GIRDI KIRMIZI — hicbir sey yazilmadi:\n   " + "\n   ".join(hatalar[:40]))
    return dict(specs), kimlik, satirlar, bos


def patch_yolu(u: dict) -> str:
    """Atomik kosullu PATCH yolu. updated_at HAM dize, quote(safe='') ile — `+` → %2B, `:` → %3A."""
    for k in ("id", "tenant_id", "updated_at"):
        if not u.get(k):
            raise ValueError(f"{u.get('sku')}: {k} eksik — kosullu PATCH kurulamaz")
    return (f"products?id=eq.{u['id']}&tenant_id=eq.{u['tenant_id']}&technical_specs=is.null"
            f"&updated_at=eq.{urllib.parse.quote(u['updated_at'], safe='')}")


def _patch(U: str, h: dict, u: dict, specs: dict) -> tuple[int | None, str]:
    """Doner (donen satir sayisi, hata). return=representation: 0 satir = kosul tutmadi."""
    istek = urllib.request.Request(
        f"{U}/rest/v1/{patch_yolu(u)}", method="PATCH",
        data=json.dumps({"technical_specs": specs}, ensure_ascii=False).encode("utf-8"),
        headers={**h, "Content-Type": "application/json", "Prefer": "return=representation"})
    try:
        with urllib.request.urlopen(istek) as c:
            govde = json.loads(c.read().decode("utf-8") or "[]")
    except urllib.error.HTTPError as e:
        return None, f"HTTP {e.code} {e.read().decode('utf-8', 'replace')[:200]}"
    except urllib.error.URLError as e:
        return None, f"AG HATASI {e.reason}"
    if not isinstance(govde, list):
        return None, f"beklenmeyen cevap: {str(govde)[:120]}"
    return len(govde), ""


def _tek_oku(U: str, h: dict, u: dict) -> dict | None:
    r = _veri.rest(U, h, f"products?select={OKUMA_SECIMI}&id=eq.{u['id']}&tenant_id=eq.{u['tenant_id']}")
    return r[0] if isinstance(r, list) and len(r) == 1 else None


def girdi_kipi(a) -> int:
    specs, kimlik, satirlar, bos = girdi_oku(Path(a.girdi))
    hucre = sum(len(v) for v in specs.values())
    print(f"GIRDI: {a.girdi}")
    print(f"  {len(satirlar)} satir · {len(specs)} urun · {hucre} hucre · bos (✗) satir {bos}")

    yaz = a.yaz and os.environ.get("CANLI_YAZIM_ONAYI") == "evet"
    if a.yaz and not yaz:
        raise SystemExit("⛔ CANLI YAZIM REDDEDILDI: tek anahtar. Iki anahtar gerekir: "
                         "--yaz VE CANLI_YAZIM_ONAYI=evet (Recep'in KENDI sozu). Hicbir sey yazilmadi.")

    U, h = _veri.baglan()
    urunler = _veri.tumunu_cek(U, h, f"products?select={OKUMA_SECIMI}", "products")
    canli = defaultdict(list)
    for u in urunler:
        canli[u.get("sku")].append(u)
    print(f"CANLI: {len(urunler)} urun (kesin sayi ile dogrulandi)")

    # ---- KIMLIK KAPISI: tek kusur = HIC PATCH yok (fail-closed)
    kimlik_hata = []
    for sku in sorted(set(specs) | set(kimlik)):
        adaylar = canli.get(sku, [])
        if not adaylar:
            kimlik_hata.append(f"{sku}: canlida YOK")
        elif len(adaylar) > 1:
            kimlik_hata.append(f"{sku}: canlida {len(adaylar)} satir (kiraci belirsiz)")
        elif str(adaylar[0]["id"]) != kimlik[sku]:
            kimlik_hata.append(f"{sku}: urun_id tutmuyor (girdi {kimlik[sku]} ≠ canli {adaylar[0]['id']})")
        elif not adaylar[0].get("tenant_id") or not adaylar[0].get("updated_at"):
            kimlik_hata.append(f"{sku}: tenant_id/updated_at bos — kosullu PATCH kurulamaz")
    if kimlik_hata:
        raise SystemExit(f"⛔ KIMLIK KIRMIZI ({len(kimlik_hata)}) — hicbir sey yazilmadi:\n   "
                         + "\n   ".join(kimlik_hata[:40]))

    # ---- PLAN: yalniz NULL'a yazilir
    yazilacak, ayni, kirmizi, tablo = [], [], [], []
    for sku in sorted(specs):
        u = canli[sku][0]
        mevcut = u.get("technical_specs")
        if mevcut is None:
            yazilacak.append((sku, u))
            durum = "yazilacak"
        elif mevcut == specs[sku]:
            ayni.append(sku)
            durum = "degisiklik yok"
        else:
            fark = sorted(k for k in set(mevcut) | set(specs[sku]) if mevcut.get(k) != specs[sku].get(k))
            kirmizi.append(f"{sku}: technical_specs DOLU ve girdiden farkli ({len(fark)} anahtar: "
                           f"{', '.join(fark[:6])}) — yazilmadi")
            durum = "KIRMIZI dolu-farkli"
        for alan, deger in specs[sku].items():
            tablo.append((sku, alan, deger, durum))

    print("\nKURU KOSUM RAPORU")
    print(f"  yazilacak urun  : {len(yazilacak)}  ({sum(len(specs[s]) for s, _ in yazilacak)} hucre)")
    print(f"  zaten dolu      : {len(ayni) + len(kirmizi)}  (degisiklik yok {len(ayni)} · KIRMIZI {len(kirmizi)})")
    print(f"\n  {'SKU':<16} {'alan':<28} {'deger':<22} durum")
    for sku, alan, deger, durum in tablo[:40]:
        print(f"  {sku:<16} {alan:<28} {str(deger):<22} {durum}")
    if len(tablo) > 40:
        print(f"  ... {len(tablo) - 40} satir daha")

    hatalar = list(kirmizi)
    if not yaz:
        print("\nKURU KOSUM — hicbir sey yazilmadi. Yazim icin iki anahtar: --yaz VE CANLI_YAZIM_ONAYI=evet")
        return _bitir(hatalar)

    # ---- YEDEK (yazimdan ONCE; okunan satirlar updated_at dahil)
    yedek = Path(a.yedek or (Path(__file__).resolve().parents[2] / "paket" /
                             f"faz4-teknik-yedek-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"))
    yedek.parent.mkdir(parents=True, exist_ok=True)
    yedek.write_text(json.dumps([canli[s][0] for s in sorted(specs)], ensure_ascii=False, indent=2) + "\n",
                     encoding="utf-8")
    print(f"\nYEDEK: {yedek} ({len(specs)} kayit, updated_at dahil)")

    # ---- YAZIM (atomik kosullu PATCH, 0 satirda 1 yeniden okuma + 1 deneme)
    basarili = []
    for sku, u in yazilacak:
        n, hata = _patch(U, h, u, specs[sku])
        if not hata and n == 0:
            taze = _tek_oku(U, h, u)
            if taze is None:
                hatalar.append(f"{sku}: yeniden okumada urun yok")
                continue
            if taze.get("technical_specs") is not None:
                hatalar.append(f"{sku}: yeniden okumada technical_specs DOLU (araya baska yazim girdi) — yazilmadi")
                continue
            n, hata = _patch(U, h, taze, specs[sku])
        if hata:
            hatalar.append(f"{sku}: {hata}")
        elif n == 1:
            basarili.append(sku)
        else:
            hatalar.append(f"{sku}: donen satir {n} (yaris ikinci denemede de surdu)")
    print(f"YAZILAN: {len(basarili)}/{len(yazilacak)}")

    # ---- YAZIM SONRASI DOGRULAMA (beyan degil, olcum)
    uymayan = []
    for sku in basarili:
        son = _tek_oku(U, h, canli[sku][0])
        if son is None or son.get("technical_specs") != specs[sku]:
            uymayan.append(sku)
    print(f"DOGRULAMA (canlidan okundu): girdi ile birebir {len(basarili) - len(uymayan)}/{len(basarili)}")
    if uymayan:
        hatalar.append(f"canlida girdiye uymayan: {', '.join(uymayan)}")
    return _bitir(hatalar)


def _bitir(hatalar: list) -> int:
    if hatalar:
        print(f"\n⛔ KIRMIZI {len(hatalar)}:", file=sys.stderr)
        for x in hatalar:
            print("   " + x, file=sys.stderr)
        return 1
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--yaz", action="store_true", help="CANLIYA YAZ (ayrica CANLI_YAZIM_ONAYI gerekir)")
    ap.add_argument("--girdi", help="REC-172 cikarim CSV'si (verilmezse eski 8-dosya kipi)")
    ap.add_argument("--yedek", help="girdi kipi: yazimdan once okunan satirlarin yedegi (JSON)")
    a = ap.parse_args()
    if a.girdi:
        return girdi_kipi(a)
    if a.yedek:
        raise SystemExit("⛔ --yedek yalniz --girdi kipinde gecerli")

    veri, satir = csv_oku()
    print(f"CSV: {len(veri)} SKU · {satir} deger (evren kapisi: {BEKLENEN_DOSYA}/{BEKLENEN_DOSYA} dosya)")

    U, h = _veri.baglan()
    urunler = _veri.tumunu_cek(U, h, "products?select=id,sku,technical_specs", "products")
    canli = {u["sku"]: u for u in urunler}
    print(f"CANLI: {len(urunler)} urun (kesin sayi ile dogrulandi)")

    eksik = sorted(set(veri) - set(canli))
    if eksik:
        raise SystemExit(f"⛔ ESLESMEYEN {len(eksik)} SKU canlida YOK — yazim yapilmadi: {eksik[:8]}")

    degisiklik, dokunulan, ayni = [], {}, 0
    for sku, alanlar in veri.items():
        mevcut = canli[sku].get("technical_specs") or {}
        yeni = dict(mevcut)
        for k, v in alanlar.items():
            if mevcut.get(k) == v:
                ayni += 1
                continue
            degisiklik.append((sku, k, mevcut.get(k, "—"), v))
            yeni[k] = v
        if yeni != mevcut:
            dokunulan[sku] = (canli[sku]["id"], yeni)

    print(f"\nKURU KOSUM RAPORU")
    print(f"  degisecek hucre : {len(degisiklik)}")
    print(f"  degisecek urun  : {len(dokunulan)}")
    print(f"  zaten ayni      : {ayni}  (idempotent: ikinci kosumda hepsi buraya duser)")
    print(f"\n  SKU            anahtar                       eski -> yeni")
    for sku, k, e, y in degisiklik[:40]:
        print(f"  {sku:<14} {k:<28} {str(e):<12} -> {y}")
    if len(degisiklik) > 40:
        print(f"  ... {len(degisiklik) - 40} satir daha (tam liste: --yaz oncesi dosyaya alinir)")

    if not a.yaz:
        print("\nKURU KOSUM — hicbir sey yazilmadi. Canliya yazim icin: --yaz + CANLI_YAZIM_ONAYI")
        return 0

    onay = os.environ.get("CANLI_YAZIM_ONAYI")
    if not onay:
        raise SystemExit("⛔ CANLI YAZIM REDDEDILDI: CANLI_YAZIM_ONAYI yok. "
                         "Recep'in KENDI sozu gerekir; akran aktarimi onay degildir.")
    print(f"\nCANLIYA YAZILIYOR (onay damgasi: {onay}) — {len(dokunulan)} urun")
    yazilan = 0
    for sku, (uid, yeni) in dokunulan.items():
        gvd = json.dumps({"technical_specs": yeni}).encode("utf-8")
        istek = urllib.request.Request(
            f"{U}/rest/v1/products?id=eq.{uid}", data=gvd, method="PATCH",
            headers={**h, "Content-Type": "application/json", "Prefer": "return=minimal"})
        with urllib.request.urlopen(istek) as c:
            if c.status not in (200, 204):
                raise SystemExit(f"⛔ YAZIM HATASI {sku}: HTTP {c.status} — durduruldu ({yazilan} yazilmisti)")
        yazilan += 1
    print(f"✓ {yazilan} urun guncellendi")
    return 0


if __name__ == "__main__":
    _veri.utf8_akis()
    sys.exit(main())
