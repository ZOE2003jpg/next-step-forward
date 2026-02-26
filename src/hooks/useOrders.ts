import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useStudentOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

export function useVendorOrders(restaurantId?: string) {
  return useQuery({
    queryKey: ["vendor-orders", restaurantId],
    enabled: !!restaurantId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRiderOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["rider-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("rider_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      qc.invalidateQueries({ queryKey: ["rider-orders"] });
      qc.invalidateQueries({ queryKey: ["student-orders"] });
    },
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: {
      restaurantId: string;
      items: { menu_item_id: string; name: string; price: number; quantity: number }[];
      totalAmount: number;
      deliveryFee: number;
      deliveryAddress: string;
      paymentMethod: string;
    }) => {
      const orderNumber = `#NX${String(Date.now()).slice(-6)}`;
      const { data: order, error: oe } = await supabase
        .from("orders")
        .insert({
          student_id: user!.id,
          restaurant_id: params.restaurantId,
          order_number: orderNumber,
          total_amount: params.totalAmount + params.deliveryFee,
          delivery_fee: params.deliveryFee,
          delivery_address: params.deliveryAddress,
          payment_method: params.paymentMethod,
        })
        .select()
        .single();
      if (oe) throw oe;

      const { error: ie } = await supabase.from("order_items").insert(
        params.items.map((i) => ({ ...i, order_id: order.id }))
      );
      if (ie) throw ie;

      // Deduct wallet if paying by wallet
      if (params.paymentMethod === "wallet") {
        const total = params.totalAmount + params.deliveryFee;
        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user!.id).single();
        if (!wallet || wallet.balance < total) throw new Error("Insufficient wallet balance");
        await supabase.from("wallets").update({ balance: wallet.balance - total }).eq("id", wallet.id);
        await supabase.from("wallet_transactions").insert({
          user_id: user!.id,
          wallet_id: wallet.id,
          amount: -total,
          label: `NexChow ${orderNumber}`,
          icon: "🍽️",
        });
      }

      return order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-orders"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}
