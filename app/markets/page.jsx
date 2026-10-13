import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { MarketsTerminal } from "@/components/site/MarketsTerminal";

export const metadata = { title: "Markets | CEXAID" };

export default function MarketsPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "1.75rem 1.25rem 2rem" }}>
        <MarketsTerminal />
      </main>
      <SiteFooter />
    </>
  );
}
