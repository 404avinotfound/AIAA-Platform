import Link from "next/link";
import { Check } from "lucide-react";

export default function MembershipPlanCard({ plan, featured = false }) {
  return (
    <div
      className={`flex flex-col rounded-lg p-6 ${
        featured ? "bg-navy-gradient text-cream shadow-card" : "card-official"
      }`}
    >
      <p className={`eyebrow ${featured ? "text-gold-light" : "text-gold-dim"}`}>{plan.label}</p>
      <p className={`mt-2 font-serif text-3xl font-bold ${featured ? "text-cream" : "text-navy"}`}>
        ₹{plan.price.toLocaleString("en-IN")}
        <span className={`ml-1 text-sm font-normal ${featured ? "text-cream/70" : "text-ink/55"}`}>
          {plan.period}
        </span>
      </p>
      <p className={`mt-3 text-sm ${featured ? "text-cream/75" : "text-ink/65"}`}>{plan.description}</p>

      <ul className="mt-5 space-y-2 text-sm">
        {["Digital Membership ID Card", "Verified QR Code", "Membership Certificate (PDF)", "Pan-India Network Access"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check size={15} className="text-gold" /> <span className={featured ? "text-cream/85" : "text-ink/75"}>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/membership/apply?plan=${plan.value}`}
        className={`mt-6 rounded-full py-2.5 text-center text-sm font-semibold ${
          featured ? "btn-gold" : "border border-gold/50 text-gold-dim hover:bg-gold/10"
        }`}
      >
        Choose {plan.label}
      </Link>
    </div>
  );
}
