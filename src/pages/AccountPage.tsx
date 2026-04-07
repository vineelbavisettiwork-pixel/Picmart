import AppLayout from "@/components/AppLayout";
import {
  User, Package, MapPin, Bell, MessageCircle, Shield, Star, LogOut, Trash2, ChevronRight, Edit2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const menuItems = [
  { icon: Package, label: "My Orders", path: "/orders" },
  { icon: MapPin, label: "Saved Addresses", path: "/addresses" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: MessageCircle, label: "Support Chat", path: "/chat" },
  { icon: Shield, label: "Privacy Policy", path: "/privacy" },
  { icon: Star, label: "Rate the App", path: "#" },
];

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="px-4 py-3 space-y-4 animate-fade-in">
        {/* Profile Card */}
        <div className="gradient-primary rounded-2xl p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/40 flex items-center justify-center">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            {user ? (
              <>
                <h2 className="text-primary-foreground font-bold text-base">{profile?.full_name || "User"}</h2>
                <p className="text-primary-foreground/70 text-xs">{user.email}</p>
              </>
            ) : (
              <>
                <h2 className="text-primary-foreground font-bold text-base">Guest User</h2>
                <p className="text-primary-foreground/70 text-xs">Login to access your account</p>
              </>
            )}
          </div>
          {!user ? (
            <button onClick={() => navigate("/login")} className="bg-primary-foreground text-primary text-xs font-semibold px-4 py-2 rounded-full">Login</button>
          ) : (
            <button onClick={() => navigate("/account/edit")} className="bg-primary-foreground/20 p-2 rounded-full"><Edit2 className="w-4 h-4 text-primary-foreground" /></button>
          )}
        </div>

        {/* Menu */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}>
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground flex-1 text-left">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {user && (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors border-b border-border">
              <LogOut className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive flex-1 text-left">Logout</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-accent transition-colors">
              <Trash2 className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium text-destructive flex-1 text-left">Delete Account</span>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AccountPage;
