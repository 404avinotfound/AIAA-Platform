"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import SectionHeading from "../../../components/SectionHeading";
import { api, setSession } from "../../../lib/api";
import { useAuth } from "../../../lib/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Once the success screen shows, send the person to the Home Page shortly
  // after - giving them a moment to see the confirmation first.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.push("/"), 1200);
    return () => clearTimeout(timer);
  }, [success, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setSession(data);
      // Re-fetch the logged-in user/member into AuthContext right away, so
      // the Header and the rest of the site update immediately instead of
      // only after a manual page refresh.
      await refresh();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="card-official flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <CheckCircle2 size={48} className="text-gold-dim" />
          <h2 className="font-serif text-xl font-bold text-navy">You're logged in!</h2>
          <p className="text-sm text-ink/60">Taking you to the Home Page…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <SectionHeading eyebrow="Member Login" title="Welcome Back" />

      <form onSubmit={handleSubmit} className="card-official space-y-4 rounded-lg p-6">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-maroon">{error}</p>}

        <button disabled={loading} className="btn-gold w-full rounded-full py-2.5 text-sm disabled:opacity-60">
          {loading ? "Signing in…" : "Login"}
        </button>

        <p className="text-center text-sm text-ink/60">
          New to AIAA?{" "}
          <Link href="/auth/register" className="font-semibold text-gold-dim hover:text-maroon">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
