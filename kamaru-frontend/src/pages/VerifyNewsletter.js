import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FaEnvelopeOpenText, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { verifyNewsletter } from "../api";
import { AuthShell, Spinner } from "../components/ui";

function VerifyNewsletter() {
  const [state, setState] = useState({ status: "loading", message: "Verifying your subscription…" });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setState({ status: "error", message: "This verification link is invalid." });
      return;
    }
    verifyNewsletter(token)
      .then((response) => setState({ status: "ok", message: response.data.message || "Verification successful" }))
      .catch((err) =>
        setState({ status: "error", message: err.response?.data?.error || "Verification failed. The link may have expired." })
      );
  }, [searchParams]);

  const Icon = state.status === "ok" ? FaCheckCircle : state.status === "error" ? FaTimesCircle : FaEnvelopeOpenText;
  const tone = state.status === "ok" ? "text-bead-green" : state.status === "error" ? "text-bead-red" : "text-kamaru";

  return (
    <AuthShell title="Newsletter" footer={<Link to="/" className="font-semibold text-ochre hover:text-earth">Back to the site</Link>}>
      <div className="py-4 text-center">
        <Icon className={`mx-auto text-5xl ${tone}`} />
        <p className="mt-4 text-lg font-semibold text-earth">{state.message}</p>
        {state.status === "loading" && <Spinner className="mt-4 h-6 w-6 text-kamaru" />}
      </div>
    </AuthShell>
  );
}

export default VerifyNewsletter;
