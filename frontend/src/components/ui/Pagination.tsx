interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxButtons?: number;
}

export const Pagination = ({ page, totalPages, onPageChange, maxButtons = 7 }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const windowSize = Math.min(totalPages, maxButtons);
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3 py-2 rounded-lg border border-border text-sm font-semibold text-muted hover:border-navy hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-colors ${
            page === p
              ? 'bg-navy text-white border-navy'
              : 'border-border text-muted hover:border-navy hover:text-navy'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        className="px-3 py-2 rounded-lg border border-border text-sm font-semibold text-muted hover:border-navy hover:text-navy disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        →
      </button>
    </div>
  );
};
