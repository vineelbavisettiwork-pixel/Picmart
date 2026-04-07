import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingCart, TrendingUp, Package } from "lucide-react";

const AdminEarnings = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 });
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: orders } = await supabase.from("orders").select("total_amount");
      if (orders) {
        const total = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
        setStats({ totalRevenue: total, totalOrders: orders.length, avgOrderValue: orders.length ? Math.round(total / orders.length) : 0 });
      }

      const { data: items } = await supabase.from("order_items").select("product_name, quantity, price");
      if (items) {
        const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
        items.forEach((item) => {
          if (!productMap[item.product_name]) productMap[item.product_name] = { name: item.product_name, qty: 0, revenue: 0 };
          productMap[item.product_name].qty += item.quantity;
          productMap[item.product_name].revenue += Number(item.price) * item.quantity;
        });
        setTopProducts(Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { icon: DollarSign, label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, color: "text-primary" },
    { icon: ShoppingCart, label: "Total Orders", value: stats.totalOrders, color: "text-primary" },
    { icon: TrendingUp, label: "Avg Order Value", value: `₹${stats.avgOrderValue}`, color: "text-primary" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Earnings</h2>
        <div className="grid grid-cols-1 gap-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 shadow-card">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center"><Icon className={`w-5 h-5 ${stat.color}`} /></div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="text-sm font-bold">Top Selling Products</h3>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
        ) : topProducts.map((p, i) => (
          <div key={p.name} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <span className="text-lg font-bold text-primary w-6">#{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold truncate">{p.name}</p>
              <p className="text-[10px] text-muted-foreground">{p.qty} sold</p>
            </div>
            <p className="text-sm font-bold text-primary">₹{p.revenue.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminEarnings;
