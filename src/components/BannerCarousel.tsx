import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link: string | null;
  is_active: boolean;
}

const BannerCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (data && data.length > 0) setBanners(data);
      setLoading(false);
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleBannerClick = (link: string | null) => {
    if (!link) return;
    if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      navigate(link);
    }
  };

  if (loading) {
    return <div className="w-full aspect-[2/1] rounded-xl bg-secondary animate-pulse" />;
  }

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl mx-auto">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            onClick={() => handleBannerClick(banner.link)}
            className="min-w-full min-h-[140px] aspect-[9/4] rounded-xl overflow-hidden cursor-pointer bg-secondary/30 flex items-center justify-center p-1"
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === current ? "bg-primary-foreground w-5" : "bg-primary-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
