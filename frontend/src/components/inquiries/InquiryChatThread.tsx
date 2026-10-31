import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, ExternalLink, Home } from 'lucide-react';
import {
  useGetInquiryMessagesQuery,
  useSendInquiryMessageMutation,
} from '../../features/inquiries/inquiriesApi';
import { useAppSelector } from '../../store';
import { getImageUrl } from '../../utils/imageUrl';
import { formatPrice } from '../../utils/format';
import { Inquiry } from '../../types';
import { Avatar } from '../ui/Avatar';
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

  useEffect(() => {
    if (!awaitingAiReply) return;
    const fastPoll = setInterval(() => refetch(), 700);
    const giveUp = setTimeout(() => setAwaitingAiReply(false), 20000);
    return () => {
      clearInterval(fastPoll);
      clearTimeout(giveUp);
    };
  }, [awaitingAiReply, refetch]);

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

  const assistantActive = isBuyer && !inquiry.assignedTo;
  const headerName = !isBuyer ? inquiry.buyer?.name ?? 'Buyer' : inquiry.assignedTo ? 'Owkaz Team' : 'Owkaz Assistant';
  const headerHint = !isBuyer
    ? 'Enquiry chat'
    : inquiry.assignedTo
      ? 'A team member is helping you'
      : 'Ask anything about this property';

  return (
    <div className="mx-auto w-full max-w-md my-4 rounded-2xl overflow-hidden border border-border bg-white shadow-xl flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-navy text-white">
        <Avatar name={headerName} className="w-10 h-10 text-base" />
        <div className="min-w-0">
          <div className="text-sm font-semibold truncate">{headerName}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/70">
            {assistantActive && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
            {headerHint}
          </div>
        </div>
      </div>

      {inquiry.property && (
        <Link
          to={`/properties/${inquiry.property.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-border hover:bg-cream/60 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-cream overflow-hidden flex-shrink-0 flex items-center justify-center text-muted">
            {inquiry.property.images?.[0] ? (
              <img src={getImageUrl(inquiry.property.images[0])} alt={inquiry.property.title} className="w-full h-full object-cover" />
            ) : (
              <Home size={16} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-navy truncate">{inquiry.property.title}</div>
            <div className="text-[11px] text-muted truncate">{formatPrice(inquiry.property.price)}</div>
          </div>
          <ExternalLink size={14} className="text-teal flex-shrink-0" />
        </Link>
      )}

      <div className="h-80 overflow-y-auto px-4 py-4 space-y-3 bg-surface">
        {isLoading ? (
          <div className="text-xs text-muted text-center py-4">Loading conversation…</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-muted text-center py-4">No messages yet.</div>
        ) : (
          messages.map((m) => {
            const isMine = m.sender.id === currentUserId;
            return (
              <div key={m.id} className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                {!isMine && <Avatar name={m.sender.name} avatarUrl={m.sender.avatarUrl} className="w-7 h-7 text-xs" />}
                <div className={`max-w-[78%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                      isMine
                        ? 'bg-teal text-white rounded-2xl rounded-br-md'
                        : 'bg-white border border-border text-ink rounded-2xl rounded-bl-md'
                    }`}
                  >
                    {m.message}
                  </div>
                  <div className="mt-1 px-1 text-[10px] text-muted">
                    {!isMine && !m.sender.isBot ? `${m.sender.name} · ` : ''}
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {awaitingAiReply && (
          <div className="flex items-end gap-2">
            <Avatar name="Owkaz Assistant" className="w-7 h-7 text-xs" />
            <div className="bg-white border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1" aria-label="Assistant is typing">
              <span className="w-1.5 h-1.5 rounded-full bg-muted/70 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted/70 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted/70 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex flex-wrap gap-2 px-4 pt-3 bg-white border-t border-border">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => handleSend(s)}
            disabled={isSending}
            className="px-3 py-1.5 rounded-full border border-teal/40 text-xs text-teal bg-white hover:bg-teal hover:text-white transition-colors disabled:opacity-50"
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
          placeholder="Type your message"
          className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={isSending || !text.trim()}
          className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-teal text-white hover:bg-teal-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
