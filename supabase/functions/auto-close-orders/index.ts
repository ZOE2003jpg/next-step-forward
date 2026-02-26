import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Auto-close orders that have been "Pending" for more than 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: staleOrders, error: fetchErr } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq("status", "Pending")
      .lt("created_at", cutoff);

    if (fetchErr) throw fetchErr;

    if (staleOrders && staleOrders.length > 0) {
      const ids = staleOrders.map((o: any) => o.id);
      const { error: updateErr } = await supabase
        .from("orders")
        .update({ status: "Cancelled", updated_at: new Date().toISOString() })
        .in("id", ids);

      if (updateErr) throw updateErr;

      console.log(`Auto-closed ${staleOrders.length} stale orders`);
    } else {
      console.log("No stale orders to close");
    }

    // Also auto-close stale dispatches (Pending > 24h)
    const { data: staleDispatches, error: dFetchErr } = await supabase
      .from("dispatches")
      .select("id, dispatch_number")
      .eq("status", "Pending")
      .lt("created_at", cutoff);

    if (dFetchErr) throw dFetchErr;

    if (staleDispatches && staleDispatches.length > 0) {
      const ids = staleDispatches.map((d: any) => d.id);
      const { error: dUpdateErr } = await supabase
        .from("dispatches")
        .update({ status: "Cancelled" })
        .in("id", ids);

      if (dUpdateErr) throw dUpdateErr;
      console.log(`Auto-closed ${staleDispatches.length} stale dispatches`);
    }

    return new Response(
      JSON.stringify({ success: true, closedOrders: staleOrders?.length ?? 0, closedDispatches: staleDispatches?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("auto-close error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
