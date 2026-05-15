"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowRight, CheckCircle, Clock, Paperclip, X } from "lucide-react";
import { SUPPORT_CATEGORIES, type SupportCategory } from "../constants";

type SupportFormState = {
  name: string;
  email: string;
  category: SupportCategory | "";
  subject: string;
  message: string;
  attachment: File | null;
};

type SupportFormErrors = Partial<Record<keyof SupportFormState, string>>;

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

const Field = ({ label, error, hint, children }: FieldProps) => (
  <label className="block">
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-sm font-medium text-gray-700 font-poppins">
        {label}
      </span>
      {hint && (
        <span className="text-2xs text-gray-400 font-poppins">{hint}</span>
      )}
      {error && (
        <span className="text-2xs text-[#D14343] font-poppins">{error}</span>
      )}
    </div>
    {children}
  </label>
);

const INITIAL: SupportFormState = {
  name: "",
  email: "",
  category: "",
  subject: "",
  message: "",
  attachment: null,
};

type SubmitState = "idle" | "submitting" | "success";

export const SupportContactForm = () => {
  const [form, setForm] = useState<SupportFormState>(INITIAL);
  const [errors, setErrors] = useState<SupportFormErrors>({});
  const [state, setState] = useState<SubmitState>("idle");
  const [ticket, setTicket] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof SupportFormState>(
    k: K,
    v: SupportFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: SupportFormErrors = {};
    if (!form.name.trim()) next.name = "Please tell us your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email";
    if (!form.category) next.category = "Pick a topic";
    if (!form.message.trim() || form.message.length < 10)
      next.message = "Tell us a little more (10+ characters)";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setState("submitting");
    try {
      // TODO: replace with real submit, e.g.:
      // await fetch("/api/support", { method: "POST", body: JSON.stringify(form) });
      await new Promise((r) => setTimeout(r, 900));
      setTicket(`CVR-${Math.floor(100000 + Math.random() * 900000)}`);
      setState("success");
    } catch {
      setState("idle");
    }
  };

  const reset = () => {
    setForm(INITIAL);
    setErrors({});
    setState("idle");
    setTicket("");
  };

  if (state === "success") {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-12 border border-black/5 shadow-xl shadow-blue-100/40 text-center">
        <div className="w-16 h-16 bg-[#EAF7EE] text-[#388B12] rounded-2xl mx-auto flex items-center justify-center mb-6">
          <CheckCircle size={28} />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 font-poppins mb-2">
          Got it — message received
        </h3>
        <p className="text-gray-600 font-poppins max-w-md mx-auto">
          We sent a confirmation to{" "}
          <span className="font-medium text-gray-900">{form.email}</span>. A
          real human will get back to you within a working day.
        </p>
        <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
          <div className="bg-[#F5F7FA] rounded-xl p-4">
            <p className="text-2xs uppercase tracking-wider text-gray-400 font-poppins">
              Ticket
            </p>
            <p className="font-medium text-gray-900 font-poppins">#{ticket}</p>
          </div>
          <div className="bg-[#F5F7FA] rounded-xl p-4">
            <p className="text-2xs uppercase tracking-wider text-gray-400 font-poppins">
              Topic
            </p>
            <p className="font-medium text-gray-900 font-poppins">
              {form.category}
            </p>
          </div>
          <div className="bg-[#F5F7FA] rounded-xl p-4">
            <p className="text-2xs uppercase tracking-wider text-gray-400 font-poppins">
              Est. reply
            </p>
            <p className="font-medium text-gray-900 font-poppins inline-flex items-center gap-1">
              <Clock size={14} /> Under 24h
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="mt-8 text-sm font-medium text-[#0A65CC] hover:underline"
        >
          Send another message →
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-3xl p-6 sm:p-10 border border-black/5 shadow-xl shadow-blue-100/40 space-y-5"
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Your name" error={errors.name}>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ada Lovelace"
            className="w-full bg-[#F5F7FA] rounded-xl px-4 py-3 outline-none font-poppins focus:bg-white focus:ring-2 focus:ring-[#4680EE]/30 border border-transparent focus:border-[#4680EE]"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="ada@work.com"
            className="w-full bg-[#F5F7FA] rounded-xl px-4 py-3 outline-none font-poppins focus:bg-white focus:ring-2 focus:ring-[#4680EE]/30 border border-transparent focus:border-[#4680EE]"
          />
        </Field>
      </div>

      <Field label="What is this about?" error={errors.category}>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_CATEGORIES.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => set("category", c)}
              className={
                "px-3 py-2 rounded-xl text-sm font-poppins border transition-all " +
                (form.category === c
                  ? "bg-[#0A65CC] text-white border-[#0A65CC]"
                  : "bg-[#F5F7FA] text-gray-700 border-transparent hover:border-[#4680EE]/30")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Subject (optional)">
        <input
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          placeholder="A short summary"
          className="w-full bg-[#F5F7FA] rounded-xl px-4 py-3 outline-none font-poppins focus:bg-white focus:ring-2 focus:ring-[#4680EE]/30 border border-transparent focus:border-[#4680EE]"
        />
      </Field>

      <Field
        label="Tell us more"
        error={errors.message}
        hint={`${form.message.length} characters`}
      >
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Share what you tried, any error messages, the URL of the job posting if relevant…"
          className="w-full bg-[#F5F7FA] rounded-xl px-4 py-3 outline-none font-poppins focus:bg-white focus:ring-2 focus:ring-[#4680EE]/30 border border-transparent focus:border-[#4680EE] resize-none"
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => set("attachment", e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#0A65CC] px-3 py-2 rounded-xl border border-dashed border-gray-300 hover:border-[#4680EE] font-poppins"
          >
            <Paperclip size={16} />
            {form.attachment ? form.attachment.name : "Attach a screenshot"}
          </button>
          {form.attachment && (
            <button
              type="button"
              onClick={() => set("attachment", null)}
              className="text-gray-400 hover:text-gray-700"
              aria-label="Remove attachment"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={state === "submitting"}
          className="inline-flex items-center gap-2 bg-[#0A65CC] hover:bg-[#085bb8] disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium font-poppins"
        >
          {state === "submitting" ? (
            <>
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="3"
                  strokeOpacity="0.3"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Sending…
            </>
          ) : (
            <>
              Send message <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
