
-- 1. Add order state machine columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_otp text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_otp_expires_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS disputed_at timestamptz;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dispute_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_by uuid;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference text;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_reference_unique ON public.orders (payment_reference) WHERE payment_reference IS NOT NULL;

-- 2. Convert ALL RLS policies from RESTRICTIVE to PERMISSIVE
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

DROP POLICY IF EXISTS "Anyone can view menu items" ON public.menu_items;
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Vendors can delete menu items" ON public.menu_items;
CREATE POLICY "Vendors can delete menu items" ON public.menu_items FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));
DROP POLICY IF EXISTS "Vendors can insert menu items" ON public.menu_items;
CREATE POLICY "Vendors can insert menu items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));
DROP POLICY IF EXISTS "Vendors can update menu items" ON public.menu_items;
CREATE POLICY "Vendors can update menu items" ON public.menu_items FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Users insert order items" ON public.order_items;
CREATE POLICY "Users insert order items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.student_id = auth.uid()));
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.student_id = auth.uid() OR orders.rider_id = auth.uid())));
DROP POLICY IF EXISTS "Vendors view order items" ON public.order_items;
CREATE POLICY "Vendors view order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.id = order_items.order_id AND r.owner_id = auth.uid()));
CREATE POLICY "Admins view all order items" ON public.order_items FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

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
CREATE POLICY "Students update own orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can insert settings" ON public.platform_settings;
CREATE POLICY "Admins can insert settings" ON public.platform_settings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update settings" ON public.platform_settings;
CREATE POLICY "Admins can update settings" ON public.platform_settings FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Authenticated users can read settings" ON public.platform_settings;
CREATE POLICY "Authenticated users can read settings" ON public.platform_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Anyone can view restaurants" ON public.restaurants;
CREATE POLICY "Anyone can view restaurants" ON public.restaurants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Vendors can delete restaurant" ON public.restaurants;
CREATE POLICY "Vendors can delete restaurant" ON public.restaurants FOR DELETE TO authenticated USING (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Vendors can insert restaurant" ON public.restaurants;
CREATE POLICY "Vendors can insert restaurant" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
DROP POLICY IF EXISTS "Vendors can update restaurant" ON public.restaurants;
CREATE POLICY "Vendors can update restaurant" ON public.restaurants FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Students create bookings" ON public.trip_bookings;
CREATE POLICY "Students create bookings" ON public.trip_bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "Students view own bookings" ON public.trip_bookings;
CREATE POLICY "Students view own bookings" ON public.trip_bookings FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can delete routes" ON public.trip_routes;
CREATE POLICY "Admins can delete routes" ON public.trip_routes FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can insert routes" ON public.trip_routes;
CREATE POLICY "Admins can insert routes" ON public.trip_routes FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Admins can update routes" ON public.trip_routes;
CREATE POLICY "Admins can update routes" ON public.trip_routes FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Anyone can view routes" ON public.trip_routes;
CREATE POLICY "Anyone can view routes" ON public.trip_routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own transactions" ON public.wallet_transactions;
CREATE POLICY "Users insert own transactions" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users view own transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert wallets" ON public.wallets;
CREATE POLICY "System can insert wallets" ON public.wallets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users update own wallet" ON public.wallets;
CREATE POLICY "Users update own wallet" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users view own wallet" ON public.wallets;
CREATE POLICY "Users view own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. Order validation function
CREATE OR REPLACE FUNCTION public.validate_order_transition(
  _order_id uuid, _new_status text, _user_id uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _order RECORD; _role app_role; _valid boolean := false; _msg text := 'Invalid transition';
BEGIN
  SELECT * INTO _order FROM orders WHERE id = _order_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('valid', false, 'message', 'Order not found'); END IF;
  SELECT role INTO _role FROM user_roles WHERE user_id = _user_id LIMIT 1;
  IF _role = 'student' THEN
    IF _new_status = 'cancelled' AND _order.status = 'pending' THEN _valid := true; _msg := 'Order cancelled'; END IF;
  ELSIF _role = 'vendor' THEN
    IF _order.status = 'pending' AND _new_status = 'accepted' THEN _valid := true; END IF;
    IF _order.status = 'accepted' AND _new_status = 'preparing' THEN _valid := true; END IF;
    IF _order.status = 'preparing' AND _new_status = 'ready' THEN _valid := true; END IF;
    IF _new_status = 'cancelled' AND _order.status IN ('pending', 'accepted', 'preparing') THEN _valid := true; END IF;
  ELSIF _role = 'rider' THEN
    IF _order.status = 'ready' AND _new_status = 'out_for_delivery' THEN _valid := true; END IF;
    IF _order.status = 'out_for_delivery' AND _new_status = 'delivered' THEN _valid := true; END IF;
  ELSIF _role = 'admin' THEN _valid := true;
  END IF;
  RETURN jsonb_build_object('valid', _valid, 'message', _msg, 'current_status', _order.status);
END;
$$;

-- 4. Generate delivery OTP
CREATE OR REPLACE FUNCTION public.generate_delivery_otp(_order_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _otp text;
BEGIN
  _otp := lpad(floor(random() * 1000000)::text, 6, '0');
  UPDATE orders SET delivery_otp = _otp, delivery_otp_expires_at = now() + interval '15 minutes' WHERE id = _order_id;
  RETURN _otp;
END;
$$;

-- 5. Verify delivery OTP
CREATE OR REPLACE FUNCTION public.verify_delivery_otp(_order_id uuid, _otp text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _order RECORD;
BEGIN
  SELECT delivery_otp, delivery_otp_expires_at INTO _order FROM orders WHERE id = _order_id;
  IF NOT FOUND OR _order.delivery_otp IS NULL OR _order.delivery_otp_expires_at < now() OR _order.delivery_otp != _otp THEN RETURN false; END IF;
  UPDATE orders SET delivery_otp = NULL, delivery_otp_expires_at = NULL WHERE id = _order_id;
  RETURN true;
END;
$$;

-- 6. Wallet balance constraint
ALTER TABLE public.wallets ADD CONSTRAINT wallets_balance_non_negative CHECK (balance >= 0);

-- 7. Seed platform settings
INSERT INTO public.platform_settings (key, value) VALUES
  ('delivery_fee', 150), ('platform_commission_pct', 10), ('dispatch_fee', 250), ('rider_base_pay', 100)
ON CONFLICT (key) DO NOTHING;

-- 8. Seed trip routes
INSERT INTO public.trip_routes (from_location, to_location, price, seats_available, next_departure) VALUES
  ('Main Gate', 'Faculty of Engineering', 100, 14, '5 min'),
  ('Hostel Area', 'Library Complex', 80, 20, '10 min'),
  ('SUB Building', 'Sports Complex', 120, 10, '15 min'),
  ('Main Gate', 'Medical Center', 150, 8, '8 min'),
  ('Hostel Area', 'Faculty of Science', 100, 16, '12 min');
