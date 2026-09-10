import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MessageSquareText,
  SearchCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Lock
} from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page">

      {/* =========================================
          HERO SECTION
      ========================================= */}

      <section className="home-hero">

        <div className="home-hero-content">

          <div className="home-badge">
            <ShieldCheck size={16} />
            <span>Campus Complaint Management System</span>
          </div>

          <h1>
            Your Campus.
            <br />
            <span>Your Voice.</span>
          </h1>

          <p className="home-description">
            CampusCare makes it simple for students to
            report campus problems, track complaints and
            get them resolved.
          </p>

          <div className="home-actions">

            <Link
              to="/login"
              className="home-primary-btn"
            >
              Raise a Complaint
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/register"
              className="home-secondary-btn"
            >
              Create Student Account
            </Link>

          </div>

          <div className="home-admin-link">

            <Lock size={15} />

            <span>Are you a campus administrator?</span>

            <Link to="/admin/login">
              Admin Login
            </Link>

          </div>

        </div>


        {/* Hero Visual */}

        <div className="home-hero-card">

          <div className="hero-card-top">

            <div className="hero-icon">
              <GraduationCap size={25} />
            </div>

            <div>
              <strong>CampusCare</strong>
              <p>Student Support</p>
            </div>

          </div>


          <div className="hero-complaint">

            <div className="complaint-icon">
              <MessageSquareText size={20} />
            </div>

            <div className="complaint-content">
              <strong>Complaint Submitted</strong>
              <p>Library maintenance issue</p>
            </div>

            <span className="status-pill">
              Submitted
            </span>

          </div>


          <div className="hero-progress">

            <div className="progress-step active">
              <CheckCircle2 size={18} />
              <span>Submitted</span>
            </div>

            <div className="progress-line"></div>

            <div className="progress-step active">
              <SearchCheck size={18} />
              <span>Under Review</span>
            </div>

            <div className="progress-line"></div>

            <div className="progress-step">
              <CheckCircle2 size={18} />
              <span>Resolved</span>
            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          FEATURES
      ========================================= */}

      <section className="home-features">

        <div className="section-heading">

          <p className="eyebrow">
            HOW IT WORKS
          </p>

          <h2>
            Report. Track. Resolve.
          </h2>

          <p>
            Everything you need to make your campus
            better, in one simple place.
          </p>

        </div>


        <div className="feature-grid">

          {/* Feature 1 */}

          <div className="feature-card">

            <div className="feature-icon">
              <MessageSquareText size={23} />
            </div>

            <h3>
              Submit a Complaint
            </h3>

            <p>
              Report problems related to classrooms,
              hostels, facilities, cleanliness and
              other campus services.
            </p>

          </div>


          {/* Feature 2 */}

          <div className="feature-card">

            <div className="feature-icon">
              <SearchCheck size={23} />
            </div>

            <h3>
              Track Your Complaint
            </h3>

            <p>
              Check the current status of your complaint
              and stay updated as administrators review it.
            </p>

          </div>


          {/* Feature 3 */}

          <div className="feature-card">

            <div className="feature-icon">
              <CheckCircle2 size={23} />
            </div>

            <h3>
              Get Resolution
            </h3>

            <p>
              Administrators can review complaints,
              update their status and provide resolution
              notes.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          STUDENT CTA
      ========================================= */}

      <section className="home-student-cta">

        <div>

          <p className="eyebrow">
            FOR STUDENTS
          </p>

          <h2>
            Have a campus issue?
          </h2>

          <p>
            Don't let a problem go unheard.
            Submit your complaint through CampusCare.
          </p>

        </div>

        <Link
          to="/login"
          className="home-primary-btn"
        >
          Get Started
          <ArrowRight size={18} />
        </Link>

      </section>


      {/* =========================================
          ADMIN CTA
      ========================================= */}

      <section className="home-admin-cta">

        <div className="admin-cta-icon">
          <ShieldCheck size={25} />
        </div>

        <div className="admin-cta-content">

          <h3>
            Campus Administrator?
          </h3>

          <p>
            Review student complaints and manage
            campus grievance resolution from the
            administrator dashboard.
          </p>

        </div>

        <Link to="/admin/login">
          Admin Login
          <ArrowRight size={17} />
        </Link>

      </section>


      {/* =========================================
          FOOTER
      ========================================= */}

      <footer className="home-footer">

        <div className="footer-brand">

          <div className="footer-logo">
            <ShieldCheck size={18} />
          </div>

          <strong>
            CampusCare
          </strong>

        </div>

        <p>
          Making campus grievance management simple.
        </p>

        <span>
          © {new Date().getFullYear()} CampusCare
        </span>

      </footer>

    </div>
  );
}