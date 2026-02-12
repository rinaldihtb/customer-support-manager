import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-6 md:p-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-[var(--foreground)]/10 bg-[var(--background)] p-8 shadow-sm md:p-10">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Customer Support
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground)]/60">
            Choose your role to continue.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              href="/support"
              className="group rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-6 transition hover:border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/10"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/50">
                Customer
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Create a support ticket
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]/60">
                Submit an issue with your name, email, subject, and description.
              </p>
              <div className="mt-5 inline-flex items-center rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm group-hover:bg-sky-700 bg-sky-500">
                Go to Support Form
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="group rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-6 transition hover:border-[var(--foreground)]/20 hover:bg-[var(--foreground)]/10"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--foreground)]/50">
                Agent
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                Manage tickets
              </p>
              <p className="mt-2 text-sm text-[var(--foreground)]/60">
                View ticket details, edit drafts (when open), and resolve tickets.
              </p>
              <div className="mt-5 inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm group-hover:bg-emerald-700 bg-emerald-500">
                Go to Dashboard
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

