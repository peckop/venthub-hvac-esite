# Implementation Plan: Registry V3 & Superpowers Sinerjisi (ID: 007)

## 1. Hazırlık ve Kurallar (Protocol V3)
- [ ] `registry/REGISTRY_PROTOCOL.md` dosyasını güncelle.
    - Metadata yapısını (YAML) tanımla.
    - "Registry First" kuralını ekle.
    - Artifact linkleme zorunluluğunu belirt.

## 2. Otomasyon (Registry-Sync)
- [ ] `scripts/tools/registry_sync.py` scriptini oluştur.
    - `artifacts/superpowers/` dizinindeki dosyaları tarayacak.
    - Dosya adındaki ID'yi (örn: 007) tespit edecek.
    - Registry'deki ilgili dosyayı bulup metadata (status, progress, artifacts) kısmını güncelleyecek.
- [ ] Scriptin çalışabilirliğini manuel test et.

## 3. Mevcut Veri Dönüşümü (Refactoring)
- [ ] `registry/active/` altındaki mevcut dosyaları (003, 004, 005, 006) yeni metadata yapısına uygun hale getir.
- [ ] Bu görevler için varsa mevcut artifaktları (brainstorm, plan vb.) linkle.

## 4. Doğrulama ve Kapanış (Salat Check)
- [ ] Yeni bir "test" görevi açarak tüm akışın (Registry -> Brainstorm -> Sync -> Metadata Update) otonom çalışıp çalışmadığını doğrula.
- [ ] `007-registry-v3-integration.md` dosyasını `registry/completed/` altına taşıyarak işi bitir.

## Doğrulama Komutları
- `python scripts/tools/registry_sync.py --check-all` (Tüm registry'yi senkronize et)
- `ls registry/active/` (Dosya yapısını kontrol et)
