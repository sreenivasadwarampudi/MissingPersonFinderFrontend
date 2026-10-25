import { useEffect, useState } from "react";

export default function PhotoField({ file, onChange, label = "Photo" }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div>
      <label htmlFor="photo">{label}</label>
      <input
        id="photo"
        type="file"
        accept="image/*"
        required
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
      <p className="muted">One person, face clearly visible, good light. JPEG/PNG/WebP, up to 10 MB.</p>
      {preview && <img className="preview" src={preview} alt="Selected photo preview" />}
    </div>
  );
}
