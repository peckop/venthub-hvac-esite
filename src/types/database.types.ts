export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor: string | null
          after: Json | null
          at: string
          before: Json | null
          comment: string | null
          id: string
          row_pk: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          comment?: string | null
          id?: string
          row_pk?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor?: string | null
          after?: Json | null
          at?: string
          before?: Json | null
          comment?: string | null
          id?: string
          row_pk?: string | null
          table_name?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          price_list_id: string | null
          product_id: string
          quantity: number
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string | null
          id?: string
          price_list_id?: string | null
          product_id: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string | null
          id?: string
          price_list_id?: string | null
          product_id?: string
          quantity?: number
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "shopping_carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          authority_content: Json | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          level: number
          metadata: Json | null
          name: string
          parent_id: string | null
          seo_desc: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          authority_content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          level?: number
          metadata?: Json | null
          name: string
          parent_id?: string | null
          seo_desc?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          authority_content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          level?: number
          metadata?: Json | null
          name?: string
          parent_id?: string | null
          seo_desc?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_errors: {
        Row: {
          at: string
          env: string | null
          extra: Json | null
          group_id: string | null
          id: string
          level: string
          message: string
          release: string | null
          stack: string | null
          url: string | null
          user_agent: string | null
        }
        Insert: {
          at?: string
          env?: string | null
          extra?: Json | null
          group_id?: string | null
          id?: string
          level?: string
          message: string
          release?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
        }
        Update: {
          at?: string
          env?: string | null
          extra?: Json | null
          group_id?: string | null
          id?: string
          level?: string
          message?: string
          release?: string | null
          stack?: string | null
          url?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_errors_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "error_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          company: string | null
          created_at: string | null
          department: Database["public"]["Enums"]["contact_department"]
          email: string
          id: string
          ip_address: string | null
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["contact_status"]
          subject: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["contact_department"]
          email: string
          id?: string
          ip_address?: string | null
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          subject: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          department?: Database["public"]["Enums"]["contact_department"]
          email?: string
          id?: string
          ip_address?: string | null
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          subject?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean | null
          minimum_order_amount: number | null
          updated_at: string | null
          usage_limit: number | null
          used_count: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean | null
          minimum_order_amount?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean | null
          minimum_order_amount?: number | null
          updated_at?: string | null
          usage_limit?: number | null
          used_count?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      error_groups: {
        Row: {
          assigned_to: string | null
          count: number
          env: string | null
          first_seen: string
          id: string
          last_message: string | null
          last_seen: string
          level: string
          notes: string | null
          release: string | null
          signature: string
          status: string
          url_sample: string | null
        }
        Insert: {
          assigned_to?: string | null
          count?: number
          env?: string | null
          first_seen?: string
          id?: string
          last_message?: string | null
          last_seen?: string
          level?: string
          notes?: string | null
          release?: string | null
          signature: string
          status?: string
          url_sample?: string | null
        }
        Update: {
          assigned_to?: string | null
          count?: number
          env?: string | null
          first_seen?: string
          id?: string
          last_message?: string | null
          last_seen?: string
          level?: string
          notes?: string | null
          release?: string | null
          signature?: string
          status?: string
          url_sample?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_groups_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          batch_id: string | null
          created_at: string
          delta: number
          id: string
          order_id: string | null
          original_movement_id: string | null
          product_id: string
          reason: string
          reversed_by_movement_id: string | null
          undo_at: string | null
          undo_by_user_id: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          delta: number
          id?: string
          order_id?: string | null
          original_movement_id?: string | null
          product_id: string
          reason: string
          reversed_by_movement_id?: string | null
          undo_at?: string | null
          undo_by_user_id?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          delta?: number
          id?: string
          order_id?: string | null
          original_movement_id?: string | null
          product_id?: string
          reason?: string
          reversed_by_movement_id?: string | null
          undo_at?: string | null
          undo_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_settings: {
        Row: {
          alert_email: string | null
          alert_webhook_url: string | null
          default_low_stock_threshold: number | null
          id: boolean
          reservation_timeout_hours: number | null
          updated_at: string
        }
        Insert: {
          alert_email?: string | null
          alert_webhook_url?: string | null
          default_low_stock_threshold?: number | null
          id?: boolean
          reservation_timeout_hours?: number | null
          updated_at?: string
        }
        Update: {
          alert_email?: string | null
          alert_webhook_url?: string | null
          default_low_stock_threshold?: number | null
          id?: boolean
          reservation_timeout_hours?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      order_attachments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          is_internal: boolean | null
          mime_type: string | null
          order_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          is_internal?: boolean | null
          mime_type?: string | null
          order_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          is_internal?: boolean | null
          mime_type?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_attachments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_attachments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_attachments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_attachments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_email_events: {
        Row: {
          created_at: string
          email_to: string
          id: string
          order_id: string
          provider: string
          provider_message_id: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email_to: string
          id?: string
          order_id: string
          provider?: string
          provider_message_id?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email_to?: string
          id?: string
          order_id?: string
          provider?: string
          provider_message_id?: string | null
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_email_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_email_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_email_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notes: {
        Row: {
          created_at: string | null
          id: string
          is_internal: boolean | null
          note: string
          order_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          note: string
          order_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          note?: string
          order_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          tier_level: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tier_level?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tier_level?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          order_id: string | null
          payment_method: string
          provider_response: Json | null
          status: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payment_method: string
          provider_response?: Json | null
          status: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          order_id?: string | null
          payment_method?: string
          provider_response?: Json | null
          status?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      price_lists: {
        Row: {
          created_at: string | null
          description: string | null
          effective_from: string | null
          effective_to: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      product_authorities: {
        Row: {
          badge_text: string | null
          content: string
          created_at: string | null
          expert_avatar_url: string | null
          expert_name: string
          expert_title: string | null
          id: string
          product_id: string
          rating: number | null
          updated_at: string | null
        }
        Insert: {
          badge_text?: string | null
          content: string
          created_at?: string | null
          expert_avatar_url?: string | null
          expert_name: string
          expert_title?: string | null
          id?: string
          product_id: string
          rating?: number | null
          updated_at?: string | null
        }
        Update: {
          badge_text?: string | null
          content?: string
          created_at?: string | null
          expert_avatar_url?: string | null
          expert_name?: string
          expert_title?: string | null
          id?: string
          product_id?: string
          rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_authorities_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_authorities_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_authorities_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt: string | null
          created_at: string
          id: string
          path: string
          product_id: string
          sort_order: number
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          path: string
          product_id: string
          sort_order?: number
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          path?: string
          product_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          base_price: number
          created_at: string | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          price_list_id: string
          product_id: string
          sale_price: number | null
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          base_price: number
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          price_list_id: string
          product_id: string
          sale_price?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          base_price?: number
          created_at?: string | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          price_list_id?: string
          product_id?: string
          sale_price?: number | null
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          airflow_capacity: number | null
          brand: string
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          low_stock_override: boolean
          low_stock_threshold: number | null
          meta_description: string | null
          meta_title: string | null
          model_code: string | null
          name: string
          noise_level: number | null
          pressure_rating: number | null
          price: number
          purchase_price: number | null
          sku: string
          slug: string | null
          status: string
          stock_qty: number | null
          subcategory_id: string | null
          supplier_name: string | null
          technical_specs: Json | null
          updated_at: string
          warehouse_location: string | null
        }
        Insert: {
          airflow_capacity?: number | null
          brand: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          low_stock_override?: boolean
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          model_code?: string | null
          name: string
          noise_level?: number | null
          pressure_rating?: number | null
          price?: number
          purchase_price?: number | null
          sku: string
          slug?: string | null
          status?: string
          stock_qty?: number | null
          subcategory_id?: string | null
          supplier_name?: string | null
          technical_specs?: Json | null
          updated_at?: string
          warehouse_location?: string | null
        }
        Update: {
          airflow_capacity?: number | null
          brand?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          low_stock_override?: boolean
          low_stock_threshold?: number | null
          meta_description?: string | null
          meta_title?: string | null
          model_code?: string | null
          name?: string
          noise_level?: number | null
          pressure_rating?: number | null
          price?: number
          purchase_price?: number | null
          sku?: string
          slug?: string | null
          status?: string
          stock_qty?: number | null
          subcategory_id?: string | null
          supplier_name?: string | null
          technical_specs?: Json | null
          updated_at?: string
          warehouse_location?: string | null
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
          },
        ]
      }
      project_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          project_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          project_id: string
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          project_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "project_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "project_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          bucket: string
          count: number
          key: string
        }
        Insert: {
          bucket: string
          count?: number
          key: string
        }
        Update: {
          bucket?: string
          count?: number
          key?: string
        }
        Relationships: []
      }
      returns_webhook_events: {
        Row: {
          body_hash: string
          carrier: string | null
          event_id: string
          id: number
          order_id: string | null
          processed_at: string | null
          received_at: string
          return_id: string | null
          status_mapped: string | null
          status_raw: string | null
          tracking_number: string | null
        }
        Insert: {
          body_hash: string
          carrier?: string | null
          event_id: string
          id?: number
          order_id?: string | null
          processed_at?: string | null
          received_at?: string
          return_id?: string | null
          status_mapped?: string | null
          status_raw?: string | null
          tracking_number?: string | null
        }
        Update: {
          body_hash?: string
          carrier?: string | null
          event_id?: string
          id?: number
          order_id?: string | null
          processed_at?: string | null
          received_at?: string
          return_id?: string | null
          status_mapped?: string | null
          status_raw?: string | null
          tracking_number?: string | null
        }
        Relationships: []
      }
      shipping_email_events: {
        Row: {
          carrier: string | null
          created_at: string
          email_to: string
          id: string
          order_id: string
          provider: string
          provider_message_id: string | null
          subject: string
          tracking_number: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          email_to: string
          id?: string
          order_id: string
          provider?: string
          provider_message_id?: string | null
          subject: string
          tracking_number?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string
          email_to?: string
          id?: string
          order_id?: string
          provider?: string
          provider_message_id?: string | null
          subject?: string
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipping_email_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "shipping_email_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipping_email_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_idempotency: {
        Row: {
          created_at: string
          key: string
          scope: string
        }
        Insert: {
          created_at?: string
          key: string
          scope?: string
        }
        Update: {
          created_at?: string
          key?: string
          scope?: string
        }
        Relationships: []
      }
      shipping_webhook_events: {
        Row: {
          body_hash: string
          carrier: string | null
          event_id: string
          id: number
          order_id: string | null
          order_number: string | null
          processed_at: string | null
          received_at: string
          status_mapped: string | null
          status_raw: string | null
        }
        Insert: {
          body_hash: string
          carrier?: string | null
          event_id: string
          id?: number
          order_id?: string | null
          order_number?: string | null
          processed_at?: string | null
          received_at?: string
          status_mapped?: string | null
          status_raw?: string | null
        }
        Update: {
          body_hash?: string
          carrier?: string | null
          event_id?: string
          id?: number
          order_id?: string | null
          order_number?: string | null
          processed_at?: string | null
          received_at?: string
          status_mapped?: string | null
          status_raw?: string | null
        }
        Relationships: []
      }
      shopping_carts: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          address_line: string
          address_type: string
          city: string
          country: string
          created_at: string
          district: string
          full_address: string | null
          full_name: string | null
          id: string
          is_default: boolean
          is_default_billing: boolean | null
          is_default_shipping: boolean | null
          label: string | null
          phone: string | null
          postal_code: string | null
          street_address: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line: string
          address_type: string
          city: string
          country?: string
          created_at?: string
          district: string
          full_address?: string | null
          full_name?: string | null
          id?: string
          is_default?: boolean
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          phone?: string | null
          postal_code?: string | null
          street_address?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line?: string
          address_type?: string
          city?: string
          country?: string
          created_at?: string
          district?: string
          full_address?: string | null
          full_name?: string | null
          id?: string
          is_default?: boolean
          is_default_billing?: boolean | null
          is_default_shipping?: boolean | null
          label?: string | null
          phone?: string | null
          postal_code?: string | null
          street_address?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invoice_profiles: {
        Row: {
          address_line: string
          city: string
          company_name: string | null
          country: string
          created_at: string
          district: string
          first_name: string | null
          id: string
          is_default: boolean
          last_name: string | null
          postal_code: string | null
          profile_type: string
          tax_number: string | null
          tax_office: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line: string
          city: string
          company_name?: string | null
          country?: string
          created_at?: string
          district: string
          first_name?: string | null
          id?: string
          is_default?: boolean
          last_name?: string | null
          postal_code?: string | null
          profile_type: string
          tax_number?: string | null
          tax_office?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line?: string
          city?: string
          company_name?: string | null
          country?: string
          created_at?: string
          district?: string
          first_name?: string | null
          id?: string
          is_default?: boolean
          last_name?: string | null
          postal_code?: string | null
          profile_type?: string
          tax_number?: string | null
          tax_office?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invoice_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          organization_id: string | null
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      venthub_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_time: number | null
          price_list_id_snapshot: string | null
          product_brand: string | null
          product_id: string
          product_image_url: string | null
          product_name: string
          product_name_snapshot: string | null
          product_sku: string | null
          product_sku_snapshot: string | null
          product_snapshot: Json | null
          quantity: number
          tax_rate_snapshot: number | null
          total_price: number
          unit_price: number
          unit_price_snapshot: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_time?: number | null
          price_list_id_snapshot?: string | null
          product_brand?: string | null
          product_id: string
          product_image_url?: string | null
          product_name: string
          product_name_snapshot?: string | null
          product_sku?: string | null
          product_sku_snapshot?: string | null
          product_snapshot?: Json | null
          quantity?: number
          tax_rate_snapshot?: number | null
          total_price: number
          unit_price: number
          unit_price_snapshot?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_time?: number | null
          price_list_id_snapshot?: string | null
          product_brand?: string | null
          product_id?: string
          product_image_url?: string | null
          product_name?: string
          product_name_snapshot?: string | null
          product_sku?: string | null
          product_sku_snapshot?: string | null
          product_snapshot?: Json | null
          quantity?: number
          tax_rate_snapshot?: number | null
          total_price?: number
          unit_price?: number
          unit_price_snapshot?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "venthub_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "venthub_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venthub_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venthub_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "venthub_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "venthub_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      venthub_orders: {
        Row: {
          billing_address: Json
          carrier: string | null
          conversation_id: string | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          id: string
          invoice_info: Json | null
          invoice_profile: Json | null
          invoice_type: string | null
          legal_consents: Json | null
          order_number: string
          payment_debug: Json | null
          payment_method: string | null
          payment_status: string | null
          payment_token: string | null
          shipped_at: string | null
          shipping_address: Json
          shipping_carrier: string | null
          shipping_method: string | null
          shipping_tracking_number: string | null
          status: string
          subtotal_snapshot: number | null
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address: Json
          carrier?: string | null
          conversation_id?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          invoice_info?: Json | null
          invoice_profile?: Json | null
          invoice_type?: string | null
          legal_consents?: Json | null
          order_number: string
          payment_debug?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          payment_token?: string | null
          shipped_at?: string | null
          shipping_address: Json
          shipping_carrier?: string | null
          shipping_method?: string | null
          shipping_tracking_number?: string | null
          status?: string
          subtotal_snapshot?: number | null
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json
          carrier?: string | null
          conversation_id?: string | null
          coupon_code?: string | null
          coupon_discount?: number | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          id?: string
          invoice_info?: Json | null
          invoice_profile?: Json | null
          invoice_type?: string | null
          legal_consents?: Json | null
          order_number?: string
          payment_debug?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          payment_token?: string | null
          shipped_at?: string | null
          shipping_address?: Json
          shipping_carrier?: string | null
          shipping_method?: string | null
          shipping_tracking_number?: string | null
          status?: string
          subtotal_snapshot?: number | null
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venthub_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      venthub_returns: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          order_id: string
          processed_at: string | null
          reason: string
          refund_amount: number | null
          requested_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_id: string
          processed_at?: string | null
          reason: string
          refund_amount?: number | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string
          processed_at?: string | null
          reason?: string
          refund_amount?: number | null
          requested_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venthub_returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "venthub_returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venthub_returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venthub_returns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
      wizard_selections: {
        Row: {
          calculated_airflow_m3h: number | null
          calculated_nozzle_velocity: number | null
          calculated_power_w: number | null
          climate_zone: string | null
          created_at: string | null
          door_height_cm: number
          door_width_cm: number
          heating_needed: string | null
          id: string
          ip_address: unknown
          order_id: string | null
          recommended_product_ids: string[] | null
          recommended_series: string | null
          sector: string | null
          selected_product_id: string | null
          session_id: string
          traffic_intensity: string | null
          usage_location: string | null
          user_agent: string | null
          user_id: string | null
          wind_condition: string | null
        }
        Insert: {
          calculated_airflow_m3h?: number | null
          calculated_nozzle_velocity?: number | null
          calculated_power_w?: number | null
          climate_zone?: string | null
          created_at?: string | null
          door_height_cm: number
          door_width_cm: number
          heating_needed?: string | null
          id?: string
          ip_address?: unknown
          order_id?: string | null
          recommended_product_ids?: string[] | null
          recommended_series?: string | null
          sector?: string | null
          selected_product_id?: string | null
          session_id: string
          traffic_intensity?: string | null
          usage_location?: string | null
          user_agent?: string | null
          user_id?: string | null
          wind_condition?: string | null
        }
        Update: {
          calculated_airflow_m3h?: number | null
          calculated_nozzle_velocity?: number | null
          calculated_power_w?: number | null
          climate_zone?: string | null
          created_at?: string | null
          door_height_cm?: number
          door_width_cm?: number
          heating_needed?: string | null
          id?: string
          ip_address?: unknown
          order_id?: string | null
          recommended_product_ids?: string[] | null
          recommended_series?: string | null
          sector?: string | null
          selected_product_id?: string | null
          session_id?: string
          traffic_intensity?: string | null
          usage_location?: string | null
          user_agent?: string | null
          user_id?: string | null
          wind_condition?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wizard_selections_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "reserved_orders"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "wizard_selections_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "venthub_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wizard_selections_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "view_admin_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wizard_selections_selected_product_id_fkey"
            columns: ["selected_product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "wizard_selections_selected_product_id_fkey"
            columns: ["selected_product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "wizard_selections_selected_product_id_fkey"
            columns: ["selected_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wizard_selections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      inventory_summary: {
        Row: {
          available_stock: number | null
          name: string | null
          physical_stock: number | null
          product_id: string | null
          reserved_stock: number | null
          supplier_name: string | null
          warehouse_location: string | null
        }
        Relationships: []
      }
      inventory_velocity: {
        Row: {
          abc_class: string | null
          capital_tied_up: number | null
          daily_velocity: number | null
          days_until_empty: number | null
          product_id: string | null
          stock_qty: number | null
          total_out_30d: number | null
        }
        Relationships: []
      }
      reserved_orders: {
        Row: {
          created_at: string | null
          order_id: string | null
          payment_status: string | null
          product_id: string | null
          quantity: number | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venthub_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "venthub_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "venthub_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      view_admin_orders: {
        Row: {
          billing_address: Json | null
          carrier: string | null
          conversation_id: string | null
          conversation_id_text: string | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          id: string | null
          id_text: string | null
          invoice_info: Json | null
          invoice_profile: Json | null
          invoice_type: string | null
          legal_consents: Json | null
          order_number: string | null
          payment_debug: Json | null
          payment_method: string | null
          payment_status: string | null
          payment_token: string | null
          search_text: string | null
          shipped_at: string | null
          shipping_address: Json | null
          shipping_carrier: string | null
          shipping_method: string | null
          shipping_tracking_number: string | null
          status: string | null
          subtotal_snapshot: number | null
          total_amount: number | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venthub_orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _normalize_rls_expr: { Args: { expr: string }; Returns: string }
      adjust_stock:
        | {
            Args: { p_delta: number; p_product_id: string; p_reason: string }
            Returns: undefined
          }
        | {
            Args: {
              p_batch_id?: string
              p_delta: number
              p_product_id: string
              p_reason: string
            }
            Returns: undefined
          }
      adjust_stock_v2: {
        Args: { p_delta: number; p_product_id: string }
        Returns: undefined
      }
      admin_list_all_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          role: string
          updated_at: string
        }[]
      }
      admin_list_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string
          role: string
          updated_at: string
        }[]
      }
      admin_search_products: {
        Args: {
          p_category_id?: string
          p_limit?: number
          p_offset?: number
          p_q: string
        }
        Returns: {
          brand: string
          category_id: string
          id: string
          is_featured: boolean
          low_stock_threshold: number
          model_code: string
          name: string
          price: number
          purchase_price: number
          rank: number
          sku: string
          slug: string
          status: string
          stock_qty: number
          total_count: number
        }[]
      }
      bump_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: {
          allowed: boolean
          remaining: number
          reset_at: string
        }[]
      }
      fn_admin_get_orders: {
        Args: {
          p_conv?: string
          p_id?: string
          p_limit?: number
          p_status?: string
        }
        Returns: {
          billing_address: Json
          carrier: string | null
          conversation_id: string | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          id: string
          invoice_info: Json | null
          invoice_profile: Json | null
          invoice_type: string | null
          legal_consents: Json | null
          order_number: string
          payment_debug: Json | null
          payment_method: string | null
          payment_status: string | null
          payment_token: string | null
          shipped_at: string | null
          shipping_address: Json
          shipping_carrier: string | null
          shipping_method: string | null
          shipping_tracking_number: string | null
          status: string
          subtotal_snapshot: number | null
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "venthub_orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fn_admin_update_order_status: {
        Args: { p_conv?: string; p_id?: string; p_status?: string }
        Returns: {
          billing_address: Json
          carrier: string | null
          conversation_id: string | null
          coupon_code: string | null
          coupon_discount: number | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          id: string
          invoice_info: Json | null
          invoice_profile: Json | null
          invoice_type: string | null
          legal_consents: Json | null
          order_number: string
          payment_debug: Json | null
          payment_method: string | null
          payment_status: string | null
          payment_token: string | null
          shipped_at: string | null
          shipping_address: Json
          shipping_carrier: string | null
          shipping_method: string | null
          shipping_tracking_number: string | null
          status: string
          subtotal_snapshot: number | null
          total_amount: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "venthub_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fts_search_products: {
        Args: { p_filters?: Json; p_limit?: number; p_q: string }
        Returns: {
          brand: string
          id: string
          name: string
          price: number
          rank: number
          sku: string
        }[]
      }
      generate_order_number: { Args: never; Returns: string }
      get_admin_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
        }[]
      }
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
        Returns: {
          airflow_capacity: number
          brand: string
          category_id: string
          created_at: string
          description: string
          id: string
          image_alt: string
          image_url: string
          is_featured: boolean
          low_stock_override: boolean
          low_stock_threshold: number
          model_code: string
          name: string
          noise_level: number
          pressure_rating: number
          price: number
          sku: string
          slug: string
          status: string
          stock_qty: number
          subcategory_id: string
          supplier_name: string
          technical_specs: Json
          updated_at: string
          warehouse_location: string
        }[]
      }
      get_search_suggestions: {
        Args: { p_limit?: number; p_q: string }
        Returns: {
          label: string
          metadata: Json
          type: string
          url: string
        }[]
      }
      get_user_role: { Args: { user_id: string }; Returns: string }
      increment_coupon_usage: { Args: { p_code: string }; Returns: undefined }
      increment_error_group_count: {
        Args: { p_group_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_staff_user: { Args: never; Returns: boolean }
      is_user_admin: { Args: { user_id: string }; Returns: boolean }
      jwt_role: { Args: never; Returns: string }
      process_order_stock_reduction: {
        Args: { p_order_id: string }
        Returns: Json
      }
      reverse_inventory_batch:
        | { Args: { p_batch_id: string }; Returns: undefined }
        | {
            Args: { p_batch_id: string; p_max_minutes?: number }
            Returns: number
          }
      set_stock:
        | {
            Args: { p_new_qty: number; p_product_id: string; p_reason: string }
            Returns: undefined
          }
        | {
            Args: {
              p_batch_id?: string
              p_new_qty: number
              p_product_id: string
              p_reason: string
            }
            Returns: undefined
          }
      set_user_admin_role: {
        Args: { new_role: string; user_id: string }
        Returns: boolean
      }
      set_user_role: {
        Args: { new_role: string; user_id: string }
        Returns: boolean
      }
      update_inventory_settings: {
        Args: { p_default_low_stock_threshold: number }
        Returns: undefined
      }
      update_inventory_thresholds: {
        Args: { p_default: number; p_reset_overrides?: boolean }
        Returns: undefined
      }
    }
    Enums: {
      contact_department: "sales" | "support" | "consulting"
      contact_status: "new" | "read" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      contact_department: ["sales", "support", "consulting"],
      contact_status: ["new", "read", "archived"],
    },
  },
} as const
