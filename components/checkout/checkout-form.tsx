"use client";

import { CreditCard, DollarSign, Lock, Wallet } from "lucide-react";
import Link from "next/link";
import { type FormEvent, type ReactNode, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn, formatCents } from "@/lib/utils";

// TODO(stripe): This is a layout only. Once there's a publishable key and a
// PaymentIntent route (capture_method: "manual", so the charge is held until pickup),
// replace the express buttons with Stripe's Express Checkout Element and the
// card fields with the Payment Element. Never collect raw card numbers in our own inputs.

type Method = "card" | "cashapp" | "balance";

const methods: { id: Method; label: string; icon: ReactNode }[] = [
  { id: "card", label: "Card", icon: <CreditCard aria-hidden="true" className="size-4" /> },
  { id: "cashapp", label: "Cash App Pay", icon: <DollarSign aria-hidden="true" className="size-4" /> },
  { id: "balance", label: "OwlSwipe balance", icon: <Wallet aria-hidden="true" className="size-4" /> },
];

// Wallets Stripe's Express Checkout Element shows in the US. Each only appears
// when the buyer's browser or device supports it.
const expressWallets = [
  { label: "Apple Pay", className: "bg-black text-white ring-white/20 hover:bg-neutral-900" },
  { label: "Google Pay", className: "bg-black text-white ring-white/20 hover:bg-neutral-900" },
  { label: "Link", className: "bg-[#00d66f] text-[#011e0f] ring-transparent hover:bg-[#00c264]" },
  { label: "Amazon Pay", className: "bg-[#ffd814] text-black ring-transparent hover:bg-[#f7ca00]" },
];

const inputClass =
  "h-10 w-full rounded-md bg-slate-950/60 px-3 text-sm text-white ring-1 ring-white/15 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400";

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("grid gap-1.5 text-xs font-medium text-slate-300", className)}>
      {label}
      {children}
    </label>
  );
}

export function CheckoutForm({ totalInCents, balanceInCents }: { totalInCents: number; balanceInCents: number }) {
  const [method, setMethod] = useState<Method>("card");
  const [notice, setNotice] = useState<string>();
  const notEnoughBalance = method === "balance" && balanceInCents < totalInCents;

  function pay(event?: FormEvent) {
    event?.preventDefault();
    setNotice("Payments aren't connected yet. This checkout is a preview until Stripe is set up.");
  }

  return (
    <form className="space-y-6 rounded-xl bg-white/5 p-5 ring-1 ring-white/10" onSubmit={pay}>
      <section className="space-y-3">
        <h2 className="font-semibold">Express checkout</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {expressWallets.map((wallet) => (
            <button
              className={cn("h-11 rounded-md text-sm font-semibold ring-1 transition-colors", wallet.className)}
              key={wallet.label}
              onClick={() => pay()}
              type="button"
            >
              {wallet.label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-white/10" />
        or pay another way
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <section className="space-y-4">
        <h2 className="font-semibold">Payment method</h2>

        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Payment method">
          {methods.map(({ id, label, icon }) => (
            <button
              aria-checked={method === id}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-lg p-3 text-left text-sm ring-1 transition-colors",
                method === id
                  ? "bg-blue-600/15 font-semibold text-white ring-2 ring-blue-400"
                  : "bg-white/5 text-slate-300 ring-white/10 hover:bg-white/10",
              )}
              key={id}
              onClick={() => {
                setMethod(id);
                setNotice(undefined);
              }}
              role="radio"
              type="button"
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {method === "card" ? (
          <div className="grid grid-cols-2 gap-3">
            <Field className="col-span-2" label="Card number">
              <input autoComplete="off" className={inputClass} inputMode="numeric" placeholder="1234 1234 1234 1234" />
            </Field>
            <Field label="Expiration date">
              <input autoComplete="off" className={inputClass} inputMode="numeric" placeholder="MM / YY" />
            </Field>
            <Field label="Security code">
              <input autoComplete="off" className={inputClass} inputMode="numeric" placeholder="CVC" />
            </Field>
            <Field label="Country">
              <select className={inputClass} defaultValue="US">
                <option value="US">United States</option>
              </select>
            </Field>
            <Field label="ZIP code">
              <input autoComplete="off" className={inputClass} inputMode="numeric" placeholder="19122" />
            </Field>
            <label className="col-span-2 flex items-center gap-2 text-sm text-slate-300">
              <input className="size-4 accent-blue-500" type="checkbox" />
              Save this card for future purchases
            </label>
          </div>
        ) : null}

        {method === "cashapp" ? (
          <p className="rounded-lg bg-black/20 p-4 text-sm text-slate-300">
            After you click Pay, scan the QR code with Cash App (or get sent to Cash App on your phone) to approve the
            payment.
          </p>
        ) : null}

        {method === "balance" ? (
          <div className="rounded-lg bg-black/20 p-4 text-sm">
            <p className="flex justify-between">
              <span className="text-slate-400">Available balance</span>
              <span className="font-semibold tabular-nums">{formatCents(balanceInCents)}</span>
            </p>
            <p className="mt-1 flex justify-between">
              <span className="text-slate-400">After this order</span>
              <span className={cn("tabular-nums", notEnoughBalance ? "text-rose-300" : "text-slate-300")}>
                {formatCents(balanceInCents - totalInCents)}
              </span>
            </p>
            {notEnoughBalance ? (
              <p className="mt-3 text-rose-300">
                Not enough balance.{" "}
                <Link className="text-blue-300 underline hover:text-blue-200" href="/balance#add-funds">
                  Add funds
                </Link>{" "}
                or choose another method.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <div className="space-y-3">
        <Button
          className="h-12 w-full bg-blue-600 text-base font-semibold text-white hover:bg-blue-500"
          disabled={notEnoughBalance}
          type="submit"
        >
          <Lock aria-hidden="true" className="size-4" />
          Pay {formatCents(totalInCents)}
        </Button>
        {notice ? (
          <p aria-live="polite" className="rounded-md bg-amber-400/10 p-3 text-center text-sm text-amber-200 ring-1 ring-amber-400/30">
            {notice}
          </p>
        ) : null}
        <p className="text-center text-xs text-slate-500">
          Payments are processed securely by Stripe. OwlSwipe never sees your full card number.
        </p>
      </div>
    </form>
  );
}
