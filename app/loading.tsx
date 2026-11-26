export default function Loading() {
  return (
    <main aria-busy="true" className="mx-auto max-w-4xl space-y-4 px-4 py-10">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="h-9 w-64 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <span className="sr-only">Loading OwlSwipe</span>
    </main>
  );
}
