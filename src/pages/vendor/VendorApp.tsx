import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMyRestaurant } from "@/hooks/useRestaurants";
import { useVendorOrders, useUpdateOrderStatus, useCancelOrder } from "@/hooks/useOrders";
import { useMenuItems, useAddMenuItem, useDeleteMenuItem } from "@/hooks/useMenuItems";
import { PHeader } from "@/components/PHeader";
import { STitle } from "@/components/STitle";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { Lbl } from "@/components/Lbl";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function VendorApp({ tab }: { tab: string }) {
  const { user, signOut } = useAuth();
  const { data: restaurant, isLoading: restLoading } = useMyRestaurant(user?.id);
  const { data: orders, isLoading: ordersLoading } = useVendorOrders(restaurant?.id);
  const { data: menuItems, isLoading: menuLoading } = useMenuItems(restaurant?.id);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();
  const addMenuItem = useAddMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(restaurant?.is_open ?? true);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", price: "", description: "", image: "🍚" });

  const toggleOpen = async () => {
    if (!restaurant) return;
    const newVal = !isOpen;
    setIsOpen(newVal);
    await supabase.from("restaurants").update({ is_open: newVal }).eq("id", restaurant.id);
  };

  // Strict state machine transitions for vendor
  const nextStatus = (status: string) => {
    if (status === "pending") return "accepted";
    if (status === "accepted") return "preparing";
    if (status === "preparing") return "ready";
    return null;
  };

  const nextLabel = (status: string) => {
    if (status === "pending") return "Accept Order";
    if (status === "accepted") return "Start Prep";
    if (status === "preparing") return "Mark Ready";
    return null;
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !restaurant) { toast.error("Fill name and price"); return; }
    try {
      await addMenuItem.mutateAsync({ name: newItem.name, price: parseInt(newItem.price), description: newItem.description, image: newItem.image, restaurant_id: restaurant.id });
      setNewItem({ name: "", price: "", description: "", image: "🍚" });
      setShowAdd(false);
      toast.success("Item added!");
    } catch (e: any) { toast.error(e.message); }
  };

  if (tab === "orders") {
    return (
      <div className="p-6 px-4 flex flex-col gap-3.5 animate-fade-up max-w-[800px] mx-auto">
        <PHeader title="Orders" sub="Manage incoming orders" icon="📦" />
        {ordersLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
        {!ordersLoading && (!orders || orders.length === 0) && <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">No orders yet</div>}
        {orders?.map((o) => {
          const ns = nextStatus(o.status);
          const nl = nextLabel(o.status);
          const canCancel = ["pending", "accepted", "preparing"].includes(o.status);
          return (
            <div key={o.id} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex justify-between mb-2.5">
                <span className="font-bold text-foreground">{o.order_number}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="text-[13px] text-muted-foreground mb-0.5">{o.order_items?.map((i: any) => `${i.name} x${i.quantity}`).join(", ")}</div>
              <div className="text-[13px] text-muted-foreground mb-1">{o.delivery_address && `📍 ${o.delivery_address}`}</div>
              <div className="text-[13px] text-muted-foreground mb-3">{format(new Date(o.created_at), "MMM d, h:mm a")}</div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-primary font-mono-dm font-bold">₦{o.total_amount.toLocaleString()}</span>
                <div className="flex gap-2">
                  {canCancel && (
                    <button
                      onClick={() => cancelOrder.mutate({ orderId: o.id, reason: "Cancelled by vendor" }, { onSuccess: () => toast.success("Order cancelled"), onError: (e) => toast.error(e.message) })}
                      disabled={cancelOrder.isPending}
                      className="bg-transparent border border-destructive/40 text-destructive py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer"
                    >Cancel</button>
                  )}
                  {ns && nl && (
                    <button
                      onClick={() => updateStatus.mutate({ id: o.id, status: ns }, { onSuccess: () => toast.success(nl!), onError: (e) => toast.error(e.message) })}
                      disabled={updateStatus.isPending}
                      className="gradient-gold-subtle py-2 px-4 rounded-lg text-primary-foreground text-xs font-semibold cursor-pointer border-none disabled:opacity-70"
                    >{updateStatus.isPending ? <Spinner /> : nl}</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (tab === "menu") {
    return (
      <div className="p-6 px-4 flex flex-col gap-3.5 animate-fade-up max-w-[800px] mx-auto">
        <div className="flex justify-between items-center">
          <PHeader title="Menu" sub="Manage your items" icon="🍽️" />
          <button onClick={() => setShowAdd(true)} className="gradient-gold-subtle py-2 px-4 rounded-lg text-primary-foreground text-[13px] font-semibold cursor-pointer border-none">+ Add</button>
        </div>
        {showAdd && (
          <div className="bg-card border border-primary rounded-2xl p-5 flex flex-col gap-3">
            <Lbl>Item Name</Lbl>
            <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none" placeholder="Jollof Rice" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <Lbl>Price (₦)</Lbl>
            <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none" type="number" placeholder="1500" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
            <Lbl>Description</Lbl>
            <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none" placeholder="Smoky party jollof" value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={handleAddItem} disabled={addMenuItem.isPending} className="gradient-gold-subtle py-2 px-4 rounded-lg text-primary-foreground text-sm font-semibold cursor-pointer border-none flex items-center gap-2">
                {addMenuItem.isPending ? <Spinner /> : "Save"}
              </button>
              <button onClick={() => setShowAdd(false)} className="bg-secondary text-foreground border border-border rounded-lg py-2 px-4 text-sm cursor-pointer">Cancel</button>
            </div>
          </div>
        )}
        {menuLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
        {menuItems?.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <span className="text-[28px]">{item.image}</span>
              <div>
                <div className="font-semibold text-foreground text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
                <div className="text-primary font-mono-dm text-[13px] mt-0.5">₦{item.price.toLocaleString()}</div>
              </div>
            </div>
            <button onClick={() => { deleteMenuItem.mutate(item.id); toast.success("Deleted"); }} className="bg-transparent text-destructive border-none text-xs cursor-pointer font-semibold">Del</button>
          </div>
        ))}
      </div>
    );
  }

  if (tab === "earnings") {
    const totalRevenue = orders?.reduce((a, o) => a + o.total_amount, 0) ?? 0;
    const todayOrders = orders?.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()) ?? [];
    const todayRevenue = todayOrders.reduce((a, o) => a + o.total_amount, 0);
    return (
      <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
        <PHeader title="Earnings" sub="Your revenue breakdown" icon="💰" />
        <div className="gradient-gold-subtle rounded-[20px] py-7 px-6 text-center relative overflow-hidden">
          <div className="absolute -right-5 -top-5 w-[120px] h-[120px] rounded-full bg-white/10" />
          <div className="text-xs text-primary-foreground/70 tracking-widest uppercase mb-2">Total Revenue</div>
          <div className="font-display text-5xl font-bold text-primary-foreground">₦{totalRevenue.toLocaleString()}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: "Today", v: `₦${todayRevenue.toLocaleString()}` },
            { l: "Total Orders", v: String(orders?.length ?? 0) },
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
          <div className="w-20 h-20 rounded-2xl gradient-gold mx-auto mb-3.5 flex items-center justify-center text-4xl">🍲</div>
          <div className="font-display text-[28px] font-bold text-foreground">{restaurant?.name || "Your Restaurant"}</div>
          <div className="text-muted-foreground text-[13px] mt-0.5">{user?.email}</div>
          <div className="text-primary text-xs mt-1 font-mono-dm">Vendor</div>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {["Restaurant Info", "Payment Settings", "Operating Hours", "Notifications", "Help"].map((item, i, arr) => (
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

  // Dashboard (default)
  if (restLoading) return <div className="flex justify-center items-center min-h-[300px]"><Spinner size={32} /></div>;

  const todayOrders = orders?.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()) ?? [];
  const todayRevenue = todayOrders.reduce((a, o) => a + o.total_amount, 0);
  const pendingCount = orders?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-muted-foreground text-[13px]">Welcome back,</div>
          <div className="font-display text-[30px] font-bold text-foreground">{restaurant?.name || "Restaurant"} 🍲</div>
        </div>
        <div onClick={toggleOpen} className={`rounded-[20px] py-1.5 px-3.5 text-xs font-bold cursor-pointer transition-all border ${isOpen ? "bg-[hsl(var(--success)/0.13)] border-[hsl(var(--success))] text-[hsl(var(--success))]" : "bg-secondary border-border text-muted-foreground"}`}>
          {isOpen ? "🟢 Open" : "⚫ Closed"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { l: "Today's Orders", v: String(todayOrders.length), ic: "📦" },
          { l: "Revenue (₦)", v: todayRevenue.toLocaleString(), ic: "💰" },
          { l: "Pending", v: String(pendingCount), ic: "⏳" },
          { l: "Rating", v: restaurant ? `${Number(restaurant.rating).toFixed(1)} ⭐` : "-", ic: "⭐" },
        ].map((s) => (
          <div key={s.l} className="bg-card border border-border rounded-2xl p-4">
            <div className="text-2xl mb-1.5">{s.ic}</div>
            <div className="font-mono-dm text-[22px] font-bold text-primary">{s.v}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <STitle>Live Orders</STitle>
        <div className="flex flex-col gap-2.5 mt-3">
          {ordersLoading && <div className="flex justify-center py-4"><Spinner /></div>}
          {!ordersLoading && todayOrders.slice(0, 5).map((o) => (
            <div key={o.id} className="p-3.5 bg-secondary rounded-[10px] flex justify-between items-center">
              <div>
                <div className="font-semibold text-foreground text-sm">{o.order_items?.map((i: any) => i.name).join(", ")}</div>
                <div className="text-xs text-muted-foreground">{format(new Date(o.created_at), "h:mm a")}</div>
              </div>
              <div className="text-right">
                <StatusBadge status={o.status} />
                <div className="text-primary font-mono-dm text-[13px] mt-1">₦{o.total_amount.toLocaleString()}</div>
              </div>
            </div>
          ))}
          {!ordersLoading && todayOrders.length === 0 && <div className="text-muted-foreground text-sm text-center py-4">No orders today</div>}
        </div>
      </div>
    </div>
  );
}
