import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import picmartLogo from "@/assets/picmart-logo.jpg";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-login", {
        body: { email, password },
      });
      if (error) throw error;
      if (data?.success && data?.session) {
        await supabase.auth.setSession(data.session);
        toast.success("Admin login successful!");
        navigate("/admin");
      } else {
        toast.error(data?.error || "Invalid credentials");
      }
    } catch (err: any) {
      toast.error("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto flex flex-col items-center justify-center px-6">
      <div className="w-full">
        <div className="flex flex-col items-center mb-8">
          <img src={picmartLogo} alt="Picmart Logo" className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-primary/30" />
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Picmart Administration</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Admin Email"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Admin Password"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm disabled:opacity-70">
            {loading ? "Authenticating..." : "Login as Admin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
