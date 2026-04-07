import { Star, ShoppingCart, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  freeShipping?: boolean;
  onAddToCart?: () => void;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviewCount,
  freeShipping,
  onAddToCart,
}: ProductCardProps) => {
  const navigate = useNavigate();
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="bg-card rounded-xl shadow-card overflow-hidden animate-fade-in border border-border/50 cursor-pointer" onClick={() => navigate(`/product/${id}`)}>
      <div className="relative aspect-square bg-secondary overflow-hidden">
        <img src={image} alt={name} className="w-full h-full object-cover" loading="lazy" />
        {discount > 0 && (
          <span className="absolute top-2 left-2 gradient-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </span>
        )}
        {freeShipping && (
          <span className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm text-primary text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary/20">
            <Truck className="w-3 h-3" /> Free Shipping
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight mb-1.5">{name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "text-yellow-500 fill-yellow-500" : "text-border"}`} />
            ))}
          </div>
          <span className="text-[10px] text-muted-foreground">({reviewCount})</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-primary">₹{price}</span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">₹{originalPrice}</span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(); }}
            className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground shadow-sm active:scale-95 transition-transform"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
