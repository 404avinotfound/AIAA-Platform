import SectionHeading from "../../components/SectionHeading";
import { CheckCircle2 } from "lucide-react";

const whyJoin = [
  "Pan-India Professional Network",
  "Leadership Opportunities",
  "Professional Recognition",
  "ID Card & Joining Letter",
  "Specialized Wings & Councils",
  "Training & Academic Support",
  "Legal Aid & Human Rights Activities",
  "Arbitration & ADR Opportunities",
  "Internship & Placement Support",
  "Technology & PR Assistance",
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="About AIAA" title="All India Advocates Associations" align="left" />

      <p className="text-base leading-relaxed text-ink/75">
        ALL INDIA ADVOCATES ASSOCIATIONS is a dynamic and progressive Pan-India platform established
        for the welfare, professional growth, networking, and empowerment of advocates across the nation.
        Our mission is to unite legal professionals under one umbrella and create a strong institutional
        framework that promotes legal excellence, ethical advocacy, legal awareness, and access to justice.
      </p>
      <p className="mt-4 text-base leading-relaxed text-ink/75">
        We aim to build a modern and organized legal community by integrating technology, legal resources,
        professional opportunities, and leadership development for advocates practicing at every level of
        the judiciary.
      </p>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        <div className="card-official rounded-lg p-6">
          <h3 className="font-serif text-xl font-bold text-navy">Our Vision</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            To create a strong, united, ethical, and influential national community of advocates dedicated
            to upholding the Rule of Law, constitutional values, and professional excellence.
          </p>
        </div>
        <div className="card-official rounded-lg p-6">
          <h3 className="font-serif text-xl font-bold text-navy">Our Mission</h3>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/70">
            <li>• To empower advocates through professional opportunities and institutional support.</li>
            <li>• To promote legal awareness, legal aid, and human rights protection.</li>
            <li>• To develop leadership and coordination among advocates across India.</li>
            <li>• To create a transparent and technology-driven legal network.</li>
            <li>• To support legal research, ADR, litigation management, and academic excellence.</li>
          </ul>
        </div>
      </div>

      <div className="mt-14">
        <h3 className="mb-5 font-serif text-2xl font-bold text-navy">Why Join Us?</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {whyJoin.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-md bg-navy/5 px-4 py-3 text-sm text-ink/75">
              <CheckCircle2 size={16} className="text-gold-dim" /> {item}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-lg bg-navy-gradient p-8 text-cream">
        <p className="eyebrow text-gold-light">Message from the Team</p>
        <p className="mt-3 text-sm leading-relaxed text-cream/80">
          We believe that advocates are the guardians of justice and constitutional democracy. Through
          collective strength, professionalism, and ethical leadership, we aspire to create a progressive
          legal platform for advocates throughout India.
        </p>
      </div>
    </div>
  );
}
