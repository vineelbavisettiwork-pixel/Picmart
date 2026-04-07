import AppLayout from "@/components/AppLayout";
import ProductCard from "@/components/ProductCard";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  name: string;
  icon: string | null;
  image_url: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string;
  free_shipping: boolean | null;
  category_id: string | null;
}

const CategoriesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order", { ascending: true }),
        supabase.from("products").select("*").eq("is_visible", true).order("created_at", { ascending: false }),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Only show products when a category is selected or search is active
  const showProducts = selectedCategory !== null || search.length > 0;

  return (
    <AppLayout>
      <div className="px-4 py-3 space-y-4 animate-fade-in">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Category Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  selectedCategory === cat.id
                    ? "border-primary bg-primary-light shadow-card"
                    : "border-border bg-card"
                }`}
              >
                <span className="text-2xl">{cat.icon || "📦"}</span>
                <span className="text-xs font-medium text-foreground text-center">{cat.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Products - only show when category selected or searching */}
        {showProducts && (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price ?? undefined}
                image={product.image_url}
                rating={4.5}
                reviewCount={0}
                freeShipping={product.free_shipping ?? false}
                onAddToCart={() => toast.success(`${product.name} added to cart!`)}
              />
            ))}
          </div>
        )}

        {showProducts && filteredProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No products found
          </div>
        )}

        {categories.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No categories yet
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CategoriesPage;
