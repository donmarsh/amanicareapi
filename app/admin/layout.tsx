import { Suspense } from "react";

import { AdminSidebar } from "@/app/admin/sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950 lg:grid lg:grid-cols-[auto_1fr]">
      <Suspense
        fallback={
          <aside className="border-b border-zinc-200 bg-white lg:h-screen lg:border-b-0 lg:border-r">
            <div className="grid gap-5 px-4 py-4 sm:px-6 lg:w-64 lg:px-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                Amanicare
              </p>
            </div>
          </aside>
        }
      >
        <AdminSidebar />
      </Suspense>
      <main className="min-w-0">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
