import type { Metadata } from "next";
import { BillAnalyzer } from "@/components/BillAnalyzer";

export const metadata: Metadata = {
  title: "Analyze a Bill",
  description: "Upload a medical bill, EOB, or denial letter for AI-powered analysis.",
  robots: { index: false, follow: false },
};

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Analyze a bill or EOB</h1>
        <p className="mt-1 text-sm text-muted">
          Upload a medical bill, EOB, or denial letter to decode charges, flag errors, and generate an appeal letter.
        </p>
      </div>
      <BillAnalyzer />
    </div>
  );
}
