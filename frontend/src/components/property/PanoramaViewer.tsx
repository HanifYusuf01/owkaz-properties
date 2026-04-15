import { useEffect, useRef } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { getImageUrl } from '../../utils/imageUrl';

interface PanoramaViewerProps {
  src: string;
  onClose: () => void;
}

export const PanoramaViewer = ({ src, onClose }: PanoramaViewerProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-black flex flex-col"
    >
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="bg-teal/90 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            360° View
          </span>
          <span className="text-white/60 text-xs hidden sm:block">
            Drag to look around · Scroll to zoom
          </span>
        </div>
        <button
          onClick={onClose}
          className="pointer-events-auto w-9 h-9 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          aria-label="Close 360 viewer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Viewer */}
      <div className="flex-1 w-full">
        <ReactPhotoSphereViewer
          src={getImageUrl(src)}
          height="100vh"
          width="100%"
          defaultZoomLvl={0}
        />
      </div>
    </div>
  );
};
