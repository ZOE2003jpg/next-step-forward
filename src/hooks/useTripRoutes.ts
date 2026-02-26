import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useTripRoutes() {
  return useQuery({
    queryKey: ["trip-routes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trip_routes").select("*").eq("active", true);
      if (error) throw error;
      return data;
    },
  });
}

export function useBookTrip() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: { route_id: string; price: number }) => {
      const boardingCode = `NX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const { error: be } = await supabase.from("trip_bookings").insert({
        student_id: user!.id, route_id: params.route_id, boarding_code: boardingCode,
      });
      if (be) throw be;

      // Decrement seats
      const { data: route } = await supabase.from("trip_routes").select("seats_available").eq("id", params.route_id).single();
      if (route) {
        await supabase.from("trip_routes").update({ seats_available: Math.max(0, route.seats_available - 1) }).eq("id", params.route_id);
      }

      // Deduct wallet
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user!.id).single();
      if (wallet && wallet.balance >= params.price) {
        await supabase.from("wallets").update({ balance: wallet.balance - params.price }).eq("id", wallet.id);
        await supabase.from("wallet_transactions").insert({
          user_id: user!.id, wallet_id: wallet.id, amount: -params.price,
          label: "NexTrip Booking", icon: "🚌",
        });
      }

      return boardingCode;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trip-routes"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}
