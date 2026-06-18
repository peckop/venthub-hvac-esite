# İMPLEMENTASYON BRIEF — Admin Shell E2: Bildirim Inbox'ı (ilgi-bekleyen toplayıcı)

> `docs/standards/collaboration-protocol.md` kurallarına tabidir. Şerit sahibi: **Controller #1 (admin)**.
> Worker üretir → push → **DURUR**. Son kontrol + master'a merge = Controller (Claude), Worker DEĞİL.
> **Dal kuralı:** Worker master'dan TAZE kendi dalını açar (öneri `feat/admin-e2-inbox`); SADECE §4 dosyalarına dokunur.
> Cetvel: `admin-standard.md §10` (shell) + `admin-capabilities.md §4.5` (E2). Worker harness: `maestro-feature` (DİKEY: extend + i18n + test).

## Worktree (K0)
```bash
git fetch origin
git worktree add ../vh-e2-inbox -b feat/admin-e2-inbox origin/master
cd ../vh-e2-inbox && pnpm install
```

## 1. Bağlam (canlı kod — 2026-06-18 doğrulandı)
- **`src/components/admin/AdminRealtimeNotifications.tsx`** (376 satır) = **ZATEN VAR + MOUNTED**: header'da zil ikonu + dropdown panel, `AdminLayout.tsx:136`'da render ediliyor. Şu an YALNIZ realtime olayları gösteriyor: `venthub_orders` INSERT + `inventory_movements` INSERT (Supabase realtime channel), Sonner toast, okunmamış kırmızı badge. **Bu rewrite DEĞİL — mevcut bileşeni GENİŞLET.**
- **`AdminLayout.tsx:43`** `useRole()` → `{ canAccess(path), canWrite(entity), isReadOnly }`. Mount noktası header sağ (line 119-141), avatar yanı.
- **i18n:** `dashboard.{tr,en}.ts` zaten realtime bildirim metinlerini içeriyor (`notificationCenter`, `unreadCount`, `clearAll`, `allRead`, `noNewActivity`, `onlyLast20Notifications` — 79-94). Yeni tipler için buraya anahtar eklenir (yeni dosya YOK).
- **Veri kaynakları** (AdminDashboardPage `loadKPIs` zaten hesaplıyor — YENİDEN KULLAN, kopya sorgu yazma).

## 2. Hedef (E2 tanımı)
Zil/inbox, realtime olayların yanında **"ilgi bekleyen" duran-durum sayıları** da göstersin: kullanıcı admin'e girdiğinde "ne beni bekliyor?" tek bakışta. Her öğe: tip + sayı + ilgili admin rotasına link (tıkla → git). RBAC-kapılı (rolün göremeyeceği tip görünmez), i18n, a11y.

## 3. Mimari (genişletme)
Mount'ta (ve makul aralık/realtime'da) **4 kaynağı paralel sorgula** (`Promise.allSettled` — biri patlarsa diğerleri görünür), her biri RBAC-kapılı, sonuçları inbox öğesi olarak grupla:

| Tip | Kaynak | "İlgi bekliyor" filtresi | RBAC | Link |
|---|---|---|---|---|
| Bekleyen iade | `venthub_returns` | `status in ('requested','approved')` | `canWrite('returns')` | `/admin/returns` |
| Sevk bekleyen sipariş | `view_admin_orders` | `status in ('confirmed','processing')` + `shipped_at is null` | `canWrite('orders')` | `/admin/logistics` |
| Düşük stok | `products` | `stock_qty < low_stock_threshold` (AdminDashboard `alarmCount` mantığı) | `canWrite('inventory')` | `/admin/inventory` |
| Çözülmemiş hata | `error_groups` | `status != 'resolved'` | `canWrite('errors')` | `/admin/error-groups` |
| (ops.) Kupon | `coupons` | aktif+yakında-biten | `canWrite('coupons')` | `/admin/coupons` — düşük öncelik, atlanabilir |

- **Reuse zorunlu:** İade/sevk/stok sorguları AdminDashboardPage `loadKPIs` (65-78) + `alarmCount` (144-165) mantığını YENİDEN KULLANIR. error_groups için ErrorGroups veri-çekim altyapısını referans al. Sıfırdan kopya sorgu YAZMA.
- **DI:** Yeni sayım/aggregate fonksiyon(lar)ı `lib/services` veya `lib/admin`'de **`supabase: SupabaseClient<Database>` ilk-parametreli** (modül-düzeyi client importu YASAK). Bileşen client'ı bu fonksiyona geçirir.
- Mevcut realtime order/stock davranışı + Sonner toast + okunmamış badge **korunur**, üstüne bu duran-durum öğeleri eklenir.

## 4. Dosyalar
| Aksiyon | Dosya |
|---|---|
| MODIFY | `src/components/admin/AdminRealtimeNotifications.tsx` (4 kaynağı topla + RBAC + render) |
| YENİ (ops.) | `src/lib/admin/inboxCounts.ts` (DI'lı aggregate sayım fonksiyonları — reuse sarmalı) |
| MODIFY | `src/i18n/dictionaries/admin/dashboard.{tr,en}.ts` (yeni tip anahtarları, TR/EN parite) |
| YENİ/GENİŞLET | `AdminRealtimeNotifications` test (4-kaynak toplama + RBAC süzme + axe) |

## 5. Kısıtlar (ihlal = ret)
1. **DI:** sayım fonksiyonları `supabase`-parametreli; modül-düzeyi statik client importu YASAK (AST testi zorlar).
2. **Tip:** `any` YASAK, strict TS.
3. **RBAC:** her tip `useRole().canWrite(entity)` ile süzülür (sales rolü hata-bildirimi GÖRMEZ — testle kanıt).
4. **Tenant/güvenlik:** RLS-korumalı normal client; `service_role` bypass YASAK; açık tenant-WHERE EKLEME (RLS gateway, ileriye-uyumlu — R4).
5. **i18n:** tüm metin sözlükten, TR/EN parite (keycheck), `_t()||'fallback'` ve hardcoded string YASAK. INV-5 (namespaced ≥2 segment) geçer.
6. **Design token:** arbitrary Tailwind/HEX YASAK → `adminUi.ts`/`tokens.js`/HSL.
7. **a11y:** zil `aria-label` + okunmamış sayısı erişilebilir; dropdown `role="menu"`/`listbox`; öğeler klavye-erişilebilir; `focus-visible`; Esc kapatır. **axe = 0.**
8. **Reuse (kritik):** mevcut dashboard sorgu mantığını YENİDEN KULLAN; yeni dosya = toplama, kopya DEĞİL. Eklemeden önce CodeGraph/grep ile "bu zaten var mı?" kontrol et.

## 6. KAPSAM DIŞI (yapma)
- Yeni `notifications` DB tablosu / kalıcı okundu-durumu (mevcut client-side unread korunur) · push/e-posta bildirimi · E1 komut paleti · E8 klavye-nav · sidebar redesign · yeni RPC/migration. (Tablolara mevcut `select`/`count` ile sor.)

## 7. Kabul kriterleri (iki katman)
**A) Worker hızlı kapı (build YOK):** type-check 0 · lint 0 · test geçer · axe 0 · inbox ≥4 kaynağı RBAC-kapılı topluyor (test) · realtime order/stok regresyon yok · i18n TR/EN parite · `any` yok · arbitrary token yok. → push + **DUR**.
**B) Controller kapı:** A'yı diff'ten tekrar koş + **`pnpm build`** (RSC sınırı) + §10.4 shell cetveli · manuel: her sayım RLS'e mi dayanıyor (tenant-leak yok) · RBAC süzme doğru · linkler doğru rota. Yeşilse → commit + PR + merge.

---
*Kaynak: canlı kod (Explore subagent, 2026-06-18) + admin-standard §10 + admin-capabilities §4.5 (E2). Worker = Antigravity; Architect+Judge = Claude.*
