"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  Rocket,
  Users,
  Landmark,
  Mail,
  Send,
  Twitter,
  ShieldCheck,
  ArrowRight,
  Globe2,
  Network,
  BriefcaseBusiness,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "CEX Listing Services",
    desc: "Listing preparation and exchange-facing positioning for projects ready to move into centralized markets.",
    points: ["Listing strategy", "Exchange readiness", "Documentation support", "Market positioning"],
  },
  {
    icon: Landmark,
    title: "VC & Investor Network",
    desc: "Introductions to investors, private backers, and strategic partners across our capital network.",
    points: ["VC introductions", "Pitch preparation", "Fundraising strategy", "Private sale support"],
  },
  {
    icon: TrendingUp,
    title: "Token Launchpad",
    desc: "Run your Private Sale directly on CEXAID — KYC-verified founders, investor-gated rounds, and a published vesting schedule.",
    points: ["Founder KYC required", "CEXAID-reviewed before going live", "Investor-gated, platform-wide approval", "Published vesting schedule"],
  },
  {
    icon: Users,
    title: "Social Engagement Management",
    desc: "Community growth, Telegram moderation, X engagement, campaign planning, and reputation management.",
    points: ["Telegram moderation", "X management", "AMA coordination", "Community growth"],
  },
  {
    icon: Rocket,
    title: "Early-Stage Funding",
    desc: "Funding access, incubation support, and growth preparation for early-stage projects.",
    points: ["Seed support", "Incubation", "Growth funding", "Expansion advisory"],
  },
];

const stats = [
  { label: "Projects Reviewed", value: 120, suffix: "+" },
  { label: "Exchange Connections", value: 18, suffix: "+" },
  { label: "Investor Network Access", value: 60, suffix: "+" },
  { label: "Community Reach", value: 85, suffix: "K+" },
  { label: "Strategic Partnerships", value: 18, suffix: "+" },
];

const workflow = [
  "Project Review",
  "Growth Strategy",
  "Launchpad Listing",
  "Community Support",
  "VC Access",
  "Exchange Listing",
  "Market Expansion",
];

function Counter({ value, suffix }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1400;
    const increment = value / (duration / 20);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 20);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = {
      fullName: formData.get("Full Name"),
      projectName: formData.get("Project Name"),
      email: formData.get("Email Address"),
      telegram: formData.get("Telegram Username"),
      website: formData.get("Website"),
      service: formData.get("Service Needed"),
      message: formData.get("Project Description"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Application sent successfully!");
        e.target.reset();
      } else {
        alert("Please complete all required fields.");
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0d12] text-[#edeff2]">
      <section className="relative px-6 py-8 md:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,162,39,0.22),transparent_35%),radial-gradient(circle_at_top_left,rgba(61,220,132,0.14),transparent_35%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:60px_60px]" />

        <nav className="relative z-10 flex items-center justify-between">
          <div className="text-2xl font-black tracking-wide">
            CEX<span className="text-[#c9a227]">AID</span>
          </div>

          <div className="hidden gap-8 text-sm text-[#8a93a3] md:flex">
            <a href="#about" className="hover:text-[#e8c468]">About</a>
            <a href="#services" className="hover:text-[#e8c468]">Services</a>
            <a href="#launchpad" className="hover:text-[#e8c468]">Launchpad</a>
            <a href="#traction" className="hover:text-[#e8c468]">Traction</a>
            <a href="#contact" className="hover:text-[#e8c468]">Contact</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/launchpad"
              className="rounded-full bg-[#c9a227] px-5 py-2 text-sm font-bold text-[#0a0d12] transition hover:bg-[#e8c468]"
            >
              Launchpad
            </Link>
            <a
              href="#contact"
              className="rounded-full border border-[#c9a227]/40 px-5 py-2 text-sm text-[#e8c468] transition hover:bg-[#c9a227] hover:text-[#0a0d12]"
            >
              Apply Now
            </a>
          </div>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 py-24 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-4 inline-flex rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 px-4 py-2 text-sm text-[#e8c468]">
              Exchange Listings • Capital Access • Launchpad • Community Growth
            </p>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Business Development Infrastructure for Serious Crypto Projects
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#8a93a3]">
              CEXAID prepares projects for exchange listings, connects
              founders with our investor network, runs KYC-verified Private
              Sale rounds through our Launchpad, and manages community
              growth from launch through expansion.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/launchpad" className="rounded-full bg-[#c9a227] px-6 py-3 font-bold text-[#0a0d12] transition hover:bg-[#e8c468]">
                Explore Launchpad
              </Link>

              <a href="#contact" className="rounded-full border border-[#232a35] px-6 py-3 font-bold text-[#edeff2] transition hover:bg-[#171c25]">
                Submit Your Project
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="glow rounded-3xl border border-[#c9a227]/20 bg-[#12161d] p-6 backdrop-blur">
            <div className="rounded-2xl bg-[#171c25] p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-[#8a93a3]">CEXAID Growth Dashboard</p>
                <ShieldCheck className="text-[#c9a227]" />
              </div>

              {["Exchange Readiness", "Investor Access", "Community Growth", "Launchpad Activity"].map((item, index) => (
                <div key={item} className="mb-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{item}</span>
                    <span className="text-[#e8c468]">{82 + index * 4}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#171c25]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${82 + index * 4}%` }}
                      transition={{ duration: 1.2, delay: index * 0.15 }}
                      className="h-2 rounded-full bg-[#c9a227]"
                    />
                  </div>
                </div>
              ))}

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[#c9a227]/20 bg-[#c9a227]/10 p-4">
                  <Network className="mb-3 text-[#c9a227]" />
                  <p className="text-sm text-[#8a93a3]">Listings, investor access, capital raising, and community management under one roof.</p>
                </div>

                <div className="rounded-2xl border border-[#3ddc84]/20 bg-[#3ddc84]/10 p-4">
                  <Globe2 className="mb-3 text-[#3ddc84]" />
                  <p className="text-sm text-[#8a93a3]">A structured path from early-stage project to exchange-ready, funded, and community-backed.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="traction" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#c9a227]">
            Market Presence
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-5xl">
            A Track Record Built on Delivered Outcomes
          </h2>

          <p className="mx-auto mt-5 max-w-3xl leading-8 text-[#8a93a3]">
            CEXAID supports projects across listing readiness, capital
            access, Launchpad execution, and long-term growth.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -8 }}
                className="rounded-3xl border border-[#232a35] bg-[#12161d] p-8 text-center backdrop-blur hover:border-[#c9a227]/50"
              >
                <p className="text-4xl font-black text-[#c9a227] md:text-5xl">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-4 text-sm leading-6 text-[#8a93a3]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#c9a227]">
            About CEXAID
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-5xl">
            Business Development for Crypto Projects, End to End
          </h2>

          <p className="mt-6 text-lg leading-8 text-[#8a93a3]">
            CEXAID helps blockchain projects move from early-stage visibility
            to market expansion. We bridge the gap between founders,
            centralized exchanges, investors, communities, and funding
            partners — and run the Launchpad where KYC-verified Private
            Sale rounds actually happen.
          </p>
        </div>
      </section>

      <section id="services" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#c9a227]">
              Core Services
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              Everything A Crypto Project Needs To Scale
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <motion.div
                  key={service.title}
                  whileHover={{ y: -8 }}
                  className="rounded-3xl border border-[#232a35] bg-[#12161d] p-6 backdrop-blur hover:border-[#c9a227]/50"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#c9a227]/10">
                    <Icon className="text-[#c9a227]" />
                  </div>

                  <h3 className="text-xl font-bold">{service.title}</h3>

                  <p className="mt-3 leading-7 text-[#8a93a3]">{service.desc}</p>

                  <ul className="mt-5 space-y-2 text-sm text-[#8a93a3]">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <ArrowRight size={15} className="text-[#c9a227]" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="launchpad" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-[#c9a227]">
              CEXAID Launchpad
            </p>
            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              Private Sale, Done Properly.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl leading-8 text-[#8a93a3]">
              Every project on the Launchpad runs a Private Sale round —
              KYC-verified founders, CEXAID-reviewed terms, and access
              limited to platform-approved investors.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Founder KYC", desc: "Every founder is verified before they can list anything." },
              { title: "CEXAID Reviewed", desc: "Terms, allocation, and vesting checked before going public." },
              { title: "Investor-Gated", desc: "Only platform-approved investors can contribute." },
              { title: "Published Vesting", desc: "Every round's unlock schedule is visible before you commit." },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-[#232a35] bg-[#12161d] p-6 backdrop-blur hover:border-[#c9a227]/50"
              >
                <h3 className="text-lg font-bold text-[#e8c468]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#8a93a3]">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/launchpad/apply-private-sale" className="rounded-full bg-[#c9a227] px-6 py-3 font-bold text-[#0a0d12] transition hover:bg-[#e8c468]">
              Apply for Private Sale
            </Link>
            <Link href="/launchpad/apply-investor" className="rounded-full border border-[#232a35] px-6 py-3 font-bold text-[#edeff2] transition hover:bg-[#171c25]">
              Apply as an Investor
            </Link>
            <a href="#contact" className="text-sm text-[#8a93a3] hover:text-[#e8c468]">
              Need marketing or listing support too? Talk to our team →
            </a>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#c9a227]/20 bg-[#c9a227]/10 p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <BriefcaseBusiness className="mb-4 text-[#c9a227]" size={42} />

              <h2 className="text-3xl font-black md:text-5xl">
                Why Projects Work With CEXAID
              </h2>

              <p className="mt-5 leading-8 text-[#8a93a3]">
                Crypto founders need more than visibility. They need access,
                structure, credibility, investor readiness, community
                strength, and a clear path to raise capital.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Strong crypto network",
                "Investor access",
                "Exchange connections",
                "Launchpad infrastructure",
                "Community management",
                "Funding opportunities",
                "Growth strategy",
                "Long-term scaling",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-[#232a35] bg-[#171c25] p-4 text-[#edeff2]">
                  <CheckCircle2 className="mb-2 text-[#c9a227]" size={20} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-[#c9a227]">
            Execution Workflow
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-5xl">
            From Project Review To Market Expansion
          </h2>

          <div className="mt-12 grid gap-4 md:grid-cols-7">
            {workflow.map((step, index) => (
              <motion.div
                key={step}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-[#c9a227]/20 bg-[#12161d] p-5"
              >
                <p className="mb-3 text-2xl font-black text-[#c9a227]">{index + 1}</p>
                <p className="text-sm text-[#edeff2]">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-6 py-20 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#c9a227]">
              Apply For Growth
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              Get Listed, Funded, Managed, Or Launched
            </h2>

            <p className="mt-5 leading-8 text-[#8a93a3]">
              Submit your project and our team will follow up on listing
              support, investor access, Launchpad applications, or community
              growth services.
            </p>

            <div className="mt-8 flex items-center gap-5">
              <a
                href="https://t.me/Bridge4_2"
                target="_blank"
                rel="noreferrer"
                aria-label="Contact CEXAID on Telegram"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#e8c468] transition hover:bg-[#c9a227] hover:text-[#0a0d12]"
              >
                <Send />
              </a>

              <a
                href="https://x.com/cexaidfunding"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit CEXAID on X"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#e8c468] transition hover:bg-[#c9a227] hover:text-[#0a0d12]"
              >
                <Twitter />
              </a>

              <a
                href="mailto:contact@cexaid.com"
                aria-label="Email CEXAID"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#e8c468] transition hover:bg-[#c9a227] hover:text-[#0a0d12]"
              >
                <Mail />
              </a>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-[#c9a227]/20 bg-[#12161d] p-6 backdrop-blur"
          >
            {["Full Name", "Project Name", "Email Address", "Telegram Username", "Website"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field}
                required
                className="mb-4 w-full rounded-xl border border-[#232a35] bg-[#171c25] px-4 py-3 text-[#edeff2] outline-none focus:border-[#c9a227]"
              />
            ))}

            <select
              name="Service Needed"
              required
              defaultValue=""
              className="mb-4 w-full rounded-xl border border-[#232a35] bg-[#171c25] px-4 py-3 text-[#edeff2] outline-none focus:border-[#c9a227]"
            >
              <option value="" disabled>
                Service Needed
              </option>
              <option>CEX Listing</option>
              <option>VC Connection</option>
              <option>Private Sale Application (Launchpad)</option>
              <option>Social Management</option>
              <option>Early-Stage Funding</option>
            </select>

            <textarea
              name="Project Description"
              placeholder="Project Description"
              rows="5"
              required
              className="mb-4 w-full rounded-xl border border-[#232a35] bg-[#171c25] px-4 py-3 text-[#edeff2] outline-none focus:border-[#c9a227]"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#c9a227] px-6 py-3 font-bold text-[#0a0d12] transition hover:bg-[#e8c468] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send Application"}
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-[#232a35] px-6 py-10 text-center text-[#8a93a3] md:px-16">
        <div className="text-2xl font-black text-[#edeff2]">
          CEX<span className="text-[#c9a227]">AID</span>
        </div>

        <p className="mt-3">
          CEXAID — Business Development and Launchpad Infrastructure for Crypto Projects
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/launchpad" className="hover:text-[#e8c468]">Launchpad</Link>
          <Link href="/about" className="hover:text-[#e8c468]">Team &amp; Contact</Link>
          <Link href="/terms" className="hover:text-[#e8c468]">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-[#e8c468]">Privacy Policy</Link>
        </div>
      </footer>
    </main>
  );
}
