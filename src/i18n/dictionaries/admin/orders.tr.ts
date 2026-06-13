export const orders = {
      view_list: 'Liste Görünümü',
      view_board: 'Pano Görünümü',
      statusLabels: {
        all: 'Tümü',
        pending: 'Bekliyor',
        pa_id: 'Ödendi',
        confirmed: 'Onaylandı',
        shipped: 'Kargoda',
        delivered: 'Teslim Edildi',
        cancelled: 'İptal Edildi',
        refunded: 'İade Edildi',
        partialRefunded: 'Kısmi İade'
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
        cancelFailed: 'Toplu iptal başarısız oldu'
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
          carrierLabel: 'Kargo Firması',
          carrierSelect: 'Seçiniz...',
          trackingLabel: 'Takip Numarası',
          trackingPlaceholder: 'Kargo Takip No',
          sendEmailLabel: 'Müşteriye e-posta bildirimi gönder',
          advancedLabel: 'Gelişmiş: Sipariş bazlı kargo',
          advancedTable: {
            orderId: 'Sipariş',
            carrier: 'Kargo',
            tracking: 'Takip No'
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
        noteDeleteSuccess: 'Not silindi',
        noteDeleteFailed: 'Not silinemedi',
        shippingCancelConfirm: 'Kargoyu iptal etmek üzeresiniz. Durum "Onaylandı"ya dönecek ve takip no silinecek.',
        shippingCancelSuccess: 'Kargo iptal edildi',
        shippingCancelFailed: 'Kargo iptal edilemedi',
        shippingUpdateSuccess: 'Kargo bilgisi güncellendi',
        shippingCreateSuccess: 'Sipariş kargoya verildi',
        shippingUpdateFailed: 'Kargo bilgisi güncellenemedi',
        bulkShippingSuccess: '{{count}} sipariş kargoya verildi',
        bulkShippingFailed: 'Toplu kargo güncellemesi başarısız',
        missingFields: 'Kargo firması ve takip no zorunludur',
        missingAdvancedFields: 'Eksik alanlar: {{count}} satır'
      },
      states: {
        loading: 'Yükleniyor...',
        noRecords: 'Kayıt bulunamadı'
      },
      board: {
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
          pa_id: 'Ödendi',
          prep: 'Hazırlanıyor',
          shipped: 'Kargoda',
          delivered: 'Teslim'
        },
        messages: {
          cancelledOrRefunded: 'Sipariş iptal veya iade edilmiş.',
          updateSuccess: 'Sipariş durumu başarıyla güncellendi.',
          updateError: 'Durum güncellenirken hata oluştu.'
        }
      },
      tooltips: {
        cancelBulkShipping: 'Seçilenlerin sevkiyatını iptal et (yalnızca sevk edilenler)',
        cancelShipping: 'Sevkiyatı iptal et',
        logs: 'E-posta günlüklerini görüntüle',
        notes: 'Sipariş notlarını görüntüle/ekle',
        shipping: 'Kargo bilgisi ekle / düzenle'
      }
};
