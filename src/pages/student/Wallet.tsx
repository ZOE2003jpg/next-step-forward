import { useState } from "react";
import { useWallet, useWalletTransactions, useFundWallet } from "@/hooks/useWallet";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { PHeader } from "@/components/PHeader";
import { STitle } from "@/components/STitle";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Wallet() {
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: txns, isLoading: txnsLoading } = useWalletTransactions();
  const { data: profile } = useProfile();
  const { user } = useAuth();
  const fundWallet = useFundWallet();
  const [amt, setAmt] = useState("");
  const [payMethod, setPayMethod] = useState<"direct" | "korapay">("direct");
  const [fundingLoading, setFundingLoading] = useState(false);

  const fund = async () => {
    const v = parseInt(amt);
    if (isNaN(v) || v <= 0) { toast.error("Enter a valid amount"); return; }

    if (payMethod === "korapay") {
      setFundingLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("initialize-payment", {
          body: {
            amount: v,
            email: user?.email,
            name: profile?.full_name || "NexGo User",
            user_id: user?.id,
            metadata: {},
          },
        });
        if (error) throw error;
        if (!data?.checkout_url) throw new Error("Failed to initialize payment");
        window.open(data.checkout_url, "_blank");
        toast.success("KoraPay checkout opened in new tab");
      } catch (e: any) {
        toast.error(e.message || "Payment initialization failed");
      }
      setFundingLoading(false);
      return;
    }

    // Direct wallet funding (dev/test mode)
    try {
      await fundWallet.mutateAsync(v);
      setAmt("");
      toast.success(`₦${v.toLocaleString()} added!`);
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
      <PHeader title="NexWallet" sub="Your campus money" icon="💳" />
      <div className="gradient-gold-subtle rounded-[22px] py-8 px-6 text-center relative overflow-hidden">
        <div className="absolute -right-[30px] -top-[30px] w-[140px] h-[140px] rounded-full bg-white/10" />
        <div className="absolute -left-5 -bottom-5 w-[100px] h-[100px] rounded-full bg-white/[0.06]" />
        <div className="text-xs text-primary-foreground/70 tracking-widest uppercase mb-2">Total Balance</div>
        {walletLoading ? (
          <div className="flex justify-center py-4"><Spinner size={28} /></div>
        ) : (
          <div className="font-display text-[52px] font-bold text-primary-foreground leading-none">₦{(wallet?.balance ?? 0).toLocaleString()}</div>
        )}
        <div className="text-[13px] text-primary-foreground/60 mt-2">{profile?.full_name}</div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <STitle>Fund Wallet</STitle>
        <div className="flex gap-2 mt-3 mb-3 flex-wrap">
          {[500, 1000, 2000, 5000].map((v) => (
            <button key={v} onClick={() => setAmt(String(v))} className={`py-2 px-3.5 rounded-[20px] text-[13px] font-semibold border cursor-pointer transition-all ${amt === String(v) ? "bg-[hsl(var(--gold-glow))] border-primary text-primary" : "bg-secondary border-border text-muted-foreground"}`}>
              ₦{v.toLocaleString()}
            </button>
          ))}
        </div>
        <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary mb-3" type="number" placeholder="Enter amount…" value={amt} onChange={(e) => setAmt(e.target.value)} />

        <div className="flex flex-col gap-2 mb-3">
          {[
            { id: "korapay" as const, label: "Pay with KoraPay", sub: "Card, bank transfer, USSD", icon: "🏦" },
            { id: "direct" as const, label: "Direct Fund (Test)", sub: "Instant credit for testing", icon: "⚡" },
          ].map((m) => (
            <div key={m.id} onClick={() => setPayMethod(m.id)} className={`p-3 rounded-[10px] border-2 cursor-pointer flex gap-3 items-center transition-all ${payMethod === m.id ? "border-primary bg-[hsl(var(--gold-glow))]" : "border-border bg-secondary"}`}>
              <span className="text-xl">{m.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-foreground text-sm">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.sub}</div>
              </div>
              {payMethod === m.id && <span className="text-primary text-xl">✓</span>}
            </div>
          ))}
        </div>

        <button onClick={fund} disabled={fundWallet.isPending || fundingLoading} className="w-full py-3 gradient-gold-subtle rounded-[10px] text-primary-foreground font-semibold text-sm cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-2">
          {(fundWallet.isPending || fundingLoading) ? <><Spinner /> Processing…</> : "Fund Wallet →"}
        </button>
      </div>

      <div>
        <STitle>Transactions</STitle>
        <div className="flex flex-col gap-2.5 mt-3">
          {txnsLoading && <div className="flex justify-center py-6"><Spinner /></div>}
          {!txnsLoading && (!txns || txns.length === 0) && <div className="text-muted-foreground text-sm text-center py-4">No transactions yet</div>}
          {txns?.map((tx) => (
            <div key={tx.id} className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">{tx.icon}</div>
                <div>
                  <div className="font-semibold text-[13px] text-foreground">{tx.label}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className={`font-bold font-mono-dm text-sm ${tx.amount > 0 ? "text-[hsl(var(--success))]" : "text-destructive"}`}>
                {tx.amount > 0 ? "+" : ""}₦{Math.abs(tx.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
