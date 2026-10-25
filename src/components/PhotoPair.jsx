import SecureImage from "./SecureImage";

/** Always shows the ORIGINAL; the automatically cleaned copy sits next to it, clearly labelled. */
export default function PhotoPair({ kind, id, hasRestored, label = "" }) {
  return (
    <div>
      <div className="photos">
        <figure>
          <SecureImage path={`/api/files/${kind}/${id}/original`} alt={`${label} original photo`} />
          <figcaption>Original (the real photo)</figcaption>
        </figure>
        {hasRestored && (
          <figure>
            <SecureImage path={`/api/files/${kind}/${id}/restored`} alt={`${label} cleaned photo`} />
            <figcaption>Cleaned automatically</figcaption>
          </figure>
        )}
      </div>
      {hasRestored && (
        <p className="muted">
          Automatic cleanup can subtly change a face. Always rely on the original photo when deciding who someone is.
        </p>
      )}
    </div>
  );
}
