# Tier Quality Matrix — Kalite Beklentileri Referansı

Bu dosya `teamwork-director` skill'i tarafından okunur ve tier'a göre prompt'a enjekte edilecek kalite standartlarını tanımlar.

---

## 🏢 Enterprise Grade

Enterprise seviyesinde geliştirilen projeler için aşağıdaki standartlar **zorunludur**:

### Test & Doğrulama
- Her yeni public fonksiyon/metot için **unit test** zorunludur
- Kritik iş akışları için **integration test** beklenir
- Mevcut test baseline **hiçbir koşulda** düşürülemez
- Test coverage metrikleri izlenmelidir

### Hata Yönetimi
- Custom exception sınıfları veya uygun error types kullanılmalıdır
- Structured logging (severity levels: DEBUG, INFO, WARNING, ERROR) uygulanmalıdır
- Graceful degradation: Harici servis hatalarında sistem çökmemeli
- Timeout ve retry mekanizmaları harici çağrılarda bulunmalıdır

### Tip Güvenliği
- **Python:** Type hint zorunlu (Python 3.10+ syntax)
- **TypeScript:** Strict mode, `any` kullanımı yasak
- **JavaScript:** JSDoc type annotations önerilir

### Dokümantasyon
- Public API fonksiyonları için docstring/JSDoc zorunlu
- API kontratı değişiklikleri CHANGELOG'a eklenmeli
- Karmaşık algoritmalar inline comment içermeli

### Kod Kalitesi
- DRY prensibi: Kod tekrarı 3'ten fazla ise refactor
- Single Responsibility: Bir fonksiyon bir iş yapar
- Mevcut API kontratları korunmalı (breaking change yasak)

### Güvenlik (Eğer Uygunsa)
- Input validation tüm harici girişlerde
- Secret'lar environment variable veya güvenli store'da
- SQL injection / XSS koruması (web projeleri)

### Dokümantasyon Güncellemesi
- Geliştirme sonunda `README.md` ve `CHANGELOG.md` güncellenmelidir
- Kök dizindeki ilgili diğer `.md` dosyaları yapılan değişiklikleri yansıtmalıdır
- `CONTEXT.md` dosyasına DOKUNULMAMALIDIR (NotebookLM tarafından yönetilir)

### Gelecek Geliştirme Önerileri
- Ekip, geliştirme sürecinde tespit ettiği iyileştirme fırsatlarını sunmalıdır
- `RECOMMENDATIONS.md` dosyası kök dizine yazılmalıdır
- En az 5 somut öneri (performans, güvenlik, mimari, teknik borç, sonraki faz) içermelidir

---

## 💼 Professional Grade

Professional seviyesinde geliştirilen projeler için aşağıdaki standartlar beklenir:

### Test & Doğrulama
- Kritik path'ler (happy path + temel error path) için unit test zorunlu
- Mevcut test baseline korunmalıdır
- Edge case testleri önerilir ama zorunlu değil

### Hata Yönetimi
- Try-catch blokları ile temel hata yönetimi yeterli
- Console/log çıktısı ile hata raporlama

### Tip Güvenliği
- Public API'ler için type hint/annotation zorunlu
- Internal helper'lar için opsiyonel

### Dokümantasyon
- Public API'ler için docstring/JSDoc
- README güncellemesi önemli değişikliklerde

### Kod Kalitesi
- Bariz kod tekrarından kaçınma
- Mevcut mimari pattern'lere uyum

---

## 🚀 MVP Grade

MVP seviyesinde geliştirilen projeler için:

### Test & Doğrulama
- Happy path testleri yeterli
- Mevcut testler kırılmamalı (varsa)

### Hata Yönetimi
- Temel try-catch yeterli
- Kullanıcıya anlamlı hata mesajları

### Dokümantasyon
- README yeterli
- Inline comment opsiyonel

### Kod Kalitesi
- Çalışan, okunabilir kod
- Gelecekteki refactor'a açık yapı

---

## 🧪 Prototype Grade

Prototype seviyesinde:

### Test & Doğrulama
- Testler opsiyonel
- Manuel test yeterli

### Hata Yönetimi
- Console.log / print ile debug yeterli

### Dokümantasyon
- Gereksiz

### Kod Kalitesi
- Çalışması yeterli
- Hız, kaliteden önce gelir
