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

export type Category = { id: string; name: string }

export type ReservedRow = {
    order_id: string;
    created_at: string;
    status: string;
    payment_status: string | null;
    quantity: number
}

export enum LoadState { Idle, Loading, Error }

export type Density = 'compact' | 'comfortable'

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
