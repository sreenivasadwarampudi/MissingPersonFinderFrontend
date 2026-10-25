import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import PhotoPair from "../components/PhotoPair";
import { ErrorBox, fmt, STATUS_HELP, StatusBadge } from "../components/ui";

export default function MyRecords() {
  const [missing, setMissing] = useState(null);
  const [sightings, setSightings] = useState(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const notice = useLocation().state?.notice;

  const load = useCallback(async () => {
    try {
      const [m, s] = await Promise.all([api.get("/api/missing/mine"), api.get("/api/sightings/mine")]);
      setMissing(m);
      setSightings(s);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // photos are processed in the background: poll until nothing is "processing"
  const anyProcessing = [...(missing || []), ...(sightings || [])].some((r) => r.status === "processing");
  useEffect(() => {
    if (!anyProcessing) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [anyProcessing, load]);

  async function act(fn, confirmText) {
    if (confirmText && !window.confirm(confirmText)) return;
    setError("");
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your account and everything you uploaded (records, photos, matches)? This cannot be undone.")) return;
    try {
      await api.del("/api/auth/me");
      logout();
      navigate("/");
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1>My records</h1>
      {notice && <div className="notice info">{notice}</div>}
      <ErrorBox error={error} />

      <h2>People I am looking for</h2>
      {missing === null ? <p>Loading…</p> : missing.length === 0 ? (
        <p className="muted">Nothing yet. <Link to="/missing/new">Register a missing person</Link>.</p>
      ) : (
        missing.map((m) => (
          <div className="card" key={m.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h3>{m.full_name}{m.age != null && `, ${m.age}`}</h3>
              <StatusBadge status={m.status} />
            </div>
            <p className="muted">Submitted {fmt(m.created_at)}{m.last_seen_place && ` · last seen ${m.last_seen_place}`}</p>
            {STATUS_HELP[m.status] && <p>{STATUS_HELP[m.status]}{m.review_note && ` Note: ${m.review_note}`}</p>}
            {m.status === "pending_review" && <p className="muted">A moderator is checking this record. Matching starts once it is approved.</p>}
            {m.status !== "processing" && <PhotoPair kind="missing" id={m.id} hasRestored={m.has_restored} label={m.full_name} />}
            <div className="row">
              {m.status === "active" && (
                <>
                  <button className="btn secondary small" onClick={() => act(() => api.post(`/api/missing/${m.id}/close`, { outcome: "found" }), "Mark this person as found?")}>Mark as found</button>
                  <button className="btn secondary small" onClick={() => act(() => api.post(`/api/missing/${m.id}/close`, { outcome: "closed" }), "Stop searching and close this record?")}>Close record</button>
                </>
              )}
              <button className="btn danger small" onClick={() => act(() => api.del(`/api/missing/${m.id}`), "Permanently delete this record and its photos?")}>Delete</button>
            </div>
          </div>
        ))
      )}

      <h2 style={{ marginTop: "2rem" }}>Sightings I reported</h2>
      {sightings === null ? <p>Loading…</p> : sightings.length === 0 ? (
        <p className="muted">Nothing yet. <Link to="/sighting/new">Report a sighting</Link>.</p>
      ) : (
        sightings.map((s) => (
          <div className="card" key={s.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h3>Reported {fmt(s.created_at)}</h3>
              <StatusBadge status={s.status} />
            </div>
            <p className="muted">
              Location: {s.location_source === "none" ? "not provided" : `${s.area_label || "recorded"} (from ${s.location_source === "browser" ? "device GPS" : s.location_source === "map" ? "map pin" : "photo data"})`}
            </p>
            {STATUS_HELP[s.status] && <p>{STATUS_HELP[s.status]}</p>}
            {s.status !== "processing" && <PhotoPair kind="sighting" id={s.id} hasRestored={s.has_restored} label="Sighting" />}
            <button className="btn danger small" onClick={() => act(() => api.del(`/api/sightings/${s.id}`), "Permanently delete this report and its photo?")}>Delete</button>
          </div>
        ))
      )}

      <div className="card" style={{ marginTop: "2rem" }}>
        <h3>Your data</h3>
        <p className="muted">You can delete everything you have uploaded at any time.</p>
        <button className="btn danger small" onClick={deleteAccount}>Delete my account and all my data</button>
      </div>
    </>
  );
}
