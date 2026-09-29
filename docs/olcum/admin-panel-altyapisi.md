# Ölçüm defteri: yönetici paneli — kendi mi, kütüphane mi, hazır mı

Sahibi: OPS · Son doğrulama: 2026-09-29 · Kaynak: Recep 09-29 "önceki ve şimdiki ölçümleri bir md'de birleştir"
Son ölçüm: 2026-09-29 (OPS, 2 Sonnet). KARAR 179 = EVET: kendi paneli koru, genel parçaları olgun kütüphanelere devret.

Bizim panel: ~32.900 satır, 26 ekran grubu (89 dosya); 12 ayda her ~9 değişiklikten biri panele. UnoPIM ~%10 devralır, ~%90 bizde kalır. 09-29 kusurları: tablo çekirdeği sonsuz döngü (16 tablo), tek ürüne fiyat girişi yok, fiyat değişim kaydı yok (180 ile eklendi), CSV formül açığı, kategori görsel yükleme olmayan kovaya.

| Aday | Hüküm | Neden |
|---|---|---|
| shadcn-admin | Kopyalanmaz, fikir kaynağı | Vite + TanStack Router + Tailwind 4 + Clerk |
| TanStack Table + shadcn data-table | UYAR (1. öneri) | Tablo çekirdeği, en düşük risk, MIT |
| Refine (başsız) | Koşullu, alınmadı | Supabase uyumlu ama hepsi istemci, bakım yavaş |
| react-admin | Uymaz | MUI zorunlu |
| Medusa, Saleor | Uymaz | Kendi arka uç/DB |
| Directus, NocoBase, Appsmith | Uymaz | RLS'i atlar / lisans / düşük-kod |
| Ayrı Vite SPA | Önerilmez | Sunucu tarafı yok, ikinci dağıtım |

Plan: ürün tablosu TanStack pilotu (REC-440, ADMIN) → ölç → 18 tablo → 10 modal → kural "genel bileşenden önce olgun kütüphane".
Yeniden ölçme tetikleyicisi: pilot sonucu; UnoPIM yazma kolu açılırsa.
