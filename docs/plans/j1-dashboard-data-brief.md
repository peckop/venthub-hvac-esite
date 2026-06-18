# İş J1 — Admin Dashboard: Gerçek Grafik Verisi

> Bu iş `docs/standards/collaboration-protocol.md` kurallarına tabidir. Kuralları TEKRAR ETMEZ, uyar.
> Şerit sahibi Controller: **#1 (admin)**. Worker üretir → push → **DURUR** (master'a merge ETME).

## Worktree kurulumu (K0 — paylaşılan klasör YASAK)
```bash
git fetch origin
git worktree add ../vh-dashboard -b feat/admin-dashboard-data origin/master
cd ../vh-dashboard
pnpm install
```

## Sorun
`src/views/admin/AdminDashboardPage.tsx` (~satır 61-67) — grafik verisi HARDCODED dummy:
```ts
// Dummy chart data for now to pass build
setChartData([{ date: 'Pzt', orders: 4, returns: 0 }, ...])
```
Sahte veri. Gerçek son-7-gün verisine bağlanacak.

## Yapılacak (kapsam DAR — yalnız bu)
1. Dummy `setChartData([...])` bloğunu KALDIR (yorum dahil).
2. **Orders serisi:** Zaten çekilen `ordersData` (`venthub_orders`; alanlar: `created_at`,
   `total_amount`, `status`; desc, limit 1000) üzerinden **son 7 takvim gününü** güne göre
   grupla → her gün için `orders` = o gün oluşturulan sipariş sayısı. **Ekstra sorgu YOK** —
   bellekte bucket'la (`ordersData` zaten elinde).
3. **Returns serisi:** Mevcut `returnsRes` yalnız COUNT (`head:true`) — satır vermiyor. Son-7-gün
   için HAFİF bir ek sorgu ekle: `venthub_returns`'ten `created_at`'i son 7 günle sınırlı çek
   (`.select('created_at').gte('created_at', <7 gün önce ISO>)`), güne göre say → her gün `returns`.
4. **Gün etiketi i18n:** `date` etiketi HARDCODED `'Pzt'` OLAMAZ. Son 7 günü kronolojik
   (eskiden→yeniye) sırala; her gün için **locale'den** kısa gün adı üret:
   `new Intl.DateTimeFormat(<locale>, { weekday: 'short' }).format(d)`. locale'i i18n'den al
   (mevcut `useI18n` / locale kaynağı — kodda nasıl erişiliyorsa onu kullan, uydurma).
5. `DashboardChartData` şeklini (`{ date, orders, returns }`) KORU — `SalesChart` bunu tüketiyor;
   sözleşme değişmez. **Boş günler 0 ile gelir** (7 noktanın hepsi dolu, eksik gün bırakma).

## Sınırlar / kurallar (ihlal = ret)
- **Read-only sayfa:** `mutateWithAudit` YOK, INV-6 N/A. Yazma EKLEME.
- `any` YASAK. Tüm Supabase satırları tiplenir.
- Mevcut `try/catch` + `setError` desenini KORU; yeni sorgu hatasını da kapsa.
- `loading` akışını bozma.
- Dummy/placeholder/sahte veri YASAK (işin amacı tam bunu kaldırmak).
- **Yalnız `AdminDashboardPage.tsx`'e dokun.** `SalesChart`'ı değiştirme. Başka dosya yok.

## Hızlı kapı (worker vurur — build YAPMA)
- `pnpm type-check` → 0
- `pnpm lint` → 0
- `pnpm test -- --run` → geçer
- (build'i Controller #1 vurur)

## Bitince
- Yalnız `AdminDashboardPage.tsx` stage'le → commit:
  `feat(admin): dashboard grafiği gerçek son-7-gün verisine bağla`
- `docs/system_tree.md` churn'ünü commit'e ALMA (`git checkout -- docs/system_tree.md`).
- push → **DUR**. (Controller #1 gate'ler + merge eder.)
