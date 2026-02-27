import { useMenuItems } from "@/hooks/useMenuItems";
import { useCart } from "@/hooks/useCart";
import { STitle } from "@/components/STitle";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

interface Props {
  restaurant: Tables<"restaurants">;
  onBack: () => void;
  onCheckout: () => void;
}

export default function RestaurantDetail({ restaurant, onBack, onCheckout }: Props) {
  const { data: items, isLoading } = useMenuItems(restaurant.id);
  const { cart, addItem, removeItem, total, setRestaurantId } = useCart();

  const qty = (id: string) => cart.find((c) => c.id === id)?.qty || 0;

  const handleAdd = (item: Tables<"menu_items">) => {
    setRestaurantId(restaurant.id);
    addItem(item);
    toast.success(`Added ${item.name}`);
  };

  return (
    <div className="p-6 px-4 animate-fade-up max-w-[800px] mx-auto">
      <button onClick={onBack} className="bg-secondary text-foreground border border-border rounded-lg py-2 px-4 text-[13px] cursor-pointer mb-4 font-semibold">← Back</button>
      <div className="bg-secondary border border-border rounded-2xl p-5 flex gap-4 items-center mb-5">
        <div className="text-[52px]">{restaurant.image}</div>
        <div>
          <div className="font-display text-2xl font-bold text-foreground">{restaurant.name}</div>
          <div className="text-[13px] text-muted-foreground">{restaurant.cuisine}</div>
          <div className="flex gap-3 mt-1.5 text-[13px] text-primary">
            <span>⭐ {Number(restaurant.rating).toFixed(1)}</span>
            <span>🕐 {restaurant.delivery_time}</span>
          </div>
        </div>
      </div>
      <STitle>Menu</STitle>
      <div className="flex flex-col gap-3 mt-3" style={{ paddingBottom: total > 0 ? 80 : 0 }}>
        {isLoading && <div className="flex justify-center py-8"><Spinner size={28} /></div>}
        {!isLoading && (items || []).filter((i) => i.available).map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <span className="text-[32px]">{item.image}</span>
              <div>
                <div className="font-semibold text-foreground text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.description}</div>
                <div className="text-primary font-bold text-[13px] mt-1 font-mono-dm">₦{item.price.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {qty(item.id) > 0 && (
                <>
                  <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-full bg-secondary text-foreground text-lg flex items-center justify-center border-none cursor-pointer">−</button>
                  <span className="text-primary font-bold min-w-[16px] text-center">{qty(item.id)}</span>
                </>
              )}
              <button onClick={() => handleAdd(item)} className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-lg flex items-center justify-center border-none cursor-pointer font-bold">+</button>
            </div>
          </div>
        ))}
        {!isLoading && (!items || items.length === 0) && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">No menu items yet</div>
        )}
      </div>
      {total > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[800px] z-[90]">
          <button onClick={onCheckout} className="w-full py-4 gradient-gold-subtle rounded-[14px] text-primary-foreground font-semibold text-[15px] shadow-[0_8px_24px_hsl(var(--gold)/0.35)] cursor-pointer border-none">
            Checkout · ₦{total.toLocaleString()} →
          </button>
        </div>
      )}
    </div>
  );
}
