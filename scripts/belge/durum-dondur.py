#!/usr/bin/env python3
"""
DURUM DOSYASI GÜNLÜK DÖNDÜRME (docs/standards/hafiza-yazma-duzeni-standard.md §9b; ilk uygulama OPS durum dosyası, 2026-10-04).

Canlı dosyada başlık/not + DEVİR bloğu + `--tutulan-ilk-gun` ve sonrası kalır; daha eski gün blokları AYNEN `--gecmis-dizin` altına taşınır.
VARSAYILAN = KURU KOŞU (hiçbir şey yazmaz, satır/bayt raporu verir). Gerçek yazma yalnız `--yaz` ile.

Kullanım:
  python scripts/belge/durum-dondur.py --dosya <durum.md> --gecmis-dizin <gunluk/ROL/gecmis> [--tutulan-ilk-gun YYYY-AA-GG] [--oncesi-tek] [--yaz]

Kurallar (hepsi kodda sınanır):
  · Blok = `## ` ile başlayan satırdan sonraki `## `'a kadar. Tarih başlıktan okunur: `2026-10-03` ya da `(10-03 ~12:00)`; başlıkta tarih yoksa ÖNCEKİ bloğun tarihi
    geçerlidir (EK blokları). DEVİR bloğu (başlıkta DEVİR) tarihe bakılmaz, hep canlıda kalır. İlk gün bloğunda tarih yoksa durur (tahmin yok).
  · KAYIPSIZ: eski + canlı (eklenen işaret satırı hariç) = özgün dosya, bayt bayt; satır sonu (CRLF/LF) korunur; aksi hâlde durur.
  · Kapının dört alanı (precompact-durum-kapisi.cjs DORT_ALAN) canlıda, döndürmeden ÖNCE var olan her alan için SONRA da bulunmalı; bulunmazsa `--yaz` REDDEDİLİR
    (çıkış 3): önce DEVİR bloğu yazılmalı. Bilerek geçmek için `--devir-eksik-olsun`.
  · Yazma güvenliği: okumadan sonra dosyanın boyutu/mtime'ı değiştiyse durur (başka pencere yazıyor olabilir); geçmiş dosyası ASLA ezilmez (varsa durur);
    canlı dosya geçici dosya + `os.replace` ile atomik yazılır.
  · Geçmiş dosyalarının başlığında `sid:` ve dört alan bulunmaz (kapı onları canlı dosya sanmasın, §9b madde 4).
Çıkış: 0 tamam (ya da yapılacak iş yok) · 1 kullanım/yazma güvenliği · 2 yapı hatası · 3 dört alan eksilir (--yaz reddedildi).
"""
import argparse, datetime, os, re, sys, tempfile, unicodedata

DORT_ALAN = [
    ("son girdi", re.compile(r"son\s+girdi|bana ulasan son")),
    ("acik kuyruk", re.compile(r"acik\s+kuyruk|sonraki\s+is|kuyruk")),
    ("verilen sozler", re.compile(r"verilen\s+soz|taahhut")),
    ("bekleyen kararlar", re.compile(r"bekleyen\s+karar|recep(te|'te)\s+bekleyen")),
]
H2 = re.compile(rb"^## ")
EOL_AD = {b"\r\n": "CRLF", b"\n": "LF"}
TAM_TARIH = re.compile(r"(20\d\d)-(\d\d)-(\d\d)")
KISA_TARIH = re.compile(r"(?<![\d-])(\d\d)-(\d\d)(?![\d-])")


def katla(s):
    """Kapının asciiKatla'sı: NFD, birleşik işaretleri at, ı/İ → i, küçült."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not 0x300 <= ord(c) <= 0x36F)
    return s.replace("ı", "i").replace("İ", "i").lower()


def alanlar(metin):
    k = katla(metin)
    return {ad for ad, d in DORT_ALAN if d.search(k)}


def bloklar(satirlar, yil):
    """[(baslangic_idx, bitis_idx, baslik, tur, tarih)] ; ilk H2'den önceki kısım 'ust'tur."""
    ilk = next((i for i, s in enumerate(satirlar) if H2.match(s)), None)
    if ilk is None:
        raise ValueError("dosyada '## ' gün bloğu başlığı yok")
    basl = [i for i, s in enumerate(satirlar) if H2.match(s)]
    cikti, onceki = [], None
    for n, b in enumerate(basl):
        bit = basl[n + 1] if n + 1 < len(basl) else len(satirlar)
        baslik = satirlar[b].decode("utf-8").strip()
        if "devir" in katla(baslik):
            cikti.append((b, bit, baslik, "devir", None))
            continue
        m = TAM_TARIH.search(baslik)
        if m:
            t = datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        else:
            k = KISA_TARIH.search(baslik)
            if k:
                t = datetime.date(yil, int(k.group(1)), int(k.group(2)))
            elif onceki is not None:
                t = onceki
            else:
                raise ValueError(f"ilk gün bloğunda tarih yok (tahmin edilmez): {baslik[:80]}")
        onceki = t
        cikti.append((b, bit, baslik, "gun", t))
    return ilk, cikti


def planla(veri, tutulan, oncesi_tek):
    satirlar = veri.splitlines(keepends=True)
    ust_bit, bl = bloklar(satirlar, tutulan.year)
    eski_idx, canli_idx = [], list(range(0, ust_bit))
    eski_gun = {}
    for b, bit, baslik, tur, t in bl:
        aralik = list(range(b, bit))
        if tur == "gun" and t < tutulan:
            eski_idx += aralik
            eski_gun.setdefault(t, []).extend(aralik)
        else:
            canli_idx += aralik
    return satirlar, ust_bit, bl, eski_idx, canli_idx, eski_gun


def bayt(satirlar, idx):
    return sum(len(satirlar[i]) for i in idx)


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--dosya", required=True)
    ap.add_argument("--gecmis-dizin", required=True)
    ap.add_argument("--tutulan-ilk-gun", default=(datetime.date.today() - datetime.timedelta(days=1)).isoformat())
    ap.add_argument("--oncesi-tek", action="store_true", help="eski blokları gün başına değil tek `oncesi-<gün>.md` dosyasına yaz (ilk döndürme)")
    ap.add_argument("--yaz", action="store_true")
    ap.add_argument("--devir-eksik-olsun", action="store_true")
    a = ap.parse_args()
    return uygula(a)


def uygula(a, once_yaz=None):
    """`once_yaz`: test dikişi; son boyut/mtime kontrolünden hemen önce çağrılır."""
    try:
        tutulan = datetime.date.fromisoformat(a.tutulan_ilk_gun)
    except ValueError:
        print(f"HATA: --tutulan-ilk-gun YYYY-AA-GG olmalı: {a.tutulan_ilk_gun}", file=sys.stderr)
        return 1
    if not os.path.isfile(a.dosya):
        print(f"HATA: dosya yok: {a.dosya}", file=sys.stderr)
        return 1
    st0 = os.stat(a.dosya)
    veri = open(a.dosya, "rb").read()
    try:
        veri.decode("utf-8")
        satirlar, ust_bit, bl, eski_idx, canli_idx, eski_gun = planla(veri, tutulan, a.oncesi_tek)
    except (ValueError, UnicodeDecodeError) as e:
        print(f"HATA (yapı): {e}", file=sys.stderr)
        return 2
    eol = b"\r\n" if b"\r\n" in veri else b"\n"
    if not eski_idx:
        print(f"Yapılacak iş yok: {tutulan.isoformat()} öncesine ait blok kalmadı ({len(satirlar)} satır, {len(veri)} bayt).")
        return 0
    # kayıpsızlık: her satır tam bir yerde
    if sorted(eski_idx + canli_idx) != list(range(len(satirlar))) or bayt(satirlar, eski_idx) + bayt(satirlar, canli_idx) != len(veri):
        print("HATA (yapı): bölme kayıpsız değil, durdu.", file=sys.stderr)
        return 2
    # hedef dosyalar
    gd = a.gecmis_dizin
    hedefler = {}
    if a.oncesi_tek:
        hedefler[f"oncesi-{tutulan.isoformat()}.md"] = eski_idx
    else:
        for t, idx in sorted(eski_gun.items()):
            hedefler[f"{t.isoformat()}.md"] = idx
    yeni_canli_baslik = f"> Eski günler (§9b döndürme {datetime.date.today().isoformat()}): {os.path.relpath(gd, os.path.dirname(os.path.abspath(a.dosya))).replace(os.sep, '/')}/ altında ({', '.join(hedefler)}).".encode("utf-8") + eol + eol
    canli = b"".join(satirlar[i] for i in canli_idx[:ust_bit]) + yeni_canli_baslik + b"".join(satirlar[i] for i in canli_idx[ust_bit:])
    onceki_alan = alanlar(veri.decode("utf-8"))
    sonraki_alan = alanlar(canli.decode("utf-8"))
    kaybolan = sorted(onceki_alan - sonraki_alan)
    # rapor
    print(f"DOSYA: {a.dosya}")
    print(f"ÖNCE : {len(satirlar)} satır, {len(veri)} bayt | tutulan ilk gün: {tutulan.isoformat()} | satır sonu: {EOL_AD[eol]}")
    print("BLOKLAR (başlangıç satırı · tarih · satır · bayt · hedef · başlık):")
    for b, bit, baslik, tur, t in bl:
        hedef = "CANLI (DEVİR)" if tur == "devir" else ("GEÇMİŞ" if t < tutulan else "CANLI")
        print(f"  {b + 1:>4} · {t.isoformat() if t else '-':>10} · {bit - b:>4} · {bayt(satirlar, range(b, bit)):>7} · {hedef:<13} · {baslik[:70]}")
    print(f"CANLI: {len(canli.splitlines())} satır, {len(canli)} bayt (başlık/not {ust_bit} satır + işaret satırı + kalan bloklar)")
    for ad, idx in hedefler.items():
        print(f"GEÇMİŞ: {os.path.join(gd, ad)} ← {len(idx)} satır, {bayt(satirlar, idx)} bayt")
    print(f"AZALMA: {len(veri)} → {len(canli)} bayt ({100 - round(100 * len(canli) / len(veri))}% küçülür)")
    print(f"KAPI DÖRT ALAN: önce {sorted(onceki_alan)} | sonra {sorted(sonraki_alan)}" + (f" | EKSİLEN: {kaybolan}" if kaybolan else " | eksilen yok"))
    if not a.yaz:
        print("KURU KOŞU: hiçbir şey yazılmadı. Yazmak için aynı komuta --yaz ekle (OPS onayından sonra).")
        return 3 if kaybolan else 0
    if kaybolan and not a.devir_eksik_olsun:
        print(f"REDDEDİLDİ: canlı dosyada kapının {kaybolan} alanı kalmıyor. Önce DEVİR bloğunu yaz ya da --devir-eksik-olsun ile bilerek geç.", file=sys.stderr)
        return 3
    for ad in hedefler:
        if os.path.exists(os.path.join(gd, ad)):
            print(f"HATA: geçmiş dosyası zaten var, ezilmez: {os.path.join(gd, ad)}", file=sys.stderr)
            return 1
    if once_yaz:
        once_yaz()
    st1 = os.stat(a.dosya)
    if (st1.st_size, st1.st_mtime_ns) != (st0.st_size, st0.st_mtime_ns):
        print("DURDU: dosya okumadan sonra değişti (başka pencere yazıyor olabilir); yeniden dene. Hiçbir şey yazılmadı.", file=sys.stderr)
        return 1
    os.makedirs(gd, exist_ok=True)
    yazilan = []
    try:
        for ad, idx in hedefler.items():
            baslik = f"# Geçmiş günler — {os.path.basename(a.dosya)} (döndürme {datetime.date.today().isoformat()})".encode("utf-8") + eol + eol
            with open(os.path.join(gd, ad), "xb") as f:
                f.write(baslik + b"".join(satirlar[i] for i in idx))
            yazilan.append(os.path.join(gd, ad))
        fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(a.dosya)), prefix=".dondur-", suffix=".tmp")
        with os.fdopen(fd, "wb") as f:
            f.write(canli)
        os.replace(tmp, a.dosya)
    except Exception as e:
        print(f"HATA (yazma): {e}. Geçmiş dosyaları yazıldıysa canlı dosya DEĞİŞMEDİ (kayıp yok): {yazilan}", file=sys.stderr)
        return 1
    if open(a.dosya, "rb").read() != canli:
        print("HATA: yazma sonrası doğrulama tutmadı.", file=sys.stderr)
        return 1
    print(f"YAZILDI: canlı {len(canli)} bayt; geçmiş {len(yazilan)} dosya. Kayıpsızlık doğrulandı (eski + canlı = özgün, işaret satırı hariç).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
