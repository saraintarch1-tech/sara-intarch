import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SiteShell from "@/components/site/SiteShell";
import Eyebrow from "@/components/site/Eyebrow";

export default function PageNotFound() {
  const location = useLocation();

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "prerender-status-code");
    meta.setAttribute("content", "404");
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, []);

  return (
    <SiteShell>
      <section className="px-5 pb-32 pt-40 md:px-10 md:pt-52">
        <div className="mx-auto grid max-w-[1600px] gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Eyebrow>Error 404</Eyebrow>
            <h1 className="mt-8 font-display text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[0.98]">
              This page has not been built.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-[1.9] text-ink-soft">
              The address <span className="text-ink">{location.pathname}</span> does not exist on
              this site. The work is all here, though.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link to="/work" className="bg-ink px-7 py-3.5 caps text-ivory hover:bg-mocha">
                View the work
              </Link>
              <Link to="/" className="link-line caps text-ink-soft hover:text-ink">
                Back to the studio
              </Link>
            </div>
          </div>
          <div className="md:col-span-3 md:col-start-10">
            <div className="font-display text-[clamp(4rem,9vw,8rem)] leading-none text-sand">404</div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}