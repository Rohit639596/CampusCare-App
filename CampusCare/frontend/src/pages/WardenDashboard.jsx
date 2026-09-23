import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AlertTriangle,
  ArrowUpCircle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileText,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  ShieldCheck,
  User,
  X,
  XCircle,
  Brain,
  Copy,
  ExternalLink,
  Save,
  Loader2
} from 'lucide-react';

import { api } from '../lib/api';

/* =========================================================
   STATUS METADATA
========================================================= */

const statusMeta = {
  PENDING: {
    label: 'Pending',
    icon: Clock3
  },

  IN_PROGRESS: {
    label: 'In Progress',
    icon: Clock3
  },

  RESOLVED: {
    label: 'Resolved',
    icon: CheckCircle2
  },

  REJECTED: {
    label: 'Rejected',
    icon: XCircle
  }
};

/* =========================================================
   DEPARTMENT LABEL
========================================================= */

function getDepartmentLabel(department) {
  const labels = {
    HOSTEL: 'Hostel',
    ACADEMICS: 'Academics',
    FEES: 'Fees',
    LIBRARY: 'Library',
    TRANSPORT: 'Transport',
    INFRASTRUCTURE: 'Infrastructure',
    IT: 'IT',
    OTHER: 'Other'
  };

  return labels[department] || department || 'Other';
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function WardenDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState('');

  /* =======================================================
     FILTERS
  ======================================================= */

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState('ALL');

  /* =======================================================
     PROFILE
  ======================================================= */

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [user, setUser] = useState(null);

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const [statusUpdating, setStatusUpdating] =
    useState(false);

  /* =======================================================
     NOTE
  ======================================================= */

  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] =
    useState(false);

  /* =======================================================
     ESCALATION
  ======================================================= */

  const [escalationOpen, setEscalationOpen] =
    useState(false);

  const [escalationReason, setEscalationReason] =
    useState('');

  const [escalationMessage, setEscalationMessage] =
    useState('');

  const [escalating, setEscalating] =
    useState(false);

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem('user');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error(
        'Failed to load warden profile:',
        error
      );
    }
  }, []);

  /* =======================================================
     LOAD COMPLAINTS
  ======================================================= */

  const loadComplaints = async () => {
    try {
      setError('');

      const response = await api.get(
        '/complaints/warden'
      );

      const data =
        response.data.complaints || [];

      setComplaints(data);

    } catch (err) {
      console.error(
        'Failed to load warden complaints:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Could not load hostel complaints.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadComplaints();
  }, []);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh = async () => {
    setRefreshing(true);

    try {
      await loadComplaints();

      if (selectedComplaint?.id) {
        await openComplaint(
          selectedComplaint.id
        );
      }
    } finally {
      setRefreshing(false);
    }
  };

  /* =======================================================
     OPEN COMPLAINT
  ======================================================= */

  const openComplaint = async (complaintId) => {
    setDetailLoading(true);
    setError('');

    try {
      const response = await api.get(
        `/complaints/warden/${complaintId}`
      );

      const complaint =
        response.data.complaint;

      setSelectedComplaint(complaint);

      setNote(
        complaint?.adminNote || ''
      );

    } catch (err) {
      console.error(
        'Failed to load complaint:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Could not load complaint details.'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /* =======================================================
     UPDATE STATUS
  ======================================================= */

  const updateStatus = async (newStatus) => {
    if (!selectedComplaint) {
      return;
    }

    setStatusUpdating(true);
    setError('');

    try {
      const response = await api.patch(
        `/complaints/warden/${selectedComplaint.id}`,
        {
          status: newStatus
        }
      );

      const updatedComplaint =
        response.data.complaint;

      setSelectedComplaint(
        updatedComplaint
      );

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id ===
          updatedComplaint.id
            ? {
                ...complaint,
                ...updatedComplaint
              }
            : complaint
        )
      );

    } catch (err) {
      console.error(
        'Failed to update status:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Could not update complaint status.'
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  /* =======================================================
     SAVE NOTE
  ======================================================= */

  const saveNote = async () => {
    if (!selectedComplaint) {
      return;
    }

    setNoteSaving(true);
    setError('');

    try {
      const response = await api.patch(
        `/complaints/warden/${selectedComplaint.id}`,
        {
          adminNote: note
        }
      );

      const updatedComplaint =
        response.data.complaint;

      setSelectedComplaint(
        updatedComplaint
      );

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id ===
          updatedComplaint.id
            ? {
                ...complaint,
                ...updatedComplaint
              }
            : complaint
        )
      );

    } catch (err) {
      console.error(
        'Failed to save note:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Could not save warden note.'
      );
    } finally {
      setNoteSaving(false);
    }
  };

  /* =======================================================
     ESCALATE
  ======================================================= */

  const handleEscalate = async () => {
    if (!selectedComplaint) {
      return;
    }

    if (!escalationReason.trim()) {
      return;
    }

    setEscalating(true);
    setError('');

    try {
      const response = await api.post(
        `/complaints/warden/${selectedComplaint.id}/escalate`,
        {
          reason:
            escalationReason.trim(),

          message:
            escalationMessage.trim() || undefined
        }
      );

      const updatedComplaint =
        response.data.complaint;

      setSelectedComplaint(
        updatedComplaint
      );

      setComplaints((prev) =>
        prev.map((complaint) =>
          complaint.id ===
          updatedComplaint.id
            ? {
                ...complaint,
                ...updatedComplaint
              }
            : complaint
        )
      );

      setEscalationOpen(false);
      setEscalationReason('');
      setEscalationMessage('');

    } catch (err) {
      console.error(
        'Failed to escalate complaint:',
        err
      );

      setError(
        err.response?.data?.message ||
        'Could not escalate complaint.'
      );
    } finally {
      setEscalating(false);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
  localStorage.removeItem('campuscare_token');
  localStorage.removeItem('user');

  navigate('/warden/login', {
    replace: true
  });
};

  /* =======================================================
     FILTER COMPLAINTS
  ======================================================= */

  const filteredComplaints =
    complaints.filter((complaint) => {
      const query =
        search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        complaint.title
          ?.toLowerCase()
          .includes(query) ||
        complaint.description
          ?.toLowerCase()
          .includes(query) ||
        complaint.student?.name
          ?.toLowerCase()
          .includes(query) ||
        complaint.location
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === 'ALL' ||
        complaint.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

  /* =======================================================
     STATS
  ======================================================= */

  const stats = {
    total: complaints.length,

    pending: complaints.filter(
      (complaint) =>
        complaint.status === 'PENDING'
    ).length,

    progress: complaints.filter(
      (complaint) =>
        complaint.status === 'IN_PROGRESS'
    ).length,

    resolved: complaints.filter(
      (complaint) =>
        complaint.status === 'RESOLVED'
    ).length,

    escalated: complaints.filter(
      (complaint) =>
        Number(
          complaint.escalationLevel || 0
        ) > 0
    ).length
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="warden-dashboard">

      {/* ===================================================
          TOP NAVBAR
      =================================================== */}

      <header className="warden-header">

        <div className="warden-brand">

          <div className="warden-brand-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <strong>
              CampusCare
            </strong>

            <span>
              Warden Portal
            </span>
          </div>

        </div>

        <div className="warden-header-right">

          <button
            type="button"
            className="warden-notification-btn"
            title="Notifications"
          >
            <Bell size={19} />
          </button>

          {/* PROFILE */}

          <div className="warden-profile-wrapper">

            <button
              type="button"
              className="warden-profile-btn"
              onClick={() =>
                setProfileOpen(
                  (prev) => !prev
                )
              }
            >

              <div className="warden-avatar">
                <User size={17} />
              </div>

              <div className="warden-profile-text">

                <strong>
                  {user?.name ||
                    'Warden'}
                </strong>

                <span>
                  Warden
                </span>

              </div>

              <ChevronDown
                size={17}
              />

            </button>

            {profileOpen && (
              <div className="warden-profile-menu">

                <div className="warden-profile-menu-head">

                  <div className="warden-avatar large">
                    <User size={20} />
                  </div>

                  <div>
                    <strong>
                      {user?.name ||
                        'Warden'}
                    </strong>

                    <span>
                      {user?.email ||
                        'Warden Account'}
                    </span>
                  </div>

                </div>

                <div className="warden-profile-role">
                  <ShieldCheck
                    size={16}
                  />

                  Warden Account
                </div>

                <button
                  type="button"
                  className="warden-logout-btn"
                  onClick={handleLogout}
                >
                  <LogOut
                    size={17}
                  />

                  Logout
                </button>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="warden-main">

        {/* PAGE HEADING */}

        <div className="warden-page-heading">

          <div>
            <p className="warden-eyebrow">
              WARDEN PORTAL
            </p>

            <h1>
              Warden Dashboard
            </h1>

            <p>
              Manage hostel-related student
              complaints and review AI insights.
            </p>
          </div>

          <button
            type="button"
            className="warden-refresh-btn"
            onClick={handleRefresh}
            disabled={refreshing}
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? 'warden-spin'
                  : ''
              }
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}

          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="warden-error">

            <AlertTriangle
              size={18}
            />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError('')
              }
            >
              <X size={17} />
            </button>

          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section className="warden-stats">

          <StatCard
            label="Total"
            value={stats.total}
            icon={FileText}
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock3}
          />

          <StatCard
            label="In Progress"
            value={stats.progress}
            icon={Clock3}
          />

          <StatCard
            label="Resolved"
            value={stats.resolved}
            icon={CheckCircle2}
          />

          <StatCard
            label="Escalated"
            value={stats.escalated}
            icon={ArrowUpCircle}
          />

        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="warden-filters">

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search hostel complaints..."
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="REJECTED">
              Rejected
            </option>
          </select>

        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="warden-content">

          {/* =================================================
              COMPLAINT LIST
          ================================================= */}

          <div className="complaint-list-panel">

            <div className="panel-heading">

              <div>
                <h2>
                  Hostel Complaints
                </h2>

                <span>
                  {filteredComplaints.length}{' '}
                  complaints
                </span>
              </div>

            </div>

            {loading ? (

              <div className="warden-loading">
                <Loader2
                  size={24}
                  className="warden-spin"
                />

                Loading complaints...
              </div>

            ) : filteredComplaints.length === 0 ? (

              <div className="warden-empty">

                <FileText
                  size={38}
                />

                <h3>
                  No hostel complaints
                </h3>

                <p>
                  There are no complaints
                  matching the current filters.
                </p>

              </div>

            ) : (

              <div className="warden-complaint-list">

                {filteredComplaints.map(
                  (complaint) => {

                    const meta =
                      statusMeta[
                        complaint.status
                      ] ||
                      statusMeta.PENDING;

                    const StatusIcon =
                      meta.icon;

                    const isSelected =
                      selectedComplaint?.id ===
                      complaint.id;

                    return (
                      <button
                        type="button"
                        key={complaint.id}
                        className={`warden-complaint-item ${
                          isSelected
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          openComplaint(
                            complaint.id
                          )
                        }
                      >

                        <div className="warden-complaint-item-top">

                          <div>

                            <span className="warden-department-badge">
                              {getDepartmentLabel(
                                complaint.department
                              )}
                            </span>

                            <h3>
                              {complaint.title}
                            </h3>

                          </div>

                          <span
                            className={`warden-status ${complaint.status.toLowerCase()}`}
                          >
                            <StatusIcon
                              size={14}
                            />

                            {meta.label}
                          </span>

                        </div>

                        <p>
                          {complaint.description}
                        </p>

                        <div className="warden-complaint-meta">

                          <span>
                            <User
                              size={14}
                            />

                            {complaint.student
                              ?.name ||
                              'Student'}
                          </span>

                          {complaint.location && (
                            <span>
                              <MapPin
                                size={14}
                              />

                              {
                                complaint.location
                              }
                            </span>
                          )}

                          <span>
                            {new Date(
                              complaint.createdAt
                            ).toLocaleDateString()}
                          </span>

                        </div>

                        {Number(
                          complaint.escalationLevel ||
                          0
                        ) > 0 && (
                          <div className="escalated-badge">

                            <ArrowUpCircle
                              size={14}
                            />

                            Escalated · Level{' '}
                            {
                              complaint.escalationLevel
                            }

                          </div>
                        )}

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* =================================================
              DETAILS
          ================================================= */}

          <div className="complaint-detail-panel">

            {!selectedComplaint ? (

              <div className="detail-placeholder">

                <ShieldCheck
                  size={46}
                />

                <h3>
                  Select a complaint
                </h3>

                <p>
                  Select a hostel complaint
                  to view its details and
                  AI analysis.
                </p>

              </div>

            ) : detailLoading ? (

              <div className="warden-loading">

                <Loader2
                  size={25}
                  className="warden-spin"
                />

                Loading complaint...

              </div>

            ) : (

              <ComplaintDetails
                complaint={
                  selectedComplaint
                }

                note={note}
                setNote={setNote}

                noteSaving={noteSaving}

                statusUpdating={
                  statusUpdating
                }

                onStatusChange={
                  updateStatus
                }

                onSaveNote={
                  saveNote
                }

                onEscalate={() =>
                  setEscalationOpen(
                    true
                  )
                }

                onClose={() =>
                  setSelectedComplaint(
                    null
                  )
                }

              />

            )}

          </div>

        </section>

      </main>

      {/* ===================================================
          ESCALATION MODAL
      =================================================== */}

      {escalationOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {

            if (
              e.target ===
                e.currentTarget &&
              !escalating
            ) {
              setEscalationOpen(false);
            }

          }}
        >

          <div className="warden-modal">

            <div className="warden-modal-head">

              <div>

                <p className="warden-eyebrow">
                  ESCALATE COMPLAINT
                </p>

                <h2>
                  Escalate to HOD
                </h2>

              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={() =>
                  !escalating &&
                  setEscalationOpen(
                    false
                  )
                }
              >
                <X size={20} />
              </button>

            </div>

            <p className="warden-modal-info">
              This complaint will be moved
              from Warden level to the next
              authority level.
            </p>

            <label>
              Reason

              <input
                value={escalationReason}
                onChange={(e) =>
                  setEscalationReason(
                    e.target.value
                  )
                }
                placeholder="Why does this complaint need escalation?"
              />
            </label>

            <label>
              Message

              <textarea
                value={escalationMessage}
                onChange={(e) =>
                  setEscalationMessage(
                    e.target.value
                  )
                }
                placeholder="Additional information for HOD..."
              />
            </label>

            <div className="warden-modal-actions">

              <button
                type="button"
                className="secondary"
                disabled={escalating}
                onClick={() =>
                  setEscalationOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="primary"
                disabled={
                  escalating ||
                  !escalationReason.trim()
                }
                onClick={
                  handleEscalate
                }
              >

                {escalating ? (
                  <>
                    <Loader2
                      size={17}
                      className="warden-spin"
                    />

                    Escalating...
                  </>
                ) : (
                  <>
                    <ArrowUpCircle
                      size={17}
                    />

                    Escalate to HOD
                  </>
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon: Icon
}) {
  return (
    <div className="warden-stat-card">

      <div className="warden-stat-icon">
        <Icon size={19} />
      </div>

      <div>

        <strong>
          {value}
        </strong>

        <span>
          {label}
        </span>

      </div>

    </div>
  );
}

/* =========================================================
   COMPLAINT DETAILS
========================================================= */

function ComplaintDetails({
  complaint,
  note,
  setNote,
  noteSaving,
  statusUpdating,
  onStatusChange,
  onSaveNote,
  onEscalate,
  onClose
}) {
  const status =
    statusMeta[
      complaint.status
    ] || statusMeta.PENDING;

  const StatusIcon =
    status.icon;

  return (
    <div className="warden-detail">

      {/* ===================================================
          DETAIL HEADER
      =================================================== */}

      <div className="warden-detail-header">

        <div>

          <span className="warden-department-badge">
            {getDepartmentLabel(
              complaint.department
            )}
          </span>

          <h2>
            {complaint.title}
          </h2>

          <span className="warden-detail-date">
            Submitted{' '}
            {new Date(
              complaint.createdAt
            ).toLocaleString()}
          </span>

        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={onClose}
        >
          <X size={19} />
        </button>

      </div>

      {/* ===================================================
          STUDENT
      =================================================== */}

      <div className="warden-student-card">

        <div className="warden-student-avatar">
          <User size={21} />
        </div>

        <div>

          <strong>
            {complaint.student?.name ||
              'Student'}
          </strong>

          <span>
            <Mail size={14} />

            {complaint.student?.email ||
              'No email available'}
          </span>

        </div>

      </div>

      {/* ===================================================
          COMPLAINT INFORMATION
      =================================================== */}

      <div className="warden-detail-section">

        <h3>
          Complaint Details
        </h3>

        <div className="warden-info-grid">

          <div className="warden-info-item">

            <span>
              Location
            </span>

            <strong>
              {complaint.location ||
                'Not provided'}
            </strong>

          </div>

          <div className="warden-info-item">

            <span>
              Department
            </span>

            <strong>
              {getDepartmentLabel(
                complaint.department
              )}
            </strong>

          </div>

          <div className="warden-info-item">

            <span>
              Status
            </span>

            <strong>
              <StatusIcon
                size={15}
              />

              {status.label}
            </strong>

          </div>

          <div className="warden-info-item">

            <span>
              Escalation Level
            </span>

            <strong>
              Level{' '}
              {complaint.escalationLevel ||
                0}
            </strong>

          </div>

        </div>

        <div className="warden-description">

          <span>
            Description
          </span>

          <p>
            {complaint.description}
          </p>

        </div>

        {/* IMAGE */}

        {complaint.imageUrl && (
          <div className="warden-proof">

            <span>
              Proof Image
            </span>

            <a
              href={
                complaint.imageUrl
              }
              target="_blank"
              rel="noreferrer"
            >

              <img
                src={
                  complaint.imageUrl
                }
                alt="Complaint proof"
              />

              <span>
                <ExternalLink
                  size={15}
                />

                Open full image
              </span>

            </a>

          </div>
        )}

      </div>

      {/* ===================================================
          AI ANALYSIS
      =================================================== */}

      <div className="ai-analysis-card">

        <div className="ai-analysis-header">

          <div className="ai-analysis-title">

            <div className="ai-icon">
              <Brain size={20} />
            </div>

            <div>
              <h3>
                AI Analysis
              </h3>

              <span>
                CampusCare AI insights
              </span>
            </div>

          </div>

          <span className="ai-powered-badge">
            AI Powered
          </span>

        </div>

        <div className="ai-analysis-grid">

          <AIField
            label="AI Category"
            value={
              complaint.aiCategory
            }
          />

          <AIField
            label="Priority"
            value={
              complaint.aiPriority
            }
            priority
          />

          <AIField
            label="Urgency"
            value={
              complaint.aiUrgency
            }
            urgency
          />

          <AIField
            label="Sentiment"
            value={
              complaint.aiSentiment
            }
          />

        </div>

        {complaint.aiSummary && (
          <div className="ai-text-box">

            <strong>
              AI Summary
            </strong>

            <p>
              {complaint.aiSummary}
            </p>

          </div>
        )}

        {complaint.aiRecommendation && (
          <div className="ai-text-box recommendation">

            <strong>
              AI Recommendation
            </strong>

            <p>
              {complaint.aiRecommendation}
            </p>

          </div>
        )}

      </div>

      {/* ===================================================
          DUPLICATE DETECTION
      =================================================== */}

      {(complaint.duplicateComplaintId ||
        complaint.duplicateSimilarity) && (

        <div className="duplicate-card">

          <div className="duplicate-header">

            <div className="duplicate-title">

              <div className="duplicate-icon">
                <Copy size={19} />
              </div>

              <div>
                <h3>
                  Duplicate Detection
                </h3>

                <span>
                  AI similarity analysis
                </span>
              </div>

            </div>

            {complaint.duplicateSimilarity !=
              null && (
              <strong className="similarity-score">
                {Math.round(
                  Number(
                    complaint.duplicateSimilarity
                  ) * 100
                )}
                %
              </strong>
            )}

          </div>

          {complaint.duplicateComplaintId ? (
            <div className="duplicate-found">

              <AlertTriangle
                size={17}
              />

              <div>

                <strong>
                  Possible duplicate complaint
                  found
                </strong>

                <p>
                  This complaint appears
                  similar to another complaint
                  already submitted.
                </p>

              </div>

            </div>
          ) : (
            <div className="duplicate-none">

              <CheckCircle2
                size={17}
              />

              <span>
                No strong duplicate complaint
                detected.
              </span>

            </div>
          )}

        </div>
      )}

      {/* ===================================================
          STATUS CONTROL
      =================================================== */}

      <div className="warden-control-card">

        <h3>
          Complaint Management
        </h3>

        <label>
          Status

          <select
            value={
              complaint.status
            }
            disabled={
              statusUpdating
            }
            onChange={(e) =>
              onStatusChange(
                e.target.value
              )
            }
          >

            <option value="PENDING">
              Pending
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="REJECTED">
              Rejected
            </option>

          </select>

        </label>

        <label>
          Warden Note

          <textarea
            value={note}
            onChange={(e) =>
              setNote(
                e.target.value
              )
            }
            placeholder="Add an internal note about this complaint..."
            rows={4}
          />

        </label>

        <button
          type="button"
          className="primary"
          disabled={noteSaving}
          onClick={onSaveNote}
        >

          {noteSaving ? (
            <>
              <Loader2
                size={17}
                className="warden-spin"
              />

              Saving...
            </>
          ) : (
            <>
              <Save size={17} />

              Save Warden Note
            </>
          )}

        </button>

        <button
          type="button"
          className="escalate-button"
          onClick={onEscalate}
        >

          <ArrowUpCircle
            size={17}
          />

          Escalate Complaint

        </button>

      </div>

      {/* ===================================================
          STATUS HISTORY
      =================================================== */}

      {complaint.statusHistory?.length >
        0 && (

        <div className="warden-history-section">

          <h3>
            Complaint Timeline
          </h3>

          <div className="warden-timeline">

            {complaint.statusHistory.map(
              (item) => {

                const itemMeta =
                  statusMeta[
                    item.newStatus
                  ] ||
                  statusMeta.PENDING;

                const TimelineIcon =
                  itemMeta.icon;

                return (
                  <div
                    className="warden-timeline-item"
                    key={item.id}
                  >

                    <div className="timeline-dot">
                      <TimelineIcon
                        size={14}
                      />
                    </div>

                    <div>

                      <strong>
                        {itemMeta.label}
                      </strong>

                      <p>
                        {item.note ||
                          `Complaint status changed to ${itemMeta.label}.`}
                      </p>

                      <span>
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </div>
      )}

      {/* ===================================================
          ESCALATION HISTORY
      =================================================== */}

      {complaint.escalations?.length >
        0 && (

        <div className="warden-history-section">

          <h3>
            Escalation History
          </h3>

          <div className="escalation-history">

            {complaint.escalations.map(
              (item) => (

                <div
                  className="escalation-history-item"
                  key={item.id}
                >

                  <ArrowUpCircle
                    size={18}
                  />

                  <div>

                    <strong>
                      Level{' '}
                      {item.fromLevel}
                      {' → '}
                      Level{' '}
                      {item.toLevel}
                    </strong>

                    <p>
                      {item.reason}
                    </p>

                    {item.message && (
                      <span>
                        {item.message}
                      </span>
                    )}

                    <small>
                      {new Date(
                        item.createdAt
                      ).toLocaleString()}
                    </small>

                  </div>

                </div>

              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   AI FIELD
========================================================= */

function AIField({
  label,
  value,
  priority,
  urgency
}) {
  if (!value) {
    return (
      <div className="ai-field">

        <span>
          {label}
        </span>

        <strong className="ai-not-available">
          Not available
        </strong>

      </div>
    );
  }

  const normalized =
    String(value)
      .toLowerCase()
      .replace(/\s+/g, '-');

  return (
    <div className="ai-field">

      <span>
        {label}
      </span>

      <strong
        className={`
          ${
            priority
              ? `ai-priority ${normalized}`
              : ''
          }
          ${
            urgency
              ? `ai-urgency ${normalized}`
              : ''
          }
        `}
      >
        {String(value)}
      </strong>

    </div>
  );
}