#!/usr/bin/env python3
"""
KANBAN DIŞA AKTARIM — WrongStack Kanban panolarını santiye.py'nin okuduğu "kayitlar" şemasına çevirir
(karar 219: iş takibinin tek kaynağı Kanban; Linear donuk. Eski kaynak: linear_disa_aktar.py).

Kaynak: ana deponun `.wrongstack/kanbans/_kanban.sqlite` dosyası, `mode=ro` ile açılır: VERİ dosyasını (db ve -wal içeriği)
değiştirmez (bağımsız okuyucu ölçümü); WAL kipinde okuyucu olarak -shm dizinini günceller, -shm yoksa oluşturabilir.
MCP yolu kullanılmaz (her çağrı panonun tamamını döndürür). Dosya git DIŞIDIR (depo PUBLIC): bu betik yalnız
çıktıyı (kart başlığı, sütun, tarih) JSON'a yazar, yol ve içerik başka yere sızmaz.

Eşleme (2026-10-01 ölçüldü: 12 pano, kartın alanları id/title/columnId/status/priority/assignee/createdAt/updatedAt/
completedAt/labels/notes):
  · şerit  = pano başlığı "VentHub <AD>" → <AD> (Türkçe karakterler ASCII'ye: ARAÇ → ARAC); "Linear Bekleyenler …" panosu
             → HAVUZ (ortak bekleme havuzu, sahipsiz sayılmaz); "DENEME…" panolar dışarıda.
  · durum  = columnId: backlog→Backlog, todo→Todo, in-progress→In Progress, review→In Review, done→Done.
  · numara = başlığın başındaki `<2-4 BÜYÜK HARF>-<sayı>` (HRT-6, REC-538); yoksa kısa kart kimliği.
  · sonAnlamli = en geç not / tamamlanma / açılış tarihi (updatedAt bilerek KULLANILMAZ: toplu bakım yaşı tazelemesin).
  · Recep kapısı = "Recep kapısı" etiketi.

--tam (HRT-28, ARC-30 isteği): kayıtlara kartın `description` metni ve `notes` listesi (author, content, createdAt) da
eklenir; "ÖNCEKİ ÇALIŞMA" gibi kart İÇİ bilgiler aranabilsin diye. Bayrak yoksa çıktı bayt bayt aynıdır. İçerik taşıyan çıktı
depoya sızmasın diye: --tam ile --hedef depo içinde git'in yok saymadığı (izlenebilir) bir yolsa betik YAZMAZ, çıkış 2.
Hedefsiz (stdout) kullanım ve depo dışı hedef serbesttir.

Kullanım:
  python scripts/nlm/kanban_disa_aktar.py [--db <sqlite>] [--hedef <json>] [--tam]   → hedef yoksa stdout
Çıkış kodu: 0 başarı · 2 pano dosyası yok/okunamadı ya da --tam hedefi izlenebilir (sessizlik "sıfır kayıt" ile karışmasın).
"""
import argparse, datetime, json, os, re, sqlite3, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SUTUN = {"backlog": "Backlog", "todo": "Todo", "in-progress": "In Progress", "review": "In Review", "done": "Done"}
ONCELIK = {"critical": 4, "high": 3, "medium": 2, "low": 1}
NUMARA = re.compile(r"\b([A-Z]{2,5}-\d+)\b")   # başlığın ilk 60 karakterinde ("URUN REC-411: …", "ADMIN VULN-006 (…)" de numaralı sayılır)
ASCII = str.maketrans("ÇĞİÖŞÜçğıöşü", "CGIOSUcgiosu")


def serit_adi(baslik):
    """Pano başlığından şerit adı; dışarıda kalacak pano için None."""
    b = (baslik or "").strip()
    if b.upper().startswith("DENEME"):
        return None
    if b.lower().startswith("linear bekleyenler"):
        return "HAVUZ"
    m = re.match(r"^VentHub\s+(.+)$", b)
    if not m:
        return None
    return m.group(1).strip().translate(ASCII).upper()


def pano_dosyasi(db=None):
    """--db > VENTHUB_KANBAN_DB > ana deponun .wrongstack/kanbans/_kanban.sqlite (worktree'den de ana depo)."""
    if db:
        return db
    if os.environ.get("VENTHUB_KANBAN_DB"):
        return os.environ["VENTHUB_KANBAN_DB"]
    try:
        ortak = subprocess.run(["git", "-C", REPO, "rev-parse", "--path-format=absolute", "--git-common-dir"],
                               capture_output=True, text=True, check=True, timeout=10).stdout.strip()
        kok = os.path.dirname(ortak)
    except Exception:
        kok = REPO
    return os.path.join(kok, ".wrongstack", "kanbans", "_kanban.sqlite")


def son_anlamli(kart):
    adaylar = [kart.get("createdAt"), kart.get("completedAt")]
    adaylar += [n.get("createdAt") for n in (kart.get("notes") or []) if isinstance(n, dict)]
    adaylar = [a for a in adaylar if a]
    return max(adaylar) if adaylar else None


def tam_alanlar(kart):
    """--tam: kart içi metin. Alan yoksa boş ('' / []), şema kayması sessizce None üretmesin."""
    notlar = [
        {"author": n.get("author"), "content": n.get("content") or "", "createdAt": n.get("createdAt")}
        for n in (kart.get("notes") or []) if isinstance(n, dict)
    ]
    return {"description": kart.get("description") or "", "notes": notlar}


def hedef_izlenebilir(hedef):
    """True = hedef depo içinde ve git onu yok saymıyor (içerik PUBLIC depoya girebilir). Ölçülemezse True (kapalı güvenli)."""
    yol = os.path.realpath(hedef)
    kok = os.path.realpath(REPO)
    try:
        if os.path.commonpath([os.path.normcase(yol), os.path.normcase(kok)]) != os.path.normcase(kok):
            return False   # depo dışı
    except ValueError:   # farklı sürücü
        return False
    try:
        r = subprocess.run(["git", "-C", REPO, "check-ignore", "-q", yol], capture_output=True, timeout=10)
    except Exception:
        return True
    return r.returncode != 0   # 0 = yok sayılıyor; 1 = izlenebilir; 128 = hata (kapalı güvenli: izlenebilir say)


def kayitlar(yol, tam=False):
    """[(kayit, ...)] — her kart bir kayıt. Okunamazsa istisna (çağıran 2 ile çıkar)."""
    db = sqlite3.connect(f"file:{yol}?mode=ro", uri=True, timeout=5)
    try:
        satirlar = db.execute("select payload from kanban_boards").fetchall()
    finally:
        db.close()
    cikti = []
    for (yuk,) in satirlar:
        pano = json.loads(yuk)
        serit = serit_adi(pano.get("title"))
        if serit is None:
            continue
        for k in pano.get("tasks") or []:
            baslik = k.get("title") or ""
            m = NUMARA.search(baslik[:60])
            etiketler = list(k.get("labels") or [])
            kayit = {
                "identifier": m.group(1) if m else (k.get("id") or "?")[:8],
                "title": baslik,
                "status": SUTUN.get(k.get("columnId"), "?"),
                "serit": serit,
                "labels": etiketler,
                "project": pano.get("title"),
                "priority": ONCELIK.get(k.get("priority"), 0),
                "assignee": k.get("assignee"),
                "blockedBy": [],
                "createdAt": k.get("createdAt"),
                "sonAnlamli": son_anlamli(k),
            }
            if tam:
                kayit.update(tam_alanlar(k))
            cikti.append(kayit)
    return cikti


def disa_aktar(yol, tam=False):
    return {
        "kaynak": "Kanban",
        "damga": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "kayitlar": kayitlar(yol, tam),
    }


def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8")   # Windows cp1254 konsolu "→" ve Türkçe harflerde patlıyor (ölçüldü)
    except Exception:
        pass
    ap = argparse.ArgumentParser()
    ap.add_argument("--db")
    ap.add_argument("--hedef")
    ap.add_argument("--tam", action="store_true", help="description ve notes alanları da çıksın (varsayılan: çıkmaz)")
    a = ap.parse_args()
    if a.tam and a.hedef and hedef_izlenebilir(a.hedef):
        print(f"HATA: --tam çıktısı depoda izlenebilir bir yola yazılamaz (repo PUBLIC, kart içeriği sızar): {a.hedef}. "
              "Depo dışı bir yol ya da .gitignore'daki bir dizin (ör. tmp/) verin.", file=sys.stderr)
        sys.exit(2)
    yol = pano_dosyasi(a.db)
    if not os.path.exists(yol):
        print(f"HATA: pano dosyası yok: {yol}", file=sys.stderr)
        sys.exit(2)
    try:
        d = disa_aktar(yol, a.tam)
    except Exception as e:  # ölçülemedi ≠ sıfır kayıt
        print(f"HATA: pano okunamadı: {e}", file=sys.stderr)
        sys.exit(2)
    metin = json.dumps(d, ensure_ascii=False, indent=2) + "\n"
    if a.hedef:
        os.makedirs(os.path.dirname(os.path.abspath(a.hedef)), exist_ok=True)
        open(a.hedef, "w", encoding="utf-8", newline="\n").write(metin)
        print(f"→ {a.hedef} ({len(d['kayitlar'])} kayıt)")
    else:
        print(metin)


if __name__ == "__main__":
    main()
