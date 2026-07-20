"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { Disclaimer } from "./Disclaimer";
import { currencySymbol } from "@/lib/ai/currency";
import { checkConsistency, selfPayDetected, isNonUSDoc, type AnalysisData } from "@/lib/ai/consistency";

type Step = "upload" | "extracting" | "explaining" | "flagging" | "results" | "generating-letter" | "letter";

interface ProgressStep {
  label: string;
  status: "pending" | "active" | "done" | "error";
}

export function BillAnalyzer() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [letterText, setLetterText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [usageToken] = useState(() => crypto.randomUUID());
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);

  const [entitlement, setEntitlement] = useState<{
    plan: "unlimited" | "free" | null;
    credits: Record<string, number>;
  }>({ plan: null, credits: {} });

  useEffect(() => {
    fetch("/api/me/entitlement")
      .then((r) => r.json())
      .then((data) => setEntitlement(data))
      .catch(() => {});
  }, []);

  const [progress, setProgress] = useState<ProgressStep[]>([
    { label: "Reading document", status: "pending" },
    { label: "Explaining in plain English", status: "pending" },
    { label: "Checking for errors", status: "pending" },
  ]);

  function updateProgress(index: number, status: ProgressStep["status"]) {
    setProgress((prev) => prev.map((p, i) => (i === index ? { ...p, status } : p)));
  }

  function validateFile(f: File): string | null {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff", "application/pdf"];
    if (!allowedTypes.includes(f.type)) {
      return "Unsupported file type. Please upload a PDF or image (JPEG, PNG, WebP, TIFF).";
    }
    if (f.size > 10 * 1024 * 1024) {
      return "File is too large. Maximum size is 10 MB.";
    }
    return null;
  }

  function handleFileDrop(f: File) {
    const err = validateFile(f);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setFile(f);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFileDrop(f);
  }

  async function handleAnalyze() {
    if (!file) return;

    setStep("extracting");
    setError(null);
    setAnalysis(null);
    setLetterText(null);
    updateProgress(0, "active");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/bills/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed. Please try again.");
        setStep("upload");
        updateProgress(0, "error");
        return;
      }

      updateProgress(0, "done");
      updateProgress(1, "active");
      setStep("explaining");
      await new Promise((r) => setTimeout(r, 300));

      updateProgress(1, "done");
      updateProgress(2, "active");
      setStep("flagging");

      await new Promise((r) => setTimeout(r, 300));
      updateProgress(2, "done");

      setAnalysis(data.analysis);
      setStep("results");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStep("upload");
      updateProgress(0, "error");
    }
  }

  async function handleGenerateLetter(e: FormEvent) {
    e.preventDefault();
    if (!analysis || !patientName.trim()) return;

    setIsGenerating(true);
    setStep("generating-letter");
    setError(null);

    try {
      const res = await fetch("/api/bills/appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extraction: analysis.extraction,
          flags: analysis.flags,
          patientName: patientName.trim(),
          usageToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Letter generation failed. Please try again.");
        setStep("results");
        return;
      }

      setLetterText(data.letterText);
      setStep("letter");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStep("results");
    } finally {
      setIsGenerating(false);
    }
  }

  function copyLetter() {
    if (!letterText) return;
    navigator.clipboard.writeText(letterText);
  }

  function downloadLetter() {
    if (!letterText) return;
    const blob = new Blob([letterText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hedical-appeal-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setStep("upload");
    setFile(null);
    setAnalysis(null);
    setLetterText(null);
    setError(null);
    setPatientName("");
    setIsGenerating(false);
    setProgress([
      { label: "Reading document", status: "pending" },
      { label: "Explaining in plain English", status: "pending" },
      { label: "Checking for errors", status: "pending" },
    ]);
  }

  const severityColor = (s: string) => {
    switch (s) {
      case "error": return "border-red-200 bg-red-50 text-red-800";
      case "warning": return "border-amber-200 bg-amber-50 text-amber-800";
      default: return "border-blue-200 bg-blue-50 text-blue-800";
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      {/* Upload step */}
      {step === "upload" && (
        <div className="p-6 sm:p-8">
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
              dragOver ? "border-primary bg-hedical-50" : "border-border bg-zinc-50"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileDrop(f); }}
          >
            <div className="text-4xl mb-4">&#x1F4C4;</div>
            <h3 className="text-lg font-semibold text-foreground">Upload your bill or EOB</h3>
            <p className="mt-2 text-sm text-muted max-w-sm">
              Drag and drop a file here, or click to browse. We accept PDFs, JPEGs, PNGs, and WebP images up to 10 MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/tiff,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-colors"
            >
              Browse files
            </button>
            {file && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm text-muted">
                <span>&#x1F4CE;</span>
                <span className="truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                <button onClick={() => setFile(null)} className="ml-2 text-foreground hover:text-red-600">&times;</button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={handleAnalyze}
              disabled={!file}
              className="rounded-lg bg-primary px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-light transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              Analyze my bill
            </button>
          </div>
          <div className="mt-4">
            <Disclaimer variant="notice" />
          </div>
        </div>
      )}

      {/* Processing steps */}
      {(step === "extracting" || step === "explaining" || step === "flagging") && (
        <div className="p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-foreground text-center mb-6">Analyzing your document...</h3>
          <div className="mx-auto max-w-sm space-y-4">
            {progress.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                {p.status === "done" && (
                  <svg className="h-5 w-5 shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {p.status === "active" && (
                  <svg className="h-5 w-5 shrink-0 animate-spin text-primary" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {p.status === "error" && (
                  <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {p.status === "pending" && (
                  <div className="h-5 w-5 shrink-0 rounded-full border-2 border-border" />
                )}
                <span className={`text-sm ${p.status === "done" ? "text-green-700" : p.status === "active" ? "text-foreground font-medium" : p.status === "error" ? "text-red-700" : "text-muted"}`}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Results step */}
      {step === "results" && analysis && (() => {
        const sym = currencySymbol(analysis.extraction.currency);
        const consistency = checkConsistency(analysis);
        const e = analysis.extraction;

        const selfPay = selfPayDetected(analysis);
        const nonUS = isNonUSDoc(e.region);

        return (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Analysis results</h3>
              <button onClick={reset} className="text-sm text-primary hover:underline">
                Analyze another bill
              </button>
            </div>

            {/* Consistency check failure banner */}
            {!consistency.ok && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {consistency.message}
              </div>
            )}

            {/* Non-US notice */}
            {nonUS && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                This appears to be a document from {e.region}. US insurance protections (No Surprises Act, state-level appeals rights, etc.) generally do not apply.
              </div>
            )}

            {/* Summary card (always shown, even on inconsistency) */}
            <div className="rounded-xl border border-border bg-zinc-50 p-4 space-y-2">
              {e.currency && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Currency</span>
                  <span className="font-medium text-foreground">{e.currency}</span>
                </div>
              )}
              {e.region && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Region</span>
                  <span className="font-medium text-foreground">{e.region}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted">Provider</span>
                <span className="font-medium text-foreground">{e.provider}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Date of service</span>
                <span className="font-medium text-foreground">{e.serviceDate}</span>
              </div>
              {e.totalBilled !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total billed</span>
                  <span className="font-medium text-foreground">{sym}{e.totalBilled.toFixed(2)}</span>
                </div>
              )}
              {e.totalPatientResponsibility !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{selfPay ? "Amount due" : "Your estimated responsibility"}</span>
                  <span className="font-semibold text-primary">{sym}{e.totalPatientResponsibility.toFixed(2)}</span>
                </div>
              )}
              {e.denialReasonText && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Denial reason</span>
                  <span className="font-medium text-red-600">{e.denialReasonText}</span>
                </div>
              )}
              {e.deadlineDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Deadline</span>
                  <span className="font-medium text-foreground">{e.deadlineDate}</span>
                </div>
              )}
            </div>

            {/* Self-pay notice */}
            {selfPay && consistency.ok && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                No insurance payment or EOB found in this document. This appears to be a self-pay balance owed directly to the provider. The amounts shown above are what the provider has billed, not what insurance has determined you owe.
              </div>
            )}

            {/* Line items (always shown) */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Line items ({e.lineItems.length})</h4>
              <div className="space-y-2">
                {e.lineItems.map((item, i) => (
                  <div key={i} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs text-muted">{item.code}</span>
                        <p className="text-foreground mt-0.5">{item.description}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {item.billedAmount !== null && <div className="text-muted">{sym}{item.billedAmount.toFixed(2)}</div>}
                        {item.paidAmount !== null && <div className="text-muted">Paid: {sym}{item.paidAmount.toFixed(2)}</div>}
                        {item.patientOwes !== null && <div className="font-semibold text-primary">{sym}{item.patientOwes.toFixed(2)}</div>}
                      </div>
                    </div>
                    {analysis.flags.filter((f) => f.lineItemIndex === i).map((flag, fi) => {
                      const hasRef = flag.referenceBasis !== undefined && flag.referenceBasis !== null;
                      return (
                        <div key={fi} className={`mt-2 rounded px-2 py-1 text-xs ${hasRef ? severityColor(flag.severity) : "bg-gray-100 text-gray-500"}`}>
                          {!hasRef && "Ask about: "}{flag.description}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Plain English explanation (always shown) */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Plain-English explanation</h4>
              <div className="rounded-xl border border-border bg-zinc-50 p-4 text-sm text-muted whitespace-pre-line leading-relaxed">
                {analysis.explanation}
              </div>
            </div>

            {/* Flagged issues — blocked on inconsistency */}
            {analysis.flags.length > 0 && consistency.ok && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Potential issues found ({analysis.flags.length})
                </h4>
                <div className="space-y-2">
                  {analysis.flags.map((flag, i) => {
                    const hasRef = flag.referenceBasis !== undefined && flag.referenceBasis !== null;
                    return (
                      <div key={i} className={`rounded-lg border p-3 text-sm ${hasRef ? severityColor(flag.severity) : "border-gray-200 bg-gray-50 text-gray-600"}`}>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 mt-0.5">
                            {hasRef
                              ? (flag.severity === "error" ? "\u{26A0}\u{FE0F}" : flag.severity === "warning" ? "\u{26A0}" : "\u{2139}\u{FE0F}")
                              : "\u{2753}"}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{flag.type.replace(/_/g, " ")}</p>
                              {!hasRef && (
                                <span className="inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                                  Worth asking about
                                </span>
                              )}
                              {hasRef && (
                                <span className="inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-800">
                                  Issue found
                                </span>
                              )}
                            </div>
                            <p className="mt-1 opacity-80">{flag.description}</p>
                            {flag.citation && <p className="mt-1 text-xs opacity-60">Reference: {flag.citation}</p>}
                            {flag.referenceBasis && <p className="mt-1 text-xs opacity-60">Basis: {flag.referenceBasis}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Appeal letter section — blocked on inconsistency */}
            {consistency.ok && (() => {
              const isUnlimited = entitlement.plan === "unlimited";
              const navCredits = entitlement.credits["bill_navigator"] ?? 0;
              const isLoggedIn = entitlement.plan !== null;
              const canGenerate = isUnlimited || navCredits > 0;

              if (canGenerate) {
                return (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="inline-flex items-center rounded-full bg-green-200 px-3 py-0.5 text-xs font-semibold text-green-800">
                        {isUnlimited ? "Unlimited Plan" : `${navCredits} credit${navCredits !== 1 ? "s" : ""} remaining`}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-foreground">Ready to appeal?</h4>
                    <p className="mt-2 text-sm text-muted">
                      {isUnlimited
                        ? "Generate an appeal letter — included in your plan."
                        : `Generate an appeal letter (uses 1 of ${navCredits} credits).`}
                    </p>
                    <form onSubmit={handleGenerateLetter} className="mt-4 max-w-sm mx-auto space-y-3">
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Your full name (for the letter)"
                        required
                        className="block w-full rounded-lg border border-border px-4 py-2.5 text-sm text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="submit"
                        disabled={!patientName.trim() || isGenerating}
                        className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-colors disabled:opacity-50"
                      >
                        {isGenerating ? "Generating..." : "Generate appeal letter draft"}
                      </button>
                    </form>
                    <div className="mt-4">
                      <Disclaimer variant="notice" />
                    </div>
                  </div>
                );
              }

              if (!isLoggedIn) {
                return (
                  <div className="rounded-xl border border-hedical-200 bg-hedical-50 p-6 text-center">
                    <h4 className="text-base font-semibold text-foreground">Ready to appeal?</h4>
                    <p className="mt-2 text-sm text-muted">
                      Sign in to generate an AI-drafted appeal letter based on your documents and flagged issues.
                    </p>
                    <div className="mt-4">
                      <Link
                        href={`/login?redirect=${encodeURIComponent("/dashboard/analyze")}`}
                        className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-colors"
                      >
                        Sign in to continue
                      </Link>
                    </div>
                    <div className="mt-4">
                      <Disclaimer variant="notice" />
                    </div>
                  </div>
                );
              }

              return (
                <div className="rounded-xl border border-hedical-200 bg-hedical-50 p-6 text-center">
                  <h4 className="text-base font-semibold text-foreground">Ready to appeal?</h4>
                  <p className="mt-2 text-sm text-muted">
                    You need credits or an Unlimited plan to generate an appeal letter.
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/pricing"
                      className="inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-colors"
                    >
                      View pricing
                    </Link>
                  </div>
                  <div className="mt-4">
                    <Disclaimer variant="notice" />
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* Letter output step */}
      {step === "letter" && letterText && (
        <div className="p-6 sm:p-8 space-y-6" ref={letterRef}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Appeal letter draft</h3>
            <button onClick={reset} className="text-sm text-primary hover:underline">
              Analyze another bill
            </button>
          </div>

          <Disclaimer variant="banner" />

          <div className="rounded-xl border border-border bg-white p-6 text-sm font-mono whitespace-pre-line leading-relaxed">
            {letterText}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyLetter}
              className="rounded-lg border border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground hover:bg-zinc-50 transition-colors"
            >
              Copy to clipboard
            </button>
            <button
              onClick={downloadLetter}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-light transition-colors"
            >
              Download as text file
            </button>
          </div>

          <p className="text-xs text-muted">
            Review this letter carefully before sending. Verify all patient details, claim numbers, and dates. The letter is AI-drafted based on your documents and flagged issues — you are responsible for the final content.
          </p>
        </div>
      )}

      {/* Error display for results/letter steps */}
      {error && (step === "results" || step === "letter") && (
        <div className="px-6 sm:px-8 pb-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
