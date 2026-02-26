export const PHeader = ({ title, sub, icon }: { title: string; sub: string; icon: string }) => (
  <div className="flex items-center gap-2.5">
    <span className="text-[26px]">{icon}</span>
    <div>
      <div className="font-display text-[26px] font-bold text-foreground leading-tight">{title}</div>
      <div className="text-muted-foreground text-xs">{sub}</div>
    </div>
  </div>
);
