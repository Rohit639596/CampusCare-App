import { useEffect, useMemo, useState } from 'react';

import { api } from '../lib/api';

import {
  Search,
  RefreshCw,
  CheckCircle2,
  Clock3,
  XCircle,
  ChevronDown,
  Bot,
  AlertTriangle,
  Zap,
  MessageSquare
} from 'lucide-react';

export default function AdminDashboard() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');

  const load = () => {
    setLoading(true);

    api
      .get('/complaints', {
        params: { status, q }
      })
      .then((r) => setItems(r.data.complaints))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [status]);

  const filtered = useMemo(
    () =>
      items.filter((x) =>
        (
          x.title +
          ' ' +
          x.description +
          ' ' +
          x.student.name
        )
          .toLowerCase()
          .includes(q.toLowerCase())
      ),
    [items, q]
  );

  const update = async (next) => {
    if (!selected) return;

    await api.patch('/complaints/' + selected.id, {
      status: next,
      adminNote: note
    });

    setSelected(null);
    setNote('');
    load();
  };

  const stats = {
    total: items.length,
    pending: items.filter((x) => x.status === 'PENDING').length,
    progress: items.filter((x) => x.status === 'IN_PROGRESS').length,
    resolved: items.filter((x) => x.status === 'RESOLVED').length
  };

  return (
    <div className="page">
      <div className="hero">
        <div>
          <p className="eyebrow">MANAGEMENT PANEL</p>

          <h1>Complaint overview</h1>

          <p className="muted">
            Review, prioritize and resolve student grievances.
          </p>
        </div>

        <button className="secondary" onClick={load}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="stats">
        <Stat label="Total" value={stats.total} />
        <Stat label="Pending" value={stats.pending} />
        <Stat label="In progress" value={stats.progress} />
        <Stat label="Resolved" value={stats.resolved} />
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={18} />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search complaints or students..."
          />
        </div>

        <div className="filter">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <ChevronDown size={16} />
        </div>
      </div>

      <section className="section">
        <div className="admin-table">
          <div className="table-head">
            <span>Complaint</span>
            <span>Student</span>
            <span>Status</span>
            <span>Date</span>
            <span></span>
          </div>

          {loading ? (
            <div className="table-empty">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="table-empty">
              No complaints match your filters.
            </div>
          ) : (
            filtered.map((c) => (
              <button
                className="table-row"
                key={c.id}
                onClick={() => {
                  setSelected(c);
                  setNote(c.adminNote || '');
                }}
              >
                <span>
                  <strong>{c.title}</strong>
                  <small>{c.category}</small>
                </span>

                <span>
                  <strong>{c.student.name}</strong>
                  <small>{c.student.email}</small>
                </span>

                <span>
                  <Status status={c.status} />
                </span>

                <span>
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>

                <span>›</span>
              </button>
            ))
          )}
        </div>
      </section>

      {selected && (
        <div className="modal-backdrop">
          <div className="modal detail">
            <div className="modal-head">
              <div>
                <span className="category">
                  {selected.category}
                </span>

                <h2>{selected.title}</h2>
              </div>

              <button
                className="icon-btn"
                onClick={() => setSelected(null)}
              >
                <XCircle />
              </button>
            </div>

            <div className="detail-grid">
              <div>
                <span className="label">Student</span>
                <strong>{selected.student.name}</strong>
                <span>{selected.student.email}</span>
              </div>

              <div>
                <span className="label">Location</span>
                <strong>
                  {selected.location || 'Not provided'}
                </strong>
              </div>

              <div>
                <span className="label">Submitted</span>
                <strong>
                  {new Date(selected.createdAt).toLocaleString()}
                </strong>
              </div>

              <div>
                <span className="label">Current status</span>
                <Status status={selected.status} />
              </div>
            </div>

            <div className="description-box">
              <span className="label">Description</span>

              <p>{selected.description}</p>

              {selected.imageUrl && (
                <a
                  href={selected.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open attached proof
                </a>
              )}
            </div>

            {/* ============================= */}
            {/* CAMPUSCARE AI ANALYSIS */}
            {/* ============================= */}

            <div className="ai-analysis">
              <div className="ai-header">
                <div className="ai-title">
                  <div className="ai-icon">
                    <Bot size={21} />
                  </div>

                  <div>
                    <h3>CampusCare AI Analysis</h3>
                    <span>Intelligent complaint assessment</span>
                  </div>
                </div>
              </div>

              {selected.aiCategory ||
              selected.aiPriority ||
              selected.aiSentiment ||
              selected.aiUrgency ? (
                <>
                  <div className="ai-grid">
                    <AIBox
                      icon={<Bot size={17} />}
                      label="AI Category"
                      value={selected.aiCategory || 'N/A'}
                    />

                    <AIBox
                      icon={<AlertTriangle size={17} />}
                      label="Priority"
                      value={selected.aiPriority || 'N/A'}
                    />

                    <AIBox
                      icon={<Zap size={17} />}
                      label="Urgency"
                      value={selected.aiUrgency || 'N/A'}
                    />

                    <AIBox
                      icon={<MessageSquare size={17} />}
                      label="Sentiment"
                      value={selected.aiSentiment || 'N/A'}
                    />
                  </div>

                  <div className="ai-text-box">
                    <span className="label">AI Summary</span>

                    <p>
                      {selected.aiSummary ||
                        'No AI summary available.'}
                    </p>
                  </div>

                  <div className="ai-text-box">
                    <span className="label">
                      AI Recommendation
                    </span>

                    <p>
                      {selected.aiRecommendation ||
                        'No AI recommendation available.'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="ai-empty">
                  <Bot size={20} />

                  <div>
                    <strong>AI analysis unavailable</strong>

                    <p>
                      This complaint does not have AI analysis
                      data yet.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ============================= */}
            {/* ADMIN ACTIONS */}
            {/* ============================= */}

            <label>
              Admin note

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an update for the student..."
              />
            </label>

            <div className="action-row">
              <button
                className="secondary"
                onClick={() => update('IN_PROGRESS')}
              >
                <Clock3 size={16} />
                In progress
              </button>

              <button
                className="primary"
                onClick={() => update('RESOLVED')}
              >
                <CheckCircle2 size={16} />
                Resolve
              </button>

              <button
                className="danger"
                onClick={() => update('REJECTED')}
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Status({ status }) {
  const map = {
    PENDING: ['Pending', Clock3],
    IN_PROGRESS: ['In Progress', Clock3],
    RESOLVED: ['Resolved', CheckCircle2],
    REJECTED: ['Rejected', XCircle]
  };

  const [label, Icon] = map[status] || map.PENDING;

  return (
    <span className={`status ${status.toLowerCase()}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-icon">
        <CheckCircle2 size={19} />
      </div>

      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function AIBox({ icon, label, value }) {
  return (
    <div className="ai-box">
      <div className="ai-box-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}