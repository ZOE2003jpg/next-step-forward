export const Chip = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-[hsl(var(--gold-glow))] border border-[hsl(var(--gold-dark))] text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
    {children}
  </div>
);
