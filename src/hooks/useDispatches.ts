import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useStudentDispatches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["student-dispatches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatches")
        .select("*")
        .eq("student_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRiderDispatches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["rider-dispatches", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatches")
        .select("*")
        .eq("rider_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDispatch() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (params: { pickup_location: string; dropoff_location: string; package_description: string; fee: number }) => {
      const dispatchNumber = `#DP${String(Date.now()).slice(-4)}`;
      const { data, error } = await supabase
        .from("dispatches")
        .insert({ ...params, student_id: user!.id, dispatch_number: dispatchNumber })
        .select()
        .single();
      if (error) throw error;

      // Deduct wallet
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user!.id).single();
      if (wallet && wallet.balance >= params.fee) {
        await supabase.from("wallets").update({ balance: wallet.balance - params.fee }).eq("id", wallet.id);
        await supabase.from("wallet_transactions").insert({
          user_id: user!.id, wallet_id: wallet.id, amount: -params.fee,
          label: `NexDispatch ${dispatchNumber}`, icon: "📦",
        });
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["student-dispatches"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}

export function useUpdateDispatchStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("dispatches").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rider-dispatches"] });
      qc.invalidateQueries({ queryKey: ["student-dispatches"] });
    },
  });
}
