export const dataTable = {
      bulk: {
        selectedCount: '{count} öğe seçili',
        clear: 'Seçimi temizle',
        activateItems: 'Seçilenleri aktifleştir',
        deactivateItems: 'Seçilenleri pasifleştir',
        deleteItems: 'Seçilenleri sil',
        archiveItems: 'Seçilenleri arşivle'
      },
      filter: {
        clearAll: 'Tüm filtreleri temizle',
        facetEmpty: 'Bu filtre için sonuç yok'
      },
      // ColumnsMenu (kit-geneli: 14 admin tablosunun tamamı bu menüyü kullanır).
      columns: {
        title: 'Aktif Kolonlar',
        density: 'Satır Yoğunluğu',
        densityComfortable: 'Rahat (Varsayılan)',
        densityCompact: 'Sıkışık (Maksimum Veri)'
      },
      states: {
        loading: 'Yükleniyor...',
        error: 'Veriler yüklenirken bir hata oluştu',
        accessDenied: 'Bu içeriği görüntüleme yetkiniz yok'
      },
      pagination: {
        page: 'Sayfa',
        of: '/',
        rowsPerPage: 'Sayfa başına satır',
        previous: 'Önceki sayfa',
        next: 'Sonraki sayfa',
        total: 'Toplam'
      },
      labels: {
        selectAll: 'Tümünü seç',
        rowSelect: 'Satırı seç',
        expand: 'Satır detayını aç/kapat'
      },
      export: {
        csv: 'CSV olarak indir',
        fileFormat: 'Dosya Formatı'
      },
      // CSV içe aktarma dosya kapısı (ADM-6, csv-import-export-standard §1.2). Ürün ve stok
      // içe aktarıcıları ortak kullanır; metin teşhis değil yol tarifi verir.
      csvImport: {
        wrongExtension: 'Yalnız .csv uzantılı dosya yüklenebilir.',
        wrongType: 'Dosya CSV metni değil. Tabloyu "CSV UTF-8" olarak kaydedip yeniden yükleyin.',
        fileTooLarge: 'Dosya {{maxMb}} MB sınırını aşıyor. Dosyayı bölerek yükleyin.',
        empty: 'Dosyada başlık satırı ve en az bir veri satırı olmalı.',
        tooManyRows: 'Dosyada {{maxRows}} satırdan fazla veri var. Dosyayı bölerek yükleyin.',
        unclosedQuote: 'Dosyada kapanmamış bir tırnak (") var; dosya okunamadı.',
        duplicateHeader: 'Başlık satırında aynı sütun adı birden fazla geçiyor.'
      }
};
