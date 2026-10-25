import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { ErrorBox } from "../components/ui";

export default function Login() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [accept, setAccept] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function requestCode(e) {
    e?.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.post("/api/auth/request-otp", { email });
      setDevOtp(r.dev_otp || null);
      setStep("code");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await api.post("/api/auth/verify-otp", { email, code, accept_privacy: accept });
      login(r.token, r.user);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message === "privacy_consent_required" ? "Please tick the box to accept the privacy policy." : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 460, margin: "0 auto" }}>
      <h2>Sign in</h2>
      <p className="muted">We use a one-time code, so there is no password to remember or leak.</p>
      <ErrorBox error={error} />

      {step === "email" ? (
        <form onSubmit={requestCode}>
          <label htmlFor="email">Email address</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <p style={{ marginTop: "1rem" }}>
            <button className="btn" disabled={busy}>{busy ? "Sending…" : "Send me a code"}</button>
          </p>
        </form>
      ) : (
        <form onSubmit={verify}>
          <p>We sent a 6-digit code to <strong>{email}</strong>.</p>
          {devOtp && <div className="notice info">Development mode: your code is <strong>{devOtp}</strong></div>}
          <label htmlFor="code">6-digit code</label>
          <input id="code" inputMode="numeric" pattern="\d{6}" maxLength={6} required autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          <label className="check">
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
            <span>I have read and accept the <Link to="/privacy" target="_blank">privacy policy</Link>. (Needed the first time you sign in.)</span>
          </label>
          <div className="row">
            <button className="btn" disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Sign in"}</button>
            <button type="button" className="btn secondary" onClick={requestCode} disabled={busy}>Send a new code</button>
          </div>
        </form>
      )}
    </div>
  );
}
