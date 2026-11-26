import { CircleDollarSign, ClipboardList, PlusCircle, Store } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/listings/new", label: "Sell a swipe", icon: PlusCircle },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/balance", label: "Balance", icon: CircleDollarSign },
] as const;

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link className="text-xl font-bold tracking-tight text-primary" href="/marketplace">
            OwlSwipe
          </Link>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl md:grid-cols-[13rem_1fr]">
        <aside className="hidden border-r p-4 md:block">
          <nav aria-label="Primary navigation" className="grid gap-1">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Button asChild className="justify-start" key={href} variant="ghost">
                <Link href={href}>
                  <Icon aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 px-4 py-8 pb-24 sm:px-6 md:pb-8">{children}</main>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t bg-card px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-center text-xs text-muted-foreground hover:text-foreground"
            href={href}
            key={href}
          >
            <Icon aria-hidden="true" className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
