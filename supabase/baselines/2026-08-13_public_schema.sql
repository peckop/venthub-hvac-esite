--
-- VentHub prod public schema snapshot — 2026-08-13
-- Kaynak: canli DB (Supabase MCP execute_sql; information_schema + pg_catalog)
-- Kapsam: enum'lar, tablolar (kolon+default+nullability), view'lar, fonksiyonlar.
-- NOT: pg_dump degildir — PK/FK/index/trigger/RLS politikalari DAHIL DEGIL;
-- orion doc schema uretimi icin kolon+fonksiyon gercekligi yeterlidir.
-- F5-B D4 SONRASI: products'ta legacy kolonlar (description, image_url, airflow_capacity,
-- noise_level, pressure_rating, meta_title, meta_description, is_category_manual) YOK.
--

--
-- Name: contact_department; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contact_department AS ENUM (
    'sales',
    'support',
    'consulting'
);

--
-- Name: contact_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contact_status AS ENUM (
    'new',
    'read',
    'archived'
);

--
-- Name: _migration_ledger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._migration_ledger (
    name text NOT NULL,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: admin_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    actor uuid DEFAULT auth.uid(),
    table_name text NOT NULL,
    row_pk text,
    action text NOT NULL,
    before jsonb,
    after jsonb,
    comment text,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: brands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT jwt_tenant_id() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    price_list_id uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    parent_id uuid,
    level integer DEFAULT 0 NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text,
    seo_title text,
    seo_desc text,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    authority_content jsonb,
    menu_label text,
    marketing_title text,
    translation_key text,
    display_mode text DEFAULT 'series'::text,
    tenant_id uuid DEFAULT jwt_tenant_id() NOT NULL
);

--
-- Name: category_mapping_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category_mapping_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    priority integer DEFAULT 0,
    brand_filter text,
    name_pattern text NOT NULL,
    exclude_pattern text,
    spec_conditions jsonb,
    target_subcategory_id uuid,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

--
-- Name: client_errors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_errors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    at timestamp with time zone DEFAULT now() NOT NULL,
    url text,
    message text NOT NULL,
    stack text,
    user_agent text,
    release text,
    env text,
    level text DEFAULT 'error'::text NOT NULL,
    extra jsonb,
    group_id uuid
);

--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    company text,
    subject text NOT NULL,
    message text NOT NULL,
    department contact_department DEFAULT 'sales'::contact_department NOT NULL,
    status contact_status DEFAULT 'new'::contact_status NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    ip_address text
);

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT extensions.gen_random_uuid() NOT NULL,
    code text NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value numeric NOT NULL,
    minimum_order_amount numeric DEFAULT 0,
    usage_limit integer,
    used_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: error_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    signature text NOT NULL,
    level text DEFAULT 'error'::text NOT NULL,
    last_message text,
    url_sample text,
    env text,
    release text,
    first_seen timestamp with time zone DEFAULT now() NOT NULL,
    last_seen timestamp with time zone DEFAULT now() NOT NULL,
    count bigint DEFAULT 1 NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    assigned_to uuid,
    notes text
);

--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    order_id uuid,
    delta integer NOT NULL,
    reason text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    batch_id uuid,
    original_movement_id uuid,
    reversed_by_movement_id uuid,
    undo_by_user_id uuid,
    undo_at timestamp with time zone,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: inventory_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_settings (
    id boolean DEFAULT true NOT NULL,
    default_low_stock_threshold integer DEFAULT 5,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    alert_email text,
    alert_webhook_url text,
    reservation_timeout_hours integer DEFAULT 24,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: order_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_attachments (
    id uuid DEFAULT extensions.gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size bigint,
    mime_type text,
    description text,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: order_email_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_email_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    email_to text NOT NULL,
    subject text NOT NULL,
    provider text DEFAULT 'resend'::text NOT NULL,
    provider_message_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: order_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_notes (
    id uuid DEFAULT extensions.gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    user_id uuid DEFAULT auth.uid(),
    note text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: order_refund_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_refund_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    amount numeric NOT NULL,
    reason text,
    actor_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    tier_level integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

--
-- Name: payment_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    transaction_id text NOT NULL,
    order_id uuid,
    user_id uuid NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'TRY'::text NOT NULL,
    status text NOT NULL,
    payment_method text NOT NULL,
    provider_response jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: price_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    user_type character varying(50) DEFAULT 'individual'::character varying,
    is_active boolean DEFAULT true,
    effective_from timestamp with time zone DEFAULT now(),
    effective_to timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: product_authorities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_authorities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    expert_name text NOT NULL,
    expert_title text,
    expert_avatar_url text,
    content text NOT NULL,
    badge_text text,
    rating integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT jwt_tenant_id() NOT NULL
);

--
-- Name: product_families; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_families (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid DEFAULT jwt_tenant_id() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    brand_id uuid NOT NULL,
    description jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_description_manual boolean DEFAULT false NOT NULL,
    category_id uuid,
    subcategory_id uuid,
    meta_title jsonb,
    meta_description jsonb,
    series_code text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);

--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    path text NOT NULL,
    alt text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT jwt_tenant_id() NOT NULL
);

--
-- Name: product_prices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_prices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    price_list_id uuid NOT NULL,
    base_price numeric NOT NULL,
    sale_price numeric,
    discount_percentage numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    valid_from timestamp with time zone DEFAULT now(),
    valid_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    brand text NOT NULL,
    price numeric DEFAULT 0.00,
    sku text NOT NULL,
    category_id uuid,
    subcategory_id uuid,
    status text DEFAULT 'draft'::text NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    technical_specs jsonb,
    stock_qty integer DEFAULT 0,
    low_stock_threshold integer DEFAULT 10,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    low_stock_override boolean DEFAULT false NOT NULL,
    purchase_price numeric DEFAULT 0 NOT NULL,
    slug text,
    model_code text,
    warehouse_location text,
    supplier_name text,
    family_id uuid,
    tenant_id uuid DEFAULT jwt_tenant_id() NOT NULL,
    purchase_currency character varying(3) DEFAULT 'TRY'::character varying NOT NULL,
    barcode text,
    tax_rate numeric DEFAULT 20.00 NOT NULL,
    is_taxable boolean DEFAULT true NOT NULL,
    weight_kg numeric,
    width_mm numeric,
    height_mm numeric,
    depth_mm numeric,
    deleted_at timestamp with time zone,
    description_i18n jsonb
);

--
-- Name: project_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

--
-- Name: rate_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rate_limits (
    key text NOT NULL,
    bucket timestamp with time zone NOT NULL,
    count integer DEFAULT 0 NOT NULL
);

--
-- Name: returns_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.returns_webhook_events (
    id bigint DEFAULT nextval('returns_webhook_events_id_seq'::regclass) NOT NULL,
    event_id text NOT NULL,
    return_id uuid,
    order_id uuid,
    carrier text,
    tracking_number text,
    status_raw text,
    status_mapped text,
    body_hash text NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: shipping_email_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_email_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    email_to text NOT NULL,
    subject text NOT NULL,
    provider text DEFAULT 'resend'::text NOT NULL,
    provider_message_id text,
    carrier text,
    tracking_number text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: shipping_idempotency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_idempotency (
    key text NOT NULL,
    scope text DEFAULT 'admin-update-shipping'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: shipping_webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shipping_webhook_events (
    id bigint DEFAULT nextval('shipping_webhook_events_id_seq'::regclass) NOT NULL,
    event_id text NOT NULL,
    order_id uuid,
    order_number text,
    carrier text,
    status_raw text,
    status_mapped text,
    body_hash text NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: shopping_carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shopping_carts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value jsonb DEFAULT '{}'::jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid
);

--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subdomain text,
    custom_domain text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    features jsonb DEFAULT '{}'::jsonb NOT NULL,
    styles jsonb DEFAULT '{}'::jsonb NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    theme_config jsonb DEFAULT '{}'::jsonb NOT NULL
);

--
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    address_line text NOT NULL,
    district text NOT NULL,
    city text NOT NULL,
    postal_code text,
    country text DEFAULT 'Turkey'::text NOT NULL,
    address_type text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_default_shipping boolean DEFAULT false,
    is_default_billing boolean DEFAULT false,
    label text,
    full_name text,
    phone text,
    full_address text,
    street_address text,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: user_invoice_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_invoice_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    profile_type text NOT NULL,
    company_name text,
    tax_number text,
    tax_office text,
    first_name text,
    last_name text,
    address_line text NOT NULL,
    district text NOT NULL,
    city text NOT NULL,
    postal_code text,
    country text DEFAULT 'Turkey'::text NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    id uuid NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    full_name text,
    phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    organization_id uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: user_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

--
-- Name: venthub_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venthub_order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    product_name text NOT NULL,
    product_sku text,
    product_brand text,
    unit_price numeric NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    total_price numeric NOT NULL,
    product_snapshot jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    price_at_time numeric,
    product_image_url text,
    unit_price_snapshot numeric,
    price_list_id_snapshot uuid,
    product_name_snapshot text,
    product_sku_snapshot text,
    tax_rate_snapshot numeric,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: venthub_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venthub_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    user_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    total_amount numeric DEFAULT 0.00 NOT NULL,
    shipping_method text DEFAULT 'standard'::text,
    shipping_address jsonb NOT NULL,
    billing_address jsonb NOT NULL,
    invoice_profile jsonb,
    payment_method text,
    payment_status text DEFAULT 'pending'::text,
    conversation_id text,
    shipping_carrier text,
    shipping_tracking_number text,
    shipped_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    customer_name text,
    customer_email text,
    carrier text,
    tracking_url text,
    subtotal_snapshot numeric,
    legal_consents jsonb,
    invoice_type text,
    invoice_info jsonb,
    payment_token text,
    customer_phone text,
    tracking_number text,
    payment_debug jsonb,
    coupon_code text,
    coupon_discount numeric DEFAULT 0,
    locale text DEFAULT 'tr'::text,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: venthub_returns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.venthub_returns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    order_id uuid NOT NULL,
    status text DEFAULT 'requested'::text NOT NULL,
    reason text NOT NULL,
    description text,
    refund_amount numeric,
    admin_notes text,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_at timestamp with time zone,
    processed_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: wizard_selections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wizard_selections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_id text NOT NULL,
    door_width_cm integer NOT NULL,
    door_height_cm integer NOT NULL,
    usage_location text,
    sector text,
    wind_condition text,
    traffic_intensity text,
    heating_needed text,
    climate_zone text,
    calculated_airflow_m3h integer,
    calculated_nozzle_velocity numeric,
    calculated_power_w integer,
    recommended_series text,
    recommended_product_ids uuid[],
    selected_product_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    ip_address inet,
    user_agent text,
    order_id uuid,
    tenant_id uuid DEFAULT 'd3b07384-d113-495f-a558-8c38634e0000'::uuid NOT NULL
);

--
-- Name: view_admin_orders; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.view_admin_orders AS
 SELECT o.id,
    o.order_number,
    o.user_id,
    o.status,
    o.total_amount,
    o.shipping_method,
    o.shipping_address,
    o.billing_address,
    o.invoice_profile,
    o.payment_method,
    o.payment_status,
    o.conversation_id,
    o.shipping_carrier,
    o.shipping_tracking_number,
    o.shipped_at,
    o.delivered_at,
    o.created_at,
    o.updated_at,
    o.customer_name,
    o.customer_email,
    o.carrier,
    o.tracking_url,
    o.subtotal_snapshot,
    o.legal_consents,
    o.invoice_type,
    o.invoice_info,
    o.payment_token,
    o.customer_phone,
    o.tracking_number,
    o.payment_debug,
    o.coupon_code,
    o.coupon_discount,
    o.locale,
    o.tenant_id,
    (o.id)::text AS id_text,
    o.conversation_id AS conversation_id_text,
    ((((((((((((((((((COALESCE((o.id)::text, ''::text) || ' '::text) || COALESCE(o.conversation_id, ''::text)) || ' '::text) || COALESCE(o.order_number, ''::text)) || ' '::text) || COALESCE(o.customer_email, ''::text)) || ' '::text) || COALESCE(o.customer_name, ''::text)) || ' '::text) || COALESCE(o.customer_phone, ''::text)) || ' '::text) || COALESCE((o.invoice_info)::text, ''::text)) || ' '::text) || COALESCE((o.billing_address)::text, ''::text)) || ' '::text) || COALESCE((o.shipping_address)::text, ''::text)) || ' '::text) || COALESCE(p.full_name, ''::text)) AS search_text
   FROM (venthub_orders o
     LEFT JOIN user_profiles p ON ((o.user_id = p.id)));

--
-- Name: admin_users; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.admin_users AS
 SELECT u.id,
    u.email,
    up.full_name,
    up.phone,
    up.role,
    up.created_at,
    up.updated_at
   FROM (auth.users u
     LEFT JOIN user_profiles up ON ((u.id = up.id)))
  WHERE ((up.role)::text = ANY ((ARRAY['admin'::character varying, 'moderator'::character varying])::text[]))
  ORDER BY up.created_at DESC;

--
-- Name: reserved_orders; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.reserved_orders AS
 SELECT voi.product_id,
    o.id AS order_id,
    o.created_at,
    o.status,
    o.payment_status,
    voi.quantity
   FROM (venthub_order_items voi
     JOIN venthub_orders o ON ((o.id = voi.order_id)))
  WHERE ((o.status = ANY (ARRAY['confirmed'::text, 'paid'::text, 'processing'::text])) AND (o.shipped_at IS NULL));

--
-- Name: inventory_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_summary AS
 WITH movement_stats AS (
         SELECT inventory_movements.product_id,
            COALESCE(sum(abs(inventory_movements.delta)), (0)::bigint) AS total_out_30d
           FROM inventory_movements
          WHERE ((inventory_movements.delta < 0) AND ((inventory_movements.reason = 'sale'::text) OR (inventory_movements.reason = 'manual_out'::text)) AND (inventory_movements.created_at >= (now() - '30 days'::interval)))
          GROUP BY inventory_movements.product_id
        )
 SELECT p.id AS product_id,
    p.stock_qty,
    COALESCE(m.total_out_30d, (0)::bigint) AS total_out_30d,
    round(((COALESCE(m.total_out_30d, (0)::bigint))::numeric / 30.0), 2) AS daily_velocity,
        CASE
            WHEN (COALESCE(m.total_out_30d, (0)::bigint) = 0) THEN (9999)::numeric
            ELSE round(((p.stock_qty)::numeric / ((COALESCE(m.total_out_30d, (0)::bigint))::numeric / 30.0)))
        END AS days_until_empty,
    (COALESCE(p.purchase_price, (0)::numeric) * (p.stock_qty)::numeric) AS capital_tied_up,
        CASE
            WHEN (COALESCE(m.total_out_30d, (0)::bigint) >= 10) THEN 'A'::text
            WHEN (COALESCE(m.total_out_30d, (0)::bigint) >= 3) THEN 'B'::text
            ELSE 'C'::text
        END AS abc_class
   FROM (products p
     LEFT JOIN movement_stats m ON ((p.id = m.product_id)));

--
-- Name: inventory_velocity; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_velocity AS
 WITH reserved AS (
         SELECT voi.product_id,
            (sum(voi.quantity))::integer AS reserved_qty
           FROM (venthub_order_items voi
             JOIN venthub_orders o ON ((o.id = voi.order_id)))
          WHERE ((o.status = ANY (ARRAY['confirmed'::text, 'paid'::text, 'processing'::text])) AND (o.shipped_at IS NULL))
          GROUP BY voi.product_id
        )
 SELECT p.id AS product_id,
    p.name,
    COALESCE(p.stock_qty, 0) AS physical_stock,
    COALESCE(r.reserved_qty, 0) AS reserved_stock,
    (COALESCE(p.stock_qty, 0) - COALESCE(r.reserved_qty, 0)) AS available_stock,
    p.warehouse_location,
    p.supplier_name
   FROM (products p
     LEFT JOIN reserved r ON ((r.product_id = p.id)));

--
-- Name: _normalize_rls_expr(expr text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public._normalize_rls_expr(expr text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  s text;
BEGIN
  IF expr IS NULL THEN RETURN NULL; END IF;
  s := expr;

  -- unwrap existing wrappers
  s := replace(s, '(select auth.uid())', 'auth.uid()');
  s := replace(s, '(SELECT auth.uid())', 'auth.uid()');
  s := replace(s, '(select auth.role())', 'auth.role()');
  s := replace(s, '(SELECT auth.role())', 'auth.role()');
  s := replace(s, '(select auth.jwt())', 'auth.jwt()');
  s := replace(s, '(SELECT auth.jwt())', 'auth.jwt()');
  s := replace(s, '(select public.jwt_role())', 'public.jwt_role()');
  s := replace(s, '(SELECT public.jwt_role())', 'public.jwt_role()');
  s := replace(s, '(select current_setting(''request.jwt.claims''))', 'current_setting(''request.jwt.claims'')');
  s := replace(s, '(SELECT current_setting(''request.jwt.claims''))', 'current_setting(''request.jwt.claims'')');

  -- normalize current_setting variants
  s := replace(s, 'current_setting(''request.jwt.claims''::text, true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text,true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text, FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims''::text,FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'', true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'',true)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'', FALSE)', 'current_setting(''request.jwt.claims'')');
  s := replace(s, 'current_setting(''request.jwt.claims'',FALSE)', 'current_setting(''request.jwt.claims'')');

  -- re-wrap
  s := replace(s, 'auth.uid()', '(select auth.uid())');
  s := replace(s, 'auth.role()', '(select auth.role())');
  s := replace(s, 'auth.jwt()', '(select auth.jwt())');
  s := replace(s, 'public.jwt_role()', '(select public.jwt_role())');
  s := replace(s, 'current_setting(''request.jwt.claims'')', '(select current_setting(''request.jwt.claims''))');

  RETURN s;
END
$function$
;

--
-- Name: adjust_stock(p_product_id uuid, p_delta integer, p_reason text, p_batch_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text, p_batch_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog, public'
AS $function$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id)
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'), p_batch_id);
END;
$function$
;

--
-- Name: adjust_stock(p_product_id uuid, p_delta integer, p_reason text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.adjust_stock(p_product_id uuid, p_delta integer, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog, public'
AS $function$
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) + p_delta)
  WHERE id = p_product_id;
  
  INSERT INTO public.inventory_movements (product_id, delta, reason) 
  VALUES (p_product_id, p_delta, COALESCE(p_reason, 'adjust'));
END;
$function$
;

--
-- Name: adjust_stock_v2(p_product_id uuid, p_delta integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.adjust_stock_v2(p_product_id uuid, p_delta integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
BEGIN
    UPDATE public.products
    SET stock_qty = COALESCE(stock_qty, 0) + p_delta,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$function$
;

--
-- Name: admin_list_all_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.admin_list_all_users()
 RETURNS TABLE(id uuid, email text, full_name text, phone text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Authorization: allow admins/moderators/super_admin/super_admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','moderator','super_admin','super_admin')
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id,
         (u.email)::text        AS email,
         (up.full_name)::text   AS full_name,
         (up.phone)::text       AS phone,
         COALESCE((up.role)::text, 'user') AS role,
         COALESCE(up.created_at, u.created_at) AS created_at,
         COALESCE(up.updated_at, u.updated_at) AS updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  ORDER BY COALESCE(up.created_at, u.created_at) DESC;
END;
$function$
;

--
-- Name: admin_list_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.admin_list_users()
 RETURNS TABLE(id uuid, email text, full_name text, phone text, role text, created_at timestamp with time zone, updated_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Authorization: allow admins/moderators/super_admin only
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role IN ('admin','moderator','super_admin')
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  SELECT u.id,
         (u.email)::text        AS email,
         (up.full_name)::text   AS full_name,
         (up.phone)::text       AS phone,
         (up.role)::text        AS role,
         up.created_at,
         up.updated_at
  FROM auth.users u
  LEFT JOIN public.user_profiles up ON up.id = u.id
  WHERE up.role IN ('admin','moderator','super_admin')
  ORDER BY up.created_at DESC;
END;
$function$
;

--
-- Name: admin_search_products(p_q text, p_limit integer, p_offset integer, p_category_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.admin_search_products(p_q text, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0, p_category_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(id uuid, name text, sku text, model_code text, brand text, status text, category_id uuid, price numeric, purchase_price numeric, stock_qty integer, low_stock_threshold integer, is_featured boolean, slug text, rank real, total_count bigint)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_limit int;
  v_offset int;
  v_tsq tsquery;
  v_raw text;
  v_raw_wildcard text;
BEGIN
  v_limit  := LEAST(GREATEST(p_limit, 1), 200);
  v_offset := GREATEST(p_offset, 0);
  v_raw    := coalesce(trim(p_q), '');
  v_raw_wildcard := replace(v_raw, ' ', '%');

  -- Empty query → return empty (caller should use normal Supabase query)
  IF v_raw = '' THEN
    RETURN;
  END IF;

  v_tsq := plainto_tsquery('turkish', v_raw);

  RETURN QUERY
  WITH matched AS (
    SELECT
      p.id, p.name, p.sku, p.model_code, p.brand,
      p.status, p.category_id, p.price, p.purchase_price,
      p.stock_qty, p.low_stock_threshold, p.is_featured, p.slug,
      ts_rank(
        to_tsvector('turkish',
          coalesce(p.name,'') || ' ' ||
          coalesce(p.model_code,'') || ' ' ||
          coalesce(p.sku,'') || ' ' ||
          coalesce(p.brand,'') || ' ' ||
          coalesce(p.description_i18n->>'tr','') || ' ' ||
          coalesce(p.technical_specs::text,'')
        ),
        v_tsq
      ) AS rank
    FROM public.products p
    WHERE (
      p.name ILIKE '%' || v_raw_wildcard || '%'
      OR p.model_code ILIKE '%' || v_raw_wildcard || '%'
      OR p.sku ILIKE '%' || v_raw_wildcard || '%'
      OR p.brand ILIKE '%' || v_raw_wildcard || '%'
      OR p.slug ILIKE '%' || v_raw_wildcard || '%'
      OR p.technical_specs::text ILIKE '%' || v_raw || '%'
      OR to_tsvector('turkish',
           coalesce(p.name,'') || ' ' ||
           coalesce(p.model_code,'') || ' ' ||
           coalesce(p.sku,'') || ' ' ||
           coalesce(p.brand,'') || ' ' ||
           coalesce(p.description_i18n->>'tr','') || ' ' ||
           coalesce(p.technical_specs::text,'')
         ) @@ v_tsq
    )
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
  )
  SELECT
    m.id, m.name, m.sku, m.model_code, m.brand,
    m.status, m.category_id, m.price, m.purchase_price,
    m.stock_qty, m.low_stock_threshold, m.is_featured, m.slug,
    m.rank,
    count(*) OVER() AS total_count
  FROM matched m
  ORDER BY m.rank DESC NULLS LAST, m.name ASC
  LIMIT v_limit
  OFFSET v_offset;
END;
$function$
;

--
-- Name: bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.bump_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
 RETURNS TABLE(allowed boolean, remaining integer, reset_at timestamp with time zone)
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  now_ts timestamptz := now();
  bucket_ts timestamptz := date_trunc('minute', now_ts);
  window_start timestamptz := now_ts - make_interval(secs => p_window_seconds);
  total int := 0;
  resets_at timestamptz := bucket_ts + interval '1 minute';
BEGIN
  -- upsert current bucket
  INSERT INTO public.rate_limits(key, bucket, count)
  VALUES (p_key, bucket_ts, 1)
  ON CONFLICT (key, bucket) DO UPDATE SET count = public.rate_limits.count + 1;

  -- sum counts within window
  SELECT COALESCE(sum(count), 0) INTO total
  FROM public.rate_limits
  WHERE key = p_key AND bucket >= date_trunc('minute', window_start);

  IF total <= p_limit THEN
    RETURN QUERY SELECT true AS allowed, greatest(p_limit - total, 0) AS remaining, resets_at AS reset_at;
  ELSE
    RETURN QUERY SELECT false AS allowed, 0 AS remaining, resets_at AS reset_at;
  END IF;
END $function$
;

--
-- Name: custom_access_token_hook(event jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  claims jsonb;
  user_role text;
  tenant_id_val text;
BEGIN
  -- Retrieve the user's role and tenant_id from the database user_profiles table
  SELECT role, tenant_id::text INTO user_role, tenant_id_val
  FROM public.user_profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Ensure app_metadata is not null
  IF (claims->'app_metadata') IS NULL THEN
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  END IF;

  -- Inject the role into JWT claims as user_role
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(user_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', '"user"'::jsonb);
    claims := jsonb_set(claims, '{app_metadata, user_role}', '"user"'::jsonb);
  END IF;

  -- Inject tenant_id into JWT claims as tenant_id (both root and app_metadata)
  IF tenant_id_val IS NOT NULL THEN
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(tenant_id_val));
    claims := jsonb_set(claims, '{app_metadata, tenant_id}', to_jsonb(tenant_id_val));
  ELSE
    claims := jsonb_set(claims, '{tenant_id}', '"d3b07384-d113-495f-a558-8c38634e0000"'::jsonb);
    claims := jsonb_set(claims, '{app_metadata, tenant_id}', '"d3b07384-d113-495f-a558-8c38634e0000"'::jsonb);
  END IF;

  -- Put the modified claims back in the event
  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$function$
;

--
-- Name: enforce_role_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.enforce_role_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
begin
  -- Aktör kendi rolünü değiştiriyorsa yalnız super_admin'e izin ver
  if new.id = auth.uid() then
    if not exists (select 1 from public.user_profiles where id = auth.uid() and role = 'super_admin') then
      raise exception 'not authorized to change own role';
    end if;
  end if;
  -- Hedef rol whitelist'i = user_profiles_role_check constraint listesi
  if new.role not in ('user','moderator','admin','super_admin','warehouse','sales','viewer') then
    raise exception 'invalid role %', new.role;
  end if;
  return new;
end;
$function$
;

--
-- Name: fn_admin_get_orders(p_id text, p_conv text, p_status text, p_limit integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.fn_admin_get_orders(p_id text DEFAULT NULL::text, p_conv text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_limit integer DEFAULT 10)
 RETURNS SETOF venthub_orders
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select *
  from venthub_orders
  where (p_id is null or id = p_id::uuid)
    and (p_conv is null or conversation_id = p_conv)
    and (p_status is null or status = p_status)
  order by created_at desc
  limit coalesce(p_limit, 10);
$function$
;

--
-- Name: fn_admin_update_order_status(p_id text, p_status text, p_conv text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.fn_admin_update_order_status(p_id text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_conv text DEFAULT NULL::text)
 RETURNS venthub_orders
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_row venthub_orders;
begin
  update venthub_orders
     set status = p_status
   where (p_id is not null and id = p_id::uuid)
      or (p_id is null and p_conv is not null and conversation_id = p_conv)
  returning * into v_row;

  return v_row;
end;
$function$
;

--
-- Name: fn_enrich_product_specs(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.fn_enrich_product_specs()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    -- 1. Çap Ayıklama (100, 120, 150, 90)
    UPDATE public.products 
    SET technical_specs = jsonb_set(COALESCE(technical_specs, '{}'::jsonb), '{connection_diameter}', 
        CASE 
            WHEN name ~ '90' THEN '"90 mm"'
            WHEN name ~ '100' THEN '"100 mm"'
            WHEN name ~ '120' THEN '"120 mm"'
            WHEN name ~ '150' THEN '"150 mm"'
            WHEN name ~ '230' THEN '"230 mm"'
            WHEN name ~ '300' THEN '"300 mm"'
            ELSE '"Standart"'
        END::jsonb);

    -- 2. Motor Ömrü (LL)
    UPDATE public.products 
    SET technical_specs = jsonb_set(technical_specs, '{motor_life}', '"Long Life (Ball Bearing)"'::jsonb)
    WHERE name ILIKE '%LL%';

    -- 3. Fonksiyon (Timer / Tımer)
    UPDATE public.products 
    SET technical_specs = jsonb_set(technical_specs, '{features}', '["Zaman Ayarlı (Timer)"]'::jsonb)
    WHERE name ILIKE '%Timer%' OR name ILIKE '%Tımer%';

    -- 4. Tasarım Tipi
    UPDATE public.products 
    SET technical_specs = jsonb_set(technical_specs, '{design_type}', 
        CASE 
            WHEN name ILIKE '%FLEXO%' THEN '"Esnek Montaj (Slim Body)"'
            WHEN name ILIKE '%FILO%' THEN '"Hemzemin (Ultra Slim Front)"'
            WHEN name ILIKE '%GHOST%' THEN '"Gizli Montaj (In-line)"'
            ELSE '"Standart Tasarım"'
        END::jsonb);
END;
$function$
;

--
-- Name: fts_search_products(p_q text, p_limit integer, p_filters jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.fts_search_products(p_q text, p_limit integer DEFAULT 20, p_filters jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(id uuid, name text, sku text, brand text, price numeric, rank real)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_limit int;
  v_tsq tsquery;
  v_raw text;
  v_raw_wildcard text;
BEGIN
  v_limit := LEAST(GREATEST(p_limit, 1), 100);
  v_raw := coalesce(p_q, '');
  v_raw_wildcard := replace(v_raw, ' ', '%');
  v_tsq := plainto_tsquery('turkish', v_raw);

  RETURN QUERY
  SELECT p.id, p.name, p.sku, p.brand, p.price,
         ts_rank(
           to_tsvector('turkish',
             coalesce(p.name,'') || ' ' ||
             coalesce(p.model_code,'') || ' ' ||
             coalesce(p.sku,'') || ' ' ||
             coalesce(p.brand,'') || ' ' ||
             coalesce(p.description_i18n->>'tr','') || ' ' ||
             coalesce(p.technical_specs::text,'')
           ),
           v_tsq
         ) AS rank
  FROM public.products p
  WHERE (
    p.name ILIKE '%' || v_raw_wildcard || '%'
    OR p.model_code ILIKE '%' || v_raw_wildcard || '%'
    OR p.sku ILIKE '%' || v_raw_wildcard || '%'
    OR p.brand ILIKE '%' || v_raw_wildcard || '%'
    OR (p.description_i18n->>'tr') ILIKE '%' || v_raw_wildcard || '%'
    OR p.technical_specs::text ILIKE '%' || v_raw || '%'
    OR to_tsvector('turkish',
         coalesce(p.name,'') || ' ' ||
         coalesce(p.model_code,'') || ' ' ||
         coalesce(p.sku,'') || ' ' ||
         coalesce(p.brand,'') || ' ' ||
         coalesce(p.description_i18n->>'tr','') || ' ' ||
         coalesce(p.technical_specs::text,'')
       ) @@ v_tsq
  )
  AND (
    (NOT (p_filters ? 'category_id')) OR (p.category_id = (p_filters->>'category_id')::uuid)
  )
  AND p.status = 'active'
  ORDER BY rank DESC NULLS LAST, p.name ASC
  LIMIT v_limit;
END;
$function$
;

--
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS character varying
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    order_num VARCHAR(50);
BEGIN
    -- Format: VH-YYYYMMDD-NNNN
    order_num := 'VH-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                 LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 10000)::TEXT, 4, '0');
    RETURN order_num;
END;
$function$
;

--
-- Name: get_admin_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_admin_users()
 RETURNS TABLE(id uuid, email character varying, created_at timestamp with time zone, role text, full_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  -- Admin kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin','super_admin','super_admin')
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Admin ise kullanıcıları döndür
  RETURN QUERY
  SELECT u.id, u.email, u.created_at, p.role, p.full_name
  FROM auth.users u
  LEFT JOIN user_profiles p ON u.id = p.id;
END;
$function$
;

--
-- Name: get_category_counts(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_category_counts()
 RETURNS TABLE(category_id uuid, product_count integer)
 LANGUAGE sql
 STABLE
 SET search_path TO ''
AS $function$
  SELECT c.id AS category_id,
         COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active')::int AS product_count
  FROM public.categories c
  LEFT JOIN public.products p
    ON p.category_id = c.id
       OR p.subcategory_id = c.id
       OR p.category_id IN (SELECT ch.id FROM public.categories ch WHERE ch.parent_id = c.id)
       OR p.subcategory_id IN (SELECT ch.id FROM public.categories ch WHERE ch.parent_id = c.id)
  GROUP BY c.id;
$function$
;

--
-- Name: get_family_detail(p_slug text, p_lang text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_family_detail(p_slug text, p_lang text DEFAULT 'tr'::text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with lang as (
    select case when p_lang in ('tr', 'en') then p_lang else 'tr' end as v
  )
  select jsonb_build_object(
    'family', jsonb_build_object(
      'id', f.id,
      'name', f.name,
      'slug', f.slug,
      'series_code', f.series_code,
      'description', f.description,
      'brand_name', b.name,
      'category_id', f.category_id,
      'subcategory_id', f.subcategory_id,
      'meta_title', f.meta_title,
      'meta_description', f.meta_description
    ),
    'variants', (
      select coalesce(jsonb_agg(v.item order by v.sku), '[]'::jsonb)
        from (
          select p.sku,
                 jsonb_build_object(
                   'id', p.id,
                   'sku', p.sku,
                   'name', p.name,
                   'slug', p.slug,
                   'model_code', p.model_code,
                   'price', p.price,
                   'stock_qty', p.stock_qty,
                   'technical_specs', p.technical_specs,
                   -- Genel açıklama: varyantın kendi dili yoksa aile açıklamasına düşer
                   'description', coalesce(
                     p.description_i18n ->> (select v from lang),
                     f.description ->> (select v from lang)
                   ),
                   'images', (
                     select coalesce(
                       jsonb_agg(jsonb_build_object(
                         'path', pi.path, 'alt', pi.alt, 'sort_order', pi.sort_order
                       ) order by pi.sort_order),
                       '[]'::jsonb
                     )
                     from product_images pi
                     where pi.product_id = p.id
                   )
                 ) as item
            from products p
           where p.family_id = f.id
             and p.status = 'active' and p.deleted_at is null
        ) v
    )
  )
    from product_families f
    join brands b on b.id = f.brand_id
   where f.slug = p_slug and f.deleted_at is null
   limit 1  -- UNIQUE (tenant_id, slug) — global tekil değil (B15)
$function$
;

--
-- Name: get_product_families_enriched(p_category_ids uuid[], p_limit integer, p_offset integer, p_search_query text, p_brand text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_product_families_enriched(p_category_ids uuid[] DEFAULT NULL::uuid[], p_limit integer DEFAULT 24, p_offset integer DEFAULT 0, p_search_query text DEFAULT NULL::text, p_brand text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, name text, slug text, series_code text, description jsonb, brand_name text, category_id uuid, subcategory_id uuid, cover_image_path text, variant_count bigint, min_price numeric, total_count bigint)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  with fam as (
    select f.id, f.name, f.slug, f.series_code, f.description,
           b.name as brand_name, f.category_id, f.subcategory_id, f.sort_order,
           count(p.id) as variant_count,
           min(p.price) as min_price
      from product_families f
      join brands b on b.id = f.brand_id
      -- inner join: aktif varyantı olmayan aile listeye hiç girmez
      join products p on p.family_id = f.id
       and p.status = 'active' and p.deleted_at is null
     where f.deleted_at is null
       and (p_category_ids is null
            or f.category_id = any(p_category_ids)
            or f.subcategory_id = any(p_category_ids))
       and (p_brand is null or b.name ilike p_brand)
       and (p_search_query is null
            or f.name ilike '%' || p_search_query || '%'
            or f.series_code ilike '%' || p_search_query || '%'
            or p.sku ilike '%' || p_search_query || '%'
            or p.name ilike '%' || p_search_query || '%'
            or p.model_code ilike '%' || p_search_query || '%')
     group by f.id, f.name, f.slug, f.series_code, f.description,
              b.name, f.category_id, f.subcategory_id, f.sort_order
  )
  select fam.id, fam.name, fam.slug, fam.series_code, fam.description,
         fam.brand_name, fam.category_id, fam.subcategory_id,
         cov.path as cover_image_path,
         fam.variant_count, fam.min_price,
         count(*) over () as total_count
    from fam
    left join lateral (
      -- deterministik kapak: sku sırasına göre ilk aktif varyantın ilk görseli
      select pi.path
        from product_images pi
        join products pv on pv.id = pi.product_id
       where pv.family_id = fam.id
         and pv.status = 'active' and pv.deleted_at is null
       order by pv.sku, pi.sort_order
       limit 1
    ) cov on true
   order by fam.sort_order, fam.name
   limit least(greatest(coalesce(p_limit, 24), 1), 96)
  offset greatest(coalesce(p_offset, 0), 0)
$function$
;

--
-- Name: get_search_suggestions(p_q text, p_limit integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_search_suggestions(p_q text, p_limit integer DEFAULT 6)
 RETURNS TABLE(type text, label text, url text, metadata jsonb)
 LANGUAGE plpgsql
 STABLE
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  v_limit int;
  v_raw text;
  v_like text;
BEGIN
  v_limit := LEAST(GREATEST(p_limit, 1), 20);
  v_raw   := coalesce(trim(p_q), '');
  
  IF v_raw = '' THEN
    RETURN;
  END IF;

  v_like := '%' || replace(v_raw, ' ', '%') || '%';

  RETURN QUERY
  (
    -- Products (max 4)
    SELECT
      'product'::text AS type,
      p.name::text AS label,
      ('/products/' || p.id::text)::text AS url,
      jsonb_build_object(
        'sku', p.sku,
        'brand', coalesce(p.brand, ''),
        'model_code', coalesce(p.model_code, '')
      ) AS metadata
    FROM public.products p
    WHERE p.status = 'active'
      AND (
        p.name ILIKE v_like
        OR p.sku ILIKE v_like
        OR p.model_code ILIKE v_like
        OR p.brand ILIKE v_like
      )
    ORDER BY
      CASE WHEN p.name ILIKE v_raw || '%' THEN 0 ELSE 1 END,
      p.is_featured DESC NULLS LAST,
      p.name
    LIMIT LEAST(v_limit, 4)
  )
  UNION ALL
  (
    -- Categories (max 2)
    SELECT
      'category'::text AS type,
      c.name::text AS label,
      ('/category/' || c.slug)::text AS url,
      jsonb_build_object('level', c.level) AS metadata
    FROM public.categories c
    WHERE c.is_active = true
      AND c.name ILIKE v_like
    ORDER BY c.level, c.name
    LIMIT 2
  )
  UNION ALL
  (
    -- Brands (max 2, distinct from products)
    SELECT DISTINCT ON (p.brand)
      'brand'::text AS type,
      p.brand::text AS label,
      ('/products?brand=' || p.brand)::text AS url,
      jsonb_build_object() AS metadata
    FROM public.products p
    WHERE p.status = 'active'
      AND p.brand IS NOT NULL
      AND p.brand ILIKE v_like
    ORDER BY p.brand
    LIMIT 2
  )
  LIMIT v_limit;
END;
$function$
;

--
-- Name: get_user_role(user_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role 
    FROM public.user_profiles 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'user');
END;
$function$
;

--
-- Name: handle_new_user_metadata(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_new_user_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  tenant_id_raw text;
  resolved_tenant_id uuid;
  role_val text;
BEGIN
  -- Extract tenant_id from raw_user_meta_data
  tenant_id_raw := new.raw_user_meta_data ->> 'tenant_id';
  
  -- Safe block to parse and check tenant_id validity in the tenants table
  BEGIN
    IF tenant_id_raw IS NOT NULL THEN
      SELECT id INTO resolved_tenant_id FROM public.tenants WHERE id = tenant_id_raw::uuid AND is_active = true;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    resolved_tenant_id := NULL;
  END;

  -- Default to 'd3b07384-d113-495f-a558-8c38634e0000' if not found or invalid
  IF resolved_tenant_id IS NULL THEN
    resolved_tenant_id := 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
  END IF;

  -- Extract role from metadata, default to 'user'
  role_val := COALESCE(new.raw_user_meta_data ->> 'role', 'user');

  -- Prevent role self-elevation using COALESCE for null-safety
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR public.is_admin_user()) THEN
    role_val := 'user';
  END IF;

  -- Inject tenant_id and user_role into raw_app_meta_data so they are included in JWT claims
  new.raw_app_meta_data := jsonb_set(
    COALESCE(new.raw_app_meta_data, '{}'::jsonb),
    '{tenant_id}',
    to_jsonb(resolved_tenant_id::text)
  );
  new.raw_app_meta_data := jsonb_set(
    new.raw_app_meta_data,
    '{user_role}',
    to_jsonb(role_val)
  );

  -- Also set tenant_id and user_role in raw_user_meta_data
  new.raw_user_meta_data := jsonb_set(
    COALESCE(new.raw_user_meta_data, '{}'::jsonb),
    '{tenant_id}',
    to_jsonb(resolved_tenant_id::text)
  );
  new.raw_user_meta_data := jsonb_set(
    new.raw_user_meta_data,
    '{role}',
    to_jsonb(role_val)
  );

  RETURN new;
END;
$function$
;

--
-- Name: handle_new_user_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  resolved_tenant_id uuid;
  full_name_val text;
  role_val text;
BEGIN
  -- Extract resolved tenant_id from new.raw_app_meta_data
  resolved_tenant_id := (new.raw_app_meta_data ->> 'tenant_id')::uuid;
  
  -- Extract other metadata values
  full_name_val := new.raw_user_meta_data ->> 'full_name';
  role_val := COALESCE(new.raw_user_meta_data ->> 'role', 'user');

  -- Prevent role self-elevation using COALESCE for null-safety
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR public.is_admin_user()) THEN
    role_val := 'user';
  END IF;

  -- Insert or update public.user_profiles mapping
  INSERT INTO public.user_profiles (id, tenant_id, full_name, role, created_at, updated_at)
  VALUES (
    new.id,
    resolved_tenant_id,
    full_name_val,
    role_val,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    tenant_id = EXCLUDED.tenant_id,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN new;
END;
$function$
;

--
-- Name: handle_supabase_webhook(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.handle_supabase_webhook()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public', 'net'
AS $function$
    DECLARE
      payload jsonb;
      webhook_url text := 'https://venthub-hvac-esite.vercel.app/api/webhook/supabase';
      webhook_secret text := 'whsec_venthub_a61f54b2bcff63f221259b315256d006';
      req_id bigint;
    BEGIN
      -- Construct the payload matching Route Handler expectations
      payload := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        'old_record', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END
      );

      -- Perform asynchronous HTTP POST request using pg_net
      -- Passed body as payload (jsonb) instead of payload::text
      SELECT net.http_post(
        url := webhook_url,
        body := payload,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-webhook-secret', webhook_secret
        ),
        timeout_milliseconds := 5000
      ) INTO req_id;

      RETURN NEW;
    END;
    $function$
;

--
-- Name: increment_coupon_usage(p_code text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_code text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = p_code
    AND (usage_limit IS NULL OR used_count < usage_limit);
END;
$function$
;

--
-- Name: increment_error_group_count(p_group_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.increment_error_group_count(p_group_id uuid)
 RETURNS void
 LANGUAGE sql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  UPDATE public.error_groups
  SET count = count + 1,
      last_seen = now()
  WHERE id = p_group_id;
$function$
;

--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  );
$function$
;

--
-- Name: is_admin_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- If service_role, bypass checks and return true
  IF auth.role() = 'service_role' THEN
    RETURN TRUE;
  END IF;

  -- Retrieve JWT claims from request context
  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  
  IF claims IS NOT NULL THEN
    user_role := COALESCE(
      claims ->> 'user_role',
      claims -> 'app_metadata' ->> 'user_role',
      claims -> 'user_metadata' ->> 'role'
    );
    IF user_role IS NOT NULL THEN
      RETURN user_role IN ('admin', 'super_admin');
    END IF;
  END IF;

  -- Fallback to database lookup if claims are empty (e.g. backend script, triggers)
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin','super_admin')
  );
END;
$function$
;

--
-- Name: is_staff_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.is_staff_user()
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'moderator')
  );
END;
$function$
;

--
-- Name: is_user_admin(user_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_id AND role IN ('admin','super_admin')
  );
END;
$function$
;

--
-- Name: jwt_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.jwt_role()
 RETURNS text
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'pg_temp'
AS $function$
  SELECT COALESCE( NULLIF(current_setting('request.jwt.claims', true), ''), '{}' )::jsonb ->> 'role'
$function$
;

--
-- Name: jwt_tenant_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.jwt_tenant_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_catalog'
AS $function$
DECLARE
  claims_str text;
  tenant_id_val text;
BEGIN
  -- Extract raw JWT claims string safely
  claims_str := current_setting('request.jwt.claims', true);
  
  IF claims_str IS NULL OR claims_str = '' THEN
    RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
  END IF;
  
  -- Parse JSON and extract app_metadata -> tenant_id
  tenant_id_val := claims_str::jsonb -> 'app_metadata' ->> 'tenant_id';
  
  IF tenant_id_val IS NULL OR tenant_id_val = '' THEN
    RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
  END IF;
  
  RETURN tenant_id_val::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'd3b07384-d113-495f-a558-8c38634e0000'::uuid;
END;
$function$
;

--
-- Name: normalize_product_threshold_overrides(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.normalize_product_threshold_overrides()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  -- Yeni default ile aynı değere sahip tüm override'ları temizle
  update public.products
     set low_stock_threshold = null,
         low_stock_override = false
   where low_stock_override is true
     and low_stock_threshold is not null
     and low_stock_threshold = new.default_low_stock_threshold;
  return new;
end;
$function$
;

--
-- Name: process_order_stock_reduction(p_order_id text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.process_order_stock_reduction(p_order_id text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog, public'
AS $function$
DECLARE
  v_order_uuid uuid;
  v_order_exists boolean := false;
  v_processed_count int := 0;
  v_failed_products text[] := '{}';
  v_item record;
  v_current_stock int;
  v_result jsonb;
BEGIN
  -- Convert order ID from text to UUID safely
  BEGIN
    v_order_uuid := p_order_id::uuid;
  EXCEPTION WHEN invalid_text_representation THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Invalid order ID format',
      'processed_count', 0
    );
  END;

  -- 1. Row-level Lock (FOR UPDATE): Prevent concurrent executions on the same order.
  -- This forces any second webhook trigger to wait until this transaction completes.
  SELECT EXISTS(
    SELECT 1 FROM public.venthub_orders 
    WHERE id = v_order_uuid AND status IN ('paid', 'processing')
    FOR UPDATE
  ) INTO v_order_exists;
  
  IF NOT v_order_exists THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Order not found or not in processed state',
      'processed_count', 0
    );
  END IF;

  -- 2. Idempotency Check: Check if stock reduction has already been run for this order.
  -- Look for inventory movements with the same order_id or batch_id and reason = 'order_sale'.
  IF EXISTS(
    SELECT 1 FROM public.inventory_movements 
    WHERE (order_id = v_order_uuid OR batch_id = v_order_uuid)
      AND reason = 'order_sale'
  ) THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Stock already reduced for this order',
      'processed_count', 0,
      'order_id', p_order_id
    );
  END IF;

  -- Loop through order items and reduce stock
  FOR v_item IN 
    SELECT oi.product_id, oi.quantity, p.name as product_name, p.stock_qty
    FROM public.venthub_order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = v_order_uuid
  LOOP
    BEGIN
      -- Check current stock
      v_current_stock := COALESCE(v_item.stock_qty, 0);
      
      -- Is there enough stock?
      IF v_current_stock >= v_item.quantity THEN
        -- Adjust stock using standard adjust_stock function with batch_id = v_order_uuid
        PERFORM public.adjust_stock(
          v_item.product_id, 
          -v_item.quantity,  -- negative (stock reduction)
          'order_sale',
          v_order_uuid       -- batch_id
        );
        
        -- Update the inserted movement's order_id atomically via batch_id matching
        UPDATE public.inventory_movements 
        SET order_id = v_order_uuid
        WHERE batch_id = v_order_uuid 
          AND product_id = v_item.product_id
          AND order_id IS NULL;
        
        v_processed_count := v_processed_count + 1;
      ELSE
        -- Insufficient stock
        v_failed_products := array_append(v_failed_products, v_item.product_name);
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Record failure detail if an error occurs
      v_failed_products := array_append(v_failed_products, v_item.product_name || ' (ERROR: ' || SQLERRM || ')');
    END;
  END LOOP;

  -- Prepare success result
  v_result := jsonb_build_object(
    'success', true,
    'processed_count', v_processed_count,
    'failed_products', v_failed_products,
    'order_id', p_order_id
  );

  RETURN v_result;
END;
$function$
;

--
-- Name: reverse_inventory_batch(p_batch_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.reverse_inventory_batch(p_batch_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_batch RECORD;
    v_movement RECORD;
BEGIN
    -- Get batch info
    SELECT * INTO v_batch FROM public.inventory_batches WHERE id = p_batch_id;
    
    IF v_batch IS NULL THEN
        RAISE EXCEPTION 'Batch not found: %', p_batch_id;
    END IF;
    
    IF v_batch.reversed THEN
        RAISE EXCEPTION 'Batch already reversed: %', p_batch_id;
    END IF;
    
    -- Reverse all movements in this batch
    FOR v_movement IN 
        SELECT * FROM public.inventory_movements WHERE batch_id = p_batch_id
    LOOP
        -- Reverse the stock change
        UPDATE public.products
        SET stock_quantity = stock_quantity - v_movement.quantity_change
        WHERE id = v_movement.product_id;
    END LOOP;
    
    -- Mark batch as reversed
    UPDATE public.inventory_batches
    SET reversed = true, reversed_at = NOW()
    WHERE id = p_batch_id;
END;
$function$
;

--
-- Name: reverse_inventory_batch(p_batch_id uuid, p_max_minutes integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.reverse_inventory_batch(p_batch_id uuid, p_max_minutes integer DEFAULT 30)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  r RECORD;
  cnt int := 0;
  comp_id uuid;
  cutoff timestamptz := now() - (make_interval(mins => p_max_minutes));
  v_actor uuid;
BEGIN
  IF p_batch_id IS NULL THEN
    RETURN 0;
  END IF;

  -- Determine actor (caller) if available
  BEGIN
    v_actor := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub';
  EXCEPTION WHEN others THEN
    v_actor := NULL;
  END;

  -- Enforce time window: earliest movement must be newer than cutoff
  IF EXISTS (
    SELECT 1 FROM public.inventory_movements
    WHERE batch_id = p_batch_id AND created_at < cutoff
  ) THEN
    RAISE EXCEPTION 'UNDO_WINDOW_EXPIRED';
  END IF;

  FOR r IN SELECT id, product_id, delta FROM public.inventory_movements WHERE batch_id = p_batch_id LOOP
    -- revert stock
    UPDATE public.products
    SET stock_qty = GREATEST(0, COALESCE(stock_qty, 0) - r.delta)
    WHERE id = r.product_id;

    -- compensating movement with metadata
    INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id, original_movement_id, undo_by_user_id, undo_at)
    VALUES (r.product_id, -r.delta, 'undo:csv', p_batch_id, r.id, v_actor::uuid, now())
    RETURNING id INTO comp_id;

    -- link original to compensating record
    UPDATE public.inventory_movements SET reversed_by_movement_id = comp_id WHERE id = r.id;

    cnt := cnt + 1;
  END LOOP;

  RETURN cnt;
END;
$function$
;

--
-- Name: set_order_number(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$function$
;

--
-- Name: set_stock(p_product_id uuid, p_new_qty integer, p_reason text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog, public'
AS $function$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(stock_qty, 0) INTO v_current 
  FROM public.products 
  WHERE id = p_product_id;
  
  v_delta := p_new_qty - v_current;
  
  IF v_delta = 0 THEN
    RETURN;
  END IF;
  
  UPDATE public.products 
  SET stock_qty = GREATEST(0, p_new_qty)
  WHERE id = p_product_id;
  
  INSERT INTO public.inventory_movements (product_id, delta, reason) 
  VALUES (p_product_id, v_delta, COALESCE(p_reason, 'set'));
END;
$function$
;

--
-- Name: set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_stock(p_product_id uuid, p_new_qty integer, p_reason text, p_batch_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog, public'
AS $function$
DECLARE
  v_current int;
  v_delta int;
BEGIN
  IF NOT (COALESCE(auth.role(), '') = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() 
      AND up.role IN ('super_admin', 'admin', 'warehouse', 'moderator', 'super_admin', 'moderator')
  )) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COALESCE(stock_qty, 0) INTO v_current 
  FROM public.products 
  WHERE id = p_product_id;

  v_delta := p_new_qty - v_current;
  IF v_delta = 0 THEN
    RETURN;
  END IF;

  UPDATE public.products 
  SET stock_qty = GREATEST(0, p_new_qty)
  WHERE id = p_product_id;

  INSERT INTO public.inventory_movements (product_id, delta, reason, batch_id) 
  VALUES (p_product_id, v_delta, COALESCE(p_reason, 'set'), p_batch_id);
END;
$function$
;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$
;

--
-- Name: set_user_admin_role(user_id uuid, new_role text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_user_admin_role(user_id uuid, new_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
begin
  if not (coalesce(auth.role(), '') = 'service_role' or exists (
    select 1 from public.user_profiles up
    where up.id = auth.uid()
      and up.role in ('super_admin', 'admin')
  )) then
    raise exception 'not authorized';
  end if;

  if new_role not in ('user','admin','moderator','super_admin','warehouse','sales','viewer') then
    raise exception 'Invalid role: %', new_role;
  end if;

  insert into public.user_profiles (id, role) values (user_id, new_role)
  on conflict (id) do update set role = excluded.role, updated_at = now();

  return true;
end;
$function$
;

--
-- Name: set_user_role(user_id uuid, new_role text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.set_user_role(user_id uuid, new_role text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    INSERT INTO public.user_profiles (id, role) VALUES (user_id, new_role)
    ON CONFLICT (id) DO UPDATE SET role = new_role, updated_at = NOW();
    RETURN TRUE;
END;
$function$
;

--
-- Name: sync_payment_status_with_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.sync_payment_status_with_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.status IN ('paid','confirmed') AND COALESCE(NEW.payment_status,'') <> 'refunded' THEN
    NEW.payment_status := 'paid';
  ELSIF NEW.status = 'failed' THEN
    NEW.payment_status := 'failed';
  END IF;
  RETURN NEW;
END;
$function$
;

--
-- Name: tg_categories_set_level(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.tg_categories_set_level()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
begin
  if new.parent_id is null then
    new.level := 0;
  else
    select c.level + 1 into new.level from public.categories c where c.id = new.parent_id;
    if new.level is null then
      raise exception 'categories level guard: parent % bulunamadı', new.parent_id;
    end if;
  end if;
  return new;
end;
$function$
;

--
-- Name: tg_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
begin
  new.updated_at := now();
  return new;
end;
$function$
;

--
-- Name: update_inventory_settings(p_default_low_stock_threshold integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_inventory_settings(p_default_low_stock_threshold integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
begin
  -- Allow CI/MCP via service role; otherwise require admin user
  if auth.role() = 'service_role' then
    -- allowed
  elsif not public.is_user_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  if exists (select 1 from public.inventory_settings) then
    update public.inventory_settings
      set default_low_stock_threshold = p_default_low_stock_threshold,
          updated_at = now()
      where id is true; -- explicit filter (single-row table)
  else
    insert into public.inventory_settings (id, default_low_stock_threshold)
    values (true, p_default_low_stock_threshold);
  end if;
end;
$function$
;

--
-- Name: update_inventory_thresholds(p_default integer, p_reset_overrides boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_inventory_thresholds(p_default integer, p_reset_overrides boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
begin
  -- Auth: allow service_role (CI/MCP), otherwise require admin user
  if auth.role() = 'service_role' then
    -- allowed
  elsif not public.is_user_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  -- Upsert settings (single row)
  if exists (select 1 from public.inventory_settings) then
    update public.inventory_settings
      set default_low_stock_threshold = p_default,
          updated_at = now()
      where id is true;
  else
    insert into public.inventory_settings (id, default_low_stock_threshold) values (true, p_default);
  end if;

  if p_reset_overrides is true then
    -- Apply to all products: explicit WHERE using primary key list to satisfy safety checks
    update public.products
       set low_stock_threshold = null,
           low_stock_override = false
     where id in (select id from public.products);
  else
    -- Normalize: any override equal to new default is cleared
    update public.products
       set low_stock_threshold = null,
           low_stock_override = false
     where low_stock_override is true
       and low_stock_threshold is not null
       and low_stock_threshold = p_default;
  end if;
end;
$function$
;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

--
-- Name: update_user_profiles_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

--
-- Name: user_invoice_profiles_ensure_single_default(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE OR REPLACE FUNCTION public.user_invoice_profiles_ensure_single_default()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF NEW.is_default = true THEN
        UPDATE public.user_invoice_profiles
        SET is_default = false
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_default = true;
    END IF;
    RETURN NEW;
END;
$function$
;
