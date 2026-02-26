
-- 1. Create platform_settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON public.platform_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update settings"
  ON public.platform_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings"
  ON public.platform_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Seed default platform settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('delivery_fee', 150),
  ('platform_commission_pct', 10),
  ('dispatch_fee', 250)
ON CONFLICT (key) DO NOTHING;

-- 3. Create triggers for handle_new_user (profiles + roles) and handle_new_user_wallet
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_wallet();

-- 4. Fix all RLS policies from RESTRICTIVE to PERMISSIVE
-- Drop and recreate all restrictive policies as permissive

-- dispatches
DROP POLICY IF EXISTS "Admins view all dispatches" ON public.dispatches;
CREATE POLICY "Admins view all dispatches" ON public.dispatches FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Riders update assigned dispatches" ON public.dispatches;
CREATE POLICY "Riders update assigned dispatches" ON public.dispatches FOR UPDATE TO authenticated USING (auth.uid() = rider_id);

DROP POLICY IF EXISTS "Riders view assigned dispatches" ON public.dispatches;
CREATE POLICY "Riders view assigned dispatches" ON public.dispatches FOR SELECT TO authenticated USING (auth.uid() = rider_id);

DROP POLICY IF EXISTS "Students create dispatches" ON public.dispatches;
CREATE POLICY "Students create dispatches" ON public.dispatches FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students view own dispatches" ON public.dispatches;
CREATE POLICY "Students view own dispatches" ON public.dispatches FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- menu_items
DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can delete menu items" ON public.menu_items;
CREATE POLICY "Vendors can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors can insert menu items" ON public.menu_items;
CREATE POLICY "Vendors can insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors can update menu items" ON public.menu_items;
CREATE POLICY "Vendors can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

-- order_items
DROP POLICY IF EXISTS "Users insert order items" ON public.order_items;
CREATE POLICY "Users insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.student_id = auth.uid()));

DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.student_id = auth.uid() OR orders.rider_id = auth.uid())));

DROP POLICY IF EXISTS "Vendors view order items" ON public.order_items;
CREATE POLICY "Vendors view order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.id = order_items.order_id AND r.owner_id = auth.uid()));

-- orders
DROP POLICY IF EXISTS "Admins view all orders" ON public.orders;
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Riders update assigned orders" ON public.orders;
CREATE POLICY "Riders update assigned orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = rider_id);

DROP POLICY IF EXISTS "Riders view assigned orders" ON public.orders;
CREATE POLICY "Riders view assigned orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = rider_id);

DROP POLICY IF EXISTS "Students create orders" ON public.orders;
CREATE POLICY "Students create orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students view own orders" ON public.orders;
CREATE POLICY "Students view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Vendors update restaurant orders" ON public.orders;
CREATE POLICY "Vendors update restaurant orders" ON public.orders FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors view restaurant orders" ON public.orders;
CREATE POLICY "Vendors view restaurant orders" ON public.orders FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- Add admin view all profiles
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- restaurants
DROP POLICY IF EXISTS "Anyone can view restaurants" ON public.restaurants;
CREATE POLICY "Anyone can view restaurants" ON public.restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can delete restaurant" ON public.restaurants;
CREATE POLICY "Vendors can delete restaurant" ON public.restaurants FOR DELETE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Vendors can insert restaurant" ON public.restaurants;
CREATE POLICY "Vendors can insert restaurant" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Vendors can update restaurant" ON public.restaurants;
CREATE POLICY "Vendors can update restaurant" ON public.restaurants FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- trip_bookings
DROP POLICY IF EXISTS "Students create bookings" ON public.trip_bookings;
CREATE POLICY "Students create bookings" ON public.trip_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students view own bookings" ON public.trip_bookings;
CREATE POLICY "Students view own bookings" ON public.trip_bookings FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- trip_routes
DROP POLICY IF EXISTS "Admins can delete routes" ON public.trip_routes;
CREATE POLICY "Admins can delete routes" ON public.trip_routes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert routes" ON public.trip_routes;
CREATE POLICY "Admins can insert routes" ON public.trip_routes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update routes" ON public.trip_routes;
CREATE POLICY "Admins can update routes" ON public.trip_routes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view routes" ON public.trip_routes;
CREATE POLICY "Anyone can view routes" ON public.trip_routes FOR SELECT USING (true);

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- wallet_transactions
DROP POLICY IF EXISTS "Users insert own transactions" ON public.wallet_transactions;
CREATE POLICY "Users insert own transactions" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users view own transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- wallets
DROP POLICY IF EXISTS "Users update own wallet" ON public.wallets;
CREATE POLICY "Users update own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Allow wallet inserts (for trigger)
CREATE POLICY "System can insert wallets" ON public.wallets FOR INSERT WITH CHECK (true);
