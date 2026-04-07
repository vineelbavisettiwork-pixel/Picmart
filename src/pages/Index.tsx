// ⚠️ STRICT INSTRUCTION: Do NOT add any mock/fake/placeholder product data, categories section,
// or fake ad banners on the home screen. All content must come from the real Supabase backend.

import AppLayout from "@/components/AppLayout";
import SectionHeader from "@/components/SectionHeader";
import ProductCard from "@/components/ProductCard";
import BannerCarousel from "@/components/BannerCarousel";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string;
  free_shipping: boolean | null;
  is_featured: boolean | null;
  is_new_arrival: boolean | null;
  is_best_seller: boolean | null;
  category_id: string | null;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (name: string) => {
    toast.success(`${name} added to cart!`);
  };

  const featured = products.filter((p) => p.is_featured);
  const newArrivals = products.filter((p) => p.is_new_arrival);
  const bestSellers = products.filter((p) => p.is_best_seller);

  const mapProduct = (p: Product) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    image: p.image_url,
    rating: 4.5,
    reviewCount: 0,
    freeShipping: p.free_shipping ?? false,
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 py-3 space-y-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-5 w-40 bg-secondary rounded animate-pulse" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-48 bg-secondary rounded-xl animate-pulse" />
                <div className="h-48 bg-secondary rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-3 space-y-5 animate-fade-in">
        <BannerCarousel />
        
        {/* Featured Products */}
        {featured.length > 0 && (
          <section>
            <SectionHeader title="✨ Featured Products" onViewAll={() => navigate("/categories")} />
            <div className="grid grid-cols-2 gap-3">
              {featured.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  {...mapProduct(product)}
                  onAddToCart={() => handleAddToCart(product.name)}
                />
              ))}
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section>
            <SectionHeader title="🆕 New Arrivals" onViewAll={() => navigate("/categories")} />
            <div className="flex gap-3 overflow-x-auto pb-2">
              {newArrivals.map((product) => (
                <div key={product.id} className="min-w-[160px]">
                  <ProductCard {...mapProduct(product)} onAddToCart={() => handleAddToCart(product.name)} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section>
            <SectionHeader title="🔥 Best Sellers" onViewAll={() => navigate("/categories")} />
            <div className="grid grid-cols-2 gap-3">
              {bestSellers.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  {...mapProduct(product)}
                  onAddToCart={() => handleAddToCart(product.name)}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Products (Always show this section so untagged products appear) */}
        {products.length > 0 && (
          <section>
            <SectionHeader title="🛍️ Explore All Products" onViewAll={() => navigate("/categories")} />
            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  {...mapProduct(product)}
                  onAddToCart={() => handleAddToCart(product.name)}
                />
              ))}
            </div>
          </section>
        )}

        {products.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <p>No products yet. Admin can add products from the admin panel.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default HomePage;
