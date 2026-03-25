# VentHub Kayıt ve Görev Protokolü (V7 - Multi-Project Pure Hierarchy)

Bu protokol, projenin "Hafızası" (Registry) ve "Motoru" (Superpowers) arasındaki tam senkronizasyonu yönetir.

## 1. Proje Bazlı Hiyerarşi (Hierarchy First)
- Her görev, `registry/PXX-ProjectName/active/` altında kendine ait bir `.md` dosyasına sahip olmalıdır.
- Görev dosyaları sadece `manage_registry.py` üzerinden oluşturulabilir ve taşınabilir.

## 2. 🛡️ Dörtlü Mühür Sistemi (The Quadruple Seal)
Bir görev mühürlenip (Completed) kapanmadan önce şu 4 istasyondan geçmelidir:
1. **Statik Mühür (Lint):** `pnpm run lint:ci` komutuyla 0 hata doğrulanmalı.
2. **Mantıksal Mühür (TSC):** `pnpm exec tsc -b tsconfig.build.json` ile tip güvenliği kanıtlanmalı.
3. **Üretim Mührü (Build):** `pnpm run build` komutu üretim ortamında hatasız çalışmalı.
4. **Hafıza Mührü (Registry Sync):** Görev dosyası güncellenip `PULSE.md` senkronize edilmeli.

## 3. 💎 TOPLAM KALİTE VE MİMARİ KORKULUKLAR (Architectural Guardrails)
Bir ajan, "Sıfır Hata" hedefine koşarken aşağıdaki mimari etik kurallarına uymak zorundadır:

1. **Metrik Tuzağı Yasağı:** Sadece hata sayısını düşürmek için kodun mantıksal bütünlüğü bozulamaz.
2. **Cerrahi Hassasiyet:** Bir hata düzeltilirken, o hatanın "neden" oluştuğu analiz edilmelidir.
3. **Bütünsel Denetim:** Bir dosya değiştiğinde, o dosyanın bağımlılıkları (imports) ve o dosyayı kullanan yerler (exports) kontrol edilmelidir.
4. **Tip Güvenliği Önceliği:** `any` dökümü `unknown` yapılarak geçiştirilemez. Gerçek Interface/Type kullanılmalıdır.
5. **Runtime Sağlığı:** Browser konsolundaki uyarılar ve Three.js deprecations hataları da "temizlenmesi gereken hata" kabul edilir.

## 4. 🛠️ Komut Seti (Registry CLI)
- `python registry/manage_registry.py normalize`: Otonom senkronizasyonu tetikler.
- `python registry/manage_registry.py search <ID>`: Görevi tüm projelerde arar.
- `python registry/manage_registry.py recall`: Ajanlar arası paylaşımlı hafızayı geri çağırır.

## 5. Görev Yaşam Döngüsü (The 6-Step Workflow + Dispatcher)
0. **[MISSION CONTROL]:** Ajan, herhangi bir görevi devraldığında veya yeni bir görev açacağında `.agent/skills/model-dispatcher` kurallarını çalıştırıp KOTA ONAYI ister.
1. **[ZORUNLU DOĞRULAMA]:** Ajan, görevi devraldığında "Dörtlü Mühür" kontrolü yapar.
2. **Brainstorm:** `/superpowers-brainstorm` ile hedef ve kısıtlar belirlenir.
2. **Planl:** `/superpowers-write-plan` ile doğrulanabilir adımlar yazılır.
3. **Activate:** `manage_registry.py activate` komutuyla görev yürütmeye hazır hale getirilir.
4. **Executing:** Kod yazımı ve sürekli denetim (Ethic Analysis).
5. **Review:** `/superpowers-review` ile kodun kalitesi oylanır.
6. **Closing:** `/bitir` ile Dörtlü Mühür uygulanır ve görev mühürlenir.
