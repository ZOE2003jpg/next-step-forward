import { useState } from "react";
import { useTripRoutes, useBookTrip } from "@/hooks/useTripRoutes";
import { useWallet } from "@/hooks/useWallet";
import { PHeader } from "@/components/PHeader";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export default function NexTrip() {
  const { data: routes } = useTripRoutes();
  const { data: wallet } = useWallet();
  const bookTrip = useBookTrip();
  const [sel, setSel] = useState<Tables<"trip_routes"> | null>(null);
  const [booked, setBooked] = useState(false);
  const [boardingCode, setBoardingCode] = useState("");

  const doBook = async () => {
    if (!sel) return;
    if ((wallet?.balance ?? 0) < sel.price) { toast.error("Insufficient wallet balance"); return; }
    try {
      const code = await bookTrip.mutateAsync({ route_id: sel.id, price: sel.price });
      setBoardingCode(code);
      setBooked(true);
      toast.success("Seat booked!");
    } catch (e: any) { toast.error(e.message); }
  };

  if (booked && sel) {
    return (
      <div className="p-6 px-4 flex flex-col items-center justify-center min-h-[400px] gap-4 animate-fade-up">
        <div className="text-[72px]">🚌</div>
        <div className="font-display text-[30px] text-primary font-bold">Seat Reserved!</div>
        <div className="text-muted-foreground text-center text-sm">
          Your seat on <strong className="text-foreground">{sel.from_location} → {sel.to_location}</strong> is confirmed.
        </div>
        <div className="bg-[hsl(var(--gold-glow))] border border-[hsl(var(--gold-border))] rounded-[14px] py-4 px-6 text-center">
          <div className="text-[11px] text-muted-foreground tracking-widest uppercase mb-1">Boarding Code</div>
          <div className="font-mono-dm text-2xl font-bold text-primary">{boardingCode}</div>
        </div>
        <button onClick={() => { setBooked(false); setSel(null); }} className="bg-transparent border border-primary text-primary rounded-[10px] py-3 px-6 font-semibold text-sm cursor-pointer">Book Another</button>
      </div>
    );
  }

  return (
    <div className="p-6 px-4 animate-fade-up">
      <PHeader title="NexTrip" sub="Campus shuttle booking" icon="🚌" />
      <div className="flex flex-col gap-3.5 mt-5">
        {(routes || []).map((r) => (
          <div key={r.id} onClick={() => setSel(r)} className={`bg-card rounded-2xl p-5 cursor-pointer transition-all border ${sel?.id === r.id ? "border-primary bg-[hsl(var(--gold-glow))]" : "border-border"}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-foreground text-[15px]">{r.from_location}</div>
                <div className="text-primary text-[22px] my-1">↓</div>
                <div className="font-bold text-foreground text-[15px]">{r.to_location}</div>
              </div>
              <div className="text-right">
                <div className="text-primary font-bold font-mono-dm text-lg">₦{r.price}</div>
                <div className="text-xs text-muted-foreground mt-1">🚌 {r.seats_available} seats left</div>
                <div className="text-xs text-[hsl(var(--success))] mt-0.5">Next: {r.next_departure}</div>
              </div>
            </div>
          </div>
        ))}
        {(!routes || routes.length === 0) && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">No routes available</div>
        )}
      </div>
      {sel && (
        <button onClick={doBook} disabled={bookTrip.isPending} className="w-full py-4 gradient-gold-subtle rounded-[14px] text-primary-foreground font-semibold text-[15px] mt-5 cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-2">
          {bookTrip.isPending ? <Spinner /> : `Book Seat · ₦${sel.price} →`}
        </button>
      )}
    </div>
  );
}
