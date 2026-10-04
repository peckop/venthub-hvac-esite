#!/usr/bin/env python3
"""
DURUM DOSYASI GÜNLÜK DÖNDÜRME (docs/standards/hafiza-yazma-duzeni-standard.md §9b; ilk uygulama OPS durum dosyası, 2026-10-04).

Canlı dosyada başlık/not + DEVİR bloğu (dosyanın SONUNDA) + `--tutulan-ilk-gun` ve sonrası kalır; daha eski gün blokları AYNEN `--gecmis-dizin` altına taşınır.
VARSAYILAN = KURU KOŞU (hiçbir şey yazmaz, satır/bayt raporu verir). Gerçek yazma yalnız `--yaz` ile.

Kullanım:
  python scripts/belge/durum-dondur.py --dosya <durum.md> --gecmis-dizin <gunluk/ROL/gecmis> [--tutulan-ilk-gun YYYY-AA-GG] [--oncesi-tek] [--yaz]

Kurallar (hepsi kodda sınanır):
  · Blok = `## ` ile başlayan satırdan sonraki `## `'a kadar. DEVİR bloğu: başlığın BAŞI `DEVİR` kelimesidir (`## DEVİR (…)`); başlığın başka yerinde geçen "devir" DEVİR sayılmaz.
  · DEVİR ŞARTI (§9b madde 1): DEVİR bloğu yoksa ya da kapının dört alanı (SON GİRDİ, AÇIK KUYRUK, VERİLEN SÖZLER, BEKLEYEN KARARLAR) DEVİR bloğunun İÇİNDE bulunmuyorsa
    `--yaz` REDDEDİLİR (çıkış 3); kuru koşu aynı eksiği raporlar. Alan, dosyanın başka yerinde geçse de sayılmaz.
  · Tarih (tahmin yok): başlığın BAŞINDAKİ tam tarih (`2026-10-03 …`) ya da `(` hemen sonrasındaki tarih (`(10-03 ~12:00)`, `(2026-10-03 …)`); başlığın ortasında geçen tarih sayılmaz.
    Kısa tarihin yılı önceki bloğun yılından türetilir (yıl sınırında bir sonraki yıla geçer). Tarihsiz başlık DEVİR'den ÖNCE ise önceki bloğun tarihini devralır (EK blokları);
    DEVİR'den SONRA ise ya da ilk blokta ise durur (çıkış 2).
  · KAYIPSIZ: yazdıktan sonra geçmiş dosyaları ve canlı dosya DİSKTEN geri okunur; geçmiş gövdesi + canlı (işaret satırı hariç) özgün dosyayla bayt bayt karşılaştırılır; tutmazsa
    özgün geri yazılır ve geçmiş dosyaları silinir (çıkış 1). "Doğrulandı" yalnız bu karşılaştırma geçince söylenir.
  · Yazma güvenliği: okumadan sonra dosya değişirse durur; `os.replace`'ten hemen önce içerik BAYT BAYT yeniden okunup karşılaştırılır; yazma hata verirse (Windows'ta
    PermissionError dahil) yazılmış geçmiş dosyaları ve .tmp temizlenir, böylece sonraki koşu "ezilmez" ile takılmaz. Geçmiş dosyası ASLA ezilmez. Canlı dosya atomik yazılır.
    KALAN SINIR: son karşılaştırma ile `os.replace` arasındaki milisaniyelik pencerede başka pencerenin eklediği satır ezilir; bu yüzden döndürme, başka pencere o dosyaya yazmıyorken çalıştırılır.
  · Satır sonu: dosyadaki BASKIN satır sonu (CRLF ya da LF) işaret ve başlık satırlarında kullanılır; mevcut satırlar bayt bayt korunur.
  · Geçmiş dosyalarının başlığında `sid:` ve dört alan bulunmaz (kapı onları canlı dosya sanmasın, §9b madde 4).
Çıkış: 0 tamam (ya da yapılacak iş yok) · 1 kullanım/yazma güvenliği/doğrulama · 2 yapı hatası · 3 DEVİR şartı sağlanmıyor (--yaz reddedildi).
"""
import argparse, datetime, os, re, sys, tempfile, unicodedata

H2 = re.compile(rb"^## ")
EOL_AD = {b"\r\n": "CRLF", b"\n": "LF"}
DEVIR_BASLIK = re.compile(r"^devir\b")
# DEVİR bloğu İÇİNDE aranan dört alan (kapının DORT_ALAN'ının gevşek `kuyruk`/`taahhut` kolları BİLEREK yok: bir günün metnindeki kelime sayılmasın)
DEVIR_ALAN = [
    ("son girdi", re.compile(r"son\s+girdi")),
    ("acik kuyruk", re.compile(r"acik\s+kuyruk")),
    ("verilen sozler", re.compile(r"verilen\s+soz")),
    ("bekleyen kararlar", re.compile(r"bekleyen\s+karar")),
]
BASTA_TAM = re.compile(r"^(\d{4})-(\d\d)-(\d\d)(?!\d)")
PAREN_TARIH = re.compile(r"\(\s*(?:(\d{4})-)?(\d\d)-(\d\d)(?!\d)")
YARIM_YIL = datetime.timedelta(days=183)


class Degisti(Exception):
    pass


def katla(s):
    """Kapının asciiKatla'sı: NFD, birleşik işaretleri at, ı/İ → i, küçült."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if not 0x300 <= ord(c) <= 0x36F)
    return s.replace("ı", "i").replace("İ", "i").lower()


def devir_eksik(metin):
    k = katla(metin)
    return [ad for ad, d in DEVIR_ALAN if not d.search(k)]


def baslik_tarihi(govde, onceki, tutulan):
    """Başlık gövdesinden (## sonrası) tarih; yoksa None. Geçersiz tarih ValueError."""
    m = BASTA_TAM.match(govde)
    if m:
        return datetime.date(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    p = PAREN_TARIH.search(govde)
    if not p:
        return None
    ay, gun = int(p.group(2)), int(p.group(3))
    if p.group(1):
        return datetime.date(int(p.group(1)), ay, gun)
    yil = onceki.year if onceki else tutulan.year
    aday = datetime.date(yil, ay, gun)
    if onceki and aday < onceki - YARIM_YIL:
        aday = datetime.date(yil + 1, ay, gun)
    elif not onceki and aday > tutulan + YARIM_YIL:
        aday = datetime.date(yil - 1, ay, gun)
    return aday


def bloklar(satirlar, tutulan):
    """(ust_bitis, [(baslangic, bitis, baslik, tur, tarih)]) ; ilk H2'den önceki kısım 'ust'tur."""
    basl = [i for i, s in enumerate(satirlar) if H2.match(s)]
    if not basl:
        raise ValueError("dosyada '## ' gün bloğu başlığı yok")
    cikti, onceki, devir_goruldu = [], None, False
    for n, b in enumerate(basl):
        bit = basl[n + 1] if n + 1 < len(basl) else len(satirlar)
        baslik = satirlar[b].decode("utf-8").strip()
        govde = baslik[3:].strip()
        if DEVIR_BASLIK.match(katla(govde)):
            cikti.append((b, bit, baslik, "devir", None))
            devir_goruldu = True
            continue
        try:
            t = baslik_tarihi(govde, onceki, tutulan)
        except ValueError as e:
            raise ValueError(f"başlıkta geçersiz tarih ({e}): {baslik[:80]}")
        if t is None:
            if devir_goruldu:
                raise ValueError(f"DEVİR bloğundan sonra tarihsiz başlık (tahmin edilmez): {baslik[:80]}")
            if onceki is None:
                raise ValueError(f"ilk gün bloğunda tarih yok (tahmin edilmez): {baslik[:80]}")
            t = onceki
        onceki = t
        cikti.append((b, bit, baslik, "gun", t))
    return basl[0], cikti


def bayt(satirlar, idx):
    return sum(len(satirlar[i]) for i in idx)


def baskin_eol(veri):
    crlf = veri.count(b"\r\n")
    lf = veri.count(b"\n") - crlf
    return b"\r\n" if crlf > lf else b"\n"


def diskten_dogrula(dosya, gd, hedefler, canli_idx, ust_bit, satirlar, veri, isaret):
    """Yazılan dosyaları DİSKTEN geri okuyup özgünü bayt bayt yeniden kurar. Hata nedenini ya da None döndürür."""
    canli = open(dosya, "rb").read().splitlines(keepends=True)
    if canli[ust_bit : ust_bit + 2] != isaret.splitlines(keepends=True):
        return "canlı dosyada işaret satırı beklenen yerde/biçimde değil"
    govde = canli[:ust_bit] + canli[ust_bit + 2 :]
    if len(govde) != len(canli_idx):
        return f"canlı satır sayısı tutmuyor ({len(govde)} ≠ {len(canli_idx)})"
    rec = [None] * len(satirlar)
    for k, i in enumerate(canli_idx):
        rec[i] = govde[k]
    for ad, idx in hedefler.items():
        g = open(os.path.join(gd, ad), "rb").read().splitlines(keepends=True)[2:]
        if len(g) != len(idx):
            return f"geçmiş dosyası satır sayısı tutmuyor: {ad} ({len(g)} ≠ {len(idx)})"
        for k, i in enumerate(idx):
            rec[i] = g[k]
    if any(r is None for r in rec):
        return "bazı özgün satırlar ne canlıda ne geçmişte"
    if b"".join(rec) != veri:
        return "geçmiş + canlı özgünle bayt bayt eşit değil"
    return None


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
    return uygula(ap.parse_args())


def uygula(a, once_yaz=None, replace_oncesi=None):
    """Test dikişleri: `once_yaz` ilk boyut/mtime kontrolünden önce, `replace_oncesi` os.replace'ten hemen önce çağrılır."""
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
        satirlar = veri.splitlines(keepends=True)
        ust_bit, bl = bloklar(satirlar, tutulan)
    except (ValueError, UnicodeDecodeError) as e:
        print(f"HATA (yapı): {e}", file=sys.stderr)
        return 2
    eski_idx, canli_idx, eski_gun, devir_idx = [], list(range(0, ust_bit)), {}, []
    for b, bit, baslik, tur, t in bl:
        aralik = list(range(b, bit))
        if tur == "gun" and t < tutulan:
            eski_idx += aralik
            eski_gun.setdefault(t, []).extend(aralik)
        else:
            canli_idx += aralik
            if tur == "devir":
                devir_idx += aralik
    eol = baskin_eol(veri)
    if not eski_idx:
        print(f"Yapılacak iş yok: {tutulan.isoformat()} öncesine ait blok kalmadı ({len(satirlar)} satır, {len(veri)} bayt).")
        return 0
    if sorted(eski_idx + canli_idx) != list(range(len(satirlar))) or bayt(satirlar, eski_idx) + bayt(satirlar, canli_idx) != len(veri):
        print("HATA (yapı): bölme kayıpsız değil, durdu.", file=sys.stderr)
        return 2
    gd = a.gecmis_dizin
    hedefler = {}
    if a.oncesi_tek:
        hedefler[f"oncesi-{tutulan.isoformat()}.md"] = eski_idx
    else:
        for t, idx in sorted(eski_gun.items()):
            hedefler[f"{t.isoformat()}.md"] = idx
    rel = os.path.relpath(gd, os.path.dirname(os.path.abspath(a.dosya))).replace(os.sep, "/")
    isaret = f"> Eski günler (§9b döndürme {datetime.date.today().isoformat()}): {rel}/ altında ({', '.join(hedefler)}).".encode("utf-8") + eol + eol
    canli = b"".join(satirlar[i] for i in canli_idx[:ust_bit]) + isaret + b"".join(satirlar[i] for i in canli_idx[ust_bit:])
    devir_var = bool(devir_idx)
    eksik = devir_eksik(b"".join(satirlar[i] for i in devir_idx).decode("utf-8")) if devir_var else [ad for ad, _ in DEVIR_ALAN]
    print(f"DOSYA: {a.dosya}")
    print(f"ÖNCE : {len(satirlar)} satır, {len(veri)} bayt | tutulan ilk gün: {tutulan.isoformat()} | baskın satır sonu: {EOL_AD[eol]}")
    print("BLOKLAR (başlangıç satırı · tarih · satır · bayt · hedef · başlık):")
    for b, bit, baslik, tur, t in bl:
        hedef = "CANLI (DEVİR)" if tur == "devir" else ("GEÇMİŞ" if t < tutulan else "CANLI")
        print(f"  {b + 1:>4} · {t.isoformat() if t else '-':>10} · {bit - b:>4} · {bayt(satirlar, range(b, bit)):>7} · {hedef:<13} · {baslik[:70]}")
    print(f"CANLI: {len(canli.splitlines())} satır, {len(canli)} bayt (başlık/not {ust_bit} satır + işaret satırı + kalan bloklar)")
    for ad, idx in hedefler.items():
        print(f"GEÇMİŞ: {os.path.join(gd, ad)} ← {len(idx)} satır, {bayt(satirlar, idx)} bayt")
    print(f"AZALMA: {len(veri)} → {len(canli)} bayt ({100 - round(100 * len(canli) / len(veri))}% küçülür)")
    if not devir_var:
        print("DEVİR ŞARTI: SAĞLANMIYOR, DEVİR bloğu yok (başlığın başı `DEVİR` olan '## ' bloğu gerekir).")
    elif eksik:
        print(f"DEVİR ŞARTI: SAĞLANMIYOR, DEVİR bloğunda dört alandan eksik olan: {eksik}")
    else:
        print("DEVİR ŞARTI: sağlanıyor (dört alan DEVİR bloğunun içinde).")
    sart_yok = (not devir_var) or bool(eksik)
    if not a.yaz:
        print("KURU KOŞU: hiçbir şey yazılmadı. Yazmak için aynı komuta --yaz ekle (OPS onayından sonra).")
        return 3 if sart_yok else 0
    if sart_yok:
        print("REDDEDİLDİ: DEVİR şartı sağlanmıyor (§9b madde 1); önce DEVİR bloğunu yaz.", file=sys.stderr)
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
    gd_vardi = os.path.isdir(gd)
    os.makedirs(gd, exist_ok=True)
    yazilan, tmp = [], None

    def temizle():
        for f in yazilan:
            try:
                os.remove(f)
            except OSError:
                pass
        if tmp and os.path.exists(tmp):
            try:
                os.remove(tmp)
            except OSError:
                pass
        if not gd_vardi:
            try:
                os.rmdir(gd)
            except OSError:
                pass

    try:
        fd, tmp = tempfile.mkstemp(dir=os.path.dirname(os.path.abspath(a.dosya)), prefix=".dondur-", suffix=".tmp")
        with os.fdopen(fd, "wb") as f:
            f.write(canli)
        for ad, idx in hedefler.items():
            baslik = f"# Geçmiş günler — {os.path.basename(a.dosya)} (döndürme {datetime.date.today().isoformat()})".encode("utf-8") + eol + eol
            with open(os.path.join(gd, ad), "xb") as f:
                yazilan.append(os.path.join(gd, ad))
                f.write(baslik + b"".join(satirlar[i] for i in idx))
        if replace_oncesi:
            replace_oncesi()
        if open(a.dosya, "rb").read() != veri:
            raise Degisti()
        os.replace(tmp, a.dosya)
    except Degisti:
        temizle()
        print("DURDU: dosya yazmadan hemen önce değişti (başka pencere yazıyor); geçmiş dosyaları ve geçici dosya silindi, canlı dosyaya dokunulmadı. Yeniden dene.", file=sys.stderr)
        return 1
    except Exception as e:
        temizle()
        print(f"HATA (yazma): {e}. Geçmiş dosyaları ve geçici dosya temizlendi; canlı dosya DEĞİŞMEDİ.", file=sys.stderr)
        return 1
    hata = diskten_dogrula(a.dosya, gd, hedefler, canli_idx, ust_bit, satirlar, veri, isaret)
    if hata:
        geri = a.dosya + ".dondur-geri.tmp"
        try:
            open(geri, "wb").write(veri)
            os.replace(geri, a.dosya)
            temizle()
            print(f"HATA: diskten doğrulama tutmadı ({hata}); ÖZGÜN DOSYA GERİ YAZILDI, geçmiş dosyaları silindi.", file=sys.stderr)
        except Exception as e:
            print(f"HATA: diskten doğrulama tutmadı ({hata}) VE geri yazma başarısız ({e}); özgün dosya bellekte, geçmiş dosyaları diskte duruyor, ELLE İNCELE.", file=sys.stderr)
        return 1
    print(f"YAZILDI: canlı {len(canli)} bayt; geçmiş {len(yazilan)} dosya. Diskten geri okundu: geçmiş + canlı (işaret satırı hariç) özgünle bayt bayt eşit.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
