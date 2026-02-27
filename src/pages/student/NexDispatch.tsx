import { useState } from "react";
import { useStudentDispatches, useCreateDispatch } from "@/hooks/useDispatches";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { PHeader } from "@/components/PHeader";
import { Lbl } from "@/components/Lbl";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { toast } from "sonner";

export default function NexDispatch() {
  const [view, setView] = useState<"send" | "track">("send");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [desc, setDesc] = useState("");
  const { data: dispatches, isLoading } = useStudentDispatches();
  const { data: settings } = usePlatformSettings();
  const createDispatch = useCreateDispatch();

  const fee = settings?.dispatch_fee ?? 250;

  const doRequest = async () => {
    if (!pickup || !dropoff) { toast.error("Fill pickup and delivery locations"); return; }
    try {
      await createDispatch.mutateAsync({ pickup_location: pickup, dropoff_location: dropoff, package_description: desc, fee });
      toast.success("Rider requested!");
      setPickup(""); setDropoff(""); setDesc("");
      setView("track");
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 px-4 animate-fade-up max-w-[800px] mx-auto">
      <PHeader title="NexDispatch" sub="Send campus packages" icon="📦" />
      <div className="grid grid-cols-2 gap-3 mt-5">
        {[
          { id: "send" as const, icon: "📤", label: "Send Package", sub: "Request pickup" },
          { id: "track" as const, icon: "📍", label: "Track Package", sub: "Live updates" },
        ].map((v) => (
          <button key={v.id} onClick={() => setView(v.id)} className={`bg-card rounded-2xl text-center cursor-pointer p-4 transition-all w-full border ${view === v.id ? "border-primary bg-[hsl(var(--gold-glow))]" : "border-border"}`}>
            <div className="text-[32px] mb-2">{v.icon}</div>
            <div className="font-bold text-foreground">{v.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{v.sub}</div>
          </button>
        ))}
      </div>
      {view === "send" && (
        <div className="mt-6 flex flex-col gap-3.5">
          <Lbl>Pickup Location</Lbl>
          <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary" placeholder="e.g. Library, Block A" value={pickup} onChange={(e) => setPickup(e.target.value)} />
          <Lbl>Delivery Location</Lbl>
          <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary" placeholder="e.g. Hostel B, Room 12" value={dropoff} onChange={(e) => setDropoff(e.target.value)} />
          <Lbl>Package Description</Lbl>
          <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary" placeholder="e.g. Textbooks x2" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="bg-[hsl(var(--gold-glow))] border border-[hsl(var(--gold-dark))] rounded-[14px] p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground text-sm">Estimated Fee</span>
              <span className="text-primary font-bold font-mono-dm">₦{fee}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1.5">Rider arrives in ~8 minutes</div>
          </div>
          <button onClick={doRequest} disabled={createDispatch.isPending} className="w-full py-3.5 gradient-gold-subtle rounded-[10px] text-primary-foreground font-semibold text-sm cursor-pointer border-none disabled:opacity-70 flex items-center justify-center gap-2">
            {createDispatch.isPending ? <><Spinner /> Requesting…</> : "Request Rider →"}
          </button>
        </div>
      )}
      {view === "track" && (
        <div className="mt-6 flex flex-col gap-3.5">
          {isLoading && <div className="flex justify-center py-6"><Spinner /></div>}
          {!isLoading && (!dispatches || dispatches.length === 0) && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground text-sm">No dispatches yet</div>
          )}
          {dispatches?.map((d) => (
            <div key={d.id} className="bg-card border border-border rounded-2xl p-5 flex justify-between items-center">
              <div>
                <div className="font-semibold text-foreground text-sm">{d.package_description || "Package"}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{d.pickup_location} → {d.dropoff_location}</div>
                <div className="text-xs text-primary font-mono-dm mt-1">₦{d.fee}</div>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
