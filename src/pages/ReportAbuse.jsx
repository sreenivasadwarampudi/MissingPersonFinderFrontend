import { useState } from "react";
import { api } from "../api";
import { ErrorBox } from "../components/ui";

export default function ReportAbuse() {
  const [f, setF] = useState({ target_type: "other", target_id: "", reason: "", contact_email: "" });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post("/api/reports", {
        target_type: f.target_type,
        target_id: f.target_id.trim() || null,
        reason: f.reason,
        contact_email: f.contact_email.trim() || null,
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="card">
        <h2>Thank you</h2>
        <p>Your report was received and a moderator will review it. If you gave an email address we may contact you.</p>
      </div>
    );

  return (
    <form className="card" onSubmit={submit}>
      <h2>Report misuse or ask for removal</h2>
      <p className="muted">
        Use this if your photo or someone else's was uploaded without permission, if you think this service is being used to find someone who does not
        want to be found, or for any other problem. You do not need an account.
      </p>
      <ErrorBox error={error} />
      <label htmlFor="tt">What is this about?</label>
      <select id="tt" value={f.target_type} onChange={set("target_type")}>
        <option value="other">Something else / I am not sure</option>
        <option value="missing">A missing-person record</option>
        <option value="sighting">A sighting report</option>
      </select>
      <label htmlFor="tid">Reference ID (if you have one)</label>
      <input id="tid" type="text" maxLength={64} value={f.target_id} onChange={set("target_id")} />
      <label htmlFor="reason">What happened?</label>
      <textarea id="reason" required minLength={10} maxLength={2000} value={f.reason} onChange={set("reason")} />
      <label htmlFor="ce">Your email (optional, so we can reply)</label>
      <input id="ce" type="email" value={f.contact_email} onChange={set("contact_email")} />
      <p style={{ marginTop: "1rem" }}><button className="btn" disabled={busy}>{busy ? "Sending…" : "Send report"}</button></p>
    </form>
  );
}
