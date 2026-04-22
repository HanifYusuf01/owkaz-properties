import { useState } from 'react';
import { useGetUsersQuery, useUpdateUserStatusMutation, useDeleteUserMutation, useUpdateUserRoleMutation } from '../../../features/users/usersApi';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { formatDate } from '../../../utils/format';
import { User, UserRole, UserStatus } from '../../../types';
import { Trash2Icon } from 'lucide-react';

type ActionTarget = { id: string; name: string };
type PendingAction = { type: 'suspend' | 'activate' | 'delete'; target: ActionTarget };

const PAGE_SIZE = 10;

export const UsersPage = () => {
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [isActing, setIsActing] = useState(false);

  const { data, isLoading } = useGetUsersQuery({ role: roleFilter || undefined, page, limit: PAGE_SIZE });
  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const [updateStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [updateRole] = useUpdateUserRoleMutation();

  const roles = ['', 'admin', 'agent', 'owner', 'buyer'];

  const confirm = async () => {
    if (!pending) return;
    setIsActing(true);
    try {
      if (pending.type === 'suspend') await updateStatus({ id: pending.target.id, status: UserStatus.SUSPENDED });
      else if (pending.type === 'activate') await updateStatus({ id: pending.target.id, status: UserStatus.ACTIVE });
      else await deleteUser(pending.target.id);
    } finally {
      setIsActing(false);
      setPending(null);
    }
  };

  const modalConfig = pending ? {
    suspend: {
      title: 'Suspend User',
      message: `Are you sure you want to suspend ${pending.target.name}? They will no longer be able to access their account.`,
      confirmLabel: 'Suspend',
      variant: 'warning' as const,
    },
    activate: {
      title: 'Activate User',
      message: `Activate ${pending.target.name}'s account? They will regain full access.`,
      confirmLabel: 'Activate',
      variant: 'success' as const,
    },
    delete: {
      title: 'Delete User',
      message: `Permanently delete ${pending.target.name}? This cannot be undone and will remove all their data.`,
      confirmLabel: 'Delete',
      variant: 'danger' as const,
    },
  }[pending.type] : null;

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'User',
      cell: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {u.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-navy truncate">{u.name}</div>
            <div className="text-xs text-muted truncate">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role / Request',
      cell: (u) => (
        <div className="flex items-center gap-1.5">
          <select
            value={u.role}
            onChange={(e) => updateRole({ id: u.id, role: e.target.value })}
            className="text-xs border border-border rounded-lg px-2 py-1 bg-white text-navy font-semibold focus:outline-none focus:border-teal"
          >
            {Object.values(UserRole).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {u.roleRequest && (
            <span className="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold whitespace-nowrap">
              Req: {u.roleRequest}
            </span>
          )}
        </div>
      ),
    },
    { key: 'agency', header: 'Agency', className: 'text-muted whitespace-nowrap', cell: (u) => u.agency || '—' },
    { key: 'status', header: 'Status', cell: (u) => <Badge status={u.status} /> },
    { key: 'joined', header: 'Joined', className: 'text-muted whitespace-nowrap', cell: (u) => formatDate(u.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      cell: (u) => (
        <div className="flex gap-1.5">
          {u.status === UserStatus.ACTIVE ? (
            <Button variant="danger" size="sm" onClick={() => setPending({ type: 'suspend', target: { id: u.id, name: u.name } })}>
              Suspend
            </Button>
          ) : (
            <Button variant="success" size="sm" onClick={() => setPending({ type: 'activate', target: { id: u.id, name: u.name } })}>
              Activate
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setPending({ type: 'delete', target: { id: u.id, name: u.name } })}>
            <Trash2Icon size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Role filter */}
      <div className="flex gap-1 bg-cream rounded-xl p-1 w-fit overflow-x-auto">
        {roles.map((r) => (
          <button
            key={r}
            onClick={() => { setRoleFilter(r); setPage(1); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold capitalize transition-all whitespace-nowrap ${
              roleFilter === r ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'
            }`}
          >
            {r || 'All'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(u) => u.id}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        emptyState={<div className="py-16 text-center text-muted text-sm bg-white border border-border rounded-xl">No users found</div>}
      />

      {pending && modalConfig && (
        <ConfirmModal
          isOpen={!!pending}
          onClose={() => setPending(null)}
          onConfirm={confirm}
          loading={isActing}
          {...modalConfig}
        />
      )}
    </div>
  );
};
