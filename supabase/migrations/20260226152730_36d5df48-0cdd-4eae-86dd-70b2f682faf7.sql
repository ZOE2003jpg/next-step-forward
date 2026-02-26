
-- Fix all RLS policies from RESTRICTIVE to PERMISSIVE

-- dispatches
DROP POLICY IF EXISTS "Students view own dispatches" ON dispatches;
CREATE POLICY "Students view own dispatches" ON dispatches FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students create dispatches" ON dispatches;
CREATE POLICY "Students create dispatches" ON dispatches FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Riders view assigned dispatches" ON dispatches;
CREATE POLICY "Riders view assigned dispatches" ON dispatches FOR SELECT USING (auth.uid() = rider_id);

DROP POLICY IF EXISTS "Riders update assigned dispatches" ON dispatches;
CREATE POLICY "Riders update assigned dispatches" ON dispatches FOR UPDATE USING (auth.uid() = rider_id);

DROP POLICY IF EXISTS "Admins view all dispatches" ON dispatches;
CREATE POLICY "Admins view all dispatches" ON dispatches FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- menu_items
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
CREATE POLICY "Anyone can view menu items" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can delete menu items" ON menu_items;
CREATE POLICY "Vendors can delete menu items" ON menu_items FOR DELETE USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors can insert menu items" ON menu_items;
CREATE POLICY "Vendors can insert menu items" ON menu_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors can update menu items" ON menu_items;
CREATE POLICY "Vendors can update menu items" ON menu_items FOR UPDATE USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = menu_items.restaurant_id AND restaurants.owner_id = auth.uid()));

-- order_items
DROP POLICY IF EXISTS "Users insert order items" ON order_items;
CREATE POLICY "Users insert order items" ON order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.student_id = auth.uid()));

DROP POLICY IF EXISTS "Users view own order items" ON order_items;
CREATE POLICY "Users view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.student_id = auth.uid() OR orders.rider_id = auth.uid())));

DROP POLICY IF EXISTS "Vendors view order items" ON order_items;
CREATE POLICY "Vendors view order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE o.id = order_items.order_id AND r.owner_id = auth.uid()));

-- orders
DROP POLICY IF EXISTS "Admins view all orders" ON orders;
CREATE POLICY "Admins view all orders" ON orders FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Riders update assigned orders" ON orders;
CREATE POLICY "Riders update assigned orders" ON orders FOR UPDATE USING (auth.uid() = rider_id);

DROP POLICY IF EXISTS "Riders view assigned orders" ON orders;
CREATE POLICY "Riders view assigned orders" ON orders FOR SELECT USING (auth.uid() = rider_id);

DROP POLICY IF EXISTS "Students create orders" ON orders;
CREATE POLICY "Students create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students view own orders" ON orders;
CREATE POLICY "Students view own orders" ON orders FOR SELECT USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Vendors update restaurant orders" ON orders;
CREATE POLICY "Vendors update restaurant orders" ON orders FOR UPDATE USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()));

DROP POLICY IF EXISTS "Vendors view restaurant orders" ON orders;
CREATE POLICY "Vendors view restaurant orders" ON orders FOR SELECT USING (EXISTS (SELECT 1 FROM restaurants WHERE restaurants.id = orders.restaurant_id AND restaurants.owner_id = auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- restaurants
DROP POLICY IF EXISTS "Anyone can view restaurants" ON restaurants;
CREATE POLICY "Anyone can view restaurants" ON restaurants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can delete restaurant" ON restaurants;
CREATE POLICY "Vendors can delete restaurant" ON restaurants FOR DELETE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Vendors can insert restaurant" ON restaurants;
CREATE POLICY "Vendors can insert restaurant" ON restaurants FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Vendors can update restaurant" ON restaurants;
CREATE POLICY "Vendors can update restaurant" ON restaurants FOR UPDATE USING (auth.uid() = owner_id);

-- trip_bookings
DROP POLICY IF EXISTS "Students create bookings" ON trip_bookings;
CREATE POLICY "Students create bookings" ON trip_bookings FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students view own bookings" ON trip_bookings;
CREATE POLICY "Students view own bookings" ON trip_bookings FOR SELECT USING (auth.uid() = student_id);

-- trip_routes
DROP POLICY IF EXISTS "Admins can delete routes" ON trip_routes;
CREATE POLICY "Admins can delete routes" ON trip_routes FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert routes" ON trip_routes;
CREATE POLICY "Admins can insert routes" ON trip_routes FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update routes" ON trip_routes;
CREATE POLICY "Admins can update routes" ON trip_routes FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can view routes" ON trip_routes;
CREATE POLICY "Anyone can view routes" ON trip_routes FOR SELECT USING (true);

-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
CREATE POLICY "Admins can view all roles" ON user_roles FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);

-- wallet_transactions
DROP POLICY IF EXISTS "Users insert own transactions" ON wallet_transactions;
CREATE POLICY "Users insert own transactions" ON wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own transactions" ON wallet_transactions;
CREATE POLICY "Users view own transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- wallets
DROP POLICY IF EXISTS "Users update own wallet" ON wallets;
CREATE POLICY "Users update own wallet" ON wallets FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own wallet" ON wallets;
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
