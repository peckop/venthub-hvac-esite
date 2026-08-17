export const orders = {
      view_list: 'Liste Görünümü',
      view_board: 'Pano Görünümü',
      subtitle: 'Tüm siparişleri listeleyin, filtreleyin ve yönetin.',
      boardSubtitle: 'Siparişleri sürükleyerek durumlarını hızlıca güncelleyin.',
      emptyTitle: 'Sipariş bulunamadı',
      emptyDescription: 'Henüz bir sipariş kaydı bulunmuyor.',
      filterEmptyDescription: 'Arama kriterlerinize veya uyguladığınız filtrelere uygun bir sipariş kaydı mevcut değil.',
      statusLabels: {
        all: 'Tümü',
        pending: 'Bekliyor',
        paid: 'Ödendi',
        confirmed: 'Onaylandı',
        shipped: 'Kargoda',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal Edildi',
        refunded: 'İade Edildi',
        partialRefunded: 'Kısmi İade'
      },
      customerFilter: {
        active: 'Liste tek bir müşteriye göre filtrelenmiş.',
        clear: 'Filtreyi kaldır'
      },
      table: {
        orderId: 'Sipariş No',
        status: 'Durum',
        conversationId: 'İşlem ID',
        amount: 'Tutar',
        created: 'Tarih',
        actions: 'İşlemler'
      },
      filters: {
        status: 'Durum',
        pendingShipments: 'Bekleyen Kargolar',
        startDate: 'Başlangıç',
        endDate: 'Bitiş'
      },
      bulk: {
        selected: 'Seçili: {{count}}',
        shipSelected: 'Seçilileri Kargola',
        cancelShipping: 'Kargoyu İptal Et',
        clearSelection: 'Seçimi Temizle',
        noShippableSelected: 'İptal edilecek kargo seçilmedi',
        confirmCancelShipping: '{{count}} siparişin kargosunu iptal etmek istediğinize emin misiniz?',
        cancelSuccess: '{{count}} sipariş kargosu iptal edildi',
        cancelPartialFail: 'Bazı iptaller başarısız oldu: {{failed}}',
        cancelFailed: 'Toplu iptal başarısız oldu',
        duplicateTracking: {
          title: 'Aynı takip numarası paylaşılıyor',
          description: '{{count}} sipariş aynı takip numarasını taşıyacak. Bu siparişler tek bir birleştirilmiş koliyle mi gönderiliyor?',
          confirmLabel: 'Evet, birleştirilmiş gönderi',
          cancelLabel: 'Hayır, numaraları düzelteyim'
        }
      },
      export: {
        csvLabel: 'CSV (Excel uyumlu UTF-8)',
        xlsLabel: 'Excel (.xls — HTML tablo)',
        headers: {
          orderId: 'Sipariş No',
          status: 'Durum',
          conversationId: 'İşlem ID',
          amount: 'Tutar',
          created: 'Tarih',
          products: 'Öne çıkan çözümleri görün'
        }
      },
      columns: {
        orderId: 'Sipariş No',
        status: 'Durum',
        conversationId: 'İşlem ID',
        amount: 'Tutar',
        created: 'Tarih'
      },
      actions: {
        shipping: 'Kargo',
        logs: 'Kayıtlar',
        notes: 'Notlar',
        cancel: 'İptal'
      },
      modals: {
        shipping: {
          title: 'Kargo / Takip No',
          bulkTitle: 'Toplu Kargo İşlemi',
          description: 'Kargo firmasını ve takip numarasını girin; dilerseniz müşteriye bildirim e-postası gönderilir.',
          close: 'Kapat',
          carrierLabel: 'Kargo Firması',
          carrierSelect: 'Seçiniz...',
          trackingLabel: 'Takip Numarası',
          trackingPlaceholder: 'Kargo Takip No',
          sendEmailLabel: 'Müşteriye e-posta bildirimi gönder',
          bulkDescription: 'Taşıyıcı tüm seçili siparişler için ortaktır. Takip numarasını HER SİPARİŞ İÇİN AYRI girin — tek numarayı hepsine yazmak, her müşteriye başkasının kolisinin takip linkini gönderir.',
          advancedLabel: 'Gelişmiş: Sipariş bazlı kargo',
          advancedTable: {
            orderId: 'Sipariş',
            carrier: 'Kargo',
            tracking: 'Takip No'
          },
          bulkList: {
            heading: 'Sipariş başına takip numarası',
            orderColumn: 'Sipariş',
            trackingColumn: 'Takip Numarası',
            trackingAriaLabel: '{{order}} siparişinin takip numarası',
            noTargets: 'Seçimde kargolanabilecek sipariş yok (kargoya verilmiş siparişler atlanır).'
          },
          errors: {
            carrierRequired: 'Taşıyıcı seçilmelidir.',
            trackingRequired: 'Bu sipariş için takip numarası zorunludur.',
            missingSummary: '{{count}} siparişin takip numarası eksik.'
          },
          carriers: {
            yurtici: 'Yurtiçi',
            aras: 'Aras',
            mng: 'MNG',
            ptt: 'PTT',
            ups: 'UPS',
            fedex: 'FedEx',
            dhl: 'DHL',
            other: 'Diğer'
          },
          otherPlaceholder: 'Diğer (elle girin)',
          cancel: 'İptal',
          save: 'Kaydet',
          saving: 'Kaydediliyor...'
        },
        logs: {
          title: 'E-posta Kayıtları',
          description: 'Bu siparişe gönderilen kargo bildirim e-postalarının kaydı. Panel açıkken listeyle çalışmaya devam edebilirsiniz.',
          orderLabel: 'Sipariş:',
          table: {
            date: 'Tarih',
            to: 'Alıcı',
            subject: 'Konu',
            carrier: 'Kargo',
            tracking: 'Takip No',
            messageId: 'Mesaj ID'
          },
          noRecords: 'Kayıt bulunamadı',
          close: 'Kapat'
        },
        notes: {
          title: 'Sipariş Notları',
          description: 'Bu siparişe iliştirilen dahili notlar. Notlar müşteriye gösterilmez.',
          inputPlaceholder: 'Yeni bir not yazın...',
          add: 'Ekle',
          adding: 'Ekleniyor...',
          delete: 'Sil',
          noRecords: 'Not bulunmuyor',
          close: 'Kapat'
        }
      },
      toasts: {
        loadError: 'Siparişler yüklenemedi',
        emailLogsFailed: 'E-posta kayıtları yüklenemedi',
        notesFailed: 'Notlar yüklenemedi',
        noteAddFailed: 'Not eklenemedi',
        noteAddSuccess: 'Not başarıyla eklendi',
        noteDeleteSuccess: 'Not silindi',
        noteDeleteFailed: 'Not silinemedi',
        noPermission: 'Bu işlem için yetkiniz yok',
        invalidStatusTransition: 'Geçersiz durum değişikliği: sipariş durumu yalnızca ileri alınabilir; iptal/iade geri alınamaz.',
        shippingCancelConfirm: 'Kargoyu iptal etmek üzeresiniz. Durum "Onaylandı"ya dönecek ve takip no silinecek.',
        shippingCancelSuccess: 'Kargo iptal edildi',
        shippingCancelFailed: 'Kargo iptal edilemedi',
        shippingUpdateSuccess: 'Kargo bilgisi güncellendi',
        shippingCreateSuccess: 'Sipariş kargoya verildi',
        shippingUpdateFailed: 'Kargo bilgisi güncellenemedi',
        bulkShippingSuccess: '{{count}} sipariş kargoya verildi',
        bulkShippingFailed: 'Toplu kargo güncellemesi başarısız',
        bulkShippingPartialFailed: '{{count}} sipariş kargoya verilemedi: {{orders}}',
        missingFields: 'Kargo firması ve takip no zorunludur',
        missingAdvancedFields: 'Eksik alanlar: {{count}} satır'
      },
      states: {
        loading: 'Yükleniyor...',
        noRecords: 'Kayıt bulunamadı'
      },
      board: {
        limitWarning: 'Yalnızca ilk {{shown}} sipariş gösterilmektedir (Toplamda {{total}} siparişten {{remaining}} adet daha var). Bulamadığınız siparişler için lütfen liste görünümünü veya filtreleri kullanın.',
        columns: {
          new: 'Yeni / Bekliyor',
          prep: 'Hazırlanıyor',
          shipped: 'Kargoda',
          done: 'Teslim Edildi',
          cancel: 'İptal',
          refund: 'İade'
        },
        stepper: {
          received: 'Alındı',
          paid: 'Ödendi',
          prep: 'Hazırlanıyor',
          shipped: 'Kargoda',
          delivered: 'Teslim'
        },
        messages: {
          cancelledOrRefunded: 'Sipariş iptal veya iade edilmiş.',
          updateSuccess: 'Sipariş durumu başarıyla güncellendi.',
          updateError: 'Durum güncellenirken hata oluştu.',
          invalidTransition: '{{from}} → {{to}} geçişi yapılamaz. Sipariş durumu yalnız ileri taşınabilir.',
          stockRestoreFailed: 'Sipariş güncellendi ama STOK GERİ VERİLEMEDİ: {{error}} — envanteri elle düzeltin.'
        },
        detail: {
          description: 'Seçili siparişin durumu, iletişim bilgileri, notları ve e-posta kayıtları.',
          close: 'Kapat'
        }
      },
        tooltips: {
          cancelBulkShipping: 'Seçilenlerin sevkiyatını iptal et (yalnızca sevk edilenler)',
          cancelShipping: 'Sevkiyatı iptal et',
          logs: 'E-posta günlüklerini görüntüle',
          notes: 'Sipariş notlarını görüntüle/ekle',
          shipping: 'Kargo bilgisi ekle / düzenle'
        },
        orderDetails: 'Sipariş Detayları',
      form: {
        // Alan seviyesi doğrulama mesajları (cetvel §4.6 — girdinin altında, toast'ta değil)
        validation: {
          statusRequired: 'Sipariş durumu zorunludur',
          customerNameRequired: 'Müşteri adı zorunludur',
          emailInvalid: 'Geçersiz e-posta adresi',
          emailRequired: 'E-posta zorunludur',
        },
        descEdit: 'Sipariş detaylarını görüntüleyin ve güncelleyin.',
        tabShipping: 'Sevkiyat',
        tabItems: 'Sipariş Kalemleri',
        customerName: 'Müşteri Adı',
        customerEmail: 'Müşteri E-posta',
        customerPhone: 'Müşteri Telefon',
        orderStatus: 'Sipariş Durumu',
        carrier: 'Kargo Firması',
        trackingNumber: 'Takip Numarası',
        shippingMethod: 'Gönderim Yöntemi',
        shippingStandard: 'Standart Kargo',
        shippingExpress: 'Hızlı Kargo (Express)',
        itemsTableProduct: 'Ürün Adı',
        itemsTableQuantity: 'Adet',
        itemsTableUnitPrice: 'Birim Fiyat',
        itemsTableTotal: 'Toplam Tutar',
        errorPrefix: 'Hata: ',
        unknownError: 'Bilinmeyen hata'
      }
  };
