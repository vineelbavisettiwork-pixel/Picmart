import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const AdminBanners = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", link: "", is_active: true, display_order: 0 });

  const fetch_ = async () => {
    const { data } = await supabase.from("banners").select("*").order("display_order");
    setBanners(data || []);
  };
  useEffect(() => { fetch_(); }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.image_url) { toast.error("Title and image URL required"); return; }
    if (editingId) { await supabase.from("banners").update(form).eq("id", editingId); toast.success("Banner updated"); }
    else { await supabase.from("banners").insert(form); toast.success("Banner added"); }
    setForm({ title: "", image_url: "", link: "", is_active: true, display_order: 0 });
    setEditingId(null); setShowForm(false); fetch_();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("banners").update({ is_active: !active }).eq("id", id); fetch_();
  };

  const del = async (id: string) => { await supabase.from("banners").delete().eq("id", id); toast.success("Deleted"); fetch_(); };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Banners ({banners.length})</h2>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {showForm && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-3 animate-slide-in">
            <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Banner title" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <input value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} placeholder="Image URL" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <input value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} placeholder="Link (optional)" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <input value={form.display_order} onChange={(e) => setForm({...form, display_order: parseInt(e.target.value) || 0})} placeholder="Order" type="number" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">{editingId ? "Update" : "Add"}</button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-lg border border-border text-xs">Cancel</button>
            </div>
          </div>
        )}
        {banners.map((b) => (
          <div key={b.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <img src={b.image_url} alt={b.title} className="w-16 h-10 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{b.title}</p>
              <p className="text-[10px] text-muted-foreground">{b.is_active ? "Active" : "Inactive"}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => toggle(b.id, b.is_active)} className="p-1.5">{b.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}</button>
              <button onClick={() => { setForm(b); setEditingId(b.id); setShowForm(true); }} className="p-1.5"><Edit2 className="w-3.5 h-3.5 text-primary" /></button>
              <button onClick={() => del(b.id)} className="p-1.5"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
