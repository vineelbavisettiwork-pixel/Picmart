import AppLayout from "@/components/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const [policy, setPolicy] = useState("");

  useEffect(() => {
    const fetch_ = async () => {
      const { data } = await supabase.from("app_settings").select("privacy_policy").limit(1).single();
      if (data) setPolicy(data.privacy_policy || "");
    };
    fetch_();
  }, []);

  return (
    <AppLayout>
      <div className="px-4 py-3 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-lg font-bold">Privacy Policy</h1>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">{policy || "Loading..."}</pre>
        </div>
      </div>
    </AppLayout>
  );
};

export default PrivacyPolicyPage;
