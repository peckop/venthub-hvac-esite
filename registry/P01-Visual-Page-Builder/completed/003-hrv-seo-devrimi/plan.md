# Plan: 003 - HRV SEO Devrimi

## 📝 Operasyonel Adımlar

### Aşama 1: İçerik Üretimi (Authority JSON)
- [ ] HRV için marka mirası metinlerini hazırla (Avens & Vortice vurgulu).
- [ ] "Isı Transferi", "İç Hava Kalitesi" ve "EC Fan" teknik noktalarını detaylandır.
- [ ] Enerji tasarruf grafiği için değerleri netleştir (%90 vs %0).

### Aşama 2: Veri Girişi (DB Mühürlemesi)
- [ ] Hazırlanan JSON verisini `isi-geri-kazanim-cihazlari` slug'ına sahip kategoriye SQL ile mühürle.
- [ ] Kolon: `authority_content` (006'da oluşturuldu).

### Aşama 3: Görsel ve Teknik Doğrulama
- [ ] HRV kategori sayfasını (`/category/isi-geri-kazanim-cihazlari`) ziyaret ederek dinamik blokların (Brand, Technical, Problem) doğru render edildiğini kontrol et.
- [ ] Responsive görünümü ve ikon uyumunu test et.

### Aşama 4: SEO Mühürlemesi
- [ ] Kategorinin `seo_title` ve `seo_desc` alanlarını veritabanında güncelle.
- [ ] Sayfada H1-H4 hiyerarşisinin içeriğe uygunluğunu doğrula.

## 📈 Başarı Kriteri
HRV sayfası, Sessiz Fanlar kalitesinde zengin bir teknik döküman gibi görünmeli ve Google için yüksek otoriteli bir landing page haline gelmeli.
