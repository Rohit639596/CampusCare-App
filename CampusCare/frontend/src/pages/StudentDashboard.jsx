import { useEffect, useState } from 'react';
import { api } from '../lib/api';

import {
  CheckCircle2,
  Clock3,
  FileWarning,
  Plus,
  XCircle,
  Bell,
  BellRing,
  ChevronDown,
  ChevronUp,
  Star,
  Send,
  Loader2
} from 'lucide-react';

/* ==========================================================================
   COMPLAINT CATEGORIES
   ========================================================================== */

const categories = [
  {
    label: 'Hostel Management',
    department: 'HOSTEL'
  },
  {
    label: 'Academic Management',
    department: 'ACADEMICS'
  }
];

/* ==========================================================================
   STATUS METADATA
   ========================================================================== */

const statusMeta = {
  PENDING: ['Pending', Clock3],
  IN_PROGRESS: ['In Progress', Clock3],
  RESOLVED: ['Resolved', CheckCircle2],
  REJECTED: ['Rejected', XCircle]
};

/* ==========================================================================
   STUDENT DASHBOARD
   ========================================================================== */

export default function StudentDashboard({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const [open, setOpen] = useState(false);

  const [expandedComplaint, setExpandedComplaint] =
    useState(null);

  const [timeline, setTimeline] = useState({});

  const [timelineLoading, setTimelineLoading] =
    useState(null);

  const [feedback, setFeedback] = useState({});

  const [feedbackLoading, setFeedbackLoading] =
    useState(null);

  /* ==========================================================================
     COMPLAINT FORM
     ========================================================================== */

  const [form, setForm] = useState({
    title: '',
    category: 'HOSTEL',
    location: '',
    description: '',
    image: null
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  /* ==========================================================================
     LOAD COMPLAINTS
     ========================================================================== */

  const loadComplaints = async () => {
    try {
      const response = await api.get(
        '/complaints/mine'
      );

      setComplaints(
        response.data.complaints || []
      );
    } catch (error) {
      console.error(
        'Failed to load complaints:',
        error
      );
    }
  };

  /* ==========================================================================
     LOAD NOTIFICATIONS
     ========================================================================== */

  const loadNotifications = async () => {
    try {
      const response = await api.get(
        '/notifications'
      );

      setNotifications(
        response.data.notifications || []
      );
    } catch (error) {
      console.error(
        'Failed to load notifications:',
        error
      );
    }
  };

  /* ==========================================================================
     INITIAL LOAD
     ========================================================================== */

  useEffect(() => {
    loadComplaints();
    loadNotifications();
  }, []);

  /* ==========================================================================
     SUBMIT COMPLAINT
     ========================================================================== */

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setBusy(true);

    try {
      /* ----------------------------------------------------------------------
         FRONTEND VALIDATION
         ---------------------------------------------------------------------- */

      if (!form.title.trim()) {
        setError(
          'Please enter complaint title.'
        );
        return;
      }

      if (!form.location.trim()) {
        setError(
          'Please enter complaint location.'
        );
        return;
      }

      if (form.description.trim().length < 10) {
        setError(
          'Description must be at least 10 characters.'
        );
        return;
      }

      /* ----------------------------------------------------------------------
         FORM DATA
         ---------------------------------------------------------------------- */

      const fd = new FormData();

      fd.append(
        'title',
        form.title.trim()
      );

      /*
        category = frontend compatibility
        department = actual Prisma/backend field
      */

      fd.append(
        'category',
        form.category
      );

      fd.append(
        'department',
        form.category
      );

      fd.append(
        'location',
        form.location.trim()
      );

      fd.append(
        'description',
        form.description.trim()
      );

      if (form.image) {
        fd.append(
          'image',
          form.image
        );
      }

      /* ----------------------------------------------------------------------
         DEBUG LOG
         ---------------------------------------------------------------------- */

      console.log(
        'Submitting complaint:',
        {
          title: form.title.trim(),
          category: form.category,
          department: form.category,
          location: form.location.trim(),
          description:
            form.description.trim(),
          image:
            form.image?.name || null
        }
      );

      /* ----------------------------------------------------------------------
         API REQUEST

         IMPORTANT:
         Do NOT manually set Content-Type.
         Axios/browser will add multipart boundary automatically.
         ---------------------------------------------------------------------- */

      const response = await api.post(
        '/complaints',
        fd
      );

      console.log(
        'Complaint submitted successfully:',
        response.data
      );

      /* ----------------------------------------------------------------------
         RESET FORM
         ---------------------------------------------------------------------- */

      setForm({
        title: '',
        category: 'HOSTEL',
        location: '',
        description: '',
        image: null
      });

      setError('');
      setOpen(false);

      /* ----------------------------------------------------------------------
         REFRESH DASHBOARD
         ---------------------------------------------------------------------- */

      await loadComplaints();
      await loadNotifications();

    } catch (err) {
      console.error(
        'Complaint submission error:',
        err
      );

      console.error(
        'Backend response:',
        err.response?.data
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      /*
        If backend sends Zod validation details,
        show them in console for debugging.
      */

      if (err.response?.data?.errors) {
        console.error(
          'Validation errors:',
          err.response.data.errors
        );
      }

      setError(
        backendMessage ||
        'Could not submit complaint.'
      );
    } finally {
      setBusy(false);
    }
  };

  /* ==========================================================================
     TOGGLE COMPLAINT TIMELINE
     ========================================================================== */

  const toggleComplaint = async (
    complaintId
  ) => {
    if (
      expandedComplaint === complaintId
    ) {
      setExpandedComplaint(null);
      return;
    }

    setExpandedComplaint(complaintId);

    /*
      Already loaded
    */

    if (timeline[complaintId]) {
      return;
    }

    setTimelineLoading(complaintId);

    try {
      const response = await api.get(
        `/complaint-timeline/${complaintId}`
      );

      setTimeline((prev) => ({
        ...prev,
        [complaintId]:
          response.data.timeline || []
      }));
    } catch (error) {
      console.error(
        'Failed to load timeline:',
        error
      );
    } finally {
      setTimelineLoading(null);
    }
  };

  /* ==========================================================================
     MARK ONE NOTIFICATION AS READ
     ========================================================================== */

  const markNotificationRead = async (
    notificationId
  ) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        'Failed to mark notification:',
        error
      );
    }
  };

  /* ==========================================================================
     MARK ALL NOTIFICATIONS AS READ
     ========================================================================== */

  const markAllNotificationsRead =
    async () => {
      try {
        await api.patch(
          '/notifications/read-all'
        );

        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true
          }))
        );
      } catch (error) {
        console.error(
          'Failed to mark notifications:',
          error
        );
      }
    };

  /* ==========================================================================
     SUBMIT FEEDBACK
     ========================================================================== */

  const submitFeedback = async (
    complaintId
  ) => {
    const currentFeedback =
      feedback[complaintId];

    if (!currentFeedback?.rating) {
      return;
    }

    setFeedbackLoading(complaintId);

    try {
      await api.post(
        `/feedback/${complaintId}`,
        {
          rating:
            currentFeedback.rating,

          comment:
            currentFeedback.comment || ''
        }
      );

      setFeedback((prev) => ({
        ...prev,

        [complaintId]: {
          ...prev[complaintId],
          submitted: true
        }
      }));
    } catch (error) {
      alert(
        error.response?.data?.message ||
        'Could not submit feedback.'
      );
    } finally {
      setFeedbackLoading(null);
    }
  };

  /* ==========================================================================
     NOTIFICATION COUNT
     ========================================================================== */

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.isRead
    ).length;

  /* ==========================================================================
     COMPLAINT STATISTICS
     ========================================================================== */

  const counts = {
    total: complaints.length,

    pending: complaints.filter(
      (c) =>
        c.status === 'PENDING'
    ).length,

    progress: complaints.filter(
      (c) =>
        c.status === 'IN_PROGRESS'
    ).length,

    resolved: complaints.filter(
      (c) =>
        c.status === 'RESOLVED'
    ).length
  };

  /* ==========================================================================
     RENDER
     ========================================================================== */

  return (
    <div className="page">

      {/* =====================================================================
          HERO
          ===================================================================== */}

      <div className="hero">

        <div>
          <p className="eyebrow">
            STUDENT PORTAL
          </p>

          <h1>
            Hello,{' '}
            {user?.name
              ? user.name.split(' ')[0]
              : 'Student'}{' '}
            👋
          </h1>

          <p className="muted">
            Raise an issue, attach proof, and
            track the response from one place.
          </p>
        </div>

        <div className="student-actions">

          {/* ================================================================
              NOTIFICATION BUTTON
              ================================================================ */}

          <div className="notification-wrapper">

            <button
              type="button"
              className="notification-btn"
              onClick={() =>
                setNotificationOpen(
                  (prev) => !prev
                )
              }
              title="Notifications"
            >
              {unreadNotifications > 0 ? (
                <BellRing size={19} />
              ) : (
                <Bell size={19} />
              )}

              {unreadNotifications > 0 && (
                <span className="notification-count">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* ==============================================================
                NOTIFICATION DROPDOWN
                ============================================================== */}

            {notificationOpen && (
              <div className="notification-dropdown">

                <div className="notification-dropdown-head">

                  <div>
                    <strong>
                      Notifications
                    </strong>

                    <span>
                      {unreadNotifications > 0
                        ? `${unreadNotifications} unread`
                        : 'All caught up'}
                    </span>
                  </div>

                  {unreadNotifications > 0 && (
                    <button
                      type="button"
                      onClick={
                        markAllNotificationsRead
                      }
                    >
                      Mark all
                    </button>
                  )}

                </div>

                <div className="notification-dropdown-list">

                  {notifications.length === 0 ? (

                    <div className="notification-empty">

                      <Bell size={22} />

                      <p>
                        No notifications yet.
                      </p>

                    </div>

                  ) : (

                    notifications
                      .slice(0, 8)
                      .map(
                        (notification) => (

                          <div
                            key={
                              notification.id
                            }
                            className={`notification-dropdown-item ${
                              notification.isRead
                                ? 'read'
                                : 'unread'
                            }`}
                            onClick={() => {
                              if (
                                !notification.isRead
                              ) {
                                markNotificationRead(
                                  notification.id
                                );
                              }
                            }}
                          >

                            <div className="notification-icon">
                              <Bell size={17} />
                            </div>

                            <div className="notification-content">

                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <span>
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </span>

                            </div>

                            {!notification.isRead && (
                              <span className="unread-dot" />
                            )}

                          </div>
                        )
                      )

                  )}

                </div>

              </div>
            )}

          </div>

          {/* ================================================================
              NEW COMPLAINT BUTTON
              ================================================================ */}

          <button
            type="button"
            className="primary compact"
            onClick={() => {
              setError('');
              setOpen(true);
            }}
          >
            <Plus size={18} />
            New complaint
          </button>

        </div>

      </div>

      {/* =====================================================================
          STATS
          ===================================================================== */}

      <div className="stats">

        <Stat
          label="Total"
          value={counts.total}
          icon={FileWarning}
        />

        <Stat
          label="Pending"
          value={counts.pending}
          icon={Clock3}
        />

        <Stat
          label="In progress"
          value={counts.progress}
          icon={Clock3}
        />

        <Stat
          label="Resolved"
          value={counts.resolved}
          icon={CheckCircle2}
        />

      </div>

      {/* =====================================================================
          NEW COMPLAINT MODAL
          ===================================================================== */}

      {open && (

        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (
              e.target === e.currentTarget &&
              !busy
            ) {
              setOpen(false);
            }
          }}
        >

          <div className="modal">

            {/* ================================================================
                MODAL HEADER
                ================================================================ */}

            <div className="modal-head">

              <div>

                <p className="eyebrow">
                  NEW COMPLAINT
                </p>

                <h2>
                  Tell us what happened
                </h2>

              </div>

              <button
                type="button"
                className="icon-btn"
                onClick={() =>
                  !busy &&
                  setOpen(false)
                }
              >
                <XCircle />
              </button>

            </div>

            {/* ================================================================
                FORM
                ================================================================ */}

            <form
              className="form"
              onSubmit={submit}
            >

              {/* ============================================================
                  TITLE + CATEGORY
                  ============================================================ */}

              <div className="grid-2">

                {/* TITLE */}

                <label>
                  Title

                  <input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title:
                          e.target.value
                      })
                    }
                    placeholder="e.g. Water problem in Block B"
                  />
                </label>

                {/* CATEGORY */}

                <label>
                  Category

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category:
                          e.target.value
                      })
                    }
                  >

                    {categories.map(
                      (item) => (

                        <option
                          key={item.label}
                          value={
                            item.department
                          }
                        >
                          {item.label}
                        </option>

                      )
                    )}

                  </select>

                </label>

              </div>

              {/* ============================================================
                  LOCATION
                  ============================================================ */}

              <label>
                Location

                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      location:
                        e.target.value
                    })
                  }
                  placeholder="Hostel block, room, library floor..."
                />
              </label>

              {/* ============================================================
                  DESCRIPTION
                  ============================================================ */}

              <label>
                Description

                <textarea
                  required
                  minLength="10"
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description:
                        e.target.value
                    })
                  }
                  placeholder="Describe the issue clearly..."
                />
              </label>

              {/* ============================================================
                  IMAGE
                  ============================================================ */}

              <label>
                Proof image

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      image:
                        e.target.files?.[0] ||
                        null
                    })
                  }
                />

                <span className="hint">
                  PNG/JPG/WEBP, max 5 MB
                </span>
              </label>

              {/* ============================================================
                  ERROR
                  ============================================================ */}

              {error && (
                <div className="error">
                  {error}
                </div>
              )}

              {/* ============================================================
                  SUBMIT
                  ============================================================ */}

              <button
                type="submit"
                className="primary"
                disabled={busy}
              >
                {busy
                  ? 'Submitting...'
                  : 'Submit complaint'}
              </button>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================================
          COMPLAINTS
          ===================================================================== */}

      <section className="section">

        <div className="section-head">

          <div>

            <h2>
              My complaints
            </h2>

            <p className="muted">
              Your latest submissions and
              their current status.
            </p>

          </div>

        </div>

        {/* ===================================================================
            EMPTY STATE
            =================================================================== */}

        {complaints.length === 0 ? (

          <div className="empty">

            <FileWarning size={34} />

            <h3>
              No complaints yet
            </h3>

            <p className="muted">
              Your submitted complaints will
              appear here.
            </p>

            <button
              type="button"
              className="secondary"
              onClick={() =>
                setOpen(true)
              }
            >
              Submit your first complaint
            </button>

          </div>

        ) : (

          /* =================================================================
             COMPLAINT LIST
             ================================================================= */

          <div className="complaint-list">

            {complaints.map(
              (complaint) => (

                <ComplaintCard
                  key={complaint.id}
                  c={complaint}

                  expanded={
                    expandedComplaint ===
                    complaint.id
                  }

                  timeline={
                    timeline[
                      complaint.id
                    ]
                  }

                  timelineLoading={
                    timelineLoading ===
                    complaint.id
                  }

                  onToggle={() =>
                    toggleComplaint(
                      complaint.id
                    )
                  }

                  feedback={
                    feedback[
                      complaint.id
                    ]
                  }

                  setFeedback={
                    setFeedback
                  }

                  onFeedbackSubmit={() =>
                    submitFeedback(
                      complaint.id
                    )
                  }

                  feedbackLoading={
                    feedbackLoading ===
                    complaint.id
                  }
                />

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}

/* ============================================================================
   STAT COMPONENT
   ============================================================================ */

function Stat({
  label,
  value,
  icon: Icon
}) {
  return (
    <div className="stat">

      <div className="stat-icon">
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

/* ============================================================================
   COMPLAINT CARD
   ============================================================================ */

function ComplaintCard({
  c,
  expanded,
  timeline,
  timelineLoading,
  onToggle,
  feedback,
  setFeedback,
  onFeedbackSubmit,
  feedbackLoading
}) {
  const [label, Icon] =
    statusMeta[c.status] ||
    statusMeta.PENDING;

  return (
    <article className="complaint">

      {/* ====================================================================
          HEADER
          ==================================================================== */}

      <div className="complaint-top">

        <div>

          <span className="category">
            {getDepartmentLabel(
              c.department
            )}
          </span>

          <h3>
            {c.title}
          </h3>

        </div>

        <span
          className={`status ${(
            c.status || 'PENDING'
          ).toLowerCase()}`}
        >

          <Icon size={15} />

          {label}

        </span>

      </div>

      {/* ====================================================================
          DESCRIPTION
          ==================================================================== */}

      <p>
        {c.description}
      </p>

      {/* ====================================================================
          FOOTER
          ==================================================================== */}

      <div className="complaint-foot">

        <span>
          {c.createdAt
            ? new Date(
                c.createdAt
              ).toLocaleString()
            : ''}
        </span>

        {c.location && (
          <span>
            📍 {c.location}
          </span>
        )}

        {c.imageUrl && (
          <a
            href={c.imageUrl}
            target="_blank"
            rel="noreferrer"
          >
            View proof
          </a>
        )}

        {c.adminNote && (
          <span className="admin-note">
            Admin: {c.adminNote}
          </span>
        )}

      </div>

      {/* ====================================================================
          TIMELINE BUTTON
          ==================================================================== */}

      <button
        type="button"
        className="timeline-toggle"
        onClick={onToggle}
      >

        {expanded ? (

          <>
            <ChevronUp size={17} />
            Hide complaint timeline
          </>

        ) : (

          <>
            <ChevronDown size={17} />
            View complaint timeline
          </>

        )}

      </button>

      {/* ====================================================================
          TIMELINE
          ==================================================================== */}

      {expanded && (

        <div className="complaint-details">

          <h4>
            Complaint Timeline
          </h4>

          {timelineLoading ? (

            <div className="timeline-loading">

              <Loader2
                size={18}
                className="spin"
              />

              Loading timeline...

            </div>

          ) : timeline?.length > 0 ? (

            <div className="timeline">

              {timeline.map((item) => {

                const [
                  timelineLabel,
                  TimelineIcon
                ] =
                  statusMeta[
                    item.newStatus
                  ] ||
                  statusMeta.PENDING;

                return (

                  <div
                    className="timeline-item"
                    key={item.id}
                  >

                    <div className="timeline-icon">

                      <TimelineIcon
                        size={16}
                      />

                    </div>

                    <div className="timeline-content">

                      <strong>
                        {timelineLabel}
                      </strong>

                      <p>
                        {item.note ||
                          `Complaint status changed to ${timelineLabel}.`}
                      </p>

                      <span>
                        {item.createdAt
                          ? new Date(
                              item.createdAt
                            ).toLocaleString()
                          : ''}
                      </span>

                    </div>

                  </div>

                );
              })}

            </div>

          ) : (

            <p className="muted">
              No timeline updates available.
            </p>

          )}

          {/* ================================================================
              FEEDBACK
              ================================================================ */}

          {c.status === 'RESOLVED' && (

            <FeedbackBox
              complaintId={c.id}
              feedback={feedback}
              setFeedback={setFeedback}
              onSubmit={
                onFeedbackSubmit
              }
              loading={
                feedbackLoading
              }
            />

          )}

        </div>

      )}

    </article>
  );
}

/* ============================================================================
   DEPARTMENT LABEL
   ============================================================================ */

function getDepartmentLabel(
  department
) {
  const item = categories.find(
    (category) =>
      category.department ===
      department
  );

  return (
    item?.label ||
    department ||
    'Other'
  );
}

/* ============================================================================
   FEEDBACK BOX
   ============================================================================ */

function FeedbackBox({
  complaintId,
  feedback,
  setFeedback,
  onSubmit,
  loading
}) {
  const current =
    feedback?.[complaintId] || {
      rating: 0,
      comment: '',
      submitted: false
    };

  /* ==========================================================================
     FEEDBACK SUBMITTED
     ========================================================================== */

  if (current.submitted) {
    return (
      <div className="feedback-success">

        <CheckCircle2 size={19} />

        <div>

          <strong>
            Thank you for your feedback!
          </strong>

          <p>
            Your feedback has been
            recorded.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="feedback-box">

      {/* ====================================================================
          HEADER
          ==================================================================== */}

      <div className="feedback-head">

        <div>

          <h4>
            How was the resolution?
          </h4>

          <p className="muted">
            Rate your experience with
            this complaint resolution.
          </p>

        </div>

        <Star size={21} />

      </div>

      {/* ====================================================================
          STAR RATING
          ==================================================================== */}

      <div className="rating">

        {[1, 2, 3, 4, 5].map(
          (star) => (

            <button
              key={star}
              type="button"
              className={
                star <= current.rating
                  ? 'star active'
                  : 'star'
              }
              onClick={() =>
                setFeedback(
                  (prev) => ({
                    ...prev,

                    [complaintId]: {
                      ...(
                        prev[
                          complaintId
                        ] || {}
                      ),

                      rating: star
                    }
                  })
                )
              }
            >

              <Star
                size={23}
                fill={
                  star <= current.rating
                    ? 'currentColor'
                    : 'none'
                }
              />

            </button>

          )
        )}

      </div>

      {/* ====================================================================
          COMMENT
          ==================================================================== */}

      <textarea
        value={
          current.comment || ''
        }
        onChange={(e) =>
          setFeedback(
            (prev) => ({
              ...prev,

              [complaintId]: {
                ...(
                  prev[
                    complaintId
                  ] || {}
                ),

                comment:
                  e.target.value
              }
            })
          )
        }
        placeholder="Tell us about your experience (optional)..."
        maxLength={1000}
      />

      {/* ====================================================================
          SUBMIT FEEDBACK
          ==================================================================== */}

      <button
        type="button"
        className="primary feedback-submit"
        disabled={
          !current.rating ||
          loading
        }
        onClick={onSubmit}
      >

        {loading ? (

          <>
            <Loader2
              size={17}
              className="spin"
            />

            Submitting...
          </>

        ) : (

          <>
            <Send size={17} />
            Submit feedback
          </>

        )}

      </button>

    </div>
  );
}