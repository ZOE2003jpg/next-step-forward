import { ReactNode, useEffect, useState } from "react";
import { NEXGO_LOGO } from "@/lib/constants";

export function DesktopWrapper({ children }: { children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 900);
  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 900);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  if (!isDesktop) return <div className="h-full w-full mx-auto">{children}</div>;

  return (
    <div className="min-h-screen bg-background flex items-stretch relative overflow-hidden">
      <div className="fixed w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,hsl(var(--gold-glow))_0%,transparent_65%)] top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="flex-1 flex flex-col justify-center px-10 pl-[60px] py-[60px] relative z-[1] min-w-0">
        <img src={NEXGO_LOGO} alt="NexGo" className="w-[200px] object-contain drop-shadow-[0_0_20px_hsl(var(--gold)/0.4)] mb-8" />
        <div className="font-display text-[52px] font-bold text-foreground leading-tight mb-4">
          The Campus<br /><span className="text-primary">Super App</span>
        </div>
        <div className="text-base text-muted-foreground leading-relaxed mb-10 max-w-[420px]">
          Order food, send packages, book campus rides — all in one place. Built for Nigerian university students.
        </div>
        <div className="flex flex-col gap-4 mb-12">
          {[
            { icon: "🍽️", title: "NexChow", desc: "Order from campus restaurants in minutes" },
            { icon: "📦", title: "NexDispatch", desc: "Send & receive packages across campus" },
            { icon: "🚌", title: "NexTrip", desc: "Book campus bus & keke rides instantly" },
          ].map((f) => (
            <div key={f.title} className="flex gap-3.5 items-center">
              <div className="w-11 h-11 rounded-xl bg-[hsl(var(--gold-glow))] border border-[hsl(var(--gold-border))] flex items-center justify-center text-xl shrink-0">
                {f.icon}
              </div>
              <div>
                <div className="font-bold text-foreground text-[15px]">{f.title}</div>
                <div className="text-sm text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          {[
            { icon: "🍎", store: "App Store" },
            { icon: "🤖", store: "Google Play" },
          ].map((s) => (
            <div key={s.store} className="bg-card border border-border rounded-[10px] py-2.5 px-4 flex items-center gap-2 cursor-pointer">
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className="text-[9px] text-muted-foreground tracking-wider uppercase">Coming soon</div>
                <div className="text-[13px] font-bold text-foreground">{s.store}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-10 text-xs text-muted-foreground">© 2025 NexGo · Built for campus life 🎓</div>
      </div>

      <div className="flex items-center justify-center p-10 pr-[60px] pl-5 shrink-0 relative z-[1]">
        <div className="relative w-[390px] h-[820px] rounded-[44px] bg-[#0D0D0D] border-2 border-[#2A2A2A] shadow-[0_40px_120px_rgba(0,0,0,0.8),0_0_0_1px_#1A1A1A,inset_0_0_0_1px_#333,0_0_60px_hsl(var(--gold)/0.08)] overflow-hidden flex flex-col">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[34px] bg-[#0D0D0D] rounded-b-[20px] z-[200] flex items-center justify-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A]" />
            <div className="w-[60px] h-1.5 rounded-full bg-[#1A1A1A]" />
          </div>
          <div className="flex-1 overflow-hidden rounded-[42px]">{children}</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-1 bg-[#333] rounded-sm" />
        </div>
      </div>
    </div>
  );
}
