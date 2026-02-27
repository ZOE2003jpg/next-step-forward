import { useState } from "react";
import { NEXGO_LOGO, NAV_CONFIG, type AppRole } from "@/lib/constants";

interface BottomNavProps {
  role: AppRole;
  tab: string;
  setTab: (tab: string) => void;
  cartCount?: number;
}

export function BottomNav({ role, tab, setTab, cartCount = 0 }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false);
  const cfg = NAV_CONFIG[role];

  const NavBtn = ({ t }: { t: { id: string; icon: string; label: string } }) => (
    <button
      onClick={() => { setTab(t.id); setShowMore(false); }}
      className="flex-1 flex flex-col items-center gap-0.5 py-1.5 px-0.5 bg-transparent border-none cursor-pointer relative"
    >
      <div className="text-xl transition-all" style={{ filter: t.id === tab ? "drop-shadow(0 0 6px hsl(var(--gold)))" : "none" }}>
        {t.icon}
      </div>
      {t.id === "chow" && cartCount > 0 && (
        <div className="absolute top-0.5 right-[14%] w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
          {cartCount}
        </div>
      )}
      <div className={`text-[10px] font-semibold transition-colors ${t.id === tab ? "text-primary" : "text-muted-foreground"}`}>
        {t.label}
      </div>
      {t.id === tab && (
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 w-[18px] h-0.5 bg-primary rounded-sm" />
      )}
    </button>
  );

  return (
    <>
      {showMore && (
        <div onClick={() => setShowMore(false)} className="fixed inset-0 z-[98] bg-black/55 backdrop-blur-sm" />
      )}
      {showMore && cfg.more.length > 0 && (
        <div className="fixed bottom-[82px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[448px] bg-card border border-[hsl(var(--gold-border))] rounded-[20px] z-[99] p-4 pt-[18px] shadow-[0_-8px_40px_rgba(0,0,0,0.8)] animate-pop-up">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground text-center mb-3.5">More Services</div>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${Math.min(cfg.more.length, 3)}, 1fr)` }}>
            {cfg.more.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setShowMore(false); }}
                className={`flex flex-col items-center gap-[7px] rounded-[14px] py-3.5 px-2 cursor-pointer transition-all border ${
                  t.id === tab
                    ? "bg-[hsl(var(--gold-glow))] border-[hsl(var(--gold)/0.4)]"
                    : "bg-white/[0.04] border-white/[0.06]"
                }`}
              >
                <div className="text-[26px]">{t.icon}</div>
                <div className={`text-[10px] font-semibold text-center tracking-wider uppercase ${t.id === tab ? "text-primary" : "text-muted-foreground"}`}>
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-[hsl(var(--surface-2))] border-t border-[hsl(var(--gold)/0.2)] flex items-center px-1 pt-2 pb-3.5 z-[100]">
        {cfg.left.map((t) => <NavBtn key={t.id} t={t} />)}
        <div
          className="flex-1 flex flex-col items-center cursor-pointer -mt-6"
          onClick={() => setShowMore((p) => !p)}
        >
          <div
            className="w-14 h-14 rounded-full gradient-gold flex items-center justify-center shadow-[0_-4px_20px_hsl(var(--gold)/0.5),0_4px_16px_rgba(0,0,0,0.6)] border-[3px] border-[hsl(var(--surface-2))] transition-transform"
            style={{ transform: showMore ? "rotate(45deg) scale(1.08)" : "rotate(0deg) scale(1)" }}
          >
            <img src={NEXGO_LOGO} alt="" className="w-[50px] h-7 object-contain" style={{ filter: "brightness(0) invert(0.15)" }} />
          </div>
          <div className="text-[9px] font-bold text-primary tracking-widest uppercase mt-1">
            {showMore ? "Close" : "Menu"}
          </div>
        </div>
        {cfg.right.map((t) => <NavBtn key={t.id} t={t} />)}
      </div>
    </>
  );
}
