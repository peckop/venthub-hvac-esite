# Implementation Plan: Registry V3.1 (ID: 008)

## 1. Metadata ve Protokol Güncellemesi
- [ ] `registry/REGISTRY_PROTOCOL.md` dosyasını `priority` ve `depends_on` kurallarını içerecek şekilde güncelle.
- [ ] Mevcut görevlerin (003-006) metadata'larını bu yeni alanlarla donat.

## 2. Sync Script Geliştirmesi
- [ ] `scripts/tools/registry_sync.py` scriptini şu özelliklerle güncelle:
    - Metadata'dan `priority` ve `depends_on` verilerini oku.
    - Tüm aktif ve tamamlanan görevlerin özetini topla.
    - `artifacts/superpowers/` altındaki "Kaçak Operasyonları" (Registry kaydı olmayanlar) tespit et.
    - `registry/PULSE.md` dosyasını (Dashboard) üret.

## 3. Dashboard (Pulse) Üretimi
- [ ] `PULSE.md` dosyasının şablonunu (header, table, summary) script içine göm.
- [ ] Tamamlanan, Aktif ve Kaçak işleri ayrı bölümlerde listele.

## 4. Doğrulama (Salat Check)
- [ ] `sync` scriptini çalıştır ve `registry/PULSE.md` dosyasını kontrol et.
- [ ] Kasıtlı bir "Kaçak Operasyon" (Registry dosyasız bir artifakt) yaratıp sistemin onu yakaladığını doğrula.
