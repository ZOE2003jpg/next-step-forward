import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { useStudentOrders, useCancelOrder, useDisputeOrder } from "@/hooks/useOrders";
import { STitle } from "@/components/STitle";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentHome({ setTab }: { setTab: (t: string) => void }) {
  const { data: profile } = useProfile();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: orders, isLoading: ordersLoading } = useStudentOrders();
  const cancelOrder = useCancelOrder();
  const disputeOrder = useDisputeOrder();
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const handleDispute = async () => {
    if (!disputeId || !disputeReason) { toast.error("Enter a reason"); return; }
    try {
      await disputeOrder.mutateAsync({ orderId: disputeId, reason: disputeReason });
      toast.success("Dispute submitted");
      setDisputeId(null);
      setDisputeReason("");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 px-4 flex flex-col gap-6 animate-fade-up max-w-[800px] mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-muted-foreground text-[13px]">{greeting},</div>
          <div className="font-display text-[34px] font-bold text-foreground leading-tight">{firstName} 👋</div>
        </div>
        <div onClick={() => setTab("wallet")} className="bg-card border border-border rounded-xl py-2.5 px-4 text-right cursor-pointer hover-gold transition-all">
          <div className="text-[10px] text-muted-foreground tracking-wider">WALLET</div>
          {walletLoading ? <Spinner /> : (
            <div className="text-base font-bold text-primary font-mono-dm">₦{(wallet?.balance ?? 0).toLocaleString()}</div>
          )}
        </div>
      </div>

      <div onClick={() => setTab("chow")} className="gradient-gold-subtle rounded-[20px] p-6 relative overflow-hidden cursor-pointer">
        <div className="absolute -right-[30px] -top-[30px] w-[140px] h-[140px] rounded-full bg-white/[0.08]" />
        <div className="text-[11px] font-bold text-primary-foreground/70 tracking-widest uppercase mb-2">🎉 Today Only</div>
        <div className="text-[22px] font-bold text-primary-foreground mb-1.5">Free delivery on NexChow!</div>
        <div className="text-[13px] text-primary-foreground/70">Order any meal, zero delivery fee</div>
      </div>

      <div>
        <STitle>Quick Actions</STitle>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {[
            { icon: "🍽️", label: "NexChow", sub: "Food & drinks", tab: "chow" },
            { icon: "📦", label: "Dispatch", sub: "Send packages", tab: "dispatch" },
            { icon: "🚌", label: "NexTrip", sub: "Campus rides", tab: "trip" },
          ].map((a) => (
            <div key={a.label} onClick={() => setTab(a.tab)} className="bg-card border border-border rounded-2xl text-center cursor-pointer p-4 hover-gold transition-all">
              <div className="text-[30px] mb-1.5">{a.icon}</div>
              <div className="font-bold text-[13px] text-foreground">{a.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{a.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <STitle>Recent Orders</STitle>
          <span className="text-xs text-primary cursor-pointer">See all</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {ordersLoading && <div className="flex justify-center py-6"><Spinner /></div>}
          {!ordersLoading && (!orders || orders.length === 0) && (
            <div className="bg-card border border-border rounded-2xl p-5 text-center text-muted-foreground text-sm">No orders yet. Try NexChow! 🍽️</div>
          )}
          {orders?.slice(0, 5).map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-sm text-foreground">
                    {o.order_items?.map((i: any) => i.name).join(", ") || "Order"}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {o.order_number} · {format(new Date(o.created_at), "MMM d, h:mm a")}
                  </div>
                  {o.status === "out_for_delivery" && (o as any).delivery_otp && (
                    <div className="text-xs text-primary font-mono-dm mt-1">OTP: {(o as any).delivery_otp}</div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary font-mono-dm text-[13px]">₦{o.total_amount.toLocaleString()}</div>
                  <StatusBadge status={o.status} />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {o.status === "pending" && (
                  <button
                    onClick={() => cancelOrder.mutate({ orderId: o.id }, { onSuccess: () => toast.success("Order cancelled & refunded"), onError: (e) => toast.error(e.message) })}
                    disabled={cancelOrder.isPending}
                    className="bg-transparent border border-destructive/40 text-destructive py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-70"
                  >Cancel</button>
                )}
                {o.status === "delivered" && (
                  <button
                    onClick={() => setDisputeId(o.id)}
                    className="bg-transparent border border-primary/40 text-primary py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                  >Dispute</button>
                )}
              </div>
              {disputeId === o.id && (
                <div className="mt-3 flex flex-col gap-2">
                  <input
                    className="w-full p-2.5 bg-secondary border border-border rounded-lg text-foreground text-sm outline-none"
                    placeholder="Describe the issue…"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleDispute} disabled={disputeOrder.isPending} className="gradient-gold-subtle py-1.5 px-3 rounded-lg text-primary-foreground text-xs font-semibold cursor-pointer border-none disabled:opacity-70">
                      {disputeOrder.isPending ? <Spinner /> : "Submit"}
                    </button>
                    <button onClick={() => setDisputeId(null)} className="bg-secondary text-foreground border border-border rounded-lg py-1.5 px-3 text-xs cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
