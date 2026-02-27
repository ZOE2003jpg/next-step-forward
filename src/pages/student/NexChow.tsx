import { useState } from "react";
import { useRestaurants } from "@/hooks/useRestaurants";
import { PHeader } from "@/components/PHeader";
import { Chip } from "@/components/Chip";
import { Spinner } from "@/components/Spinner";
import { useCart } from "@/hooks/useCart";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  onSelect: (r: Tables<"restaurants">) => void;
  onCheckout: () => void;
}

export default function NexChow({ onSelect, onCheckout }: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const { data: restaurants, isLoading } = useRestaurants();
  const { total, totalQty } = useCart();

  const list = (restaurants || []).filter((r) => {
    const ms = r.name.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || r.cuisine === filter;
    return ms && mf;
  });

  const cuisines = ["All", ...new Set((restaurants || []).map((r) => r.cuisine))];

  return (
    <div className="p-6 px-4 animate-fade-up max-w-[800px] mx-auto">
      <PHeader title="NexChow" sub="Order food on campus" icon="🍽️" />
      <input
        className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary mt-4 mb-3.5"
        placeholder="🔍  Search restaurants…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {cuisines.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`whitespace-nowrap py-2 px-4 rounded-[20px] text-xs font-semibold border cursor-pointer transition-all ${
              filter === c ? "bg-[hsl(var(--gold-glow))] text-primary border-primary" : "bg-secondary text-muted-foreground border-border"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3.5" style={{ paddingBottom: totalQty > 0 ? 80 : 0 }}>
        {isLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
        {!isLoading && list.map((r) => (
          <div key={r.id} onClick={() => onSelect(r)} className="bg-card border border-border rounded-2xl p-5 flex gap-3.5 items-center cursor-pointer hover-gold transition-all">
            <div className="w-[66px] h-[66px] rounded-[14px] bg-secondary flex items-center justify-center text-[34px] shrink-0">{r.image}</div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="font-bold text-foreground text-[15px]">{r.name}</div>
                {r.tag && <Chip>{r.tag}</Chip>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{r.cuisine} · {r.price_range}</div>
              <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                <span>⭐ {Number(r.rating).toFixed(1)}</span>
                <span>🕐 {r.delivery_time}</span>
                <span className={r.is_open ? "text-[hsl(var(--success))]" : "text-destructive"}>{r.is_open ? "Open" : "Closed"}</span>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && list.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">No restaurants found</div>
        )}
      </div>
      {totalQty > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[800px] z-[90]">
          <button onClick={onCheckout} className="w-full py-4 gradient-gold-subtle rounded-[14px] text-primary-foreground font-semibold text-[15px] flex items-center justify-between px-6 shadow-[0_8px_24px_hsl(var(--gold)/0.35)] cursor-pointer border-none">
            <span>🛒 {totalQty} item{totalQty !== 1 ? "s" : ""}</span>
            <span>Cart · ₦{total.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}
