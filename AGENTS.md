<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:domain-rules -->
# Domain: hedical.online (canonical, no www)

- Canonical domain is **hedical.online** (NOT www).
- **No code-level redirect exists** — the www → non-www redirect caused loops with Vercel's platform redirect.
- **Vercel** by default redirects `hedical.online` → `www.hedical.online`. This MUST be disabled in the Vercel Dashboard for the site to work.
- **Always ensure Vercel project settings under Domains do NOT redirect naked domain to www.** Must be set to "Do not redirect" or the www subdomain must be removed.
- `NEXT_PUBLIC_SITE_URL` on Vercel should be `https://hedical.online`.
- Hardcoded fallback URLs use `https://hedical.online` — keep consistent.
<!-- END:domain-rules -->
