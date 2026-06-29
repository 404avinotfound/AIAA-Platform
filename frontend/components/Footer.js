import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin } from "lucide-react";
import { navLinks } from "../data/content";

export default function Footer() {
  return (
    <footer className="bg-navy-deep text-cream/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <Image src="/images/logo-white.jpg" alt="AIAA emblem" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
            <p className="font-serif text-base font-bold text-gold">AIAA</p>
          </div>
          <p className="text-sm leading-relaxed text-cream/70">
            A Pan-India platform uniting legal professionals to promote legal excellence,
            ethical advocacy, legal awareness, and access to justice.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-3 text-gold">Explore</p>
          <ul className="space-y-2 text-sm">
            {navLinks.slice(0, 5).map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-gold">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3 text-gold">Resources</p>
          <ul className="space-y-2 text-sm">
            {navLinks.slice(5).map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-gold">{l.label}</Link></li>
            ))}
            <li><Link href="/auth/login" className="hover:text-gold">Member Login</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3 text-gold">Contact</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2"><Phone size={15} className="mt-0.5 text-gold" /> +91 90319 75409</li>
            <li className="flex items-start gap-2"><Mail size={15} className="mt-0.5 text-gold" /> info@aiaa.org.in</li>
            <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 text-gold" /> New Delhi, India</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 px-6 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} All India Advocates Associations. All rights reserved.
      </div>
    </footer>
  );
}
