

# NexGo -- Full App Build Plan

## Overview
Convert the monolithic 1,347-line NexGo.jsx into a proper multi-file React/TypeScript app with Supabase real data, Supabase Auth, KoraPay payment integration with admin-configurable fee splitting, and the existing gold-and-black design system.

---

## 1. Store KoraPay Secret Key
Save `sk_test_eF4gNWFYw5wQ9YkGaTRb7LRHuSbKHixf8WaTGnUN` as a Supabase secret named `KORAPAY_SECRET_KEY` so edge functions can access it securely.

---

## 2. Database Changes (Migrations)

### Fix RLS policies to PERMISSIVE
All existing policies are currently RESTRICTIVE. A migration will convert them all to PERMISSIVE.

### New table: `platform_settings`
Stores admin-configurable fees (delivery fee, platform commission percentage, dispatch fee). The admin can update these values from the admin panel.

```text
platform_settings
- id (uuid, PK)
- key (text, unique) -- e.g. "delivery_fee", "platform_commission_pct", "dispatch_fee"
- value (integer) -- the amount or percentage
- updated_at (timestamptz)
- updated_by (uuid)
```

RLS: Admins can read/update. All authenticated users can read.

### Add triggers for `handle_new_user` and `handle_new_user_wallet`
The database functions exist but triggers are missing. We'll create triggers on `auth.users` to auto-create profiles, roles, and wallets on signup.

---

## 3. KoraPay Payment Edge Function

Create `supabase/functions/initialize-payment/index.ts`:
- Accepts amount + user details
- Calls KoraPay's payment initialization API
- Returns a checkout URL for the user

Create `supabase/functions/payment-webhook/index.ts`:
- Receives KoraPay webhook on successful payment
- Credits the user's wallet
- Implements fee splitting: reads `platform_commission_pct` from `platform_settings`, splits the payment amount between the vendor/restaurant wallet and the platform admin account
- Logs the transaction in `wallet_transactions`

Update `supabase/config.toml` with the new functions (verify_jwt = false for webhook).

---

## 4. Design System & Theme Setup

Update `src/index.css` to use the NexGo gold-and-black color palette as CSS variables. Import Google Fonts (Cormorant Garamond, DM Sans, DM Mono). Add keyframe animations (fadeUp, shimmer, spin, glow, popUp, slideIn, pulse).

Create `src/lib/constants.ts` for the color palette (G object) and the NexGo logo SVG data URL.

Create `src/lib/styles.ts` for shared style helper functions (btn, card, inp).

---

## 5. Shared UI Components

Create reusable components in `src/components/`:

- `STitle.tsx` -- Section title
- `PHeader.tsx` -- Page header with icon
- `Lbl.tsx` -- Uppercase label
- `Chip.tsx` -- Tag chip
- `StatusBadge.tsx` -- Color-coded status badge
- `Spinner.tsx` -- Loading spinner
- `BottomNav.tsx` -- Role-aware bottom navigation with "More" menu
- `DesktopWrapper.tsx` -- Desktop layout with promo panel + phone frame
- `ToastProvider.tsx` -- Toast notification system (can leverage existing sonner)

---

## 6. Authentication Pages

Create `src/pages/Auth.tsx` with real Supabase Auth:
- Login form (email + password) using `supabase.auth.signInWithPassword()`
- Register form (name + email + password + role selection) using `supabase.auth.signUp()` with `raw_user_meta_data: { full_name, role }`
- The `handle_new_user` trigger auto-creates profile, role, and wallet
- Password reset flow with `resetPasswordForEmail()`
- No OTP step (Supabase handles email verification natively)

Create `src/pages/ResetPassword.tsx` for password reset callback.

Create `src/hooks/useAuth.ts` -- auth context with `onAuthStateChange`, session management, role fetching from `user_roles` table.

Create `src/components/ProtectedRoute.tsx` -- redirects unauthenticated users to auth page.

---

## 7. Student Pages (all fetching real data)

- `src/pages/student/Home.tsx` -- Greeting with profile name, wallet balance from `wallets`, recent orders from `orders` + `order_items`, quick action cards
- `src/pages/student/NexChow.tsx` -- Restaurant list from `restaurants` table, search + cuisine filter
- `src/pages/student/RestaurantDetail.tsx` -- Menu items from `menu_items` where `restaurant_id` matches, add to cart (local state)
- `src/pages/student/Checkout.tsx` -- Order summary, delivery address, payment method (wallet or KoraPay). On wallet pay: deduct from `wallets`, insert `orders` + `order_items`, insert `wallet_transactions`. On KoraPay: call `initialize-payment` edge function, redirect to payment page.
- `src/pages/student/NexDispatch.tsx` -- Send form (inserts into `dispatches`), track view (reads own dispatches)
- `src/pages/student/NexTrip.tsx` -- Routes from `trip_routes`, book seat (insert `trip_bookings`, deduct wallet, decrement `seats_available`)
- `src/pages/student/Wallet.tsx` -- Balance from `wallets`, transactions from `wallet_transactions`, fund via KoraPay
- `src/pages/student/Profile.tsx` -- Profile data from `profiles`, order/trip/dispatch counts, settings, logout
- `src/pages/student/Chat.tsx` -- AI chat using the `chat` edge function with streaming

---

## 8. Vendor Pages

- `src/pages/vendor/Dashboard.tsx` -- Today's stats (orders count, revenue) from `orders` where `restaurant_id` matches vendor's restaurant, open/closed toggle (updates `restaurants.is_open`)
- `src/pages/vendor/Orders.tsx` -- Incoming orders from `orders` + `order_items`, status progression (Pending -> Preparing -> Ready -> Done)
- `src/pages/vendor/Menu.tsx` -- CRUD for `menu_items` (add, edit, delete)
- `src/pages/vendor/Earnings.tsx` -- Revenue aggregation from `orders`
- `src/pages/vendor/Profile.tsx` -- Vendor profile, restaurant info, logout

---

## 9. Rider Pages

- `src/pages/rider/Dashboard.tsx` -- Online/offline toggle, active deliveries from `orders` where `rider_id` = current user + `dispatches`, stats
- `src/pages/rider/Deliveries.tsx` -- Accept/complete deliveries, update order/dispatch status
- `src/pages/rider/Earnings.tsx` -- Delivery earnings from completed orders/dispatches
- `src/pages/rider/Profile.tsx` -- Rider profile, vehicle info, logout

---

## 10. Admin Pages

- `src/pages/admin/Dashboard.tsx` -- Platform-wide stats: total users (from `profiles`), orders today, revenue, active riders
- `src/pages/admin/Users.tsx` -- List all users from `profiles` + `user_roles`, search, suspend/activate (update role or add a status field)
- `src/pages/admin/Analytics.tsx` -- Revenue breakdown, weekly activity charts using recharts, service-level stats
- `src/pages/admin/Settings.tsx` -- Fee management: update `platform_settings` (delivery fee, commission %, dispatch fee)
- `src/pages/admin/Profile.tsx` -- Admin profile, logout

---

## 11. Routing Setup

Update `src/App.tsx` with all routes:
- `/` -- Splash screen
- `/auth` -- Login/Register
- `/reset-password` -- Password reset
- `/student/*` -- Student pages (Home, NexChow, Dispatch, Trip, Wallet, Profile, Chat)
- `/vendor/*` -- Vendor pages
- `/rider/*` -- Rider pages
- `/admin/*` -- Admin pages

Each role-group wrapped in `ProtectedRoute` that checks role.

---

## 12. Data Hooks

Create custom hooks in `src/hooks/` using `@tanstack/react-query`:
- `useProfile.ts` -- current user profile
- `useWallet.ts` -- wallet balance + transactions
- `useRestaurants.ts` -- restaurant list
- `useMenuItems.ts` -- menu for a restaurant
- `useOrders.ts` -- orders (scoped by role)
- `useDispatches.ts` -- dispatches
- `useTripRoutes.ts` -- available routes
- `usePlatformSettings.ts` -- fee config

---

## 13. Fee-Splitting Logic

When an order is paid (via wallet or KoraPay webhook):
1. Read `platform_commission_pct` from `platform_settings` (e.g. 10%)
2. `vendor_amount = total_amount * (1 - commission_pct / 100)`
3. `platform_amount = total_amount * (commission_pct / 100)`
4. Credit vendor's wallet with `vendor_amount`
5. Credit admin/platform wallet with `platform_amount`
6. Log both transactions in `wallet_transactions`

This logic lives in the `payment-webhook` edge function and also in a new `process-order-payment` edge function for wallet-based payments.

---

## Technical Notes

- All inline styles from the JSX file will be converted to Tailwind CSS classes with custom theme colors
- The app is mobile-first; desktop gets the phone-frame wrapper
- Real-time updates via Supabase realtime subscriptions for orders (vendor/rider)
- Cart state managed via React context (persisted in localStorage)
- TypeScript throughout -- leveraging the auto-generated Supabase types

