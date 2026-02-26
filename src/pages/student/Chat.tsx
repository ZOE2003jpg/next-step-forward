import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Msg {
  id: number;
  from: "user" | "support";
  text: string;
  time: string;
}

export default function ChatScreen() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 1, from: "support", text: "Hello! 👋 I'm NexGo AI. How can I help you today?", time: "Now" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Msg = { id: Date.now(), from: "user", text: input, time: now };
    setMsgs((p) => [...p, userMsg]);
    const txt = input;
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { message: txt },
      });
      const reply = data?.reply || data?.message || "Sorry, I couldn't process that.";
      setMsgs((p) => [...p, { id: Date.now() + 1, from: "support", text: error ? "Oops, something went wrong." : reply, time: now }]);
    } catch {
      setMsgs((p) => [...p, { id: Date.now() + 1, from: "support", text: "Connection error. Try again.", time: now }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-up">
      <div className="p-4 border-b border-border flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-full gradient-gold-subtle flex items-center justify-center text-base">💬</div>
        <div>
          <div className="font-semibold text-[15px] text-foreground">NexGo AI</div>
          <div className="text-[11px] text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse-scale" />Online
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {msgs.map((m) => (
          <div key={m.id} className={`flex flex-col max-w-[80%] ${m.from === "user" ? "items-end self-end" : "items-start self-start"}`}>
            <div className={`py-2.5 px-3.5 text-sm leading-relaxed ${
              m.from === "user"
                ? "bg-primary text-primary-foreground rounded-[18px_18px_4px_18px] font-medium"
                : "bg-secondary text-foreground rounded-[18px_18px_18px_4px]"
            }`}>
              {m.from === "support" ? <div className="prose prose-sm prose-invert max-w-none"><ReactMarkdown>{m.text}</ReactMarkdown></div> : m.text}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 px-1">{m.time}</div>
          </div>
        ))}
        {loading && (
          <div className="self-start bg-secondary rounded-[18px_18px_18px_4px] py-2.5 px-3.5 text-muted-foreground text-sm">Thinking...</div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 px-4 border-t border-border flex gap-2.5 items-center shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 bg-secondary border border-border rounded-[22px] py-2.5 px-4 text-foreground text-sm outline-none"
        />
        <button onClick={send} className="w-[42px] h-[42px] rounded-full bg-primary text-primary-foreground text-lg flex items-center justify-center border-none cursor-pointer shrink-0">➤</button>
      </div>
    </div>
  );
}
