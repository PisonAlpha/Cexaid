import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import Link from "next/link";
import { Send, Twitter, Mail } from "lucide-react";

export const metadata = {
  title: "Team & Contact | CEXAID",
};

const TEAM = [
  {
    name: "Murray",
    role: "Developer & CTO",
    photo: "/team/murray.webp",
    xHandle: "CupstidMurry",
    xUrl: "https://x.com/CupstidMurry",
  },
  {
    name: "Leon Hartwell",
    role: "Co-founder",
    photo: "/team/leon.webp",
    xHandle: "leonfinances",
    xUrl: "https://x.com/leonfinances",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#090b10] text-[#edeff2] px-6 py-16 md:px-16">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="mb-6 inline-block text-sm text-[#8a93a3] hover:text-[#6d97ff]">← Back to Home</Link>
        <p className="text-sm font-bold uppercase tracking-widest text-[#3772ff]">Team</p>
        <h1 className="mt-3 font-serif text-4xl font-black md:text-5xl">The people behind CEXAID</h1>
        <p className="mt-4 max-w-2xl leading-7 text-[#8a93a3]">
          The team building and operating the CEXAID platform and Launchpad.
        </p>

        <div className="mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="flex flex-col items-center rounded-2xl border border-[#212835] bg-[#11151c] p-8 text-center"
            >
              <img
                src={member.photo}
                alt={member.name}
                width={112}
                height={112}
                className="h-28 w-28 rounded-full border border-[#3772ff]/40 object-cover"
              />
              <p className="mt-5 font-serif text-xl font-semibold text-[#edeff2]">{member.name}</p>
              <p className="mt-1 text-sm text-[#3772ff]">{member.role}</p>
              <a
                href={member.xUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#3772ff]/30 bg-[#3772ff]/10 px-4 py-2 text-sm text-[#6d97ff] transition hover:bg-[#3772ff] hover:text-white"
              >
                <Twitter size={16} /> @{member.xHandle}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-[#212835] pt-16">
          <p className="text-sm font-bold uppercase tracking-widest text-[#3772ff]">Contact</p>
          <h2 className="mt-3 font-serif text-3xl font-black md:text-4xl">Get in touch</h2>
          <p className="mt-4 max-w-2xl leading-7 text-[#8a93a3]">
            For listing support, investor inquiries, or anything else, reach
            us directly.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="https://t.me/cexaidfunding"
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#3772ff]/30 bg-[#3772ff]/10 text-[#6d97ff] transition hover:bg-[#3772ff] hover:text-white"
              aria-label="Telegram"
            >
              <Send />
            </a>
            <a
              href="https://x.com/cexaidfunding"
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#3772ff]/30 bg-[#3772ff]/10 text-[#6d97ff] transition hover:bg-[#3772ff] hover:text-white"
              aria-label="X (Twitter)"
            >
              <Twitter />
            </a>
            <a
              href="mailto:contact@cexaid.com"
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#3772ff]/30 bg-[#3772ff]/10 text-[#6d97ff] transition hover:bg-[#3772ff] hover:text-white"
              aria-label="Email"
            >
              <Mail />
            </a>
          </div>
          <p className="mt-5 text-sm text-[#8a93a3]">
            <a href="mailto:contact@cexaid.com" className="text-[#6d97ff] hover:underline">contact@cexaid.com</a>
            {" · "}
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@cexaid.com&su=CEXAID%20enquiry"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#6d97ff] hover:underline"
            >
              Open in Gmail
            </a>
          </p>
        </div>
      </div>
    </main>
      <SiteFooter />
    </>
  );
}
