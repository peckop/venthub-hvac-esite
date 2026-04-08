import pytest
import sys
from pathlib import Path

# Add parent directory to path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

from mastar_validator import validate, resolve_conflict

def test_neden_requires_causal_keyword():
    # 1. Mastar dogrulama - zorunlu kelime kontrolü
    # Missing causal keyword
    result_fail = validate("display_mode text olacak", intent_layer="N2_NEDEN")
    assert not result_fail.valid
    assert "için içerikte neden/sebep belirtilmeli" in result_fail.message
    
    # Has causal keyword
    result_pass = validate("display_mode text olacak çünkü SSR hızı gerekiyor", intent_layer="N2_NEDEN")
    assert result_pass.valid

def test_neden_rejects_procedural_keywords():
    # 2. Mastar dogrulama - yasak kelime kontrolü
    result_fail = validate("adım 1 yap çünkü böyle istedik", intent_layer="N2_NEDEN")
    assert not result_fail.valid
    assert "yasaklı bir kelime" in result_fail.message
    
def test_missing_layer():
    # 7. intent_layer eksik -> red
    result_fail = validate("bir şey eklendi", intent_layer="")
    assert not result_fail.valid
    assert "intent_layer zorunludur" in result_fail.message
    
def test_conflict_warning():
    # 8. Çakışma -> uyarı
    # We claim N3_NASIL, but we provide words strongly matching N2_NEDEN
    # Here, "komutu çalıştır" is N3_NASIL. "çünkü" is N2_NEDEN.
    result_validate = validate("Önce komutu çalıştır çünkü veriler eksik kalır.", intent_layer="N3_NASIL")
    assert result_validate.valid # It passes the mastar check for N3_NASIL 
    
    # But conflict resolver might give a warning if another layer has higher score. 
    # "önce" (N3), "komutu" (N3), "çalıştır" (N3) -> score 3
    # "çünkü" (N2) -> score 1
    # Actually here N3_NASIL wins. Let's make N2_NEDEN win.
    
    result_val_2 = validate("bunu yap nedeni ve sebebi şu ki tercih ettik", intent_layer="N3_NASIL")
    # "yap" does not match N3_NASIL. Wait, N3_NASIL mandatory words: "adım", "önce", "sonra", "sırasıyla", "prosedür", "komutu", "çalıştır", "step", "first", "then", "run", "yapılır", "komut". Let's use "adım".
    result_val_3 = validate("adım attık nedeni ve sebebi şu ki tercih ettik çünkü", intent_layer="N3_NASIL")
    
    assert result_val_3.valid
    conflict_res = resolve_conflict("adım attık nedeni ve sebebi şu ki tercih ettik çünkü", "N3_NASIL")
    assert conflict_res.valid
    # N3_NASIL Score = 1 ("adım")
    # N2_NEDEN Score = 4 ("nedeni", "sebebi", "tercih", "çünkü")
    assert conflict_res.warning is not None
    assert "N2_NEDEN" in conflict_res.warning
