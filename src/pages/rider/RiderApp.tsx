import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRiderOrders, useUpdateOrderStatus, useAcceptOrder, useDeliverWithOTP, useAvailableOrders } from "@/hooks/useOrders";
import { useRiderDispatches, useUpdateDispatchStatus } from "@/hooks/useDispatches";
import { PHeader } from "@/components/PHeader";
import { STitle } from "@/components/STitle";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function RiderApp({ tab }: { tab: string }) {
  const { user, signOut } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useRiderOrders();
  const { data: availableOrders } = useAvailableOrders();
  const { data: dispatches } = useRiderDispatches();
  const updateOrderStatus = useUpdateOrderStatus();
  const updateDispatchStatus = useUpdateDispatchStatus();
  const acceptOrder = useAcceptOrder();
  const deliverWithOTP = useDeliverWithOTP();
  const navigate = useNavigate();
  const [online, setOnline] = useState(true);
  const [otpInput, setOtpInput] = useState<Record<string, string>>({});

  const allDeliveries = [
    ...(orders || []).map((o) => ({ id: o.id, type: "order" as const, pickup: "Restaurant", dropoff: o.delivery_address || "N/A", amount: o.delivery_fee, status: o.status, number: o.order_number })),
    ...(dispatches || []).map((d) => ({ id: d.id, type: "dispatch" as const, pickup: d.pickup_location, dropoff: d.dropoff_location, amount: d.fee, status: d.status, number: d.dispatch_number })),
  ];

  const active = allDeliveries.filter((d) => !["delivered", "Done", "Delivered", "cancelled"].includes(d.status));
  const done = allDeliveries.filter((d) => ["delivered", "Done", "Delivered"].includes(d.status));

  if (tab === "earnings") {
    const totalEarnings = done.reduce((a, d) => a + d.amount, 0);
    return (
      <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
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
      <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
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

  // Dashboard + deliveries
  return (
    <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
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
          { v: String(done.length), l: "Completed" },
        ].map((s) => (
          <div key={s.l} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="font-mono-dm text-lg font-bold text-primary">{s.v}</div>
            <div className="text-[11px] text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Available orders to accept */}
      {availableOrders && availableOrders.length > 0 && (
        <>
          <STitle>🔔 Available Orders</STitle>
          {availableOrders.map((o) => (
            <div key={o.id} className="bg-card rounded-2xl p-5 border border-primary animate-pulse-scale">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-foreground">{o.order_number}</span>
                <StatusBadge status="ready" />
              </div>
              <div className="text-[13px] text-muted-foreground mb-1">📍 Drop: {o.delivery_address || "Campus"}</div>
              <div className="text-[13px] text-muted-foreground mb-3">{o.order_items?.map((i: any) => i.name).join(", ")}</div>
              <div className="flex justify-between items-center">
                <span className="text-primary font-mono-dm font-bold">+₦{o.delivery_fee}</span>
                <button
                  onClick={() => acceptOrder.mutate(o.id, { onSuccess: () => toast.success("Order accepted!"), onError: (e) => toast.error(e.message) })}
                  disabled={acceptOrder.isPending}
                  className="gradient-gold-subtle py-2 px-4 rounded-lg text-primary-foreground text-[13px] font-semibold cursor-pointer border-none disabled:opacity-70"
                >{acceptOrder.isPending ? <Spinner /> : "Accept Delivery"}</button>
              </div>
            </div>
          ))}
        </>
      )}

      <STitle>Active Deliveries</STitle>
      {ordersLoading && <div className="flex justify-center py-4"><Spinner /></div>}
      {active.map((d) => (
        <div key={d.id} className={`bg-card rounded-2xl p-5 border ${d.status === "out_for_delivery" ? "border-primary" : "border-border"}`}>
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
            {d.type === "order" && d.status === "out_for_delivery" && (
              <div className="flex gap-2 items-center">
                <input
                  className="w-24 p-2 bg-secondary border border-border rounded-lg text-foreground text-sm text-center outline-none"
                  placeholder="OTP"
                  value={otpInput[d.id] || ""}
                  onChange={(e) => setOtpInput({ ...otpInput, [d.id]: e.target.value })}
                />
                <button
                  onClick={() => deliverWithOTP.mutate({ orderId: d.id, otp: otpInput[d.id] || "" }, { onSuccess: () => { toast.success("Delivered!"); setOtpInput({}); }, onError: (e) => toast.error(e.message) })}
                  disabled={deliverWithOTP.isPending}
                  className="gradient-gold-subtle py-2 px-3 rounded-lg text-primary-foreground text-[13px] font-semibold cursor-pointer border-none disabled:opacity-70"
                >{deliverWithOTP.isPending ? <Spinner /> : "Deliver ✓"}</button>
              </div>
            )}
            {d.type === "dispatch" && (d.status === "Active" || d.status === "In Transit" || d.status === "Pending") && (
              <button
                onClick={() => updateDispatchStatus.mutate({ id: d.id, status: d.status === "Pending" ? "Active" : "Delivered" })}
                className="gradient-gold-subtle py-2 px-4 rounded-lg text-primary-foreground text-[13px] font-semibold cursor-pointer border-none"
              >{d.status === "Pending" ? "Accept" : "Complete ✓"}</button>
            )}
          </div>
        </div>
      ))}
      {!ordersLoading && active.length === 0 && <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">No active deliveries</div>}

      {done.length > 0 && <STitle>Completed</STitle>}
      {done.slice(0, 3).map((d) => (
        <div key={d.id} className="bg-card border border-border rounded-2xl p-5 flex justify-between opacity-45">
          <span className="text-foreground text-[13px]">{d.number} · Done</span>
          <StatusBadge status="delivered" />
        </div>
      ))}
    </div>
  );
}
