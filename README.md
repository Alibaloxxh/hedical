# Hedical

AI-powered healthcare navigation tools for patients, caregivers, and providers.

Three products under one brand:
- **Medical Bill & Denial Navigator** — Upload bills/EOBs, get plain-English explanations, error detection, and AI-drafted appeal letters
- **Niche Documentation Tool** — Ambient-scribe assistant for allied health, ABA therapy, lactation, nutrition, and small dental
- **Polypharmacy Manager** — LLM-powered medication interaction checks and caregiver multi-profile support

Built with [Next.js 16](https://nextjs.org) (App Router, Turbopack, Tailwind CSS v4, TypeScript).

---
## Project Structure

```
hedical/
├── public/images/          # Logo, icon, banner images
├── llms.txt                 # LLM discovery index
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── waitlist/   # POST proxy → Google Sheets (Waitlist tab)
│   │   │   └── contact/    # POST proxy → Google Sheets (Contact tab)
│   │   ├── guides/
│   │   │   ├── page.tsx    # Guides index
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Dynamic guide page (MDX + FAQPage schema)
│   │   ├── products/
│   │   │   ├── bill-denial-navigator/
│   │   │   ├── documentation-tool/
│   │   │   └── polypharmacy-manager/
│   │   ├── about/
│   │   ├── contact/        # Client component with validation + honeypot
│   │   ├── pricing/
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── waitlist/       # Client component with validation + honeypot
│   │   ├── not-found.tsx   # Custom 404 page
│   │   ├── error.tsx       # Global error boundary
│   │   ├── layout.tsx      # Root layout with Analytics + SEO
│   │   ├── page.tsx        # Homepage
│   │   ├── robots.ts       # Dynamic robots.txt
│   │   └── sitemap.ts      # Dynamic sitemap.xml
│   ├── components/
│   │   ├── Header.tsx      # Responsive nav with dropdown (keyboard-accessible)
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CTASection.tsx
│   │   ├── FeatureGrid.tsx
│   │   ├── Disclaimer.tsx  # 3-variant legal disclaimer
│   │   ├── BillAnalyzer.tsx # Upload+analysis UI (product page)
│   │   ├── StateVariationCallout.tsx  # Amber callout for state-dependent rules
│   │   ├── SourceDisagreementCallout.tsx  # Blue callout for source divergence
│   │   └── FaqPageSchema.tsx  # FAQPage JSON-LD component
│   ├── guides/             # MDX guide content files
│   │   └── co-50-denial-code.mdx
│   ├── lib/ai/             # AI pipeline (types, client, patterns, extract, explain, flag, draft)
│   └── mdx-components.tsx  # Global MDX component styling
├── APPS_SCRIPT_CODE.gs     # Google Apps Script code for sheet handler
├── .env.example            # Environment variable template
└── .env.local              # Local environment variables (gitignored)
```

## Legal

The Privacy Policy and Terms of Service in this repo are marketing-site boilerplate. **Before handling PHI or launching the product**, engage a healthcare attorney to review and update them for HIPAA compliance.

## SEO

- Dynamic `metadata` exports on every page (with `alternates.canonical`)
- JSON-LD Organization schema in root layout
- JSON-LD FAQPage schema on guide pages
- Auto-generated `robots.txt` and `sitemap.xml` from env vars
- Open Graph + Twitter Card meta tags on every page
- `llms.txt` at root for LLM discovery

