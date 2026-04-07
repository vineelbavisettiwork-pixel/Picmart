import AppLayout from "@/components/AppLayout";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChatPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at");
    setMessages(data || []);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { fetchMessages(); }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel("chat-" + user.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `user_id=eq.${user.id}` }, () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, message: newMessage, is_from_admin: false });
    setNewMessage("");
    fetchMessages();
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">Please login to chat with support</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold">Login</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-136px)]">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <button onClick={() => navigate("/account")}><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-sm font-bold">Support Chat</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">👋 Hi! How can we help you?</p>
              <p className="text-xs text-muted-foreground mt-1">Send us a message and we'll respond soon.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.is_from_admin ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs ${msg.is_from_admin ? "bg-secondary text-foreground rounded-bl-sm" : "gradient-primary text-primary-foreground rounded-br-sm"}`}>
                {msg.is_from_admin && <p className="text-[9px] font-semibold text-primary mb-0.5">Picmart Support</p>}
                {msg.message}
                <p className={`text-[8px] mt-1 ${msg.is_from_admin ? "text-muted-foreground" : "text-primary-foreground/60"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-3 border-t border-border flex gap-2">
          <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a message..." className="flex-1 px-3 py-2.5 rounded-xl bg-secondary border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={sendMessage} className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
