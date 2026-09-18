import { useAppDispatch, useAppSelector } from '../../store';
import { useUpdateProfileMutation, useRequestRoleMutation } from '../../features/users/usersApi';
import { useUploadImagesMutation } from '../../features/properties/propertiesApi';
import { logout, setUser } from '../../features/auth/authSlice';
import { getImageUrl } from '../../utils/imageUrl';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { Camera } from 'lucide-react';

export const BuyerProfilePage = () => {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [updateProfile, { isLoading, isSuccess }] = useUpdateProfileMutation();
  const [requestRole, { isLoading: isRequesting, isSuccess: requestSent }] = useRequestRoleMutation();
  const [uploadImages, { isLoading: isUploadingAvatar }] = useUploadImagesMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = user?.name ?? '';
  const parts = fullName.split(' ');
  const [firstName, setFirstName] = useState(parts[0] ?? '');
  const [lastName, setLastName] = useState(parts.slice(1).join(' '));
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [selectedRole, setSelectedRole] = useState<'agent' | 'owner' | null>(null);

  const handleAvatarChange = async (file: File) => {
    const fd = new FormData();
    fd.append('files', file);
    const { urls } = await uploadImages(fd).unwrap();
    setAvatarUrl(urls[0]);
  };

  const handleSave = async () => {
    const name = [firstName, lastName].filter(Boolean).join(' ');
    const updated = await updateProfile({ name, phone, avatarUrl }).unwrap();
    dispatch(setUser(updated));
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Account</div>
      <h1 className="font-display text-2xl text-navy mb-6">My Profile</h1>

      {/* Avatar card */}
      <div className="bg-navy rounded-2xl p-5 flex items-center gap-5 mb-5">
        <div className="relative flex-shrink-0">
          {avatarUrl ? (
            <img
              src={getImageUrl(avatarUrl)}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-teal flex items-center justify-center text-white text-2xl font-bold border-2 border-white/10">
              {user?.name?.slice(0, 2).toUpperCase() ?? '?'}
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-teal border-2 border-navy flex items-center justify-center text-white hover:bg-teal-light transition-colors disabled:opacity-60"
            aria-label="Change profile picture"
          >
            <Camera size={14} />
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
          <div className="font-semibold text-white text-lg">{user?.name}</div>
          <div className="text-white/50 text-sm">{user?.email}</div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="inline-flex items-center gap-1.5 mt-2.5 px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-colors disabled:opacity-60"
          >
            <Camera size={13} />
            {isUploadingAvatar ? 'Uploading…' : avatarUrl ? 'Change Photo' : 'Upload Profile Picture'}
          </button>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white border border-border rounded-2xl p-6 space-y-4 mb-5">
        {isSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Profile updated successfully!
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-surface text-muted cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">Phone</label>
          <input
            type="tel"
            placeholder="+234 800 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-teal transition-colors"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:border-navy hover:text-navy transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors disabled:opacity-60"
          >
            {isLoading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Upgrade account */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-5">
        <h3 className="font-semibold text-navy mb-1">Upgrade Your Account</h3>
        <p className="text-xs text-muted mb-4 leading-relaxed">
          Want to list properties on Owkaz? Request to become an Agent or Property Owner. An admin will review your request and notify you.
        </p>

        {requestSent ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            Request submitted! Our team will review and update your role.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedRole('agent')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === 'agent' ? 'border-teal bg-teal/5' : 'border-border hover:border-teal/40'
                }`}
              >
                <div className="font-semibold text-navy text-sm mb-0.5">Real Estate Agent</div>
                <div className="text-xs text-muted">List and sell properties for clients</div>
              </button>
              <button
                onClick={() => setSelectedRole('owner')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === 'owner' ? 'border-teal bg-teal/5' : 'border-border hover:border-teal/40'
                }`}
              >
                <div className="font-semibold text-navy text-sm mb-0.5">Property Owner</div>
                <div className="text-xs text-muted">List your own properties for sale or rent</div>
              </button>
            </div>
            <button
              onClick={() => selectedRole && requestRole(selectedRole)}
              disabled={!selectedRole || isRequesting}
              className="px-5 py-2.5 rounded-xl bg-teal text-white text-sm font-semibold hover:bg-teal-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRequesting ? 'Submitting…' : 'Submit Request'}
            </button>
          </>
        )}
      </div>

      {/* Account actions */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-navy mb-4">Account Actions</h3>
        <button
          onClick={handleSignOut}
          className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
