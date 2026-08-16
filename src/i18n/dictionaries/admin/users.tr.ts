export const users = {
      subtitle: 'Sistem kullanıcılarını ve rollerini yönetin.',
      searchPlaceholder: 'E-posta, isim, şirket veya VKN ile ara...',
      columnsButton: 'Görünüm',
      table: {
        user: 'Kullanıcı',
        created: 'Kayıt',
        createdLabel: 'Katılım',
        actions: 'İşlem',
        orders: 'Siparişler',
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
        title: 'Rol Yetkilendirme Rehberi'
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
        super_admin: 'Süperadmin yap',
        admin: 'Admin yap',
        warehouse: 'Depo yetkisi ver',
        sales: 'Satış yetkisi ver',
        viewer: 'İzleyici yetkisi ver',
        user: 'Normal kullanıcı yap',
        superadmin: 'Süper yönetici yap',
        moderator: 'Moderatör yap',
        cannotDemoteSelf: 'Kendi yetkinizi düşüremezsiniz'
      },
      actions: {
        viewOrders: 'Siparişler',
        viewOrdersFor: '{{user}} kullanıcısının siparişlerini görüntüle',
        admin: 'Yönetici',
        moderator: 'Moderatör',
        superadmin: 'Süper Yönetici',
        user: 'Kullanıcı'
      },
      noEmail: '—',
      emptyTitle: 'Kullanıcı bulunamadı',
      emptyDescription: 'Bu listede henüz herhangi bir kayıt bulunmuyor.',
      filterEmptyDescription: 'Aramanızla eşleşen kullanıcı bulunamadı.',
      empty: {
        admins: 'Henüz yönetici kullanıcı yok.',
        all: 'Kullanıcı listesi boş.',
        filtered: 'Aramanızla eşleşen kullanıcı bulunamadı.'
      },
      accessDeniedTitle: 'Erişim Engellendi',
      accessDeniedDesc: 'Bu sayfayı görüntülemek için yetkiniz bulunmuyor.',
      tabs: {
        admins: 'Yönetici Kullanıcılar ({{count}})',
        all: 'Tüm Kullanıcılar ({{count}})'
      },
      expand: {
        title: 'Kullanıcı Detayları',
        id: 'Kullanıcı ID (UUID)',
        fullName: 'Ad Soyad',
        phone: 'Telefon',
        organizationId: 'Organizasyon ID'
      },
      bulk: {
        changeRole: 'Rol Değiştir',
        selectRole: 'Hedef Rol Seçin',
        confirm: 'Seçilen {{count}} kullanıcının rolünü "{{role}}" olarak değiştirmek istediğinize emin misiniz?'
      },
      export: {
        csvLabel: 'CSV Olarak Aktar'
      },
      toasts: {
        emailsIncomplete: 'Bazı kullanıcıların e-postası gösterilemiyor (liste sınıra takıldı). Boş hücre "e-posta yok" demek DEĞİLDİR.',
        adminsLoadFailed: 'Yönetici kullanıcılar yüklenemedi',
        allLoadFailed: 'Kullanıcılar yüklenemedi',
        roleNotUpdated: 'Rol güncellenemedi',
        roleUpdateError: 'Rol güncelleme hatası',
        noPermission: 'Kullanıcı rolleri değiştirme yetkiniz yok.',
        roleUpdated: 'Kullanıcı rolü "{{role}}" olarak güncellendi',
        bulkRoleUpdated: 'Seçilen {{count}} kullanıcının rolü "{{role}}" olarak güncellendi'
      }
};
