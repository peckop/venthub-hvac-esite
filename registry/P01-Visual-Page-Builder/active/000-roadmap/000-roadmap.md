---
id: "000"
title: "Roadmap"
status: "Active"
---

# Proje Stratejisi: Görsel Sayfa Oluşturucu (017)

Bu proje, VentHub'ın kategori ve ürün sayfalarını kod bağımlılığından kurtarmayı ve merkezi bir otorite yapısına kavuşturmayı hedefler.

## 🎯 Nihai Hedef
Kullanıcının (Admin) hiçbir kod yazmadan, veritabanından (JSONB) beslenen dinamik bileşenlerle yeni sayfalar oluşturabildiği otonom bir yapı (017 - Visual Page Builder) kurmak.

## 🏗️ Mimari Direkler (Salat)
- **Dinamik Veri Motoru (006):** İçeriklerin statik dosyalardan (`tr.ts`) kurtarılıp Supabase JSONB katmanına taşınması.
- **Otorite Odaklı İçerik:** Her sayfanın bir mühendislik dökümanı derinliğinde (Sessiz Fanlar örneğindeki gibi) teknik veri ve görsel karşılaştırmalar barındırması.
- **Master Şablon (016):** Tüm sayfaların görsel bir hiyerarşi ve standart dahilinde otomatik üretilmesi.

## 🚀 Kritik Yol Haritası
1. **006 (Aktif):** JSONB altyapısının kurulması ve ilk içerik göçü.
2. **003 (Aktif):** Isı Geri Kazanım (HRV) dikey uzmanlık sayfasının bu yeni sisteme adaptasyonu.
3. **007-017 (Backlog):** Teknik zeka, B2B hiyerarşisi ve nihai görsel arayüzün (Page Builder) teslimatı.
