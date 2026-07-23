import Link from "next/link";

const productLinks = [
  { name: "Bill & Denial Navigator", href: "/products/bill-denial-navigator" },
  { name: "Documentation Tool", href: "/products/documentation-tool" },
  { name: "Polypharmacy Manager", href: "/products/polypharmacy-manager" },
];

const companyLinks = [
  { name: "About", href: "/about" },
  { name: "Guides", href: "/guides" },
  { name: "Pricing", href: "/pricing" },
  { name: "Contact", href: "/contact" },
  { name: "Waitlist", href: "/waitlist" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
  { name: "Refund & Cancellation Policy", href: "/refund-policy" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold text-primary">
              Hedical
            </Link>
            <p className="mt-2 text-sm text-muted max-w-xs">
              AI-powered healthcare navigation tools helping patients, caregivers, and providers.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Products</h3>
            <ul className="mt-3 space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Company</h3>
            <ul className="mt-3 space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-3 space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted hover:text-foreground transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 space-y-2">
          <p className="text-center text-xs text-muted">
            &copy; {new Date().getFullYear()} Hedical. All rights reserved. Not medical or legal advice. See our Terms of Service.
          </p>
          <p className="text-center text-xs text-muted">
            Contact: <a href="mailto:hedicalai@gmail.com" className="text-primary underline hover:text-primary-light transition-colors">hedicalai@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
