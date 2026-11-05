import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, HOME_PATHS } from "../context/AuthContext.jsx";
import { Toast, useToast } from "../components/Modal.jsx";

function Icon({ children, size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

function BrandMark() {
  return (
    <span className="brand-mark">
      <Icon size={20}><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4" /><path d="M12 10.5v6M9 13.5h6" /></Icon>
    </span>
  );
}

const FEATURES = [
  { title: "Live availability", text: "Only open times are shown.", icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon> },
  { title: "Calendar views", text: "Month and week at a glance.", icon: <Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon> },
  { title: "Role-based access", text: "Separate views for each role.", icon: <Icon><path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Z" /></Icon> },
];

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.registered) {
      showToast("Account created! Please sign in.");
      navigate("/login", { replace: true, state: null });
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      navigate(HOME_PATHS[user.role]);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="brand"><BrandMark /><span className="brand-name">CareSchedule</span></div>

        <div className="auth-hero-main">
          <h1>Care that fits your calendar.</h1>
          <p className="lead">See real doctor availability, choose a free time and manage every visit from one calm, organized place.</p>
        </div>

        <div className="auth-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="auth-feature">
              {f.icon}
              <div><strong>{f.title}</strong><span>{f.text}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="brand-mobile"><BrandMark /> CareSchedule</div>

          <div>
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-sub">Sign in to manage your appointments.</p>
          </div>

          <div className="auth-fields">
            <label>
              Email
              <div className="input-wrap">
                <span className="input-icon"><Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon></span>
                <input name="email" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={handleChange} required />
              </div>
            </label>

            <label>
              Password
              <div className="input-wrap has-eye">
                <span className="input-icon"><Icon><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon></span>
                <input name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" value={form.password} onChange={handleChange} required />
                <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <Icon><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4" /><path d="M6.5 6.6C3.8 8.3 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.3-1" /></Icon>
                  ) : (
                    <Icon><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Icon>
                  )}
                </button>
              </div>
            </label>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <button type="submit" className="primary btn-lg" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="switch-text">New patient? <Link to="/register"><strong>Create an account</strong></Link></p>
        </form>
      </section>

      <Toast toast={toast} />
    </div>
  );
}

export default Login;