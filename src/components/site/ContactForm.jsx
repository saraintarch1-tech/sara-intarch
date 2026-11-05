import { useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/api/platformClient";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  service: "",
  location: "",
  message: "",
};

export default function ContactForm({ onDark = false, services = [] }) {
  const [form, setForm] = useState(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const label = onDark ? "text-ivory/45" : "text-stone";
  const field = onDark
    ? "w-full border-0 border-b border-ivory/25 bg-transparent px-0 py-3 text-sm text-ivory placeholder:text-ivory/35 focus:border-ivory focus:outline-none focus:ring-0"
    : "field-line";

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please add your name, email and a short message.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError("That email address does not look complete.");
      return;
    }
    setSending(true);
    setError("");
    try {
      await api.entities.ContactMessage.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        service: form.service,
        location: form.location.trim(),
        message: form.message.trim(),
        status: "new",
      });
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      setError("Your message could not be sent. Please try again or email the studio directly.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div
        className={`border p-8 md:p-10 ${
          onDark ? "border-ivory/25 text-ivory" : "border-ink/15 text-ink"
        }`}
      >
        <p className="font-display text-2xl md:text-3xl">Thank you.</p>
        <p className={`mt-3 text-sm leading-relaxed ${onDark ? "text-ivory/70" : "text-ink-soft"}`}>
          Your enquiry has reached the studio. You will receive a reply within two working days.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className={`mt-6 caps ${onDark ? "text-ivory/60 hover:text-ivory" : "text-stone hover:text-ink"}`}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block">
          <span className={`caps ${label}`}>Name *</span>
          <input
            value={form.name}
            onChange={set("name")}
            className={`${field} mt-1`}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className={`caps ${label}`}>Email *</span>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            className={`${field} mt-1`}
            placeholder="you@studio.com"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className={`caps ${label}`}>Phone</span>
          <input
            value={form.phone}
            onChange={set("phone")}
            className={`${field} mt-1`}
            placeholder="+31 6 000 000 00"
            autoComplete="tel"
          />
        </label>
        <label className="block">
          <span className={`caps ${label}`}>Location</span>
          <input
            value={form.location}
            onChange={set("location")}
            className={`${field} mt-1`}
            placeholder="City, country"
          />
        </label>
      </div>

      <label className="block">
        <span className={`caps ${label}`}>Project type</span>
        <select
          value={form.service}
          onChange={set("service")}
          className={`${field} mt-1 ${onDark ? "bg-transparent" : "cursor-pointer"}`}
        >
          <option value="" className="text-ink">
            Select a service
          </option>
          {services.map((service) => (
            <option key={service.id || service.title} value={service.title} className="text-ink">
              {service.title}
            </option>
          ))}
          <option value="Other" className="text-ink">
            Something else
          </option>
        </select>
      </label>

      <label className="block">
        <span className={`caps ${label}`}>Tell us about the project *</span>
        <textarea
          rows={4}
          value={form.message}
          onChange={set("message")}
          className={`${field} mt-1 resize-none`}
          placeholder="Scope, area, timeline — as much or as little as you like."
        />
      </label>

      {error ? (
        <p className={`text-xs ${onDark ? "text-ivory/80" : "text-destructive"}`}>{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        className={`inline-flex items-center gap-4 px-8 py-4 caps transition-colors duration-500 disabled:opacity-60 ${
          onDark
            ? "bg-ivory text-ink hover:bg-sand"
            : "bg-ink text-ivory hover:bg-mocha"
        }`}
      >
        {sending ? <Loader2 size={13} className="animate-spin" /> : null}
        {sending ? "Sending" : "Send enquiry"}
        <span className="h-px w-6 bg-current" />
      </button>
    </form>
  );
}