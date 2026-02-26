import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useWallet() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wallet", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("wallets").select("*").eq("user_id", user!.id).single();
      if (error) throw error;
      return data;
    },
  });
}

export function useWalletTransactions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wallet-transactions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

export function useFundWallet() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (amount: number) => {
      // Get wallet
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", user!.id).single();
      if (!wallet) throw new Error("Wallet not found");
      // Update balance
      const { error: ue } = await supabase.from("wallets").update({ balance: wallet.balance + amount }).eq("id", wallet.id);
      if (ue) throw ue;
      // Log transaction
      const { error: te } = await supabase.from("wallet_transactions").insert({
        user_id: user!.id,
        wallet_id: wallet.id,
        amount,
        label: "Wallet Top-up",
        icon: "💳",
      });
      if (te) throw te;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["wallet-transactions"] });
    },
  });
}
