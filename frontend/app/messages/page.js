"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import io from "socket.io-client";
import SectionHeading from "../../components/SectionHeading";
import { api, API_BASE } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { Send } from "lucide-react";

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>}>
      <MessagesView />
    </Suspense>
  );
}

function MessagesView() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationFromQuery = searchParams.get("conversation");

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(conversationFromQuery || null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    api.get("/social/conversations").then(({ data }) => setConversations(data.conversations || [])).catch(() => {});

    const socketUrl = API_BASE.replace(/\/api\/?$/, "");
    socketRef.current = io(socketUrl, { transports: ["websocket"] });
    return () => socketRef.current?.disconnect();
  }, []);

  // If we arrived here from a member's profile (e.g. /messages?conversation=ID
  // after clicking "Message"), open that conversation as soon as we land,
  // even before it shows up in the sidebar list above.
  useEffect(() => {
    if (conversationFromQuery) setActiveId(conversationFromQuery);
  }, [conversationFromQuery]);

  useEffect(() => {
    if (!activeId) return;
    api.get(`/social/conversations/${activeId}/messages`).then(({ data }) => setMessages(data.messages || []));

    socketRef.current?.emit("join_conversation", activeId);
    const handler = (msg) => {
      if (msg.conversation === activeId) setMessages((m) => [...m, msg]);
    };
    socketRef.current?.on("new_message", handler);
    return () => socketRef.current?.off("new_message", handler);
  }, [activeId]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    await api.post(`/social/conversations/${activeId}/messages`, { text });
    setText("");
  }

  function otherParticipant(conversation) {
    return conversation.participants?.find((p) => p._id !== user?._id) || conversation.participants?.[0];
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading eyebrow="Messaging" title="Conversations" align="left" />

      <div className="grid gap-4 sm:grid-cols-[260px_1fr]">
        <div className="card-official h-[420px] overflow-y-auto rounded-lg">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-ink/55">
              No conversations yet. Follow a member, then visit their profile and tap "Message" to start one.
            </p>
          ) : (
            conversations.map((c) => {
              const other = otherParticipant(c);
              return (
                <div
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={`block w-full cursor-pointer border-b border-ink/5 p-3 text-left text-sm ${activeId === c._id ? "bg-navy/5" : ""}`}
                >
                  <p
                    onClick={(e) => {
                      e.stopPropagation();
                      if (other?._id) router.push(`/members/${other._id}`);
                    }}
                    className="inline font-semibold text-navy hover:text-gold-dim hover:underline"
                  >
                    {other?.fullName || "Member"}
                  </p>
                  <p className="line-clamp-1 text-xs text-ink/55">{c.lastMessage || "No messages yet"}</p>
                </div>
              );
            })
          )}
        </div>

        <div className="card-official flex h-[420px] flex-col rounded-lg">
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {messages.map((m) => {
              const sentByMe = m.sender?._id === user?._id;
              return (
                <div key={m._id} className={`flex ${sentByMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      sentByMe ? "bg-gold/25 text-navy" : "bg-navy/5 text-ink/80"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
            {!activeId && <p className="text-sm text-ink/45">Select a conversation to start chatting.</p>}
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-ink/10 p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={!activeId}
              placeholder="Type a message"
              className="flex-1 rounded-full border border-ink/15 px-4 py-2 text-sm disabled:opacity-50"
            />
            <button disabled={!activeId} className="btn-gold rounded-full p-2.5 disabled:opacity-50">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
