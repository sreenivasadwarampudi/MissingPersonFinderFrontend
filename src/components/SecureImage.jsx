import { useEffect, useState } from "react";
import { fetchBlob } from "../api";

/** <img> for private photos: loads through the authenticated API, never from a public URL. */
export default function SecureImage({ path, alt }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url;
    let cancelled = false;
    setSrc(null);
    setFailed(false);
    fetchBlob(path)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [path]);

  if (failed) return <div className="photo-ph">Photo unavailable</div>;
  if (!src) return <div className="photo-ph">Loading…</div>;
  return <img src={src} alt={alt} />;
}
