#!/usr/bin/env python3
"""GUN KAPANISI — TEK KOMUT (YH-47). Santiyenin hangi asamada oldugu ve hangi seridin ne bekledigi TEK EKRANDAN okunur.

Recep 09-06: "hakimiyet yok, seviyeyi soylemiyorsun" — parcalar vardi (pano/gunluk/Linear/Kararlar/defter/yol haritasi/sinav),
isletme yoktu; her parca elle kosuluyordu ve biri unutulunca defter bayat kaliyordu (8 saat, olculdu). Bu betik parcalari
SIRAYLA kosar, her adimi OLCER (baslik + olcum satiri), kirmizi adimi gizlemez, sonunda tek ekranlik gun-kapanisi belgesi
+ state.json kaydi birakir.

Adimlar (numaralar sabit; kosum sirasi 1 2 3 4 5 6 8 7 11 9 12 10 — sinav (8) yol haritasindan (7) ONCE kosar ki 'belge'
kanitlari taze olsun; Linear ayna (11) ve ekran (9) yol haritasindan sonra; 2. tur esitle (12) ekrandan sonra; state (10) en son):
   1 pano_disa_aktar.py --gun 7        → <pano koku>/pano-olaylari-son7gun-<tarih>.md (ev dizini; ESKI TARIHLI kopya silinir,
                                         daha yeni tarihli kopya varsa dokunulmaz + KIRMIZI)
   2 konusma_gunlugu.py uret --gun     → <gunluk koku>/<dun>.md + <bugun>.md (Turkiye gunu); §10.6: kokteki 14 gunden eski gun
                                         dosyalari <kok>/arsiv/ altina TASINIR (silinmez; demet 12 yalniz kokteki *.md'yi gorur)
   3 linear_disa_aktar.py              → linear/is-dagilimi-<tarih>.{md,json}; tek kopya silmesi basari kontrolunden SONRA ve
                                         yalniz eski tarihli; JSON'a blockedBy/blocks (Linear relations) girer; sir imzasi>0 → KIRMIZI
   4 kararlar_disa_aktar.py            → linear/kararlar-<slug>-<tarih>.md; beklenen 3 belge Linear ID'siyle bulunur (EKSIK →
                                         KIRMIZI, baslik degisse de); sir suzgeci (sir>0 → dosya yazilmaz, KIRMIZI); design/ altindaki
                                         bayat/cift Kararlar kopyalari SAYILIR (silinmez; OPS karari)
   5 proje_takip_sync.py olc → esitle  (1. tur) — auth HER kosumda `notebooklm source list` ile OLCULUR (degisen demet yoksa
                                         proje_takip_sync aga cikmaz, auth korlugu buradaydi); state yolu <hedef>/state.json
                                         (VENTHUB_PROJE_TAKIP_STATE); --kuru'da esitle ATLANIR
   6 budama                            — kapilar: (a) 'fazla parca' silmesi YALNIZ bu kosumda esitle YESIL/gerekmedi ise (esitle
                                         KIRMIZI/ATLANDI ya da adim 5 kosmadiysa: listelenir, silinmez); (b) koku olculemeyen
                                         (kok yok / 0 dosya) demet icin parca karari VERILMEZ, adim KIRMIZI; (c) yalniz esitleyicinin
                                         ad kalibina uyan kaynaklar ("NN-ad[-N].md") yetim sayilir, kalip disi = YABANCI, silinmez;
                                         (d) beklenen parca defterde YOKSA ya da status=error ise KIRMIZI + state.json anahtari
                                         dusurulur (12. adim yeniden yukler); (e) ayni baslikli MUKERRER kaynakta en yeni kalir
   7 yol_haritasi_dogrula.py           → <hedef>/yol-haritasi-durum.md (--simdi ile damga sabit; yesil/kirmizi/kanitsiz ciktidan)
   8 hafiza_sinavi.py                  — --atla-sinav yoksa; kaynaklar 'ready' olana kadar bekler (en cok NLM_ZAMAN), hazir
                                         degilse ATLANDI (kirmizi degil); --sinav-sorular "S01 S03" alt kume; zaman asimi YOK
  11 yol_haritasi_ayna.py              → Linear "VentHub Yol Haritası ve Durum" belgesi (documentUpdate; --kuru'da YAZILMAZ)
                                         + linear/venthub-yol-haritasi-ve-durum.md (AYNA; damga satirli)
   9 TEK EKRAN                         → <hedef>/gun-kapanisi-<tarih>.md (seviye satiri + §1 adimlar + §2 santiye/asama + §3 yarin
                                         kuyrugu + §4 defter + §5 yol haritasi/sinav/ayna + §6 CURUDU/uyari); SURE YAZILMAZ (ayni
                                         --simdi + ayni girdi → bayt-ayni); eski TARIHLI gun dosyalari silinir (tek kopya)
  12 proje_takip_sync.py esitle        (2. tur) — demet 11 (7/8/9 ciktilari) AYNI kapanista deftere gider (cetvel §10.3)
  10 state.json "gun_kapanisi"         — {damga, adimlar, seviye, sureler}; --kuru'da "gun_kapanisi_kuru" yazilir, kapiya damga
                                         BIRAKILMAZ (kuru kosum defteri esitlemez; eski kuru kaydi 'gun_kapanisi'den dusurulur)

Bayraklar: --kuru (defter yazimi/silme yok · depo ve ev dizininde SILME/TASIMA yok, yalniz listelenir · Linear'a yazilmaz ·
state.json'a kapi damgasi yazilmaz) · --atla-sinav · --sinav-sorular "S01 S03" · --simdi ISO ('Z' ya da ofset ZORUNLU; gelecek
tarih HATA; 24 saatten geride ise yalniz --kuru ile) · --hedef DIR (vars. docs/proje-takip) · --adimlar "1,3,7" (virgullu tam
sayi, verilen sirayla, tekil)
Kurallar: calisma dizininden bagimsiz (repo koku = bu dosya/../..) · konsol utf-8 · her alt surec utf-8/replace + zaman asimi
(python alt betik 900 sn, esitle 1800 sn, notebooklm 180 sn; sinav haric) · cikis kodu + son 3 satir kaydedilir · depoya
yazilan metin pano_disa_aktar sir suzgeci (lin_api_/authorization dahil) + makine yolu suzgeci (~/, ../Users/, depo koku)
· ev dizini yollari depoya kok ADIYLA yazilir (<pano kökü>/…) · LINEAR_API_KEY hicbir yerde basilmaz · hata olan adim KIRMIZI,
bagimsiz adimlar devam eder, bagimli adim "ATLANDI: sebep" · adim 10/12 ekrandan sonra KIRMIZI olursa ekrana satir EKLENIR.
Cikis kodu: 0 hepsi yesil (yol haritasi/sinav KIRMIZI satirlari ekranda gorunur, adimi kirmizi yapmaz) · 2 HATA (arguman,
--simdi kapisi, manifest yok) · 3 en az bir adim KIRMIZI.
Acilis kapisi: scripts/nlm/acilis_kapisi.py — state.json gun_kapanisi.damga'yi okur; 24 saatten eskiyse KIRMIZI, gelecek
tarihse HATA (cetvel §5). Kuru kayit kapiya sayilmaz.
Cetvel: docs/standards/proje-takip-defteri-standard.md §10 (§10.3 esitleme her gun kapanista — 2. tur bunun icin, §10.6 gurultu
siniri — adim 2 arsivi, §10.7 bayatlik — adim 6 dogrulama yarisi, §10.8 durum sozcukleri — §1 'kalem' sutunu ve §6)
"""
from __future__ import annotations
import argparse, datetime as dt, glob, io, json, os, re, subprocess, sys, time
from collections import Counter

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
BURASI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BURASI)
import proje_takip_sync as pts  # noqa: E402  REPO, MANIFEST, oku_json, yaz_json, kok_yolu, demet_dosyalari, derle (ayni kod yolu = ayni beklenen kume)
from pano_disa_aktar import sir_suz, yol_suz  # noqa: E402  sir suzgeci (deger basilmaz) + makine yolu → ~/
from linear_disa_aktar import iso_utc  # noqa: E402  tek zaman yardimcisi (naif → UTC; yerel saat varsayilmaz)
sys.stdout.reconfigure(encoding="utf-8", errors="replace")  # pts import'u errors'suz yeniden ayarlar; Windows cp1254 icin sart

REPO = pts.REPO
PY = sys.executable
NLM_ZAMAN = 180          # notebooklm list/delete + sinav oncesi 'ready' beklemesi
ALT_ZAMAN = 900          # python alt betikler (sinav haric)
ESITLE_ZAMAN = 1800      # proje_takip_sync esitle (kaynak yukleme)
BAYAT_GUN = 7            # Linear acik is bayatlik esigi (linear_disa_aktar §4 ile ayni)
GUNLUK_PENCERE = 14      # cetvel §10.6
AUTH_HATA = re.compile(r"Authentication expired|AUTH_REQUIRED|Not logged in|notebooklm login|login required", re.I)
URETILMIS_AD = re.compile(r"^\d{2}-[a-z0-9-]+\.md$")   # proje_takip_sync'in urettigi kaynak basligi: NN-ad[-N].md
TARIH_AD = re.compile(r"(\d{4}-\d{2}-\d{2})")
DAMGA = re.compile(r"<!-- kaynak_id: (\S+) · kaynak_updatedAt: (\S+) · kopya: (\S+) -->")
GORELI_EV = re.compile(r"(?:\.\.[\\/])+Users[\\/][^\\/\s\"'`]+[\\/]")          # ..\..\Users\<ad>\ (relpath sizintisi)
REPO_DESEN = re.compile(r"[\\/]+".join(re.escape(p) for p in re.split(r"[\\/]", os.path.abspath(REPO)) if p) + r"[\\/]?", re.I)
ADIM_ADI = {1: "Pano disa aktarimi (son 7 gun)", 2: "Konusma gunlugu (dun + bugun; §10.6 arsiv)", 3: "Linear is dagilimi",
            4: "Linear Kararlar aynasi", 5: "Defter olc → esitle (1. tur)", 6: "Defter budama (yetim/eksik/mukerrer kaynak)",
            7: "Yol haritasi dogrula", 8: "Hafiza sinavi", 9: "Tek ekran (gun-kapanisi md)", 10: "state.json kaydi",
            11: "Linear ayna (yol haritasi → Linear belge + depo aynasi)", 12: "Defter esitle (2. tur: demet 11)"}
KOSUM_SIRASI = [1, 2, 3, 4, 5, 6, 8, 7, 11, 9, 12, 10]
KALEM = {"YESIL": "YAPILDI", "KIRMIZI": "AÇIK", "SIRADA": "YARIN", "ATLANDI": "ATLANDI"}   # cetvel §10.8 durum sozcukleri
SERIT_SIRASI = ["URUN", "ALTYAPI", "OPS", "DESIGN", "Q-Validator"]
RECEP = "Recep kapısı"
ETIKETSIZ = "(etiketsiz)"


# ---------------------------------------------------------------- yardimcilar
def betik(ad):
    return os.path.join(BURASI, ad)


def mmss(s):
    return f"{int(s // 60):02d}:{int(s % 60):02d}"


def temiz(t):
    """Depoya/ekrana giden satir: makine yolu (~/, ../Users/, depo koku) + sir suzgeci; '~/' altindaki ters bolu '/' olur."""
    t, _ = yol_suz(t)
    t = GORELI_EV.sub("~/", t)
    t = REPO_DESEN.sub("", t)
    t = re.sub(r"~/[^\s`'\"|]*", lambda m: m.group(0).replace("\\", "/"), t)
    t, _ = sir_suz(t)
    return t


def rel(p):
    ap = os.path.abspath(p)
    for kok, onek in ((REPO, ""), (os.path.expanduser("~"), "~/")):
        if ap.lower().startswith(os.path.abspath(kok).lower()):
            return onek + os.path.relpath(ap, kok).replace("\\", "/")
    return ap.replace("\\", "/")


def kok_adi(c, p):
    """Ev dizini alti yol depoya kok ADIYLA yazilir (<pano kökü>/…): Claude proje-dizini slug'i kullanici adi tasir."""
    ap = os.path.abspath(p)
    for ad in ("pano", "gunluk", "hafiza"):
        k = os.path.abspath(pts.kok_yolu(c["m"], ad))
        if ap.lower() == k.lower():
            return f"<{ad} kökü>"
        if ap.lower().startswith(k.lower() + os.sep):
            return f"<{ad} kökü>/" + os.path.relpath(ap, k).replace("\\", "/")
    return rel(p)


def hucre(t):
    return str(t).replace("|", "/").replace("\n", " ").strip()


def kos(cmd, env_ek=None, timeout=ALT_ZAMAN):
    """(rc, birlesik cikti, stdout). utf-8/replace; alt betikler PYTHONIOENCODING ile konsol kodlamasindan bagimsiz.
    timeout=None yalniz sinav icin (sure basilir)."""
    env = dict(os.environ, PYTHONIOENCODING="utf-8", PYTHONUTF8="1")
    env.update(env_ek or {})
    try:
        r = subprocess.run(cmd, cwd=REPO, env=env, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
        return r.returncode, (r.stdout or "") + (r.stderr or ""), r.stdout or ""
    except FileNotFoundError:
        return 127, f"komut bulunamadi: {cmd[0]}", ""
    except subprocess.TimeoutExpired:
        return 124, f"zaman asimi ({timeout} sn): {os.path.basename(str(cmd[0]))} {' '.join(map(str, cmd[1:3]))}", ""


def son3(out):
    satirlar = [l.rstrip() for l in out.splitlines() if l.strip()]
    return [temiz(l)[:200] for l in satirlar[-3:]]


def dosya_tarihi(p):
    m = TARIH_AD.search(os.path.basename(p))
    return m[1] if m else ""


def tek_kopya(desen, tut, tarih, kuru):
    """'tut' disindaki, dosya adindaki tarihi 'tarih'ten ESKI (ya da tarihsiz) dosyalari siler; --kuru'da yalniz listeler.
    Daha yeni tarihli dosyaya DOKUNULMAZ ve 'daha_yeni'de doner (cagiran adim KIRMIZI yapar: gecmis --simdi yeni gunu silmez).
    (silinen, daha_yeni, kuru_listelenen)"""
    silinen, daha_yeni, listelenen = [], [], []
    for p in sorted(glob.glob(desen)):
        if os.path.abspath(p) == os.path.abspath(tut):
            continue
        ad = os.path.basename(p)
        if dosya_tarihi(p) > tarih:
            daha_yeni.append(ad)
        elif kuru:
            listelenen.append(ad)
        else:
            os.remove(p)
            silinen.append(ad)
    return silinen, daha_yeni, listelenen


def tr_gun(simdi):
    return (simdi + dt.timedelta(hours=3)).strftime("%Y-%m-%d")


def zaman(s):
    return iso_utc(s)


def kirmizi(a, olcum, rc=None, son=None):
    a["durum"], a["olcum"] = "KIRMIZI", olcum
    if rc is not None:
        a["rc"] = rc
    if son is not None:
        a["son"] = son


def defter_kaynaklari(c):
    """(auth_ok, kaynaklar, neden, rc). notebooklm 0.8.1: auth yokken exit 1 + JSON AUTH_REQUIRED; suresi dolmus cerezde
    'Authentication expired or invalid' exit 2 — ikisi de rc != 0 ile yakalanir (olculdu 2026-09-06). rc 124 = zaman asimi
    (auth hatasi DEGIL, ayri etiket)."""
    nid = c["m"]["defter"]["id"]
    rc, out, stdout = kos(["notebooklm", "source", "list", "--notebook", nid, "--json"], timeout=NLM_ZAMAN)
    if rc == 124:
        return False, [], f"source list zaman asimi ({NLM_ZAMAN} sn; ag/NLM asili)", rc
    if rc != 0:
        return False, [], f"source list cikis {rc}" + (" · auth dusuk (notebooklm login)" if AUTH_HATA.search(out) else ""), rc
    try:
        j = json.loads(stdout)
    except json.JSONDecodeError:
        return False, [], "source list JSON degil", rc
    kalemler = j if isinstance(j, list) else j.get("sources", j.get("items", []))
    return True, [k for k in kalemler if isinstance(k, dict)], "", rc


def sinav_son(yol):
    """hafiza-sinavi-sonuc.md → {damga, toplam, yesil, kirmizi, cevapsiz, kirmizilar[(id, not)]}; dosya yoksa None."""
    if not os.path.exists(yol):
        return None
    with io.open(yol, encoding="utf-8") as f:
        metin = f.read()
    d = re.search(r"^# Hafiza sinavi sonucu — (\S+)", metin, re.M)
    s = re.search(r"tabloda (\d+) soru · yesil (\d+) · kirmizi (\d+) · cevapsiz (\d+)", metin)
    kir = [(m[1], m[2].strip()) for m in re.finditer(r"^\|\s*(S\d+)\s*\|[^|]*\|\s*KIRMIZI\s*\|[^|]*\|([^|]*)\|", metin, re.M)]
    return {"damga": d[1] if d else "?", "toplam": int(s[1]) if s else 0, "yesil": int(s[2]) if s else 0,
            "kirmizi": int(s[3]) if s else 0, "cevapsiz": int(s[4]) if s else 0, "kirmizilar": kir}


def esitle_kos(c, a, parca):
    """proje_takip_sync esitle; a'yi doldurur, (basarili, yenilenen) doner. auth dususu / rc≠0 / 'yenilendi' satiri yok → KIRMIZI."""
    rc2, out2, _ = kos([PY, betik("proje_takip_sync.py"), "esitle"], env_ek=c["pts_env"], timeout=ESITLE_ZAMAN)
    a["rc"], a["son"] = rc2, son3(out2)
    y = re.search(r"(\d+) demet yenilendi", out2)
    auth_dustu = AUTH_HATA.search(out2) is not None
    if rc2 != 0 or auth_dustu or not y:
        kirmizi(a, f"{parca} · esitle KIRMIZI (cikis {rc2}{', auth dusuk' if auth_dustu else ''}{', zaman asimi' if rc2 == 124 else ''})")
        return False, 0
    return True, int(y[1])


# ---------------------------------------------------------------- adimlar
def adim1(c, a):
    kok = pts.kok_yolu(c["m"], "pano")
    hedef = os.path.join(kok, f"pano-olaylari-son7gun-{c['tarih']}.md")
    rc, out, _ = kos([PY, betik("pano_disa_aktar.py"), "--gun", "7", "--hedef", hedef, "--simdi", c["damga"]])
    a["rc"], a["son"] = rc, son3(out)
    m = re.search(r"YESIL: (\d+) not .*?\((\d+) bayt\) · mukerrer (\d+) · prob (\d+) · yol (\d+) · sir (\d+)", out)
    if rc != 0 or not m or not os.path.exists(hedef):
        return kirmizi(a, "pano disa aktarimi basarisiz")
    silinen, yeni, liste = tek_kopya(os.path.join(kok, "pano-olaylari-*.md"), hedef, c["tarih"], c["kuru"])
    c["pano"] = {"not": int(m[1]), "bayt": int(m[2]), "sir": int(m[6]), "yol": int(m[5]), "silinen": silinen}
    a["durum"], a["dosya"] = "YESIL", kok_adi(c, hedef)
    a["olcum"] = (f"{m[1]} not · {m[2]} bayt · sir {m[6]} · makine yolu {m[5]} · eski kopya silindi {len(silinen)}"
                  + (f" · KURU: silinecek {len(liste)} ({', '.join(liste)})" if liste else ""))
    if yeni:
        kirmizi(a, a["olcum"] + f" · daha yeni tarihli kopya var, dokunulmadi: {', '.join(yeni)} (--simdi gecmis mi?)")


def adim2(c, a):
    kok = pts.kok_yolu(c["m"], "gunluk")
    gunler = [tr_gun(c["simdi"] - dt.timedelta(days=1)), tr_gun(c["simdi"])]
    parcalar, sir, kotu = [], None, None
    for g in gunler:
        rc, out, _ = kos([PY, betik("konusma_gunlugu.py"), "uret", "--gun", g], env_ek={"VENTHUB_PROJE_TAKIP_GUNLUK": kok})
        m = re.search(rf"^{re.escape(g)}\s+girdi\s+(\d+)", out, re.M)
        t = re.search(r"sir kaldirilan (\d+)", out)
        if sir is None and t:
            sir = int(t[1])  # TUM gunluk kokunun toplami (gun suzgecinden bagimsiz); bir kez alinir, toplanmaz
        if rc != 0 and kotu is None:
            kotu = (rc, son3(out))  # ilk kirmizi kazanir: kanit satirlari yesil kosumla ezilmez
        if kotu is None:
            a["rc"], a["son"] = rc, son3(out)
        parcalar.append(f"{g}: girdi {m[1] if m else 0}")
    if kotu:
        a["rc"], a["son"] = kotu
    # §10.6 pencere: kokteki YYYY-MM-DD.md dosyalarindan Turkiye gunune gore 14 gunden eski olanlar <kok>/arsiv/ altina tasinir
    esik = (c["simdi"] + dt.timedelta(hours=3) - dt.timedelta(days=GUNLUK_PENCERE)).strftime("%Y-%m-%d")
    eski = [p for p in sorted(glob.glob(os.path.join(kok, "????-??-??.md"))) if os.path.basename(p)[:10] < esik]
    tasinan, tasinamayan = [], []
    if eski and not c["kuru"]:
        arsiv = os.path.join(kok, "arsiv")
        os.makedirs(arsiv, exist_ok=True)
        for p in eski:
            try:
                os.replace(p, os.path.join(arsiv, os.path.basename(p)))
                tasinan.append(os.path.basename(p))
            except OSError as e:
                tasinamayan.append(f"{os.path.basename(p)} ({type(e).__name__})")
    dosyalar = sorted(glob.glob(os.path.join(kok, "*.md")))
    mb = sum(os.path.getsize(p) for p in dosyalar) / 1024 / 1024
    kalan_eski = [p for p in dosyalar if TARIH_AD.match(os.path.basename(p)) and os.path.basename(p)[:10] < esik]
    if not kalan_eski:
        pencere = "uygulandi"
    elif c["kuru"]:
        pencere = f"KURU: uygulanmadi (arsive tasinacak {len(kalan_eski)})"
    else:
        pencere = f"UYGULANAMADI ({len(kalan_eski)} eski dosya kokte kaldi)"
    c["gunluk"] = {"gun": len(dosyalar), "mb": mb, "sir": sir or 0, "pencere": pencere, "tasinan": tasinan, "esik": esik}
    a["olcum"] = (f"{' · '.join(parcalar)} · sir (tum gunluk koku) {sir if sir is not None else '?'} · gunluk kokunde {len(dosyalar)} gun / {mb:.1f} MB"
                  + f" (§10.6 {GUNLUK_PENCERE} gun siniri, esik {esik}: {pencere}" + (f"; arsive tasindi {len(tasinan)}" if tasinan else "") + ")")
    a["durum"] = "KIRMIZI" if (kotu or tasinamayan or (kalan_eski and not c["kuru"])) else "YESIL"
    if tasinamayan:
        a["son"] = a["son"] + [f"tasinamadi: {', '.join(tasinamayan)}"]
    a["dosya"] = kok_adi(c, kok)


def adim3(c, a):
    ld = c["linear_dir"]
    rc, out, _ = kos([PY, betik("linear_disa_aktar.py"), "--simdi", c["damga"], "--tarih", c["tarih"], "--hedef-dizin", ld])
    a["rc"], a["son"] = rc, son3(out)
    m = re.search(r"OZET: kayit (\d+) · cagri (\d+)", out)
    s = re.search(r"· sir (\d+) · yol (\d+)", out)
    jp = os.path.join(ld, f"is-dagilimi-{c['tarih']}.json")
    mp = os.path.join(ld, f"is-dagilimi-{c['tarih']}.md")
    if rc != 0 or not m or not os.path.exists(jp) or not os.path.exists(mp):
        eldeki = sorted(glob.glob(os.path.join(ld, "is-dagilimi-*.json")))
        c["is_json"] = eldeki[-1] if eldeki else None  # BAYAT: c['linear'] yok → santiye() isaretler
        return kirmizi(a, "Linear disa aktarimi basarisiz" + (" (cift eksik: md/json)" if rc == 0 and m else "")
                       + (f" · eldeki en yeni: {os.path.basename(c['is_json'])} (BAYAT)" if c["is_json"] else ""))
    c["is_json"] = jp
    silinen, yeni, liste = [], [], []
    for uz in ("md", "json"):  # tek kopya: yalniz bugunun cifti TAM ise ve yalniz ESKI tarihli dosyalar
        s1, y1, l1 = tek_kopya(os.path.join(ld, f"is-dagilimi-*.{uz}"), os.path.join(ld, f"is-dagilimi-{c['tarih']}.{uz}"), c["tarih"], c["kuru"])
        silinen += s1; yeni += y1; liste += l1
    c["linear"] = {"kayit": int(m[1]), "cagri": int(m[2]), "silinen": silinen, "sir": int(s[1]) if s else 0, "yol": int(s[2]) if s else 0}
    a["durum"], a["dosya"] = "YESIL", rel(jp)
    a["olcum"] = (f"kayit {m[1]} · cagri {m[2]} · cift tam (md+json) · sir {c['linear']['sir']} · yol {c['linear']['yol']} · eski kopya silindi {len(silinen)}"
                  + (f" ({', '.join(silinen)})" if silinen else "") + (f" · KURU: silinecek {len(liste)}" if liste else ""))
    if c["linear"]["sir"]:
        kirmizi(a, a["olcum"] + " · SIR imzasi is basliginda (deger maskelendi; Linear'da temizle)")
    elif yeni:
        kirmizi(a, a["olcum"] + f" · daha yeni tarihli kopya var, dokunulmadi: {', '.join(yeni)}")


def design_bayat_kopyalar(c):
    """docs/proje-takip/design/** altindaki kararlar-*.md: linear/ aynasindan eski kaynak_updatedAt'li, damgasiz ya da ayni
    dizinde ikinci kopya → liste (YALNIZ RAPOR; §10.2 tek kopya — silme/yazma OPS karari)."""
    ayna = {}
    for p in glob.glob(os.path.join(c["linear_dir"], "kararlar-*.md")):
        with io.open(p, encoding="utf-8", errors="replace") as f:
            m = DAMGA.search(f.read(4000))
        if m:
            ayna[m[1]] = m[2]
    bulgular, gorulen = [], Counter()
    for p in sorted(glob.glob(os.path.join(c["hedef"], "design", "**", "kararlar-*.md"), recursive=True)):
        with io.open(p, encoding="utf-8", errors="replace") as f:
            m = DAMGA.search(f.read(4000))
        slug = re.sub(r"-\d{4}-\d{2}-\d{2}\.md$|\.md$", "", os.path.basename(p))
        gorulen[(os.path.dirname(p), slug)] += 1
        if not m:
            bulgular.append(f"{rel(p)} (damgasiz)")
        elif m[1] in ayna and m[2] < ayna[m[1]]:
            bulgular.append(f"{rel(p)} (kaynak_updatedAt {m[2][:16]}Z < linear/ {ayna[m[1]][:16]}Z)")
    for (d, slug), n in sorted(gorulen.items()):
        if n > 1:
            bulgular.append(f"{rel(d)}/{slug}: {n} kopya (ayni dizinde cift)")
    return bulgular


def adim4(c, a):
    rc, out, _ = kos([PY, betik("kararlar_disa_aktar.py"), "--simdi", c["damga"], "--tarih", c["tarih"], "--hedef-dizin", c["linear_dir"]])
    a["rc"], a["son"] = rc, son3(out)
    m = re.search(r"OZET: belge (\d+) · yazildi (\d+) · silindi (\d+) · ayni (\d+) · kapsam disi (\d+) · eksik (\d+) · sir (\d+) · yol (\d+) · yabanci (\d+)", out)
    if not m:
        return kirmizi(a, f"Kararlar aynasi basarisiz (cikis {rc}; OZET satiri yok)")
    belgeler = [{"slug": s, "durum": d, "linear": u} for d, s, u in re.findall(r"^\s+(yazildi|ayni|EKSIK|SIR)\s+(\S+)\s+.*?\(Linear (\S+)", out, re.M)]
    design = design_bayat_kopyalar(c)
    c["kararlar"] = {"belge": int(m[1]), "yazildi": int(m[2]), "silindi": int(m[3]), "ayni": int(m[4]), "kapsam_disi": int(m[5]),
                     "eksik": int(m[6]), "sir": int(m[7]), "yol": int(m[8]), "yabanci": int(m[9]), "belgeler": belgeler, "design_bayat": design}
    a["dosya"] = rel(c["linear_dir"])
    a["olcum"] = (f"belge {m[1]} · yazildi {m[2]} · ayni {m[4]} · silindi {m[3]} · kapsam disi {m[5]} · eksik {m[6]} · sir {m[7]} · yol {m[8]} · yabanci {m[9]} · "
                  + " · ".join(f"{b['slug']} {b['durum']}" for b in belgeler)
                  + (f" · design/ altinda bayat/cift kopya {len(design)} (yalniz rapor)" if design else ""))
    if rc != 0 or int(m[6]) or int(m[7]):
        return kirmizi(a, a["olcum"] + (" · Kararlar belgesi EKSIK (Linear'da ID ile bulunamadi)" if int(m[6]) else "")
                       + (" · SIR imzasi: dosya yazilmadi, Linear'da temizle" if int(m[7]) else "") + (f" · cikis {rc}" if rc else ""))
    a["durum"] = "YESIL"


def adim5(c, a):
    rc, out, _ = kos([PY, betik("proje_takip_sync.py"), "olc"], env_ek=c["pts_env"])
    a["rc"], a["son"] = rc, son3(out)
    degisen = [l.split()[1] for l in out.splitlines() if l.startswith("DEGISTI")]
    m = re.search(r"OZET: (\d+) degisen / (\d+) ayni / (\d+) demet", out)
    if rc not in (0, 3) or not m:
        return kirmizi(a, "proje_takip_sync olc basarisiz" + (" (zaman asimi)" if rc == 124 else ""))
    c["defter"] = {"degisen": degisen, "demet": int(m[3]), "esitlenen": 0, "esitle": "-", "tur2": None}
    parca = f"{len(degisen)} degisen / {m[3]} demet" + (f" ({', '.join(degisen)})" if degisen else "")
    auth_ok, kaynaklar, neden, rc_l = defter_kaynaklari(c)  # her kosumda: degisen yoksa proje_takip_sync aga cikmaz (auth korlugu)
    c["auth_ok"], c["kaynaklar"] = auth_ok, kaynaklar
    if not auth_ok:
        c["defter"]["esitle"] = "ATLANDI (auth)"
        return kirmizi(a, f"{parca} · defter on-kapi KIRMIZI ({neden}) · esitle ATLANDI", rc=rc_l, son=[neden])
    if not degisen:
        c["defter"]["esitle"] = "gerekmedi"
        a["durum"], a["olcum"] = "YESIL", f"{parca} · defter guncel · auth YESIL ({len(kaynaklar)} kaynak)"
        return
    if c["kuru"]:
        c["defter"]["esitle"] = "ATLANDI (--kuru)"
        a["durum"], a["olcum"] = "YESIL", f"{parca} · auth YESIL ({len(kaynaklar)} kaynak) · esitle ATLANDI (--kuru) → DEFTER BAYAT kalir"
        return
    ok, n = esitle_kos(c, a, parca)
    if not ok:
        c["defter"]["esitle"] = "KIRMIZI"
        return
    c["defter"]["esitlenen"], c["defter"]["esitle"] = n, f"{n} demet yenilendi"
    a["durum"], a["olcum"] = "YESIL", f"{parca} · auth YESIL · esitle: {n} demet yenilendi"


def adim6(c, a):
    df = c.get("defter")
    if c.get("auth_ok") is False:
        a["durum"], a["olcum"] = "ATLANDI", "ATLANDI: defter on-kapi KIRMIZI (adim 5)"
        return
    auth_ok, kaynaklar, neden, rc_l = defter_kaynaklari(c)  # taze liste (esitle sonrasi)
    if not auth_ok:
        return kirmizi(a, f"defter on-kapi KIRMIZI ({neden})", rc=rc_l, son=[neden])
    m, nid = c["m"], c["m"]["defter"]["id"]
    adlar = {d["ad"] for d in m["demetler"]}
    # beklenen parca kumesi demet demet; koku OLCULEMEYEN demet (kok yok / 0 dosya / derle hatasi) icin parca karari VERILMEZ
    beklenen, olculemeyen = set(), []
    for d in m["demetler"]:
        try:
            kok, dosyalar, _ = pts.demet_dosyalari(m, d)
            if not os.path.isdir(kok):
                olculemeyen.append(f"{d['ad']} (kok yok: {rel(kok)})"); continue
            if not dosyalar:
                olculemeyen.append(f"{d['ad']} (0 dosya)"); continue
            beklenen |= {f"{ad}.md" for ad, _ in pts.derle(m, d)}
        except Exception as e:
            olculemeyen.append(f"{d['ad']} ({type(e).__name__})")
    olculemeyen_ad = {x.split()[0] for x in olculemeyen}
    # silme kapisi: 'fazla parca' yalniz bu kosumda esitle YESIL ya da gerekmedi ise (yeni parcalar defterde) silinir
    es = (df or {}).get("esitle", "-")
    fazla_silinebilir = es == "gerekmedi" or es.endswith("demet yenilendi")
    kapi = None if fazla_silinebilir else ("adim 5 bu kosumda kosmadi" if df is None else f"esitle {es}")
    sayac = Counter(k.get("title") or "" for k in kaynaklar)
    yetim, yabanci, mukerrer_ad = [], [], set()
    for k in kaynaklar:
        t = k.get("title") or ""
        if not URETILMIS_AD.match(t):
            yabanci.append(t or "(basliksiz)"); continue  # elle/PDF/URL kaynak: silinmez, §10.4 haftalik oz-denetime gider
        stem = t[:-3]
        kok_ad = stem if stem in adlar else re.sub(r"-\d+$", "", stem)
        if kok_ad not in adlar:
            yetim.append((k.get("id"), t, "demet yok")); continue
        if kok_ad in olculemeyen_ad:
            continue  # koku olculemedi: karar yok
        if t not in beklenen:
            yetim.append((k.get("id"), t, "fazla parca (parca sayisi dustu)")); continue
        if sayac[t] > 1:
            mukerrer_ad.add(t)
    for t in sorted(mukerrer_ad):  # ayni baslik birden fazla: created_at en yenisi kalir, digerleri yetim
        ayni = sorted([k for k in kaynaklar if (k.get("title") or "") == t], key=lambda k: k.get("created_at") or "", reverse=True)
        yetim += [(k.get("id"), t, f"mukerrer (en yeni {(ayni[0].get('created_at') or '')[:16]}Z kaldi)") for k in ayni[1:]]
    eksik = sorted(beklenen - set(sayac))
    bozuk = sorted(k.get("title") for k in kaynaklar if k.get("status") == "error" and (k.get("title") or "") in beklenen)
    hazir_degil = [k.get("title") for k in kaynaklar if k.get("status") != "ready"]
    en_eski = min(kaynaklar, key=lambda k: k.get("created_at") or "") if kaynaklar else None
    budanan, hata, idsiz, kapida = 0, [], [], []
    for sid, t, sebep in yetim:
        if sebep.startswith("fazla parca") and not fazla_silinebilir:
            kapida.append(t); print(f"   yetim (silinmedi, kapi: {kapi}): {t} — {sebep}"); continue
        if c["kuru"]:
            print(f"   yetim (kuru, silinmedi): {t} — {sebep}"); continue
        if not sid:
            idsiz.append(t); print(f"   yetim (id yok, SILINEMEDI): {t} — {sebep}"); continue
        rc, out, _ = kos(["notebooklm", "source", "delete", "--notebook", nid, sid, "--yes"], timeout=NLM_ZAMAN)
        if rc == 0:
            budanan += 1; print(f"   budandi: {t} — {sebep}")
        else:
            hata.append(t); print(f"   BUDANAMADI: {t} — cikis {rc}")
    # eksik/bozuk beklenen parca: state.json anahtari dusurulur → 12. adim (2. tur esitle) yeniden yukler; kuru'da yalniz rapor
    state = pts.oku_json(c["state"], {"demetler": {}})
    dusurulen = []
    if not c["kuru"]:
        for t in eksik + bozuk:
            if t[:-3] in state.get("demetler", {}):
                state["demetler"].pop(t[:-3]); dusurulen.append(t[:-3])
        if dusurulen:
            pts.yaz_json(c["state"], state)
    beklenen_ad = {b[:-3] for b in beklenen}
    bayat_anahtar = sorted(k for k in state.get("demetler", {}) if k not in beklenen_ad and re.sub(r"-\d+$", "", k) not in olculemeyen_ad)
    c["budama"] = {"kaynak": len(kaynaklar), "demet": len(adlar), "beklenen": len(beklenen) if not olculemeyen else None,
                   "yetim": [(t, s) for _, t, s in yetim], "budanan": budanan, "hazir_degil": hazir_degil, "eksik": eksik, "bozuk": bozuk,
                   "yabanci": yabanci, "olculemeyen": olculemeyen, "kapida": kapida, "idsiz": idsiz, "dusurulen": dusurulen, "kapi": kapi,
                   "mukerrer": sorted(mukerrer_ad),
                   "en_eski": (en_eski.get("title"), (en_eski.get("created_at") or "")[:16] + "Z") if en_eski else None,
                   "state_bayat": bayat_anahtar}
    a["olcum"] = (f"kaynak {len(kaynaklar)} · demet {len(adlar)}" + (f" · beklenen parca {len(beklenen)}" if not olculemeyen else " · beklenen OLCULEMEDI")
                  + f" · budanan {budanan}"
                  + (f" · yetim {len(yetim)} ({'--kuru: silinmedi' if c['kuru'] else 'silinemedi ' + str(len(hata))})" if yetim else "")
                  + (f" · kapida {len(kapida)} ({kapi})" if kapida else "")
                  + (f" · EKSIK parca {len(eksik)} ({', '.join(eksik)})" if eksik else "")
                  + (f" · BOZUK (status error) {len(bozuk)}" if bozuk else "")
                  + (f" · mukerrer baslik {len(mukerrer_ad)}" if mukerrer_ad else "")
                  + (f" · id'siz {len(idsiz)}" if idsiz else "")
                  + (f" · YABANCI kaynak {len(yabanci)} (silinmez)" if yabanci else "")
                  + (f" · OLCULEMEYEN demet {len(olculemeyen)} ({'; '.join(olculemeyen)})" if olculemeyen else "")
                  + (f" · hazir olmayan {len(hazir_degil)}" if hazir_degil else "")
                  + (f" · state anahtari dusuruldu {len(dusurulen)}" if dusurulen else "")
                  + (f" · state.json bayat anahtar {len(bayat_anahtar)}" if bayat_anahtar else "")
                  + (f" · en eski kaynak {en_eski.get('title')} {(en_eski.get('created_at') or '')[:16]}Z (§10.7 dogrulama yarisi)" if en_eski else ""))
    kir = hata or eksik or bozuk or idsiz or olculemeyen
    a["durum"], a["rc"] = ("KIRMIZI", 1) if kir else ("YESIL", 0)
    if kir and not a["son"]:
        a["son"] = [temiz(x)[:200] for x in ([f"budanamadi: {', '.join(hata)}"] if hata else []) + ([f"eksik: {', '.join(eksik)}"] if eksik else [])
                    + ([f"bozuk: {', '.join(bozuk)}"] if bozuk else []) + ([f"id'siz: {', '.join(idsiz)}"] if idsiz else [])
                    + ([f"olculemeyen: {'; '.join(olculemeyen)}"] if olculemeyen else [])][:3]


def adim7(c, a):
    durum_md = os.path.join(c["hedef"], "yol-haritasi-durum.md")
    rc, out, _ = kos([PY, betik("yol_haritasi_dogrula.py"), "--simdi", c["damga"], "--hedef", c["hedef"]], env_ek={"HAFIZA_SINAV_SONUC": c["sinav_sonuc"]})
    a["rc"], a["son"] = rc, son3(out)
    m = re.search(r"OZET: yesil (\d+) / kirmizi (\d+) / kanitsiz (\d+) · olculmemis kanit (\d+)", out)
    if rc not in (0, 3) or "HATA:" in out or not m:
        return kirmizi(a, "yol haritasi dogrulayici kosamadi" + (" (satir tavani asildi)" if "tavani" in out else "") + (" (zaman asimi)" if rc == 124 else ""))
    satir = tavan = 0
    canli, kanit, durum = "?", {}, {}
    if os.path.exists(durum_md):
        with io.open(durum_md, encoding="utf-8") as f:
            metin = f.read()
        s = re.search(r"Satir (\d+)/(\d+)", metin)
        satir, tavan = (int(s[1]), int(s[2])) if s else (0, 0)
        cl = re.search(r"canli (\S+)", metin)
        canli = cl[1] if cl else "?"
        for satir_md in metin.splitlines():
            h = [x.strip() for x in satir_md.strip().strip("|").split("|")]
            if len(h) >= 8 and h[1] == "KIRMIZI" and h[0].startswith("YH-"):
                kanit[h[0]] = (h[3][:80], h[7].replace("<br>", " ; "))
                durum[h[0]] = h[2]
    ids = re.findall(r"^KIRMIZI\s+(YH-\d+)", out, re.M)
    c["yol"] = {"yesil": int(m[1]), "kirmizi": int(m[2]), "kanitsiz": int(m[3]), "olculmemis": int(m[4]), "satir": satir, "tavan": tavan,
                "canli": canli, "kirmizi_ids": ids, "kirmizi_kanit": kanit, "kirmizi_durum": durum, "dosya": durum_md}
    a["durum"], a["dosya"] = "YESIL", rel(durum_md)
    a["olcum"] = (f"satir {satir}/{tavan} · yesil {m[1]} · kirmizi {m[2]}" + (f" ({', '.join(ids)})" if ids else "")
                  + f" · kanitsiz {m[3]} · olculmemis kanit {m[4]} · canli {canli}")


def adim8(c, a):
    son = sinav_son(c["sinav_sonuc"])
    if c["atla_sinav"]:
        c["sinav"] = {**(son or {}), "kosuldu": False}
        a["durum"] = "ATLANDI"
        a["olcum"] = "ATLANDI: --atla-sinav · son sonuc " + (f"{son['damga']} yesil {son['yesil']}/{son['toplam']} kirmizi {son['kirmizi']} cevapsiz {son['cevapsiz']}" if son else "YOK")
        return
    # dizinlenmemis kaynaga soru sorulmaz: 'ready' olana kadar bekle (en cok NLM_ZAMAN), olmazsa ATLANDI (kirmizi degil)
    hazir_degil, bekleme = [], 0.0
    if c.get("auth_ok") is not False:
        t0 = time.monotonic()
        while True:
            ok, kaynaklar, _, _ = defter_kaynaklari(c)
            hazir_degil = [k.get("title") for k in kaynaklar if k.get("status") != "ready"] if ok else []
            if not hazir_degil or time.monotonic() - t0 >= NLM_ZAMAN:
                break
            time.sleep(15)
        bekleme = time.monotonic() - t0
    if hazir_degil:
        c["sinav"] = {**(son or {}), "kosuldu": False}
        a["durum"] = "ATLANDI"
        a["olcum"] = f"ATLANDI: {len(hazir_degil)} kaynak hazir degil ({', '.join(hazir_degil[:5])}) · bekleme {mmss(bekleme)} · son sonuc " + (son["damga"] if son else "YOK")
        return
    t0 = time.monotonic()
    rc, out, _ = kos([PY, betik("hafiza_sinavi.py"), *c["sinav_sorular"]], env_ek={"HAFIZA_SINAV_SONUC": c["sinav_sonuc"]}, timeout=None)  # zaman asimi YOK
    a["rc"], a["son"] = rc, son3(out)
    m = re.search(r"OZET: yesil (\d+) / kirmizi (\d+) / cevapsiz (\d+)", out)
    son = sinav_son(c["sinav_sonuc"])
    c["sinav"] = {**(son or {}), "kosuldu": True, "kosum_sure": time.monotonic() - t0, "bekleme": bekleme}
    if rc not in (0, 3) or not m or not son:
        return kirmizi(a, "sinav kosamadi" + (" · defter cevap vermedi (auth?)" if rc == 2 else ""))
    kir = re.findall(r"^KIRMIZI\s+(S\d+)", out, re.M)
    a["durum"], a["dosya"] = "YESIL", rel(c["sinav_sonuc"])
    a["olcum"] = (f"bu kosum {int(m[1]) + int(m[2]) + int(m[3])} soru: yesil {m[1]} · kirmizi {m[2]}" + (f" ({', '.join(kir)})" if kir else "")
                  + f" · cevapsiz {m[3]} · tabloda {son['yesil']}/{son['toplam']} yesil · damga {son['damga']}" + (f" · hazir bekleme {mmss(bekleme)}" if bekleme else ""))


def adim11(c, a):
    durum_md = os.path.join(c["hedef"], "yol-haritasi-durum.md")
    if not os.path.exists(durum_md):
        a["durum"], a["olcum"] = "ATLANDI", "ATLANDI: yol-haritasi-durum.md yok (adim 7 kosmadi)"
        return
    cmd = [PY, betik("yol_haritasi_ayna.py"), "--durum", durum_md, "--hedef-dizin", c["linear_dir"], "--simdi", c["damga"], "--tarih", c["tarih"]]
    if c["kuru"]:
        cmd.append("--kuru")
    rc, out, _ = kos(cmd)
    a["rc"], a["son"] = rc, son3(out)
    m = re.search(r"OZET: linear (\S+) · ayna (\S+) · sir (\d+) · yol (\d+) · kaynak_updatedAt (\S+)", out)
    if rc != 0 or not m:
        return kirmizi(a, "Linear ayna basarisiz" + (" (zaman asimi)" if rc == 124 else f" (cikis {rc})"))
    c["ayna"] = {"linear": m[1], "dosya": m[2], "sir": int(m[3]), "yol": int(m[4]), "updatedAt": m[5]}
    a["durum"], a["dosya"] = "YESIL", m[2]
    a["olcum"] = f"Linear belge: {m[1]} · ayna {m[2]} · sir {m[3]} · yol {m[4]} · kaynak_updatedAt {m[5]}"
    if int(m[3]):
        kirmizi(a, a["olcum"] + " · SIR imzasi: Linear'a yazilmadi")


def adim12(c, a):
    rc, out, _ = kos([PY, betik("proje_takip_sync.py"), "olc"], env_ek=c["pts_env"])
    a["rc"], a["son"] = rc, son3(out)
    degisen = [l.split()[1] for l in out.splitlines() if l.startswith("DEGISTI")]
    m = re.search(r"OZET: (\d+) degisen / (\d+) ayni / (\d+) demet", out)
    if rc not in (0, 3) or not m:
        return kirmizi(a, "proje_takip_sync olc (2. tur) basarisiz")
    df = c.setdefault("defter", {"degisen": [], "demet": int(m[3]), "esitlenen": 0, "esitle": "-", "tur2": None})
    df["tur2"] = {"degisen": degisen, "esitlenen": 0, "durum": "-"}
    parca = f"2. tur: {len(degisen)} degisen / {m[3]} demet" + (f" ({', '.join(degisen)})" if degisen else "")
    if not degisen:
        df["tur2"]["durum"] = "gerekmedi"
        a["durum"], a["olcum"] = "YESIL", f"{parca} · defter guncel"
        return
    if c.get("auth_ok") is False:
        df["tur2"]["durum"] = "ATLANDI (auth)"
        a["durum"], a["olcum"] = "ATLANDI", f"ATLANDI: defter on-kapi KIRMIZI (adim 5) · {parca} → DEFTER BAYAT"
        return
    if c["kuru"]:
        df["tur2"]["durum"] = "ATLANDI (--kuru)"
        a["durum"], a["olcum"] = "YESIL", f"KURU: {len(degisen)} demet ESITLENMEDI ({', '.join(degisen)}) → DEFTER BAYAT kalir"
        return
    ok, n = esitle_kos(c, a, parca)
    if not ok:
        df["tur2"]["durum"] = "KIRMIZI"
        return
    df["tur2"]["esitlenen"], df["tur2"]["durum"] = n, f"{n} demet yenilendi"
    a["durum"], a["olcum"] = "YESIL", f"{parca} · esitle: {n} demet yenilendi (demet 11 ayni kapanista defterde, §10.3)"


# ---------------------------------------------------------------- Linear santiye hesaplari (is-dagilimi JSON)
def serit_kumesi(r):
    s = set()
    for l in r["labels"]:
        if re.match(r"P0\d", l):
            s.add("Q-Validator")
        elif l.lower().startswith("recep"):
            s.add(RECEP)
        else:
            s.add(l)
    return s or {ETIKETSIZ}


def oncelik(r):
    return (9 if r["priority"] == 0 else r["priority"], r["updatedAt"] and -zaman(r["updatedAt"]).timestamp())


def santiye(c):
    """is-dagilimi JSON'dan seviye sayilari + tablolar; JSON yoksa None. Adim 3 bu kosumda YESIL degilse BAYAT (tarih ne olursa olsun)."""
    if not c.get("is_json") or not os.path.exists(c["is_json"]):
        eldeki = sorted(glob.glob(os.path.join(c["linear_dir"], "is-dagilimi-*.json")))
        c["is_json"] = eldeki[-1] if eldeki else None
    if not c.get("is_json"):
        return None
    with io.open(c["is_json"], encoding="utf-8") as f:
        j = json.load(f)
    rows = j["kayitlar"]
    esik = c["simdi"] - dt.timedelta(days=BAYAT_GUN)
    for r in rows:
        r["_serit"] = serit_kumesi(r)
        r["_acik"] = r["statusType"] in ("started", "unstarted")
        r["_bayat"] = r["_acik"] and zaman(r["updatedAt"]) < esik
        r["_bloklu"] = r["statusType"] not in ("completed", "canceled") and bool(r.get("blockedBy"))  # Backlog dahil (REC-169 → REC-168 gorunsun)
    T = len(rows)
    D = sum(1 for r in rows if r["statusType"] == "completed")
    S = sum(1 for r in rows if r["statusType"] == "started")
    U = sum(1 for r in rows if r["statusType"] == "unstarted")
    B = sum(1 for r in rows if r["statusType"] in ("backlog", "triage"))
    C = sum(1 for r in rows if r["statusType"] == "canceled")
    payda = T - C
    seritler = sorted({s for r in rows for s in r["_serit"]}, key=lambda s: (SERIT_SIRASI.index(s) if s in SERIT_SIRASI else 50, s == RECEP, s == ETIKETSIZ, s))
    kt = {}
    for r in rows:
        kt.setdefault((r["project"] or "(projesiz)", r["projectMilestone"] or "(KT yok)"), []).append(r)
    aktif = []
    for (p, k), rs in kt.items():
        st = sum(1 for r in rs if r["statusType"] == "started")
        if k != "(KT yok)" and st:
            aktif.append((k, sum(1 for r in rs if r["statusType"] == "completed"), len(rs) - sum(1 for r in rs if r["statusType"] == "canceled"), st))
    aktif.sort(key=lambda x: (-x[3], x[0]))
    return {"damga": j.get("damga", "?"), "bayat_json": not c.get("linear"), "rows": rows, "toplam": T, "done": D, "started": S,
            "unstarted": U, "backlog": B, "canceled": C, "yuzde": round(100 * D / payda) if payda else 0, "acik": S + U,
            "bayat": sum(1 for r in rows if r["_bayat"]), "recep": sum(1 for r in rows if r["_acik"] and RECEP in r["_serit"]),
            "etiketsiz": sum(1 for r in rows if r["_acik"] and ETIKETSIZ in r["_serit"]), "bloklu": sum(1 for r in rows if r["_bloklu"]),
            "coklu": sum(1 for r in rows if len([l for l in r["labels"] if not re.match(r"P0\d", l)]) + (1 if any(re.match(r"P0\d", l) for l in r["labels"]) else 0) > 1),
            "seritler": seritler, "kt": kt, "aktif_kt": aktif[:4]}


def yuzde_str(d, t, c_):
    return f"{round(100 * d / (t - c_))}%" if t - c_ else "-"


# ---------------------------------------------------------------- tek ekran
BEKLEYEN_DESEN = re.compile(r"(tek ba[sş][iı]na sorul|Recep'?e (tek ba[sş][iı]na )?sor|karar bekliyor|Recep karar[ıi] (gerek|bekl)|SENDEN BEKLEYEN|Recep kap[ıi]s[ıi]|Recep'?ten .{0,30}karar|Recep onay[ıi] (gerek|bekl))", re.I)


def senden_bekleyen(c, rows):
    """§0 SENDEN BEKLEYEN (REC-175, WrongStack 3/3): Recep'in karar/onayi gereken kalemler UC kaynaktan tek listeye.
    (a) Linear: acik is + 'Recep kapisi' etiketi ya da basliginda Recep gecen; (b) Kararlar aynalari (linear/kararlar-*.md):
    BEKLEYEN_DESEN ile eslesen satirlar; (c) docs/proje-takip/recep-bekleyen.md: OPS'un elle tuttugu liste ('- ' satirlari).
    Kaynak adi her kalemin basinda; hicbiri digerini elemez (ayni karar iki kaynakta gorunebilir — cift gorunmek, gorunmemekten iyidir)."""
    L = []
    for r in sorted([r for r in (rows or []) if r.get("_acik") and (RECEP in r.get("_serit", ()) or "Recep" in (r.get("title") or ""))], key=oncelik):
        L.append(("Linear", f"{r['identifier']} · {r['title'][:140]} · {r['status']} · {r['updatedAt'][:10]}"))
    for p in sorted(glob.glob(os.path.join(c["linear_dir"], "kararlar-*.md"))):
        slug = os.path.basename(p).replace("kararlar-", "").rsplit("-", 3)[0]
        try:
            with io.open(p, encoding="utf-8") as f:
                for i, ln in enumerate(f, 1):
                    t = ln.strip()
                    if t and BEKLEYEN_DESEN.search(t) and not t.startswith("*20"):
                        L.append((f"Kararlar/{slug}:{i}", temiz(t)[:180]))
        except OSError:
            continue
    ep = os.path.join(c["hedef"], "recep-bekleyen.md")
    if os.path.exists(ep):
        with io.open(ep, encoding="utf-8") as f:
            for ln in f:
                if ln.startswith("- "):
                    L.append(("OPS listesi", temiz(ln[2:].strip())[:180]))
    return L


def ekran(c, adimlar):
    s = santiye(c)
    bekleyen = senden_bekleyen(c, (s or {}).get("rows"))
    yol, sn, df, bd, kr, ay = c.get("yol"), c.get("sinav"), c.get("defter"), c.get("budama"), c.get("kararlar"), c.get("ayna")
    kirmizi_adimlar = [a for a in adimlar if a["durum"] == "KIRMIZI"]
    kosum = "KURU" if c["kuru"] else ("KIRMIZI" if kirmizi_adimlar else "YESIL")
    tarih, damga = c["tarih"], c["damga"]
    L = [f"# Gün kapanışı {tarih} — damga {damga} · koşum {kosum}"
         + (f" (kırmızı adım: {', '.join(str(a['no']) for a in kirmizi_adimlar)})" if kirmizi_adimlar else "")
         + (" · KURU koşum (defter yazımı/silme yok; Linear'a yazılmadı; state.json'a kapı damgası YAZILMADI)" if c["kuru"] else ""), ""]
    # --- seviye satiri (tek satir)
    sev = []
    if c["kuru"]:
        sev.append(f"KURU KOŞUM — DEFTER BAYAT: {len(df['degisen']) if df else '?'} demet EŞİTLENMEDİ")
    if s:
        sev.append(f"Linear %{s['yuzde']} bitti ({s['done']}/{s['toplam'] - s['canceled']}) · açık {s['acik']} (In Progress {s['started']} + Todo {s['unstarted']}; Backlog {s['backlog']} ayrı) · bayat açık {s['bayat']} · bloklu (bekleyen) {s['bloklu']} · Recep kapısında {s['recep']} · sahipsiz açık {s['etiketsiz']}"
                   + (f" (BAYAT JSON {s['damga']}; adım 3 bu koşumda yeşil değil)" if s["bayat_json"] else ""))
        if s["aktif_kt"]:
            sev.append("aşama (In Progress olan KT): " + " · ".join(f"{hucre(k)} {d}/{t}" for k, d, t, _ in s["aktif_kt"]))
    else:
        sev.append("Linear ÖLÇÜLMEDİ (is-dagilimi JSON yok)")
    sev.append(f"yol haritası {yol['yesil']} yeşil / {yol['kirmizi']} kırmızı / {yol['kanitsiz']} kanıtsız ({yol['satir']}/{yol['tavan']})" if yol else "yol haritası ÖLÇÜLMEDİ")
    if df:
        es = df["esitle"]
        t2 = df.get("tur2")
        kaynak = f"defter {bd['kaynak']}/{bd['beklenen'] if bd['beklenen'] is not None else '?'} kaynak" if bd else f"defter {df['demet']} demet"
        if c["kuru"]:
            sev.append(f"{kaynak} · eşitlendi 0 / bekleyen {len(df['degisen'])} (--kuru)")
        elif t2:
            bek = len(t2["degisen"]) - t2["esitlenen"]
            sev.append(f"{kaynak} · eşitlendi {df['esitlenen'] + t2['esitlenen']} / bekleyen {bek}" + (" — DEFTER BAYAT" if bek else " — güncel"))
        elif es == "gerekmedi" or es.endswith("demet yenilendi"):
            sev.append(f"{kaynak} · 1. tur eşitlendi {df['esitlenen']}/{len(df['degisen'])} · 2. tur (demet 11) adım 12'de, bu belgeden sonra (kanıt state.json)")
        else:
            sev.append(f"{kaynak} · DEFTER BAYAT: {len(df['degisen'])} demet eşitlenmedi (1. tur {es})")
    elif bd:
        sev.append(f"defter {bd['kaynak']}/{bd['beklenen'] if bd['beklenen'] is not None else '?'} kaynak (eşitle ölçülmedi)")
    else:
        sev.append("defter ÖLÇÜLMEDİ")
    if sn and sn.get("toplam"):
        sev.append(f"sınav {sn['yesil']}/{sn['toplam']}" + ("" if sn.get("kosuldu") else f" (son {sn['damga']}, bu koşumda atlandı)"))
    else:
        sev.append("sınav sonucu YOK")
    sev.append(f"Linear ayna {ay['linear']}" if ay else "Linear ayna ÖLÇÜLMEDİ")
    sev.append(f"kırmızı adım {len(kirmizi_adimlar)}")
    sev.append(f"senden bekleyen {len(bekleyen)}")
    L += ["**SEVİYE:** " + " · ".join(sev), ""]
    # --- §0 SENDEN BEKLEYEN (REC-175): Recep once bunu okur; uc kaynak (Linear etiket/baslik · Kararlar aynalari · OPS listesi)
    L += [f"## §0 SENDEN BEKLEYEN ({len(bekleyen)}) — karar ya da onayın gereken kalemler", "",
          "Kaynak: Linear (açık iş + \"Recep kapısı\" etiketi ya da başlıkta Recep) · Kararlar aynaları (satırda \"tek başına sorulur / karar bekliyor / Recep'e sor\") · OPS listesi (`recep-bekleyen.md`, elle). Aynı karar iki kaynakta görünebilir; görünmemekten iyidir.", ""]
    L += [f"- [{k}] {t}" for k, t in bekleyen] or ["- (yok)"]
    L.append("")
    # --- ayrintili satirlar
    if s:
        L.append(f"- ŞANTİYE: Linear %{s['yuzde']} bitti ({s['done']} Done / {s['toplam'] - s['canceled']} = {s['toplam']}−{s['canceled']} Canceled) · açık {s['acik']} (In Progress {s['started']} + Todo {s['unstarted']}; Backlog {s['backlog']} ayrı) · bayat açık (>{BAYAT_GUN} gün) {s['bayat']} · bloklu açık {s['bloklu']} · Recep kapısında bekleyen {s['recep']} · etiketsiz açık {s['etiketsiz']} (sahipsiz iş = borç) · kaynak damgası {s['damga']}" + (" **BAYAT JSON**" if s["bayat_json"] else ""))
    else:
        L.append("- ŞANTİYE: ÖLÇÜLMEDİ — is-dagilimi JSON yok (adım 3 kırmızı)")
    if yol:
        L.append(f"- YOL HARİTASI: {yol['satir']}/{yol['tavan']} satır · YESIL {yol['yesil']} · KIRMIZI {yol['kirmizi']}" + (f" ({', '.join(yol['kirmizi_ids'])})" if yol["kirmizi_ids"] else "") + f" · KANITSIZ {yol['kanitsiz']} · ölçülmemiş kanıt {yol['olculmemis']} · canlı {yol['canli']}")
    else:
        L.append("- YOL HARİTASI: ÖLÇÜLMEDİ (adım 7 koşmadı/kırmızı)")
    if df or bd:
        p = []
        if bd:
            p.append(f"{bd['kaynak']} kaynak / beklenen {bd['beklenen'] if bd['beklenen'] is not None else 'ÖLÇÜLEMEDİ'} parça ({bd['demet']} demet)")
        if df:
            p.append(f"değişen {len(df['degisen'])}" + (f" ({', '.join(df['degisen'])})" if df["degisen"] else "") + f" · eşitle 1. tur: {df['esitle']}")
        if bd:
            p.append(f"budanan {bd['budanan']}" + (f" (yetim {len(bd['yetim'])}: {', '.join(t for t, _ in bd['yetim'])})" if bd["yetim"] else ""))
            if bd["eksik"]:
                p.append(f"EKSİK parça {len(bd['eksik'])} ({', '.join(bd['eksik'])})")
            if bd["en_eski"]:
                p.append(f"en eski kaynak {bd['en_eski'][0]} {bd['en_eski'][1]} (§10.7 doğrulama yarısı)")
            if bd["hazir_degil"]:
                p.append(f"hazır olmayan {len(bd['hazir_degil'])} ({', '.join(bd['hazir_degil'])})")
        p.append("auth " + ("YESIL" if c.get("auth_ok") else "KIRMIZI" if c.get("auth_ok") is False else "ölçülmedi"))
        L.append("- DEFTER: " + " · ".join(p))
    else:
        L.append("- DEFTER: ÖLÇÜLMEDİ (adım 5/6 koşmadı)")
    if sn and sn.get("toplam"):
        L.append(f"- SINAV: {sn['yesil']}/{sn['toplam']} yeşil · kırmızı {sn['kirmizi']}" + (f" ({', '.join(i for i, _ in sn['kirmizilar'])})" if sn["kirmizilar"] else "") + f" · cevapsız {sn['cevapsiz']} · damga {sn['damga']}" + ("" if sn.get("kosuldu") else " · bu koşumda KOŞULMADI; belge kanıtları bu sonuca dayanır"))
    else:
        L.append("- SINAV: sonuç dosyası YOK — belge kanıtları KANITSIZ")
    ayna = []
    if kr:
        ayna += [f"Kararlar {b['slug']} {b['durum'].replace('BAYAT→YENILENDI', 'BAYAT→YENİLENDİ')} (Linear {b['linear'][11:19]}Z)" for b in kr["belgeler"]]
        if kr["kapsam_disi"]:
            ayna.append(f"kapsam dışı Kararlar belgesi {kr['kapsam_disi']} (--tumu)")
        if kr["yabanci"]:
            ayna.append(f"yabancı kopya {kr['yabanci']} (kaynak_id farklı/damgasız; dokunulmadı)")
    else:
        ayna.append("Kararlar aynası ÖLÇÜLMEDİ")
    ayna.append(f"is-dagilimi {tarih} yenilendi ({c['linear']['kayit']} kayıt)" if c.get("linear") else "is-dagilimi YENİLENMEDİ")
    ayna.append(f"yol haritası → Linear belge {ay['linear']} (kaynak_updatedAt {ay['updatedAt'][:16]}Z; `{ay['dosya']}`)" if ay else "yol haritası Linear aynası ÖLÇÜLMEDİ")
    L.append("- AYNA: " + " · ".join(ayna))
    g = []
    g.append(f"pano 1 dosya {c['pano']['bayt']} bayt ({c['pano']['not']} not, 7 gün)" if c.get("pano") else "pano ÖLÇÜLMEDİ")
    if c.get("gunluk"):
        g.append(f"konuşma günlüğü kökte {c['gunluk']['gun']} gün {c['gunluk']['mb']:.1f} MB (§10.6 {GUNLUK_PENCERE} gün sınırı, eşik {c['gunluk']['esik']}: {c['gunluk']['pencere']}" + (f"; arşive taşındı {len(c['gunluk']['tasinan'])}" if c["gunluk"]["tasinan"] else "") + ")")
    else:
        g.append("konuşma günlüğü ÖLÇÜLMEDİ")
    g.append(f"sır süzgeci vuruş: pano {(c.get('pano') or {}).get('sir', 0)} · günlük kökü toplamı {(c.get('gunluk') or {}).get('sir', 0)} · Linear {(c.get('linear') or {}).get('sir', 0) + (kr or {}).get('sir', 0)} (değer basılmaz)")
    L.append("- GÜRÜLTÜ: " + " · ".join(g))
    if c["kuru"]:
        L.append("- AÇILIŞ KAPISI: KURU koşum — state.json'a `gun_kapanisi` damgası YAZILMADI (kapı bu koşumu görmez); canlı koşum gerekli")
    else:
        L.append(f"- AÇILIŞ KAPISI: `scripts/nlm/acilis_kapisi.py` state.json `gun_kapanisi.damga` okur — sonraki koşum en geç {(c['simdi'] + dt.timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%SZ')}; 24 saatten eskiyse KIRMIZI (çıkış 3), gelecek tarihse HATA (çıkış 2); damga elle yazılmaz")
    # --- §1 adim tablosu (sure YOK: ekran bayt-ayni kalsin; sureler konsolda ve state.json'da)
    L += ["", "## §1 Adım tablosu", "", "Sözlük: durum = adım rengi (YESIL/KIRMIZI/ATLANDI/SIRADA) · kalem = §10.8 durum sözcüğü (YAPILDI/AÇIK/YARIN/ATLANDI) · çıkış 3 = 'değişen var / kırmızı satır var', adımı kırmızı yapmaz.", "",
          "| # | adım | durum | kalem | ölçüm | çıkış | dosya |", "|---|---|---|---|---|---:|---|"]
    for a in adimlar:
        L.append(f"| {a['no']} | {a['ad']} | {a['durum']} | {KALEM.get(a['durum'], a['durum'])} | {hucre(a['olcum'])} | {a['rc'] if a['rc'] is not None else '-'} | {hucre(a.get('dosya') or '-')} |")
    # --- §2 santiye
    L += ["", "## §2 Linear şantiye özeti", ""]
    if s:
        rows = s["rows"]
        L += [f"Kaynak: `{rel(c['is_json'])}` · damga {s['damga']}" + (" **BAYAT JSON**" if s["bayat_json"] else "") + " · % bitti = Done / (Toplam − Canceled). Sorumluluk = şerit etiketi.", "",
              "### Proje başına", "", "| Proje | Toplam | Done | In Progress | Todo | Backlog | Canceled | % bitti |", "|---|---:|---:|---:|---:|---:|---:|---:|"]
        for p in sorted({r["project"] or "(projesiz)" for r in rows}):
            pr = [r for r in rows if (r["project"] or "(projesiz)") == p]
            d = sum(1 for r in pr if r["statusType"] == "completed"); st = sum(1 for r in pr if r["statusType"] == "started")
            u = sum(1 for r in pr if r["statusType"] == "unstarted"); b = sum(1 for r in pr if r["statusType"] in ("backlog", "triage"))
            cc = sum(1 for r in pr if r["statusType"] == "canceled")
            L.append(f"| {hucre(p)} | {len(pr)} | {d} | {st} | {u} | {b} | {cc} | {yuzde_str(d, len(pr), cc)} |")
        L.append(f"| **TOPLAM** | {s['toplam']} | {s['done']} | {s['started']} | {s['unstarted']} | {s['backlog']} | {s['canceled']} | {s['yuzde']}% |")
        L += ["", "### Kilometre taşı başına (hangi kat / hangi aşama)", "", "| Proje | Kilometre taşı | Done/Toplam | In Progress | Todo | Backlog | bayat |", "|---|---|---:|---:|---:|---:|---:|"]
        for (p, k), rs in sorted(s["kt"].items()):
            d = sum(1 for r in rs if r["statusType"] == "completed"); st = sum(1 for r in rs if r["statusType"] == "started")
            u = sum(1 for r in rs if r["statusType"] == "unstarted"); b = sum(1 for r in rs if r["statusType"] in ("backlog", "triage"))
            cc = sum(1 for r in rs if r["statusType"] == "canceled"); by = sum(1 for r in rs if r["_bayat"])
            L.append(f"| {hucre(p)} | {hucre(k)} | {d}/{len(rs) - cc} | {st} | {u} | {b} | {by} |")
        L += ["", "### Şerit (etiket) başına", "", f"| Şerit | In Progress | Todo | Backlog | bayat (>{BAYAT_GUN}g) | bloklu | Done | % bitti |", "|---|---:|---:|---:|---:|---:|---:|---:|"]
        for se in s["seritler"]:
            sr = [r for r in rows if se in r["_serit"]]
            d = sum(1 for r in sr if r["statusType"] == "completed"); st = sum(1 for r in sr if r["statusType"] == "started")
            u = sum(1 for r in sr if r["statusType"] == "unstarted"); b = sum(1 for r in sr if r["statusType"] in ("backlog", "triage"))
            cc = sum(1 for r in sr if r["statusType"] == "canceled"); by = sum(1 for r in sr if r["_bayat"]); bl = sum(1 for r in sr if r["_bloklu"])
            L.append(f"| {se} | {st} | {u} | {b} | {by} | {bl} | {d} | {yuzde_str(d, len(sr), cc)} |")
        L.append(f"\nDipnot: çoklu etiketli {s['coklu']} iş her şeridinde sayılır; P0x-* etiketleri Q-Validator altında; \"{RECEP}\" etiketi şerit değil kapıdır; bloklu = Linear 'blocked by' ilişkisi taşıyan bitmemiş iş (Backlog dahil).")
        # --- §3 yarin kuyrugu
        L += ["", "## §3 YARIN KUYRUĞU (şerit başına açık işler; kalem = YARIN)", "",
              "Sıra: In Progress (öncelik 1→4, önceliksiz sona; sonra son güncelleme) · Todo ilk 5 · Backlog yalnız sayı. BAYAT = son güncelleme > 7 gün. BEKLİYOR = Linear 'blocked by' ilişkisi.", ""]

        def satir(r):
            return (f"- {r['identifier']} · {r['status']} · {hucre(r['title'][:70])} · {r['updatedAt'][:10]}"
                    + (f" · KT: {hucre(r['projectMilestone'])}" if r.get("projectMilestone") else "")
                    + (f" · BEKLİYOR: {', '.join(r['blockedBy'])}" if r.get("blockedBy") else "") + (" · **BAYAT**" if r["_bayat"] else ""))

        for se in s["seritler"]:
            if se in (RECEP, ETIKETSIZ):
                continue
            sr = [r for r in rows if se in r["_serit"]]
            ip = sorted([r for r in sr if r["statusType"] == "started"], key=oncelik)
            td = sorted([r for r in sr if r["statusType"] == "unstarted"], key=oncelik)
            bl = sum(1 for r in sr if r["statusType"] in ("backlog", "triage"))
            bek = sum(1 for r in sr if r["_bloklu"])
            L.append(f"### {se} (In Progress {len(ip)} · Todo {len(td)} · Backlog {bl} · bekleyen {bek})")
            L.append("")
            L += [satir(r) for r in ip] or ["- (In Progress yok)"]
            if td:
                L.append(f"- Todo (ilk {min(5, len(td))}/{len(td)}):")
                L += ["  " + satir(r) for r in td[:5]]
            bb = sorted([r for r in sr if r["statusType"] in ("backlog", "triage") and r["_bloklu"]], key=oncelik)
            L.append(f"- Backlog: {bl} iş (listelenmez" + (f"; bloklu {len(bb)}: " + " · ".join(f"{r['identifier']} BEKLİYOR {', '.join(r['blockedBy'])}" for r in bb) if bb else "") + ")")
            L.append("")
        rk = sorted([r for r in rows if r["_acik"] and RECEP in r["_serit"]], key=oncelik)
        L += [f"### Recep'te bekleyen (etiket \"{RECEP}\", açık {len(rk)})", ""] + ([satir(r) for r in rk] or ["- (yok)"]) + [""]
        et = sorted([r for r in rows if r["_acik"] and ETIKETSIZ in r["_serit"]], key=oncelik)
        L += [f"### Sahipsiz (etiketsiz açık iş {len(et)} — borç)", ""] + ([satir(r) for r in et] or ["- (yok)"])
    else:
        L.append("ÖLÇÜLMEDİ — is-dagilimi JSON yok.")
    # --- §4 defter
    L += ["", "## §4 Defter durumu", ""]
    if df:
        L.append(f"- olc: {len(df['degisen'])} değişen / {df['demet']} demet" + (f" — {', '.join(df['degisen'])}" if df["degisen"] else "") + f" · eşitle 1. tur: {df['esitle']}")
        if df.get("tur2"):
            L.append(f"- 2. tur (adım 12): {len(df['tur2']['degisen'])} değişen · {df['tur2']['durum']}")
    if bd:
        L.append(f"- kaynak {bd['kaynak']} · demet {bd['demet']} · beklenen parça {bd['beklenen'] if bd['beklenen'] is not None else 'ÖLÇÜLEMEDİ (kökü olmayan demet)'} · budanan {bd['budanan']}")
        for t, sebep in bd["yetim"]:
            L.append(f"  - yetim: {t} — {sebep}" + (" (--kuru: silinmedi)" if c["kuru"] else f" (silinmedi: {bd['kapi']})" if t in bd["kapida"] else ""))
        if bd["eksik"]:
            L.append(f"- EKSİK beklenen parça {len(bd['eksik'])}: {', '.join(bd['eksik'])}" + (" — state anahtarı düşürüldü, 2. tur eşitle yükler" if bd["dusurulen"] else " — (--kuru: state'e dokunulmadı)" if c["kuru"] else ""))
        if bd["bozuk"]:
            L.append(f"- BOZUK (status error) {len(bd['bozuk'])}: {', '.join(bd['bozuk'])}")
        if bd["mukerrer"]:
            L.append(f"- mükerrer başlık {len(bd['mukerrer'])}: {', '.join(bd['mukerrer'])} (en yeni kalır)")
        if bd["yabanci"]:
            L.append(f"- YABANCI kaynak {len(bd['yabanci'])}: {', '.join(bd['yabanci'])} (üretilmiş ad kalıbı dışı; silinmez, §10.4 haftalık öz-denetim)")
        if bd["olculemeyen"]:
            L.append(f"- ÖLÇÜLEMEYEN demet {len(bd['olculemeyen'])}: {'; '.join(bd['olculemeyen'])} (parça kararı verilmedi)")
        if bd["hazir_degil"]:
            L.append(f"- hazır olmayan kaynak {len(bd['hazir_degil'])}: {', '.join(bd['hazir_degil'])} (source list --status preparing|error)")
        if bd["en_eski"]:
            L.append(f"- en eski kaynak damgası: {bd['en_eski'][0]} {bd['en_eski'][1]} (§10.7 bayatlık ölçüsünün doğrulama yarısı; deftere sorma yarısı haftalık, elle)")
        if bd["state_bayat"]:
            L.append(f"- state.json bayat anahtar {len(bd['state_bayat'])}: {', '.join(bd['state_bayat'])} (manifestte/defterde yok; zararsız, elle temizlenir)")
    if not df and not bd:
        L.append("- ÖLÇÜLMEDİ (adım 5/6 koşmadı)")
    L.append("- auth ön-kapı: " + ("YESIL (`notebooklm source list`)" if c.get("auth_ok") else "KIRMIZI — `notebooklm login`" if c.get("auth_ok") is False else "ölçülmedi"))
    L.append("- NOT: demet 11 (yol-haritasi-durum, hafiza-sinavi-sonuc, gun-kapanisi) bu koşumun 7/8/9 çıktılarıyla değişir; 2. tur eşitleme (adım 12) bu belgeden SONRA koşar ve aynı kapanışta deftere taşır (§10.3); kanıt state.json `gun_kapanisi.seviye.defter_tur2`.")
    # --- §5 yol haritasi + sinav + ayna
    L += ["", "## §5 Yol haritası + sınav skoru + Linear ayna", ""]
    if yol:
        L.append(f"- Yol haritası {yol['satir']}/{yol['tavan']} · YESIL {yol['yesil']} · KIRMIZI {yol['kirmizi']} · KANITSIZ {yol['kanitsiz']} · ölçülmemiş kanıt {yol['olculmemis']} · canlı {yol['canli']} (`{rel(yol['dosya'])}`)")
        for i in yol["kirmizi_ids"]:
            y, k = yol["kirmizi_kanit"].get(i, ("?", "?"))
            L.append(f"  - KIRMIZI {i} (beyan {yol['kirmizi_durum'].get(i, '?')}): {hucre(y)} — {hucre(k)}")
    else:
        L.append("- Yol haritası ÖLÇÜLMEDİ")
    if sn and sn.get("toplam"):
        L.append(f"- Sınav {sn['yesil']}/{sn['toplam']} yeşil · kırmızı {sn['kirmizi']} · cevapsız {sn['cevapsiz']} · damga {sn['damga']}" + (" · bu koşumda koşuldu" if sn.get("kosuldu") else " · bu koşumda atlandı"))
        for i, n in sn["kirmizilar"]:
            L.append(f"  - KIRMIZI {i}: {hucre(n)}")
    else:
        L.append("- Sınav sonucu YOK")
    L.append(f"- Linear ayna: {ay['linear']} · `{ay['dosya']}` · kaynak_updatedAt {ay['updatedAt']}" if ay else "- Linear ayna: ÖLÇÜLMEDİ (adım 11 koşmadı)")
    # --- §6 curudu / uyari (§10.8: CURUDU = beyan yesil, kanit kirmizi; ACIK = bilincli borc)
    L += ["", "## §6 ÇÜRÜDÜ / uyarı", ""]
    uy = []
    for a in kirmizi_adimlar:
        uy.append(f"- KIRMIZI adım {a['no']} {a['ad']} (çıkış {a['rc']}): {hucre(a['olcum'])}")
        uy += [f"  - `{hucre(sat)}`" for sat in a["son"]]
    for a in adimlar:
        if a["durum"] == "ATLANDI" and not a["olcum"].endswith("--adimlar disi"):
            uy.append(f"- ATLANDI adım {a['no']} {a['ad']}: {hucre(a['olcum'])}")
    if yol and yol["kirmizi"]:
        curuyen = [i for i in yol["kirmizi_ids"] if yol["kirmizi_durum"].get(i) in ("ACIK", "KAPALI-HAZIR")]
        borc = [i for i in yol["kirmizi_ids"] if i not in curuyen]
        if curuyen:
            uy.append(f"- ÇÜRÜDÜ · {tarih}: yol haritası {', '.join(curuyen)} — beyan (durum ACIK/KAPALI-HAZIR) yeşil derken kanıt KIRMIZI (§5)")
        if borc:
            uy.append(f"- AÇIK (bilinçli borç): yol haritası KIRMIZI {', '.join(borc)} — durum PLANLI/YAPILIYOR/BEKLIYOR, kod henüz yok (§5)")
    if sn and sn.get("kirmizi"):
        uy.append(f"- Sınav KIRMIZI {sn['kirmizi']}: {', '.join(i for i, _ in sn['kirmizilar'])} — önce cevap okunur, sonra belge suçlanır")
    if c.get("gunluk") and not c["gunluk"]["pencere"].startswith("uygulandi"):
        uy.append(f"- §10.6 konuşma günlüğü {GUNLUK_PENCERE} gün sınırı: {c['gunluk']['pencere']} ({c['gunluk']['gun']} gün deftere gidiyor)")
    if bd and bd["yetim"] and c["kuru"]:
        uy.append(f"- Yetim kaynak {len(bd['yetim'])} listelendi, --kuru olduğu için silinmedi")
    if bd and bd["kapida"]:
        uy.append(f"- Fazla parça {len(bd['kapida'])} silinmedi (kapı: {bd['kapi']}); bir sonraki yeşil eşitlemede budanır")
    if bd and bd["eksik"]:
        uy.append(f"- Defterde EKSİK parça {len(bd['eksik'])}: {', '.join(bd['eksik'])}")
    if kr and kr["kapsam_disi"]:
        uy.append(f"- Linear'da kapsam dışı {kr['kapsam_disi']} Kararlar belgesi aynasız (Altyapı/Marka/SEO/Teklif; kapsam OPS kararı, `--tumu`)")
    if kr and kr["design_bayat"]:
        uy.append(f"- design/ altında bayat/çift Kararlar kopyası {len(kr['design_bayat'])} (§10.2; yalnız rapor — OPS kararı: sil ya da adım 4 oraya da yazsın):")
        uy += [f"  - {hucre(x)}" for x in kr["design_bayat"]]
    if s and s["bayat_json"]:
        uy.append(f"- ŞANTİYE sayıları BAYAT JSON'dan ({s['damga']}); adım 3 bu koşumda yeşil değil")
    if c["kuru"]:
        uy.append("- KURU koşum: defter eşitlenmedi, Linear'a yazılmadı, hiçbir dosya silinmedi/taşınmadı, kapı damgası yazılmadı — canlı kapanış değildir")
    L += uy or ["- (yok)"]
    L += ["", "---", f"üretilmiş: scripts/nlm/gun_kapanisi.py · damga {damga} · kaynak: is-dagilimi JSON, yol-haritasi-durum.md, hafiza-sinavi-sonuc.md, notebooklm source list · elle düzenlenmez; yenileme: gün kapanışı ritüeli", ""]
    return "\n".join(L)


def adim9(c, a, adimlar, secili):
    hedef = os.path.join(c["hedef"], f"gun-kapanisi-{c['tarih']}.md")
    # belge kendi adimini ve sirada bekleyenleri (secili sirada 9'dan sonrakiler) dogru gostersin (render bu adimin icinde olur)
    a["durum"], a["olcum"], a["dosya"] = "YESIL", f"bu belge (gun-kapanisi-{c['tarih']}.md)", rel(hedef)
    sonra = secili[secili.index(9) + 1:] if 9 in secili else []
    ile = {x["no"]: x for x in adimlar}
    for n in sonra:
        if ile[n]["durum"] == "ATLANDI":
            ile[n]["durum"], ile[n]["olcum"] = "SIRADA", "bu belgeden sonra kosar; kanit state.json gun_kapanisi (kirmizi olursa bu belgeye satir eklenir)"
    metin, sir = sir_suz(ekran(c, adimlar))  # depoya yazilan metin: sir + makine yolu suzgeci
    metin, yol = yol_suz(metin)
    os.makedirs(c["hedef"], exist_ok=True)
    with io.open(hedef, "w", encoding="utf-8", newline="\n") as f:
        f.write(metin)
    silinen, yeni, liste = tek_kopya(os.path.join(c["hedef"], "gun-kapanisi-*.md"), hedef, c["tarih"], c["kuru"])
    c["ekran"] = hedef
    a["durum"], a["dosya"] = "YESIL", rel(hedef)
    a["olcum"] = (f"{len(metin.encode('utf-8'))} bayt · {metin.count(chr(10))} satır · sır süzgeci {sir} · makine yolu {yol} · eski gün dosyası silindi {len(silinen)}"
                  + (f" ({', '.join(silinen)})" if silinen else "") + (f" · KURU: silinecek {len(liste)}" if liste else ""))
    if yeni:
        kirmizi(a, a["olcum"] + f" · daha yeni tarihli gün dosyası var, dokunulmadı: {', '.join(yeni)}")


def seviye(c, adimlar):
    s = santiye(c) if c.get("is_json") else None
    yol, sn, bd, df, ay = c.get("yol") or {}, c.get("sinav") or {}, c.get("budama") or {}, c.get("defter") or {}, c.get("ayna") or {}
    t2 = df.get("tur2") or {}
    bekleyen = (len(t2["degisen"]) - t2["esitlenen"]) if t2 else (len(df.get("degisen", [])) if df and c["kuru"] else None)
    return {"kosum": "KURU" if c["kuru"] else ("KIRMIZI" if any(a["durum"] == "KIRMIZI" for a in adimlar) else "YESIL"), "kuru": c["kuru"],
            "linear_yuzde": s["yuzde"] if s else None, "linear_toplam": s["toplam"] if s else None, "done": s["done"] if s else None,
            "acik": s["acik"] if s else None, "in_progress": s["started"] if s else None, "todo": s["unstarted"] if s else None,
            "backlog": s["backlog"] if s else None, "bayat_acik": s["bayat"] if s else None, "bloklu_acik": s["bloklu"] if s else None,
            "recep_kapisi_acik": s["recep"] if s else None, "etiketsiz_acik": s["etiketsiz"] if s else None,
            "linear_bayat": s["bayat_json"] if s else None, "asama": [f"{k} {d}/{t}" for k, d, t, _ in s["aktif_kt"]] if s else None,
            "yh_satir": yol.get("satir"), "yh_yesil": yol.get("yesil"), "yh_kirmizi": yol.get("kirmizi"), "yh_kanitsiz": yol.get("kanitsiz"),
            "yh_olculmemis_kanit": yol.get("olculmemis"), "yh_kirmizi_ids": yol.get("kirmizi_ids"),
            "defter_kaynak": bd.get("kaynak"), "defter_beklenen": bd.get("beklenen"), "defter_degisen": len(df.get("degisen", [])) if df else None,
            "defter_esitlenen": df.get("esitlenen") if df else None, "defter_esitle": df.get("esitle") if df else None,
            "defter_tur2": t2 or None, "defter_bekleyen": bekleyen, "defter_eksik": bd.get("eksik"),
            "defter_budanan": bd.get("budanan"), "defter_auth": c.get("auth_ok"),
            "sinav_yesil": sn.get("yesil"), "sinav_kirmizi": sn.get("kirmizi"), "sinav_cevapsiz": sn.get("cevapsiz"), "sinav_damga": sn.get("damga"),
            "sinav_kosuldu": sn.get("kosuldu"), "linear_ayna": ay.get("linear")}


def adim10(c, a, adimlar, t_baslangic):
    a["durum"], a["dosya"] = "YESIL", rel(c["state"])  # yazimdan ONCE: state.json kendi adimini SIRADA degil YESIL kaydetsin
    state = pts.oku_json(c["state"], {"surum": 1, "demetler": {}})
    kayit = {"damga": c["damga"], "kuru": c["kuru"], "adimlar": {f"{x['no']:02d}-{x['ad']}": x["durum"] for x in adimlar}, "seviye": seviye(c, adimlar),
             "sureler": {f"{x['no']:02d}": round(x["sure"], 1) for x in adimlar if x["sure"]}, "sure_toplam": round(time.monotonic() - t_baslangic, 1),
             "ekran": rel(c["ekran"]) if c.get("ekran") else None, "sonraki_en_gec": (c["simdi"] + dt.timedelta(hours=24)).strftime("%Y-%m-%dT%H:%M:%SZ")}
    notlar = []
    if c["kuru"]:
        state["gun_kapanisi_kuru"] = kayit  # kapi bu anahtari OKUMAZ
        eski = state.get("gun_kapanisi") or {}
        if eski.get("kuru") or (eski.get("seviye") or {}).get("kuru"):
            state.pop("gun_kapanisi", None); notlar.append("eski KURU kaydi 'gun_kapanisi'den dusuruldu (kapiya sayilmaz)")
        anahtar = "gun_kapanisi_kuru"
    else:
        state["gun_kapanisi"] = kayit
        if state.pop("gun_kapanisi_kuru", None) is not None:
            notlar.append("kuru kaydi temizlendi")
        anahtar = "gun_kapanisi"
    pts.yaz_json(c["state"], state)
    a["olcum"] = f"{anahtar} anahtari yazildi · {len(state.get('demetler', {}))} demet anahtarina dokunulmadi" + (" · " + " · ".join(notlar) if notlar else "")


# ---------------------------------------------------------------- ana akis
def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--kuru", action="store_true", help="defter yazimi/silme yok; depo ve ev dizininde silme/tasima yok (listelenir); Linear'a yazilmaz; state.json'a gun_kapanisi_kuru")
    ap.add_argument("--atla-sinav", action="store_true")
    ap.add_argument("--sinav-sorular", default="", help='alt kume, orn "S01 S03"')
    ap.add_argument("--simdi", default=None, help="ISO UTC, 'Z' ya da ofset ZORUNLU; damga ve dosya tarihleri buradan (determinizm). Gelecek tarih HATA; 24 saatten geride yalniz --kuru")
    ap.add_argument("--hedef", default=os.path.join("docs", "proje-takip"))
    ap.add_argument("--adimlar", default=None, help='alt kume, verilen sirayla, virgullu tam sayi; orn "1,3,7"')
    a = ap.parse_args()
    t_baslangic = time.monotonic()
    gercek = dt.datetime.now(dt.timezone.utc)
    uyari = []
    if a.simdi:
        if not re.search(r"(Z|[+-]\d\d:?\d\d)$", a.simdi.strip()):
            print("HATA: --simdi 'Z' ya da saat ofseti ister (yerel saat varsayilmaz); orn 2026-09-06T14:30:00Z"); return 2
        try:
            simdi = zaman(a.simdi.strip())
        except ValueError:
            print("HATA: --simdi ISO-8601 degil"); return 2
        fark = (simdi - gercek).total_seconds()
        if fark > 300:
            print(f"HATA: --simdi gelecek tarihli ({simdi:%Y-%m-%dT%H:%M:%SZ} > simdi {gercek:%Y-%m-%dT%H:%M:%SZ}); kapi kor olur (cetvel §5)"); return 2
        if fark < -86400:
            if not a.kuru:
                print(f"HATA: --simdi gercek saatten {int(-fark // 3600)} saat geride; eski tarihli CANLI kapanis kosulmaz (tek kopya kurali yeni gunu vurur) — --kuru ile denenebilir"); return 2
            uyari.append(f"--simdi {int(-fark // 3600)} saat geride (kuru)")
    else:
        simdi = gercek
    hedef = a.hedef if os.path.isabs(a.hedef) else os.path.join(REPO, a.hedef)
    m = pts.oku_json(pts.MANIFEST, None)
    if m is None:
        print("HATA: manifest yok:", rel(pts.MANIFEST))
        return 2
    c = {"simdi": simdi, "damga": simdi.strftime("%Y-%m-%dT%H:%M:%SZ"), "tarih": simdi.strftime("%Y-%m-%d"), "kuru": a.kuru,
         "atla_sinav": a.atla_sinav, "sinav_sorular": [s for s in a.sinav_sorular.split() if re.fullmatch(r"S\d+", s)],
         "hedef": hedef, "linear_dir": os.path.join(hedef, "linear"), "sinav_sonuc": os.path.join(hedef, "hafiza-sinavi-sonuc.md"),
         "state": os.path.join(hedef, "state.json"), "m": m}
    c["pts_env"] = {"VENTHUB_PROJE_TAKIP_STATE": c["state"]}  # proje_takip_sync ayni state dosyasini kullansin (--hedef sizintisi)
    if a.adimlar:
        secili = []
        for parca in a.adimlar.split(","):
            parca = parca.strip()
            if not parca.isdigit() or int(parca) not in ADIM_ADI:
                print(f"HATA: --adimlar virgullu tam sayi ister, 1..{max(ADIM_ADI)} arasi; gecersiz: '{parca}'"); return 2
            if int(parca) not in secili:
                secili.append(int(parca))
        if 6 in secili and 5 not in secili and not a.kuru:
            uyari.append("adim 6 adim 5'siz: 'fazla parca' silmesi kapida (esitle bu kosumda olculmedi)")
    else:
        secili = KOSUM_SIRASI
    adimlar = [{"no": n, "ad": ADIM_ADI[n], "durum": "ATLANDI", "olcum": "ATLANDI: --adimlar disi", "sure": 0.0, "rc": None, "son": [], "dosya": ""} for n in sorted(ADIM_ADI)]
    ile = {x["no"]: x for x in adimlar}
    print(f"GUN KAPANISI {c['tarih']} · damga {c['damga']} · repo {rel(REPO) or '.'} · {'KURU' if a.kuru else 'CANLI'} · adimlar {','.join(map(str, secili))}")
    for u in uyari:
        print(f"UYARI: {u}")
    for n in secili:
        x = ile[n]
        print(f"\n== [{n}] {x['ad']}")
        t0 = time.monotonic()
        try:
            if n == 9:
                adim9(c, x, adimlar, secili)
            elif n == 10:
                adim10(c, x, adimlar, t_baslangic)
            else:
                {1: adim1, 2: adim2, 3: adim3, 4: adim4, 5: adim5, 6: adim6, 7: adim7, 8: adim8, 11: adim11, 12: adim12}[n](c, x)
        except Exception as e:  # bir adimin patlamasi digerlerini durdurmaz; sebep gorunur
            kirmizi(x, f"beklenmeyen hata: {type(e).__name__}", rc=-1, son=[temiz(str(e))[:200]])
        x["sure"] = time.monotonic() - t0
        print(f"   olcum: {x['olcum']}")
        if x["durum"] == "KIRMIZI":
            print(f"   KIRMIZI (cikis {x['rc']}):")
            for sat in x["son"]:
                print("     | " + sat)
        print(f"   sure {mmss(x['sure'])} · {x['durum']}")
    # ekran yazildiktan SONRA kirmizi olan adim (10/12) belgeye satir olarak eklenir: belge ile konsol celismez
    if c.get("ekran") and 9 in secili:
        sonra_kir = [ile[n] for n in secili[secili.index(9) + 1:] if ile[n]["durum"] == "KIRMIZI"]
        if sonra_kir:
            with io.open(c["ekran"], "a", encoding="utf-8", newline="\n") as f:
                for x in sonra_kir:
                    f.write(temiz(f"\n- SONRADAN KIRMIZI adım {x['no']} {x['ad']} (çıkış {x['rc']}): {hucre(x['olcum'])}\n"))
                    for sat in x["son"]:
                        f.write(f"  - `{hucre(sat)}`\n")
    kir = [x for x in adimlar if x["durum"] == "KIRMIZI"]
    atl = [x for x in adimlar if x["durum"] == "ATLANDI"]
    print(f"\nSONUC: {'KIRMIZI' if kir else 'YESIL'}{' (KURU)' if a.kuru else ''} · kirmizi adim {len(kir)}" + (f" ({', '.join(str(x['no']) for x in kir)})" if kir else "")
          + f" · atlanan {len(atl)} · sure {mmss(time.monotonic() - t_baslangic)} · {rel(c['ekran']) if c.get('ekran') else 'ekran yazilmadi'} · cikis {3 if kir else 0}")
    return 3 if kir else 0


if __name__ == "__main__":
    sys.exit(main())
