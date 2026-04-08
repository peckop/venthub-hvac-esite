from typing import Tuple, Optional
from dataclasses import dataclass

@dataclass
class ValidationResult:
    valid: bool
    message: str = ""
    warning: Optional[str] = None
    suggested_layer: Optional[str] = None

MASTAR_REGISTRY = {
    "N1_NE": {
        "zorunlu_herhangi_biri": [
            "eklendi", "silindi", "değişti", "güncellendi", "oluşturuldu",
            "added", "removed", "changed", "updated", "created"
        ],
        "yasak": [],
        "red_mesaji": "NE katmanı için bir değişiklik ifadesi gerekli. Örn: 'eklendi', 'değişti', 'updated' vb."
    },
    "N2_NEDEN": {
        "zorunlu_herhangi_biri": [
            "çünkü", "nedeni", "sebebi", "tercih", "karar",
            "yerine", "vazgeçtik", "seçtik", "because", "reason",
            "decided", "instead of", "over", "için" # "için" is also common in turkish rationale
        ],
        "yasak": [
            "adım 1", "komutu çalıştır", "step 1", "run command"
        ],
        "red_mesaji": "NEDEN katmanı için içerikte neden/sebep belirtilmeli. 'çünkü...', '...nedeniyle' vs. ekleyin."
    },
    "N3_NASIL": {
        "zorunlu_herhangi_biri": [
            "adım", "önce", "sonra", "sırasıyla", "prosedür",
            "komutu", "çalıştır", "step", "first", "then", "run",
            "yapılır", "komut"
        ],
        "yasak": [],
        "red_mesaji": "NASIL katmanı için prosedürel adımlar veya komut referansları gerekli."
    },
    "N4_NEZAMAN": {
        "zorunlu_herhangi_biri": [
            "tarih", "versiyon", "sprint", "aşama", "dönem",
            "version", "phase", "during", "milestone", "v1", "v2", "başında", "sonunda"
        ],
        "yasak": [],
        "red_mesaji": "NE ZAMAN katmanı için dönem/versiyon referansı gerekli."
    },
    "N5_NEREDE": {
        "zorunlu_herhangi_biri": [
            "dosya", "klasör", "satır", "bileşen", "modül",
            "dizin", "file", "folder", "component", "module", "path",
            "içinde", "altında", "hedef"
        ],
        "yasak": [],
        "red_mesaji": "NEREDE katmanı için dosya/konum referansı gerekli."
    },
    "K1_KIM": {
        "zorunlu_herhangi_biri": [
            "ajan", "jules", "session", "oturum", "PR", "commit",
            "agent", "user", "developer", "kullanıcı", "ben", "sen"
        ],
        "yasak": [],
        "red_mesaji": "KIM katmanı için ajan/kişi/PR referansı gerekli."
    }
}

VALID_LAYERS = list(MASTAR_REGISTRY.keys())

def validate(content: str, intent_layer: str) -> ValidationResult:
    """Mastar-Kalıp denetimi. Girdi belirlenen katmanın kurallarına uygun mu?"""
    if not intent_layer:
        return ValidationResult(
            valid=False,
            message=f"intent_layer zorunludur. Seçenekler: {', '.join(VALID_LAYERS)}"
        )

    if intent_layer not in MASTAR_REGISTRY:
        return ValidationResult(
            valid=False,
            message=f"Bilinmeyen intent_layer: {intent_layer}. Seçenekler: {', '.join(VALID_LAYERS)}"
        )

    mastar = MASTAR_REGISTRY[intent_layer]
    content_lower = content.lower()

    # Zorunlu kelime kontrolü
    has_required = any(kw.lower() in content_lower for kw in mastar["zorunlu_herhangi_biri"])
    if not has_required:
        return ValidationResult(
            valid=False,
            message=mastar["red_mesaji"]
        )

    # Yasaklı kelime kontrolü
    for forbidden in mastar["yasak"]:
        if forbidden.lower() in content_lower:
            return ValidationResult(
                valid=False,
                message=f"İçerik '{intent_layer}' katmanı için yasaklı bir kelime ({forbidden}) barındırıyor."
            )

    return ValidationResult(valid=True)

def resolve_conflict(content: str, claimed_layer: str) -> ValidationResult:
    """İçerik birden fazla katmana uyuyorsa, en güçlü eşleşmeyi bul.
    Baştan validate'ten geçtiği varsayılır (veya beraber çalışabilir)."""
    
    if claimed_layer not in MASTAR_REGISTRY:
        return ValidationResult(valid=True) # Katman geçersizse mastar hatası dönmeli, conflict değil.
        
    scores = {}
    content_lower = content.lower()
    
    for layer_name, mastar in MASTAR_REGISTRY.items():
        hits = sum(
            1 for kw in mastar["zorunlu_herhangi_biri"]
            if kw.lower() in content_lower
        )
        scores[layer_name] = hits

    claimed_score = scores.get(claimed_layer, 0)
    
    if not scores:
         return ValidationResult(valid=True)
         
    best_layer = max(scores, key=scores.get)
    best_score = scores[best_layer]

    # Eğer en yüksek skorlu olan ile seçilen aynıyla
    # yada skorları eşitse, ajanın seçimine güvenilir.
    if claimed_layer == best_layer or claimed_score == best_score:
        return ValidationResult(valid=True)

    # Başka katman açıkça daha güçlü eşleşiyorsa uyarı ver
    # ama işlemi iptal etme.
    if best_score > claimed_score and best_score > 0:
        return ValidationResult(
            valid=True,
            warning=f"⚠️ '{claimed_layer}' dediniz ama içerik '{best_layer}' "
                    f"ile daha uyumlu (skor: {best_score} vs {claimed_score}).",
            suggested_layer=best_layer
        )

    return ValidationResult(valid=True)
