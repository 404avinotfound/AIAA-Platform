"use client";

import { useState, Suspense } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import SectionHeading from "../../../components/SectionHeading";
import { membershipPlans } from "../../../data/content";
import { api } from "../../../lib/api";
import { ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="px-6 py-20 text-center text-sm text-ink/55">Loading…</p>}>
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const planValue = params.get("plan") || "annual";
  const plan = membershipPlans.find((p) => p.value === planValue) || membershipPlans[0];

  const [status, setStatus] = useState("idle"); // idle | processing | success | error
  const [message, setMessage] = useState("");

  async function payNow() {
    setStatus("processing");
    setMessage("");
    try {
      const { data: order } = await api.post("/payments/create-order", { plan: plan.value });

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "All India Advocates Associations",
        description: `${plan.label} Membership`,
        image: "/images/logo-dark.jpg",
        order_id: order.orderId,
        theme: { color: "#0A1A33" },
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setStatus("success");
            setTimeout(() => router.push("/dashboard"), 1500);
          } catch (err) {
            setStatus("error");
            setMessage(err.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Could not start checkout. Please submit a membership application first and ensure you are logged in.");
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="mx-auto max-w-xl px-6 py-16">
        <SectionHeading eyebrow="Secure Payment" title="Complete Your Membership" />

        <div className="card-official rounded-lg p-6 text-center">
          <p className="eyebrow text-gold-dim">{plan.label} Plan</p>
          <p className="mt-2 font-serif text-3xl font-bold text-navy">
            ₹{plan.price.toLocaleString("en-IN")} <span className="text-sm font-normal text-ink/55">{plan.period}</span>
          </p>
          <p className="mt-2 text-sm text-ink/60">{plan.description}</p>

          <button
            onClick={payNow}
            disabled={status === "processing"}
            className="btn-gold mt-6 w-full rounded-full py-3 text-sm disabled:opacity-60"
          >
            {status === "processing" ? "Opening secure checkout…" : "Pay with Razorpay"}
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink/45">
            <ShieldCheck size={14} /> Payments are processed securely by Razorpay. AIAA never stores your card details.
          </p>

          {status === "success" && (
            <p className="mt-4 text-sm font-semibold text-green-700">
              Payment verified! Your membership is now active. Redirecting to your dashboard…
            </p>
          )}
          {status === "error" && <p className="mt-4 text-sm text-maroon">{message}</p>}
        </div>
      </div>
    </>
  );
}
