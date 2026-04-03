---
id: "000"
title: "Search Architecture"
status: "Backlog"
artifacts:
  brainstorm: "registry/P00-Standalone/backlog/000-search-architecture/brainstorm.md"
  plan: "registry/P00-Standalone/backlog/000-search-architecture/plan.md"
  review: "registry/P00-Standalone/backlog/000-search-architecture/review.md"
---


# Kurumsal Seviye Arama Mimarisi

**Durum:** Bu belge `NEXT_STEPS.md` arşivlendiği için oradaki "Arama Mimarisini Kurumsal Seviyeye Taşıma" görevlerinden oluşturulmuştur.

### 1) Back‑end / DB
- [ ] Postgres FTS (Turkish dictionary) + `pg_trgm` ile typo toleranslı arama
- [ ] İndeksler: `name`, `brand`, `model_code`, `sku` üzerinde GIN/GIN+trgm
- [ ] Normalizasyon: i/ı dönüşümleri, diakritik ve tire/boşluk insensitivite
- [ ] RPC: `fts_search_products(q, limit, filters)` + ağırlıklandırma (name>model_code>sku>brand) ve rank

### 2) UX
- [ ] Mobil tam ekran arama paneli (ikon veya `/` kısayolu ile)
- [ ] Sekmeler: Ürünler | Kategoriler | Markalar (sayım etiketleriyle)
- [ ] Öneriler: Son aramalar (localStorage) + popüler aramalar + “Bunu mu demek istediniz?”
- [ ] Boş durum: ilgili kategori/marka ve popüler ürün önerileri

### 3) /products (PLP)
- [ ] Facet filtreleri: Kategori, Marka, Fiyat aralığı (çoklu seçim)
- [ ] URL senkronizasyonu ve derin linklenebilirlik
- [ ] Sıralama: fiyat (↑/↓), ada göre, yeni, popüler

### 4) Performans/SEO/A11y
- [ ] Debounce, istek iptal/cancel, sonuç cache
- [ ] Prefetch + skeleton/paginate/sonsuz kaydırma
- [ ] JSON‑LD SearchAction; noindex/canonical kuralları
- [ ] A11y: focus trap, ARIA rolleri, canlı bölge (n sonuç) 
