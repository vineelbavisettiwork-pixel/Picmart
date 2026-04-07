import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";
import { toast } from "sonner";

const AdminChat = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("user_id, created_at, message, is_from_admin, is_read")
      .order("created_at", { ascending: false });
    
    const grouped: Record<string, any> = {};
    (data || []).forEach((msg) => {
      if (!grouped[msg.user_id]) {
        grouped[msg.user_id] = { user_id: msg.user_id, last_message: msg.message, last_time: msg.created_at, unread: 0 };
      }
      if (!msg.is_from_admin && !msg.is_read) grouped[msg.user_id].unread++;
    });
    setConversations(Object.values(grouped));
  };

  const fetchMessages = async (userId: string) => {
    const { data } = await supabase.from("chat_messages").select("*").eq("user_id", userId).order("created_at");
    setMessages(data || []);
    await supabase.from("chat_messages").update({ is_read: true }).eq("user_id", userId).eq("is_from_admin", false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { if (selectedUser) fetchMessages(selectedUser); }, [selectedUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    await supabase.from("chat_messages").insert({ user_id: selectedUser, message: newMessage, is_from_admin: true, is_read: false });
    setNewMessage("");
    fetchMessages(selectedUser);
  };

  if (selectedUser) {
    return (
      <AdminLayout>
        <div className="flex flex-col h-[calc(100vh-120px)]">
          <button onClick={() => setSelectedUser(null)} className="text-xs text-primary font-semibold mb-2">← Back to chats</button>
          <div className="flex-1 overflow-y-auto space-y-2 pb-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_from_admin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs ${msg.is_from_admin ? "gradient-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"}`}>
                  {msg.message}
                  <p className={`text-[8px] mt-1 ${msg.is_from_admin ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type a reply..." className="flex-1 px-3 py-2 rounded-xl bg-secondary border border-border text-sm" />
            <button onClick={sendMessage} className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Support Chat</h2>
        {conversations.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No conversations yet</p>
        ) : conversations.map((conv) => (
          <button key={conv.user_id} onClick={() => setSelectedUser(conv.user_id)} className="w-full bg-card rounded-xl border border-border p-3 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold text-primary">U</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{conv.user_id.slice(0, 8)}...</p>
              <p className="text-xs text-muted-foreground truncate">{conv.last_message}</p>
            </div>
            {conv.unread > 0 && (
              <span className="w-5 h-5 bg-notification text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">{conv.unread}</span>
            )}
          </button>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminChat;
