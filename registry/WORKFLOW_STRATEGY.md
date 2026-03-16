# VentHub İş Süreci ve Otonom Yönetim Stratejisi (WORKFLOW_STRATEGY)

Bu döküman, VentHub projesindeki iş akışının, disiplinin ve teknik hedeflerin "Kalıcı Hafızası"dır. 

## 1. Registry Disiplini ve Otonom İşleyiş (V7)
Bir AI asistanı göreve başladığında şu otonom akışı izler:
1. **Dashboard Tarama:** `registry/PULSE.md` üzerinden genel durumu anlar.
2. **Görev Seçimi:** `registry/PXX-Project/active/` altındaki ilgili klasöre girer.
3. **Dosya Okuma:** Klasörle aynı isme sahip `ID-name.md` (Checkboxlar), `brainstorm.md` (Strateji) ve `plan.md` (Adımlar) dosyalarını okur.
4. **Güncelleme:** Yapılan her işlemden sonra `registry_sync.py` script'ini çalıştırarak dashboard'u günceller.

## 2. Nihai Hedef: "Visual Page Builder"
Projenin kalbi, kategori ve ürün sayfalarını kod bağımlılığından kurtarmaktır. Her yeni görev (Otorite kurma, teknik zeka vb.), bu görsel oluşturucunun bir parçasıdır.

## 3. Kodlama ve Tip Güvenliği
- Tüm işlemler `src/types/database.types.ts` merkezli yürütülür.
- `any` kullanımı kesinlikle yasaktır (Anayasa kuralı).

---
*Bu strateji, projenin "Kimseye Bağımlı Kalmadan" büyümesini sağlar.*
