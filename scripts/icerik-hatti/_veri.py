#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""ORTAK VERI ERISIMI — salt okuma + veri-tamligi kapisi (REC-163/168 recetesi).

NICIN AYRI MODUL: ayni kapi iki betikte KOPYA dursa, biri duzeltilip oteki unutulur ve
gunun birinde "iki betik ayni soruya iki cevap verir" haline duseriz. Tek yerde durur.
(2026-09-06 aksami tam bu oldu: fiyatsiz-ayrim.py kendi kopyasini tasiyordu, select=* duzeltmesi
ona girmemisti ve sayfalamasi SIRASIZDI — workflow curutmesi buldu. Kopyalar kaldirildi.)

⭐OLCULDU 2026-09-06 (dort ayri vaka, dordu de sessizdi):
1. PostgREST tek cagrida EN COK 1000 satir doner (Supabase projesinin max-rows AYARI; varsayilan
   1000, Dashboard/Management API ile degisebilir — depoda kaydi yok). `limit=2000` ISE YARAMAZ.
   product_prices 1044 satir -> 44 satir SESSIZCE dustu.
2. Kesin sayi alinamazsa denetimi ATLAMAK fail-open'dir: kapi tam gerektigi anda
   kendini kapatir. "Olcemedim" ile "temiz" ayni dala DUSMEZ.
3. Dongu tavani yoksa, sayfalama bozuldugunda (offset ilerlemezse) SONSUZ dongu.
4. SIRASIZ sayfalama (order= yok) satir atlar/tekrarlar ve toplam sayi YINE tutar — kesin sayi
   kapisi bunu GOREMEZ. Her sayfali okumada deterministik sira sarttir (varsayilan order=id).

⚠`count=exact` her istemcide ayni yerde kabul EDILMEZ. Burada ham urllib + `Prefer`
basligi kullaniliyor ve Content-Range olculuyor. supabase-js'te secenek zincirin sonunda
.select() ile istenirse YUTULUYOR (ALTYAPI olctu). Kural: "her yerde calisir" degil,
"istemcin nerede kabul ediyor, OLC".

SINAV (her degisiklikte): SAYFA_BOYU=100 ile ≤1000 satirlik tabloda da sayfalama yolu KOSAR;
sabotaj A (Prefer kopuk) -> cikis 1; sabotaj B (offset ilerlemesin) -> DONGU TAVANI, cikis 1.
Tablo tek sayfaya sigiyorsa sabotaj B bos sinavdir — sayfa boyunu kucult.
"""
from __future__ import annotations

import json
import os
import re
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


def _sorgu_ekle(yol: str, ek: str) -> str:
    return yol + ("&" if "?" in yol else "?") + ek


def kesin_sayi(U: str, h: dict, yol: str) -> int:
    """`yol` bir tablo adi ("products") YA DA filtreli sorgu ("products?select=id&status=eq.active")
    olabilir; sayi AYNI filtreyle alinir (tablo sayisi ile filtreli cekim karsilastirilirsa kapi
    daima kirmizi olur — workflow bulgusu). select=* : 'id' kolonu olmayan tablo/gorunumlerde
    select=id 400 verir ve olcum "olculemedi"ye duser (2026-09-06 taramasinda 8 nesne)."""
    sorgu = yol if "?" in yol else f"{yol}?select=*"
    istek = urllib.request.Request(f"{U}/rest/v1/{_sorgu_ekle(sorgu, 'limit=1')}",
                                   headers={**h, "Prefer": "count=exact"})
    with urllib.request.urlopen(istek) as y:
        cr = y.headers.get("Content-Range") or ""
    son = cr.split("/")[-1] if "/" in cr else ""
    if not son.isdigit():
        raise SystemExit(f"⛔ OLCUM GUVENILIR DEGIL: {yol} icin kesin sayi alinamadi "
                         f"(Content-Range: {cr!r}). Cikti uretilmedi.")
    return int(son)


def tumunu_cek(U: str, h: dict, yol: str, tablo: str, sira: str = "id") -> list:
    """Sayfalar VE sayfalamanin dogru calistigini OLCER. Ikisi ayri sey.
    - kesin sayi AYNI filtreyle (yol) alinir;
    - `order=` yoksa `order=<sira>` eklenir (sirasiz sayfalama satir atlar, sayi yine tutar);
    - sayfa boyu SAYFA_BOYU ortam degiskeniyle kuculur (sinav icin), varsayilan 1000."""
    boy = int(os.environ.get("SAYFA_BOYU") or 1000)
    if boy < 1 or boy > 1000:
        raise SystemExit(f"⛔ SAYFA_BOYU {boy} gecersiz (1..1000).")
    if not re.search(r"(^|[?&])order=", yol):
        yol = _sorgu_ekle(yol, f"order={sira}")
    kesin = kesin_sayi(U, h, yol)
    tur_tavani = kesin // boy + 2
    top, bas, tur = [], 0, 0
    while True:
        tur += 1
        if tur > tur_tavani:
            raise SystemExit(f"⛔ DONGU TAVANI asildi: {tablo} — {tur} tur, beklenen en cok "
                             f"{tur_tavani}. Sayfalama bozuk; cikti uretilmedi.")
        parca = rest(U, h, _sorgu_ekle(yol, f"offset={bas}&limit={boy}"))
        if not isinstance(parca, list):
            raise SystemExit(f"⛔ BEKLENMEYEN CEVAP: {tablo} — liste degil: {str(parca)[:120]}")
        if not parca:
            break
        top += parca
        if len(parca) < boy:
            break
        bas += boy
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
