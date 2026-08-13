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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      _migration_ledger: {
        Row: {
          applied_at: string
          name: string
        }
        Insert: {
          applied_at?: string
          name: string
        }
        Update: {
          applied_at?: string
          name?: string
        }
        Relationships: []
      }
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string
          created_at: string | null
          id: string
          price_list_id: string | null
          product_id: string
          quantity: number
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "cart_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          authority_content: Json | null
          created_at: string
          description: string | null
          display_mode: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          level: number
          marketing_title: string | null
          menu_label: string | null
          metadata: Json | null
          name: string
          parent_id: string | null
          seo_desc: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
          tenant_id: string
          translation_key: string | null
          updated_at: string
        }
        Insert: {
          authority_content?: Json | null
          created_at?: string
          description?: string | null
          display_mode?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          level?: number
          marketing_title?: string | null
          menu_label?: string | null
          metadata?: Json | null
          name: string
          parent_id?: string | null
          seo_desc?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
          tenant_id?: string
          translation_key?: string | null
          updated_at?: string
        }
        Update: {
          authority_content?: Json | null
          created_at?: string
          description?: string | null
          display_mode?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          level?: number
          marketing_title?: string | null
          menu_label?: string | null
          metadata?: Json | null
          name?: string
          parent_id?: string | null
          seo_desc?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
          tenant_id?: string
          translation_key?: string | null
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
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      category_mapping_rules: {
        Row: {
          brand_filter: string | null
          created_at: string | null
          description: string | null
          exclude_pattern: string | null
          id: string
          name_pattern: string
          priority: number | null
          spec_conditions: Json | null
          target_subcategory_id: string | null
        }
        Insert: {
          brand_filter?: string | null
          created_at?: string | null
          description?: string | null
          exclude_pattern?: string | null
          id?: string
          name_pattern: string
          priority?: number | null
          spec_conditions?: Json | null
          target_subcategory_id?: string | null
        }
        Update: {
          brand_filter?: string | null
          created_at?: string | null
          description?: string | null
          exclude_pattern?: string | null
          id?: string
          name_pattern?: string
          priority?: number | null
          spec_conditions?: Json | null
          target_subcategory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_mapping_rules_target_subcategory_id_fkey"
            columns: ["target_subcategory_id"]
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "coupons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      currency_rates: {
        Row: {
          base_ccy: string
          effective_date: string
          fetched_at: string
          id: string
          quote_ccy: string
          rate: number
          source: string
          spread_pct: number
          tenant_id: string
        }
        Insert: {
          base_ccy?: string
          effective_date: string
          fetched_at?: string
          id?: string
          quote_ccy: string
          rate: number
          source: string
          spread_pct?: number
          tenant_id?: string
        }
        Update: {
          base_ccy?: string
          effective_date?: string
          fetched_at?: string
          id?: string
          quote_ccy?: string
          rate?: number
          source?: string
          spread_pct?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "currency_rates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "inventory_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
          updated_at: string
        }
        Insert: {
          alert_email?: string | null
          alert_webhook_url?: string | null
          default_low_stock_threshold?: number | null
          id?: boolean
          reservation_timeout_hours?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          alert_email?: string | null
          alert_webhook_url?: string | null
          default_low_stock_threshold?: number | null
          id?: boolean
          reservation_timeout_hours?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "order_attachments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          note: string
          order_id: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          note?: string
          order_id?: string
          tenant_id?: string
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
            foreignKeyName: "order_notes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      order_refund_events: {
        Row: {
          actor_user_id: string | null
          amount: number
          created_at: string
          id: string
          order_id: string
          reason: string | null
          tenant_id: string
        }
        Insert: {
          actor_user_id?: string | null
          amount: number
          created_at?: string
          id?: string
          order_id: string
          reason?: string | null
          tenant_id?: string
        }
        Update: {
          actor_user_id?: string | null
          amount?: number
          created_at?: string
          id?: string
          order_id?: string
          reason?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_refund_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "price_lists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rule: {
        Row: {
          base: string
          brand_id: string | null
          category_id: string | null
          charm_ending: number | null
          created_at: string
          currency: string | null
          fixed_price: number | null
          id: string
          is_exclusive: boolean
          margin_pct: number | null
          max_margin_abs: number | null
          method: string
          min_margin_abs: number | null
          min_quantity: number
          price_book_id: string | null
          price_is_vat_inclusive: boolean
          priority: number
          product_id: string | null
          round_to: number | null
          scope: number
          surcharge: number
          tenant_id: string
          updated_at: string
          updated_by: string | null
          valid_from: string | null
          valid_to: string | null
          vat_rate_pct: number
        }
        Insert: {
          base?: string
          brand_id?: string | null
          category_id?: string | null
          charm_ending?: number | null
          created_at?: string
          currency?: string | null
          fixed_price?: number | null
          id?: string
          is_exclusive?: boolean
          margin_pct?: number | null
          max_margin_abs?: number | null
          method: string
          min_margin_abs?: number | null
          min_quantity?: number
          price_book_id?: string | null
          price_is_vat_inclusive?: boolean
          priority?: number
          product_id?: string | null
          round_to?: number | null
          scope: number
          surcharge?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          valid_from?: string | null
          valid_to?: string | null
          vat_rate_pct?: number
        }
        Update: {
          base?: string
          brand_id?: string | null
          category_id?: string | null
          charm_ending?: number | null
          created_at?: string
          currency?: string | null
          fixed_price?: number | null
          id?: string
          is_exclusive?: boolean
          margin_pct?: number | null
          max_margin_abs?: number | null
          method?: string
          min_margin_abs?: number | null
          min_quantity?: number
          price_book_id?: string | null
          price_is_vat_inclusive?: boolean
          priority?: number
          product_id?: string | null
          round_to?: number | null
          scope?: number
          surcharge?: number
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          valid_from?: string | null
          valid_to?: string | null
          vat_rate_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rule_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rule_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rule_price_book_id_fkey"
            columns: ["price_book_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rule_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "pricing_rule_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "inventory_velocity"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "pricing_rule_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rule_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "product_authorities_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_families: {
        Row: {
          brand_id: string
          category_id: string | null
          created_at: string
          deleted_at: string | null
          description: Json
          id: string
          is_description_manual: boolean
          meta_description: Json | null
          meta_title: Json | null
          name: string
          series_code: string | null
          slug: string
          sort_order: number
          subcategory_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: Json
          id?: string
          is_description_manual?: boolean
          meta_description?: Json | null
          meta_title?: Json | null
          name: string
          series_code?: string | null
          slug: string
          sort_order?: number
          subcategory_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          category_id?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: Json
          id?: string
          is_description_manual?: boolean
          meta_description?: Json | null
          meta_title?: Json | null
          name?: string
          series_code?: string | null
          slug?: string
          sort_order?: number
          subcategory_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_families_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_families_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_families_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_families_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
        }
        Insert: {
          alt?: string | null
          created_at?: string
          id?: string
          path: string
          product_id: string
          sort_order?: number
          tenant_id?: string
        }
        Update: {
          alt?: string | null
          created_at?: string
          id?: string
          path?: string
          product_id?: string
          sort_order?: number
          tenant_id?: string
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
          {
            foreignKeyName: "product_images_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "product_prices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand: string
          category_id: string | null
          cost_in_base: number | null
          created_at: string
          deleted_at: string | null
          depth_mm: number | null
          description_i18n: Json | null
          family_id: string | null
          height_mm: number | null
          id: string
          is_featured: boolean
          is_taxable: boolean
          low_stock_override: boolean
          low_stock_threshold: number | null
          model_code: string | null
          name: string
          price: number | null
          purchase_currency: string
          purchase_price: number
          purchase_rate_to_base: number | null
          sku: string
          slug: string | null
          status: string
          stock_qty: number | null
          subcategory_id: string | null
          supplier_name: string | null
          tax_rate: number
          technical_specs: Json | null
          tenant_id: string
          updated_at: string
          warehouse_location: string | null
          weight_kg: number | null
          width_mm: number | null
        }
        Insert: {
          barcode?: string | null
          brand: string
          category_id?: string | null
          cost_in_base?: number | null
          created_at?: string
          deleted_at?: string | null
          depth_mm?: number | null
          description_i18n?: Json | null
          family_id?: string | null
          height_mm?: number | null
          id?: string
          is_featured?: boolean
          is_taxable?: boolean
          low_stock_override?: boolean
          low_stock_threshold?: number | null
          model_code?: string | null
          name: string
          price?: number | null
          purchase_currency?: string
          purchase_price?: number
          purchase_rate_to_base?: number | null
          sku: string
          slug?: string | null
          status?: string
          stock_qty?: number | null
          subcategory_id?: string | null
          supplier_name?: string | null
          tax_rate?: number
          technical_specs?: Json | null
          tenant_id?: string
          updated_at?: string
          warehouse_location?: string | null
          weight_kg?: number | null
          width_mm?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string
          category_id?: string | null
          cost_in_base?: number | null
          created_at?: string
          deleted_at?: string | null
          depth_mm?: number | null
          description_i18n?: Json | null
          family_id?: string | null
          height_mm?: number | null
          id?: string
          is_featured?: boolean
          is_taxable?: boolean
          low_stock_override?: boolean
          low_stock_threshold?: number | null
          model_code?: string | null
          name?: string
          price?: number | null
          purchase_currency?: string
          purchase_price?: number
          purchase_rate_to_base?: number | null
          sku?: string
          slug?: string | null
          status?: string
          stock_qty?: number | null
          subcategory_id?: string | null
          supplier_name?: string | null
          tax_rate?: number
          technical_specs?: Json | null
          tenant_id?: string
          updated_at?: string
          warehouse_location?: string | null
          weight_kg?: number | null
          width_mm?: number | null
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
            foreignKeyName: "products_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "product_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "shipping_email_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_webhook_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_carts: {
        Row: {
          created_at: string | null
          id: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_carts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
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
      tenants: {
        Row: {
          config: Json
          created_at: string
          custom_domain: string | null
          features: Json
          id: string
          is_active: boolean
          name: string
          styles: Json
          subdomain: string | null
          theme_config: Json
        }
        Insert: {
          config?: Json
          created_at?: string
          custom_domain?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          styles?: Json
          subdomain?: string | null
          theme_config?: Json
        }
        Update: {
          config?: Json
          created_at?: string
          custom_domain?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          styles?: Json
          subdomain?: string | null
          theme_config?: Json
        }
        Relationships: []
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_invoice_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
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
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          tenant_id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          tenant_id?: string
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
          {
            foreignKeyName: "user_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
          {
            foreignKeyName: "venthub_order_items_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          locale: string | null
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
          tenant_id: string
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
          locale?: string | null
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
          tenant_id?: string
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
          locale?: string | null
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
          tenant_id?: string
          total_amount?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venthub_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
            foreignKeyName: "venthub_returns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
          tenant_id: string
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
          tenant_id?: string
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
          tenant_id?: string
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
            foreignKeyName: "wizard_selections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      inventory_velocity: {
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
          locale: string | null
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
          tenant_id: string | null
          total_amount: number | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venthub_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
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
              p_batch_id: string
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
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
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
          locale: string | null
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
          tenant_id: string
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
          locale: string | null
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
          tenant_id: string
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
      fn_enrich_product_specs: { Args: never; Returns: undefined }
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
      get_category_counts: {
        Args: never
        Returns: {
          category_id: string
          product_count: number
        }[]
      }
      get_family_detail: {
        Args: { p_lang?: string; p_slug: string }
        Returns: Json
      }
      get_product_families_enriched: {
        Args: {
          p_brand?: string
          p_category_ids?: string[]
          p_limit?: number
          p_offset?: number
          p_search_query?: string
        }
        Returns: {
          brand_name: string
          category_id: string
          cover_image_path: string
          description: Json
          id: string
          min_price: number
          name: string
          series_code: string
          slug: string
          subcategory_id: string
          total_count: number
          variant_count: number
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
      jwt_tenant_id: { Args: never; Returns: string }
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
              p_batch_id: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      contact_department: ["sales", "support", "consulting"],
      contact_status: ["new", "read", "archived"],
    },
  },
} as const
