import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useGetMyInquiriesQuery } from '../../../features/inquiries/inquiriesApi';
import { InquiryChatThread } from '../../../components/inquiries/InquiryChatThread';
import { Badge } from '../../../components/ui/Badge';
import { formatDate } from '../../../utils/format';

export const MyInquiriesPage = () => {
  const location = useLocation();
  const openInquiryId = (location.state as { openInquiryId?: string } | null)?.openInquiryId;
  const { data: inquiries = [], isLoading } = useGetMyInquiriesQuery();
  const [openId, setOpenId] = useState<string | null>(openInquiryId ?? null);

  // Coming straight from "Send Enquiry" — jump to and open that conversation once it loads.
  useEffect(() => {
    if (!openInquiryId) return;
    setOpenId(openInquiryId);
    const el = document.getElementById(`inquiry-${openInquiryId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [openInquiryId, inquiries.length]);

  if (isLoading) return <div className="py-20 text-center text-muted">Loading...</div>;

  if (inquiries.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="text-5xl mb-3">💬</div>
        <h3 className="font-semibold text-navy">No inquiries yet</h3>
        <p className="text-sm text-muted mt-1">Browse listings and submit inquiries on properties you're interested in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inquiries.map((inq) => {
        const isOpen = openId === inq.id;
        return (
          <div key={inq.id} id={`inquiry-${inq.id}`} className="bg-white border border-border rounded-xl overflow-hidden scroll-mt-4">
            <button
              onClick={() => setOpenId(isOpen ? null : inq.id)}
              className="w-full p-5 flex gap-4 text-left hover:bg-cream/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0">💬</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-navy">{inq.property?.title}</span>
                  <Badge status={inq.status} />
                </div>
                <div className="text-xs text-muted mt-0.5">
                  Submitted {formatDate(inq.createdAt)} · Prefers {inq.preferredContact}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-teal flex-shrink-0 self-center">
                <MessageCircle size={14} /> {isOpen ? 'Hide chat' : 'Open chat'}
              </div>
            </button>
            {isOpen && <InquiryChatThread inquiry={inq} />}
          </div>
        );
      })}
    </div>
  );
};
