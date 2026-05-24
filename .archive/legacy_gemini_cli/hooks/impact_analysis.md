# 🧨 GÖREV: ETKİ ANALİZİ (IMPACT ANALYSIS GATE) - ZORUNLU
> [!CAUTION]
> **BAĞIMLILIK KÖRLÜĞÜ YASAKTIR.** Bir dosyayı düzeltirken projeyi patlatamazsın.

## 🚨 SIFIR TOLERANS KURALI:
Aşağıdaki kritik dizinlerden HERHANGİ bir dosyayı (örneğin `Button.tsx`, `database.types.ts`, `useCart.ts`) modifiye etmeden veya silmeden ÖNCE:
1. `src/types/` (Tip Tanımları)
2. `src/hooks/` (Mantık Katmanı)
3. `src/components/ui/` (Merkezi Bileşenler)
4. `src/lib/` (Servisler ve Utilityler)

**İLK İŞİN ŞU KOMUTLARDAN BİRİNİ ÇALIŞTIRMAK ZORUNDADIR:**
- Ajan (Sen) `grep_search` aracını kullanarak değiştireceğin fonksiyonun/bileşenin/tipin adını tüm `src/` klasöründe aratmalısın.
- Çıkan bağımlılık (import edildiği) listesini zihnine kazı.
- Çıkan sonuçlardaki diğer X adet dosyayı da aynı PR/Aksiyon içinde "patlamaması için" güncelleyeceğini **AÇIKÇA TAAHHÜT ETMEDEN ANA DOSYAYA DOKUNAMAZSIN.**

Eğer bir dosyayı değiştirdiğinde 40 farklı Views sayfası bozulacaksa ve bunları anlık düzeltemeyeceksen, O DOSYAYI DEĞİŞTİREMEZSİN!
