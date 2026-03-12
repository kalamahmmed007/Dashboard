import React from "react";

// ─── Stat Card ────────────────────────────────────────────
export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
  trend,
}) {
  const colors = {
    blue: { bg: "bg-blue-50", icon: "text-blue-500", bar: "bg-blue-500" },
    green: { bg: "bg-green-50", icon: "text-green-500", bar: "bg-green-500" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500", bar: "bg-amber-500" },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-500",
      bar: "bg-purple-500",
    },
    red: { bg: "bg-red-50", icon: "text-red-500", bar: "bg-red-500" },
  };

  const c = colors[color] || colors.blue;

  return (
    <div className="stat-card">
      <div className="mb-3 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}
        >
          {Icon && <Icon size={20} className={c.icon} />}
        </div>

        {trend !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend >= 0
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm text-gray-500">{title}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
      )}
    </div>
  );
}

// ─── Loading Spinner ───────────────────────────────────────
export function Spinner({ size = "md" }) {
  const s = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" }[size];

  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${s} animate-spin rounded-full border-2 border-primary-500/20 border-t-primary-500`}
      />
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 text-5xl">{icon || "📭"}</div>
      <h3 className="mb-1 text-lg font-bold text-gray-800">
        {title || "Nothing here"}
      </h3>
      <p className="mb-6 max-w-xs text-sm text-gray-500">{description}</p>
      {action}
    </div>
  );
}

// ─── Confirm Modal (FIXED) ─────────────────────────────────
export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="fade-in w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-2 text-lg font-bold text-gray-900">
          {title || "Confirm"}
        </h3>

        <p className="mb-6 text-sm text-gray-500">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-outline flex-1 justify-center"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger flex flex-1 items-center justify-center gap-2"
          >
            {loading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  const rendered = [];
  let prev = null;

  for (const p of pages) {
    if (prev && p - prev > 1) rendered.push("...");
    rendered.push(p);
    prev = p;
  }

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm transition-colors hover:border-gray-300 disabled:opacity-40"
      >
        ← Prev
      </button>

      {rendered.map((p, i) =>
        p === "..." ? (
          <span key={`d-${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "border border-primary-500 bg-primary-500 text-white"
                : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm transition-colors hover:border-gray-300 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}

// ─── Badge ─────────────────────────────────────────────────
export function Badge({ type = "gray", children }) {
  return <span className={`badge-${type}`}>{children}</span>;
}

// ─── Table Wrapper ─────────────────────────────────────────
export function Table({ headers, children, loading }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50 bg-white">
          {loading ? (
            <tr>
              <td
                colSpan={headers.length}
                className="py-12 text-center text-gray-400"
              >
                Loading...
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Modal Wrapper (FULL FIXED PRO) ────────────────────────
export function Modal({ open, onClose, title, children, size = "md" }) {
  const widths = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  React.useEffect(() => {
    if (!open) return;

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "auto";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`fade-in w-full ${widths[size]} max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-xl leading-none text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[calc(90vh-72px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}