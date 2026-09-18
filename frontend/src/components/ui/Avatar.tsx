import { getImageUrl } from '../../utils/imageUrl';

interface AvatarProps {
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
  initialsLength?: 1 | 2;
}

export const Avatar = ({ name, avatarUrl, className = 'w-9 h-9 text-sm', initialsLength = 1 }: AvatarProps) => {
  if (avatarUrl) {
    return <img src={getImageUrl(avatarUrl)} alt={name ?? 'Avatar'} className={`${className} rounded-full object-cover flex-shrink-0`} />;
  }
  const initials = initialsLength === 2 ? name?.slice(0, 2).toUpperCase() : name?.charAt(0).toUpperCase();
  return (
    <div className={`${className} rounded-full bg-teal flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials ?? '?'}
    </div>
  );
};
