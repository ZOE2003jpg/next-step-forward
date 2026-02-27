import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminOrders } from "@/hooks/useOrders";
import { usePlatformSettings, useUpdatePlatformSetting } from "@/hooks/usePlatformSettings";
import { PHeader } from "@/components/PHeader";
import { STitle } from "@/components/STitle";
import { StatusBadge } from "@/components/StatusBadge";
import { Lbl } from "@/components/Lbl";
import { Spinner } from "@/components/Spinner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminApp({ tab }: { tab: string }) {
  const { user, signOut } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useAdminOrders();
  const { data: settings } = usePlatformSettings();
  const updateSetting = useUpdatePlatformSetting();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: allProfiles, isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: allRoles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
  });

  const users = (allProfiles || []).map((p) => {
    const r = (allRoles || []).find((r) => r.user_id === p.id);
    return { ...p, role: r?.role || "student" };
  });

  if (tab === "users") {
    const filtered = users.filter((u) => u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));
    return (
      <div className="p-6 px-4 flex flex-col gap-3.5 animate-fade-up max-w-[800px] mx-auto">
        <PHeader title="Users" sub="Manage all users" icon="👥" />
        <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary" placeholder="🔍 Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
        {profilesLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
        {filtered.map((u) => (
          <div key={u.id} className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center">
            <div className="flex gap-2.5 items-center">
              <div className="w-9 h-9 rounded-full gradient-gold-subtle flex items-center justify-center text-sm font-bold text-primary-foreground">{u.full_name?.[0]?.toUpperCase() || "?"}</div>
              <div>
                <div className="font-semibold text-foreground text-sm">{u.full_name}</div>
                <div className="text-[11px] text-muted-foreground capitalize">{u.role} · {u.email}</div>
              </div>
            </div>
            <StatusBadge status="Active" />
          </div>
        ))}
      </div>
    );
  }

  if (tab === "analytics") {
    const totalRevenue = orders?.reduce((a, o) => a + o.total_amount, 0) ?? 0;
    return (
      <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
        <PHeader title="Analytics" sub="Platform performance" icon="📈" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: "Total Revenue", v: `₦${totalRevenue.toLocaleString()}`, ic: "💰" },
            { l: "Total Orders", v: String(orders?.length ?? 0), ic: "📦" },
            { l: "Total Users", v: String(users.length), ic: "👥" },
            { l: "Restaurants", v: "-", ic: "🍽️" },
          ].map((s) => (
            <div key={s.l} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex justify-between"><div className="text-2xl">{s.ic}</div></div>
              <div className="font-mono-dm text-xl font-bold text-primary mt-2">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === "settings") {
    return (
      <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
        <PHeader title="Settings" sub="Platform configuration" icon="⚙️" />
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
          <STitle>Fee Management</STitle>
          {[
            { key: "delivery_fee", label: "Delivery Fee (₦)" },
            { key: "platform_commission_pct", label: "Platform Commission (%)" },
            { key: "dispatch_fee", label: "Dispatch Fee (₦)" },
          ].map((f) => (
            <div key={f.key}>
              <Lbl>{f.label}</Lbl>
              <input
                className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary mt-1.5"
                type="number"
                value={settings?.[f.key] ?? 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  updateSetting.mutate({ key: f.key, value: val }, {
                    onSuccess: () => toast.success(`${f.label} updated`),
                  });
                }}
              />
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
          <div className="w-20 h-20 rounded-full bg-[linear-gradient(135deg,#1A1A2E,#16213E)] border-2 border-primary mx-auto mb-3.5 flex items-center justify-center text-[32px]">⚙️</div>
          <div className="font-display text-[28px] font-bold text-foreground">Super Admin</div>
          <div className="text-muted-foreground text-[13px] mt-0.5">{user?.email}</div>
          <div className="text-primary text-xs mt-1 font-mono-dm">Administrator</div>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {["Platform Settings", "Service Config", "Fee Management", "Security", "System Logs"].map((item, i, arr) => (
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

  // Dashboard
  const todayOrders = orders?.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()) ?? [];
  const todayRevenue = todayOrders.reduce((a, o) => a + o.total_amount, 0);

  return (
    <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up max-w-[800px] mx-auto">
      <PHeader title="Admin Panel" sub="NexGo operations overview" icon="⚙️" />
      {ordersLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Users", value: String(users.length), icon: "👥" },
          { label: "Orders Today", value: String(todayOrders.length), icon: "📦" },
          { label: "Revenue", value: `₦${todayRevenue.toLocaleString()}`, icon: "💰" },
          { label: "Active Riders", value: String(users.filter((u) => u.role === "rider").length), icon: "🏍️" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs text-muted-foreground mb-1.5">{s.label}</div>
                <div className="font-mono-dm text-[22px] font-bold text-primary">{s.value}</div>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <STitle>Recent Users</STitle>
        {profilesLoading && <div className="flex justify-center py-4"><Spinner /></div>}
        {users.slice(0, 4).map((u, i, arr) => (
          <div key={u.id} className={`flex justify-between items-center py-3 ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
            <div className="flex gap-2.5 items-center">
              <div className="w-9 h-9 rounded-full gradient-gold-subtle flex items-center justify-center text-sm font-bold text-primary-foreground">{u.full_name?.[0]?.toUpperCase() || "?"}</div>
              <div>
                <div className="font-semibold text-foreground text-sm">{u.full_name}</div>
                <div className="text-[11px] text-muted-foreground capitalize">{u.role}</div>
              </div>
            </div>
            <StatusBadge status="Active" />
          </div>
        ))}
      </div>
    </div>
  );
}
