---
id: "000"
title: "Roadmap"
status: "Active"
artifacts:
  brainstorm: "registry/P06-System-Intelligence-Registry/active/000-roadmap/brainstorm.md"
  plan: "registry/P06-System-Intelligence-Registry/active/000-roadmap/plan.md"
  review: "registry/P06-System-Intelligence-Registry/active/000-roadmap/review.md"
---


# P06 - System Intelligence & Agent Infrastructure

## 🎯 Projenin Amacı
VentHub projesindeki AI ajanlarının (Gemini Flash/High/Pro, Claude Sonnet/Opus) verimini, güvenliğini ve koordinasyonunu artıran **otonom altyapı sistemini** inşa etmek ve sürdürmek.

> **Vizyon Belgesi:** `agent_infrastructure_review.md` (Antigravity Artifacts, 26.03.2026)
> **Mevcut Altyapı Olgunluğu:** 5.6/10 → **Hedef:** 8/10

## ✅ Tamamlanan Aşamalar
- [x] 001: Otomatik Changelog Jeneratörü
- [x] 002: Registry Bağımlılık Görselleştirme
- [x] 003: Registry İndeksleme Sistemi
- [x] 004: Registry 3.0 — SQLite Geçişi
- [x] 005: Registry v7 — Atomik Bütünlük
- [x] 006: Registry Engine Stabilizasyonu

## 🔥 Yeni Pipeline (Öncelik Sıralı)

| # | Görev | Efor | Etki | Hedef |
|---|-------|------|------|-------|
| 🥇 | **007** Flash Guard Rails | ~1 saat | Çok Yüksek | Flash modelinin kontrolsüz edit'lerini önle |
| 🥈 | **008** Registry Engine v6 | ~2 saat | Yüksek | `complete`, `progress`, bağımlılık kontrolü |
| 🥉 | **009** Workflow-MCP Orkestrasyon | ~1 saat | Yüksek | Araçları birbirine bağla |
| 4 | **010** Model Dispatcher v2 | ~30 dk | Orta | Görev-model eşleştirme tablosu |
| 5 | **011** Diff-Review Skill | ~1 saat | Orta | Commit öncesi güvenlik kontrolü |

## 🛠 Teknik İlkeler
- **Flash Kontrolü:** Düşük yetenekli modeller mutlaka post-edit verification yapmalı
- **Registry Otomasyonu:** Manuel MD düzenleme → Motor komutu geçişi tamamlanmalı
- **MCP Orkestrasyon:** Araçlar var, orkestrasyon eksik → workflow'lara entegre et
- **Kota Verimliliği:** Doğru model, doğru iş. Flash=amele, High=cerrah, Sonnet/Opus=mimar

## 📈 Başarı Kriterleri (Mühür)
1. Flash model her edit sonrası tsc kontrolü yapıyor
2. `complete` ve `progress` komutları çalışıyor
3. En az 3 workflow MCP araçlarını sistematik çağırıyor
4. Her görev açıldığında model önerisi 5 saniye içinde belirlenebilir
