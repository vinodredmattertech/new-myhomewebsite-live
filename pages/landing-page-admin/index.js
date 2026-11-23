import { useCallback, useEffect, useMemo, useState } from "react";
import Head from "next/head";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LandingPageAdmin() {
  const [authed, setAuthed] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [leads, setLeads] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sources, setSources] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [q, setQ] = useState("");
  const [project, setProject] = useState("");
  const [source, setSource] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (project) params.set("project", project);
    if (source) params.set("source", source);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return params.toString();
  }, [q, project, source, from, to]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(
        `/api/landing-page-admin/leads${queryString ? `?${queryString}` : ""}`,
        { credentials: "include" }
      );
      if (res.status === 401) {
        setAuthed(false);
        setLeads([]);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data.message || "Failed to load leads");
        return;
      }
      setAuthed(true);
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setTotal(Number(data.total) || 0);
    } catch (err) {
      setLoadError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/landing-page-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoginError(data.message || "Login failed");
        return;
      }
      setPassword("");
      setAuthed(true);
      await loadLeads();
    } catch (err) {
      setLoginError(err.message || "Network error");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/landing-page-admin/logout", {
      method: "POST",
      credentials: "include",
    });
    setAuthed(false);
    setLeads([]);
  }

  function handleExport() {
    const url = `/api/landing-page-admin/leads?${
      queryString ? `${queryString}&` : ""
    }format=csv`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <Head>
        <title>Landing Page Leads Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="lp-admin">
        <header className="lp-admin__header">
          <div>
            <p className="lp-admin__eyebrow">Shared admin</p>
            <h1>Landing page leads</h1>
          </div>
          {authed ? (
            <div className="lp-admin__actions">
              <button type="button" onClick={handleExport}>
                Export CSV
              </button>
              <button type="button" className="lp-admin__ghost" onClick={handleLogout}>
                Log out
              </button>
            </div>
          ) : null}
        </header>

        {authed === false ? (
          <form className="lp-admin__login" onSubmit={handleLogin}>
            <h2>Admin login</h2>
            <p>Enter the admin password to view landing-page leads.</p>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {loginError ? <p className="lp-admin__error">{loginError}</p> : null}
            <button type="submit" disabled={loggingIn}>
              {loggingIn ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : null}

        {authed ? (
          <>
            <section className="lp-admin__filters">
              <label>
                Project
                <select
                  value={project}
                  onChange={(e) => {
                    setProject(e.target.value);
                    setSource("");
                  }}
                >
                  <option value="">All landing pages</option>
                  {projects.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Search
                <input
                  type="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Name, email, phone, UTM…"
                />
              </label>
              <label>
                Lead source
                <select value={source} onChange={(e) => setSource(e.target.value)}>
                  <option value="">All sources</option>
                  {sources.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                From
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label>
                To
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
              <button type="button" onClick={loadLeads} disabled={loading}>
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </section>

            <p className="lp-admin__meta">
              Showing {leads.length} of {total} landing-page leads
            </p>
            {loadError ? <p className="lp-admin__error">{loadError}</p> : null}

            <div className="lp-admin__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>SN</th>
                    <th>Submitted</th>
                    <th>Project</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Form source</th>
                    <th>Source</th>
                    <th>Medium</th>
                    <th>Campaign name</th>
                    <th>Campaign id</th>
                    <th>Page</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={12}>No leads match the current filters.</td>
                    </tr>
                  ) : null}
                  {leads.map((lead, index) => (
                    <tr key={lead.id || `${lead.email}-${lead.submittedAt}`}>
                      <td>{index + 1}</td>
                      <td>{formatDate(lead.submittedAt || lead.createdAt)}</td>
                      <td>{lead.landingPageLabel || lead.project || "—"}</td>
                      <td>{lead.name || "—"}</td>
                      <td>{lead.email || "—"}</td>
                      <td>{lead.phone || "—"}</td>
                      <td>{lead.formSource || "—"}</td>
                      <td>{lead.utm_source || "—"}</td>
                      <td>{lead.utm_medium || "—"}</td>
                      <td>{lead.utm_campaign || "—"}</td>
                      <td>{lead.utm_campaign_id || "—"}</td>
                      <td className="lp-admin__url" title={lead.pageUrl}>
                        {lead.pageUrl || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {authed === null ? <p className="lp-admin__meta">Checking session…</p> : null}
      </div>

      <style jsx global>{`
        .lp-admin {
          min-height: 100vh;
          padding: 32px 24px 64px;
          background:
            radial-gradient(circle at top left, rgba(87, 116, 134, 0.18), transparent 40%),
            linear-gradient(180deg, #f7f4ef 0%, #ece7df 100%);
          color: #1a1a18;
          font-family: "PT Serif", Georgia, serif;
        }
        .lp-admin__header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 28px;
        }
        .lp-admin__eyebrow {
          margin: 0 0 4px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 12px;
          color: #577486;
        }
        .lp-admin h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 400;
        }
        .lp-admin__actions {
          display: flex;
          gap: 10px;
        }
        .lp-admin button {
          border: 0;
          background: #577486;
          color: #fff;
          padding: 10px 16px;
          cursor: pointer;
          font: inherit;
        }
        .lp-admin__ghost {
          background: transparent !important;
          color: #577486 !important;
          border: 1px solid #577486 !important;
        }
        .lp-admin__login {
          max-width: 420px;
          margin: 80px auto 0;
          padding: 28px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(26, 26, 24, 0.08);
        }
        .lp-admin__login h2 {
          margin: 0 0 8px;
          font-weight: 400;
        }
        .lp-admin label {
          display: grid;
          gap: 6px;
          margin: 14px 0;
          font-size: 14px;
        }
        .lp-admin input,
        .lp-admin select {
          padding: 10px 12px;
          border: 1px solid rgba(26, 26, 24, 0.18);
          background: #fff;
          font: inherit;
        }
        .lp-admin__filters {
          display: grid;
          grid-template-columns: 1.2fr 1.6fr 1.4fr 1fr 1fr auto;
          gap: 12px;
          align-items: end;
          margin-bottom: 16px;
        }
        .lp-admin__meta {
          margin: 0 0 12px;
          color: #4a4a45;
        }
        .lp-admin__error {
          color: #8a1f1f;
        }
        .lp-admin__table-wrap {
          max-height: calc(100vh - 280px);
          overflow: auto;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(26, 26, 24, 0.08);
          -webkit-overflow-scrolling: touch;
        }
        .lp-admin table {
          width: max-content;
          min-width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .lp-admin th,
        .lp-admin td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(26, 26, 24, 0.08);
          text-align: left;
          vertical-align: top;
          white-space: nowrap;
        }
        .lp-admin th {
          position: sticky;
          top: 0;
          z-index: 1;
          background: #e4ebef;
          font-weight: 600;
        }
        .lp-admin__url {
          max-width: 240px;
          white-space: normal;
          word-break: break-word;
        }
        @media (max-width: 1100px) {
          .lp-admin__filters {
            grid-template-columns: 1fr 1fr;
          }
          .lp-admin__header {
            flex-direction: column;
          }
        }
        @media (max-width: 640px) {
          .lp-admin__filters {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

LandingPageAdmin.getLayout = (page) => page;
LandingPageAdmin.formPage = true;
LandingPageAdmin.ownFloatingActions = true;
LandingPageAdmin.disableLiveChat = true;
