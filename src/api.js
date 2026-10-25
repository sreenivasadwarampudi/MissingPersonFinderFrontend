const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

let token = localStorage.getItem("token");

export const getToken = () => token;
export function setToken(t) {
  token = t;
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

async function errorMessage(res) {
  try {
    const j = await res.json();
    if (Array.isArray(j.detail)) return j.detail.map((d) => `${d.loc?.slice(-1)[0] ?? "field"}: ${d.msg}`).join("; ");
    if (typeof j.detail === "string") return j.detail;
  } catch {
    /* not JSON */
  }
  return res.statusText || "Something went wrong";
}

async function request(path, { method = "GET", body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, "Cannot reach the server. Check your connection and try again.");
  }
  if (res.status === 401 && token) {
    setToken(null);
    window.dispatchEvent(new Event("auth-expired"));
  }
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res));
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: "POST", body }),
  postForm: (p, form) => request(p, { method: "POST", form }),
  del: (p) => request(p, { method: "DELETE" }),
};

/** Photos are private: fetch them with the auth header and show them from a blob URL. */
export async function fetchBlob(path) {
  const res = await fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) throw new ApiError(res.status, "Image unavailable");
  return res.blob();
}
