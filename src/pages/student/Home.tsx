import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useWallet } from "@/hooks/useWallet";
import { useStudentOrders } from "@/hooks/useOrders";
import { STitle } from "@/components/STitle";
import { StatusBadge } from "@/components/StatusBadge";
import { format } from "date-fns";

export default function StudentHome({ setTab }: { setTab: (t: string) => void }) {
  const { data: profile } = useProfile();
  const { data: wallet } = useWallet();
  const { data: orders } = useStudentOrders();

  const firstName = profile?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 px-4 flex flex-col gap-6 animate-fade-up">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-muted-foreground text-[13px]">{greeting},</div>
          <div className="font-display text-[34px] font-bold text-foreground leading-tight">{firstName} 👋</div>
        </div>
        <div onClick={() => setTab("wallet")} className="bg-card border border-border rounded-xl py-2.5 px-4 text-right cursor-pointer hover-gold transition-all">
          <div className="text-[10px] text-muted-foreground tracking-wider">WALLET</div>
          <div className="text-base font-bold text-primary font-mono-dm">₦{(wallet?.balance ?? 0).toLocaleString()}</div>
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
          {(!orders || orders.length === 0) && (
            <div className="bg-card border border-border rounded-2xl p-5 text-center text-muted-foreground text-sm">No orders yet</div>
          )}
          {orders?.slice(0, 5).map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm text-foreground">
                  {o.order_items?.map((i: any) => i.name).join(", ") || "Order"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {o.order_number} · {format(new Date(o.created_at), "MMM d, h:mm a")}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary font-mono-dm text-[13px]">₦{o.total_amount.toLocaleString()}</div>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
