"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, LayoutDashboard, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  {
    href: "/",
    label: "Pipeline",
    icon: Workflow,
    description: "Scrape · Audit · Rank · Build · Outreach",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "All saved records",
  },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="hidden sm:block">
            <div className="font-display text-xl leading-none">
              Lead <span className="text-muted-foreground">→</span> Launch
            </div>
            <div className="text-[10px] text-muted-foreground leading-tight tracking-[0.15em] uppercase mt-0.5">
              Local · private · yours
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                )}
              >
                <Icon
                  className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "")}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right slot — subtle tagline on wider screens */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-muted-foreground tracking-[0.15em] uppercase shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground/50" aria-hidden="true" />
          {NAV_LINKS.find((l) =>
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href),
          )?.description ?? ""}
        </div>
      </div>
    </header>
  );
}
