"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminCreateListingForm } from "@/components/launchpad/AdminCreateListingForm";

export default function AdminCreateListingPage() {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState(undefined);
  const [result, setResult] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (session === undefined) {
    return (
      <main className="page">
        <p>Loading…</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page">
        <p>
          Not signed in. <Link href="/launchpad/admin">Go to admin login →</Link>
        </p>
        <style jsx>{`
          .page {
            max-width: 640px;
            margin: 4rem auto;
            padding: 0 1.5rem;
            font-family: var(--lp-font-body);
            color: var(--lp-mute);
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <Link href="/launchpad/admin" className="page__back">
        ← Admin dashboard
      </Link>
      <h1>Create a Private Sale listing</h1>

      {!result && <AdminCreateListingForm onCreated={(r) => setResult(r)} />}

      {result && (
        <div className="page__done">
          <h3>Listing published 🎉</h3>
          <Link href={`/launchpad/${result.slug}`}>View it on the marketplace →</Link>
        </div>
      )}

      <style jsx>{`
        .page {
          max-width: 760px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .page__back {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-mute);
          text-decoration: none;
        }
        .page h1 {
          font-family: var(--lp-font-display);
          font-size: 1.8rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .page__done {
          background: var(--lp-panel);
          border: 1px solid var(--lp-signal-green);
          padding: 1.5rem;
        }
        .page__done h3 {
          font-family: var(--lp-font-display);
          margin: 0 0 0.6rem;
          color: var(--lp-ink);
        }
        .page__done :global(a) {
          color: var(--lp-brass);
          font-family: var(--lp-font-mono);
          font-size: 0.85rem;
        }
      `}</style>
    </main>
  );
}
