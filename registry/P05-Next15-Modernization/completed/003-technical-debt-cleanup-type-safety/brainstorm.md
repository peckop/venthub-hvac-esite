# Brainstorm: Admin Panel Erisebilirlik Sorunu

## 🎯 Hedef
Giriş başarılı olmasına rağmen admin paneline erişememe (tekrar login'e atma veya Access Denied) sorununu kökten çözmek.

## 🛠️ Mevcut Durum Analizi
- Kullanıcı login oluyor (yeşil bildirim alıyor).
- Admin paneline yönleniyor.
- `AdminLayout.tsx` içindeki `canAccess` kontrolü, `AuthContext`'ten gelen `role` bilgisinin yüklenmesini bekleyemiyor olabilir.
- `useRole` hook'u `useAuth`'u kullanıyor, `useAuth` ise `AuthContext`'i.
- `AuthContext` içinde `fetchRole` async çalışıyor, bu sırada `role` null kalıyor.
- `AdminLayout` bu sırada `loading` (authLoading || roleLoading) false ise (ki başlangıçta false olabilir veya auth bittiğinde role hala gelmemiş olabilir) `canAccess` false döner ve `router.replace('/')` tetiklenir.

## 🚀 Çözüm Seçenekleri

### Seçenek 1: RBAC Logic Standardizasyonu (Önerilen)
- `AuthContext` içindeki `role` yükleme sürecini daha sağlam hale getirmek.
- `AdminLayout` koruma mantığını `loading` durumuna daha sıkı bağlamak.
- `checkAdminAccessAsync` gibi doğrudan DB sorgusu yapan yedek mekanizmaları devreye sokmak.

### Seçenek 2: LocalStorage / Cookie Backup
- Rol bilgisini sadece DB'den değil, kısa süreliğine session metadata veya cookie'den okumak. (Daha hızlı ama senkronizasyon riski var).

## ⚠️ Riskler
- **Güvenlik Riski:** Yanlışlıkla yetkisiz birine admin erişimi vermek (Kabul edilemez).
- **UX Riski:** Çok uzun yükleme süreleri (Skeleton ile çözülecek).

## ✅ Kabul Kriterleri
- Admin kullanıcısı login olduktan sonra Dashboard'u görebilmeli.
- Sayfa yenilendiğinde (refresh) admin yetkisi kaybolmamalı.
- Yetkisiz kullanıcılar kesinlikle içeri alınmamalı.
