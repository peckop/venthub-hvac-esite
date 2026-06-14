# Faz 1 — Kalan 6 Sayfa: Bölünmüş Göç Planı (mimar-ajan sentezi)

> 2026-06-13. Errors/AuditLog/Categories bitti (3/9). Kalan 6 sayfa için 5 paralel mimar-ajan
> derin plan çıkardı; aşağısı **kilitlenmiş kararlar** + parça-bölünmesi + dalga sırası.
> Ortak kurallar (hepsi): thin-page + `<Suspense>`; her yazma `mutateWithAudit` kapısından;
> i18n kendi grubuna, tr/en parity; export `table.fetchAllForExport()`; `persistKey` sayfa-başı;
> integration+axe-0 testi; `auditedByEdge=false` (ilgili edge fn KENDİ audit'ini yazmıyorsa — impl'de teyit).

## Dalga 3 — 4 sayfa PARALEL (her biri tek-ajan + yargıç + merkezi doğrulama)

### Movements (server, salt-okunur)
- **Çözüm:** `inventory_movements` → `products!inner(name,sku,category_id)` **embedded join** (desen zaten InventoryReport/Returns'te kullanılıyor). Böylece arama (ürün adı/SKU), kategori filtresi ve ürün-sıralaması **server-side** olur; eski client-sort + N+1 enrichment + sayfa-içi-arama silinir.
- Sort: product→`products.name` foreignTable order; date/delta/reason/ref→DB kolonu. Filtreler kit `filters` Record'una (reason `.in`, category `.eq(products.category_id)`, date `.gte/.lte`, batch). Kategori select = TÜM kategoriler (basit).
- Mutasyon yok (`hasWriteAccess=false`). Batch deep-link `initialFilters` + banner. **Tek ajan.**

### ErrorGroups (server, CRUD)
- 7 kolon; status+assigned satır-içi `<select>`; notes textarea-on-blur; bulk-status.
- **4 yazma da `mutateWithAudit`'e** — bunlardan **3'ü şu an audit'siz (status hariç) → boşluk kapanır.**
- Bulk-status: `BulkBar` + `panel` (status seçici). Expand satırı: `client_errors` detayını **lazy** çeken child (kit expand'i açınca mount → fetch). Realtime → `table.reload()`. **Tek ajan.**

### Returns (client, CRUD + durum-makinesi)
- Durum-geçiş makinesi ayrı saf helper (`allowedNextStatuses`); hem buton render hem mutasyon-guard onu kullanır (monoton geçiş garanti).
- Tek yazma (`handleStatusUpdate`) `mutateWithAudit` içinde **sıralı 3 yan-etki**: (1) returns update [audit'i tetikler], (2) order sync, (3) refund edge fn ['refunded'te], (4) notification edge fn — 2-4 best-effort. `venthub_orders!inner` join düzleştir (client arama/sort joined alanlarda çalışsın). Status chip = `FacetedFilter` (counts allRows'tan). **Tek ajan.**

### Users (client, çift-tab)
- **Çift-tab kararı:** tek `useAdminTable`, `activeTab` local state, fetcher tab'ı `useRef`'ten okur, tab değişince `table.reload()`. (İki instance / faceted reddedildi.)
- fetcher: admins→`listAdminUsers()`+`user_profiles` enrich; all→`user_profiles`. Tek `UserRow` şekli.
- Rol değiştirme → `mutateWithAudit(resource:'users', UPDATE, before/after role)`; aktör-rol gating'i AYNEN korunur (6 buton + self-demote guard). Erişim-yok → kit `hasReadAccess=isAdmin`+`accessDeniedState`. **Tek ajan.**
- *Karar:* audit table etiketi `'users'` (eski `'user_profiles'` yerine — canWrite anahtarıyla tutarlı; süreklilik minör).

## Dalga 4 — Orders (EN ZOR, parça-bölünmüş, ayrı)
Sadece **LIST** görünümü göçer; **Board (kanban) Faz 2'de kalır** (thin-page'te toggle: list→yeni body, board→`AdminOrdersBoard`).
- server/server; client-sort bloğu silinir. Deep-link (`?q`, `?preset=pendingShipments`) kit URL-sync ile **bedava** (eski deepLink useEffect'leri silinir).
- **5 yazma `mutateWithAudit`'e:** tek ship, bulk ship, bulk cancel, **notes INSERT, notes DELETE** (son ikisi şu an gate'siz/audit'siz → kapanır). 3 modal (ship/logs/notes) body içinde JSX kalır; bulk → `BulkBar`.
- **6 parça:** (A) iskele+thin-page → (B) fetcher+hook → paralel {(C) kolonlar+cell helper, (D) toolbar+deep-link-sil, (E) selection+BulkBar+TÜM mutateWithAudit} → (F) i18n+RBAC+temizlik. A,B sıralı; C,D,E paralel; F son.

## Dalga 5 — Products (en son, sıralı)
Kit-evrim sayfası; kalan tüm sayfalar oturduktan sonra, tek tek, kit'i gerekirse evrimleştirerek.

## Faz 1 KAPANIŞ
14→9 sayfa bitince (Errors,AuditLog,Categories,Movements,ErrorGroups,Returns,Users,Orders,Products):
K1+K4 ESLint kurallarını `error`'a aç (roadmap'teki selector'lar; Bash ile, guard'lı config).

## Açık teyitler (impl sırasında)
- Her edge fn (`admin-update-shipping`, `refund-order-mock`, `return-status-notification`) KENDİ admin-audit'ini yazıyor mu? Yazıyorsa `auditedByEdge=true` (çift-log önle); yoksa `false`.
- Movements: `.or(...,{foreignTable})` + `!inner` + `count:'exact'` join-filtrelenmiş sayıyı doğru veriyor mu (test'le doğrula).
