import { useNavigate, useParams } from "react-router-dom";
import { Star, ShoppingCart, Heart, ArrowLeft, Truck, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  image_url: string;
  description: string | null;
  free_shipping: boolean | null;
  variants: any;
}

interface Review {
  id: string;
  user_name: string | null;
  rating: number;
  review_text: string | null;
  created_at: string;
}

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState("");
  const [customPhoto, setCustomPhoto] = useState<File | null>(null);
  const [selectedVariant, setSelectedVariant] = useState("Standard");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      if (data) setProduct(data);
      
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", id)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      if (reviewData) setReviews(reviewData);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCustomPhoto(e.target.files[0]);
      toast.success("Photo selected successfully!");
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }
    if (!product) return;

    let photoUrl = null;
    if (customPhoto) {
      const ext = customPhoto.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("customisation-photos").upload(path, customPhoto);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("customisation-photos").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("cart").insert({
      user_id: user.id,
      product_id: product.id,
      quantity,
      variant: selectedVariant,
      custom_text: customText || null,
      custom_photo_url: photoUrl,
    });

    if (error) {
      toast.error("Failed to add to cart");
    } else {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate("/cart");
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="animate-pulse">
          <div className="w-full aspect-square bg-secondary" />
          <div className="px-4 py-4 space-y-3">
            <div className="h-6 w-3/4 bg-secondary rounded" />
            <div className="h-8 w-1/3 bg-secondary rounded" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="text-center py-12 text-muted-foreground">Product not found</div>
      </AppLayout>
    );
  }

  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants as string[]
    : ["Small", "Standard", "Large"];

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="relative">
          <img src={product.image_url} alt={product.name} className="w-full aspect-square object-cover" />
          <button onClick={() => navigate(-1)} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-card">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <button className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-card">
            <Heart className="w-5 h-5 text-foreground" />
          </button>
          {product.free_shipping && (
            <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-card border border-primary/20">
              <Truck className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Free Shipping All Over India</span>
            </div>
          )}
        </div>

        <div className="px-4 py-4 space-y-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? "text-yellow-500 fill-yellow-500" : "text-border"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({reviews.length} reviews)</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-primary">₹{product.price}</span>
              {product.original_price && (
                <>
                  <span className="text-base text-muted-foreground line-through">₹{product.original_price}</span>
                  <span className="text-xs font-bold gradient-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {product.description && (
            <div className="bg-secondary rounded-xl p-3">
              <h3 className="text-sm font-semibold text-foreground mb-1">Description</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Size / Variant</h3>
            <div className="flex gap-2 flex-wrap">
              {variants.map((v: string) => (
                <button
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium border transition-all ${
                    selectedVariant === v ? "border-primary bg-primary-light text-primary" : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-accent rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-foreground">✨ Personalise Your Gift</h3>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Upload Your Photo</label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 bg-background cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="w-5 h-5 text-primary" />
                <span className="text-xs text-muted-foreground">{customPhoto ? customPhoto.name : "Tap to upload from gallery"}</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Custom Text / Message</label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g., Happy Birthday Rahul!"
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <p className="text-[10px] text-muted-foreground italic">📷 Our team will use your photo and message for customisation</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Quantity</span>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground font-bold">-</button>
              <span className="text-sm font-bold text-foreground w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">+</button>
            </div>
          </div>

          <div className="flex gap-3 pb-2">
            <button onClick={handleAddToCart} className="flex-1 py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <button onClick={handleBuyNow} className="flex-1 py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm active:scale-[0.98] transition-transform">
              Buy Now
            </button>
          </div>

          {reviews.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-foreground mb-3">Reviews & Ratings</h3>
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-xl p-3 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">{review.user_name || "User"}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`w-3 h-3 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-border"}`} />
                    ))}
                  </div>
                  {review.review_text && <p className="text-xs text-muted-foreground">{review.review_text}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ProductDetailPage;
