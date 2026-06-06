import { Category } from './ui-models'
export type { Category }

export type InventoryRow = {
    product_id: string;
    name: string;
    physical_stock: number;
    reserved_stock: number;
    available_stock: number;
    warehouse_location?: string | null;
    supplier_name?: string | null;
    daily_velocity?: number;
    days_until_empty?: number;
    abc_class?: 'A' | 'B' | 'C' | null;
}

export type SortKey = 'name' | 'physical' | 'reserved' | 'available' | 'threshold' | 'status' | 'location' | 'supplier' | 'days_empty' | 'abc'


export type ReservedRow = {
    order_id: string;
    created_at: string;
    status: string;
    payment_status: string | null;
    quantity: number
}

import { Density, LoadState } from './admin-shared'
export type { Density }
export { LoadState }

export type VisibleCols = {
    name: boolean;
    physical: boolean;
    reserved: boolean;
    available: boolean;
    threshold: boolean;
    status: boolean;
    location: boolean;
    supplier: boolean;
    abc: boolean;
    days: boolean;
}
