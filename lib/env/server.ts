import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  APP_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_test_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(
  source: Record<string, string | undefined> = process.env,
): ServerEnv {
  const parsed = serverEnvSchema.safeParse(source);

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment configuration: ${z.prettifyError(parsed.error)}`,
    );
  }

  return parsed.data;
}
