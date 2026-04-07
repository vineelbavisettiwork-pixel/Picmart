import AppLayout from "@/components/AppLayout";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// ⚠️ NO MOCK DATA — All orders are loaded from Supabase.

const statusSteps = ["Order Placed", "Processing", "Dispatched", "Out for Delivery", "Delivered"];

const getStatusIndex = (status: string) => {
  const map: Record<string, number> = {
    "Order Placed": 0,
    "Processing": 1,
    "Dispatched": 2,
    "Out for Delivery": 3,
    "Delivered": 4,
  };
  return map[status] ?? 0;
};

interface Order {
  id: string;
  product_name: string;
  image_url: string | null;
  created_at: string;
  total: number;
  status: string;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setOrders(data);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 py-3 space-y-3">
          <div className="h-6 w-28 bg-secondary rounded animate-pulse" />
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-3 space-y-3 animate-fade-in">
        <h1 className="text-lg font-bold text-foreground">My Orders</h1>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="w-12 h-12 mb-3" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusIdx = getStatusIndex(order.status);
            return (
              <div key={order.id} className="bg-card rounded-xl border border-border shadow-card p-3 space-y-3">
                <div className="flex gap-3">
                  {order.image_url && (
                    <img src={order.image_url} alt={order.product_name} className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{order.product_name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    <p className="text-sm font-bold text-primary mt-1">₹{order.total}</p>
                  </div>
                </div>

                {/* Status Tracker */}
                <div className="flex items-center gap-1">
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex items-center flex-1">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${i <= statusIdx ? "gradient-primary" : "bg-border"}`} />
                      {i < statusSteps.length - 1 && (
                        <div className={`h-0.5 flex-1 ${i < statusIdx ? "bg-primary" : "bg-border"}`} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between px-0.5">
                  {statusSteps.map((step, i) => (
                    <span key={step} className={`text-[7px] text-center leading-tight max-w-[50px] ${i <= statusIdx ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
};

export default OrdersPage;
