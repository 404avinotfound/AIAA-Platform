import SectionHeading from "../../components/SectionHeading";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading eyebrow="Get in Touch" title="Contact AIAA" />
      <div className="card-official grid gap-6 rounded-lg p-8 sm:grid-cols-3 sm:text-center">
        <div>
          <Phone className="mx-auto mb-2 text-gold-dim" />
          <p className="text-sm font-semibold text-navy">WhatsApp</p>
          <p className="text-sm text-ink/65">+91 90319 75409</p>
        </div>
        <div>
          <Mail className="mx-auto mb-2 text-gold-dim" />
          <p className="text-sm font-semibold text-navy">Email</p>
          <p className="text-sm text-ink/65">info@aiaa.org.in</p>
        </div>
        <div>
          <MapPin className="mx-auto mb-2 text-gold-dim" />
          <p className="text-sm font-semibold text-navy">Head Office</p>
          <p className="text-sm text-ink/65">New Delhi, India</p>
        </div>
      </div>
    </div>
  );
}
