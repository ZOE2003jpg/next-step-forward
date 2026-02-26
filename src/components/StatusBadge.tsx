const STATUS_COLORS: Record<string, string> = {
  Delivered: "hsl(var(--success))",
  Done: "hsl(var(--success))",
  Active: "hsl(var(--gold))",
  "In Transit": "hsl(var(--gold))",
  Preparing: "#E8A030",
  Pending: "hsl(var(--muted-foreground))",
  Ready: "hsl(var(--gold-light))",
  Open: "hsl(var(--success))",
  Suspended: "hsl(var(--destructive))",
  Confirmed: "hsl(var(--success))",
};

export const StatusBadge = ({ status }: { status: string }) => {
  const c = STATUS_COLORS[status] || "hsl(var(--muted-foreground))";
  return (
    <div
      className="text-[11px] font-bold px-2.5 py-1 rounded-md inline-block whitespace-nowrap"
      style={{ background: `${c}22`, color: c }}
    >
      {status}
    </div>
  );
};
