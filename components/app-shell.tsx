import {
  CircleDollarSign,
  ClipboardList,
  House,
  Plus,
  PlusCircle,
  Store,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { getWalletSnapshot } from "@/lib/placeholder-data";
import { formatCents } from "@/lib/utils";

const navigation = [
  { href: "/", label: "Home", icon: House },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/listings/new", label: "Sell a swipe", icon: PlusCircle },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/balance", label: "Balance", icon: CircleDollarSign },
] as const;

export async function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const wallet = await getWalletSnapshot();

  return (
    <div className="min-h-dvh bg-linear-to-br from-blue-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link className="text-xl font-bold tracking-tight" href="/">
            OwlSwipe
          </Link>

          <div className="flex items-center gap-2">
            <Link
              aria-label={`Available balance ${formatCents(wallet.availableInCents)}`}
              className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold tabular-nums hover:bg-white/25"
              href="/balance"
            >
              <Wallet aria-hidden="true" className="size-4" />
              {formatCents(wallet.availableInCents)}
            </Link>
            <Button
              asChild
              className="bg-blue-200 text-blue-950 hover:bg-blue-100"
              size="sm"
            >
              <Link href="/balance#add-funds">
                <Plus aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Add funds</span>
              </Link>
            </Button>
            <Button
              asChild
              className="hidden text-white hover:bg-white/15 hover:text-white sm:inline-flex"
              size="sm"
              variant="ghost"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl md:grid-cols-[13rem_1fr]">
        <aside className="hidden border-r border-white/10 p-4 md:block">
          <nav aria-label="Primary navigation" className="grid gap-1">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Button
                asChild
                className="justify-start text-slate-300 hover:bg-white/10 hover:text-white"
                key={href}
                variant="ghost"
              >
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
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-white/10 bg-slate-950 px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-center text-xs text-slate-400 hover:text-white"
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
