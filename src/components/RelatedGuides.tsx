import Link from "next/link";

const allGuides = {
  "co-50-denial-code": { title: "CO-50 Denial Code: Not Medically Necessary", slug: "co-50-denial-code" },
  "pr-50-vs-co-50": { title: "PR-50 vs CO-50: What the Group Code Means", slug: "pr-50-vs-co-50" },
  "co-4-denial-code": { title: "CO-4 Denial Code: Missing Modifier", slug: "co-4-denial-code" },
  "co-16-denial-code": { title: "CO-16 Denial Code: Missing Information", slug: "co-16-denial-code" },
  "co-96-denial-code": { title: "CO-96 Denial Code: Service Not Covered", slug: "co-96-denial-code" },
  "how-to-read-an-eob": { title: "How to Read an EOB", slug: "how-to-read-an-eob" },
  "no-surprises-act-explained": { title: "No Surprises Act Explained", slug: "no-surprises-act-explained" },
  "appeal-deadlines-by-state": { title: "Appeal Deadlines by State", slug: "appeal-deadlines-by-state" },
  "medical-billing-glossary": { title: "Medical Billing Glossary", slug: "medical-billing-glossary" },
};

const relatedMap: Record<string, string[]> = {
  "co-50-denial-code": ["pr-50-vs-co-50", "appeal-deadlines-by-state", "how-to-read-an-eob"],
  "pr-50-vs-co-50": ["co-50-denial-code", "how-to-read-an-eob"],
  "co-4-denial-code": ["co-16-denial-code", "co-50-denial-code", "how-to-read-an-eob"],
  "co-16-denial-code": ["co-4-denial-code", "co-50-denial-code", "how-to-read-an-eob"],
  "co-96-denial-code": ["co-50-denial-code", "no-surprises-act-explained"],
  "how-to-read-an-eob": ["co-50-denial-code", "pr-50-vs-co-50", "appeal-deadlines-by-state"],
  "no-surprises-act-explained": ["how-to-read-an-eob", "appeal-deadlines-by-state"],
  "appeal-deadlines-by-state": ["co-50-denial-code", "how-to-read-an-eob"],
  "medical-billing-glossary": ["how-to-read-an-eob", "co-50-denial-code", "pr-50-vs-co-50"],
};

export function RelatedGuides({ current }: { current: string }) {
  const related = relatedMap[current];
  if (!related || related.length === 0) return null;

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold text-foreground mb-4">Related Guides</h2>
      <div className="flex flex-wrap gap-2">
        {related.map((slug) => {
          const guide = allGuides[slug as keyof typeof allGuides];
          if (!guide) return null;
          return (
            <Link
              key={slug}
              href={`/guides/${slug}`}
              className="inline-flex items-center rounded-full border border-border bg-white px-3 py-1.5 text-sm text-muted hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {guide.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
