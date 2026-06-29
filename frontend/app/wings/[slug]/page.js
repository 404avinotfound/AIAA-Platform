import { notFound } from "next/navigation";
import SectionHeading from "../../../components/SectionHeading";
import { getWingBySlug, wings } from "../../../data/wings";
import { CheckCircle2 } from "lucide-react";

export function generateStaticParams() {
  return wings.map((w) => ({ slug: w.slug }));
}

async function fetchWing(slug) {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const res = await fetch(`${apiBase}/wings/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.wing;
  } catch {
    return null;
  }
}

export default async function WingDetailPage({ params }) {
  const { slug } = params;
  const backendWing = await fetchWing(slug);
  const staticWing = getWingBySlug(slug);
  const wing = backendWing || staticWing;

  if (!wing) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="Wing" title={wing.name} align="left" />

      <div className="card-official rounded-lg p-6">
        <h3 className="font-serif text-lg font-bold text-navy">Purpose</h3>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">{wing.purpose}</p>
      </div>

      {wing.rolesAndFunctions?.length > 0 && (
        <div className="card-official mt-6 rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-navy">Roles & Functions</h3>
          <ul className="mt-3 space-y-2 text-sm text-ink/70">
            {wing.rolesAndFunctions.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-gold-dim" /> {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {wing.committeeMembers?.length > 0 && (
        <div className="mt-10">
          <h3 className="mb-4 font-serif text-lg font-bold text-navy">Committee Members</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {wing.committeeMembers.map((m) => (
              <div key={m.name} className="card-official rounded-lg p-4 text-center text-sm">
                <p className="font-semibold text-navy">{m.name}</p>
                <p className="text-ink/60">{m.designation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 rounded-lg bg-navy/5 p-5 text-center text-sm text-ink/60">
        Members can apply to this wing through the membership form's "Preferred Wing" field.
      </div>
    </div>
  );
}
