"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navLinks = [
  { name: "Products", href: "#", children: [
    { name: "Bill & Denial Navigator", href: "/products/bill-denial-navigator" },
    { name: "Documentation Tool", href: "/products/documentation-tool" },
    { name: "Polypharmacy Manager", href: "/products/polypharmacy-manager" },
  ]},
  { name: "Guides", href: "/guides" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Header({ initialUser }: { initialUser?: { email: string } | null }) {
  const [user, setUser] = useState<{ email: string } | null>(initialUser ?? null);
  const [plan, setPlan] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isProductActive = navLinks[0].children!.some((c) => pathname === c.href);

  useEffect(() => {
    const supabase = createClient();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const loggedIn = session?.user != null;
      setUser(loggedIn ? { email: session.user.email ?? "" } : null);
      if (!loggedIn) setPlan(null);
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setPlan(null); return; }
    fetch("/api/me/entitlement")
      .then((r) => r.json())
      .then((data) => setPlan(data.plan))
      .catch(() => setPlan(null));
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setProductsOpen(false);
      }
      if (
        userMenuRef.current && !userMenuRef.current.contains(e.target as Node) &&
        userButtonRef.current && !userButtonRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
    window.location.href = "/";
  }

  const initial = user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 shrink-0">
          <img
            src="/images/hedical_icon_only.png"
            alt="Hedical icon"
            width={56}
            height={56}
            className="h-14 w-auto"
          />
          <span className="text-xl font-serif text-ink font-semibold tracking-tight">Hedical</span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8 ml-8 lg:ml-12" aria-label="Main navigation">
          {/* Products dropdown */}
          <div className="relative">
            <button
              ref={buttonRef}
              className={`flex items-center gap-1 text-sm transition-colors ${isProductActive ? "text-ink font-medium" : "text-body hover:text-teal"}`}
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
              onClick={() => setProductsOpen(!productsOpen)}
              aria-expanded={productsOpen}
              aria-haspopup="true"
            >
              Products
              <svg className={`h-3 w-3 transition-transform ${productsOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {productsOpen && (
              <div
                ref={dropdownRef}
                className="absolute left-0 top-full mt-2 w-64 rounded-lg border border-hairline bg-white p-2 shadow-lg animate-dropdown"
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
                role="menu"
              >
                {navLinks[0].children!.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block rounded-md px-3 py-2 text-sm text-body transition-colors hover:bg-paper-light hover:text-teal"
                    role="menuitem"
                    onClick={() => setProductsOpen(false)}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {navLinks.slice(1).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${isActive ? "text-ink font-medium" : "text-body hover:text-teal"}`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right side: CTA or user menu */}
        <div className="hidden md:flex md:items-center md:gap-4 ml-auto">
          {user ? (
            <div className="relative">
              <button
                ref={userButtonRef}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-teal text-sm font-semibold text-white hover:brightness-110 transition-all"
                aria-label="User menu"
              >
                {initial}
              </button>
              {userMenuOpen && (
                <div
                  ref={userMenuRef}
                  className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-hairline bg-white p-1.5 shadow-lg animate-dropdown"
                  role="menu"
                >
                  {plan && (
                    <div className="px-3 py-1.5 text-xs text-muted border-b border-hairline mb-1">
                      {plan === "unlimited" ? (
                        <span className="text-green-700 font-medium">Unlimited Plan</span>
                      ) : (
                        <span>Free Plan</span>
                      )}
                    </div>
                  )}
                  <Link
                    href="/dashboard"
                    className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-paper-light hover:text-ink"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/account"
                    className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-paper-light hover:text-ink"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Account & billing
                  </Link>
                  <hr className="my-1 border-hairline" />
                  <button
                    onClick={handleSignOut}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm text-muted hover:bg-paper-light hover:text-ink"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/waitlist"
              className="rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal"
            >
              Get Early Access
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-hairline bg-white px-4 py-4 md:hidden" role="dialog" aria-label="Mobile navigation">
          <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
            <div className="text-sm text-body mb-1">Products</div>
            {navLinks[0].children!.map((child) => {
              const isActive = pathname === child.href;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`pl-4 text-sm transition-colors ${isActive ? "text-ink font-medium" : "text-body hover:text-teal"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {child.name}
                </Link>
              );
            })}
            <hr className="my-2 border-hairline" />
            {navLinks.slice(1).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm transition-colors ${isActive ? "text-ink font-medium" : "text-body hover:text-teal"}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}
            <hr className="my-2 border-hairline" />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-teal hover:text-teal-light"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/account"
                  className="text-sm font-medium text-muted hover:text-ink"
                  onClick={() => setMobileOpen(false)}
                >
                  Account & billing
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="text-left text-sm font-medium text-muted hover:text-ink"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/waitlist"
                className="mt-2 rounded-lg bg-ink px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-teal"
                onClick={() => setMobileOpen(false)}
              >
                Get Early Access
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
