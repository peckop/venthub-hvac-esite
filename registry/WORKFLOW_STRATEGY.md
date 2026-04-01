# VentHub İş Süreci ve Otonom Yönetim Stratejisi (WORKFLOW_STRATEGY)

Bu döküman, VentHub projesindeki iş akışının, disiplinin ve teknik hedeflerin "Kalıcı Hafızası"dır. 

## 1. Registry Disiplini ve Otonom İşleyiş (V8 + JSON Schema + Superpowers)
Bir AI asistanı göreve başladığında şu otonom akışı izler:
0. **Hafıza Kontrolü (Recall — her oturumun ilk komutu):** `python registry/engine.py recall` — duraklatılmış görev varsa önce onu bitir.
1. **Dashboard Tarama:** `registry/PULSE.md` üzerinden genel durumu anlar.
2. **Görev Seçimi:** `registry/PXX-Project/active/` altındaki ilgili klasöre girer.
3. **Superpowers Döngüsü (Zorunlu — JSON Tabanlı):**
   - `/superpowers-brainstorm` → `brainstorm.json` oluştur, doğrula: `python registry/engine.py validate registry/PXX/YYY/brainstorm.json`
   - `/superpowers-write-plan` → `plan.json` oluştur, çapraz kontrol: `python registry/engine.py cross-validate registry/PXX/YYY`
   - **Implement:** Kodu yaz. Karmaşık değişimlerde `superpowers-tdd` skill'ini kullan.
   - `/superpowers-review` → `review.json` oluştur, doğrula: `python registry/engine.py validate registry/PXX/YYY/review.json`
   - `/bitir` → Dörtlü Mühür (Lint + TSC + Build) + `python registry/engine.py finalize-task registry/PXX/YYY`
4. **Gatekeeper (V8 Engine):** Pipeline durumu için `python registry/engine.py pipeline status registry/PXX/YYY` komutu kullanılır. Eksik veya geçersiz artifact varsa süreç ilerleyemez.

## 2. Nihai Hedef: "Visual Page Builder"
Projenin kalbi, kategori ve ürün sayfalarını kod bağımlılığından kurtarmaktır. Her yeni görev (Otorite kurma, teknik zeka vb.), bu görsel oluşturucunun bir parçasıdır.

## 3. Kodlama ve Tip Güvenliği
- Tüm işlemler `src/types/database.types.ts` merkezli yürütülür.
- `any` kullanımı kesinlikle yasaktır (Anayasa kuralı).
- Tüm dinamik rotalar Next.js 15 Async Params protokolüne uygun şekilde `await` edilmelidir.

## 4. 🌐 Linear + Registry Sinerji Stratejisi
- **Linear (Bulut):** Milestone, Roadmap ve üst düzey görev takibi.
- **Registry (Yerel Sentinel):** Ajan otonom yönetimi, kriptografik dosya güvenlik imzalama (Anti-Forgery) ve tam otonom işleyiş.
- İki sistem birbirini tamamlar, ikisi de tek başına yeterli değildir. Her görevin sonunda Linear statüsü `mcp_linear_save_issue` (VENT-XXX ID'leri ile) güncellenmelidir.

---
*Bu strateji, projenin "Kimseye Bağımlı Kalmadan" pürüzsüz büyümesini sağlar.*
