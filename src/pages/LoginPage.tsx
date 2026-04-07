import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import picmartLogo from "@/assets/picmart-logo.jpg";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Login successful!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto flex flex-col">
      <div className="gradient-primary px-6 pt-16 pb-10 rounded-b-[2rem]">
        <div className="flex flex-col items-center">
          <img src={picmartLogo} alt="Picmart Logo" className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-primary-foreground/40" />
          <h1 className="text-primary-foreground font-bold text-2xl">Picmart</h1>
          <p className="text-primary-foreground/70 text-xs mt-1">Photo Frame Maker's</p>
        </div>
      </div>
      <div className="px-6 pt-8 pb-6 flex-1">
        <h2 className="text-xl font-bold text-foreground mb-1">Welcome Back!</h2>
        <p className="text-sm text-muted-foreground mb-6">Login to continue shopping</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-3 pr-11 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-70">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account? <Link to="/signup" className="text-primary font-semibold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
