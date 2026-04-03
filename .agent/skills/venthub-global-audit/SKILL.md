---
name: venthub-global-audit
description: Proje genelini veya büyük modülleri tepeden tırnağa Fiziki (Terminal) Radar ve Komutlarla test eder. Hallucination/Mental taramayı KESİN OLARAK yasaklayan, salt JSON kanıta dayanan Production Kalkanıdır.
---

# VentHub Global Audit & Review Skill (ZORUNLU JSON EDİSYONU)

## 🚨 YASAK (HALLUCINATION MÜHRÜ)
> [!CAUTION]
> **ZİHİNSEL TARAMA VE TAHMİN YASAKTIR!**
> Kullanıcı sizden bu skill'i kullanarak inceleme yapmanızı (audit, analiz) istediğinde; kafanızdan dosyaların bağlamını düşünüp *"Kodlar temiz görünüyor, sızıntı yok"* demek **kesinlikle yasaktır.** 
> Hiçbir denetim (audit) komut çalıştırılmadan ve somut log kanıtı elde edilmeden geçerli sayılamaz.

## 🎯 Çalışma Mantığı ve Zorunlu JSON Formu
Bu Auditor skill'inin amacı, size tavsiye vermek değil, sizi fiziksel olarak kanıt toplamaya zorlamaktır. `venthub-global-audit` komutu geldiğinde **TÜM İŞLEMLERİ BIRAKIP** aşağıdaki adımları ŞU SIRAYLA uygulayacaksınız:

### 1. Şablonu Kopyala (audit-template.json)
İlk adım olarak, `.agent/skills/venthub-global-audit/audit-template.json` dosyasını bir taslak (scratch) olarak kopyalayın (veya okuyun). Göreviniz bu JSON'ı **terminal komutlarının birebir sonuçlarıyla** doldurmaktır. 

### 2. Radarları Çalıştır (Mekanik Tetikleyiciler)
JSON içindeki maddeleri kafanızdan değil, `run_command` üzerinden şu komutları sırayla göndererek doldurun:
- **Lint:** `npm run lint` veya `pnpm run lint`
- **Compiler:** `npx tsc --noEmit`
- **Sızıntılar (Grep):** Sabit (hardcoded) URL'leri bulmak için `grep_search` kullanarak `href="/` aramaları yapın. UUID sızıntısı var mı diye bakın (`prod.id` tarzı sızıntılar).
- **Middleware JWT RBAC:** `src/middleware.ts` içinde `supabase.from` gibi bir sorgu var mı `grep` atın.

### 3. Çıktı Üret (Zorunlu JSON Kanıtı)
Tüm komutları çalıştırdıktan sonra kullanıcıya "Her şey temiz" demek yerine, doldurduğunuz (ve komut sonuçlarını, exit_code'ları kanıt olarak içeren) **JSON formatını bir Artifact olarak üreterek** sunun.

**Eğer bir komut (örneğin tsc) Exit Code 1 verirse:**
Bu json objesindeki `"status"` kısmını `FAIL` yapın, `"evidence"` kısmına hata logunu anında yazın ve `overall_ship_status`'u `BLOCKED` yapın. Sorunları kendi inisiyatifinizle gizlemeyin veya "Önemsiz" diye atlamayın!

## 📋 Ekstra Denetim İpuçları (JSON'ı Doldururken Rehber Al)
Komutlarla tarama yaparken radarınızın özellikle şunları yakaladığından emin olun:
1. **[Yeni Kural] SEO ve JSON-LD UUID Sızıntıları:** Artık `<script type="application/ld+json">` içinde `prod.slug || prod.id` mantığı yasaktır! Yalnızca slug kullanılabilir.
2. **[Yeni Kural] JWT ile Middleware:** Edge Runtime veritabanı yorgunluğunu sevmez. Rol kontrolü JWT Claims (`user_metadata.role`) üzerinden yapılmalıdır. DB fetch'i görürsen raporla!
3. **Hardcoded String Yasağı:** `Routes.product(slug)` veya `Routes.category(slug)` gibi kütüphane fonksiyonları varken UI'da `href="/category/{slug}"` yazan her kod BLOCKED nedenidir.
4. **Hydration ve CLS:** Görsellerin (img) boyutu/genişliği boş bırakılamaz. Dinamik veri beklenirken iskelet (Skeleton) yoksa raporla.
5. **Type Any Yasaktır:** Tip esnemelerine tolerans gösterilemez.

---
**Özet Kural:** 
Sisteme yalan söyleyemezsin. Gözle baktığın hiçbir şeye `PASS` verme, yalnızca `run_command` ve terminal loglarına güven!
