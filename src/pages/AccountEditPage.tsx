import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

export default function AccountEditPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [user, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully!");
      navigate("/account");
      // Optional: force reload or context refetch if we had it exposed
      window.location.reload(); 
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="px-4 py-3 space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Edit Profile</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="bg-card rounded-xl border border-border p-4 space-y-4 shadow-sm">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Full Name</label>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Enter your full name" 
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Phone Number</label>
              <input 
                type="tel" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Enter your phone number" 
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Email (Cannot be changed)</label>
              <input 
                type="email" 
                value={user?.email || ""} 
                disabled 
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-sm opacity-50 cursor-not-allowed" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
