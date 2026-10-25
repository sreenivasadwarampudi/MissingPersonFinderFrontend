const LABELS = {
  processing: ["Processing…", "wait"],
  pending_review: ["Awaiting review", "wait"],
  active: ["Active", "ok"],
  no_face: ["No face found", "bad"],
  failed: ["Processing failed", "bad"],
  rejected: ["Not approved", "bad"],
  found: ["Found", "ok"],
  closed: ["Closed", ""],
  pending: ["Under review", "wait"],
  confirmed: ["Confirmed", "ok"],
};

export function StatusBadge({ status }) {
  const [text, tone] = LABELS[status] || [status, ""];
  return <span className={`badge ${tone}`}>{text}</span>;
}

export const fmt = (d) => (d ? new Date(d).toLocaleString() : "");

export function ErrorBox({ error }) {
  return error ? <div className="error" role="alert">{error}</div> : null;
}

export const STATUS_HELP = {
  no_face: "We could not find a clear face in this photo. Please delete it and upload a sharper, front-facing one.",
  failed: "Something went wrong while processing this photo. Please delete it and try again.",
  rejected: "Our team could not approve this record.",
};
