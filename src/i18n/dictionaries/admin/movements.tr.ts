export const movements = {
      subtitle: 'Envanter giriş/çıkış hareketlerini izleyin, filtreleyin ve dışa aktarın',
      batchFilterPrefix: 'Filtre: Toplu İşlem',
      emptyTitle: 'Hareket Bulunamadı',
      emptyDescription: 'Henüz kaydedilmiş bir envanter hareketi bulunmuyor.',
      filterEmptyDescription: 'Seçilen filtrelere veya arama kriterlerine uygun envanter hareketi bulunmuyor.',
      export: {
        csvLabel: 'CSV (görünür filtrelerle)',
        xlsLabel: 'Excel (görünür filtrelerle)',
        headers: {
          date: 'Tarih',
          delta: 'Değişim',
          product: 'Ürün',
          reason: 'Neden',
          ref: 'Referans',
          sku: 'SKU'
        }
      },
      pageLabel: 'Sayfa {{page}}',
      reasons: {
        adjust: 'Ayarlama',
        manual_in: 'Manuel Giriş',
        manual_out: 'Manuel Çıkış',
        po_receipt: 'Satın Alma Makbuzu',
        return_in: 'İade Girişi',
        sale: 'Satış',
        transfer_in: 'Transfer Girişi',
        transfer_out: 'Transfer Çıkışı',
        undo: 'Geri Al'
      },
      table: {
        date: 'Tarih',
        delta: 'Değişim',
        product: 'Ürün',
        reason: 'Neden',
        ref: 'Referans'
      },
      toolbar: {
        allCategories: 'Tüm Kategoriler',
        categoryTitle: 'Kategori'
      }
};
