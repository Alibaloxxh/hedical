interface SoftwareAppSchemaProps {
  name: string;
  description: string;
  url: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export function SoftwareAppSchema({ name, description, url }: SoftwareAppSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    author: { "@type": "Organization", name: "Hedical" },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
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
