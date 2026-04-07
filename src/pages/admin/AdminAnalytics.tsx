import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, ShoppingCart, Package, TrendingUp } from "lucide-react";

const AdminAnalytics = () => {
  const [data, setData] = useState({ totalUsers: 0, newUsersMonth: 0, totalOrders: 0, totalProducts: 0 });
  const [categorySales, setCategorySales] = useState<any[]>([]);

  useEffect(() => {
    const fetch_ = async () => {
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const monthAgo = new Date(); monthAgo.setMonth(monthAgo.getMonth() - 1);
      const { count: newUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString());
      const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true });
      const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true });
      
      setData({ totalUsers: totalUsers || 0, newUsersMonth: newUsers || 0, totalOrders: totalOrders || 0, totalProducts: totalProducts || 0 });

      const { data: cats } = await supabase.from("categories").select("name, products(id)");
      setCategorySales((cats || []).map((c: any) => ({ name: c.name, count: c.products?.length || 0 })));
    };
    fetch_();
  }, []);

  const stats = [
    { icon: Users, label: "Total Users", value: data.totalUsers },
    { icon: Users, label: "New This Month", value: data.newUsersMonth },
    { icon: ShoppingCart, label: "Total Orders", value: data.totalOrders },
    { icon: Package, label: "Total Products", value: data.totalProducts },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Analytics</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card rounded-xl border border-border p-3 shadow-card">
                <Icon className="w-5 h-5 text-primary mb-1" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            );
          })}
        </div>

        <h3 className="text-sm font-bold">Products by Category</h3>
        {categorySales.map((c) => (
          <div key={c.name} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">{c.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full gradient-primary rounded-full" style={{ width: `${Math.min(100, c.count * 20)}%` }} />
              </div>
              <span className="text-xs font-bold text-primary">{c.count}</span>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
