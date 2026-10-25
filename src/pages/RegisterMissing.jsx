import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import PhotoField from "../components/PhotoField";
import { ErrorBox } from "../components/ui";

export default function RegisterMissing() {
  const [file, setFile] = useState(null);
  const [f, setF] = useState({ full_name: "", age: "", gender: "", last_seen_place: "", last_seen_date: "", description: "", contact_phone: "" });
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      Object.entries(f).forEach(([k, v]) => v !== "" && form.append(k, v)); // omit empty optional fields
      form.append("consent", consent ? "true" : "false");
      await api.postForm("/api/missing", form);
      navigate("/records", { state: { notice: "Record submitted. A moderator will review it before it can be matched." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Register a missing person</h2>
      <p className="muted">Only register someone you are genuinely searching for and are entitled to search for. Every record is reviewed by a person.</p>
      <ErrorBox error={error} />

      <PhotoField file={file} onChange={setFile} label="Clear photo of the missing person" />

      <label htmlFor="name">Full name</label>
      <input id="name" type="text" required maxLength={120} value={f.full_name} onChange={set("full_name")} />

      <div className="grid2">
        <div>
          <label htmlFor="age">Age (when last seen)</label>
          <input id="age" type="number" min={0} max={120} value={f.age} onChange={set("age")} />
        </div>
        <div>
          <label htmlFor="gender">Gender</label>
          <select id="gender" value={f.gender} onChange={set("gender")}>
            <option value="">Prefer not to say</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="grid2">
        <div>
          <label htmlFor="place">Last seen (place)</label>
          <input id="place" type="text" maxLength={200} value={f.last_seen_place} onChange={set("last_seen_place")} />
        </div>
        <div>
          <label htmlFor="date">Last seen (date)</label>
          <input id="date" type="date" value={f.last_seen_date} onChange={set("last_seen_date")} />
        </div>
      </div>

      <label htmlFor="desc">Distinguishing features</label>
      <textarea id="desc" maxLength={1000} placeholder="Scars, birthmarks, clothing, languages spoken…" value={f.description} onChange={set("description")} />

      <label htmlFor="phone">Phone number (optional)</label>
      <input id="phone" type="tel" maxLength={20} value={f.contact_phone} onChange={set("contact_phone")} />
      <p className="muted">Never shown to the public. Only moderators can see it.</p>

      <label className="check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          I am a family member or legal guardian (or authorised by one), I am allowed to share this photo, and I accept the{" "}
          <Link to="/privacy" target="_blank">privacy policy</Link>.
        </span>
      </label>

      <button className="btn" disabled={busy || !file || !consent}>{busy ? "Uploading…" : "Submit for review"}</button>
    </form>
  );
}
