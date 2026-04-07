---
name: kod-kaynagi-dalisi
description: Sızdırılan veya açık kaynak bir kod tabanını sistematik olarak analiz edip VentHub'a uyarlanabilir pattern'leri çıkarır.
when_to_use: >
  Kullan: Bir yapay zeka aracının kaynak kodu veya referans bir projenin dosyaları incelenecekse
  ve bu incelemeden VentHub sistemine aktarılabilecek ilke ve pattern'ler çıkarılacaksa.
  Örnekler: 'bu kodu incele ve bize ne kazandırabilir anlat', 'şu repodan öğrenebileceklerimiz neler',
  'benchmark analizi yap', 'kaynak koddan pattern çal'.
allowed-tools:
  - list_dir
  - view_file
  - grep_search
  - search_web
  - write_to_file
---

# Kod Kaynağı Dalışı

Bir referans projeyi (sızdırılan, açık kaynak veya benchmark olarak alınan) inceleyip
VentHub'ın ajan sistemine adapte edilebilecek teknikleri çıkarmak için kullanılır.

## Hedef
İnceleme sonunda `.agent/` sistemine entegre edilebilecek en az 2 somut pattern belgelenmiş olmalı.
Kopyalama değil — ilham alma ve geliştirme.

## Adımlar

### 1. Yapı Haritası Çıkar
`list_dir` ile kaynak klasörün üst seviye yapısını tara.
Sadece ilginç görünen alt dizinlere in, tamamını okuma.

**Başarı kriteri:** Toplam dosya sayısı ve temel modüller belirlendi.

### 2. Hipotez Yaz (Girmeden Önce)
Dosya adlarına ve yapıya bakarak ne bulacağını tahmin et.
Tahminleri bir yere not al — çıkışta karşılaştırma için.

**Başarı kriteri:** En az 2 hipotez yazıldı.

### 3. Hedefli Dalış (Grep First)
Tam dosya okumadan önce anahtar kelimelerle tara:
```
grep_search: "lock", "gate", "queue", "parallel", "memory", "skill"
```
Sonuçlara bakıp hangi dosyaların okunmaya değer olduğuna karar ver.

**Başarı kriteri:** Okunacak dosyalar 10'un altında tutuldu.

### 4. Dosyaları Oku — Önce Başını Bak
Her dosyayı ilk 40-60 satır oku. Devam edip etmeyeceğine o 60 satırda karar ver.

**Başarı kriteri:** Her dosya için "değerli / atla" kararı 60 satırda verildi.

### 5. Bulguları Yaz
Her değerli pattern için:
- **Orijinal sistemde ne yapıyor?** (1 paragraf)
- **VentHub'da neye karşılık gelir?** (Somut bağlam)
- **Adapte etmek için ne gerekir?** (Değişiklik özeti)

**Başarı kriteri:** Her bulgu yukarıdaki 3 soruya yanıt veriyor.

### 6. Hipotez Karşılaştırma
Adım 2'deki tahminleri gerçeklerle karşılaştır.
"Hassiktir momenti" var mıydı? Neyi yanlış tahmin ettin?

**Başarı kriteri:** Kısa özet yazıldı — kazanılan ders bellekten kağıda döküldü.

## Kurallar
- Hiçbir zaman tüm dosyaları oku — "grep first, then read" prensibi
- Kaynak koddan direkt satır kopyalamak yasak — fikri al, yeniden yaz
- Her bulgu VentHub bağlamına oturtulmalı, değilse not etme
- registry/ dizinine dokunma — bulgular `.agent/` altına gider
