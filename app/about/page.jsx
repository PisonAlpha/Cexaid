import { Send, Twitter, Mail } from "lucide-react";

export const metadata = {
  title: "Team & Contact | CEXAID",
};

const TEAM = [
  {
    name: "McConnell Lux",
    role: "Founder & CEO",
    initial: "M",
    description:
      "Responsible for overall strategy, partnerships, fundraising, and guiding CEXAID's long-term growth.",
    expertise: ["Blockchain strategy", "Business development", "Product leadership"],
  },
  {
    name: "Sophia Bennett",
    role: "Chief Technology Officer",
    initial: "S",
    description:
      "Leads technical development, security, and the engineering team responsible for platform innovation.",
    expertise: ["Blockchain development", "Smart contracts", "Cybersecurity"],
  },
  {
    name: "Daniel Carter",
    role: "Head of Product & Innovation",
    initial: "D",
    description:
      "Oversees product development and feature planning, ensuring CEXAID delivers practical solutions for users.",
    expertise: ["Product design", "UX", "Digital transformation"],
  },
  {
    name: "Emily Rodriguez",
    role: "Marketing & Community Director",
    initial: "E",
    description:
      "Manages marketing campaigns, community engagement, partnerships, and global brand awareness.",
    expertise: ["Community growth", "Brand strategy", "Crypto communications"],
  },
  {
    name: "Michael Laurent",
    role: "CFO & Strategy Advisor",
    initial: "M",
    description:
      "Handles financial strategy, private sale planning, investor relations, and long-term sustainability.",
    expertise: ["Token economics", "Investment strategy", "Risk management"],
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0d12] text-[#edeff2] px-6 py-16 md:px-16">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-bold uppercase tracking-widest text-[#c9a227]">Team</p>
        <h1 className="mt-3 font-serif text-4xl font-black md:text-5xl">The people behind CEXAID</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[#8a93a3]">
          The team building and operating the CEXAID platform and Launchpad.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border border-[#232a35] bg-[#12161d] p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-[#c9a227]/40 bg-[#171c25] font-serif text-xl font-semibold text-[#c9a227]">
                  {member.initial}
                </div>
                <div>
                  <p className="font-serif text-lg font-semibold text-[#edeff2]">{member.name}</p>
                  <p className="text-sm text-[#c9a227]">{member.role}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#8a93a3]">{member.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {member.expertise.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#232a35] px-3 py-1 text-xs text-[#8a93a3]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-[#232a35] pt-16">
          <p className="text-sm font-bold uppercase tracking-widest text-[#c9a227]">Contact</p>
          <h2 className="mt-3 font-serif text-3xl font-black md:text-4xl">Get in touch</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#8a93a3]">
            For listing support, investor inquiries, or anything else, reach
            us directly.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="https://t.me/Bridge4_2"
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#e8c468] transition hover:bg-[#c9a227] hover:text-[#0a0d12]"
              aria-label="Telegram"
            >
              <Send />
            </a>
            <a
              href="https://x.com/cexaidfunding"
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#e8c468] transition hover:bg-[#c9a227] hover:text-[#0a0d12]"
              aria-label="X (Twitter)"
            >
              <Twitter />
            </a>
            <a
              href="mailto:contact@cexaid.com"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a227]/30 bg-[#c9a227]/10 text-[#e8c468] transition hover:bg-[#c9a227] hover:text-[#0a0d12]"
              aria-label="Email"
            >
              <Mail />
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
