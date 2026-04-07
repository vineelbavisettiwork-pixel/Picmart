import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ban, CheckCircle, Trash2 } from "lucide-react";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    await supabase.from("profiles").update({ is_blocked: !currentlyBlocked }).eq("user_id", userId);
    toast.success(currentlyBlocked ? "User unblocked" : "User blocked");
    fetchUsers();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Users ({users.length})</h2>
        {loading ? <p className="text-center text-sm text-muted-foreground py-8">Loading...</p> : users.map((user) => (
          <div key={user.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-primary">
              {user.full_name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user.full_name || "No name"}</p>
              <p className="text-[10px] text-muted-foreground">{user.phone || "No phone"}</p>
              <p className="text-[10px] text-muted-foreground">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => toggleBlock(user.user_id, user.is_blocked)} className={`p-2 rounded-lg ${user.is_blocked ? "text-primary" : "text-destructive"}`}>
                {user.is_blocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
