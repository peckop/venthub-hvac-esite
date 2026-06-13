export const users = {
      subtitle: 'Sistem kullanıcılarını ve rollerini yönetin.',
      searchPlaceholder: 'E-posta, isim, şirket veya VKN ile ara...',
      table: {
        user: 'Kullanıcı',
        created: 'Kayıt',
        actions: 'İşlem',
        company: 'Şirket & B2B',
        role: 'Rol'
      },
      info: {
        subtitle: 'Sistem güvenliği için rollerin yetki seviyelerini kontrol edin.',
        items: {
          admin: 'Yönetici: Operasyon paneline erişim (envanter, iadeler, sevkiyat, kullanıcılar)',
          moderator: 'Moderatör: Sınırlı yönetici yetkisi (envanter ve iadeler)',
          superadmin: 'Süper Yönetici: Tüm yetkiler + rol atamaları (güvenlik için sınırlı görünürlük)',
          user: 'Kullanıcı: Standart kullanıcı (yalnızca kendi hesabını yönetir)'
        },
        title: 'Kullanıcı Rol Sistemi'
      },
      roles: {
        superadmin: 'Tüm sistem ayarlarına ve rol yönetimine tam erişim.',
        admin: 'Ürün, sipariş ve içerik yönetimi için yetki.',
        warehouse: 'Stok yönetimi ve envanter hareketleri yetkisi.',
        sales: 'Sipariş, kargo, iade ve kupon yönetimi yetkisi.',
        viewer: 'Tüm modülleri salt-okunur (view-only) yetkisi.'
      },
      permissionsError: 'Kullanıcı rolleri değiştirme yetkiniz yok.',
      actionTitles: {
        admin: 'Yönetici yap',
        cannotDemoteSelf: 'Kendi yetkinizi düşüremezsiniz',
        moderator: 'Moderatör yap',
        superadmin: 'Süper yönetici yap',
        user: 'Kullanıcı yap'
      },
      actions: {
        admin: 'Yönetici',
        moderator: 'Moderatör',
        superadmin: 'Süper Yönetici',
        user: 'Kullanıcı'
      },
      empty: {
        admins: 'Henüz yönetici kullanıcı yok.',
        all: 'Kullanıcı listesi boş.',
        filtered: 'Aramanızla eşleşen kullanıcı bulunamadı.'
      },
      tabs: {
        admins: 'Yönetici Kullanıcılar ({{count}})',
        all: 'Tüm Kullanıcılar ({{count}})'
      },
      toasts: {
        adminsLoadFailed: 'Yönetici kullanıcılar yüklenemedi',
        allLoadFailed: 'Kullanıcılar yüklenemedi',
        roleNotUpdated: 'Rol güncellenemedi',
        roleUpdateError: 'Rol güncelleme hatası',
        roleUpdated: 'Kullanıcı rolü "{{role}}" olarak güncellendi'
      }
};
