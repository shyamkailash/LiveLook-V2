export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      {children}
      {error ? <span className="text-xs text-muted">{error}</span> : null}
    </label>
  );
}
