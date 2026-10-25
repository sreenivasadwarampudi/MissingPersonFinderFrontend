import { Link } from "react-router-dom";

export default function Home({ config }) {
  return (
    <>
      <section className="hero">
        <h1>Helping missing people find their way home</h1>
        <p>
          Families register the person they are looking for. Members of the public can report someone they have seen.
          Software suggests possible matches, and a trained human reviews every one before anyone is contacted.
        </p>
      </section>

      <div className="grid2">
        <Link to="/missing/new" className="big-choice">
          <h3>I am looking for someone</h3>
          <p className="muted">Register a missing relative with a clear photo. You will be told if a reviewed match appears.</p>
        </Link>
        <Link to="/sighting/new" className="big-choice">
          <h3>I saw someone who may be missing</h3>
          <p className="muted">Upload a photo with where you saw them. Your report is kept private and reviewed by our team.</p>
        </Link>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2>How it works</h2>
        <ol className="steps">
          <li>Sign in with a one-time code sent to your email.</li>
          <li>A family registers a record. A moderator approves it before it can be matched.</li>
          <li>Someone reports a sighting with a photo and a location (GPS, map pin, or the photo's own location).</li>
          <li>The software compares faces and suggests candidates. It never decides.</li>
          <li>A moderator compares the photos and confirms or rejects. Only then does the family see where the person was seen.</li>
          <li>Confirmed matches are routed through the police or a partner NGO{config.ngo_name ? ` (${config.ngo_name})` : ""}.</li>
        </ol>
      </div>

      <div className="notice">
        <strong>Safety first.</strong> If someone is in immediate danger, call <strong>112</strong>. For a missing child you can also call{" "}
        <strong>Childline 1098</strong>. File a police complaint as well: this service supports the police, it does not replace them. Never
        approach or confront a person you think may be missing.
      </div>
      <p className="muted">
        We never show exact locations publicly. <Link to="/privacy">Privacy &amp; consent</Link> ·{" "}
        <Link to="/report-abuse">Report misuse or ask for removal</Link>
      </p>
    </>
  );
}
