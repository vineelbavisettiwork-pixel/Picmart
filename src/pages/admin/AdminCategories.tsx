import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", icon: "", image_url: "", display_order: 0 });

  const fetch_ = async () => {
    const { data } = await supabase.from("categories").select("*").order("display_order");
    setCategories(data || []);
  };
  useEffect(() => { fetch_(); }, []);

  const handleSubmit = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    if (editingId) { await supabase.from("categories").update(form).eq("id", editingId); toast.success("Updated"); }
    else { await supabase.from("categories").insert(form); toast.success("Added"); }
    setForm({ name: "", icon: "", image_url: "", display_order: 0 }); setEditingId(null); setShowForm(false); fetch_();
  };

  const del = async (id: string) => { await supabase.from("categories").delete().eq("id", id); toast.success("Deleted"); fetch_(); };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Categories ({categories.length})</h2>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {showForm && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-3 animate-slide-in">
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Category name" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <input value={form.icon} onChange={(e) => setForm({...form, icon: e.target.value})} placeholder="Icon emoji (e.g. 🖼️)" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <input value={form.image_url} onChange={(e) => setForm({...form, image_url: e.target.value})} placeholder="Image URL" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <input value={form.display_order} onChange={(e) => setForm({...form, display_order: parseInt(e.target.value) || 0})} placeholder="Display order" type="number" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">{editingId ? "Update" : "Add"}</button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-lg border border-border text-xs">Cancel</button>
            </div>
          </div>
        )}
        {categories.map((c) => (
          <div key={c.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <span className="text-2xl">{c.icon || "📦"}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{c.name}</p>
              <p className="text-[10px] text-muted-foreground">Order: {c.display_order}</p>
            </div>
            <button onClick={() => { setForm(c); setEditingId(c.id); setShowForm(true); }} className="p-1.5"><Edit2 className="w-3.5 h-3.5 text-primary" /></button>
            <button onClick={() => del(c.id)} className="p-1.5"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
