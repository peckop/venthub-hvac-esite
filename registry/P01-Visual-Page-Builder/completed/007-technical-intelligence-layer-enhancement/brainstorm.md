# Brainstorm: 007 - Teknik Zeka (Technical Intelligence)

## 🎯 Hedef
Ürünlerin ham teknik verilerini (Spec) analiz ederek, kullanıcıya ve Google'a anlamlı "Mühendislik Çıkarımları" sunan bir zeka katmanı oluşturmak.

## 🧠 Teknik Kararlar ve Mimari

### 1. Analiz Motoru (The Inference Engine)
Ürünlerin `technical_specs` (JSONB) alanındaki verileri şu kriterlere göre işleyeceğiz:
- **Ses Eşiği:** < 30dB -> "Ultra Sessiz", 30-45dB -> "Konfor Sınıfı".
- **Verimlilik Eşiği:** > %85 -> "Enerji Yıldızı".
- **Basınç Gücü:** > 200Pa -> "Endüstriyel Güç".

### 2. Dinamik PDP Blokları (Smart Summary)
Ürün detay sayfasında (PDP), bu verilerden üretilen 3 cümlelik bir "Mühendislik Özeti" bloğu eklenecek:
- *Cümle 1:* Performans (Debi ve Basınç).
- *Cümle 2:* Konfor (Ses ve Verimlilik).
- *Cümle 3:* Kullanım Alanı Önerisi (Analize dayalı).

### 3. SEO ve Metadata Üretimi
Teknik özellikler değiştikçe (örneğin bir fanın motoru güncellendiğinde), sayfanın metadata'sı ve "H2" başlıkları bu zeka motoru tarafından otomatik güncellenecek.

## 🛡️ Riskler
- **Veri Tutarsızlığı:** Bazı ürünlerde `technical_specs` boş veya farklı şemada olabilir. (Çözüm: Zod Validation ve Fallback metinler).
- **Performans:** Analiz işlemi her sayfa yüklenişinde değil, veri güncellendiğinde (veya Build zamanında) yapılmalı.

## ✅ Karar
Bu zeka katmanı, VentHub'ı sadece bir "Katalog" olmaktan çıkarıp bir "Mühendislik Danışmanı" haline getirecektir.
