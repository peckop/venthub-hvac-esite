# 🛑 GÖREV: TIP GÜVENLİĞİ VE KAÇAK KONTROLÜ (TYPE SAFETY ENFORCEMENT)
> [!CAUTION]
> **TİP KAÇAĞI (ANY/UNKNOWN) KULLANIMI KESİNLİKLE YASAKTIR.**

## 🚨 SIFIR TOLERANS KURALI - HARD BLOCK:
Ajan (Sen), bir TypeScript (`.ts` / `.tsx`) dosyası içinde aklına estiği gibi "tip hatasını susturmak (halının altına süpürmek)" için aşağıdaki yasaklı kelimeleri **KULLANAMAZSIN:**

❌ `as any`
❌ `@ts-ignore` 
❌ `@ts-expect-error` (Zorunlu mimari açıklama yoksa)
❌ `as unknown as`
❌ `// eslint-disable`
❌ `Record<string, any>` (Bilinmeyen obje geçiştirmeleri)

### 🛡️ ZORUNLU ÇÖZÜM YOLU (Source of Truth):
1. Bir tip uyuşmazlığı varsa (özellikle Supabase verilerinde); sorunu uydurma tiplerle değil, **`src/types/database.types.ts`** veya **`src/types/db-rows.ts`** altındaki GERÇEK tiplerle (interface/alias) çözmek zorundasın.
2. JSON alanları (örn: `technical_specs`) işlerken, kaba kuvvet değil `isRecord` gibi Type Guard fonksiyonları yazmalısın.
3. Linter sana kızıyor diye `any` yazıp kaçamazsın. Eğer çözüm bulamıyorsan kodu eski haline getirip kullanıcıdan (Mimar) yardım isteyeceksin. Mühürlenmiş hiçbir projeye `any` yazarak sızamazsın.
