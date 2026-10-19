"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const SERVICES = [
  { t: "CEX Listing Services", d: "Listing preparation and exchange-facing positioning for projects ready to move into centralized markets.", p: ["Listing strategy", "Exchange readiness", "Documentation support", "Market positioning"] },
  { t: "VC & Investor Network", d: "Introductions to investors, private backers and strategic partners across our capital network.", p: ["VC introductions", "Pitch preparation", "Fundraising strategy", "Private sale support"] },
  { t: "Token Launchpad", d: "Run your Private Sale directly on CEXAID — KYC-verified founders, investor-gated rounds and a published vesting schedule.", p: ["Founder KYC required", "Reviewed by CEXAID before going live", "Platform-wide investor approval", "Published vesting schedule"] },
  { t: "Early-Stage Funding", d: "Funding access, incubation support and growth preparation for early-stage projects.", p: ["Seed support", "Incubation", "Growth funding", "Expansion advisory"] },
];

export default function ServicesPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const f = new FormData(e.target);
    const data = {
      fullName: f.get("Full Name"),
      projectName: f.get("Project Name"),
      email: f.get("Email Address"),
      telegram: f.get("Telegram Username"),
      website: f.get("Website"),
      service: f.get("Service Needed"),
      message: f.get("Project Description"),
    };
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) {
        setMsg("Application sent successfully! We'll be in touch.");
        e.target.reset();
      } else setMsg("Please complete all required fields.");
    } catch {
      setMsg("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <SiteHeader />
      <main className="sv">
        <h1>Services</h1>
        <p className="lead">Listings, capital access and launch infrastructure for crypto projects.</p>

        <div className="sv__grid">
          {SERVICES.map((s) => (
            <div key={s.t} className="sv__card">
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              <ul>{s.p.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          ))}
        </div>

        <section className="sv__contact" id="contact">
          <div>
            <h2>Get Listed, Funded or Launched</h2>
            <p>Submit your project and our team will follow up on listing support, investor access or Launchpad applications.</p>
            <p className="links">
              <a href="https://x.com/cexaidfunding" target="_blank" rel="noreferrer">X</a>
              <a href="mailto:contact@cexaid.com">contact@cexaid.com</a>
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@cexaid.com&su=CEXAID%20enquiry" target="_blank" rel="noreferrer">Open in Gmail</a>
              <Link href="/about">Team</Link>
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            {["Full Name", "Project Name", "Email Address", "Telegram Username", "Website"].map((f) => (
              <input key={f} name={f} placeholder={f} required />
            ))}
            <select name="Service Needed" required defaultValue="">
              <option value="" disabled>Service Needed</option>
              <option>CEX Listing</option>
              <option>VC Connection</option>
              <option>Private Sale Application (Launchpad)</option>
              <option>Early-Stage Funding</option>
            </select>
            <textarea name="Project Description" placeholder="Project Description" rows="5" required />
            <button type="submit" disabled={loading}>{loading ? "Sending…" : "Send Application"}</button>
            {msg && <p className="msg">{msg}</p>}
          </form>
        </section>
      </main>
      <SiteFooter />
      <style jsx>{`
        .sv { max-width: 1100px; margin: 0 auto; padding: 1.75rem 1.25rem 1rem; display: flex; flex-direction: column; gap: 1.25rem; }
        h1 { margin: 0; font-size: 1.8rem; font-weight: 800; }
        .lead { margin: 0; color: var(--lp-mute); }
        .sv__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .sv__card { background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 14px; padding: 1.2rem; }
        h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }
        .sv__card p { margin: 0 0 0.7rem; color: var(--lp-mute); font-size: 0.88rem; line-height: 1.55; }
        ul { margin: 0; padding-left: 1.1rem; color: var(--lp-ink); font-size: 0.85rem; line-height: 1.8; }
        .sv__contact { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1rem; background: var(--lp-panel); border: 1px solid var(--lp-line); border-radius: 16px; padding: 1.5rem; }
        h2 { margin: 0 0 0.6rem; font-size: 1.4rem; }
        .sv__contact p { color: var(--lp-mute); line-height: 1.6; font-size: 0.92rem; margin: 0 0 0.8rem; }
        .links { display: flex; gap: 1rem; flex-wrap: wrap; }
        .links :global(a), .links a { color: var(--lp-brass-bright); text-decoration: none; }
        form { display: flex; flex-direction: column; gap: 0.7rem; }
        input, select, textarea { background: var(--lp-void); border: 1px solid var(--lp-line); color: var(--lp-ink); border-radius: 10px; padding: 0.7rem 0.9rem; font: 0.9rem var(--lp-font-body); }
        input:focus, select:focus, textarea:focus { outline: none; border-color: var(--lp-brass); }
        button { background: var(--lp-brass); color: var(--lp-on-accent); border: 0; border-radius: 10px; padding: 0.8rem; font-weight: 700; cursor: pointer; }
        button:disabled { opacity: 0.6; cursor: default; }
        .msg { margin: 0; font-size: 0.85rem; }
      `}</style>
    </>
  );
}
