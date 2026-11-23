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
  const [projectCounts, setProjectCounts] = useState([]);
  const [sources, setSources] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState(() => new Set());

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
    setActionMsg("");
    try {
      const res = await fetch(
        `/api/landing-page-admin/leads${queryString ? `?${queryString}` : ""}`,
        { credentials: "include" }
      );
      if (res.status === 401) {
        setAuthed(false);
        setLeads([]);
        setSelected(new Set());
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setLoadError(data.message || "Failed to load leads");
        return;
      }
      setAuthed(true);
      const nextLeads = Array.isArray(data.leads) ? data.leads : [];
      setLeads(nextLeads);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setProjectCounts(
        Array.isArray(data.projectCounts) ? data.projectCounts : []
      );
      setSources(Array.isArray(data.sources) ? data.sources : []);
      setTotal(Number(data.total) || 0);
      setSelected((prev) => {
        const valid = new Set(
          nextLeads.map((l) => String(l.id)).filter(Boolean)
        );
        return new Set([...prev].filter((id) => valid.has(id)));
      });
    } catch (err) {
      setLoadError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const allVisibleSelected =
    leads.length > 0 &&
    leads.every((lead) => lead.id && selected.has(String(lead.id)));

  function toggleOne(id) {
    const key = String(id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        leads.forEach((lead) => {
          if (lead.id) next.delete(String(lead.id));
        });
      } else {
        leads.forEach((lead) => {
          if (lead.id) next.add(String(lead.id));
        });
      }
      return next;
    });
  }

  async function handleDeleteSelected() {
    const ids = [...selected];
    if (!ids.length) return;
    const ok = window.confirm(
      `Delete ${ids.length} selected lead${ids.length === 1 ? "" : "s"}? This cannot be undone.`
    );
    if (!ok) return;

    setDeleting(true);
    setActionMsg("");
    setLoadError("");
    try {
      const res = await fetch("/api/landing-page-admin/leads", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok && !(data.deleted || []).length) {
        const detail = (data.failed || [])
          .map((f) => f.error)
          .filter(Boolean)
          .slice(0, 2)
          .join(" · ");
        setLoadError(detail || data.message || "Failed to delete leads");
        return;
      }
      const deletedCount = (data.deleted || []).length;
      const failedCount = (data.failed || []).length;
      setActionMsg(
        failedCount
          ? `Deleted ${deletedCount}. ${failedCount} failed.`
          : `Deleted ${deletedCount} lead${deletedCount === 1 ? "" : "s"}.`
      );
      setSelected(new Set());
      await loadLeads();
    } catch (err) {
      setLoadError(err.message || "Network error");
    } finally {
      setDeleting(false);
    }
  }

  async function handleDeleteOne(id) {
    const key = String(id);
    const ok = window.confirm("Delete this lead? This cannot be undone.");
    if (!ok) return;
    setDeleting(true);
    setActionMsg("");
    setLoadError("");
    try {
      const res = await fetch("/api/landing-page-admin/leads", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [key] }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok && !(data.deleted || []).length) {
        const detail = (data.failed || [])
          .map((f) => f.error)
          .filter(Boolean)
          .slice(0, 2)
          .join(" · ");
        setLoadError(detail || data.message || "Failed to delete lead");
        return;
      }
      setActionMsg("Lead deleted.");
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      await loadLeads();
    } catch (err) {
      setLoadError(err.message || "Network error");
    } finally {
      setDeleting(false);
    }
  }

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
    setSelected(new Set());
  }

  async function handleExport() {
    setActionMsg("");
    setLoadError("");
    const selectedIds = [...selected];
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (project) params.set("project", project);
      if (source) params.set("source", source);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      // When rows are checked, export only those leads.
      if (selectedIds.length) params.set("ids", selectedIds.join(","));
      params.set("format", "csv");

      const res = await fetch(
        `/api/landing-page-admin/leads?${params.toString()}`,
        { credentials: "include" }
      );
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoadError(data.message || "Failed to export CSV");
        return;
      }

      const blob = await res.blob();
      const selectedProject =
        projects.find((p) => p.id === project) ||
        projectCounts.find((p) => p.id === project);
      const slug = selectedIds.length
        ? `selected-${selectedIds.length}`
        : selectedProject?.id || (project ? String(project) : "all");
      const date = new Date().toISOString().slice(0, 10);
      const filename = `landing-page-leads-${slug}-${date}.csv`;

      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);

      setActionMsg(
        selectedIds.length
          ? `Exported CSV for ${selectedIds.length} selected lead${
              selectedIds.length === 1 ? "" : "s"
            }.`
          : `Exported CSV for ${selectedProject?.label || "all projects"}.`
      );
    } catch (err) {
      setLoadError(err.message || "Failed to export CSV");
    }
  }

  function selectProjectCard(id) {
    setProject((prev) => (prev === id ? "" : id));
    setSource("");
  }

  return (
    <>
      <Head>
        <title>Landing Page Leads Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="lp-admin">
        <div className="lp-admin__shell">
          <header className="lp-admin__header">
            <div>
              <p className="lp-admin__eyebrow">My Home · Lead desk</p>
              <h1>Landing page leads</h1>
              <p className="lp-admin__sub">
                Filter by project, review UTM attribution, export or delete leads.
              </p>
            </div>
            {authed ? (
              <div className="lp-admin__actions">
                <button type="button" className="lp-admin__btn" onClick={handleExport}>
                  {selected.size
                    ? `Export CSV · ${selected.size} selected`
                    : project
                      ? `Export CSV · ${
                          projects.find((p) => p.id === project)?.label ||
                          projectCounts.find((p) => p.id === project)?.label ||
                          "project"
                        }`
                      : "Export CSV · All"}
                </button>
                <button
                  type="button"
                  className="lp-admin__btn lp-admin__btn--ghost"
                  onClick={handleLogout}
                >
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
              <button type="submit" className="lp-admin__btn" disabled={loggingIn}>
                {loggingIn ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : null}

          {authed ? (
            <>
              <section className="lp-admin__stats">
                <button
                  type="button"
                  className={`lp-admin__stat ${!project ? "is-active" : ""}`}
                  onClick={() => selectProjectCard("")}
                >
                  <span className="lp-admin__stat-label">All projects</span>
                  <strong className="lp-admin__stat-count">{total}</strong>
                  <span className="lp-admin__stat-hint">Total LP leads</span>
                </button>
                {projectCounts.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`lp-admin__stat ${
                      project === item.id ? "is-active" : ""
                    }`}
                    onClick={() => selectProjectCard(item.id)}
                  >
                    <span className="lp-admin__stat-label">{item.label}</span>
                    <strong className="lp-admin__stat-count">{item.count}</strong>
                    <span className="lp-admin__stat-hint">{item.path}</span>
                  </button>
                ))}
              </section>

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
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  >
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
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="lp-admin__btn"
                  onClick={loadLeads}
                  disabled={loading}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </section>

              <div className="lp-admin__toolbar">
                <p className="lp-admin__meta">
                  Showing <strong>{leads.length}</strong> of{" "}
                  <strong>{total}</strong> leads
                  {selected.size ? (
                    <>
                      {" "}
                      · <strong>{selected.size}</strong> selected
                    </>
                  ) : null}
                </p>
                <div className="lp-admin__toolbar-actions">
                  <button
                    type="button"
                    className="lp-admin__btn lp-admin__btn--ghost"
                    onClick={toggleAllVisible}
                    disabled={!leads.length}
                  >
                    {allVisibleSelected ? "Clear selection" : "Select all visible"}
                  </button>
                  <button
                    type="button"
                    className="lp-admin__btn lp-admin__btn--danger"
                    onClick={handleDeleteSelected}
                    disabled={!selected.size || deleting}
                  >
                    {deleting
                      ? "Deleting…"
                      : `Delete selected${selected.size ? ` (${selected.size})` : ""}`}
                  </button>
                </div>
              </div>

              {actionMsg ? <p className="lp-admin__success">{actionMsg}</p> : null}
              {loadError ? <p className="lp-admin__error">{loadError}</p> : null}

              <div className="lp-admin__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="lp-admin__check">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleAllVisible}
                          aria-label="Select all visible leads"
                          disabled={!leads.length}
                        />
                      </th>
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={14}>No leads match the current filters.</td>
                      </tr>
                    ) : null}
                    {leads.map((lead, index) => {
                      const id = lead.id ? String(lead.id) : "";
                      const isChecked = id ? selected.has(id) : false;
                      return (
                        <tr
                          key={id || `${lead.email}-${lead.submittedAt}-${index}`}
                          className={isChecked ? "is-selected" : ""}
                        >
                          <td className="lp-admin__check">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={!id}
                              onChange={() => id && toggleOne(id)}
                              aria-label={`Select lead ${lead.name || id || index + 1}`}
                            />
                          </td>
                          <td>{index + 1}</td>
                          <td>{formatDate(lead.submittedAt || lead.createdAt)}</td>
                          <td>
                            <span className="lp-admin__pill">
                              {lead.landingPageLabel || lead.project || "—"}
                            </span>
                          </td>
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
                          <td>
                            <button
                              type="button"
                              className="lp-admin__link-danger"
                              disabled={!id || deleting}
                              onClick={() => id && handleDeleteOne(id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {authed === null ? (
            <p className="lp-admin__meta">Checking session…</p>
          ) : null}
        </div>
      </div>

      <style jsx global>{`
        .lp-admin {
          min-height: 100vh;
          padding: 28px 20px 56px;
          background:
            radial-gradient(ellipse 80% 50% at 10% -10%, rgba(0, 69, 137, 0.16), transparent 55%),
            radial-gradient(ellipse 60% 40% at 100% 0%, rgba(239, 73, 61, 0.1), transparent 50%),
            linear-gradient(180deg, #f4f7fa 0%, #e8eef3 100%);
          color: #15202b;
          font-family: "Montserrat", "Segoe UI", sans-serif;
        }
        .lp-admin__shell {
          max-width: 1400px;
          margin: 0 auto;
        }
        .lp-admin__header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 22px;
        }
        .lp-admin__eyebrow {
          margin: 0 0 6px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 11px;
          font-weight: 600;
          color: #004589;
        }
        .lp-admin h1 {
          margin: 0;
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #0b1c2c;
        }
        .lp-admin__sub {
          margin: 8px 0 0;
          color: #5a6b7a;
          font-size: 14px;
          max-width: 42ch;
          line-height: 1.45;
        }
        .lp-admin__actions,
        .lp-admin__toolbar-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .lp-admin__btn {
          border: 0;
          border-radius: 999px;
          background: #004589;
          color: #fff;
          padding: 10px 18px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          transition: background 0.2s ease, transform 0.15s ease;
        }
        .lp-admin__btn:hover:not(:disabled) {
          background: #00356a;
        }
        .lp-admin__btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .lp-admin__btn--ghost {
          background: transparent !important;
          color: #004589 !important;
          border: 1px solid rgba(0, 69, 137, 0.35) !important;
        }
        .lp-admin__btn--ghost:hover:not(:disabled) {
          background: rgba(0, 69, 137, 0.06) !important;
        }
        .lp-admin__btn--danger {
          background: #ef493d !important;
        }
        .lp-admin__btn--danger:hover:not(:disabled) {
          background: #d83a2f !important;
        }
        .lp-admin__login {
          max-width: 420px;
          margin: 72px auto 0;
          padding: 32px;
          background: rgba(255, 255, 255, 0.88);
          border: 1px solid rgba(15, 40, 60, 0.08);
          border-radius: 18px;
          box-shadow: 0 18px 50px -28px rgba(11, 28, 44, 0.45);
        }
        .lp-admin__login h2 {
          margin: 0 0 8px;
          font-weight: 600;
        }
        .lp-admin label {
          display: grid;
          gap: 6px;
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: #3d4f5f;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .lp-admin input,
        .lp-admin select {
          padding: 11px 12px;
          border: 1px solid rgba(15, 40, 60, 0.14);
          border-radius: 10px;
          background: #fff;
          font: inherit;
          font-size: 14px;
          font-weight: 500;
          text-transform: none;
          letter-spacing: 0;
          color: #15202b;
        }
        .lp-admin__stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }
        .lp-admin__stat {
          text-align: left;
          border: 1px solid rgba(15, 40, 60, 0.08);
          border-radius: 16px;
          padding: 16px 18px;
          background: rgba(255, 255, 255, 0.78);
          box-shadow: 0 10px 30px -24px rgba(11, 28, 44, 0.5);
          cursor: pointer;
          transition: border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .lp-admin__stat:hover {
          transform: translateY(-1px);
          border-color: rgba(0, 69, 137, 0.28);
        }
        .lp-admin__stat.is-active {
          border-color: rgba(0, 69, 137, 0.45);
          background: linear-gradient(180deg, #fff 0%, #eef5fb 100%);
          box-shadow: 0 14px 34px -22px rgba(0, 69, 137, 0.55);
        }
        .lp-admin__stat-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #5a6b7a;
          margin-bottom: 8px;
        }
        .lp-admin__stat-count {
          display: block;
          font-size: 28px;
          line-height: 1;
          font-weight: 700;
          color: #004589;
          letter-spacing: -0.03em;
        }
        .lp-admin__stat-hint {
          display: block;
          margin-top: 8px;
          font-size: 11px;
          color: #8091a0;
          word-break: break-all;
        }
        .lp-admin__filters {
          display: grid;
          grid-template-columns: 1.1fr 1.5fr 1.3fr 1fr 1fr auto;
          gap: 12px;
          align-items: end;
          margin-bottom: 14px;
          padding: 16px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(15, 40, 60, 0.08);
        }
        .lp-admin__toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .lp-admin__meta {
          margin: 0;
          color: #5a6b7a;
          font-size: 14px;
        }
        .lp-admin__meta strong {
          color: #0b1c2c;
        }
        .lp-admin__error {
          color: #8a1f1f;
          margin: 0 0 10px;
        }
        .lp-admin__success {
          color: #0a7a32;
          margin: 0 0 10px;
          font-weight: 600;
        }
        .lp-admin__table-wrap {
          max-height: calc(100vh - 360px);
          overflow: auto;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(15, 40, 60, 0.08);
          border-radius: 16px;
          box-shadow: 0 18px 40px -30px rgba(11, 28, 44, 0.5);
          -webkit-overflow-scrolling: touch;
        }
        .lp-admin table {
          width: max-content;
          min-width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .lp-admin th,
        .lp-admin td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(15, 40, 60, 0.07);
          text-align: left;
          vertical-align: top;
          white-space: nowrap;
        }
        .lp-admin th {
          position: sticky;
          top: 0;
          z-index: 1;
          background: #e7eef5;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #3d4f5f;
        }
        .lp-admin tbody tr.is-selected {
          background: rgba(0, 69, 137, 0.06);
        }
        .lp-admin tbody tr:hover {
          background: rgba(0, 69, 137, 0.04);
        }
        .lp-admin__check {
          width: 42px;
        }
        .lp-admin__check input {
          width: 16px;
          height: 16px;
          padding: 0;
          accent-color: #004589;
          cursor: pointer;
        }
        .lp-admin__pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(0, 69, 137, 0.08);
          color: #004589;
          font-weight: 600;
          font-size: 12px;
        }
        .lp-admin__url {
          max-width: 220px;
          white-space: normal;
          word-break: break-word;
          color: #5a6b7a;
        }
        .lp-admin__link-danger {
          border: 0;
          background: transparent;
          color: #ef493d;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
        }
        .lp-admin__link-danger:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        @media (max-width: 1100px) {
          .lp-admin__filters {
            grid-template-columns: 1fr 1fr;
          }
          .lp-admin__header {
            flex-direction: column;
          }
          .lp-admin__table-wrap {
            max-height: none;
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
