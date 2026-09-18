import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { useUpdateProfileMutation } from '../../features/users/usersApi';
import { useUploadImagesMutation } from '../../features/properties/propertiesApi';
import { setUser } from '../../features/auth/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ProfilePage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const [updateProfile, { isLoading, isSuccess }] = useUpdateProfileMutation();
  const [uploadImages, { isLoading: isUploadingAvatar }] = useUploadImagesMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');

  const { register, handleSubmit } = useForm({
    defaultValues: { name: user?.name ?? '', agency: user?.agency ?? '', phone: user?.phone ?? '' },
  });

  const handleAvatarChange = async (file: File) => {
    const fd = new FormData();
    fd.append('files', file);
    const { urls } = await uploadImages(fd).unwrap();
    setAvatarUrl(urls[0]);
  };

  const onSubmit = async (data: { name: string; agency: string; phone: string }) => {
    const updated = await updateProfile({ ...data, avatarUrl }).unwrap();
    dispatch(setUser(updated));
  };

  return (
    <div className="max-w-lg space-y-6">
      {/* Avatar */}
      <div className="bg-white border border-border rounded-xl p-6 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img src={getImageUrl(avatarUrl)} alt={user?.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-teal flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0) ?? '?'}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-teal border-2 border-white flex items-center justify-center text-white hover:bg-teal-light transition-colors disabled:opacity-60"
            aria-label="Change profile picture"
          >
            <Camera size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarChange(file);
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-navy text-lg">{user?.name}</div>
          <div className="text-sm text-muted">{user?.email}</div>
          <div className="mt-1.5"><Badge status={user?.role ?? ''} /></div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-lg bg-cream hover:bg-border border border-border text-navy text-xs font-semibold transition-colors disabled:opacity-60"
          >
            <Camera size={13} />
            {isUploadingAvatar ? 'Uploading…' : avatarUrl ? 'Change Photo' : 'Upload Profile Picture'}
          </button>
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
        <Input label="Phone" type="tel" placeholder="+234 800 000 0000" {...register('phone')} />
        {(user?.role === 'agent') && (
          <Input label="Agency Name" {...register('agency')} />
        )}

        <Button type="submit" loading={isLoading}>Save Changes</Button>
      </form>
    </div>
  );
};
