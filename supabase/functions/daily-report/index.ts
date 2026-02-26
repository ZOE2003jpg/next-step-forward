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

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Count orders from last 24h
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday);

    const { count: completedOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday)
      .eq("status", "Delivered");

    const { count: cancelledOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday)
      .eq("status", "Cancelled");

    // Count dispatches from last 24h
    const { count: totalDispatches } = await supabase
      .from("dispatches")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday);

    // Count trip bookings from last 24h
    const { count: totalBookings } = await supabase
      .from("trip_bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday);

    // Revenue from orders (last 24h)
    const { data: revenueData } = await supabase
      .from("orders")
      .select("total_amount, delivery_fee")
      .gte("created_at", yesterday)
      .eq("status", "Delivered");

    const totalRevenue = revenueData?.reduce(
      (sum: number, o: any) => sum + (o.total_amount || 0) + (o.delivery_fee || 0),
      0
    ) ?? 0;

    // New users (last 24h)
    const { count: newUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday);

    const report = {
      date: new Date().toISOString().split("T")[0],
      orders: { total: totalOrders, completed: completedOrders, cancelled: cancelledOrders },
      dispatches: totalDispatches,
      tripBookings: totalBookings,
      revenue: totalRevenue,
      newUsers,
    };

    console.log("Daily report:", JSON.stringify(report));

    // TODO: When SendGrid is configured, email this report to admins

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("daily-report error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
