"use client";

import { useEffect } from "react";
import Link from "next/link";
import SectionHeading from "../../components/SectionHeading";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/navigation";
import { Download, LogOut, UserCog, Megaphone } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, member, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [loading, user, router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (loading || !user) {
    return <p className="px-6 py-20 text-center text-sm text-ink/55">Loading your dashboard…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <SectionHeading eyebrow="Member Dashboard" title={`Welcome, ${user.fullName}`} align="left" />

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card-official rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-navy">Membership Status</h3>
          {member ? (
            <>
              <p className="mt-2 text-sm text-ink/70">
                Type: <span className="font-semibold capitalize">{member.membershipType?.replace("_", " ")}</span>
              </p>
              <p className="text-sm text-ink/70">
                Status: <span className="font-semibold capitalize">{member.status?.replace("_", " ")}</span>
              </p>
              {member.membershipNumber && (
                <p className="text-sm text-ink/70">
                  Membership No: <span className="font-semibold">{member.membershipNumber}</span>
                </p>
              )}
              {member.status === "active" && (
                <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-gold/30 bg-navy-gradient p-5 text-center text-cream">
                  {member.qrCode && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.qrCode} alt="Membership QR Code" width={120} height={120} className="rounded bg-white p-1" />
                  )}
                  <button className="btn-gold flex items-center gap-2 rounded-full px-4 py-2 text-xs">
                    <Download size={14} /> Download Digital ID Card
                  </button>
                </div>
              )}
              {member.status === "pending_payment" && (
                <Link href="/membership/checkout?plan=annual" className="btn-gold mt-4 inline-block rounded-full px-4 py-2 text-xs">
                  Complete Payment
                </Link>
              )}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-ink/60">You haven't submitted a membership application yet.</p>
              <Link href="/membership/apply" className="btn-gold mt-4 inline-block rounded-full px-4 py-2 text-xs">
                Apply for Membership
              </Link>
            </>
          )}
        </div>

        <div className="card-official rounded-lg p-6">
          <h3 className="font-serif text-lg font-bold text-navy">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/dashboard/profile" className="flex items-center gap-1.5 text-gold-dim hover:text-maroon"><UserCog size={14} /> Edit Profile</Link></li>
            {member?.status === "active" && (
              <li><Link href="/membership/hub" className="flex items-center gap-1.5 text-gold-dim hover:text-maroon"><Megaphone size={14} /> Membership Hub</Link></li>
            )}
            <li><Link href="/community" className="text-gold-dim hover:text-maroon">Discussion Forum</Link></li>
            <li><Link href="/jobs" className="text-gold-dim hover:text-maroon">Government Jobs</Link></li>
            <li><Link href="/community/ask" className="text-gold-dim hover:text-maroon">Ask a Legal Query</Link></li>
            {["admin", "super_admin"].includes(user.role) && (
              <li><Link href="/admin" className="text-gold-dim hover:text-maroon">Admin Panel</Link></li>
            )}
          </ul>
          <button onClick={handleLogout} className="mt-6 flex items-center gap-2 text-sm text-maroon hover:underline">
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>
    </div>
  );
}
