import { useEffect, useRef, useState } from 'react';
import { getImageUrl } from '../../utils/imageUrl';

interface PanoramaViewerProps {
  src: string;
  onClose: () => void;
}

function toAbsoluteUrl(path: string): string {
  const resolved = getImageUrl(path);
  if (resolved.startsWith('http')) return resolved;
  return `${window.location.origin}${resolved}`;
}

const PANNELLUM_JS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js';
const PANNELLUM_CSS = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css';

function loadPannellum(): Promise<void> {
  return new Promise((resolve) => {
    // Already loaded
    if ((window as any).pannellum) { resolve(); return; }

    // Inject CSS
    if (!document.querySelector(`link[href="${PANNELLUM_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = PANNELLUM_CSS;
      document.head.appendChild(link);
    }

    // Inject JS
    if (!document.querySelector(`script[src="${PANNELLUM_JS}"]`)) {
      const script = document.createElement('script');
      script.src = PANNELLUM_JS;
      script.onload = () => resolve();
      document.head.appendChild(script);
    } else {
      resolve();
    }
  });
}

export const PanoramaViewer = ({ src, onClose }: PanoramaViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let viewer: any = null;

    loadPannellum().then(() => {
      if (!containerRef.current) return;
      setLoading(false);

      viewer = (window as any).pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: toAbsoluteUrl(src),
        autoLoad: true,
        autoRotate: -2,
        compass: false,
        showFullscreenCtrl: false,
        showZoomCtrl: true,
        showControls: true,
        mouseZoom: true,
        draggable: true,
        hfov: 100,
      });
    });

    return () => {
      try { viewer?.destroy(); } catch { /* ignore */ }
    };
  }, [src]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
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

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-10 h-10 border-4 border-teal border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Pannellum mounts here */}
      <div ref={containerRef} className="flex-1 w-full" />
    </div>
  );
};
