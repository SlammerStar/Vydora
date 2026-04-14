import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!name || !email || !password) return alert("Please fill all fields");

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5001/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message || "Signup failed");

      setToastMessage("Account created successfully! Redirecting...");
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'relative' }}>
      
      {toastMessage && (
        <div style={{ position: 'absolute', top: '40px', left: '50%', transform: 'translateX(-50%)', background: '#4caf50', color: 'white', padding: '16px 24px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: '500', animation: 'fadeInDown 0.3s' }}>
            {toastMessage}
        </div>
      )}

      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
           <h2 style={{ margin: 0, fontSize: "28px", fontWeight: "600" }}>Create an account</h2>
           <p style={{ marginTop: "8px", color: "var(--text-secondary)", fontSize: "15px" }}>Join Vydora today</p>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="Full Name"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <input
            type="email"
            placeholder="Email address"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={{ position: "relative", marginBottom: "24px" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ paddingRight: "40px" }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </span>
        </div>

        <button onClick={handleSignup} disabled={loading} className="btn-primary">
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p style={{ marginTop: "32px", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <span onClick={() => navigate('/login')} style={{ color: "#1a73e8", cursor: "pointer", fontWeight: "500" }}>
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}

export default SignupPage;