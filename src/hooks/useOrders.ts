import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export function useStudentOrders() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("student-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `student_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["student-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, qc]);

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
  const qc = useQueryClient();

  // Real-time subscription for vendor
  useEffect(() => {
    if (!restaurantId) return;
    const channel = supabase
      .channel("vendor-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` }, () => {
        qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurantId, qc]);

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
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("rider-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `rider_id=eq.${user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["rider-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, qc]);

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

// Rider: get all "ready" orders available for pickup (no rider assigned yet)
export function useAvailableOrders() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("available-orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        qc.invalidateQueries({ queryKey: ["available-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return useQuery({
    queryKey: ["available-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("status", "ready")
        .is("rider_id", null)
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

// Validated order status update using backend function
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // Validate transition server-side
      const { data: validation, error: ve } = await supabase.rpc("validate_order_transition", {
        _order_id: id,
        _new_status: status,
        _user_id: user!.id,
      });
      if (ve) throw ve;
      const result = validation as any;
      if (!result?.valid) throw new Error(result?.message || "Invalid status transition");

      // If transitioning to out_for_delivery, generate OTP
      if (status === "out_for_delivery") {
        await supabase.rpc("generate_delivery_otp", { _order_id: id });
      }

      const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      qc.invalidateQueries({ queryKey: ["rider-orders"] });
      qc.invalidateQueries({ queryKey: ["student-orders"] });
      qc.invalidateQueries({ queryKey: ["available-orders"] });
    },
  });
}

// Accept order as rider (atomic - prevents double acceptance)
export function useAcceptOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (orderId: string) => {
      // Atomic update: only assign if rider_id is null
      const { data, error } = await supabase
        .from("orders")
        .update({ rider_id: user!.id, status: "out_for_delivery", updated_at: new Date().toISOString() })
        .eq("id", orderId)
        .is("rider_id", null)
        .eq("status", "ready")
        .select()
        .single();
      if (error || !data) throw new Error("Order already accepted by another rider");

      // Generate OTP
      await supabase.rpc("generate_delivery_otp", { _order_id: orderId });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rider-orders"] });
      qc.invalidateQueries({ queryKey: ["available-orders"] });
      qc.invalidateQueries({ queryKey: ["student-orders"] });
    },
  });
}

// Verify OTP and mark as delivered
export function useDeliverWithOTP() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, otp }: { orderId: string; otp: string }) => {
      const { data: valid, error: ve } = await supabase.rpc("verify_delivery_otp", {
        _order_id: orderId,
        _otp: otp,
      });
      if (ve) throw ve;
      if (!valid) throw new Error("Invalid or expired OTP");

      const { error } = await supabase.from("orders").update({ status: "delivered", updated_at: new Date().toISOString() }).eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rider-orders"] });
      qc.invalidateQueries({ queryKey: ["student-orders"] });
    },
  });
}

// Cancel order with refund logic
export function useCancelOrder() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason?: string }) => {
      // Validate
      const { data: validation, error: ve } = await supabase.rpc("validate_order_transition", {
        _order_id: orderId,
        _new_status: "cancelled",
        _user_id: user!.id,
      });
      if (ve) throw ve;
      if (!validation?.valid) throw new Error(validation?.message || "Cannot cancel this order");

      // Get order details for refund
      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (!order) throw new Error("Order not found");

      // Cancel order
      const { error } = await supabase.from("orders").update({
        status: "cancelled",
        cancellation_reason: reason || "Cancelled by user",
        cancelled_by: user!.id,
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);
      if (error) throw error;

      // Refund wallet if paid by wallet and not yet preparing
      if (order.payment_method === "wallet" && ["pending", "accepted"].includes(result.current_status)) {
        const refundAmount = order.total_amount;
        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", order.student_id).single();
        if (wallet) {
          await supabase.from("wallets").update({ balance: wallet.balance + refundAmount }).eq("id", wallet.id);
          await supabase.from("wallet_transactions").insert({
            user_id: order.student_id,
            wallet_id: wallet.id,
            amount: refundAmount,
            label: `Refund ${order.order_number}`,
            icon: "↩️",
          });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-orders"] });
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}

// Dispute an order
export function useDisputeOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).single();
      if (!order) throw new Error("Order not found");
      if (order.status !== "delivered") throw new Error("Can only dispute delivered orders");

      // Check 30 minute window
      const deliveredAt = new Date(order.updated_at);
      const now = new Date();
      if (now.getTime() - deliveredAt.getTime() > 30 * 60 * 1000) {
        throw new Error("Dispute window has closed (30 minutes)");
      }

      const { error } = await supabase.from("orders").update({
        status: "under_review",
        disputed_at: new Date().toISOString(),
        dispute_reason: reason,
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
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
      const paymentRef = `NXG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      // Deduct wallet first if paying by wallet (atomic check)
      if (params.paymentMethod === "wallet") {
        const total = params.totalAmount + params.deliveryFee;
        const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user!.id).single();
        if (!wallet || wallet.balance < total) throw new Error("Insufficient wallet balance");
        
        const { error: wErr } = await supabase.from("wallets").update({ balance: wallet.balance - total }).eq("id", wallet.id);
        if (wErr) throw wErr;
        
        await supabase.from("wallet_transactions").insert({
          user_id: user!.id, wallet_id: wallet.id, amount: -total,
          label: `NexChow ${orderNumber}`, icon: "🍽️",
        });
      }

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
          payment_reference: paymentRef,
        })
        .select()
        .single();
      if (oe) throw oe;

      const { error: ie } = await supabase.from("order_items").insert(
        params.items.map((i) => ({ ...i, order_id: order.id }))
      );
      if (ie) throw ie;

      return order;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-orders"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}
