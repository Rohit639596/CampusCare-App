import { Link } from 'react-router-dom';

import {
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  MessageSquareText,
  Bot,
  SearchCheck,
  CheckCircle2,
  Users,
  UserRound,
  LayoutDashboard,
  Brain,
  AlertTriangle,
  Zap,
  CopyCheck,
  FileText,
  Lightbulb,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="home-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="home-navbar">

        <Link to="/" className="home-brand">
          <div className="home-brand-icon">
            <ShieldCheck size={22} />
          </div>

          <span>CampusCare</span>
        </Link>

        <nav className="home-nav">

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#ai">
            CampusCare AI
          </a>

          <a href="#users">
            For Students
          </a>

        </nav>

        <div className="home-nav-actions">

  <Link
    to="/login"
    className="home-login"
  >
    Student Login
  </Link>

  <Link
    to="/warden/login"
    className="home-login"
  >
    Warden Login
  </Link>

  <Link
    to="/register"
    className="home-get-started"
  >
    Get Started
  </Link>

</div>

      </header>


      {/* =========================
          HERO
      ========================= */}

      <section className="home-hero">

        <div className="home-hero-overlay"></div>

        <div className="home-hero-content">

          <div className="home-hero-badge">
            <Sparkles size={15} />
            Smart Campus Grievance System
          </div>

          <h1>
            Your Campus.
            <br />
            <span>Your Voice.</span>
          </h1>

          <p>
            A smarter way to report, track and resolve
            student grievances with simple and transparent
            complaint management.
          </p>

          <Link
            to="/login"
            className="home-hero-button"
          >
            Raise a Complaint
            <ArrowRight size={19} />
          </Link>

          <div className="home-hero-note">
            <Lock size={14} />
            <span>
              Your complaint can be tracked from submission
              to resolution.
            </span>
          </div>

        </div>


        {/* Hero dashboard visual */}

        <div className="home-hero-dashboard">

          <div className="hero-dashboard-top">

            <div className="hero-dashboard-brand">
              <div>
                <GraduationCap size={20} />
              </div>

              <section>
                <strong>CampusCare</strong>
                <small>Student Support</small>
              </section>
            </div>

            <span className="hero-online">
              ● Active
            </span>

          </div>


          <div className="hero-dashboard-body">

            <div className="hero-mini-sidebar">

              <span></span>
              <span></span>
              <span></span>
              <span></span>

            </div>


            <div className="hero-mini-content">

              <div className="hero-mini-search">
                Search complaints...
              </div>

              <div className="hero-mini-row">

                <span>
                  Complaint
                </span>

                <span>
                  Category
                </span>

                <span>
                  Status
                </span>

              </div>


              <div className="hero-mini-row">
                <span>Campus Issue</span>
                <span>Facilities</span>
                <b>Pending</b>
              </div>

              <div className="hero-mini-row">
                <span>Service Request</span>
                <span>Academics</span>
                <strong>Review</strong>
              </div>

              <div className="hero-mini-row">
                <span>Student Grievance</span>
                <span>Infrastructure</span>
                <em>Resolved</em>
              </div>


              <div className="hero-ai-box">

                <Bot size={19} />

                <div>
                  <strong>CampusCare AI</strong>
                  <small>
                    Intelligent complaint analysis
                  </small>
                </div>

                <span>AI</span>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* =========================
          INTRO
      ========================= */}

      <section className="home-intro">

        <p className="home-eyebrow">
          CAMPUSCARE
        </p>

        <h2>
          Making campus grievance management
          <br />
          simple and transparent.
        </h2>

        <p>
          CampusCare gives students a convenient platform
          to raise complaints and helps administrators
          manage and resolve them efficiently.
        </p>

      </section>



      {/* =========================
          HOW IT WORKS
      ========================= */}

      <section
        id="how-it-works"
        className="home-how-section"
      >

        <div className="home-section-heading">

          <p className="home-eyebrow">
            HOW CAMPUSCARE WORKS
          </p>

          <h2>
            From complaint to resolution.
          </h2>

          <p>
            A simple process designed to keep every
            grievance clear and trackable.
          </p>

        </div>


        <div className="home-process">

          <div className="home-process-item">

            <span>01</span>

            <div className="home-process-icon">
              <MessageSquareText size={23} />
            </div>

            <h3>
              Submit
            </h3>

            <p>
              Student submits a campus complaint.
            </p>

          </div>


          <ArrowRight className="process-arrow" size={20} />


          <div className="home-process-item">

            <span>02</span>

            <div className="home-process-icon">
              <Bot size={23} />
            </div>

            <h3>
              AI Analysis
            </h3>

            <p>
              AI analyzes the complaint and its context.
            </p>

          </div>


          <ArrowRight className="process-arrow" size={20} />


          <div className="home-process-item">

            <span>03</span>

            <div className="home-process-icon">
              <SearchCheck size={23} />
            </div>

            <h3>
              Review
            </h3>

            <p>
              Administrator reviews the complaint.
            </p>

          </div>


          <ArrowRight className="process-arrow" size={20} />


          <div className="home-process-item">

            <span>04</span>

            <div className="home-process-icon">
              <LayoutDashboard size={23} />
            </div>

            <h3>
              Track
            </h3>

            <p>
              Student tracks complaint progress.
            </p>

          </div>


          <ArrowRight className="process-arrow" size={20} />


          <div className="home-process-item">

            <span>05</span>

            <div className="home-process-icon">
              <CheckCircle2 size={23} />
            </div>

            <h3>
              Resolution
            </h3>

            <p>
              Administrator completes the resolution.
            </p>

          </div>

        </div>

      </section>



      {/* =========================
          CAMPUSCARE AI
      ========================= */}

      <section
        id="ai"
        className="home-ai"
      >

        <div className="home-ai-heading">

          <div className="home-ai-title">

            <div className="home-ai-logo">
              <Bot size={23} />
            </div>

            <span>
              CampusCare AI
            </span>

          </div>

          <p className="home-eyebrow">
            INTELLIGENT COMPLAINT ANALYSIS
          </p>

          <h2>
            Smarter Complaint Management
            <br />
            with <span>Artificial Intelligence</span>
          </h2>

          <p>
            CampusCare uses AI to analyze student complaints,
            understand their context and provide useful
            insights to administrators for faster and more
            effective grievance management.
          </p>

        </div>


        <div className="home-ai-grid">

          <div className="home-ai-item">

            <Brain size={21} />

            <div>
              <h3>AI Category Detection</h3>
              <p>
                Identifies the relevant category of a complaint.
              </p>
            </div>

          </div>


          <div className="home-ai-item">

            <AlertTriangle size={21} />

            <div>
              <h3>AI Priority Detection</h3>
              <p>
                Suggests Low, Medium, High or Critical priority.
              </p>
            </div>

          </div>


          <div className="home-ai-item">

            <MessageSquareText size={21} />

            <div>
              <h3>Sentiment Analysis</h3>
              <p>
                Identifies the emotional tone of a complaint.
              </p>
            </div>

          </div>


          <div className="home-ai-item">

            <Zap size={21} />

            <div>
              <h3>Urgency Detection</h3>
              <p>
                Identifies complaints that may need immediate attention.
              </p>
            </div>

          </div>


          <div className="home-ai-item">

            <CopyCheck size={21} />

            <div>
              <h3>Duplicate Detection</h3>
              <p>
                Finds similar complaints using semantic similarity.
              </p>
            </div>

          </div>


          <div className="home-ai-item">

            <FileText size={21} />

            <div>
              <h3>AI Summary</h3>
              <p>
                Creates a concise summary of the complaint.
              </p>
            </div>

          </div>


          <div className="home-ai-item">

            <Lightbulb size={21} />

            <div>
              <h3>AI Recommendation</h3>
              <p>
                Suggests possible next steps for handling complaints.
              </p>
            </div>

          </div>


          <div className="home-ai-item">

            <ShieldCheck size={21} />

            <div>
              <h3>Decision Support</h3>
              <p>
                AI assists administrators while the final decision
                remains with them.
              </p>
            </div>

          </div>

        </div>

      </section>



      {/* =========================
          STUDENTS + ADMIN
      ========================= */}

      <section
        id="users"
        className="home-users"
      >

        <div className="home-user-box student-box">

          <div className="home-user-icon">
            <UserRound size={24} />
          </div>

          <p className="home-eyebrow">
            FOR STUDENTS
          </p>

          <h2>
            Have a campus issue?
          </h2>

          <p>
            Don't let a problem go unheard. Submit your
            complaint, track its progress and stay informed
            throughout the resolution process.
          </p>

          <Link
            to="/login"
            className="home-text-button"
          >
            Get Started
            <ArrowRight size={17} />
          </Link>

        </div>


        <div className="home-user-box admin-box">

          <div className="home-user-icon">
            <Users size={24} />
          </div>

          <p className="home-eyebrow">
            FOR ADMINISTRATORS
          </p>

          <h2>
            Manage campus grievances.
          </h2>

          <p>
            Review student complaints, use AI-powered
            insights and manage grievance resolution
            from the administrator dashboard.
          </p>

          <Link
            to="/admin/login"
            className="home-text-button"
          >
            Admin Login
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>



      {/* =========================
          FINAL CTA
      ========================= */}

      <section className="home-final">

        <div className="home-final-icon">
          <GraduationCap size={25} />
        </div>

        <h2>
          Make your campus better,
          <br />
          one complaint at a time.
        </h2>

        <p>
          Start using CampusCare today.
        </p>

        <Link
          to="/register"
          className="home-final-button"
        >
          Get Started
          <ArrowRight size={18} />
        </Link>

      </section>



      {/* =========================
          FOOTER
      ========================= */}

      <footer className="home-footer">

        <div className="home-footer-brand">

          <div className="home-brand-icon">
            <ShieldCheck size={19} />
          </div>

          <strong>
            CampusCare
          </strong>

        </div>

        <p>
          Making campus grievance management
          simple and intelligent.
        </p>

        <span>
          © {new Date().getFullYear()} CampusCare
        </span>

      </footer>

    </div>
  );
}