import { useState, useEffect } from "react";
import { NEXGO_LOGO } from "@/lib/constants";

export default function Splash({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(t); setTimeout(onDone, 300); return 100; }
        return p + 1.5;
      });
    }, 25);
    return () => clearInterval(t);
  }, [onDone]);

  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center gap-12 overflow-hidden relative">
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,hsl(var(--gold-glow))_0%,transparent_65%)] -top-[200px] -right-[200px] pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,hsl(var(--gold)/0.08)_0%,transparent_65%)] -bottom-[100px] -left-[100px] pointer-events-none" />
      <div className="text-center animate-glow flex flex-col items-center gap-3">
        <img src={NEXGO_LOGO} alt="NexGo" className="w-[220px] object-contain drop-shadow-[0_0_24px_hsl(var(--gold)/0.5)]" />
        <div className="text-muted-foreground text-xs tracking-[6px] uppercase mt-1">Campus Super App</div>
      </div>
      <div className="flex gap-4">
        {["🍽️", "📦", "🚌"].map((ic, i) => (
          <div key={i} className="w-[52px] h-[52px] rounded-full bg-card border border-border flex items-center justify-center text-2xl animate-shimmer" style={{ animationDelay: `${i * 0.4}s` }}>
            {ic}
          </div>
        ))}
      </div>
      <div className="w-[220px]">
        <div className="h-0.5 bg-secondary rounded-sm overflow-hidden">
          <div className="h-full gradient-gold-subtle rounded-sm transition-[width] duration-[30ms] linear" style={{ width: `${progress}%` }} />
        </div>
        <div className="text-center mt-2.5 text-[11px] text-muted-foreground font-mono-dm">{Math.round(progress)}%</div>
      </div>
    </div>
  );
}
