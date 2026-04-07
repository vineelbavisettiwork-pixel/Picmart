import { useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package, ShoppingCart, Users, Image, Tag, LayoutGrid,
  MessageCircle, DollarSign, BarChart3, Settings, LogOut, Menu, X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import picmartLogo from "@/assets/picmart-logo.jpg";

const adminMenuItems = [
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Image, label: "Banners", path: "/admin/banners" },
  { icon: Tag, label: "Discounts", path: "/admin/discounts" },
  { icon: LayoutGrid, label: "Categories", path: "/admin/categories" },
  { icon: MessageCircle, label: "Chat", path: "/admin/chat" },
  { icon: DollarSign, label: "Earnings", path: "/admin/earnings" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        navigate("/admin/login");
        return;
      }
      setAuthorized(true);
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (!authorized) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">Checking access...</div>;
  }

  return (
    <div className="min-h-screen bg-secondary flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/30 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 gradient-primary z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 flex items-center justify-between border-b border-primary-foreground/10">
          <div className="flex items-center gap-2">
            <img src={picmartLogo} alt="Picmart" className="w-8 h-8 rounded-full object-cover border border-primary-foreground/30" />
            <div>
              <p className="text-primary-foreground font-bold text-sm">Picmart Admin</p>
              <p className="text-primary-foreground/60 text-[10px]">Management Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-primary-foreground/70">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-2 space-y-0.5 overflow-y-auto h-[calc(100%-120px)]">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === "/admin/products" && location.pathname === "/admin");
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground font-semibold"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-primary-foreground/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary-foreground/70 hover:bg-primary-foreground/10 text-sm">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 gradient-primary shadow-top-nav px-4 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-primary-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-primary-foreground font-bold text-base flex-1">
            {adminMenuItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
          </h1>
        </header>
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
