"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SectionHeading from "../../../components/SectionHeading";
import { membershipTypes, membershipPlans } from "../../../data/content";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/AuthContext";
import { Lock, CheckCircle2, Clock, FileEdit } from "lucide-react";

const MAX_IMAGE_BYTES = 100 * 1024; // 100KB
const MAX_DOCUMENT_BYTES = 250 * 1024; // 250KB

const fileFields = [
  { name: "profilePhoto", label: "Passport-sized Photograph", kind: "image" },
  { name: "govtId", label: "Government ID", kind: "document" },
  { name: "advocateId", label: "Advocate ID", kind: "document" },
  { name: "enrollmentCertificate", label: "Enrollment Certificate", kind: "document" },
  { name: "signature", label: "Signature", kind: "image" },
];

const IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const textFields = [
  ["fatherName", "Father's Name"],
  ["motherName", "Mother's Name"],
  ["dob", "Date of Birth", "date"],
  ["bloodGroup", "Blood Group"],
  ["alternatePhone", "Alternate Phone"],
  ["address", "Address"],
  ["city", "City"],
  ["district", "District"],
  ["state", "State"],
  ["pin", "PIN Code"],
  ["enrollmentNumber", "Enrollment Number"],
  ["barCouncil", "Bar Council"],
  ["courtOfPractice", "Court of Practice"],
  ["areaOfPractice", "Area of Practice"],
  ["experienceYears", "Experience (years)", "number"],
  ["education", "Education"],
  ["executivePositionInterested", "Executive Position Interested In"],
  ["emergencyContactName", "Emergency Contact Name"],
  ["emergencyContactPhone", "Emergency Contact Phone"],
];

export default function MembershipApplyPage() {
  return (
    <Suspense fallback={<p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>}>
      <MembershipApplyForm />
    </Suspense>
  );
}

function MembershipApplyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [existingStatus, setExistingStatus] = useState(undefined); // undefined = still checking
  const [form, setForm] = useState({
    membershipType: "advocate",
    plan: params.get("plan") || "annual",
    gender: "male",
  });
  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Check whether this person already has an application on file, so we
  // don't let them fill the whole form out again only to hit a 409 - unless
  // the admin has specifically asked them to refill it.
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setExistingStatus(null);
      return;
    }
    api
      .get("/members/me")
      .then(({ data }) => setExistingStatus(data.member?.status || null))
      .catch(() => setExistingStatus(null));
  }, [authLoading, user]);

  // profilePhoto/signature must be a small image (<=100KB); govtId,
  // advocateId, enrollmentCertificate must be a PDF (<=250KB) - matching the
  // limits enforced server-side in backend/src/middleware/upload.js.
  function handleFileChange(field, selected) {
    if (!selected) {
      setFiles((s) => ({ ...s, [field.name]: undefined }));
      setFileErrors((errs) => ({ ...errs, [field.name]: "" }));
      return;
    }

    if (field.kind === "image") {
      if (!IMAGE_TYPES.includes(selected.type)) {
        setFileErrors((errs) => ({ ...errs, [field.name]: "Only image files (JPG, PNG, WEBP, GIF) are allowed." }));
        return;
      }
      if (selected.size > MAX_IMAGE_BYTES) {
        setFileErrors((errs) => ({ ...errs, [field.name]: "Image must be 100KB or smaller." }));
        return;
      }
    } else {
      if (selected.type !== "application/pdf") {
        setFileErrors((errs) => ({ ...errs, [field.name]: "Only PDF files are allowed." }));
        return;
      }
      if (selected.size > MAX_DOCUMENT_BYTES) {
        setFileErrors((errs) => ({ ...errs, [field.name]: "PDF must be 250KB or smaller." }));
        return;
      }
    }

    setFileErrors((errs) => ({ ...errs, [field.name]: "" }));
    setFiles((s) => ({ ...s, [field.name]: selected }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.termsAccepted) {
      setError("Please accept the terms to continue.");
      return;
    }

    if (Object.values(fileErrors).some(Boolean)) {
      setError("Please fix the highlighted file uploads before continuing.");
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      Object.entries(files).forEach(([k, file]) => file && fd.append(k, file));

      await api.post("/members", fd, { headers: { "Content-Type": "multipart/form-data" } });
      router.push(`/membership/checkout?plan=${form.plan}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit application. Please log in and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || existingStatus === undefined) {
    return <p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <SectionHeading eyebrow="Membership Application" title="Tell Us About Yourself" />
        <div className="card-official flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <Lock size={36} className="text-gold-dim" />
          <p className="text-sm text-ink/65">Please log in to apply for AIAA membership.</p>
          <button onClick={() => router.push("/auth/login")} className="btn-gold mt-1 rounded-full px-5 py-2 text-sm">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (existingStatus && existingStatus !== "resubmission_required") {
    const statusInfo = {
      pending_payment: { icon: Clock, text: "Your application has been submitted and is awaiting payment/review." },
      active: { icon: CheckCircle2, text: "You're already an active AIAA member." },
      expired: { icon: Clock, text: "Your membership has expired. Please contact AIAA to renew." },
      rejected: { icon: Lock, text: "Your application was not approved. Please contact AIAA for details." },
      suspended: { icon: Lock, text: "Your membership is currently suspended. Please contact AIAA for details." },
    }[existingStatus] || { icon: Clock, text: "You already have an application on file." };
    const Icon = statusInfo.icon;

    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <SectionHeading eyebrow="Membership Application" title="Application Status" />
        <div className="card-official flex flex-col items-center gap-3 rounded-lg p-10 text-center">
          <Icon size={36} className="text-gold-dim" />
          <p className="text-sm text-ink/65">{statusInfo.text}</p>
          <Link href="/dashboard" className="mt-1 text-sm font-semibold text-gold-dim hover:text-maroon">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading eyebrow="Membership Application" title="Tell Us About Yourself" align="left" />

      {existingStatus === "resubmission_required" && (
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-gold/10 p-4 text-sm text-gold-dim">
          <FileEdit size={18} className="mt-0.5 shrink-0" />
          <p>
            AIAA has asked you to review and refill your application (e.g. unclear documents or details).
            Please fill in the form below again, including re-uploading your documents, and submit.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card-official space-y-6 rounded-lg p-6 sm:p-8">
        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Membership Category</label>
          <select
            value={form.membershipType}
            onChange={(e) => update("membershipType", e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          >
            {membershipTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Plan</label>
          <select
            value={form.plan}
            onChange={(e) => update("plan", e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          >
            {membershipPlans.map((p) => (
              <option key={p.value} value={p.value}>{p.label} — ₹{p.price} {p.period}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-navy">Gender</label>
          <select
            value={form.gender}
            onChange={(e) => update("gender", e.target.value)}
            className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {textFields.map(([key, label, type = "text"]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-semibold text-navy">{label}</label>
              <input
                type={type}
                value={form[key] || ""}
                onChange={(e) => update(key, e.target.value)}
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>

        <div>
          <h4 className="mb-3 font-serif text-base font-bold text-navy">Documents & Photo</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            {fileFields.map((f) => (
              <div key={f.name}>
                <label className="mb-1 block text-sm font-semibold text-navy">{f.label}</label>
                <input
                  type="file"
                  accept={f.kind === "image" ? "image/*" : "application/pdf"}
                  onChange={(e) => handleFileChange(f, e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
                <p className="mt-0.5 text-[11px] text-ink/40">
                  {f.kind === "image" ? "Image (JPG/PNG/WEBP/GIF), max 100KB." : "PDF only, max 250KB."}
                </p>
                {fileErrors[f.name] && <p className="mt-0.5 text-[11px] text-maroon">{fileErrors[f.name]}</p>}
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={!!form.termsAccepted}
            onChange={(e) => update("termsAccepted", e.target.checked)}
            className="mt-1"
          />
          I confirm the information provided is accurate and I accept AIAA's membership terms and code of conduct.
        </label>

        {error && <p className="text-sm text-maroon">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-gold w-full rounded-full py-3 text-sm disabled:opacity-60">
          {submitting ? "Submitting…" : "Continue to Payment"}
        </button>
      </form>
    </div>
  );
}
