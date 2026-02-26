import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "@/components/Spinner";
import { Lbl } from "@/components/Lbl";
import { NEXGO_LOGO } from "@/lib/constants";
import { toast } from "sonner";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated!");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-background">
      <div className="w-full max-w-[420px] animate-fade-up">
        <div className="text-center mb-9 flex flex-col items-center gap-2.5">
          <img src={NEXGO_LOGO} alt="NexGo" className="w-[180px] object-contain" />
          <div className="text-muted-foreground text-[13px]">Set your new password</div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-3.5">
          <Lbl>New Password</Lbl>
          <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleReset} disabled={loading} className="w-full py-3.5 gradient-gold-subtle rounded-[10px] text-primary-foreground font-semibold text-sm tracking-wider cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <Spinner /> : "Update Password →"}
          </button>
        </div>
      </div>
    </div>
  );
}
