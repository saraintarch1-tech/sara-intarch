import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { api } from "@/api/platformClient";
import { Monogram } from "@/components/brand/Logo";

export default function AdminGate({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let alive = true;
    api.auth
      .me()
      .then((user) => alive && setState({ loading: false, user }))
      .catch(() => alive && setState({ loading: false, user: null }));
    return () => {
      alive = false;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 size={18} className="animate-spin text-stone" />
      </div>
    );
  }

  if (!state.user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <Monogram className="h-14 w-14 text-ink" />
        <h1 className="mt-8 font-display text-3xl">Studio access</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          This area belongs to the studio. Sign in with your administrator account to manage the
          site.
        </p>
        <button
          type="button"
          onClick={() => api.auth.redirectToLogin("/admin")}
          className="mt-8 bg-ink px-8 py-3.5 caps text-ivory hover:bg-mocha"
        >
          Sign in
        </button>
        <Link to="/" className="mt-6 caps text-stone hover:text-ink">
          Back to the site
        </Link>
      </div>
    );
  }

  if (state.user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <h1 className="font-display text-3xl">No access</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          You are signed in as {state.user.email}, which is not an administrator account. Ask the
          studio owner to grant admin access.
        </p>
        <Link to="/" className="mt-8 bg-ink px-8 py-3.5 caps text-ivory hover:bg-mocha">
          Back to the site
        </Link>
      </div>
    );
  }

  return children;
}