import pytest
import sys
from pathlib import Path

# Add parent directory to path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

from query_intent import detect_query_intent

def test_detects_neden():
    # 3. Query Intent - "neden" algılama
    assert detect_query_intent("display_mode neden text?") == "N2_NEDEN"
    assert detect_query_intent("sebebi neydi ki") == "N2_NEDEN"
    
def test_returns_none_without_hint():
    # 4. Query Intent - ipucu yok -> None
    assert detect_query_intent("display_mode") is None
    assert detect_query_intent("urun tablosu display kolon") is None
    
def test_detects_other_layers():
    assert detect_query_intent("bunu nasıl kurarız?") == "N3_NASIL"
    assert detect_query_intent("şifre kontrol bileşeni nerede") == "N5_NEREDE"
    assert detect_query_intent("hangi ajan bu PR'ı başlattı") == "K1_KIM"
    assert detect_query_intent("ne zaman canlıya çıkar") == "N4_NEZAMAN"
    assert detect_query_intent("bu dosyada neler yapıldı") == "N1_NE"
