"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";

type EmailContactFormProps = {
  destination: string;
  variant?: "general" | "church";
};

const fieldClass =
  "w-full px-4 py-3 rounded-xl border border-[#EAE7DC] bg-[#FAF9F5] focus:bg-white focus:border-[#2F5BEA] focus:ring-2 focus:ring-[#C9D8FC] outline-none text-sm text-charcoal-900 transition-colors";

const labelClass =
  "block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5";

export function EmailContactForm({
  destination,
  variant = "general",
}: EmailContactFormProps) {
  const [emailOpened, setEmailOpened] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const topic = String(data.get("topic") || "General inquiry").trim();
    const subject =
      variant === "church"
        ? `Church partnership — ${String(data.get("organization") || name).trim()}`
        : String(data.get("subject") || topic).trim();
    const details =
      variant === "church"
        ? `Name: ${name}\nEmail: ${email}\nChurch / ministry: ${String(data.get("organization") || "")}\nLocation: ${String(data.get("location") || "")}\n\n${message}`
        : `Topic: ${topic}\nName: ${name}\nEmail: ${email}\n\n${message}`;

    setEmailOpened(true);
    window.location.href = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(details)}`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {variant === "general" && (
        <div>
          <label htmlFor="contact-topic" className={labelClass}>
            Department / Topic
          </label>
          <select id="contact-topic" name="topic" className={fieldClass}>
            <option>General Inquiry / Feedback</option>
            <option>Church or Ministry Partnership</option>
            <option>Share a Testimony of Faith</option>
            <option>Technical Issue or Bug Report</option>
            <option>Press, Media &amp; Speaking</option>
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${variant}-name`} className={labelClass}>
            Your Name
          </label>
          <input
            id={`${variant}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder={variant === "church" ? "Pastor / leader name" : "Your full name"}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${variant}-email`} className={labelClass}>
            Email Address
          </label>
          <input
            id={`${variant}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={variant === "church" ? "pastor@yourchurch.org" : "you@example.com"}
            className={fieldClass}
          />
        </div>
      </div>

      {variant === "church" ? (
        <>
          <div>
            <label htmlFor="church-organization" className={labelClass}>
              Church or Ministry Name
            </label>
            <input
              id="church-organization"
              name="organization"
              type="text"
              autoComplete="organization"
              required
              placeholder="Your church or ministry"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="church-location" className={labelClass}>
              Location (City, Country)
            </label>
            <input
              id="church-location"
              name="location"
              type="text"
              autoComplete="address-level2"
              required
              placeholder="Phnom Penh, Cambodia"
              className={fieldClass}
            />
          </div>
        </>
      ) : (
        <div>
          <label htmlFor="contact-subject" className={labelClass}>
            Subject
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            required
            placeholder="What can we help with?"
            className={fieldClass}
          />
        </div>
      )}

      <div>
        <label htmlFor={`${variant}-message`} className={labelClass}>
          {variant === "church" ? "How can we help your ministry?" : "Message"}
        </label>
        <textarea
          id={`${variant}-message`}
          name="message"
          rows={variant === "church" ? 4 : 5}
          required
          placeholder={
            variant === "church"
              ? "Tell us about your congregation, youth ministry, or translation needs…"
              : "Write your message here…"
          }
          className={`${fieldClass} resize-y`}
        />
      </div>

      <button
        type="submit"
        className="fi-btn fi-btn--primary w-full justify-center py-3.5 text-base font-bold shadow-md"
      >
        <span>{variant === "church" ? "Prepare Church Inquiry" : "Prepare Email"}</span>
        <Send className="w-4 h-4" aria-hidden="true" />
      </button>

      <p className="text-center text-xs text-charcoal-500" aria-live="polite">
        {emailOpened ? (
          <span className="inline-flex items-center gap-1.5 text-[#047857] font-semibold">
            <Mail className="w-3.5 h-3.5" aria-hidden="true" />
            Your email app is opening with the message ready to review.
          </span>
        ) : (
          "You will review the message in your email app before it is sent."
        )}
      </p>
    </form>
  );
}
