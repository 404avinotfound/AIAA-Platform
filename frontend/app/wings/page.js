import SectionHeading from "../../components/SectionHeading";
import WingCard from "../../components/WingCard";
import { wings } from "../../data/wings";

export default function WingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <SectionHeading eyebrow="Specialised Councils" title="Wings of AIAA" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wings.map((wing) => (
          <WingCard key={wing.slug} wing={wing} />
        ))}
      </div>
    </div>
  );
}
