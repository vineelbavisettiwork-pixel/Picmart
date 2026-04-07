import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, MapPin, Tag, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  variant: string | null;
  custom_text: string | null;
  custom_photo_url: string | null;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [address, setAddress] = useState("");
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchCart();
    fetchDefaultAddress();
  }, [user]);

  const fetchDefaultAddress = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      if (!address) setAddress(data.full_address);
      setDeliveryLat(data.lat);
      setDeliveryLng(data.lng);
    }
  };

  const fetchCart = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("cart")
      .select("*, product:products(name, price, image_url)")
      .eq("user_id", user.id);
    
    if (data) {
      const validItems = data.filter((item: any) => item.product !== null) as CartItem[];
      setItems(validItems);
    }
    setLoading(false);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
  const total = subtotal - discount;

  const updateQuantity = async (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    await supabase.from("cart").update({ quantity: newQty }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i)));
  };

  const removeItem = async (id: string) => {
    await supabase.from("cart").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.success("Item removed from cart");
  };

  const applyPromo = async () => {
    const { data } = await supabase
      .from("promo_codes")
      .select("*")
      .eq("code", promoCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (!data) {
      toast.error("Invalid promo code");
      return;
    }

    if (data.min_order_amount && subtotal < Number(data.min_order_amount)) {
      toast.error(`Minimum order ₹${data.min_order_amount} required`);
      return;
    }

    const discountAmt = data.discount_type === "percentage"
      ? Math.round(subtotal * Number(data.discount_value) / 100)
      : Number(data.discount_value);

    setDiscount(discountAmt);
    setPromoApplied(true);
    toast.success(`Promo code applied! ₹${discountAmt} OFF`);
  };

  const fetchLocation = () => {
    setFetchingLocation(true);
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported by your browser");
      setFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`,
            {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'PicmartApp/1.0'
              }
            }
          );
          if (!res.ok) throw new Error("Geocoding failed");
          const data = await res.json();
          setAddress(data.display_name || `${pos.coords.latitude}, ${pos.coords.longitude}`);
          setDeliveryLat(pos.coords.latitude);
          setDeliveryLng(pos.coords.longitude);
          toast.success("Location fetched successfully!");
        } catch {
          setAddress(`Lat: ${pos.coords.latitude.toFixed(6)}, Lng: ${pos.coords.longitude.toFixed(6)}`);
          setDeliveryLat(pos.coords.latitude);
          setDeliveryLng(pos.coords.longitude);
          toast.info("Got coordinates, but couldn't get full address. Please edit manually.");
        }
        setFetchingLocation(false);
      },
      (err) => {
        let msg = "Unable to fetch location.";
        if (err.code === 1) msg = "Location permission denied. Please allow location access in your browser settings.";
        else if (err.code === 2) msg = "Location unavailable. Please enter address manually.";
        else if (err.code === 3) msg = "Location request timed out. Please try again.";
        toast.error(msg);
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    if (!address) {
      toast.error("Please add a delivery address");
      return;
    }
    if (items.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setPlacingOrder(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: total,
          delivery_address: address,
          delivery_lat: deliveryLat,
          delivery_lng: deliveryLng,
          promo_code: promoApplied ? promoCode.toUpperCase() : null,
          discount_amount: discount,
          order_number: "temp",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name ?? "",
        product_image: item.product?.image_url ?? "",
        price: item.product?.price ?? 0,
        quantity: item.quantity,
        variant: item.variant,
        custom_text: item.custom_text,
        custom_photo_url: item.custom_photo_url,
      }));

      await supabase.from("order_items").insert(orderItems);
      await supabase.from("cart").delete().eq("user_id", user.id);

      setOrderNumber(order.order_number);
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
    }
    setPlacingOrder(false);
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="px-4 py-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">Please login to view your cart</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Login</button>
        </div>
      </AppLayout>
    );
  }

  if (orderPlaced) {
    return (
      <AppLayout>
        <div className="px-4 py-12 text-center animate-scale-in">
          <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Order Placed!</h1>
          <p className="text-sm text-muted-foreground mb-2">Your order has been placed successfully</p>
          <div className="bg-accent rounded-xl p-4 mb-4 text-left">
            <p className="text-xs text-muted-foreground mb-1">Order ID</p>
            <p className="text-sm font-bold text-primary">{orderNumber}</p>
            <p className="text-xs text-muted-foreground mt-2 mb-1">Total Amount</p>
            <p className="text-sm font-bold text-foreground">₹{total}</p>
            <p className="text-xs text-muted-foreground mt-2 mb-1">Payment Method</p>
            <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
            <p className="text-xs text-muted-foreground mt-2 mb-1">Estimated Delivery</p>
            <p className="text-sm font-semibold text-foreground">5-7 working days</p>
          </div>
          <button onClick={() => navigate("/")} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm">
            Continue Shopping
          </button>
        </div>
      </AppLayout>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 py-3 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-3 space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-foreground">My Cart ({items.length})</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Your cart is empty</p>
            <button onClick={() => navigate("/")} className="mt-3 text-primary font-semibold text-sm">Shop Now</button>
          </div>
        ) : (
          <>
            {items.map((item) => (
              <div key={item.id} className="bg-card rounded-xl border border-border shadow-card p-3 flex gap-3">
                <img src={item.product?.image_url} alt={item.product?.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{item.product?.name}</h3>
                  {item.custom_text && <p className="text-[10px] text-primary mt-0.5">✍️ "{item.custom_text}"</p>}
                  {item.custom_photo_url && <p className="text-[10px] text-primary">📷 Photo attached</p>}
                  {item.variant && <p className="text-[10px] text-muted-foreground">Variant: {item.variant}</p>}
                  <p className="text-sm font-bold text-primary mt-1">₹{item.product?.price}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full border border-border flex items-center justify-center text-xs font-bold">-</button>
                      <span className="text-xs font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-xs font-bold">+</button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-card rounded-xl border border-border shadow-card p-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Promo Code</span>
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  disabled={promoApplied}
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
                <button onClick={applyPromo} disabled={promoApplied || !promoCode} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold disabled:opacity-50">
                  {promoApplied ? "Applied ✓" : "Apply"}
                </button>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Delivery Address</span>
                </div>
                <button onClick={fetchLocation} disabled={fetchingLocation} className="flex items-center gap-1 text-xs font-semibold text-primary disabled:opacity-50">
                  {fetchingLocation ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                  Use My Location
                </button>
              </div>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your full delivery address"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>

            <div className="bg-accent rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-lg">💵</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                <p className="text-[10px] text-muted-foreground">Pay when your order arrives</p>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border shadow-card p-3 space-y-2">
              <h3 className="text-sm font-bold text-foreground">Order Summary</h3>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-primary font-semibold">
                  <span>Discount</span><span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shipping</span><span className="text-primary font-semibold">FREE</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-sm font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">₹{total}</span>
              </div>
            </div>

            <button onClick={placeOrder} disabled={placingOrder} className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-70">
              {placingOrder ? "Placing Order..." : `Place Order — ₹${total}`}
            </button>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default CartPage;
