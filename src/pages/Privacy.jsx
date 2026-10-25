import { Link } from "react-router-dom";

export default function Privacy({ config }) {
  const contact = config.grievance_email || "the contact address of the operator";
  return (
    <div className="card">
      <h1>Privacy &amp; consent</h1>
      <div className="notice">
        This is a starting template written for a prototype. Before going live, have a lawyer adapt it to your organisation and to India's Digital Personal
        Data Protection Act, 2023 (DPDP Act).
      </div>

      <h2>What we collect and why</h2>
      <ul>
        <li><strong>Email address</strong>: to sign you in with a one-time code and to tell you about confirmed matches.</li>
        <li><strong>Photos</strong> of missing persons (uploaded by families) and of people seen (uploaded by the public): to compare faces and suggest possible matches to a human reviewer.</li>
        <li><strong>Face templates</strong> (numbers computed from a face): to do the comparison. They are deleted with the photo.</li>
        <li><strong>Location</strong> of a sighting (device GPS, a map pin, or the photo's own data): to help reunite the person. The exact location is visible only to moderators and, after a moderator confirms a match, to the family concerned.</li>
        <li><strong>Details the family enters</strong> (name, age, description, optional phone number).</li>
      </ul>

      <h2>Who sees what</h2>
      <ul>
        <li>The public sees nothing. There is no public gallery and no public map.</li>
        <li>People who report a sighting never see family details, and are not told about any match.</li>
        <li>Families see a match only after a human moderator confirms it.</li>
        <li>Moderators see photos, locations and contact details to do their review. Their actions are logged.</li>
        <li>Where possible, confirmed matches are passed to the police or a partner NGO.</li>
      </ul>

      <h2>Automatic photo cleanup</h2>
      <p>
        We may enhance low-quality photos automatically. This can slightly change how a face looks, so we always keep and show the original next to the cleaned
        copy, and we discard a cleaned copy that no longer resembles the original.
      </p>

      <h2>Services that receive limited data</h2>
      <ul>
        <li>OpenStreetMap / Nominatim: receives coordinates to turn them into an address. Map tiles are loaded from OpenStreetMap, which sees your IP address.</li>
        <li>Email provider: receives your email address to deliver sign-in codes and notices.</li>
        <li>Photos are only sent to a third-party image-cleanup service if the operator has explicitly enabled that and told you so here.</li>
      </ul>

      <h2>Your rights</h2>
      <ul>
        <li>You can delete any record or report you made, or your whole account and all its data, from <Link to="/records">My records</Link>.</li>
        <li>If your photo was uploaded by someone else, <Link to="/report-abuse">ask for its removal</Link>. You do not need an account.</li>
        <li>Concerns or complaints: {contact}.</li>
      </ul>

      <h2>Keeping data</h2>
      <p>Records are kept until they are closed or deleted. Operators should set and publish a retention period for closed records.</p>
    </div>
  );
}
