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

## 4. 🛠️ Komut Seti (Registry CLI v7 Sentinel & Navigator)
- `python registry/manage_registry.py normalize`: Otonom senkronizasyonu tetikler.
- `python registry/manage_registry.py search <ID>`: Görevi tüm projelerde arar.
- `python registry/manage_registry.py create-task P01 001 --query "Görev Adı"`: Yeni görev taslağı oluşturur (Otonom planlamanın ilk adımı).
- `python registry/manage_registry.py activate P01 001`: Görevi yürütmeye hazır hale getirir (Sentinel Gate: Plan Yoksa Reddedilir).
- `python registry/manage_registry.py progress P01 001 50`: Görev ilerlemesini %50 olarak kaydeder.
- `python registry/manage_registry.py complete P01 001`: Görevi şifreler, mühürler ve arşivler.
- `python registry/manage_registry.py dashboard` (veya `list`): Açık görev menüsünü gösterir.
- `python registry/manage_registry.py next`: Açıkta bekleyen en acil/sıradaki görevi ajana sunar.

## 5. Görev Yaşam Döngüsü (The 6-Step Workflow + Gatekeeper)
Bir ajan sıfırdan bir görev alıp kodlamaya geçtiğinde bu 6 kilitli adımdan geçer. Her atlamada `Sentinel Guard` kurallara uymayan ajanı durdurur.

0. **[MISSION CONTROL]:** Ajan, herhangi bir görevi devraldığında veya yeni bir görev açacağında `.agent/skills/model-dispatcher` kurallarını çalıştırıp uygun model (Kota Onayı) ve strateji belirler.
1. **Create Task:** Otonom ise `manage_registry.py create-task` çalıştırılır. Dosya `backlog` klasöründe oluşur.
2. **Brainstorm:** `/superpowers-brainstorm` ile hedef ve kısıtlar tartışılır → `brainstorm.md` dosyasına Sentinel İmzası (`write_artifact.py`) ile atılır. **DUR.**
3. **Plan:** `/superpowers-write-plan` ile doğrulanabilir adımlar planlanır → `plan.md` dosyasına kaydedilir. **ONAY BEKLE.**
4. **Activate:** Onay alındığında `manage_registry.py activate` komutu çağrılır.
   - ⛔ **GATE CHECK:** Sistem `brainstorm.md` ve `plan.md`'nin boş veya imzasız olup olmadığına bakar. Eksiklerse `sys.exit(1)` ile işlemi REDDEDER.
5. **Executing:** Kod yazılır. Dörtlü Mühür kurallarına harfiyen uyulur (`pnpm lint`, `tsc`). Sık sık `progress` komutuyla veri güncellenir.
6. **Review & Complete:** `/superpowers-review` testinden geçilir. `/bitir` çağrıldığında `manage_registry.py complete` komutu çalışır.
   - ⛔ **GATE CHECK:** Dosyanın statüsü `active` değilse veya doğrulamalar atlanmışsa kapanış reddedilir. Kapanan görev `archive/completed` klasörüne geçer.
