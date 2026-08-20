import { describe, expect,it } from 'vitest';

import { canAccessPage, canWrite, ENTITY_TO_RESOURCE, isReadOnly, RESERVED_WRITE_ENTITIES } from '../rbac';

describe('RBAC (Role Based Access Control)', () => {
    describe('canAccessPage', () => {
        it('should return false for null/undefined role', () => {
            expect(canAccessPage(null, '/admin')).toBe(false);
            expect(canAccessPage(undefined, '/admin')).toBe(false);
        });

        it('should return false for "user" role', () => {
            expect(canAccessPage('user', '/admin')).toBe(false);
        });

        it('should deny non-superadmin access to /admin/users', () => {
            expect(canAccessPage('admin', '/admin/users')).toBe(false);
            expect(canAccessPage('moderator', '/admin/users')).toBe(false);
            expect(canAccessPage('warehouse', '/admin/users')).toBe(false);
            expect(canAccessPage('sales', '/admin/users')).toBe(false);
            expect(canAccessPage('viewer', '/admin/users')).toBe(false);
        });

        it('should allow super_admin access to /admin/users', () => {
            expect(canAccessPage('super_admin', '/admin/users')).toBe(true);
        });

        // T134 — DUZELTILEN CANLI KUSUR. Her rolun listesinde pano girdisi ('/admin') var;
        // eski eslestirici onu ON-EK sayiyordu, dolayisiyla '/admin/<hersey>' esliyordu ve
        // acik liste hicbir sey kapatmiyordu. Bu blok kusurun geri gelmesini engeller.
        describe("'/admin' pano koku ON-EK DEGILDIR", () => {
            it('warehouse panoyu gorur ama satinalma sayfasini GORMEZ (T062 niyeti)', () => {
                expect(canAccessPage('warehouse', '/admin')).toBe(true);
                expect(canAccessPage('warehouse', '/admin/purchasing')).toBe(false);
                expect(canAccessPage('warehouse', '/admin/orders')).toBe(false);
                expect(canAccessPage('warehouse', '/admin/pricing')).toBe(false);
            });

            it('sales kendi sayfalarini gorur, fiyat/stok sayfalarini GORMEZ', () => {
                expect(canAccessPage('sales', '/admin/orders')).toBe(true);
                expect(canAccessPage('sales', '/admin/pricing')).toBe(false);
                expect(canAccessPage('sales', '/admin/inventory')).toBe(false);
            });

            it('listedeki DIGER girdiler ON-EK olmaya devam eder', () => {
                expect(canAccessPage('warehouse', '/admin/inventory/report')).toBe(true);
                expect(canAccessPage('warehouse', '/admin/inventory/settings')).toBe(true);
            });
        });

        it('viewer yalniz panoyu gorur (T134: eskiden her sayfayi goruyordu)', () => {
            expect(canAccessPage('viewer', '/admin')).toBe(true);
            expect(canAccessPage('viewer', '/admin/orders')).toBe(false);
            expect(canAccessPage('viewer', '/admin/users')).toBe(false);
        });

        // moderator listesi CANLI RLS OLCUMUNDEN turetildi (2026-08-20), tahminden degil.
        // Kabul kolu: moderator'un GERCEKTEN satir gordugu yuzeyler.
        it('moderator: RLS satir VEREN yuzeyler acik', () => {
            expect(canAccessPage('moderator', '/admin')).toBe(true);
            expect(canAccessPage('moderator', '/admin/products')).toBe(true);
            expect(canAccessPage('moderator', '/admin/categories')).toBe(true);
            expect(canAccessPage('moderator', '/admin/coupons')).toBe(true);
            // purchase_orders politikasi 'moderator'u ACIKCA sayiyor - tek istisna
            expect(canAccessPage('moderator', '/admin/purchasing')).toBe(true);
            expect(canAccessPage('moderator', '/admin/inventory/settings')).toBe(true);
        });

        // Red kolu: moderator'un SIFIR satir gordugu yuzeyler. Bunlar acik kalsaydi
        // "yetkin yok" yerine "kayit yok" ekrani cikardi - sessiz-bos sinifi.
        it('moderator: RLS satir VERMEYEN yuzeyler KAPALI (sessiz-bos onlemi)', () => {
            expect(canAccessPage('moderator', '/admin/orders')).toBe(false);
            expect(canAccessPage('moderator', '/admin/returns')).toBe(false);
            expect(canAccessPage('moderator', '/admin/quotes')).toBe(false);
            expect(canAccessPage('moderator', '/admin/audit-logs')).toBe(false);
            expect(canAccessPage('moderator', '/admin/error-groups')).toBe(false);
            expect(canAccessPage('moderator', '/admin/errors')).toBe(false);
            expect(canAccessPage('moderator', '/admin/webhook-events')).toBe(false);
            expect(canAccessPage('moderator', '/admin/settings')).toBe(false);
            expect(canAccessPage('moderator', '/admin/pricing')).toBe(false);
            expect(canAccessPage('moderator', '/admin/movements')).toBe(false);
            expect(canAccessPage('moderator', '/admin/data-requests')).toBe(false);
            expect(canAccessPage('moderator', '/admin/invoices')).toBe(false);
        });

        // Envanter AYRIMI: ayarlar okunabilir, RAPOR degil (inventory_movements ->
        // is_user_admin(), moderator'u kabul etmiyor). Alt-yol on-eki bunu ayirt etmeli.
        it('moderator: envanter AYARLARI acik ama RAPOR kapali', () => {
            expect(canAccessPage('moderator', '/admin/inventory/settings')).toBe(true);
            expect(canAccessPage('moderator', '/admin/inventory/report')).toBe(false);
            expect(canAccessPage('moderator', '/admin/inventory')).toBe(false);
        });

        it('admin ve super_admin genis yetkisini korur', () => {
            expect(canAccessPage('admin', '/admin/data-requests')).toBe(true);
            expect(canAccessPage('admin', '/admin/invoices')).toBe(true);
            expect(canAccessPage('super_admin', '/admin/invoices')).toBe(true);
        });

        it('admin disi yollar her rolde kapali', () => {
            expect(canAccessPage('warehouse', '/user/profile')).toBe(false);
            expect(canAccessPage('viewer', '/user/profile')).toBe(false);
        });
    });

    describe('canWrite', () => {
        it('should return false for null/undefined role', () => {
            expect(canWrite(null, 'orders')).toBe(false);
            expect(canWrite(undefined, 'orders')).toBe(false);
        });

        it('should deny admin write access to users', () => {
            expect(canWrite('admin', 'users')).toBe(false);
        });

        it('should allow super_admin write access to anything', () => {
            expect(canWrite('super_admin', 'orders')).toBe(true);
        });

        it('should deny viewer write access to anything', () => {
            expect(canWrite('viewer', 'orders')).toBe(false);
        });

        it('should allow warehouse to write to logistics, but not orders', () => {
            expect(canWrite('warehouse', 'logistics')).toBe(true);
            expect(canWrite('warehouse', 'orders')).toBe(false);
        });

        // T134 — ad suruklemesi. Eski ad 'webhook' hicbir yuzeye karsilik gelmiyordu;
        // cagrilsaydi sessizce FALSE donerdi (yaniltici butonun ters yonu: hakki olan
        // rol butonu goremez). Gercek anahtar admin-resources.ts'te 'webhook_events'.
        it("'webhook_events' yazilabilir, eski 'webhook' adi ARTIK YOK", () => {
            expect(canWrite('admin', 'webhook_events')).toBe(true);
            expect(canWrite('admin', 'webhook')).toBe(false);
        });

        // Yazma matrisi de canli politikadan olculdu: UC tablo moderator'u ACIKCA sayiyor.
        it('moderator yalniz politikanin ACIKCA saydigi uc varliga yazar', () => {
            expect(canWrite('moderator', 'products')).toBe(true);
            expect(canWrite('moderator', 'categories')).toBe(true);
            expect(canWrite('moderator', 'purchasing')).toBe(true);
            expect(canWrite('moderator', 'orders')).toBe(false);
            expect(canWrite('moderator', 'pricing')).toBe(false);
            expect(canWrite('moderator', 'settings')).toBe(false);
        });

        // KASITLI ASIMETRI: sayfayi GORUR ama YAZAMAZ. Yazma politikalari is_user_admin()
        // istiyor, o da moderator'u kabul etmiyor. Ikisini esitlemek yaniltici buton uretirdi.
        it('moderator kupon ve envanter ayarlarini OKUR ama YAZAMAZ', () => {
            expect(canAccessPage('moderator', '/admin/coupons')).toBe(true);
            expect(canWrite('moderator', 'coupons')).toBe(false);
            expect(canAccessPage('moderator', '/admin/inventory/settings')).toBe(true);
            expect(canWrite('moderator', 'inventory_settings')).toBe(false);
        });

        // T134 — 'logs' silindi. Sebep "cagrilmiyor" degil: karsiligi /admin/audit-logs,
        // yani DENETIM DEFTERI, ve defter append-only. Buraya yazma izni vermek kaniti
        // bozan bir islemi mesrulastirir. super_admin'in '*' hakki ayri konudur.
        it("denetim defterine ('logs') hicbir rolun ACIK yazma izni yok", () => {
            expect(canWrite('admin', 'logs')).toBe(false);
            expect(canWrite('moderator', 'logs')).toBe(false);
            expect(canWrite('warehouse', 'logs')).toBe(false);
        });

        it('admin fatura ve KVKK defterine yazabilir, moderator YAZAMAZ', () => {
            expect(canWrite('admin', 'invoices')).toBe(true);
            expect(canWrite('admin', 'data_requests')).toBe(true);
            expect(canWrite('moderator', 'invoices')).toBe(false);
            expect(canWrite('moderator', 'data_requests')).toBe(false);
        });
    });

    // T134 — ENTITY_TO_RESOURCE "bilinen varlik" SSOT'u. Buradaki assert'ler haritanin
    // KENDI tutarliligini olcer; UI cagrisi ile matrisi karsilastiran kapi ADMIN seridinde.
    describe('ENTITY_TO_RESOURCE + RESERVED_WRITE_ENTITIES', () => {
        it("'users' bilinen varliktir ama hicbir matriste ACIK degil", () => {
            expect(ENTITY_TO_RESOURCE.users).toBe('users');
            expect(canWrite('admin', 'users')).toBe(false);
            expect(canWrite('moderator', 'users')).toBe(false);
        });

        it('ad suruklemesi haritada gorunur: data_requests defterde camelCase', () => {
            expect(ENTITY_TO_RESOURCE.data_requests).toBe('dataRequests');
        });

        it('rezerve varliklar haritada TANIMLI olmali (uydurma ad rezerve edilemez)', () => {
            for (const e of RESERVED_WRITE_ENTITIES) {
                expect(ENTITY_TO_RESOURCE[e]).toBeDefined();
            }
        });

        it("silinen 'logs' ve eski 'webhook' adi haritada YOK", () => {
            expect(ENTITY_TO_RESOURCE.logs).toBeUndefined();
            expect(ENTITY_TO_RESOURCE.webhook).toBeUndefined();
        });
    });

    describe('isReadOnly', () => {
        it('should return true for viewer and user roles', () => {
            expect(isReadOnly('viewer')).toBe(true);
            expect(isReadOnly('user')).toBe(true);
        });

        it('should return true for null/undefined roles', () => {
            expect(isReadOnly(null)).toBe(true);
            expect(isReadOnly(undefined)).toBe(true);
        });

        it('should return false for admin, superadmin, warehouse, sales roles', () => {
            expect(isReadOnly('admin')).toBe(false);
            expect(isReadOnly('super_admin')).toBe(false);
            expect(isReadOnly('warehouse')).toBe(false);
            expect(isReadOnly('sales')).toBe(false);
        });
    });
});
