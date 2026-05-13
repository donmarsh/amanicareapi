"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Home", icon: "H" },
  { href: "/admin/resources", label: "Resources", icon: "R" },
  { href: "/admin/articles", label: "Articles", icon: "A" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  function hrefWithKey(href: string) {
    return key ? `${href}?key=${encodeURIComponent(key)}` : href;
  }

  return (
    <aside className="border-b border-zinc-200 bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="grid gap-5 px-4 py-4 sm:px-6 lg:w-64 lg:px-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
            Amanicare
          </p>
          <p className="mt-1 text-lg font-semibold tracking-tight text-zinc-950">Admin</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto lg:grid lg:overflow-visible">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={hrefWithKey(item.href)}
                className={`flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-teal-700 text-white"
                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <span
                  className={`grid size-7 place-items-center rounded text-xs ${
                    isActive ? "bg-white/15" : "bg-zinc-100 text-zinc-700"
                  }`}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
