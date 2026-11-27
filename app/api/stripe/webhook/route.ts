export async function POST() {
  return Response.json(
    {
      error:
        "Stripe webhook handling is not implemented. No payment state was changed.",
    },
    { status: 501 },
  );
}
