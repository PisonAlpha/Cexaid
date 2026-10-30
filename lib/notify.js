import nodemailer from "nodemailer";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Emails the CEXAID inbox (the same Zoho account the Services form uses) when something needs review.
// It never throws and never waits more than a few seconds, so a mail problem can never break a submission.
// Only short, non-sensitive details go in the email; full details stay in the admin dashboard.
export async function notifyAdmin(subject, rows = []) {
  try {
    const user = process.env.ZOHO_EMAIL;
    const pass = process.env.ZOHO_APP_PASSWORD;
    if (!user || !pass) return;
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: { user, pass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
    });
    const lines = rows.map(([k, v]) => `<p style="margin:4px 0"><strong>${esc(k)}:</strong> ${esc(v)}</p>`).join("");
    await Promise.race([
      transporter.sendMail({
        from: `"CEXAID Website" <${user}>`,
        to: user,
        subject: `[CEXAID] ${subject}`,
        html: `<div style="font-family:Arial,sans-serif;padding:16px"><h3 style="margin:0 0 12px">${esc(subject)}</h3>${lines}<p style="margin-top:16px"><a href="https://www.cexaid.com/launchpad/admin">Open the admin dashboard</a></p></div>`,
      }),
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]);
  } catch (err) {
    console.error("notifyAdmin failed:", err?.message || err);
  }
}
