import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRiderOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useRiderDispatches, useUpdateDispatchStatus } from "@/hooks/useDispatches";
import { PHeader } from "@/components/PHeader";
import { STitle } from "@/components/STitle";
import { StatusBadge } from "@/components/StatusBadge";
import { useNavigate } from "react-router-dom";

export default function RiderApp({ tab }: { tab: string }) {
  const { user, signOut } = useAuth();
  const { data: orders } = useRiderOrders();
  const { data: dispatches } = useRiderDispatches();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateDispatchStatus = useUpdateDispatchStatus();
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);

  const allDeliveries = [
    ...(orders || []).map((o) => ({ id: o.id, type: "order" as const, pickup: "Restaurant", dropoff: o.delivery_address || "N/A", amount: o.delivery_fee, status: o.status, number: o.order_number })),
    ...(dispatches || []).map((d) => ({ id: d.id, type: "dispatch" as const, pickup: d.pickup_location, dropoff: d.dropoff_location, amount: d.fee, status: d.status, number: d.dispatch_number })),
  ];

  const active = allDeliveries.filter((d) => d.status !== "Done" && d.status !== "Delivered");
  const done = allDeliveries.filter((d) => d.status === "Done" || d.status === "Delivered");

  if (tab === "earnings") {
    const totalEarnings = done.reduce((a, d) => a + d.amount, 0);
    return (
      <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up">
        <PHeader title="Earnings" sub="Your delivery income" icon="💰" />
        <div className="gradient-gold-subtle rounded-[20px] py-7 px-6 text-center relative overflow-hidden">
          <div className="absolute -right-5 -top-5 w-[120px] h-[120px] rounded-full bg-white/10" />
          <div className="text-xs text-primary-foreground/70 tracking-widest uppercase mb-2">Total Earnings</div>
          <div className="font-display text-5xl font-bold text-primary-foreground">₦{totalEarnings.toLocaleString()}</div>
          <div className="text-[13px] text-primary-foreground/60 mt-1.5">{done.length} deliveries completed</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: "NexChow", v: String(done.filter((d) => d.type === "order").length) },
            { l: "NexDispatch", v: String(done.filter((d) => d.type === "dispatch").length) },
          ].map((s) => (
            <div key={s.l} className="bg-card border border-border rounded-2xl p-4">
              <div className="font-mono-dm text-xl font-bold text-primary">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "profile") {
    return (
      <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up">
        <div className="text-center pt-2.5">
          <div className="w-20 h-20 rounded-full gradient-gold mx-auto mb-3.5 flex items-center justify-center text-4xl font-bold text-primary-foreground">
            {user?.user_metadata?.full_name?.[0]?.toUpperCase() || "R"}
          </div>
          <div className="font-display text-[28px] font-bold text-foreground">{user?.user_metadata?.full_name || "Rider"}</div>
          <div className="text-muted-foreground text-[13px] mt-0.5">{user?.email}</div>
          <div className="text-primary text-xs mt-1 font-mono-dm">Rider</div>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {["Vehicle Info", "Bank Account", "Availability Schedule", "Notifications", "Help"].map((item, i, arr) => (
            <div key={item} className={`flex justify-between items-center py-3.5 px-5 cursor-pointer ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
              <span className="text-foreground font-medium text-sm">{item}</span>
              <span className="text-muted-foreground">›</span>
            </div>
          ))}
        </div>
        <button onClick={async () => { await signOut(); navigate("/auth"); }} className="w-full py-3.5 bg-transparent border border-destructive/40 text-destructive rounded-[10px] font-semibold text-sm cursor-pointer">Sign Out</button>
      </div>
    );
  }

  // Dashboard (rdashboard + deliveries)
  return (
    <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-muted-foreground text-[13px]">Rider Dashboard</div>
          <div className="font-display text-[30px] font-bold text-foreground">{user?.user_metadata?.full_name || "Rider"} 🏍️</div>
        </div>
        <div onClick={() => setOnline((o) => !o)} className={`rounded-[20px] py-2 px-4 cursor-pointer text-xs font-bold transition-all border ${online ? "bg-[hsl(var(--success)/0.13)] border-[hsl(var(--success))] text-[hsl(var(--success))]" : "bg-secondary border-border text-muted-foreground"}`}>
          {online ? "🟢 Online" : "⚫ Offline"}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: String(allDeliveries.length), l: "Deliveries" },
          { v: `₦${done.reduce((a, d) => a + d.amount, 0).toLocaleString()}`, l: "Earnings" },
          { v: "-", l: "Rating" },
        ].map((s) => (
          <div key={s.l} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="font-mono-dm text-lg font-bold text-primary">{s.v}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
      <STitle>Active Deliveries</STitle>
      {active.map((d) => (
        <div key={d.id} className={`bg-card rounded-2xl p-5 border ${d.status === "Active" ? "border-primary" : "border-border"}`}>
          <div className="flex justify-between mb-3">
            <span className="font-bold text-foreground">{d.number}</span>
            <StatusBadge status={d.status} />
          </div>
          <div className="flex flex-col gap-1 mb-3">
            <div className="text-[13px] text-muted-foreground">📍 Pickup: <span className="text-foreground">{d.pickup}</span></div>
            <div className="text-[13px] text-muted-foreground">🏠 Drop: <span className="text-foreground">{d.dropoff}</span></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-primary font-mono-dm font-bold text-base">+₦{d.amount}</span>
            {d.status === "Pending" && (
              <button onClick={() => d.type === "order" ? updateOrderStatus.mutate({ id: d.id, status: "Active" }) : updateDispatchStatus.mutate({ id: d.id, status: "Active" })} className="gradient-gold-subtle py-2 px-4 rounded-lg text-primary-foreground text-[13px] font-semibold cursor-pointer border-none">Accept</button>
            )}
            {(d.status === "Active" || d.status === "In Transit") && (
              <button onClick={() => d.type === "order" ? updateOrderStatus.mutate({ id: d.id, status: "Done" }) : updateDispatchStatus.mutate({ id: d.id, status: "Delivered" })} className="gradient-gold-subtle py-2 px-4 rounded-lg text-primary-foreground text-[13px] font-semibold cursor-pointer border-none">Complete ✓</button>
            )}
          </div>
        </div>
      ))}
      {active.length === 0 && <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">No active deliveries</div>}
      {done.slice(0, 3).map((d) => (
        <div key={d.id} className="bg-card border border-border rounded-2xl p-5 flex justify-between opacity-45">
          <span className="text-foreground text-[13px]">{d.number} · Done</span>
          <StatusBadge status="Done" />
        </div>
      ))}
    </div>
  );
}
