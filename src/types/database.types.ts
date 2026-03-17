export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          role: 'super_admin' | 'admin' | 'warehouse' | 'sales' | 'viewer' | 'user'
          full_name: string | null
          phone: string | null
          created_at: string
          updated_at: string
          organization_id: string | null
        }
        Insert: {
          id: string
          role?: 'super_admin' | 'admin' | 'warehouse' | 'sales' | 'viewer' | 'user'
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          organization_id?: string | null
        }
        Update: {
          id?: string
          role?: 'super_admin' | 'admin' | 'warehouse' | 'sales' | 'viewer' | 'user'
          full_name?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          parent_id: string | null
          level: number
          description: string | null
          image_url: string | null
          seo_title: string | null
          seo_desc: string | null
          is_featured: boolean
          sort_order: number
          metadata: Json
          is_active: boolean
          authority_content: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          parent_id?: string | null
          level?: number
          description?: string | null
          image_url?: string | null
          seo_title?: string | null
          seo_desc?: string | null
          is_featured?: boolean
          sort_order?: number
          metadata?: Json
          is_active?: boolean
          authority_content?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          parent_id?: string | null
          level?: number
          description?: string | null
          image_url?: string | null
          seo_title?: string | null
          seo_desc?: string | null
          is_featured?: boolean
          sort_order?: number
          metadata?: Json
          is_active?: boolean
          authority_content?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string
          price: number
          sku: string
          category_id: string | null
          subcategory_id: string | null
          status: 'active' | 'inactive' | 'out_of_stock'
          is_featured: boolean
          description: string | null
          technical_specs: Json | null
          image_url: string | null
          stock_qty: number
          low_stock_threshold: number
          low_stock_override: boolean
          purchase_price: number | null
          airflow_capacity: number | null
          noise_level: number | null
          pressure_rating: number | null
          slug: string
          meta_title: string | null
          meta_description: string | null
          model_code: string | null
          warehouse_location: string | null
          supplier_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand: string
          price?: number
          sku: string
          category_id?: string | null
          subcategory_id?: string | null
          status?: 'active' | 'inactive' | 'out_of_stock'
          is_featured?: boolean
          description?: string | null
          technical_specs?: Json | null
          image_url?: string | null
          stock_qty?: number
          low_stock_threshold?: number
          low_stock_override?: boolean
          purchase_price?: number | null
          airflow_capacity?: number | null
          noise_level?: number | null
          pressure_rating?: number | null
          slug: string
          model_code?: string | null
          warehouse_location?: string | null
          supplier_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          price?: number
          sku?: string
          category_id?: string | null
          subcategory_id?: string | null
          status?: 'active' | 'inactive' | 'out_of_stock'
          is_featured?: boolean
          description?: string | null
          technical_specs?: Json | null
          image_url?: string | null
          stock_qty?: number
          low_stock_threshold?: number
          low_stock_override?: boolean
          purchase_price?: number | null
          airflow_capacity?: number | null
          noise_level?: number | null
          pressure_rating?: number | null
          slug?: string
          model_code?: string | null
          warehouse_location?: string | null
          supplier_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          path: string
          alt: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          path: string
          alt?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          path?: string
          alt?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      venthub_orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: string
          total_amount: number
          currency: string
          payment_status: string | null
          payment_method: string | null
          payment_token: string | null
          shipping_address: Json
          billing_address: Json
          customer_name: string | null
          customer_email: string | null
          customer_phone: string | null
          shipping_carrier: string | null
          shipping_tracking_number: string | null
          tracking_url: string | null
          shipped_at: string | null
          delivered_at: string | null
          coupon_code: string | null
          coupon_discount: number | null
          conversation_id: string | null
          invoice_type: string | null
          invoice_profile: Json | null
          invoice_info: Json | null
          legal_consents: Json | null
          payment_debug: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          status?: string
          total_amount: number
          currency?: string
          payment_status?: string | null
          payment_method?: string | null
          payment_token?: string | null
          shipping_address: Json
          billing_address: Json
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          shipping_carrier?: string | null
          shipping_tracking_number?: string | null
          tracking_url?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          conversation_id?: string | null
          invoice_type?: string | null
          invoice_profile?: Json | null
          invoice_info?: Json | null
          legal_consents?: Json | null
          payment_debug?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: string
          total_amount?: number
          currency?: string
          payment_status?: string | null
          payment_method?: string | null
          payment_token?: string | null
          shipping_address?: Json
          billing_address?: Json
          customer_name?: string | null
          customer_email?: string | null
          customer_phone?: string | null
          shipping_carrier?: string | null
          shipping_tracking_number?: string | null
          tracking_url?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          conversation_id?: string | null
          invoice_type?: string | null
          invoice_profile?: Json | null
          invoice_info?: Json | null
          legal_consents?: Json | null
          payment_debug?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      venthub_order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          product_name: string
          product_sku: string | null
          product_brand: string | null
          product_image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          unit_price: number
          total_price: number
          product_name: string
          product_sku?: string | null
          product_brand?: string | null
          product_image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          product_name?: string
          product_sku?: string | null
          product_brand?: string | null
          product_image_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venthub_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venthub_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_movements: {
        Row: {
          id: string
          product_id: string
          order_id: string | null
          delta: number
          reason: string
          batch_id: string | null
          original_movement_id: string | null
          reversed_by_movement_id: string | null
          undo_by_user_id: string | null
          undo_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          order_id?: string | null
          delta: number
          reason: string
          batch_id?: string | null
          original_movement_id?: string | null
          reversed_by_movement_id?: string | null
          undo_by_user_id?: string | null
          undo_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          order_id?: string | null
          delta?: number
          reason?: string
          batch_id?: string | null
          original_movement_id?: string | null
          reversed_by_movement_id?: string | null
          undo_by_user_id?: string | null
          undo_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_settings: {
        Row: {
          id: boolean
          default_low_stock_threshold: number
          updated_at: string
          alert_email: string | null
          alert_webhook_url: string | null
          reservation_timeout_hours: number
        }
        Insert: {
          id?: boolean
          default_low_stock_threshold?: number
          updated_at?: string
          alert_email?: string | null
          alert_webhook_url?: string | null
          reservation_timeout_hours?: number
        }
        Update: {
          id?: boolean
          default_low_stock_threshold?: number
          updated_at?: string
          alert_email?: string | null
          alert_webhook_url?: string | null
          reservation_timeout_hours?: number
        }
        Relationships: []
      }
      error_groups: {
        Row: {
          id: string
          signature: string
          level: string
          last_message: string | null
          url_sample: string | null
          env: string | null
          release: string | null
          first_seen: string
          last_seen: string
          count: number
          status: 'open' | 'resolved' | 'ignored'
          assigned_to: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          signature: string
          level?: string
          last_message?: string | null
          url_sample?: string | null
          env?: string | null
          release?: string | null
          first_seen?: string
          last_seen?: string
          count?: number
          status?: 'open' | 'resolved' | 'ignored'
          assigned_to?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          signature?: string
          level?: string
          last_message?: string | null
          url_sample?: string | null
          env?: string | null
          release?: string | null
          first_seen?: string
          last_seen?: string
          count?: number
          status?: 'open' | 'resolved' | 'ignored'
          assigned_to?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      order_notes: {
        Row: {
          id: string
          order_id: string
          user_id: string | null
          note: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id?: string | null
          note: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string | null
          note?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          }
        ]
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          label: string | null
          full_name: string
          phone: string
          full_address: string
          city: string
          district: string
          postal_code: string | null
          country: string
          is_default_shipping: boolean
          is_default_billing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string | null
          full_name: string
          phone: string
          full_address: string
          city: string
          district: string
          postal_code?: string | null
          country?: string
          is_default_shipping?: boolean
          is_default_billing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string | null
          full_name?: string
          phone?: string
          full_address?: string
          city?: string
          district?: string
          postal_code?: string | null
          country?: string
          is_default_shipping?: boolean
          is_default_billing?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_invoice_profiles: {
        Row: {
          id: string
          user_id: string
          profile_type: 'individual' | 'corporate'
          company_name: string | null
          tax_number: string | null
          tax_office: string | null
          first_name: string | null
          last_name: string | null
          address_line: string
          district: string
          city: string
          postal_code: string | null
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_type: 'individual' | 'corporate'
          company_name?: string | null
          tax_number?: string | null
          tax_office?: string | null
          first_name?: string | null
          last_name?: string | null
          address_line: string
          district: string
          city: string
          postal_code?: string | null
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_type?: 'individual' | 'corporate'
          company_name?: string | null
          tax_number?: string | null
          tax_office?: string | null
          first_name?: string | null
          last_name?: string | null
          address_line?: string
          district?: string
          city?: string
          postal_code?: string | null
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      venthub_returns: {
        Row: {
          id: string
          order_id: string
          user_id: string
          status: string
          reason: string
          description: string | null
          refund_amount: number | null
          admin_notes: string | null
          requested_at: string
          approved_at: string | null
          processed_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          user_id: string
          status?: string
          reason: string
          description?: string | null
          refund_amount?: number | null
          admin_notes?: string | null
          requested_at?: string
          approved_at?: string | null
          processed_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          user_id?: string
          status?: string
          reason?: string
          description?: string | null
          refund_amount?: number | null
          admin_notes?: string | null
          requested_at?: string
          approved_at?: string | null
          processed_at?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venthub_returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_audit_log: {
        Row: {
          id: string
          at: string
          actor: string | null
          table_name: string
          row_pk: string | null
          action: string
          before: Json | null
          after: Json | null
          comment: string | null
        }
        Insert: {
          id?: string
          at?: string
          actor?: string | null
          table_name: string
          row_pk?: string | null
          action: string
          before?: Json | null
          after?: Json | null
          comment?: string | null
        }
        Update: {
          id?: string
          at?: string
          actor?: string | null
          table_name?: string
          row_pk?: string | null
          action?: string
          before?: Json | null
          after?: Json | null
          comment?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          quantity: number
          unit_price: number | null
          price_list_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          quantity?: number
          unit_price?: number | null
          price_list_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number | null
          price_list_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shopping_carts: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_items: {
        Row: {
          id: string
          project_id: string
          product_id: string
          quantity: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          product_id: string
          quantity?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          product_id?: string
          quantity?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_users: {
        Row: {
          id: string | null
          email: string | null
          full_name: string | null
          role: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      view_admin_orders: {
        Row: {
          id: string | null
          user_id: string | null
          order_number: string | null
          status: string | null
          total_amount: number | null
          customer_name: string | null
          customer_email: string | null
          created_at: string | null
        }
      }
    }
    Functions: {
      get_products_enriched: {
        Args: {
          p_brand?: string
          p_category_ids?: string[]
          p_limit?: number
          p_max_price?: number
          p_min_price?: number
          p_offset?: number
          p_search_query?: string
          p_sort_by?: string
        }
        Returns: Database['public']['Tables']['products']['Row'][]
      }
      fts_search_products: {
        Args: { p_q: string; p_limit?: number; p_filters?: Json }
        Returns: {
          id: string
          brand: string
          name: string
          price: number
          rank: number
          sku: string
        }[]
      }
      get_search_suggestions: {
        Args: { p_q: string; p_limit?: number }
        Returns: {
          type: string
          label: string
          url: string
          metadata: Json
        }[]
      }
      get_effective_price: {
        Args: { p_product_id: string }
        Returns: number
      }
      adjust_stock: {
        Args: { p_product_id: string; p_delta: number; p_reason: string; p_batch_id?: string }
        Returns: void
      }
      reverse_inventory_batch: {
        Args: { p_batch_id: string; p_max_minutes?: number }
        Returns: number
      }
    }
    Enums: {
      contact_department: 'sales' | 'support' | 'consulting'
      contact_status: 'new' | 'read' | 'archived'
    }
  }
}
