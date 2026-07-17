"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState(undefined); // undefined = loading, null = logged out
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const [applications, setApplications] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [kycSubmissions, setKycSubmissions] = useState([]);
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const loadData = useCallback(async () => {
    setLoadError(null);
    const [appsRes, roundsRes, kycRes, projectsRes] = await Promise.all([
      fetch("/api/admin/investor-applications").then((r) => r.json()),
      fetch("/api/admin/rounds").then((r) => r.json()),
      fetch("/api/admin/kyc").then((r) => r.json()),
      fetch("/api/admin/projects").then((r) => r.json()),
    ]);
    if (!appsRes.ok || !roundsRes.ok || !kycRes.ok || !projectsRes.ok) {
      setLoadError(
        appsRes.error || roundsRes.error || kycRes.error || projectsRes.error || "Failed to load admin data."
      );
      return;
    }
    setApplications(appsRes.applications);
    setRounds(roundsRes.rounds);
    setKycSubmissions(kycRes.submissions);
    setApprovedProjects(projectsRes.rounds);
  }, []);

  const pendingApplications = applications.filter((a) => a.status === "pending");
  const approvedInvestors = applications.filter((a) => a.status === "approved");
  const pendingKyc = kycSubmissions.filter((s) => s.status === "pending");
  const approvedFounders = kycSubmissions.filter((s) => s.status === "approved");

  useEffect(() => {
    if (session) loadData();
  }, [session, loadData]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function decideApplication(id, status) {
    const res = await fetch(`/api/admin/investor-applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then((r) => r.json());
    if (res.ok) loadData();
  }

  async function decideRound(id, status) {
    const res = await fetch(`/api/admin/rounds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then((r) => r.json());
    if (res.ok) loadData();
  }

  async function decideKyc(id, status) {
    let rejectionReason;
    if (status === "rejected") {
      rejectionReason = window.prompt("Reason for rejection (shown to the founder):") || "Not specified";
    }
    const res = await fetch(`/api/admin/kyc/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason }),
    }).then((r) => r.json());
    if (res.ok) loadData();
  }

  if (session === undefined) {
    return (
      <main className="admin">
        <p className="admin__loading">Loading…</p>
        <style jsx>{`
          .admin {
            max-width: 480px;
            margin: 4rem auto;
            padding: 0 1.5rem;
          }
          .admin__loading {
            font-family: var(--lp-font-body);
            color: var(--lp-mute);
          }
        `}</style>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin">
        <form className="admin__login" onSubmit={handleLogin}>
          <span className="admin__eyebrow">CEXAID Admin</span>
          <h1>Sign in</h1>
          <label className="admin__field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="admin__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Sign in</button>
          {loginError && <p className="admin__error">{loginError}</p>}
        </form>

        <style jsx>{`
          .admin {
            max-width: 420px;
            margin: 4rem auto;
            padding: 0 1.5rem;
          }
          .admin__login {
            background: var(--lp-panel);
            border: 1px solid var(--lp-line);
            padding: 2rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .admin__eyebrow {
            font-family: var(--lp-font-mono);
            font-size: 0.7rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--lp-mute);
          }
          .admin__login h1 {
            font-family: var(--lp-font-display);
            font-size: 1.6rem;
            margin: 0;
            color: var(--lp-ink);
          }
          .admin__field {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            font-family: var(--lp-font-mono);
            font-size: 0.7rem;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--lp-mute);
          }
          .admin__field input {
            background: var(--lp-panel-raised);
            border: 1px solid var(--lp-line);
            border-radius: 2px;
            color: var(--lp-ink);
            font-family: var(--lp-font-body);
            font-size: 0.9rem;
            padding: 0.6rem 0.75rem;
          }
          .admin__login button {
            background: var(--lp-brass);
            color: var(--lp-void);
            font-weight: 600;
            font-size: 0.9rem;
            padding: 0.7rem 1rem;
            border: none;
            border-radius: 2px;
            cursor: pointer;
          }
          .admin__error {
            font-family: var(--lp-font-body);
            font-size: 0.82rem;
            color: var(--lp-signal-red);
            margin: 0;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="admin-dash">
      <header className="admin-dash__head">
        <span className="admin-dash__eyebrow">CEXAID Admin</span>
        <div className="admin-dash__head-actions">
          <Link href="/launchpad/admin/create-listing" className="admin-dash__create-link">
            + Create listing
          </Link>
          <button onClick={handleLogout} className="admin-dash__logout">
            Sign out
          </button>
        </div>
      </header>

      {loadError && <p className="admin-dash__error">{loadError}</p>}

      <section className="admin-dash__section">
        <h2>Pending investor applications ({pendingApplications.length})</h2>
        {pendingApplications.length === 0 && <p className="admin-dash__empty">Nothing pending.</p>}
        {pendingApplications.map((app) => (
          <div className="admin-dash__detail-card" key={app.id}>
            <div className="admin-dash__detail-grid">
              <div>
                <span className="admin-dash__detail-label">Name</span>
                <span className="admin-dash__detail-value">{app.name}</span>
              </div>
              <div>
                <span className="admin-dash__detail-label">Email</span>
                <span className="admin-dash__detail-value">{app.email}</span>
              </div>
              <div>
                <span className="admin-dash__detail-label">Organization</span>
                <span className="admin-dash__detail-value">{app.organization || "—"}</span>
              </div>
              <div>
                <span className="admin-dash__detail-label">Wallet</span>
                <span className="admin-dash__detail-value">{app.wallet || "Not connected yet"}</span>
              </div>
              <div className="admin-dash__detail-full">
                <span className="admin-dash__detail-label">X / LinkedIn</span>
                {app.social_handle ? (
                  <a href={app.social_handle} target="_blank" rel="noreferrer" className="admin-dash__social-link">
                    {app.social_handle}
                  </a>
                ) : (
                  <span className="admin-dash__detail-value">—</span>
                )}
              </div>
              {app.note && (
                <div className="admin-dash__detail-full">
                  <span className="admin-dash__detail-label">Note</span>
                  <span className="admin-dash__detail-value">{app.note}</span>
                </div>
              )}
            </div>
            <div className="admin-dash__actions">
              <button className="admin-dash__approve" onClick={() => decideApplication(app.id, "approved")}>
                Approve
              </button>
              <button className="admin-dash__reject" onClick={() => decideApplication(app.id, "rejected")}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-dash__section">
        <h2>Approved investors ({approvedInvestors.length})</h2>
        {approvedInvestors.length === 0 && <p className="admin-dash__empty">None yet.</p>}
        {approvedInvestors.map((app) => (
          <div className="admin-dash__row" key={app.id}>
            <div>
              <strong>{app.name}</strong> — {app.email}
              <div className="admin-dash__meta">
                {app.wallet || "No wallet connected yet"} {app.organization && `· ${app.organization}`}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-dash__section">
        <h2>Pending KYC submissions ({pendingKyc.length})</h2>
        {pendingKyc.length === 0 && <p className="admin-dash__empty">Nothing pending.</p>}
        {pendingKyc.map((sub) => (
          <div className="admin-dash__row admin-dash__row--kyc" key={sub.id}>
            <div>
              <strong>{sub.full_name}</strong>
              <div className="admin-dash__meta">
                {sub.wallet}
                <br />
                {sub.email} · {sub.country}
                {sub.phone && ` · ${sub.phone}`}
              </div>
              <div className="admin-dash__note">
                <strong>{sub.business_name}</strong> · Reg. #{sub.registration_number} ·{" "}
                {sub.business_country}
              </div>
            </div>
            <div className="admin-dash__actions">
              <button className="admin-dash__approve" onClick={() => decideKyc(sub.id, "approved")}>
                Approve
              </button>
              <button className="admin-dash__reject" onClick={() => decideKyc(sub.id, "rejected")}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-dash__section">
        <h2>Approved founders ({approvedFounders.length})</h2>
        {approvedFounders.length === 0 && <p className="admin-dash__empty">None yet.</p>}
        {approvedFounders.map((sub) => (
          <div className="admin-dash__row" key={sub.id}>
            <div>
              <strong>{sub.full_name}</strong>
              <div className="admin-dash__meta">
                {sub.wallet} · {sub.email} · {sub.business_name}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-dash__section">
        <h2>Pending Private Sale rounds ({rounds.length})</h2>
        {rounds.length === 0 && <p className="admin-dash__empty">Nothing pending.</p>}
        {rounds.map((round) => (
          <div className="admin-dash__row" key={round.id}>
            <div>
              <strong>{round.projects?.name}</strong> — {round.token_symbol} @ ${round.token_price_usd}
              <div className="admin-dash__meta">
                Allocation ${Number(round.total_allocation_usd).toLocaleString()} · Ticket $
                {round.min_ticket_usd}-${round.max_ticket_usd} · founder {round.projects?.founder_wallet}
              </div>
            </div>
            <div className="admin-dash__actions">
              <button className="admin-dash__approve" onClick={() => decideRound(round.id, "approved")}>
                Approve
              </button>
              <button className="admin-dash__reject" onClick={() => decideRound(round.id, "rejected")}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="admin-dash__section">
        <h2>Live &amp; Concluded Projects ({approvedProjects.length})</h2>
        {approvedProjects.length === 0 && <p className="admin-dash__empty">Nothing live yet.</p>}
        {approvedProjects.map((round) => (
          <div className="admin-dash__row" key={round.id}>
            <div>
              <strong>{round.projects?.name}</strong> — {round.token_symbol} @ ${round.token_price_usd}
              {round.projects?.is_demo && <span className="admin-dash__demo-tag">DEMO</span>}
              <div className="admin-dash__meta">
                ${Number(round.raised_usd).toLocaleString()} raised of $
                {Number(round.total_allocation_usd).toLocaleString()} · {round.chain}
              </div>
            </div>
            <div className="admin-dash__actions">
              <a
                href={`/launchpad/${round.projects?.slug}`}
                target="_blank"
                rel="noreferrer"
                className="admin-dash__view-link"
              >
                View listing →
              </a>
            </div>
          </div>
        ))}
      </section>

      <style jsx>{`
        .admin-dash {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .admin-dash__head {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-dash__eyebrow {
          font-family: var(--lp-font-mono);
          font-size: 0.8rem;
          letter-spacing: 0.12em;
          color: var(--lp-brass);
        }
        .admin-dash__head-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .admin-dash__create-link {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-brass);
          border: 1px solid var(--lp-brass);
          border-radius: 2px;
          padding: 0.4rem 0.8rem;
          text-decoration: none;
        }
        .admin-dash__logout {
          background: transparent;
          border: 1px solid var(--lp-line);
          color: var(--lp-mute);
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          padding: 0.4rem 0.8rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .admin-dash__section {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .admin-dash__section h2 {
          font-family: var(--lp-font-display);
          font-size: 1.2rem;
          margin: 0;
          color: var(--lp-ink);
        }
        .admin-dash__empty {
          font-family: var(--lp-font-body);
          color: var(--lp-mute);
          font-size: 0.85rem;
          margin: 0;
        }
        .admin-dash__detail-card {
          background: var(--lp-panel);
          border: 1px solid var(--lp-brass);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .admin-dash__detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.9rem;
        }
        .admin-dash__detail-full {
          grid-column: 1 / -1;
        }
        .admin-dash__detail-label {
          display: block;
          font-family: var(--lp-font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--lp-mute);
          margin-bottom: 0.2rem;
        }
        .admin-dash__detail-value {
          font-family: var(--lp-font-body);
          font-size: 0.88rem;
          color: var(--lp-ink);
        }
        .admin-dash__row {
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          padding: 1.1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          font-family: var(--lp-font-body);
          font-size: 0.9rem;
          color: var(--lp-ink);
        }
        .admin-dash__meta {
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          color: var(--lp-mute);
          margin-top: 0.25rem;
        }
        .admin-dash__doc-links {
          display: flex;
          gap: 0.9rem;
          margin-top: 0.5rem;
        }
        .admin-dash__doc-links a {
          font-family: var(--lp-font-mono);
          font-size: 0.75rem;
          color: var(--lp-brass);
          text-decoration: none;
        }
        .admin-dash__view-docs {
          margin-top: 0.5rem;
          background: transparent;
          border: 1px dashed var(--lp-line);
          color: var(--lp-mute);
          font-family: var(--lp-font-mono);
          font-size: 0.72rem;
          padding: 0.35rem 0.7rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .admin-dash__social-link {
          display: block;
          font-family: var(--lp-font-mono);
          font-size: 0.75rem;
          color: var(--lp-brass);
          margin-top: 0.3rem;
        }
        .admin-dash__demo-tag {
          font-family: var(--lp-font-mono);
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          color: var(--lp-void);
          background: var(--lp-brass);
          padding: 0.1rem 0.4rem;
          border-radius: 2px;
          margin-left: 0.5rem;
        }
        .admin-dash__view-link {
          font-family: var(--lp-font-mono);
          font-size: 0.78rem;
          color: var(--lp-brass);
          text-decoration: none;
        }
        .admin-dash__note {
          font-size: 0.8rem;
          color: var(--lp-mute);
          margin-top: 0.4rem;
        }
        .admin-dash__actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .admin-dash__approve {
          background: var(--lp-signal-green);
          color: var(--lp-void);
          border: none;
          font-weight: 600;
          font-size: 0.8rem;
          padding: 0.45rem 0.8rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .admin-dash__reject {
          background: transparent;
          border: 1px solid var(--lp-signal-red);
          color: var(--lp-signal-red);
          font-size: 0.8rem;
          padding: 0.45rem 0.8rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .admin-dash__error {
          font-family: var(--lp-font-body);
          color: var(--lp-signal-red);
          font-size: 0.85rem;
        }
      `}</style>
    </main>
  );
}
