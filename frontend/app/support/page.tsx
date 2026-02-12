"use client"

import { FormEvent, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_TICKETS_API_URL;

interface SubmitState {
  status: "idle" | "submitting" | "success" | "error";
  message: string;
}

export default function SupportPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({
    status: "idle",
    message: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!API_URL) {
      setSubmitState({
        status: "error",
        message: "Support API is not configured. Please set NEXT_PUBLIC_TICKETS_API_URL.",
      });
      return;
    }

    // Basic front‑end validation
    if (!customerName || !customerEmail || !subject || !description) {
      setSubmitState({
        status: "error",
        message: "Please fill in all fields before submitting.",
      });
      return;
    }

    setSubmitState({ status: "submitting", message: "" });

    try {
      const res = await fetch(`${API_URL}/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_email: customerEmail,
          subject,
          description,
        }),
      });

      if (res.status === 201) {
        setSubmitState({
          status: "success",
          message: "Your support request has been submitted successfully.",
        });
        // Clear the form
        setCustomerName("");
        setCustomerEmail("");
        setSubject("");
        setDescription("");
      } else if (res.status === 400) {
        let errorText = "The request was invalid. Please check your inputs.";
        try {
          const json = await res.json();
          if (json && typeof json.message === "string") {
            errorText = json.message;
          }
        } catch {
          // ignore JSON parse errors and use default message
        }
        setSubmitState({
          status: "error",
          message: errorText,
        });
      } else {
        setSubmitState({
          status: "error",
          message: `Unexpected response from server (status ${res.status}).`,
        });
      }
    } catch (err) {
      setSubmitState({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to submit support request.",
      });
    }
  }

  const isSubmitting = submitState.status === "submitting";

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 md:p-8">
      <div className="mx-auto max-w-xl rounded-xl border border-[var(--foreground)]/10 bg-[var(--background)] shadow-sm p-6 md:p-8">
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--foreground)]/15 bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)]/80 hover:bg-[var(--foreground)]/5"
          >
            <span aria-hidden>←</span>
            Back to home
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Contact Support
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/60">
          Submit a ticket and our support team will get back to you as soon as
          possible.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Customer name
            </label>
            <input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--foreground)]/40 focus:outline-none"
              placeholder="Jane Doe"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="customerEmail"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Customer email
            </label>
            <input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--foreground)]/40 focus:outline-none"
              placeholder="jane@example.com"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--foreground)]/40 focus:outline-none"
              placeholder="Brief summary of your issue"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[var(--foreground)]"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-md border border-[var(--foreground)]/20 bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] shadow-sm focus:border-[var(--foreground)]/40 focus:outline-none"
              placeholder="Please describe your issue in detail..."
              rows={5}
              disabled={isSubmitting}
            />
          </div>

          {submitState.status === "success" && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-400">
              {submitState.message}
            </div>
          )}

          {submitState.status === "error" && (
            <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {submitState.message}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60 bg-sky-500 hover:bg-sky-600"
            >
              {isSubmitting ? "Submitting..." : "Submit ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

