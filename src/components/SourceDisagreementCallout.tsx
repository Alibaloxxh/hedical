interface SourceDisagreementCalloutProps {
  children: React.ReactNode;
}

export function SourceDisagreementCallout({
  children,
}: SourceDisagreementCalloutProps) {
  return (
    <div
      className="my-6 rounded-lg border border-blue-200 bg-blue-50 p-4"
      role="note"
    >
      <p className="mb-1 font-semibold text-blue-900 text-sm uppercase tracking-wide">
        What the sources say
      </p>
      <div className="text-sm text-blue-800 [&>p:last-child]:mb-0 [&>p]:mb-2">
        {children}
      </div>
    </div>
  );
}
