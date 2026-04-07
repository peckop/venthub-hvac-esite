#!/usr/bin/env python3
"""
VentHub Ekip Orkestratörü — Diyalog Tabanlı Çok-Ajan Sistemi

Ajanlar kara tahta (blackboard.json) üzerinden birbirleriyle DOĞRUDAN konuşur.
Her ajan bir öncekine ismiyle hitap eder ve tartışma sonunda sentez üretilir.

Kullanım:
  python orchestrate_team.py "Ürün filtreleme mimarisi nasıl olmalı?"
  python orchestrate_team.py "Cache stratejisi" --skills superpowers-plan paralel-review --turlar 4 --sentez
"""

import sys
import json
import datetime
import argparse
import time
import os
from contextlib import contextmanager
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).parent
sys.path.insert(0, str(_SCRIPTS_DIR))
from spawn_subagent import spawn_subagent, find_repo_root  # type: ignore
import session_manager

REPO_ROOT = find_repo_root(Path.cwd())
BLACKBOARD = REPO_ROOT / "artifacts" / "superpowers" / "blackboard.json"
BLACKBOARD_LOCK = REPO_ROOT / "artifacts" / "superpowers" / "blackboard.lock"
KARAR_DIR  = REPO_ROOT / "artifacts" / "superpowers"
REGISTRY_DIR = REPO_ROOT / "registry"


# ─────────────────────────────────────────────
# Kara Tahta (Shared State) & Kilit
# ─────────────────────────────────────────────

@contextmanager
def bb_lock(timeout=10.0):
    """Kara tahta (blackboard) için dosya kilit mekanizması.
    Timeout süresinde lock alınamazsa RuntimeError fırlatır.
    """
    start = time.time()
    BLACKBOARD_LOCK.parent.mkdir(parents=True, exist_ok=True)
    acquired = False
    while time.time() - start < timeout:
        try:
            fd = os.open(str(BLACKBOARD_LOCK), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.close(fd)
            acquired = True
            break
        except OSError:
            time.sleep(0.1)
    
    if not acquired:
        raise RuntimeError(
            f"[bb_lock] Blackboard kilidi {timeout:.0f} saniyede alınamadı! "
            "Başka bir ajan çalışıyor olabilir."
        )
    
    try:
        yield
    finally:
        try:
            BLACKBOARD_LOCK.unlink(missing_ok=True)
        except OSError:
            pass

def bb_oku() -> dict:
    if BLACKBOARD.exists():
        return json.loads(BLACKBOARD.read_text(encoding="utf-8"))
    return {"turlar": []}


def bb_yaz(board: dict) -> None:
    BLACKBOARD.parent.mkdir(parents=True, exist_ok=True)
    BLACKBOARD.write_text(
        json.dumps(board, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )


# ─────────────────────────────────────────────
# Görev Oluşturucu — Diyalog Modu
# ─────────────────────────────────────────────

def gorev_olustur(konu: str, skill: str, ajan_id: str, board: dict, tur: int) -> str:
    """
    Her tur için diyalog tarzı görev oluşturur.
    - İlk tur: serbest konuşma (konu hakkında görüş sun)
    - Sonraki turlar: doğrudan "Ajan X," ile başlayan yanıt
    """
    turlar = board.get("turlar", [])

    # ── İlk konuşma (tarihi yok) ──
    if not turlar:
        return f"""Sen uzman bir ajansın. Konu: "{konu}"
Sen Kimsin: Ajan {ajan_id} | Uzmanlığın: {skill}
Bu Tur: {tur} (İLK KONUŞMA — sen başlıyorsun)
___

## Görevin:
1. "{skill}" perspektifinden konuya ilişkin somut görüşünü sun
2. Temel gerekçeleri açıkla (neden böyle düşünüyorsun)
3. Önerilen yaklaşımın risklerini de kabul et
4. Maksimum 300 kelime. Meta-yorum yok.

ÇIKTIN sadece analizin olsun. Tekrar etme, direkt yaz."""

    # ── Yanıt turu (önceki mesaj varsa) ──
    son = turlar[-1]
    son_ajan_id   = son["ajan_id"]
    son_mesaj     = son["mesaj"]

    # Bağlam: daha eski turlar (özet)
    gecmis_blok = ""
    if len(turlar) > 1:
        gecmis_blok = "\n### Daha Önceki Turlar (Bağlam Özeti)\n"
        for t in turlar[:-1]:
            ozet = t["mesaj"].replace("\n", " ")[:200]
            gecmis_blok += f"• Ajan {t['ajan_id']} (Tur {t['tur']}): {ozet}...\n"
        gecmis_blok += "\n"

    return f"""Sen uzman bir ajansın. Konu: "{konu}"
Sen Kimsin: Ajan {ajan_id} | Uzmanlığın: {skill}
Bu Tur: {tur} (YANIT TURU)
{gecmis_blok}
### Yanıtlayacağın Mesaj — Ajan {son_ajan_id} (Tur {son['tur']}):
{son_mesaj}

___
## Görevin:
1. İLK SATIR MUTLAKA: "Ajan {son_ajan_id}," ile başla — ona doğrudan konuş
2. Katıldığın noktaları 1-2 cümleyle onayla
3. Katılmadığın noktalara somut gerekçe ve alternatif sun
4. "{skill}" uzmanlığından önceki turda EKSİK kalan 1-2 önemli şeyi ekle
5. Maksimum 300 kelime.
6. Eğer gerçekten hemfikirsen SON SATIR: "KONSENSUS: [tek cümle]"

ÇIKTIN sadece bu yanıt olsun. Başka hiçbir şey ekleme."""


# ─────────────────────────────────────────────
# Konsensüs Algılama
# ─────────────────────────────────────────────

def konsensus_var_mi(board: dict) -> bool:
    """2 farklı ajan son 2 turda KONSENSUS yazdıysa tur biter."""
    turlar = board.get("turlar", [])
    if len(turlar) < 2:
        return False
    son_iki = turlar[-2:]
    if son_iki[0]["ajan_id"] == son_iki[1]["ajan_id"]:
        return False
    return all("KONSENSUS" in t.get("mesaj", "").upper() for t in son_iki)


# ─────────────────────────────────────────────
# Sentez Ajanı — Tartışmadan Plan Üretir
# ─────────────────────────────────────────────

def sentezle(board: dict, shared_session: bool = False, current_session_uuid: str = None, project_id: str = None) -> None:
    """
    Tartışma tamamlandıktan sonra bağımsız bir sentez ajanı çalıştırır.
    Her iki ajanın görüşlerini okuyup somut bir eylem planı üretir.
    """
    konu   = board.get("konu", "?")
    turlar = board.get("turlar", [])

    konusma_metni = "\n\n".join([
        f"**Ajan {t['ajan_id']}** (Tur {t['tur']}, Rol: {t['skill']}):\n{t['mesaj']}"
        for t in turlar
    ])

    sentez_gorevi = f"""Aşağıdaki ajan tartışmasını incele ve bir EYLEM PLANI üret.

Tartışma Konusu: "{konu}"

━━━ TARTIŞMA TUTANAĞI ━━━
{konusma_metni}
━━━━━━━━━━━━━━━━━━━━━━━━

## Görevin (Sentez Uzmanı Olarak):

**Bölüm 1 — Ortak Kararlar**
Her iki ajanın hemfikir olduğu noktaları liste olarak çıkar.

**Bölüm 2 — Çözümsüz Noktalar**
Tartışmada çözüme kavuşmamış veya yanıtsız kalan anlaşmazlıkları belirt.

**Bölüm 3 — Eylem Planı**
Tartışmadan çıkan kararları uygulanabilir adımlara dönüştür:
- Her adım: Ne yapılacak + Hangi dosya/servis + Doğrulama kriteri
- Öncelik sırasına göre sırala

**Bölüm 4 — Kabul Kriterleri**
Bu planın başarıyla tamamlandığını nasıl anlayacağız?

Format: Türkçe Markdown. Net, eyleme dönük. Tekrar yok."""

    print(f"\n{'─' * 40}")
    print("🧠 SENTEZ AJANI çalışıyor...")
    print(f"{'─' * 40}")

    sonuc = spawn_subagent(
        skill="superpowers-plan",
        task=sentez_gorevi,
        repo_root=REPO_ROOT,
        yolo=True,
        visible=True,
        resume_id=current_session_uuid if shared_session else None,
    )

    if sonuc["success"] and sonuc.get("output"):
        sentez_adi  = f"sentez-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}.md"
        sentez_yolu = KARAR_DIR / sentez_adi
        sentez_yolu.write_text(
            f"# Sentez Planı: {konu}\n\n"
            f"**Kaynak:** {len(turlar)} tur tartışma  \n"
            f"**Tarih:** {datetime.datetime.now().isoformat()}\n\n---\n\n"
            f"{sonuc['output']}",
            encoding="utf-8",
        )
        print(f"✅ Sentez tamamlandı ({sonuc['duration_s']:.0f}sn)")
        print(f"📋 Sentez planı: artifacts/superpowers/{sentez_adi}")

        # SEKRETER: Proje ID verilmişse Kalıcı Arşive Kopyala
        if project_id:
            toplanti_dir = REGISTRY_DIR / project_id / "toplanti_kayitlari"
            toplanti_dir.mkdir(parents=True, exist_ok=True)
            kalici_yol = toplanti_dir / sentez_adi
            kalici_yol.write_text(sentez_yolu.read_text(encoding="utf-8"), encoding="utf-8")
            print(f"🗃️  SEKRETER: Sentez kalıcı arşive kaydedildi ({project_id}/toplanti_kayitlari/{sentez_adi})")

    else:
        print(f"⚠️  Sentez başarısız: {sonuc.get('error', '')[:100]}")


# ─────────────────────────────────────────────
# Rapor Üretici
# ─────────────────────────────────────────────

def rapor_olustur(board: dict) -> str:
    konu   = board.get("konu", "?")
    durum  = board.get("durum", "?").upper()
    turlar = board.get("turlar", [])

    rapor  = f"# Ekip Diyaloğu: {konu}\n\n"
    rapor += f"**Tarih:** {board.get('baslatildi', '?')}  \n"
    rapor += f"**Durum:** {durum} | **Toplam Tur:** {len(turlar)}\n\n---\n\n"

    for t in turlar:
        rapor += (
            f"## Ajan {t['ajan_id']} [{t['skill']}] — Tur {t['tur']} ({t.get('sure', '?')})\n\n"
            f"{t['mesaj']}\n\n---\n\n"
        )
    return rapor


# ─────────────────────────────────────────────
# Ana Orkestratör
# ─────────────────────────────────────────────

def orchestrate(konu: str, skill_listesi: list, max_tur: int = 4, sentez: bool = False, shared_session: bool = False, project_id: str = None, task_group: str = None) -> dict:
    print(f"\n{'═' * 60}")
    print("🚀 EKİP DİYALOĞU BAŞLIYOR")
    print(f"📌 Konu    : {konu}")
    print(f"🤖 Ajanlar : {skill_listesi}")
    print(f"🔄 Maks Tur: {max_tur}")
    print(f"🧠 Sentez  : {'Evet' if sentez else 'Hayır'}")
    print(f"🔗 Ortak Oturum (Thread): {'Aktif' if shared_session else 'Pasif'}")
    print(f"{'═' * 60}")

    board: dict = {
        "konu": konu,
        "baslatildi": datetime.datetime.now().isoformat(),
        "skill_listesi": skill_listesi,
        "turlar": [],
        "durum": "devam",
    }
    with bb_lock():
        bb_yaz(board)

    tur = 0
    current_session_uuid = None

    if shared_session and project_id and task_group:
        current_session_uuid = session_manager.get_or_create(project_id, task_group)
        if current_session_uuid:
            print(f"🔄 SESSION MANAGER: Aktif oturum bulundu ({current_session_uuid[:8]})")
        else:
            print(f"🆕 SESSION MANAGER: Taze oturum başlatılacak.")

    while tur < max_tur and board["durum"] == "devam":
        for i, skill in enumerate(skill_listesi):
            tur += 1
            if tur > max_tur:
                break

            ajan_id = chr(65 + i)   # A, B, C...
            board   = bb_oku()

            print(f"\n{'─' * 40}")
            if shared_session and current_session_uuid:
                print(f"🤖 Ajan {ajan_id} konuşuyor — Tur {tur}/{max_tur} [{skill}] (Kalıtım: {current_session_uuid[:8]})")
            else:
                print(f"🤖 Ajan {ajan_id} konuşuyor — Tur {tur}/{max_tur} [{skill}]")
            print(f"{'─' * 40}")

            gorev = gorev_olustur(konu, skill, ajan_id, board, tur)
            sonuc = spawn_subagent(
                skill=skill,
                task=gorev,
                repo_root=REPO_ROOT,
                yolo=True,
                visible=True,
                resume_id=current_session_uuid if shared_session else None,
            )

            if sonuc["success"] and sonuc.get("output"):
                # UUID'yi yakala (Eğer shared_session aktifse ve başarılıysa)
                if shared_session and sonuc.get("session_uuid"):
                    yeni_uuid = sonuc["session_uuid"]
                    if current_session_uuid != yeni_uuid:
                        current_session_uuid = yeni_uuid
                        # Eğer proje bazlıysa kaydet
                        if project_id and task_group:
                            session_manager.save(project_id, task_group, current_session_uuid)
                    
                mesaj = sonuc["output"]
                print(f"✅ Ajan {ajan_id} tamamladı ({sonuc['duration_s']:.0f}sn)")
                preview = mesaj.replace("\n", " ")[:120]
                print(f"💬 {preview}...")

                with bb_lock():
                    board = bb_oku()
                    board["turlar"].append({
                        "tur":     tur,
                        "ajan_id": ajan_id,
                        "skill":   skill,
                        "mesaj":   mesaj,
                        "log":     sonuc.get("log_file", ""),
                        "sure":    f"{sonuc['duration_s']:.0f}sn",
                    })

                    if konsensus_var_mi(board):
                        board["durum"] = "konsensus"
                        bb_yaz(board)
                        print("\n🤝 KONSENSUS SAĞLANDI — Diyalog tamamlandı!")
                        break

                    bb_yaz(board)

            else:
                hata = sonuc.get("error", "bilinmiyor")[:120]
                print(f"⚠️  Ajan {ajan_id} başarısız: {hata}")
                print("   Sıradaki ajana geçiliyor...")

    # Kapanış
    with bb_lock():
        board = bb_oku()
        if board.get("durum") == "devam":
            board["durum"] = "tamamlandi"
        bb_yaz(board)

    # Diyalog kaydı
    karar_adi  = f"diyalog-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}.md"
    karar_yolu = KARAR_DIR / karar_adi
    KARAR_DIR.mkdir(parents=True, exist_ok=True)
    karar_yolu.write_text(rapor_olustur(board), encoding="utf-8")

    print(f"\n{'═' * 60}")
    print(f"🏁 DİYALOG TAMAMLANDI — Durum: {board['durum'].upper()}")
    print(f"📄 Diyalog kaydı : artifacts/superpowers/{karar_adi}")
    
    # SEKRETER: Diyalog kaydını arşive at
    if project_id:
        toplanti_dir = REGISTRY_DIR / project_id / "toplanti_kayitlari"
        toplanti_dir.mkdir(parents=True, exist_ok=True)
        diyalog_kalici = toplanti_dir / karar_adi
        diyalog_kalici.write_text(karar_yolu.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"🗃️  SEKRETER     : Diyalog arşive alındı ({project_id}/toplanti_kayitlari/{karar_adi})")
        
    print(f"🗂️  Kara tahta    : artifacts/superpowers/blackboard.json")
    print(f"{'═' * 60}")

    # İstendiyse sentez ajanı çalıştır
    if sentez:
        sentezle(board, shared_session, current_session_uuid, project_id=project_id)

    return board


# ─────────────────────────────────────────────
# Giriş Noktası
# ─────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="VentHub Ekip Orkestratörü — Diyalog Tabanlı Çok-Ajan Sistemi"
    )
    parser.add_argument(
        "konu",
        help='Tartışma konusu. Örn: "Cache stratejisi ne olmalı?"',
    )
    parser.add_argument(
        "--skills",
        nargs="+",
        default=["superpowers-plan", "paralel-review"],
        help="Kullanılacak skill listesi (sırayla konuşur). Varsayılan: plan + review",
    )
    parser.add_argument(
        "--turlar",
        type=int,
        default=4,
        help="Maksimum toplam tur sayısı. Varsayılan: 4",
    )
    parser.add_argument(
        "--sentez",
        action="store_true",
        help="Tartışma sonunda sentez ajanı çalıştırır (eylem planı üretir)",
    )
    parser.add_argument(
        "--shared-session",
        action="store_true",
        help="Sürekli oturum mantığı ile ajanlar birbirinin LLM zihnini devralır (Thread-Level Swarm)",
    )
    parser.add_argument(
        "--project-id",
        help="Örn: P01_Auth. Kaydı ve oturumları Registry altında tutar.",
    )
    parser.add_argument(
        "--task-group",
        help="Örn: db_schema. --project-id ile birlikte oturum UUID eşlemesi yapar.",
    )
    args = parser.parse_args()
    
    if args.task_group and not args.project_id:
        print("HATA: --task-group kullanımı için --project-id zorunludur.")
        sys.exit(1)
        
    orchestrate(args.konu, args.skills, args.turlar, args.sentez, args.shared_session, args.project_id, args.task_group)
