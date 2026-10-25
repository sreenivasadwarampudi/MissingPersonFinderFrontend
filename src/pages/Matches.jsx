import { useEffect, useState } from "react";
import { api } from "../api";
import { MapView } from "../components/Maps";
import PhotoPair from "../components/PhotoPair";
import { ErrorBox, fmt, StatusBadge } from "../components/ui";

export default function Matches({ config }) {
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.get("/api/matches/mine").then(setMatches).catch((e) => setError(e.message));
  useEffect(() => {
    load();
  }, []);

  async function feedback(id, outcome) {
    const text = outcome === "reunited" ? "Confirm that you have been reunited with this person?" : "Tell us this is not the person you are looking for?";
    if (!window.confirm(text)) return;
    try {
      await api.post(`/api/matches/${id}/feedback`, { outcome });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <>
      <h1>Matches</h1>
      <ErrorBox error={error} />
      {matches === null ? <p>Loading…</p> : matches.length === 0 ? (
        <p className="muted">No matches yet. We will email you if our team confirms one. Details are only ever shown here, after you sign in.</p>
      ) : (
        matches.map((m) => (
          <div className="card" key={m.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <h3>Possible match for {m.missing_name}</h3>
              <StatusBadge status={m.status} />
            </div>

            {m.status === "pending" ? (
              <p>
                The software found a possible match. A moderator is comparing the photos now. For everyone's safety, no details are shared until
                they confirm it. We will email you.
              </p>
            ) : (
              <>
                <div className="notice">
                  <strong>Please stay safe.</strong> Do not go to this place alone and do not confront anyone. Contact your local police station
                  {m.routed_to || config.ngo_name ? <> or <strong>{m.routed_to || config.ngo_name}</strong></> : " or the NGO/helpline you are working with"}
                  {config.ngo_contact && <> ({config.ngo_contact})</>} and show them this page.
                </div>
                <p className="muted">Confirmed by our team. Similarity score {m.score} (a guide for reviewers, not proof).</p>
                {m.moderator_note && <p><strong>Reviewer note:</strong> {m.moderator_note}</p>}

                {m.sighting && (
                  <>
                    <h3>Where and when</h3>
                    <p>
                      Seen {fmt(m.sighting.seen_at)}
                      {m.sighting.address ? <> near <strong>{m.sighting.address}</strong></> : m.sighting.area_label ? <> in <strong>{m.sighting.area_label}</strong></> : null}
                      {m.sighting.note && <><br />Reporter's note: {m.sighting.note}</>}
                    </p>
                    {m.sighting.lat != null ? <MapView lat={m.sighting.lat} lng={m.sighting.lng} small /> : <p className="muted">No location was provided with this report.</p>}
                    <h3 style={{ marginTop: "1rem" }}>Photo from the report</h3>
                    <PhotoPair kind="sighting" id={m.sighting.id} hasRestored={m.sighting.has_restored} label="Sighting" />
                  </>
                )}

                {m.family_feedback ? (
                  <p><span className="badge ok">You answered: {m.family_feedback === "reunited" ? "reunited" : "not them"}</span></p>
                ) : (
                  <div className="row">
                    <button className="btn small" onClick={() => feedback(m.id, "reunited")}>This is them: we are reunited</button>
                    <button className="btn secondary small" onClick={() => feedback(m.id, "not_them")}>This is not them</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}
    </>
  );
}
