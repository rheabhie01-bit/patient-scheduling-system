import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = { name: "", email: "", password: "", age: "", phone: "", address: "" };
const PHONE_PATTERN = /^09\d{9}$/;
const PHONE_MESSAGE = "Phone number must be 11 digits and start with 09.";

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
  { title: "Pick any free slot", text: "See open times before you book.", icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon> },
  { title: "All visits in one calendar", text: "Upcoming and past, together.", icon: <Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon> },
  { title: "Cancel anytime", text: "The slot is freed right away.", icon: <Icon><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></Icon> },
];

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name } = event.target;
    let { value } = event.target;

    if (name === "phone") value = value.replace(/\D/g, "").slice(0, 11);
    setForm({ ...form, [name]: value });
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!PHONE_PATTERN.test(form.phone)) {
      setError(PHONE_MESSAGE);
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      navigate("/login", { state: { registered: true } });
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
          <h1>Your health, on your schedule.</h1>
          <p className="lead">Create an account in under a minute, then book the doctor and time that work best for you.</p>
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
        <form className="auth-card is-register" onSubmit={handleSubmit}>
          <div className="brand-mobile"><BrandMark /> CareSchedule</div>

          <div>
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-sub">It only takes a minute.</p>
          </div>

          <div className="auth-fields">
            <label>
              Full name
              <div className="input-wrap">
                <span className="input-icon"><Icon><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 4-6 8-6s8 2 8 6" /></Icon></span>
                <input name="name" placeholder="Juan Dela Cruz" autoComplete="name" value={form.name} onChange={handleChange} required />
              </div>
            </label>

            <label>
              Email
              <div className="input-wrap">
                <span className="input-icon"><Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></Icon></span>
                <input name="email" type="email" placeholder="example@gmail.com" autoComplete="email" value={form.email} onChange={handleChange} required />
              </div>
            </label>

            <label>
              Password
              <div className="input-wrap has-eye">
                <span className="input-icon"><Icon><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Icon></span>
                <input name="password" type={showPassword ? "text" : "password"} minLength="6" placeholder="At least 6 characters" autoComplete="new-password" value={form.password} onChange={handleChange} required />
                <button type="button" className="eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? (
                    <Icon><path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 4" /><path d="M6.5 6.6C3.8 8.3 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.3-1" /></Icon>
                  ) : (
                    <Icon><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></Icon>
                  )}
                </button>
              </div>
            </label>

            <div className="auth-row">
              <label>
                Age
                <div className="input-wrap">
                  <span className="input-icon"><Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon></span>
                  <input name="age" type="number" min="0" max="120" placeholder="25" value={form.age} onChange={handleChange} required />
                </div>
              </label>

              <label>
                Phone
                <div className="input-wrap">
                  <span className="input-icon"><Icon><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></Icon></span>
                  <input name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="09123456789" maxLength={11} pattern="09[0-9]{9}" title={PHONE_MESSAGE} value={form.phone} onChange={handleChange} required />
                </div>
              </label>
            </div>

            <label>
              <span className="label-text">Address <span className="optional">(optional)</span></span>
              <div className="input-wrap">
                <span className="input-icon"><Icon><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Icon></span>
                <input name="address" placeholder="Street, barangay, city" autoComplete="street-address" value={form.address} onChange={handleChange} />
              </div>
            </label>
          </div>

          {error && <p className="error" role="alert">{error}</p>}

          <button type="submit" className="primary btn-lg" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="switch-text">Already registered? <Link to="/login"><strong>Sign in</strong></Link></p>
        </form>
      </section>
    </div>
  );
}

export default Register;