-- Phase 3: Restrict PUBLIC policies to explicit roles and drop obvious duplicates
DO $$
BEGIN
  -- cart_items: keep one policy for anon+authenticated, drop duplicates
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='cart_items' AND p.polname='Users can manage their own cart items') THEN
    EXECUTE 'ALTER POLICY "Users can manage their own cart items" ON public.cart_items TO anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='cart_items' AND p.polname='cart_items_modify_own') THEN
    EXECUTE 'DROP POLICY IF EXISTS cart_items_modify_own ON public.cart_items';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='cart_items' AND p.polname='cart_items_select_own') THEN
    EXECUTE 'DROP POLICY IF EXISTS cart_items_select_own ON public.cart_items';
  END IF;

  -- shopping_carts: keep one policy for anon+authenticated, drop duplicates
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='shopping_carts' AND p.polname='Users can manage their own shopping carts') THEN
    EXECUTE 'ALTER POLICY "Users can manage their own shopping carts" ON public.shopping_carts TO anon, authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='shopping_carts' AND p.polname='shopping_carts_modify_own') THEN
    EXECUTE 'DROP POLICY IF EXISTS shopping_carts_modify_own ON public.shopping_carts';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='shopping_carts' AND p.polname='shopping_carts_select_own') THEN
    EXECUTE 'DROP POLICY IF EXISTS shopping_carts_select_own ON public.shopping_carts';
  END IF;

  -- venthub_order_items: restrict and drop duplicates
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='venthub_order_items' AND p.polname='Admins can view all order items') THEN
    EXECUTE 'ALTER POLICY "Admins can view all order items" ON public.venthub_order_items TO authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='venthub_order_items' AND p.polname='Service role can do everything on order items') THEN
    EXECUTE 'ALTER POLICY "Service role can do everything on order items" ON public.venthub_order_items TO service_role';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='venthub_order_items' AND p.polname='venthub_order_items_admin') THEN
    EXECUTE 'DROP POLICY IF EXISTS venthub_order_items_admin ON public.venthub_order_items';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='venthub_order_items' AND p.polname='venthub_order_items_own') THEN
    EXECUTE 'DROP POLICY IF EXISTS venthub_order_items_own ON public.venthub_order_items';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='venthub_order_items' AND p.polname='select_own_order_items') THEN
    EXECUTE 'DROP POLICY IF EXISTS select_own_order_items ON public.venthub_order_items';
  END IF;

  -- venthub_orders: restrict and cleanup
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='venthub_orders' AND p.polname='Admins can view all orders') THEN
    EXECUTE 'ALTER POLICY "Admins can view all orders" ON public.venthub_orders TO authenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='venthub_orders' AND p.polname='Service role can do everything on orders') THEN
    EXECUTE 'ALTER POLICY "Service role can do everything on orders" ON public.venthub_orders TO service_role';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='venthub_orders' AND p.polname='venthub_orders_admin') THEN
    EXECUTE 'DROP POLICY IF EXISTS venthub_orders_admin ON public.venthub_orders';
  END IF;

  -- products: drop redundant admin_all (specific admin policies exist)
  IF EXISTS (SELECT 1 FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid WHERE c.relname='products' AND p.polname='products_admin_all') THEN
    EXECUTE 'DROP POLICY IF EXISTS products_admin_all ON public.products';
  END IF;

  -- Generic pass: restrict PUBLIC policies that clearly target admin or service roles
  FOR r IN (
    SELECT n.nspname, c.relname, p.polname,
           pg_get_expr(p.polqual,p.polrelid) AS using_expr
    FROM pg_policy p
    JOIN pg_class c ON c.oid = p.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname='public' AND p.polpermissive = true AND p.polroles IS NULL
  ) LOOP
    IF r.using_expr ILIKE '%service_role%' OR r.polname ILIKE '%Service role%' THEN
      -- service role plus authenticated (admins) to preserve existing intent
      EXECUTE format('ALTER POLICY %I ON %I.%I TO service_role, authenticated', r.polname, r.nspname, r.relname);
    ELSIF r.using_expr ILIKE '%user_profiles.role%admin%' OR r.using_expr ILIKE '%jwt_role()%admin%' OR r.polname ILIKE '%admin%' OR r.polname ILIKE 'Admins can %' THEN
      EXECUTE format('ALTER POLICY %I ON %I.%I TO authenticated', r.polname, r.nspname, r.relname);
    END IF;
  END LOOP;
END
$$ LANGUAGE plpgsql;
