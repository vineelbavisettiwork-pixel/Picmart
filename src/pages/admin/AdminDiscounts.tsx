import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const AdminDiscounts = () => {
  const [promos, setPromos] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", discount_type: "percentage" as const, discount_value: "", min_order_amount: "", max_uses: "", expiry_date: "", is_active: true });

  const fetch_ = async () => {
    const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
    setPromos(data || []);
  };
  useEffect(() => { fetch_(); }, []);

  const handleSubmit = async () => {
    if (!form.code || !form.discount_value) { toast.error("Code and discount value required"); return; }
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : 0,
      expiry_date: form.expiry_date || null,
      is_active: form.is_active,
    };
    if (editingId) { await supabase.from("promo_codes").update(payload).eq("id", editingId); toast.success("Updated"); }
    else { await supabase.from("promo_codes").insert(payload); toast.success("Created"); }
    setForm({ code: "", discount_type: "percentage", discount_value: "", min_order_amount: "", max_uses: "", expiry_date: "", is_active: true });
    setEditingId(null); setShowForm(false); fetch_();
  };

  const toggle = async (id: string, active: boolean) => { await supabase.from("promo_codes").update({ is_active: !active }).eq("id", id); fetch_(); };
  const del = async (id: string) => { await supabase.from("promo_codes").delete().eq("id", id); toast.success("Deleted"); fetch_(); };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Promo Codes ({promos.length})</h2>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold"><Plus className="w-3 h-3" /> Add</button>
        </div>
        {showForm && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-3 animate-slide-in">
            <input value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} placeholder="Promo code (e.g. PICMART10)" className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            <select value={form.discount_type} onChange={(e) => setForm({...form, discount_type: e.target.value as any})} className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm">
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (₹)</option>
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.discount_value} onChange={(e) => setForm({...form, discount_value: e.target.value})} placeholder="Discount value" type="number" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
              <input value={form.min_order_amount} onChange={(e) => setForm({...form, min_order_amount: e.target.value})} placeholder="Min order ₹" type="number" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={form.max_uses} onChange={(e) => setForm({...form, max_uses: e.target.value})} placeholder="Max uses" type="number" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
              <input value={form.expiry_date} onChange={(e) => setForm({...form, expiry_date: e.target.value})} type="date" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold">{editingId ? "Update" : "Create"}</button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-lg border border-border text-xs">Cancel</button>
            </div>
          </div>
        )}
        {promos.map((p) => (
          <div key={p.id} className="bg-card rounded-xl border border-border p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-primary">{p.code}</p>
                <p className="text-xs text-muted-foreground">{p.discount_type === "percentage" ? `${p.discount_value}% off` : `₹${p.discount_value} off`}</p>
                <p className="text-[10px] text-muted-foreground">Used: {p.used_count}/{p.max_uses || "∞"}</p>
                {p.expiry_date && <p className="text-[10px] text-muted-foreground">Expires: {new Date(p.expiry_date).toLocaleDateString()}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggle(p.id, p.is_active)}>{p.is_active ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}</button>
                <button onClick={() => del(p.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDiscounts;
