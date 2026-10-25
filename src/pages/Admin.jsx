import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { MapView } from "../components/Maps";
import PhotoPair from "../components/PhotoPair";
import { ErrorBox, fmt } from "../components/ui";

const TABS = [
  ["matches", "Possible matches"],
  ["records", "Records to approve"],
  ["reports", "Reports"],
  ["audit", "Audit log"],
];

export default function Admin() {
  const [tab, setTab] = useState("matches");
  const [stats, setStats] = useState(null);
  const refreshStats = useCallback(() => api.get("/api/admin/stats").then(setStats).catch(() => {}), []);
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return (
    <>
      <h1>Review desk</h1>
      {stats && (
        <div className="stats">
          <div className="stat"><b>{stats.matches_pending}</b>matches to review</div>
          <div className="stat"><b>{stats.records_pending}</b>records to approve</div>
          <div className="stat"><b>{stats.reports_open}</b>open reports</div>
          <div className="stat"><b>{stats.records_active}</b>active records</div>
          <div className="stat"><b>{stats.matches_confirmed}</b>confirmed matches</div>
        </div>
      )}
      <div className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {tab === "matches" && <MatchQueue onChange={refreshStats} />}
      {tab === "records" && <RecordQueue onChange={refreshStats} />}
      {tab === "reports" && <ReportQueue onChange={refreshStats} />}
      {tab === "audit" && <AuditLog />}
    </>
  );
}

function useQueue(path, onChange) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(() => api.get(path).then(setItems).catch((e) => setError(e.message)), [path]);
  useEffect(() => {
    load();
  }, [load]);
  async function send(url, body) {
    setError("");
    try {
      await api.post(url, body);
      await load();
      onChange?.();
    } catch (e) {
      setError(e.message);
    }
  }
  return { items, error, send };
}

function MatchQueue({ onChange }) {
  const { items, error, send } = useQueue("/api/admin/matches?status=pending", onChange);
  return (
    <>
      <ErrorBox error={error} />
      {items === null ? <p>Loading…</p> : items.length === 0 ? <p className="muted">Nothing waiting. Nice.</p> : items.map((m) => <MatchCard key={m.id} m={m} send={send} />)}
    </>
  );
}

function MatchCard({ m, send }) {
  const [note, setNote] = useState("");
  const [routed, setRouted] = useState("");
  const s = m.sighting;
  const p = m.missing;
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3>{p.full_name}{p.age != null && `, ${p.age}`} · similarity {m.score}</h3>
        <span className="muted">{fmt(m.created_at)}</span>
      </div>
      <div className="notice">
        The score is only a suggestion. Compare the <strong>original</strong> photos yourself. Check that the face really matches and the details are consistent
        (age, features, place) before confirming. When in doubt, reject.
        {(p.embedding_source === "restored" || s.embedding_source === "restored") && " One photo was matched on its cleaned copy because the original had no detectable face: be extra careful."}
        {s.face_count > 1 && " The sighting photo contains several faces; the largest one was used."}
      </div>
      <div className="compare">
        <div>
          <h3>Family's record</h3>
          <PhotoPair kind="missing" id={p.id} hasRestored={p.has_restored} label="Family" />
          <p className="muted">{[p.gender, p.last_seen_place && `last seen ${p.last_seen_place}`, p.last_seen_date].filter(Boolean).join(" · ")}</p>
          {p.description && <p>{p.description}</p>}
        </div>
        <div>
          <h3>Sighting</h3>
          <PhotoPair kind="sighting" id={s.id} hasRestored={s.has_restored} label="Sighting" />
          <p className="muted">
            {fmt(s.seen_at)} · location from {s.location_source}{s.accuracy_m ? ` (±${Math.round(s.accuracy_m)} m)` : ""}
            {s.address && <><br />{s.address}</>}
          </p>
          {s.note && <p>"{s.note}"</p>}
          {s.lat != null && <MapView lat={s.lat} lng={s.lng} small />}
        </div>
      </div>
      <label htmlFor={`note-${m.id}`}>Reviewer note (shown to the family if confirmed)</label>
      <textarea id={`note-${m.id}`} value={note} maxLength={1000} onChange={(e) => setNote(e.target.value)} />
      <label htmlFor={`routed-${m.id}`}>Handled by (police station / NGO)</label>
      <input id={`routed-${m.id}`} type="text" maxLength={200} value={routed} onChange={(e) => setRouted(e.target.value)} />
      <div className="row" style={{ marginTop: "1rem" }}>
        <button className="btn" onClick={() => window.confirm("Confirm this match? The family will be shown the exact location and photo.") && send(`/api/admin/matches/${m.id}/decision`, { decision: "confirm", note, routed_to: routed })}>Confirm match</button>
        <button className="btn secondary" onClick={() => send(`/api/admin/matches/${m.id}/decision`, { decision: "reject", note })}>Not a match</button>
      </div>
    </div>
  );
}

function RecordQueue({ onChange }) {
  const { items, error, send } = useQueue("/api/admin/missing?status=pending_review", onChange);
  return (
    <>
      <ErrorBox error={error} />
      <div className="notice info">
        Approve only records that look genuine. Be wary of anyone registering an adult who may not want to be found (stalking, domestic abuse). If in doubt, reject and
        ask for a police report (FIR) reference.
      </div>
      {items === null ? <p>Loading…</p> : items.length === 0 ? <p className="muted">Nothing waiting.</p> : items.map((r) => <RecordCard key={r.id} r={r} send={send} />)}
    </>
  );
}

function RecordCard({ r, send }) {
  const [note, setNote] = useState("");
  return (
    <div className="card">
      <h3>{r.full_name}{r.age != null && `, ${r.age}`}</h3>
      <p className="muted">By {r.owner_email} · {fmt(r.created_at)} · {[r.gender, r.last_seen_place, r.contact_phone].filter(Boolean).join(" · ")}</p>
      {r.description && <p>{r.description}</p>}
      <PhotoPair kind="missing" id={r.id} hasRestored={r.has_restored} label={r.full_name} />
      <label htmlFor={`rn-${r.id}`}>Note (shown to the owner if rejected)</label>
      <input id={`rn-${r.id}`} type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="row" style={{ marginTop: "1rem" }}>
        <button className="btn" onClick={() => send(`/api/admin/missing/${r.id}/decision`, { decision: "approve", note })}>Approve</button>
        <button className="btn secondary" onClick={() => send(`/api/admin/missing/${r.id}/decision`, { decision: "reject", note })}>Reject</button>
      </div>
    </div>
  );
}

function ReportQueue({ onChange }) {
  const { items, error, send } = useQueue("/api/admin/reports?status=open", onChange);
  return (
    <>
      <ErrorBox error={error} />
      {items === null ? <p>Loading…</p> : items.length === 0 ? <p className="muted">No open reports.</p> : items.map((r) => (
        <div className="card" key={r.id}>
          <h3>{r.target_type}{r.target_id && ` · ${r.target_id}`}</h3>
          <p>{r.reason}</p>
          <p className="muted">{fmt(r.created_at)}{r.contact_email && ` · ${r.contact_email}`}</p>
          <div className="row">
            <button className="btn danger small" onClick={() => window.confirm("Permanently delete the reported record and its photos?") && send(`/api/admin/reports/${r.id}/resolve`, { action: "takedown" })}>Take down</button>
            <button className="btn secondary small" onClick={() => send(`/api/admin/reports/${r.id}/resolve`, { action: "dismiss" })}>Dismiss</button>
          </div>
        </div>
      ))}
    </>
  );
}

function AuditLog() {
  const { items, error } = useQueue("/api/admin/audit?limit=200");
  return (
    <>
      <ErrorBox error={error} />
      {items === null ? <p>Loading…</p> : (
        <table className="audit">
          <thead><tr><th>When</th><th>Action</th><th>Target</th><th>Actor</th><th>Detail</th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}><td>{fmt(a.created_at)}</td><td>{a.action}</td><td>{a.target?.slice(0, 8)}</td><td>{a.actor_id?.slice(0, 8)}</td><td>{a.detail}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
