import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-semibold text-primary">OwlSwipe</p>
          <CardTitle className="text-2xl">Sign in with your school email</CardTitle>
          <CardDescription>
            Passwordless email-code authentication will be implemented in the auth ticket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            <Mail aria-hidden="true" className="size-5 shrink-0" />
            Supabase Auth integration point
          </div>
          <Button asChild className="w-full" variant="outline">
            <Link href="/marketplace">Continue to marketplace</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
