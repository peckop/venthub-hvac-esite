export type UserRole = 'super_admin' | 'admin' | 'moderator' | 'warehouse' | 'sales' | 'viewer' | 'user';

/**
 * Sayfa Erişim Matrisi
 *
 * T134 — NİÇİN moderator/viewer artık '*' TAŞIMIYOR:
 * '*' "her sayfa" demek değil, "DB'nin ne dediğini bilmiyorum" demekti. Üç kez aynı
 * sınıf hata yaşandı ve üçünde de çare rota-rota elle yama oldu (users, data-requests,
 * invoices). Sebep tek: geniş varsayılan + dar RLS = SESSİZ-BOŞ ekran, yani kullanıcı
 * "yetkin yok" yerine "kayıt yok" görüyor. Açık liste bunu tersine çevirir: yeni bir
 * admin sayfası eklendiğinde moderator onu OTOMATİK GÖRMEZ — görmesi isteniyorsa
 * RLS'in gerçekten satır verdiği ölçülüp buraya elle eklenir. Fail-closed KASITLI.
 */
const ROLE_PAGE_ACCESS: Record<UserRole, string[]> = {
    super_admin: ['*'], // Her seye erişim
    admin: ['*'], // Her seye erişim (kullanıcılar sayfası haricinde kontrol edilecek)
    // moderator: RLS'in okuma verdiği yüzeyler. DIŞARIDA BIRAKILANLAR ve sebepleri:
    //   /admin/users         → yalnız super_admin (aşağıdaki özel yetki kontrolü)
    //   /admin/data-requests → is_admin_user() moderator'u kabul etmez (T063, prod'dan ölçüldü)
    //   /admin/invoices      → order_invoices RLS: user_role IN ('admin','super_admin') (T132)
    moderator: [
        '/admin',
        '/admin/audit-logs',
        '/admin/categories',
        '/admin/coupons',
        '/admin/error-groups',
        '/admin/errors',
        '/admin/inventory',
        '/admin/logistics',
        '/admin/movements',
        '/admin/orders',
        '/admin/pricing',
        '/admin/products',
        '/admin/purchasing',
        '/admin/quotes',
        '/admin/returns',
        '/admin/settings',
        '/admin/webhook-events'
    ],
    // T062 NOTU: `/admin/purchasing` warehouse'ta BİLEREK YOK. `process_goods_receipt` RPC'si
    // warehouse'u kabul eder, ama satınalma tablolarının RLS SELECT'i (maliyet hassas)
    // yalnız super_admin/admin/moderator'a açık. Sayfayı açsa BOŞ liste görür ve hata
    // da almaz — sessiz-boş. UI izni, DB'nin gerçekten verdiğinin ötesine geçemez.
    // Açılış şartı: purchasing-standard.md §8.1 (maliyetsiz view + warehouse SELECT).
    warehouse: [
        '/admin',
        '/admin/inventory',
        '/admin/movements',
        '/admin/inventory/report',
        '/admin/inventory/settings'
    ],
    sales: [
        '/admin',
        '/admin/orders',
        '/admin/logistics',
        '/admin/returns',
        '/admin/quotes',
        '/admin/coupons'
    ],
    // viewer: '*' idi — "her şeyi görebilir" NİYETİ vardı ama ölçülmüş bir karşılığı YOKTU.
    // ROLE_WRITE_ACCESS.viewer zaten boş, isReadOnly() viewer'ı salt-okunur sayıyor; yani
    // viewer her admin sayfasını açıp hiçbirinde yazamıyordu ve RLS'in satır vermediği
    // yerlerde boş ekran görüyordu. GEÇİCİ olarak yalnız panoya indirildi.
    // AÇIK KARAR (Recep): viewer vaat edilmiş bir yetenek mi, yoksa kaldırılacak mı?
    // Cevap "vaat" ise açılacak sayfalar RLS ölçümüyle tek tek eklenir.
    viewer: ['/admin'],
    user: [] // Sadece site kullanicisi
};

/**
 * Yazma (Action) İzin Matrisi
 *
 * T134 — 'logs' KALDIRILDI. Gerekçe "hiç çağrılmıyor" DEĞİL (o yalnız semptom):
 * karşılığı `/admin/audit-logs` yani DENETİM DEFTERİ, ve defter append-only'dir.
 * Oraya UI yazma izni vermek en iyi ihtimalle yanıltıcı buton, en kötü ihtimalle
 * kanıtı bozan bir yazmayı meşrulaştırır. Yani bu satır ölü olduğu için değil,
 * CANLANMAMASI GEREKTİĞİ için siliniyor. Kayıt defterindeki anahtarı: 'audit'.
 *
 * T134 — 'webhook' → 'webhook_events'. Ad sürüklemesiydi: gerçek anahtar
 * admin-resources.ts:372'de 'webhook_events', rota /admin/webhook-events, tablo
 * webhook_events. Eski ad hiçbir şeye karşılık gelmiyordu — çağrılsaydı FALSE dönerdi.
 */
const ROLE_WRITE_ACCESS: Record<UserRole, string[]> = {
    super_admin: ['*'],
    admin: ['orders', 'logistics', 'returns', 'quotes', 'coupons', 'products', 'categories', 'inventory', 'movements', 'inventory_settings', 'webhook_events', 'error_groups', 'settings', 'pricing', 'purchasing', 'data_requests', 'invoices'],
    // 'data_requests' ve 'invoices' BILEREK yalniz admin'de (+ super_admin '*'): her ikisinin
    // RLS kapisi is_admin_user() ve o moderator'u kabul ETMEZ; moderator'a yazma izni vermek
    // yalniz yaniltici buton uretirdi.
    moderator: ['orders', 'logistics', 'returns', 'quotes', 'coupons', 'products', 'categories', 'inventory', 'movements', 'inventory_settings', 'webhook_events', 'error_groups', 'settings', 'pricing', 'purchasing'],
    // warehouse'a 'purchasing' yazma izni YOK — yukarıdaki sayfa notuna bak (RLS okuma
    // vermiyor; yazma izni tek başına kullanılamaz, yalnız yanıltıcı buton üretirdi).
    warehouse: ['logistics', 'inventory', 'movements', 'inventory_settings'],
    sales: ['orders', 'logistics', 'returns', 'quotes', 'coupons'],
    viewer: [],
    user: []
};

/**
 * BİLİNEN yazma varlıklarının TEK KAYNAĞI: varlık adı → admin kayıt defteri anahtarı
 * (src/config/admin-resources.ts). Kapının "bu varlık gerçek mi" sorusunu buradan sorması
 * gerekir; matristen değil. İki ayrı soru çünkü:
 *   · matris = KİM yazabilir      · bu harita = varlık GERÇEKTEN VAR MI
 * 'users' matriste hiçbir rolde yok (super_admin'e '*' ile gelir, admin'e aşağıdaki özel
 * kontrolle kapatılır) ama canWrite('users') CANLI ÇAĞRILIYOR — yani "bilinen varlık"
 * ile "izin verilmiş varlık" aynı küme değildir. Sürüklemeyi de burası yakalar:
 * data_requests ↔ dataRequests (defterde camelCase) bugünkü canlı örnek.
 */
export const ENTITY_TO_RESOURCE: Record<string, string> = {
    orders: 'orders',
    logistics: 'logistics',
    returns: 'returns',
    quotes: 'quotes',
    coupons: 'coupons',
    products: 'products',
    categories: 'categories',
    inventory: 'inventory',
    movements: 'movements',
    inventory_settings: 'inventory_settings',
    webhook_events: 'webhook_events',
    error_groups: 'error_groups',
    settings: 'settings',
    pricing: 'pricing',
    purchasing: 'purchasing',
    data_requests: 'dataRequests',
    invoices: 'invoices',
    users: 'users'
};

/**
 * Matriste BİLEREK duran, ama henüz hiçbir yüzeyden çağrılmayan varlıklar.
 * Sayfası ve defter anahtarı GERÇEK; yalnız o ekranda yazma kontrolü henüz bağlanmadı.
 * Kapı "matriste olup çağrılmayan varlık" gördüğünde burada aramalı: listede varsa
 * rezerve, yoksa KIRMIZI. Bu liste boşalmalı — büyüyorsa niyet birikiyor demektir.
 */
export const RESERVED_WRITE_ENTITIES: readonly string[] = ['movements', 'webhook_events'];


/**
 * Pano koku. Her rolun listesinde bulunur ve ON-EK olarak sayilirsa listeyi anlamsizlastirir
 * (bkz. canAccessPage icindeki T134 notu), o yuzden tek yerden adlandirildi.
 */
const ADMIN_ROOT = '/admin';

/**
 * Verilen rol, belirtilen sayfaya erisebilir mi?
 */
export function canAccessPage(role: UserRole | null | undefined, path: string): boolean {
    if (!role) return false;
    if (role === 'user') return false;

    // Özel yetki: super_admin hariç kimse 'Kullanıcılar' sayfasını göremez
    if (role !== 'super_admin' && path.startsWith('/admin/users')) {
        return false;
    }

    // T063 — KVKK talep defteri: RLS kapısı `p_dsr_admin_all` → `is_admin_user()`, o da
    // YALNIZ 'admin'/'super_admin' kabul eder (2026-08-17'de prod'dan ölçüldü).
    // T134 NOTU: moderator/viewer artık '*' taşımadığı için bu kontrol onlar açısından
    // ARTIK GEREKSİZ — bilerek duruyor. Kaldırmak bugün davranışı değiştirmez, ama
    // matris tekrar genişletilirse tek savunma hattı kalmaz. Kemer + askı.
    if (path.startsWith('/admin/data-requests') && role !== 'admin' && role !== 'super_admin') {
        return false;
    }

    // T132 — fatura defteri: `order_invoices` RLS politikaları `is_admin_user()`'a bağlı.
    // Canlı tanım 2026-08-20'de prod'dan okundu: `user_role IN ('admin','super_admin')`.
    // (T134: yukarıdaki kemer+askı notu buraya da aynen geçerli.)
    if (path.startsWith('/admin/invoices') && role !== 'admin' && role !== 'super_admin') {
        return false;
    }

    const allowedPaths = ROLE_PAGE_ACCESS[role as UserRole] || [];
    if (allowedPaths.includes('*')) return true;

    // T134 — '/admin' ARTIK ON-EK DEGIL, TAM ESLESME.
    // Canli kusurdu: eski kural `path.startsWith(p + '/')` idi ve her rolun listesinde
    // pano girdisi olarak '/admin' vardi; '/admin/purchasing'.startsWith('/admin/') TRUE
    // donuyordu. Yani ACIK LISTE MEKANIZMASI BASTAN ETKISIZDI - warehouse, T062'de
    // "bilerek disarida" yazan satinalma sayfasina panodan geciyordu. Eski test bunu
    // gormus ("This is a flaw in the app's RBAC logic or intentional") ve DOGRU davranisi
    // degil MEVCUT davranisi assert etmis; kusur boylece kapinin icinde yasadi.
    // Bu duzeltme olmadan viewer: ['/admin'] de '*' ile AYNI sey olurdu.
    return allowedPaths.some(p => {
        if (path === p) return true;
        if (p === ADMIN_ROOT) return false;
        return path.startsWith(p + '/');
    });
}

/**
 * Verilen rol, belirtilen entity'de yazma/düzenleme işlemi yapabilir mi?
 */
export function canWrite(role: UserRole | null | undefined, entity: string): boolean {
    if (!role) return false;

    // Admin kullanıcı yetkisini değiştiremez (bunu config.admin handle ediyordu, burda da engelliyoruz)
    if (role === 'admin' && entity === 'users') {
        return false;
    }

    const allowedEntities = ROLE_WRITE_ACCESS[role] || [];
    if (allowedEntities.includes('*')) return true;

    return allowedEntities.includes(entity);
}

/**
 * Kullanıcı salt-okunur mu?
 */
export function isReadOnly(role: UserRole | null | undefined): boolean {
    if (!role) return true;
    return role === 'viewer' || role === 'user';
}
