# Türkçe İletişim Protokolü (Turkish Communication Protocol)

> **Enterprise Kuralı:** Bu projede kullanıcıyla yapılan tüm yazılı etkileşimler, ara durumlar, terminal raporları, commit açıklamaları ve tüm raporlar istisnasız TÜRKÇE olacaktır.

## 📌 Kurallar ve Prensipler

1. **Yazılı İletişim:** Kullanıcıya verilen tüm cevaplar, açıklamalar, ara bilgilendirmeler ve yönlendirmeler Türkçe olarak yazılmalıdır.
2. **Commit ve Push Açıklamaları:** Git commit'leri ve push işlemleri sonrasında kullanıcıya sunulan teknik açıklamalar Türkçe olarak detaylandırılmalıdır. (Conventional Commit mesajları standart gereği İngilizce yazılabilir, ancak kullanıcıya yapılan açıklamalar Türkçe olmalıdır.)
3. **Raporlama:** Kalite güvence, test, derleme ve diğer terminal çıktılarının özetlenmesi tamamen Türkçe olmalıdır.
4. **Ara Durumlar (Intermediate States):** İşlemler devam ederken veya arka plan görevleri beklenirken yazılan tüm geçici mesajlar Türkçe olmalıdır.

---

## 🔒 Kod Dili Kuralı (Code Language Rule)

> **KESİN KURAL:** Kaynak kodun içindeki HER ŞEY İNGİLİZCE yazılır. Türkçe sadece kullanıcıyla konuşurken kullanılır.

### İngilizce olması ZORUNLU olanlar:
- Kod yorumları (`// comment`, `# comment`, `/* */`)
- Docstring'ler ve JSDoc blokları
- Değişken, fonksiyon, class ve dosya isimleri
- `print()`, `console.log()`, `logger.*` mesajları
- Error mesajları ve exception açıklamaları
- Git conventional commit mesajları (`feat:`, `fix:`, `refactor:` vb.)
- YAML/JSON metadata alanları (description, outputs, inputs)
- README ve teknik dokümanlar (`.md` dosyaları proje içindeyse)

### Türkçe olması ZORUNLU olanlar:
- Kullanıcıya verilen chat cevapları ve açıklamalar
- Artifact raporları ve özetler (kullanıcıya sunulan)
- Terminal çıktı özetleri (kullanıcıya sunulan)
- SKILL.md içindeki `description` alanı (kullanıcı-facing ise Türkçe olabilir)
