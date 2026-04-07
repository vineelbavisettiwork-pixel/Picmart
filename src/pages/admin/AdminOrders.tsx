import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusOptions = ["Order Placed", "Processing", "Dispatched", "Out for Delivery", "Delivered"] as const;

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchOrders = async () => {
    let query = supabase.from("orders").select("*, order_items(*, products(name, image_url))").order("created_at", { ascending: false });
    if (filter) query = query.eq("status", filter as any);
    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (orderId: string, status: string) => {
    await supabase.from("orders").update({ status: status as any }).eq("id", orderId);
    toast.success(`Order updated to ${status}`);
    fetchOrders();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Orders ({orders.length})</h2>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setFilter("")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${!filter ? "gradient-primary text-primary-foreground" : "bg-card border border-border"}`}>All</button>
          {statusOptions.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${filter === s ? "gradient-primary text-primary-foreground" : "bg-card border border-border"}`}>{s}</button>
          ))}
        </div>

        {loading ? <p className="text-center text-sm text-muted-foreground py-8">Loading...</p> : orders.map((order) => (
          <div key={order.id} className="bg-card rounded-xl border border-border p-3 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-foreground">#{order.order_number}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <p className="text-sm font-bold text-primary">₹{order.total_amount}</p>
            </div>
            <p className="text-xs text-muted-foreground truncate">📍 {order.delivery_address}</p>
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex gap-2 bg-secondary rounded-lg p-2">
                <div className="flex-1">
                  <p className="text-xs font-medium">{item.product_name} × {item.quantity}</p>
                  {item.custom_text && <p className="text-[10px] text-primary">✍️ {item.custom_text}</p>}
                  {item.custom_photo_url && <p className="text-[10px] text-primary">📷 Photo attached</p>}
                </div>
                <p className="text-xs font-bold">₹{item.price}</p>
              </div>
            ))}
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground">Update Status:</label>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-secondary border border-border text-xs"
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
