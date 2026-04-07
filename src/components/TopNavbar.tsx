import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import picmartLogo from "@/assets/picmart-logo.jpg";

interface TopNavbarProps {
  notificationCount?: number;
}

const TopNavbar = ({ notificationCount = 0 }: TopNavbarProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 gradient-primary shadow-top-nav">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2.5" onClick={() => navigate("/")} role="button">
          <img src={picmartLogo} alt="Picmart Logo" className="w-9 h-9 rounded-full object-cover border-2 border-primary-foreground/40" />
          <div className="flex flex-col leading-tight">
            <span className="text-primary-foreground font-bold text-base tracking-wide">Picmart</span>
            <span className="text-primary-foreground/70 text-[9px] font-medium -mt-0.5">Photo Frame Maker's</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/notifications")}
          className="relative p-2 rounded-full hover:bg-primary-foreground/10 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-primary-foreground" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] bg-notification text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
