#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ORTAK VERI ERISIMI — salt okuma + veri-tamligi kapisi (REC-163/168 recetesi).

NICIN AYRI MODUL: ayni kapi iki betikte KOPYA dursa, biri duzeltilip oteki unutulur ve
gunun birinde "iki betik ayni soruya iki cevap verir" haline duseriz. Tek yerde durur.

⭐OLCULDU 2026-09-06 (uc ayri vaka, ucu de sessizdi):
1. PostgREST tek cagrida EN COK 1000 satir doner; `limit=2000` ISE YARAMAZ (2000 istedim,
   1000 geldi). product_prices 1044 satir -> 44 satir SESSIZCE dustu.
2. Kesin sayi alinamazsa denetimi ATLAMAK fail-open'dir: kapi tam gerektigi anda
   kendini kapatir. "Olcemedim" ile "temiz" ayni dala DUSMEZ.
3. Dongu tavani yoksa, sayfalama bozuldugunda (offset ilerlemezse) SONSUZ dongu.

⚠`count=exact` her istemcide ayni yerde kabul EDILMEZ. Burada ham urllib + `Prefer`
basligi kullaniliyor ve Content-Range olculuyor. supabase-js'te secenek zincirin sonunda
.select() ile istenirse YUTULUYOR (ALTYAPI olctu). Kural: "her yerde calisir" degil,
"istemcin nerede kabul ediyor, OLC".
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request
from pathlib import Path


def env_oku() -> dict:
    yol = Path(os.environ.get("VENTHUB_ENV") or (Path.home() / "venthub-hvac" / ".env"))
    o = {}
    for satir in yol.read_text(encoding="utf-8").splitlines():
        if not satir or satir.startswith("#") or "=" not in satir:
            continue
        k, v = satir.split("=", 1)
        o[k.strip()] = v.strip().strip("\"'")
    return o


def baglan() -> tuple[str, dict]:
    """(URL, basliklar). Anon anahtar KABUL EDILMEZ — RLS altinda sessizce BOS doner
    ve bos veri "hic bosluk yok" gibi gorunur; en tehlikeli sahte yesil."""
    o = env_oku()
    U = o.get("SUPABASE_URL") or o.get("NEXT_PUBLIC_SUPABASE_URL")
    K = o.get("SUPABASE_SERVICE_ROLE_KEY")
    if not (U and K):
        raise SystemExit("⛔ SUPABASE_URL / SERVICE_ROLE_KEY yok — anon ile olculmez.")
    return U, {"apikey": K, "Authorization": "Bearer " + K}


def rest(U: str, h: dict, yol: str):
    istek = urllib.request.Request(f"{U}/rest/v1/{yol}", headers=h)
    with urllib.request.urlopen(istek) as y:
        return json.loads(y.read().decode("utf-8"))


def kesin_sayi(U: str, h: dict, tablo: str) -> int:
    istek = urllib.request.Request(f"{U}/rest/v1/{tablo}?select=id&limit=1",
                                   headers={**h, "Prefer": "count=exact"})
    with urllib.request.urlopen(istek) as y:
        cr = y.headers.get("Content-Range") or ""
    son = cr.split("/")[-1] if "/" in cr else ""
    if not son.isdigit():
        raise SystemExit(f"⛔ OLCUM GUVENILIR DEGIL: {tablo} icin kesin sayi alinamadi "
                         f"(Content-Range: {cr!r}). Cikti uretilmedi.")
    return int(son)


def tumunu_cek(U: str, h: dict, yol: str, tablo: str) -> list:
    """Sayfalar VE sayfalamanin dogru calistigini OLCER. Ikisi ayri sey."""
    kesin = kesin_sayi(U, h, tablo)
    tur_tavani = kesin // 1000 + 2
    top, bas, tur = [], 0, 0
    while True:
        tur += 1
        if tur > tur_tavani:
            raise SystemExit(f"⛔ DONGU TAVANI asildi: {tablo} — {tur} tur, beklenen en cok "
                             f"{tur_tavani}. Sayfalama bozuk; cikti uretilmedi.")
        parca = rest(U, h, f"{yol}&offset={bas}&limit=1000")
        if not parca:
            break
        top += parca
        if len(parca) < 1000:
            break
        bas += 1000
    if len(top) != kesin:
        raise SystemExit(f"⛔ EKSIK VERI: {tablo} — cekilen {len(top)}, sunucu {kesin}. "
                         "Olcum GECERSIZ; cikti uretilmedi.")
    return top


def utf8_akis():
    for a in (sys.stdout, sys.stderr):
        try:
            a.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
