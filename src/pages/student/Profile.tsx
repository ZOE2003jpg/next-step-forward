import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useStudentOrders } from "@/hooks/useOrders";
import { useStudentDispatches } from "@/hooks/useDispatches";
import { useNavigate } from "react-router-dom";

export default function ProfileScreen() {
  const { signOut, role } = useAuth();
  const { data: profile } = useProfile();
  const { data: orders } = useStudentOrders();
  const { data: dispatches } = useStudentDispatches();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const initial = profile?.full_name?.[0]?.toUpperCase() || "?";

  return (
    <div className="p-6 px-4 flex flex-col gap-5 animate-fade-up">
      <div className="text-center pt-2.5">
        <div className="w-20 h-20 rounded-full gradient-gold mx-auto mb-3.5 flex items-center justify-center text-4xl font-bold text-primary-foreground">{initial}</div>
        <div className="font-display text-[28px] font-bold text-foreground">{profile?.full_name}</div>
        <div className="text-muted-foreground text-[13px] mt-0.5">{profile?.email}</div>
        <div className="text-primary text-xs mt-1 font-mono-dm capitalize">{role}</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Orders", v: orders?.length ?? 0 },
          { l: "Trips", v: "-" },
          { l: "Dispatches", v: dispatches?.length ?? 0 },
        ].map((s) => (
          <div key={s.l} className="bg-card border border-border rounded-2xl p-4 text-center">
            <div className="font-display text-[30px] font-bold text-primary">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {["Account Settings", "Notifications", "Help & Support", "About NexGo"].map((item, i, arr) => (
          <div key={item} className={`flex justify-between items-center py-3.5 px-5 cursor-pointer ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
            <span className="text-foreground font-medium text-sm">{item}</span>
            <span className="text-muted-foreground">›</span>
          </div>
        ))}
      </div>
      <button onClick={handleLogout} className="w-full py-3.5 bg-transparent border border-destructive/40 text-destructive rounded-[10px] font-semibold text-sm cursor-pointer">Sign Out</button>
    </div>
  );
}
