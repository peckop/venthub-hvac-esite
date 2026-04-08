from typing import Optional

QUERY_INTENT_MAP = {
    "N2_NEDEN": ["neden", "niçin", "sebebi", "why", "reason", "niye", "amacı"],
    "N3_NASIL": ["nasıl", "adım", "prosedür", "how", "steps", "guide", "yol haritası", "kurulum"],
    "N5_NEREDE": ["nerede", "hangi dosya", "where", "which file", "path", "hangi klasör", "konum"],
    "N4_NEZAMAN": ["ne zaman", "hangi versiyon", "when", "version", "phase", "hangi pr", "hangi sprint"],
    "N1_NE": ["ne değişti", "ne eklendi", "what changed", "what was added", "neler yapıldı", "durum nedir"],
    "K1_KIM": ["kim yaptı", "hangi ajan", "who", "which agent", "kim düzenledi"],
}

def detect_query_intent(query: str) -> Optional[str]:
    """Sorgu metninden intent katmanını otomatik tespit et."""
    if not query:
        return None
        
    query_lower = query.lower()
    for layer, keywords in QUERY_INTENT_MAP.items():
        if any(kw in query_lower for kw in keywords):
            return layer
            
    return None  # Tespit edilemezse -> tüm katmanlarda ara
