import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { amount, email, name, user_id, metadata } = await req.json();
    const KORAPAY_SECRET = Deno.env.get("KORAPAY_SECRET_KEY");
    if (!KORAPAY_SECRET) throw new Error("KoraPay key not configured");

    const reference = `NXG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const res = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KORAPAY_SECRET}` },
      body: JSON.stringify({
        amount,
        currency: "NGN",
        reference,
        customer: { name: name || "NexGo User", email },
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payment-webhook`,
        metadata: { user_id, ...metadata },
      }),
    });

    const data = await res.json();
    if (!data.data?.checkout_url) throw new Error(data.message || "Failed to initialize payment");

    return new Response(JSON.stringify({ checkout_url: data.data.checkout_url, reference }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
