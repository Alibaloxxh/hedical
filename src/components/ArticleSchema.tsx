interface ArticleSchemaProps {
  title: string;
  description: string;
  datePublished: string;
  slug: string;
  readingTime?: string;
}

export function ArticleSchema({ title, description, datePublished, slug }: ArticleSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${siteUrl}/guides/${slug}`,
    datePublished,
    dateModified: datePublished,
    author: {
      "@type": "Organization",
      name: "Hedical",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Hedical",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/guides/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
