import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { NEXGO_LOGO, DEFAULT_TAB, type AppRole } from "@/lib/constants";
import { Spinner } from "@/components/Spinner";
import { Lbl } from "@/components/Lbl";
import { toast } from "sonner";

export default function Auth() {
  const [step, setStep] = useState<"login" | "register" | "forgot">("login");
  const [role, setRole] = useState<AppRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Fill all fields"); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    navigate(`/${role}`);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) { toast.error("Fill all fields"); return; }
    setLoading(true);
    const { error } = await signUp(email, password, name, role);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Account created! Check your email to verify.");
  };

  const handleForgot = async () => {
    if (!email) { toast.error("Enter your email"); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Check your email for reset link");
    setStep("login");
  };

  const roles: { r: AppRole; ic: string }[] = [
    { r: "student", ic: "🎓" },
    { r: "vendor", ic: "🍽️" },
    { r: "rider", ic: "🏍️" },
    { r: "admin", ic: "⚙️" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-background relative overflow-hidden">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,hsl(var(--gold-glow))_0%,transparent_70%)] -top-[150px] -right-[150px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,hsl(var(--gold)/0.07)_0%,transparent_70%)] -bottom-[100px] -left-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] animate-fade-up">
        <div className="text-center mb-9 flex flex-col items-center gap-2.5">
          <img src={NEXGO_LOGO} alt="NexGo" className="w-[180px] object-contain drop-shadow-[0_0_16px_hsl(var(--gold)/0.4)]" />
          <div className="text-muted-foreground text-[13px] mt-0.5">
            {step === "login" ? "Welcome back, campus legend" : step === "register" ? "Join the campus revolution" : "Reset your password"}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          {step === "login" && (
            <div className="flex flex-col gap-3.5">
              <Lbl>Email</Lbl>
              <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="you@university.edu.ng" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Lbl>Password</Lbl>
              <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Lbl>Login as</Lbl>
              <div className="grid grid-cols-4 gap-2">
                {roles.map(({ r, ic }) => (
                  <button key={r} onClick={() => setRole(r)} className={`py-2.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer capitalize transition-all ${role === r ? "border-primary bg-[hsl(var(--gold-glow))] text-primary" : "border-border bg-secondary text-muted-foreground"}`}>
                    {ic} {r}
                  </button>
                ))}
              </div>
              <button onClick={handleLogin} disabled={loading} className="w-full py-3.5 mt-1.5 gradient-gold-subtle rounded-[10px] text-primary-foreground font-semibold text-sm tracking-wider cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <Spinner /> : "Continue →"}
              </button>
              <div className="text-center text-[13px] text-muted-foreground">
                <span onClick={() => setStep("forgot")} className="text-primary cursor-pointer font-semibold">Forgot password?</span>
              </div>
              <div className="text-center text-[13px] text-muted-foreground">
                No account? <span onClick={() => setStep("register")} className="text-primary cursor-pointer font-semibold">Sign up</span>
              </div>
            </div>
          )}

          {step === "register" && (
            <div className="flex flex-col gap-3.5">
              <Lbl>Full Name</Lbl>
              <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="Chioma Adaeze" value={name} onChange={(e) => setName(e.target.value)} />
              <Lbl>Email</Lbl>
              <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="you@university.edu.ng" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Lbl>Password</Lbl>
              <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Lbl>Register as</Lbl>
              <div className="grid grid-cols-3 gap-2">
                {roles.slice(0, 3).map(({ r, ic }) => (
                  <button key={r} onClick={() => setRole(r)} className={`py-2.5 px-2 rounded-lg text-xs font-semibold border cursor-pointer capitalize transition-all ${role === r ? "border-primary bg-[hsl(var(--gold-glow))] text-primary" : "border-border bg-secondary text-muted-foreground"}`}>
                    {ic} {r}
                  </button>
                ))}
              </div>
              <button onClick={handleRegister} disabled={loading} className="w-full py-3.5 gradient-gold-subtle rounded-[10px] text-primary-foreground font-semibold text-sm tracking-wider cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <Spinner /> : "Create Account →"}
              </button>
              <div className="text-center text-[13px] text-muted-foreground">
                Have account? <span onClick={() => setStep("login")} className="text-primary cursor-pointer font-semibold">Sign in</span>
              </div>
            </div>
          )}

          {step === "forgot" && (
            <div className="flex flex-col gap-3.5">
              <div className="text-center text-4xl mb-2">🔐</div>
              <Lbl>Email</Lbl>
              <input className="w-full p-3 bg-secondary border border-border rounded-[10px] text-foreground text-sm outline-none focus:border-primary transition-colors" placeholder="you@university.edu.ng" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button onClick={handleForgot} disabled={loading} className="w-full py-3.5 gradient-gold-subtle rounded-[10px] text-primary-foreground font-semibold text-sm tracking-wider cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2">
                {loading ? <Spinner /> : "Send Reset Link →"}
              </button>
              <button onClick={() => setStep("login")} className="text-center text-[13px] text-primary cursor-pointer font-semibold bg-transparent border-none">← Back to login</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
