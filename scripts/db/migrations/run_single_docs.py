import subprocess
import sys
from pathlib import Path

def main():
    repo_root = Path(__file__).resolve().parents[3]
    
    files = [
        "src/app/[lang]/page.tsx",
        "src/app/[lang]/products/page.tsx",
        "src/app/api/webhook/supabase/route.ts",
        "src/components/admin/AdminRealtimeNotifications.tsx",
        "src/contexts/AuthContext.tsx",
        "src/hooks/useTenant.tsx",
        "src/lib/tenantResolver.ts",
        "src/middleware.ts",
        "src/utils/tenantServer.ts",
        "src/views/admin/AdminErrorGroupsPage.tsx",
        "src/views/admin/AdminErrorsPage.tsx",
        "supabase/functions/_shared/tenant_config.ts",
        "supabase/functions/admin-create-coupon/index.ts",
        "supabase/functions/admin-update-order/index.ts",
        "supabase/functions/admin-update-shipping/index.ts",
        "supabase/functions/delivery-notification/index.ts",
        "supabase/functions/iyzico-callback/index.ts",
        "supabase/functions/iyzico-payment/index.ts",
        "supabase/functions/notification-service/index.ts",
        "supabase/functions/order-confirmation/index.ts",
        "supabase/functions/return-status-notification/index.ts",
        "supabase/functions/returns-webhook/index.ts",
        "supabase/functions/shipping-notification/index.ts",
        "supabase/functions/shipping-webhook/index.ts"
    ]
    
    total = len(files)
    print(f"Starting force single doc generation for {total} files...")
    
    for idx, f in enumerate(files, 1):
        full_path = repo_root / f
        if not full_path.exists():
            print(f"[{idx}/{total}] SKIP: File does not exist -> {f}")
            continue
            
        print(f"[{idx}/{total}] Processing: {f}")
        cmd = ["orion", "doc", "single", "--force", "--py-file", str(full_path)]
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(repo_root))
        
        if result.returncode != 0:
            print(f"[{idx}/{total}] FAILED: {f}\nError: {result.stderr or result.stdout}")
        else:
            print(f"[{idx}/{total}] SUCCESS: {f}")
            
    print("Force doc generation complete!")

if __name__ == '__main__':
    main()
