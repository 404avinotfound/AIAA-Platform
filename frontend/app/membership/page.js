import SectionHeading from "../../components/SectionHeading";
import MembershipPlanCard from "../../components/MembershipPlanCard";
import { membershipPlans, membershipTypes } from "../../data/content";
import { CheckCircle2 } from "lucide-react";

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading eyebrow="Membership" title="Choose Your Membership Plan" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {membershipPlans.map((plan, i) => (
          <MembershipPlanCard key={plan.value} plan={plan} featured={i === 1} />
        ))}
      </div>

      <div className="mt-16">
        <h3 className="mb-5 text-center font-serif text-2xl font-bold text-navy">Membership Categories</h3>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {membershipTypes.map((t) => (
            <div key={t.value} className="flex items-center gap-2 rounded-md bg-navy/5 px-4 py-3 text-sm text-ink/75">
              <CheckCircle2 size={15} className="text-gold-dim" /> {t.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
