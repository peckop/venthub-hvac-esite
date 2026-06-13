export const returns = {
      total: 'Toplam: {{count}} iade talebi yönetiliyor.',
      searchPlaceholder: 'Sipariş no, müşteri ismi, e-posta veya sebep ile ara',
      export: {
        csvLabel: 'CSV (Görünen filtrelerle)',
        xlsLabel: 'Excel (.xls — HTML tablo)',
        headers: {
          order: 'Sipariş',
          customer: 'Müşteri',
          email: 'E-posta',
          reason: 'Sebep',
          status: 'Durum',
          date: 'Tarih',
          amount: 'Tutar'
        }
      },
      table: {
        order: 'Sipariş',
        customer: 'Müşteri',
        reason: 'Sebep',
        status: 'Durum',
        date: 'Tarih',
        actions: 'İşlemler'
      },
      empty: {
        filtered: 'Filtrelerle eşleşen iade talebi bulunamadı.',
        none: 'Henüz iade talebi bulunmuyor.'
      },
      actions: {
        markAs: '{{status}} olarak işaretle'
      },
      toasts: {
        returnsLoadFailed: 'İade talepleri yüklenemedi',
        statusUpdated: 'İade durumu "{{status}}" olarak güncellendi',
        emailNotifySent: 'Müşteri bilgilendirme e-postası gönderildi',
        emailNotifyFailed: 'E-posta gönderilemedi ancak durum güncellendi',
        statusUpdateFailed: 'İade durumu güncellenemedi'
      },
      statusLabels: {
        requested: 'Talep Edildi',
        approved: 'Onaylandı',
        rejected: 'Reddedildi',
        in_transit: 'Yolda',
        received: 'Teslim Alındı',
        refunded: 'İade Edildi',
        cancelled: 'İptal Edildi'
      }
};
