import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, Plus, Home } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";

export default function AddressesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAddresses(data);
    }
    setLoading(false);
  };

  const captureNewLocation = () => {
    setFetchingLocation(true);
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      setFetchingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'PicmartApp/1.0' } }
          );
          if (!res.ok) throw new Error("Geocoding failed");
          const geoData = await res.json();
          const addressText = geoData.display_name || `${pos.coords.latitude}, ${pos.coords.longitude}`;
          
          const newAddress = {
            user_id: user?.id,
            full_address: addressText,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            is_default: addresses.length === 0,
            label: "Home"
          };

          const { data, error } = await supabase.from("addresses").insert(newAddress).select().single();
          if (error) throw error;
          
          setAddresses([data, ...addresses]);
          toast.success("New location captured & saved!");
        } catch (e) {
          toast.error("Failed to capture address.");
        }
        setFetchingLocation(false);
      },
      (err) => {
        toast.error("Location permission denied or unavailable.");
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    fetchAddresses();
    toast.success("Default address updated");
  };

  const deleteAddress = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    setAddresses(addresses.filter(a => a.id !== id));
    toast.success("Address removed");
  };

  return (
    <AppLayout>
      <div className="px-4 py-3 space-y-4 animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Saved Addresses</h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No addresses saved yet</p>
              </div>
            ) : (
              addresses.map(addr => (
                <div key={addr.id} className="bg-card rounded-xl border border-border flex flex-col p-4 relative shadow-sm">
                  {addr.is_default && (
                    <span className="absolute top-3 right-4 text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">DEFAULT</span>
                  )}
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1 pr-12">
                      <p className="font-semibold text-sm mb-1">{addr.label || "Home"}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{addr.full_address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                    {!addr.is_default && (
                      <button onClick={() => setDefault(addr.id)} className="text-xs font-semibold text-primary">Set as Default</button>
                    )}
                    <button onClick={() => deleteAddress(addr.id)} className="text-xs font-semibold text-destructive ml-auto">Remove</button>
                  </div>
                </div>
              ))
            )}

            <button 
              onClick={captureNewLocation}
              disabled={fetchingLocation}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-primary/50 text-primary font-semibold text-sm active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {fetchingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {fetchingLocation ? "Capturing Location..." : "Add Current Location"}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
