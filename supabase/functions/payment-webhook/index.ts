import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const event = body.event || body.data?.event;
    const data = body.data || body;

    if (event !== "charge.success" && event !== "charge.completed") {
      return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const amount = data.amount || data.data?.amount;
    const userId = data.metadata?.user_id || data.data?.metadata?.user_id;
    if (!amount || !userId) throw new Error("Missing amount or user_id");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get wallet
    const { data: wallet, error: we } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
    if (we || !wallet) throw new Error("Wallet not found");

    // Get platform commission
    const { data: commSetting } = await supabase.from("platform_settings").select("value").eq("key", "platform_commission_pct").single();
    const commissionPct = commSetting?.value ?? 10;

    // If metadata has restaurant context, do fee splitting
    const restaurantId = data.metadata?.restaurant_id || data.data?.metadata?.restaurant_id;
    if (restaurantId) {
      const vendorAmount = Math.floor(amount * (1 - commissionPct / 100));
      const platformAmount = amount - vendorAmount;

      // Credit vendor wallet
      const { data: restaurant } = await supabase.from("restaurants").select("owner_id").eq("id", restaurantId).single();
      if (restaurant) {
        const { data: vendorWallet } = await supabase.from("wallets").select("*").eq("user_id", restaurant.owner_id).single();
        if (vendorWallet) {
          await supabase.from("wallets").update({ balance: vendorWallet.balance + vendorAmount }).eq("id", vendorWallet.id);
          await supabase.from("wallet_transactions").insert({
            user_id: restaurant.owner_id, wallet_id: vendorWallet.id, amount: vendorAmount,
            label: "Order Payment", icon: "💰",
          });
        }
      }

      // Log platform commission (to first admin wallet if exists)
      const { data: adminRole } = await supabase.from("user_roles").select("user_id").eq("role", "admin").limit(1).single();
      if (adminRole) {
        const { data: adminWallet } = await supabase.from("wallets").select("*").eq("user_id", adminRole.user_id).single();
        if (adminWallet) {
          await supabase.from("wallets").update({ balance: adminWallet.balance + platformAmount }).eq("id", adminWallet.id);
          await supabase.from("wallet_transactions").insert({
            user_id: adminRole.user_id, wallet_id: adminWallet.id, amount: platformAmount,
            label: "Platform Commission", icon: "📊",
          });
        }
      }
    } else {
      // Simple wallet top-up
      await supabase.from("wallets").update({ balance: wallet.balance + amount }).eq("id", wallet.id);
      await supabase.from("wallet_transactions").insert({
        user_id: userId, wallet_id: wallet.id, amount,
        label: "Wallet Top-up (KoraPay)", icon: "💳",
      });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Webhook error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
