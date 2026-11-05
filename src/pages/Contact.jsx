import { ArrowUpRight } from "lucide-react";
import SiteShell from "@/components/site/SiteShell";
import Eyebrow from "@/components/site/Eyebrow";
import Reveal from "@/components/site/Reveal";
import ContactForm from "@/components/site/ContactForm";
import { useServices, useSiteContent } from "@/hooks/useSite";
import usePageMeta from "@/hooks/usePageMeta";

const whatsappHref = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};

export default function Contact() {
  const { content } = useSiteContent();
  const { services } = useServices();

  usePageMeta(
    `Contact — ${content.brand_name || "SARA INTARCH"}`,
    content.contact_intro || "Enquiries for interior architecture and design projects."
  );

  const channels = [
    { label: "Email", value: content.email, href: content.email ? `mailto:${content.email}` : "" },
    { label: "WhatsApp", value: content.whatsapp, href: whatsappHref(content.whatsapp) },
    { label: "Instagram", value: content.instagram_handle, href: content.instagram },
    { label: "Behance", value: "Portfolio", href: content.behance },
    { label: "LinkedIn", value: "Profile", href: content.linkedin },
  ].filter((channel) => channel.href);

  return (
    <SiteShell content={content}>
      <section className="px-5 pt-32 md:px-10 md:pt-44">
        <div className="mx-auto max-w-[1600px]">
          <Eyebrow>{content.contact_eyebrow || "Enquiries"}</Eyebrow>
          <div className="mt-10 grid gap-10 md:grid-cols-12 md:items-end">
            <h1 className="md:col-span-7 font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.98]">
              {content.contact_title || "Let's begin a conversation"}
            </h1>
            <p className="md:col-span-4 md:col-start-9 max-w-sm text-[15px] leading-[1.9] text-ink-soft">
              {content.contact_intro ||
                "Tell us about the space, the brief and the timeline. We reply to every enquiry personally."}
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 pb-28 pt-16 md:px-10 md:pb-36 md:pt-24">
        <div className="mx-auto grid max-w-[1600px] gap-16 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-4">
            <div className="space-y-6">
              {channels.map((channel, i) => (
                <Reveal key={channel.label} delay={0.05 * i}>
                  <a
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="group flex items-center justify-between border-b border-ink/15 pb-4"
                  >
                    <span className="caps text-stone">{channel.label}</span>
                    <span className="flex items-center gap-3 text-sm text-ink transition-colors group-hover:text-mocha">
                      {channel.value}
                      <ArrowUpRight
                        size={13}
                        className="text-stone transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </a>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 space-y-2">
              {[content.address, [content.city, content.country].filter(Boolean).join(", ")]
                .filter(Boolean)
                .map((line) => (
                  <p key={line} className="text-sm text-ink-soft">
                    {line}
                  </p>
                ))}
            </div>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            <Reveal>
              <ContactForm services={services} />
            </Reveal>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}