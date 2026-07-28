"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AddContributorPage() {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState(undefined);
  const [rounds, setRounds] = useState([]);
  const [roundId, setRoundId] = useState("");
  const [wallet, setWallet] = useState("");
  const [amountUSD, setAmountUSD] = useState("");
  const [txHash, setTxHash] = useState("");
  const [contributedAt, setContributedAt] = useState("");
  const [existing, setExisting] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/admin/projects")
      .then((r) => r.json())
      .then((res) => {
        if (res.ok) setRounds(res.rounds);
      });
  }, [session]);

  const loadExisting = useCallback(async () => {
    if (!roundId) {
      setExisting([]);
      return;
    }
    const res = await fetch(`/api/admin/contributions?roundId=${roundId}`).then((r) => r.json());
    if (res.ok) setExisting(res.contributions);
  }, [roundId]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!roundId || !wallet || !amountUSD) {
      setMessage({ type: "error", text: "Round, wallet, and amount are required." });
      return;
    }
    setStatus("submitting");
    const res = await fetch("/api/admin/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roundId,
        wallet,
        amountUSD: Number(amountUSD),
        txHash: txHash || null,
        contributedAt: contributedAt ? new Date(contributedAt).toISOString() : null,
      }),
    }).then((r) => r.json());
    setStatus("idle");

    if (res.ok) {
      setWallet("");
      setAmountUSD("");
      setTxHash("");
      setContributedAt("");
      setMessage({ type: "ok", text: "Added." });
      loadExisting();
    } else {
      setMessage({ type: "error", text: res.error });
    }
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/admin/contributions/${id}`, { method: "DELETE" }).then((r) => r.json());
    if (res.ok) loadExisting();
  }

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
      <h1>Add historical contributors</h1>
      <p className="page__note">
        For real past contributions that happened before this platform
        tracked them live. This does NOT change the round's raised total -
        that figure is already set correctly. This just fills in the
        contributor breakdown.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <label className="form__field">
          <span>Project / round</span>
          <select value={roundId} onChange={(e) => setRoundId(e.target.value)}>
            <option value="">Select a project…</option>
            {rounds.map((r) => (
              <option key={r.id} value={r.id}>
                {r.projects?.name} — {r.token_symbol}
              </option>
            ))}
          </select>
        </label>

        <div className="form__row">
          <label className="form__field">
            <span>Wallet address</span>
            <input type="text" value={wallet} onChange={(e) => setWallet(e.target.value)} />
          </label>
          <label className="form__field">
            <span>Amount (USD)</span>
            <input type="number" value={amountUSD} onChange={(e) => setAmountUSD(e.target.value)} />
          </label>
        </div>

        <div className="form__row">
          <label className="form__field">
            <span>Transaction hash (optional)</span>
            <input type="text" value={txHash} onChange={(e) => setTxHash(e.target.value)} />
          </label>
          <label className="form__field">
            <span>Date contributed (optional)</span>
            <input type="date" value={contributedAt} onChange={(e) => setContributedAt(e.target.value)} />
          </label>
        </div>

        <button type="submit" className="form__submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Adding…" : "Add contributor"}
        </button>
        {message && <p className={`form__message form__message--${message.type}`}>{message.text}</p>}
      </form>

      {roundId && (
        <div className="existing">
          <h3>Already added ({existing.length})</h3>
          {existing.length === 0 && <p className="page__note">None yet.</p>}
          {existing.map((c) => (
            <div className="existing__row" key={c.id}>
              <span>
                {c.wallet.slice(0, 6)}…{c.wallet.slice(-4)} — ${Number(c.amount_usd).toLocaleString()}
              </span>
              <button onClick={() => handleDelete(c.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .page {
          max-width: 700px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
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
        .page__note {
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          color: var(--lp-mute);
          margin: 0;
          line-height: 1.5;
        }
        .form {
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form__row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .form__field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-family: var(--lp-font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--lp-mute);
        }
        .form__field input,
        .form__field select {
          background: var(--lp-panel-raised);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          color: var(--lp-ink);
          font-family: var(--lp-font-body);
          font-size: 0.9rem;
          padding: 0.55rem 0.7rem;
        }
        .form__submit {
          background: var(--lp-brass);
          color: var(--lp-void);
          font-weight: 600;
          font-size: 0.9rem;
          padding: 0.7rem 1rem;
          border: none;
          border-radius: 2px;
          cursor: pointer;
          align-self: flex-start;
        }
        .form__submit:disabled {
          background: var(--lp-panel-raised);
          color: var(--lp-mute);
        }
        .form__message--ok {
          color: var(--lp-signal-green);
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          margin: 0;
        }
        .form__message--error {
          color: var(--lp-signal-red);
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          margin: 0;
        }
        .existing {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .existing h3 {
          font-family: var(--lp-font-display);
          font-size: 1.1rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .existing__row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 0.7rem 1rem;
          font-family: var(--lp-font-mono);
          font-size: 0.8rem;
          color: var(--lp-ink);
        }
        .existing__row button {
          background: transparent;
          border: 1px solid var(--lp-signal-red);
          color: var(--lp-signal-red);
          font-family: var(--lp-font-mono);
          font-size: 0.75rem;
          padding: 0.3rem 0.7rem;
          border-radius: 2px;
          cursor: pointer;
        }
      `}</style>
    </main>
  );
}
