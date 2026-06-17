# VentHub Admin / Back-Office Standardı

> **Bu dosya nedir?** Gerçek, profesyonel bir e-ticaret admin panelinin **yapısal** standardı —
> "nasıl görünür" değil, **nasıl kurulur**. Dünyanın en iyi ticari admin'lerinin (Shopify, Medusa,
> Saleor) gerçekte nasıl çalıştığından damıtıldı, **VentHub'a uyarlandı**.
>
> **İki işi var:**
> 1. **Kontrat** — yeni veya yeniden yazılan her admin sayfası buna uymak zorunda.
> 2. **Cetvel** — mevcut paneli buna göre ölçmek için (§8 Uygunluk Kontrol Listesi).
>
> **Kaynaklar:** Refine · Shopify Polaris · Medusa Admin · Saleor Dashboard · shadcn-admin (provenance §9).
> Yaşayan doküman — büyür ama her an **kullanılır ve eksiksizdir**. Strateji: memory `standard-first-strategy`.

---

## 0. Sade dille: bir admin paneli neden "gerçek" olur?

Bir admin'i profesyonel yapan şey **güzelliği değil**, her sayfasının **aynı küçük kural setine** uymasıdır.
20 sayfa, 20 farklı şekilde yapılırsa → "derleme/yamalı" hissi (senin panelinin sorunu). Aynı 20 sayfa
**tek bir iskelete** oturursa → tutarlı, öngörülebilir, bakımı kolay = "gerçek."

İncelediğimiz beş otorite kaynağın **hepsi** şu beş kuralda birleşti. Bunlar pazarlık konusu değil:

| # | Kanun | Sade açıklama |
|---|-------|---------------|
| **K1** | **Tek ortak tablo iskeleti** | Her liste sayfası için tabloyu sıfırdan yazma. Tek bir "tablo kiti" yap, her sayfa onu *ayarlayarak* kullansın. |
| **K2** | **Durum URL'de yaşar** | Hangi sayfadasın, neyi sıraladın/filtreledin/aradın — hepsi adres çubuğunda. Böylece link paylaşılabilir, geri tuşu çalışır. |
| **K3** | **Tek yetki kapısı, her yerde** | "Bu kişi bunu yapabilir mi?" kararı tek yerden verilir ve menüde de, butonda da, fonksiyonun içinde de aynı kapı sorulur. **Ama asıl kapı sunucudaki RLS'tir.** |
| **K4** | **Her değişiklik iz bırakır** | Kim, ne zaman, neyi değiştirdi — sunucu tarafında kaydedilir (istemci kaydı güvenilmez). |
| **K5** | **Her sayfa tüm hâllerini ilan eder** | Yükleniyor / boş / hata / "sonuç yok" / yetkisiz — hiçbiri unutulamaz. |

Geri kalan her şey (i18n, a11y, design token, realtime, multi-tenant) bu beşin üstüne oturur. §6'da detay.

---

## 1. Sayfa arketipleri (bilgi mimarisi)

Beş kaynak da hemfikir: bir admin sınırlı sayıda sayfa **tipinden** oluşur. Her rota **birine** oturmalı —
"sistem-dışı" büyümüş sayfa yoktur (VentHub borcu: `AdminInventoryPage`, `AdminWebhookEventsPage`).

1. **Dashboard** — KPI kartları + grafik + son aktivite + uyarı. Giriş ekranı, tek.
   *VentHub'da var:* `StatCard`, `SalesChart`, `AbcPieChart`, `ActivityHeatmap`, `RecentOrdersTable`.
2. **Resource Index (Liste)** — bir kaynağın koleksiyonu; gez/ara/filtrele/sırala/toplu-işlem. **Panelin ~%80'i.** → §3
3. **Resource Details (Detay/CRUD)** — tek kaydı görüntüle/oluştur/düzenle. → §4
4. **Settings** — yapılandırma; hiyerarşik gruplanmış annotasyonlu form. → §5

---

## 2. Ortak tablo iskeleti (K1) — panelin kalbi

**Yakınsama:** Medusa `DataTable`, Saleor `Datagrid`, shadcn-admin `data-table/` kiti — üçü de **tek jenerik kit +
kaynak-başına config**. Sen her admin sayfasında bu mantığı kopyalamışsın; standart bunu **tekilleştirmek**.

### 2.1 Mimari: jenerik kit + feature dilimi (shadcn-admin modeli, VentHub'a uyarlı)

```
src/components/admin/data-table/        ← JENERİK KİT (bir kez yazılır, herkes kullanır)
├─ DataTable.tsx            # useReactTable host'u; tüm state'i kurar
├─ DataTableToolbar.tsx     # arama + faceted filtreler + reset + kolon görünürlüğü
├─ DataTableColumnHeader.tsx# sıralanabilir başlık (asc/desc/gizle + aria-sort)
├─ DataTableFacetedFilter.tsx # Popover + çok-seçim filtre (sayaçlı)
├─ DataTableViewOptions.tsx # kolon göster/gizle menüsü
├─ DataTablePagination.tsx  # sayfa boyutu + ilk/önceki/sonraki/son + "N seçili"
└─ DataTableBulkActions.tsx # seçim varken çıkan toplu-işlem çubuğu

src/features/admin/<entity>/            ← KAYNAK DİLİMİ (sayfa-başına config)
├─ columns.tsx             # ColumnDef<T>[] — kolonların TEK kaynağı (SSOT)
├─ schema.ts               # zod tipi
├─ <Entity>Table.tsx       # jenerik DataTable'ı bu kaynağın config'iyle sarar
└─ dialogs/                # CRUD form modalleri (state context ile yönetilir)
```

> **Not:** VentHub'ın hazır parçaları zaten bunların karşılığı: `ColumnsMenu`≈ViewOptions, `ExportMenu`,
> `BulkActionToolbar`≈BulkActions, `AdminToolbar`≈Toolbar. **İş = bunları tek kite toplayıp her sayfaya
> kopyalamak yerine import ettirmek.** Önerilen `useAdminTable` hook'u bu kitin state motoru olur (§7).

### 2.2 Liste state kontratı (K2 — Refine `useTable` modeli, hepsi onaylıyor)

Her liste sayfası şu state'i sağlamak ZORUNDA; ve hepsi **URL'ye senkron** (Refine `syncWithLocation`,
Saleor URL token'ları, shadcn-admin `use-table-url-state` — üçü de aynı):

- **Pagination:** `currentPage`, `pageSize`, `pageCount`, `total` — **server-side** varsayılan.
- **Sorting:** `sorters: [{field, order:'asc'|'desc'}]` — çok-kolon; başlıktan toggle; `aria-sort` + görsel ok.
- **Filtering:** `filters: [{field, operator, value}]` — faceted (durum/kategori).
- **Arama:** global, **debounced** (≥250ms).
- **URL senkron:** yukarıdakilerin hepsi adres çubuğunda → paylaşılabilir, geri-tuşu doğru, reload-güvenli.

### 2.3 Tablo davranış kontratı (TanStack + shadcn anatomisi)

Bir "tam" tablo şu parçalardan oluşur (hepsi jenerik kitte, bir kez):

| Yetenek | TanStack bağlantısı | VentHub karşılığı |
|---|---|---|
| Sıralama | `getSortedRowModel` + `column.toggleSorting()` | — |
| Filtreleme | `getFilteredRowModel` + `column.setFilterValue()` | — |
| Faceted filtre | `getFacetedRowModel` + `getFacetedUniqueValues` | — |
| Sayfalama | `getPaginationRowModel` | — |
| Row selection | `select` kolonu (header "tümü", satır checkbox) | `BulkActionToolbar` |
| Kolon görünürlüğü | `VisibilityState` + `getCanHide/toggleVisibility` | `ColumnsMenu` ✓ |
| CSV export | — | `ExportMenu` ✓ |
| Row actions | sondaki `actions` kolonu → `row.original` dropdown | — |

**Kritik kural (TanStack):** sort/filter/pagination **aynı tarafta** olmalı (hepsi client ya da hepsi server).
Karıştırma → sadece yüklü veriyi sıralar = sessiz bug.

### 2.4 Toplu işlemler (bulk actions) — Polaris + Saleor + Medusa hemfikir

- Toplu-işlem çubuğu **yalnızca satır seçiliyken** görünür; işlem bitince `clearSelection()`.
- Etiket = **fiil + isim** ("Ürünleri arşivle", "Siparişleri sil") — "Fulfillment: …" gibi prefix yok.
- Shift-tık = aralık seçimi; sayfalar arası "tümünü seç" desteklenir.
- **Her toplu mutasyon RBAC + audit'e tabi** (K3, K4) — VentHub'da bu eksikti, audit'te yakalandı.

### 2.5 Filtreler (Polaris 4-parça yapısı)

Arama alanı → 2-3 "öne çıkan" kısayol filtre + gerisi "Filtre ekle" arkasında → uygulanan filtreler (silinebilir
pill'ler) → **"Tümünü temizle"**. Pill = sadece değer ("Ödendi"), kategori prefix'i yok. Arama etiketi
eylem-odaklı ("Siparişlerde ara"), "metin girin" değil.

### 2.6 Durumlar (K5) — Saleor "üç hâl" kuralı

**Asla atlanamaz:** Yükleniyor (`AdminSkeleton` ✓) · Veri yok (`AdminEmptyState` ✓, tabloyu değil placeholder'ı
göster) · Hata · **Filtre-sıfır** (tablonun kendi "sonuç yok" satırı — *veri yok*'tan farklı şey) · Yetkisiz
(`AccessDenied` ✓). "Veri yok" ile "filtreledin sonuç çıkmadı"yı **karıştırma**.

---

## 3. Resource Index (Liste sayfası) — bileşim sırası

**Polaris yapısı (yukarıdan aşağı):**
1. **Sayfa başlığı** — kaynak adı çoğul ("Ürünler", "Siparişler") + sağ üstte **birincil eylem** ("Yeni ürün";
   oluşturma yoksa hiç koyma).
2. **Toolbar** — arama + filtreler + sıralama (§2).
3. **Tablo** (IndexTable) — satırlar **tıklanabilir → detay sayfasına gider**; sayısal hücreler sağa dayalı;
   başlık seti tanımlar ("50 ürün gösteriliyor").
4. **Sayfalama** — altta; ~50 öğeden sonra zorunlu.

---

## 4. Resource Details (Detay / CRUD) — bölüm bileşimi

**Yakınsama (Medusa `TwoColumnPage` + Saleor `DetailPageLayout` + Polaris iki-kolon):** detay sayfası
**bağımsız bölümlerin (card) bileşimidir**, tek dev form değil.

### 4.1 Yerleşim
- **İki kolon:** ana içerik **sol 2/3** (nesneyi *tanımlayan* bilgi: ad, açıklama, kalemler) + yan **sağ 1/3**
  (durum, metadata, özet, kanal/availability). Mobilde tek kolona iner.
- **Card-bazlı:** benzer içerik tek card'da; card'lar öneme göre sıralı. Her bölüm **kendi başlığı + kendi
  satır-eylemlerini** taşır (self-contained).
- Medusa standardı: her varlıkta **JSON görünümü + Metadata editörü** paneli.

### 4.2 Form + kaydetme (Saleor "Savebar state machine" + Medusa RHF+Zod)
- **Form:** react-hook-form + **Zod** validasyon; hata mesajı alan altında.
- **Sticky Savebar:** Sil (sol) · Vazgeç (→ listeye dön) · Kaydet. Kaydet butonu **`isSaveDisabled`** ile
  kontrollü (dirty/valid değilse pasif). Durum makinesi: default → loading → success/error.
- **Kirli-durum guard'ı:** kaydedilmemiş değişiklikle ayrılırken uyar.
- **Çift-submit engeli** + her sonuç **toast** (sonner).
- Sunucu hataları `__typename`/alan adına göre forma maplenir.

### 4.3 Create/Edit nasıl açılır? — VentHub kararı
İki geçerli kalıp var: (a) **route-modal** (Medusa: URL kaynak, deep-link, geri tuşu kapatır), (b) **context-driven
dialog** (shadcn-admin). VentHub App Router + mevcut `ProductFormModal`/`CategoryFormModal` kullanımıyla uyumlu
olan: **route-modal'a kademeli geçiş** (deep-link + geri-tuşu kazancı). Şimdilik mevcut modal'lar kalır,
yeni sayfalar route-modal kalıbını hedefler.

---

## 5. Settings arketipi (Polaris App Settings Layout)

- Sayfa başlığı (birincil+ikincil eylem) → **dikey istiflenmiş ayar grupları**.
- Her grup = **annotasyonlu iki-kolon satır**: sol = başlık + (gerekirse) kısa açıklama (~2fr), sağ = ilgili form
  alanlarını taşıyan card (~5fr). Gruplar arası ayraç; küçük ekranda tek kolon.
- İlişkili ayarlar **tek card'da** grupla; açıklamayı **sadece gerçekten faydalıysa** ekle (doldurma yapma).
- Settings ayrı bir IA kovasıdır (Medusa: store config, regions, users, **API keys**, …).

---

## 6. Çapraz-kesen zorunluluklar (her sayfada)

### 6.1 RBAC (K3) — tek kapı, iki katman + RLS
Karar **(resource, action)** ikilisiyle (Refine `can({resource, action, params})`; Saleor `RequirePermissions`).
**Aynı kapı** menüyü de, inline butonu da, fonksiyonu da korur.
- **Katman 1 — UI:** yetkisizse buton pasif/gizli (`AccessDenied`, `useRole().canWrite(entity)`).
- **Katman 2 — fonksiyon içi:** `if (!canWrite) return` — buton gizli olsa bile handler korunur.
- **Katman 3 — ASIL KAPI: Sunucu RLS.** İstemci guard'ı kozmetiktir; Refine bile "client kararı güvenilmez"
  diyor. Her yazma yolu Supabase **RLS** ile korunmalı (ikiz `row-level-security.md`). VentHub kuralı: yetki
  `app_metadata`'dan, asla `raw_user_meta_data`.

### 6.2 Audit (K4) — her kritik mutasyon
Her create/update/delete → `logAdminAction(supabase, { table_name, row_pk, action, before, after, comment })`
→ `admin_audit_log`. Before/after farkı tutulur (Refine auditLogProvider: actor + action + before/after).
**Sunucu tarafı kaynak doğrudur** — istemci log'u güvence değildir.

### 6.3 Realtime — liste/detay canlı güncellenir
Refine `liveProvider` modeli: backend `created/updated/deleted` olayında liste auto-refetch.
*VentHub'da var:* `AdminRealtimeNotifications`. **Tenant-scoped** olmalı (§6.7).

### 6.4 Bildirim / Toast — sessizlik yasak
Her eylemin geri bildirimi (sonner). Refine `notificationProvider` + **undoable mutation**: optimistik silme +
N-saniye "geri al" penceresi (önerilen UX iyileştirmesi).

### 6.5 i18n — tüm metin sözlükten
`_t('x') || 'Fallback'` kalıbı **yasak** (anahtar eksikse sözlüğe ekle). Sıralama/filtre etiketleri bile prop,
asla hardcoded (Medusa standardı). VentHub: SSOT `dictionaries/tr.ts`, `en.ts`.

### 6.6 a11y
İkon-butona `aria-label`, input'a `label`, sıralanabilir başlığa `aria-sort`, satır-tıklamasına
`role="button"`+`tabIndex`+`onKeyDown`, her interaktif öğeye `focus-visible` halkası.

### 6.7 Design token & Multi-tenant
- **Token:** ortak `adminUi.ts` sınıfları; arbitrary Tailwind (`min-w-900px`) **yasak**; renk HSL custom property.
- **Multi-tenant (SaaS yönü):** tenant filtresi **merkezi** enjekte edilir (Refine: dataProvider her `getList`'e
  tenant filtresi ekler + accessControl tenant sahipliğini `params`'tan doğrular) — **sayfa sayfa değil**. Tüm
  okuma/yazma/realtime kanalı tenant-scoped (data bleeding = felaket).

---

## 7. VentHub'a özel değer (kopyalama değil — uyarlama)

### 7.1 Mevcut parçaların standarda haritası
Sen aslında parçaların çoğunu kurmuşsun; eksik olan **birleştirme**:

| Standart gereği | VentHub'da durum |
|---|---|
| Ortak tablo kiti | parçalı: `AdminToolbar`, `ColumnsMenu`, `ExportMenu`, `BulkActionToolbar` → **tek kite topla** |
| Liste state motoru | her sayfada kopya → **`useAdminTable` hook'una çıkar** |
| RBAC | `useRole().canWrite` + `src/lib/rbac.ts` ✓ — fonksiyon-içi guard eksikleri kapat |
| Audit | `logAdminAction` + `admin_audit_log` ✓ — eksik mutasyonlara ekle |
| Durumlar | `AdminSkeleton`, `AdminEmptyState`, `AccessDenied` ✓ — her sayfada bağla |
| Realtime | `AdminRealtimeNotifications` ✓ — tenant-scope doğrula |
| Dashboard | `StatCard`/`SalesChart`/`AbcPieChart`/`ActivityHeatmap` ✓ |

### 7.2 `useAdminTable` hook kontratı (önerilen — kitin state motoru)
```ts
useAdminTable<T>({ resource, columns, fetcher }) => {
  rows, total, isLoading, error,
  pagination: { currentPage, pageSize, pageCount, setPage, setPageSize },
  sorting:    { sorters, toggleSort },
  filtering:  { filters, setFilters, query, setQuery /* debounced */ },
  selection:  { selected, toggleRow, clearSelection },
  // hepsi URL'ye senkron
}
```

### 7.3 Uygulama yolu (scope creep'e karşı — memory `standard-first-strategy`)
1. **Altın referans sayfa** seç (en temiz mevcut liste, ör. `AdminCouponsPage`) → standarda %100 uydur.
2. O sayfadan **jenerik kiti + `useAdminTable`'ı çıkar**.
3. Diğer sayfaları **tek tek** kite taşı (her taşımada §8 skoru yükselir).
4. İki "sistem-dışı" sayfayı (`AdminInventoryPage`, `AdminWebhookEventsPage`) kite göre **yeniden yaz**.

### 7.4 HVAC/domain notu
Ürün listesinde HVAC'a özgü kolonlar (debi m³/h, basınç Pa, ses dB, filtre sınıfı) **faceted filter** adayı —
müşteri/admin "şu debinin üstü + şu ses altı" diye süzebilmeli. Standart bunu data-table faceted-filter ile
karşılar; ayrı özel ekran gerekmez.

---

## 8. Uygunluk Kontrol Listesi (CETVEL — ölçüm aracı)

Her admin sayfası için işaretle. **Skor = ✓ / 24.** Bu, "refactor mı rewrite mı" kararını **his değil sayı** yapar
(çoğu sayfa yüksek → hedefli düzelt; her yerde düşük → o zaman rewrite konuşulur).

**Liste sayfası:**
- [ ] Server-side pagination + `total`
- [ ] Çok-kolon sorting + `aria-sort`
- [ ] Faceted filter + "tümünü temizle"
- [ ] Debounced global arama
- [ ] URL senkron (sayfa/sort/filtre/arama)
- [ ] Row selection + bulk action (fiil+isim etiketi)
- [ ] Kolon görünürlüğü
- [ ] CSV export
- [ ] Satır tıklaması → detay
- [ ] 5 durum: skeleton / veri-yok / hata / filtre-sıfır / yetkisiz

**Detay / CRUD:**
- [ ] İki-kolon + bölüm (card) bileşimi
- [ ] Alan validasyonu (Zod)
- [ ] Sticky Savebar + `isSaveDisabled` durum makinesi
- [ ] Kirli-durum guard'ı
- [ ] Çift-submit engeli + toast

**Çapraz (her sayfa):**
- [ ] RBAC Katman 1 (UI guard)
- [ ] RBAC Katman 2 (fonksiyon-içi guard)
- [ ] RBAC Katman 3 (sunucu RLS — yazma yolları)
- [ ] Her mutasyonda `logAdminAction`
- [ ] Realtime (tenant-scoped)
- [ ] i18n (fallback yok)
- [ ] a11y (aria-label/label/aria-sort/focus-visible)
- [ ] Design token (arbitrary yok)
- [ ] 4 arketipten birine oturuyor (sistem-dışı değil)

---

## 9. Provenance (bu doküman neye dayanıyor)

| Kaynak | Ne kanıtladı |
|---|---|
| **Refine** (`refinedev/refine`, context7) | `useTable` state kontratı, `can()` RBAC, provider modeli (audit/notification/i18n/live/auth), syncWithLocation, multi-tenant merkezi enjeksiyon |
| **Shopify Polaris** (`polaris-react.shopify.com`) | Sayfa arketipleri, Resource Index/Details/Settings yerleşimi, IndexTable + Filters kuralları, bulk-action "fiil+isim" |
| **Medusa Admin** (`medusajs/medusa`) | Jenerik `DataTable` kiti, `TwoColumnPage` + bölüm bileşimi, route-modal CRUD, JSON+Metadata panel, API-key tip ayrımı |
| **Saleor Dashboard** (`saleor/saleor-dashboard`) | `Datagrid` kontratı, Savebar state machine, `RequirePermissions` (tek enum menü+inline), "üç hâl" state kuralı, ListSettings kalıcılık |
| **shadcn-admin** (`satnaing/shadcn-admin`) | Aynı stack'te (Next+Tailwind+Radix) somut dosya anatomisi: jenerik `data-table/` kiti + feature dilimi, URL-state hook |

**Yakınsama notu:** K1–K5 kanunları beş kaynağın **ortak paydası** olduğu için standarttır — tek bir ürünün
tercihi değil, sektörün uzlaşısı.

**İkize yükleme:** Bu doküman + `SOURCES.md`'deki kaynaklar NotebookLM "VentHub Proje Hafizasi" ikizine
eklenince RAG ile "X sayfası standarda uyuyor mu?" sorulabilir.

---

*Kaynak: 5 otorite (Refine/Polaris/Medusa/Saleor/shadcn-admin) paralel araştırma → VentHub mevcut yapısına
uyarlandı. Strateji: memory `standard-first-strategy`, boru hattı `knowledge-infra-pipeline`.*

---

## 10. Admin Shell Standardı (komut paleti + global arama + navigasyon + klavye)

> **Bu bölüm neyi standartlaştırır?** Her admin sayfasının içine oturduğu **kabuğu (shell):** üst-bar, sol-nav,
> komut paleti (⌘K), global arama, klavye sistemi. §1-§8 *sayfaların* standardıydı; **§10 *çerçevenin*.**
> **Kaynaklar:** cmdk/kbar · Linear · Vercel Dashboard · Stripe Dashboard · Raycast · Shopify Polaris (top-bar+nav).
> Yakınsama: dünya-standardı admin'ler arama + komut + navigasyonu **tek klavye-öncelikli kabukta** birleştirir.
> İlgili yetenek açığı: `admin-capabilities.md §4.5` (E1/E2/E8). Bu = onların **NASIL'ı**.

### S-Kanunları (shell — pazarlık konusu değil)

| # | Kanun | Sade açıklama |
|---|---|---|
| **S1** | **Tek kaynak/komut registry (SSOT)** | Nav öğeleri + aranabilir kaynaklar + hızlı aksiyonlar **tek listeden**. Sidebar + komut paleti aynı registry'yi tüketir → **kopya nav listesi yasak.** |
| **S2** | **Komut paleti = federe + klavye-öncelikli** | ⌘K her yerden; **tüm kaynaklarda** arar (sipariş/ürün/iade/bayi…); gruplu sonuç; navigasyon **ve** aksiyon; RBAC-scoped; tenant-safe. |
| **S3** | **Global arama typeahead** | Debounced (≥250ms), ranked, kaynağa göre gruplu; Enter → detaya deep-link; yükleniyor/sonuç/boş/hata durumları ilan edilir. |
| **S4** | **Klavye-öncelikli + tutarlı** | ⌘K (palet), `/` (arama focus), oklar (gez), Enter (seç), Esc (kapat). Power-user kısayolu (`g o`=orders) opsiyonel ama **tutarlı + keşfedilebilir** (palet footer'ında gösterilir). |
| **S5** | **Modern nav kabuğu** | Gruplu + **RBAC-filtreli** sidebar (aktif-durum, collapse, mobil drawer) + üst-bar (arama girişi, bildirim, kullanıcı). Responsive; her sayfa bu kabuğa oturur. |

### 10.1 Komut paleti anatomisi (S2)
- **Giriş:** ⌘/Ctrl+K her admin sayfasından; üst-bar arama kutusu da paleti açar.
- **Federe arama:** erişilebilir + aranabilir kaynakların searcher'ları **paralel** (`Promise.allSettled`); bir kaynak patlarsa diğerleri görünür.
- **Sonuç modeli:** `{ resourceKey, id, title, subtitle?, route }`; kaynağa göre gruplu başlık.
- **Aksiyonlar:** navigasyon + (yetkiye bağlı) hızlı-create ("Yeni ürün"), opsiyonel tema/çıkış.
- **RBAC:** yalnız `canAccess` kaynaklar listelenir/aranır; aksiyon `canWrite`'a bağlı.

### 10.2 Searcher sözleşmesi (S1+S2)
- **DI:** `(supabase, query, limit) => Promise<CommandResult[]>`; modül-düzeyi statik client importu yasak.
- **Mükerrerlik YASAĞI:** var olan servis fonksiyonunu (ör. `adminSearchProducts`) **yeniden kullan**; sıfırdan kopya sorgu yazma.
- **Tenant-safe:** RLS-korumalı client; `service_role` bypass yasak.

### 10.3 Navigasyon kabuğu (S5)
- Sidebar grupları + öğeleri **registry'den** (S1); aktif = route eşleşmesi; RBAC-filtreli.
- Üst-bar: marka + global arama girişi (⌘K ipucu) + bildirim (E2) + kullanıcı menüsü.
- Mobil: drawer; a11y: `<nav>` + `aria-current="page"`; her interaktif öğede focus-visible.

### 10.4 Shell Uygunluk Kontrol Listesi (CETVEL — ölçüm aracı) · Skor = ✓ / 17
- [ ] S1 Tek registry; sidebar + palet aynı kaynaktan (kopya nav yok) **[kbar]**
- [ ] S2 ⌘K her admin sayfasından **açar ve kapatır** **[Linear]**
- [ ] S2 Palet ≥6 kaynakta federe arar (paralel, `allSettled`)
- [ ] S2 Sonuçlar kaynağa göre **gruplu + ranked** **[Stripe]**
- [ ] S2 **Bağlam-duyarlı sıralama** (açıldığı görünüme göre ilgili önce) **[Linear]**
- [ ] S2 Navigasyon **+ aksiyon** (yalnız nav değil) **[Raycast/kbar]**
- [ ] S2 RBAC-scoped (yetkisiz kaynak listelenmez)
- [ ] S2 Tenant-safe searcher (RLS-client, `service_role` yok)
- [ ] S3 Debounced typeahead + 4 durum (yükleniyor/sonuç/boş/hata) **[cmdk]**
- [ ] S3 **Boşken recent/öneri** gösterilir **[Stripe]**
- [ ] S3 Enter → detaya deep-link; (ops.) güç-sözdizimi `is:`/alan:değer **[Stripe]**
- [ ] S4 ⌘K / `/` / ok / Enter / Esc + `?` yardım + (ops.) `g`-önek go-to **[Linear]**
- [ ] S5 Sidebar RBAC-filtreli + aktif-durum (`selected`) **[Polaris]**
- [ ] S5 Üst-bar: arama + bildirim + kullanıcı — **global nav DEĞİL** (nav ayrı) **[Polaris]**
- [ ] S5 Responsive (mobil drawer / `showNavigationToggle`) **[Polaris]**
- [ ] S2 **Minimal yüzey** — iş bitince kapanır, odak görevde **[Raycast]**
- [ ] a11y: palet `combobox`/`aria-activedescendant`, nav `aria-current`, **axe-0** **[cmdk/WAI-ARIA]**

> §6 çapraz-kesen zorunluluklar (DI, i18n-fallback-yok, design token, a11y, tenant-scope) bu kabuğun **da** üstüne oturur. "Refactor mı rewrite mı" yerine burada soru: kabuk bu **17 maddeyi** karşılıyor mu?

### 10.5 Provenance (§10 neye dayanıyor — §9 gibi, gerçek kaynaktan)

| Kaynak | Ne kanıtladı (dokümante / koddan) | Tür |
|---|---|---|
| **cmdk** (pacocoursey/cmdk, Vercel) | Headless composable combobox (`Command/Input/List/Group/Item/Empty`); `filter(value,search,keywords)→skor` sözleşmesi; erişilebilir combobox a11y; `Command.Loading`/async; nested "pages"; açılış kısayolunu KASITLI uygulamaya bırakır | D |
| **kbar** | Veri-merkezli **action registry** (`id/name/shortcut/keywords/section/priority/perform/parent`); `useRegisterActions` ile **async/dinamik kayıt** (`#`→issue, `@`→user); section+Priority sıralama; shortcut dizileri (`g i`); virtualized results | D |
| **Stripe Dashboard** | Federe arama **tipe-göre-gruplu + ranked**; güç-kullanıcı sözdizimi (`is:` / alan:değer / aralık / negasyon), URL-encoded (paylaşılabilir); sidebar grupları (Primary/Shortcuts/Products/Settings); `?` kısayol listesi | D |
| **Shopify Polaris** | **Frame** kabuk iskeleti; **TopBar ≠ global nav** (TopBar = arama + kullanıcı menüsü; global nav AYRI `Navigation`); `Navigation.Section`/`selected`/`showNavigationToggle`; WCAG 2.0 kontrast | D |
| **Linear** | ⌘K **açar VE kapatır**; **bağlam-duyarlı** komut sıralaması (açıldığı görünüme göre); `g`-önek go-to (`g i`/`g p`); `?` yardım | D |
| **Raycast** | Search-then-act tek yüzey; **minimal** — hotkey'le gelir, iş bitince kaybolur; Action Panel (⌘K) | D |
| Combobox/listbox ARIA + boş-state recent/öneri | WAI-ARIA combobox pattern + yaygın palet deseni | GP |

> **D = resmi doküman/koddan doğrulandı · GP = genel-iyi-pratik (tek otorite açık spec'lemiyor).** Araştırma: 2026-06-17, 2 paralel ajan, context7 + GitHub repo + resmi UX dokümanları. Erişilemeyen kaynaklar (Mobbin 403, bazı Linear sayfaları 404) yerine erişilebilen resmi kaynaklardan doğrulandı; üçüncü-taraf shortcut sitelerine dayanılmadı.
>
> **Bu provenance ışığında eklenen/sağlamlaşan yasalar:** TopBar≠global-nav (Polaris) → S5'te netleşti · arama sözdizimi `is:`/alan:değer (Stripe) → S3 güç-kullanıcı maddesi · bağlam-duyarlı sıralama + `g`-önek (Linear) → S2/S4 · minimal-kaybolan yüzey (Raycast) → S2 · action-registry+section/priority (kbar) → S1 · headless combobox+filter sözleşmesi (cmdk) → 10.2.

---

*§10 = **sentez değil, kaynaktan**: cmdk + kbar (kütüphane API/kod) + Stripe/Polaris/Linear/Raycast (resmi UX dokümanı), 2026-06-17 araştırması. Yetenek açığı `admin-capabilities.md §4.5`; uygulama brief'i `docs/plans/admin-shell-e1-command-palette-brief.md` bu cetvele uyar.*
