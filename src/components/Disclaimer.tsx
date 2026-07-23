import { IconAlertTriangle } from "@tabler/icons-react";

interface DisclaimerProps {
  variant?: "inline" | "banner" | "notice";
}

const text =
  "Hedical uses AI to analyze documents and draft letters. Always review before sending. Not a substitute for professional legal, medical, or financial advice.";

export function Disclaimer({ variant = "inline" }: DisclaimerProps) {
  if (variant === "banner") {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="note">
        <p className="flex items-start gap-2">
          <span className="mt-0.5 shrink-0" aria-hidden="true"><IconAlertTriangle className="size-4" /></span>
          <span>{text}</span>
        </p>
      </div>
    );
  }

  if (variant === "notice") {
    return (
      <div className="rounded border border-border bg-zinc-50 px-3 py-2 text-xs text-muted" role="note">
        {text}
      </div>
    );
  }

  return (
    <p className="text-xs text-muted" role="note">
      {text}
    </p>
  );
}
