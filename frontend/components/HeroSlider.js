"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    eyebrow: "National Announcement",
    title: "Annual Advocates Conclave 2026 — Registrations Now Open",
    body: "Join legal professionals from across India for three days of summits, leadership sessions and networking.",
    cta: { href: "/events", label: "View Events" },
  },
  {
    eyebrow: "Membership Drive",
    title: "Become a Recognised AIAA Member",
    body: "Get your digital ID card, certificate, and access to a Pan-India professional network of advocates.",
    cta: { href: "/membership", label: "Apply for Membership" },
  },
  {
    eyebrow: "Government Update",
    title: "Latest Government Job Openings, Updated Every 6 Hours",
    body: "Browse current government vacancies and exam notifications sourced directly from the National Career Service.",
    cta: { href: "/jobs", label: "Browse Opportunities" },
  },
  {
    eyebrow: "Legal Awareness",
    title: "Free Legal Aid Camps Across Districts",
    body: "Our Legal Aid & Human Rights Protection Council runs ongoing pro bono camps nationwide.",
    cta: { href: "/wings/legal-aid-human-rights", label: "Learn More" },
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[index];

  return (
    <section className="relative overflow-hidden bg-navy-gradient">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border border-gold/10" />
      <div className="pointer-events-none absolute -right-10 top-10 h-72 w-72 rounded-full border border-gold/10" />

      <div className="mx-auto flex max-w-7xl flex-col px-6 py-20 sm:py-28">
        <p className="eyebrow mb-4 text-gold-light">{slide.eyebrow}</p>
        <h1 className="max-w-3xl font-serif text-3xl font-bold leading-tight text-cream sm:text-5xl">
          {slide.title}
        </h1>
        <p className="mt-5 max-w-xl text-base text-cream/75 sm:text-lg">{slide.body}</p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href={slide.cta.href} className="btn-gold rounded-full px-6 py-3 text-sm">
            {slide.cta.label}
          </Link>
          <Link href="/about" className="rounded-full border border-cream/30 px-6 py-3 text-sm text-cream hover:border-gold hover:text-gold">
            About AIAA
          </Link>
        </div>

        <div className="mt-12 flex items-center gap-3">
          <button
            aria-label="Previous slide"
            onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
            className="rounded-full border border-cream/30 p-2 text-cream hover:border-gold hover:text-gold"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-gold" : "w-3 bg-cream/30"}`}
              />
            ))}
          </div>
          <button
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className="rounded-full border border-cream/30 p-2 text-cream hover:border-gold hover:text-gold"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
