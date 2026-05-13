import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold">UX AI Auditor</h1>

      <Link
        href="/analyze"
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Start audit
      </Link>
    </main>
  );
}