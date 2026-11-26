import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 text-center">
      <div className="max-w-md space-y-4">
        <p className="font-semibold text-primary">404</p>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground">
          The page you requested does not exist or has moved.
        </p>
        <Button asChild>
          <Link href="/marketplace">Return to marketplace</Link>
        </Button>
      </div>
    </main>
  );
}
