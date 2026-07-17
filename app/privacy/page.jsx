export const metadata = {
  title: "Privacy Policy | CEXAID",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0d12] text-[#edeff2] px-6 py-16 md:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 rounded-2xl border border-[#e5484d]/40 bg-[#e5484d]/10 p-5 text-sm leading-6 text-[#edeff2]">
          <strong className="text-[#e5484d]">This is a draft template, not legal advice.</strong>{" "}
          Data protection law varies significantly by region (e.g. GDPR,
          CCPA). Have qualified legal counsel review this before it governs
          real user data.
        </div>

        <p className="text-sm font-mono uppercase tracking-widest text-[#8a93a3]">
          Last updated: July 2026
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#edeff2]">Privacy Policy</h1>
        <p className="mt-4 leading-7 text-[#8a93a3]">
          This Privacy Policy describes how CEXAID collects, uses, and
          protects information in connection with the CEXAID platform and
          Launchpad (the "Platform").
        </p>

        <Section title="1. Information We Collect">
          <ul>
            <li><strong>Wallet data:</strong> your public wallet address and on-chain transaction activity related to the Platform.</li>
            <li><strong>KYC information:</strong> full name, email, country, phone number (if provided), business name, business registration number, and country of business registration.</li>
            <li><strong>Investor application information:</strong> name, email, organization, notes you provide, and your X (Twitter) or LinkedIn handle.</li>
            <li><strong>Usage data:</strong> pages visited, actions taken on the Platform, and similar technical/usage information.</li>
            <li><strong>Account credentials:</strong> for administrative accounts, an email and password managed through our authentication provider.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Information">
          <ul>
            <li>To verify Founder and Investor identities and eligibility;</li>
            <li>To operate, maintain, and improve the Platform;</li>
            <li>To communicate with you about your application, listing, or contributions;</li>
            <li>To detect and prevent fraud, abuse, and violations of our Terms of Service;</li>
            <li>To comply with legal and regulatory obligations.</li>
          </ul>
        </Section>

        <Section title="3. On-Chain Data">
          <p>
            Blockchain transactions (including contribution amounts and
            wallet addresses) are recorded on a public, immutable ledger by
            their nature. This information is publicly visible independent
            of anything CEXAID does, and cannot be deleted or altered once
            confirmed on-chain.
          </p>
        </Section>

        <Section title="4. Third-Party Processors">
          <p>
            We use Supabase for database hosting and authentication. Data
            you submit is stored with this provider under its own security
            and data-handling practices. We do not sell your personal
            information to third parties.
          </p>
        </Section>

        <Section title="5. Data Retention">
          <p>
            We retain KYC and application information for as long as
            necessary to comply with our legal obligations, resolve
            disputes, and enforce our agreements, after which it is deleted
            or anonymized where feasible.
          </p>
        </Section>

        <Section title="6. Your Rights">
          <p>
            Depending on your jurisdiction, you may have rights to access,
            correct, or request deletion of your personal information
            (excluding on-chain data, which cannot be altered). Contact us
            using the details below to make a request.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We apply reasonable technical and organizational measures to
            protect information, including restricting KYC and application
            data to authorized administrative access only. No method of
            storage or transmission is completely secure, and we cannot
            guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Material
            changes will be reflected by updating the "Last updated" date
            above.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            For privacy-related questions or requests, contact{" "}
            <a href="mailto:contact@cexaid.com" className="text-[#c9a227]">contact@cexaid.com</a>.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-semibold text-[#c9a227]">{title}</h2>
      <div className="mt-3 space-y-3 leading-7 text-[#8a93a3] [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_strong]:text-[#edeff2]">
        {children}
      </div>
    </section>
  );
}
