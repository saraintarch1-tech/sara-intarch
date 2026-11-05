import { ArrowUpRight } from "lucide-react";
import Eyebrow from "@/components/site/Eyebrow";
import Reveal from "@/components/site/Reveal";
import ContactForm from "@/components/site/ContactForm";

const whatsappHref = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};

export default function ContactSection({ content, services = [] }) {
  const channels = [
    { label: "Email", value: content?.email, href: content?.email ? `mailto:${content.email}` : "" },
    {
      label: "WhatsApp",
      value: content?.whatsapp,
      href: whatsappHref(content?.whatsapp),
    },
    {
      label: "Instagram",
      value: content?.instagram_handle,
      href: content?.instagram,
    },
  ].filter((channel) => channel.href);

  return (
    <section
      id="contact"
      className="scroll-mt-24 bg-mocha px-5 py-24 text-ivory md:px-10 md:py-32 grain relative"
    >
      <div className="relative mx-auto grid max-w-[1600px] gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <Eyebrow tone="ivory">{content?.contact_eyebrow || "Enquiries"}</Eyebrow>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-7 max-w-[16ch] font-display text-[clamp(2.2rem,4.6vw,4rem)] leading-[1.02]">
              {content?.contact_title || "Let's begin a conversation"}
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-6 max-w-sm text-[14px] leading-[1.9] text-ivory/60">
              {content?.contact_intro ||
                "Tell us about the space, the brief and the timeline. We reply to every enquiry personally."}
            </p>
          </Reveal>

          <div className="mt-12 space-y-6">
            {channels.map((channel, i) => (
              <Reveal key={channel.label} delay={0.06 * i}>
                <a
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center justify-between border-b border-ivory/15 pb-4"
                >
                  <span className="caps text-ivory/40">{channel.label}</span>
                  <span className="flex items-center gap-3 text-sm text-ivory/85 transition-colors group-hover:text-ivory">
                    {channel.value}
                    <ArrowUpRight
                      size={13}
                      className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </a>
              </Reveal>
            ))}
            {[content?.address, [content?.city, content?.country].filter(Boolean).join(", ")]
              .filter(Boolean)
              .map((line) => (
                <p key={line} className="text-sm text-ivory/50">
                  {line}
                </p>
              ))}
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <Reveal delay={0.1}>
            <ContactForm onDark services={services} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}