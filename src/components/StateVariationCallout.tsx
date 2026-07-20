interface StateVariationCalloutProps {
  title?: string;
  children: React.ReactNode;
}

export function StateVariationCallout({
  title = "State variation — read carefully",
  children,
}: StateVariationCalloutProps) {
  return (
    <div
      className="my-6 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4"
      role="note"
    >
      <p className="mb-1 font-semibold text-amber-900 text-sm uppercase tracking-wide">
        {title}
      </p>
      <div className="text-sm text-amber-800 [&>p:last-child]:mb-0 [&>p]:mb-2">
        {children}
      </div>
    </div>
  );
}
