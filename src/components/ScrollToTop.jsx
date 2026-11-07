
import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const getHashId = (hash) => {
  const rawId = hash.slice(1);

  try {
    return decodeURIComponent(rawId);
  } catch {
    return rawId;
  }
};

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    let attempts = 0;
    let timer;

    const scrollToTarget = () => {
      if (hash) {
        const id = getHashId(hash);
        const target = document.getElementById(id);

        if (target) {
          target.scrollIntoView({
            behavior: "auto",
            block: "start",
          });
          return true;
        }

        return false;
      }

      if (navigationType !== "POP") {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }

      return true;
    };

    const tryScroll = () => {
      attempts++;

      if (scrollToTarget() || attempts >= 30) {
        return;
      }

      timer = window.setTimeout(tryScroll, 100);
    };

    timer = window.setTimeout(tryScroll, 100);

    return () => window.clearTimeout(timer);
  }, [pathname, hash, navigationType]);

  return null;
}
