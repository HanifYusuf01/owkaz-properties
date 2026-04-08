import { useForm } from 'react-hook-form';
import { useAppSelector } from '../../store';
import { useUpdateProfileMutation } from '../../features/users/usersApi';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ProfilePage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const [updateProfile, { isLoading, isSuccess }] = useUpdateProfileMutation();

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name ?? '', agency: user?.agency ?? '' },
  });

  const onSubmit = async (data: { name: string; agency: string }) => {
    await updateProfile(data);
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Avatar */}
      <div className="bg-white border border-border rounded-xl p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-teal flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.name?.charAt(0) ?? '?'}
        </div>
        <div>
          <div className="font-bold text-navy text-lg">{user?.name}</div>
          <div className="text-sm text-muted">{user?.email}</div>
          <div className="mt-1.5"><Badge status={user?.role ?? ''} /></div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-display text-lg text-navy">Update Profile</h3>

        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Profile updated successfully!
          </div>
        )}

        <Input label="Full Name" {...register('name')} />
        {(user?.role === 'agent') && (
          <Input label="Agency Name" {...register('agency')} />
        )}

        <Button type="submit" loading={isLoading}>Save Changes</Button>
      </form>
    </div>
  );
};
