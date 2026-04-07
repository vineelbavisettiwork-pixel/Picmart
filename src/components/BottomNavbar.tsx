import { Home, LayoutGrid, Package, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/categories", label: "Categories", icon: LayoutGrid },
  { path: "/orders", label: "Orders", icon: Package },
  { path: "/account", label: "Account", icon: User },
];

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background shadow-nav border-t border-border">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary/70"
              }`}
              aria-label={tab.label}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 rounded-full bg-primary mt-0.5 animate-scale-in" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
