# Hedical

AI-powered healthcare navigation tools for patients, caregivers, and providers.

Three products under one brand:
- **Medical Bill & Denial Navigator** — Upload bills/EOBs, get plain-English explanations, error detection, and AI-drafted appeal letters
- **Niche Documentation Tool** — Ambient-scribe assistant for allied health, ABA therapy, lactation, nutrition, and small dental
- **Polypharmacy Manager** — LLM-powered medication interaction checks and caregiver multi-profile support

Built with [Next.js 16](https://nextjs.org) (App Router, Turbopack, Tailwind CSS v4, TypeScript).

---

## Local Setup

```bash
# 1. Clone and install
git clone <repo-url> hedical
cd hedical
npm install

# 2. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see below)

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

## Environment Variables

See `.env.example` for all required vars:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Site URL (e.g. `http://localhost:3000` for dev, `https://hedical.com` for prod) |
| `WAITLIST_SHEET_URL` | Google Apps Script Web App URL for Waitlist form submissions |
| `CONTACT_SHEET_URL` | Google Apps Script Web App URL for Contact form submissions |

## Google Sheets / Apps Script Setup

Forms submit to Google Sheets via an Apps Script Web App (server-side proxy keeps the URL hidden from the client).

### Steps

1. **Create a Google Sheet** with two tabs:
   - **Waitlist** — columns: `Timestamp`, `First Name`, `Last Name`, `Email`, `Interests`, `Role`
   - **Contact** — columns: `Timestamp`, `Name`, `Email`, `Subject`, `Message`

2. **Open the Apps Script editor:**
   - In your Sheet: Extensions → Apps Script
   - Or go to https://script.google.com and create a new project

3. **Paste the code** from `APPS_SCRIPT_CODE.gs` (included in this repo) into the editor.

4. **Set your Sheet ID** in the script:
   - Find it in your sheet URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Replace `YOUR_GOOGLE_SHEET_ID_HERE` in the script

5. **Deploy:**
   - Click Deploy → New deployment
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click Deploy → Authorize

6. **Copy the Web App URL** and set it in `.env.local`:
   ```
   WAITLIST_SHEET_URL=https://script.google.com/macros/s/YOUR_ID/exec?tab=Waitlist
   CONTACT_SHEET_URL=https://script.google.com/macros/s/YOUR_ID/exec?tab=Contact
   ```

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

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push repo to GitHub
2. Import into Vercel
3. Add environment variables (`NEXT_PUBLIC_SITE_URL`, `WAITLIST_SHEET_URL`, `CONTACT_SHEET_URL`)
4. Deploy — no config changes needed (Next.js is auto-detected)

## Analytics

Vercel Analytics is included via `@vercel/analytics`. It is cookieless, so no cookie consent banner is required. Analytics only loads in production.

## Legal

The Privacy Policy and Terms of Service in this repo are marketing-site boilerplate. **Before handling PHI or launching the product**, engage a healthcare attorney to review and update them for HIPAA compliance.

## SEO

- Dynamic `metadata` exports on every page (with `alternates.canonical`)
- JSON-LD Organization schema in root layout
- JSON-LD FAQPage schema on guide pages
- Auto-generated `robots.txt` and `sitemap.xml` from env vars
- Open Graph + Twitter Card meta tags on every page
- `llms.txt` at root for LLM discovery

## Search Console Setup

After deploying to production:

1. **Verify ownership:**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add your domain (e.g., `https://hedical.com`)
   - Choose the **DNS TXT record** verification method (recommended) or **HTML file upload**
   - Vercel → your domain's DNS provider → add the TXT record

2. **Submit sitemap:**
   - In Search Console, go to **Sitemaps**
   - Enter `https://hedical.com/sitemap.xml`
   - Confirm it returns 200 and shows URLs indexed

3. **Monitor:**
   - Check **Coverage** report for indexing errors
   - Use **URL Inspection** to test individual pages
   - Submit the homepage for indexing after initial deploy

4. **Recommended additional steps:**
   - Set your preferred domain (choose `https://hedical.com`)
   - Review the **Core Web Vitals** report
   - Check **Mobile Usability** report

## Color Palette

Defined in `globals.css` as Tailwind v4 custom theme:

- `primary`: `#0a5c6a` (dark teal)
- `primary-light`: `#0d7a8c`
- `accent`: `#0891b2` (cyan)
- `hedical-50` through `hedical-950`: blue-teal scale
