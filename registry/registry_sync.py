import sys
from pathlib import Path

# VENTHUB REGISTRY SYNC v8.0 (LIGHTWEIGHT SQL WRAPPER)
# Bu dosya artık ağır dosya taraması yapmaz, tüm veriyi manage_registry.py üzerinden SQL'den çeker.

REGISTRY_DIR = Path(__file__).parent.absolute()
if str(REGISTRY_DIR) not in sys.path:
    sys.path.append(str(REGISTRY_DIR))

try:
    from manage_registry import sync_pulse
except ImportError:
    print("🚨 HATA: manage_registry.py bulunamadı!")
    sys.exit(1)

def sync_all():
    """manage_registry içindeki yüksek performanslı SQL motorunu tetikler."""
    sync_pulse()

if __name__ == "__main__":
    sync_all()
