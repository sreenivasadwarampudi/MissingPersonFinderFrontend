import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { api } from "./api";
import { useAuth } from "./auth";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Matches from "./pages/Matches";
import MyRecords from "./pages/MyRecords";
import Privacy from "./pages/Privacy";
import RegisterMissing from "./pages/RegisterMissing";
import ReportAbuse from "./pages/ReportAbuse";
import ReportSighting from "./pages/ReportSighting";

function RequireAuth({ children, moderator }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="page">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (moderator && user.role !== "moderator") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, logout } = useAuth();
  const [config, setConfig] = useState({});

  useEffect(() => {
    api.get("/api/config").then(setConfig).catch(() => {});
  }, []);

  return (
    <>
      <nav className="nav" aria-label="Main">
        <Link to="/" className="brand">{config.app_name || "Reunite"}</Link>
        {user && <NavLink to="/records">My records</NavLink>}
        {user && <NavLink to="/matches">Matches</NavLink>}
        {user?.role === "moderator" && <NavLink to="/admin">Review</NavLink>}
        <NavLink to="/report-abuse">Report a problem</NavLink>
        {user ? <button onClick={logout}>Sign out</button> : <NavLink to="/login">Sign in</NavLink>}
      </nav>
      <main className="page">
        <Routes>
          <Route path="/" element={<Home config={config} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/privacy" element={<Privacy config={config} />} />
          <Route path="/report-abuse" element={<ReportAbuse />} />
          <Route path="/missing/new" element={<RequireAuth><RegisterMissing /></RequireAuth>} />
          <Route path="/sighting/new" element={<RequireAuth><ReportSighting /></RequireAuth>} />
          <Route path="/records" element={<RequireAuth><MyRecords /></RequireAuth>} />
          <Route path="/matches" element={<RequireAuth><Matches config={config} /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth moderator><Admin /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
