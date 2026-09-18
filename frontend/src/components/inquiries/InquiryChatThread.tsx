import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, ExternalLink, Sparkles } from 'lucide-react';
import {
  useGetInquiryMessagesQuery,
  useSendInquiryMessageMutation,
} from '../../features/inquiries/inquiriesApi';
import { useAppSelector } from '../../store';
import { getImageUrl } from '../../utils/imageUrl';
import { formatPrice } from '../../utils/format';
import { Inquiry } from '../../types';
import { INQUIRY_SUGGESTIONS } from '../../constants/inquirySuggestions';

interface InquiryChatThreadProps {
  inquiry: Inquiry;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

const STAFF_SUGGESTIONS = [
  "Yes, it's still available.",
  'When would you like to schedule a viewing?',
  'Let me check and get back to you shortly.',
  'This property has already been sold.',
];

export const InquiryChatThread = ({ inquiry }: InquiryChatThreadProps) => {
  const currentUserId = useAppSelector((s) => s.auth.user?.id);
  const { data: messages = [], isLoading, refetch } = useGetInquiryMessagesQuery(inquiry.id, { pollingInterval: 8000 });
  const [sendMessage, { isLoading: isSending }] = useSendInquiryMessageMutation();
  const [text, setText] = useState('');
  const [awaitingAiReply, setAwaitingAiReply] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const countWhenWaitingStarted = useRef(0);
  const waitStartedAt = useRef(0);

  const isBuyer = currentUserId === inquiry.buyer?.id;
  const suggestions = isBuyer ? INQUIRY_SUGGESTIONS : STAFF_SUGGESTIONS;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length, awaitingAiReply]);

  // While the AI assistant is drafting a reply, poll quickly so it appears as soon as it's
  // ready instead of waiting for the normal 8s background poll — with a timeout in case
  // the AI is disabled/unavailable, so the "typing…" indicator never gets stuck forever.
  useEffect(() => {
    if (!awaitingAiReply) return;
    const fastPoll = setInterval(() => refetch(), 700);
    const giveUp = setTimeout(() => setAwaitingAiReply(false), 20000);
    return () => {
      clearInterval(fastPoll);
      clearTimeout(giveUp);
    };
  }, [awaitingAiReply, refetch]);

  // Groq usually replies in well under a second — too fast for the indicator to read as
  // "thinking". Keep it visible for a minimum stretch so it never looks instant/pasted-in.
  const MIN_TYPING_MS = 900;
  useEffect(() => {
    if (!awaitingAiReply || messages.length <= countWhenWaitingStarted.current) return;
    const remaining = MIN_TYPING_MS - (Date.now() - waitStartedAt.current);
    if (remaining <= 0) {
      setAwaitingAiReply(false);
      return;
    }
    const t = setTimeout(() => setAwaitingAiReply(false), remaining);
    return () => clearTimeout(t);
  }, [messages.length, awaitingAiReply]);

  const handleSend = async (override?: string) => {
    const trimmed = (override ?? text).trim();
    if (!trimmed) return;
    setText('');
    const expectAiReply = isBuyer && !inquiry.assignedTo;
    if (expectAiReply) {
      countWhenWaitingStarted.current = messages.length + 1;
      waitStartedAt.current = Date.now();
    }
    await sendMessage({ id: inquiry.id, message: trimmed });
    if (expectAiReply) setAwaitingAiReply(true);
  };

  return (
    <div className="flex flex-col border-t border-border bg-cream/40">
      {/* Property context header */}
      {inquiry.property && (
        <Link
          to={`/properties/${inquiry.property.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 bg-white border-b border-border hover:bg-cream/60 transition-colors"
        >
          <div className="w-11 h-11 rounded-lg bg-cream overflow-hidden flex-shrink-0 flex items-center justify-center">
            {inquiry.property.images?.[0] ? (
              <img src={getImageUrl(inquiry.property.images[0])} alt={inquiry.property.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg opacity-40">🏠</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-navy truncate">{inquiry.property.title}</div>
            <div className="text-[11px] text-muted truncate">{formatPrice(inquiry.property.price)}</div>
          </div>
          <ExternalLink size={14} className="text-teal flex-shrink-0" />
        </Link>
      )}

      <div className="max-h-72 overflow-y-auto p-3 space-y-2.5">
        {isLoading ? (
          <div className="text-xs text-muted text-center py-4">Loading conversation…</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-muted text-center py-4">No messages yet.</div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender.id === currentUserId;
            const isBot = m.sender.isBot;

            if (isBot) {
              return (
                <div key={m.id} className="flex justify-center">
                  <div className="max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed bg-gold/10 border border-gold/25 text-navy">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gold mb-0.5">
                      <Sparkles size={11} /> {m.sender.name}
                    </div>
                    <div className="whitespace-pre-wrap">{m.message}</div>
                    <div className="text-[9px] mt-1 text-muted text-right">{formatTime(m.createdAt)}</div>
                  </div>
                </div>
              );
            }

            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    isMine ? 'bg-teal text-white rounded-br-sm' : 'bg-white border border-border text-ink rounded-bl-sm'
                  }`}
                >
                  {!isMine && <div className="text-[10px] font-bold text-navy mb-0.5">{m.sender.name}</div>}
                  <div className="whitespace-pre-wrap">{m.message}</div>
                  <div className={`text-[9px] mt-1 ${isMine ? 'text-white/60' : 'text-muted'}`}>{formatTime(m.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
        {awaitingAiReply && (
          <div className="flex justify-center">
            <div className="rounded-xl px-3.5 py-2.5 text-xs bg-gold/10 border border-gold/25 text-navy flex items-center gap-2">
              <Sparkles size={11} className="text-gold flex-shrink-0" />
              <span className="text-[10px] font-bold text-gold">Owkaz Assistant is typing</span>
              <span className="flex items-end gap-0.5">
                <span className="w-1 h-1 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-gold/70 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested quick replies */}
      <div className="flex flex-wrap gap-1.5 px-3 pt-2 bg-white border-t border-border">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            disabled={isSending}
            className="px-2.5 py-1 rounded-full border border-border text-[11px] text-muted hover:border-teal hover:text-teal transition-colors disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 p-3 bg-white">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-teal transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={isSending || !text.trim()}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-teal text-white hover:bg-teal-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
