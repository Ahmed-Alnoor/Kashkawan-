import { Reveal } from "@/components/ui/Motion";

/**
 * Shared masthead for the inner pages. Sits under the fixed header, so the
 * top padding accounts for --header-h rather than a magic number.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-heritage-900 text-paper">
      <div className="pattern-arch-dark absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-toast/45 to-transparent"
        aria-hidden
      />

      <div
        className="shell relative pb-12 lg:pb-16"
        style={{ paddingTop: "calc(var(--header-h) + 3rem)" }}
      >
        <Reveal>
          <p className="eyebrow text-toast">{eyebrow}</p>
          <h1 className="h-section mt-3 max-w-3xl text-paper">{title}</h1>
          {lead && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/72">{lead}</p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
