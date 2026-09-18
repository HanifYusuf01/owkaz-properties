import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useGetInquiriesQuery, useUpdateInquiryMutation, useAssignInquiryMutation } from '../../../features/inquiries/inquiriesApi';
import { useGetUsersQuery } from '../../../features/users/usersApi';
import { InquiryChatThread } from '../../../components/inquiries/InquiryChatThread';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Select } from '../../../components/ui/Select';
import { formatDate } from '../../../utils/format';
import { UserRole } from '../../../types';

export const InquiriesPage = () => {
  const { data: inquiries = [], isLoading } = useGetInquiriesQuery({});
  const { data: usersData } = useGetUsersQuery({ role: UserRole.AGENT, limit: 1000 });
  const users = usersData?.data ?? [];
  const [update] = useUpdateInquiryMutation();
  const [assign] = useAssignInquiryMutation();
  const [selected, setSelected] = useState<string | null>(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  const selectedInquiry = inquiries.find((i) => i.id === selected);

  const handleAssign = async () => {
    if (!selected || !assignUserId) return;
    await assign({ id: selected, assignedToId: assignUserId });
    setSelected(null);
  };

  if (isLoading) return <div className="py-20 text-center text-muted">Loading...</div>;

  return (
    <div className="space-y-4">
      {inquiries.map((inq) => {
        const isOpen = openId === inq.id;
        return (
          <div key={inq.id} className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0">💬</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-navy">{inq.property?.title}</span>
                  <Badge status={inq.status} />
                </div>
                <div className="text-xs text-muted mt-0.5">
                  From: {inq.buyer?.name} · {formatDate(inq.createdAt)} · Prefers {inq.preferredContact}
                </div>
                <p className="text-xs text-ink mt-2 pt-2 border-t border-border">{inq.message}</p>
                {inq.assignedTo && (
                  <div className="text-xs text-teal mt-1">Assigned to: {inq.assignedTo.name}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => setOpenId(isOpen ? null : inq.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal hover:text-teal-light transition-colors"
                >
                  <MessageCircle size={14} /> {isOpen ? 'Hide chat' : 'Open chat'}
                </button>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(inq.id)}>Assign</Button>
                  <Button variant="success" size="sm" onClick={() => update({ id: inq.id, status: 'responded' })}>
                    Mark Responded
                  </Button>
                </div>
              </div>
            </div>
            {isOpen && <InquiryChatThread inquiry={inq} />}
          </div>
        );
      })}

      {inquiries.length === 0 && (
        <div className="py-20 text-center text-muted">No inquiries yet</div>
      )}

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Assign Inquiry"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignUserId}>Assign</Button>
          </>
        }
      >
        <Select
          label="Assign To Agent"
          placeholder="Select an agent..."
          options={users.map((u) => ({ value: u.id, label: u.name }))}
          value={assignUserId}
          onChange={(e) => setAssignUserId(e.target.value)}
        />
      </Modal>
    </div>
  );
};
