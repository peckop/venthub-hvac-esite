#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TEKNIK DUZELTICI — canlidaki DOLU products.technical_specs'te anahtar duzeyinde duzeltme
(deger degistir / anahtar sil). Emsal ve ortak kalip: faz4-teknik-yukle.py `--girdi` kipi
(o yalniz NULL'a yazar; bu betik yalniz DOLU'ya, beyan edilmis eski degere karsi yazar).

GIRDI `--duzeltme <json>`:
  { "_nicin": [...], "_kanit": {...},
    "skus": { "<sku>": { "degistir": {"alan": yeni, ...}, "sil": ["alan", ...],
                         "onceki": {"alan": beklenen_eski, ...} } } }
  - `onceki`'de `null` = "alan canlida YOK" (JSON null degeri tasiyan alan ile ayni sayilmaz).
  - `degistir`/`sil`'deki her alan `onceki`'de beyan edilmeli; beyansiz degisiklik = GIRDI HATASI (cikis 2).
  - sku kaydinda `_` ile baslayan anahtarlar (ör. `_urun`) aciklamadir, yok sayilir.

KAPILAR (hepsi fail-closed, YAZIMDAN ONCE, hepsi-ya-hic):
1. KIMLIK — canlidan id,sku,tenant_id,technical_specs,updated_at `_veri.tumunu_cek` ile okunur.
   sku yok / birden cok kiracida / specs NULL / tenant_id-updated_at bos → KIRMIZI, HIC PATCH yok.
2. ONKOSUL — `onceki`'deki her alan canlidakiyle BIREBIR (tip dahil: 1 ≠ 1.0 ≠ "1") esit olmali.
   Tek urunde tutmazsa HICBIR urun yazilmaz.
3. IDEMPOTENT — canli hal zaten hedefse "degisiklik yok"; bu durumda `onceki` tutmamasi hata DEGIL.

YAZIM: hedef = canli + degistir − sil. Tek kosullu PATCH:
  products?id=eq.<id>&tenant_id=eq.<t>&updated_at=eq.<quote(ham, safe='')>, Prefer: return=representation.
  (`+00:00`'daki `+` kodlanmazsa PostgREST onu BOSLUK okur → hic eslesmez, her satir "yaris" gorunur.)
  0 satir → urun yeniden okunur; `onceki` hala tutuyorsa hedef TAZE specs uzerinden yeniden kurulur
  ve yeni damgayla 1 kez denenir; yine 0 → KIRMIZI.
- Iki anahtar: `--yaz` VE CANLI_YAZIM_ONAYI=evet. Tek anahtar REDDEDILIR (cikis 1).
- `--yedek` (varsayilan paket/teknik-duzelt-yedek-<UTC>.json) yazimdan ONCE, updated_at dahil.
- Yazimdan sonra canlidan geri okunur, hedefle birebir; fark → KIRMIZI.
- Denetim kaydi TETIGE birakilir (denetim_izi_products_upd); bu betik audit satiri YAZMAZ.
Cikis: 0 temiz · 1 KIRMIZI / reddedildi · 2 girdi hatasi.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import _veri  # noqa: E402

OKUMA_SECIMI = "id,sku,tenant_id,technical_specs,updated_at"
_YOK = object()  # "alan canlida yok" isareti (JSON null degerinden ayri)


class GirdiHatasi(Exception):
    pass


def _kanon(x) -> str:
    """Birebir karsilastirma: tip korunur (json: 1 → '1', 1.0 → '1.0', True → 'true')."""
    return json.dumps(x, sort_keys=True, ensure_ascii=False)


def esit(a, b) -> bool:
    if a is _YOK or b is _YOK:
        return a is b
    return _kanon(a) == _kanon(b)


def _goster(x) -> str:
    return "—" if x is _YOK else json.dumps(x, ensure_ascii=False)


def girdi_oku(yol: Path) -> dict:
    """Doner: sku → {"degistir": {}, "sil": [], "onceki": {}}. Kusur → GirdiHatasi (cikis 2)."""
    if not yol.exists():
        raise GirdiHatasi(f"GIRDI YOK: {yol}")
    try:
        ham = json.loads(yol.read_text(encoding="utf-8-sig"))
    except json.JSONDecodeError as e:
        raise GirdiHatasi(f"GIRDI JSON DEGIL: {e}")
    if not isinstance(ham, dict):
        raise GirdiHatasi("GIRDI kok nesne olmali")
    if not ham.get("_nicin"):
        raise GirdiHatasi("`_nicin` bos — gerekcesiz duzeltme yazilmaz")
    if not ham.get("_kanit"):
        raise GirdiHatasi("`_kanit` bos — kanitsiz duzeltme yazilmaz")
    skus = ham.get("skus")
    if not isinstance(skus, dict) or not skus:
        raise GirdiHatasi("`skus` bos ya da nesne degil")
    plan, hatalar = {}, []
    for sku, k in skus.items():
        if not isinstance(k, dict):
            hatalar.append(f"{sku}: kayit nesne degil")
            continue
        bilinmeyen = [x for x in k if not x.startswith("_") and x not in ("degistir", "sil", "onceki")]
        degistir, sil, onceki = k.get("degistir", {}), k.get("sil", []), k.get("onceki", {})
        if bilinmeyen:
            hatalar.append(f"{sku}: bilinmeyen anahtar {bilinmeyen}")
        if not isinstance(degistir, dict) or not isinstance(onceki, dict) \
                or not isinstance(sil, list) or not all(isinstance(s, str) for s in sil):
            hatalar.append(f"{sku}: degistir/onceki nesne, sil metin listesi olmali")
            continue
        if not degistir and not sil:
            hatalar.append(f"{sku}: degistir de sil de bos — duzeltme yok")
        cakisan = sorted(set(degistir) & set(sil))
        if cakisan:
            hatalar.append(f"{sku}: ayni alan hem degistir hem sil'de: {cakisan}")
        beyansiz = sorted((set(degistir) | set(sil)) - set(onceki))
        if beyansiz:
            hatalar.append(f"{sku}: `onceki`'de beklenen eski deger beyan edilmemis: {beyansiz}")
        plan[sku] = {"degistir": degistir, "sil": list(sil), "onceki": onceki}
    if hatalar:
        raise GirdiHatasi("GIRDI KIRMIZI — hicbir sey yazilmadi:\n   " + "\n   ".join(hatalar[:40]))
    return plan


def hedef_kur(mevcut: dict, d: dict) -> dict:
    yeni = dict(mevcut)
    yeni.update(d["degistir"])
    for alan in d["sil"]:
        yeni.pop(alan, None)
    return yeni


def onkosul_tutmayan(mevcut: dict, d: dict) -> list[str]:
    tutmayan = []
    for alan, beklenen in d["onceki"].items():
        gercek = mevcut.get(alan, _YOK)
        bek = _YOK if beklenen is None else beklenen
        if not esit(gercek, bek):
            tutmayan.append(f"{alan}: beklenen {_goster(bek)} ≠ canli {_goster(gercek)}")
    return tutmayan


def patch_yolu(u: dict) -> str:
    """Kosullu PATCH yolu. updated_at HAM dize, quote(safe='') ile — `+` → %2B, `:` → %3A."""
    for k in ("id", "tenant_id", "updated_at"):
        if not u.get(k):
            raise ValueError(f"{u.get('sku')}: {k} eksik — kosullu PATCH kurulamaz")
    return (f"products?id=eq.{u['id']}&tenant_id=eq.{u['tenant_id']}"
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
    try:
        r = _veri.rest(U, h, f"products?select={OKUMA_SECIMI}&id=eq.{u['id']}&tenant_id=eq.{u['tenant_id']}")
    except (urllib.error.URLError, ValueError):
        return None
    return r[0] if isinstance(r, list) and len(r) == 1 else None


def calis(a) -> int:
    plan = girdi_oku(Path(a.duzeltme))
    print(f"DUZELTME: {a.duzeltme}")
    print(f"  {len(plan)} urun · degistir {sum(len(d['degistir']) for d in plan.values())} alan"
          f" · sil {sum(len(d['sil']) for d in plan.values())} alan")

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

    # ---- KIMLIK KAPISI: tek kusur = HIC PATCH yok
    kimlik_hata = []
    for sku in sorted(plan):
        adaylar = canli.get(sku, [])
        if not adaylar:
            kimlik_hata.append(f"{sku}: canlida YOK")
        elif len(adaylar) > 1:
            kimlik_hata.append(f"{sku}: canlida {len(adaylar)} satir (kiraci belirsiz)")
        elif not isinstance(adaylar[0].get("technical_specs"), dict):
            kimlik_hata.append(f"{sku}: technical_specs NULL/nesne degil — bu betik yalniz DOLU specs duzeltir")
        elif not adaylar[0].get("tenant_id") or not adaylar[0].get("updated_at"):
            kimlik_hata.append(f"{sku}: tenant_id/updated_at bos — kosullu PATCH kurulamaz")
    if kimlik_hata:
        raise SystemExit(f"⛔ KIMLIK KIRMIZI ({len(kimlik_hata)}) — hicbir sey yazilmadi:\n   "
                         + "\n   ".join(kimlik_hata[:40]))

    # ---- PLAN + ONKOSUL (hepsi-ya-hic, yazimdan ONCE)
    yazilacak, ayni, onkosul_hata, tablo = [], [], [], []
    for sku in sorted(plan):
        u, d = canli[sku][0], plan[sku]
        mevcut = u["technical_specs"]
        hedef = hedef_kur(mevcut, d)
        if esit(mevcut, hedef):
            ayni.append(sku)
            durum = "degisiklik yok"
        else:
            tutmayan = onkosul_tutmayan(mevcut, d)
            if tutmayan:
                onkosul_hata.append(f"{sku}: onkosul tutmadi — " + "; ".join(tutmayan))
                durum = "KIRMIZI onkosul"
            else:
                yazilacak.append((sku, u, hedef))
                durum = "yazilacak"
        for alan in list(d["degistir"]) + d["sil"]:
            yeni = hedef.get(alan, _YOK)
            tablo.append((sku, alan, _goster(mevcut.get(alan, _YOK)), _goster(yeni), durum))

    print("\nKURU KOSUM RAPORU")
    print(f"  yazilacak urun  : {len(yazilacak)}")
    print(f"  degisiklik yok  : {len(ayni)}")
    print(f"  onkosul KIRMIZI : {len(onkosul_hata)}")
    print(f"\n  {'SKU':<16} {'alan':<22} eski → yeni  [durum]")
    for sku, alan, eski, yeni, durum in tablo[:80]:
        print(f"  {sku:<16} {alan:<22} {eski} → {yeni}  [{durum}]")
    if len(tablo) > 80:
        print(f"  ... {len(tablo) - 80} satir daha")

    if onkosul_hata:
        raise SystemExit(f"⛔ ONKOSUL KIRMIZI ({len(onkosul_hata)}) — HICBIR urun yazilmadi (hepsi-ya-hic):\n   "
                         + "\n   ".join(onkosul_hata[:40]))

    hatalar: list[str] = []
    if not yaz:
        print("\nKURU KOSUM — hicbir sey yazilmadi. Yazim icin iki anahtar: --yaz VE CANLI_YAZIM_ONAYI=evet")
        return _bitir(hatalar)
    if not yazilacak:
        print("\nYazilacak urun yok (hepsi zaten hedefte).")
        return _bitir(hatalar)

    # ---- YEDEK (yazimdan ONCE; okunan satirlar updated_at dahil)
    yedek = Path(a.yedek or (Path(__file__).resolve().parents[2] / "paket" /
                             f"teknik-duzelt-yedek-{datetime.now(timezone.utc):%Y%m%dT%H%M%SZ}.json"))
    yedek.parent.mkdir(parents=True, exist_ok=True)
    yedek.write_text(json.dumps([canli[s][0] for s in sorted(plan)], ensure_ascii=False, indent=2) + "\n",
                     encoding="utf-8")
    print(f"\nYEDEK: {yedek} ({len(plan)} kayit, updated_at dahil)")

    # ---- YAZIM (kosullu PATCH, 0 satirda 1 yeniden okuma + onkosul + 1 deneme)
    basarili = []  # (sku, u, yazilan hedef)
    for sku, u, hedef in yazilacak:
        n, hata = _patch(U, h, u, hedef)
        if not hata and n == 0:
            taze = _tek_oku(U, h, u)
            if taze is None:
                hatalar.append(f"{sku}: yeniden okumada urun yok")
                continue
            ts = taze.get("technical_specs")
            if not isinstance(ts, dict):
                hatalar.append(f"{sku}: yeniden okumada technical_specs NULL (araya baska yazim girdi) — yazilmadi")
                continue
            tutmayan = onkosul_tutmayan(ts, plan[sku])
            if tutmayan:
                hatalar.append(f"{sku}: yeniden okumada onkosul tutmadi (araya baska yazim girdi) — "
                               + "; ".join(tutmayan))
                continue
            hedef = hedef_kur(ts, plan[sku])
            u = taze
            n, hata = _patch(U, h, u, hedef)
        if hata:
            hatalar.append(f"{sku}: {hata}")
        elif n == 1:
            basarili.append((sku, u, hedef))
        else:
            hatalar.append(f"{sku}: donen satir {n} (yaris ikinci denemede de surdu)")
    print(f"YAZILAN: {len(basarili)}/{len(yazilacak)}")

    # ---- YAZIM SONRASI DOGRULAMA (beyan degil, olcum)
    uymayan = []
    for sku, u, hedef in basarili:
        son = _tek_oku(U, h, u)
        if son is None or not esit(son.get("technical_specs"), hedef):
            uymayan.append(sku)
    print(f"DOGRULAMA (canlidan okundu): hedef ile birebir {len(basarili) - len(uymayan)}/{len(basarili)}")
    if uymayan:
        hatalar.append(f"canlida hedefe uymayan: {', '.join(uymayan)}")
    return _bitir(hatalar)


def _bitir(hatalar: list) -> int:
    if hatalar:
        print(f"\n⛔ KIRMIZI {len(hatalar)}:", file=sys.stderr)
        for x in hatalar:
            print("   " + x, file=sys.stderr)
        return 1
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="DOLU technical_specs'te anahtar duzeyinde duzeltme")
    ap.add_argument("--duzeltme", required=True, help="duzeltme JSON'u (_nicin, _kanit, skus)")
    ap.add_argument("--yaz", action="store_true", help="CANLIYA YAZ (ayrica CANLI_YAZIM_ONAYI=evet gerekir)")
    ap.add_argument("--yedek", help="yazimdan once okunan satirlarin yedegi (JSON)")
    a = ap.parse_args()
    try:
        return calis(a)
    except GirdiHatasi as e:
        print(f"⛔ {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    _veri.utf8_akis()
    sys.exit(main())
