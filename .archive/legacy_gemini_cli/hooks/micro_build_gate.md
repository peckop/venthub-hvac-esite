# 🏗️ GÖREV: MİKRO-DERLEME KAPISI (MICRO-BUILD GATE)
> [!CAUTION]
> **TOPLU ENKAZ YARATMAK YASAKTIR.** Kodları yazıp yazıp en son `build` almak fiyaskodur.

## 🚨 SIFIR TOLERANS KURALI:
Bir görev içinde **3'ten fazla `.ts` veya `.tsx` dosyasında** (veya modifiye ettiğin dosyaların etki alanı büyükse) değişiklik yaptığında:

1. **ZORUNLU FREN:** 4. dosyaya geçmeden önce (Ajan) kendi kendine duracaksın.
2. **TSC TETİKLEMESİ:** Terminal üzerinden derleme testini (Örn: `pnpm exec tsc -b tsconfig.build.json` veya benzeri lint komutları) çalıştıracaksın.
3. **DOĞRULAMA:** Çıktıda bir hata varsa; ileri gitmeyi (yeni özellik eklemeyi) derhal bırakıp, o anki derleme hatasını çözmek zorundasın.

Büyük Refactoring işlerinde (Örn: Series dönüşümü, Kategori Mimarisi değişimi) eski dosyaların "kırık" kalmasına göz yumup yeni dosyalara atlayamazsın. **Proje her an, her 3 dosyada bir DERLENEBİLİRLİĞİNİ korumak zorundadır.**
