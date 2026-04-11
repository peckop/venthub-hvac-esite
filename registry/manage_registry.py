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
    parser.add_argument("action", choices=["repair", "normalize", "reindex", "activate", "backlog", "complete", "progress", "create-project", "create-task", "remember", "recall", "dashboard", "list", "next", "init", "auto-sign", "auto-lifecycle", "rag"])
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
        print(bridge_normalize() or "Normalize (Orion Sync) tamamlandı.")
    
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
        
    else:
        print(f"⚠️ Proxy modunda bu komut kapatılmıştır veya Orion'a taşınmıştır: {args.action}")
        print("   ↳ Doğrulama ve Json işlemleri için: python registry/engine.py kullanın.")
        print("   ↳ MCP kullanıyorsanız doğrudan Orion sunucusunu (or_*) kullanmalısınız.")

if __name__ == "__main__":
    main()
