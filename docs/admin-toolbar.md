# AdminToolbar Kılavuzu

Tarih: 2025-09-05
Durum: Aktif kullanımda (Inventory, Movements, Orders, Returns, Users)

Amaç
- Admin sayfalarındaki arama/filtre/aksiyon barlarını standartlaştırmak.
- Tutarlı görünüm, klavye erişilebilirliği ve kolay genişletilebilirlik sağlamak.

Görsel Tasarım ve Düzen
- Kart içinde ayrı bir yüzey: bg-gray-50 + border + rounded + p-3 (panel hissi)
- Düzen: 2 satır
  - Üst sıra: Arama + Select + Sağ aksiyon kümesi (Temizle, sayaç, Dışa Aktar vb.)
  - Alt sıra: Chip grubu (çoklu filtreler)
- Yükseklik: md ve üstü 48px (md:h-12), küçük ekranda h-11
- Sağ blok: shrink-0 + whitespace-nowrap (taşma ve kırılmayı önler)
- Focus: Tüm etkileşimli öğelerde görünür focus ring (focus:ring-primary-navy/30)
- Toggle: Checkbox yerine Radix Switch (ör. "Grupla: Kategori")

Bileşen API’si
```ts path=null start=null
export type AdminToolbarChip = {
  key: string
  label: string
  active: boolean
  onToggle: () => void
  classOn?: string
  classOff?: string
  title?: string
}

export type AdminToolbarToggle = {
  key: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  title?: string
}

export type AdminToolbarSelectOption = { value: string; label: string }

export type AdminToolbarProps = {
  search?: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    title?: string
    focusShortcut?: string // default '/'
  }
  select?: {
    value: string
    onChange: (v: string) => void
    options: AdminToolbarSelectOption[]
    title?: string
  }
  chips?: AdminToolbarChip[]
  toggles?: AdminToolbarToggle[]
  onClear?: () => void
  recordCount?: number
  rightExtra?: React.ReactNode
  sticky?: boolean // üstte sabit görünüm
}
```

Klavye Kısayolları
- "/": Arama alanına odaklan (sayfada bir input odaklı değilse)
- "Esc": (sayfa implementasyonuna bağlı) panel/menü kapatma
- (Opsiyonel) Genişletme: "e" dışa aktar, "g" grupla, vb.

Erişilebilirlik
- Chip’lerde aria-pressed; Switch Root’ta aria-label kullanılır.
- Odak halkaları her kontrolde görünür.
- Sayaç alanı aria-live="polite" (kayıt sayısı dinamik ise).

Sayfa Entegrasyon Kalıpları
1) Inventory (/admin/inventory)
- Arama (ürün adı), Kategori select, Durum chip’leri (Tükendi/Kritik/Rezervli/Uygun), "Grupla: Kategori" switchi.
- Sağ blokta Temizle + kayıt sayacı.

2) Movements (/admin/movements)
- Arama (ürün adı/sku), Kategori select, Reason chip grubu.
- Sağ blok: Dışa Aktar menüsü (CSV) + Temizle + sayaç.

3) Orders (/admin/orders)
- Arama (Order/Conversation ID), Durum select.
- Sağ blok: Tarih aralığı (Başlangıç/Bitiş) + Dışa Aktar menüsü (CSV, Excel .xls) + Yenile butonu.

4) Returns (account/AdminReturnsPage)
- Arama (sipariş no, müşteri, email, sebep), çoklu durum chip’leri.
- Sağ blok: Temizle + sayaç.

5) Users (account/AdminUsersPage)
- Arama (e-posta/isim), aktif taba göre sayaç.

Dışa Aktar Menüsü
CSV
- UTF‑8 BOM ile üretilir (Excel uyumluluğu): başa "\ufeff" eklenir.
- Örnek Orders kolonları: [Sipariş ID, Durum, Konuşma ID, Tutar, Oluşturulma].
- Değerler çift tırnak içinde; iç tırnaklar \"\" olarak kaçırılır.

Excel (.xls)
- Basit HTML tablo içeren Blob ile indirilir (MIME: application/vnd.ms-excel).
- Not: Gerçek .xlsx için SheetJS gibi bir kütüphane gerekir (bkz. Genişletmeler).

Örnek kullanım (Orders sağ blok menüsü)
```ts path=null start=null
<DropdownMenu.Root>
  <DropdownMenu.Trigger asChild>
    <button className="px-3 md:h-12 h-11 inline-flex items-center gap-2 rounded-md border border-light-gray bg-white hover:border-primary-navy text-sm whitespace-nowrap">
      <Download size={16} />
      Dışa Aktar
    </button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Portal>
    <DropdownMenu.Content className="min-w-44 rounded-md bg-white shadow-lg border border-light-gray p-1">
      <DropdownMenu.Item onSelect={(e)=>{ e.preventDefault(); exportOrdersCsv() }} className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer">
        CSV (Excel uyumlu UTF‑8 BOM)
      </DropdownMenu.Item>
      <DropdownMenu.Item onSelect={(e)=>{ e.preventDefault(); exportOrdersXls() }} className="px-3 py-2 text-sm rounded hover:bg-gray-50 cursor-pointer">
        Excel (.xls — HTML tablo)
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  </DropdownMenu.Portal>
</DropdownMenu.Root>
```

Kalıcılık (Plan)
- Amaç: Toolbar durumu sayfa yeniden ziyaretlerinde hatırlansın.
- Yöntem: localStorage; sayfa bazlı anahtarlandırma.
- Önerilen anahtar şeması:
  - admin:inventory:toolbar:search
  - admin:inventory:toolbar:category
  - admin:inventory:toolbar:chips
  - admin:movements:toolbar:reasons
  - admin:orders:toolbar:status | :from | :to | :q
- Değerler: JSON.stringify ile saklanmalı; okurken try/catch ile güvenli parse.

Test Kontrol Listesi
- Görsel hizalar: 48px kontrolller, iki satırlı düzen, shrink-0 sağ blok, chip sarımları.
- Klavye: "/" arama odak, menü odak sırası, Esc ile kapanışlar.
- Erişilebilirlik: aria-pressed (chip), aria-label (switch/menü), aria-live (sayaç).
- Export: CSV’de Türkçe karakterler, Excel’de açılabilirlik.
- Filtre davranışı: Temizle ile tüm state reset; kayıt sayacı anlık güncellenir.

Genişletmeler
- XLSX (gerçek): SheetJS (xlsx) ile export; bağımlılık eklenmesi gerekir.
- Görünür Sütunlar menüsü: Tablo başlıklarıyla entegre ya da toolbar sağ blokta.
- Yoğunluk (density) toggle’ı: compact/comfortable sınıfları.
- URL query senkronu: state ↔ URL (paylaşılabilir filtre linkleri).

Uygulama Notları
- Build/push işlemleri kullanıcı talebi olmadan çalıştırılmaz.
- Stil token’ları: utils/adminUi.ts içindeki admin*Class sabitleri ile hizalı kalmalıdır.

Değişiklik Geçmişi
- 2025-09-05: İlk sürüm (standart, entegrasyonlar, export, plan)

