import SectionHeading from "../../components/SectionHeading";
import { orgStructure } from "../../data/content";
import { Landmark } from "lucide-react";

export default function StructurePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <SectionHeading
        eyebrow="National Structure"
        title="Organizational Hierarchy"
      />
      <p className="mx-auto -mt-4 mb-10 max-w-2xl text-center text-sm text-ink/65">
        The Association follows a structured national hierarchy to ensure effective
        coordination across India.
      </p>

      <ol className="relative space-y-6 border-l border-gold/30 pl-8">
        {orgStructure.map((tier, i) => (
          <li key={tier.tier} className="relative">
            <span className="absolute -left-[42px] flex h-7 w-7 items-center justify-center rounded-full bg-navy text-xs font-bold text-gold">
              {i + 1}
            </span>
            <div className="card-official rounded-lg p-5">
              <div className="flex items-center gap-2">
                <Landmark size={16} className="text-gold-dim" />
                <h3 className="font-serif text-lg font-bold text-navy">{tier.label}</h3>
              </div>
              <p className="mt-2 text-sm text-ink/65">{tier.description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-lg bg-navy/5 p-6 text-center text-sm text-ink/65">
        Office bearers at every tier are managed from the Admin Panel — photographs, contact
        details, and profiles can be added without any code changes.
      </div>
    </div>
  );
}
