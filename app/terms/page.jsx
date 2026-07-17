export const metadata = {
  title: "Terms of Service | CEXAID",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0d12] text-[#edeff2] px-6 py-16 md:px-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 rounded-2xl border border-[#e5484d]/40 bg-[#e5484d]/10 p-5 text-sm leading-6 text-[#edeff2]">
          <strong className="text-[#e5484d]">This is a draft template, not legal advice.</strong>{" "}
          It has not been reviewed by a lawyer. Have qualified legal counsel in
          your operating jurisdiction review and customize this before it
          governs real users or real funds.
        </div>

        <p className="text-sm font-mono uppercase tracking-widest text-[#8a93a3]">
          Last updated: July 2026
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#edeff2]">Terms of Service</h1>
        <p className="mt-4 leading-7 text-[#8a93a3]">
          These Terms of Service ("Terms") govern access to and use of the
          CEXAID platform, including the CEXAID Launchpad (together, the
          "Platform"), operated by CEXAID ("CEXAID," "we," "us," or "our").
          By creating an account, submitting a KYC application, applying as
          an investor, listing a Private Sale, or contributing funds through
          the Platform, you ("you" or "User") agree to be bound by these
          Terms.
        </p>

        <Section title="1. Definitions">
          <p><strong>"Founder"</strong> means a User who submits a project for a Private Sale listing.</p>
          <p><strong>"Investor"</strong> means a User approved by CEXAID to contribute to Private Sale rounds.</p>
          <p><strong>"Private Sale"</strong> means a capital-raising round listed on the Platform, subject to CEXAID's review and approval.</p>
          <p><strong>"Contribution"</strong> means funds sent by an Investor toward a Private Sale round.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>To use the Platform, you represent and warrant that you:</p>
          <ul>
            <li>are of legal age in your jurisdiction of residence;</li>
            <li>are not a resident of, or located in, any jurisdiction where use of the Platform or participation in token sales is prohibited by law;</li>
            <li>are not listed on any sanctions list maintained by the UN, US, EU, UK, or any other applicable governmental authority;</li>
            <li>have provided accurate, current, and complete information in any KYC or application submission; and</li>
            <li>have the legal authority to enter into these Terms, including on behalf of any entity you represent.</li>
          </ul>
        </Section>

        <Section title="3. Nature of the Platform">
          <p>
            CEXAID operates a marketplace connecting Founders seeking to
            raise capital with Investors seeking early-stage opportunities.
            CEXAID is <strong>not</strong> a broker-dealer, investment
            adviser, bank, custodian, or money transmitter, and does not
            provide investment, legal, or tax advice. CEXAID's review and
            approval of a Private Sale listing is a check against the
            Platform's own listing criteria and does not constitute an
            endorsement, guarantee, or regulatory approval of any project,
            token, or offering.
          </p>
        </Section>

        <Section title="4. Terms for Investors">
          <ul>
            <li>
              <strong>High risk.</strong> Private, early-stage investments
              are speculative and illiquid. You may lose your entire
              Contribution. Past performance of any project or token is not
              indicative of future results.
            </li>
            <li>
              <strong>No guarantee of returns or liquidity.</strong> CEXAID
              does not guarantee that any token will list on any exchange,
              achieve any particular valuation, or that vesting/claim
              schedules will be honored by a Founder.
            </li>
            <li>
              <strong>Self-certification.</strong> By applying as an
              Investor, you represent that you meet any applicable investor
              qualification standard in your jurisdiction (e.g. accredited,
              sophisticated, or professional investor status, where
              required) and that your participation complies with local law.
            </li>
            <li>
              <strong>Platform-wide approval.</strong> Investor approval is
              granted at CEXAID's sole discretion, and may be suspended or
              revoked for any reason, including suspected misuse or
              inaccurate application information.
            </li>
            <li>
              <strong>No fiduciary duty.</strong> CEXAID does not act as
              your agent, fiduciary, or investment adviser.
            </li>
          </ul>
        </Section>

        <Section title="5. Terms for Founders">
          <ul>
            <li>
              <strong>Verification required.</strong> You must complete
              CEXAID's KYC process and receive approval before listing any
              Private Sale round. You must keep submitted information
              accurate and update it if it changes.
            </li>
            <li>
              <strong>Your own compliance responsibility.</strong> You are
              solely responsible for ensuring your token sale complies with
              securities, tax, and other laws in every jurisdiction relevant
              to your project and your contributors. CEXAID's review process
              is not a substitute for your own legal counsel and does not
              constitute legal or regulatory approval.
            </li>
            <li>
              <strong>Accuracy of listing information.</strong> All project
              details, tokenomics, vesting schedules, and figures you submit
              must be accurate and not misleading. Misrepresentation is
              grounds for immediate removal and may be reported to relevant
              authorities.
            </li>
            <li>
              <strong>Fund release is at CEXAID's discretion.</strong> Raised
              funds are released to you only after your round's end date,
              and only at CEXAID's decision - CEXAID may instead direct a
              refund to Investors if you have not complied with these Terms
              or the terms you represented to Investors. See Section 6.
            </li>
            <li>
              <strong>Right to reject or remove.</strong> CEXAID may decline,
              suspend, or remove any listing at its sole discretion, at any
              stage, including after a round has started.
            </li>
          </ul>
        </Section>

        <Section title="6. Funds Handling">
          <p>
            Contributions are currently made on-chain, in USDT, and are
            verified against the BNB Smart Chain public ledger before being
            recorded. Depending on the round, a minimum raise target may
            apply; if a round with a minimum target does not meet it by its
            end date, Investors are entitled to a refund of their
            Contribution. Where CEXAID operates an escrow mechanism for a
            given round, the specific mechanics (including any smart
            contract address) will be disclosed on that round's listing
            page. CEXAID reserves the right to withhold release of funds to
            a Founder, or to direct funds be refunded to Investors instead,
            where CEXAID reasonably believes the Founder has not complied
            with these Terms or representations made to Investors.
          </p>
        </Section>

        <Section title="7. Prohibited Conduct">
          <p>You agree not to:</p>
          <ul>
            <li>provide false or misleading information in any KYC, investor, or listing submission;</li>
            <li>attempt to circumvent investor approval requirements, including by using another person's approved status;</li>
            <li>use the Platform for money laundering, terrorist financing, or any other illegal purpose;</li>
            <li>manipulate, or attempt to manipulate, any Private Sale round or its reported figures;</li>
            <li>interfere with or disrupt the Platform's operation, including through unauthorized access attempts.</li>
          </ul>
        </Section>

        <Section title="8. Fees">
          <p>
            Current fees (if any) for listing or contributing are disclosed
            at the relevant point in the Platform's interface at the time of
            the transaction. CEXAID may change its fee structure at any
            time, with changes applying prospectively.
          </p>
        </Section>

        <Section title="9. Intellectual Property">
          <p>
            The Platform, including its design, branding, and underlying
            software, is owned by CEXAID or its licensors. Nothing in these
            Terms grants you rights to CEXAID's intellectual property except
            the limited right to use the Platform as intended.
          </p>
        </Section>

        <Section title="10. Disclaimers">
          <p>
            The Platform is provided "as is" and "as available," without
            warranties of any kind, express or implied, including
            warranties of merchantability, fitness for a particular purpose,
            or non-infringement. CEXAID does not warrant that the Platform
            will be uninterrupted, secure, or error-free.
          </p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, CEXAID and its officers,
            employees, and agents will not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any
            loss of funds, profits, or data, arising from your use of the
            Platform, even if advised of the possibility of such damages.
          </p>
        </Section>

        <Section title="12. Indemnification">
          <p>
            You agree to indemnify and hold CEXAID harmless from any claim,
            loss, or demand, including reasonable legal fees, arising from
            your breach of these Terms or your violation of any law or
            third-party right.
          </p>
        </Section>

        <Section title="13. Termination">
          <p>
            CEXAID may suspend or terminate your access to the Platform at
            any time, with or without notice, for conduct CEXAID believes
            violates these Terms or is otherwise harmful to other Users or
            the Platform.
          </p>
        </Section>

        <Section title="14. Governing Law & Disputes">
          <p>
            <em>[Governing law jurisdiction to be specified here by your
            legal counsel.]</em> Any dispute arising from these Terms will be
            resolved as set out by your counsel's recommended mechanism
            (e.g. arbitration, courts of a specified jurisdiction).
          </p>
        </Section>

        <Section title="15. Changes to These Terms">
          <p>
            CEXAID may update these Terms from time to time. Continued use
            of the Platform after changes take effect constitutes acceptance
            of the updated Terms.
          </p>
        </Section>

        <Section title="16. Contact">
          <p>
            Questions about these Terms can be sent to{" "}
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
