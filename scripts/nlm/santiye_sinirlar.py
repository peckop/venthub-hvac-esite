"""
SANTIYE SINIRLARI — iş dağılımı tablosunun renk eşikleri, TEK dosyada (OPS kararı, 2026-10-01).

Gerekçe (Kanban kipi): pano WIP sınırı 5 (WrongStack Kanban). Şerit başına "yapılıyor" sayısı bir departmanın aynı
anda taşıdığı iş sayısıdır; çalışan (alt ajan) sayısı sınırsız olduğu için eski Linear sınırı (≤1) anlamsız kalır.
  · yapılıyor ≤ 3  → YEŞİL · 4-5 → SARI · > 5 → KIRMIZI (pano WIP sınırı 5'in aşılması)
  · sırada (To Do): sınır YOK — Linear'dan taşıma sonrası To Do = bekleyen havuzu, anlamı değişti.
OPS panosu da aynı kurala tabidir (muafiyet yok). HAVUZ şeridi ("Linear Bekleyenler") limit dışıdır.

Eski Linear kipi (--json/--tarih; yalnız tarihçe) 2026-09-07 sınırlarını korur: yapılıyor ≤1 (aşım KIRMIZI), sırada ≤3 (aşım SARI).
Sınır değişirse yalnız bu dosya değişir; santiye.py ve test buradan okur.
"""

KANBAN = {"yesil_en_fazla": 3, "sari_en_fazla": 5, "sirada_siniri": None}
LINEAR = {"yesil_en_fazla": 1, "sari_en_fazla": 1, "sirada_siniri": 3}


def uyum(sinirlar, yapiliyor, sirada):
    """('YESIL'|'SARI'|'KIRMIZI', açıklama). Linear kipinde yapılıyor aşımı KIRMIZI, sırada aşımı SARI (eski kural)."""
    if yapiliyor > sinirlar["sari_en_fazla"]:
        return "KIRMIZI", f"yapılıyor {yapiliyor} > {sinirlar['sari_en_fazla']}"
    if yapiliyor > sinirlar["yesil_en_fazla"]:
        return "SARI", f"yapılıyor {yapiliyor} > {sinirlar['yesil_en_fazla']}"
    if sinirlar["sirada_siniri"] is not None and sirada > sinirlar["sirada_siniri"]:
        return "SARI", f"sırada {sirada} > {sinirlar['sirada_siniri']}"
    return "YESIL", ""
