import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { useWallet } from "@/hooks/useWallet";
import { usePlaceOrder } from "@/hooks/useOrders";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { PHeader } from "@/components/PHeader";
import { STitle } from "@/components/STitle";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";

interface Props {
  onBack: () => void;
  onDone: () => void;
}

export default function Checkout({ onBack, onDone }: Props) {
  const { cart, restaurantId, total, clearCart } = useCart();
  const { data: wallet } = useWallet();
  const { data: settings } = usePlatformSettings();
  const placeOrder = usePlaceOrder();
  const [pay, setPay] = useState("wallet");
  const [address, setAddress] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fee = settings?.delivery_fee ?? 150;
  const grandTotal = total + fee;

  const place = async () => {
    if (submitting) return; // Prevent double submission
    if (!restaurantId) { toast.error("No restaurant selected"); return; }
    if (pay === "wallet" && (wallet?.balance ?? 0) < grandTotal) {
      toast.error("Insufficient wallet balance");
      return;
    }
    setSubmitting(true);
    try {
      await placeOrder.mutateAsync({
        restaurantId,
        items: cart.map((c) => ({ menu_item_id: c.id, name: c.name, price: c.price, quantity: c.qty })),
        totalAmount: total,
        deliveryFee: fee,
        deliveryAddress: address || "Campus",
        paymentMethod: pay,
      });
      clearCart();
      setDone(true);
      setTimeout(onDone, 2500);
    } catch (e: any) {
      toast.error(e.message || "Failed to place order");
    }
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 animate-fade-up">
        <div className="text-[80px]">🎉</div>
        <div className="font-display text-4xl font-bold text-primary text-center">Order Placed!</div>
        <div className="text-muted-foreground text-center text-sm max-w-[260px]">Your food is being prepared. You'll get updates in real-time.</div>
      </div>
    );
  }

  return (
    <div className="p-6 px-4 flex flex-col gap-4 animate-fade-up max-w-[800px] mx-auto">
      <button onClick={onBack} className="w-fit bg-secondary text-foreground border border-border rounded-lg py-2 px-4 text-[13px] cursor-pointer font-semibold">← Back</button>
      <PHeader title="Checkout" sub="Review your order" icon="🛒" />
      <div className="bg-card border border-border rounded-2xl p-5">
        <STitle>Order Summary</STitle>
        <div className="mt-3">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between py-2.5 border-b border-border">
              <span className="text-foreground text-sm">{item.name} x{item.qty}</span>
              <span className="text-primary font-mono-dm text-sm">₦{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between py-2.5 border-b border-border">
            <span className="text-muted-foreground text-[13px]">Delivery fee</span>
            <span className="text-muted-foreground font-mono-dm text-[13px]">₦{fee}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span className="font-bold text-foreground">Total</span>
            <span className="font-bold text-primary font-mono-dm text-lg">₦{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <STitle>Delivery Address</STitle>
        <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary mt-3" placeholder="e.g. Hostel B, Room 12" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="bg-card border border-border rounded-2xl p-5">
        <STitle>Payment</STitle>
        <div className="flex flex-col gap-2.5 mt-3">
          {[
            { id: "wallet", label: "NexGo Wallet", sub: `Balance: ₦${(wallet?.balance ?? 0).toLocaleString()}`, icon: "💳" },
            { id: "korapay", label: "Pay Online", sub: "KoraPay checkout", icon: "🏦" },
          ].map((m) => (
            <div key={m.id} onClick={() => setPay(m.id)} className={`p-3.5 rounded-[10px] border-2 cursor-pointer flex gap-3 items-center transition-all ${pay === m.id ? "border-primary bg-[hsl(var(--gold-glow))]" : "border-border bg-secondary"}`}>
              <span className="text-2xl">{m.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-foreground text-sm">{m.label}</div>
                <div className="text-xs text-muted-foreground">{m.sub}</div>
              </div>
              {pay === m.id && <span className="text-primary text-xl">✓</span>}
            </div>
          ))}
        </div>
      </div>
      <button onClick={place} disabled={submitting || placeOrder.isPending} className="w-full py-4 gradient-gold-subtle rounded-[14px] text-primary-foreground font-semibold text-[15px] cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-2">
        {(submitting || placeOrder.isPending) ? <><Spinner /> Placing…</> : `Place Order · ₦${grandTotal.toLocaleString()}`}
      </button>
    </div>
  );
}
