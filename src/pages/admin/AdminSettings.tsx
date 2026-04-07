import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save } from "lucide-react";

const AdminSettings = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      const { data } = await supabase.from("app_settings").select("*").limit(1).single();
      setSettings(data);
      setLoading(false);
    };
    fetch_();
  }, []);

  const save = async () => {
    if (!settings) return;
    const { error } = await supabase.from("app_settings").update(settings).eq("id", settings.id);
    if (error) toast.error("Failed to save");
    else toast.success("Settings saved!");
  };

  if (loading || !settings) return <AdminLayout><p className="text-center py-8 text-muted-foreground">Loading...</p></AdminLayout>;

  const update = (key: string, value: any) => setSettings({ ...settings, [key]: value });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">App Settings</h2>
          <button onClick={save} className="flex items-center gap-1 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold"><Save className="w-3 h-3" /> Save</button>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block">Store Name</label>
            <input value={settings.store_name} onChange={(e) => update("store_name", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Tagline</label>
            <input value={settings.tagline} onChange={(e) => update("tagline", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Contact Phone</label>
            <input value={settings.contact_phone} onChange={(e) => update("contact_phone", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Contact Email</label>
            <input value={settings.contact_email} onChange={(e) => update("contact_email", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Delivery Message</label>
            <input value={settings.delivery_message} onChange={(e) => update("delivery_message", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold">Maintenance Mode</label>
            <button onClick={() => update("maintenance_mode", !settings.maintenance_mode)} className={`w-12 h-6 rounded-full transition-colors ${settings.maintenance_mode ? "bg-destructive" : "bg-border"}`}>
              <div className={`w-5 h-5 rounded-full bg-background shadow-sm transform transition-transform ${settings.maintenance_mode ? "translate-x-6" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <label className="text-xs font-semibold mb-1 block">Privacy Policy</label>
          <textarea value={settings.privacy_policy} onChange={(e) => update("privacy_policy", e.target.value)} rows={10} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm resize-none" />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
