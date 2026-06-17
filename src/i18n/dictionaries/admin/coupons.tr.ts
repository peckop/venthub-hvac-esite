export const coupons = {
      subtitle: 'İndirim kuponlarını yönetin ve kullanım istatistiklerini takip edin',
      searchPlaceholder: 'Kupon kodu ara...',
      create: {
        sectionTitle: 'Yeni Kupon Oluştur',
        code: 'Kupon Kodu',
        codePlaceholder: 'Örn: YAZ2026',
        type: 'İndirim Türü',
        typePercent: 'Yüzde (%)',
        typeFixed: 'Sabit Tutar',
        value: 'Değer',
        startsAt: 'Başlangıç Tarihi',
        endsAt: 'Bitiş Tarihi',
        status: 'Durum',
        active: 'Aktif',
        usageLimit: 'Kullanım Limiti',
        usageLimitPlaceholder: 'Boş bırakılırsa sınırsız',
        submit: 'Kuponu Oluştur',
        submitting: 'Oluşturuluyor...'
      },
      table: {
        code: 'Kod',
        type: 'Tür',
        value: 'Değer',
        active: 'Aktif',
        validity: 'Geçerlilik',
        usage: 'Kullanım',
        createdAt: 'Oluşturulma',
        actions: 'İşlemler'
      },
      typeLabels: {
        percent: 'Yüzde',
        fixed: 'Sabit Tutar'
      },
      statusLabels: {
        active: 'Aktif',
        passive: 'Pasif'
      },
      validity: {
        unlimited: 'SÜRESİZ'
      },
      bulk: {
        activate: 'Aktifleştir',
        deactivate: 'Pasifleştir'
      },
      toasts: {
        created: 'Kupon başarıyla oluşturuldu',
        createFailed: 'Kupon oluşturulamadı',
        activated: 'Kupon aktifleştirildi',
        deactivated: 'Kupon pasifleştirildi',
        statusFailed: 'Durum güncellenemedi',
        noPermission: 'Bu işlem için yetkiniz yok'
      },
      validation: {
        codeLength: 'Kupon kodu en az 3 karakter olmalı',
        typeRequired: 'İndirim türü seçilmeli',
        valuePositive: 'Değer sıfırdan büyük olmalı',
        limitPositive: 'Kullanım limiti sıfırdan büyük olmalıdır',
        percentLimit: 'Yüzde indirim değeri 100\'den büyük olamaz',
        dateRange: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır'
      },
      emptyTitle: 'Kupon bulunamadı',
      emptyDescription: 'Henüz hiç kupon oluşturulmadı. İlk kuponunuzu oluşturarak başlayın.',
      filterEmptyDescription: 'Filtre kriterlerinize uygun kupon bulunamadı.'
};
