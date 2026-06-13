export const products = {
      form: {
        name: 'Ürün Adı',
        category: 'Kategori',
        select: 'Seçiniz',
        outOfStock: 'Stok Yok',
        price: 'Fiyat'
      },
      confirm: {
        deleteImage: 'Görseli silmek istiyor musunuz?',
        deleteProduct: 'Bu ürünü silmek istiyor musunuz?'
      },
      edit: {
        actions: {
          delete: 'Sil',
          new: 'Yeni',
          save: 'Kaydet'
        },
        editing: 'Düzenleniyor',
        images: {
          altPlaceholder: 'Alt metin',
          delete: 'Sil',
          down: 'Aşağı',
          makeCover: 'Kapak Resmi Yap',
          none: 'Henüz görsel yok. Yüklemek için dosyaları seçin.',
          saveFirst: 'Önce ürünü kaydedin.',
          up: 'Yukarı'
        },
        info: {
          brand: 'Marka',
          category: 'Kategori',
          categoryUnset: '(Seçilmedi)',
          featured: 'Öne Çıkan',
          modelCode: 'Model Kodu (MPN)',
          modelPlaceholder: 'Örn: AD-H-900-T',
          name: 'Ad',
          sku: 'SKU',
          status: 'Durum'
        },
        new: 'Yeni Ürün',
        pricing: {
          purchasePlaceholder: 'Örn: 1499.50',
          purchasePrice: 'Alış Maliyeti',
          salePlaceholder: 'Örn: 1999.90',
          salePrice: 'Satış Fiyatı'
        },
        seo: {
          chars: '{{count}} karakter',
          metaDesc: 'Meta Açıklaması',
          metaTitle: 'Meta Başlığı',
          slug: 'Kalıcı Bağlantı (Slug)',
          slugInUse: 'Bu URL adı zaten kullanılıyor',
          slugPlaceholder: 'ornek-urun',
          slugRequired: 'URL adı boş olamaz'
        },
        stock: {
          defaultSuffix: ' (Varsayılan: {{default}})',
          hintBase: 'Boş bırakılırsa, Ayarlar\'daki varsayılan eşik kullanılır',
          lowPlaceholder: 'Örn: 5',
          lowThreshold: 'Düşük Stok Eşiği',
          stock: 'Stok',
          stockPlaceholder: 'Örn: 50'
        },
        tabs: {
          images: 'Görseller',
          info: 'Bilgi',
          pricing: 'Fiyatlandırma',
          seo: 'SEO',
          stock: 'Stok'
        }
      },
      export: {
        csvLabel: 'CSV (UTF-8 BOM)'
      },
      import: {
        button: 'İçe Aktar (beta)',
        close: 'Kapat',
        done: 'İçe aktarma tamamlandı: {{ok}} satır işlendi, {{fail}} satır başarısız oldu',
        dryRun: 'Önizleme (Dry-run)',
        dryRunResult: 'Önizleme: zorunlu alanlar {{status}}. Geçerli satırlar: {{ok}}/{{total}}',
        error: 'İçe aktarma hatası: {{msg}}',
        minColumns: 'En az sku ve name sütunları gereklidir',
        needCsv: 'Önce bir CSV seçin',
        noneFound: 'Geçerli satır bulunamadı',
        previewTitle: 'CSV Önizlemesi (ilk 10 satır) — Toplam: {{total}}',
        statusComplete: 'tamamlandı',
        statusMissing: 'eksik',
        writeButton: 'Yaz (SKU\'ya göre güncelle)'
      },
      statusLabels: {
        active: 'Aktif',
        inactive: 'Pasif',
        out_of_stock: 'Stokta Yok'
      },
      table: {
        actions: 'İşlemler',
        category: 'Kategori',
        image: 'Görsel',
        name: 'Ad',
        price: 'Fiyat',
        sku: 'SKU',
        status: 'Durum',
        stock: 'Stok'
      },
      toasts: {
        altSaveFailed: 'Alt metin kaydedilemedi: {{msg}}',
        deleteFailed: 'Silinemedi: {{msg}}',
        imagesSaveFailed: 'Görseller kaydedilemedi: {{msg}}',
        imagesSaved: 'Görseller kaydedildi',
        loadFailed: 'Yüklenemedi',
        orderNotChanged: 'Sıralama değiştirilmedi',
        priceSaveFailed: 'Fiyat kaydedilemedi: {{msg}}',
        productLoadFailed: 'Ürün yüklenemedi: {{msg}}',
        saveFailed: 'Kaydedilemedi: {{msg}}',
        seoSaveFailed: 'SEO kaydedilemedi: {{msg}}',
        stockSaveFailed: 'Stok kaydedilemedi: {{msg}}'
      },
      toggles: {
        featuredOnly: 'Yalnızca: Öne Çıkanlar'
      },
      toolbar: {
        allCategories: 'Tüm Kategoriler',
        categoryTitle: 'Kategori'
      }
};
