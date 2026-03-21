import { Database } from './database.types';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Re-export common types
export type Category = Tables<'categories'>;
export type Product = Tables<'products'>;
export type Order = Tables<'venthub_orders'>;
export type OrderItem = Tables<'venthub_order_items'>;
export type Profile = Tables<'user_profiles'>;
export type Project = Tables<'user_projects'>;
