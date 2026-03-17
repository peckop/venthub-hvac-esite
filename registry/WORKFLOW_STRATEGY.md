# VentHub İş Süreci ve Otonom Yönetim Stratejisi (WORKFLOW_STRATEGY)

Bu döküman, VentHub projesindeki iş akışının, disiplinin ve teknik hedeflerin "Kalıcı Hafızası"dır. 

## 1. Registry Disiplini ve Otonom İşleyiş (V7 + Superpowers)
Bir AI asistanı göreve başladığında şu otonom akışı izler:
1. **Dashboard Tarama:** `registry/PULSE.md` üzerinden genel durumu anlar.
2. **Görev Seçimi:** `registry/PXX-Project/active/` altındaki ilgili klasöre girer.
3. **Superpowers Döngüsü (Zorunlu):**
   - `/superpowers-brainstorm` → `brainstorm.md`'ya kaydet (Hedef, Risk, Kısıt)
   - `/superpowers-write-plan` → `plan.md`'ya kaydet (Adımlar, Doğrulama)
   - **Implement:** Kodu yaz. Karmaşık değişimlerde `superpowers-tdd` skill'ini kullan.
   - `/superpowers-review` → `review.md`'ya kaydet (Blocker/Major/Minor)
   - `/bitir` → Lint+test+commit+Registry sync (PULSE güncelle)
4. **Gatekeeper:** `manage_registry.py activate` komutu; `brainstorm.md` ve `plan.md` boşsa görevi aktive etmez.

## 2. Nihai Hedef: "Visual Page Builder"
Projenin kalbi, kategori ve ürün sayfalarını kod bağımlılığından kurtarmaktır. Her yeni görev (Otorite kurma, teknik zeka vb.), bu görsel oluşturucunun bir parçasıdır.

## 3. Kodlama ve Tip Güvenliği
- Tüm işlemler `src/types/database.types.ts` merkezli yürütülür.
- `any` kullanımı kesinlikle yasaktır (Anayasa kuralı).

---
*Bu strateji, projenin "Kimseye Bağımlı Kalmadan" büyümesini sağlar.*
