import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Logo from "@/components/brand/Logo";

export default function Footer({ content }) {
  const social = [
    { label: content?.instagram_handle || "Instagram", url: content?.instagram },
    { label: "Behance", url: content?.behance },
    { label: "LinkedIn", url: content?.linkedin },
  ].filter((item) => item.url);

  const place = [content?.city, content?.country].filter(Boolean).join(", ");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-mocha text-ivory grain relative overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-5 pb-10 pt-20 md:px-10 md:pb-12 md:pt-28">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo
              name={content?.brand_name}
              tagline={content?.brand_tagline}
              logoUrl={content?.logo_url}
              size="lg"
              tone="ivory"
            />
            <p className="mt-8 max-w-xs text-sm leading-[1.9] text-ivory/60">
              {content?.footer_note ||
                "Interior architecture and interiors for spaces that feel inevitable."}
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <div className="caps text-ivory/40">Navigate</div>
            <ul className="mt-5 space-y-3">
              {(content?.nav_items?.length
                ? content.nav_items.filter((item) => item.visible !== false)
                : [
                    { label: "Work", path: "/work" },
                    { label: "Contact", path: "/contact" },
                  ]
              ).map((item) => (
                <li key={`${item.label}-${item.path}`}>
                  <Link to={item.path} className="link-line text-sm text-ivory/70 hover:text-ivory">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <div className="caps text-ivory/40">Enquiries</div>
            <ul className="mt-5 space-y-3 text-sm text-ivory/70">
              {content?.email ? (
                <li>
                  <a href={`mailto:${content.email}`} className="link-line hover:text-ivory">
                    {content.email}
                  </a>
                </li>
              ) : null}
              {content?.phone ? <li>{content.phone}</li> : null}
              {place ? <li className="text-ivory/50">{place}</li> : null}
            </ul>
            {social.length > 0 && (
              <ul className="mt-7 space-y-2">
                {social.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-2 caps text-ivory/60 hover:text-ivory"
                    >
                      {item.label}
                      <ArrowUpRight
                        size={11}
                        className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-ivory/15 pt-6 md:mt-24 md:flex-row md:items-center md:justify-between">
          <span className="caps text-ivory/40">
            {content?.footer_copyright || `© ${year} ${content?.brand_name || "SARA INTARCH"}`}
          </span>
          <div className="flex items-center gap-6">
            <span className="caps text-ivory/30">Interior Architecture Studio</span>
            <Link to="/admin" className="caps text-ivory/40 hover:text-ivory">
              Studio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}