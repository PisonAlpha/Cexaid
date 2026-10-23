"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

const KEY = "cexaid-consent"; // "granted" | "denied"
const EVENT = "cexaid-consent-reset";
const GA_ID = (process.env.NEXT_PUBLIC_GA_ID || "").trim();
const GA_OK = /^G-[A-Z0-9]{6,12}$/.test(GA_ID);

function readChoice() {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}
function writeChoice(v) {
  try {
    if (v) window.localStorage.setItem(KEY, v);
    else window.localStorage.removeItem(KEY);
  } catch {}
}

// Vercel Web Analytics is cookieless and always on. Google Analytics 4 loads only when a valid
// NEXT_PUBLIC_GA_ID is configured AND the visitor has accepted.
export function SiteAnalytics() {
  const [choice, setChoice] = useState(undefined); // undefined = not read yet

  useEffect(() => {
    setChoice(readChoice());
    const reset = () => { writeChoice(null); setChoice(null); };
    window.addEventListener(EVENT, reset);
    return () => window.removeEventListener(EVENT, reset);
  }, []);

  const decide = (v) => { writeChoice(v); setChoice(v); };

  return (
    <>
      <VercelAnalytics />
      {GA_OK && choice === "granted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {GA_OK && choice === null && (
        <div className="cb" role="dialog" aria-label="Cookie preferences">
          <p>
            We use Google Analytics cookies to understand how the site is used. Accept or decline; the site works the same
            either way. <a href="/privacy#analytics">Details</a>
          </p>
          <div className="cb__btns">
            <button type="button" onClick={() => decide("denied")}>Decline</button>
            <button type="button" className="cb__yes" onClick={() => decide("granted")}>Accept</button>
          </div>
        </div>
      )}
      <style jsx global>{`
        .cb { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 60; max-width: 560px; margin: 0 auto; display: flex; gap: 0.9rem; align-items: center; flex-wrap: wrap; justify-content: space-between; background: var(--lp-panel, #11141b); border: 1px solid var(--lp-line, #232a36); border-radius: 12px; padding: 0.85rem 1rem; box-shadow: 0 8px 30px rgba(0,0,0,0.45); color: var(--lp-ink, #edeff2); font-size: 0.82rem; line-height: 1.5; }
        .cb p { margin: 0; flex: 1 1 260px; color: var(--lp-mute, #8a93a3); }
        .cb a { color: var(--lp-brass-bright, #6d97ff); text-decoration: underline; }
        .cb__btns { display: flex; gap: 0.5rem; }
        .cb button { background: transparent; border: 1px solid var(--lp-line, #232a36); color: inherit; border-radius: 8px; padding: 0.45rem 0.9rem; cursor: pointer; font: inherit; }
        .cb button.cb__yes { background: #3772ff; border-color: #3772ff; color: #fff; }
      `}</style>
    </>
  );
}

export function CookieSettingsLink({ style }) {
  if (!GA_OK) return null;
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(EVENT))}
      style={{ background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit", color: "inherit", ...style }}
    >
      Cookie settings
    </button>
  );
}
