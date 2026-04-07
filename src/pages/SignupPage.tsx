import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import picmartLogo from "@/assets/picmart-logo.jpg";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) { toast.error("Please fill in all fields"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.fullName, form.phone);
      toast.success("Account created! Please check your email to verify.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "fullName", label: "Full Name", type: "text", placeholder: "Enter your full name" },
    { key: "email", label: "Email", type: "email", placeholder: "Enter your email" },
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "Enter your phone number" },
  ];

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto flex flex-col">
      <div className="gradient-primary px-6 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex flex-col items-center">
          <img src={picmartLogo} alt="Picmart Logo" className="w-14 h-14 rounded-full object-cover mb-2 border-2 border-primary-foreground/40" />
          <h1 className="text-primary-foreground font-bold text-xl">Create Account</h1>
          <p className="text-primary-foreground/70 text-xs mt-0.5">Join Picmart today</p>
        </div>
      </div>
      <div className="px-6 pt-6 pb-6 flex-1">
        <form onSubmit={handleSignup} className="space-y-3.5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-foreground mb-1 block">{f.label}</label>
              <input type={f.type} value={form[f.key as keyof typeof form]} onChange={(e) => update(f.key, e.target.value)} placeholder={f.placeholder} className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          ))}
          {["password", "confirmPassword"].map((key) => (
            <div key={key}>
              <label className="text-xs font-semibold text-foreground mb-1 block">{key === "password" ? "Password" : "Confirm Password"}</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={form[key as keyof typeof form]} onChange={(e) => update(key, e.target.value)} placeholder={key === "password" ? "Create a password" : "Confirm your password"} className="w-full px-4 py-2.5 pr-11 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-70">
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account? <Link to="/login" className="text-primary font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
