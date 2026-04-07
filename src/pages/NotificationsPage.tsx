import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetch_ = async () => {
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setNotifications(data || []);
      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    };
    fetch_();
  }, [user]);

  return (
    <AppLayout>
      <div className="px-4 py-3 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Bell className="w-12 h-12 mb-3" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : notifications.map((n) => (
          <div key={n.id} className={`bg-card rounded-xl border border-border p-3 mb-2 ${!n.is_read ? "border-primary/30" : ""}`}>
            <p className="text-sm font-semibold text-foreground">{n.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
