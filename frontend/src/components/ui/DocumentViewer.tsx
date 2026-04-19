import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUrl';

interface DocumentViewerProps {
  documents: string[];
}

export const DocumentViewer = ({ documents }: DocumentViewerProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl">
        <DocIcon className="w-4 h-4 text-muted flex-shrink-0" />
        <span className="text-xs text-muted">No supporting documents uploaded</span>
      </div>
    );
  }

  return (
    <>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center gap-2">
          <DocIcon className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
            Supporting Documents ({documents.length})
          </span>
        </div>
        <div className="divide-y divide-border">
          {documents.map((doc, i) => {
            const filename = doc.split('/').pop() ?? doc;
            const isPdf = filename.toLowerCase().endsWith('.pdf');
            const docUrl = getImageUrl(doc);

            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                {/* File type icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isPdf ? 'bg-red-50' : 'bg-blue-50'}`}>
                  {isPdf ? <PdfIcon /> : <ImgIcon />}
                </div>

                {/* Name + type */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-navy truncate">{filename}</div>
                  <div className="text-[10px] text-muted">{isPdf ? 'PDF Document' : 'Image'}</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setPreview(docUrl)}
                    className="text-xs font-semibold text-teal hover:underline"
                  >
                    View
                  </button>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-navy transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <span className="text-sm font-semibold text-navy truncate">
                {preview.split('/').pop()}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-teal font-semibold hover:underline"
                >
                  <ExternalLink size={13} /> Open in tab
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="w-8 h-8 rounded-full bg-surface hover:bg-border flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto min-h-0">
              {preview.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={preview}
                  title="Document preview"
                  className="w-full h-full min-h-[60vh]"
                />
              ) : (
                <img
                  src={preview}
                  alt="Document"
                  className="w-full h-auto object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Icon helpers ───────────────────────────────────────────────────────────────

function DocIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  );
}

function PdfIcon() {
  return (
    <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM9 13h6v1H9v-1zm0 2h6v1H9v-1zm0-4h3v1H9v-1z"/>
    </svg>
  );
}

function ImgIcon() {
  return (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}
