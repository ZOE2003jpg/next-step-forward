import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOW_BALANCE_THRESHOLD = 500; // ₦500

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find wallets with low balance
    const { data: lowWallets, error } = await supabase
      .from("wallets")
      .select("id, user_id, balance")
      .lt("balance", LOW_BALANCE_THRESHOLD);

    if (error) throw error;

    console.log(`Found ${lowWallets?.length ?? 0} wallets below ₦${LOW_BALANCE_THRESHOLD}`);

    // TODO: When SendGrid is configured, send email alerts to these users
    // For now, log them for the daily report
    if (lowWallets && lowWallets.length > 0) {
      // Get user emails for these wallets
      const userIds = lowWallets.map((w: any) => w.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);

      const alerts = lowWallets.map((w: any) => {
        const profile = profiles?.find((p: any) => p.id === w.user_id);
        return {
          user: profile?.full_name || "Unknown",
          email: profile?.email,
          balance: w.balance,
        };
      });

      console.log("Low balance alerts:", JSON.stringify(alerts));
    }

    return new Response(
      JSON.stringify({ success: true, alertCount: lowWallets?.length ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("wallet-alerts error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
