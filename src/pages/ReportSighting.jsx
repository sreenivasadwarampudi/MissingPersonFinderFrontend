import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { LocationPicker } from "../components/Maps";
import PhotoField from "../components/PhotoField";
import { ErrorBox } from "../components/ui";

export default function ReportSighting() {
  const [file, setFile] = useState(null);
  const [loc, setLoc] = useState(null); // {lat, lng, accuracy, source}
  const [locMsg, setLocMsg] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function useDeviceLocation() {
    if (!navigator.geolocation) {
      setLocMsg("This browser cannot share its location. Drop a pin on the map instead.");
      setShowMap(true);
      return;
    }
    setLocMsg("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, source: "browser" });
        setLocMsg(`Using your device location (accurate to about ${Math.round(pos.coords.accuracy)} m).`);
      },
      () => {
        setLocMsg("Location permission was not given. Drop a pin on the map, or we will try the photo's own location data.");
        setShowMap(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function onPhoto(f) {
    setFile(f);
    if (f && !loc) useDeviceLocation(); // capture GPS at upload time
  }

  function pickOnMap(lat, lng) {
    setLoc({ lat, lng, accuracy: null, source: "map" });
    setLocMsg("Using the pin you placed on the map.");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      if (loc) {
        form.append("lat", loc.lat);
        form.append("lng", loc.lng);
        form.append("location_source", loc.source);
        if (loc.accuracy != null) form.append("accuracy_m", loc.accuracy);
      }
      if (note.trim()) form.append("note", note.trim());
      form.append("consent", consent ? "true" : "false");
      await api.postForm("/api/sightings", form);
      navigate("/records", { state: { notice: "Thank you. Your report was received and is private. You will not be shown any matches: our team handles those." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2>Report someone you saw</h2>
      <div className="notice">
        Do not approach, follow or confront the person. Photograph only from a safe, public place, and only if it is legal and respectful to do so.
        If they seem to be in danger, call <strong>112</strong>.
      </div>
      <ErrorBox error={error} />

      <PhotoField file={file} onChange={onPhoto} label="Photo of the person" />

      <label>Where was this?</label>
      <div className="row">
        <button type="button" className="btn secondary small" onClick={useDeviceLocation}>Use my current location</button>
        <button type="button" className="btn secondary small" onClick={() => setShowMap((s) => !s)}>{showMap ? "Hide map" : "Pick on map"}</button>
      </div>
      <p className="muted" aria-live="polite">
        {locMsg || "If you do not set a location we will try to read it from the photo. Your exact location is never shown publicly."}
      </p>
      {showMap && <LocationPicker value={loc} onPick={pickOnMap} />}

      <label htmlFor="note">Anything that helps? (optional)</label>
      <textarea id="note" maxLength={500} placeholder="Time of day, what they were doing, who they were with…" value={note} onChange={(e) => setNote(e.target.value)} />

      <label className="check">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          I took this photo (or may share it), and I accept the <Link to="/privacy" target="_blank">privacy policy</Link>.
        </span>
      </label>

      <button className="btn" disabled={busy || !file || !consent}>{busy ? "Uploading…" : "Send report"}</button>
    </form>
  );
}
