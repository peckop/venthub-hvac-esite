---
artifact_type: "brainstorm"
task_id: "013"
analysis_source: "Advanced Scale Architecture Audit"
engine_version: "VentHub-S7-Orion"
architecture_level: "Advanced / Enterprise"
---

# 🧠 Brainstorming: Category ViewModel & Advanced Scale Architecture

## 🚩 Mevcut Mimari Borç (Architectural Debt)
Şu anki yapıda Gateway (`useCategoryGateway`), i18n sistemine doğrudan bağımlı durumda. Bu durum Veri Katmanı (Data Layer) ile Sunum Katmanı'nın (Presentation Layer) birbirine karışmasına, test edilebilirliğin düşmesine ve kod tekrarına (her bileşende t() çağrılması) neden oluyor.

## 🛠️ Hedeflenen Gelişmiş Mimari (Target Architecture)
Sistemi 4 katmanlı, birbirine "Loose Coupling" (Gevşek Bağlı) bir yapıya taşıyoruz:

1.  **Pure Data Gateway:** Supabase'den sadece saf veriyi çeker. i18n veya UI state bilmez.
2.  **Centralized Store:** `CategoryContext` içinde normalize edilmiş, ham veriyi tutar.
3.  **ViewModel Layer (New):** `useCategoryViewModel` adında yeni bir katman. i18n tercümelerini, görsel formatlamaları ve "Alt Tip" hiyerarşisini burada hesaplar.
4.  **Dumb UI Components:** Bileşenler sadece ViewModel'den gelen "hazır" veriyi basar. İçeride mantık yürütmez.

## 🛡️ Teknik Avantajlar
- **Separation of Concerns:** Veri değiştiğinde UI, dil değiştiğinde Data bozulmaz.
- **Performance:** Ağır hesaplamalar (hiyerarşi ağacı oluşturma) ViewModel içinde `useMemo` ile cache'lenir.
- **Maintainability:** Yeni bir dil eklemek veya kategori ismini değiştirmek sadece i18n dosyasında yapılır, veritabanına dokunulmaz.

## 🏁 Başarı Kriteri
- Gateway içinde tek bir `t()` veya `useI18n` çağrısı kalmaması.
- Bileşenlerin (Menü, Kart vb.) kategoriyi `category.displayName` şeklinde, ek parametre almadan basabilmesi.
