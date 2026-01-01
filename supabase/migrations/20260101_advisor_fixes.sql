-- ============================================================================
-- Supabase Advisor Fixes (2025-01-01)
-- Security: Fix function search_path for 5 functions
-- Performance: Fix auth.uid() initplan for wizard_selections and contact_messages
-- Performance: Consolidate multiple permissive policies
-- ============================================================================

-- ============================================================================
-- PART 1: SECURITY - Fix Function Search Path
-- ============================================================================

-- 1. Fix user_invoice_profiles_ensure_single_default
CREATE OR REPLACE FUNCTION public.user_invoice_profiles_ensure_single_default()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 2. Fix reverse_inventory_batch
CREATE OR REPLACE FUNCTION public.reverse_inventory_batch(p_batch_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- 3. Fix bump_rate_limit
CREATE OR REPLACE FUNCTION public.bump_rate_limit(p_key text, p_window_seconds integer DEFAULT 60, p_max_requests integer DEFAULT 10)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_window_start timestamptz;
    v_current_count integer;
BEGIN
    v_window_start := NOW() - (p_window_seconds || ' seconds')::interval;
    
    -- Count requests in current window
    SELECT COUNT(*) INTO v_current_count
    FROM public.rate_limits
    WHERE key = p_key AND created_at > v_window_start;
    
    -- Check if over limit
    IF v_current_count >= p_max_requests THEN
        RETURN false;
    END IF;
    
    -- Record this request
    INSERT INTO public.rate_limits (key, created_at)
    VALUES (p_key, NOW());
    
    -- Cleanup old entries
    DELETE FROM public.rate_limits
    WHERE key = p_key AND created_at < v_window_start;
    
    RETURN true;
END;
$$;

-- 4. Fix enforce_role_change
CREATE OR REPLACE FUNCTION public.enforce_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Prevent users from changing their own role
    IF OLD.id = (SELECT auth.uid()) AND OLD.role != NEW.role THEN
        RAISE EXCEPTION 'Users cannot change their own role';
    END IF;
    RETURN NEW;
END;
$$;

-- 5. Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- PART 2: PERFORMANCE - Fix auth.uid() initplan for wizard_selections
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "Users can create own wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "Users can update own wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "Users can delete own wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "Admins can view all wizard selections" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_select" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_insert" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_update" ON public.wizard_selections;
DROP POLICY IF EXISTS "wizard_selections_delete" ON public.wizard_selections;

-- Create consolidated policies with initplan optimization
CREATE POLICY "wizard_selections_user_all" ON public.wizard_selections
    FOR ALL
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "wizard_selections_admin_select" ON public.wizard_selections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = (SELECT auth.uid())
            AND user_profiles.role IN ('admin', 'superadmin')
        )
    );

-- ============================================================================
-- PART 3: PERFORMANCE - Fix auth.uid() initplan for contact_messages
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can update contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_select" ON public.contact_messages;
DROP POLICY IF EXISTS "contact_messages_update" ON public.contact_messages;

-- Create optimized policies
-- Public can insert (no auth needed)
CREATE POLICY "contact_messages_public_insert" ON public.contact_messages
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Admin can view all
CREATE POLICY "contact_messages_admin_select" ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = (SELECT auth.uid())
            AND user_profiles.role IN ('admin', 'superadmin')
        )
    );

-- Admin can update
CREATE POLICY "contact_messages_admin_update" ON public.contact_messages
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = (SELECT auth.uid())
            AND user_profiles.role IN ('admin', 'superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE user_profiles.id = (SELECT auth.uid())
            AND user_profiles.role IN ('admin', 'superadmin')
        )
    );

-- ============================================================================
-- PART 4: PERFORMANCE - Consolidate cart_items policies
-- ============================================================================

-- Drop existing multiple policies
DROP POLICY IF EXISTS "cart_items_select" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_insert" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_update" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_delete" ON public.cart_items;
DROP POLICY IF EXISTS "Users can manage own cart items" ON public.cart_items;
DROP POLICY IF EXISTS "cart_items_authenticated_all" ON public.cart_items;

-- Create single consolidated policy
CREATE POLICY "cart_items_user_all" ON public.cart_items
    FOR ALL
    TO authenticated
    USING (
        cart_id IN (
            SELECT id FROM public.shopping_carts
            WHERE user_id = (SELECT auth.uid())
        )
    )
    WITH CHECK (
        cart_id IN (
            SELECT id FROM public.shopping_carts
            WHERE user_id = (SELECT auth.uid())
        )
    );

-- ============================================================================
-- PART 5: PERFORMANCE - Consolidate shopping_carts policies
-- ============================================================================

-- Drop existing multiple policies
DROP POLICY IF EXISTS "shopping_carts_select" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_insert" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_update" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_delete" ON public.shopping_carts;
DROP POLICY IF EXISTS "Users can manage own shopping carts" ON public.shopping_carts;
DROP POLICY IF EXISTS "shopping_carts_authenticated_all" ON public.shopping_carts;

-- Create single consolidated policy
CREATE POLICY "shopping_carts_user_all" ON public.shopping_carts
    FOR ALL
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================================
-- Done
-- ============================================================================
