"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Rocket,
  Users,
  Handshake,
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
  BarChart3,
  Trophy,
} from "lucide-react";

const services = [
  {
    icon: Building2,
    title: "CEX Listing Services",
    desc: "Strategic listing preparation and exchange-facing positioning for crypto projects ready to expand into centralized markets.",
    points: ["Listing strategy", "Exchange readiness", "Documentation support", "Market positioning"],
  },
  {
    icon: Landmark,
    title: "VC & Investor Network",
    desc: "Connecting promising Web3 projects with investors, private backers, strategic partners, and capital networks.",
    points: ["VC introductions", "Pitch preparation", "Fundraising strategy", "Private sale support"],
  },
  {
    icon: Users,
    title: "Social Engagement Management",
    desc: "Professional community growth, Telegram moderation, X engagement, campaign planning, and reputation management.",
    points: ["Telegram moderation", "X management", "AMA coordination", "Community growth"],
  },
  {
    icon: Handshake,
    title: "Business Acquisition",
    desc: "Exploring acquisition opportunities across crypto startups, communities, Web3 brands, and blockchain businesses.",
    points: ["Project acquisition", "Brand restructuring", "Community revival", "Strategic scaling"],
  },
  {
    icon: Rocket,
    title: "Early-Stage Funding",
    desc: "Supporting early-stage crypto projects with strategic funding access, incubation support, and growth preparation.",
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
  "Community Support",
  "VC Access",
  "Exchange Listing",
  "Funding Pathway",
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
      headers: {
        "Content-Type": "application/json",
      },
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
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <section className="relative px-6 py-8 md:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.28),transparent_35%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_35%)]" />
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:60px_60px]" />

        <nav className="relative z-10 flex items-center justify-between">
          <div className="text-2xl font-black tracking-wide">
            CEX<span className="text-cyan-400">AID</span>
          </div>

          <div className="hidden gap-8 text-sm text-slate-300 md:flex">
            <a href="#about" className="hover:text-cyan-300">About</a>
            <a href="#services" className="hover:text-cyan-300">Services</a>
            <a href="#traction" className="hover:text-cyan-300">Traction</a>
            <a href="#contact" className="hover:text-cyan-300">Contact</a>
          </div>

          <a
            href="#contact"
            className="rounded-full border border-cyan-400/40 px-5 py-2 text-sm text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
          >
            Apply Now
          </a>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 py-24 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
              Trusted Crypto Growth • Listings • Capital Access • Community Scale
            </p>

            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              Powering Crypto Projects From Launch To Global Growth
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              CEXAID helps blockchain projects secure exchange listing support,
              connect with venture networks, strengthen community presence,
              access funding opportunities, and explore strategic acquisition paths.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#contact" className="rounded-full bg-cyan-400 px-6 py-3 font-bold text-black transition hover:bg-cyan-300">
                Submit Project
              </a>

              <a href="#services" className="rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:bg-white/10">
                Explore Services
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="glow rounded-3xl border border-cyan-400/20 bg-white/5 p-6 backdrop-blur">
            <div className="rounded-2xl bg-black/40 p-6">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-slate-400">CEXAID Growth Terminal</p>
                <ShieldCheck className="text-cyan-400" />
              </div>

              {["Exchange Readiness", "Investor Access", "Community Growth", "Funding Pipeline"].map((item, index) => (
                <div key={item} className="mb-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span>{item}</span>
                    <span className="text-cyan-300">{82 + index * 4}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${82 + index * 4}%` }}
                      transition={{ duration: 1.2, delay: index * 0.15 }}
                      className="h-2 rounded-full bg-cyan-400"
                    />
                  </div>
                </div>
              ))}

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                  <Network className="mb-3 text-cyan-400" />
                  <p className="text-sm text-slate-300">Built for listings, investor access, funding, and business expansion.</p>
                </div>

                <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 p-4">
                  <Globe2 className="mb-3 text-blue-300" />
                  <p className="text-sm text-slate-300">Connecting founders with global Web3 growth opportunities.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="traction" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
            Market Presence
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-5xl">
            Built For Projects Already Moving Toward Scale
          </h2>

          <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-300">
            CEXAID is structured to support projects across listing readiness,
            capital access, growth execution, strategic partnerships, and expansion.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-5">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -8 }}
                className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur hover:border-cyan-400/50"
              >
                <p className="text-4xl font-black text-cyan-400 md:text-5xl">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
            About CEXAID
          </p>

          <h2 className="mt-4 text-3xl font-black md:text-5xl">
            A Web3 Growth Ecosystem For Serious Crypto Projects
          </h2>

          <p className="mt-6 text-lg leading-8 text-slate-300">
            CEXAID is a crypto business development company built to help
            blockchain projects move from early-stage visibility to stronger
            market expansion. We bridge the gap between founders, centralized
            exchanges, investors, communities, funding partners, and acquisition
            opportunities.
          </p>
        </div>
      </section>

      <section id="services" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
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
                  className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur hover:border-cyan-400/50"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10">
                    <Icon className="text-cyan-400" />
                  </div>

                  <h3 className="text-xl font-bold">{service.title}</h3>

                  <p className="mt-3 leading-7 text-slate-300">{service.desc}</p>

                  <ul className="mt-5 space-y-2 text-sm text-slate-300">
                    {service.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <ArrowRight size={15} className="text-cyan-400" />
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

      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <BriefcaseBusiness className="mb-4 text-cyan-400" size={42} />

              <h2 className="text-3xl font-black md:text-5xl">
                Why Projects Work With CEXAID
              </h2>

              <p className="mt-5 leading-8 text-slate-300">
                Crypto founders need more than visibility. They need access,
                structure, credibility, investor readiness, community strength,
                and a clear route toward growth.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Strong crypto network",
                "Investor access",
                "Exchange connections",
                "Community management",
                "Funding opportunities",
                "Acquisition support",
                "Growth strategy",
                "Long-term scaling",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-black/30 p-4 text-slate-200">
                  <CheckCircle2 className="mb-2 text-cyan-400" size={20} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
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
                className="rounded-2xl border border-cyan-400/20 bg-white/5 p-5"
              >
                <p className="mb-3 text-2xl font-black text-cyan-400">{index + 1}</p>
                <p className="text-sm text-slate-200">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-6 py-20 md:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
              Apply For Growth
            </p>

            <h2 className="mt-4 text-3xl font-black md:text-5xl">
              Get Your Project Listed, Funded, Managed, Or Scaled
            </h2>

            <p className="mt-5 leading-8 text-slate-300">
              Submit your project details and the CEXAID team will review your
              request for listing support, investor access, funding, acquisition,
              or social growth services.
            </p>

            <div className="mt-8 flex items-center gap-5">
              <a
                href="https://t.me/Bridge4_2"
                target="_blank"
                rel="noreferrer"
                aria-label="Contact CEXAID on Telegram"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
              >
                <Send />
              </a>

              <a
                href="https://x.com/cexaidfunding"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit CEXAID on X"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
              >
                <Twitter />
              </a>

              <a
                href="mailto:contact@cexaid.com"
                aria-label="Email CEXAID"
                className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 transition hover:bg-cyan-400 hover:text-black"
              >
                <Mail />
              </a>
            </div>
          </div>

              <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-cyan-400/20 bg-white/5 p-6 backdrop-blur"
      >
          

          

            {["Full Name", "Project Name", "Email Address", "Telegram Username", "Website"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field}
                required
                className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            ))}

            <select
              name="Service Needed"
              required
              defaultValue=""
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >
              <option value="" disabled>
                Service Needed
              </option>
              <option>CEX Listing</option>
              <option>VC Connection</option>
              <option>Social Management</option>
              <option>Project Acquisition</option>
              <option>Early-Stage Funding</option>
            </select>

            <textarea
              name="Project Description"
              placeholder="Project Description"
              rows="5"
              required
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              
              className="w-full rounded-full bg-cyan-400 px-6 py-3 font-bold text-black transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Send Application
            </button>
          </form>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-10 text-center text-slate-400 md:px-16">
        <div className="text-2xl font-black text-white">
          CEX<span className="text-cyan-400">AID</span>
        </div>

        <p className="mt-3">
          CEXAID — Connecting Crypto Projects to Growth Opportunities
        </p>
      </footer>
    </main>
  );
}