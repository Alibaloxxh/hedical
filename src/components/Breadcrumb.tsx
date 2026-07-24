import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online"}${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          </li>
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="text-muted select-none">/</span>
              {item.href ? (
                <Link href={item.href} className="hover:text-ink transition-colors">{item.label}</Link>
              ) : (
                <span className="text-ink font-medium" aria-current="page">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
