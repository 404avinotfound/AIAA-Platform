"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, mediaUrl } from "../../../lib/api";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default function VerifyPage() {
  const { membershipNumber } = useParams();
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get(`/members/verify/${membershipNumber}`)
      .then(({ data }) => setResult(data))
      .catch(() => setNotFound(true));
  }, [membershipNumber]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-6 py-16">
      <div className="card-official w-full rounded-lg p-8 text-center">
        {notFound ? (
          <>
            <ShieldAlert size={40} className="mx-auto text-maroon" />
            <h2 className="mt-4 font-serif text-xl font-bold text-navy">Not a Valid Membership Number</h2>
            <p className="mt-2 text-sm text-ink/60">{membershipNumber} could not be verified.</p>
          </>
        ) : result ? (
          <>
            <ShieldCheck size={40} className="mx-auto text-green-600" />
            {result.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(result.photoUrl)} alt={result.fullName} width={96} height={96} className="mx-auto mt-4 h-24 w-24 rounded-full object-cover" />
            )}
            <h2 className="mt-4 font-serif text-xl font-bold text-navy">{result.fullName}</h2>
            <p className="text-sm capitalize text-ink/60">{result.membershipType?.replace("_", " ")} Member</p>
            <p className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${result.status === "active" ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/60"}`}>
              {result.status?.replace("_", " ")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink/55">
              <div>Member Since<br /><span className="font-semibold text-ink/80">{result.issueDate ? new Date(result.issueDate).toLocaleDateString() : "—"}</span></div>
              <div>Valid Until<br /><span className="font-semibold text-ink/80">{result.expiryDate ? new Date(result.expiryDate).toLocaleDateString() : "Lifetime"}</span></div>
            </div>
          </>
        ) : (
          <p className="text-sm text-ink/55">Verifying…</p>
        )}
      </div>
    </div>
  );
}
