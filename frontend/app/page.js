"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroSlider from "../components/HeroSlider";
import LeadershipCard from "../components/LeadershipCard";
import SectionHeading from "../components/SectionHeading";
import SideWings from "../components/SideWings";
import JobCard from "../components/JobCard";
import WingCard from "../components/WingCard";
import { wings } from "../data/wings";
import { api } from "../lib/api";
import { ArrowRight } from "lucide-react";

const fallbackLeaders = [
  { name: "To be appointed", designation: "Patron in Chief", message: "A message from the Patron in Chief will appear here once added from the admin panel." },
  { name: "To be appointed", designation: "Pioneer", message: "A message from the Pioneer will appear here once added from the admin panel." },
  { name: "To be appointed", designation: "National Head", message: "A message from the National Head will appear here once added from the admin panel." },
];

export default function HomePage() {
  const [leaders, setLeaders] = useState(fallbackLeaders);
  const [jobs, setJobs] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    api
      .get("/leaders", { params: { tier: undefined } })
      .then(({ data }) => {
        const top = ["patron_in_chief", "pioneer", "national_head"]
          .map((tier) => data.leaders.find((l) => l.tier === tier))
          .filter(Boolean);
        if (top.length) setLeaders(top);
      })
      .catch(() => {});

    api
      .get("/jobs", { params: { size: 6 } })
      .then(({ data }) => setJobs(data.jobs || []))
      .catch(() => {});

    api
      .get("/documents")
      .then(({ data }) => setDocuments(data.documents || []))
      .catch(() => {});
  }, []);

  return (
    <>
      <HeroSlider />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading eyebrow="Leadership" title="Patron, Pioneer & National Head" />
        <div className="grid gap-6 sm:grid-cols-3">
          {leaders.map((leader, i) => (
            <LeadershipCard key={leader._id || i} leader={leader} large />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/leadership" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dim hover:text-maroon">
            View full leadership directory <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="bg-navy/[0.03] py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[280px_1fr]">
          <SideWings documents={documents} />

          <div>
            <SectionHeading eyebrow="Opportunity Updates" title="Latest Government Jobs & Exams" align="left" />
            {jobs.length === 0 ? (
              <p className="rounded-lg border border-dashed border-ink/20 p-8 text-center text-sm text-ink/55">
                Government job listings will appear here once the backend has synced with the
                National Career Service (NCS) API. Run <code>npm run dev</code> in <code>/backend</code> to start syncing.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dim hover:text-maroon">
                View all government opportunities <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeading eyebrow="Specialised Councils" title="Our Wings" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wings.slice(0, 6).map((wing) => (
            <WingCard key={wing.slug} wing={wing} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/wings" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-dim hover:text-maroon">
            View all 9 wings <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="bg-navy-gradient py-16 text-center">
        <div className="mx-auto max-w-2xl px-6">
          <SectionHeading eyebrow="Join the Fraternity" title="Become a Member of AIAA" light />
          <p className="text-cream/75">
            Get your digital membership ID, certificate, and access to a Pan-India network of advocates,
            legal aid initiatives, training programs and government opportunities.
          </p>
          <Link href="/membership" className="btn-gold mt-6 inline-block rounded-full px-7 py-3 text-sm">
            Become a Member
          </Link>
        </div>
      </section>
    </>
  );
}
