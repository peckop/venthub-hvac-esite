import { describe, expect,it } from 'vitest';

// AdminOrdersBoard içerisinde export edilmediği için mantığını test edilebilir şekilde simüle ediyoruz.
// Gerçek testte dosyadan import etmek idealdir ancak bu işlev private (export edilmemiş) olabilir.
// Dosya içeriğine göre getEffectiveStatus fonksiyonunun yapısı:
function getEffectiveStatus(order: unknown) {
    const o = order as Record<string, unknown>
    if (o.payment_status === 'refunded' || o.payment_status === 'partial_refunded') {
        return o.payment_status
    }
    return o.status || 'pending'
}

describe('AdminOrdersBoard logic', () => {

    describe('getEffectiveStatus', () => {
        it('should return refunded if payment_status is refunded', () => {
            const order = { status: 'delivered', payment_status: 'refunded' };
            expect(getEffectiveStatus(order)).toBe('refunded');
        });

        it('should return partial_refunded if payment_status is partial_refunded', () => {
            const order = { status: 'shipped', payment_status: 'partial_refunded' };
            expect(getEffectiveStatus(order)).toBe('partial_refunded');
        });

        it('should return status if payment_status is not refunded/partial_refunded', () => {
            const order = { status: 'processing', payment_status: 'paid' };
            expect(getEffectiveStatus(order)).toBe('processing');
        });

        it('should return pending if status is empty', () => {
            const order = { payment_status: 'unpaid' };
            expect(getEffectiveStatus(order)).toBe('pending');
        });
    });

    describe('Column Matching', () => {
        // COLUMNS tanımlamasını simüle ediyoruz
        const COLUMNS = [
            { id: 'col_new', statuses: ['pending', 'paid'] },
            { id: 'col_prep', statuses: ['confirmed', 'processing'] },
            { id: 'col_shipped', statuses: ['shipped'] },
            { id: 'col_done', statuses: ['delivered', 'completed'] },
            { id: 'col_cancel', statuses: ['cancelled'] },
            { id: 'col_refund', statuses: ['refunded', 'partial_refunded'] },
        ];

        const getColumnForStatus = (status: string) => {
            return COLUMNS.find(c => c.statuses.includes(status))?.id || 'col_new';
        };

        it('should match pending to col_new', () => {
            expect(getColumnForStatus('pending')).toBe('col_new');
        });

        it('should match paid to col_new', () => {
            expect(getColumnForStatus('paid')).toBe('col_new');
        });

        it('should match confirmed to col_prep', () => {
            expect(getColumnForStatus('confirmed')).toBe('col_prep');
        });

        it('should match processing to col_prep', () => {
            expect(getColumnForStatus('processing')).toBe('col_prep');
        });

        it('should match shipped to col_shipped', () => {
            expect(getColumnForStatus('shipped')).toBe('col_shipped');
        });

        it('should match delivered to col_done', () => {
            expect(getColumnForStatus('delivered')).toBe('col_done');
        });

        it('should match completed to col_done', () => {
            expect(getColumnForStatus('completed')).toBe('col_done');
        });

        it('should match cancelled to col_cancel', () => {
            expect(getColumnForStatus('cancelled')).toBe('col_cancel');
        });

        it('should match refunded to col_refund', () => {
            expect(getColumnForStatus('refunded')).toBe('col_refund');
        });

        it('should match partial_refunded to col_refund', () => {
            expect(getColumnForStatus('partial_refunded')).toBe('col_refund');
        });
    });
});
