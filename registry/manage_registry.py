#!/usr/bin/env python3
"""
Orion Registry Proxy — manage_registry.py
Eski monolitik görev yöneticisinin yerine geçen V8.0 yönlendiricisi.
Tüm komutları Orion MCP köprüsü (orion_bridge.py) üzerinden doğrudan merkeze iletir.
(Dual-write çakışmalarını önlemek için yerel SQLite veritabanına yazma işlemi tamamen kaldırılmıştır.)
"""

import sys
import argparse
from pathlib import Path

# Aynı dizindeki orion_bridge modülünü yükle
sys.path.insert(0, str(Path(__file__).parent))
try:
    from orion_bridge import (
        bridge_dashboard,
        bridge_list_tasks,
        bridge_create_task,
        bridge_update_task,
        bridge_normalize
    )
except ImportError as e:
    print(f"🚨 Orion Bridge yüklenemedi: {e}")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Orion Registry Proxy (V8.0)")
    parser.add_argument("action", choices=["repair", "normalize", "reindex", "activate", "backlog", "complete", "progress", "create-project", "create-task", "remember", "recall", "dashboard", "list", "next", "init", "auto-sign", "auto-lifecycle", "rag", "idea", "inbox", "triage", "promote", "discard", "briefing"])
    parser.add_argument("project_id", nargs="?", help="Proje ID (Örn: P01)")
    parser.add_argument("task_id", nargs="?", help="Görev ID (Örn: 017)")
    parser.add_argument("value", nargs="?", help="Progress değeri (0-100) veya hedef durum")
    parser.add_argument("--query", "-q", help="Görev Başlığı")
    parser.add_argument("--fact", "-f", help="CC Fact / Not")
    parser.add_argument("--description", "-d", help="Geniş Açıklama")
    parser.add_argument("--complexity", "-c", choices=["trivial", "low", "medium", "high", "expert"], default="medium")
    parser.add_argument("--limit", "-l", type=int, default=10)
    parser.add_argument("--verbose", "-v", action="store_true")
    
    args = parser.parse_args()

    # Yönlendirmeler
    if args.action == "dashboard":
        print(bridge_dashboard() or "Orion yanıt vermedi.")
    
    elif args.action == "list":
        print(bridge_list_tasks(project_id=args.project_id) or "Orion list yanıt vermedi.")
    
    elif args.action == "normalize":
        result = bridge_normalize() or "Normalize (Orion Sync) tamamlandi."
        print(result)
        # F1: Bayatlik ve soguma entegrasyonu
        try:
            from idea_engine import calculate_staleness, apply_daily_decay
            decay_result = apply_daily_decay()
            staleness_result = calculate_staleness()
            print(f"\n{decay_result}")
            print(f"\n{staleness_result}")
        except ImportError:
            pass  # idea_engine henuz yoksa sessizce gec
    
    elif args.action == "create-task":
        if not args.project_id or not args.query:
            print("Kullanım: create-task PXX --query 'başlık'")
            sys.exit(1)
        print(bridge_create_task(args.project_id, args.query, args.description or "", args.complexity))
    
    elif args.action == "progress":
        if not args.project_id or not args.task_id or not args.value:
            print("Kullanım: progress PXX 017 50")
            sys.exit(1)
        task_id = f"{args.project_id}/{args.task_id}"
        print(bridge_update_task(task_id, status="executing", progress=int(args.value)))
    
    elif args.action == "complete":
        if not args.project_id or not args.task_id:
            print("Kullanım: complete PXX 017")
            sys.exit(1)
        task_id = f"{args.project_id}/{args.task_id}"
        print(bridge_update_task(task_id, status="completed", progress=100))
        print(f"✅ Görev Orion sisteminde mühürlendi: {task_id}")
        
    elif args.action == "activate":
        if not args.project_id or not args.task_id:
            print("Kullanım: activate PXX 017")
            sys.exit(1)
        task_id = f"{args.project_id}/{args.task_id}"
        print(bridge_update_task(task_id, status="active", progress=0))
        print(f"🟢 Görev Orion sisteminde aktifleştirildi: {task_id}")

    elif args.action in ("remember", "recall"):
        print("⚠️ Bilgi: 'remember' ve 'recall' yetkileri CC MCP (Corpus Callosum) yetkisine devredildi.")
        print("   Lütfen cc_remember() veya cc_search() araçlarını kullanınız.")
        
    elif args.action == "idea":
        title = args.project_id  # İlk positional arg fikir metni olarak kullanılır
        if not title:
            print("Kullanim: idea 'Fikir metni' [--domain SEC] [--scope VH]")
            sys.exit(1)
        from idea_engine import save_idea
        result = save_idea(
            title=title,
            domain=getattr(args, 'complexity', 'ARC').upper() if args.complexity != 'medium' else 'ARC',
            scope='GL',
            author='MIM'
        )
        print(result)

    elif args.action == "inbox":
        from idea_engine import list_ideas
        status_filter = args.project_id  # Opsiyonel: 'raw', 'promoted', 'discarded'
        result = list_ideas(status_filter=status_filter)
        print(result)

    elif args.action == "triage":
        from triage_engine import triage
        print(triage(args.project_id))

    elif args.action == "promote":
        if not args.project_id or not args.task_id:
            print("Kullanim: promote <idea_id> <target_project> [target_task]")
            sys.exit(1)
        from triage_engine import promote_idea
        print(promote_idea(args.project_id, args.task_id, args.value))

    elif args.action == "discard":
        if not args.project_id:
            print("Kullanim: discard <idea_id> [reason]")
            sys.exit(1)
        from triage_engine import discard_idea
        reason = args.task_id or "Artik gecerli degil"
        print(discard_idea(args.project_id, reason))

    elif args.action == "briefing":
        from triage_engine import strategic_briefing
        print(strategic_briefing(args.project_id))

    else:
        print(f"Proxy modunda bu komut kapatilmistir veya Orion'a tasinmistir: {args.action}")
        print("   -> Dogrulama ve Json islemleri icin: python registry/engine.py kullanin.")
        print("   -> MCP kullaniyorsaniz dogrudan Orion sunucusunu (or_*) kullanmalisiniz.")

if __name__ == "__main__":
    main()
