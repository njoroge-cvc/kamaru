import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthShell, Spinner } from "../components/ui";
import { unsubscribeNewsletter } from "../api";
import { useSeo } from "../utils/seo";

/** Landing page for the one-click unsubscribe link in newsletters. */
const UnsubscribePage = () => {
  useSeo({ title: "Unsubscribe", path: "/unsubscribe", noindex: true });
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    if (!token) return setState({ status: "error", message: "This link is missing its code." });
    unsubscribeNewsletter(token)
      .then((r) => setState({ status: "done", email: r.data.email }))
      .catch((err) => setState({ status: "error", message: err.response?.data?.error || "Something went wrong. Please try again." }));
  }, [token]);

  return (
    <AuthShell
      title={state.status === "done" ? "You've been unsubscribed" : state.status === "error" ? "Couldn't unsubscribe" : "Unsubscribing…"}
      footer={<Link to="/" className="font-semibold text-ochre hover:text-earth">Back to the site</Link>}
    >
      {state.status === "loading" && <div className="flex justify-center py-6"><Spinner className="h-8 w-8" /></div>}
      {state.status === "done" && (
        <div className="space-y-3 text-earth-700">
          <p><strong>{state.email}</strong> won't receive Kamaru Challenge newsletters any more.</p>
          <p>Changed your mind? Sign up again any time from the newsletter box at the bottom of the site.</p>
        </div>
      )}
      {state.status === "error" && <p className="text-earth-700">{state.message}</p>}
    </AuthShell>
  );
};

export default UnsubscribePage;
