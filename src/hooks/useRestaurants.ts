import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useRestaurants() {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurants").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useMyRestaurant(ownerId?: string) {
  return useQuery({
    queryKey: ["my-restaurant", ownerId],
    enabled: !!ownerId,
    queryFn: async () => {
      const { data, error } = await supabase.from("restaurants").select("*").eq("owner_id", ownerId!).single();
      if (error) throw error;
      return data;
    },
  });
}
