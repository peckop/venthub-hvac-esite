export const returns = {
      total: 'Toplam: {{count}} iade talebi yönetiliyor.',
      subtitle: 'İade taleplerini takip edin, durumlarını ileri taşıyın.',
      searchPlaceholder: 'Sipariş no, müşteri ismi, e-posta veya sebep ile ara',
      columnsButton: 'Görünüm',
      emptyTitle: 'İade talebi yok',
      emptyDescription: 'Henüz iade talebi bulunmuyor.',
      filterEmptyDescription: 'Filtrelerle eşleşen iade talebi bulunamadı.',
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
        statusUpdateFailed: 'İade durumu güncellenemedi',
        noValidTransitions: 'Seçilen iade talepleri için geçerli durum geçişi bulunamadı',
        bulkStatusUpdated: 'Seçilen {{count}} iade talebinin durumu "{{status}}" olarak güncellendi',
        noPermission: 'Bu işlem için yetkiniz bulunmuyor'
      },
      statusLabels: {
        requested: 'Talep Edildi',
        approved: 'Onaylandı',
        rejected: 'Reddedildi',
        in_transit: 'Yolda',
        received: 'Teslim Alındı',
        refunded: 'İade Edildi',
        cancelled: 'İptal Edildi'
      },
      bulk: {
        statusConfirm: 'Seçilen {{count}} iade talebinin durumunu "{{status}}" olarak güncellemek istediğinize emin misiniz?',
        statusTitle: 'Toplu Durum Güncelle',
        selectedCount: '{{count}} iade talebi seçildi',
        clear: 'Seçimi temizle',
        apply: 'Uygula'
      },
      detail: {
        title: 'İade Talebi Detayı',
        id: 'İade ID',
        orderId: 'Sipariş ID',
        userId: 'Kullanıcı ID',
        description: 'Açıklama',
        updatedAt: 'Son Güncelleme'
      }
};
